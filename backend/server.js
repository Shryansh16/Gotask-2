// backend/server.js
// Production-Grade, Zero-Dependency REST API & Agent Integration Hub for GOTask

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// --- DATABASE LAYER (Atomic & Crash-Resilient) ---
function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        profile: {
          name: 'Shryansh Shree',
          email: 'shryansh.gangwal@example.com',
          role: 'Productivity Architect',
          dailyGoal: 5,
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          joinedDate: 'October 2026',
        },
        categories: [
          {id: 'cat_1', name: 'Work', color: '#4F46E5', icon: 'briefcase'},
          {id: 'cat_2', name: 'Personal', color: '#06B6D4', icon: 'user'},
          {
            id: 'cat_3',
            name: 'Shopping',
            color: '#EC4899',
            icon: 'shopping-cart',
          },
          {id: 'cat_4', name: 'Health', color: '#10B981', icon: 'heartbeat'},
          {id: 'cat_5', name: 'Study', color: '#8B5CF6', icon: 'book'},
        ],
        tasks: [],
        auditLogs: [],
      };
      fs.mkdirSync(path.dirname(DB_FILE), {recursive: true});
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed.auditLogs)) {
      parsed.auditLogs = [];
    }
    if (!Array.isArray(parsed.tasks)) {
      parsed.tasks = [];
    }
    if (!Array.isArray(parsed.categories)) {
      parsed.categories = [];
    }
    if (!Array.isArray(parsed.notes)) {
      parsed.notes = [];
    }
    if (!Array.isArray(parsed.goals)) {
      parsed.goals = [];
    }
    if (!Array.isArray(parsed.habits)) {
      parsed.habits = [];
    }
    if (!Array.isArray(parsed.focusSessions)) {
      parsed.focusSessions = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB:', err);
    return {profile: {}, categories: [], tasks: [], auditLogs: []};
  }
}

// Atomic write to prevent file corruption
function saveDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), {recursive: true});
    const tmpFile = `${DB_FILE}.${Date.now()}.${Math.random()
      .toString(36)
      .slice(2, 7)}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing DB atomically:', err);
    return false;
  }
}

// Record an event in the audit trail
function recordAudit(
  action,
  entityType,
  entityId,
  details = {},
  actor = 'human',
) {
  try {
    const db = getDb();
    if (!Array.isArray(db.auditLogs)) {
      db.auditLogs = [];
    }
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      actor,
      details,
    };
    db.auditLogs.unshift(entry);
    if (db.auditLogs.length > 500) {
      db.auditLogs.pop();
    } // Cap history
    saveDb(db);
    return entry;
  } catch (e) {
    console.warn('Could not record audit log:', e);
  }
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body || !body.trim()) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format in request body'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response with CORS & Security Headers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Agent-ID, X-Agent-Name',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  res.end(JSON.stringify(data));
}

// Natural Language Task Parser
function parseNaturalLanguageTask(text = '') {
  let title = text.trim();
  let priority = 'medium';
  let category = 'Personal';
  let dueDate = 'Today';
  const tags = [];

  // 1. Extract Priority tags like !high, !urgent, !medium, !low
  const priorityMatch = title.match(/!(high|urgent|medium|low)/i);
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase();
    priority = p === 'urgent' ? 'high' : p;
    title = title.replace(priorityMatch[0], '').trim();
  }

  // 2. Extract Hashtags like #Work, #Health, #Shopping
  const hashtagMatches = title.match(/#(\w+)/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(tag => {
      const cleanTag = tag.slice(1);
      tags.push(cleanTag);
      // Map common tags to categories
      if (
        ['work', 'job', 'project', 'client'].includes(cleanTag.toLowerCase())
      ) {
        category = 'Work';
      } else if (
        ['buy', 'shopping', 'groceries', 'store'].includes(
          cleanTag.toLowerCase(),
        )
      ) {
        category = 'Shopping';
      } else if (
        ['health', 'gym', 'workout', 'meds'].includes(cleanTag.toLowerCase())
      ) {
        category = 'Health';
      } else if (
        ['study', 'learn', 'read', 'book'].includes(cleanTag.toLowerCase())
      ) {
        category = 'Study';
      }
      title = title.replace(tag, '').trim();
    });
  }

  // 3. Extract Due Date keywords
  if (/\b(tomorrow)\b/i.test(title)) {
    dueDate = 'Tomorrow';
    title = title.replace(/\b(tomorrow)\b/gi, '').trim();
  } else if (/\b(today)\b/i.test(title)) {
    dueDate = 'Today';
    title = title.replace(/\b(today)\b/gi, '').trim();
  } else if (/\b(this weekend|weekend)\b/i.test(title)) {
    dueDate = 'This Weekend';
    title = title.replace(/\b(this weekend|weekend)\b/gi, '').trim();
  } else if (/\b(next week)\b/i.test(title)) {
    dueDate = 'Next Week';
    title = title.replace(/\b(next week)\b/gi, '').trim();
  }

  // Clean remaining whitespace
  title = title.replace(/\s+/g, ' ').trim();

  return {
    title: title || 'Untitled Task',
    priority,
    category,
    dueDate,
    tags,
  };
}

// --- HTTP SERVER ---
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Agent-ID, X-Agent-Name',
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  const actor =
    req.headers['x-agent-name'] || req.headers['x-agent-id'] || 'human';

  // --- HEALTH & STATUS ---
  if (
    pathname === '/' ||
    pathname === '/health' ||
    pathname === '/api/health'
  ) {
    const db = getDb();
    return sendJson(res, 200, {
      status: 'ok',
      service: 'GOTask API Server',
      version: '2.5.0',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      stats: {
        totalTasks: (db.tasks || []).length,
        categories: (db.categories || []).length,
        auditLogsCount: (db.auditLogs || []).length,
      },
    });
  }

  // --- NATURAL LANGUAGE TASK PARSER ---
  // POST /api/tasks/parse
  if (pathname === '/api/tasks/parse' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.text || !body.text.trim()) {
        return sendJson(res, 400, {
          success: false,
          message: 'Field "text" is required',
        });
      }
      const parsed = parseNaturalLanguageTask(body.text);
      return sendJson(res, 200, {success: true, parsed});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  // --- TASKS API ---
  // GET /api/tasks
  if (pathname === '/api/tasks' && req.method === 'GET') {
    const db = getDb();
    let tasks = db.tasks || [];

    // Filter by category
    if (query.category && query.category !== 'All') {
      tasks = tasks.filter(
        t =>
          t.category &&
          t.category.toLowerCase() === query.category.toLowerCase(),
      );
    }

    // Filter by status (completed / active)
    if (query.status) {
      if (query.status === 'completed') {
        tasks = tasks.filter(t => t.completed);
      }
      if (query.status === 'active' || query.status === 'pending') {
        tasks = tasks.filter(t => !t.completed);
      }
    }

    // Filter by priority
    if (query.priority && query.priority !== 'all') {
      tasks = tasks.filter(t => t.priority === query.priority);
    }

    // Filter by tag
    if (query.tag) {
      const targetTag = query.tag.toLowerCase();
      tasks = tasks.filter(
        t =>
          Array.isArray(t.tags) &&
          t.tags.some(tag => tag.toLowerCase() === targetTag),
      );
    }

    // Filter by agent assignment
    if (query.agentAssigned === 'true') {
      tasks = tasks.filter(t => Boolean(t.agentMetadata));
    }

    // Search query
    if (query.search) {
      const q = query.search.toLowerCase();
      tasks = tasks.filter(
        t =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (Array.isArray(t.tags) &&
            t.tags.some(tg => tg.toLowerCase().includes(q))),
      );
    }

    // Sort order
    const sortBy = query.sortBy || 'createdAt'; // 'createdAt' | 'dueDate' | 'priority'
    const sortOrder = query.order === 'asc' ? 1 : -1;

    tasks.sort((a, b) => {
      // Always keep pinned tasks first unless disabled
      if (query.pinnedFirst !== 'false') {
        if (a.isPinned && !b.isPinned) {
          return -1;
        }
        if (!a.isPinned && b.isPinned) {
          return 1;
        }
      }
      if (sortBy === 'priority') {
        const pWeight = {high: 3, medium: 2, low: 1};
        return (
          (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0) * sortOrder
        );
      }
      return ((a[sortBy] || 0) > (b[sortBy] || 0) ? 1 : -1) * sortOrder;
    });

    return sendJson(res, 200, {success: true, count: tasks.length, tasks});
  }

  // POST /api/tasks
  if (pathname === '/api/tasks' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.title || !body.title.trim()) {
        return sendJson(res, 400, {
          success: false,
          message: 'Title is required',
        });
      }

      const db = getDb();
      const newTask = {
        id:
          body.id ||
          `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: body.title.trim(),
        description: body.description || '',
        category: body.category || 'Personal',
        priority: body.priority || 'medium',
        completed: Boolean(body.completed),
        dueDate: body.dueDate || 'Today',
        isPinned: Boolean(body.isPinned),
        tags: Array.isArray(body.tags) ? body.tags : [],
        subtasks: Array.isArray(body.subtasks) ? body.subtasks : [],
        agentMetadata: body.agentMetadata || null,
        createdAt: body.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      db.tasks = [newTask, ...(db.tasks || [])];
      saveDb(db);
      recordAudit(
        'create_task',
        'task',
        newTask.id,
        {title: newTask.title},
        actor,
      );

      return sendJson(res, 201, {success: true, task: newTask});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  // Task URL Matcher for /api/tasks/:id
  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && req.method === 'PUT') {
    try {
      const taskId = taskMatch[1];
      const updates = await parseBody(req);
      const db = getDb();
      const index = (db.tasks || []).findIndex(
        t => String(t.id) === String(taskId),
      );

      if (index === -1) {
        return sendJson(res, 404, {success: false, message: 'Task not found'});
      }

      db.tasks[index] = {
        ...db.tasks[index],
        ...updates,
        id: db.tasks[index].id, // Prevent ID overwrite
        updatedAt: Date.now(),
      };

      saveDb(db);
      recordAudit('update_task', 'task', taskId, updates, actor);

      return sendJson(res, 200, {success: true, task: db.tasks[index]});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  // DELETE /api/tasks/:id
  if (taskMatch && req.method === 'DELETE') {
    const taskId = taskMatch[1];
    const db = getDb();
    const initialCount = (db.tasks || []).length;
    db.tasks = (db.tasks || []).filter(t => String(t.id) !== String(taskId));

    if (db.tasks.length === initialCount) {
      return sendJson(res, 404, {success: false, message: 'Task not found'});
    }

    saveDb(db);
    recordAudit('delete_task', 'task', taskId, {}, actor);

    return sendJson(res, 200, {
      success: true,
      message: 'Task deleted successfully',
    });
  }

  // --- AGENT INTEGRATION HUB ---
  // POST /api/agent/dispatch
  if (pathname === '/api/agent/dispatch' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const {
        agentId = 'agent_generic',
        agentName = 'AI Productivity Agent',
        action = 'create', // 'create' | 'update' | 'resolve' | 'generate_subtasks'
        task = {},
        taskId = null,
      } = body;

      const db = getDb();

      if (action === 'create') {
        if (!task.title) {
          return sendJson(res, 400, {
            success: false,
            message: 'Agent task requires a title',
          });
        }
        const newTask = {
          id: task.id || `agent_task_${Date.now()}`,
          title: task.title,
          description: task.description || '',
          category: task.category || 'Work',
          priority: task.priority || 'medium',
          completed: false,
          dueDate: task.dueDate || 'Today',
          isPinned: Boolean(task.isPinned),
          tags: Array.from(new Set([...(task.tags || []), 'agent-created'])),
          subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
          agentMetadata: {
            dispatchedBy: agentName,
            agentId,
            dispatchedAt: new Date().toISOString(),
            status: 'agent_active',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        db.tasks = [newTask, ...(db.tasks || [])];
        saveDb(db);
        recordAudit(
          'agent_dispatch_create',
          'task',
          newTask.id,
          {agentName, title: newTask.title},
          agentName,
        );
        return sendJson(res, 201, {success: true, task: newTask});
      }

      if (action === 'generate_subtasks' && taskId) {
        const index = (db.tasks || []).findIndex(
          t => String(t.id) === String(taskId),
        );
        if (index === -1) {
          return sendJson(res, 404, {
            success: false,
            message: 'Task not found',
          });
        }

        const currentSubtasks = db.tasks[index].subtasks || [];
        const newSubtasks = (task.subtasks || []).map((st, i) => ({
          id: `st_agent_${Date.now()}_${i}`,
          title: typeof st === 'string' ? st : st.title,
          completed: false,
        }));

        db.tasks[index].subtasks = [...currentSubtasks, ...newSubtasks];
        db.tasks[index].updatedAt = Date.now();
        saveDb(db);
        recordAudit(
          'agent_generate_subtasks',
          'task',
          taskId,
          {subtasksCount: newSubtasks.length},
          agentName,
        );

        return sendJson(res, 200, {success: true, task: db.tasks[index]});
      }

      if (action === 'resolve' && taskId) {
        const index = (db.tasks || []).findIndex(
          t => String(t.id) === String(taskId),
        );
        if (index === -1) {
          return sendJson(res, 404, {
            success: false,
            message: 'Task not found',
          });
        }

        db.tasks[index].completed = true;
        db.tasks[index].updatedAt = Date.now();
        if (db.tasks[index].agentMetadata) {
          db.tasks[index].agentMetadata.status = 'agent_completed';
          db.tasks[index].agentMetadata.completedAt = new Date().toISOString();
        }
        saveDb(db);
        recordAudit('agent_resolve_task', 'task', taskId, {}, agentName);

        return sendJson(res, 200, {success: true, task: db.tasks[index]});
      }

      return sendJson(res, 400, {
        success: false,
        message: `Unsupported agent action "${action}"`,
      });
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  // GET /api/agent/tasks (Tasks view specifically tailored for agent scraping & execution)
  if (pathname === '/api/agent/tasks' && req.method === 'GET') {
    const db = getDb();
    const tasks = db.tasks || [];
    const pending = tasks.filter(t => !t.completed);
    const agentTasks = tasks.filter(t => t.agentMetadata);

    return sendJson(res, 200, {
      success: true,
      summary: {
        totalPending: pending.length,
        totalAgentManaged: agentTasks.length,
      },
      tasks: pending,
    });
  }

  // POST /api/agent/batch (Bulk mutations)
  if (pathname === '/api/agent/batch' && req.method === 'POST') {
    try {
      const {operations = []} = await parseBody(req);
      const db = getDb();
      let affected = 0;

      operations.forEach(op => {
        if (op.type === 'create' && op.task) {
          db.tasks.unshift({
            id:
              op.task.id ||
              `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            ...op.task,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          affected += 1;
        } else if (op.type === 'update' && op.taskId && op.updates) {
          const idx = db.tasks.findIndex(
            t => String(t.id) === String(op.taskId),
          );
          if (idx !== -1) {
            db.tasks[idx] = {
              ...db.tasks[idx],
              ...op.updates,
              updatedAt: Date.now(),
            };
            affected += 1;
          }
        } else if (op.type === 'delete' && op.taskId) {
          db.tasks = db.tasks.filter(t => String(t.id) !== String(op.taskId));
          affected += 1;
        }
      });

      saveDb(db);
      recordAudit(
        'agent_batch_operation',
        'system',
        'batch',
        {operationsCount: operations.length, affected},
        actor,
      );

      return sendJson(res, 200, {
        success: true,
        affected,
        totalTasks: db.tasks.length,
      });
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  // --- STATS & PRODUCTIVITY API ---
  // GET /api/stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    const db = getDb();
    const tasks = db.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(
      t => t.priority === 'high' && !t.completed,
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const byCategory = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      if (!byCategory[cat]) {
        byCategory[cat] = {total: 0, completed: 0};
      }
      byCategory[cat].total += 1;
      if (t.completed) {
        byCategory[cat].completed += 1;
      }
    });

    return sendJson(res, 200, {
      success: true,
      stats: {
        total,
        completed,
        pending,
        highPriority,
        completionRate,
        byCategory,
      },
    });
  }

  // --- AUDIT TRAIL API ---
  // GET /api/audit-logs
  if (pathname === '/api/audit-logs' && req.method === 'GET') {
    const db = getDb();
    const limit = parseInt(query.limit, 10) || 50;
    const logs = (db.auditLogs || []).slice(0, limit);
    return sendJson(res, 200, {
      success: true,
      count: logs.length,
      auditLogs: logs,
    });
  }

  // --- BIDIRECTIONAL OFFLINE-FIRST SYNC ---
  // POST /api/sync
  if (pathname === '/api/sync' && req.method === 'POST') {
    try {
      const {localTasks = [], localProfile = {}} = await parseBody(req);
      const db = getDb();
      const serverTasks = db.tasks || [];

      // Merge tasks based on ID and timestamp
      const taskMap = new Map();
      serverTasks.forEach(t => taskMap.set(String(t.id), t));

      localTasks.forEach(lt => {
        const id = String(lt.id);
        const st = taskMap.get(id);
        if (!st) {
          taskMap.set(id, lt);
        } else {
          const localTime = lt.updatedAt || lt.createdAt || 0;
          const serverTime = st.updatedAt || st.createdAt || 0;
          if (localTime >= serverTime) {
            taskMap.set(id, lt);
          }
        }
      });

      const mergedTasks = Array.from(taskMap.values());
      db.tasks = mergedTasks;

      if (localProfile && localProfile.name) {
        db.profile = {...(db.profile || {}), ...localProfile};
      }

      saveDb(db);
      recordAudit(
        'client_sync',
        'system',
        'sync',
        {mergedCount: mergedTasks.length},
        actor,
      );

      return sendJson(res, 200, {
        success: true,
        syncedAt: Date.now(),
        tasks: mergedTasks,
        profile: db.profile,
      });
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  // --- PROFILE API ---
  // GET /api/profile
  if (pathname === '/api/profile' && req.method === 'GET') {
    const db = getDb();
    return sendJson(res, 200, {success: true, profile: db.profile || {}});
  }

  // PUT /api/profile
  if (pathname === '/api/profile' && req.method === 'PUT') {
    try {
      const updates = await parseBody(req);
      const db = getDb();
      db.profile = {...(db.profile || {}), ...updates};
      saveDb(db);
      recordAudit('update_profile', 'profile', 'user_profile', updates, actor);
      return sendJson(res, 200, {success: true, profile: db.profile});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }


  // --- NOTES API (Phase 3) ---
  if (pathname === '/api/notes' && req.method === 'GET') {
    const db = getDb();
    let notes = db.notes || [];
    if (query.category && query.category !== 'All') {
      notes = notes.filter(n => n.category && n.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      notes = notes.filter(n =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q)) ||
        (Array.isArray(n.tags) && n.tags.some(tg => tg.toLowerCase().includes(q)))
      );
    }
    return sendJson(res, 200, {success: true, count: notes.length, notes});
  }

  if (pathname === '/api/notes' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.title || !body.title.trim()) {
        return sendJson(res, 400, {success: false, message: 'Title is required'});
      }
      const db = getDb();
      const newNote = {
        id: body.id || ('note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        title: body.title.trim(),
        content: body.content || '',
        category: body.category || 'Personal',
        tags: Array.isArray(body.tags) ? body.tags : [],
        isPinned: Boolean(body.isPinned),
        isArchived: Boolean(body.isArchived),
        linkedTaskId: body.linkedTaskId || null,
        createdAt: body.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      db.notes = [newNote, ...(db.notes || [])];
      saveDb(db);
      recordAudit('create_note', 'note', newNote.id, {title: newNote.title}, actor);
      return sendJson(res, 201, {success: true, note: newNote});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  const noteMatch = pathname.match(/^\/api\/notes\/([^/]+)$/);
  if (noteMatch && req.method === 'PUT') {
    try {
      const noteId = noteMatch[1];
      const updates = await parseBody(req);
      const db = getDb();
      const index = (db.notes || []).findIndex(n => String(n.id) === String(noteId));
      if (index === -1) {
        return sendJson(res, 404, {success: false, message: 'Note not found'});
      }
      db.notes[index] = {
        ...db.notes[index],
        ...updates,
        id: db.notes[index].id,
        updatedAt: Date.now(),
      };
      saveDb(db);
      recordAudit('update_note', 'note', noteId, updates, actor);
      return sendJson(res, 200, {success: true, note: db.notes[index]});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  if (noteMatch && req.method === 'DELETE') {
    const noteId = noteMatch[1];
    const db = getDb();
    const initialCount = (db.notes || []).length;
    db.notes = (db.notes || []).filter(n => String(n.id) !== String(noteId));
    if (db.notes.length === initialCount) {
      return sendJson(res, 404, {success: false, message: 'Note not found'});
    }
    saveDb(db);
    recordAudit('delete_note', 'note', noteId, {}, actor);
    return sendJson(res, 200, {success: true, message: 'Note deleted'});
  }

  // --- GOALS API (Phase 4) ---
  if (pathname === '/api/goals' && req.method === 'GET') {
    const db = getDb();
    let goals = db.goals || [];
    if (query.category && query.category !== 'All') {
      goals = goals.filter(g => g.category && g.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      goals = goals.filter(g =>
        (g.title && g.title.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q))
      );
    }
    return sendJson(res, 200, {success: true, count: goals.length, goals});
  }

  if (pathname === '/api/goals' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.title || !body.title.trim()) {
        return sendJson(res, 400, {success: false, message: 'Title is required'});
      }
      const db = getDb();
      const newGoal = {
        id: body.id || ('goal_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        title: body.title.trim(),
        description: body.description || '',
        category: body.category || 'Personal',
        type: body.type || 'target_count',
        targetValue: body.targetValue !== undefined ? Number(body.targetValue) : 100,
        currentValue: body.currentValue !== undefined ? Number(body.currentValue) : 0,
        unit: body.unit || '%',
        targetDate: body.targetDate || null,
        milestones: Array.isArray(body.milestones) ? body.milestones : [],
        linkedTaskIds: Array.isArray(body.linkedTaskIds) ? body.linkedTaskIds : [],
        progressHistory: Array.isArray(body.progressHistory) ? body.progressHistory : [],
        isArchived: Boolean(body.isArchived),
        createdAt: body.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      db.goals = [newGoal, ...(db.goals || [])];
      saveDb(db);
      recordAudit('create_goal', 'goal', newGoal.id, {title: newGoal.title}, actor);
      return sendJson(res, 201, {success: true, goal: newGoal});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  const goalMatch = pathname.match(/^\/api\/goals\/([^/]+)$/);
  if (goalMatch && req.method === 'PUT') {
    try {
      const goalId = goalMatch[1];
      const updates = await parseBody(req);
      const db = getDb();
      const index = (db.goals || []).findIndex(g => String(g.id) === String(goalId));
      if (index === -1) {
        return sendJson(res, 404, {success: false, message: 'Goal not found'});
      }
      db.goals[index] = {
        ...db.goals[index],
        ...updates,
        id: db.goals[index].id,
        updatedAt: Date.now(),
      };
      saveDb(db);
      recordAudit('update_goal', 'goal', goalId, updates, actor);
      return sendJson(res, 200, {success: true, goal: db.goals[index]});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  if (goalMatch && req.method === 'DELETE') {
    const goalId = goalMatch[1];
    const db = getDb();
    const initialCount = (db.goals || []).length;
    db.goals = (db.goals || []).filter(g => String(g.id) !== String(goalId));
    if (db.goals.length === initialCount) {
      return sendJson(res, 404, {success: false, message: 'Goal not found'});
    }
    saveDb(db);
    recordAudit('delete_goal', 'goal', goalId, {}, actor);
    return sendJson(res, 200, {success: true, message: 'Goal deleted'});
  }

  // --- HABITS API (Phase 5) ---
  if (pathname === '/api/habits' && req.method === 'GET') {
    const db = getDb();
    let habits = db.habits || [];
    if (query.category && query.category !== 'All') {
      habits = habits.filter(h => h.category && h.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.search) {
      const q = query.search.toLowerCase();
      habits = habits.filter(h =>
        (h.title && h.title.toLowerCase().includes(q)) ||
        (h.description && h.description.toLowerCase().includes(q))
      );
    }
    return sendJson(res, 200, {success: true, count: habits.length, habits});
  }

  if (pathname === '/api/habits' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.title || !body.title.trim()) {
        return sendJson(res, 400, {success: false, message: 'Title is required'});
      }
      const db = getDb();
      const newHabit = {
        id: body.id || ('habit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        title: body.title.trim(),
        description: body.description || '',
        category: body.category || 'Health',
        frequency: body.frequency || 'daily',
        customDays: Array.isArray(body.customDays) ? body.customDays : [],
        reminderTime: body.reminderTime || null,
        history: body.history || {},
        isArchived: Boolean(body.isArchived),
        createdAt: body.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      db.habits = [newHabit, ...(db.habits || [])];
      saveDb(db);
      recordAudit('create_habit', 'habit', newHabit.id, {title: newHabit.title}, actor);
      return sendJson(res, 201, {success: true, habit: newHabit});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  const habitToggleMatch = pathname.match(/^\/api\/habits\/([^/]+)\/toggle$/);
  if (habitToggleMatch && req.method === 'POST') {
    try {
      const habitId = habitToggleMatch[1];
      const body = await parseBody(req);
      const {dateStr, status} = body;
      const db = getDb();
      const habit = (db.habits || []).find(h => String(h.id) === String(habitId));
      if (!habit) {
        return sendJson(res, 404, {success: false, message: 'Habit not found'});
      }
      habit.history = habit.history || {};
      if (status === null || status === undefined) {
        delete habit.history[dateStr];
      } else {
        habit.history[dateStr] = {status, timestamp: Date.now()};
      }
      habit.updatedAt = Date.now();
      saveDb(db);
      recordAudit('toggle_habit_day', 'habit', habitId, {dateStr, status}, actor);
      return sendJson(res, 200, {success: true, habit});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  const habitMatch = pathname.match(/^\/api\/habits\/([^/]+)$/);
  if (habitMatch && req.method === 'PUT') {
    try {
      const habitId = habitMatch[1];
      const updates = await parseBody(req);
      const db = getDb();
      const index = (db.habits || []).findIndex(h => String(h.id) === String(habitId));
      if (index === -1) {
        return sendJson(res, 404, {success: false, message: 'Habit not found'});
      }
      db.habits[index] = {
        ...db.habits[index],
        ...updates,
        id: db.habits[index].id,
        updatedAt: Date.now(),
      };
      saveDb(db);
      recordAudit('update_habit', 'habit', habitId, updates, actor);
      return sendJson(res, 200, {success: true, habit: db.habits[index]});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  if (habitMatch && req.method === 'DELETE') {
    const habitId = habitMatch[1];
    const db = getDb();
    const initialCount = (db.habits || []).length;
    db.habits = (db.habits || []).filter(h => String(h.id) !== String(habitId));
    if (db.habits.length === initialCount) {
      return sendJson(res, 404, {success: false, message: 'Habit not found'});
    }
    saveDb(db);
    recordAudit('delete_habit', 'habit', habitId, {}, actor);
    return sendJson(res, 200, {success: true, message: 'Habit deleted'});
  }


  // --- FOCUS & PLANNING API (Phase 6) ---
  if (pathname === '/api/focus/sessions' && req.method === 'GET') {
    const db = getDb();
    const sessions = db.focusSessions || [];
    return sendJson(res, 200, {success: true, count: sessions.length, sessions});
  }

  if (pathname === '/api/focus/sessions' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const db = getDb();
      const newSession = {
        id: body.id || ('focus_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        taskId: body.taskId || null,
        mode: body.mode || 'pomodoro',
        durationMinutes: Number(body.durationMinutes) || 25,
        completedAt: body.completedAt || Date.now(),
      };
      db.focusSessions = [newSession, ...(db.focusSessions || [])];
      saveDb(db);
      recordAudit('record_focus_session', 'focus', newSession.id, {mode: newSession.mode, durationMinutes: newSession.durationMinutes}, actor);
      return sendJson(res, 201, {success: true, session: newSession});
    } catch (err) {
      return sendJson(res, 400, {success: false, message: err.message});
    }
  }

  if (pathname === '/api/planning/summary' && req.method === 'GET') {
    const db = getDb();
    const tasks = db.tasks || [];
    const todayTasks = tasks.filter(t => !t.completed && t.dueDate === 'Today');
    const overdueTasks = tasks.filter(t => !t.completed && (t.dueDate === 'Yesterday' || t.isOverdue));
    const todayEstimatedMinutes = todayTasks.reduce((sum, t) => sum + (Number(t.estimatedDuration) || 25), 0);
    const capacityMinutes = 480;
    const isOverloaded = todayEstimatedMinutes > capacityMinutes;
    return sendJson(res, 200, {
      success: true,
      summary: {
        todayTasksCount: todayTasks.length,
        overdueTasksCount: overdueTasks.length,
        todayEstimatedMinutes,
        capacityMinutes,
        isOverloaded,
        overflowMinutes: isOverloaded ? todayEstimatedMinutes - capacityMinutes : 0,
      },
    });
  }

  // 404 for unknown endpoints
  return sendJson(res, 404, {success: false, message: 'Endpoint not found'});
});

// Start listening if run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(
      `🚀 GOTask REST API & Agent Hub running at http://localhost:${PORT}`,
    );
  });
}

module.exports = {server, parseNaturalLanguageTask, getDb, saveDb};

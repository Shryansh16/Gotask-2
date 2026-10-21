// backend/server.js
// Lightweight, zero-dependency REST API server for GOTask mobile & web clients

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure db directory & file exist
function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { profile: {}, categories: [], tasks: [] };
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { profile: {}, categories: [], tasks: [] };
  }
}

function saveDb(data) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
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
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON response with CORS headers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Root / Health check
  if (pathname === '/' || pathname === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'GOTask API Server',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  }

  // --- TASKS API ---
  // GET /api/tasks
  if (pathname === '/api/tasks' && req.method === 'GET') {
    const db = getDb();
    let tasks = db.tasks || [];

    // Filter by category
    if (query.category && query.category !== 'All') {
      tasks = tasks.filter(t => t.category && t.category.toLowerCase() === query.category.toLowerCase());
    }

    // Filter by status (completed / active)
    if (query.status) {
      if (query.status === 'completed') tasks = tasks.filter(t => t.completed);
      if (query.status === 'active' || query.status === 'pending') tasks = tasks.filter(t => !t.completed);
    }

    // Filter by priority
    if (query.priority) {
      tasks = tasks.filter(t => t.priority === query.priority);
    }

    // Search query
    if (query.search) {
      const q = query.search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return sendJson(res, 200, { success: true, count: tasks.length, tasks });
  }

  // POST /api/tasks
  if (pathname === '/api/tasks' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      if (!body.title || !body.title.trim()) {
        return sendJson(res, 400, { success: false, message: 'Title is required' });
      }

      const db = getDb();
      const newTask = {
        id: body.id || `task_${Date.now()}`,
        title: body.title.trim(),
        description: body.description || '',
        category: body.category || 'Personal',
        priority: body.priority || 'medium',
        completed: Boolean(body.completed),
        dueDate: body.dueDate || 'Today',
        isPinned: Boolean(body.isPinned),
        subtasks: Array.isArray(body.subtasks) ? body.subtasks : [],
        createdAt: body.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      db.tasks = [newTask, ...(db.tasks || [])];
      saveDb(db);
      return sendJson(res, 201, { success: true, task: newTask });
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // PUT /api/tasks/:id
  const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
  if (taskMatch && req.method === 'PUT') {
    try {
      const taskId = taskMatch[1];
      const updates = await parseBody(req);
      const db = getDb();
      const index = (db.tasks || []).findIndex(t => String(t.id) === String(taskId));

      if (index === -1) {
        return sendJson(res, 404, { success: false, message: 'Task not found' });
      }

      db.tasks[index] = {
        ...db.tasks[index],
        ...updates,
        id: db.tasks[index].id, // Prevent ID override
        updatedAt: Date.now(),
      };

      saveDb(db);
      return sendJson(res, 200, { success: true, task: db.tasks[index] });
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // DELETE /api/tasks/:id
  if (taskMatch && req.method === 'DELETE') {
    const taskId = taskMatch[1];
    const db = getDb();
    const initialCount = (db.tasks || []).length;
    db.tasks = (db.tasks || []).filter(t => String(t.id) !== String(taskId));

    if (db.tasks.length === initialCount) {
      return sendJson(res, 404, { success: false, message: 'Task not found' });
    }

    saveDb(db);
    return sendJson(res, 200, { success: true, message: 'Task deleted successfully' });
  }

  // --- STATS API ---
  // GET /api/stats
  if (pathname === '/api/stats' && req.method === 'GET') {
    const db = getDb();
    const tasks = db.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byCategory = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, completed: 0 };
      byCategory[cat].total += 1;
      if (t.completed) byCategory[cat].completed += 1;
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

  // --- SYNC API (Bidirectional Offline-First Sync) ---
  // POST /api/sync
  if (pathname === '/api/sync' && req.method === 'POST') {
    try {
      const { localTasks = [], localProfile = {} } = await parseBody(req);
      const db = getDb();
      const serverTasks = db.tasks || [];

      // Merge tasks based on ID and updatedAt
      const taskMap = new Map();
      serverTasks.forEach(t => taskMap.set(String(t.id), t));

      localTasks.forEach(lt => {
        const id = String(lt.id);
        const st = taskMap.get(id);
        if (!st) {
          taskMap.set(id, lt);
        } else {
          // Keep newest version
          const localTime = lt.updatedAt || lt.createdAt || 0;
          const serverTime = st.updatedAt || st.createdAt || 0;
          if (localTime >= serverTime) {
            taskMap.set(id, lt);
          }
        }
      });

      const mergedTasks = Array.from(taskMap.values());
      db.tasks = mergedTasks;

      // Update profile if client provided changes
      if (localProfile && localProfile.name) {
        db.profile = { ...(db.profile || {}), ...localProfile };
      }

      saveDb(db);

      return sendJson(res, 200, {
        success: true,
        syncedAt: Date.now(),
        tasks: mergedTasks,
        profile: db.profile,
      });
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // --- PROFILE API ---
  // GET /api/profile
  if (pathname === '/api/profile' && req.method === 'GET') {
    const db = getDb();
    return sendJson(res, 200, { success: true, profile: db.profile || {} });
  }

  // PUT /api/profile
  if (pathname === '/api/profile' && req.method === 'PUT') {
    try {
      const updates = await parseBody(req);
      const db = getDb();
      db.profile = { ...(db.profile || {}), ...updates };
      saveDb(db);
      return sendJson(res, 200, { success: true, profile: db.profile });
    } catch (err) {
      return sendJson(res, 400, { success: false, message: err.message });
    }
  }

  // 404 for unknown endpoints
  return sendJson(res, 404, { success: false, message: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 GOTask REST API Server running at http://localhost:${PORT}`);
});

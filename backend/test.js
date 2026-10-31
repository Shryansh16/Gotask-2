// backend/test.js
// Automated End-to-End Test Suite for GOTask Backend & Agent Hub (Phases 1 - 6)

const assert = require('assert');
const { Readable, EventEmitter } = require('stream');
const { server } = require('./server');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const bodyStr =
      body !== null
        ? typeof body === 'string'
          ? body
          : JSON.stringify(body)
        : null;

    const req = new Readable({
      read() {
        if (bodyStr) {
          this.push(bodyStr);
        }
        this.push(null);
      },
    });

    req.method = method;
    req.url = path;
    req.headers = {
      'content-type': 'application/json',
      ...headers,
    };

    const res = new EventEmitter();
    let data = '';
    res.statusCode = 200;
    res.setHeader = () => {};
    res.writeHead = (status, _h) => {
      res.statusCode = status;
    };
    res.write = chunk => {
      if (chunk) {
        data += chunk;
      }
    };
    res.end = chunk => {
      if (chunk) {
        data += chunk;
      }
      let json = null;
      try {
        json = JSON.parse(data);
      } catch (e) {
        json = data;
      }
      resolve({ status: res.statusCode, data: json });
    };

    server.emit('request', req, res);
  });
}

async function runTests() {
  console.log('🧪 Starting GOTask Backend & Agent Integration Test Suite...\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}\n`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health returns 200 with service metadata', async () => {
    const res = await request('GET', '/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
    assert.strictEqual(res.data.service, 'GOTask API Server');
  });

  // 2. Natural language parsing
  await test('POST /api/tasks/parse extracts metadata from natural language', async () => {
    const text = 'Finish presentation tomorrow 5pm !urgent #Work';
    const res = await request('POST', '/api/tasks/parse', { text });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.parsed.priority, 'high');
    assert.strictEqual(res.data.parsed.category, 'Work');
    assert.strictEqual(res.data.parsed.dueDate, 'Tomorrow');
    assert.ok(res.data.parsed.tags.includes('Work'));
  });

  // 3. Create task
  let createdTaskId = null;
  await test('POST /api/tasks creates task successfully', async () => {
    const res = await request('POST', '/api/tasks', {
      title: 'Automated E2E Verification Task',
      description: 'Testing core production endpoints',
      category: 'Work',
      priority: 'high',
      dueDate: 'Tomorrow',
      estimatedDuration: 45,
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.task.id);
    createdTaskId = res.data.task.id;
  });

  // 4. Update task
  await test('PUT /api/tasks/:id updates existing task', async () => {
    assert.ok(createdTaskId, 'Must have a createdTaskId');
    const res = await request('PUT', `/api/tasks/${createdTaskId}`, {
      completed: true,
      description: 'Updated via test suite',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.task.completed, true);
  });

  // 5. Query tasks
  await test('GET /api/tasks returns task list with filter and search', async () => {
    const res = await request(
      'GET',
      '/api/tasks?category=Work&search=Automated',
    );
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.tasks));
    assert.ok(res.data.tasks.length > 0);
  });

  // 6. Agent Dispatch
  let agentTaskId = null;
  await test('POST /api/agent/dispatch creates agent-managed task', async () => {
    const res = await request(
      'POST',
      '/api/agent/dispatch',
      {
        agentId: 'agent_dev_01',
        agentName: 'DevOps Orchestrator',
        action: 'create',
        task: {
          title: 'Review production security headers and logs',
          category: 'Work',
          priority: 'high',
          tags: ['security', 'audit'],
          subtasks: [
            { id: 'st_1', title: 'Verify CORS headers', completed: true },
            { id: 'st_2', title: 'Verify atomic file writes', completed: true },
          ],
        },
      },
      { 'X-Agent-Name': 'DevOps Orchestrator' },
    );
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.task.agentMetadata);
    assert.strictEqual(
      res.data.task.agentMetadata.dispatchedBy,
      'DevOps Orchestrator',
    );
    agentTaskId = res.data.task.id;
  });

  // 7. Agent Tasks Listing
  await test('GET /api/agent/tasks returns actionable agent tasks', async () => {
    const res = await request('GET', '/api/agent/tasks');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.summary);
  });

  // 8. Audit Logs
  await test('GET /api/audit-logs retrieves chronological audit trail', async () => {
    const res = await request('GET', '/api/audit-logs?limit=10');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.auditLogs));
    assert.ok(res.data.auditLogs.length > 0);
  });

  // 9. Stats
  await test('GET /api/stats calculates productivity rates and metrics', async () => {
    const res = await request('GET', '/api/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok('completionRate' in res.data.stats);
  });

  // 10. Focus Mode Sessions (Phase 6 — P6.5, P6.6)
  await test('POST /api/focus/sessions records focus session and retrieves list', async () => {
    const sessionRes = await request('POST', '/api/focus/sessions', {
      taskId: createdTaskId,
      mode: 'pomodoro',
      durationMinutes: 25,
    });
    assert.strictEqual(sessionRes.status, 201);
    assert.strictEqual(sessionRes.data.success, true);
    assert.strictEqual(sessionRes.data.session.durationMinutes, 25);

    const listRes = await request('GET', '/api/focus/sessions');
    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.data.success, true);
    assert.ok(Array.isArray(listRes.data.sessions));
    assert.ok(listRes.data.sessions.length > 0);
  });

  // 11. Daily Planning Summary (Phase 6 — P6.1, P6.8)
  await test('GET /api/planning/summary calculates planned load and overload status', async () => {
    const res = await request('GET', '/api/planning/summary');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok('todayTasksCount' in res.data.summary);
    assert.ok('todayEstimatedMinutes' in res.data.summary);
    assert.ok('capacityMinutes' in res.data.summary);
    assert.strictEqual(typeof res.data.summary.isOverloaded, 'boolean');
  });

  
  // 13. AI Goal Decomposition (Phase 7 — P7.5)
  await test('POST /api/ai/decompose-goal returns sequential draft milestones', async () => {
    const res = await request('POST', '/api/ai/decompose-goal', {
      goalTitle: 'Run 10km Marathon in spring',
      category: 'Health',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.milestones));
    assert.strictEqual(res.data.milestones.length, 4);
    assert.strictEqual(res.data.milestones[0].id, 'm1');
  });

  // 14. AI Subtask Suggestions (Phase 7 — P7.5)
  await test('POST /api/ai/suggest-subtasks returns decomposed actionable steps', async () => {
    const res = await request('POST', '/api/ai/suggest-subtasks', {
      taskTitle: 'Prepare quarterly presentation',
      category: 'Work',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.subtasks));
    assert.ok(res.data.subtasks.length >= 3);
  });

  // 15. AI Overdue Recovery Plan (Phase 7 — P7.7)
  await test('POST /api/ai/recovery-plan distributes overdue tasks to prevent burnout', async () => {
    const overdueTasks = [
      { id: 'ov_1', title: 'Task 1', estimatedDuration: 30, priority: 'high' },
      { id: 'ov_2', title: 'Task 2', estimatedDuration: 45, priority: 'medium' },
      { id: 'ov_3', title: 'Task 3', estimatedDuration: 60, priority: 'low' },
    ];
    const res = await request('POST', '/api/ai/recovery-plan', { overdueTasks });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.totalOverdueCount, 3);
    assert.ok(Array.isArray(res.data.plan));
    assert.strictEqual(res.data.plan.length, 3);
  });

  // 16. AI Factual Progress Summary (Phase 7 — P7.8)
  await test('POST /api/ai/summary returns evidence-based summary without fabrication', async () => {
    const res = await request('POST', '/api/ai/summary', {
      tasks: [{ id: 't1', title: 'Task 1', completed: true }, { id: 't2', title: 'Task 2', completed: false }],
      goals: [{ id: 'g1', title: 'Goal 1', progress: 50 }],
      habits: [{ id: 'h1', title: 'Habit 1', currentStreak: 5 }],
      focusSessions: [{ id: 'fs1', durationMinutes: 25 }],
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.metrics.completedTasks, 1);
    assert.strictEqual(res.data.metrics.totalTasks, 2);
    assert.strictEqual(res.data.metrics.totalFocusMinutes, 25);
  });

  // 17. Security Guardrails: Action Whitelist (Phase 7 — P7.11)
  await test('POST /api/agent/dispatch blocks unauthorized action with 403 Forbidden', async () => {
    const res = await request('POST', '/api/agent/dispatch', {
      agentId: 'agent_rogue',
      action: 'drop_database_all',
      task: { title: 'Unauthorized exploit' },
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.message.includes('not permitted'));
  });

    // 18. Analytics Overview API (Phase 8 — P8.1 to P8.5)
  await test('GET /api/analytics/overview returns verified cross-module metrics', async () => {
    const res = await request('GET', '/api/analytics/overview');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok('totalTasks' in res.data.metrics);
    assert.ok('completedTasks' in res.data.metrics);
    assert.ok('completionRate' in res.data.metrics);
    assert.ok('longestStreak' in res.data.metrics);
    assert.ok('totalFocusMinutes' in res.data.metrics);
  });

    // 19. Backup Export API (Phase 9 — P9.3)
  await test('GET /api/backup/export downloads full valid snapshot', async () => {
    const res = await request('GET', '/api/backup/export');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.backup.appName, 'GOTask');
    assert.ok(Array.isArray(res.data.backup.data.tasks));
  });

  // 20. Backup Import API (Phase 9 — P9.4)
  await test('POST /api/backup/import validates and restores backup', async () => {
    const validBackup = {
      appName: 'GOTask',
      schemaVersion: '2.0.0',
      data: {
        tasks: [{ id: createdTaskId, title: 'Preserved Task', completed: false }, { id: 'restored_task_1', title: 'Restored Task', completed: false }],
        notes: [],
        goals: [],
        habits: [],
      },
    };
    const res = await request('POST', '/api/backup/import', { backup: validBackup });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    // Corrupted backup rejection
    const invalidRes = await request('POST', '/api/backup/import', { backup: { appName: 'WrongApp' } });
    assert.strictEqual(invalidRes.status, 400);
    assert.strictEqual(invalidRes.data.success, false);
  });

  // 21. Sync Conflict Resolution API (Phase 9 — P9.7)
  await test('POST /api/sync/resolve reconciles tasks with LWW strategy', async () => {
    const localTasks = [
      { id: 'restored_task_1', title: 'Restored Task Modified', completed: true, updatedAt: new Date(Date.now() + 5000).toISOString() },
    ];
    const res = await request('POST', '/api/sync/resolve', { localTasks, strategy: 'LWW' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.mergedTasks));
  });

  // 12. Clean up created test tasks
  await test('DELETE /api/tasks/:id deletes task and records audit', async () => {
    if (createdTaskId) {
      const res = await request('DELETE', `/api/tasks/${createdTaskId}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    }
    if (agentTaskId) {
      await request('DELETE', `/api/tasks/${agentTaskId}`);
    }
  });

  console.log('\n========================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

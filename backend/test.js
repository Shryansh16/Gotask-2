// backend/test.js
// Automated End-to-End Test Suite for GOTask Backend & Agent Hub

const http = require('http');
const assert = require('assert');
const {server} = require('./server');

const BASE_URL = 'http://localhost:5000';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({status: res.statusCode, data: json});
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting GOTask Backend & Agent Integration Test Suite...\n');
  let startedLocalServer = false;

  // Ensure server is running for tests
  await new Promise(resolve => {
    const probeReq = http.get('http://localhost:5000/health', () => resolve());
    probeReq.on('error', () => {
      try {
        server.listen(5000, () => {
          startedLocalServer = true;
          resolve();
        });
      } catch (e) {
        resolve();
      }
    });
  });

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
    const res = await request('POST', '/api/tasks/parse', {text});
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
            {id: 'st_1', title: 'Verify CORS headers', completed: true},
            {id: 'st_2', title: 'Verify atomic file writes', completed: true},
          ],
        },
      },
      {'X-Agent-Name': 'DevOps Orchestrator'},
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

  // 10. Clean up created test tasks
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

  if (startedLocalServer) {
    server.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

# GOTask - Multi-Agent Fleet Specification & Interoperability Protocol (v1.0)

## Overview
GOTask is architected as an **Agent-Ready Productivity Ecosystem**. This specification outlines how autonomous AI agents, automated development tools, and human users collaborate seamlessly across the mobile frontend and backend REST services.

---

## 1. Multi-Agent Ecosystem Roles

| Agent Role | Primary Focus | Interaction Points |
| :--- | :--- | :--- |
| **Orchestrator Agent** | Task prioritization, daily summary generation, calendar scheduling | `/api/agent/dispatch`, `/api/stats`, `/api/agent/batch` |
| **Dev / Coding Agent** | Feature implementation, bug fixes, automated refactoring | Git repository, `src/`, `jest`, `eslint` |
| **QA / Tester Agent** | End-to-end testing, bundle validation, API regression checks | `backend/test.js`, Jest, Metro packager |
| **Productivity Coach Agent**| Subtask breakdown, streak motivation, time estimation | `/api/tasks/parse`, `/api/agent/dispatch` |

---

## 2. API Contract & Communication Protocol

### Base URL:
* Localhost: `http://localhost:5000`
* Android Emulator: `http://10.0.2.2:5000`
* LAN Device: `http://<HOST_IP>:5000`

### Required Request Headers for Agents:
Agents communicating with the GOTask API must provide attribution headers:
```http
Content-Type: application/json
X-Agent-ID: <agent_unique_identifier>
X-Agent-Name: <human_readable_agent_name>
```

---

## 3. Dedicated Agent Endpoints

### 3.1. Agent Dispatch (`POST /api/agent/dispatch`)
Dispatch an automated action from an AI agent.

#### Action: `create`
```json
{
  "agentId": "agent_orchestrator",
  "agentName": "Linear/Jira Sync Bot",
  "action": "create",
  "task": {
    "title": "Migrate database schema for multi-tenant auth",
    "description": "Synced from sprint backlog",
    "category": "Work",
    "priority": "high",
    "dueDate": "Tomorrow",
    "tags": ["backend", "sprint-22"],
    "subtasks": [
      { "id": "st_1", "title": "Write migration script", "completed": false },
      { "id": "st_2", "title": "Validate indexes", "completed": false }
    ]
  }
}
```

#### Action: `generate_subtasks`
```json
{
  "agentId": "agent_breakdown_assistant",
  "agentName": "Task Decomposer",
  "action": "generate_subtasks",
  "taskId": "task_123456789",
  "task": {
    "subtasks": [
      "Step 1: Set up mock endpoints",
      "Step 2: Connect React hooks",
      "Step 3: Run regression tests"
    ]
  }
}
```

#### Action: `resolve`
```json
{
  "agentId": "agent_ci_bot",
  "agentName": "GitHub Actions Agent",
  "action": "resolve",
  "taskId": "task_123456789"
}
```

---

### 3.2. Agent Task Querying (`GET /api/agent/tasks`)
Allows agents to fetch actionable tasks without human UI clutter.

**Response Schema:**
```json
{
  "success": true,
  "summary": {
    "totalPending": 12,
    "totalAgentManaged": 4
  },
  "tasks": [
    {
      "id": "task_123456789",
      "title": "Review pull request #42",
      "priority": "high",
      "category": "Work",
      "agentMetadata": {
        "dispatchedBy": "GitHub Actions Agent",
        "agentId": "agent_ci_bot",
        "status": "agent_active"
      }
    }
  ]
}
```

---

### 3.3. Natural Language Task Parsing (`POST /api/tasks/parse`)
Accepts freeform text and extracts structured metadata:

```bash
curl -X POST http://localhost:5000/api/tasks/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Refactor navigation state tomorrow 3pm !high #Work"}'
```

**Parsed Output:**
```json
{
  "success": true,
  "parsed": {
    "title": "Refactor navigation state",
    "priority": "high",
    "category": "Work",
    "dueDate": "Tomorrow",
    "tags": ["Work"]
  }
}
```

---

### 3.4. Audit Logging (`GET /api/audit-logs`)
Every action performed by a human or agent is recorded in an immutable chronological audit trail for governance and observability.

---

## 4. Guardrails & Standards for Agents Working in this Repository
1. **Workspace Isolation**: Work strictly within the project root `D:\React Native\GOTask`. Do not scan or alter external host directories.
2. **Crash-Resilient DB**: All file updates to `backend/data/db.json` must be written atomically via temporary staging files.
3. **Lint & Test Gates**: Before concluding any turn or commit:
   - Run `npm.cmd run lint` (0 errors required).
   - Run `npm.cmd test -- --watchAll=false` (100% pass required).
   - Run `node backend/test.js` (100% pass required).
4. **Audit Trail**: Always log structural updates and commits in [ACTIVITY_LOG.md](file:///d:/React%20Native/GOTask/ACTIVITY_LOG.md).

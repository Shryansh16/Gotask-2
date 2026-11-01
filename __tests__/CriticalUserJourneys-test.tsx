/**
 * GOTask - Critical User Journeys End-to-End Regression Suite (Phase 10 - P10.3, P10.5)
 * Verifies core end-to-end workflows across Tasks, Goals, Habits, Planning, and Data Reliability.
 */

import { createBackupPayload, validateBackup } from '../src/services/backupService';
import { migrateData } from '../src/services/migrationService';
import { detectConflict, resolveItemConflict } from '../src/services/syncEngine';
import { evaluateDayWorkload, evaluateFocusTransition } from '../src/context/PlanningContext';
import { computeTaskMetrics } from '../src/services/analyticsService';
import { evaluateAchievements } from '../src/services/motivationService';

describe('Phase 10: Critical User Journeys (E2E Regression)', () => {
  // ----------------------------------------------------
  // Journey A: Capture and Complete a Task
  // ----------------------------------------------------
  describe('Journey A: Capture, Manage & Complete a Task (PRD Section 6)', () => {
    it('executes full lifecycle: creation -> metadata -> subtask completion -> metrics calculation', () => {
      // 1. User captures a task with priority, tags, and subtasks
      const newTask = {
        id: 'task_j1_101',
        title: 'Prepare Q4 Product Architecture Review',
        priority: 'high',
        category: 'Work',
        dueDate: 'Today',
        completed: false,
        subtasks: [
          { id: 'sub_1', title: 'Compile benchmark numbers', completed: false },
          { id: 'sub_2', title: 'Draft system diagram', completed: false },
        ],
        updatedAt: '2026-10-31T10:00:00.000Z',
      };

      expect(newTask.completed).toBe(false);
      expect(newTask.subtasks.length).toBe(2);

      // 2. User completes subtask 1
      newTask.subtasks[0].completed = true;
      expect(newTask.subtasks[0].completed).toBe(true);

      // 3. User finishes all subtasks and marks task completed
      newTask.subtasks[1].completed = true;
      newTask.completed = true;
      newTask.completedAt = '2026-10-31T14:30:00.000Z';

      // 4. Verification in analytics
      const metrics = computeTaskMetrics([newTask]);
      expect(metrics.total).toBe(1);
      expect(metrics.completed).toBe(1);
      expect(metrics.completionRate).toBe(100);
      expect(metrics.priorityBreakdown.high).toBe(1);
    });
  });

  // ----------------------------------------------------
  // Journey B: Create and Achieve a Measurable Goal
  // ----------------------------------------------------
  describe('Journey B: Create, Update & Achieve a Goal (PRD Section 6)', () => {
    it('tracks milestone completion and evaluates achievement badges', () => {
      // 1. User creates a measurable goal
      const goal = {
        id: 'goal_j2_201',
        title: 'Launch GOTask v2.0 Architecture',
        targetType: 'numeric',
        currentValue: 3,
        targetValue: 10,
        progress: 30,
        milestones: [
          { id: 'm1', title: 'Complete Phase 1-5 Core Layers', completed: true },
          { id: 'm2', title: 'Implement AI and Analytics', completed: true },
          { id: 'm3', title: 'Pass Release Verification', completed: false },
        ],
      };

      // 2. Milestone 3 completed
      goal.milestones[2].completed = true;
      goal.currentValue = 10;
      goal.progress = Math.round((goal.currentValue / goal.targetValue) * 100);
      expect(goal.progress).toBe(100);

      // 3. Evaluate motivational achievements
      const unlockedBadges = evaluateAchievements({
        tasks: [{ id: 't1', completed: true }],
        goals: [goal],
        habits: [],
        focusSessions: [],
      });

      const visionaryBadge = unlockedBadges.find(b => b.id === 'first_goal');
      expect(visionaryBadge).toBeDefined();
      expect(visionaryBadge?.unlocked).toBe(true);
    });
  });

  // ----------------------------------------------------
  // Journey C: Plan and Execute a Focused Day
  // ----------------------------------------------------
  describe('Journey C: Plan Workload & Execute Focus Mode (PRD Section 6)', () => {
    it('evaluates overload boundaries and manages focus timer states deterministically', () => {
      // 1. Evaluate overloaded workload
      const workload = evaluateDayWorkload({
        totalMinutes: 450,
        maxCapacityMinutes: 360,
        hasOverdue: false,
      });

      expect(workload.isOverloaded).toBe(true);
      expect(workload.workloadStatus).toBe('overloaded');
      expect(workload.overflowMinutes).toBe(90);

      // 2. Focus Timer State Machine Transitions
      const startTransition = evaluateFocusTransition({ currentStatus: 'idle', action: 'start' });
      expect(startTransition.nextStatus).toBe('running');

      const pauseTransition = evaluateFocusTransition({ currentStatus: 'running', action: 'pause' });
      expect(pauseTransition.nextStatus).toBe('paused');

      const finishTransition = evaluateFocusTransition({ currentStatus: 'running', action: 'tick_0' });
      expect(finishTransition.nextStatus).toBe('completed');
      expect(finishTransition.timerAction).toBe('stop_log');
    });
  });

  // ----------------------------------------------------
  // Journey D: Backup Integrity, Schema Migration & Conflict Resolution
  // ----------------------------------------------------
  describe('Journey D: Full Workspace Export, Migrate & LWW Sync', () => {
    it('creates tamper-proof snapshot, rejects corrupted JSON, and resolves LWW conflicts without data loss', () => {
      // 1. Create backup snapshot
      const sampleWorkspace = {
        tasks: [{ id: 't_backup_1', title: 'Verify release checklist', completed: true }],
        notes: [{ id: 'n_backup_1', title: 'Architecture decisions' }],
        goals: [{ id: 'g_backup_1', title: 'Ship v2.0' }],
        habits: [{ id: 'h_backup_1', name: 'Daily Standup' }],
      };

      const backup = createBackupPayload(sampleWorkspace);
      expect(backup.appName).toBe('GOTask');
      expect(backup.checksum).toBeDefined();

      // 2. Verify valid backup
      const validation = validateBackup(backup);
      expect(validation.isValid).toBe(true);

      // 3. Reject tampered backup
      const tampered = JSON.parse(JSON.stringify(backup));
      tampered.data.tasks.push({ id: 'injected_task', title: 'Hacked payload' });
      const tamperedValidation = validateBackup(tampered);
      expect(tamperedValidation.isValid).toBe(false);
      expect(tamperedValidation.error).toContain('checksum mismatch');

      // 4. Schema Migration
      const legacyPayload = {
        schemaVersion: '1.0.0',
        tasks: [{ id: 't_legacy', title: 'Old task without schema v2 attributes' }],
      };
      const migrated = migrateData(legacyPayload);
      expect(migrated.tasks[0].subtasks).toEqual([]);
      expect(migrated.tasks[0].tags).toEqual([]);
      expect(migrated.schemaVersion).toBe('2.0.0');

      // 5. Conflict Resolution via LWW
      const localTask = {
        id: 't_sync_1',
        title: 'Local edit',
        updatedAt: '2026-10-31T11:00:00.000Z',
      };
      const remoteTask = {
        id: 't_sync_1',
        title: 'Remote newer edit',
        updatedAt: '2026-10-31T12:00:00.000Z',
      };

      const hasConflict = detectConflict(localTask, remoteTask);
      expect(hasConflict).toBe(true);

      const resolution = resolveItemConflict(localTask, remoteTask);
      expect(resolution.resolvedItem.title).toBe('Remote newer edit');
      expect(resolution.archivedVariant).toBeDefined();
      expect(resolution.archivedVariant.title).toBe('Local edit');
    });
  });
});

/**
 * GOTask - Phase 9 Data Reliability, Backup & Sync Test Suite
 * Tests PRD P9.1 to P9.9:
 * - Local backup payload generation & checksum validation (P9.3, P9.4)
 * - Backup integrity checks and corruption rejection (P9.4)
 * - Schema migrations from legacy versions (P9.5)
 * - Offline sync conflict detection & Last-Write-Wins (LWW) resolution (P9.6 - P9.8)
 */

import {
  createBackupPayload,
  validateBackup,
  prepareRestoreData,
  generateChecksum,
} from '../src/services/backupService';
import {
  migrateData,
  compareVersions,
  CURRENT_SCHEMA_VERSION,
} from '../src/services/migrationService';
import {
  detectConflict,
  resolveItemConflict,
  mergeEntityCollections,
} from '../src/services/syncEngine';

describe('Phase 9: Data Reliability, Backup & Synchronization Suite', () => {
  describe('P9.3 & P9.4: Backup Creation & Checksum Integrity', () => {
    test('creates versioned backup payload with deterministic checksum and record counts', () => {
      const mockData = {
        tasks: [{id: 't1', title: 'Task 1', completed: true}],
        notes: [{id: 'n1', title: 'Note 1'}],
        goals: [{id: 'g1', title: 'Goal 1', progress: 50}],
        habits: [{id: 'h1', title: 'Habit 1', currentStreak: 3}],
        focusSessions: [{id: 'f1', durationMinutes: 25}],
        profile: {name: 'Alice'},
      };

      const backup = createBackupPayload(mockData);

      expect(backup.appName).toBe('GOTask');
      expect(backup.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(backup.recordCounts.tasks).toBe(1);
      expect(backup.recordCounts.notes).toBe(1);
      expect(backup.checksum).toBeDefined();
      expect(backup.checksum.length).toBeGreaterThan(0);

      // Validate backup passes integrity check
      const validation = validateBackup(backup);
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeNull();
    });

    test('rejects backup with altered content or invalid checksum (P9.4)', () => {
      const backup = createBackupPayload({
        tasks: [{id: 't1', title: 'Original Task'}],
      });

      // Tamper with data without updating checksum
      backup.data.tasks[0].title = 'Tampered Task';

      const validation = validateBackup(backup);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('checksum mismatch');
    });

    test('rejects non-GOTask backup payloads', () => {
      const foreignBackup = {
        appName: 'UnknownTodoApp',
        data: {},
      };
      const validation = validateBackup(foreignBackup);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Expected GOTask');
    });

    test('rejects corrupted payload with invalid data types', () => {
      const corruptedBackup = {
        appName: 'GOTask',
        data: {
          tasks: 'NotAnArray',
        },
      };
      const validation = validateBackup(corruptedBackup);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('"tasks" must be an array');
    });
  });

  describe('P9.5: Schema Migration Engine', () => {
    test('compares semantic versions correctly', () => {
      expect(compareVersions('1.0.0', '1.1.0')).toBe(-1);
      expect(compareVersions('2.0.0', '1.1.0')).toBe(1);
      expect(compareVersions('2.0.0', '2.0.0')).toBe(0);
    });

    test('migrates legacy v1 payload adding subtasks and metadata to v2.0.0', () => {
      const legacyV1Payload = {
        schemaVersion: '1.0.0',
        tasks: [{id: 'old_1', title: 'Legacy Task Without Subtasks'}],
        notes: [{id: 'n1', title: 'Note without tags'}],
      };

      const migrated = migrateData(legacyV1Payload);
      expect(migrated.schemaVersion).toBe('2.0.0');
      expect(Array.isArray(migrated.tasks[0].subtasks)).toBe(true);
      expect(migrated.tasks[0].priority).toBe('medium');
      expect(Array.isArray(migrated.notes[0].tags)).toBe(true);
    });

    test('prepareRestoreData applies migration and returns valid restore payload', () => {
      const legacyBackup = {
        appName: 'GOTask',
        schemaVersion: '1.0.0',
        data: {
          tasks: [{id: 't1', title: 'Task to Restore'}],
        },
      };
      legacyBackup.checksum = generateChecksum(legacyBackup.data);

      const restore = prepareRestoreData(legacyBackup);
      expect(restore.success).toBe(true);
      expect(restore.data.schemaVersion).toBe('2.0.0');
      expect(restore.recordCounts.tasks).toBe(1);
    });
  });

  describe('P9.7 & P9.8: Offline Sync & Conflict Resolution', () => {
    test('detects conflict when two items diverge in content and timestamps', () => {
      const local = {
        id: 't1',
        title: 'Task Local Edit',
        completed: true,
        updatedAt: '2026-10-31T10:00:00Z',
      };
      const remote = {
        id: 't1',
        title: 'Task Remote Edit',
        completed: false,
        updatedAt: '2026-10-31T10:05:00Z',
      };

      expect(detectConflict(local, remote)).toBe(true);
    });

    test('returns false when items have identical content', () => {
      const local = {id: 't1', title: 'Same Task', completed: true};
      const remote = {id: 't1', title: 'Same Task', completed: true};
      expect(detectConflict(local, remote)).toBe(false);
    });

    test('resolves conflict using Last-Write-Wins (LWW) and archives superseded variant', () => {
      const local = {
        id: 't1',
        title: 'Local Older',
        updatedAt: '2026-10-31T10:00:00Z',
      };
      const remote = {
        id: 't1',
        title: 'Remote Newer',
        updatedAt: '2026-10-31T10:05:00Z',
      };

      const resolution = resolveItemConflict(local, remote, 'LWW');
      expect(resolution.resolvedItem.title).toBe('Remote Newer');
      expect(resolution.archivedVariant.title).toBe('Local Older');
      expect(resolution.reason).toContain(
        'Remote item has more recent timestamp',
      );
    });

    test('merges collection reconciling additions, updates, and conflicts cleanly', () => {
      const localTasks = [
        {
          id: '1',
          title: 'Local Task Only',
          completed: false,
          updatedAt: '2026-10-31T10:00:00Z',
        },
        {
          id: '2',
          title: 'Shared Task Local Newer',
          completed: true,
          updatedAt: '2026-10-31T10:10:00Z',
        },
      ];
      const remoteTasks = [
        {
          id: '2',
          title: 'Shared Task Remote Older',
          completed: false,
          updatedAt: '2026-10-31T10:02:00Z',
        },
        {
          id: '3',
          title: 'Remote Task Only',
          completed: false,
          updatedAt: '2026-10-31T10:00:00Z',
        },
      ];

      const result = mergeEntityCollections(localTasks, remoteTasks, 'LWW');
      expect(result.totalCount).toBe(3);
      expect(result.additions).toBe(1); // Item 3 added
      expect(result.conflicts.length).toBe(1); // Item 2 had conflict

      const mergedItem2 = result.merged.find(t => t.id === '2');
      expect(mergedItem2.title).toBe('Shared Task Local Newer');
      expect(mergedItem2.completed).toBe(true);
    });
  });
});

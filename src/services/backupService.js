/**
 * GOTask - Backup, Export, Import & Restore Service (Phase 9 - P9.3, P9.4)
 * Provides integrity-validated exports and crash-resilient restoration
 */

import {CURRENT_SCHEMA_VERSION, migrateData} from './migrationService';

/**
 * Simple deterministic checksum generator for backup integrity validation
 */
export function generateChecksum(dataObj) {
  const str = JSON.stringify(dataObj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * P9.3: Create a structured, versioned backup export
 */
export function createBackupPayload({
  tasks = [],
  notes = [],
  goals = [],
  habits = [],
  focusSessions = [],
  profile = {},
  categories = [],
} = {}) {
  const data = {
    tasks: Array.isArray(tasks) ? tasks : [],
    notes: Array.isArray(notes) ? notes : [],
    goals: Array.isArray(goals) ? goals : [],
    habits: Array.isArray(habits) ? habits : [],
    focusSessions: Array.isArray(focusSessions) ? focusSessions : [],
    profile: profile || {},
    categories: Array.isArray(categories) ? categories : [],
  };

  const payload = {
    appName: 'GOTask',
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    recordCounts: {
      tasks: data.tasks.length,
      notes: data.notes.length,
      goals: data.goals.length,
      habits: data.habits.length,
      focusSessions: data.focusSessions.length,
    },
    data,
    checksum: generateChecksum(data),
  };

  return payload;
}

/**
 * P9.4: Validate backup integrity before applying changes
 */
export function validateBackup(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return {isValid: false, error: 'Backup data is empty or invalid format.'};
  }

  if (rawPayload.appName !== 'GOTask') {
    return {
      isValid: false,
      error: 'Unrecognized backup file. Expected GOTask application backup.',
    };
  }

  if (!rawPayload.data || typeof rawPayload.data !== 'object') {
    return {isValid: false, error: 'Corrupted backup: Missing data payload.'};
  }

  // Checksum verification
  const expectedChecksum = generateChecksum(rawPayload.data);
  if (rawPayload.checksum && rawPayload.checksum !== expectedChecksum) {
    return {
      isValid: false,
      error: 'Integrity check failed: Backup data checksum mismatch.',
    };
  }

  // Ensure primary data sets are arrays if present
  const {tasks, notes, goals, habits} = rawPayload.data;
  if (tasks && !Array.isArray(tasks)) {
    return {
      isValid: false,
      error: 'Corrupted backup: "tasks" must be an array.',
    };
  }
  if (notes && !Array.isArray(notes)) {
    return {
      isValid: false,
      error: 'Corrupted backup: "notes" must be an array.',
    };
  }
  if (goals && !Array.isArray(goals)) {
    return {
      isValid: false,
      error: 'Corrupted backup: "goals" must be an array.',
    };
  }
  if (habits && !Array.isArray(habits)) {
    return {
      isValid: false,
      error: 'Corrupted backup: "habits" must be an array.',
    };
  }

  return {isValid: true, error: null};
}

/**
 * P9.4: Process and prepare valid restore data with automatic schema migration
 */
export function prepareRestoreData(rawBackup) {
  const validation = validateBackup(rawBackup);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Run schema migration if needed
  const migratedData = migrateData(rawBackup.data);

  return {
    success: true,
    restoredAt: new Date().toISOString(),
    data: migratedData,
    recordCounts: {
      tasks: (migratedData.tasks || []).length,
      notes: (migratedData.notes || []).length,
      goals: (migratedData.goals || []).length,
      habits: (migratedData.habits || []).length,
      focusSessions: (migratedData.focusSessions || []).length,
    },
  };
}

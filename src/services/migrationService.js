/**
 * GOTask - Schema Migration Engine (Phase 9 - P9.5)
 * Safely migrates productivity data across versions while preserving records
 */

export const CURRENT_SCHEMA_VERSION = '2.0.0';

export const MIGRATIONS = [
  {
    version: '1.1.0',
    description:
      'Ensure tasks have subtasks array, priority, and category fields',
    migrate: data => {
      const tasks = (data.tasks || []).map(task => ({
        id:
          task.id ||
          `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        category: task.category || 'General',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || 'Today',
        completed: Boolean(task.completed),
        isPinned: Boolean(task.isPinned),
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
        tags: Array.isArray(task.tags) ? task.tags : [],
        createdAt: task.createdAt || new Date().toISOString(),
        updatedAt: task.updatedAt || new Date().toISOString(),
      }));
      return {...data, tasks, schemaVersion: '1.1.0'};
    },
  },
  {
    version: '2.0.0',
    description:
      'Add Notes, Goals, Habits, Focus Sessions, and schema metadata',
    migrate: data => {
      return {
        ...data,
        tasks: data.tasks || [],
        notes: (data.notes || []).map(n => ({
          ...n,
          tags: Array.isArray(n.tags) ? n.tags : [],
          updatedAt: n.updatedAt || new Date().toISOString(),
        })),
        goals: (data.goals || []).map(g => ({
          ...g,
          milestones: Array.isArray(g.milestones) ? g.milestones : [],
          progress: typeof g.progress === 'number' ? g.progress : 0,
          updatedAt: g.updatedAt || new Date().toISOString(),
        })),
        habits: (data.habits || []).map(h => ({
          ...h,
          currentStreak:
            typeof h.currentStreak === 'number' ? h.currentStreak : 0,
          history: h.history || {},
          updatedAt: h.updatedAt || new Date().toISOString(),
        })),
        focusSessions: data.focusSessions || [],
        schemaVersion: '2.0.0',
      };
    },
  },
];

/**
 * Applies sequential schema migrations to raw data
 */
export function migrateData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('Invalid data payload for migration');
  }

  let migrated = {...rawData};
  let currentVer = migrated.schemaVersion || '1.0.0';

  MIGRATIONS.forEach(migration => {
    if (compareVersions(currentVer, migration.version) < 0) {
      migrated = migration.migrate(migrated);
      currentVer = migration.version;
    }
  });

  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;
  return migrated;
}

/**
 * Compare semantic versions: a < b returns -1, a > b returns 1, a == b returns 0
 */
export function compareVersions(a = '1.0.0', b = '1.0.0') {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) {
      return 1;
    }
    if (na < nb) {
      return -1;
    }
  }
  return 0;
}

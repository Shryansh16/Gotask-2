// src/context/GoalContext.js
// Verified Goals, Milestones, and Progress Layer (docs/PRD.md Phase 4 — P4.1 to P4.12)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import TaskContext from './TaskContext';

const GoalContext = createContext();
const GOALS_STORAGE_KEY = '@gotask_goals';

export const GOAL_BOUNDS = {
  TITLE_MAX_LEN: 100,
  DESC_MAX_LEN: 1000,
  CATEGORY_MAX_LEN: 50,
  UNIT_MAX_LEN: 20,
  MILESTONE_TITLE_MAX_LEN: 100,
  MAX_MILESTONES: 20,
  MAX_LINKED_TASKS: 50,
};

export const GOAL_TYPES = {
  TARGET_COUNT: 'target_count',
  PERCENTAGE: 'percentage',
  MILESTONES: 'milestones',
  TASK_DERIVED: 'task_derived',
};

/**
 * Validates and sanitizes a goal input payload
 * @param {object} input
 * @returns {{isValid: boolean, error: string|null, sanitized: object|null}}
 */
export const validateGoalInput = input => {
  if (!input || typeof input !== 'object') {
    return {isValid: false, error: 'Goal payload is required', sanitized: null};
  }

  const title = (input.title || '').trim();
  if (!title) {
    return {isValid: false, error: 'Goal title is required', sanitized: null};
  }
  if (title.length > GOAL_BOUNDS.TITLE_MAX_LEN) {
    return {
      isValid: false,
      error: `Title exceeds maximum limit of ${GOAL_BOUNDS.TITLE_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  const description = (input.description || '').trim();
  if (description.length > GOAL_BOUNDS.DESC_MAX_LEN) {
    return {
      isValid: false,
      error: `Description exceeds maximum limit of ${GOAL_BOUNDS.DESC_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  const category = (input.category || 'General').trim() || 'General';
  const type = Object.values(GOAL_TYPES).includes(input.type)
    ? input.type
    : GOAL_TYPES.TARGET_COUNT;

  let targetValue = Number(input.targetValue);
  if (isNaN(targetValue) || targetValue <= 0) {
    targetValue = type === GOAL_TYPES.PERCENTAGE ? 100 : 1;
  }

  let currentValue = Number(input.currentValue);
  if (isNaN(currentValue) || currentValue < 0) {
    currentValue = 0;
  }

  const unit = (input.unit || (type === GOAL_TYPES.PERCENTAGE ? '%' : ''))
    .trim()
    .slice(0, GOAL_BOUNDS.UNIT_MAX_LEN);

  // Validate milestones array
  let milestones = [];
  if (Array.isArray(input.milestones)) {
    milestones = input.milestones
      .slice(0, GOAL_BOUNDS.MAX_MILESTONES)
      .map((m, index) => ({
        id: m.id || `m_${Date.now()}_${index}`,
        title: (typeof m === 'string' ? m : m.title || '')
          .trim()
          .slice(0, GOAL_BOUNDS.MILESTONE_TITLE_MAX_LEN),
        isCompleted: Boolean(m.isCompleted),
        dueDate: m.dueDate ? Number(m.dueDate) || null : null,
        completedAt: m.completedAt || (m.isCompleted ? Date.now() : null),
      }))
      .filter(m => m.title.length > 0);
  }

  // Linked tasks
  let linkedTaskIds = [];
  if (Array.isArray(input.linkedTaskIds)) {
    linkedTaskIds = input.linkedTaskIds
      .map(id => String(id).trim())
      .filter(Boolean)
      .slice(0, GOAL_BOUNDS.MAX_LINKED_TASKS);
  }

  return {
    isValid: true,
    error: null,
    sanitized: {
      title,
      description,
      category,
      type,
      targetValue,
      currentValue,
      unit,
      startDate: input.startDate ? Number(input.startDate) : Date.now(),
      targetDate: input.targetDate ? Number(input.targetDate) : null,
      isCompleted: Boolean(input.isCompleted),
      isArchived: Boolean(input.isArchived),
      milestones,
      linkedTaskIds,
      progressUpdates: Array.isArray(input.progressUpdates)
        ? input.progressUpdates
        : [],
    },
  };
};

/**
 * Calculates deterministic progress percentage and status for a goal
 * @param {object} goal
 * @param {Array} tasks - Optional active tasks from TaskContext for task-derived goals
 * @returns {{
 *   progress: number,
 *   currentDisplay: string,
 *   targetDisplay: string,
 *   isOverdue: boolean,
 *   isAtRisk: boolean,
 *   overdueMilestonesCount: number,
 *   status: string
 * }}
 */
export const calculateGoalProgress = (goal, tasks = []) => {
  if (!goal) {
    return {
      progress: 0,
      currentDisplay: '0',
      targetDisplay: '0',
      isOverdue: false,
      isAtRisk: false,
      overdueMilestonesCount: 0,
      status: 'in_progress',
    };
  }

  let progress = 0;
  let currentVal = Number(goal.currentValue) || 0;
  let targetVal = Number(goal.targetValue) || 1;

  if (goal.type === GOAL_TYPES.PERCENTAGE) {
    targetVal = targetVal > 0 ? targetVal : 100;
    progress = Math.min(
      100,
      Math.max(0, Math.round((currentVal / targetVal) * 100)),
    );
  } else if (goal.type === GOAL_TYPES.TARGET_COUNT) {
    targetVal = targetVal > 0 ? targetVal : 1;
    progress = Math.min(
      100,
      Math.max(0, Math.round((currentVal / targetVal) * 100)),
    );
  } else if (goal.type === GOAL_TYPES.MILESTONES) {
    const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
    if (milestones.length === 0) {
      progress = goal.isCompleted ? 100 : 0;
    } else {
      const completedCount = milestones.filter(m => m.isCompleted).length;
      targetVal = milestones.length;
      currentVal = completedCount;
      progress = Math.round((completedCount / milestones.length) * 100);
    }
  } else if (goal.type === GOAL_TYPES.TASK_DERIVED) {
    const linkedIds = Array.isArray(goal.linkedTaskIds)
      ? goal.linkedTaskIds
      : [];
    if (linkedIds.length === 0) {
      progress = goal.isCompleted ? 100 : 0;
    } else {
      targetVal = linkedIds.length;
      const completedLinkedTasks = tasks.filter(
        t => linkedIds.includes(String(t.id)) && t.completed,
      ).length;
      currentVal = completedLinkedTasks;
      progress = Math.round((completedLinkedTasks / linkedIds.length) * 100);
    }
  }

  const now = Date.now();
  const hasTargetDate = goal.targetDate && Number(goal.targetDate) > 0;
  const isOverdue = hasTargetDate && goal.targetDate < now && progress < 100;

  // At risk if due within 7 days, progress < 50%, and not already overdue
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const isAtRisk =
    !isOverdue &&
    hasTargetDate &&
    goal.targetDate - now <= SEVEN_DAYS_MS &&
    progress < 50;

  // Count overdue uncompleted milestones
  const overdueMilestonesCount = (goal.milestones || []).filter(
    m => !m.isCompleted && m.dueDate && Number(m.dueDate) < now,
  ).length;

  let status = 'in_progress';
  if (goal.isArchived) {
    status = 'archived';
  } else if (goal.isCompleted || progress >= 100) {
    status = 'completed';
  } else if (isOverdue) {
    status = 'overdue';
  } else if (isAtRisk) {
    status = 'at_risk';
  }

  const unitSuffix = goal.unit ? ` ${goal.unit}` : '';

  return {
    progress: Math.min(100, Math.max(0, progress)),
    currentDisplay: `${currentVal}${unitSuffix}`,
    targetDisplay: `${targetVal}${unitSuffix}`,
    isOverdue,
    isAtRisk,
    overdueMilestonesCount,
    status,
  };
};

const SAMPLE_GOALS = [
  {
    id: 'goal_sample_1',
    title: 'Complete 50km Running Challenge 🏃',
    description:
      'Build aerobic endurance and cardiovascular health with weekly 10km runs.',
    category: 'Health',
    type: GOAL_TYPES.TARGET_COUNT,
    targetValue: 50,
    currentValue: 22,
    unit: 'km',
    startDate: Date.now() - 3600000 * 24 * 7,
    targetDate: Date.now() + 3600000 * 24 * 21,
    isCompleted: false,
    isArchived: false,
    milestones: [
      {
        id: 'm_1',
        title: 'First 10km baseline run',
        isCompleted: true,
        dueDate: Date.now() - 3600000 * 24 * 5,
        completedAt: Date.now() - 3600000 * 24 * 5,
      },
      {
        id: 'm_2',
        title: '25km half-way checkpoint',
        isCompleted: false,
        dueDate: Date.now() + 3600000 * 24 * 5,
        completedAt: null,
      },
      {
        id: 'm_3',
        title: 'Final 50km endurance run',
        isCompleted: false,
        dueDate: Date.now() + 3600000 * 24 * 21,
        completedAt: null,
      },
    ],
    linkedTaskIds: [],
    progressUpdates: [
      {
        id: 'pu_1',
        date: Date.now() - 3600000 * 24 * 5,
        value: 10,
        previousValue: 0,
        note: 'Completed first 10km trail run',
      },
      {
        id: 'pu_2',
        date: Date.now() - 3600000 * 24 * 2,
        value: 22,
        previousValue: 10,
        note: 'Added 12km brisk morning tempo',
      },
    ],
    createdAt: Date.now() - 3600000 * 24 * 7,
    updatedAt: Date.now() - 3600000 * 24 * 2,
  },
  {
    id: 'goal_sample_2',
    title: 'Ship Mobile App MVP to Production 🚀',
    description:
      'Deliver reliable core task management, custom design system, notes, and measurable goals.',
    category: 'Work',
    type: GOAL_TYPES.MILESTONES,
    targetValue: 4,
    currentValue: 3,
    unit: 'milestones',
    startDate: Date.now() - 3600000 * 24 * 10,
    targetDate: Date.now() + 3600000 * 24 * 14,
    isCompleted: false,
    isArchived: false,
    milestones: [
      {
        id: 'm_21',
        title: 'Core Task Management (Phase 1)',
        isCompleted: true,
        dueDate: Date.now() - 3600000 * 24 * 8,
        completedAt: Date.now() - 3600000 * 24 * 8,
      },
      {
        id: 'm_22',
        title: 'Design System & A11y (Phase 2)',
        isCompleted: true,
        dueDate: Date.now() - 3600000 * 24 * 5,
        completedAt: Date.now() - 3600000 * 24 * 5,
      },
      {
        id: 'm_23',
        title: 'Personal Knowledge Notes (Phase 3)',
        isCompleted: true,
        dueDate: Date.now() - 3600000 * 24 * 1,
        completedAt: Date.now() - 3600000 * 24 * 1,
      },
      {
        id: 'm_24',
        title: 'Goals & Milestones (Phase 4)',
        isCompleted: false,
        dueDate: Date.now() + 3600000 * 24 * 5,
        completedAt: null,
      },
    ],
    linkedTaskIds: ['task_1'],
    progressUpdates: [
      {
        id: 'pu_21',
        date: Date.now() - 3600000 * 24 * 1,
        value: 3,
        previousValue: 0,
        note: 'Phases 1-3 fully verified and passing all automated test suites',
      },
    ],
    createdAt: Date.now() - 3600000 * 24 * 10,
    updatedAt: Date.now() - 3600000 * 24 * 1,
  },
];

export const GoalProvider = ({children}) => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [lastDeletedGoal, setLastDeletedGoal] = useState(null);

  // Hook into TaskContext for linked tasks updates
  const taskContext = useContext(TaskContext);
  const rawTasks = taskContext?.tasks;
  const tasks = useMemo(
    () => (Array.isArray(rawTasks) ? rawTasks : []),
    [rawTasks],
  );

  const loadGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try local storage first
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGoals(parsed);
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to sample goals
      setGoals(SAMPLE_GOALS);
      await AsyncStorage.setItem(
        GOALS_STORAGE_KEY,
        JSON.stringify(SAMPLE_GOALS),
      );
    } catch (e) {
      setError('Failed to load goals from local storage');
      setGoals(SAMPLE_GOALS);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const persistGoals = async updatedGoals => {
    try {
      await AsyncStorage.setItem(
        GOALS_STORAGE_KEY,
        JSON.stringify(updatedGoals),
      );
    } catch (e) {
      setError('Failed to persist goals to storage');
    }
  };

  const addGoal = async goalInput => {
    const {
      isValid,
      error: validationError,
      sanitized,
    } = validateGoalInput(goalInput);
    if (!isValid) {
      setError(validationError);
      return {success: false, error: validationError};
    }

    const newGoal = {
      ...sanitized,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newGoal, ...goals];
    setGoals(updated);
    await persistGoals(updated);
    apiService.pushGoal(newGoal);

    return {success: true, goal: newGoal};
  };

  const updateGoal = async (goalId, updates) => {
    const existing = goals.find(g => g.id === goalId);
    if (!existing) {
      setError('Goal not found');
      return {success: false, error: 'Goal not found'};
    }

    const merged = {...existing, ...updates};
    const {
      isValid,
      error: validationError,
      sanitized,
    } = validateGoalInput(merged);
    if (!isValid) {
      setError(validationError);
      return {success: false, error: validationError};
    }

    const updatedGoal = {
      ...existing,
      ...sanitized,
      id: existing.id,
      updatedAt: Date.now(),
    };

    const updated = goals.map(g => (g.id === goalId ? updatedGoal : g));
    setGoals(updated);
    await persistGoals(updated);
    apiService.updateGoal(updatedGoal);

    return {success: true, goal: updatedGoal};
  };

  const deleteGoal = async goalId => {
    const goalToDelete = goals.find(g => g.id === goalId);
    if (!goalToDelete) {
      return {success: false, error: 'Goal not found'};
    }

    setLastDeletedGoal(goalToDelete);
    const updated = goals.filter(g => g.id !== goalId);
    setGoals(updated);
    await persistGoals(updated);
    apiService.deleteGoal(goalId);

    return {success: true, deletedGoal: goalToDelete};
  };

  const undoDeleteGoal = async () => {
    if (!lastDeletedGoal) {
      return {success: false, message: 'No goal to recover'};
    }

    const restoredGoal = lastDeletedGoal;
    const updated = [restoredGoal, ...goals];
    setGoals(updated);
    setLastDeletedGoal(null);
    await persistGoals(updated);
    apiService.pushGoal(restoredGoal);

    return {success: true, restoredGoal};
  };

  const toggleArchiveGoal = async goalId => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    return await updateGoal(goalId, {
      isArchived: !goal.isArchived,
    });
  };

  const toggleCompleteGoal = async goalId => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const nextCompleted = !goal.isCompleted;
    return await updateGoal(goalId, {
      isCompleted: nextCompleted,
      currentValue: nextCompleted ? goal.targetValue : goal.currentValue,
    });
  };

  const recordProgressUpdate = async (goalId, newValue, note = '') => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const numericValue = Number(newValue);
    if (isNaN(numericValue) || numericValue < 0) {
      return {
        success: false,
        error: 'Progress value must be a non-negative number',
      };
    }

    const progressUpdateEntry = {
      id: `pu_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: Date.now(),
      value: numericValue,
      previousValue: goal.currentValue,
      note: String(note || '')
        .trim()
        .slice(0, 500),
    };

    const isNowCompleted = numericValue >= goal.targetValue;
    const history = Array.isArray(goal.progressUpdates)
      ? [progressUpdateEntry, ...goal.progressUpdates]
      : [progressUpdateEntry];

    return await updateGoal(goalId, {
      currentValue: numericValue,
      isCompleted: isNowCompleted || goal.isCompleted,
      progressUpdates: history,
    });
  };

  const addMilestone = async (goalId, milestoneTitle, dueDate = null) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const cleanTitle = (milestoneTitle || '').trim();
    if (!cleanTitle) {
      return {success: false, error: 'Milestone title is required'};
    }

    const existingMilestones = Array.isArray(goal.milestones)
      ? goal.milestones
      : [];
    if (existingMilestones.length >= GOAL_BOUNDS.MAX_MILESTONES) {
      return {
        success: false,
        error: `Cannot exceed ${GOAL_BOUNDS.MAX_MILESTONES} milestones per goal`,
      };
    }

    const newMilestone = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: cleanTitle.slice(0, GOAL_BOUNDS.MILESTONE_TITLE_MAX_LEN),
      isCompleted: false,
      dueDate: dueDate ? Number(dueDate) : null,
      completedAt: null,
    };

    const updatedMilestones = [...existingMilestones, newMilestone];
    return await updateGoal(goalId, {
      milestones: updatedMilestones,
    });
  };

  const toggleMilestone = async (goalId, milestoneId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
    const updatedMilestones = milestones.map(m => {
      if (m.id === milestoneId) {
        const nextState = !m.isCompleted;
        return {
          ...m,
          isCompleted: nextState,
          completedAt: nextState ? Date.now() : null,
        };
      }
      return m;
    });

    const allCompleted =
      updatedMilestones.length > 0 &&
      updatedMilestones.every(m => m.isCompleted);

    return await updateGoal(goalId, {
      milestones: updatedMilestones,
      isCompleted: allCompleted,
    });
  };

  const removeMilestone = async (goalId, milestoneId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const milestones = (goal.milestones || []).filter(
      m => m.id !== milestoneId,
    );
    return await updateGoal(goalId, {
      milestones,
    });
  };

  const linkTaskToGoal = async (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const currentLinks = Array.isArray(goal.linkedTaskIds)
      ? goal.linkedTaskIds
      : [];
    if (currentLinks.includes(String(taskId))) {
      return {success: true, goal};
    }

    const updatedLinks = [...currentLinks, String(taskId)];
    return await updateGoal(goalId, {
      linkedTaskIds: updatedLinks,
    });
  };

  const unlinkTaskFromGoal = async (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return {success: false, error: 'Goal not found'};
    }

    const currentLinks = Array.isArray(goal.linkedTaskIds)
      ? goal.linkedTaskIds
      : [];
    const updatedLinks = currentLinks.filter(id => id !== String(taskId));
    return await updateGoal(goalId, {
      linkedTaskIds: updatedLinks,
    });
  };

  // Memoized goals with current dynamic progress calculation
  const enrichedGoals = useMemo(() => {
    return goals.map(goal => {
      const stats = calculateGoalProgress(goal, tasks);
      return {
        ...goal,
        stats,
      };
    });
  }, [goals, tasks]);

  const value = {
    goals: enrichedGoals,
    rawGoals: goals,
    isLoading,
    isLoaded,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    undoDeleteGoal,
    toggleArchiveGoal,
    toggleCompleteGoal,
    recordProgressUpdate,
    addMilestone,
    toggleMilestone,
    removeMilestone,
    linkTaskToGoal,
    unlinkTaskFromGoal,
    reloadGoals: loadGoals,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
};

export default GoalContext;

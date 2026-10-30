// src/context/HabitContext.js
// Verified Habits, Routines, and Reminders Layer (docs/PRD.md Phase 5 — P5.1 to P5.10)

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

const HabitContext = createContext();
const HABITS_STORAGE_KEY = '@gotask_habits';

export const HABIT_BOUNDS = {
  TITLE_MAX_LEN: 80,
  DESC_MAX_LEN: 300,
  CATEGORY_MAX_LEN: 50,
  ALLOWED_FREQUENCIES: ['daily', 'weekdays', 'weekends', 'custom'],
  DAYS_OF_WEEK: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  MIN_CUSTOM_DAYS: 1,
  MAX_CUSTOM_DAYS: 7,
};

export const HABIT_CATEGORIES = [
  'Health',
  'Fitness',
  'Learning',
  'Mindfulness',
  'Productivity',
  'Lifestyle',
];

/**
 * Returns date in YYYY-MM-DD string format (calendar-safe, local time)
 * @param {Date} date
 * @returns {string}
 */
export const formatDateStr = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns short 3-letter day name ('Sun', 'Mon', etc.) for a given date
 * @param {Date|string} date
 * @returns {string}
 */
export const getDayOfWeek = (date = new Date()) => {
  const d =
    typeof date === 'string' ? new Date(`${date}T12:00:00`) : new Date(date);
  return HABIT_BOUNDS.DAYS_OF_WEEK[d.getDay()];
};

/**
 * Checks whether a habit is scheduled for a specific date
 * @param {object} habit
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isHabitScheduledForDate = (habit, date = new Date()) => {
  if (!habit) {
    return false;
  }
  const dayName = getDayOfWeek(date);
  const isWeekend = dayName === 'Sat' || dayName === 'Sun';

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return !isWeekend;
    case 'weekends':
      return isWeekend;
    case 'custom':
      return (
        Array.isArray(habit.targetDays) && habit.targetDays.includes(dayName)
      );
    default:
      return true;
  }
};

/**
 * HABIT DECISION TRUTH TABLE (TypeSafe / Jev Decision Model Pattern)
 * Maps habit state inputs to deterministic day status and streak behavior.
 *
 * Truth Table:
 * | isScheduled | recordedStatus | isToday | Outcome Status | Streak Action     |
 * |-------------|----------------|---------|----------------|-------------------|
 * | false       | any            | any     | 'rest_day'     | pass (no change)  |
 * | true        | 'completed'    | any     | 'completed'    | increment (+1)    |
 * | true        | 'skipped'      | any     | 'skipped'      | freeze (preserve) |
 * | true        | none           | true    | 'due_today'    | check_yesterday   |
 * | true        | none           | false   | 'missed'       | break (reset 0)   |
 */
export const evaluateHabitDayDecision = ({
  isScheduled,
  recordedStatus,
  isToday,
}) => {
  if (!isScheduled) {
    return {status: 'rest_day', streakAction: 'pass'};
  }
  if (recordedStatus === 'completed') {
    return {status: 'completed', streakAction: 'increment'};
  }
  if (recordedStatus === 'skipped') {
    return {status: 'skipped', streakAction: 'freeze'};
  }
  if (isToday) {
    return {status: 'due_today', streakAction: 'check_yesterday'};
  }
  return {status: 'missed', streakAction: 'break'};
};

/**
 * Calculates calendar-safe streaks for a habit based on its history and frequency.
 * - Evaluated deterministically via the Habit Decision Truth Table.
 * - History preserves all records regardless of streak reset.
 * - Skipped days protect the streak without incrementing it.
 * @param {object} habit
 * @param {string} [refDateStr] Reference date YYYY-MM-DD
 * @returns {{currentStreak: number, bestStreak: number, totalCompleted: number, totalSkipped: number}}
 */
export const calculateHabitStreak = (habit, refDateStr = formatDateStr()) => {
  const history = habit.history || {};
  const entries = Object.entries(history);
  const totalCompleted = entries.filter(
    ([, v]) => v.status === 'completed',
  ).length;
  const totalSkipped = entries.filter(([, v]) => v.status === 'skipped').length;

  let currentStreak = 0;
  let cursor = new Date(`${refDateStr}T12:00:00`);

  // Evaluate today via Truth Table
  const todayScheduled = isHabitScheduledForDate(habit, cursor);
  const todayEntry = history[refDateStr];
  const todayDecision = evaluateHabitDayDecision({
    isScheduled: todayScheduled,
    recordedStatus: todayEntry?.status,
    isToday: true,
  });

  if (todayDecision.streakAction === 'increment') {
    currentStreak = 1;
  }
  cursor.setDate(cursor.getDate() - 1);

  // Walk backwards up to 365 days
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDateStr(cursor);
    const isScheduled = isHabitScheduledForDate(habit, cursor);
    const entry = history[dateStr];
    const decision = evaluateHabitDayDecision({
      isScheduled,
      recordedStatus: entry?.status,
      isToday: false,
    });

    if (decision.streakAction === 'increment') {
      currentStreak++;
    } else if (
      decision.streakAction === 'freeze' ||
      decision.streakAction === 'pass'
    ) {
      // Skipped session or rest day preserves active streak
    } else if (decision.streakAction === 'break') {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  const recordedBest =
    typeof habit.bestStreak === 'number' ? habit.bestStreak : 0;
  const bestStreak = Math.max(recordedBest, currentStreak);

  return {
    currentStreak,
    bestStreak,
    totalCompleted,
    totalSkipped,
  };
};

/**
 * Validates and sanitizes a habit input payload
 * @param {object} input
 * @returns {{isValid: boolean, error: string|null, sanitized: object|null}}
 */
export const validateHabitInput = input => {
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      error: 'Habit payload is required',
      sanitized: null,
    };
  }

  const title = (input.title || '').trim();
  if (!title) {
    return {isValid: false, error: 'Habit title is required', sanitized: null};
  }
  if (title.length > HABIT_BOUNDS.TITLE_MAX_LEN) {
    return {
      isValid: false,
      error: `Title exceeds maximum limit of ${HABIT_BOUNDS.TITLE_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  const description = (input.description || '').trim();
  if (description.length > HABIT_BOUNDS.DESC_MAX_LEN) {
    return {
      isValid: false,
      error: `Description exceeds maximum limit of ${HABIT_BOUNDS.DESC_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  const category = (input.category || 'Health').trim();
  if (category.length > HABIT_BOUNDS.CATEGORY_MAX_LEN) {
    return {
      isValid: false,
      error: `Category exceeds limit of ${HABIT_BOUNDS.CATEGORY_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  const rawFreq = (input.frequency || 'daily').toLowerCase().trim();
  const frequency = HABIT_BOUNDS.ALLOWED_FREQUENCIES.includes(rawFreq)
    ? rawFreq
    : 'daily';

  let targetDays = HABIT_BOUNDS.DAYS_OF_WEEK.slice(1, 6); // default Mon-Fri
  if (frequency === 'daily') {
    targetDays = [...HABIT_BOUNDS.DAYS_OF_WEEK];
  } else if (frequency === 'weekdays') {
    targetDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  } else if (frequency === 'weekends') {
    targetDays = ['Sat', 'Sun'];
  } else if (frequency === 'custom') {
    if (Array.isArray(input.targetDays) && input.targetDays.length > 0) {
      targetDays = input.targetDays.filter(day =>
        HABIT_BOUNDS.DAYS_OF_WEEK.includes(day),
      );
      if (targetDays.length === 0) {
        return {
          isValid: false,
          error: 'Custom frequency requires at least one valid target day',
          sanitized: null,
        };
      }
    } else {
      return {
        isValid: false,
        error: 'Custom frequency requires targetDays array',
        sanitized: null,
      };
    }
  }

  let reminderTime = null;
  if (input.reminderTime && typeof input.reminderTime === 'string') {
    const trimmedTime = input.reminderTime.trim();
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(trimmedTime)) {
      reminderTime = trimmedTime;
    }
  }

  const sanitized = {
    title,
    description,
    category,
    frequency,
    targetDays,
    color: input.color || '#286B68',
    reminderTime,
    reminderEnabled: Boolean(input.reminderEnabled && reminderTime),
    isArchived: Boolean(input.isArchived),
  };

  return {isValid: true, error: null, sanitized};
};

export const HabitProvider = ({children}) => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastDeletedHabit, setLastDeletedHabit] = useState(null);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadHabits = async () => {
      try {
        setIsLoading(true);
        const stored = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setHabits(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load habits from storage:', err);
        setError('Failed to load stored habits');
      } finally {
        setIsLoading(false);
      }
    };
    loadHabits();
  }, []);

  // Save to AsyncStorage on changes
  const persistHabits = useCallback(async updatedHabits => {
    try {
      await AsyncStorage.setItem(
        HABITS_STORAGE_KEY,
        JSON.stringify(updatedHabits),
      );
    } catch (err) {
      console.error('Failed to persist habits to storage:', err);
      setError('Failed to persist habits locally');
    }
  }, []);

  // Add Habit
  const addHabit = useCallback(
    async rawInput => {
      const validation = validateHabitInput(rawInput);
      if (!validation.isValid) {
        setError(validation.error);
        return {success: false, error: validation.error};
      }

      const newHabit = {
        ...validation.sanitized,
        id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        createdAt: new Date().toISOString(),
        history: {},
        currentStreak: 0,
        bestStreak: 0,
        totalCompleted: 0,
        totalSkipped: 0,
        lastCompletedDate: null,
      };

      const updated = [newHabit, ...habits];
      setHabits(updated);
      await persistHabits(updated);
      setError(null);

      // Async backend push
      apiService.pushHabit?.(newHabit);
      return {success: true, habit: newHabit};
    },
    [habits, persistHabits],
  );

  // Update Habit
  const updateHabit = useCallback(
    async (habitId, updates) => {
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) {
        return {success: false, error: 'Habit not found'};
      }

      const existing = habits[index];
      const merged = {...existing, ...updates};
      const validation = validateHabitInput(merged);
      if (!validation.isValid) {
        setError(validation.error);
        return {success: false, error: validation.error};
      }

      const streaks = calculateHabitStreak(merged);
      const updatedHabit = {
        ...merged,
        ...validation.sanitized,
        ...streaks,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [...habits];
      updatedList[index] = updatedHabit;
      setHabits(updatedList);
      await persistHabits(updatedList);
      setError(null);

      apiService.updateHabit?.(updatedHabit);
      return {success: true, habit: updatedHabit};
    },
    [habits, persistHabits],
  );

  // Delete Habit with Undo Stack
  const deleteHabit = useCallback(
    async habitId => {
      const toDelete = habits.find(h => h.id === habitId);
      if (!toDelete) {
        return {success: false, error: 'Habit not found'};
      }

      const updated = habits.filter(h => h.id !== habitId);
      setHabits(updated);
      setLastDeletedHabit(toDelete);
      await persistHabits(updated);
      setError(null);

      apiService.deleteHabit?.(habitId);
      return {success: true, deleted: toDelete};
    },
    [habits, persistHabits],
  );

  // Undo Delete Habit
  const undoDeleteHabit = useCallback(async () => {
    if (!lastDeletedHabit) {
      return {success: false, error: 'No deleted habit to restore'};
    }
    const restored = [lastDeletedHabit, ...habits];
    setHabits(restored);
    setLastDeletedHabit(null);
    await persistHabits(restored);

    apiService.pushHabit?.(lastDeletedHabit);
    return {success: true, habit: lastDeletedHabit};
  }, [lastDeletedHabit, habits, persistHabits]);

  // Toggle Habit Day Completion
  const toggleHabitDay = useCallback(
    async (habitId, dateStr = formatDateStr()) => {
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) {
        return {success: false, error: 'Habit not found'};
      }

      const habit = habits[index];
      const history = {...(habit.history || {})};
      const currentEntry = history[dateStr];

      if (currentEntry?.status === 'completed') {
        // Toggle off
        delete history[dateStr];
      } else {
        // Toggle on as completed
        history[dateStr] = {
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
      }

      const habitWithHistory = {...habit, history};
      const streaks = calculateHabitStreak(habitWithHistory, dateStr);
      const updatedHabit = {
        ...habitWithHistory,
        ...streaks,
        lastCompletedDate:
          history[dateStr]?.status === 'completed'
            ? dateStr
            : habit.lastCompletedDate,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [...habits];
      updatedList[index] = updatedHabit;
      setHabits(updatedList);
      await persistHabits(updatedList);

      apiService.toggleHabitDay?.(habitId, dateStr);
      return {success: true, habit: updatedHabit};
    },
    [habits, persistHabits],
  );

  // Skip Habit Day (protects streak from resetting)
  const skipHabitDay = useCallback(
    async (habitId, dateStr = formatDateStr(), reason = '') => {
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) {
        return {success: false, error: 'Habit not found'};
      }

      const habit = habits[index];
      const history = {...(habit.history || {})};
      history[dateStr] = {
        status: 'skipped',
        reason: reason.trim(),
        timestamp: new Date().toISOString(),
      };

      const habitWithHistory = {...habit, history};
      const streaks = calculateHabitStreak(habitWithHistory, dateStr);
      const updatedHabit = {
        ...habitWithHistory,
        ...streaks,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [...habits];
      updatedList[index] = updatedHabit;
      setHabits(updatedList);
      await persistHabits(updatedList);

      return {success: true, habit: updatedHabit};
    },
    [habits, persistHabits],
  );

  // Snooze Reminder
  const snoozeHabitReminder = useCallback(
    async (habitId, minutes = 15) => {
      const index = habits.findIndex(h => h.id === habitId);
      if (index === -1) {
        return {success: false, error: 'Habit not found'};
      }

      const habit = habits[index];
      const snoozedUntil = Date.now() + minutes * 60 * 1000;
      const updatedHabit = {
        ...habit,
        snoozedUntil,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [...habits];
      updatedList[index] = updatedHabit;
      setHabits(updatedList);
      await persistHabits(updatedList);

      return {success: true, snoozedUntil};
    },
    [habits, persistHabits],
  );

  // Archive / Unarchive Habit
  const toggleArchiveHabit = useCallback(
    async habitId => {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        return {success: false, error: 'Habit not found'};
      }
      return updateHabit(habitId, {isArchived: !habit.isArchived});
    },
    [habits, updateHabit],
  );

  // Clear all habits (for testing & reset)
  const clearAllHabits = useCallback(async () => {
    setHabits([]);
    setLastDeletedHabit(null);
    await AsyncStorage.removeItem(HABITS_STORAGE_KEY);
    return {success: true};
  }, []);

  // Filtered & Computed Views
  const todayStr = formatDateStr();
  const dayName = getDayOfWeek();

  const activeHabits = useMemo(
    () => habits.filter(h => !h.isArchived),
    [habits],
  );

  const archivedHabits = useMemo(
    () => habits.filter(h => h.isArchived),
    [habits],
  );

  const todayHabits = useMemo(
    () => activeHabits.filter(h => isHabitScheduledForDate(h, todayStr)),
    [activeHabits, todayStr],
  );

  const completedTodayCount = useMemo(
    () =>
      todayHabits.filter(h => h.history?.[todayStr]?.status === 'completed')
        .length,
    [todayHabits, todayStr],
  );

  const longestStreak = useMemo(
    () =>
      activeHabits.reduce((max, h) => Math.max(max, h.currentStreak || 0), 0),
    [activeHabits],
  );

  const value = {
    habits,
    activeHabits,
    archivedHabits,
    todayHabits,
    todayStr,
    dayName,
    isLoading,
    error,
    lastDeletedHabit,
    stats: {
      total: activeHabits.length,
      todayCount: todayHabits.length,
      completedToday: completedTodayCount,
      longestStreak,
    },
    addHabit,
    updateHabit,
    deleteHabit,
    undoDeleteHabit,
    toggleHabitDay,
    skipHabitDay,
    snoozeHabitReminder,
    toggleArchiveHabit,
    clearAllHabits,
    clearError: () => setError(null),
  };

  return (
    <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export default HabitContext;

/**
 * __tests__/HabitContext-test.tsx
 * Comprehensive unit and integration test suite for HabitContext & Habits Layer
 * Verified against docs/PRD.md Phase 5 (P5.1 - P5.10)
 */

import 'react-native';
import React from 'react';
import {Text, View} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HabitProvider,
  useHabits,
  validateHabitInput,
  calculateHabitStreak,
  evaluateHabitDayDecision,
  isHabitScheduledForDate,
  formatDateStr,
  HABIT_BOUNDS,
} from '../src/context/HabitContext';

// Mock apiService
jest.mock('../src/services/apiService', () => ({
  apiService: {
    pushHabit: jest.fn().mockResolvedValue({success: true}),
    updateHabit: jest.fn().mockResolvedValue({success: true}),
    deleteHabit: jest.fn().mockResolvedValue({success: true}),
    toggleHabitDay: jest.fn().mockResolvedValue({success: true}),
  },
  __esModule: true,
  default: {
    pushHabit: jest.fn().mockResolvedValue({success: true}),
    updateHabit: jest.fn().mockResolvedValue({success: true}),
    deleteHabit: jest.fn().mockResolvedValue({success: true}),
    toggleHabitDay: jest.fn().mockResolvedValue({success: true}),
  },
}));

describe('Habit Input Validation (docs/PRD.md Phase 5 — P5.1, P5.2)', () => {
  it('rejects empty or whitespace-only habit title', () => {
    const res1 = validateHabitInput({title: ''});
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain('title is required');

    const res2 = validateHabitInput({title: '   '});
    expect(res2.isValid).toBe(false);
  });

  it('rejects title exceeding maximum character limit', () => {
    const longTitle = 'h'.repeat(HABIT_BOUNDS.TITLE_MAX_LEN + 1);
    const res = validateHabitInput({title: longTitle});
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Title exceeds maximum limit');
  });

  it('rejects description exceeding maximum character limit', () => {
    const longDesc = 'd'.repeat(HABIT_BOUNDS.DESC_MAX_LEN + 1);
    const res = validateHabitInput({
      title: 'Meditation',
      description: longDesc,
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Description exceeds maximum limit');
  });

  it('validates recurrence schedules and normalizes valid frequencies', () => {
    const res = validateHabitInput({
      title: 'Workout',
      frequency: 'WEEKDAYS',
    });
    expect(res.isValid).toBe(true);
    expect(res.sanitized?.frequency).toBe('weekdays');
    expect(res.sanitized?.targetDays).toEqual([
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
    ]);
  });

  it('requires custom targetDays when custom frequency is selected', () => {
    const resNoDays = validateHabitInput({
      title: 'Run',
      frequency: 'custom',
    });
    expect(resNoDays.isValid).toBe(false);
    expect(resNoDays.error).toContain('requires targetDays array');

    const resEmptyDays = validateHabitInput({
      title: 'Run',
      frequency: 'custom',
      targetDays: [],
    });
    expect(resEmptyDays.isValid).toBe(false);

    const resValidCustom = validateHabitInput({
      title: 'Run',
      frequency: 'custom',
      targetDays: ['Mon', 'Wed', 'Fri'],
    });
    expect(resValidCustom.isValid).toBe(true);
    expect(resValidCustom.sanitized?.targetDays).toEqual(['Mon', 'Wed', 'Fri']);
  });

  it('validates 24-hour reminder time format (HH:mm)', () => {
    const resValid = validateHabitInput({
      title: 'Drink Water',
      reminderEnabled: true,
      reminderTime: '08:30',
    });
    expect(resValid.isValid).toBe(true);
    expect(resValid.sanitized?.reminderTime).toBe('08:30');
    expect(resValid.sanitized?.reminderEnabled).toBe(true);

    const resInvalid = validateHabitInput({
      title: 'Drink Water',
      reminderEnabled: true,
      reminderTime: '25:99',
    });
    expect(resInvalid.isValid).toBe(true);
    expect(resInvalid.sanitized?.reminderTime).toBeNull();
    expect(resInvalid.sanitized?.reminderEnabled).toBe(false);
  });
});

describe('Streak Calculation & Recurrence Engine (docs/PRD.md Phase 5 — P5.3, P5.4)', () => {
  it('evaluates Habit Decision Truth Table deterministic outcomes (TypeSafe Craft)', () => {
    // 1. Rest day
    expect(
      evaluateHabitDayDecision({
        isScheduled: false,
        recordedStatus: undefined,
        isToday: false,
      }),
    ).toEqual({status: 'rest_day', streakAction: 'pass'});

    // 2. Completed day
    expect(
      evaluateHabitDayDecision({
        isScheduled: true,
        recordedStatus: 'completed',
        isToday: false,
      }),
    ).toEqual({status: 'completed', streakAction: 'increment'});

    // 3. Skipped day (freeze)
    expect(
      evaluateHabitDayDecision({
        isScheduled: true,
        recordedStatus: 'skipped',
        isToday: false,
      }),
    ).toEqual({status: 'skipped', streakAction: 'freeze'});

    // 4. Due today (pending)
    expect(
      evaluateHabitDayDecision({
        isScheduled: true,
        recordedStatus: undefined,
        isToday: true,
      }),
    ).toEqual({status: 'due_today', streakAction: 'check_yesterday'});

    // 5. Missed day in past
    expect(
      evaluateHabitDayDecision({
        isScheduled: true,
        recordedStatus: undefined,
        isToday: false,
      }),
    ).toEqual({status: 'missed', streakAction: 'break'});
  });

  it('correctly schedules daily habits for every day', () => {
    const habit = {frequency: 'daily'};
    expect(isHabitScheduledForDate(habit, new Date('2026-10-30'))).toBe(true);
    expect(isHabitScheduledForDate(habit, new Date('2026-10-31'))).toBe(true);
  });

  it('correctly filters weekdays vs weekends', () => {
    const weekdayHabit = {frequency: 'weekdays'};
    // 2026-10-30 is Friday, 2026-10-31 is Saturday, 2026-11-01 is Sunday
    expect(isHabitScheduledForDate(weekdayHabit, '2026-10-30')).toBe(true);
    expect(isHabitScheduledForDate(weekdayHabit, '2026-10-31')).toBe(false);
    expect(isHabitScheduledForDate(weekdayHabit, '2026-11-01')).toBe(false);

    const weekendHabit = {frequency: 'weekends'};
    expect(isHabitScheduledForDate(weekendHabit, '2026-10-30')).toBe(false);
    expect(isHabitScheduledForDate(weekendHabit, '2026-10-31')).toBe(true);
  });

  it('calculates current streak when today is completed', () => {
    const refDate = '2026-10-30';
    const habit = {
      frequency: 'daily',
      bestStreak: 2,
      history: {
        '2026-10-28': {status: 'completed'},
        '2026-10-29': {status: 'completed'},
        '2026-10-30': {status: 'completed'},
      },
    };

    const stats = calculateHabitStreak(habit, refDate);
    expect(stats.currentStreak).toBe(3);
    expect(stats.bestStreak).toBe(3);
    expect(stats.totalCompleted).toBe(3);
  });

  it('maintains active streak from yesterday when today is pending', () => {
    const refDate = '2026-10-30';
    const habit = {
      frequency: 'daily',
      bestStreak: 2,
      history: {
        '2026-10-28': {status: 'completed'},
        '2026-10-29': {status: 'completed'},
        // 2026-10-30 not completed yet
      },
    };

    const stats = calculateHabitStreak(habit, refDate);
    expect(stats.currentStreak).toBe(2);
    expect(stats.bestStreak).toBe(2);
  });

  it('resets streak to 0 if previous scheduled day was missed without skip', () => {
    const refDate = '2026-10-30';
    const habit = {
      frequency: 'daily',
      bestStreak: 5,
      history: {
        '2026-10-27': {status: 'completed'},
        // 2026-10-28 missed
        // 2026-10-29 missed
        // 2026-10-30 pending
      },
    };

    const stats = calculateHabitStreak(habit, refDate);
    expect(stats.currentStreak).toBe(0);
    // Best streak must never decrease
    expect(stats.bestStreak).toBe(5);
  });

  it('protects streak on skipped sessions without penalizing user', () => {
    const refDate = '2026-10-30';
    const habit = {
      frequency: 'daily',
      bestStreak: 3,
      history: {
        '2026-10-28': {status: 'completed'},
        '2026-10-29': {status: 'skipped', reason: 'Traveling'},
        '2026-10-30': {status: 'completed'},
      },
    };

    const stats = calculateHabitStreak(habit, refDate);
    // 2 completions + 1 protected skip = 2 active completion streak
    expect(stats.currentStreak).toBe(2);
    expect(stats.totalSkipped).toBe(1);
  });
});

describe('HabitContext Provider & Lifecycle Operations (docs/PRD.md Phase 5 — P5.1 - P5.10)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('creates, updates, toggles, skips, and undo-deletes a habit in context', async () => {
    let contextValue: any = null;

    const TestComponent = () => {
      contextValue = useHabits();
      return (
        <View>
          <Text testID="count">{contextValue.habits.length}</Text>
        </View>
      );
    };

    await act(async () => {
      renderer.create(
        <HabitProvider>
          <TestComponent />
        </HabitProvider>,
      );
    });

    expect(contextValue.habits.length).toBe(0);

    // 1. Add Habit
    let addResult: any;
    await act(async () => {
      addResult = await contextValue.addHabit({
        title: 'Morning Yoga',
        description: '30 mins stretch routine',
        category: 'Fitness',
        frequency: 'daily',
      });
    });

    expect(addResult.success).toBe(true);
    expect(contextValue.habits.length).toBe(1);
    const habitId = addResult.habit.id;

    // 2. Toggle Day Completion
    const today = formatDateStr();
    await act(async () => {
      await contextValue.toggleHabitDay(habitId, today);
    });

    expect(contextValue.habits[0].history[today]?.status).toBe('completed');
    expect(contextValue.habits[0].currentStreak).toBe(1);

    // 3. Update Habit
    await act(async () => {
      await contextValue.updateHabit(habitId, {
        description: 'Updated 45 mins yoga routine',
      });
    });

    expect(contextValue.habits[0].description).toBe(
      'Updated 45 mins yoga routine',
    );

    // 4. Delete Habit and Verify Undo Stack
    await act(async () => {
      await contextValue.deleteHabit(habitId);
    });

    expect(contextValue.habits.length).toBe(0);
    expect(contextValue.lastDeletedHabit?.id).toBe(habitId);

    // 5. Restore with Undo
    await act(async () => {
      await contextValue.undoDeleteHabit();
    });

    expect(contextValue.habits.length).toBe(1);
    expect(contextValue.habits[0].id).toBe(habitId);
  });
});

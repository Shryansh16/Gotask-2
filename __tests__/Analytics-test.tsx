/**
 * GOTask - Phase 8 Analytics & Motivation Test Suite
 * Tests PRD P8.1 to P8.9:
 * - Completed, overdue, and pending metrics with category breakdown (P8.1)
 * - Goal progress and milestone tracking (P8.2)
 * - Habit consistency and streaks (P8.3)
 * - Weekly velocity activity breakdown (P8.4)
 * - Planned vs. actual focus time comparison (P8.5)
 * - Achievements evaluation and badges (P8.6, P8.8)
 * - Motivational feedback (P8.7)
 * - Source record validation (P8.9)
 */

import {
  computeTaskMetrics,
  computeWeeklyActivity,
  computeHabitConsistency,
  computeGoalMetrics,
  computeTimeComparison,
  generateReviewSummary,
} from '../src/services/analyticsService';
import {
  evaluateAchievements,
  getMotivationalGreeting,
} from '../src/services/motivationService';

describe('Phase 8: Analytics & Motivation Suite', () => {
  describe('P8.1: Task Metrics & Category Breakdown', () => {
    test('computes completed, pending, overdue, and completion rates accurately', () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          completed: true,
          category: 'Work',
          priority: 'high',
        },
        {
          id: '2',
          title: 'Task 2',
          completed: true,
          category: 'Work',
          priority: 'medium',
        },
        {
          id: '3',
          title: 'Task 3',
          completed: false,
          category: 'Personal',
          priority: 'low',
          dueDate: 'Today',
        },
        {
          id: '4',
          title: 'Task 4',
          completed: false,
          category: 'Study',
          priority: 'high',
          dueDate: 'Yesterday',
        },
      ];

      const metrics = computeTaskMetrics(mockTasks);
      expect(metrics.hasData).toBe(true);
      expect(metrics.total).toBe(4);
      expect(metrics.completed).toBe(2);
      expect(metrics.pending).toBe(2);
      expect(metrics.overdue).toBe(1);
      expect(metrics.completionRate).toBe(50);

      // Category breakdown
      const workCat = metrics.categoryBreakdown.find(
        c => c.category === 'Work',
      );
      expect(workCat).toBeDefined();
      expect(workCat.total).toBe(2);
      expect(workCat.completed).toBe(2);
      expect(workCat.rate).toBe(100);

      expect(metrics.priorityBreakdown.high).toBe(2);
      expect(metrics.priorityBreakdown.medium).toBe(1);
      expect(metrics.priorityBreakdown.low).toBe(1);
    });

    test('explains empty data instead of bare zeroes (P8.9)', () => {
      const metrics = computeTaskMetrics([]);
      expect(metrics.hasData).toBe(false);
      expect(metrics.total).toBe(0);
      expect(metrics.explanation).toContain('No task records');
    });
  });

  describe('P8.2: Goal Progress & Milestone Metrics', () => {
    test('computes average goal progress and milestone completion totals', () => {
      const mockGoals = [
        {
          id: 'g1',
          title: 'Goal 1',
          progress: 100,
          milestones: [
            {id: 'm1', isCompleted: true},
            {id: 'm2', isCompleted: true},
          ],
        },
        {
          id: 'g2',
          title: 'Goal 2',
          progress: 50,
          milestones: [
            {id: 'm3', isCompleted: true},
            {id: 'm4', isCompleted: false},
          ],
        },
      ];

      const metrics = computeGoalMetrics(mockGoals);
      expect(metrics.hasData).toBe(true);
      expect(metrics.totalGoals).toBe(2);
      expect(metrics.completedGoals).toBe(1);
      expect(metrics.averageProgress).toBe(75);
      expect(metrics.milestonesTotal).toBe(4);
      expect(metrics.milestonesCompleted).toBe(3);
    });
  });

  describe('P8.3: Habit Consistency & Streaks', () => {
    test('summarizes habit active streaks, best streak, and consistency rates', () => {
      const mockHabits = [
        {
          id: 'h1',
          title: 'Morning Run',
          currentStreak: 5,
          bestStreak: 10,
          history: {'2026-10-29': 'completed', '2026-10-30': 'completed'},
        },
        {
          id: 'h2',
          title: 'Read Book',
          currentStreak: 3,
          bestStreak: 3,
          history: {'2026-10-30': 'completed'},
        },
      ];

      const metrics = computeHabitConsistency(mockHabits);
      expect(metrics.hasData).toBe(true);
      expect(metrics.activeCount).toBe(2);
      expect(metrics.longestStreak).toBe(10);
      expect(metrics.topHabit).toBe('Morning Run');
      expect(metrics.averageStreak).toBe(4);
    });
  });

  describe('P8.4: Weekly Activity Breakdown', () => {
    test('distributes activity across weekdays Mon-Sun and identifies peak day', () => {
      const mockTasks = [
        {id: '1', completed: true, completedAt: '2026-10-26T10:00:00Z'}, // Monday
        {id: '2', completed: true, completedAt: '2026-10-26T15:00:00Z'}, // Monday
        {id: '3', completed: true, completedAt: '2026-10-28T12:00:00Z'}, // Wednesday
      ];

      const activity = computeWeeklyActivity(mockTasks);
      expect(activity.days.length).toBe(7);
      expect(activity.hasData).toBe(true);
      expect(activity.peakDay).toBe('Mon');
      expect(activity.maxCount).toBe(2);
    });
  });

  describe('P8.5: Planned vs. Actual Time Comparison', () => {
    test('calculates planned estimated minutes against actual focus session minutes', () => {
      const mockTasks = [
        {id: '1', estimatedDuration: 60},
        {id: '2', estimatedDuration: 45},
      ];
      const mockSessions = [
        {id: 's1', durationMinutes: 25, completed: true},
        {id: 's2', durationMinutes: 25, completed: true},
      ];

      const comparison = computeTimeComparison(mockTasks, mockSessions);
      expect(comparison.hasData).toBe(true);
      expect(comparison.plannedMinutes).toBe(105);
      expect(comparison.actualFocusMinutes).toBe(50);
      expect(comparison.sessionCount).toBe(2);
      expect(comparison.ratio).toBe(48); // 50 / 105 ~ 48%

      const review = generateReviewSummary({
        tasks: mockTasks,
        focusSessions: mockSessions,
      });
      expect(review.highlights.length).toBeGreaterThan(0);
      expect(review.timeStats.actualFocusMinutes).toBe(50);
    });
  });

  describe('P8.6 & P8.8: Achievements & Gamification Engine', () => {
    test('unlocks achievements strictly when criteria are satisfied', () => {
      const data = {
        tasks: Array.from({length: 10}, (_, i) => ({
          id: `t_${i}`,
          completed: true,
        })),
        habits: [{id: 'h1', currentStreak: 7, bestStreak: 7}],
        goals: [{id: 'g1', progress: 100}],
        focusSessions: [{id: 'fs1', durationMinutes: 65, completed: true}],
      };

      const badges = evaluateAchievements(data);
      const firstTask = badges.find(b => b.id === 'first_task');
      const task10 = badges.find(b => b.id === 'task_10');
      const task25 = badges.find(b => b.id === 'task_25');
      const streak7 = badges.find(b => b.id === 'streak_7');
      const focus60 = badges.find(b => b.id === 'focus_60');
      const firstGoal = badges.find(b => b.id === 'first_goal');

      expect(firstTask.unlocked).toBe(true);
      expect(task10.unlocked).toBe(true);
      expect(task25.unlocked).toBe(false);
      expect(task25.progress).toBe(10);
      expect(streak7.unlocked).toBe(true);
      expect(focus60.unlocked).toBe(true);
      expect(firstGoal.unlocked).toBe(true);
    });
  });

  describe('P8.7: Motivational Greetings', () => {
    test('provides celebration greeting when all tasks are complete', () => {
      const greeting = getMotivationalGreeting({
        completedTasks: 5,
        pendingTasks: 0,
      });
      expect(greeting.title).toContain('Flawless');
    });

    test('provides streak encouragement when maintaining consistent routines', () => {
      const greeting = getMotivationalGreeting({
        completedTasks: 1,
        pendingTasks: 2,
        streak: 8,
      });
      expect(greeting.title).toContain('8-day streak');
    });
  });
});

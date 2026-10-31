/**
 * GOTask - Phase 7 Intelligent Features & AI Assistance Test Suite
 * Tests PRD P7.1 to P7.13:
 * - Natural Language Task Parsing & Entity Extraction (P7.1 - P7.3)
 * - Goal & Task Decomposition (P7.5)
 * - Priority Suggestions (P7.6)
 * - Overdue Recovery Planning (P7.7)
 * - Factual Progress Summaries (P7.8)
 * - Universal Contextual Search (P7.9)
 */

import {
  parseNaturalLanguageTask,
  decomposeGoalToMilestones,
  suggestSubtasks,
  suggestPriority,
  generateOverdueRecoveryPlan,
  generateProgressSummary,
} from '../src/services/aiService';
import {searchContextualEntities} from '../src/utility/contextualSearch';

describe('Phase 7: Intelligent Features & AI Assistance Suite', () => {
  describe('P7.1 - P7.3: Natural Language Task Parsing', () => {
    test('extracts priority, date, time, duration, and hashtags cleanly', () => {
      const input =
        'Finish sprint report tomorrow at 5pm !urgent #Work for 45m';
      const parsed = parseNaturalLanguageTask(input);

      expect(parsed.title).toBe('Finish sprint report');
      expect(parsed.priority).toBe('high');
      expect(parsed.category).toBe('Work');
      expect(parsed.dueDate).not.toBeNull();
      expect(parsed.dueTime).toBe('17:00');
      expect(parsed.estimatedDuration).toBe(45);
      expect(parsed.tags).toContain('Work');
      expect(parsed.confidence).toBeGreaterThanOrEqual(0.8);
      expect(parsed.ambiguous).toBe(false);
    });

    test('extracts inline subtasks when provided with semicolon delimiters', () => {
      const input =
        'Prepare onboarding package with subtasks: Setup email; Order laptop; Schedule orientation';
      const parsed = parseNaturalLanguageTask(input);

      expect(parsed.title).toBe('Prepare onboarding package');
      expect(parsed.subtasks.length).toBe(3);
      expect(parsed.subtasks[0].title).toBe('Setup email');
      expect(parsed.subtasks[1].title).toBe('Order laptop');
      expect(parsed.subtasks[2].title).toBe('Schedule orientation');
    });

    test('handles ambiguous and minimal input gracefully with low confidence flag', () => {
      const input = 'hi';
      const parsed = parseNaturalLanguageTask(input);

      expect(parsed.ambiguous).toBe(true);
      expect(parsed.confidence).toBeLessThan(0.6);
      expect(parsed.title).toBe('hi');
    });

    test('handles empty or non-string input safely', () => {
      const parsed = parseNaturalLanguageTask('');
      expect(parsed.title).toBe('Untitled Task');
      expect(parsed.confidence).toBe(0);
      expect(parsed.ambiguous).toBe(true);
    });
  });

  describe('P7.5: Goal & Subtask Decomposition Engine', () => {
    test('decomposes marathon/running goals into 4 sequential milestones', () => {
      const milestones = decomposeGoalToMilestones(
        'Run 10km Marathon in October',
        'Health',
      );
      expect(milestones.length).toBe(4);
      expect(milestones[0].title).toContain('baseline 3km');
      expect(milestones[3].title).toContain('race distance');
    });

    test('decomposes software/MVP goals into 4 milestones', () => {
      const milestones = decomposeGoalToMilestones(
        'Launch React Native MVP App',
        'Work',
      );
      expect(milestones.length).toBe(4);
      expect(milestones[0].title).toContain('user stories');
      expect(milestones[1].title).toContain('offline-first');
    });

    test('suggests concrete subtasks for presentations', () => {
      const subtasks = suggestSubtasks(
        'Prepare quarterly financial deck',
        'Finance',
      );
      expect(subtasks.length).toBe(4);
      expect(subtasks[0].title).toContain('outline');
      expect(subtasks[1].title).toContain('slides');
    });

    test('suggests concrete subtasks for coding tasks', () => {
      const subtasks = suggestSubtasks('Refactor auth module', 'Work');
      expect(subtasks.length).toBe(4);
      expect(subtasks[0].title).toContain('unit test');
    });
  });

  describe('P7.6: Priority Suggestions', () => {
    test('suggests high priority for urgent/critical deadlines', () => {
      expect(suggestPriority({title: 'Critical server outage asap'})).toBe(
        'high',
      );
      expect(suggestPriority({title: 'Tax filing deadline'})).toBe('high');
    });

    test('suggests low priority for optional/someday tasks', () => {
      expect(suggestPriority({title: 'Someday read philosophy book'})).toBe(
        'low',
      );
      expect(suggestPriority({title: 'Optional hobby experiment'})).toBe('low');
    });

    test('defaults to medium priority for normal tasks', () => {
      expect(suggestPriority({title: 'Weekly grocery shopping'})).toBe(
        'medium',
      );
    });
  });

  describe('P7.7: Overdue Recovery Planning', () => {
    test('returns up-to-date recommendation when no overdue tasks exist', () => {
      const plan = generateOverdueRecoveryPlan([]);
      expect(plan.totalOverdueCount).toBe(0);
      expect(plan.recommendation).toContain('No overdue tasks');
    });

    test('distributes overdue tasks across 3 days to prevent single-day overload', () => {
      const overdueTasks = [
        {
          id: '1',
          title: 'High Task 1',
          estimatedDuration: 60,
          priority: 'high',
        },
        {
          id: '2',
          title: 'High Task 2',
          estimatedDuration: 60,
          priority: 'high',
        },
        {
          id: '3',
          title: 'Med Task 3',
          estimatedDuration: 30,
          priority: 'medium',
        },
        {id: '4', title: 'Low Task 4', estimatedDuration: 30, priority: 'low'},
      ];

      const recovery = generateOverdueRecoveryPlan(overdueTasks, 240);
      expect(recovery.totalOverdueCount).toBe(4);
      expect(recovery.totalOverdueMinutes).toBe(180);
      expect(recovery.plan.length).toBe(3);

      const allAllocated = recovery.plan.flatMap(d => d.tasks);
      expect(allAllocated.length).toBe(4);
    });
  });

  describe('P7.8: Factual Progress Summary (Zero Fabrication)', () => {
    test('synthesizes exact verified numbers without fabricating accomplishments', () => {
      const data = {
        tasks: [
          {id: 't1', title: 'Task 1', completed: true},
          {id: 't2', title: 'Task 2', completed: true},
          {id: 't3', title: 'Task 3', completed: false},
        ],
        goals: [{id: 'g1', title: 'Goal 1', progress: 100}],
        habits: [{id: 'h1', title: 'Habit 1', currentStreak: 7}],
        focusSessions: [
          {id: 'fs1', durationMinutes: 25, completed: true},
          {id: 'fs2', durationMinutes: 25, completed: true},
        ],
      };

      const summary = generateProgressSummary(data);
      expect(summary.metrics.completedTasksCount).toBe(2);
      expect(summary.metrics.taskCompletionRate).toBe(67);
      expect(summary.metrics.totalFocusMinutes).toBe(50);
      expect(summary.metrics.peakHabitStreak).toBe(7);
      expect(summary.metrics.completedGoalsCount).toBe(1);
      expect(summary.narrative).toContain('completed 2 task(s)');
      expect(summary.narrative).toContain('50 minutes');
    });
  });

  describe('P7.9: Universal Contextual Search Engine', () => {
    const mockTasks = [
      {
        id: 't1',
        title: 'Ship React Native release',
        description: 'Prepare release build',
        category: 'Work',
        priority: 'high',
        tags: ['release', 'prod'],
      },
      {
        id: 't2',
        title: 'Buy protein powder',
        description: 'Vanilla flavor',
        category: 'Health',
        priority: 'low',
        tags: ['fitness'],
      },
    ];
    const mockNotes = [
      {
        id: 'n1',
        title: 'Architecture decisions',
        content: 'Discussion on offline sync engine',
        category: 'Work',
        tags: ['tech'],
      },
    ];
    const mockGoals = [
      {
        id: 'g1',
        title: 'Run half marathon',
        category: 'Health',
        progress: 40,
        milestones: [{title: '5km run'}],
      },
    ];
    const mockHabits = [
      {
        id: 'h1',
        title: 'Morning workout routine',
        category: 'Health',
        currentStreak: 5,
        frequency: 'Daily',
      },
    ];

    test('finds cross-entity matches across tasks, notes, goals, and habits', () => {
      const search = searchContextualEntities({
        query: 'react native',
        tasks: mockTasks,
        notes: mockNotes,
        goals: mockGoals,
        habits: mockHabits,
      });

      expect(search.totalMatches).toBe(1);
      expect(search.results[0].type).toBe('task');
      expect(search.results[0].title).toBe('Ship React Native release');
    });

    test('matches health-related items across multiple entity types simultaneously', () => {
      const search = searchContextualEntities({
        query: 'health',
        tasks: mockTasks,
        notes: mockNotes,
        goals: mockGoals,
        habits: mockHabits,
      });

      expect(search.totalMatches).toBeGreaterThanOrEqual(2);
      const types = search.results.map(r => r.type);
      expect(types).toContain('task');
      expect(types).toContain('goal');
      expect(types).toContain('habit');
    });

    test('filters results accurately when a specific filterType is applied', () => {
      const search = searchContextualEntities({
        query: 'health',
        tasks: mockTasks,
        notes: mockNotes,
        goals: mockGoals,
        habits: mockHabits,
        filterType: 'goal',
      });

      expect(search.results.every(r => r.type === 'goal')).toBe(true);
      expect(search.results.length).toBe(1);
    });

    test('returns empty results cleanly when query is empty or whitespace', () => {
      const search = searchContextualEntities({
        query: '   ',
        tasks: mockTasks,
        notes: mockNotes,
      });

      expect(search.totalMatches).toBe(0);
      expect(search.results.length).toBe(0);
    });
  });
});

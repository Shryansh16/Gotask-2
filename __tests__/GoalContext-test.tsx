/**
 * __tests__/GoalContext-test.tsx
 * Comprehensive unit and integration test suite for GoalContext & Progress Layer
 * Verified against docs/PRD.md Phase 4 (P4.1 - P4.12)
 */

import 'react-native';
import React from 'react';
import {Text, View} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoalProvider,
  useGoal,
  validateGoalInput,
  calculateGoalProgress,
  GOAL_BOUNDS,
  GOAL_TYPES,
} from '../src/context/GoalContext';
import {TaskProvider} from '../src/context/TaskContext';

// Mock apiService to prevent network calls in unit tests
jest.mock('../src/services/apiService', () => ({
  apiService: {
    pushGoal: jest.fn().mockResolvedValue({success: true}),
    updateGoal: jest.fn().mockResolvedValue({success: true}),
    deleteGoal: jest.fn().mockResolvedValue({success: true}),
  },
  __esModule: true,
  default: {
    pushGoal: jest.fn().mockResolvedValue({success: true}),
    updateGoal: jest.fn().mockResolvedValue({success: true}),
    deleteGoal: jest.fn().mockResolvedValue({success: true}),
  },
}));

describe('Goal Input Validation (docs/PRD.md Phase 4 — P4.1, P4.2)', () => {
  it('rejects empty or whitespace-only title', () => {
    const res1 = validateGoalInput({title: ''});
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain('title is required');

    const res2 = validateGoalInput({title: '   '});
    expect(res2.isValid).toBe(false);
  });

  it('rejects title exceeding maximum character limit', () => {
    const longTitle = 'g'.repeat(GOAL_BOUNDS.TITLE_MAX_LEN + 1);
    const res = validateGoalInput({title: longTitle});
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Title exceeds maximum limit');
  });

  it('rejects description exceeding maximum character limit', () => {
    const longDesc = 'd'.repeat(GOAL_BOUNDS.DESC_MAX_LEN + 1);
    const res = validateGoalInput({title: 'Valid Goal', description: longDesc});
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Description exceeds maximum limit');
  });

  it('sanitizes valid input and applies default fallbacks', () => {
    const res = validateGoalInput({
      title: '  Read 24 Books  ',
      description: '  Personal reading challenge  ',
      category: '',
      type: 'target_count',
      targetValue: '24',
      unit: '  books  ',
    });

    expect(res.isValid).toBe(true);
    expect(res.sanitized?.title).toBe('Read 24 Books');
    expect(res.sanitized?.description).toBe('Personal reading challenge');
    expect(res.sanitized?.category).toBe('General');
    expect(res.sanitized?.type).toBe(GOAL_TYPES.TARGET_COUNT);
    expect(res.sanitized?.targetValue).toBe(24);
    expect(res.sanitized?.unit).toBe('books');
  });
});

describe('Goal Progress Mathematics & Risk Calculations (P4.3, P4.6, P4.9)', () => {
  it('calculates percentage type goals accurately', () => {
    const goal = {
      type: GOAL_TYPES.PERCENTAGE,
      targetValue: 100,
      currentValue: 45,
    };
    const res = calculateGoalProgress(goal);
    expect(res.progress).toBe(45);
    expect(res.status).toBe('in_progress');
  });

  it('calculates target count type goals accurately', () => {
    const goal = {
      type: GOAL_TYPES.TARGET_COUNT,
      targetValue: 50,
      currentValue: 25,
      unit: 'km',
    };
    const res = calculateGoalProgress(goal);
    expect(res.progress).toBe(50);
    expect(res.currentDisplay).toBe('25 km');
    expect(res.targetDisplay).toBe('50 km');
  });

  it('calculates milestones progress accurately', () => {
    const goal = {
      type: GOAL_TYPES.MILESTONES,
      milestones: [
        {id: 'm1', title: 'Phase 1', isCompleted: true},
        {id: 'm2', title: 'Phase 2', isCompleted: true},
        {id: 'm3', title: 'Phase 3', isCompleted: false},
        {id: 'm4', title: 'Phase 4', isCompleted: false},
      ],
    };
    const res = calculateGoalProgress(goal);
    expect(res.progress).toBe(50);
  });

  it('calculates task-derived goals dynamically from active tasks', () => {
    const goal = {
      type: GOAL_TYPES.TASK_DERIVED,
      linkedTaskIds: ['task_101', 'task_102', 'task_103'],
    };
    const mockTasks = [
      {id: 'task_101', completed: true},
      {id: 'task_102', completed: false},
      {id: 'task_103', completed: true},
    ];

    const res = calculateGoalProgress(goal, mockTasks);
    expect(res.progress).toBe(67);
  });

  it('flags overdue and at-risk goals based on timeline rules (P4.9)', () => {
    const pastDate = Date.now() - 3600000 * 24; // Yesterday
    const overdueGoal = {
      type: GOAL_TYPES.TARGET_COUNT,
      targetValue: 10,
      currentValue: 3,
      targetDate: pastDate,
    };
    const resOverdue = calculateGoalProgress(overdueGoal);
    expect(resOverdue.isOverdue).toBe(true);
    expect(resOverdue.status).toBe('overdue');

    // Due in 3 days with < 50% progress -> At Risk
    const nearDate = Date.now() + 3600000 * 24 * 3;
    const atRiskGoal = {
      type: GOAL_TYPES.TARGET_COUNT,
      targetValue: 100,
      currentValue: 20,
      targetDate: nearDate,
    };
    const resAtRisk = calculateGoalProgress(atRiskGoal);
    expect(resAtRisk.isAtRisk).toBe(true);
    expect(resAtRisk.status).toBe('at_risk');
  });
});

describe('GoalContext Operations & Lifecycle (P4.1 - P4.12)', () => {
  let contextValue: any = null;

  const TestConsumer = () => {
    contextValue = useGoal();
    return (
      <View>
        <Text testID="goals-count">{contextValue.goals.length}</Text>
      </View>
    );
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    contextValue = null;

    await act(async () => {
      renderer.create(
        <TaskProvider>
          <GoalProvider>
            <TestConsumer />
          </GoalProvider>
        </TaskProvider>,
      );
    });
  });

  it('loads goals from storage or defaults to sample goals', () => {
    expect(contextValue.goals.length).toBeGreaterThan(0);
    expect(contextValue.isLoaded).toBe(true);
  });

  it('adds a new goal and updates state', async () => {
    let result: any = null;
    await act(async () => {
      result = await contextValue.addGoal({
        title: 'Learn Spanish Fluently',
        category: 'Study',
        type: GOAL_TYPES.TARGET_COUNT,
        targetValue: 100,
        unit: 'lessons',
      });
    });

    expect(result.success).toBe(true);
    expect(result.goal.title).toBe('Learn Spanish Fluently');
    expect(contextValue.goals.some((g: any) => g.id === result.goal.id)).toBe(
      true,
    );
  });

  it('updates an existing goal', async () => {
    const existingGoal = contextValue.goals[0];
    await act(async () => {
      await contextValue.updateGoal(existingGoal.id, {
        title: 'Updated Goal Title',
        category: 'Work',
      });
    });

    const updated = contextValue.goals.find(
      (g: any) => g.id === existingGoal.id,
    );
    expect(updated.title).toBe('Updated Goal Title');
    expect(updated.category).toBe('Work');
  });

  it('deletes a goal and successfully recovers it with undo', async () => {
    const goalToDelete = contextValue.goals[0];
    const initialCount = contextValue.goals.length;

    await act(async () => {
      const delRes = await contextValue.deleteGoal(goalToDelete.id);
      expect(delRes.success).toBe(true);
    });

    expect(contextValue.goals.length).toBe(initialCount - 1);
    expect(contextValue.goals.some((g: any) => g.id === goalToDelete.id)).toBe(
      false,
    );

    // Undo delete
    await act(async () => {
      const undoRes = await contextValue.undoDeleteGoal();
      expect(undoRes.success).toBe(true);
    });

    expect(contextValue.goals.length).toBe(initialCount);
    expect(contextValue.goals.some((g: any) => g.id === goalToDelete.id)).toBe(
      true,
    );
  });

  it('records dated progress updates with notes and auto-completes when target reached', async () => {
    let testGoal: any = null;
    await act(async () => {
      const created = await contextValue.addGoal({
        title: 'Complete 30 Pushups',
        category: 'Health',
        type: GOAL_TYPES.TARGET_COUNT,
        targetValue: 30,
        currentValue: 10,
        unit: 'reps',
      });
      testGoal = created.goal;
    });

    // Record progress update
    await act(async () => {
      const res = await contextValue.recordProgressUpdate(
        testGoal.id,
        30,
        'Hit target sets with strict form',
      );
      expect(res.success).toBe(true);
    });

    const updatedGoal = contextValue.goals.find(
      (g: any) => g.id === testGoal.id,
    );
    expect(updatedGoal.currentValue).toBe(30);
    expect(updatedGoal.isCompleted).toBe(true);
    expect(updatedGoal.progressUpdates.length).toBe(1);
    expect(updatedGoal.progressUpdates[0].note).toBe(
      'Hit target sets with strict form',
    );
  });

  it('manages milestones (add, toggle, remove) and updates overall progress', async () => {
    let testGoal: any = null;
    await act(async () => {
      const created = await contextValue.addGoal({
        title: 'Project Milestone Roadmap',
        category: 'Work',
        type: GOAL_TYPES.MILESTONES,
        milestones: [],
      });
      testGoal = created.goal;
    });

    // Add milestones
    await act(async () => {
      await contextValue.addMilestone(testGoal.id, 'Design Wireframes');
      await contextValue.addMilestone(testGoal.id, 'Implement Backend API');
    });

    let goalAfterAdd = contextValue.goals.find(
      (g: any) => g.id === testGoal.id,
    );
    expect(goalAfterAdd.milestones.length).toBe(2);

    // Toggle milestone
    const m1 = goalAfterAdd.milestones[0];
    await act(async () => {
      await contextValue.toggleMilestone(testGoal.id, m1.id);
    });

    let goalAfterToggle = contextValue.goals.find(
      (g: any) => g.id === testGoal.id,
    );
    expect(
      goalAfterToggle.milestones.find((m: any) => m.id === m1.id).isCompleted,
    ).toBe(true);
    expect(goalAfterToggle.stats.progress).toBe(50);

    // Remove milestone
    await act(async () => {
      await contextValue.removeMilestone(testGoal.id, m1.id);
    });

    let goalAfterRemove = contextValue.goals.find(
      (g: any) => g.id === testGoal.id,
    );
    expect(goalAfterRemove.milestones.length).toBe(1);
  });
});

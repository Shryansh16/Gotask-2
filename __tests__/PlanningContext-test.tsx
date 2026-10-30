/**
 * __tests__/PlanningContext-test.tsx
 * Unit test suite for PlanningContext, Focus Mode, and Time Management Layer
 * Aligned with docs/PRD.md Phase 6 (P6.1 to P6.8) and docs/Design.md Section 10
 */

import 'react-native';
import React, {useEffect} from 'react';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PlanningProvider,
  usePlanning,
  evaluateFocusTransition,
  evaluateDayWorkload,
  TIMER_MODES,
  DEFAULT_CAPACITY_MINUTES,
} from '../src/context/PlanningContext';
import {TaskProvider, useTasks} from '../src/context/TaskContext';

// Mock apiService to prevent network leaks in unit tests
jest.mock('../src/services/apiService', () => ({
  apiService: {
    syncWithServer: jest.fn().mockResolvedValue({success: true, tasks: []}),
    checkServerHealth: jest.fn().mockResolvedValue(true),
    pushTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
  __esModule: true,
  default: {
    syncWithServer: jest.fn().mockResolvedValue({success: true, tasks: []}),
    checkServerHealth: jest.fn().mockResolvedValue(true),
    pushTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

describe('TypeSafe Focus State Transition Truth Table (docs/Design.md Section 10)', () => {
  it('correctly transitions from idle to running on start action', () => {
    const res = evaluateFocusTransition({
      currentStatus: 'idle',
      action: 'start',
    });
    expect(res.nextStatus).toBe('running');
    expect(res.timerAction).toBe('start');
  });

  it('correctly freezes on pause and continues on resume', () => {
    const pauseRes = evaluateFocusTransition({
      currentStatus: 'running',
      action: 'pause',
    });
    expect(pauseRes.nextStatus).toBe('paused');
    expect(pauseRes.timerAction).toBe('freeze');

    const resumeRes = evaluateFocusTransition({
      currentStatus: 'paused',
      action: 'resume',
    });
    expect(resumeRes.nextStatus).toBe('running');
    expect(resumeRes.timerAction).toBe('continue');
  });

  it('correctly stops and logs on tick completion (tick_0)', () => {
    const completeRes = evaluateFocusTransition({
      currentStatus: 'running',
      action: 'tick_0',
    });
    expect(completeRes.nextStatus).toBe('completed');
    expect(completeRes.timerAction).toBe('stop_log');
  });

  it('resets from any status to idle on reset action', () => {
    const resetRes1 = evaluateFocusTransition({
      currentStatus: 'running',
      action: 'reset',
    });
    expect(resetRes1.nextStatus).toBe('idle');
    expect(resetRes1.timerAction).toBe('clear');

    const resetRes2 = evaluateFocusTransition({
      currentStatus: 'paused',
      action: 'reset',
    });
    expect(resetRes2.nextStatus).toBe('idle');
    expect(resetRes2.timerAction).toBe('clear');
  });
});

describe('TypeSafe Day Workload Capacity Truth Table (docs/PRD.md P6.8)', () => {
  it('identifies balanced workload when total planned time is within capacity and no overdue', () => {
    const res = evaluateDayWorkload({
      totalMinutes: 180,
      maxCapacityMinutes: 480,
      hasOverdue: false,
    });
    expect(res.workloadStatus).toBe('balanced');
    expect(res.riskLevel).toBe('normal');
    expect(res.isOverloaded).toBe(false);
  });

  it('flags attention needed when total time is within capacity but overdue tasks exist', () => {
    const res = evaluateDayWorkload({
      totalMinutes: 240,
      maxCapacityMinutes: 480,
      hasOverdue: true,
    });
    expect(res.workloadStatus).toBe('attention');
    expect(res.riskLevel).toBe('low');
    expect(res.isOverloaded).toBe(false);
    expect(res.message).toContain('overdue tasks waiting');
  });

  it('flags day as overloaded when total planned time exceeds capacity', () => {
    const res = evaluateDayWorkload({
      totalMinutes: 540,
      maxCapacityMinutes: 480,
      hasOverdue: false,
    });
    expect(res.workloadStatus).toBe('overloaded');
    expect(res.riskLevel).toBe('high');
    expect(res.isOverloaded).toBe(true);
    expect(res.overflowMinutes).toBe(60);
    expect(res.message).toContain('60 mins');
  });
});

describe('Planning and Focus Mode State & Operations (GT-601 to GT-605)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('@gotask_first_run_completed', 'true');
    await AsyncStorage.setItem('@gotask_tasks_v2', JSON.stringify([]));
  });

  const createPlanningHarness = () => {
    let planningRef: any = null;
    let taskRef: any = null;

    const Consumer = () => {
      taskRef = useTasks();
      planningRef = usePlanning();
      return null;
    };

    return {
      getPlanning: () => planningRef,
      getTasks: () => taskRef,
      render: async () => {
        let tree;
        await act(async () => {
          tree = renderer.create(
            <TaskProvider>
              <PlanningProvider>
                <Consumer />
              </PlanningProvider>
            </TaskProvider>,
          );
        });
        return tree;
      },
    };
  };

  it('initializes default Pomodoro mode at 25 minutes and allows mode switching', async () => {
    const harness = createPlanningHarness();
    await harness.render();

    const plan = harness.getPlanning();
    expect(plan.timerStatus).toBe('idle');
    expect(plan.activeMode).toBe('pomodoro');
    expect(plan.durationMinutes).toBe(25);
    expect(plan.remainingSeconds).toBe(25 * 60);

    // Switch to Short Break (5 mins)
    await act(async () => {
      plan.selectMode('short_break');
    });

    expect(harness.getPlanning().activeMode).toBe('short_break');
    expect(harness.getPlanning().durationMinutes).toBe(5);
    expect(harness.getPlanning().remainingSeconds).toBe(5 * 60);

    // Switch to Long Break (15 mins)
    await act(async () => {
      harness.getPlanning().selectMode('long_break');
    });

    expect(harness.getPlanning().activeMode).toBe('long_break');
    expect(harness.getPlanning().durationMinutes).toBe(15);
    expect(harness.getPlanning().remainingSeconds).toBe(15 * 60);
  });

  it('starts, pauses, resumes, and resets focus session cleanly', async () => {
    const harness = createPlanningHarness();
    await harness.render();

    // 1. Start Session
    await act(async () => {
      harness.getPlanning().startSession();
    });
    expect(harness.getPlanning().timerStatus).toBe('running');

    // 2. Pause Session
    await act(async () => {
      harness.getPlanning().pauseSession();
    });
    expect(harness.getPlanning().timerStatus).toBe('paused');

    // 3. Resume Session
    await act(async () => {
      harness.getPlanning().resumeSession();
    });
    expect(harness.getPlanning().timerStatus).toBe('running');

    // 4. Reset Session
    await act(async () => {
      harness.getPlanning().resetSession();
    });
    expect(harness.getPlanning().timerStatus).toBe('idle');
    expect(harness.getPlanning().remainingSeconds).toBe(25 * 60);
  });

  it('respects the behavioral contract: ending session and completing task are distinct (docs/Design.md Section 10)', async () => {
    const harness = createPlanningHarness();
    await harness.render();

    // Create a task
    let created: any;
    await act(async () => {
      created = await harness.getTasks().addTask({
        title: 'Draft System Design Spec',
        category: 'Study',
        dueDate: 'Today',
      });
    });

    // Link task and start focus
    await act(async () => {
      harness.getPlanning().startSession(created.id);
    });

    expect(harness.getPlanning().activeTaskId).toBe(created.id);
    expect(harness.getPlanning().activeTask.title).toBe(
      'Draft System Design Spec',
    );
    expect(harness.getTasks().tasks[0].completed).toBe(false);

    // Resetting or ending session must NOT automatically mark task complete
    await act(async () => {
      harness.getPlanning().resetSession();
    });
    expect(harness.getTasks().tasks[0].completed).toBe(false);

    // Only explicit task completion completes the task
    await act(async () => {
      await harness.getPlanning().completeActiveTask();
    });
    expect(harness.getTasks().tasks[0].completed).toBe(true);
  });

  it('supports task duration estimation and aggregates daily planned workload (docs/PRD.md P6.2)', async () => {
    const harness = createPlanningHarness();
    await harness.render();

    // Add tasks for today with estimated durations
    await act(async () => {
      await harness.getTasks().addTask({
        title: 'Task A',
        dueDate: 'Today',
        estimatedDuration: 45,
      });
      await harness.getTasks().addTask({
        title: 'Task B',
        dueDate: 'Today',
        estimatedDuration: 60,
      });
    });

    expect(harness.getPlanning().todayTasks.length).toBe(2);
    expect(harness.getPlanning().todayEstimatedMinutes).toBe(105);

    // Update duration of Task A to 90 minutes
    const taskA = harness.getTasks().tasks.find((t: any) => t.title === 'Task A');
    await act(async () => {
      await harness.getPlanning().setTaskDuration(taskA.id, 90);
    });

    expect(harness.getPlanning().todayEstimatedMinutes).toBe(150);
  });

  it('reschedules individual tasks and batches overdue tasks to Today (docs/PRD.md P6.7)', async () => {
    const harness = createPlanningHarness();
    await harness.render();

    // Add overdue and today tasks
    let overdueTask: any;
    await act(async () => {
      overdueTask = await harness.getTasks().addTask({
        title: 'Overdue Bugfix',
        dueDate: 'Yesterday',
      });
      await harness.getTasks().addTask({
        title: 'Today Task',
        dueDate: 'Today',
      });
    });

    expect(harness.getPlanning().overdueTasks.length).toBe(1);
    expect(harness.getPlanning().todayTasks.length).toBe(1);

    // Batch reschedule overdue tasks to Today
    await act(async () => {
      await harness.getPlanning().batchRescheduleOverdue('Today');
    });

    expect(harness.getPlanning().overdueTasks.length).toBe(0);
    expect(harness.getPlanning().todayTasks.length).toBe(2);
  });
});


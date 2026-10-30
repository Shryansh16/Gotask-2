import 'react-native';
import React, {useEffect} from 'react';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TaskProvider,
  useTasks,
  validateTaskInput,
  VALID_PRIORITIES,
} from '../src/context/TaskContext';

// Mock apiService to prevent network leaks in unit tests
jest.mock('../src/services/apiService', () => ({
  apiService: {
    syncWithServer: jest.fn().mockResolvedValue({success: true, tasks: []}),
    checkServerHealth: jest.fn().mockResolvedValue(true),
    pushTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    parseNaturalLanguageTask: jest.fn(),
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

describe('Task Input Validation (GT-101)', () => {
  it('rejects empty or whitespace-only task titles', () => {
    const emptyResult = validateTaskInput({title: ''});
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.errors.length).toBeGreaterThan(0);

    const spaceResult = validateTaskInput({title: '    '});
    expect(spaceResult.isValid).toBe(false);

    const nullResult = validateTaskInput({title: null});
    expect(nullResult.isValid).toBe(false);
  });

  it('accepts and trims valid title', () => {
    const result = validateTaskInput({title: '  Prepare quarterly report  '});
    expect(result.isValid).toBe(true);
    expect(result.sanitized.title).toBe('Prepare quarterly report');
  });

  it('normalizes priorities and falls back to medium for unknown values', () => {
    expect(VALID_PRIORITIES).toEqual(['low', 'medium', 'high']);

    const validHigh = validateTaskInput({title: 'Test', priority: 'high'});
    expect(validHigh.sanitized.priority).toBe('high');

    const validLow = validateTaskInput({title: 'Test', priority: 'LOW'});
    expect(validLow.sanitized.priority).toBe('low');

    const invalid = validateTaskInput({
      title: 'Test',
      priority: 'super-urgent',
    });
    expect(invalid.sanitized.priority).toBe('medium');
  });

  it('sanitizes and filters empty subtasks', () => {
    const result = validateTaskInput({
      title: 'Grocery shopping',
      subtasks: [
        {title: 'Apples', completed: false},
        {title: '   ', completed: false},
        null,
        {title: 'Oat milk', completed: true},
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.sanitized.subtasks.length).toBe(2);
    expect(result.sanitized.subtasks[0].title).toBe('Apples');
    expect(result.sanitized.subtasks[1].title).toBe('Oat milk');
    expect(result.sanitized.subtasks[1].completed).toBe(true);
  });
});

describe('Task Context State & Operations (GT-101 to GT-104)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    // Mark first run as completed so we test clean slate without sample tasks
    await AsyncStorage.setItem('@gotask_first_run_completed', 'true');
    await AsyncStorage.setItem('@gotask_tasks_v2', JSON.stringify([]));
  });

  // Test Harness to capture and invoke context methods
  const createTestHarness = () => {
    let contextRef: any = null;

    const Consumer = () => {
      const ctx = useTasks();
      useEffect(() => {
        contextRef = ctx;
      });
      contextRef = ctx;
      return null;
    };

    return {
      get: () => contextRef,
      render: async () => {
        let tree;
        await act(async () => {
          tree = renderer.create(
            <TaskProvider>
              <Consumer />
            </TaskProvider>,
          );
        });
        return tree;
      },
    };
  };

  it('adds, updates, and deletes tasks cleanly', async () => {
    const harness = createTestHarness();
    await harness.render();

    expect(harness.get().tasks.length).toBe(0);

    // 1. Add Task
    let created: any;
    await act(async () => {
      created = await harness.get().addTask({
        title: 'Deep Work Session',
        category: 'Work',
        priority: 'high',
        dueDate: 'Today',
      });
    });

    expect(created).toBeDefined();
    expect(created.title).toBe('Deep Work Session');
    expect(created.priority).toBe('high');
    expect(harness.get().tasks.length).toBe(1);

    // 2. Update Task
    await act(async () => {
      await harness.get().updateTask(created.id, {
        description: 'Focus on React Native architecture revamp',
      });
    });

    const updated = harness.get().tasks.find((t: any) => t.id === created.id);
    expect(updated.description).toBe(
      'Focus on React Native architecture revamp',
    );

    // 3. Delete Task & Test Undo
    await act(async () => {
      await harness.get().deleteTask(created.id);
    });

    expect(harness.get().tasks.length).toBe(0);
    expect(harness.get().lastDeletedTask.id).toBe(created.id);

    // 4. Undo Delete
    await act(async () => {
      await harness.get().undoDeleteTask();
    });

    expect(harness.get().tasks.length).toBe(1);
    expect(harness.get().tasks[0].id).toBe(created.id);
  });

  it('cascades completion: marking task complete completes all subtasks', async () => {
    const harness = createTestHarness();
    await harness.render();

    let task: any;
    await act(async () => {
      task = await harness.get().addTask({
        title: 'Exercise Routine',
        category: 'Health',
        subtasks: [
          {id: 'sub_1', title: 'Stretch', completed: false},
          {id: 'sub_2', title: 'Core circuit', completed: false},
        ],
      });
    });

    expect(task.subtasks.every((s: any) => !s.completed)).toBe(true);

    // Toggle Task Complete
    await act(async () => {
      await harness.get().toggleTaskComplete(task.id);
    });

    const completedTask = harness
      .get()
      .tasks.find((t: any) => t.id === task.id);
    expect(completedTask.completed).toBe(true);
    expect(completedTask.subtasks.every((s: any) => s.completed)).toBe(true);
  });

  it('cascades completion: completing all subtasks automatically marks task complete', async () => {
    const harness = createTestHarness();
    await harness.render();

    let task: any;
    await act(async () => {
      task = await harness.get().addTask({
        title: 'Project Submission',
        category: 'Work',
        subtasks: [
          {id: 'sub_a', title: 'Write unit tests', completed: false},
          {id: 'sub_b', title: 'Review pull request', completed: false},
        ],
      });
    });

    // Check off sub_a
    await act(async () => {
      await harness.get().toggleSubtask(task.id, 'sub_a');
    });

    let state = harness.get().tasks.find((t: any) => t.id === task.id);
    expect(state.completed).toBe(false);

    // Check off sub_b (now all are completed)
    await act(async () => {
      await harness.get().toggleSubtask(task.id, 'sub_b');
    });

    state = harness.get().tasks.find((t: any) => t.id === task.id);
    expect(state.completed).toBe(true);
  });

  it('supports search across title, description, and checklist subtasks', async () => {
    const harness = createTestHarness();
    await harness.render();

    await act(async () => {
      await harness.get().addTask({
        title: 'Grocery Trip',
        description: 'Weekly provisions',
        category: 'Shopping',
        subtasks: [{id: 's_ch', title: 'Organic Chia Seeds', completed: false}],
      });
      await harness.get().addTask({
        title: 'Read Book',
        description: 'Design patterns',
        category: 'Study',
      });
    });

    // 1. Search by subtask item
    await act(async () => {
      harness.get().setSearchQuery('chia');
    });

    expect(harness.get().filteredTasks.length).toBe(1);
    expect(harness.get().filteredTasks[0].title).toBe('Grocery Trip');

    // 2. Search by notes / description
    await act(async () => {
      harness.get().setSearchQuery('patterns');
    });

    expect(harness.get().filteredTasks.length).toBe(1);
    expect(harness.get().filteredTasks[0].title).toBe('Read Book');

    // 3. Clear search
    await act(async () => {
      harness.get().setSearchQuery('');
    });

    expect(harness.get().filteredTasks.length).toBe(2);
  });

  it('sorts pinned tasks first and prioritizes high priority over low', async () => {
    const harness = createTestHarness();
    await harness.render();

    await act(async () => {
      await harness.get().addTask({
        title: 'Task Normal',
        priority: 'low',
        isPinned: false,
      });
      await harness.get().addTask({
        title: 'Task Urgent',
        priority: 'high',
        isPinned: false,
      });
      await harness.get().addTask({
        title: 'Task Pinned',
        priority: 'low',
        isPinned: true,
      });
    });

    const sorted = harness.get().filteredTasks;
    // Pinned should come first regardless of priority
    expect(sorted[0].title).toBe('Task Pinned');
    // High priority should precede low priority among unpinned
    expect(sorted[1].title).toBe('Task Urgent');
    expect(sorted[2].title).toBe('Task Normal');
  });

  it('supports clearCompleted and undoClearCompleted', async () => {
    const harness = createTestHarness();
    await harness.render();

    let t1: any;
    await act(async () => {
      t1 = await harness.get().addTask({title: 'Finished Task'});
      await harness.get().addTask({title: 'Active Task'});
      await harness.get().toggleTaskComplete(t1.id);
    });

    expect(harness.get().tasks.length).toBe(2);

    // Clear completed
    await act(async () => {
      await harness.get().clearCompleted();
    });

    expect(harness.get().tasks.length).toBe(1);
    expect(harness.get().tasks[0].title).toBe('Active Task');

    // Undo clear completed
    await act(async () => {
      await harness.get().undoClearCompleted();
    });

    expect(harness.get().tasks.length).toBe(2);
  });
});

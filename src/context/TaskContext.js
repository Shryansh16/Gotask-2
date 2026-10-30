// src/context/TaskContext.js
// Central Reactive State Engine for GOTask Mobile App (docs/PRD.md Phase 1)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const TaskContext = createContext();

export const VALID_PRIORITIES = ['low', 'medium', 'high'];

/**
 * Validates and sanitizes task input payload (GT-101)
 * @param {object} input
 * @returns {{isValid: boolean, errors: string[], sanitized: object|null}}
 */
export const validateTaskInput = input => {
  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: ['Task payload is required'],
      sanitized: null,
    };
  }

  const errors = [];
  const title = (input.title || '').trim();
  if (!title) {
    errors.push('Task title is required');
  }

  let priority = 'medium';
  if (input.priority && typeof input.priority === 'string') {
    const norm = input.priority.toLowerCase().trim();
    if (VALID_PRIORITIES.includes(norm)) {
      priority = norm;
    }
  }

  let subtasks = [];
  if (Array.isArray(input.subtasks)) {
    subtasks = input.subtasks
      .filter(
        s =>
          s &&
          typeof s === 'object' &&
          typeof s.title === 'string' &&
          s.title.trim().length > 0,
      )
      .map((s, idx) => ({
        id: s.id || `sub_${Date.now()}_${idx}`,
        title: s.title.trim(),
        completed: Boolean(s.completed),
      }));
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      ...input,
      title,
      priority,
      subtasks,
    },
  };
};

const STORAGE_KEYS = {
  TASKS: '@gotask_tasks_v2',
  PROFILE: '@gotask_profile',
  CATEGORIES: '@gotask_custom_categories',
  FIRST_RUN: '@gotask_first_run_completed',
};

const DEFAULT_CATEGORIES = [
  'All',
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Study',
  'Finance',
];

const DEFAULT_PROFILE = {
  name: 'Shryansh Shree',
  email: 'shryansh.gangwal@example.com',
  role: 'Productivity Architect',
  dailyGoal: 5,
  joinedDate: 'October 2026',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
};

const SAMPLE_TASKS = [
  {
    id: 'sample_1',
    title: 'Complete Mobile App Architecture Revamp',
    description:
      'Ensure offline-first sync, clean Poppins typography, and modern cards are ready.',
    category: 'Work',
    priority: 'high',
    completed: false,
    dueDate: 'Today',
    isPinned: true,
    subtasks: [
      {id: 's1', title: 'Verify responsive font scaling', completed: true},
      {id: 's2', title: 'Test dark mode theme switching', completed: true},
      {
        id: 's3',
        title: 'Integrate offline-first task context',
        completed: true,
      },
      {id: 's4', title: 'Test category filters & search', completed: false},
    ],
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now(),
  },
  {
    id: 'sample_2',
    title: 'Daily 30-min HIIT & Stretches',
    description: 'Stay focused and energetic throughout the afternoon sprint.',
    category: 'Health',
    priority: 'medium',
    completed: true,
    dueDate: 'Today',
    isPinned: false,
    subtasks: [
      {id: 's2_1', title: 'Warmup mobility', completed: true},
      {id: 's2_2', title: 'Core & cardio circuits', completed: true},
    ],
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now() - 3600000 * 2,
    completedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'sample_3',
    title: 'Organic groceries for week meal prep',
    description: 'Buy fresh veggies, Greek yogurt, berries, and chia seeds.',
    category: 'Shopping',
    priority: 'low',
    completed: false,
    dueDate: 'Tomorrow',
    isPinned: false,
    subtasks: [
      {id: 's3_1', title: 'Spinach & Avocados', completed: false},
      {id: 's3_2', title: 'Almond milk & Greek Yogurt', completed: false},
    ],
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'sample_4',
    title: 'Review Machine Learning System Design',
    description:
      'Study feature stores, latency budgets, and model monitoring architectures.',
    category: 'Study',
    priority: 'high',
    completed: false,
    dueDate: 'This Week',
    isPinned: true,
    subtasks: [
      {id: 's4_1', title: 'Read chapter 3 notes', completed: true},
      {
        id: 's4_2',
        title: 'Draft diagram for inference pipeline',
        completed: false,
      },
    ],
    createdAt: Date.now() - 3600000 * 20,
    updatedAt: Date.now() - 3600000 * 20,
  },
  {
    id: 'sample_5',
    title: 'Organize workspace & review monthly subscriptions',
    description:
      'Audit recurring cloud and software bills to optimize personal finance.',
    category: 'Finance',
    priority: 'low',
    completed: true,
    dueDate: 'Yesterday',
    isPinned: false,
    subtasks: [],
    createdAt: Date.now() - 3600000 * 30,
    updatedAt: Date.now() - 3600000 * 10,
    completedAt: Date.now() - 3600000 * 10,
  },
];

export const TaskProvider = ({children}) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'completed'
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'offline'
  const [lastDeletedTask, setLastDeletedTask] = useState(null);
  const [lastClearedTasks, setLastClearedTasks] = useState([]);

  // Initialize and load persisted data
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const firstRun = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_RUN);
      let loadedTasks = [];

      const savedTasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasksJson) {
        loadedTasks = JSON.parse(savedTasksJson);
      } else if (!firstRun) {
        loadedTasks = [...SAMPLE_TASKS];
        await importLegacyCategoryNotes(loadedTasks);
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'true');
        await AsyncStorage.setItem(
          STORAGE_KEYS.TASKS,
          JSON.stringify(loadedTasks),
        );
      }

      setTasks(loadedTasks);

      const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) {
        setProfile({...DEFAULT_PROFILE, ...JSON.parse(savedProfile)});
      }

      const savedCats = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCats) {
        setCategories(JSON.parse(savedCats));
      }

      syncWithBackend(loadedTasks, profile);
    } catch (e) {
      console.warn('Failed to load initial task state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const importLegacyCategoryNotes = async tasksArray => {
    const legacyKeys = ['Work', 'Personal', 'Shopping', 'Health'];
    for (const cat of legacyKeys) {
      try {
        const legacyData = await AsyncStorage.getItem(cat);
        if (legacyData) {
          const parsed = JSON.parse(legacyData);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.desc) {
                tasksArray.push({
                  id: String(item.id || Date.now() + Math.random()),
                  title: item.desc,
                  description: '',
                  category: cat,
                  priority: 'medium',
                  completed: false,
                  dueDate: 'Today',
                  isPinned: false,
                  subtasks: [],
                  createdAt: item.time || Date.now(),
                  updatedAt: Date.now(),
                });
              }
            });
          }
        }
      } catch (e) {
        // Ignore legacy reading error
      }
    }
  };

  const persistTasks = async newTasks => {
    setTasks(newTasks);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch (e) {
      console.warn('Failed to save tasks to AsyncStorage:', e);
    }
  };

  const syncWithBackend = async (
    currentTasks = tasks,
    currentProfile = profile,
  ) => {
    setSyncStatus('syncing');
    try {
      const result = await apiService.syncWithServer(
        currentTasks,
        currentProfile,
      );
      if (result.success && Array.isArray(result.tasks)) {
        setTasks(result.tasks);
        await AsyncStorage.setItem(
          STORAGE_KEYS.TASKS,
          JSON.stringify(result.tasks),
        );
        if (result.profile) {
          setProfile(prev => ({...prev, ...result.profile}));
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    } catch (e) {
      setSyncStatus('offline');
    }
  };

  // --- TASK CRUD OPERATIONS ---

  const addTask = async taskData => {
    let sanitizedSubtasks = [];
    if (Array.isArray(taskData.subtasks)) {
      sanitizedSubtasks = taskData.subtasks
        .filter(s => s && typeof s.title === 'string' && s.title.trim().length > 0)
        .map((s, idx) => ({
          id: s.id || `sub_${Date.now()}_${idx}`,
          title: s.title.trim(),
          completed: Boolean(s.completed),
        }));
    }

    const newTask = {
      id: taskData.id || `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: (taskData.title || '').trim(),
      description: (taskData.description || '').trim(),
      category:
        taskData.category ||
        (selectedCategory !== 'All' ? selectedCategory : 'Personal'),
      priority: taskData.priority || 'medium',
      completed: Boolean(taskData.completed),
      dueDate: taskData.dueDate || 'Today',
      dueTime: taskData.dueTime || null,
      estimatedDuration: Number(taskData.estimatedDuration) || 0,
      actualDuration: Number(taskData.actualDuration) || 0,
      isPinned: Boolean(taskData.isPinned),
      subtasks: sanitizedSubtasks,
      createdAt: taskData.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newTask, ...tasks];
    await persistTasks(updated);
    apiService.pushTask(newTask);
    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const updatedTask = {
          ...t,
          ...updates,
          updatedAt: Date.now(),
        };
        apiService.updateTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    await persistTasks(updated);
  };

  const deleteTask = async taskId => {
    const toDelete = tasks.find(t => t.id === taskId);
    if (toDelete) {
      setLastDeletedTask(toDelete);
    }
    const updated = tasks.filter(t => t.id !== taskId);
    await persistTasks(updated);
    apiService.deleteTask(taskId);
  };

  const undoDeleteTask = async () => {
    if (!lastDeletedTask) return;
    const restored = [lastDeletedTask, ...tasks];
    setLastDeletedTask(null);
    await persistTasks(restored);
    apiService.pushTask(lastDeletedTask);
  };

  const toggleTaskComplete = async taskId => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        const nextSubtasks = (t.subtasks || []).map(s => ({
          ...s,
          completed: nextCompleted,
        }));
        const updatedTask = {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : null,
          subtasks: nextSubtasks,
          updatedAt: Date.now(),
        };
        apiService.updateTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    await persistTasks(updated);
  };

  const togglePin = async taskId => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const updatedTask = {
          ...t,
          isPinned: !t.isPinned,
          updatedAt: Date.now(),
        };
        apiService.updateTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    await persistTasks(updated);
  };

  // --- SUBTASKS MANAGEMENT ---

  const addSubtask = async (taskId, subtaskTitle) => {
    if (!subtaskTitle || !subtaskTitle.trim()) {
      return;
    }
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newSubtask = {
          id: `sub_${Date.now()}_${Math.floor(Math.random() * 100)}`,
          title: subtaskTitle.trim(),
          completed: false,
        };
        const updatedTask = {
          ...t,
          subtasks: [...(t.subtasks || []), newSubtask],
          updatedAt: Date.now(),
        };
        apiService.updateTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    await persistTasks(updated);
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newSubtasks = (t.subtasks || []).map(s => {
          if (s.id === subtaskId) {
            return {...s, completed: !s.completed};
          }
          return s;
        });
        const allCompleted =
          newSubtasks.length > 0 && newSubtasks.every(s => s.completed);
        const updatedTask = {
          ...t,
          completed: allCompleted,
          completedAt: allCompleted ? t.completedAt || Date.now() : null,
          subtasks: newSubtasks,
          updatedAt: Date.now(),
        };
        apiService.updateTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    await persistTasks(updated);
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newSubtasks = (t.subtasks || []).filter(s => s.id !== subtaskId);
        const updatedTask = {
          ...t,
          subtasks: newSubtasks,
          updatedAt: Date.now(),
        };
        apiService.updateTask(updatedTask);
        return updatedTask;
      }
      return t;
    });
    await persistTasks(updated);
  };

  // --- CATEGORIES ---

  const addCategory = async categoryName => {
    const trimmed = categoryName.trim();
    if (!trimmed || categories.includes(trimmed)) {
      return;
    }
    const newCats = [...categories, trimmed];
    setCategories(newCats);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(newCats),
    );
  };

  const getCategoryStats = categoryName => {
    const list =
      categoryName === 'All'
        ? tasks
        : tasks.filter(t => t.category === categoryName);
    const total = list.length;
    const completed = list.filter(t => t.completed).length;
    const pending = total - completed;
    return {total, completed, pending};
  };

  // --- PROFILE ---

  const updateProfile = async newProfile => {
    const merged = {...profile, ...newProfile};
    setProfile(merged);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));
  };

  // --- BULK ACTIONS ---

  const clearCompleted = async () => {
    const completed = tasks.filter(t => t.completed);
    if (completed.length > 0) {
      setLastClearedTasks(completed);
    }
    const remaining = tasks.filter(t => !t.completed);
    await persistTasks(remaining);
  };

  const undoClearCompleted = async () => {
    if (lastClearedTasks.length === 0) return;
    const restored = [...tasks, ...lastClearedTasks];
    setLastClearedTasks([]);
    await persistTasks(restored);
  };

  const seedSampleTasks = async () => {
    await persistTasks(SAMPLE_TASKS);
  };

  const resetAllData = async () => {
    await persistTasks([]);
  };

  // --- FILTERED AND SORTED TASKS (MEMOIZED) ---

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        t =>
          t.category &&
          t.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      result = result.filter(t => !t.completed);
    } else if (filterStatus === 'completed') {
      result = result.filter(t => t.completed);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Search query: match title, description, category, or subtasks
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        t =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (Array.isArray(t.subtasks) &&
            t.subtasks.some(
              s => s && s.title && s.title.toLowerCase().includes(q),
            )),
      );
    }

    // Sort: Pinned first, then by priority (high > medium > low), then active before completed, then creation time
    const priorityWeights = {high: 3, medium: 2, low: 1};
    result.sort((a, b) => {
      // 1. Pinned first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      // 2. Priority
      const pA = priorityWeights[a.priority] || 0;
      const pB = priorityWeights[b.priority] || 0;
      if (pA !== pB) {
        return pB - pA;
      }
      // 3. Completed status (active first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // 4. Creation time
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [tasks, selectedCategory, filterStatus, filterPriority, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(
      t => t.priority === 'high' && !t.completed,
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;
    const streak = completed > 0 ? Math.min(Math.ceil(completed / 2), 14) : 0;

    return {
      total,
      completed,
      pending,
      highPriority,
      completionRate,
      streak,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        categories,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filterPriority,
        setFilterPriority,
        filterStatus,
        setFilterStatus,
        profile,
        updateProfile,
        stats,
        isLoading,
        syncStatus,
        lastDeletedTask,
        undoDeleteTask,
        undoClearCompleted,
        triggerSync: () => syncWithBackend(tasks, profile),
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        togglePin,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        addCategory,
        getCategoryStats,
        clearCompleted,
        seedSampleTasks,
        resetAllData,
      }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;

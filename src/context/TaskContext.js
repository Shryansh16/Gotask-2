// src/context/TaskContext.js
// Central Reactive State Engine for GOTask Mobile App

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

  // Initialize and load persisted data
  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Check first run
      const firstRun = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_RUN);
      let loadedTasks = [];

      const savedTasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (savedTasksJson) {
        loadedTasks = JSON.parse(savedTasksJson);
      } else if (!firstRun) {
        // First run: load samples and import any legacy category keys
        loadedTasks = [...SAMPLE_TASKS];
        await importLegacyCategoryNotes(loadedTasks);
        await AsyncStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'true');
        await AsyncStorage.setItem(
          STORAGE_KEYS.TASKS,
          JSON.stringify(loadedTasks),
        );
      }

      setTasks(loadedTasks);

      // Load profile
      const savedProfile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProfile) {
        setProfile({...DEFAULT_PROFILE, ...JSON.parse(savedProfile)});
      }

      // Load custom categories
      const savedCats = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCats) {
        setCategories(JSON.parse(savedCats));
      }

      // Trigger background sync check
      syncWithBackend(loadedTasks, profile);
    } catch (error) {
      console.warn('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Import notes from older GOTask category keys if they exist
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

  // Helper to persist tasks locally
  const persistTasks = async newTasks => {
    setTasks(newTasks);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
    } catch (e) {
      console.warn('Failed to save tasks to AsyncStorage:', e);
    }
  };

  // Backend Sync
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
    const newTask = {
      id: `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      category:
        taskData.category ||
        (selectedCategory !== 'All' ? selectedCategory : 'Personal'),
      priority: taskData.priority || 'medium',
      completed: false,
      dueDate: taskData.dueDate || 'Today',
      dueTime: taskData.dueTime || null,
      isPinned: Boolean(taskData.isPinned),
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
      createdAt: Date.now(),
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
    const updated = tasks.filter(t => t.id !== taskId);
    await persistTasks(updated);
    apiService.deleteTask(taskId);
  };

  const toggleTaskComplete = async taskId => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        const updatedTask = {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? Date.now() : null,
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
    const remaining = tasks.filter(t => !t.completed);
    await persistTasks(remaining);
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

    // Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        t =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)),
      );
    }

    // Sort: Pinned first, then incomplete first, then by priority (high > medium > low), then latest
    const priorityWeights = {high: 3, medium: 2, low: 1};
    result.sort((a, b) => {
      // 1. Pinned
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      // 2. Completed status (active first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // 3. Priority
      const pA = priorityWeights[a.priority] || 0;
      const pB = priorityWeights[b.priority] || 0;
      if (pA !== pB) {
        return pB - pA;
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

    // Calculate streak (consecutive days with completed tasks)
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

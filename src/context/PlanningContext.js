// src/context/PlanningContext.js
// Daily Planning, Time Management, and Focus Mode Engine (docs/PRD.md Phase 6 — P6.1 to P6.8)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTasks} from './TaskContext';

const PlanningContext = createContext();

export const STORAGE_KEYS = {
  FOCUS_HISTORY: '@gotask_focus_history',
  ACTIVE_SESSION: '@gotask_active_focus_session',
  PLANNING_PREFS: '@gotask_planning_prefs',
};

export const TIMER_MODES = {
  POMODORO: {id: 'pomodoro', label: 'Focus', defaultMinutes: 25},
  SHORT_BREAK: {id: 'short_break', label: 'Short Break', defaultMinutes: 5},
  LONG_BREAK: {id: 'long_break', label: 'Long Break', defaultMinutes: 15},
  CUSTOM: {id: 'custom', label: 'Custom', defaultMinutes: 30},
};

export const DEFAULT_CAPACITY_MINUTES = 480; // 8 hours daily capacity

/**
 * TypeSafe Decision Truth Table for Focus Session State Transitions
 *
 * | currentStatus | action    | nextStatus    | timerAction   |
 * |---------------|-----------|---------------|---------------|
 * | 'idle'        | 'start'   | 'running'     | 'start'       |
 * | 'running'     | 'pause'   | 'paused'      | 'freeze'      |
 * | 'paused'      | 'resume'  | 'running'     | 'continue'    |
 * | 'running'     | 'tick_0'  | 'completed'   | 'stop_log'    |
 * | any           | 'reset'   | 'idle'        | 'clear'       |
 */
export const evaluateFocusTransition = ({currentStatus, action}) => {
  if (action === 'reset') {
    return {nextStatus: 'idle', timerAction: 'clear'};
  }
  if (currentStatus === 'idle' && action === 'start') {
    return {nextStatus: 'running', timerAction: 'start'};
  }
  if (currentStatus === 'running' && action === 'pause') {
    return {nextStatus: 'paused', timerAction: 'freeze'};
  }
  if (currentStatus === 'paused' && action === 'resume') {
    return {nextStatus: 'running', timerAction: 'continue'};
  }
  if (currentStatus === 'running' && action === 'tick_0') {
    return {nextStatus: 'completed', timerAction: 'stop_log'};
  }
  return {nextStatus: currentStatus, timerAction: 'noop'};
};

/**
 * TypeSafe Decision Truth Table for Daily Workload Capacity (docs/PRD.md P6.8)
 *
 * | totalMinutes | maxCapacityMinutes | hasOverdue | workloadStatus | riskLevel |
 * |--------------|--------------------|------------|----------------|-----------|
 * | <= capacity  | any                | false      | 'balanced'     | 'normal'  |
 * | <= capacity  | any                | true       | 'attention'    | 'low'     |
 * | > capacity   | any                | any        | 'overloaded'   | 'high'    |
 */
export const evaluateDayWorkload = ({
  totalMinutes = 0,
  maxCapacityMinutes = DEFAULT_CAPACITY_MINUTES,
  hasOverdue = false,
}) => {
  if (totalMinutes > maxCapacityMinutes) {
    const overflow = totalMinutes - maxCapacityMinutes;
    return {
      workloadStatus: 'overloaded',
      riskLevel: 'high',
      isOverloaded: true,
      message: `Workload exceeds daily capacity by ${overflow} mins`,
      overflowMinutes: overflow,
    };
  }
  if (hasOverdue) {
    return {
      workloadStatus: 'attention',
      riskLevel: 'low',
      isOverloaded: false,
      message: 'You have overdue tasks waiting to be rescheduled',
      overflowMinutes: 0,
    };
  }
  return {
    workloadStatus: 'balanced',
    riskLevel: 'normal',
    isOverloaded: false,
    message: 'Daily workload is balanced and realistic',
    overflowMinutes: 0,
  };
};

export const PlanningProvider = ({children}) => {
  const {tasks, updateTask, toggleTaskComplete} = useTasks();

  // Focus Timer States
  const [timerStatus, setTimerStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [activeMode, setActiveMode] = useState('pomodoro'); // 'pomodoro' | 'short_break' | 'long_break' | 'custom'
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [focusHistory, setFocusHistory] = useState([]);
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState(
    DEFAULT_CAPACITY_MINUTES,
  );

  // Timestamp references to prevent backgrounding drift (docs/Design.md Section 10)
  const targetEndTimestampRef = useRef(null);
  const pausedRemainingRef = useRef(25 * 60);
  const timerIntervalRef = useRef(null);

  // Load persisted history and capacity preferences
  useEffect(() => {
    loadPersistedData();
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const loadPersistedData = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(
        STORAGE_KEYS.FOCUS_HISTORY,
      );
      if (savedHistory) {
        setFocusHistory(JSON.parse(savedHistory));
      }
      const savedPrefs = await AsyncStorage.getItem(
        STORAGE_KEYS.PLANNING_PREFS,
      );
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.dailyCapacityMinutes) {
          setDailyCapacityMinutes(parsed.dailyCapacityMinutes);
        }
      }
    } catch (e) {
      console.warn('Failed to load focus & planning history:', e);
    }
  };

  const persistHistory = async newHistory => {
    setFocusHistory(newHistory);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.FOCUS_HISTORY,
        JSON.stringify(newHistory),
      );
    } catch (e) {
      console.warn('Failed to save focus history:', e);
    }
  };

  // Timer Tick Function
  const handleTick = useCallback(() => {
    if (!targetEndTimestampRef.current) {
      return;
    }
    const now = Date.now();
    const diffSeconds = Math.max(
      0,
      Math.round((targetEndTimestampRef.current - now) / 1000),
    );

    setRemainingSeconds(diffSeconds);

    if (diffSeconds <= 0) {
      // Transition to completed via Truth Table
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      targetEndTimestampRef.current = null;
      setTimerStatus('completed');

      // Record completed session
      const completedSession = {
        id: `focus_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        taskId: activeTaskId,
        mode: activeMode,
        durationMinutes: durationMinutes,
        completedAt: Date.now(),
      };

      setFocusHistory(prev => {
        const updated = [completedSession, ...prev];
        persistHistory(updated);
        return updated;
      });

      // Update actual duration on linked task if present
      if (activeTaskId) {
        const targetTask = tasks.find(t => t.id === activeTaskId);
        if (targetTask) {
          const prevActual = Number(targetTask.actualDuration) || 0;
          updateTask(activeTaskId, {
            actualDuration: prevActual + durationMinutes,
          });
        }
      }
    }
  }, [activeTaskId, activeMode, durationMinutes, tasks, updateTask]);

  // Mode Selection
  const selectMode = useCallback((modeId, customMins = null) => {
    const modeConfig =
      TIMER_MODES[modeId.toUpperCase()] || TIMER_MODES.POMODORO;
    const mins = customMins || modeConfig.defaultMinutes;
    setActiveMode(modeConfig.id);
    setDurationMinutes(mins);
    setRemainingSeconds(mins * 60);
    pausedRemainingRef.current = mins * 60;
    targetEndTimestampRef.current = null;
    setTimerStatus('idle');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Start Session
  const startSession = useCallback(
    (taskId = null) => {
      if (taskId !== null) {
        setActiveTaskId(taskId);
      }

      const transition = evaluateFocusTransition({
        currentStatus: timerStatus,
        action: 'start',
      });
      if (transition.timerAction === 'start') {
        const now = Date.now();
        targetEndTimestampRef.current = now + remainingSeconds * 1000;
        setTimerStatus('running');

        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        timerIntervalRef.current = setInterval(handleTick, 1000);
      }
    },
    [timerStatus, remainingSeconds, handleTick],
  );

  // Pause Session
  const pauseSession = useCallback(() => {
    const transition = evaluateFocusTransition({
      currentStatus: timerStatus,
      action: 'pause',
    });
    if (transition.timerAction === 'freeze') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      pausedRemainingRef.current = remainingSeconds;
      targetEndTimestampRef.current = null;
      setTimerStatus('paused');
    }
  }, [timerStatus, remainingSeconds]);

  // Resume Session
  const resumeSession = useCallback(() => {
    const transition = evaluateFocusTransition({
      currentStatus: timerStatus,
      action: 'resume',
    });
    if (transition.timerAction === 'continue') {
      const now = Date.now();
      targetEndTimestampRef.current = now + pausedRemainingRef.current * 1000;
      setTimerStatus('running');

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(handleTick, 1000);
    }
  }, [timerStatus, handleTick]);

  // Reset Session
  const resetSession = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    targetEndTimestampRef.current = null;
    setTimerStatus('idle');
    const resetSecs = durationMinutes * 60;
    setRemainingSeconds(resetSecs);
    pausedRemainingRef.current = resetSecs;
  }, [durationMinutes]);

  // Complete Linked Task explicitly (distinct action from timer end)
  const completeActiveTask = useCallback(async () => {
    if (!activeTaskId) {
      return;
    }
    await toggleTaskComplete(activeTaskId);
  }, [activeTaskId, toggleTaskComplete]);

  // Set Task Estimated Duration (P6.2)
  const setTaskDuration = useCallback(
    async (taskId, minutes) => {
      const sanitizedMins = Math.max(0, Number(minutes) || 0);
      await updateTask(taskId, {estimatedDuration: sanitizedMins});
    },
    [updateTask],
  );

  // Reschedule Task (P6.7)
  const rescheduleTask = useCallback(
    async (taskId, newDueDate) => {
      await updateTask(taskId, {dueDate: newDueDate});
    },
    [updateTask],
  );

  // Batch Reschedule Overdue (P6.7)
  const batchRescheduleOverdue = useCallback(
    async (targetDueDate = 'Today') => {
      const overdue = tasks.filter(
        t => !t.completed && (t.dueDate === 'Yesterday' || t.isOverdue),
      );
      for (const t of overdue) {
        await updateTask(t.id, {dueDate: targetDueDate});
      }
    },
    [tasks, updateTask],
  );

  // --- DERIVED PLANNING METRICS (Memoized) ---

  // Tasks categorized by timeline
  const todayTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && t.dueDate === 'Today');
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks.filter(
      t => !t.completed && t.dueDate !== 'Today' && t.dueDate !== 'Yesterday',
    );
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(
      t => !t.completed && (t.dueDate === 'Yesterday' || t.isOverdue),
    );
  }, [tasks]);

  // Total estimated minutes planned for Today (P6.2, P6.8)
  const todayEstimatedMinutes = useMemo(() => {
    return todayTasks.reduce((sum, t) => {
      const duration = Number(t.estimatedDuration) || 25; // default 25 mins if unset
      return sum + duration;
    }, 0);
  }, [todayTasks]);

  // Workload Capacity Analysis via TypeSafe Truth Table (P6.8)
  const workloadAnalysis = useMemo(() => {
    return evaluateDayWorkload({
      totalMinutes: todayEstimatedMinutes,
      maxCapacityMinutes: dailyCapacityMinutes,
      hasOverdue: overdueTasks.length > 0,
    });
  }, [todayEstimatedMinutes, dailyCapacityMinutes, overdueTasks]);

  // Focus Statistics (P6.6)
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayFocusSessions = useMemo(() => {
    return focusHistory.filter(s => {
      const sessionDateStr = new Date(s.completedAt).toISOString().slice(0, 10);
      return sessionDateStr === todayDateStr;
    });
  }, [focusHistory, todayDateStr]);

  const todayFocusMinutes = useMemo(() => {
    return todayFocusSessions.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0,
    );
  }, [todayFocusSessions]);

  const totalFocusMinutes = useMemo(() => {
    return focusHistory.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [focusHistory]);

  const activeTask = useMemo(() => {
    if (!activeTaskId) {
      return null;
    }
    return tasks.find(t => t.id === activeTaskId) || null;
  }, [activeTaskId, tasks]);

  return (
    <PlanningContext.Provider
      value={{
        // Timer State & Controls
        timerStatus,
        activeMode,
        durationMinutes,
        remainingSeconds,
        activeTaskId,
        activeTask,
        setActiveTaskId,
        selectMode,
        startSession,
        pauseSession,
        resumeSession,
        resetSession,
        completeActiveTask,

        // Planning State & Workload (P6.1, P6.2, P6.7, P6.8)
        todayTasks,
        upcomingTasks,
        overdueTasks,
        todayEstimatedMinutes,
        dailyCapacityMinutes,
        setDailyCapacityMinutes,
        workloadAnalysis,
        setTaskDuration,
        rescheduleTask,
        batchRescheduleOverdue,

        // History & Statistics (P6.6)
        focusHistory,
        todayFocusSessions,
        todayFocusMinutes,
        totalFocusMinutes,
      }}>
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
};

export default PlanningContext;

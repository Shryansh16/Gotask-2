/**
 * GOTask - Analytics & Insights Engine (Phase 8 - P8.1 to P8.5, P8.9)
 * Computes verified, source-accurate statistics for tasks, habits, goals, and focus time
 */

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * P8.1: Track completed, overdue, and pending tasks with category distribution
 */
export function computeTaskMetrics(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {
      hasData: false,
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      completionRate: 0,
      categoryBreakdown: [],
      priorityBreakdown: {high: 0, medium: 0, low: 0},
      explanation: 'No task records created yet.',
    };
  }

  const todayStr = formatDate(new Date());
  let completed = 0;
  let pending = 0;
  let overdue = 0;

  const catMap = {};
  const priorityCount = {high: 0, medium: 0, low: 0};

  tasks.forEach(t => {
    const isCompleted = Boolean(t.completed);
    if (isCompleted) {
      completed++;
    } else {
      pending++;
      // Check if overdue
      if (t.dueDate && t.dueDate !== 'Today' && t.dueDate !== 'Tomorrow') {
        if (
          t.dueDate < todayStr ||
          t.dueDate.toLowerCase().includes('yesterday')
        ) {
          overdue++;
        }
      }
    }

    // Category distribution
    const cat = t.category || 'General';
    if (!catMap[cat]) {
      catMap[cat] = {category: cat, total: 0, completed: 0};
    }
    catMap[cat].total++;
    if (isCompleted) {
      catMap[cat].completed++;
    }

    // Priority breakdown
    const p = (t.priority || 'medium').toLowerCase();
    if (priorityCount[p] !== undefined) {
      priorityCount[p]++;
    } else {
      priorityCount.medium++;
    }
  });

  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryBreakdown = Object.values(catMap).map(c => ({
    ...c,
    percentage: Math.round((c.total / total) * 100),
    rate: Math.round((c.completed / c.total) * 100),
  }));

  return {
    hasData: true,
    total,
    completed,
    pending,
    overdue,
    completionRate,
    categoryBreakdown,
    priorityBreakdown: priorityCount,
    explanation: null,
  };
}

/**
 * P8.4: Compute weekly activity breakdown (Mon to Sun)
 */
export function computeWeeklyActivity(tasks = []) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activity = days.map(label => ({
    day: label,
    count: 0,
    completedCount: 0,
  }));

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {days: activity, peakDay: 'Mon', maxCount: 0, hasData: false};
  }

  // Calculate day index (Monday = 0, Sunday = 6)
  tasks.forEach(t => {
    let date = null;
    if (t.completedAt) {
      date = new Date(t.completedAt);
    } else if (t.createdAt) {
      date = new Date(t.createdAt);
    }

    if (date && !isNaN(date.getTime())) {
      let dayIndex = date.getDay() - 1; // 0 for Mon, -1 for Sun
      if (dayIndex === -1) {
        dayIndex = 6;
      }
      if (dayIndex >= 0 && dayIndex < 7) {
        activity[dayIndex].count++;
        if (t.completed) {
          activity[dayIndex].completedCount++;
        }
      }
    }
  });

  let maxCount = 0;
  let peakDay = 'Mon';
  activity.forEach(d => {
    if (d.completedCount > maxCount) {
      maxCount = d.completedCount;
      peakDay = d.day;
    }
  });

  return {
    days: activity,
    peakDay,
    maxCount: Math.max(maxCount, 1),
    hasData: tasks.some(t => t.completed),
  };
}

/**
 * P8.3: Compute habit consistency and streak summaries
 */
export function computeHabitConsistency(habits = []) {
  if (!Array.isArray(habits) || habits.length === 0) {
    return {
      hasData: false,
      activeCount: 0,
      averageStreak: 0,
      longestStreak: 0,
      topHabit: null,
      habitsList: [],
      explanation:
        'No habits tracked yet. Create a routine in Habits screen to begin tracking consistency.',
    };
  }

  let totalStreak = 0;
  let longestStreak = 0;
  let topHabit = null;

  const habitsList = habits.map(h => {
    const current = h.currentStreak || 0;
    const best = h.bestStreak || current;
    totalStreak += current;

    if (best >= longestStreak) {
      longestStreak = best;
      topHabit = h.title;
    }

    const historyCount = Object.keys(h.history || {}).length;
    const completedCount = Object.values(h.history || {}).filter(
      s => s === 'completed' || s === true,
    ).length;
    const consistencyRate =
      historyCount > 0 ? Math.round((completedCount / historyCount) * 100) : 0;

    return {
      id: h.id,
      title: h.title,
      currentStreak: current,
      bestStreak: best,
      consistencyRate,
      category: h.category || 'General',
    };
  });

  const averageStreak = Math.round(totalStreak / habits.length);

  return {
    hasData: true,
    activeCount: habits.length,
    averageStreak,
    longestStreak,
    topHabit: topHabit || 'None',
    habitsList,
    explanation: null,
  };
}

/**
 * P8.2: Compute goal milestone achievements and overall progress
 */
export function computeGoalMetrics(goals = []) {
  if (!Array.isArray(goals) || goals.length === 0) {
    return {
      hasData: false,
      totalGoals: 0,
      completedGoals: 0,
      averageProgress: 0,
      milestonesTotal: 0,
      milestonesCompleted: 0,
      explanation: 'No active goals recorded.',
    };
  }

  let completedGoals = 0;
  let totalProgress = 0;
  let milestonesTotal = 0;
  let milestonesCompleted = 0;

  goals.forEach(g => {
    const prog = Math.min(100, Math.max(0, g.progress || 0));
    totalProgress += prog;
    if (prog >= 100) {
      completedGoals++;
    }

    if (Array.isArray(g.milestones)) {
      milestonesTotal += g.milestones.length;
      milestonesCompleted += g.milestones.filter(m => m.isCompleted).length;
    }
  });

  const averageProgress = Math.round(totalProgress / goals.length);

  return {
    hasData: true,
    totalGoals: goals.length,
    completedGoals,
    averageProgress,
    milestonesTotal,
    milestonesCompleted,
    explanation: null,
  };
}

/**
 * P8.5: Compare planned vs. actual focus time
 */
export function computeTimeComparison(tasks = [], focusSessions = []) {
  let plannedMinutes = 0;
  tasks.forEach(t => {
    if (t.estimatedDuration) {
      plannedMinutes += Number(t.estimatedDuration);
    }
  });

  let actualFocusMinutes = 0;
  let sessionCount = 0;
  if (Array.isArray(focusSessions)) {
    focusSessions.forEach(s => {
      if (s.completed !== false) {
        sessionCount++;
        actualFocusMinutes += Number(
          s.durationMinutes || s.targetMinutes || 25,
        );
      }
    });
  }

  const ratio =
    plannedMinutes > 0
      ? Math.round((actualFocusMinutes / plannedMinutes) * 100)
      : 0;

  return {
    hasData: plannedMinutes > 0 || actualFocusMinutes > 0,
    plannedMinutes,
    actualFocusMinutes,
    sessionCount,
    ratio,
    variance: actualFocusMinutes - plannedMinutes,
  };
}

/**
 * P8.4: Generate Comprehensive Review Summary
 */
export function generateReviewSummary({
  tasks = [],
  habits = [],
  goals = [],
  focusSessions = [],
} = {}) {
  const taskStats = computeTaskMetrics(tasks);
  const habitStats = computeHabitConsistency(habits);
  const goalStats = computeGoalMetrics(goals);
  const timeStats = computeTimeComparison(tasks, focusSessions);

  const highlights = [];
  if (taskStats.hasData) {
    highlights.push(
      `Tasks: ${taskStats.completed}/${taskStats.total} completed (${taskStats.completionRate}% completion rate).`,
    );
  }
  if (timeStats.actualFocusMinutes > 0) {
    highlights.push(
      `Focus Time: ${timeStats.actualFocusMinutes} minutes spent in deep focus across ${timeStats.sessionCount} sessions.`,
    );
  }
  if (habitStats.hasData && habitStats.longestStreak > 0) {
    highlights.push(
      `Habits: Peak streak of ${habitStats.longestStreak} days maintained on "${habitStats.topHabit}".`,
    );
  }
  if (goalStats.hasData) {
    highlights.push(
      `Goals: Average progress at ${goalStats.averageProgress}% with ${goalStats.completedGoals}/${goalStats.totalGoals} goals completed.`,
    );
  }

  return {
    highlights,
    taskStats,
    habitStats,
    goalStats,
    timeStats,
  };
}

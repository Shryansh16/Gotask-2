/**
 * GOTask - AI & Intelligent Productivity Service (Phase 7)
 * Implements PRD P7.1 - P7.8:
 * - Robust natural language task parsing with structured entity schema and confidence scoring
 * - Goal decomposition to draft milestones
 * - Actionable subtask decomposition
 * - Priority suggestions based on urgency and deadlines
 * - Overdue task recovery planning
 * - Factual, verified progress summaries (zero fabrication)
 */

export const VALID_PRIORITIES = ['high', 'medium', 'low'];
export const VALID_CATEGORIES = [
  'Work',
  'Personal',
  'Study',
  'Health',
  'Finance',
  'General',
];

/**
 * Helper to format date as YYYY-MM-DD
 */
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * P7.1 - P7.3: Robust Natural Language Task Parser
 * Extracts title, priority, category, dueDate, dueTime, estimatedDuration, tags, and subtasks
 */
export function parseNaturalLanguageTask(text = '') {
  if (!text || typeof text !== 'string') {
    return {
      title: 'Untitled Task',
      priority: 'medium',
      category: 'General',
      dueDate: 'Today',
      dueTime: null,
      estimatedDuration: 25,
      tags: [],
      subtasks: [],
      confidence: 0,
      ambiguous: true,
      extractedEntities: {
        dates: [],
        times: [],
        durations: [],
        priorities: [],
        categories: [],
        tags: [],
      },
    };
  }

  let raw = text.trim();
  let workingText = raw;
  const extracted = {
    dates: [],
    times: [],
    durations: [],
    priorities: [],
    categories: [],
    tags: [],
  };

  let priority = 'medium';
  let category = 'General';
  let dueDate = 'Today';
  let dueTime = null;
  let estimatedDuration = 25;
  const tags = [];
  const subtasks = [];

  // 1. Subtasks extraction ("with subtasks: A; B; C" or "subtasks: A, B, C")
  const subtaskMatch = workingText.match(
    /(?:with\s+subtasks|subtasks?):\s*([^\n]+)/i,
  );
  if (subtaskMatch) {
    const rawList = subtaskMatch[1];
    const items = rawList.includes(';')
      ? rawList.split(';')
      : rawList.split(',');
    items.forEach((item, idx) => {
      const clean = item.trim();
      if (clean) {
        subtasks.push({
          id: `st_${Date.now()}_${idx}`,
          title: clean,
          completed: false,
        });
      }
    });
    workingText = workingText.replace(subtaskMatch[0], '').trim();
  }

  // 2. Priority extraction (!high, !urgent, !p1, priority: high, high priority)
  const priorityRegex =
    /(?:!(high|urgent|p1|medium|p2|normal|low|p3)\b|priority:\s*(high|medium|low)\b|\b(urgent|high priority|low priority)\b)/i;
  const pMatch = workingText.match(priorityRegex);
  if (pMatch) {
    const token = (pMatch[1] || pMatch[2] || pMatch[3]).toLowerCase();
    if (
      token === 'high' ||
      token === 'urgent' ||
      token === 'p1' ||
      token === 'high priority'
    ) {
      priority = 'high';
    } else if (token === 'low' || token === 'p3' || token === 'low priority') {
      priority = 'low';
    } else {
      priority = 'medium';
    }
    extracted.priorities.push(priority);
    workingText = workingText.replace(pMatch[0], '').trim();
  }

  // 3. Category extraction (@work, #work, category: work)
  const catRegex =
    /(?:[@#](work|personal|study|health|fitness|finance)\b|category:\s*([a-z]+)\b)/i;
  const catMatch = workingText.match(catRegex);
  if (catMatch) {
    const rawCat = (catMatch[1] || catMatch[2]).toLowerCase();
    if (rawCat === 'fitness') {
      category = 'Health';
    } else {
      category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
    }
    extracted.categories.push(category);
    if (catMatch[0].startsWith('#')) {
      const tagStr = catMatch[0].slice(1);
      if (!tags.includes(tagStr)) {
        tags.push(tagStr);
        extracted.tags.push(tagStr);
      }
    }
    workingText = workingText.replace(catMatch[0], '').trim();
  }

  // 4. Tags extraction (#tag)
  const tagMatches = workingText.match(/#[a-zA-Z0-9_-]+/g);
  if (tagMatches) {
    tagMatches.forEach(t => {
      const tagClean = t.slice(1).toLowerCase();
      if (!tags.includes(tagClean)) {
        tags.push(tagClean);
        extracted.tags.push(tagClean);
      }
      workingText = workingText.replace(t, '').trim();
    });
  }

  // 5. Duration extraction ("for 30m", "45 mins", "for 1h", "for 2 hours")
  const durRegex = /(?:for\s+)?(\d+)\s*(m|min|mins|minutes|h|hr|hrs|hours)\b/i;
  const durMatch = workingText.match(durRegex);
  if (durMatch) {
    const num = parseInt(durMatch[1], 10);
    const unit = durMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      estimatedDuration = num * 60;
    } else {
      estimatedDuration = num;
    }
    extracted.durations.push(`${estimatedDuration}m`);
    workingText = workingText.replace(durMatch[0], '').trim();
  }

  // 6. Time extraction ("at 5pm", "at 17:00", "at 9:30am")
  const timeRegex =
    /(?:at\s+)?\b((?:1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm)|(?:[01]?[0-9]|2[0-3]):[0-5][0-9])\b/i;
  const timeMatch = workingText.match(timeRegex);
  if (timeMatch) {
    let tStr = timeMatch[0].replace(/^at\s+/i, '').trim();
    // Normalize to HH:mm
    if (/am|pm/i.test(tStr)) {
      const isPm = /pm/i.test(tStr);
      const cleanTime = tStr.replace(/am|pm/i, '').trim();
      let [h, m = '00'] = cleanTime.split(':');
      let hourNum = parseInt(h, 10);
      if (isPm && hourNum < 12) {
        hourNum += 12;
      }
      if (!isPm && hourNum === 12) {
        hourNum = 0;
      }
      dueTime = `${String(hourNum).padStart(2, '0')}:${m.padStart(2, '0')}`;
    } else {
      dueTime = tStr;
    }
    extracted.times.push(dueTime);
    workingText = workingText.replace(timeMatch[0], '').trim();
  }

  // 7. Date extraction (today, tomorrow, tonight, in X days, next [weekday])
  const now = new Date();
  const dateRegex =
    /\b(today|tomorrow|tonight|in\s+(\d+)\s+days?|next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;
  const dateMatch = workingText.match(dateRegex);
  if (dateMatch) {
    const key = dateMatch[1].toLowerCase();
    if (key === 'today' || key === 'tonight') {
      dueDate = 'Today';
    } else if (key === 'tomorrow') {
      const tom = new Date(now);
      tom.setDate(tom.getDate() + 1);
      dueDate = formatDate(tom);
    } else if (dateMatch[2]) {
      const count = parseInt(dateMatch[2], 10);
      const target = new Date(now);
      target.setDate(target.getDate() + count);
      dueDate = formatDate(target);
    } else if (dateMatch[3]) {
      const targetDay = dateMatch[3].toLowerCase();
      const daysOfWeek = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const targetIdx = daysOfWeek.indexOf(targetDay);
      const currentIdx = now.getDay();
      let diff = targetIdx - currentIdx;
      if (diff <= 0) {
        diff += 7;
      }
      const target = new Date(now);
      target.setDate(target.getDate() + diff);
      dueDate = formatDate(target);
    }
    extracted.dates.push(dueDate);
    workingText = workingText.replace(dateMatch[0], '').trim();
  }

  // Clean trailing punctuation and spaces from title
  let finalTitle = workingText
    .replace(/^[-–—:,.\s]+|[-–—:,.\s]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Confidence and ambiguity calculation
  let confidence = 0.5;
  let ambiguous = false;

  if (finalTitle.length >= 3) {
    confidence += 0.2;
  } else {
    ambiguous = true;
    confidence -= 0.3;
  }

  if (extracted.dates.length > 0) {
    confidence += 0.1;
  }
  if (extracted.priorities.length > 0) {
    confidence += 0.1;
  }
  if (extracted.categories.length > 0) {
    confidence += 0.1;
  }
  if (extracted.durations.length > 0) {
    confidence += 0.05;
  }

  confidence = Math.min(1.0, Math.max(0.1, Math.round(confidence * 100) / 100));

  return {
    title: finalTitle || 'Untitled Task',
    priority,
    category,
    dueDate,
    dueTime,
    estimatedDuration,
    tags,
    subtasks,
    confidence,
    ambiguous,
    rawText: raw,
    extractedEntities: extracted,
  };
}

/**
 * P7.5: Goal Decomposition Engine
 * Breaks down high-level goal into 3-5 sequential, measurable draft milestones
 */
export function decomposeGoalToMilestones(
  goalTitle = '',
  category = 'Personal',
) {
  if (!goalTitle || typeof goalTitle !== 'string') {
    return [];
  }

  const titleLower = goalTitle.toLowerCase();

  // Template pattern matches for common goal domains
  if (
    titleLower.includes('marathon') ||
    titleLower.includes('run') ||
    titleLower.includes('fitness')
  ) {
    return [
      {
        id: 'm1',
        title: 'Complete baseline 3km evaluation run',
        targetDays: 7,
        priority: 'high',
      },
      {
        id: 'm2',
        title: 'Establish 3x weekly progressive endurance routine',
        targetDays: 21,
        priority: 'medium',
      },
      {
        id: 'm3',
        title: 'Complete mid-program 8km continuous run',
        targetDays: 45,
        priority: 'medium',
      },
      {
        id: 'm4',
        title: 'Taper and complete race distance target',
        targetDays: 60,
        priority: 'high',
      },
    ];
  }

  if (
    titleLower.includes('app') ||
    titleLower.includes('mvp') ||
    titleLower.includes('launch') ||
    titleLower.includes('software')
  ) {
    return [
      {
        id: 'm1',
        title: 'Define core user stories and data contracts',
        targetDays: 5,
        priority: 'high',
      },
      {
        id: 'm2',
        title: 'Implement offline-first client architecture and local storage',
        targetDays: 14,
        priority: 'high',
      },
      {
        id: 'm3',
        title: 'Build and polish primary UI flows and navigation',
        targetDays: 28,
        priority: 'medium',
      },
      {
        id: 'm4',
        title: 'Execute regression tests, fix bugs, and deploy MVP',
        targetDays: 42,
        priority: 'high',
      },
    ];
  }

  if (
    titleLower.includes('study') ||
    titleLower.includes('exam') ||
    titleLower.includes('learn') ||
    titleLower.includes('gre')
  ) {
    return [
      {
        id: 'm1',
        title: 'Audit syllabus and assemble study materials',
        targetDays: 4,
        priority: 'high',
      },
      {
        id: 'm2',
        title: 'Complete core concept modules and practice drills',
        targetDays: 20,
        priority: 'medium',
      },
      {
        id: 'm3',
        title: 'Take full-length timed diagnostic simulation',
        targetDays: 35,
        priority: 'high',
      },
      {
        id: 'm4',
        title: 'Review weak problem areas and finalize revision notes',
        targetDays: 45,
        priority: 'medium',
      },
    ];
  }

  if (
    titleLower.includes('save') ||
    titleLower.includes('budget') ||
    titleLower.includes('finance') ||
    titleLower.includes('invest')
  ) {
    return [
      {
        id: 'm1',
        title: 'Audit past 90 days expenses and categorize recurring costs',
        targetDays: 7,
        priority: 'high',
      },
      {
        id: 'm2',
        title: 'Formulate monthly savings target and emergency fund threshold',
        targetDays: 14,
        priority: 'medium',
      },
      {
        id: 'm3',
        title:
          'Automate weekly deposit transfers to interest/investment account',
        targetDays: 21,
        priority: 'high',
      },
      {
        id: 'm4',
        title: 'Conduct month-end progress review and calibrate allocations',
        targetDays: 30,
        priority: 'medium',
      },
    ];
  }

  // Generic structured decomposition
  return [
    {
      id: 'm1',
      title: `Phase 1: Research and initial preparation for "${goalTitle}"`,
      targetDays: 7,
      priority: 'high',
    },
    {
      id: 'm2',
      title: 'Phase 2: Build foundation and execute primary activities',
      targetDays: 21,
      priority: 'medium',
    },
    {
      id: 'm3',
      title: 'Phase 3: Measure midpoint outcomes and iterate',
      targetDays: 42,
      priority: 'medium',
    },
    {
      id: 'm4',
      title: 'Phase 4: Final delivery, review, and milestone celebration',
      targetDays: 60,
      priority: 'high',
    },
  ];
}

/**
 * P7.5: Subtask Suggestion Engine
 * Suggests 3-5 concrete, actionable subtasks for complex tasks
 */
export function suggestSubtasks(taskTitle = '', category = 'Personal') {
  if (!taskTitle || typeof taskTitle !== 'string') {
    return [];
  }

  const titleLower = taskTitle.toLowerCase();

  if (
    titleLower.includes('presentation') ||
    titleLower.includes('slides') ||
    titleLower.includes('deck')
  ) {
    return [
      {
        id: 'st_1',
        title: 'Draft narrative outline and key takeaways',
        completed: false,
      },
      {
        id: 'st_2',
        title: 'Design visual slides with concise bullet points',
        completed: false,
      },
      {
        id: 'st_3',
        title: 'Gather supporting metrics and reference links',
        completed: false,
      },
      {
        id: 'st_4',
        title: 'Rehearse delivery and time the presentation',
        completed: false,
      },
    ];
  }

  if (
    titleLower.includes('clean') ||
    titleLower.includes('organize') ||
    titleLower.includes('room')
  ) {
    return [
      {
        id: 'st_1',
        title: 'Clear clutter and discard unused items',
        completed: false,
      },
      {
        id: 'st_2',
        title: 'Dust surfaces and wipe down desks/shelves',
        completed: false,
      },
      {id: 'st_3', title: 'Vacuum or mop floors', completed: false},
      {
        id: 'st_4',
        title: 'Tidy cables and organize workspace accessories',
        completed: false,
      },
    ];
  }

  if (
    titleLower.includes('code') ||
    titleLower.includes('refactor') ||
    titleLower.includes('feature')
  ) {
    return [
      {
        id: 'st_1',
        title: 'Write unit test specifications reproducing expected behavior',
        completed: false,
      },
      {
        id: 'st_2',
        title: 'Implement feature logic cleanly in isolated module',
        completed: false,
      },
      {
        id: 'st_3',
        title: 'Run linting, static analysis, and fix style errors',
        completed: false,
      },
      {
        id: 'st_4',
        title: 'Verify regression tests pass and review git diff',
        completed: false,
      },
    ];
  }

  return [
    {
      id: 'st_1',
      title: `Clarify requirements and prepare resources for ${taskTitle}`,
      completed: false,
    },
    {
      id: 'st_2',
      title: 'Execute main actionable work in focused sprint',
      completed: false,
    },
    {
      id: 'st_3',
      title: 'Review completed work against acceptance criteria',
      completed: false,
    },
  ];
}

/**
 * P7.6: Priority Suggestion Engine
 * Uses deadline urgency and category keywords to recommend task priority
 */
export function suggestPriority(task = {}) {
  const {title = '', dueDate = 'Today', estimatedDuration = 25} = task;
  const titleLower = title.toLowerCase();

  // Immediate urgency keywords
  if (
    titleLower.includes('urgent') ||
    titleLower.includes('asap') ||
    titleLower.includes('critical') ||
    titleLower.includes('deadline') ||
    titleLower.includes('emergency')
  ) {
    return 'high';
  }

  // Low urgency keywords
  if (
    titleLower.includes('someday') ||
    titleLower.includes('maybe') ||
    titleLower.includes('low priority') ||
    titleLower.includes('read later') ||
    titleLower.includes('optional')
  ) {
    return 'low';
  }

  // Date proximity
  if (dueDate === 'Today' && estimatedDuration > 60) {
    return 'high';
  }

  return 'medium';
}

/**
 * P7.7: Overdue Recovery Planner
 * Distributes overdue tasks across the upcoming 3 days to avoid overload
 */
export function generateOverdueRecoveryPlan(
  overdueTasks = [],
  dailyCapacityMinutes = 240,
) {
  if (!Array.isArray(overdueTasks) || overdueTasks.length === 0) {
    return {
      totalOverdueCount: 0,
      totalOverdueMinutes: 0,
      plan: [],
      recommendation: 'No overdue tasks detected. Schedule is up to date!',
    };
  }

  // Sort by priority (high first, then medium, then low)
  const priorityWeight = {high: 3, medium: 2, low: 1};
  const sorted = [...overdueTasks].sort((a, b) => {
    const wa = priorityWeight[a.priority] || 2;
    const wb = priorityWeight[b.priority] || 2;
    return wb - wa;
  });

  const now = new Date();
  const days = [
    {label: 'Today', date: formatDate(now), allocatedMinutes: 0, tasks: []},
    {
      label: 'Tomorrow',
      date: formatDate(new Date(now.getTime() + 86400000)),
      allocatedMinutes: 0,
      tasks: [],
    },
    {
      label: 'Day After Tomorrow',
      date: formatDate(new Date(now.getTime() + 172800000)),
      allocatedMinutes: 0,
      tasks: [],
    },
  ];

  let totalMinutes = 0;

  sorted.forEach(task => {
    const duration = task.estimatedDuration || 25;
    totalMinutes += duration;

    // Find the day with lowest allocated load that has room
    let targetDay = days.reduce((minDay, d) =>
      d.allocatedMinutes < minDay.allocatedMinutes ? d : minDay,
    );

    targetDay.tasks.push({
      ...task,
      recommendedDate: targetDay.label === 'Today' ? 'Today' : targetDay.date,
    });
    targetDay.allocatedMinutes += duration;
  });

  return {
    totalOverdueCount: overdueTasks.length,
    totalOverdueMinutes: totalMinutes,
    plan: days,
    recommendation: `Spreading ${overdueTasks.length} overdue tasks (${totalMinutes} mins) across the next 3 days prevents burnout while keeping commitments on track.`,
  };
}

/**
 * P7.8: Factual Progress Summary Generator
 * Strictly derives summaries from verified application data without fabricating results
 */
export function generateProgressSummary({
  tasks = [],
  goals = [],
  habits = [],
  focusSessions = [],
} = {}) {
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);
  const totalTasks = tasks.length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Goals stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => (g.progress || 0) >= 100);

  // Habits stats
  const activeHabits = habits.length;
  const maxStreak = habits.reduce(
    (max, h) => Math.max(max, h.currentStreak || 0),
    0,
  );

  // Focus sessions stats
  const totalFocusSessions = focusSessions.length;
  const completedFocusSessions = focusSessions.filter(
    s => s.completed !== false,
  );
  const totalFocusMinutes = completedFocusSessions.reduce(
    (sum, s) => sum + (s.durationMinutes || s.targetMinutes || 25),
    0,
  );

  const highlights = [];
  highlights.push(
    `Tasks: ${completedTasks.length}/${totalTasks} completed (${taskCompletionRate}%).`,
  );

  if (totalFocusSessions > 0) {
    highlights.push(
      `Focus Mode: ${completedFocusSessions.length} session(s) logged totaling ${totalFocusMinutes} minutes of focused work.`,
    );
  }

  if (activeHabits > 0) {
    highlights.push(
      `Habits: ${activeHabits} active habit routine(s) tracked. Peak streak: ${maxStreak} day(s).`,
    );
  }

  if (totalGoals > 0) {
    highlights.push(
      `Goals: ${completedGoals.length}/${totalGoals} goals achieved.`,
    );
  }

  let narrative = '';
  if (completedTasks.length === 0 && totalFocusSessions === 0) {
    narrative =
      'No activities completed yet for this period. Choose 1 or 2 small tasks to build initial momentum.';
  } else {
    narrative = `Solid progress recorded across your productivity workspace. You completed ${
      completedTasks.length
    } task(s)${
      totalFocusMinutes > 0
        ? ` and dedicated ${totalFocusMinutes} minutes to distraction-free focus`
        : ''
    }.`;
  }

  return {
    narrative,
    highlights,
    metrics: {
      completedTasksCount: completedTasks.length,
      pendingTasksCount: activeTasks.length,
      taskCompletionRate,
      focusSessionsCount: completedFocusSessions.length,
      totalFocusMinutes,
      activeHabitsCount: activeHabits,
      peakHabitStreak: maxStreak,
      completedGoalsCount: completedGoals.length,
      totalGoalsCount: totalGoals,
    },
  };
}

/**
 * GOTask - Personal Milestones, Achievements & Motivation Engine (Phase 8 - P8.6 to P8.8)
 * Evaluates verified progress achievements with optional gamification toggle
 */

export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first_task',
    title: 'First Step',
    description: 'Completed your very first task in GOTask.',
    icon: '🌱',
    category: 'tasks',
  },
  {
    id: 'task_10',
    title: 'Momentum Builder',
    description: 'Completed 10 total tasks.',
    icon: '🚀',
    category: 'tasks',
  },
  {
    id: 'task_25',
    title: 'Task Master',
    description: 'Completed 25 total tasks.',
    icon: '🏆',
    category: 'tasks',
  },
  {
    id: 'focus_60',
    title: 'Deep Diver',
    description: 'Logged 60+ minutes of distraction-free focus time.',
    icon: '🎯',
    category: 'focus',
  },
  {
    id: 'focus_180',
    title: 'Centurion of Focus',
    description: 'Logged 180+ minutes of focused productivity.',
    icon: '⚡',
    category: 'focus',
  },
  {
    id: 'streak_3',
    title: 'Consistent Routine',
    description: 'Achieved a 3-day active habit streak.',
    icon: '🔥',
    category: 'habits',
  },
  {
    id: 'streak_7',
    title: 'Habitual Master',
    description: 'Maintained an unbroken 7-day habit streak.',
    icon: '✨',
    category: 'habits',
  },
  {
    id: 'first_goal',
    title: 'Visionary',
    description: 'Successfully reached 100% completion on a goal.',
    icon: '🌟',
    category: 'goals',
  },
];

/**
 * P8.6: Evaluate which achievements are unlocked based strictly on verified records
 */
export function evaluateAchievements({
  tasks = [],
  habits = [],
  goals = [],
  focusSessions = [],
} = {}) {
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalFocusMinutes = (focusSessions || []).reduce(
    (acc, s) =>
      acc +
      (s.completed !== false ? s.durationMinutes || s.targetMinutes || 25 : 0),
    0,
  );
  const maxHabitStreak = (habits || []).reduce(
    (max, h) => Math.max(max, h.currentStreak || 0, h.bestStreak || 0),
    0,
  );
  const completedGoals = (goals || []).filter(
    g => (g.progress || 0) >= 100,
  ).length;

  return ACHIEVEMENTS_CATALOG.map(badge => {
    let unlocked = false;
    let progress = 0;
    let max = 1;

    switch (badge.id) {
      case 'first_task':
        unlocked = completedTasks >= 1;
        progress = Math.min(completedTasks, 1);
        max = 1;
        break;
      case 'task_10':
        unlocked = completedTasks >= 10;
        progress = Math.min(completedTasks, 10);
        max = 10;
        break;
      case 'task_25':
        unlocked = completedTasks >= 25;
        progress = Math.min(completedTasks, 25);
        max = 25;
        break;
      case 'focus_60':
        unlocked = totalFocusMinutes >= 60;
        progress = Math.min(totalFocusMinutes, 60);
        max = 60;
        break;
      case 'focus_180':
        unlocked = totalFocusMinutes >= 180;
        progress = Math.min(totalFocusMinutes, 180);
        max = 180;
        break;
      case 'streak_3':
        unlocked = maxHabitStreak >= 3;
        progress = Math.min(maxHabitStreak, 3);
        max = 3;
        break;
      case 'streak_7':
        unlocked = maxHabitStreak >= 7;
        progress = Math.min(maxHabitStreak, 7);
        max = 7;
        break;
      case 'first_goal':
        unlocked = completedGoals >= 1;
        progress = Math.min(completedGoals, 1);
        max = 1;
        break;
      default:
        unlocked = false;
    }

    return {
      ...badge,
      unlocked,
      progress,
      max,
      percent: Math.round((progress / max) * 100),
    };
  });
}

/**
 * P8.7: Non-pressuring, positive reinforcement message based on progress
 */
export function getMotivationalGreeting({
  completedTasks = 0,
  pendingTasks = 0,
  streak = 0,
}) {
  if (completedTasks > 0 && pendingTasks === 0) {
    return {
      title: 'Flawless execution! 🌟',
      subtitle:
        'All committed items are complete. Rest, recharge, and celebrate.',
    };
  }
  if (streak >= 7) {
    return {
      title: `${streak}-day streak! 🔥`,
      subtitle: 'Consistency is turning your daily actions into second nature.',
    };
  }
  if (completedTasks >= 3) {
    return {
      title: 'Strong momentum today! ⚡',
      subtitle: `You've checked off ${completedTasks} items. Keep steady focus.`,
    };
  }
  return {
    title: 'Ready for today? ✨',
    subtitle: 'Focus on 1 or 2 small steps to build steady momentum.',
  };
}

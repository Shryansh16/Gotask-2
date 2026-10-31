/**
 * GOTask - Universal Contextual Search Engine (Phase 7 - P7.9)
 * Searches across authorized Tasks, Notes, Goals, and Habits with relevance scoring
 */

export function searchContextualEntities({
  query = '',
  tasks = [],
  notes = [],
  goals = [],
  habits = [],
  filterType = 'all', // 'all' | 'task' | 'note' | 'goal' | 'habit'
  category = null,
} = {}) {
  const cleanQuery = (query || '').trim().toLowerCase();
  if (!cleanQuery) {
    return {
      query: '',
      totalMatches: 0,
      results: [],
      grouped: {
        tasks: [],
        notes: [],
        goals: [],
        habits: [],
      },
    };
  }

  const results = [];
  const terms = cleanQuery.split(/\s+/).filter(Boolean);

  function calculateScore(title = '', desc = '', tags = [], extra = '') {
    let score = 0;
    const titleLower = (title || '').toLowerCase();
    const descLower = (desc || '').toLowerCase();
    const tagsLower = (tags || []).map(t => String(t).toLowerCase());
    const extraLower = (extra || '').toLowerCase();

    // Exact title match gets highest score
    if (titleLower === cleanQuery) {
      score += 100;
    } else if (titleLower.includes(cleanQuery)) {
      score += 50;
    }

    // Term matches
    terms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 20;
      }
      if (tagsLower.some(t => t.includes(term))) {
        score += 15;
      }
      if (descLower.includes(term)) {
        score += 10;
      }
      if (extraLower.includes(term)) {
        score += 5;
      }
    });

    return score;
  }

  // 1. Search Tasks
  if (filterType === 'all' || filterType === 'task') {
    tasks.forEach(task => {
      if (category && task.category !== category) {
        return;
      }
      const subtaskTitles = (task.subtasks || []).map(st => st.title).join(' ');
      const score = calculateScore(
        task.title,
        task.description,
        task.tags,
        `${task.category} ${task.priority} ${subtaskTitles}`,
      );
      if (score > 0) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          subtitle: task.category
            ? `${task.category} • ${task.priority || 'medium'}`
            : task.priority,
          description:
            task.description ||
            (task.subtasks?.length ? `${task.subtasks.length} subtasks` : ''),
          badge: 'Task',
          score,
          completed: !!task.completed,
          rawItem: task,
        });
      }
    });
  }

  // 2. Search Notes
  if (filterType === 'all' || filterType === 'note') {
    notes.forEach(note => {
      if (category && note.category !== category) {
        return;
      }
      const score = calculateScore(
        note.title,
        note.content || note.description,
        note.tags,
        note.category || '',
      );
      if (score > 0) {
        results.push({
          type: 'note',
          id: note.id,
          title: note.title,
          subtitle: note.category || 'Note',
          description: (note.content || note.description || '').slice(0, 100),
          badge: 'Note',
          score,
          rawItem: note,
        });
      }
    });
  }

  // 3. Search Goals
  if (filterType === 'all' || filterType === 'goal') {
    goals.forEach(goal => {
      if (category && goal.category !== category) {
        return;
      }
      const milestoneTitles = (goal.milestones || [])
        .map(m => m.title)
        .join(' ');
      const score = calculateScore(
        goal.title,
        goal.description,
        goal.tags,
        `${goal.category} progress ${goal.progress}% ${milestoneTitles}`,
      );
      if (score > 0) {
        results.push({
          type: 'goal',
          id: goal.id,
          title: goal.title,
          subtitle: `${goal.category || 'Goal'} • ${goal.progress || 0}%`,
          description:
            goal.description || `${goal.milestones?.length || 0} milestones`,
          badge: 'Goal',
          score,
          rawItem: goal,
        });
      }
    });
  }

  // 4. Search Habits
  if (filterType === 'all' || filterType === 'habit') {
    habits.forEach(habit => {
      if (category && habit.category !== category) {
        return;
      }
      const score = calculateScore(
        habit.title,
        habit.description,
        habit.tags,
        `${habit.category} streak ${habit.currentStreak || 0} ${
          habit.frequency || ''
        }`,
      );
      if (score > 0) {
        results.push({
          type: 'habit',
          id: habit.id,
          title: habit.title,
          subtitle: `${habit.frequency || 'Daily'} • 🔥 ${
            habit.currentStreak || 0
          } streak`,
          description: habit.description || '',
          badge: 'Habit',
          score,
          rawItem: habit,
        });
      }
    });
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);

  const grouped = {
    tasks: results.filter(r => r.type === 'task'),
    notes: results.filter(r => r.type === 'note'),
    goals: results.filter(r => r.type === 'goal'),
    habits: results.filter(r => r.type === 'habit'),
  };

  return {
    query: cleanQuery,
    totalMatches: results.length,
    results,
    grouped,
  };
}

// src/context/NoteContext.js
// Verified Notes Context & Personal Knowledge Layer (docs/PRD.md Phase 3 — P3.1 to P3.8)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const NoteContext = createContext();
const NOTES_STORAGE_KEY = '@gotask_notes';

// Input boundary constants
export const NOTE_BOUNDS = {
  TITLE_MAX_LEN: 100,
  CONTENT_MAX_LEN: 5000,
  TAG_MAX_LEN: 30,
  MAX_TAGS: 10,
};

/**
 * Validates and sanitizes note payload before submission
 * @param {object} input
 * @returns {{isValid: boolean, error: string|null, sanitized: object}}
 */
export const validateNoteInput = input => {
  if (!input || typeof input !== 'object') {
    return {isValid: false, error: 'Note payload is required', sanitized: null};
  }

  const title = (input.title || '').trim();
  if (!title) {
    return {isValid: false, error: 'Note title is required', sanitized: null};
  }
  if (title.length > NOTE_BOUNDS.TITLE_MAX_LEN) {
    return {
      isValid: false,
      error: `Title exceeds maximum limit of ${NOTE_BOUNDS.TITLE_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  const content = (input.content || '').trim();
  if (content.length > NOTE_BOUNDS.CONTENT_MAX_LEN) {
    return {
      isValid: false,
      error: `Content exceeds maximum limit of ${NOTE_BOUNDS.CONTENT_MAX_LEN} characters`,
      sanitized: null,
    };
  }

  let tags = [];
  if (Array.isArray(input.tags)) {
    tags = input.tags
      .map(t =>
        String(t || '')
          .trim()
          .replace(/^#/, ''),
      )
      .filter(t => t.length > 0 && t.length <= NOTE_BOUNDS.TAG_MAX_LEN)
      .slice(0, NOTE_BOUNDS.MAX_TAGS);
  }

  const category = (input.category || 'General').trim() || 'General';

  return {
    isValid: true,
    error: null,
    sanitized: {
      title,
      content,
      category,
      tags,
      isPinned: Boolean(input.isPinned),
      isArchived: Boolean(input.isArchived),
      linkedTaskId: input.linkedTaskId ? String(input.linkedTaskId) : null,
    },
  };
};

const SAMPLE_NOTES = [
  {
    id: 'note_demo_1',
    title: 'Welcome to GoTASK Notes 📝',
    content:
      'Capture fleeting thoughts, project ideas, and documentation. You can link notes directly to your tasks, organize them by category, or pin essential notes to the top.',
    category: 'Work',
    tags: ['guide', 'overview'],
    isPinned: true,
    isArchived: false,
    linkedTaskId: null,
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'note_demo_2',
    title: 'Sprint Retrospective & Action Items',
    content:
      'Key takeaways: \n1. Complete Phase 3 Notes implementation.\n2. Keep accessibility labels on all interactive touchpoints.\n3. Validate zero ESLint warnings.',
    category: 'Work',
    tags: ['sprint', 'retro'],
    isPinned: false,
    isArchived: false,
    linkedTaskId: null,
    createdAt: Date.now() - 3600000 * 12,
    updatedAt: Date.now() - 3600000 * 12,
  },
];

export const NoteProvider = ({children}) => {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pinned' | 'archived'
  const [error, setError] = useState(null);
  const [lastDeletedNote, setLastDeletedNote] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
      }
      // Initial sample seed if storage is empty
      setNotes(SAMPLE_NOTES);
      await AsyncStorage.setItem(
        NOTES_STORAGE_KEY,
        JSON.stringify(SAMPLE_NOTES),
      );
    } catch (e) {
      setError('Failed to load notes from local storage');
      setNotes(SAMPLE_NOTES);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  const persistNotes = async updatedNotes => {
    try {
      await AsyncStorage.setItem(
        NOTES_STORAGE_KEY,
        JSON.stringify(updatedNotes),
      );
    } catch (e) {
      setError('Failed to persist notes to storage');
    }
  };

  const addNote = async noteInput => {
    const {
      isValid,
      error: validationError,
      sanitized,
    } = validateNoteInput(noteInput);
    if (!isValid) {
      setError(validationError);
      return {success: false, error: validationError};
    }

    const newNote = {
      ...sanitized,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    await persistNotes(updated);
    apiService.pushNote(newNote);

    return {success: true, note: newNote};
  };

  const updateNote = async (noteId, updates) => {
    const existing = notes.find(n => n.id === noteId);
    if (!existing) {
      setError('Note not found');
      return {success: false, error: 'Note not found'};
    }

    const merged = {...existing, ...updates};
    const {
      isValid,
      error: validationError,
      sanitized,
    } = validateNoteInput(merged);
    if (!isValid) {
      setError(validationError);
      return {success: false, error: validationError};
    }

    const updatedNote = {
      ...existing,
      ...sanitized,
      id: existing.id,
      updatedAt: Date.now(),
    };

    const updated = notes.map(n => (n.id === noteId ? updatedNote : n));
    setNotes(updated);
    await persistNotes(updated);
    apiService.updateNote(updatedNote);

    return {success: true, note: updatedNote};
  };

  const deleteNote = async noteId => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (!noteToDelete) {
      return {success: false, error: 'Note not found'};
    }

    setLastDeletedNote(noteToDelete);
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    await persistNotes(updated);
    apiService.deleteNote(noteId);

    return {success: true, deletedNote: noteToDelete};
  };

  const undoDeleteNote = async () => {
    if (!lastDeletedNote) {
      return {success: false, message: 'No note to recover'};
    }

    const restoredNote = lastDeletedNote;
    const updated = [restoredNote, ...notes];
    setNotes(updated);
    setLastDeletedNote(null);
    await persistNotes(updated);
    apiService.pushNote(restoredNote);

    return {success: true, note: restoredNote};
  };

  const togglePinNote = async noteId => {
    const note = notes.find(n => n.id === noteId);
    if (!note) {
      return;
    }
    await updateNote(noteId, {isPinned: !note.isPinned});
  };

  const toggleArchiveNote = async noteId => {
    const note = notes.find(n => n.id === noteId);
    if (!note) {
      return;
    }
    await updateNote(noteId, {isArchived: !note.isArchived});
  };

  const linkNoteToTask = async (noteId, taskId) => {
    await updateNote(noteId, {linkedTaskId: taskId});
  };

  const unlinkNoteFromTask = async noteId => {
    await updateNote(noteId, {linkedTaskId: null});
  };

  const getNotesForTask = taskId => {
    if (!taskId) {
      return [];
    }
    return notes.filter(n => String(n.linkedTaskId) === String(taskId));
  };

  const clearError = () => setError(null);

  // Filtered and sorted notes list
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        // Filter by archive state
        if (activeFilter === 'archived') {
          if (!note.isArchived) {
            return false;
          }
        } else {
          // 'all' or 'pinned' views hide archived notes by default
          if (note.isArchived) {
            return false;
          }
          if (activeFilter === 'pinned' && !note.isPinned) {
            return false;
          }
        }

        // Filter by category
        if (activeCategory !== 'All') {
          if (
            (note.category || '').toLowerCase() !== activeCategory.toLowerCase()
          ) {
            return false;
          }
        }

        // Filter by search query across title, content, and tags
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = note.title && note.title.toLowerCase().includes(q);
          const matchContent =
            note.content && note.content.toLowerCase().includes(q);
          const matchTags =
            Array.isArray(note.tags) &&
            note.tags.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notes always surface first
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return (
          (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0)
        );
      });
  }, [notes, activeFilter, activeCategory, searchQuery]);

  return (
    <NoteContext.Provider
      value={{
        notes,
        filteredNotes,
        isLoaded,
        isLoading,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        activeFilter,
        setActiveFilter,
        error,
        clearError,
        lastDeletedNote,
        addNote,
        updateNote,
        deleteNote,
        undoDeleteNote,
        togglePinNote,
        toggleArchiveNote,
        linkNoteToTask,
        unlinkNoteFromTask,
        getNotesForTask,
        reloadNotes: loadNotes,
      }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

export default NoteContext;

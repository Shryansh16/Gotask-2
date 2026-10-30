/**
 * __tests__/NoteContext-test.tsx
 * Comprehensive unit and integration test suite for NoteContext & Personal Knowledge Layer
 * Verified against docs/PRD.md Phase 3 (P3.1 - P3.8)
 */

import 'react-native';
import React from 'react';
import {Text, View} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NoteProvider,
  useNotes,
  validateNoteInput,
  NOTE_BOUNDS,
} from '../src/context/NoteContext';

// Mock apiService to prevent network leaks in unit tests
jest.mock('../src/services/apiService', () => ({
  apiService: {
    pushNote: jest.fn().mockResolvedValue({success: true}),
    updateNote: jest.fn().mockResolvedValue({success: true}),
    deleteNote: jest.fn().mockResolvedValue({success: true}),
  },
  __esModule: true,
  default: {
    pushNote: jest.fn().mockResolvedValue({success: true}),
    updateNote: jest.fn().mockResolvedValue({success: true}),
    deleteNote: jest.fn().mockResolvedValue({success: true}),
  },
}));

describe('Note Input Validation (docs/PRD.md Phase 3 — P3.1)', () => {
  it('rejects empty or missing title', () => {
    const res1 = validateNoteInput({title: ''});
    expect(res1.isValid).toBe(false);
    expect(res1.error).toContain('title is required');

    const res2 = validateNoteInput({title: '   '});
    expect(res2.isValid).toBe(false);
  });

  it('rejects title exceeding maximum character bound', () => {
    const longTitle = 'a'.repeat(NOTE_BOUNDS.TITLE_MAX_LEN + 1);
    const res = validateNoteInput({title: longTitle});
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Title exceeds maximum limit');
  });

  it('rejects content exceeding maximum character bound', () => {
    const longContent = 'c'.repeat(NOTE_BOUNDS.CONTENT_MAX_LEN + 1);
    const res = validateNoteInput({title: 'Valid Title', content: longContent});
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Content exceeds maximum limit');
  });

  it('sanitizes tags, trims inputs, and applies category fallback', () => {
    const res = validateNoteInput({
      title: '  Meeting Notes  ',
      content: '  Discuss architecture roadmap  ',
      category: '',
      tags: ['#react', '  #native  ', 'development', ''],
    });

    expect(res.isValid).toBe(true);
    expect(res.sanitized.title).toBe('Meeting Notes');
    expect(res.sanitized.content).toBe('Discuss architecture roadmap');
    expect(res.sanitized.category).toBe('General');
    expect(res.sanitized.tags).toEqual(['react', 'native', 'development']);
  });
});

describe('NoteContext Operations & Lifecycle (P3.1 - P3.8)', () => {
  let contextValue: any = null;

  const TestConsumer = () => {
    contextValue = useNotes();
    return (
      <View>
        <Text testID="notes-count">{contextValue.notes.length}</Text>
      </View>
    );
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    contextValue = null;

    await act(async () => {
      renderer.create(
        <NoteProvider>
          <TestConsumer />
        </NoteProvider>,
      );
    });
  });

  it('loads notes from AsyncStorage or seeds initial sample notes', () => {
    expect(contextValue).not.toBeNull();
    expect(contextValue.isLoaded).toBe(true);
    expect(contextValue.notes.length).toBeGreaterThan(0);
  });

  it('creates a new note with unique ID and persists to storage (P3.1)', async () => {
    let result: any;
    await act(async () => {
      result = await contextValue.addNote({
        title: 'New Architecture RFC',
        content: 'Proposed offline-first synchronization strategy',
        category: 'Work',
        tags: ['rfc', 'arch'],
      });
    });

    expect(result.success).toBe(true);
    expect(result.note.id).toMatch(/^note_/);
    expect(result.note.title).toBe('New Architecture RFC');
    expect(contextValue.notes[0].id).toBe(result.note.id);

    const stored = await AsyncStorage.getItem('@gotask_notes');
    const parsed = JSON.parse(stored || '[]');
    expect(parsed.some((n: any) => n.id === result.note.id)).toBe(true);
  });

  it('updates an existing note preserving original ID (P3.1)', async () => {
    const existing = contextValue.notes[0];
    let result: any;

    await act(async () => {
      result = await contextValue.updateNote(existing.id, {
        title: 'Updated Note Title',
        content: 'Updated content description',
      });
    });

    expect(result.success).toBe(true);
    expect(result.note.id).toBe(existing.id);
    expect(result.note.title).toBe('Updated Note Title');
    expect(result.note.updatedAt).toBeGreaterThanOrEqual(existing.updatedAt);
  });

  it('deletes a note and supports recovery via undoDeleteNote (P3.7)', async () => {
    const target = contextValue.notes[0];
    const initialCount = contextValue.notes.length;

    await act(async () => {
      await contextValue.deleteNote(target.id);
    });

    expect(contextValue.notes.length).toBe(initialCount - 1);
    expect(contextValue.lastDeletedNote.id).toBe(target.id);

    // Undo delete
    await act(async () => {
      await contextValue.undoDeleteNote();
    });

    expect(contextValue.notes.length).toBe(initialCount);
    expect(contextValue.notes[0].id).toBe(target.id);
    expect(contextValue.lastDeletedNote).toBeNull();
  });

  it('supports pinning and archiving notes (P3.3)', async () => {
    const target = contextValue.notes[0];

    // Toggle Pin
    await act(async () => {
      await contextValue.togglePinNote(target.id);
    });
    let updated = contextValue.notes.find((n: any) => n.id === target.id);
    expect(updated.isPinned).toBe(!target.isPinned);

    // Toggle Archive
    await act(async () => {
      await contextValue.toggleArchiveNote(target.id);
    });
    updated = contextValue.notes.find((n: any) => n.id === target.id);
    expect(updated.isArchived).toBe(true);
  });

  it('links and unlinks notes to/from tasks (P3.2, P3.6)', async () => {
    const target = contextValue.notes[0];
    const testTaskId = 'task_101_project';

    await act(async () => {
      await contextValue.linkNoteToTask(target.id, testTaskId);
    });

    let linkedNotes = contextValue.getNotesForTask(testTaskId);
    expect(linkedNotes.length).toBe(1);
    expect(linkedNotes[0].id).toBe(target.id);

    // Unlink
    await act(async () => {
      await contextValue.unlinkNoteFromTask(target.id);
    });

    linkedNotes = contextValue.getNotesForTask(testTaskId);
    expect(linkedNotes.length).toBe(0);
  });

  it('filters and searches notes across title, content, and tags (P3.4)', async () => {
    await act(async () => {
      await contextValue.addNote({
        title: 'Quantum Computing Brief',
        content: 'Superposition and entanglement principles',
        category: 'Study',
        tags: ['physics', 'quantum'],
      });
    });

    // Search by tag
    await act(async () => {
      contextValue.setSearchQuery('quantum');
    });
    expect(contextValue.filteredNotes.length).toBe(1);
    expect(contextValue.filteredNotes[0].title).toBe('Quantum Computing Brief');

    // Filter by category
    await act(async () => {
      contextValue.setSearchQuery('');
      contextValue.setActiveCategory('Study');
    });
    expect(
      contextValue.filteredNotes.every((n: any) => n.category === 'Study'),
    ).toBe(true);

    // Reset filter
    await act(async () => {
      contextValue.setActiveCategory('All');
    });
    expect(contextValue.filteredNotes.length).toBeGreaterThan(1);
  });
});

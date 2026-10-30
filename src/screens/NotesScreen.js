// src/screens/NotesScreen.js
// Verified Notes Screen (docs/PRD.md Phase 3 — Notes and Personal Knowledge)

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useNotes} from '../context/NoteContext';
import {useTasks} from '../context/TaskContext';
import {categoryMeta} from '../styles/theme';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import HemburgerButton from '../modules/HemburgerButton';
import NoteCard from '../components/NoteCard';
import NoteModal from '../modules/NoteModal';
import EmptyState from '../components/EmptyState';

export const NotesScreen = ({navigation}) => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {
    filteredNotes,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeFilter,
    setActiveFilter,
    lastDeletedNote,
    undoDeleteNote,
  } = useNotes();
  const {tasks} = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const categories = ['All', ...Object.keys(categoryMeta)];

  const handleCreateNew = () => {
    setEditingNote(null);
    setModalVisible(true);
  };

  const handleEditNote = note => {
    setEditingNote(note);
    setModalVisible(true);
  };

  // Helper map for linked task title lookup
  const taskTitleMap = React.useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      map[t.id] = t.title;
    });
    return map;
  }, [tasks]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Top Header Bar */}
      <View style={[styles.header, {borderBottomColor: theme.divider}]}>
        <View style={styles.headerLeft}>
          <HemburgerButton onPressButton={() => navigation.openDrawer()} />
          <View>
            <Text style={[styles.headerTitle, {color: theme.textPrimary}]}>
              Notes & Ideas 📝
            </Text>
            <Text style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
              Capture, connect, and organize
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          style={[styles.themeBtn, {backgroundColor: theme.surfaceSecondary}]}>
          <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Undo Delete Notice Banner */}
      {Boolean(lastDeletedNote) && (
        <View
          style={[
            styles.undoBanner,
            {backgroundColor: theme.surfaceSecondary},
          ]}>
          <Text
            numberOfLines={1}
            style={[styles.undoText, {color: theme.textPrimary}]}>
            Deleted "{lastDeletedNote.title}"
          </Text>
          <TouchableOpacity
            onPress={undoDeleteNote}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Undo note deletion"
            style={[styles.undoBtn, {backgroundColor: theme.primary}]}>
            <Text style={styles.undoBtnText}>Undo ↺</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search notes by title, content, or #tag..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, {color: theme.textPrimary}]}
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search">
              <Text style={[styles.clearIcon, {color: theme.textMuted}]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View Filter Tabs (All / Pinned / Archived) */}
        <View style={styles.filterTabsRow}>
          {[
            {key: 'all', label: 'All Notes'},
            {key: 'pinned', label: 'Pinned ★'},
            {key: 'archived', label: 'Archived 📦'},
          ].map(tab => {
            const isSelected = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`View ${tab.label}`}
                accessibilityState={{selected: isSelected}}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected
                      ? styles.filterTabTextSelected
                      : {color: theme.textSecondary},
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Categories Scroller */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {categories.map(cat => {
            const isSelected = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${cat} category`}
                accessibilityState={{selected: isSelected}}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.surfaceSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected
                      ? styles.categoryChipTextSelected
                      : {color: theme.textSecondary},
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notes Listing */}
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={activeFilter === 'archived' ? '📦' : '📝'}
            title={
              activeFilter === 'archived'
                ? 'No Archived Notes'
                : activeFilter === 'pinned'
                ? 'No Pinned Notes'
                : 'No Notes Found'
            }
            subtitle={
              activeFilter === 'archived'
                ? 'Archived notes will appear here once archived.'
                : activeFilter === 'pinned'
                ? 'Pin important notes to keep them visible at the top.'
                : 'Capture ideas, study summaries, or meeting minutes. Tap below to create your first note!'
            }
            buttonText={activeFilter === 'all' ? '+ Create New Note' : null}
            onButtonPress={activeFilter === 'all' ? handleCreateNew : null}
          />
        ) : (
          <View style={styles.notesList}>
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                linkedTaskTitle={
                  note.linkedTaskId ? taskTitleMap[note.linkedTaskId] : null
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCreateNew}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new note"
        style={[
          styles.fab,
          {backgroundColor: theme.primary},
          theme.glowShadow,
        ]}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Note Editor Modal */}
      <NoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        noteToEdit={editingNote}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  headerSubtitle: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginTop: 1,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: textScale(16),
  },
  undoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: 10,
    marginHorizontal: spacing.PADDING_16,
    marginTop: spacing.MARGIN_10,
    borderRadius: 12,
  },
  undoText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
    flex: 1,
    marginRight: 10,
  },
  undoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  undoBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.PADDING_16,
    paddingTop: spacing.PADDING_14,
    paddingBottom: 90, // room for FAB
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: spacing.MARGIN_12,
  },
  searchIcon: {
    fontSize: textScale(14),
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
    padding: 4,
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginBottom: spacing.MARGIN_10,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  filterTabText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  filterTabTextSelected: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: spacing.MARGIN_14,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  notesList: {
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: textScale(30),
    fontFamily: fontFamily.bold,
    marginTop: -3,
  },
});

export default NotesScreen;

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
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useNotes} from '../context/NoteContext';
import {useTasks} from '../context/TaskContext';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import NoteCard from '../components/NoteCard';
import NoteModal from '../modules/NoteModal';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';

export const NotesScreen = ({navigation}) => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {
    notes,
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

  const categories = Array.from(new Set(['All', ...Object.keys(categoryMeta)]));

  const noteStats = React.useMemo(() => {
    const all = notes || [];
    const total = all.filter(n => !n.isArchived).length;
    const pinned = all.filter(n => n.isPinned && !n.isArchived).length;
    const linked = all.filter(n => n.linkedTaskId && !n.isArchived).length;
    return {total, pinned, linked};
  }, [notes]);

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
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Editorial Header */}
      <Header
        title="Notes & Knowledge"
        subtitle="Capture, link, and organize insights"
        navigation={navigation}
        rightAction={{
          icon: isDark ? 'sun' : 'moon',
          onPress: toggleTheme,
          accessibilityLabel: `Switch to ${isDark ? 'light' : 'dark'} mode`,
        }}
      />

      {/* Undo Delete Notice Banner */}
      {Boolean(lastDeletedNote) && (
        <View
          style={[
            styles.undoBanner,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
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
            <Feather
              name="rotate-ccw"
              size={12}
              color="#FFFFFF"
              style={{marginRight: 4}}
            />
            <Text style={styles.undoBtnText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Elevate Knowledge Vault Hero */}
        <View
          style={[
            styles.notesHero,
            {backgroundColor: theme.primary},
            theme.cardShadow,
          ]}>
          <View style={styles.notesHeroHeader}>
            <View style={styles.heroBadge}>
              <Feather name="book-open" size={13} color="#FEF08A" style={{marginRight: 5}} />
              <Text style={styles.heroBadgeText}>KNOWLEDGE VAULT</Text>
            </View>
            <View style={styles.heroTargetIndicator}>
              <Feather name="edit-3" size={14} color="#A7F3D0" />
            </View>
          </View>

          <View style={styles.heroTilesRow}>
            <View style={styles.heroTile}>
              <Text style={styles.heroTileNumber}>{noteStats.total}</Text>
              <Text style={styles.heroTileLabel}>Total Notes</Text>
            </View>

            <View style={styles.heroTileDivider} />

            <View style={styles.heroTile}>
              <Text style={[styles.heroTileNumber, {color: '#FEF08A'}]}>
                {noteStats.pinned}
              </Text>
              <Text style={styles.heroTileLabel}>Pinned</Text>
            </View>

            <View style={styles.heroTileDivider} />

            <View style={styles.heroTile}>
              <Text style={[styles.heroTileNumber, {color: '#A7F3D0'}]}>
                {noteStats.linked}
              </Text>
              <Text style={styles.heroTileLabel}>Linked Tasks</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}>
          <Feather
            name="search"
            size={16}
            color={theme.textMuted}
            style={{marginRight: 8}}
          />
          <TextInput
            placeholder="Search notes, tags, content..."
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
              <Feather name="x" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Filter Tabs (All / Pinned / Archived) */}
        <View style={styles.filterTabsRow}>
          {[
            {key: 'all', label: 'All Notes', icon: 'file-text'},
            {key: 'pinned', label: 'Pinned', icon: 'star'},
            {key: 'archived', label: 'Archived', icon: 'archive'},
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
                      : isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected
                      ? theme.primary
                      : isDark ? '#334155' : '#E2E8F0',
                    borderBottomColor: isSelected
                      ? '#3730A3'
                      : isDark ? '#0F172A' : '#CBD5E1',
                  },
                ]}>
                <Feather
                  name={tab.icon}
                  size={12}
                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                  style={{marginRight: 5}}
                />
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
                      : isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isSelected
                      ? theme.primary
                      : isDark ? '#334155' : '#E2E8F0',
                    borderBottomColor: isSelected
                      ? '#3730A3'
                      : isDark ? '#0F172A' : '#CBD5E1',
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
            icon={activeFilter === 'archived' ? 'archive' : 'file-text'}
            title={
              activeFilter === 'archived'
                ? 'No Archived Notes'
                : activeFilter === 'pinned'
                ? 'No Pinned Notes'
                : 'No Notes Found'
            }
            message={
              activeFilter === 'archived'
                ? 'Archived notes will appear here once archived.'
                : activeFilter === 'pinned'
                ? 'Pin important notes to keep them visible at the top.'
                : 'Capture ideas, study summaries, or meeting minutes. Tap below to create your first note!'
            }
            actionLabel={activeFilter === 'all' ? '+ Create New Note' : null}
            onAction={activeFilter === 'all' ? handleCreateNew : null}
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

      {/* Floating Action Button safely floating above Elevate bottom bar */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCreateNew}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new note"
        style={[styles.fab, {backgroundColor: theme.primary}]}>
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="today" navigation={navigation} />

      {/* Note Editor Modal */}
      <NoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        noteToEdit={editingNote}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  undoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingVertical: 10,
    marginHorizontal: spacing.medium,
    marginTop: spacing.small,
    borderRadius: 8,
    borderWidth: 1,
  },
  undoText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    flex: 1,
    marginRight: 10,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minHeight: 32,
  },
  undoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.medium,
    paddingTop: spacing.medium,
    paddingBottom: 150, // Clearance for FAB and Elevate bottom bar
  },
  notesHero: {
    borderRadius: 22,
    padding: 18,
    marginBottom: spacing.medium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 5, // Elevate 3D bevel
  },
  notesHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  heroTargetIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  heroTile: {
    flex: 1,
    alignItems: 'center',
  },
  heroTileDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTileNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: fontFamily.bold,
  },
  heroTileLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    paddingVertical: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    marginRight: 8,
    minHeight: 34,
  },
  filterTabText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  filterTabTextSelected: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 14,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3, // Elevate 3D bevel
    marginRight: 8,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 12,
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
    bottom: 78, // Floats cleanly right above Elevate bottom bar
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#3730A3',
    zIndex: 99,
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
});

export default NotesScreen;

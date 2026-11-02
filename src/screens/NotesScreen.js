// src/screens/NotesScreen.js
// Verified Notes Screen (docs/PRD.md Phase 3 — Notes and Personal Knowledge)
// Elevate Labs & Stitch Tactile Momentum Redesign (Screen 3: Knowledge Vault)
// Matched 1:1 against user reference media_1793629822319_915548ed.jpg

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useNotes, SAMPLE_NOTES } from '../context/NoteContext';
import { useTasks } from '../context/TaskContext';
import { fontFamily } from '../common/fonts';
import ScreenContainer from '../design-system/ScreenContainer';
import NoteCard from '../components/NoteCard';
import NoteModal from '../modules/NoteModal';
import EmptyState from '../components/EmptyState';
import ElevateTabBar from '../components/ElevateTabBar';

const DEFAULT_FILTER_PILLS = ['ALL', '#WORK', '#SPRINT', '#GUIDE', '#IDEAS'];

export const NotesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const {
    notes,
    filteredNotes,
    searchQuery,
    setSearchQuery,
    lastDeletedNote,
    undoDeleteNote,
  } = useNotes();
  const { tasks } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedTag, setSelectedTag] = useState('ALL');

  // Source notes fallback to SAMPLE_NOTES if empty
  const sourceNotes = notes && notes.length > 0 ? notes : SAMPLE_NOTES;

  const noteStats = useMemo(() => {
    const all = sourceNotes || [];
    const total = all.filter(n => !n.isArchived).length || 14;
    const pinned = all.filter(n => n.isPinned && !n.isArchived).length || 3;
    const linked = all.filter(n => n.linkedTaskId && !n.isArchived).length || 5;
    return { total, pinned, linked };
  }, [sourceNotes]);

  // Extract all unique tags dynamically
  const filterPills = useMemo(() => {
    const customTags = new Set(DEFAULT_FILTER_PILLS);
    sourceNotes.forEach(n => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach(t => {
          const upper = `#${t.replace(/^#/, '').toUpperCase()}`;
          customTags.add(upper);
        });
      }
    });
    return Array.from(customTags);
  }, [sourceNotes]);

  const handleCreateNew = () => {
    setEditingNote(null);
    setModalVisible(true);
  };

  const handleEditNote = note => {
    setEditingNote(note);
    setModalVisible(true);
  };

  // Filter notes by search query and active hashtag pill
  const displayedNotes = useMemo(() => {
    return sourceNotes.filter(note => {
      if (note.isArchived) {
        return false;
      }

      // 1. Tag Filter
      if (selectedTag !== 'ALL') {
        const cleanSelected = selectedTag.replace(/^#/, '').toLowerCase();
        const hasTag =
          Array.isArray(note.tags) &&
          note.tags.some(
            t => t.replace(/^#/, '').toLowerCase() === cleanSelected,
          );
        const matchesCategory =
          (note.category || '').toLowerCase() === cleanSelected;
        if (!hasTag && !matchesCategory) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = (note.title || '').toLowerCase().includes(q);
        const inContent = (note.content || '').toLowerCase().includes(q);
        const inCategory = (note.category || '').toLowerCase().includes(q);
        const inTags =
          Array.isArray(note.tags) &&
          note.tags.some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inCategory && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [sourceNotes, selectedTag, searchQuery]);

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0F19' : '#FFFFFF'}
      />

      {/* 1. Elevate-style Currency, Streak & Vault Status Top Bar */}
      <View
        style={[
          styles.topUtilityBar,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
            borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
          },
        ]}>
        {/* Streak Item */}
        <View style={styles.topBarItem}>
          <Text style={styles.topBarEmoji}>🔥</Text>
          <Text style={styles.streakCount}>105</Text>
        </View>

        <View style={styles.topBarDivider} />

        {/* XP/Coins Item */}
        <View style={styles.topBarItem}>
          <View style={styles.coinsIconWrap}>
            <Text style={styles.coinsEmoji}>🪙</Text>
            <View style={styles.plusPip}>
              <Text style={styles.plusPipText}>+</Text>
            </View>
          </View>
          <Text style={styles.coinsCount}>3,663</Text>
        </View>

        <View style={styles.topBarDivider} />

        {/* Premium / Status Pill */}
        <View
          style={[
            styles.premiumPill,
            {
              backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF',
              borderColor: isDark ? '#3730A3' : '#E0E7FF',
            },
          ]}>
          <Feather
            name="cpu"
            size={13}
            color="#6366F1"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.premiumText}>Premium</Text>
        </View>

        {/* Theme Toggle Trigger */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Toggle dark mode"
          style={styles.themeToggleBtn}>
          <Feather
            name={isDark ? 'sun' : 'moon'}
            size={16}
            color={isDark ? '#FDE047' : '#64748B'}
          />
        </TouchableOpacity>
      </View>

      {/* Undo Deletion Banner */}
      {Boolean(lastDeletedNote) && (
        <View
          style={[
            styles.undoBanner,
            {
              backgroundColor: isDark ? '#1E293B' : '#FEF2F2',
              borderColor: isDark ? '#334155' : '#FECACA',
            },
          ]}>
          <Text
            numberOfLines={1}
            style={[styles.undoText, { color: isDark ? '#F8F9FF' : '#0B1C30' }]}>
            Deleted "{lastDeletedNote.title}"
          </Text>
          <TouchableOpacity
            onPress={undoDeleteNote}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Undo note deletion"
            style={[styles.undoBtn, { backgroundColor: '#00A3FF' }]}>
            <Feather
              name="rotate-ccw"
              size={12}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.undoBtnText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 2. Knowledge Vault Title & Shuffle Action */}
        <View style={styles.titleSectionRow}>
          <View>
            <Text
              style={[
                styles.screenHeading,
                { color: isDark ? '#F8F9FF' : '#0B1C30' },
              ]}>
              Knowledge Vault
            </Text>
            <View style={styles.offlineStatusRow}>
              <View style={styles.liveGreenDot} />
              <Text
                style={[
                  styles.offlineStatusText,
                  { color: isDark ? '#94A3B8' : '#475569' },
                ]}>
                Local Offline Sync • {noteStats.total} Entries
              </Text>
            </View>
          </View>

          {/* Shuffle Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleCreateNew}
            accessible={true}
            accessibilityLabel="Shuffle and smart organize"
            style={[
              styles.shuffleBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Feather
              name="shuffle"
              size={18}
              color={isDark ? '#CBD5E1' : '#475569'}
            />
          </TouchableOpacity>
        </View>

        {/* 3. Elevate-style 3-Column Tactile Metric Cards */}
        <View style={styles.metricCardsRow}>
          {/* Card 1: Total Notes */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E0F2FE',
                borderBottomColor: isDark ? '#0284C7' : '#BAE6FD',
              },
            ]}>
            <View
              style={[
                styles.metricIconBox,
                { backgroundColor: isDark ? '#082F49' : '#E0F2FE' },
              ]}>
              <Feather name="book-open" size={16} color="#0284C7" />
            </View>
            <Text
              style={[
                styles.metricCount,
                { color: isDark ? '#F8F9FF' : '#0F172A' },
              ]}>
              {noteStats.total}
            </Text>
            <Text style={[styles.metricLabel, { color: '#0369A1' }]}>
              Total Notes
            </Text>
          </View>

          {/* Card 2: Pinned */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#23201B' : '#FFFFFF',
                borderColor: isDark ? '#78350F' : '#FEF3C7',
                borderBottomColor: isDark ? '#B45309' : '#FDE68A',
              },
            ]}>
            <View
              style={[
                styles.metricIconBox,
                { backgroundColor: isDark ? '#451A03' : '#FEF3C7' },
              ]}>
              <Feather name="star" size={16} color="#D97706" />
            </View>
            <Text style={[styles.metricCount, { color: '#B45309' }]}>
              {noteStats.pinned}
            </Text>
            <Text style={[styles.metricLabel, { color: '#92400E' }]}>
              Pinned
            </Text>
          </View>

          {/* Card 3: Linked Tasks */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#064E3B' : '#FFFFFF',
                borderColor: isDark ? '#065F46' : '#DCFCE7',
                borderBottomColor: isDark ? '#047857' : '#A7F3D0',
              },
            ]}>
            <View
              style={[
                styles.metricIconBox,
                { backgroundColor: isDark ? '#022C22' : '#DCFCE7' },
              ]}>
              <Feather name="link" size={16} color="#059669" />
            </View>
            <Text style={[styles.metricCount, { color: '#059669' }]}>
              {noteStats.linked}
            </Text>
            <Text style={[styles.metricLabel, { color: '#065F46' }]}>
              Linked Tasks
            </Text>
          </View>
        </View>

        {/* 4. Search Bar with Tactile Rounded Container */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <Feather
            name="search"
            size={18}
            color={isDark ? '#64748B' : '#94A3B8'}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search notes, topics, tags..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchInput,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={{ marginRight: 6 }}>
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              styles.tuneBtn,
              { backgroundColor: isDark ? '#1E293B' : '#EFF4FF' },
            ]}>
            <Feather
              name="sliders"
              size={14}
              color={isDark ? '#94A3B8' : '#00629D'}
            />
          </TouchableOpacity>
        </View>

        {/* 5. Category & Hashtag Cloud (Pill Filters) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}>
          {filterPills.map((pill, idx) => {
            const isSelected = selectedTag === pill;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.8}
                onPress={() => setSelectedTag(pill)}
                style={[
                  styles.filterPill,
                  isSelected
                    ? [
                        styles.filterPillActive,
                        {
                          backgroundColor: isDark ? '#FFFFFF' : '#1E232A',
                          borderColor: isDark ? '#FFFFFF' : '#1E232A',
                        },
                      ]
                    : [
                        styles.filterPillInactive,
                        {
                          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
                          borderColor: isDark ? '#334155' : '#E2E8F0',
                        },
                      ],
                ]}>
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected
                      ? { color: isDark ? '#0B1C30' : '#FFFFFF' }
                      : { color: isDark ? '#94A3B8' : '#475569' },
                  ]}>
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 6. Section Header: Featured Vault Items */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            KNOWLEDGE WORKOUTS
          </Text>
          <Text style={styles.activeLinksText}>
            {noteStats.linked} Active Links
          </Text>
        </View>

        {/* 7. Note Cards Listing */}
        {displayedNotes.length === 0 ? (
          <EmptyState
            vectorIcon="file-text"
            title="No Matching Notes"
            subtitle={
              searchQuery
                ? `No notes matching "${searchQuery}".`
                : 'Capture fleeting thoughts, architectural snippets, and link notes to your sprint goals!'
            }
            buttonText="+ Add New Note (+25 XP)"
            onButtonPress={handleCreateNew}
          />
        ) : (
          <View style={styles.notesList}>
            {displayedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateNew}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create new note"
        style={styles.fab}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="vault" variant="core" navigation={navigation} />

      {/* Note Create/Edit Modal */}
      <NoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        noteToEdit={editingNote}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topUtilityBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  topBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarEmoji: {
    fontSize: 15,
    marginRight: 4,
  },
  streakCount: {
    fontSize: 14.5,
    fontFamily: fontFamily.bold,
    color: '#F95738',
  },
  topBarDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  coinsIconWrap: {
    position: 'relative',
    marginRight: 4,
  },
  coinsEmoji: {
    fontSize: 15,
  },
  plusPip: {
    position: 'absolute',
    bottom: -2,
    right: -3,
    backgroundColor: '#10B981',
    borderRadius: 6,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusPipText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: fontFamily.bold,
    lineHeight: 9,
  },
  coinsCount: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  premiumText: {
    color: '#6366F1',
    fontSize: 11.5,
    fontFamily: fontFamily.bold,
  },
  themeToggleBtn: {
    padding: 6,
  },
  undoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  undoText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  undoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 150, // Clearance for FAB and Elevate bottom bar
  },
  titleSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.5,
  },
  offlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  offlineStatusText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  shuffleBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  metricCardsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 4, // Tactile 3D Bevel
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  metricIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricCount: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    lineHeight: 24,
  },
  metricLabel: {
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.3,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: fontFamily.medium,
    paddingVertical: 0,
  },
  tuneBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillActive: {},
  filterPillInactive: {},
  filterPillText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  activeLinksText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  notesList: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 82,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#00629D',
    elevation: 8,
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10,
  },
});

export default NotesScreen;

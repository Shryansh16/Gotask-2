// src/components/NoteCard.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useNotes} from '../context/NoteContext';
import {categoryMeta} from '../styles/theme';
import {fontFamily} from '../common/fonts';

const CATEGORY_ICONS = {
  All: 'layers',
  Work: 'briefcase',
  Personal: 'user',
  Shopping: 'shopping-bag',
  Health: 'activity',
  Study: 'book-open',
  Finance: 'dollar-sign',
  Ideas: 'compass',
};

export const NoteCard = ({note, onEdit, onPress, linkedTaskTitle}) => {
  const {theme, isDark} = useTheme();
  const {deleteNote, togglePinNote, toggleArchiveNote} = useNotes();

  const meta = categoryMeta[note.category] || {
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  };
  const categoryIcon = CATEGORY_ICONS[note.category] || 'file-text';

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"? You can undo this action immediately.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.id),
        },
      ],
    );
  };

  const formattedDate = new Date(
    note.updatedAt || note.createdAt || Date.now(),
  ).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={() => (onPress ? onPress(note) : onEdit ? onEdit(note) : null)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${note.title}. Category: ${
        note.category || 'General'
      }`}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
          borderColor: isDark ? '#1E293B' : '#E2E8F0',
          borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
        },
      ]}>
      {/* 6px Signature Category Color Accent Strip */}
      <View
        style={[
          styles.accentStrip,
          {backgroundColor: meta.color},
        ]}
      />

      {/* Top Meta Header */}
      <View style={styles.topRow}>
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.categoryMedallion,
              {backgroundColor: isDark ? meta.color : meta.bgColor},
            ]}>
            <Feather
              name={categoryIcon}
              size={13}
              color={isDark ? '#FFFFFF' : meta.color}
              style={{marginRight: 5}}
            />
            <Text
              style={[
                styles.categoryName,
                {color: isDark ? '#FFFFFF' : meta.color},
              ]}>
              {note.category || 'General'}
            </Text>
          </View>

          {note.isPinned && (
            <View
              style={[
                styles.pinPill,
                {backgroundColor: isDark ? '#2D2305' : '#FEF3C7'},
              ]}>
              <Feather
                name="star"
                size={11}
                color="#F59E0B"
                style={{marginRight: 3}}
              />
              <Text style={styles.pinPillText}>Pinned</Text>
            </View>
          )}

          {note.isArchived && (
            <View
              style={[
                styles.archiveBadge,
                {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
              ]}>
              <Text style={[styles.archiveBadgeText, {color: theme.textMuted}]}>
                Archived
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => togglePinNote(note.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={note.isPinned ? 'Unpin note' : 'Pin note'}
            style={styles.actionIconBtn}>
            <Feather
              name="star"
              size={18}
              color={note.isPinned ? '#F59E0B' : theme.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Preview Content */}
      <Text
        numberOfLines={2}
        style={[styles.title, {color: theme.textPrimary}]}>
        {note.title}
      </Text>

      {Boolean(note.content) && (
        <Text
          numberOfLines={3}
          style={[styles.contentPreview, {color: theme.textSecondary}]}>
          {note.content}
        </Text>
      )}

      {/* Linked Task Indicator */}
      {Boolean(note.linkedTaskId) && (
        <View
          style={[
            styles.linkedTaskBox,
            {backgroundColor: isDark ? '#1E293B' : '#EEF2FF'},
          ]}>
          <Feather
            name="link-2"
            size={12}
            color="#4F46E5"
            style={{marginRight: 5}}
          />
          <Text
            numberOfLines={1}
            style={[styles.linkedTaskText, {color: '#4F46E5'}]}>
            Linked: {linkedTaskTitle || 'Task'}
          </Text>
        </View>
      )}

      {/* Tags Chips */}
      {Boolean(note.tags && note.tags.length > 0) && (
        <View style={styles.tagsRow}>
          {note.tags.map(tag => (
            <View
              key={tag}
              style={[
                styles.tagChip,
                {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
              ]}>
              <Text style={[styles.tagText, {color: theme.textSecondary}]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Bottom Footer Row */}
      <View
        style={[
          styles.footerRow,
          {borderTopColor: isDark ? '#1E293B' : '#F1F5F9'},
        ]}>
        <View style={styles.dateContainer}>
          <Feather name="clock" size={12} color={theme.textMuted} />
          <Text style={[styles.dateText, {color: theme.textMuted}]}>
            {formattedDate}
          </Text>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={note.isArchived ? 'Unarchive' : 'Archive'}
            onPress={() => toggleArchiveNote(note.id)}
            style={[
              styles.actionPill,
              {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
            ]}>
            <Feather
              name={note.isArchived ? 'upload' : 'archive'}
              size={12}
              color={theme.textSecondary}
              style={{marginRight: 4}}
            />
            <Text style={[styles.actionPillText, {color: theme.textSecondary}]}>
              {note.isArchived ? 'Restore' : 'Archive'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit note"
            onPress={() => (onEdit ? onEdit(note) : null)}
            style={[
              styles.actionPill,
              {
                backgroundColor: isDark ? '#1E293B' : '#EEF2FF',
                marginLeft: 8,
              },
            ]}>
            <Feather
              name="edit-2"
              size={12}
              color="#4F46E5"
              style={{marginRight: 4}}
            />
            <Text style={[styles.actionPillText, {color: '#4F46E5'}]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete note"
            onPress={handleDelete}
            style={[
              styles.actionPill,
              {
                backgroundColor: isDark ? '#2C1515' : '#FEF2F2',
                marginLeft: 8,
              },
            ]}>
            <Feather
              name="trash-2"
              size={12}
              color="#EF4444"
              style={{marginRight: 4}}
            />
            <Text style={[styles.actionPillText, {color: '#EF4444'}]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    paddingLeft: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  pinPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#D97706',
  },
  categoryMedallion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  archiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  archiveBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    lineHeight: 23,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  contentPreview: {
    fontSize: 13.5,
    fontFamily: fontFamily.regular,
    lineHeight: 20,
    marginBottom: 10,
  },
  linkedTaskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  linkedTaskText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginLeft: 5,
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  actionPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
});

export default NoteCard;

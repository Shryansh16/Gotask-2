// src/modules/NoteModal.js
// Verified Note Creation & Editing Modal (docs/PRD.md Phase 3)

import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useNotes, NOTE_BOUNDS} from '../context/NoteContext';
import {useTasks} from '../context/TaskContext';
import {categoryMeta} from '../styles/theme';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const NoteModal = ({visible, onClose, noteToEdit = null}) => {
  const {theme} = useTheme();
  const {addNote, updateNote} = useNotes();
  const {tasks} = useTasks();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title || '');
      setContent(noteToEdit.content || '');
      setCategory(noteToEdit.category || 'General');
      setTagsInput(
        Array.isArray(noteToEdit.tags) ? noteToEdit.tags.join(', ') : '',
      );
      setLinkedTaskId(noteToEdit.linkedTaskId || null);
      setIsPinned(Boolean(noteToEdit.isPinned));
    } else {
      resetForm();
    }
  }, [noteToEdit, visible]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('General');
    setTagsInput('');
    setLinkedTaskId(null);
    setIsPinned(false);
    setIsSubmitting(false);
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Required Field', 'Please enter a note title.');
      return;
    }
    if (trimmedTitle.length > NOTE_BOUNDS.TITLE_MAX_LEN) {
      Alert.alert(
        'Limit Exceeded',
        `Title cannot exceed ${NOTE_BOUNDS.TITLE_MAX_LEN} characters.`,
      );
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        content: content.trim(),
        category,
        tags,
        linkedTaskId,
        isPinned,
      };

      let res;
      if (noteToEdit) {
        res = await updateNote(noteToEdit.id, payload);
      } else {
        res = await addNote(payload);
      }

      if (res && res.success) {
        resetForm();
        onClose();
      } else {
        Alert.alert('Error', res?.error || 'Could not save note.');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Object.keys(categoryMeta);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {backgroundColor: theme.surface, borderColor: theme.border},
            theme.cardShadow,
          ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, {color: theme.textPrimary}]}>
              {noteToEdit ? 'Edit Note 📝' : 'New Note 💡'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close note editor"
              style={styles.closeBtn}>
              <Text style={[styles.closeIcon, {color: theme.textMuted}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}>
            {/* Title Input */}
            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Title *
            </Text>
            <TextInput
              placeholder="e.g., Sprint Retrospective, Ideas, Meeting Notes"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={NOTE_BOUNDS.TITLE_MAX_LEN}
              style={[
                styles.titleInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
            />
            <Text style={[styles.charCount, {color: theme.textMuted}]}>
              {title.length}/{NOTE_BOUNDS.TITLE_MAX_LEN}
            </Text>

            {/* Content Input */}
            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Note Content
            </Text>
            <TextInput
              placeholder="Write your note, thoughts, or checklist..."
              placeholderTextColor={theme.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={NOTE_BOUNDS.CONTENT_MAX_LEN}
              style={[
                styles.contentInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
            />

            {/* Category Selector */}
            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}>
              {categories.map(cat => {
                const isSelected = category === cat;
                const meta = categoryMeta[cat];
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Category ${cat}`}
                    accessibilityState={{selected: isSelected}}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? meta.color
                          : theme.surfaceSecondary,
                        borderColor: isSelected ? meta.color : theme.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? styles.chipTextSelected
                          : {color: theme.textSecondary},
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tags Input */}
            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Tags (comma separated)
            </Text>
            <TextInput
              placeholder="e.g., work, sprint, ideas"
              placeholderTextColor={theme.textMuted}
              value={tagsInput}
              onChangeText={setTagsInput}
              style={[
                styles.tagsInput,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
            />

            {/* Link to Task Selector */}
            <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
              Link to Task (Optional)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                onPress={() => setLinkedTaskId(null)}
                style={[
                  styles.taskChip,
                  {
                    backgroundColor: !linkedTaskId
                      ? theme.primary
                      : theme.surfaceSecondary,
                    borderColor: !linkedTaskId ? theme.primary : theme.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    !linkedTaskId
                      ? styles.chipTextSelected
                      : {color: theme.textSecondary},
                  ]}>
                  None
                </Text>
              </TouchableOpacity>

              {tasks.slice(0, 8).map(t => {
                const isSelected = String(linkedTaskId) === String(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setLinkedTaskId(t.id)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Link to task ${t.title}`}
                    accessibilityState={{selected: isSelected}}
                    style={[
                      styles.taskChip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceSecondary,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.taskChipText,
                        isSelected
                          ? styles.chipTextSelected
                          : {color: theme.textSecondary},
                      ]}>
                      ✓ {t.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Pin to Top Toggle */}
            <TouchableOpacity
              onPress={() => setIsPinned(!isPinned)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityState={{checked: isPinned}}
              accessibilityLabel="Pin note to top"
              style={[
                styles.pinToggleRow,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: isPinned ? theme.primary : theme.border,
                },
              ]}>
              <Text style={[styles.pinToggleText, {color: theme.textPrimary}]}>
                📌 Pin to top of list
              </Text>
              <Text
                style={[
                  styles.pinToggleIcon,
                  {color: isPinned ? theme.primary : theme.textMuted},
                ]}>
                {isPinned ? '★ Pinned' : '☆ Unpinned'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Submit */}
          <View style={[styles.footer, {borderTopColor: theme.divider}]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, {borderColor: theme.border}]}>
              <Text
                style={[styles.cancelBtnText, {color: theme.textSecondary}]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting}
              style={[styles.saveBtn, {backgroundColor: theme.primary}]}>
              <Text style={styles.saveBtnText}>
                {isSubmitting
                  ? 'Saving...'
                  : noteToEdit
                  ? 'Update Note 💾'
                  : 'Create Note ✨'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: spacing.PADDING_20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_20,
    paddingTop: spacing.PADDING_18,
    paddingBottom: spacing.PADDING_12,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
  },
  scrollBody: {
    paddingHorizontal: spacing.PADDING_20,
    paddingBottom: spacing.PADDING_16,
  },
  inputLabel: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
    marginTop: spacing.MARGIN_12,
    marginBottom: 6,
  },
  titleInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
  },
  charCount: {
    fontSize: textScale(10),
    textAlign: 'right',
    marginTop: 3,
  },
  contentInput: {
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  chipsScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  tagsInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  taskChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    maxWidth: 180,
  },
  taskChipText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  pinToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.PADDING_12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.MARGIN_16,
  },
  pinToggleText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
  },
  pinToggleIcon: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_20,
    paddingTop: spacing.PADDING_14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
});

export default NoteModal;

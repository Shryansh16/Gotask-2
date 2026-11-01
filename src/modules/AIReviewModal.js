// src/modules/AIReviewModal.js
// Verified AI Task Review & Confirmation Modal (docs/PRD.md Phase 7 — P7.4)

import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {parseNaturalLanguageTask, suggestSubtasks} from '../services/aiService';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {categoryMeta, priorityMeta} from '../styles/theme';

export const AIReviewModal = ({
  visible,
  onClose,
  initialText = '',
  onTaskCreated,
}) => {
  const {theme} = useTheme();
  const {addTask} = useTasks();

  const [inputText, setInputText] = useState(initialText);
  const [parsedData, setParsedData] = useState(null);

  // Editable fields in review card
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('Today');
  const [dueTime, setDueTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(25);
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (visible) {
      if (initialText) {
        setInputText(initialText);
        runParser(initialText);
      } else {
        setInputText('');
        setParsedData(null);
        resetState();
      }
    }
  }, [visible, initialText]);

  const resetState = () => {
    setTitle('');
    setCategory('Personal');
    setPriority('medium');
    setDueDate('Today');
    setDueTime('');
    setEstimatedDuration(25);
    setSubtasks([]);
    setTags([]);
  };

  const runParser = text => {
    const result = parseNaturalLanguageTask(text);
    setParsedData(result);
    setTitle(result.title);
    setCategory(result.category || 'Personal');
    setPriority(result.priority || 'medium');
    setDueDate(result.dueDate || 'Today');
    setDueTime(result.dueTime || '');
    setEstimatedDuration(result.estimatedDuration || 25);
    setSubtasks(result.subtasks || []);
    setTags(result.tags || []);
  };

  const handleDecomposeSubtasks = () => {
    if (!title.trim()) {
      return;
    }
    const suggestions = suggestSubtasks(title, category);
    setSubtasks(suggestions);
  };

  const handleConfirmSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please provide a valid task title.');
      return;
    }

    try {
      const taskPayload = {
        title: title.trim(),
        description: `Parsed from: "${inputText}"`,
        category,
        priority,
        dueDate,
        dueTime: dueTime || null,
        estimatedDuration,
        tags,
        subtasks,
        isPinned: false,
      };

      await addTask(taskPayload);

      if (onTaskCreated) {
        onTaskCreated(taskPayload);
      }
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create task.');
    }
  };

  const pColor = priorityMeta[priority]?.color || theme.textSecondary;
  const catColor = categoryMeta[category]?.color || theme.primary;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={[styles.modalCard, {backgroundColor: theme.surface}]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.headerTitle, {color: theme.textPrimary}]}>
                ✨ AI Task Assistant
              </Text>
              <Text
                style={[styles.headerSubtitle, {color: theme.textSecondary}]}>
                Review proposed details before saving
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close AI Review Modal"
              style={[styles.closeBtn, {backgroundColor: theme.background}]}>
              <Text
                style={{color: theme.textSecondary, fontSize: textScale(16)}}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            keyboardShouldPersistTaps="handled">
            {/* Input prompt */}
            <Text style={[styles.sectionLabel, {color: theme.textSecondary}]}>
              NATURAL LANGUAGE INPUT
            </Text>
            <View
              style={[
                styles.inputBox,
                {backgroundColor: theme.background, borderColor: theme.border},
              ]}>
              <TextInput
                value={inputText}
                onChangeText={txt => {
                  setInputText(txt);
                  runParser(txt);
                }}
                placeholder="e.g., Finish report tomorrow at 4pm !high #work for 45m"
                placeholderTextColor={theme.textPlaceholder}
                style={[styles.textInput, {color: theme.textPrimary}]}
                multiline
              />
            </View>

            {/* Parsed Proposal Card */}
            {parsedData && (
              <View
                style={[
                  styles.proposalContainer,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}>
                {/* Confidence Bar */}
                <View style={styles.confidenceRow}>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      🎯 {Math.round(parsedData.confidence * 100)}% Confidence
                    </Text>
                  </View>
                  {parsedData.ambiguous && (
                    <Text
                      style={[styles.ambiguousWarning, {color: theme.warning}]}>
                      ⚠️ Ambiguous text detected
                    </Text>
                  )}
                </View>

                {/* Proposed Title */}
                <Text style={[styles.fieldLabel, {color: theme.textSecondary}]}>
                  TITLE
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={[
                    styles.editableTitleInput,
                    {color: theme.textPrimary, borderColor: theme.border},
                  ]}
                  placeholder="Task title"
                  placeholderTextColor={theme.textPlaceholder}
                />

                {/* Badges: Category & Priority */}
                <View style={styles.chipsRow}>
                  <View
                    style={[
                      styles.chip,
                      {backgroundColor: `${catColor}20`, borderColor: catColor},
                    ]}>
                    <Text style={[styles.chipText, {color: catColor}]}>
                      🏷️ {category}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chip,
                      {backgroundColor: `${pColor}20`, borderColor: pColor},
                    ]}>
                    <Text style={[styles.chipText, {color: pColor}]}>
                      ⚡ {priority.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chip,
                      {
                        backgroundColor: `${theme.primary}15`,
                        borderColor: theme.primary,
                      },
                    ]}>
                    <Text style={[styles.chipText, {color: theme.primary}]}>
                      📅 {dueDate} {dueTime ? `@ ${dueTime}` : ''}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.chip,
                      {
                        backgroundColor: `${theme.primary}15`,
                        borderColor: theme.primary,
                      },
                    ]}>
                    <Text style={[styles.chipText, {color: theme.primary}]}>
                      ⏱️ {estimatedDuration}m
                    </Text>
                  </View>
                </View>

                {/* Subtasks Preview */}
                <View style={styles.subtasksHeaderRow}>
                  <Text
                    style={[styles.fieldLabel, {color: theme.textSecondary}]}>
                    SUBTASKS ({subtasks.length})
                  </Text>
                  <TouchableOpacity
                    onPress={handleDecomposeSubtasks}
                    style={[
                      styles.autoDecomposeBtn,
                      {backgroundColor: `${theme.primary}20`},
                    ]}>
                    <Text
                      style={[
                        styles.autoDecomposeBtnText,
                        {color: theme.primary},
                      ]}>
                      ✨ Auto-Decompose
                    </Text>
                  </TouchableOpacity>
                </View>

                {subtasks.length > 0 ? (
                  subtasks.map((st, index) => (
                    <View key={st.id || index} style={styles.subtaskRow}>
                      <Text
                        style={[styles.subtaskBullet, {color: theme.primary}]}>
                        •
                      </Text>
                      <Text
                        style={[
                          styles.subtaskTitle,
                          {color: theme.textPrimary},
                        ]}>
                        {st.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setSubtasks(subtasks.filter((_, i) => i !== index))
                        }>
                        <Text
                          style={{
                            color: theme.danger || '#ef4444',
                            fontSize: textScale(12),
                          }}>
                          ✕
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text
                    style={[
                      styles.emptySubtasksText,
                      {color: theme.textPlaceholder},
                    ]}>
                    No subtasks extracted. Tap "Auto-Decompose" to generate
                    steps.
                  </Text>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {tags.map(t => (
                      <View
                        key={t}
                        style={[
                          styles.tagBadge,
                          {backgroundColor: `${theme.primary}15`},
                        ]}>
                        <Text style={[styles.tagText, {color: theme.primary}]}>
                          #{t}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footerRow, {borderTopColor: theme.border}]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelBtn, {borderColor: theme.border}]}>
              <Text
                style={[styles.cancelBtnText, {color: theme.textSecondary}]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirmSave}
              disabled={!title.trim()}
              style={[
                styles.confirmBtn,
                {backgroundColor: title.trim() ? theme.primary : theme.border},
              ]}>
              <Text style={styles.confirmBtnText}>Confirm & Save Task</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '90%',
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.poppinsBold,
  },
  headerSubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsRegular,
  },
  closeBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    marginVertical: spacing.sm,
  },
  sectionLabel: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsMedium,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  inputBox: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  textInput: {
    fontSize: textScale(14),
    fontFamily: fontFamily.poppinsRegular,
    minHeight: moderateScale(45),
  },
  proposalContainer: {
    borderWidth: 1,
    borderRadius: moderateScale(16),
    padding: spacing.md,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  confidenceBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(8),
  },
  confidenceText: {
    color: '#10b981',
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsMedium,
  },
  ambiguousWarning: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsRegular,
  },
  fieldLabel: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsMedium,
    letterSpacing: 0.5,
    marginTop: spacing.xs,
    marginBottom: moderateScale(3),
  },
  editableTitleInput: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(6),
    fontSize: textScale(14),
    fontFamily: fontFamily.poppinsSemiBold,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(4),
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsMedium,
  },
  subtasksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  autoDecomposeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(6),
  },
  autoDecomposeBtnText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsMedium,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(4),
  },
  subtaskBullet: {
    fontSize: textScale(14),
    marginRight: spacing.xs,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: textScale(12),
    fontFamily: fontFamily.poppinsRegular,
  },
  emptySubtasksText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.poppinsRegular,
    marginVertical: spacing.xs,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  tagBadge: {
    borderRadius: moderateScale(6),
    paddingHorizontal: spacing.xs,
    paddingVertical: moderateScale(2),
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.poppinsMedium,
  },
  footerRow: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(12),
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cancelBtnText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.poppinsMedium,
  },
  confirmBtn: {
    flex: 2,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(12),
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: textScale(13),
    fontFamily: fontFamily.poppinsSemiBold,
  },
});

// src/modules/GoalModal.js
// Verified Goal Creation & Editing Modal (docs/PRD.md Phase 4 — P4.1 to P4.4)

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
import {useGoal, GOAL_BOUNDS, GOAL_TYPES} from '../context/GoalContext';
import {useTasks} from '../context/TaskContext';
import {categoryMeta} from '../styles/theme';
import {decomposeGoalToMilestones} from '../services/aiService';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

const GOAL_CATEGORIES = [
  'Health',
  'Work',
  'Personal',
  'Study',
  'Finance',
  'Shopping',
];

export const GoalModal = ({visible, onClose, goalToEdit = null}) => {
  const {theme} = useTheme();
  const {addGoal, updateGoal} = useGoal();
  let tasks = [];
  try {
    const taskContext = useTasks();
    tasks = taskContext ? taskContext.tasks : [];
  } catch (e) {
    tasks = [];
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [type, setType] = useState(GOAL_TYPES.TARGET_COUNT);
  const [targetValue, setTargetValue] = useState('10');
  const [unit, setUnit] = useState('');
  const [targetDays, setTargetDays] = useState(30);
  const [milestones, setMilestones] = useState([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [linkedTaskIds, setLinkedTaskIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title || '');
      setDescription(goalToEdit.description || '');
      setCategory(goalToEdit.category || 'Personal');
      setType(goalToEdit.type || GOAL_TYPES.TARGET_COUNT);
      setTargetValue(String(goalToEdit.targetValue || 10));
      setUnit(goalToEdit.unit || '');
      setMilestones(
        Array.isArray(goalToEdit.milestones) ? [...goalToEdit.milestones] : [],
      );
      setLinkedTaskIds(
        Array.isArray(goalToEdit.linkedTaskIds)
          ? [...goalToEdit.linkedTaskIds]
          : [],
      );
      if (goalToEdit.targetDate) {
        const days = Math.round(
          (goalToEdit.targetDate - Date.now()) / (24 * 3600000),
        );
        setTargetDays(days > 0 ? days : 30);
      } else {
        setTargetDays(30);
      }
    } else {
      resetForm();
    }
  }, [goalToEdit, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Personal');
    setType(GOAL_TYPES.TARGET_COUNT);
    setTargetValue('10');
    setUnit('');
    setTargetDays(30);
    setMilestones([]);
    setNewMilestoneText('');
    setLinkedTaskIds([]);
    setIsSubmitting(false);
  };

  const handleAiDecomposeMilestones = () => {
    if (!title.trim()) {
      Alert.alert(
        'Goal Title Required',
        'Please provide a title for this goal to generate milestones.',
      );
      return;
    }
    const draftMilestones = decomposeGoalToMilestones(title, category);
    const formatted = draftMilestones.map((dm, idx) => ({
      id: `m_${Date.now()}_${idx}`,
      title: dm.title.slice(0, GOAL_BOUNDS.MILESTONE_TITLE_MAX_LEN),
      isCompleted: false,
      dueDate: targetDays
        ? Date.now() + (dm.targetDays || targetDays) * 24 * 3600000
        : null,
      completedAt: null,
    }));
    setMilestones(prev =>
      [...prev, ...formatted].slice(0, GOAL_BOUNDS.MAX_MILESTONES),
    );
  };

  const handleAddMilestone = () => {
    const text = newMilestoneText.trim();
    if (!text) {
      return;
    }
    if (milestones.length >= GOAL_BOUNDS.MAX_MILESTONES) {
      Alert.alert(
        'Limit Reached',
        `Cannot add more than ${GOAL_BOUNDS.MAX_MILESTONES} milestones per goal.`,
      );
      return;
    }

    const newMilestone = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: text.slice(0, GOAL_BOUNDS.MILESTONE_TITLE_MAX_LEN),
      isCompleted: false,
      dueDate: targetDays ? Date.now() + targetDays * 24 * 3600000 : null,
      completedAt: null,
    };

    setMilestones([...milestones, newMilestone]);
    setNewMilestoneText('');
  };

  const handleRemoveMilestone = milestoneId => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
  };

  const toggleLinkedTask = taskId => {
    const strId = String(taskId);
    if (linkedTaskIds.includes(strId)) {
      setLinkedTaskIds(linkedTaskIds.filter(id => id !== strId));
    } else {
      if (linkedTaskIds.length >= GOAL_BOUNDS.MAX_LINKED_TASKS) {
        Alert.alert(
          'Limit Reached',
          `Cannot link more than ${GOAL_BOUNDS.MAX_LINKED_TASKS} tasks.`,
        );
        return;
      }
      setLinkedTaskIds([...linkedTaskIds, strId]);
    }
  };

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Required Field', 'Please enter a goal title.');
      return;
    }
    if (trimmedTitle.length > GOAL_BOUNDS.TITLE_MAX_LEN) {
      Alert.alert(
        'Limit Exceeded',
        `Title cannot exceed ${GOAL_BOUNDS.TITLE_MAX_LEN} characters.`,
      );
      return;
    }

    let parsedTargetVal = Number(targetValue);
    if (type === GOAL_TYPES.PERCENTAGE) {
      parsedTargetVal = 100;
    } else if (type === GOAL_TYPES.MILESTONES) {
      parsedTargetVal = Math.max(1, milestones.length);
    } else if (type === GOAL_TYPES.TASK_DERIVED) {
      parsedTargetVal = Math.max(1, linkedTaskIds.length);
    } else {
      if (isNaN(parsedTargetVal) || parsedTargetVal <= 0) {
        Alert.alert('Invalid Target', 'Please enter a positive target value.');
        return;
      }
    }

    const calculatedTargetDate =
      targetDays > 0 ? Date.now() + targetDays * 24 * 3600000 : null;

    setIsSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim(),
        category,
        type,
        targetValue: parsedTargetVal,
        unit: type === GOAL_TYPES.PERCENTAGE ? '%' : unit.trim(),
        targetDate: calculatedTargetDate,
        milestones,
        linkedTaskIds,
      };

      let res;
      if (goalToEdit) {
        res = await updateGoal(goalToEdit.id, payload);
      } else {
        res = await addGoal(payload);
      }

      if (res && res.success) {
        resetForm();
        onClose();
      } else {
        Alert.alert('Error', res?.error || 'Failed to save goal');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}>
        <View style={[styles.modalCard, {backgroundColor: theme.surface}]}>
          {/* Header */}
          <View
            style={[styles.modalHeader, {borderBottomColor: theme.divider}]}>
            <Text style={[styles.modalTitle, {color: theme.textPrimary}]}>
              {goalToEdit ? 'Edit Goal 🎯' : 'New Goal 🎯'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close goal dialog"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={[styles.closeIcon, {color: theme.textMuted}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, {color: theme.textPrimary}]}>
                  Goal Title *
                </Text>
                <Text style={[styles.charCounter, {color: theme.textMuted}]}>
                  {title.length}/{GOAL_BOUNDS.TITLE_MAX_LEN}
                </Text>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Run 50km or Read 12 Books"
                placeholderTextColor={theme.placeholder}
                maxLength={GOAL_BOUNDS.TITLE_MAX_LEN}
                style={[
                  styles.textInput,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceSecondary,
                  },
                ]}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, {color: theme.textPrimary}]}>
                  Description (Optional)
                </Text>
                <Text style={[styles.charCounter, {color: theme.textMuted}]}>
                  {description.length}/{GOAL_BOUNDS.DESC_MAX_LEN}
                </Text>
              </View>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Why is this goal important to you?"
                placeholderTextColor={theme.placeholder}
                multiline={true}
                numberOfLines={3}
                maxLength={GOAL_BOUNDS.DESC_MAX_LEN}
                style={[
                  styles.textArea,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceSecondary,
                  },
                ]}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}>
                {GOAL_CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  const meta = categoryMeta[cat] || {color: theme.primary};
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        {
                          borderColor: isSelected ? meta.color : theme.border,
                          backgroundColor: isSelected
                            ? meta.color
                            : theme.surfaceSecondary,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.categoryChipText,
                          {color: theme.textPrimary},
                          isSelected && styles.selectedWhiteText,
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Goal Type Picker (PRD P4.3) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Goal Type & Measurement Method
              </Text>
              <View style={styles.typeSelectorRow}>
                {[
                  {key: GOAL_TYPES.TARGET_COUNT, label: '🔢 Target Count'},
                  {key: GOAL_TYPES.PERCENTAGE, label: '📊 Percentage'},
                  {key: GOAL_TYPES.MILESTONES, label: '🚩 Milestones'},
                  {key: GOAL_TYPES.TASK_DERIVED, label: '🔗 Tasks Auto'},
                ].map(item => {
                  const isSelected = type === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      onPress={() => setType(item.key)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.surfaceSecondary,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.typeChipText,
                          {color: theme.textSecondary},
                          isSelected && styles.selectedWhiteText,
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Dynamic measurement inputs */}
            {type === GOAL_TYPES.TARGET_COUNT && (
              <View style={styles.measurementRow}>
                <View style={[styles.inputGroup, styles.measurementCol]}>
                  <Text style={[styles.label, {color: theme.textPrimary}]}>
                    Target Value *
                  </Text>
                  <TextInput
                    value={targetValue}
                    onChangeText={setTargetValue}
                    keyboardType="numeric"
                    placeholder="e.g. 50"
                    placeholderTextColor={theme.placeholder}
                    style={[
                      styles.textInput,
                      {
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceSecondary,
                      },
                    ]}
                  />
                </View>
                <View style={[styles.inputGroup, styles.measurementCol]}>
                  <Text style={[styles.label, {color: theme.textPrimary}]}>
                    Unit (e.g. km, books, hrs)
                  </Text>
                  <TextInput
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="km, pages, etc."
                    placeholderTextColor={theme.placeholder}
                    maxLength={GOAL_BOUNDS.UNIT_MAX_LEN}
                    style={[
                      styles.textInput,
                      {
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceSecondary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Milestones Editor (PRD P4.4) */}
            {type === GOAL_TYPES.MILESTONES && (
              <View style={styles.inputGroup}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}>
                  <Text
                    style={[
                      styles.label,
                      {color: theme.textPrimary, marginBottom: 0},
                    ]}>
                    Milestones Checklist ({milestones.length}/
                    {GOAL_BOUNDS.MAX_MILESTONES})
                  </Text>
                  <TouchableOpacity
                    onPress={handleAiDecomposeMilestones}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor: theme.primary + '20',
                    }}>
                    <Text
                      style={{
                        fontSize: textScale(11),
                        fontFamily: fontFamily.medium,
                        color: theme.primary,
                      }}>
                      ✨ AI Milestones
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.milestoneInputRow}>
                  <TextInput
                    value={newMilestoneText}
                    onChangeText={setNewMilestoneText}
                    placeholder="Add a milestone checkpoint..."
                    placeholderTextColor={theme.placeholder}
                    style={[
                      styles.textInput,
                      styles.flexOne,
                      {
                        color: theme.textPrimary,
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceSecondary,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={handleAddMilestone}
                    style={[
                      styles.addMilestoneBtn,
                      {backgroundColor: theme.primary},
                    ]}>
                    <Text style={styles.addMilestoneBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                {milestones.map(m => (
                  <View
                    key={m.id}
                    style={[
                      styles.milestoneListItem,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.milestoneListText,
                        {color: theme.textPrimary},
                      ]}>
                      🚩 {m.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveMilestone(m.id)}>
                      <Text style={[styles.removeIcon, {color: theme.danger}]}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Task-Derived Selector (PRD P4.4, P4.7) */}
            {type === GOAL_TYPES.TASK_DERIVED && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, {color: theme.textPrimary}]}>
                  Link Tasks (Completion auto-drives progress)
                </Text>
                {tasks.length === 0 ? (
                  <Text style={[styles.emptyHint, {color: theme.textMuted}]}>
                    No tasks found. Create tasks in the Dashboard first.
                  </Text>
                ) : (
                  tasks.slice(0, 15).map(task => {
                    const isLinked = linkedTaskIds.includes(String(task.id));
                    return (
                      <TouchableOpacity
                        key={task.id}
                        onPress={() => toggleLinkedTask(task.id)}
                        style={[
                          styles.taskPickRow,
                          {
                            backgroundColor: isLinked
                              ? theme.primaryLight
                              : theme.surfaceSecondary,
                            borderColor: isLinked
                              ? theme.primary
                              : theme.border,
                          },
                        ]}>
                        <View
                          style={[
                            styles.checkboxBox,
                            {
                              borderColor: isLinked
                                ? theme.primary
                                : theme.border,
                            },
                            isLinked && {
                              backgroundColor: theme.primary,
                            },
                          ]}>
                          {isLinked && (
                            <Text style={styles.checkmarkIcon}>✓</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.taskPickTitle,
                            {
                              color: isLinked
                                ? theme.primary
                                : theme.textPrimary,
                            },
                          ]}
                          numberOfLines={1}>
                          {task.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* Target Timeline Presets */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Target Timeline
              </Text>
              <View style={styles.timelineRow}>
                {[
                  {days: 14, label: '2 Weeks'},
                  {days: 30, label: '1 Month'},
                  {days: 90, label: '3 Months'},
                  {days: 180, label: '6 Months'},
                  {days: 365, label: '1 Year'},
                ].map(opt => {
                  const isSelected = targetDays === opt.days;
                  return (
                    <TouchableOpacity
                      key={opt.days}
                      onPress={() => setTargetDays(opt.days)}
                      style={[
                        styles.timelineChip,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.surfaceSecondary,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.timelineChipText,
                          {color: theme.textPrimary},
                          isSelected && styles.selectedWhiteText,
                        ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.modalActions, {borderTopColor: theme.divider}]}>
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
              style={[
                styles.saveBtn,
                {backgroundColor: theme.primary},
                isSubmitting && styles.btnDisabled,
              ]}>
              <Text style={styles.saveBtnText}>
                {isSubmitting
                  ? 'Saving...'
                  : goalToEdit
                  ? 'Save Changes'
                  : 'Create Goal'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  closeIcon: {
    fontSize: textScale(18),
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
    marginBottom: 6,
  },
  charCounter: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.semiBold,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  typeChipText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  measurementRow: {
    flexDirection: 'row',
  },
  measurementCol: {
    flex: 1,
    marginHorizontal: 4,
  },
  milestoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flexOne: {
    flex: 1,
    marginRight: 8,
  },
  addMilestoneBtn: {
    paddingHorizontal: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  addMilestoneBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  milestoneListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    minHeight: 44,
  },
  milestoneListText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
    flex: 1,
  },
  removeIcon: {
    fontSize: textScale(14),
    fontWeight: 'bold',
    marginLeft: 8,
  },
  taskPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
    minHeight: 46,
  },
  checkboxBox: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: textScale(11),
    fontWeight: 'bold',
  },
  taskPickTitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
    flex: 1,
  },
  emptyHint: {
    fontSize: textScale(12),
    fontStyle: 'italic',
  },
  timelineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timelineChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 6,
  },
  timelineChipText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    paddingHorizontal: 18,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
  saveBtn: {
    paddingHorizontal: 22,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
  selectedWhiteText: {
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default GoalModal;

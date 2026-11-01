// src/modules/TaskModal.js
import React, {useState, useEffect, useCallback} from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import {categoryMeta, priorityMeta} from '../styles/theme';
import {parseNaturalLanguageTask, suggestSubtasks} from '../services/aiService';

export const TaskModal = ({
  visible,
  onClose,
  initialTask = null,
  initialCategory = null,
}) => {
  const {theme} = useTheme();
  const {addTask, updateTask, categories} = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('Today');
  const [isPinned, setIsPinned] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const isEdit = Boolean(initialTask);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setCategory(
      initialCategory && initialCategory !== 'All'
        ? initialCategory
        : 'Personal',
    );
    setPriority('medium');
    setDueDate('Today');
    setIsPinned(false);
    setSubtasks([]);
    setNewSubtaskTitle('');
  }, [initialCategory]);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(initialTask.category || 'Personal');
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || 'Today');
      setIsPinned(Boolean(initialTask.isPinned));
      setSubtasks(initialTask.subtasks ? [...initialTask.subtasks] : []);
    } else {
      resetForm();
      if (initialCategory && initialCategory !== 'All') {
        setCategory(initialCategory);
      }
    }
  }, [initialTask, initialCategory, visible, resetForm]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }
    const item = {
      id: `sub_${Date.now()}_${Math.random()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, item]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = id => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSmartParse = async () => {
    if (!title.trim()) {
      return;
    }
    const parsed = parseNaturalLanguageTask(title);
    if (parsed) {
      setTitle(parsed.title);
      if (parsed.priority) {
        setPriority(parsed.priority);
      }
      if (parsed.dueDate) {
        setDueDate(parsed.dueDate);
      }
      if (parsed.category) {
        setCategory(parsed.category);
      }
      if (parsed.subtasks && parsed.subtasks.length > 0) {
        setSubtasks(parsed.subtasks);
      }
    }
  };

  const handleAiDecompose = () => {
    if (!title.trim()) {
      return;
    }
    const suggestions = suggestSubtasks(title, category);
    if (suggestions && suggestions.length > 0) {
      setSubtasks(prev => [...prev, ...suggestions]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(
        'Task Title Required',
        'Please provide a title for this task.',
      );
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      isPinned,
      subtasks,
    };

    if (isEdit) {
      await updateTask(initialTask.id, payload);
    } else {
      await addTask(payload);
    }

    resetForm();
    onClose();
  };

  const selectableCategories = categories.filter(c => c !== 'All');
  const dueOptions = ['Today', 'Tomorrow', 'This Week', 'Someday'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}>
            <View
              style={[
                styles.modalContainer,
                {backgroundColor: theme.surface, borderColor: theme.border},
              ]}>
              {/* Header Bar */}
              <View style={[styles.header, {borderBottomColor: theme.divider}]}>
                <Text style={[styles.headerTitle, {color: theme.textPrimary}]}>
                  {isEdit ? 'Edit Task' : 'New Task'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScroll}
                showsVerticalScrollIndicator={false}>
                {/* Title Input */}
                <View style={styles.titleLabelRow}>
                  <Text
                    style={[styles.inputLabel, {color: theme.textSecondary}]}>
                    Title
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleSmartParse}
                    style={[
                      styles.aiParsePill,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Feather
                      name="cpu"
                      size={11}
                      color={theme.primary}
                      style={{marginRight: 4}}
                    />
                    <Text style={[styles.aiParseText, {color: theme.primary}]}>
                      AI Parse
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="What needs to be done?"
                  placeholderTextColor={theme.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    },
                  ]}
                />

                {/* Description Input */}
                <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
                  Notes / Description (Optional)
                </Text>
                <TextInput
                  placeholder="Add details, links, or notes..."
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      color: theme.textPrimary,
                      borderColor: theme.border,
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
                  style={styles.horizontalScroll}>
                  {selectableCategories.map(cat => {
                    const isSelected = category === cat;
                    const meta = categoryMeta[cat] || {color: theme.primary};
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
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
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : theme.textSecondary,
                            },
                          ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Priority Selector */}
                <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
                  Priority
                </Text>
                <View style={styles.rowSelector}>
                  {Object.keys(priorityMeta).map(pKey => {
                    const meta = priorityMeta[pKey];
                    const isSelected = priority === pKey;
                    return (
                      <TouchableOpacity
                        key={pKey}
                        onPress={() => setPriority(pKey)}
                        style={[
                          styles.priorityChip,
                          {
                            backgroundColor: isSelected
                              ? meta.bgColor
                              : theme.surfaceSecondary,
                            borderColor: isSelected ? meta.color : theme.border,
                            borderWidth: isSelected ? 1.5 : 1,
                          },
                        ]}>
                        <View
                          style={[
                            styles.priorityDot,
                            {backgroundColor: meta.color},
                          ]}
                        />
                        <Text
                          style={[
                            styles.priorityChipText,
                            {
                              color: isSelected
                                ? meta.color
                                : theme.textSecondary,
                            },
                          ]}>
                          {meta.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Due Date Selector */}
                <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
                  Due Date
                </Text>
                <View style={styles.rowSelector}>
                  {dueOptions.map(opt => {
                    const isSelected = dueDate === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => setDueDate(opt)}
                        style={[
                          styles.dueChip,
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
                            styles.dueChipText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : theme.textSecondary,
                            },
                          ]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Pin to Top Toggle */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsPinned(!isPinned)}
                  style={[
                    styles.pinToggleRow,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      borderColor: isPinned ? theme.primary : theme.border,
                    },
                  ]}>
                  <Text
                    style={[styles.pinToggleText, {color: theme.textPrimary}]}>
                    Pin task to top
                  </Text>
                  <View style={styles.pinIconRow}>
                    <Feather
                      name="star"
                      size={15}
                      color={isPinned ? theme.primary : theme.textMuted}
                      style={{marginRight: 4}}
                    />
                    <Text
                      style={[
                        styles.pinToggleSub,
                        {color: isPinned ? theme.primary : theme.textMuted},
                      ]}>
                      {isPinned ? 'Pinned' : 'Pin'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Checklist / Subtasks */}
                <View style={styles.subtasksHeaderRow}>
                  <Text
                    style={[
                      styles.inputLabel,
                      {color: theme.textSecondary, marginTop: 0},
                    ]}>
                    Checklist Items ({subtasks.length})
                  </Text>
                  <TouchableOpacity
                    onPress={handleAiDecompose}
                    style={[
                      styles.aiBreakdownBtn,
                      {backgroundColor: theme.primaryLight},
                    ]}>
                    <Feather
                      name="list"
                      size={11}
                      color={theme.primary}
                      style={{marginRight: 4}}
                    />
                    <Text
                      style={[styles.aiBreakdownText, {color: theme.primary}]}>
                      AI Breakdown
                    </Text>
                  </TouchableOpacity>
                </View>

                {subtasks.map(sub => (
                  <View
                    key={sub.id}
                    style={[
                      styles.subtaskRow,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Text
                      numberOfLines={1}
                      style={[styles.subtaskText, {color: theme.textPrimary}]}>
                      • {sub.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSubtask(sub.id)}
                      style={styles.subtaskDeleteBtn}>
                      <Feather name="x" size={14} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.addSubtaskRow}>
                  <TextInput
                    placeholder="Add a checklist item..."
                    placeholderTextColor={theme.textMuted}
                    value={newSubtaskTitle}
                    onChangeText={setNewSubtaskTitle}
                    onSubmitEditing={handleAddSubtask}
                    style={[
                      styles.addSubtaskInput,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={handleAddSubtask}
                    style={[
                      styles.addSubtaskBtn,
                      {backgroundColor: theme.primary},
                    ]}>
                    <Text style={styles.addSubtaskBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={[styles.footer, {borderTopColor: theme.divider}]}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.cancelBtn, {borderColor: theme.border}]}>
                  <Text
                    style={[
                      styles.cancelBtnText,
                      {color: theme.textSecondary},
                    ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, {backgroundColor: theme.primary}]}>
                  <Text style={styles.submitBtnText}>
                    {isEdit ? 'Save Changes' : 'Create Task'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    maxHeight: '92%',
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    paddingTop: spacing.medium,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.medium,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    paddingHorizontal: spacing.medium,
    paddingVertical: 10,
    maxHeight: 480,
  },
  titleLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  aiParsePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  aiParseText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fontFamily.regular,
  },
  textArea: {
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    textAlignVertical: 'top',
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  rowSelector: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  priorityChipText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  dueChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  dueChipText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  pinToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  pinToggleText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
  },
  pinIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinToggleSub: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  subtasksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  aiBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiBreakdownText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  subtaskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  subtaskText: {
    fontSize: 12,
    flex: 1,
  },
  subtaskDeleteBtn: {
    padding: 4,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  addSubtaskInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginRight: 8,
  },
  addSubtaskBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubtaskBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.medium,
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
});

export default TaskModal;

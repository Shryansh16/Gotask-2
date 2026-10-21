// src/modules/TaskModal.js
import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';
import { categoryMeta, priorityMeta } from '../styles/theme';

export const TaskModal = ({
  visible,
  onClose,
  initialTask = null,
  initialCategory = null,
}) => {
  const { theme } = useTheme();
  const { addTask, updateTask, categories } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('Today');
  const [isPinned, setIsPinned] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const isEdit = Boolean(initialTask);

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
  }, [initialTask, initialCategory, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(initialCategory && initialCategory !== 'All' ? initialCategory : 'Personal');
    setPriority('medium');
    setDueDate('Today');
    setIsPinned(false);
    setSubtasks([]);
    setNewSubtaskTitle('');
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const item = {
      id: `sub_${Date.now()}_${Math.random()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, item]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Task Title Required', 'Please provide a title for this task.');
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

  const selectableCategories = categories.filter((c) => c !== 'All');
  const dueOptions = ['Today', 'Tomorrow', 'This Week', 'Someday'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: theme.surface },
              ]}
            >
              {/* Header Bar */}
              <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                  {isEdit ? 'Edit Task' : 'New Task'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={[styles.closeIcon, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Title Input */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Title
                </Text>
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
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
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
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {selectableCategories.map((cat) => {
                    const isSelected = category === cat;
                    const meta = categoryMeta[cat] || { color: theme.primary };
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected ? meta.color : theme.surfaceSecondary,
                            borderColor: isSelected ? meta.color : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Priority Selector */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Priority
                </Text>
                <View style={styles.rowSelector}>
                  {Object.keys(priorityMeta).map((pKey) => {
                    const meta = priorityMeta[pKey];
                    const isSelected = priority === pKey;
                    return (
                      <TouchableOpacity
                        key={pKey}
                        onPress={() => setPriority(pKey)}
                        style={[
                          styles.priorityChip,
                          {
                            backgroundColor: isSelected ? meta.bgColor : theme.surfaceSecondary,
                            borderColor: isSelected ? meta.color : theme.border,
                            borderWidth: isSelected ? 1.5 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[styles.priorityDot, { backgroundColor: meta.color }]}
                        />
                        <Text
                          style={[
                            styles.priorityChipText,
                            { color: isSelected ? meta.color : theme.textSecondary },
                          ]}
                        >
                          {meta.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Due Date Selector */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Due Date
                </Text>
                <View style={styles.rowSelector}>
                  {dueOptions.map((opt) => {
                    const isSelected = dueDate === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        onPress={() => setDueDate(opt)}
                        style={[
                          styles.dueChip,
                          {
                            backgroundColor: isSelected ? theme.primary : theme.surfaceSecondary,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dueChipText,
                            { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                          ]}
                        >
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
                  ]}
                >
                  <Text style={[styles.pinToggleText, { color: theme.textPrimary }]}>
                    Pin task to top
                  </Text>
                  <Text style={[styles.pinToggleIcon, { color: isPinned ? theme.primary : theme.textMuted }]}>
                    {isPinned ? '★ Pinned' : '☆ Pin'}
                  </Text>
                </TouchableOpacity>

                {/* Checklist / Subtasks */}
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Checklist Items ({subtasks.length})
                </Text>

                {subtasks.map((sub) => (
                  <View
                    key={sub.id}
                    style={[
                      styles.subtaskRow,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.subtaskText, { color: theme.textPrimary }]}
                    >
                      • {sub.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSubtask(sub.id)}
                      style={styles.subtaskDeleteBtn}
                    >
                      <Text style={[styles.subtaskDeleteIcon, { color: theme.danger }]}>
                        ✕
                      </Text>
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
                    style={[styles.addSubtaskBtn, { backgroundColor: theme.primary }]}
                  >
                    <Text style={styles.addSubtaskBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={[styles.footer, { borderTopColor: theme.divider }]}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.cancelBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                >
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
    maxHeight: '90%',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.PADDING_20,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.PADDING_20,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_20,
    paddingBottom: spacing.PADDING_14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  formScroll: {
    paddingHorizontal: spacing.PADDING_20,
    paddingVertical: spacing.PADDING_12,
    maxHeight: 460,
  },
  inputLabel: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
    marginTop: spacing.MARGIN_12,
    marginBottom: spacing.MARGIN_6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.PADDING_14,
    fontSize: textScale(14),
    fontFamily: fontFamily.regular,
  },
  textArea: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.PADDING_14,
    paddingVertical: 10,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    textAlignVertical: 'top',
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 4,
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
  rowSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityChipText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  dueChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  dueChipText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  pinToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.PADDING_12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.MARGIN_14,
  },
  pinToggleText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  pinToggleIcon: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  subtaskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  subtaskText: {
    flex: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  subtaskDeleteBtn: {
    padding: 4,
  },
  subtaskDeleteIcon: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: spacing.MARGIN_16,
  },
  addSubtaskInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginRight: 8,
  },
  addSubtaskBtn: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSubtaskBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(12),
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
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelBtnText: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
});

export default TaskModal;

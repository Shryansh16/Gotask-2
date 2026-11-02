// src/modules/TaskModal.js
// GoTASK Create & Edit Task Bottom Sheet Modal
// Matched 1:1 against user reference media_1793631133382_83299ff2.jpg & HTML specifications

import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
  Switch,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';
import {parseNaturalLanguageTask, suggestSubtasks} from '../services/aiService';

// Category Definitions with tactile icons and theme colors
const DOMAIN_CATEGORIES = [
  {id: 'Work', label: 'Work', emoji: '💼', activeColor: '#00A3FF', activeBorder: '#0077B6'},
  {id: 'Personal', label: 'Personal', emoji: '👤', activeColor: '#6366F1', activeBorder: '#4F46E5'},
  {id: 'Study', label: 'Study & Eng', emoji: '⚡', activeColor: '#F59E0B', activeBorder: '#D97706'},
  {id: 'Health', label: 'Health', emoji: '🌱', activeColor: '#10B981', activeBorder: '#059669'},
  {id: 'Finance', label: 'Finance', emoji: '💳', activeColor: '#F43F5E', activeBorder: '#E11D48'},
];

// Priority XP rewards and metadata
const PRIORITY_CONFIG = {
  high: {
    label: 'High',
    xp: 50,
    dotColor: '#EF4444',
    activeBg: '#FFF1F2',
    activeBorder: '#FDA4AF',
    activeBevel: '#F43F5E',
    activeText: '#E11D48',
    activeXpBg: '#FFE4E6',
    activeXpText: '#BE123C',
  },
  medium: {
    label: 'Medium',
    xp: 35,
    dotColor: '#F59E0B',
    activeBg: '#FFFBEB',
    activeBorder: '#FCD34D',
    activeBevel: '#F59E0B',
    activeText: '#92400E',
    activeXpBg: '#FEF3C7',
    activeXpText: '#B45309',
  },
  low: {
    label: 'Low',
    xp: 20,
    dotColor: '#10B981',
    activeBg: '#ECFDF5',
    activeBorder: '#6EE7B7',
    activeBevel: '#10B981',
    activeText: '#065F46',
    activeXpBg: '#D1FAE5',
    activeXpText: '#047857',
  },
};

// Due date options mapping
const DUE_DATE_SEGMENTS = [
  {id: 'Today', label: 'Today'},
  {id: 'Tomorrow', label: 'Tmrw'},
  {id: 'This Week', label: 'This Wk'},
  {id: 'Pick', label: '📅 Pick'},
];

const FOCUS_DURATIONS = [15, 25, 45, 60];
const REMINDER_TIMES = ['04:00 PM', '05:30 PM', '07:00 PM', '09:00 AM', '11:00 AM'];

export const TaskModal = ({
  visible,
  onClose,
  initialTask = null,
  initialCategory = null,
}) => {
  const insets = useSafeAreaInsets();
  const {theme, isDark} = useTheme();
  const {addTask, updateTask, categories = []} = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('Today');
  const [isPinned, setIsPinned] = useState(true);
  const [focusDurationIndex, setFocusDurationIndex] = useState(1); // 25 min default
  const [reminderTimeIndex, setReminderTimeIndex] = useState(0); // 04:00 PM default
  const [subtasks, setSubtasks] = useState([]);
  const [showSubtasksSection, setShowSubtasksSection] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(initialTask);

  // Synchronize category list combining DOMAIN_CATEGORIES and any custom categories
  const allCategories = useMemo(() => {
    const list = [...DOMAIN_CATEGORIES];
    categories.forEach(cat => {
      if (cat !== 'All' && !list.some(c => c.id.toLowerCase() === cat.toLowerCase() || c.label.toLowerCase() === cat.toLowerCase())) {
        list.push({
          id: cat,
          label: cat,
          emoji: '📌',
          activeColor: '#00A3FF',
          activeBorder: '#0077B6',
        });
      }
    });
    return list;
  }, [categories]);

  const resetForm = useCallback(() => {
    setTitle('Complete Sprint Planning & Milestone review');
    setDescription('');
    setCategory(
      initialCategory && initialCategory !== 'All'
        ? initialCategory
        : 'Work',
    );
    setPriority('medium');
    setDueDate('Today');
    setIsPinned(true);
    setFocusDurationIndex(1);
    setReminderTimeIndex(0);
    setSubtasks([]);
    setShowSubtasksSection(false);
    setNewSubtaskTitle('');
    setIsSubmitting(false);
  }, [initialCategory]);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setCategory(initialTask.category || 'Work');
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || 'Today');
      setIsPinned(Boolean(initialTask.isPinned));
      const existingSubtasks = Array.isArray(initialTask.subtasks)
        ? [...initialTask.subtasks]
        : [];
      setSubtasks(existingSubtasks);
      setShowSubtasksSection(existingSubtasks.length > 0);
    } else {
      resetForm();
      if (initialCategory && initialCategory !== 'All') {
        setCategory(initialCategory);
      }
    }
  }, [initialTask, initialCategory, visible, resetForm]);

  // Handle AI Smart Parse trigger
  const handleSmartParse = () => {
    if (!title.trim()) {
      Alert.alert(
        'Enter Task Title',
        'Please enter a task title first, or type natural language like: "Deploy SQLite migrations tomorrow #high @Work"',
      );
      return;
    }

    const parsed = parseNaturalLanguageTask(title);
    if (parsed) {
      if (parsed.title) {
        setTitle(parsed.title);
      }
      if (parsed.priority && ['high', 'medium', 'low'].includes(parsed.priority)) {
        setPriority(parsed.priority);
      }
      if (parsed.dueDate) {
        if (parsed.dueDate.toLowerCase().includes('today')) {
          setDueDate('Today');
        } else if (parsed.dueDate.toLowerCase().includes('tomorrow')) {
          setDueDate('Tomorrow');
        } else {
          setDueDate('This Week');
        }
      }
      if (parsed.category) {
        const match = allCategories.find(
          c => c.id.toLowerCase() === parsed.category.toLowerCase() ||
               c.label.toLowerCase() === parsed.category.toLowerCase(),
        );
        if (match) {
          setCategory(match.id);
        }
      }
      if (Array.isArray(parsed.subtasks) && parsed.subtasks.length > 0) {
        setSubtasks(parsed.subtasks);
        setShowSubtasksSection(true);
      }

      Alert.alert(
        '✨ AI Parse Applied',
        `Recognized:\n• Priority: ${parsed.priority || 'medium'}\n• Due Date: ${parsed.dueDate || 'Today'}\n• Category: ${parsed.category || category}`,
      );
    }
  };

  // Handle AI Decompose Subtasks
  const handleAiDecompose = () => {
    if (!title.trim()) {
      Alert.alert('Task Title Required', 'Enter a task title to suggest subtasks.');
      return;
    }
    const suggestions = suggestSubtasks(title, category);
    if (suggestions && suggestions.length > 0) {
      setSubtasks(prev => [...prev, ...suggestions]);
      setShowSubtasksSection(true);
    } else {
      // Fallback default sprint subtasks
      const defaultSprintSubtasks = [
        {id: `sub_${Date.now()}_1`, title: 'Audit architectural requirements', completed: true},
        {id: `sub_${Date.now()}_2`, title: 'Define offline sync SQLite schema', completed: false},
        {id: `sub_${Date.now()}_3`, title: 'Run end-to-end regression benchmarks', completed: false},
      ];
      setSubtasks(prev => [...prev, ...defaultSprintSubtasks]);
      setShowSubtasksSection(true);
    }
  };

  // Add a manual subtask
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) {
      return;
    }
    const item = {
      id: `sub_${Date.now()}_${Math.random()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks(prev => [...prev, item]);
    setNewSubtaskTitle('');
  };

  // Remove a subtask
  const handleRemoveSubtask = id => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  // Toggle subtask completed status
  const handleToggleSubtask = id => {
    setSubtasks(prev =>
      prev.map(s => (s.id === id ? {...s, completed: !s.completed} : s)),
    );
  };

  // Quick Action: Attach link
  const handleAttachLink = () => {
    const linkSnippet = ' [Sprint Spec](https://gotask.dev/spec) ';
    setDescription(prev => (prev ? `${prev.trim()}${linkSnippet}` : linkSnippet.trim()));
  };

  // Quick Action: Add Sprint tag
  const handleAddSprintTag = () => {
    const tag = ' #Sprint-12 ';
    setDescription(prev => (prev ? `${prev.trim()}${tag}` : tag.trim()));
  };

  // Cycle focus duration and reminder
  const handleChangeFocusBlock = () => {
    setFocusDurationIndex(prev => (prev + 1) % FOCUS_DURATIONS.length);
    setReminderTimeIndex(prev => (prev + 1) % REMINDER_TIMES.length);
  };

  // Form submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Task Title Required', 'Please provide a title for this sprint task.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate,
        isPinned,
        subtasks,
        estimatedDuration: FOCUS_DURATIONS[focusDurationIndex],
        reminderTime: REMINDER_TIMES[reminderTimeIndex],
      };

      if (isEdit) {
        await updateTask(initialTask.id, payload);
      } else {
        await addTask(payload);
      }

      resetForm();
      onClose();
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Could not save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPriorityConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const currentXp = currentPriorityConfig.xp;
  const currentDuration = FOCUS_DURATIONS[focusDurationIndex];
  const currentReminder = REMINDER_TIMES[reminderTimeIndex];

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
                styles.sheetContainer,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : 'rgba(255, 255, 255, 0.8)',
                },
              ]}>
              {/* Tactile Grab Handle Pill */}
              <View style={styles.grabHandleContainer}>
                <View
                  style={[
                    styles.grabHandle,
                    {backgroundColor: isDark ? '#475569' : '#CBD5E1'},
                  ]}
                />
              </View>

              {/* Modal Header */}
              <View
                style={[
                  styles.headerRow,
                  {borderBottomColor: isDark ? '#334155' : '#F1F5F9'},
                ]}>
                <View style={styles.headerLeft}>
                  <View style={styles.titleWithXpRow}>
                    <Text
                      style={[
                        styles.modalTitleText,
                        {color: isDark ? '#F8FAFC' : '#0F172A'},
                      ]}>
                      {isEdit ? 'Edit Task' : 'Create Task'}
                    </Text>
                    {/* XP Reward Badge */}
                    <View style={styles.xpRewardBadge}>
                      <Feather name="star" size={11} color="#059669" />
                      <Text style={styles.xpRewardText}>+{currentXp} XP</Text>
                    </View>
                  </View>
                  <Text style={styles.modalSubtitleText}>
                    Sprint Velocity &amp; Focused Flow
                  </Text>
                </View>

                {/* Tactile Close Button */}
                <TouchableOpacity
                  accessibilityLabel="Close modal"
                  activeOpacity={0.75}
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDark ? '#334155' : '#F1F5F9',
                      borderColor: isDark ? '#475569' : '#E2E8F0',
                    },
                  ]}>
                  <Feather
                    name="x"
                    size={16}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">

                {/* AI Smart Breakdown Tactile Banner */}
                <View
                  style={[
                    styles.aiBannerContainer,
                    {
                      backgroundColor: isDark
                        ? 'rgba(99, 102, 241, 0.12)'
                        : 'rgba(99, 102, 241, 0.08)',
                      borderColor: isDark ? '#4F46E5' : '#DDD6FE',
                    },
                  ]}>
                  <View style={styles.aiBannerLeft}>
                    <View style={styles.aiBannerIconSquircle}>
                      <Text style={styles.aiSparkleEmoji}>✨</Text>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.aiBannerTitle,
                          {color: isDark ? '#E0E7FF' : '#1E293B'},
                        ]}>
                        AI Smart Breakdown
                      </Text>
                      <Text style={styles.aiBannerSubtitle}>
                        Auto-detect due dates, subtasks &amp; XP
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSmartParse}
                    style={[
                      styles.aiParseButton,
                      {
                        backgroundColor: isDark ? '#334155' : '#FFFFFF',
                        borderColor: isDark ? '#6366F1' : '#DDD6FE',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.aiParseButtonText,
                        {color: isDark ? '#A5B4FC' : '#6D28D9'},
                      ]}>
                      Parse
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={13}
                      color={isDark ? '#A5B4FC' : '#7C3AED'}
                    />
                  </TouchableOpacity>
                </View>

                {/* TASK TITLE SECTION */}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>TASK TITLE</Text>
                    <Text style={styles.charCountText}>
                      {title.length}/100
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.titleInputContainer,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <TextInput
                      style={[
                        styles.titleTextInput,
                        {color: isDark ? '#F8FAFC' : '#0F172A'},
                      ]}
                      value={title}
                      onChangeText={setTitle}
                      maxLength={100}
                      placeholder="e.g., Deploy SQLite database migrations & sync"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        Alert.alert(
                          '🎙️ Voice Input',
                          'Voice-to-text dictation is ready. Speak now or paste task command.',
                        );
                      }}
                      style={styles.micButton}>
                      <Feather
                        name="mic"
                        size={17}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* NOTES / SUBTASKS CONTAINER */}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>NOTES / SUBTASKS</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowSubtasksSection(!showSubtasksSection)}>
                      <Text style={styles.addSubtaskActionLink}>
                        + Add Subtask Checkbox
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      styles.notesBoxContainer,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <TextInput
                      style={[
                        styles.notesTextInput,
                        {color: isDark ? '#F8FAFC' : '#1E293B'},
                      ]}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={2}
                      placeholder="Add sprint context, checklists, or PR links..."
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    />

                    {/* Quick Subtask Action Chips */}
                    <View
                      style={[
                        styles.quickChipsRow,
                        {borderTopColor: isDark ? '#1E293B' : '#E2E8F0'},
                      ]}>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={handleAiDecompose}
                        style={[
                          styles.quickActionChip,
                          {
                            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                          },
                        ]}>
                        <Feather name="check" size={11} color="#10B981" />
                        <Text
                          style={[
                            styles.quickChipText,
                            {color: isDark ? '#E2E8F0' : '#475569'},
                          ]}>
                          {subtasks.length > 0
                            ? `${subtasks.length} Subtasks`
                            : '3 Subtasks'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={handleAttachLink}
                        style={[
                          styles.quickActionChip,
                          {
                            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                          },
                        ]}>
                        <Text style={styles.chipEmoji}>📎</Text>
                        <Text
                          style={[
                            styles.quickChipText,
                            {color: isDark ? '#E2E8F0' : '#475569'},
                          ]}>
                          Attach Link
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={handleAddSprintTag}
                        style={[
                          styles.quickActionChip,
                          {
                            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                          },
                        ]}>
                        <Text style={styles.chipEmoji}>🏷️</Text>
                        <Text
                          style={[
                            styles.quickChipText,
                            {color: isDark ? '#E2E8F0' : '#475569'},
                          ]}>
                          #Sprint-12
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Interactive Subtask Checklist List */}
                  {showSubtasksSection && (
                    <View style={styles.subtasksListContainer}>
                      {subtasks.map(item => (
                        <View
                          key={item.id}
                          style={[
                            styles.subtaskItemRow,
                            {
                              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                              borderColor: isDark ? '#334155' : '#E2E8F0',
                            },
                          ]}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handleToggleSubtask(item.id)}
                            style={[
                              styles.subtaskCheckboxSquircle,
                              item.completed && styles.subtaskCheckboxSquircleActive,
                            ]}>
                            {item.completed && (
                              <Feather name="check" size={12} color="#FFFFFF" />
                            )}
                          </TouchableOpacity>
                          <Text
                            style={[
                              styles.subtaskTitleText,
                              item.completed && styles.subtaskTitleTextCompleted,
                              {color: isDark ? '#F8FAFC' : '#0F172A'},
                            ]}>
                            {item.title}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleRemoveSubtask(item.id)}
                            style={styles.subtaskDeleteButton}>
                            <Feather name="x" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}

                      {/* Add New Subtask Inline Input */}
                      <View style={styles.inlineAddSubtaskRow}>
                        <TextInput
                          style={[
                            styles.inlineSubtaskInput,
                            {
                              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                              borderColor: isDark ? '#334155' : '#CBD5E1',
                              color: isDark ? '#F8FAFC' : '#0F172A',
                            },
                          ]}
                          value={newSubtaskTitle}
                          onChangeText={setNewSubtaskTitle}
                          placeholder="Add new checklist item..."
                          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                          onSubmitEditing={handleAddSubtask}
                        />
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleAddSubtask}
                          style={styles.inlineSubtaskAddBtn}>
                          <Text style={styles.inlineSubtaskAddBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* CATEGORY SELECTOR */}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>CATEGORY</Text>
                    <Text style={styles.sectionHint}>Select Domain</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}>
                    {allCategories.map(cat => {
                      const isSelected =
                        category.toLowerCase() === cat.id.toLowerCase() ||
                        category.toLowerCase() === cat.label.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          activeOpacity={0.8}
                          onPress={() => setCategory(cat.id)}
                          style={[
                            styles.categoryChip,
                            isSelected
                              ? [
                                  styles.categoryChipActive,
                                  {
                                    backgroundColor: cat.activeColor,
                                    borderBottomColor: cat.activeBorder,
                                  },
                                ]
                              : [
                                  styles.categoryChipInactive,
                                  {
                                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                                    borderColor: isDark ? '#334155' : '#E2E8F0',
                                    borderBottomColor: isDark ? '#1E293B' : '#CBD5E1',
                                  },
                                ],
                          ]}>
                          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                          <Text
                            style={[
                              styles.categoryLabelText,
                              isSelected
                                ? styles.categoryLabelActive
                                : [
                                    styles.categoryLabelInactive,
                                    {color: isDark ? '#CBD5E1' : '#334155'},
                                  ],
                            ]}>
                            {cat.label}
                          </Text>
                          {isSelected && (
                            <Feather
                              name="check"
                              size={12}
                              color="#FFFFFF"
                              style={{marginLeft: 3}}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* PRIORITY & SPRINT IMPACT MATRIX */}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>PRIORITY &amp; SPRINT IMPACT</Text>
                    <View style={styles.prioritySelectedBadge}>
                      <Text style={styles.prioritySelectedBadgeText}>
                        {currentPriorityConfig.label} Selected
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priorityMatrixRow}>
                    {Object.keys(PRIORITY_CONFIG).map(pKey => {
                      const cfg = PRIORITY_CONFIG[pKey];
                      const isSelected = priority === pKey;
                      return (
                        <TouchableOpacity
                          key={pKey}
                          activeOpacity={0.8}
                          onPress={() => setPriority(pKey)}
                          style={[
                            styles.priorityCard,
                            isSelected
                              ? [
                                  styles.priorityCardActive,
                                  {
                                    backgroundColor: isDark ? '#1E293B' : cfg.activeBg,
                                    borderColor: cfg.activeBorder,
                                    borderBottomColor: cfg.activeBevel,
                                  },
                                ]
                              : [
                                  styles.priorityCardInactive,
                                  {
                                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                                    borderColor: isDark ? '#334155' : '#E2E8F0',
                                    borderBottomColor: isDark ? '#1E293B' : '#CBD5E1',
                                  },
                                ],
                          ]}>
                          <View style={styles.priorityCardHeader}>
                            <View
                              style={[
                                styles.priorityDot,
                                {backgroundColor: cfg.dotColor},
                              ]}
                            />
                            <Text
                              style={[
                                styles.priorityLabel,
                                {
                                  color: isSelected
                                    ? cfg.activeText
                                    : isDark
                                    ? '#CBD5E1'
                                    : '#334155',
                                },
                              ]}>
                              {cfg.label}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.priorityXpPill,
                              isSelected && {backgroundColor: cfg.activeXpBg},
                            ]}>
                            <Text
                              style={[
                                styles.priorityXpText,
                                {
                                  color: isSelected
                                    ? cfg.activeXpText
                                    : cfg.dotColor,
                                },
                              ]}>
                              +{cfg.xp} XP
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* DUE DATE SEGMENT */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.sectionLabel}>DUE DATE</Text>
                  <View
                    style={[
                      styles.dueDateSegmentBar,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    {DUE_DATE_SEGMENTS.map(seg => {
                      const isSelected =
                        (seg.id === 'Today' && dueDate === 'Today') ||
                        (seg.id === 'Tomorrow' && dueDate === 'Tomorrow') ||
                        (seg.id === 'This Week' && dueDate === 'This Week') ||
                        (seg.id === 'Pick' &&
                          !['Today', 'Tomorrow', 'This Week'].includes(dueDate));

                      return (
                        <TouchableOpacity
                          key={seg.id}
                          activeOpacity={0.8}
                          onPress={() => {
                            if (seg.id === 'Pick') {
                              Alert.alert('Select Sprint Due Date', 'Pick due deadline:', [
                                {text: 'Tomorrow (+1d)', onPress: () => setDueDate('Tomorrow')},
                                {text: 'End of Sprint (+3d)', onPress: () => setDueDate('Sprint End')},
                                {text: 'Next Sprint (+7d)', onPress: () => setDueDate('Next Sprint')},
                                {text: 'Someday / Backlog', onPress: () => setDueDate('Someday')},
                                {text: 'Cancel', style: 'cancel'},
                              ]);
                            } else {
                              setDueDate(seg.id);
                            }
                          }}
                          style={[
                            styles.dueDateSegmentItem,
                            isSelected && styles.dueDateSegmentItemActive,
                          ]}>
                          <Text
                            style={[
                              styles.dueDateSegmentText,
                              isSelected
                                ? styles.dueDateSegmentTextActive
                                : [
                                    styles.dueDateSegmentTextInactive,
                                    {color: isDark ? '#94A3B8' : '#475569'},
                                  ],
                            ]}>
                            {seg.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* SPRINT POWER OPTIONS */}
                <View style={styles.fieldGroup}>
                  {/* Pin to Top of Sprint */}
                  <View
                    style={[
                      styles.powerOptionRow,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <View style={styles.powerOptionLeft}>
                      <View style={styles.pinIconSquircle}>
                        <Text style={styles.pinIconEmoji}>⭐</Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.powerOptionTitle,
                            {color: isDark ? '#F8FAFC' : '#1E293B'},
                          ]}>
                          Pin to Top of Sprint
                        </Text>
                        <Text style={styles.powerOptionSub}>
                          Keep visible in Today's Focus
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={isPinned}
                      onValueChange={setIsPinned}
                      trackColor={{false: '#CBD5E1', true: '#00A3FF'}}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {/* 25 min Focus Block */}
                  <View
                    style={[
                      styles.powerOptionRow,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        marginTop: 8,
                      },
                    ]}>
                    <View style={styles.powerOptionLeft}>
                      <View style={styles.clockIconSquircle}>
                        <Text style={styles.clockIconEmoji}>⏱️</Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.powerOptionTitle,
                            {color: isDark ? '#F8FAFC' : '#1E293B'},
                          ]}>
                          {currentDuration} min Focus Block
                        </Text>
                        <Text style={styles.powerOptionSub}>
                          Reminder at {currentReminder}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={handleChangeFocusBlock}
                      style={[
                        styles.changeOptionButton,
                        {
                          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                          borderColor: isDark ? '#475569' : '#CBD5E1',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.changeOptionButtonText,
                          {color: isDark ? '#CBD5E1' : '#475569'},
                        ]}>
                        Change
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </ScrollView>

              {/* STICKY FOOTER ACTIONS */}
              <View
                style={[
                  styles.stickyFooter,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderTopColor: isDark ? '#334155' : '#E2E8F0',
                    paddingBottom: Math.max(insets.bottom, 12),
                  },
                ]}>
                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  style={[
                    styles.footerCancelButton,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderBottomColor: isDark ? '#1E293B' : '#CBD5E1',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.footerCancelButtonText,
                      {color: isDark ? '#CBD5E1' : '#334155'},
                    ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Primary Create Task Action (Tactile 3D Bevel Button) */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  style={[
                    styles.footerPrimaryButton,
                    isSubmitting && {opacity: 0.7},
                  ]}>
                  <Text style={styles.footerPrimaryButtonText}>
                    {isEdit ? 'Save Changes' : 'Create Task'}
                  </Text>
                  <View style={styles.footerPrimaryXpPill}>
                    <Text style={styles.footerPrimaryXpPillText}>
                      +{currentXp} XP
                    </Text>
                  </View>
                  <Feather
                    name="arrow-right"
                    size={16}
                    color="#FFFFFF"
                    style={{marginLeft: 2}}
                  />
                </TouchableOpacity>
              </View>

              {/* Bottom Home Indicator Pill */}
              <View
                style={[
                  styles.homeIndicatorRow,
                  {backgroundColor: isDark ? '#1E293B' : '#FFFFFF'},
                ]}>
                <View
                  style={[
                    styles.homeIndicatorPill,
                    {backgroundColor: isDark ? '#475569' : '#CBD5E1'},
                  ]}
                />
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    maxHeight: '92%',
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    maxHeight: '100%',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.22,
    shadowRadius: 36,
    elevation: 24,
  },
  grabHandleContainer: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  titleWithXpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitleText: {
    fontSize: 20,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    letterSpacing: -0.3,
  },
  xpRewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  xpRewardText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
  modalSubtitleText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  aiBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  aiBannerIconSquircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  aiSparkleEmoji: {
    fontSize: 15,
  },
  aiBannerTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    lineHeight: 16,
  },
  aiBannerSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#64748B',
    marginTop: 1,
  },
  aiParseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiParseButtonText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  charCountText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
  },
  sectionHint: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
  },
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
  },
  titleTextInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFamily.bold,
    paddingVertical: 0,
  },
  micButton: {
    padding: 6,
    marginLeft: 4,
  },
  addSubtaskActionLink: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  notesBoxContainer: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
  },
  notesTextInput: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    minHeight: 52,
    textAlignVertical: 'top',
    padding: 0,
  },
  quickChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    marginTop: 6,
    borderTopWidth: 1,
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipEmoji: {
    fontSize: 11,
  },
  quickChipText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  subtasksListContainer: {
    marginTop: 8,
  },
  subtaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  subtaskCheckboxSquircle: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  subtaskCheckboxSquircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  subtaskTitleText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamily.medium,
  },
  subtaskTitleTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  subtaskDeleteButton: {
    padding: 4,
  },
  inlineAddSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inlineSubtaskInput: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  inlineSubtaskAddBtn: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineSubtaskAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  categoryScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  categoryChipActive: {
    borderBottomWidth: 3,
    shadowColor: '#0077B6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipInactive: {
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabelText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  categoryLabelInactive: {
    color: '#334155',
  },
  prioritySelectedBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  prioritySelectedBadgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#D97706',
  },
  priorityMatrixRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
  },
  priorityCardActive: {
    borderBottomWidth: 4,
  },
  priorityCardInactive: {
    borderBottomWidth: 4,
  },
  priorityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  priorityLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  priorityXpPill: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  priorityXpText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  dueDateSegmentBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  dueDateSegmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  dueDateSegmentItemActive: {
    backgroundColor: '#00A3FF',
    borderBottomWidth: 2,
    borderBottomColor: '#0077B6',
  },
  dueDateSegmentText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  dueDateSegmentTextActive: {
    color: '#FFFFFF',
  },
  dueDateSegmentTextInactive: {
    color: '#475569',
  },
  powerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  powerOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinIconSquircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIconEmoji: {
    fontSize: 13,
  },
  clockIconSquircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockIconEmoji: {
    fontSize: 13,
  },
  powerOptionTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  powerOptionSub: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
    marginTop: 1,
  },
  changeOptionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  changeOptionButtonText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCancelButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  footerPrimaryButton: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#00A3FF',
    borderBottomWidth: 4,
    borderBottomColor: '#0077B6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0077B6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  footerPrimaryButtonText: {
    fontSize: 14,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerPrimaryXpPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  footerPrimaryXpPillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  homeIndicatorRow: {
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicatorPill: {
    width: 128,
    height: 4,
    borderRadius: 2,
  },
});

export default TaskModal;

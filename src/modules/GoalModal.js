// src/modules/GoalModal.js
// GoTASK Create & Edit Goal Modal ("New Master Goal 🎯")
// Matched 1:1 against user reference media_1793650552422_1c10f347.jpg & HTML specifications

import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {useGoal, GOAL_BOUNDS, GOAL_TYPES} from '../context/GoalContext';
import {useTasks} from '../context/TaskContext';
import {decomposeGoalToMilestones} from '../services/aiService';
import {fontFamily} from '../common/fonts';

// Domain Categories with vibrant icons and colors
const DOMAIN_CATEGORIES = [
  {id: 'Health', label: 'Health', emoji: '🌿', activeColor: '#10B981', activeBorder: '#059669', bg: '#ECFDF5', text: '#065F46'},
  {id: 'Study', label: 'Study & Eng', emoji: '⚡', activeColor: '#F59E0B', activeBorder: '#D97706', bg: '#FFFBEB', text: '#92400E'},
  {id: 'Work', label: 'Work', emoji: '💼', activeColor: '#00A3FF', activeBorder: '#0077B6', bg: '#F0F9FF', text: '#075985'},
  {id: 'Personal', label: 'Personal', emoji: '👤', activeColor: '#6366F1', activeBorder: '#4F46E5', bg: '#EEF2FF', text: '#3730A3'},
];

// Emoji picker options for Goal Icon
const GOAL_EMOJIS = ['🏃‍♂️', '🎯', '📚', '⚡', '💻', '🧘', '🚀', '🏆', '💪', '🌱', '🎨'];

// Timeline cadences
const CADENCE_OPTIONS = [
  {id: '2w', label: '2 Weeks', days: 14},
  {id: '1m', label: '1 Month', days: 30},
  {id: '3m', label: '3 Months', days: 90},
  {id: 'season', label: 'Season', days: 120},
];

// Measurement modes
const MEASUREMENT_MODES = [
  {id: GOAL_TYPES.MILESTONES, label: 'Checkpoints', emoji: '🎯'},
  {id: GOAL_TYPES.TARGET_COUNT, label: 'Numeric', emoji: '🔢'},
  {id: GOAL_TYPES.PERCENTAGE, label: 'Percentage', emoji: '📊'},
];

export const GoalModal = ({visible, onClose, goalToEdit = null}) => {
  const insets = useSafeAreaInsets();
  const {theme, isDark} = useTheme();
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
  const [category, setCategory] = useState('Health');
  const [selectedEmoji, setSelectedEmoji] = useState('🏃‍♂️');
  const [type, setType] = useState(GOAL_TYPES.MILESTONES);
  const [targetValue, setTargetValue] = useState('50');
  const [unit, setUnit] = useState('km');
  const [selectedCadence, setSelectedCadence] = useState('1m');
  const [targetDays, setTargetDays] = useState(30);
  const [milestones, setMilestones] = useState([]);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = Boolean(goalToEdit);

  // Default sample milestones matching design
  const defaultMilestones = useMemo(
    () => [
      {
        id: 'm_sample_1',
        title: '10km Baseline Run',
        subtitle: 'Milestone 1 • Initial pacing',
        xp: 50,
        isCompleted: true,
      },
      {
        id: 'm_sample_2',
        title: '25km Halfway Checkpoint',
        subtitle: 'Milestone 2 • Mid-stage test',
        xp: 75,
        isCompleted: false,
      },
      {
        id: 'm_sample_3',
        title: '50km Endurance Final',
        subtitle: 'Mastery Cap • Crown Trophy',
        xp: 150,
        isCompleted: false,
      },
    ],
    [],
  );

  const resetForm = useCallback(() => {
    setTitle('Complete 50km Running Challenge');
    setDescription(
      'Build aerobic endurance and expand high-cadence respiratory baseline.',
    );
    setCategory('Health');
    setSelectedEmoji('🏃‍♂️');
    setType(GOAL_TYPES.MILESTONES);
    setTargetValue('50');
    setUnit('km');
    setSelectedCadence('1m');
    setTargetDays(30);
    setMilestones(defaultMilestones);
    setIsAddingMilestone(false);
    setNewMilestoneText('');
    setIsSubmitting(false);
  }, [defaultMilestones]);

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title || '');
      setDescription(goalToEdit.description || '');
      setCategory(goalToEdit.category || 'Health');
      setSelectedEmoji(goalToEdit.icon || '🏃‍♂️');
      setType(goalToEdit.type || GOAL_TYPES.MILESTONES);
      setTargetValue(String(goalToEdit.targetValue || 50));
      setUnit(goalToEdit.unit || 'km');

      if (Array.isArray(goalToEdit.milestones) && goalToEdit.milestones.length > 0) {
        setMilestones(
          goalToEdit.milestones.map((m, idx) => ({
            id: m.id || `m_${idx}`,
            title: m.title || '',
            subtitle: m.subtitle || `Milestone ${idx + 1}`,
            xp: m.xp || (idx === 0 ? 50 : idx === 1 ? 75 : 150),
            isCompleted: Boolean(m.isCompleted),
          })),
        );
      } else {
        setMilestones(defaultMilestones);
      }

      if (goalToEdit.targetDate) {
        const days = Math.round((goalToEdit.targetDate - Date.now()) / (24 * 3600000));
        setTargetDays(days > 0 ? days : 30);
        if (days <= 14) setSelectedCadence('2w');
        else if (days <= 45) setSelectedCadence('1m');
        else if (days <= 90) setSelectedCadence('3m');
        else setSelectedCadence('season');
      } else {
        setSelectedCadence('1m');
        setTargetDays(30);
      }
    } else {
      resetForm();
    }
  }, [goalToEdit, visible, resetForm, defaultMilestones]);

  // Cycle Goal Emoji
  const handleCycleEmoji = () => {
    const curIdx = GOAL_EMOJIS.indexOf(selectedEmoji);
    const nextIdx = (curIdx + 1) % GOAL_EMOJIS.length;
    setSelectedEmoji(GOAL_EMOJIS[nextIdx]);
  };

  // Cadence selection
  const handleSelectCadence = cadenceItem => {
    setSelectedCadence(cadenceItem.id);
    setTargetDays(cadenceItem.days);
  };

  // Toggle milestone completion
  const handleToggleMilestone = id => {
    setMilestones(prev =>
      prev.map(m => (m.id === id ? {...m, isCompleted: !m.isCompleted} : m)),
    );
  };

  // Add new milestone
  const handleAddMilestone = () => {
    const text = newMilestoneText.trim();
    if (!text) {
      setIsAddingMilestone(false);
      return;
    }
    const idx = milestones.length + 1;
    const newM = {
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: text,
      subtitle: `Milestone ${idx} • Stage checkpoint`,
      xp: idx === 1 ? 50 : idx === 2 ? 75 : 150,
      isCompleted: false,
    };
    setMilestones(prev => [...prev, newM]);
    setNewMilestoneText('');
    setIsAddingMilestone(false);
  };

  // Remove milestone
  const handleRemoveMilestone = id => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  // AI Milestone Decomposition
  const handleAiDecompose = () => {
    if (!title.trim()) {
      Alert.alert('Goal Title Required', 'Please enter a goal title to generate milestones.');
      return;
    }
    const drafts = decomposeGoalToMilestones(title, category);
    if (drafts && drafts.length > 0) {
      const formatted = drafts.map((d, i) => ({
        id: `m_ai_${Date.now()}_${i}`,
        title: d.title,
        subtitle: `Stage ${i + 1} • Roadmap Target`,
        xp: i === 0 ? 50 : i === 1 ? 75 : 150,
        isCompleted: false,
      }));
      setMilestones(formatted);
      Alert.alert('✨ AI Roadmaps Decomposed', `Generated ${formatted.length} progressive checkpoint nodes.`);
    }
  };

  // Form submission
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Required Field', 'Please enter a master goal title.');
      return;
    }

    let parsedTargetVal = Number(targetValue);
    if (type === GOAL_TYPES.PERCENTAGE) {
      parsedTargetVal = 100;
    } else if (type === GOAL_TYPES.MILESTONES) {
      parsedTargetVal = Math.max(1, milestones.length);
    } else {
      if (isNaN(parsedTargetVal) || parsedTargetVal <= 0) {
        Alert.alert('Invalid Target', 'Please enter a valid positive target number.');
        return;
      }
    }

    const calculatedTargetDate = Date.now() + targetDays * 24 * 3600000;

    setIsSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim(),
        category,
        icon: selectedEmoji,
        type,
        targetValue: parsedTargetVal,
        unit: unit.trim(),
        targetDate: calculatedTargetDate,
        targetDays,
        milestones: milestones.map(m => ({
          id: m.id,
          title: m.title,
          subtitle: m.subtitle,
          xp: m.xp || 50,
          isCompleted: Boolean(m.isCompleted),
        })),
      };

      if (isEdit) {
        await updateGoal(goalToEdit.id, payload);
      } else {
        await addGoal(payload);
      }

      resetForm();
      onClose();
    } catch (err) {
      Alert.alert('Goal Save Error', err.message || 'Could not save master goal.');
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
              {/* Tactile Sheet Handle & Top Grip */}
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
                  <View style={styles.titleWithBadgeRow}>
                    <Text
                      style={[
                        styles.headerTitleText,
                        {color: isDark ? '#F8FAFC' : '#0F172A'},
                      ]}>
                      {isEdit ? 'Edit Master Goal' : 'New Master Goal'} 🎯
                    </Text>
                    {/* Luminous Gamification Reward Badge */}
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardSparkle}>✨</Text>
                      <Text style={styles.rewardText}>+100 XP</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtitleText}>
                    Set milestone velocity &amp; unlock tiered division XP
                  </Text>
                </View>

                {/* Tactile Close Icon Button */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Close dialog"
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
                    size={17}
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

                {/* GOAL TITLE & ARCHETYPE SECTION */}
                <View style={styles.fieldSection}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>
                      GOAL TITLE <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <Text style={styles.charCountText}>
                      {title.length}/100
                    </Text>
                  </View>

                  <View style={styles.titleRow}>
                    {/* Interactive Goal Icon Picker (Tactile Squircle) */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleCycleEmoji}
                      style={[
                        styles.iconPickerSquircle,
                        {
                          backgroundColor: isDark ? '#3B2912' : '#FFFBEB',
                          borderColor: isDark ? '#F59E0B' : '#FDE68A',
                        },
                      ]}>
                      <Text style={styles.selectedEmojiText}>
                        {selectedEmoji}
                      </Text>
                    </TouchableOpacity>

                    {/* Goal Input Container */}
                    <View
                      style={[
                        styles.titleInputWrap,
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
                        placeholder="e.g. Run 50km or Read 12 Books"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          Alert.alert(
                            '🎙️ Voice Dictation',
                            'Voice-to-text is ready. Speak your goal title clearly.',
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

                  {/* Motivation & Cue Textarea */}
                  <View style={styles.motivationWrap}>
                    <View style={styles.labelRow}>
                      <Text style={styles.subSectionLabel}>
                        MOTIVATION &amp; CUE (OPTIONAL)
                      </Text>
                      <Text style={styles.charCountText}>
                        {description.length}/300
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.textareaContainer,
                        {
                          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                          borderColor: isDark ? '#334155' : '#E2E8F0',
                        },
                      ]}>
                      <TextInput
                        style={[
                          styles.textareaInput,
                          {color: isDark ? '#F8FAFC' : '#1E293B'},
                        ]}
                        value={description}
                        onChangeText={setDescription}
                        maxLength={300}
                        multiline
                        numberOfLines={2}
                        placeholder="Why is this goal important? (e.g. Build aerobic endurance & cardio capacity for marathon)"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  </View>
                </View>

                {/* DOMAIN CATEGORY SECTION */}
                <View style={styles.fieldSection}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>DOMAIN CATEGORY</Text>
                    <Text style={styles.sectionActionHint}>Select Domain</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScrollContent}>
                    {DOMAIN_CATEGORIES.map(cat => {
                      const isSelected =
                        category.toLowerCase() === cat.id.toLowerCase();
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
                                ? styles.categoryLabelTextActive
                                : [
                                    styles.categoryLabelTextInactive,
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

                {/* GOAL ARCHITECTURE & METRIC */}
                <View style={styles.fieldSection}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>
                      GOAL ARCHITECTURE &amp; METRIC
                    </Text>
                    <View style={styles.gamifiedPathBadge}>
                      <Text style={styles.gamifiedPathText}>Gamified Path</Text>
                    </View>
                  </View>

                  {/* Segmented Measurement Mode Selector */}
                  <View
                    style={[
                      styles.measurementSegmentBar,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    {MEASUREMENT_MODES.map(mode => {
                      const isSelected = type === mode.id;
                      return (
                        <TouchableOpacity
                          key={mode.id}
                          activeOpacity={0.8}
                          onPress={() => setType(mode.id)}
                          style={[
                            styles.measurementSegmentItem,
                            isSelected && styles.measurementSegmentItemActive,
                          ]}>
                          <Text style={styles.measurementSegmentEmoji}>
                            {mode.emoji}
                          </Text>
                          <Text
                            style={[
                              styles.measurementSegmentText,
                              isSelected
                                ? styles.measurementSegmentTextActive
                                : [
                                    styles.measurementSegmentTextInactive,
                                    {color: isDark ? '#94A3B8' : '#475569'},
                                  ],
                            ]}>
                            {mode.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Metric Value & Unit Row */}
                  <View style={styles.metricInputsGrid}>
                    <View style={styles.metricInputCol}>
                      <Text style={styles.inputMiniLabel}>
                        TARGET VALUE <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          styles.metricNumberInput,
                          {
                            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                            color: isDark ? '#F8FAFC' : '#0F172A',
                          },
                        ]}
                        value={targetValue}
                        onChangeText={setTargetValue}
                        keyboardType="numeric"
                        placeholder="50"
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                    <View style={styles.metricInputCol}>
                      <Text style={styles.inputMiniLabel}>UNIT (METRIC)</Text>
                      <TextInput
                        style={[
                          styles.metricUnitInput,
                          {
                            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            borderColor: isDark ? '#334155' : '#E2E8F0',
                            color: isDark ? '#F8FAFC' : '#0F172A',
                          },
                        ]}
                        value={unit}
                        onChangeText={setUnit}
                        placeholder="km, books, hrs..."
                        placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  </View>

                  {/* Checkpoint Milestone Path Card */}
                  <View
                    style={[
                      styles.milestonesPathCard,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <View style={styles.milestonesCardHeader}>
                      <View style={styles.milestonesHeaderLeft}>
                        <Text style={styles.flagEmoji}>🚩</Text>
                        <Text
                          style={[
                            styles.milestonesCardTitle,
                            {color: isDark ? '#F8FAFC' : '#1E293B'},
                          ]}>
                          Tiered Checkpoint Nodes
                        </Text>
                      </View>
                      <View style={styles.stageRoadBadge}>
                        <Text style={styles.stageRoadBadgeText}>
                          {milestones.length} STAGE ROAD
                        </Text>
                      </View>
                    </View>

                    {/* Vertical Connecting Tree Line */}
                    <View style={styles.nodesTreeContainer}>
                      {milestones.map((node, index) => {
                        const isFinal = index === milestones.length - 1;
                        const isFirst = index === 0;
                        const isCompleted = node.isCompleted;

                        return (
                          <View
                            key={node.id}
                            style={[
                              styles.nodeCardRow,
                              {
                                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                borderColor: isFinal
                                  ? '#FCD34D'
                                  : isDark
                                  ? '#334155'
                                  : '#E2E8F0',
                              },
                            ]}>
                            <View style={styles.nodeCardLeft}>
                              {/* Squircle Node Pip */}
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => handleToggleMilestone(node.id)}
                                style={[
                                  styles.nodePip,
                                  isCompleted
                                    ? styles.nodePipCompleted
                                    : isFinal
                                    ? styles.nodePipFinal
                                    : styles.nodePipActive,
                                ]}>
                                {isCompleted ? (
                                  <Feather
                                    name="check"
                                    size={11}
                                    color="#FFFFFF"
                                  />
                                ) : isFinal ? (
                                  <Text style={styles.nodePipFinalEmoji}>
                                    🏁
                                  </Text>
                                ) : (
                                  <Text style={styles.nodePipNumberText}>
                                    {index + 1}
                                  </Text>
                                )}
                              </TouchableOpacity>

                              <View style={styles.nodeInfoGroup}>
                                <Text
                                  style={[
                                    styles.nodeTitleText,
                                    isCompleted && styles.nodeTitleCompleted,
                                    {color: isDark ? '#F8FAFC' : '#0F172A'},
                                  ]}
                                  numberOfLines={1}>
                                  {node.title}
                                </Text>
                                <Text style={styles.nodeSubtitleText}>
                                  {node.subtitle || `Milestone ${index + 1}`}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.nodeCardRight}>
                              <View
                                style={[
                                  styles.nodeXpBadge,
                                  isCompleted
                                    ? styles.nodeXpBadgeCompleted
                                    : isFinal
                                    ? styles.nodeXpBadgeFinal
                                    : styles.nodeXpBadgeActive,
                                ]}>
                                <Text
                                  style={[
                                    styles.nodeXpText,
                                    isCompleted
                                      ? styles.nodeXpTextCompleted
                                      : isFinal
                                      ? styles.nodeXpTextFinal
                                      : styles.nodeXpTextActive,
                                  ]}>
                                  +{node.xp || (index === 0 ? 50 : index === 1 ? 75 : 150)} XP
                                </Text>
                              </View>
                              <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => handleRemoveMilestone(node.id)}
                                style={styles.deleteNodeBtn}>
                                <Feather
                                  name="x"
                                  size={13}
                                  color={isDark ? '#64748B' : '#94A3B8'}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    {/* Inline Add Node input if active */}
                    {isAddingMilestone ? (
                      <View style={styles.inlineAddNodeRow}>
                        <TextInput
                          style={[
                            styles.inlineNodeInput,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                              borderColor: isDark ? '#475569' : '#CBD5E1',
                              color: isDark ? '#F8FAFC' : '#0F172A',
                            },
                          ]}
                          value={newMilestoneText}
                          onChangeText={setNewMilestoneText}
                          placeholder="e.g., 35km Intermediate Cadence"
                          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                          onSubmitEditing={handleAddMilestone}
                          autoFocus
                        />
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleAddMilestone}
                          style={styles.inlineAddNodeConfirmBtn}>
                          <Text style={styles.inlineAddNodeConfirmText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.milestoneActionsRow}>
                        {/* Add Checkpoint Node Button */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => setIsAddingMilestone(true)}
                          style={[
                            styles.addNodeButton,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                              borderColor: isDark ? '#475569' : '#CBD5E1',
                            },
                          ]}>
                          <Text style={styles.addNodePlus}>+</Text>
                          <Text
                            style={[
                              styles.addNodeButtonText,
                              {color: isDark ? '#CBD5E1' : '#475569'},
                            ]}>
                            Add Checkpoint Node
                          </Text>
                        </TouchableOpacity>

                        {/* AI Auto-Decompose Milestones */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={handleAiDecompose}
                          style={[
                            styles.aiDecomposeButton,
                            {
                              backgroundColor: isDark ? '#312E81' : '#EEF2FF',
                              borderColor: isDark ? '#4F46E5' : '#C7D2FE',
                            },
                          ]}>
                          <Text style={styles.aiDecomposeEmoji}>✨</Text>
                          <Text style={styles.aiDecomposeText}>AI Roadmaps</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* HORIZON & CADENCE SECTION */}
                <View style={styles.fieldSection}>
                  <View style={styles.labelRow}>
                    <Text style={styles.sectionLabel}>HORIZON &amp; CADENCE</Text>
                    <Text style={styles.sectionHint}>Target Deadline</Text>
                  </View>

                  {/* Timeline Segmented Tabs */}
                  <View style={styles.cadenceGrid}>
                    {CADENCE_OPTIONS.map(opt => {
                      const isSelected = selectedCadence === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.8}
                          onPress={() => handleSelectCadence(opt)}
                          style={[
                            styles.cadenceTab,
                            isSelected
                              ? styles.cadenceTabActive
                              : [
                                  styles.cadenceTabInactive,
                                  {
                                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                                    borderColor: isDark ? '#334155' : '#E2E8F0',
                                  },
                                ],
                          ]}>
                          <Text
                            style={[
                              styles.cadenceTabText,
                              isSelected
                                ? styles.cadenceTabTextActive
                                : [
                                    styles.cadenceTabTextInactive,
                                    {color: isDark ? '#94A3B8' : '#475569'},
                                  ],
                            ]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Gamified Velocity Multiplier Callout Banner */}
                  <View
                    style={[
                      styles.velocityMultiplierBanner,
                      {
                        backgroundColor: isDark
                          ? 'rgba(245, 158, 11, 0.12)'
                          : '#FFFBEB',
                        borderColor: isDark ? '#B45309' : '#FDE68A',
                      },
                    ]}>
                    <View style={styles.velocityFlameSquircle}>
                      <Text style={styles.velocityFlameEmoji}>🔥</Text>
                    </View>
                    <View style={styles.velocityTextCol}>
                      <Text
                        style={[
                          styles.velocityTitle,
                          {color: isDark ? '#FDE68A' : '#78350F'},
                        ]}>
                        Velocity Multiplier Active
                      </Text>
                      <Text
                        style={[
                          styles.velocitySub,
                          {color: isDark ? '#FCD34D' : '#92400E'},
                        ]}>
                        Logging checkpoints within 48h preserves momentum and
                        awards an instant{' '}
                        <Text style={styles.velocityHighlight}>
                          +20% XP boost
                        </Text>
                        .
                      </Text>
                    </View>
                  </View>
                </View>

              </ScrollView>

              {/* TACTILE ACTION FOOTER */}
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
                    styles.footerCancelBtn,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderBottomColor: isDark ? '#1E293B' : '#CBD5E1',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.footerCancelText,
                      {color: isDark ? '#CBD5E1' : '#334155'},
                    ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Primary Tactile 3D Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                  onPress={handleSave}
                  style={[
                    styles.footerPrimaryBtn,
                    isSubmitting && {opacity: 0.7},
                  ]}>
                  <Text style={styles.footerPlusIcon}>+</Text>
                  <Text style={styles.footerPrimaryBtnText}>
                    {isEdit ? 'Save Changes' : 'Create Goal'}
                  </Text>
                  <View style={styles.footerXpBadge}>
                    <Text style={styles.footerXpText}>+100 XP</Text>
                  </View>
                  <Feather
                    name="arrow-right"
                    size={16}
                    color="#FFFFFF"
                    style={{marginLeft: 2}}
                  />
                </TouchableOpacity>
              </View>

              {/* Simulated Home Bar */}
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
    shadowRadius: 40,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  titleWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 20,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    letterSpacing: -0.3,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rewardSparkle: {
    fontSize: 10,
  },
  rewardText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#047857',
  },
  headerSubtitleText: {
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
  fieldSection: {
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
  requiredAsterisk: {
    color: '#EF4444',
  },
  charCountText: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
  },
  sectionActionHint: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  sectionHint: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPickerSquircle: {
    width: 52,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedEmojiText: {
    fontSize: 24,
  },
  titleInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
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
  },
  motivationWrap: {
    marginTop: 10,
  },
  subSectionLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#94A3B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  textareaContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
  },
  textareaInput: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    minHeight: 46,
    textAlignVertical: 'top',
    padding: 0,
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
    borderWidth: 1.5,
    borderBottomWidth: 3,
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabelText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  categoryLabelTextActive: {
    color: '#FFFFFF',
  },
  categoryLabelTextInactive: {
    color: '#334155',
  },
  gamifiedPathBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  gamifiedPathText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#4F46E5',
  },
  measurementSegmentBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  measurementSegmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 12,
  },
  measurementSegmentItemActive: {
    backgroundColor: '#00A3FF',
    shadowColor: '#0077B6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  measurementSegmentEmoji: {
    fontSize: 12,
  },
  measurementSegmentText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  measurementSegmentTextActive: {
    color: '#FFFFFF',
  },
  measurementSegmentTextInactive: {
    color: '#475569',
  },
  metricInputsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricInputCol: {
    flex: 1,
  },
  inputMiniLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  metricNumberInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
  },
  metricUnitInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  milestonesPathCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
  },
  milestonesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  milestonesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagEmoji: {
    fontSize: 14,
  },
  milestonesCardTitle: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  stageRoadBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stageRoadBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  nodesTreeContainer: {
    position: 'relative',
    gap: 8,
    marginBottom: 10,
  },
  nodeCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  nodeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  nodePip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodePipCompleted: {
    backgroundColor: '#10B981',
  },
  nodePipActive: {
    backgroundColor: '#00A3FF',
  },
  nodePipFinal: {
    backgroundColor: '#F59E0B',
  },
  nodePipNumberText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  nodePipFinalEmoji: {
    fontSize: 11,
  },
  nodeInfoGroup: {
    flex: 1,
  },
  nodeTitleText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  nodeTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  nodeSubtitleText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
    marginTop: 1,
  },
  nodeCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeXpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nodeXpBadgeCompleted: {
    backgroundColor: '#ECFDF5',
  },
  nodeXpBadgeActive: {
    backgroundColor: '#F0F9FF',
  },
  nodeXpBadgeFinal: {
    backgroundColor: '#FFFBEB',
  },
  nodeXpText: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
  },
  nodeXpTextCompleted: {
    color: '#059669',
  },
  nodeXpTextActive: {
    color: '#00A3FF',
  },
  nodeXpTextFinal: {
    color: '#D97706',
  },
  deleteNodeBtn: {
    padding: 3,
  },
  milestoneActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addNodeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addNodePlus: {
    fontSize: 16,
    lineHeight: 18,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  addNodeButtonText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  aiDecomposeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  aiDecomposeEmoji: {
    fontSize: 12,
  },
  aiDecomposeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#4F46E5',
  },
  inlineAddNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineNodeInput: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  inlineAddNodeConfirmBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAddNodeConfirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  cadenceGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  cadenceTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 14,
  },
  cadenceTabActive: {
    backgroundColor: '#00A3FF',
    borderBottomWidth: 2,
    borderBottomColor: '#0077B6',
  },
  cadenceTabInactive: {
    borderWidth: 1,
  },
  cadenceTabText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  cadenceTabTextActive: {
    color: '#FFFFFF',
    fontFamily: fontFamily.extraBold || fontFamily.bold,
  },
  cadenceTabTextInactive: {
    color: '#475569',
  },
  velocityMultiplierBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  velocityFlameSquircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  velocityFlameEmoji: {
    fontSize: 15,
  },
  velocityTextCol: {
    flex: 1,
  },
  velocityTitle: {
    fontSize: 12,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    marginBottom: 2,
  },
  velocitySub: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    lineHeight: 16,
  },
  velocityHighlight: {
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#78350F',
  },
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCancelText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  footerPrimaryBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#00A3FF',
    borderBottomWidth: 4,
    borderBottomColor: '#0077B6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0077B6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  footerPlusIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fontFamily.bold,
    lineHeight: 18,
  },
  footerPrimaryBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  footerXpBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 2,
  },
  footerXpText: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
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

export default GoalModal;

// src/modules/HabitModal.js
// GoTASK Create & Edit Habit Bottom Sheet Modal
// Matched 1:1 against user reference media_1793631038787_2466c3b9.jpg & HTML

import React, {useState, useEffect, useMemo} from 'react';
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
  Switch,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {
  useHabits,
  HABIT_BOUNDS,
  HABIT_CATEGORIES,
} from '../context/HabitContext';
import {fontFamily} from '../common/fonts';

const CATEGORY_ITEMS = [
  {name: 'Health', emoji: '🌿', activeColor: '#10B981', darkBorder: '#059669'},
  {name: 'Fitness', emoji: '⚡', activeColor: '#F97316', darkBorder: '#C2410C'},
  {name: 'Learning', emoji: '📖', activeColor: '#A855F7', darkBorder: '#7E22CE'},
  {name: 'Mindfulness', emoji: '🌊', activeColor: '#14B8A6', darkBorder: '#0F766E'},
  {name: 'Productivity', emoji: '🎯', activeColor: '#00A3FF', darkBorder: '#0072B5'},
  {name: 'Lifestyle', emoji: '✨', activeColor: '#F59E0B', darkBorder: '#B45309'},
  {name: 'Study', emoji: '📚', activeColor: '#8B5CF6', darkBorder: '#6D28D9'},
  {name: 'Work', emoji: '💼', activeColor: '#0284C7', darkBorder: '#0369A1'},
];

const EMOJI_OPTIONS = [
  '🧘', '⚡', '🏃', '📖', '💧', '🥗', '🎯', '🌿', '🧠', '💪', '🌅', '✨'
];

const DAYS_OF_WEEK_MAP = [
  {id: 'Mon', label: 'M'},
  {id: 'Tue', label: 'T'},
  {id: 'Wed', label: 'W'},
  {id: 'Thu', label: 'T'},
  {id: 'Fri', label: 'F'},
  {id: 'Sat', label: 'S'},
  {id: 'Sun', label: 'S'},
];

const FREQUENCY_TABS = [
  {id: 'daily', label: 'Daily'},
  {id: 'weekdays', label: 'Weekdays'},
  {id: 'weekends', label: 'Weekends'},
  {id: 'custom', label: 'Custom'},
];

export const HabitModal = ({visible, onClose, habitToEdit = null}) => {
  const insets = useSafeAreaInsets();
  const {theme, isDark} = useTheme();
  const {addHabit, updateHabit} = useHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [selectedEmoji, setSelectedEmoji] = useState('🧘');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState([
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  ]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('07:30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title || '');
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category || 'Health');
      setSelectedEmoji(habitToEdit.iconEmoji || '🧘');
      setFrequency(habitToEdit.frequency || 'daily');
      setTargetDays(
        Array.isArray(habitToEdit.targetDays) && habitToEdit.targetDays.length > 0
          ? [...habitToEdit.targetDays]
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      );
      setReminderEnabled(Boolean(habitToEdit.reminderEnabled));
      setReminderTime(habitToEdit.reminderTime || '07:30');
    } else {
      resetForm();
    }
  }, [habitToEdit, visible]);

  const resetForm = () => {
    setTitle('Morning 20-min Meditation');
    setDescription('Clears mental fog & boosts focus before deep work.');
    setCategory('Health');
    setSelectedEmoji('🧘');
    setFrequency('daily');
    setTargetDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setReminderEnabled(true);
    setReminderTime('07:30');
    setValidationError(null);
  };

  // Cycle through emojis when icon button is pressed
  const handleEmojiPress = () => {
    const currentIndex = EMOJI_OPTIONS.indexOf(selectedEmoji);
    const nextIndex = (currentIndex + 1) % EMOJI_OPTIONS.length;
    setSelectedEmoji(EMOJI_OPTIONS[nextIndex]);
  };

  // Handle Frequency Tab change
  const handleFrequencyChange = freqId => {
    setFrequency(freqId);
    if (freqId === 'daily') {
      setTargetDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    } else if (freqId === 'weekdays') {
      setTargetDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    } else if (freqId === 'weekends') {
      setTargetDays(['Sat', 'Sun']);
    }
  };

  // Toggle individual day bead
  const toggleDay = dayId => {
    let updated;
    if (targetDays.includes(dayId)) {
      if (targetDays.length === 1) {
        Alert.alert('Required', 'A habit must have at least one active day.');
        return;
      }
      updated = targetDays.filter(d => d !== dayId);
    } else {
      updated = [...targetDays, dayId];
    }
    setTargetDays(updated);

    // Sync frequency tab with current active days
    if (updated.length === 7) {
      setFrequency('daily');
    } else if (
      updated.length === 5 &&
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every(d => updated.includes(d))
    ) {
      setFrequency('weekdays');
    } else if (
      updated.length === 2 &&
      ['Sat', 'Sun'].every(d => updated.includes(d))
    ) {
      setFrequency('weekends');
    } else {
      setFrequency('custom');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setValidationError('Please enter a habit title.');
      return;
    }

    if (
      reminderEnabled &&
      !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminderTime.trim())
    ) {
      setValidationError('Please enter a valid time in HH:mm format.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        frequency,
        targetDays: frequency === 'custom' ? targetDays : targetDays,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime.trim() : null,
        iconEmoji: selectedEmoji,
      };

      let result;
      if (habitToEdit) {
        result = await updateHabit(habitToEdit.id, payload);
      } else {
        result = await addHabit(payload);
      }

      if (result.success) {
        onClose();
      } else {
        setValidationError(result.error || 'Failed to save habit');
      }
    } catch (err) {
      setValidationError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeDaysCount = targetDays.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          {/* Top Grab Handle Pill */}
          <View style={styles.dragIndicatorWrap}>
            <View
              style={[
                styles.dragIndicator,
                {backgroundColor: isDark ? '#334155' : '#CBD5E1'},
              ]}
            />
          </View>

          {/* Modal Header */}
          <View
            style={[
              styles.modalHeader,
              {borderBottomColor: isDark ? '#1E293B' : '#F1F5F9'},
            ]}>
            <View style={styles.headerLeft}>
              <View style={styles.titleWithBadge}>
                <Text
                  style={[
                    styles.modalTitle,
                    {color: isDark ? '#F8FAFC' : '#0F172A'},
                  ]}>
                  {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
                </Text>
                <View style={styles.xpBonusBadge}>
                  <Text style={styles.xpBonusText}>✨ +50 XP</Text>
                </View>
              </View>
              <Text style={styles.modalSubtitle}>
                Configure your atomic ritual
              </Text>
            </View>

            {/* Tactile Close (X) Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close habit modal">
              <Feather
                name="x"
                size={16}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          {/* Validation Error Banner */}
          {Boolean(validationError) && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
                  borderColor: isDark ? '#7F1D1D' : '#FEE2E2',
                },
              ]}>
              <Text style={styles.errorText}>⚠️ {validationError}</Text>
            </View>
          )}

          {/* Scrollable Form Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* SECTION 1: Habit Title & Emoji Icon */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {color: isDark ? '#CBD5E1' : '#334155'},
                  ]}>
                  HABIT TITLE <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <Text style={styles.counterText}>
                  {title.length}/{HABIT_BOUNDS.TITLE_MAX_LEN}
                </Text>
              </View>

              <View style={styles.titleInputRow}>
                {/* Emoji Icon Picker Trigger */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleEmojiPress}
                  style={[
                    styles.emojiBtn,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text style={styles.emojiText}>{selectedEmoji}</Text>
                </TouchableOpacity>

                {/* Title Input */}
                <TextInput
                  style={[
                    styles.titleInput,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    },
                  ]}
                  placeholder="e.g., Morning 20-min Meditation"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={HABIT_BOUNDS.TITLE_MAX_LEN}
                />
              </View>
            </View>

            {/* SECTION 2: Motivation & Cue Textarea */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {color: isDark ? '#CBD5E1' : '#334155'},
                  ]}>
                  MOTIVATION & CUE
                </Text>
                <Text style={styles.counterText}>
                  {description.length}/{HABIT_BOUNDS.DESC_MAX_LEN}
                </Text>
              </View>

              <TextInput
                style={[
                  styles.textAreaInput,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  },
                ]}
                placeholder="Why is this routine important? (e.g. Clears mental fog before sprint execution)"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                maxLength={HABIT_BOUNDS.DESC_MAX_LEN}
              />
            </View>

            {/* SECTION 3: Vibrant Kinetic Category Selector */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {color: isDark ? '#CBD5E1' : '#334155'},
                  ]}>
                  CATEGORY
                </Text>
                <Text style={styles.selectOneText}>Select one</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}>
                {CATEGORY_ITEMS.map(item => {
                  const isSelected = category === item.name;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      activeOpacity={0.8}
                      onPress={() => setCategory(item.name)}
                      style={[
                        styles.categoryPill,
                        isSelected
                          ? [
                              styles.categoryPillActive,
                              {
                                backgroundColor: item.activeColor,
                                borderColor: item.activeColor,
                                borderBottomColor: item.darkBorder,
                              },
                            ]
                          : [
                              styles.categoryPillInactive,
                              {
                                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                                borderColor: isDark ? '#334155' : '#E2E8F0',
                                borderBottomColor: isDark
                                  ? '#0F172A'
                                  : '#CBD5E1',
                              },
                            ],
                      ]}>
                      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                      <Text
                        style={[
                          styles.categoryPillLabel,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isDark
                              ? '#E2E8F0'
                              : '#334155',
                          },
                        ]}>
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Feather
                          name="check"
                          size={12}
                          color="#FFFFFF"
                          style={{marginLeft: 4}}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* SECTION 4: Frequency & Schedule Engine */}
            <View
              style={[
                styles.frequencyContainer,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View style={styles.frequencyHeader}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {color: isDark ? '#CBD5E1' : '#334155'},
                  ]}>
                  FREQUENCY & SCHEDULE
                </Text>
                <View style={styles.daysPerWeekBadge}>
                  <Text style={styles.daysPerWeekText}>
                    {activeDaysCount} Days / Week
                  </Text>
                </View>
              </View>

              {/* Segmented Tab Bar */}
              <View
                style={[
                  styles.segmentedBar,
                  {backgroundColor: isDark ? '#0F172A' : '#E2E8F0'},
                ]}>
                {FREQUENCY_TABS.map(tab => {
                  const isSelected = frequency === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      activeOpacity={0.8}
                      onPress={() => handleFrequencyChange(tab.id)}
                      style={[
                        styles.segmentTab,
                        isSelected && [
                          styles.segmentTabActive,
                          {
                            backgroundColor: '#00A3FF',
                            borderBottomColor: '#0072B5',
                          },
                        ],
                      ]}>
                      <Text
                        style={[
                          styles.segmentTabText,
                          {
                            color: isSelected
                              ? '#FFFFFF'
                              : isDark
                              ? '#94A3B8'
                              : '#475569',
                            fontFamily: isSelected
                              ? fontFamily.black || fontFamily.bold
                              : fontFamily.bold,
                          },
                        ]}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 7-Day Push Beads (Mon to Sun) */}
              <View style={styles.dayBeadsRow}>
                {DAYS_OF_WEEK_MAP.map(day => {
                  const isDayActive = targetDays.includes(day.id);
                  return (
                    <TouchableOpacity
                      key={day.id}
                      activeOpacity={0.8}
                      onPress={() => toggleDay(day.id)}
                      style={[
                        styles.dayBead,
                        isDayActive
                          ? [
                              styles.dayBeadActive,
                              {
                                backgroundColor: '#10B981',
                                borderColor: '#059669',
                                borderBottomColor: '#047857',
                              },
                            ]
                          : [
                              styles.dayBeadInactive,
                              {
                                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                                borderColor: isDark ? '#334155' : '#E2E8F0',
                                borderBottomColor: isDark
                                  ? '#020617'
                                  : '#CBD5E1',
                              },
                            ],
                      ]}>
                      <Text
                        style={[
                          styles.dayBeadLabel,
                          {
                            color: isDayActive
                              ? '#FFFFFF'
                              : isDark
                              ? '#94A3B8'
                              : '#64748B',
                          },
                        ]}>
                        {day.label}
                      </Text>
                      {isDayActive && <Text style={styles.dayBeadDot}>●</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SECTION 5: Daily Reminder & Target Time */}
            <View
              style={[
                styles.reminderCard,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View style={styles.reminderLeft}>
                <View style={styles.alarmSquircle}>
                  <Text style={styles.alarmEmoji}>⏰</Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.reminderTitle,
                      {color: isDark ? '#F8FAFC' : '#0F172A'},
                    ]}>
                    Daily Reminder
                  </Text>
                  <Text style={styles.reminderSubtitle}>
                    Push notification cue
                  </Text>
                </View>
              </View>

              <View style={styles.reminderRight}>
                {/* Time Input / Pill */}
                <TextInput
                  style={[
                    styles.timePill,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    },
                  ]}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                  placeholder="07:30"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  maxLength={5}
                />

                {/* Tactile Switch */}
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{false: '#CBD5E1', true: '#10B981'}}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* SECTION 6: Gamification Boost Preview Banner */}
            <View
              style={[
                styles.boostBanner,
                {
                  backgroundColor: isDark ? '#2D2013' : '#FFFDF5',
                  borderColor: isDark ? '#78350F' : '#FEF3C7',
                },
              ]}>
              <View style={styles.shieldWrap}>
                <Text style={styles.shieldEmoji}>🛡️</Text>
              </View>
              <View style={styles.boostContent}>
                <Text style={styles.boostTitle}>
                  Streak Multiplier: +50 XP / day
                </Text>
                <Text style={styles.boostSubtitle}>
                  Complete 7 consecutive sessions to unlock the{' '}
                  <Text style={styles.boostUnderline}>Bronze Ritualist</Text>{' '}
                  badge.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Footer Actions */}
          <View
            style={[
              styles.modalFooter,
              {
                borderTopColor: isDark ? '#1E293B' : '#F1F5F9',
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                paddingBottom: Math.max(insets.bottom, 12) + 8,
              },
            ]}>
            {/* Cancel Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              disabled={isSubmitting}
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
                },
              ]}>
              <Text
                style={[
                  styles.cancelBtnText,
                  {color: isDark ? '#E2E8F0' : '#334155'},
                ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Create / Update Primary 3D Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isSubmitting}
              style={[
                styles.createBtn,
                isSubmitting && {opacity: 0.75},
              ]}>
              <Text style={styles.createBtnText}>
                {isSubmitting
                  ? 'Saving...'
                  : habitToEdit
                  ? 'Update Habit'
                  : '+ Create Habit'}
              </Text>
              <View style={styles.createBtnBadge}>
                <Text style={styles.createBtnBadgeText}>+50 XP</Text>
              </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: 1,
    maxHeight: '92%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  dragIndicatorWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: -0.3,
  },
  xpBonusBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  xpBonusText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#047857',
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#DC2626',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
  },
  fieldSection: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: 0.6,
  },
  requiredAsterisk: {
    color: '#F43F5E',
  },
  counterText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#94A3B8',
  },
  selectOneText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  titleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  titleInput: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  textAreaInput: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: fontFamily.medium,
    lineHeight: 18,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryPillActive: {
    borderBottomWidth: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryPillInactive: {
    borderBottomWidth: 2,
  },
  categoryEmoji: {
    fontSize: 13,
    marginRight: 5,
  },
  categoryPillLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  frequencyContainer: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  frequencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysPerWeekBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  daysPerWeekText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#059669',
  },
  segmentedBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentTabText: {
    fontSize: 11,
  },
  dayBeadsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  dayBead: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBeadActive: {
    borderBottomWidth: 3,
  },
  dayBeadInactive: {
    borderBottomWidth: 2,
  },
  dayBeadLabel: {
    fontSize: 12,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  dayBeadDot: {
    fontSize: 7,
    color: '#FFFFFF',
    marginTop: -2,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alarmSquircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmEmoji: {
    fontSize: 18,
  },
  reminderTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  reminderSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
  },
  reminderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timePill: {
    width: 72,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fontFamily.bold,
    paddingVertical: 0,
  },
  boostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  shieldWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldEmoji: {
    fontSize: 18,
  },
  boostContent: {
    flex: 1,
  },
  boostTitle: {
    fontSize: 11,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#92400E',
    marginBottom: 2,
  },
  boostSubtitle: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#B45309',
    lineHeight: 14,
  },
  boostUnderline: {
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  createBtn: {
    flex: 2,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#00A3FF',
    borderWidth: 1,
    borderColor: '#0084D1',
    borderBottomWidth: 4,
    borderBottomColor: '#0072B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#00A3FF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  createBtnBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  createBtnBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
});

export default HabitModal;

// src/modules/HabitModal.js
// Verified Habit Creation & Editing Modal (docs/PRD.md Phase 5 — P5.1 to P5.4)

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
import {
  useHabits,
  HABIT_BOUNDS,
  HABIT_CATEGORIES,
} from '../context/HabitContext';
import {textScale, moderateScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

const FREQUENCY_OPTIONS = [
  {id: 'daily', label: 'Daily'},
  {id: 'weekdays', label: 'Weekdays'},
  {id: 'weekends', label: 'Weekends'},
  {id: 'custom', label: 'Custom'},
];

export const HabitModal = ({visible, onClose, habitToEdit = null}) => {
  const {theme} = useTheme();
  const {addHabit, updateHabit} = useHabits();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(['Mon', 'Wed', 'Fri']);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title || '');
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category || 'Health');
      setFrequency(habitToEdit.frequency || 'daily');
      setTargetDays(
        Array.isArray(habitToEdit.targetDays)
          ? [...habitToEdit.targetDays]
          : ['Mon', 'Wed', 'Fri'],
      );
      setReminderEnabled(Boolean(habitToEdit.reminderEnabled));
      setReminderTime(habitToEdit.reminderTime || '08:00');
    } else {
      resetForm();
    }
  }, [habitToEdit, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Health');
    setFrequency('daily');
    setTargetDays(['Mon', 'Wed', 'Fri']);
    setReminderEnabled(false);
    setReminderTime('08:00');
    setValidationError(null);
  };

  const toggleTargetDay = day => {
    if (targetDays.includes(day)) {
      if (targetDays.length === 1) {
        Alert.alert(
          'Required',
          'A custom habit must have at least one active day.',
        );
        return;
      }
      setTargetDays(targetDays.filter(d => d !== day));
    } else {
      setTargetDays([...targetDays, day]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setValidationError('Please enter a habit title.');
      return;
    }

    if (reminderEnabled && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminderTime)) {
      setValidationError(
        'Please enter a valid reminder time in HH:mm format (e.g. 08:30).',
      );
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
        targetDays: frequency === 'custom' ? targetDays : undefined,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : null,
      };

      let result;
      if (habitToEdit) {
        result = await updateHabit(habitToEdit.id, payload);
      } else {
        result = await addHabit(payload);
      }

      if (result.success) {
        resetForm();
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
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, {color: theme.textPrimary}]}>
              {habitToEdit ? 'Edit Habit & Routine' : 'Create New Habit'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close modal">
              <Text
                style={[styles.closeButtonText, {color: theme.textSecondary}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Validation Error Banner */}
          {validationError ? (
            <View
              style={[
                styles.errorBanner,
                {backgroundColor: theme.dangerLight, borderColor: theme.danger},
              ]}>
              <Text style={[styles.errorBannerText, {color: theme.danger}]}>
                ⚠️ {validationError}
              </Text>
            </View>
          ) : null}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, {color: theme.textPrimary}]}>
                  Habit Title *
                </Text>
                <Text
                  style={[
                    styles.counterText,
                    {
                      color:
                        title.length > HABIT_BOUNDS.TITLE_MAX_LEN
                          ? theme.danger
                          : theme.textSecondary,
                    },
                  ]}>
                  {title.length}/{HABIT_BOUNDS.TITLE_MAX_LEN}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g. Morning 20-min Meditation"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={HABIT_BOUNDS.TITLE_MAX_LEN}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, {color: theme.textPrimary}]}>
                  Description / Motivation
                </Text>
                <Text
                  style={[styles.counterText, {color: theme.textSecondary}]}>
                  {description.length}/{HABIT_BOUNDS.DESC_MAX_LEN}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Why is this routine important to you?"
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={HABIT_BOUNDS.DESC_MAX_LEN}
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
                contentContainerStyle={styles.categoryRow}>
                {HABIT_CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.surfaceSecondary,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select category ${cat}`}>
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected
                            ? styles.textWhite
                            : {color: theme.textPrimary},
                          {
                            fontFamily: isSelected
                              ? fontFamily.bold
                              : fontFamily.medium,
                          },
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Frequency Selector */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Frequency & Schedule
              </Text>
              <View style={styles.frequencyRow}>
                {FREQUENCY_OPTIONS.map(opt => {
                  const isSelected = frequency === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.frequencyButton,
                        {
                          backgroundColor: isSelected
                            ? theme.primary
                            : theme.surfaceSecondary,
                          borderColor: isSelected
                            ? theme.primary
                            : theme.border,
                        },
                      ]}
                      onPress={() => setFrequency(opt.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Set frequency to ${opt.label}`}>
                      <Text
                        style={[
                          styles.frequencyButtonText,
                          isSelected
                            ? styles.textWhite
                            : {color: theme.textPrimary},
                          {
                            fontFamily: isSelected
                              ? fontFamily.bold
                              : fontFamily.medium,
                          },
                        ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Day Chips */}
            {frequency === 'custom' ? (
              <View style={styles.inputGroup}>
                <Text style={[styles.subLabel, {color: theme.textSecondary}]}>
                  Select active days of the week:
                </Text>
                <View style={styles.daysRow}>
                  {HABIT_BOUNDS.DAYS_OF_WEEK.map(day => {
                    const isSelected = targetDays.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayChip,
                          {
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.surfaceSecondary,
                            borderColor: isSelected
                              ? theme.primary
                              : theme.border,
                          },
                        ]}
                        onPress={() => toggleTargetDay(day)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Toggle day ${day}`}>
                        <Text
                          style={[
                            styles.dayChipText,
                            isSelected
                              ? styles.textWhite
                              : {color: theme.textSecondary},
                          ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* Reminder Setting */}
            <View style={styles.inputGroup}>
              <View style={styles.reminderHeaderRow}>
                <Text style={[styles.label, {color: theme.textPrimary}]}>
                  Daily Reminder
                </Text>
                <TouchableOpacity
                  style={[
                    styles.togglePill,
                    {
                      backgroundColor: reminderEnabled
                        ? theme.primary
                        : theme.surfaceSecondary,
                    },
                  ]}
                  onPress={() => setReminderEnabled(!reminderEnabled)}
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="Toggle daily reminder">
                  <Text
                    style={[
                      styles.togglePillText,
                      reminderEnabled
                        ? styles.textWhite
                        : {color: theme.textSecondary},
                    ]}>
                    {reminderEnabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {reminderEnabled ? (
                <View style={styles.reminderInputRow}>
                  <Text style={[styles.subLabel, {color: theme.textSecondary}]}>
                    Time (24h format HH:mm):
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        color: theme.textPrimary,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="08:00"
                    placeholderTextColor={theme.textSecondary}
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    maxLength={5}
                  />
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Footer Save & Cancel Buttons */}
          <View style={[styles.modalFooter, {borderTopColor: theme.divider}]}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {backgroundColor: theme.surfaceSecondary},
              ]}
              onPress={onClose}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel habit creation">
              <Text
                style={[styles.cancelButtonText, {color: theme.textPrimary}]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {backgroundColor: theme.primary},
                isSubmitting && styles.submittingOpacity,
              ]}
              onPress={handleSave}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save habit">
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Saving...' : habitToEdit ? 'Update' : 'Create'}
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
  modalContainer: {
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    borderTopWidth: 1,
    maxHeight: '88%',
    paddingTop: spacing.M,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.L,
    paddingBottom: spacing.M,
  },
  modalTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  closeButton: {
    padding: spacing.XS,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: textScale(16),
  },
  errorBanner: {
    marginHorizontal: spacing.L,
    marginBottom: spacing.M,
    padding: spacing.S,
    borderRadius: moderateScale(8),
    borderWidth: 1,
  },
  errorBannerText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
  },
  scrollContent: {
    paddingHorizontal: spacing.L,
    paddingBottom: spacing.XL,
  },
  inputGroup: {
    marginBottom: spacing.M,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.XS,
  },
  label: {
    fontSize: textScale(14),
    fontFamily: fontFamily.semiBold,
    marginBottom: spacing.XXS,
  },
  subLabel: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginBottom: spacing.XS,
  },
  counterText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
  input: {
    borderWidth: 1,
    borderRadius: moderateScale(14),
    paddingHorizontal: spacing.M,
    height: 48,
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
  },
  textArea: {
    height: moderateScale(85),
    textAlignVertical: 'top',
    paddingVertical: spacing.S,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingVertical: spacing.XXS,
  },
  categoryPill: {
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.S,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    marginRight: spacing.XS,
  },
  categoryPillText: {
    fontSize: textScale(12),
  },
  frequencyRow: {
    flexDirection: 'row',
    marginTop: spacing.XXS,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: spacing.S,
    alignItems: 'center',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    marginHorizontal: 3,
  },
  frequencyButtonText: {
    fontSize: textScale(12),
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    flex: 1,
    paddingVertical: spacing.S,
    alignItems: 'center',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    marginHorizontal: 2,
  },
  dayChipText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.semiBold,
  },
  reminderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.XS,
  },
  togglePill: {
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.XXS,
    borderRadius: moderateScale(12),
  },
  togglePillText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.bold,
  },
  reminderInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.XS,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: spacing.M,
    paddingVertical: spacing.XS,
    fontSize: textScale(14),
    fontFamily: fontFamily.semiBold,
    width: moderateScale(80),
    textAlign: 'center',
    marginRight: spacing.M,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.L,
    paddingVertical: spacing.M,
    borderTopWidth: 1,
  },
  cancelButton: {
    paddingVertical: spacing.S,
    paddingHorizontal: spacing.L,
    borderRadius: moderateScale(14),
    minHeight: 46,
    justifyContent: 'center',
    marginRight: spacing.M,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
  },
  cancelButtonText: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
  saveButton: {
    paddingVertical: spacing.S,
    paddingHorizontal: spacing.XL,
    borderRadius: moderateScale(14),
    minHeight: 46,
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  submittingOpacity: {
    opacity: 0.7,
  },
});

export default HabitModal;

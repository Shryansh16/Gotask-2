// src/modules/ProgressModal.js
// Verified Progress Update & History Tracking Modal (docs/PRD.md Phase 4 — P4.5, P4.10, P4.11)

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
import {useGoal} from '../context/GoalContext';
import {textScale} from '../styles/responsiveStyles';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';

export const ProgressModal = ({visible, onClose, goal}) => {
  const {theme} = useTheme();
  const {recordProgressUpdate} = useGoal();

  const [newValue, setNewValue] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setNewValue(String(goal.currentValue || 0));
      setNote('');
    }
  }, [goal, visible]);

  if (!goal) {
    return null;
  }

  const handleSave = async () => {
    const parsed = Number(newValue);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid Value', 'Please enter a valid non-negative number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await recordProgressUpdate(goal.id, parsed, note);
      if (res && res.success) {
        onClose();
      } else {
        Alert.alert('Error', res?.error || 'Failed to update progress');
      }
    } catch (e) {
      Alert.alert('Error', 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIncrement = delta => {
    const current = Number(newValue) || 0;
    const nextVal = Math.max(0, current + delta);
    setNewValue(String(nextVal));
  };

  const history = Array.isArray(goal.progressUpdates)
    ? goal.progressUpdates
    : [];

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
            <View style={styles.titleColumn}>
              <Text style={[styles.modalTitle, {color: theme.textPrimary}]}>
                Update Progress 📈
              </Text>
              <Text
                style={[styles.goalTitleSub, {color: theme.textMuted}]}
                numberOfLines={1}>
                {goal.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close progress dialog"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={[styles.closeIcon, {color: theme.textMuted}]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Quick Increment Buttons */}
            <View style={styles.incrementRow}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Quick Adjust:
              </Text>
              <View style={styles.quickButtons}>
                {[1, 5, 10].map(amt => (
                  <TouchableOpacity
                    key={`inc_${amt}`}
                    onPress={() => handleIncrement(amt)}
                    style={[
                      styles.incBtn,
                      {
                        backgroundColor: theme.primaryLight,
                        borderColor: theme.primary,
                      },
                    ]}>
                    <Text style={[styles.incBtnText, {color: theme.primary}]}>
                      +{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Numeric Value Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Current Progress Value ({goal.unit || 'units'})
              </Text>
              <TextInput
                value={newValue}
                onChangeText={setNewValue}
                keyboardType="numeric"
                placeholder="0"
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

            {/* Progress Note */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.textPrimary}]}>
                Progress Note (Optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Completed morning trail run or read 2 chapters"
                placeholderTextColor={theme.placeholder}
                multiline={true}
                numberOfLines={2}
                maxLength={500}
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

            {/* Progress History (PRD P4.10) */}
            <View style={styles.historySection}>
              <Text style={[styles.historyHeader, {color: theme.textPrimary}]}>
                📜 Progress History ({history.length})
              </Text>
              {history.length === 0 ? (
                <Text
                  style={[styles.emptyHistoryText, {color: theme.textMuted}]}>
                  No progress updates recorded yet.
                </Text>
              ) : (
                history.map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.historyItem,
                      {
                        backgroundColor: theme.surfaceSecondary,
                        borderColor: theme.border,
                      },
                    ]}>
                    <View style={styles.historyTopRow}>
                      <Text
                        style={[styles.historyValue, {color: theme.primary}]}>
                        {item.value} {goal.unit || ''}
                      </Text>
                      <Text
                        style={[styles.historyDate, {color: theme.textMuted}]}>
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    {item.note ? (
                      <Text
                        style={[
                          styles.historyNote,
                          {color: theme.textSecondary},
                        ]}>
                        “{item.note}”
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
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
                {isSubmitting ? 'Saving...' : 'Record Update'}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleColumn: {
    flex: 1,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  goalTitleSub: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  closeIcon: {
    fontSize: textScale(18),
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  incrementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: textScale(13),
    fontFamily: fontFamily.semiBold,
    marginBottom: 6,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  incBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  incBtnText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: textScale(15),
    fontFamily: fontFamily.medium,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  historySection: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  historyHeader: {
    fontSize: textScale(14),
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  emptyHistoryText: {
    fontSize: textScale(12),
    fontStyle: 'italic',
  },
  historyItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyValue: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  historyDate: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
  },
  historyNote: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: textScale(14),
    fontFamily: fontFamily.medium,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: textScale(14),
    fontFamily: fontFamily.semiBold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default ProgressModal;

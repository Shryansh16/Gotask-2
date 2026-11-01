// src/components/ElevateRecommendedPath.js
// Pixel-perfect replica of Elevate's Sky Blue "Recommended" game/task progression path (Image 1)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {fontFamily} from '../common/fonts';

export const ElevateRecommendedPath = ({
  tasks = [],
  onSelectTask,
  onClose,
}) => {
  // If tasks are empty or few, provide sample items following Elevate's 4-card sequence
  const displayTasks = tasks.length > 0 ? tasks.slice(0, 4) : [
    {id: '1', title: 'Deep Work Sprint', category: 'WORK', completed: true},
    {id: '2', title: 'Speed Reading & Notes', category: 'STUDY', completed: true},
    {id: '3', title: 'HIIT Workout & Stretches', category: 'HEALTH', completed: true},
    {id: '4', title: 'System Architecture Review', category: 'DEV', completed: false},
  ];

  const cardColors = [
    {bg: '#18181B', badgeBg: '#4F46E5', badgeText: 'WORK', icon: 'code', iconBg: '#6366F1'},
    {bg: '#4C0519', badgeBg: '#E11D48', badgeText: 'STUDY', icon: 'book', iconBg: '#F43F5E'},
    {bg: '#3B0764', badgeBg: '#8B5CF6', badgeText: 'HEALTH', icon: 'activity', iconBg: '#A855F7'},
    {bg: '#831843', badgeBg: '#F43F5E', badgeText: 'FOCUS', icon: 'zap', iconBg: '#FB7185'},
  ];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Close recommended view"
            onPress={onClose}
            style={styles.closeBtn}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View style={styles.heroHeader}>
          <View style={styles.brainIconContainer}>
            <Text style={{fontSize: 32}}>🧠</Text>
          </View>
          <Text style={styles.recommendedTitle}>Recommended</Text>
        </View>
        <View style={{width: 32}} />
      </View>

      {/* Stepper with Connecting Line */}
      <View style={styles.pathLayout}>
        {/* Left Stepper Line */}
        <View style={styles.stepperTrack}>
          <View style={styles.verticalLine} />
        </View>

        {/* Task Cards Column */}
        <View style={styles.cardsColumn}>
          {displayTasks.map((task, idx) => {
            const themeStyle = cardColors[idx % cardColors.length];
            const isCompleted = Boolean(task.completed);
            const isCurrent = !isCompleted && (idx === 0 || displayTasks[idx - 1]?.completed);

            return (
              <View key={task.id || idx} style={styles.stepRow}>
                {/* Stepper Node Indicator */}
                <View style={styles.nodeIndicatorContainer}>
                  {isCompleted ? (
                    <View style={styles.completedNode}>
                      <Feather name="check" size={14} color="#FFFFFF" />
                    </View>
                  ) : isCurrent ? (
                    <View style={styles.currentNode}>
                      <Feather name="play" size={12} color="#00A3FF" />
                    </View>
                  ) : (
                    <View style={styles.lockedNode} />
                  )}
                </View>

                {/* Tactile Elevate Card */}
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Recommended task: ${task.title}`}
                  activeOpacity={0.85}
                  onPress={() => onSelectTask && onSelectTask(task)}
                  style={[
                    styles.taskCard,
                    {backgroundColor: themeStyle.bg},
                  ]}>
                  {/* Category Pill Tag on Right */}
                  <View style={styles.cardHeader}>
                    <View style={styles.hexIcon}>
                      <Feather name={themeStyle.icon} size={16} color="#FFFFFF" />
                    </View>
                    <View
                      style={[
                        styles.categoryPill,
                        {backgroundColor: themeStyle.badgeBg},
                      ]}>
                      <Text style={styles.categoryPillText}>
                        {task.category || themeStyle.badgeText}
                      </Text>
                    </View>
                  </View>

                  <Text numberOfLines={1} style={styles.cardTitle}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Mystery / Locked Box at Bottom */}
          <View style={styles.stepRow}>
            <View style={styles.nodeIndicatorContainer}>
              <View style={styles.lockedNode} />
            </View>
            <View style={styles.mysteryCard}>
              <Text style={styles.mysteryQuestion}>?</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00A3FF',
    borderRadius: 24,
    padding: 16,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeader: {
    alignItems: 'center',
  },
  brainIconContainer: {
    marginBottom: 4,
  },
  recommendedTitle: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  pathLayout: {
    position: 'relative',
    paddingLeft: 34,
  },
  stepperTrack: {
    position: 'absolute',
    left: 14,
    top: 24,
    bottom: 40,
    width: 2,
    alignItems: 'center',
  },
  verticalLine: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  cardsColumn: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  nodeIndicatorContainer: {
    position: 'absolute',
    left: -29,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  completedNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  lockedNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: '#00A3FF',
  },
  taskCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0, 0, 0, 0.35)',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hexIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  mysteryCard: {
    flex: 1,
    borderRadius: 18,
    height: 52,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#BAE6FD',
  },
  mysteryQuestion: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: '#94A3B8',
  },
});

export default ElevateRecommendedPath;


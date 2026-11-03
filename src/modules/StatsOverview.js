// src/modules/StatsOverview.js
// Screen 1: Dashboard Focus & Sprint Analytics (Stitch & Elevate Labs Tactile Momentum Redesign)

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {fontFamily} from '../common/fonts';

export const StatsOverview = () => {
  const navigation = useNavigation();
  const {theme, isDark} = useTheme();
  const {stats, addTask} = useTasks();

  const [isSprintModalVisible, setIsSprintModalVisible] = useState(false);
  const [isAddSprintMode, setIsAddSprintMode] = useState(false);
  const [newSprintTitle, setNewSprintTitle] = useState('');
  const [newSprintTag, setNewSprintTag] = useState('');
  const [newSprintXp, setNewSprintXp] = useState('+35 XP');

  const [sprintStreams, setSprintStreams] = useState([
    {
      id: 'sp_1',
      title: 'Architecture',
      tag: 'OFFLINE SYNC',
      level: 'Level 4',
      xp: '⚡ +35 XP',
      icon: 'cpu',
      bgLight: '#831843',
      bgDark: '#4A0E1C',
      border: '#9F1239',
      borderBottom: '#4C0519',
    },
    {
      id: 'sp_2',
      title: 'API Schema',
      tag: 'SQLITE ENGINE',
      level: 'Level 7',
      xp: '⚡ +50 XP',
      icon: 'code',
      bgLight: '#1D4ED8',
      bgDark: '#1E3A8A',
      border: '#2563EB',
      borderBottom: '#172554',
    },
    {
      id: 'sp_3',
      title: 'Code Review',
      tag: 'PULL REQUESTS',
      level: 'Level 2',
      xp: '⚡ +20 XP',
      icon: 'git-pull-request',
      bgLight: '#047857',
      bgDark: '#064E3B',
      border: '#059669',
      borderBottom: '#022C22',
    },
  ]);

  const handleCreateSprint = () => {
    if (!newSprintTitle.trim()) return;
    const colors = [
      {bgLight: '#7C3AED', bgDark: '#3B0764', border: '#8B5CF6', borderBottom: '#2E1065'},
      {bgLight: '#EA580C', bgDark: '#431407', border: '#F97316', borderBottom: '#270A03'},
      {bgLight: '#0284C7', bgDark: '#082F49', border: '#00A3FF', borderBottom: '#034E7B'},
    ];
    const picked = colors[sprintStreams.length % colors.length];
    const newSprint = {
      id: `sp_${Date.now()}`,
      title: newSprintTitle.trim(),
      tag: (newSprintTag || 'ACTIVE SPRINT').toUpperCase(),
      level: 'Level 1',
      xp: `⚡ ${newSprintXp}`,
      icon: 'zap',
      ...picked,
    };
    setSprintStreams([newSprint, ...sprintStreams]);
    setNewSprintTitle('');
    setNewSprintTag('');
    setIsAddSprintMode(false);
  };

  const handleApplyInsight = () => {
    addTask({
      title: 'Time Blocking: 45-min Deep Focus Block',
      category: 'Work',
      priority: 'high',
      dueDate: 'Today',
      tags: ['#focus', '#productivity', '#dopamine'],
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Row: TODAY'S FOCUS */}
      <View style={styles.focusHeaderRow}>
        <Text
          style={[
            styles.focusHeaderTitle,
            {color: isDark ? '#94A3B8' : '#64748B'},
          ]}>
          TODAY'S FOCUS
        </Text>
        <Text
          style={[
            styles.focusHeaderMeta,
            {color: isDark ? '#38BDF8' : '#0284C7'},
          ]}>
          • 15 mins • {stats.pending || 3} Tasks
        </Text>
      </View>

      {/* 2. Hero Card: High-Impact Sprint */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: isDark ? '#0284C7' : '#00A3FF',
            borderBottomColor: isDark ? '#0369A1' : '#007ACC',
          },
        ]}>
        {/* Top Centered Translucent Pill */}
        <View style={styles.heroCapsule}>
          <Text style={styles.heroCapsuleText}>
            • DEEP WORK • 25 MINS • {stats.pending || 3} TASKS
          </Text>
        </View>

        {/* Hero Title & Subtitle */}
        <Text style={styles.heroTitle}>High-Impact Sprint</Text>
        <Text style={styles.heroSubtitle}>
          Wire up offline sync graph & TurboModules
        </Text>

        {/* Centered Glowing Medallion with Corner Pips */}
        <View style={styles.medallionOuterContainer}>
          <View style={styles.medallionFrame}>
            {/* Top-Right Golden Pip */}
            <View style={styles.goldCornerPip} />

            {/* Bottom-Left Green Checkmark Pip */}
            <View style={styles.greenCornerPip}>
              <Feather name="check" size={11} color="#FFFFFF" />
            </View>

            {/* Medallion Core Icon & Label */}
            <Feather name="zap" size={36} color="#FDE047" />
            <Text style={styles.medallionFocusText}>SPRINT FOCUS</Text>
          </View>
        </View>

        {/* Sprint Architecture & System Tuning */}
        <Text style={styles.sprintArchTitle}>
          Sprint Architecture & System Tuning
        </Text>
        <Text style={styles.sprintArchSubtitle}>
          Offline sync topology & TurboModules build
        </Text>

        {/* White 3D Start Focus Session CTA Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Start Focus Session"
          activeOpacity={0.85}
          onPress={() => navigation.navigate('FocusScreen')}
          style={styles.startSessionButton}>
          <Text style={styles.startSessionText}>Start Focus Session</Text>
          <Feather name="arrow-right" size={16} color="#0284C7" />
        </TouchableOpacity>
      </View>

      {/* 3. ACTIVE SPRINT STREAMS Section */}
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            styles.sectionHeading,
            {color: isDark ? '#94A3B8' : '#64748B'},
          ]}>
          ACTIVE SPRINT STREAMS
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="View all sprint streams"
          onPress={() => setIsSprintModalVisible(true)}>
          <View style={styles.viewAllRow}>
            <Text style={[styles.viewAllText, {color: '#00A3FF'}]}>View all</Text>
            <Feather
              name="chevron-right"
              size={13}
              color="#00A3FF"
              style={{marginLeft: 2}}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.streamsScroll}>
        {sprintStreams.map(stream => (
          <TouchableOpacity
            key={stream.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FocusScreen')}
            style={[
              styles.streamCard,
              {
                backgroundColor: isDark ? stream.bgDark : stream.bgLight,
                borderColor: stream.border,
                borderBottomColor: stream.borderBottom,
              },
            ]}>
            <View style={styles.streamIconBox}>
              <Feather name={stream.icon || 'zap'} size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.streamTitle} numberOfLines={1}>
              {stream.title}
            </Text>
            <Text style={styles.streamSubtitle} numberOfLines={1}>
              {stream.tag}
            </Text>
            <View style={styles.streamBottomRow}>
              <Text style={styles.streamLevel}>{stream.level}</Text>
              <Text style={styles.streamXp}>{stream.xp}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 4. PRODUCTIVITY DOMAINS Section */}
      <View style={styles.sectionHeaderRow}>
        <Text
          style={[
            styles.sectionHeading,
            {color: isDark ? '#94A3B8' : '#64748B'},
          ]}>
          PRODUCTIVITY DOMAINS
        </Text>
        <Text
          style={[
            styles.domainHeaderMeta,
            {color: isDark ? '#64748B' : '#94A3B8'},
          ]}>
          2 in Flight
        </Text>
      </View>

      <View style={styles.domainsRow}>
        {/* Domain 1: Engineering Velocity (Indigo) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AnalyticsScreen')}
          style={[
            styles.domainCard,
            {
              backgroundColor: isDark ? '#312E81' : '#4F46E5',
              borderColor: '#6366F1',
              borderBottomColor: '#1E1B4B',
              marginRight: 10,
            },
          ]}>
          <View style={styles.domainIconCircle}>
            <Feather name="activity" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.domainTitle}>Engineering Velocity</Text>
          <Text style={styles.domainSubtitle}>3 Sprints Active</Text>
          <View style={styles.domainLinkRow}>
            <Text style={styles.domainStat}>Mastery 68%</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Domain 2: Habit Momentum (Warm Amber/Orange) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('HabitsScreen')}
          style={[
            styles.domainCard,
            {
              backgroundColor: isDark ? '#7C2D12' : '#EA580C',
              borderColor: '#F97316',
              borderBottomColor: '#431407',
            },
          ]}>
          <View style={styles.domainIconCircle}>
            <Feather name="zap" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.domainTitle}>Habit Momentum</Text>
          <Text style={styles.domainSubtitle}>5 Rituals Maintained</Text>
          <View style={styles.domainLinkRow}>
            <Text style={styles.domainStat}>Consistency 84%</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 5. PRODUCTIVITY INSIGHT Card */}
      <View
        style={[
          styles.insightCard,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
            borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
          },
        ]}>
        <Text style={styles.insightTag}>PRODUCTIVITY INSIGHT</Text>
        <Text
          style={[
            styles.insightTitle,
            {color: isDark ? '#F8F9FF' : '#0F172A'},
          ]}>
          Time Blocking & Dopamine Pacing
        </Text>
        <Text
          style={[
            styles.insightBody,
            {color: isDark ? '#94A3B8' : '#64748B'},
          ]}>
          Group similar cognitive tasks into 45-minute blocks to eliminate
          context-switching latency.
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Apply insight to today's agenda"
          activeOpacity={0.8}
          onPress={handleApplyInsight}
          style={[
            styles.insightActionBtn,
            {
              backgroundColor: isDark ? '#082F49' : '#F0F9FF',
              borderColor: isDark ? '#0284C7' : '#BAE6FD',
              borderBottomColor: isDark ? '#0369A1' : '#7DD3FC',
            },
          ]}>
          <Text style={styles.insightActionText}>
            ⚡ Apply to Today's Agenda (+15 XP)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 6. Active Sprint Streams Bottom Sheet Modal */}
      <Modal
        visible={isSprintModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsSprintModalVisible(false);
          setIsAddSprintMode(false);
        }}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.sprintModalContent,
              {backgroundColor: isDark ? '#0F172A' : '#FFFFFF'},
            ]}>
            {/* Grab Handle */}
            <View style={styles.modalGrabHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={{flex: 1}}>
                <View style={styles.modalTitleRow}>
                  <Text
                    style={[
                      styles.modalTitleText,
                      {color: isDark ? '#FFFFFF' : '#0F172A'},
                    ]}>
                    Active Sprint Streams
                  </Text>
                  <View style={styles.liveStreamBadge}>
                    <Text style={styles.liveStreamBadgeText}>
                      {sprintStreams.length} ACTIVE
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.modalSubtitleText,
                    {color: isDark ? '#94A3B8' : '#64748B'},
                  ]}>
                  High-velocity focus tracks & engineering sprints
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setIsSprintModalVisible(false);
                  setIsAddSprintMode(false);
                }}
                style={[
                  styles.closeModalBtn,
                  {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
                ]}>
                <Feather
                  name="x"
                  size={18}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            {/* Top Action: + New Sprint Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddSprintMode(!isAddSprintMode)}
              style={[
                styles.addSprintToggleBtn,
                isAddSprintMode && styles.addSprintToggleBtnActive,
              ]}>
              <Feather
                name={isAddSprintMode ? 'minus' : 'plus'}
                size={16}
                color="#FFFFFF"
                style={{marginRight: 6}}
              />
              <Text style={styles.addSprintToggleText}>
                {isAddSprintMode ? 'Close Sprint Form' : '+ Create New Sprint'}
              </Text>
            </TouchableOpacity>

            {/* Inline Add Sprint Form */}
            {isAddSprintMode && (
              <View
                style={[
                  styles.addSprintCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <Text
                  style={[
                    styles.formLabel,
                    {color: isDark ? '#E2E8F0' : '#334155'},
                  ]}>
                  Sprint Name
                </Text>
                <TextInput
                  value={newSprintTitle}
                  onChangeText={setNewSprintTitle}
                  placeholder="e.g. Design System Polish"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.formLabel,
                    {color: isDark ? '#E2E8F0' : '#334155', marginTop: 10},
                  ]}>
                  Domain / Focus Tag
                </Text>
                <TextInput
                  value={newSprintTag}
                  onChangeText={setNewSprintTag}
                  placeholder="e.g. CORE TOKENS"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      color: isDark ? '#FFFFFF' : '#0F172A',
                    },
                  ]}
                />

                {/* XP Reward Chips */}
                <Text
                  style={[
                    styles.formLabel,
                    {color: isDark ? '#E2E8F0' : '#334155', marginTop: 10},
                  ]}>
                  Sprint XP Reward
                </Text>
                <View style={styles.xpChipsRow}>
                  {['+25 XP', '+35 XP', '+50 XP', '+100 XP'].map(xp => (
                    <TouchableOpacity
                      key={xp}
                      onPress={() => setNewSprintXp(xp)}
                      style={[
                        styles.xpChip,
                        newSprintXp === xp && styles.xpChipActive,
                      ]}>
                      <Text
                        style={[
                          styles.xpChipText,
                          newSprintXp === xp && styles.xpChipTextActive,
                        ]}>
                        {xp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Save Sprint Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCreateSprint}
                  style={styles.saveSprintBtn}>
                  <Text style={styles.saveSprintText}>+ Add Sprint Stream ➔</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sprints List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 24, paddingTop: 4}}>
              {sprintStreams.map(stream => (
                <View
                  key={stream.id}
                  style={[
                    styles.sprintModalCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderLeftColor: stream.border,
                    },
                  ]}>
                  <View style={styles.sprintModalLeft}>
                    <View
                      style={[
                        styles.sprintModalIcon,
                        {backgroundColor: stream.border},
                      ]}>
                      <Feather
                        name={stream.icon || 'zap'}
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text
                        style={[
                          styles.sprintModalTitle,
                          {color: isDark ? '#FFFFFF' : '#0F172A'},
                        ]}>
                        {stream.title}
                      </Text>
                      <Text style={styles.sprintModalTag}>{stream.tag}</Text>
                      <View style={styles.sprintMetaRow}>
                        <Text style={styles.sprintLevelText}>{stream.level}</Text>
                        <Text style={styles.sprintXpText}>{stream.xp}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      setIsSprintModalVisible(false);
                      navigation.navigate('FocusScreen');
                    }}
                    style={styles.startSprintFocusBtn}>
                    <Text style={styles.startSprintFocusText}>Focus ➔</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  // 1. Focus Header Row
  focusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  focusHeaderTitle: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  focusHeaderMeta: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  // 2. Hero Card
  heroCard: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomWidth: 5, // Elevate 3D tactile bevel
    shadowColor: '#0082CC',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
    alignItems: 'center',
  },
  heroCapsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroCapsuleText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  // Medallion
  medallionOuterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  medallionFrame: {
    width: 124,
    height: 124,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: '#67E8F9',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  goldCornerPip: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FBBF24',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  greenCornerPip: {
    position: 'absolute',
    bottom: -7,
    left: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionFocusText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: 1.1,
    marginTop: 6,
  },
  sprintArchTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 12,
  },
  sprintArchSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  startSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 44,
    width: '100%',
    borderRadius: 22,
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
  },
  startSessionText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#0284C7',
    marginRight: 6,
  },
  // 3. Section Header Rows
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  domainHeaderMeta: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
  },
  // Streams Horizontal Scroll
  streamsScroll: {
    paddingBottom: 4,
  },
  streamCard: {
    width: 135,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    marginRight: 10,
  },
  streamIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  streamTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  streamSubtitle: {
    fontSize: 9,
    fontFamily: fontFamily.bold,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  streamBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streamLevel: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  streamXp: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FEF08A',
  },
  // 4. Domains
  domainsRow: {
    flexDirection: 'row',
  },
  domainCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  domainIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  domainTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  domainSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  domainLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainStat: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  // 5. Productivity Insight
  insightCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    marginTop: 14,
  },
  insightTag: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 6,
  },
  insightBody: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  insightActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  insightActionText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  // 6. Sprint Streams Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sprintModalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '88%',
  },
  modalGrabHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  modalTitleText: {
    fontSize: 18,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  liveStreamBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveStreamBadgeText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    color: '#047857',
  },
  modalSubtitleText: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSprintToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#00A3FF',
    borderBottomWidth: 3,
    borderBottomColor: '#006AB0',
    marginBottom: 12,
  },
  addSprintToggleBtnActive: {
    backgroundColor: '#64748B',
    borderBottomColor: '#334155',
  },
  addSprintToggleText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  addSprintCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    marginBottom: 6,
  },
  formInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: fontFamily.regular,
  },
  xpChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  xpChip: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpChipActive: {
    backgroundColor: '#00A3FF',
    borderColor: '#007ACC',
  },
  xpChipText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#334155',
  },
  xpChipTextActive: {
    color: '#FFFFFF',
  },
  saveSprintBtn: {
    height: 44,
    borderRadius: 14,
    backgroundColor: '#10B981',
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveSprintText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  sprintModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  sprintModalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  sprintModalIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprintModalTitle: {
    fontSize: 13.5,
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
  sprintModalTag: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
    marginBottom: 4,
  },
  sprintMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sprintLevelText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#00A3FF',
  },
  sprintXpText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#F59E0B',
  },
  startSprintFocusBtn: {
    backgroundColor: '#00A3FF',
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#006AB0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startSprintFocusText: {
    fontSize: 11.5,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
});

export default StatsOverview;

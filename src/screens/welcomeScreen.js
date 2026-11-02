// src/screens/welcomeScreen.js
// GoTASK — Minimalist Modern Cadence Welcome & Landing Screen
// Matched 1:1 against user reference media_1793653747219_94db35a3.jpg & HTML specifications

import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {theme, isDark} = useTheme();

  // Interactive mock subtasks state
  const [subtasks, setSubtasks] = useState([
    {
      id: 'sub_1',
      title: 'Finalize Swift core data schema',
      duration: '25m',
      completed: true,
    },
    {
      id: 'sub_2',
      title: 'Sync offline state with local SQLite',
      duration: '40m',
      completed: true,
    },
    {
      id: 'sub_3',
      title: 'Run benchmark profiling & UI tests',
      duration: 'Live',
      completed: false,
    },
  ]);

  // Pulse animation for the green System Ready status dot & live pomodoro dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  // Tour Modal State
  const [isTourVisible, setIsTourVisible] = useState(false);

  const handleStart = () => {
    setIsTourVisible(false);
    navigation.replace('Drawer');
  };

  const toggleSubtask = id => {
    setSubtasks(prev =>
      prev.map(task =>
        task.id === id ? {...task, completed: !task.completed} : task,
      ),
    );
  };

  // Dynamic velocity computation
  const completedCount = subtasks.filter(t => t.completed).length;
  const totalSubtasks = subtasks.length;
  const velocityPercent = Math.round((completedCount / totalSubtasks) * 100);

  return (
    <View
      style={[
        styles.rootContainer,
        {backgroundColor: isDark ? '#0B1120' : '#FAFBFD'},
      ]}>
      {/* Top Ambient Subtle Glow */}
      <View
        pointerEvents="none"
        style={[
          styles.topAmbientGlow,
          {backgroundColor: isDark ? 'rgba(0, 163, 255, 0.08)' : 'rgba(0, 163, 255, 0.12)'},
        ]}
      />

      {/* BEGIN: TopAppHeader */}
      <View
        style={[
          styles.headerContainer,
          {paddingTop: Math.max(insets.top, 10) + 4},
        ]}>
        {/* Monogram Branding */}
        <View style={styles.brandingRow}>
          <View style={styles.monogramBox}>
            <Text style={styles.monogramLetterG}>G</Text>
            <Text style={styles.monogramLetterT}>T</Text>
          </View>
          <View style={styles.brandMetaCol}>
            <Text
              style={[
                styles.brandTitle,
                {color: isDark ? '#FFFFFF' : '#0F172A'},
              ]}>
              GoTASK
            </Text>
            <View style={styles.statusRow}>
              <Animated.View
                style={[styles.systemStatusDot, {opacity: pulseAnim}]}
              />
              <Text
                style={[
                  styles.systemStatusText,
                  {color: isDark ? '#94A3B8' : '#64748B'},
                ]}>
                SYSTEM READY
              </Text>
            </View>
          </View>
        </View>

        {/* Subtle 'Skip to Login' link */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Skip to Login"
          activeOpacity={0.7}
          onPress={handleStart}
          style={styles.skipBtn}>
          <Text
            style={[
              styles.skipBtnText,
              {color: isDark ? '#94A3B8' : '#64748B'},
            ]}>
            Skip to Login
          </Text>
        </TouchableOpacity>
      </View>
      {/* END: TopAppHeader */}

      {/* BEGIN: Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Editorial Value Prop */}
        <View style={styles.editorialSection}>
          <View
            style={[
              styles.versionPill,
              {
                backgroundColor: isDark ? '#082F49' : '#F0F9FF',
                borderColor: isDark ? '#0369A1' : '#E0F2FE',
              },
            ]}>
            <View style={styles.versionDot} />
            <Text
              style={[
                styles.versionText,
                {color: isDark ? '#38BDF8' : '#0284C7'},
              ]}>
              SPRINT ENGINE V2.4
            </Text>
          </View>

          <Text
            style={[
              styles.editorialHeadline,
              {color: isDark ? '#FFFFFF' : '#0F172A'},
            ]}>
            Master Your{'\n'}
            <Text style={{color: isDark ? '#F8FAFC' : '#020617'}}>
              Daily Cadence.
            </Text>
          </Text>

          <Text style={styles.editorialSubtitle}>
            <Text style={styles.subtitleSky}>Focus engineered for builders </Text>
            <Text
              style={[
                styles.subtitleSlate,
                {color: isDark ? '#94A3B8' : '#64748B'},
              ]}>
              — zero cognitive friction.
            </Text>
          </Text>
        </View>

        {/* Hero Mock Card Stack (Live Sprint Preview) */}
        <View style={styles.heroStackWrapper}>
          {/* Background Backing Card for Tactile Depth */}
          <View
            style={[
              styles.heroBackingCard,
              {backgroundColor: isDark ? '#1E293B' : 'rgba(226, 232, 240, 0.75)'},
            ]}
          />

          {/* Main Live Foreground Card */}
          <View
            style={[
              styles.heroMainCard,
              {
                backgroundColor: isDark ? '#111C33' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : 'rgba(226, 232, 240, 0.95)',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            {/* Card Header */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.sprintIconSquircle}>
                  <Text style={styles.sprintIconEmoji}>⚡</Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.sprintCardTitle,
                      {color: isDark ? '#FFFFFF' : '#0F172A'},
                    ]}>
                    Today's Deep Sprint
                  </Text>
                  <Text style={styles.sprintCardSub}>
                    Quarterly Release Block
                  </Text>
                </View>
              </View>

              {/* Live Pomodoro Flow Tag */}
              <View
                style={[
                  styles.flowBadge,
                  {
                    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                    borderColor: isDark ? '#047857' : '#A7F3D0',
                  },
                ]}>
                <Animated.View
                  style={[styles.flowPulsingDot, {opacity: pulseAnim}]}
                />
                <Text
                  style={[
                    styles.flowTimeText,
                    {color: isDark ? '#6EE7B7' : '#047857'},
                  ]}>
                  18:42
                </Text>
                <Text
                  style={[
                    styles.flowLabelText,
                    {color: isDark ? '#A7F3D0' : '#059669'},
                  ]}>
                  FLOW
                </Text>
              </View>
            </View>

            {/* Velocity Progress Tracker */}
            <View style={styles.velocityContainer}>
              <View style={styles.velocityHeaderRow}>
                <View style={styles.velocityLabelGroup}>
                  <Text
                    style={[
                      styles.velocityText,
                      {color: isDark ? '#E2E8F0' : '#334155'},
                    ]}>
                    Velocity
                  </Text>
                  <Text
                    style={[
                      styles.velocityDoneText,
                      {color: isDark ? '#94A3B8' : '#64748B'},
                    ]}>
                    {completedCount}/{totalSubtasks} tasks done
                  </Text>
                </View>
                <Text style={styles.velocityPercentText}>
                  {velocityPercent}%
                </Text>
              </View>

              {/* Velocity Bar Track */}
              <View
                style={[
                  styles.velocityTrack,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <View
                  style={[
                    styles.velocityFill,
                    {width: `${Math.min(velocityPercent, 100)}%`},
                  ]}
                />
              </View>
            </View>

            {/* Interactive Tactile Subtasks */}
            <View style={styles.subtasksList}>
              {subtasks.map(task => {
                const isCompleted = task.completed;
                return (
                  <TouchableOpacity
                    key={task.id}
                    activeOpacity={0.75}
                    onPress={() => toggleSubtask(task.id)}
                    style={[
                      styles.subtaskRow,
                      isCompleted
                        ? [
                            styles.subtaskRowCompleted,
                            {
                              backgroundColor: isDark ? '#151F32' : '#F8FAFC',
                              borderColor: isDark ? '#1E293B' : '#E2E8F0',
                            },
                          ]
                        : [
                            styles.subtaskRowActive,
                            {
                              backgroundColor: isDark ? '#152238' : '#FFFFFF',
                              borderColor: '#7DD3FC',
                              borderBottomColor: '#38BDF8',
                            },
                          ],
                    ]}>
                    {/* Checkbox Squircle */}
                    {isCompleted ? (
                      <View style={styles.checkedBox}>
                        <Feather name="check" size={12} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.uncheckedBox} />
                    )}

                    {/* Task Title */}
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.subtaskTitle,
                        isCompleted
                          ? [
                              styles.subtaskTitleCompleted,
                              {color: isDark ? '#64748B' : '#94A3B8'},
                            ]
                          : [
                              styles.subtaskTitleActive,
                              {color: isDark ? '#FFFFFF' : '#0F172A'},
                            ],
                      ]}>
                      {task.title}
                    </Text>

                    {/* Right Badge */}
                    {isCompleted ? (
                      <Text
                        style={[
                          styles.subtaskDuration,
                          {color: isDark ? '#64748B' : '#94A3B8'},
                        ]}>
                        {task.duration}
                      </Text>
                    ) : (
                      <View style={styles.liveTagBadge}>
                        <Text style={styles.liveTagText}>Live</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Micro Meta Footer */}
            <View style={styles.microFooterRow}>
              <View style={styles.streakInfoRow}>
                <Text style={styles.streakFlameEmoji}>🔥</Text>
                <Text
                  style={[
                    styles.streakInfoText,
                    {color: isDark ? '#94A3B8' : '#64748B'},
                  ]}>
                  Day 7 Streak Preserved
                </Text>
              </View>
              <Text
                style={[
                  styles.xpEarnedText,
                  {color: isDark ? '#CBD5E1' : '#475569'},
                ]}>
                +120 XP earned today
              </Text>
            </View>
          </View>
        </View>

        {/* Three Value Badges (Horizontal Floating Pills) */}
        <View style={styles.valueBadgesRow}>
          {/* Badge 1: Offline SQLite */}
          <View
            style={[
              styles.valueBadgePill,
              {
                backgroundColor: isDark ? '#151F32' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text style={styles.valueBadgeEmoji}>⚡</Text>
            <Text
              style={[
                styles.valueBadgeLabel,
                {color: isDark ? '#E2E8F0' : '#1E293B'},
              ]}>
              Offline-First
            </Text>
          </View>

          {/* Badge 2: 3-Tier Goals */}
          <View
            style={[
              styles.valueBadgePill,
              {
                backgroundColor: isDark ? '#151F32' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text style={styles.valueBadgeEmoji}>🎯</Text>
            <Text
              style={[
                styles.valueBadgeLabel,
                {color: isDark ? '#E2E8F0' : '#1E293B'},
              ]}>
              3-Tier Goals
            </Text>
          </View>

          {/* Badge 3: Habit Shield */}
          <View
            style={[
              styles.valueBadgePill,
              {
                backgroundColor: isDark ? '#151F32' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text style={styles.valueBadgeEmoji}>🔥</Text>
            <Text
              style={[
                styles.valueBadgeLabel,
                {color: isDark ? '#E2E8F0' : '#1E293B'},
              ]}>
              Habit Shield
            </Text>
          </View>
        </View>

        {/* Editorial Pagination Dots */}
        <View style={styles.paginationDotsRow}>
          <View
            style={[
              styles.activeDotPill,
              {backgroundColor: isDark ? '#38BDF8' : '#0F172A'},
            ]}
          />
          <View
            style={[
              styles.inactiveDot,
              {backgroundColor: isDark ? '#334155' : '#CBD5E1'},
            ]}
          />
          <View
            style={[
              styles.inactiveDot,
              {backgroundColor: isDark ? '#334155' : '#CBD5E1'},
            ]}
          />
        </View>
      </ScrollView>
      {/* END: Scrollable Body */}

      {/* BEGIN: Sticky Floating Tactile Bottom Action Bar */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            paddingBottom: Math.max(insets.bottom, 12) + 6,
            backgroundColor: isDark ? '#0B1120' : '#FFFFFF',
            borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          },
        ]}>
        {/* Dual Action Dock */}
        <View style={styles.actionDockRow}>
          {/* Secondary Button: Explore Tour */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Explore Tour"
            activeOpacity={0.8}
            onPress={() => setIsTourVisible(true)}
            style={[
              styles.exploreTourBtn,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <Text
              style={[
                styles.exploreTourText,
                {color: isDark ? '#E2E8F0' : '#334155'},
              ]}>
              Explore Tour
            </Text>
          </TouchableOpacity>

          {/* Primary High-Velocity Electric Sky Button */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Get Started and open Dashboard"
            activeOpacity={0.85}
            onPress={handleStart}
            style={styles.getStartedBtn}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <View style={styles.xpRewardPill}>
              <Text style={styles.xpStar}>★</Text>
              <Text style={styles.xpText}>+100 XP</Text>
              <Text style={styles.xpArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Editorial Disclaimer */}
        <Text
          style={[
            styles.disclaimerText,
            {color: isDark ? '#64748B' : '#94A3B8'},
          ]}>
          By continuing, you agree to Swift local sync & privacy terms.
        </Text>

        {/* Home Indicator Bar */}
        <View
          style={[
            styles.homeIndicatorBar,
            {backgroundColor: isDark ? '#334155' : '#CBD5E1'},
          ]}
        />
      </View>
      {/* END: Sticky Floating Tactile Bottom Action Bar */}

      {/* Interactive Tour Modal */}
      <Modal
        visible={isTourVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTourVisible(false)}>
        <View style={styles.tourModalOverlay}>
          <View
            style={[
              styles.tourModalSheet,
              {
                backgroundColor: isDark ? '#111C33' : '#FFFFFF',
                paddingBottom: Math.max(insets.bottom, 16) + 12,
              },
            ]}>
            {/* Grab Handle */}
            <View style={styles.sheetGrabHandle} />

            <View style={styles.tourModalHeader}>
              <View>
                <Text
                  style={[
                    styles.tourModalTitle,
                    {color: isDark ? '#FFFFFF' : '#0F172A'},
                  ]}>
                  GoTASK Architecture
                </Text>
                <Text
                  style={[
                    styles.tourModalSub,
                    {color: isDark ? '#94A3B8' : '#64748B'},
                  ]}>
                  Engineered for uninterrupted high-cadence builders
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsTourVisible(false)}
                style={[
                  styles.closeTourBtn,
                  {backgroundColor: isDark ? '#1E293B' : '#F1F5F9'},
                ]}>
                <Feather
                  name="x"
                  size={18}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            {/* Pillar 1 */}
            <View style={styles.tourPillarCard}>
              <View style={[styles.tourPillarIcon, {backgroundColor: '#E0F2FE'}]}>
                <Text style={{fontSize: 18}}>⚡</Text>
              </View>
              <View style={styles.tourPillarMeta}>
                <Text
                  style={[
                    styles.tourPillarTitle,
                    {color: isDark ? '#FFFFFF' : '#0F172A'},
                  ]}>
                  Offline-First Local SQLite
                </Text>
                <Text style={styles.tourPillarDesc}>
                  Instant interactions with zero network lag. Bi-directional background sync reconciles conflict-free.
                </Text>
              </View>
            </View>

            {/* Pillar 2 */}
            <View style={styles.tourPillarCard}>
              <View style={[styles.tourPillarIcon, {backgroundColor: '#FEF3C7'}]}>
                <Text style={{fontSize: 18}}>🎯</Text>
              </View>
              <View style={styles.tourPillarMeta}>
                <Text
                  style={[
                    styles.tourPillarTitle,
                    {color: isDark ? '#FFFFFF' : '#0F172A'},
                  ]}>
                  3-Tier Checkpoint Goals
                </Text>
                <Text style={styles.tourPillarDesc}>
                  Decompose ambitious milestones into progressive XP nodes with built-in AI roadmap assistance.
                </Text>
              </View>
            </View>

            {/* Pillar 3 */}
            <View style={styles.tourPillarCard}>
              <View style={[styles.tourPillarIcon, {backgroundColor: '#FEE2E2'}]}>
                <Text style={{fontSize: 18}}>🔥</Text>
              </View>
              <View style={styles.tourPillarMeta}>
                <Text
                  style={[
                    styles.tourPillarTitle,
                    {color: isDark ? '#FFFFFF' : '#0F172A'},
                  ]}>
                  Habit Shielding & Focus Flow
                </Text>
                <Text style={styles.tourPillarDesc}>
                  Protect daily streaks, complete Pomodoro blocks, and earn gamified XP multiplier velocity.
                </Text>
              </View>
            </View>

            {/* Tour Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleStart}
              style={styles.tourProceedBtn}>
              <Text style={styles.tourProceedText}>Launch Workspace (+100 XP) ➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    position: 'relative',
  },
  topAmbientGlow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 320,
    height: 240,
    borderRadius: 160,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
    zIndex: 10,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monogramBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  monogramLetterG: {
    fontSize: 15,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  monogramLetterT: {
    fontSize: 15,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#38BDF8',
    letterSpacing: -0.5,
  },
  brandMetaCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 13,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: -0.3,
    lineHeight: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  systemStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  systemStatusText: {
    fontSize: 9.5,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.6,
  },
  skipBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  skipBtnText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  editorialSection: {
    paddingTop: 4,
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  versionPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  versionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00A3FF',
  },
  versionText: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    letterSpacing: 0.5,
  },
  editorialHeadline: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  editorialSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  subtitleSky: {
    color: '#00A3FF',
    fontFamily: fontFamily.bold,
  },
  subtitleSlate: {
    fontFamily: fontFamily.regular,
  },
  heroStackWrapper: {
    position: 'relative',
    marginVertical: 4,
  },
  heroBackingCard: {
    position: 'absolute',
    top: -2,
    left: 8,
    right: 8,
    bottom: -2,
    borderRadius: 24,
    transform: [{rotate: '-1deg'}],
  },
  heroMainCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderBottomWidth: 3,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sprintIconSquircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 163, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sprintIconEmoji: {
    fontSize: 13,
  },
  sprintCardTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.black || fontFamily.bold,
    letterSpacing: -0.2,
    lineHeight: 15,
  },
  sprintCardSub: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    color: '#94A3B8',
    marginTop: 1,
  },
  flowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 16,
    borderWidth: 1,
  },
  flowPulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  flowTimeText: {
    fontSize: 10,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  flowLabelText: {
    fontSize: 9,
    fontFamily: fontFamily.bold,
  },
  velocityContainer: {
    marginTop: 10,
    marginBottom: 8,
  },
  velocityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  velocityLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  velocityText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  velocityDoneText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
  },
  velocityPercentText: {
    fontSize: 11,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#00A3FF',
  },
  velocityTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 1,
  },
  velocityFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#00A3FF',
  },
  subtasksList: {
    gap: 7,
    marginTop: 2,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 9,
  },
  subtaskRowCompleted: {
    // Styling handled dynamically
  },
  subtaskRowActive: {
    borderBottomWidth: 2,
  },
  checkedBox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckedBox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#00A3FF',
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 11.5,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    fontFamily: fontFamily.medium,
  },
  subtaskTitleActive: {
    fontFamily: fontFamily.bold,
  },
  subtaskDuration: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
  },
  liveTagBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveTagText: {
    fontSize: 9.5,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#00A3FF',
  },
  microFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
  },
  streakInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakFlameEmoji: {
    fontSize: 12,
  },
  streakInfoText: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
  },
  xpEarnedText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  valueBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginVertical: 10,
  },
  valueBadgePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  valueBadgeEmoji: {
    fontSize: 12,
  },
  valueBadgeLabel: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    letterSpacing: -0.2,
  },
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 6,
  },
  activeDotPill: {
    width: 24,
    height: 6,
    borderRadius: 3,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stickyBottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    zIndex: 20,
  },
  actionDockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exploreTourBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreTourText: {
    fontSize: 12,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
  },
  getStartedBtn: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#00A3FF',
    borderBottomWidth: 4,
    borderBottomColor: '#006AB0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#00A3FF',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 4,
  },
  getStartedText: {
    fontSize: 13.5,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  xpRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  xpStar: {
    fontSize: 10,
    color: '#FDE047',
  },
  xpText: {
    fontSize: 10,
    fontFamily: fontFamily.extraBold || fontFamily.bold,
    color: '#FFFFFF',
  },
  xpArrow: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
  },
  disclaimerText: {
    fontSize: 9.5,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
    marginTop: 8,
  },
  homeIndicatorBar: {
    width: 128,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  tourModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  tourModalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetGrabHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  tourModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tourModalTitle: {
    fontSize: 18,
    fontFamily: fontFamily.black || fontFamily.bold,
  },
  tourModalSub: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  closeTourBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourPillarCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tourPillarIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourPillarMeta: {
    flex: 1,
  },
  tourPillarTitle: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
  tourPillarDesc: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: '#64748B',
    lineHeight: 16,
  },
  tourProceedBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#00A3FF',
    borderBottomWidth: 4,
    borderBottomColor: '#006AB0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  tourProceedText: {
    fontSize: 13.5,
    fontFamily: fontFamily.black || fontFamily.bold,
    color: '#FFFFFF',
  },
});

export default WelcomeScreen;

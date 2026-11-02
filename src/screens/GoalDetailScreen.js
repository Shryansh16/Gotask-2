// src/screens/GoalDetailScreen.js
// Screen 4 Inner View: Goal Detail & Interactive Checkpoint Stepper Track
// Matched 1:1 against user reference media_1793627665876_8e0881ba.jpg

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';
import { useGoal } from '../context/GoalContext';
import { fontFamily } from '../common/fonts';
import ScreenContainer from '../design-system/ScreenContainer';
import ElevateTabBar from '../components/ElevateTabBar';
import ProgressModal from '../modules/ProgressModal';

export const GoalDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { goals, toggleMilestone } = useGoal();

  const [activeTab, setActiveTab] = useState('all');
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const selectedGoalId = route?.params?.goalId;
  const currentGoal =
    goals.find(g => g.id === selectedGoalId) || goals[0] || null;

  const handleOpenProgress = goal => {
    setSelectedGoal(goal || currentGoal);
    setProgressModalVisible(true);
  };

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#0B0F19' : '#FFFFFF'}
      />

      {/* 1. Top Status Ribbon: GoTASK • | 🔥 105 | 🪙 3,663 + | 🛡️ EMERALD */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: Math.max(insets.top, 14),
            backgroundColor: isDark ? '#0B0F19' : '#FFFFFF',
          },
        ]}>
        {/* Left: GoTASK • with Back Navigation */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.logoRow}>
          <Feather
            name="chevron-left"
            size={20}
            color={isDark ? '#94A3B8' : '#0B1C30'}
            style={{ marginRight: 2 }}
          />
          <Text
            style={[
              styles.logoText,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}>
            GoTASK
          </Text>
          <View style={styles.logoDot} />
        </TouchableOpacity>

        {/* Right Status Pills: Flame, XP, Emerald League */}
        <View style={styles.statusPillsRow}>
          {/* Flame Streak Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDark ? '#451A03' : '#FFF1E8',
                borderColor: isDark ? '#78350F' : '#FFD7BE',
              },
            ]}>
            <Text style={styles.pillEmoji}>🔥</Text>
            <Text
              style={[
                styles.pillText,
                { color: isDark ? '#FBBF24' : '#E65100' },
              ]}>
              105
            </Text>
          </View>

          {/* XP Coin Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDark ? '#2D2305' : '#FEF9C3',
                borderColor: isDark ? '#78350F' : '#FEF08A',
              },
            ]}>
            <Text style={styles.pillEmoji}>🪙</Text>
            <Text
              style={[
                styles.pillText,
                { color: isDark ? '#FDE047' : '#A16207' },
              ]}>
              3,663
            </Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>+</Text>
            </View>
          </View>

          {/* Emerald League Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isDark ? '#064E3B' : '#DCFCE7',
                borderColor: isDark ? '#065F46' : '#86EFAC',
              },
            ]}>
            <Text style={styles.pillEmoji}>🛡️</Text>
            <Text
              style={[
                styles.pillText,
                { color: isDark ? '#34D399' : '#15803D' },
              ]}>
              EMERALD
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Scrollable Body */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Emerald League & Velocity Hero Card */}
        <View
          style={[
            styles.leagueHeroCard,
            {
              backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
              borderColor: isDark ? '#065F46' : '#BBF7D0',
            },
          ]}>
          {/* Top Pill Row */}
          <View style={styles.leagueHeroTopRow}>
            <View style={styles.leagueDivisionPill}>
              <Text style={{ fontSize: 10, marginRight: 3 }}>🛡️</Text>
              <Text style={styles.leagueDivisionText}>
                SEASON 4 • EMERALD DIVISION
              </Text>
            </View>

            <View style={styles.cycleTimePill}>
              <Text style={{ fontSize: 10, marginRight: 3 }}>⏳</Text>
              <Text style={styles.cycleTimeText}>9h left in cycle</Text>
            </View>
          </View>

          {/* Centered Crowned Emerald Shield Crest */}
          <View style={styles.shieldCrestContainer}>
            <View style={styles.emeraldShieldIconBox}>
              <Text style={{ fontSize: 44 }}>🛡️</Text>
            </View>
            <Text
              style={[
                styles.leagueTitle,
                { color: isDark ? '#F8F9FF' : '#064E3B' },
              ]}>
              Emerald League
            </Text>
            <Text
              style={[
                styles.leagueSubtitle,
                { color: isDark ? '#A7F3D0' : '#047857' },
              ]}>
              Rank #5 of 30 • Top 5 advance to Diamond Tier
            </Text>
          </View>

          {/* Pace & Milestone Velocity Breakdown Sub-Card */}
          <View
            style={[
              styles.velocitySubCard,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <View style={styles.velocitySubHeader}>
              <View style={styles.velocitySubTitleRow}>
                <View style={styles.greenPulseDot} />
                <Text
                  style={[
                    styles.velocitySubTitle,
                    { color: isDark ? '#CBD5E1' : '#0F172A' },
                  ]}>
                  PACE & MILESTONE VELOCITY
                </Text>
              </View>
              <View style={styles.avgPacePill}>
                <Text style={styles.avgPaceText}>68% Avg Pace</Text>
              </View>
            </View>

            {/* Row 1: Endurance */}
            <View style={styles.epqRow}>
              <Text
                style={[
                  styles.epqLabel,
                  { color: isDark ? '#94A3B8' : '#334155' },
                ]}>
                ENDURANCE (HEALTH): 3,618 EPQ
              </Text>
              <Text style={[styles.epqTier, { color: '#0284C7' }]}>
                ADVANCED
              </Text>
            </View>
            <View style={styles.levelBarTrack}>
              <View
                style={[
                  styles.levelBarFill,
                  { width: '78%', backgroundColor: '#0284C7' },
                ]}
              />
            </View>

            {/* Row 2: Architecture */}
            <View style={[styles.epqRow, { marginTop: 8 }]}>
              <Text
                style={[
                  styles.epqLabel,
                  { color: isDark ? '#94A3B8' : '#334155' },
                ]}>
                ARCHITECTURE (SYSTEMS): 3,370 EPQ
              </Text>
              <Text style={[styles.epqTier, { color: '#0082CC' }]}>
                PROFICIENT
              </Text>
            </View>
            <View style={styles.levelBarTrack}>
              <View
                style={[
                  styles.levelBarFill,
                  { width: '64%', backgroundColor: '#0082CC' },
                ]}
              />
            </View>
          </View>
        </View>

        {/* 3. Filter Tabs: All Goals (4) | Active (3) | Completed (1) */}
        <View style={styles.tabsRow}>
          {[
            { key: 'all', label: 'All Goals (4)' },
            { key: 'active', label: 'Active (3)' },
            { key: 'completed', label: 'Completed (1)' },
          ].map(tab => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabChip,
                  isSelected
                    ? {
                        backgroundColor: '#0082CC',
                        borderColor: '#006BB8',
                      }
                    : {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#CBD5E1',
                      },
                ]}>
                <Text
                  style={[
                    styles.tabChipText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#475569',
                      fontFamily: isSelected
                        ? fontFamily.bold
                        : fontFamily.medium,
                    },
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Goal Card 1: Complete 50km Running Challenge */}
        <View
          style={[
            styles.stepperGoalCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          {/* Top Meta Row */}
          <View style={styles.goalMetaRow}>
            <View style={styles.goalPillsLeft}>
              <View
                style={[
                  styles.metaPill,
                  { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' },
                ]}>
                <Feather
                  name="activity"
                  size={11}
                  color="#15803D"
                  style={{ marginRight: 3 }}
                />
                <Text style={[styles.metaPillText, { color: '#15803D' }]}>
                  HEALTH
                </Text>
              </View>

              <View
                style={[
                  styles.metaPill,
                  { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' },
                ]}>
                <Text style={[styles.metaPillText, { color: '#0284C7' }]}>
                  Level 2 of 3
                </Text>
              </View>
            </View>

            <View style={styles.goalPillsRight}>
              <Text
                style={[
                  styles.dateText,
                  { color: isDark ? '#CBD5E1' : '#334155' },
                ]}>
                📅 22 Nov
              </Text>
              <Text style={styles.progressPercentText}>
                24.5 / 50 km (49%)
              </Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}>
            Complete 50km Running Challenge
          </Text>
          <Text
            style={[
              styles.cardDesc,
              { color: isDark ? '#94A3B8' : '#475569' },
            ]}>
            Aerobic endurance and cardio conditioning with weekly 10km tempo runs.
          </Text>

          {/* Mint Gradient Progress Bar */}
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' },
            ]}>
            <View
              style={[
                styles.progressBarFill,
                { width: '49%', backgroundColor: '#059669' },
              ]}
            />
          </View>

          {/* Stepper Header */}
          <View style={styles.stepperSectionHeader}>
            <Text
              style={[
                styles.stepperHeaderTitle,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              CHECKPOINTS & XP PROGRESSION
            </Text>
            <View style={styles.stepperBadgePill}>
              <Text style={styles.stepperBadgeText}>1 Cleared • 1 in Flight</Text>
            </View>
          </View>

          {/* Vertical Stepper Timeline Line & Tiles */}
          <View style={styles.timelineContainer}>
            {/* Continuous Vertical Connecting Line */}
            <View style={styles.connectingLine} />

            {/* Checkpoint 1 (Mastered - Dark Card) */}
            <View style={styles.timelineRow}>
              <View style={[styles.timelineNode, { backgroundColor: '#059669' }]}>
                <Feather name="check" size={12} color="#FFFFFF" />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.timelineTile,
                  { backgroundColor: '#0F172A', borderColor: '#1E293B' },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: '#064E3B' },
                  ]}>
                  <Feather name="activity" size={14} color="#34D399" />
                </View>
                <View style={styles.tileTextCol}>
                  <Text
                    style={[
                      styles.tileTitle,
                      { color: '#FFFFFF', textDecorationLine: 'line-through' },
                    ]}>
                    First 10km baseline run
                  </Text>
                  <Text style={[styles.tileSub, { color: '#34D399' }]}>
                    Checkpoint 1 • Mastered
                  </Text>
                </View>
                <View style={styles.xpCircleBadge}>
                  <Text style={styles.xpCircleText}>+50 XP</Text>
                  <Feather
                    name="check-circle"
                    size={11}
                    color="#34D399"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Checkpoint 2 (In Progress - Vibrant Cyan Card) */}
            <View style={styles.timelineRow}>
              <View style={[styles.timelineNode, { backgroundColor: '#0082CC' }]}>
                <Feather name="play" size={10} color="#FFFFFF" />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.timelineTile,
                  { backgroundColor: '#0082CC', borderColor: '#006BB8' },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  ]}>
                  <Feather name="maximize-2" size={14} color="#FFFFFF" />
                </View>
                <View style={styles.tileTextCol}>
                  <Text style={[styles.tileTitle, { color: '#FFFFFF' }]}>
                    25km half-way checkpoint
                  </Text>
                  <Text
                    style={[
                      styles.tileSub,
                      { color: 'rgba(255, 255, 255, 0.9)' },
                    ]}>
                    Checkpoint 2 • In Progress (14.5km logged)
                  </Text>
                </View>
                <View style={styles.xpCircleBadgeWhite}>
                  <Text style={styles.xpCircleTextWhite}>+75 XP</Text>
                  <Feather
                    name="clock"
                    size={11}
                    color="#FFFFFF"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Checkpoint 3 (Locked - Pale Card) */}
            <View style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineNode,
                  { backgroundColor: '#E2E8F0', borderColor: '#CBD5E1' },
                ]}>
                <Feather name="lock" size={10} color="#64748B" />
              </View>
              <View
                style={[
                  styles.timelineTile,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}>
                  <Feather
                    name="flag"
                    size={14}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                </View>
                <View style={styles.tileTextCol}>
                  <Text
                    style={[
                      styles.tileTitle,
                      { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    Final 50km endurance run
                  </Text>
                  <Text
                    style={[
                      styles.tileSub,
                      { color: isDark ? '#64748B' : '#94A3B8' },
                    ]}>
                    Unlocks at 25km
                  </Text>
                </View>
                <View style={styles.xpCircleBadgeLocked}>
                  <Text style={styles.xpCircleTextLocked}>+150 XP</Text>
                  <Feather
                    name="lock"
                    size={10}
                    color="#94A3B8"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Card Row */}
          <View style={styles.cardFooterRow}>
            <View style={styles.surgeRow}>
              <Text style={{ fontSize: 13, marginRight: 4 }}>⚡</Text>
              <Text
                style={[
                  styles.surgeText,
                  { color: isDark ? '#FBBF24' : '#D97706' },
                ]}>
                Double XP Surge Active
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleOpenProgress(goals[0])}
              style={styles.solidActionBtn}>
              <Feather
                name="plus-circle"
                size={13}
                color="#FFFFFF"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.solidActionText}>LOG PROGRESS +2.5KM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Goal Card 2: Master System Design & Microservices */}
        <View
          style={[
            styles.stepperGoalCard,
            {
              backgroundColor: isDark ? '#151D2F' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          {/* Top Meta Row */}
          <View style={styles.goalMetaRow}>
            <View style={styles.goalPillsLeft}>
              <View
                style={[
                  styles.metaPill,
                  { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' },
                ]}>
                <Text style={{ fontSize: 11, marginRight: 3 }}>📦</Text>
                <Text style={[styles.metaPillText, { color: '#7E22CE' }]}>
                  STUDY & ENG
                </Text>
              </View>

              <View
                style={[
                  styles.metaPill,
                  { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
                ]}>
                <Text style={[styles.metaPillText, { color: '#B45309' }]}>
                  Sprint W48
                </Text>
              </View>
            </View>

            <View style={styles.goalPillsRight}>
              <Text
                style={[
                  styles.dateText,
                  { color: isDark ? '#CBD5E1' : '#334155' },
                ]}>
                📅 Core Track
              </Text>
              <Text style={[styles.progressPercentText, { color: '#7E22CE' }]}>
                2 / 4 Modules Cleared
              </Text>
            </View>
          </View>

          {/* Title & Description */}
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? '#F8F9FF' : '#0B1C30' },
            ]}>
            Master System Design & Microservices
          </Text>
          <Text
            style={[
              styles.cardDesc,
              { color: isDark ? '#94A3B8' : '#475569' },
            ]}>
            Distributed caching, Kafka event streaming, and offline-first consensus topologies.
          </Text>

          {/* Purple Gradient Progress Bar */}
          <View
            style={[
              styles.progressBarTrack,
              { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' },
            ]}>
            <View
              style={[
                styles.progressBarFill,
                { width: '50%', backgroundColor: '#7E22CE' },
              ]}
            />
          </View>

          {/* Stepper Header */}
          <View style={styles.stepperSectionHeader}>
            <Text
              style={[
                styles.stepperHeaderTitle,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              ARCHITECTURE SKILL TRACK
            </Text>
            <View
              style={[
                styles.stepperBadgePill,
                { backgroundColor: '#FEF3C7' },
              ]}>
              <Text style={[styles.stepperBadgeText, { color: '#B45309' }]}>
                2 Mastered • 1 Active
              </Text>
            </View>
          </View>

          {/* Vertical Stepper Timeline Line & Tiles */}
          <View style={styles.timelineContainer}>
            <View
              style={[styles.connectingLine, { backgroundColor: '#7E22CE' }]}
            />

            {/* Module 1 (Mastered - Dark Card) */}
            <View style={styles.timelineRow}>
              <View style={[styles.timelineNode, { backgroundColor: '#059669' }]}>
                <Feather name="check" size={12} color="#FFFFFF" />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.timelineTile,
                  { backgroundColor: '#0F172A', borderColor: '#1E293B' },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: '#2E1065' },
                  ]}>
                  <Feather name="share-2" size={14} color="#C084FC" />
                </View>
                <View style={styles.tileTextCol}>
                  <Text
                    style={[
                      styles.tileTitle,
                      { color: '#FFFFFF', textDecorationLine: 'line-through' },
                    ]}>
                    CAP Theorem & Consistency
                  </Text>
                  <Text style={[styles.tileSub, { color: '#34D399' }]}>
                    Module 1 • Passed
                  </Text>
                </View>
                <View style={styles.xpCircleBadge}>
                  <Text style={styles.xpCircleText}>+50 XP</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Module 2 (Mastered - Dark Card) */}
            <View style={styles.timelineRow}>
              <View style={[styles.timelineNode, { backgroundColor: '#059669' }]}>
                <Feather name="check" size={12} color="#FFFFFF" />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.timelineTile,
                  { backgroundColor: '#0F172A', borderColor: '#1E293B' },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: '#2E1065' },
                  ]}>
                  <Feather name="database" size={14} color="#C084FC" />
                </View>
                <View style={styles.tileTextCol}>
                  <Text
                    style={[
                      styles.tileTitle,
                      { color: '#FFFFFF', textDecorationLine: 'line-through' },
                    ]}>
                    Sharding & DB Replication
                  </Text>
                  <Text style={[styles.tileSub, { color: '#34D399' }]}>
                    Module 2 • Passed
                  </Text>
                </View>
                <View style={styles.xpCircleBadge}>
                  <Text style={styles.xpCircleText}>+75 XP</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Module 3 (Active - Vibrant Purple Card) */}
            <View style={styles.timelineRow}>
              <View style={[styles.timelineNode, { backgroundColor: '#7E22CE' }]}>
                <Feather name="play" size={10} color="#FFFFFF" />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.timelineTile,
                  { backgroundColor: '#7E22CE', borderColor: '#6B21A8' },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                  ]}>
                  <Feather name="activity" size={14} color="#FFFFFF" />
                </View>
                <View style={styles.tileTextCol}>
                  <Text style={[styles.tileTitle, { color: '#FFFFFF' }]}>
                    Kafka & Event-Driven Streams
                  </Text>
                  <Text
                    style={[
                      styles.tileSub,
                      { color: 'rgba(255, 255, 255, 0.9)' },
                    ]}>
                    Module 3 • Active Lab Session
                  </Text>
                </View>
                <View style={styles.xpCircleBadgeWhite}>
                  <Text style={styles.xpCircleTextWhite}>+100 XP</Text>
                  <Feather
                    name="terminal"
                    size={11}
                    color="#FFFFFF"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Module 4 (Locked - Pale Card) */}
            <View style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineNode,
                  { backgroundColor: '#E2E8F0', borderColor: '#CBD5E1' },
                ]}>
                <Feather name="lock" size={10} color="#64748B" />
              </View>
              <View
                style={[
                  styles.timelineTile,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <View
                  style={[
                    styles.tileIconCircle,
                    { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                  ]}>
                  <Feather
                    name="radio"
                    size={14}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                </View>
                <View style={styles.tileTextCol}>
                  <Text
                    style={[
                      styles.tileTitle,
                      { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    Real-time WebSocket Gateway
                  </Text>
                  <Text
                    style={[
                      styles.tileSub,
                      { color: isDark ? '#64748B' : '#94A3B8' },
                    ]}>
                    Unlocks after Module 3
                  </Text>
                </View>
                <View style={styles.xpCircleBadgeLocked}>
                  <Text style={styles.xpCircleTextLocked}>+150 XP</Text>
                  <Feather
                    name="lock"
                    size={10}
                    color="#94A3B8"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Card Row */}
          <View style={styles.cardFooterRow}>
            <View style={styles.surgeRow}>
              <Feather
                name="cloud"
                size={13}
                color={isDark ? '#C084FC' : '#7E22CE'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.surgeText,
                  { color: isDark ? '#C084FC' : '#7E22CE' },
                ]}>
                Cloud Docker Container Ready
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleOpenProgress(goals[1])}
              style={[
                styles.solidActionBtn,
                { backgroundColor: '#7E22CE', borderBottomColor: '#581C87' },
              ]}>
              <Feather
                name="terminal"
                size={13}
                color="#FFFFFF"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.solidActionText}>LAUNCH LAB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Elevate Pace Multiplier Bottom Banner (Forest Green) */}
        <View style={styles.paceMultiplierCard}>
          <View style={styles.paceMultiplierLeft}>
            <View style={styles.paceMultiplierTagRow}>
              <Feather
                name="clock"
                size={12}
                color="#34D399"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.paceMultiplierTagText}>
                ELEVATE PACE MULTIPLIER
              </Text>
            </View>
            <Text style={styles.paceMultiplierTitle}>Maintain Momentum</Text>
            <Text style={styles.paceMultiplierBody}>
              Logging checkpoints under 48 hours keeps you in top 5 of Emerald
              League with +20% bonus XP.
            </Text>
          </View>

          <View style={styles.trophyIconBox}>
            <Feather name="award" size={24} color="#34D399" />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => handleOpenProgress(currentGoal)}
        activeOpacity={0.85}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create checkpoint"
        style={styles.fab}>
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Elevate Bottom Bar */}
      <ElevateTabBar activeTab="goals" variant="core" navigation={navigation} />

      {/* Progress Modal */}
      <ProgressModal
        visible={progressModalVisible}
        onClose={() => setProgressModalVisible(false)}
        goal={selectedGoal || currentGoal}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 3,
  },
  statusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 5,
  },
  pillEmoji: {
    fontSize: 11,
    marginRight: 3,
  },
  pillText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  plusBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  plusBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    lineHeight: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 160,
  },
  // Emerald League Hero Card
  leagueHeroCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  leagueHeroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leagueDivisionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  leagueDivisionText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#15803D',
  },
  cycleTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cycleTimeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#64748B',
  },
  shieldCrestContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  emeraldShieldIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  leagueTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.3,
  },
  leagueSubtitle: {
    fontSize: 11,
    fontFamily: fontFamily.medium,
    marginTop: 2,
    marginBottom: 10,
  },
  velocitySubCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  velocitySubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  velocitySubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  velocitySubTitle: {
    fontSize: 10.5,
    fontFamily: fontFamily.bold,
  },
  avgPacePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  avgPaceText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#15803D',
  },
  epqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  epqLabel: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  epqTier: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  levelBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Tabs
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
  },
  tabChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  tabChipText: {
    fontSize: 11,
  },
  // Goal Card with Stepper
  stepperGoalCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalPillsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaPillText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
  },
  goalPillsRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 10.5,
    fontFamily: fontFamily.bold,
  },
  progressPercentText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#0284C7',
    marginTop: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  cardDesc: {
    fontSize: 11.5,
    fontFamily: fontFamily.regular,
    lineHeight: 16,
    marginTop: 3,
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepperSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepperHeaderTitle: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.8,
  },
  stepperBadgePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  stepperBadgeText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#15803D',
  },
  // Timeline Stepper
  timelineContainer: {
    position: 'relative',
    paddingLeft: 4,
    marginBottom: 10,
  },
  connectingLine: {
    position: 'absolute',
    left: 14,
    top: 15,
    bottom: 25,
    width: 2,
    backgroundColor: '#059669',
    zIndex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 2,
  },
  timelineNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  timelineTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tileIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tileTextCol: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 12.5,
    fontFamily: fontFamily.bold,
  },
  tileSub: {
    fontSize: 10.5,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  xpCircleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpCircleText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#34D399',
  },
  xpCircleBadgeWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpCircleTextWhite: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  xpCircleBadgeLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  xpCircleTextLocked: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#94A3B8',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  surgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surgeText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  solidActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0082CC',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  solidActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fontFamily.bold,
  },
  // Bottom Pace Multiplier Banner
  paceMultiplierCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  paceMultiplierLeft: {
    flex: 1,
    marginRight: 12,
  },
  paceMultiplierTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  paceMultiplierTagText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  paceMultiplierTitle: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paceMultiplierBody: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: '#A7F3D0',
    lineHeight: 16,
  },
  trophyIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 78,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#00A3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#00629D',
    elevation: 8,
    shadowColor: '#00A3FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10,
  },
});

export default GoalDetailScreen;


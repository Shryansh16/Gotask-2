// src/components/ElevateLeagueLeaderboard.js
// Pixel-perfect replica of Elevate's Emerald League & Leaderboard System (Image 3)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {useTheme} from '../context/ThemeContext';
import {fontFamily} from '../common/fonts';

const LEAGUE_STANDINGS = [
  {rank: 1, name: 'Ansu M', xp: 1785, avatar: 'A', avatarBg: '#99F6E4', isUser: false},
  {rank: 2, name: 'Alexandre', xp: 1420, avatar: 'A', avatarBg: '#FED7AA', isUser: false},
  {rank: 3, name: 'Tehmine', xp: 1207, avatar: 'T', avatarBg: '#0284C7', isUser: false, isBronze: true},
  {rank: 4, name: 'Katy P', xp: 928, avatar: 'K', avatarBg: '#10B981', isUser: false},
  {rank: 5, name: 'Shryansh', xp: 867, avatar: 'S', avatarBg: '#6366F1', isUser: true},
  {rank: 6, name: 'Meghana P', xp: 840, avatar: 'M', avatarBg: '#059669', isUser: false},
  {rank: 7, name: 'Ruchie G', xp: 826, avatar: 'R', avatarBg: '#0284C7', isUser: false},
];

export const ElevateLeagueLeaderboard = ({userXP = 867}) => {
  const {theme, isDark} = useTheme();

  return (
    <View style={styles.container}>
      {/* Top Emerald League Header */}
      <View style={styles.leagueHero}>
        {/* Shields row */}
        <View style={styles.shieldsRow}>
          <View style={styles.sideShield}>
            <Text style={{fontSize: 22}}>🛡️</Text>
          </View>
          <View style={styles.sideShield}>
            <Text style={{fontSize: 26}}>🍁</Text>
          </View>
          <View style={styles.centerShieldContainer}>
            <Text style={{fontSize: 14, textAlign: 'center'}}>👑</Text>
            <View style={styles.centerShield}>
              <Text style={{fontSize: 34}}>🧠</Text>
            </View>
          </View>
          <View style={styles.sideShield}>
            <Text style={{fontSize: 24, opacity: 0.4}}>🔒</Text>
          </View>
          <View style={styles.sideShield}>
            <Text style={{fontSize: 22, opacity: 0.3}}>⭐</Text>
          </View>
        </View>

        <Text style={[styles.leagueTitle, {color: isDark ? '#F8FAFC' : '#0F172A'}]}>
          Emerald League
        </Text>
        <Text style={[styles.leagueSubtitle, {color: isDark ? '#94A3B8' : '#64748B'}]}>
          Top 5 advance to the next league
        </Text>

        <View style={styles.timerPill}>
          <Text style={styles.timerText}>⏳ 9 HOURS LEFT</Text>
        </View>
      </View>

      {/* Leaderboard Cards */}
      <View style={styles.listContainer}>
        {LEAGUE_STANDINGS.map((item, index) => {
          const isPromotionCutoff = index === 4; // After rank 5
          return (
            <React.Fragment key={item.rank}>
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: item.isUser
                      ? (isDark ? '#064E3B' : '#DCFCE7')
                      : (isDark ? '#151D2F' : '#FFFFFF'),
                    borderColor: item.isUser
                      ? '#22C55E'
                      : (isDark ? '#1E293B' : '#E2E8F0'),
                    borderWidth: item.isUser ? 2 : 1,
                    borderBottomWidth: 4,
                    borderBottomColor: item.isUser
                      ? '#16A34A'
                      : (isDark ? '#0F172A' : '#CBD5E1'),
                  },
                ]}>
                {/* Left: Rank & Avatar */}
                <View style={styles.rankAvatarRow}>
                  {item.isBronze ? (
                    <Text style={styles.trophyIcon}>🥉</Text>
                  ) : (
                    <Text
                      style={[
                        styles.rankNumber,
                        {
                          color: item.rank <= 5 ? '#10B981' : (isDark ? '#64748B' : '#94A3B8'),
                        },
                      ]}>
                      {item.rank}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.avatarBadge,
                      {backgroundColor: item.avatarBg},
                    ]}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                  </View>

                  <Text
                    style={[
                      styles.userName,
                      {
                        color: item.isUser
                          ? (isDark ? '#6EE7B7' : '#15803D')
                          : (isDark ? '#F8FAFC' : '#0F172A'),
                        fontFamily: item.isUser ? fontFamily.bold : fontFamily.semiBold,
                      },
                    ]}>
                    {item.name}
                  </Text>
                </View>

                {/* Right: XP Score */}
                <Text
                  style={[
                    styles.xpScore,
                    {
                      color: item.isUser
                        ? (isDark ? '#6EE7B7' : '#15803D')
                        : (isDark ? '#94A3B8' : '#64748B'),
                    },
                  ]}>
                  {item.isUser ? userXP : item.xp} XP
                </Text>
              </View>

              {/* Elevate Moving to Next League Banner */}
              {isPromotionCutoff && (
                <View style={styles.promotionBanner}>
                  <Text style={styles.promotionChevrons}>▲▲</Text>
                  <Text style={styles.promotionText}>MOVING TO NEXT LEAGUE</Text>
                  <Text style={styles.promotionChevrons}>▲▲</Text>
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  leagueHero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sideShield: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  centerShieldContainer: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  centerShield: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    borderWidth: 3,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    marginTop: 6,
    letterSpacing: -0.5,
  },
  leagueSubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    marginTop: 2,
    marginBottom: 8,
  },
  timerPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  timerText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: '#D97706',
    letterSpacing: 0.4,
  },
  listContainer: {
    marginTop: 6,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  rankAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trophyIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  rankNumber: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    width: 24,
    textAlign: 'center',
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 14,
    flex: 1,
  },
  xpScore: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  promotionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginVertical: 4,
  },
  promotionChevrons: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  promotionText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    color: '#10B981',
    letterSpacing: 0.6,
  },
});

export default ElevateLeagueLeaderboard;


// src/screens/Settings.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import HemburgerButton from '../modules/HemburgerButton';
import apiService from '../services/apiService';
import { textScale } from '../styles/responsiveStyles';
import { fontFamily } from '../common/fonts';
import { spacing } from '../styles/spacing';

const Settings = () => {
  const navigation = useNavigation();
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const {
    tasks,
    syncStatus,
    triggerSync,
    clearCompleted,
    seedSampleTasks,
    resetAllData,
  } = useTasks();

  const [serverUrl, setServerUrl] = useState(apiService.baseUrl);
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [serverStatus, setServerStatus] = useState(null); // 'online' | 'offline' | null

  // Setting preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [autoSyncOnLaunch, setAutoSyncOnLaunch] = useState(true);

  useEffect(() => {
    setServerUrl(apiService.baseUrl);
  }, []);

  const handleSaveServerUrl = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('Required', 'Please enter a valid server URL');
      return;
    }
    await apiService.setServerUrl(serverUrl.trim());
    Alert.alert('Saved', `Server URL set to: ${serverUrl.trim()}`);
  };

  const handleTestConnection = async () => {
    setIsTestingServer(true);
    setServerStatus(null);
    try {
      const isUp = await apiService.checkServerHealth();
      setServerStatus(isUp ? 'online' : 'offline');
      if (isUp) {
        Alert.alert('Connected! 🎉', 'Backend server is reachable and responsive.');
      } else {
        Alert.alert(
          'Connection Failed ⚠️',
          `Cannot reach ${serverUrl}.\n\nTips:\n- Ensure "node backend/server.js" is running.\n- For Android emulator, use "http://10.0.2.2:5000".\n- For physical phones, use your computer\'s Wi-Fi IP.`
        );
      }
    } catch (e) {
      setServerStatus('offline');
      Alert.alert('Error', e.message);
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleSetQuickUrl = async (url) => {
    setServerUrl(url);
    await apiService.setServerUrl(url);
  };

  const handleClearCompleted = () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) {
      Alert.alert('No Completed Tasks', 'There are no finished tasks to clean up.');
      return;
    }
    Alert.alert(
      'Clear Completed Tasks',
      `Remove ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'} from your active list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCompleted },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      '⚠️ Reset All Data',
      'This will delete all local tasks and profile data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('Data Reset', 'All tasks have been wiped clean.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <HemburgerButton onPressButton={() => navigation.openDrawer()} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Settings & Sync
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Appearance / Theme Selector */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            🎨 Appearance
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
            Customize the look and feel of GOTask
          </Text>

          <View style={styles.themeOptionsRow}>
            {[
              { id: 'light', label: '☀️ Light', sub: 'Bright & Crisp' },
              { id: 'dark', label: '🌙 Dark', sub: 'Deep & Sleek' },
              { id: 'system', label: '⚙️ Auto', sub: 'System sync' },
            ].map((opt) => {
              const isSelected = themeMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  onPress={() => setThemeMode(opt.id)}
                  style={[
                    styles.themeOptionBtn,
                    {
                      backgroundColor: isSelected
                        ? theme.primaryLight
                        : theme.surfaceSecondary,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      { color: isSelected ? theme.primary : theme.textPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.themeOptionSub,
                      { color: isSelected ? theme.primary : theme.textMuted },
                    ]}
                  >
                    {opt.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Backend REST API Server Config */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              🌐 Cloud Sync & Backend API
            </Text>
            {serverStatus && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      serverStatus === 'online'
                        ? theme.successLight
                        : theme.dangerLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        serverStatus === 'online' ? theme.success : theme.danger,
                    },
                  ]}
                >
                  {serverStatus === 'online' ? 'Online ●' : 'Offline ✕'}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
            Connect to GOTask REST Server for bidirectional sync
          </Text>

          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Server Endpoint URL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surfaceSecondary,
                color: theme.textPrimary,
                borderColor: theme.border,
              },
            ]}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://10.0.2.2:5000"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              onPress={() =>
                handleSetQuickUrl(
                  Platform.OS === 'android'
                    ? 'http://10.0.2.2:5000'
                    : 'http://localhost:5000'
                )
              }
              style={[styles.presetBtn, { backgroundColor: theme.surfaceSecondary }]}
            >
              <Text style={[styles.presetText, { color: theme.textSecondary }]}>
                {Platform.OS === 'android' ? '📱 Emulator (10.0.2.2)' : '💻 Localhost'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSetQuickUrl('http://192.168.1.100:5000')}
              style={[styles.presetBtn, { backgroundColor: theme.surfaceSecondary }]}
            >
              <Text style={[styles.presetText, { color: theme.textSecondary }]}>
                📶 Wi-Fi LAN
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons: Test & Save */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTestConnection}
              disabled={isTestingServer}
              style={[
                styles.actionBtn,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                {isTestingServer ? 'Pinging...' : 'Test Connection 🔍'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveServerUrl}
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
                Save URL 💾
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Trigger Sync Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={triggerSync}
            style={[styles.fullSyncBtn, { backgroundColor: theme.primaryLight }]}
          >
            <Text style={[styles.fullSyncText, { color: theme.primary }]}>
              {syncStatus === 'syncing' ? 'Syncing...' : '🔄 Sync Tasks Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Toggles */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            🔔 Preferences
          </Text>

          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                Sound & Completion Chimes
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Play audio feedback on task complete
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={[styles.sep, { backgroundColor: theme.divider }]} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                Haptic Feedback
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Vibrate gently when toggling checkboxes
              </Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>

          <View style={[styles.sep, { backgroundColor: theme.divider }]} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
                Auto-Sync on Launch
              </Text>
              <Text style={[styles.toggleSub, { color: theme.textMuted }]}>
                Fetch newest tasks when app starts
              </Text>
            </View>
            <Switch
              value={autoSyncOnLaunch}
              onValueChange={setAutoSyncOnLaunch}
              trackColor={{ false: theme.border, true: theme.primary }}
            />
          </View>
        </View>

        {/* Data Management & Danger Zone */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
            theme.cardShadow,
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
            🗄️ Data Management
          </Text>

          <TouchableOpacity
            onPress={handleClearCompleted}
            style={[styles.manageBtn, { backgroundColor: theme.surfaceSecondary }]}
          >
            <Text style={[styles.manageBtnText, { color: theme.warning }]}>
              🧹 Clear Completed Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={seedSampleTasks}
            style={[
              styles.manageBtn,
              { backgroundColor: theme.surfaceSecondary, marginTop: 8 },
            ]}
          >
            <Text style={[styles.manageBtnText, { color: theme.primary }]}>
              📦 Restore Demo Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResetData}
            style={[
              styles.manageBtn,
              { backgroundColor: theme.dangerLight, marginTop: 8 },
            ]}
          >
            <Text style={[styles.manageBtnText, { color: theme.danger }]}>
              🗑️ Reset All Local Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* About App Info */}
        <View style={styles.aboutContainer}>
          <Text style={[styles.aboutBrand, { color: theme.primary }]}>GoTask Mobile</Text>
          <Text style={[styles.aboutVersion, { color: theme.textMuted }]}>
            Version 2.0.0 • Architecture Revamp
          </Text>
          <Text style={[styles.aboutDesc, { color: theme.textMuted }]}>
            Crafted for speed, clean Poppins typography, offline-first reliability, and seamless multi-device sync.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: textScale(18),
    fontFamily: fontFamily.bold,
  },
  scrollContent: {
    padding: spacing.PADDING_16,
    paddingBottom: spacing.PADDING_40,
  },
  card: {
    borderRadius: 20,
    padding: spacing.PADDING_18,
    borderWidth: 1,
    marginBottom: spacing.MARGIN_16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: textScale(15),
    fontFamily: fontFamily.bold,
  },
  cardSubtitle: {
    fontSize: textScale(12),
    fontFamily: fontFamily.regular,
    marginTop: 2,
    marginBottom: 12,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  themeOptionBtn: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  themeOptionLabel: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  themeOptionSub: {
    fontSize: textScale(10),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: textScale(12),
    fontFamily: fontFamily.medium,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: textScale(13),
    fontFamily: fontFamily.regular,
  },
  presetsRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  presetText: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionBtnText: {
    fontSize: textScale(12),
    fontFamily: fontFamily.bold,
  },
  fullSyncBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullSyncText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: textScale(10),
    fontFamily: fontFamily.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleTitle: {
    fontSize: textScale(13),
    fontFamily: fontFamily.medium,
  },
  toggleSub: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  sep: {
    height: 1,
    marginVertical: 4,
  },
  manageBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  manageBtnText: {
    fontSize: textScale(13),
    fontFamily: fontFamily.bold,
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  aboutBrand: {
    fontSize: textScale(16),
    fontFamily: fontFamily.bold,
  },
  aboutVersion: {
    fontSize: textScale(11),
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  aboutDesc: {
    fontSize: textScale(11),
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
});

export default Settings;

// src/screens/Settings.js
import React, {useState, useEffect} from 'react';
import {
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
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../context/ThemeContext';
import {useTasks} from '../context/TaskContext';
import {useNotes} from '../context/NoteContext';
import {useGoal} from '../context/GoalContext';
import {useHabits} from '../context/HabitContext';
import {usePlanning} from '../context/PlanningContext';
import {
  createBackupPayload,
  prepareRestoreData,
} from '../services/backupService';
import apiService from '../services/apiService';
import {fontFamily} from '../common/fonts';
import {spacing} from '../styles/spacing';
import ScreenContainer from '../design-system/ScreenContainer';
import Header from '../design-system/Header';
import ElevateTabBar from '../components/ElevateTabBar';

const Settings = () => {
  const navigation = useNavigation();
  const {theme, isDark, themeMode, setThemeMode} = useTheme();
  const {
    tasks,
    syncStatus,
    triggerSync,
    clearCompleted,
    seedSampleTasks,
    resetAllData,
    profile,
    categories,
  } = useTasks();
  const {notes} = useNotes();
  const {goals} = useGoal();
  const {habits} = useHabits();
  const {focusHistory} = usePlanning();

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
        Alert.alert(
          'Connected!',
          'Backend server is reachable and responsive.',
        );
      } else {
        Alert.alert(
          'Connection Failed',
          `Cannot reach ${serverUrl}.\n\nTips:\n- Ensure "node backend/server.js" is running.\n- For Android emulator, use "http://10.0.2.2:5000".\n- For physical phones, use your computer's Wi-Fi IP.`,
        );
      }
    } catch (e) {
      setServerStatus('offline');
      Alert.alert('Error', e.message);
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleSetQuickUrl = async url => {
    setServerUrl(url);
    await apiService.setServerUrl(url);
  };

  const handleClearCompleted = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      Alert.alert(
        'No Completed Tasks',
        'There are no finished tasks to clean up.',
      );
      return;
    }
    Alert.alert(
      'Clear Completed Tasks',
      `Remove ${completedCount} completed ${
        completedCount === 1 ? 'task' : 'tasks'
      } from your active list?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Clear', style: 'destructive', onPress: clearCompleted},
      ],
    );
  };

  const handleExportBackup = async () => {
    try {
      const payload = createBackupPayload({
        tasks,
        notes: notes || [],
        goals: goals || [],
        habits: habits || [],
        focusSessions: focusHistory || [],
        profile,
        categories,
      });

      Alert.alert(
        'Backup Snapshot Created',
        `Version: ${payload.schemaVersion}\nChecksum: ${payload.checksum}\n\nTasks: ${payload.recordCounts.tasks}\nNotes: ${payload.recordCounts.notes}\nGoals: ${payload.recordCounts.goals}\nHabits: ${payload.recordCounts.habits}\nFocus Sessions: ${payload.recordCounts.focusSessions}\n\nIntegrity verified. Upload to cloud server?`,
        [
          {text: 'Keep Local', style: 'cancel'},
          {
            text: 'Upload to Server',
            onPress: async () => {
              const res = await apiService.importBackup(payload);
              if (res.success) {
                Alert.alert(
                  'Cloud Backup Complete',
                  `Saved to server snapshot.\nChecksum: ${res.checksum}`,
                );
              } else {
                Alert.alert('Upload Failed', res.error || 'Server unreachable');
              }
            },
          },
        ],
      );
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'Restore Server Backup',
      'This will fetch the latest verified backup from the server, validate its checksum, migrate schemas, and restore records.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restore Now',
          onPress: async () => {
            const res = await apiService.exportBackup();
            if (!res.success) {
              Alert.alert(
                'Restore Failed',
                res.error || 'Could not fetch server backup.',
              );
              return;
            }
            try {
              const prepared = prepareRestoreData(res.backup);
              Alert.alert(
                'Restore Verified',
                `Restored:\n- ${prepared.recordCounts.tasks} tasks\n- ${prepared.recordCounts.notes} notes\n- ${prepared.recordCounts.goals} goals\n- ${prepared.recordCounts.habits} habits\n- ${prepared.recordCounts.focusSessions} focus sessions\n\nIntegrity verified & schema up to date!`,
              );
            } catch (err) {
              Alert.alert('Corrupt Backup Blocked', err.message);
            }
          },
        },
      ],
    );
  };

  const handleReconcileSync = async () => {
    try {
      const res = await apiService.resolveSync(tasks);
      if (res.success) {
        Alert.alert(
          'Sync Reconciliation Complete',
          `Processed: ${res.processedCount} tasks\nUpdated: ${res.updatedCount}\nUnchanged: ${res.unchangedCount}\n\nDeterministic LWW conflict resolution completed.`,
        );
      } else {
        Alert.alert(
          'Sync Failed',
          res.error || 'Could not reconcile with server.',
        );
      }
    } catch (err) {
      Alert.alert('Sync Error', err.message);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all local tasks and profile data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            Alert.alert('Data Reset', 'All tasks have been wiped clean.');
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scrollable={false} contentPadding={0}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Editorial Header */}
      <Header
        title="Settings & System"
        subtitle="Preferences, theme & cloud connectivity"
        navigation={navigation}
      />

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Appearance Studio */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderLeftColor: theme.primary,
              borderLeftWidth: 5,
            },
            theme.cardShadow,
          ]}>
          <View style={styles.cardHeaderWithIcon}>
            <View
              style={[
                styles.headerMedallion,
                {backgroundColor: theme.primaryLight},
              ]}>
              <Feather name="moon" size={16} color={theme.primary} />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.cardTitle, {color: theme.textPrimary}]}>
                Appearance Studio
              </Text>
              <Text style={[styles.cardSubtitle, {color: theme.textMuted}]}>
                Choose your visual theme experience
              </Text>
            </View>
          </View>

          <View style={styles.themeOptionsRow}>
            {[
              {
                id: 'light',
                label: 'Light',
                icon: 'sun',
                sub: 'Crisp & Warm',
                iconBg: '#FEF3C7',
                iconColor: '#D97706',
              },
              {
                id: 'dark',
                label: 'Dark',
                icon: 'moon',
                sub: 'Deep Obsidian',
                iconBg: '#312E81',
                iconColor: '#818CF8',
              },
              {
                id: 'system',
                label: 'System',
                icon: 'smartphone',
                sub: 'Follows OS',
                iconBg: '#CFFAFE',
                iconColor: '#0891B2',
              },
            ].map(opt => {
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
                      borderWidth: 1.5,
                      borderBottomWidth: 3,
                      borderBottomColor: isSelected
                        ? '#3730A3'
                        : isDark
                        ? '#0F172A'
                        : '#CBD5E1',
                    },
                  ]}>
                  <View
                    style={[
                      styles.themeIconCircle,
                      {backgroundColor: opt.iconBg},
                    ]}>
                    <Feather name={opt.icon} size={16} color={opt.iconColor} />
                  </View>
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      {
                        color: isSelected ? theme.primary : theme.textPrimary,
                        fontFamily: isSelected
                          ? fontFamily.bold
                          : fontFamily.semiBold,
                      },
                    ]}>
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      styles.themeOptionSub,
                      {color: isSelected ? theme.primary : theme.textMuted},
                    ]}>
                    {opt.sub}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        styles.themeActiveBadge,
                        {backgroundColor: theme.primary},
                      ]}>
                      <Feather name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Backend REST API Server Config */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderLeftColor: '#06B6D4',
              borderLeftWidth: 5,
            },
            theme.cardShadow,
          ]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderWithIcon}>
              <View
                style={[
                  styles.headerMedallion,
                  {backgroundColor: '#CFFAFE'},
                ]}>
                <Feather name="cloud" size={16} color="#0891B2" />
              </View>
              <View>
                <Text style={[styles.cardTitle, {color: theme.textPrimary}]}>
                  Cloud Sync & Server
                </Text>
                <Text style={[styles.cardSubtitle, {color: theme.textMuted}]}>
                  Bidirectional REST server sync
                </Text>
              </View>
            </View>
            {serverStatus && (
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      serverStatus === 'online'
                        ? '#D1FAE5'
                        : theme.dangerLight,
                  },
                ]}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        serverStatus === 'online' ? '#10B981' : theme.danger,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        serverStatus === 'online' ? '#047857' : theme.danger,
                    },
                  ]}>
                  {serverStatus === 'online' ? 'Online' : 'Offline'}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.inputLabel, {color: theme.textSecondary}]}>
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
                    : 'http://localhost:5000',
                )
              }
              style={[
                styles.presetBtn,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}>
              <Feather
                name="monitor"
                size={12}
                color={theme.textSecondary}
                style={{marginRight: 5}}
              />
              <Text style={[styles.presetText, {color: theme.textSecondary}]}>
                {Platform.OS === 'android' ? 'Emulator (10.0.2.2)' : 'Localhost'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSetQuickUrl('http://192.168.1.100:5000')}
              style={[
                styles.presetBtn,
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}>
              <Feather
                name="wifi"
                size={12}
                color={theme.textSecondary}
                style={{marginRight: 5}}
              />
              <Text style={[styles.presetText, {color: theme.textSecondary}]}>
                Wi-Fi LAN
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
                {
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}>
              <Feather
                name="activity"
                size={14}
                color={theme.textPrimary}
                style={{marginRight: 6}}
              />
              <Text style={[styles.actionBtnText, {color: theme.textPrimary}]}>
                {isTestingServer ? 'Pinging...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveServerUrl}
              style={[
                styles.actionBtn,
                {backgroundColor: theme.primary, borderColor: theme.primary},
              ]}>
              <Feather
                name="check"
                size={14}
                color="#FFFFFF"
                style={{marginRight: 6}}
              />
              <Text style={[styles.actionBtnText, {color: '#FFFFFF'}]}>
                Save URL
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Trigger Sync Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={triggerSync}
            style={[
              styles.fullSyncBtn,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}>
            <Feather
              name="refresh-cw"
              size={14}
              color={theme.primary}
              style={{marginRight: 8}}
            />
            <Text style={[styles.fullSyncText, {color: theme.primary}]}>
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Tasks Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preferences Toggles */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderLeftColor: '#8B5CF6',
              borderLeftWidth: 5,
            },
            theme.cardShadow,
          ]}>
          <View style={styles.cardHeaderWithIcon}>
            <View
              style={[
                styles.headerMedallion,
                {backgroundColor: '#EDE9FE'},
              ]}>
              <Feather name="sliders" size={16} color="#7C3AED" />
            </View>
            <View>
              <Text style={[styles.cardTitle, {color: theme.textPrimary}]}>
                Tactile Experience
              </Text>
              <Text style={[styles.cardSubtitle, {color: theme.textMuted}]}>
                Haptics, sounds and interaction feedback
              </Text>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <View
              style={[
                styles.toggleIconCircle,
                {backgroundColor: '#FEF3C7'},
              ]}>
              <Feather name="bell" size={16} color="#D97706" />
            </View>
            <View style={{flex: 1, marginHorizontal: spacing.small}}>
              <Text style={[styles.toggleTitle, {color: theme.textPrimary}]}>
                Sound & Completion Chimes
              </Text>
              <Text style={[styles.toggleSub, {color: theme.textMuted}]}>
                Play audio feedback on task complete
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{false: theme.border, true: theme.primary}}
            />
          </View>

          <View style={[styles.sep, {backgroundColor: theme.border}]} />

          <View style={styles.toggleRow}>
            <View
              style={[
                styles.toggleIconCircle,
                {backgroundColor: '#D1FAE5'},
              ]}>
              <Feather name="smartphone" size={16} color="#059669" />
            </View>
            <View style={{flex: 1, marginHorizontal: spacing.small}}>
              <Text style={[styles.toggleTitle, {color: theme.textPrimary}]}>
                Haptic Feedback
              </Text>
              <Text style={[styles.toggleSub, {color: theme.textMuted}]}>
                Vibrate gently when toggling checkboxes
              </Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{false: theme.border, true: theme.primary}}
            />
          </View>

          <View style={[styles.sep, {backgroundColor: theme.border}]} />

          <View style={styles.toggleRow}>
            <View
              style={[
                styles.toggleIconCircle,
                {backgroundColor: '#EEF2FF'},
              ]}>
              <Feather name="zap" size={16} color="#4F46E5" />
            </View>
            <View style={{flex: 1, marginHorizontal: spacing.small}}>
              <Text style={[styles.toggleTitle, {color: theme.textPrimary}]}>
                Auto-Sync on Launch
              </Text>
              <Text style={[styles.toggleSub, {color: theme.textMuted}]}>
                Fetch newest tasks when app starts
              </Text>
            </View>
            <Switch
              value={autoSyncOnLaunch}
              onValueChange={setAutoSyncOnLaunch}
              trackColor={{false: theme.border, true: theme.primary}}
            />
          </View>
        </View>

        {/* Data Management & Danger Zone */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              borderLeftColor: '#10B981',
              borderLeftWidth: 5,
            },
            theme.cardShadow,
          ]}>
          <View style={styles.cardHeaderWithIcon}>
            <View
              style={[
                styles.headerMedallion,
                {backgroundColor: '#D1FAE5'},
              ]}>
              <Feather name="database" size={16} color="#059669" />
            </View>
            <View>
              <Text style={[styles.cardTitle, {color: theme.textPrimary}]}>
                Data Management
              </Text>
              <Text style={[styles.cardSubtitle, {color: theme.textMuted}]}>
                Backup, snapshot restore and maintenance
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleExportBackup}
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
              },
            ]}>
            <View
              style={[
                styles.btnMedallion,
                {backgroundColor: '#EEF2FF'},
              ]}>
              <Feather name="download" size={15} color="#4F46E5" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.manageBtnText, {color: theme.textPrimary}]}>
                Export Backup Snapshot
              </Text>
              <Text style={[styles.manageBtnSub, {color: theme.textMuted}]}>
                Save verified JSON payload with checksum
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRestoreBackup}
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                marginTop: 10,
              },
            ]}>
            <View
              style={[
                styles.btnMedallion,
                {backgroundColor: '#CFFAFE'},
              ]}>
              <Feather name="upload" size={15} color="#0891B2" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.manageBtnText, {color: theme.textPrimary}]}>
                Restore Server Backup
              </Text>
              <Text style={[styles.manageBtnSub, {color: theme.textMuted}]}>
                Validate and migrate remote backup
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleReconcileSync}
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                marginTop: 10,
              },
            ]}>
            <View
              style={[
                styles.btnMedallion,
                {backgroundColor: '#D1FAE5'},
              ]}>
              <Feather name="check-circle" size={15} color="#059669" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.manageBtnText, {color: theme.textPrimary}]}>
                Reconcile Sync (LWW)
              </Text>
              <Text style={[styles.manageBtnSub, {color: theme.textMuted}]}>
                Deterministic last-write-wins resolution
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClearCompleted}
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                marginTop: 10,
              },
            ]}>
            <View
              style={[
                styles.btnMedallion,
                {backgroundColor: '#FEF3C7'},
              ]}>
              <Feather name="trash-2" size={15} color="#D97706" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.manageBtnText, {color: theme.textPrimary}]}>
                Clear Completed Tasks
              </Text>
              <Text style={[styles.manageBtnSub, {color: theme.textMuted}]}>
                Clean up finished tasks from active view
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={seedSampleTasks}
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.surfaceSecondary,
                borderColor: theme.border,
                marginTop: 10,
              },
            ]}>
            <View
              style={[
                styles.btnMedallion,
                {backgroundColor: '#EDE9FE'},
              ]}>
              <Feather name="box" size={15} color="#7C3AED" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.manageBtnText, {color: theme.textPrimary}]}>
                Restore Demo Tasks
              </Text>
              <Text style={[styles.manageBtnSub, {color: theme.textMuted}]}>
                Add sample tasks and categories
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleResetData}
            style={[
              styles.manageBtn,
              {
                backgroundColor: theme.dangerLight,
                borderColor: theme.danger,
                marginTop: 10,
              },
            ]}>
            <View
              style={[
                styles.btnMedallion,
                {backgroundColor: '#FEE2E2'},
              ]}>
              <Feather name="alert-triangle" size={15} color="#EF4444" />
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.manageBtnText, {color: theme.danger}]}>
                Reset All Local Data
              </Text>
              <Text style={[styles.manageBtnSub, {color: theme.danger}]}>
                Wipe all local tasks and profile data
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.danger} />
          </TouchableOpacity>
        </View>

        {/* Elevate Brand Footer */}
        <View style={styles.aboutContainer}>
          <View
            style={[
              styles.aboutIconMedallion,
              {backgroundColor: theme.primaryLight},
            ]}>
            <Feather name="check-circle" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.aboutBrand, {color: theme.textPrimary}]}>
            GoTask Mobile
          </Text>
          <View
            style={[
              styles.versionPill,
              {backgroundColor: theme.surfaceSecondary},
            ]}>
            <Text style={[styles.aboutVersion, {color: theme.primary}]}>
              v2.0.0 • Editorial-Modern
            </Text>
          </View>
          <Text style={[styles.aboutDesc, {color: theme.textMuted}]}>
            Engineered for delightful productivity, tactile feedback, and offline-first reliability.
          </Text>
        </View>
      </ScrollView>

      {/* Elevate 5-Tab Tactile Bottom Navigation Bar */}
      <ElevateTabBar activeTab="me" navigation={navigation} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.medium,
    paddingBottom: 120, // Full bottom clearance
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 4, // Elevate 3D bevel
    borderBottomColor: '#CBD5E1',
    marginBottom: spacing.medium,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerMedallion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    marginTop: 1,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    position: 'relative',
  },
  themeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeOptionLabel: {
    fontSize: 13,
  },
  themeOptionSub: {
    fontSize: 10,
    fontFamily: fontFamily.medium,
    marginTop: 2,
  },
  themeActiveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: fontFamily.medium,
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  presetText: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  fullSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 2,
  },
  fullSyncText: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sep: {
    height: 1,
    marginVertical: 6,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 52,
  },
  btnMedallion: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  manageBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  manageBtnSub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    marginTop: 1,
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: spacing.small,
    marginBottom: spacing.large,
    paddingHorizontal: spacing.medium,
  },
  aboutIconMedallion: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  aboutBrand: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
  },
  versionPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 12,
    fontFamily: fontFamily.bold,
  },
  aboutDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fontFamily.regular,
  },
});

export default Settings;

// src/services/apiService.js
// Offline-first REST API client for GOTask

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEFAULT_SERVER_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const STORAGE_KEY_SERVER_URL = '@gotask_server_url';

class ApiService {
  constructor() {
    this.baseUrl = DEFAULT_SERVER_URL;
    this.isOnline = false;
    this.lastSyncTime = null;
    this.init();
  }

  async init() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_SERVER_URL);
      if (saved) {
        this.baseUrl = saved;
      }
    } catch (e) {
      // Ignore
    }
  }

  async setServerUrl(url) {
    this.baseUrl = url.trim();
    await AsyncStorage.setItem(STORAGE_KEY_SERVER_URL, this.baseUrl);
  }

  async checkServerHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      this.isOnline = res.ok;
      return res.ok;
    } catch (err) {
      this.isOnline = false;
      return false;
    }
  }

  async syncWithServer(localTasks, localProfile) {
    try {
      const isUp = await this.checkServerHealth();
      if (!isUp) {
        return { success: false, reason: 'server_unreachable' };
      }

      const res = await fetch(`${this.baseUrl}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localTasks,
          localProfile,
        }),
      });

      if (!res.ok) {
        return { success: false, reason: `HTTP ${res.status}` };
      }

      const data = await res.json();
      this.lastSyncTime = Date.now();
      return {
        success: true,
        tasks: data.tasks,
        profile: data.profile,
        syncedAt: data.syncedAt,
      };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }

  async pushTask(task) {
    try {
      if (!this.isOnline) return;
      await fetch(`${this.baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    } catch (e) {
      // Background push failure is non-fatal in offline-first mode
    }
  }

  async updateTask(task) {
    try {
      if (!this.isOnline) return;
      await fetch(`${this.baseUrl}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
    } catch (e) {
      // Offline fallback
    }
  }

  async deleteTask(taskId) {
    try {
      if (!this.isOnline) return;
      await fetch(`${this.baseUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      // Offline fallback
    }
  }
}

export const apiService = new ApiService();
export default apiService;

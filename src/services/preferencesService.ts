import axios from "axios";
import {
  UserPreferences,
  PreferencesResponse,
  ThemeUpdateRequest,
  NotificationSettingsRequest,
  DashboardLayoutRequest,
  PreferencesUpdateRequest,
} from "@/types/preferences";

class PreferencesService {
  private baseURL = "/api/preferences";

  // Get current user preferences
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await axios.get<PreferencesResponse>(this.baseURL);

    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to fetch preferences");
  }

  // Update multiple preferences at once
  async updatePreferences(
    preferences: PreferencesUpdateRequest
  ): Promise<UserPreferences> {
    const response = await axios.put<PreferencesResponse>(
      this.baseURL,
      preferences
    );

    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to update preferences");
  }

  // Update theme specifically
  async updateTheme(theme: "light" | "dark" | "system"): Promise<string> {
    const response = await axios.put<PreferencesResponse>(
      `${this.baseURL}/theme`,
      { theme }
    );

    if (response.data.status === "success") {
      return theme;
    }

    throw new Error(response.data.message || "Failed to update theme");
  }

  // Update dashboard layout
  async updateDashboardLayout(layout: any[]): Promise<any[]> {
    const response = await axios.put<PreferencesResponse>(
      `${this.baseURL}/dashboard-layout`,
      { layout }
    );

    if (response.data.status === "success" && response.data.data) {
      return response.data.data.dashboard_layout || [];
    }

    throw new Error(
      response.data.message || "Failed to update dashboard layout"
    );
  }

  // Update notification settings
  async updateNotificationSettings(settings: number): Promise<number> {
    const response = await axios.put<PreferencesResponse>(
      `${this.baseURL}/notifications`,
      { settings }
    );

    if (response.data.status === "success" && response.data.data) {
      return response.data.data.notification_settings;
    }

    throw new Error(
      response.data.message || "Failed to update notification settings"
    );
  }

  // Reset preferences to defaults
  async resetToDefaults(): Promise<UserPreferences> {
    const response = await axios.post<PreferencesResponse>(
      `${this.baseURL}/reset`
    );

    if (response.data.status === "success" && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || "Failed to reset preferences");
  }

  // Helper method to check if a notification type is enabled
  isNotificationEnabled(settings: number, notificationType: number): boolean {
    return (settings & notificationType) === notificationType;
  }

  // Helper method to enable a specific notification type
  enableNotification(
    currentSettings: number,
    notificationType: number
  ): number {
    return currentSettings | notificationType;
  }

  // Helper method to disable a specific notification type
  disableNotification(
    currentSettings: number,
    notificationType: number
  ): number {
    return currentSettings & ~notificationType;
  }

  // Toggle a specific notification type
  toggleNotification(
    currentSettings: number,
    notificationType: number
  ): number {
    if (this.isNotificationEnabled(currentSettings, notificationType)) {
      return this.disableNotification(currentSettings, notificationType);
    } else {
      return this.enableNotification(currentSettings, notificationType);
    }
  }
}

export default new PreferencesService();

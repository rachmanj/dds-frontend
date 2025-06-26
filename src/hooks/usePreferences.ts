import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import preferencesService from "@/services/preferencesService";
import {
  UserPreferences,
  PreferencesUpdateRequest,
  NotificationTypes,
} from "@/types/preferences";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const userPrefs = await preferencesService.getUserPreferences();
      setPreferences(userPrefs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load preferences"
      );
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: PreferencesUpdateRequest) => {
    try {
      setError(null);
      const updatedPrefs = await preferencesService.updatePreferences(updates);
      setPreferences(updatedPrefs);
      return updatedPrefs;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update preferences"
      );
      throw err;
    }
  };

  const resetToDefaults = async () => {
    try {
      setError(null);
      const defaultPrefs = await preferencesService.resetToDefaults();
      setPreferences(defaultPrefs);
      return defaultPrefs;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reset preferences"
      );
      throw err;
    }
  };

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    updatePreferences,
    resetToDefaults,
  };
};

export const useThemeManager = () => {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTheme = async (newTheme: "light" | "dark" | "system") => {
    try {
      setLoading(true);
      setError(null);

      // Update theme locally first for immediate response
      setTheme(newTheme);

      // Update theme on server
      await preferencesService.updateTheme(newTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update theme");
      // Revert local change on error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    theme,
    updateTheme,
    loading,
    error,
  };
};

export const useNotificationSettings = () => {
  const { preferences, updatePreferences } = usePreferences();
  const [updating, setUpdating] = useState(false);

  const isNotificationEnabled = (notificationType: number): boolean => {
    if (!preferences) return false;
    return preferencesService.isNotificationEnabled(
      preferences.notification_settings,
      notificationType
    );
  };

  const toggleNotification = async (notificationType: number) => {
    if (!preferences) return;

    try {
      setUpdating(true);
      const newSettings = preferencesService.toggleNotification(
        preferences.notification_settings,
        notificationType
      );

      await updatePreferences({ notification_settings: newSettings });
    } catch (err) {
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const updateNotificationSettings = async (settings: number) => {
    try {
      setUpdating(true);
      await updatePreferences({ notification_settings: settings });
    } catch (err) {
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const toggleEmailNotifications = async () => {
    if (!preferences) return;
    await updatePreferences({
      email_notifications: !preferences.email_notifications,
    });
  };

  const togglePushNotifications = async () => {
    if (!preferences) return;
    await updatePreferences({
      push_notifications: !preferences.push_notifications,
    });
  };

  return {
    preferences,
    isNotificationEnabled,
    toggleNotification,
    updateNotificationSettings,
    toggleEmailNotifications,
    togglePushNotifications,
    updating,
    // Helper functions for specific notification types
    isDistributionCreatedEnabled: () =>
      isNotificationEnabled(NotificationTypes.DISTRIBUTION_CREATED),
    isDistributionVerifiedEnabled: () =>
      isNotificationEnabled(NotificationTypes.DISTRIBUTION_VERIFIED),
    isDistributionReceivedEnabled: () =>
      isNotificationEnabled(NotificationTypes.DISTRIBUTION_RECEIVED),
    toggleDistributionCreated: () =>
      toggleNotification(NotificationTypes.DISTRIBUTION_CREATED),
    toggleDistributionVerified: () =>
      toggleNotification(NotificationTypes.DISTRIBUTION_VERIFIED),
    toggleDistributionReceived: () =>
      toggleNotification(NotificationTypes.DISTRIBUTION_RECEIVED),
  };
};

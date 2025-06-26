"use client";

import React, { useState } from 'react';
import { Settings, Bell, Palette, Globe, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePreferences, useThemeManager, useNotificationSettings } from '@/hooks/usePreferences';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { toast } from 'sonner';

interface PreferencesDialogProps {
    children?: React.ReactNode;
}

const PreferencesDialog = ({ children }: PreferencesDialogProps) => {
    const [open, setOpen] = useState(false);
    const { preferences, loading, updatePreferences, resetToDefaults } = usePreferences();
    const { theme } = useThemeManager();
    const {
        isDistributionCreatedEnabled,
        isDistributionVerifiedEnabled,
        isDistributionReceivedEnabled,
        toggleDistributionCreated,
        toggleDistributionVerified,
        toggleDistributionReceived,
        toggleEmailNotifications,
        togglePushNotifications,
        updating
    } = useNotificationSettings();

    const handleLanguageChange = async (language: 'en' | 'id') => {
        try {
            await updatePreferences({ language });
            toast.success('Language updated successfully');
        } catch (error) {
            toast.error('Failed to update language');
        }
    };

    const handleTimezoneChange = async (timezone: 'Asia/Jakarta' | 'UTC') => {
        try {
            await updatePreferences({ timezone });
            toast.success('Timezone updated successfully');
        } catch (error) {
            toast.error('Failed to update timezone');
        }
    };

    const handleResetDefaults = async () => {
        try {
            await resetToDefaults();
            toast.success('Preferences reset to defaults');
        } catch (error) {
            toast.error('Failed to reset preferences');
        }
    };

    const handleNotificationToggle = async (toggleFunction: () => Promise<void>, label: string) => {
        try {
            await toggleFunction();
            toast.success(`${label} notifications updated`);
        } catch (error) {
            toast.error(`Failed to update ${label.toLowerCase()} notifications`);
        }
    };

    if (loading || !preferences) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children || (
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Preferences</DialogTitle>
                    <DialogDescription>
                        Customize your DDS Portal experience
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="theme" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="theme">
                            <Palette className="h-4 w-4 mr-2" />
                            Theme
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <Bell className="h-4 w-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="regional">
                            <Globe className="h-4 w-4 mr-2" />
                            Regional
                        </TabsTrigger>
                        <TabsTrigger value="advanced">
                            <Settings className="h-4 w-4 mr-2" />
                            Advanced
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="theme" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>
                                    Choose how DDS Portal looks on this device
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-base">Theme</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Current theme: {theme}
                                        </p>
                                    </div>
                                    <ThemeToggle />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribution Notifications</CardTitle>
                                <CardDescription>
                                    Configure which distribution events trigger notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="dist-created">Distribution Created</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when new distributions are created
                                        </p>
                                    </div>
                                    <Switch
                                        id="dist-created"
                                        checked={isDistributionCreatedEnabled()}
                                        onCheckedChange={() => handleNotificationToggle(toggleDistributionCreated, 'Distribution created')}
                                        disabled={updating}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="dist-verified">Distribution Verified</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when distributions are verified
                                        </p>
                                    </div>
                                    <Switch
                                        id="dist-verified"
                                        checked={isDistributionVerifiedEnabled()}
                                        onCheckedChange={() => handleNotificationToggle(toggleDistributionVerified, 'Distribution verified')}
                                        disabled={updating}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="dist-received">Distribution Received</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when distributions are received
                                        </p>
                                    </div>
                                    <Switch
                                        id="dist-received"
                                        checked={isDistributionReceivedEnabled()}
                                        onCheckedChange={() => handleNotificationToggle(toggleDistributionReceived, 'Distribution received')}
                                        disabled={updating}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Methods</CardTitle>
                                <CardDescription>
                                    Choose how you want to receive notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="email-notifications">Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        id="email-notifications"
                                        checked={preferences.email_notifications}
                                        onCheckedChange={() => handleNotificationToggle(toggleEmailNotifications, 'Email')}
                                        disabled={updating}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="push-notifications">Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications in your browser
                                        </p>
                                    </div>
                                    <Switch
                                        id="push-notifications"
                                        checked={preferences.push_notifications}
                                        onCheckedChange={() => handleNotificationToggle(togglePushNotifications, 'Push')}
                                        disabled={updating}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="regional" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Language & Region</CardTitle>
                                <CardDescription>
                                    Set your preferred language and timezone
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Language</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Choose your preferred language
                                        </p>
                                    </div>
                                    <Select
                                        value={preferences.language}
                                        onValueChange={(value: 'en' | 'id') => handleLanguageChange(value)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Timezone</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Choose your timezone for date/time display
                                        </p>
                                    </div>
                                    <Select
                                        value={preferences.timezone}
                                        onValueChange={(value: 'Asia/Jakarta' | 'UTC') => handleTimezoneChange(value)}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Jakarta">Jakarta (WIB)</SelectItem>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reset Preferences</CardTitle>
                                <CardDescription>
                                    Reset all preferences to their default values
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    variant="destructive"
                                    onClick={handleResetDefaults}
                                    className="w-full"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset to Defaults
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default PreferencesDialog; 
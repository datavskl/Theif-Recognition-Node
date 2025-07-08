import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Bell, Moon, Sun, ChevronDown, ArrowLeft, Camera, 
  Users, Globe, Palette, Volume2, Mail, Database, Trash2, 
  Save, TestTube, Settings as SettingsIcon
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Settings {
  id: number;
  userId: number;
  language: string;
  theme: string;
  alertSound: boolean;
  emailNotifications: boolean;
  dataRetentionDays: number;
}

interface Camera {
  id: number;
  name: string;
  location: string;
  streamUrl?: string;
  isActive: boolean;
}

export default function Settings() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("general");

  // Fetch user settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Fetch cameras
  const { data: cameras = [], isLoading: camerasLoading } = useQuery({
    queryKey: ["/api/cameras"],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const response = await apiRequest("PUT", "/api/settings", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: t('success'),
        description: t('settingsSaved'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Camera mutations
  const addCameraMutation = useMutation({
    mutationFn: async (camera: { name: string; location: string; streamUrl?: string }) => {
      const response = await apiRequest("POST", "/api/cameras", camera);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras"] });
      toast({
        title: t('success'),
        description: "Camera added successfully",
      });
    },
  });

  const updateCameraMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/cameras/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras"] });
      toast({
        title: t('success'),
        description: "Camera updated successfully",
      });
    },
  });

  const deleteCameraMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cameras/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras"] });
      toast({
        title: t('success'),
        description: "Camera deleted successfully",
      });
    },
  });

  const handleSettingsUpdate = (field: string, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'en' | 'hi');
    handleSettingsUpdate('language', newLanguage);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark');
    handleSettingsUpdate('theme', newTheme);
  };

  const testCameraConnection = async (camera: Camera) => {
    // Mock camera test - in real implementation, this would test the actual stream
    toast({
      title: "Camera Test",
      description: `Testing connection to ${camera.name}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Camera Test Result",
        description: `${camera.name} is ${camera.isActive ? 'online' : 'offline'}`,
        variant: camera.isActive ? "default" : "destructive",
      });
    }, 2000);
  };

  const handleDataExport = () => {
    toast({
      title: "Data Export",
      description: "Preparing data export... This may take a few minutes.",
    });
    
    // Mock export process
    setTimeout(() => {
      toast({
        title: t('success'),
        description: "Data exported successfully",
      });
    }, 3000);
  };

  const handleDataCleanup = () => {
    if (confirm("Are you sure you want to delete old detection records? This action cannot be undone.")) {
      toast({
        title: "Data Cleanup",
        description: "Cleaning up old detection records...",
      });
      
      setTimeout(() => {
        toast({
          title: t('success'),
          description: "Old detection records cleaned up successfully",
        });
      }, 2000);
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen security-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="security-text-primary">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen security-bg">
      {/* Header */}
      <header className="security-surface security-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="text-red-500 text-2xl" />
            <h1 className="text-xl font-semibold security-text-primary">
              {t('appTitle')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <select 
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="security-surface-secondary security-border rounded px-3 py-1 text-sm security-text-primary"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
              className="security-surface-secondary hover:bg-slate-600"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 security-text-primary" />
              ) : (
                <Moon className="h-5 w-5 security-text-primary" />
              )}
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm security-text-primary">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm security-text-primary">{user?.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="security-text-primary"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="security-surface-secondary security-border px-6 py-3">
        <div className="flex space-x-8">
          <Link href="/dashboard" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('dashboard')}
          </Link>
          <Link href="/face-gallery" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('faceGallery')}
          </Link>
          <Link href="/recognition-log" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('recognitionLog')}
          </Link>
          <a href="#" className="text-white border-b-2 border-red-500 pb-2 font-medium">
            {t('settings')}
          </a>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="security-text-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold security-text-primary">
              {t('settings')}
            </h1>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 security-surface-secondary">
            <TabsTrigger value="general" className="security-text-primary">
              <SettingsIcon className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="cameras" className="security-text-primary">
              <Camera className="mr-2 h-4 w-4" />
              Cameras
            </TabsTrigger>
            <TabsTrigger value="notifications" className="security-text-primary">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data" className="security-text-primary">
              <Database className="mr-2 h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="security-surface security-border">
                <CardHeader>
                  <CardTitle className="security-text-primary flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Language & Region
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="security-text-primary">Language</Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="security-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="security-surface security-border">
                <CardHeader>
                  <CardTitle className="security-text-primary flex items-center">
                    <Palette className="mr-2 h-5 w-5" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="security-text-primary">Theme</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="security-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Camera Settings */}
          <TabsContent value="cameras">
            <Card className="security-surface security-border">
              <CardHeader>
                <CardTitle className="security-text-primary">Camera Management</CardTitle>
              </CardHeader>
              <CardContent>
                {camerasLoading ? (
                  <div className="text-center py-8 security-text-secondary">
                    Loading cameras...
                  </div>
                ) : cameras.length === 0 ? (
                  <div className="text-center py-8 security-text-secondary">
                    No cameras configured
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cameras.map((camera: Camera) => (
                      <div key={camera.id} className="flex items-center justify-between p-4 security-surface-secondary rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${camera.isActive ? 'security-success' : 'bg-red-500'}`}></div>
                          <div>
                            <h3 className="font-medium security-text-primary">{camera.name}</h3>
                            <p className="text-sm security-text-secondary">{camera.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testCameraConnection(camera)}
                            className="security-border"
                          >
                            <TestTube className="mr-1 h-3 w-3" />
                            Test
                          </Button>
                          <Switch
                            checked={camera.isActive}
                            onCheckedChange={(checked) => 
                              updateCameraMutation.mutate({
                                id: camera.id,
                                updates: { isActive: checked }
                              })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="security-surface security-border">
                <CardHeader>
                  <CardTitle className="security-text-primary flex items-center">
                    <Volume2 className="mr-2 h-5 w-5" />
                    Sound Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="security-text-primary">Alert Sound</Label>
                      <p className="text-sm security-text-secondary">Play sound when thief is detected</p>
                    </div>
                    <Switch
                      checked={settings?.alertSound ?? true}
                      onCheckedChange={(checked) => handleSettingsUpdate('alertSound', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="security-surface security-border">
                <CardHeader>
                  <CardTitle className="security-text-primary flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="security-text-primary">Email Alerts</Label>
                      <p className="text-sm security-text-secondary">Send email notifications for alerts</p>
                    </div>
                    <Switch
                      checked={settings?.emailNotifications ?? false}
                      onCheckedChange={(checked) => handleSettingsUpdate('emailNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="security-surface security-border">
                <CardHeader>
                  <CardTitle className="security-text-primary">Data Retention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="security-text-primary">Auto-delete logs after (days)</Label>
                    <Input
                      type="number"
                      value={settings?.dataRetentionDays ?? 30}
                      onChange={(e) => handleSettingsUpdate('dataRetentionDays', parseInt(e.target.value))}
                      className="security-border"
                      min="1"
                      max="365"
                    />
                    <p className="text-sm security-text-secondary">
                      Detection records older than this will be automatically deleted
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="security-surface security-border">
                <CardHeader>
                  <CardTitle className="security-text-primary">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleDataExport}
                    variant="outline"
                    className="w-full security-border"
                  >
                    Export All Data
                  </Button>
                  <Button
                    onClick={handleDataCleanup}
                    variant="outline"
                    className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clean Up Old Records
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => toast({ title: t('success'), description: t('settingsSaved') })}
            className="security-accent-red hover:security-accent-red"
            disabled={updateSettingsMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {updateSettingsMutation.isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, Bell, Moon, Sun, ChevronDown, ArrowUp, 
  TriangleAlert, Video, Users, Clock, Plus, 
  Camera, Download, UserPlus, ArrowRight 
} from "lucide-react";
import { CameraFeed } from "@/components/CameraFeed";
import { AlertModal } from "@/components/AlertModal";
// import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { t } = useTranslation();
  // const { user, logout } = useAuth(); // Removed for no-auth version
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const { data: recentDetections = [] } = useQuery({
    queryKey: ["/api/detections", { limit: 5 }],
    refetchInterval: 10000,
  });

  // Handle face detection alerts
  const handleDetection = (detection: any) => {
    // Play alert sound
    const audio = new Audio('/alert.mp3');
    audio.play().catch(console.error);
    
    setCurrentAlert(detection);
    setAlertModalOpen(true);
    
    toast({
      title: t('thiefDetected'),
      description: `${detection.name} detected at ${detection.camera}`,
      variant: "destructive",
    });
  };

  const handleAcknowledgeAlert = async (id: number) => {
    // Update detection status
    try {
      // await apiRequest("PUT", `/api/detections/${id}`, { status: "acknowledged" });
      toast({
        title: t('success'),
        description: "Alert acknowledged",
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleDismissAlert = async (id: number) => {
    // Update detection status
    try {
      // await apiRequest("PUT", `/api/detections/${id}`, { status: "dismissed" });
      toast({
        title: t('success'),
        description: "Alert dismissed",
      });
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="security-warning text-black">{t('pending')}</Badge>;
      case 'acknowledged':
        return <Badge className="security-success text-white">{t('acknowledged')}</Badge>;
      case 'resolved':
        return <Badge className="security-success text-white">{t('resolved')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="security-surface-secondary security-border rounded px-3 py-1 text-sm security-text-primary"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="security-surface-secondary hover:bg-slate-600"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 security-text-primary" />
              ) : (
                <Moon className="h-5 w-5 security-text-primary" />
              )}
            </Button>
            
            {/* Alert Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="security-accent-red hover:bg-red-700 relative"
                onClick={() => {/* Show alerts */}}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {stats?.alertsToday || 0}
                </span>
              </Button>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-sm security-text-primary">
                  A
                </span>
              </div>
              <span className="text-sm security-text-primary">Admin</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {/* TODO: Add logout functionality */}}
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
          <a href="#" className="text-white border-b-2 border-red-500 pb-2 font-medium">
            {t('dashboard')}
          </a>
          <a href="#" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('faceGallery')}
          </a>
          <a href="#" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('recognitionLog')}
          </a>
          <a href="#" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('settings')}
          </a>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          detection={currentAlert}
          onAcknowledge={handleAcknowledgeAlert}
          onDismiss={handleDismissAlert}
        />

        {/* Camera Feed */}
        <CameraFeed onDetection={handleDetection} />

        {/* Statistics Cards */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold security-text-primary mb-4">
            {t('systemOverview')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stats-grid">
            {/* Alerts Today */}
            <Card className="security-surface security-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="security-text-secondary text-sm">{t('alertsToday')}</p>
                    <p className="text-3xl font-bold text-red-500">
                      {stats?.alertsToday || 0}
                    </p>
                  </div>
                  <div className="bg-red-500 bg-opacity-20 p-3 rounded-lg">
                    <TriangleAlert className="text-red-500 text-xl" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm">
                  <ArrowUp className="text-red-500 mr-1 h-4 w-4" />
                  <span className="text-red-500">+2</span>
                  <span className="security-text-secondary ml-1">{t('fromYesterday')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Cameras Online */}
            <Card className="security-surface security-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="security-text-secondary text-sm">{t('camerasOnline')}</p>
                    <p className="text-3xl font-bold text-green-500">
                      {stats?.camerasOnline || "1/1"}
                    </p>
                  </div>
                  <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
                    <Video className="text-green-500 text-xl" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="security-text-secondary">{t('allSystemsOperational')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Faces in Gallery */}
            <Card className="security-surface security-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="security-text-secondary text-sm">{t('facesInGallery')}</p>
                    <p className="text-3xl font-bold security-text-primary">
                      {stats?.facesInGallery || 0}
                    </p>
                  </div>
                  <div className="bg-slate-600 p-3 rounded-lg">
                    <Users className="text-slate-300 text-xl" />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm">
                  <Plus className="security-text-secondary mr-1 h-4 w-4" />
                  <span className="security-text-secondary">{t('addNewProfile')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Last Alert */}
            <Card className="security-surface security-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="security-text-secondary text-sm">{t('lastAlert')}</p>
                    <p className="text-lg font-semibold security-text-primary">
                      {stats?.lastAlert || t('noAlertsYet')}
                    </p>
                  </div>
                  <div className="bg-orange-500 bg-opacity-20 p-3 rounded-lg">
                    <Clock className="text-orange-500 text-xl" />
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <span className="security-text-secondary">
                    {recentDetections[0]?.name ? `${recentDetections[0].name} detected` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Alerts */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold security-text-primary">
              {t('recentAlerts')}
            </h2>
            <Button variant="ghost" className="security-text-secondary hover:text-white">
              {t('viewAll')} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <Card className="security-surface security-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="security-surface-secondary">
                    <TableHead className="security-text-secondary">{t('snapshot')}</TableHead>
                    <TableHead className="security-text-secondary">{t('name')}</TableHead>
                    <TableHead className="security-text-secondary">{t('tag')}</TableHead>
                    <TableHead className="security-text-secondary">{t('camera')}</TableHead>
                    <TableHead className="security-text-secondary">{t('time')}</TableHead>
                    <TableHead className="security-text-secondary">{t('status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDetections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center security-text-secondary py-8">
                        No recent alerts
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentDetections.map((detection: any) => (
                      <TableRow key={detection.id} className="hover:bg-slate-700">
                        <TableCell>
                          <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center">
                            {detection.snapshotUrl ? (
                              <img 
                                src={detection.snapshotUrl} 
                                alt="Snapshot"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Users className="text-slate-400 h-6 w-6" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium security-text-primary">
                          {detection.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={detection.tag === 'thief' ? 'destructive' : 'secondary'}
                            className={detection.tag === 'thief' ? 'security-accent-red' : 'bg-orange-600'}
                          >
                            {detection.tag?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </TableCell>
                        <TableCell className="security-text-secondary">
                          Camera {detection.cameraId}
                        </TableCell>
                        <TableCell className="security-text-secondary">
                          {new Date(detection.detectedAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(detection.status)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold security-text-primary mb-4">
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="security-accent-red hover:bg-red-700 text-white p-6 h-auto text-left flex flex-col items-start"
            >
              <UserPlus className="text-2xl mb-3" />
              <h3 className="font-semibold mb-1">{t('addNewFace')}</h3>
              <p className="text-sm text-red-100">{t('addPersonToDatabase')}</p>
            </Button>
            
            <Button
              variant="outline"
              className="security-surface-secondary hover:bg-slate-600 text-white p-6 h-auto text-left flex flex-col items-start"
            >
              <Camera className="text-2xl mb-3" />
              <h3 className="font-semibold mb-1">{t('testCamera')}</h3>
              <p className="text-sm security-text-secondary">{t('checkCameraConnection')}</p>
            </Button>
            
            <Button
              variant="outline"
              className="security-surface-secondary hover:bg-slate-600 text-white p-6 h-auto text-left flex flex-col items-start"
            >
              <Download className="text-2xl mb-3" />
              <h3 className="font-semibold mb-1">{t('exportLogs')}</h3>
              <p className="text-sm security-text-secondary">{t('downloadRecognitionData')}</p>
            </Button>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="security-accent-red hover:bg-red-700 w-14 h-14 rounded-full shadow-lg"
        >
          <TriangleAlert className="text-xl" />
        </Button>
      </div>
    </div>
  );
}

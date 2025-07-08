import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, Bell, Moon, Sun, ChevronDown, Search, Download, 
  Filter, Eye, Edit, FileText, Calendar, Clock, Camera,
  User, ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Detection {
  id: number;
  faceId?: number;
  cameraId: number;
  snapshotUrl: string;
  confidence: number;
  status: string;
  notes?: string;
  detectedAt: string;
  face?: {
    name: string;
    tag: string;
  };
}

export default function RecognitionLog() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notes, setNotes] = useState("");

  // Fetch detections with filters
  const { data: detections = [], isLoading } = useQuery({
    queryKey: ["/api/detections", { search: searchQuery, status: statusFilter }],
    queryFn: async () => {
      let url = "/api/detections";
      const params = new URLSearchParams();
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch faces for name resolution
  const { data: faces = [] } = useQuery({
    queryKey: ["/api/faces"],
  });

  // Update detection mutation
  const updateDetectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/detections/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/detections"] });
      toast({
        title: t('success'),
        description: "Detection updated successfully",
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

  const handleViewDetails = (detection: Detection) => {
    const face = faces.find((f: any) => f.id === detection.faceId);
    setSelectedDetection({
      ...detection,
      face: face ? { name: face.name, tag: face.tag } : undefined,
    });
    setNotes(detection.notes || "");
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateDetectionMutation.mutate({
      id,
      updates: { status },
    });
  };

  const handleSaveNotes = () => {
    if (selectedDetection) {
      updateDetectionMutation.mutate({
        id: selectedDetection.id,
        updates: { notes },
      });
      setIsDetailModalOpen(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = detections.map((detection: Detection) => {
      const face = faces.find((f: any) => f.id === detection.faceId);
      return {
        id: detection.id,
        name: face?.name || "Unknown",
        tag: face?.tag || "Unknown",
        camera: `Camera ${detection.cameraId}`,
        confidence: `${detection.confidence}%`,
        status: detection.status,
        detectedAt: new Date(detection.detectedAt).toLocaleString(),
        notes: detection.notes || "",
      };
    });

    const csvHeaders = [
      "ID", "Name", "Tag", "Camera", "Confidence", "Status", "Detected At", "Notes"
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recognition-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: t('success'),
      description: "Log exported successfully",
    });
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

  const filteredDetections = detections.filter((detection: Detection) => {
    const face = faces.find((f: any) => f.id === detection.faceId);
    const name = face?.name || "Unknown";
    const matchesSearch = searchQuery === "" || 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      face?.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
          <a href="#" className="text-white border-b-2 border-red-500 pb-2 font-medium">
            {t('recognitionLog')}
          </a>
          <Link href="/settings" className="security-text-secondary hover:text-white pb-2 transition-colors">
            {t('settings')}
          </Link>
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
              {t('recognitionLog')}
            </h1>
          </div>
          
          <Button
            onClick={handleExportCSV}
            className="security-surface-secondary hover:bg-slate-600 text-white"
            disabled={detections.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('exportLogs')}
          </Button>
        </div>

        {/* Filters */}
        <Card className="security-surface security-border mb-6">
          <CardHeader>
            <CardTitle className="security-text-primary flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="security-text-primary">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 security-border"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="security-text-primary">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="security-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="security-border"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detections Table */}
        <Card className="security-surface security-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 security-text-secondary">
                {t('loading')}
              </div>
            ) : filteredDetections.length === 0 ? (
              <div className="text-center py-12 security-text-secondary">
                No detection records found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="security-surface-secondary">
                    <TableHead className="security-text-secondary">Snapshot</TableHead>
                    <TableHead className="security-text-secondary">Name</TableHead>
                    <TableHead className="security-text-secondary">Tag</TableHead>
                    <TableHead className="security-text-secondary">Camera</TableHead>
                    <TableHead className="security-text-secondary">Confidence</TableHead>
                    <TableHead className="security-text-secondary">Detected At</TableHead>
                    <TableHead className="security-text-secondary">Status</TableHead>
                    <TableHead className="security-text-secondary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetections.map((detection: Detection) => {
                    const face = faces.find((f: any) => f.id === detection.faceId);
                    return (
                      <TableRow key={detection.id} className="hover:bg-slate-700">
                        <TableCell>
                          <div className="w-12 h-12 bg-slate-600 rounded flex items-center justify-center overflow-hidden">
                            {detection.snapshotUrl ? (
                              <img 
                                src={detection.snapshotUrl} 
                                alt="Snapshot"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera className="text-slate-400 h-6 w-6" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium security-text-primary">
                          {face?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {face ? (
                            <Badge 
                              variant={face.tag === 'thief' ? 'destructive' : 'secondary'}
                              className={face.tag === 'thief' ? 'security-accent-red' : 'bg-orange-600'}
                            >
                              {face.tag.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">UNKNOWN</Badge>
                          )}
                        </TableCell>
                        <TableCell className="security-text-secondary">
                          Camera {detection.cameraId}
                        </TableCell>
                        <TableCell className="security-text-secondary">
                          {detection.confidence}%
                        </TableCell>
                        <TableCell className="security-text-secondary">
                          {new Date(detection.detectedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(detection.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(detection)}
                              className="security-text-secondary hover:text-white"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {detection.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdateStatus(detection.id, 'acknowledged')}
                                className="text-green-500 hover:text-green-400"
                              >
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-md security-surface security-border">
            <DialogHeader>
              <DialogTitle className="security-text-primary">
                Detection Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedDetection && (
              <div className="space-y-4">
                {/* Snapshot */}
                <div className="w-full h-48 bg-slate-700 rounded flex items-center justify-center overflow-hidden">
                  {selectedDetection.snapshotUrl ? (
                    <img 
                      src={selectedDetection.snapshotUrl} 
                      alt="Detection Snapshot"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-400">No snapshot available</span>
                  )}
                </div>
                
                <div className="space-y-2 security-text-primary">
                  <p>
                    <strong>Name:</strong> {selectedDetection.face?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Tag:</strong>{' '}
                    {selectedDetection.face ? (
                      <Badge 
                        variant={selectedDetection.face.tag === 'thief' ? 'destructive' : 'secondary'}
                        className={selectedDetection.face.tag === 'thief' ? 'security-accent-red' : 'bg-orange-600'}
                      >
                        {selectedDetection.face.tag.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">UNKNOWN</Badge>
                    )}
                  </p>
                  <p>
                    <strong>Camera:</strong> Camera {selectedDetection.cameraId}
                  </p>
                  <p>
                    <strong>Confidence:</strong> {selectedDetection.confidence}%
                  </p>
                  <p>
                    <strong>Detected At:</strong> {new Date(selectedDetection.detectedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {getStatusBadge(selectedDetection.status)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="security-text-primary">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this detection..."
                    className="security-border"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveNotes}
                    className="flex-1 security-accent-red hover:security-accent-red"
                    disabled={updateDetectionMutation.isPending}
                  >
                    {updateDetectionMutation.isPending ? "Saving..." : "Save Notes"}
                  </Button>
                  <Button
                    onClick={() => setIsDetailModalOpen(false)}
                    variant="secondary"
                    className="flex-1 security-surface-secondary"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

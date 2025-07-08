import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Download, Filter, Eye, Clock, 
  CheckCircle, XCircle, AlertCircle, ArrowLeft 
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: detections = [], isLoading } = useQuery({
    queryKey: ["/api/detections"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await apiRequest(`/api/detections/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/detections"] });
      toast({
        title: "Success",
        description: "Detection status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update detection",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (detection: Detection) => {
    setSelectedDetection(detection);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = (id: number, status: string, notes?: string) => {
    updateStatusMutation.mutate({ id, status, notes });
  };

  const handleExportCSV = () => {
    const csvData = detections.map((detection: Detection) => {
      const { face } = detection;
      return {
        'Detection ID': detection.id,
        'Face ID': detection.faceId || 'Unknown',
        'Name': face?.name || 'Unknown',
        'Tag': face?.tag || 'N/A',
        'Camera ID': detection.cameraId,
        'Confidence': `${(detection.confidence * 100).toFixed(1)}%`,
        'Status': detection.status,
        'Detected At': format(new Date(detection.detectedAt), 'yyyy-MM-dd HH:mm:ss'),
        'Notes': detection.notes || ''
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recognition-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Detection log exported successfully",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acknowledged': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'investigating': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-red-500" />;
    }
  };

  const filteredDetections = detections.filter((detection: Detection) => {
    const matchesStatus = statusFilter === "all" || detection.status === statusFilter;
    const matchesSearch = !searchQuery || 
      detection.face?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      detection.face?.tag?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen security-bg">
      <Navigation />
      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="security-text-secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold security-text-primary">
              Recognition Log
            </h1>
          </div>
          
          <Button
            onClick={handleExportCSV}
            className="security-surface-secondary hover:bg-slate-600 text-white"
            disabled={detections.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Logs
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
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
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="security-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detections List */}
        {isLoading ? (
          <div className="text-center security-text-secondary">
            Loading detections...
          </div>
        ) : filteredDetections.length === 0 ? (
          <Card className="security-surface security-border">
            <CardContent className="text-center py-12">
              <p className="security-text-secondary">
                No detections found matching your criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDetections.map((detection: Detection) => {
              const { face } = detection;
              const detectedTime = format(new Date(detection.detectedAt), 'PPp');
              
              return (
                <Card key={detection.id} className="security-surface security-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={detection.snapshotUrl}
                            alt="Detection snapshot"
                            className="w-16 h-16 rounded object-cover"
                          />
                          <div className="absolute -top-1 -right-1">
                            {getStatusIcon(detection.status)}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold security-text-primary">
                              {face?.name || 'Unknown Person'}
                            </h3>
                            {face?.tag && (
                              <Badge 
                                variant="secondary"
                                className={face.tag === 'thief' ? 'security-accent-red' : 'bg-orange-600'}
                              >
                                {face.tag.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm security-text-secondary">
                            Camera {detection.cameraId} • {detectedTime}
                          </p>
                          <p className="text-sm security-text-secondary">
                            Confidence: {(detection.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline"
                          className={`
                            ${detection.status === 'acknowledged' ? 'border-green-500 text-green-500' : ''}
                            ${detection.status === 'dismissed' ? 'border-gray-500 text-gray-500' : ''}
                            ${detection.status === 'investigating' ? 'border-yellow-500 text-yellow-500' : ''}
                            ${detection.status === 'pending' ? 'border-red-500 text-red-500' : ''}
                          `}
                        >
                          {detection.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(detection)}
                          className="security-border"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Detection Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl security-surface security-border">
            <DialogHeader>
              <DialogTitle className="security-text-primary">
                Detection Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedDetection && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedDetection.snapshotUrl}
                      alt="Detection snapshot"
                      className="w-full rounded-lg object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold security-text-primary mb-2">
                        Detection Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="security-text-secondary">
                          <span className="font-medium">ID:</span> {selectedDetection.id}
                        </p>
                        <p className="security-text-secondary">
                          <span className="font-medium">Name:</span> {selectedDetection.face?.name || 'Unknown'}
                        </p>
                        <p className="security-text-secondary">
                          <span className="font-medium">Tag:</span> {selectedDetection.face?.tag || 'N/A'}
                        </p>
                        <p className="security-text-secondary">
                          <span className="font-medium">Camera:</span> {selectedDetection.cameraId}
                        </p>
                        <p className="security-text-secondary">
                          <span className="font-medium">Confidence:</span> {(selectedDetection.confidence * 100).toFixed(1)}%
                        </p>
                        <p className="security-text-secondary">
                          <span className="font-medium">Detected:</span> {format(new Date(selectedDetection.detectedAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium security-text-primary mb-2">
                        Status Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(selectedDetection.id, 'acknowledged')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(selectedDetection.id, 'dismissed')}
                          className="bg-gray-600 hover:bg-gray-700"
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(selectedDetection.id, 'investigating')}
                          className="bg-yellow-600 hover:bg-yellow-700"
                          disabled={updateStatusMutation.isPending}
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Investigate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedDetection.notes && (
                  <div>
                    <h4 className="font-medium security-text-primary mb-2">Notes</h4>
                    <p className="security-text-secondary bg-slate-100 dark:bg-slate-800 p-3 rounded">
                      {selectedDetection.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
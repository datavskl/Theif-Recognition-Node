import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  detection: {
    id: number;
    name: string;
    tag: string;
    camera: string;
    timestamp: string;
    snapshotUrl: string;
    confidence: number;
  } | null;
  onAcknowledge: (id: number) => void;
  onDismiss: (id: number) => void;
}

export function AlertModal({ 
  isOpen, 
  onClose, 
  detection, 
  onAcknowledge, 
  onDismiss 
}: AlertModalProps) {
  const { t } = useTranslation();

  if (!detection) return null;

  const handleAcknowledge = () => {
    onAcknowledge(detection.id);
    onClose();
  };

  const handleDismiss = () => {
    onDismiss(detection.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 security-surface security-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-500 flex items-center alert-shake">
            <AlertTriangle className="mr-2" />
            {t('thiefDetected')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Snapshot */}
          <div className="w-full h-32 bg-slate-700 rounded flex items-center justify-center overflow-hidden">
            {detection.snapshotUrl ? (
              <img 
                src={detection.snapshotUrl} 
                alt="Detection Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400">Detection Snapshot</span>
            )}
          </div>
          
          <div className="space-y-2 security-text-primary">
            <p>
              <strong>{t('name')}:</strong> {detection.name}
            </p>
            <p>
              <strong>{t('tag')}:</strong>{' '}
              <Badge 
                variant={detection.tag === 'thief' ? 'destructive' : 'secondary'}
                className={detection.tag === 'thief' ? 'security-accent-red' : 'bg-orange-600'}
              >
                {detection.tag.toUpperCase()}
              </Badge>
            </p>
            <p>
              <strong>{t('camera')}:</strong> {detection.camera}
            </p>
            <p>
              <strong>{t('time')}:</strong> {detection.timestamp}
            </p>
            <p>
              <strong>Confidence:</strong> {detection.confidence}%
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <Button 
            onClick={handleAcknowledge}
            className="flex-1 security-accent-red hover:security-accent-red text-white"
          >
            {t('acknowledge')}
          </Button>
          <Button 
            onClick={handleDismiss}
            variant="secondary"
            className="flex-1 security-surface-secondary hover:bg-slate-600 text-white"
          >
            {t('dismiss')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

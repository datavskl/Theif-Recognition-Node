import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expand, Shrink, Video, Settings, Camera } from "lucide-react";
import { FaceDetectionOverlay } from "./FaceDetectionOverlay";
import { useFaceRecognition } from "@/hooks/useFaceRecognition";
import { useTranslation } from "react-i18next";

interface CameraFeedProps {
  onDetection: (detection: any) => void;
}

export function CameraFeed({ onDetection }: CameraFeedProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  
  const { detectedFaces, isProcessing } = useFaceRecognition(videoRef, onDetection);

  // Initialize camera stream
  useEffect(() => {
    let mounted = true;
    
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setIsStreamActive(true);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsStreamActive(false);
        setCameraError('Camera access denied or not available');
        
        // Set a more detailed error state for better user experience
        if (videoRef.current) {
          videoRef.current.style.display = 'none';
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Fullscreen error:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Exit fullscreen error:', error);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold security-text-primary">
          {t('liveCameraFeed')}
        </h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isStreamActive ? 'security-success animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm security-text-secondary">
              {isStreamActive ? t('cameraOnline') : 'Camera Offline'}
            </span>
          </div>
          <Button
            onClick={toggleFullscreen}
            variant="secondary"
            className="security-surface-secondary hover:bg-slate-600 text-white"
          >
            {isFullscreen ? (
              <>
                <Shrink className="mr-2 h-4 w-4" />
                {t('exitFullscreen')}
              </>
            ) : (
              <>
                <Expand className="mr-2 h-4 w-4" />
                {t('fullscreen')}
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div 
        className={`relative bg-black rounded-lg overflow-hidden security-border ${
          isFullscreen ? 'fullscreen-camera' : ''
        }`}
        style={!isFullscreen ? { aspectRatio: '16/9' } : {}}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Face Detection Overlay */}
        {videoRef.current && (
          <FaceDetectionOverlay
            videoRef={videoRef}
            detectedFaces={detectedFaces}
          />
        )}
        
        {/* Loading/Error state */}
        {!isStreamActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Video className="text-6xl text-slate-600 mb-4 mx-auto" />
              {cameraError ? (
                <>
                  <p className="text-slate-400 mb-2">Camera Not Available</p>
                  <p className="text-sm text-slate-500 mb-4">{cameraError}</p>
                  <Button
                    onClick={() => setIsDemoMode(true)}
                    className="security-accent-red hover:bg-red-700"
                  >
                    Try Demo Mode
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-slate-400">{t('loading')}</p>
                  <p className="text-sm text-slate-500 mt-2">Main Entrance Camera</p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Demo Mode */}
        {isDemoMode && !isStreamActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                  <Camera className="text-4xl text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-white text-lg mb-2">Demo Mode Active</p>
              <p className="text-slate-400 text-sm mb-4">Simulating live camera feed</p>
              <Button
                onClick={() => {
                  // Simulate a detection
                  onDetection({
                    id: Date.now(),
                    name: "John Doe (Demo)",
                    tag: "Known Thief",
                    camera: "Main Entrance Camera",
                    timestamp: new Date().toISOString(),
                    snapshotUrl: "/demo-snapshot.jpg",
                    confidence: 0.92
                  });
                }}
                variant="outline"
                className="mr-2"
              >
                Simulate Detection
              </Button>
              <Button
                onClick={() => setIsDemoMode(false)}
                variant="ghost"
              >
                Exit Demo
              </Button>
            </div>
          </div>
        )}
        
        {/* Camera Controls */}
        <div className="absolute bottom-4 left-4 flex space-x-2 camera-controls">
          <Button
            size="sm"
            variant="ghost"
            className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Recording Indicator */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full recording-indicator"></div>
          <span className="text-sm">REC</span>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              Processing...
            </Badge>
          </div>
        )}
      </div>
    </section>
  );
}

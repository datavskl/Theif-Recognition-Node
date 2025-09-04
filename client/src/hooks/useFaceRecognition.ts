import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { detectFaces, findFaceMatches, captureSnapshot, FaceDetection } from "@/lib/faceApi";
import { apiRequest } from "@/lib/queryClient";
import type { Face } from "@shared/schema";

interface DetectedFace {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  match?: {
    faceId: number;
    name: string;
    tag: string;
    confidence: number;
  };
}

export function useFaceRecognition(
  videoRef: React.RefObject<HTMLVideoElement>,
  onDetection: (detection: any) => void
) {
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const lastDetectionTimeRef = useRef<number>(0);

  // Get face database
  const { data: faceDatabase = [] } = useQuery<Face[]>({
    queryKey: ["/api/faces"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Face recognition processing
  useEffect(() => {
    if (!videoRef.current || processingRef.current) return;

    const processFrame = async () => {
      if (!videoRef.current || processingRef.current) return;
      
      processingRef.current = true;
      setIsProcessing(true);

      try {
        const faces = await detectFaces(videoRef.current);
        const facesWithMatches: DetectedFace[] = [];

        for (const face of faces) {
          const matches = findFaceMatches(face.descriptor, faceDatabase as Array<{ id: number; name: string; tag: string; faceEmbedding: number[] }>, 0.6);
          const bestMatch = matches[0];

          const detectedFace: DetectedFace = {
            box: face.box,
            match: bestMatch ? {
              faceId: bestMatch.faceId,
              name: bestMatch.name,
              tag: bestMatch.tag,
              confidence: bestMatch.confidence,
            } : undefined,
          };

          facesWithMatches.push(detectedFace);

          // Trigger alert for thief detection
          if (bestMatch && bestMatch.tag === 'thief') {
            const now = Date.now();
            const timeSinceLastDetection = now - lastDetectionTimeRef.current;
            
            // Only trigger alert once every 10 seconds for the same detection
            if (timeSinceLastDetection > 10000) {
              lastDetectionTimeRef.current = now;
              
              try {
                // Capture snapshot
                const snapshotBlob = await captureSnapshot(videoRef.current);
                
                // Create FormData for file upload
                const formData = new FormData();
                formData.append('snapshot', snapshotBlob, 'snapshot.jpg');
                formData.append('faceId', bestMatch.faceId.toString());
                formData.append('cameraId', '1'); // Default camera ID
                formData.append('confidence', Math.round(bestMatch.confidence).toString());
                
                // Upload to backend
                const response = await fetch('/api/detections', {
                  method: 'POST',
                  body: formData,
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const detection = await response.json();
                
                // Create snapshot URL for display
                const snapshotUrl = URL.createObjectURL(snapshotBlob);

                // Trigger alert
                onDetection({
                  id: detection.id,
                  name: bestMatch.name,
                  tag: bestMatch.tag,
                  camera: "Main Entrance",
                  timestamp: new Date().toLocaleString(),
                  snapshotUrl,
                  confidence: bestMatch.confidence,
                });
              } catch (error) {
                console.error('Error creating detection record:', error);
              }
            }
          }
        }

        setDetectedFaces(facesWithMatches);
      } catch (error) {
        console.error('Face recognition error:', error);
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    };

    // Process frames every 1000ms (1 FPS)
    const interval = setInterval(processFrame, 1000);

    return () => {
      clearInterval(interval);
      processingRef.current = false;
    };
  }, [videoRef, faceDatabase, onDetection]);

  return {
    detectedFaces,
    isProcessing,
  };
}

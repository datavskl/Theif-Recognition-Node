import { useEffect, useState } from "react";

interface DetectedFace {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  match?: {
    name: string;
    tag: string;
    confidence: number;
  };
}

interface FaceDetectionOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  detectedFaces: DetectedFace[];
}

export function FaceDetectionOverlay({ videoRef, detectedFaces }: FaceDetectionOverlayProps) {
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateVideoRect = () => {
      if (videoRef.current) {
        setVideoRect(videoRef.current.getBoundingClientRect());
      }
    };

    updateVideoRect();
    window.addEventListener('resize', updateVideoRect);
    
    return () => {
      window.removeEventListener('resize', updateVideoRect);
    };
  }, [videoRef]);

  if (!videoRect || !videoRef.current) {
    return null;
  }

  const video = videoRef.current;
  const scaleX = videoRect.width / video.videoWidth;
  const scaleY = videoRect.height / video.videoHeight;

  return (
    <div className="camera-overlay">
      {detectedFaces.map((face, index) => {
        const scaledBox = {
          x: face.box.x * scaleX,
          y: face.box.y * scaleY,
          width: face.box.width * scaleX,
          height: face.box.height * scaleY,
        };

        const isThief = face.match?.tag === 'thief';
        const boxClass = isThief ? 'thief' : 'normal';
        const labelClass = isThief ? 'thief' : 'normal';
        
        return (
          <div key={index}>
            {/* Detection Box */}
            <div
              className={`face-detection-box ${boxClass}`}
              style={{
                left: `${scaledBox.x}px`,
                top: `${scaledBox.y}px`,
                width: `${scaledBox.width}px`,
                height: `${scaledBox.height}px`,
              }}
            >
              {/* Label */}
              <div className={`face-detection-label ${labelClass}`}>
                {face.match ? (
                  isThief ? (
                    `⚠️ ${face.match.tag.toUpperCase()}: ${face.match.name}`
                  ) : (
                    face.match.name
                  )
                ) : (
                  'Unknown Person'
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

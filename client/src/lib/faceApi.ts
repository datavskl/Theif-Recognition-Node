import * as faceapi from 'face-api.js';

let isLoaded = false;

export async function loadFaceApiModels() {
  if (isLoaded) return;
  
  try {
    // Load face-api.js models from CDN
    const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    
    isLoaded = true;
    console.log('✅ Face-api.js models loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load face-api.js models:', error);
    throw error;
  }
}

export interface FaceDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: any;
  descriptor: Float32Array;
  expressions: any;
}

export async function detectFaces(videoElement: HTMLVideoElement): Promise<FaceDetection[]> {
  if (!isLoaded) {
    await loadFaceApiModels();
  }

  try {
    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    return detections.map(detection => ({
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
      landmarks: detection.landmarks,
      descriptor: detection.descriptor,
      expressions: detection.expressions,
    }));
  } catch (error) {
    console.error('Face detection error:', error);
    return [];
  }
}

export function calculateFaceDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

export async function extractFaceDescriptor(imageElement: HTMLImageElement): Promise<Float32Array | null> {
  if (!isLoaded) {
    await loadFaceApiModels();
  }

  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection?.descriptor || null;
  } catch (error) {
    console.error('Face descriptor extraction error:', error);
    return null;
  }
}

export interface FaceMatch {
  faceId: number;
  name: string;
  tag: string;
  confidence: number;
  distance: number;
}

export function findFaceMatches(
  detectedDescriptor: Float32Array,
  faceDatabase: Array<{ id: number; name: string; tag: string; faceEmbedding: number[] }>,
  threshold: number = 0.6
): FaceMatch[] {
  const matches: FaceMatch[] = [];

  for (const face of faceDatabase) {
    const storedDescriptor = new Float32Array(face.faceEmbedding);
    const distance = calculateFaceDistance(detectedDescriptor, storedDescriptor);
    
    if (distance < threshold) {
      const confidence = Math.max(0, Math.min(100, (1 - distance) * 100));
      matches.push({
        faceId: face.id,
        name: face.name,
        tag: face.tag,
        confidence: Math.round(confidence),
        distance,
      });
    }
  }

  // Sort by confidence (lower distance = higher confidence)
  return matches.sort((a, b) => a.distance - b.distance);
}

export async function captureSnapshot(videoElement: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to capture snapshot'));
      }
    }, 'image/jpeg', 0.8);
  });
}

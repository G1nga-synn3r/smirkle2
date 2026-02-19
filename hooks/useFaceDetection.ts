/**
 * useFaceDetection Custom Hook
 * Optimized face detection using face-api.js for the Don't Laugh challenge
 * Monitors front-facing camera and detects smile expressions and eye openness
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';
import type { 
  FaceDetectionResult, 
  FaceDetectionConfig,
  FailReason 
} from '@/lib/types';
import { DEFAULT_FACE_DETECTION_CONFIG, SMILE_THRESHOLD, EYE_OPEN_THRESHOLD } from '@/lib/types';

interface UseFaceDetectionProps {
  config?: Partial<FaceDetectionConfig>;
  onGameFail?: (reason: FailReason) => void;
  enabled?: boolean;
}

interface UseFaceDetectionReturn {
  // State
  isLoading: boolean;
  isInitialized: boolean;
  isModelLoading: boolean;
  error: string | null;
  webcamStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  
  // Detection results
  detectionResult: FaceDetectionResult | null;
  isSmiling: boolean;
  eyesOpen: boolean;
  faceDetected: boolean;
  
  // Controls
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  resetDetection: () => void;
}

const MODEL_PATH = '/models';

export function useFaceDetection({
  config,
  onGameFail,
  enabled = true,
}: UseFaceDetectionProps = {}): UseFaceDetectionReturn {
  // Merge default config with provided config
  const detectionConfig: FaceDetectionConfig = {
    ...DEFAULT_FACE_DETECTION_CONFIG,
    ...config,
  };

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [detectionResult, setDetectionResult] = useState<FaceDetectionResult | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);

  // Derived state
  const isSmiling = detectionResult?.isSmiling ?? false;
  const eyesOpen = detectionResult?.eyesOpen ?? true;
  const faceDetected = detectionResult?.faceDetected ?? false;

  // Load face-api.js models
  const loadModels = useCallback(async (): Promise<boolean> => {
    setIsModelLoading(true);
    setError(null);
    
    try {
      // Load required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_PATH),
      ]);
      
      setIsModelLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Failed to load face detection models: ${err.message}` 
        : 'Failed to load face detection models';
      
      setError(errorMessage);
      setIsModelLoading(false);
      return false;
    }
  }, []);

  // Initialize webcam
  const initWebcam = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Request front-facing camera only
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      
      setWebcamStream(stream);
      setIsLoading(false);
      
      // Attach stream to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return true;
    } catch (err) {
      let errorMessage = 'Failed to access camera';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera access to play.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera to play.';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Detect face expressions
  const detectFace = useCallback(async (): Promise<void> => {
    if (!videoRef.current || !isRunningRef.current) return;
    
    try {
      // First detect face with landmarks
      const withLandmarks = await faceapi
        .detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: detectionConfig.minFaceDetectionConfidence,
          })
        )
        .withFaceLandmarks();
      
      // Then get expressions
      const withExpressions = await faceapi
        .detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: detectionConfig.minFaceDetectionConfidence,
          })
        )
        .withFaceExpressions();
      
      const detection = withExpressions;
      
      if (!detection) {
        // No face detected
        const newResult: FaceDetectionResult = {
          isSmiling: false,
          eyesOpen: true,
          faceDetected: false,
          smileProbability: 0,
          leftEyeOpenProbability: 1,
          rightEyeOpenProbability: 1,
          detectionTimestamp: Date.now(),
        };
        
        setDetectionResult(newResult);
        
        // Trigger fail if face was previously detected but now lost
        if (detectionResult?.faceDetected) {
          onGameFail?.('no_face_detected');
        }
        return;
      }
      
      // Get smile probability from expressions
      const expressions = detection.expressions;
      const smileProbability = expressions.happy || 0;
      const isSmileDetected = smileProbability > detectionConfig.minSmileProbability;
      
      // Check eye openness using landmarks
      let leftEyeOpen = true;
      let rightEyeOpen = true;
      
      if (withLandmarks?.landmarks) {
        const landmarks = withLandmarks.landmarks;
        
        // Calculate eye aspect ratio to determine if eyes are open
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        // Simple heuristic: if eye landmarks are too close together, eye is closed
        const getEyeAspectRatio = (eye: faceapi.Point[]) => {
          if (eye.length < 6) return 1;
          const top = (eye[1].y + eye[2].y) / 2;
          const bottom = (eye[4].y + eye[5].y) / 2;
          const horizontal = eye[3].x - eye[0].x;
          const vertical = bottom - top;
          return vertical / (horizontal + 0.001);
        };
        
        const leftEAR = getEyeAspectRatio(leftEye);
        const rightEAR = getEyeAspectRatio(rightEye);
        
        // Threshold for eye closure
        const eyeClosureThreshold = 0.15;
        
        leftEyeOpen = leftEAR > eyeClosureThreshold;
        rightEyeOpen = rightEAR > eyeClosureThreshold;
      }
      
      const eyesAreOpen = leftEyeOpen && rightEyeOpen;
      
      const newResult: FaceDetectionResult = {
        isSmiling: isSmileDetected,
        eyesOpen: eyesAreOpen,
        faceDetected: true,
        smileProbability,
        leftEyeOpenProbability: leftEyeOpen ? 1 : 0,
        rightEyeOpenProbability: rightEyeOpen ? 1 : 0,
        detectionTimestamp: Date.now(),
      };
      
      setDetectionResult(newResult);
      
      // Check for fail conditions
      if (isSmileDetected) {
        onGameFail?.('smiley_detected');
      } else if (!eyesAreOpen) {
        onGameFail?.('eyes_closed');
      }
      
    } catch (err) {
      console.error('Face detection error:', err);
      // Don't fail on detection errors, just continue
    }
  }, [detectionConfig, detectionResult, onGameFail]);

  // Start detection loop
  const startDetection = useCallback(async () => {
    // First load models if not loaded
    if (!isInitialized) {
      const modelsLoaded = await loadModels();
      if (!modelsLoaded) return;
      setIsInitialized(true);
    }
    
    // Initialize webcam
    const webcamReady = await initWebcam();
    if (!webcamReady) return;
    
    // Start detection loop
    isRunningRef.current = true;
    
    detectionIntervalRef.current = setInterval(() => {
      if (isRunningRef.current) {
        detectFace();
      }
    }, detectionConfig.detectionInterval);
    
  }, [isInitialized, loadModels, initWebcam, detectFace, detectionConfig.detectionInterval]);

  // Stop detection
  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    // Stop webcam stream
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [webcamStream]);

  // Reset detection state
  const resetDetection = useCallback(() => {
    setDetectionResult(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // Auto-start effect - use ref to track initialization
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (enabled && !initializedRef.current && !isLoading) {
      initializedRef.current = true;
      // Use requestAnimationFrame to defer the call
      const timeoutId = setTimeout(() => {
        startDetection();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [enabled, isLoading, startDetection]);

  return {
    isLoading,
    isInitialized,
    isModelLoading,
    error,
    webcamStream,
    videoRef,
    detectionResult,
    isSmiling,
    eyesOpen,
    faceDetected,
    startDetection,
    stopDetection,
    resetDetection,
  };
}

export default useFaceDetection;

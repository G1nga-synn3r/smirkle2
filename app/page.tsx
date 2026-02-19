'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Camera, Video, AlertTriangle, Volume2, VolumeX, Maximize2, Smile, Eye, Trophy, X, Zap, TrendingUp, Award, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as faceapi from 'face-api.js';
import { onAuthChange, getUserProfile, updateUserScores, saveGameSession } from '@/lib/firebase';
import LandingPage from '@/components/LandingPage';
import TutorialOverlay from '@/components/TutorialOverlay';
import type { UserProfile } from '@/lib/types';
import type { User as FirebaseAuthUser } from 'firebase/auth';

// Mock video data
const SAMPLE_VIDEOS = [
  { id: '1', title: 'Funny Cat Compilation', thumbnail: 'https://picsum.photos/seed/cat1/400/300' },
  { id: '2', title: 'Kids Saying Funny Things', thumbnail: 'https://picsum.photos/seed/kids2/400/300' },
  { id: '3', title: 'Pet Fails 2024', thumbnail: 'https://picsum.photos/seed/pets3/400/300' },
  { id: '4', title: 'Epic Fails Compilation', thumbnail: 'https://picsum.photos/seed/fails4/400/300' },
  { id: '5', title: 'Try Not To Laugh Challenge', thumbnail: 'https://picsum.photos/seed/laugh5/400/300' },
];

// Face detection models
const MODEL_URL = '/models/face-api.js-master/face-api.js-master/weights/';

export default function HomePage() {
  // Game state
  const [isReady, setIsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_VIDEOS[0]);
  const [score, setScore] = useState(0);
  const [lifetimeScore, setLifetimeScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [rank, setRank] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const [guardianActive, setGuardianActive] = useState(false);
  const [vibrationSupported, setVibrationSupported] = useState(false);

  // Strict activation states - ALL must be true for video to play
  const [eyesOpen, setEyesOpen] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [startButtonClicked, setStartButtonClicked] = useState(false);
  const [allConditionsMet, setAllConditionsMet] = useState(false);

  // Fullscreen video player
  const [showFullscreenVideo, setShowFullscreenVideo] = useState(false);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const faceDetectionRef = useRef<faceapi.FaceDetection | null>(null);
  const pipWindowRef = useRef<Window | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Listen for auth changes and load user profile
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        // Load user profile
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setLifetimeScore(profile?.lifetimeScore || 0);
        setHighScore(profile?.highScore || 0);
        
        // Check if should show tutorial
        const hideTutorial = localStorage.getItem('hideSmirkleTutorial');
        if (hideTutorial !== 'true') {
          setShowTutorial(true);
        }
      } else {
        setUserProfile(null);
        setShowTutorial(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize vibration support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      setVibrationSupported(true);
    }
  }, []);

  // Load face detection models
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setFaceDetectionReady(true);
      } catch (error) {
        console.error('Error loading face detection models:', error);
      }
    };

    loadModels();
  }, []);

  const startGame = async () => {
    setGuardianActive(true);
    setScore(0);
    setGameTime(0);
    setIsFailed(false);
    setFailReason('');
    setRank('NOVICE');
  };

  const handleFail = (reason: string) => {
    setIsFailed(true);
    setFailReason(reason);
    setGuardianActive(false);
    
    // Trigger vibration
    if (vibrationSupported) {
      navigator.vibrate([100, 200, 100]);
    }
    
    // Stop game timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  };

  const handleReady = () => {
    setIsReady(true);
    setVideoActive(true);
  };

  const handleStop = () => {
    setIsReady(false);
    setVideoActive(false);
    setGuardianActive(false);
    setScore(0);
    setGameTime(0);
    setIsFailed(false);
    setFailReason('');
    setRank('NOVICE');
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePip = async () => {
    if (!videoRef.current) return;

    try {
      if (!isPip) {
        await videoRef.current.requestPictureInPicture();
        setIsPip(true);
      } else {
        await document.exitPictureInPicture();
        setIsPip(false);
      }
    } catch (error) {
      console.error('PIP error:', error);
    }
  };

  const getRankColor = () => {
    const rankColors = {
      'GOD': '#00FF41',
      'MASTER': '#00D4FF',
      'PRO': '#FF00F5',
      'ADVANCED': '#FF8C00',
      'INTERMEDIATE': '#FFFF00',
      'BEGINNER': '#FF0000',
      'NOVICE': '#808080'
    };
    return rankColors[rank as keyof typeof rankColors] || '#FFFFFF';
  };

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error('Camera error:', err);
        setCameraActive(false);
      }
    };

    if (isReady && faceDetectionReady) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [isReady, faceDetectionReady]);

  // Check if all strict activation conditions are met
  useEffect(() => {
    const conditionsMet = eyesOpen && !isSmiling && faceDetected && startButtonClicked;
    setAllConditionsMet(conditionsMet);
    
    // If all conditions met, start video and scoring
    if (conditionsMet && !videoActive) {
      setVideoActive(true);
      setGuardianActive(true);
    } else if (!conditionsMet && videoActive && !isFailed) {
      // If conditions not met and video was playing, stop it
      setVideoActive(false);
    }
  }, [eyesOpen, isSmiling, faceDetected, startButtonClicked, videoActive, isFailed]);

  // Face detection and guardian system
  useEffect(() => {
    if (!isReady || !cameraActive || !faceDetectionReady) return;

    const detectFaces = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const displaySize = { width: 640, height: 480 };
      faceapi.matchDimensions(canvasRef.current, displaySize);

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // Update face detection states for strict activation
        setFaceDetected(true);
        
        // Check for smile
        const smiling = detections.expressions.happy > 0.5;
        setIsSmiling(smiling);
        if (smiling) {
          handleFail('You smiled! Keep a straight face!');
          return;
        }

        // Check for eyes closed
        const leftEye = resizedDetections.landmarks.getLeftEye();
        const rightEye = resizedDetections.landmarks.getRightEye();
        const leftEyeClosed = leftEye[1].y > leftEye[5].y;
        const rightEyeClosed = rightEye[1].y > rightEye[5].y;
        const eyesAreOpen = !leftEyeClosed && !rightEyeClosed;
        setEyesOpen(eyesAreOpen);
        
        if (!eyesAreOpen) {
          handleFail('Your eyes are closed! Stay alert!');
          return;
        }

        // Draw detection box
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 640, 480);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        }
      } else {
        setFaceDetected(false);
        setEyesOpen(false);
      }
    };

    const interval = setInterval(detectFaces, 100);
    return () => clearInterval(interval);
  }, [isReady, cameraActive, faceDetectionReady]);

  // Game scoring - runs while video is active
  useEffect(() => {
    if (!videoActive || isFailed) return;

    gameTimerRef.current = setInterval(() => {
      setGameTime(prev => prev + 1);
      setSessionScore(prev => prev + 10); // 10 points per second while video plays
    }, 1000);

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [videoActive, isFailed]);

  // Update rank based on score
  useEffect(() => {
    if (score >= 5000) setRank('GOD');
    else if (score >= 3000) setRank('MASTER');
    else if (score >= 1000) setRank('PRO');
    else if (score >= 500) setRank('ADVANCED');
    else if (score >= 200) setRank('INTERMEDIATE');
    else if (score >= 100) setRank('BEGINNER');
    else setRank('NOVICE');
  }, [score]);

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-[#00FF9C] text-2xl font-black animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  // Show LandingPage if not authenticated
  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FF41]/5 to-[#FF00F5]/5"></div>
      
      {/* Main Content */}
      <div className="p-4 pb-28 relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-[#00FF9C] glow-mint mb-2">
            SMIRKLE2
          </h1>
          <p className="text-gray-400 text-sm">Don&apos;t Laugh Challenge</p>
        </div>

        {/* Instructions Banner */}
        <div className="neo-card mb-4 bg-yellow-900/30 border-yellow-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div className="text-center flex-1">
              <p className="font-bold text-yellow-500 text-lg">
                Eyes open! Straight face! No smiling!
              </p>
            </div>
          </div>
        </div>

        {/* Guardian System Status */}
        {guardianActive && (
          <div className="neo-card mb-4 bg-[#00FF41]/20 border-[#00FF41] border-2">
            <div className="flex items-center gap-3 p-3">
              <Shield className="w-5 h-5 text-[#00FF41]" />
              <div className="flex-1">
                <p className="font-bold text-[#00FF41] text-sm">GUARDIAN SYSTEM ACTIVE</p>
                <p className="text-gray-400 text-xs">Monitoring your face...</p>
              </div>
            </div>
          </div>
        )}

        {/* Split Screen Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Video Preview Window */}
          <div className="neo-card p-0 overflow-hidden">
            <div className="bg-black aspect-video relative">
              {/* Video Display */}
              {videoActive ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  {/* Simulated video content */}
                  <div className="text-center p-4">
                    <Video className="w-16 h-16 mx-auto text-[#00FF9C] mb-2 animate-pulse" />
                    <p className="text-[#00FF9C] font-bold">{selectedVideo.title}</p>
                    <p className="text-gray-400 text-sm mt-2">Video playing...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-500">Select a video to preview</p>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="absolute top-2 left-2 flex gap-2">
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 bg-black/70 border border-black flex items-center justify-center hover:bg-black transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 bg-black/70 border border-black flex items-center justify-center hover:bg-black transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={togglePip}
                  className="w-8 h-8 bg-black/70 border border-black flex items-center justify-center hover:bg-black transition-colors"
                >
                  <div className="w-4 h-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 border border-black flex items-center justify-center hover:bg-black"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Video Label */}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-xs font-bold">
                VIDEO PREVIEW
              </div>
            </div>

            {/* Video Selection */}
            <div className="p-2 bg-[#1a1a1a]">
              <p className="text-xs text-gray-400 mb-2">Select video:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SAMPLE_VIDEOS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={cn(
                      "flex-shrink-0 w-20 h-14 bg-black border-2 overflow-hidden cursor-pointer transition-all duration-200",
                      selectedVideo.id === video.id 
                        ? "border-[#00FF9C] transform scale-105 shadow-[0_0_20px_rgba(0,255,156,0.5)]"
                        : "border-transparent opacity-50 hover:border-gray-600 hover:opacity-75"
                    )}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Camera Window */}
          <div className="neo-card p-0 overflow-hidden">
            <div className="bg-black aspect-video relative">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <canvas ref={canvasRef} className="absolute inset-0" width={640} height={480} />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-500">Camera inactive</p>
                    <p className="text-gray-600 text-xs mt-1">Press READY to start</p>
                  </div>
                </div>
              )}

              {/* Camera Status Indicator */}
              {cameraActive && (
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              )}

              {/* Game Status Indicators */}
              {isReady && !isFailed && (
                <>
                  {/* Score */}
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 text-xs font-bold rounded">
                    <span className="text-[#00FF9C]">{score}</span>
                    <span className="text-gray-400"> pts</span>
                  </div>
                  
                  {/* Time */}
                  <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 text-xs font-bold rounded">
                    <span className="text-[#FF00F5]">{Math.floor(gameTime / 60)}:{String(gameTime % 60).padStart(2, '0')}</span>
                  </div>
                </>
              )}

              {/* Camera Label */}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-xs font-bold">
                YOUR FACE
              </div>
            </div>

            {/* Camera Info */}
            <div className="p-3 bg-[#1a1a1a] text-center">
              <p className="text-sm text-gray-400">
                Make sure your face is visible and well-lit
              </p>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Face Detection */}
        <canvas ref={canvasRef} className="hidden" width={640} height={480} />

        {/* Ready Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
          {!isReady ? (
            <button
              onClick={handleReady}
              className="w-full py-6 text-2xl font-bold uppercase tracking-wider
                bg-[#FF003C] text-white border-4 border-black
                shadow-[0_0_30px_rgba(255,0,60,0.5)]
                hover:bg-red-600 hover:shadow-[0_0_50px_rgba(255,0,60,0.8)]
                active:scale-95 transition-all duration-200
                clip-path-polygon:polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%)"
              style={{
                clipPath: 'polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%)'
              }}
            >
              <Play className="w-8 h-8 inline-block mr-3" />
              READY!
            </button>
          ) : isFailed ? (
            <button
              onClick={handleStop}
              className="w-full py-4 text-xl font-bold uppercase tracking-wider
                bg-[#FF003C] text-white border-4 border-black
                shadow-[0_0_30px_rgba(255,0,60,0.5)]
                hover:bg-red-600 hover:shadow-[0_0_50px_rgba(255,0,60,0.8)]
                active:scale-95 transition-all duration-200"
            >
              <X className="w-6 h-6 inline-block mr-3" />
              FAILED
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full py-4 text-xl font-bold uppercase tracking-wider
                bg-[#1a1a1a] text-[#FF003C] border-4 border-[#FF003C]
                hover:bg-[#FF003C] hover:text-white
                transition-all duration-200"
              style={{
                clipPath: 'polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%)'
              }}
            >
              STOP
            </button>
          )}
        </div>

        {/* Game Status */}
        {isReady && (
          <>
            {/* Score Display */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#00FF9C]/20 border border-[#00FF9C] rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#00FF9C]" />
                <span className="text-[#00FF9C] font-bold text-lg">Score: {score}</span>
              </div>
            </div>

            {/* Rank Display */}
            {rank && (
              <div className="mt-2 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF00F5]/20 border border-[#FF00F5] rounded-lg">
                  <Award className="w-5 h-5 text-[#FF00F5]" />
                  <span className="text-[#FF00F5] font-bold text-lg">Rank: {rank}</span>
                </div>
              </div>
            )}

            {/* Fail Message */}
            {isFailed && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg">
                  <X className="w-5 h-5 text-red-500" />
                  <span className="text-red-500 font-bold text-lg">{failReason}</span>
                </div>
              </div>
            )}

            {/* Game Ready Status */}
            {!isFailed && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF9C]/20 border border-[#00FF9C]">
                  <div className="w-2 h-2 bg-[#00FF9C] rounded-full animate-pulse"></div>
                  <span className="text-[#00FF9C] font-bold">Game active! Keep a straight face!</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fullscreen Background */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-0"></div>
      )}
    </div>
  );
}

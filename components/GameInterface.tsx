/**
 * GameInterface Component
 * Main game interface with hexagonal targeting scope, YouTube video embed,
 * brutalist score counter, and full game logic
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { cn, getYoutubeEmbedUrl, calculateScore, formatTime } from '@/lib/utils';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { ScoreCounter, ScoreDisplay } from './ScoreCounter';
import { TargetScope } from './TargetScope';
import { 
  GameState, 
  FailReason, 
  VideoContent,
  POINTS_PER_SECOND,
} from '@/lib/types';

// Sample videos for the game
const SAMPLE_VIDEOS: VideoContent[] = [
  { id: '1', youtubeId: 'dQw4w9WgXcQ', title: 'Funny Compilation 1', description: 'Try not to laugh!', difficulty: 'easy', expectedDuration: 300 },
  { id: '2', youtubeId: 'jNQXAC9IVRw', title: 'Me at the zoo', description: 'Classic funny', difficulty: 'easy', expectedDuration: 180 },
  { id: '3', youtubeId: '9bZkp7q19f0', title: 'Gangnam Style', description: 'Classic', difficulty: 'medium', expectedDuration: 240 },
  { id: '4', youtubeId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', description: 'Epic', difficulty: 'medium', expectedDuration: 355 },
  { id: '5', youtubeId: 'L_jWHffIx5E', title: 'Smells Like Teen Spirit', description: 'Rock classics', difficulty: 'hard', expectedDuration: 300 },
];

interface GameInterfaceProps {
  userId?: string;
  onScoreUpdate?: (score: number) => void;
  onGameEnd?: (score: number) => void;
  initialVideoId?: string;
}

export function GameInterface({ 
  userId, 
  onScoreUpdate,
  onGameEnd,
  initialVideoId 
}: GameInterfaceProps) {
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    currentScore: 0,
    sessionStartTime: null,
    videoId: initialVideoId || SAMPLE_VIDEOS[0].youtubeId,
    failReason: null,
  });

  // Pre-game check state
  const [passedPreCheck, setPassedPreCheck] = useState(false);
  const [showFailScreen, setShowFailScreen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  // Video reference
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Score timer
  const scoreTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle game fail
  const handleGameFail = useCallback((reason: FailReason) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      failReason: reason,
    }));
    
    // Clear timers
    if (scoreTimerRef.current) {
      clearInterval(scoreTimerRef.current);
      scoreTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    
    // Show fail screen
    setShowFailScreen(true);
    
    // Notify parent
    onGameEnd?.(gameState.currentScore);
  }, [gameState.currentScore, onGameEnd]);

  // Face detection hook
  const {
    isLoading: faceLoading,
    isInitialized: faceInitialized,
    error: faceError,
    videoRef,
    isSmiling,
    eyesOpen,
    faceDetected,
    startDetection,
    stopDetection,
    resetDetection,
  } = useFaceDetection({
    enabled: !gameState.isGameOver,
    onGameFail: handleGameFail,
  });

  // Start game
  const startGame = useCallback(async () => {
    // Start face detection
    await startDetection();
    
    // Set game state
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      currentScore: 0,
      sessionStartTime: Date.now(),
      failReason: null,
    }));
    
    setPassedPreCheck(false);
    setShowFailScreen(false);
    setSessionDuration(0);
    
    // Start score timer (+27 points per second)
    scoreTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev.isPlaying || prev.isPaused) return prev;
        const newScore = prev.currentScore + POINTS_PER_SECOND;
        onScoreUpdate?.(newScore);
        return { ...prev, currentScore: newScore };
      });
    }, 1000);
    
    // Start duration timer
    durationTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  }, [startDetection, onScoreUpdate]);

  // Pause game
  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
    
    if (scoreTimerRef.current) {
      clearInterval(scoreTimerRef.current);
      scoreTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    
    // Restart score timer
    scoreTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev.isPlaying || prev.isPaused) return prev;
        const newScore = prev.currentScore + POINTS_PER_SECOND;
        onScoreUpdate?.(newScore);
        return { ...prev, currentScore: newScore };
      });
    }, 1000);
    
    // Restart duration timer
    durationTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  }, [onScoreUpdate]);

  // End game (manual)
  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
    }));
    
    // Clear timers
    if (scoreTimerRef.current) {
      clearInterval(scoreTimerRef.current);
      scoreTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    
    stopDetection();
    onGameEnd?.(gameState.currentScore);
  }, [gameState.currentScore, onGameEnd, stopDetection]);

  // Restart game
  const restartGame = useCallback(() => {
    resetDetection();
    setShowFailScreen(false);
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      currentScore: 0,
      sessionStartTime: null,
      failReason: null,
    }));
    setPassedPreCheck(false);
  }, [resetDetection]);

  // Handle face detection results for pre-check
  useEffect(() => {
    if (faceDetected && !isSmiling && eyesOpen && !passedPreCheck) {
      setPassedPreCheck(true);
    }
  }, [faceDetected, isSmiling, eyesOpen, passedPreCheck]);

  // Get fail message
  const getFailMessage = () => {
    switch (gameState.failReason) {
      case 'smiley_detected':
        return "SMILE DETECTED!";
      case 'eyes_closed':
        return "EYES CLOSED!";
      case 'no_face_detected':
        return "FACE LOST!";
      default:
        return "GAME OVER";
    }
  };

  // Get random video
  const changeVideo = () => {
    const currentIndex = SAMPLE_VIDEOS.findIndex(v => v.youtubeId === gameState.videoId);
    const nextIndex = (currentIndex + 1) % SAMPLE_VIDEOS.length;
    setGameState(prev => ({ ...prev, videoId: SAMPLE_VIDEOS[nextIndex].youtubeId }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scoreTimerRef.current) clearInterval(scoreTimerRef.current);
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      stopDetection();
    };
  }, [stopDetection]);

  return (
    <div className="fixed inset-0 bg-[#080808] scanlines overflow-hidden">
      {/* Main Game Area */}
      <div className="relative w-full h-full">
        
        {/* YouTube Video Embed - Fullscreen */}
        <div className="absolute inset-0">
          {gameState.videoId && (
            <iframe
              ref={iframeRef}
              src={getYoutubeEmbedUrl(gameState.videoId, gameState.isPlaying && !gameState.isPaused)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Game Video"
            />
          )}
        </div>

        {/* Camera Preview - Bottom Left */}
        {gameState.isPlaying && (
          <div className="absolute bottom-24 left-4 w-48 h-36 border-4 border-black shadow-neo z-10">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Camera status overlay */}
            <div className="absolute top-2 left-2 flex gap-1">
              <div className={cn(
                "w-3 h-3 rounded-full border-2 border-black",
                faceDetected ? "bg-[#00FF9C]" : "bg-[#FF003C]"
              )} />
              <div className={cn(
                "w-3 h-3 rounded-full border-2 border-black",
                !isSmiling ? "bg-gray-600" : "bg-[#FF003C]"
              )} />
              <div className={cn(
                "w-3 h-3 rounded-full border-2 border-black",
                eyesOpen ? "bg-[#00FF9C]" : "bg-[#FF003C]"
              )} />
            </div>
          </div>
        )}

        {/* Target Scope - Top Right */}
        <TargetScope
          videoRef={videoRef}
          isActive={gameState.isPlaying}
          faceDetected={faceDetected}
          isSmiling={isSmiling}
          eyesOpen={eyesOpen}
          className="top-4 right-4"
        />

        {/* Score Counter - Top Center */}
        {gameState.isPlaying && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <ScoreCounter 
              score={gameState.currentScore} 
              isActive={gameState.isPlaying && !gameState.isPaused}
            />
            {/* Timer */}
            <div className="text-center text-[#00FF9C]/60 font-mono text-sm mt-2">
              {formatTime(sessionDuration)}
            </div>
          </div>
        )}

        {/* Game Controls - Bottom Center */}
        {gameState.isPlaying && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-4">
            {gameState.isPaused ? (
              <button 
                onClick={resumeGame}
                className="neo-button"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </button>
            ) : (
              <button 
                onClick={pauseGame}
                className="neo-button neo-button--outline"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </button>
            )}
            
            <button 
              onClick={endGame}
              className="neo-button neo-button--red"
            >
              <X className="w-5 h-5 mr-2" />
              Quit
            </button>
          </div>
        )}

        {/* Pre-Game Screen */}
        {!gameState.isPlaying && !showFailScreen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="neo-card max-w-md text-center">
              <h1 className="text-4xl font-black mb-4 glow-mint text-[#00FF9C]">
                DON'T LAUGH
              </h1>
              <p className="text-gray-300 mb-6">
                Keep a poker face while watching the video! 
                If you smile or close your eyes, you lose.
              </p>
              
              {/* Pre-check status */}
              <div className="mb-6 p-4 border-4 border-black bg-black">
                <p className="text-sm text-gray-400 uppercase mb-3">Camera Check</p>
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    {faceDetected ? (
                      <Eye className="w-8 h-8 mx-auto text-[#00FF9C]" />
                    ) : (
                      <EyeOff className="w-8 h-8 mx-auto text-[#FF003C]" />
                    )}
                    <p className="text-xs mt-1">Face</p>
                  </div>
                  <div className="text-center">
                    {!isSmiling ? (
                      <div className="w-8 h-8 mx-auto border-4 border-[#00FF9C] bg-[#00FF9C]/20" />
                    ) : (
                      <div className="w-8 h-8 mx-auto border-4 border-[#FF003C] bg-[#FF003C]/20" />
                    )}
                    <p className="text-xs mt-1">Neutral</p>
                  </div>
                  <div className="text-center">
                    {eyesOpen ? (
                      <Eye className="w-8 h-8 mx-auto text-[#00FF9C]" />
                    ) : (
                      <EyeOff className="w-8 h-8 mx-auto text-[#FF003C]" />
                    )}
                    <p className="text-xs mt-1">Eyes Open</p>
                  </div>
                </div>
              </div>
              
              {faceLoading && (
                <p className="text-[#FFA500] mb-4">Loading camera...</p>
              )}
              
              {faceError && (
                <p className="text-[#FF003C] mb-4">{faceError}</p>
              )}
              
              {faceInitialized && !faceDetected && (
                <p className="text-[#FFA500] mb-4">Position your face in the camera</p>
              )}
              
              {faceInitialized && faceDetected && isSmiling && (
                <p className="text-[#FF003C] mb-4">Don't smile! Stay neutral</p>
              )}
              
              {faceInitialized && faceDetected && !eyesOpen && (
                <p className="text-[#FF003C] mb-4">Keep your eyes open!</p>
              )}
              
              {passedPreCheck && (
                <p className="text-[#00FF9C] mb-4">✓ Ready! Press Start to begin</p>
              )}
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={changeVideo}
                  className="neo-button neo-button--outline"
                >
                  Skip Video
                </button>
                <button 
                  onClick={startGame}
                  disabled={!faceInitialized || !faceDetected}
                  className="neo-button"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fail Screen */}
        {showFailScreen && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FF003C] z-30 fail-flash">
            <div className="neo-card max-w-md text-center">
              <div className="mb-6">
                <AlertTriangle className="w-16 h-16 mx-auto text-[#FF003C]" />
              </div>
              
              <h2 className="text-5xl font-black mb-4 text-white glitch-text" data-text={getFailMessage()}>
                {getFailMessage()}
              </h2>
              
              <ScoreDisplay 
                score={gameState.currentScore}
                sessionDuration={sessionDuration}
              />
              
              <div className="flex gap-4 justify-center mt-6">
                <button 
                  onClick={restartGame}
                  className="neo-button"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameInterface;

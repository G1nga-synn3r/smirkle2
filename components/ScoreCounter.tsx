/**
 * ScoreCounter Component
 * Brutalist-style score counter that increments by 27 points per second
 */

'use client';

import { useEffect, useState } from 'react';
import { cn, formatNumber, formatScore } from '@/lib/utils';
import { POINTS_PER_SECOND } from '@/lib/types';

interface ScoreCounterProps {
  score: number;
  isActive: boolean;
  className?: string;
}

export function ScoreCounter({ score, isActive, className }: ScoreCounterProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isPulsing, setIsPulsing] = useState(false);

  // Update display score when actual score changes
  useEffect(() => {
    setDisplayScore(score);
  }, [score]);

  // Pulse effect when score increases significantly
  useEffect(() => {
    if (score > 0 && score % 100 === 0) {
      setIsPulsing(true);
      const timeout = setTimeout(() => setIsPulsing(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [score]);

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "score-counter text-4xl md:text-6xl lg:text-7xl font-black tracking-wider",
          "text-[#00FF9C] glow-mint",
          isPulsing && "scale-110 transition-transform"
        )}
      >
        {formatNumber(displayScore)}
      </div>
      
      {/* Points per second indicator */}
      {isActive && (
        <div className="absolute -top-6 right-0 text-xs text-[#00FF9C]/60 font-mono">
          +{POINTS_PER_SECOND}/sec
        </div>
      )}
      
      {/* Decorative border */}
      <div className="absolute -inset-2 border-4 border-black -z-10 transform translate-x-1 translate-y-1" />
    </div>
  );
}

/**
 * ScoreDisplay Component - For end-of-game summary
 */
interface ScoreDisplayProps {
  score: number;
  highScore?: number;
  isNewHighScore?: boolean;
  sessionDuration: number;
}

export function ScoreDisplay({ 
  score, 
  highScore, 
  isNewHighScore, 
  sessionDuration 
}: ScoreDisplayProps) {
  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;

  return (
    <div className="neo-card text-center">
      <h2 className="text-2xl font-bold uppercase tracking-wider mb-6">
        Game Over
      </h2>

      {/* Final Score */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 uppercase mb-2">Final Score</p>
        <div className="text-5xl font-black text-[#00FF9C] glow-mint">
          {formatNumber(score)}
        </div>
      </div>

      {/* New High Score */}
      {isNewHighScore && (
        <div className="mb-6 p-3 bg-[#00FF9C] text-black font-bold uppercase animate-pulse">
          ★ New High Score! ★
        </div>
      )}

      {/* Previous High Score */}
      {!isNewHighScore && highScore !== undefined && (
        <div className="mb-6 p-3 bg-black border-4 border-gray-700">
          <p className="text-sm text-gray-400 uppercase mb-1">High Score</p>
          <p className="text-2xl font-bold text-gray-300">
            {formatNumber(highScore)}
          </p>
        </div>
      )}

      {/* Session Duration */}
      <div className="p-3 bg-black border-4 border-[#FF003C]">
        <p className="text-sm text-gray-400 uppercase mb-1">Time Survived</p>
        <p className="text-2xl font-bold text-white">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

export default ScoreCounter;

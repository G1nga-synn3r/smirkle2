/**
 * TargetScope Component
 * Hexagonal-clipped targeting scope overlay for the game camera
 */

'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TargetScopeProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  faceDetected: boolean;
  isSmiling: boolean;
  eyesOpen: boolean;
  className?: string;
}

export function TargetScope({
  videoRef,
  isActive,
  faceDetected,
  isSmiling,
  eyesOpen,
  className,
}: TargetScopeProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(180);

  // Update scope position based on video element
  useEffect(() => {
    if (!videoRef.current || !isActive) return;

    const updatePosition = () => {
      const video = videoRef.current;
      if (!video) return;

      // Get video dimensions
      const rect = video.getBoundingClientRect();
      
      // Position in top-right corner as specified
      setPosition({
        x: rect.width - size - 20,
        y: 20,
      });
    };

    // Initial position
    updatePosition();

    // Update on resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [videoRef, isActive, size]);

  if (!isActive) return null;

  return (
    <div
      className={cn("fixed z-20", className)}
      style={{
        left: position.x,
        top: position.y,
        width: size,
        height: size,
      }}
    >
      {/* Hexagonal Scope Frame */}
      <div 
        className={cn(
          "w-full h-full target-scope relative",
          "border-4 border-black",
          !faceDetected && "bg-red-900/50",
          faceDetected && isSmiling && "bg-[#FF003C]/50 animate-pulse",
          faceDetected && !isSmiling && !eyesOpen && "bg-yellow-900/50",
          faceDetected && !isSmiling && eyesOpen && "bg-[#00FF9C]/20"
        )}
      >
        {/* Inner Hexagon */}
        <div 
          className="absolute inset-3 target-scope border-2"
          style={{
            borderColor: faceDetected 
              ? (isSmiling ? '#FF003C' : eyesOpen ? '#00FF9C' : '#FFA500')
              : '#666'
          }}
        />

        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Horizontal line */}
          <div 
            className="absolute w-full h-0.5"
            style={{ backgroundColor: faceDetected ? '#00FF9C' : '#666' }}
          />
          {/* Vertical line */}
          <div 
            className="absolute h-full w-0.5"
            style={{ backgroundColor: faceDetected ? '#00FF9C' : '#666' }}
          />
        </div>

        {/* Corner markers */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <div
            key={angle}
            className="absolute w-3 h-3 bg-[#00FF9C] border-2 border-black"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-40px)`,
            }}
          />
        ))}

        {/* Status indicators */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {/* Face detected indicator */}
          <div 
            className={cn(
              "w-3 h-3 border-2 border-black",
              faceDetected ? "bg-[#00FF9C]" : "bg-[#FF003C]"
            )}
            title={faceDetected ? "Face detected" : "No face detected"}
          />
          
          {/* Smile indicator */}
          <div 
            className={cn(
              "w-3 h-3 border-2 border-black",
              isSmiling ? "bg-[#FF003C]" : "bg-gray-600"
            )}
            title={isSmiling ? "Smiling!" : "Not smiling"}
          />
          
          {/* Eyes indicator */}
          <div 
            className={cn(
              "w-3 h-3 border-2 border-black",
              eyesOpen ? "bg-[#00FF9C]" : "bg-[#FF003C]"
            )}
            title={eyesOpen ? "Eyes open" : "Eyes closed"}
          />
        </div>
      </div>

      {/* Label */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider text-[#00FF9C]">
        Target Lock
      </div>
    </div>
  );
}

/**
 * MiniTargetScope Component - Smaller version for status display
 */
interface MiniTargetScopeProps {
  faceDetected: boolean;
  isSmiling: boolean;
  eyesOpen: boolean;
}

export function MiniTargetScope({ faceDetected, isSmiling, eyesOpen }: MiniTargetScopeProps) {
  const getStatusColor = () => {
    if (!faceDetected) return '#FF003C';
    if (isSmiling) return '#FF003C';
    if (!eyesOpen) return '#FFA500';
    return '#00FF9C';
  };

  return (
    <div 
      className="w-6 h-6 target-scope border-2 border-black"
      style={{ backgroundColor: `${getStatusColor()}40` }}
    >
      <div 
        className="absolute inset-1 target-scope"
        style={{ borderColor: getStatusColor() }}
      />
    </div>
  );
}

export default TargetScope;

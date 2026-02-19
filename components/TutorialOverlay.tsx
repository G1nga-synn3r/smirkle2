'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckSquare, Square, Play } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isRegisteredUser: boolean;
  onSavePreference?: (showAgain: boolean) => void;
}

// Tutorial step definitions for the "Infinite Smirkle" flow
const tutorialSteps = [
  {
    id: 1,
    position: 'top' as const,
    title: 'THE LOCK-IN',
    description: 'Eyes open, neutral face',
    icon: '👁️',
  },
  {
    id: 2,
    position: 'right' as const,
    title: 'THE FEED',
    description: '+27 points/sec active play',
    icon: '📺',
  },
  {
    id: 3,
    position: 'bottom' as const,
    title: 'THE BATTLE',
    description: 'Earn badges as you resist',
    icon: '⚔️',
  },
  {
    id: 4,
    position: 'left' as const,
    title: 'THE CRACK',
    description: 'Smile = Red flash & Reset',
    icon: '💥',
  },
];

export function TutorialOverlay({
  isOpen,
  onClose,
  userId,
  isRegisteredUser,
  onSavePreference,
}: TutorialOverlayProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isFailing, setIsFailing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    setMounted(true);
    const hideTutorial = localStorage.getItem('hideSmirkleTutorial');
    if (hideTutorial === 'true' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Fail state effect - triggers red flash and vibration
  useEffect(() => {
    if (isFailing) {
      // Vibrate the device
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(3000);
      }
      
      // Reset after 3000ms
      const timeout = setTimeout(() => {
        setIsFailing(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isFailing]);

  // Handle checkbox toggle
  const handleDontShowAgainChange = async (checked: boolean) => {
    setDontShowAgain(checked);
    
    // Update localStorage
    localStorage.setItem('hideSmirkleTutorial', checked ? 'true' : 'false');
    
    // Update Firestore if user is registered
    if (checked && userId && isRegisteredUser) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          'settings.showTutorial': false,
          skipTutorial: true,
        });
      } catch (error) {
        console.error('Error updating user preferences:', error);
      }
    }
    
    // Call the existing preference handler if provided
    if (onSavePreference) {
      onSavePreference(!checked);
    }
  };

  // Handle close
  const handleClose = () => {
    if (dontShowAgain && isRegisteredUser) {
      localStorage.setItem('hideSmirkleTutorial', 'true');
    }
    onClose();
  };

  // Trigger fail state for demo
  const triggerFailState = () => {
    setIsFailing(true);
  };

  // Don't render if not mounted or if tutorial should be hidden
  if (!mounted || !isOpen) return null;

  // Render fail state overlay
  if (isFailing) {
    return (
      <div className="fixed inset-0 z-[100] bg-smirkleRed flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-pulse">💥</div>
          <h2 className="text-4xl font-black text-black uppercase tracking-widest">
            YOU CRACKED!
          </h2>
          <p className="text-black text-xl mt-4 font-bold">
            Resetting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Main Tutorial Container */}
      <div className="relative w-full max-w-2xl aspect-square mx-4">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-black border-4 border-white hover:bg-smirkleRed transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Central Hexagon */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-40 h-40">
            {/* Outer border (black) */}
            <div className="absolute inset-0 bg-black clip-hexagon" />
            {/* Inner content (smirkleMint) */}
            <div className="absolute inset-[4px] bg-smirkleMint clip-hexagon flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-1">⬡</div>
                <div className="text-xs font-black uppercase tracking-widest text-black">
                  INFINITE
                </div>
                <div className="text-lg font-black uppercase tracking-widest text-black">
                  SMIRKLE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Boxes - Diamond Layout */}
        {tutorialSteps.map((step, index) => {
          // Position calculations for diamond layout
          const positions = {
            top: { top: '5%', left: '50%', transform: 'translateX(-50%)' },
            right: { top: '50%', right: '5%', transform: 'translateY(-50%)' },
            bottom: { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
            left: { top: '50%', left: '5%', transform: 'translateY(-50%)' },
          };
          
          return (
            <div
              key={step.id}
              className="absolute w-28 h-28 bg-white border-4 border-black flex flex-col items-center justify-center shadow-brutal"
              style={positions[step.position]}
            >
              <div className="text-2xl mb-1">{step.icon}</div>
              <div className="text-[10px] font-black uppercase text-center leading-tight text-black">
                {step.title}
              </div>
              <div className="text-[8px] text-gray-600 text-center leading-tight mt-1 px-1">
                {step.description}
              </div>
            </div>
          );
        })}

        {/* Animated SVG Connectors */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            {/* Arrow marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="black" />
            </marker>
          </defs>
          
          {/* Connector: Top to Right */}
          <path
            d="M 50% 18% Q 65% 35% 78% 42%"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeDasharray="8 4"
            markerEnd="url(#arrowhead)"
            className="animate-dash"
          />
          
          {/* Connector: Right to Bottom */}
          <path
            d="M 78% 58% Q 65% 65% 50% 82%"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeDasharray="8 4"
            markerEnd="url(#arrowhead)"
            className="animate-dash"
            style={{ animationDelay: '0.5s' }}
          />
          
          {/* Connector: Bottom to Left */}
          <path
            d="M 50% 82% Q 35% 65% 22% 58%"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeDasharray="8 4"
            markerEnd="url(#arrowhead)"
            className="animate-dash"
            style={{ animationDelay: '1s' }}
          />
          
          {/* Connector: Left to Top */}
          <path
            d="M 22% 42% Q 35% 35% 50% 18%"
            fill="none"
            stroke="black"
            strokeWidth="3"
            strokeDasharray="8 4"
            markerEnd="url(#arrowhead)"
            className="animate-dash"
            style={{ animationDelay: '1.5s' }}
          />
        </svg>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6">
        {/* Don't Show Again Checkbox */}
        {isRegisteredUser && (
          <label 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleDontShowAgainChange(!dontShowAgain)}
          >
            <div className="flex items-center gap-2">
              {dontShowAgain ? (
                <CheckSquare className="w-6 h-6 text-smirkleMint" />
              ) : (
                <Square className="w-6 h-6 text-white" />
              )}
              <span className="text-white font-bold text-sm uppercase tracking-wide">
                Don't show again
              </span>
            </div>
          </label>
        )}

        {/* Start Button */}
        <button
          onClick={handleClose}
          className="neo-button text-xl px-12 py-4 flex items-center gap-3"
        >
          <Play className="w-6 h-6" />
          START GAME
        </button>

        {/* Demo Fail Button (for testing) */}
        <button
          onClick={triggerFailState}
          className="text-xs text-gray-500 hover:text-smirkleRed underline"
        >
          (Demo: Trigger Fail)
        </button>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes dash {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-dash {
          animation: dash 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default TutorialOverlay;

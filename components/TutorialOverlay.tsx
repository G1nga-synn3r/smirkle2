/**
 * TutorialOverlay Component
 * Displays a tutorial for new players explaining how to play Smirkle
 */

'use client';

import { useState } from 'react';
import { Play, X, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isRegisteredUser: boolean;
  onSavePreference: (showAgain: boolean) => void;
}

export function TutorialOverlay({
  isOpen,
  onClose,
  isRegisteredUser,
  onSavePreference,
}: TutorialOverlayProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Welcome to SMIRKLE2!',
      content: 'The ultimate "Don\'t Laugh" challenge. Can you keep a poker face while watching hilarious videos?',
      icon: '🎭',
    },
    {
      title: 'How It Works',
      content: 'Watch the video and try NOT to smile or laugh. If you smile or close your eyes, you lose instantly!',
      icon: '🎬',
    },
    {
      title: 'Scoring',
      content: 'Earn +27 points for every second you survive without smiling. The longer you last, the higher your score!',
      icon: '⭐',
    },
    {
      title: 'Face Detection',
      content: 'Our AI detects your facial expressions using your camera. Keep a straight face to maximize your score!',
      icon: '📷',
    },
    {
      title: 'Leaderboards & Progression',
      content: 'Create an account to save your high scores, compete on leaderboards, and earn badges as you improve!',
      icon: '🏆',
    },
  ];

  const handleClose = () => {
    if (isRegisteredUser) {
      onSavePreference(dontShowAgain);
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="neo-card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-black">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-[#00FF9C] glow-mint">
            Tutorial
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#FF003C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tutorial Content */}
        <div className="space-y-6">
          {/* Icon */}
          <div className="text-center text-6xl mb-4">
            {tutorialSteps[currentStep].icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center">
            {tutorialSteps[currentStep].title}
          </h3>

          {/* Content */}
          <p className="text-gray-300 text-center leading-relaxed">
            {tutorialSteps[currentStep].content}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentStep ? "bg-[#00FF9C]" : "bg-gray-600 hover:bg-gray-500"
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t-4 border-black space-y-4">
          {/* Do Not Show Again - Only for registered users */}
          {isRegisteredUser && (
            <label className="flex items-center gap-3 cursor-pointer justify-center">
              <button
                onClick={() => setDontShowAgain(!dontShowAgain)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {dontShowAgain ? (
                  <CheckSquare className="w-5 h-5 text-[#00FF9C]" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
                Do Not Show Again
              </button>
            </label>
          )}

          {/* Start Button */}
          <button
            onClick={handleNext}
            className="neo-button w-full"
          >
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                Next
                <Play className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Start Playing
                <Play className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;

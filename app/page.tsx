'use client';

import { useState, useEffect } from 'react';
import { GameInterface } from '@/components/GameInterface';
import { Navigation } from '@/components/Navigation';
import { AuthModal } from '@/components/AuthModal';
import { LiabilityNotice } from '@/components/LiabilityNotice';
import { signInAsGuest, createGuestProfile, registerUser, loginUser, onAuthChange, getUserProfile } from '@/lib/firebase';
import type { User, NavSection, UserProfile, AuthState } from '@/lib/types';

export default function Home() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // UI state
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLiabilityNotice, setShowLiabilityNotice] = useState(false);
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setAuthState({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            username: firebaseUser.displayName || 'Guest',
            dateOfBirth: null,
            isGuest: profile?.isGuest ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        setUserProfile(profile);
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle guest login
  const handleGuestLogin = async (username: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { user } = await signInAsGuest();
      
      if (user) {
        const profile = await createGuestProfile(user.uid, username);
        setUserProfile(profile);
      }
      
      setShowLiabilityNotice(true);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Guest login failed' 
      }));
    }
  };

  // Handle registration
  const handleRegister = async (email: string, password: string, username: string, dob: Date) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await registerUser(email, password, username, dob);
      setShowLiabilityNotice(true);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }));
      throw error;
    }
  };

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await loginUser(email, password);
      setShowLiabilityNotice(true);
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
      throw error;
    }
  };

  // Handle liability acceptance
  const handleLiabilityAccept = () => {
    setLiabilityAccepted(true);
    setShowLiabilityNotice(false);
  };

  const handleLiabilityDecline = () => {
    setLiabilityAccepted(false);
    setShowLiabilityNotice(false);
    // Show auth modal again if declined
    setShowAuthModal(true);
  };

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated && !showLiabilityNotice) {
      setShowAuthModal(true);
    }
  }, [authState.isLoading, authState.isAuthenticated, showLiabilityNotice]);

  // Show loading screen
  if (authState.isLoading) {
    return (
      <div className="fixed inset-0 bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black text-[#00FF9C] glow-mint mb-4">
            SMIRKLE2
          </div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#080808] overflow-hidden">
      {/* Main Content */}
      <div className="h-full pb-20">
        {activeSection === 'home' && (
          <div className="h-full flex flex-col items-center justify-center p-8">
            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-black text-[#00FF9C] glow-mint text-center mb-8">
              SMIRKLE2
            </h1>
            <p className="text-xl text-gray-300 text-center mb-8 max-w-md">
              The ultimate "Don't Laugh" challenge. 
              Keep a poker face while watching videos!
            </p>
            
            {/* Play Button */}
            <button
              onClick={() => setActiveSection('play')}
              className="neo-button text-xl px-12 py-4"
            >
              START GAME
            </button>
            
            {/* User Info */}
            {userProfile && (
              <div className="mt-8 text-center">
                <p className="text-gray-400">Playing as</p>
                <p className="text-[#00FF9C] font-bold text-xl">{userProfile.username}</p>
                <p className="text-gray-500 text-sm">
                  Level {userProfile.level} • {userProfile.lifetimeScore.toLocaleString()} pts
                </p>
              </div>
            )}
          </div>
        )}

        {activeSection === 'play' && (
          <GameInterface 
            userId={authState.user?.id}
            onScoreUpdate={(score) => {
              // Could save score periodically
            }}
            onGameEnd={(score) => {
              console.log('Game ended with score:', score);
            }}
          />
        )}

        {activeSection === 'leaderboard' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="neo-card max-w-lg w-full">
              <h2 className="text-3xl font-black text-center mb-6 text-[#00FF9C] glow-mint">
                LEADERBOARD
              </h2>
              
              {/* Zebra-stripe table */}
              <div className="border-4 border-[#00FF9C]">
                {/* Header row */}
                <div className="flex bg-[#1a1a1a] border-b-4 border-[#00FF9C] p-4">
                  <span className="w-16 text-gray-400 font-bold text-sm">RANK</span>
                  <span className="flex-1 text-gray-400 font-bold text-sm">PLAYER</span>
                  <span className="w-32 text-right text-gray-400 font-bold text-sm">SCORE</span>
                </div>
                
                {/* Data rows with zebra striping */}
                {[
                  { rank: 1, player: 'Player1', score: 98450 },
                  { rank: 2, player: 'Player2', score: 87230 },
                  { rank: 3, player: 'Player3', score: 76120 },
                  { rank: 4, player: 'Player4', score: 65400 },
                  { rank: 5, player: 'Player5', score: 52890 },
                ].map((entry, index) => (
                  <div 
                    key={entry.rank}
                    className={`flex p-4 ${
                      index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#252525]'
                    } ${index !== 4 ? 'border-b-4 border-[#00FF9C]' : ''}`}
                  >
                    <span className="w-16 font-black text-lg">
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                    </span>
                    <span className="flex-1 font-bold text-white">{entry.player}</span>
                    <span className="w-32 text-right font-black text-[#00FF9C]">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="neo-card max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6">Profile</h2>
              {userProfile ? (
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-black border-4 border-gray-700">
                    <span className="text-gray-400">Username</span>
                    <span className="font-bold">{userProfile.username}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-black border-4 border-gray-700">
                    <span className="text-gray-400">Level</span>
                    <span className="font-bold text-[#00FF9C]">{userProfile.level}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-black border-4 border-gray-700">
                    <span className="text-gray-400">High Score</span>
                    <span className="font-bold">{userProfile.highScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-black border-4 border-gray-700">
                    <span className="text-gray-400">Lifetime Points</span>
                    <span className="font-bold">{userProfile.lifetimeScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-black border-4 border-gray-700">
                    <span className="text-gray-400">Badges</span>
                    <span className="font-bold">{userProfile.badges.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center">
                  Sign in to view your profile
                </p>
              )}
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="neo-card max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6">Settings</h2>
              <div className="space-y-4">
                <button className="neo-button w-full justify-start">
                  Camera Settings
                </button>
                <button className="neo-button w-full justify-start">
                  Audio Settings
                </button>
                <button className="neo-button neo-button--outline w-full justify-start">
                  Privacy Policy
                </button>
                <button className="neo-button neo-button--outline w-full justify-start">
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'achievements' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="neo-card max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6">Achievements</h2>
              {userProfile && userProfile.badges.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.badges.map((badge) => (
                    <div 
                      key={badge.id} 
                      className="flex items-center gap-3 p-3 bg-black border-4 border-[#00FF9C]"
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <p className="font-bold">{badge.name}</p>
                        <p className="text-xs text-gray-400">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center">
                  Play more to unlock achievements!
                </p>
              )}
            </div>
          </div>
        )}

        {activeSection === 'help' && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="neo-card max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6">How to Play</h2>
              <div className="space-y-4 text-gray-300">
                <p><strong className="text-[#00FF9C]">1.</strong> Allow camera access when prompted</p>
                <p><strong className="text-[#00FF9C]">2.</strong> Position your face in the camera</p>
                <p><strong className="text-[#00FF9C]">3.</strong> Wait for the "Ready" indicator</p>
                <p><strong className="text-[#00FF9C]">4.</strong> Press Start and watch the video</p>
                <p><strong className="text-[#00FF9C]">5.</strong> Don't smile or close your eyes!</p>
                <p><strong className="text-[#00FF9C]">6.</strong> Earn +27 points per second</p>
              </div>
              <div className="mt-6 p-4 bg-black border-4 border-[#FF003C]">
                <p className="text-sm text-gray-400">
                  <strong className="text-[#FF003C]">Warning:</strong> This game uses facial recognition. 
                  If you smile or close your eyes, you lose immediately!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <Navigation 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestLogin={handleGuestLogin}
        onRegister={handleRegister}
        onLogin={handleLogin}
        authState={authState}
      />

      {/* Liability Notice */}
      <LiabilityNotice
        isOpen={showLiabilityNotice}
        onAccept={handleLiabilityAccept}
        onDecline={handleLiabilityDecline}
      />
    </div>
  );
}

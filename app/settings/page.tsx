'use client';

import { useState } from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Moon, 
  Sun,
  Vibrate,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserSettings } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    hapticFeedback: true,
    volume: 80,
    videoQuality: 'auto',
    darkMode: true,
  });
  const [saved, setSaved] = useState(false);

  const handleHapticToggle = () => {
    setSettings(prev => ({ ...prev, hapticFeedback: !prev.hapticFeedback }));
    showSaved();
  };

  const handleVolumeChange = (value: number) => {
    setSettings(prev => ({ ...prev, volume: value }));
  };

  const handleMuteToggle = () => {
    setSettings(prev => ({ 
      ...prev, 
      volume: prev.volume === 0 ? 80 : 0 
    }));
    showSaved();
  };

  const handleQualityChange = (quality: UserSettings['videoQuality']) => {
    setSettings(prev => ({ ...prev, videoQuality: quality }));
    showSaved();
  };

  const handleDarkModeToggle = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const volumePercent = settings.volume;

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint flex items-center justify-center gap-3">
          <Settings className="w-8 h-8" />
          SETTINGS
        </h1>
        {saved && (
          <div className="mt-2 inline-flex items-center gap-1 text-green-500 text-sm">
            <Check className="w-4 h-4" />
            Settings saved!
          </div>
        )}
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Haptic Feedback */}
        <div className="neo-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className={cn(
                "w-6 h-6",
                settings.hapticFeedback ? "text-[#00FF9C]" : "text-gray-500"
              )} />
              <div>
                <div className="font-bold">Haptic Feedback</div>
                <div className="text-sm text-gray-400">Vibrate on game events</div>
              </div>
            </div>
            <button
              onClick={handleHapticToggle}
              className={cn(
                "w-16 h-8 border-2 border-black transition-all duration-200",
                settings.hapticFeedback ? "bg-[#00FF9C]" : "bg-[#1a1a1a]"
              )}
            >
              <div className={cn(
                "w-6 h-6 bg-white border-2 border-black transition-transform duration-200",
                settings.hapticFeedback ? "translate-x-8" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>

        {/* Volume */}
        <div className="neo-card">
          <div className="flex items-center gap-3 mb-4">
            {settings.volume === 0 ? (
              <VolumeX className="w-6 h-6 text-gray-500" />
            ) : (
              <Volume2 className="w-6 h-6 text-[#00FF9C]" />
            )}
            <div>
              <div className="font-bold">Volume</div>
              <div className="text-sm text-gray-400">Game sound effects</div>
            </div>
            <button
              onClick={handleMuteToggle}
              className="ml-auto neo-button py-1 px-3 text-sm"
            >
              {settings.volume === 0 ? 'Unmute' : 'Mute'}
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-[#1a1a1a] border-2 border-black appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00FF9C 0%, #00FF9C ${volumePercent}%, #1a1a1a ${volumePercent}%, #1a1a1a 100%)`
              }}
            />
            <div className="w-12 text-right font-bold text-[#00FF9C]">{settings.volume}%</div>
          </div>
        </div>

        {/* Video Quality */}
        <div className="neo-card">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="w-6 h-6 text-[#00FF9C]" />
            <div>
              <div className="font-bold">Video Quality</div>
              <div className="text-sm text-gray-400">Quality of gameplay videos</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {(['low', 'medium', 'high', 'auto'] as const).map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                className={cn(
                  "py-3 px-4 font-bold uppercase tracking-wider border-2 border-black transition-all",
                  settings.videoQuality === quality
                    ? "bg-[#00FF9C] text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:bg-[#00FF9C]/20"
                )}
              >
                {quality}
              </button>
            ))}
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            {settings.videoQuality === 'auto' && 'Auto adjusts based on your connection'}
            {settings.videoQuality === 'low' && 'Best for slow connections'}
            {settings.videoQuality === 'medium' && 'Balanced quality and performance'}
            {settings.videoQuality === 'high' && 'Best quality, uses more data'}
          </div>
        </div>

        {/* Dark Mode */}
        <div className="neo-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-6 h-6 text-[#00FF9C]" />
              ) : (
                <Sun className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <div className="font-bold">Dark Mode</div>
                <div className="text-sm text-gray-400">Easier on the eyes</div>
              </div>
            </div>
            <button
              onClick={handleDarkModeToggle}
              className={cn(
                "w-16 h-8 border-2 border-black transition-all duration-200",
                settings.darkMode ? "bg-[#00FF9C]" : "bg-yellow-500"
              )}
            >
              <div className={cn(
                "w-6 h-6 bg-white border-2 border-black transition-transform duration-200",
                settings.darkMode ? "translate-x-8" : "translate-x-0"
              )} />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="neo-card mt-6">
          <h3 className="font-bold text-gray-400 mb-3">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Build</span>
              <span>2024.01.15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

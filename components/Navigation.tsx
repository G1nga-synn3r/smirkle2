/**
 * Navigation Component
 * 7 floating hexagon navigation items at the bottom of the screen
 */

'use client';

import { useState } from 'react';
import { 
  Home, 
  Play, 
  Trophy, 
  User, 
  Settings, 
  Award, 
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavSection, NavItem } from '@/lib/types';

interface NavigationProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  isVisible?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'play', label: 'Play', icon: 'play', path: '/play' },
  { id: 'leaderboard', label: 'Rank', icon: 'trophy', path: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
  { id: 'achievements', label: 'Badges', icon: 'award', path: '/achievements' },
  { id: 'help', label: 'Help', icon: 'help-circle', path: '/help' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  play: Play,
  trophy: Trophy,
  user: User,
  settings: Settings,
  award: Award,
  'help-circle': HelpCircle,
};

// Hexagon shape using clip-path
const hexShape = {
  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
};

export function Navigation({ activeSection, onSectionChange, isVisible = true }: NavigationProps) {
  if (!isVisible) return null;

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-40">
      {/* Floating Hexagon Navigation */}
      <div className="flex items-end justify-center gap-2 px-2">
        {NAV_ITEMS.map((item, index) => {
          const Icon = iconMap[item.icon];
          const isActive = activeSection === item.id;
          
          return (
            <FloatingHexagon
              key={item.id}
              isActive={isActive}
              onClick={() => onSectionChange(item.id)}
              label={item.label}
              index={index}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-black" : "text-[#00FF9C]")} />
            </FloatingHexagon>
          );
        })}
      </div>
    </nav>
  );
}

// Floating Hexagon Component
interface FloatingHexagonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  label: string;
  index: number;
}

function FloatingHexagon({ children, isActive, onClick, label, index }: FloatingHexagonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Different floating animation delays for each hexagon
  const animationDelay = `${index * 0.15}s`;

  return (
    <div 
      className="relative flex flex-col items-center"
      style={{ animationDelay }}
    >
      {/* Tooltip Label */}
      <div 
        className={cn(
          "absolute -top-10 transition-all duration-300 whitespace-nowrap",
          isHovered || isActive 
            ? "opacity-100 transform -translate-y-0" 
            : "opacity-0 transform -translate-y-2"
        )}
      >
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded",
          isActive 
            ? "bg-[#00FF9C] text-black" 
            : "bg-[#FF003C] text-white"
        )}>
          {label}
        </span>
      </div>

      {/* Floating Hexagon Button */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative w-14 h-14 transition-all duration-300 hover:scale-110",
          // Hexagon shape
          "flex items-center justify-center",
          isActive || isHovered 
            ? "animate-float" 
            : "animate-float-slow"
        )}
        style={hexShape}
      >
        {/* Hexagon Background */}
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-300",
            isActive 
              ? "bg-[#00FF9C]" 
              : isHovered 
                ? "bg-[#FF003C]" 
                : "bg-black"
          )}
          style={hexShape}
        />
        
        {/* Hexagon Border */}
        <div 
          className={cn(
            "absolute inset-0 border-2 transition-all duration-300",
            isActive 
              ? "border-[#00FF9C]" 
              : isHovered 
                ? "border-[#FF003C]" 
                : "border-[#00FF9C]/50"
          )}
          style={hexShape}
        />

        {/* Glow Effect */}
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-300 blur-md",
            isActive 
              ? "bg-[#00FF9C]/50" 
              : isHovered 
                ? "bg-[#FF003C]/50" 
                : "bg-transparent"
          )}
          style={hexShape}
        />

        {/* Icon Container */}
        <div className="relative z-10">
          {children}
        </div>
      </button>

      {/* Floating particles effect for active state */}
      {isActive && (
        <>
          <div 
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#00FF9C] rounded-full animate-ping"
            style={{ animationDuration: '1s' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-[#00FF9C] rounded-full animate-ping"
            style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}
          />
        </>
      )}
    </div>
  );
}

export default Navigation;

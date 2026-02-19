/**
 * Smirkle2 Utility Functions
 * Helper functions for validation, formatting, and calculations
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  PASSWORD_REQUIREMENTS,
  MINIMUM_AGE,
  LEVEL_THRESHOLD,
  LEVEL_TITLES,
  POINTS_PER_SECOND,
  type LevelInfo,
  type ValidationError,
} from './types';

/**
 * Merge Tailwind classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate level from total points
 */
export function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / LEVEL_THRESHOLD) + 1;
}

/**
 * Get level information with progress
 */
export function getLevelInfo(totalPoints: number): LevelInfo {
  const level = calculateLevel(totalPoints);
  const currentLevelPoints = (level - 1) * LEVEL_THRESHOLD;
  const nextLevelPoints = level * LEVEL_THRESHOLD;
  const pointsInCurrentLevel = totalPoints - currentLevelPoints;
  const pointsToNextLevel = nextLevelPoints - totalPoints;
  const progress = (pointsInCurrentLevel / LEVEL_THRESHOLD) * 100;

  return {
    level,
    title: getLevelTitle(level),
    pointsRequired: currentLevelPoints,
    pointsToNextLevel,
    progress,
  };
}

/**
 * Get level title from level number
 */
export function getLevelTitle(level: number): string {
  // Find the highest level title that the user qualifies for
  const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  
  for (const lvl of levels) {
    if (level >= lvl) {
      return LEVEL_TITLES[lvl];
    }
  }
  
  return `Level ${level}`;
}

/**
 * Validate password against requirements
 */
export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`,
    });
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }

  if (PASSWORD_REQUIREMENTS.requireSpecial) {
    const hasSpecial = PASSWORD_REQUIREMENTS.specialChars
      .split('')
      .some(char => password.includes(char));
    
    if (!hasSpecial) {
      errors.push({
        field: 'password',
        message: `Password must contain at least one special character (${PASSWORD_REQUIREMENTS.specialChars})`,
      });
    }
  }

  return errors;
}

/**
 * Validate age is 14 or older
 */
export function validateAge(dateOfBirth: Date): boolean {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= MINIMUM_AGE;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Generate YouTube embed URL
 */
export function getYoutubeEmbedUrl(videoId: string, autoplay: boolean = true): string {
  const baseUrl = 'https://www.youtube.com/embed';
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    rel: '0',
    showinfo: '0',
    modestbranding: '1',
  });
  
  return `${baseUrl}/${videoId}?${params.toString()}`;
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Calculate score from elapsed time
 */
export function calculateScore(elapsedSeconds: number): number {
  return Math.floor(elapsedSeconds * POINTS_PER_SECOND);
}

/**
 * Format score with suffix (K, M, B)
 */
export function formatScore(score: number): string {
  if (score >= 1_000_000_000) {
    return `${(score / 1_000_000_000).toFixed(1)}B`;
  }
  if (score >= 1_000_000) {
    return `${(score / 1_000_000).toFixed(1)}M`;
  }
  if (score >= 1_000) {
    return `${(score / 1_000).toFixed(1)}K`;
  }
  return score.toString();
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if camera is available
 */
export async function checkCameraAvailability(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Get random video from predefined list
 */
export function getRandomVideo(videos: string[]): string {
  return videos[Math.floor(Math.random() * videos.length)];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username format
 */
export function validateUsername(username: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (username.length < 3) {
    errors.push({
      field: 'username',
      message: 'Username must be at least 3 characters',
    });
  }
  
  if (username.length > 20) {
    errors.push({
      field: 'username',
      message: 'Username must be at most 20 characters',
    });
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push({
      field: 'username',
      message: 'Username can only contain letters, numbers, and underscores',
    });
  }
  
  return errors;
}

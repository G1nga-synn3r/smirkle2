/**
 * Smirkle2 TypeScript Type Definitions
 * Comprehensive type definitions for the Don't Laugh challenge application
 */

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User {
  id: string;
  email?: string;
  username: string;
  dateOfBirth: Date | null;
  isGuest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  lifetimeScore: number;
  highScore: number;
  level: number;
  badges: Badge[];
  isGuest: boolean;
  createdAt: Date;
  skipTutorial?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface GuestAuthData {
  confirmedAge: boolean;
  agreedToTerms: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  dateOfBirth: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================
// GAME & SCORING TYPES
// ============================================

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  currentScore: number;
  sessionStartTime: number | null;
  videoId: string | null;
  failReason: FailReason | null;
}

export interface GameSession {
  id: string;
  userId: string;
  videoId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  completed: boolean;
  failReason?: FailReason;
}

export type FailReason = 'smiley_detected' | 'eyes_closed' | 'no_face_detected' | 'camera_disconnected';

export const POINTS_PER_SECOND = 27;
export const LEVEL_THRESHOLD = 388800;

// ============================================
// PROGRESSION & BADGES TYPES
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  levelRequirement: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  pointsRequired: number;
  pointsToNextLevel: number;
  progress: number;
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'poker_facer',
    name: 'Poker Facer',
    description: 'Complete your first game without smiling',
    icon: '🎭',
    levelRequirement: 1,
  },
  {
    id: 'stone_cold',
    name: 'Stone Cold',
    description: 'Reach 10,000 lifetime points',
    icon: '🗿',
    levelRequirement: 2,
  },
  {
    id: 'the_guarded',
    name: 'The Guarded',
    description: 'Reach 50,000 lifetime points',
    icon: '🛡️',
    levelRequirement: 3,
  },
  {
    id: 'why_so_serious',
    name: 'Why So Serious?',
    description: 'Reach 100,000 lifetime points',
    icon: '🤡',
    levelRequirement: 15,
  },
  {
    id: 'emotionless_master',
    name: 'Emotionless Master',
    description: 'Reach 500,000 lifetime points',
    icon: '🎯',
    levelRequirement: 45,
  },
  {
    id: 'deadpan_legend',
    name: 'Deadpan Legend',
    description: 'Reach 1,000,000 lifetime points',
    icon: '👑',
    levelRequirement: 90,
  },
  {
    id: 'no_laugh_matter',
    name: "No Laugh Matter",
    description: 'Reach 2,000,000 lifetime points',
    icon: '🏆',
    levelRequirement: 180,
  },
];

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Poker Facer',
  2: 'Stone Cold',
  3: 'The Guarded',
  4: 'Unshakeable',
  5: 'Cool Customer',
  10: 'Ice Breaker',
  15: 'Why So Serious?',
  20: 'Emotionless Warrior',
  30: 'Deadpan Pro',
  45: 'Emotionless Master',
  60: 'Stoic Sage',
  90: 'Deadpan Legend',
  120: 'No Laugh Master',
  180: 'No Laugh Matter',
};

// ============================================
// FACE DETECTION TYPES
// ============================================

export interface FaceDetectionResult {
  isSmiling: boolean;
  eyesOpen: boolean;
  faceDetected: boolean;
  smileProbability: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  detectionTimestamp: number;
}

export interface FaceDetectionConfig {
  minFaceDetectionConfidence: number;
  minSmileProbability: number;
  minEyeOpenProbability: number;
  detectionInterval: number;
}

export const DEFAULT_FACE_DETECTION_CONFIG: FaceDetectionConfig = {
  minFaceDetectionConfidence: 0.5,
  minSmileProbability: 0.5,
  minEyeOpenProbability: 0.5,
  detectionInterval: 100,
};

export const SMILE_THRESHOLD = 0.5;
export const EYE_OPEN_THRESHOLD = 0.5;

// ============================================
// NAVIGATION TYPES
// ============================================

export type NavSection = 
  | 'home' 
  | 'leaderboards' 
  | 'search' 
  | 'profile' 
  | 'friends' 
  | 'submit' 
  | 'settings';

export interface NavItem {
  id: NavSection;
  label: string;
  icon: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/' },
  { id: 'leaderboards', label: 'Leaderboards', icon: 'trophy', path: '/leaderboards' },
  { id: 'search', label: 'Search', icon: 'search', path: '/search' },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile' },
  { id: 'friends', label: 'Friends', icon: 'users', path: '/friends' },
  { id: 'submit', label: 'Submit', icon: 'upload', path: '/submit' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
];

// ============================================
// PROFILE TYPES
// ============================================

export type VisibilitySetting = 'public' | 'friends' | 'private';

export interface UserProfileDetails {
  fullName: string;
  birthdate: Date | null;
  avatar: string;
  slogan: string;
  location: string;
  visibility: {
    fullName: VisibilitySetting;
    birthdate: VisibilitySetting;
    avatar: VisibilitySetting;
    slogan: VisibilitySetting;
    location: VisibilitySetting;
  };
}

export interface ProfileField {
  key: keyof UserProfileDetails;
  label: string;
  editable: boolean;
  type: 'text' | 'date' | 'image';
}

export const PROFILE_FIELDS: ProfileField[] = [
  { key: 'fullName', label: 'Full Name', editable: true, type: 'text' },
  { key: 'birthdate', label: 'Birthdate', editable: true, type: 'date' },
  { key: 'avatar', label: 'Profile Picture', editable: true, type: 'image' },
  { key: 'slogan', label: 'Slogan', editable: true, type: 'text' },
  { key: 'location', label: 'Location', editable: true, type: 'text' },
];

// ============================================
// FRIENDS TYPES
// ============================================

export type FriendStatus = 'none' | 'pending' | 'friends';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Friend {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  addedAt: Date;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface UserSettings {
  hapticFeedback: boolean;
  volume: number;
  videoQuality: 'low' | 'medium' | 'high' | 'auto';
  darkMode: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  hapticFeedback: true,
  volume: 80,
  videoQuality: 'auto',
  darkMode: true,
};

// ============================================
// VIDEO SUBMISSION TYPES
// ============================================

export interface VideoSubmission {
  id: string;
  userId: string;
  youtubeUrl: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
}

// ============================================
// VIDEO & CONTENT TYPES
// ============================================

export interface VideoContent {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  expectedDuration: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  highScore: number;
  avatar?: string;
}

export type LeaderboardType = 'high_scores' | 'lifetime';

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

// ============================================
// ERROR & VALIDATION TYPES
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export const MINIMUM_AGE = 14;

// ============================================
// GAME CONFIGURATION
// ============================================

export interface GameConfig {
  pointsPerSecond: number;
  levelThreshold: number;
  smileThreshold: number;
  eyeOpenThreshold: number;
  detectionInterval: number;
  videoUrlBase: string;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  pointsPerSecond: POINTS_PER_SECOND,
  levelThreshold: LEVEL_THRESHOLD,
  smileThreshold: SMILE_THRESHOLD,
  eyeOpenThreshold: EYE_OPEN_THRESHOLD,
  detectionInterval: DEFAULT_FACE_DETECTION_CONFIG.detectionInterval,
  videoUrlBase: 'https://www.youtube.com/embed',
};

// ============================================
// LIABILITY & SAFETY TYPES
// ============================================

export interface LiabilityInfo {
  cameraAccess: boolean;
  dataStorage: string;
  thirdPartySharing: boolean;
  ageRestriction: number;
  lastUpdated: Date;
}

export const LIABILITY_NOTICE = {
  title: 'Camera Privacy & Safety Notice',
  cameraAccess: 'This application requires access to your front-facing camera to detect facial expressions.',
  dataStorage: 'Facial detection data is processed locally and is not stored on any servers.',
  thirdPartySharing: 'We do not share any facial data with third parties.',
  ageRestriction: 'This application is intended for users aged 14 and older.',
  disclaimer: 'By using this application, you acknowledge that you understand the camera requirements and agree to use the application responsibly.',
};

/**
 * Smirkle2 Firebase Configuration
 * Firebase initialization and service exports
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  DocumentData
} from 'firebase/firestore';
import type { User, UserProfile, GameSession, LeaderboardEntry, Badge, BADGE_DEFINITIONS } from './types';

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'smirkle2-demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'smirkle2-demo',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'smirkle2-demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  
  return { app, auth, db };
}

// Initialize on module load
({ app, auth, db } = initializeFirebase());

// ============================================
// AUTHENTICATION SERVICES
// ============================================

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string, 
  password: string, 
  username: string,
  dateOfBirth: Date,
  firstName?: string,
  lastName?: string
): Promise<{ user: FirebaseUser; profile: UserProfile }> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  // Update display name
  await updateProfile(firebaseUser, {
    displayName: username,
  });
  
  // Create user profile in Firestore
  const profile: UserProfile = {
    id: firebaseUser.uid,
    username,
    lifetimeScore: 0,
    highScore: 0,
    level: 1,
    badges: [],
    isGuest: false,
    createdAt: new Date(),
  };
  
  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...profile,
    firstName: firstName || '',
    lastName: lastName || '',
    createdAt: serverTimestamp(),
    dateOfBirth: dateOfBirth.toISOString(),
  });
  
  return { user: firebaseUser, profile };
}

/**
 * Sign in with email and password
 */
export async function loginUser(
  email: string, 
  password: string
): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
  const googleProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, googleProvider);
  const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
  return { user: result.user, isNewUser };
}

/**
 * Create or update user profile after Google sign-in
 */
export async function createOrUpdateGoogleUserProfile(
  userId: string,
  username: string,
  firstName?: string,
  lastName?: string
): Promise<UserProfile> {
  const existingProfile = await getUserProfile(userId);
  
  if (existingProfile) {
    return existingProfile;
  }

  const profile: UserProfile = {
    id: userId,
    username,
    lifetimeScore: 0,
    highScore: 0,
    level: 1,
    badges: [],
    isGuest: false,
    createdAt: new Date(),
  };
  
  await setDoc(doc(db, 'users', userId), {
    ...profile,
    firstName: firstName || '',
    lastName: lastName || '',
    createdAt: serverTimestamp(),
  });
  
  return profile;
}

/**
 * Sign in as guest
 */
export async function signInAsGuest(): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
  const result = await signInAnonymously(auth);
  // Check if this is a new user by comparing creation time with last sign-in time
  const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
  return { 
    user: result.user, 
    isNewUser 
  };
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Get current auth state listener
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: data.id,
      username: data.username,
      avatar: data.avatar,
      lifetimeScore: data.lifetimeScore || 0,
      highScore: data.highScore || 0,
      level: data.level || 1,
      badges: data.badges || [],
      isGuest: data.isGuest ?? false,
      createdAt: data.createdAt?.toDate() || new Date(),
      skipTutorial: data.skipTutorial ?? false,
    };
  }
  
  return null;
}

/**
 * Create or update guest profile
 */
export async function createGuestProfile(userId: string, username: string): Promise<UserProfile> {
  const profile: UserProfile = {
    id: userId,
    username,
    lifetimeScore: 0,
    highScore: 0,
    level: 1,
    badges: [],
    isGuest: true,
    createdAt: new Date(),
  };
  
  await setDoc(doc(db, 'users', userId), {
    ...profile,
    createdAt: serverTimestamp(),
  });
  
  return profile;
}

// ============================================
// GAME SERVICES
// ============================================

/**
 * Save game session to Firestore
 */
export async function saveGameSession(
  userId: string,
  session: Omit<GameSession, 'id'>
): Promise<string> {
  const sessionsRef = collection(db, 'sessions');
  const sessionDoc = doc(sessionsRef);
  
  await setDoc(sessionDoc, {
    ...session,
    userId,
    startTime: serverTimestamp(),
    endTime: session.endTime ? serverTimestamp() : undefined,
  });
  
  return sessionDoc.id;
}

/**
 * Update user scores after game
 */
export async function updateUserScores(
  userId: string,
  sessionScore: number
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return;
  
  const userData = userDoc.data();
  const newLifetimeScore = (userData.lifetimeScore || 0) + sessionScore;
  const newHighScore = Math.max(userData.highScore || 0, sessionScore);
  const newLevel = Math.floor(newLifetimeScore / 388800) + 1;
  
  await updateDoc(userRef, {
    lifetimeScore: newLifetimeScore,
    highScore: newHighScore,
    level: newLevel,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check and award badges
 */
export async function checkAndAwardBadges(
  userId: string,
  lifetimeScore: number
): Promise<Badge[]> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return [];
  
  const userData = userDoc.data();
  const currentBadges: Badge[] = userData.badges || [];
  const currentBadgeIds = currentBadges.map(b => b.id);
  
  // Badge definitions based on score thresholds
  const badgeCriteria = [
    { id: 'poker_facer', minScore: 0 },
    { id: 'stone_cold', minScore: 10000 },
    { id: 'the_guarded', minScore: 50000 },
    { id: 'why_so_serious', minScore: 100000 },
    { id: 'emotionless_master', minScore: 500000 },
    { id: 'deadpan_legend', minScore: 1000000 },
    { id: 'no_laugh_matter', minScore: 2000000 },
  ];
  
  const newBadges: Badge[] = [];
  
  for (const criteria of badgeCriteria) {
    if (lifetimeScore >= criteria.minScore && !currentBadgeIds.includes(criteria.id)) {
      const badgeDef = badgeCriteria.find(b => b.id === criteria.id);
      if (badgeDef) {
        newBadges.push({
          id: badgeDef.id,
          name: getBadgeName(badgeDef.id),
          description: getBadgeDescription(badgeDef.id),
          icon: getBadgeIcon(badgeDef.id),
          unlockedAt: new Date(),
          levelRequirement: getBadgeLevel(badgeDef.id),
        });
      }
    }
  }
  
  if (newBadges.length > 0) {
    const updatedBadges = [...currentBadges, ...newBadges];
    await updateDoc(userRef, {
      badges: updatedBadges,
      updatedAt: serverTimestamp(),
    });
  }
  
  return newBadges;
}

function getBadgeName(id: string): string {
  const names: Record<string, string> = {
    poker_facer: 'Poker Facer',
    stone_cold: 'Stone Cold',
    the_guarded: 'The Guarded',
    why_so_serious: 'Why So Serious?',
    emotionless_master: 'Emotionless Master',
    deadpan_legend: 'Deadpan Legend',
    no_laugh_matter: 'No Laugh Matter',
  };
  return names[id] || id;
}

function getBadgeDescription(id: string): string {
  const descriptions: Record<string, string> = {
    poker_facer: 'Complete your first game without smiling',
    stone_cold: 'Reach 10,000 lifetime points',
    the_guarded: 'Reach 50,000 lifetime points',
    why_so_serious: 'Reach 100,000 lifetime points',
    emotionless_master: 'Reach 500,000 lifetime points',
    deadpan_legend: 'Reach 1,000,000 lifetime points',
    no_laugh_matter: 'Reach 2,000,000 lifetime points',
  };
  return descriptions[id] || '';
}

function getBadgeIcon(id: string): string {
  const icons: Record<string, string> = {
    poker_facer: '🎭',
    stone_cold: '🗿',
    the_guarded: '🛡️',
    why_so_serious: '🤡',
    emotionless_master: '🎯',
    deadpan_legend: '👑',
    no_laugh_matter: '🏆',
  };
  return icons[id] || '🏅';
}

function getBadgeLevel(id: string): number {
  const levels: Record<string, number> = {
    poker_facer: 1,
    stone_cold: 2,
    the_guarded: 3,
    why_so_serious: 15,
    emotionless_master: 45,
    deadpan_legend: 90,
    no_laugh_matter: 180,
  };
  return levels[id] || 1;
}

// ============================================
// LEADERBOARD SERVICES
// ============================================

/**
 * Get high score leaderboard
 */
export async function getHighScoreLeaderboard(
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('highScore', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];
  
  let rank = 1;
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    leaderboard.push({
      rank,
      userId: data.id,
      username: data.username,
      highScore: data.highScore || 0,
      avatar: data.avatar,
    });
    rank++;
  }
  
  return leaderboard;
}

/**
 * Get lifetime score leaderboard
 */
export async function getLifetimeScoreLeaderboard(
  limitCount: number = 100
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy('lifetimeScore', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];
  
  let rank = 1;
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    leaderboard.push({
      rank,
      userId: data.id,
      username: data.username,
      highScore: data.lifetimeScore || 0,
      avatar: data.avatar,
    });
    rank++;
  }
  
  return leaderboard;
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(
  userId: string,
  type: 'high_scores' | 'lifetime' = 'high_scores'
): Promise<number | null> {
  const field = type === 'high_scores' ? 'highScore' : 'lifetimeScore';
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    orderBy(field, 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  let rank = 1;
  
  for (const doc of querySnapshot.docs) {
    if (doc.id === userId) {
      return rank;
    }
    rank++;
  }
  
  return null;
}

// ============================================
// EXPORTS
// ============================================

export { app, auth, db };
export default app;

Smirkle Master Blueprint (smirkle2)
1. Core Concept
A "Don't Laugh" challenge app. YouTube videos play only if the user maintains a "Poker Face." If a smile or smirk is detected, the game ends immediately.

2. Technical Stack & Architecture
Framework: Next.js 15+ (App Router), Tailwind CSS.

Detection: face-api.js (TensorFlow.js) running client-side.

Backend: Firebase (Auth & Firestore).

Deployment: Vercel.

Camera: Front-facing camera ONLY (Rear disabled).

3. Visual Identity: Neo-Brutalist Cyberpunk
Palette: Background #080808, Neon Mint #00FF9C, Electric Red #FF003C.

Borders: 4px solid black borders on all interactive elements.

Shadows: Hard offset shadows (4px 4px 0px 0px black).

Shapes: Asymmetrical buttons (slanted corners/hexagonal clips).

Navigation: 7-Point Floating Nav Bar (Home, Search, Friends, Leaderboard, Upload, Profile, Settings).

4. Game Engine Logic
Pre-Check: Face must be visible, eyes open, and expression neutral to start.

UI during Play: Fullscreen video + Hexagonal "Targeting Scope" camera overlay.

Scoring: +27 points per second of active play.

Fail State: Smile detection threshold > 0.5.

Action: Flash screen Electric Red, show session score, redirect to Home.

5. User & Social Rules
Age Gate: Minimum 14 years old.

Auth: * Guest: Fast-track entry, agree to Terms, confirm age. (Scores not saved to Leaderboard).

Registered: Email/Pass (8+ chars, Upper, Lower, Num, Symbol).

Liability: Display mandatory Liability Statement/Disclaimer regarding camera privacy and user safety.

6. Progression & Levels
Leveling: Level up every 388,800 lifetime points.

Milestones:

Level 2: 388,800 total pts.

Level 3: 777,600 total pts.

Level 4: 1,166,400 total pts.

Badges: * Level 5: "Poker Facer"

Level 15: "Why So Serious?"

Levels 45, 90, 180: Custom badge names.

7. Database Structure (Firestore)
Users Collection: username, email, dob, lifetime_score, high_score, level, badges[].

Leaderboard: Global Top 100 (High Scores) and Lifetime Totals.

8. Hardcore Gameplay Mechanics
The Shadow Guardian (Active Monitoring): * Proximity Alert: If the bounding box of the face exceeds 80% of the stream (too close) or falls below 15% (too far), a yellow "glitch" border appears with the text "CALIBRATE DISTANCE".

Lumen Check: If the AI detection confidence drops below 40% due to lighting, the video darkens, and a warning states "NEED MORE LIGHT".

The "Moment of Smirk" (Fail State):

Crimson Flash: The entire UI background switches to Electric Red (#FF003C) with a high-frequency strobe effect for the first 0.5s.

The Failure Jolt: * Vibration: navigator.vibrate([200, 100, 200, 100, 500]) — a rhythmic "heartbeat" vibration that ends in a long buzz.

Reset: Session score resets to zero immediately to maintain the "Hardcore" stakes.

Fail Message: A random brutalist insult or message: "POKER FACE COMPROMISED," "WEAK MUSCLES DETECTED," or "LAUGHTER IS DEFEAT."

9. Advanced Profile & Privacy
Data Points: Profile Picture, Username, Display Name, Bio/Motto, Birthdate, Location, High Score.

Privacy Tier System:

Public: Username and High Score (Global Leaderboard visibility).

Toggleable (Public/Friends/Private): Name, Location, Bio, and Birthdate.

Private Only: Friends List and Email.

Visual Flair: Profiles should use the "Hexagonal Clip" for the profile picture, mirroring the camera overlay during gameplay.

10. Social: The "Smirk-Circle" Friend System
Search Engine: A real-time Firestore search that queries by username or display name using the array-contains or a simple string-prefix match.

Privacy: Friends lists are strictly private. You can see your friends, but others cannot see who you are friends with.

Friend Utilities:

Friend-Only Leaderboards: A toggle on the high-score page to see how you rank specifically against your "Smirk-Circle."

🚀 Hackathon "Judge-Impressor" Suggestions
The "Glitch" Effect: Use a CSS mix-blend-mode: exclusion on the fail screen. It makes the app look like a high-end cyberpunk terminal failing.

Anonymous "Ghost" Mode: Allow users to play without an account, but show them a "Shadow Score"—a score that would have been on the leaderboard if they had signed up. This is a massive "conversion" tactic for judges.

Low-Latency "Tiny" Model: Specifically mention you are using the TinyFaceDetector over the standard SSD Mobilenet v1 to save battery and ensure 60FPS on older mobile devices.

Privacy Disclaimer Toast: When the camera turns on, show a small toast: "ENCRYPTED STREAM: No video data leaves this device." Judges love data privacy.
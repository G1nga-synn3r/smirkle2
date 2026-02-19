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
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInAsGuest,
  createOrUpdateGoogleUserProfile,
  createGuestProfile,
} from "@/lib/firebase";

// ============================================
// TYPES
// ============================================

type AuthTab = "join" | "return" | "ghost";

interface PasswordRequirements {
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasLength: boolean;
}

// ============================================
// PASSWORD VALIDATION REGEX
// ============================================

const PASSWORD_REGEX = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  symbol: /[!@#$%^&*(),.?":{}|<>]/,
  minLength: 8,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AuthTab>("join");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCRT, setShowCRT] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Password validation
  const [passwordReqs, setPasswordReqs] = useState<PasswordRequirements>({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSymbol: false,
    hasLength: false,
  });

  // Age gate check
  const [isUnderAge, setIsUnderAge] = useState(false);

  // Update password requirements on change
  useEffect(() => {
    setPasswordReqs({
      hasUpper: PASSWORD_REGEX.upper.test(password),
      hasLower: PASSWORD_REGEX.lower.test(password),
      hasNumber: PASSWORD_REGEX.number.test(password),
      hasSymbol: PASSWORD_REGEX.symbol.test(password),
      hasLength: password.length >= PASSWORD_REGEX.minLength,
    });
  }, [password]);

  // Calculate age from birthdate
  useEffect(() => {
    if (birthdate) {
      const birth = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setIsUnderAge(age < 14);
    } else {
      setIsUnderAge(false);
    }
  }, [birthdate]);

  // =============================================
  // CRT FLICKER EFFECT
  // ============================================

  const triggerCRTEffect = async () => {
    setShowCRT(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/");
  };

  // ============================================
  // SIGN UP (ELITE ENTRY)
  // ============================================

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isUnderAge) {
      setError("GO BACK TO NURSERY. (Must be 14+)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match, champ.");
      return;
    }

    if (!passwordReqs.hasUpper || !passwordReqs.hasLower || !passwordReqs.hasNumber || !passwordReqs.hasSymbol || !passwordReqs.hasLength) {
      setError("Your password is weaker than a wet noodle. Fix it.");
      return;
    }

    if (!agreedToTerms) {
      setError("You gotta agree to the terms. No exceptions.");
      return;
    }

    setIsLoading(true);

    try {
      const birthDate = new Date(birthdate);
      await registerUser(email, password, username, birthDate);
      await triggerCRTEffect();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // SIGN IN (RETURNING PRO)
  // ============================================

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("You gotta agree to the terms. No exceptions.");
      return;
    }

    setIsLoading(true);

    try {
      await loginUser(email, password);
      await triggerCRTEffect();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // GOOGLE SIGN IN
  // ============================================

  const handleGoogleSignIn = async () => {
    setError(null);

    if (!agreedToTerms) {
      setError("You gotta agree to the terms. No exceptions.");
      return;
    }

    setIsLoading(true);

    try {
      const { user, isNewUser } = await signInWithGoogle();
      if (isNewUser) {
        // Generate username from Google display name or email
        const displayName = user.displayName || user.email?.split("@")[0] || "GhostUser";
        const username = displayName.replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000);
        await createOrUpdateGoogleUserProfile(user.uid, username);
      }
      await triggerCRTEffect();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // GUEST MODE (GHOST PROTOCOL)
  // ============================================

  const handleGuestSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isUnderAge) {
      setError("GO BACK TO NURSERY. (Must be 14+)");
      return;
    }

    if (!agreedToTerms) {
      setError("You gotta agree to the terms. No exceptions.");
      return;
    }

    setIsLoading(true);

    try {
      const { user, isNewUser } = await signInAsGuest();
      if (isNewUser) {
        // Generate random ghost username
        const ghostUsername = "Ghost" + Math.floor(Math.random() * 100000);
        await createGuestProfile(user.uid, ghostUsername);
      }
      await triggerCRTEffect();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Ghost entry failed. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden font-mono">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-bg" />
      </div>

      {/* CRT Flicker Effect */}
      {showCRT && (
        <div className="fixed inset-0 z-50 bg-smirkleMint/20 animate-crt-flicker pointer-events-none" />
      )}

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo / Title */}
        <div className="mb-8 -rotate-1">
          <h1 className="text-6xl md:text-8xl font-black text-smirkleMint tracking-tighter uppercase transform -skew-x-12 drop-shadow-[4px_4px_0_#00FF9C]">
            SMIRKLE
          </h1>
          <p className="text-white text-xl md:text-2xl font-bold mt-2 text-right -rotate-1">
            DONT SMIRK. DONT LOSE.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 w-full max-w-md">
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-3 px-4 font-black text-lg uppercase tracking-wider border-4 border-black transition-all
              ${activeTab === "join"
                ? "bg-smirkleMint text-black shadow-brutal-mint -translate-y-1"
                : "bg-black text-white hover:bg-gray-800 -rotate-2"
              }`}
          >
            JOIN
          </button>
          <button
            onClick={() => setActiveTab("return")}
            className={`flex-1 py-3 px-4 font-black text-lg uppercase tracking-wider border-4 border-black transition-all
              ${activeTab === "return"
                ? "bg-smirkleMint text-black shadow-brutal-mint -translate-y-1"
                : "bg-black text-white hover:bg-gray-800 rotate-2"
              }`}
          >
            RETURN
          </button>
          <button
            onClick={() => setActiveTab("ghost")}
            className={`flex-1 py-3 px-4 font-black text-lg uppercase tracking-wider border-4 border-black transition-all
              ${activeTab === "ghost"
                ? "bg-smirkleMint text-black shadow-brutal-mint -translate-y-1"
                : "bg-black text-white hover:bg-gray-800 -rotate-1"
              }`}
          >
            GHOST
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md">
          <div className="bg-black border-4 border-white p-6 -rotate-1 shadow-brutal">
            {/* Error Display */}
            {error && (
              <div className="bg-smirkleRed text-white p-4 mb-6 border-4 border-black font-bold uppercase -rotate-1">
                {error}
              </div>
            )}

            {/* JOIN - Sign Up Form */}
            {activeTab === "join" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                    placeholder="ENTER YOUR ALIAS"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                    placeholder="YOUR@EMAIL.COM"
                  />
                </div>

                {/* Birthdate */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                  />
                  {isUnderAge && (
                    <div className="bg-smirkleRed text-white p-2 mt-2 font-bold uppercase border-2 border-black">
                      GO BACK TO NURSERY. (Must be 14+)
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                    placeholder="SUPER SECRET"
                  />
                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1 text-xs font-bold">
                    <div className={`${passwordReqs.hasUpper ? "text-smirkleMint" : "text-gray-500"}`}>
                      [ ] 1 UPPERCASE LETTER
                    </div>
                    <div className={`${passwordReqs.hasLower ? "text-smirkleMint" : "text-gray-500"}`}>
                      [ ] 1 lowercase letter
                    </div>
                    <div className={`${passwordReqs.hasNumber ? "text-smirkleMint" : "text-gray-500"}`}>
                      [ ] 1 number
                    </div>
                    <div className={`${passwordReqs.hasSymbol ? "text-smirkleMint" : "text-gray-500"}`}>
                      [ ] 1 symbol
                    </div>
                    <div className={`${passwordReqs.hasLength ? "text-smirkleMint" : "text-gray-500"}`}>
                      [ ] 8+ characters
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                    placeholder="TYPE IT AGAIN"
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-join"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-6 h-6 mt-1 accent-smirkleMint"
                  />
                  <label htmlFor="terms-join" className="text-white font-bold text-sm">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-smirkleMint underline hover:text-white"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isUnderAge}
                  className="w-full bg-smirkleMint text-black font-black text-xl py-4 border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed -rotate-1"
                >
                  {isLoading ? "PROCESSING..." : "JOIN THE ELITE"}
                </button>
              </form>
            )}

            {/* RETURN - Sign In Form */}
            {activeTab === "return" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                    placeholder="YOUR@EMAIL.COM"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                    placeholder="SUPER SECRET"
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-return"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-6 h-6 mt-1 accent-smirkleMint"
                  />
                  <label htmlFor="terms-return" className="text-white font-bold text-sm">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-smirkleMint underline hover:text-white"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-smirkleMint text-black font-black text-xl py-4 border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed rotate-1"
                >
                  {isLoading ? "WELCOME BACK..." : "ENTER AS PRO"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-2 bg-white border-2 border-black" />
                  <span className="text-white font-black">OR</span>
                  <div className="flex-1 h-2 bg-white border-2 border-black" />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white text-black font-black text-lg py-4 border-4 border-black shadow-brutal-mint hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "CONNECTING..." : "GOOGLE SIGN IN"}
                </button>
              </form>
            )}

            {/* GHOST - Guest Mode */}
            {activeTab === "ghost" && (
              <form onSubmit={handleGuestSignIn} className="space-y-4">
                {/* Birthdate (Age Gate for Ghost too) */}
                <div>
                  <label className="block text-smirkleMint font-black uppercase mb-2">
                    Birthdate (Age Gate)
                  </label>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    className="w-full bg-white border-4 border-smirkleMint p-3 font-bold text-black focus:outline-none focus:shadow-brutal-mint"
                  />
                  {isUnderAge && (
                    <div className="bg-smirkleRed text-white p-2 mt-2 font-bold uppercase border-2 border-black">
                      GO BACK TO NURSERY. (Must be 14+)
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-ghost"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-6 h-6 mt-1 accent-smirkleMint"
                  />
                  <label htmlFor="terms-ghost" className="text-white font-bold text-sm">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-smirkleMint underline hover:text-white"
                    >
                      Terms & Conditions
                    </button>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isUnderAge}
                  className="w-full bg-gray-600 text-white font-black text-xl py-4 border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed -rotate-2"
                >
                  {isLoading ? "PHANTOM FORMING..." : "ENTER AS GHOST"}
                </button>

                <p className="text-gray-400 text-sm font-bold text-center">
                  (No Glory. No Saved Scores.)
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Liability Statement */}
        <div className="mt-8 max-w-md w-full">
          <div className="bg-black border-4 border-smirkleMint p-4 rotate-1 shadow-brutal-mint">
            <p className="text-smirkleMint font-bold text-xs uppercase text-center">
              ⚠️ LIABILITY NOTICE ⚠️
            </p>
            <p className="text-white text-center text-sm mt-2 font-mono">
              NO VIDEO DATA IS STORED. WE ONLY TRACK YOUR MUSCLES.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-black border-4 border-smirkleMint p-8 max-w-lg max-h-[80vh] overflow-y-auto -rotate-1 shadow-brutal-mint">
            <h2 className="text-2xl font-black text-smirkleMint uppercase mb-4">
              Terms & Conditions
            </h2>
            <div className="text-white font-mono text-sm space-y-4">
              <p>
                <strong className="text-smirkleMint">1. THE DEAL:</strong> You agree to not smirk. 
                We track your facial muscles. If you smile, you lose. Simple.
              </p>
              <p>
                <strong className="text-smirkleMint">2. NO VIDEO STORAGE:</strong> 
                We don't save your video. Your face stays on your device. 
                We only process muscle movement data in real-time.
              </p>
              <p>
                <strong className="text-smirkleMint">3. AGE REQUIREMENT:</strong> 
                You must be 14 or older. If you're younger, go play something else.
              </p>
              <p>
                <strong className="text-smirkleMint">4. NO REFUNDS:</strong> 
                There's no money involved. What are you even reading this for?
              </p>
              <p>
                <strong className="text-smirkleMint">5. WE OWN YOUR SCORES:</strong> 
                Your high scores belong to us now. Deal with it.
              </p>
              <p>
                <strong className="text-smirkleMint">6. GHOST MODE:</strong> 
                Guest users get no glory. No leaderboard. No badges. You're a ghost. 
                Deal with it or sign up for real.
              </p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full mt-6 bg-smirkleMint text-black font-black text-xl py-3 border-4 border-black shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              I AGREE (LET ME PLAY)
            </button>
          </div>
        </div>
      )}

      {/* Inline Styles for Grid Animation */}
      <style jsx>{`
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(0, 255, 156, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 156, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        .animate-crt-flicker {
          animation: crtFlicker 1.5s ease-in-out;
        }

        @keyframes crtFlicker {
          0% { opacity: 0; }
          10% { opacity: 0.8; }
          20% { opacity: 0.2; }
          30% { opacity: 0.9; }
          40% { opacity: 0.1; }
          50% { opacity: 0.7; }
          60% { opacity: 0.3; }
          70% { opacity: 0.8; }
          80% { opacity: 0.4; }
          90% { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

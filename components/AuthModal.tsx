/**
 * AuthModal Component
 * Authentication modal with Guest Mode and Register flows
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  X,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { cn, validatePassword, validateUsername, isValidEmail, validateAge } from '@/lib/utils';
import type { AuthState } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestLogin: (username: string) => void;
  onRegister: (email: string, password: string, username: string, dob: Date) => void;
  onLogin: (email: string, password: string) => void;
  authState: AuthState;
}

type AuthMode = 'guest' | 'register' | 'login';

export function AuthModal({ 
  isOpen, 
  onClose, 
  onGuestLogin, 
  onRegister,
  onLogin,
  authState 
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('guest');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Guest form state
  const [guestUsername, setGuestUsername] = useState('');
  const [guestAgeConfirmed, setGuestAgeConfirmed] = useState(false);
  const [guestTermsAgreed, setGuestTermsAgreed] = useState(false);
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerDob, setRegisterDob] = useState('');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setErrors({});
    setGuestUsername('');
    setGuestAgeConfirmed(false);
    setGuestTermsAgreed(false);
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterUsername('');
    setRegisterDob('');
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate username
    const usernameErrors = validateUsername(guestUsername);
    if (usernameErrors.length > 0) {
      setErrors({ username: usernameErrors[0].message });
      return;
    }
    
    // Validate age confirmation and terms
    if (!guestAgeConfirmed) {
      setErrors({ age: 'You must confirm you are 14 or older' });
      return;
    }
    
    if (!guestTermsAgreed) {
      setErrors({ terms: 'You must agree to the terms of service' });
      return;
    }
    
    setIsLoading(true);
    try {
      await onGuestLogin(guestUsername);
      onClose();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Failed to continue as guest' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate email
    if (!isValidEmail(registerEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    // Validate password
    const passwordErrors = validatePassword(registerPassword);
    if (passwordErrors.length > 0) {
      setErrors({ password: passwordErrors[0].message });
      return;
    }
    
    // Confirm password
    if (registerPassword !== registerConfirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    // Validate username
    const usernameErrors = validateUsername(registerUsername);
    if (usernameErrors.length > 0) {
      setErrors({ username: usernameErrors[0].message });
      return;
    }
    
    // Validate age
    if (!registerDob) {
      setErrors({ dob: 'Please enter your date of birth' });
      return;
    }
    
    const dob = new Date(registerDob);
    if (!validateAge(dob)) {
      setErrors({ dob: 'You must be 14 or older to register' });
      return;
    }
    
    setIsLoading(true);
    try {
      await onRegister(registerEmail, registerPassword, registerUsername, dob);
      onClose();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate email
    if (!isValidEmail(loginEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    if (!loginPassword) {
      setErrors({ password: 'Please enter your password' });
      return;
    }
    
    setIsLoading(true);
    try {
      await onLogin(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="neo-card max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-black">
          <h2 className="text-2xl font-bold uppercase tracking-wider">
            {mode === 'guest' && 'Quick Play'}
            {mode === 'register' && 'Create Account'}
            {mode === 'login' && 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FF003C] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="mb-4 p-3 bg-[#FF003C] border-4 border-black text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Mode Tabs */}
        {mode !== 'guest' && (
          <div className="flex mb-6 border-4 border-black">
            <button
              onClick={() => setMode('login')}
              className={cn(
                "flex-1 py-3 font-bold uppercase text-sm transition-colors",
                mode === 'login' ? "bg-[#00FF9C] text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={cn(
                "flex-1 py-3 font-bold uppercase text-sm transition-colors",
                mode === 'register' ? "bg-[#00FF9C] text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              Register
            </button>
          </div>
        )}

        {/* Guest Form */}
        {mode === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Choose a Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={guestUsername}
                  onChange={(e) => setGuestUsername(e.target.value)}
                  placeholder="Enter username"
                  className="neo-input w-full pl-12"
                  maxLength={20}
                />
              </div>
              {errors.username && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guestAgeConfirmed}
                  onChange={(e) => setGuestAgeConfirmed(e.target.checked)}
                  className="w-6 h-6 accent-[#00FF9C]"
                />
                <span className="text-sm">
                  I am 14 years or older
                </span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guestTermsAgreed}
                  onChange={(e) => setGuestTermsAgreed(e.target.checked)}
                  className="w-6 h-6 accent-[#00FF9C]"
                />
                <span className="text-sm">
                  I agree to the Terms of Service
                </span>
              </label>
            </div>

            {errors.age && (
              <p className="text-[#FF003C] text-sm">{errors.age}</p>
            )}
            {errors.terms && (
              <p className="text-[#FF003C] text-sm">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full mt-6"
            >
              {isLoading ? 'Loading...' : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Continue as Guest
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#00FF9C] hover:underline text-sm"
              >
                Or create an account
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Choose username"
                  className="neo-input w-full pl-12"
                  maxLength={20}
                />
              </div>
              {errors.username && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="neo-input w-full pl-12"
                />
              </div>
              {errors.email && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={registerDob}
                  onChange={(e) => setRegisterDob(e.target.value)}
                  className="neo-input w-full pl-12"
                />
              </div>
              {errors.dob && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.dob}</p>
              )}
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Min 8 chars with special symbol"
                  className="neo-input w-full pl-12"
                />
              </div>
              {errors.password && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="neo-input w-full pl-12"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-black border-4 border-gray-700 text-xs space-y-1">
              <p className="font-bold text-gray-400 uppercase mb-2">Password Requirements:</p>
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("w-4 h-4", registerPassword.length >= 8 ? "text-[#00FF9C]" : "text-gray-600")} />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("w-4 h-4", /[A-Z]/.test(registerPassword) ? "text-[#00FF9C]" : "text-gray-600")} />
                <span>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("w-4 h-4", /[a-z]/.test(registerPassword) ? "text-[#00FF9C]" : "text-gray-600")} />
                <span>One lowercase letter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("w-4 h-4", /\d/.test(registerPassword) ? "text-[#00FF9C]" : "text-gray-600")} />
                <span>One number</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={cn("w-4 h-4", /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(registerPassword) ? "text-[#00FF9C]" : "text-gray-600")} />
                <span>One special symbol</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full mt-6"
            >
              {isLoading ? 'Creating Account...' : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="neo-input w-full pl-12"
                />
              </div>
              {errors.email && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block font-bold mb-2 uppercase text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="neo-input w-full pl-12"
                />
              </div>
              {errors.password && (
                <p className="text-[#FF003C] text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full mt-6"
            >
              {isLoading ? 'Logging in...' : (
                <>
                  Login
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setMode('guest')}
                className="text-[#00FF9C] hover:underline text-sm"
              >
                Or play as guest
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;

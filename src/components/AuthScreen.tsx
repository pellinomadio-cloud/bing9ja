import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, User as UserIcon, Lock, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedUsername = username.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister && !trimmedUsername) {
      setError('Username is required for registration.');
      return;
    }

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      
      // Load registered users from localStorage
      const usersRaw = localStorage.getItem('bing9ja_registered_users');
      let registeredUsers: any[] = [];
      try {
        if (usersRaw) {
          registeredUsers = JSON.parse(usersRaw);
        }
      } catch (err) {
        registeredUsers = [];
      }

      if (isRegister) {
        // Check if email already exists
        const emailExists = registeredUsers.some(u => u.email.toLowerCase() === trimmedEmail);
        if (emailExists) {
          setError('This email address is already registered. Please log in instead.');
          return;
        }

        // Check if username is taken
        const usernameExists = registeredUsers.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
        if (usernameExists) {
          setError('This username is already taken.');
          return;
        }

        const generatedReferralCode = 'B9J-' + Math.floor(100000 + Math.random() * 900000);
        
        const newUser: User = {
          username: trimmedUsername,
          email: trimmedEmail,
          referralCodeUsed: referralCode ? referralCode.trim().toUpperCase() : undefined,
          ownReferralCode: generatedReferralCode,
          tier: 1,
          balance: 6700, // Starting balance of 6,700 Naira as requested
          referralCount: referralCode ? 1 : 0,
          referralBonusEarned: 0,
          activeBings: []
        };

        // Also store password inside the record for simplified validation
        const userToSave = { ...newUser, password: trimmedPassword };
        registeredUsers.push(userToSave);
        localStorage.setItem('bing9ja_registered_users', JSON.stringify(registeredUsers));
        
        // Also set this user as the currently active one
        localStorage.setItem('bing9ja_current_user', JSON.stringify(newUser));

        onAuthSuccess(newUser);
      } else {
        // Login validation
        const matchingUser = registeredUsers.find(
          u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
        );

        if (!matchingUser) {
          setError('Invalid email or password. Please make sure you have registered.');
          return;
        }

        // Strip password for safety inside the runtime User type
        const { password: _, ...cleanedUser } = matchingUser;
        localStorage.setItem('bing9ja_current_user', JSON.stringify(cleanedUser));
        onAuthSuccess(cleanedUser as User);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-primary-dark flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-brand/30 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-accent/20 blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-900/10"
        id="auth-card"
      >
        {/* Brand Header */}
        <div className="bg-gradient-to-br from-primary-dark via-primary-medium to-primary-brand p-8 text-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-accent/25 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight" id="app-logo">
            bing<span className="text-primary-accent">9ja</span>
          </h1>
          <p className="text-purple-200 text-xs mt-1 font-medium tracking-widest uppercase">
            Premium Service & Investment Hub
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-primary-light border-b border-purple-100">
          <button
            type="button"
            id="register-tab"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 ${
              isRegister 
                ? 'bg-white text-primary-medium shadow-sm' 
                : 'text-purple-400 hover:text-primary-brand'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            id="login-tab"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 ${
              !isRegister 
                ? 'bg-white text-primary-medium shadow-sm' 
                : 'text-purple-400 hover:text-primary-brand'
            }`}
          >
            Login Back
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5" id="auth-form">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-xs text-red-600 font-medium"
                id="auth-error"
              >
                {error}
              </motion.div>
            )}

            {isRegister && (
              <div className="space-y-1.5" id="group-username">
                <label className="text-xs font-bold text-primary-dark/70 tracking-wide uppercase block">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-purple-400">
                    <UserIcon size={18} />
                  </span>
                  <input
                    type="text"
                    id="input-username"
                    required={isRegister}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. marvel_nigeria"
                    className="w-full pl-11 pr-4 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-brand/20 focus:border-primary-brand transition-all font-medium text-primary-dark"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5" id="group-email">
              <label className="text-xs font-bold text-primary-dark/70 tracking-wide uppercase block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-purple-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  id="input-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-brand/20 focus:border-primary-brand transition-all font-medium text-primary-dark"
                />
              </div>
            </div>

            <div className="space-y-1.5" id="group-password">
              <label className="text-xs font-bold text-primary-dark/70 tracking-wide uppercase block">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-purple-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  id="input-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-brand/20 focus:border-primary-brand transition-all font-medium text-primary-dark"
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-1.5" id="group-ref-code">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-primary-dark/70 tracking-wide uppercase block">
                    Referral Code <span className="text-purple-300 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-primary-accent font-semibold uppercase tracking-wider bg-purple-100 px-2 py-0.5 rounded-full">
                    Extra Bonus
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-purple-400">
                    <Smartphone size={18} />
                  </span>
                  <input
                    type="text"
                    id="input-ref-code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="e.g. B9J-827402"
                    className="w-full pl-11 pr-4 py-3 bg-purple-50/50 border border-purple-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-brand/20 focus:border-primary-brand transition-all font-medium text-primary-dark uppercase placeholder:normal-case"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-medium via-primary-brand to-primary-accent hover:from-primary-dark hover:to-primary-brand text-white font-bold text-sm rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegister ? 'Register Account' : 'Sign In securely'}
                  <ShieldCheck size={18} />
                </>
              )}
            </button>
          </form>

          {/* Secure lock note */}
          <div className="mt-6 flex justify-center items-center gap-2 text-[11px] text-purple-400/80 font-medium bg-purple-50 p-2.5 rounded-xl border border-purple-100/40">
            <ShieldCheck size={14} className="text-primary-brand" />
            <span>Secured 256-bit bank-grade encryption server</span>
          </div>
        </div>
      </motion.div>

      {/* Footer copyright */}
      <p className="text-purple-400/50 text-xs mt-8 font-medium">
        © 2026 bing9ja Inc. Licensed by CBN. All Rights Reserved.
      </p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Building, ArrowRight, Activity, Github, UserRound, Sparkles, AlertCircle, Stethoscope, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [showIntro, setShowIntro] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'provider'>('patient');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Doctor Specific State (Matches new schema.prisma)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clinicName, setClinicName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Splash screen animation
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const dbRole = role === 'provider' ? 'DOCTOR' : 'PATIENT';

    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        const userRole = data.user.user_metadata?.role;

        if (userRole && userRole !== dbRole) {
          await supabase.auth.signOut();
          throw new Error(
            `Access Denied: You are registered as a ${userRole}`
          );
        }

        router.push(dbRole === 'DOCTOR' ? '/dashboard' : '/patient-portal');
      } else {
        // SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: dbRole },
          },
        });

        if (error) throw error;

        if (!data.user) throw new Error('User creation failed');

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: dbRole,
            firstName,
            lastName,
            clinicName,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Database sync failed');
        }

        router.push(dbRole === 'DOCTOR' ? '/dashboard' : '/onboarding');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#1E1F22] text-gray-900 dark:text-white overflow-hidden flex items-center justify-center font-sans">

      {/* --- ANIMATED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,245,245,1)_0%,rgba(255,255,255,1)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(20,21,26,1)_0%,rgba(10,11,13,1)_100%)]"></div>
        <motion.div
          animate={{ x: [-50, 50, -50], y: [-20, 30, -20], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-125 max-h-125 bg-[#FC94AF] rounded-full mix-blend-screen filter blur-[120px] opacity-10"
        />
        <motion.div
          animate={{ x: [50, -50, 50], y: [30, -20, 30], scale: [1.2, 1, 1.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[35vw] h-[35vw] max-w-100 max-h-100 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
      </div>

      {/* --- INTRO SPLASH SCREEN --- */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#1E1F22]"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <Activity size={64} className="text-[#FC94AF]" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border-2 border-dashed border-[#FC94AF]/30 rounded-full" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                Nala Vita
              </h1>
              <p className="text-[#FC94AF] tracking-widest uppercase text-xs font-bold shadow-[#FC94AF]">
                Care, Amplified
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN AUTH CONTAINER --- */}
      {!showIntro && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md px-4"
        >
          <div className="bg-white/90 dark:bg-[#14151A]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]">

            {/* Logo & Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-[#FC94AF]/10 rounded-2xl mb-4 border border-[#FC94AF]/20 shadow-[0_0_20px_rgba(252,148,175,0.15)]">
                <Activity size={28} className="text-[#FC94AF]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {isLogin ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-gray-400 text-sm">
                {isLogin ? 'Enter your credentials to access your dashboard' : 'Join the future of AI-driven healthcare'}
              </p>
            </div>

            {/* Role Selector (Patient vs Provider) */}
            <div className="flex bg-gray-100 dark:bg-[#0A0B0D] p-1 rounded-xl mb-6 border border-gray-200 dark:border-white/5 relative">
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#FC94AF]/20 border border-[#FC94AF]/30 rounded-lg shadow-sm"
                animate={{ left: role === 'patient' ? '4px' : '50%' }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 relative z-10 transition-colors ${role === 'patient' ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <UserRound size={16} /> Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 relative z-10 transition-colors ${role === 'provider' ? 'text-[#FC94AF]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <Stethoscope size={16} /> Provider
              </button>
            </div>

            {/* Error Message Display */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-red-500 text-sm font-medium leading-tight"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {authError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && role === 'provider' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex gap-3">
                      <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon size={18} className="text-gray-500 group-focus-within:text-[#FC94AF] transition-colors" />
                        </div>
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#FC94AF]/50 focus:bg-white dark:focus:bg-white/10 transition-all text-sm" />
                      </div>
                      <div className="relative group flex-1">
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 px-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#FC94AF]/50 focus:bg-white dark:focus:bg-white/10 transition-all text-sm" />
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building size={18} className="text-gray-500 group-focus-within:text-[#FC94AF] transition-colors" />
                      </div>
                      <input type="text" required value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Hospital / Clinic Name" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#FC94AF]/50 focus:bg-white dark:focus:bg-white/10 transition-all text-sm" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-500 group-focus-within:text-[#FC94AF] transition-colors" />
                </div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#FC94AF]/50 focus:bg-white dark:focus:bg-white/10 transition-all text-sm" />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500 group-focus-within:text-[#FC94AF] transition-colors" />
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-[#FC94AF]/50 focus:bg-white dark:focus:bg-white/10 transition-all text-sm" />
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-[#FC94AF] hover:text-[#E07A96] transition-colors">Forgot Password?</a>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full relative group overflow-hidden bg-linear-to-r from-[#FC94AF] to-[#E07A96] text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_25px_rgba(252,148,175,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? <><Activity size={18} className="animate-spin" /> Authenticating...</> : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                </span>
              </button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-8 text-center text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-gray-900 dark:text-white font-semibold hover:text-[#FC94AF] transition-colors">
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-600 flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-[#FC94AF]/50" /> Secured by Amelia AI Architecture
          </div>
        </motion.div>
      )}
    </div>
  );
}
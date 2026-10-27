'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context.jsx';
import { getFirebaseErrorMessage } from '../../lib/firebase.js';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Info,
  KeyRound,
  X,
  Sparkles
} from 'lucide-react';
import UnauthorizedDomainHelp from '../../components/UnauthorizedDomainHelp.jsx';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, isConfigured, loginWithEmail, loginWithGoogle, resetPassword, loginAsDemoPatron } = useAuth();
  
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState({ loading: false, message: '', error: '' });

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    return errs;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await loginWithEmail(email, password);
      router.push(redirectPath);
    } catch (err) {
      console.warn('Firebase Login Notice:', err?.message || err);
      setAuthError(getFirebaseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    if (isGoogleSubmitting) return;

    try {
      setIsGoogleSubmitting(true);
      await loginWithGoogle();
      router.push(redirectPath);
    } catch (err) {
      console.warn('Firebase Google Sign-In Notice:', err?.message || err);
      setAuthError(getFirebaseErrorMessage(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail.trim())) {
      setResetStatus({ loading: false, message: '', error: 'Please enter a valid email address.' });
      return;
    }

    try {
      setResetStatus({ loading: true, message: '', error: '' });
      await resetPassword(resetEmail);
      setResetStatus({
        loading: false,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
        error: ''
      });
    } catch (err) {
      console.warn('Password Reset Notice:', err?.message || err);
      // Clean privacy-preserving confirmation or mapped error
      setResetStatus({
        loading: false,
        message: '',
        error: getFirebaseErrorMessage(err)
      });
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsSubmitting(true);
      await loginAsDemoPatron('Prof. Evelyn Harper', 'patron.demo@librahub.library');
      router.push(redirectPath);
    } catch (e) {
      console.warn('Demo login notice:', e?.message || e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Libra<span className="text-blue-600 font-sans font-extrabold">Hub</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
            Patron Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Access your borrowing history, reserved reading pods, and book requests.
          </p>
        </div>

        {/* Redirect Notice Banner */}
        {redirectPath && redirectPath !== '/dashboard' && (
          <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Please sign in to proceed with your request.</span>
            </div>
            <Link
              href={redirectPath}
              className="font-semibold text-blue-700 hover:text-blue-900 shrink-0 underline decoration-blue-300"
            >
              Return
            </Link>
          </div>
        )}

        {/* Missing Firebase Config Notice */}
        {!isConfigured && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Firebase Configuration Pending</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Add your Firebase Web app credentials to <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded">frontend/.env.local</code> (<code className="font-mono">VITE_FIREBASE_API_KEY</code>, etc.) to connect live authentication.
            </p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Top Authentication Error Alert */}
          {authError && (
            authError.includes('Domain Authorization Required') || authError.includes('unauthorized-domain') ? (
              <UnauthorizedDomainHelp onDismiss={() => setAuthError('')} redirectPath={redirectPath} />
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in" role="alert">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{authError}</span>
              </div>
            )
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleSubmitting ? (
              <div className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-transparent animate-spin" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{isGoogleSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="relative bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Or with library email
            </span>
          </div>

          {/* Email Credentials Form */}
          <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="patron@university.edu"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-4 transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setForgotModalOpen(true);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-4 transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Terminal Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-slate-600">
                Remember this terminal for 30 days
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Quick Demo Access */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Instant Demo Patron Access (1-Click)</span>
              </button>
            </div>
          </form>

        </div>

        {/* Link to Registration */}
        <p className="text-center text-xs sm:text-sm text-slate-600">
          Don't have a library account yet?{' '}
          <Link
            href={`/register${redirectPath && redirectPath !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Register for membership
          </Link>
        </p>

      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setForgotModalOpen(false);
                setResetStatus({ loading: false, message: '', error: '' });
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
              <KeyRound className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif mb-1">
              Reset Patron Password
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Enter your library email address and Firebase will dispatch an official password recovery link.
            </p>

            {resetStatus.message && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resetStatus.message}</span>
              </div>
            )}

            {resetStatus.error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{resetStatus.error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="patron@university.edu"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetStatus.loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {resetStatus.loading ? 'Dispatching link...' : 'Send Recovery Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

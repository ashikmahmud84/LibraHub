'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context.jsx';
import ProtectedRoute from '../../components/ProtectedRoute.jsx';
import SectionHeading from '../../components/SectionHeading.jsx';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  BookOpen, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

function DashboardContent() {
  const { user, logout, sendVerificationEmail } = useAuth();
  const router = useRouter();
  const [resendStatus, setResendStatus] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (err) {
      console.warn('Logout notice:', err?.message || err);
      setLoggingOut(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      setResendStatus('Verification email dispatched! Please check your inbox.');
    } catch (err) {
      setResendStatus('Could not send verification email. Please try again shortly.');
    }
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'P';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Member Sanctuary Area
          </span>
          <h1 className="text-3xl font-bold font-serif text-slate-900 tracking-tight">
            Patron Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your library credentials, reading room allocations, and loan history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 text-slate-500" />
          <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Main Patron Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Patron avatar'}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
                {initials}
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-xl font-bold font-serif text-slate-900 truncate">
                {user?.displayName || 'Registered Patron'}
              </h2>
              <p className="text-xs text-slate-500 truncate font-mono">
                {user?.email}
              </p>
              <div className="pt-1">
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Verified Account</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    <span>Unverified Email</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          {!user?.emailVerified && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
              <p className="font-medium">
                Your email address has not yet been verified with Firebase.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline"
              >
                <span>Resend Verification Email</span>
              </button>
              {resendStatus && (
                <p className="text-[11px] text-emerald-700 font-semibold">{resendStatus}</p>
              )}
            </div>
          )}

          {/* Account Details Matrix */}
          <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Firebase UID:</span>
              <span className="font-mono text-slate-800 truncate max-w-[180px]" title={user?.uid}>
                {user?.uid}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Authentication Provider:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {user?.providerData?.[0]?.providerId === 'google.com' ? 'Google OAuth' : 'Email & Password'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Member Since:</span>
              <span className="text-slate-800 tabular-nums font-medium">
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Library Privileges & Borrowing Placeholder */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold font-serif text-slate-900">
              Circulation & Research Privileges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-2xl font-bold font-serif text-slate-900 block tabular-nums">0 / 5</span>
                <span className="font-semibold text-slate-800 mt-1 block">Active Book Loans</span>
                <span className="text-slate-400 text-[11px]">21-day standard allocations</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-2xl font-bold font-serif text-slate-900 block tabular-nums">0</span>
                <span className="font-semibold text-slate-800 mt-1 block">Active Holds</span>
                <span className="text-slate-400 text-[11px]">Waitlist positions reserved</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-2xl font-bold font-serif text-emerald-700 block">Active</span>
                <span className="font-semibold text-slate-800 mt-1 block">Sanctuary Pass</span>
                <span className="text-slate-400 text-[11px]">Acoustic chambers accessible</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-semibold">Ready to select study materials?</strong>
                <p className="text-slate-600 leading-relaxed">
                  Browse through 24,800+ physical and digital monographs. You can bookmark titles or check out available copies directly from the catalog.
                </p>
                <div className="pt-2">
                  <Link
                    href="/books"
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900"
                  >
                    <span>Explore Library Catalog</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context.jsx';
import { ShieldAlert, BookOpen } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(pathname || '/dashboard');
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="h-8 w-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Verifying patron authorization...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <ShieldAlert className="h-10 w-10 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold font-serif text-slate-900 mb-1">Patron Access Restricted</h2>
        <p className="text-xs text-slate-600 mb-4">Redirecting you to the sign-in terminal...</p>
      </div>
    );
  }

  return children;
}

'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldAlert, ArrowDown, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentHostname, getFirebaseAuthSettingsUrl, firebaseConfig } from '../lib/firebase.js';
import { useAuth } from '../lib/auth-context.jsx';

export default function UnauthorizedDomainHelp({ onDismiss, redirectPath = '/dashboard' }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { loginAsDemoPatron } = useAuth();
  const hostname = getCurrentHostname();
  const settingsUrl = getFirebaseAuthSettingsUrl();

  const handleCopy = () => {
    if (typeof window !== 'undefined' && hostname) {
      navigator.clipboard?.writeText(hostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDemoPass = async () => {
    try {
      await loginAsDemoPatron();
      router.push(redirectPath);
    } catch (e) {
      console.warn('Demo pass notice:', e?.message || e);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3 animate-in fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm font-serif">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Google Sign-In Domain Authorization</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-amber-700 hover:text-amber-900 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        )}
      </div>

      <p className="text-slate-700 leading-relaxed text-[11px]">
        Firebase blocks OAuth popups until this domain is registered in your project's allowlist.
      </p>

      {/* Copy Domain Box */}
      <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Your Preview Domain
          </span>
          <code className="text-xs font-mono font-bold text-slate-900 truncate block">
            {hostname || 'Current Domain'}
          </code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-[11px] hover:bg-slate-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Quick 2-Step Guide */}
      <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 font-medium pt-1">
        <li>Click <strong>Copy</strong> above to copy your preview domain.</li>
        <li>
          Open{' '}
          <a
            href={settingsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-700 hover:text-blue-900 underline font-semibold"
          >
            <span>Firebase Authorized Domains Settings</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </li>
        <li>Click <strong>Add domain</strong>, paste it, and save.</li>
      </ol>

      <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>
            <strong>Instant Alternative:</strong> Use Email & Password below or sign in as Demo Patron!
          </span>
        </div>
        <button
          type="button"
          onClick={handleDemoPass}
          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold underline shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Instant Demo Patron Pass</span>
        </button>
      </div>
    </div>
  );
}

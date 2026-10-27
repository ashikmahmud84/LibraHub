import React from 'react';
import Link from 'next/link';
import { BookOpen, MapPin, Phone, Mail, Clock, ShieldCheck, Bookmark } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                Libra<span className="text-blue-400 font-sans font-extrabold">Hub</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              LibraHub is an open-access academic and public reading sanctuary. We curate contemporary monographs, classic literature, and cutting-edge research across science and humanities.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Certified Public Knowledge & Research Repository</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Catalog</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/books" className="hover:text-white transition-colors">Complete Catalog</Link>
              </li>
              <li>
                <Link href="/books?category=Computer+Science" className="hover:text-white transition-colors">Computer Science</Link>
              </li>
              <li>
                <Link href="/books?category=Architecture+%26+Design" className="hover:text-white transition-colors">Architecture & Design</Link>
              </li>
              <li>
                <Link href="/books?category=Science+Fiction" className="hover:text-white transition-colors">Science Fiction</Link>
              </li>
              <li>
                <Link href="/books?category=Philosophy" className="hover:text-white transition-colors">Philosophy</Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Library</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Our Sanctuary</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact & Locations</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Patron Sign In</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">Membership Registration</Link>
              </li>
            </ul>
          </div>

          {/* Hours & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Hours & Contact</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <span>
                  Mon – Fri: 08:00 – 22:00<br />
                  Sat – Sun: 09:00 – 20:00
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <span>P 73/2, Middle Badda</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>ashikmahmudabir24@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+8801643536878</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LibraHub Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Borrowing Rules</a>
            <a href="#accessibility" className="hover:text-slate-400 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

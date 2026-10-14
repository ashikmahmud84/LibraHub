'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  Compass, 
  BookMarked, 
  Layers, 
  ShieldCheck, 
  Users, 
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Library,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';
import { INITIAL_BOOKS, LIBRARY_STATS, CATEGORIES } from '../data/books.js';
import BookCard from '../components/BookCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState(() => INITIAL_BOOKS.filter((book) => book.isFeatured));

  useEffect(() => {
    let active = true;
    fetch('/api/books?isFeatured=true')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && data.success && Array.isArray(data.books) && data.books.length > 0) {
          setFeaturedBooks(data.books);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/books');
    }
  };

  const categoryCards = [
    { name: "Computer Science", count: "1,240 Titles", icon: Layers, desc: "Distributed systems, AI theory, algorithms & compilers" },
    { name: "Architecture & Design", count: "890 Titles", icon: Compass, desc: "Spatial ergonomics, typography & sustainable urbanism" },
    { name: "Literature & History", count: "2,450 Titles", icon: BookMarked, desc: "Classical antiquity, post-war prose & archival letters" },
    { name: "Science Fiction", count: "720 Titles", icon: Sparkles, desc: "Speculative cosmos, deep time & synthetic biology" },
    { name: "Business & Economics", count: "1,150 Titles", icon: Library, desc: "Global trade geography, sovereign finance & policy" },
    { name: "Philosophy", count: "680 Titles", icon: GraduationCap, desc: "Epistemology, civic ethics, existential contemplation" }
  ];

  const whyChooseFeatures = [
    {
      icon: BookOpen,
      title: "Scholarly & Literary Rigor",
      desc: "Every acquisition is reviewed by academic curators and literature fellows to ensure enduring intellectual value."
    },
    {
      icon: Library,
      title: "Acoustic Silence Chambers",
      desc: "Reservable reading pods and climate-controlled archival rooms engineered with certified sound dampening."
    },
    {
      icon: CalendarCheck,
      title: "Frictionless Borrowing",
      desc: "Instant catalog reservation, 21-day reading allocations, and seamless automated renewal workflows."
    },
    {
      icon: Users,
      title: "Symposiums & Reading Circles",
      desc: "Weekly author colloquiums, faculty research panels, and community book salons hosted in our central amphitheater."
    }
  ];

  return (
    <div className="flex flex-col gap-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-18 lg:pb-28">
        
        {/* Subtle Background Ambience */}
        <div className="absolute inset-0 bg-radial from-blue-900/30 via-slate-900/90 to-slate-900 pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Action Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>Premier Academic & Public Knowledge Sanctuary</span>
              </div> */}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.12] text-balance">
                Knowledge curated for the inquiring mind.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed text-pretty">
                Explore thousands of curated monographs, peer-reviewed scientific texts, and rare literature. Reserve volumes in seconds and immerse yourself in architectural study chambers.
              </p>

              {/* Live Search Interface inside Hero */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
                <div className="relative flex items-center bg-white rounded-xl shadow-lg p-1.5 border border-slate-700/60 focus-within:ring-4 focus-within:ring-blue-500/30">
                  <div className="pl-3.5 text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, category, or ISBN..."
                    className="w-full bg-transparent px-3 py-2 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-xs"
                  >
                    <span>Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-slate-400">Popular:</span>
                  <Link href="/books?category=Computer+Science" className="hover:text-blue-300 transition-colors underline decoration-slate-600 underline-offset-2">Computer Science</Link>
                  <span>·</span>
                  <Link href="/books?category=Architecture+%26+Design" className="hover:text-blue-300 transition-colors underline decoration-slate-600 underline-offset-2">Architecture</Link>
                  <span>·</span>
                  <Link href="/books?category=Philosophy" className="hover:text-blue-300 transition-colors underline decoration-slate-600 underline-offset-2">Philosophy</Link>
                </div>
              </form>

              {/* Primary Call-to-Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/books"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 shadow-sm transition-all"
                >
                  <span>Browse Full Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
                >
                  <span>About Our Sanctuary</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Architectural Hero Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800 aspect-[4/3] lg:aspect-[4/3] group">
                <img
                  src="/src/assets/images/hero_library_interior_1791722159633.jpg"
                  alt="Architectural interior of LibraHub Library with natural oak bookshelves and study tables"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Central Atrium & Research Gallery</p>
                      <p className="text-slate-400">Double-height reading pavilion open daily</p>
                    </div>
                    <span className="text-blue-400 font-mono text-[11px] tabular-nums font-medium">Floor 2–3</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Library Statistics Bar (Tabular Discipline) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-28 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {LIBRARY_STATS.map((stat, i) => (
              <div key={i} className={`flex flex-col ${i > 0 ? 'sm:pl-6' : ''} ${i >= 2 ? 'pt-4 sm:pt-0' : ''}`}>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tabular-nums tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-slate-800 mt-1">
                  {stat.label}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {stat.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Curator's Spotlight"
          title="Featured Acquisitions"
          subtitle="Handpicked titles circulating this month across contemporary computing, humanities, and design."
          action={
            <Link
              href="/books"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span>View All 24,800+ Titles</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.slice(0, 4).map((book, index) => (
            <BookCard key={book._id || book.id || book.isbn || `book-${index}`} book={book} />
          ))}
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Browse By Subject"
          title="Explore Diverse Disciplines"
          subtitle="Discover specialized holdings organized according to international standard classification."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCards.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/books?category=${encodeURIComponent(category.name)}`}
                className="group flex flex-col p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                    {category.count}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-serif">
                  {category.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed flex-1">
                  {category.desc}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-600">
                  <span>Explore Collection</span>
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Choose Our Library Section */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="The LibraHub Standard"
            title="Why Scholars & Readers Choose LibraHub"
            subtitle="Engineered for undisturbed concentration, verified scholarship, and community intellectual life."
            centered={true}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {whyChooseFeatures.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex flex-col bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white mb-4">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-serif mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Patron Membership Program
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-white leading-tight">
              Begin your intellectual journey today.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Create an institutional or community reader account to request volumes, access reading chambers, and participate in literary symposiums.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition-colors"
              >
                <span>Register for Library Card</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/books"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                <span>Explore Catalog First</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

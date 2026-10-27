import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ShieldCheck, 
  Compass, 
  Award, 
  Users, 
  Library, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import SectionHeading from '../../components/SectionHeading.jsx';

export default function AboutPage() {
  const leadership = [
    {
      name: "Dr. Alistair Montgomery",
      role: "Dean of Archival Collections",
      bio: "Former Head of Rare Monographs at the Oxford Bodleian Library with 25 years specializing in European intellectual history."
    },
    {
      name: "Elena Vasquez-Choi",
      role: "Director of Digital Knowledge Systems",
      bio: "Leading our open-access data infrastructure, decentralized citation indexes, and global interlibrary integrations."
    },
    {
      name: "Marcus Lindqvist",
      role: "Chief Architectural Conservator",
      bio: "Supervising the climate-controlled preservation chambers and acoustic comfort of our 32 dedicated research salons."
    }
  ];

  const milestones = [
    { year: "1924", title: "Founding Endowment", desc: "Established as an independent municipal civic reading academy with 5,000 foundational works." },
    { year: "1978", title: "Humanities Archive Expansion", desc: "Added the double-height southern pavilion housing classical Mediterranean and East Asian manuscripts." },
    { year: "2016", title: "Sustainable Architecture Rebuild", desc: "Award-winning renovation integrating geothermal conditioning, timber structures, and acoustic isolation." },
    { year: "2026", title: "LibraHub Digital Evolution", desc: "Launch of modern digital circulation and cloud-grounded patron borrowing architecture." }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Hero Header */}
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Our Heritage & Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-serif leading-tight">
          A modern sanctuary for enduring scholarship and quiet reflection.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          LibraHub bridges century-old archival stewardship with modern computational access. We exist to provide researchers, students, and curious readers with open access to the world’s most significant texts.
        </p>
      </div>

      {/* Architectural Story Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6 space-y-5">
          <SectionHeading
            kicker="Spatial Design"
            title="Engineered for Stillness & Focus"
            subtitle="In an era of high-velocity cognitive distraction, physical environment matters."
          />
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Designed with natural Scandinavian white oak, natural skylights, and custom-tuned acoustic baffles, our reading halls maintain ambient decibel levels below 35 dB. Every carrel is equipped with brass task illumination, ergonomic seating, and low-glare reading angles.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-2xl font-bold font-serif text-slate-900 tabular-nums">35 dB</span>
              <p className="text-xs text-slate-500 mt-1">Acoustic ambient stillness standard</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <span className="text-2xl font-bold font-serif text-slate-900 tabular-nums">100%</span>
              <p className="text-xs text-slate-500 mt-1">Free open-stack public access</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 aspect-[4/3] bg-slate-900">
            <img
              src="/assets/images/hero_library_interior_1791722159633.jpg"
              alt="LibraHub Library interior study tables and bookshelves"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Historical Milestones */}
      <div>
        <SectionHeading
          kicker="A Century of Service"
          title="Centennial Timeline"
          subtitle="One hundred years of intellectual freedom and civic discovery."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {milestones.map((m, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-2xl font-bold font-mono text-blue-600 block mb-2">{m.year}</span>
                <h3 className="text-base font-bold text-slate-900 font-serif mb-2">{m.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curatorial Leadership */}
      <div>
        <SectionHeading
          kicker="Stewards of the Collection"
          title="Curatorial & Administrative Board"
          subtitle="Experienced librarians and scholars dedicated to maintaining collection integrity."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {leadership.map((person, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-serif font-bold text-lg mb-4">
                {person.name.charAt(3)}
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">{person.name}</h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5 mb-3">{person.role}</p>
              <p className="text-xs text-slate-600 leading-relaxed flex-1">{person.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-bold font-serif">Ready to visit our library sanctuary?</h2>
          <p className="text-sm text-slate-300">
            Apply for a patron reader card online or visit our central reception desk for guided stack tours.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
          >
            Register Today
          </Link>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            Find Locations
          </Link>
        </div>
      </div>

    </div>
  );
}

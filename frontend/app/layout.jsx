import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export const metadata = {
  title: 'LibraHub - Modern Library Management System',
  description: 'A premium, modern Library Management System with rich book cataloging, advanced search, and patron access.',
};

export default function RootLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

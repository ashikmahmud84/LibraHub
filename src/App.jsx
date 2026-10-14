import React, { useEffect } from 'react';
import { NavigationProvider, usePathname, useNavigationInternal } from '../lib/next-navigation.jsx';
import { AuthProvider } from '../lib/auth-context.jsx';
import RootLayout from '../app/layout.jsx';

import HomePage from '../app/page.jsx';
import BooksPage from '../app/books/page.jsx';
import BookDetailPage from '../app/books/[id]/page.jsx';
import AboutPage from '../app/about/page.jsx';
import ContactPage from '../app/contact/page.jsx';
import LoginPage from '../app/login/page.jsx';
import RegisterPage from '../app/register/page.jsx';
import DashboardPage from '../app/dashboard/page.jsx';

function RouteRenderer() {
  const pathname = usePathname();
  const { setRouteParams } = useNavigationInternal();

  // Parse path and params
  let Component = null;
  let params = {};

  if (pathname === '/') {
    Component = HomePage;
  } else if (pathname === '/books') {
    Component = BooksPage;
  } else if (pathname.startsWith('/books/')) {
    const id = pathname.replace('/books/', '').split('/')[0].split('?')[0];
    params = { id };
    Component = () => <BookDetailPage params={params} />;
  } else if (pathname === '/about') {
    Component = AboutPage;
  } else if (pathname === '/contact') {
    Component = ContactPage;
  } else if (pathname === '/login') {
    Component = LoginPage;
  } else if (pathname === '/register') {
    Component = RegisterPage;
  } else if (pathname === '/dashboard') {
    Component = DashboardPage;
  } else {
    Component = () => (
      <div className="mx-auto max-w-xl text-center py-24 px-4">
        <h1 className="text-4xl font-bold font-serif text-slate-900 mb-3">404</h1>
        <p className="text-base text-slate-600 mb-6">The requested library page could not be located in our index.</p>
        <a href="/" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
          Return to Home
        </a>
      </div>
    );
  }

  useEffect(() => {
    setRouteParams(params);
  }, [pathname]);

  return <Component />;
}

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <RootLayout>
          <RouteRenderer />
        </RootLayout>
      </AuthProvider>
    </NavigationProvider>
  );
}

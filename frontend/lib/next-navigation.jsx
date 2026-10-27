import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NavigationContext = createContext({
  pathname: '/',
  searchParams: new URLSearchParams(),
  params: {},
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
});

export function NavigationProvider({ children }) {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/';
  });

  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const push = useCallback((url) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
      setCurrentUrl(url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const replace = useCallback((url) => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', url);
      setCurrentUrl(url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const back = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  const forward = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }, []);

  const [pathname, searchStr] = currentUrl.split('?');
  const searchParams = new URLSearchParams(searchStr || '');

  return (
    <NavigationContext.Provider
      value={{
        pathname: pathname || '/',
        searchParams,
        params: routeParams,
        setRouteParams,
        push,
        replace,
        back,
        forward,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(NavigationContext);
  return {
    push: ctx.push,
    replace: ctx.replace,
    back: ctx.back,
    forward: ctx.forward,
    prefetch: () => {},
    refresh: () => {},
  };
}

export function usePathname() {
  const ctx = useContext(NavigationContext);
  return ctx.pathname;
}

export function useSearchParams() {
  const ctx = useContext(NavigationContext);
  return ctx.searchParams;
}

export function useParams() {
  const ctx = useContext(NavigationContext);
  return ctx.params;
}

export function useNavigationInternal() {
  return useContext(NavigationContext);
}

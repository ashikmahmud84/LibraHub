const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export function apiUrl(path) {
  const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? 'http://localhost:3000' : '');

  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL must be configured for production.');
  }

  let backendOrigin;
  try {
    const parsedUrl = new URL(apiBaseUrl);
    if (
      !['http:', 'https:'].includes(parsedUrl.protocol) ||
      parsedUrl.pathname !== '/' ||
      parsedUrl.search ||
      parsedUrl.hash ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      throw new Error();
    }
    backendOrigin = parsedUrl.origin;
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute backend origin without a path.');
  }

  if (import.meta.env.PROD && typeof window !== 'undefined' && backendOrigin === window.location.origin) {
    throw new Error('VITE_API_BASE_URL must point to the backend, not the frontend origin.');
  }

  return `${backendOrigin}/${path.replace(/^\/+/, '')}`;
}

export function coverImageUrl(url) {
  if (!url || typeof url !== 'string') return '';

  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/assets/images/');
  }

  if (url.startsWith('/uploads/')) {
    return apiUrl(url);
  }

  return url;
}

export async function getAuthHeaders(user, headers = {}) {
  const token = typeof user?.getIdToken === 'function' ? await user.getIdToken() : '';

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

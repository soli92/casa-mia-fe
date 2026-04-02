export const LS_TOKEN_KEY = 'token';
export const LS_REFRESH_KEY = 'refreshToken';
export const LS_USER_KEY = 'user';
export const LS_FAMILY_KEY = 'family';

export function persistSession({ user, family }) {
  if (typeof window === 'undefined') return;
  if (user != null) {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  }
  if (family != null) {
    localStorage.setItem(LS_FAMILY_KEY, JSON.stringify(family));
  }
}

export function loadStoredSession() {
  if (typeof window === 'undefined') {
    return { user: null, family: null };
  }
  try {
    const u = localStorage.getItem(LS_USER_KEY);
    const f = localStorage.getItem(LS_FAMILY_KEY);
    return {
      user: u ? JSON.parse(u) : null,
      family: f ? JSON.parse(f) : null,
    };
  } catch {
    return { user: null, family: null };
  }
}

export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_REFRESH_KEY);
  localStorage.removeItem(LS_USER_KEY);
  localStorage.removeItem(LS_FAMILY_KEY);
}

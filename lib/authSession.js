export const LS_TOKEN_KEY = 'token';
export const LS_REFRESH_KEY = 'refreshToken';
export const LS_USER_KEY = 'user';

export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_REFRESH_KEY);
  localStorage.removeItem(LS_USER_KEY);
}

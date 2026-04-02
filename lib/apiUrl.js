/**
 * Base URL API senza slash finale (allineata a axios baseURL `/api`).
 * @param {string | undefined} raw — es. process.env.NEXT_PUBLIC_API_URL
 */
export function resolveApiBaseUrl(raw) {
  const v = raw != null && String(raw).trim() !== '' ? String(raw) : 'http://localhost:3001';
  return v.replace(/\/+$/, '');
}

/**
 * URL WebSocket verso il backend (path `/ws`), da base HTTP(S) dell’API.
 */
export function resolveWebSocketUrl(rawApiBase) {
  const base = resolveApiBaseUrl(rawApiBase);
  if (base.startsWith('https://')) {
    return `wss://${base.slice('https://'.length)}/ws`;
  }
  if (base.startsWith('http://')) {
    return `ws://${base.slice('http://'.length)}/ws`;
  }
  return 'ws://localhost:3001/ws';
}

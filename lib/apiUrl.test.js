import { describe, it, expect } from 'vitest';
import { resolveApiBaseUrl, resolveWebSocketUrl } from './apiUrl';

describe('resolveApiBaseUrl', () => {
  it('default localhost senza slash', () => {
    expect(resolveApiBaseUrl(undefined)).toBe('http://localhost:3001');
    expect(resolveApiBaseUrl('')).toBe('http://localhost:3001');
  });

  it('rimuove slash finali', () => {
    expect(resolveApiBaseUrl('https://api.example.com/')).toBe('https://api.example.com');
    expect(resolveApiBaseUrl('https://api.example.com///')).toBe('https://api.example.com');
  });
});

describe('resolveWebSocketUrl', () => {
  it('http → ws + /ws', () => {
    expect(resolveWebSocketUrl('http://localhost:3001')).toBe('ws://localhost:3001/ws');
    expect(resolveWebSocketUrl('http://localhost:3001/')).toBe('ws://localhost:3001/ws');
  });

  it('https → wss + /ws', () => {
    expect(resolveWebSocketUrl('https://api.example.com')).toBe('wss://api.example.com/ws');
  });
});

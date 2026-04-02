import { describe, it, expect, vi, beforeEach } from 'vitest';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('./apiUrl', () => ({
  resolveApiBaseUrl: vi.fn(() => 'http://localhost:3001'),
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: http.get,
      post: http.post,
      delete: http.delete,
      patch: http.patch,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

import {
  getDocuments,
  createDocumentFolder,
  renameDocumentFolder,
  deleteDocumentFolder,
  presignDocument,
  commitDocument,
  getDocumentAccessUrl,
  deleteDocument,
} from './api';

describe('api documenti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getDocuments chiama GET /documents', async () => {
    http.get.mockResolvedValue({ data: { folders: [], items: [] } });
    const out = await getDocuments();
    expect(http.get).toHaveBeenCalledWith('/documents');
    expect(out).toEqual({ folders: [], items: [] });
  });

  it('createDocumentFolder invia POST /documents/folders', async () => {
    http.post.mockResolvedValue({ data: { id: 'f1', name: 'X' } });
    await createDocumentFolder('  Cartella  ');
    expect(http.post).toHaveBeenCalledWith('/documents/folders', { name: '  Cartella  ' });
  });

  it('renameDocumentFolder invia PATCH con nome', async () => {
    http.patch.mockResolvedValue({ data: {} });
    await renameDocumentFolder('fid', 'Nuovo');
    expect(http.patch).toHaveBeenCalledWith('/documents/folders/fid', { name: 'Nuovo' });
  });

  it('deleteDocumentFolder invia DELETE sulla cartella', async () => {
    http.delete.mockResolvedValue({ data: { message: 'ok' } });
    await deleteDocumentFolder('fid');
    expect(http.delete).toHaveBeenCalledWith('/documents/folders/fid');
  });

  it('presignDocument senza folderId omette il campo', async () => {
    http.post.mockResolvedValue({ data: { uploadUrl: 'u', storageKey: 'k' } });
    await presignDocument({
      originalName: 'a.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
    });
    expect(http.post).toHaveBeenCalledWith('/documents/presign', {
      originalName: 'a.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
    });
  });

  it('presignDocument con folderId lo include nel body', async () => {
    http.post.mockResolvedValue({ data: {} });
    await presignDocument({
      originalName: 'a.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
      folderId: 'f1',
    });
    expect(http.post).toHaveBeenCalledWith('/documents/presign', {
      originalName: 'a.pdf',
      contentType: 'application/pdf',
      sizeBytes: 100,
      folderId: 'f1',
    });
  });

  it('commitDocument inoltra il payload', async () => {
    http.post.mockResolvedValue({ data: { id: 'd1' } });
    const payload = {
      storageKey: 'families/x/y',
      originalName: 'y',
      contentType: 'application/pdf',
      sizeBytes: 1,
      folderId: 'f1',
    };
    await commitDocument(payload);
    expect(http.post).toHaveBeenCalledWith('/documents/commit', payload);
  });

  it('getDocumentAccessUrl chiama GET .../access-url', async () => {
    http.get.mockResolvedValue({ data: { url: 'https://signed', expiresIn: 900 } });
    const out = await getDocumentAccessUrl('docid');
    expect(http.get).toHaveBeenCalledWith('/documents/docid/access-url');
    expect(out.url).toBe('https://signed');
  });

  it('deleteDocument chiama DELETE /documents/:id', async () => {
    http.delete.mockResolvedValue({ data: { message: 'ok' } });
    await deleteDocument('did');
    expect(http.delete).toHaveBeenCalledWith('/documents/did');
  });
});

/**
 * Storage Service Factory
 * ───────────────────────
 * Usage:
 *   const storage = await getStorage();
 *   const { url } = await storage.upload(file);
 */
import { config } from '../config';
import { LocalStorage } from './localAdapter';
import type { StorageService } from './types';

export type { StorageService, UploadResult } from './types';

let _instance: StorageService | null = null;

export async function getStorage(): Promise<StorageService> {
  if (_instance) return _instance;

  switch (config.storage) {
    case 'supabase': {
      const { SupabaseStorageAdapter } = await import('./supabaseStorage');
      _instance = new SupabaseStorageAdapter();
      break;
    }
    case 'r2': {
      const { R2Storage } = await import('./r2Storage');
      _instance = new R2Storage();
      break;
    }
    case 's3': {
      const { S3Storage } = await import('./s3Storage');
      _instance = new S3Storage();
      break;
    }
    default: {
      _instance = new LocalStorage();
    }
  }

  return _instance;
}

export function resetStorage(): void {
  _instance = null;
}

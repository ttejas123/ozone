/**
 * Database Service Factory
 * ────────────────────────
 * Reads the configured provider and returns the correct DatabaseService adapter.
 * Adapters are loaded lazily — vendor SDKs are never bundled unless their
 * provider is selected via VITE_DB_PROVIDER.
 *
 * Usage:
 *   const db = await getDatabase();
 *   const link = await db.createShortUrl({ originalUrl, shortUrl });
 */
import { config } from '../config';
import { LocalDatabase } from './localAdapter';
import type { DatabaseService } from './types';

export type { DatabaseService, ShortLink } from './types';

let _instance: DatabaseService | null = null;

export async function getDatabase(): Promise<DatabaseService> {
  if (_instance) return _instance;

  switch (config.database) {
    case 'supabase': {
      const { SupabaseDatabase } = await import('./supabaseAdapter');
      _instance = new SupabaseDatabase();
      break;
    }
    case 'firebase': {
      const { FirebaseDatabase } = await import('./firebaseAdapter');
      _instance = new FirebaseDatabase();
      break;
    }
    default: {
      _instance = new LocalDatabase();
    }
  }

  return _instance;
}

/** Reset singleton — useful for testing or hot provider switching in dev. */
export function resetDatabase(): void {
  _instance = null;
}

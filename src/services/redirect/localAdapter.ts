/**
 * Local Redirect Adapter
 * ───────────────────────
 * Implements RedirectService using localStorage (via the database adapter).
 * Uses the LocalDatabase under the hood for consistency.
 * Zero external dependencies.
 */
import type { RedirectService } from './types';
import { LocalDatabase } from '../database/localAdapter';

export class LocalRedirect implements RedirectService {
  private readonly db = new LocalDatabase();

  async resolve(code: string): Promise<string | null> {
    return this.db.getShortUrl(code);
  }

  async register(code: string, originalUrl: string): Promise<void> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    await this.db.createShortUrl({
      originalUrl,
      shortUrl: `${baseUrl}/t/${code}`,
    });
  }
}

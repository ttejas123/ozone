/**
 * Local Database Adapter
 * ─────────────────────
 * Implements DatabaseService using browser localStorage.
 * This is the default adapter — zero external dependencies.
 * Drop-in replacement for the legacy tinyurl-generator/utils.ts logic.
 */
import type { DatabaseService, ShortLink } from './types';

const STORAGE_KEY = 'tinyurl_history';

export class LocalDatabase implements DatabaseService {
  async createShortUrl(data: { originalUrl: string; shortUrl: string }): Promise<ShortLink> {
    const code = Math.random().toString(36).substring(2, 8);
    const shortUrl = data.shortUrl || `${window.location.origin}/t/${code}`;

    const link: ShortLink = {
      id: code,
      originalUrl: data.originalUrl,
      shortUrl,
      createdAt: Date.now(),
    };

    const history = await this.getHistory();
    history.unshift(link);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    return link;
  }

  async getShortUrl(code: string): Promise<string | null> {
    const history = await this.getHistory();
    const found = history.find((l) => l.id === code);
    return found ? found.originalUrl : null;
  }

  async getHistory(): Promise<ShortLink[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ShortLink[]) : [];
    } catch {
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

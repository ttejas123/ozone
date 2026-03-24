/**
 * TinyURL Generator — Service Layer Consumer
 * ─────────────────────────────────────────────
 * All persistence and redirect logic now goes through the service layer.
 * Switching providers (localStorage → Supabase → Firebase) requires
 * only changing VITE_DB_PROVIDER and VITE_REDIRECT_PROVIDER in .env.
 */
import { getDatabase, getRedirect } from '@/services';
export type { ShortLink } from '@/services';

/**
 * Create a new short link and persist it via the database service.
 * Previously: direct localStorage write — now: db.createShortUrl()
 */
export const generateShortLink = async (originalUrl: string) => {
  const db = await getDatabase();
  const redirect = await getRedirect();

  const code = Math.random().toString(36).substring(2, 8);
  const shortUrl = `${window.location.origin}/t/${code}`;

  // Persist via database service (localStorage by default)
  const link = await db.createShortUrl({ originalUrl, shortUrl });

  // Register the redirect mapping
  await redirect.register(code, originalUrl);

  return link;
};

/**
 * Get all previously created short links, newest first.
 * Previously: JSON.parse(localStorage.getItem(...)) — now: db.getHistory()
 */
export const getHistory = async () => {
  const db = await getDatabase();
  return db.getHistory();
};

/**
 * Clear all short link history.
 * Previously: localStorage.removeItem(...) — now: db.clearHistory()
 */
export const clearHistory = async () => {
  const db = await getDatabase();
  await db.clearHistory();
};

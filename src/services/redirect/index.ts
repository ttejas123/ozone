/**
 * Redirect Service Factory
 * ─────────────────────────
 * Usage:
 *   const redirect = await getRedirect();
 *   const url = await redirect.resolve('abc123');
 */
import { config } from '../config';
import { LocalRedirect } from './localAdapter';
import type { RedirectService } from './types';

export type { RedirectService } from './types';

let _instance: RedirectService | null = null;

export async function getRedirect(): Promise<RedirectService> {
  if (_instance) return _instance;

  switch (config.redirect) {
    case 'cloudflare': {
      const { CloudflareRedirect } = await import('./cloudflareAdapter');
      _instance = new CloudflareRedirect();
      break;
    }
    case 'node': {
      const { NodeRedirect } = await import('./nodeAdapter');
      _instance = new NodeRedirect();
      break;
    }
    default: {
      _instance = new LocalRedirect();
    }
  }

  return _instance;
}

export function resetRedirect(): void {
  _instance = null;
}

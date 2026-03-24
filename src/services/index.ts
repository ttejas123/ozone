/**
 * Unified Services Barrel Export
 * ────────────────────────────────
 * Import all service factories from this single entry point.
 *
 * Usage:
 *   import { getDatabase, getStorage, getCompute, getRedirect } from '@/services';
 */
export { getDatabase, resetDatabase } from './database';
export type { DatabaseService, ShortLink } from './database';

export { getStorage, resetStorage } from './storage';
export type { StorageService, UploadResult } from './storage';

export { getCompute, resetCompute } from './compute';
export type { ComputeService, CompressionAlgorithm } from './compute';

export { getRedirect, resetRedirect } from './redirect';
export type { RedirectService } from './redirect';

export { config } from './config';
export type { DatabaseProvider, StorageProvider, ComputeProvider, RedirectProvider } from './config';

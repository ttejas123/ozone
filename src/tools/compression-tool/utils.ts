/**
 * Compression Tool — Service Layer Consumer
 * ───────────────────────────────────────────
 * compress/decompress logic now routes through the compute service.
 * Switching VITE_COMPUTE_PROVIDER env var changes the backend without
 * touching any component or UI code.
 */
import { getCompute } from '@/services';
export type { CompressionAlgorithm } from '@/services';

/**
 * Compress a string and return base64-encoded output.
 * Previously: direct pako.deflate() — now: compute.compress()
 */
export const compressData = async (input: string): Promise<string> => {
  const compute = await getCompute();
  return compute.compress(input, 'deflate');
};

/**
 * Decompress a base64-encoded string back to the original.
 * Previously: direct pako.inflate() — now: compute.decompress()
 */
export const decompressData = async (input: string): Promise<string> => {
  const compute = await getCompute();
  return compute.decompress(input, 'deflate');
};

// ── Pure helpers (no service dependency) ─────────────────────────────────────

export const getByteSize = (str: string): number => {
  if (!str) return 0;
  return new Blob([str]).size;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


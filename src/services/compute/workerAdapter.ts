/**
 * Worker Compute Adapter (Browser / pako)
 * ─────────────────────────────────────────
 * Implements ComputeService using the pako library in the browser.
 * This is the default adapter — wraps the existing compression-tool/utils.ts logic.
 * pako is loaded lazily so it doesn't affect the main bundle size.
 */
import type { ComputeService, CompressionAlgorithm } from './types';

// ── Helpers (previously in compression-tool/utils.ts) ────────────────────────

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ─────────────────────────────────────────────────────────────────────────────

export class WorkerComputeAdapter implements ComputeService {
  async compress(data: string, algorithm: CompressionAlgorithm = 'deflate'): Promise<string> {
    const pako = await import('pako');
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);

    let compressed: Uint8Array;
    if (algorithm === 'gzip') {
      compressed = pako.gzip(buffer);
    } else {
      // 'deflate' | 'brotli' (brotli falls back to deflate client-side)
      compressed = pako.deflate(buffer);
    }

    return bytesToBase64(compressed);
  }

  async decompress(data: string, algorithm: CompressionAlgorithm = 'deflate'): Promise<string> {
    const pako = await import('pako');
    const bytes = base64ToBytes(data);

    let decompressed: Uint8Array;
    if (algorithm === 'gzip') {
      decompressed = pako.ungzip(bytes);
    } else {
      decompressed = pako.inflate(bytes);
    }

    return new TextDecoder().decode(decompressed);
  }
}

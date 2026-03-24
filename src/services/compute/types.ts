// ─── Compute Service Interface ────────────────────────────────────────────────
// All compute adapters must implement this interface.

export type CompressionAlgorithm = 'deflate' | 'gzip' | 'brotli';

export interface ComputeService {
  /**
   * Compress a UTF-8 string and return a base64-encoded result.
   * @param data      Raw string to compress.
   * @param algorithm Compression algorithm to use. Defaults to 'deflate'.
   */
  compress(data: string, algorithm?: CompressionAlgorithm): Promise<string>;

  /**
   * Decompress a base64-encoded compressed string back to a UTF-8 string.
   * @param data      Base64 compressed string.
   * @param algorithm Algorithm that was used during compression. Defaults to 'deflate'.
   */
  decompress(data: string, algorithm?: CompressionAlgorithm): Promise<string>;
}

// ─── Storage Service Interface ────────────────────────────────────────────────
// All storage adapters must implement this interface.

export interface UploadResult {
  /** Public-accessible URL for the uploaded file. */
  url: string;
  /** Storage key / path used to reference or delete the file later. */
  key: string;
}

export interface StorageService {
  /**
   * Upload a File (or Blob) to the configured storage provider.
   * @param file   The file to upload.
   * @param path   Optional path prefix (e.g. 'images/', 'uploads/').
   */
  upload(file: File | Blob, path?: string): Promise<UploadResult>;

  /**
   * Delete a previously-uploaded file by its storage key.
   */
  delete(key: string): Promise<void>;

  /**
   * Derive the public URL for a given storage key.
   * Useful for constructing URLs without making a network call.
   */
  getUrl(key: string): string;
}

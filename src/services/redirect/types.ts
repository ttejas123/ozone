// ─── Redirect Service Interface ───────────────────────────────────────────────
// All redirect adapters must implement this interface.

export interface RedirectService {
  /**
   * Resolve a short code to its original URL.
   * Returns null if the code is not registered.
   */
  resolve(code: string): Promise<string | null>;

  /**
   * Register a short code → original URL mapping in the backend.
   */
  register(code: string, originalUrl: string): Promise<void>;
}

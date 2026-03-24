/**
 * Compute Service Factory
 * ────────────────────────
 * Usage:
 *   const compute = await getCompute();
 *   const compressed = await compute.compress(data, 'deflate');
 */
import { config } from '../config';
import { WorkerComputeAdapter } from './workerAdapter';
import type { ComputeService } from './types';

export type { ComputeService, CompressionAlgorithm } from './types';

let _instance: ComputeService | null = null;

export async function getCompute(): Promise<ComputeService> {
  if (_instance) return _instance;

  switch (config.compute) {
    case 'lambda': {
      const { LambdaComputeAdapter } = await import('./lambdaAdapter');
      _instance = new LambdaComputeAdapter();
      break;
    }
    case 'supabase-function': {
      const { SupabaseFunctionAdapter } = await import('./supabaseFunctionAdapter');
      _instance = new SupabaseFunctionAdapter();
      break;
    }
    default: {
      // 'worker' — uses pako in-browser (default)
      _instance = new WorkerComputeAdapter();
    }
  }

  return _instance;
}

export function resetCompute(): void {
  _instance = null;
}

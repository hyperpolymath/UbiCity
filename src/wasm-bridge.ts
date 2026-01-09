/**
 * Bridge to WASM modules for performance-critical operations
 * Loads and initializes the Rust-compiled WASM
 */

let wasmModule: any = null;

export async function initWasm(): Promise<void> {
  if (wasmModule) return;

  // Load WASM module
  const wasmPath = new URL('../wasm/pkg/ubicity_wasm_bg.wasm', import.meta.url);
  const wasmBytes = await Deno.readFile(wasmPath);
  const wasmResult = await WebAssembly.instantiate(wasmBytes);

  // Initialize exports
  const { instance } = wasmResult;
  wasmModule = instance.exports;
}

/**
 * High-performance validation using WASM
 */
export function validateExperienceWasm(experience: unknown): {
  valid: boolean;
  errors: string[];
} {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call initWasm() first.');
  }

  const json = JSON.stringify(experience);
  const result = wasmModule.validate(json);
  return JSON.parse(result);
}

/**
 * High-performance domain network generation using WASM
 */
export function generateDomainNetworkWasm(experiences: unknown[]): {
  nodes: Array<{ id: string; size: number }>;
  edges: Array<{ source: string; target: string; weight: number }>;
} {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call initWasm() first.');
  }

  const json = JSON.stringify(experiences);
  const result = wasmModule.generate_domain_network(json);
  return JSON.parse(result);
}

/**
 * High-performance Jaccard similarity using WASM
 */
export function jaccardSimilarityWasm(set1: string[], set2: string[]): number {
  if (!wasmModule) {
    throw new Error('WASM module not initialized. Call initWasm() first.');
  }

  const json1 = JSON.stringify(set1);
  const json2 = JSON.stringify(set2);
  return wasmModule.jaccard_similarity(json1, json2);
}

// Auto-initialize on import (can be disabled if needed)
// await initWasm();

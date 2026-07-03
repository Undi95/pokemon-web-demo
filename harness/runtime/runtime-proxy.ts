/**
 * runtime-proxy.ts — proxys « globals 1:1 » vers l'état du DecompRuntime.
 *
 * Les globals C (gTasks, gSprites, gPaletteFade…) vivent sur le substrat
 * runtime (instance DecompRuntime, créée au boot). Les modules miroirs 1:1
 * (src/task.ts, src/palette.ts…) exportent ces noms via `runtimeProxy(prop)`.
 * Les modules anti-cycle (sprite.ts) utilisent `makeStateProxy` directement
 * (harness/runtime/state-proxy.ts, zéro import) avec leur getter injecté.
 */
import { getRuntime } from './decomp-globals';
import { makeStateProxy } from './state-proxy';

export { makeStateProxy };

export function runtimeProxy<T extends object = Record<string | number, unknown>>(prop: string): T {
  return makeStateProxy<T>(() => getRuntime(), prop);
}

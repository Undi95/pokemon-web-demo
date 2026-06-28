/**
 * bytevm-boot.ts — initialisation du moteur byte-VM en PRODUCTION (swap Phase 5).
 *
 * Charge l'image bytecode globale + la cmd-table (enum) + la table des specials,
 * puis installe les handlers dans `gScriptCmdTable`. Idempotent.
 *
 * Module séparé (pas dans script.ts) pour éviter le cycle d'import
 * script.ts → scrcmd.ts → script.ts (getText). Appelé en import DYNAMIQUE
 * awaité depuis `loadMapScripts`.
 */

import { loadByteVmImage } from './script';
import { installByteVmHandlers, setSpecialNames } from './scrcmd';

let _installed = false;

export function isByteVmEngineReady(): boolean { return _installed; }

/** Charge l'image + installe handlers + specials (une fois). */
export async function loadByteVmEngine(): Promise<void> {
  if (_installed) return;
  await loadByteVmImage();
  const enumEntries = await (await fetch('/decomp/em/script-cmd-table.json')).json().then((t) => t.enum);
  const specials: string[] = await (await fetch('/decomp/em/specials-table.json')).json().then((t) => t.specials);
  setSpecialNames(specials);
  const n = installByteVmHandlers(enumEntries);
  _installed = true;
  console.log(`[byte-vm SWAP] moteur byte-VM installé : ${n} handlers, ${specials.length} specials`);
}

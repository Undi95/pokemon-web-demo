/**
 * String buffers du décomp : `gSpecialVar_StringVarN` (N=1..4).
 *
 * Le décomp utilise des opcodes `bufferspeciesname N, SPECIES_X`,
 * `bufferpartymonnick`, `bufferleadmonspeciesname`, etc. pour remplir des
 * buffers texte référencés ensuite dans les msgbox via `{STR_VAR_N}`.
 *
 * Certains `special` C font la même chose (ex: `GetRivalSonDaughterString` set
 * STR_VAR_1 à "fils" ou "fille" selon le genre du rival).
 *
 * Notre runtime ne supporte pas tout, mais on a au moins l'infra pour les
 * opcodes critiques. Voir `script-runner.ts` (table SPECIALS + opcodes
 * bufferXXX) et `dialogue-box.ts` (substitution dans `{STR_VAR_N}`).
 */

const buffers: Record<number, string> = { 1: '', 2: '', 3: '', 4: '' };

export function setStringVar(n: number, value: string): void {
  buffers[n] = value ?? '';
  // Audit session 126 : sync vers `globalThis.gStringVarN` (= module-level
  // `gStringVar1..4` dans gba-text-system.ts). `StringExpandPlaceholders`
  // (gba-text-system.ts:430-432) lit ces gStringVarN pour substituer
  // `{STR_VAR_N}` dans les texts décomp. Avant ce sync : opcodes bufferXXX
  // écrivaient dans `buffers[]` mais le placeholder substitution lisait
  // `gStringVarN` (= toujours empty) → "ton ." au lieu de "ton TREECKO".
  if (n >= 1 && n <= 4) {
    (globalThis as Record<string, unknown>)[`gStringVar${n}`] = value ?? '';
  }
}

export function getStringVar(n: number): string {
  return buffers[n] ?? '';
}

export function clearStringVars(): void {
  for (const k of Object.keys(buffers)) {
    buffers[Number(k)] = '';
    (globalThis as Record<string, unknown>)[`gStringVar${k}`] = '';
  }
}

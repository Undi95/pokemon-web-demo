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
}

export function getStringVar(n: number): string {
  return buffers[n] ?? '';
}

export function clearStringVars(): void {
  for (const k of Object.keys(buffers)) buffers[Number(k)] = '';
}

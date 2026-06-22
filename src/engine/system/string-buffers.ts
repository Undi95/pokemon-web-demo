/**
 * String buffers du décomp : `gStringVar1..4` (EWRAM u8[] charmap).
 *
 * Le décomp utilise des opcodes `bufferspeciesname N, SPECIES_X`,
 * `bufferpartymonnick`, `bufferleadmonspeciesname`, etc. pour remplir des
 * buffers texte référencés ensuite dans les msgbox via `{STR_VAR_N}`.
 * Certains `special` C font pareil (ex `GetRivalSonDaughterString`).
 *
 * Migration TEXTE byte-level (flip direct, 2026-06-06) : les buffers SONT les
 * `gStringVar1..4` du miroir `src/game/string_util.ts` (Uint8Array charmap),
 * source UNIQUE. `setStringVar(n, value)` reçoit la SOURCE FR lisible (nom de
 * mon/objet, nombre…) et l'encode en bytes charmap (= notre préproc `encodeOwText`)
 * dans le buffer byte. `StringExpandPlaceholders` (string_util) lit ces buffers
 * pour substituer `{STR_VAR_N}` (bytes 0xFD + id).
 */

import { gStringVar1, gStringVar2, gStringVar3, gStringVar4, StringCopy } from '../../../include/string_util';
import { encodeOwText, decodeOwBytes } from '../../../include/text';
import { EOS } from '../../../include/constants/characters';

/** Le buffer byte `gStringVarN` (réf. stable, contenu mutable). */
function _buf(n: number): Uint8Array | undefined {
  switch (n) {
    case 1: return gStringVar1;
    case 2: return gStringVar2;
    case 3: return gStringVar3;
    case 4: return gStringVar4;
    default: return undefined;
  }
}

/** Remplit `gStringVarN` : encode la source FR `value` en bytes charmap (préproc)
 *  puis StringCopy dans le buffer byte. */
export function setStringVar(n: number, value: string): void {
  const buf = _buf(n);
  if (buf) StringCopy(buf, encodeOwText(value));
}

/** Lit `gStringVarN` décodé → JS-string lisible (best-effort, devtools / callers
 *  string non encore migrés). */
export function getStringVar(n: number): string {
  const buf = _buf(n);
  return buf ? decodeOwBytes(buf) : '';
}

/** Vide les 4 buffers (pose EOS en tête). */
export function clearStringVars(): void {
  for (let n = 1; n <= 4; n++) {
    const b = _buf(n);
    if (b) b[0] = EOS;
  }
}

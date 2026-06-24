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
import { PLAYER_NAME_LENGTH } from '../../../include/constants/global';
import { gSaveBlock2Ptr } from '../save/save-block-state';

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

// ─── Accesseurs gSaveBlock2Ptr->playerName (Stage 4 : stockage bytes charmap) ──
// 1:1 décomp : `u8 playerName[PLAYER_NAME_LENGTH + 1]` (charmap). Notre save =
// JSON.stringify → on stocke `number[]` (round-trip JSON, comme gSaveBlock1->flags ;
// un Uint8Array ne round-trip pas). Les consommateurs encore JS-string passent par
// GetPlayerNameString (décode, transitoire) ; les byte-natifs par GetPlayerName.
// Robustes au format LEGACY (ancienne save = string) : décodent/encodent au vol.

/** Bytes charmap du nom du joueur (vue `u8*`, 1:1 `gSaveBlock2Ptr->playerName`). */
export function GetPlayerName(): Uint8Array {
  const pn = (gSaveBlock2Ptr as { playerName?: unknown }).playerName;
  if (pn instanceof Uint8Array) return pn;
  if (Array.isArray(pn)) return Uint8Array.from(pn as number[]);
  if (typeof pn === 'string') return encodeOwText(pn);   // legacy save (string)
  return new Uint8Array([EOS]);
}

/** Nom du joueur décodé en JS-string (transitoire — callers pas encore byte-natifs).
 *  Le décodage est accent-correct (cf. fix decodeOwBytes glyphe latin vs kana). */
export function GetPlayerNameString(): string {
  const pn = (gSaveBlock2Ptr as { playerName?: unknown }).playerName;
  if (typeof pn === 'string') return pn;                 // legacy save (string)
  return decodeOwBytes(GetPlayerName());
}

/** Écrit `gSaveBlock2Ptr->playerName` : encode `name` (FR lisible) en bytes charmap,
 *  tronqué à PLAYER_NAME_LENGTH + EOS terminateur (1:1 `StringCopy(playerName, src)`). */
export function SetPlayerName(name: string | Uint8Array): void {
  const bytes = typeof name === 'string' ? encodeOwText(name) : name;
  const out: number[] = [];
  for (let i = 0; i < PLAYER_NAME_LENGTH && i < bytes.length && bytes[i] !== EOS; i++) {
    out.push(bytes[i]);
  }
  out.push(EOS);
  (gSaveBlock2Ptr as { playerName?: number[] }).playerName = out;
}

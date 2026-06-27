/**
 * decoration.ts — port 1:1 (simplifié) `src/decoration.c` : ajout/retrait/check
 * des décorations du joueur, stockées dans `gSaveBlock1Ptr->decorations[]`.
 *
 * Source UNIQUE (voie A) appelée par le moteur parsé (`scrcmd.ts`) ET le byte-VM
 * (`scrcmd_bytevm.ts`) → zéro divergence au swap.
 *
 * Adaptation ASSUMÉE partagée : la PLACEMENT UI (secret base / chambre) n'est pas
 * portée ; seul le suivi possession (decorations[]) l'est. Le décomp gère un
 * inventaire par catégorie ; ce port = liste plate, capacité 256 (comportement
 * identique pour adddecoration/checkdecorspace/checkdecor/removedecoration).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';

const DECORATION_CAPACITY = 256;

/** 1:1 décomp `gSaveBlock1Ptr->decorations[]` (lazy-init). */
function decorationsArr(): number[] {
  if (!gSaveBlock1Ptr) return [];
  if (!gSaveBlock1Ptr.decorations) gSaveBlock1Ptr.decorations = [];
  return gSaveBlock1Ptr.decorations;
}

/** 1:1 décomp `DecorationAdd(decorId)` → gSpecialVar_Result (1 = ajouté, 0 = plein). */
export function DecorationAdd(decorId: number): number {
  const arr = decorationsArr();
  if (arr.length < DECORATION_CAPACITY) { arr.push(decorId); return 1; }
  return 0;
}

/** 1:1 décomp `DecorationRemove(decorId)` → 1 = retiré, 0 = absent. */
export function DecorationRemove(decorId: number): number {
  const arr = decorationsArr();
  const idx = arr.indexOf(decorId);
  if (idx >= 0) { arr.splice(idx, 1); return 1; }
  return 0;
}

/** 1:1 décomp `DecorationCheckSpace(decorId)` → 1 = place dispo, 0 = plein. */
export function DecorationCheckSpace(_decorId: number): number {
  return decorationsArr().length < DECORATION_CAPACITY ? 1 : 0;
}

/** 1:1 décomp `CheckHasDecoration(decorId)` → 1 = possédée, 0 = non. */
export function CheckHasDecoration(decorId: number): number {
  return decorationsArr().includes(decorId) ? 1 : 0;
}

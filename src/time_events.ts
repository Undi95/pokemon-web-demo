/**
 * time_events.ts — miroir 1:1 de `src/time_events.c` (Mirage Island RNG quotidien).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/time_events.c`.
 *
 * Concept :
 *   L'île Mirage (Pacifidlog / Route 130) apparaît un jour donné si un POKéMON de
 *   l'équipe a `personality & 0xFFFF == (mirageRnd >> 16)`. La valeur `mirageRnd`
 *   (u32, stockée en deux vars u16 VAR_MIRAGE_RND_H/L) est AVANCÉE chaque jour par
 *   `UpdateMirageRnd` (appelée depuis `UpdatePerDay`, clock.c) via un LCG ISO C.
 *   Sans cette avance quotidienne, mirageRnd reste figé → l'île n'apparaît/disparaît
 *   jamais selon le jour (bug). `IsMirageIslandPresent` (le test de présence) vit
 *   déjà dans specials-registry et lit VAR_MIRAGE_RND_H — ce module fournit l'avance.
 *
 *  Note placement : `IsMirageIslandPresent` + `UpdateShoalTideFlag` (mêmes time_
 *  events.c) sont déjà portés dans specials-registry (B4) ; non déplacés ici pour ne
 *  pas toucher de chemins qui marchent (consolidation possible plus tard).
 */

import { VarGet, VarSet } from './engine/script/script-vars';
import { Random } from './random';

const VAR_MIRAGE_RND_H = 'VAR_MIRAGE_RND_H';  // 1:1 décomp vars.h:54 (0x4024).
const VAR_MIRAGE_RND_L = 'VAR_MIRAGE_RND_L';  // 1:1 décomp vars.h:55 (0x4025).

/** 1:1 décomp `ISO_RANDOMIZE2(val)` (random.h:17) = `1103515245 * val + 12345`,
 *  arithmétique 32-bit avec wraparound. `Math.imul` reproduit le produit 32-bit
 *  exact ; `>>> 0` ramène en u32. */
function ISO_RANDOMIZE2(val: number): number {
  return (Math.imul(1103515245, val) + 12345) >>> 0;
}

/** 1:1 décomp `GetMirageRnd(void)` (time_events.c:12) :
 *    return (VarGet(VAR_MIRAGE_RND_H) << 16) | VarGet(VAR_MIRAGE_RND_L). */
function GetMirageRnd(): number {
  const hi = VarGet(VAR_MIRAGE_RND_H);
  const lo = VarGet(VAR_MIRAGE_RND_L);
  return ((hi << 16) | lo) >>> 0;
}

/** 1:1 décomp `SetMirageRnd(rnd)` (time_events.c:19) :
 *    VarSet(VAR_MIRAGE_RND_H, rnd >> 16) ; VarSet(VAR_MIRAGE_RND_L, rnd).
 *  Les vars sont u16 → on masque explicitement les 16 bits hauts/bas. */
function SetMirageRnd(rnd: number): void {
  VarSet(VAR_MIRAGE_RND_H, (rnd >>> 16) & 0xFFFF);
  VarSet(VAR_MIRAGE_RND_L, rnd & 0xFFFF);
}

/** 1:1 décomp `InitMirageRnd(void)` (time_events.c:25, marquée `// unused`) :
 *    SetMirageRnd((Random() << 16) | Random()). Portée pour fidélité du fichier. */
export function InitMirageRnd(): void {
  SetMirageRnd((((Random() << 16) | Random()) >>> 0));
}

/** 1:1 décomp `UpdateMirageRnd(days)` (time_events.c:31) : avance la valeur mirage
 *  de `days` pas de LCG ISO_RANDOMIZE2, puis la restocke. Appelée par UpdatePerDay
 *  (clock.c) à chaque changement de jour. */
export function UpdateMirageRnd(days: number): void {
  let rnd = GetMirageRnd();
  while (days) {
    rnd = ISO_RANDOMIZE2(rnd);
    days--;
  }
  SetMirageRnd(rnd);
}

// Exposition dev (= test runtime / sonde déterministe), sans effet sur le jeu.
// Calqué sur field_message_box ("Expose pour debugging / scripts").
{
  const _g = globalThis as Record<string, unknown>;
  _g.UpdateMirageRnd = UpdateMirageRnd;
  _g.__GetMirageRnd = GetMirageRnd;
  _g.__SetMirageRnd = SetMirageRnd;
}

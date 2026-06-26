// #100% done — miroir complet de time_events.c (10/10 fonctions). Note : WaitWeather/
// Task_WaitWeather portés pour la fidélité intégrale (pas encore d'appelant côté port).
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
 *  Consolidation 1:1 INTÉGRALE (2026-06-26) : les 10 fonctions de time_events.c
 *  vivent désormais ICI (leur foyer 1:1). `IsMirageIslandPresent` /
 *  `UpdateShoalTideFlag` / `InitBirchState` étaient des handlers inline dans
 *  specials-registry → sortis en exports ; la table des specials les RÉFÉRENCE
 *  (= 1:1 décomp : gSpecials[] pointe vers la fonction time_events.c).
 */

import { VarGet, VarSet, FlagSet, FlagClear } from './engine/script/script-vars';
import { Random } from './random';
import { ISO_RANDOMIZE2 } from '../include/random';
import { PARTY_SIZE } from '../include/constants/global';
import { gPlayerParty, GetMonData as _GetMonData, MON_DATA_SPECIES } from './engine/battle/party-storage';
import { gLocalTime, RtcCalcLocalTime } from './rtc';
import { GetLastUsedWarpMapType, IsMapTypeOutdoors } from './engine/field/warp-system';
import { IsWeatherChangeComplete } from './field_weather';
import { ScriptContext_Enable } from './script';
import { CreateTask, DestroyTask } from './task';
import type { DecompTask } from '../harness/runtime/decomp-runtime';

const VAR_MIRAGE_RND_H = 'VAR_MIRAGE_RND_H';  // 1:1 décomp vars.h:54 (0x4024).
const VAR_MIRAGE_RND_L = 'VAR_MIRAGE_RND_L';  // 1:1 décomp vars.h:55 (0x4025).

// ISO_RANDOMIZE2 (random.h:17 = `1103515245 * val + 12345`) importé du foyer canonique
// `include/random.ts` (dédup : la copie locale était un doublon de cette macro).

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

/** 1:1 décomp `IsMirageIslandPresent(void)` (time_events.c:42-52) :
 *  L'île Mirage apparaît si un mon de l'équipe a `(personality & 0xFFFF) == (mirageRnd >> 16)`. */
export function IsMirageIslandPresent(): number {
  const rnd = GetMirageRnd() >>> 16;   // u16 rnd = GetMirageRnd() >> 16
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if ((_GetMonData(mon, MON_DATA_SPECIES) as number) && (mon.personality & 0xFFFF) === rnd)
      return 1;   // TRUE
  }
  return 0;       // FALSE
}

/** 1:1 décomp `UpdateShoalTideFlag(void)` (time_events.c:54-92) : marée Shoal Cave
 *  (basse 03:00-08:00 + 15:00-20:00, sinon haute), seulement en map outdoors. */
export function UpdateShoalTideFlag(): void {
  // 1:1 décomp `static const u8 tide[24]`.
  const tide: readonly number[] = [1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1];
  if (IsMapTypeOutdoors(GetLastUsedWarpMapType())) {
    RtcCalcLocalTime();
    if (tide[gLocalTime.hours]) FlagSet('FLAG_SYS_SHOAL_TIDE');
    else FlagClear('FLAG_SYS_SHOAL_TIDE');
  }
}

/** 1:1 décomp `Task_WaitWeather(u8 taskId)` (time_events.c:94-101, static). */
function Task_WaitWeather(task: DecompTask): void {
  if (IsWeatherChangeComplete()) {
    ScriptContext_Enable();
    DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `WaitWeather(void)` (time_events.c:103-106). */
export function WaitWeather(): void {
  CreateTask(Task_WaitWeather, 80);
}

const VAR_BIRCH_STATE = 'VAR_BIRCH_STATE';  // 1:1 décomp vars.h:93 (0x4049).

/** 1:1 décomp `InitBirchState(void)` (time_events.c:108-111) :
 *    *GetVarPointer(VAR_BIRCH_STATE) = 0; (port : VarSet équivaut au deref). */
export function InitBirchState(): void {
  VarSet(VAR_BIRCH_STATE, 0);
}

/** 1:1 décomp `UpdateBirchState(days)` (time_events.c:113) :
 *    u16 *state = GetVarPointer(VAR_BIRCH_STATE);
 *    *state += days; *state %= 7;
 *  Avance l'état Birch de `days` (mod 7). Lu par `prof_birch.inc` → détermine où le
 *  Prof. Birch se trouve ce jour (labo / Route 101 / Route 103). Appelée par
 *  UpdatePerDay (clock.c). `*state += days` est en u16 (wrap) → masque `& 0xFFFF`
 *  avant le mod pour la fidélité. (`InitBirchState` = special déjà porté ailleurs.) */
export function UpdateBirchState(days: number): void {
  const state = ((VarGet(VAR_BIRCH_STATE) + days) & 0xFFFF) % 7;
  VarSet(VAR_BIRCH_STATE, state);
}

// Exposition dev (= test runtime / sonde déterministe), sans effet sur le jeu.
// Calqué sur field_message_box ("Expose pour debugging / scripts").
{
  const _g = globalThis as Record<string, unknown>;
  _g.UpdateMirageRnd = UpdateMirageRnd;
  _g.__GetMirageRnd = GetMirageRnd;
  _g.__SetMirageRnd = SetMirageRnd;
  _g.UpdateBirchState = UpdateBirchState;
}

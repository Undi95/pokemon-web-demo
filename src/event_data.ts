/**
 * event_data.ts — miroir 1:1 de `decomp/src/event_data.c` (+ include/event_data.h).
 *
 * Flags/vars du jeu indexés par **ID numérique** (1:1 décomp), flags bit-packés.
 * Stockage = `number[]` (PAS Uint8Array : save = JSON.stringify → number[] round-trip).
 *
 * Modèle décomp (flags.h / vars.h) :
 *  - flag id < SPECIAL_FLAGS_START(0x4000) → `gSaveBlock1Ptr.flags[id/8]` bit `id&7`
 *  - flag id ≥ 0x4000 → `sSpecialFlags[(id-0x4000)/8]` (EWRAM, NON sauvé)
 *  - var VARS_START(0x4000) ≤ id < SPECIAL_VARS_START(0x8000) → `vars[id-0x4000]`
 *  - var id ≥ 0x8000 → `gSpecialVars[id-0x8000]` (EWRAM, NON sauvé)
 *
 * L'API par NOM (`FlagSet('FLAG_X')`) = le bridge `script-vars.ts` (résout nom→id
 * via `include/constants/flags.ts`/`vars.ts` puis appelle ces fonctions par id).
 */

import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  TEMP_FLAGS_START, NUM_TEMP_FLAGS, DAILY_FLAGS_START, NUM_DAILY_FLAGS,
  FLAG_SYS_ENC_UP_ITEM, FLAG_SYS_ENC_DOWN_ITEM, FLAG_SYS_USE_STRENGTH,
  FLAG_SYS_CTRL_OBJ_DELETE, FLAG_NURSE_UNION_ROOM_REMINDER,
  FLAG_SYS_MYSTERY_EVENT_ENABLE, FLAG_SYS_MYSTERY_GIFT_ENABLE,
  FLAG_MYSTERY_GIFT_DONE,
  FLAG_MYSTERY_GIFT_1, FLAG_MYSTERY_GIFT_2, FLAG_MYSTERY_GIFT_3, FLAG_MYSTERY_GIFT_4,
  FLAG_MYSTERY_GIFT_5, FLAG_MYSTERY_GIFT_6, FLAG_MYSTERY_GIFT_7, FLAG_MYSTERY_GIFT_8,
  FLAG_MYSTERY_GIFT_9, FLAG_MYSTERY_GIFT_10, FLAG_MYSTERY_GIFT_11, FLAG_MYSTERY_GIFT_12,
  FLAG_MYSTERY_GIFT_13, FLAG_MYSTERY_GIFT_14, FLAG_MYSTERY_GIFT_15,
  FLAG_SYS_RESET_RTC_ENABLE, FLAG_SYS_NATIONAL_DEX,
} from '../include/constants/flags';
import {
  TEMP_VARS_START, NUM_TEMP_VARS,
  VAR_GIFT_PICHU_SLOT,
  VAR_GIFT_UNUSED_1, VAR_GIFT_UNUSED_2, VAR_GIFT_UNUSED_3, VAR_GIFT_UNUSED_4,
  VAR_GIFT_UNUSED_5, VAR_GIFT_UNUSED_6, VAR_GIFT_UNUSED_7,
  VAR_RESET_RTC_ENABLE, VAR_NATIONAL_DEX,
} from '../include/constants/vars';

// ─── Constantes 1:1 décomp (flags.h / vars.h) ───────────────────────────────
export const VARS_START = 0x4000;
export const SPECIAL_VARS_START = 0x8000;
const SPECIAL_VARS_END = 0x8015;
const NUM_SPECIAL_VARS = SPECIAL_VARS_END - SPECIAL_VARS_START + 1;  // 22
export const SPECIAL_FLAGS_START = 0x4000;
const NUM_SPECIAL_FLAGS = 0x80;  // 128 → 16 octets

// 1:1 décomp event_data.c:28 — `static u8 sSpecialFlags[]` (EWRAM, non sauvé).
const sSpecialFlags: number[] = new Array(NUM_SPECIAL_FLAGS >> 3).fill(0);

// 1:1 décomp event_data.c:10-27 + `gSpecialVars[]` — special vars (0x8000-0x8015,
// EWRAM globals, NON sauvés). Indexé par (id - SPECIAL_VARS_START).
export const gSpecialVars: number[] = new Array(NUM_SPECIAL_VARS).fill(0);

// ─── Vars (1:1 décomp event_data.c:164-189) ─────────────────────────────────
interface VarRef { get(): number; set(v: number): void; }

/** 1:1 décomp `u16 *GetVarPointer(u16 id)` (event_data.c:164). */
function GetVarPointer(id: number): VarRef | null {
  if (id < VARS_START) return null;
  if (id < SPECIAL_VARS_START) {
    const i = id - VARS_START;
    return { get: () => gSaveBlock1Ptr.vars[i] ?? 0, set: (v) => { gSaveBlock1Ptr.vars[i] = v; } };
  }
  const i = id - SPECIAL_VARS_START;
  return { get: () => gSpecialVars[i] ?? 0, set: (v) => { gSpecialVars[i] = v; } };
}

/** 1:1 décomp `u16 VarGet(u16 id)` (event_data.c:174). id < VARS_START → return id. */
export function VarGet(id: number): number {
  const ptr = GetVarPointer(id);
  if (!ptr) return id;
  return ptr.get();
}

/** 1:1 décomp `bool8 VarSet(u16 id, u16 value)` (event_data.c:182). */
export function VarSet(id: number, value: number): boolean {
  const ptr = GetVarPointer(id);
  if (!ptr) return false;
  ptr.set(value & 0xFFFF);
  return true;
}

/** 1:1 décomp `u8 VarGetObjectEventGraphicsId(u8 id)` (event_data.c:191). */
export function VarGetObjectEventGraphicsId(id: number): number {
  // AUDIT 2026-06 : était 0x4023 (= VAR_STARTER_MON, vars.h:53) mislabellé.
  return VarGet(0x4010 /* VAR_OBJ_GFX_ID_0 (vars.h:32) */ + id);
}

// ─── Flags (1:1 décomp event_data.c:196-233) ────────────────────────────────
function _flagLoc(id: number): { arr: number[]; idx: number } | null {
  if (id === 0) return null;                                          // event_data.c:198
  if (id < SPECIAL_FLAGS_START) return { arr: gSaveBlock1Ptr.flags, idx: id >> 3 };  // :200-201
  return { arr: sSpecialFlags, idx: (id - SPECIAL_FLAGS_START) >> 3 };               // :202-203
}

/** 1:1 décomp `u8 FlagSet(u16 id)` (event_data.c:206) : `*ptr |= 1 << (id & 7)`. */
export function FlagSet(id: number): void {
  const loc = _flagLoc(id);
  if (loc) loc.arr[loc.idx] = (loc.arr[loc.idx] ?? 0) | (1 << (id & 7));
}

/** 1:1 décomp `u8 FlagClear(u16 id)` (event_data.c:214) : `*ptr &= ~(1 << (id & 7))`. */
export function FlagClear(id: number): void {
  const loc = _flagLoc(id);
  if (loc) loc.arr[loc.idx] = (loc.arr[loc.idx] ?? 0) & ~(1 << (id & 7));
}

/** 1:1 décomp `bool8 FlagGet(u16 id)` (event_data.c:222). */
export function FlagGet(id: number): boolean {
  const loc = _flagLoc(id);
  if (!loc) return false;
  return (((loc.arr[loc.idx] ?? 0) >> (id & 7)) & 1) !== 0;
}

// ─── Init (1:1 décomp event_data.c:32-37) ───────────────────────────────────
/** 1:1 décomp `void InitEventData(void)` : memset flags/vars/sSpecialFlags à 0. */
export function InitEventData(): void {
  gSaveBlock1Ptr.flags.fill(0);
  gSaveBlock1Ptr.vars.fill(0);
  sSpecialFlags.fill(0);
}

// ─── Helpers cross-module flags/vars (1:1 décomp event_data.c:39-162) ────────
// #define locaux event_data.c:5-8 — tailles de SECTION en OCTETS.
const TEMP_FLAGS_SIZE = NUM_TEMP_FLAGS >> 3;    // = NUM_TEMP_FLAGS / 8 octets
const DAILY_FLAGS_SIZE = NUM_DAILY_FLAGS >> 3;  // = NUM_DAILY_FLAGS / 8 octets
// (TEMP_VARS_SIZE décomp = NUM_TEMP_VARS*2 BYTES ; nos `vars` = number[] de u16
//  → on efface NUM_TEMP_VARS ÉLÉMENTS, cf. ClearTempFieldEventData. Pas de const ici.)

/** 1:1 décomp `void ClearTempFieldEventData(void)` (event_data.c:39-48). */
export function ClearTempFieldEventData(): void {
  // flags = u8[] (1 élément = 1 octet) ; TEMP_FLAGS_START aligné sur 8.
  gSaveBlock1Ptr.flags.fill(0, TEMP_FLAGS_START >> 3, (TEMP_FLAGS_START >> 3) + TEMP_FLAGS_SIZE);
  // vars = u16[] : le memset décomp efface TEMP_VARS_SIZE(=NUM_TEMP_VARS*2) OCTETS,
  // soit NUM_TEMP_VARS éléments u16. Index de départ = TEMP_VARS_START - VARS_START.
  const vStart = TEMP_VARS_START - VARS_START;
  gSaveBlock1Ptr.vars.fill(0, vStart, vStart + NUM_TEMP_VARS);
  FlagClear(FLAG_SYS_ENC_UP_ITEM);
  FlagClear(FLAG_SYS_ENC_DOWN_ITEM);
  FlagClear(FLAG_SYS_USE_STRENGTH);
  FlagClear(FLAG_SYS_CTRL_OBJ_DELETE);
  FlagClear(FLAG_NURSE_UNION_ROOM_REMINDER);
}

/** 1:1 décomp `void ClearDailyFlags(void)` (event_data.c:50-53). */
export function ClearDailyFlags(): void {
  gSaveBlock1Ptr.flags.fill(0, DAILY_FLAGS_START >> 3, (DAILY_FLAGS_START >> 3) + DAILY_FLAGS_SIZE);
}

/** 1:1 décomp `void DisableMysteryEvent(void)` (event_data.c:82-85). */
export function DisableMysteryEvent(): void { FlagClear(FLAG_SYS_MYSTERY_EVENT_ENABLE); }
/** 1:1 décomp `void EnableMysteryEvent(void)` (event_data.c:87-90). */
export function EnableMysteryEvent(): void { FlagSet(FLAG_SYS_MYSTERY_EVENT_ENABLE); }
/** 1:1 décomp `bool32 IsMysteryEventEnabled(void)` (event_data.c:92-95). */
export function IsMysteryEventEnabled(): boolean { return FlagGet(FLAG_SYS_MYSTERY_EVENT_ENABLE); }

/** 1:1 décomp `void DisableMysteryGift(void)` (event_data.c:97-100). */
export function DisableMysteryGift(): void { FlagClear(FLAG_SYS_MYSTERY_GIFT_ENABLE); }
/** 1:1 décomp `void EnableMysteryGift(void)` (event_data.c:102-105). */
export function EnableMysteryGift(): void { FlagSet(FLAG_SYS_MYSTERY_GIFT_ENABLE); }
/** 1:1 décomp `bool32 IsMysteryGiftEnabled(void)` (event_data.c:107-110). */
export function IsMysteryGiftEnabled(): boolean { return FlagGet(FLAG_SYS_MYSTERY_GIFT_ENABLE); }

/** 1:1 décomp `void ClearMysteryGiftFlags(void)` (event_data.c:112-130). */
export function ClearMysteryGiftFlags(): void {
  FlagClear(FLAG_MYSTERY_GIFT_DONE);
  FlagClear(FLAG_MYSTERY_GIFT_1);
  FlagClear(FLAG_MYSTERY_GIFT_2);
  FlagClear(FLAG_MYSTERY_GIFT_3);
  FlagClear(FLAG_MYSTERY_GIFT_4);
  FlagClear(FLAG_MYSTERY_GIFT_5);
  FlagClear(FLAG_MYSTERY_GIFT_6);
  FlagClear(FLAG_MYSTERY_GIFT_7);
  FlagClear(FLAG_MYSTERY_GIFT_8);
  FlagClear(FLAG_MYSTERY_GIFT_9);
  FlagClear(FLAG_MYSTERY_GIFT_10);
  FlagClear(FLAG_MYSTERY_GIFT_11);
  FlagClear(FLAG_MYSTERY_GIFT_12);
  FlagClear(FLAG_MYSTERY_GIFT_13);
  FlagClear(FLAG_MYSTERY_GIFT_14);
  FlagClear(FLAG_MYSTERY_GIFT_15);
}

/** 1:1 décomp `void ClearMysteryGiftVars(void)` (event_data.c:132-142). */
export function ClearMysteryGiftVars(): void {
  VarSet(VAR_GIFT_PICHU_SLOT, 0);
  VarSet(VAR_GIFT_UNUSED_1, 0);
  VarSet(VAR_GIFT_UNUSED_2, 0);
  VarSet(VAR_GIFT_UNUSED_3, 0);
  VarSet(VAR_GIFT_UNUSED_4, 0);
  VarSet(VAR_GIFT_UNUSED_5, 0);
  VarSet(VAR_GIFT_UNUSED_6, 0);
  VarSet(VAR_GIFT_UNUSED_7, 0);
}

/** 1:1 décomp `void DisableResetRTC(void)` (event_data.c:144-148). */
export function DisableResetRTC(): void {
  VarSet(VAR_RESET_RTC_ENABLE, 0);
  FlagClear(FLAG_SYS_RESET_RTC_ENABLE);
}

/** 1:1 décomp `void EnableResetRTC(void)` (event_data.c:150-154). */
export function EnableResetRTC(): void {
  VarSet(VAR_RESET_RTC_ENABLE, 0x920);
  FlagSet(FLAG_SYS_RESET_RTC_ENABLE);
}

/** 1:1 décomp `bool32 CanResetRTC(void)` (event_data.c:156-162). */
export function CanResetRTC(): boolean {
  if (FlagGet(FLAG_SYS_RESET_RTC_ENABLE) && VarGet(VAR_RESET_RTC_ENABLE) === 0x920)
    return true;
  return false;
}

/** 1:1 décomp `bool32 IsNationalPokedexEnabled(void)` (event_data.c:74-80).
 *  Trois conditions toutes vraies → TRUE. (Fusionné depuis l'ex-`engine/save/event-data.ts`,
 *  converti au système FlagGet/VarGet NUMÉRIQUE 1:1 de ce fichier.) */
export function IsNationalPokedexEnabled(): boolean {
  if (gSaveBlock2Ptr.pokedex.nationalMagic === 0xDA
    && VarGet(VAR_NATIONAL_DEX) === 0x302
    && FlagGet(FLAG_SYS_NATIONAL_DEX))
    return true;
  return false;
}

// ─── À PORTER avec le module pokedex (event_data.c:55-72) ────────────────────
//   EnableNationalPokedex / DisableNationalPokedex : couplés `gSaveBlock2Ptr.pokedex`
//   (nationalMagic/mode/order) + DEX_MODE_NATIONAL + ResetPokedexScrollPositions
//   (pokedex.c, non porté). Différés ; `specials-registry.ts` couvre l'API Enable/Disable.

// Surface lazy (consommee par battle-script-commands _flagGet_GC — flags 1:1).
(globalThis as Record<string, unknown>).__eventData = { FlagGet, FlagSet, VarGet, VarSet };

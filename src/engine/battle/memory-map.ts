/**
 * battle/memory-map.ts — Resolve GBA memory addresses to TS getters/setters.
 *
 * Le décomp utilise des opcodes natifs (0x29 jumpifbyte..0x38 bicword) qui
 * prennent un `u32 ptr` = adresse mémoire EWRAM/IWRAM/IORAM GBA absolue.
 * Sur GBA, ils déréfèrent direct. Sur TS, on doit mapper le symbole asm
 * (gHitMarker, sDMG_MULTIPLIER, etc.) vers une variable JS.
 *
 * Sources de vérité :
 *   - `data/battle_scripts_1.s` + `battle_scripts_2.s` (= usage des symbols)
 *   - `include/battle.h` (= structs sources des `s` prefix sBattleScripting fields)
 *   - `include/battle_message.h` (= cMULTISTRING_CHOOSER etc.)
 *
 * Architecture :
 *   - Chaque symbole asm a un accessor `{ read(): number, write(v: number): void, size: 1|2|4 }`.
 *   - Le bytecode compiler (= `scripts/compile-decomp-bytecode.mjs`) encode
 *     les symbols non-résolus comme u32 avec convention `0xF0000000 | symbol_id`.
 *   - Au runtime, opcodes natifs (cmd-niveau-33.ts) reconnaissent le high bits
 *     et résolvent via `resolveSymbol(id)`.
 *
 * Phase 1.3 G plan :
 *   1. ✅ Cette file : skeleton + ~28 symbols.
 *   2. TODO compiler refactor : `compile-decomp-bytecode.mjs` doit exporter
 *      `SYMBOLS: { id, name }[]` + utiliser convention `0xF0000000 | id` pour
 *      unresolved.
 *   3. TODO cmd-niveau-33.ts : decode + résolve via `resolveAddress()`.
 *
 * Une fois fait : ~412 unresolved symbols → 0, et les 14 opcodes natifs
 * deviennent FULL 1:1 décomp.
 */

import { gBattleMons, gBattlerAttacker, gBattlerTarget } from './state';

/** Signature 1:1 décomp pour un memory accessor d'une variable battle. */
export interface MemoryAccessor {
  /** Read current value (= u8/u16/u32 selon size). */
  read(): number;
  /** Write new value (= clamp à size selon u8/u16/u32). */
  write(value: number): void;
  /** Byte width de la variable (1=u8, 2=u16, 4=u32). */
  size: 1 | 2 | 4;
}

/** 1:1 décomp asm symbol table — chaque entry maps `name` asm → JS accessor.
 *  Couvre les symboles utilisés par les opcodes natifs (0x29-0x38) dans
 *  `data/battle_scripts_1.s` + `battle_scripts_2.s`.
 *
 *  Note `s` prefix = gBattleScripting field. `c` prefix = gBattleCommunication.
 *  `g` prefix = global ewram var. */
export const MEMORY_SYMBOLS: Record<string, MemoryAccessor> = {
  // ─── Global ewram vars (u8/u16/u32) ────────────────────────────────────
  // Lazy-bound via globalThis.__battleState pour éviter circular deps.
  // 1:1 décomp : read/write via __battleStateMutators (= unique source de
  // vérité, évite ESM live-binding instances dup via HMR/dynamic import).
  // Pattern : tout read/write des global ewram vars passe par mutators globaux
  // exposés depuis state.ts. Permet aux opcodes natifs setbyte/setword/etc.
  // de propager correctement les writes même si plusieurs instances ESM existent.
  gHitMarker: {
    size: 4,
    read: () => (globalThis as { __battleStateMutators?: { getHitMarker?: () => number } }).__battleStateMutators?.getHitMarker?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setHitMarker?: (v: number) => void } }).__battleStateMutators?.setHitMarker?.(v >>> 0),
  },
  gMoveResultFlags: {
    size: 1,
    read: () => (globalThis as { __battleStateMutators?: { getMoveResultFlags?: () => number } }).__battleStateMutators?.getMoveResultFlags?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setMoveResultFlags?: (v: number) => void } }).__battleStateMutators?.setMoveResultFlags?.(v & 0xFF),
  },
  gChosenMove: {
    size: 2,
    read: () => (globalThis as { __battleStateMutators?: { getChosenMove?: () => number } }).__battleStateMutators?.getChosenMove?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setChosenMove?: (v: number) => void } }).__battleStateMutators?.setChosenMove?.(v & 0xFFFF),
  },
  gCurrentMove: {
    size: 2,
    read: () => (globalThis as { __battleStateMutators?: { getCurrentMove?: () => number } }).__battleStateMutators?.getCurrentMove?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setCurrentMove?: (v: number) => void } }).__battleStateMutators?.setCurrentMove?.(v & 0xFFFF),
  },
  gBattleMoveDamage: {
    size: 4,
    read: () => (globalThis as { __battleStateMutators?: { getBattleMoveDamage?: () => number } }).__battleStateMutators?.getBattleMoveDamage?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setBattleMoveDamage?: (v: number) => void } }).__battleStateMutators?.setBattleMoveDamage?.(v | 0),
  },
  gBattleOutcome: {
    size: 1,
    read: () => (globalThis as { __battleStateMutators?: { getBattleOutcome?: () => number } }).__battleStateMutators?.getBattleOutcome?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setBattleOutcome?: (v: number) => void } }).__battleStateMutators?.setBattleOutcome?.(v & 0xFF),
  },
  gCritMultiplier: {
    size: 1,
    read: () => (globalThis as { __battleStateMutators?: { getCritMultiplier?: () => number } }).__battleStateMutators?.getCritMultiplier?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setCritMultiplier?: (v: number) => void } }).__battleStateMutators?.setCritMultiplier?.(v & 0xFF),
  },
  gBattleWeather: {
    size: 2,
    read: () => (globalThis as { __battleStateMutators?: { getBattleWeather?: () => number } }).__battleStateMutators?.getBattleWeather?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setBattleWeather?: (v: number) => void } }).__battleStateMutators?.setBattleWeather?.(v & 0xFFFF),
  },
  gBattleTypeFlags: {
    size: 4,
    read: () => (globalThis as { __battleStateMutators?: { getBattleTypeFlags?: () => number } }).__battleStateMutators?.getBattleTypeFlags?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setBattleTypeFlags?: (v: number) => void } }).__battleStateMutators?.setBattleTypeFlags?.(v >>> 0),
  },
  gBattlerTarget: {
    size: 1,
    read: () => (globalThis as { __battleStateMutators?: { getTarget?: () => number } }).__battleStateMutators?.getTarget?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setTarget?: (v: number) => void } }).__battleStateMutators?.setTarget?.(v & 0xFF),
  },
  gBattlerAttacker: {
    size: 1,
    read: () => (globalThis as { __battleStateMutators?: { getAttacker?: () => number } }).__battleStateMutators?.getAttacker?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setAttacker?: (v: number) => void } }).__battleStateMutators?.setAttacker?.(v & 0xFF),
  },
  gLastUsedItem: {
    size: 2,
    read: () => (globalThis as { __battleStateMutators?: { getLastUsedItem?: () => number } }).__battleStateMutators?.getLastUsedItem?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setLastUsedItem?: (v: number) => void } }).__battleStateMutators?.setLastUsedItem?.(v & 0xFFFF),
  },
  gTrainerBattleOpponent_A: {
    size: 2,
    read: () => (globalThis as { __battleStateMutators?: { getTrainerBattleOpponent_A?: () => number } }).__battleStateMutators?.getTrainerBattleOpponent_A?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setTrainerBattleOpponent_A?: (v: number) => void } }).__battleStateMutators?.setTrainerBattleOpponent_A?.(v & 0xFFFF),
  },
  gNumSafariBalls: {
    size: 1,
    read: () => (globalThis as { __battleStateMutators?: { getNumSafariBalls?: () => number } }).__battleStateMutators?.getNumSafariBalls?.() ?? 0,
    write: (v) => (globalThis as { __battleStateMutators?: { setNumSafariBalls?: (v: number) => void } }).__battleStateMutators?.setNumSafariBalls?.(v & 0xFF),
  },

  // ─── sXxx prefix = gBattleScripting fields ─────────────────────────────
  // (battle.h:489-518 BattleScripting struct).
  sDMG_MULTIPLIER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { dmgMultiplier: number } } }).__battleState?.gBattleScripting?.dmgMultiplier ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { dmgMultiplier: number } } }).__battleState?.gBattleScripting; if (bs) bs.dmgMultiplier = v; },
  },
  sB_ANIM_TURN: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { animTurn: number } } }).__battleState?.gBattleScripting?.animTurn ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { animTurn: number } } }).__battleState?.gBattleScripting; if (bs) bs.animTurn = v; },
  },
  sB_ANIM_TARGETS_HIT: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { animTargetsHit: number } } }).__battleState?.gBattleScripting?.animTargetsHit ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { animTargetsHit: number } } }).__battleState?.gBattleScripting; if (bs) bs.animTargetsHit = v; },
  },
  sTWOTURN_STRINGID: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { twoTurnsMoveStringId: number } } }).__battleState?.gBattleScripting?.twoTurnsMoveStringId ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { twoTurnsMoveStringId: number } } }).__battleState?.gBattleScripting; if (bs) bs.twoTurnsMoveStringId = v; },
  },
  sMULTIHIT_EFFECT: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { multihitMoveEffect: number } } }).__battleState?.gBattleScripting?.multihitMoveEffect ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { multihitMoveEffect: number } } }).__battleState?.gBattleScripting; if (bs) bs.multihitMoveEffect = v; },
  },
  sMULTIHIT_STRING: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { multihitString: number[] } } }).__battleState?.gBattleScripting?.multihitString?.[0] ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { multihitString: number[] } } }).__battleState?.gBattleScripting; if (bs?.multihitString) bs.multihitString[0] = v; },
  },
  sSTAT_ANIM_PLAYED: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { statAnimPlayed: number } } }).__battleState?.gBattleScripting?.statAnimPlayed ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { statAnimPlayed: number } } }).__battleState?.gBattleScripting; if (bs) bs.statAnimPlayed = v; },
  },
  sTRIPLE_KICK_POWER: {
    size: 2,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { tripleKickPower: number } } }).__battleState?.gBattleScripting?.tripleKickPower ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { tripleKickPower: number } } }).__battleState?.gBattleScripting; if (bs) bs.tripleKickPower = v; },
  },
  sGIVEEXP_STATE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { getexpState: number } } }).__battleState?.gBattleScripting?.getexpState ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { getexpState: number } } }).__battleState?.gBattleScripting; if (bs) bs.getexpState = v; },
  },
  sLVLBOX_STATE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { drawlvlupboxState: number } } }).__battleState?.gBattleScripting?.drawlvlupboxState ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { drawlvlupboxState: number } } }).__battleState?.gBattleScripting; if (bs) bs.drawlvlupboxState = v; },
  },
  sLEARNMOVE_STATE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { learnMoveState: number } } }).__battleState?.gBattleScripting?.learnMoveState ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { learnMoveState: number } } }).__battleState?.gBattleScripting; if (bs) bs.learnMoveState = v; },
  },
  sBATTLE_STYLE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { battleStyle: number } } }).__battleState?.gBattleScripting?.battleStyle ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { battleStyle: number } } }).__battleState?.gBattleScripting; if (bs) bs.battleStyle = v; },
  },
  sBATTLER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { battler: number } } }).__battleState?.gBattleScripting?.battler ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { battler: number } } }).__battleState?.gBattleScripting; if (bs) bs.battler = v; },
  },

  // ─── gBattleCommunication (= u8[6] array used as scratch for chooser/state) ─
  gBattleCommunication: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[0] ?? 0,
    write: (v) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[0] = v & 0xFF;
    },
  },

  // ─── cMULTISTRING_CHOOSER = gBattleCommunication[MULTISTRING_CHOOSER=5] ─
  cMULTISTRING_CHOOSER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[5] ?? 0,
    write: (v) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[5] = v & 0xFF;
    },
  },

  // ─── cMISS_TYPE = gBattleCommunication[MISS_TYPE=5 OR 4 depending on usage] ─
  cMISS_TYPE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[5] ?? 0,
    write: (v) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[5] = v & 0xFF;
    },
  },

  // ─── cEFFECTIVENESS = gBattleCommunication[EFFECTIVENESS_IDX] ──────────
  cEFFECTIVENESS: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[4] ?? 0,
    write: (v) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[4] = v & 0xFF;
    },
  },

  // ─── Cross-battler refs (= gBattlerAttacker/Target as ptr-of-target) ───
  // Note : ces ne sont pas vraiment des memory pointers, mais quand le script
  // utilise un `arg battlerArg` via T2_READ_PTR, on a une ref vers gBattlerXxx.
  // gBattleMons[gBattlerTarget] etc. — accessed via field path :
  // `gBattleMons[X].hp`, `.status1`, `.statStages[Y]`, etc.

  // gBattleTextBuff1 (= u8[~16] text buffer) — STUB Phase 1.4 text UI.
  gBattleTextBuff1: {
    size: 1,
    read: () => 0,
    write: () => { /* STUB text Phase 1.4 */ },
  },
};

/** Marker bit pour distinguer symbol IDs vs vraies GBA addresses.
 *  Convention : 0xF0000000 | id. */
export const SYMBOL_MARKER = 0xF0000000;
export const SYMBOL_MASK   = 0x0FFFFFFF;

/** Resolve une address u32 read depuis le bytecode → MemoryAccessor.
 *  Si marker set : `id = addr & SYMBOL_MASK` → lookup dans SYMBOLS_TABLE.
 *  Sinon : vraie GBA address (= STUB Phase 1.3 G — TODO mapper EWRAM/IWRAM
 *  ranges si besoin). */
export function resolveAddress(addr: number): MemoryAccessor | null {
  if ((addr & SYMBOL_MARKER) === SYMBOL_MARKER) {
    const id = addr & SYMBOL_MASK;
    return SYMBOLS_BY_ID[id] ?? null;
  }
  return null;  // Real GBA address — not mapped in Phase 1.3 G.
}

/** Index-based symbol lookup table (= built dynamiquement par compiler).
 *  Phase 1.3 G : compiler exporte `SYMBOLS_TABLE: { id: number; name: string }[]`
 *  qu'on load ici via initMemoryMap(). */
export const SYMBOLS_BY_ID: Record<number, MemoryAccessor> = {};

/** Bind un symbol name à un ID (= appelé au boot après load SYMBOLS_TABLE). */
export function bindSymbol(id: number, name: string): void {
  const accessor = MEMORY_SYMBOLS[name];
  if (accessor) {
    SYMBOLS_BY_ID[id] = accessor;
  } else {
    console.warn(`[memory-map] no accessor for symbol '${name}' (id=${id})`);
  }
}

/** Initialize memory-map au boot : load SYMBOLS_TABLE auto-generated et bind
 *  chaque entry. Idempotent (= safe à appeler plusieurs fois). */
let _memoryMapInitialized = false;
export function initMemoryMap(): void {
  if (_memoryMapInitialized) return;
  for (const entry of SYMBOLS_TABLE) {
    bindSymbol(entry.id, entry.name);
  }
  _memoryMapInitialized = true;
}

import { SYMBOLS_TABLE } from '../decomp-data/auto-asm-bytecode/_symbols-table';

// Auto-init au module load (= chaque instance HMR/dyn-import a son SYMBOLS_BY_ID
// populé directement). Sinon : opcodes natifs setbyte/addbyte etc. trouvent
// SYMBOLS_BY_ID vide → write no-op silent → loops infinis Intimidate etc.
initMemoryMap();

// Expose battler refs for debug.
void gBattleMons;
void gBattlerAttacker;

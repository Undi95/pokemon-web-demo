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
 *   2. Compiler refactor done : `compile-decomp-bytecode.mjs` exporte
 *      `SYMBOLS: { id, name }[]` + utiliser convention `0xF0000000 | id` pour
 *      unresolved.
 *   3. cmd-niveau-33.ts decode + résolve via `resolveAddress()` (= wired).
 *
 * Une fois fait : ~412 unresolved symbols → 0, et les 14 opcodes natifs
 * deviennent FULL 1:1 décomp.
 */

import { gBattleMons, gBattlerAttacker, gBattlerTarget } from './state';

/** Signature 1:1 décomp pour un memory accessor d'une variable battle.
 *
 *  Phase 1.4 J : ajout offset arg pour array accessors (= sMULTIHIT_STRING,
 *  gBattleTextBuff1, gBattleCommunication, etc.). Scalar accessors ignorent
 *  l'offset (= toujours read/write l'unique scalar). */
export interface MemoryAccessor {
  /** Read current value (= u8/u16/u32 selon size). Offset (default 0)
   *  pour array accessors (= byte index dans le tableau). */
  read(offset?: number): number;
  /** Write new value (= clamp à size selon u8/u16/u32). Offset idem read. */
  write(value: number, offset?: number): void;
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
    // s32 scalaire : `setword gBattleMoveDamage, N` est décompilé en 4 `setbyte`
    // (un par byte LE, offsets 0..3). read-modify-write par byte pour assembler le
    // u32 — sinon chaque setbyte écrase la valeur entière et le dernier (byte 3 = 0)
    // remet à 0 → tous les moves à dégât FIXE (Sonic Boom 20, Dragon Rage 40,
    // Night Shade, Psywave, Super Fang…) faisaient 0 dégât.
    write: (v, off = 0) => {
      const m = (globalThis as { __battleStateMutators?: { getBattleMoveDamage?: () => number; setBattleMoveDamage?: (v: number) => void } }).__battleStateMutators;
      const cur = (m?.getBattleMoveDamage?.() ?? 0) >>> 0;
      const merged = ((cur & ~(0xFF << (off * 8))) | ((v & 0xFF) << (off * 8))) >>> 0;
      m?.setBattleMoveDamage?.(merged | 0);
    },
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
  sPAINSPLIT_HP: {
    size: 4,
    // s32 scalaire accédé BYTE-PAR-BYTE par `copyword gBattleMoveDamage, sPAINSPLIT_HP`
    // (BattleScript_EffectPainSplit). MÊME bug que sBIDE_DMG : read ignorant l'offset
    // → garbage [v,v,v,v] dans gBattleMoveDamage (byte-level) → Pain Split cassé.
    // Byte-level read/write. (sPAINSPLIT_HP n'est lu QUE par ce copyword → safe.)
    read: (off = 0) => (((globalThis as { __battleState?: { gBattleScripting?: { painSplitHp: number } } }).__battleState?.gBattleScripting?.painSplitHp ?? 0) >>> ((off | 0) * 8)) & 0xFF,
    write: (v, off = 0) => {
      const bs = (globalThis as { __battleState?: { gBattleScripting?: { painSplitHp: number } } }).__battleState?.gBattleScripting;
      if (bs) { const cur = (bs.painSplitHp ?? 0) >>> 0; bs.painSplitHp = (((cur & ~(0xFF << (off * 8))) | ((v & 0xFF) << (off * 8))) >>> 0) | 0; }
    },
  },
  sBIDE_DMG: {
    size: 4,
    // s32 scalaire accédé BYTE-PAR-BYTE par `copyword gBattleMoveDamage, sBIDE_DMG`
    // (BattleScript_BideAttack). BUG CORRIGÉ : read ignorait l'offset → renvoyait la
    // valeur ENTIÈRE pour CHAQUE byte → copyarray écrivait [v,v,v,v] (ex 80→0x50505050)
    // dans gBattleMoveDamage (byte-level depuis le fix setword) → Bide infligeait du
    // garbage = one-shot systématique. Byte-level read/write comme gBattleMoveDamage.
    // (sBIDE_DMG n'est lu QUE par ce copyword → byte-level safe.)
    read: (off = 0) => (((globalThis as { __battleState?: { gBattleScripting?: { bideDmg: number } } }).__battleState?.gBattleScripting?.bideDmg ?? 0) >>> ((off | 0) * 8)) & 0xFF,
    write: (v, off = 0) => {
      const bs = (globalThis as { __battleState?: { gBattleScripting?: { bideDmg: number } } }).__battleState?.gBattleScripting;
      if (bs) { const cur = (bs.bideDmg ?? 0) >>> 0; bs.bideDmg = (((cur & ~(0xFF << (off * 8))) | ((v & 0xFF) << (off * 8))) >>> 0) | 0; }
    },
  },
  sDMG_MULTIPLIER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { dmgMultiplier: number } } }).__battleState?.gBattleScripting?.dmgMultiplier ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { dmgMultiplier: number } } }).__battleState?.gBattleScripting; if (bs) bs.dmgMultiplier = v & 0xFF; },
  },
  sB_ANIM_ARG1: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { animArg1: number } } }).__battleState?.gBattleScripting?.animArg1 ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { animArg1: number } } }).__battleState?.gBattleScripting; if (bs) bs.animArg1 = v & 0xFF; },
  },
  sB_ANIM_ARG2: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { animArg2: number } } }).__battleState?.gBattleScripting?.animArg2 ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { animArg2: number } } }).__battleState?.gBattleScripting; if (bs) bs.animArg2 = v & 0xFF; },
  },
  sMOVEEND_STATE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { moveendState: number } } }).__battleState?.gBattleScripting?.moveendState ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { moveendState: number } } }).__battleState?.gBattleScripting; if (bs) bs.moveendState = v & 0xFF; },
  },
  sBATTLER_WITH_ABILITY: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { battlerWithAbility: number } } }).__battleState?.gBattleScripting?.battlerWithAbility ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { battlerWithAbility: number } } }).__battleState?.gBattleScripting; if (bs) bs.battlerWithAbility = v & 0xFF; },
  },
  sSTATCHANGER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { statChanger: number } } }).__battleState?.gBattleScripting?.statChanger ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { statChanger: number } } }).__battleState?.gBattleScripting; if (bs) bs.statChanger = v & 0xFF; },
  },
  sPURSUIT_DOUBLES_ATTACKER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { pursuitDoublesAttacker: number } } }).__battleState?.gBattleScripting?.pursuitDoublesAttacker ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { pursuitDoublesAttacker: number } } }).__battleState?.gBattleScripting; if (bs) bs.pursuitDoublesAttacker = v & 0xFF; },
  },
  sRESHOW_MAIN_STATE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { reshowMainState: number } } }).__battleState?.gBattleScripting?.reshowMainState ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { reshowMainState: number } } }).__battleState?.gBattleScripting; if (bs) bs.reshowMainState = v & 0xFF; },
  },
  sRESHOW_HELPER_STATE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { reshowHelperState: number } } }).__battleState?.gBattleScripting?.reshowHelperState ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { reshowHelperState: number } } }).__battleState?.gBattleScripting; if (bs) bs.reshowHelperState = v & 0xFF; },
  },
  sLVLUP_HP: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { levelUpHP: number } } }).__battleState?.gBattleScripting?.levelUpHP ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { levelUpHP: number } } }).__battleState?.gBattleScripting; if (bs) bs.levelUpHP = v & 0xFF; },
  },
  sWINDOWS_TYPE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { windowsType: number } } }).__battleState?.gBattleScripting?.windowsType ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { windowsType: number } } }).__battleState?.gBattleScripting; if (bs) bs.windowsType = v & 0xFF; },
  },
  sMULTIPLAYER_ID: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { multiplayerId: number } } }).__battleState?.gBattleScripting?.multiplayerId ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { multiplayerId: number } } }).__battleState?.gBattleScripting; if (bs) bs.multiplayerId = v & 0xFF; },
  },
  sSPECIAL_TRAINER_BATTLE_TYPE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleScripting?: { specialTrainerBattleType: number } } }).__battleState?.gBattleScripting?.specialTrainerBattleType ?? 0,
    write: (v) => { const bs = (globalThis as { __battleState?: { gBattleScripting?: { specialTrainerBattleType: number } } }).__battleState?.gBattleScripting; if (bs) bs.specialTrainerBattleType = v & 0xFF; },
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
    read: (offset = 0) => {
      const bs = (globalThis as { __battleState?: { gBattleScripting?: { multihitString: number[] } } }).__battleState?.gBattleScripting;
      return bs?.multihitString?.[offset] ?? 0;
    },
    write: (v, offset = 0) => {
      const bs = (globalThis as { __battleState?: { gBattleScripting?: { multihitString: number[] } } }).__battleState?.gBattleScripting;
      if (bs?.multihitString) bs.multihitString[offset] = v & 0xFF;
    },
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
    read: (offset = 0) => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[offset] ?? 0,
    write: (v, offset = 0) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[offset] = v & 0xFF;
    },
  },

  // ─── cEFFECT_CHOOSER = gBattleCommunication[MOVE_EFFECT_BYTE=3] (= move effect lookup) ─
  // AUDIT BUG FIX : était missing dans memory-map, ce qui faisait que setbyte
  // cEFFECT_CHOOSER (= setmoveeffect macro) était no-op silent → tous moves
  // status (sleep/poison/etc.) ne s'appliquaient pas via bytecode.
  cEFFECT_CHOOSER: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[3] ?? 0,
    write: (v) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[3] = v & 0xFF;
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

  // ─── cMISS_TYPE = gBattleCommunication[MISS_TYPE=6] ────────────────────
  // AUDIT BUG FIX : était mappé à index 5 (= conflit avec MULTISTRING_CHOOSER).
  // Le décomp battle_script_commands.h:295 dit MISS_TYPE=6, pas 5.
  cMISS_TYPE: {
    size: 1,
    read: () => (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication?.[6] ?? 0,
    write: (v) => {
      const bc = (globalThis as { __battleState?: { gBattleCommunication?: number[] } }).__battleState?.gBattleCommunication;
      if (bc) bc[6] = v & 0xFF;
    },
  },

  // ─── Cross-battler refs (= gBattlerAttacker/Target as ptr-of-target) ───
  // Note : ces ne sont pas vraiment des memory pointers, mais quand le script
  // utilise un `arg battlerArg` via T2_READ_PTR, on a une ref vers gBattlerXxx.
  // gBattleMons[gBattlerTarget] etc. — accessed via field path :
  // `gBattleMons[X].hp`, `.status1`, `.statStages[Y]`, etc.

  // gBattleTextBuff1 (= u8[~16] text buffer) — Note : text buffer accessible via text-buffers.ts module.
  gBattleTextBuff1: {
    size: 1,
    read: (offset = 0) => {
      const tb = (globalThis as { __gBattleTextBuff1?: Uint8Array }).__gBattleTextBuff1;
      return tb?.[offset] ?? 0;
    },
    write: (v, offset = 0) => {
      const tb = (globalThis as { __gBattleTextBuff1?: Uint8Array }).__gBattleTextBuff1;
      if (tb && offset < tb.length) tb[offset] = v & 0xFF;
    },
  },
};

/** Marker bit pour distinguer symbol IDs vs vraies GBA addresses.
 *  Convention : 0xF0000000 | id. */
export const SYMBOL_MARKER = 0xF0000000;
export const SYMBOL_MASK   = 0x0FFFFFFF;

/** Resolve une address u32 read depuis le bytecode → MemoryAccessor.
 *  Si marker set : `id = addr & SYMBOL_MASK` → lookup dans SYMBOLS_TABLE.
 *  Sinon : vraie GBA address (= Phase 1.3 G — mapper EWRAM/IWRAM deferred (rare
 *  ranges si besoin).
 *
 *  AUDIT BUG FIX : JavaScript `&` op converts operands to signed int32, donc
 *  `0xF0000007 & 0xF0000000` retournait -268435456 (= int32 negative bit set
 *  high) qui était != 0xF0000000 (= positive Number 4026531840). Le check
 *  failed silently → resolveAddress retournait null → tous les setbyte vers
 *  des symbols battle script étaient no-op. Fix : `>>> 0` force unsigned. */
export function resolveAddress(addr: number): MemoryAccessor | null {
  if (((addr & SYMBOL_MARKER) >>> 0) === SYMBOL_MARKER) {
    // Phase 1.4 J : id = bits 0-15, offset = bits 16-27 (= array index pour
    // accessors multi-byte comme sMULTIHIT_STRING / gBattleTextBuff1).
    const id = addr & 0xFFFF;
    return SYMBOLS_BY_ID[id] ?? null;
  }
  return null;  // Real GBA address — not mapped in Phase 1.3 G.
}

/** Phase 1.4 J : extract offset depuis address pour array accessors.
 *  Offset = bits 16-27 (0..4095). */
export function resolveAddressOffset(addr: number): number {
  return ((addr >>> 16) & 0xFFF);
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
 *  chaque entry. Idempotent (= safe à appeler plusieurs fois).
 *
 *  Phase 1.4 J : ajoute aussi les symbols pour data tables (= gStatDownStringIds,
 *  etc.) résolus via BATTLE_STRING_ID_TABLES lookup. Ces tables sont read-only
 *  (= Cmd_printfromtable utilise l'addr comme tableOffset puis lit u16 à idx*2). */
let _memoryMapInitialized = false;
export function initMemoryMap(): void {
  if (_memoryMapInitialized) return;
  for (const entry of SYMBOLS_TABLE) {
    if (BATTLE_STRING_ID_TABLES[entry.name]) {
      // Phase 1.4 J : string id table — store name for resolveStringIdTable lookup.
      _SYMBOL_ID_TO_TABLE_NAME[entry.id] = entry.name;
    } else {
      bindSymbol(entry.id, entry.name);
    }
  }
  _memoryMapInitialized = true;
}

// ─── String ID tables (= data, not state) — Phase 1.4 J ─────────────────────

import { BATTLE_STRING_ID_TABLES } from '../decomp-data/battle-string-id-tables';

/** Mapping internal id (= bytecode SYMBOL_MARKER|id) → table name pour lookup.
 *  Populated par initMemoryMap pour symbols qui matchent BATTLE_STRING_ID_TABLES. */
const _SYMBOL_ID_TO_TABLE_NAME: Record<number, string> = {};

/** Resolve une address u32 → string id u16[] (= 1:1 décomp data table).
 *  Si addr est un SYMBOL_MARKER pour un g*StringIds table, return Uint16Array.
 *  Sinon return null. */
export function resolveStringIdTable(addr: number): Uint16Array | null {
  if (((addr & SYMBOL_MARKER) >>> 0) !== SYMBOL_MARKER) return null;
  const id = addr & SYMBOL_MASK;
  const tableName = _SYMBOL_ID_TO_TABLE_NAME[id];
  if (!tableName) return null;
  return BATTLE_STRING_ID_TABLES[tableName] ?? null;
}

/** Debug : list des string id tables resolved au init. */
export function getStringIdTableSymbols(): Array<{ id: number; name: string }> {
  return Object.entries(_SYMBOL_ID_TO_TABLE_NAME).map(([id, name]) => ({ id: Number(id), name }));
}

import { SYMBOLS_TABLE } from '../decomp-data/auto-asm-bytecode/_symbols-table';

// Auto-init au module load (= chaque instance HMR/dyn-import a son SYMBOLS_BY_ID
// populé directement). Sinon : opcodes natifs setbyte/addbyte etc. trouvent
// SYMBOLS_BY_ID vide → write no-op silent → loops infinis Intimidate etc.
initMemoryMap();

// Expose battler refs for debug.
void gBattleMons;
void gBattlerAttacker;

/**
 * battle/cmd-niveau-31.ts — Phase 1 Niveau 31 (seteffectwithchance + catching) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x15 seteffectwithchance     (1 byte — SetMoveEffect avec %chance)
 *   0x8F forcerandomswitch       (5 bytes — Roar/Whirlwind forced switch)
 *   0xE5 pickup                  (1 byte — Pickup ability post-battle)
 *   0xF0 givecaughtmon           (1 byte — add caught mon to party / PC)
 *   0xF2 displaydexinfo          (1 byte — show Pokedex page state machine)
 *   0xF3 trygivecaughtmonnick    (1 byte — yes/no nickname state machine)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker,
  gBattleScripting, gBattleCommunication,
  gCurrentMove, gMoveResultFlags,
} from './state';
import {
  MOVE_EFFECT_BYTE, MOVE_EFFECT_CERTAIN,
  MOVE_RESULT_NO_EFFECT,
} from './constants';
import { getBattleMove } from './data/battle-moves';
import { SetMoveEffect } from './set-move-effect';

// ─── ABILITY_SERENE_GRACE (abilities.h:31) ─────────────────────────────────
const ABILITY_SERENE_GRACE = 32;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x15 seteffectwithchance ─────────────────────────────────────────────

/** 1:1 décomp Cmd_seteffectwithchance. 1 byte. */
function Cmd_seteffectwithchance(ctx: BattleScriptContext): boolean {
  const secondaryChance = getBattleMove(gCurrentMove).secondaryEffectChance;
  let percentChance: number;
  if (gBattleMons[gBattlerAttacker].ability === ABILITY_SERENE_GRACE) {
    percentChance = secondaryChance * 2;
  } else {
    percentChance = secondaryChance;
  }

  if ((gBattleCommunication[MOVE_EFFECT_BYTE] & MOVE_EFFECT_CERTAIN)
      && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    gBattleCommunication[MOVE_EFFECT_BYTE] &= ~MOVE_EFFECT_CERTAIN;
    SetMoveEffect(ctx, false, MOVE_EFFECT_CERTAIN);
  } else if ((Random() % 100) < percentChance
             && gBattleCommunication[MOVE_EFFECT_BYTE]
             && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    if (percentChance >= 100) {
      SetMoveEffect(ctx, false, MOVE_EFFECT_CERTAIN);
    } else {
      SetMoveEffect(ctx, false, 0);
    }
  }
  // 1:1 décomp : sinon advance via fall-through.

  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── 0x8F forcerandomswitch ───────────────────────────────────────────────

/** 1:1 décomp Cmd_forcerandomswitch (battle_script_commands.c:7188-7389). 5 bytes (u32 fail jump). Roar/Whirlwind.
 *
 *  Cases :
 *  - Wild battle (non-trainer) : `TryDoForceSwitchOut()` only — pas de party
 *    switch (= just escape if possible).
 *  - Trainer battle single : pick random alive non-current party mon → set
 *    `gBattleStruct.monToSwitchIntoId[target]`. Si validMons <= minNeeded, fail.
 *  - Trainer battle double/multi/link : différé (= complex BATTLE_TYPE checks).
 *
 *  AUDIT BUG FIX (port iter post session 141) : était fail-only STUB. Maintenant
 *  single trainer battle marche. */
function Cmd_forcerandomswitch(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);

  // 1:1 décomp : wild battle uses just TryDoForceSwitchOut (= escape attempt).
  // Notre port : pas de TryDoForceSwitchOut porté → no-op, advance normally.
  // Note : gBattleTypeFlags & BATTLE_TYPE_TRAINER vérifié plus bas.
  const stateMod = (globalThis as { __battleStateMutators?: {
    getBattleTypeFlags?: () => number;
    getTarget?: () => number;
  } }).__battleStateMutators;
  const gBattleTypeFlags_local = stateMod?.getBattleTypeFlags?.() ?? 0;
  const BATTLE_TYPE_TRAINER_LOCAL = 1 << 3;
  const BATTLE_TYPE_DOUBLE_LOCAL = 1 << 0;

  if (!(gBattleTypeFlags_local & BATTLE_TYPE_TRAINER_LOCAL)) {
    // Wild battle : TryDoForceSwitchOut → STUB (= no-op, fail-through).
    return false;
  }

  if (gBattleTypeFlags_local & BATTLE_TYPE_DOUBLE_LOCAL) {
    // Double/Multi/Link battle : pas porté. Fail.
    ctx.scriptPtr = failJump;
    return false;
  }

  // Single trainer battle (= simple case).
  // 1:1 décomp 7313-7325 :
  //   firstMonId = 0; lastMonId = PARTY_SIZE - 1; monsCount = PARTY_SIZE; minNeeded = 1;
  //   battler2PartyId = battler1PartyId = gBattlerPartyIndexes[gBattlerTarget];
  const PARTY_SIZE_LOCAL = 6;
  const firstMonId = 0;
  const lastMonId = PARTY_SIZE_LOCAL - 1;  // BUGFIX 1:1 : -1 (= valid party slots 0..4)
  const monsCount = PARTY_SIZE_LOCAL;
  const minNeeded = 1;

  const target = stateMod?.getTarget?.() ?? 1;
  const targetIsPlayer = (target & 1) === 0;
  const party = targetIsPlayer ? _gPlayerPartyPK : _gEnemyPartyFRS;
  const currentPartyIdx = _gBattlerPartyIndexesFRS[target] ?? 0;

  // Count valid mons (= non-empty, non-egg, alive).
  let validMons = 0;
  for (let i = firstMonId; i < lastMonId; i++) {
    const species = _GetMonDataPK(party[i], _MON_DATA_SPECIES_OR_EGG_PK) as number;
    const isEgg = _GetMonDataPK(party[i], _MON_DATA_IS_EGG_FRS) as number;
    const hp = _GetMonDataPK(party[i], _MON_DATA_HP_FRS) as number;
    if (species !== 0 && !isEgg && hp !== 0) validMons++;
  }

  if (validMons <= minNeeded) {
    // Pas assez de mons valides — fail.
    ctx.scriptPtr = failJump;
    return false;
  }

  // TryDoForceSwitchOut → STUB returns true (= switch attempt always succeeds).
  // Pick random alive non-current mon.
  let i = 0;
  let safetyCounter = 0;
  do {
    do {
      i = Random() % monsCount;
      i += firstMonId;
      safetyCounter++;
      if (safetyCounter > 100) break;
    } while (i === currentPartyIdx);

    const species = _GetMonDataPK(party[i], _MON_DATA_SPECIES_OR_EGG_PK) as number;
    const isEgg = _GetMonDataPK(party[i], _MON_DATA_IS_EGG_FRS) as number;
    const hp = _GetMonDataPK(party[i], _MON_DATA_HP_FRS) as number;
    if (species !== 0 && !isEgg && hp !== 0) break;

    safetyCounter++;
    if (safetyCounter > 200) break;
  } while (true);

  // Set monToSwitchIntoId[target] = i. Notre gBattleStruct devrait être expose.
  const battleStruct = (globalThis as { __battleState?: { gBattleStruct?: { monToSwitchIntoId?: number[] } } })
    .__battleState?.gBattleStruct;
  if (battleStruct?.monToSwitchIntoId) {
    battleStruct.monToSwitchIntoId[target] = i;
  }

  return false;
}

// Imports locaux Cmd_forcerandomswitch — éviter dups au top du file.
import {
  gEnemyParty as _gEnemyPartyFRS,
  MON_DATA_IS_EGG as _MON_DATA_IS_EGG_FRS,
  MON_DATA_HP as _MON_DATA_HP_FRS,
} from './party-storage';
import { gBattlerPartyIndexes as _gBattlerPartyIndexesFRS } from './state';

// ─── 0xE5 pickup ──────────────────────────────────────────────────────────

/** 1:1 décomp `sPickupItems[]` (battle_script_commands.c:784-804). */
const sPickupItems: ReadonlyArray<number> = [
  13  /* ITEM_POTION */,    17  /* ITEM_ANTIDOTE */,
  14  /* ITEM_SUPER_POTION */, 3   /* ITEM_GREAT_BALL */,
  61  /* ITEM_REPEL */,     69  /* ITEM_ESCAPE_ROPE */,
  56  /* ITEM_X_ATTACK */,  19  /* ITEM_FULL_HEAL */,
  4   /* ITEM_ULTRA_BALL */, 15  /* ITEM_HYPER_POTION */,
  68  /* ITEM_RARE_CANDY */, 73  /* ITEM_PROTEIN */,
  20  /* ITEM_REVIVE */,    70  /* ITEM_HP_UP */,
  16  /* ITEM_FULL_RESTORE */, 21  /* ITEM_MAX_REVIVE */,
  72  /* ITEM_PP_UP */,     65  /* ITEM_MAX_ELIXIR */,
];

/** 1:1 décomp `sRarePickupItems[]` (battle_script_commands.c:806-819). */
const sRarePickupItems: ReadonlyArray<number> = [
  15  /* ITEM_HYPER_POTION */, 92  /* ITEM_NUGGET */,
  221 /* ITEM_KINGS_ROCK */,   16  /* ITEM_FULL_RESTORE */,
  62  /* ITEM_ETHER */,        184 /* ITEM_WHITE_HERB */,
  338 /* ITEM_TM_REST */,      63  /* ITEM_ELIXIR */,
  330 /* ITEM_TM_FOCUS_PUNCH */, 211 /* ITEM_LEFTOVERS */,
  328 /* ITEM_TM_EARTHQUAKE */,
];

/** 1:1 décomp `sPickupProbabilities[]` (battle_script_commands.c:821-824). */
const sPickupProbabilities: ReadonlyArray<number> = [30, 40, 50, 60, 70, 80, 90, 94, 98];

/** 1:1 décomp Cmd_pickup (battle_script_commands.c:9657-9732). 1 byte.
 *  Post-battle Pickup ability. Itère gPlayerParty pour chaque mon avec
 *  ABILITY_PICKUP sans item : roll Random()%10==0 → roll Random()%100
 *  vs sPickupProbabilities[] → assign item depuis sPickupItems[lvlDivBy10+j]
 *  ou sRarePickupItems[lvlDivBy10+(99-rand)]. */
function Cmd_pickup(_ctx: BattleScriptContext): boolean {
  // STUB InBattlePike + CurrentBattlePyramidLocation (= Frontier-only, retournent
  // false dans notre Phase 1). Donc on prend toujours le else branch (= normal).

  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = _GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_SPECIES_OR_EGG_PK) as number;
    const heldItem = _GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_HELD_ITEM_PK) as number;
    const abilityNum = _GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_ABILITY_NUM_PK) as number;
    const ability = _getSpeciesAbilityPK(species, abilityNum);

    if (ability === ABILITY_PICKUP_PK
        && species !== 0 /* SPECIES_NONE */
        && species !== 412 /* SPECIES_EGG */
        && heldItem === 0 /* ITEM_NONE */
        && (Random() % 10) === 0) {
      const rand = Random() % 100;
      let lvlDivBy10 = Math.floor((_GetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_LEVEL_PK) as number - 1) / 10);
      if (lvlDivBy10 > 9) lvlDivBy10 = 9;
      for (let j = 0; j < sPickupProbabilities.length; j++) {
        if (sPickupProbabilities[j] > rand) {
          _SetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_HELD_ITEM_PK, sPickupItems[lvlDivBy10 + j]);
          break;
        } else if (rand === 99 || rand === 98) {
          _SetMonDataPK(_gPlayerPartyPK[i], _MON_DATA_HELD_ITEM_PK, sRarePickupItems[lvlDivBy10 + (99 - rand)]);
          break;
        }
      }
    }
  }
  return false;
}

// Imports locaux Cmd_pickup (= éviter dups au top du file).
import {
  gPlayerParty as _gPlayerPartyPK,
  GetMonData as _GetMonDataPK, SetMonData as _SetMonDataPK,
  MON_DATA_SPECIES_OR_EGG as _MON_DATA_SPECIES_OR_EGG_PK,
  MON_DATA_HELD_ITEM as _MON_DATA_HELD_ITEM_PK,
  MON_DATA_ABILITY_NUM as _MON_DATA_ABILITY_NUM_PK,
  MON_DATA_LEVEL as _MON_DATA_LEVEL_PK,
} from './party-storage';
import { getSpeciesInfo as _getSpeciesInfoPK } from '../data/game-data';
import { speciesNumberToEnum as _speciesNumberToEnumPK } from './data/species-runtime';

/** 1:1 décomp : `gSpeciesInfo[species].abilities[abilityNum ? 1 : 0]`. */
function _getSpeciesAbilityPK(species: number, abilityNum: number): number {
  const info = _getSpeciesInfoPK(_speciesNumberToEnumPK(species));
  if (!info) return 0;
  const abilityName = info.abilities[abilityNum ? 1 : 0];
  // Resolve ability name → number via auto-data lookup.
  return _abilityNameToNumberPK(abilityName);
}

/** Resolve ability enum string → number via auto-data constants. */
import * as _AbilityConsts from '../decomp-data/auto/include/constants/abilities-data';
function _abilityNameToNumberPK(abilityName: string): number {
  const val = (_AbilityConsts as Record<string, unknown>)[abilityName];
  return typeof val === 'number' ? val : 0;
}

const ABILITY_PICKUP_PK = 53;  // 1:1 décomp constants/abilities.h.

// ─── 0xF0 givecaughtmon ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_givecaughtmon (battle_script_commands.c:10058-10086). 1 byte.
 *  Add caught Pokémon to party / PC + log dans gBattleResults. */
function Cmd_givecaughtmon(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : BATTLE_OPPOSITE(attacker) = adversaire qu'on a capturé.
  const oppBattler = _BATTLE_OPPOSITE_GC(_gBattlerAttackerGC);
  const partyIdx = _gBattlerPartyIndexesGC[oppBattler];
  const caughtMon = _gEnemyPartyGC[partyIdx];

  // 1:1 décomp ll.10060-10079 : GiveMonToPlayer. Retourne MON_GIVEN_TO_PARTY (0)
  // ou MON_GIVEN_TO_PC (1) ou MON_CANT_GIVE (2 = box full).
  const result = _GiveMonToPlayerGC(caughtMon);
  if (result !== 0 /* MON_GIVEN_TO_PARTY */) {
    // 1:1 décomp battle_script_commands.c:10062-10078 : message PC box select.
    // ShouldShowBoxWasFullMessage check + FLAG_SYS_PC_LANETTE (= unlock Lanette).
    // B_MSG_SENT_SOMEONES_PC=0, B_MSG_SOMEONES_BOX_FULL=1,
    // B_MSG_SENT_LANETTES_PC=2, B_MSG_LANETTES_BOX_FULL=3.
    const boxWasFull = _shouldShowBoxWasFullMessage_GC();
    let msgId = boxWasFull ? 1 /* B_MSG_SOMEONES_BOX_FULL */ : 0 /* B_MSG_SENT_SOMEONES_PC */;
    if (_flagGet_GC(0x86F /* FLAG_SYS_PC_LANETTE = include/constants/flags.h */)) {
      msgId++;  // → SENT_LANETTES_PC or LANETTES_BOX_FULL.
    }
    _gBattleCommunicationGC[5 /* MULTISTRING_CHOOSER */] = msgId;
  }

  // 1:1 décomp ll.10081-10083 : log caught mon stats dans gBattleResults.
  _gBattleResultsGC.caughtMonSpecies = _GetMonDataGC(caughtMon, _MON_DATA_SPECIES_GC) as number;
  // STUB caughtMonNick : write u8[11] depuis MON_DATA_NICKNAME (= Phase 1.4 text buffer).
  // _GetMonDataGC(caughtMon, MON_DATA_NICKNAME, gBattleResults.caughtMonNick);
  _gBattleResultsGC.caughtMonBall = _GetMonDataGC(caughtMon, _MON_DATA_POKEBALL_GC) as number;

  return false;
}

// Imports locaux Cmd_givecaughtmon (= éviter dups au top).
import { BATTLE_OPPOSITE as _BATTLE_OPPOSITE_GC } from './constants';

/** 1:1 décomp `ShouldShowBoxWasFullMessage()` (field_specials.c:3415-3426).
 *  Retourne TRUE si FLAG_SHOWN_BOX_WAS_FULL_MESSAGE n'a pas été set ET
 *  StorageGetCurrentBox() != VarGet(VAR_PC_BOX_TO_SEND_MON). Side-effect : set
 *  le flag à TRUE. Pour Phase 1 sans PC storage : retourne FALSE (= simple). */
function _shouldShowBoxWasFullMessage_GC(): boolean {
  return false;
}

/** 1:1 décomp `FlagGet(flag)` — wired via globalThis.gSaveBlock1Ptr.flags. */
function _flagGet_GC(flag: number): boolean {
  const sb1 = (globalThis as { gSaveBlock1Ptr?: { flags?: number[] | Uint8Array } }).gSaveBlock1Ptr;
  if (!sb1?.flags) return false;
  const byteIdx = flag >> 3;
  const bitIdx = flag & 7;
  const byte = sb1.flags[byteIdx] ?? 0;
  return (byte & (1 << bitIdx)) !== 0;
}
import {
  gBattlerAttacker as _gBattlerAttackerGC,
  gBattlerPartyIndexes as _gBattlerPartyIndexesGC,
  gBattleCommunication as _gBattleCommunicationGC,
  gBattleResults as _gBattleResultsGC,
} from './state';
import {
  gEnemyParty as _gEnemyPartyGC,
  GetMonData as _GetMonDataGC,
  MON_DATA_SPECIES as _MON_DATA_SPECIES_GC,
  MON_DATA_POKEBALL as _MON_DATA_POKEBALL_GC,
} from './party-storage';
// 1:1 décomp `GiveMonToPlayer` (pokemon.c:4412-4432). Notre port :
// SetMonData OT name/gender/id depuis gSaveBlock2Ptr, puis scan gPlayerParty
// pour 1er slot vide. Sinon → CopyMonToPC (= STUB Phase 1.4 PC storage).
import {
  gPlayerParty as _gPlayerPartyGC,
  SetMonData as _SetMonDataGC,
  MON_DATA_OT_ID as _MON_DATA_OT_ID_GC,
  MON_DATA_OT_NAME as _MON_DATA_OT_NAME_GC,
  MON_DATA_OT_GENDER as _MON_DATA_OT_GENDER_GC,
} from './party-storage';
function _GiveMonToPlayerGC(mon: unknown): number {
  // 1:1 décomp pokemon.c GiveMonToPlayer (1:1 strict).
  // SetMonData OT depuis gSaveBlock2Ptr (= player info).
  const sb2 = (globalThis as { gSaveBlock2Ptr?: {
    playerName?: string;
    playerGender?: number;
    playerTrainerId?: number[] | { 0: number };
  } }).gSaveBlock2Ptr;
  if (sb2 && mon) {
    if (sb2.playerName !== undefined) _SetMonDataGC(mon as never, _MON_DATA_OT_NAME_GC, sb2.playerName);
    if (sb2.playerGender !== undefined) _SetMonDataGC(mon as never, _MON_DATA_OT_GENDER_GC, sb2.playerGender);
    // 1:1 décomp : playerTrainerId est u8[4] ; pack en u32 little-endian.
    const tid = sb2.playerTrainerId as number[] | { 0: number; 1: number; 2: number; 3: number } | undefined;
    if (tid) {
      const t0 = (tid as { 0?: number })[0] ?? 0;
      const t1 = (tid as { 1?: number })[1] ?? 0;
      const t2 = (tid as { 2?: number })[2] ?? 0;
      const t3 = (tid as { 3?: number })[3] ?? 0;
      const otId = ((t3 << 24) | (t2 << 16) | (t1 << 8) | t0) >>> 0;
      _SetMonDataGC(mon as never, _MON_DATA_OT_ID_GC, otId);
    }
  }
  // 1:1 décomp : scan gPlayerParty pour 1er slot species==0.
  for (let i = 0; i < 6; i++) {
    const slotMon = _gPlayerPartyGC[i];
    if (!slotMon || slotMon.species === 0) {
      // 1:1 décomp : CopyMon(&gPlayerParty[i], mon, sizeof(*mon)).
      // Notre port : shallow copy (= mon est aussi Pokemon struct).
      if (slotMon && mon) {
        Object.assign(slotMon, mon);
      }
      // gPlayerPartyCount = i + 1 — non porté (= compteur dérivable).
      return 0; // MON_GIVEN_TO_PARTY
    }
  }
  // Party full → CopyMonToPC. STUB Phase 1.4 (= PC storage pas wired).
  return 1; // MON_GIVEN_TO_PC (= simulate sent to PC).
}

// ─── 0xF2 displaydexinfo ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_displaydexinfo. 1 byte. State machine via
 *  gBattleCommunication[0] qui fade out, show dex page, fade back in.
 *
 *  Note 1:1 partial : les helpers UI (BeginNormalPaletteFade, DisplayCaughtMonDexPage,
 *  ShowBg, etc.) ne sont pas wired ici. State machine reduce à advance
 *  immédiat (= simulate completed). */
function Cmd_displaydexinfo(ctx: BattleScriptContext): boolean {
  // 1:1 décomp battle_script_commands.c:10104-10152 : state machine 6 cases (0..5).
  // Cases :
  //   0 : BeginNormalPaletteFade out → state 1
  //   1 : wait fade done + DisplayCaughtMonDexPage → state 2
  //   2 : wait fade + task done + restore VBlankCB → state 3
  //   3 : InitBattleBgsVideo + LoadBattleTextboxAndBackground → state 4
  //   4 : wait DMA + BeginNormalPaletteFade in → state 5
  //   5 : wait fade done → advance opcode.
  //
  // Notre port : state machine fidèle, stubs UI fns advance instant.
  switch (gBattleCommunication[0]) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
      // Stubs UI Phase 1.4 — advance state.
      gBattleCommunication[0]++;
      ctx.scriptPtr--;  // stay on opcode (= re-enter next tick).
      return true;
    case 5:
      // 1:1 décomp : advance opcode + reset.
      gBattleCommunication[0] = 0;
      return false;
    default:
      gBattleCommunication[0] = 0;
      return false;
  }
}

// ─── 0xF3 trygivecaughtmonnick ────────────────────────────────────────────

/** 1:1 décomp Cmd_trygivecaughtmonnick (battle_script_commands.c:10225-10299).
 *  5 bytes (u32 jumpPtr if party full). Yes/No nickname state machine 5 cases.
 *
 *  Macro 1:1 : `trygivecaughtmonnick ptr:req` (battle_script.inc:1230-1233).
 *
 *  Cases :
 *   0 : show YES/NO box + init cursor 0.
 *   1 : poll DPAD up/down + A button → cursor 0 (YES) state 2, sinon state 4.
 *   2 : wait palette fade, open naming screen.
 *   3 : wait naming done, set nickname + jump (= retour normal flow).
 *   4 : si party FULL → advance 5 bytes (= sent to PC), sinon jump (= retour menu).
 *
 *  Port Phase 1 (UI naming screen Phase 1.4+) : auto-NO → case 4 → check party.
 *  Le state advance par tick comme dans drawlvlupbox. */
function Cmd_trygivecaughtmonnick(ctx: BattleScriptContext): boolean {
  const jumpPtr = readWord(ctx);
  switch (gBattleCommunication[0 /* MULTIUSE_STATE */]) {
    case 0:
      // 1:1 décomp : show YES/NO + cursor 0. STUB UI : just advance state.
      gBattleCommunication[3 /* CURSOR_POSITION */] = 0;
      gBattleCommunication[0]++;
      ctx.scriptPtr -= 5;  // re-enter opcode.
      return true;
    case 1:
      // 1:1 décomp : poll input. STUB : auto-NO → state 4 (= skip naming).
      gBattleCommunication[0] = 4;
      ctx.scriptPtr -= 5;
      return true;
    case 2:
      // STUB palette fade : assume done → state 3.
      gBattleCommunication[0]++;
      ctx.scriptPtr -= 5;
      return true;
    case 3:
      // STUB naming screen : assume done → jump à jumpPtr (= retour normal).
      gBattleCommunication[0] = 0;  // reset.
      ctx.scriptPtr = jumpPtr;
      return false;
    case 4: {
      // 1:1 décomp : si party FULL = 6 mons → advance 5 (= sent to PC story).
      // Sinon jump à jumpPtr (= party menu pour place).
      gBattleCommunication[0] = 0;  // reset.
      let playerPartyCount = 0;
      const gParty = (globalThis as { gPlayerParty?: Array<{ species?: number }> }).gPlayerParty;
      if (gParty) {
        for (let i = 0; i < 6; i++) {
          if (gParty[i]?.species) playerPartyCount++;
        }
      }
      if (playerPartyCount === 6) {
        // Advance (= already advanced by readWord).
        return false;
      } else {
        ctx.scriptPtr = jumpPtr;
        return false;
      }
    }
    default:
      gBattleCommunication[0] = 0;
      return false;
  }
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau31Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x15] = Cmd_seteffectwithchance;
  commands[0x8F] = Cmd_forcerandomswitch;
  commands[0xE5] = Cmd_pickup;
  commands[0xF0] = Cmd_givecaughtmon;
  commands[0xF2] = Cmd_displaydexinfo;
  commands[0xF3] = Cmd_trygivecaughtmonnick;
}

void _stayOnOpcode;

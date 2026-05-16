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

/** 1:1 décomp Cmd_forcerandomswitch. 5 bytes (u32 fail jump). Roar/Whirlwind.
 *
 *  Note 1:1 partial : décomp itère party slots pour choisir random alive
 *  non-current mon, puis trigger switch via gBattleStruct.monToSwitchIntoId.
 *  Notre port : skip party iteration (= gPlayerParty/gEnemyParty pas wired).
 *  Pour MVP : fail jump si pas de target valide (= force pas wired). */
function Cmd_forcerandomswitch(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // TODO porter battle_script_commands.c Cmd_forcerandomswitch full impl
  // quand party storage wired battle-side.
  ctx.scriptPtr = failJump;
  return false;
}

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
    // STUB PC box message (= B_MSG_SENT_SOMEONES_PC / SOMEONES_BOX_FULL /
    // SENT_LANETTES_PC / LANETTES_BOX_FULL). Phase 1.4 UI text placeholders.
    _gBattleCommunicationGC[5 /* MULTISTRING_CHOOSER */] = 0 /* B_MSG_SENT_SOMEONES_PC */;
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
// L'auto-gen `pokemon-all-auto.ts:GiveMonToPlayer` use bare globals
// (MON_DATA_OT_NAME, gSaveBlock2Ptr, etc.) sans imports → ReferenceError. On
// remplace par une impl locale POC qui scan gPlayerParty pour un slot vide.
function _GiveMonToPlayerGC(_mon: unknown): number {
  // 1:1 décomp pokemon.c GiveMonToPlayer (simplifié) : retourne 0 (= MON_GIVEN_TO_PARTY)
  // si party slot vide trouvé, 1 (= MON_GIVEN_TO_PC) sinon, 2 (= MON_CANT_GIVE) si box full.
  // Pour POC : assume slot vide existe (= retourne 0).
  // TODO porter logic complète : scan gPlayerParty pour species==0, copy mon, set OT.
  return 0;
}

// ─── 0xF2 displaydexinfo ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_displaydexinfo. 1 byte. State machine via
 *  gBattleCommunication[0] qui fade out, show dex page, fade back in.
 *
 *  Note 1:1 partial : les helpers UI (BeginNormalPaletteFade, DisplayCaughtMonDexPage,
 *  ShowBg, etc.) ne sont pas wired ici. State machine reduce à advance
 *  immédiat (= simulate completed). */
function Cmd_displaydexinfo(ctx: BattleScriptContext): boolean {
  // 1:1 décomp state machine : skip cases 0..4 (= UI rendering), case 5 advance.
  // Pour MVP : advance direct (= simulate machine completion en un opcode tick).
  // TODO porter quand le pipeline rendering est branché au battle UI.
  void ctx;
  gBattleCommunication[0] = 0;  // reset state pour next usage.
  return false;
}

// ─── 0xF3 trygivecaughtmonnick ────────────────────────────────────────────

/** 1:1 décomp Cmd_trygivecaughtmonnick. 1 byte. Yes/No nickname state machine.
 *
 *  Note 1:1 partial : state machine via gBattleCommunication[MULTIUSE_STATE]
 *  qui draw yes/no box, handle DPAD, branche vers naming screen ou skip.
 *  Notre port : MVP advance direct (= simulate "skip nickname"). */
function Cmd_trygivecaughtmonnick(_ctx: BattleScriptContext): boolean {
  // TODO porter yesno state machine + naming screen scene.
  // 1:1 décomp : MULTIUSE_STATE = 0 (= battle_script_commands.h:285).
  // AUDIT FIX : précédemment hardcoded [7] FAUX (= ce serait B_MSG_index).
  gBattleCommunication[0 /* MULTIUSE_STATE */] = 0;
  return false;
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

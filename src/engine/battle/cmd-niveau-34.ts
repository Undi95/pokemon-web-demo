/**
 * battle/cmd-niveau-34.ts — Phase 1 Niveau 34 (getexp + various dispatcher) — 2 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x23 getexp    (1 byte  — XP gain state machine, ~12k chars décomp)
 *   0x76 various   (3 bytes — huge dispatcher avec 30+ subcases, ~7k chars)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note 1:1 STRICT : Ces 2 opcodes sont les plus gros de battle_script_commands.
 *  0x23 getexp gère toute la state machine XP gain (= calcul, level-up,
 *  evolution, learn move). 0x76 various contient un switch géant sur 30+ cases
 *  (VARIOUS_*) qui font des actions misc (cancel multi-turn, set magic coat
 *  target, jumpifaromaveiled, etc.).
 *
 *  Pour 1:1 partial, on advance les bytes correctement (= ne crash pas l'interp).
 *  Le full port nécessite : gExpShareItem + gExperienceTables + UpdateMonGrowthRate
 *  + Cmd_drawlvlupbox sync (= 0x6C) + naming screen pour le NEW MOVE flow.
 *
 *  TODO porter ces 2 opcodes post-Phase 1 quand tout l'écosystème UI + party
 *  storage + level system est wired battle-side. */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte } from './script-interpreter';
import { gBattleControllerExecFlags } from './state';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x23 getexp ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_getexp. 1 byte. ~12k chars de state machine.
 *  Décomp gère via gBattleScripting.getexpState 0..6 :
 *    0 : calculate XP, check who's eligible (= participating mons via
 *        gBattleStruct.expGetterMonId tracking + ExpShare item)
 *    1 : per-mon distribute (loop sur eligible mons)
 *    2 : send XP gain message + animation
 *    3 : apply XP via SetMonData + handle level up trigger
 *    4 : trigger BattleScript_LevelUp + drawlvlupbox jump
 *    5 : learn move check (= jump à BattleScript_TryLearnMoveLoop)
 *    6 : transition next eligible mon ou finish
 *
 *  Notre port MVP : skip toute la state machine (= advance). Le combat
 *  Phase 1 utilise battle-flow.ts existant qui a sa propre logic XP. */
function Cmd_getexp(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  // TODO porter battle_script_commands.c:5054..5635 getexp full state machine.
  // Dépendances : gExperienceTables, gExpShareItem flag, ExpShare item lookup,
  // gBattleStruct.expGetterMonId, GetMonData EXP/LEVEL, MonGetEvolutionTargetSpecies,
  // BattleScript_LevelUp / TryLearnMoveLoop / Evolution labels.
  return false;
}

// ─── 0x76 various ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_various. 3 bytes (u8 battler + u8 caseId). ~7k chars.
 *  Le switch fait des actions micro selon caseId VARIOUS_* (~35 cases) :
 *    VARIOUS_CANCEL_MULTI_TURN_MOVES, SET_MAGIC_COAT_TARGET, JUMPIFAROMAVEILED,
 *    GET_MOVE_TARGET, PALACE_FLAG_TO_BOOL, ... etc.
 *
 *  Notre port MVP : consume les 2 args + advance. Le full port nécessite
 *  beaucoup de helpers (CancelMultiTurnMoves déjà OK ; mais BattleArena,
 *  Pyramid, Pike, etc. requiert systèmes externes pas wired). */
function Cmd_various(ctx: BattleScriptContext): boolean {
  readByte(ctx);  // battler arg
  readByte(ctx);  // caseId
  // TODO porter battle_script_commands.c:9148..9696 switch various full.
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau34Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x23] = Cmd_getexp;
  commands[0x76] = Cmd_various;
}

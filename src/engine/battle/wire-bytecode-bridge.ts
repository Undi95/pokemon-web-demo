/**
 * battle/wire-bytecode-bridge.ts — Bridge entre battle-flow.ts (= PokemonInstance
 * state machine ad-hoc) et le bytecode interpreter 1:1 décomp.
 *
 * Permet d'exécuter un move script bytecode 1:1 décomp à la place de la formule
 * damage simplifiée. Wire derrière le flag `__USE_BYTECODE_FOR_DAMAGE__`
 * (= localStorage / window var) pour A/B testing.
 *
 * Architecture :
 *   - Sync HP/status des PokemonInstance vers gBattleMons avant le run.
 *   - Setup gBattlerAttacker / gBattlerTarget / gCurrentMove.
 *   - Lookup script offset depuis BATTLE_SCRIPTS_FOR_MOVE_EFFECTS[move.effect].
 *   - Run le bytecode jusqu'à fin (= fastForward, no pause).
 *   - Sync gBattleMons HP back vers PokemonInstance.
 *   - Return { damage, typeMul, resultFlags } pour la state machine externe.
 *
 * Note : ce helper ne gère PAS l'UI (= text, animations). Le caller doit
 * afficher les messages via `ShowFieldMessage` après l'exécution. Phase 1.4 J/K/L
 * wired les controllers UI à des callbacks réels.
 */

import type { PokemonInstance } from '../pokemon/pokemon';
import {
  gBattleMons,
  gBattleMoveDamage,
  gMoveResultFlags,
  gBattlerPartyIndexes,
  setBattlerAttacker,
  setBattlerTarget,
  setBattlerFainted,
  setAbsentBattlerFlags,
  setCurrentMove,
  setChosenMove,
  setCurrMovePos,
  setChosenMovePos,
  setMultiHitCounter,
  setDynamicBasePower,
  gBattleCommunication,
  setHitMarker,
  gHitMarker,
  setMoveResultFlags,
  setBattleOutcome,
  setBattleMoveDamage,
  setCritMultiplier,
  setCurrentActionFuncId,
  gBattleScripting,
  gBattleResults,
  gChosenActionByBattler,
  gChosenMoveByBattler,
  gBattleStruct,
  gBattleTypeFlags,
  setActiveBattler,
  setBattleTypeFlags,
  setTrainerBattleOpponentA,
} from './state';
import { Random } from '../system/random';
import {
  BattleAI_SetupAIData,
  BattleAI_ChooseMoveOrAction,
} from '../../battle_ai_script_commands';
import {
  loadAiScriptBytecode,
  aiBytecodeLoaded,
} from './ai/ai-state';
import {
  AI_CHOICE_FLEE,
  AI_CHOICE_WATCH,
} from '../../battle_ai_script_commands';
import {
  ALL_MOVES_MASK, MAX_MON_MOVES, BATTLE_TYPE_TRAINER, MISS_TYPE,
  BATTLE_TYPE_PALACE, BATTLE_TYPE_ARENA,
  BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_SAFARI, BATTLE_TYPE_ROAMER,
} from './constants';
import { MOVE_NONE } from '../decomp-data/include/constants/moves-data';
import { PARTY_SIZE } from '../decomp-data/include/constants/global-data';
import { MAX_BATTLERS_COUNT } from './state';
import { runBattleScript, setupBattleScriptContext, getMoveEffectScriptOffset } from './script-interpreter';
import { resetAtkCancelerTracker } from '../../battle_util';
import { TurnValuesCleanUp } from './util';
// AUDIT FIX : import statique de end-turn-effects (= éviter ESM dual-instance via
// dynamic import async). Pas de circular dep car end-turn-effects → state ; bridge → state.
import {
  resetFieldEndTurnEffectsState,
  resetBattlerEndTurnEffectsState,
  resetWishPerishSongState,
  DoFieldEndTurnEffects,
  DoBattlerEndTurnEffects,
  HandleWishPerishSongOnTurnEnd,
} from '../../battle_util';
// AUDIT FIX : static imports pour HandleFaintedMonActions (= éviter dual-instance).
import {
  AbilityBattleEffects as AbilityBattleEffects_static,
  ABILITYEFFECT_INTIMIDATE1,
  ABILITYEFFECT_TRACE,
  ABILITYEFFECT_FORECAST,
  ABILITYEFFECT_ON_SWITCHIN,
  ABILITYEFFECT_SWITCH_IN_WEATHER,
  consumeAbilityWantedScript as consumeAbilityWantedScript_static,
} from '../../battle_util';
import {
  ItemBattleEffects as ItemBattleEffects_static,
  ITEMEFFECT_NORMAL as ITEMEFFECT_NORMAL_static,
  ITEMEFFECT_ON_SWITCH_IN as ITEMEFFECT_ON_SWITCH_IN_static,
  consumeItemWantedScript as consumeItemWantedScript_static,
} from '../../battle_util';
import { GetWhoStrikesFirst as GetWhoStrikesFirst_static } from '../../battle_ai_script_commands';
import { resolveDecompConstant } from '../../../harness/runtime/decomp-constants';
import { getMove } from '../data/game-data';
import { resolveMoveDexId, moveDexIdToEnum } from './party-storage';
import {
  dequeueBattleEvent,
  clearBattleEventQueue,
  getBattleEventQueueSize,
  CONTROLLER_PRINTSTRING,
  CONTROLLER_PRINTSTRINGPLAYERONLY,
  type BattleEvent,
} from './battle-event-queue';
import { decodeBattleString, battleStringToPrinterText } from './battle-string-decoder';

// ─── Move result decoding (= 1:1 décomp battle.h MOVE_RESULT_*) ──────────

/** 1:1 décomp `MOVE_RESULT_*` masks (battle.h). */
const MOVE_RESULT_MISSED                = 1 << 0;
const MOVE_RESULT_SUPER_EFFECTIVE       = 1 << 1;
const MOVE_RESULT_NOT_VERY_EFFECTIVE    = 1 << 2;
const MOVE_RESULT_DOESNT_AFFECT_FOE     = 1 << 3;
const MOVE_RESULT_ONE_HIT_KO            = 1 << 4;
const MOVE_RESULT_FAILED                = 1 << 5;
const MOVE_RESULT_FOE_ENDURED           = 1 << 6;
const MOVE_RESULT_FOE_HUNG_ON           = 1 << 7;

/** Decode gMoveResultFlags → typeMul équivalent simple (0/0.5/1/2). */
function _decodeTypeMulFromResultFlags(flags: number): number {
  if (flags & MOVE_RESULT_DOESNT_AFFECT_FOE) return 0;
  if (flags & MOVE_RESULT_SUPER_EFFECTIVE)   return 2;
  if (flags & MOVE_RESULT_NOT_VERY_EFFECTIVE) return 0.5;
  return 1;
}

// ─── Move id resolution from PokemonInstance.moves[i].id (dex string) ──

/** 1:1 décomp resolveMoveId : dexId ("blazekick") → id numérique MOVE_*.
 *  Résolution 100% décomp-extraite (constantes moves-data normalisées) via
 *  party-storage — SOURCE DE VÉRITÉ UNIQUE, ZÉRO @pkmn/dex (1:1 strict). */
function _resolveMoveId(dexId: string): number {
  return resolveMoveDexId(dexId);
}

// ─── Effect resolution (= move's gBattleMoves[].effect → script label) ──

/** 1:1 décomp gBattleMoves[move].effect (EFFECT_HIT, EFFECT_SLEEP, etc.). */
function _resolveMoveEffect(moveId: number): number {
  // game-data uses MOVE_X enum keys; we have id, need to reverse lookup.
  // For most moves, getBattleMove(moveId).effect is the right path.
  // Try direct via game-data first.
  try {
    // Resolve numeric move id to enum name.
    const dataMod = (globalThis as { __game_data?: {
      moves?: Record<string, { effect?: string }>;
    } }).__game_data;
    if (!dataMod?.moves) return 0;
    // Scan moves for matching id (= slow but only at battle start).
    for (const [enumKey, mv] of Object.entries(dataMod.moves)) {
      const id = resolveDecompConstant(enumKey);
      if (id === moveId) {
        const effect = mv.effect ? resolveDecompConstant(mv.effect) : 0;
        return typeof effect === 'number' ? effect : 0;
      }
    }
  } catch { /* fallthrough */ }
  return 0;
}

/** Get move effect via dex id → getMove → effect. Résolution du nom d'enum
 *  100% décomp-extraite (moveDexIdToEnum, gère les noms composés type
 *  'tailwhip'→MOVE_TAIL_WHIP). Zéro @pkmn/dex. */
function _resolveMoveEffectFromDexId(dexId: string): number {
  const moveData = getMove(moveDexIdToEnum(dexId));
  if (!moveData) return 0;
  const effect = resolveDecompConstant(moveData.effect);
  return typeof effect === 'number' ? effect : 0;
}

// ─── Public API ─────────────────────────────────────────────────────────

/** Exécute un move via bytecode 1:1 décomp et retourne les outcomes mesurables.
 *
 *  Sync HP/status des PokemonInstance arguments vers gBattleMons avant + restore
 *  après. Sets gBattlerAttacker = attackerBattlerId (default 0 pour player).
 *
 *  Returns :
 *   - damage : HP perdus par defender (= défini par bytecode datahpupdate).
 *   - typeMul : 0 / 0.5 / 1 / 2 selon gMoveResultFlags après run.
 *   - missed : true si MOVE_RESULT_MISSED set (= miss/failed).
 *   - fainted : true si defender hp tombé à 0.
 *   - bytecodeOpsCount : nombre d'opcodes exécutés (debug).
 *
 *  Si script introuvable / move data manquante : retourne damage=0 missed=true.
 */
export function runMoveScriptViaBytecode(opts: {
  attacker: PokemonInstance;
  defender: PokemonInstance;
  attackerMoveIdx: number;
  attackerBattlerId?: number;  // 0 ou 2 (player). Default 0.
  defenderBattlerId?: number;  // 1 ou 3 (enemy). Default 1.
}): {
  ok: boolean;
  reason?: string;
  damage: number;
  typeMul: number;
  missed: boolean;
  fainted: boolean;
  bytecodeOpsCount: number;
  /** Messages décodés depuis les PRINTSTRING events. 1 entry par
   *  BtlController_EmitPrintString appelé pendant le bytecode. À show via
   *  ShowFieldMessage côté caller (= 1:1 décomp `BufferStringBattle`). */
  messages?: string[];
  /** Nombre total d'events bytecode enqueued (= debug). */
  eventsCount?: number;
  /** Full list des events drained. Type CONTROLLER_*. Permet au caller de
   *  process non-PRINTSTRING events (= PLAYSE pour audio engine, HIT_ANIMATION
   *  pour sprite shake, etc.). */
  events?: BattleEvent[];
} {
  const attBId = opts.attackerBattlerId ?? 0;
  let defBId = opts.defenderBattlerId ?? 1;
  // Clear queue avant chaque run pour éviter de mixer events cross-turn.
  clearBattleEventQueue();
  const mv = opts.attacker.moves[opts.attackerMoveIdx];
  if (!mv) {
    return { ok: false, reason: 'no move at index', damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  const moveId = _resolveMoveId(mv.id);
  if (!moveId) {
    return { ok: false, reason: `move '${mv.id}' resolves to id 0`, damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  const effectId = _resolveMoveEffectFromDexId(mv.id);
  const scriptOffset = getMoveEffectScriptOffset(effectId);
  if (scriptOffset < 0) {
    return { ok: false, reason: `no script for effect ${effectId}`, damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  // 1:1 décomp : si move target = USER (= self-heal/buff), set gBattlerTarget
  // = gBattlerAttacker. Sinon : keep defender. Tableau gBattleMoves[move].target.
  // Résolution nom composé 100% décomp-extraite (moveDexIdToEnum), zéro Showdown.
  try {
    const moveData = getMove(moveDexIdToEnum(mv.id));
    const targetField = moveData?.target;
    if (typeof targetField === 'string') {
      // 1:1 décomp include/constants/battle.h:96-103 MOVE_TARGET_*:
      // MOVE_TARGET_USER = 1<<4 = 16, MOVE_TARGET_USER_OR_SELECTED = 1<<1 = 2.
      // resolveDecompConstant ne contient pas ces values (= manually constants.ts),
      // donc check directement la string.
      if (targetField === 'MOVE_TARGET_USER' || targetField === 'MOVE_TARGET_USER_OR_SELECTED') {
        defBId = attBId;  // self-target
      }
    }
  } catch { /* fallthrough */ }

  // Sync state HP from PokemonInstance into gBattleMons.
  // Note : gBattleMons is assumed already filled with species/stats/etc. via
  // fillActiveBattleMonsForBattleStart at battle setup. This just refreshes HP
  // pour syncer entre les turns (= damage propagé par turn précédent).
  gBattleMons[attBId].hp = opts.attacker.currentHp;
  gBattleMons[defBId].hp = opts.defender.currentHp;
  const defenderHpBefore = opts.defender.currentHp;

  // Setup battle state vars for bytecode.
  setBattlerAttacker(attBId);
  setBattlerTarget(defBId);
  setCurrentMove(moveId);
  setChosenMove(moveId);
  // 1:1 décomp : gCurrMovePos = attackerMoveIdx (= slot du move utilisé).
  setCurrMovePos(opts.attackerMoveIdx);
  setHitMarker(0);
  setMoveResultFlags(0);
  setBattleMoveDamage(0);
  setCritMultiplier(1);
  // 1:1 décomp `HandleAction_UseMove` (battle_util.c:91-97) — init per-move
  // AVANT le jump `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[...]`
  // (battle_util.c:285). Le bridge saute directement au script d'effet, donc
  // ces resets (faits par HandleAction_UseMove dans le vrai flow) DOIVENT
  // être répliqués ici, sinon l'état per-move fuit d'un move au suivant
  // (dmgMultiplier/multiHit/dynamicBasePower stale → damage faux). Bug réel
  // (= bytecode = moteur défaut depuis le flip). gCritMultiplier=1 ci-dessus.
  gBattleScripting.dmgMultiplier = 1;          // battle_util.c:92
  setMultiHitCounter(0);                        // battle_util.c:95
  gBattleCommunication[MISS_TYPE] = 0;          // battle_util.c:96
  setChosenMovePos(opts.attackerMoveIdx);       // battle_util.c:97 (gChosenMovePos)
  // 1:1 décomp turn-start (battle_main.c:4928-4929) — gDynamicBasePower /
  // dynamicMoveType sont remis à 0 au début du turn ; le bridge exécute un
  // move « dans un turn frais », donc reset ici (le script du move les
  // re-set si besoin, ex. Return/Frustration/Magnitude, AVANT damagecalc).
  setDynamicBasePower(0);                        // battle_main.c:4928
  gBattleStruct.dynamicMoveType = 0;            // battle_main.c:4929
  setCurrentActionFuncId(0);  // = B_ACTION_USE_MOVE (= continue current move).
  // 1:1 décomp : si gBattleOutcome != 0, attackcanceler retourne stayOnOpcode
  // infiniment. Reset à chaque turn (= simulate fresh battle context).
  setBattleOutcome(0);
  gBattlerPartyIndexes[attBId] = 0;
  gBattlerPartyIndexes[defBId] = 0;
  resetAtkCancelerTracker();

  // Sync PP : attacker move PP from PokemonInstance.
  for (let i = 0; i < 4; i++) {
    const m = opts.attacker.moves[i];
    if (m) {
      gBattleMons[attBId].pp[i] = m.pp;
    }
  }

  // Run bytecode (fastForward = re-call jusqu'à fin).
  const ctx = setupBattleScriptContext('BattleScript_EffectHit');
  if (!ctx) {
    return { ok: false, reason: 'setup ctx failed', damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  // Override scriptPtr to the actual move's effect script.
  ctx.scriptPtr = scriptOffset;

  let iters = 0;
  let opsCount = 0;
  let paused = runBattleScript(ctx);
  iters++;
  let lastPtr = ctx.scriptPtr;
  let stuck = 0;
  while (paused && iters < 200 && ctx.scriptPtr >= 0) {
    paused = runBattleScript(ctx);
    iters++;
    if (ctx.scriptPtr === lastPtr) {
      stuck++;
      if (stuck > 5) break;
    } else {
      stuck = 0;
      lastPtr = ctx.scriptPtr;
    }
  }
  void opsCount;

  // Sync gBattleMons HP back to PokemonInstance.
  opts.attacker.currentHp = gBattleMons[attBId].hp;
  opts.defender.currentHp = gBattleMons[defBId].hp;

  // Sync PP back.
  for (let i = 0; i < 4; i++) {
    const m = opts.attacker.moves[i];
    if (m && gBattleMons[attBId].pp[i] !== undefined) {
      m.pp = gBattleMons[attBId].pp[i];
    }
  }

  // Sync status1 back to PokemonInstance (= persist BURN/PSN/PAR/etc. au-delà
  // du combat). 1:1 décomp inverse mapping STATUS1_* → PSN/BRN/etc.
  _syncStatus1ToInstance(opts.attacker, gBattleMons[attBId].status1);
  _syncStatus1ToInstance(opts.defender, gBattleMons[defBId].status1);

  const damage = defenderHpBefore - opts.defender.currentHp;
  const typeMul = _decodeTypeMulFromResultFlags(gMoveResultFlags);
  const missed = (gMoveResultFlags & (MOVE_RESULT_MISSED | MOVE_RESULT_FAILED)) !== 0;
  const fainted = opts.defender.currentHp <= 0;

  // Drain le queue d'events bytecode produits par les BtlController_Emit*
  // appelés pendant runBattleScript. Decode les PRINTSTRING events en text
  // FR pour ShowFieldMessage côté caller.
  const messages: string[] = [];
  const allEvents: BattleEvent[] = [];
  while (getBattleEventQueueSize() > 0) {
    const ev = dequeueBattleEvent();
    if (!ev) break;
    allEvents.push(ev);
    if (ev.type === CONTROLLER_PRINTSTRING || ev.type === CONTROLLER_PRINTSTRINGPLAYERONLY) {
      const decoded = decodeBattleString(ev.stringId, ev.msgData);
      // #textes 1:1 : préserve `\p`/`\l`/`{PAUSE N}` (= ▼ + attente A / timer selon
      // le code de fin de message décomp) au lieu de tout stripper. Le caller affiche
      // via showBattleMessage qui interprète ces codes (printer animé).
      const clean = battleStringToPrinterText(decoded);
      if (clean.length > 0) messages.push(clean.trim());
    }
  }

  return {
    ok: true,
    damage,
    typeMul,
    missed,
    fainted,
    bytecodeOpsCount: iters,
    messages,
    eventsCount: allEvents.length,
    events: allEvents,
  };
}

/** Drain TOUTE la queue d'events bytecode et decode les PRINTSTRING en text.
 *  Utile pour devtools (= scope.bytecode.drainEvents()) ou pour state machines
 *  qui veulent inspecter post-exec sans relancer le bytecode. */
export function drainBattleEventsAsText(): { messages: string[]; eventsCount: number; events: BattleEvent[] } {
  const messages: string[] = [];
  const events: BattleEvent[] = [];
  while (getBattleEventQueueSize() > 0) {
    const ev = dequeueBattleEvent();
    if (!ev) break;
    events.push(ev);
    if (ev.type === CONTROLLER_PRINTSTRING || ev.type === CONTROLLER_PRINTSTRINGPLAYERONLY) {
      const decoded = decodeBattleString(ev.stringId, ev.msgData);
      // #textes 1:1 : préserve `\p`/`\l`/`{PAUSE N}` (= ▼ + attente A / timer selon
      // le code de fin de message décomp) au lieu de tout stripper. Le caller affiche
      // via showBattleMessage qui interprète ces codes (printer animé).
      const clean = battleStringToPrinterText(decoded);
      if (clean.length > 0) messages.push(clean.trim());
    }
  }
  return { messages, eventsCount: events.length, events };
}

/** Re-export clear pour devtools et pour battle-flow.ts (= reset queue au début
 *  d'un nouveau turn pour éviter de mixer les events). */
export { clearBattleEventQueue };

// ─── HandleFaintedMonActions runner (Phase 1.4 L) ───────────────────────────

/** 1:1 décomp `HandleFaintedMonActions()` (battle_util.c:1877-1954).
 *  7-state machine pour gestion KO mid-turn :
 *
 *    case 0 : init (skip si SAFARI) + reset gAbsentBattlerFlags pour mons dispo
 *    case 1 : find unscored fainted mon → exec BattleScript_GiveExp → state 2
 *    case 2 : OpponentSwitchInResetSentPokesToOpponentValue → next battler
 *             → state 1 (loop) ou 3 (done)
 *    case 3 : init pour handle faint sub-loop
 *    case 4 : find fainted mon → exec BattleScript_HandleFaintedMon → state 5
 *    case 5 : next battler → state 4 (loop) ou 6 (done)
 *    case 6 : check ABILITYEFFECT_INTIMIDATE1/TRACE/ITEMEFFECT_NORMAL(TRUE)/
 *             FORECAST → return TRUE si effect (= exec leur script via wantedScript)
 *    case 7 : break do-while → return FALSE
 *
 *  Loop jusqu'à state == FAINTED_ACTIONS_MAX_CASE (=7) sans interruption.
 *  Pour le caller : `let r; while (r = runHandleFaintedMonActionsViaBytecode())`. */
export function runHandleFaintedMonActionsViaBytecode(): {
  ok: boolean;
  phases: { phase: 'fainted'; label: string }[];
  messages: string[];
  events: BattleEvent[];
  eventsCount: number;
} {
  clearBattleEventQueue();
  const phases: { phase: 'fainted'; label: string }[] = [];

  const gs = (globalThis as { __battleState?: {
    gBattleStruct?: {
      faintedActionsState: number;
      faintedActionsBattlerId: number;
      givenExpMons: number;
    };
    gBattlersCount?: number;
    gAbsentBattlerFlags?: number;
    gBattleMons?: Array<{ hp: number }>;
    gBattlerPartyIndexes?: number[];
    gBattleTypeFlags?: number;
  } }).__battleState;
  if (!gs?.gBattleStruct) return { ok: false, phases, messages: [], events: [], eventsCount: 0 };

  const BATTLE_TYPE_SAFARI = 1 << 7;
  const FAINTED_ACTIONS_MAX_CASE = 7;
  const PARTY_SIZE = 6;
  const tf = gs.gBattleTypeFlags ?? 0;
  if (tf & BATTLE_TYPE_SAFARI) {
    return { ok: true, phases, messages: [], events: [], eventsCount: 0 };
  }

  const battlersCount = gs.gBattlersCount ?? 2;
  const bitTable = [1, 2, 4, 8];

  // Reset state machine au début du flow.
  gs.gBattleStruct.faintedActionsState = 0;

  // Static imports déjà en tête de fichier (= éviter ESM dual-instance).
  const abe = { AbilityBattleEffects: AbilityBattleEffects_static,
                ABILITYEFFECT_INTIMIDATE1, ABILITYEFFECT_TRACE, ABILITYEFFECT_FORECAST,
                consumeAbilityWantedScript: consumeAbilityWantedScript_static };
  const ibe = { ItemBattleEffects: ItemBattleEffects_static, ITEMEFFECT_NORMAL: ITEMEFFECT_NORMAL_static,
                consumeItemWantedScript: consumeItemWantedScript_static };

  let safety = 0;
  while (safety++ < 100 && gs.gBattleStruct.faintedActionsState !== FAINTED_ACTIONS_MAX_CASE) {
    const s = gs.gBattleStruct.faintedActionsState;
    let returnedTrue = false;

    switch (s) {
      case 0: {
        // 1:1 décomp ll. 1886-1894 : init + un-mark mons absents qui ont party.
        gs.gBattleStruct.faintedActionsBattlerId = 0;
        gs.gBattleStruct.faintedActionsState = 1;
        for (let i = 0; i < battlersCount; i++) {
          if ((gs.gAbsentBattlerFlags ?? 0) & bitTable[i]) {
            // HasNoMonsToSwitch(i, PARTY_SIZE, PARTY_SIZE) — 1:1 stub via cmd-niveau-32.
            // Inline simple check : un mon dispo dans son party + alive ?
            const partyIdx = gs.gBattlerPartyIndexes?.[i] ?? 0;
            const partyMod = (i & 1) === 0
              ? (globalThis as { gPlayerParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gPlayerParty
              : (globalThis as { gEnemyParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gEnemyParty;
            let hasAlt = false;
            if (partyMod) {
              for (let j = 0; j < PARTY_SIZE; j++) {
                if (j === partyIdx) continue;
                const m = partyMod[j];
                if (m?.species && (m.hp ?? 0) > 0 && !m.isEgg) { hasAlt = true; break; }
              }
            }
            if (hasAlt) {
              setAbsentBattlerFlags((gs.gAbsentBattlerFlags ?? 0) & ~bitTable[i]);
            }
          }
        }
        // fall through (= continue while loop, next switch case 1).
        break;
      }

      case 1: {
        // 1:1 décomp ll. 1896-1909 : find unscored fainted mon.
        let foundFainted = false;
        do {
          const b = gs.gBattleStruct.faintedActionsBattlerId;
          setBattlerTarget(b);
          setBattlerFainted(b);
          const partyIdx = gs.gBattlerPartyIndexes?.[b] ?? 0;
          const expBit = bitTable[partyIdx] ?? 1;
          if ((gs.gBattleMons?.[b]?.hp ?? 1) === 0
              && !((gs.gBattleStruct.givenExpMons ?? 0) & expBit)
              && !((gs.gAbsentBattlerFlags ?? 0) & bitTable[b])) {
            phases.push({ phase: 'fainted', label: 'BattleScript_GiveExp' });
            _runScriptSync('BattleScript_GiveExp');
            gs.gBattleStruct.faintedActionsState = 2;
            foundFainted = true;
            returnedTrue = true;
            break;
          }
        } while (++gs.gBattleStruct.faintedActionsBattlerId !== battlersCount);
        if (!foundFainted) {
          gs.gBattleStruct.faintedActionsState = 3;
        }
        break;
      }

      case 2: {
        // 1:1 décomp ll. 1911-1916 : OpponentSwitchInReset + advance battler.
        const b: number = gs.gBattleStruct.faintedActionsBattlerId;
        // GET_BATTLER_SIDE(b) == OPPONENT (= b & 1).
        if ((b & 1) === 1) {
          // Inline OpponentSwitchInResetSentPokesToOpponentValue (= cmd-niveau-28 pattern).
          const flank = (b & 2) >>> 1;
          const sentPokes = (globalThis as { gSentPokesToOpponent?: number[] }).gSentPokesToOpponent;
          if (sentPokes) {
            sentPokes[flank] = 0;
            let bits = 0;
            for (let i = 0; i < battlersCount; i += 2) {
              if (!((gs.gAbsentBattlerFlags ?? 0) & bitTable[i])) {
                bits |= bitTable[gs.gBattlerPartyIndexes?.[i] ?? 0];
              }
            }
            sentPokes[flank] = bits;
          }
        }
        if (++gs.gBattleStruct.faintedActionsBattlerId === battlersCount) {
          gs.gBattleStruct.faintedActionsState = 3;
        } else {
          gs.gBattleStruct.faintedActionsState = 1;
        }
        break;
      }

      case 3: {
        // 1:1 décomp ll. 1918-1920 : init pour handle faint sub-loop.
        gs.gBattleStruct.faintedActionsBattlerId = 0;
        gs.gBattleStruct.faintedActionsState = 4;
        // fall through
        break;
      }

      case 4: {
        // 1:1 décomp ll. 1922-1933 : find fainted mon → handle.
        let foundFainted = false;
        do {
          const b = gs.gBattleStruct.faintedActionsBattlerId;
          setBattlerTarget(b);
          setBattlerFainted(b);
          if ((gs.gBattleMons?.[b]?.hp ?? 1) === 0
              && !((gs.gAbsentBattlerFlags ?? 0) & bitTable[b])) {
            phases.push({ phase: 'fainted', label: 'BattleScript_HandleFaintedMon' });
            _runScriptSync('BattleScript_HandleFaintedMon');
            gs.gBattleStruct.faintedActionsState = 5;
            foundFainted = true;
            returnedTrue = true;
            break;
          }
        } while (++gs.gBattleStruct.faintedActionsBattlerId !== battlersCount);
        if (!foundFainted) {
          gs.gBattleStruct.faintedActionsState = 6;
        }
        break;
      }

      case 5: {
        // 1:1 décomp ll. 1936-1939 : advance battler.
        if (++gs.gBattleStruct.faintedActionsBattlerId === battlersCount) {
          gs.gBattleStruct.faintedActionsState = 6;
        } else {
          gs.gBattleStruct.faintedActionsState = 4;
        }
        break;
      }

      case 6: {
        // 1:1 décomp ll. 1942-1947 : Intimidate/Trace/ITEMEFFECT_NORMAL TRUE/Forecast.
        const e1 = abe.AbilityBattleEffects(abe.ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0);
        if (e1) {
          const label = abe.consumeAbilityWantedScript();
          if (label) { phases.push({ phase: 'fainted', label }); _runScriptSync(label); }
          returnedTrue = true;
          break;
        }
        const e2 = abe.AbilityBattleEffects(abe.ABILITYEFFECT_TRACE, 0, 0, 0, 0);
        if (e2) {
          const label = abe.consumeAbilityWantedScript();
          if (label) { phases.push({ phase: 'fainted', label }); _runScriptSync(label); }
          returnedTrue = true;
          break;
        }
        const e3 = ibe.ItemBattleEffects(ibe.ITEMEFFECT_NORMAL, 0, true);
        if (e3) {
          const label = ibe.consumeItemWantedScript();
          if (label) { phases.push({ phase: 'fainted', label }); _runScriptSync(label); }
          returnedTrue = true;
          break;
        }
        const e4 = abe.AbilityBattleEffects(abe.ABILITYEFFECT_FORECAST, 0, 0, 0, 0);
        if (e4) {
          const label = abe.consumeAbilityWantedScript();
          if (label) { phases.push({ phase: 'fainted', label }); _runScriptSync(label); }
          returnedTrue = true;
          break;
        }
        gs.gBattleStruct.faintedActionsState = 7;
        break;
      }
    }

    if (returnedTrue) {
      // Décomp return TRUE = caller doit re-call. Notre port = loop continue
      // pour fait equivalents repeat call. Skip to next iter.
      continue;
    }
  }

  const drained = drainBattleEventsAsText();
  return {
    ok: true, phases,
    messages: drained.messages, events: drained.events, eventsCount: drained.eventsCount,
  };
}

// ─── BattleTurnPassed wrapper (Phase 1.4 L) ─────────────────────────────────

/** 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956-4019).
 *  Caller (= battle-flow turn loop) appelle après les 2 moves du turn. Encapsule
 *  toute la phase end-of-turn :
 *
 *    1. TurnValuesCleanUp(TRUE)      → post-move quick cleanup
 *    2. DoFieldEndTurnEffects loop   → field timers / weather
 *    3. DoBattlerEndTurnEffects loop → per-battler effects
 *    4. HandleFaintedMonActions      → DEFERRED Phase 1.4+ (= partial port handle-action.ts)
 *    5. HandleWishPerishSongOnTurnEnd loop → wish/perish/arena
 *    6. TurnValuesCleanUp(FALSE)     → fresh turn cleanup (= decrement isFirstTurn)
 *    7. Clear HITMARKER bits NO_ATTACKSTRING/UNABLE_TO_USE_MOVE/PLAYER_FAINTED/PASSIVE_HP_UPDATE
 *    8. Reset gBattleScripting.animTurn/animTargetsHit/moveendState
 *    9. Reset gBattleMoveDamage + gMoveResultFlags + gBattleCommunication[0..4]
 *   10. Si outcome != 0 : set gCurrentActionFuncId = B_ACTION_FINISHED + return
 *   11. Increment battleTurnCounter + arenaTurnCounter (= cap 0xFF)
 *   12. Reset gChosenActionByBattler[i] + gChosenMoveByBattler[i] pour tous battlers
 *   13. Reset gBattleStruct.monToSwitchIntoId[i] = PARTY_SIZE (6) pour MAX_BATTLERS
 *   14. Save gAbsentBattlerFlags → gBattleStruct.absentBattlerFlags
 *   15. BATTLE_TYPE_PALACE → exec BattleScript_PalacePrintFlavorText
 *   16. BATTLE_TYPE_ARENA + arenaTurnCounter==0 → exec BattleScript_ArenaTurnBeginning
 *
 *  Retourne `{ phases, messages, events, outcome, battleEnded }` pour le caller.
 *  Si `battleEnded === true`, le caller doit appeler la cleanup post-battle. */

/** 1:1 décomp `TryDoEventsBeforeFirstTurn` (battle_main.c:3845) réimplémenté inline
 *  (comme runHandleFaintedMonActionsViaBytecode) : exécute les abilities + objets de
 *  SWITCH-IN à l'entrée en combat — météo (Crachin/Sécheresse/Tempête de Sable), puis
 *  ON_SWITCHIN (Intimidation, Trace, Prévision…) dans l'ordre de vitesse, puis
 *  INTIMIDATE1/TRACE, puis les objets de switch-in (Herbe Blanche…). Chaque effet pose
 *  un "wanted script" consommé + run via _runScriptSync ; les messages FR sont drainés
 *  pour la state machine. À appeler une fois à l'entrée (avant le 1er tour). */
export function runSwitchInEventsViaBytecode(): {
  ok: boolean; messages: string[]; events: BattleEvent[]; eventsCount: number;
} {
  clearBattleEventQueue();
  const gs = (globalThis as { __battleState?: { gBattlersCount?: number } }).__battleState;
  const battlersCount = gs?.gBattlersCount ?? 2;

  // Ordre de vitesse (le plus rapide d'abord) — 1:1 décomp insertion sort ll.3854-3862.
  const order: number[] = [];
  for (let i = 0; i < battlersCount; i++) order.push(i);
  for (let i = 0; i < order.length - 1; i++) {
    for (let j = i + 1; j < order.length; j++) {
      if (GetWhoStrikesFirst_static(order[i], order[j], true) !== 0) {
        const t = order[i]; order[i] = order[j]; order[j] = t;
      }
    }
  }

  const runWanted = (): void => {
    const ab = consumeAbilityWantedScript_static(); if (ab) _runScriptSync(ab);
    const it = consumeItemWantedScript_static();    if (it) _runScriptSync(it);
  };

  // 1:1 séquence TryDoEventsBeforeFirstTurn.
  AbilityBattleEffects_static(ABILITYEFFECT_SWITCH_IN_WEATHER, 0, 0, 0, 0); runWanted();
  for (const b of order) { AbilityBattleEffects_static(ABILITYEFFECT_ON_SWITCHIN, b, 0, 0, 0); runWanted(); }
  AbilityBattleEffects_static(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0); runWanted();
  AbilityBattleEffects_static(ABILITYEFFECT_TRACE, 0, 0, 0, 0); runWanted();
  for (const b of order) { ItemBattleEffects_static(ITEMEFFECT_ON_SWITCH_IN_static, b, false); runWanted(); }

  const drained = drainBattleEventsAsText();
  return { ok: true, messages: drained.messages, events: drained.events, eventsCount: drained.eventsCount };
}

export function runBattleTurnPassedViaBytecode(): {
  ok: boolean;
  phases: { phase: 'field' | 'battler' | 'wishperish' | 'special'; label: string }[];
  messages: string[];
  events: BattleEvent[];
  eventsCount: number;
  outcome: number;
  battleEnded: boolean;
} {
  // Imports lazy via __battleState pour mutations cross-modules.
  const gs = (globalThis as { __battleState?: {
    gBattleStruct?: { arenaTurnCounter: number };
    gBattlersCount?: number;
    gAbsentBattlerFlags?: number;
    gBattleCommunication?: number[];
    getBattleOutcome?: () => number;
    gBattleTypeFlags?: number;
  } }).__battleState;
  const phases: { phase: 'field' | 'battler' | 'wishperish' | 'special'; label: string }[] = [];

  // Step 1 : TurnValuesCleanUp(TRUE) — post-move quick cleanup.
  TurnValuesCleanUp(true);

  const outcomeAfterMoves = gs?.getBattleOutcome?.() ?? 0;

  // Step 2-3 : DoFieldEndTurnEffects + DoBattlerEndTurnEffects (= via runEndTurnEffectsViaBytecode).
  // Note : décomp `if (gBattleOutcome == 0)` gate ces 2 phases. Si outcome != 0
  // (= mon faint mid-turn), skip à HandleWishPerishSongOnTurnEnd.
  clearBattleEventQueue();

  if (outcomeAfterMoves === 0) {
    resetFieldEndTurnEffectsState();
    let safetyF = 0;
    let r = DoFieldEndTurnEffects();
    while (r && safetyF++ < 30) {
      phases.push({ phase: 'field', label: r.scriptLabel });
      _runScriptSync(r.scriptLabel);
      r = DoFieldEndTurnEffects();
    }

    resetBattlerEndTurnEffectsState();
    let safetyB = 0;
    let b = DoBattlerEndTurnEffects();
    while (b && safetyB++ < 100) {
      phases.push({ phase: 'battler', label: b.scriptLabel });
      _runScriptSync(b.scriptLabel);
      b = DoBattlerEndTurnEffects();
    }
  }

  // Step 4 : HandleFaintedMonActions — DEFERRED Phase 1.4+ (= partial port
  // handle-action.ts:460-470). Skip pour now (= caller handle faint via
  // battle-flow state machine).

  // Step 5 : HandleWishPerishSongOnTurnEnd loop.
  resetWishPerishSongState();
  let safetyW = 0;
  let w = HandleWishPerishSongOnTurnEnd();
  while (w && safetyW++ < 20) {
    phases.push({ phase: 'wishperish', label: w.scriptLabel });
    _runScriptSync(w.scriptLabel);
    w = HandleWishPerishSongOnTurnEnd();
  }

  // Step 6 : TurnValuesCleanUp(FALSE) — fresh turn cleanup.
  TurnValuesCleanUp(false);

  // Step 7-9 : reset markers + scripting + comm[0..4].
  // AUDIT BUG FIX : 4 HITMARKER constantes hardcoded fausses + ESM dual-instance
  // (= ancien `await import('./state')`) → import statique en tête de fichier
  // + valeurs correctes 1:1 battle.h:181-205.
  const HITMARKER_NO_ATTACKSTRING    = 1 << 9;
  const HITMARKER_UNABLE_TO_USE_MOVE = 1 << 19;
  const HITMARKER_PLAYER_FAINTED     = 1 << 22;
  const HITMARKER_PASSIVE_HP_UPDATE  = 1 << 20;
  const mask = ~(HITMARKER_NO_ATTACKSTRING | HITMARKER_UNABLE_TO_USE_MOVE
                 | HITMARKER_PLAYER_FAINTED | HITMARKER_PASSIVE_HP_UPDATE);
  setHitMarker(gHitMarker & mask);
  gBattleScripting.animTurn = 0;
  gBattleScripting.animTargetsHit = 0;
  gBattleScripting.moveendState = 0;
  setBattleMoveDamage(0);
  setMoveResultFlags(0);
  if (gs?.gBattleCommunication) {
    for (let i = 0; i < 5; i++) gs.gBattleCommunication[i] = 0;
  }

  // Step 10 : check outcome != 0.
  const outcomeAfterEndTurn = gs?.getBattleOutcome?.() ?? 0;
  if (outcomeAfterEndTurn !== 0) {
    const B_ACTION_FINISHED = 0xC;
    setCurrentActionFuncId(B_ACTION_FINISHED);
    const drained = drainBattleEventsAsText();
    return {
      ok: true, phases, outcome: outcomeAfterEndTurn, battleEnded: true,
      messages: drained.messages, events: drained.events, eventsCount: drained.eventsCount,
    };
  }

  // Step 11 : increment turn counters cap 0xFF.
  if (gBattleResults.battleTurnCounter < 0xFF) {
    gBattleResults.battleTurnCounter++;
    gBattleStruct.arenaTurnCounter++;
  }

  // Step 12 : reset chosen actions/moves.
  const battlersCount = gs?.gBattlersCount ?? 2;
  const B_ACTION_NONE = 0xFF;
  for (let i = 0; i < battlersCount; i++) {
    gChosenActionByBattler[i] = B_ACTION_NONE;
    gChosenMoveByBattler[i] = MOVE_NONE;
  }

  // Step 13 : reset gBattleStruct.monToSwitchIntoId.
  if (gBattleStruct.monToSwitchIntoId) {
    for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
      gBattleStruct.monToSwitchIntoId[i] = PARTY_SIZE;
    }
  }

  // Step 14 : save absent battler flags.
  gBattleStruct.absentBattlerFlags = gs?.gAbsentBattlerFlags ?? 0;

  // Step 15-16 : Palace/Arena special scripts.
  const tf = gs?.gBattleTypeFlags ?? 0;
  if (tf & BATTLE_TYPE_PALACE) {
    phases.push({ phase: 'special', label: 'BattleScript_PalacePrintFlavorText' });
    _runScriptSync('BattleScript_PalacePrintFlavorText');
  } else if ((tf & BATTLE_TYPE_ARENA) && gs?.gBattleStruct?.arenaTurnCounter === 0) {
    phases.push({ phase: 'special', label: 'BattleScript_ArenaTurnBeginning' });
    _runScriptSync('BattleScript_ArenaTurnBeginning');
  }

  // Drain events.
  const drained = drainBattleEventsAsText();
  return {
    ok: true, phases, outcome: 0, battleEnded: false,
    messages: drained.messages, events: drained.events, eventsCount: drained.eventsCount,
  };
}

// ─── Turn-start cleanup runner (Phase 1.4 L) ────────────────────────────────

/** 1:1 décomp `TurnValuesCleanUp(FALSE)` (battle_main.c:4857-4892).
 *  Caller (= battle-flow turn loop) appelle cette fonction au DEBUT de chaque
 *  fresh turn pour :
 *    - clear ProtectStruct entièrement (= protected/endured + 18 autres flags)
 *    - décrémenter isFirstTurn (= Speed Boost fire à partir turn 2)
 *    - décrémenter rechargeTimer + clear STATUS2_RECHARGE quand reach 0
 *      (= Hyper Beam / Giga Impact / Frenzy Plant / Blast Burn / Hydro Cannon
 *      recovery)
 *    - clear STATUS2_SUBSTITUTE quand substituteHP == 0
 *    - reset gSideTimers[0..1].followmeTimer
 *
 *  Note : `TurnValuesCleanUp(TRUE)` est appelé entre les moves dans le même turn
 *  pour reset juste `protected`/`endured` ; pour ce cas appeler la fonction
 *  directement via `util.ts`. */
export function runTurnStartCleanupViaBytecode(): void {
  TurnValuesCleanUp(false);
}

// ─── End-turn effects runner (Phase 1.4 L) ─────────────────────────────────

/** 1:1 décomp battle_util.c — chaîne complète end-of-turn :
 *  1. DoFieldEndTurnEffects (Reflect/LightScreen/Mist/Safeguard/Wish/Weather)
 *  2. DoBattlerEndTurnEffects (Ingrain/Leech Seed/Poison/Burn/Wrap/Nightmare/etc.)
 *  3. HandleWishPerishSongOnTurnEnd (FutureSight trigger/PerishSong countdown)
 *
 *  Pour chaque effect, exec le script bytecode synchronously via
 *  runBattleScript puis drain les messages. Caller (= battle-flow turn loop)
 *  call cette fonction APRÈS exec des 2 moves du turn.
 *
 *  Retourne `{ phases, messages, events }` pour debug/UI.
 *
 *  Note : safety bound à 30/100/20 iters par phase pour éviter infinite loops
 *  (= ne devrait jamais arriver, mais safety net). */
export function runEndTurnEffectsViaBytecode(): {
  ok: boolean;
  phases: { phase: 'field' | 'battler' | 'wishperish'; label: string }[];
  messages: string[];
  events: BattleEvent[];
  eventsCount: number;
} {
  // Clear queue avant chaque end-turn run.
  clearBattleEventQueue();
  const phases: { phase: 'field' | 'battler' | 'wishperish'; label: string }[] = [];

  // AUDIT BUG FIX : remplacement de l'ancien dynamic `await import('./end-turn-effects')`
  // par les statics imports en tête de fichier. Le dynamic import pouvait
  // créer une 2e instance ESM (= bug 7/8 session 141) → gBattleStruct accessed
  // par DoBattlerEndTurnEffects était une instance différente que celle exposée
  // sur __battleState, causant POISON case skip silencieux.

  // Phase 1 : field effects.
  resetFieldEndTurnEffectsState();
  let safetyF = 0;
  let r = DoFieldEndTurnEffects();
  while (r && safetyF++ < 30) {
    phases.push({ phase: 'field', label: r.scriptLabel });
    _runScriptSync(r.scriptLabel);
    r = DoFieldEndTurnEffects();
  }

  // Phase 2 : per-battler effects.
  resetBattlerEndTurnEffectsState();
  let safetyB = 0;
  let b = DoBattlerEndTurnEffects();
  while (b && safetyB++ < 100) {
    phases.push({ phase: 'battler', label: b.scriptLabel });
    _runScriptSync(b.scriptLabel);
    b = DoBattlerEndTurnEffects();
  }

  // Phase 3 : Wish/PerishSong/Arena.
  resetWishPerishSongState();
  let safetyW = 0;
  let w = HandleWishPerishSongOnTurnEnd();
  while (w && safetyW++ < 20) {
    phases.push({ phase: 'wishperish', label: w.scriptLabel });
    _runScriptSync(w.scriptLabel);
    w = HandleWishPerishSongOnTurnEnd();
  }

  // Drain events queue → messages FR.
  const drained = drainBattleEventsAsText();
  return {
    ok: true,
    phases,
    messages: drained.messages,
    events: drained.events,
    eventsCount: drained.eventsCount,
  };
}

/** Helper interne : run un script bytecode jusqu'à fin (= fastForward).
 *  Mirror de la logique runMoveScriptViaBytecode mais sans le sync HP/PP/Mons. */
function _runScriptSync(label: string): void {
  const ctx = setupBattleScriptContext(label);
  if (!ctx) return;
  let iters = 0;
  let paused = runBattleScript(ctx);
  iters++;
  let lastPtr = ctx.scriptPtr;
  let stuck = 0;
  while (paused && iters < 200 && ctx.scriptPtr >= 0) {
    paused = runBattleScript(ctx);
    iters++;
    if (ctx.scriptPtr === lastPtr) {
      stuck++;
      if (stuck > 5) break;
    } else {
      stuck = 0;
      lastPtr = ctx.scriptPtr;
    }
  }
}

// ─── Status1 sync helpers ──────────────────────────────────────────────

/** 1:1 décomp STATUS1_* bits → PokemonInstance.status string. Inverse de
 *  `_STATUS_TO_STATUS1` dans party-storage.ts. */
function _decodeStatus1(status1: number): 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX' | null {
  if (status1 === 0) return null;
  // SLEEP : bits 0-2 are the sleep counter, set if > 0.
  if (status1 & 0x07) return 'SLP';
  // TOXIC : bit 7 + bit 3 (= TOXIC_POISON | POISON). Check TOX first.
  if ((status1 & 0x80) && (status1 & 0x08)) return 'TOX';
  if (status1 & 0x08) return 'PSN';
  if (status1 & 0x10) return 'BRN';
  if (status1 & 0x20) return 'FRZ';
  if (status1 & 0x40) return 'PAR';
  return null;
}

/** Sync gBattleMons[X].status1 back to PokemonInstance.status. */
function _syncStatus1ToInstance(inst: PokemonInstance, status1: number): void {
  inst.status = _decodeStatus1(status1);
}

/** Sync gBattleMons[0]/[1] HP+status back vers les PokemonInstance actifs.
 *  Utile post `runBattleTurnPassedViaBytecode` / `runHandleFaintedMonActionsViaBytecode`
 *  qui mutent gBattleMons[i].hp via POISON/BURN/Wrap/Nightmare/etc. sans
 *  connaître la mapping PokemonInstance ↔ battlerId. Le caller (= battle-flow.ts)
 *  passe player + enemy (= battlerId 0 + 1 en single battle). */
export function syncBattleMonsHpToInstances(player: PokemonInstance, enemy: PokemonInstance): void {
  if (gBattleMons[0]) {
    player.currentHp = gBattleMons[0].hp;
    _syncStatus1ToInstance(player, gBattleMons[0].status1);
  }
  if (gBattleMons[1]) {
    enemy.currentHp = gBattleMons[1].hp;
    _syncStatus1ToInstance(enemy, gBattleMons[1].status1);
  }
}

/** Refresh gBattleMons[bid].hp + pp depuis le PokemonInstance (= même idiome
 *  que runMoveScriptViaBytecode:264-292). status1/statStages restent ceux de
 *  gBattleMons (autoritaires pendant le combat, set par le bytecode). */
function _refreshBattleMonFromInstance(bid: number, inst: PokemonInstance): void {
  if (!gBattleMons[bid]) return;
  gBattleMons[bid].hp = inst.currentHp;
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const m = inst.moves[i];
    if (m && gBattleMons[bid].pp[i] !== undefined) gBattleMons[bid].pp[i] = m.pp;
  }
}

/** 1:1 décomp `OpponentHandleChooseMove` (battle_controller_opponent.c:1551),
 *  branche single-battle. Remplace le MVP `pickOpponentMove` ("Tutorial AI is
 *  dumb / first damaging move") par le vrai comportement décomp :
 *
 *  - WILD (non TRAINER) : move ALÉATOIRE en sautant MOVE_NONE
 *    (= la branche `else { do { Random()%MAX_MON_MOVES } while NONE }`).
 *    Le "premier move offensif" du MVP était une DÉRIVE — ROM Émeraude
 *    choisit aléatoirement.
 *  - TRAINER : BattleAI_SetupAIData(ALL_MOVES_MASK) + BattleAI_ChooseMoveOrAction()
 *    (= scripts AI 1:1). FLEE/WATCH remontés au caller.
 *
 *  Retourne `{ action, index }`. index = slot move 0..3 ; -1 si indisponible
 *  (= le caller retombe sur son comportement legacy). Robuste : tout throw →
 *  index -1 (jamais de crash du combat). */
export function chooseOpponentMoveViaAI(opts: {
  opponent: PokemonInstance;
  player: PokemonInstance;
  opponentBattlerId?: number;
  playerBattlerId?: number;
  isTrainer?: boolean;
  trainerId?: number;
}): { action: 'move' | 'flee' | 'watch'; index: number } {
  try {
    const oppBId = opts.opponentBattlerId ?? 1;
    const pBId = opts.playerBattlerId ?? 0;

    const _slotEmpty = (i: number): boolean => {
      const m = opts.opponent.moves[i];
      return !m || !m.id;
    };

    // 1:1 décomp OpponentHandleChooseMove (battle_controller_opponent.c:1563) :
    // l'AI est lancée pour TRAINER | FIRST_BATTLE | SAFARI | ROAMER ; sinon (vrai
    // combat sauvage) = move aléatoire. Le tutorial Birch est FIRST_BATTLE (sauvage)
    // → DOIT exécuter l'AI (AI_SCRIPT_FIRST_BATTLE → script AI_FirstBattle : fuit si
    // les PV de la CIBLE AI = NOTRE mon ≤ 20% — if_hp_equal/less_than AI_TARGET 20).
    const tf = gBattleTypeFlags >>> 0;
    const aiDriven = opts.isTrainer
      || (tf & (BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_SAFARI | BATTLE_TYPE_ROAMER)) !== 0;

    if (!aiDriven) {
      // 1:1 décomp branche wild : move aléatoire, skip MOVE_NONE.
      let idx = 0;
      let tries = 0;
      do {
        idx = Random() % MAX_MON_MOVES;
        tries++;
      } while (_slotEmpty(idx) && tries < 256);
      if (_slotEmpty(idx)) return { action: 'move', index: -1 };
      return { action: 'move', index: idx };
    }

    // 1:1 décomp branche AI : nécessite le bytecode AI chargé (boot main.ts:170).
    if (!aiBytecodeLoaded()) return { action: 'move', index: -1 };

    _refreshBattleMonFromInstance(oppBId, opts.opponent);
    _refreshBattleMonFromInstance(pBId, opts.player);
    setActiveBattler(oppBId);
    setBattlerTarget(pBId);

    const prevTF = gBattleTypeFlags;
    // Dresseur réel → forcer TRAINER (BattleAI_SetupAIData lit gTrainers[id].aiFlags).
    // FIRST_BATTLE/SAFARI/ROAMER : leur flag est déjà dans gBattleTypeFlags et a
    // PRIORITÉ dans BattleAI_SetupAIData (checké AVANT le fallback trainer) → ne PAS
    // l'écraser, sinon on perdrait AI_SCRIPT_FIRST_BATTLE (→ le Zigzaton ne fuirait pas).
    if (opts.isTrainer) setBattleTypeFlags((prevTF | BATTLE_TYPE_TRAINER) >>> 0);
    if (opts.trainerId != null) setTrainerBattleOpponentA(opts.trainerId);

    BattleAI_SetupAIData(ALL_MOVES_MASK);
    const chosen = BattleAI_ChooseMoveOrAction();

    setBattleTypeFlags(prevTF); // restore (1:1 : flags non altérés hors AI setup)

    if (chosen === AI_CHOICE_FLEE) return { action: 'flee', index: -1 };
    if (chosen === AI_CHOICE_WATCH) return { action: 'watch', index: -1 };
    return { action: 'move', index: chosen };
  } catch (e) {
    console.warn('[ai] chooseOpponentMoveViaAI fallback:', e);
    return { action: 'move', index: -1 };
  }
}

/** Boot : charge le bytecode AI (= mirror loadBattleScriptBytecode). */
export async function ensureAiBytecodeLoaded(): Promise<void> {
  if (!aiBytecodeLoaded()) await loadAiScriptBytecode();
}

// Used to avoid unused-import warning.
void MOVE_RESULT_ONE_HIT_KO;
void MOVE_RESULT_FOE_ENDURED;
void MOVE_RESULT_FOE_HUNG_ON;
void _resolveMoveEffect;
void gBattleMoveDamage;

/**
 * battle/battle-controllers.ts — minimal stubs pour battle controllers async.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c` (~2300 lignes,
 *     les `BtlController_Emit*` fns + dispatch via gBattlerControllerFuncs[])
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c` (= helpers comme
 *     `MarkBattlerForControllerExec`, `PrepareStringBattle`)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/util.c:7` (= `gBitTable[]`)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle.h:9` (= MAX_BATTLERS_COUNT=4)
 *
 * Rationale : les opcodes Batch 04 (attackanimation/printstring/waitmessage/etc.)
 * appellent `BtlController_Emit*` puis `MarkBattlerForControllerExec`. Cela set
 * un bit dans `gBattleControllerExecFlags`. Les opcodes `waitanimation` et
 * `waitmessage` pause jusqu'à ce que le flag soit 0.
 *
 * Pour Phase 1 (= backing infrastructure pas wired au gameplay) :
 *   - `MarkBattlerForControllerExec` 1:1 décomp (set bit).
 *   - `BtlController_Emit*` = stubs vides (= aucune anim/text rendu).
 *   - `tickBattleControllers()` clear le flag (= simule les controllers finis
 *     instantané). Appelé entre les handler calls par runBattleScript loop.
 *
 * Quand on wirera ce battle interpreter au gameplay, ces stubs seront remplacés
 * par de vraies fonctions qui :
 *   1. Émettent les commandes UI au framework graphique (anim, text, fade, etc.)
 *   2. Le framework appelle un callback "controller done" qui clear le bit.
 *
 * Cf. session 134 dans `D:/Projet 1/pokemon-web-demo/memory/`.
 */

import {
  MAX_BATTLERS_COUNT,
  gBattleScripting,
  setBattleControllerExecFlags,
  gBattleControllerExecFlags,
  setActiveBattler,
  gActiveBattler,
  gBattlerAttacker,
  gBattlerTarget,
  gCurrentMove,
  gChosenMove,
  gBattleOutcome,
  gBattleStruct,
  gBattleWeather,
  gBattleMons,
  gPotentialItemEffectBattler,
  gLastUsedItem,
  gLastUsedAbility,
  type DisableStruct,
} from './state';
import { gBattleTextBuff1, gBattleTextBuff2, gBattleTextBuff3 } from './text-buffers';
import {
  CONTROLLER_PRINTSTRING,
  CONTROLLER_PRINTSTRINGPLAYERONLY,
  CONTROLLER_MOVEANIMATION,
  CONTROLLER_HEALTHBARUPDATE,
  CONTROLLER_HITANIMATION,
  CONTROLLER_FAINTANIMATION,
  CONTROLLER_STATUSICONUPDATE,
  CONTROLLER_STATUSANIMATION,
  CONTROLLER_BATTLEANIMATION,
  CONTROLLER_PLAYSE,
  CONTROLLER_PLAYFANFAREORBGM,
  CONTROLLER_FAINTINGCRY,
  CONTROLLER_RETURNMONTOBALL,
  CONTROLLER_SPRITEINVISIBILITY,
  CONTROLLER_SWITCHINANIM,
  CONTROLLER_DRAWPARTYSTATUSSUMMARY,
  CONTROLLER_HIDEPARTYSTATUSSUMMARY,
  CONTROLLER_TRAINERSLIDE,
  CONTROLLER_TRAINERSLIDEBACK,
  CONTROLLER_BALLTHROWANIM,
  CONTROLLER_EXPUPDATE,
  CONTROLLER_CHOOSEPOKEMON,
  CONTROLLER_LINKSTANDBYMSG,
  CONTROLLER_CANTSWITCH,
  CONTROLLER_UNKNOWNYESNOBOX,
  CONTROLLER_RESETACTIONMOVESELECTION,
  CONTROLLER_ENDLINKBATTLE,
  CONTROLLER_INTROSLIDE,
  CONTROLLER_INTROTRAINERBALLTHROW,
  CONTROLLER_DRAWTRAINERPIC,
  CONTROLLER_LOADMONSPRITE,
  enqueueBattleEvent,
  buildBattleMsgDataSnapshot,
  type BattleMsgData,
} from './battle-event-queue';
import { resolveDecompConstant } from '../system/decomp-constants';
import type { BattleScriptContext } from './script-interpreter';
import {
  PrepareBufferDataTransfer, sBattleBuffersTransferData, B_COMM_TO_CONTROLLER,
} from './battle-controllers-ipc';

// ─── Helper : snapshot BattleMsgData for PrintString events ─────────────────

/** Build BattleMsgData snapshot 1:1 décomp battle_controllers.c:1147-1166.
 *  Capture gBattleTextBuff1/2/3 + abilities + state vars current. */
function _snapshotMsgData(): BattleMsgData {
  // Resolve gCurrentMove.type via gBattleMoves[gCurrentMove].type.
  let moveType = 0;
  try {
    const moves = (globalThis as { __battle_moves?: Array<{ type: number }> }).__battle_moves;
    if (moves && moves[gCurrentMove]) moveType = moves[gCurrentMove].type;
  } catch { /* fallthrough */ }
  return buildBattleMsgDataSnapshot({
    gCurrentMove,
    gChosenMove,
    gLastUsedItem,
    gLastUsedAbility,
    gBattleScripting: { battler: gBattleScripting.battler },
    gBattlerAttacker,
    gBattlerTarget,
    gBattleStruct: {
      scriptPartyIdx: gBattleStruct.scriptPartyIdx ?? 0,
      hpScale: gBattleStruct.hpScale ?? 0,
    },
    gPotentialItemEffectBattler,
    gBattleMoveType: moveType,
    gBattleMons,
    gBattleTextBuff1,
    gBattleTextBuff2,
    gBattleTextBuff3,
    maxBattlersCount: MAX_BATTLERS_COUNT,
  });
}

// Suppress unused-import warning si certains symboles ne sont pas utilisés
// (= placeholder for future Phase 1.4 events).
void resolveDecompConstant;

// ─── gBitTable[] (util.c:7) — 1:1 décomp ─────────────────────────────────────
// `const u32 gBitTable[] = { 1<<0, 1<<1, ..., 1<<31 }`. Indexé par battler id.
export const gBitTable: number[] = (() => {
  const t = new Array(32);
  for (let i = 0; i < 32; i++) t[i] = 1 << i;
  return t;
})();

// ─── Controller exec flags helpers ──────────────────────────────────────────

/** 1:1 décomp `MarkBattlerForControllerExec(battlerId)` (battle_util.c).
 *  Set bit `battlerId` dans gBattleControllerExecFlags. (Link battle shift
 *  par 28 — pas implémenté ici, gameplay offline only). */
export function MarkBattlerForControllerExec(battlerId: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags | gBitTable[battlerId]);
}

/** Clear exec flag pour battler donné (= controller signal "I'm done").
 *  Pas une fonction 1:1 décomp en soi (= dans le décomp c'est implicit par le
 *  controller qui termine son state machine), mais nécessaire pour le wire
 *  futur. Appelé par tickBattleControllers (= Phase 1 stub clear immédiat). */
export function clearBattlerExecFlag(battlerId: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[battlerId]);
}

/** Tick (= clear all exec flags) pour simuler les controllers finis instantané.
 *  Phase 1.4 : remplacer par real per-controller tick une fois wired au framework
 *  UI. Pour Phase 1, clear tout = scripts s'avancent sans wait.
 *
 *  Reset aussi `gBattleCommunication[MSG_DISPLAY]` (= 0) car le décomp utilise
 *  cette flag pour signaler "text print en cours". Sans wire UI text, on
 *  simule "fini instantanément" en clearing ici. Sinon `Cmd_waitmessage`
 *  loop infiniment (= 497/639 scripts stuck post wire avant fix).
 *
 *  Note : MSG_DISPLAY = 0 (= constant in battle.h:84). On utilise direct
 *  index pour éviter circular imports. */
export function tickBattleControllers(): void {
  setBattleControllerExecFlags(0);
  // 1:1 décomp simulate "text print done" instantané.
  // MSG_DISPLAY = 7 (= constants.ts:458 from battle.h).
  const bs = (globalThis as { __battleState?: { gBattleCommunication?: number[] } })
    .__battleState;
  if (bs?.gBattleCommunication) {
    bs.gBattleCommunication[7] = 0;  // MSG_DISPLAY = 7.
  }
}

// ─── BtlController_Emit* stubs ──────────────────────────────────────────────

/** Helper voie L (décomp) : flush `bytes` dans gBattleBufferA[active] via
 *  PrepareBufferDataTransfer (= 1:1 : chaque BtlController_EmitXxx écrit
 *  sBattleBuffersTransferData[] puis flush). INDISPENSABLE : sans ça,
 *  Player/OpponentBufferRunCommand relit un VIEUX opcode dans bufferA[0] et
 *  dispatch le mauvais handler (ou ne clear jamais le flag → blocage du tour). */
function _emitToBufferA(bufferId: number, bytes: number[]): void {
  for (let i = 0; i < bytes.length; i++) sBattleBuffersTransferData[i] = bytes[i] & 0xFF;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, bytes.length);
}

/** 1:1 décomp `BtlController_EmitMoveAnimation` (battle_controllers.c:1107-1135).
 *  Écrit bufferA (voie L) + enqueue event (compat voie V). Le disableStruct
 *  memcpy [16..] du décomp est différé (= le handler MoveAnimation clear immédiat,
 *  anim sprite = chantier A/B). */
export function BtlController_EmitMoveAnimation(
  bufferId: number,
  move: number,
  turnOfMove: number,
  movePower: number,
  dmg: number,
  friendship: number,
  disableStructPtr: DisableStruct,
  multihit: number,
): void {
  _emitToBufferA(bufferId, [
    CONTROLLER_MOVEANIMATION,
    move & 0xFF, (move >> 8) & 0xFF,
    turnOfMove & 0xFF,
    movePower & 0xFF, (movePower >> 8) & 0xFF,
    dmg & 0xFF, (dmg >> 8) & 0xFF, (dmg >> 16) & 0xFF, (dmg >>> 24) & 0xFF,
    friendship & 0xFF,
    multihit & 0xFF,
    gBattleWeather & 0xFF, (gBattleWeather >> 8) & 0xFF,
    0, 0,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_MOVEANIMATION,
    battler: gActiveBattler,
    move, turnOfMove, movePower, dmg, friendship, multihit,
    weather: gBattleWeather,
    disableStruct: { ...disableStructPtr },
  });
}

/** 1:1 signature décomp `BtlController_EmitPrintString` (battle_controllers.c:1137-1167).
 *  Source utilisé par `PrepareStringBattle`. Enqueue PrintString event avec
 *  snapshot complet du BattleMsgData (= 1:1 décomp build). */
export function BtlController_EmitPrintString(bufferId: number, stringId: number): void {
  // 1:1 décomp battle_controllers.c:1142-1166 : écrit gBattleBufferA[active] =
  // [CONTROLLER_PRINTSTRING, gBattleOutcome, stringId lo, stringId hi, ...msgData].
  // (voie L) PlayerBufferRunCommand lit bufferA[0] → PlayerHandlePrintString, qui
  // relit stringId via bufferA[2]|bufferA[3]<<8. Le BattleMsgData [4..] du décomp
  // est reconstruit côté handler via le snapshot globalThis, donc 4 bytes suffisent.
  sBattleBuffersTransferData[0] = CONTROLLER_PRINTSTRING;
  sBattleBuffersTransferData[1] = gBattleOutcome & 0xFF;
  sBattleBuffersTransferData[2] = stringId & 0xFF;
  sBattleBuffersTransferData[3] = (stringId & 0xFF00) >> 8;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, 4);

  // 1:1 décomp (battle_controllers.c:1148-1166) : le BattleMsgData (battlerAttacker/
  // Target/Effect/scrActive/textBuffs/currentMove...) est SÉRIALISÉ dans bufferA[4..]
  // À L'ÉMISSION (= figé). Le handler (PlayerHandlePrintString) lit CE snapshot, PAS
  // un nouveau. CRITIQUE : sans ça, le handler re-snapshote PLUS TARD (quand le
  // controller traite la commande) → gBattlerAttacker/Target ont déjà changé (move
  // suivant / fin de tour) → le NOM dans le message pointe le mauvais Pokémon
  // (ex "ARCKO est déjà paralysé" au lieu de "WAILMER"). On fige le snapshot ici.
  // 1:1 décomp : le snapshot est sérialisé dans gBattleBufferA[active] (PAR BATTLER).
  // On le stocke donc par gActiveBattler — un slot global serait écrasé par le
  // printstring d'un AUTRE battler émis avant que celui-ci soit affiché (= le bug
  // "ARCKO déjà paralysé" : le message d'ARCKO était écrasé par le SPLASH de Wailmer).
  const snap = _snapshotMsgData();
  _printStringMsgDataByBattler[gActiveBattler] = snap;

  // Compat voie V (battle-flow.ts drain) : enqueue aussi l'event. La voie L ne
  // draine pas cette queue (= 0 régression V, 0 double-affichage L car battle-flow
  // est inerte flag-ON).
  enqueueBattleEvent({
    type: CONTROLLER_PRINTSTRING,
    battler: gActiveBattler,
    outcome: gBattleOutcome,
    stringId,
    msgData: snap,
  });
}

/** Snapshot BattleMsgData FIGÉ au dernier EmitPrintString, PAR BATTLER (1:1 décomp =
 *  msgData sérialisé dans bufferA[active][4..] à l'émission). Le handler du battler
 *  `b` l'utilise au lieu de re-snapshoter (qui capturerait des battlers déjà changés,
 *  ou d'un autre move). Indexé par battler pour ne pas être écrasé entre battlers. */
const _printStringMsgDataByBattler: (BattleMsgData | null)[] = [null, null, null, null];
export function getLastPrintStringMsgData(battler?: number): BattleMsgData | null {
  const b = typeof battler === 'number' ? battler : gActiveBattler;
  return _printStringMsgDataByBattler[b] ?? null;
}

/** 1:1 signature décomp `BtlController_EmitPlaySE(bufferId, songId)`
 *  (battle_controllers.c). Enqueue PlaySE event ; battle-flow consume +
 *  appelle audio engine. */
export function BtlController_EmitPlaySE(bufferId: number, songId: number): void {
  // 1:1 décomp battle_controllers.c : [PLAYSE, songId lo, songId hi, 0].
  _emitToBufferA(bufferId, [CONTROLLER_PLAYSE, songId & 0xFF, (songId >> 8) & 0xFF, 0]);
  enqueueBattleEvent({
    type: CONTROLLER_PLAYSE,
    battler: gActiveBattler,
    songId,
  });
}

/** 1:1 signature décomp `BtlController_EmitPlayFanfareOrBGM(buf, songId, isBGM)`
 *  (battle_controllers.c). */
export function BtlController_EmitPlayFanfareOrBGM(_bufferId: number, songId: number, isBGM: boolean): void {
  enqueueBattleEvent({
    type: CONTROLLER_PLAYFANFAREORBGM,
    battler: gActiveBattler,
    songId,
    isBGM,
  });
}

/** 1:1 signature décomp `BtlController_EmitFaintingCry(buf)`. */
export function BtlController_EmitFaintingCry(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_FAINTINGCRY,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitHitAnimation(buf)`. */
export function BtlController_EmitHitAnimation(bufferId: number): void {
  // 1:1 décomp battle_controllers.c : les 4 bytes = CONTROLLER_HITANIMATION.
  _emitToBufferA(bufferId, [CONTROLLER_HITANIMATION, CONTROLLER_HITANIMATION, CONTROLLER_HITANIMATION, CONTROLLER_HITANIMATION]);
  enqueueBattleEvent({
    type: CONTROLLER_HITANIMATION,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitFaintAnimation(buf)`. */
export function BtlController_EmitFaintAnimation(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_FAINTANIMATION,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitReturnMonToBall(buf, doFadeOut)`. */
export function BtlController_EmitReturnMonToBall(_bufferId: number, doFadeOut: boolean): void {
  enqueueBattleEvent({
    type: CONTROLLER_RETURNMONTOBALL,
    battler: gActiveBattler,
    doFadeOut,
  });
}

/** 1:1 signature décomp `BtlController_EmitSpriteInvisibility(buf, isInvisible)`. */
export function BtlController_EmitSpriteInvisibility(_bufferId: number, isInvisible: boolean): void {
  enqueueBattleEvent({
    type: CONTROLLER_SPRITEINVISIBILITY,
    battler: gActiveBattler,
    isInvisible,
  });
}

/** 1:1 signature décomp `BtlController_EmitSetMonData(buf, requestId, monIdx,
 *  bytes, data)` (battle_controllers.c).
 *
 *  Le décomp utilise un buffer link/inter-cpu : le caller a déjà write
 *  gBattleMons[gActiveBattler].X, puis cet emit notifie le controller-side
 *  pour persist le change au party-side (= gPlayerParty/gEnemyParty Pokemon
 *  struct via SetMonData).
 *
 *  Notre port : flush direct via SetMonData sur le party slot correspondant.
 *  Couvre les cas usuels en battle : HP, status, PP, held item, level, exp.
 *
 *  Note importante : monIdx est typiquement 0 (= "current battler") ou un
 *  bitmask (= sur Emit de plusieurs mons). Pour single mon, on flush via
 *  gActiveBattler. Pour bitmask, on itère. */
export function BtlController_EmitSetMonData(
  _bufferId: number, requestId: number, monToCheck: number, _bytes: number, data: unknown,
): void {
  // Lazy import pour éviter circular deps via party-storage → state.
  // 1:1 décomp : monToCheck (bitmask, 0 = mon actif) propagé pour le multi-mon (Heal Bell).
  const ps = (globalThis as { __batPSetMonByActive?: (req: number, data: unknown, monToCheck?: number) => void })
    .__batPSetMonByActive;
  if (ps) ps(requestId, data, monToCheck);
}

/** 1:1 signature décomp `BtlController_EmitPrintSelectionString(buf, stringId)`
 *  (battle_controllers.c:1169-1199). Enqueue PrintStringPlayerOnly event. */
export function BtlController_EmitPrintSelectionString(_bufferId: number, stringId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_PRINTSTRINGPLAYERONLY,
    battler: gActiveBattler,
    stringId,
    msgData: _snapshotMsgData(),
  });
}

/** 1:1 signature décomp `BtlController_EmitEndLinkBattle(buf, outcome)`. */
export function BtlController_EmitEndLinkBattle(_bufferId: number, outcome: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_ENDLINKBATTLE,
    battler: gActiveBattler,
    outcome,
  });
}

/** 1:1 signature décomp `BtlController_EmitBattleAnimation(buf, anim, arg)`. */
export function BtlController_EmitBattleAnimation(_bufferId: number, animationId: number, argument: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_BATTLEANIMATION,
    battler: gActiveBattler,
    animationId,
    argument,
  });
}

/** 1:1 signature décomp `BtlController_EmitStatusIconUpdate(buf, status1, status2)`. */
export function BtlController_EmitStatusIconUpdate(_bufferId: number, status1: number, status2: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_STATUSICONUPDATE,
    battler: gActiveBattler,
    status1, status2,
  });
}

/** 1:1 signature décomp `BtlController_EmitHealthBarUpdate(buf, healthValue)`. */
export function BtlController_EmitHealthBarUpdate(bufferId: number, healthValue: number): void {
  // 1:1 décomp battle_controllers.c : [HEALTHBARUPDATE, 0, hp lo, hp hi].
  // PlayerHandleHealthBarUpdate relit hpVal via bufferA[2]|bufferA[3]<<8.
  _emitToBufferA(bufferId, [CONTROLLER_HEALTHBARUPDATE, 0, healthValue & 0xFF, (healthValue >> 8) & 0xFF]);
  enqueueBattleEvent({
    type: CONTROLLER_HEALTHBARUPDATE,
    battler: gActiveBattler,
    healthValue,
  });
}

/** 1:1 signature décomp `BtlController_EmitStatusAnimation(buf, status2anim, status)`.
 *  status2anim = TRUE pour STATUS2_*, FALSE pour STATUS1_*. */
export function BtlController_EmitStatusAnimation(_bufferId: number, isStatus2: boolean, status: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_STATUSANIMATION,
    battler: gActiveBattler,
    isStatus2, status,
  });
}

/** 1:1 signature décomp `BtlController_EmitDrawPartyStatusSummary(buf, hpStatuses, isBattleStart)`. */
export function BtlController_EmitDrawPartyStatusSummary(_bufferId: number, hpStatuses: unknown, arg2: number): void {
  // hpStatuses 1:1 décomp = struct HpAndStatus per mon (= [species, hp, status1] tuples).
  // Notre port : accepte n'importe quelle structure, le UI consumer fera le decode.
  enqueueBattleEvent({
    type: CONTROLLER_DRAWPARTYSTATUSSUMMARY,
    battler: gActiveBattler,
    hpStatuses: Array.isArray(hpStatuses) ? (hpStatuses as number[]) : [],
    arg2,
  });
}

/** 1:1 signature décomp `BtlController_EmitHidePartyStatusSummary(buf)`. */
export function BtlController_EmitHidePartyStatusSummary(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_HIDEPARTYSTATUSSUMMARY,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitTrainerSlideBack(buf)`. */
export function BtlController_EmitTrainerSlideBack(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_TRAINERSLIDEBACK,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitTrainerSlide(buf)` (= slide in). */
export function BtlController_EmitTrainerSlide(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_TRAINERSLIDE,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitIntroSlide(buf, terrainId)`
 *  (battle_controllers.c:1141-1146). Démarre l'animation slide-in du
 *  background battle (= WIN0V split central). Enqueue event pour
 *  battle-intro.ts consume. */
export function BtlController_EmitIntroSlide(_bufferId: number, terrainId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_INTROSLIDE as never,
    battler: gActiveBattler,
    terrainId,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitIntroTrainerBallThrow(buf)`
 *  (battle_controllers.c:1148-1153). Lance le ball throw animation du
 *  trainer (= player ou opponent) suivi de l'emerge du Pokemon. Enqueue
 *  event pour battle-ball-throw.ts + sprite emerge consume. */
export function BtlController_EmitIntroTrainerBallThrow(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_INTROTRAINERBALLTHROW as never,
    battler: gActiveBattler,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitDrawTrainerPic(buf)`
 *  (battle_controllers.c:986-990). Charge + display le sprite trainer
 *  (= player back ou opponent face). Enqueue event pour battle UI consume. */
export function BtlController_EmitDrawTrainerPic(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_DRAWTRAINERPIC as never,
    battler: gActiveBattler,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitLoadMonSprite(buf)`
 *  (battle_controllers.c:973-977). Charge le sprite du Pokemon (= wild ou
 *  opp send-out). Enqueue event pour battle UI consume. */
export function BtlController_EmitLoadMonSprite(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:973-977 : 4 bytes [LOADMONSPRITE, LOADMONSPRITE,
  // 0, 0] → gBattleBufferA. SANS ça, OpponentBufferRunCommand lit bufferA[0] résiduel
  // et NE dispatche PAS OpponentHandleLoadMonSprite (= le sprite mon ne se chargeait
  // jamais). Même pattern que les autres Emit fixés (EmitChoosePokemon session 5ter).
  _emitToBufferA(bufferId, [CONTROLLER_LOADMONSPRITE, CONTROLLER_LOADMONSPRITE, 0, 0]);
  enqueueBattleEvent({
    type: CONTROLLER_LOADMONSPRITE as never,
    battler: gActiveBattler,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitBallThrowAnim(buf, caseId)`
 *  (battle_controllers.c:1089-1094). caseId :
 *  0 = BALL_NO_SHAKES, 1..3 = BALL_*_SHAKES_FAIL, 4 = BALL_3_SHAKES_SUCCESS,
 *  5 = BALL_TRAINER_BLOCK, 6 = BALL_WALLY_SUCCESS_HACK. */
export function BtlController_EmitBallThrowAnim(_bufferId: number, caseId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_BALLTHROWANIM,
    battler: gActiveBattler,
    caseId,
  });
}

/** 1:1 signature décomp `BtlController_EmitExpUpdate(buf, partyId, expPoints)`
 *  (battle_controllers.c:1275-1281). */
export function BtlController_EmitExpUpdate(_bufferId: number, partyId: number, expPoints: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_EXPUPDATE,
    battler: gActiveBattler,
    partyId, expPoints,
  });
}

/** 1:1 signature décomp `BtlController_EmitChoosePokemon(buf, caseId,
 *  monToSwitchIntoId_partner, ability, partyOrder)`. */
export function BtlController_EmitChoosePokemon(
  bufferId: number, caseId: number, monToSwitchIntoId: number, ability: number,
  partyOrder: number | readonly number[],
): void {
  // Voie L (1:1 décomp battle_controllers.c) : écrire gBattleBufferA[active] (7 bytes) —
  // OpponentBufferRunCommand/PlayerBufferRunCommand lisent bufferA[0]=opcode pour
  // dispatcher le handler. SANS ça, le controller ne dispatchait JAMAIS ChoosePokemon
  // (il ne faisait qu'enqueue l'event voie V) → switch-in dresseur cassé (le mon suivant
  // n'entrait jamais → freeze multi-mon). bufferA[0]=opcode,[1]=caseId,[2]=monToSwitch,
  // [3]=ability,[4..6]=partyOrder.
  const order: readonly number[] = typeof partyOrder === 'number' ? [partyOrder, 0, 0] : partyOrder;
  _emitToBufferA(bufferId, [
    CONTROLLER_CHOOSEPOKEMON, caseId & 0xFF, monToSwitchIntoId & 0xFF, ability & 0xFF,
    order[0] ?? 0, order[1] ?? 0, order[2] ?? 0,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_CHOOSEPOKEMON,
    battler: gActiveBattler,
    caseId, monToSwitchIntoId, ability, partyOrder,
  });
}

/** 1:1 signature décomp `BtlController_EmitLinkStandbyMsg(buf, mode, frame)`. */
export function BtlController_EmitLinkStandbyMsg(_bufferId: number, mode: number, frame: boolean): void {
  enqueueBattleEvent({
    type: CONTROLLER_LINKSTANDBYMSG,
    battler: gActiveBattler,
    mode, frame,
  });
}

/** 1:1 signature décomp `BtlController_EmitCantSwitch(buf)`. */
export function BtlController_EmitCantSwitch(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_CANTSWITCH,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitYesNoBox(buf)`. */
export function BtlController_EmitYesNoBox(_bufferId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_UNKNOWNYESNOBOX,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitSwitchInAnim(buf, partyId, dontClear)`. */
export function BtlController_EmitSwitchInAnim(_bufferId: number, partyId: number, dontClear: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_SWITCHINANIM,
    battler: gActiveBattler,
    partyId, dontClear,
  });
}

/** 1:1 signature décomp `BtlController_EmitGetMonData(buf, requestId, monBitFlags)`. */
export function BtlController_EmitGetMonData(_bufferId: number, _requestId: number, _monBitFlags: number): void {
  // Phase 1.4 UI : read mon data via controller. Notre port lit directement
  // gBattleMons donc cet émitter est no-op (= équivalent côté queue : pas d'event UI).
}

/** 1:1 signature décomp `BtlController_EmitResetActionMoveSelection(buf, caseId)`. */
export function BtlController_EmitResetActionMoveSelection(_bufferId: number, caseId: number): void {
  enqueueBattleEvent({
    type: CONTROLLER_RESETACTIONMOVESELECTION,
    battler: gActiveBattler,
    caseId,
  });
}

/** 1:1 signature décomp `BtlController_EmitYesNoBox` n'existe pas — yesnobox
 *  est implémenté direct par Cmd_yesnobox via le state machine
 *  gBattleCommunication[0]. */

// ─── PrepareStringBattle (battle_util.c) — 1:1 décomp ──────────────────────

/** 1:1 décomp `PrepareStringBattle` (battle_util.c). */
export function PrepareStringBattle(stringId: number, battler: number): void {
  setActiveBattler(battler);
  BtlController_EmitPrintString(0 /* B_COMM_TO_CONTROLLER */, stringId);
  MarkBattlerForControllerExec(battler);
}

// ─── BattleScript stack helpers (battle_util.c) — 1:1 décomp ───────────────

/** 1:1 décomp `BattleScriptPush(bsPtr)` (battle_util.c). Push offset dans le
 *  bytecode au stack de retour. Le décomp utilise gBattleResources->...->ptr[]
 *  mais notre port mappe ça au ctx.scriptPtrStack du runtime. */
export function BattleScriptPush(ctx: BattleScriptContext, bsPtr: number): void {
  ctx.scriptPtrStack.push(bsPtr);
}

/** 1:1 décomp `BattleScriptPop()` (battle_util.c). Pop offset retour stack. */
export function BattleScriptPop(ctx: BattleScriptContext): number {
  const v = ctx.scriptPtrStack.pop();
  return v === undefined ? -1 : v;
}

// ─── UI/Input stubs ─────────────────────────────────────────────────────────

/** 1:1 signature décomp `HandleBattleWindow(xStart, yStart, xEnd, yEnd, flags)`.
 *  Décomp construit/clear un rect window dans BG tilemap. Phase 1 stub : no-op. */
export function HandleBattleWindow(
  _xStart: number, _yStart: number, _xEnd: number, _yEnd: number, _flags: number,
): void {
  // Phase 1.4 UI : draw/clear window au framework UI.
}

/** 1:1 signature décomp `BattlePutTextOnWindow(text, windowId)`
 *  (battle_message.c:1957-1961). R2 wire : delegate au battle-flow.ts
 *  printText(windowId, text) si __activeBattleFlow exposé (= combat actif).
 *  Sinon fallback : store dans __battleDisplayedText pour scene pickup futur.
 *  Maintient aussi le __textPrinterState pour CompleteOnInactiveTextPrinter2. */
export function BattlePutTextOnWindow(text: number | string, windowId: number): void {
  const g = globalThis as Record<string, unknown>;
  const txt = typeof text === 'string' ? text : String(text);

  // R2 : delegate au battle-flow rendering réel si combat actif.
  const flow = (g.__activeBattleFlow as { printText?: (winId: number, t: string) => void } | undefined);
  if (flow?.printText) {
    flow.printText(windowId, txt);
  }

  // Stash aussi dans __battleDisplayedText (= debug + scene pickup futur).
  if (!g.__battleDisplayedText) g.__battleDisplayedText = {};
  if (!g.__textPrinterState) g.__textPrinterState = {};
  if (!g.__textPrinterTimers) g.__textPrinterTimers = {};
  (g.__battleDisplayedText as Record<number, string | number>)[windowId] = text;
  const timers = g.__textPrinterTimers as Record<number, number>;
  if (timers[windowId]) { clearTimeout(timers[windowId]); delete timers[windowId]; }
  // Flag de TEST `__battleTextInstant` (inerte sans le flag) : marque le texte
  // TERMINÉ *synchroniquement* (pas de setTimeout) → un harness SYNC ne reste pas
  // bloqué sur les pollers de texte (CompleteOnInactiveTextPrinter*), qui lisent
  // __textPrinterState. Ne touche pas le pacing 1:1 normal (branche else).
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    (g.__textPrinterState as Record<number, boolean>)[windowId] = false;
    return;
  }
  (g.__textPrinterState as Record<number, boolean>)[windowId] = true;
  // Simulate typewriter : ~length * 2 frames + 60 frame pause for read.
  const frames = Math.max(60, txt.length * 2 + 60);
  timers[windowId] = (setTimeout(() => {
    (g.__textPrinterState as Record<number, boolean>)[windowId] = false;
    delete timers[windowId];
  }, frames * (1000 / 60)) as unknown) as number;
}

/** 1:1 signature décomp `BattleCreateYesNoCursorAt(cursorPosition)`. Phase 1 stub. */
export function BattleCreateYesNoCursorAt(_cursorPosition: number): void {
  // Phase 1.4 UI : draw yes/no cursor sprite.
}

/** 1:1 signature décomp `BattleDestroyYesNoCursorAt(cursorPosition)`. Phase 1 stub. */
export function BattleDestroyYesNoCursorAt(_cursorPosition: number): void {
  // Phase 1.4 UI : remove yes/no cursor sprite.
}

/** 1:1 signature décomp `PlaySE(seId)`. Phase 1 stub (= SE channel not wired). */
export function PlaySE(_seId: number): void {
  // Phase 1.4 UI : trigger SE via audio engine.
}

/** 1:1 signature décomp `JOY_NEW(button)` (= include/global.h:134 macro
 *  `TEST_BUTTON(gMain.newKeys, button)`). Returns truthy si `button` mask
 *  intersecte newKeys ce frame. Wired vers `getRuntime().gMain.newKeys`
 *  via lazy lookup pour éviter cycle ESM avec decomp-globals. */
export function JOY_NEW(button: number): number {
  const rt = _getRuntimeLazy();
  return rt ? (rt.gMain.newKeys & button) : 0;
}

/** 1:1 signature décomp `JOY_REPEAT(button)` (= include/global.h:137 macro
 *  `TEST_BUTTON(gMain.newAndRepeatedKeys, button)`). */
export function JOY_REPEAT(button: number): number {
  const rt = _getRuntimeLazy();
  return rt ? (rt.gMain.newAndRepeatedKeys & button) : 0;
}

/** 1:1 signature décomp `JOY_HELD(button)` (= include/global.h:131 macro
 *  `TEST_BUTTON(gMain.heldKeys, button)`). */
export function JOY_HELD(button: number): number {
  const rt = _getRuntimeLazy();
  return rt ? (rt.gMain.heldKeys & button) : 0;
}

/** Lazy lookup runtime via globalThis.__rt (exposé par decomp-globals
 *  ligne ~109). Évite cycle ESM avec decomp-globals → gba-global-scope. */
type _RtShape = { gMain: { newKeys: number; newAndRepeatedKeys: number; heldKeys: number } };
function _getRuntimeLazy(): _RtShape | null {
  const g = globalThis as { __rt?: unknown };
  const r = g.__rt as _RtShape | undefined;
  if (r && r.gMain) return r;
  return null;
}

// ─── Button constants (io_reg.h) — 1:1 décomp ──────────────────────────────
export const A_BUTTON      = 1 << 0;
export const B_BUTTON      = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const START_BUTTON  = 1 << 3;
export const DPAD_RIGHT    = 1 << 4;
export const DPAD_LEFT     = 1 << 5;
export const DPAD_UP       = 1 << 6;
export const DPAD_DOWN     = 1 << 7;
export const R_BUTTON      = 1 << 8;
export const L_BUTTON      = 1 << 9;

/** 1:1 décomp `DPAD_ANY` (gba/io_reg.h:713) = OR de DPAD_LEFT/RIGHT/UP/DOWN. */
export const DPAD_ANY      = DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN;

// ─── SE_* constants (constants/songs.h) — subset utilisé Batch 04 ──────────
export const SE_SELECT = 5; // 1:1 décomp constants/songs.h

// ─── Sanity check : MAX_BATTLERS_COUNT match ────────────────────────────────
if (MAX_BATTLERS_COUNT !== 4) {
  // Sanity check — gBitTable est indexé par battler id, jamais > 3.
  console.warn('[battle/battle-controllers] MAX_BATTLERS_COUNT mismatch:', MAX_BATTLERS_COUNT);
}

// gBattleScripting est ré-exporté pour les opcodes qui en ont besoin sans
// recharger le module state.
export { gBattleScripting };

// Expose pour battle-controller-player lazy lookup (= éviter cycle ESM).
(globalThis as { __battleControllers?: object }).__battleControllers = {
  snapshotMsgData: _snapshotMsgData,
  getLastPrintStringMsgData,
};

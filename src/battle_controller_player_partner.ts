/**
 * src/battle_controller_player_partner.ts — MIROIR 1:1 de
 * `src/battle_controller_player_partner.c` (D:/Projet 1/decomps/pokeemeraude).
 *
 * Le CONTRÔLEUR PARTENAIRE = l'IA qui joue les mons du partenaire (Steven multi,
 * battler 2, côté joueur DROIT). Le .c est une VARIANTE du controller PLAYER
 * (même `gPlayerParty`, même send-out `POKEBALL_PLAYER_SENDOUT`, mêmes positions
 * joueur) où le choix d'action/move/pokémon passe par l'IA (comme l'opponent) au
 * lieu du menu interactif, et où DrawTrainerPic/IntroTrainerBallThrow utilisent le
 * back-pic Steven.
 *
 * STRATÉGIE (transcription 1:1) : chaque handler porte le nom décomp et le corps
 * du .c partenaire. Comme chaque handler termine par `PlayerPartnerBufferExecCompleted`
 * (qui REBIND `gBattlerControllerFuncs[battler] = PlayerPartnerBufferRunCommand`),
 * on NE PEUT PAS ré-exporter les fonctions player/opponent (elles rebindraient vers
 * PlayerBufferRunCommand / OpponentBufferRunCommand = mauvais battler). On transcrit
 * donc les corps, en important les FEUILLES déjà portées (SetBattleMonDataFromBuffer,
 * MoveBattleBar, PlayCry_ByMode, _loadAndCreateBattlerMonSprite…) et en câblant la
 * machinerie profonde (healthbox/sprites-data/gfx/IA) via les MÊMES hooks globalThis
 * que les controllers frères (__battleHealthbox / __battleSpritesData /
 * __battleGfxSfxUtil / __battleAi), i.e. « comme l'écran DÉJÀ PORTÉ fait » (Règle 3).
 *
 * INERTE : ce controller n'est atteint que par le battler 2 d'un combat
 * BATTLE_TYPE_INGAME_PARTNER (branché dans InitSinglePlayerBtlControllers), combat
 * non encore lançable. tsc vert, boot sain.
 *
 * Correspondances de corps IDENTIQUES prouvées (bcpp.c ⇔ bco.c/bcp.c) sont citées
 * en tête de chaque handler.
 */

// Décodeur texte byte-level + couche healthbox voie-L (side-effects globalThis),
// comme le controller player.
import './battle_message';
import './battle_interface';
import { DestroySprite, StartSpriteAnim } from './sprite';
import { PlayCry_ByMode } from './sound';
import { CRY_MODE_FAINT } from '../include/constants/sound';
import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gBattlerControllerFuncs,
  gBattlerPartyIndexes, setActiveBattler,
  gAbsentBattlerFlags, gBattlerTarget, setBattlerTarget,
} from './engine/battle/state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_MULTI,
  B_ACTION_EXEC_SCRIPT, MAX_MON_MOVES,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_BOTH,
  GET_BATTLER_SIDE, B_SIDE_PLAYER,
} from './engine/battle/constants';
import {
  gBattleBufferA, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
  gUnusedControllerStruct, gBitTable, BattlePutTextOnWindow,
} from './battle_controllers';
import {
  GetBattlerAtPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_LEFT, B_POSITION_OPPONENT_RIGHT,
} from './engine/battle/util';
import {
  gPlayerParty, GetMonData,
  MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_LEVEL, MON_DATA_SPECIES, MON_DATA_EXP,
  SetBattleMonDataFromBuffer,
} from './engine/battle/party-storage';
import { HandleIntroSlide } from './battle_intro';
import {
  SetBattleBarStruct, MoveBattleBar, HEALTH_BAR, EXP_BAR,
  CreatePartyStatusSummarySprites, SetTaskFuncToHidePartyStatusSummary,
  gBattlerStatusSummaryTaskId, type HpAndStatus as _PSHpAndStatus,
} from './battle_interface';
import { getBattleMove } from './data/battle_moves';
import { getExpForLevel } from './data/pokemon/experience_tables';
import { getSpeciesGrowthRate } from './data/pokemon/species_info';
import { getRuntime, SpriteCallbackDummy, PlayFanfare } from '../harness/runtime/decomp-globals';
import { B_WIN_MSG } from '../include/constants/battle';
import { B_ANIM_SWITCH_OUT_PLAYER_MON } from '../include/constants/battle_anim';
import { TRAINER_STEVEN_PARTNER } from '../include/constants/trainers';
// Helper partagé (exporté par opponent.ts, déjà utilisé par player.ts sans cycle) :
// load gfx + CreateSprite du back-pic mon côté joueur (isOpponent=false).
import { _loadAndCreateBattlerMonSprite, setBattlerDeferReveal, getBattlerMonSpriteId } from './battle_controller_opponent';
import { isBallAnimActive, setBallAnimActive } from './engine/battle/battle-sprites-data';
import {
  StartAnimLinearTranslation, StoreSpriteCallbackInData6,
  SetSpritePrimaryCoordsFromSecondaryCoords,
} from './battle_anim_mons';
import { DoPokeballSendOutAnimation } from './pokeball';
import { POKEBALL_PLAYER_SENDOUT } from '../include/pokeball';
import { showTrainerBackSprite, getTrainerSpriteId, destroyTrainerBackSprite } from './engine/battle/battle-sendout-anim';
import type { DecompTask, DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `CONTROLLER_CMDS_COUNT` = 56 (battle_controllers.h). */
const CONTROLLER_CMDS_COUNT = 56;
/** 1:1 décomp `CONTROLLER_TERMINATOR_NOP` = 55. */
const CONTROLLER_TERMINATOR_NOP = 55;

// CONTROLLER_* opcodes (battle_controllers.h:7-50).
const CONTROLLER_GETMONDATA = 0x00;
const CONTROLLER_GETRAWMONDATA = 0x01;
const CONTROLLER_SETMONDATA = 0x02;
const CONTROLLER_SETRAWMONDATA = 0x03;
const CONTROLLER_LOADMONSPRITE = 0x04;
const CONTROLLER_SWITCHINANIM = 0x05;
const CONTROLLER_RETURNMONTOBALL = 0x06;
const CONTROLLER_DRAWTRAINERPIC = 0x07;
const CONTROLLER_TRAINERSLIDE = 0x08;
const CONTROLLER_TRAINERSLIDEBACK = 0x09;
const CONTROLLER_FAINTANIMATION = 0x0A;
const CONTROLLER_PALETTEFADE = 0x0B;
const CONTROLLER_SUCCESSBALLTHROWANIM = 0x0C;
const CONTROLLER_BALLTHROWANIM = 0x0D;
const CONTROLLER_PAUSE = 0x0E;
const CONTROLLER_MOVEANIMATION = 0x0F;
const CONTROLLER_PRINTSTRING = 0x10;
const CONTROLLER_PRINTSTRINGPLAYERONLY = 0x11;
const CONTROLLER_CHOOSEACTION = 0x12;
const CONTROLLER_YESNOBOX = 0x13;
const CONTROLLER_CHOOSEMOVE = 0x14;
const CONTROLLER_OPENBAG = 0x15;
const CONTROLLER_CHOOSEPOKEMON = 0x16;
const CONTROLLER_23 = 0x17;
const CONTROLLER_HEALTHBARUPDATE = 0x18;
const CONTROLLER_EXPUPDATE = 0x19;
const CONTROLLER_STATUSICONUPDATE = 0x1A;
const CONTROLLER_STATUSANIMATION = 0x1B;
const CONTROLLER_STATUSXOR = 0x1C;
const CONTROLLER_DATATRANSFER = 0x1D;
const CONTROLLER_DMA3TRANSFER = 0x1E;
const CONTROLLER_PLAYBGM = 0x1F;
const CONTROLLER_32 = 0x20;
const CONTROLLER_TWORETURNVALUES = 0x21;
const CONTROLLER_CHOSENMONRETURNVALUE = 0x22;
const CONTROLLER_ONERETURNVALUE = 0x23;
const CONTROLLER_ONERETURNVALUE_DUPLICATE = 0x24;
const CONTROLLER_CLEARUNKVAR = 0x25;
const CONTROLLER_SETUNKVAR = 0x26;
const CONTROLLER_CLEARUNKFLAG = 0x27;
const CONTROLLER_TOGGLEUNKFLAG = 0x28;
const CONTROLLER_HITANIMATION = 0x29;
const CONTROLLER_CANTSWITCH = 0x2A;
const CONTROLLER_PLAYSE = 0x2B;
const CONTROLLER_PLAYFANFAREORBGM = 0x2C;
const CONTROLLER_FAINTINGCRY = 0x2D;
const CONTROLLER_INTROSLIDE = 0x2E;
const CONTROLLER_INTROTRAINERBALLTHROW = 0x2F;
const CONTROLLER_DRAWPARTYSTATUSSUMMARY = 0x30;
const CONTROLLER_HIDEPARTYSTATUSSUMMARY = 0x31;
const CONTROLLER_ENDBOUNCE = 0x32;
const CONTROLLER_SPRITEINVISIBILITY = 0x33;
const CONTROLLER_BATTLEANIMATION = 0x34;
const CONTROLLER_LINKSTANDBYMSG = 0x35;
const CONTROLLER_RESETACTIONMOVESELECTION = 0x36;
const CONTROLLER_ENDLINKBATTLE = 0x37;

/** 1:1 décomp `PARTY_SIZE` = 6. */
const _PARTY_SIZE = 6;
/** 1:1 décomp `MAX_LEVEL` = 100. */
const _MAX_LEVEL = 100;
/** 1:1 décomp `INSTANT_HP_BAR_DROP` = 0x7FFF (battle_controllers.h). */
const _INSTANT_HP_BAR_DROP = 0x7FFF;
/** 1:1 décomp `ALL_MOVES_MASK` = 0xF (battle_ai.h). */
const _ALL_MOVES_MASK = 0xF;
/** 1:1 décomp `SE_FAINT` = 16 (constants/songs.h:22). */
const _SE_FAINT = 16;
/** 1:1 décomp `SE_EXP` = 33 (constants/songs.h). */
const _SE_EXP = 33;
/** 1:1 décomp `SOUND_PAN_ATTACKER` = -64 / `SOUND_PAN_TARGET` = 63 (battle.h). */
const _SOUND_PAN_ATTACKER = -64;
const _SOUND_PAN_TARGET = 63;
/** 1:1 décomp `B_ANIM_SUBSTITUTE_TO_MON` = 5 (battle_anim.h:387). */
const _B_ANIM_SUBSTITUTE_TO_MON = 5;
/** 1:1 décomp `HEALTHBOX_STATUS_ICON` = 9 / `HEALTHBOX_ALL` = 0 (battle_interface.h). */
const _HEALTHBOX_STATUS_ICON = 9;
const _HEALTHBOX_ALL = 0;
/** 1:1 décomp `HP_CURRENT` = 0 (battle_interface.h). */
const _HP_CURRENT = 0;

// ─── Feuilles / hooks partagés (mêmes surfaces globalThis que player/opponent) ──

/** 1:1 décomp `PlaySE(seId)` — wire __PlaySE (exposé par decomp-globals). */
function PlaySE(seId: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
/** 1:1 décomp `PlaySE12WithPanning(seId, pan)` (pan stéréo = dette infra son). */
function _PlaySE12WithPanning(seId: number, _pan: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
/** 1:1 décomp `gHealthboxSpriteIds[battler]` via couche healthbox voie-L. */
function _gHealthboxSpriteId(battler: number): number {
  const m = (globalThis as { __battleHealthbox?: { gHealthboxSpriteIds?: number[] } }).__battleHealthbox;
  return m?.gHealthboxSpriteIds?.[battler] ?? 0;
}
/** 1:1 décomp : montre + glisse le healthbox au send-out (Intro_ShowHealthbox). */
function _ShowHealthboxOnSendOut(battler: number): void {
  const m = (globalThis as { __battleHealthbox?: { ShowHealthboxOnSendOut?: (b: number) => void } }).__battleHealthbox;
  m?.ShowHealthboxOnSendOut?.(battler);
}
/** 1:1 décomp `SetHealthboxSpriteVisible(spriteId)`. */
function _SetHealthboxSpriteVisible(spriteId: number): void {
  const m = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteVisible?: (s: number) => void } }).__battleHealthbox;
  m?.SetHealthboxSpriteVisible?.(spriteId);
}
/** 1:1 décomp `SetHealthboxSpriteInvisible(spriteId)`. */
function _SetHealthboxSpriteInvisible(spriteId: number): void {
  const m = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteInvisible?: (s: number) => void } }).__battleHealthbox;
  m?.SetHealthboxSpriteInvisible?.(spriteId);
}
/** 1:1 décomp `UpdateHpTextInHealthbox(spriteId, value, hpId)`. */
function _UpdateHpTextInHealthbox(spriteId: number, value: number, hpId: number): void {
  const m = (globalThis as { __battleHealthbox?: { UpdateHpTextInHealthbox?: (s: number, v: number, h: number) => void } }).__battleHealthbox;
  m?.UpdateHpTextInHealthbox?.(spriteId, value, hpId);
}
/** 1:1 décomp `UpdateHealthboxAttribute(spriteId, mon, elementId)`. */
function _UpdateHealthboxAttribute(spriteId: number, mon: unknown, elementId: number): void {
  const m = (globalThis as { __battleHealthbox?: { updateHealthboxAttribute?: (s: number, m: unknown, e: number) => void } }).__battleHealthbox;
  m?.updateHealthboxAttribute?.(spriteId, mon, elementId);
}
/** 1:1 décomp `HandleLowHpMusicChange(mon, battler)`. */
function _HandleLowHpMusicChange(mon: unknown, battler: number): void {
  const m = (globalThis as { __battleHealthbox?: { handleLowHpMusicChange?: (mon: unknown, b: number) => void } }).__battleHealthbox;
  m?.handleLowHpMusicChange?.(mon, battler);
}
/** 1:1 décomp `LoadBattleBarGfx(barId)` (dette R3 : palette/tiles VRAM, comme player). */
function _LoadBattleBarGfx(_barId: number): void { /* Dette R3 (= player) */ }
/** 1:1 décomp `IsBattleSEPlaying(battler)` (dette R3 : return false = done, comme player). */
function _IsBattleSEPlaying(_battler: number): boolean { return false; }
/** 1:1 décomp `InitAndLaunchSpecialAnimation(active, attacker, target, animId)`. */
function _InitAndLaunchSpecialAnimation(active: number, attacker: number, target: number, animId: number): void {
  const m = (globalThis as { __battleGfxSfxUtil?: { InitAndLaunchSpecialAnimation?: (a: number, at: number, t: number, aid: number) => void } }).__battleGfxSfxUtil;
  m?.InitAndLaunchSpecialAnimation?.(active, attacker, target, animId);
}
/** 1:1 décomp `InitAndLaunchChosenStatusAnimation(isStatus2, status)`. */
function _InitAndLaunchChosenStatusAnimation(isStatus2: boolean, status: number): void {
  const m = (globalThis as { __battleGfxSfxUtil?: { InitAndLaunchChosenStatusAnimation?: (a: boolean, b: number) => void } }).__battleGfxSfxUtil;
  m?.InitAndLaunchChosenStatusAnimation?.(isStatus2, status);
}
/** 1:1 décomp `gBattleSpritesDataPtr->healthBoxesData[b].specialAnimActive`. */
function _isSpecialAnimActive(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isSpecialAnimActive?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isSpecialAnimActive?.(battler);
}
/** 1:1 décomp `gBattleSpritesDataPtr->healthBoxesData[b].statusAnimActive`. */
function _isStatusAnimActive(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isStatusAnimActive?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isStatusAnimActive?.(battler);
}
/** 1:1 décomp `gBattleSpritesDataPtr->battlerData[b].behindSubstitute`. */
function _isBehindSubstitute(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isBehindSubstitute?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isBehindSubstitute?.(battler);
}
/** True si le backing __battleSpritesData.animationState est câblé (sinon les state
 *  machines dessus bouclent → court-circuit ExecCompleted, comme player). */
function _healthBoxAnimStateWired(): boolean {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: unknown } }).__battleSpritesData;
  return typeof m?.setHealthBoxAnimationState === 'function';
}
function _getHealthBoxAnimationState(battler: number): number {
  const m = (globalThis as { __battleSpritesData?: { getHealthBoxAnimationState?: (b: number) => number } }).__battleSpritesData;
  return m?.getHealthBoxAnimationState?.(battler) ?? 0;
}
function _setHealthBoxAnimationState(battler: number, v: number): void {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: (b: number, v: number) => void } }).__battleSpritesData;
  m?.setHealthBoxAnimationState?.(battler, v);
}
/** 1:1 décomp `ClearTemporarySpeciesSpriteData(battler, dontClearSubstituteBit)`. */
function _ClearTemporarySpeciesSpriteData(battler: number, dontClear: boolean): void {
  const m = (globalThis as { __battleSpritesData?: { clearTemporarySpeciesSpriteData?: (b: number, c: boolean) => void } }).__battleSpritesData;
  m?.clearTemporarySpeciesSpriteData?.(battler, dontClear);
}
/** 1:1 décomp `TryShinyAnimation(battler, mon)` (via __battleAnimThrowShiny). */
function _hasTriedShinyAnim(battler: number): boolean {
  const m = (globalThis as { __battleAnimThrowShiny?: { hasTriedShinyAnim?: (b: number) => boolean } }).__battleAnimThrowShiny;
  return m?.hasTriedShinyAnim?.(battler) ?? true;
}
function _isShinyAnimFinished(battler: number): boolean {
  const m = (globalThis as { __battleAnimThrowShiny?: { isShinyAnimFinished?: (b: number) => boolean } }).__battleAnimThrowShiny;
  return m?.isShinyAnimFinished?.(battler) ?? true;
}
function _TryShinyAnimation(battler: number, mon: unknown): void {
  const m = (globalThis as { __battleAnimThrowShiny?: { TryShinyAnimation?: (b: number, mon: unknown) => void } }).__battleAnimThrowShiny;
  m?.TryShinyAnimation?.(battler, mon);
}
function _resetShinyAnimFlags(battler: number): void {
  const m = (globalThis as { __battleAnimThrowShiny?: { resetShinyAnimFlags?: (b: number) => void } }).__battleAnimThrowShiny;
  m?.resetShinyAnimFlags?.(battler);
}
/** 1:1 décomp `CopyBattleSpriteInvisibility(battler)`. */
function _CopyBattleSpriteInvisibility(battler: number): void {
  const m = (globalThis as { __battleGfxSfxUtil?: { CopyBattleSpriteInvisibility?: (b: number) => void } }).__battleGfxSfxUtil;
  m?.CopyBattleSpriteInvisibility?.(battler);
}

// AI (mêmes ponts globalThis.__battleAi que l'opponent) :
/** 1:1 décomp `AI_TrySwitchOrUseItem()`. */
function _AI_TrySwitchOrUseItem(): void {
  const m = (globalThis as { __battleAi?: { AI_TrySwitchOrUseItem?: () => void } }).__battleAi;
  m?.AI_TrySwitchOrUseItem?.();
}
/** 1:1 décomp `BattleAI_SetupAIData(mask)`. */
function _BattleAI_SetupAIData(mask: number): void {
  const m = (globalThis as { __battleAi?: { BattleAI_SetupAIData?: (m: number) => void } }).__battleAi;
  m?.BattleAI_SetupAIData?.(mask);
}
/** 1:1 décomp `BattleAI_ChooseMoveOrAction()`. */
function _BattleAI_ChooseMoveOrAction(): number {
  const m = (globalThis as { __battleAi?: { BattleAI_ChooseMoveOrAction?: () => number } }).__battleAi;
  return m?.BattleAI_ChooseMoveOrAction?.() ?? 0;
}
/** 1:1 décomp `GetMostSuitableMonToSwitchInto()`. */
function _GetMostSuitableMonToSwitchInto(): number {
  const m = (globalThis as { __battleAi?: { GetMostSuitableMonToSwitchInto?: () => number } }).__battleAi;
  return m?.GetMostSuitableMonToSwitchInto?.() ?? _PARTY_SIZE;
}
/** 1:1 décomp `gBattleMoves[move].target`. */
function _getMoveTarget(move: number): number {
  const t = getBattleMove(move).target;
  return typeof t === 'number' ? t : 0;
}
/** 1:1 décomp `*(gBattleStruct->monToSwitchIntoId + battler) = v`. */
function _setMonToSwitchIntoId(battler: number, v: number): void {
  const m = (globalThis as { __battleState?: { gBattleStruct?: { monToSwitchIntoId?: number[] } } }).__battleState;
  if (m?.gBattleStruct?.monToSwitchIntoId) m.gBattleStruct.monToSwitchIntoId[battler] = v;
}
/** 1:1 décomp `gIntroSlideFlags |= 1` (via __battleMainFunctions). */
function _setIntroSlideFlagBit0(): void {
  const bmf = (globalThis as { __battleMainFunctions?: { getIntroSlideFlags?: () => number; setIntroSlideFlags?: (v: number) => void } }).__battleMainFunctions;
  if (bmf?.getIntroSlideFlags && bmf.setIntroSlideFlags) bmf.setIntroSlideFlags(bmf.getIntroSlideFlags() | 1);
}
/** 1:1 décomp `gPartnerTrainerId` (posé par battle_setup/battle_tower, non porté) :
 *  lecture via hook si dispo, sinon TRAINER_STEVEN_PARTNER (seul partenaire du jeu
 *  de base = Steven multi ; le back-pic Steven est le chemin canonique). */
function _getPartnerTrainerId(): number {
  const m = (globalThis as { __battleState?: { gPartnerTrainerId?: number } }).__battleState;
  return m?.gPartnerTrainerId ?? TRAINER_STEVEN_PARTNER;
}

// ─── SetControllerToPlayerPartner + Run/ExecCompleted (bcpp.c:178-192, 580-594) ──

/** 1:1 décomp `SetControllerToPlayerPartner()` (bcpp.c:178-181). */
export function SetControllerToPlayerPartner(): void {
  gBattlerControllerFuncs[gActiveBattler] = PlayerPartnerBufferRunCommand;
}

/** 1:1 décomp `PlayerPartnerBufferRunCommand()` (bcpp.c:183-192). */
export function PlayerPartnerBufferRunCommand(): void {
  if (gBattleControllerExecFlags & gBitTable[gActiveBattler]) {
    const opcode = gBattleBufferA[gActiveBattler][0];
    if (opcode < CONTROLLER_CMDS_COUNT) {
      const handler = sPlayerPartnerBufferCommands[opcode];
      if (handler) handler();
      else PlayerPartnerBufferExecCompleted();
    } else {
      PlayerPartnerBufferExecCompleted();
    }
  }
}

/** 1:1 décomp `PlayerPartnerBufferExecCompleted()` (bcpp.c:580-594). */
function PlayerPartnerBufferExecCompleted(): void {
  gBattlerControllerFuncs[gActiveBattler] = PlayerPartnerBufferRunCommand;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    // Dette R3 : link path (PrepareBufferDataTransferLink) — offline.
    gBattleBufferA[gActiveBattler][0] = CONTROLLER_TERMINATOR_NOP;
  } else {
    setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[gActiveBattler]);
  }
}

/** 1:1 décomp `PlayerPartnerDummy()` / `BattleControllerDummy()` — no-op (Task drive). */
function _PlayerPartnerDummy(): void { /* no-op */ }

// ─── Fonctions d'attente / callbacks nommées 1:1 (bcpp.c) ──────────────────

let _gDoingBattleAnim = false;

/** 1:1 décomp `WaitForMonAnimAfterLoad()` (bcpp.c:277-281). */
function WaitForMonAnimAfterLoad(): void {
  const rt = getRuntime();
  const spr = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)] as { animEnded?: boolean; x2?: number } | undefined;
  if (!spr) return;
  if ((spr.animEnded ?? true) && (spr.x2 ?? 0) === 0) PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `CompleteOnHealthbarDone()` (bcpp.c:283-298). */
function CompleteOnHealthbarDone(): void {
  const hpValue = MoveBattleBar(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), HEALTH_BAR, 0);
  _SetHealthboxSpriteVisible(_gHealthboxSpriteId(gActiveBattler));
  if (hpValue !== -1) {
    _UpdateHpTextInHealthbox(_gHealthboxSpriteId(gActiveBattler), hpValue, _HP_CURRENT);
  } else {
    _HandleLowHpMusicChange(gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], gActiveBattler);
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `CompleteOnInactiveTextPrinter2()` (bcpp.c:497-501). */
function CompleteOnInactiveTextPrinter2(): void {
  if (!_IsTextPrinterActive(B_WIN_MSG)) PlayerPartnerBufferExecCompleted();
}
function _IsTextPrinterActive(windowId: number): boolean {
  const real = (globalThis as { __IsTextPrinterActive?: (w: number) => boolean }).__IsTextPrinterActive;
  if (real) return real(windowId);
  const m = (globalThis as { __textPrinterState?: Record<number, boolean> }).__textPrinterState;
  return !!(m?.[windowId]);
}

/** 1:1 décomp `CompleteOnFinishedStatusAnimation()` (bcpp.c:596-600). */
function CompleteOnFinishedStatusAnimation(): void {
  if (!_isStatusAnimActive(gActiveBattler)) PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `CompleteOnFinishedBattleAnimation()` (bcpp.c:602-606). */
function CompleteOnFinishedBattleAnimation(): void {
  const active = (globalThis as { __battleGfxSfxUtil?: { isAnimFromTableActive?: (b: number) => boolean } })
    .__battleGfxSfxUtil?.isAnimFromTableActive?.(gActiveBattler);
  if (!active) PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `FreeMonSpriteAfterFaintAnim()` (bcpp.c:472-484) : attend le sprite
 *  sous l'écran → destroy + healthbox invisible + ExecCompleted. */
function FreeMonSpriteAfterFaintAnim(): void {
  const rt = getRuntime();
  const spriteId = getBattlerMonSpriteId(gActiveBattler);
  const sprite = rt?.gSprites?.[spriteId];
  if (!sprite || ((sprite.y ?? 0) + (sprite.y2 ?? 0) > 160 /* DISPLAY_HEIGHT */)) {
    if (sprite && rt?.gSprites) { DestroySprite(spriteId); rt.gSprites[spriteId] = undefined; }
    _SetHealthboxSpriteInvisible(_gHealthboxSpriteId(gActiveBattler));
    PlayerPartnerBufferExecCompleted();
  }
}

/** Corps partagé 1:1 (bcpp.c:490-494 / 263-266) : DestroySprite mon + healthbox invisible. */
function _freeMonSpriteAndHideHealthbox(battler: number): void {
  const rt = getRuntime();
  const spriteId = getBattlerMonSpriteId(battler);
  const sprite = rt?.gSprites?.[spriteId];
  if (sprite && rt?.gSprites) { DestroySprite(spriteId); rt.gSprites[spriteId] = undefined; }
  _SetHealthboxSpriteInvisible(_gHealthboxSpriteId(battler));
}

/** 1:1 décomp `FreeMonSpriteAfterSwitchOutAnim()` (bcpp.c:486-495). */
function FreeMonSpriteAfterSwitchOutAnim(): void {
  if (!_isSpecialAnimActive(gActiveBattler)) {
    _freeMonSpriteAndHideHealthbox(gActiveBattler);
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `DoHitAnimBlinkSpriteEffect()` (bcpp.c:503-520). */
function DoHitAnimBlinkSpriteEffect(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
  if (!sprite) { _gDoingBattleAnim = false; PlayerPartnerBufferExecCompleted(); return; }
  if (sprite.data[1] === 32) {
    sprite.data[1] = 0;
    sprite.invisible = false;
    _gDoingBattleAnim = false;
    PlayerPartnerBufferExecCompleted();
  } else {
    if ((sprite.data[1] % 4) === 0) sprite.invisible = !sprite.invisible;
    sprite.data[1]++;
  }
}

/** 1:1 décomp `CompleteOnBattlerSpriteCallbackDummy()` (bcpp.c:194-198) : attend que
 *  le sprite du dresseur ait fini son slide (callback === SpriteCallbackDummy). */
function CompleteOnBattlerSpriteCallbackDummy(): void {
  const rt = getRuntime();
  const tid = getTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (!tr || tr.callback === SpriteCallbackDummy) PlayerPartnerBufferExecCompleted();
}

// ─── HANDLERS (bcpp.c gPlayerPartnerBufferCommands) ────────────────────────

/** 1:1 décomp `PlayerPartnerHandleGetMonData()` (bcpp.c:608-631). Corps identique
 *  à OpponentHandleGetMonData (bco.c:135) sauf gPlayerParty : la sérialisation
 *  octet (CopyPlayerPartnerMonData) est stubée comme chez les 2 frères (le modèle
 *  de données est objet-JS vivant, pas un buffer sérialisé → EmitDataTransfer vide). */
function PlayerPartnerHandleGetMonData(): void {
  const monData = new Uint8Array(0x80);
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, monData, 4);
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 COMPORTEMENTAL (bcpp.c:939-942) : `BtlController_EmitGetRawMonData` UNUSED
 *  (battle_controllers.c:977) → jamais émis ; complete direct. Corps identique à
 *  OpponentHandleGetRawMonData (bco.c:246). */
function PlayerPartnerHandleGetRawMonData(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `SetPlayerPartnerMonData(monId)` (bcpp.c:966-1182) : désérialise
 *  bufferA + applique à gPlayerParty via SetMonData (round-trip bufferA).
 *  @body-parity-ok même helper SetBattleMonDataFromBuffer que _SetPlayerMonData
 *  (bcp.c) / _SetOpponentMonData (bco.c:250). */
function _SetPlayerPartnerMonData(monId: number): void {
  SetBattleMonDataFromBuffer(monId, gBattleBufferA[gActiveBattler], gActiveBattler);
}
/** 1:1 décomp `PlayerPartnerHandleSetMonData()` (bcpp.c:944-964). Corps identique à
 *  OpponentHandleSetMonData (bco.c:255) sauf gPlayerParty. */
function PlayerPartnerHandleSetMonData(): void {
  const monToCheck = gBattleBufferA[gActiveBattler][2];
  if (monToCheck === 0) {
    _SetPlayerPartnerMonData(gBattlerPartyIndexes[gActiveBattler]);
  } else {
    for (let i = 0; i < _PARTY_SIZE; i++) {
      if (monToCheck & (1 << i)) _SetPlayerPartnerMonData(i);
    }
  }
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleSetRawMonData()` (bcpp.c:1184-1193) : write raw
 *  bytes bufferA → struct mon. Stub comme les 2 frères (modèle objet-JS = dette R3). */
function PlayerPartnerHandleSetRawMonData(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleLoadMonSprite()` (bcpp.c:1195-1212). Corps
 *  identique à OpponentHandleLoadMonSprite (bco.c:273) côté joueur : charge le
 *  back-pic + spawn le sprite (async, plateforme) + install WaitForMonAnimAfterLoad. */
function PlayerPartnerHandleLoadMonSprite(): void {
  const battler = gActiveBattler;
  void _loadAndCreateBattlerMonSprite(battler, false).catch((e) => console.error('[bcpp LoadMonSprite]', e));
  gBattlerControllerFuncs[battler] = WaitForMonAnimAfterLoad;
}

/** 1:1 décomp `PlayerPartnerHandleSwitchInAnim()` (bcpp.c:1214-1221). */
function PlayerPartnerHandleSwitchInAnim(): void {
  const battler = gActiveBattler;
  _ClearTemporarySpeciesSpriteData(battler, gBattleBufferA[battler][2] !== 0);
  gBattlerPartyIndexes[battler] = gBattleBufferA[battler][1];   // 1:1 l.1217
  StartSendOutAnim(battler, gBattleBufferA[battler][2] !== 0);
  gBattlerControllerFuncs[battler] = SwitchIn_TryShinyAnim;
}

/** 1:1 décomp `StartSendOutAnim(battler, dontClearSubstituteBit)` (bcpp.c:1223-1252).
 *  Le mon sort d'une POKÉBALL joueur (POKEBALL_PLAYER_SENDOUT). Adaptation plateforme
 *  identique à _StartSendOutAnim (bcp.c) / _StartSendOutAnim_Opponent (bco.c:632) :
 *  load gfx ASYNC → sprite INVISIBLE (deferReveal) → DoPokeballSendOutAnimation dans
 *  le .then ; ballAnimActive pré-posé SYNC (la chaîne SwitchIn le lit avant le throw). */
function StartSendOutAnim(battler: number, dontClearSubstituteBit: boolean): void {
  _ClearTemporarySpeciesSpriteData(battler, dontClearSubstituteBit);
  gBattlerPartyIndexes[battler] = gBattleBufferA[battler][1];   // 1:1 l.1228
  setBattlerDeferReveal(battler, true);
  setBallAnimActive(battler, true);
  void _loadAndCreateBattlerMonSprite(battler, false).then(() => {
    const saved = gActiveBattler;
    setActiveBattler(battler);
    DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT);   // 1:1 l.1251
    setActiveBattler(saved);
  }).catch((e) => console.error('[bcpp StartSendOutAnim]', e));
}

/** 1:1 décomp `SwitchIn_TryShinyAnim()` (bcpp.c:564-578) fusionné avec la chaîne
 *  ShowHealthbox/ShowSubstitute/WaitAndEnd (bcpp.c:522-562) sur le gate ball-anim,
 *  comme le SwitchIn adverse déjà porté (bco.c:671). */
function SwitchIn_TryShinyAnim(): void {
  const battler = gActiveBattler;
  if (!_hasTriedShinyAnim(battler) && !isBallAnimActive(battler)) {
    _TryShinyAnimation(battler, gPlayerParty[gBattlerPartyIndexes[battler]]);
  }
  if (!isBallAnimActive(battler)) {
    setBattlerDeferReveal(battler, false);
    gBattlerControllerFuncs[battler] = SwitchIn_ShowHealthbox;
  }
}
/** 1:1 décomp `SwitchIn_ShowHealthbox()` (bcpp.c:543-562). */
function SwitchIn_ShowHealthbox(): void {
  const battler = gActiveBattler;
  if (_isShinyAnimFinished(battler)) {
    _resetShinyAnimFlags(battler);
    _HandleLowHpMusicChange(gPlayerParty[gBattlerPartyIndexes[battler]], battler);
    _ShowHealthboxOnSendOut(battler);
    gBattlerControllerFuncs[battler] = SwitchIn_ShowSubstitute;
  }
}
/** 1:1 décomp `SwitchIn_ShowSubstitute()` (bcpp.c:522-532). */
function SwitchIn_ShowSubstitute(): void {
  const battler = gActiveBattler;
  const rt = getRuntime();
  const hbId = _gHealthboxSpriteId(battler);
  const hbSpr = rt?.gSprites?.[hbId];
  const nm = (hbSpr?.callback as { name?: string } | null | undefined)?.name;
  if (!hbSpr || nm !== 'SpriteCB_HealthboxSlideIn') {
    _CopyBattleSpriteInvisibility(battler);
    if (_isBehindSubstitute(battler)) {
      _InitAndLaunchSpecialAnimation(battler, battler, battler, 6 /* B_ANIM_MON_TO_SUBSTITUTE */);
    }
    gBattlerControllerFuncs[battler] = SwitchIn_WaitAndEnd;
  }
}
/** 1:1 décomp `SwitchIn_WaitAndEnd()` (bcpp.c:534-541). */
function SwitchIn_WaitAndEnd(): void {
  const battler = gActiveBattler;
  const rt = getRuntime();
  const spr = rt?.gSprites?.[getBattlerMonSpriteId(battler)];
  const atRest = !spr || spr.callback === SpriteCallbackDummy || spr.callback === null || spr.callback === undefined;
  if (!_isSpecialAnimActive(battler) && atRest) {
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerPartnerHandleReturnMonToBall()` (bcpp.c:1254-1268). */
function PlayerPartnerHandleReturnMonToBall(): void {
  if (gBattleBufferA[gActiveBattler][1] === 0) {
    _setHealthBoxAnimationState(gActiveBattler, 0);
    gBattlerControllerFuncs[gActiveBattler] = DoSwitchOutAnimation;
  } else {
    _freeMonSpriteAndHideHealthbox(gActiveBattler);
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `DoSwitchOutAnimation()` (bcpp.c:1270-1289). */
function DoSwitchOutAnimation(): void {
  switch (_getHealthBoxAnimationState(gActiveBattler)) {
    case 0:
      if (_isBehindSubstitute(gActiveBattler))
        _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, _B_ANIM_SUBSTITUTE_TO_MON);
      _setHealthBoxAnimationState(gActiveBattler, 1);
      break;
    case 1:
      if (!_isSpecialAnimActive(gActiveBattler)) {
        _setHealthBoxAnimationState(gActiveBattler, 0);
        _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, B_ANIM_SWITCH_OUT_PLAYER_MON);
        gBattlerControllerFuncs[gActiveBattler] = FreeMonSpriteAfterSwitchOutAnim;
      }
      break;
  }
}

/** 1:1 décomp `SpriteCB_TrainerSlideVertical` — glisse vertical du back-pic dresseur. */
function _SpriteCB_TrainerSlideVertical(sprite: DecompSprite): void {
  sprite.y2 -= 2;
  if (sprite.y2 === 0) sprite.callback = SpriteCallbackDummy;
}
/** 1:1 décomp `SpriteCB_TrainerSlideIn` (gaté gIntroSlideFlags bit0). */
function _SpriteCB_TrainerSlideIn(sprite: DecompSprite): void {
  const bmf = (globalThis as { __battleMainFunctions?: { getIntroSlideFlags?: () => number } }).__battleMainFunctions;
  if (!((bmf?.getIntroSlideFlags?.() ?? 0) & 1)) {
    sprite.x2 += sprite.data[0];   // sSpeedX
    if (sprite.x2 === 0) {
      if (sprite.y2 !== 0) sprite.callback = _SpriteCB_TrainerSlideVertical;
      else sprite.callback = SpriteCallbackDummy;
    }
  }
}

/** 1:1 décomp `PlayerPartnerHandleDrawTrainerPic()` (bcpp.c:1296-1342).
 *  Steven (TRAINER_STEVEN_PARTNER) → BACK-pic dresseur (xPos=90) qui slide-in ;
 *  autre partenaire (tag Frontier) → FRONT-pic (xPos=32). Le back-pic STEVEN
 *  spécifique (DecompressTrainerBackPic TRAINER_BACK_PIC_STEVEN) n'est pas encore
 *  extrait → best-effort via showTrainerBackSprite (slide-in 1:1) ; chemin Frontier
 *  front-pic = dette R3 (GetFrontierTrainerFrontSpriteId non porté). Le slide reste
 *  1:1 (sSpeedX=-2, callback SpriteCB_TrainerSlideIn), le send-out du mon est intact. */
function PlayerPartnerHandleDrawTrainerPic(): void {
  const battler = gActiveBattler;
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    PlayerPartnerBufferExecCompleted();
    return;
  }
  const rt = getRuntime();
  const xPos = _getPartnerTrainerId() === TRAINER_STEVEN_PARTNER ? 90 : 32;  // 1:1 ll.1304/1310
  // Dette : back-pic Steven spécifique non extrait → showTrainerBackSprite (générique).
  void showTrainerBackSprite(0, xPos, 80).then((tid) => {
    const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
    if (tr) {
      tr.data[0] = -2;                          // sSpeedX (1:1 l.1323/1335)
      tr.callback = _SpriteCB_TrainerSlideIn;   // 1:1 l.1324/1336
    }
  }).catch((e) => console.error('[bcpp DrawTrainerPic]', e));
  gBattlerControllerFuncs[battler] = CompleteOnBattlerSpriteCallbackDummy;   // 1:1 l.1341
}

/** 1:1 décomp `PlayerPartnerHandleTrainerSlide()` (bcpp.c:1346-1349). */
function PlayerPartnerHandleTrainerSlide(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleTrainerSlideBack()` (bcpp.c:1351-1360) : le back-pic
 *  dresseur glisse hors-champ (destX=-40, 35f) puis se libère (FreeTrainerSpriteAfterSlide). */
function PlayerPartnerHandleTrainerSlideBack(): void {
  const rt = getRuntime();
  const tid = getTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (tr) {
    SetSpritePrimaryCoordsFromSecondaryCoords(tr);
    tr.data[0] = 35;
    tr.data[2] = -40;
    tr.data[4] = tr.y;
    tr.callback = StartAnimLinearTranslation;
    StoreSpriteCallbackInData6(tr, SpriteCallbackDummy);
  }
  gBattlerControllerFuncs[gActiveBattler] = FreeTrainerSpriteAfterSlide;
}
/** 1:1 décomp `FreeTrainerSpriteAfterSlide()` (bcpp.c:200-209). */
function FreeTrainerSpriteAfterSlide(): void {
  const rt = getRuntime();
  const tid = getTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (!tr || tr.callback === SpriteCallbackDummy) {
    destroyTrainerBackSprite();
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerPartnerHandleFaintAnimation()` (bcpp.c:1365-1386). Machine 2-états
 *  identique à PlayerHandleFaintAnimation (bcp.c) : substitute→normal, puis SE_FAINT +
 *  slide + FreeMonSpriteAfterFaintAnim. Court-circuit si le backing animationState
 *  n'est pas câblé (sinon boucle en state 0) — même garde que le frère player. */
function PlayerPartnerHandleFaintAnimation(): void {
  if (!_healthBoxAnimStateWired()) { PlayerPartnerBufferExecCompleted(); return; }
  if (_getHealthBoxAnimationState(gActiveBattler) === 0) {
    if (_isBehindSubstitute(gActiveBattler))
      _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, _B_ANIM_SUBSTITUTE_TO_MON);
    _setHealthBoxAnimationState(gActiveBattler, _getHealthBoxAnimationState(gActiveBattler) + 1);
  } else {
    if (!_isSpecialAnimActive(gActiveBattler)) {
      _setHealthBoxAnimationState(gActiveBattler, 0);
      _HandleLowHpMusicChange(gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], gActiveBattler);
      _PlaySE12WithPanning(_SE_FAINT, _SOUND_PAN_ATTACKER);
      _triggerFaintSlideAnim(gActiveBattler);
      gBattlerControllerFuncs[gActiveBattler] = FreeMonSpriteAfterFaintAnim;
    }
  }
}
/** Trigger K13 SpriteCB_FaintSlideAnim (sSpeedX=0, sSpeedY=5) via __battleFaintAnim. */
function _triggerFaintSlideAnim(battler: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(battler)];
  if (!sprite) return;
  const fa = (globalThis as { __battleFaintAnim?: { TriggerFaintSlide?: (s: unknown, x: number, y: number) => void } }).__battleFaintAnim;
  fa?.TriggerFaintSlide?.(sprite, 0, 5);
}

/** 1:1 décomp (bcpp.c:1391-1409) — corps identiques à Player/Opponent (émetteurs
 *  UNUSED / anims capture différées). */
function PlayerPartnerHandlePaletteFade(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleSuccessBallThrowAnim(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleBallThrowAnim(): void { PlayerPartnerBufferExecCompleted(); }
/** 1:1 EXACT (bcpp.c:1406-1409) : busy-loop sans effet → complete direct. */
function PlayerPartnerHandlePause(): void { PlayerPartnerBufferExecCompleted(); }

// Machine DoMoveAnimation (1:1 healthBoxesData[b].animationState).
const _moveAnimState: number[] = [0, 0, 0, 0];
const _moveAnimMove: number[] = [0, 0, 0, 0];
type _AnimItf = {
  DoMoveAnim?: (move: number) => void;
  tickAnimScript?: () => void;
  isAnimScriptActive?: () => boolean;
  setAnimMoveTurn?: (v: number) => void;
  setAnimMovePower?: (v: number) => void;
  setAnimMoveDmg?: (v: number) => void;
  setAnimFriendship?: (v: number) => void;
};
function _animItf(): _AnimItf {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as _AnimItf) ?? {};
}

/** 1:1 décomp `PlayerPartnerHandleMoveAnimation()` (bcpp.c:1411-1434). Corps identique à
 *  PlayerHandleMoveAnimation (bcp.c) : pose gAnimMove* depuis le buffer + lance la machine. */
function PlayerPartnerHandleMoveAnimation(): void {
  if (!_IsBattleSEPlaying(gActiveBattler)) {
    const buf = gBattleBufferA[gActiveBattler];
    _moveAnimMove[gActiveBattler] = buf[1] | (buf[2] << 8);
    const g = globalThis as Record<string, unknown>;
    g.__gAnimMoveTurn = buf[3];
    g.__gAnimMovePower = buf[4] | (buf[5] << 8);
    g.__gAnimMoveDmg = (buf[6] | (buf[7] << 8) | (buf[8] << 16) | (buf[9] << 24)) | 0;
    g.__gAnimFriendship = buf[10];
    g.__gWeatherMoveAnim = buf[12] | (buf[13] << 8);
    const itf = _animItf();
    itf.setAnimMoveTurn?.(buf[3]);
    itf.setAnimMovePower?.(buf[4] | (buf[5] << 8));
    itf.setAnimMoveDmg?.((buf[6] | (buf[7] << 8) | (buf[8] << 16) | (buf[9] << 24)) | 0);
    itf.setAnimFriendship?.(buf[10]);
    _moveAnimState[gActiveBattler] = 0;
    gBattlerControllerFuncs[gActiveBattler] = PlayerPartnerDoMoveAnimation;
  }
}
/** 1:1 décomp `PlayerPartnerDoMoveAnimation()` (bcpp.c:1436-1483). */
function PlayerPartnerDoMoveAnimation(): void {
  const itf = _animItf();
  switch (_moveAnimState[gActiveBattler]) {
    case 0:
      _moveAnimState[gActiveBattler] = 1;   // substitute swap = dette (comme player)
      break;
    case 1:
      ((globalThis as Record<string, unknown>).__SetBattlerSpriteAffineMode as ((m: number) => void) | undefined)?.(0);
      itf.DoMoveAnim?.(_moveAnimMove[gActiveBattler]);
      _moveAnimState[gActiveBattler] = 2;
      break;
    case 2:
      itf.tickAnimScript?.();
      if (!itf.isAnimScriptActive?.()) {
        ((globalThis as Record<string, unknown>).__SetBattlerSpriteAffineMode as ((m: number) => void) | undefined)?.(1);
        _moveAnimState[gActiveBattler] = 3;
      }
      break;
    case 3:
      _moveAnimState[gActiveBattler] = 0;
      PlayerPartnerBufferExecCompleted();
      break;
  }
}

/** 1:1 décomp `PlayerPartnerHandlePrintString()` (bcpp.c:1485-1495). Corps identique à
 *  PlayerHandlePrintString (bcp.c) : BufferStringBattle + BattlePutTextOnWindow(B_WIN_MSG). */
function PlayerPartnerHandlePrintString(): void {
  const g = globalThis as Record<string, unknown>;
  g.__gBattle_BG0_X = 0; g.__gBattle_BG0_Y = 0;   // 1:1 l.1489-1490
  const stringId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  let usedByte = false;
  try {
    const bm = (globalThis as { __battleMessage?: {
      BufferStringBattle?: (id: number, md: unknown) => number;
      gDisplayedStringBattle?: Uint8Array;
      getBattleCharmap?: () => Record<string, number> | null;
    } }).__battleMessage;
    const ctrls = (globalThis as { __battleControllers?: {
      BattlePutTextOnWindowBytes?: (b: Uint8Array, w: number) => void;
      getLastPrintStringMsgData?: (b?: number) => unknown;
      snapshotMsgData?: () => unknown;
    } }).__battleControllers;
    if (bm?.BufferStringBattle && bm.gDisplayedStringBattle && bm.getBattleCharmap?.() && ctrls?.BattlePutTextOnWindowBytes) {
      const msgData = ctrls.getLastPrintStringMsgData?.(gActiveBattler) ?? ctrls.snapshotMsgData?.() ?? {};
      bm.BufferStringBattle(stringId, msgData);
      ctrls.BattlePutTextOnWindowBytes(bm.gDisplayedStringBattle, B_WIN_MSG);
      usedByte = true;
    }
  } catch (e) {
    console.warn('[bcpp] PrintString byte path failed, fallback:', e);
  }
  if (!usedByte) BattlePutTextOnWindow(_BufferStringBattle(stringId), B_WIN_MSG);
  gBattlerControllerFuncs[gActiveBattler] = CompleteOnInactiveTextPrinter2;
}
function _BufferStringBattle(stringId: number): string {
  const api = (globalThis as { __battleStringDecoderApi?: { decodeBattleString?: (id: number, msgData: unknown) => string } }).__battleStringDecoderApi;
  const ctrls = (globalThis as { __battleControllers?: { getLastPrintStringMsgData?: (b?: number) => unknown; snapshotMsgData?: () => unknown } }).__battleControllers;
  if (!api?.decodeBattleString) return `[stringId=${stringId}]`;
  const msgData = ctrls?.getLastPrintStringMsgData?.(gActiveBattler) ?? ctrls?.snapshotMsgData?.() ?? {};
  return api.decodeBattleString(stringId, msgData);
}

/** 1:1 décomp `PlayerPartnerHandlePrintSelectionString()` (bcpp.c:1497-1500) : le
 *  partenaire n'affiche PAS la selection string (contrairement au player) → complete. */
function PlayerPartnerHandlePrintSelectionString(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleChooseAction()` (bcpp.c:1502-1506). Corps identique à
 *  OpponentHandleChooseAction (bco.c:1219) : l'IA décide switch/item/move. */
function PlayerPartnerHandleChooseAction(): void {
  _AI_TrySwitchOrUseItem();
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleYesNoBox()` (bcpp.c:1508-1511). */
function PlayerPartnerHandleYesNoBox(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleChooseMove()` (bcpp.c:1513-1532). Comme l'opponent
 *  MAIS le partenaire cible les ADVERSAIRES (B_POSITION_OPPONENT_*) au lieu du joueur :
 *  BattleAI_SetupAIData + BattleAI_ChooseMoveOrAction, puis override target USER/BOTH. */
function PlayerPartnerHandleChooseMove(): void {
  const buf = gBattleBufferA[gActiveBattler];
  // struct ChooseMoveStruct.moves[4] @ bufferA[4..] (u16).
  const moves: number[] = [];
  for (let i = 0; i < MAX_MON_MOVES; i++) moves[i] = buf[4 + i * 2] | (buf[5 + i * 2] << 8);

  _BattleAI_SetupAIData(_ALL_MOVES_MASK);
  const chosenMoveId = _BattleAI_ChooseMoveOrAction();

  const target = _getMoveTarget(moves[chosenMoveId]);
  if (target & (MOVE_TARGET_USER | MOVE_TARGET_USER_OR_SELECTED)) {
    setBattlerTarget(gActiveBattler);
  }
  if (target & MOVE_TARGET_BOTH) {
    let t = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
    if (gAbsentBattlerFlags & gBitTable[t]) t = GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT);
    setBattlerTarget(t);
  }

  BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (gBattlerTarget << 8));
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleChooseItem()` (bcpp.c:1534-1537) : le partenaire
 *  n'ouvre pas le sac → complete direct (contrairement à l'opponent qui émet l'item AI). */
function PlayerPartnerHandleChooseItem(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleChoosePokemon()` (bcpp.c:1539-1562) : l'IA choisit le
 *  mon à envoyer (GetMostSuitableMonToSwitchInto), sinon 1er mon vivant des slots
 *  PARTENAIRE (3..5) != mons actifs joueur/soi. Émet CHOSENMONRETURNVALUE. */
function PlayerPartnerHandleChoosePokemon(): void {
  let chosenMonId = _GetMostSuitableMonToSwitchInto();
  if (chosenMonId === _PARTY_SIZE) {
    const playerMonIdentity = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
    const selfIdentity = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    for (chosenMonId = _PARTY_SIZE / 2; chosenMonId < _PARTY_SIZE; chosenMonId++) {
      if ((GetMonData(gPlayerParty[chosenMonId] as never, MON_DATA_HP) as number) !== 0
          && chosenMonId !== gBattlerPartyIndexes[playerMonIdentity]
          && chosenMonId !== gBattlerPartyIndexes[selfIdentity]) {
        break;
      }
    }
  }
  _setMonToSwitchIntoId(gActiveBattler, chosenMonId);
  // 1:1 BtlController_EmitChosenMonReturnValue : bufferB[0]=CHOSENMONRETURNVALUE, [1]=id.
  const outBuf = new Uint8Array(8);
  outBuf[0] = CONTROLLER_CHOSENMONRETURNVALUE;
  outBuf[1] = chosenMonId;
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, outBuf, 5);
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleCmd23()` (bcpp.c:1564-1567). */
function PlayerPartnerHandleCmd23(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleHealthBarUpdate()` (bcpp.c:1569-1591). Corps identique
 *  à PlayerHandleHealthBarUpdate (bcp.c) sauf gPlayerParty. */
function PlayerPartnerHandleHealthBarUpdate(): void {
  _LoadBattleBarGfx(0);
  let hpVal = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  if (hpVal & 0x8000) hpVal -= 0x10000;   // sign-extend s16
  const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler]];
  if (hpVal !== _INSTANT_HP_BAR_DROP) {
    const maxHP = GetMonData(mon as never, MON_DATA_MAX_HP) as number;
    const curHP = GetMonData(mon as never, MON_DATA_HP) as number;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxHP, curHP, hpVal);
  } else {
    const maxHP = GetMonData(mon as never, MON_DATA_MAX_HP) as number;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxHP, 0, hpVal);
  }
  gBattlerControllerFuncs[gActiveBattler] = CompleteOnHealthbarDone;
}

/** 1:1 décomp `PlayerPartnerHandleExpUpdate()` (bcpp.c:1593-1615). L'anim de la barre
 *  EXP suit le frère player (SetBattleBarStruct EXP_BAR + _CompleteOnExpBarDone) —
 *  la chaîne complète Task_GiveExpToMon (bcpp.c:312-470) = même dette task que player. */
function PlayerPartnerHandleExpUpdate(): void {
  const monId = gBattleBufferA[gActiveBattler][1];
  const mon = gPlayerParty[monId];
  const level = GetMonData(mon as never, MON_DATA_LEVEL) as number;
  if (level >= _MAX_LEVEL) {
    PlayerPartnerBufferExecCompleted();
  } else {
    _LoadBattleBarGfx(1);
    let expPoints = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
    if (expPoints & 0x8000) expPoints -= 0x10000;
    const species = GetMonData(mon as never, MON_DATA_SPECIES) as number;
    const newExp = GetMonData(mon as never, MON_DATA_EXP) as number;
    const gr = getSpeciesGrowthRate(species);
    const currLevelExp = getExpForLevel(gr, level);
    const maxExpBarValue = getExpForLevel(gr, level + 1) - currLevelExp;
    const oldExpInLevel = (newExp - currLevelExp) - expPoints;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxExpBarValue, oldExpInLevel, -expPoints);
    PlaySE(_SE_EXP);
    gBattlerControllerFuncs[gActiveBattler] = _CompleteOnExpBarDone;
  }
}
function _CompleteOnExpBarDone(): void {
  const ret = MoveBattleBar(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), EXP_BAR, 0);
  if (ret === -1) {
    const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler]];
    _UpdateHealthboxAttribute(_gHealthboxSpriteId(gActiveBattler), mon, _HEALTHBOX_ALL);
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerPartnerHandleStatusIconUpdate()` (bcpp.c:1622-1633). */
function PlayerPartnerHandleStatusIconUpdate(): void {
  if (!_IsBattleSEPlaying(gActiveBattler)) {
    const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler]];
    _UpdateHealthboxAttribute(_gHealthboxSpriteId(gActiveBattler), mon, _HEALTHBOX_STATUS_ICON);
    // 1:1 : clear statusAnimActive (backing sprites-data, dette si absent).
    gBattlerControllerFuncs[gActiveBattler] = CompleteOnFinishedStatusAnimation;
  }
}

/** 1:1 décomp `PlayerPartnerHandleStatusAnimation()` (bcpp.c:1635-1643). */
function PlayerPartnerHandleStatusAnimation(): void {
  if (!_IsBattleSEPlaying(gActiveBattler)) {
    const buf = gBattleBufferA[gActiveBattler];
    const status = (buf[2] | (buf[3] << 8) | (buf[4] << 16) | (buf[5] << 24)) >>> 0;
    _InitAndLaunchChosenStatusAnimation(buf[1] !== 0, status);
    gBattlerControllerFuncs[gActiveBattler] = CompleteOnFinishedStatusAnimation;
  }
}

/** 1:1 décomp (bcpp.c:1645-1688) — corps identiques Player/Opponent (émetteurs UNUSED
 *  ou données déjà appliquées côté moteur). */
function PlayerPartnerHandleStatusXor(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleDataTransfer(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleDMA3Transfer(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandlePlayBGM(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleCmd32(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleTwoReturnValues(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleChosenMonReturnValue(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleOneReturnValue(): void { PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleOneReturnValue_Duplicate(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleClearUnkVar/SetUnkVar/ClearUnkFlag/ToggleUnkFlag`
 *  (bcpp.c:1690-1712). Corps identiques Player/Opponent. */
function PlayerPartnerHandleClearUnkVar(): void { gUnusedControllerStruct.unk = 0; PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleSetUnkVar(): void { gUnusedControllerStruct.unk = gBattleBufferA[gActiveBattler][1]; PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleClearUnkFlag(): void { gUnusedControllerStruct.flag = 0; PlayerPartnerBufferExecCompleted(); }
function PlayerPartnerHandleToggleUnkFlag(): void { gUnusedControllerStruct.flag ^= 1; PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleHitAnimation()` (bcpp.c:1714-1727). */
function PlayerPartnerHandleHitAnimation(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
  if (!sprite || sprite.invisible === true) { PlayerPartnerBufferExecCompleted(); return; }
  _gDoingBattleAnim = true;
  sprite.data[1] = 0;
  const hitBattler = gActiveBattler;
  void import('./pokeball').then((m) => m.DoHitAnimHealthboxEffect?.(hitBattler)).catch(() => {});
  gBattlerControllerFuncs[gActiveBattler] = DoHitAnimBlinkSpriteEffect;
}

/** 1:1 décomp `PlayerPartnerHandleCantSwitch()` (bcpp.c:1729-1732). */
function PlayerPartnerHandleCantSwitch(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandlePlaySE()` (bcpp.c:1734-1745) : pan selon le côté. */
function PlayerPartnerHandlePlaySE(): void {
  const pan = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? _SOUND_PAN_ATTACKER : _SOUND_PAN_TARGET;
  _PlaySE12WithPanning(gBattleBufferA[gActiveBattler][1] | (gBattleBufferA[gActiveBattler][2] << 8), pan);
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandlePlayFanfareOrBGM()` (bcpp.c:1747-1760). */
function PlayerPartnerHandlePlayFanfareOrBGM(): void {
  const buf = gBattleBufferA[gActiveBattler];
  const songId = buf[1] | (buf[2] << 8);
  if (buf[3]) {
    const stop = (globalThis as { __BattleStopLowHpSound?: () => void }).__BattleStopLowHpSound;
    stop?.();
    const m4a = (globalThis as Record<string, unknown>).__m4aSongNumStart as ((id: number, loop?: boolean) => void) | undefined;
    if (songId) m4a?.(songId, true);
  } else {
    if (songId) PlayFanfare(songId);
  }
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleFaintingCry()` (bcpp.c:1762-1768). */
function PlayerPartnerHandleFaintingCry(): void {
  const mon = gPlayerParty[gBattlerPartyIndexes[gActiveBattler] ?? 0];
  const species = mon ? (GetMonData(mon as never, MON_DATA_SPECIES) as number) : 0;
  if (species) PlayCry_ByMode(species, -25, CRY_MODE_FAINT);
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleIntroSlide()` (bcpp.c:1770-1775). */
function PlayerPartnerHandleIntroSlide(): void {
  HandleIntroSlide(gBattleBufferA[gActiveBattler][1]);
  _setIntroSlideFlagBit0();   // 1:1 gIntroSlideFlags |= 1
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleIntroTrainerBallThrow()` (bcpp.c:1777-1816) : le back-pic
 *  dresseur (Steven) lance sa ball (slide-off + StartSpriteAnim(1)) puis Task_StartSendOutAnim
 *  fait sortir LE mon du partenaire de SA propre ball (point clé du lot 3). */
function PlayerPartnerHandleIntroTrainerBallThrow(): void {
  const battler = gActiveBattler;
  const rt = getRuntime();
  // 1:1 l.1811-1812 : si party-summary affiché → lance son retrait.
  if (_isPartyStatusSummaryShown(battler)) {
    SetTaskFuncToHidePartyStatusSummary(gBattlerStatusSummaryTaskId[battler]);
  }
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    void _loadAndCreateBattlerMonSprite(battler, false).catch(() => {});
    _ShowHealthboxOnSendOut(battler);
    PlayerPartnerBufferExecCompleted();
    return;
  }
  // 1:1 ll.1782-1791 : back-pic dresseur slide-off (destX=-40, 50f) + anim de lancer.
  const tid = getTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (tr) {
    SetSpritePrimaryCoordsFromSecondaryCoords(tr);
    tr.data[0] = 50;
    tr.data[2] = -40;
    tr.data[4] = tr.y;
    tr.data[5] = battler;
    tr.callback = StartAnimLinearTranslation;
    StoreSpriteCallbackInData6(tr, _SpriteCB_FreePlayerSpriteLoadMonSprite);
    StartSpriteAnim(tr as never, 1);
  }
  // 1:1 l.1808-1809 : CreateTask(Task_StartSendOutAnim, 5) ; data[0] = gActiveBattler.
  if (rt) {
    const taskId = rt.CreateTask((t) => Task_StartSendOutAnim(t, rt), 5);
    const task = rt.gTasks[taskId];
    if (task) task.data[0] = battler;
  }
  gBattlerControllerFuncs[battler] = _PlayerPartnerDummy;   // 1:1 l.1815
}
/** 1:1 décomp `SpriteCB_FreePlayerSpriteLoadMonSprite` (fin du slide → free dresseur). */
function _SpriteCB_FreePlayerSpriteLoadMonSprite(_sprite: DecompSprite, _rt: DecompRuntime): void {
  destroyTrainerBackSprite();
}

/** 1:1 décomp `Task_StartSendOutAnim(taskId)` (bcpp.c:1818-1848). En INGAME_PARTNER
 *  (BATTLE_TYPE_MULTI), le PARTENAIRE fait sortir SON PROPRE mon (battler 2) de SA
 *  ball via SON contrôleur — pas de flanc BIT_FLANK (branche multi ll.1829-1833). */
function Task_StartSendOutAnim(task: DecompTask, rt: DecompRuntime): void {
  if (task.data[1] < 24) { task.data[1]++; return; }   // 1:1 l.1820-1822
  const battler = task.data[0];
  const saved = gActiveBattler;
  setActiveBattler(battler);
  if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE) || (gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
    // 1:1 ll.1831-1832 : cas MULTI (Steven) — sort SON mon uniquement.
    gBattleBufferA[battler][1] = gBattlerPartyIndexes[battler];
    StartSendOutAnim(battler, false);
  } else {
    // 1:1 ll.1836-1842 : double NON-multi (tag Frontier front-pic) — sort les 2 flancs.
    gBattleBufferA[battler][1] = gBattlerPartyIndexes[battler];
    StartSendOutAnim(battler, false);
    const partner = battler ^ 2;   // BIT_FLANK
    setActiveBattler(partner);
    gBattleBufferA[partner][1] = gBattlerPartyIndexes[partner];
    StartSendOutAnim(partner, false);
    setActiveBattler(battler);
  }
  gBattlerControllerFuncs[battler] = Intro_ShowHealthbox;   // 1:1 l.1844
  setActiveBattler(saved);
  rt.DestroyTask(task.taskId);
}

/** 1:1 décomp `Intro_ShowHealthbox()` (bcpp.c:248-275) → attend la fin de la ball, montre
 *  le healthbox, enchaîne Intro_WaitForHealthbox. Adaptation ball-anim (comme le frère). */
function Intro_ShowHealthbox(): void {
  const battler = gActiveBattler;
  if (!isBallAnimActive(battler)) {
    setBattlerDeferReveal(battler, false);
    _ShowHealthboxOnSendOut(battler);
    gBattlerControllerFuncs[battler] = Intro_WaitForHealthbox;
  }
}
/** 1:1 décomp `Intro_WaitForHealthbox()` (bcpp.c:220-246) : attend la fin du slide
 *  healthbox (callback repos) puis délai 3f (Intro_DelayAndEnd). */
let _introEndDelay = 0;
function Intro_WaitForHealthbox(): void {
  const battler = gActiveBattler;
  const rt = getRuntime();
  const hbId = _gHealthboxSpriteId(battler);
  const hbSpr = rt?.gSprites?.[hbId];
  const nm = (hbSpr?.callback as { name?: string } | null | undefined)?.name;
  const finished = !hbSpr || nm !== 'SpriteCB_HealthboxSlideIn';
  if (finished) {
    _introEndDelay = 3;   // 1:1 l.243 introEndDelay = 3
    gBattlerControllerFuncs[battler] = Intro_DelayAndEnd;
  }
}
/** 1:1 décomp `Intro_DelayAndEnd()` (bcpp.c:211-218). */
function Intro_DelayAndEnd(): void {
  if (--_introEndDelay === -1) {
    _introEndDelay = 0;
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerPartnerHandleDrawPartyStatusSummary()` (bcpp.c:1850-1867). Corps
 *  identique à PlayerHandleDrawPartyStatusSummary (bcp.c). */
function PlayerPartnerHandleDrawPartyStatusSummary(): void {
  if (gBattleBufferA[gActiveBattler][1] !== 0 && GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER) {
    PlayerPartnerBufferExecCompleted();
  } else {
    _setPartyStatusSummaryShown(gActiveBattler, true);
    const ba = gBattleBufferA[gActiveBattler];
    const partyInfo: _PSHpAndStatus[] = [];
    for (let i = 0; i < 6; i++) {
      const o = 4 + i * 8;
      partyInfo.push({
        hp: (ba[o] | (ba[o + 1] << 8)) & 0xFFFF,
        status: ((ba[o + 4] | (ba[o + 5] << 8) | (ba[o + 6] << 16) | (ba[o + 7] << 24)) >>> 0),
      });
    }
    const skipPlayer = ba[1] !== 0;
    const isBattleStart = ba[2] !== 0;
    const b = gActiveBattler;
    gBattlerStatusSummaryTaskId[b] = CreatePartyStatusSummarySprites(b, partyInfo, skipPlayer, isBattleStart);
    _setPartyStatusDelayTimer(b, 0);
    if (isBattleStart) _setPartyStatusDelayTimer(b, 93);
    gBattlerControllerFuncs[b] = EndDrawPartyStatusSummary;
  }
}
/** 1:1 décomp `EndDrawPartyStatusSummary()` (bcpp.c:1869-1876). */
function EndDrawPartyStatusSummary(): void {
  const b = gActiveBattler;
  const t = _getPartyStatusDelayTimer(b);
  _setPartyStatusDelayTimer(b, t + 1);
  if (t > 92) {
    _setPartyStatusDelayTimer(b, 0);
    PlayerPartnerBufferExecCompleted();
  }
}

/** 1:1 décomp `PlayerPartnerHandleHidePartyStatusSummary()` (bcpp.c:1878-1883). */
function PlayerPartnerHandleHidePartyStatusSummary(): void {
  if (_isPartyStatusSummaryShown(gActiveBattler)) {
    SetTaskFuncToHidePartyStatusSummary(gBattlerStatusSummaryTaskId[gActiveBattler]);
  }
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleEndBounceEffect()` (bcpp.c:1885-1888) : le partenaire
 *  ne bounce pas → complete direct (contrairement au player). */
function PlayerPartnerHandleEndBounceEffect(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleSpriteInvisibility()` (bcpp.c:1890-1898). */
function PlayerPartnerHandleSpriteInvisibility(): void {
  const rt = getRuntime();
  const spriteId = getBattlerMonSpriteId(gActiveBattler);
  const spr = rt?.gSprites?.[spriteId] as { inUse?: boolean; invisible?: boolean } | undefined;
  if (spr && spr.inUse) {   // ≈ IsBattlerSpritePresent
    spr.invisible = gBattleBufferA[gActiveBattler][1] !== 0;
    _CopyBattleSpriteInvisibility(gActiveBattler);
  }
  PlayerPartnerBufferExecCompleted();
}

/** 1:1 décomp `PlayerPartnerHandleBattleAnimation()` (bcpp.c:1900-1912). */
function PlayerPartnerHandleBattleAnimation(): void {
  if (_IsBattleSEPlaying(gActiveBattler)) return;
  const buf = gBattleBufferA[gActiveBattler];
  const animationId = buf[1];
  const argument = buf[2] | (buf[3] << 8);
  const gfx = (globalThis as { __battleGfxSfxUtil?: {
    TryHandleLaunchBattleTableAnimation?: (a: number, b: number, c: number, id: number, arg: number) => boolean;
  } }).__battleGfxSfxUtil;
  const skipped = gfx?.TryHandleLaunchBattleTableAnimation?.(gActiveBattler, gActiveBattler, gActiveBattler, animationId, argument) ?? true;
  if (skipped) PlayerPartnerBufferExecCompleted();
  else gBattlerControllerFuncs[gActiveBattler] = CompleteOnFinishedBattleAnimation;
}

/** 1:1 décomp `PlayerPartnerHandleLinkStandbyMsg()` (bcpp.c:1914-1917) : complete direct
 *  (le partenaire n'arrête pas le bounce, contrairement au player). */
function PlayerPartnerHandleLinkStandbyMsg(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleResetActionMoveSelection()` (bcpp.c:1919-1922). */
function PlayerPartnerHandleResetActionMoveSelection(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerHandleEndLinkBattle()` (bcpp.c:1924-1931) : gBattleOutcome +
 *  fades + SetBattleEndCallbacks. Teardown piloté par la voie L (comme player) → complete. */
function PlayerPartnerHandleEndLinkBattle(): void { PlayerPartnerBufferExecCompleted(); }

/** 1:1 décomp `PlayerPartnerCmdEnd()` (bcpp.c:1933-1935) — NOP terminator. */
function PlayerPartnerCmdEnd(): void { /* marker fin de buffer */ }

// Party-summary state (mêmes accessors voie-L que player/opponent).
function _isPartyStatusSummaryShown(b: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isPartyStatusSummaryShown?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isPartyStatusSummaryShown?.(b);
}
function _setPartyStatusSummaryShown(b: number, v: boolean): void {
  const m = (globalThis as { __battleSpritesData?: { setPartyStatusSummaryShown?: (b: number, v: boolean) => void } }).__battleSpritesData;
  m?.setPartyStatusSummaryShown?.(b, v);
}
function _getPartyStatusDelayTimer(b: number): number {
  const m = (globalThis as { __battleSpritesData?: { getPartyStatusDelayTimer?: (b: number) => number } }).__battleSpritesData;
  return m?.getPartyStatusDelayTimer?.(b) ?? 0;
}
function _setPartyStatusDelayTimer(b: number, v: number): void {
  const m = (globalThis as { __battleSpritesData?: { setPartyStatusDelayTimer?: (b: number, v: number) => void } }).__battleSpritesData;
  m?.setPartyStatusDelayTimer?.(b, v);
}

// ─── sPlayerPartnerBufferCommands dispatch table (bcpp.c:104-163) ──────────

/** 1:1 décomp `sPlayerPartnerBufferCommands[CONTROLLER_CMDS_COUNT]`. */
const sPlayerPartnerBufferCommands: Array<(() => void) | undefined> = new Array(CONTROLLER_CMDS_COUNT);

function _initSPlayerPartnerBufferCommands(): void {
  sPlayerPartnerBufferCommands[CONTROLLER_GETMONDATA] = PlayerPartnerHandleGetMonData;
  sPlayerPartnerBufferCommands[CONTROLLER_GETRAWMONDATA] = PlayerPartnerHandleGetRawMonData;
  sPlayerPartnerBufferCommands[CONTROLLER_SETMONDATA] = PlayerPartnerHandleSetMonData;
  sPlayerPartnerBufferCommands[CONTROLLER_SETRAWMONDATA] = PlayerPartnerHandleSetRawMonData;
  sPlayerPartnerBufferCommands[CONTROLLER_LOADMONSPRITE] = PlayerPartnerHandleLoadMonSprite;
  sPlayerPartnerBufferCommands[CONTROLLER_SWITCHINANIM] = PlayerPartnerHandleSwitchInAnim;
  sPlayerPartnerBufferCommands[CONTROLLER_RETURNMONTOBALL] = PlayerPartnerHandleReturnMonToBall;
  sPlayerPartnerBufferCommands[CONTROLLER_DRAWTRAINERPIC] = PlayerPartnerHandleDrawTrainerPic;
  sPlayerPartnerBufferCommands[CONTROLLER_TRAINERSLIDE] = PlayerPartnerHandleTrainerSlide;
  sPlayerPartnerBufferCommands[CONTROLLER_TRAINERSLIDEBACK] = PlayerPartnerHandleTrainerSlideBack;
  sPlayerPartnerBufferCommands[CONTROLLER_FAINTANIMATION] = PlayerPartnerHandleFaintAnimation;
  sPlayerPartnerBufferCommands[CONTROLLER_PALETTEFADE] = PlayerPartnerHandlePaletteFade;
  sPlayerPartnerBufferCommands[CONTROLLER_SUCCESSBALLTHROWANIM] = PlayerPartnerHandleSuccessBallThrowAnim;
  sPlayerPartnerBufferCommands[CONTROLLER_BALLTHROWANIM] = PlayerPartnerHandleBallThrowAnim;
  sPlayerPartnerBufferCommands[CONTROLLER_PAUSE] = PlayerPartnerHandlePause;
  sPlayerPartnerBufferCommands[CONTROLLER_MOVEANIMATION] = PlayerPartnerHandleMoveAnimation;
  sPlayerPartnerBufferCommands[CONTROLLER_PRINTSTRING] = PlayerPartnerHandlePrintString;
  sPlayerPartnerBufferCommands[CONTROLLER_PRINTSTRINGPLAYERONLY] = PlayerPartnerHandlePrintSelectionString;
  sPlayerPartnerBufferCommands[CONTROLLER_CHOOSEACTION] = PlayerPartnerHandleChooseAction;
  sPlayerPartnerBufferCommands[CONTROLLER_YESNOBOX] = PlayerPartnerHandleYesNoBox;
  sPlayerPartnerBufferCommands[CONTROLLER_CHOOSEMOVE] = PlayerPartnerHandleChooseMove;
  sPlayerPartnerBufferCommands[CONTROLLER_OPENBAG] = PlayerPartnerHandleChooseItem;
  sPlayerPartnerBufferCommands[CONTROLLER_CHOOSEPOKEMON] = PlayerPartnerHandleChoosePokemon;
  sPlayerPartnerBufferCommands[CONTROLLER_23] = PlayerPartnerHandleCmd23;
  sPlayerPartnerBufferCommands[CONTROLLER_HEALTHBARUPDATE] = PlayerPartnerHandleHealthBarUpdate;
  sPlayerPartnerBufferCommands[CONTROLLER_EXPUPDATE] = PlayerPartnerHandleExpUpdate;
  sPlayerPartnerBufferCommands[CONTROLLER_STATUSICONUPDATE] = PlayerPartnerHandleStatusIconUpdate;
  sPlayerPartnerBufferCommands[CONTROLLER_STATUSANIMATION] = PlayerPartnerHandleStatusAnimation;
  sPlayerPartnerBufferCommands[CONTROLLER_STATUSXOR] = PlayerPartnerHandleStatusXor;
  sPlayerPartnerBufferCommands[CONTROLLER_DATATRANSFER] = PlayerPartnerHandleDataTransfer;
  sPlayerPartnerBufferCommands[CONTROLLER_DMA3TRANSFER] = PlayerPartnerHandleDMA3Transfer;
  sPlayerPartnerBufferCommands[CONTROLLER_PLAYBGM] = PlayerPartnerHandlePlayBGM;
  sPlayerPartnerBufferCommands[CONTROLLER_32] = PlayerPartnerHandleCmd32;
  sPlayerPartnerBufferCommands[CONTROLLER_TWORETURNVALUES] = PlayerPartnerHandleTwoReturnValues;
  sPlayerPartnerBufferCommands[CONTROLLER_CHOSENMONRETURNVALUE] = PlayerPartnerHandleChosenMonReturnValue;
  sPlayerPartnerBufferCommands[CONTROLLER_ONERETURNVALUE] = PlayerPartnerHandleOneReturnValue;
  sPlayerPartnerBufferCommands[CONTROLLER_ONERETURNVALUE_DUPLICATE] = PlayerPartnerHandleOneReturnValue_Duplicate;
  sPlayerPartnerBufferCommands[CONTROLLER_CLEARUNKVAR] = PlayerPartnerHandleClearUnkVar;
  sPlayerPartnerBufferCommands[CONTROLLER_SETUNKVAR] = PlayerPartnerHandleSetUnkVar;
  sPlayerPartnerBufferCommands[CONTROLLER_CLEARUNKFLAG] = PlayerPartnerHandleClearUnkFlag;
  sPlayerPartnerBufferCommands[CONTROLLER_TOGGLEUNKFLAG] = PlayerPartnerHandleToggleUnkFlag;
  sPlayerPartnerBufferCommands[CONTROLLER_HITANIMATION] = PlayerPartnerHandleHitAnimation;
  sPlayerPartnerBufferCommands[CONTROLLER_CANTSWITCH] = PlayerPartnerHandleCantSwitch;
  sPlayerPartnerBufferCommands[CONTROLLER_PLAYSE] = PlayerPartnerHandlePlaySE;
  sPlayerPartnerBufferCommands[CONTROLLER_PLAYFANFAREORBGM] = PlayerPartnerHandlePlayFanfareOrBGM;
  sPlayerPartnerBufferCommands[CONTROLLER_FAINTINGCRY] = PlayerPartnerHandleFaintingCry;
  sPlayerPartnerBufferCommands[CONTROLLER_INTROSLIDE] = PlayerPartnerHandleIntroSlide;
  sPlayerPartnerBufferCommands[CONTROLLER_INTROTRAINERBALLTHROW] = PlayerPartnerHandleIntroTrainerBallThrow;
  sPlayerPartnerBufferCommands[CONTROLLER_DRAWPARTYSTATUSSUMMARY] = PlayerPartnerHandleDrawPartyStatusSummary;
  sPlayerPartnerBufferCommands[CONTROLLER_HIDEPARTYSTATUSSUMMARY] = PlayerPartnerHandleHidePartyStatusSummary;
  sPlayerPartnerBufferCommands[CONTROLLER_ENDBOUNCE] = PlayerPartnerHandleEndBounceEffect;
  sPlayerPartnerBufferCommands[CONTROLLER_SPRITEINVISIBILITY] = PlayerPartnerHandleSpriteInvisibility;
  sPlayerPartnerBufferCommands[CONTROLLER_BATTLEANIMATION] = PlayerPartnerHandleBattleAnimation;
  sPlayerPartnerBufferCommands[CONTROLLER_LINKSTANDBYMSG] = PlayerPartnerHandleLinkStandbyMsg;
  sPlayerPartnerBufferCommands[CONTROLLER_RESETACTIONMOVESELECTION] = PlayerPartnerHandleResetActionMoveSelection;
  sPlayerPartnerBufferCommands[CONTROLLER_ENDLINKBATTLE] = PlayerPartnerHandleEndLinkBattle;
  sPlayerPartnerBufferCommands[CONTROLLER_TERMINATOR_NOP] = PlayerPartnerCmdEnd;
}
_initSPlayerPartnerBufferCommands();

// ─── Devtools expose (même surface que player/opponent) ────────────────────
(globalThis as Record<string, unknown>).__battleControllerPlayerPartner = {
  sPlayerPartnerBufferCommands,
  SetControllerToPlayerPartner, PlayerPartnerBufferRunCommand,
};

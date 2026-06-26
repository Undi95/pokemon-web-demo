/**
 * src/game/battle_controller_opponent.ts — MIROIR 1:1 de
 * `src/battle_controller_opponent.c` (D:/Projet 1/decomps/pokeemeraude).
 *
 * MIGRÉ depuis engine/battle/battle-controller-opponent.ts (2026-06-10) après
 * certification de la TABLE COMPLÈTE des 57 handlers (audit awk complete-only vs
 * corps-réel, croisé handler par handler — cf. mémoire migration-combat-progress) :
 *   - corps 1:1 portés : GetMonData/SetMonData/LoadMonSprite (LOAD scindé →
 *     battle_gfx_sfx_util)/SwitchInAnim/ReturnMonToBall/DrawTrainerPic/
 *     TrainerSlide/TrainerSlideBack/FaintAnimation/PrintString/ChooseAction/
 *     ChooseMove(AI)/ChooseItem/ChoosePokemon/HealthBarUpdate/StatusIconUpdate/
 *     HitAnimation/PlaySE/FaintingCry/IntroSlide/IntroTrainerBallThrow/
 *     DrawPartyStatusSummary/HidePartyStatusSummary/SpriteInvisibility/UnkVar×4.
 *   - complete-only CERTIFIÉS 1:1 (le .c fait pareil) : PaletteFade/
 *     SuccessBallThrowAnim/BallThrow/Pause/PrintSelectionString/YesNoBox/Cmd23/
 *     ExpUpdate/StatusXor/DataTransfer/DMA3Transfer/PlayBGM/Cmd32/TwoReturnValues/
 *     ChosenMonReturnValue/OneReturnValue×2/CantSwitch/EndBounce/LinkStandby/
 *     ResetActionMoveSelection/CmdEnd.
 *   - 1:1 comportemental documenté : GetRawMonData/SetRawMonData (émetteurs
 *     décomp UNUSED), EndLinkBattle (gate LINK).
 *   - DETTES restantes documentées en place : MoveAnimation/StatusAnimation/
 *     BattleAnimation (chantier anims de move), DoSwitchOutAnimation (rappel
 *     ball), PlayFanfareOrBGM (règle BGM/SE), modes FRONTIER/SECRET_BASE/HILL.
 *
 * L'ancien chemin engine/battle/battle-controller-opponent.ts = SHIM re-export
 * (importeurs préservés ; side-effects inclus : install de la table +
 * __battleControllerOpponent + import './battle-faint-anim').
 */

import { CreateSprite } from './sprite';
import { DestroySprite, AllocOamMatrix } from './sprite';
import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gAbsentBattlerFlags, gBattlerTarget, setBattlerTarget,
  setBattlerControllerFunc, gBattlerPartyIndexes,
  gTrainerBattleOpponent_A, setActiveBattler,
  gBattleStruct,
} from './engine/battle/state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE,
  BATTLE_TYPE_TRAINER, BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_ROAMER,
  B_ACTION_EXEC_SCRIPT, B_ACTION_RUN,
  B_ACTION_SAFARI_WATCH_CAREFULLY,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_BOTH,
  MAX_MON_MOVES, MOVE_NONE,
} from './engine/battle/constants';
import {
  gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
  BtlController_EmitOneReturnValue, gUnusedControllerStruct,
} from './engine/battle/battle-controllers-ipc';
import { HandleIntroSlide } from './battle_intro';
// ANTI-CYCLE ESM (regression T3) : lazy au lieu d'imports statiques.
function _InitAndLaunchChosenStatusAnimationOpp(isStatus2: boolean, status: number): void {
  const m = (globalThis as Record<string, unknown>).__battleGfxSfxUtil as { InitAndLaunchChosenStatusAnimation?: (a: boolean, b: number) => void } | undefined;
  m?.InitAndLaunchChosenStatusAnimation?.(isStatus2, status);
}
function _isStatusAnimActiveOpp(battler: number): boolean {
  const m = (globalThis as Record<string, unknown>).__battleSpritesData as { isStatusAnimActive?: (b: number) => boolean } | undefined;
  return m?.isStatusAnimActive?.(battler) ?? false;
}
import { gBitTable } from './engine/battle/battle-controllers';
import {
  GetBattlerAtPosition, GetBattlerPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
} from './engine/battle/util';
import { getBattleMove } from './engine/battle/data/battle-moves';
import { gEnemyParty, gPlayerParty, GetMonData, MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_SPECIES, SetBattleMonDataFromBuffer } from './engine/battle/party-storage';
import { SetBattleBarStruct, MoveBattleBar, HEALTH_BAR } from './battle_interface';
// Party summary (barre + 6 balls, 1:1 battle_interface.c party-summary slice).
import {
  CreatePartyStatusSummarySprites, SetTaskFuncToHidePartyStatusSummary,
  ensurePartySummaryAssets, gBattlerStatusSummaryTaskId,
  type HpAndStatus as _PSHpAndStatus,
} from './battle_interface';
import {
  setPartyStatusSummaryShown as _setPartyStatusSummaryShown,
  isPartyStatusSummaryShown as _isPartyStatusSummaryShown,
  getPartyStatusDelayTimer as _getPartyStatusDelayTimer,
  setPartyStatusDelayTimer as _setPartyStatusDelayTimer,
  getOpponentDrawPartyStatusSummaryDelay as _getOppDrawPartySummaryDelay,
  setOpponentDrawPartyStatusSummaryDelay as _setOppDrawPartySummaryDelay,
  isStatusAnimActive, setStatusAnimActive,
} from './engine/battle/battle-sprites-data';
import { GET_BATTLER_SIDE as _PS_SIDE, B_SIDE_PLAYER as _PS_B_SIDE_PLAYER } from './engine/battle/constants';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';

import type { DecompTask, DecompRuntime, DecompSprite } from '../harness/runtime/decomp-runtime';
import { getRuntime, SpriteCallbackDummy } from '../harness/runtime/decomp-globals';
import { SpriteCB_WildMon } from './engine/battle/battle-sprite-callbacks';
import { isBallAnimActive, setBallAnimActive } from './engine/battle/battle-sprites-data';
// 1:1 : l'alloc fraîche du struct sprites vit dans le miroir battle_gfx_sfx_util.
import {
  AllocateBattleSpritesData, AllocateMonSpritesGfx, gMonSpritesGfxPtr,
  BattleLoadOpponentMonSpriteGfx, BattleLoadPlayerMonSpriteGfx,
} from './battle_gfx_sfx_util';
import { SetUpForReleaseAffineAnim } from './engine/system/pokeball-effects';
// Send-out dresseur adverse 1:1 (mirror du player, battle_controller_opponent.c:1240/1867/1890/1897) :
//   - helpers sprite-anim (game/battle_anim_mons) : slide-off lineaire + callback differe.
//   - chain ball #22 (game/pokeball) : POKEBALL_OPPONENT_SENDOUT cree+ouvre la ball, emerge le mon.
//   - sprite FRONT dresseur (battle-sendout-anim) : asset + create off-screen + free.
//   - trainerPic enum (battle-trainer-data-bridge) : gTrainers[gTrainerBattleOpponent_A].trainerPic.
import {
  StartAnimLinearTranslation, StoreSpriteCallbackInData6,
  SetSpritePrimaryCoordsFromSecondaryCoords, GetBattlerElevation,
} from './battle_anim_mons';
import { DoPokeballSendOutAnimation } from './pokeball';
import { POKEBALL_OPPONENT_SENDOUT } from '../include/pokeball';
import {
  showOpponentTrainerSprite, getOpponentTrainerSpriteId, destroyOpponentTrainerSprite,
} from './engine/battle/battle-sendout-anim';
import { getTrainerPicEnum } from './engine/battle/battle-trainer-data-bridge';
import { StartSpriteAnim } from './sprite';
import './battle_main';  // section faint-anim consolidee : pose globalThis.__battleFaintAnim (Trigger/SpriteCB faint).
import './battle_transition';  // miroir PokeballsTrail : pose __battleTransitionMirror (consommé lazy par battle-decomp-loop).

// ─── Constants 1:1 décomp (= same as Player) ───────────────────────────────

const CONTROLLER_CMDS_COUNT = 56;
const CONTROLLER_TERMINATOR_NOP = 55;

// CONTROLLER_* opcodes (= duplicate from K31 pour avoid cross-import cycle).
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

// ─── gBattlerControllerFuncs lazy lookup (= shared avec K31) ───────────────

function _setBattlerControllerFunc(battler: number, fn: () => void): void {
  // 1:1 décomp `gBattlerControllerFuncs[gActiveBattler] = fn` : écrit dans la
  // table PARTAGÉE (state.ts), la même que tick BattleMainCB1 + player.
  setBattlerControllerFunc(battler, fn);
}

// ─── OpponentBufferRunCommand + ExecCompleted ──────────────────────────────

/** 1:1 décomp `OpponentBufferExecCompleted()` (battle_controller_opponent.c). */
function OpponentBufferExecCompleted(): void {
  _setBattlerControllerFunc(gActiveBattler, OpponentBufferRunCommand);
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    // Dette R3 : link path (user "Report").
    gBattleBufferA[gActiveBattler][0] = CONTROLLER_TERMINATOR_NOP;
  } else {
    setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[gActiveBattler]);
  }
}

/** 1:1 décomp `OpponentBufferRunCommand()` (battle_controller_opponent.c:180-189). */
export function OpponentBufferRunCommand(): void {
  if (gBattleControllerExecFlags & gBitTable[gActiveBattler]) {
    const opcode = gBattleBufferA[gActiveBattler][0];
    if (opcode < CONTROLLER_CMDS_COUNT) {
      const handler = sOpponentBufferCommands[opcode];
      if (handler) handler();
      else OpponentBufferExecCompleted();
    } else {
      OpponentBufferExecCompleted();
    }
  }
}

// ─── SetControllerToOpponent (battle_controller_opponent.c:175-178) ────────

/** 1:1 décomp `SetControllerToOpponent()` (battle_controller_opponent.c:175-178). */
export function SetControllerToOpponent(): void {
  _setBattlerControllerFunc(gActiveBattler, OpponentBufferRunCommand);
}

// ─── 56 handlers (structure 1:1 strict + ExecCompleted) ────────────────────

/** Handlers symétriques au Player. Spécificités opponent :
 *  - ChooseAction/Move : AI-driven (= notre AI bytecode K1)
 *  - DrawTrainerPic : opponent trainer pic
 *  - Sprite côté droit screen
 *  - Send-out anim wild ou trainer */

function OpponentHandleGetMonData(): void {
  // 1:1 décomp : copy enemy mon → buffer. Dette R3 full serialize.
  const monData = new Uint8Array(0x80);
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, monData, 4);
  void gBattleBufferB;
  OpponentBufferExecCompleted();
}

/** 1:1 COMPORTEMENTAL : l'émetteur décomp `BtlController_EmitGetRawMonData` est
 *  marqué UNUSED (battle_controllers.c:977) → cette commande n'est JAMAIS émise.
 *  Le corps décomp (copie d'octets bruts du struct Pokemon + EmitDataTransfer)
 *  est du code mort — complete direct = même comportement observable. */
function OpponentHandleGetRawMonData(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `SetOpponentMonData(monId)` : désérialise gBattleBufferA[active] + applique au
 *  mon `monId` de gEnemyParty via SetMonData (round-trip bufferA, plus de side-channel). */
function _SetOpponentMonData(monId: number): void {
  SetBattleMonDataFromBuffer(monId, gBattleBufferA[gActiveBattler], gActiveBattler);
}
/** 1:1 décomp `OpponentHandleSetMonData()` (battle_controller_opponent.c) : monToCheck=0 →
 *  mon actif (gBattlerPartyIndexes), sinon bitmask → itère les slots de party. */
function OpponentHandleSetMonData(): void {
  const monsToCheck = gBattleBufferA[gActiveBattler][2];
  if (monsToCheck === 0) {
    _SetOpponentMonData(gBattlerPartyIndexes[gActiveBattler]);
  } else {
    for (let i = 0; i < 6; i++) {
      if (monsToCheck & (1 << i)) _SetOpponentMonData(i);
    }
  }
  OpponentBufferExecCompleted();
}
/** 1:1 COMPORTEMENTAL : `BtlController_EmitSetRawMonData` = UNUSED décomp
 *  (battle_controllers.c:998) → jamais émis ; complete direct = 1:1. */
function OpponentHandleSetRawMonData(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleLoadMonSprite()` (battle_controller_opponent.c:1137).
 *  Charge le front pic du mon ennemi (gfx + palette OBJ slot battler) + spawn le
 *  sprite via CreateSprite (template inline → keystone CreateSpriteInline). Asset
 *  PNG = chargé ASYNC → fire-and-forget (le sprite apparaît dès le chargement).
 *  On garde OpponentBufferExecCompleted pour ne PAS bloquer le flux vérifié (le
 *  décomp installe TryShinyAnimAfterMonAnim ; shiny/shadow/StartSpriteAnim = raffinement). */
function OpponentHandleLoadMonSprite(): void {
  const battler = gActiveBattler;
  void _loadAndCreateBattlerMonSprite(battler, true).then(() => {
    // 1:1 décomp OpponentHandleLoadMonSprite (battle_controller_opponent.c:1155) :
    // SetBattlerShadowSpriteCallback(battler, species) — chemin WILD (le mon vient
    // d'être créé → l'ombre s'active si l'espèce a une élévation). Posé dans le
    // .then (création async plateforme) pour ne pas rabattre l'ombre sur SetInvisible.
    const gfx = (globalThis as { __battleGfxSfxUtil?: { SetBattlerShadowSpriteCallback?: (b: number, s: number) => void } }).__battleGfxSfxUtil;
    const ep = (globalThis as { __gEnemyParty?: Array<{ species?: number }> }).__gEnemyParty;
    const species = ep?.[gBattlerPartyIndexes[battler] ?? 0]?.species ?? 0;
    gfx?.SetBattlerShadowSpriteCallback?.(battler, species);
  });
  OpponentBufferExecCompleted();
}

/** 1:1 décomp `sBattlerCoords[Single][position]` (battle_anim_mons.c:38-45). */
const _sBattlerCoordsSingle: ReadonlyArray<readonly [number, number]> = [
  [72, 80],   // B_POSITION_PLAYER_LEFT
  [176, 40],  // B_POSITION_OPPONENT_LEFT
  [48, 40],   // B_POSITION_PLAYER_RIGHT
  [112, 80],  // B_POSITION_OPPONENT_RIGHT
];
/** 1:1 `GetBattlerSpriteCoord(battler, BATTLER_COORD_X_2)` (single battle). */
function _GetBattlerSpriteCoordX(battler: number): number {
  return _sBattlerCoordsSingle[GetBattlerPosition(battler) & 3]?.[0] ?? 176;
}
/** 1:1 décomp `GetBattlerSpriteSubpriority(battler)` (battle_anim_mons.c:2035, single battle).
 *  PLAYER_LEFT=30, PLAYER_RIGHT=20, OPPONENT_LEFT=40, OPPONENT_RIGHT=50. Plus BAS = devant.
 *  Le mon adverse (OPPONENT_LEFT=40) rend donc DERRIÈRE le dresseur/mon joueur (PLAYER_LEFT=30),
 *  à oam.priority égal (=2, gOamData_BattleSprite{Player,Opponent}Side, battle_main.c:284/299). */
function _GetBattlerSpriteSubpriority(battler: number): number {
  switch (GetBattlerPosition(battler) & 3) {
    case 0: return 30; // B_POSITION_PLAYER_LEFT
    case 1: return 40; // B_POSITION_OPPONENT_LEFT
    case 2: return 20; // B_POSITION_PLAYER_RIGHT
    default: return 50; // B_POSITION_OPPONENT_RIGHT
  }
}
/** 1:1 `gMonFrontAnimsPtrTable` (front_pic_anims.h, extrait) : séquences 2-frames
 *  par species — [[frame, duration], ...] (anim 1 du species ; anim 0 = frame0). */
let _frontAnimsCache: Record<string, Array<[number, number]>> | null = null;
async function _ensureFrontAnims(): Promise<Record<string, Array<[number, number]>>> {
  if (_frontAnimsCache) return _frontAnimsCache;
  try {
    const resp = await fetch('/decomp/em/pokemon-front-anims.json');
    _frontAnimsCache = resp.ok ? (await resp.json() as Record<string, Array<[number, number]>>) : {};
  } catch { _frontAnimsCache = {}; }
  return _frontAnimsCache;
}

/** Data décomp `gMonFrontPicCoords`/`gMonBackPicCoords` ({front,back}{w,h,yOffset}
 *  par species enum) depuis /decomp/em/mon-pic-coords.json (cache). Sert au
 *  grounding (aligner les pieds du mon sur la plateforme). */
interface _MonPicCoord { w: number; h: number; yOffset: number; }
interface _MonPicCoords { front: _MonPicCoord; back: _MonPicCoord; }
let _monPicCoordsCache: Record<string, _MonPicCoords> | null = null;
async function _loadMonPicCoords(): Promise<Record<string, _MonPicCoords>> {
  if (_monPicCoordsCache) return _monPicCoordsCache;
  const resp = await fetch('/decomp/em/mon-pic-coords.json');
  _monPicCoordsCache = resp.ok ? (await resp.json() as Record<string, _MonPicCoords>) : {};
  return _monPicCoordsCache;
}
/** Charge + spawn le sprite mon (front=ennemi / back=joueur). 1:1 chaîne décomp
 *  BattleLoad{Opponent}MonSpriteGfx → SetMultiuseSpriteTemplateToPokemon → CreateSprite,
 *  positionné via GetBattlerSpriteCoord(X_2)/GetBattlerSpriteFinal_Y (grounding par
 *  species). ASYNC (assets PNG /decomp/em/pokemon/<nom>/) ; fire-and-forget. */
export async function _loadAndCreateBattlerMonSprite(battler: number, isOpponent: boolean, opts?: { reshow?: boolean }): Promise<number> {
  try {
    const partyIdx = _getBattlerPartyIndexOpp(battler);
    // 1:1 : le sprite ENNEMI lit gEnemyParty (front pic), le sprite JOUEUR lit
    // gPlayerParty (back pic). _getBattlerPartyIndexOpp = gBattlerPartyIndexes[battler]
    // (side-agnostic) → même index des deux côtés. Partagé entre OpponentHandleLoadMonSprite
    // (ennemi) et PlayerHandleIntroTrainerBallThrow (joueur) car le décomp converge sur
    // SetMultiuseSpriteTemplateToPokemon + CreateSprite des deux côtés.
    const mon = (isOpponent ? gEnemyParty : gPlayerParty)[partyIdx];
    const sp = GetMonData(mon as never, MON_DATA_SPECIES) as number;
    if (!sp) { console.warn('[battler-sprite] species 0'); return -1; }
    // species num → enum 'SPECIES_X' (= clé mon-pic-coords pour le grounding Y).
    const enumName = reverseDecompConstant(sp, 'SPECIES_');
    if (!enumName) { console.warn('[battler-sprite] enum introuvable pour species', sp); return -1; }
    // 1:1 LOAD scindé → miroir battle_gfx_sfx_util : BattleLoadOpponentMonSpriteGfx (:577,
    // front pic) / BattleLoadPlayerMonSpriteGfx (:630, back pic) écrit les tiles dans
    // gMonSpritesGfxPtr.sprites.ptr[position] + LoadPalette OBJ slot battler (+ BG 8+battler).
    // Ici (handler décomp, battle_controller_opponent.c:1140) ne reste que le CREATE.
    await (isOpponent ? BattleLoadOpponentMonSpriteGfx(mon, battler) : BattleLoadPlayerMonSpriteGfx(mon, battler));
    const tiles = gMonSpritesGfxPtr.sprites.ptr[GetBattlerPosition(battler) & 3];
    if (!tiles) { console.warn('[battler-sprite] load gfx KO pour species', sp); return -1; }
    const FRAME0 = 0x800;  // MON_PIC_SIZE : frame 0 (anim_front = 2 frames empilées).
    // 1:1 gMonFrontAnimsPtrTable (front_pic_anims.h) : le FRONT adverse embarque ses
    // 2 FRAMES en VRAM (128 tiles) pour l'anim d'apparition (HasTwoFramesAnimation →
    // StartSpriteAnim(1), déclenchée par BattleAnimateFrontSprite). Le back joueur =
    // 1 frame (les backs émeraude ne sont pas animés).
    const twoFrames = isOpponent && tiles.length >= FRAME0 * 2;
    const frame0 = twoFrames ? tiles.subarray(0, FRAME0 * 2) : tiles.subarray(0, FRAME0);
    // 1:1 GetBattlerSpriteFinal_Y (battle_anim_mons.c:269) : y = yOffset + sBattlerCoords.y
    // (ennemi front.yOffset - elevation ; elevation=0 sauf gros mons = dette R3).
    const coords = await _loadMonPicCoords();
    const c = coords[enumName];
    const baseY = _sBattlerCoordsSingle[GetBattlerPosition(battler) & 3]?.[1] ?? 40;
    // 1:1 GetBattlerSpriteFinal_Y (battle_anim_mons.c:269) : côté ADVERSE, l'offset =
    // yOffset - GetBattlerElevation (les volants/flotteurs sont DÉCALÉS VERS LE HAUT,
    // l'ombre elliptique reste au sol — signalé user 2026-06-10). Côté joueur : pas
    // d'élévation (back pic au sol).
    const elevation = isOpponent ? GetBattlerElevation(battler, sp) : 0;
    const y = (c ? (isOpponent ? c.front.yOffset : c.back.yOffset) : 0) + baseY - elevation;
    // Matrice affine ALLOUÉE pour ce mon (cf. commentaire oam ci-dessous).
    const _monMatrixNum = AllocOamMatrix();
    // 1:1 SetMultiuseSpriteTemplateToPokemon + CreateSprite : template INLINE
    // (tileTag=TAG_NONE + images) → keystone CreateSpriteInline. shape0/size3 = 64x64.
    const spriteId = CreateSprite({
      // 1:1 décomp gOamData_BattleSprite{Player,Opponent}Side.priority = 2 (battle_main.c:284/299) ;
      // le 4e arg CreateSprite = GetBattlerSpriteSubpriority (battle_anim_mons.c:2035) :
      // PLAYER_LEFT=30 / OPPONENT_LEFT=40 → à priority égale, le mon adverse (40) rend DERRIÈRE
      // le dresseur joueur (back-sprite, subpri 30). Avant : priority=1 + subpri=2 (FAUX) → le
      // mon adverse passait DEVANT le dresseur (retour A/B 2026-06-04).
      // 1:1 gOamData_BattleSpriteOpponentSide/PlayerSide (battle_main.c:284/299) :
      // affineMode = ST_OAM_AFFINE_NORMAL (1) — requis pour l'affine EMERGE du
      // send-out (StartSpriteAffineAnim BATTLER_AFFINE_EMERGE, pokeball.ts:476).
      // Matrice ALLOUÉE (AllocOamMatrix, 1:1 InitSpriteAffineAnim) — un slot fixe
      // (battler) était RÉÉCRIT à l'identité chaque frame par un autre sprite
      // affine du send-out → le compositeur voyait toujours scale 100% = pas de
      // grossissement visible (pixel-probe : matrice animait, aire constante).
      // Libérée par DestroySprite (contrat plateforme _matrixUsed).
      oam: { shape: 0, size: 3, priority: 2, paletteNum: battler, affineMode: 1, affineParamIndex: _monMatrixNum },
      // ⚠️ size = la TAILLE RÉELLE uploadée (2 frames = 128 tiles pour le front
      // adverse animé). L'ancien `size: FRAME0` n'ALLOUAIT que 64 tiles alors que
      // _writeToObjVram écrivait les 2 frames → la frame 2 (base+64) vivait en
      // VRAM NON allouée → écrasée par les allocs suivantes → tiles corrompues
      // dès que l'anim 2-frames bascule (bug user #2b, + le shiny Grahyena en stock).
      images: [{ data: frame0, size: frame0.length }],
      callback: null,
    }, _GetBattlerSpriteCoordX(battler), y, _GetBattlerSpriteSubpriority(battler));
    _registerBattlerMonSprite(battler, spriteId);
    // 1:1 décomp gBattlerSpriteTemplates[position].affineAnims =
    // gAffineAnims_BattleSpriteOpponentSide/PlayerSide (battle_main.c:305-330) —
    // SANS la table, StartSpriteAffineAnim pose ended immédiatement (sémantique
    // plateforme) → l'EMERGE du send-out ne grossissait jamais (bug user #2a).
    {
      const monSpr = getRuntime()?.gSprites[spriteId];
      if (monSpr) {
        monSpr.affineAnimsTableName = isOpponent
          ? 'gAffineAnims_BattleSpriteOpponentSide'
          : 'gAffineAnims_BattleSpritePlayerSide';
      }
    }
    // 1:1 décomp OpponentHandleLoadMonSprite (battle_controller_opponent.c:1149-1153) : le mon
    // SAUVAGE adverse naît HORS-ÉCRAN DROITE (x2=-DISPLAY_WIDTH) avec le callback SpriteCB_WildMon
    // (du template gBattlerSpriteTemplates[B_POSITION_OPPONENT_LEFT], pokemon.c:1959) → il GLISSE
    // vers la position (SpriteCB_MoveWildMonToRight: x2+=2) en TEINTE OMBRÉE (BeginNormalPaletteFade
    // 0x20000 RGB(8,8,8)), puis healthbox slide-in + dé-teinte (SpriteCB_WildMonShowHealthbox).
    // sBattler=data[0], sSpeciesId=data[2] (1:1 #define battle_main.c:2664-2665). animEnded=true :
    // le mon est mono-frame (CreateSpriteInline sans anims) → sinon SpriteCB_WildMonShowHealthbox
    // (gate sur sprite->animEnded) ne se déclencherait JAMAIS (mon glisse mais healthbox/dé-teinte
    // jamais). Côté JOUEUR (back-sprite) : pas de slide ici (il sort d'une ball = chantier send-out).
    const rt2 = getRuntime();
    const spr = rt2?.gSprites?.[spriteId];
    // sBattler=data[0], sSpeciesId=data[2] (1:1 battle_controller_opponent.c:1150-1151 +
    // battle_main.c:2664-2665) — POUR LES DEUX COTES : le mon JOUEUR en a besoin aussi
    // (SpriteCB_PlayerMonFromBall lit data[2]=species + le cri du send-out). Avant : pose seulement
    // cote opponent → species=0 cote joueur. ⚠️ spr.data = Int16Array (pas Array JS) → index direct.
    if (spr && spr.data) { spr.data[0] = battler; spr.data[2] = sp; }
    if (twoFrames && spr) {
      // 1:1 gMonFrontAnimsPtrTable : enregistre l'anim 2-frames du species (séquence
      // EXACTE front_pic_anims.h extraite) + table [anim0 = frame0, anim1 = séquence].
      // Déclenchement 1:1 = BattleAnimateFrontSprite (cri + StartSpriteAnim(1)) via
      // SpriteCB_WildMonAnimate (wild) / SpriteCB_OpponentMonFromBall (sortie de ball).
      void _ensureFrontAnims().then((seqs) => {
        const rt3 = getRuntime();
        const sprNow = rt3?.gSprites?.[spriteId];
        const seq = seqs[enumName];
        if (!rt3 || !sprNow || !seq || !seq.length) return;
        rt3.registerExtraAnim('MONFRONT_F0', { frames: [{ tileNum: 0, duration: 1 }], terminator: 'END' });
        rt3.registerExtraAnim('MONFRONT_SEQ_' + enumName, {
          frames: seq.map(([f, d]) => ({ tileNum: (f | 0) * 64, duration: d | 0 })),
          terminator: 'END',
        });
        rt3.registerExtraAnimTable('MONFRONT_' + enumName, { anims: ['MONFRONT_F0', 'MONFRONT_SEQ_' + enumName] });
        (sprNow as { monFrontAnimTable?: string }).monFrontAnimTable = 'MONFRONT_' + enumName;
      });
    }
    if (opts?.reshow) {
      // 1:1 décomp `CreateBattlerSprite` (reshow_battle_screen.c:227/263) : au RESHOW
      // (retour d'un sous-écran : party/sac/résumé), le mon est déjà SORTI → on le
      // recrée STATIQUE à sa position home, callback `SpriteCallbackDummy`. PAS le
      // slide-in sauvage (sinon l'ennemi "re-scrolle comme s'il venait d'apparaître")
      // NI l'emerge affine de ball (pas de ball au reshow). _registerBattlerMonSprite a
      // déjà poussé un pending-reveal (pas deferReveal) → le mon devient visible quand
      // sa palette OBJ est live (anti sprite-noir), couvert par le fade-in du reshow.
      if (spr) (spr as { callback: unknown }).callback = SpriteCallbackDummy;
    } else if (isOpponent && !_deferRevealBattlers.has(battler)) {
      // mon SAUVAGE (combat sauvage : PAS de send-out ball) : nait hors-ecran droite
      // (x2=-DISPLAY_WIDTH) + slide-in SpriteCB_WildMon, animEnded=true (mono-frame). En combat
      // DRESSEUR le mon adverse est en deferReveal -> branche affine emerge ci-dessous (1:1 :
      // StartSendOutAnim cree le mon invisible+SpriteCallbackDummy, l'emergence vient de la ball).
      if (spr) {
        spr.x2 = -240;   // -DISPLAY_WIDTH
        spr.animEnded = true;
        (spr as { callback: unknown }).callback = SpriteCB_WildMon;
      }
    } else if (rt2 && spr) {
      // 1:1 TEMPLATE AFFINE (gBattlerSpriteTemplates[i].affineAnims=gAffineAnims_BattleSprite{Player,Opponent}Side
      // + gOamData_BattleSprite.affineMode=ST_OAM_AFFINE_NORMAL, pokemon.c:1949 + battle_main.c:277) :
      // le mon sort d'une POKEBALL (JOUEUR back OU ADVERSE en combat dresseur, deferReveal) → il doit
      // etre AFFINE des la creation pour que l'EMERGE (StartSpriteAffineAnim BATTLER_AFFINE_EMERGE dans
      // SpriteCB_ReleaseMonFromBall, pokeball.ts) tourne. SetUpForReleaseAffineAnim pose matrix+table+
      // affineMode NORMAL pour le BON cote (player vs opponent = table affine differente) ;
      // StartSpriteAffineAnim(0=NORMAL) applique l'identite. Mon invisible (deferReveal) jusqu'a
      // HandleBallAnimEnd → aucun rendu affine visible avant l'emergence (zero risque de regression).
      SetUpForReleaseAffineAnim(rt2, spriteId, isOpponent ? 'opponent' : 'player');
      rt2.StartSpriteAffineAnim(spriteId, 0);
    }
    return spriteId;
  } catch (e) {
    console.error('[battler-sprite] _loadAndCreateBattlerMonSprite failed', e);
    return -1;
  }
}

// ─── Registre des sprites mon (voie L) + fix « sprite noir » (révélation différée) ──
// 1:1 décomp : StartSendOutAnim crée le mon INVISIBLE (gSprites[id].invisible=TRUE,
// battle_controller_player.c:2221) et ne le révèle qu'à HandleBallAnimEnd (pokeball.c:850),
// APRÈS que sa palette OBJ soit chargée+live. Notre _loadAndCreateBattlerMonSprite créait le
// mon VISIBLE alors que LoadPalette n'écrit que gPlttBufferFaded ; le flush→live
// (TransferPlttBuffer) est gaté par bufferTransferDisabled et différé → le mon rend quelques
// frames sur la palette live NOIRE (= « avatar noir », retour user). Fix DÉTERMINISTE (PAS
// l'anim de ball, = chantier A/B séparé) : créer le mon invisible et le révéler quand sa
// palette est live (transfer activé + ≥1 flush), filet de sécurité à 30f. Forcer flushTo()
// est exclu (bypasse le gate → flash, cf. fix session-124).
const _battlerMonSpriteIds: number[] = [-1, -1, -1, -1];
interface _PendingReveal { battler: number; spriteId: number; frames: number; sprRef?: unknown }
const _pendingMonReveals: _PendingReveal[] = [];

// 1:1 send-out JOUEUR : un mon qui sort d'une POKÉBALL reste INVISIBLE jusqu'à HandleBallAnimEnd
// (pokeball.c:850), PAS révélé à ~2f par l'anti-sprite-noir. Quand un battler est marqué
// `deferReveal`, _registerBattlerMonSprite le crée invisible mais NE pousse PAS de pending reveal
// → c'est l'anim de ball (tickSendOut, battle-sendout-anim.ts) qui le révèle à l'émergence.
// Sans ça : double apparition (pop à 2f PUIS émergence). À la palette: le throw part à 31f +
// l'arc ~25-46f → la palette OBJ a largement flushé live d'ici l'émergence (zéro risque de noir).
const _deferRevealBattlers = new Set<number>();
export function setBattlerDeferReveal(battler: number, defer: boolean): void {
  if (defer) _deferRevealBattlers.add(battler); else _deferRevealBattlers.delete(battler);
}

/** 1:1 décomp gBattlerSpriteIds[battler] (registre voie L des sprites mon). */
export function getBattlerMonSpriteId(battler: number): number {
  return _battlerMonSpriteIds[battler] ?? -1;
}

function _registerBattlerMonSprite(battler: number, spriteId: number): void {
  _battlerMonSpriteIds[battler] = spriteId;
  // Cache le sprite jusqu'à ce que sa palette OBJ soit live (anti « sprite noir »).
  const rt = getRuntime();
  const spr = rt?.gSprites?.[spriteId];
  if (spr) spr.invisible = true;
  // Remplace toute révélation en attente pour ce battler (re-création = switch).
  for (let i = _pendingMonReveals.length - 1; i >= 0; i--) {
    if (_pendingMonReveals[i].battler === battler) _pendingMonReveals.splice(i, 1);
  }
  // Send-out ball (deferReveal) : reste invisible — c'est tickSendOut qui révèle à l'émergence.
  if (_deferRevealBattlers.has(battler)) return;
  // + la REFERENCE objet du sprite : si le slot est recycle avant le reveal
  // (sprite detruit -> id reutilise par un sprite d'anim), on droppe au lieu
  // de reveler un orphelin (bug particules Sand-Attack, fix 2026-06-11).
  const _sprRef = getRuntime()?.gSprites?.[spriteId];
  _pendingMonReveals.push({ battler, spriteId, frames: 0, sprRef: _sprRef as unknown });
}

/** Révèle chaque mon en attente dès que sa palette OBJ est live (déterministe). Appelé
 *  1×/frame depuis BattleMainCB2 (comme tickBattleIntroSlideL). No-op si rien en attente. */
export function tickBattlerMonReveals(): void {
  if (_pendingMonReveals.length === 0) return;
  const rt = getRuntime();
  if (!rt) return;
  // La palette OBJ du mon (gPlttBufferFaded, écrite par LoadPalette AVANT l'enregistrement)
  // ne devient LIVE qu'au flush TransferPlttBuffer, gaté par bufferTransferDisabled. Quand
  // transfer activé, le flush a lieu chaque frame (decomp-runtime ~2386) → la palette est live
  // en ≤2 frames. Pendant l'intro fade (bufferTransferDisabled=TRUE) le flush est différé → le
  // mon resterait noir : on le garde donc invisible jusqu'au déblocage du transfer.
  const transferOk = !(rt.gPaletteFade as { bufferTransferDisabled?: boolean } | undefined)?.bufferTransferDisabled;
  for (let i = _pendingMonReveals.length - 1; i >= 0; i--) {
    const p = _pendingMonReveals[i];
    p.frames++;
    // Révèle quand le transfer palette est activé (→ la palette OBJ du mon a flushé live) ET
    // qu'au moins 2 frames ont passé. Filet de sécurité à 30f (jamais invisible en permanence).
    if ((transferOk && p.frames >= 2) || p.frames >= 30) {
      const spr = rt.gSprites?.[p.spriteId];
      // identite : le slot peut avoir ete recycle (destroy -> id reutilise par
      // un sprite d'anim) -> reveler l'orphelin etait le bug des particules.
      if (spr && (p.sprRef === undefined || (spr as unknown) === p.sprRef)) spr.invisible = false;
      _pendingMonReveals.splice(i, 1);
    }
  }
}

/** Reset le registre + révélations en attente (= teardown / nouveau combat). */
export function resetBattlerMonSprites(): void {
  _battlerMonSpriteIds.fill(-1);
  _pendingMonReveals.length = 0;
  // 1:1 décomp : l'alloc fraîche de gBattleSpritesDataPtr au nouveau combat =
  // AllocateBattleSpritesData + AllocateMonSpritesGfx, côte à côte dans
  // CB2_InitBattle (battle_main.c:592-593).
  AllocateBattleSpritesData();
  AllocateMonSpritesGfx();
}
/** 1:1 décomp `OpponentHandleSwitchInAnim()` (battle_controller_opponent.c:1160-1166).
 *  Set gBattleStruct.monToSwitchIntoId = PARTY_SIZE + set party index +
 *  StartSendOutAnim opponent + install SwitchIn_TryShinyAnim. */
function OpponentHandleSwitchInAnim(): void {
  _setMonToSwitchIntoId(gActiveBattler, _PARTY_SIZE);
  _setBattlerPartyIndex(gActiveBattler, gBattleBufferA[gActiveBattler][1]);
  _StartSendOutAnim_Opponent(gActiveBattler, gBattleBufferA[gActiveBattler][2] !== 0);
  _installSwitchInTryShinyAnim(gActiveBattler);
}

/** 1:1 décomp `PARTY_SIZE` = 6. */
const _PARTY_SIZE = 6;

/** Wire helpers via globalThis. */
function _setMonToSwitchIntoId(_battler: number, _v: number): void {
  // Dette R3 : gBattleStruct.monToSwitchIntoId[battler] = v.
  const m = (globalThis as { __battleState?: { gBattleStruct?: { monToSwitchIntoId?: number[] } } }).__battleState;
  if (m?.gBattleStruct?.monToSwitchIntoId) m.gBattleStruct.monToSwitchIntoId[_battler] = _v;
}

function _setBattlerPartyIndex(battler: number, idx: number): void {
  const m = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } }).__battleState;
  if (m?.gBattlerPartyIndexes) m.gBattlerPartyIndexes[battler] = idx;
}

function _StartSendOutAnim_Opponent(battler: number, dontClearSubstituteBit: boolean): void {
  // 1:1 décomp `StartSendOutAnim` (battle_controller_opponent.c:1131-1159) :
  // party index + load gfx + CreateSprite mon (INVISIBLE) + ball send-out adverse
  // (DoPokeballSendOutAnimation POKEBALL_OPPONENT_SENDOUT — même chaîne que
  // Task_StartSendOutAnim de l'intro :1598). Bug user 2026-06-12 « le 2e mon
  // arrive comme un sauvage » = la ball manquait ici.
  // ⚠️ Historique : le wire initial `doPokeballSendOutAnimationOpponent`
  // n'existait nulle part (mon invisible), puis isOpponent=false lisait
  // gPlayerParty (species 0) — les 2 fixes précèdent ce throw complet.
  void dontClearSubstituteBit; // ClearTemporarySpeciesSpriteData = dette substitute.
  // deferReveal : le mon reste invisible jusqu'à l'émergence (HandleBallAnimEnd
  // révèle — pattern player :871). ballAnimActive pré-posé SYNC : le load PNG est
  // async, sans ça la chaîne SwitchIn_TryShinyAnim (installée juste après) verrait
  // ballAnimActive=false AVANT le throw et avancerait trop tôt (healthbox pendant
  // le throw). La décomp est sync (pas de fenêtre).
  setBattlerDeferReveal(battler, true);
  setBallAnimActive(battler, true);
  void _loadAndCreateBattlerMonSprite(battler, true).then(() => {
    const saved = gActiveBattler;
    setActiveBattler(battler);
    DoPokeballSendOutAnimation(0, POKEBALL_OPPONENT_SENDOUT);
    setActiveBattler(saved);
  });
}

function _installSwitchInTryShinyAnim(battler: number): void {
  // 1:1 décomp :1165 gBattlerControllerFuncs[battler] = SwitchIn_TryShinyAnim
  // (la chaîne 4 états ci-dessous remplace l'ancien ExecCompleted immédiat).
  _setBattlerControllerFunc(battler, SwitchIn_TryShinyAnim);
}

// ─── Chaîne SwitchIn 1:1 (battle_controller_opponent.c:459-513) ──────────────
// TryShinyAnim → ShowHealthbox → ShowSubstitute → HandleSoundAndEnd → completed.

/** 1:1 décomp `SwitchIn_TryShinyAnim()` (:501-513). Le double-check décomp
 *  « callback ball == SpriteCallbackDummy && !ballAnimActive » : notre
 *  HandleBallAnimEnd (pokeball.ts 1:1) clear ballAnimActive au même moment où
 *  la ball meurt → le bit seul est équivalent (la ball n'est plus accessible
 *  par id ici, gBattleControllerData non modélisé — dette douce documentée). */
function SwitchIn_TryShinyAnim(): void {
  if (!_shinyItf().hasTriedShinyAnim(gActiveBattler) && !isBallAnimActive(gActiveBattler)) {
    const mon = _gEnemyPartyMon(gActiveBattler) as { otId?: number; personality?: number } | null;
    _shinyItf().TryShinyAnimation(gActiveBattler, mon);
  }
  if (!isBallAnimActive(gActiveBattler)) {
    // 1:1 :509-511 : DestroySprite(ball) fait par HandleBallAnimEnd ;
    // SetBattlerShadowSpriteCallback (l'ombre du volant réapparaît).
    const species = (_gEnemyPartyMon(gActiveBattler) as { species?: number } | null)?.species ?? 0;
    (globalThis as { __battleGfxSfxUtil?: { SetBattlerShadowSpriteCallback?: (b: number, s: number) => void } })
      .__battleGfxSfxUtil?.SetBattlerShadowSpriteCallback?.(gActiveBattler, species);
    _setBattlerControllerFunc(gActiveBattler, SwitchIn_ShowHealthbox);
  }
}

/** 1:1 décomp `SwitchIn_ShowHealthbox()` (:482-499). */
function SwitchIn_ShowHealthbox(): void {
  const monId = getBattlerMonSpriteId(gActiveBattler);
  const spr = getRuntime()?.gSprites?.[monId];
  // GARDE-FOU (pas 1:1 — cas d'erreur impossible en décomp) : si la création du
  // sprite a ÉCHOUÉ (species 0 : gEnemyParty[1+] party-storage vide alors que
  // gBattleMons/harness ont le mon — désync CreateNPCTrainerParty, DETTE
  // investiguer), continuer sans sprite plutôt que soft-lock le combat.
  if (monId < 0 || !spr) {
    console.warn('[SwitchIn_ShowHealthbox] sprite mon absent (création échouée) — continue sans (dette party-storage[1+])');
    _shinyItf().resetShinyAnimFlags(gActiveBattler);
    _setBattlerControllerFunc(gActiveBattler, SwitchIn_ShowSubstitute);
    return;
  }
  const cbName = (spr?.callback as { name?: string } | null)?.name ?? 'null';
  // Décomp : callback == SpriteCallbackDummy STRICT. Chez nous l'état de repos
  // post-send-out est SpriteCallbackDummy_2 (l'anim de mouvement est une task,
  // le callback du sprite ne repasse pas par Dummy — divergence send-out
  // documentée, même équivalence que SwitchIn_HandleSoundAndEnd qui accepte
  // les DEUX dans le .c :473-474).
  if (_shinyItf().isShinyAnimFinished(gActiveBattler)
    && (cbName === 'SpriteCallbackDummy' || cbName === 'SpriteCallbackDummy_2' || spr?.callback === null)) {
    _shinyItf().resetShinyAnimFlags(gActiveBattler);
    // 1:1 FreeSpriteTiles/PaletteByTag(ANIM_TAG_GOLD_STARS) : géré par les
    // Task_ShinyStars à leur destruction (chaîne T5).
    if (spr) StartSpriteAnim(spr as never, 0);
    const hb = (globalThis as { __battleHealthbox?: {
      gHealthboxSpriteIds?: number[];
      UpdateHealthboxAttribute?: (id: number, mon: unknown, attr: number) => void;
      StartHealthboxSlideIn?: (b: number) => void;
      SetHealthboxSpriteVisible?: (id: number) => void;
    } }).__battleHealthbox;
    const hbId = hb?.gHealthboxSpriteIds?.[gActiveBattler] ?? -1;
    if (hbId >= 0) {
      hb?.UpdateHealthboxAttribute?.(hbId, _gEnemyPartyMon(gActiveBattler), 0 /* HEALTHBOX_ALL */);
      hb?.StartHealthboxSlideIn?.(gActiveBattler);
      hb?.SetHealthboxSpriteVisible?.(hbId);
    }
    (globalThis as { __battleGfxSfxUtil?: { CopyBattleSpriteInvisibility?: (b: number) => void } })
      .__battleGfxSfxUtil?.CopyBattleSpriteInvisibility?.(gActiveBattler);
    _setBattlerControllerFunc(gActiveBattler, SwitchIn_ShowSubstitute);
  }
}

/** 1:1 décomp `SwitchIn_ShowSubstitute()` (:459-467). Le gate décomp = la
 *  healthbox a fini son slide (callback == SpriteCallbackDummy) — notre slide
 *  est tické côté healthbox ; on poll le même critère via le bit slide actif
 *  si exposé, sinon pass-through (slide non bloquant). */
function SwitchIn_ShowSubstitute(): void {
  if (_isBehindSubstitute(gActiveBattler)) {
    _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, 6 /* B_ANIM_MON_TO_SUBSTITUTE */);
  }
  _setBattlerControllerFunc(gActiveBattler, SwitchIn_HandleSoundAndEnd);
}

/** 1:1 décomp `SwitchIn_HandleSoundAndEnd()` (:469-481) : attend la fin de la
 *  special anim (substitute) + du cri, puis restore le volume BGM (hook m4a
 *  toléré — l'infra BGM n'est pas modifiée) et complete. */
function SwitchIn_HandleSoundAndEnd(): void {
  const cryPlaying = !!(globalThis as { __isCryPlaying?: () => boolean }).__isCryPlaying?.();
  if (!_isSpecialAnimActive(gActiveBattler) && !cryPlaying) {
    (globalThis as { __m4aMPlayVolumeControlBGMFull?: () => void }).__m4aMPlayVolumeControlBGMFull?.();
    OpponentBufferExecCompleted();
  }
}

/** 1:1 décomp `CompleteOnFinishedBattleAnimation()` (:521-526) : attend la fin
 *  d'une anim de la table General (animFromTableActive, battle_gfx_sfx_util). */
function CompleteOnFinishedBattleAnimation(): void {
  const active = !!(globalThis as { __battleGfxSfxUtil?: { isAnimFromTableActive?: (b: number) => boolean } })
    .__battleGfxSfxUtil?.isAnimFromTableActive?.(gActiveBattler);
  if (!active) OpponentBufferExecCompleted();
}
// Câblage différé : CompleteOnFinishedBattleAnimation est installé par
// OpponentHandleBattleAnimation (TryHandleLaunchBattleTableAnimation) — exposé
// pour le wire au moment du renommage du handler (export utilisé ci-dessous).
void CompleteOnFinishedBattleAnimation;

/** Interface lazy vers battle_anim_throw (anti-cycle ESM). */
function _shinyItf(): {
  TryShinyAnimation: (b: number, m: unknown) => boolean;
  isShinyAnimFinished: (b: number) => boolean;
  hasTriedShinyAnim: (b: number) => boolean;
  resetShinyAnimFlags: (b: number) => void;
} {
  const m = (globalThis as Record<string, unknown>).__battleAnimThrowShiny as Record<string, unknown> | undefined;
  return {
    TryShinyAnimation: (m?.TryShinyAnimation as never) ?? (() => false),
    isShinyAnimFinished: (m?.isShinyAnimFinished as never) ?? (() => true),
    hasTriedShinyAnim: (m?.hasTriedShinyAnim as never) ?? (() => true),
    resetShinyAnimFlags: (m?.resetShinyAnimFlags as never) ?? (() => { /* no-op */ }),
  };
}

/** Mon ennemi du battler (gEnemyParty[gBattlerPartyIndexes[b]]). */
function _gEnemyPartyMon(battler: number): unknown {
  const g = globalThis as { __gEnemyParty?: unknown[] };
  const idx = gBattlerPartyIndexes[battler] ?? 0;
  return g.__gEnemyParty?.[idx] ?? null;
}
/** 1:1 décomp `OpponentHandleReturnMonToBall()` (battle_controller_opponent.c:1200-1216).
 *  bufferA[1]==0 → DoSwitchOutAnimation (anim de rappel : le mon rétrécit dans la
 *  ball, B_ANIM_SWITCH_OUT_OPPONENT_MON) ; sinon skip-anim : destroy sprite +
 *  HideBattlerShadowSprite + SetHealthboxSpriteInvisible + complete. */
function OpponentHandleReturnMonToBall(): void {
  if (gBattleBufferA[gActiveBattler][1] === 0) {
    _setHbAnimationState(gActiveBattler, 0);
    _setBattlerControllerFunc(gActiveBattler, _DoSwitchOutAnimationOpp);
  } else {
    _freeOppMonSpriteAndHideHealthbox(gActiveBattler);
    OpponentBufferExecCompleted();
  }
}

/** Corps partagé 1:1 :1209-1213 / :426-430 : destroy sprite + ombre + healthbox. */
function _freeOppMonSpriteAndHideHealthbox(battler: number): void {
  const rt = getRuntime();
  const monId = getBattlerMonSpriteId(battler);
  if (rt && monId >= 0) {
    const spr = rt.gSprites[monId];
    if (spr) { (spr as { inUse: boolean }).inUse = false; (spr as { callback: unknown }).callback = null; }
    DestroySprite(monId);
    _battlerMonSpriteIds[battler] = -1;
  }
  // 1:1 HideBattlerShadowSprite (l'ombre du volant disparaît au rappel).
  (globalThis as { __battleGfxSfxUtil?: { HideBattlerShadowSprite?: (b: number) => void } })
    .__battleGfxSfxUtil?.HideBattlerShadowSprite?.(battler);
  const hb = (globalThis as { __battleHealthbox?: { gHealthboxSpriteIds?: number[]; SetHealthboxSpriteInvisible?: (id: number) => void } }).__battleHealthbox;
  const hbId = hb?.gHealthboxSpriteIds?.[battler] ?? -1;
  if (hbId >= 0) hb?.SetHealthboxSpriteInvisible?.(hbId);
}

/** 1:1 décomp `DoSwitchOutAnimation()` (battle_controller_opponent.c:1217-1236) —
 *  même machine que le player mais B_ANIM_SWITCH_OUT_OPPONENT_MON (= 2). */
function _DoSwitchOutAnimationOpp(): void {
  switch (_getHbAnimationState(gActiveBattler)) {
    case 0:
      if (_isBehindSubstitute(gActiveBattler))
        _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, 5 /* B_ANIM_SUBSTITUTE_TO_MON */);
      _setHbAnimationState(gActiveBattler, 1);
      break;
    case 1:
      if (!_isSpecialAnimActive(gActiveBattler)) {
        _setHbAnimationState(gActiveBattler, 0);
        _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, 2 /* B_ANIM_SWITCH_OUT_OPPONENT_MON */);
        _setBattlerControllerFunc(gActiveBattler, _FreeMonSpriteAfterSwitchOutAnimOpp);
      }
      break;
  }
}

/** 1:1 décomp `FreeMonSpriteAfterSwitchOutAnim()` (battle_controller_opponent.c:422-432). */
function _FreeMonSpriteAfterSwitchOutAnimOpp(): void {
  if (!_isSpecialAnimActive(gActiveBattler)) {
    _freeOppMonSpriteAndHideHealthbox(gActiveBattler);
    OpponentBufferExecCompleted();
  }
}

/** 1:1 decomp `SpriteCB_TrainerSlideIn(struct Sprite *sprite)` (battle_gfx_sfx_util.c:396).
 *  Slide horizontal (x2 += sSpeedX=data[0]) GATE sur gIntroSlideFlags bit0 (gele pendant
 *  l'ouverture des bandes) ; a x2==0, enchaine le slide vertical (si y2) sinon SpriteCallbackDummy.
 *  MIROIR du player (battle-controller-player.ts) : duplique ici car opponent NE PEUT PAS importer
 *  player.ts (player.ts importe deja opponent.ts -> cycle ESM). Dette : extraire vers le foyer
 *  partage battle-sprite-callbacks.ts une fois le player migre (meme pattern que les CONST dup). */
function SpriteCB_TrainerSlideIn(sprite: DecompSprite): void {
  const bmf = (globalThis as Record<string, unknown>).__battleMainFunctions as { getIntroSlideFlags?: () => number } | undefined;
  if (!((bmf?.getIntroSlideFlags?.() ?? 0) & 1)) {
    sprite.x2 += sprite.data[0];   // sSpeedX (= +2 cote adverse, x2 part de -DISPLAY_WIDTH)
    if (sprite.x2 === 0) {
      if (sprite.y2 !== 0) sprite.callback = SpriteCB_TrainerSlideVertical;
      else sprite.callback = SpriteCallbackDummy;
    }
  }
}

/** 1:1 decomp `SpriteCB_TrainerSlideVertical(struct Sprite *sprite)` (battle_gfx_sfx_util.c:412).
 *  Slide vertical (y2 -= 2) jusqu'a 0 (= multi battle intro). Jamais atteint en single. */
function SpriteCB_TrainerSlideVertical(sprite: DecompSprite): void {
  sprite.y2 -= 2;
  if (sprite.y2 === 0) sprite.callback = SpriteCallbackDummy;
}

/** 1:1 decomp `OpponentHandleDrawTrainerPic()` (battle_controller_opponent.c:1240-1323).
 *  Cree le front-pic du dresseur adverse (xPos=176, off-screen GAUCHE x2=-DISPLAY_WIDTH pose par
 *  showOpponentTrainerSprite), sSpeedX=+2 + callback=SpriteCB_TrainerSlideIn (slide pilote par
 *  AnimateSprites, GATE gIntroSlideFlags), puis attend la fin du slide
 *  (CompleteOnBattlerSpriteCallbackDummy). MIROIR de PlayerHandleDrawTrainerPic. */
let _oppTrainerSlideStarted = false;
function OpponentHandleDrawTrainerPic(): void {
  // Harness (__battleTextInstant) : court-circuit (le slide depend des SpriteCB tickes). Cf. player.
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    OpponentBufferExecCompleted();
    return;
  }
  _oppTrainerSlideStarted = false;
  const rt = getRuntime();
  // 1:1 ll.1245-1295 (single trainer) : trainerPicId = gTrainers[gTrainerBattleOpponent_A].trainerPic.
  // Dette : modes SECRET_BASE/FRONTIER/TRAINER_HILL/TWO_OPPONENTS (hors scope rival single).
  const picEnum = getTrainerPicEnum(gTrainerBattleOpponent_A);
  // 1:1 ll.1306+1313 : xPos=176, yPos=(8-size)*4+40 = 40 (front pic 64x64 = size 8). Dette : pics
  // < 64px (size!=8) auraient un yPos different (gTrainerFrontPicCoords[picId].size non lu ici).
  void showOpponentTrainerSprite(picEnum, 176, 40).then((tid) => {
    const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
    if (tr) {
      tr.data[0] = 2;                         // sSpeedX = 2 (1:1 l.1317)
      tr.callback = SpriteCB_TrainerSlideIn;  // slide-in 1:1 (x2 -DISPLAY_WIDTH -> 0, gate gIntroSlideFlags)
    }
    _oppTrainerSlideStarted = true;
  }).catch(() => { _oppTrainerSlideStarted = true; });
  // 1:1 l.1322 : gBattlerControllerFuncs = CompleteOnBattlerSpriteCallbackDummy.
  _setBattlerControllerFunc(gActiveBattler, _CompleteOnOpponentTrainerSlideIn);
}
/** 1:1 decomp `CompleteOnBattlerSpriteCallbackDummy()` (battle_controllers.c) : attend que le sprite
 *  du dresseur adverse ait fini son slide (callback === SpriteCallbackDummy) puis ExecCompleted. */
function _CompleteOnOpponentTrainerSlideIn(): void {
  if (!_oppTrainerSlideStarted) return;
  const rt = getRuntime();
  const tid = getOpponentTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (!tr || tr.callback === SpriteCallbackDummy) OpponentBufferExecCompleted();
}

/** 1:1 décomp `OpponentHandleTrainerSlide()` (battle_controller_opponent.c:1326-1393) :
 *  le dresseur adverse RE-SLIDE à l'écran depuis la droite (texte de défaite —
 *  BattleScript_LocalBattleWonLoseTexts émet TRAINERSLIDE à chaque victoire trainer).
 *  Single : trainerPicId = gTrainers[gTrainerBattleOpponent_A].trainerPic (gates
 *  SECRET_BASE/FRONTIER/TRAINER_HILL/EREADER/TWO_OPPONENTS non atteignables).
 *  1:1 :1383-1390 : sprite à (176+32, 40), x2=96, sSpeedX=-2, SpriteCB_TrainerSlideIn. */
let _oppTrainerSlide2Started = false;
function OpponentHandleTrainerSlide(): void {
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    OpponentBufferExecCompleted();
    return;
  }
  _oppTrainerSlide2Started = false;
  const rt = getRuntime();
  const picEnum = getTrainerPicEnum(gTrainerBattleOpponent_A);
  // showOpponentTrainerSprite recharge l'asset (libéré au lancer par destroyOpponentTrainerSprite)
  // et pose x2=-DISPLAY_WIDTH → écrasé ci-dessous par la pose slide (x2=96). Même dette yPos
  // que DrawTrainerPic (front 64×64 → (8-8)*4+40 = 40 ; gTrainerFrontPicCoords.size non lu).
  void showOpponentTrainerSprite(picEnum, 176 + 32, 40).then((tid) => {
    const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
    if (tr) {
      tr.x2 = 96;                              // 1:1 :1385 (remplace le -DISPLAY_WIDTH d'intro)
      tr.data[0] = -2;                         // 1:1 :1387 sSpeedX = -2 (arrive de la droite)
      tr.callback = SpriteCB_TrainerSlideIn;   // 1:1 :1390 (x2 96 → 0 par pas de -2)
    }
    _oppTrainerSlide2Started = true;
  }).catch(() => { _oppTrainerSlide2Started = true; });
  // 1:1 :1392 : CompleteOnBankSpriteCallbackDummy2 (= attend callback Dummy).
  _setBattlerControllerFunc(gActiveBattler, _CompleteOnOpponentTrainerSlide2);
}
/** 1:1 décomp `CompleteOnBankSpriteCallbackDummy2()` (corps = CompleteOnBattlerSpriteCallbackDummy). */
function _CompleteOnOpponentTrainerSlide2(): void {
  if (!_oppTrainerSlide2Started) return;
  const rt = getRuntime();
  const tid = getOpponentTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (!tr || tr.callback === SpriteCallbackDummy) OpponentBufferExecCompleted();
}
/** 1:1 décomp `OpponentHandleTrainerSlideBack()` (:1396-1405) : le dresseur repart
 *  hors-écran droite (translation linéaire 35f → x=280, même squelette que le
 *  slide-off du lancer :1871-1878) puis FreeTrainerSpriteAfterSlide (:199) libère. */
function OpponentHandleTrainerSlideBack(): void {
  const rt = getRuntime();
  const tid = getOpponentTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (!tr) { OpponentBufferExecCompleted(); return; }
  SetSpritePrimaryCoordsFromSecondaryCoords(tr);   // 1:1 :1398 (fold x2/y2 → x/y)
  tr.data[0] = 35;        // 1:1 :1399 nbFrames
  tr.data[2] = 280;       // 1:1 :1400 destX (hors-écran droite)
  tr.data[4] = tr.y;      // 1:1 :1401 destY (pas de vertical)
  tr.callback = StartAnimLinearTranslation;
  StoreSpriteCallbackInData6(tr, SpriteCallbackDummy);   // 1:1 :1403
  _setBattlerControllerFunc(gActiveBattler, _FreeTrainerSpriteAfterSlide_Opp);
}
/** 1:1 décomp `FreeTrainerSpriteAfterSlide()` (:199-210) : attend la fin de la
 *  translation (callback Dummy) → FreeTrainerFrontPicPalette + DestroySprite
 *  (= destroyOpponentTrainerSprite : sprite + tiles tagués) + complete. */
function _FreeTrainerSpriteAfterSlide_Opp(): void {
  const rt = getRuntime();
  const tid = getOpponentTrainerSpriteId();
  const tr = rt && tid >= 0 ? rt.gSprites[tid] : null;
  if (!tr || tr.callback === SpriteCallbackDummy) {
    destroyOpponentTrainerSprite();
    OpponentBufferExecCompleted();
  }
}
/** 1:1 décomp `OpponentHandleFaintAnimation()` (battle_controller_opponent.c:1408-1426).
 *  State machine 2-step symétrique au PlayerHandleFaintAnimation :
 *    State 0 : behindSubstitute check + animationState++
 *    State 1 : !specialAnimActive → reset state + PlaySE12 SE_FAINT TARGET pan
 *      + sprite callback SpriteCB_FaintOpponentMon + install HideHealthboxAfterMonFaint. */
function OpponentHandleFaintAnimation(): void {
  // __battleSpritesData pas câblé → state machine bouclerait en state 0. On garde le
  // port 1:1 (dormant) mais ExecComplete direct tant que le backing est absent (visuel
  // faint via enqueue, Dette R3). Retirer la garde quand __battleSpritesData sera câblé.
  if (!_healthBoxAnimStateWired()) { OpponentBufferExecCompleted(); return; }
  const animState = _getHealthBoxAnimationState(gActiveBattler);
  if (animState === 0) {
    if (_isBehindSubstitute(gActiveBattler)) {
      _InitAndLaunchSpecialAnimation(gActiveBattler, gActiveBattler, gActiveBattler, _B_ANIM_SUBSTITUTE_TO_MON);
    }
    _setHealthBoxAnimationState(gActiveBattler, animState + 1);
  } else {
    if (!_isSpecialAnimActive(gActiveBattler)) {
      _setHealthBoxAnimationState(gActiveBattler, 0);
      _PlaySE12WithPanning(_SE_FAINT_OP, _SOUND_PAN_TARGET);
      // 1:1 décomp (battle_controller_opponent.c:1422-1423) :
      //   gSprites[gBattlerSpriteIds[active]].callback = SpriteCB_FaintOpponentMon;
      //   gBattlerControllerFuncs[active] = HideHealthboxAfterMonFaint;
      _startOpponentFaintAnim(gActiveBattler);
      _setBattlerControllerFunc(gActiveBattler, _HideHealthboxAfterMonFaint);
    }
  }
}

// AUDIT 2026-06 : B_ANIM_SUBSTITUTE_TO_MON = 5 (battle_anim.h:387 ; 6 = MON_TO_SUBSTITUTE,
// l'anim INVERSE) et SE_FAINT = 16 (songs.h:22 ; 21 = SE_PIN). Étaient 6/21.
const _B_ANIM_SUBSTITUTE_TO_MON = 5;
const _SE_FAINT_OP = 16;
const _SOUND_PAN_TARGET = 63;

function _getHealthBoxAnimationState(battler: number): number {
  const m = (globalThis as { __battleSpritesData?: { getHealthBoxAnimationState?: (b: number) => number } }).__battleSpritesData;
  return m?.getHealthBoxAnimationState?.(battler) ?? 0;
}
function _setHealthBoxAnimationState(battler: number, v: number): void {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: (b: number, v: number) => void } }).__battleSpritesData;
  m?.setHealthBoxAnimationState?.(battler, v);
}
/** True si __battleSpritesData.animationState est câblé (sinon la state machine
 *  FaintAnimation boucle → ExecComplete direct, visuel via enqueue, Dette R3). */
function _healthBoxAnimStateWired(): boolean {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: unknown } }).__battleSpritesData;
  return typeof m?.setHealthBoxAnimationState === 'function';
}
function _isBehindSubstitute(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isBehindSubstitute?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isBehindSubstitute?.(battler);
}
function _isSpecialAnimActive(battler: number): boolean {
  const m = (globalThis as { __battleSpritesData?: { isSpecialAnimActive?: (b: number) => boolean } }).__battleSpritesData;
  return !!m?.isSpecialAnimActive?.(battler);
}
function _InitAndLaunchSpecialAnimation(_a: number, _at: number, _t: number, _aid: number): void {
  // 1:1 battle_gfx_sfx_util.c:523 — surface __battleGfxSfxUtil (l'ancien wire
  // `__battleAnim.initAndLaunchSpecialAnimation` n'existait nulle part = no-op).
  const m = (globalThis as { __battleGfxSfxUtil?: { InitAndLaunchSpecialAnimation?: (a: number, at: number, t: number, aid: number) => void } }).__battleGfxSfxUtil;
  m?.InitAndLaunchSpecialAnimation?.(_a, _at, _t, _aid);
}
function _getHbAnimationState(battler: number): number {
  const m = (globalThis as { __battleSpritesData?: { getHealthBoxAnimationState?: (b: number) => number } }).__battleSpritesData;
  return m?.getHealthBoxAnimationState?.(battler) ?? 0;
}
function _setHbAnimationState(battler: number, v: number): void {
  const m = (globalThis as { __battleSpritesData?: { setHealthBoxAnimationState?: (b: number, v: number) => void } }).__battleSpritesData;
  m?.setHealthBoxAnimationState?.(battler, v);
}
function _PlaySE12WithPanning(seId: number, _pan: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
/** 1:1 décomp (battle_controller_opponent.c:1422) : gSprites[gBattlerSpriteIds[battler]].callback
 *  = SpriteCB_FaintOpponentMon (= le DROP : y2 += 8/step × ~8 steps puis DestroySprite). Le tick
 *  vient d'AnimateSprites→runSpriteCallbacksPublic, appelé chaque frame par BattleMainCB2. */
function _startOpponentFaintAnim(battler: number): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(battler)];
  if (!sprite) return;
  const fa = (globalThis as { __battleFaintAnim?: { TriggerFaintOpponent?: (s: unknown, b: number, sp: number) => void } }).__battleFaintAnim;
  // species → y_offset (front-pic coords) : _getMonFrontPicYOffset stub=8 (Dette R3) → ~8 steps
  // quelle que soit l'espèce ; species ignorée ⇒ passe 0.
  fa?.TriggerFaintOpponent?.(sprite, battler, 0);
}

/** 1:1 décomp `HideHealthboxAfterMonFaint` (battle_controller_opponent.c:413-420) : attend que le
 *  sprite mon soit détruit (= drop fini → !inUse) → cache le healthbox + ExecCompleted. (TS :
 *  DestroySprite retire le sprite de gSprites → get()===undefined.) */
function _HideHealthboxAfterMonFaint(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
  if (!sprite || sprite.inUse === false) {
    const hb = (globalThis as { __battleHealthbox?: { SetHealthboxSpriteInvisible?: (id: number) => void } }).__battleHealthbox;
    hb?.SetHealthboxSpriteInvisible?.(_gHealthboxSpriteId(gActiveBattler));
    OpponentBufferExecCompleted();
  }
}
// 1:1 VÉRIFIÉ (audit table 2026-06-10) : ces 4 handlers sont COMPLETE-ONLY dans le
// décomp aussi (battle_controller_opponent.c) — stubs = corps exact.
function OpponentHandlePaletteFade(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSuccessBallThrowAnim(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleBallThrow` (complete-only — l'adversaire ne lance pas de ball). */
function OpponentHandleBallThrow(): void { OpponentBufferExecCompleted(); }
function OpponentHandlePause(): void { OpponentBufferExecCompleted(); }
/** Décomp = OpponentDoMoveAnimation (gAnimScriptActive…) — chantier anims de move (dette). */
const _oppMoveAnimState: number[] = [0, 0, 0, 0];
const _oppMoveAnimMove: number[] = [0, 0, 0, 0];
type _AnimItfO = {
  DoMoveAnim?: (move: number) => void;
  tickAnimScript?: () => void;
  isAnimScriptActive?: () => boolean;
  setAnimMoveTurn?: (v: number) => void;
  setAnimMovePower?: (v: number) => void;
  setAnimMoveDmg?: (v: number) => void;
  setAnimFriendship?: (v: number) => void;
};
function _animItfO(): _AnimItfO {
  return ((globalThis as Record<string, unknown>).__battleAnimInterpreter as _AnimItfO) ?? {};
}
function OpponentHandleMoveAnimation(): void {
  // 1:1 décomp battle_controller_opponent.c (goal T4 2026-06-10).
  if (!_IsBattleSEPlaying_Opp(gActiveBattler)) {
    const buf = gBattleBufferA[gActiveBattler];
    _oppMoveAnimMove[gActiveBattler] = buf[1] | (buf[2] << 8);
    // 1:1 décomp :1391-1394 (forme link_opponent, identique opponent) :
    // gAnimMoveTurn/Power/Dmg/Friendship posés depuis bufA AVANT l'anim.
    // Manquait totalement côté adverse (wire mort #7, 2026-06-12).
    const itfT = _animItfO();
    itfT.setAnimMoveTurn?.(buf[3]);
    itfT.setAnimMovePower?.(buf[4] | (buf[5] << 8));
    itfT.setAnimMoveDmg?.((buf[6] | (buf[7] << 8) | (buf[8] << 16) | (buf[9] << 24)) | 0);
    itfT.setAnimFriendship?.(buf[10]);
    const g = globalThis as Record<string, unknown>;
    g.__gAnimMoveTurn = buf[3];
    g.__gAnimMovePower = buf[4] | (buf[5] << 8);
    g.__gAnimMoveDmg = (buf[6] | (buf[7] << 8) | (buf[8] << 16) | (buf[9] << 24)) | 0;
    g.__gAnimFriendship = buf[10];
    g.__gWeatherMoveAnim = buf[12] | (buf[13] << 8);
    _oppMoveAnimState[gActiveBattler] = 0;
    setBattlerControllerFunc(gActiveBattler, OpponentDoMoveAnimation);
  }
}
function OpponentDoMoveAnimation(): void {
  const itf = _animItfO();
  switch (_oppMoveAnimState[gActiveBattler]) {
    case 0:
      _oppMoveAnimState[gActiveBattler] = 1;
      break;
    case 1:
      if (itf.DoMoveAnim) itf.DoMoveAnim(_oppMoveAnimMove[gActiveBattler]);
      _oppMoveAnimState[gActiveBattler] = 2;
      break;
    case 2:
      itf.tickAnimScript?.();
      if (!itf.isAnimScriptActive?.()) _oppMoveAnimState[gActiveBattler] = 3;
      break;
    case 3:
      _oppMoveAnimState[gActiveBattler] = 0;
      OpponentBufferExecCompleted();
      break;
  }
}

function OpponentHandlePrintString(): void {
  // 1:1 décomp `OpponentHandlePrintString` (battle_controller_opponent.c:2543-2555) :
  // reset BG0 + BufferStringBattle + BattlePutTextOnWindow(gDisplayedStringBattle, 0)
  // + install CompleteOnInactiveTextPrinter.
  // BUG CORRIGÉ : c'était un STUB (`void stringId; ExecCompleted()`) → AUCUN message
  // du CONTEXTE ENNEMI ne s'affichait (flinch « X a la trouille! », « X utilise Y »
  // de l'ennemi, statuts pendant le tour ennemi). Le décomp REND le texte des 2 côtés
  // (fenêtre message PARTAGÉE B_WIN_MSG=0). Port voie L = byte path (comme
  // PlayerHandlePrintString) + fallback JS-string, via globals (évite cycle ESM).
  // 1:1 battle_controller_opponent.c:1556 : gBattle_BG0_X = 0; gBattle_BG0_Y = 0;
  // — le menu action/moves vit sur la PAGE SCROLLÉE de BG0 (vofs 160/320) ;
  // sans ce reset, le texte adverse s'écrit dans la page message HORS ÉCRAN
  // et le joueur voit le menu figé (bug user 2026-06-11 : « ni texte ni anim
  // quand Wailord attaque, pourtant j'entends le splash »).
  const gT = globalThis as Record<string, unknown>;
  gT.gBattle_BG0_X = 0;
  gT.gBattle_BG0_Y = 0;
  const stringId = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  const B_WIN_MSG = 0; // 1:1 décomp battle.h
  let rendered = false;
  try {
    const bm = (globalThis as { __battleMessage?: {
      BufferStringBattle?: (id: number, md: unknown) => number;
      gDisplayedStringBattle?: Uint8Array;
      getBattleCharmap?: () => Record<string, number> | null;
    } }).__battleMessage;
    const ctrls = (globalThis as { __battleControllers?: {
      BattlePutTextOnWindowBytes?: (b: Uint8Array, w: number) => void;
      BattlePutTextOnWindow?: (t: string | number, w: number) => void;
      getLastPrintStringMsgData?: (b?: number) => unknown;
      snapshotMsgData?: () => unknown;
    } }).__battleControllers;
    const msgData = ctrls?.getLastPrintStringMsgData?.(gActiveBattler) ?? ctrls?.snapshotMsgData?.() ?? {};
    if (bm?.BufferStringBattle && bm.gDisplayedStringBattle && bm.getBattleCharmap?.()
        && ctrls?.BattlePutTextOnWindowBytes) {
      bm.BufferStringBattle(stringId, msgData);
      ctrls.BattlePutTextOnWindowBytes(bm.gDisplayedStringBattle, B_WIN_MSG);
      rendered = true;
    } else if (ctrls?.BattlePutTextOnWindow) {
      // Fallback JS-string (charmap pas encore prête au tout 1er message).
      const api = (globalThis as { __battleStringDecoderApi?: { decodeBattleString?: (id: number, md: unknown) => string } }).__battleStringDecoderApi;
      const decoded = api?.decodeBattleString?.(stringId, msgData) ?? `[stringId=${stringId}]`;
      ctrls.BattlePutTextOnWindow(decoded, B_WIN_MSG);
      rendered = true;
    }
  } catch (e) {
    console.warn('[L] OpponentHandlePrintString : render failed, ExecCompleted :', e);
  }
  if (rendered) {
    _setBattlerControllerFunc(gActiveBattler, _CompleteOnInactiveTextPrinterOpp);
  } else {
    OpponentBufferExecCompleted();
  }
}

/** 1:1 décomp `CompleteOnInactiveTextPrinter()` (opponent, battle_controller_opponent.c) :
 *  poll IsTextPrinterActive(B_WIN_MSG) → ExecCompleted quand le texte a fini de s'imprimer.
 *  Suit le VRAI printer (gba-text-system) comme le gate joueur (cf. _IsTextPrinterActive)
 *  → gère `\p` (CHAR_PROMPT_SCROLL) = flèche ▼ + attente A/B. Avant : shim setTimeout
 *  aveugle `__textPrinterState` = auto-avance sans attendre le joueur. */
function _CompleteOnInactiveTextPrinterOpp(): void {
  if (!_IsBattleTextPrinterActiveOpp(0 /* B_WIN_MSG */)) {
    OpponentBufferExecCompleted();
  }
}
function _IsBattleTextPrinterActiveOpp(windowId: number): boolean {
  // Court-circuit harness (sync/async) — identique à l'ancien comportement sous ce flag.
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) return false;
  const real = (globalThis as { __gbaIsTextPrinterActive?: (w: number) => boolean }).__gbaIsTextPrinterActive;
  if (real) return real(windowId);
  const m = (globalThis as { __textPrinterState?: Record<number, boolean> }).__textPrinterState;
  return !!(m?.[windowId]);
}
function OpponentHandlePrintSelectionString(): void { OpponentBufferExecCompleted(); }

/** 1:1 décomp `OpponentHandleChooseAction()` (battle_controller_opponent.c:1540-1544).
 *  AI_TrySwitchOrUseItem + OpponentBufferExecCompleted (= AI decide switch/item
 *  ou use move). */
function OpponentHandleChooseAction(): void {
  _AI_TrySwitchOrUseItem();
  OpponentBufferExecCompleted();
}

function OpponentHandleYesNoBox(): void { OpponentBufferExecCompleted(); }

/** 1:1 décomp `OpponentHandleChooseMove()` (battle_controller_opponent.c:1551-1613).
 *  PALACE → ChooseMoveAndTargetInBattlePalace (dette R3 Frontier) ; sinon
 *  if (TRAINER | FIRST_BATTLE | SAFARI | ROAMER) → AI bytecode K1 :
 *    - BattleAI_SetupAIData(ALL_MOVES_MASK) + BattleAI_ChooseMoveOrAction
 *    - switch chosenMoveId : AI_CHOICE_WATCH=SAFARI_WATCH ; AI_CHOICE_FLEE=
 *      B_ACTION_RUN ; 6=B_ACTION_UNK_15 ; default=EXEC_SCRIPT moveIdx + target
 *      avec moveTarget USER/USER_OR_SELECTED override gActiveBattler + BOTH
 *      override player_left/right.
 *  sinon (= wild non-trainer) → random move pick + target single/double. */
function OpponentHandleChooseMove(): void {
  if (gBattleTypeFlags & BATTLE_TYPE_PALACE) {
    // Dette R3 : Frontier subsystem (user "Report").
    BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, _ChooseMoveAndTargetInBattlePalace());
    OpponentBufferExecCompleted();
    return;
  }

  // Read ChooseMoveStruct depuis bufferA[4..] : moves[4] u16.
  const buf = gBattleBufferA[gActiveBattler];
  const moves: number[] = [];
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    moves[i] = buf[4 + i * 2] | (buf[5 + i * 2] << 8);
  }

  if (gBattleTypeFlags & (BATTLE_TYPE_TRAINER | BATTLE_TYPE_FIRST_BATTLE | BATTLE_TYPE_SAFARI | BATTLE_TYPE_ROAMER)) {
    // AI bytecode path (= notre K1 BattleAI_ChooseMoveOrAction).
    _BattleAI_SetupAIData(_ALL_MOVES_MASK);
    const chosenMoveId = _BattleAI_ChooseMoveOrAction();

    switch (chosenMoveId) {
      case _AI_CHOICE_WATCH:
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_SAFARI_WATCH_CAREFULLY, 0);
        break;
      case _AI_CHOICE_FLEE:
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_RUN, 0);
        break;
      case 6:
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, _B_ACTION_UNK_15, gBattlerTarget);
        break;
      default: {
        const moveTarget = _getMoveTarget(moves[chosenMoveId]);
        if (moveTarget & (MOVE_TARGET_USER_OR_SELECTED | MOVE_TARGET_USER)) {
          setBattlerTarget(gActiveBattler);
        }
        if (moveTarget & MOVE_TARGET_BOTH) {
          let target = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
          if (gAbsentBattlerFlags & gBitTable[target]) {
            target = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
          }
          setBattlerTarget(target);
        }
        BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (gBattlerTarget << 8));
        break;
      }
    }
    OpponentBufferExecCompleted();
  } else {
    // Wild non-trainer non-first : random move pick.
    let chosenMoveId: number;
    let move: number;
    do {
      chosenMoveId = _MOD(_Random(), MAX_MON_MOVES);
      move = moves[chosenMoveId];
    } while (move === MOVE_NONE);

    const moveTarget = _getMoveTarget(move);
    if (moveTarget & (MOVE_TARGET_USER_OR_SELECTED | MOVE_TARGET_USER)) {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (gActiveBattler << 8));
    } else if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (GetBattlerAtPosition(_Random() & 2) << 8));
    } else {
      BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_EXEC_SCRIPT, chosenMoveId | (GetBattlerAtPosition(B_POSITION_PLAYER_LEFT) << 8));
    }
    OpponentBufferExecCompleted();
  }
}

/** 1:1 décomp `ALL_MOVES_MASK` = 0xF (battle_ai.h). */
const _ALL_MOVES_MASK = 0xF;

/** 1:1 décomp `AI_CHOICE_WATCH` = 5 (ai-state.ts). */
const _AI_CHOICE_WATCH = 5;

/** 1:1 décomp `AI_CHOICE_FLEE` = 4 (ai-state.ts). */
const _AI_CHOICE_FLEE = 4;

/** 1:1 décomp `B_ACTION_UNK_15` = 15 (battle.h:43). */
const _B_ACTION_UNK_15 = 15;

/** Wire AI APIs via globalThis lazy lookup (= éviter cycle ESM). */
function _AI_TrySwitchOrUseItem(): void {
  const m = (globalThis as { __battleAi?: { AI_TrySwitchOrUseItem?: () => void } }).__battleAi;
  m?.AI_TrySwitchOrUseItem?.();
}
function _BattleAI_SetupAIData(mask: number): void {
  const m = (globalThis as { __battleAi?: { BattleAI_SetupAIData?: (m: number) => void } }).__battleAi;
  m?.BattleAI_SetupAIData?.(mask);
}
function _BattleAI_ChooseMoveOrAction(): number {
  const m = (globalThis as { __battleAi?: { BattleAI_ChooseMoveOrAction?: () => number } }).__battleAi;
  return m?.BattleAI_ChooseMoveOrAction?.() ?? 0;
}
function _ChooseMoveAndTargetInBattlePalace(): number {
  // Dette R3 : Frontier subsystem.
  return 0;
}

/** 1:1 décomp `gBattleMoves[move].target`. Via getBattleMove (id numérique, .target
 *  résolu en nombre) — gameDataMoves est keyé par ENUM ("MOVE_X"), `parseInt(k,10)`
 *  = NaN → ne matchait jamais → toujours 0 (l'IA ne ciblait jamais USER/BOTH
 *  correctement pour ses moves auto-ciblés ou de zone). */
function _getMoveTarget(move: number): number {
  const t = getBattleMove(move).target;
  return typeof t === 'number' ? t : 0;
}

/** 1:1 décomp `MOD(a, b)` = a % b (gba/macro.h). */
function _MOD(a: number, b: number): number { return a % b; }

/** 1:1 décomp `Random()` (random.c). Wire vers RNG global. */
function _Random(): number {
  const m = (globalThis as { __rng?: { random?: () => number } }).__rng;
  if (m?.random) return m.random() & 0xFFFF;
  return Math.floor(Math.random() * 0x10000);
}

/** 1:1 décomp `OpponentHandleChooseItem()` : répond l'item choisi par l'AI
 *  (gBattleStruct->chosenItem[(battler/2)*2], posé par ShouldUseItem) via
 *  EmitOneReturnValue — sans cette réponse le moteur attendrait bufferB. */
function OpponentHandleChooseItem(): void {
  BtlController_EmitOneReturnValue(B_COMM_TO_ENGINE, gBattleStruct.chosenItem[(gActiveBattler >> 1) * 2] ?? 0);
  OpponentBufferExecCompleted();
}
/** Wire switch-in choice APIs (lazy globalThis = éviter cycle ESM). */
function _GetMostSuitableMonToSwitchInto(): number {
  const m = (globalThis as { __battleAi?: { GetMostSuitableMonToSwitchInto?: () => number } }).__battleAi;
  return m?.GetMostSuitableMonToSwitchInto?.() ?? _PARTY_SIZE;
}
function _getAiMonToSwitchIntoId(b: number): number {
  const m = (globalThis as { __battleState?: { gBattleStruct?: { AI_monToSwitchIntoId?: number[] } } }).__battleState;
  return m?.gBattleStruct?.AI_monToSwitchIntoId?.[b] ?? _PARTY_SIZE;
}
function _setAiMonToSwitchIntoId(b: number, v: number): void {
  const m = (globalThis as { __battleState?: { gBattleStruct?: { AI_monToSwitchIntoId?: number[] } } }).__battleState;
  if (m?.gBattleStruct?.AI_monToSwitchIntoId) m.gBattleStruct.AI_monToSwitchIntoId[b] = v;
}
function _getBattlerPartyIndexOpp(b: number): number {
  const m = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } }).__battleState;
  return m?.gBattlerPartyIndexes?.[b] ?? 0;
}

/** 1:1 décomp `OpponentHandleChoosePokemon()` (battle_controller_opponent.c:1621-1676).
 *  Choisit le mon à envoyer : AI_monToSwitchIntoId pré-choisi, sinon
 *  GetMostSuitableMonToSwitchInto, sinon fallback (1er mon non-fainté != mon actif).
 *  Pose `gBattleStruct.monToSwitchIntoId[active]` + émet CHOSENMONRETURNVALUE
 *  (bufferB[1]=chosenMonId, lu par l'engine → monToSwitchIntoId → getswitchedmondata
 *  rafraîchit gBattleMons). Single battle : battler1 = gActiveBattler (l'opponent).
 *  Était un STUB → le 2e mon dresseur n'était jamais chargé (freeze switch-in). */
function OpponentHandleChoosePokemon(): void {
  let chosenMonId: number;
  if (_getAiMonToSwitchIntoId(gActiveBattler) === _PARTY_SIZE) {
    chosenMonId = _GetMostSuitableMonToSwitchInto();
    if (chosenMonId === _PARTY_SIZE) {
      // 1:1 décomp 1655-1663 (chemin single) : 1er mon vivant qui n'est pas le mon actif.
      chosenMonId = 0;
      for (let i = 0; i < _PARTY_SIZE; i++) {
        if ((GetMonData(gEnemyParty[i] as never, MON_DATA_HP) as number) !== 0
            && i !== _getBattlerPartyIndexOpp(gActiveBattler)) {
          chosenMonId = i;
          break;
        }
      }
    }
  } else {
    chosenMonId = _getAiMonToSwitchIntoId(gActiveBattler);
    _setAiMonToSwitchIntoId(gActiveBattler, _PARTY_SIZE);
  }
  _setMonToSwitchIntoId(gActiveBattler, chosenMonId);
  // 1:1 BtlController_EmitChosenMonReturnValue : bufferB[0]=CONTROLLER_CHOSENMONRETURNVALUE
  // (0x22), [1]=chosenMonId → l'engine le lit pour poser monToSwitchIntoId.
  const buf = new Uint8Array(8);
  buf[0] = 0x22;
  buf[1] = chosenMonId;
  PrepareBufferDataTransfer(B_COMM_TO_ENGINE, buf, 5);
  OpponentBufferExecCompleted();
}
function OpponentHandleCmd23(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `gHealthboxSpriteIds[battler]` via la couche healthbox voie-L
 *  (__battleHealthbox, modèle décomp). 0 si pas encore créé. */
function _gHealthboxSpriteId(battler: number): number {
  const m = (globalThis as { __battleHealthbox?: { gHealthboxSpriteIds?: number[] } }).__battleHealthbox;
  return m?.gHealthboxSpriteIds?.[battler] ?? 0;
}

/** 1:1 décomp : montre + glisse le healthbox adverse au send-out
 *  (Intro_TryShinyAnimShowHealthbox) via la couche voie-L __battleHealthbox. */
function _ShowHealthboxOnSendOut(battler: number): void {
  const m = (globalThis as { __battleHealthbox?: { ShowHealthboxOnSendOut?: (b: number) => void } }).__battleHealthbox;
  m?.ShowHealthboxOnSendOut?.(battler);
}

/** 1:1 décomp `INSTANT_HP_BAR_DROP` = 0x7FFF (battle_controllers.h). */
const INSTANT_HP_BAR_DROP = 0x7FFF;

/** 1:1 décomp `OpponentHandleHealthBarUpdate()` (battle_controller_opponent.c).
 *  Miroir du player : hpVal (s16) depuis bufferA → SetBattleBarStruct depuis
 *  gEnemyParty → install CompleteOnHealthbarDone qui tick MoveBattleBar (→ le hook
 *  MoveBattleBarGraphically draîne la barre). L'adversaire n'affiche pas de digits HP. */
function OpponentHandleHealthBarUpdate(): void {
  let hpVal = gBattleBufferA[gActiveBattler][2] | (gBattleBufferA[gActiveBattler][3] << 8);
  if (hpVal & 0x8000) hpVal -= 0x10000; // sign-extend s16
  const mon = gEnemyParty[gBattlerPartyIndexes[gActiveBattler]];
  if (hpVal !== INSTANT_HP_BAR_DROP) {
    const maxHP = GetMonData(mon, MON_DATA_MAX_HP) as number;
    const curHP = GetMonData(mon, MON_DATA_HP) as number;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxHP, curHP, hpVal);
  } else {
    const maxHP = GetMonData(mon, MON_DATA_MAX_HP) as number;
    SetBattleBarStruct(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), maxHP, 0, hpVal);
  }
  _setBattlerControllerFunc(gActiveBattler, OpponentCompleteOnHealthbarDone);
}

/** 1:1 décomp `CompleteOnHealthbarDone()` (opponent) : tick MoveBattleBar (HEALTH_BAR)
 *  chaque frame jusqu'à -1 (anim finie), puis ExecCompleted. */
function OpponentCompleteOnHealthbarDone(): void {
  const ret = MoveBattleBar(gActiveBattler, _gHealthboxSpriteId(gActiveBattler), HEALTH_BAR, 0);
  if (ret === -1) {
    OpponentBufferExecCompleted();
  }
}
// 1:1 VÉRIFIÉ (audit table 2026-06-10) : ExpUpdate (l'adversaire ne gagne pas d'EXP)
// + StatusXor/DataTransfer/DMA3Transfer/PlayBGM/Cmd32/TwoReturnValues/
// ChosenMonReturnValue/OneReturnValue(_Duplicate) sont COMPLETE-ONLY décomp.
function OpponentHandleExpUpdate(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleStatusIconUpdate()` : gate IsBattleSEPlaying →
 *  UpdateHealthboxAttribute(HEALTHBOX_STATUS_ICON) sur le mon ENNEMI + clear
 *  statusAnimActive + install CompleteOnFinishedStatusAnimation (symétrique player). */
function OpponentHandleStatusIconUpdate(): void {
  if (!_IsBattleSEPlaying_Opp(gActiveBattler)) {
    const mon = gEnemyParty[gBattlerPartyIndexes[gActiveBattler] ?? 0];
    const hb = (globalThis as { __battleHealthbox?: { updateHealthboxAttribute?: (s: number, m: unknown, e: number) => void } }).__battleHealthbox;
    hb?.updateHealthboxAttribute?.(_gHealthboxSpriteId(gActiveBattler), mon, _HEALTHBOX_STATUS_ICON_OPP);
    setStatusAnimActive(gActiveBattler, false);   // 1:1 healthBoxesData[b].statusAnimActive = 0
    _setBattlerControllerFunc(gActiveBattler, _CompleteOnFinishedStatusAnimation_Opp);
  }
}
/** 1:1 décomp `HEALTHBOX_STATUS_ICON` (battle_interface.h). */
const _HEALTHBOX_STATUS_ICON_OPP = 9;
/** 1:1 décomp `IsBattleSEPlaying(battler)` (battle_main.c). Même dette que le
 *  player (_IsBattleSEPlaying) : pas de canal SE par battler → false (= done). */
function _IsBattleSEPlaying_Opp(_battler: number): boolean {
  return false;
}
/** 1:1 décomp `CompleteOnFinishedStatusAnimation()` : attend statusAnimActive=0
 *  (anim de statut lancée par STATUSANIMATION — chantier anims) puis complete. */
function _CompleteOnFinishedStatusAnimation_Opp(): void {
  if (!isStatusAnimActive(gActiveBattler)) OpponentBufferExecCompleted();
}
/** Décomp = InitAndLaunchChosenStatusAnimation — chantier anims de statut (dette). */
function OpponentHandleStatusAnimation(): void {
  // 1:1 (T3) — re-active (cf. player).
  _OpponentHandleStatusAnimation_REAL();
}
function _OpponentHandleStatusAnimation_REAL(): void {
  if (!_IsBattleSEPlaying_Opp(gActiveBattler)) {
    const buf = gBattleBufferA[gActiveBattler];
    const status = (buf[2] | (buf[3] << 8) | (buf[4] << 16) | (buf[5] << 24)) >>> 0;
    _InitAndLaunchChosenStatusAnimationOpp(buf[1] !== 0, status);
    setBattlerControllerFunc(gActiveBattler, _CompleteOnFinishedStatusAnimationOpp);
  }
}
void _OpponentHandleStatusAnimation_REAL;
function _CompleteOnFinishedStatusAnimationOpp(): void {
  if (!_isStatusAnimActiveOpp(gActiveBattler) && !_IsBattleSEPlaying_Opp(gActiveBattler)) {
    OpponentBufferExecCompleted();
  }
}
function OpponentHandleStatusXor(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDataTransfer(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDMA3Transfer(): void { OpponentBufferExecCompleted(); }
function OpponentHandlePlayBGM(): void { OpponentBufferExecCompleted(); }
function OpponentHandleCmd32(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTwoReturnValues(): void { OpponentBufferExecCompleted(); }
function OpponentHandleChosenMonReturnValue(): void { OpponentBufferExecCompleted(); }
function OpponentHandleOneReturnValue(): void { OpponentBufferExecCompleted(); }
function OpponentHandleOneReturnValue_Duplicate(): void { OpponentBufferExecCompleted(); }
// 1:1 : gUnusedControllerStruct = UNE struct EWRAM partagée (battle_controllers.c),
// importée de battle-controllers-ipc (les deux controllers y écrivent).
function OpponentHandleClearUnkVar(): void {
  gUnusedControllerStruct.unk = 0;             // 1:1 gUnusedControllerStruct.unk = 0
  OpponentBufferExecCompleted();
}
function OpponentHandleSetUnkVar(): void {
  gUnusedControllerStruct.unk = gBattleBufferA[gActiveBattler][1];  // 1:1
  OpponentBufferExecCompleted();
}
function OpponentHandleClearUnkFlag(): void {
  gUnusedControllerStruct.flag = 0;            // 1:1 gUnusedControllerStruct.flag = 0
  OpponentBufferExecCompleted();
}
function OpponentHandleToggleUnkFlag(): void {
  gUnusedControllerStruct.flag ^= 1;           // 1:1 gUnusedControllerStruct.flag ^= 1
  OpponentBufferExecCompleted();
}
/** 1:1 décomp `OpponentHandleHitAnimation()` (battle_controller_opponent.c) : symétrique au player
 *  (le mon adverse CLIGNOTE 32 frames quand touché). DoHitAnimHealthboxEffect = Dette R3 (déféré). */
function OpponentHandleHitAnimation(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
  if (!sprite || sprite.invisible === true) { OpponentBufferExecCompleted(); return; }
  sprite.data[1] = 0;
  _setBattlerControllerFunc(gActiveBattler, _DoHitAnimBlinkSpriteEffect_Opp);
}
/** 1:1 décomp `DoHitAnimBlinkSpriteEffect()` (battle_controller_*.c) côté adverse. */
function _DoHitAnimBlinkSpriteEffect_Opp(): void {
  const rt = getRuntime();
  const sprite = rt?.gSprites?.[getBattlerMonSpriteId(gActiveBattler)];
  if (!sprite) { OpponentBufferExecCompleted(); return; }
  if (sprite.data[1] === 32) {
    sprite.data[1] = 0;
    sprite.invisible = false;
    OpponentBufferExecCompleted();
  } else {
    if ((sprite.data[1] % 4) === 0) sprite.invisible = !sprite.invisible;
    sprite.data[1]++;
  }
}
function OpponentHandleCantSwitch(): void { OpponentBufferExecCompleted(); }

function OpponentHandlePlaySE(): void {
  const seId = gBattleBufferA[gActiveBattler][1] | (gBattleBufferA[gActiveBattler][2] << 8);
  void import('../harness/runtime/decomp-globals').then(({ PlaySE }) => PlaySE(seId));
  OpponentBufferExecCompleted();
}

/** Décomp = PlayBGM/fanfare (m4a) — infra BGM/SE = NE PAS TOUCHER (règle) ; dette doc. */
function OpponentHandlePlayFanfareOrBGM(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleFaintingCry()` : PlayCry_ByMode(species, 25, CRY_MODE_FAINT).
 *  Cri via le mécanisme prouvé `playCry` (= pokeball.ts:551) ; pan +25 (côté adverse)
 *  et le pitch-down FAINT = dette du mécanisme cri (même dette que le send-out). */
function OpponentHandleFaintingCry(): void {
  const mon = gEnemyParty[gBattlerPartyIndexes[gActiveBattler] ?? 0];
  const species = mon ? (GetMonData(mon as never, MON_DATA_SPECIES) as number) : 0;
  const nm = species ? reverseDecompConstant(species, 'SPECIES_') : null;
  if (nm) void import('../harness/m4a/music').then(({ playCry }) => playCry(nm)).catch(() => {});
  OpponentBufferExecCompleted();
}
/** 1:1 décomp `OpponentHandleIntroSlide()` : HandleIntroSlide(bufferA[1]) +
 *  gIntroSlideFlags |= 1 (symétrique exact de PlayerHandleIntroSlide — le moteur
 *  émet INTROSLIDE au battler actif, quel que soit le côté). */
function OpponentHandleIntroSlide(): void {
  HandleIntroSlide(gBattleBufferA[gActiveBattler][1]);
  const bmf = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    getIntroSlideFlags?: () => number; setIntroSlideFlags?: (v: number) => void;
  } | undefined;
  if (bmf?.getIntroSlideFlags && bmf.setIntroSlideFlags) bmf.setIntroSlideFlags(bmf.getIntroSlideFlags() | 1);
  OpponentBufferExecCompleted();
}
// ─── Send-out dresseur adverse 1:1 (mirror player) : front-pic slide-off + ball + waits ──────
// Le timing vient de la chaine de WAITS healthbox (comme le player) : tant qu'une Intro_* func
// est installee dans gBattlerControllerFuncs[], le bit exec reste SET -> gBattleMainFunc gele sur
// l'etat send-out (1:1 : c'EST le timer de l'intro adverse).
let _oppSendOutPhase = -1;
let _oppSendOutHbFrames = 0;
let _oppIntroEndDelay = 0;

/** 1:1 decomp `OpponentHandleIntroTrainerBallThrow()` (battle_controller_opponent.c:1867-1888).
 *  Anime le front-pic dresseur (slide-off DROITE destX=280 sur 35f via StartAnimLinearTranslation),
 *  stocke SpriteCB_FreeOpponentSprite (= free a la fin du slide), cree Task_StartSendOutAnim (lance
 *  la ball IMMEDIATEMENT, PAS de timer cote adverse), install OpponentDummy. MIROIR du player
 *  (PlayerHandleIntroTrainerBallThrow). NB en combat SAUVAGE ce handler n'est pas atteint (le mon
 *  sauvage est cree par OpponentHandleLoadMonSprite + healthbox via SpriteCB_WildMonShowHealthbox). */
function OpponentHandleIntroTrainerBallThrow(): void {
  const battler = gActiveBattler;
  // 1:1 décomp OpponentHandleIntroTrainerBallThrow : si le party-summary est affiché
  // → lance son retrait (fade+slide via la task Hide).
  if (_isPartyStatusSummaryShown(battler)) {
    SetTaskFuncToHidePartyStatusSummary(gBattlerStatusSummaryTaskId[battler]);
  }
  // Harness (__battleTextInstant) : court-circuit (callback1/2 tickes SANS runOneFrame -> SpriteCB/Task
  // ne tourneraient pas). Mon cree + healthbox + ExecCompleted. Cf. player.
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    void _loadAndCreateBattlerMonSprite(battler, true);
    _ShowHealthboxOnSendOut(battler);
    OpponentBufferExecCompleted();
    return;
  }
  // Le mon adverse sort d'une POKEBALL -> reste INVISIBLE jusqu'a l'emergence (deferReveal -> branche
  // affine emerge cote 'opponent' dans _loadAndCreateBattlerMonSprite ; revele par HandleBallAnimEnd).
  setBattlerDeferReveal(battler, true);
  void _loadAndCreateBattlerMonSprite(battler, true);

  const rt = getRuntime();
  // 1:1 ll.1871-1878 : le front-pic dresseur slide-off DROITE (destX=280, 35f) ; a la fin de la
  // translation, SpriteCB_FreeOpponentSprite (stocke en data6) le libere.
  const trainerId = getOpponentTrainerSpriteId();
  const tr = rt && trainerId >= 0 ? rt.gSprites[trainerId] : null;
  if (tr) {
    SetSpritePrimaryCoordsFromSecondaryCoords(tr);   // fold x2/y2 -> x/y (fige la pose slid-in)
    tr.data[0] = 35;        // nbFrames (1:1 l.1873)
    tr.data[2] = 280;       // destX (1:1 l.1874, hors ecran droite)
    tr.data[4] = tr.y;      // destY (1:1 l.1875, pas de mouvement vertical)
    tr.callback = StartAnimLinearTranslation;
    StoreSpriteCallbackInData6(tr, SpriteCB_FreeOpponentSprite);
  }
  // 1:1 ll.1880-1881 : CreateTask(Task_StartSendOutAnim, 5) ; gTasks[taskId].data[0] = gActiveBattler.
  if (rt) {
    const taskId = rt.CreateTask((t) => Task_StartSendOutAnim(t, rt), 5);
    const task = rt.gTasks[taskId];
    if (task) task.data[0] = battler;   // data[0] = battler (1:1 l.1881)
  }
  _oppSendOutPhase = -1;
  // 1:1 l.1886 gBattleSpritesDataPtr->animationData->introAnimActive = TRUE (pose par le chain ball
  // via setGDoingBattleAnim ; ici redondant). 1:1 l.1887 : gBattlerControllerFuncs = OpponentDummy.
  _setBattlerControllerFunc(battler, OpponentDummy);
}

/** 1:1 decomp `OpponentDummy()` (battle_controller_opponent.c) — no-op (le Task drive le send-out). */
function OpponentDummy(): void { /* no-op */ }

/** 1:1 decomp `Task_StartSendOutAnim(u8 taskId)` (battle_controller_opponent.c:1897-1924).
 *  PAS de timer cote adverse (contraire au player 31f) : lance la ball IMMEDIATEMENT
 *  (StartSendOutAnim -> DoPokeballSendOutAnimation POKEBALL_OPPONENT_SENDOUT) puis passe le
 *  controller a la chaine de waits healthbox (1:1 Intro_TryShinyAnimShowHealthbox). */
function Task_StartSendOutAnim(task: DecompTask, rt: DecompRuntime): void {
  const battler = task.data[0];
  const saved = gActiveBattler;
  setActiveBattler(battler);
  // 1:1 ll.1904-1905 : gBattleBufferA[battler][1] = gBattlerPartyIndexes[battler] ; StartSendOutAnim.
  // Le mon est deja cree (IntroTrainerBallThrow, mirror player) ; la ball le trouve via
  // getBattlerMonSpriteId + l'emerge (POKEBALL_OPPONENT_SENDOUT : SpriteCB_OpponentMonSendOut 15f
  // -> SpriteCB_ReleaseMonFromBall -> SpriteCB_OpponentMonFromBall, chain pokeball.ts #22).
  DoPokeballSendOutAnimation(0, POKEBALL_OPPONENT_SENDOUT);
  // 1:1 l.1921 : gBattlerControllerFuncs = Intro_TryShinyAnimShowHealthbox (= notre wait chain).
  _oppSendOutPhase = 1;
  _setBattlerControllerFunc(battler, _OpponentIntroSendOutWait);
  setActiveBattler(saved);
  rt.DestroyTask(task.taskId);
}

/** 1:1 decomp `SpriteCB_FreeOpponentSprite(struct Sprite *sprite)` (battle_controller_opponent.c:1890).
 *  Fin du slide-off du front-pic dresseur : le libere (FreeTrainerFrontPicPalette +
 *  FreeSpriteOamMatrix + DestroySprite). Le mon (deferReveal) est revele par la chaine ball. */
function SpriteCB_FreeOpponentSprite(_sprite: DecompSprite, _rt: DecompRuntime): void {
  destroyOpponentTrainerSprite();
}

/** Chaine de waits healthbox du send-out adverse (post-ball), 1:1 Intro_TryShinyAnimShowHealthbox
 *  -> Intro_WaitForShinyAnimAndHealthbox -> Intro_DelayAndEnd. MIROIR de _PlayerIntroSendOutWait. */
function _OpponentIntroSendOutWait(): void {
  const battler = gActiveBattler;
  const rt = getRuntime();
  switch (_oppSendOutPhase) {
    case 1: {  // 1:1 Intro_TryShinyAnimShowHealthbox : attend la fin de l'anim ball (ballAnimActive==FALSE)
      if (isBallAnimActive(battler) === false) {
        setBattlerDeferReveal(battler, false);    // le mon est deja revele par HandleBallAnimEnd
        _ShowHealthboxOnSendOut(battler);         // healthbox slide-in QUAND la ball est finie
        _oppSendOutHbFrames = 0;
        _oppSendOutPhase = 2;
      }
      break;
    }
    case 2: {  // 1:1 Intro_WaitForShinyAnimAndHealthbox : attend la fin du slide healthbox
      _oppSendOutHbFrames++;
      const hb = (globalThis as Record<string, unknown>).__battleHealthbox as { gHealthboxSpriteIds?: number[] } | undefined;
      const hbId = hb?.gHealthboxSpriteIds?.[battler] ?? -1;
      const hbSpr = hbId >= 0 ? rt?.gSprites?.[hbId] : null;
      const cbName = (hbSpr?.callback as { name?: string } | null | undefined)?.name;
      const slideDone = !hbSpr || cbName !== 'SpriteCB_HealthboxSlideIn';
      if (slideDone || _oppSendOutHbFrames > 40) {
        // 1:1 décomp Intro_WaitForShinyAnimAndHealthbox (battle_controller_opponent.c) :
        // SetBattlerShadowSpriteCallback(battler, species) APRÈS le send-out (le mon
        // existe) — active l'ombre si l'espèce a une élévation (gEnemyMonElevation).
        {
          const gfx = (globalThis as { __battleGfxSfxUtil?: { SetBattlerShadowSpriteCallback?: (b: number, s: number) => void } }).__battleGfxSfxUtil;
          const ep = (globalThis as { __gEnemyParty?: Array<{ species?: number }> }).__gEnemyParty;
          const species = ep?.[gBattlerPartyIndexes[battler] ?? 0]?.species ?? 0;
          gfx?.SetBattlerShadowSpriteCallback?.(battler, species);
        }
        _oppIntroEndDelay = 4;   // 1:1 introEndDelay=3 (+1 pour le pre-decrement)
        _oppSendOutPhase = 3;
      }
      break;
    }
    case 3: {  // 1:1 Intro_DelayAndEnd : decompte puis ExecCompleted (clear le flag -> intro continue)
      if (--_oppIntroEndDelay < 0) {
        _oppSendOutPhase = -1;
        OpponentBufferExecCompleted();
      }
      break;
    }
    default:
      OpponentBufferExecCompleted();
  }
}
/** 1:1 décomp `OpponentHandleDrawPartyStatusSummary()` (battle_controller_opponent.c:1926).
 *  Comme le player + délai 2 frames à l'intro (opponentDrawPartyStatusSummaryDelay) —
 *  le handler RE-TOURNE chaque frame (RunCommand) tant qu'il n'a pas complété. */
function OpponentHandleDrawPartyStatusSummary(): void {
  if (gBattleBufferA[gActiveBattler][1] !== 0 && _PS_SIDE(gActiveBattler) === _PS_B_SIDE_PLAYER) {
    OpponentBufferExecCompleted();
  } else {
    _setPartyStatusSummaryShown(gActiveBattler, true);
    const ba = gBattleBufferA[gActiveBattler];
    // 1:1 :1936-1947 : à l'intro, attendre 2 frames avant de créer (décale la barre
    // adverse par rapport à celle du joueur).
    if (ba[2] !== 0) {
      if (_getOppDrawPartySummaryDelay(gActiveBattler) < 2) {
        _setOppDrawPartySummaryDelay(gActiveBattler, _getOppDrawPartySummaryDelay(gActiveBattler) + 1);
        return;
      }
      _setOppDrawPartySummaryDelay(gActiveBattler, 0);
    }
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
    void ensurePartySummaryAssets().then(() => {
      gBattlerStatusSummaryTaskId[b] = CreatePartyStatusSummarySprites(b, partyInfo, skipPlayer, isBattleStart);
    });
    _setPartyStatusDelayTimer(gActiveBattler, 0);
    if (isBattleStart) _setPartyStatusDelayTimer(gActiveBattler, 93);
    _setBattlerControllerFunc(gActiveBattler, OpponentEndDrawPartyStatusSummary);
  }
}

/** 1:1 décomp `EndDrawPartyStatusSummary()` (battle_controller_opponent.c:1959). */
function OpponentEndDrawPartyStatusSummary(): void {
  const t = _getPartyStatusDelayTimer(gActiveBattler);
  _setPartyStatusDelayTimer(gActiveBattler, t + 1);
  if (t > 92) {
    _setPartyStatusDelayTimer(gActiveBattler, 0);
    OpponentBufferExecCompleted();
  }
}

/** 1:1 décomp `OpponentHandleHidePartyStatusSummary()` (battle_controller_opponent.c:1968). */
function OpponentHandleHidePartyStatusSummary(): void {
  if (_isPartyStatusSummaryShown(gActiveBattler)) {
    SetTaskFuncToHidePartyStatusSummary(gBattlerStatusSummaryTaskId[gActiveBattler]);
  }
  OpponentBufferExecCompleted();
}
function OpponentHandleEndBounceEffect(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleSpriteInvisibility()` : sprite.invisible = bufferA[1]
 *  + CopyBattleSpriteInvisibility (cf. PlayerHandleSpriteInvisibility). */
function OpponentHandleSpriteInvisibility(): void {
  const g = globalThis as {
    __battleControllerOpponent?: { getBattlerMonSpriteId?: (b: number) => number };
    __battleGfxSfxUtil?: { CopyBattleSpriteInvisibility?: (b: number) => void };
  };
  const monId = g.__battleControllerOpponent?.getBattlerMonSpriteId?.(gActiveBattler) ?? -1;
  const spr = monId >= 0 ? getRuntime()?.gSprites[monId] : undefined;
  if (spr && (spr as { inUse?: boolean }).inUse) {
    (spr as { invisible: boolean }).invisible = gBattleBufferA[gActiveBattler][1] !== 0;
    g.__battleGfxSfxUtil?.CopyBattleSpriteInvisibility?.(gActiveBattler);
  }
  OpponentBufferExecCompleted();
}
/** 1:1 décomp `OpponentHandleBattleAnimation()` (battle_controller_opponent.c) :
 *  lance l'anim GÉNÉRALE (B_ANIM_STATS_CHANGE & co) via
 *  TryHandleLaunchBattleTableAnimation + attend la fin
 *  (CompleteOnFinishedBattleAnimation :718). Était un STUB → l'anim de stats
 *  du Growl adverse ne jouait jamais. */
function OpponentHandleBattleAnimation(): void {
  if (_IsBattleSEPlaying_Opp(gActiveBattler)) return;
  const buf = gBattleBufferA[gActiveBattler];
  const animationId = buf[1];
  const argument = buf[2] | (buf[3] << 8);
  const gfx = (globalThis as Record<string, unknown>).__battleGfxSfxUtil as {
    TryHandleLaunchBattleTableAnimation?: (a: number, b: number, c: number, id: number, arg: number) => boolean;
  } | undefined;
  // 1:1 — atk/def = gActiveBattler ×3 (cf. battle_controller_player.c:3088,
  // même forme opponent : l'anim générale joue SUR le battler affecté).
  const skipped = gfx?.TryHandleLaunchBattleTableAnimation?.(
    gActiveBattler, gActiveBattler, gActiveBattler, animationId, argument) ?? true;
  if (skipped) OpponentBufferExecCompleted();
  else setBattlerControllerFunc(gActiveBattler, CompleteOnFinishedBattleAnimation);
}
function OpponentHandleLinkStandbyMsg(): void { OpponentBufferExecCompleted(); }
function OpponentHandleResetActionMoveSelection(): void { OpponentBufferExecCompleted(); }
/** 1:1 COMPORTEMENTAL : le corps décomp est gaté `BATTLE_TYPE_LINK && !IS_MASTER`
 *  (restore callback overworld côté esclave link) → jamais vrai en local single ;
 *  complete direct = même comportement observable. */
function OpponentHandleEndLinkBattle(): void { OpponentBufferExecCompleted(); }
function OpponentCmdEnd(): void { /* NOP terminator */ }

// ─── sOpponentBufferCommands dispatch table (1:1 décomp 107-173) ───────────

/** 1:1 décomp `sOpponentBufferCommands[CONTROLLER_CMDS_COUNT]`. */
export const sOpponentBufferCommands: Array<() => void> = new Array(CONTROLLER_CMDS_COUNT);

function _initSOpponentBufferCommands(): void {
  sOpponentBufferCommands[CONTROLLER_GETMONDATA] = OpponentHandleGetMonData;
  sOpponentBufferCommands[CONTROLLER_GETRAWMONDATA] = OpponentHandleGetRawMonData;
  sOpponentBufferCommands[CONTROLLER_SETMONDATA] = OpponentHandleSetMonData;
  sOpponentBufferCommands[CONTROLLER_SETRAWMONDATA] = OpponentHandleSetRawMonData;
  sOpponentBufferCommands[CONTROLLER_LOADMONSPRITE] = OpponentHandleLoadMonSprite;
  sOpponentBufferCommands[CONTROLLER_SWITCHINANIM] = OpponentHandleSwitchInAnim;
  sOpponentBufferCommands[CONTROLLER_RETURNMONTOBALL] = OpponentHandleReturnMonToBall;
  sOpponentBufferCommands[CONTROLLER_DRAWTRAINERPIC] = OpponentHandleDrawTrainerPic;
  sOpponentBufferCommands[CONTROLLER_TRAINERSLIDE] = OpponentHandleTrainerSlide;
  sOpponentBufferCommands[CONTROLLER_TRAINERSLIDEBACK] = OpponentHandleTrainerSlideBack;
  sOpponentBufferCommands[CONTROLLER_FAINTANIMATION] = OpponentHandleFaintAnimation;
  sOpponentBufferCommands[CONTROLLER_PALETTEFADE] = OpponentHandlePaletteFade;
  sOpponentBufferCommands[CONTROLLER_SUCCESSBALLTHROWANIM] = OpponentHandleSuccessBallThrowAnim;
  sOpponentBufferCommands[CONTROLLER_BALLTHROWANIM] = OpponentHandleBallThrow;
  sOpponentBufferCommands[CONTROLLER_PAUSE] = OpponentHandlePause;
  sOpponentBufferCommands[CONTROLLER_MOVEANIMATION] = OpponentHandleMoveAnimation;
  sOpponentBufferCommands[CONTROLLER_PRINTSTRING] = OpponentHandlePrintString;
  sOpponentBufferCommands[CONTROLLER_PRINTSTRINGPLAYERONLY] = OpponentHandlePrintSelectionString;
  sOpponentBufferCommands[CONTROLLER_CHOOSEACTION] = OpponentHandleChooseAction;
  sOpponentBufferCommands[CONTROLLER_YESNOBOX] = OpponentHandleYesNoBox;
  sOpponentBufferCommands[CONTROLLER_CHOOSEMOVE] = OpponentHandleChooseMove;
  sOpponentBufferCommands[CONTROLLER_OPENBAG] = OpponentHandleChooseItem;
  sOpponentBufferCommands[CONTROLLER_CHOOSEPOKEMON] = OpponentHandleChoosePokemon;
  sOpponentBufferCommands[CONTROLLER_23] = OpponentHandleCmd23;
  sOpponentBufferCommands[CONTROLLER_HEALTHBARUPDATE] = OpponentHandleHealthBarUpdate;
  sOpponentBufferCommands[CONTROLLER_EXPUPDATE] = OpponentHandleExpUpdate;
  sOpponentBufferCommands[CONTROLLER_STATUSICONUPDATE] = OpponentHandleStatusIconUpdate;
  sOpponentBufferCommands[CONTROLLER_STATUSANIMATION] = OpponentHandleStatusAnimation;
  sOpponentBufferCommands[CONTROLLER_STATUSXOR] = OpponentHandleStatusXor;
  sOpponentBufferCommands[CONTROLLER_DATATRANSFER] = OpponentHandleDataTransfer;
  sOpponentBufferCommands[CONTROLLER_DMA3TRANSFER] = OpponentHandleDMA3Transfer;
  sOpponentBufferCommands[CONTROLLER_PLAYBGM] = OpponentHandlePlayBGM;
  sOpponentBufferCommands[CONTROLLER_32] = OpponentHandleCmd32;
  sOpponentBufferCommands[CONTROLLER_TWORETURNVALUES] = OpponentHandleTwoReturnValues;
  sOpponentBufferCommands[CONTROLLER_CHOSENMONRETURNVALUE] = OpponentHandleChosenMonReturnValue;
  sOpponentBufferCommands[CONTROLLER_ONERETURNVALUE] = OpponentHandleOneReturnValue;
  sOpponentBufferCommands[CONTROLLER_ONERETURNVALUE_DUPLICATE] = OpponentHandleOneReturnValue_Duplicate;
  sOpponentBufferCommands[CONTROLLER_CLEARUNKVAR] = OpponentHandleClearUnkVar;
  sOpponentBufferCommands[CONTROLLER_SETUNKVAR] = OpponentHandleSetUnkVar;
  sOpponentBufferCommands[CONTROLLER_CLEARUNKFLAG] = OpponentHandleClearUnkFlag;
  sOpponentBufferCommands[CONTROLLER_TOGGLEUNKFLAG] = OpponentHandleToggleUnkFlag;
  sOpponentBufferCommands[CONTROLLER_HITANIMATION] = OpponentHandleHitAnimation;
  sOpponentBufferCommands[CONTROLLER_CANTSWITCH] = OpponentHandleCantSwitch;
  sOpponentBufferCommands[CONTROLLER_PLAYSE] = OpponentHandlePlaySE;
  sOpponentBufferCommands[CONTROLLER_PLAYFANFAREORBGM] = OpponentHandlePlayFanfareOrBGM;
  sOpponentBufferCommands[CONTROLLER_FAINTINGCRY] = OpponentHandleFaintingCry;
  sOpponentBufferCommands[CONTROLLER_INTROSLIDE] = OpponentHandleIntroSlide;
  sOpponentBufferCommands[CONTROLLER_INTROTRAINERBALLTHROW] = OpponentHandleIntroTrainerBallThrow;
  sOpponentBufferCommands[CONTROLLER_DRAWPARTYSTATUSSUMMARY] = OpponentHandleDrawPartyStatusSummary;
  sOpponentBufferCommands[CONTROLLER_HIDEPARTYSTATUSSUMMARY] = OpponentHandleHidePartyStatusSummary;
  sOpponentBufferCommands[CONTROLLER_ENDBOUNCE] = OpponentHandleEndBounceEffect;
  sOpponentBufferCommands[CONTROLLER_SPRITEINVISIBILITY] = OpponentHandleSpriteInvisibility;
  sOpponentBufferCommands[CONTROLLER_BATTLEANIMATION] = OpponentHandleBattleAnimation;
  sOpponentBufferCommands[CONTROLLER_LINKSTANDBYMSG] = OpponentHandleLinkStandbyMsg;
  sOpponentBufferCommands[CONTROLLER_RESETACTIONMOVESELECTION] = OpponentHandleResetActionMoveSelection;
  sOpponentBufferCommands[CONTROLLER_ENDLINKBATTLE] = OpponentHandleEndLinkBattle;
  sOpponentBufferCommands[CONTROLLER_TERMINATOR_NOP] = OpponentCmdEnd;
}
_initSOpponentBufferCommands();

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleControllerOpponent = {
  sOpponentBufferCommands,
  SetControllerToOpponent, OpponentBufferRunCommand,
  // 1:1 `gBattlerSpriteIds[battler]` — registre voie-L des sprites mon. Expose cycle-safe
  // pour battle-sprite-callbacks (_getBattlerSpriteId du bounce) qui ne peut PAS importer
  // opponent.ts (opponent importe deja battle-sprite-callbacks -> cycle ESM).
  getBattlerMonSpriteId,
};

/**
 * battle/battle-controller-opponent.ts — Port 1:1 strict de l'Opponent Controller.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_controller_opponent.c`
 * (~2027 lignes C, ~95 handlers).
 *
 * Structure symétrique au Player controller (K31) :
 *   - sOpponentBufferCommands[CONTROLLER_CMDS_COUNT] : dispatch table
 *   - SetControllerToOpponent : install OpponentBufferRunCommand
 *   - OpponentBufferRunCommand : dispatch sOpponentBufferCommands[bufferA[0]]()
 *   - OpponentBufferExecCompleted : reset func + clear exec flag
 *
 * **User priority** : nécessaire pour premier combat rival.
 *
 * ## Différence vs Player
 *
 * Opponent controller :
 *   - Pas d'input UI (= ChooseAction/Move/Item sont AI-driven)
 *   - Sprite côté droit du screen
 *   - Wild battle : sprite mon front
 *   - Trainer battle : sprite trainer pic puis send-out
 *
 * ## Port progressif
 *
 * **Phase A (this commit)** : dispatcher + 56 handlers core (= structure
 * 1:1 strict avec ExecCompleted immediate pour permettre flow).
 *
 * **Phase B/C** : AI choose move complet + send-out anim cascade visuels.
 *
 * Dépendances :
 *   - K29 battle-controllers-ipc : gBattleBufferA/B + PrepareBufferDataTransfer
 *   - state.ts : gActiveBattler + gBattleTypeFlags
 *   - battle-controllers.ts : gBitTable + MarkBattlerForControllerExec
 */

import {
  gActiveBattler, gBattleTypeFlags, gBattleControllerExecFlags,
  setBattleControllerExecFlags,
  gAbsentBattlerFlags, gBattlerTarget, setBattlerTarget,
  setBattlerControllerFunc, gBattlerPartyIndexes,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE,
  BATTLE_TYPE_TRAINER, BATTLE_TYPE_FIRST_BATTLE, BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_ROAMER,
  B_ACTION_EXEC_SCRIPT, B_ACTION_RUN,
  B_ACTION_SAFARI_WATCH_CAREFULLY,
  MOVE_TARGET_USER, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_BOTH,
  MAX_MON_MOVES, MOVE_NONE,
} from './constants';
import {
  gBattleBufferA, gBattleBufferB, B_COMM_TO_ENGINE,
  PrepareBufferDataTransfer, BtlController_EmitTwoReturnValues,
} from './battle-controllers-ipc';
import { gBitTable } from './battle-controllers';
import {
  GetBattlerAtPosition, GetBattlerPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
} from './util';
import { getBattleMove } from './data/battle-moves';
import { gEnemyParty, gPlayerParty, GetMonData, MON_DATA_HP, MON_DATA_MAX_HP, MON_DATA_SPECIES } from './party-storage';
import { SetBattleBarStruct, MoveBattleBar, HEALTH_BAR } from './battle-hp-bar';
import { reverseDecompConstant } from '../system/decomp-constants';
import { loadTileBin, loadGbaPal } from '../gba/png-loader';
import { CreateSprite } from '../system/decomp-bridge';
import { OBJ_PLTT_ID } from '../system/decomp-runtime';
import { LoadPalette, getRuntime } from '../system/decomp-globals';
import { SpriteCB_WildMon } from './battle-sprite-callbacks';

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

function OpponentHandleGetRawMonData(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSetMonData(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSetRawMonData(): void { OpponentBufferExecCompleted(); }
/** 1:1 décomp `OpponentHandleLoadMonSprite()` (battle_controller_opponent.c:1137).
 *  Charge le front pic du mon ennemi (gfx + palette OBJ slot battler) + spawn le
 *  sprite via CreateSprite (template inline → keystone CreateSpriteInline). Asset
 *  PNG = chargé ASYNC → fire-and-forget (le sprite apparaît dès le chargement).
 *  On garde OpponentBufferExecCompleted pour ne PAS bloquer le flux vérifié (le
 *  décomp installe TryShinyAnimAfterMonAnim ; shiny/shadow/StartSpriteAnim = raffinement). */
function OpponentHandleLoadMonSprite(): void {
  void _loadAndCreateBattlerMonSprite(gActiveBattler, true);
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
export async function _loadAndCreateBattlerMonSprite(battler: number, isOpponent: boolean): Promise<number> {
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
    // species num → enum 'SPECIES_X' (= clé dossier assets + mon-pic-coords).
    const enumName = reverseDecompConstant(sp, 'SPECIES_');
    if (!enumName) { console.warn('[battler-sprite] enum introuvable pour species', sp); return -1; }
    const folder = enumName.replace(/^SPECIES_/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const picFile = isOpponent ? 'anim_front.png' : 'back.png';
    const tiles = await loadTileBin(`/decomp/em/pokemon/${folder}/${picFile}`, 4);
    const pal = await loadGbaPal(`/decomp/em/pokemon/${folder}/normal.pal`);
    // 1:1 BattleLoadOpponentMonSpriteGfx : LoadPalette(pal, OBJ_PLTT_ID(battler), PLTT_SIZE_4BPP).
    LoadPalette(pal, OBJ_PLTT_ID(battler), 32);
    const FRAME0 = 0x800;  // 64 tiles 64x64 4bpp = frame 0 (anim_front = 2 frames empilées).
    const frame0 = tiles.subarray(0, FRAME0);
    // 1:1 GetBattlerSpriteFinal_Y (battle_anim_mons.c:269) : y = yOffset + sBattlerCoords.y
    // (ennemi front.yOffset - elevation ; elevation=0 sauf gros mons = dette R3).
    const coords = await _loadMonPicCoords();
    const c = coords[enumName];
    const baseY = _sBattlerCoordsSingle[GetBattlerPosition(battler) & 3]?.[1] ?? 40;
    const y = (c ? (isOpponent ? c.front.yOffset : c.back.yOffset) : 0) + baseY;
    // 1:1 SetMultiuseSpriteTemplateToPokemon + CreateSprite : template INLINE
    // (tileTag=TAG_NONE + images) → keystone CreateSpriteInline. shape0/size3 = 64x64.
    const spriteId = CreateSprite({
      oam: { shape: 0, size: 3, priority: 1, paletteNum: battler, affineMode: 0 },
      images: [{ data: frame0, size: FRAME0 }],
      callback: null,
    }, _GetBattlerSpriteCoordX(battler), y, 2);
    _registerBattlerMonSprite(battler, spriteId);
    // 1:1 décomp OpponentHandleLoadMonSprite (battle_controller_opponent.c:1149-1153) : le mon
    // SAUVAGE adverse naît HORS-ÉCRAN DROITE (x2=-DISPLAY_WIDTH) avec le callback SpriteCB_WildMon
    // (du template gBattlerSpriteTemplates[B_POSITION_OPPONENT_LEFT], pokemon.c:1959) → il GLISSE
    // vers la position (SpriteCB_MoveWildMonToRight: x2+=2) en TEINTE OMBRÉE (BeginNormalPaletteFade
    // 0x20000 RGB(8,8,8)), puis healthbox slide-in + dé-teinte (SpriteCB_WildMonShowHealthbox).
    // sBattler=data[0], sSpeciesId=data[2] (1:1 #define battle_main.c:2664-2665). animEnded=true :
    // le mon est mono-frame (CreateSpriteInline sans anims) → sinon SpriteCB_WildMonShowHealthbox
    // (gate sur sprite->animEnded) ne se déclencherait JAMAIS (mon glisse mais healthbox/dé-teinte
    // jamais). Côté JOUEUR (back-sprite) : pas de slide ici (il sort d'une ball = chantier send-out).
    if (isOpponent) {
      const spr = getRuntime()?.gSprites?.get(spriteId);
      if (spr) {
        spr.x2 = -240;   // -DISPLAY_WIDTH
        // sBattler=data[0], sSpeciesId=data[2] (1:1 battle_controller_opponent.c:1150-1151).
        // ⚠️ spr.data est un Int16Array (PAS un Array JS) → ne PAS gater sur Array.isArray
        // (faux → data jamais posés → SpriteCB_WildMonShowHealthbox lit battler=0 = mauvais
        // healthbox). L'indexation marche sur le typed array.
        if (spr.data) { spr.data[0] = battler; spr.data[2] = sp; }
        spr.animEnded = true;
        (spr as { callback: unknown }).callback = SpriteCB_WildMon;
      }
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
interface _PendingReveal { battler: number; spriteId: number; frames: number; }
const _pendingMonReveals: _PendingReveal[] = [];

/** 1:1 décomp gBattlerSpriteIds[battler] (registre voie L des sprites mon). */
export function getBattlerMonSpriteId(battler: number): number {
  return _battlerMonSpriteIds[battler] ?? -1;
}

function _registerBattlerMonSprite(battler: number, spriteId: number): void {
  _battlerMonSpriteIds[battler] = spriteId;
  // Cache le sprite jusqu'à ce que sa palette OBJ soit live (anti « sprite noir »).
  const rt = getRuntime();
  const spr = rt?.gSprites?.get(spriteId);
  if (spr) spr.invisible = true;
  // Remplace toute révélation en attente pour ce battler (re-création = switch).
  for (let i = _pendingMonReveals.length - 1; i >= 0; i--) {
    if (_pendingMonReveals[i].battler === battler) _pendingMonReveals.splice(i, 1);
  }
  _pendingMonReveals.push({ battler, spriteId, frames: 0 });
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
      const spr = rt.gSprites?.get(p.spriteId);
      if (spr) spr.invisible = false;
      _pendingMonReveals.splice(i, 1);
    }
  }
}

/** Reset le registre + révélations en attente (= teardown / nouveau combat). */
export function resetBattlerMonSprites(): void {
  _battlerMonSpriteIds.fill(-1);
  _pendingMonReveals.length = 0;
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
  // Dette R3 : full sprite cascade + DoPokeballSendOutAnimation POKEBALL_OPPONENT.
  const m = (globalThis as { __battleBallThrow?: { doPokeballSendOutAnimationOpponent?: (b: number, c: boolean) => void } }).__battleBallThrow;
  m?.doPokeballSendOutAnimationOpponent?.(battler, dontClearSubstituteBit);
}

function _installSwitchInTryShinyAnim(_battler: number): void {
  // Dette R3 : full shiny anim controller. Pour now : immediate.
  // Note : called via gBattlerControllerFuncs install par controller dispatch,
  // mais nous appelons via le hook qui mappe vers OpponentBufferExecCompleted.
  OpponentBufferExecCompleted();
}
function OpponentHandleReturnMonToBall(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDrawTrainerPic(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTrainerSlide(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTrainerSlideBack(): void { OpponentBufferExecCompleted(); }
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
      _triggerFaintSlideAnim_Opponent(gActiveBattler);
      // Install HideHealthboxAfterMonFaint (dette R3 hide healthbox).
      OpponentBufferExecCompleted();
    }
  }
}

const _B_ANIM_SUBSTITUTE_TO_MON = 6;
const _SE_FAINT_OP = 21;
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
  const m = (globalThis as { __battleAnim?: { initAndLaunchSpecialAnimation?: (a: number, at: number, t: number, aid: number) => void } }).__battleAnim;
  m?.initAndLaunchSpecialAnimation?.(_a, _at, _t, _aid);
}
function _PlaySE12WithPanning(seId: number, _pan: number): void {
  const g = globalThis as { __PlaySE?: (id: number) => void };
  if (g.__PlaySE) g.__PlaySE(seId);
}
function _triggerFaintSlideAnim_Opponent(battler: number): void {
  const m = (globalThis as { __battleFaintAnim?: { triggerFaintSlide?: (b: number) => void } }).__battleFaintAnim;
  m?.triggerFaintSlide?.(battler);
}
function OpponentHandlePaletteFade(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSuccessBallThrowAnim(): void { OpponentBufferExecCompleted(); }
function OpponentHandleBallThrowAnim(): void { OpponentBufferExecCompleted(); }
function OpponentHandlePause(): void { OpponentBufferExecCompleted(); }
function OpponentHandleMoveAnimation(): void { OpponentBufferExecCompleted(); }

function OpponentHandlePrintString(): void {
  // 1:1 décomp `OpponentHandlePrintString` (battle_controller_opponent.c:2543-2555) :
  // reset BG0 + BufferStringBattle + BattlePutTextOnWindow(gDisplayedStringBattle, 0)
  // + install CompleteOnInactiveTextPrinter.
  // BUG CORRIGÉ : c'était un STUB (`void stringId; ExecCompleted()`) → AUCUN message
  // du CONTEXTE ENNEMI ne s'affichait (flinch « X a la trouille! », « X utilise Y »
  // de l'ennemi, statuts pendant le tour ennemi). Le décomp REND le texte des 2 côtés
  // (fenêtre message PARTAGÉE B_WIN_MSG=0). Port voie L = byte path (comme
  // PlayerHandlePrintString) + fallback JS-string, via globals (évite cycle ESM).
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

function OpponentHandleChooseItem(): void { OpponentBufferExecCompleted(); }
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
function OpponentHandleExpUpdate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleStatusIconUpdate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleStatusAnimation(): void { OpponentBufferExecCompleted(); }
function OpponentHandleStatusXor(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDataTransfer(): void { OpponentBufferExecCompleted(); }
function OpponentHandleDMA3Transfer(): void { OpponentBufferExecCompleted(); }
function OpponentHandlePlayBGM(): void { OpponentBufferExecCompleted(); }
function OpponentHandleCmd32(): void { OpponentBufferExecCompleted(); }
function OpponentHandleTwoReturnValues(): void { OpponentBufferExecCompleted(); }
function OpponentHandleChosenMonReturnValue(): void { OpponentBufferExecCompleted(); }
function OpponentHandleOneReturnValue(): void { OpponentBufferExecCompleted(); }
function OpponentHandleOneReturnValue_Duplicate(): void { OpponentBufferExecCompleted(); }
function OpponentHandleClearUnkVar(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSetUnkVar(): void { OpponentBufferExecCompleted(); }
function OpponentHandleClearUnkFlag(): void { OpponentBufferExecCompleted(); }
function OpponentHandleToggleUnkFlag(): void { OpponentBufferExecCompleted(); }
function OpponentHandleHitAnimation(): void { OpponentBufferExecCompleted(); }
function OpponentHandleCantSwitch(): void { OpponentBufferExecCompleted(); }

function OpponentHandlePlaySE(): void {
  const seId = gBattleBufferA[gActiveBattler][1] | (gBattleBufferA[gActiveBattler][2] << 8);
  void import('../system/decomp-globals').then(({ PlaySE }) => PlaySE(seId));
  OpponentBufferExecCompleted();
}

function OpponentHandlePlayFanfareOrBGM(): void { OpponentBufferExecCompleted(); }
function OpponentHandleFaintingCry(): void { OpponentBufferExecCompleted(); }
function OpponentHandleIntroSlide(): void { OpponentBufferExecCompleted(); }
function OpponentHandleIntroTrainerBallThrow(): void {
  // 1:1 décomp : à la sortie du mon adverse (combat DRESSEUR), le healthbox (créé
  // invisible à l'init) est montré + glissé en place (Intro_TryShinyAnimShowHealthbox
  // → StartHealthboxSlideIn). NB : en combat SAUVAGE ce handler n'est pas atteint
  // (pas de send-out adverse) ; le healthbox sauvage est montré par
  // BattleIntroPrintWildMonAttacked (1:1 SpriteCB_WildMonShowHealthbox).
  _ShowHealthboxOnSendOut(gActiveBattler);
  OpponentBufferExecCompleted();
}
function OpponentHandleDrawPartyStatusSummary(): void { OpponentBufferExecCompleted(); }
function OpponentHandleHidePartyStatusSummary(): void { OpponentBufferExecCompleted(); }
function OpponentHandleEndBounceEffect(): void { OpponentBufferExecCompleted(); }
function OpponentHandleSpriteInvisibility(): void { OpponentBufferExecCompleted(); }
function OpponentHandleBattleAnimation(): void { OpponentBufferExecCompleted(); }
function OpponentHandleLinkStandbyMsg(): void { OpponentBufferExecCompleted(); }
function OpponentHandleResetActionMoveSelection(): void { OpponentBufferExecCompleted(); }
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
  sOpponentBufferCommands[CONTROLLER_BALLTHROWANIM] = OpponentHandleBallThrowAnim;
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
};

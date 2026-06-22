/**
 * game/pokeball.ts — Port MIROIR 1:1 de `src/pokeball.c` (sequence SEND-OUT).
 *
 * Source de verite : `D:/Projet 1/decomps/pokeemeraude/src/pokeball.c`
 *
 * ⚠️ Port PROGRESSIF (pokeball.c = 1345 l.). Perimetre = la chaine SEND-OUT (le
 * dresseur lance sa ball, le mon emerge), DISTINCTE du throw de CAPTURE
 * (SpriteCB_BallThrow + shakes, deferee). Cette 1re tranche = les pieces STANDALONE
 * (constantes + GetBattlerPokeballItemId), sans dependance au chain de SpriteCB.
 *
 * Prerequis DEJA portes (importes, zero dup) :
 *   - ItemIdToBallId            : battle-anim-throw.ts (battle_anim_throw.c:728)
 *   - SpriteCB_PlayerMonFromBall / SpriteCB_OpponentMonFromBall : battle-sprite-callbacks.ts (battle_main.c)
 *   - CreateSprite (template taggee + affineAnims) : decomp-bridge.ts (#20)
 *   - GetBattlerSpriteCoord / GetBattlerSpriteDefault_Y : game/battle_anim_mons.ts (#19)
 *   - InitAnimArcTranslation / AnimTranslateLinear / TranslateAnimHorizontalArc : game/battle_anim_mons.ts
 *   - AnimateBallOpenParticles / LaunchBallFadeMonTask / SetUpForReleaseAffineAnim : pokeball-effects.ts
 *
 * RESTE (tranches suivantes, DORMANT) :
 *   - Tables : sBallOamData / sBallAnimSequences / gBallSpriteTemplates (callback decomp =
 *     SpriteCB_BallThrow capture, override par le send-out -> SpriteCallbackDummy + dette capture).
 *   - LoadBallGfx / FreeBallGfx : PREREQUIS GFX a resoudre — chargement de la sheet ball par
 *     TAG (gBallSpriteSheets) ; notre runtime charge en ASYNC (friction sync/async, cf. pic
 *     coords) ; battle-anim-throw.ts:498 = stub "Dette R3". A porter avant le chain.
 *   - DoPokeballSendOutAnimation (335) + Task_DoPokeballSendOutAnim (352) + SpriteCB_PlayerMonSendOut_1/2
 *     (911/924) + SpriteCB_OpponentMonSendOut (991) + SpriteCB_ReleaseMon2FromBall (982) +
 *     SpriteCB_ReleaseMonFromBall (750) + HandleBallAnimEnd (845) + Task_PlayCryWhenReleasedFromBall
 *     (665, cris = dette : PlayCry_ByMode absent).
 *
 * DORMANT : non cable (le send-out tourne encore sur l'ad-hoc battle-sendout-anim.ts).
 * Le cablage reel + retrait ad-hoc = #22 (A/B user requis).
 */

import type { DecompSprite, DecompTask, DecompRuntime } from '../harness/runtime/decomp-runtime';
import { GetBattlerPosition, GetBattlerAtPosition } from './engine/battle/util';
import { gBattlerPartyIndexes, gActiveBattler, gBattlerTarget, gBattleTypeFlags, setBattlerTarget, setGDoingBattleAnim } from './engine/battle/state';
import { B_SIDE_PLAYER, B_SIDE_OPPONENT, BATTLE_TYPE_DOUBLE } from './engine/battle/constants';
import { gPlayerParty, gEnemyParty, GetMonData, MON_DATA_POKEBALL, MON_DATA_SPECIES } from './engine/battle/party-storage';
import { ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, AnimateSprite, type AnimCmd } from './sprite';
import { ST_OAM_AFFINE_DOUBLE } from '../harness/runtime/decomp-helpers';
import { SpriteCallbackDummy, LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap, FreeSpriteTilesByTag, getRuntime, assetCache } from '../harness/runtime/decomp-globals';
import { GetSpriteTileStartByTag, FreeSpritePaletteByTag, DestroySprite, FreeOamMatrix } from './sprite';
import { CreateSprite } from '../harness/runtime/decomp-bridge';
import { BALL_DIVE, BALL_LUXURY, BALL_PREMIER, LaunchBallFadeMonTask } from './engine/system/pokeball-effects';
import { ItemIdToBallId, AnimateBallOpenParticles } from './battle_anim_throw';
import { getBattlerMonSpriteId } from './battle_controller_opponent';
import { SpriteCB_PlayerMonFromBall, SpriteCB_OpponentMonFromBall } from './engine/battle/battle-sprite-callbacks';
import {
  GetBattlerSpriteCoord, InitAnimArcTranslation, AnimTranslateLinear, TranslateAnimHorizontalArc,
} from './battle_anim_mons';
import { Sin } from './trig';
import { isBallAnimActive, setBallAnimActive, setWaitForCry, isIntroAnimActive } from './engine/battle/battle-sprites-data';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { BeginAffineAnim } from './engine/decomp-impls/sprite-engine-impl';
import {
  GFX_TAG_POKE_BALL, GFX_TAG_GREAT_BALL, GFX_TAG_SAFARI_BALL, GFX_TAG_ULTRA_BALL,
  GFX_TAG_MASTER_BALL, GFX_TAG_NET_BALL, GFX_TAG_DIVE_BALL, GFX_TAG_NEST_BALL,
  GFX_TAG_REPEAT_BALL, GFX_TAG_TIMER_BALL, GFX_TAG_LUXURY_BALL, GFX_TAG_PREMIER_BALL,
} from './engine/decomp-data/src/pokeball-data';

// 1:1 decomp include/pokeball.h:33-34 — `kindOfThrow` de DoPokeballSendOutAnimation.
// (Les autres valeurs 1..4 = nombre de secousses du throw de capture.)
export const POKEBALL_PLAYER_SENDOUT = 0xFF;
export const POKEBALL_OPPONENT_SENDOUT = 0xFE;

/** 1:1 decomp pokeball.c:1338 `static u16 GetBattlerPokeballItemId(u8 battler)`.
 *  Renvoie l'ITEM_X_BALL avec lequel le mon du battler a ete capture (MON_DATA_POKEBALL).
 *  -> ItemIdToBallId() le convertit en BALL_X pour choisir le sprite de la ball. */
export function GetBattlerPokeballItemId(battler: number): number {
  // 1:1 : GetBattlerSide(battler) == B_SIDE_PLAYER  (= GetBattlerPosition(battler) & BIT_SIDE).
  if ((GetBattlerPosition(battler) & 1) === B_SIDE_PLAYER) {
    return GetMonData(gPlayerParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_POKEBALL) as number;
  }
  return GetMonData(gEnemyParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_POKEBALL) as number;
}

// ════════════════════════════════════════════════════════════════════════════
// TABLES BALL (pokeball.c:92-327) — DATA, consommees par CreateSprite (#20).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 decomp pokeball.c:92-107 `sBallOamData` : sprite 16x16 (shape SQUARE, size 1),
// ST_OAM_AFFINE_DOUBLE (zone de rendu 32x32 pour la rotation de la ball), priority 2.
// (objMode/mosaic/bpp/matrixNum/tileNum/affineParam = defauts du modele OAM runtime.)
const sBallOamData = {
  shape: 0,                          // SPRITE_SHAPE(16x16) = SQUARE
  size: 1,                           // SPRITE_SIZE(16x16)
  affineMode: ST_OAM_AFFINE_DOUBLE,
  priority: 2,
  paletteNum: 0,
};

// 1:1 decomp pokeball.c:109-151 — sequences d'anim de FRAME de la ball.
// imageValue = tileOffset ; duration = frames. ANIMCMD_JUMP(0) = boucle, ANIMCMD_END = stop.
const sBallAnimSeq0: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(0, 1), ANIMCMD_END];
const sBallAnimSeq1: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 5), ANIMCMD_FRAME(8, 5), ANIMCMD_END];
const sBallAnimSeq2: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 5), ANIMCMD_FRAME(0, 5), ANIMCMD_END];
const sBallAnimSeq3: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(0, 5), ANIMCMD_JUMP(0)];   // unused?
const sBallAnimSeq4: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(8, 5), ANIMCMD_JUMP(0)];
const sBallAnimSeq5: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(4, 1), ANIMCMD_JUMP(0)];
const sBallAnimSeq6: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(12, 1), ANIMCMD_JUMP(0)];
// 1:1 decomp pokeball.c:153-164 `sBallAnimSequences[]` (ordre 0..6).
export const sBallAnimSequences: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  sBallAnimSeq0, sBallAnimSeq1, sBallAnimSeq2, sBallAnimSeq3, sBallAnimSeq4, sBallAnimSeq5, sBallAnimSeq6,
];

// 1:1 decomp pokeball.c:205-327 `gBallSpriteTemplates[POKEBALL_COUNT]`, indexe par
// BALL_POKE..BALL_PREMIER (0..11). Les 12 entrees ne different QUE par le tag gfx
// (oam/anims/affineAnims/callback identiques). Le callback decomp = SpriteCB_BallThrow
// (throw de CAPTURE pokeball.c:424, HORS perimetre send-out) ; le send-out OVERRIDE le
// callback dans Task_DoPokeballSendOutAnim -> SpriteCallbackDummy + dette capture.
// affineAnims = NOM de la table enregistree (sprite-affine-extras.ts), lu par CreateSprite (#20).
// images: NULL (decomp) -> omis : CreateSprite (#20) route via tileTag (sheet), pas images.
const _ballGfxTags: ReadonlyArray<number> = [
  GFX_TAG_POKE_BALL, GFX_TAG_GREAT_BALL, GFX_TAG_SAFARI_BALL, GFX_TAG_ULTRA_BALL,
  GFX_TAG_MASTER_BALL, GFX_TAG_NET_BALL, GFX_TAG_DIVE_BALL, GFX_TAG_NEST_BALL,
  GFX_TAG_REPEAT_BALL, GFX_TAG_TIMER_BALL, GFX_TAG_LUXURY_BALL, GFX_TAG_PREMIER_BALL,
];
export const gBallSpriteTemplates = _ballGfxTags.map((tag) => ({
  tileTag: tag,
  paletteTag: tag,
  oam: sBallOamData,
  anims: sBallAnimSequences,
  affineAnims: 'sAffineAnim_BallRotate',
  callback: SpriteCallbackDummy,
}));

// ════════════════════════════════════════════════════════════════════════════
// GFX BALL (pokeball.c:60-90 + 1309-1336) — chargement via le MECANISME DECOMP
// (assetCache precharge + LoadCompressedSpriteSheet/LoadSpriteSheet SYNC).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 decomp pokeball.c:60 `gBallSpriteSheets[POKEBALL_COUNT]` (CompressedSpriteSheet).
// data = SYMBOLE asset (gBallGfx_X), resolu sync par getAsset dans LoadCompressedSpriteSheet
// (= le data en ROM de la decomp). size = 384 (12 tiles). Seul BALL_POKE est preacharge
// (ensureBallGfxLoaded) ; les autres = dette (asset non extrait -> getAsset null -> skip).
const gBallSpriteSheets: ReadonlyArray<{ data: string; size: number; tag: number }> = [
  { data: 'gBallGfx_Poke',    size: 384, tag: GFX_TAG_POKE_BALL },
  { data: 'gBallGfx_Great',   size: 384, tag: GFX_TAG_GREAT_BALL },
  { data: 'gBallGfx_Safari',  size: 384, tag: GFX_TAG_SAFARI_BALL },
  { data: 'gBallGfx_Ultra',   size: 384, tag: GFX_TAG_ULTRA_BALL },
  { data: 'gBallGfx_Master',  size: 384, tag: GFX_TAG_MASTER_BALL },
  { data: 'gBallGfx_Net',     size: 384, tag: GFX_TAG_NET_BALL },
  { data: 'gBallGfx_Dive',    size: 384, tag: GFX_TAG_DIVE_BALL },
  { data: 'gBallGfx_Nest',    size: 384, tag: GFX_TAG_NEST_BALL },
  { data: 'gBallGfx_Repeat',  size: 384, tag: GFX_TAG_REPEAT_BALL },
  { data: 'gBallGfx_Timer',   size: 384, tag: GFX_TAG_TIMER_BALL },
  { data: 'gBallGfx_Luxury',  size: 384, tag: GFX_TAG_LUXURY_BALL },
  { data: 'gBallGfx_Premier', size: 384, tag: GFX_TAG_PREMIER_BALL },
];

// 1:1 decomp pokeball.c:76 `gBallSpritePalettes[POKEBALL_COUNT]` (CompressedSpritePalette).
const gBallSpritePalettes: ReadonlyArray<{ data: string; tag: number }> = [
  { data: 'gBallPal_Poke',    tag: GFX_TAG_POKE_BALL },
  { data: 'gBallPal_Great',   tag: GFX_TAG_GREAT_BALL },
  { data: 'gBallPal_Safari',  tag: GFX_TAG_SAFARI_BALL },
  { data: 'gBallPal_Ultra',   tag: GFX_TAG_ULTRA_BALL },
  { data: 'gBallPal_Master',  tag: GFX_TAG_MASTER_BALL },
  { data: 'gBallPal_Net',     tag: GFX_TAG_NET_BALL },
  { data: 'gBallPal_Dive',    tag: GFX_TAG_DIVE_BALL },
  { data: 'gBallPal_Nest',    tag: GFX_TAG_NEST_BALL },
  { data: 'gBallPal_Repeat',  tag: GFX_TAG_REPEAT_BALL },
  { data: 'gBallPal_Timer',   tag: GFX_TAG_TIMER_BALL },
  { data: 'gBallPal_Luxury',  tag: GFX_TAG_LUXURY_BALL },
  { data: 'gBallPal_Premier', tag: GFX_TAG_PREMIER_BALL },
];

/** 1:1 decomp pokeball.c:1309 `void LoadBallGfx(u8 ballId)`. Charge la sheet + palette
 *  de la ball (par tag) si pas deja en VRAM, puis decompresse gOpenPokeballGfx (frame
 *  ouverte) par-dessus. Le data est resolu sync via getAsset (asset precharge). */
export function LoadBallGfx(ballId: number): void {
  if (GetSpriteTileStartByTag(gBallSpriteSheets[ballId].tag) === 0xFFFF) {
    LoadCompressedSpriteSheetUsingHeap(gBallSpriteSheets[ballId]);
    LoadCompressedSpritePaletteUsingHeap(gBallSpritePalettes[ballId]);
  }
  switch (ballId) {
    case BALL_DIVE:
    case BALL_LUXURY:
    case BALL_PREMIER:
      break;
    default: {
      // 1:1 decomp `LZDecompressVram(gOpenPokeballGfx, OBJ_VRAM0 + 0x100 + var*32)` :
      // overwrite la frame "ball grande ouverte" (open.png, 128B = 4 tiles) aux tiles
      // [start+8 .. start+11]. LZDecompressVram = un WRITE VRAM BRUT (decompress + memcpy) ;
      // l'asset gOpenPokeballGfx est deja en tile-data 4bpp dans assetCache (intro-asset-
      // loader), donc l'equivalent fidele = un memcpy direct en OBJ VRAM. On N'UTILISE PAS
      // LoadCompressedSpriteSheet(targetTileBase) : il INVALIDE les ranges de tags
      // chevauchants -> demarque le sheet poke.png (start..start+11) -> ball = BLOC garbage
      // (regression A/B confirmee). Un objVram.set ne touche AUCUN tag (= 1:1 LZDecompressVram).
      // A/B VRAM (dev.ovram) : SANS ca, tile start+8 = 0 octet -> ball "ouverte" INVISIBLE
      // (poke.png n'a que fermee[0] + mi-ouverte[4] pleines ; la frame open[8] vient d'open.png).
      const var_ = GetSpriteTileStartByTag(gBallSpriteSheets[ballId].tag);
      const openGfx = assetCache.get('gOpenPokeballGfx');
      const rt = getRuntime();
      if (var_ !== 0xFFFF && openGfx && rt?.gba?.objVram) {
        rt.gba.objVram.set(openGfx, var_ * 32 + 0x100); // +0x100 = +8 tiles (4bpp)
      }
      break;
    }
  }
}

/** 1:1 decomp pokeball.c:1332 `void FreeBallGfx(u8 ballId)`. */
export function FreeBallGfx(ballId: number): void {
  FreeSpriteTilesByTag(gBallSpriteSheets[ballId].tag);
  FreeSpritePaletteByTag(gBallSpritePalettes[ballId].tag);
}

// ════════════════════════════════════════════════════════════════════════════
// CHAIN SEND-OUT (pokeball.c) — le dresseur lance la ball, le mon emerge.
// Ces SpriteCB s'auto-dispatchent chaque frame via runOneFrame -> runSpriteCallbacks
// (= sprite.callback(sprite, rt)), 1:1 le main loop decomp. DORMANT : non cable
// (le send-out tourne encore sur l'ad-hoc battle-sendout-anim.ts) ; cablage = #22.
// ════════════════════════════════════════════════════════════════════════════

// 1:1 decomp #defines — index dans gAffineAnims_BattleSpritePlayer/OpponentSide.
const BATTLER_AFFINE_NORMAL = 0;
const BATTLER_AFFINE_EMERGE = 1;
// 1:1 decomp include/constants/battle.h — positions des battlers.
const B_POSITION_PLAYER_LEFT = 0;
const B_POSITION_OPPONENT_LEFT = 1;
const B_POSITION_PLAYER_RIGHT = 2;
const B_POSITION_OPPONENT_RIGHT = 3;
// 1:1 decomp battle_anim.h — BATTLER_COORD_* (coordType de GetBattlerSpriteCoord).
const BATTLER_COORD_X = 0;
const BATTLER_COORD_Y = 1;
const BATTLER_COORD_X_2 = 2;
const BATTLER_COORD_Y_PIC_OFFSET = 3;
// 1:1 decomp include/constants/{pokemon,battle}.h.
const POKEBALL_COUNT = 12;
const MAX_BATTLERS_COUNT = 4;

// 1:1 decomp pokeball.c:922 `#define HIBYTE(x) (((x) >> 8) & 0xFF)`.
function HIBYTE(x: number): number { return (x >> 8) & 0xFF; }
// Reinterprete les 16 bits bas en s16 signe (= cast (s16) decomp ; struct Sprite.data[] est s16).
function toS16(v: number): number { return (v << 16) >> 16; }
// 1:1 decomp battle_util.c — IsDoubleBattle() = gBattleTypeFlags & BATTLE_TYPE_DOUBLE.
function IsDoubleBattle(): boolean { return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0; }
// 1:1 decomp — GetBattlerSide(battler) = GetBattlerPosition(battler) & BIT_SIDE (=1).
function GetBattlerSide(battler: number): number { return GetBattlerPosition(battler) & 1; }
// 1:1 decomp task.c TaskDummy — task passive (no-op) ; le sprite CB prend le relais.
function TaskDummy(_task: DecompTask): void { /* no-op */ }

// Adaptation : le pointeur Pokemon `mon` (tCryTaskMonPtr1/2, packe en 2 halfwords
// en C) n'est pas transposable en JS -> on garde la REF mon dans une Map annexe
// indexee par taskId (cf. Task_PlayCryWhenReleasedFromBall + SpriteCB_ReleaseMonFromBall).
const _cryTaskMon = new Map<number, unknown>();

// Macros de slots data[] (1:1 decomp) :
//  TASK (Task_DoPokeballSendOutAnim) : tFrames=0 tPan=1 tThrowId=2 tBattler=3 tOpponentBattler=4
//  SPRITE ball : sBattler = data[6]
//  TASK (Task_PlayCryWhenReleasedFromBall) : Species=0 Pan=1 WantedCry=2 Battler=3
//    MonSpriteId=4 MonPtr1=5 MonPtr2=6 Frames=10 State=15

/** 1:1 decomp pokeball.c:335 `u8 DoPokeballSendOutAnimation(s16 pan, u8 kindOfThrow)`.
 *  Cree la task qui spawn la ball chez le lanceur (gActiveBattler). */
export function DoPokeballSendOutAnimation(pan: number, kindOfThrow: number): number {
  const rt = getRuntime();
  setGDoingBattleAnim(true);
  setBallAnimActive(gActiveBattler, true);

  const taskId = rt.CreateTask((t) => Task_DoPokeballSendOutAnim(t, rt), 5);
  const task = rt.gTasks.get(taskId);
  if (task) {
    task.data[1] = pan;            // tPan
    task.data[2] = kindOfThrow;    // tThrowId
    task.data[3] = gActiveBattler; // tBattler
  }
  return 0;
}

/** 1:1 decomp pokeball.c:352 `static void Task_DoPokeballSendOutAnim(u8 taskId)`. */
function Task_DoPokeballSendOutAnim(task: DecompTask, rt: DecompRuntime): void {
  const taskId = task.taskId;
  let notSendOut = false;

  if (task.data[0] === 0) {        // tFrames : 1 frame de delai avant le spawn
    task.data[0]++;
    return;
  }

  const throwCaseId = task.data[2];   // tThrowId
  const battler = task.data[3];       // tBattler

  let itemId: number;
  if (GetBattlerSide(battler) !== B_SIDE_PLAYER)
    itemId = GetMonData(gEnemyParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_POKEBALL) as number;
  else
    itemId = GetMonData(gPlayerParty[gBattlerPartyIndexes[battler]] as never, MON_DATA_POKEBALL) as number;

  const ballId = ItemIdToBallId(itemId);
  LoadBallGfx(ballId);
  const ballSpriteId = CreateSprite(gBallSpriteTemplates[ballId], 32, 80, 29);
  const ball = rt.gSprites[ballSpriteId];
  if (!ball) { rt.DestroyTask(taskId); return; }
  // 1:1 ad-hoc PROUVE (battle-sendout-anim.ts:232) : la ball est ST_OAM_AFFINE_DOUBLE — applique
  // la frame 0 de l'affine (matrice identite) IMMEDIATEMENT, sinon sa zone de rendu 2x mappe une
  // matrice non calculee = garbage/NOIR avant le 1er tickAllAffineAnims. CreateSprite #20 a deja
  // fait StartSpriteAffineAnim(0) + alloue la matrice ; BeginAffineAnim pose la frame.
  BeginAffineAnim(ball, rt);
  ball.data[0] = 0x80;
  ball.data[1] = 0;
  ball.data[7] = throwCaseId;

  switch (throwCaseId) {
    case POKEBALL_PLAYER_SENDOUT:
      setBattlerTarget(battler);
      ball.x = 24;
      ball.y = 68;
      ball.callback = SpriteCB_PlayerMonSendOut_1;
      break;
    case POKEBALL_OPPONENT_SENDOUT:
      ball.x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X);
      ball.y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y) + 24;
      setBattlerTarget(battler);
      ball.data[0] = 0;
      ball.callback = SpriteCB_OpponentMonSendOut;
      break;
    default:
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
      notSendOut = true;
      break;
  }

  ball.data[6] = gBattlerTarget;   // sBattler
  if (!notSendOut) {
    rt.DestroyTask(taskId);
    return;
  }

  // 1:1 pokeball.c:409 — anim de lancer INUTILISEE (capture, jamais atteinte en send-out).
  ball.data[0] = 34;
  ball.data[2] = GetBattlerSpriteCoord(gBattlerTarget, BATTLER_COORD_X);
  ball.data[4] = GetBattlerSpriteCoord(gBattlerTarget, BATTLER_COORD_Y) - 16;
  ball.data[5] = -40;
  InitAnimArcTranslation(ball);
  const ballOam = rt.gba.oam[ball.oamIndex];
  if (ballOam) ballOam.affineParam = taskId;
  task.data[4] = gBattlerTarget;   // tOpponentBattler
  task.func = TaskDummy;
  // 1:1 PlaySE(SE_BALL_THROW) — SE differe (consigne user : pas toucher BGM/SE).
}

/** 1:1 decomp pokeball.c:911 `static void SpriteCB_PlayerMonSendOut_1(struct Sprite *sprite)`. */
function SpriteCB_PlayerMonSendOut_1(sprite: DecompSprite, rt: DecompRuntime): void {
  sprite.data[0] = 25;
  sprite.data[2] = GetBattlerSpriteCoord(sprite.data[6], BATTLER_COORD_X_2);
  sprite.data[4] = GetBattlerSpriteCoord(sprite.data[6], BATTLER_COORD_Y_PIC_OFFSET) + 24;
  sprite.data[5] = -30;
  const oam = rt.gba.oam[sprite.oamIndex];
  if (oam) oam.affineParam = sprite.data[6];   // sauve sBattler dans le byte bas de affineParam
  InitAnimArcTranslation(sprite);              // ECRASE data[6] avec 0x8000/data[0] (= increment phase)
  sprite.callback = SpriteCB_PlayerMonSendOut_2;
}

/** 1:1 decomp pokeball.c:924 `static void SpriteCB_PlayerMonSendOut_2(struct Sprite *sprite)`.
 *  Arc parabolique avec phase APEX ralentie (HIBYTE(data[7]) in [35,80)) ou la ball
 *  plane + tourne (affine anim 4), puis arc normal jusqu'au sol -> release. */
function SpriteCB_PlayerMonSendOut_2(sprite: DecompSprite, rt: DecompRuntime): void {
  const oam = rt.gba.oam[sprite.oamIndex];
  if (!oam) return;
  let r6: number;
  let r7: number;

  if (HIBYTE(sprite.data[7]) >= 35 && HIBYTE(sprite.data[7]) < 80) {
    if ((oam.affineParam & 0xFF00) === 0) {
      r6 = sprite.data[1] & 1;
      r7 = sprite.data[2] & 1;
      sprite.data[1] = ((Math.trunc(toS16(sprite.data[1]) / 3) & ~1) | r6) & 0xFFFF;
      sprite.data[2] = ((Math.trunc(toS16(sprite.data[2]) / 3) & ~1) | r7) & 0xFFFF;
      rt.StartSpriteAffineAnim(sprite.spriteId, 4);
    }
    const r4 = sprite.data[0];
    AnimTranslateLinear(sprite);
    sprite.data[7] = (sprite.data[7] + Math.trunc(toS16(sprite.data[6]) / 3)) & 0xFFFF;
    sprite.y2 += Sin(HIBYTE(sprite.data[7]), toS16(sprite.data[5]));
    oam.affineParam = (oam.affineParam + 0x100) & 0xFFFF;
    if (((oam.affineParam >> 8) % 3) !== 0) sprite.data[0] = r4;
    else sprite.data[0] = r4 - 1;
    if (HIBYTE(sprite.data[7]) >= 80) {
      r6 = sprite.data[1] & 1;
      r7 = sprite.data[2] & 1;
      sprite.data[1] = (((toS16(sprite.data[1]) * 3) & ~1) | r6) & 0xFFFF;
      sprite.data[2] = (((toS16(sprite.data[2]) * 3) & ~1) | r7) & 0xFFFF;
    }
  } else {
    if (TranslateAnimHorizontalArc(sprite)) {
      sprite.x += sprite.x2;
      sprite.y += sprite.y2;
      sprite.y2 = 0;
      sprite.x2 = 0;
      sprite.data[6] = oam.affineParam & 0xFF;   // restaure sBattler depuis affineParam
      sprite.data[0] = 0;

      if (IsDoubleBattle() && isIntroAnimActive()
        && sprite.data[6] === GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT))
        sprite.callback = SpriteCB_ReleaseMon2FromBall;
      else
        sprite.callback = SpriteCB_ReleaseMonFromBall;

      rt.StartSpriteAffineAnim(sprite.spriteId, 0);
    }
  }
}

/** 1:1 decomp pokeball.c:982 `static void SpriteCB_ReleaseMon2FromBall(struct Sprite *sprite)`. */
function SpriteCB_ReleaseMon2FromBall(sprite: DecompSprite, _rt: DecompRuntime): void {
  if (sprite.data[0]++ > 24) {
    sprite.data[0] = 0;
    sprite.callback = SpriteCB_ReleaseMonFromBall;
  }
}

/** 1:1 decomp pokeball.c:991 `static void SpriteCB_OpponentMonSendOut(struct Sprite *sprite)`. */
function SpriteCB_OpponentMonSendOut(sprite: DecompSprite, _rt: DecompRuntime): void {
  sprite.data[0]++;
  if (sprite.data[0] > 15) {
    sprite.data[0] = 0;
    if (IsDoubleBattle() && isIntroAnimActive()
      && sprite.data[6] === GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT))
      sprite.callback = SpriteCB_ReleaseMon2FromBall;
    else
      sprite.callback = SpriteCB_ReleaseMonFromBall;
  }
}

/** 1:1 decomp pokeball.c:750 `static void SpriteCB_ReleaseMonFromBall(struct Sprite *sprite)`.
 *  La ball s'ouvre (anim 1) + particules + fade blanc du mon + le mon emerge (affine
 *  EMERGE) + cri. Bascule la ball sur HandleBallAnimEnd. */
function SpriteCB_ReleaseMonFromBall(sprite: DecompSprite, rt: DecompRuntime): void {
  const battler = sprite.data[6];   // sBattler
  rt.StartSpriteAnim(sprite.spriteId, 1);
  const ballId = ItemIdToBallId(GetBattlerPokeballItemId(battler));
  // 1:1 pokeball.c:757 — miroir battle_anim_throw (PlaySE SE_BALL_OPEN dedans).
  AnimateBallOpenParticles(sprite.x, sprite.y - 5, 1, 28, ballId);
  sprite.data[0] = LaunchBallFadeMonTask(rt, true, sprite.data[6], 14, ballId);
  sprite.callback = HandleBallAnimEnd;

  if (rt.gMain.inBattle) {
    let mon: unknown;
    let pan: number;
    if (GetBattlerSide(battler) !== B_SIDE_PLAYER) {
      mon = gEnemyParty[gBattlerPartyIndexes[battler]];
      pan = 25;
    } else {
      mon = gPlayerParty[gBattlerPartyIndexes[battler]];
      pan = -25;
    }

    const species = GetMonData(mon as never, MON_DATA_SPECIES) as number;

    // 1:1 pokeball.c:781 — bloc BGM (double MULTI/LINK uniquement, jamais en wild single).
    // DIFFERE (consigne user : pas toucher BGM) : m4aMPlayStop / m4aMPlayVolumeControl non
    // portes. Structure conditionnelle 1:1 conservee (no-op).
    if ((battler === GetBattlerAtPosition(B_POSITION_PLAYER_LEFT) || battler === GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT))
      && IsDoubleBattle() && isIntroAnimActive()) {
      // if (MULTI && LINK) { if (IsBGMPlaying()) m4aMPlayStop(&gMPlayInfo_BGM); }
      // else m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 128);
    }

    let wantedCryCase: number;
    if (!IsDoubleBattle() || !isIntroAnimActive())
      wantedCryCase = 0;
    else if (battler === GetBattlerAtPosition(B_POSITION_PLAYER_LEFT) || battler === GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT))
      wantedCryCase = 1;
    else
      wantedCryCase = 2;

    setWaitForCry(battler, true);

    const taskId = rt.CreateTask((t) => Task_PlayCryWhenReleasedFromBall(t, rt), 3);
    const cryTask = rt.gTasks.get(taskId);
    if (cryTask) {
      cryTask.data[0] = species;                          // tCryTaskSpecies
      cryTask.data[1] = pan;                              // tCryTaskPan
      cryTask.data[2] = wantedCryCase;                    // tCryTaskWantedCry
      cryTask.data[3] = battler;                          // tCryTaskBattler
      cryTask.data[4] = getBattlerMonSpriteId(sprite.data[6]); // tCryTaskMonSpriteId
      cryTask.data[15] = 0;                               // tCryTaskState
      // tCryTaskMonPtr1/2 (data[5]/data[6]) = pointeur Pokemon en C -> ref via Map annexe.
      _cryTaskMon.set(taskId, mon);
    }
  }

  const monSpriteId = getBattlerMonSpriteId(sprite.data[6]);
  rt.StartSpriteAffineAnim(monSpriteId, BATTLER_AFFINE_EMERGE);

  // 1:1 pokeball.c:817 — bascule le mon sur son CB d'emergence (battle_main.c). Ces 2
  // callbacks sont encore sur le modele ad-hoc BattleSprite (sous-ensemble structurel de
  // DecompSprite : ils ne lisent que sprite.affineAnimEnded/data/...) -> pont de type ici ;
  // port DecompSprite pur + verif runtime = #22.
  if (GetBattlerSide(sprite.data[6]) === B_SIDE_OPPONENT)
    rt.setSpriteCallback(monSpriteId, SpriteCB_OpponentMonFromBall as unknown as (s: DecompSprite, r: DecompRuntime) => void);
  else
    rt.setSpriteCallback(monSpriteId, SpriteCB_PlayerMonFromBall as unknown as (s: DecompSprite, r: DecompRuntime) => void);

  const monSprite = rt.gSprites[monSpriteId];
  if (monSprite) {
    AnimateSprite(rt, monSprite as Parameters<typeof AnimateSprite>[1]);
    monSprite.data[1] = 0x1000;
  }
}

/** 1:1 decomp pokeball.c:845 `static void HandleBallAnimEnd(struct Sprite *sprite)`.
 *  Revele le mon, fait descendre la silhouette (y2 = data[1]>>8) tant que l'affine
 *  EMERGE tourne ; a la fin : NORMAL + detruit la ball + libere les gfx si tous finis. */
function HandleBallAnimEnd(sprite: DecompSprite, rt: DecompRuntime): void {
  let affineAnimEnded = false;
  const battler = sprite.data[6];   // sBattler
  const monSpriteId = getBattlerMonSpriteId(battler);
  const mon = rt.gSprites[monSpriteId];

  if (mon) mon.invisible = false;
  if (sprite.animEnded) sprite.invisible = true;
  if (mon && mon.affineAnimEnded) {
    rt.StartSpriteAffineAnim(monSpriteId, BATTLER_AFFINE_NORMAL);
    affineAnimEnded = true;
  } else if (mon) {
    mon.data[1] -= 288;
    mon.y2 = mon.data[1] >> 8;
  }

  if (sprite.animEnded && affineAnimEnded) {
    if (mon) mon.y2 = 0;
    setGDoingBattleAnim(false);
    setBallAnimActive(battler, false);
    FreeOamMatrix(sprite.matrixNum);
    DestroySprite(rt, sprite.spriteId);

    let doneBattlers = 0;
    for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
      if (isBallAnimActive(i) === false) doneBattlers++;
    }
    if (doneBattlers === MAX_BATTLERS_COUNT) {
      for (let i = 0; i < POKEBALL_COUNT; i++) FreeBallGfx(i);
    }
  }
}

/** 1:1 decomp pokeball.c:665 `static void Task_PlayCryWhenReleasedFromBall(u8 taskId)`.
 *  Attend la fin de l'affine EMERGE puis joue le cri du mon. CRIS DIFFERES (consigne
 *  user : pas toucher SE) -> structure d'etats 1:1 conservee, PlayCry_* non portes ;
 *  le seul effet retenu = lever waitForCry + DestroyTask au bon moment (anti-blocage). */
function Task_PlayCryWhenReleasedFromBall(task: DecompTask, rt: DecompRuntime): void {
  const taskId = task.taskId;
  const wantedCry = task.data[2];   // tCryTaskWantedCry
  const battler = task.data[3];     // tCryTaskBattler
  const monSpriteId = task.data[4]; // tCryTaskMonSpriteId
  // mon (ref via Map) — utilise par ShouldPlayNormalMonCry (cri differe) :
  // const mon = _cryTaskMon.get(taskId);

  switch (task.data[15]) {          // tCryTaskState
    case 0:
    default: {
      const monSprite = rt.gSprites[monSpriteId];
      if (monSprite && monSprite.affineAnimEnded)
        task.data[15] = wantedCry + 1;
      break;
    }
    case 1: {
      // 1:1 PlayCry_ByMode(species, pan, NORMAL/WEAK). On garde le CRI du mon via playCry (mecanisme
      // prouve = ce que l'ad-hoc jouait) pour ne pas regresser en silence ; SE/BGM restent differes.
      // Timing 1:1 : apres affineAnimEnded (case 0 -> state 1 = fin de l'emergence).
      const nm = reverseDecompConstant(task.data[0] /* tCryTaskSpecies */, 'SPECIES_');
      if (nm) void import('./engine/system/music').then(({ playCry }) => playCry(nm)).catch(() => {});
      setWaitForCry(battler, false);
      _cryTaskMon.delete(taskId);
      rt.DestroyTask(taskId);
      break;
    }
    case 2:
      // 1:1 StopCryAndClearCrySongs() — DIFFERE.
      task.data[10] = 3;            // tCryTaskFrames
      task.data[15] = 20;
      break;
    case 20:
      if (task.data[10] === 0) {
        // 1:1 PlayCry_ReleaseDouble(species, pan, DOUBLES/WEAK_DOUBLES) — DIFFERE.
        setWaitForCry(battler, false);
        _cryTaskMon.delete(taskId);
        rt.DestroyTask(taskId);
      } else {
        task.data[10]--;
      }
      break;
    case 3:
      task.data[10] = 6;
      task.data[15] = 30;
      break;
    case 30:
      if (task.data[10] !== 0) { task.data[10]--; break; }
      // 1:1 decomp : tCryTaskState++ (->31) PUIS fall-through case 31 LA MEME FRAME. Les cris
      // etant differes, IsCryPlayingOrClearCrySongs() est toujours false -> on entre le if ->
      // StopCryAndClearCrySongs (differe) + tCryTaskFrames=3 + tCryTaskState++ (->32). Net : 32.
      // (deroule inline car TS interdit le vrai fall-through, noFallthroughCasesInSwitch).
      task.data[10] = 3;
      task.data[15] = 32;
      break;
    case 31:
      // 1:1 : re-entrant tant que le cri joue ; cris differes -> avance direct (state=32).
      task.data[10] = 3;
      task.data[15] = 32;
      break;
    case 32:
      if (task.data[10] !== 0) { task.data[10]--; break; }
      // 1:1 PlayCry_ReleaseDouble(species, pan, NORMAL/WEAK) — DIFFERE.
      setWaitForCry(battler, false);
      _cryTaskMon.delete(taskId);
      rt.DestroyTask(taskId);
      break;
  }
}

/** 1:1 décomp `DoHitAnimHealthboxEffect(battler)` (pokeball.c) : sprite
 *  contrôleur invisible qui fait osciller la HEALTHBOX (+1/-1 alterné, 21
 *  frames) quand le mon est touché. Goal T5 2026-06-10. */
export function DoHitAnimHealthboxEffect(battler: number): void {
  const rt = (globalThis as { __rt?: { gSprites?: Array<{ data: number[]; invisible?: boolean; callback?: unknown } | undefined> } }).__rt;
  if (!rt || !rt.gSprites) return;
  const hb = (globalThis as { __battleHealthbox?: { gHealthboxSpriteIds?: number[] } }).__battleHealthbox;
  const hbId = hb?.gHealthboxSpriteIds?.[battler] ?? -1;
  if (hbId < 0) return;
  const spriteId = CreateSprite({ oam: { shape: 0, size: 0 }, images: [] } as never, 0, 0, 0xFF);
  const sp = rt.gSprites[spriteId];
  if (!sp) return;
  sp.invisible = true;
  sp.data = sp.data ?? [0, 0, 0, 0, 0, 0, 0, 0];
  sp.data[0] = 1;
  sp.data[1] = hbId;
  (sp as { callback: unknown }).callback = SpriteCB_HitAnimHealthoxEffect;
}

/** 1:1 décomp `SpriteCB_HitAnimHealthoxEffect` (typo decomp conservée). */
function SpriteCB_HitAnimHealthoxEffect(sprite: { data: number[] }): void {
  const rt = (globalThis as { __rt?: { gSprites?: Array<{ x2: number; y2: number } | undefined>; DestroySprite?: (id: number) => void } }).__rt;
  const hb = rt?.gSprites?.[sprite.data[1]];
  if (hb) {
    hb.y2 = sprite.data[0];
  }
  sprite.data[0] = -sprite.data[0];
  sprite.data[2] = (sprite.data[2] ?? 0) + 1;
  if (sprite.data[2] === 21) {
    if (hb) { hb.x2 = 0; hb.y2 = 0; }
    const self = sprite as { spriteId?: number };
    if (rt && self.spriteId !== undefined) {
      DestroySprite(getRuntime(), self.spriteId);
      // pas de gSprites.delete (slot garde, 1:1)
    } else {
      // fallback : neutraliser le callback
      (sprite as { callback?: unknown }).callback = null;
    }
  }
}

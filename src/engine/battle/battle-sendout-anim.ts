/**
 * battle-sendout-anim.ts — Port 1:1 décomp `src/pokeball.c` séquence SEND-OUT
 * (= "le dresseur lance sa ball, le mon émerge"). C'est DISTINCT du throw de
 * capture (battle-ball-throw.ts = SpriteCB_BallThrow + shakes).
 *
 * Chaîne décomp :
 *   DoPokeballSendOutAnimation (pokeball.c:335) crée la ball chez le lanceur.
 *     POKEBALL_PLAYER_SENDOUT : ball à (24,68), callback SpriteCB_PlayerMonSendOut_1.
 *   SpriteCB_PlayerMonSendOut_1/2 (pokeball.c:911-978) : arc parabolique vers le
 *     mon (data[0]=25 frames, cible = GetBattlerSpriteCoord mon, data[5]=-30 amplitude),
 *     puis callback = SpriteCB_ReleaseMonFromBall.
 *   SpriteCB_ReleaseMonFromBall (pokeball.c:750) :
 *     StartSpriteAnim(ball,1) [ball s'ouvre] + AnimateBallOpenParticles +
 *     LaunchBallFadeMonTask(TRUE,...) [silhouette blanche→couleur] +
 *     reveal mon + StartSpriteAffineAnim(BATTLER_AFFINE_EMERGE) [le mon grandit] + cri.
 *   SpriteCB_PlayerMonFromBall (battle_main.c:2987) : attend sprite->affineAnimEnded →
 *     StartSpriteAffineAnim(0) [NORMAL] + front anim.
 *
 * Réutilise les primitives PROUVÉES de system/pokeball-effects.ts (= les mêmes que
 * CreatePokeballSpriteToReleaseMon Birch + le starter screen) : affine emerge +
 * particules + fade palette. Asset ball = /decomp/em/balls/poke.png 16x16, même offset
 * VRAM 0x4000 que battle-ball-throw.ts (jamais simultané : intro vs capture mid-combat).
 *
 * Intégration battle-flow.ts : startSendOut() à l'état PLAYER_SENDOUT + tickSendOut()
 * dans le tick central (gated ~60fps, comme tickBallThrow). Le statut (idle/active/done)
 * est poll par la state machine.
 */

import { getRuntime, FreeSpriteTilesByTag } from '../system/decomp-globals';
import type { DecompRuntime } from '../system/decomp-runtime';
import { LoadSpritePalette, AllocSpriteTiles, AllocSpriteTileRange } from '../system/sprite';
import {
  SetUpForReleaseAffineAnim, TearDownReleaseAffineAnim,
  LaunchBallFadeMonTask, AnimateBallOpenParticles, BALL_POKE,
} from '../system/pokeball-effects';
import { BeginAffineAnim } from '../decomp-impls/sprite-engine-impl';

// Asset Poke Ball 16x16. VRAM via l'ALLOCATEUR 1:1 décomp (`AllocSpriteTiles`) — PLUS
// d'offset en dur (l'ancien 0x4000 écrasait les tiles du mon joueur ; 0x5800 était un
// patch fragile). Les tiles sont allouées dynamiquement dans l'espace libre → zéro
// collision possible, comme la décomp (LoadBallGfx → sheet tag → AllocSpriteTiles).
const POKE_BALL_URL = '/decomp/em/balls/poke.png';
const BALL_TILE_COUNT = 4;   // 16×16 = 4 tiles 8×8
const TAG_SENDOUT_BALL = 'BATTLE_SENDOUT_BALL';
const TAG_SENDOUT_BALL_PAL = 'BATTLE_SENDOUT_BALL_PAL';
let _ballTileStart = -1;     // tile alloué (= tileId base de la ball)
let _ballPaletteSlot = -1;
let _ballAssetLoaded = false;

// 1:1 décomp : index dans gAffineAnims_BattleSpritePlayerSide/OpponentSide.
const BATTLER_AFFINE_NORMAL = 0;
const BATTLER_AFFINE_EMERGE = 1;   // = sAffineAnim_Battler_Emerge

interface SendOutState {
  phase: number;        // 1=arc throw, 2=release(once), 3=emerge wait
  frame: number;
  ballSpriteId: number;
  monSpriteId: number;
  side: 'player' | 'opponent';
  monPalNum: number;
  species: string;
  startX: number; startY: number;
  endX: number; endY: number;
  arcFrames: number;    // 1:1 SpriteCB_PlayerMonSendOut_1 data[0]=25
  arcHeight: number;    // 1:1 data[5]=-30
  emergeWaitFrames: number;
}

let _so: SendOutState | null = null;
let _status: 'idle' | 'active' | 'done' = 'idle';
let _lastFrameCounter = -1;

/** Pre-load le sprite ball 1 fois (= LoadCompressedSpriteSheet décomp). */
async function _ensureBallAsset(): Promise<void> {
  if (_ballAssetLoaded) return;
  const rt = getRuntime();
  if (!rt) return;
  try {
    // 1:1 décomp : alloue des tiles LIBRES (zéro collision) puis charge la ball dedans.
    _ballTileStart = AllocSpriteTiles(BALL_TILE_COUNT);
    if (_ballTileStart < 0) { console.warn('[sendout] pas de tiles VRAM libres pour la ball'); return; }
    AllocSpriteTileRange(TAG_SENDOUT_BALL, _ballTileStart, BALL_TILE_COUNT);
    const loaded = await rt.LoadCompressedSpriteSheet(POKE_BALL_URL, _ballTileStart * 32);
    _ballPaletteSlot = LoadSpritePalette({ data: loaded.palette, tag: TAG_SENDOUT_BALL_PAL });
    _ballAssetLoaded = true;
  } catch (e) {
    console.warn('[sendout] failed to load poke.png:', e);
  }
}

/** Statut courant — poll par la state machine battle-flow. */
export function getSendOutStatus(): 'idle' | 'active' | 'done' { return _status; }
/** Remet à idle après consommation du 'done' (= prêt pour le combat suivant). */
export function resetSendOutStatus(): void { _status = 'idle'; }
export function isSendOutActive(): boolean { return _status === 'active'; }

/** 1:1 décomp DoPokeballSendOutAnimation + setup arc. Lance le send-out d'un mon
 *  (la ball part du lanceur, arc vers le mon, s'ouvre, le mon émerge via affine). */
export async function startSendOut(opts: {
  monSpriteId: number;
  side: 'player' | 'opponent';
  monPalNum: number;
  species: string;
  /** Position de départ de la ball (= 24,68 player décomp pokeball.c:385-386). */
  startX?: number; startY?: number;
  /** Position du mon (= cible de l'arc, coords centre du sprite). */
  endX: number; endY: number;
}): Promise<void> {
  _status = 'active';   // SYNC : la state machine voit 'active' immédiatement.
  await _ensureBallAsset();
  const rt = getRuntime();
  const mon = rt?.gSprites.get(opts.monSpriteId);

  // Fallback : si l'asset n'a pas chargé, on révèle le mon directement (pas d'anim)
  // pour ne JAMAIS laisser le mon invisible.
  if (!rt || !_ballAssetLoaded || _ballPaletteSlot < 0 || !mon) {
    if (mon) mon.invisible = false;
    _status = 'done';
    return;
  }

  // 1:1 décomp pokeball.c:376 CreateSprite(template, 32,80,29) puis 385-386 player (24,68).
  const startX = opts.startX ?? 24;
  const startY = opts.startY ?? 68;
  const ball = rt.CreateSpriteAtOam({
    tileId: _ballTileStart,
    paletteBank: _ballPaletteSlot,
    x: startX, y: startY,
    shape: 0, size: 1,   // 16x16 (= 4 tiles 8x8)
    priority: 0,         // devant les mons (prio 2)
  });

  // Cache le mon jusqu'à l'émergence (1:1 : il sort de la ball).
  mon.invisible = true;

  _so = {
    phase: 1, frame: 0,
    ballSpriteId: ball.spriteId,
    monSpriteId: opts.monSpriteId,
    side: opts.side,
    monPalNum: opts.monPalNum,
    species: opts.species,
    startX, startY,
    endX: opts.endX, endY: opts.endY,
    arcFrames: 25,
    arcHeight: 30,
    emergeWaitFrames: 0,
  };
}

/** Tick per-frame (gated ~60fps). No-op si pas actif. */
export function tickSendOut(): void {
  if (_status !== 'active' || !_so) return;
  const rt = getRuntime();
  if (!rt) { _so = null; _status = 'done'; return; }

  // Gate 1 update / frame visuelle (le flow.tick polle 5-6x/frame).
  const fc = Math.floor(performance.now() / 16);
  if (fc === _lastFrameCounter) return;
  _lastFrameCounter = fc;

  const ball = rt.gSprites.get(_so.ballSpriteId);
  const mon = rt.gSprites.get(_so.monSpriteId);
  if (!mon) { _cleanup(rt); return; }

  _so.frame++;

  switch (_so.phase) {
    case 1: {  // ARC THROW — 1:1 SpriteCB_PlayerMonSendOut_1/2 (InitAnimArcTranslation)
      const t = Math.min(1, _so.frame / _so.arcFrames);
      const x = _so.startX + (_so.endX - _so.startX) * t;
      const yLin = _so.startY + (_so.endY - _so.startY) * t;
      const yArc = -_so.arcHeight * Math.sin(Math.PI * t);
      if (ball) { ball.x = Math.round(x); ball.y = Math.round(yLin + yArc); }
      if (t >= 1) { _so.phase = 2; _so.frame = 0; }
      break;
    }
    case 2: {  // RELEASE — 1:1 SpriteCB_ReleaseMonFromBall (pokeball.c:750-823)
      // 1:1 pokeball.c:757 `AnimateBallOpenParticles(sprite->x, sprite->y - 5, 1, 28, ballId)`
      // = le FLASH + les ÉTINCELLES à l'ouverture de la ball (user A/B 2026-05-31 :
      // "pas de flash ni d'étincelles"). La fonction charge elle-même son asset
      // (loadParticlesAssets) + les sprites s'auto-détruisent (radius→50). Position =
      // celle de la ball (fin d'arc = position du mon).
      const _bx = ball ? Math.round(ball.x) : _so.endX;
      const _by = (ball ? Math.round(ball.y) : _so.endY) - 5;
      AnimateBallOpenParticles(rt, _bx, _by, 1, 28, BALL_POKE);
      // 1:1 pokeball.c:758 LaunchBallFadeMonTask(TRUE, ...) : silhouette blanche→couleur
      // sur la palette OBJ du mon (= bit (16+palNum) du masque sélectionné).
      const selectedPalettes = (1 << (16 + _so.monPalNum)) >>> 0;
      LaunchBallFadeMonTask(rt, true, _so.monPalNum, selectedPalettes, BALL_POKE);
      // 1:1 pokeball.c:815-823 (cf. Birch decomp-globals:2684-2694) : reveal + emerge.
      mon.invisible = false;
      SetUpForReleaseAffineAnim(rt, _so.monSpriteId, _so.side);
      rt.StartSpriteAffineAnim(_so.monSpriteId, BATTLER_AFFINE_EMERGE);
      BeginAffineAnim(mon, rt);   // applique frame 0 immédiatement (évite 1-frame 0×0)
      mon.data[1] = 0x1000;
      // Cri du mon (1:1 Task_PlayCryWhenReleasedFromBall) — via le playCry prouvé
      // (INTRO_TEXT l'utilise). SE_BALL_OPEN/THROW différés (audio fragile, consigne user).
      const sp = _so.species;
      void import('../system/music').then(({ playCry }) => playCry(sp)).catch(() => {});
      // La ball disparaît (1:1 HandleBallAnimEnd → ball invisible une fois ouverte).
      if (ball) ball.invisible = true;
      _so.phase = 3; _so.frame = 0;
      break;
    }
    case 3: {  // EMERGE WAIT — 1:1 SpriteCB_PlayerMonFromBall (battle_main.c:2987 affineAnimEnded)
      _so.emergeWaitFrames++;
      if (mon.affineAnimEnded || _so.emergeWaitFrames > 40) {
        rt.StartSpriteAffineAnim(_so.monSpriteId, BATTLER_AFFINE_NORMAL);
        TearDownReleaseAffineAnim(rt, _so.monSpriteId);
        _cleanup(rt);
      }
      break;
    }
  }
}

function _cleanup(rt: DecompRuntime): void {
  if (_so) {
    const ball = rt.gSprites.get(_so.ballSpriteId);
    if (ball) rt.DestroySprite(_so.ballSpriteId);
  }
  _so = null;
  _status = 'done';
  _lastFrameCounter = -1;
}

// ─── Retour à la ball (RECALL — switch volontaire) ───────────────────────────
// Miroir simplifié de startSendOut : une Poké Ball apparaît à la position du mon,
// le mon est "aspiré" (disparaît), la ball reste brièvement puis disparaît.
// (Le shrink affine + le beam 1:1 décomp ReturnPokeToBall = raffinage documenté.)
interface ReturnState { ballSpriteId: number; monSpriteId: number; frame: number; }
let _rtb: ReturnState | null = null;
let _rtbStatus: 'idle' | 'active' | 'done' = 'idle';
let _rtbLastFc = -1;
export function getReturnToBallStatus(): 'idle' | 'active' | 'done' { return _rtbStatus; }
export function resetReturnToBallStatus(): void { _rtbStatus = 'idle'; }

export async function startReturnToBall(opts: {
  monSpriteId: number; side: 'player' | 'opponent'; monPalNum: number;
}): Promise<void> {
  _rtbStatus = 'active';   // SYNC : la state machine voit 'active' immédiatement.
  await _ensureBallAsset();
  const rt = getRuntime();
  const mon = rt?.gSprites.get(opts.monSpriteId);
  // Fallback : si l'asset n'a pas chargé, on cache le mon directement (le recall
  // a quand même lieu côté logique) pour ne jamais bloquer.
  if (!rt || !_ballAssetLoaded || _ballPaletteSlot < 0 || !mon) {
    if (mon) mon.invisible = true;
    _rtb = null; _rtbStatus = 'done';
    return;
  }
  const ball = rt.CreateSpriteAtOam({
    tileId: _ballTileStart, paletteBank: _ballPaletteSlot,
    x: Math.round(mon.x), y: Math.round(mon.y),
    shape: 0, size: 1,   // 16×16
    priority: 0,         // devant le mon
  });
  _rtb = { ballSpriteId: ball.spriteId, monSpriteId: opts.monSpriteId, frame: 0 };
}

export function tickReturnToBall(): void {
  if (_rtbStatus !== 'active' || !_rtb) return;
  const rt = getRuntime();
  if (!rt) { _rtb = null; _rtbStatus = 'done'; return; }
  const fc = Math.floor(performance.now() / 16);
  if (fc === _rtbLastFc) return;
  _rtbLastFc = fc;
  const mon = rt.gSprites.get(_rtb.monSpriteId);
  const ball = rt.gSprites.get(_rtb.ballSpriteId);
  _rtb.frame++;
  // Le mon est aspiré dans la ball (~frame 4).
  if (_rtb.frame >= 4 && mon) mon.invisible = true;
  // Fin du recall (~frame 18) : la ball disparaît.
  if (_rtb.frame >= 18) {
    if (ball) rt.DestroySprite(_rtb.ballSpriteId);
    _rtb = null; _rtbStatus = 'done'; _rtbLastFc = -1;
  }
}

// ─── Sprite de dos du dresseur (intro scroll + lancer) ───────────────────────
// 1:1 décomp gTrainerBackPicTable_Brendan/May (data.c:49-63) : 4 frames 64×64
// (0 = idle, 1-3 = lancer). trainerPicId = playerGender + TRAINER_BACK_PIC_BRENDAN.
const TRAINER_BACK_URL_MALE = '/decomp/em/trainers/back_pics/brendan.png';
const TRAINER_BACK_URL_FEMALE = '/decomp/em/trainers/back_pics/may.png';
// VRAM via l'allocateur 1:1 (plus d'offset 0x6000 en dur). Back-pic = 4 frames 64×64.
const TRAINER_BACK_TILE_COUNT = 256;   // 4 frames × 64 tiles
const TAG_TRAINER_BACK = 'BATTLE_TRAINER_BACK';
const TAG_TRAINER_BACK_PAL = 'BATTLE_TRAINER_BACK_PAL';
let _trainerTileStart = -1;   // tile alloué (= base des 4 frames)
let _trainerBackLoaded = false;
let _trainerBackPalSlot = -1;
let _trainerSpriteId = -1;

async function _ensureTrainerBackAsset(gender: number): Promise<void> {
  if (_trainerBackLoaded) return;
  const rt = getRuntime();
  if (!rt) return;
  const url = gender === 1 ? TRAINER_BACK_URL_FEMALE : TRAINER_BACK_URL_MALE;
  try {
    // 1:1 décomp : alloue des tiles LIBRES puis charge le sheet 4-frames dedans.
    _trainerTileStart = AllocSpriteTiles(TRAINER_BACK_TILE_COUNT);
    if (_trainerTileStart < 0) { console.warn('[sendout] pas de tiles VRAM libres pour le dresseur'); return; }
    AllocSpriteTileRange(TAG_TRAINER_BACK, _trainerTileStart, TRAINER_BACK_TILE_COUNT);
    const loaded = await rt.LoadCompressedSpriteSheet(url, _trainerTileStart * 32);
    _trainerBackPalSlot = LoadSpritePalette({ data: loaded.palette, tag: TAG_TRAINER_BACK_PAL });
    _trainerBackLoaded = true;
  } catch (e) {
    console.warn('[sendout] failed to load trainer back pic:', e);
  }
}

/** Charge + affiche le sprite de dos du dresseur (frame 0 = idle) à (x,y).
 *  1:1 décomp : montré pendant l'intro (scroll), avant le lancer. */
export async function showTrainerBackSprite(gender: number, x: number, y: number): Promise<number> {
  await _ensureTrainerBackAsset(gender);
  const rt = getRuntime();
  if (!rt || !_trainerBackLoaded || _trainerBackPalSlot < 0) return -1;
  const t = rt.CreateSpriteAtOam({
    // 1:1 décomp : anim 0 (idle) = sAnim_GeneralFrame3 → frame 3 (la pose debout/repos,
    // PAS frame 0). 64 tiles par frame 64×64. (User : "l'anim de base, c'est la n4 = id 3".)
    tileId: _trainerTileStart + 3 * 64,
    paletteBank: _trainerBackPalSlot,
    x, y,
    shape: 0, size: 3,   // 64×64 (SQUARE, size 3)
    priority: 2,         // même plan que les mons
  });
  _trainerSpriteId = t.spriteId;
  // 1:1 PlayerHandleDrawTrainerPic : démarre off-screen DROITE (x2 = +DISPLAY_WIDTH),
  // le scroll (tickIntroSlideIn) le glisse vers x2=0 (-2/frame, SpriteCB_TrainerSlideIn).
  const _ts = rt.gSprites.get(_trainerSpriteId);
  if (_ts) _ts.x2 = DISPLAY_WIDTH;
  return _trainerSpriteId;
}

export function getTrainerSpriteId(): number { return _trainerSpriteId; }

/** Détruit le sprite de dos du dresseur (= au lancer / teardown). */
export function destroyTrainerBackSprite(): void {
  const rt = getRuntime();
  if (rt && _trainerSpriteId >= 0) rt.DestroySprite(_trainerSpriteId);
  _trainerSpriteId = -1;
  // Libère les 256 tiles VRAM du dresseur DÈS qu'il sort (fin du lancer) — inutile de
  // les garder tout le combat (le mon a émergé). Rend l'espace 704+ libre pour la capture.
  if (_trainerTileStart >= 0) { FreeSpriteTilesByTag(TAG_TRAINER_BACK); _trainerTileStart = -1; _trainerBackLoaded = false; }
}

// ─── Scroll d'entrée (slide-in 1:1) ─────────────────────────────────────────
// 1:1 décomp : le JOUEUR (dresseur) entre par la DROITE (x2=+DISPLAY_WIDTH,
// SpriteCB_TrainerSlideIn sSpeedX=-2 → x2 vers 0) ; l'ADVERSE (mon sauvage) entre
// par la GAUCHE (x2=-DISPLAY_WIDTH, SpriteCB_MoveWildMonToRight x2+=2 → 0).
// ~120 frames, les 2 côtés convergent. Quand x2=0, le scroll est fini.
const DISPLAY_WIDTH = 240;
const SLIDE_IN_SPEED = 2;   // px/frame (|sSpeedX| joueur = 2 ; mon sauvage +2)
let _slideInOppId = -1;
let _slideInStatus: 'idle' | 'active' | 'done' = 'idle';
let _slideInLastFc = -1;

export function getIntroSlideInStatus(): 'idle' | 'active' | 'done' { return _slideInStatus; }
export function resetIntroSlideInStatus(): void { _slideInStatus = 'idle'; }

/** Démarre le scroll : adverse off-screen gauche, dresseur off-screen droite (posé
 *  par showTrainerBackSprite). Les deux glissent vers x2=0. */
export function startIntroSlideIn(oppSpriteId: number): void {
  const rt = getRuntime();
  const opp = rt?.gSprites.get(oppSpriteId);
  if (opp) opp.x2 = -DISPLAY_WIDTH;   // 1:1 OpponentHandleLoadMonSprite : x2 = -DISPLAY_WIDTH
  _slideInOppId = oppSpriteId;
  _slideInStatus = 'active';
  _slideInLastFc = -1;
}

/** Tick per-frame (gated ~60fps). Glisse adverse (+2) et dresseur (-2) vers x2=0. */
export function tickIntroSlideIn(): void {
  if (_slideInStatus !== 'active') return;
  const rt = getRuntime();
  if (!rt) { _slideInStatus = 'done'; return; }
  const fc = Math.floor(performance.now() / 16);
  if (fc === _slideInLastFc) return;
  _slideInLastFc = fc;

  let oppDone = true, trDone = true;
  const opp = rt.gSprites.get(_slideInOppId);
  if (opp && (opp.x2 ?? 0) < 0) { opp.x2 = Math.min(0, (opp.x2 ?? 0) + SLIDE_IN_SPEED); oppDone = opp.x2 === 0; }
  const tr = _trainerSpriteId >= 0 ? rt.gSprites.get(_trainerSpriteId) : null;
  if (tr && (tr.x2 ?? 0) > 0) { tr.x2 = Math.max(0, (tr.x2 ?? 0) - SLIDE_IN_SPEED); trDone = tr.x2 === 0; }
  if (oppDone && trDone) { _slideInStatus = 'done'; _slideInLastFc = -1; }
}

export function stopIntroSlideIn(): void { _slideInOppId = -1; _slideInStatus = 'idle'; _slideInLastFc = -1; }

/** Reset des assets chargés (ball + dresseur) au teardown. CRITIQUE : `FreeAllSpritePalettes()`
 *  au début de chaque combat (LOAD_ASSETS) libère les slots palette → si on garde les flags
 *  `_*Loaded`+slots du combat précédent, le 2e combat réutilise un slot stale = palette cassée
 *  + asset pas rechargé (plus de ball). On force le rechargement complet à chaque combat. */
export function resetSendOutAssets(): void {
  // 1:1 décomp : libère les tiles VRAM allouées (FreeSpriteTilesByTag) sinon fuite cross-combat.
  if (_ballTileStart >= 0) FreeSpriteTilesByTag(TAG_SENDOUT_BALL);
  if (_trainerTileStart >= 0) FreeSpriteTilesByTag(TAG_TRAINER_BACK);
  _ballTileStart = -1; _trainerTileStart = -1;
  _ballAssetLoaded = false; _ballPaletteSlot = -1;
  _trainerBackLoaded = false; _trainerBackPalSlot = -1;
}

// ─── Lancer du dresseur (1:1 PlayerHandleIntroTrainerBallThrow) ──────────────
// Anim 1:1 sAnimCmd_Brendan_1 (back_pic_anims.h) : frame 0 (24t) → 1 (9t) →
// 2 (24t) → 0 (9t) → 3 (50t). Le dresseur GLISSE gauche -40px sur 50 frames
// (StartAnimLinearTranslation) puis est libéré (SpriteCB_FreePlayerSpriteLoadMonSprite).
// La ball est lancée à la frame 31 (Task_StartSendOutAnim tStartTimer<31) → le mon émerge.
const TRAINER_TILES_PER_FRAME = 64;   // 64×64 = 8×8 tiles
const TRAINER_THROW_SLIDE_FRAMES = 50;
// 1:1 décomp PlayerHandleIntroTrainerBallThrow : data[2] = -40 = destX ABSOLUE
// (InitAnimLinearTranslation: x = data[2]-data[1] = destX-startX) → le dresseur glisse
// jusqu'à x=-40 (hors écran gauche), PAS un delta de -40.
const TRAINER_THROW_SLIDE_DEST_X = -40;
const TRAINER_THROW_BALL_FRAME = 31;

interface BallSendOpts {
  monSpriteId: number; side: 'player' | 'opponent'; monPalNum: number;
  species: string; endX: number; endY: number;
}
interface TrainerThrowState {
  frame: number;
  slideStartX: number;
  ballOpts: BallSendOpts;
  ballStarted: boolean;
}
let _tt: TrainerThrowState | null = null;
let _ttStatus: 'idle' | 'active' | 'done' = 'idle';
let _ttLastFc = -1;

/** 1:1 sAnimCmd_Brendan_1 : frame index affiché à la frame `t`. */
function _trainerThrowFrameAt(t: number): number {
  if (t < 24) return 0;
  if (t < 33) return 1;   // wind-up
  if (t < 57) return 2;   // lancer
  if (t < 66) return 0;
  return 3;               // extension (jamais vu : free à 50f)
}

export function getTrainerThrowStatus(): 'idle' | 'active' | 'done' { return _ttStatus; }
export function resetTrainerThrowStatus(): void { _ttStatus = 'idle'; }

/** Démarre le lancer du dresseur : anim 4 frames + slide gauche + ball à 31f + free à 50f.
 *  1:1 PlayerHandleIntroTrainerBallThrow (battle_controller_player.c:2946). */
export function startTrainerThrow(opts: BallSendOpts): void {
  _ttStatus = 'active';
  const rt = getRuntime();
  const t = rt?.gSprites.get(_trainerSpriteId);
  _tt = { frame: 0, slideStartX: t ? t.x : 0, ballOpts: opts, ballStarted: false };
  // Fallback : pas de sprite dresseur (asset échoué) → lance la ball directement.
  if (!t) { void startSendOut(opts); _tt.ballStarted = true; }
}

/** Tick per-frame (gated ~60fps). No-op si pas actif. */
export function tickTrainerThrow(): void {
  if (_ttStatus !== 'active' || !_tt) return;
  const rt = getRuntime();
  if (!rt) { _tt = null; _ttStatus = 'done'; return; }
  const fc = Math.floor(performance.now() / 16);
  if (fc === _ttLastFc) return;
  _ttLastFc = fc;

  _tt.frame++;
  const t = rt.gSprites.get(_trainerSpriteId);
  if (t) {
    // Anim : tileId = tileBase + frameIndex × 64 (1:1 sAnimCmd_Brendan_1 timing).
    const fi = _trainerThrowFrameAt(_tt.frame);
    const oam = rt.gba.oam[t.oamIndex];
    if (oam) oam.tileId = _trainerTileStart + fi * TRAINER_TILES_PER_FRAME;
    // Slide linéaire de startX → destX=-40 (hors écran) sur 50 frames (AnimTranslateLinear).
    const _p = Math.min(1, _tt.frame / TRAINER_THROW_SLIDE_FRAMES);
    t.x = Math.round(_tt.slideStartX + (TRAINER_THROW_SLIDE_DEST_X - _tt.slideStartX) * _p);
  }
  // Ball lancée à la frame 31 (Task_StartSendOutAnim) → le mon émerge.
  if (!_tt.ballStarted && _tt.frame >= TRAINER_THROW_BALL_FRAME) {
    void startSendOut(_tt.ballOpts);
    _tt.ballStarted = true;
  }
  // Free dresseur à la fin du slide (50f) — SpriteCB_FreePlayerSpriteLoadMonSprite.
  if (_tt.frame >= TRAINER_THROW_SLIDE_FRAMES) {
    destroyTrainerBackSprite();
    _tt = null;
    _ttStatus = 'done';
    _ttLastFc = -1;
  }
}

/** Annule le lancer dresseur en cours (= teardown combat). */
export function stopTrainerThrow(): void {
  _tt = null;
  _ttStatus = 'idle';
  _ttLastFc = -1;
}

/** Annule un send-out en cours (= teardown combat). */
export function stopSendOut(): void {
  const rt = getRuntime();
  if (rt && _so) _cleanup(rt);
  _so = null;
  _status = 'idle';
  _lastFrameCounter = -1;
}

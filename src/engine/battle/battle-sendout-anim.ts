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

import { getRuntime, FreeSpriteTilesByTag } from '../../../harness/runtime/decomp-globals';
import type { DecompRuntime } from '../../../harness/runtime/decomp-runtime';
import { LoadSpritePalette, AllocSpriteTiles, AllocSpriteTileRange, GetSpriteTileStartByTag, IndexOfSpritePaletteTag, DestroySprite, AllocOamMatrix, FreeOamMatrix } from '../../sprite';
import {
  SetUpForReleaseAffineAnim, TearDownReleaseAffineAnim,
  LaunchBallFadeMonTask, AnimateBallOpenParticlesForPokeball,
} from '../../battle_anim_throw';
import { BALL_POKE } from '../../../include/pokeball';
import { BeginAffineAnim } from '../decomp-impls/sprite-engine-impl';
import { gSineTable, ST_OAM_AFFINE_DOUBLE } from '../../../harness/runtime/decomp-helpers';
import { loadTileBin, loadGbaPal } from '../../../harness/gba/png-loader';
import { ANIMCMD_FRAME, ANIMCMD_END, type AnimCmd } from '../../sprite';
import { setActiveBattler } from './state';
import { PlayCry_ByMode } from '../../sound';
import { CRY_MODE_NORMAL } from '../../../include/constants/sound';
import { resolveDecompConstant } from '../../../harness/runtime/decomp-constants';
import { DoPokeballSendOutAnimation } from '../../pokeball';
import { POKEBALL_PLAYER_SENDOUT } from '../../../include/pokeball';
// Gate GFX ball (#22) : la sheet/palette ball doivent etre dans assetCache (1 seul instance
// partage, decomp-globals.ts:153) AVANT le getAsset SYNC de LoadBallGfx, sinon BLOC NOIR.
import { assetCache } from '../../../harness/runtime/decomp-globals';

// Asset Poke Ball 16x16. VRAM via l'ALLOCATEUR 1:1 décomp (`AllocSpriteTiles`) — PLUS
// d'offset en dur (l'ancien 0x4000 écrasait les tiles du mon joueur ; 0x5800 était un
// patch fragile). Les tiles sont allouées dynamiquement dans l'espace libre → zéro
// collision possible, comme la décomp (LoadBallGfx → sheet tag → AllocSpriteTiles).
const POKE_BALL_URL = '/decomp/em/balls/poke.png';
// On charge l'asset INDEXÉ (.4bpp.bin + .gbapal), PAS le PNG RGB — cf. _ensureBallAsset.
const POKE_BALL_PAL_URL = '/decomp/em/balls/poke.gbapal';
const BALL_TILE_COUNT = 4;   // 16×16 = 4 tiles 8×8
const TAG_SENDOUT_BALL = 'BATTLE_SENDOUT_BALL';
const TAG_SENDOUT_BALL_PAL = 'BATTLE_SENDOUT_BALL_PAL';
let _ballTileStart = -1;     // tile alloué (= tileId base de la ball)
let _ballPaletteSlot = -1;
let _ballAssetLoaded = false;

// 1:1 décomp : index dans gAffineAnims_BattleSpritePlayerSide/OpponentSide.
const BATTLER_AFFINE_NORMAL = 0;
const BATTLER_AFFINE_EMERGE = 1;   // = sAffineAnim_Battler_Emerge

// ─── Port 1:1 de l'arc de lancer JOUEUR (battle_anim_mons.c) ────────────────
// SpriteCB_PlayerMonSendOut_2 n'est PAS un simple sinus : l'arc a une phase APEX
// (HIBYTE(data[7]) ∈ [35,80)) où la translation ralentit à 1/3 (deltas /3 + data[0]
// décrémente 1 frame sur 3) + la ball spin → elle PLANE au sommet, puis redescend
// jusqu'à monY+24 (= LE SOL, pas le centre). ~42 frames total (vs 25 d'un arc plat).
// On porte fidèlement InitAnimLinearTranslation / AnimTranslateLinear /
// TranslateAnimHorizontalArc (battle_anim_mons.c:1065/1111/794) + InitAnimArcTranslation:785.
interface ArcState {
  d0: number; d1: number; d2: number; d3: number; d4: number;
  d5: number; d6: number; d7: number; affineParam: number;
}
/** 1:1 Sin(index, amplitude) = (gSineTable[index] * amplitude) >> 8. */
function _arcSin(index: number, amplitude: number): number {
  return (gSineTable(index & 0xFF) * amplitude) >> 8;
}
/** 1:1 InitAnimLinearTranslation (1065) : d1=startX,d2=destX,d3=startY,d4=destY en entrée
 *  → calcule xDelta→d1, yDelta→d2 (bit 0 = signe), d3=d4=0. */
function _initLinear(a: ArcState): void {
  const x = a.d2 - a.d1;
  const y = a.d4 - a.d3;
  const movingLeft = x < 0, movingUp = y < 0;
  let xDelta = (Math.abs(x) << 8) & 0xFFFF;
  let yDelta = (Math.abs(y) << 8) & 0xFFFF;
  xDelta = (xDelta / a.d0) | 0;
  yDelta = (yDelta / a.d0) | 0;
  xDelta = movingLeft ? (xDelta | 1) : (xDelta & ~1);
  yDelta = movingUp ? (yDelta | 1) : (yDelta & ~1);
  a.d1 = xDelta & 0xFFFF; a.d2 = yDelta & 0xFFFF; a.d3 = 0; a.d4 = 0;
}
/** 1:1 AnimTranslateLinear (1111) : pose ball.x2/y2 depuis les deltas ; true quand d0=0. */
function _animLinear(a: ArcState, ball: { x2: number; y2: number }): boolean {
  if (!a.d0) return true;
  const v1 = a.d1, v2 = a.d2;
  const x = (a.d3 + v1) & 0xFFFF;
  const y = (a.d4 + v2) & 0xFFFF;
  ball.x2 = (v1 & 1) ? -(x >> 8) : (x >> 8);
  ball.y2 = (v2 & 1) ? -(y >> 8) : (y >> 8);
  a.d3 = x; a.d4 = y;
  a.d0--;
  return false;
}
/** 1:1 TranslateAnimHorizontalArc (794) : translation linéaire + bosse sinus sur y2. */
function _translateArc(a: ArcState, ball: { x2: number; y2: number }): boolean {
  if (_animLinear(a, ball)) return true;
  a.d7 = (a.d7 + a.d6) & 0xFFFF;
  ball.y2 += _arcSin((a.d7 >> 8) & 0xFF, a.d5);
  return false;
}

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
  arc: ArcState | null; // 1:1 arc de lancer JOUEUR (null côté adverse = pose sans arc)
  emergeWaitFrames: number;
  ballRotation: number; // 1:1 sAffineAnim_BallRotate_4 : rotation s16 (<<8) accumulée
  fadeTaskId: number;   // task du flash blanc (LaunchBallFadeMonTask) — on attend sa fin
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
    // ⚠️ On charge l'asset INDEXÉ (poke.4bpp.bin + poke.gbapal), PAS le PNG RGB.
    // poke.png a un FOND BLANC (255,255,255) identique au blanc du ball → la conversion
    // RGB→4bpp keye le blanc en index 0 (transparent) → les parties claires du ball
    // deviennent transparentes = des TROUS (surtout visibles quand la ball tourne).
    // Le .4bpp.bin préserve les indices d'origine : index 0 = coins transparents,
    // index 5 = blanc OPAQUE du ball (même RGB 248,248,248 mais index ≠ 0). 1:1 décomp
    // gBallGfx_Poke (poke.4bpp.bin) + gBallPal_Poke (poke.gbapal).
    const binBytes = await loadTileBin(POKE_BALL_URL, 4);
    const palColors = await loadGbaPal(POKE_BALL_PAL_URL);
    // N'écrit QUE frame 0 (16×16 = 4 tiles = 128 octets). poke.4bpp.bin a 3 frames
    // (fermée/mi-ouverte/ouverte) mais le send-out n'ouvre pas la ball par anim de frame
    // (elle disparaît), donc les frames 1-2 sont inutiles. Écriture directe objVram
    // (= ce que fait LoadCompressedSpriteSheet, mais sans re-quantifier les indices).
    rt.gba.objVram.set(binBytes.subarray(0, BALL_TILE_COUNT * 32), _ballTileStart * 32);
    _ballPaletteSlot = LoadSpritePalette({ data: palColors, tag: TAG_SENDOUT_BALL_PAL });
    _ballAssetLoaded = true;
  } catch (e) {
    console.warn('[sendout] failed to load poke ball asset:', e);
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
  const mon = rt?.gSprites[opts.monSpriteId];

  // Fallback : si l'asset n'a pas chargé, on révèle le mon directement (pas d'anim)
  // pour ne JAMAIS laisser le mon invisible.
  if (!rt || !_ballAssetLoaded || _ballPaletteSlot < 0 || !mon) {
    if (mon) mon.invisible = false;
    _status = 'done';
    return;
  }

  // 1:1 décomp pokeball.c:376 CreateSprite(template, 32,80,29) puis :
  //  - POKEBALL_PLAYER_SENDOUT (385-386) : ball à (24,68), arc parabolique vers le mon.
  //  - POKEBALL_OPPONENT_SENDOUT (390-391) : ball à (monX, monY+24), SANS arc (data[0]=0),
  //    elle attend ~16f puis s'ouvre (SpriteCB_OpponentMonSendOut → ReleaseMonFromBall).
  const startX = opts.startX ?? (opts.side === 'opponent' ? opts.endX : 24);
  const startY = opts.startY ?? (opts.side === 'opponent' ? opts.endY + 24 : 68);
  const ball = rt.CreateSpriteAtOam({
    tileId: _ballTileStart,
    paletteBank: _ballPaletteSlot,
    x: startX, y: startY,
    shape: 0, size: 1,   // 16x16 (= 4 tiles 8x8)
    // 1:1 sBallOamData (pokeball.c:104) priority=2 + CreateSprite(...,29) subpriority=29.
    // Priorité 2 = MÊME plan que les mons (prio 2), donc DERRIÈRE les BG de priorité 0/1
    // (la boîte de dialogue = BG0 prio 0) → la ball "tombe derrière la textbox" (retour user)
    // au lieu de passer devant (l'ancien priority:0 la mettait devant tout).
    priority: 2,
    subpriority: 29,
  });

  // Cache le mon jusqu'à l'émergence (1:1 : il sort de la ball).
  mon.invisible = true;

  // 1:1 sBallOamData (pokeball.c:92-107) : la ball est en ST_OAM_AFFINE_DOUBLE → sa zone de
  // rendu est 2× (32×32) pour qu'une rotation 360° du sprite 16×16 ne soit PAS clippée à son
  // cadre (= le bug "couleur transparente / coins coupés" de la version NORMAL session passée).
  // + table d'anim sAffineAnim_BallRotate. On démarre à l'anim 0 (statique) ; le SPIN (anim 4)
  // se lance à l'apex de l'arc (tickSendOut, 1:1 pokeball.c:939) puis reset à 0 en fin d'arc
  // (pokeball.c:975). La rotation tourne via le système affine anim partagé (= comme le mon
  // qui scale) : tickAllAffineAnims accumule +25/frame (sAffineAnim_BallRotate_4, duration=1).
  const ballSprite = rt.gSprites[ball.spriteId];
  if (ballSprite) {
    const _m = AllocOamMatrix();
    if (_m >= 0) {
      ballSprite.matrixNum = _m;
      ballSprite.affineMode = ST_OAM_AFFINE_DOUBLE as 0 | 1 | 2 | 3;
      // -wPx/2, -hPx/2 : recentre la bbox doublée (16×16 → 32×32) pour que la ball reste
      // visuellement au même point (1:1 CalcCenterToCornerVec quand le flag DOUBLE est posé).
      ballSprite.centerToCornerVecX = -8;
      ballSprite.centerToCornerVecY = -8;
      ballSprite.affineAnimsTableName = 'sAffineAnim_BallRotate';
      const _oam = rt.gba.oam[ball.oamIndex];
      if (_oam) { _oam.affineMode = ST_OAM_AFFINE_DOUBLE; _oam.affineParamIndex = _m; }
      rt.StartSpriteAffineAnim(ball.spriteId, 0);   // BALL_AFFINE_ANIM_0 (statique, 1:1 CreateSprite)
      BeginAffineAnim(ballSprite, rt);              // applique frame 0 (identité) immédiatement
    }
  }

  let _arc: ArcState | null = null;
  if (opts.side === 'player') {
    // 1:1 SpriteCB_PlayerMonSendOut_1 + InitAnimArcTranslation (pokeball.c:911 + battle_anim_mons.c:785) :
    // arc (startX=24, startY=68) → (monX, monY+24 = LE SOL) sur data[0]=25, amplitude data[5]=-30.
    // data[6]=0x8000/25 = incrément de phase sinus (aussi lu comme « sBattler » dans l'apex → /3).
    _arc = { d0: 25, d1: startX, d2: opts.endX, d3: startY, d4: opts.endY + 24, d5: -30, d6: 0, d7: 0, affineParam: 0 };
    _initLinear(_arc);
    _arc.d6 = (0x8000 / 25) | 0;
  }

  _so = {
    phase: 1, frame: 0,
    ballSpriteId: ball.spriteId,
    monSpriteId: opts.monSpriteId,
    side: opts.side,
    monPalNum: opts.monPalNum,
    species: opts.species,
    startX, startY,
    endX: opts.endX, endY: opts.endY,
    arc: _arc,
    emergeWaitFrames: 0,
    ballRotation: 0,
    fadeTaskId: -1,
  };
}

/** Tick per-frame (gated ~60fps). No-op si pas actif. */
export function tickSendOut(): void {
  if (_status !== 'active' || !_so) return;
  const rt = getRuntime();
  if (!rt) { _so = null; _status = 'done'; return; }

  // 1:1 timing : avance ≤1 step / FRAME LOGIQUE (gIntroFrameCounter), pas sur le
  // mur d'horloge (performance.now). tickFixed appelle flow.tick → ce tick 1×/frame
  // logique 60Hz ; gater sur gIntroFrameCounter = lockstep avec la logique + le texte
  // (RunTextPrinters fait pareil) + déterministe au frame-stepping devtool.
  const fc = rt.gIntroFrameCounter;
  if (fc === _lastFrameCounter) return;
  _lastFrameCounter = fc;

  const ball = rt.gSprites[_so.ballSpriteId];
  const mon = rt.gSprites[_so.monSpriteId];
  if (!mon) { _cleanup(rt); return; }

  _so.frame++;

  switch (_so.phase) {
    case 1: {  // THROW — player = arc, opponent = hold (1:1 SpriteCB_OpponentMonSendOut)
      if (_so.side === 'opponent') {
        // 1:1 SpriteCB_OpponentMonSendOut (pokeball.c:991) : la ball apparaît à la
        // position du mon (+24y), NE bouge PAS, attend `data[0] > 15` frames, puis
        // SpriteCB_ReleaseMonFromBall. Pas d'arc de lancer côté adverse.
        if (ball) { ball.x = _so.startX; ball.y = _so.startY; }
        if (_so.frame > 15) { _so.phase = 2; _so.frame = 0; }
      } else {
        // 1:1 SpriteCB_PlayerMonSendOut_2 (pokeball.c:924) : arc avec APEX ralenti.
        // La position est portée par x2/y2 (la base x/y reste à 24,68), comme la décomp.
        const a = _so.arc;
        if (!a || !ball) { _so.phase = 2; _so.frame = 0; break; }
        const hi = (a.d7 >> 8) & 0xFF;
        if (hi >= 35 && hi < 80) {
          // APEX : 1ʳᵉ entrée → ralentit la translation à 1/3 (deltas /3). La ball PLANE.
          if ((a.affineParam & 0xFF00) === 0) {
            const r6 = a.d1 & 1, r7 = a.d2 & 1;
            a.d1 = (((a.d1 / 3) | 0) & ~1) | r6;
            a.d2 = (((a.d2 / 3) | 0) & ~1) | r7;
            // 1:1 pokeball.c:939 : la ball commence à TOURNER à l'apex (anim 4 = +25/frame).
            rt.StartSpriteAffineAnim(_so.ballSpriteId, 4);
          }
          const r4 = a.d0;
          _animLinear(a, ball);
          a.d7 = (a.d7 + ((a.d6 / 3) | 0)) & 0xFFFF;   // 1:1 data[7] += sBattler(=data[6])/3
          ball.y2 += _arcSin((a.d7 >> 8) & 0xFF, a.d5);
          a.affineParam = (a.affineParam + 0x100) & 0xFFFF;
          // data[0] ne décrémente qu'1 frame sur 3 → l'apex dure 3× plus longtemps.
          a.d0 = ((a.affineParam >> 8) % 3 !== 0) ? r4 : (r4 - 1);
          if (((a.d7 >> 8) & 0xFF) >= 80) {
            // sortie d'apex → restaure la vitesse pleine (deltas ×3).
            const r6 = a.d1 & 1, r7 = a.d2 & 1;
            a.d1 = ((a.d1 * 3) & ~1) | r6;
            a.d2 = ((a.d2 * 3) & ~1) | r7;
          }
        } else {
          // Montée (hi<35) ou descente (hi>=80) : arc normal jusqu'à la fin (le SOL).
          if (_translateArc(a, ball)) {
            // 1:1 pokeball.c:962 : arc fini → fige la position (x += x2 ; y += y2) puis release.
            ball.x += ball.x2; ball.y += ball.y2; ball.x2 = 0; ball.y2 = 0;
            // 1:1 pokeball.c:975 : reset l'anim affine à 0 (arrête le spin) avant le release.
            rt.StartSpriteAffineAnim(_so.ballSpriteId, 0);
            _so.phase = 2; _so.frame = 0;
          }
        }
      }
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
      AnimateBallOpenParticlesForPokeball(rt, _bx, _by, 1, 28, BALL_POKE);
      // 1:1 pokeball.c:758 `LaunchBallFadeMonTask(TRUE, sprite->sBattler, 14, ballId)`.
      // DEUX effets distincts (cf. battle_anim_throw.c:2033) :
      //  (a) le MON blanchit (BlendPalette sur sa palette OBJ = `spritePalNum`, puis fade
      //      blanc→couleur en 16f). C'est piloté par le 3ᵉ arg `_so.monPalNum`.
      //  (b) le DÉCOR flashe blanc (BeginNormalPaletteFade sur `selectedPalettes`). La décomp
      //      passe la CONSTANTE 14 = palettes BG 1,2,3 (= le terrain de combat). Chez nous le
      //      terrain visible (BG3) est sur le bank 2 → 14 le flashe ; banks 1,3 = BG cachés
      //      (aucun effet visible) ; on ne touche NI la textbox (bank 0) NI les sprites (OBJ).
      //      ⚠️ AVANT : je passais le bit OBJ du mon → re-blanchissait le mon (redondant avec
      //      (a)) au lieu de flasher le décor → "pas de flash écran" (retour user). 14 = 1:1.
      const selectedPalettes = 0x0000000E;  // 1:1 décomp : BG palettes 1,2,3
      _so.fadeTaskId = LaunchBallFadeMonTask(rt, true, _so.monPalNum, selectedPalettes, BALL_POKE);
      // 1:1 pokeball.c:815-823 (cf. Birch decomp-globals:2684-2694) : reveal + emerge.
      mon.invisible = false;
      SetUpForReleaseAffineAnim(rt, _so.monSpriteId, _so.side);
      rt.StartSpriteAffineAnim(_so.monSpriteId, BATTLER_AFFINE_EMERGE);
      BeginAffineAnim(mon, rt);   // applique frame 0 immédiatement (évite 1-frame 0×0)
      mon.data[1] = 0x1000;
      mon.y2 = mon.data[1] >> 8;   // 1:1 : le mon démarre +16px plus bas (au sol) → émerge du BAS
      // Cri du mon — 1:1 pokeball.c:683-686 PlayCry_ByMode(species, pan, mode).
      // pan = GetBattlerSide (joueur -25 / adverse +25). ⚠️ DETTE : ce state ad-hoc
      // ne porte PAS le Pokemon party → mode NORMAL fixe (la branche WEAK
      // ShouldPlayNormalMonCry(mon) sur les HP exigerait de plomber un ref mon
      // via startSendOut/opts — chantier séparé).
      const crySpecies = resolveDecompConstant(_so.species) ?? 0;
      const cryPan = _so.side === 'player' ? -25 : 25;
      if (crySpecies) PlayCry_ByMode(crySpecies, cryPan, CRY_MODE_NORMAL);
      // La ball disparaît (1:1 HandleBallAnimEnd → ball invisible une fois ouverte).
      if (ball) ball.invisible = true;
      _so.phase = 3; _so.frame = 0;
      break;
    }
    case 3: {  // EMERGE WAIT — 1:1 HandleBallAnimEnd (pokeball.c:845) + SpriteCB_PlayerMonFromBall.
      _so.emergeWaitFrames++;
      // 1:1 HandleBallAnimEnd : tant que l'affine emerge tourne, le mon descend de
      // data[1]>>8 (16→0) → il MONTE du sol pendant qu'il grandit = il émerge DU BAS
      // (pas du centre, retour user 2026-06-01). data[1] -= 288/frame, y2 = data[1]>>8.
      if (!mon.affineAnimEnded && _so.emergeWaitFrames <= 40) {
        mon.data[1] -= 288;
        if (mon.data[1] < 0) mon.data[1] = 0;
        mon.y2 = mon.data[1] >> 8;
      } else {
        mon.y2 = 0;   // 1:1 HandleBallAnimEnd : y2 = 0 à la fin de l'affine.
        rt.StartSpriteAffineAnim(_so.monSpriteId, BATTLER_AFFINE_NORMAL);
        TearDownReleaseAffineAnim(rt, _so.monSpriteId);
        _so.phase = 4; _so.frame = 0;
      }
      break;
    }
    case 4: {  // WAIT FLASH — le send-out ne se TERMINE pas tant que le flash blanc
      // (LaunchBallFadeMonTask : fade blanc→couleur ~32f) joue → sinon le menu/healthbox
      // apparaît pendant que le mon est encore blanc (retour user "menu avant fin anim").
      _so.frame++;
      const flashRunning = (_so.fadeTaskId >= 0 && rt.gTasks[_so.fadeTaskId]?.isActive === true) || rt.gPaletteFade.active;
      if (!flashRunning || _so.frame > 64) {   // cap 64f = filet de sécurité
        _cleanup(rt);
      }
      break;
    }
  }
}

function _cleanup(rt: DecompRuntime): void {
  if (_so) {
    const ball = rt.gSprites[_so.ballSpriteId];
    if (ball) {
      // Libère la matrice OAM du spin (sinon fuite d'un slot affine par combat).
      if ((ball.matrixNum ?? 0) > 0) { FreeOamMatrix(ball.matrixNum); ball.matrixNum = 0; }
      DestroySprite(_so.ballSpriteId);
    }
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
  const mon = rt?.gSprites[opts.monSpriteId];
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
  const fc = rt.gIntroFrameCounter;   // 1:1 frame logique 60Hz (cf. tickSendOut)
  if (fc === _rtbLastFc) return;
  _rtbLastFc = fc;
  const mon = rt.gSprites[_rtb.monSpriteId];
  const ball = rt.gSprites[_rtb.ballSpriteId];
  _rtb.frame++;
  // Le mon est aspiré dans la ball (~frame 4).
  if (_rtb.frame >= 4 && mon) mon.invisible = true;
  // Fin du recall (~frame 18) : la ball disparaît.
  if (_rtb.frame >= 18) {
    if (ball) DestroySprite(_rtb.ballSpriteId);
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
  // Même critère par TAG que le front adverse (cf. _ensureOppTrainerAsset) :
  // l'état de l'allocateur fait foi, pas un flag module-level qui peut survivre
  // à un teardown (ResetSpriteData du boot purge les tags → recharge 1:1 ROM).
  const existingStart = GetSpriteTileStartByTag(TAG_TRAINER_BACK);
  const existingPal = IndexOfSpritePaletteTag(TAG_TRAINER_BACK_PAL);
  if (existingStart !== 0xFFFF && existingPal !== 0xFF) {
    _trainerTileStart = existingStart;
    _trainerBackPalSlot = existingPal;
    _trainerBackLoaded = true;
    return;
  }
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

// 1:1 décomp `gTrainerBackAnimsPtrTable[BACK_PIC_BRENDAN/MAY]` = sBackAnims_Brendan/May
// (data/trainer_graphics/back_pic_anims.h) : [0]=idle (sAnim_GeneralFrame3 = frame 3),
// [1]=throw (sAnimCmd_Brendan_1 / May_Steven_1, IDENTIQUES). La décomp est image-based
// (imageValue = index de frame) ; notre back-pic est SHEET-based (4 frames × 64 tiles dans
// une seule sheet VRAM) → imageValue = frame × 64 (= la convention prouvée par sBallAnimSequences,
// ex FRAME(4)/FRAME(8) pour la ball 16×16=4t/frame). Lu par AnimateSprite : oam.tileNum =
// sheetTileStart + imageValue (sprite-animation.ts). PlayerHandleIntroTrainerBallThrow lance
// StartSpriteAnim(tr, 1) = le throw (frame 0→1→2→0→3).
const _TBACK_TPF = 64;   // tiles par frame (64×64)
const _sBackAnimIdle: ReadonlyArray<AnimCmd> = [ANIMCMD_FRAME(3 * _TBACK_TPF, 0), ANIMCMD_END];
const _sBackAnimThrow: ReadonlyArray<AnimCmd> = [
  ANIMCMD_FRAME(0 * _TBACK_TPF, 24), ANIMCMD_FRAME(1 * _TBACK_TPF, 9), ANIMCMD_FRAME(2 * _TBACK_TPF, 24),
  ANIMCMD_FRAME(0 * _TBACK_TPF, 9), ANIMCMD_FRAME(3 * _TBACK_TPF, 50), ANIMCMD_END,
];
const _sBackAnimsTrainer: ReadonlyArray<ReadonlyArray<AnimCmd>> = [_sBackAnimIdle, _sBackAnimThrow];

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
    // 1:1 GetBattlerSpriteSubpriority(B_POSITION_PLAYER_LEFT)=30 (battle_anim_mons.c:2050) :
    // le back-pic du dresseur joueur (subpri 30) rend DEVANT le mon adverse (subpri 40).
    subpriority: 30,
  });
  _trainerSpriteId = t.spriteId;
  // 1:1 PlayerHandleDrawTrainerPic : démarre off-screen DROITE (x2 = +DISPLAY_WIDTH),
  // le scroll (tickIntroSlideIn) le glisse vers x2=0 (-2/frame, SpriteCB_TrainerSlideIn).
  const _ts = rt.gSprites[_trainerSpriteId];
  if (_ts) {
    _ts.x2 = DISPLAY_WIDTH;
    // 1:1 SetMultiuseSpriteTemplateToTrainerBack : attache la table d'anims back-pic. usingSheet +
    // sheetTileStart pour que AnimateSprite résolve oam.tileId = sheetTileStart + imageValue (anim 0
    // idle = frame 3 ; anim 1 = throw, lancé par StartSpriteAnim(tr,1) au lancer). Sans sheetTileStart
    // l'anim mettrait tileId = 0 + imageValue (cf root cause ball "cubique").
    _ts.usingSheet = true;
    _ts.sheetTileStart = _trainerTileStart;
    (_ts as { anims: ReadonlyArray<ReadonlyArray<AnimCmd>> }).anims = _sBackAnimsTrainer;
  }
  return _trainerSpriteId;
}

export function getTrainerSpriteId(): number { return _trainerSpriteId; }

/** Détruit le sprite de dos du dresseur (= au lancer / teardown). */
export function destroyTrainerBackSprite(): void {
  const rt = getRuntime();
  if (rt && _trainerSpriteId >= 0) DestroySprite(_trainerSpriteId);
  _trainerSpriteId = -1;
  // Libère les 256 tiles VRAM du dresseur DÈS qu'il sort (fin du lancer) — inutile de
  // les garder tout le combat (le mon a émergé). Rend l'espace 704+ libre pour la capture.
  if (_trainerTileStart >= 0) { FreeSpriteTilesByTag(TAG_TRAINER_BACK); _trainerTileStart = -1; _trainerBackLoaded = false; }
}

// ─── Sprite FRONT du dresseur ADVERSE (combat dresseur : slide-in + lancer) ──
// 1:1 décomp OpponentHandleDrawTrainerPic (battle_controller_opponent.c:1240) :
// trainerPicId = gTrainers[gTrainerBattleOpponent_A].trainerPic ; front pic 64×64,
// posé à (176, (8-size)*4+40 = 40), x2=-DISPLAY_WIDTH, sSpeedX=2 → slide-in gauche.
// Au lancer (OpponentHandleIntroTrainerBallThrow), slide-off DROITE (destX=280) + free.
const OPP_TRAINER_TILE_COUNT = 64;   // front pic 64×64 = 64 tiles 8×8 (TRAINER_SPRITE 0x800)
const TAG_OPP_TRAINER = 'BATTLE_OPP_TRAINER';
const TAG_OPP_TRAINER_PAL = 'BATTLE_OPP_TRAINER_PAL';
let _oppTrainerPicMap: Record<string, { png: string }> | null = null;
let _oppTrainerPicMapLoading: Promise<void> | null = null;
let _oppTrainerTileStart = -1;
let _oppTrainerLoaded = false;
let _oppTrainerPalSlot = -1;
let _oppTrainerSpriteId = -1;
let _oppTrainerPending = false;   // asset en cours de chargement (garde la slide active)

/** Charge la map TRAINER_PIC_X → {png} (= gTrainerFrontPicTable, 1 fois). */
async function _ensureOppTrainerPicMap(): Promise<void> {
  if (_oppTrainerPicMap) return;
  if (!_oppTrainerPicMapLoading) {
    _oppTrainerPicMapLoading = (async () => {
      try {
        const resp = await fetch('/decomp/em/trainer-pics.json');
        _oppTrainerPicMap = await resp.json() as Record<string, { png: string }>;
      } catch (e) {
        console.warn('[sendout] failed to load trainer-pics.json:', e);
        _oppTrainerPicMap = {};
      }
    })();
  }
  await _oppTrainerPicMapLoading;
}

/** Charge le front pic du dresseur adverse (= DecompressTrainerFrontPic).
 *  Critère « déjà chargé » 1:1 décomp : l'état de l'allocateur PAR TAG —
 *  ResetSpriteData (boot de CHAQUE combat) purge sSpriteTileRangeTags → le tag
 *  disparaît → on recharge, exactement comme la ROM recharge le pic à chaque
 *  combat. (L'ancien flag module-level `_oppTrainerLoaded` survivait au
 *  teardown → 2e combat dresseur = sprite créé sur des tiles jamais rechargées
 *  = bouillie, bug user 2026-06-12. Même racine/fix que la healthbox.) */
async function _ensureOppTrainerAsset(picEnum: string): Promise<void> {
  const existingStart = GetSpriteTileStartByTag(TAG_OPP_TRAINER);
  const existingPal = IndexOfSpritePaletteTag(TAG_OPP_TRAINER_PAL);
  if (existingStart !== 0xFFFF && existingPal !== 0xFF) {
    // Déjà chargé CE cycle (tag vivant) — resynchronise les miroirs locaux.
    _oppTrainerTileStart = existingStart;
    _oppTrainerPalSlot = existingPal;
    _oppTrainerLoaded = true;
    return;
  }
  const rt = getRuntime();
  if (!rt) return;
  await _ensureOppTrainerPicMap();
  const entry = _oppTrainerPicMap?.[picEnum];
  if (!entry) { console.warn('[sendout] trainer pic introuvable:', picEnum); return; }
  try {
    // 1:1 décomp : alloue des tiles LIBRES puis charge le front pic dedans.
    _oppTrainerTileStart = AllocSpriteTiles(OPP_TRAINER_TILE_COUNT);
    if (_oppTrainerTileStart < 0) { console.warn('[sendout] pas de tiles VRAM libres pour le dresseur adverse'); return; }
    AllocSpriteTileRange(TAG_OPP_TRAINER, _oppTrainerTileStart, OPP_TRAINER_TILE_COUNT);
    const loaded = await rt.LoadCompressedSpriteSheet('/decomp/em/' + entry.png, _oppTrainerTileStart * 32);
    _oppTrainerPalSlot = LoadSpritePalette({ data: loaded.palette, tag: TAG_OPP_TRAINER_PAL });
    _oppTrainerLoaded = true;
  } catch (e) {
    console.warn('[sendout] failed to load opp trainer front pic:', e);
  }
}

/** Charge + affiche le sprite FRONT du dresseur adverse à (x,y), off-screen GAUCHE
 *  (x2=-DISPLAY_WIDTH) pour le slide-in. 1:1 OpponentHandleDrawTrainerPic. */
export async function showOpponentTrainerSprite(picEnum: string, x: number, y: number): Promise<number> {
  _oppTrainerPending = true;
  await _ensureOppTrainerAsset(picEnum);
  const rt = getRuntime();
  if (!rt || !_oppTrainerLoaded || _oppTrainerPalSlot < 0) { _oppTrainerPending = false; return -1; }
  const t = rt.CreateSpriteAtOam({
    tileId: _oppTrainerTileStart,
    paletteBank: _oppTrainerPalSlot,
    x, y,
    shape: 0, size: 3,   // 64×64 (SQUARE, size 3)
    priority: 2,         // même plan que les mons
  });
  _oppTrainerSpriteId = t.spriteId;
  // 1:1 OpponentHandleDrawTrainerPic : démarre off-screen GAUCHE (x2=-DISPLAY_WIDTH),
  // sSpeedX=2 → tickIntroSlideIn le glisse vers x2=0.
  const _ts = rt.gSprites[_oppTrainerSpriteId];
  if (_ts) _ts.x2 = -DISPLAY_WIDTH;
  _oppTrainerPending = false;
  return _oppTrainerSpriteId;
}

export function getOpponentTrainerSpriteId(): number { return _oppTrainerSpriteId; }

/** Détruit le sprite front du dresseur adverse (= au lancer / teardown).
 *  1:1 SpriteCB_FreeOpponentSprite (FreeTrainerFrontPicPalette + DestroySprite). */
export function destroyOpponentTrainerSprite(): void {
  const rt = getRuntime();
  if (rt && _oppTrainerSpriteId >= 0) DestroySprite(_oppTrainerSpriteId);
  _oppTrainerSpriteId = -1;
  if (_oppTrainerTileStart >= 0) { FreeSpriteTilesByTag(TAG_OPP_TRAINER); _oppTrainerTileStart = -1; _oppTrainerLoaded = false; }
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
 *  par showTrainerBackSprite). Les deux glissent vers x2=0. En combat DRESSEUR,
 *  `oppSpriteId` est omis (le mon ne slide pas — c'est le sprite dresseur FRONT,
 *  géré par `_oppTrainerSpriteId`, qui slide via showOpponentTrainerSprite). */
export function startIntroSlideIn(oppSpriteId?: number): void {
  if (oppSpriteId !== undefined) {
    const rt = getRuntime();
    const opp = rt?.gSprites[oppSpriteId];
    if (opp) opp.x2 = -DISPLAY_WIDTH;   // 1:1 OpponentHandleLoadMonSprite : x2 = -DISPLAY_WIDTH
    _slideInOppId = oppSpriteId;
  } else {
    _slideInOppId = -1;   // combat dresseur : pas de mon à slider (le front dresseur slide)
  }
  _slideInStatus = 'active';
  _slideInLastFc = -1;
}

/** Tick per-frame (gated ~60fps). Glisse adverse (mon OU dresseur front, +2) et
 *  dresseur joueur (-2) vers x2=0. */
export function tickIntroSlideIn(): void {
  if (_slideInStatus !== 'active') return;
  const rt = getRuntime();
  if (!rt) { _slideInStatus = 'done'; return; }
  const fc = rt.gIntroFrameCounter;   // 1:1 frame logique 60Hz (cf. tickSendOut)
  if (fc === _slideInLastFc) return;
  _slideInLastFc = fc;

  let oppDone = true, trDone = true, oppTrDone = true;
  // Côté adverse SAUVAGE : le mon slide depuis la gauche (+2).
  const opp = _slideInOppId >= 0 ? rt.gSprites[_slideInOppId] : null;
  if (opp && (opp.x2 ?? 0) < 0) { opp.x2 = Math.min(0, (opp.x2 ?? 0) + SLIDE_IN_SPEED); }
  oppDone = !opp || (opp.x2 ?? 0) >= 0;
  // Côté adverse DRESSEUR : le sprite front slide depuis la gauche (1:1 sSpeedX=2).
  // `_oppTrainerPending` = l'asset est en cours de chargement (async) → la slide
  // reste 'active' jusqu'à ce qu'il apparaisse (sinon done prématuré = sprite figé off-screen).
  const oppTr = _oppTrainerSpriteId >= 0 ? rt.gSprites[_oppTrainerSpriteId] : null;
  if (oppTr && (oppTr.x2 ?? 0) < 0) { oppTr.x2 = Math.min(0, (oppTr.x2 ?? 0) + SLIDE_IN_SPEED); }
  oppTrDone = !_oppTrainerPending && (!oppTr || (oppTr.x2 ?? 0) >= 0);
  // Dresseur JOUEUR (dos) : slide depuis la droite (-2).
  const tr = _trainerSpriteId >= 0 ? rt.gSprites[_trainerSpriteId] : null;
  if (tr && (tr.x2 ?? 0) > 0) { tr.x2 = Math.max(0, (tr.x2 ?? 0) - SLIDE_IN_SPEED); }
  trDone = !tr || (tr.x2 ?? 0) <= 0;
  if (oppDone && trDone && oppTrDone) { _slideInStatus = 'done'; _slideInLastFc = -1; }
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
  if (_oppTrainerTileStart >= 0) FreeSpriteTilesByTag(TAG_OPP_TRAINER);
  _ballTileStart = -1; _trainerTileStart = -1; _oppTrainerTileStart = -1;
  _ballAssetLoaded = false; _ballPaletteSlot = -1;
  _trainerBackLoaded = false; _trainerBackPalSlot = -1;
  _oppTrainerLoaded = false; _oppTrainerPalSlot = -1; _oppTrainerPending = false;
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
  const t = rt?.gSprites[_trainerSpriteId];
  _tt = { frame: 0, slideStartX: t ? t.x : 0, ballOpts: opts, ballStarted: false };
  // GFX ball 1:1 (DECOMP-TS-BRIDGE §4 + pokeball.c:1313) : gBallGfx_Poke/gBallPal_Poke doivent
  // etre dans assetCache AVANT le getAsset SYNC de LoadBallGfx (chain #22). Sinon
  // GetSpriteTileStartByTag=0xFFFF -> tileId 0 + palette noire = BLOC NOIR (cause racine PROUVEE
  // runtime __ballDiag : matrice ball saine, tileId=0, palette bank noire). (Re)garantit le
  // preload (async, idempotent). Le gate de tickTrainerThrow attend qu'il soit pret.
  void import('../../../harness/boot/intro-asset-loader').then((m) => m.ensureBallGfxLoaded()).catch(() => {});
  // Fallback : pas de sprite dresseur (asset échoué) → lance la ball directement.
  // Fallback (asset dresseur echoue) : lance la ball directement via le chain (#22).
  if (!t) { setActiveBattler(opts.monPalNum); DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT); _tt.ballStarted = true; }
}

/** Tick per-frame (gated ~60fps). No-op si pas actif. */
export function tickTrainerThrow(): void {
  if (_ttStatus !== 'active' || !_tt) return;
  const rt = getRuntime();
  if (!rt) { _tt = null; _ttStatus = 'done'; return; }
  const fc = rt.gIntroFrameCounter;   // 1:1 frame logique 60Hz (cf. tickSendOut)
  if (fc === _ttLastFc) return;
  _ttLastFc = fc;

  _tt.frame++;
  const t = rt.gSprites[_trainerSpriteId];
  if (t) {
    // Anim : tileId = tileBase + frameIndex × 64 (1:1 sAnimCmd_Brendan_1 timing).
    const fi = _trainerThrowFrameAt(_tt.frame);
    const oam = rt.gba.oam[t.oamIndex];
    if (oam) oam.tileId = _trainerTileStart + fi * TRAINER_TILES_PER_FRAME;
    // Slide linéaire de startX → destX=-40 (hors écran) sur 50 frames (AnimTranslateLinear).
    const _p = Math.min(1, _tt.frame / TRAINER_THROW_SLIDE_FRAMES);
    t.x = Math.round(_tt.slideStartX + (TRAINER_THROW_SLIDE_DEST_X - _tt.slideStartX) * _p);
  }
  // Ball lancée à la frame 31 (Task_StartSendOutAnim) → le mon émerge. GATE GFX 1:1 : ne lancer le
  // chain (#22) QUE si la sheet+palette ball sont dans assetCache (-> LoadBallGfx les charge SYNC ->
  // ball coloree) ; sinon LoadBallGfx -> getAsset null -> tileId 0 + palette noire = BLOC NOIR (cause
  // racine prouvee). Le preload async (startTrainerThrow) resout en qq frames ; le slide dure 50f ->
  // la fenetre [31..49] absorbe la latence. Filet a 49f pour ne JAMAIS bloquer l'emergence du mon.
  if (!_tt.ballStarted && _tt.frame >= TRAINER_THROW_BALL_FRAME) {
    const gfxReady = assetCache.has('gBallGfx_Poke') && assetCache.has('gBallPal_Poke');
    if (gfxReady || _tt.frame >= TRAINER_THROW_SLIDE_FRAMES - 1) {
      // 1:1 #22 : la ball part par le VRAI chain (DoPokeballSendOutAnimation, pokeball.ts).
      // DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT) (player.c:2224). Le mon est deja
      // cree (invisible). monPalNum = battler -> setActiveBattler avant (lu par le chain).
      setActiveBattler(_tt.ballOpts.monPalNum);
      DoPokeballSendOutAnimation(0, POKEBALL_PLAYER_SENDOUT);
      _tt.ballStarted = true;
    }
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

// ─── Lancer du dresseur ADVERSE (1:1 OpponentHandleIntroTrainerBallThrow) ────
// 1:1 décomp (battle_controller_opponent.c:1867) : le sprite front du dresseur GLISSE
// à DROITE hors écran (data[0]=35 frames, data[2]=280 destX, StartAnimLinearTranslation)
// puis est libéré (SpriteCB_FreeOpponentSprite). EN MÊME TEMPS (Task_StartSendOutAnim créé
// au même instant → StartSendOutAnim immédiat) la ball part côté adverse (POKEBALL_OPPONENT_
// SENDOUT : ball à la position du mon, attend 16f, s'ouvre → le mon émerge via affine).
// Pas d'anim de pose (le front pic est statique, contrairement au dos joueur 4-frames).
const OPP_TRAINER_SLIDE_FRAMES = 35;   // 1:1 data[0]=35
const OPP_TRAINER_SLIDE_DEST_X = 280;  // 1:1 data[2]=280 (hors écran droite, DISPLAY_WIDTH=240)

interface OppTrainerThrowState {
  frame: number;
  slideStartX: number;
}
let _ott: OppTrainerThrowState | null = null;
let _ottStatus: 'idle' | 'active' | 'done' = 'idle';
let _ottLastFc = -1;

export function getOpponentTrainerThrowStatus(): 'idle' | 'active' | 'done' { return _ottStatus; }
export function resetOpponentTrainerThrowStatus(): void { _ottStatus = 'idle'; }

/** Démarre le lancer du dresseur adverse : slide-off droite (35f) + ball send-out
 *  concurrente (le mon émerge). 1:1 OpponentHandleIntroTrainerBallThrow + Task_StartSendOutAnim. */
export function startOpponentTrainerThrow(opts: BallSendOpts): void {
  _ottStatus = 'active';
  const rt = getRuntime();
  const t = _oppTrainerSpriteId >= 0 ? rt?.gSprites[_oppTrainerSpriteId] : null;
  // 1:1 SetSpritePrimaryCoordsFromSecondaryCoords : intègre x2 dans x (fige la position).
  if (t) { t.x += (t.x2 ?? 0); t.x2 = 0; }
  _ott = { frame: 0, slideStartX: t ? t.x : 0 };
  // 1:1 Task_StartSendOutAnim : le send-out (ball) démarre IMMÉDIATEMENT (concurrent au slide).
  void startSendOut(opts);
}

/** Tick per-frame (gated ~60fps). No-op si pas actif. */
export function tickOpponentTrainerThrow(): void {
  if (_ottStatus !== 'active' || !_ott) return;
  const rt = getRuntime();
  if (!rt) { _ott = null; _ottStatus = 'done'; return; }
  const fc = rt.gIntroFrameCounter;   // 1:1 frame logique 60Hz (cf. tickSendOut)
  if (fc === _ottLastFc) return;
  _ottLastFc = fc;

  _ott.frame++;
  const t = _oppTrainerSpriteId >= 0 ? rt.gSprites[_oppTrainerSpriteId] : null;
  if (t) {
    // Slide linéaire startX → destX=280 (hors écran droite) sur 35 frames (AnimTranslateLinear).
    const p = Math.min(1, _ott.frame / OPP_TRAINER_SLIDE_FRAMES);
    t.x = Math.round(_ott.slideStartX + (OPP_TRAINER_SLIDE_DEST_X - _ott.slideStartX) * p);
  }
  // Free dresseur à la fin du slide (35f) — SpriteCB_FreeOpponentSprite. NB : la ball/
  // émergence continue (poll séparé via getSendOutStatus) — le slide finit avant l'émergence.
  if (_ott.frame >= OPP_TRAINER_SLIDE_FRAMES) {
    destroyOpponentTrainerSprite();
    _ott = null;
    _ottStatus = 'done';
    _ottLastFc = -1;
  }
}

/** Annule le lancer dresseur adverse en cours (= teardown combat). */
export function stopOpponentTrainerThrow(): void {
  _ott = null;
  _ottStatus = 'idle';
  _ottLastFc = -1;
}

/** Annule un send-out en cours (= teardown combat). */
export function stopSendOut(): void {
  const rt = getRuntime();
  if (rt && _so) _cleanup(rt);
  _so = null;
  _status = 'idle';
  _lastFrameCounter = -1;
}

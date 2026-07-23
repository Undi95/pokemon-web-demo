/**
 * battle_transition.ts — MIROIR 1:1 de `src/battle_transition.c` (décomp pokeemeraude).
 *
 * COEUR = la CHARPENTE 1:1 (plus bas) : la vraie machine à tâches décomp
 * (Task_BattleTransition + sTaskHandlers / sTasks_Intro / sTasks_Main), l'intro
 * flash, les helpers communs (InitTransitionData / FadeScreenBlack / SetCircularMask)
 * et les Task_* des 12 transitions du jeu solo (Blur, Swirl, Shuffle, PokeballsTrail,
 * Wave, Slice, AngledWipes, BigPokeball, ClockwiseWipe, Ripple, GridSquares,
 * WhiteBarsFade). Surface de bascule : `__battleTransitionCore` (consommé lazy par
 * engine/battle/battle-decomp-loop.ts — l'import statique du miroir = cycle ESM TDZ).
 *
 * EN TÊTE ci-dessous : un petit socle de helpers/adaptations 1:1 (ex-« bespoke »,
 * désormais l'unique voie) que la charpente réutilise — l'effet FLDEFF_POKEBALL_TRAIL
 * (registre fldeff générique non porté), `_setSinWave` (SetSinWave), `InitBlackWipe`/
 * `UpdateBlackWipe` (wipe Bresenham), les données `sAngledWipes_*`, `_fadeScreenBlack`,
 * et les constantes partagées. Chaque bloc conserve ses commentaires d'origine (ils
 * citent les précédents moteur : ball NOIRE résolue byte-exact, rotation ±4/frame à
 * valider à l'œil, assets async vs CpuSet SYNC → état Init ré-entrant, etc.).
 */


import {
  CreateSprite, DestroySprite, AllocOamMatrix,
  LoadSpritePalette as _sprLoadSpritePalette,
  IndexOfSpritePaletteTag as _sprIndexOfSpritePaletteTag,
} from './sprite';
import {
  getRuntime, BlendPalettes, PALETTES_ALL,
  gScanlineEffectRegBuffers, ScanlineEffect_Clear,
  FindTaskIdByFunc, gMain,
} from '../harness/runtime/decomp-globals';
import { loadIndexedPng } from '../harness/gba/png-loader';
import { Random } from './random';
import {
  MAX_SPRITES,
  REG_OFFSET_WININ, REG_OFFSET_WINOUT, REG_OFFSET_WIN0V, REG_OFFSET_WIN0H,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON, REG_OFFSET_MOSAIC,
} from '../harness/runtime/decomp-runtime';
import { DISPLAY_HEIGHT } from '../include/gba/defines';
// Modules coeur/feuilles de la charpente (task/palette/trig/gpu_regs/field_camera/
// field_weather) : battle_transition est un module lazy (side-effect import depuis
// battle_controller_opponent), aucune arête de cycle vers lui → pas de bombe TDZ
// (vérifié find-import-cycle).
import { CreateTask, DestroyTask, gTasks } from './task';
import { TASK_NONE } from '../include/task';
import { Cos, Sin as _swSin } from './trig';
import { BeginNormalPaletteFade, gPaletteFade } from './palette';
import { SetVBlankCallback } from './main';
import { SetGpuReg } from './gpu_regs';
import { EnableInterrupts } from '../harness/runtime/decomp-helpers';
import { ENUM_B_1 } from '../include/battle_transition';
import { GetCameraOffsetWithPan } from './field_camera';
import { SetWeatherScreenFadeOut } from './field_weather';

// ════════════════════════════════════════════════════════════════════════════
// Helpers/adaptations consommés par la charpente 1:1 — ex-bloc bespoke, reste 1:1
// ou adaptation moteur documentée. Chaque bloc GARDE ses commentaires d'origine
// (ils citent les précédents). Ces définitions sont référencées par les Task_*
// de la charpente ci-dessous (grep : _fldEffPokeballTrail, _setSinWave, Init/
// UpdateBlackWipe, sAngledWipes_*, _fadeScreenBlack, DISPLAY_WIDTH…).
// ════════════════════════════════════════════════════════════════════════════

// ─── Data 1:1 (battle_transition.c:500-503) ─────────────────────────────────
const NUM_POKEBALL_TRAILS = 5;
const DISPLAY_WIDTH = 240;
const sPokeballsTrail_StartXCoords: readonly number[] = [-16, DISPLAY_WIDTH + 16];
const sPokeballsTrail_Delays: readonly number[] = [0, 32, 64, 18, 48];
const sPokeballsTrail_Speeds: readonly number[] = [8, -8];

/** SetSpriteRotScale via la surface __battleAnimMons (anti-cycle ESM : un import
 *  statique de battle_anim_mons depuis ce module → TDZ BG_SCREEN_SIZE au boot). */
function SetSpriteRotScale(spriteId: number, xScale: number, yScale: number, rotation: number): void {
  const m = (globalThis as Record<string, unknown>).__battleAnimMons as {
    SetSpriteRotScale?: (id: number, x: number, y: number, r: number) => void;
  } | undefined;
  m?.SetSpriteRotScale?.(spriteId, xScale, yScale, rotation);
}

// ─── Assets (chargés une fois, par TAG décomp-like) ─────────────────────────
let _trailTile: Uint8Array | null = null;          // pokeball_trail.png (tiles 4bpp)
let _ballTiles: Uint8Array | null = null;          // pokeball.png 32x32 (16 tiles 4bpp)
let _ballPal: Uint16Array | null = null;           // palette indexée du png (= sFieldEffectPal_Pokeball)
let _assetsReady = false;
async function _ensureTrailAssets(): Promise<void> {
  if (_assetsReady) return;
  try {
    // loadIndexedPng tolérant (les png battle_transitions extraits sont RGBA, pas
    // de PLTE → loadIndexedPngStrict throw « no PLTE chunk »).
    const trail = await loadIndexedPng('/decomp/em/battle_transitions/pokeball_trail.png');
    _trailTile = trail.charData;
    // Ball : tiles BYTE-EXACTS + palette en ordre PLTE (extract-png-indexed-tiles
    // depuis le png INDEXÉ décomp). L'ancienne voie loadIndexedPng sur la copie
    // public/ RGBA sans PLTE quantifiait les indices → ball NOIRE (verdict A/B ×2)
    // même avec une palette correcte.
    try {
      const { loadGbaPal } = await import('../harness/gba/png-loader');
      const resp = await fetch('/decomp/em/battle_transitions/pokeball.4bpp.bin');
      _ballTiles = new Uint8Array(await resp.arrayBuffer());
      _ballPal = await loadGbaPal('/decomp/em/battle_transitions/pokeball.gbapal');
    } catch (e) { console.warn('[battle_transition] assets ball KO', e); }
  } catch (e) {
    // BLOQ-1 fail-open : un 404/cache-miss ne DOIT jamais geler l'écran. Le flag
    // passe true en finally → PokeballsTrail_Init avance ; les null-guards (_trailTile/
    // _ballTiles) dégradent coupe-net (0 ball → _activeTrailBalls=0 → End → FadeScreenBlack).
    console.error('[battle_transition] _ensureTrailAssets KO — transition PokeballsTrail dégradée SANS gel', e);
  } finally {
    _assetsReady = true;
  }
}

// ─── État runtime FLDEFF_POKEBALL_TRAIL (= active list fldeff, adaptation) ────
let _activeTrailBalls = 0;       // = FieldEffectActiveListContains(FLDEFF_POKEBALL_TRAIL)
let _ballPalSlot = 15;           // slot palette OBJ chargé pour les balls
const OBJ_PAL_TAG_TRAIL = 0x4503; // FLDEFF_PAL_TAG_POKEBALL_TRAIL (tag libre côté OBJ)

// ─── FldEff_PokeballTrail + SpriteCB (1:1 :1819-1878) ───────────────────────

interface TrailSprite {
  x: number; y: number; data: number[]; inUse?: boolean;
  invisible?: boolean; oamIndex: number; matrixNum?: number; affineMode?: number;
  callback: ((s: TrailSprite) => void) | null;
}

/** 1:1 `FldEff_PokeballTrail()` (:1819-1830) : crée le sprite ball 32×32
 *  priority 0, affine normal, rotation ±4/frame (sSpriteAffineAnimTable_Pokeball).
 *  Notre registre fldeff générique n'est pas porté → appel direct (équivalence). */
function _fldEffPokeballTrail(x: number, y: number, side: number, delay: number): void {
  const rt = getRuntime();
  if (!rt || !_ballTiles) return;
  const r = rt as unknown as {
    CreateSpriteInline?: (tpl: unknown, x: number, y: number, sub?: number) => number;
    AllocOamMatrix?: () => number;
    gSprites?: Array<TrailSprite | undefined>;
  };
  // Palette OBJ par TAG — IMPORTS DIRECTS sprite.ts : l'ancienne voie
  // `rt.LoadSpritePalette?.()` n'existait PAS sur le runtime (optional chaining
  // silencieux ×2) → slot 15 jamais écrit → BALL NOIRE (verdict A/B ×2).
  let pal = _sprIndexOfSpritePaletteTag(OBJ_PAL_TAG_TRAIL);
  if (pal === 0xFF && _ballPal) {
    pal = _sprLoadSpritePalette({ data: _ballPal, tag: OBJ_PAL_TAG_TRAIL });
  }
  if (pal === 0xFF || pal === undefined || pal < 0) pal = _ballPalSlot;
  _ballPalSlot = pal;
  const matrix = AllocOamMatrix() ?? 0;
  const spriteId = CreateSprite({
    name: 'FldEffPokeballTrail',
    images: [{ data: _ballTiles, size: _ballTiles.length }],
    oam: { shape: 0, size: 2 /* 32x32 */, priority: 0, paletteNum: pal, affineMode: 1, affineParamIndex: matrix },
    callback: SpriteCB_FldEffPokeballTrail,
  } as never, x, y, 0) ?? -1;
  if (spriteId < 0) return;
  const spr = r.gSprites?.[spriteId];
  if (spr) {
    spr.matrixNum = matrix;
    spr.data[0] = side;     // sSide
    spr.data[1] = delay;    // sDelay
    spr.data[2] = -1;       // sPrevX
    spr.data[7] = 0;        // angle cumulé (rotation affine ±4/frame)
  }
  _activeTrailBalls++;
}

/** 1:1 `SpriteCB_FldEffPokeballTrail(sprite)` (:1832-1878) : delay → avance
 *  8px/frame vers l'autre bord ; à chaque pas de 8px, pose le tile 1 (palette 15)
 *  sur 4 lignes du tilemap BG0 derrière la ball ; hors écran → stop fldeff. */
export function SpriteCB_FldEffPokeballTrail(sprite: TrailSprite): void {
  if (sprite.data[1] !== 0) {
    sprite.data[1]--;
  } else {
    if (sprite.x >= 0 && sprite.x <= DISPLAY_WIDTH) {
      const posX = sprite.x >> 3;
      const posY = sprite.y >> 3;
      if (posX !== sprite.data[2]) {
        sprite.data[2] = posX;
        const gba = (getRuntime() as unknown as { gba?: { bg: (n: number) => { tilemap: Uint16Array } } })?.gba;
        const tilemap = gba?.bg(0).tilemap;
        if (tilemap) {
          // SET_TILE ×4 : (posY-2..posY+1, posX) = tile 1 | pal 15.
          for (const dy of [-2, -1, 0, 1]) {
            const idx = (posY + dy) * 32 + posX;
            if (idx >= 0 && idx < tilemap.length) tilemap[idx] = 1 | (15 << 12);
          }
        }
      }
    }
    sprite.x += sPokeballsTrail_Speeds[sprite.data[0]];
    // Rotation continue 1:1 (AFFINEANIMCMD ±4/frame) — unité à valider à l'œil.
    sprite.data[7] = (sprite.data[7] + (sprite.data[0] === 0 ? -4 : 4)) & 0xFFFF;
    SetSpriteRotScale((sprite as unknown as { spriteId?: number }).spriteId ?? _findSpriteId(sprite), 0x100, 0x100, sprite.data[7] << 8);
    if (sprite.x < -15 || sprite.x > DISPLAY_WIDTH + 15) {
      // 1:1 FieldEffectStop : destroy + retire de l'active list.
      const rt = getRuntime();
      const id = _findSpriteId(sprite);
      if (rt && id >= 0) DestroySprite(id);
      sprite.inUse = false;
      sprite.callback = null;
      _activeTrailBalls--;
    }
  }
}

function _findSpriteId(sprite: TrailSprite): number {
  const rt = getRuntime();
  if (!rt?.gSprites) return -1;
  for (let id = 0; id < MAX_SPRITES; id++) {
    const s = rt.gSprites[id] as TrailSprite | undefined;
    if (s === undefined) continue;
    if (s === sprite) return id;
  }
  return -1;
}

/** = AnimateSprites pour NOS sprites pendant la transition (le CB2 custom ne
 *  fait pas tourner la boucle sprites du combat). */
function _tickTrailSprites(): void {
  const rt = getRuntime();
  if (!rt?.gSprites) return;
  for (let _si = 0; _si < MAX_SPRITES; _si++) {
    const spr = rt.gSprites[_si] as (TrailSprite & { name?: string }) | undefined;
    if (spr === undefined) continue;
    if (spr.inUse !== false && spr.callback === SpriteCB_FldEffPokeballTrail) {
      spr.callback(spr);
    }
  }
}

/** 1:1 `FadeScreenBlack()` (battle_transition.c:4109-4112) :
 *  BlendPalettes(PALETTES_ALL, 16, RGB_BLACK). */
function _fadeScreenBlack(): void {
  BlendPalettes(0xFFFFFFFF, 16, 0x0000);
}

/** 1:1 décomp `RGB(11, 11, 11)` (= gris du flash d'intro transition). */
const RGB_INTRO_GRAY = 11 | (11 << 5) | (11 << 10);  // = 0x2D6B

// ─── Constantes WhiteBarsFade réutilisées par la charpente (Task_WhiteBarsFade) ─
const NUM_WHITE_BARS = 8;
const FADE_TARGET = 16 << 8;

// ─── Data AngledWipes (battle_transition.c:758-772) ──────────────────────────
/** 1:1 `NUM_ANGLED_WIPES` (battle_transition.c:758). */
const NUM_ANGLED_WIPES = 7;
/** 1:1 `sAngledWipes_MoveData[7][5]` (:760-770) — startX/startY/endX/endY/yDir. */
const sAngledWipes_MoveData: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [56, 0, 0, DISPLAY_HEIGHT, 0],
  [104, DISPLAY_HEIGHT, DISPLAY_WIDTH, 88, 1],
  [DISPLAY_WIDTH, 72, 56, 0, 1],
  [0, 32, 144, DISPLAY_HEIGHT, 0],
  [144, DISPLAY_HEIGHT, 184, 0, 1],
  [56, 0, 168, DISPLAY_HEIGHT, 0],
  [168, DISPLAY_HEIGHT, 48, 0, 1],
];
/** 1:1 `sAngledWipes_EndDelays[7]` (:772). */
const sAngledWipes_EndDelays: readonly number[] = [8, 4, 2, 1, 1, 1, 0];

/** 1:1 struct BlackWipe data (tWipeStartX..tWipeTemp, 11 champs s16). */
interface BlackWipeData {
  startX: number; startY: number; currX: number; currY: number;
  endX: number; endY: number; xMove: number; yMove: number;
  xDist: number; yDist: number; temp: number;
}

/** 1:1 `InitBlackWipe(data, startX, startY, endX, endY, xMove, yMove)` (:4146-4171). */
function InitBlackWipe(d: BlackWipeData, startX: number, startY: number, endX: number, endY: number, xMove: number, yMove: number): void {
  d.startX = startX; d.startY = startY;
  d.currX = startX; d.currY = startY;
  d.endX = endX; d.endY = endY;
  d.xMove = xMove; d.yMove = yMove;
  d.xDist = endX - startX;
  if (d.xDist < 0) { d.xDist = -d.xDist; d.xMove = -xMove; }
  d.yDist = endY - startY;
  if (d.yDist < 0) { d.yDist = -d.yDist; d.yMove = -yMove; }
  d.temp = 0;
}

/** 1:1 `UpdateBlackWipe(data, xExact, yExact)` (:4173-4239) — Bresenham, TRUE quand
 *  les deux coords ont atteint leur fin. */
function UpdateBlackWipe(d: BlackWipeData, xExact: boolean, yExact: boolean): boolean {
  if (d.xDist > d.yDist) {
    d.currX += d.xMove;
    d.temp += d.yDist;
    if (d.temp > d.xDist) { d.currY += d.yMove; d.temp -= d.xDist; }
  } else {
    d.currY += d.yMove;
    d.temp += d.xDist;
    if (d.temp > d.yDist) { d.currX += d.xMove; d.temp -= d.yDist; }
  }
  let numFinished = 0;
  if ((d.xMove > 0 && d.currX >= d.endX) || (d.xMove < 0 && d.currX <= d.endX)) {
    numFinished++;
    if (xExact) d.currX = d.endX;
  }
  if ((d.yMove > 0 && d.currY >= d.endY) || (d.yMove < 0 && d.currY <= d.endY)) {
    numFinished++;
    if (yExact) d.currY = d.endY;
  }
  return numFinished === 2;
}

// ─── SetSinWave (battle_transition.c:4560) — réutilisé par Swirl/Wave/Ripple/… ─
/** 1:1 `SetSinWave(array, sinAdd, index, indexIncrementer, amplitude, arrSize)`
 *  (battle_transition.c:4560). */
function _setSinWave(array: { [i: number]: number }, sinAdd: number, index: number, indexIncrementer: number, amplitude: number, arrSize: number): void {
  for (let i = 0; arrSize > 0; arrSize--, i++, index += indexIncrementer) {
    array[i] = sinAdd + _swSin(index & 0xFF, amplitude);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ██ CHARPENTE 1:1 — foyer réel de battle_transition.c (2026-07-17, PHASE 1) ██
//
// Transcription ligne-à-ligne du COEUR du fichier décomp : la vraie machine à
// tâches (Task_BattleTransition), l'intro flash, les helpers communs, les tables
// sTasks_*/sTaskHandlers, et les Task_* des transitions du jeu solo courant.
//
// ✅ VOIE VIVANTE : ce foyer EST le chemin branché. La surface __battleTransitionCore
// (fin de section) est consommée par battle-decomp-loop.ts (_makeBattleStartTransitionCB2
// → CB2_BattleStartTransition_1to1) qui réplique la boucle overworld pendant la
// transition et boote le combat sur IsBattleTransitionDone. Plus de voie parallèle.
//
// Adaptations moteur (précédents cités depuis le bloc bespoke de CE fichier) :
//   • DMA HBlank-repeat (DmaSet →REG_WIN0H/REG_BG0HOFS) → rt.gba.setHBlankCallback
//     lisant gScanlineEffectRegBuffers[1] (précédent Slice bespoke:348, Swirl:879).
//   • DmaCopy16 buffers[0]→[1] → copie JS littérale (précédent bespoke:418).
//   • REG_VCOUNT (lu par les HBlankCB décomp) → paramètre `y` du callback runtime.
//   • struct TransitionData `s16 data[11]` (wipe) → sTransitionData.wipe (BlackWipeData)
//     réutilisant InitBlackWipe/UpdateBlackWipe déjà 1:1 (ci-dessus :618/:632).
// ════════════════════════════════════════════════════════════════════════════

// ─── Constantes locales (constants/rgb.h + gba/io_reg.h) ─────────────────────
const RGB_BLACK = 0x0000;
const RGB_WHITE = 0x7FFF;
const INTR_FLAG_VBLANK = 1 << 0;
const INTR_FLAG_HBLANK = 1 << 1;
const WININ_WIN0_ALL = 0x3F;

// ─── struct TransitionData (battle_transition.c:55-76) ───────────────────────
// `data[11]` (le champ wipe) est porté comme `wipe: BlackWipeData` (cf. adaptation).
interface CoreTransitionData {
  VBlank_DMA: number;
  WININ: number; WINOUT: number; WIN0H: number; WIN0V: number;
  BLDCNT: number; BLDALPHA: number; BLDY: number;
  cameraX: number; cameraY: number;
  BG0HOFS_Lower: number; BG0HOFS_Upper: number; BG0VOFS: number;
  counter: number;
  wipe: BlackWipeData;
}
/** 1:1 `EWRAM_DATA static struct TransitionData *sTransitionData` (:296). */
let sTransitionData: CoreTransitionData | null = null;
function _allocTransitionData(): CoreTransitionData {
  return {
    VBlank_DMA: 0, WININ: 0, WINOUT: 0, WIN0H: 0, WIN0V: 0,
    BLDCNT: 0, BLDALPHA: 0, BLDY: 0, cameraX: 0, cameraY: 0,
    BG0HOFS_Lower: 0, BG0HOFS_Upper: 0, BG0VOFS: 0, counter: 0,
    wipe: { startX: 0, startY: 0, currX: 0, currY: 0, endX: 0, endY: 0, xMove: 0, yMove: 0, xDist: 0, yDist: 0, temp: 0 },
  };
}
function _zeroTransitionData(d: CoreTransitionData): void {
  d.VBlank_DMA = 0; d.WININ = 0; d.WINOUT = 0; d.WIN0H = 0; d.WIN0V = 0;
  d.BLDCNT = 0; d.BLDALPHA = 0; d.BLDY = 0; d.cameraX = 0; d.cameraY = 0;
  d.BG0HOFS_Lower = 0; d.BG0HOFS_Upper = 0; d.BG0VOFS = 0; d.counter = 0;
  const w = d.wipe;
  w.startX = 0; w.startY = 0; w.currX = 0; w.currY = 0; w.endX = 0; w.endY = 0;
  w.xMove = 0; w.yMove = 0; w.xDist = 0; w.yDist = 0; w.temp = 0;
}

// ─── Accès runtime (surface gba/vram/win/blend), typé souplement (cf. bespoke) ─
interface CoreRt {
  gba: {
    bg: (n: number) => { vram: Uint8Array; tilemap: Uint16Array; config: { hofs: number; vofs: number; mosaic?: boolean } };
    windows: { win0: { x1: number; x2: number; enabled?: boolean } };
    blend: { brightness: number };
    setHBlankCallback: (cb: ((y: number) => void) | null) => void;
  };
  gPlttBufferFaded?: Uint16Array;
  gPlttBufferUnfaded?: Uint16Array;
}
function _coreRt(): CoreRt | null { return (getRuntime() as unknown as CoreRt) ?? null; }
function _setHBlank(cb: ((y: number) => void) | null): void { _coreRt()?.gba.setHBlankCallback(cb); }

// ─── Helper task (wrapper (t)=>fn(t.taskId) + tag funcRef) ────────────────────
// 1:1 avec le pattern field_screen_effect.ts:118 : le runtime passe l'objet task,
// nos fonctions décomp prennent le taskId ; funcRef permet à FindTaskIdByFunc de
// retrouver la fonction d'origine.
type CoreTaskFn = (taskId: number) => void;
function _coreCreateTask(fn: CoreTaskFn, priority: number): number {
  const id = CreateTask((t: { taskId: number }) => fn(t.taskId), priority);
  (gTasks[id] as unknown as { funcRef?: unknown }).funcRef = fn;
  return id;
}

//-----------------------------------
// General transition functions (:4046-4144)
//-----------------------------------

/** 1:1 `InitTransitionData` (:4050) : memset 0 + GetCameraOffsetWithPan. */
function InitTransitionData(): void {
  if (!sTransitionData) sTransitionData = _allocTransitionData();
  else _zeroTransitionData(sTransitionData);
  const cam = GetCameraOffsetWithPan();
  sTransitionData.cameraX = cam.x;
  sTransitionData.cameraY = cam.y;
}

/** 1:1 `VBlankCB_BattleTransition` (:4056) : LoadOam/ProcessSpriteCopyRequests/
 *  TransferPlttBuffer. Notre moteur effectue OAM+palette au frame boundary ; on
 *  route vers les équivalents runtime s'ils existent (no-op sinon — à valider au
 *  bascule). */
function VBlankCB_BattleTransition(): void {
  const rt = getRuntime() as unknown as {
    LoadOam?: () => void; ProcessSpriteCopyRequests?: () => void; TransferPlttBuffer?: () => void;
  };
  rt?.LoadOam?.();
  rt?.ProcessSpriteCopyRequests?.();
  rt?.TransferPlttBuffer?.();
}

/** 1:1 `FadeScreenBlack` (:4082). (Déjà porté ici sous `_fadeScreenBlack` :195 —
 *  BlendPalettes(PALETTES_ALL,16,RGB_BLACK).) */
function FadeScreenBlack(): void { _fadeScreenBlack(); }

/** 1:1 `SetCircularMask(buffer, centerX, centerY, radius)` (:4094). */
function SetCircularMask(buffer: { [i: number]: number }, centerX: number, centerY: number, radius: number): void {
  for (let i = 0; i < DISPLAY_HEIGHT; i++) buffer[i] = 0x0A0A;   // memset(buffer, 10, DISPLAY_HEIGHT * sizeof(u16))
  for (let i = 0; i < 64; i++) {
    let sinResult = _swSin(i, radius);
    let cosResult = Cos(i, radius);
    let drawXLeft = centerX - sinResult;
    let drawX = centerX + sinResult;
    let drawYTop = centerY - cosResult;
    let drawYBott = centerY + cosResult;
    if (drawXLeft < 0) drawXLeft = 0;
    if (drawX > DISPLAY_WIDTH) drawX = DISPLAY_WIDTH;
    if (drawYTop < 0) drawYTop = 0;
    if (drawYBott > DISPLAY_HEIGHT - 1) drawYBott = DISPLAY_HEIGHT - 1;
    drawX |= (drawXLeft << 8);
    buffer[drawYTop] = drawX;
    buffer[drawYBott] = drawX;
    cosResult = Cos(i + 1, radius);
    let drawYTopNext = centerY - cosResult;
    let drawYBottNext = centerY + cosResult;
    if (drawYTopNext < 0) drawYTopNext = 0;
    if (drawYBottNext > DISPLAY_HEIGHT - 1) drawYBottNext = DISPLAY_HEIGHT - 1;
    while (drawYTop > drawYTopNext) buffer[--drawYTop] = drawX;
    while (drawYTop < drawYTopNext) buffer[++drawYTop] = drawX;
    while (drawYBott > drawYBottNext) buffer[--drawYBott] = drawX;
    while (drawYBott < drawYBottNext) buffer[++drawYBott] = drawX;
    void sinResult;
  }
}

/** Copie palette 1:1 `CpuCopy32(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE)`
 *  (Transition_StartIntro :1071). PLTT_SIZE=0x400 octets = 0x200 u16. */
function _cpuCopyPlttFadedToUnfaded(): void {
  const rt = _coreRt();
  const f = rt?.gPlttBufferFaded, u = rt?.gPlttBufferUnfaded;
  if (f && u) { for (let i = 0; i < 0x200; i++) u[i] = f[i]; }
  else console.error('[battle_transition] gPlttBuffer{Faded,Unfaded} runtime absents — copie intro skip (à valider au bascule)');
}

//---------------------------
// Main transition functions (:993-1127)
//---------------------------

/** 1:1 `BattleTransition_StartOnField(transitionId)` (:1026). */
export function BattleTransition_StartOnField(transitionId: number): void {
  // gMain.callback2 = CB2_OverworldBasic (:1028). ADAPTATION ASSUMÉE (bascule b13c6512b) :
  // l'appelant réel (CB2_BattleStartTransition_1to1, battle-decomp-loop.ts) EST déjà
  // l'équivalent fonctionnel de CB2_OverworldBasic pendant la transition (mêmes 4 appels
  // 1:1 : RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade, overworld.c) et
  // reste callback2 — on ne le remplace que si le VRAI CB2_OverworldBasic est porté un jour
  // (port overworld.c). Warn informatif une fois, pas une erreur : le flux est correct.
  const cb = (globalThis as { CB2_OverworldBasic?: (...a: unknown[]) => void }).CB2_OverworldBasic;
  if (cb) (gMain as unknown as { callback2?: unknown }).callback2 = cb;
  else if (!(globalThis as Record<string, unknown>).__btOwBasicWarned) {
    (globalThis as Record<string, unknown>).__btOwBasicWarned = true;
    console.warn('[battle_transition] CB2_OverworldBasic non porté — le CB2 de bascule (équivalent 1:1) reste en place');
  }
  LaunchBattleTransitionTask(transitionId);
}

/** 1:1 `BattleTransition_Start(transitionId)` (:1032). */
export function BattleTransition_Start(transitionId: number): void {
  LaunchBattleTransitionTask(transitionId);
}

// #define tTransitionId   data[1]
// #define tTransitionDone data[15]

/** 1:1 `IsBattleTransitionDone()` (:1041). */
export function IsBattleTransitionDone(): boolean {
  const taskId = FindTaskIdByFunc(Task_BattleTransition);
  if (taskId === TASK_NONE) return false;   // garde (le .c indexe gTasks[TASK_NONE] : on l'évite)
  if (gTasks[taskId].data[15]) {
    DestroyTask(taskId);
    sTransitionData = null;   // FREE_AND_SET_NULL(sTransitionData)
    return true;
  }
  return false;
}

/** 1:1 `LaunchBattleTransitionTask(transitionId)` (:1056). */
function LaunchBattleTransitionTask(transitionId: number): void {
  const taskId = _coreCreateTask(Task_BattleTransition, 2);
  gTasks[taskId].data[1] = transitionId;   // tTransitionId
  sTransitionData = _allocTransitionData(); // AllocZeroed(sizeof(*sTransitionData))
}

/** 1:1 `Task_BattleTransition` (:1063). */
function Task_BattleTransition(taskId: number): void {
  while (sTaskHandlers[gTasks[taskId].data[0]](taskId));
}

/** 1:1 `Transition_StartIntro` (:1068). */
function Transition_StartIntro(taskId: number): boolean {
  SetWeatherScreenFadeOut();
  _cpuCopyPlttFadedToUnfaded();
  const d = gTasks[taskId].data;
  if (sTasks_Intro[d[1]] != null) {
    _coreCreateTask(sTasks_Intro[d[1]]!, 4);
    d[0]++;
    return false;
  } else {
    d[0] = 2;
    return true;
  }
}

/** 1:1 `Transition_WaitForIntro` (:1085). */
function Transition_WaitForIntro(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (FindTaskIdByFunc(sTasks_Intro[d[1]]!) === TASK_NONE) {
    d[0]++;
    return true;
  }
  return false;
}

/** 1:1 `Transition_StartMain` (:1098). */
function Transition_StartMain(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const mainFn = sTasks_Main[d[1]];
  if (mainFn == null) {
    // Phase 1 : transition non encore portée en Task_* réel → done immédiat + warn.
    console.error(`[battle_transition] sTasks_Main[${d[1]}] non porté (phase 2) → transition done immédiat`);
    d[15] = 1;
    d[0]++;
    return false;
  }
  _coreCreateTask(mainFn, 0);
  d[0]++;
  return false;
}

/** 1:1 `Transition_WaitForMain` (:1105). */
function Transition_WaitForMain(taskId: number): boolean {
  const d = gTasks[taskId].data;
  d[15] = 0;   // tTransitionDone = FALSE
  const mainFn = sTasks_Main[d[1]];
  if (mainFn == null || FindTaskIdByFunc(mainFn) === TASK_NONE) d[15] = 1;
  return false;
}

/** 1:1 `Task_Intro` (:1116). */
function Task_Intro(taskId: number): void {
  const d = gTasks[taskId].data;
  if (d[0] === 0) {
    d[0]++;
    CreateIntroTask(0, 0, 3, 2, 2);
  } else if (IsIntroTaskDone()) {
    DestroyTask(taskId);
  }
}

//-----------------------------------
// Transition intro (:3956-4044)
//-----------------------------------
// #define tFadeToGrayDelay data[1] · tFadeFromGrayDelay data[2] · tNumFades data[3]
// tFadeToGrayIncrement data[4] · tFadeFromGrayIncrement data[5] · tDelayTimer data[6]
// tBlend data[7]

/** 1:1 `CreateIntroTask(...)` (:3968). */
function CreateIntroTask(fadeToGrayDelay: number, fadeFromGrayDelay: number, numFades: number, fadeToGrayIncrement: number, fadeFromGrayIncrement: number): void {
  const taskId = _coreCreateTask(Task_BattleTransition_Intro, 3);
  const d = gTasks[taskId].data;
  d[1] = fadeToGrayDelay;
  d[2] = fadeFromGrayDelay;
  d[3] = numFades;
  d[4] = fadeToGrayIncrement;
  d[5] = fadeFromGrayIncrement;
  d[6] = fadeToGrayDelay;   // tDelayTimer = fadeToGrayDelay
}

/** 1:1 `IsIntroTaskDone()` (:3979). */
function IsIntroTaskDone(): boolean {
  return FindTaskIdByFunc(Task_BattleTransition_Intro) === TASK_NONE;
}

/** 1:1 `Task_BattleTransition_Intro` (:3987). */
function Task_BattleTransition_Intro(taskId: number): void {
  while (sTransitionIntroFuncs[gTasks[taskId].data[0]](taskId));
}

/** 1:1 `TransitionIntro_FadeToGray` (:3992). RGB(11,11,11) = RGB_INTRO_GRAY (:305). */
function TransitionIntro_FadeToGray(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (d[6] === 0 || --d[6] === 0) {
    d[6] = d[1];
    d[7] += d[4];
    if (d[7] > 16) d[7] = 16;
    BlendPalettes(PALETTES_ALL, d[7], RGB_INTRO_GRAY);
  }
  if (d[7] >= 16) {
    d[0]++;
    d[6] = d[2];
  }
  return false;
}

/** 1:1 `TransitionIntro_FadeFromGray` (:4011). */
function TransitionIntro_FadeFromGray(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (d[6] === 0 || --d[6] === 0) {
    d[6] = d[2];
    d[7] -= d[5];
    if (d[7] < 0) d[7] = 0;
    BlendPalettes(PALETTES_ALL, d[7], RGB_INTRO_GRAY);
  }
  if (d[7] === 0) {
    if (--d[3] === 0) {
      DestroyTask(FindTaskIdByFunc(Task_BattleTransition_Intro));
    } else {
      d[6] = d[1];
      d[0] = 0;
    }
  }
  return false;
}

//--------------------
// B_TRANSITION_BLUR (:1129-1180)
//--------------------
// #define tDelay data[1] · tCounter data[2]

function Task_Blur(taskId: number): void { while (sBlur_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `Blur_Init` (:1141). BGCNT_MOSAIC → bg().config.mosaic (précédent bespoke:787). */
function Blur_Init(taskId: number): boolean {
  SetGpuReg(REG_OFFSET_MOSAIC, 0);
  const rt = _coreRt();
  if (rt) for (const n of [1, 2, 3] as const) rt.gba.bg(n).config.mosaic = true;
  gTasks[taskId].data[0]++;
  return true;
}

/** 1:1 `Blur_Main` (:1151). */
function Blur_Main(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (d[1] !== 0) {
    d[1]--;
  } else {
    d[1] = 4;
    if (++d[2] === 10) BeginNormalPaletteFade(0xFFFFFFFF, -1, 0, 16, RGB_BLACK);
    SetGpuReg(REG_OFFSET_MOSAIC, (d[2] & 15) * 17);
    if (d[2] > 14) d[0]++;
  }
  return false;
}

/** 1:1 `Blur_End` (:1169). (mosaïque OFF = sûreté hors-.c, précédent bespoke:823 —
 *  au cas où l'init combat ne réinitialise pas le bit BGCNT_MOSAIC.) */
function Blur_End(taskId: number): boolean {
  if (!gPaletteFade.active) {
    const rt = _coreRt();
    if (rt) for (const n of [1, 2, 3] as const) rt.gba.bg(n).config.mosaic = false;
    DestroyTask(FindTaskIdByFunc(Task_Blur));
  }
  return false;
}

//--------------------
// B_TRANSITION_SWIRL (:1182-1244)
//--------------------
// #define tSinIndex data[1] · tAmplitude data[2]

function Task_Swirl(taskId: number): void { while (sSwirl_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `Swirl_Init` (:1194). */
function Swirl_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  BeginNormalPaletteFade(PALETTES_ALL, 4, 0, 16, RGB_BLACK);
  _setSinWave(gScanlineEffectRegBuffers[1], sTransitionData!.cameraX, 0, 2, 0, DISPLAY_HEIGHT);
  SetVBlankCallback(VBlankCB_Swirl);
  _setHBlank(HBlankCB_Swirl);
  EnableInterrupts(INTR_FLAG_VBLANK | INTR_FLAG_HBLANK);
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `Swirl_End` (:1210). */
function Swirl_End(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  d[1] += 4;
  d[2] += 8;
  _setSinWave(gScanlineEffectRegBuffers[0], sTransitionData!.cameraX, d[1], 2, d[2], DISPLAY_HEIGHT);
  if (!gPaletteFade.active) DestroyTask(FindTaskIdByFunc(Task_Swirl));
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `VBlankCB_Swirl` (:1228). */
function VBlankCB_Swirl(): void {
  VBlankCB_BattleTransition();
  // DmaCopy16(..., DISPLAY_HEIGHT*2 OCTETS) = 160 u16 = DISPLAY_HEIGHT entrées.
  if (sTransitionData && sTransitionData.VBlank_DMA) {
    for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  }
}

/** 1:1 `HBlankCB_Swirl` (:1235). REG_VCOUNT → y. */
function HBlankCB_Swirl(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const v = gScanlineEffectRegBuffers[1][y];
  const rt = _coreRt(); if (!rt) return;
  rt.gba.bg(1).config.hofs = v; rt.gba.bg(2).config.hofs = v; rt.gba.bg(3).config.hofs = v;
}

//----------------------
// B_TRANSITION_SHUFFLE (:1246-1315)
//----------------------
// #define tSinVal data[1] · tAmplitude data[2]

function Task_Shuffle(taskId: number): void { while (sShuffle_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `Shuffle_Init` (:1258). memset(buffers[1], cameraY, H*2) : cameraY est un
 *  octet répété → chaque u16 = cameraY | (cameraY<<8). */
function Shuffle_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  BeginNormalPaletteFade(PALETTES_ALL, 4, 0, 16, RGB_BLACK);
  // memset(buffers[1], cameraY, DISPLAY_HEIGHT*2 OCTETS) = 160 u16, chacun = cameraY*0x0101.
  const camByte = sTransitionData!.cameraY & 0xFF;
  const fill = camByte | (camByte << 8);
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = fill;
  SetVBlankCallback(VBlankCB_Shuffle);
  _setHBlank(HBlankCB_Shuffle);
  EnableInterrupts(INTR_FLAG_VBLANK | INTR_FLAG_HBLANK);
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `Shuffle_End` (:1275). */
function Shuffle_End(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  let sinVal = d[1] & 0xFFFF;
  const amplitude = (d[2] >> 8) & 0xFFFF;
  d[1] = (d[1] + 4224) & 0xFFFF;   // u16 tSinVal
  d[2] += 384;
  for (let i = 0; i < DISPLAY_HEIGHT; i++, sinVal = (sinVal + 4224) & 0xFFFF) {
    const sinIndex = (sinVal / 256) | 0;
    gScanlineEffectRegBuffers[0][i] = sTransitionData!.cameraY + _swSin(sinIndex & 0xFF, amplitude);
  }
  if (!gPaletteFade.active) DestroyTask(FindTaskIdByFunc(Task_Shuffle));
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `VBlankCB_Shuffle` (:1299). */
function VBlankCB_Shuffle(): void {
  VBlankCB_BattleTransition();
  // DmaCopy16(..., DISPLAY_HEIGHT*2 OCTETS) = 160 u16 = DISPLAY_HEIGHT entrées.
  if (sTransitionData && sTransitionData.VBlank_DMA) {
    for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  }
}

/** 1:1 `HBlankCB_Shuffle` (:1306). REG_VCOUNT → y. */
function HBlankCB_Shuffle(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const v = gScanlineEffectRegBuffers[1][y];
  const rt = _coreRt(); if (!rt) return;
  rt.gba.bg(1).config.vofs = v; rt.gba.bg(2).config.vofs = v; rt.gba.bg(3).config.vofs = v;
}

//------------------------------
// B_TRANSITION_POKEBALLS_TRAIL (:1758-1873)
//------------------------------
// Réutilise l'adaptation fldeff validée de CE fichier (_fldEffPokeballTrail :210,
// SpriteCB_FldEffPokeballTrail :249, _activeTrailBalls :90, _ensureTrailAssets :69)
// car le registre fldeff générique (FLDEFF_POKEBALL_TRAIL) n'est pas porté pour
// cet effet. La machine à états Init/Main/End est 1:1.

function Task_PokeballsTrail(taskId: number): void { while (sPokeballsTrail_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `PokeballsTrail_Init` (:1771). */
function PokeballsTrail_Init(taskId: number): boolean {
  if (!_assetsReady) {
    // Adaptation : le CpuSet décomp est SYNC (gfx embarqués) ; nos assets fetchent →
    // on reste dans l'état Init tant qu'ils ne sont pas prêts (le tick suivant ré-entre).
    // (La session de bascule ajoutera un garde-fou anti-soft-lock si le fetch échoue,
    //  cf. _pokeballsTrailInit bespoke:106.)
    _ensureTrailAssets().catch((e) => console.error('[battle_transition] assets PokeballsTrail KO', e));
    return false;
  }
  const rt = _coreRt();
  if (rt) {
    const bg0 = rt.gba.bg(0);
    if (_trailTile) bg0.vram.set(_trailTile.subarray(0, 64), 0);   // CpuSet tileset 0x20 u16 = 2 tiles
    bg0.tilemap.fill(0);                                            // CpuFill32 BG_SCREEN_SIZE
    const rtPal = (getRuntime() as unknown as { gPlttBufferFaded?: Uint16Array }).gPlttBufferFaded;
    if (rtPal && _ballPal) rtPal.set(_ballPal.subarray(0, 16), 15 * 16);   // LoadPalette BG 15
  }
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `PokeballsTrail_Main` (:1784). */
function PokeballsTrail_Main(taskId: number): boolean {
  _activeTrailBalls = 0;
  let side = Random() & 1;
  for (let i = 0; i < NUM_POKEBALL_TRAILS; i++, side ^= 1) {
    _fldEffPokeballTrail(
      sPokeballsTrail_StartXCoords[side],   // x
      i * 32 + 16,                          // y
      side,
      sPokeballsTrail_Delays[i],
    );
  }
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `PokeballsTrail_End` (:1809). Ticke aussi les SpriteCB (cf. bespoke :167 —
 *  AnimateSprites ne tourne pas dans notre CB2 de transition). */
function PokeballsTrail_End(taskId: number): boolean {
  _tickTrailSprites();
  if (_activeTrailBalls === 0) {
    FadeScreenBlack();
    DestroyTask(FindTaskIdByFunc(Task_PokeballsTrail));
  }
  return false;
}

//--------------------
// B_TRANSITION_WAVE (:2155-2240)
//--------------------
// #define tX data[1] · tSinIndex data[2]

function Task_Wave(taskId: number): void { while (sWave_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `Wave_Init` (:2168). */
function Wave_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  sTransitionData!.WININ = WININ_WIN0_ALL;
  sTransitionData!.WINOUT = 0;
  sTransitionData!.WIN0H = DISPLAY_WIDTH;
  sTransitionData!.WIN0V = DISPLAY_HEIGHT;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = DISPLAY_WIDTH + 2;
  SetVBlankCallback(VBlankCB_Wave);
  _coreEnableWin0();
  gTasks[taskId].data[0]++;
  return true;
}

/** 1:1 `Wave_Main` (:2189). */
function Wave_Main(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  let sinIndex = d[2] & 0xFF;   // u8
  d[2] += 16;
  d[1] += 8;
  let finished = true;
  for (let i = 0; i < DISPLAY_HEIGHT; i++, sinIndex = (sinIndex + 4) & 0xFF) {
    let x = d[1] + _swSin(sinIndex, 40);
    if (x < 0) x = 0;
    if (x > DISPLAY_WIDTH) x = DISPLAY_WIDTH;
    gScanlineEffectRegBuffers[0][i] = (x << 8) | (DISPLAY_WIDTH + 1);
    if (x < DISPLAY_WIDTH) finished = false;
  }
  if (finished) d[0]++;
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `Wave_End` (:2219). */
function Wave_End(taskId: number): boolean {
  void taskId;
  _setHBlank(null);   // DmaStop(0)
  FadeScreenBlack();
  DestroyTask(FindTaskIdByFunc(Task_Wave));
  return false;
}

/** 1:1 `VBlankCB_Wave` (:2227). DmaSet WIN0H ← buffers[1] par-scanline → HBlank. */
function VBlankCB_Wave(): void {
  VBlankCB_BattleTransition();
  if (sTransitionData && sTransitionData.VBlank_DMA) {
    for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  }
  if (sTransitionData) {
    SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
    SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
    SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
  }
  _setHBlank(HBlankCB_Wave);   // = DmaSet(0, buffers[1], &REG_WIN0H, B_TRANS_DMA_FLAGS)
}

/** WIN0H par-scanline (adaptation du DmaSet HBlank-repeat de VBlankCB_Wave). */
function HBlankCB_Wave(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const win0h = gScanlineEffectRegBuffers[1][y];
  const rt = _coreRt(); if (!rt) return;
  rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
  rt.gba.windows.win0.x2 = win0h & 0xFF;
}

//--------------------
// B_TRANSITION_SLICE (:2716-2830)
//--------------------
// #define tEffectX data[1] · tSpeed data[2] · tAccel data[3]

function Task_Slice(taskId: number): void { while (sSlice_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `Slice_Init` (:2728). */
function Slice_Init(taskId: number): boolean {
  const d = gTasks[taskId].data;
  InitTransitionData();
  ScanlineEffect_Clear();
  d[2] = 1 << 8;   // tSpeed
  d[3] = 1;        // tAccel
  sTransitionData!.WININ = WININ_WIN0_ALL;
  sTransitionData!.WINOUT = 0;
  sTransitionData!.WIN0V = DISPLAY_HEIGHT;
  sTransitionData!.VBlank_DMA = 0;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[1][i] = sTransitionData!.cameraX;
    gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + i] = DISPLAY_WIDTH;
  }
  EnableInterrupts(INTR_FLAG_HBLANK);
  // SetGpuRegBits(REG_OFFSET_DISPSTAT, DISPSTAT_HBLANK_INTR) → assuré par setHBlankCallback.
  SetVBlankCallback(VBlankCB_Slice);
  _setHBlank(HBlankCB_Slice);
  _coreEnableWin0();
  d[0]++;
  return true;
}

/** 1:1 `Slice_Main` (:2758). */
function Slice_Main(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  d[1] += (d[2] >> 8);
  if (d[1] > DISPLAY_WIDTH) d[1] = DISPLAY_WIDTH;
  if (d[2] <= 0xFFF) d[2] += d[3];
  if (d[3] < 128) d[3] <<= 1;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    if (i % 2) {
      gScanlineEffectRegBuffers[0][i] = sTransitionData!.cameraX + d[1];
      gScanlineEffectRegBuffers[0][i + DISPLAY_HEIGHT] = DISPLAY_WIDTH - d[1];
    } else {
      gScanlineEffectRegBuffers[0][i] = sTransitionData!.cameraX - d[1];
      gScanlineEffectRegBuffers[0][i + DISPLAY_HEIGHT] = (d[1] << 8) | (DISPLAY_WIDTH + 1);
    }
  }
  if (d[1] >= DISPLAY_WIDTH) d[0]++;
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `Slice_End` (:2797). */
function Slice_End(taskId: number): boolean {
  void taskId;
  _setHBlank(null);   // DmaStop(0)
  FadeScreenBlack();
  DestroyTask(FindTaskIdByFunc(Task_Slice));
  return false;
}

/** 1:1 `VBlankCB_Slice` (:2805) + `HBlankCB_Slice` (:2817) fusionnés côté HBlank. */
function VBlankCB_Slice(): void {
  VBlankCB_BattleTransition();
  if (sTransitionData) {
    SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
    SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
    SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
    if (sTransitionData.VBlank_DMA) {
      for (let i = 0; i < DISPLAY_HEIGHT * 2; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
  }
  _setHBlank(HBlankCB_Slice);   // = DmaSet(0, &buffers[1][H], &REG_WIN0H, ...)
}

/** HOFS BG1-3 (HBlankCB_Slice) + WIN0H (DmaSet) par-scanline. */
function HBlankCB_Slice(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const rt = _coreRt(); if (!rt) return;
  const hofs = gScanlineEffectRegBuffers[1][y];
  rt.gba.bg(1).config.hofs = hofs; rt.gba.bg(2).config.hofs = hofs; rt.gba.bg(3).config.hofs = hofs;
  const win0h = gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + y];
  rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
  rt.gba.windows.win0.x2 = win0h & 0xFF;
}

//-----------------------------
// B_TRANSITION_ANGLED_WIPES (:3818-3954)
//-----------------------------
// #define tWipeId data[1] · tDir data[2] · tDelay data[3]

function Task_AngledWipes(taskId: number): void { while (sAngledWipes_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `AngledWipes_Init` (:3834). */
function AngledWipes_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  sTransitionData!.WININ = WININ_WIN0_ALL;
  sTransitionData!.WINOUT = 0;
  sTransitionData!.WIN0V = DISPLAY_HEIGHT;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[0][i] = DISPLAY_WIDTH;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];   // CpuSet H
  SetVBlankCallback(VBlankCB_AngledWipes);
  _coreEnableWin0();
  gTasks[taskId].data[0]++;
  return true;
}

/** 1:1 `AngledWipes_SetWipeData` (:3855). Le wipe vit dans sTransitionData.wipe. */
function AngledWipes_SetWipeData(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const md = sAngledWipes_MoveData[d[1]];
  InitBlackWipe(sTransitionData!.wipe, md[0], md[1], md[2], md[3], 1, 1);
  d[2] = md[4];   // tDir
  d[0]++;
  return true;
}

/** 1:1 `AngledWipes_DoWipe` (:3868). */
function AngledWipes_DoWipe(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const w = sTransitionData!.wipe;
  sTransitionData!.VBlank_DMA = 0;
  let finished = false;
  for (let i = 0; i < 16; i++) {
    let r3 = gScanlineEffectRegBuffers[0][w.currY] >> 8;
    let r4 = gScanlineEffectRegBuffers[0][w.currY] & 0xFF;
    if (d[2] === 0) {
      if (r3 < w.currX) r3 = w.currX;
      if (r3 > r4) r3 = r4;
    } else {
      if (r4 > w.currX) r4 = w.currX;
      if (r4 <= r3) r4 = r3;
    }
    gScanlineEffectRegBuffers[0][w.currY] = (r4 | (r3 << 8)) & 0xFFFF;
    if (finished) { d[0]++; break; }
    finished = UpdateBlackWipe(w, true, true);
  }
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `AngledWipes_TryEnd` (:3908). */
function AngledWipes_TryEnd(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (++d[1] < NUM_ANGLED_WIPES) {
    d[0]++;
    d[3] = sAngledWipes_EndDelays[d[1] - 1];
    return true;
  } else {
    _setHBlank(null);   // DmaStop(0)
    FadeScreenBlack();
    DestroyTask(FindTaskIdByFunc(Task_AngledWipes));
    return false;
  }
}

/** 1:1 `AngledWipes_StartNext` (:3927). */
function AngledWipes_StartNext(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (--d[3] === 0) {
    d[0] = 1;
    return true;
  }
  return false;
}

/** 1:1 `VBlankCB_AngledWipes` (:3939). WIN0H ← buffers[1] par-scanline → HBlank. */
function VBlankCB_AngledWipes(): void {
  VBlankCB_BattleTransition();
  if (sTransitionData) {
    if (sTransitionData.VBlank_DMA) {
      for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
    SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
    SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
    SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
  }
  _setHBlank(HBlankCB_AngledWipes);
}

/** WIN0H par-scanline (buffers[1][y] = left<<8|right). */
function HBlankCB_AngledWipes(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const win0h = gScanlineEffectRegBuffers[1][y];
  const rt = _coreRt(); if (!rt) return;
  rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
  rt.gba.windows.win0.x2 = win0h & 0xFF;
}

/** WIN0 ON (DISPCNT) — l'OW ne l'a pas toujours ; précédent bespoke Slice:347. */
function _coreEnableWin0(): void {
  const rt = getRuntime();
  if (rt) rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);
}

// ─── Tables (battle_transition.c:340-399) ────────────────────────────────────
const sTransitionIntroFuncs: ReadonlyArray<(taskId: number) => boolean> = [
  TransitionIntro_FadeToGray,
  TransitionIntro_FadeFromGray,
];
const sTaskHandlers: ReadonlyArray<(taskId: number) => boolean> = [
  Transition_StartIntro,
  Transition_WaitForIntro,
  Transition_StartMain,
  Transition_WaitForMain,
];
const sBlur_Funcs: ReadonlyArray<(taskId: number) => boolean> = [Blur_Init, Blur_Main, Blur_End];
const sSwirl_Funcs: ReadonlyArray<(taskId: number) => boolean> = [Swirl_Init, Swirl_End];
const sShuffle_Funcs: ReadonlyArray<(taskId: number) => boolean> = [Shuffle_Init, Shuffle_End];
const sPokeballsTrail_Funcs: ReadonlyArray<(taskId: number) => boolean> = [PokeballsTrail_Init, PokeballsTrail_Main, PokeballsTrail_End];
const sWave_Funcs: ReadonlyArray<(taskId: number) => boolean> = [Wave_Init, Wave_Main, Wave_End];
const sSlice_Funcs: ReadonlyArray<(taskId: number) => boolean> = [Slice_Init, Slice_Main, Slice_End];
const sAngledWipes_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  AngledWipes_Init, AngledWipes_SetWipeData, AngledWipes_DoWipe, AngledWipes_TryEnd, AngledWipes_StartNext,
];

/** 1:1 `sTasks_Intro[B_TRANSITION_COUNT]` (:340) — toutes = Task_Intro. */
const sTasks_Intro: ReadonlyArray<CoreTaskFn | null> = new Array(ENUM_B_1.B_TRANSITION_COUNT).fill(Task_Intro);

/** 1:1 `sTasks_Main[B_TRANSITION_COUNT]` (:347) — PHASE 1 : entrées portées ci-
 *  dessous ; le reste (null) = phase 2 (BigPokeball/PatternWeave, ClockwiseWipe,
 *  Ripple, WhiteBarsFade[sprites invisibles], GridSquares, ShredSplit, Blackhole,
 *  RectangularSpiral, Elite Four/légendaires/frontier/mugshots). */
const sTasks_Main: Array<CoreTaskFn | null> = new Array(ENUM_B_1.B_TRANSITION_COUNT).fill(null);
sTasks_Main[ENUM_B_1.B_TRANSITION_BLUR] = Task_Blur;
sTasks_Main[ENUM_B_1.B_TRANSITION_SWIRL] = Task_Swirl;
sTasks_Main[ENUM_B_1.B_TRANSITION_SHUFFLE] = Task_Shuffle;
sTasks_Main[ENUM_B_1.B_TRANSITION_POKEBALLS_TRAIL] = Task_PokeballsTrail;
sTasks_Main[ENUM_B_1.B_TRANSITION_WAVE] = Task_Wave;
sTasks_Main[ENUM_B_1.B_TRANSITION_SLICE] = Task_Slice;
sTasks_Main[ENUM_B_1.B_TRANSITION_ANGLED_WIPES] = Task_AngledWipes;

// ─── Surface de bascule (le foyer réel, BRANCHÉ) ─────────────────────────────
// __battleTransitionCore est consommé par battle-decomp-loop.ts
// (_makeBattleStartTransitionCB2 → CB2_BattleStartTransition_1to1) : le CB2 (1) appelle
// BattleTransition_StartOnField(transition), (2) tourne RunTasks()/AnimateSprites()/
// BuildOamBuffer()/UpdatePaletteFade() par frame, (3) boote le combat sur
// IsBattleTransitionDone(). Le runtime doit invoquer le VBlank callback posé par
// SetVBlankCallback (sinon router la copie buffers[0]→[1] dans le tick).
(globalThis as Record<string, unknown>).__battleTransitionCore = {
  BattleTransition_Start, BattleTransition_StartOnField, IsBattleTransitionDone,
  // (LaunchBattleTransitionTask/Task_BattleTransition/sTasks_Main internes.)
};

// ════════════════════════════════════════════════════════════════════════════
// ██ CHARPENTE 1:1 — PHASE 2 : transitions SOLO restantes (2026-07-18) ██
//
// Transcription ligne-à-ligne de battle_transition.c des Task_* solo manquants :
//   • BigPokeball (+ tronc PatternWeave partagé)  — CAVE trainer row1
//   • ClockwiseWipe                                — CAVE wild row0
//   • Ripple                                       — WATER wild/trainer row1
//   • GridSquares                                  — FLASH/CAVE wild row1
//   • WhiteBarsFade (Task_* RÉEL, sprites invisibles) — NORMAL wild row1
//
// Ces Task_* sont câblés dans sTasks_Main (fin de section) et lancés par la voie
// vivante (Transition_StartMain → sTasks_Main[transitionId]) via __battleTransitionCore.
//
// Adaptations moteur (précédents cités depuis CE fichier / io_reg.h décomp) :
//   • REG_BLDCNT/REG_BLDALPHA (blend alpha PatternWeave) → SetGpuReg(REG_OFFSET_BLD*)
//     (le runtime route ces offsets, decomp-runtime.ts:906-907 ; précédent BLDCNT
//     bespoke WhiteBarsFade:494). REG_BLDY idem (précédent bespoke:495).
//   • DmaSet buffers[1]→REG_BG0HOFS / REG_WIN0H (HBlank-repeat) → _setHBlank lisant
//     buffers[1][y] (précédents HBlankCB_Swirl:1435 pour HOFS, HBlankCB_AngledWipes:1812
//     pour WIN0H). REG_VCOUNT → paramètre y.
//   • WIN0 ON (DISPCNT) : le décomp compte sur WIN0 déjà actif à l'entrée transition
//     (FrontierLogoWave_Init:4297 le CLEAR explicitement, preuve qu'il est ON par
//     défaut) ; notre OW ne le garantit pas → _coreEnableWin0 (précédent Slice:1655,
//     bespoke WhiteBarsFade:499). Appliqué aux transitions WIN0 uniquement.
//   • CpuSet/CpuCopy16 gfx SYNC (INCGFX embarqué) → fetch async des .png/.bin :
//     l'état Init ré-entre tant que les assets ne sont pas prêts (précédent
//     PokeballsTrail_Init:1508), garde-fou hurlant si le fetch échoue.
//   • struct data[11] (wipe) → sTransitionData.wipe (BlackWipeData) réutilisant
//     Init/UpdateBlackWipe 1:1 (:634/:648). tWipeCurrX/Y=data[2/3]→currX/Y,
//     tWipeEndX/Y=data[4/5]→endX/Y (io_reg défines battle_transition.c:39-42).
// ════════════════════════════════════════════════════════════════════════════

// ─── Macros io_reg.h (valeurs 1:1, cf. include/gba/io_reg.h) ─────────────────
const WINOUT_WIN01_ALL = 0x3F;                 // BG_ALL|OBJ|CLR (io_reg.h:574)
const BLDCNT_TGT1_BG0 = 1 << 0;                // io_reg.h:589
const BLDCNT_EFFECT_BLEND = 1 << 6;            // io_reg.h:599
const BLDCNT_TGT2_ALL = (0x0F | 0x10 | 0x20) << 8;  // BG_ALL|OBJ|BD bits 8-13 = 0x3F00 (io_reg.h:610)
const BLDCNT_TGT1_ALL = 0x0F | 0x10 | 0x20;    // BG_ALL|OBJ|BD = 0x3F (io_reg.h:596)
const BLDCNT_EFFECT_LIGHTEN = 2 << 6;          // io_reg.h:600
/** 1:1 `#define WIN_RANGE(a, b) (((a) << 8) | (b))` (io_reg.h:584). */
function WIN_RANGE(a: number, b: number): number { return ((a << 8) | b) & 0xFFFF; }
/** 1:1 `#define BLDALPHA_BLEND(target1, target2) (((target2) << 8) | (target1))` (io_reg.h:613). */
function BLDALPHA_BLEND(target1: number, target2: number): number { return ((target2 << 8) | target1) & 0xFFFF; }

// ─── Assets PHASE 2 (même pattern tolérant que _ensureTrailAssets :85) ───────
let _bigPokeballTiles: Uint8Array | null = null;   // sBigPokeball_Tileset (big_pokeball.png .4bpp, 44 tiles)
let _bigPokeballMap: Uint16Array | null = null;    // sBigPokeball_Tilemap (big_pokeball_map.bin, 600 u16 = 20×30)
let _bigPokeballPal: Uint16Array | null = null;    // sFieldEffectPal_Pokeball (pokeball.gbapal)
let _bigPokeballReady = false;
async function _ensureBigPokeballAssets(): Promise<void> {
  if (_bigPokeballReady) return;
  try {
    const { loadGbaPal } = await import('../harness/gba/png-loader');
    // Indices via loadIndexedPng (palette 1er-vu). ⚠ si couleurs fausses à l'A/B au
    // bascule, régénérer big_pokeball.4bpp.bin BYTE-EXACT (précédent ball NOIRE :92-99) —
    // aucun .4bpp.bin dispo dans public/, donc png tolérant pour l'instant.
    const gfx = await loadIndexedPng('/decomp/em/battle_transitions/big_pokeball.png');
    _bigPokeballTiles = gfx.charData;
    const resp = await fetch('/decomp/em/battle_transitions/big_pokeball_map.bin');
    if (!resp.ok) throw new Error(`big_pokeball_map.bin HTTP ${resp.status}`);
    _bigPokeballMap = new Uint16Array(await resp.arrayBuffer());
    _bigPokeballPal = await loadGbaPal('/decomp/em/battle_transitions/pokeball.gbapal');
  } catch (e) {
    // BLOQ-1 fail-open : la state-machine PatternWeave (Blend→CircularMask→FadeScreenBlack)
    // est 100% timer/blend → un asset manquant ne laisse qu'un BG vide mais la transition
    // se termine. Le flag passe true en finally → BigPokeball_Init avance (null-guards).
    console.error('[battle_transition] _ensureBigPokeballAssets KO — transition BigPokeball dégradée SANS gel', e);
  } finally {
    _bigPokeballReady = true;
  }
}

let _shrinkTiles: Uint8Array | null = null;   // sShrinkingBoxTileset (shrinking_box.png .4bpp, 15 tiles)
let _shrinkPal: Uint16Array | null = null;    // sFieldEffectPal_Pokeball
let _gridSquaresReady = false;
async function _ensureGridSquaresAssets(): Promise<void> {
  if (_gridSquaresReady) return;
  try {
    const { loadGbaPal } = await import('../harness/gba/png-loader');
    const gfx = await loadIndexedPng('/decomp/em/battle_transitions/shrinking_box.png');
    _shrinkTiles = gfx.charData;
    _shrinkPal = await loadGbaPal('/decomp/em/battle_transitions/pokeball.gbapal');
  } catch (e) {
    // BLOQ-1 fail-open : GridSquares_Main est piloté par tShrinkStage (timer) → la
    // transition se termine même sans tiles. Le flag passe true en finally → pas de gel.
    console.error('[battle_transition] _ensureGridSquaresAssets KO — transition GridSquares dégradée SANS gel', e);
  } finally {
    _gridSquaresReady = true;
  }
}

//------------------------------------------------------------------------
// B_TRANSITION_BIG_POKEBALL + tronc PatternWeave (battle_transition.c:1317-1756)
//------------------------------------------------------------------------
// #define tBlendTarget1 data[1] · tBlendTarget2 data[2] · tBlendDelay data[3]
// (réutilisés par PatternWeave_CircularMask : tRadius data[1] · tRadiusDelta data[2]
//  · tVBlankSet data[3]) · tSinIndex data[4] · tAmplitude data[5] · tEndDelay data[8]

/** 1:1 `InitPatternWeaveTransition` (:1375). _coreEnableWin0 = adaptation (voir en-tête). */
function InitPatternWeaveTransition(taskId: number): void {
  const d = gTasks[taskId].data;
  InitTransitionData();
  ScanlineEffect_Clear();
  d[1] = 16;       // tBlendTarget1
  d[2] = 0;        // tBlendTarget2
  d[4] = 0;        // tSinIndex
  d[5] = 0x4000;   // tAmplitude
  sTransitionData!.WININ = WININ_WIN0_ALL;
  sTransitionData!.WINOUT = 0;
  sTransitionData!.WIN0H = DISPLAY_WIDTH;
  sTransitionData!.WIN0V = DISPLAY_HEIGHT;
  sTransitionData!.BLDCNT = BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL;
  sTransitionData!.BLDALPHA = BLDALPHA_BLEND(d[2], d[1]);
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = DISPLAY_WIDTH;
  SetVBlankCallback(VBlankCB_PatternWeave);
  _coreEnableWin0();
}

/** 1:1 `Task_BigPokeball` (:1340). */
function Task_BigPokeball(taskId: number): void { while (sBigPokeball_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `BigPokeball_Init` (:1443). Asset-wait (précédent PokeballsTrail_Init:1508). */
function BigPokeball_Init(taskId: number): boolean {
  if (!_bigPokeballReady) {
    _ensureBigPokeballAssets().catch((e) => console.error('[battle_transition] assets BigPokeball KO', e));
    return false;
  }
  InitPatternWeaveTransition(taskId);
  const rt = _coreRt();
  if (rt) {
    const bg0 = rt.gba.bg(0);
    bg0.tilemap.fill(0);                                  // CpuFill16(0, tilemap, BG_SCREEN_SIZE)
    if (_bigPokeballTiles) bg0.vram.set(_bigPokeballTiles, 0);   // CpuCopy16 tileset (sizeof)
    const rtPal = (getRuntime() as unknown as { gPlttBufferFaded?: Uint16Array }).gPlttBufferFaded;
    if (rtPal && _bigPokeballPal) rtPal.set(_bigPokeballPal.subarray(0, 16), 15 * 16);   // LoadPalette BG 15
  }
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `BigPokeball_SetGfx` (:1457). SET_TILE : tilemap[i*32+j] = map | (0xF0<<8) (pal 15). */
function BigPokeball_SetGfx(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const rt = _coreRt();
  if (rt && _bigPokeballMap) {
    const tilemap = rt.gba.bg(0).tilemap;
    let k = 0;
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 30; j++, k++) tilemap[i * 32 + j] = (_bigPokeballMap[k] | (0xF0 << 8)) & 0xFFFF;
    }
  }
  // SetSinWave amplitude BRUTE (pas >>8) — 1:1 :1471 ; écrasée le même frame par Blend1.
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5], DISPLAY_HEIGHT);
  d[0]++;
  return true;
}

/** 1:1 `PatternWeave_Blend1` (:1612). */
function PatternWeave_Blend1(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  if (d[3] === 0 || --d[3] === 0) {
    d[2]++;        // tBlendTarget2
    d[3] = 2;      // tBlendDelay
  }
  sTransitionData!.BLDALPHA = BLDALPHA_BLEND(d[2], d[1]);
  if (d[2] > 15) d[0]++;
  d[4] += 8;       // tSinIndex
  d[5] -= 256;     // tAmplitude
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5] >> 8, DISPLAY_HEIGHT);
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `PatternWeave_Blend2` (:1632). */
function PatternWeave_Blend2(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  if (d[3] === 0 || --d[3] === 0) {
    d[1]--;        // tBlendTarget1
    d[3] = 2;      // tBlendDelay
  }
  sTransitionData!.BLDALPHA = BLDALPHA_BLEND(d[2], d[1]);
  if (d[1] === 0) d[0]++;
  d[4] += 8;
  d[5] -= 256;
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5] >> 8, DISPLAY_HEIGHT);
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `PatternWeave_FinishAppear` (:1652). data[1-3] deviennent tRadius/tRadiusDelta/tVBlankSet. */
function PatternWeave_FinishAppear(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  d[4] += 8;
  d[5] -= 256;
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5] >> 8, DISPLAY_HEIGHT);
  if (d[5] <= 0) {
    d[0]++;
    d[1] = DISPLAY_HEIGHT;   // tRadius
    d[2] = 1 << 8;           // tRadiusDelta
    d[3] = 0;                // tVBlankSet (FALSE)
  }
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `PatternWeave_CircularMask` (:1694). Masque circulaire décroissant → noir. */
function PatternWeave_CircularMask(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  if (d[2] < (4 << 8)) d[2] += 128;   // tRadiusDelta (256 = 1 unité ; +½ vitesse/2 frames)
  if (d[1] !== 0) {
    d[1] -= d[2] >> 8;                // tRadius
    if (d[1] < 0) d[1] = 0;
  }
  SetCircularMask(gScanlineEffectRegBuffers[0], DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, d[1]);
  if (d[1] === 0) {
    SetVBlankCallback(null);
    _setHBlank(null);   // DmaStop(0)
    FadeScreenBlack();
    DestroyTask(FindTaskIdByFunc((gTasks[taskId] as unknown as { funcRef: CoreTaskFn }).funcRef));   // task->func
  } else {
    if (!d[3]) {        // tVBlankSet
      d[3]++;
      SetVBlankCallback(VBlankCB_CircularMask);
    }
    sTransitionData!.VBlank_DMA++;
  }
  return false;
}

/** 1:1 `VBlankCB_SetWinAndBlend` (:1725). DmaCopy16 buffers[0]→[1] = H*2 oct = 160 u16. */
function VBlankCB_SetWinAndBlend(): void {
  _setHBlank(null);   // DmaStop(0)
  VBlankCB_BattleTransition();
  if (sTransitionData) {
    if (sTransitionData.VBlank_DMA) {
      for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
    SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
    SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
    SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
    SetGpuReg(REG_OFFSET_BLDCNT, sTransitionData.BLDCNT);
    SetGpuReg(REG_OFFSET_BLDALPHA, sTransitionData.BLDALPHA);
  }
}

/** 1:1 `VBlankCB_PatternWeave` (:1738). DmaSet buffers[1] → REG_BG0HOFS par-scanline. */
function VBlankCB_PatternWeave(): void {
  VBlankCB_SetWinAndBlend();
  _setHBlank(HBlankCB_PatternWeave);
}

/** 1:1 `VBlankCB_CircularMask` (:1744). DmaSet buffers[1] → REG_WIN0H par-scanline. */
function VBlankCB_CircularMask(): void {
  VBlankCB_SetWinAndBlend();
  _setHBlank(HBlankCB_CircularMask);
}

/** HOFS BG0 par-scanline (= DmaSet REG_BG0HOFS ; précédent HBlankCB_Swirl:1435). */
function HBlankCB_PatternWeave(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const rt = _coreRt(); if (!rt) return;
  rt.gba.bg(0).config.hofs = gScanlineEffectRegBuffers[1][y];
}

/** WIN0H par-scanline (= DmaSet REG_WIN0H ; précédent HBlankCB_AngledWipes:1812). */
function HBlankCB_CircularMask(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const rt = _coreRt(); if (!rt) return;
  const win0h = gScanlineEffectRegBuffers[1][y];
  rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
  rt.gba.windows.win0.x2 = win0h & 0xFF;
}

const sBigPokeball_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  BigPokeball_Init, BigPokeball_SetGfx,
  PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear, PatternWeave_CircularMask,
];

//-----------------------------
// B_TRANSITION_CLOCKWISE_WIPE (battle_transition.c:1875-2067)
//-----------------------------
// Réutilise sTransitionData.wipe (data[]) : tWipeCurrX=data[2]→currX, tWipeCurrY=
// data[3]→currY, tWipeEndX=data[4]→endX, tWipeEndY=data[5]→endY (défines :39-42).

/** 1:1 `Task_ClockwiseWipe` (:1879). */
function Task_ClockwiseWipe(taskId: number): void { while (sClockwiseWipe_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `ClockwiseWipe_Init` (:1884). */
function ClockwiseWipe_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  sTransitionData!.WININ = 0;
  sTransitionData!.WINOUT = WINOUT_WIN01_ALL;
  sTransitionData!.WIN0H = WIN_RANGE(DISPLAY_WIDTH, DISPLAY_WIDTH + 1);
  sTransitionData!.WIN0V = DISPLAY_HEIGHT;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = (((DISPLAY_WIDTH + 3) << 8) | (DISPLAY_WIDTH + 4)) & 0xFFFF;
  SetVBlankCallback(VBlankCB_ClockwiseWipe);
  sTransitionData!.wipe.endX = DISPLAY_WIDTH / 2;
  _coreEnableWin0();
  gTasks[taskId].data[0]++;
  return true;
}

/** 1:1 `ClockwiseWipe_TopRight` (:1906). UBFIX actif (config.h:58) → endY=0 (non-UBFIX : -1). */
function ClockwiseWipe_TopRight(taskId: number): boolean {
  const w = sTransitionData!.wipe;
  sTransitionData!.VBlank_DMA = 0;
  InitBlackWipe(w, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, w.endX, 0, 1, 1);
  do {
    gScanlineEffectRegBuffers[0][w.currY] = ((w.currX + 1) | ((DISPLAY_WIDTH / 2) << 8)) & 0xFFFF;
  } while (!UpdateBlackWipe(w, true, true));
  w.endX += 16;
  if (w.endX >= DISPLAY_WIDTH) {
    w.endY = 0;
    gTasks[taskId].data[0]++;
  }
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `ClockwiseWipe_Right` (:1931). */
function ClockwiseWipe_Right(taskId: number): boolean {
  const w = sTransitionData!.wipe;
  let start = 0, end = 0;
  let finished = false;
  sTransitionData!.VBlank_DMA = 0;
  InitBlackWipe(w, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, DISPLAY_WIDTH, w.endY, 1, 1);
  while (true) {
    start = DISPLAY_WIDTH / 2; end = w.currX + 1;
    if (w.endY >= DISPLAY_HEIGHT / 2) { start = w.currX; end = DISPLAY_WIDTH; }
    gScanlineEffectRegBuffers[0][w.currY] = (end | (start << 8)) & 0xFFFF;
    if (finished) break;
    finished = UpdateBlackWipe(w, true, true);
  }
  w.endY += 8;
  if (w.endY >= DISPLAY_HEIGHT) {
    w.endX = DISPLAY_WIDTH;
    gTasks[taskId].data[0]++;
  } else {
    while (w.currY < w.endY) gScanlineEffectRegBuffers[0][++w.currY] = (end | (start << 8)) & 0xFFFF;
  }
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `ClockwiseWipe_Bottom` (:1967). */
function ClockwiseWipe_Bottom(taskId: number): boolean {
  const w = sTransitionData!.wipe;
  sTransitionData!.VBlank_DMA = 0;
  InitBlackWipe(w, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, w.endX, DISPLAY_HEIGHT, 1, 1);
  do {
    gScanlineEffectRegBuffers[0][w.currY] = ((w.currX << 8) | DISPLAY_WIDTH) & 0xFFFF;
  } while (!UpdateBlackWipe(w, true, true));
  w.endX -= 16;
  if (w.endX <= 0) {
    w.endY = DISPLAY_HEIGHT;
    gTasks[taskId].data[0]++;
  }
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `ClockwiseWipe_Left` (:1988). */
function ClockwiseWipe_Left(taskId: number): boolean {
  const w = sTransitionData!.wipe;
  let end = 0, start = 0;
  let finished = false;
  sTransitionData!.VBlank_DMA = 0;
  InitBlackWipe(w, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, 0, w.endY, 1, 1);
  while (true) {
    end = gScanlineEffectRegBuffers[0][w.currY] & 0xFF;
    start = w.currX;
    if (w.endY <= DISPLAY_HEIGHT / 2) { start = DISPLAY_WIDTH / 2; end = w.currX; }
    gScanlineEffectRegBuffers[0][w.currY] = (end | (start << 8)) & 0xFFFF;
    if (finished) break;
    finished = UpdateBlackWipe(w, true, true);
  }
  w.endY -= 8;
  if (w.endY <= 0) {
    w.endX = 0;
    gTasks[taskId].data[0]++;
  } else {
    while (w.currY > w.endY) gScanlineEffectRegBuffers[0][--w.currY] = (end | (start << 8)) & 0xFFFF;
  }
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `ClockwiseWipe_TopLeft` (:2026). */
function ClockwiseWipe_TopLeft(taskId: number): boolean {
  const w = sTransitionData!.wipe;
  sTransitionData!.VBlank_DMA = 0;
  InitBlackWipe(w, DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, w.endX, 0, 1, 1);
  do {
    let start = DISPLAY_WIDTH / 2, end = w.currX;
    if (w.currX >= DISPLAY_WIDTH / 2) { start = 0; end = DISPLAY_WIDTH; }
    gScanlineEffectRegBuffers[0][w.currY] = (end | (start << 8)) & 0xFFFF;
  } while (!UpdateBlackWipe(w, true, true));
  w.endX += 16;
  if (w.currX > DISPLAY_WIDTH / 2) gTasks[taskId].data[0]++;
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `ClockwiseWipe_End` (:2048). */
function ClockwiseWipe_End(taskId: number): boolean {
  void taskId;
  _setHBlank(null);   // DmaStop(0)
  FadeScreenBlack();
  DestroyTask(FindTaskIdByFunc(Task_ClockwiseWipe));
  return false;
}

/** 1:1 `VBlankCB_ClockwiseWipe` (:2056). DmaCopy16 H*2 oct = 160 u16 ; DmaSet buffers[1]→REG_WIN0H. */
function VBlankCB_ClockwiseWipe(): void {
  _setHBlank(null);   // DmaStop(0)
  VBlankCB_BattleTransition();
  if (sTransitionData && sTransitionData.VBlank_DMA !== 0) {
    for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  }
  if (sTransitionData) {
    SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
    SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
    SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
  }
  // REG_WIN0H = buffers[1][0] (pré-HBlank), puis DmaSet buffers[1] → REG_WIN0H par-scanline.
  const rt = _coreRt();
  if (rt) {
    const win0h0 = gScanlineEffectRegBuffers[1][0];
    rt.gba.windows.win0.x1 = (win0h0 >> 8) & 0xFF;
    rt.gba.windows.win0.x2 = win0h0 & 0xFF;
  }
  _setHBlank(HBlankCB_ClockwiseWipe);
}

/** WIN0H par-scanline (buffers[1][y] = left<<8|right ; précédent HBlankCB_AngledWipes:1812). */
function HBlankCB_ClockwiseWipe(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const rt = _coreRt(); if (!rt) return;
  const win0h = gScanlineEffectRegBuffers[1][y];
  rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
  rt.gba.windows.win0.x2 = win0h & 0xFF;
}

const sClockwiseWipe_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  ClockwiseWipe_Init, ClockwiseWipe_TopRight, ClockwiseWipe_Right, ClockwiseWipe_Bottom,
  ClockwiseWipe_Left, ClockwiseWipe_TopLeft, ClockwiseWipe_End,
];

//---------------------
// B_TRANSITION_RIPPLE (battle_transition.c:2069-2154)
//---------------------
// #define tSinVal data[1] · tAmplitudeVal data[2] · tTimer data[3] · tFadeStarted data[4]

/** 1:1 `Task_Ripple` (:2078). */
function Task_Ripple(taskId: number): void { while (sRipple_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `Ripple_Init` (:2083). */
function Ripple_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = sTransitionData!.cameraY;
  SetVBlankCallback(VBlankCB_Ripple);
  _setHBlank(HBlankCB_Ripple);
  EnableInterrupts(INTR_FLAG_HBLANK);
  gTasks[taskId].data[0]++;
  return true;
}

/** 1:1 `Ripple_Main` (:2102). */
function Ripple_Main(taskId: number): boolean {
  const d = gTasks[taskId].data;
  sTransitionData!.VBlank_DMA = 0;
  const amplitude = d[2] >> 8;
  let sinVal = d[1] & 0xFFFF;      // u16
  const speed = 0x180;
  d[1] = (d[1] + 0x400) & 0xFFFF;  // tSinVal (u16)
  if (d[2] <= 0x1FFF) d[2] += 0x180;   // tAmplitudeVal
  for (let i = 0; i < DISPLAY_HEIGHT; i++, sinVal = (sinVal + speed) & 0xFFFF) {
    const sinIndex = sinVal >> 8;
    gScanlineEffectRegBuffers[0][i] = (sTransitionData!.cameraY + _swSin(sinIndex & 0xFFFF, amplitude)) & 0xFFFF;
  }
  if (++d[3] === 81) {   // tTimer
    d[4]++;              // tFadeStarted
    BeginNormalPaletteFade(PALETTES_ALL, -2, 0, 16, RGB_BLACK);
  }
  if (d[4] && !gPaletteFade.active) DestroyTask(FindTaskIdByFunc(Task_Ripple));
  sTransitionData!.VBlank_DMA++;
  return false;
}

/** 1:1 `VBlankCB_Ripple` (:2136). DmaCopy16 H*2 oct = 160 u16. */
function VBlankCB_Ripple(): void {
  VBlankCB_BattleTransition();
  if (sTransitionData && sTransitionData.VBlank_DMA) {
    for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  }
}

/** 1:1 `HBlankCB_Ripple` (:2143). REG_BG{1,2,3}VOFS ← buffers[1][VCOUNT]. */
function HBlankCB_Ripple(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const v = gScanlineEffectRegBuffers[1][y];
  const rt = _coreRt(); if (!rt) return;
  rt.gba.bg(1).config.vofs = v; rt.gba.bg(2).config.vofs = v; rt.gba.bg(3).config.vofs = v;
}

const sRipple_Funcs: ReadonlyArray<(taskId: number) => boolean> = [Ripple_Init, Ripple_Main];

//---------------------------
// B_TRANSITION_GRID_SQUARES (battle_transition.c:3762-3819)
//---------------------------
// #define tDelay data[1] · tShrinkStage data[2]

/** 1:1 `Task_GridSquares` (:3769). */
function Task_GridSquares(taskId: number): void { while (sGridSquares_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `GridSquares_Init` (:3774). Asset-wait (précédent PokeballsTrail_Init:1508). */
function GridSquares_Init(taskId: number): boolean {
  if (!_gridSquaresReady) {
    _ensureGridSquaresAssets().catch((e) => console.error('[battle_transition] assets GridSquares KO', e));
    return false;
  }
  const rt = _coreRt();
  if (rt) {
    const bg0 = rt.gba.bg(0);
    if (_shrinkTiles) bg0.vram.set(_shrinkTiles.subarray(0, 32), 0);   // CpuSet tile 0 (16 u16 = 32 oct)
    bg0.tilemap.fill(0xF0 << 8);                                        // CpuFill16(0xF0<<8) = tile 0 | pal 15
    const rtPal = (getRuntime() as unknown as { gPlttBufferFaded?: Uint16Array }).gPlttBufferFaded;
    if (rtPal && _shrinkPal) rtPal.set(_shrinkPal.subarray(0, 16), 15 * 16);   // LoadPalette BG 15
  }
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `GridSquares_Main` (:3787). Chaque étape : CpuSet tile #tShrinkStage → slot 0. */
function GridSquares_Main(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (d[1] === 0) {   // tDelay
    d[1] = 3;
    d[2]++;           // tShrinkStage
    const rt = _coreRt();
    if (rt && _shrinkTiles) rt.gba.bg(0).vram.set(_shrinkTiles.subarray(d[2] * 32, d[2] * 32 + 32), 0);
    if (d[2] > 13) {
      d[0]++;
      d[1] = 16;
    }
  }
  d[1]--;
  return false;
}

/** 1:1 `GridSquares_End` (:3808). */
function GridSquares_End(taskId: number): boolean {
  if (--gTasks[taskId].data[1] === 0) {
    FadeScreenBlack();
    DestroyTask(FindTaskIdByFunc(Task_GridSquares));
  }
  return false;
}

const sGridSquares_Funcs: ReadonlyArray<(taskId: number) => boolean> = [GridSquares_Init, GridSquares_Main, GridSquares_End];

//------------------------------
// B_TRANSITION_WHITE_BARS_FADE (battle_transition.c:3575-3760) — Task_* RÉEL
//------------------------------
// Sprites invisibles (CreateInvisibleSprite) porteurs du SpriteCB par-barre.
// #define sFade data[0] · sFinished data[1] · sDestroyAttempts data[2]
//        · sDelay data[5] · sIsMainSprite data[6] (FADE_TARGET/NUM_WHITE_BARS déjà :473/476)
// ⚠ Les 8 sprites sont animés par AnimateSprites (runSpriteCallbacks) du CB2 : au
// bascule, le CB2 réel DOIT l'appeler (comme PokeballsTrail dépend de la boucle sprite,
// note :182) sinon WaitBars ne termine jamais (counter piloté par le SpriteCB).

interface WhiteBarSprite {
  x: number; y: number; data: number[]; spriteId: number;
  invisible?: boolean; inUse?: boolean;
  callback: ((sprite: WhiteBarSprite) => void) | null;
}

/** 1:1 `CreateInvisibleSprite(callback)` (sprite.c:524) : CreateSprite(gDummySpriteTemplate,0,0,31)
 *  + invisible + callback. Substrat = CreateSpriteAtOam (tileId/pal 0) car le sprite est
 *  invisible immédiatement → évite le dispatcher template « sheet tag 0 non chargée »
 *  (précédent field_effect_helpers.ts:2136). */
function CreateInvisibleSprite(callback: (sprite: WhiteBarSprite) => void): number {
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam?: (cfg: {
      tileId: number; paletteBank: number; x: number; y: number;
      shape: 0 | 1 | 2; size: 0 | 1 | 2 | 3; priority: number; subpriority: number;
    }) => { spriteId: number; oamIndex: number };
    gSprites?: Array<WhiteBarSprite | undefined>;
  };
  const res = rt.CreateSpriteAtOam?.({ tileId: 0, paletteBank: 0, x: 0, y: 0, shape: 0, size: 0, priority: 0, subpriority: 31 });
  const spriteId = res?.spriteId ?? MAX_SPRITES;   // = return MAX_SPRITES si échec (sprite.c:528)
  const sprite = rt.gSprites?.[spriteId];
  if (sprite) { sprite.invisible = true; sprite.callback = callback; }
  return spriteId;
}

/** 1:1 `Task_WhiteBarsFade` (:3587). */
function Task_WhiteBarsFade(taskId: number): void { while (sWhiteBarsFade_Funcs[gTasks[taskId].data[0]](taskId)); }

/** 1:1 `WhiteBarsFade_Init` (:3592). BLDCNT_TGT1_ALL|LIGHTEN=0xBF · WININ BG1-3+OBJ=0x1E. */
function WhiteBarsFade_Init(taskId: number): boolean {
  InitTransitionData();
  ScanlineEffect_Clear();
  sTransitionData!.BLDCNT = BLDCNT_TGT1_ALL | BLDCNT_EFFECT_LIGHTEN;
  sTransitionData!.BLDY = 0;
  sTransitionData!.WININ = 0x1E;   // WININ_WIN0_BG1|BG2|BG3|OBJ (io_reg.h:551-555)
  sTransitionData!.WINOUT = WINOUT_WIN01_ALL;
  sTransitionData!.WIN0V = DISPLAY_HEIGHT;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[1][i] = 0;
    gScanlineEffectRegBuffers[1][i + DISPLAY_HEIGHT] = DISPLAY_WIDTH;
  }
  EnableInterrupts(INTR_FLAG_HBLANK);
  _setHBlank(HBlankCB_WhiteBarsFade);
  SetVBlankCallback(VBlankCB_WhiteBarsFade);
  _coreEnableWin0();   // adaptation (bespoke WhiteBarsFade:499)
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `WhiteBarsFade_StartBars` (:3619). 8 sprites invisibles ; le DERNIER = mainSprite. */
function WhiteBarsFade_StartBars(taskId: number): boolean {
  const rt = getRuntime() as unknown as { gSprites?: Array<WhiteBarSprite | undefined> };
  const delays = sWhiteBarsFade_StartDelays;
  const step = (DISPLAY_HEIGHT / NUM_WHITE_BARS) | 0;   // 20
  let sprite: WhiteBarSprite | undefined;
  let posY = 0;
  for (let i = 0; i < NUM_WHITE_BARS; i++, posY += step) {
    const id = CreateInvisibleSprite(SpriteCB_WhiteBarFade);
    sprite = rt.gSprites?.[id];
    if (!sprite) continue;
    sprite.x = DISPLAY_WIDTH;
    sprite.y = posY;
    sprite.data[5] = delays[i];   // sDelay
  }
  // Sur UN seul sprite (le dernier) : active le DMA VBlank + attend la destruction des autres.
  if (sprite) sprite.data[6]++;   // sIsMainSprite
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `WhiteBarsFade_WaitBars` (:3642). */
function WhiteBarsFade_WaitBars(taskId: number): boolean {
  sTransitionData!.VBlank_DMA = 0;
  if (sTransitionData!.counter >= NUM_WHITE_BARS) {
    BlendPalettes(PALETTES_ALL, 16, RGB_WHITE);
    gTasks[taskId].data[0]++;
  }
  return false;
}

/** 1:1 `WhiteBarsFade_BlendToBlack` (:3653). */
function WhiteBarsFade_BlendToBlack(taskId: number): boolean {
  sTransitionData!.VBlank_DMA = 0;
  _setHBlank(null);          // DmaStop(0)
  SetVBlankCallback(null);
  _setHBlank(null);          // SetHBlankCallback(0)
  sTransitionData!.WIN0H = DISPLAY_WIDTH;
  sTransitionData!.BLDY = 0;
  sTransitionData!.BLDCNT = 0xFF;
  sTransitionData!.WININ = WININ_WIN0_ALL;
  SetVBlankCallback(VBlankCB_WhiteBarsFade_Blend);
  gTasks[taskId].data[0]++;
  return false;
}

/** 1:1 `WhiteBarsFade_End` (:3672). */
function WhiteBarsFade_End(taskId: number): boolean {
  void taskId;
  if (++sTransitionData!.BLDY > 16) {
    FadeScreenBlack();
    DestroyTask(FindTaskIdByFunc(Task_WhiteBarsFade));
  }
  return false;
}

/** 1:1 `VBlankCB_WhiteBarsFade` (:3682). DmaCopy16 H*4 oct = 320 u16 (2 moitiés) ;
 *  DmaSet &buffers[1][H] → REG_WIN0H par-scanline (fusionné dans HBlankCB_WhiteBarsFade). */
function VBlankCB_WhiteBarsFade(): void {
  _setHBlank(null);   // DmaStop(0)
  VBlankCB_BattleTransition();
  if (sTransitionData) {
    SetGpuReg(REG_OFFSET_BLDCNT, sTransitionData.BLDCNT);
    SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
    SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
    SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
    if (sTransitionData.VBlank_DMA) {
      for (let i = 0; i < DISPLAY_HEIGHT * 2; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
  }
  _setHBlank(HBlankCB_WhiteBarsFade);
}

/** 1:1 `VBlankCB_WhiteBarsFade_Blend` (:3695). */
function VBlankCB_WhiteBarsFade_Blend(): void {
  VBlankCB_BattleTransition();
  if (!sTransitionData) return;
  SetGpuReg(REG_OFFSET_BLDY, sTransitionData.BLDY);
  SetGpuReg(REG_OFFSET_BLDCNT, sTransitionData.BLDCNT);
  SetGpuReg(REG_OFFSET_WININ, sTransitionData.WININ);
  SetGpuReg(REG_OFFSET_WINOUT, sTransitionData.WINOUT);
  SetGpuReg(REG_OFFSET_WIN0H, sTransitionData.WIN0H);
  SetGpuReg(REG_OFFSET_WIN0V, sTransitionData.WIN0V);
}

/** 1:1 `HBlankCB_WhiteBarsFade` (:3706, REG_BLDY) FUSIONNÉ avec le DmaSet REG_WIN0H de
 *  VBlankCB_WhiteBarsFade (moteur = 1 seul hook HBlank ; précédent bespoke WhiteBarsFade:512). */
function HBlankCB_WhiteBarsFade(y: number): void {
  if (y >= DISPLAY_HEIGHT) return;
  const rt = _coreRt(); if (!rt) return;
  rt.gba.blend.brightness = gScanlineEffectRegBuffers[1][y] & 0x1F;   // REG_BLDY
  const win0h = gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + y];      // &buffers[1][H] → REG_WIN0H
  rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
  rt.gba.windows.win0.x2 = win0h & 0xFF;
}

/** 1:1 `SpriteCB_WhiteBarFade` (:3711). Une barre : fond blanc balayé droite→gauche. */
function SpriteCB_WhiteBarFade(sprite: WhiteBarSprite): void {
  if (sprite.data[5]) {   // sDelay
    sprite.data[5]--;
    if (sprite.data[6]) sTransitionData!.VBlank_DMA = 1;   // sIsMainSprite
  } else {
    const base1 = sprite.y;                    // &buffers[0][sprite->y]
    const base2 = sprite.y + DISPLAY_HEIGHT;   // &buffers[0][sprite->y + DISPLAY_HEIGHT]
    const step = (DISPLAY_HEIGHT / NUM_WHITE_BARS) | 0;
    for (let i = 0; i < step; i++) {
      gScanlineEffectRegBuffers[0][base1 + i] = (sprite.data[0] >> 8) & 0xFFFF;   // sFade >> 8
      gScanlineEffectRegBuffers[0][base2 + i] = sprite.x & 0xFF;                   // (u8)sprite->x
    }
    if (sprite.x === 0 && sprite.data[0] === FADE_TARGET) sprite.data[1] = 1;   // sFinished = TRUE
    sprite.x -= 16;
    sprite.data[0] += (FADE_TARGET / 32) | 0;   // sFade += FADE_TARGET/32 (=128)
    if (sprite.x < 0) sprite.x = 0;
    if (sprite.data[0] > FADE_TARGET) sprite.data[0] = FADE_TARGET;
    if (sprite.data[6]) sTransitionData!.VBlank_DMA = 1;   // sIsMainSprite
    if (sprite.data[1]) {   // sFinished
      if (!sprite.data[6] || (sTransitionData!.counter >= NUM_WHITE_BARS - 1 && sprite.data[2]++ > 7)) {
        sTransitionData!.counter++;
        DestroySprite(sprite.spriteId);
      }
    }
  }
}

/** 1:1 `sWhiteBarsFade_StartDelays` (:740). */
const sWhiteBarsFade_StartDelays: readonly number[] = [0, 20, 15, 40, 10, 25, 35, 5];
const sWhiteBarsFade_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  WhiteBarsFade_Init, WhiteBarsFade_StartBars, WhiteBarsFade_WaitBars, WhiteBarsFade_BlendToBlack, WhiteBarsFade_End,
];

//------------------------------------------------------------------------
// FAMILLE PatternWeave « logo/légendaire » (battle_transition.c) — VIS-23
//------------------------------------------------------------------------
// Task_Aqua/Magma/Regice/Registeel/Regirock (:1345-1370) : MÊME tronc PatternWeave
// que BigPokeball (Blend1/Blend2/FinishAppear/CircularMask déjà portés), seuls
// diffèrent le tileset/tilemap/palette chargés et (Aqua/Magma) l'ajout de
// FramesCountdown. Assets extraits présents dans public/decomp/em/battle_transitions/
// (team_aqua/team_magma .png+.bin+evil_team.pal ; regis.png + regi{ce,steel,rock}.bin+.pal).
// Chargement fail-open IDENTIQUE à _ensureBigPokeballAssets (asset KO → BG vide mais la
// state-machine timer/blend/mask se termine SANS gel). Câblés dans sTasks_Main plus bas.
// DETTE : rendu visuel 1:1 à valider EN JEU (session partagée) — machinerie partagée
// prouvée (BigPokeball) mais ces assets n'ont pas encore été A/B en jeu.

/** 1:1 `FramesCountdown` (:1672) : décrémente tEndDelay (data[8]), avance à 0. */
function FramesCountdown(taskId: number): boolean {
  const d = gTasks[taskId].data;
  if (--d[8] === 0) d[0]++;
  return false;
}

// team_aqua / team_magma : tileset (.4bpp.lz → png décompressé) + tilemap (.bin.lz →
// .bin décompressé) + evil_team.pal. Même voie tolérante que BigPokeball.
let _teamAquaTiles: Uint8Array | null = null;
let _teamAquaMap: Uint16Array | null = null;
let _teamMagmaTiles: Uint8Array | null = null;
let _teamMagmaMap: Uint16Array | null = null;
let _evilTeamPal: Uint16Array | null = null;
let _teamAquaReady = false;
let _teamMagmaReady = false;
async function _ensureTeamAquaAssets(): Promise<void> {
  if (_teamAquaReady) return;
  try {
    const { loadGbaPal } = await import('../harness/gba/png-loader');
    const gfx = await loadIndexedPng('/decomp/em/battle_transitions/team_aqua.png');
    _teamAquaTiles = gfx.charData;
    const resp = await fetch('/decomp/em/battle_transitions/team_aqua.bin');
    if (!resp.ok) throw new Error(`team_aqua.bin HTTP ${resp.status}`);
    _teamAquaMap = new Uint16Array(await resp.arrayBuffer());
    _evilTeamPal = await loadGbaPal('/decomp/em/battle_transitions/evil_team.pal');
  } catch (e) {
    console.error('[battle_transition] _ensureTeamAquaAssets KO — transition Aqua dégradée SANS gel', e);
  } finally {
    _teamAquaReady = true;
  }
}
async function _ensureTeamMagmaAssets(): Promise<void> {
  if (_teamMagmaReady) return;
  try {
    const { loadGbaPal } = await import('../harness/gba/png-loader');
    const gfx = await loadIndexedPng('/decomp/em/battle_transitions/team_magma.png');
    _teamMagmaTiles = gfx.charData;
    const resp = await fetch('/decomp/em/battle_transitions/team_magma.bin');
    if (!resp.ok) throw new Error(`team_magma.bin HTTP ${resp.status}`);
    _teamMagmaMap = new Uint16Array(await resp.arrayBuffer());
    _evilTeamPal = await loadGbaPal('/decomp/em/battle_transitions/evil_team.pal');
  } catch (e) {
    console.error('[battle_transition] _ensureTeamMagmaAssets KO — transition Magma dégradée SANS gel', e);
  } finally {
    _teamMagmaReady = true;
  }
}

// regis : tileset partagé (regis.png .4bpp, 53 tiles, non compressé) + 3 tilemaps
// (INCBIN .bin, 0x500 = 640 u16) + 3 palettes .gbapal (bank 15).
let _regisTiles: Uint8Array | null = null;
let _regiceMap: Uint16Array | null = null;
let _registeelMap: Uint16Array | null = null;
let _regirockMap: Uint16Array | null = null;
let _regicePal: Uint16Array | null = null;
let _registeelPal: Uint16Array | null = null;
let _regirockPal: Uint16Array | null = null;
let _regiReady = false;
async function _ensureRegiAssets(): Promise<void> {
  if (_regiReady) return;
  try {
    const { loadGbaPal } = await import('../harness/gba/png-loader');
    const gfx = await loadIndexedPng('/decomp/em/battle_transitions/regis.png');
    _regisTiles = gfx.charData;
    const readBin = async (name: string): Promise<Uint16Array> => {
      const resp = await fetch(`/decomp/em/battle_transitions/${name}`);
      if (!resp.ok) throw new Error(`${name} HTTP ${resp.status}`);
      return new Uint16Array(await resp.arrayBuffer());
    };
    _regiceMap = await readBin('regice.bin');
    _registeelMap = await readBin('registeel.bin');
    _regirockMap = await readBin('regirock.bin');
    _regicePal = await loadGbaPal('/decomp/em/battle_transitions/regice.pal');
    _registeelPal = await loadGbaPal('/decomp/em/battle_transitions/registeel.pal');
    _regirockPal = await loadGbaPal('/decomp/em/battle_transitions/regirock.pal');
  } catch (e) {
    console.error('[battle_transition] _ensureRegiAssets KO — transitions Regi dégradées SANS gel', e);
  } finally {
    _regiReady = true;
  }
}

/** Écrit une palette (16 couleurs) dans gPlttBufferFaded, bank 15 (= LoadPalette
 *  BG_PLTT_ID(15)), 1:1 le pattern BigPokeball_Init. */
function _loadTransitionPalBank15(pal: Uint16Array | null): void {
  const rtPal = (getRuntime() as unknown as { gPlttBufferFaded?: Uint16Array }).gPlttBufferFaded;
  if (rtPal && pal) rtPal.set(pal.subarray(0, 16), 15 * 16);
}

/** 1:1 `Aqua_Init` (:1398). tEndDelay=60 + tileset + evil_team pal (bank 15). */
function Aqua_Init(taskId: number): boolean {
  if (!_teamAquaReady) {
    _ensureTeamAquaAssets().catch((e) => console.error('[battle_transition] assets Aqua KO', e));
    return false;
  }
  const d = gTasks[taskId].data;
  d[8] = 60;   // tEndDelay
  InitPatternWeaveTransition(taskId);
  const rt = _coreRt();
  if (rt) {
    rt.gba.bg(0).tilemap.fill(0);   // CpuFill16(0, tilemap, BG_SCREEN_SIZE)
    if (_teamAquaTiles) rt.gba.bg(0).vram.set(_teamAquaTiles, 0);   // LZ77UnCompVram tileset
    _loadTransitionPalBank15(_evilTeamPal);
  }
  d[0]++;
  return false;
}

/** 1:1 `Aqua_SetGfx` (:1477). Tilemap (LZ décompressé) + SetSinWave. */
function Aqua_SetGfx(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const rt = _coreRt();
  if (rt && _teamAquaMap) {
    const tilemap = rt.gba.bg(0).tilemap;
    tilemap.set(_teamAquaMap.subarray(0, Math.min(_teamAquaMap.length, tilemap.length)), 0);
  }
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5], DISPLAY_HEIGHT);
  d[0]++;
  return false;
}

/** 1:1 `Magma_Init` (:1413). */
function Magma_Init(taskId: number): boolean {
  if (!_teamMagmaReady) {
    _ensureTeamMagmaAssets().catch((e) => console.error('[battle_transition] assets Magma KO', e));
    return false;
  }
  const d = gTasks[taskId].data;
  d[8] = 60;
  InitPatternWeaveTransition(taskId);
  const rt = _coreRt();
  if (rt) {
    rt.gba.bg(0).tilemap.fill(0);
    if (_teamMagmaTiles) rt.gba.bg(0).vram.set(_teamMagmaTiles, 0);
    _loadTransitionPalBank15(_evilTeamPal);
  }
  d[0]++;
  return false;
}

/** 1:1 `Magma_SetGfx` (:1489). */
function Magma_SetGfx(taskId: number): boolean {
  const d = gTasks[taskId].data;
  const rt = _coreRt();
  if (rt && _teamMagmaMap) {
    const tilemap = rt.gba.bg(0).tilemap;
    tilemap.set(_teamMagmaMap.subarray(0, Math.min(_teamMagmaMap.length, tilemap.length)), 0);
  }
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5], DISPLAY_HEIGHT);
  d[0]++;
  return false;
}

/** 1:1 `Regi_Init` (:1428). tEndDelay=60 + tileset partagé regis (CpuCopy16 0x2000). */
function Regi_Init(taskId: number): boolean {
  if (!_regiReady) {
    _ensureRegiAssets().catch((e) => console.error('[battle_transition] assets Regi KO', e));
    return false;
  }
  const d = gTasks[taskId].data;
  d[8] = 60;   // tEndDelay (posé mais inutilisé : sRegi*_Funcs n'ont pas FramesCountdown — 1:1)
  InitPatternWeaveTransition(taskId);
  const rt = _coreRt();
  if (rt) {
    rt.gba.bg(0).tilemap.fill(0);
    if (_regisTiles) rt.gba.bg(0).vram.set(_regisTiles, 0);   // CpuCopy16(sRegis_Tileset, tileset, 0x2000)
  }
  d[0]++;
  return false;
}

/** SetGfx commun Regi (:1501/1514/1527) : LoadPalette(pal, bank15) + CpuCopy16 tilemap
 *  (0x500 = 640 u16) + SetSinWave. Le tilemap RAW porte déjà les bits pal 15. */
function _regiSetGfx(taskId: number, map: Uint16Array | null, pal: Uint16Array | null): boolean {
  const d = gTasks[taskId].data;
  _loadTransitionPalBank15(pal);
  const rt = _coreRt();
  if (rt && map) {
    const tilemap = rt.gba.bg(0).tilemap;
    const n = Math.min(0x500 / 2, map.length, tilemap.length);   // CpuCopy16 0x500 octets
    tilemap.set(map.subarray(0, n), 0);
  }
  _setSinWave(gScanlineEffectRegBuffers[0], 0, d[4], 132, d[5], DISPLAY_HEIGHT);
  d[0]++;
  return false;
}
/** 1:1 `Regice_SetGfx` (:1501). */
function Regice_SetGfx(taskId: number): boolean { return _regiSetGfx(taskId, _regiceMap, _regicePal); }
/** 1:1 `Registeel_SetGfx` (:1514). */
function Registeel_SetGfx(taskId: number): boolean { return _regiSetGfx(taskId, _registeelMap, _registeelPal); }
/** 1:1 `Regirock_SetGfx` (:1527). */
function Regirock_SetGfx(taskId: number): boolean { return _regiSetGfx(taskId, _regirockMap, _regirockPal); }

/** 1:1 `sAqua_Funcs` (:420). */
const sAqua_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  Aqua_Init, Aqua_SetGfx, PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear,
  FramesCountdown, PatternWeave_CircularMask,
];
/** 1:1 `sMagma_Funcs` (:430). */
const sMagma_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  Magma_Init, Magma_SetGfx, PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear,
  FramesCountdown, PatternWeave_CircularMask,
];
/** 1:1 `sRegice_Funcs` (:451). */
const sRegice_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  Regi_Init, Regice_SetGfx, PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear,
  PatternWeave_CircularMask,
];
/** 1:1 `sRegisteel_Funcs` (:462). */
const sRegisteel_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  Regi_Init, Registeel_SetGfx, PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear,
  PatternWeave_CircularMask,
];
/** 1:1 `sRegirock_Funcs` (:471). */
const sRegirock_Funcs: ReadonlyArray<(taskId: number) => boolean> = [
  Regi_Init, Regirock_SetGfx, PatternWeave_Blend1, PatternWeave_Blend2, PatternWeave_FinishAppear,
  PatternWeave_CircularMask,
];
/** 1:1 `Task_Aqua`/`Task_Magma`/`Task_Regi*` (:1345-1370). */
function Task_Aqua(taskId: number): void { while (sAqua_Funcs[gTasks[taskId].data[0]](taskId)); }
function Task_Magma(taskId: number): void { while (sMagma_Funcs[gTasks[taskId].data[0]](taskId)); }
function Task_Regice(taskId: number): void { while (sRegice_Funcs[gTasks[taskId].data[0]](taskId)); }
function Task_Registeel(taskId: number): void { while (sRegisteel_Funcs[gTasks[taskId].data[0]](taskId)); }
function Task_Regirock(taskId: number): void { while (sRegirock_Funcs[gTasks[taskId].data[0]](taskId)); }

// ─── Câblage sTasks_Main (lancés par Transition_StartMain via __battleTransitionCore) ─
sTasks_Main[ENUM_B_1.B_TRANSITION_AQUA] = Task_Aqua;
sTasks_Main[ENUM_B_1.B_TRANSITION_MAGMA] = Task_Magma;
sTasks_Main[ENUM_B_1.B_TRANSITION_REGICE] = Task_Regice;
sTasks_Main[ENUM_B_1.B_TRANSITION_REGISTEEL] = Task_Registeel;
sTasks_Main[ENUM_B_1.B_TRANSITION_REGIROCK] = Task_Regirock;
sTasks_Main[ENUM_B_1.B_TRANSITION_BIG_POKEBALL] = Task_BigPokeball;
sTasks_Main[ENUM_B_1.B_TRANSITION_CLOCKWISE_WIPE] = Task_ClockwiseWipe;
sTasks_Main[ENUM_B_1.B_TRANSITION_RIPPLE] = Task_Ripple;
sTasks_Main[ENUM_B_1.B_TRANSITION_GRID_SQUARES] = Task_GridSquares;
sTasks_Main[ENUM_B_1.B_TRANSITION_WHITE_BARS_FADE] = Task_WhiteBarsFade;

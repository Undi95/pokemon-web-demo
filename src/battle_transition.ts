/**
 * battle_transition.ts — MIROIR 1:1 de `src/battle_transition.c` (décomp pokeemeraude).
 *
 * Chapitre porté ici : **B_TRANSITION_POKEBALLS_TRAIL** (battle_transition.c:1766-1878)
 * — LA transition des combats dresseur normaux (sBattleTransitionTable_Trainer
 * [NORMAL][0], battle_setup.c) : 5 Poké Balls traversent l'écran en roulant,
 * chacune laissant une traînée NOIRE de 4 tiles de haut qui efface l'overworld.
 *
 * Données 1:1 :
 *   - sPokeballsTrail_StartXCoords {-16, 256} · Delays {0,32,64,18,48} · Speeds {8,-8} (:501-503)
 *   - SET_TILE : tilemap[y*32+x] = tile | (15 << 12) (palette BG 15)
 *   - ball 32×32 (gObjectEventBaseOam_32x32), rotation affine ±4/frame (:796-812)
 *
 * Assets décomp : public/decomp/em/battle_transitions/pokeball_trail.png (tile BG)
 * + pokeball.png (sprite, palette indexée embarquée = sFieldEffectPal_Pokeball).
 *
 * Intégration : start/tick consommés par le dispatcher de battle-decomp-loop
 * (_makeBattleStartTransitionCB2) comme Slice/WhiteBarsFade. Le reste du .c
 * (Slice/WhiteBars portés dans engine/battle/battle-transition.ts → à absorber
 * ici au déplacement miroir, condition C du goal).
 *
 * DETTES : FieldEffectStart/ActiveListContains remplacés par un compteur module
 * (_activeTrailBalls — le registre fldeff générique n'est pas porté) ; l'unité
 * de la rotation (±4/frame) à valider à l'œil (A/B user).
 */


import { CreateSprite } from './sprite';
import {
  getRuntime, BlendPalettes, PALETTES_ALL,
  gScanlineEffectRegBuffers, ScanlineEffect_Clear, ScanlineEffect_Stop,
} from '../harness/runtime/decomp-globals';
import { DestroySprite, AllocOamMatrix } from './sprite';
import {
  LoadSpritePalette as _sprLoadSpritePalette,
  IndexOfSpritePaletteTag as _sprIndexOfSpritePaletteTag,
} from './sprite';
import { loadIndexedPng } from '../harness/gba/png-loader';
import { Random } from './random';
import { MAX_SPRITES } from '../harness/runtime/decomp-runtime';
import {
  REG_OFFSET_WININ, REG_OFFSET_WINOUT, REG_OFFSET_WIN0V, REG_OFFSET_WIN0H,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDY,
  REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON,
} from '../harness/runtime/decomp-runtime';
import { DISPLAY_HEIGHT } from '../include/gba/defines';
// ── CHARPENTE 1:1 (foyer réel Task_BattleTransition) — imports additionnels ──
// Modules coeur/feuilles (task/palette/trig/gpu_regs/field_camera/field_weather) :
// battle_transition est un module lazy (side-effect import battle_controller_opponent
// :119), aucune arête de cycle vers lui → pas de bombe TDZ (vérifié find-import-cycle).
import { CreateTask, DestroyTask, gTasks } from './task';
import { FindTaskIdByFunc, gMain } from '../harness/runtime/decomp-globals';
import { TASK_NONE } from '../include/task';
import { Cos } from './trig';
import { BeginNormalPaletteFade, gPaletteFade } from './palette';
import { SetVBlankCallback } from './main';
import { SetGpuReg } from './gpu_regs';
import { EnableInterrupts } from '../harness/runtime/decomp-helpers';
import { REG_OFFSET_MOSAIC } from '../harness/runtime/decomp-runtime';
import { ENUM_B_1 } from '../include/battle_transition';
import { GetCameraOffsetWithPan } from './field_camera';
import { SetWeatherScreenFadeOut } from './field_weather';

/** SetSpriteRotScale via la surface __battleAnimMons (anti-cycle ESM : un import
 *  statique de battle_anim_mons depuis ce module → TDZ BG_SCREEN_SIZE au boot). */
function SetSpriteRotScale(spriteId: number, xScale: number, yScale: number, rotation: number): void {
  const m = (globalThis as Record<string, unknown>).__battleAnimMons as {
    SetSpriteRotScale?: (id: number, x: number, y: number, r: number) => void;
  } | undefined;
  m?.SetSpriteRotScale?.(spriteId, xScale, yScale, rotation);
}

// ─── Data 1:1 (battle_transition.c:500-503) ─────────────────────────────────
const NUM_POKEBALL_TRAILS = 5;
const DISPLAY_WIDTH = 240;
const sPokeballsTrail_StartXCoords: readonly number[] = [-16, DISPLAY_WIDTH + 16];
const sPokeballsTrail_Delays: readonly number[] = [0, 32, 64, 18, 48];
const sPokeballsTrail_Speeds: readonly number[] = [8, -8];

// ─── Assets (chargés une fois, par TAG décomp-like) ─────────────────────────
let _trailTile: Uint8Array | null = null;          // pokeball_trail.png (tiles 4bpp)
let _ballTiles: Uint8Array | null = null;          // pokeball.png 32x32 (16 tiles 4bpp)
let _ballPal: Uint16Array | null = null;           // palette indexée du png (= sFieldEffectPal_Pokeball)
let _assetsReady = false;
async function _ensureTrailAssets(): Promise<void> {
  if (_assetsReady) return;
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
  _assetsReady = true;
}

// ─── État runtime (= struct Task + active list fldeff) ──────────────────────
let _state = -1;                 // -1 inactif ; 0=Init, 1=Main, 2=End (tState 1:1)
let _activeTrailBalls = 0;       // = FieldEffectActiveListContains(FLDEFF_POKEBALL_TRAIL)
let _ballPalSlot = 15;           // slot palette OBJ chargé pour les balls
const OBJ_PAL_TAG_TRAIL = 0x4503; // FLDEFF_PAL_TAG_POKEBALL_TRAIL (tag libre côté OBJ)

/** Lance la transition (consommé par le dispatcher CB2). 1:1 Task_PokeballsTrail
 *  créée par sTasks_Main[B_TRANSITION_POKEBALLS_TRAIL]. */
export function startBattleTransitionPokeballsTrail(): void {
  _state = 0;
  _activeTrailBalls = 0;
  _initWaitFrames = 0;
  _ensureTrailAssets().catch((e) => console.warn('[battle_transition] assets PokeballsTrail KO', e));
}

/** 1:1 `PokeballsTrail_Init` (:1771-1783) : tileset BG0 ← sPokeballTrail_Tileset,
 *  tilemap BG0 ← 0, palette BG 15 ← sFieldEffectPal_Pokeball. */
let _initWaitFrames = 0;
function _pokeballsTrailInit(): boolean {
  if (!_assetsReady) {
    // (le CpuSet décomp est sync ; nos assets fetchent.) Garde-fou anti-soft-lock :
    // si le fetch échoue (asset manquant), fade noir direct après ~3 s + warn.
    if (++_initWaitFrames > 180) {
      console.warn('[battle_transition] PokeballsTrail : assets KO → fade direct (garde-fou)');
      _fadeScreenBlack();
      _state = -1;
    }
    return false;
  }
  const rt = getRuntime();
  const gba = (rt as unknown as { gba?: {
    bg: (n: number) => { vram: Uint8Array; tilemap: Uint16Array };
    palettes?: Uint16Array;
  } })?.gba;
  if (!rt || !gba) return false;
  const bg0 = gba.bg(0);
  // Tileset : tiles 0..1 au charBase courant (GetBg0TilesDst 1:1 — la vue vram
  // EST le charBase courant). CpuSet 0x20 u16 = 64 octets = 2 tiles 4bpp.
  if (_trailTile) bg0.vram.set(_trailTile.subarray(0, 64), 0);
  // Tilemap : fill 0 (CpuFill32 BG_SCREEN_SIZE).
  bg0.tilemap.fill(0);
  // Palette BG 15 ← palette du png (16 couleurs).
  const rtPal = (rt as unknown as { gPlttBufferFaded?: Uint16Array }).gPlttBufferFaded;
  if (rtPal && _ballPal) rtPal.set(_ballPal.subarray(0, 16), 15 * 16);
  _state = 1;
  return true;
}

/** 1:1 `PokeballsTrail_Main` (:1784-1808) : 5 FieldEffectStart(FLDEFF_POKEBALL_TRAIL),
 *  côté de départ aléatoire puis alterné. */
function _pokeballsTrailMain(): boolean {
  let side = Random() & 1;
  for (let i = 0; i < NUM_POKEBALL_TRAILS; i++, side ^= 1) {
    _fldEffPokeballTrail(
      sPokeballsTrail_StartXCoords[side],   // x
      i * 32 + 16,                          // y
      side,
      sPokeballsTrail_Delays[i],
    );
  }
  _state = 2;
  return true;
}

/** 1:1 `PokeballsTrail_End` (:1809-1818) : quand plus aucun fldeff actif →
 *  FadeScreenBlack + fin de task. */
function _pokeballsTrailEnd(): boolean {
  if (_activeTrailBalls === 0) {
    _fadeScreenBlack();
    _state = -1;
    return true;   // transition finie (contrat tick → true)
  }
  return false;
}

/** Tick par frame (contrat dispatcher : true = transition terminée, écran noir).
 *  Ticke aussi les SpriteCB des balls : pendant le CB2 de transition, AnimateSprites
 *  (décomp : appelé par le main loop) ne tourne pas chez nous — sans ça les balls
 *  ne bougent jamais (découvert à l'A/B : 123 frames actives, zéro traînée). */
export function tickBattleTransitionPokeballsTrail(): boolean {
  _tickTrailSprites();
  switch (_state) {
    case 0: _pokeballsTrailInit(); return false;
    case 1: _pokeballsTrailMain(); return false;
    case 2: return _pokeballsTrailEnd();
    default: return true;
  }
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

export function isBattleTransitionPokeballsTrailActive(): boolean { return _state >= 0; }

/** 1:1 `FadeScreenBlack()` (battle_transition.c:4109-4112) :
 *  BlendPalettes(PALETTES_ALL, 16, RGB_BLACK). */
function _fadeScreenBlack(): void {
  BlendPalettes(0xFFFFFFFF, 16, 0x0000);
}

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

// ═════════════════════════════════════════════════════════════════════════════
// ABSORPTION MIROIR (condition C, 1er déplacement — ex engine/battle/
// battle-transition.ts, 478 l.) : INTRO FLASH (CreateIntroTask/Task_Intro
// :3968-4030) + B_TRANSITION_SLICE (:2716-2830) + B_TRANSITION_WHITE_BARS_FADE
// (:3585-3754). Code identique au fichier absorbé (validé A/B sur des dizaines
// de combats) — seuls les imports ont été réécrits.
// ═════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `RGB(11, 11, 11)` (= gris du flash d'intro transition). */
const RGB_INTRO_GRAY = 11 | (11 << 5) | (11 << 10);  // = 0x2D6B

interface IntroFlashState {
  subState: 0 | 1;
  blend: number;
  numFades: number;
  lastFrame: number;
}
let _introFlash: IntroFlashState | null = null;

/** 1:1 décomp `struct TransitionData` (subset Slice). */
interface TransitionData {
  cameraX: number; cameraY: number;
  WININ: number; WINOUT: number; WIN0V: number;
  VBlank_DMA: boolean;
}
interface SliceState {
  state: number; effectX: number; speed: number; accel: number;
  data: TransitionData;
}
let _slice: SliceState | null = null;
let _hblankInstalled = false;
let _sliceLastFrame = -1;

/** 1:1 décomp `Slice_Init` (battle_transition.c:2728-2756). */
export function startBattleTransitionSlice(): void {
  ScanlineEffect_Clear();
  _sliceLastFrame = -1;
  const cameraX = 0, cameraY = 0;
  _slice = {
    state: 1, effectX: 0, speed: 1 << 8, accel: 1,
    data: { cameraX, cameraY, WININ: 0x3F, WINOUT: 0, WIN0V: DISPLAY_HEIGHT, VBlank_DMA: false },
  };
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[1][i] = cameraX;
    gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + i] = DISPLAY_WIDTH;
  }
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0V, DISPLAY_HEIGHT);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      const offset = gScanlineEffectRegBuffers[1][y];
      rt.gba.bg(1).config.hofs = offset;
      rt.gba.bg(2).config.hofs = offset;
      rt.gba.bg(3).config.hofs = offset;
      const win0h = gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + y];
      rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
      rt.gba.windows.win0.x2 = win0h & 0xFF;
    }
  });
  _hblankInstalled = true;
}

/** 1:1 décomp `CreateIntroTask(0, 0, 3, 2, 2)` — flash gris d'entrée. */
export function startBattleIntroFlash(): void {
  _introFlash = { subState: 0, blend: 0, numFades: 3, lastFrame: -1 };
}

/** 1:1 décomp `Task_BattleTransition_Intro` (:3987) — 3 cycles gris. */
export function tickBattleIntroFlash(): boolean {
  if (!_introFlash) return true;
  const f = _introFlash;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === f.lastFrame) return false;
  f.lastFrame = fc;
  if (f.subState === 0) {
    f.blend += 2;
    if (f.blend > 16) f.blend = 16;
    BlendPalettes(PALETTES_ALL, f.blend, RGB_INTRO_GRAY);
    if (f.blend >= 16) f.subState = 1;
  } else {
    f.blend -= 2;
    if (f.blend < 0) f.blend = 0;
    BlendPalettes(PALETTES_ALL, f.blend, RGB_INTRO_GRAY);
    if (f.blend === 0) {
      f.numFades -= 1;
      if (f.numFades === 0) { _introFlash = null; return true; }
      f.subState = 0;
    }
  }
  return false;
}

export function isBattleIntroFlashActive(): boolean { return _introFlash !== null; }

/** 1:1 décomp `Slice_Main` (battle_transition.c:2758-2795). */
export function tickBattleTransitionSlice(): boolean {
  if (!_slice) return true;
  if (_slice.state !== 1) return true;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === _sliceLastFrame) return false;
  _sliceLastFrame = fc;
  _slice.data.VBlank_DMA = false;
  _slice.effectX += _slice.speed >> 8;
  if (_slice.effectX > DISPLAY_WIDTH) _slice.effectX = DISPLAY_WIDTH;
  if (_slice.speed <= 0xFFF) _slice.speed += _slice.accel;
  if (_slice.accel < 128) _slice.accel <<= 1;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    if (i & 1) {
      gScanlineEffectRegBuffers[0][i] = _slice.data.cameraX + _slice.effectX;
      gScanlineEffectRegBuffers[0][DISPLAY_HEIGHT + i] = DISPLAY_WIDTH - _slice.effectX;
    } else {
      gScanlineEffectRegBuffers[0][i] = (_slice.data.cameraX - _slice.effectX) & 0xFFFF;
      gScanlineEffectRegBuffers[0][DISPLAY_HEIGHT + i] = ((_slice.effectX << 8) | (DISPLAY_WIDTH + 1)) & 0xFFFF;
    }
  }
  if (_slice.effectX >= DISPLAY_WIDTH) _slice.state = 2;
  _slice.data.VBlank_DMA = true;
  if (_slice.data.VBlank_DMA) {
    for (let i = 0; i < DISPLAY_HEIGHT * 2; i++) {
      gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
  }
  if (_slice.state === 2) {
    // 1:1 `Slice_End` (:2797-2803) : FadeScreenBlack INSTANT (coeff 16).
    BlendPalettes(PALETTES_ALL, 16, 0);
    stopBattleTransition();
    return true;
  }
  return false;
}

/** Cleanup Slice : HBlank off + reset offsets + WIN0 off. */
export function stopBattleTransition(): void {
  if (_hblankInstalled) {
    const rt = getRuntime();
    if (rt) {
      rt.gba.setHBlankCallback(null);
      rt.gba.bg(1).config.hofs = 0;
      rt.gba.bg(2).config.hofs = 0;
      rt.gba.bg(3).config.hofs = 0;
      rt.gba.windows.win0.x1 = 0;
      rt.gba.windows.win0.x2 = DISPLAY_WIDTH;
      rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) & ~DISPCNT_WIN0_ON);
    }
    _hblankInstalled = false;
  }
  ScanlineEffect_Stop();
  _slice = null;
}

export function isBattleTransitionActive(): boolean {
  return _slice !== null && _slice.state === 1;
}

// ─── B_TRANSITION_WHITE_BARS_FADE (battle_transition.c:3585-3754) ───────────

const RGB_WHITE_TR = 31 | (31 << 5) | (31 << 10);  // 0x7FFF
const NUM_WHITE_BARS = 8;
/** 1:1 `sWhiteBarsFade_StartDelays` (battle_transition.c:740). */
const WHITE_BARS_START_DELAYS = [0, 20, 15, 40, 10, 25, 35, 5];
const FADE_TARGET = 16 << 8;

interface WhiteBar {
  x: number; fade: number; finished: boolean; destroyed: boolean;
  destroyAttempts: number; delay: number; isMainSprite: boolean;
}
interface WhiteBarsState {
  state: number; counter: number; vblankDma: boolean; bldy: number; bars: WhiteBar[];
}
let _whiteBars: WhiteBarsState | null = null;
let _whiteBarsLastFrame = -1;

/** 1:1 `WhiteBarsFade_Init` (:3592) + `WhiteBarsFade_StartBars` (:3619). */
export function startBattleTransitionWhiteBarsFade(): void {
  ScanlineEffect_Clear();
  _whiteBarsLastFrame = -1;
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(REG_OFFSET_BLDCNT, 0xBF);
  rt.SetGpuReg(REG_OFFSET_BLDY, 0);
  rt.SetGpuReg(REG_OFFSET_WININ, 0x1E);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0x3F);
  rt.SetGpuReg(REG_OFFSET_WIN0V, DISPLAY_HEIGHT);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[1][i] = 0;
    gScanlineEffectRegBuffers[1][i + DISPLAY_HEIGHT] = DISPLAY_WIDTH;
  }
  const bars: WhiteBar[] = [];
  for (let i = 0; i < NUM_WHITE_BARS; i++) {
    bars.push({
      x: DISPLAY_WIDTH, fade: 0, finished: false, destroyed: false,
      destroyAttempts: 0, delay: WHITE_BARS_START_DELAYS[i], isMainSprite: i === NUM_WHITE_BARS - 1,
    });
  }
  _whiteBars = { state: 1, counter: 0, vblankDma: false, bldy: 0, bars };
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      rt.gba.blend.brightness = gScanlineEffectRegBuffers[1][y] & 0x1F;
      rt.gba.windows.win0.x1 = 0;
      rt.gba.windows.win0.x2 = gScanlineEffectRegBuffers[1][DISPLAY_HEIGHT + y] & 0xFF;
    }
  });
  _hblankInstalled = true;
}

/** 1:1 `sWhiteBarsFade_Funcs` state machine. */
export function tickBattleTransitionWhiteBarsFade(): boolean {
  if (!_whiteBars) return true;
  const w = _whiteBars;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === _whiteBarsLastFrame) return false;
  _whiteBarsLastFrame = fc;
  const rt = getRuntime();
  if (!rt) return true;
  const step = Math.floor(DISPLAY_HEIGHT / NUM_WHITE_BARS);  // 20

  if (w.state === 1) {
    w.vblankDma = false;
    for (let bi = 0; bi < w.bars.length; bi++) {
      const s = w.bars[bi];
      if (s.destroyed) continue;
      const baseY = bi * step;
      if (s.delay) { s.delay--; if (s.isMainSprite) w.vblankDma = true; continue; }
      for (let i = 0; i < step; i++) {
        gScanlineEffectRegBuffers[0][baseY + i] = s.fade >> 8;
        gScanlineEffectRegBuffers[0][baseY + i + DISPLAY_HEIGHT] = s.x & 0xFF;
      }
      if (s.x === 0 && s.fade === FADE_TARGET) s.finished = true;
      s.x -= 16;
      s.fade += FADE_TARGET / 32;
      if (s.x < 0) s.x = 0;
      if (s.fade > FADE_TARGET) s.fade = FADE_TARGET;
      if (s.isMainSprite) w.vblankDma = true;
      if (s.finished) {
        if (!s.isMainSprite || (w.counter >= NUM_WHITE_BARS - 1 && s.destroyAttempts++ > 7)) {
          w.counter++;
          s.destroyed = true;
        }
      }
    }
    if (w.vblankDma) {
      for (let i = 0; i < DISPLAY_HEIGHT * 2; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
    }
    if (w.counter >= NUM_WHITE_BARS) { BlendPalettes(PALETTES_ALL, 16, RGB_WHITE_TR); w.state = 2; }
    return false;
  }

  if (w.state === 2) {
    rt.gba.setHBlankCallback(null);
    _hblankInstalled = false;
    rt.SetGpuReg(REG_OFFSET_WIN0H, DISPLAY_WIDTH);
    rt.SetGpuReg(REG_OFFSET_BLDY, 0);
    rt.SetGpuReg(REG_OFFSET_BLDCNT, 0xFF);
    rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);
    w.bldy = 0;
    w.state = 3;
    return false;
  }

  w.bldy++;
  rt.SetGpuReg(REG_OFFSET_BLDY, w.bldy);
  if (w.bldy > 16) {
    BlendPalettes(PALETTES_ALL, 16, 0);
    stopBattleTransitionWhiteBarsFade();
    return true;
  }
  return false;
}

/** Cleanup WhiteBarsFade. */
export function stopBattleTransitionWhiteBarsFade(): void {
  const rt = getRuntime();
  if (rt) {
    rt.gba.setHBlankCallback(null);
    rt.gba.windows.win0.x1 = 0;
    rt.gba.windows.win0.x2 = DISPLAY_WIDTH;
    rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) & ~DISPCNT_WIN0_ON);
    rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
    rt.SetGpuReg(REG_OFFSET_BLDY, 0);
    rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);
  }
  _hblankInstalled = false;
  ScanlineEffect_Stop();
  _whiteBars = null;
}

export function isBattleTransitionWhiteBarsFadeActive(): boolean { return _whiteBars !== null; }

// ─── B_TRANSITION_ANGLED_WIPES (battle_transition.c:3829-3967) ───────────────
// 7 wipes diagonaux successifs : chaque scanline a un WIN0H (left<<8|right) qui
// se resserre le long d'une diagonale (algo BlackWipe = Bresenham, :4146-4239).
// La transition dresseur « ennemi plus fort » (sBattleTransitionTable_Trainer
// [NORMAL][1]).

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

interface AngledWipesState {
  state: number;     // 1=SetWipeData, 2=DoWipe, 3=TryEnd, 4=StartNext
  wipeId: number; dir: number; delay: number;
  vblankDma: boolean;
  wipe: BlackWipeData;
}
let _angledWipes: AngledWipesState | null = null;
let _angledWipesLastFrame = -1;

/** 1:1 `AngledWipes_Init` (:3834-3853) : buffers WIN0H pleins + WIN0 + HBlank. */
export function startBattleTransitionAngledWipes(): void {
  ScanlineEffect_Clear();
  _angledWipesLastFrame = -1;
  for (let i = 0; i < DISPLAY_HEIGHT; i++) {
    gScanlineEffectRegBuffers[0][i] = DISPLAY_WIDTH;
    gScanlineEffectRegBuffers[1][i] = DISPLAY_WIDTH;
  }
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 VBlankCB_AngledWipes : WININ_WIN0_ALL / WINOUT 0 / WIN0V plein +
  // WIN0H par-scanline depuis buf[1] (left<<8|right).
  rt.SetGpuReg(REG_OFFSET_WININ, 0x3F);
  rt.SetGpuReg(REG_OFFSET_WINOUT, 0);
  rt.SetGpuReg(REG_OFFSET_WIN0V, DISPLAY_HEIGHT);
  rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) | DISPCNT_WIN0_ON);
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      const win0h = gScanlineEffectRegBuffers[1][y];
      rt.gba.windows.win0.x1 = (win0h >> 8) & 0xFF;
      rt.gba.windows.win0.x2 = win0h & 0xFF;
    }
  });
  _hblankInstalled = true;
  _angledWipes = {
    state: 1, wipeId: 0, dir: 0, delay: 0, vblankDma: false,
    wipe: { startX: 0, startY: 0, currX: 0, currY: 0, endX: 0, endY: 0, xMove: 0, yMove: 0, xDist: 0, yDist: 0, temp: 0 },
  };
}

/** 1:1 `sAngledWipes_Funcs` state machine (SetWipeData/DoWipe/TryEnd/StartNext). */
export function tickBattleTransitionAngledWipes(): boolean {
  if (!_angledWipes) return true;
  const a = _angledWipes;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === _angledWipesLastFrame) return false;
  _angledWipesLastFrame = fc;

  // 1:1 Task_AngledWipes : while(funcs[state]()) — enchaîne les états TRUE.
  for (let guard = 0; guard < 8; guard++) {
    if (a.state === 1) {
      // SetWipeData (:3855-3867)
      const md = sAngledWipes_MoveData[a.wipeId];
      InitBlackWipe(a.wipe, md[0], md[1], md[2], md[3], 1, 1);
      a.dir = md[4];
      a.state = 2;
      continue;
    }
    if (a.state === 2) {
      // DoWipe (:3868-3907) : 16 pas de wipe par frame.
      a.vblankDma = false;
      let finished = false;
      for (let i = 0; i < 16; i++) {
        let r3 = gScanlineEffectRegBuffers[0][a.wipe.currY] >> 8;
        let r4 = gScanlineEffectRegBuffers[0][a.wipe.currY] & 0xFF;
        if (a.dir === 0) {
          if (r3 < a.wipe.currX) r3 = a.wipe.currX;
          if (r3 > r4) r3 = r4;
        } else {
          if (r4 > a.wipe.currX) r4 = a.wipe.currX;
          if (r4 <= r3) r4 = r3;
        }
        gScanlineEffectRegBuffers[0][a.wipe.currY] = (r4 | (r3 << 8)) & 0xFFFF;
        if (finished) { a.state = 3; break; }
        finished = UpdateBlackWipe(a.wipe, true, true);
      }
      a.vblankDma = true;
      // 1:1 VBlankCB : copy buf[0] → buf[1] (la moitié WIN0H = 160 entries).
      for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
      return false;   // (DoWipe retourne FALSE = 1 frame)
    }
    if (a.state === 3) {
      // TryEnd (:3908-3926)
      if (++a.wipeId < NUM_ANGLED_WIPES) {
        a.state = 4;
        a.delay = sAngledWipes_EndDelays[a.wipeId - 1];
        continue;
      }
      // Fin : FadeScreenBlack + cleanup.
      BlendPalettes(PALETTES_ALL, 16, 0);
      stopBattleTransitionAngledWipes();
      return true;
    }
    if (a.state === 4) {
      // StartNext (:3927-3938)
      if (--a.delay === 0) { a.state = 1; continue; }
      return false;
    }
  }
  return false;
}

/** Cleanup AngledWipes : HBlank off + WIN0 off. */
export function stopBattleTransitionAngledWipes(): void {
  const rt = getRuntime();
  if (rt) {
    rt.gba.setHBlankCallback(null);
    rt.gba.windows.win0.x1 = 0;
    rt.gba.windows.win0.x2 = DISPLAY_WIDTH;
    rt.SetGpuReg(REG_OFFSET_DISPCNT, rt.GetGpuReg(REG_OFFSET_DISPCNT) & ~DISPCNT_WIN0_ON);
  }
  _hblankInstalled = false;
  ScanlineEffect_Stop();
  _angledWipes = null;
}

export function isBattleTransitionAngledWipesActive(): boolean { return _angledWipes !== null; }

// ─── B_TRANSITION_BLUR (battle_transition.c:1136-1177) ──────────────────────
// Mosaïque croissante sur BG1-3 (REG_MOSAIC 0→14×17 par pas de 4 frames) +
// fade noir à mi-course. La transition wild « joueur plus fort » en zone FLASH
// et trainer FLASH (sBattleTransitionTable_*[FLASH][0]).

interface BlurState { delay: number; counter: number; state: number }
let _blur: BlurState | null = null;
let _blurLastFrame = -1;

/** 1:1 `Blur_Init` (:1141-1149) : MOSAIC=0 + BGCNT_MOSAIC sur BG1-3. */
export function startBattleTransitionBlur(): void {
  _blurLastFrame = -1;
  const rt = getRuntime();
  if (!rt) return;
  rt.SetGpuReg(0x04C /* REG_OFFSET_MOSAIC */, 0);
  // BGCNT_MOSAIC (bit 6) sur BG1-3 — notre runtime : bg(n).config.mosaic.
  for (const n of [1, 2, 3] as const) {
    (rt.gba.bg(n).config as { mosaic?: boolean }).mosaic = true;
  }
  _blur = { delay: 0, counter: 0, state: 1 };
}

/** 1:1 `Blur_Main` (:1151-1167) + `Blur_End` (:1169-1177). */
export function tickBattleTransitionBlur(): boolean {
  if (!_blur) return true;
  const b = _blur;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === _blurLastFrame) return false;
  _blurLastFrame = fc;
  const rt = getRuntime();
  if (!rt) return true;

  if (b.state === 1) {
    if (b.delay !== 0) { b.delay--; return false; }
    b.delay = 4;
    if (++b.counter === 10) {
      // 1:1 BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_BLACK).
      rt.BeginNormalPaletteFade(0xFFFFFFFF, -1, 0, 16, 0);
    }
    rt.SetGpuReg(0x04C /* REG_OFFSET_MOSAIC */, (b.counter & 15) * 17);
    if (b.counter > 14) b.state = 2;
    return false;
  }
  // Blur_End : attend la fin du fade.
  if (!rt.gPaletteFade.active) {
    stopBattleTransitionBlur();
    return true;
  }
  return false;
}

/** Cleanup Blur : mosaic off (le combat re-pose ses BGCNT). */
export function stopBattleTransitionBlur(): void {
  const rt = getRuntime();
  if (rt) {
    rt.SetGpuReg(0x04C /* REG_OFFSET_MOSAIC */, 0);
    for (const n of [1, 2, 3] as const) {
      (rt.gba.bg(n).config as { mosaic?: boolean }).mosaic = false;
    }
  }
  _blur = null;
}

export function isBattleTransitionBlurActive(): boolean { return _blur !== null; }

// Surface devtools/dispatcher (anti-cycle : battle-decomp-loop consomme lazy).
(globalThis as Record<string, unknown>).__battleTransitionMirror = {
  startBattleTransitionPokeballsTrail, tickBattleTransitionPokeballsTrail,
  isBattleTransitionPokeballsTrailActive,
  // Absorption miroir (ex engine/battle/battle-transition.ts) :
  startBattleIntroFlash, tickBattleIntroFlash, isBattleIntroFlashActive,
  startBattleTransitionSlice, tickBattleTransitionSlice, stopBattleTransition,
  isBattleTransitionActive,
  startBattleTransitionWhiteBarsFade, tickBattleTransitionWhiteBarsFade,
  stopBattleTransitionWhiteBarsFade, isBattleTransitionWhiteBarsFadeActive,
  startBattleTransitionAngledWipes, tickBattleTransitionAngledWipes,
  stopBattleTransitionAngledWipes, isBattleTransitionAngledWipesActive,
  startBattleTransitionBlur, tickBattleTransitionBlur,
  stopBattleTransitionBlur, isBattleTransitionBlurActive,
};

// ════════════════════════════════════════════════════════════════════════════
// SWIRL (2026-07-04, append-only) — B_TRANSITION_SWIRL (battle_transition.c:
// Swirl_Init:1181/Swirl_End:1197) : LA transition sauvage « ennemi plus fort »
// (sBattleTransitionTable_Wild[1]). Les BG ondulent en sinusoïde d'amplitude
// croissante pendant le fade noir. SetSinWave 1:1 (:4560).
// ════════════════════════════════════════════════════════════════════════════
import { Sin as _swSin } from './trig';

interface SwirlState { sinIndex: number; amplitude: number; blend: number; blendTimer: number; lastFrame: number }
let _swirl: SwirlState | null = null;

/** 1:1 `SetSinWave(array, sinAdd, index, indexIncrementer, amplitude, arrSize)`
 *  (battle_transition.c:4560). */
function _setSinWave(array: { [i: number]: number }, sinAdd: number, index: number, indexIncrementer: number, amplitude: number, arrSize: number): void {
  for (let i = 0; arrSize > 0; arrSize--, i++, index += indexIncrementer) {
    array[i] = sinAdd + _swSin(index & 0xFF, amplitude);
  }
}

/** 1:1 `Swirl_Init` (:1181) : fade noir (delay 4) + sinwave amplitude 0 +
 *  HBlank HOFS BG1-3 ← buffer[VCOUNT] (VBlankCB_Swirl copie buffers[0]→[1]). */
export function startBattleTransitionSwirl(): void {
  ScanlineEffect_Clear();
  _swirl = { sinIndex: 0, amplitude: 0, blend: 0, blendTimer: 0, lastFrame: -1 };
  _setSinWave(gScanlineEffectRegBuffers[1], 0 /* cameraX */, 0, 2, 0, DISPLAY_HEIGHT);
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      const offset = gScanlineEffectRegBuffers[1][y];
      rt.gba.bg(1).config.hofs = offset;
      rt.gba.bg(2).config.hofs = offset;
      rt.gba.bg(3).config.hofs = offset;
    }
  });
}

/** 1:1 `Swirl_End` (:1197) : sinIndex += 4, amplitude += 8, SetSinWave live ;
 *  fini quand le fade noir (BeginNormalPaletteFade ALL delay 4) atteint 16. */
export function tickBattleTransitionSwirl(): boolean {
  if (!_swirl) return true;
  const s = _swirl;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === s.lastFrame) return false;
  s.lastFrame = fc;
  s.sinIndex += 4;
  s.amplitude += 8;
  _setSinWave(gScanlineEffectRegBuffers[0], 0, s.sinIndex, 2, s.amplitude, DISPLAY_HEIGHT);
  // VBlankCB_Swirl : DmaCopy buffers[0] → buffers[1] (lu par le HBlank).
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  // BeginNormalPaletteFade(PALETTES_ALL, 4, 0, 16, RGB_BLACK) : +1 coeff / 5 frames.
  if (++s.blendTimer >= 5) {
    s.blendTimer = 0;
    s.blend++;
    BlendPalettes(PALETTES_ALL, Math.min(s.blend, 16), 0x0000);
  }
  if (s.blend >= 16) {
    stopBattleTransitionSwirl();
    return true;
  }
  return false;
}

export function stopBattleTransitionSwirl(): void {
  _swirl = null;
  const rt = getRuntime();
  if (rt) {
    rt.gba.setHBlankCallback(null);
    rt.gba.bg(1).config.hofs = 0;
    rt.gba.bg(2).config.hofs = 0;
    rt.gba.bg(3).config.hofs = 0;
  }
  ScanlineEffect_Stop();
}

Object.assign((globalThis as Record<string, unknown>).__battleTransitionMirror as Record<string, unknown>, {
  startBattleTransitionSwirl, tickBattleTransitionSwirl, stopBattleTransitionSwirl,
});

// ════════════════════════════════════════════════════════════════════════════
// SHUFFLE (2026-07-04, append-only) — B_TRANSITION_SHUFFLE (battle_transition.c
// Shuffle_Init/Shuffle_End) : LA transition sauvage GROTTE (sBattleTransition
// Table_Wild cave). Les lignes se secouent VERTICALEMENT (VOFS sinusoïdal par
// scanline, sinVal+=4224/ligne, amplitude+=384/frame Q8.8) pendant le fade noir.
// ════════════════════════════════════════════════════════════════════════════
interface ShuffleState { sinVal: number; amplitude: number; blend: number; blendTimer: number; lastFrame: number }
let _shuffle: ShuffleState | null = null;

/** 1:1 `Shuffle_Init` : fade noir delay 4 + buffers[1] ← cameraY(0) + HBlank VOFS. */
export function startBattleTransitionShuffle(): void {
  ScanlineEffect_Clear();
  _shuffle = { sinVal: 0, amplitude: 0, blend: 0, blendTimer: 0, lastFrame: -1 };
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = 0;
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.setHBlankCallback((y: number) => {
    if (y < DISPLAY_HEIGHT) {
      const v = gScanlineEffectRegBuffers[1][y];
      rt.gba.bg(1).config.vofs = v;
      rt.gba.bg(2).config.vofs = v;
      rt.gba.bg(3).config.vofs = v;
    }
  });
}

/** 1:1 `Shuffle_End` : sinVal += 4224 (frame ET par ligne), amplitude += 384 (Q8.8). */
export function tickBattleTransitionShuffle(): boolean {
  if (!_shuffle) return true;
  const s = _shuffle;
  const fc = getRuntime()?.gIntroFrameCounter ?? -1;
  if (fc === s.lastFrame) return false;
  s.lastFrame = fc;
  let sinVal = s.sinVal & 0xFFFF;
  const amplitude = (s.amplitude >> 8) & 0xFFFF;
  s.sinVal = (s.sinVal + 4224) & 0xFFFF;
  s.amplitude += 384;
  for (let i = 0; i < DISPLAY_HEIGHT; i++, sinVal = (sinVal + 4224) & 0xFFFF) {
    const sinIndex = (sinVal / 256) | 0;
    gScanlineEffectRegBuffers[0][i] = _swSin(sinIndex & 0xFF, amplitude);
  }
  for (let i = 0; i < DISPLAY_HEIGHT; i++) gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][i];
  if (++s.blendTimer >= 5) {
    s.blendTimer = 0;
    s.blend++;
    BlendPalettes(PALETTES_ALL, Math.min(s.blend, 16), 0x0000);
  }
  if (s.blend >= 16) {
    stopBattleTransitionShuffle();
    return true;
  }
  return false;
}

export function stopBattleTransitionShuffle(): void {
  _shuffle = null;
  const rt = getRuntime();
  if (rt) {
    rt.gba.setHBlankCallback(null);
    rt.gba.bg(1).config.vofs = 0;
    rt.gba.bg(2).config.vofs = 0;
    rt.gba.bg(3).config.vofs = 0;
  }
  ScanlineEffect_Stop();
}

Object.assign((globalThis as Record<string, unknown>).__battleTransitionMirror as Record<string, unknown>, {
  startBattleTransitionShuffle, tickBattleTransitionShuffle, stopBattleTransitionShuffle,
});

// ════════════════════════════════════════════════════════════════════════════
// ██ CHARPENTE 1:1 — foyer réel de battle_transition.c (2026-07-17, PHASE 1) ██
//
// Transcription ligne-à-ligne du COEUR du fichier décomp : la vraie machine à
// tâches (Task_BattleTransition), l'intro flash, les helpers communs, les tables
// sTasks_*/sTaskHandlers, et les Task_* des transitions du jeu solo courant.
//
// ⚠️ INERTE en phase 1 : ce foyer n'est PAS câblé dans battle-decomp-loop. Le
// chemin bespoke ci-dessus (startBattleTransitionX/tickBattleTransitionX consommés
// par _makeBattleStartTransitionCB2) reste le SEUL branché → zéro régression combat.
// Voir « POINT DE BASCULE » en fin de section pour la ligne à changer.
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

// ─── Surface pour le bascule (le foyer réel, INERTE tant que non câblé) ───────
// ██ POINT DE BASCULE ██ (à faire par la session principale, testé EN JEU) :
//   Dans src/engine/battle/battle-decomp-loop.ts :740, remplacer
//     getRuntime()?.SetMainCallback2?.(_makeBattleStartTransitionCB2(cb, transition));
//   par un CB2 réel qui : (1) appelle BattleTransition_StartOnField(transition)
//   [ou LaunchBattleTransitionTask], (2) tourne RunTasks()/AnimateSprites()/
//   BuildOamBuffer()/UpdatePaletteFade() par frame, (3) quand IsBattleTransitionDone()
//   → CleanupOverworld + SetMainCallback2(cb). Vérifier que le runtime invoque le
//   VBlank callback posé par SetVBlankCallback (sinon router la copie buffers[0]→[1]
//   dans le tick). Le bloc bespoke ci-dessus reste le fallback jusqu'à validation A/B.
(globalThis as Record<string, unknown>).__battleTransitionCore = {
  BattleTransition_Start, BattleTransition_StartOnField, IsBattleTransitionDone,
  // (LaunchBattleTransitionTask/Task_BattleTransition/sTasks_Main internes.)
};

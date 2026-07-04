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

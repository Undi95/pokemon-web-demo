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

import { getRuntime, BlendPalettes } from '../engine/system/decomp-globals';
import { loadIndexedPng } from '../engine/gba/png-loader';
import { Random } from '../engine/system/random';

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
  const ball = await loadIndexedPng('/decomp/em/battle_transitions/pokeball.png');
  _trailTile = trail.charData;
  _ballTiles = ball.charData;
  _ballPal = ball.palette ?? null;
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
  for (const spr of (rt.gSprites as unknown as Map<number, TrailSprite & { name?: string }>).values()) {
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
  // Palette OBJ par TAG (pattern LoadSpritePalette : idempotent).
  const r = rt as unknown as {
    LoadSpritePalette?: (p: { data: Uint16Array; tag: number }) => number;
    IndexOfSpritePaletteTag?: (t: number) => number;
    CreateSpriteInline?: (tpl: unknown, x: number, y: number, sub?: number) => number;
    AllocOamMatrix?: () => number;
    gSprites?: Map<number, TrailSprite>;
  };
  let pal = r.IndexOfSpritePaletteTag?.(OBJ_PAL_TAG_TRAIL) ?? 0xFF;
  if (pal === 0xFF && _ballPal && r.LoadSpritePalette) {
    pal = r.LoadSpritePalette({ data: _ballPal, tag: OBJ_PAL_TAG_TRAIL });
  }
  if (pal === 0xFF || pal === undefined) pal = _ballPalSlot;
  _ballPalSlot = pal;
  const matrix = r.AllocOamMatrix?.() ?? 0;
  const spriteId = r.CreateSpriteInline?.({
    name: 'FldEffPokeballTrail',
    images: [{ data: _ballTiles, size: _ballTiles.length }],
    oam: { shape: 0, size: 2 /* 32x32 */, priority: 0, paletteNum: pal, affineMode: 1, affineParamIndex: matrix },
    callback: SpriteCB_FldEffPokeballTrail,
  } as never, x, y, 0) ?? -1;
  if (spriteId < 0) return;
  const spr = r.gSprites?.get(spriteId);
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
      if (rt && id >= 0) rt.DestroySprite(id);
      sprite.inUse = false;
      sprite.callback = null;
      _activeTrailBalls--;
    }
  }
}

function _findSpriteId(sprite: TrailSprite): number {
  const rt = getRuntime();
  if (!rt?.gSprites) return -1;
  for (const [id, s] of (rt.gSprites as unknown as Map<number, TrailSprite>).entries()) {
    if (s === sprite) return id;
  }
  return -1;
}

// Surface devtools/dispatcher (anti-cycle : battle-decomp-loop consomme lazy).
(globalThis as Record<string, unknown>).__battleTransitionMirror = {
  startBattleTransitionPokeballsTrail, tickBattleTransitionPokeballsTrail,
  isBattleTransitionPokeballsTrailActive,
};

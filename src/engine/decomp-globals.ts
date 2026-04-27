/**
 * decomp-globals.ts — helpers globaux mimés depuis le décomp Pokemon Emerald.
 *
 * Le code transpilé `intro-callbacks-auto.ts` utilise des symbols à scope GLOBAL
 * (= équivalent C des fonctions extern) : `LoadPalette`, `LZ77UnCompVram`,
 * `DmaClear16`, `CpuFill16`, etc. Ces symbols pointent vers le DecompRuntime
 * singleton actif (= notre engine GBA + cache asset).
 *
 * USAGE :
 *   - GameScene.create() :
 *       setGlobalRuntime(this.rt);
 *       await preloadIntroAssets();   // populate assetCache
 *       this.rt.CreateTask(Task_Scene1_Load, 0);
 *   - intro-callbacks-auto.ts :
 *       import { LoadPalette, LZ77UnCompVram, DmaClear16, ... } from '../../../decomp-globals';
 *
 * ASSET CACHE : les LZ77UnCompVram/LoadPalette du décomp sont synchrones
 * (data en ROM). Notre engine = data dans des PNGs/binaires fetchés async.
 * Solution : preload async de tous les assets nécessaires AVANT de lancer la
 * Task qui les utilise. Pendant l'exécution, les helpers font lookup-cache + write sync.
 *
 * 1:1 décomp src/decompress.c (LZ77UnCompVram), src/palette.c (LoadPalette),
 * include/gba/macro.h (DmaClear16 macro), src/main.c (CpuFill16/32).
 */
import type { DecompRuntime } from './decomp-runtime';
import { BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR } from './decomp-runtime';

// ─── Singleton runtime + asset cache ──────────────────────────────────────────

let _rt: DecompRuntime | null = null;

/** Set le runtime actif. À call dans GameScene.create() AVANT toute Task. */
export function setGlobalRuntime(rt: DecompRuntime): void {
  _rt = rt;
}

/** Récupère le runtime actif. Throw si pas init (= bug : on a oublié setGlobalRuntime). */
function rt(): DecompRuntime {
  if (!_rt) throw new Error('decomp-globals: runtime not set, call setGlobalRuntime() first');
  return _rt;
}

/** Cache asset preloaded : symbol décomp (e.g. 'sIntro1Bg_Gfx') → data buffer typed.
 *  Populé par intro-asset-loader avant de lancer les Tasks. Les helpers
 *  LZ77UnCompVram/LoadPalette font lookup ici. */
export const assetCache = new Map<string, Uint8Array | Uint16Array>();

/** Récupère un asset depuis le cache, throw si manquant (= preload incomplet). */
function getAsset(symbol: string): Uint8Array | Uint16Array {
  const data = assetCache.get(symbol);
  if (!data) throw new Error(`decomp-globals: asset '${symbol}' not in cache (forgot to preload?)`);
  return data;
}

// ─── BG/VRAM constants (1:1 décomp include/gba/types.h + io_reg.h) ────────────
/** 1:1 décomp BG_SCREEN_SIZE = 0x800 bytes (= 1024 entries u16). */
export const BG_SCREEN_SIZE = 0x800;
/** 1:1 décomp PLTT_SIZE = 0x400 bytes (= 256 colors × 2). */
export const PLTT_SIZE = 0x400;
/** 1:1 décomp VRAM_SIZE = 0x18000 bytes. */
export const VRAM_SIZE = 0x18000;

// ─── Constants utilisées par intro-callbacks-auto sans être importées ─────────
// (résolues par le constant resolver du transpileur, mais redéclarées ici pour
//  cohérence + accès direct par decomp-globals.ts)
export const PALETTES_ALL = 0xFFFFFFFF;

// ─── Re-export pour que intro-callbacks-auto puisse importer en bloc ──────────
export { BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR };

// ─── State machine intro globals (1:1 décomp EWRAM_DATA src/intro.c) ──────────
/** EWRAM_DATA u16 sIntroCharacterGender — set par Task_Scene1_Load via Random()%GENDER_COUNT. */
export let sIntroCharacterGender = 0;
export function setIntroCharacterGender(v: number): void { sIntroCharacterGender = v; }

/** EWRAM_DATA u16 sFlygonYOffset — utilisé par SpriteCB_FlygonSilhouette. */
export let sFlygonYOffset = 0;
export function setFlygonYOffset(v: number): void { sFlygonYOffset = v; }

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS GLOBAUX (= équivalents fonctions extern décomp)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `LZ77UnCompVram(src, dest)` — décompresse un blob LZ77 dans VRAM.
 *  Notre version : src est le SYMBOL décomp (e.g. sIntro1Bg_Gfx) → lookup cache.
 *  dest est l'address VRAM absolue (BG_CHAR_ADDR(n) ou BG_SCREEN_ADDR(n)).
 *
 *  Sémantique GBA : VRAM = 0x06000000-0x06017FFF. Les 4 BG charBase et 32 screenBase
 *  partagent cet espace. On dispatch :
 *    - addr 0x00000-0x0FFFF → bg.vram (charBase 0-3, chars indexed)
 *    - addr 0x10000-0x17FFF → bg.tilemap (screenBase 0-31)
 *    - mais en pratique, addr ≤ 0x4000 = char data BG, ≥ 0x4000 = screen data
 *
 *  Notre routing simplifié : on assume que dest indique le bg index via
 *  l'adresse calculée. BG_CHAR_ADDR(n) = n*0x4000 → BG n, charBase = n*4.
 *  BG_SCREEN_ADDR(n) = n*0x800 → screen n. */
export function LZ77UnCompVram(srcSymbol: string, destAddr: number): void {
  const data = getAsset(srcSymbol);
  const r = rt();
  // Détecte si c'est char data (addr < 0x10000) ou tilemap (addr >= 0x10000)
  // BG_CHAR_ADDR(n) = n*0x4000 (n=0..3) → addr 0x0000/0x4000/0x8000/0xC000
  // BG_SCREEN_ADDR(n) = n*0x800 (n=0..31) → addr 0x0000/0x0800/.../0xF800
  // Ambiguïté : addr 0x0000 peut être char OR screen 0. Convention décomp :
  // tilemaps écrits dans screenBase ≥ 16 (= addr ≥ 0x8000). En pratique :
  //   - sIntro1Bg_Gfx → BG_CHAR_ADDR(0) = 0x0000 (char data)
  //   - sIntro1Bg0_Tilemap → BG_CHAR_ADDR(2) = 0x8000 (tilemap, screenBase 16)
  //   - sIntro1Bg1_Tilemap → BG_SCREEN_ADDR(18) = 0x9000 (tilemap, screenBase 18)
  //   - etc.
  // On regarde le symbol pour décider :
  if (srcSymbol.endsWith('_Gfx') || srcSymbol.includes('_Tileset') || srcSymbol.includes('_Tiles')) {
    // Char data → écrire dans bg(0).vram (toutes les BG charBase pointent au même offset 0)
    // Notre engine : chaque bg(n) a son propre vram ; pour mode shared, on
    // écrit dans bg(0).vram et les autres BG l'utilisent via charBase.
    const bytes = data instanceof Uint16Array ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : data;
    const vram = r.gba.bg(0).vram;
    const copySize = Math.min(bytes.length, vram.length);
    vram.set(bytes.subarray(0, copySize));
  } else if (srcSymbol.endsWith('_Tilemap') || srcSymbol.endsWith('_Map')) {
    // Tilemap → dispatch vers le BG correspondant via destAddr.
    // BG_SCREEN_ADDR(n) = n*0x800. screenBase 16/18/20/22 = BG0/1/2/3 default.
    const screenBase = Math.floor(destAddr / 0x800);
    let bgIdx: 0 | 1 | 2 | 3 = 0;
    if (screenBase === 16) bgIdx = 0;       // BG0 default
    else if (screenBase === 18) bgIdx = 1;  // BG1
    else if (screenBase === 20) bgIdx = 2;  // BG2
    else if (screenBase === 22) bgIdx = 3;  // BG3
    else {
      // Fallback : on log et on no-op
      console.warn(`[LZ77UnCompVram] unknown screenBase ${screenBase} for ${srcSymbol}, dest=0x${destAddr.toString(16)}`);
      return;
    }
    // Tilemap raw bytes → pour bg.tilemap (Uint16Array), on copy aligné u16
    const tilemap = r.gba.bg(bgIdx).tilemap;
    if (data instanceof Uint16Array) {
      tilemap.set(data.subarray(0, tilemap.length));
    } else {
      // data Uint8Array → reinterpret as u16
      const u16 = new Uint16Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 2));
      tilemap.set(u16.subarray(0, tilemap.length));
    }
  } else {
    console.warn(`[LZ77UnCompVram] symbol ${srcSymbol}: cannot infer char/tilemap routing, no-op`);
  }
}

/** 1:1 décomp `LoadPalette(src, offset, size)` — copy palette dans gPlttBufferFaded.
 *  src = SYMBOL décomp (e.g. sIntro1Bg_Pal) → lookup cache.
 *  offset = flat palette index (BG_PLTT_ID(n) = n*16 ou OBJ_PLTT_ID(n) = n*16 + 256).
 *  size = bytes (= entries × 2). */
export function LoadPalette(srcSymbol: string | Uint16Array, offset: number, sizeBytes: number): void {
  const data = typeof srcSymbol === 'string' ? getAsset(srcSymbol) : srcSymbol;
  const u16 = data instanceof Uint16Array ? data : new Uint16Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 2));
  const numEntries = Math.floor(sizeBytes / 2);
  const r = rt();
  // offset < 256 = BG palette, ≥ 256 = OBJ palette
  if (offset < 256) {
    r.gba.palette.loadBgRange(offset, u16.subarray(0, numEntries));
  } else {
    r.gba.palette.loadObjRange(offset - 256, u16.subarray(0, numEntries));
  }
}

/** 1:1 décomp `DmaClear16(channel, dest, size)` — clear memory via DMA.
 *  Notre version : ignore le channel, clear sync. dest = address VRAM/PLTT.
 *  size = bytes. */
export function DmaClear16(_channel: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  // Si dest ∈ tilemap range (BG_SCREEN_ADDR), clear le bg.tilemap correspondant
  const screenBase = Math.floor(destAddr / 0x800);
  if (screenBase >= 16 && screenBase <= 31) {
    let bgIdx: 0 | 1 | 2 | 3 = 0;
    if (screenBase === 17 || screenBase === 16) bgIdx = 0;
    else if (screenBase === 19 || screenBase === 18) bgIdx = 1;
    else if (screenBase === 21 || screenBase === 20) bgIdx = 2;
    else if (screenBase === 23 || screenBase === 22) bgIdx = 3;
    const tilemap = r.gba.bg(bgIdx).tilemap;
    const numEntries = Math.min(Math.floor(sizeBytes / 2), tilemap.length);
    tilemap.fill(0, 0, numEntries);
  }
  // Sinon (PLTT clear etc.) : no-op pour l'instant, on étendra au besoin
}

/** 1:1 décomp `CpuFill16(value, dest, size)` — fill 16-bit. */
export function CpuFill16(_value: number, _destAddr: number, _sizeBytes: number): void {
  // Notre engine : pas d'address-based memory model, on no-op pour l'instant
}

/** 1:1 décomp `CpuFill32(value, dest, size)` — fill 32-bit. */
export function CpuFill32(_value: number, _destAddr: number, _sizeBytes: number): void {
  // Idem CpuFill16
}

/** 1:1 décomp `LoadCompressedSpriteSheet(sheet)` — charge un sprite sheet
 *  individuel dans objVram. `sheet` = struct {data, size, tag}.
 *  Notre version : preload via assetCache, copy sync. */
export function LoadCompressedSpriteSheet(sheet: { data: string, size: number, tag: string | number }): void {
  // tag = unique ID, on l'enregistre comme tileTag pour CreateSpriteFromTemplate
  const r = rt();
  // data = symbol décomp (e.g. 'sIntroDropsLogo_Gfx')
  const charData = getAsset(sheet.data);
  const bytes = charData instanceof Uint16Array
    ? new Uint8Array(charData.buffer, charData.byteOffset, charData.byteLength)
    : charData;
  // Auto-allocate dans objVram via le runtime
  // On utilise une convention simplifiée : on append à objVram + record tag → tileStart
  const tagStr = String(sheet.tag);
  // Vérifier si déjà chargé
  if (r.spriteSheetTagToTileStart.has(tagStr)) return;
  // Find next free byte offset (track manually)
  const tileStart = (_nextSpriteSheetByteOffset >> 5);
  const copySize = Math.min(bytes.length, r.gba.objVram.length - _nextSpriteSheetByteOffset);
  if (copySize > 0) r.gba.objVram.set(bytes.subarray(0, copySize), _nextSpriteSheetByteOffset);
  r.spriteSheetTagToTileStart.set(tagStr, tileStart);
  _nextSpriteSheetByteOffset += copySize;
}
let _nextSpriteSheetByteOffset = 0;

/** 1:1 décomp `LoadSpritePalettes(palettes[])` — charge une table de palettes OBJ. */
export function LoadSpritePalettes(palettes: Array<{ data: string, tag: string | number }>): void {
  const r = rt();
  for (const p of palettes) {
    const tagStr = String(p.tag);
    if (r.paletteTagToSlot.has(tagStr)) continue;
    const palData = getAsset(p.data);
    const u16 = palData instanceof Uint16Array
      ? palData
      : new Uint16Array(palData.buffer, palData.byteOffset, Math.floor(palData.byteLength / 2));
    const slot = _nextObjPalSlot++;
    r.gba.palette.loadObjRange(slot * 16, u16.subarray(0, 16));
    r.paletteTagToSlot.set(tagStr, slot);
  }
}
let _nextObjPalSlot = 0;

/** Reset des allocations OBJ slots (à call entre 2 scènes). */
export function resetObjAllocations(): void {
  _nextSpriteSheetByteOffset = 0;
  _nextObjPalSlot = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYMBOL NAMES (self-reference strings) — pour que le code transcrit puisse écrire
// `LZ77UnCompVram(sIntro1Bg_Gfx, ...)` sans ReferenceError. Le symbol = sa propre
// string key vers assetCache. 1:1 sémantique : dans le décomp `sIntro1Bg_Gfx` est
// un pointeur vers les data ROM ; chez nous c'est juste une key vers le cache.
// ═══════════════════════════════════════════════════════════════════════════════

// Scene 1 BG layers
export const sIntro1Bg_Gfx = 'sIntro1Bg_Gfx';
export const sIntro1Bg_Pal = 'sIntro1Bg_Pal';
export const sIntro1Bg0_Tilemap = 'sIntro1Bg0_Tilemap';
export const sIntro1Bg1_Tilemap = 'sIntro1Bg1_Tilemap';
export const sIntro1Bg2_Tilemap = 'sIntro1Bg2_Tilemap';
export const sIntro1Bg3_Tilemap = 'sIntro1Bg3_Tilemap';
// Scene 1 sprite sheets + palettes
export const sIntroDropsLogo_Gfx = 'sIntroDropsLogo_Gfx';
export const sIntroDrops_Pal = 'sIntroDrops_Pal';
export const sIntroLogo_Pal = 'sIntroLogo_Pal';
export const sIntroFlygonSilhouette_Pal = 'sIntroFlygonSilhouette_Pal';
// Scene 1 g-prefixed externs (graphics.c décomp)
export const gIntroSparkle_Gfx = 'gIntroSparkle_Gfx';
export const gIntroFlygonSilhouette_Gfx = 'gIntroFlygonSilhouette_Gfx';
export const gIntroGameFreakTextFade_Pal = 'gIntroGameFreakTextFade_Pal';

// Scene 2 sprites (à preload pour Phase 0c+)
export const gIntroBrendan_Gfx = 'gIntroBrendan_Gfx';
export const gIntroMay_Gfx = 'gIntroMay_Gfx';
export const gIntroBicycle_Gfx = 'gIntroBicycle_Gfx';
export const gIntroFlygon_Gfx = 'gIntroFlygon_Gfx';
export const gIntroVolbeat_Gfx = 'gIntroVolbeat_Gfx';
export const gIntroTorchic_Gfx = 'gIntroTorchic_Gfx';
export const gIntroManectric_Gfx = 'gIntroManectric_Gfx';
export const gIntroVolbeat_Pal = 'gIntroVolbeat_Pal';
export const gIntroTorchic_Pal = 'gIntroTorchic_Pal';
export const gIntroManectric_Pal = 'gIntroManectric_Pal';

// Scene 3 (Phase 0d+)
export const sIntroPokeball_Pal = 'sIntroPokeball_Pal';
export const sIntroPokeball_Tilemap = 'sIntroPokeball_Tilemap';
export const sIntroPokeball_Gfx = 'sIntroPokeball_Gfx';
export const sIntroStreaks_Pal = 'sIntroStreaks_Pal';
export const sIntroStreaks_Gfx = 'sIntroStreaks_Gfx';
export const sIntroStreaks_Tilemap = 'sIntroStreaks_Tilemap';
export const sIntroRayquzaOrb_Pal = 'sIntroRayquzaOrb_Pal';
export const sIntroMisc_Pal = 'sIntroMisc_Pal';
export const sIntroMisc_Gfx = 'sIntroMisc_Gfx';
export const sIntroLati_Gfx = 'sIntroLati_Gfx';
export const gIntroLightning_Gfx = 'gIntroLightning_Gfx';
export const gIntroLightning_Pal = 'gIntroLightning_Pal';
export const gIntroBubbles_Gfx = 'gIntroBubbles_Gfx';
export const gIntroBubbles_Pal = 'gIntroBubbles_Pal';

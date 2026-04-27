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

/** Public getter pour le runtime (utilisé par les helpers transcrits dans
 *  intro-callbacks-auto.ts qui n'ont plus `rt` en premier arg). */
export function getRuntime(): DecompRuntime {
  return rt();
}

/** Cache asset preloaded : symbol décomp (e.g. 'sIntro1Bg_Gfx') → data buffer typed.
 *  Populé par intro-asset-loader avant de lancer les Tasks. Les helpers
 *  LZ77UnCompVram/LoadPalette font lookup ici. */
export const assetCache = new Map<string, Uint8Array | Uint16Array>();

/** Compteur LZ77UnCompVram pour debug : combien de fois chaque symbol a été appelé,
 *  combien d'entries ont été copiées, vers quel bgIdx. Inspectable via window.debug. */
export const lz77Trace: Array<{ symbol: string; dest: number; dataLen: number; bgIdx?: number; copied?: number; reason?: string }> = [];

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

// ─── Re-export complet decomp-runtime pour import en bloc côté bodyC ─────────
// Tous les REG_OFFSET_*, BGCNT_*, DISPCNT_*, BLDCNT_*, BG_PLTT_ID, etc.
// utilisés par les Tasks transcrites depuis le décomp.
export {
  BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR,
  DISPLAY_WIDTH, DISPLAY_HEIGHT,
  // REG_OFFSET_* (1:1 décomp include/gba/io_reg.h)
  REG_OFFSET_DISPCNT,
  REG_OFFSET_BG0CNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT,
  REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN1H, REG_OFFSET_WIN0V, REG_OFFSET_WIN1V,
  REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA, REG_OFFSET_BLDY,
  // BGCNT_*
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE,
  BGCNT_16COLOR, BGCNT_256COLOR,
  BGCNT_TXT256x256, BGCNT_TXT512x256, BGCNT_TXT256x512, BGCNT_TXT512x512,
  BGCNT_AFF128x128, BGCNT_AFF256x256, BGCNT_AFF512x512, BGCNT_AFF1024x1024,
  // DISPCNT_*
  DISPCNT_MODE_0, DISPCNT_MODE_1, DISPCNT_MODE_2,
  DISPCNT_OBJ_1D_MAP,
  DISPCNT_BG0_ON, DISPCNT_BG1_ON, DISPCNT_BG2_ON, DISPCNT_BG3_ON,
  DISPCNT_OBJ_ON, DISPCNT_WIN0_ON, DISPCNT_BG_ALL_ON,
  // BLDCNT_*
  BLDCNT_TGT1_BG0, BLDCNT_TGT1_BG1, BLDCNT_TGT1_BG2, BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ, BLDCNT_TGT1_BD,
  BLDCNT_EFFECT_NONE, BLDCNT_EFFECT_BLEND, BLDCNT_EFFECT_LIGHTEN, BLDCNT_EFFECT_DARKEN,
  BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ, BLDCNT_TGT2_BD,
} from './decomp-runtime';

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
  const traceEntry: { symbol: string; dest: number; dataLen: number; copied?: number; reason?: string } = {
    symbol: srcSymbol, dest: destAddr, dataLen: data.byteLength,
  };
  lz77Trace.push(traceEntry);
  // 1:1 GBA hardware : VRAM est UN tableau partagé 96KB (0x06000000-0x06017FFF).
  // BG_CHAR_ADDR(n) = n*0x4000, BG_SCREEN_ADDR(n) = n*0x800 sont des offsets
  // dans cette VRAM unifiée. Chez nous (Phase 1 Action 2), `r.gba.vram` EST cette
  // VRAM unifiée. On écrit directement à `destAddr` modulo VRAM_SIZE.
  //
  // BG charBase et mapBase pointent dans cette même VRAM ; les BGs avec mêmes
  // charBase/mapBase voient les mêmes data automatiquement (= 1:1 hardware
  // shared addressing). Plus aucun routage par suffix de symbol.
  const bytes = data instanceof Uint16Array
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : data;
  const vram = r.gba.vram;
  // VRAM = 96KB = 0x18000. C'est PAS une power-of-2 → utiliser modulo, PAS un
  // AND mask (le AND mask suppose power-of-2, sinon `0x8000 & 0x17FFF = 0`).
  const offset = destAddr % vram.byteLength;
  const copySize = Math.min(bytes.length, vram.byteLength - offset);
  if (copySize > 0) {
    vram.set(bytes.subarray(0, copySize), offset);
    traceEntry.copied = copySize;
    traceEntry.reason = `vram[0x${offset.toString(16)}..0x${(offset + copySize).toString(16)}]`;
  } else {
    traceEntry.reason = `dest 0x${offset.toString(16)} out of VRAM range, no-op`;
  }
}

/** 1:1 décomp `LoadPalette(src, offset, size)` — copy palette dans gPlttBufferFaded.
 *  src = SYMBOL décomp string (e.g. sIntro1Bg_Pal) → lookup cache.
 *  offset = flat palette index (BG_PLTT_ID(n) = n*16 ou OBJ_PLTT_ID(n) = n*16 + 256).
 *  sizeBytes : IGNORÉ quand srcSymbol est une string (le bodyC transcrit a un bug
 *  `(symbol)?.length` qui retourne la longueur de la STRING name au lieu du
 *  sizeof(buffer) attendu). On utilise toujours la vraie taille du buffer cache. */
export function LoadPalette(srcSymbol: string | Uint16Array, offset: number, sizeBytes: number): void {
  const data = typeof srcSymbol === 'string' ? getAsset(srcSymbol) : srcSymbol;
  const u16 = data instanceof Uint16Array ? data : new Uint16Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 2));
  // Si srcSymbol est une string : on ignore sizeBytes (artefact du transpileur)
  // et on utilise la vraie taille du buffer cache.
  const numEntries = typeof srcSymbol === 'string'
    ? u16.length
    : Math.floor(sizeBytes / 2);
  const r = rt();
  // offset < 256 = BG palette, ≥ 256 = OBJ palette
  if (offset < 256) {
    r.gba.palette.loadBgRange(offset, u16.subarray(0, numEntries));
  } else {
    r.gba.palette.loadObjRange(offset - 256, u16.subarray(0, numEntries));
  }
}

/** 1:1 décomp `DmaClear16(channel, dest, size)` — clear memory via DMA.
 *
 *  Phase 1 Action 2 : maintenant que VRAM est unifié (rt.gba.vram 96KB), on
 *  peut clear directement à `destAddr`. Plus de risque d'écraser le tilemap
 *  qu'on vient de remplir (ancien bug 0b avec vram séparés par BG).
 *
 *  Sémantique : DMA clear = écrire 0 dans `[destAddr..destAddr+sizeBytes]`. */
export function DmaClear16(_channel: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  const vram = r.gba.vram;
  const offset = destAddr & (vram.byteLength - 1);
  const clearSize = Math.min(sizeBytes, vram.byteLength - offset);
  if (clearSize > 0) {
    vram.fill(0, offset, offset + clearSize);
  }
}

/** 1:1 décomp `CpuFill16(value, dest, size)` — fill 16-bit. */
export function CpuFill16(_value: number, _destAddr: number, _sizeBytes: number): void {
  // Notre engine : pas d'address-based memory model, on no-op pour l'instant
}

/** 1:1 décomp `CpuFill32(value, dest, size)` — fill 32-bit. */
export function CpuFill32(_value: number, _destAddr: number, _sizeBytes: number): void {
  // Idem CpuFill16
}

/** 1:1 décomp `LoadIntroPart2Graphics(scenery)` — Phase 0b stub no-op.
 *  Le décomp charge BG2 + tilemap pour Scene 2. Pour l'instant on no-op,
 *  Scene 2 BG sera juste vide (sprites only). */
export function LoadIntroPart2Graphics(_scenery: number): void {
  // TODO Phase 0c : implementer chargement Scene 2 assets (BG bike road parallax)
}

/** 1:1 décomp `FreeAllSpritePalettes` — Phase 0b stub no-op. */
export function FreeAllSpritePalettes(): void {
  // TODO Phase 0c : reset paletteTagToSlot mapping
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 STUBS (Phase 0b minimum viable — no-op pour ne pas crasher)
// TODO Phase 0c : implementer 1:1 décomp src/intro.c
// ═══════════════════════════════════════════════════════════════════════════════

/** Stub : data sheets avec .length=N pour les boucles. Le bodyC fait
 *  `for (i=0; i < (sSpriteSheet_RunningPokemon)?.length - 1; i++) LoadCompressedSpriteSheet(...)` */
export const sSpriteSheet_RunningPokemon: ReadonlyArray<unknown> = [];
export const sAnims_PlayerBicycle: ReadonlyArray<unknown> = [];

/** Stub helpers Scene 2 (Brendan/May/Flygon/Bicycle bg anim/SetIntroPart2BgCnt). */
export function CreateIntroBrendanSprite(_x: number, _y: number): number { return -1; }
export function CreateIntroMaySprite(_x: number, _y: number): number { return -1; }
export function CreateIntroFlygonSprite(_x: number, _y: number): number { return -1; }
export function CreateBicycleBgAnimationTask(_a: number, _b: number, _c: number, _d: number): number { return -1; }
export function SetIntroPart2BgCnt(_arg: number): void { /* no-op */ }
/** 1:1 décomp src/intro_credits_graphics.c:989 — cycle palette scenery couleurs.
 *  Phase 0c stub no-op (= la palette reste statique, pas d'animation cycling). */
export function CycleSceneryPalette(_mode: number): void { /* no-op */ }

/** Constants décomp commonly référencées sans être résolues par le transpileur. */
export const MALE = 0;
export const FEMALE = 1;

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

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL TABLES (data extern décomp utilisée cross-module)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `const u16 gTitleScreenAlphaBlend[64]` (src/title_screen.c:74).
 *  Utilisé par Task_BlendLogoIn/Out + title_screen pour BLDALPHA fade smooth.
 *  - 0-15  : eva=16 fixe, evb=0→15  (logo lighten gradient)
 *  - 16-31 : eva=15→0, evb=16 fixe  (logo darken gradient)
 *  - 32-63 : eva=0, evb=16 fixe     (held final state)
 *  BLDALPHA_BLEND(eva, evb) = (eva | (evb << 8)). */
function _bldAlpha(eva: number, evb: number): number { return (eva & 0x1F) | ((evb & 0x1F) << 8); }
export const gTitleScreenAlphaBlend: ReadonlyArray<number> = (() => {
  const arr: number[] = new Array(64);
  for (let i = 0; i <= 15; i++) arr[i] = _bldAlpha(16, i);
  for (let i = 16; i <= 31; i++) arr[i] = _bldAlpha(31 - i, 16);
  for (let i = 32; i <= 63; i++) arr[i] = _bldAlpha(0, 16);
  return arr;
})();

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

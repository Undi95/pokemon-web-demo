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
 *       import { LoadPalette, LZ77UnCompVram, DmaClear16, ... } from '../../decomp-globals';
 *
 * ASSET CACHE : les LZ77UnCompVram/LoadPalette du décomp sont synchrones
 * (data en ROM). Notre engine = data dans des PNGs/binaires fetchés async.
 * Solution : preload async de tous les assets nécessaires AVANT de lancer la
 * Task qui les utilise. Pendant l'exécution, les helpers font lookup-cache + write sync.
 *
 * 1:1 décomp src/decompress.c (LZ77UnCompVram), src/palette.c (LoadPalette),
 * include/gba/macro.h (DmaClear16 macro), src/main.c (CpuFill16/32).
 */
import type { DecompRuntime, DecompSprite } from './decomp-runtime';
// Miroir 1:1 `event_data.ts` — délégation (source unique flags/vars number[]).
import { CanResetRTC as _MirrorCanResetRTC } from '../../include/event_data';
// TASK_NONE : feuille include/task.ts (zéro-import → sûr). Évite la 3e définition
// dupliquée de cette constante dans ce fourre-tout (cf. include/task.ts, decomp-runtime.ts).
import { TASK_NONE } from '../../include/task';
import {
  BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR,
  REG_OFFSET_DISPCNT, REG_OFFSET_BG1CNT, REG_OFFSET_BG2CNT, REG_OFFSET_BG3CNT,
  BGCNT_PRIORITY, BGCNT_CHARBASE, BGCNT_SCREENBASE,
  DISPCNT_MODE_0, DISPCNT_OBJ_1D_MAP,
  DISPCNT_BG1_ON, DISPCNT_BG2_ON, DISPCNT_BG3_ON, DISPCNT_OBJ_ON,
  MAX_SPRITES,
} from './decomp-runtime';
// gSineTable vit dans son miroir 1:1 src/trig.ts (= decomp/src/trig.c). Aliasé
// G_SINE_TABLE pour garder les usages bridge (BgAffineSet, globalThis pour
// pokeball-effects/sprite) inchangés. Le scaffold decomp-data/src/sine-table a été retiré.
import { gSineTable as G_SINE_TABLE } from '../../src/trig';
import { SONG_ID_TO_NAME, getSongConfig } from '../../src/engine/decomp-data/src/song-table';
import { getSongMusicPlayer } from '../../src/engine/decomp-data/src/song-players';
import { MUS_NONE as _MUS_NONE } from '../../include/constants/songs';
import { setReverb as _staticSetReverb } from '../m4a/audio-context';
// Static imports m4a/player + synth pour pouvoir stopper la musique de FAÇON
// SYNCHRONE depuis m4aSongNumStart (sinon le sync stop attend l'import async,
// laissant la song précédente déclencher son endTimer de loop entre-temps).
import { stopSong as _staticStopSong, stopAllSongs as _staticStopAllSongs, loadMidi as _staticLoadMidi, playSong as _staticPlaySong, pauseSong as _staticPauseSong, resumeSong as _staticResumeSong, isPaused as _staticIsPaused, isPlaying as _staticIsPlaying } from '../m4a/player';
import { hasPrerenderedSE, playPrerenderedSE, stopPrerenderedSE, preloadPrerenderedList } from '../m4a/se-noise-prerendered';
import { stopAllActiveNotes as _staticStopAllNotes } from '../m4a/synth';
// Side-effect import : registers battler affine animations (gAffineAnims_BattleSprite*)
// in the affine extras registry consumed by sprite-engine-impl. Required for
// EVERY mon release/return/emerge across battles, Birch, eggs, evolutions.
import '../../src/engine/decomp-impls/sprite-affine-extras';
import { BeginAffineAnim as _BeginAffineAnim } from '../../src/engine/decomp-impls/sprite-engine-impl';
// Foundational pokeball release effects (sparkles + flash + emerge affine setup).
import { BALL_POKE } from '../../include/pokeball';

// ─── Singleton runtime + asset cache ──────────────────────────────────────────

import {
  _setSpriteRuntimeGetter,
  LoadSpritePalette as _LoadSpritePalette_1to1,
  LoadSpritePalettes as _LoadSpritePalettes_1to1,
  IndexOfSpritePaletteTag as _IndexOfSpritePaletteTag_1to1,
  AllocSpriteTileRange as _AllocSpriteTileRange_1to1,
  AllocSpriteTiles as _AllocSpriteTiles_1to1,
  GetSpriteTileStartByTag as _GetSpriteTileStartByTag_1to1,
  _freeSpriteTileRangeByTag as _FreeSpriteTileRangeByTag_1to1,
  sSpriteTileRangeTags as _sSpriteTileRangeTags,
  sSpriteTileRanges as _sSpriteTileRanges,
  sSpriteTileAllocBitmap as _sSpriteTileAllocBitmap,
  _CreateSpriteAtTemplate as _CreateSprite_game,
  ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP,
} from '../../src/sprite';
export {
  // Tile tag system helpers (sprite.c:1509-1579)
  IndexOfSpriteTileTag, GetSpriteTileTagByTileStart,
  AllocSpriteTileRange, FreeSpriteTileRanges,
  // OAM matrix ops (sprite.c:661-680, 1188-1194, 1475-1484)
  ResetOamMatrices, CopyOamMatrix, SetOamMatrixRotationScaling,
  ResetOamRange,
  // Sprite geometry (sprite.c:687-700)
  CalcCenterToCornerVec,
} from '../../src/sprite';
// LoadOam : decomp-globals.ts a déjà sa version (no-op équivalent) — pas de re-export.
import { _setPaletteRuntimeGetter } from '../../src/palette';
export {
  LoadCompressedPalette, FillPalette,
  InvertPlttBuffer, TintPlttBuffer, UnfadePlttBuffer,
  BeginFastPaletteFade, BeginHardwarePaletteFade,
  UpdateFastPaletteFade, UpdateHardwarePaletteFade, UpdateBlendRegisters,
  IsSoftwarePaletteFadeFinishing,
  TintPalette_GrayScale, TintPalette_GrayScale2, TintPalette_SepiaTone, TintPalette_CustomTone,
  BlendPalettesGradually,
} from '../../src/palette';

let _rt: DecompRuntime | null = null;

/** Set le runtime actif. À call dans GameScene.create() AVANT toute Task. */
export function setGlobalRuntime(rt: DecompRuntime): void {
  _rt = rt;
  // Wire sprite.ts + palette.ts (= sources de vérité 1:1 décomp).
  // Doit être fait à chaque setGlobalRuntime car le runtime peut changer entre
  // les scènes (= preview reload, test scene swap, etc.).
  _setSpriteRuntimeGetter(getRuntime, getAsset);
  _setPaletteRuntimeGetter(getRuntime);
  // Expose pour devtools/inspect runtime — uniquement en preview/dev.
  (globalThis as Record<string, unknown>).__rt = rt;
  // ✅ `globalThis.__sprite` SUPPRIMÉ (2026-06-30) : la béquille anti-cycle ESM est ÉLIMINÉE.
  // TOUS les consumers (runtime, overworld, naming_screen, devtools, starter, + les ~52 sites
  // des anims de combat battle_anim_*) importent désormais sprite.ts DIRECTEMENT — sprite.ts
  // n'importe decomp-runtime qu'en `type` → ZÉRO cycle ESM. Plus aucune classe « no-op
  // silencieux » (les fns absentes de l'ancien __sprite, ex. FreeSpriteTilesByTag, sont
  // maintenant les vraies fns 1:1). ⚠️ COMBAT EN PAUSE → migration combat tsc-validée mais à
  // RE-TESTER en jeu à la réactivation du combat.
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
// Surface lazy (loader generique gfx anims par tag, Phase 0bis roadmap).
(globalThis as Record<string, unknown>).__assetCache = assetCache;

/** Compteur LZ77UnCompVram pour debug : combien de fois chaque symbol a été appelé,
 *  combien d'entries ont été copiées, vers quel bgIdx. Inspectable via window.debug. */
export const lz77Trace: Array<{ symbol: string; dest: number; dataLen: number; bgIdx?: number; copied?: number; reason?: string }> = [];

/** Récupère un asset depuis le cache, log warning si manquant (= preload incomplet). */
export function getAsset(symbol: string): Uint8Array | Uint16Array | null {
  const data = assetCache.get(symbol);
  if (!data) {
    console.warn(`decomp-globals: asset '${symbol}' not in cache (forgot to preload?)`);
    return null;
  }
  return data;
}

// ─── BG/VRAM constants (1:1 décomp include/gba/types.h + io_reg.h) ────────────
/** 1:1 décomp BG_SCREEN_SIZE = 0x800 bytes (= 1024 entries u16). */
/** 1:1 décomp PLTT_SIZE = 0x400 bytes (= 256 colors × 2). */
export const PLTT_SIZE = 0x400;
/** 1:1 décomp `u16 gPaletteDecompressionBuffer[PLTT_BUFFER_SIZE]` (palette.c) —
 *  scratch buffer PLTT (512 entries u16). Utilisé p.ex. par Doux Parfum
 *  (fldeff_sweetscent.c) pour sauver/restaurer gPlttBufferUnfaded autour du
 *  flash rouge. */
export const gPaletteDecompressionBuffer = new Uint16Array(512);
/** 1:1 décomp VRAM_SIZE = 0x18000 bytes. */
export const VRAM_SIZE = 0x18000;
// Re-export depuis decomp-helpers (= source de vérité unique pour ces consts).
export {
  PLTT_SIZE_4BPP, PLTT_SIZE_8BPP, PLTT_SIZEOF,
  BG_TILE_H_FLIP, BG_TILE_V_FLIP,
  GET_TRUE_SPRITE_INDEX, ANIM_SPRITES_START,
  WIN_RANGE,
} from './decomp-helpers';

// ─── Constants utilisées par intro-callbacks-auto sans être importées ─────────
// (résolues par le constant resolver du transpileur, mais redéclarées ici pour
//  cohérence + accès direct par decomp-globals.ts)
export const PALETTES_ALL = 0xFFFFFFFF;
// 1:1 décomp include/constants/rgb.h : PALETTES_BG = 0xFFFF (= 16 BG palettes bitmask).
// Utilisé par e.g. CreatePokeballSpriteToReleaseMon(_, _, _, _, _, _, _, fadePalettes, _).
export const PALETTES_BG = 0xFFFF;
export const PALETTES_OBJ = 0xFFFF0000;

// 1:1 décomp src/sprite.c:SpriteCallbackDummy — no-op sprite callback.
// Utilisé comme sentinel par tout le décomp pour signaler "anim is done"
// (e.g. WaitForLotad case 0 check `if (sprite.callback != SpriteCallbackDummy)`).
// Cf. include/constants/sprite.h.
export function SpriteCallbackDummy(_sprite: unknown, _rt?: unknown): void { /* no-op */ }

// ─── Re-export complet decomp-runtime pour import en bloc côté bodyC ─────────
// Tous les REG_OFFSET_*, BGCNT_*, DISPCNT_*, BLDCNT_*, BG_PLTT_ID, etc.
// utilisés par les Tasks transcrites depuis le décomp.
export {
  BG_PLTT_ID, OBJ_PLTT_ID, BG_CHAR_ADDR, BG_SCREEN_ADDR, BG_VRAM,
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

/** EWRAM_DATA u16 gIntroCredits_MovingSceneryVBase — utilisé par intro/credits scrolling. */
export let gIntroCredits_MovingSceneryVBase = 0;
/** EWRAM_DATA s16 gIntroCredits_MovingSceneryVOffset — utilisé par intro/credits parallax. */
export let gIntroCredits_MovingSceneryVOffset = 0;
/** EWRAM_DATA s16 gIntroCredits_MovingSceneryState — INTROCRED_SCENERY_NORMAL/FROZEN. */
export let gIntroCredits_MovingSceneryState = 0;

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
 *  l'adresse calculée. BG_CHAR_ADDR(n) = BG_VRAM + n*0x4000 → BG n, charBase=n*4.
 *  BG_SCREEN_ADDR(n) = BG_VRAM + n*0x800 → screen n. Le `% vram.byteLength`
 *  ci-dessous strip BG_VRAM (0x06000000 mod 0x18000 = 0) → offset relatif clean. */
export function LZ77UnCompVram(srcSymbol: string, destAddr: number): void {
  const data = getAsset(srcSymbol);
  if (!data) return; // asset manquant, déjà loggué
  const r = rt();
  const traceEntry: { symbol: string; dest: number; dataLen: number; copied?: number; reason?: string } = {
    symbol: srcSymbol, dest: destAddr, dataLen: data.byteLength,
  };
  lz77Trace.push(traceEntry);
  const bytes = data instanceof Uint16Array
    ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    : data;
  const vram = r.gba.vram;
  const offset = destAddr % vram.byteLength;
  const copySize = Math.min(bytes.length, vram.byteLength - offset);
  if (copySize > 0) {
    vram.set(bytes.subarray(0, copySize), offset);
    traceEntry.copied = copySize;
    traceEntry.reason = `vram[0x${offset.toString(16)}..0x${(offset + copySize).toString(16)}]`;
    // Note : tile cache invalidation handled centrally par compositor's
    // _tileCachesCache.clear() au début de chaque frame (cf. composeFrame).
    // Couvre TOUS les VRAM writers (LZ77, CpuCopy, DmaCopy, etc.) sans hook.
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
export function LoadPalette(srcSymbol: string | Uint16Array | number, offset: number, sizeBytes: number): void {
  let u16: Uint16Array | undefined;
  if (typeof srcSymbol === 'string') {
    const asset = getAsset(srcSymbol);
    if (asset) {
      u16 = asset instanceof Uint16Array
        ? asset
        : new Uint16Array(asset.buffer, asset.byteOffset, Math.floor(asset.byteLength / 2));
    }
  } else if (typeof srcSymbol === 'number') {
    u16 = new Uint16Array([srcSymbol & 0xFFFF]);
  } else {
    u16 = srcSymbol;
  }
  if (!u16 || u16.length === 0) return;
  // Si srcSymbol est une string : on ignore sizeBytes (artefact du transpileur)
  // et on utilise la vraie taille du buffer cache.
  // Si sizeBytes === 0 : artefact du transpileur qui converti `sizeof(arr)` → `0`.
  // On fallback à la full taille du buffer (= ce que sizeof(...) aurait donné en C).
  const numEntries = typeof srcSymbol === 'string' || sizeBytes === 0
    ? u16.length
    : Math.floor(sizeBytes / 2);
  const r = rt();
  // 1:1 décomp src/palette.c LoadPalette : écrit gPlttBufferUnfaded ET
  // gPlttBufferFaded. PAS direct gba.palette (= PLTT register sera updaté au
  // prochain VBlank via TransferPlttBuffer).
  for (let i = 0; i < numEntries; i++) {
    r.gPlttBufferUnfaded.set(offset + i, u16[i]);
    r.gPlttBufferFaded.set(offset + i, u16[i]);
  }
}

/** 1:1 décomp `LoadBgTiles` — copy tile data into BG VRAM.
 *  Simplified: ignores baseTile (assumed 0) and paletteMode. */
export function LoadBgTiles(bg: number, src: Uint8Array, sizeBytes: number, destOffset: number): void {
  const r = rt();
  const vram = r.gba.bg(bg as 0 | 1 | 2 | 3).vram;
  const offset = destOffset * 32; // each tile = 32 bytes in 4bpp
  const end = Math.min(offset + sizeBytes, vram.length);
  vram.set(src.subarray(0, end - offset), offset);
  // Note : tile cache invalidation handled par compositor's per-frame clear.
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
  // Dispatch sur la région : VRAM (0x06000000), OAM (0x07000000), PLTT (0x05000000).
  if (destAddr >= 0x05000000 && destAddr < 0x05000400) {
    // PLTT range : clear gPlttBufferFaded + Unfaded + compositor.
    const start = (destAddr - 0x05000000) >> 1;
    const count = sizeBytes >> 1;
    for (let i = 0; i < count; i++) {
      r.gPlttBufferFaded.set(start + i, 0);
      r.gPlttBufferUnfaded.set(start + i, 0);
    }
  } else if (destAddr >= 0x07000000 && destAddr < 0x07000400) {
    // OAM range : clear visible flags
    const start = (destAddr - 0x07000000) / 8;
    const count = Math.min(sizeBytes / 8, 128 - start);
    for (let i = 0; i < count; i++) {
      const oam = r.gba.oam[start + i];
      if (oam) oam.visible = false;
    }
  } else {
    // VRAM range (default).
    const vram = r.gba.vram;
    const offset = destAddr % vram.byteLength;
    const clearSize = Math.min(sizeBytes, vram.byteLength - offset);
    if (clearSize > 0) vram.fill(0, offset, offset + clearSize);
  }
}

/** 1:1 décomp `DmaClearLarge16(channel, dest, size, blockSize)` — clear `size`
 *  bytes à `dest` par chunks de `blockSize`. Pour notre engine = identique à
 *  DmaClear16 (= pas de chunking nécessaire en JS). */
export function DmaClearLarge16(_channel: number, destAddr: number, sizeBytes: number, _blockSize: number): void {
  DmaClear16(_channel, destAddr, sizeBytes);
}

/** 1:1 décomp `DmaClear32(channel, dest, size)` — clear bytes à `dest`.
 *  Routes : VRAM (0x06000000), OAM (0x07000000), PLTT (0x05000000).
 *  Notre engine : `dest` est l'adresse GBA absolue, on dispatch au bon buffer. */
export function DmaClear32(_channel: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  if (destAddr >= 0x07000000 && destAddr < 0x07000400) {
    // OAM range : clear visible flags pour tous les sprites affectés.
    const start = (destAddr - 0x07000000) / 8;
    const count = Math.min(sizeBytes / 8, 128 - start);
    for (let i = 0; i < count; i++) {
      const oam = r.gba.oam[start + i];
      if (oam) {
        oam.visible = false;
        oam.objMode = 0;
        oam.affineMode = 0;
      }
    }
  } else if (destAddr >= 0x05000000 && destAddr < 0x05000400) {
    // PLTT range : clear gPlttBufferFaded (et palette buffer).
    const start = (destAddr - 0x05000000) >> 1;
    const count = sizeBytes >> 1;
    for (let i = 0; i < count; i++) r.gPlttBufferFaded.set(start + i, 0);
  } else {
    // VRAM range (default).
    const offset = destAddr % r.gba.vram.byteLength;
    const clearSize = Math.min(sizeBytes, r.gba.vram.byteLength - offset);
    if (clearSize > 0) r.gba.vram.fill(0, offset, offset + clearSize);
  }
}

/** 1:1 décomp `CpuFill16(value, dest, size)` — fill 16-bit.
 *  Supporte VRAM et PLTT (address-based). */
export function CpuFill16(value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  if (destAddr >= VRAM && destAddr < VRAM + VRAM_SIZE) {
    const offset = destAddr - VRAM;
    const end = Math.min(offset + sizeBytes, VRAM_SIZE);
    const view = new Uint16Array(r.gba.vram.buffer, offset, (end - offset) >> 1);
    view.fill(value & 0xFFFF);
  } else if (destAddr >= PLTT && destAddr < PLTT + PLTT_SIZE) {
    const start = (destAddr - PLTT) >> 1;
    const count = sizeBytes >> 1;
    for (let i = 0; i < count; i++) {
      r.gPlttBufferFaded.set(start + i, value & 0xFFFF);
    }
  }
}

/** 1:1 décomp `u32 GetDecompressedDataSize(const u32 *ptr)` (decompress.c) — lit
 *  la taille décompressée dans l'en-tête LZ77 (bytes 1-3 little-endian).
 *  Harness : les assets sont PRÉ-décompressés → taille = byteLength de l'asset
 *  (symbole string via assetCache, ou buffer direct). */
export function GetDecompressedDataSize(data: string | Uint8Array | null): number {
  if (!data) return 0;
  if (typeof data === 'string') {
    const a = getAsset(data);
    return a ? a.byteLength : 0;
  }
  return data.byteLength;
}

/** 1:1 décomp `CpuFill32(value, dest, size)` — fill 32-bit.
 *  Supporte VRAM, OAM (hide sprites) et PLTT. */
export function CpuFill32(value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  if (destAddr >= VRAM && destAddr < VRAM + VRAM_SIZE) {
    const offset = destAddr - VRAM;
    const end = Math.min(offset + sizeBytes, VRAM_SIZE);
    const view = new Uint32Array(r.gba.vram.buffer, offset, (end - offset) >> 2);
    view.fill(value >>> 0);
  } else if (destAddr >= OAM && destAddr < OAM + OAM_SIZE) {
    for (const entry of r.gba.oam) {
      entry.visible = false;
    }
  } else if (destAddr >= PLTT && destAddr < PLTT + PLTT_SIZE) {
    CpuFill16(value & 0xFFFF, destAddr, sizeBytes);
    CpuFill16((value >>> 16) & 0xFFFF, destAddr + 2, sizeBytes > 2 ? sizeBytes - 2 : 0);
  }
}

/** = BIOS `CpuSet(src, dest, control)` — copy/fill 16/32-bit.
 *  Copie réelle quand src/dest sont des TypedArray (le cas des callers portés) ;
 *  control = count (bits 0-20) | fill (bit 24) | 32-bit (bit 26), 1:1 gba/syscall.
 *  Adresses GBA brutes (nombres) : non modélisées → throw fail-fast (pas de
 *  no-op silencieux — doctrine anti-stub, audit gfx-substrat 2026-07-02). */
export function CpuSet(src: unknown, dest: unknown, control: number): void {
  const count = control & 0x1FFFFF;
  const fill = (control & (1 << 24)) !== 0;
  const is32 = (control & (1 << 26)) !== 0;
  const units = count * (is32 ? 2 : 1);  // en unités 16-bit pour les vues u16
  const d = dest as { length?: number; set?: unknown; [i: number]: number };
  const s = src as { length?: number; [i: number]: number };
  if (d && typeof d.length === 'number') {
    if (fill) {
      const v = s && typeof s.length === 'number' ? s[0] : (src as number);
      for (let i = 0; i < units && i < d.length; i++) d[i] = v;
    } else if (s && typeof s.length === 'number') {
      for (let i = 0; i < units && i < d.length && i < s.length; i++) d[i] = s[i];
    }
    return;
  }
  throw new Error('[decomp-globals] CpuSet : dest non-TypedArray (adressage GBA brut non modélisé)');
}

/** = BIOS `CpuFastSet` — même sémantique que CpuSet (32-bit, count en words). */
export function CpuFastSet(src: unknown, dest: unknown, control: number): void {
  CpuSet(src, dest, (control & 0x1FFFFF) | (control & (1 << 24)) | (1 << 26));
}

/** 1:1 décomp src/intro_credits_graphics.c:729 — charge BG2/BG3 Scene 2.
 *  scenery=1 (toujours appelé avec 1) : trees scenery (= bike ride forest).
 *  scenery=0 : clouds (= jamais utilisé dans intro Pokemon Emerald).
 *
 *  Layout VRAM Scene 2 (= adresses absolues GBA, modulo VRAM size) :
 *    - sGrass_Gfx → BG_CHAR_ADDR(1)    (BG3 ground char data)
 *    - sGrass_Tilemap → BG_SCREEN_ADDR(15) (BG3 tilemap)
 *    - sGrass_Pal → BG palette bank 15
 *    - sTrees_Gfx → BG_CHAR_ADDR(0)    (BG2 trees char data)
 *    - sTrees_Tilemap → BG_SCREEN_ADDR(6) (BG2 tilemap)
 *    - sTrees_Pal → BG palette bank 0 */
export function LoadIntroPart2Graphics(scenery: number): void {
  // Ground (BG3) — toujours chargé, peu importe scenery
  LZ77UnCompVram(sGrass_Gfx, BG_CHAR_ADDR(1));
  LZ77UnCompVram(sGrass_Tilemap, BG_SCREEN_ADDR(15));
  LoadPalette(sGrass_Pal, BG_PLTT_ID(15), 32);  // BG palette bank 15
  if (scenery === 1) {
    // Trees + small trees sprites (= bike ride forest scenery)
    LZ77UnCompVram(sTrees_Gfx, BG_CHAR_ADDR(0));
    LZ77UnCompVram(sTrees_Tilemap, BG_SCREEN_ADDR(6));
    LoadPalette(sTrees_Pal, BG_PLTT_ID(0), 32);  // BG palette bank 0
    // TODO LoadCompressedSpriteSheet(sSpriteSheet_TreesSmall) + LoadPalette(sTreesSmall_Pal, OBJ)
    // TODO CreateTreeSprites() — Phase 2 (= sprite OAM trees animés)
  }
  // gIntroCredits_MovingSceneryState = INTROCRED_SCENERY_NORMAL est set par
  // le bodyC Task_Scene2_Load directement (var locale module).
  // gReservedSpritePaletteCount = 8 → no-op chez nous (= alloc OBJ palette).
}

/** 1:1 décomp src/sprite.c:1581-1587 — délégué à `src/engine/sprite.ts`
 *  (= source de vérité 1:1 strict du palette tag system). */
export { FreeAllSpritePalettes } from '../../src/sprite';

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 STUBS (Phase 0b minimum viable — no-op pour ne pas crasher)
// TODO Phase 0c : implementer 1:1 décomp src/intro.c
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/intro.c:274 — sprite sheets pour Volbeat/Torchic/Manectric.
 *  Boucle `for (i=0; i < ARRAY_COUNT-1; i++)` skip le sentinel `{}` final, donc
 *  on inclut bien le terminateur vide (notre boucle traite `length - 1`). */
export const sSpriteSheet_RunningPokemon: ReadonlyArray<{ data: string, size: number, tag: string | number }> = [
  { data: 'gIntroVolbeat_Gfx', size: 0x400, tag: 'TAG_VOLBEAT' },
  { data: 'gIntroTorchic_Gfx', size: 0xC00, tag: 'TAG_TORCHIC' },
  { data: 'gIntroManectric_Gfx', size: 0x2000, tag: 'TAG_MANECTRIC' },
  { data: '', size: 0, tag: '' },  // sentinel
];

/** 1:1 décomp src/intro.c — Bubbles (Kyogre Scene 3). */
export const sSpriteSheet_Bubbles: { data: string, size: number, tag: string | number } = {
  data: 'gIntroBubbles_Gfx', size: 0x600, tag: 'TAG_BUBBLES',
};
export const sSpritePalette_Bubbles: { data: string, tag: string | number } = {
  data: 'gIntroBubbles_Pal', tag: 'TAG_BUBBLES',
};

/** 1:1 décomp src/intro.c — Lightning (Rayquaza Scene 3). */
export const sSpriteSheet_Lightning: { data: string, size: number, tag: string | number } = {
  data: 'gIntroLightning_Gfx', size: 0xC00, tag: 'TAG_LIGHTNING',
};
export const sSpritePalette_Lightning: ReadonlyArray<{ data: string, tag: string | number }> = [
  { data: 'gIntroLightning_Pal', tag: 'TAG_LIGHTNING' },
];

/** 1:1 décomp src/intro.c — Rayquaza orb (intro blast). */
export const sSpriteSheet_RayquazaOrb: { data: string, size: number, tag: string | number } = {
  data: 'sIntroMisc_Gfx', size: 0xA00, tag: 'TAG_RAYQUAZA_ORB',
};
export const sSpritePalette_RayquazaOrb: ReadonlyArray<{ data: string, tag: string | number }> = [
  { data: 'sIntroRayquzaOrb_Pal', tag: 'TAG_RAYQUAZA_ORB' },
];

/** 1:1 décomp src/intro.c:281 — palettes OBJ pour Volbeat/Torchic/Manectric. */
export const sSpritePalettes_RunningPokemon: ReadonlyArray<{ data: string, tag: string | number }> = [
  { data: 'gIntroVolbeat_Pal', tag: 'TAG_VOLBEAT' },
  { data: 'gIntroTorchic_Pal', tag: 'TAG_TORCHIC' },
  { data: 'gIntroManectric_Pal', tag: 'TAG_MANECTRIC' },
];

// 1:1 décomp intro.c:621-663 — table d'anims du joueur à vélo (le PÉDALAGE). Était un stub
// vide `[]` → `.anims = []` posé sur le sprite joueur (intro scène 2) → BeginAnim ne trouve
// aucune frame → joueur figé, pas de pédalage (Brendan ET May). Fast/Slow bouclent (JUMP 0) ;
// frames à offsets 0/64/128/192 = les 4 frames de pédalage dans la feuille joueur.
const sAnim_PlayerBicycle_Fast = [ ANIMCMD_FRAME(0, 4), ANIMCMD_FRAME(64, 4), ANIMCMD_FRAME(128, 4), ANIMCMD_FRAME(192, 4), ANIMCMD_JUMP(0) ];
const sAnim_PlayerBicycle_Slow = [ ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(64, 8), ANIMCMD_FRAME(128, 8), ANIMCMD_FRAME(192, 8), ANIMCMD_JUMP(0) ];
const sAnim_PlayerBicycle_LookBack = [ ANIMCMD_FRAME(256, 4), ANIMCMD_FRAME(320, 4), ANIMCMD_FRAME(384, 4), ANIMCMD_END ];
const sAnim_PlayerBicycle_LookForward = [ ANIMCMD_FRAME(384, 16), ANIMCMD_FRAME(320, 16), ANIMCMD_FRAME(256, 16), ANIMCMD_END ];
export const sAnims_PlayerBicycle: ReadonlyArray<ReadonlyArray<unknown>> = [
  sAnim_PlayerBicycle_Fast, sAnim_PlayerBicycle_Slow, sAnim_PlayerBicycle_LookBack, sAnim_PlayerBicycle_LookForward,
];

// 1:1 décomp battle_anim_rock.c:191 — gAncientPowerRockSpriteTemplate, EMPRUNTÉ par l'intro
// (scène 3 Groudon → CreateGroudonRockSprites). Le côté combat le crée via l'interpréteur d'anims
// (table de symboles), donc le VRAI objet n'existait nulle part de committé → l'intro ne pouvait
// PAS le résoudre (CreateSpriteFromTemplate → -1 → zéro rocher). Re-matérialisé ici en objet 1:1
// (hub léger déjà importé par l'intro ; évite de tirer le graphe battle-anim dans le boot intro).
// OAM = data/battle_anim.h:30 gOamData_AffineOff_ObjNormal_32x32 (32x32, 4bpp). 6 anims = tailles
// de rocher (offset 0/16/32/48/64/80). tileTag/paletteTag ANIM_TAG_ROCKS (gfx chargé par l'intro
// via gBattleAnimPicTable). callback décomp = AnimRaiseSprite mais l'intro l'override (SpriteCB_GroudonRocks).
const gOamData_AffineOff_ObjNormal_32x32 = {
  shape: 0, size: 2, priority: 2, paletteNum: 0, affineMode: 0, paletteMode: 0, objMode: 0,
} as const;
const sAnim_Rock_Biggest  = [ ANIMCMD_FRAME(0,  1), ANIMCMD_END ];
const sAnim_Rock_Bigger   = [ ANIMCMD_FRAME(16, 1), ANIMCMD_END ];
const sAnim_Rock_Big      = [ ANIMCMD_FRAME(32, 1), ANIMCMD_END ];
const sAnim_Rock_Small    = [ ANIMCMD_FRAME(48, 1), ANIMCMD_END ];
const sAnim_Rock_Smaller  = [ ANIMCMD_FRAME(64, 1), ANIMCMD_END ];
const sAnim_Rock_Smallest = [ ANIMCMD_FRAME(80, 1), ANIMCMD_END ];
const sAnims_BasicRock = [ sAnim_Rock_Biggest, sAnim_Rock_Bigger, sAnim_Rock_Big, sAnim_Rock_Small, sAnim_Rock_Smaller, sAnim_Rock_Smallest ];
export const gAncientPowerRockSpriteTemplate = {
  // substrat M3 : le gfx/pal des rochers s'enregistre sous la clé STRING 'ANIM_TAG_ROCKS'
  // (gBattleAnimPicTable[58].tag, decomp-globals:1361) → _tagToU16 mappe en u16 synthétique.
  // Passer le numérique 10058 ne matcherait PAS (cf. piège 'TAG_VERSION'/version banner).
  tileTag: 'ANIM_TAG_ROCKS', paletteTag: 'ANIM_TAG_ROCKS',
  oam: gOamData_AffineOff_ObjNormal_32x32,
  anims: sAnims_BasicRock,
  images: null,
  affineAnims: null,
  callback: null,
};

// ─── PHASE E2.B — SpriteTemplate intro_credits_graphics 1:1 (player/bike/flygon) ──
// OAM + anims (intro_credits_graphics.c:443-577) des 5 templates utilisés DANS L'INTRO
// (scène 2 vélo : Brendan/May + leurs vélos + Flygon, cf. intro.c:1400-1408). Les templates
// (avec callback) sont construits dans les CreateIntro*Sprite ci-dessous, callback résolu via
// spriteCallbacks (anti-cycle ESM — même pattern que StartPokemonLogoShine). tags STRING =
// clés catalogue. (sSpriteTemplate_MovingScenery = crédits-only, jamais créé dans l'intro
// — cf. intro.c qui ne fige que gIntroCredits_MovingSceneryState — donc non converti ici.)

// intro_credits_graphics.c:443 — sOamData_Player (64x64, 4bpp, priority 1) ; Brendan & May partagent
const sOamData_Player = { shape: 0, size: 3, priority: 1, paletteNum: 0, affineMode: 0, paletteMode: 0, objMode: 0 } as const;
const sAnim_Player = [ ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(64, 8), ANIMCMD_FRAME(128, 8), ANIMCMD_FRAME(192, 8), ANIMCMD_JUMP(0) ];
const sAnims_Player = [ sAnim_Player ];

// intro_credits_graphics.c:487 — sOamData_Bicycle (64x32, 4bpp, priority 1)
const sOamData_Bicycle = { shape: 1, size: 3, priority: 1, paletteNum: 0, affineMode: 0, paletteMode: 0, objMode: 0 } as const;
const sAnim_Bicycle = [ ANIMCMD_FRAME(0, 8), ANIMCMD_FRAME(32, 8), ANIMCMD_FRAME(64, 8), ANIMCMD_FRAME(96, 8), ANIMCMD_JUMP(0) ];
const sAnims_Bicycle = [ sAnim_Bicycle ];

// intro_credits_graphics.c:531 — sOamData_Flygon (64x64, 4bpp, priority 1) ; 2 anims (left/right half)
const sOamData_Flygon = { shape: 0, size: 3, priority: 1, paletteNum: 0, affineMode: 0, paletteMode: 0, objMode: 0 } as const;
const sAnim_FlygonLeft = [ ANIMCMD_FRAME(0, 16), ANIMCMD_END ];
const sAnim_FlygonRight = [ ANIMCMD_FRAME(64, 16), ANIMCMD_END ];
const sAnims_Flygon = [ sAnim_FlygonLeft, sAnim_FlygonRight ];

/** 1:1 décomp src/intro_credits_graphics.c:1118 — crée Brendan + bicycle sprites,
 *  link les via sPlayerSpriteId pour que SpriteCB_Bicycle synchronise position.
 *  Phase E2.B : VRAIS SpriteTemplate (Brendan/BrendanBicycle) → CreateSprite game-form. */
export function CreateIntroBrendanSprite(x: number, y: number): number {
  const r = rt();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerCb = ((globalThis as any).SpriteCB_Player ?? r.spriteCallbacks.get('SpriteCB_Player') ?? null) as ((sprite: unknown, rt: unknown) => void) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bicycleCb = ((globalThis as any).SpriteCB_Bicycle ?? r.spriteCallbacks.get('SpriteCB_Bicycle') ?? null) as ((sprite: unknown, rt: unknown) => void) | null;
  const sSpriteTemplate_Brendan = {
    tileTag: 'TAG_BRENDAN', paletteTag: 'TAG_BRENDAN',
    oam: sOamData_Player, anims: sAnims_Player, images: null, affineAnims: null, callback: playerCb,
  };
  const sSpriteTemplate_BrendanBicycle = {
    tileTag: 'TAG_BICYCLE', paletteTag: 'TAG_BRENDAN',
    oam: sOamData_Bicycle, anims: sAnims_Bicycle, images: null, affineAnims: null, callback: bicycleCb,
  };
  const playerSpriteId = _CreateSprite_game(r, sSpriteTemplate_Brendan, x, y, 2);
  const bicycleSpriteId = _CreateSprite_game(r, sSpriteTemplate_BrendanBicycle, x, y + 8, 3);
  // 1:1 décomp : `gSprites[bicycleSpriteId].sPlayerSpriteId = playerSpriteId;`
  // `sPlayerSpriteId = data[0]` (alias bicycle data field)
  const bicycle = r.getSprite(bicycleSpriteId);
  if (bicycle) bicycle.data[0] = playerSpriteId;
  return playerSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:1126 — crée May + bicycle sprites.
 *  Phase E2.B : VRAIS SpriteTemplate (May/MayBicycle) → CreateSprite game-form. */
export function CreateIntroMaySprite(x: number, y: number): number {
  const r = rt();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerCb = ((globalThis as any).SpriteCB_Player ?? r.spriteCallbacks.get('SpriteCB_Player') ?? null) as ((sprite: unknown, rt: unknown) => void) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bicycleCb = ((globalThis as any).SpriteCB_Bicycle ?? r.spriteCallbacks.get('SpriteCB_Bicycle') ?? null) as ((sprite: unknown, rt: unknown) => void) | null;
  const sSpriteTemplate_May = {
    tileTag: 'TAG_MAY', paletteTag: 'TAG_MAY',
    oam: sOamData_Player, anims: sAnims_Player, images: null, affineAnims: null, callback: playerCb,
  };
  const sSpriteTemplate_MayBicycle = {
    tileTag: 'TAG_BICYCLE', paletteTag: 'TAG_MAY',
    oam: sOamData_Bicycle, anims: sAnims_Bicycle, images: null, affineAnims: null, callback: bicycleCb,
  };
  const playerSpriteId = _CreateSprite_game(r, sSpriteTemplate_May, x, y, 2);
  const bicycleSpriteId = _CreateSprite_game(r, sSpriteTemplate_MayBicycle, x, y + 8, 3);
  const bicycle = r.getSprite(bicycleSpriteId);
  if (bicycle) bicycle.data[0] = playerSpriteId;
  return playerSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:1162 — crée Flygon en 2 halves
 *  (left/right) car sprite trop grand pour 1 OAM (= 64x64 max). Right half
 *  utilise StartSpriteAnim 1 + SpriteCB_FlygonRightHalf pour sync avec left. */
export function CreateIntroFlygonSprite(x: number, y: number): number {
  const r = rt();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leftCb = ((globalThis as any).SpriteCB_FlygonLeftHalf ?? r.spriteCallbacks.get('SpriteCB_FlygonLeftHalf') ?? null) as ((sprite: unknown, rt: unknown) => void) | null;
  const sSpriteTemplate_FlygonLatias = {
    tileTag: 'TAG_FLYGON_LATIAS', paletteTag: 'TAG_FLYGON_LATIAS',
    oam: sOamData_Flygon, anims: sAnims_Flygon, images: null, affineAnims: null, callback: leftCb,
  };
  const leftSpriteId = _CreateSprite_game(r, sSpriteTemplate_FlygonLatias, x - 32, y, 5);
  const rightSpriteId = _CreateSprite_game(r, sSpriteTemplate_FlygonLatias, x + 32, y, 6);
  const right = r.getSprite(rightSpriteId);
  if (right) right.data[0] = leftSpriteId;  // sLeftSpriteId = data[0]
  r.StartSpriteAnim(rightSpriteId, 1);
  // 1:1 décomp : `gSprites[rightSpriteId].callback = &SpriteCB_FlygonRightHalf;`
  // Override le callback du template (FlygonLeftHalf no-op) pour le right half.
  const rightCb = r.spriteCallbacks.get('SpriteCB_FlygonRightHalf');
  if (right && rightCb) {
    right.callback = (spr) => rightCb(spr, r);
  }
  return leftSpriteId;
}

/** 1:1 décomp src/intro_credits_graphics.c:924 — crée le Task_BicycleBgAnimation
 *  qui anime les BG parallax pendant Scene 2 bike ride.
 *  data layout : data[0]=mode, data[1]=bg1Speed, [2]=bg1PosHi, [3]=bg1PosLo,
 *  [4]=bg2Speed, [5]=bg2PosHi, [6]=bg2PosLo, [7]=bg3Speed, [8]=bg3PosHi=8, [9]=bg3PosLo.
 *  Le callback Task_BicycleBgAnimation est enregistré dans spriteCallbacks par GameScene. */
export function CreateBicycleBgAnimationTask(mode: number, bg1Speed: number, bg2Speed: number, bg3Speed: number): number {
  const r = rt();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskFn = r.spriteCallbacks.get('Task_BicycleBgAnimation') as any;
  if (!taskFn) {
    console.warn('[decomp-globals] Task_BicycleBgAnimation not registered; BG scroll inactive');
    return r.CreateTask(() => { /* no-op fallback */ }, 0);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskId = r.CreateTask((t: any) => taskFn(t, r), 0);
  const task = r.gTasks[taskId];
  if (task) {
    task.data[0] = mode;
    task.data[1] = bg1Speed;
    task.data[2] = 0;
    task.data[3] = 0;
    task.data[4] = bg2Speed;
    task.data[5] = 0;
    task.data[6] = 0;
    task.data[7] = bg3Speed;
    task.data[8] = 8;
    task.data[9] = 0;
    // 1:1 décomp : run task body immediately for first frame.
    taskFn(task, r);
  }
  return taskId;
}

/** 1:1 décomp src/intro_credits_graphics.c:761 — setup BGCNT pour Scene 2.
 *  scenery=1 → trees bike ride (= utilisé par intro Scene 2). Active
 *  BG1+BG2+BG3+OBJ via DISPCNT MODE_0. */
export function SetIntroPart2BgCnt(scenery: number): void {
  const r = rt();
  // 1:1 décomp BGCNT_TXT256x256 = 0x0000 (= text mode 256×256, default).
  r.SetGpuReg(REG_OFFSET_BG3CNT, BGCNT_PRIORITY(3) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(6));
  r.SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(7));
  r.SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(1) | BGCNT_CHARBASE(1) | BGCNT_SCREENBASE(15));
  r.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG1_ON | DISPCNT_BG2_ON | DISPCNT_BG3_ON | DISPCNT_OBJ_ON);
  void scenery;  // case 0/1/2 partagent le même setup pour intro
}
/** 1:1 décomp src/intro_credits_graphics.c:989 — cycle palette scenery couleurs
 *  toutes les 4 frames pour effet shimmer (sun reflection on grass).
 *
 *  mode=0 (default) : swap palette colors 9↔10 du BG bank 0.
 *  mode=2 : swap RGB(7,9,15)↔RGB(21,20,0) puis RGB(28,24,0)↔RGB(7,9,15) sur
 *           palette colors 12+13.
 *  mode=1 : no-op (= pause cycling).
 *
 *  Le décomp utilise `gMain.vblankCounter1` qu'on simule via gIntroFrameCounter. */
export function CycleSceneryPalette(mode: number): void {
  const r = rt();
  const fc = r.gIntroFrameCounter;
  if (mode === 1) return;
  if ((fc & 3) !== 0 || r.gPaletteFade.active) return;

  // Phase D-cleanup audit session 83 : 1:1 décomp src/intro_credits_graphics.c
  // CycleSceneryPalette écrit à gPlttBufferFaded (= TransferPlttBuffer fait
  // le copy au PLTT register au prochain VBlank). Plus de direct gba.palette.
  if (mode === 2) {
    let x: number, y: number;
    if (fc & 4) {
      x = (7) | ((9) << 5) | ((15) << 10);   // RGB(7,9,15)
      y = (21) | ((20) << 5) | ((0) << 10);  // RGB(21,20,0)
    } else {
      x = (28) | ((24) << 5) | ((0) << 10);  // RGB(28,24,0)
      y = (7) | ((9) << 5) | ((15) << 10);   // RGB(7,9,15)
    }
    r.gPlttBufferFaded.set(0 + 12, x);
    r.gPlttBufferFaded.set(0 + 13, y);
  } else {
    // mode=0 default : swap palette colors 9 et 10
    let x: number, y: number;
    if (fc & 4) {
      x = r.gPlttBufferUnfaded.get(0 + 9);
      y = r.gPlttBufferUnfaded.get(0 + 10);
    } else {
      x = r.gPlttBufferUnfaded.get(0 + 10);
      y = r.gPlttBufferUnfaded.get(0 + 9);
    }
    r.gPlttBufferFaded.set(0 + 9, x);
    r.gPlttBufferFaded.set(0 + 10, y);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIO M4A WIRING (Phase 1 Action 4 #1)
// 1:1 décomp `m4aSongNumStart(MUS_X)` → playMidiLoop('/decomp/em/music/mus_x.mid')
// Mapping song ID → URL via include/constants/songs.h.
// ═══════════════════════════════════════════════════════════════════════════════

/** Constants 1:1 décomp `include/constants/songs.h`. Re-exportés depuis la
 *  song-table extraite (532 entries). Re-export ici pour compat avec les
 *  imports existants `import { MUS_INTRO } from '../../src/decomp-globals'`.
 *  La constante `SONG_ID_TO_NAME` complète est importée en tête du fichier. */
export const MUS_INTRO = 414;          // mus_intro
export const MUS_INTRO_BATTLE = 442;   // mus_intro_battle
export const MUS_TITLE = 413;          // mus_title

// State du M4A engine maison (notre `src/engine/m4a/`). Init lazy via m4aPrime().
let _m4aPrimed = false;
type VgLookupFn = (name: string) => unknown;
let _vgLookup: VgLookupFn | null = null;
let _songVoicegroups: Record<string, string> | null = null;

/** Init audio engine (spessasynth_lib + emerald.sf2). Lazy au premier
 *  m4aSongNumStart. Idempotent. Précharge les 3 synth slots en parallèle pour
 *  que les premiers PlaySE n'aient PAS de latence cold-init (~1-2s SF2 load). */
async function m4aPrime(): Promise<void> {
  if (_m4aPrimed) return;
  const { getAudioContext } = await import('../m4a/audio-context');
  const { preloadAllSlots } = await import('../m4a/player');
  const { lookupVoicegroup } = await import('../m4a/voicegroups-data/_all-voicegroups-index');
  // Init AudioContext (requires user gesture — déjà eu via click TestGba→GameScene)
  getAudioContext();
  // Load song → voicegroup mapping (gardé pour les warnings PlaySE qui filtrent
  // les slots, même si spessasynth ne consomme plus le voicegroup data lui-même).
  const resp = await fetch('/decomp/em/music/song-voicegroups.json');
  _songVoicegroups = await resp.json() as Record<string, string>;
  _vgLookup = lookupVoicegroup as VgLookupFn;
  // Précharge les 3 synth slots (BGM + SE1 + SE2) en parallèle. Le SF2 buffer
  // est fetch 1 fois et partagé via slice() entre les 3 instances.
  await preloadAllSlots();
  // Pre-load the list of pre-rendered SE so first PlaySE() is correctly routed
  await preloadPrerenderedList();
  // Warm-up AudioContext + DAC pour éviter "PTCH" sur le 1er SE après page load.
  const { primeAudioContext } = await import('../m4a/audio-context');
  await primeAudioContext();
  _m4aPrimed = true;
  console.log('[decomp-globals] audio engine ready (spessasynth_lib + emerald.sf2, 3 slots préchargés)');
}

// Expose pour debug console
if (typeof globalThis !== 'undefined') {
  (globalThis as { __PlaySE?: typeof PlaySE }).__PlaySE = PlaySE;
(globalThis as Record<string, unknown>).__m4aSongNumStart = m4aSongNumStart;
}

/** 1:1 décomp `m4aSongNumStart(songId)` — démarre une song en boucle via NOTRE
 *  M4A engine maison (`src/engine/m4a/`). Pas SpessaSynth ni emerald.sf2.
 *  Async fire-and-forget : await m4aPrime() puis playSong().
 *  Le voicegroup est résolu via `song-voicegroups.json` (extracted décomp). */
// Song ID courante du slot BGM (= dernière song PLAYER 0 passée à
// m4aSongNumStart). Utilisée par le handler visibilitychange dans main.ts pour
// replay au retour de focus — les jingles SE2 n'y touchent PAS (sinon le
// retour de focus rejouerait le jingle au lieu du BGM).
let _currentSongId: number | null = null;
export function getCurrentSongId(): number | null { return _currentSongId; }
// Garde anti-course PAR SLOT (2 m4aSongNumStart concurrents sur des players
// différents ne doivent pas s'annuler — 1:1 GBA : players indépendants).
const _lastSongIdBySlot: Record<string, number> = {};

export function m4aSongNumStart(songId: number, loop: boolean = false): void {
  // 1:1 décomp : MUS_NONE (= 0xFFFF) et 0 = no music. Silent skip pour éviter
  // spam warnings sur les maps sans music (= MAP_INSIDE_OF_TRUCK et autres).
  if (songId === 0xFFFF || songId === 0) return;
  const songName = SONG_ID_TO_NAME[songId];
  if (!songName) {
    console.warn(`[m4aSongNumStart] song ID ${songId} not mapped, skip`);
    return;
  }
  // 1:1 gSongTable (sound/song_table.inc, colonne ms) : chaque song joue sur
  // SON music player — BGM=0, SE1=1, SE2=2, SE3=3. 🐛 fix 2026-07-02 (verdict
  // A/B) : les jingles MUS_* (mus_evolved, mus_level_up, mus_obtain_item… tous
  // PLAYER_SE2) jouent PAR-DESSUS le BGM sans le couper — avant, tout partait
  // sur le slot 'bgm' → PlayBGM(MUS_EVOLVED) REMPLAÇAIT MUS_EVOLUTION → silence
  // net à la fin du jingle. SE3 (7 sons météo/low-health) → slot 'se2' (pas de
  // 4e slot ; ces SE passent par le path PlaySE/noise en pratique).
  const player = getSongMusicPlayer(songName);
  const slot = player === 0 ? 'bgm' : player === 1 ? 'se1' : 'se2';
  if (slot === 'bgm') _currentSongId = songId;
  _lastSongIdBySlot[slot] = songId;
  // STOP IMMÉDIAT et SYNC du slot CIBLE uniquement (= 1:1 MPlayStart remplace
  // la song de CE player, les autres continuent). Static imports (top of file)
  // garantissent disponibilité immédiate. Critique pour éviter le micro-replay
  // de loop entre 2 BGMs.
  _staticStopSong(slot);
  void (async () => {
    try {
      await m4aPrime();
      const url = `/decomp/em/music/${songName}.mid`;
      const vgName = _songVoicegroups![songName];
      if (!vgName) {
        console.warn(`[m4aSongNumStart] no voicegroup mapping for ${songName}`);
        return;
      }
      const voicegroup = _vgLookup!(vgName);
      if (!voicegroup) {
        console.warn(`[m4aSongNumStart] voicegroup '${vgName}' not found in lookup`);
        return;
      }
      const midi = await _staticLoadMidi(url);
      // Re-vérification : si une autre m4aSongNumStart est passée entre-temps
      // SUR CE SLOT, skip pour ne pas écraser la nouvelle.
      if (_lastSongIdBySlot[slot] !== songId) return;
      // Reverb + volume par-song 1:1 décomp `sound/songs/midi/midi.cfg` (mid2agb args).
      // Ex : mus_intro = R50 V90 (overworld léger), mus_cave_of_origin = R90 (cavernes).
      const cfg = getSongConfig(songName);
      if (cfg && cfg.reverb !== null) _staticSetReverb(cfg.reverb);
      const songVol = cfg?.volume ?? null;
      // 1:1 GBA : LOOP encodé dans le .mid via markers `[` / `]` (mid2agb →
      // ply_goto vs ply_fine). On lit `BasicMIDI.loop` qui parse ces markers
      // et utilise loopCount=Infinity quand `loop.start !== loop.end`.
      // MUS_INTRO n'a PAS ces markers → loop.start === loop.end → one-shot.
      // L'arg `loop` explicite force le mode (pour dev tool / cas spécifiques).
      const midiLoop = (midi as { loop?: { start: number; end: number } }).loop;
      const hasLoopMarkers = !!midiLoop && midiLoop.start !== midiLoop.end;
      const useLoop = loop || hasLoopMarkers;
      await (_staticPlaySong as (m: unknown, vg: unknown, lookup: VgLookupFn, loop: boolean, slot: string, volume: number | null) => Promise<void>)(
        midi, voicegroup, _vgLookup!, useLoop, slot, songVol,
      );
      console.log(`[m4aSongNumStart] playing ${url} (vg=${vgName}) slot=${slot} V=${songVol ?? 'default'} loop=${useLoop}${hasLoopMarkers ? ' (auto-detected)' : ''}`);
    } catch (e) {
      console.error('[m4aSongNumStart] failed:', e);
    }
  })();
}

/** 1:1 décomp `m4aMPlayAllStop()` — stoppe tout playback M4A (BGM + SE).
 *  Utilise `stopAllSongs()` du player qui boucle sur les 3 slots (bgm/se1/se2).
 *  SYNC obligatoire (import statique) : la version `import().then()` différait le
 *  stop APRÈS le playSong d'un m4aSongNumStart appelé juste ensuite quand le .mid
 *  était déjà en cache (combat 2+) → tuait la BGM de combat fraîchement lancée =
 *  « plus de musique » au 2e combat (bug user 2026-06-12). Ordre strict 1:1 ROM :
 *  PlayBattleBGM = m4aMPlayAllStop PUIS PlayBGM. */
export function m4aMPlayAllStop(): void {
  _staticStopAllSongs();
}

/** 1:1 décomp `FillPalBufferBlack()` (field_screen_effect.c:69-72) :
 *    `CpuFastFill16(RGB_BLACK, gPlttBufferFaded, PLTT_SIZE)`
 *  Reset toute la palette Faded à BLACK. Utilisé par `WarpFadeInScreen` AVANT
 *  `FadeScreen(FADE_FROM_BLACK)` pour s'assurer que l'écran démarre BLACK
 *  avant le fade in (= sinon LoadMapTilesetPalettes a écrit les NEW colors
 *  dans Faded → flash en couleur normale avant le fade). */
export function FillPalBufferBlack(): void {
  const r = getRuntime();
  if (!r) return;
  for (let i = 0; i < 512; i++) {
    r.gPlttBufferFaded.set(i, 0);  // RGB_BLACK = 0
  }
}

/** 1:1 décomp `FillPalBufferWhite()` (field_screen_effect.c:64-67) — idem
 *  pour WHITE (= warp transitions vers/depuis interior maps avec fade white). */
export function FillPalBufferWhite(): void {
  const r = getRuntime();
  if (!r) return;
  const RGB_WHITE = 0x7FFF;  // 31, 31, 31
  for (let i = 0; i < 512; i++) {
    r.gPlttBufferFaded.set(i, RGB_WHITE);
  }
}

/** 1:1 décomp `PlayBGM(songNum)` (sound.c:563) :
 *    if (gDisableMusic) songNum = 0;
 *    if (songNum == MUS_NONE) songNum = 0;
 *    m4aSongNumStart(songNum);
 *
 *  Wrapper qui dispatch vers notre m4aSongNumStart (= slot bgm via M4A engine
 *  custom). Avant ce wrapper, les `PlayBGM(MUS_X)` des auto-callbacks tombaient
 *  en undefined → BGM silence partout dans menus. */
/** 1:1 décomp constants/songs.h : `#define MUS_NONE 0xFFFF`.
 *  Migré vers import decomp-data songs-data.ts (cleanup B7). */
const MUS_NONE = _MUS_NONE;
let _gDisableMusic = false;
export function PlayBGM(songNum: number): void {
  // Délégation FOYER 1:1 src/sound.ts (__soundPlayBGM) : sound.c:563 fait
  // `songNum = 0` sur MUS_NONE/gDisableMusic puis m4aSongNumStart(0) = jouer
  // MUS_DUMMY = STOP du BGM — l'ancien early-return d'ici laissait l'ancienne
  // musique tourner (divergence). Fallback historique si sound.ts pas encore
  // évalué (boot précoce).
  const foyer = (globalThis as Record<string, unknown>).__soundPlayBGM as ((n: number) => void) | undefined;
  if (foyer) { foyer(songNum); return; }
  if (_gDisableMusic) return;
  if (songNum === MUS_NONE || songNum === 0) return;
  m4aSongNumStart(songNum);
}

/** 1:1 décomp `gDisableMusic` accessor (= utilisé par option menu). Route AUSSI
 *  vers le foyer src/sound.ts (gDisableMusic unique, lu par PlayBGM/FadeInNewBGM). */
export function setDisableMusic(v: boolean): void {
  _gDisableMusic = v;
  const foyer = (globalThis as Record<string, unknown>).__soundSetDisableMusic as ((v: boolean) => void) | undefined;
  foyer?.(v);
}
export function getDisableMusic(): boolean { return _gDisableMusic; }

/** Jeton anti-chevauchement des fanfares : seule la DERNIÈRE fanfare a le droit
 *  de reprendre le BGM (1:1 sFanfareCounter écrasé par la fanfare suivante). */
let _fanfareGen = 0;

/** 1:1 décomp `PlayFanfare(songNum)` (sound.c:217 → PlayFanfareByFanfareNum:171) :
 *    m4aMPlayStop(&gMPlayInfo_BGM);   // PAUSE le player BGM (position conservée)
 *    m4aSongNumStart(fanfare);        // la fanfare joue sur SON player
 *    … Task_Fanfare (fin du compteur sFanfares[].duration) :
 *    m4aMPlayContinue(&gMPlayInfo_BGM);  // REPREND le BGM où il en était
 *
 *  Notre port : pauseSong('bgm') + fanfare sur le slot DÉDIÉ 'fanfare' +
 *  resumeSong('bgm') à la durée réelle du .mid. (L'ancien code jouait la
 *  fanfare SUR le slot bgm = écrasait la BGM (fanfare de victoire incluse)
 *  sans jamais la reprendre — bug user 2026-06-12 « le SE de la barre d'exp
 *  ne remet pas le BGM ».)
 *
 *  `_markAudioSlotActive('fanfare', …)` garde IsFanfareTaskInactive()/WaitFanfare
 *  exacts (l'opcode waitfanfare bloque pendant la fanfare). */
export function PlayFanfare(songNum: number): void {
  const name = SONG_ID_TO_NAME[songNum];
  if (!name) {
    console.warn(`[PlayFanfare] song ${songNum} not mapped`);
    return;
  }
  const gen = ++_fanfareGen;
  // 1:1 m4aMPlayStop(&gMPlayInfo_BGM) — pause, position conservée.
  _staticPauseSong('bgm');
  // Provisoire (raffiné par la durée réelle du .mid une fois chargé).
  _markAudioSlotActive('fanfare', 3000);
  void (async () => {
    const resume = (): void => { if (gen === _fanfareGen) _staticResumeSong('bgm'); };
    try {
      await m4aPrime();
      const vgName = _songVoicegroups![name];
      const voicegroup = vgName ? _vgLookup!(vgName) : null;
      if (!voicegroup) {
        console.warn(`[PlayFanfare] voicegroup KO pour ${name}`);
        resume();
        return;
      }
      const midi = await _staticLoadMidi(`/decomp/em/music/${name}.mid`);
      if (gen !== _fanfareGen) return;  // une autre fanfare a pris la main
      const cfg = getSongConfig(name);
      if (cfg && cfg.reverb !== null) _staticSetReverb(cfg.reverb);
      const durMs = Math.max(500, ((midi as { duration?: number }).duration ?? 2.5) * 1000);
      _markAudioSlotActive('fanfare', durMs);
      await (_staticPlaySong as (m: unknown, vg: unknown, lookup: VgLookupFn, loop: boolean, slot: string, volume: number | null) => Promise<void>)(
        midi, voicegroup, _vgLookup!, false, 'fanfare', cfg?.volume ?? null,
      );
      // 1:1 Task_Fanfare : à la fin de la fanfare → m4aMPlayContinue(BGM).
      setTimeout(resume, durMs);
    } catch (e) {
      console.warn('[PlayFanfare] KO', e);
      resume();
    }
  })();
}

/** 1:1 décomp `PlayFanfareByFanfareNum` — alias avec id différent (= identique). */
export function PlayFanfareByFanfareNum(num: number): void { PlayFanfare(num); }

// Note : IsFanfareTaskInactive est ré-exporté plus bas avec real tracking
// (= IsSEPlaying / IsCryPlaying / IsCryFinished / IsFanfareTaskInactive section).
// L'ancien stub `return true` est remplacé par check `_audioEndTimeMs.fanfare`.

/** 1:1 STRICT décomp `WaitFanfare(stop)` (sound.c:189-203) :
 *    if (sFanfareCounter) { sFanfareCounter--; return FALSE; }
 *    else { m4aMPlayContinue/m4aSongNumStart ; return TRUE; }
 *
 *  Notre port : utilise `_audioEndTimeMs.fanfare` pour tracker la durée
 *  restante. Si encore en cours → return false (pas done). Sinon return true.
 *  Le décomp `stop` arg (= force stop) wired vers _staticStopSong('bgm') si
 *  user demande arrêt forcé. */
export function WaitFanfare(stop: boolean = false): boolean {
  if (_audioEndTimeMs.fanfare > performance.now()) {
    return false;  // 1:1 décomp : sFanfareCounter > 0 → return FALSE.
  }
  if (stop) {
    // 1:1 décomp : m4aSongNumStart(MUS_DUMMY) = stop bgm. Notre équivalent.
    _staticStopSong('bgm');
  }
  // Sinon : m4aMPlayContinue(&gMPlayInfo_BGM) — bgm resume si paused.
  // Notre archi : bgm continue de jouer naturellement quand fanfare end.
  return true;  // 1:1 décomp : sFanfareCounter == 0 → return TRUE.
}

/** 1:1 décomp `StopFanfare` — stoppe le fanfare en cours. MVP : stop bgm slot. */
export function StopFanfare(): void { _staticStopSong('bgm'); }

/** Pause la BGM courante sans la détruire. resumeBgm() reprend depuis la pause.
 *  Cf. devtool Play/Pause toggle. À ne PAS confondre avec m4aMPlayAllStop qui
 *  détruit la Sequencer (= bug de relance même MIDI après destruction). */
export function pauseBgm(): void {
  _staticPauseSong('bgm');
}

/** Resume la BGM précédemment pausée via pauseBgm(). */
export function resumeBgm(): void {
  _staticResumeSong('bgm');
}

/** True si la BGM est dans un état pausé (= playing puis paused, pas stopped). */
export function isBgmPaused(): boolean {
  return _staticIsPaused('bgm');
}

/** 1:1 décomp `PlaySE(seId)` — joue un sound effect one-shot.
 *
 *  ARCHITECTURE 1:1 GBA : la décomp utilise des slots `gMPlayInfo_SE1` et
 *  `gMPlayInfo_SE2` SÉPARÉS du `gMPlayInfo_BGM` (cf src/m4a.c:13-21). Ainsi
 *  un SE et la BGM coexistent. Notre player.ts a maintenant la même
 *  architecture : 3 slots `bgm`/`se1`/`se2` indépendants avec leurs propres
 *  generations + activeNotes + scheduledTimers.
 *
 *  Mapping seId → song name via la table complète extraite de songs.h.
 *  Voicegroup résolu via song-voicegroups.json (rs_sfx_1 / rs_sfx_2 / frlg_sfx). */
let _seSlotToggle: 'se1' | 'se2' = 'se1';
export function PlaySE(seId: number): void {
  const name = SONG_ID_TO_NAME[seId];
  if (!name) {
    console.warn(`[PlaySE] SE id ${seId} not mapped — songs.h missing entry?`);
    return;
  }
  // 1:1 décomp sound.c `PlaySE(songNum) = m4aSongNumStart(&gMPlay_SE1/2, songNum)` :
  // le routage vers le player SE vient de la SONG TABLE, pas du nom — la décomp
  // joue AUSSI des jingles MUS_* en SE (ex. evolution_scene.c:678
  // PlaySE(MUS_EVOLUTION_INTRO), gaté ensuite par IsSEPlaying). Le guard ne
  // rejette donc que les vraies BGM de map (mus_* AVEC loop markers = jamais
  // passées à PlaySE dans la décomp) ; les jingles one-shot mus_* passent par
  // le path spessasynth slot SE ci-dessous (durée trackée → IsSEPlaying 1:1).
  if (!name.startsWith('se_') && !name.startsWith('ph_') && !name.startsWith('mus_')) {
    console.warn(`[PlaySE] id ${seId} = ${name} is NOT a SE/PH/MUS — use m4aSongNumStart instead`);
    return;
  }
  // Alterne entre se1 et se2 (= 1:1 décomp src/sound.c:577-598 : si SE1
  // occupé, utilise SE2). Permet 2 SE simultanés.
  const slot: 'se1' | 'se2' = _seSlotToggle;
  _seSlotToggle = slot === 'se1' ? 'se2' : 'se1';

  // CRITICAL : await m4aPrime AVANT de check hasPrerenderedSE.
  // Sinon le 1er PlaySE après page load voit la list pas encore loaded,
  // hasPrerenderedSE return false, on tombe sur le path runtime LFSR/spessasynth
  // au lieu du pre-rendered WAV → garbage au 1er play, OK au 2ème (bug observé).
  void (async () => {
    try {
      await m4aPrime();  // = await la list de pre-rendered + audio prime

      // Now safe to check : SE pré-rendus prennent priorité
      if (hasPrerenderedSE(name)) {
        const cfg = getSongConfig(name);
        if (cfg && cfg.reverb !== null) _staticSetReverb(cfg.reverb);
        const seSongVol = cfg?.volume ?? null;
        _staticStopSong(slot);  // = sécurité, stop any spessasynth song
        // 1:1 décomp : track end time pour IsSEPlaying (= waitse opcode).
        // Durée connue via getPrerenderedSEDuration si déjà cached (sinon ~600ms default).
        const { getPrerenderedSEDuration } = await import('../m4a/se-noise-prerendered');
        const durSec = getPrerenderedSEDuration(name);
        _markAudioSlotActive(slot, (durSec ?? 0.6) * 1000);
        await playPrerenderedSE(name, slot, seSongVol);
        return;
      }

      // Fallback : spessasynth path pour les SE non-pre-rendus
      const url = `/decomp/em/music/${name}.mid`;
      const vgName = _songVoicegroups![name];
      if (!vgName) {
        console.warn(`[PlaySE] no voicegroup for ${name}`);
        return;
      }
      const voicegroup = _vgLookup!(vgName);
      if (!voicegroup) {
        console.warn(`[PlaySE] voicegroup '${vgName}' not in lookup`);
        return;
      }
      const midi = await _staticLoadMidi(url);
      // 1:1 décomp : track end time pour IsSEPlaying. Pour spessasynth path :
      // utilise midi.duration si disponible, sinon ~800ms default (= SE moyenne).
      const midiDur = (midi as { duration?: number }).duration ?? 0.8;
      _markAudioSlotActive(slot, midiDur * 1000);
      // Reverb + volume par-song : si midi.cfg a des valeurs, on les respecte.
      // Sinon on hérite du reverb BGM courant (= comportement 1:1 GBA m4aSoundMode).
      const cfg = getSongConfig(name);
      if (cfg && cfg.reverb !== null) _staticSetReverb(cfg.reverb);
      const seSongVol = cfg?.volume ?? null;
      // APPROCHE HYBRIDE : si la SE utilise une noise voice (Type 12 = LFSR PSG
      // hardware GBA), spessasynth/SF2 reproduit MAL (pitch-shift d'un sample
      // au lieu du LFSR pseudo-random). On route vers le custom synth pre-P8
      // (white noise + biquad) qui sonne plus authentique pour les SE crash/blast.
      // SE = spessasynth pour tous (= unifié avec BGM, pas d'hybrid Phase 8).
      // Le hybrid LFSR custom utilisait noise-engine.ts du Phase 8 abandonné
      // (sessions 75-77 bisect : bug systémique). Quand on l'utilisait pour SE
      // noise, ça déconnait (bruit blanc fort). Cf. memory project_audio_engine_status.
      // Compromis : SE noise (intro_blast etc) sonne 'Bird Tweet'-ish via SF2
      // pitch-shift au lieu d'un crash LFSR authentique. Acceptable pour MVP.
      await (_staticPlaySong as (m: unknown, vg: unknown, lookup: VgLookupFn, loop: boolean, slot: string, volume: number | null) => Promise<void>)(
        midi, voicegroup, _vgLookup!, false, slot, seSongVol,
      );
    } catch (e) {
      console.error('[PlaySE] failed:', e);
    }
  })();
}

/** Map species ID → species name (= cri filename `cries/<name>.wav`).
 *  1:1 décomp `include/constants/species.h` — mapping généré dynamiquement
 *  depuis `public/decomp/em/constants.json` (SPECIES_*) + cries.json (filename).
 *  Au boot, `loadSpeciesNamesAsync()` populate ce map (= 388+ species). */
const SPECIES_NAMES: Record<number, string> = {};
let _speciesNamesLoaded = false;
let _speciesNamesLoadingPromise: Promise<void> | null = null;

/** Charge async la map species ID → name via cries.json + species-data.ts.
 *  Bug session 89 fix : avant on lisait `constants.json` qui ne contient PAS
 *  les `SPECIES_X = N` (constants.json a uniquement les flags + items + maps).
 *  Les species IDs vivent dans `auto/include/constants/species-data.ts` (= 387
 *  consts `export const SPECIES_X = N`). On les import direct + on cross-ref
 *  avec cries.json pour résoudre l'ID → cry filename.
 *
 *  À call au boot (= GameScene.preload). Idempotent. */
export async function loadSpeciesNamesAsync(): Promise<void> {
  if (_speciesNamesLoaded) return;
  if (_speciesNamesLoadingPromise) return _speciesNamesLoadingPromise;
  _speciesNamesLoadingPromise = (async () => {
    try {
      // species-data.ts exporte tous les `SPECIES_X = N`. Module import = sync
      // après bundling, mais on dynamic-import pour rester async-safe.
      const [speciesData, criesResp] = await Promise.all([
        import('../../include/constants/species'),
        fetch('/decomp/em/cries.json'),
      ]);
      const cries = await criesResp.json() as Record<string, string>;
      // Iterate species-data exports : pour chaque SPECIES_X = N, lookup cries[SPECIES_X].
      for (const [key, value] of Object.entries(speciesData)) {
        if (!key.startsWith('SPECIES_')) continue;
        if (typeof value !== 'number') continue;
        const cryPath = cries[key];
        if (!cryPath) continue;
        // cryPath = "cries/lotad.wav" → "lotad"
        const m = cryPath.match(/cries\/(.+)\.wav$/);
        if (m) SPECIES_NAMES[value] = m[1];
      }
      _speciesNamesLoaded = true;
      console.log('[loadSpeciesNamesAsync] loaded', Object.keys(SPECIES_NAMES).length, 'species cry mappings');
    } catch (e) {
      console.warn('[loadSpeciesNamesAsync] failed:', e);
    }
  })();
  return _speciesNamesLoadingPromise;
}

/** 1:1 décomp `PlayCryInternal(species, pan, volume, priority, mode)` — joue
 *  le cri d'un Pokémon via WAV pré-extrait. Phase 7 minimal : ignore pan/volume/
 *  priority/mode (le décomp ajuste pitch/pan via m4a, ici on joue le WAV direct). */
export function PlayCryInternal(
  species: number, _pan: number, _volume: number, _priority: number, _mode: number,
): void {
  const name = SPECIES_NAMES[species];
  console.log('[PlayCryInternal] species=', species, 'name=', name, 'loaded=', _speciesNamesLoaded);
  if (!name) {
    // Si pas encore chargé, fire async load + skip cry pour ce frame
    if (!_speciesNamesLoaded) {
      console.warn('[PlayCryInternal] SPECIES_NAMES not loaded, kicking async load');
      void loadSpeciesNamesAsync();
    } else {
      console.warn('[PlayCryInternal] no name for species', species, '(loaded but missing entry)');
    }
    return;
  }
  // 1:1 décomp : track cry end time pour IsCryPlaying / IsCryFinished /
  // waitmoncry. Durée approximée à 1 sec par défaut (= moy. cri Émeraude),
  // overridée par la vraie durée du WAV via _markCryActive depuis music.playCry.
  _audioEndTimeMs.cry = performance.now() + 1000;
  void import('../m4a/music').then(({ playCry }) => {
    console.log('[PlayCryInternal] calling playCry(', name, ')');
    playCry(name);
  }).catch((e) => { console.error('[PlayCryInternal] import or playCry threw:', e); });
}

// Canal cris des anims combat : battle_anim_sound_tasks (_playCryOf → GROWL/ROAR/
// Hyper Voice…) lit `globalThis.__playCry` qui n'était ÉCRIT NULLE PART → tous les
// cris d'anims étaient muets (no-op silencieux). Pan ignoré (même dette que
// PlayCryInternal).
(globalThis as Record<string, unknown>).__playCry = (species: number, pan?: number) =>
  PlayCryInternal(species, pan ?? 0, 0, 0, 0);

// ─── 1:1 décomp IsSEPlaying / IsCryPlaying / IsCryFinished / IsFanfareTaskInactive ─
// Source : src/sound.c. Décomp utilise gMPlayInfo_SE1/2.status (= hardware m4a
// state). Notre port utilise spessasynth + raw AudioBufferSource → on tracke
// les end times et le state des slots m4a/player.ts.

/** Track des fin-of-audio timestamps en ms (performance.now). Décrémenté
 *  passivement (= no setTimeout, just check now() > endTimeMs). Utilisé par
 *  waitse / waitmoncry / waitfanfare opcodes pour real tracking. */
const _audioEndTimeMs: { se1: number; se2: number; cry: number; bgm: number; fanfare: number } = {
  se1: 0, se2: 0, cry: 0, bgm: 0, fanfare: 0,
};

/** Appelé par PlaySE (et autres entrées audio) pour marquer un slot actif.
 *  durationMs = durée estimée de la SE/cry/etc. Si pas connu, default ~600ms. */
export function _markAudioSlotActive(slot: 'se1' | 'se2' | 'cry' | 'bgm' | 'fanfare', durationMs: number): void {
  _audioEndTimeMs[slot] = performance.now() + durationMs;
}

/** 1:1 décomp `IsSEPlaying` (sound.c:577) :
 *    if ((gMPlayInfo_SE1.status & PAUSE) && (gMPlayInfo_SE2.status & PAUSE)) return FALSE;
 *    if (!(gMPlayInfo_SE1.status & TRACK) && !(gMPlayInfo_SE2.status & TRACK)) return FALSE;
 *    return TRUE;
 *  Notre version : check soit slot m4a (sequencer), soit slot prerendered
 *  (BufferSourceNode active), soit end time tracker. TRUE si au moins un est
 *  encore en train de jouer.
 */
export function IsSEPlaying(): boolean {
  const now = performance.now();
  if (_audioEndTimeMs.se1 > now || _audioEndTimeMs.se2 > now) return true;
  // Fallback : check via player.ts isPlaying (= spessasynth sequencer state)
  try {
    const { isPlaying } = require('./m4a/player') as { isPlaying: (slot: string) => boolean };
    if (isPlaying('se1') || isPlaying('se2')) return true;
  } catch { /* skip */ }
  // Fallback : check prerendered BufferSourceNode pool
  try {
    const { isPrerenderedSlotActive } = require('./m4a/se-noise-prerendered') as { isPrerenderedSlotActive: (slot: string) => boolean };
    if (isPrerenderedSlotActive('se1') || isPrerenderedSlotActive('se2')) return true;
  } catch { /* skip */ }
  return false;
}

/** 1:1 décomp `IsCryPlaying` (sound.c) :
 *    return IsPokemonCryPlaying(gMPlay_PokemonCry) ? TRUE : FALSE;
 *  Notre version : end time tracker. Set par PlayCryInternal + music.playCry. */
export function IsCryPlaying(): boolean {
  return _audioEndTimeMs.cry > performance.now();
}

/** 1:1 décomp `IsCryFinished` (sound.c:566) :
 *    if (FuncIsActiveTask(Task_DuckBGMForPokemonCry) == TRUE) return FALSE;
 *    else { ClearPokemonCrySongs(); return TRUE; }
 *  Notre version : returns !IsCryPlaying. */
export function IsCryFinished(): boolean {
  return !IsCryPlaying();
}

/** 1:1 décomp `IsFanfareTaskInactive` (sound.c) :
 *    if (FuncIsActiveTask(Task_Fanfare) == TRUE) return FALSE;
 *    return TRUE;
 *  Notre version : check fanfare end time + m4a slot. */
export function IsFanfareTaskInactive(): boolean {
  if (_audioEndTimeMs.fanfare > performance.now()) return false;
  return true;
}

// ─── Expose audio state functions sur globalThis pour script-opcodes ────────
// Évite cycle d'import : script-opcodes.ts lit globalThis.__decompGlobals au
// lieu d'importer directement de decomp-globals.ts.
(globalThis as { __decompGlobals?: Record<string, unknown> }).__decompGlobals = {
  IsSEPlaying, IsCryPlaying, IsCryFinished, IsFanfareTaskInactive,
  // T5 shiny : acces par TAG (battle_anim_throw _LoadGoldStarsGfx, anti-cycle).
  GetSpriteTileStartByTag, LoadCompressedSpriteSheetUsingHeap, LoadCompressedSpritePaletteUsingHeap,
};

// ─── Side-effect imports : load modules qui s'auto-registrent sur globalThis ─
// flash-mask.ts (harness) auto-register __applyFlashMask pour phaser-bridge post-process.
import '../gba/flash-mask';
// money box (money.ts) + coins box (coins.ts) auto-register __moneyBoxUI à leur chargement
// (importés par scrcmd qui porte les opcodes show/hide/update money&coins) → import explicite
// inutile ici (1:1 : money.c/coins.c portent ces fns ; lues par scrcmd via globalThis lazy).
// virtual-objects.ts auto-register __virtualObjects pour createvobject/turnvobject opcodes.
import '../../src/engine/field/virtual-objects';
// __mapLayoutSwap (setmaplayoutindex) : auto-register au chargement de src/fieldmap.ts (lot 13).

/** 1:1 décomp constants pour PlayCryInternal (cf. species.h, sound.h). */
export const SPECIES_GROUDON = 405;
export const SPECIES_KYOGRE = 404;
export const SPECIES_RAYQUAZA = 406;
export const CRY_PRIORITY_NORMAL = 2;
export const CRY_MODE_NORMAL = 0;

/** 1:1 décomp `SE_INTRO_BLAST` — sound effect ID 103 (cf. songs.h:109).
 *  Fix critique : avant cette session la valeur était 0x14 (= 20 = se_bang),
 *  cause d'une copie hardcodée. PlaySE(SE_INTRO_BLAST) appelait donc PlaySE(20)
 *  qui jouait se_bang à la place du blast Rayquaza. */
export const SE_INTRO_BLAST = 103;

/** 1:1 décomp src/intro.c:2810 `PanFadeAndZoomScreen(screenX, screenY, zoom, alpha)`.
 *  Calcule BgAffineSet pour BG2 (texture (0x8000, 0x8000) → screen (screenX, screenY))
 *  avec zoom (sx=sy) et rotation (alpha). Met à jour BG2PA/PB/PC/PD + BG2X/Y. */
export function PanFadeAndZoomScreen(screenX: number, screenY: number, zoom: number, alpha: number): void {
  const r = rt();
  const texX = 0x8000;
  const texY = 0x8000;
  // BgAffineSet : alpha en u16 (0..0xFFFF = 0..360°), interprété via gSineTable.
  // sin/cos en Q.8 fixed (-256..256). pa = cos*sx >> 8, pb = -sin*sy >> 8, etc.
  const G_SINE = G_SINE_TABLE;
  // sineIdx = (alpha >> 8) & 0xFF (256 entries par tour complet)
  const sineIdx = (alpha >> 8) & 0xFF;
  const cosIdx = (sineIdx + 64) & 0xFF;
  const sin = G_SINE[sineIdx];
  const cos = G_SINE[cosIdx];
  // Q.8 fixed math : (cos * zoom) >> 8 = pa
  const pa = (cos * zoom) >> 8;
  const pb = (-sin * zoom) >> 8;
  const pc = (sin * zoom) >> 8;
  const pd = (cos * zoom) >> 8;
  // 1:1 BIOS BgAffineSet : src.texX/texY sont DÉJÀ 28.8 fixed (= 0x8000 = 128.0 px).
  // dest.dx = src.texX - (scrX * pa + scrY * pb). Pas de shift << 8 supplémentaire !
  const dx = texX - (screenX * pa + screenY * pb);
  const dy = texY - (screenX * pc + screenY * pd);
  // Set BG2 affine matrix index 0 (= bg(2).config.affineMatrixIndex)
  if (r.gba.bgAffineMatrices && r.gba.bgAffineMatrices[0]) {
    const m = r.gba.bgAffineMatrices[0] as { pa: number; pb: number; pc: number; pd: number };
    m.pa = pa & 0xFFFF;
    m.pb = pb & 0xFFFF;
    m.pc = pc & 0xFFFF;
    m.pd = pd & 0xFFFF;
  }
  // Sign-extend pour BG2X/Y (28-bit signed)
  r.gba.bg(2).config.affineRefX = dx;
  r.gba.bg(2).config.affineRefY = dy;
}

/** 1:1 décomp `SAFE_DIV(x, y)` macro = (y == 0) ? 0 : (x / y). */
export function SAFE_DIV(x: number, y: number): number {
  return y === 0 ? 0 : Math.floor(x / y);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 STUBS (Phase 2 minimum viable — ne pas crasher, atteindre Title screen)
// Scene 3 sera visuellement cassée (Groudon/Kyogre/Rayquaza pas affichés) mais
// la chaîne Tasks continue jusqu'à Task_EndIntroMovie → CB2_InitTitleScreen.
// TODO Phase 3 : implémenter pleinement Scene 3 avec preload + LZ77 + sprites.
// ═══════════════════════════════════════════════════════════════════════════════

/** Alias LZDecompressVram = LZ77UnCompVram. Wrap try/catch pour que asset
 *  manquant ne crash pas la Task entière (= juste warning). */
export function LZDecompressVram(srcSymbol: string, destAddr: number): void {
  try {
    LZ77UnCompVram(srcSymbol, destAddr);
  } catch (e) {
    console.warn(`[LZDecompressVram] ${srcSymbol} failed (asset not preloaded), continuing:`, (e as Error).message);
  }
}

/** Scene 3 sprite/palette loading via heap dans le décomp. Notre version
 *  fait juste appel aux fonctions normales (pas besoin de heap puisque assets
 *  préchargés en VRAM via `LoadCompressedSpriteSheet` standard). */
export function LoadCompressedSpriteSheetUsingHeap(sheet: unknown): void {
  if (!sheet) return;
  // sheet peut être un objet single ou un array (cas LoadCompressedSpriteSheet).
  if (Array.isArray(sheet)) {
    const first = sheet[0] as { data: string, size: number, tag: string | number } | undefined;
    if (first) LoadCompressedSpriteSheet(first);
  } else {
    LoadCompressedSpriteSheet(sheet as { data: string, size: number, tag: string | number });
  }
}
export function LoadCompressedSpritePaletteUsingHeap(pal: unknown): void {
  if (!pal) return;
  if (Array.isArray(pal)) {
    LoadSpritePalettes(pal as Array<{ data: string, tag: string | number }>);
  } else {
    LoadSpritePalette(pal);
  }
}
export function FreeMonSpritesGfx(): void { /* no-op : pas de heap chez nous */ }

// GET_TRUE_SPRITE_INDEX re-exporté depuis decomp-helpers (= source unique).

/** 1:1 décomp battle anim sprite sheets/palettes — gBattleAnimPicTable est une
 *  table sparse ; on utilise un Proxy-like accès via Map pour pas remplir 256 stubs.
 *  Scene 3 ANIM_TAG_ROCKS = 10058 → index 58. */
const _battleAnimPicEntries: Record<number, { data: string; size: number; tag: string | number }> = {
  // Index 58 = ROCKS (ANIM_TAG_ROCKS)
  58: { data: 'gBattleAnimSpriteGfx_Rocks', size: 0x600, tag: 'ANIM_TAG_ROCKS' },
};
const _battleAnimPalEntries: Record<number, { data: string; tag: string | number }> = {
  58: { data: 'gBattleAnimSpritePal_Rocks', tag: 'ANIM_TAG_ROCKS' },
};

// Length 256 max, retourne stub vide pour index inconnu (= no-op load).
function _emptyAnimPic(idx: number) { return { data: '', size: 0, tag: idx }; }
function _emptyAnimPal(idx: number) { return { data: '', tag: idx }; }
export const gBattleAnimPicTable: ReadonlyArray<{ data: string; size: number; tag: string | number }> = new Proxy([], {
  get(_t, prop) {
    if (typeof prop === 'string' && /^\d+$/.test(prop)) {
      const idx = Number(prop);
      return _battleAnimPicEntries[idx] ?? _emptyAnimPic(idx);
    }
    if (prop === 'length') return 256;
    return undefined;
  },
}) as unknown as ReadonlyArray<{ data: string; size: number; tag: string | number }>;
export const gBattleAnimPaletteTable: ReadonlyArray<{ data: string; tag: string | number }> = new Proxy([], {
  get(_t, prop) {
    if (typeof prop === 'string' && /^\d+$/.test(prop)) {
      const idx = Number(prop);
      return _battleAnimPalEntries[idx] ?? _emptyAnimPal(idx);
    }
    if (prop === 'length') return 256;
    return undefined;
  },
}) as unknown as ReadonlyArray<{ data: string; tag: string | number }>;

/** Symbol-name keys pour gBattleAnimSpriteGfx_Rocks (preload Scene 3). */
export const gBattleAnimSpriteGfx_Rocks = 'gBattleAnimSpriteGfx_Rocks';
export const gBattleAnimSpritePal_Rocks = 'gBattleAnimSpritePal_Rocks';

/** 1:1 décomp `gReservedSpritePaletteCount` — nombre de palettes OBJ
 *  réservées par le système. Le décomp le set à 8 pendant l'intro. */
export let gReservedSpritePaletteCount = 0;
export function setReservedSpritePaletteCount(v: number): void { gReservedSpritePaletteCount = v; }

// Scene 3 symbol-name strings (asset cache keys)
export const gIntroGroudon_Gfx = 'gIntroGroudon_Gfx';
export const gIntroGroudon_Tilemap = 'gIntroGroudon_Tilemap';
export const gIntroKyogre_Gfx = 'gIntroKyogre_Gfx';
export const gIntroKyogre_Tilemap = 'gIntroKyogre_Tilemap';
export const gIntroLegendBg_Gfx = 'gIntroLegendBg_Gfx';
export const gIntroGroudonBg_Tilemap = 'gIntroGroudonBg_Tilemap';
export const gIntroKyogreBg_Tilemap = 'gIntroKyogreBg_Tilemap';
export const gIntroClouds_Gfx = 'gIntroClouds_Gfx';
export const gIntroCloudsSun_Tilemap = 'gIntroCloudsSun_Tilemap';
export const gIntroCloudsLeft_Tilemap = 'gIntroCloudsLeft_Tilemap';
export const gIntroCloudsRight_Tilemap = 'gIntroCloudsRight_Tilemap';
export const gIntroRayquaza_Tilemap = 'gIntroRayquaza_Tilemap';
export const gIntroRayquazaClouds_Tilemap = 'gIntroRayquazaClouds_Tilemap';
export const gIntroRayquaza_Gfx = 'gIntroRayquaza_Gfx';
export const gIntroRayquazaClouds_Gfx = 'gIntroRayquazaClouds_Gfx';
export const gIntro3Bg_Pal = 'gIntro3Bg_Pal';

// ─── Scanline effect → MIROIR 1:1 dans src/game/scanline_effect.ts ──────────
// gScanlineEffect(RegBuffers) + Clear/Stop/SetParams/InitHBlankDmaTransfer +
// InitWave sont portés 1:1 dans src/game/scanline_effect.ts (qui pose aussi
// globalThis.__scanlineEffectTick). Ré-exportés ici pour les imports existants.
export {
  gScanlineEffectRegBuffers, gScanlineEffect,
  ScanlineEffect_Clear, ScanlineEffect_Stop, ScanlineEffect_SetParams,
  ScanlineEffect_InitHBlankDmaTransfer, ScanlineEffect_InitWave,
} from '../../src/scanline_effect';

// ═══════════════════════════════════════════════════════════════════════════════
// TITLE SCREEN STUBS (Phase 3 minimum viable)
// ═══════════════════════════════════════════════════════════════════════════════

/** Stubs helpers missing du décomp utilisés par CB2_InitTitleScreen.
 *
 *  DmaFill16 = clear memory range. Le décomp l'utilise pour clear VRAM/OAM/PLTT
 *  avant de charger la nouvelle scene. Mais notre runtime ordonne mal les calls
 *  (les LZ77 sont déjà appelés AVANT DmaFill via async preload), donc DmaFill
 *  efface ce qu'on vient de charger. SOLUTION pragmatique : log les calls pour
 *  debug, mais NE PAS effacer la VRAM (= notre engine fait sa propre gestion).
 *  Tilemap ranges restent 0 parce que les LZ77 tilemaps écrivent après.
 *
 *  IMPORTANT : le décomp original DOIT clear la VRAM car les samples existants
 *  bleed sur les nouvelles scenes. Chez nous on a un VRAM unifié + transitions
 *  contrôlées via gMain.state, donc on peut skip le clear. */
/** 1:1 décomp `DmaFill16(channel, value, dest, size)` : fill bytes à `dest` avec
 *  `value` u16 répété. Routes : VRAM (0x06000000), OAM (0x07000000), PLTT (0x05000000).
 *
 *  Phase E fix : real impl (= était no-op qui laissait du garbage VRAM/tilemap
 *  entre transitions Birch → Cleanup → CB2_NewGame). Le décomp clear
 *  systématiquement entre scenes, on doit faire pareil. */
export function DmaFill16(_channel: number, value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  const v16 = value & 0xFFFF;
  if (destAddr >= 0x06000000 && destAddr < 0x06018000) {
    // VRAM range (96KB unifié BG + OBJ).
    const offsetBytes = destAddr - 0x06000000;
    const remaining = r.gba.vram.byteLength - offsetBytes;
    const count = Math.min(sizeBytes, remaining) >> 1;
    if (count > 0 && offsetBytes >= 0 && offsetBytes < r.gba.vram.byteLength) {
      const u16 = new Uint16Array(r.gba.vram.buffer, r.gba.vram.byteOffset + offsetBytes, count);
      u16.fill(v16);
    }
  } else if (destAddr >= 0x07000000 && destAddr < 0x07000400) {
    // OAM range : reset visible + tileId pour les sprites affectés.
    const offsetBytes = destAddr - 0x07000000;
    const startIdx = offsetBytes >> 3;  // 8 bytes per OAM entry
    const count = Math.min(sizeBytes >> 3, 128 - startIdx);
    for (let i = 0; i < count; i++) {
      const oam = r.gba.oam[startIdx + i];
      if (oam) {
        oam.visible = false;
        oam.tileId = 0;
      }
    }
  } else if (destAddr >= 0x05000000 && destAddr < 0x05000400) {
    // PLTT range : clear gPlttBufferFaded + Unfaded.
    const offsetBytes = destAddr - 0x05000000;
    const startIdx = offsetBytes >> 1;
    const count = sizeBytes >> 1;
    for (let i = 0; i < count; i++) {
      r.gPlttBufferFaded.set(startIdx + i, v16);
      r.gPlttBufferUnfaded.set(startIdx + i, v16);
    }
  }
}

export function DmaFill32(_channel: number, value: number, destAddr: number, sizeBytes: number): void {
  const r = rt();
  const v32 = value >>> 0;
  if (destAddr >= 0x06000000 && destAddr < 0x06018000) {
    const offsetBytes = destAddr - 0x06000000;
    const remaining = r.gba.vram.byteLength - offsetBytes;
    const count = Math.min(sizeBytes, remaining) >> 2;
    if (count > 0 && offsetBytes >= 0 && offsetBytes < r.gba.vram.byteLength) {
      const u32 = new Uint32Array(r.gba.vram.buffer, r.gba.vram.byteOffset + offsetBytes, count);
      u32.fill(v32);
    }
  } else if (destAddr >= 0x07000000 && destAddr < 0x07000400) {
    // OAM clear (= 8 bytes / OAM entry, on traite par groupes de 4 bytes).
    const offsetBytes = destAddr - 0x07000000;
    const startIdx = offsetBytes >> 3;
    const count = Math.min(sizeBytes >> 3, 128 - startIdx);
    for (let i = 0; i < count; i++) {
      const oam = r.gba.oam[startIdx + i];
      if (oam) {
        oam.visible = false;
        oam.tileId = 0;
      }
    }
  } else if (destAddr >= 0x05000000 && destAddr < 0x05000400) {
    const offsetBytes = destAddr - 0x05000000;
    const startIdx = offsetBytes >> 1;
    const count = sizeBytes >> 1;
    const lo = v32 & 0xFFFF;
    for (let i = 0; i < count; i++) {
      r.gPlttBufferFaded.set(startIdx + i, lo);
      r.gPlttBufferUnfaded.set(startIdx + i, lo);
    }
  }
}
/** = décomp `ResetPaletteFade` (palette.c:136-144) : boucle
 *  `PaletteStruct_Reset(i)` ×16 PUIS `ResetPaletteFadeControl()` (palette.c:363
 *  = reset de TOUS les champs de gPaletteFade).
 *  Notre port = la partie ResetPaletteFadeControl seulement — le sous-système
 *  PaletteStruct (sPaletteStructs[16], palette.c:206-360) n'est PAS porté
 *  (seul caller vivant = battle_anim_mons.c:725, combat PAUSE ; cf. audit
 *  gfx-substrat 2026-07-02). À porter avec PaletteStruct.
 *  ⚠️ NE TOUCHE PAS le BLDY register (= gba.blend.brightness) ni le BLDCNT :
 *  avant ce fix on resettait `r.gba.blend.brightness = 0`, ce qui tuait le
 *  BLDY=4 posé au state 1 de CB2_InitOptionMenu (cursor highlight darken). */
export function ResetPaletteFade(): void {
  const r = rt();
  // 1:1 décomp ResetPaletteFade (palette.c:374) : reset internal fade state only.
  // Phase B audit session 83 : tous les fields struct PaletteFadeControl reset.
  r.gPaletteFade.active = false;
  r.gPaletteFade.brightness = 0;
  r.gPaletteFade.startY = 0;
  r.gPaletteFade.endY = 0;
  r.gPaletteFade.currentFrame = 0;
  r.gPaletteFade.totalFrames = 1;
  r.gPaletteFade.delayRemaining = 0;
  r.gPaletteFade.delayPerStep = 0;
  r.gPaletteFade.bufferTransferDisabled = false;
  r.gPaletteFade.mode = 0;  // NORMAL_FADE
  r.gPaletteFade.yDec = false;
  r.gPaletteFade.softwareFadeFinishing = false;
  r.gPaletteFade.softwareFadeFinishingCounter = 0;
  r.gPaletteFade.hardwareFadeFinishing = false;
  r.gPaletteFade.shouldResetBlendRegisters = false;
  r.gPaletteFade.objPaletteToggle = false;
  // 1:1 décomp palette.c:380 ResetPaletteFadeControl : `deltaY = 2`. Notre ancien
  // `= 1` était une divergence (= fade 2× plus lent si UpdatePaletteFade tournait
  // sans BeginNormalPaletteFade prior — masqué en pratique car Begin set deltaY=2).
  r.gPaletteFade.deltaY = 2;
  r.gPaletteFade.multipurpose1 = 0;
  r.gPaletteFade.multipurpose2 = 0;
  // 1:1 décomp palette.c:370 : `blendColor = 0` (= RGB15 0,0,0 = noir).
  // Nos équivalents : targetR/G/B (set par BeginNormalPaletteFade depuis blendColor).
  r.gPaletteFade.targetR = 0;
  r.gPaletteFade.targetG = 0;
  r.gPaletteFade.targetB = 0;
}
export function ResetTasks(): void {
  const r = rt();
  r.ResetTasks();
  r.nextTaskId = 0;
  console.log('[ResetTasks] gTasks cleared, nextTaskId reset, size=', r.GetTaskCount());
}
/** 1:1 décomp src/palette.c:103 `TransferPlttBuffer()` — copy gPlttBufferFaded
 *  → PLTT register (= compositor-visible palette). Gated par
 *  `gPaletteFade.bufferTransferDisabled`.
 *
 *  Doit être called au VBlank (= une fois par frame). Notre runtime appelle
 *  ce helper à la fin de runOneFrame pour simuler le timing VBlank décomp. */
export function TransferPlttBuffer(): void {
  const r = rt();
  if (r.gPaletteFade.bufferTransferDisabled) return;
  r.gPlttBufferFaded.flushTo();
}

/** 1:1 décomp src/sprite.c `LoadOam()` — copy gOamBuffer → OAM register region.
 *  Sur GBA, le gOamBuffer est un EWRAM staging que le VBlank flush vers OAM
 *  hardware (1KB). Notre compositor lit directement `gba.oam[]` chaque frame
 *  (= no double-buffer), donc cette function est un no-op pour API compat
 *  avec les VBlankCB scenes décomp qui l'appellent en 1ère position. */
export function LoadOam(): void {
  // No-op : compositor reads sprite OAM directly each frame. Foundation
  // ready for Phase 4 si on ajoute un real OAM staging buffer.
}

/** 1:1 décomp src/sprite.c `ProcessSpriteCopyRequests()` — flush la queue
 *  des `RequestSpriteCopy(src, dest, size)` accumulés depuis le dernier VBlank.
 *  Décomp utilise pour batched tile data updates (= un sprite anim qui swap
 *  tile pattern chaque frame queue un copy au lieu d'écrire OBJ VRAM live).
 *
 *  Notre impl : sprite tile copies sont eager (= LoadCompressedSpriteSheet
 *  écrit OBJ VRAM immédiatement). No queue → no-op. Foundation ready si
 *  Phase 4 a besoin de batched copies pour optimisation perf. */
export function ProcessSpriteCopyRequests(): void {
  // No-op : sprite tile copies are eager (immediate write to objVram).
}
// ScanlineEffect_Clear/SetParams/InitHBlankDmaTransfer/Stop + __scanlineEffectTick
// → MIROIR 1:1 src/game/scanline_effect.ts (ré-exporté ci-dessus).
export function EnableInterrupts(_flag: number): void { /* no-op */ }
/** 1:1 décomp src/sprite.c:1589-1608 — délégué à `src/engine/sprite.ts`
 *  (= source de vérité 1:1 strict du palette tag system).
 *
 *  Wrapper compat : signature historique de decomp-globals.ts accepte `pal:
 *  unknown` pour tolérer les callers transpilés du décomp qui passent des
 *  objets partial. On normalise + délègue à sprite.ts.
 *  Discard return value (la signature historique était `void`). */
export function LoadSpritePalette(pal: { data: string, tag: string | number } | unknown): void {
  if (!pal || typeof pal !== 'object') return;
  const p = pal as { data: string, tag: string | number };
  if (typeof p.data !== 'string') return;
  void _LoadSpritePalette_1to1(p);
}

/** 1:1 décomp `UpdatePaletteFade()` — tick palette fade + return active state.
 *  Returns `true` if fade is still active, `false` when done. */
export function UpdatePaletteFade(): boolean {
  const r = rt();
  r.UpdatePaletteFade();
  return r.gPaletteFade.active;
}

/** 1:1 décomp `JOY_NEW(buttonMask)` — retourne gMain.newKeys & buttonMask. */
export function JOY_NEW(buttonMask: number): number {
  return (rt().gMain as unknown as { newKeys: number }).newKeys & buttonMask;
}

/** 1:1 décomp `JOY_HELD(buttonMask)` — retourne gMain.heldKeys & buttonMask. */
export function JOY_HELD(buttonMask: number): number {
  return (rt().gMain as unknown as { heldKeys: number }).heldKeys & buttonMask;
}

/** 1:1 décomp `JOY_REPEAT(buttonMask)` (= JOY_REPT in some headers) —
 *  retourne gMain.newAndRepeatedKeys & buttonMask. Utilisé par les menus pour
 *  hold-to-scroll : fire au 1er press puis tous les 5 frames après 40 frames. */
export function JOY_REPEAT(buttonMask: number): number {
  return (rt().gMain as unknown as { newAndRepeatedKeys: number }).newAndRepeatedKeys & buttonMask;
}
export const JOY_REPT = JOY_REPEAT;

// ScanlineEffect_InitWave → MIROIR 1:1 src/game/scanline_effect.ts (ré-exporté ci-dessus).

// ─── PHASE E2.B — SpriteTemplate logo shine 1:1 (title_screen.c:316-353) ─────
// OAM 64x64 4bpp (paletteMode 0) + anim 1 frame. Le template (avec callback) est
// construit au runtime dans StartPokemonLogoShine car SpriteCB_PokemonLogoShine vit
// dans le fichier title généré (qui importe decomp-globals) → résolution par string
// (= ce que faisait CreateSpriteFromTemplate) évite un cycle ESM.
const sPokemonLogoShineOamData = {
  shape: 0, size: 3, priority: 0, paletteNum: 0, affineMode: 0, paletteMode: 0, objMode: 0,
} as const;  // SPRITE_SHAPE/SIZE(64x64), ST_OAM_4BPP, ST_OAM_OBJ_NORMAL (→ OBJ_WINDOW posé après création)
const sPokemonLogoShineAnimSequence = [ ANIMCMD_FRAME(0, 4), ANIMCMD_END ];
const sPokemonLogoShineAnimTable = [ sPokemonLogoShineAnimSequence ];

/** 1:1 décomp `StartPokemonLogoShine(mode)` — title_screen.c:527.
 *  Crée le(s) sprite(s) shine sweep avec OAM_OBJ_WINDOW + SpriteCB_PokemonLogoShine.
 *  - SHINE_MODE_SINGLE_NO_BG_COLOR (0) / SHINE_MODE_SINGLE (2) : 1 sprite normal
 *  - SHINE_MODE_DOUBLE (1) : 1 sprite invisible BG color + 2 sprites Fast */
export function StartPokemonLogoShine(mode: number): void {
  const r = rt();
  // Template 1:1 (Phase E2.B) — remplace r.CreateSpriteFromTemplate('sPokemonLogoShine…').
  const baseCb = (globalThis as any).SpriteCB_PokemonLogoShine
    ?? r.spriteCallbacks.get('SpriteCB_PokemonLogoShine') ?? null;
  const sPokemonLogoShineSpriteTemplate = {
    tileTag: 'TAG_LOGO_SHINE', paletteTag: 'TAG_PRESS_START_COPYRIGHT',
    oam: sPokemonLogoShineOamData, anims: sPokemonLogoShineAnimTable,
    images: null, affineAnims: null,
    callback: baseCb as ((sprite: unknown, rt: unknown) => void) | null,
  };
  const SHINE_MODE_SINGLE_NO_BG_COLOR = 0;
  const SHINE_MODE_DOUBLE = 1;
  const SHINE_MODE_SINGLE = 2;
  const ST_OAM_OBJ_WINDOW = 2;

  // FIX session 81 : écrire sprite.objMode (= source de vérité, syncSpritesToOam
  // propage). L'écriture seule à oam[].objMode était écrasée par syncSpritesToOam
  // chaque frame → shine sprites rendaient en NORMAL (= grosse barre blanche
  // visible) au lieu d'OBJ_WINDOW (= mask invisible pour winObj BG brightness).
  function setObjWindow(spriteId: number): void {
    const sprite = r.gSprites[spriteId];
    if (sprite) {
      sprite.objMode = ST_OAM_OBJ_WINDOW as 0 | 1 | 2;
      r.gba.oam[sprite.oamIndex].objMode = ST_OAM_OBJ_WINDOW;
    }
  }

  if (mode === SHINE_MODE_SINGLE_NO_BG_COLOR || mode === SHINE_MODE_SINGLE) {
    const spriteId = _CreateSprite_game(r, sPokemonLogoShineSpriteTemplate, 0, 68, 0);
    setObjWindow(spriteId);
    const sprite = r.gSprites[spriteId];
    if (sprite) sprite.data[0] = mode;  // sMode alias
  } else if (mode === SHINE_MODE_DOUBLE) {
    // Invisible sprite that updates BG color via SpriteCB_PokemonLogoShine
    let spriteId = _CreateSprite_game(r, sPokemonLogoShineSpriteTemplate, 0, 68, 0);
    setObjWindow(spriteId);
    let sprite = r.gSprites[spriteId];
    if (sprite) {
      sprite.data[0] = mode;
      sprite.invisible = true;
    }
    // Two faster shine sprites — callback override via direct mutation
    const fastCb = (globalThis as any).SpriteCB_PokemonLogoShine_Fast
      ?? r.spriteCallbacks.get('SpriteCB_PokemonLogoShine_Fast');
    spriteId = _CreateSprite_game(r, sPokemonLogoShineSpriteTemplate, 0, 68, 0);
    setObjWindow(spriteId);
    sprite = r.gSprites[spriteId];
    if (sprite && fastCb) sprite.callback = (spr: unknown) => (fastCb as (s: unknown, rt: unknown) => void)(spr, r);
    spriteId = _CreateSprite_game(r, sPokemonLogoShineSpriteTemplate, -80, 68, 0);
    setObjWindow(spriteId);
    sprite = r.gSprites[spriteId];
    if (sprite && fastCb) sprite.callback = (spr: unknown) => (fastCb as (s: unknown, rt: unknown) => void)(spr, r);
  }
}

/** Memory addresses GBA hardware constants. */
export const VRAM = 0x06000000;
export const OAM = 0x07000000;
export const PLTT = 0x05000000;
export const OAM_SIZE = 0x400;
// VRAM_SIZE déjà déclaré plus haut

/** Window control bits (1:1 GBA). */
export const WININ_WIN0_BG_ALL = 0xF;
export const WININ_WIN0_OBJ = 0x10;
export const WININ_WIN1_BG_ALL = 0xF00;
export const WININ_WIN1_OBJ = 0x1000;
export const WINOUT_WIN01_BG_ALL = 0xF;
export const WINOUT_WIN01_BG0 = 1 << 0;   // 1:1 io_reg.h:567
export const WINOUT_WIN01_OBJ = 0x10;
export const WINOUT_WIN01_CLR = 0x20;
export const WINOUT_WINOBJ_BG0 = 1 << 8;  // 1:1 io_reg.h:575
// 1:1 décomp io_reg.h:582 = WINOUT_WINOBJ_BG_ALL(0xF00) | WINOUT_WINOBJ_OBJ(0x1000) |
// WINOUT_WINOBJ_CLR(0x2000) = 0x3F00. Avant : 0x1F00 manquait le CLR bit → blend
// special-effect pas activé dans WINOBJ region.
export const WINOUT_WINOBJ_ALL = 0x3F00;

/** Interrupt flags. */
export const INTR_FLAG_VBLANK = 1;

/** Title screen affine BG regs. */
export const REG_OFFSET_BG2X_L = 0x028;
export const REG_OFFSET_BG2X_H = 0x02A;
export const REG_OFFSET_BG2Y_L = 0x02C;
export const REG_OFFSET_BG2Y_H = 0x02E;

/** Title screen symbol-name strings (title_screen.c). */
export const gTitleScreenPokemonLogoGfx = 'gTitleScreenPokemonLogoGfx';
export const gTitleScreenPokemonLogoTilemap = 'gTitleScreenPokemonLogoTilemap';
export const gTitleScreenBgPalettes = 'gTitleScreenBgPalettes';
export const sTitleScreenRayquazaGfx = 'sTitleScreenRayquazaGfx';
export const sTitleScreenRayquazaTilemap = 'sTitleScreenRayquazaTilemap';
export const sTitleScreenCloudsGfx = 'sTitleScreenCloudsGfx';
export const gTitleScreenCloudsTilemap = 'gTitleScreenCloudsTilemap';
export const gTitleScreenEmeraldVersionPal = 'gTitleScreenEmeraldVersionPal';
export const sSpritePalette_PressStart: ReadonlyArray<{ data: string; tag: string }> = [
  { data: 'gTitleScreenPressStartPal', tag: 'TAG_PRESS_START_COPYRIGHT' },
];

/** gMain re-export (pour bodyC CB2_InitTitleScreen qui fait `gMain.state = N`).
 *  Type 1:1 décomp `MainStruct` (cf. decomp-runtime.ts:309) — expose state,
 *  callback2, vblankCallback, savedCallback, newKeys, heldKeys, callback1,
 *  newAndRepeatedKeys, keyRepeatCounter. */
export const gMain = new Proxy({} as {
  state: number;
  callback2: unknown;
  callback1: unknown;
  vblankCallback: unknown;
  savedCallback: unknown;
  newKeys: number;
  heldKeys: number;
  newAndRepeatedKeys: number;
  keyRepeatCounter: number;
  vblankCounter1: number;
  /** 1:1 `struct OamData gMain.oamBuffer[128]` (main.h:52) — écrit en direct par digit_obj_util.c. */
  oamBuffer: Array<{
    y: number; affineMode: number; objMode: number; mosaic: boolean; bpp: number;
    shape: number; x: number; matrixNum: number; size: number; tileNum: number;
    priority: number; paletteNum: number; affineParam: number;
  }>;
}, {
  get(_, k) { return (rt().gMain as unknown as Record<string, unknown>)[k as string]; },
  set(_, k, v) { (rt().gMain as unknown as Record<string, unknown>)[k as string] = v; return true; },
});

/** Accessor `gPlttBufferUnfaded` proxy — pointer vers rt().gPlttBufferUnfaded.
 *  Le bodyC fait des `gPlttBufferUnfaded[idx]` = read u16 à index dans le buf.
 *  Notre PaletteBuffer expose `.get(idx)` ; pour rester compatible avec
 *  l'array-access décomp, on retourne un proxy. */
export const gPlttBufferUnfaded = new Proxy({}, {
  get(_, k) {
    if (k === 'length') return 512;
    const i = Number(k);
    if (!Number.isFinite(i)) return undefined;
    try { return rt().gPlttBufferUnfaded.get(i); } catch { return 0; }
  },
}) as unknown as ArrayLike<number>;

/** 1:1 décomp `INTRO3_RAW_PTR(palId)` macro src/intro.c:1870 :
 *    #define INTRO3_RAW_PTR(palId) (((void *) &gIntro3Bg_Pal) + palId)
 *
 *  Retourne un pointer dans gIntro3Bg_Pal à offset `palId` bytes. Utilisé
 *  pour CpuCopy16(INTRO3_RAW_PTR(N), &gPlttBufferFaded[idx], 2) → copy 1
 *  entry u16 à différents offsets dans le palette buffer (palette swap dyn).
 *
 *  Notre version : retourne Uint16Array view dans gIntro3Bg_Pal cache à
 *  l'offset `palId/2` entries (= palId bytes / 2 bytes par u16). */
export function INTRO3_RAW_PTR(palIdBytes: number): ArrayLike<number> {
  const data = assetCache.get('gIntro3Bg_Pal');
  if (!data || !(data instanceof Uint16Array)) {
    console.warn('[INTRO3_RAW_PTR] gIntro3Bg_Pal not in cache, return empty');
    return new Uint16Array(0);
  }
  const startEntry = (palIdBytes >> 1) & ~0;  // u16 entry index
  return data.subarray(startEntry);
}

/** Constants décomp commonly référencées sans être résolues par le transpileur. */
export const MALE = 0;
export const FEMALE = 1;

/** 1:1 décomp `LoadCompressedSpriteSheet(sheet)` — charge un sprite sheet
 *  individuel dans objVram. `sheet` = struct {data, size, tag}.
 *  Notre version : preload via assetCache, copy sync. */
export function LoadCompressedSpriteSheet(sheet: { data: string, size: number, tag: string | number, targetTileBase?: number }): void {
  // tag = unique ID, on l'enregistre comme tileTag pour CreateSpriteFromTemplate.
  // targetTileBase (optional) = écrit à un tile offset précis au lieu du curseur
  // d'allocation. 1:1 décomp src/decompress.c LZDecompressVram(data, dst) avec
  // dst calculé. Utilisé par LoadBallGfx pour overwrite les "open" frames
  // tile 8-11 du poke.png par open.png (cf. pokeball.c:1327).
  const r = rt();
  const charData = getAsset(sheet.data);
  if (!charData) {
    // ⚠️ ASSET MANQUANT : explicitement loud — sans ça flicker random du logo
    // (sIntroDropsLogo_Gfx pas chargé à temps → tile data garbage en OAM VRAM).
    console.error(`[LoadCompressedSpriteSheet] ASSET MISSING : '${sheet.data}' (tag=${sheet.tag}) — tile data NOT in OBJ VRAM. Will cause random sprite garbage.`);
    return;
  }
  const bytes = charData instanceof Uint16Array
    ? new Uint8Array(charData.buffer, charData.byteOffset, charData.byteLength)
    : charData;
  const tagStr = String(sheet.tag);
  // Targeted overwrite path : écrit aux tile offsets demandés sans avancer le
  // curseur global d'allocation. Pas de check has() (= overwrite voulu).
  if (sheet.targetTileBase !== undefined) {
    const byteOffset = sheet.targetTileBase * 32;  // 32 bytes per 8x8 4bpp tile
    const copySize = Math.min(bytes.length, r.gba.objVram.length - byteOffset);
    if (copySize > 0) {
      r.gba.objVram.set(bytes.subarray(0, copySize), byteOffset);
      // 1:1 STRICT bitmap allocator sync : targetTileBase = overwrite ciblé
      // (LoadBallGfx remplace open.png frames). Marquer assure que ces tiles
      // ne sont pas re-attribuées par AllocSpriteTiles.
      // Import direct sprite.ts (ex-`__sprite.sSpriteTileAllocBitmap`) = array primary 1:1.
      {
        const tileStart = byteOffset >> 5;
        const tileCount = copySize >> 5;
        for (let n = tileStart; n < tileStart + tileCount; n++) {
          _sSpriteTileAllocBitmap[n >> 3] |= (1 << (n & 7));
        }
      }
    }
    // INVALIDER les ranges de tags CHEVAUCHANT la zone ciblee (racine des
    // eclats VRAM 2026-06-11) : les sheets prechargees au boot occupaient
    // 320+, la healthbox targetTileBase les ECRASE ici — si leurs ranges
    // restent enregistrees, un FreeSpriteTilesByTag tardif DEMARQUE les
    // tiles de la box du bitmap -> l'allocateur les ressert aux anims.
    {
      const tileStart0 = sheet.targetTileBase;
      const tileEnd0 = tileStart0 + (copySize >> 5);
      for (let i = 0; i < _sSpriteTileRangeTags.length; i++) {
        if (_sSpriteTileRangeTags[i] === 0xFFFF) continue;
        if (_sSpriteTileRangeTags[i] === (typeof sheet.tag === 'number' ? sheet.tag : -1)) continue;
        const rs = _sSpriteTileRanges[i * 2];
        const rc = _sSpriteTileRanges[i * 2 + 1];
        if (rs < tileEnd0 && rs + rc > tileStart0) {
          _sSpriteTileRangeTags[i] = 0xFFFF; // range obsolete : ecrasee par overwrite cible
        }
      }
    }
    // 1:1 STRICT register tag dans sSpriteTileRangeTags array primary.
    // copySize >> 5 = tile count. Si sheet.size != copySize (= bytes clamped
    // par OBJ VRAM end), on prend copySize comme source authentique.
    _AllocSpriteTileRange_1to1(sheet.tag, sheet.targetTileBase, copySize >> 5);
    return;
  }
  // 1:1 STRICT check existing via GetSpriteTileStartByTag array primary.
  if (_GetSpriteTileStartByTag_1to1(sheet.tag) !== 0xFFFF) return;
  const needed = bytes.length;
  const tileCount = needed >> 5;  // bytes / 32 = tiles 4bpp
  // 1:1 STRICT décomp src/sprite.c:1486-1500 LoadSpriteSheet :
  //   tileStart = AllocSpriteTiles(sheet->size / TILE_SIZE_4BPP);
  //   if (tileStart < 0) return 0;
  //   AllocSpriteTileRange(tag, tileStart, count);
  //   CpuCopy16(data, OBJ_VRAM0 + TILE_SIZE_4BPP * tileStart, size);
  //
  // AllocSpriteTiles (sprite.ts Phase 2) = bitmap-based scan dans
  // [gReservedSpriteTileCount, 1024). Marque les bits dans sSpriteTileAllocBitmap.
  const tileStart = _AllocSpriteTiles_1to1(tileCount);
  if (tileStart < 0) {
    console.warn(`[LoadCompressedSpriteSheet] OBJ VRAM saturated for tag '${tagStr}' (needed ${tileCount} tiles)`);
    return;
  }
  const byteOffset = tileStart * 32;
  const copySize = Math.min(needed, r.gba.objVram.length - byteOffset);
  if (copySize > 0) r.gba.objVram.set(bytes.subarray(0, copySize), byteOffset);
  // 1:1 STRICT décomp `AllocSpriteTileRange(tag, start, count)` (sprite.c:1574-1579) :
  // marque le tag dans sSpriteTileRangeTags + sSpriteTileRanges arrays.
  //
  // ⚠️ Bug fix 2026-05-24 : passer `sheet.tag` (= valeur originale, number ou
  // string) et NON `tagStr = String(sheet.tag)`. Le tag system distingue
  // number 100 ↔ string "100" via _tagToU16 (= number stocké tel quel, string
  // → synthetic u16 0xC007+). Si on store string "100" et lookup avec number
  // 100, mismatch → IndexOfSpriteTileTag retourne 0xFF → AddItemIconSprite
  // fallback à tileStart=0 → sprite item icon rend tiles 0..15 (= début du
  // bag sprite) au lieu de l'icône réelle (= bug user "POTION/retour = bout
  // du sac", 2026-05-24).
  _AllocSpriteTileRange_1to1(sheet.tag, tileStart, tileCount);
}

/** 1:1 décomp `FreeSpriteTilesByTag(tag)` (src/sprite.c:1509-1529) — libère la plage
 *  OBJ VRAM du tag : clear arrays + reclaim queue.
 *  Source unique = sSpriteTileRangeTags array primary (1:1 STRICT). Lecture
 *  des coords via GetSpriteTileStartByTag (= sprite.c:1542) au lieu de Map. */
export function FreeSpriteTilesByTag(tag: string | number): void {
  // 1:1 STRICT décomp sprite.c:1509-1529 : IndexOfSpriteTileTag → clear bits
  // bitmap + sSpriteTileRangeTags[index] = TAG_NONE. _FreeSpriteTileRangeByTag
  // dans sprite.ts encapsule le tout via array primary.
  _FreeSpriteTileRangeByTag_1to1(tag);
}

/** 1:1 décomp src/sprite.c:1610-1616 — délégué à `src/engine/sprite.ts`.
 *
 *  BUG RACINE RÉSOLU : avant, cette fonction faisait `nextObjPalSlot++` raw
 *  (= counter monotone), bypassant le scan first-free du décomp. Le décomp
 *  appelle simplement `LoadSpritePalette` en boucle, qui fait scan first-free.
 *
 *  Wrapper compat : signature historique accepte `palettes: Array<{ data:
 *  string, tag }>` — sprite.ts accepte `Uint16Array | string`. On forward. */
export function LoadSpritePalettes(palettes: Array<{ data: string, tag: string | number }>): void {
  _LoadSpritePalettes_1to1(palettes);
}
/** Reset des allocations OBJ entre 2 scènes.
 *  1:1 STRICT : utilise FreeSpriteTileRanges + FreeAllSpritePalettes (=
 *  arrays primary sprite.ts). Pas de cursor monotone — A2 cleanup. */
export function resetObjAllocations(): void {
  const r = rt();
  r.freedSpriteTileRanges.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOUNDATION : tag → slot/tile resolution (= 1:1 décomp src/sprite.c utilities)
// Reusable across scenes (naming screen, slot machine, contest, etc.).
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp src/sprite.c:IndexOfSpritePaletteTag — retourne le slot OBJ
 *  palette (0-15) précédemment alloué pour ce tag via LoadSpritePalette/
 *  LoadSpritePalettes/LoadSpritePalettesFromTable. Retourne 0xFF si non trouvé.
 *
 *  Le décomp utilise sSpritePaletteTags[16] indexé par slot. Notre runtime
 *  utilise paletteTagToSlot Map<string, number>. Le tag peut être numérique
 *  (e.g. 0x1006) ou string (e.g. 'PALTAG_CURSOR') — on stringify pour
 *  cohérence avec LoadSpritePalette.
 *
 *  USAGE :
 *    const palOffset = OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_CURSOR)) + 1;
 *    MultiplyInvertedPaletteRGBComponents(palOffset, r, g, b);   */
export function IndexOfSpritePaletteTag(tag: string | number): number {
  return _IndexOfSpritePaletteTag_1to1(tag);
}

/** 1:1 STRICT décomp src/sprite.c:1542-1548 GetSpriteTileStartByTag — délégué
 *  à la VRAIE impl sprite.ts qui scan sSpriteTileRangeTags array primary.
 *  Retourne 0xFFFF si non trouvé. */
export function GetSpriteTileStartByTag(tag: string | number): number {
  return _GetSpriteTileStartByTag_1to1(tag);
}

/** 1:1 décomp src/util.c:MultiplyInvertedPaletteRGBComponents (palette.c:1764).
 *  Pour chaque couleur du faded buffer à `paletteIdx` (= flat 0-511), multiplie
 *  les composants R/G/B par (16-r)/16, (16-g)/16, (16-b)/16 (= "inverted"
 *  multiply). Effet : assombrit/teinte la couleur cible vers noir avec un
 *  facteur paramétrique. Utilisé par le button flash + cursor flash :
 *  multiplier 0,0,0 → couleur originale ; multiplier 16,16,16 → noir.
 *
 *  Le décomp opère sur 1 entrée. Notre version : single index = même
 *  signature. Écrit à gPlttBufferFaded uniquement (= faded est ce qui
 *  s'affiche, Unfaded reste la référence pour Restore). */
export function MultiplyInvertedPaletteRGBComponents(
  paletteIdx: number, rMul: number, gMul: number, bMul: number,
): void {
  const r = rt();
  const c = r.gPlttBufferUnfaded.get(paletteIdx);
  const cR = c & 0x1F;
  const cG = (c >> 5) & 0x1F;
  const cB = (c >> 10) & 0x1F;
  // 1:1 décomp src/util.c MultiplyInvertedPaletteRGBComponents :
  //   newR = origR + (((0x1F - origR) * r) >> 4);
  // Le mul ADD vers WHITE (= 31), pas SUB vers BLACK. mul=0 → no change,
  // mul=16 → atteint 31 (= blanc complet). "Inverted" dans le nom = on
  // multiplie la DISTANCE vers blanc, pas la valeur courante.
  // Bug session 96 : on faisait `cR - ((cR * mul) >> 4)` (= SUB vers black)
  // → user feedback "cursor clignote en blanc, pas en noir" inversé.
  const nR = Math.min(31, cR + (((0x1F - cR) * rMul) >> 4));
  const nG = Math.min(31, cG + (((0x1F - cG) * gMul) >> 4));
  const nB = Math.min(31, cB + (((0x1F - cB) * bMul) >> 4));
  const packed = (nR & 0x1F) | ((nG & 0x1F) << 5) | ((nB & 0x1F) << 10);
  r.gPlttBufferFaded.set(paletteIdx, packed);
}

/** 1:1 décomp src/task.c:FindTaskIdByFunc — retourne le taskId du premier
 *  Task dont func == funcRef. TASK_NONE (0xFF) si aucun. */
export function FindTaskIdByFunc(funcRef: ((task: any) => void) | ((task: any, rt: any) => void)): number {
  const r = rt();
  for (const task of r.gTasks) {
    if (task.isActive && task.func === funcRef) return task.taskId;
  }
  // Tolerant fallback : sometimes auto-callbacks wrap the original task fn in
  // a closure; we tag via task.funcName at create time for those callers.
  for (const task of r.gTasks) {
    if (task.isActive && (task as { funcRef?: unknown }).funcRef === funcRef) return task.taskId;
  }
  return TASK_NONE;
}

/** 1:1 décomp `src/task.c:FuncIsActiveTask` — TRUE si une task active a
 *  `func === funcRef`. (Décomp : `FindTaskIdByFunc(func) != TASK_NONE`.) */
export function FuncIsActiveTask(funcRef: ((task: any) => void) | ((task: any, rt: any) => void)): boolean {
  return FindTaskIdByFunc(funcRef) !== TASK_NONE;
}

/** Accès 1:1 décomp `gTasks[taskId].data` — retourne le tableau `data` (Int16Array
 *  vue `number[]`) d'une task par id, ou `null` si absente. Pour les ports qui font
 *  `s16 *data = gTasks[taskId].data` après `FindTaskIdByFunc` (= field_tasks.c). */
export function GetTaskData(taskId: number): number[] | null {
  const task = rt().gTasks[taskId];
  return task ? task.data : null;
}

/** Accès 1:1 décomp `&gTasks[taskId]` — retourne l'objet task complet (taskId/func/data)
 *  ou `null` si absent. Pour les ports qui appellent immédiatement leur task func après
 *  `CreateTask` (= pattern `Func(CreateTask(Func, prio))`, ex. StartStrengthAnim). */
export function GetTask(taskId: number): import('./decomp-runtime').DecompTask | null {
  return rt().gTasks[taskId] ?? null;
}

/** 1:1 décomp src/sprite.c:SetSubspriteTables — installs a subsprite layout
 *  on a sprite. The decomp's subsprite system renders a SINGLE sprite as N
 *  OAM entries with offsets. Our compositor doesn't natively handle multi-OAM
 *  per sprite, so we approximate : the primary sprite renders the FIRST
 *  subsprite at its (x, y), and additional OAM slots are allocated for the
 *  remaining subsprites with relative offsets. Stored on sprite.subsprites for
 *  later sync.
 *
 *  Most naming screen subsprites (PageSwapFrame 40x32, Button 40x24, PCIcon
 *  16x24) span a region larger than the OAM shape. The cleanest 1:1 approach
 *  is to allocate child OAM entries that share the parent's tileBase + each
 *  subsprite's tileOffset. */
export interface NamingSubsprite {
  x: number;
  y: number;
  shape: 0 | 1 | 2;
  size: 0 | 1 | 2 | 3;
  tileOffset: number;
  priority: number;
}

const _spriteSubsprites = new Map<number, { childOamIndices: number[]; subsprites: NamingSubsprite[] }>();

// 1:1 décomp `sOamDimensions[3][4].width` (sprite.c:245-268) — largeur px par
// (shape, size), pour le mirror hFlip des subsprites (AddSubspritesToOamBuffer).
const _SUB_W: ReadonlyArray<ReadonlyArray<number>> = [
  [8, 16, 32, 64],   // square
  [16, 32, 32, 64],  // horizontal rectangle
  [8, 8, 16, 32],    // vertical rectangle
];

export function SetSubspriteTables(spriteId: number, subspriteTable: ReadonlyArray<NamingSubsprite>): void {
  const r = rt();
  const sprite = r.gSprites[spriteId];
  if (!sprite) return;
  // Free any previous child OAM entries for this sprite.
  const prev = _spriteSubsprites.get(spriteId);
  if (prev) {
    for (const idx of prev.childOamIndices) {
      const oam = r.gba.oam[idx];
      if (oam) oam.visible = false;
    }
  }
  const childOamIndices: number[] = [];
  // Allocate OAM slots for each subsprite (skip slots used by sprites in use).
  const taken = new Set<number>();
  for (let i = 0; i < MAX_SPRITES; i++) {
    const s = r.gSprites[i];
    if (s !== undefined && s.inUse) taken.add(s.oamIndex);
  }
  for (const subs of _spriteSubsprites.values()) {
    for (const idx of subs.childOamIndices) taken.add(idx);
  }
  for (let i = 0; i < subspriteTable.length; i++) {
    let oamIdx = -1;
    for (let k = 0; k < 128; k++) {
      if (!taken.has(k)) { oamIdx = k; break; }
    }
    if (oamIdx === -1) break;
    taken.add(oamIdx);
    const sub = subspriteTable[i];
    const oam = r.gba.oam[oamIdx];
    if (!oam) continue;
    oam.visible = !sprite.invisible;
    oam.tileId = (sprite.tileBase ?? 0) + sub.tileOffset;
    oam.paletteBank = r.gba.oam[sprite.oamIndex].paletteBank;
    oam.x = sprite.x + sub.x;
    oam.y = sprite.y + sub.y;
    oam.shape = sub.shape;
    oam.size = sub.size;
    oam.priority = sub.priority;
    oam.paletteMode = r.gba.oam[sprite.oamIndex].paletteMode;
    oam.affineMode = 0;
    oam.affineParamIndex = 0;
    oam.flipH = false;
    oam.flipV = false;
    childOamIndices.push(oamIdx);
  }
  _spriteSubsprites.set(spriteId, { childOamIndices, subsprites: [...subspriteTable] });
  // 1:1 décomp `SetSubspriteTables` (sprite.c:1659) :
  //   sprite->subspriteTables = subspriteTables;
  //   sprite->subspriteTableNum = 0;
  //   sprite->subspriteMode = SUBSPRITES_ON;
  // Set le flag pour que syncSpritesToOam skip le primary OAM (= 1:1
  // BuildOamBuffer 1671 check). Sans ça, syncSpritesToOam re-affiche le
  // primary OAM chaque frame → "bout bleu" qui dépasse (= user G14 truck bug).
  sprite.subspriteMode = 'on';
  // Hide immédiatement (= avant le next syncSpritesToOam) pour visual.
  r.gba.oam[sprite.oamIndex].visible = false;
}

/** Sync subsprite OAM coords each frame after primary sprite movement. Called
 *  from naming-screen-impl tick (= 1:1 décomp BuildOamBuffer subsprite path). */
export function syncSubspriteOam(): void {
  const r = rt();
  for (const [spriteId, info] of _spriteSubsprites) {
    const sprite = r.gSprites[spriteId];
    if (!sprite || !sprite.inUse) continue;
    const primaryOam = r.gba.oam[sprite.oamIndex];
    // 1:1 décomp `AddSubspritesToOamBuffer` (sprite.c:1712-1735) : hFlip lu sur le
    // sprite parent (= oam.matrixNum bit 3) → chaque pièce est MIRROIRÉE (flipH) et
    // repositionnée x = base - (sub.x + width) (l'assemblage entier est symétrisé).
    // Additif : tous les sprites à subsprites existants ont hFlip=false (inchangés).
    const _parentHFlip = !!(sprite as { hFlip?: boolean }).hFlip;
    // 1:1 décomp `AddSubspritesToOamBuffer` (sprite.c) : le child OAM part de
    // `sprite->oam.x/y` que `UpdateOamCoords` (sprite.c:347) a DÉJÀ offsetté de
    // `gSpriteCoordOffsetX/Y` quand `coordOffsetEnabled`. Notre chemin single-OAM le
    // fait (syncSpritesToOam) mais ce chemin subsprite l'oubliait → un object event
    // world-positionné à subsprites (camion 48×48, coordOffsetEnabled=true) était décalé
    // de l'offset caméra ET restait COLLÉ à l'écran au scroll (« le camion suit / est
    // décalé »). Les healthbars combat (coordOffsetEnabled=false) → offset 0, inchangées.
    const offX = sprite.coordOffsetEnabled ? r.gSpriteCoordOffsetX : 0;
    const offY = sprite.coordOffsetEnabled ? r.gSpriteCoordOffsetY : 0;
    for (let i = 0; i < info.subsprites.length; i++) {
      const oam = r.gba.oam[info.childOamIndices[i]];
      const sub = info.subsprites[i];
      if (!oam) continue;
      oam.visible = !sprite.invisible;
      if (_parentHFlip) {
        const w = _SUB_W[sub.shape & 3]?.[sub.size & 3] ?? 8;
        oam.x = sprite.x + sprite.x2 - (sub.x + w) + offX;
        oam.flipH = true;
      } else {
        oam.x = sprite.x + sprite.x2 + sub.x + offX;
        oam.flipH = false;
      }
      oam.y = sprite.y + sprite.y2 + sub.y + offY;
      oam.tileId = (sprite.tileBase ?? 0) + sub.tileOffset;
      oam.paletteBank = primaryOam.paletteBank;
      oam.priority = sub.priority;
      // 1:1 décomp `AddSubspritesToOamBuffer` (sprite.c) : chaque child OAM hérite de
      // la subpriority du SPRITE (z-order entre sprites de même priority). Sans ça, le
      // child OAM gardait la subpriority PÉRIMÉE de son slot OAM précédent → z-order
      // non-déterministe (barre HP adverse recouverte par sa boîte = sp identiques 255 ;
      // barre joueur visible par chance avec un sp périmé < boîte). Cf SUBSPRITES_IGNORE_PRIORITY.
      oam.subpriority = sprite.subpriority;
      oam.paletteMode = primaryOam.paletteMode;
      // 1:1 décomp `destOam[i] = *oam` : le child hérite du objMode du parent
      // (= ST_OAM_OBJ_BLEND pendant le fade du party-summary).
      oam.objMode = primaryOam.objMode;
      // Re-hide primary OAM (defense against syncSpritesToOam reactivating).
      primaryOam.visible = false;
    }
  }
}

/** Cleanup all subsprite tables (= scene exit). */
export function clearAllSubspriteTables(): void {
  const r = rt();
  for (const info of _spriteSubsprites.values()) {
    for (const idx of info.childOamIndices) {
      const oam = r.gba.oam[idx];
      if (oam) oam.visible = false;
    }
  }
  _spriteSubsprites.clear();
}

// 1:1 décomp `ResetSpriteData` (sprite.c:294) reset TOUT le système sprite/OAM, y
// compris les sprites à sous-sprites. Notre `_spriteSubsprites` est un registre à part
// (hors gSprites) → ResetSpriteData ne le vidait PAS. Conséquence au RESHOW combat
// (reshow_battle_screen.c case 3 = ResetSpriteData) : une entrée PÉRIMÉE (l'ancienne
// barre HP) survit ; son spriteId est réutilisé par un nouveau sprite (la box healthbox
// main) → `syncSubspriteOam` CACHE le primary OAM de la box (l.1992) + rend des pièces
// enfant bidon (palette/tileBase de la box) → "fond" healthbox cassé/pointillé après
// switch ou retour de menu. Fix : brancher clearAllSubspriteTables sur ResetSpriteData
// (lu par decomp-runtime.ts:ResetSpriteData via __spriteResetCallbacks).
{
  const _g = globalThis as Record<string, unknown>;
  const _cbs = (_g.__spriteResetCallbacks as Array<() => void> | undefined) ?? [];
  if (!_cbs.includes(clearAllSubspriteTables)) _cbs.push(clearAllSubspriteTables);
  _g.__spriteResetCallbacks = _cbs;
}

/** Cleanup d'UN seul sprite à sous-sprites (= 1:1 destroy du healthbar bar entre
 *  combats). Cache les child OAM, libère leurs slots, repasse le primary en mode
 *  normal. Sans ça, les pièces de barre fuient (OAM visibles orphelins) à chaque
 *  combat. */
export function clearSubspriteTable(spriteId: number): void {
  const r = rt();
  const info = _spriteSubsprites.get(spriteId);
  if (!info) return;
  for (const idx of info.childOamIndices) {
    const oam = r.gba.oam[idx];
    if (oam) oam.visible = false;
  }
  _spriteSubsprites.delete(spriteId);
  const sprite = r.gSprites[spriteId];
  if (sprite) sprite.subspriteMode = 'off';
}

/** Returns the set of OAM slot indices currently allocated to subsprite
 *  children (= reserved for the multi-OAM expansion of sprites with subsprite
 *  tables). `CreateSpriteAtOam` must skip these slots when picking a free OAM
 *  index — otherwise the new sprite's OAM stomps on a child OAM, and `syncSubspriteOam`
 *  re-writes button/frame tile data over what's supposed to be the new sprite's
 *  position/tile data each frame.
 *
 *  Foundation : called from `decomp-runtime.ts:CreateSpriteAtOam`'s `taken` set
 *  build. Without it, every scene that mixes `SetSubspriteTables` + plain
 *  `CreateSpriteAtOam` after creates fragmentation bugs (= naming screen
 *  Session 94 root cause). */
export function getSubspriteChildOamIndices(): Set<number> {
  const out = new Set<number>();
  for (const info of _spriteSubsprites.values()) {
    for (const idx of info.childOamIndices) out.add(idx);
  }
  return out;
}
// Expose globally for runtime to consume without a circular import dependency.
(globalThis as Record<string, unknown>)._getSubspriteChildOamIndices = getSubspriteChildOamIndices;

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

// Scene 2 BG layers (1:1 décomp src/intro_credits_graphics.c data symbols)
export const sGrass_Gfx = 'sGrass_Gfx';
export const sGrass_Tilemap = 'sGrass_Tilemap';
export const sGrass_Pal = 'sGrass_Pal';
export const sTrees_Gfx = 'sTrees_Gfx';
export const sTrees_Tilemap = 'sTrees_Tilemap';
export const sTrees_Pal = 'sTrees_Pal';
export const sTreesSmall_Gfx = 'sTreesSmall_Gfx';
export const sTreesSmall_Pal = 'sTreesSmall_Pal';
export const sCloudsBg_Gfx = 'sCloudsBg_Gfx';
export const sCloudsBg_Tilemap = 'sCloudsBg_Tilemap';
export const sCloudsBg_Pal = 'sCloudsBg_Pal';
export const sClouds_Pal = 'sClouds_Pal';
export const sHouses_Gfx = 'sHouses_Gfx';
export const sHouses_Tilemap = 'sHouses_Tilemap';
export const sHouses_Pal = 'sHouses_Pal';

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

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL TABLES (data extern décomp utilisée cross-module)
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `const u16 gTitleScreenAlphaBlend[64]` (src/title_screen.c:74).
 *  Utilisé par Task_BlendLogoIn/Out + title_screen pour BLDALPHA fade smooth.
 *  - 0-15  : eva=16 fixe, evb=0→15  (logo lighten gradient)
 *  - 16-31 : eva=15→0, evb=16 fixe  (logo darken gradient)
 *  - 32-63 : eva=0, evb=16 fixe     (held final state)
 *  BLDALPHA_BLEND(eva, evb) = (eva | (evb << 8)). */
/** 1:1 décomp `BLDALPHA_BLEND(eva, evb)` macro — pack eva (5-bit) + evb (5-bit) en u16
 *  pour le BLDALPHA register. Utilisé par les fade animations + battle alpha effects. */
export function BLDALPHA_BLEND(eva: number, evb: number): number { return (eva & 0x1F) | ((evb & 0x1F) << 8); }
const _bldAlpha = BLDALPHA_BLEND;
export const gTitleScreenAlphaBlend: ReadonlyArray<number> = (() => {
  const arr: number[] = new Array(64);
  for (let i = 0; i <= 15; i++) arr[i] = _bldAlpha(16, i);
  for (let i = 16; i <= 31; i++) arr[i] = _bldAlpha(31 - i, 16);
  for (let i = 32; i < 64; i++) arr[i] = _bldAlpha(0, 16);
  return arr;
})();

// ─── Bridge for pokeball-effects.ts (avoid circular import) ─────────────────
// pokeball-effects.ts uses BlendPalette + getAsset + G_SINE_TABLE without
// importing decomp-globals (which would create a circular dep, since
// decomp-globals imports things from many places that may transitively import
// pokeball-effects). We expose them via globalThis here.
(globalThis as Record<string, unknown>).BlendPalette = (palOffset: number, numEntries: number, coeff: number, blendColor: number) => BlendPalette(palOffset, numEntries, coeff, blendColor);
(globalThis as Record<string, unknown>).__getAssetForParticles = getAsset;
(globalThis as Record<string, unknown>).G_SINE_TABLE = G_SINE_TABLE;

/** 1:1 décomp `BlendPalette(palOffset, numEntries, coeff, blendColor)` — mélange
 *  gPlttBufferUnfaded vers gPlttBufferFaded. coeff = 0-16 (16 = 100% blendColor).
 *
 *  NB foundational dual-buffer model (= 1:1 décomp src/util.c:264 BlendPalette) :
 *  - READS from gPlttBufferUnfaded (= the "master" snapshot of palettes since
 *    last LoadPalette write).
 *  - WRITES to gPlttBufferFaded (= the buffer flushed to PLTT register at
 *    every VBlank via TransferPlttBuffer).
 *  Means : BlendPalette is a "transient overlay" on top of unfaded. The next
 *  LoadPalette/CpuCopy16 to unfaded will reset master, but the faded buffer
 *  retains the blend until either a new BlendPalette/UpdatePaletteFade tick
 *  hits the same range, or LoadPalette writes both buffers identically.
 *
 *  Critical invariant for ball-release flicker (= LaunchBallFadeMonTask) :
 *  the OBJ palette is BlendPalette'd to full pink (coeff=16). The active fade
 *  is on BG (selectedPalettes=PALETTES_BG). UpdatePaletteFade only processes
 *  banks set in selectedPalettes → OBJ banks NOT touched → pink stays in
 *  faded buffer until Task_FadeMon_ToNormal_Step ramps coeff back to 0.
 *  Verified : `_applyPaletteFadeStepHalf` correctly skips OBJ banks when
 *  PALETTES_BG fade is active. */
export function BlendPalette(palOffset: number, numEntries: number, coeff: number, blendColor: number): void {
  const r = rt();
  const bcR = blendColor & 0x1F;
  const bcG = (blendColor >> 5) & 0x1F;
  const bcB = (blendColor >> 10) & 0x1F;
  for (let i = 0; i < numEntries; i++) {
    const idx = palOffset + i;
    const unfaded = r.gPlttBufferUnfaded.get(idx);
    const r1 = unfaded & 0x1F;
    const g1 = (unfaded >> 5) & 0x1F;
    const b1 = (unfaded >> 10) & 0x1F;
    const newR = r1 + (((bcR - r1) * coeff) >> 4);
    const newG = g1 + (((bcG - g1) * coeff) >> 4);
    const newB = b1 + (((bcB - b1) * coeff) >> 4);
    r.gPlttBufferFaded.set(idx, ((newB & 0x1F) << 10) | ((newG & 0x1F) << 5) | (newR & 0x1F));
  }
}

/** 1:1 décomp `BlendPalettes(selectedPalettes, coeff, color)` — palette.c:832.
 *  Iterates over a 32-bit mask (BG bits 0-15, OBJ bits 16-31) and applies
 *  BlendPalette on each selected 16-color bank. Foundational : used by
 *  battle scenes (= status condition tints), Cave fade-in, Trade scene.
 *  Mask layout : bit N → palette bank N at offset N*16 in flat palette. */
export function BlendPalettes(selectedPalettes: number, coeff: number, color: number): void {
  let paletteOffset = 0;
  let mask = selectedPalettes >>> 0;
  while (mask !== 0) {
    if (mask & 1) BlendPalette(paletteOffset, 16, coeff, color);
    mask >>>= 1;
    paletteOffset += 16;
  }
}

/** 1:1 décomp `BlendPalettesUnfaded(selectedPalettes, coeff, color)` —
 *  palette.c:844. Reset faded ← unfaded for ALL palettes (= DmaCopy32(unfaded,
 *  faded, PLTT_SIZE)), then BlendPalettes the selected ones. Foundational :
 *  used when a scene must "rebase" the faded buffer to baseline before
 *  applying a new tint (= e.g. transition from one battle status to another).
 *  Note : the full faded←unfaded copy is intentional — it discards any
 *  in-flight UpdatePaletteFade or BlendPalette work, which is the décomp
 *  semantic. */
export function BlendPalettesUnfaded(selectedPalettes: number, coeff: number, color: number): void {
  const r = rt();
  // 1:1 décomp DmaCopy32(unfaded, faded, PLTT_SIZE) where PLTT_SIZE = 0x400 bytes
  // = 512 entries × 2 bytes. Our PaletteBuffer is 512 entries already.
  for (let i = 0; i < 512; i++) {
    r.gPlttBufferFaded.set(i, r.gPlttBufferUnfaded.get(i));
  }
  BlendPalettes(selectedPalettes, coeff, color);
}

/** 1:1 décomp `RunTasks()` — exécute toutes les tasks actives. */
export function RunTasks(): void {
  rt().runTasks();
}
// 1:1 décomp `AnimateSprites()` (sprite.c:308) + `BuildOamBuffer()` (sprite.c:325) :
// DÉFINIS dans game/sprite.ts (home miroir de sprite.c), re-export transitionnel pour
// les importeurs historiques (main_menu, mail, OW welcome). Relocalisés E2.3e.
export { AnimateSprites, BuildOamBuffer } from '../../src/sprite';

// ─── Title screen / audio stubs ──────────────────────────────────────────────
/** 1:1 décomp title_screen.c:859 — color cycling sur BG palette 14 entry 15
 *  (= Rayquaza eye marking). Recalcule la couleur tous les 4 frames depuis
 *  Cos(frameNum, Q_8_8(0.5)) en RGB(r, g, 12). */
export function UpdateLegendaryMarkingColor(frameNum: number): void {
  if ((frameNum & 0xFF) % 4 !== 0) return;
  // Cos(idx, amp) = (G_SINE_TABLE[(idx+64) & 0xFF] * amp) >> 8. Q_8_8(0.5) = 128.
  const cosIdx = ((frameNum & 0xFF) + 64) & 0xFF;
  const cosVal = (G_SINE_TABLE[cosIdx] * 128) >> 8;
  // intensity = cosVal + 128 (= cos*0.5 + 0.5, en Q.8 fixed)
  const intensity = cosVal + 128;
  // r = 31 - (intensity * 31) >> 8, g = 31 - (intensity * 22) >> 8
  const r = 31 - ((intensity * 31) >> 8);
  const g = 31 - ((intensity * 22) >> 8);
  const b = 12;
  // RGB15 = (b << 10) | (g << 5) | r
  const color = ((b & 0x1F) << 10) | ((g & 0x1F) << 5) | (r & 0x1F);
  // 1:1 décomp : BG_PLTT_ID(14) + 15 = slot 239. Doit écrire dans unfaded ET
  // faded car UpdatePaletteFade copie unfaded → faded chaque frame.
  // ⚠️ Notre rayquaza.png a été extrait avec la palette gold (= "Legendary
  // Marking") à idx 0 au lieu d'idx 15. Donc les pixels marking sont rendus
  // transparents (notre BG renderer skip idx 0 = GBATEK behavior 4bpp). TODO
  // ré-extraire rayquaza depuis ROM original ou re-mapper tile data + palette
  // pour avoir gold à idx 15 (= 1:1 décomp). En attendant, ce write est sans
  // effet visible mais reste 1:1 source.
  const slot = 14 * 16 + 15;
  const runtime = rt();
  runtime.gPlttBufferUnfaded.set(slot, color);
  runtime.gPlttBufferFaded.set(slot, color);
}
/** 1:1 décomp src/sound.c:290 — `m4aMPlayFadeOut(&gMPlayInfo_BGM, speed)`.
 *  speed = nb de frames pour le fade complet (= unité décomp m4a). On simule
 *  via setMasterParameter('masterGain') en N steps, puis stopSong à la fin
 *  pour libérer le slot. */
export function FadeOutBGM(speed: number): void {
  void import('../m4a/player').then(({ fadeOutBgm }) => fadeOutBgm(speed));
}

/** 1:1 décomp src/sound.c:285 — `m4aMPlayFadeIn(&gMPlayInfo_BGM, speed)`. */
export function FadeInBGM(speed: number): void {
  void import('../m4a/player').then(({ fadeInBgm }) => fadeInBgm(speed));
}
/** 1:1 STRICT décomp `CanResetRTC()` (event_data.c:156-162) :
 *    if (FlagGet(FLAG_SYS_RESET_RTC_ENABLE) && VarGet(VAR_RESET_RTC_ENABLE) == 0x920)
 *        return TRUE;
 *    else
 *        return FALSE;
 *  Used par title screen (= A+B+SELECT combo pour reset RTC offset). */
export function CanResetRTC(): boolean {
  // Délègue au miroir 1:1 `event_data.ts` (source unique : flags/vars number[]).
  // (Avant : lisait globalThis.gSaveBlock1Ptr.flags['FLAG_…'] = ANCIEN format
  //  name-keyed, cassé depuis la migration number[] → corrigé par la délégation.)
  return _MirrorCanResetRTC();
}
export let gBattle_BG1_X = 0;
export let gBattle_BG1_Y = 0;
// 1:1 décomp `gMPlayInfo_BGM` (= struct MusicPlayerInfo). Le décomp lit
// `gMPlayInfo_BGM.status & 0xFFFF == 0` pour détecter la fin de song
// (= ex. Task_TitleScreenPhase3 demo loop quand MUS_TITLE finit).
// Getter dynamique : returns 1 si BGM joue, 0 si finie/stoppée.
export const gMPlayInfo_BGM = {
  get status(): number { return _staticIsPlaying('bgm') ? 1 : 0; },
};

// Synchronise les mutable exports sur globalThis pour que les modules auto-générés
// puissent y accéder sans import ESM (évite "Assignment to constant variable").
const _mutableGlobals: Record<string, { get: () => unknown; set: (v: unknown) => void }> = {
  sIntroCharacterGender: { get: () => sIntroCharacterGender, set: (v) => { sIntroCharacterGender = v as number; } },
  sFlygonYOffset: { get: () => sFlygonYOffset, set: (v) => { sFlygonYOffset = v as number; } },
  gReservedSpritePaletteCount: { get: () => gReservedSpritePaletteCount, set: (v) => { gReservedSpritePaletteCount = v as number; } },
  gBattle_BG1_X: { get: () => gBattle_BG1_X, set: (v) => { gBattle_BG1_X = v as number; } },
  gBattle_BG1_Y: { get: () => gBattle_BG1_Y, set: (v) => { gBattle_BG1_Y = v as number; } },
  gIntroCredits_MovingSceneryVBase: { get: () => gIntroCredits_MovingSceneryVBase, set: (v) => { gIntroCredits_MovingSceneryVBase = v as number; } },
  gIntroCredits_MovingSceneryVOffset: { get: () => gIntroCredits_MovingSceneryVOffset, set: (v) => { gIntroCredits_MovingSceneryVOffset = v as number; } },
  gIntroCredits_MovingSceneryState: { get: () => gIntroCredits_MovingSceneryState, set: (v) => { gIntroCredits_MovingSceneryState = v as number; } },
};
for (const [k, d] of Object.entries(_mutableGlobals)) {
  if (!(k in globalThis)) {
    Object.defineProperty(globalThis, k, { get: d.get, set: d.set, enumerable: true, configurable: true });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI SYSTEM EXPORTS (window.c + text.c + menu.c adapters)
// ═══════════════════════════════════════════════════════════════════════════════
// (scaffold main-menu-data retiré : ses 5 symboles consommés vivent dans src/main_menu.ts,
//  réexposés par `export * from '../../src/main_menu'` plus bas.)
export * from '../../src/window';
// text_window.c (miroir 1:1) — LoadMessageBoxGfx / GetWindowFrameTilesPal /
// GetTextWindowPalette / GetOverworldTextboxPalettePtr / DrawTextBorder* / etc.
// Relocalisé hors de gba-window-system → réexposé ici pour le global-scope.
export * from '../../src/text_window';
// gba-text-system DISSOUS (MIRROR text.c) : son contenu réel (font loader +
// RunTextPrinters + text colors) vit dans src/text.ts ; ses réexports menu/string_util
// pointent vers les vrais foyers. Bundle global reconstitué ici :
export * from '../../src/text'; // 0 collision vérifiée (collision-check.cjs)
export {
  AddTextPrinterParameterized2, AddTextPrinterParameterized3, AddTextPrinterParameterized4,
  AddTextPrinterForMessage, AddTextPrinterForMessage_2, AddTextPrinterWithCustomSpeedForMessage,
  AddTextPrinterWithCallbackForMessage, GetPlayerTextSpeed, GetPlayerTextSpeedDelay,
  RunTextPrintersAndIsPrinter0Active,
} from '../../src/menu';
export {
  gStringVar1, gStringVar2, gStringVar3, gStringVar4, StringExpandPlaceholders,
} from '../../include/string_util';
// gba-menu-system DISSOUS (MIRROR, fourre-tout) : symboles routés vers leurs vrais
// foyers ; bundle global reconstitué ici en réexports NOMMÉS (collision-free).
// CanResetRTC = déjà export LOCAL ci-dessus (ne PAS réexporter).
export { Menu_GetCursorPos, Menu_ProcessInputNoWrapClearOnChoose } from '../../src/menu';
export { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../../src/engine/save/save-block-state';
export { IsWirelessAdapterConnected } from '../../src/link';
export { IsMysteryGiftEnabled } from '../../include/event_data';
export { RtcGetErrorStatus } from '../../src/rtc';
// PlayBGM = déjà export LOCAL decomp-globals (ne PAS réexporter ; sound.ts = foyer 1:1).
export { gSaveFileStatus } from '../../src/save';
// Phase C audit session 83 : main_menu.c-specific helpers extraits dans
// `main-menu-impl.ts` (= split du gba-menu-system.ts pour respecter directive
// #1 "foundations unifiées + 1:1 décomp"). Re-export pour les auto callbacks.
export * from '../../src/main_menu';
export * from '../../src/engine/ui/gba-strings';
// Foundational pokeball/release effects (used by Birch, battles, eggs, evolutions).
export {
  BALL_POKE, BALL_GREAT, BALL_SAFARI, BALL_ULTRA, BALL_MASTER, BALL_NET,
  BALL_DIVE, BALL_NEST, BALL_REPEAT, BALL_TIMER, BALL_LUXURY, BALL_PREMIER,
  POKEBALL_COUNT,
} from '../../include/pokeball';

// Audit V2 (session 90) — foundational mon-front-sprite animation system.
// 1:1 décomp src/pokemon.c:6779 DoMonFrontSpriteAnimation +
//          src/pokemon_animation.c:941 LaunchAnimationTaskForFrontSprite.
// Used by Birch (final pos), battle send-out, egg hatch, evolution, trade,
// Pokedex, Summary screen.
import {
  DoMonFrontSpriteAnimation as _DoMonFrontSpriteAnimation,
  LaunchAnimationTaskForFrontSprite as _LaunchAnimationTaskForFrontSprite,
  HasTwoFramesAnimation as _HasTwoFramesAnimation,
  ResetAllMonAnimations as _ResetAllMonAnimations,
  StopMonFrontSpriteAnimation as _StopMonFrontSpriteAnimation,
} from '../../src/pokemon_animation';

// Re-export pour usage par auto callbacks (= LaunchAnimationTaskForFrontSprite
// est un symbol décomp standard utilisé par battle/Pokedex/etc).
export const LaunchAnimationTaskForFrontSprite = _LaunchAnimationTaskForFrontSprite;
export const HasTwoFramesAnimation = _HasTwoFramesAnimation;
export const ResetAllMonAnimations = _ResetAllMonAnimations;
export const StopMonFrontSpriteAnimation = _StopMonFrontSpriteAnimation;
export const DoMonFrontSpriteAnimation = _DoMonFrontSpriteAnimation;

// Bridge globalThis pour les callsites qui peuvent pas import directement
// (= main-menu-impl.ts → FreeAndDestroyMonPicSprite would create a circular
// dep pokemon-animation→main-menu-impl→pokemon-animation if direct).
(globalThis as Record<string, unknown>).__StopMonFrontSpriteAnimation = _StopMonFrontSpriteAnimation;
(globalThis as Record<string, unknown>).__ResetAllMonAnimations = _ResetAllMonAnimations;

// ─── Stubs for main_menu-callbacks-auto.ts ───────────────────────────────────
// Phase D-cleanup audit session 83 : stubs Birch-specific extraits vers
// main-menu-impl.ts (= consolidation thématique). Ici ne reste que les
// helpers sprite GENERIQUES (= utilisés dans plusieurs scenes).
//
// 1:1 décomp src/sprite.c InitSpriteAffineAnim — init affine animation state
// pour un sprite. Stub no-op : notre engine n'a pas encore d'affine animation
// runtime (= TODO future, utilisé par Birch player shrink + battle anims).
export function InitSpriteAffineAnim(_sprite: any): void { /* TODO future affine anims */ }

/** 1:1 décomp `PIXEL_FILL(value)` macro — fills both nibbles of a byte. */
export function PIXEL_FILL(value: number): number {
  return value | (value << 4);
}

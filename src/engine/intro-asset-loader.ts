/**
 * intro-asset-loader.ts — preload async des assets utilisés par les Tasks intro.
 *
 * Task_Scene1_Load (transcrite 1:1 décomp) appelle `LZ77UnCompVram(sIntro1Bg_Gfx, ...)`
 * de manière SYNCHRONE. Notre engine = data dans des PNGs/binaires fetchés async.
 * Solution : preload tout AVANT de poser la Task → cache populé → helpers
 * lookup-cache + write sync.
 *
 * Mapping symbol → URL via GFX_SOURCES (intro-data.ts auto-extrait).
 *
 * 1:1 décomp src/intro.c — `static const u32 sIntro1Bg_Gfx[] = INCGFX_U32(...)`
 * = data en ROM décompressable au runtime via LZ77UnCompVram.
 */
import { assetCache } from './decomp-globals';
import { GFX_SOURCES } from './decomp-data/auto/src/intro-data';
import { loadIndexedPng, loadTilemapBin, loadGbaPal } from './gba/png-loader';

/** Convertit un GFX_SOURCES path "graphics/intro/scene_1/bg.pal" → URL public. */
function urlFor(decompPath: string): string {
  return '/decomp/em/' + decompPath.replace(/^graphics\//, '');
}

/** Charge un asset depuis GFX_SOURCES + populate le cache.
 *  Le type d'asset (palette/tilemap/charData) est déterminé par l'extension :
 *    - .gbapal → loadGbaPal → Uint16Array (16 colors RGB15)
 *    - .lz (tilemap) → loadTilemapBin → Uint16Array (tile indices)
 *    - .lz (charData) → loadIndexedPng → Uint8Array (4bpp tile data)
 *
 *  Symbol → cache key direct (= comme le décomp accède via symbol). */
async function loadSymbol(symbol: string, source: { path: string; ext: string; type: string }): Promise<void> {
  const url = urlFor(source.path);
  if (source.ext === '.gbapal') {
    const pal = await loadGbaPal(url);
    assetCache.set(symbol, pal);
  } else if (source.path.endsWith('.bin')) {
    // Tilemap raw u16 (déjà décompressé par notre extracteur)
    const tilemap = await loadTilemapBin(url);
    assetCache.set(symbol, tilemap);
  } else if (source.ext.includes('.4bpp.lz') || source.ext.includes('.4bpp')) {
    // Char data 4bpp depuis PNG indexé
    const png = await loadIndexedPng(url);
    assetCache.set(symbol, png.charData);
    // Si symbol _Pal correspondant pas en cache, populate avec le PLTE PNG
    const palSymbol = symbol.endsWith('_Gfx') ? symbol.replace(/_Gfx$/, '_Pal') : null;
    if (palSymbol && !assetCache.has(palSymbol) && !(palSymbol in GFX_SOURCES)) {
      assetCache.set(palSymbol, png.palette);
    }
  } else if (source.ext.includes('.8bpp')) {
    // Char data 8bpp (BG affine)
    const png = await loadIndexedPng(url);
    assetCache.set(symbol, png.charData);
  } else {
    console.warn(`[intro-asset-loader] unknown ext for ${symbol}: ${source.ext}`);
  }
}

/** Pré-charge tous les assets nécessaires aux Tasks Scene 1.
 *  Liste hardcoded ici (= ce que Task_Scene1_Load + ses sous-tasks utilisent).
 *  À compléter au fur et à mesure que de nouvelles Tasks consomment de
 *  nouveaux assets. */
export async function preloadScene1Assets(): Promise<void> {
  const scene1Symbols = [
    // BG layers (Task_Scene1_Load LZ77UnCompVram + LoadPalette)
    'sIntro1Bg_Gfx',
    'sIntro1Bg_Pal',
    'sIntro1Bg0_Tilemap',
    'sIntro1Bg1_Tilemap',
    'sIntro1Bg2_Tilemap',
    'sIntro1Bg3_Tilemap',
    // Sprite sheets + palettes (Task_Scene1_Load via LoadCompressedSpriteSheet/Palettes)
    'sIntroDropsLogo_Gfx',
    'sIntroDrops_Pal',
    'sIntroLogo_Pal',
    // Flygon silhouette (apparait à TIMER_FLYGON_SILHOUETTE_APPEAR)
    'sIntroFlygonSilhouette_Pal',
  ];

  await Promise.all(scene1Symbols.map(async (sym) => {
    const src = (GFX_SOURCES as Record<string, { path: string; ext: string; type: string }>)[sym];
    if (!src) {
      console.warn(`[intro-asset-loader] symbol ${sym} not in GFX_SOURCES`);
      return;
    }
    try {
      await loadSymbol(sym, src);
    } catch (e) {
      console.error(`[intro-asset-loader] failed to load ${sym}:`, e);
    }
  }));

  // Charge aussi les g-prefixed extras (Sparkle, Lightning, Flygon Scene 2,
  // texte fade palette) qui ne sont pas dans GFX_SOURCES (= externs graphics.c).
  await loadGPrefixedExtras();

  console.log(`[intro-asset-loader] Scene 1 preload done (${assetCache.size} symbols cached)`);
}

/** Charge les g-prefixed assets (= externs graphics.c décomp, hors GFX_SOURCES). */
async function loadGPrefixedExtras(): Promise<void> {
  const externs: Array<{ symbol: string; url: string; type: 'png' | 'pal' }> = [
    { symbol: 'gIntroSparkle_Gfx', url: '/decomp/em/intro/scene_1/sparkle.png', type: 'png' },
    { symbol: 'gIntroFlygonSilhouette_Gfx', url: '/decomp/em/intro/scene_1/flygon.png', type: 'png' },
    // Text palette pour color cycle GAME FREAK letters (CpuCopy16 dans Task_Scene1_Load)
    { symbol: 'gIntroGameFreakTextFade_Pal', url: '/decomp/em/intro/scene_1/text.pal', type: 'pal' },
  ];

  await Promise.all(externs.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png') {
        const png = await loadIndexedPng(url);
        assetCache.set(symbol, png.charData);
        const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
        if (!assetCache.has(palSymbol)) assetCache.set(palSymbol, png.palette);
      } else {
        const pal = await loadGbaPal(url);
        assetCache.set(symbol, pal);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] extern ${symbol} failed:`, e);
    }
  }));
}

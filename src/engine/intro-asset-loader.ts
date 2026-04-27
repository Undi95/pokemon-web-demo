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
    // Si path est .png : extraire le PLTE du PNG (= palette embedded)
    if (source.path.endsWith('.png')) {
      const png = await loadIndexedPng(url);
      assetCache.set(symbol, png.palette);
    } else {
      const pal = await loadGbaPal(url);
      assetCache.set(symbol, pal);
    }
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

/** Pré-charge tous les assets nécessaires aux Tasks Scene 2.
 *  1:1 décomp src/intro_credits_graphics.c — BG bike road (grass + trees) +
 *  sprite sheets player (Brendan/May/Bicycle) + Pokémon (Volbeat/Torchic/
 *  Manectric/Flygon).
 *
 *  Note : les paths Scene 2 ne sont PAS dans GFX_SOURCES (= intro-data.ts
 *  qui ne couvre que src/intro.c). On les hardcode ici pour l'instant.
 *  TODO Phase 2 : étendre l'extracteur intro-data.ts à intro_credits_graphics.c. */
export async function preloadScene2Assets(): Promise<void> {
  const scene2Assets: Array<{ symbol: string; url: string; type: 'png' | 'palfile' | 'tilemap' }> = [
    // BG ground
    { symbol: 'sGrass_Gfx', url: '/decomp/em/intro/scene_2/grass.png', type: 'png' },
    { symbol: 'sGrass_Tilemap', url: '/decomp/em/intro/scene_2/grass_map.bin', type: 'tilemap' },
    // BG trees (scenery=1)
    { symbol: 'sTrees_Gfx', url: '/decomp/em/intro/scene_2/trees.png', type: 'png' },
    { symbol: 'sTrees_Tilemap', url: '/decomp/em/intro/scene_2/trees_map.bin', type: 'tilemap' },
    // Sprite sheets (Brendan/May/Bicycle/Pokémon — pour Action 4 Phase 2)
    { symbol: 'gIntroBrendan_Gfx', url: '/decomp/em/intro/scene_2/brendan.png', type: 'png' },
    { symbol: 'gIntroMay_Gfx', url: '/decomp/em/intro/scene_2/may.png', type: 'png' },
    { symbol: 'gIntroBicycle_Gfx', url: '/decomp/em/intro/scene_2/bicycle.png', type: 'png' },
    { symbol: 'gIntroFlygon_Gfx', url: '/decomp/em/intro/scene_2/flygon.png', type: 'png' },
    { symbol: 'gIntroVolbeat_Gfx', url: '/decomp/em/intro/scene_2/volbeat.png', type: 'png' },
    { symbol: 'gIntroTorchic_Gfx', url: '/decomp/em/intro/scene_2/torchic.png', type: 'png' },
    { symbol: 'gIntroManectric_Gfx', url: '/decomp/em/intro/scene_2/manectric.png', type: 'png' },
  ];

  await Promise.all(scene2Assets.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png') {
        const png = await loadIndexedPng(url);
        assetCache.set(symbol, png.charData);
        // Palette embedded PNG → populate _Pal symbol correspondant si pas dans cache
        const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
        if (palSymbol !== symbol && !assetCache.has(palSymbol)) {
          assetCache.set(palSymbol, png.palette);
        }
      } else if (type === 'tilemap') {
        const tilemap = await loadTilemapBin(url);
        assetCache.set(symbol, tilemap);
      } else if (type === 'palfile') {
        const pal = await loadGbaPal(url);
        assetCache.set(symbol, pal);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 2 load failed for ${symbol}:`, e);
    }
  }));
  console.log(`[intro-asset-loader] Scene 2 preload done (${assetCache.size} symbols total cached)`);
}

/** Pré-charge tous les assets Scene 3 (Pokeball spin + Groudon/Kyogre/Rayquaza).
 *  Charge depuis GFX_SOURCES (qui contient les Scene 3 paths). */
export async function preloadScene3Assets(): Promise<void> {
  const scene3Symbols = [
    'sIntroPokeball_Pal', 'sIntroPokeball_Tilemap', 'sIntroPokeball_Gfx',
    'sIntroStreaks_Pal', 'sIntroStreaks_Gfx', 'sIntroStreaks_Tilemap',
    'sIntroRayquzaOrb_Pal', 'sIntroMisc_Pal', 'sIntroMisc_Gfx',
    'sIntroLati_Gfx',
  ];
  await Promise.all(scene3Symbols.map(async (sym) => {
    const src = (GFX_SOURCES as Record<string, { path: string; ext: string; type: string }>)[sym];
    if (!src) {
      console.warn(`[intro-asset-loader] Scene 3 symbol ${sym} not in GFX_SOURCES`);
      return;
    }
    try {
      await loadSymbol(sym, src);
    } catch (e) {
      console.error(`[intro-asset-loader] Scene 3 load failed for ${sym}:`, e);
    }
  }));
  // gIntro3Bg_Pal pour INTRO3_RAW_PTR (= palette raw scene 3)
  try {
    const pal = await loadGbaPal('/decomp/em/intro/scene_3/misc.pal');
    assetCache.set('gIntro3Bg_Pal', pal);
  } catch (e) {
    console.warn('[intro-asset-loader] gIntro3Bg_Pal not loaded:', e);
  }
  // g-prefixed externs Scene 3
  const externs: Array<{ symbol: string; url: string }> = [
    { symbol: 'gIntroLightning_Gfx', url: '/decomp/em/intro/scene_3/lightning.png' },
    { symbol: 'gIntroBubbles_Gfx', url: '/decomp/em/intro/scene_3/bubbles.png' },
  ];
  await Promise.all(externs.map(async ({ symbol, url }) => {
    try {
      const png = await loadIndexedPng(url);
      assetCache.set(symbol, png.charData);
      const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
      if (!assetCache.has(palSymbol)) assetCache.set(palSymbol, png.palette);
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 extern ${symbol} failed:`, e);
    }
  }));
  console.log(`[intro-asset-loader] Scene 3 preload done (${assetCache.size} symbols total cached)`);
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

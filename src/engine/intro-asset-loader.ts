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
import { loadIndexedPng, loadIndexedPngStrict, loadTilemapBin, loadAffineTilemapBin, loadGbaPal } from './gba/png-loader';

/** Charge un PNG 4bpp en préservant les indices palette du PLTE embedded.
 *  À utiliser pour les sprites/BG qui partagent une palette master (title screen,
 *  intro scenes) au lieu de `loadIndexedPng` qui remap "first insert wins". */
async function loadIndexedPngPreserveIndices(url: string): Promise<{ charData: Uint8Array; palette: Uint16Array }> {
  return loadIndexedPngStrict(url, 4);
}

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
    const png = await loadIndexedPngStrict(url, 4);
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

/** Pré-charge tous les assets nécessaires aux Tasks Scene 1 + copyright.
 *  Liste hardcoded ici (= ce que Task_Scene1_Load + ses sous-tasks utilisent).
 *  À compléter au fur et à mesure que de nouvelles Tasks consomment de
 *  nouveaux assets. */
export async function preloadScene1Assets(): Promise<void> {
  const scene1Symbols = [
    // Copyright screen (boot)
    'gIntroCopyright_Gfx',
    'gIntroCopyright_Tilemap',
    'gIntroCopyright_Pal',
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

  // Copyright screen assets (not in GFX_SOURCES — direct from public/)
  const copyrightAssets: Array<{ symbol: string; url: string; type: 'png' | 'png-strict-4bpp' | 'tilemap' | 'pal' }> = [
    { symbol: 'gIntroCopyright_Gfx', url: '/decomp/em/intro/copyright.png', type: 'png' },
    { symbol: 'gIntroCopyright_Tilemap', url: '/decomp/em/intro/copyright.bin', type: 'tilemap' },
  ];
  await Promise.all(copyrightAssets.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png' || type === 'png-strict-4bpp') {
        const png = type === 'png-strict-4bpp'
          ? await loadIndexedPngStrict(url, 4)
          : await loadIndexedPng(url);
        assetCache.set(symbol, png.charData);
        const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
        if (!assetCache.has(palSymbol)) assetCache.set(palSymbol, png.palette);
      } else if (type === 'tilemap') {
        const tm = await loadTilemapBin(url);
        assetCache.set(symbol, tm);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] Copyright load failed for ${symbol}:`, e);
    }
  }));

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
  const scene2Assets: Array<{ symbol: string; url: string; type: 'png' | 'png-strict-4bpp' | 'palfile' | 'tilemap' }> = [
    // BG ground
    { symbol: 'sGrass_Gfx', url: '/decomp/em/intro/scene_2/grass.png', type: 'png-strict-4bpp' },
    { symbol: 'sGrass_Tilemap', url: '/decomp/em/intro/scene_2/grass_map.bin', type: 'tilemap' },
    // BG trees (scenery=1)
    { symbol: 'sTrees_Gfx', url: '/decomp/em/intro/scene_2/trees.png', type: 'png-strict-4bpp' },
    { symbol: 'sTrees_Tilemap', url: '/decomp/em/intro/scene_2/trees_map.bin', type: 'tilemap' },
    // Sprite sheets (Brendan/May/Bicycle/Pokémon — pour Action 4 Phase 2)
    { symbol: 'gIntroBrendan_Gfx', url: '/decomp/em/intro/scene_2/brendan.png', type: 'png-strict-4bpp' },
    { symbol: 'gIntroMay_Gfx', url: '/decomp/em/intro/scene_2/may.png', type: 'png-strict-4bpp' },
    { symbol: 'gIntroBicycle_Gfx', url: '/decomp/em/intro/scene_2/bicycle.png', type: 'png-strict-4bpp' },
    { symbol: 'sBicycle_Gfx', url: '/decomp/em/intro/scene_2/bicycle.png', type: 'png-strict-4bpp' },
    { symbol: 'gIntroFlygon_Gfx', url: '/decomp/em/intro/scene_2/flygon.png', type: 'png-strict-4bpp' },
    { symbol: 'gIntroVolbeat_Gfx', url: '/decomp/em/intro/scene_2/volbeat.png', type: 'png-strict-4bpp' },
    { symbol: 'gIntroTorchic_Gfx', url: '/decomp/em/intro/scene_2/torchic.png', type: 'png-strict-4bpp' },
    { symbol: 'gIntroManectric_Gfx', url: '/decomp/em/intro/scene_2/manectric.png', type: 'png-strict-4bpp' },
    // Palettes player (Brendan/May)
    { symbol: 'gIntroPlayer_Pal', url: '/decomp/em/intro/scene_2/player.pal', type: 'palfile' },
  ];

  await Promise.all(scene2Assets.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png' || type === 'png-strict-4bpp') {
        const png = type === 'png-strict-4bpp'
          ? await loadIndexedPngStrict(url, 4)
          : await loadIndexedPng(url);
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
  // g-prefixed externs Scene 3 (4bpp PNGs)
  const externs4bpp: Array<{ symbol: string; url: string }> = [
    { symbol: 'gIntroLightning_Gfx', url: '/decomp/em/intro/scene_3/lightning.png' },
    { symbol: 'gIntroBubbles_Gfx', url: '/decomp/em/intro/scene_3/bubbles.png' },
    { symbol: 'gIntroLegendBg_Gfx', url: '/decomp/em/intro/scene_3/legend_bg.png' },
    { symbol: 'gIntroClouds_Gfx', url: '/decomp/em/intro/scene_3/clouds.png' },
    { symbol: 'gIntroRayquaza_Gfx', url: '/decomp/em/intro/scene_3/rayquaza.png' },
    { symbol: 'gIntroRayquazaClouds_Gfx', url: '/decomp/em/intro/scene_3/rayquaza_clouds.png' },
  ];
  await Promise.all(externs4bpp.map(async ({ symbol, url }) => {
    try {
      const png = await loadIndexedPngStrict(url, 4);
      assetCache.set(symbol, png.charData);
      const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
      if (!assetCache.has(palSymbol)) assetCache.set(palSymbol, png.palette);
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 extern ${symbol} failed:`, e);
    }
  }));

  // Scene 3 8bpp PNGs
  const externs8bpp: Array<{ symbol: string; url: string }> = [
    { symbol: 'gIntroGroudon_Gfx', url: '/decomp/em/intro/scene_3/groudon.png' },
    { symbol: 'gIntroKyogre_Gfx', url: '/decomp/em/intro/scene_3/kyogre.png' },
  ];
  await Promise.all(externs8bpp.map(async ({ symbol, url }) => {
    try {
      const data = await loadIndexedPngStrict(url, 8);
      assetCache.set(symbol, data.charData);
      const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
      if (!assetCache.has(palSymbol)) assetCache.set(palSymbol, data.palette);
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 8bpp ${symbol} failed:`, e);
    }
  }));

  // Scene 3 tilemaps (.bin)
  const externsTilemap: Array<{ symbol: string; url: string }> = [
    { symbol: 'gIntroGroudon_Tilemap', url: '/decomp/em/intro/scene_3/groudon.bin' },
    { symbol: 'gIntroKyogre_Tilemap', url: '/decomp/em/intro/scene_3/kyogre.bin' },
    { symbol: 'gIntroGroudonBg_Tilemap', url: '/decomp/em/intro/scene_3/groudon_bg.bin' },
    { symbol: 'gIntroKyogreBg_Tilemap', url: '/decomp/em/intro/scene_3/kyogre_bg.bin' },
    { symbol: 'gIntroCloudsSun_Tilemap', url: '/decomp/em/intro/scene_3/clouds_sun.bin' },
    { symbol: 'gIntroCloudsLeft_Tilemap', url: '/decomp/em/intro/scene_3/clouds_left.bin' },
    { symbol: 'gIntroCloudsRight_Tilemap', url: '/decomp/em/intro/scene_3/clouds_right.bin' },
    { symbol: 'gIntroRayquaza_Tilemap', url: '/decomp/em/intro/scene_3/rayquaza.bin' },
    { symbol: 'gIntroRayquazaClouds_Tilemap', url: '/decomp/em/intro/scene_3/rayquaza_clouds.bin' },
  ];
  await Promise.all(externsTilemap.map(async ({ symbol, url }) => {
    try {
      const tm = await loadTilemapBin(url);
      assetCache.set(symbol, tm);
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 tilemap ${symbol} failed:`, e);
    }
  }));
  console.log(`[intro-asset-loader] Scene 3 preload done (${assetCache.size} symbols total cached)`);
}

/** Pré-charge les assets Title screen (Rayquaza + Clouds + Pokemon Logo + Version). */
export async function preloadTitleAssets(): Promise<void> {
  const titleAssets: Array<{ symbol: string; url: string; type: 'png' | 'png-strict-4bpp' | 'png8bpp' | 'tilemap' | 'affinetilemap' | 'pal' }> = [
    { symbol: 'sTitleScreenRayquazaGfx', url: '/decomp/em/boot/title_screen/rayquaza.png', type: 'png-strict-4bpp' },
    { symbol: 'sTitleScreenRayquazaTilemap', url: '/decomp/em/boot/title_screen/rayquaza.bin', type: 'tilemap' },
    { symbol: 'sTitleScreenCloudsGfx', url: '/decomp/em/boot/title_screen/clouds.png', type: 'png-strict-4bpp' },
    { symbol: 'gTitleScreenCloudsTilemap', url: '/decomp/em/boot/title_screen/clouds.bin', type: 'tilemap' },
    // pokemon_logo est 8bpp affine BG (256 colors) — pas 4bpp
    { symbol: 'gTitleScreenPokemonLogoGfx', url: '/decomp/em/boot/title_screen/pokemon_logo.png', type: 'png8bpp' },
    // Affine tilemap = 1 byte par tile, doit être expandé en u16 pour le compositor
    { symbol: 'gTitleScreenPokemonLogoTilemap', url: '/decomp/em/boot/title_screen/pokemon_logo.bin', type: 'affinetilemap' },
    { symbol: 'gTitleScreenBgPalettes', url: '/decomp/em/boot/title_screen/pokemon_logo.pal', type: 'pal' },
    // emerald_version : sprite sheet + palette embedded dans le PNG
    { symbol: 'gTitleScreenEmeraldVersionGfx', url: '/decomp/em/boot/title_screen/emerald_version.png', type: 'png-strict-4bpp' },
    // press_start : sprite sheet + palette
    { symbol: 'gTitleScreenPressStartGfx', url: '/decomp/em/boot/title_screen/press_start.png', type: 'png-strict-4bpp' },
    // logo_shine : sprite sheet
    { symbol: 'sTitleScreenLogoShineGfx', url: '/decomp/em/boot/title_screen/logo_shine.png', type: 'png-strict-4bpp' },
    // Main menu palettes (needed when transitioning from title to menu)
    { symbol: 'sMainMenuBgPal', url: '/decomp/em/ui/interface/main_menu_bg.pal', type: 'pal' },
    { symbol: 'sMainMenuTextPal', url: '/decomp/em/ui/interface/main_menu_text.pal', type: 'pal' },
  ];
  await Promise.all(titleAssets.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png' || type === 'png8bpp' || type === 'png-strict-4bpp') {
        // png8bpp : utilise loadIndexedPngStrict (= extract PLTE PNG embedded au
        // lieu de detect 4bpp uniques). Pour 256 colors palette type assets.
        // png-strict-4bpp : préserve les indices du PLTE pour les assets avec
        // palette master partagée (title screen, scenes).
        const { loadIndexedPngStrict } = await import('./gba/png-loader');
        const png = type === 'png8bpp'
          ? await loadIndexedPngStrict(url, 8)
          : type === 'png-strict-4bpp'
          ? await loadIndexedPngStrict(url, 4)
          : await loadIndexedPng(url);
        if (symbol.endsWith('Pal')) {
          assetCache.set(symbol, png.palette);
        } else {
          assetCache.set(symbol, png.charData);
          const palSymbol = symbol.replace(/Gfx$/, 'Pal');
          if (palSymbol !== symbol && !assetCache.has(palSymbol)) assetCache.set(palSymbol, png.palette);
        }
      } else if (type === 'tilemap') {
        const tilemap = await loadTilemapBin(url);
        assetCache.set(symbol, tilemap);
      } else if (type === 'affinetilemap') {
        const tilemap = await loadAffineTilemapBin(url);
        assetCache.set(symbol, tilemap);
      } else if (type === 'pal') {
        const pal = await loadGbaPal(url);
        assetCache.set(symbol, pal);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] Title load failed for ${symbol}:`, e);
    }
  }));

  // 1:1 décomp graphics.c:1508 : gTitleScreenBgPalettes = INCBIN(pokemon_logo.gbapal,
  // rayquaza_and_clouds.gbapal) concaténés. pokemon_logo n'utilise que 14 banks
  // (224 colors), bank 14 vient du second fichier (= palette Rayquaza/Clouds).
  // LoadPalette(gTitleScreenBgPalettes, 0, 15 * PLTT_SIZE_4BPP) charge 240 colors :
  // banks 0-13 = logo, bank 14 = Rayquaza/Clouds.
  try {
    const logoPal = await loadGbaPal('/decomp/em/boot/title_screen/pokemon_logo.pal');
    const rcPal = await loadGbaPal('/decomp/em/boot/title_screen/rayquaza_and_clouds.pal');
    const concatPal = new Uint16Array(14 * 16 + rcPal.length);
    concatPal.set(logoPal.subarray(0, 14 * 16), 0);
    concatPal.set(rcPal, 14 * 16);
    assetCache.set('gTitleScreenBgPalettes', concatPal);
  } catch (e) {
    console.warn('[intro-asset-loader] gTitleScreenBgPalettes concat failed:', e);
  }

  console.log(`[intro-asset-loader] Title preload done (${assetCache.size} symbols total cached)`);
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

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

/** Charge un .4bpp.bin ou .8bpp.bin pré-extrait via scripts/extract-png-indexed-tiles.mjs.
 *  Ces fichiers parsent l'IDAT PNG directement → préservent les indices palette
 *  originaux même quand la PLTE a des couleurs duplicates (= cas Rayquaza
 *  marking idx 15 vs body idx 11 qui ont même RGB(0,74,98)).
 *  Fallback transparent si .bin pas trouvé : load PNG normalement. */
async function loadTileBin(url: string, bpp: 4 | 8, fallbackPng?: string): Promise<Uint8Array> {
  const binUrl = url.replace(/\.png$/, `.${bpp}bpp.bin`);
  try {
    const resp = await fetch(binUrl);
    if (resp.ok) {
      const buf = await resp.arrayBuffer();
      return new Uint8Array(buf);
    }
  } catch {/* fall through */}
  // Fallback PNG via canvas (perd les duplicate-color indices mais mieux que rien)
  console.warn(`[intro-asset-loader] no ${binUrl}, fallback PNG canvas extraction`);
  const png = bpp === 4
    ? await loadIndexedPngStrict(fallbackPng ?? url, 4)
    : await loadIndexedPngStrict(fallbackPng ?? url, 8);
  return png.charData;
}

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
    // Si path est .png : extraire le PLTE du PNG (= palette embedded).
    // 1:1 décomp INCGFX_U16(png, ".gbapal") = lit PLTE direct (= 16 ou 256 entries).
    // loadIndexedPngStrict utilise le PLTE FULL chunk (vs loadIndexedPng qui dedup
    // les couleurs uniques observées dans les pixels — wrong pour les Pokemon
    // sprites/BG qui ont PLTE 256 colors mais ne tous les utilisent pas).
    if (source.path.endsWith('.png')) {
      try {
        // 8bpp PNGs (Pokeball/Groudon/Kyogre) → preserve full 256-color PLTE
        const png = await loadIndexedPngStrict(url, 8);
        assetCache.set(symbol, png.palette);
      } catch {
        // Fallback 4bpp (most other PNGs)
        try {
          const png = await loadIndexedPngStrict(url, 4);
          assetCache.set(symbol, png.palette);
        } catch {
          // Final fallback : canvas-based (= remap indices, may be wrong)
          const png = await loadIndexedPng(url);
          assetCache.set(symbol, png.palette);
        }
      }
    } else {
      const pal = await loadGbaPal(url);
      assetCache.set(symbol, pal);
    }
  } else if (source.path.endsWith('.bin')) {
    // Tilemap raw u16 (déjà décompressé par notre extracteur)
    const tilemap = await loadTilemapBin(url);
    assetCache.set(symbol, tilemap);
  } else if (source.ext.includes('.4bpp.lz') || source.ext.includes('.4bpp')) {
    // Char data 4bpp via .4bpp.bin direct (préserve indices originaux).
    const charData = await loadTileBin(url, 4);
    assetCache.set(symbol, charData);
    // Si symbol _Pal correspondant pas en cache, extrait via PNG canvas
    const palSymbol = symbol.endsWith('_Gfx') ? symbol.replace(/_Gfx$/, '_Pal') : null;
    if (palSymbol && !assetCache.has(palSymbol) && !(palSymbol in GFX_SOURCES)) {
      const png = await loadIndexedPngStrict(url, 4);
      assetCache.set(palSymbol, png.palette);
    }
  } else if (source.ext.includes('.8bpp')) {
    // Char data 8bpp via .8bpp.bin direct
    const charData = await loadTileBin(url, 8);
    assetCache.set(symbol, charData);
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
      if (type === 'png-strict-4bpp') {
        // .4bpp.bin direct (préserve indices originaux)
        const charData = await loadTileBin(url, 4);
        assetCache.set(symbol, charData);
        const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
        if (palSymbol !== symbol && !assetCache.has(palSymbol)) {
          const png = await loadIndexedPngStrict(url, 4);
          assetCache.set(palSymbol, png.palette);
        }
      } else if (type === 'png') {
        const png = await loadIndexedPng(url);
        assetCache.set(symbol, png.charData);
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
  // Pokeball Tilemap est un AFFINE tilemap u8 (BG2 affine ScreenSize 1 = 32x32 tiles).
  // loadSymbol l'a chargé via loadTilemapBin (u16 packed) → wrong format. Recharge
  // via loadAffineTilemapBin (u8 → u16 expand chacun comme entry distincte).
  try {
    const tm = await loadAffineTilemapBin('/decomp/em/intro/scene_3/pokeball_map.bin');
    assetCache.set('sIntroPokeball_Tilemap', tm);
  } catch (e) {
    console.warn('[intro-asset-loader] sIntroPokeball_Tilemap reload failed:', e);
  }
  // gIntro3Bg_Pal = palette complète 256 colors Scene 3 (= graphics/intro/scene_3/bg.pal).
  // Used by Task_Scene3_LoadGroudon `CpuCopy16(gIntro3Bg_Pal, gPlttBufferUnfaded, sizeof(gIntro3Bg_Pal))`.
  // L'ancienne version chargeait misc.pal (16 colors seulement) → palette tronquée.
  // ALSO register dans runtime.extraPalettes pour que getExtraPalette() la trouve
  // (= utilisé par auto-callbacks via `rt.getExtraPalette("gIntro3Bg_Pal")`).
  try {
    const pal = await loadGbaPal('/decomp/em/intro/scene_3/bg.pal');
    assetCache.set('gIntro3Bg_Pal', pal);
    const { getRuntime } = await import('./decomp-globals');
    try {
      getRuntime().extraPalettes.set('gIntro3Bg_Pal', pal);
    } catch { /* runtime not yet set, will fallback to assetCache */ }
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
      const charData = await loadTileBin(url, 4);
      assetCache.set(symbol, charData);
      const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
      if (!assetCache.has(palSymbol)) {
        const png = await loadIndexedPngStrict(url, 4);
        assetCache.set(palSymbol, png.palette);
      }
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
      const charData = await loadTileBin(url, 8);
      assetCache.set(symbol, charData);
      const palSymbol = symbol.replace(/_Gfx$/, '_Pal');
      if (!assetCache.has(palSymbol)) {
        const png = await loadIndexedPngStrict(url, 8);
        assetCache.set(palSymbol, png.palette);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 8bpp ${symbol} failed:`, e);
    }
  }));

  // Scene 3 battle anim Rocks (Groudon scene). Décomp utilise
  // gBattleAnimPicTable[ANIM_TAG_ROCKS] pour récupérer le sprite sheet 32x192
  // (96 tiles 4bpp) avec 4 anim frames pour les rocks ancestraux.
  try {
    const rocksGfx = await loadTileBin('/decomp/em/battle_anims/rocks.png', 4);
    assetCache.set('gBattleAnimSpriteGfx_Rocks', rocksGfx);
    const png = await loadIndexedPngStrict('/decomp/em/battle_anims/rocks.png', 4);
    assetCache.set('gBattleAnimSpritePal_Rocks', png.palette);
  } catch (e) {
    console.warn('[intro-asset-loader] rocks.png failed:', e);
  }

  // Scene 3 tilemaps (.bin) — split entre text BGs (u16/tile) et affine BGs (u8/tile).
  // 1:1 décomp : `gIntroGroudon_Tilemap` va à `BG_CHAR_ADDR(3)` (= screenBase 24
  // = mapBase de BG2 affine). `gIntroGroudonBg_Tilemap` va à BG_SCREEN_ADDR(28)
  // (= BG1 text). Les noms sont contre-intuitifs ! Idem Kyogre.
  const externsTilemapText: Array<{ symbol: string; url: string }> = [
    { symbol: 'gIntroGroudonBg_Tilemap', url: '/decomp/em/intro/scene_3/groudon_bg.bin' },
    { symbol: 'gIntroKyogreBg_Tilemap', url: '/decomp/em/intro/scene_3/kyogre_bg.bin' },
    { symbol: 'gIntroCloudsLeft_Tilemap', url: '/decomp/em/intro/scene_3/clouds_left.bin' },
    { symbol: 'gIntroCloudsRight_Tilemap', url: '/decomp/em/intro/scene_3/clouds_right.bin' },
    { symbol: 'gIntroRayquaza_Tilemap', url: '/decomp/em/intro/scene_3/rayquaza.bin' },
    { symbol: 'gIntroRayquazaClouds_Tilemap', url: '/decomp/em/intro/scene_3/rayquaza_clouds.bin' },
    // gIntroCloudsSun_Tilemap = BG2 TEXT mode (BGCNT_TXT256x256, 16 colors) per
    // intro.c:2347-2351. File is 2048 bytes = 1024 u16 entries (NOT affine 1024 u8).
    { symbol: 'gIntroCloudsSun_Tilemap', url: '/decomp/em/intro/scene_3/clouds_sun.bin' },
  ];
  // Affine BG tilemaps : 1 byte/tile mais notre engine attend Uint16Array → expand u8 → u16.
  const externsTilemapAffine: Array<{ symbol: string; url: string }> = [
    { symbol: 'gIntroGroudon_Tilemap', url: '/decomp/em/intro/scene_3/groudon.bin' },
    { symbol: 'gIntroKyogre_Tilemap', url: '/decomp/em/intro/scene_3/kyogre.bin' },
  ];
  await Promise.all(externsTilemapText.map(async ({ symbol, url }) => {
    try {
      const tm = await loadTilemapBin(url);
      assetCache.set(symbol, tm);
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 tilemap ${symbol} failed:`, e);
    }
  }));
  await Promise.all(externsTilemapAffine.map(async ({ symbol, url }) => {
    try {
      const tm = await loadAffineTilemapBin(url);
      assetCache.set(symbol, tm);
    } catch (e) {
      console.warn(`[intro-asset-loader] Scene 3 affine tilemap ${symbol} failed:`, e);
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
    // emerald_version : 8bpp sprite (décomp INCGFX .8bpp.lz, sheet size 4096 bytes)
    { symbol: 'gTitleScreenEmeraldVersionGfx', url: '/decomp/em/boot/title_screen/emerald_version.png', type: 'png8bpp' },
    // press_start : 4bpp sprite sheet
    { symbol: 'gTitleScreenPressStartGfx', url: '/decomp/em/boot/title_screen/press_start.png', type: 'png-strict-4bpp' },
    // logo_shine : 4bpp sprite sheet
    { symbol: 'sTitleScreenLogoShineGfx', url: '/decomp/em/boot/title_screen/logo_shine.png', type: 'png-strict-4bpp' },
    // Main menu palettes (needed when transitioning from title to menu)
    { symbol: 'sMainMenuBgPal', url: '/decomp/em/ui/interface/main_menu_bg.pal', type: 'pal' },
    { symbol: 'sMainMenuTextPal', url: '/decomp/em/ui/interface/main_menu_text.pal', type: 'pal' },
    // Note : les 20 `gTextWindowFrame*_Gfx/Pal` sont preloaded par
    // `preloadTextWindowFrames()` (cf. `gba-text-window.ts`, foundation partagée).
    // Utilisés par main menu + option menu + dialogues.
  ];
  await Promise.all(titleAssets.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png-strict-4bpp') {
        // .4bpp.bin direct (= IDAT-parse, préserve duplicate-color indices).
        const charData = await loadTileBin(url, 4);
        assetCache.set(symbol, charData);
        // Si symbol _Pal absent, extrait via PNG canvas pour la palette
        const palSymbol = symbol.replace(/Gfx$/, 'Pal');
        if (palSymbol !== symbol && !assetCache.has(palSymbol)) {
          const { loadIndexedPngStrict } = await import('./gba/png-loader');
          const png = await loadIndexedPngStrict(url, 4);
          assetCache.set(palSymbol, png.palette);
        }
      } else if (type === 'png8bpp') {
        // .8bpp.bin direct
        const charData = await loadTileBin(url, 8);
        assetCache.set(symbol, charData);
        const palSymbol = symbol.replace(/Gfx$/, 'Pal');
        if (palSymbol !== symbol && !assetCache.has(palSymbol)) {
          const { loadIndexedPngStrict } = await import('./gba/png-loader');
          const png = await loadIndexedPngStrict(url, 8);
          assetCache.set(palSymbol, png.palette);
        }
      } else if (type === 'png') {
        // Legacy : PNG via canvas
        const png = await loadIndexedPng(url);
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

/** Pré-charge les assets Birch Speech (= forest scene avec Birch + Lotad).
 *  1:1 décomp main_menu.c data section :
 *    - sBirchSpeechShadowGfx (= shadow.png 4bpp)
 *    - sBirchSpeechBgMap (= map.bin tilemap)
 *    - sBirchSpeechBgPals (= bg0.pal + bg1.pal concat = 32 colors)
 *    - sBirchSpeechBgGradientPal (= bg2.pal palette gradient)
 *    - sBirchSpeechPlatformBlackPal (= 8 RGB_BLACK colors hardcoded décomp)
 *  Les fichiers raw sont copiés depuis `decomps/pokeemeraude/graphics/birch_speech/`. */
export async function preloadBirchSpeechAssets(): Promise<void> {
  const birchAssets: Array<{ symbol: string; url: string; type: 'png-strict-4bpp' | 'pal' | 'tilemap' }> = [
    // Shadow sprite (= ombre sous Birch/Lotad)
    { symbol: 'sBirchSpeechShadowGfx', url: '/decomp/em/birch_speech/shadow.png', type: 'png-strict-4bpp' },
    // BG tilemap (= 30x20 tiles forest scene)
    { symbol: 'sBirchSpeechBgMap', url: '/decomp/em/birch_speech/map.bin', type: 'tilemap' },
    // 3 palettes gradient pour le BG (bg0=top, bg1=mid, bg2=gradient anim)
    { symbol: 'sBirchSpeechBgPal_0', url: '/decomp/em/birch_speech/bg0.pal', type: 'pal' },
    { symbol: 'sBirchSpeechBgPal_1', url: '/decomp/em/birch_speech/bg1.pal', type: 'pal' },
    { symbol: 'sBirchSpeechBgGradientPal', url: '/decomp/em/birch_speech/bg2.pal', type: 'pal' },
    // Birch character sprite (4bpp)
    { symbol: 'sBirchSpeechBirchSpriteGfx', url: '/decomp/em/birch_speech/birch.png', type: 'png-strict-4bpp' },
  ];
  await Promise.all(birchAssets.map(async ({ symbol, url, type }) => {
    try {
      if (type === 'png-strict-4bpp') {
        const charData = await loadTileBin(url, 4);
        assetCache.set(symbol, charData);
        const palSymbol = symbol.replace(/Gfx$/, 'Pal');
        if (palSymbol !== symbol && !assetCache.has(palSymbol)) {
          const { loadIndexedPngStrict } = await import('./gba/png-loader');
          const png = await loadIndexedPngStrict(url, 4);
          assetCache.set(palSymbol, png.palette);
        }
      } else if (type === 'pal') {
        const pal = await loadGbaPal(url);
        assetCache.set(symbol, pal);
      } else if (type === 'tilemap') {
        const tilemap = await loadTilemapBin(url);
        assetCache.set(symbol, tilemap);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] Birch speech load failed for ${symbol}:`, e);
    }
  }));

  // 1:1 décomp main_menu.c:258 — sBirchSpeechBgPals = bg0 + bg1 concat (= 2 palettes
  // de 16 colors = 32 entries u16). Notre code cache séparément, on concat ici.
  const p0 = assetCache.get('sBirchSpeechBgPal_0');
  const p1 = assetCache.get('sBirchSpeechBgPal_1');
  if (p0 instanceof Uint16Array && p1 instanceof Uint16Array) {
    const merged = new Uint16Array(p0.length + p1.length);
    merged.set(p0, 0);
    merged.set(p1, p0.length);
    assetCache.set('sBirchSpeechBgPals', merged);
  }

  // 1:1 décomp main_menu.c:258 — sBirchSpeechPlatformBlackPal = 8x RGB_BLACK.
  // Hardcoded dans le décomp (pas un asset file), on construit ici.
  const platformBlack = new Uint16Array(8).fill(0);
  assetCache.set('sBirchSpeechPlatformBlackPal', platformBlack);

  // 1:1 décomp src/field_effect.c:245 — sNewGameBirch_Gfx + sNewGameBirch_Pal
  // viennent du même PNG `graphics/birch_speech/birch.png` (= déjà chargé en
  // sBirchSpeechBirchSpriteGfx). On register sous les noms field_effect.c
  // pour que AddNewGameBirchObject (= LoadSpritePalette + CreateSprite) les
  // trouve dans assetCache.
  const birchGfx = assetCache.get('sBirchSpeechBirchSpriteGfx');
  if (birchGfx) assetCache.set('sNewGameBirch_Gfx', birchGfx);
  // sBirchSpeechBirchSpritePal extrait via PNG canvas par loadSymbol → on remap.
  const birchPal = assetCache.get('sBirchSpeechBirchSpritePal');
  if (birchPal) assetCache.set('sNewGameBirch_Pal', birchPal);

  // ─── Trainer front pics : Brendan + May ────────────────────────────────────
  // 1:1 décomp data/trainer_graphics/front_pic_tables.h :
  //   gTrainerFrontPic_Brendan = INCBIN(.4bpp.lz, "graphics/trainers/front_pics/brendan.png")
  //   gTrainerPalette_Brendan = INCBIN(.gbapal.lz, palette du PNG)
  // Notre engine : .4bpp.bin direct + palette extraite via PLTE chunk.
  // CreateTrainerSprite(picId, ...) → LoadCompressedSpritePalette + LoadCompressedSpriteSheet
  // pour les tags du gTrainerFrontPicTable. On charge sous les noms décomp.
  const trainerPics: Array<{ symbol: string; url: string }> = [
    { symbol: 'gTrainerFrontPic_Brendan', url: '/decomp/em/trainer_pics/brendan.png' },
    { symbol: 'gTrainerFrontPic_May', url: '/decomp/em/trainer_pics/may.png' },
  ];
  await Promise.all(trainerPics.map(async ({ symbol, url }) => {
    try {
      const charData = await loadTileBin(url, 4);
      assetCache.set(symbol, charData);
      const palSymbol = symbol.replace(/^gTrainerFrontPic_/, 'gTrainerPalette_');
      if (!assetCache.has(palSymbol)) {
        const png = await loadIndexedPngStrict(url, 4);
        assetCache.set(palSymbol, png.palette);
      }
    } catch (e) {
      console.warn(`[intro-asset-loader] Trainer pic ${symbol} load failed:`, e);
    }
  }));

  // ─── Lotad front pic ───────────────────────────────────────────────────────
  // 1:1 décomp graphics/pokemon/lotad/anim_front.png (= 64×128 = 2 frames :
  // frame 0 idle pose, frame 1 breath/blink pose). Used by
  // DoMonFrontSpriteAnimation idle anim (= LaunchAnimationTaskForFrontSprite
  // toggles between anims that switch tile region between frame 0 and 1).
  //
  // Session 91 fix : V2 audit reverted to single-frame `front.png` because
  // PNG canvas fallback was producing garbage tile data when the PLTE chunk
  // had >16 colors. With `anim_front.4bpp.bin` (extracted from PNG IDAT
  // directly via scripts/extract-png-indexed-tiles.mjs), tile data preserves
  // canonical palette indices identical to ROM build artifacts. The .bin
  // file is 4096 bytes = 128 tiles = 2 × 64-tile frames, matching the decomp
  // INCBIN(.4bpp.lz, "graphics/pokemon/lotad/anim_front.png") layout.
  try {
    const lotadGfx = await loadTileBin('/decomp/em/pokemon/lotad/anim_front.png', 4);
    assetCache.set('gMonFrontPic_Lotad', lotadGfx);
    const lotadPal = await loadGbaPal('/decomp/em/pokemon/lotad/normal.pal');
    assetCache.set('gMonPalette_Lotad', lotadPal);
  } catch (e) {
    console.warn('[intro-asset-loader] Lotad pic load failed:', e);
  }

  // ─── Pokeball sprite (= release Lotad in Birch + battle releases) ─────────
  // 1:1 décomp src/data/graphics/pokeballs.h:1 — gBallGfx_Poke + gBallPal_Poke.
  // Sprite = 16x48 (= 12 tiles 4bpp = 384 bytes per gBallSpriteSheets[BALL_POKE].size).
  // 4 frames anim : closed, half-open, opening, fully-open.
  try {
    const pokeballGfx = await loadTileBin('/decomp/em/balls/poke.png', 4);
    assetCache.set('gBallGfx_Poke', pokeballGfx);
    const pokeballPal = await loadIndexedPngStrict('/decomp/em/balls/poke.png', 4);
    assetCache.set('gBallPal_Poke', pokeballPal.palette);
    // 1:1 décomp src/data/graphics/pokeballs.h:37 gOpenPokeballGfx (= open.png 16x16 = 4 tiles).
    // LoadBallGfx (pokeball.c:1326) overwrite les frames 8-11 du poke.png par open.png.
    const openBallGfx = await loadTileBin('/decomp/em/balls/open.png', 4);
    assetCache.set('gOpenPokeballGfx', openBallGfx);
  } catch (e) {
    console.warn('[intro-asset-loader] Pokeball pic load failed:', e);
  }

  // ─── Ball-open particle sparkles (= AnimateBallOpenParticles) ─────────────
  // 1:1 décomp src/battle_anim_throw.c:143 sBallParticleSpriteSheets[BALL_POKE]
  // = gBattleAnimSpriteGfx_Particles. Indexed 8x64 PNG = 8 tiles 8x8 4bpp.
  // Used by EVERY pokeball release (Birch, battles, eggs, evolutions). Loaded
  // once at boot; pokeball-effects.ts copies into OBJ VRAM on first use.
  try {
    const particlesGfx = await loadTileBin('/decomp/em/battle_anims/particles.png', 4);
    assetCache.set('gBattleAnimSpriteGfx_Particles', particlesGfx);
    const particlesPal = await loadIndexedPngStrict('/decomp/em/battle_anims/particles.png', 4);
    assetCache.set('gBattleAnimSpritePal_Particles', particlesPal.palette);
  } catch (e) {
    console.warn('[intro-asset-loader] Ball particles load failed:', e);
  }

  console.log(`[intro-asset-loader] Birch speech preload done (${assetCache.size} symbols total cached)`);
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

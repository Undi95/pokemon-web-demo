/**
 * battle-bg.ts — Port 1:1 décomp `src/battle_bg.c` chargement BG terrain + textbox.
 *
 * Charge les graphics du battle scene (= BG layers 0, 2, 3) :
 *   - BG0 (charBase=0, mapBase=24) : textbox + windows frame (= grand frame bas)
 *   - BG2 (charBase=1, mapBase=30) : terrain (herbe/cave/sand/eau/etc.)
 *   - BG3 (charBase=2, mapBase=26) : terrain layer 2 (= overlay décoratif)
 *
 * Sources de vérité décomp :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c:602-693` sBattleEnvironmentTable
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c:760-867` DrawMainBattleBackground + LoadBattleTextboxAndBackground
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c:123-161` gBattleBgTemplates
 *
 * 10 terrains 1:1 décomp :
 *   GRASS, LONG_GRASS, SAND, UNDERWATER, WATER, POND, MOUNTAIN, CAVE, BUILDING, PLAIN
 *
 * Override logic (= DrawMainBattleBackground ll. 760-857) :
 *   - LINK / FRONTIER / EREADER / RECORDED_LINK → Building + Frontier palette
 *   - GROUDON → Cave + Groudon palette
 *   - KYOGRE → Water + Kyogre palette
 *   - RAYQUAZA → Rayquaza terrain
 *   - TRAINER + LEADER → Building + BuildingLeader palette
 *   - TRAINER + CHAMPION → Stadium + StadiumWallace palette
 *   - MAP_BATTLE_SCENE_GYM/MAGMA/AQUA/SIDNEY/PHOEBE/GLACIA/DRAKE/FRONTIER → Stadium variants
 *   - Default → sBattleEnvironmentTable[gBattleEnvironment]
 */

import { getRuntime, LoadPalette, LoadBgTiles } from '../system/decomp-globals';
import { loadTilemapBin, loadTileBin, loadGbaPal, extractPngPlte, loadIndexedPngStrict } from '../gba/png-loader';
import { gSaveBlock2Ptr } from '../save/save-block-state';
import { rgba8ToRgb15 } from '../gba/types';
import {
  InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags, InitWindows,
  GetWindowAttribute, WINDOW_BG, type BgTemplate,
} from '../ui/gba-window-system';
import { getBattleWindowTemplates, B_WIN_ACTION_MENU } from './battle-windows';
import { DeactivateAllTextPrinters } from '../ui/gba-text-system';
// gBattleBgTemplates auto-extrait du décomp (battle_bg.c:123-161) — JAMAIS
// retapé main (règle feedback-no-hardcoded-decomp-values).
import { gBattleBgTemplates as _autoBattleBgTemplates } from '../decomp-data/src/battle_bg-data';

/** 1:1 décomp `gPPTextPalette` (graphics/battle_interface/text_pp.pal, 16 u16).
 *  Const ROM dans le décomp ; ici chargé une fois pendant le setup BG combat
 *  (loadBattleTextboxAndBackground) car `SetPpNumbersPaletteInMoveSelection`
 *  (battle_message.c:3110) le lit pour recolorer slot 5 entries 11/12 selon
 *  l'état PP courant. Exposé via getter pour battle-controller-player.ts. */
let _gPPTextPalette: Uint16Array | null = null;
export function getPPTextPalette(): Uint16Array | null { return _gPPTextPalette; }

/** 1:1 décomp battle terrain tiles loader avec 3 sub-palettes support.
 *
 *  Les battle terrains GBA utilisent **3 sub-palettes 16-color** (= 48 colors
 *  total). Le tilemap entries spécifient `paletteBank` (0/1/2) pour chaque tile.
 *  Le tile data 4bpp contient indices LOCAUX 0..15 (= relatifs à la sub-palette).
 *
 *  Bug `loadIndexedPngStrict` : ne prend que les 16 premières colors PLTE,
 *  donc les pixels colored avec sub-pal 1/2 (PLTE colors 16-47) sont mappés
 *  à transparent. Ce helper utilise la PLTE COMPLÈTE et stocke `pltteIdx % 16`
 *  comme local index (= équivalent à ce que le décomp pré-compile dans .4bpp.bin).
 *
 *  Source : `D:/Projet 1/decomps/pokeemeraude/data/battle_terrain/*.png` (= les
 *  PNG d'origine ont leur palette 48-color qui matche exactement notre PLTE). */
async function _loadBattleTerrainTiles(url: string): Promise<Uint8Array> {
  // Extract PLTE complète (= 48 colors pour battle terrains).
  const fullPlte = await extractPngPlte(url);
  if (!fullPlte) throw new Error(`battle terrain PLTE missing: ${url}`);

  // Load + draw to canvas pour accès pixel RGBA.
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = (e) => reject(new Error(`PNG load failed: ${url}: ${e}`));
    el.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error(`canvas ctx failed: ${url}`);
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const widthPx = canvas.width;
  const heightPx = canvas.height;
  if (widthPx % 8 !== 0 || heightPx % 8 !== 0) {
    throw new Error(`${url}: dims must be multiples of 8 (got ${widthPx}×${heightPx})`);
  }
  const widthTiles = widthPx / 8;
  const heightTiles = heightPx / 8;

  // Reverse lookup palette full → idx (= 0..47).
  const palLookup = new Map<number, number>();
  for (let i = 0; i < fullPlte.length; i++) {
    const key = fullPlte[i];
    if (!palLookup.has(key)) palLookup.set(key, i);
  }

  // Map pixels → local index (= pltteIdx % 16) pour 4bpp tile data.
  const idxMap = new Uint8Array(widthPx * heightPx);
  let unmappedCount = 0;
  for (let i = 0; i < widthPx * heightPx; i++) {
    const off = i * 4;
    const a = data[off + 3];
    if (a < 128) { idxMap[i] = 0; continue; }
    const r = data[off], g = data[off + 1], b = data[off + 2];
    const rgb15 = rgba8ToRgb15(r, g, b);
    const idx = palLookup.get(rgb15);
    if (idx === undefined) {
      unmappedCount++;
      idxMap[i] = 0;
      continue;
    }
    idxMap[i] = idx % 16;  // local sub-pal index 0..15
  }
  if (unmappedCount > 0) {
    console.warn(`[battle-bg] ${url}: ${unmappedCount} pixels unmapped`);
  }

  // Pack 4bpp tile-major : 32 bytes par tile, low nibble = left pixel.
  const charData = new Uint8Array(widthTiles * heightTiles * 32);
  for (let ty = 0; ty < heightTiles; ty++) {
    for (let tx = 0; tx < widthTiles; tx++) {
      const tileIdx = ty * widthTiles + tx;
      const tileBaseOffset = tileIdx * 32;
      for (let row = 0; row < 8; row++) {
        for (let pairCol = 0; pairCol < 4; pairCol++) {
          const px1 = idxMap[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2)];
          const px2 = idxMap[(ty * 8 + row) * widthPx + (tx * 8 + pairCol * 2 + 1)];
          charData[tileBaseOffset + row * 4 + pairCol] = (px1 & 0xF) | ((px2 & 0xF) << 4);
        }
      }
    }
  }
  return charData;
}

// 1:1 décomp `enum BattleEnvironment` (= include/constants/battle.h:148-159).
export const BATTLE_ENVIRONMENT_GRASS       = 0;
export const BATTLE_ENVIRONMENT_LONG_GRASS  = 1;
export const BATTLE_ENVIRONMENT_SAND        = 2;
export const BATTLE_ENVIRONMENT_UNDERWATER  = 3;
export const BATTLE_ENVIRONMENT_WATER       = 4;
export const BATTLE_ENVIRONMENT_POND        = 5;
export const BATTLE_ENVIRONMENT_MOUNTAIN    = 6;
export const BATTLE_ENVIRONMENT_CAVE        = 7;
export const BATTLE_ENVIRONMENT_BUILDING    = 8;
export const BATTLE_ENVIRONMENT_PLAIN       = 9;

/** 1:1 décomp `sBattleEnvironmentTable[]` mapping env → asset directory name. */
const ENV_TO_DIR: Record<number, string> = {
  [BATTLE_ENVIRONMENT_GRASS]:       'tall_grass',
  [BATTLE_ENVIRONMENT_LONG_GRASS]:  'long_grass',
  [BATTLE_ENVIRONMENT_SAND]:        'sand',
  [BATTLE_ENVIRONMENT_UNDERWATER]:  'underwater',
  [BATTLE_ENVIRONMENT_WATER]:       'water',
  [BATTLE_ENVIRONMENT_POND]:        'pond_water',
  [BATTLE_ENVIRONMENT_MOUNTAIN]:    'rock',
  [BATTLE_ENVIRONMENT_CAVE]:        'cave',
  [BATTLE_ENVIRONMENT_BUILDING]:    'building',
  [BATTLE_ENVIRONMENT_PLAIN]:       'building',  // PLAIN utilise tileset Building avec palette différente
};

/** Cache loaded assets per terrain pour éviter re-fetch. */
interface TerrainAssets {
  tiles: Uint8Array;       // raw 4bpp tile data (= tiles.png decoded)
  tilemap: Uint16Array;    // u16 tilemap entries (= map.bin)
  palette: Uint16Array;    // RGB15 u16, 48 colors (= 3 sub-palettes)
}
const _terrainCache: Map<string, TerrainAssets> = new Map();

interface TextboxAssets {
  tiles: Uint8Array;       // textbox.png tile data
  tilemap: Uint16Array;    // textbox_map.bin
  palette0: Uint16Array;   // textbox_0.pal (= 16 colors)
  palette1: Uint16Array;   // textbox_1.pal (= 16 colors)
}
let _textboxAssets: TextboxAssets | null = null;

/** Couleur de backdrop du MENU de combat (#484050) = BG palette[0] posée par
 *  loadBattleTextbox. Stockée pour que l'anim d'entrée puisse mettre le backdrop
 *  NOIR pendant les bandes (l'user A/B ROM : hors-bandes = NOIR) puis le restaurer
 *  pour le menu. Voir [[battle-transitions-chantier-2026-06-04]]. */
let _menuBackdropRgb15 = 0;
export function getMenuBackdropRgb15(): number { return _menuBackdropRgb15; }

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp palette format JSON `tall_grass/palette.json` → RGB15 u16 array.
 *  Format : `{"colors":[[r,g,b],...]}` 48 entries (= 3 palettes 16-color). */
async function _loadTerrainPaletteJson(url: string): Promise<Uint16Array> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`palette fetch failed: ${url} → ${resp.status}`);
  const data = await resp.json() as { colors: [number, number, number][] };
  const out = new Uint16Array(data.colors.length);
  for (let i = 0; i < data.colors.length; i++) {
    const [r, g, b] = data.colors[i];
    out[i] = rgba8ToRgb15(r, g, b);
  }
  return out;
}

/** Load assets pour un terrain (= 1:1 décomp BattleBackground struct). */
async function loadBattleTerrainAssets(env: number): Promise<TerrainAssets> {
  const dir = ENV_TO_DIR[env];
  if (!dir) throw new Error(`unknown battle environment ${env}`);
  // 1:1 décomp sBattleEnvironmentTable[PLAIN] (battle_bg.c:685-692) : PLAIN partage
  // le tileset/tilemap 'building' MAIS utilise la palette `gBattleEnvironmentPalette_Plain`
  // (≠ `_Building`). Sans ce split, PLAIN chargeait la palette Building (beige/intérieur)
  // → BG combat "desert" alors que la palette Plain colore le tileset Building en
  // champ herbeux vert (= le vrai fond des combats de route, env 9).
  const paletteDir = (env === BATTLE_ENVIRONMENT_PLAIN) ? 'plain' : dir;
  const cacheKey = `${dir}|${paletteDir}`;
  if (_terrainCache.has(cacheKey)) return _terrainCache.get(cacheKey)!;
  const base = `/decomp/em/battle_terrains/${dir}`;
  // Use le helper spécialisé qui supporte 3 sub-palettes (= 48 colors total).
  // `loadTileBin` 4bpp ne supporterait que 16 colors → mapping wrong pour
  // sub-pal 1/2.
  const [tiles, tilemap, palette] = await Promise.all([
    _loadBattleTerrainTiles(`${base}/tiles.png`),
    loadTilemapBin(`${base}/map.bin`),
    _loadTerrainPaletteJson(`/decomp/em/battle_terrains/${paletteDir}/palette.json`),
  ]);
  const assets: TerrainAssets = { tiles, tilemap, palette };
  _terrainCache.set(cacheKey, assets);
  return assets;
}

/** Load textbox assets (= 1:1 décomp LoadBattleTextboxAndBackground ll. 859-867). */
async function loadBattleTextboxAssets(): Promise<TextboxAssets> {
  if (_textboxAssets) return _textboxAssets;
  const base = '/decomp/em/battle_interface';
  const [tiles, tilemap, palette0, palette1] = await Promise.all([
    loadTileBin(`${base}/textbox.png`, 4),
    loadTilemapBin(`${base}/textbox_map.bin`),
    loadGbaPal(`${base}/textbox_0.pal`),
    loadGbaPal(`${base}/textbox_1.pal`),
  ]);
  _textboxAssets = { tiles, tilemap, palette0, palette1 };
  return _textboxAssets;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Configure UNIQUEMENT BG3 (= terrain). BG0 reste avec sa config overworld
 *  (= utilisée par AddWindow framework pour dialog + menus). Reconfigure BG0
 *  briserait le AddWindow framework qui dépend du charBase/mapBase set par
 *  l'overworld.
 *
 *  Sub-phase ultérieure : refactor du AddWindow framework pour cohabiter avec
 *  le tilemap baseline textbox 1:1 décomp à mapBase=24.
 *
 *  1:1 décomp `gBattleBgTemplates[3]` : charBase=2, mapBase=26, screenSize=1,
 *  priority=3 (= arrière-plan derrière sprites + BG0 windows). */
export function configureBattleBgs(): void {
  const rt = getRuntime();
  if (!rt) return;

  // BG0 : textbox/windows. 1:1 décomp `gBattleBgTemplates[0]` charBaseIndex=0.
  // CRITIQUE : l'overworld laisse BG0 charBaseIndex=2 (= 0x8000). Les windows
  // battle (move menu) ont des baseBlock élevés (0x290-0x330) ; copyPixelBufferToVram
  // écrit le tile data à bg(0).vram[baseBlock*32]. À char base 2, baseBlock 0x290
  // → 0x8000 + 0x5200 = 0xD200 = la région TILEMAP de BG3 (map base 26 = 0xD000) →
  // écrase le terrain = carrés noirs pendant le menu move. Le décomp évite ça avec
  // BG0 char base 0 (= les tiles windows vont en 0x0000+, région char base 0/1 que
  // BG1/2 cachés n'utilisent pas pendant le combat). On force la valeur 1:1 décomp.
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = 0;

  // BG3 : terrain background.
  const bg3c = rt.gba.bg(3).config;
  bg3c.charBaseIndex = 2; bg3c.mapBaseIndex = 26; bg3c.screenSize = 1;
  bg3c.paletteMode = 0; bg3c.priority = 3; bg3c.visible = true;
  bg3c.hofs = 0; bg3c.vofs = 0;
}

/** 1:1 décomp `LoadBattleTextboxAndBackground` (ll. 859-867) — partie textbox.
 *  1:1 décomp : load sur BG0 (= charBase=0, mapBase=24) avec palette slots 0+1.
 *  Les AddWindow écrivent DESSUS (= overwrite tile entries pour MSG/ACTION/MOVE
 *  zones), c'est le pattern exact du décomp. */
export async function loadBattleTextbox(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const assets = await loadBattleTextboxAssets();
  // BG0 charBase=0 → VRAM byte offset 0.
  // 1:1 décomp ll. 861 : LZDecompressVram(gBattleTextboxTiles, BG_CHAR_ADDR(0)).
  rt.gba.vram.set(assets.tiles, 0);
  // BG0 mapBase=24 → VRAM byte offset 24*0x800 = 0xC000.
  // 1:1 décomp ll. 862-863 : CopyToBgTilemapBuffer(0, gBattleTextboxTilemap, 0, 0)
  // + CopyBgTilemapBufferToVram(0).
  const mapBytes = new Uint8Array(assets.tilemap.buffer, assets.tilemap.byteOffset, assets.tilemap.byteLength);
  rt.gba.vram.set(mapBytes, 24 * 0x800);
  // 1:1 décomp ll. 864 : LoadCompressedPalette(gBattleTextboxPalette, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP).
  // → palettes slot 0 + 1 (= 32 entries 0..31).
  LoadPalette(assets.palette0, 0, 32);
  LoadPalette(assets.palette1, 16, 32);
  // 1:1 décomp : `LoadBattleTextboxAndBackground` (battle_bg.c:864) charge la palette
  // textbox SANS toucher le backdrop → BG palette[0][0] = couleur 0 de gBattleTextboxPalette
  // = NOIR. On NE l'écrase PLUS avec #484050 ICI (ancien hack non-1:1 qui colorait les
  // bandes de l'ouverture WIN0 en violet au lieu de noir — confirmé A/B user 2026-06-07).
  // #484050 (fond du panneau menu, textbox idx 9) est exposé via getMenuBackdropRgb15() et
  // appliqué à la FIN de la slide d'intro (battle-intro.ts BattleIntroSlideEnd, V + L),
  // quand le menu apparaît — pas avant. Le backdrop reste noir pendant l'ouverture.
  // (Dette 1:1 séparée : le panneau menu devrait venir du window fill, pas du backdrop.)
  _menuBackdropRgb15 = assets.palette0[9];
}

/** 1:1 décomp `DrawMainBattleBackground` partie default (ll. 807-814) — charge
 *  les assets terrain selon `BattleEnvironment` enum.
 *
 *  1:1 décomp : terrain est rendered par BG3 (= charBase=2, mapBase=26 selon
 *  `gBattleBgTemplates[3]`). Le décomp écrit à `BG_CHAR_ADDR(2)` (= byte
 *  2*0x4000=0x8000) + `BG_SCREEN_ADDR(26)` (= byte 26*0x800=0xD000). Palettes
 *  slots 2-4 (= 48 entries, 3 sub-palettes). */
export async function loadBattleTerrain(env: number): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const assets = await loadBattleTerrainAssets(env);
  // BG3 charBase=2 → VRAM byte offset 2*0x4000 = 0x8000.
  // 1:1 décomp ll. 811 : LZDecompressVram(tiles, BG_CHAR_ADDR(2)).
  rt.gba.vram.set(assets.tiles, 0x8000);
  // BG3 mapBase=26 → VRAM byte offset 26*0x800 = 0xD000.
  // 1:1 décomp ll. 812 : LZDecompressVram(tilemap, BG_SCREEN_ADDR(26)).
  const mapBytes = new Uint8Array(assets.tilemap.buffer, assets.tilemap.byteOffset, assets.tilemap.byteLength);
  rt.gba.vram.set(mapBytes, 26 * 0x800);
  // 1:1 décomp ll. 813 : LoadCompressedPalette(palette, BG_PLTT_ID(2), 3 * PLTT_SIZE_4BPP).
  // BG_PLTT_ID(2) = 32 (= entry offset). 3 * PLTT_SIZE_4BPP = 96 bytes = 48 entries.
  LoadPalette(assets.palette, 32, 96);
}

/** 1:1 décomp `DrawMainBattleBackground` full (ll. 760-857) — orchestration
 *  override logic selon battleTypeFlags, trainerClass, mapBattleScene.
 *
 *  Pour MVP : on supporte juste l'env défaut (= sBattleEnvironmentTable lookup).
 *  Les overrides spécial (GROUDON/KYOGRE/RAYQUAZA/LEADER/CHAMPION/MAP_SCENE_*)
 *  seront ajoutés dans sub-phases B4/B5/B6 selon roadmap. */
export async function drawMainBattleBackground(env: number = BATTLE_ENVIRONMENT_GRASS): Promise<void> {
  console.info(`[battle-bg] drawMainBattleBackground env=${env} dir=${ENV_TO_DIR[env]}`);
  await loadBattleTerrain(env);
}

/** 1:1 décomp `DrawBattleEntryBackground` (battle_bg.c:760) — cas wild/herbe
 *  (`MAP_BATTLE_SCENE_NORMAL`, ll. 833-836) :
 *  ```c
 *  LZDecompressVram(sBattleEnvironmentTable[env].entryTileset, BG_CHAR_ADDR(1));
 *  LZDecompressVram(sBattleEnvironmentTable[env].entryTilemap, BG_SCREEN_ADDR(28));
 *  ```
 *  = charge l'**entry background strié** (anim_tiles/anim_map) dans BG1
 *  (charBase 1 = VRAM 0x4000, screenBase 28 = VRAM 0xE000). C'est le « fond à
 *  lignes » qui scrolle pendant l'intro (`BattleIntroSlide1` : `gBattle_BG1_X +=
 *  6`/frame). Réutilise la palette terrain (slot 2, déjà chargée par
 *  `loadBattleTerrain` — DrawBattleEntryBackground ne charge PAS de palette).
 *  BG1 n'est pas utilisé par le combat en voie L → on le configure ici (priority 0
 *  = devant le terrain) puis on le cache en fin de slide (`hideBattleEntryBackground`,
 *  = 1:1 `BattleIntroSlide1` case 3 fin : CpuFill32(0, BG_SCREEN_ADDR(28))). */
export async function drawBattleEntryBackground(env: number = BATTLE_ENVIRONMENT_GRASS): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const dir = ENV_TO_DIR[env];
  if (!dir) return;
  console.info(`[battle-bg] drawBattleEntryBackground env=${env} dir=${dir}`);
  const base = `/decomp/em/battle_environment/${dir}`;
  // anim_tiles.png = entryTileset (même format 4bpp 48-color que le terrain) ;
  // anim_map.bin = entryTilemap (u16 entries).
  const [tiles, tilemap] = await Promise.all([
    _loadBattleTerrainTiles(`${base}/anim_tiles.png`),
    loadTilemapBin(`${base}/anim_map.bin`),
  ]);
  // BG1 charBase 1 → VRAM 0x4000 (région inutilisée par le combat).
  rt.gba.vram.set(tiles, 0x4000);
  // BG1 screenBase 28 → VRAM 28*0x800 = 0xE000.
  const mapBytes = new Uint8Array(tilemap.buffer, tilemap.byteOffset, tilemap.byteLength);
  rt.gba.vram.set(mapBytes, 28 * 0x800);
  // Configure BG1 = entry bg, devant le terrain (priority 0), visible. Le tilemap
  // 32×32 (256×256) wrap mod 256 → le scroll BG1_X défile en boucle.
  const bg1c = rt.gba.bg(1).config;
  // 1:1 décomp `gBattleBgTemplates[1]` (battle_bg.c:134-142) : screenSize=2 (= 256×512,
  // 2 blocks verticaux). L'anim_map.bin (1024 entrées = block 0 = haut 256) remplit le
  // block 0 ; le block 1 (tileY≥32) = tile 0 transparent (VRAM 0 / hors tilemap) → montre
  // le terrain dessous. Le scroll BG1_Y (jusqu'à -56) décale le contenu dans la fente.
  bg1c.charBaseIndex = 1; bg1c.mapBaseIndex = 28; bg1c.screenSize = 2;
  bg1c.paletteMode = 0; bg1c.priority = 0; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
}

/** Cache la couche entry bg (BG1). 1:1 `BattleIntroSlide1` case 3 fin (battle_intro.c:226 :
 *  `CpuFill32(0, BG_SCREEN_ADDR(28), ...)` + reconfig BG1/2). En voie L, BG1 n'est pas
 *  réutilisé par le combat → on le cache simplement (le terrain BG3 + sprites restent). */
export function hideBattleEntryBackground(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.bg(1).config.visible = false;
}

/** 1:1 décomp `LoadBattleTextboxAndBackground` (ll. 859-867) full orchestration :
 *  textbox + main background dans le bon ordre. */
/** 1:1 décomp `LoadUserWindowBorderGfx(windowId, 0x214, BG_PLTT_ID(14))` qui
 *  charge le frame beige standard 9 tiles 4bpp (= gTextWindowFrame1_Gfx + Pal).
 *
 *  Décomp source : text_window.c:110-113 + 104-108 :
 *  ```c
 *  void LoadUserWindowBorderGfx(u8 windowId, u16 destOffset, u8 palOffset) {
 *      LoadWindowGfx(windowId, gSaveBlock2Ptr->optionsWindowFrameType, destOffset, palOffset);
 *  }
 *  void LoadWindowGfx(u8 windowId, u8 frameId, u16 destOffset, u8 palOffset) {
 *      LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG),
 *                  sWindowFrames[frameId].tiles, 0x120, destOffset);
 *      LoadPalette(sWindowFrames[frameId].pal, palOffset, PLTT_SIZE_4BPP);
 *  }
 *  ```
 *
 *  - sWindowFrames[0] = {gTextWindowFrame1_Gfx, gTextWindowFrame1_Pal}
 *  - 0x120 bytes = 288 bytes = 9 tiles 4bpp (= 3x3 grid 24x24px)
 *  - PNG asset : `/decomp/em/ui/text_window/1.png` (24x24, PLTE 16 colors)
 *
 *  Nos windows existantes utilisent baseTileNum=0x214 et paletteNum=14 →
 *  on charge tile data à VRAM byte 0x214*32=0x4280 + palette à entry 14*16=224. */
export async function loadBattleStdFrame(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp `LoadBattleMenuWindowGfx` → `LoadUserWindowBorderGfx(2, 0x12, BG_PLTT_ID(1))`
  // + `(.., 0x22, ..)` → `LoadWindowGfx(2, gSaveBlock2Ptr->optionsWindowFrameType, …)`.
  // Le frame n'est PAS hardcodé : il dépend du choix user (OPTIONS > FENETRE TYPE N).
  // sWindowFrames[type] = `(type+1).png` (type 0 = 1.png simple ; type 2 = 3.png ; etc).
  // Les boxes menu/move du graphisme textbox référencent tiles 0x12/0x22 (paletteNum=1)
  // pour leur bordure → c'est CE frame qui s'affiche. Défaut new-game = type 0 (simple).
  const frameType = ((gSaveBlock2Ptr.optionsWindowFrameType ?? 0) % 20 + 20) % 20;
  const png = await loadIndexedPngStrict(`/decomp/em/ui/text_window/${frameType + 1}.png`, 4);
  // 1:1 LoadUserWindowBorderGfx(2, 0x12, BG_PLTT_ID(1)) + (2, 0x22, BG_PLTT_ID(1)).
  // Le cadre vit au CHARBLOCK 0 (sBattleBgTemplates : BG0/1/2 partagent
  // charBaseIndex 0 dans la ROM). bg(0).vram = vue VRAM au charblock 0.
  // Un consommateur sur BG1 (level-up box) doit poser BG1 charBase=0 (1:1
  // l'état décomp hors-anim) pour le lire — cf. battle-levelup-box.
  rt.gba.bg(0).vram.set(png.charData.subarray(0, 0x120), 0x12 * 32);
  rt.gba.bg(0).vram.set(png.charData.subarray(0, 0x120), 0x22 * 32);
  // 1:1 LoadPalette(sWindowFrames[type].pal, BG_PLTT_ID(1), 32) — slot 1.
  LoadPalette(png.palette, 1 * 16, 32);
}

export async function loadBattleTextboxAndBackground(env: number = BATTLE_ENVIRONMENT_GRASS): Promise<void> {
  // 1:1 décomp `LoadBattleTextboxAndBackground` battle_bg.c:859-867.
  const rt = getRuntime();
  if (!rt) return;

  // 1:1 décomp `CB2_InitBattleInternal` ll. 626 : `CpuFill32(0, VRAM, VRAM_SIZE)`.
  // Clear TOUTE la BG VRAM (= 96KB) pour supprimer les stale data overworld.
  // Sans ça, BG0 charBase 0 contient les overworld text tiles qui s'affichent
  // en motif orange/green/magenta squares dans la zone vide middle du battle.
  //
  // ATTENTION : ça wipe AUSSI les overworld assets. Heureusement on retourne
  // à overworld via le post-battle CB2_ReturnToFieldContinueScriptPlayMapMusic
  // qui re-load tous les assets via Overworld_LoadMapTilesetPalettes etc.
  // Cf. cleanup state du battle-flow.ts qui re-show les BGs.
  rt.gba.vram.fill(0);

  // 1:1 décomp `BattleInitBgsAndWindows` (battle_bg.c:731) → DeactivateAllTextPrinters().
  // CRITIQUE : sans ça, un printer texte résiduel de l'overworld (= window stale,
  // p.ex. dialog/HP) reste actif et RunTextPrinters le tick chaque frame → il
  // écrase les tiles des windows battle (prompt/menu) → garbling sur les lignes.
  DeactivateAllTextPrinters();

  configureBattleBgs();
  // RB1 : BG0 = 64-tall (screenSize=2) + mapBase=24, 1:1 `gBattleBgTemplates[0]`.
  // Le textbox graphic est un tilemap 32×64 (textbox_map.bin = 4096 bytes) :
  // MSG box @ rows 15-18 (visible @ scroll BG0_Y=0), ACTION @ 35-38 (scroll=160),
  // MOVE @ 55-58 (scroll=320). Le scroll gBattle_BG0_Y révèle le bon groupe au bas
  // de l'écran ; les windows B_WIN_* posent juste le texte dans ces boxes.
  const bg0 = rt.gba.bg(0).config;
  bg0.charBaseIndex = 0; bg0.mapBaseIndex = 24; bg0.screenSize = 2;
  bg0.priority = 0; bg0.visible = true; bg0.hofs = 0; bg0.vofs = 0;
  // 1:1 décomp ll. 861-864 : textbox tiles → BG_CHAR_ADDR(0), tilemap → mapBase 24,
  // palette → BG_PLTT_ID(0). Le tilemap 32×64 contient TOUTES les boxes du combat :
  //   - MSG box verte/bord rouge      @ rows 15-18 (scroll BG0_Y=0)
  //   - ACTION : box verte prompt (G) + box cadre custom menu (D) @ rows 35-38 (scroll=160)
  //   - MOVE : 4 boxes noms + PP + type @ rows 55-58 (scroll=320)
  // Les windows (B_WIN_*) posent le TEXTE dans ces boxes ; le scroll révèle le bon
  // groupe au même endroit écran (= bas). 1:1 décomp gBattle_BG0_Y.
  await loadBattleTextbox();
  // 1:1 LoadBattleMenuWindowGfx : cadre user (optionsWindowFrameType → (type+1).png)
  // → tiles 0x12/0x22 + palette slot 1. Les boxes menu/move du graphisme textbox
  // référencent ces tiles pour leur bordure. Défaut type 0 = simple.
  await loadBattleStdFrame();
  // Palette texte menu/move (= gBattleWindowTextPalette → BG_PLTT_ID(5), 1:1 décomp
  // LoadBattleMenuWindowGfx ll.407). Les windows ACTION_MENU/MOVE_* (paletteNum=5)
  // l'utilisent pour fg=DYN_4/bg=DYN_5/shadow=DYN_6.
  const textPal5 = await loadGbaPal(`${'/decomp/em/battle_interface'}/text.pal`);
  LoadPalette(textPal5, 5 * 16, 32);
  // 1:1 décomp gPPTextPalette (text_pp.pal) : préchargé pour
  // SetPpNumbersPaletteInMoveSelection (recolore slot 5 entries 11/12 selon PP).
  _gPPTextPalette = await loadGbaPal(`${'/decomp/em/battle_interface'}/text_pp.pal`);
  // BG3 terrain.
  await drawMainBattleBackground(env);
}

// ════════════════════════════════════════════════════════════════════════════
// PORT 1:1 STRICT — CB2_InitBattleInternal video (windowing battle complet)
// ════════════════════════════════════════════════════════════════════════════
// Ces fonctions remplacent à terme le chemin ad-hoc ci-dessus (configureBattleBgs
// BG3-only + loadBattleStdFrame hack). Elles suivent EXACTEMENT le décomp
// `src/battle_bg.c`. Wirées par battle-flow.ts (cf. battleInitVideo1to1).

/** 1:1 décomp `gBattleBgTemplates[]` (battle_bg.c:123-161).
 *  BG0 screenSize=2 (= 32×64 tiles) : c'est CE 64-tall qui permet le scroll
 *  gBattle_BG0_Y (MSG top=15 / ACTION top=35 / MOVE top=55). */
export const gBattleBgTemplates: BgTemplate[] = _autoBattleBgTemplates.map((t) => ({
  bg: t.bg, charBaseIndex: t.charBaseIndex, mapBaseIndex: t.mapBaseIndex,
  screenSize: t.screenSize, paletteMode: t.paletteMode, priority: t.priority,
  baseTile: t.baseTile,
}));

/** 1:1 décomp `BattleInitBgsAndWindows` (battle_bg.c:713-731) — NORMAL only
 *  (pas BATTLE_TYPE_ARENA). C'est ÇA qui remplace le windowing overworld par
 *  le windowing battle : InitWindows(getBattleWindowTemplates()) =
 *  FreeAllWindowBuffers + AddWindow chaque template → window ID == B_WIN_*. */
export function BattleInitBgsAndWindows(): void {
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, gBattleBgTemplates, gBattleBgTemplates.length);
  // gBattleScripting.windowsType = B_WIN_TYPE_NORMAL (combats wild/trainer).
  InitWindows(getBattleWindowTemplates());
  DeactivateAllTextPrinters();
}

/** 1:1 décomp `LoadBattleMenuWindowGfx` (battle_bg.c:744-758) — NORMAL only.
 *  ```c
 *  LoadUserWindowBorderGfx(2, 0x12, BG_PLTT_ID(1));
 *  LoadUserWindowBorderGfx(2, 0x22, BG_PLTT_ID(1));
 *  LoadCompressedPalette(gBattleWindowTextPalette, BG_PLTT_ID(5), PLTT_SIZE_4BPP);
 *  ```
 *  `LoadUserWindowBorderGfx(windowId, destOffset, palOffset)` (text_window.c:110)
 *  → `LoadWindowGfx(windowId, optionsWindowFrameType=0, destOffset, palOffset)`
 *  → `LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG), sWindowFrames[0].tiles,
 *     0x120, destOffset)` + `LoadPalette(sWindowFrames[0].pal, palOffset, 32)`.
 *  sWindowFrames[0] = {gTextWindowFrame1_Gfx, gTextWindowFrame1_Pal} =
 *  graphics/text_window/1.png (.4bpp = 9 tiles = 0x120 bytes, .gbapal = 16). */
export async function LoadBattleMenuWindowGfx(): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  const frame = await loadIndexedPngStrict('/decomp/em/ui/text_window/1.png', 4);
  // GetWindowAttribute(B_WIN_ACTION_MENU=2, WINDOW_BG) = bg 0 (template NORMAL).
  const bg = GetWindowAttribute(B_WIN_ACTION_MENU, WINDOW_BG);
  // LoadUserWindowBorderGfx(2, 0x12, BG_PLTT_ID(1)) — frame tiles → BG0 @ tile 0x12.
  LoadBgTiles(bg, frame.charData.subarray(0, 0x120), 0x120, 0x12);
  // LoadUserWindowBorderGfx(2, 0x22, BG_PLTT_ID(1)) — copie @ tile 0x22.
  LoadBgTiles(bg, frame.charData.subarray(0, 0x120), 0x120, 0x22);
  // LoadPalette(gTextWindowFrame1_Pal, BG_PLTT_ID(1)=16, PLTT_SIZE_4BPP=32).
  LoadPalette(frame.palette, 1 * 16, 32);
  // LoadCompressedPalette(gBattleWindowTextPalette = text.pal, BG_PLTT_ID(5)=80,
  // PLTT_SIZE_4BPP=32) — idx 15 = couleurs menu ACTION/MOVE (paletteNum=5).
  const textPal = await loadGbaPal('/decomp/em/battle_interface/text.pal');
  LoadPalette(textPal, 5 * 16, 32);
  // 1:1 décomp : `gPPTextPalette` (graphics/battle_interface/text_pp.pal) est une
  // const ROM TOUJOURS dispo, lue par SetPpNumbersPaletteInMoveSelection pour
  // recolorer dynamiquement la palette 5 entries 11/12 (fg/shadow des chiffres PP)
  // selon le ratio PP du move sous le curseur. On la matérialise ICI car c'est le
  // setup palette du menu de moves (text.pal juste au-dessus) et la VOIE L passe par
  // LoadBattleMenuWindowGfx. SANS ce préchargement, _gPPTextPalette restait null en
  // voie L → SetPpNumbersPaletteInMoveSelection no-op (early-return) → les PP gardaient
  // la couleur de base text.pal (shadow idx11=131,131,131 au lieu de la couleur d'état)
  // = "couleur des PP fausse" signalée par l'user. La voie V la charge déjà de son côté
  // (loadBattleTextboxAndBackground), donc pas de double-emploi conflictuel.
  _gPPTextPalette = await loadGbaPal('/decomp/em/battle_interface/text_pp.pal');
}

/** 1:1 décomp `LoadBattleTextboxAndBackground` (battle_bg.c:859-867) — strict.
 *  ```c
 *  LZDecompressVram(gBattleTextboxTiles, BG_CHAR_ADDR(0));
 *  CopyToBgTilemapBuffer(0, gBattleTextboxTilemap, 0, 0);
 *  CopyBgTilemapBufferToVram(0);
 *  LoadCompressedPalette(gBattleTextboxPalette, BG_PLTT_ID(0), 2*PLTT_SIZE_4BPP);
 *  LoadBattleMenuWindowGfx();
 *  DrawMainBattleBackground();
 *  ```
 *  `loadBattleTextbox()` fait déjà les 4 premières lignes (tiles BG_CHAR_ADDR(0)
 *  + tilemap BG0 + textbox_0/1.pal → slots 0/1). */
export async function loadBattleTextboxAndBackground1to1(
  env: number = BATTLE_ENVIRONMENT_GRASS,
): Promise<void> {
  _bgCopiesInFlight++;
  try {
    await loadBattleTextbox();
    await LoadBattleMenuWindowGfx();
    await drawMainBattleBackground(env);
  } finally {
    _bgCopiesInFlight--;
  }
}

// 1:1 décomp `IsDma3ManagerBusyWithBgCopy()` (dma3_manager.c) : TRUE tant que des
// copies BG sont en attente. Plateforme : nos « copies » = les chargements ASYNC
// tiles/tilemap/palettes du boot (fire-and-forget de CB2_InitBattleInternal) → la
// case 0 de CB2_HandleStartBattle (ShowBg ×4 + FillAroundBattleWindows) doit
// attendre, sinon le fill est écrasé par le tileset qui finit de se charger.
let _bgCopiesInFlight = 0;
export function IsDma3ManagerBusyWithBgCopy(): boolean { return _bgCopiesInFlight > 0; }

/** 1:1 décomp portion vidéo de `CB2_InitBattleInternal` (battle_main.c:619+) :
 *  `CpuFill32(0, VRAM, VRAM_SIZE)` → `InitBattleBgsVideo` (=
 *  `BattleInitBgsAndWindows`) → `LoadBattleTextboxAndBackground`.
 *  Ordre CRUCIAL : BattleInitBgsAndWindows AVANT LoadBattleTextboxAndBackground
 *  (LoadBattleMenuWindowGfx appelle GetWindowAttribute → windows doivent exister). */
export async function battleInitVideo1to1(
  env: number = BATTLE_ENVIRONMENT_GRASS,
): Promise<void> {
  const rt = getRuntime();
  if (!rt) return;
  rt.gba.vram.fill(0);              // CpuFill32(0, VRAM, VRAM_SIZE)
  BattleInitBgsAndWindows();        // InitBattleBgsVideo → BattleInitBgsAndWindows
  await loadBattleTextboxAndBackground1to1(env);
}

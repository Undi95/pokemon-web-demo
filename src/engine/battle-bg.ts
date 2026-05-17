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

import { getRuntime, LoadPalette } from './decomp-globals';
import { loadTilemapBin, loadTileBin, loadGbaPal, extractPngPlte } from './gba/png-loader';
import { rgba8ToRgb15 } from './gba/types';

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
  if (_terrainCache.has(dir)) return _terrainCache.get(dir)!;
  const base = `/decomp/em/battle_terrains/${dir}`;
  // Use le helper spécialisé qui supporte 3 sub-palettes (= 48 colors total).
  // `loadTileBin` 4bpp ne supporterait que 16 colors → mapping wrong pour
  // sub-pal 1/2.
  const [tiles, tilemap, palette] = await Promise.all([
    _loadBattleTerrainTiles(`${base}/tiles.png`),
    loadTilemapBin(`${base}/map.bin`),
    _loadTerrainPaletteJson(`${base}/palette.json`),
  ]);
  const assets: TerrainAssets = { tiles, tilemap, palette };
  _terrainCache.set(dir, assets);
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

/** Configure UNIQUEMENT BG3 (= terrain). On ne touche pas BG0 (= utilisé par
 *  AddWindow framework avec mapBaseIndex=0 default). Le textbox 1:1 décomp à
 *  mapBase=24 nécessiterait refactor du windowing → sub-phase ultérieure.
 *
 *  1:1 décomp `gBattleBgTemplates[3]` : charBase=2, mapBase=26, screenSize=1,
 *  priority=3 (= arrière-plan derrière sprites + BG0 windows). */
export function configureBattleBgs(): void {
  const rt = getRuntime();
  if (!rt) return;

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
  await loadBattleTerrain(env);
}

/** 1:1 décomp `LoadBattleTextboxAndBackground` (ll. 859-867) full orchestration :
 *  textbox + main background dans le bon ordre. */
export async function loadBattleTextboxAndBackground(env: number = BATTLE_ENVIRONMENT_GRASS): Promise<void> {
  // Refactor 1:1 décomp : BG3 = terrain, BG0 = textbox+windows.
  // Skip loadBattleTextbox() pour cette sub-phase — la palette textbox a
  // un setup spécifique (= utilise palette slot 0+1 + tile data au charBase=0)
  // qui conflit avec notre AddWindow framework qui occupe aussi BG0.
  // Le textbox sera wired dans sub-phase dédiée après refactor du window system.
  configureBattleBgs();
  // await loadBattleTextbox();
  await drawMainBattleBackground(env);
}

/**
 * tileset-anims.ts — 1:1 décomp `src/tileset_anims.c` (~1700L).
 *
 * Implémente le système d'animation de tiles du tileset overworld Émeraude :
 *   - Double buffer VRAM (= sTilesetDMA3TransferBuffer[20])
 *   - Compteurs primaire/secondaire (= sPrimaryTilesetAnimCounter/Max)
 *   - Callbacks par tileset (= TilesetAnim_General, TilesetAnim_Building + 18 stubs)
 *   - Flush VRAM au VBlank (= TransferTilesetAnimsBuffer)
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/tileset_anims.c
 *
 * Architecture 1:1 décomp :
 *   - InitTilesetAnimations()    : Reset buffer + Init primary + secondary
 *   - UpdateTilesetAnimations()  : Per-frame tick counter + dispatch callback
 *   - TransferTilesetAnimsBuffer(rt) : Flush DMA buffer → VRAM (au VBlank)
 *   - appendTilesetAnimToBuffer() : Helper interne pour queuer un write VRAM
 *
 * Mapping tileset name → callback (= 1:1 décomp tileset struct .callback field) :
 *   Primary :
 *     "general"   → InitTilesetAnim_General  → TilesetAnim_General
 *     "building"  → InitTilesetAnim_Building → TilesetAnim_Building
 *   Secondary :
 *     "petalburg" → InitTilesetAnim_Petalburg  (callback=null)
 *     "rustboro"  → InitTilesetAnim_Rustboro   (stub TODO Phase 4.7+)
 *     "dewford"   → InitTilesetAnim_Dewford    (stub)
 *     "slateport" → InitTilesetAnim_Slateport  (stub)
 *     "mauville"  → InitTilesetAnim_Mauville   (stub)
 *     "lavaridge" → InitTilesetAnim_Lavaridge  (stub)
 *     "fallarbor" → InitTilesetAnim_Fallarbor  (callback=null)
 *     "fortree"   → InitTilesetAnim_Fortree    (callback=null)
 *     "lilycove"  → InitTilesetAnim_Lilycove   (callback=null)
 *     "mossdeep"  → InitTilesetAnim_Mossdeep   (callback=null)
 *     "ever_grande" → InitTilesetAnim_EverGrande (stub)
 *     "pacifidlog"  → InitTilesetAnim_Pacifidlog (stub)
 *     "sootopolis"  → InitTilesetAnim_Sootopolis (stub)
 *     "battle_frontier_outside_west" → InitTilesetAnim_BattleFrontierOutsideWest (stub)
 *     "battle_frontier_outside_east" → InitTilesetAnim_BattleFrontierOutsideEast (stub)
 *     "underwater"     → InitTilesetAnim_Underwater   (stub)
 *     "sootopolis_gym" → InitTilesetAnim_SootopolisGym (stub)
 *     "cave"           → InitTilesetAnim_Cave          (stub)
 *     "elite_four"     → InitTilesetAnim_EliteFour     (stub)
 *     "mauville_gym"   → InitTilesetAnim_MauvilleGym   (stub)
 *     "bike_shop"      → InitTilesetAnim_BikeShop       (stub)
 *     "battle_pyramid" → InitTilesetAnim_BattlePyramid  (stub)
 *     "battle_dome"    → InitTilesetAnim_BattleDome     (stub)
 *
 * Wire dans TestOverworldScene.ts MainCB2_Overworld :
 *   UpdateTilesetAnimations();
 *   TransferTilesetAnimsBuffer(rt);
 *
 * Wire dans loadAndInitMap (après CopyMapTilesetsToVram) :
 *   InitTilesetAnimations();
 */

import { loadTileBin } from './gba/png-loader';
import type { DecompRuntime } from './decomp-runtime';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

/** TILE_OFFSET_4BPP(N) = N * 32 bytes dans BG_VRAM.
 *  1:1 décomp `include/fieldmap.h:TILE_OFFSET_4BPP(n) ((n) * 32)`. */
export const TILE_OFFSET_4BPP = (n: number): number => n * 32;

/** TILE_SIZE_4BPP = 32 bytes par tile (4bpp 8×8).
 *  1:1 décomp `include/fieldmap.h:TILE_SIZE_4BPP 32`. */
export const TILE_SIZE_4BPP = 32;

/** NUM_TILES_IN_PRIMARY = 512.
 *  1:1 décomp `include/fieldmap.h:NUM_TILES_IN_PRIMARY`. */
const NUM_TILES_IN_PRIMARY = 512;

/** DMA transfer buffer max entries = 20. 1:1 décomp. */
const TILESET_DMA3_TRANSFER_BUFFER_MAX = 20;

// ─── Module-level state 1:1 décomp EWRAM ─────────────────────────────────────

/** 1:1 décomp `sTilesetDMA3TransferBuffer[20]` — entrée du buffer. */
interface DmaEntry {
  src: Uint8Array;
  destByteOffset: number;  // byte offset dans gba.vram (= BG_VRAM base)
  sizeBytes: number;
}

/** Buffer circulaire de writes VRAM différés (= flushed au VBlank). */
const sTilesetDMA3TransferBuffer: DmaEntry[] = [];

/** Nb d'entrées actives dans le buffer. 1:1 décomp `sTilesetDMA3TransferBufferSize`. */
let sTilesetDMA3TransferBufferSize = 0;

/** Compteur primaire (0..Max-1). 1:1 décomp `sPrimaryTilesetAnimCounter`. */
let sPrimaryTilesetAnimCounter = 0;
/** Max du compteur primaire. 1:1 décomp `sPrimaryTilesetAnimCounterMax`. */
let sPrimaryTilesetAnimCounterMax = 0;

/** Compteur secondaire (0..Max-1). 1:1 décomp `sSecondaryTilesetAnimCounter`. */
let sSecondaryTilesetAnimCounter = 0;
/** Max du compteur secondaire. 1:1 décomp `sSecondaryTilesetAnimCounterMax`. */
let sSecondaryTilesetAnimCounterMax = 0;

/** Callback actif tileset primaire. 1:1 décomp `sPrimaryTilesetAnimCallback`. */
let sPrimaryTilesetAnimCallback: ((timer: number) => void) | null = null;
/** Callback actif tileset secondaire. 1:1 décomp `sSecondaryTilesetAnimCallback`. */
let sSecondaryTilesetAnimCallback: ((timer: number) => void) | null = null;

// ─── Tileset init callbacks state ────────────────────────────────────────────

/** Callback d'init du tileset primaire courant (= setté lors du map load,
 *  appelé par _InitPrimaryTilesetAnimation). 1:1 décomp `tileset->callback`. */
let gPrimaryTilesetInitCallback: (() => void) | null = null;
/** Callback d'init du tileset secondaire courant. */
let gSecondaryTilesetInitCallback: (() => void) | null = null;

// ─── Asset cache (tiles data 4bpp binaires) ───────────────────────────────────

/** Cache URL → Uint8Array des fichiers .4bpp.bin.
 *  Evite les fetches répétés à chaque frame (= assets loadés une fois au boot). */
const sTileCache = new Map<string, Uint8Array>();

/** Précharge les tiles d'animation et les met en cache.
 *  Appelé en début de InitTilesetAnim_General/Building pour préwarmer le cache.
 *  Async void — les frames seront disponibles au prochain tick. */
async function preloadTiles(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map(async (url) => {
      if (!sTileCache.has(url)) {
        try {
          const data = await loadTileBin(url, 4);
          sTileCache.set(url, data);
        } catch (e) {
          console.warn(`[tileset-anims] preload failed: ${url}`, e);
        }
      }
    }),
  );
}

/** Retourne les tile data depuis le cache, ou null si pas encore chargé.
 *  Synchrone — les tiles doivent avoir été préchargés au boot. */
function getTiles(url: string): Uint8Array | null {
  return sTileCache.get(url) ?? null;
}

// ─── Asset URLs ───────────────────────────────────────────────────────────────

const BASE_PRIMARY = '/decomp/em/tilesets/primary';
const BASE_SECONDARY = '/decomp/em/tilesets/secondary';

/** URLs des frames d'animation du tileset General.
 *  1:1 décomp `data/tilesets/primary/general/anim/*`. */
const GENERAL_URLS = {
  flower: [0, 1, 2].map(i => `${BASE_PRIMARY}/general/anim/flower/${i}.png`),
  water:  [0,1,2,3,4,5,6,7].map(i => `${BASE_PRIMARY}/general/anim/water/${i}.png`),
  sand_water_edge: [0,1,2,3,4,5,6].map(i => `${BASE_PRIMARY}/general/anim/sand_water_edge/${i}.png`),
  waterfall:       [0,1,2,3].map(i => `${BASE_PRIMARY}/general/anim/waterfall/${i}.png`),
  land_water_edge: [0,1,2,3].map(i => `${BASE_PRIMARY}/general/anim/land_water_edge/${i}.png`),
};

/** Séquence flower : [frame0, frame1, frame0, frame2] = 1:1 décomp `gTilesetAnims_General_Flower[]`. */
const FLOWER_FRAME_SEQ = [0, 1, 0, 2];

/** SandWaterEdge frames : 8 entrées avec frame6 répété à la fin.
 *  1:1 décomp `gTilesetAnims_General_SandWaterEdge[] = {0,1,2,3,4,5,6,0}`. */
const SAND_WATER_EDGE_FRAME_SEQ = [0, 1, 2, 3, 4, 5, 6, 0];

/** URLs des frames d'animation du tileset Building.
 *  Note : building est un PRIMARY tileset (pas secondary). */
const BUILDING_URLS = {
  tv_turned_on: [0, 1].map(i => `${BASE_PRIMARY}/building/anim/tv_turned_on/${i}.png`),
};

// ─── SECONDARY_URLS — 1:1 décomp asset paths ─────────────────────────────────
// Mapping nom_tileset → sub-anim → frame URLs. Toutes les URLs pointent vers
// les .4bpp.bin extraits dans /public/decomp/em/tilesets/secondary/<name>/anim/.

const SECONDARY_URLS = {
  rustboro: {
    windy_water: [0,1,2,3,4,5,6,7].map(i => `${BASE_SECONDARY}/rustboro/anim/windy_water/${i}.png`),
    fountain:    [0,1].map(i => `${BASE_SECONDARY}/rustboro/anim/fountain/${i}.png`),
  },
  dewford: {
    flag: [0,1,2,3].map(i => `${BASE_SECONDARY}/dewford/anim/flag/${i}.png`),
  },
  slateport: {
    balloons: [0,1,2,3].map(i => `${BASE_SECONDARY}/slateport/anim/balloons/${i}.png`),
  },
  mauville: {
    flower_1: [0,1,2,3,4].map(i => `${BASE_SECONDARY}/mauville/anim/flower_1/${i}.png`),
    flower_2: [0,1,2,3,4].map(i => `${BASE_SECONDARY}/mauville/anim/flower_2/${i}.png`),
  },
  lavaridge: {
    steam: [0,1,2,3].map(i => `${BASE_SECONDARY}/lavaridge/anim/steam/${i}.png`),
    // Note : lava partagé avec cave (= 1:1 décomp `gTilesetAnims_Lavaridge_Cave_Lava`).
  },
  cave: {
    lava: [0,1,2,3].map(i => `${BASE_SECONDARY}/cave/anim/lava/${i}.png`),
  },
  ever_grande: {
    flowers: [0,1,2,3,4,5,6,7].map(i => `${BASE_SECONDARY}/ever_grande/anim/flowers/${i}.png`),
  },
  pacifidlog: {
    log_bridges:    [0,1,2].map(i => `${BASE_SECONDARY}/pacifidlog/anim/log_bridges/${i}.png`),
    water_currents: [0,1,2,3,4,5,6,7].map(i => `${BASE_SECONDARY}/pacifidlog/anim/water_currents/${i}.png`),
  },
  sootopolis: {
    // 1:1 décomp INCBIN_U16 : chaque frame = kyogre + groudon concat (= 96 tiles).
    // Format URL synthétique 'kyogre|groudon' pour preloadTiles, split à la queue.
    stormy_water_kyogre:  [0,1,2,3,4,5,6,7].map(i => `${BASE_SECONDARY}/sootopolis/anim/stormy_water/${i}_kyogre.png`),
    stormy_water_groudon: [0,1,2,3,4,5,6,7].map(i => `${BASE_SECONDARY}/sootopolis/anim/stormy_water/${i}_groudon.png`),
  },
  battle_frontier_outside_west: {
    flag: [0,1,2,3].map(i => `${BASE_SECONDARY}/battle_frontier_outside_west/anim/flag/${i}.png`),
  },
  battle_frontier_outside_east: {
    flag: [0,1,2,3].map(i => `${BASE_SECONDARY}/battle_frontier_outside_east/anim/flag/${i}.png`),
  },
  underwater: {
    seaweed: [0,1,2,3].map(i => `${BASE_SECONDARY}/underwater/anim/seaweed/${i}.png`),
  },
  sootopolis_gym: {
    side_waterfall:  [0,1,2].map(i => `${BASE_SECONDARY}/sootopolis_gym/anim/side_waterfall/${i}.png`),
    front_waterfall: [0,1,2].map(i => `${BASE_SECONDARY}/sootopolis_gym/anim/front_waterfall/${i}.png`),
  },
  elite_four: {
    floor_light: [0,1].map(i => `${BASE_SECONDARY}/elite_four/anim/floor_light/${i}.png`),
    wall_lights: [0,1,2,3].map(i => `${BASE_SECONDARY}/elite_four/anim/wall_lights/${i}.png`),
  },
  mauville_gym: {
    electric_gates: [0,1].map(i => `${BASE_SECONDARY}/mauville_gym/anim/electric_gates/${i}.png`),
  },
  bike_shop: {
    blinking_lights: [0,1].map(i => `${BASE_SECONDARY}/bike_shop/anim/blinking_lights/${i}.png`),
  },
  battle_pyramid: {
    torch:         [0,1,2].map(i => `${BASE_SECONDARY}/battle_pyramid/anim/torch/${i}.png`),
    statue_shadow: [0,1,2].map(i => `${BASE_SECONDARY}/battle_pyramid/anim/statue_shadow/${i}.png`),
  },
};

// ─── Frame sequences (= 1:1 décomp const-array shuffled frame ordering) ──────

/** 1:1 décomp `gTilesetAnims_Mauville_Flower1[]` (= 12 entries cycle). */
const MAUVILLE_FLOWER_SEQ = [0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 2, 1];

/** 1:1 décomp `gTilesetAnims_Mauville_Flower1_B[]` (= 4 entries cycle, fallback). */
const MAUVILLE_FLOWER_B_SEQ = [0, 0, 4, 4];

/** 1:1 décomp `gTilesetAnims_Pacifidlog_LogBridges[]` (= 4 entries from 3 frames). */
const PACIFIDLOG_LOG_BRIDGES_SEQ = [0, 1, 2, 1];

// ─── VDESTS — 1:1 décomp arrays of dest tile offsets pour multi-cell anims ───

/** 1:1 décomp `gTilesetAnims_Rustboro_WindyWater_VDests[8]`.
 *  Dest byte offsets dans BG_VRAM (= TILE_OFFSET_4BPP). */
const RUSTBORO_WINDY_WATER_VDESTS = [128, 132, 136, 140, 144, 148, 152, 156]
  .map(off => TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + off));

/** 1:1 décomp `gTilesetAnims_Mauville_Flower1_VDests[8]`. */
const MAUVILLE_FLOWER1_VDESTS = [96, 100, 104, 108, 112, 116, 120, 124]
  .map(off => TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + off));

/** 1:1 décomp `gTilesetAnims_Mauville_Flower2_VDests[8]`. */
const MAUVILLE_FLOWER2_VDESTS = [128, 132, 136, 140, 144, 148, 152, 156]
  .map(off => TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + off));

/** 1:1 décomp `gTilesetAnims_EverGrande_VDests[8]`. */
const EVER_GRANDE_VDESTS = [224, 228, 232, 236, 240, 244, 248, 252]
  .map(off => TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + off));

// ─── Public init API ──────────────────────────────────────────────────────────

/** Set le callback d'init du tileset primaire selon son nom.
 *  Appelé par le map-loader lors du chargement d'un tileset.
 *  1:1 décomp : le tileset struct a un `callback` function pointer. */
export function setPrimaryTilesetAnimCallback(tilesetName: string): void {
  const cb = PRIMARY_INIT_MAP[tilesetName] ?? null;
  gPrimaryTilesetInitCallback = cb;
}

/** Set le callback d'init du tileset secondaire selon son nom. */
export function setSecondaryTilesetAnimCallback(tilesetName: string): void {
  const cb = SECONDARY_INIT_MAP[tilesetName] ?? null;
  gSecondaryTilesetInitCallback = cb;
}

// ─── Core public API 1:1 décomp ───────────────────────────────────────────────

/** Réinitialise le buffer de transfert VRAM.
 *  1:1 décomp `ResetTilesetAnimBuffer`. */
function resetTilesetAnimBuffer(): void {
  sTilesetDMA3TransferBufferSize = 0;
  // Pas besoin de clear les entries elles-mêmes (= overwritten avant use).
}

/** 1:1 décomp `InitTilesetAnimations(void)`.
 *  Reset buffer + init primary + secondary.
 *  Appelé au map load (après CopyMapTilesetsToVram). */
export function InitTilesetAnimations(): void {
  resetTilesetAnimBuffer();
  _initPrimaryTilesetAnimation();
  _initSecondaryTilesetAnimation();
}

/** 1:1 décomp `InitSecondaryTilesetAnimation(void)`.
 *  Re-init seulement le secondaire (ex: after indoor/outdoor transition). */
export function InitSecondaryTilesetAnimation(): void {
  _initSecondaryTilesetAnimation();
}

/** 1:1 décomp `UpdateTilesetAnimations(void)`.
 *  Per-frame : reset buffer + tick compteurs + dispatch callbacks.
 *  Appelé dans MainCB2_Overworld à chaque frame. */
export function UpdateTilesetAnimations(): void {
  resetTilesetAnimBuffer();

  // 1:1 décomp : increment + wrap à Max.
  if (sPrimaryTilesetAnimCounterMax > 0) {
    if (++sPrimaryTilesetAnimCounter >= sPrimaryTilesetAnimCounterMax) {
      sPrimaryTilesetAnimCounter = 0;
    }
  }
  if (sSecondaryTilesetAnimCounterMax > 0) {
    if (++sSecondaryTilesetAnimCounter >= sSecondaryTilesetAnimCounterMax) {
      sSecondaryTilesetAnimCounter = 0;
    }
  }

  // Dispatch callbacks.
  if (sPrimaryTilesetAnimCallback !== null) {
    sPrimaryTilesetAnimCallback(sPrimaryTilesetAnimCounter);
  }
  if (sSecondaryTilesetAnimCallback !== null) {
    sSecondaryTilesetAnimCallback(sSecondaryTilesetAnimCounter);
  }
}

/** 1:1 décomp `TransferTilesetAnimsBuffer(void)`.
 *  Flush le buffer de writes VRAM différés → gba.vram (= simule DMA au VBlank).
 *  Appelé au VBlank / après UpdateTilesetAnimations dans la boucle frame. */
export function TransferTilesetAnimsBuffer(rt: DecompRuntime): void {
  const vram = rt.gba.vram;
  for (let i = 0; i < sTilesetDMA3TransferBufferSize; i++) {
    const e = sTilesetDMA3TransferBuffer[i];
    if (!e) continue;
    const end = Math.min(e.destByteOffset + e.sizeBytes, vram.byteLength);
    const srcLen = end - e.destByteOffset;
    if (srcLen > 0) {
      vram.set(e.src.subarray(0, srcLen), e.destByteOffset);
    }
  }
  sTilesetDMA3TransferBufferSize = 0;
}

/** 1:1 décomp `AppendTilesetAnimToBuffer(src, dest, size)`.
 *  Queue un write VRAM dans le buffer circulaire.
 *
 *  @param src         Tile data source (Uint8Array, 4bpp packed).
 *  @param destByteOff Byte offset dans gba.vram (= TILE_OFFSET_4BPP(N)).
 *  @param sizeBytes   Nombre de bytes à copier.
 */
function appendTilesetAnimToBuffer(
  src: Uint8Array,
  destByteOff: number,
  sizeBytes: number,
): void {
  if (sTilesetDMA3TransferBufferSize >= TILESET_DMA3_TRANSFER_BUFFER_MAX) return;
  sTilesetDMA3TransferBuffer[sTilesetDMA3TransferBufferSize] = {
    src,
    destByteOffset: destByteOff,
    sizeBytes,
  };
  sTilesetDMA3TransferBufferSize++;
}

// ─── Init helpers 1:1 décomp ─────────────────────────────────────────────────

/** 1:1 décomp `_InitPrimaryTilesetAnimation(void)`. */
function _initPrimaryTilesetAnimation(): void {
  sPrimaryTilesetAnimCounter = 0;
  sPrimaryTilesetAnimCounterMax = 0;
  sPrimaryTilesetAnimCallback = null;
  if (gPrimaryTilesetInitCallback !== null) {
    gPrimaryTilesetInitCallback();
  }
}

/** 1:1 décomp `_InitSecondaryTilesetAnimation(void)`. */
function _initSecondaryTilesetAnimation(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = 0;
  sSecondaryTilesetAnimCallback = null;
  if (gSecondaryTilesetInitCallback !== null) {
    gSecondaryTilesetInitCallback();
  }
}

// ─── PRIMARY tileset Init functions 1:1 décomp ───────────────────────────────

/** 1:1 décomp `InitTilesetAnim_General(void)` (tileset_anims.c:618-623).
 *  Sets primary callback = TilesetAnim_General, counterMax = 256. */
function InitTilesetAnim_General(): void {
  sPrimaryTilesetAnimCounter = 0;
  sPrimaryTilesetAnimCounterMax = 256;
  sPrimaryTilesetAnimCallback = TilesetAnim_General;
  // Précharge les assets en async (= disponibles dès la 2ème frame).
  void preloadTiles([
    ...GENERAL_URLS.flower,
    ...GENERAL_URLS.water,
    ...GENERAL_URLS.sand_water_edge,
    ...GENERAL_URLS.waterfall,
    ...GENERAL_URLS.land_water_edge,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_Building(void)` (tileset_anims.c:625-630).
 *  Sets primary callback = TilesetAnim_Building, counterMax = 256. */
function InitTilesetAnim_Building(): void {
  sPrimaryTilesetAnimCounter = 0;
  sPrimaryTilesetAnimCounterMax = 256;
  sPrimaryTilesetAnimCallback = TilesetAnim_Building;
  void preloadTiles(BUILDING_URLS.tv_turned_on);
}

// ─── SECONDARY tileset Init functions 1:1 décomp ─────────────────────────────

/** 1:1 décomp `InitTilesetAnim_Petalburg(void)` (tileset_anims.c:676-681).
 *  No callback — syncs secondary counter to primary. */
function InitTilesetAnim_Petalburg(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = null;
}

/** 1:1 décomp `InitTilesetAnim_Rustboro(void)` (tileset_anims.c:683-688). */
function InitTilesetAnim_Rustboro(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Rustboro;
  void preloadTiles([
    ...SECONDARY_URLS.rustboro.windy_water,
    ...SECONDARY_URLS.rustboro.fountain,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_Dewford(void)` (tileset_anims.c:690-695). */
function InitTilesetAnim_Dewford(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Dewford;
  void preloadTiles(SECONDARY_URLS.dewford.flag);
}

/** 1:1 décomp `InitTilesetAnim_Slateport(void)` (tileset_anims.c:697-702). */
function InitTilesetAnim_Slateport(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Slateport;
  void preloadTiles(SECONDARY_URLS.slateport.balloons);
}

/** 1:1 décomp `InitTilesetAnim_Mauville(void)` (tileset_anims.c:704-709).
 *  Note : syncs counter to primary (= sPrimaryTilesetAnimCounter). */
function InitTilesetAnim_Mauville(): void {
  sSecondaryTilesetAnimCounter = sPrimaryTilesetAnimCounter;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Mauville;
  void preloadTiles([
    ...SECONDARY_URLS.mauville.flower_1,
    ...SECONDARY_URLS.mauville.flower_2,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_Lavaridge(void)` (tileset_anims.c:711-716). */
function InitTilesetAnim_Lavaridge(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Lavaridge;
  void preloadTiles([
    ...SECONDARY_URLS.lavaridge.steam,
    ...SECONDARY_URLS.cave.lava,  // shared
  ]);
}

/** 1:1 décomp `InitTilesetAnim_Fallarbor(void)` (tileset_anims.c:718-723).
 *  No callback. */
function InitTilesetAnim_Fallarbor(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = null;
}

/** 1:1 décomp `InitTilesetAnim_Fortree(void)` (tileset_anims.c:725-730).
 *  No callback. */
function InitTilesetAnim_Fortree(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = null;
}

/** 1:1 décomp `InitTilesetAnim_Lilycove(void)` (tileset_anims.c:732-737).
 *  No callback. */
function InitTilesetAnim_Lilycove(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = null;
}

/** 1:1 décomp `InitTilesetAnim_Mossdeep(void)` (tileset_anims.c:739-744).
 *  No callback. */
function InitTilesetAnim_Mossdeep(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = null;
}

/** 1:1 décomp `InitTilesetAnim_EverGrande(void)` (tileset_anims.c:746-751). */
function InitTilesetAnim_EverGrande(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_EverGrande;
  void preloadTiles(SECONDARY_URLS.ever_grande.flowers);
}

/** 1:1 décomp `InitTilesetAnim_Pacifidlog(void)` (tileset_anims.c:753-758).
 *  Note : syncs counter to primary. */
function InitTilesetAnim_Pacifidlog(): void {
  sSecondaryTilesetAnimCounter = sPrimaryTilesetAnimCounter;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Pacifidlog;
  void preloadTiles([
    ...SECONDARY_URLS.pacifidlog.log_bridges,
    ...SECONDARY_URLS.pacifidlog.water_currents,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_Sootopolis(void)` (tileset_anims.c:760-765). */
function InitTilesetAnim_Sootopolis(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Sootopolis;
  void preloadTiles([
    ...SECONDARY_URLS.sootopolis.stormy_water_kyogre,
    ...SECONDARY_URLS.sootopolis.stormy_water_groudon,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_BattleFrontierOutsideWest(void)` (tileset_anims.c:767-772). */
function InitTilesetAnim_BattleFrontierOutsideWest(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_BattleFrontierOutsideWest;
  void preloadTiles(SECONDARY_URLS.battle_frontier_outside_west.flag);
}

/** 1:1 décomp `InitTilesetAnim_BattleFrontierOutsideEast(void)` (tileset_anims.c:774-779). */
function InitTilesetAnim_BattleFrontierOutsideEast(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_BattleFrontierOutsideEast;
  void preloadTiles(SECONDARY_URLS.battle_frontier_outside_east.flag);
}

/** 1:1 décomp `InitTilesetAnim_Underwater(void)` (tileset_anims.c:781-786).
 *  Note : counterMax = 128 (fixe, pas sPrimaryTilesetAnimCounterMax). */
function InitTilesetAnim_Underwater(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = 128;
  sSecondaryTilesetAnimCallback = TilesetAnim_Underwater;
  void preloadTiles(SECONDARY_URLS.underwater.seaweed);
}

/** 1:1 décomp `InitTilesetAnim_SootopolisGym(void)` (tileset_anims.c:788-793).
 *  Note : counterMax = 240 (fixe). */
function InitTilesetAnim_SootopolisGym(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = 240;
  sSecondaryTilesetAnimCallback = TilesetAnim_SootopolisGym;
  void preloadTiles([
    ...SECONDARY_URLS.sootopolis_gym.side_waterfall,
    ...SECONDARY_URLS.sootopolis_gym.front_waterfall,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_Cave(void)` (tileset_anims.c:795-800). */
function InitTilesetAnim_Cave(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_Cave;
  void preloadTiles(SECONDARY_URLS.cave.lava);
}

/** 1:1 décomp `InitTilesetAnim_EliteFour(void)` (tileset_anims.c:802-807).
 *  Note : counterMax = 128 (fixe). */
function InitTilesetAnim_EliteFour(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = 128;
  sSecondaryTilesetAnimCallback = TilesetAnim_EliteFour;
  void preloadTiles([
    ...SECONDARY_URLS.elite_four.floor_light,
    ...SECONDARY_URLS.elite_four.wall_lights,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_MauvilleGym(void)` (tileset_anims.c:809-814). */
function InitTilesetAnim_MauvilleGym(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_MauvilleGym;
  void preloadTiles(SECONDARY_URLS.mauville_gym.electric_gates);
}

/** 1:1 décomp `InitTilesetAnim_BikeShop(void)` (tileset_anims.c:816-821). */
function InitTilesetAnim_BikeShop(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_BikeShop;
  void preloadTiles(SECONDARY_URLS.bike_shop.blinking_lights);
}

/** 1:1 décomp `InitTilesetAnim_BattlePyramid(void)` (tileset_anims.c:823-828). */
function InitTilesetAnim_BattlePyramid(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_BattlePyramid;
  void preloadTiles([
    ...SECONDARY_URLS.battle_pyramid.torch,
    ...SECONDARY_URLS.battle_pyramid.statue_shadow,
  ]);
}

/** 1:1 décomp `InitTilesetAnim_BattleDome(void)` (tileset_anims.c:830-835).
 *  Note : utilise palette blend, pas tile copy → pas de preload tiles. */
function InitTilesetAnim_BattleDome(): void {
  sSecondaryTilesetAnimCounter = 0;
  sSecondaryTilesetAnimCounterMax = sPrimaryTilesetAnimCounterMax;
  sSecondaryTilesetAnimCallback = TilesetAnim_BattleDome;
}

// ─── Tileset name → init callback maps ───────────────────────────────────────

/** Mapping nom tileset primaire → fonction d'init.
 *  1:1 décomp : chaque tileset struct a un `callback` field setté dans
 *  `data/tilesets/primary/<name>.c` (ex: `Tileset_General.callback = InitTilesetAnim_General`). */
const PRIMARY_INIT_MAP: Record<string, () => void> = {
  'general':  InitTilesetAnim_General,
  'building': InitTilesetAnim_Building,
};

/** Mapping nom tileset secondaire → fonction d'init. */
const SECONDARY_INIT_MAP: Record<string, () => void> = {
  'petalburg':                    InitTilesetAnim_Petalburg,
  'rustboro':                     InitTilesetAnim_Rustboro,
  'dewford':                      InitTilesetAnim_Dewford,
  'slateport':                    InitTilesetAnim_Slateport,
  'mauville':                     InitTilesetAnim_Mauville,
  'lavaridge':                    InitTilesetAnim_Lavaridge,
  'fallarbor':                    InitTilesetAnim_Fallarbor,
  'fortree':                      InitTilesetAnim_Fortree,
  'lilycove':                     InitTilesetAnim_Lilycove,
  'mossdeep':                     InitTilesetAnim_Mossdeep,
  'ever_grande':                  InitTilesetAnim_EverGrande,
  'pacifidlog':                   InitTilesetAnim_Pacifidlog,
  'sootopolis':                   InitTilesetAnim_Sootopolis,
  'battle_frontier_outside_west': InitTilesetAnim_BattleFrontierOutsideWest,
  'battle_frontier_outside_east': InitTilesetAnim_BattleFrontierOutsideEast,
  'underwater':                   InitTilesetAnim_Underwater,
  'sootopolis_gym':               InitTilesetAnim_SootopolisGym,
  'cave':                         InitTilesetAnim_Cave,
  'elite_four':                   InitTilesetAnim_EliteFour,
  'mauville_gym':                 InitTilesetAnim_MauvilleGym,
  'bike_shop':                    InitTilesetAnim_BikeShop,
  'battle_pyramid':               InitTilesetAnim_BattlePyramid,
  'battle_dome':                  InitTilesetAnim_BattleDome,
};

// ─── TilesetAnim_General — IMPLÉMENTÉ 1:1 décomp ─────────────────────────────

/** 1:1 décomp `TilesetAnim_General(u16 timer)` (tileset_anims.c:632-644).
 *
 *  Dispatche 5 sub-anims selon timer % 16 :
 *    0 → Flower        (4 tiles @ TILE_OFFSET_4BPP(508))
 *    1 → Water         (30 tiles @ TILE_OFFSET_4BPP(432))
 *    2 → SandWaterEdge (10 tiles @ TILE_OFFSET_4BPP(464))
 *    3 → Waterfall     (6 tiles @ TILE_OFFSET_4BPP(496))
 *    4 → LandWaterEdge (10 tiles @ TILE_OFFSET_4BPP(480))
 */
function TilesetAnim_General(timer: number): void {
  if (timer % 16 === 0) queueAnimTiles_General_Flower(timer / 16 | 0);
  if (timer % 16 === 1) queueAnimTiles_General_Water(timer / 16 | 0);
  if (timer % 16 === 2) queueAnimTiles_General_SandWaterEdge(timer / 16 | 0);
  if (timer % 16 === 3) queueAnimTiles_General_Waterfall(timer / 16 | 0);
  if (timer % 16 === 4) queueAnimTiles_General_LandWaterEdge(timer / 16 | 0);
}

/** 1:1 décomp `QueueAnimTiles_General_Flower(u16 timer)` (tileset_anims.c:652-656).
 *
 *  Frame sequence [0,1,0,2] = gTilesetAnims_General_Flower[].
 *  4 tiles × 32 bytes = 128 bytes.
 *  Dest : TILE_OFFSET_4BPP(508) = 508 * 32 = 16256 bytes dans BG_VRAM. */
function queueAnimTiles_General_Flower(timer: number): void {
  const seqLen = FLOWER_FRAME_SEQ.length;    // 4
  const frameIdx = FLOWER_FRAME_SEQ[timer % seqLen];
  const url = GENERAL_URLS.flower[frameIdx];
  const data = getTiles(url);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(508), 4 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_General_Water(u16 timer)` (tileset_anims.c:658-662).
 *
 *  8 frames cycliques (0-7).
 *  30 tiles × 32 bytes = 960 bytes.
 *  Dest : TILE_OFFSET_4BPP(432). */
function queueAnimTiles_General_Water(timer: number): void {
  const frameIdx = timer % GENERAL_URLS.water.length;    // % 8
  const data = getTiles(GENERAL_URLS.water[frameIdx]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(432), 30 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_General_SandWaterEdge(u16 timer)` (tileset_anims.c:664-668).
 *
 *  Frame sequence [0,1,2,3,4,5,6,0] = gTilesetAnims_General_SandWaterEdge[].
 *  10 tiles × 32 bytes = 320 bytes.
 *  Dest : TILE_OFFSET_4BPP(464). */
function queueAnimTiles_General_SandWaterEdge(timer: number): void {
  const seqLen = SAND_WATER_EDGE_FRAME_SEQ.length;    // 8
  const frameIdx = SAND_WATER_EDGE_FRAME_SEQ[timer % seqLen];
  const data = getTiles(GENERAL_URLS.sand_water_edge[frameIdx]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(464), 10 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_General_Waterfall(u16 timer)` (tileset_anims.c:670-674).
 *
 *  4 frames cycliques (0-3).
 *  6 tiles × 32 bytes = 192 bytes.
 *  Dest : TILE_OFFSET_4BPP(496). */
function queueAnimTiles_General_Waterfall(timer: number): void {
  const frameIdx = timer % GENERAL_URLS.waterfall.length;    // % 4
  const data = getTiles(GENERAL_URLS.waterfall[frameIdx]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(496), 6 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_General_LandWaterEdge(u16 timer)` (tileset_anims.c:958-962).
 *
 *  4 frames cycliques (0-3).
 *  10 tiles × 32 bytes = 320 bytes.
 *  Dest : TILE_OFFSET_4BPP(480). */
function queueAnimTiles_General_LandWaterEdge(timer: number): void {
  const frameIdx = timer % GENERAL_URLS.land_water_edge.length;    // % 4
  const data = getTiles(GENERAL_URLS.land_water_edge[frameIdx]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(480), 10 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Building — IMPLÉMENTÉ 1:1 décomp ────────────────────────────

/** 1:1 décomp `TilesetAnim_Building(u16 timer)` (tileset_anims.c:646-650).
 *
 *  1 sub-anim : TV turned on.
 *    timer % 8 === 0 → TVTurnedOn (2 frames, 4 tiles @ TILE_OFFSET_4BPP(496))
 */
function TilesetAnim_Building(timer: number): void {
  if (timer % 8 === 0) queueAnimTiles_Building_TVTurnedOn(timer / 8 | 0);
}

/** 1:1 décomp `QueueAnimTiles_Building_TVTurnedOn(u16 timer)` (tileset_anims.c:1113-1117).
 *
 *  2 frames cycliques (0-1).
 *  4 tiles × 32 bytes = 128 bytes.
 *  Dest : TILE_OFFSET_4BPP(496). */
function queueAnimTiles_Building_TVTurnedOn(timer: number): void {
  const frameIdx = timer % BUILDING_URLS.tv_turned_on.length;    // % 2
  const data = getTiles(BUILDING_URLS.tv_turned_on[frameIdx]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(496), 4 * TILE_SIZE_4BPP);
}

// ─── SECONDARY tileset callbacks 1:1 décomp — IMPLÉMENTÉ ─────────────────────
// Pattern : chaque TilesetAnim_X dispatche selon `timer % N` vers
// queueAnimTiles_X_Y (= write VRAM via appendTilesetAnimToBuffer).
// Source 1:1 : `D:/Projet 1/decomps/pokeemeraude/src/tileset_anims.c:837-1166`.

// ─── TilesetAnim_Rustboro (1:1 décomp:837-858) ───────────────────────────────

/** 1:1 décomp `TilesetAnim_Rustboro` (tileset_anims.c:837-858). */
function TilesetAnim_Rustboro(timer: number): void {
  if (timer % 8 === 0) {
    queueAnimTiles_Rustboro_WindyWater(timer >> 3, 0);
    queueAnimTiles_Rustboro_Fountain(timer >> 3);
  }
  for (let i = 1; i < 8; i++) {
    if (timer % 8 === i) queueAnimTiles_Rustboro_WindyWater(timer >> 3, i);
  }
}

/** 1:1 décomp `QueueAnimTiles_Rustboro_WindyWater` (tileset_anims.c:1008-1014).
 *  Note : timer_div -= timer_mod (= synchronise les 8 cells malgré décalage).
 *  4 tiles à VDest[mod] (= TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 128..156)). */
function queueAnimTiles_Rustboro_WindyWater(timer_div: number, timer_mod: number): void {
  const adjusted = (timer_div - timer_mod);
  const i = ((adjusted % 8) + 8) % 8;
  const data = getTiles(SECONDARY_URLS.rustboro.windy_water[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, RUSTBORO_WINDY_WATER_VDESTS[timer_mod], 4 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_Rustboro_Fountain` (tileset_anims.c:1016-1020).
 *  4 tiles à TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 448). */
function queueAnimTiles_Rustboro_Fountain(timer: number): void {
  const i = timer % SECONDARY_URLS.rustboro.fountain.length;  // % 2
  const data = getTiles(SECONDARY_URLS.rustboro.fountain[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 448), 4 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Dewford (1:1 décomp:860-864) ────────────────────────────────

/** 1:1 décomp `TilesetAnim_Dewford` (tileset_anims.c:860-864). */
function TilesetAnim_Dewford(timer: number): void {
  if (timer % 8 === 0) queueAnimTiles_Dewford_Flag(timer >> 3);
}

/** 1:1 décomp `QueueAnimTiles_Dewford_Flag` (tileset_anims.c:1042-1046).
 *  6 tiles à TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 170). */
function queueAnimTiles_Dewford_Flag(timer: number): void {
  const i = timer % SECONDARY_URLS.dewford.flag.length;  // % 4
  const data = getTiles(SECONDARY_URLS.dewford.flag[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 170), 6 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Slateport (1:1 décomp:866-870) ──────────────────────────────

/** 1:1 décomp `TilesetAnim_Slateport` (tileset_anims.c:866-870). */
function TilesetAnim_Slateport(timer: number): void {
  if (timer % 16 === 0) queueAnimTiles_Slateport_Balloons(timer >> 4);
}

/** 1:1 décomp `QueueAnimTiles_Slateport_Balloons` (tileset_anims.c:1060-1064).
 *  4 tiles à TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 224). */
function queueAnimTiles_Slateport_Balloons(timer: number): void {
  const i = timer % SECONDARY_URLS.slateport.balloons.length;  // % 4
  const data = getTiles(SECONDARY_URLS.slateport.balloons[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 224), 4 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Mauville (1:1 décomp:872-890) ───────────────────────────────

/** 1:1 décomp `TilesetAnim_Mauville` (tileset_anims.c:872-890). */
function TilesetAnim_Mauville(timer: number): void {
  for (let i = 0; i < 8; i++) {
    if (timer % 8 === i) queueAnimTiles_Mauville_Flowers(timer >> 3, i);
  }
}

/** 1:1 décomp `QueueAnimTiles_Mauville_Flowers` (tileset_anims.c:991-1006).
 *  Note : 2 séquences possibles selon timer_div — la "long" cycle (12 frames
 *  de Flower1+Flower2 cycliques) si timer_div < 12, sinon la "B" cycle (4
 *  frames de Flower1_B+Flower2_B). 1:1 décomp logic préservée. */
function queueAnimTiles_Mauville_Flowers(timer_div: number, timer_mod: number): void {
  const adjusted = timer_div - timer_mod;
  // 1:1 décomp condition : `if (timer_div < min(12, 12))` = always 12.
  if (adjusted < MAUVILLE_FLOWER_SEQ.length) {
    const i = ((adjusted % MAUVILLE_FLOWER_SEQ.length) + MAUVILLE_FLOWER_SEQ.length) % MAUVILLE_FLOWER_SEQ.length;
    const f1 = MAUVILLE_FLOWER_SEQ[i];
    const f2 = MAUVILLE_FLOWER_SEQ[i];
    const d1 = getTiles(SECONDARY_URLS.mauville.flower_1[f1]);
    const d2 = getTiles(SECONDARY_URLS.mauville.flower_2[f2]);
    if (d1) appendTilesetAnimToBuffer(d1, MAUVILLE_FLOWER1_VDESTS[timer_mod], 4 * TILE_SIZE_4BPP);
    if (d2) appendTilesetAnimToBuffer(d2, MAUVILLE_FLOWER2_VDESTS[timer_mod], 4 * TILE_SIZE_4BPP);
  } else {
    // B cycle (= rare, fallback).
    const i = ((adjusted % MAUVILLE_FLOWER_B_SEQ.length) + MAUVILLE_FLOWER_B_SEQ.length) % MAUVILLE_FLOWER_B_SEQ.length;
    const f1 = MAUVILLE_FLOWER_B_SEQ[i];
    const f2 = MAUVILLE_FLOWER_B_SEQ[i];
    const d1 = getTiles(SECONDARY_URLS.mauville.flower_1[f1]);
    const d2 = getTiles(SECONDARY_URLS.mauville.flower_2[f2]);
    if (d1) appendTilesetAnimToBuffer(d1, MAUVILLE_FLOWER1_VDESTS[timer_mod], 4 * TILE_SIZE_4BPP);
    if (d2) appendTilesetAnimToBuffer(d2, MAUVILLE_FLOWER2_VDESTS[timer_mod], 4 * TILE_SIZE_4BPP);
  }
}

// ─── TilesetAnim_Lavaridge (1:1 décomp:892-898) ──────────────────────────────

/** 1:1 décomp `TilesetAnim_Lavaridge` (tileset_anims.c:892-898). */
function TilesetAnim_Lavaridge(timer: number): void {
  if (timer % 16 === 0) queueAnimTiles_Lavaridge_Steam(timer >> 4);
  if (timer % 16 === 1) queueAnimTiles_Lavaridge_Lava(timer >> 4);
}

/** 1:1 décomp `QueueAnimTiles_Lavaridge_Steam` (tileset_anims.c:964-971).
 *  2 dests à 4 tiles each, frame offset (timer + 2) % 4 sur le 2ème. */
function queueAnimTiles_Lavaridge_Steam(timer: number): void {
  const len = SECONDARY_URLS.lavaridge.steam.length;
  const i1 = timer % len;
  const i2 = (timer + 2) % len;
  const d1 = getTiles(SECONDARY_URLS.lavaridge.steam[i1]);
  const d2 = getTiles(SECONDARY_URLS.lavaridge.steam[i2]);
  if (d1) appendTilesetAnimToBuffer(d1, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 288), 4 * TILE_SIZE_4BPP);
  if (d2) appendTilesetAnimToBuffer(d2, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 292), 4 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_Lavaridge_Lava` (tileset_anims.c:1022-1026).
 *  Note : utilise les 4 frames du tileset cave/anim/lava (= shared). */
function queueAnimTiles_Lavaridge_Lava(timer: number): void {
  const i = timer % SECONDARY_URLS.cave.lava.length;  // % 4
  const data = getTiles(SECONDARY_URLS.cave.lava[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 160), 4 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_EverGrande (1:1 décomp:900-918) ─────────────────────────────

/** 1:1 décomp `TilesetAnim_EverGrande` (tileset_anims.c:900-918). */
function TilesetAnim_EverGrande(timer: number): void {
  for (let i = 0; i < 8; i++) {
    if (timer % 8 === i) queueAnimTiles_EverGrande_Flowers(timer >> 3, i);
  }
}

/** 1:1 décomp `QueueAnimTiles_EverGrande_Flowers` (tileset_anims.c:1028-1034). */
function queueAnimTiles_EverGrande_Flowers(timer_div: number, timer_mod: number): void {
  const adjusted = timer_div - timer_mod;
  const i = ((adjusted % 8) + 8) % 8;
  const data = getTiles(SECONDARY_URLS.ever_grande.flowers[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, EVER_GRANDE_VDESTS[timer_mod], 4 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Pacifidlog (1:1 décomp:920-926) ─────────────────────────────

/** 1:1 décomp `TilesetAnim_Pacifidlog` (tileset_anims.c:920-926). */
function TilesetAnim_Pacifidlog(timer: number): void {
  if (timer % 16 === 0) queueAnimTiles_Pacifidlog_LogBridges(timer >> 4);
  if (timer % 16 === 1) queueAnimTiles_Pacifidlog_WaterCurrents(timer >> 4);
}

/** 1:1 décomp `QueueAnimTiles_Pacifidlog_LogBridges` (tileset_anims.c:973-977).
 *  Frame seq [0,1,2,1] (= 4 entries depuis 3 frames). 30 tiles. */
function queueAnimTiles_Pacifidlog_LogBridges(timer: number): void {
  const i = timer % PACIFIDLOG_LOG_BRIDGES_SEQ.length;
  const frameIdx = PACIFIDLOG_LOG_BRIDGES_SEQ[i];
  const data = getTiles(SECONDARY_URLS.pacifidlog.log_bridges[frameIdx]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 464), 30 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_Pacifidlog_WaterCurrents` (tileset_anims.c:985-989).
 *  8 frames cycliques. 8 tiles. */
function queueAnimTiles_Pacifidlog_WaterCurrents(timer: number): void {
  const i = timer % SECONDARY_URLS.pacifidlog.water_currents.length;  // % 8
  const data = getTiles(SECONDARY_URLS.pacifidlog.water_currents[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 496), 8 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Sootopolis (1:1 décomp:928-932) ─────────────────────────────

/** 1:1 décomp `TilesetAnim_Sootopolis` (tileset_anims.c:928-932). */
function TilesetAnim_Sootopolis(timer: number): void {
  if (timer % 16 === 0) queueAnimTiles_Sootopolis_StormyWater(timer >> 4);
}

/** 1:1 décomp `QueueAnimTiles_Sootopolis_StormyWater` (tileset_anims.c:1150-1154).
 *  Note : décomp = INCBIN_U16 concat de _kyogre.4bpp + _groudon.4bpp = 96 tiles
 *  (= 48+48). Notre impl split en 2 appends (= 48 tiles each à dest+0 et dest+48). */
function queueAnimTiles_Sootopolis_StormyWater(timer: number): void {
  const i = timer % SECONDARY_URLS.sootopolis.stormy_water_kyogre.length;  // % 8
  const dKyogre = getTiles(SECONDARY_URLS.sootopolis.stormy_water_kyogre[i]);
  const dGroudon = getTiles(SECONDARY_URLS.sootopolis.stormy_water_groudon[i]);
  if (dKyogre) {
    appendTilesetAnimToBuffer(dKyogre,
      TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 240), 48 * TILE_SIZE_4BPP);
  }
  if (dGroudon) {
    appendTilesetAnimToBuffer(dGroudon,
      TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 240 + 48), 48 * TILE_SIZE_4BPP);
  }
}

// ─── TilesetAnim_BattleFrontierOutsideWest (1:1 décomp:946-950) ──────────────

/** 1:1 décomp `TilesetAnim_BattleFrontierOutsideWest` (tileset_anims.c:946-950). */
function TilesetAnim_BattleFrontierOutsideWest(timer: number): void {
  if (timer % 8 === 0) queueAnimTiles_BattleFrontierOutsideWest_Flag(timer >> 3);
}

/** 1:1 décomp `QueueAnimTiles_BattleFrontierOutsideWest_Flag` (tileset_anims.c:1048-1052). */
function queueAnimTiles_BattleFrontierOutsideWest_Flag(timer: number): void {
  const urls = SECONDARY_URLS.battle_frontier_outside_west.flag;
  const i = timer % urls.length;  // % 4
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 218), 6 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_BattleFrontierOutsideEast (1:1 décomp:952-956) ──────────────

/** 1:1 décomp `TilesetAnim_BattleFrontierOutsideEast` (tileset_anims.c:952-956). */
function TilesetAnim_BattleFrontierOutsideEast(timer: number): void {
  if (timer % 8 === 0) queueAnimTiles_BattleFrontierOutsideEast_Flag(timer >> 3);
}

/** 1:1 décomp `QueueAnimTiles_BattleFrontierOutsideEast_Flag` (tileset_anims.c:1054-1058).
 *  Note : même dest que West (= 218) car installé dans des maps différentes. */
function queueAnimTiles_BattleFrontierOutsideEast_Flag(timer: number): void {
  const urls = SECONDARY_URLS.battle_frontier_outside_east.flag;
  const i = timer % urls.length;  // % 4
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 218), 6 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_Underwater (1:1 décomp:934-938) ─────────────────────────────

/** 1:1 décomp `TilesetAnim_Underwater` (tileset_anims.c:934-938). */
function TilesetAnim_Underwater(timer: number): void {
  if (timer % 16 === 0) queueAnimTiles_Underwater_Seaweed(timer >> 4);
}

/** 1:1 décomp `QueueAnimTiles_Underwater_Seaweed` (tileset_anims.c:979-983).
 *  4 tiles à TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 496). */
function queueAnimTiles_Underwater_Seaweed(timer: number): void {
  const urls = SECONDARY_URLS.underwater.seaweed;
  const i = timer % urls.length;  // % 4
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 496), 4 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_SootopolisGym (1:1 décomp:1072-1076) ────────────────────────

/** 1:1 décomp `TilesetAnim_SootopolisGym` (tileset_anims.c:1072-1076). */
function TilesetAnim_SootopolisGym(timer: number): void {
  if (timer % 8 === 0) queueAnimTiles_SootopolisGym_Waterfalls(timer >> 3);
}

/** 1:1 décomp `QueueAnimTiles_SootopolisGym_Waterfalls` (tileset_anims.c:1119-1124).
 *  side : 12 tiles à dest+496 ; front : 20 tiles à dest+464. */
function queueAnimTiles_SootopolisGym_Waterfalls(timer: number): void {
  const sideUrls = SECONDARY_URLS.sootopolis_gym.side_waterfall;
  const frontUrls = SECONDARY_URLS.sootopolis_gym.front_waterfall;
  const len = Math.min(sideUrls.length, frontUrls.length);  // 3
  const i = timer % len;
  const dSide = getTiles(sideUrls[i]);
  const dFront = getTiles(frontUrls[i]);
  if (dSide) {
    appendTilesetAnimToBuffer(dSide, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 496), 12 * TILE_SIZE_4BPP);
  }
  if (dFront) {
    appendTilesetAnimToBuffer(dFront, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 464), 20 * TILE_SIZE_4BPP);
  }
}

// ─── TilesetAnim_Cave (1:1 décomp:940-944) ───────────────────────────────────

/** 1:1 décomp `TilesetAnim_Cave` (tileset_anims.c:940-944). */
function TilesetAnim_Cave(timer: number): void {
  if (timer % 16 === 1) queueAnimTiles_Cave_Lava(timer >> 4);
}

/** 1:1 décomp `QueueAnimTiles_Cave_Lava` (tileset_anims.c:1036-1040).
 *  Même asset que Lavaridge_Lava mais dest différente (= 416 vs 160). */
function queueAnimTiles_Cave_Lava(timer: number): void {
  const i = timer % SECONDARY_URLS.cave.lava.length;  // % 4
  const data = getTiles(SECONDARY_URLS.cave.lava[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 416), 4 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_EliteFour (1:1 décomp:1078-1084) ────────────────────────────

/** 1:1 décomp `TilesetAnim_EliteFour` (tileset_anims.c:1078-1084).
 *  2 sub-anims : ground_lights (timer%64==1) + wall_lights (timer%8==1). */
function TilesetAnim_EliteFour(timer: number): void {
  if (timer % 64 === 1) queueAnimTiles_EliteFour_GroundLights(timer >> 6);
  if (timer % 8 === 1) queueAnimTiles_EliteFour_WallLights(timer >> 3);
}

/** 1:1 décomp `QueueAnimTiles_EliteFour_GroundLights` (tileset_anims.c:1132-1136).
 *  2 frames cycliques (= floor_light/0,1). 4 tiles. */
function queueAnimTiles_EliteFour_GroundLights(timer: number): void {
  const urls = SECONDARY_URLS.elite_four.floor_light;
  const i = timer % urls.length;  // % 2
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 480), 4 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_EliteFour_WallLights` (tileset_anims.c:1126-1130).
 *  4 frames cycliques. 1 tile (= 32 bytes). */
function queueAnimTiles_EliteFour_WallLights(timer: number): void {
  const urls = SECONDARY_URLS.elite_four.wall_lights;
  const i = timer % urls.length;  // % 4
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 504), 1 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_MauvilleGym (1:1 décomp:1066-1070) ──────────────────────────

/** 1:1 décomp `TilesetAnim_MauvilleGym` (tileset_anims.c:1066-1070). */
function TilesetAnim_MauvilleGym(timer: number): void {
  if (timer % 2 === 0) queueAnimTiles_MauvilleGym_ElectricGates(timer >> 1);
}

/** 1:1 décomp `QueueAnimTiles_MauvilleGym_ElectricGates` (tileset_anims.c:1138-1142).
 *  2 frames cycliques. 16 tiles à dest+144. */
function queueAnimTiles_MauvilleGym_ElectricGates(timer: number): void {
  const urls = SECONDARY_URLS.mauville_gym.electric_gates;
  const i = timer % urls.length;  // % 2
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 144), 16 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_BikeShop (1:1 décomp:1086-1090) ─────────────────────────────

/** 1:1 décomp `TilesetAnim_BikeShop` (tileset_anims.c:1086-1090). */
function TilesetAnim_BikeShop(timer: number): void {
  if (timer % 4 === 0) queueAnimTiles_BikeShop_BlinkingLights(timer >> 2);
}

/** 1:1 décomp `QueueAnimTiles_BikeShop_BlinkingLights` (tileset_anims.c:1144-1148).
 *  2 frames cycliques. 9 tiles à dest+496. */
function queueAnimTiles_BikeShop_BlinkingLights(timer: number): void {
  const urls = SECONDARY_URLS.bike_shop.blinking_lights;
  const i = timer % urls.length;  // % 2
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 496), 9 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_BattlePyramid (1:1 décomp:1092-1099) ────────────────────────

/** 1:1 décomp `TilesetAnim_BattlePyramid` (tileset_anims.c:1092-1099). */
function TilesetAnim_BattlePyramid(timer: number): void {
  if (timer % 8 === 0) {
    queueAnimTiles_BattlePyramid_Torch(timer >> 3);
    queueAnimTiles_BattlePyramid_StatueShadow(timer >> 3);
  }
}

/** 1:1 décomp `QueueAnimTiles_BattlePyramid_Torch` (tileset_anims.c:1156-1160).
 *  3 frames cycliques. 8 tiles à dest+151. */
function queueAnimTiles_BattlePyramid_Torch(timer: number): void {
  const urls = SECONDARY_URLS.battle_pyramid.torch;
  const i = timer % urls.length;  // % 3
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 151), 8 * TILE_SIZE_4BPP);
}

/** 1:1 décomp `QueueAnimTiles_BattlePyramid_StatueShadow` (tileset_anims.c:1162-1166).
 *  3 frames cycliques. 8 tiles à dest+135. */
function queueAnimTiles_BattlePyramid_StatueShadow(timer: number): void {
  const urls = SECONDARY_URLS.battle_pyramid.statue_shadow;
  const i = timer % urls.length;  // % 3
  const data = getTiles(urls[i]);
  if (data === null) return;
  appendTilesetAnimToBuffer(data, TILE_OFFSET_4BPP(NUM_TILES_IN_PRIMARY + 135), 8 * TILE_SIZE_4BPP);
}

// ─── TilesetAnim_BattleDome (1:1 décomp:1101-1105) ───────────────────────────

/** 1:1 décomp `TilesetAnim_BattleDome` (tileset_anims.c:1101-1105).
 *
 *  Note : utilise palette blend (= `BlendAnimPalette_BattleDome_FloorLights`),
 *  PAS tile copy. La décomp copie sTilesetAnims_BattleDomeFloorLightPals[i%4]
 *  (= 4 palettes 16-color) dans gPlttBufferUnfaded[BG_PLTT_ID(8)] puis call
 *  BlendPalette avec gPaletteFade.y + blendColor.
 *
 *  Implémentation actuelle : NO-OP. Battle Dome non testé Phase 4.7.
 *  TODO Phase 4.8+ : wire palette copy + blend (= besoin gPlttBufferUnfaded
 *  + gPaletteFade access via rt). Décomp data : `data/tilesets/secondary/
 *  battle_dome/anim/floor_light_pals_*.gbapal`.
 */
function TilesetAnim_BattleDome(_timer: number): void {
  // Stub : palette blend non encore implémenté. Map Battle Dome rendering OK
  // sans cette anim (= tile rendering normal, juste pas de pulse de lights).
}


// src/region_map.ts — miroir 1:1 décomp `src/region_map.c` (carte de Hoenn générique + fly map).
//
//  Ce fichier gère la carte de région en général et la carte de choix de destination Vol.
//  Les usages spécifiques sont ailleurs (1:1 commentaire d'entête du .c) :
//    - Pokénav            → src/pokenav_region_map.ts
//    - Pokédex            → pokedex_area_screen / pokedex_area_region_map (non câblés ici)
//    - Mur du Centre      → src/engine/field/region-map.ts (port antérieur field_region_map.c)
//
//  ADAPTATIONS MOTEUR (précédents cités sur place) :
//    - INCBIN → assets chargés async par PrefetchRegionMapAssets() (pattern
//      pokenav_main_menu.ts `_pokenavLoadHeaderGraphics` / match_call_gfx `_loadMatchCallUiGfx`),
//      lus par des fonctions SYNCHRONES ; LoadRegionMapGfx POLL le flag (précédent
//      pokenav_main_menu.ts:464 `_pokenavHeaderLoaded`) et HURLE si le fetch a échoué.
//    - mapSecId NUMÉRIQUE partout (1:1 décomp) ; la frontière moteur (gMapHeader.regionMapSectionId
//      = clé string 'MAPSEC_*' dans ce port) convertit via _mapsecIdFromKey/_mapsecKeyFromId.
//    - gRegionMapEntries + sRegionMap_MapSectionLayout = data/region_map/region_map_entries.h +
//      region_map_layout.h, servis par public/decomp/em/region_map/region_map_data.json
//      (extraction existante, même source que engine/field/region-map-data.ts).
//
//  Les 3 GetMapName* préexistants (Match Call/party/summary/tv) sont PRÉSERVÉS tels quels
//  (ils marchent en jeu) et replacés à leur position du .c — divergences notées au rapport.

import { getMapNameFr } from './data/map-names-fr';
import { encodeOwText } from './text';
import * as _MAPSEC from '../include/constants/region_map_sections';
import {
  MAPSEC_LITTLEROOT_TOWN, MAPSEC_OLDALE_TOWN, MAPSEC_DEWFORD_TOWN, MAPSEC_LAVARIDGE_TOWN,
  MAPSEC_FALLARBOR_TOWN, MAPSEC_VERDANTURF_TOWN, MAPSEC_PACIFIDLOG_TOWN, MAPSEC_PETALBURG_CITY,
  MAPSEC_SLATEPORT_CITY, MAPSEC_MAUVILLE_CITY, MAPSEC_RUSTBORO_CITY, MAPSEC_FORTREE_CITY,
  MAPSEC_LILYCOVE_CITY, MAPSEC_MOSSDEEP_CITY, MAPSEC_SOOTOPOLIS_CITY, MAPSEC_EVER_GRANDE_CITY,
  MAPSEC_ROUTE_101, MAPSEC_ROUTE_102, MAPSEC_ROUTE_103, MAPSEC_ROUTE_104, MAPSEC_ROUTE_105,
  MAPSEC_ROUTE_106, MAPSEC_ROUTE_107, MAPSEC_ROUTE_108, MAPSEC_ROUTE_109, MAPSEC_ROUTE_110,
  MAPSEC_ROUTE_111, MAPSEC_ROUTE_112, MAPSEC_ROUTE_113, MAPSEC_ROUTE_114, MAPSEC_ROUTE_115,
  MAPSEC_ROUTE_116, MAPSEC_ROUTE_117, MAPSEC_ROUTE_118, MAPSEC_ROUTE_119, MAPSEC_ROUTE_120,
  MAPSEC_ROUTE_121, MAPSEC_ROUTE_122, MAPSEC_ROUTE_123, MAPSEC_ROUTE_124, MAPSEC_ROUTE_125,
  MAPSEC_ROUTE_126, MAPSEC_ROUTE_127, MAPSEC_ROUTE_128, MAPSEC_ROUTE_129, MAPSEC_ROUTE_130,
  MAPSEC_ROUTE_131, MAPSEC_ROUTE_132, MAPSEC_ROUTE_133, MAPSEC_ROUTE_134,
  MAPSEC_UNDERWATER_105, MAPSEC_UNDERWATER_124, MAPSEC_UNDERWATER_125, MAPSEC_UNDERWATER_126,
  MAPSEC_UNDERWATER_127, MAPSEC_UNDERWATER_128, MAPSEC_UNDERWATER_129,
  MAPSEC_UNDERWATER_SOOTOPOLIS, MAPSEC_UNDERWATER_SEAFLOOR_CAVERN, MAPSEC_UNDERWATER_SEALED_CHAMBER,
  MAPSEC_UNDERWATER_MARINE_CAVE, MAPSEC_MARINE_CAVE,
  MAPSEC_AQUA_HIDEOUT, MAPSEC_AQUA_HIDEOUT_OLD, MAPSEC_MAGMA_HIDEOUT,
  MAPSEC_PETALBURG_WOODS, MAPSEC_JAGGED_PASS, MAPSEC_MT_PYRE, MAPSEC_SKY_PILLAR,
  MAPSEC_MIRAGE_TOWER, MAPSEC_TRAINER_HILL, MAPSEC_DESERT_UNDERPASS, MAPSEC_ALTERING_CAVE,
  MAPSEC_ARTISAN_CAVE, MAPSEC_ABANDONED_SHIP, MAPSEC_BATTLE_FRONTIER, MAPSEC_SOUTHERN_ISLAND,
  MAPSEC_BIRTH_ISLAND, MAPSEC_FARAWAY_ISLAND, MAPSEC_NAVEL_ROCK,
  MAPSEC_DYNAMIC, MAPSEC_SECRET_BASE, MAPSEC_NONE,
} from '../include/constants/region_map_sections';
import {
  FLAG_VISITED_LITTLEROOT_TOWN, FLAG_VISITED_OLDALE_TOWN, FLAG_VISITED_DEWFORD_TOWN,
  FLAG_VISITED_LAVARIDGE_TOWN, FLAG_VISITED_FALLARBOR_TOWN, FLAG_VISITED_VERDANTURF_TOWN,
  FLAG_VISITED_PACIFIDLOG_TOWN, FLAG_VISITED_PETALBURG_CITY, FLAG_VISITED_SLATEPORT_CITY,
  FLAG_VISITED_MAUVILLE_CITY, FLAG_VISITED_RUSTBORO_CITY, FLAG_VISITED_FORTREE_CITY,
  FLAG_VISITED_LILYCOVE_CITY, FLAG_VISITED_MOSSDEEP_CITY, FLAG_VISITED_SOOTOPOLIS_CITY,
  FLAG_VISITED_EVER_GRANDE_CITY, FLAG_LANDMARK_BATTLE_FRONTIER, FLAG_LANDMARK_SOUTHERN_ISLAND,
  FLAG_LANDMARK_POKEMON_LEAGUE,
} from '../include/constants/flags';
import {
  TERRA_CAVE_LOCATIONS_START, TERRA_CAVE_LOCATIONS, MARINE_CAVE_LOCATIONS,
} from '../include/constants/weather';
import {
  MAP_TYPE_TOWN, MAP_TYPE_CITY, MAP_TYPE_ROUTE, MAP_TYPE_UNDERWATER, MAP_TYPE_OCEAN_ROUTE,
  MAP_TYPE_UNDERGROUND, MAP_TYPE_UNKNOWN, MAP_TYPE_SECRET_BASE, MAP_TYPE_INDOOR,
} from '../include/constants/map_types';
import { VAR_ABNORMAL_WEATHER_LOCATION } from '../include/constants/vars';
import { MAP_CONSTANTS, MAP_GROUP, MAP_NUM } from '../include/constants/map_groups';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT,
  REG_OFFSET_BG2PA, REG_OFFSET_BG2PB, REG_OFFSET_BG2PC, REG_OFFSET_BG2PD,
  REG_OFFSET_BG2X_L, REG_OFFSET_BG2X_H, REG_OFFSET_BG2Y_L, REG_OFFSET_BG2Y_H,
  REG_OFFSET_DISPCNT, REG_OFFSET_BG0HOFS, REG_OFFSET_BG0VOFS, REG_OFFSET_BG1HOFS,
  REG_OFFSET_BG1VOFS, REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS, REG_OFFSET_BG3HOFS,
  REG_OFFSET_BG3VOFS, REG_OFFSET_BLDCNT, DISPCNT_OBJ_1D_MAP, DISPCNT_OBJ_ON,
} from '../include/gba/io_reg';
import { DISPLAY_WIDTH, DISPLAY_HEIGHT } from '../include/gba/defines';
import { CHAR_SPACE, EOS } from '../include/constants/characters';
import {
  getRuntime, JOY_HELD, JOY_NEW, BlendPalettes, LoadPalette, SpriteCallbackDummy,
  ResetPaletteFade, FEMALE, MALE, m4aSongNumStart, LoadOam, ProcessSpriteCopyRequests,
  TransferPlttBuffer, FreeAllWindowBuffers,
} from '../harness/runtime/decomp-globals';
import { SE_SELECT } from '../include/constants/songs';
import { getString } from '../harness/runtime/decomp-strings';
import { loadTileBin, loadGbaPal, loadAffineTilemapBin, extractPngPlte } from '../harness/gba/png-loader';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { FlagGet, VarGet } from './event_data';
import { gMapHeader } from './fieldmap';
import { gSineTable } from './trig';
import { SetGpuReg } from './gpu_regs';
import { SetGpuRegBits, RGB_BLACK } from '../harness/runtime/decomp-helpers';
import {
  SetBgAttribute, BG_ATTR_SCREENSIZE, BG_ATTR_CHARBASEINDEX, BG_ATTR_MAPBASEINDEX,
  BG_ATTR_WRAPAROUND, BG_ATTR_PALETTEMODE, CopyToBgTilemapBuffer,
  ResetBgsAndClearDma3BusyFlags, InitBgsFromTemplates, InitWindows, ShowBg,
  FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram, COPYWIN_GFX,
  ScheduleBgCopyTilemapToVram, ClearScheduledBgCopiesToVram, PIXEL_FILL,
} from './window';
import type { BgTemplate, WindowTemplate } from './window';

// ── ANTI-TDZ (boot entier crashait) : l'import STATIQUE de './overworld' fermait le cycle ESM
// party_menu → region_map → overworld → field_specials → party_menu, et overworld.ts:1397
// consomme PLAYER_AVATAR_FLAG_ON_FOOT au top-level → ReferenceError TDZ à l'évaluation.
// Import DIFFÉRÉ (précédent : pokenav.ts:120, même pattern) : ces 2 fonctions ne sont
// appelées qu'à l'OUVERTURE de la carte (secondes après le boot) — les wrappers locaux
// gardent les noms 1:1 pour que les call-sites restent identiques au .c, et HURLENT si
// l'import n'est pas encore résolu (jamais observé : résolution en ms au boot).
let _owGetMapTypeByGroupAndId: ((g: number, n: number) => number) | null = null;
let _owGetMapHeaderByGroupAndId: ((g: number, n: number) => typeof gMapHeader) | null = null;
import('./overworld').then((m) => {
  _owGetMapTypeByGroupAndId = m.GetMapTypeByGroupAndId;
  _owGetMapHeaderByGroupAndId = m.Overworld_GetMapHeaderByGroupAndId as (g: number, n: number) => typeof gMapHeader;
}).catch((e) => console.error('[region_map] import overworld (anti-TDZ) a échoué', e));
function GetMapTypeByGroupAndId(mapGroup: number, mapNum: number): number {
  if (!_owGetMapTypeByGroupAndId) { console.error('[region_map] GetMapTypeByGroupAndId appelée avant résolution de l\'import overworld'); return 0; }
  return _owGetMapTypeByGroupAndId(mapGroup, mapNum);
}
function Overworld_GetMapHeaderByGroupAndId(mapGroup: number, mapNum: number): typeof gMapHeader {
  if (!_owGetMapHeaderByGroupAndId) { console.error('[region_map] Overworld_GetMapHeaderByGroupAndId appelée avant résolution de l\'import overworld'); return gMapHeader; }
  return _owGetMapHeaderByGroupAndId(mapGroup, mapNum);
}
import {
  LoadSpriteSheet, LoadSpritePalette, CreateSprite, DestroySprite, FreeSpriteTilesByTag,
  FreeSpritePaletteByTag, IndexOfSpritePaletteTag, StartSpriteAnim, MAX_SPRITES, gSprites,
  ANIMCMD_FRAME, ANIMCMD_END, ANIMCMD_JUMP, gDummySpriteAffineAnimTable,
  ResetSpriteData, FreeSpriteTileRanges, FreeAllSpritePalettes, AnimateSprites, BuildOamBuffer,
  PLTT_SIZE_4BPP,
} from './sprite';
import type { AnimCmd } from './sprite';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import { BG_PLTT_ID, OBJ_PLTT_ID, BeginNormalPaletteFade, UpdatePaletteFade, PALETTES_ALL } from './palette';
import { AddTextPrinterParameterized, DeactivateAllTextPrinters } from './text';
import { FONT_NORMAL } from '../include/text';
import { StringFill, StringLength } from './string_util';
import { GetStringRightAlignXOffset } from './international_string_util';
import { DrawStdFrameWithCustomTileAndPalette, ClearStdWindowAndFrameToTransparent } from './menu';
import { LoadUserWindowBorderGfx } from './text_window';
import { __wireTodo } from './engine/wire-todo';

// ─── constantes décomp inlinées (1:1 include/constants/weather.h — le générateur
//     d'include n'a résolu que les numériques ; les EXPR sont dérivées ici 1:1) ───
const MARINE_CAVE_LOCATIONS_START = TERRA_CAVE_LOCATIONS_START + TERRA_CAVE_LOCATIONS; // = 9
const ABNORMAL_WEATHER_LOCATIONS = MARINE_CAVE_LOCATIONS + TERRA_CAVE_LOCATIONS;       // = 16

// 1:1 include/region_map.h:7.
const MAP_NAME_LENGTH = 16;

// 1:1 include/region_map.h:9-17 `enum MAP_INPUT_*`.
export const MAP_INPUT_NONE = 0;
export const MAP_INPUT_MOVE_START = 1;
export const MAP_INPUT_MOVE_CONT = 2;
export const MAP_INPUT_MOVE_END = 3;
export const MAP_INPUT_A_BUTTON = 4;
export const MAP_INPUT_B_BUTTON = 5;

// 1:1 include/region_map.h:19-26 `enum MAPSECTYPE_*`.
export const MAPSECTYPE_NONE = 0;
export const MAPSECTYPE_ROUTE = 1;
export const MAPSECTYPE_CITY_CANFLY = 2;
export const MAPSECTYPE_CITY_CANTFLY = 3;
export const MAPSECTYPE_BATTLE_FRONTIER = 4;
export const NUM_MAPSEC_TYPES = 5;

// 1:1 région_map.c:41-48.
const MAP_WIDTH = 28;
const MAP_HEIGHT = 15;
const MAPCURSOR_X_MIN = 1;
const MAPCURSOR_Y_MIN = 2;
const MAPCURSOR_X_MAX = MAPCURSOR_X_MIN + MAP_WIDTH - 1;
const MAPCURSOR_Y_MAX = MAPCURSOR_Y_MIN + MAP_HEIGHT - 1;
const FLYDESTICON_RED_OUTLINE = 6;

// 1:1 region_map.c:50-54 `enum { TAG_CURSOR, TAG_PLAYER_ICON, TAG_FLY_ICON }`.
const TAG_CURSOR = 0;
const TAG_PLAYER_ICON = 1;
const TAG_FLY_ICON = 2;

// 1:1 region_map.c:56-61 — fenêtres de la fly map.
const WIN_MAPSEC_NAME = 0;
const WIN_MAPSEC_NAME_TALL = 1;
const WIN_FLY_TO_WHERE = 2;

/** 1:1 `struct MultiNameFlyDest` (region_map.c:63). */
interface MultiNameFlyDest {
  readonly name: { readonly [i: number]: string };
  mapSecId: number;
  flag: number;
}

/** 1:1 `struct RegionMap` (include/region_map.h:28-81). mapSecName = buffer GBA
 *  (EOS 0xFF — AddTextPrinterParameterized/StringCopy 1:1 scannent l'EOS). */
export interface RegionMap {
  mapSecId: number;
  mapSecType: number;
  posWithinMapSec: number;
  mapSecName: Uint8Array;              // u8[20]
  inputCallback: (() => number) | null;
  cursorSprite: DecompSprite | null;
  playerIconSprite: DecompSprite | null;
  bg2x: number;
  bg2y: number;
  bg2pa: number;
  bg2pc: number;
  bg2pb: number;
  bg2pd: number;
  unk_03c: number;
  unk_040: number;
  unk_044: number;
  unk_048: number;
  unk_04c: number;
  unk_050: number;
  cursorPosX: number;
  cursorPosY: number;
  cursorTileTag: number;
  cursorPaletteTag: number;
  scrollX: number;
  scrollY: number;
  unk_060: number;
  unk_062: number;
  zoomedCursorPosX: number;
  zoomedCursorPosY: number;
  zoomedCursorDeltaY: number;
  zoomedCursorDeltaX: number;
  zoomedCursorMovementFrameCounter: number;
  unk_06e: number;
  playerIconTileTag: number;
  playerIconPaletteTag: number;
  playerIconSpritePosX: number;
  playerIconSpritePosY: number;
  zoomed: boolean;
  initStep: number;
  cursorMovementFrameCounter: number;
  cursorDeltaX: number;
  cursorDeltaY: number;
  needUpdateVideoRegs: boolean;
  blinkPlayerIcon: boolean;
  playerIsInCave: boolean;
  bgNum: number;
  charBaseIdx: number;
  mapBaseIdx: number;
  bgManaged: boolean;
  cursorSmallImage: Uint8Array;        // u8[0x100]
  cursorLargeImage: Uint8Array;        // u8[0x600]
}

/** 1:1 `static EWRAM_DATA struct RegionMap *sRegionMap = NULL` (region_map.c:70).
 *  NULL jusqu'à InitRegionMapData (accès avant init = crash, comme le déref C). */
let sRegionMap: RegionMap = null as unknown as RegionMap;

/** 1:1 struct anonyme sFlyMap (region_map.c:72-80). */
interface FlyMapStruct {
  callback: (() => void) | null;
  state: number;
  mapSecId: number;
  regionMap: RegionMap;
  tileBuffer: Uint8Array;   // u8[0x1c0]
  nameBuffer: Uint8Array;   // u8[0x26] — jamais lu (1:1 commentaire décomp)
  choseFlyLocation: boolean;
}
let sFlyMap: FlyMapStruct = null as unknown as FlyMapStruct;

// 1:1 region_map.c:82.
let sDrawFlyDestTextWindow = false;

// ─── mapSec string ⇄ numérique (frontière moteur : gMapHeader.regionMapSectionId
//     est une clé 'MAPSEC_*' dans ce port ; le décomp indexe par nombre) ───────────
let _mapsecIdToKey: Map<number, string> | null = null;
let _mapsecKeyToId: Map<string, number> | null = null;
function _buildMapsecMaps(): void {
  if (_mapsecIdToKey && _mapsecKeyToId) return;
  _mapsecIdToKey = new Map();
  _mapsecKeyToId = new Map();
  for (const [k, v] of Object.entries(_MAPSEC as Record<string, unknown>)) {
    if (typeof v === 'number' && k.startsWith('MAPSEC_')) {
      if (!_mapsecIdToKey.has(v)) _mapsecIdToKey.set(v, k);
      _mapsecKeyToId.set(k, v);
    }
  }
}
/** mapSec NUMÉRIQUE → clé 'MAPSEC_*' (reverse-lookup des constantes). Le décomp
 *  indexe `gRegionMapEntries[mapSecId]` par nombre ; notre table FR est par clé. */
function _mapsecKeyFromId(id: number): string {
  _buildMapsecMaps();
  return _mapsecIdToKey!.get(id) ?? `MAPSEC_${id}`;
}
/** clé 'MAPSEC_*' (ou nombre déjà numérique) → mapSec NUMÉRIQUE 1:1 décomp. */
function _mapsecIdFromKey(key: string | number): number {
  if (typeof key === 'number') return key;
  _buildMapsecMaps();
  return _mapsecKeyToId!.get(String(key)) ?? MAPSEC_NONE;
}

// ─── INCBIN (region_map.c:119-128) — ADAPTATION MOTEUR : chargés async par
//     PrefetchRegionMapAssets() (précédent pokenav_main_menu._pokenavLoadHeaderGraphics),
//     lus sync après gate. Les noms *LZ sont gardés 1:1 mais le contenu est DÉJÀ
//     décompressé (l'extraction sert les sources du décomp, pas les blobs ROM). ───────
let sRegionMapCursorPal: Uint16Array | null = null;            // cursor.pal (.gbapal)
let sRegionMapCursorSmallGfxLZ: Uint8Array | null = null;      // cursor_small.png (.4bpp.lz)
let sRegionMapCursorLargeGfxLZ: Uint8Array | null = null;      // cursor_large.png (.4bpp.lz)
let sRegionMapBg_Pal: Uint16Array | null = null;               // map.pal (.gbapal)
let sRegionMapBg_GfxLZ: Uint8Array | null = null;              // map.png (.8bpp.lz)
let sRegionMapBg_TilemapLZ: Uint16Array | null = null;         // map.bin (.lz — affine u8→u16/entrée)
let sRegionMapPlayerIcon_BrendanPal: Uint16Array | null = null; // brendan_icon.png (.gbapal)
let sRegionMapPlayerIcon_BrendanGfx: Uint8Array | null = null;  // brendan_icon.png (.4bpp)
let sRegionMapPlayerIcon_MayPal: Uint16Array | null = null;     // may_icon.png (.gbapal)
let sRegionMapPlayerIcon_MayGfx: Uint8Array | null = null;      // may_icon.png (.4bpp)

// ─── #include "data/region_map/region_map_layout.h" + region_map_entries.h (region_map.c:130-131)
//     Data servie par region_map_data.json (extraction existante — cf. region-map-data.ts). ───────
/** 1:1 `struct RegionMapLocation` (include/region_map.h:83). `name` = string FR ROM
 *  (la résolution byte-GBA passe par GetMapName/encodeOwText comme avant). */
export interface RegionMapLocation {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}
/** 1:1 `gRegionMapEntries[]` (data/region_map/region_map_entries.h) — indexé par mapSecId. */
export let gRegionMapEntries: RegionMapLocation[] = [];
/** 1:1 `sRegionMap_MapSectionLayout[MAP_HEIGHT][MAP_WIDTH]` (region_map_layout.h) — aplati. */
let sRegionMap_MapSectionLayout: Uint16Array | null = null;

// ─── Prefetch (Règle 3 : gate synchrone + HURLE si échec ; jamais d'await dans les CB2) ───
let _assetsState: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';
let _assetsError: unknown = null;
let _screamThrottle = 0;

/** Précharge TOUS les assets/data de region_map.c (idempotent). À appeler dès CB2_InitPokeNav
 *  (pattern PrefetchMatchCallAssets pokenav.ts:129) — le décomp a tout en ROM. */
export function PrefetchRegionMapAssets(): void {
  if (_assetsState !== 'idle') return;
  _assetsState = 'loading';
  const base = '/decomp/em/pokenav/region_map';
  void (async () => {
    try {
      const [cursorPal, cursorSmall, cursorLarge, bgPal, bgGfx, bgTilemap,
        brendanPal, brendanGfx, mayPal, mayGfx, dataJson] = await Promise.all([
        loadGbaPal(`${base}/cursor.pal`),
        loadTileBin(`${base}/cursor_small.png`, 4),
        loadTileBin(`${base}/cursor_large.png`, 4),
        loadGbaPal(`${base}/map.pal`),
        loadTileBin(`${base}/map.png`, 8),
        loadAffineTilemapBin(`${base}/map.bin`),
        extractPngPlte(`${base}/brendan_icon.png`),
        loadTileBin(`${base}/brendan_icon.png`, 4),
        extractPngPlte(`${base}/may_icon.png`),
        loadTileBin(`${base}/may_icon.png`, 4),
        fetch('/decomp/em/region_map/region_map_data.json').then((r) => {
          if (!r.ok) throw new Error(`region_map_data.json : HTTP ${r.status}`);
          return r.json() as Promise<{ entries: Array<{ id: string; name: string; x: number; y: number; width: number; height: number }>; layout: string[][] }>;
        }),
      ]);
      sRegionMapCursorPal = cursorPal;
      sRegionMapCursorSmallGfxLZ = cursorSmall;
      sRegionMapCursorLargeGfxLZ = cursorLarge;
      sRegionMapBg_Pal = bgPal;
      sRegionMapBg_GfxLZ = bgGfx;
      sRegionMapBg_TilemapLZ = bgTilemap;
      sRegionMapPlayerIcon_BrendanPal = brendanPal;
      sRegionMapPlayerIcon_BrendanGfx = brendanGfx;
      sRegionMapPlayerIcon_MayPal = mayPal;
      sRegionMapPlayerIcon_MayGfx = mayGfx;
      // gRegionMapEntries : JSON (clés string) → tableau indexé par mapSecId numérique 1:1.
      _buildMapsecMaps();
      const entries: RegionMapLocation[] = new Array(MAPSEC_NONE)
        .fill(null)
        .map(() => ({ x: 0, y: 0, width: 1, height: 1, name: '' }));
      for (const e of dataJson.entries) {
        const id = _mapsecKeyToId!.get(e.id);
        if (id !== undefined && id < MAPSEC_NONE) entries[id] = { x: e.x, y: e.y, width: e.width, height: e.height, name: e.name };
      }
      gRegionMapEntries = entries;
      // Layout 15×28 string → numérique.
      const layout = new Uint16Array(MAP_HEIGHT * MAP_WIDTH).fill(MAPSEC_NONE);
      for (let y = 0; y < MAP_HEIGHT; y++)
        for (let x = 0; x < MAP_WIDTH; x++)
          layout[y * MAP_WIDTH + x] = _mapsecKeyToId!.get(dataJson.layout[y]?.[x] ?? '') ?? MAPSEC_NONE;
      sRegionMap_MapSectionLayout = layout;
      _assetsState = 'ready';
    } catch (e) {
      _assetsState = 'failed';
      _assetsError = e;
      console.error('[region_map] PrefetchRegionMapAssets ÉCHOUÉ — la carte de Hoenn ne pourra pas s\'ouvrir :', e);
    }
  })();
}

/** true quand les INCBIN + data de region_map.c sont chargés (gate des call-sites sync). */
export function RegionMapAssetsReady(): boolean {
  return _assetsState === 'ready';
}

/** HURLE (throttlé) tant qu'un gate poll un prefetch échoué (Règle 3). */
function _screamIfAssetsFailed(): void {
  if (_assetsState === 'failed' && (_screamThrottle++ % 60) === 0)
    console.error('[region_map] gate en attente d\'assets dont le fetch a ÉCHOUÉ (voir erreur plus haut) :', _assetsError);
  if (_assetsState === 'idle') {
    // Un appelant est arrivé sans prefetch : lancer maintenant (récupérable, mais log).
    console.error('[region_map] LoadRegionMapGfx/CB2 atteint sans PrefetchRegionMapAssets préalable — lancement tardif.');
    PrefetchRegionMapAssets();
  }
}

// ─── Data 1:1 (region_map.c:133-209) ────────────────────────────────────────

/** 1:1 `sRegionMap_SpecialPlaceLocations[][2]` (region_map.c:133-163).
 *  Politique préproc repo : vanilla FR (BUGFIX ABSENT) → UNDERWATER_125 pointe ROUTE_129
 *  (bug ROM d'affichage du nom en plongée Route 125, conservé 1:1). */
const sRegionMap_SpecialPlaceLocations: ReadonlyArray<readonly [number, number]> = [
  [MAPSEC_UNDERWATER_105, MAPSEC_ROUTE_105],
  [MAPSEC_UNDERWATER_124, MAPSEC_ROUTE_124],
  [MAPSEC_UNDERWATER_125, MAPSEC_ROUTE_129], // BUG ROM (BUGFIX absent) : nom ROUTE 129 affiché en plongée sur la 125
  [MAPSEC_UNDERWATER_126, MAPSEC_ROUTE_126],
  [MAPSEC_UNDERWATER_127, MAPSEC_ROUTE_127],
  [MAPSEC_UNDERWATER_128, MAPSEC_ROUTE_128],
  [MAPSEC_UNDERWATER_129, MAPSEC_ROUTE_129],
  [MAPSEC_UNDERWATER_SOOTOPOLIS, MAPSEC_SOOTOPOLIS_CITY],
  [MAPSEC_UNDERWATER_SEAFLOOR_CAVERN, MAPSEC_ROUTE_128],
  [MAPSEC_AQUA_HIDEOUT, MAPSEC_LILYCOVE_CITY],
  [MAPSEC_AQUA_HIDEOUT_OLD, MAPSEC_LILYCOVE_CITY],
  [MAPSEC_MAGMA_HIDEOUT, MAPSEC_ROUTE_112],
  [MAPSEC_UNDERWATER_SEALED_CHAMBER, MAPSEC_ROUTE_134],
  [MAPSEC_PETALBURG_WOODS, MAPSEC_ROUTE_104],
  [MAPSEC_JAGGED_PASS, MAPSEC_ROUTE_112],
  [MAPSEC_MT_PYRE, MAPSEC_ROUTE_122],
  [MAPSEC_SKY_PILLAR, MAPSEC_ROUTE_131],
  [MAPSEC_MIRAGE_TOWER, MAPSEC_ROUTE_111],
  [MAPSEC_TRAINER_HILL, MAPSEC_ROUTE_111],
  [MAPSEC_DESERT_UNDERPASS, MAPSEC_ROUTE_114],
  [MAPSEC_ALTERING_CAVE, MAPSEC_ROUTE_103],
  [MAPSEC_ARTISAN_CAVE, MAPSEC_ROUTE_103],
  [MAPSEC_ABANDONED_SHIP, MAPSEC_ROUTE_108],
  [MAPSEC_NONE, MAPSEC_NONE],
];

/** 1:1 `sMarineCaveMapSecIds[]` (region_map.c:165-170). */
const sMarineCaveMapSecIds: readonly number[] = [
  MAPSEC_MARINE_CAVE,
  MAPSEC_UNDERWATER_MARINE_CAVE,
  MAPSEC_UNDERWATER_MARINE_CAVE,
];

/** 1:1 `sTerraOrMarineCaveMapSecIds[ABNORMAL_WEATHER_LOCATIONS]` (region_map.c:172-190)
 *  — indices désignés [ABNORMAL_WEATHER_* - 1] = contigus 0..15 dans l'ordre du .c. */
const sTerraOrMarineCaveMapSecIds: readonly number[] = [
  MAPSEC_ROUTE_114, // [ABNORMAL_WEATHER_ROUTE_114_NORTH - 1]
  MAPSEC_ROUTE_114, // [ABNORMAL_WEATHER_ROUTE_114_SOUTH - 1]
  MAPSEC_ROUTE_115, // [ABNORMAL_WEATHER_ROUTE_115_WEST  - 1]
  MAPSEC_ROUTE_115, // [ABNORMAL_WEATHER_ROUTE_115_EAST  - 1]
  MAPSEC_ROUTE_116, // [ABNORMAL_WEATHER_ROUTE_116_NORTH - 1]
  MAPSEC_ROUTE_116, // [ABNORMAL_WEATHER_ROUTE_116_SOUTH - 1]
  MAPSEC_ROUTE_118, // [ABNORMAL_WEATHER_ROUTE_118_EAST  - 1]
  MAPSEC_ROUTE_118, // [ABNORMAL_WEATHER_ROUTE_118_WEST  - 1]
  MAPSEC_ROUTE_105, // [ABNORMAL_WEATHER_ROUTE_105_NORTH - 1]
  MAPSEC_ROUTE_105, // [ABNORMAL_WEATHER_ROUTE_105_SOUTH - 1]
  MAPSEC_ROUTE_125, // [ABNORMAL_WEATHER_ROUTE_125_WEST  - 1]
  MAPSEC_ROUTE_125, // [ABNORMAL_WEATHER_ROUTE_125_EAST  - 1]
  MAPSEC_ROUTE_127, // [ABNORMAL_WEATHER_ROUTE_127_NORTH - 1]
  MAPSEC_ROUTE_127, // [ABNORMAL_WEATHER_ROUTE_127_SOUTH - 1]
  MAPSEC_ROUTE_129, // [ABNORMAL_WEATHER_ROUTE_129_WEST  - 1]
  MAPSEC_ROUTE_129, // [ABNORMAL_WEATHER_ROUTE_129_EAST  - 1]
];

/** 1:1 `sMarineCaveLocationCoords[MARINE_CAVE_LOCATIONS]` (region_map.c:194-204)
 *  — indices MARINE_CAVE_COORD(x) contigus 0..7 dans l'ordre du .c. */
const sMarineCaveLocationCoords: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: 10 },  // ROUTE_105_NORTH
  { x: 0, y: 12 },  // ROUTE_105_SOUTH
  { x: 24, y: 3 },  // ROUTE_125_WEST
  { x: 25, y: 4 },  // ROUTE_125_EAST
  { x: 25, y: 6 },  // ROUTE_127_NORTH
  { x: 25, y: 7 },  // ROUTE_127_SOUTH
  { x: 24, y: 10 }, // ROUTE_129_WEST
  { x: 24, y: 10 }, // ROUTE_129_EAST
];

/** 1:1 `sMapSecAquaHideoutOld[]` (region_map.c:206-209). */
const sMapSecAquaHideoutOld: readonly number[] = [
  MAPSEC_AQUA_HIDEOUT_OLD,
];

// ─── Sprites data 1:1 (region_map.c:211-281) ────────────────────────────────

/** 1:1 `sRegionMapCursorOam` (region_map.c:211). */
const sRegionMapCursorOam = {
  shape: 0 as const, /* SPRITE_SHAPE(16x16) */
  size: 1 as const,  /* SPRITE_SIZE(16x16) */
  priority: 1,
};

/** 1:1 `sRegionMapCursorAnim1` (region_map.c:218). */
const sRegionMapCursorAnim1: AnimCmd[] = [
  ANIMCMD_FRAME(0, 20),
  ANIMCMD_FRAME(4, 20),
  ANIMCMD_JUMP(0),
];

/** 1:1 `sRegionMapCursorAnim2` (region_map.c:225). */
const sRegionMapCursorAnim2: AnimCmd[] = [
  ANIMCMD_FRAME(0, 10),
  ANIMCMD_FRAME(16, 10),
  ANIMCMD_FRAME(32, 10),
  ANIMCMD_FRAME(16, 10),
  ANIMCMD_JUMP(0),
];

/** 1:1 `sRegionMapCursorAnimTable` (region_map.c:234). */
const sRegionMapCursorAnimTable: AnimCmd[][] = [
  sRegionMapCursorAnim1,
  sRegionMapCursorAnim2,
];

/** 1:1 `sRegionMapCursorSpritePalette` (region_map.c:240) — .data lazily (asset async). */
const sRegionMapCursorSpritePalette = {
  get data(): Uint16Array | null { return sRegionMapCursorPal; },
  tag: TAG_CURSOR,
};

/** 1:1 `sRegionMapCursorSpriteTemplate` (region_map.c:246). */
const sRegionMapCursorSpriteTemplate = {
  tileTag: TAG_CURSOR,
  paletteTag: TAG_CURSOR,
  oam: sRegionMapCursorOam,
  anims: sRegionMapCursorAnimTable,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCB_CursorMapFull,
};

/** 1:1 `sRegionMapPlayerIconOam` (region_map.c:257). */
const sRegionMapPlayerIconOam = {
  shape: 0 as const, /* SPRITE_SHAPE(16x16) */
  size: 1 as const,  /* SPRITE_SIZE(16x16) */
  priority: 2,
};

/** 1:1 `sRegionMapPlayerIconAnim1` (region_map.c:264). */
const sRegionMapPlayerIconAnim1: AnimCmd[] = [
  ANIMCMD_FRAME(0, 5),
  ANIMCMD_END,
];

/** 1:1 `sRegionMapPlayerIconAnimTable` (region_map.c:270). */
const sRegionMapPlayerIconAnimTable: AnimCmd[][] = [
  sRegionMapPlayerIconAnim1,
];

/** 1:1 `sMapSecIdsOffMap[]` (region_map.c:276-281) — event islands hors carte. */
const sMapSecIdsOffMap: readonly number[] = [
  MAPSEC_BIRTH_ISLAND,
  MAPSEC_FARAWAY_ISLAND,
  MAPSEC_NAVEL_ROCK,
];

// ─── INCBIN fly map (region_map.c:283-287) — mêmes règles que plus haut ───────
let sRegionMapFramePal: Uint16Array | null = null;      // frame.png (.gbapal)
let sRegionMapFrameGfxLZ: Uint8Array | null = null;     // frame.png (.4bpp.lz)
let sRegionMapFrameTilemapLZ: Uint16Array | null = null; // frame.bin (.lz)
let sFlyTargetIcons_Pal: Uint16Array | null = null;     // fly_target_icons.png (.gbapal)
let sFlyTargetIcons_Gfx: Uint8Array | null = null;      // fly_target_icons.png (.4bpp.lz)
let _flyAssetsState: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';

/** Précharge les assets de la FLY MAP (frame + icônes) — séparé du prefetch Pokénav
 *  (la fly map est INERTE tant que CB2_OpenFlyMap n'est pas câblé). Idempotent. */
export function PrefetchFlyMapAssets(): void {
  if (_flyAssetsState !== 'idle') return;
  _flyAssetsState = 'loading';
  const base = '/decomp/em/pokenav/region_map';
  void (async () => {
    try {
      const [framePal, frameGfx, frameTilemap, flyPal, flyGfx] = await Promise.all([
        extractPngPlte(`${base}/frame.png`),
        loadTileBin(`${base}/frame.png`, 4),
        loadAffineTilemapBin(`${base}/frame.bin`), // NB : frame.bin = tilemap TEXT u16 ? cf. rapport
        extractPngPlte(`${base}/fly_target_icons.png`),
        loadTileBin(`${base}/fly_target_icons.png`, 4),
      ]);
      sRegionMapFramePal = framePal;
      sRegionMapFrameGfxLZ = frameGfx;
      sRegionMapFrameTilemapLZ = frameTilemap;
      sFlyTargetIcons_Pal = flyPal;
      sFlyTargetIcons_Gfx = flyGfx;
      _flyAssetsState = 'ready';
    } catch (e) {
      _flyAssetsState = 'failed';
      console.error('[region_map] PrefetchFlyMapAssets ÉCHOUÉ :', e);
    }
  })();
}

/** 1:1 `sMapHealLocations[][3]` (region_map.c:289-341) — indexé par mapSecId 0..49
 *  ([groupe, num, heal loc]). ADAPTATION : les heal locations de ce port sont des IDS
 *  STRING (src/heal_location.ts GetHealLocationByName) ; HEAL_LOCATION_NONE → null. */
const sMapHealLocations: ReadonlyArray<readonly [number, number, string | null]> = [
  [MAP_GROUP(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_LITTLEROOT_TOWN), 'HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F'], // [MAPSEC_LITTLEROOT_TOWN]
  [MAP_GROUP(MAP_CONSTANTS.MAP_OLDALE_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_OLDALE_TOWN), 'HEAL_LOCATION_OLDALE_TOWN'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_DEWFORD_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_DEWFORD_TOWN), 'HEAL_LOCATION_DEWFORD_TOWN'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_LAVARIDGE_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_LAVARIDGE_TOWN), 'HEAL_LOCATION_LAVARIDGE_TOWN'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_FALLARBOR_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_FALLARBOR_TOWN), 'HEAL_LOCATION_FALLARBOR_TOWN'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_VERDANTURF_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_VERDANTURF_TOWN), 'HEAL_LOCATION_VERDANTURF_TOWN'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_PACIFIDLOG_TOWN), MAP_NUM(MAP_CONSTANTS.MAP_PACIFIDLOG_TOWN), 'HEAL_LOCATION_PACIFIDLOG_TOWN'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_PETALBURG_CITY), MAP_NUM(MAP_CONSTANTS.MAP_PETALBURG_CITY), 'HEAL_LOCATION_PETALBURG_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_SLATEPORT_CITY), MAP_NUM(MAP_CONSTANTS.MAP_SLATEPORT_CITY), 'HEAL_LOCATION_SLATEPORT_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_MAUVILLE_CITY), MAP_NUM(MAP_CONSTANTS.MAP_MAUVILLE_CITY), 'HEAL_LOCATION_MAUVILLE_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_RUSTBORO_CITY), MAP_NUM(MAP_CONSTANTS.MAP_RUSTBORO_CITY), 'HEAL_LOCATION_RUSTBORO_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_FORTREE_CITY), MAP_NUM(MAP_CONSTANTS.MAP_FORTREE_CITY), 'HEAL_LOCATION_FORTREE_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_LILYCOVE_CITY), MAP_NUM(MAP_CONSTANTS.MAP_LILYCOVE_CITY), 'HEAL_LOCATION_LILYCOVE_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_MOSSDEEP_CITY), MAP_NUM(MAP_CONSTANTS.MAP_MOSSDEEP_CITY), 'HEAL_LOCATION_MOSSDEEP_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_SOOTOPOLIS_CITY), MAP_NUM(MAP_CONSTANTS.MAP_SOOTOPOLIS_CITY), 'HEAL_LOCATION_SOOTOPOLIS_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_EVER_GRANDE_CITY), MAP_NUM(MAP_CONSTANTS.MAP_EVER_GRANDE_CITY), 'HEAL_LOCATION_EVER_GRANDE_CITY'],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE101), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE101), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE102), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE102), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE103), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE103), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE104), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE104), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE105), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE105), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE106), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE106), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE107), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE107), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE108), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE108), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE109), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE109), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE110), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE110), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE111), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE111), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE112), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE112), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE113), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE113), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE114), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE114), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE115), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE115), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE116), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE116), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE117), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE117), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE118), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE118), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE119), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE119), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE120), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE120), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE121), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE121), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE122), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE122), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE123), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE123), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE124), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE124), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE125), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE125), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE126), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE126), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE127), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE127), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE128), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE128), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE129), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE129), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE130), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE130), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE131), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE131), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE132), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE132), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE133), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE133), null],
  [MAP_GROUP(MAP_CONSTANTS.MAP_ROUTE134), MAP_NUM(MAP_CONSTANTS.MAP_ROUTE134), null],
];

/** 1:1 `sEverGrandeCityNames[]` (region_map.c:343) — LAZY (getString au call, jamais au module-init). */
const sEverGrandeCityNames: { readonly [i: number]: string } = {
  get 0(): string { return getString('gText_PokemonLeague'); },
  get 1(): string { return getString('gText_PokemonCenter'); },
};

/** 1:1 `sMultiNameFlyDestinations[]` (region_map.c:349). */
const sMultiNameFlyDestinations: readonly MultiNameFlyDest[] = [
  {
    name: sEverGrandeCityNames,
    mapSecId: MAPSEC_EVER_GRANDE_CITY,
    flag: FLAG_LANDMARK_POKEMON_LEAGUE,
  },
];

/** 1:1 `sFlyMapBgTemplates[]` (region_map.c:358). */
const sFlyMapBgTemplates: BgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 2, paletteMode: 1, priority: 2, baseTile: 0 },
];

/** 1:1 `sFlyMapWindowTemplates[]` (region_map.c:386) — DUMMY_WIN_TEMPLATE terminal omis
 *  (InitWindows du port itère le tableau, pas un terminateur). */
const sFlyMapWindowTemplates: WindowTemplate[] = [
  { bg: 0, tilemapLeft: 17, tilemapTop: 17, width: 12, height: 2, paletteNum: 15, baseBlock: 0x01 }, // WIN_MAPSEC_NAME
  { bg: 0, tilemapLeft: 17, tilemapTop: 15, width: 12, height: 4, paletteNum: 15, baseBlock: 0x19 }, // WIN_MAPSEC_NAME_TALL
  { bg: 0, tilemapLeft: 1, tilemapTop: 18, width: 14, height: 2, paletteNum: 15, baseBlock: 0x49 },  // WIN_FLY_TO_WHERE
];

/** 1:1 `sFlyTargetIconsSpritePalette` (region_map.c:418) — .data lazily (asset async). */
const sFlyTargetIconsSpritePalette = {
  get data(): Uint16Array | null { return sFlyTargetIcons_Pal; },
  tag: TAG_FLY_ICON,
};

/** 1:1 `sRedOutlineFlyDestinations[][2]` (region_map.c:424) — [flag, mapSecId]. */
const sRedOutlineFlyDestinations: ReadonlyArray<readonly [number, number]> = [
  [FLAG_LANDMARK_BATTLE_FRONTIER, MAPSEC_BATTLE_FRONTIER],
  [-1, MAPSEC_NONE],
];

/** 1:1 `sFlyDestIcon_OamData` (region_map.c:436). */
const sFlyDestIcon_OamData = {
  shape: 0 as const, /* SPRITE_SHAPE(8x8) */
  size: 0 as const,  /* SPRITE_SIZE(8x8) */
  priority: 2,
};

/** 1:1 `sFlyDestIcon_Anim_*` (region_map.c:443-484). */
const sFlyDestIcon_Anim_8x8CanFly: AnimCmd[] = [ANIMCMD_FRAME(0, 5), ANIMCMD_END];
const sFlyDestIcon_Anim_16x8CanFly: AnimCmd[] = [ANIMCMD_FRAME(1, 5), ANIMCMD_END];
const sFlyDestIcon_Anim_8x16CanFly: AnimCmd[] = [ANIMCMD_FRAME(3, 5), ANIMCMD_END];
const sFlyDestIcon_Anim_8x8CantFly: AnimCmd[] = [ANIMCMD_FRAME(5, 5), ANIMCMD_END];
const sFlyDestIcon_Anim_16x8CantFly: AnimCmd[] = [ANIMCMD_FRAME(6, 5), ANIMCMD_END];
const sFlyDestIcon_Anim_8x16CantFly: AnimCmd[] = [ANIMCMD_FRAME(8, 5), ANIMCMD_END];
/** Only used by Battle Frontier (1:1 commentaire décomp). */
const sFlyDestIcon_Anim_RedOutline: AnimCmd[] = [ANIMCMD_FRAME(10, 5), ANIMCMD_END];

/** 1:1 `sFlyDestIcon_Anims[]` (region_map.c:486) — indices SPRITE_SHAPE(8x8)=0/(16x8)=1/(8x16)=2. */
const sFlyDestIcon_Anims: AnimCmd[][] = [
  sFlyDestIcon_Anim_8x8CanFly,   // [SPRITE_SHAPE(8x8)]
  sFlyDestIcon_Anim_16x8CanFly,  // [SPRITE_SHAPE(16x8)]
  sFlyDestIcon_Anim_8x16CanFly,  // [SPRITE_SHAPE(8x16)]
  sFlyDestIcon_Anim_8x8CantFly,  // [SPRITE_SHAPE(8x8)  + 3]
  sFlyDestIcon_Anim_16x8CantFly, // [SPRITE_SHAPE(16x8) + 3]
  sFlyDestIcon_Anim_8x16CantFly, // [SPRITE_SHAPE(8x16) + 3]
  sFlyDestIcon_Anim_RedOutline,  // [FLYDESTICON_RED_OUTLINE]
];

/** 1:1 `sFlyDestIconSpriteTemplate` (region_map.c:497). */
const sFlyDestIconSpriteTemplate = {
  tileTag: TAG_FLY_ICON,
  paletteTag: TAG_FLY_ICON,
  oam: sFlyDestIcon_OamData,
  anims: sFlyDestIcon_Anims,
  images: null,
  affineAnims: gDummySpriteAffineAnimTable,
  callback: SpriteCallbackDummy,
};

// ─── Fonctions 1:1 (ordre du .c) ─────────────────────────────────────────────

/** 1:1 `void InitRegionMap(struct RegionMap *regionMap, bool8 zoomed)` (region_map.c:508).
 *  ⚠ boucle SYNCHRONE sur LoadRegionMapGfx : l'appelant (CB2_OpenFlyMap case 4) DOIT être
 *  passé par le gate assets (case 0) avant — sinon le gate interne ferait boucler. */
export function InitRegionMap(regionMap: RegionMap, zoomed: boolean): void {
  InitRegionMapData(regionMap, null, zoomed);
  while (LoadRegionMapGfx());
}

/** 1:1 `void InitRegionMapData(struct RegionMap *regionMap, const struct BgTemplate *template, bool8 zoomed)` (region_map.c:514). */
export function InitRegionMapData(regionMap: RegionMap, template: BgTemplate | null, zoomed: boolean): void {
  // ADAPTATION MOTEUR : la ROM caste un bloc Alloc() brut vers struct RegionMap (les tableaux
  // embarqués région_map.h:32/79/80 font partie du bloc) ; AllocSubstruct du port rend un objet
  // vide → matérialiser les buffers embarqués une fois (précédent : les substructs pokenav
  // remplis champ à champ, pokenav_resources.ts:9-11).
  if (!(regionMap.mapSecName instanceof Uint8Array)) regionMap.mapSecName = new Uint8Array(20);
  if (!(regionMap.cursorSmallImage instanceof Uint8Array)) regionMap.cursorSmallImage = new Uint8Array(0x100);
  if (!(regionMap.cursorLargeImage instanceof Uint8Array)) regionMap.cursorLargeImage = new Uint8Array(0x600);
  sRegionMap = regionMap;
  sRegionMap.initStep = 0;
  sRegionMap.zoomed = zoomed;
  sRegionMap.inputCallback = zoomed === true ? ProcessRegionMapInput_Zoomed : ProcessRegionMapInput_Full;
  if (template != null) {
    sRegionMap.bgNum = template.bg;
    sRegionMap.charBaseIdx = template.charBaseIndex;
    sRegionMap.mapBaseIdx = template.mapBaseIndex;
    sRegionMap.bgManaged = true;
  } else {
    sRegionMap.bgNum = 2;
    sRegionMap.charBaseIdx = 2;
    sRegionMap.mapBaseIdx = 28;
    sRegionMap.bgManaged = false;
  }
}

/** 1:1 `void ShowRegionMapForPokedexAreaScreen(struct RegionMap *regionMap)` (region_map.c:536). */
export function ShowRegionMapForPokedexAreaScreen(regionMap: RegionMap): void {
  sRegionMap = regionMap;
  InitMapBasedOnPlayerLocation();
  sRegionMap.playerIconSpritePosX = sRegionMap.cursorPosX;
  sRegionMap.playerIconSpritePosY = sRegionMap.cursorPosY;
}

/** 1:1 `bool8 LoadRegionMapGfx(void)` (region_map.c:544-619). TRUE = encore occupé.
 *  GATE ASSETS en tête (adaptation moteur, précédent pokenav_main_menu.ts:464) : tant que
 *  le prefetch n'a pas fini, on rend TRUE (l'appelant boucle/PAUSE 1:1) et on HURLE si échec. */
export function LoadRegionMapGfx(): boolean {
  if (!RegionMapAssetsReady()) {
    _screamIfAssetsFailed();
    return true;
  }
  switch (sRegionMap.initStep) {
    case 0:
      if (sRegionMap.bgManaged) {
        DecompressAndCopyTileDataToVram(sRegionMap.bgNum, sRegionMapBg_GfxLZ, 0, 0, 0);
      } else {
        // 1:1 `LZ77UnCompVram(sRegionMapBg_GfxLZ, BG_CHAR_ADDR(2))` — écriture directe des
        // tuiles brutes en VRAM (précédent : pokenav_main_menu.ts:55 rt.gba.vram.set).
        const rt = getRuntime();
        if (rt && sRegionMapBg_GfxLZ) rt.gba.vram.set(sRegionMapBg_GfxLZ.subarray(0, Math.min(sRegionMapBg_GfxLZ.length, rt.gba.vram.length - 0x8000)), 0x8000 /* BG_CHAR_ADDR(2) */);
      }
      break;
    case 1:
      if (sRegionMap.bgManaged) {
        if (!FreeTempTileDataBuffersIfPossible())
          DecompressAndCopyTileDataToVram(sRegionMap.bgNum, sRegionMapBg_TilemapLZ, 0, 0, 1);
      } else {
        // 1:1 `LZ77UnCompVram(sRegionMapBg_TilemapLZ, BG_SCREEN_ADDR(28))` — écriture directe
        // au mapBase 28 (même adaptation que DecompressAndCopyTileDataToVram mode 1 ci-dessous ;
        // branche atteinte par la fly map/pokédex, non câblées — INERTE).
        const rt = getRuntime();
        if (rt && sRegionMapBg_TilemapLZ) {
          const bytes = new Uint8Array(sRegionMapBg_TilemapLZ.buffer, sRegionMapBg_TilemapLZ.byteOffset, sRegionMapBg_TilemapLZ.byteLength);
          rt.gba.vram.set(bytes.subarray(0, Math.min(bytes.length, rt.gba.vram.length - 28 * 0x800)), 28 * 0x800 /* BG_SCREEN_ADDR(28) */);
        }
      }
      break;
    case 2:
      if (!FreeTempTileDataBuffersIfPossible())
        LoadPalette(sRegionMapBg_Pal!, BG_PLTT_ID(7), 3 * PLTT_SIZE_4BPP);
      break;
    case 3:
      LZ77UnCompWram(sRegionMapCursorSmallGfxLZ, sRegionMap.cursorSmallImage);
      break;
    case 4:
      LZ77UnCompWram(sRegionMapCursorLargeGfxLZ, sRegionMap.cursorLargeImage);
      break;
    case 5:
      InitMapBasedOnPlayerLocation();
      sRegionMap.playerIconSpritePosX = sRegionMap.cursorPosX;
      sRegionMap.playerIconSpritePosY = sRegionMap.cursorPosY;
      sRegionMap.mapSecId = CorrectSpecialMapSecId_Internal(sRegionMap.mapSecId);
      sRegionMap.mapSecType = GetMapsecType(sRegionMap.mapSecId);
      GetMapName(sRegionMap.mapSecName, sRegionMap.mapSecId, MAP_NAME_LENGTH);
      break;
    case 6:
      if (sRegionMap.zoomed === false) {
        CalcZoomScrollParams(0, 0, 0, 0, 0x100, 0x100, 0);
      } else {
        sRegionMap.scrollX = sRegionMap.cursorPosX * 8 - 0x34;
        sRegionMap.scrollY = sRegionMap.cursorPosY * 8 - 0x44;
        sRegionMap.zoomedCursorPosX = sRegionMap.cursorPosX;
        sRegionMap.zoomedCursorPosY = sRegionMap.cursorPosY;
        CalcZoomScrollParams(sRegionMap.scrollX, sRegionMap.scrollY, 0x38, 0x48, 0x80, 0x80, 0);
      }
      break;
    case 7:
      GetPositionOfCursorWithinMapSec();
      UpdateRegionMapVideoRegs();
      sRegionMap.cursorSprite = null;
      sRegionMap.playerIconSprite = null;
      sRegionMap.cursorMovementFrameCounter = 0;
      sRegionMap.blinkPlayerIcon = false;
      if (sRegionMap.bgManaged) {
        SetBgAttribute(sRegionMap.bgNum, BG_ATTR_SCREENSIZE, 2);
        SetBgAttribute(sRegionMap.bgNum, BG_ATTR_CHARBASEINDEX, sRegionMap.charBaseIdx);
        SetBgAttribute(sRegionMap.bgNum, BG_ATTR_MAPBASEINDEX, sRegionMap.mapBaseIdx);
        SetBgAttribute(sRegionMap.bgNum, BG_ATTR_WRAPAROUND, 1);
        SetBgAttribute(sRegionMap.bgNum, BG_ATTR_PALETTEMODE, 1);
      }
      sRegionMap.initStep++;
      return false;
    default:
      return false;
  }
  sRegionMap.initStep++;
  return true;
}

/** 1:1 `void BlendRegionMap(u16 color, u32 coeff)` (region_map.c:621). */
export function BlendRegionMap(color: number, coeff: number): void {
  BlendPalettes(0x380, coeff, color);
  // 1:1 `CpuCopy16(&gPlttBufferFaded[BG_PLTT_ID(7)], &gPlttBufferUnfaded[BG_PLTT_ID(7)], 3*PLTT_SIZE_4BPP)`
  // — gPlttBuffer* sont des Proxies (lire .get(i), écrire .set(i,v) — précédent
  // CopyPaletteIntoBufferUnfaded pokenav_main_menu.ts:558 + MEMORY gPlttBuffer*).
  const rt = getRuntime();
  if (!rt) return;
  const base = BG_PLTT_ID(7);
  const n = (3 * PLTT_SIZE_4BPP) >> 1; // octets → entrées u16
  for (let i = 0; i < n; i++)
    rt.gPlttBufferUnfaded.set(base + i, rt.gPlttBufferFaded.get(base + i));
}

/** 1:1 `void FreeRegionMapIconResources(void)` (region_map.c:627). */
export function FreeRegionMapIconResources(): void {
  if (sRegionMap.cursorSprite != null) {
    DestroySprite(sRegionMap.cursorSprite);
    FreeSpriteTilesByTag(sRegionMap.cursorTileTag);
    FreeSpritePaletteByTag(sRegionMap.cursorPaletteTag);
  }
  if (sRegionMap.playerIconSprite != null) {
    DestroySprite(sRegionMap.playerIconSprite);
    FreeSpriteTilesByTag(sRegionMap.playerIconTileTag);
    FreeSpritePaletteByTag(sRegionMap.playerIconPaletteTag);
  }
}

/** 1:1 `u8 DoRegionMapInputCallback(void)` (region_map.c:643). */
export function DoRegionMapInputCallback(): number {
  return sRegionMap.inputCallback!();
}

/** 1:1 `static u8 ProcessRegionMapInput_Full(void)` (region_map.c:648). */
function ProcessRegionMapInput_Full(): number {
  let input = MAP_INPUT_NONE;
  sRegionMap.cursorDeltaX = 0;
  sRegionMap.cursorDeltaY = 0;
  if (JOY_HELD(DPAD_UP) && sRegionMap.cursorPosY > MAPCURSOR_Y_MIN) {
    sRegionMap.cursorDeltaY = -1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_HELD(DPAD_DOWN) && sRegionMap.cursorPosY < MAPCURSOR_Y_MAX) {
    sRegionMap.cursorDeltaY = +1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_HELD(DPAD_LEFT) && sRegionMap.cursorPosX > MAPCURSOR_X_MIN) {
    sRegionMap.cursorDeltaX = -1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_HELD(DPAD_RIGHT) && sRegionMap.cursorPosX < MAPCURSOR_X_MAX) {
    sRegionMap.cursorDeltaX = +1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_NEW(A_BUTTON)) {
    input = MAP_INPUT_A_BUTTON;
  } else if (JOY_NEW(B_BUTTON)) {
    input = MAP_INPUT_B_BUTTON;
  }
  if (input === MAP_INPUT_MOVE_START) {
    sRegionMap.cursorMovementFrameCounter = 4;
    sRegionMap.inputCallback = MoveRegionMapCursor_Full;
  }
  return input;
}

/** 1:1 `static u8 MoveRegionMapCursor_Full(void)` (region_map.c:691). */
function MoveRegionMapCursor_Full(): number {
  if (sRegionMap.cursorMovementFrameCounter !== 0)
    return MAP_INPUT_MOVE_CONT;

  if (sRegionMap.cursorDeltaX > 0) {
    sRegionMap.cursorPosX++;
  }
  if (sRegionMap.cursorDeltaX < 0) {
    sRegionMap.cursorPosX--;
  }
  if (sRegionMap.cursorDeltaY > 0) {
    sRegionMap.cursorPosY++;
  }
  if (sRegionMap.cursorDeltaY < 0) {
    sRegionMap.cursorPosY--;
  }

  const mapSecId = GetMapSecIdAt(sRegionMap.cursorPosX, sRegionMap.cursorPosY);
  sRegionMap.mapSecType = GetMapsecType(mapSecId);
  if (mapSecId !== sRegionMap.mapSecId) {
    sRegionMap.mapSecId = mapSecId;
    GetMapName(sRegionMap.mapSecName, sRegionMap.mapSecId, MAP_NAME_LENGTH);
  }
  GetPositionOfCursorWithinMapSec();
  sRegionMap.inputCallback = ProcessRegionMapInput_Full;
  return MAP_INPUT_MOVE_END;
}

/** 1:1 `static u8 ProcessRegionMapInput_Zoomed(void)` (region_map.c:727). */
function ProcessRegionMapInput_Zoomed(): number {
  let input = MAP_INPUT_NONE;
  sRegionMap.zoomedCursorDeltaX = 0;
  sRegionMap.zoomedCursorDeltaY = 0;
  if (JOY_HELD(DPAD_UP) && sRegionMap.scrollY > -0x34) {
    sRegionMap.zoomedCursorDeltaY = -1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_HELD(DPAD_DOWN) && sRegionMap.scrollY < 0x3c) {
    sRegionMap.zoomedCursorDeltaY = +1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_HELD(DPAD_LEFT) && sRegionMap.scrollX > -0x2c) {
    sRegionMap.zoomedCursorDeltaX = -1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_HELD(DPAD_RIGHT) && sRegionMap.scrollX < 0xac) {
    sRegionMap.zoomedCursorDeltaX = +1;
    input = MAP_INPUT_MOVE_START;
  }
  if (JOY_NEW(A_BUTTON)) {
    input = MAP_INPUT_A_BUTTON;
  }
  if (JOY_NEW(B_BUTTON)) {
    input = MAP_INPUT_B_BUTTON;
  }
  if (input === MAP_INPUT_MOVE_START) {
    sRegionMap.inputCallback = MoveRegionMapCursor_Zoomed;
    sRegionMap.zoomedCursorMovementFrameCounter = 0;
  }
  return input;
}

/** 1:1 `static u8 MoveRegionMapCursor_Zoomed(void)` (region_map.c:770). */
function MoveRegionMapCursor_Zoomed(): number {
  sRegionMap.scrollY += sRegionMap.zoomedCursorDeltaY;
  sRegionMap.scrollX += sRegionMap.zoomedCursorDeltaX;
  RegionMap_SetBG2XAndBG2Y(sRegionMap.scrollX, sRegionMap.scrollY);
  sRegionMap.zoomedCursorMovementFrameCounter++;
  if (sRegionMap.zoomedCursorMovementFrameCounter === 8) {
    // 1:1 division C tronquée vers zéro ((x)/8 avec x ≥ -0x2c+0x2c=0 : | 0 suffit).
    const x = (((sRegionMap.scrollX + 0x2c) / 8) | 0) + 1;
    const y = (((sRegionMap.scrollY + 0x34) / 8) | 0) + 2;
    if (x !== sRegionMap.zoomedCursorPosX || y !== sRegionMap.zoomedCursorPosY) {
      sRegionMap.zoomedCursorPosX = x;
      sRegionMap.zoomedCursorPosY = y;
      const mapSecId = GetMapSecIdAt(x, y);
      sRegionMap.mapSecType = GetMapsecType(mapSecId);
      if (mapSecId !== sRegionMap.mapSecId) {
        sRegionMap.mapSecId = mapSecId;
        GetMapName(sRegionMap.mapSecName, sRegionMap.mapSecId, MAP_NAME_LENGTH);
      }
      GetPositionOfCursorWithinMapSec();
    }
    sRegionMap.zoomedCursorMovementFrameCounter = 0;
    sRegionMap.inputCallback = ProcessRegionMapInput_Zoomed;
    return MAP_INPUT_MOVE_END;
  }
  return MAP_INPUT_MOVE_CONT;
}

/** 1:1 `void SetRegionMapDataForZoom(void)` (region_map.c:804). */
export function SetRegionMapDataForZoom(): void {
  if (sRegionMap.zoomed === false) {
    sRegionMap.scrollY = 0;
    sRegionMap.scrollX = 0;
    sRegionMap.unk_040 = 0;
    sRegionMap.unk_03c = 0;
    sRegionMap.unk_060 = sRegionMap.cursorPosX * 8 - 0x34;
    sRegionMap.unk_062 = sRegionMap.cursorPosY * 8 - 0x44;
    sRegionMap.unk_044 = ((sRegionMap.unk_060 << 8) / 16) | 0;
    sRegionMap.unk_048 = ((sRegionMap.unk_062 << 8) / 16) | 0;
    sRegionMap.zoomedCursorPosX = sRegionMap.cursorPosX;
    sRegionMap.zoomedCursorPosY = sRegionMap.cursorPosY;
    sRegionMap.unk_04c = 0x10000;
    sRegionMap.unk_050 = -0x800;
  } else {
    sRegionMap.unk_03c = sRegionMap.scrollX * 0x100;
    sRegionMap.unk_040 = sRegionMap.scrollY * 0x100;
    sRegionMap.unk_060 = 0;
    sRegionMap.unk_062 = 0;
    sRegionMap.unk_044 = -((sRegionMap.unk_03c / 16) | 0);
    sRegionMap.unk_048 = -((sRegionMap.unk_040 / 16) | 0);
    sRegionMap.cursorPosX = sRegionMap.zoomedCursorPosX;
    sRegionMap.cursorPosY = sRegionMap.zoomedCursorPosY;
    sRegionMap.unk_04c = 0x8000;
    sRegionMap.unk_050 = 0x800;
  }
  sRegionMap.unk_06e = 0;
  FreeRegionMapCursorSprite();
  HideRegionMapPlayerIcon();
}

/** 1:1 `bool8 UpdateRegionMapZoom(void)` (region_map.c:839). */
export function UpdateRegionMapZoom(): boolean {
  let retVal: boolean;

  if (sRegionMap.unk_06e >= 16) {
    return false;
  }
  sRegionMap.unk_06e++;
  if (sRegionMap.unk_06e === 16) {
    sRegionMap.unk_044 = 0;
    sRegionMap.unk_048 = 0;
    sRegionMap.scrollX = sRegionMap.unk_060;
    sRegionMap.scrollY = sRegionMap.unk_062;
    sRegionMap.unk_04c = (sRegionMap.zoomed === false) ? (128 << 8) : (256 << 8);
    sRegionMap.zoomed = !sRegionMap.zoomed;
    sRegionMap.inputCallback = (sRegionMap.zoomed === false) ? ProcessRegionMapInput_Full : ProcessRegionMapInput_Zoomed;
    CreateRegionMapCursor(sRegionMap.cursorTileTag, sRegionMap.cursorPaletteTag);
    UnhideRegionMapPlayerIcon();
    retVal = false;
  } else {
    sRegionMap.unk_03c += sRegionMap.unk_044;
    sRegionMap.unk_040 += sRegionMap.unk_048;
    sRegionMap.scrollX = sRegionMap.unk_03c >> 8;
    sRegionMap.scrollY = sRegionMap.unk_040 >> 8;
    sRegionMap.unk_04c += sRegionMap.unk_050;
    if ((sRegionMap.unk_044 < 0 && sRegionMap.scrollX < sRegionMap.unk_060) || (sRegionMap.unk_044 > 0 && sRegionMap.scrollX > sRegionMap.unk_060)) {
      sRegionMap.scrollX = sRegionMap.unk_060;
      sRegionMap.unk_044 = 0;
    }
    if ((sRegionMap.unk_048 < 0 && sRegionMap.scrollY < sRegionMap.unk_062) || (sRegionMap.unk_048 > 0 && sRegionMap.scrollY > sRegionMap.unk_062)) {
      sRegionMap.scrollY = sRegionMap.unk_062;
      sRegionMap.unk_048 = 0;
    }
    if (sRegionMap.zoomed === false) {
      if (sRegionMap.unk_04c < (128 << 8)) {
        sRegionMap.unk_04c = (128 << 8);
        sRegionMap.unk_050 = 0;
      }
    } else {
      if (sRegionMap.unk_04c > (256 << 8)) {
        sRegionMap.unk_04c = (256 << 8);
        sRegionMap.unk_050 = 0;
      }
    }
    retVal = true;
  }
  CalcZoomScrollParams(sRegionMap.scrollX, sRegionMap.scrollY, 0x38, 0x48, sRegionMap.unk_04c >> 8, sRegionMap.unk_04c >> 8, 0);
  return retVal;
}

/** 1:1 `static void CalcZoomScrollParams(s16 scrollX, s16 scrollY, s16 c, s16 d, u16 e, u16 f, u8 rotation)` (region_map.c:900). */
function CalcZoomScrollParams(scrollX: number, scrollY: number, c: number, d: number, e: number, f: number, rotation: number): void {
  sRegionMap.bg2pa = (e * gSineTable[rotation + 64]) >> 8;
  sRegionMap.bg2pc = (e * -gSineTable[rotation]) >> 8;
  sRegionMap.bg2pb = (f * gSineTable[rotation]) >> 8;
  sRegionMap.bg2pd = (f * gSineTable[rotation + 64]) >> 8;

  const var1 = (scrollX << 8) + (c << 8);
  const var2 = d * sRegionMap.bg2pb + sRegionMap.bg2pa * c;
  sRegionMap.bg2x = var1 - var2;

  const var3 = (scrollY << 8) + (d << 8);
  const var4 = sRegionMap.bg2pd * d + sRegionMap.bg2pc * c;
  sRegionMap.bg2y = var3 - var4;

  sRegionMap.needUpdateVideoRegs = true;
}

/** 1:1 `static void RegionMap_SetBG2XAndBG2Y(s16 x, s16 y)` (region_map.c:923). */
function RegionMap_SetBG2XAndBG2Y(x: number, y: number): void {
  sRegionMap.bg2x = (x << 8) + 0x1c00;
  sRegionMap.bg2y = (y << 8) + 0x2400;
  sRegionMap.needUpdateVideoRegs = true;
}

/** 1:1 `void UpdateRegionMapVideoRegs(void)` (region_map.c:930). */
export function UpdateRegionMapVideoRegs(): void {
  if (sRegionMap.needUpdateVideoRegs) {
    SetGpuReg(REG_OFFSET_BG2PA, sRegionMap.bg2pa);
    SetGpuReg(REG_OFFSET_BG2PB, sRegionMap.bg2pb);
    SetGpuReg(REG_OFFSET_BG2PC, sRegionMap.bg2pc);
    SetGpuReg(REG_OFFSET_BG2PD, sRegionMap.bg2pd);
    SetGpuReg(REG_OFFSET_BG2X_L, sRegionMap.bg2x);
    SetGpuReg(REG_OFFSET_BG2X_H, sRegionMap.bg2x >> 16);
    SetGpuReg(REG_OFFSET_BG2Y_L, sRegionMap.bg2y);
    SetGpuReg(REG_OFFSET_BG2Y_H, sRegionMap.bg2y >> 16);
    sRegionMap.needUpdateVideoRegs = false;
  }
}

/** 1:1 `void PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs(s16 x, s16 y)` (region_map.c:946). */
export function PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs(x: number, y: number): void {
  CalcZoomScrollParams(x, y, 0x38, 0x48, 0x100, 0x100, 0);
  UpdateRegionMapVideoRegs();
  if (sRegionMap.playerIconSprite != null) {
    sRegionMap.playerIconSprite.x2 = -x;
    sRegionMap.playerIconSprite.y2 = -y;
  }
}

/** 1:1 `static mapsec_u16_t GetMapSecIdAt(u16 x, u16 y)` (region_map.c:957). */
function GetMapSecIdAt(x: number, y: number): number {
  if (y < MAPCURSOR_Y_MIN || y > MAPCURSOR_Y_MAX || x < MAPCURSOR_X_MIN || x > MAPCURSOR_X_MAX) {
    return MAPSEC_NONE;
  }
  y -= MAPCURSOR_Y_MIN;
  x -= MAPCURSOR_X_MIN;
  if (!sRegionMap_MapSectionLayout) return MAPSEC_NONE; // gate assets (HURLE déjà au prefetch)
  return sRegionMap_MapSectionLayout[y * MAP_WIDTH + x];
}

/** 1:1 `static void InitMapBasedOnPlayerLocation(void)` (region_map.c:968-1121). */
function InitMapBasedOnPlayerLocation(): void {
  let mapHeader: { regionMapSectionId: string | number; mapLayout: { width: number; height: number } | null } | null;
  let mapWidth = 0;
  let mapHeight = 0;
  let x = 0;
  let y = 0;
  let dimensionScale = 0;

  if (gSaveBlock1Ptr.location.mapGroup === MAP_GROUP(MAP_CONSTANTS.MAP_SS_TIDAL_CORRIDOR)
    && (gSaveBlock1Ptr.location.mapNum === MAP_NUM(MAP_CONSTANTS.MAP_SS_TIDAL_CORRIDOR)
      || gSaveBlock1Ptr.location.mapNum === MAP_NUM(MAP_CONSTANTS.MAP_SS_TIDAL_LOWER_DECK)
      || gSaveBlock1Ptr.location.mapNum === MAP_NUM(MAP_CONSTANTS.MAP_SS_TIDAL_ROOMS))) {
    RegionMap_InitializeStateBasedOnSSTidalLocation();
    return;
  }

  switch (GetMapTypeByGroupAndId(gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum)) {
    default:
    case MAP_TYPE_TOWN:
    case MAP_TYPE_CITY:
    case MAP_TYPE_ROUTE:
    case MAP_TYPE_UNDERWATER:
    case MAP_TYPE_OCEAN_ROUTE:
      sRegionMap.mapSecId = _mapsecIdFromKey(gMapHeader?.regionMapSectionId ?? MAPSEC_NONE);
      sRegionMap.playerIsInCave = false;
      mapWidth = gMapHeader?.mapLayout?.width ?? 1;
      mapHeight = gMapHeader?.mapLayout?.height ?? 1;
      x = gSaveBlock1Ptr.pos.x;
      y = gSaveBlock1Ptr.pos.y;
      if (sRegionMap.mapSecId === MAPSEC_UNDERWATER_SEAFLOOR_CAVERN || sRegionMap.mapSecId === MAPSEC_UNDERWATER_MARINE_CAVE)
        sRegionMap.playerIsInCave = true;
      break;
    case MAP_TYPE_UNDERGROUND:
    case MAP_TYPE_UNKNOWN:
      if (gMapHeader?.allowEscaping) {
        mapHeader = Overworld_GetMapHeaderByGroupAndId(gSaveBlock1Ptr.escapeWarp.mapGroup, gSaveBlock1Ptr.escapeWarp.mapNum);
        sRegionMap.mapSecId = _mapsecIdFromKey(mapHeader?.regionMapSectionId ?? MAPSEC_NONE);
        sRegionMap.playerIsInCave = true;
        mapWidth = mapHeader?.mapLayout?.width ?? 1;
        mapHeight = mapHeader?.mapLayout?.height ?? 1;
        x = gSaveBlock1Ptr.escapeWarp.x;
        y = gSaveBlock1Ptr.escapeWarp.y;
      } else {
        sRegionMap.mapSecId = _mapsecIdFromKey(gMapHeader?.regionMapSectionId ?? MAPSEC_NONE);
        sRegionMap.playerIsInCave = true;
        mapWidth = 1;
        mapHeight = 1;
        x = 1;
        y = 1;
      }
      break;
    case MAP_TYPE_SECRET_BASE:
      mapHeader = Overworld_GetMapHeaderByGroupAndId(gSaveBlock1Ptr.dynamicWarp.mapGroup & 0xFFFF, gSaveBlock1Ptr.dynamicWarp.mapNum & 0xFFFF);
      sRegionMap.mapSecId = _mapsecIdFromKey(mapHeader?.regionMapSectionId ?? MAPSEC_NONE);
      sRegionMap.playerIsInCave = true;
      mapWidth = mapHeader?.mapLayout?.width ?? 1;
      mapHeight = mapHeader?.mapLayout?.height ?? 1;
      x = gSaveBlock1Ptr.dynamicWarp.x;
      y = gSaveBlock1Ptr.dynamicWarp.y;
      break;
    case MAP_TYPE_INDOOR: {
      sRegionMap.mapSecId = _mapsecIdFromKey(gMapHeader?.regionMapSectionId ?? MAPSEC_NONE);
      let warp;
      if (sRegionMap.mapSecId !== MAPSEC_DYNAMIC) {
        warp = gSaveBlock1Ptr.escapeWarp;
        mapHeader = Overworld_GetMapHeaderByGroupAndId(warp.mapGroup, warp.mapNum);
      } else {
        warp = gSaveBlock1Ptr.dynamicWarp;
        mapHeader = Overworld_GetMapHeaderByGroupAndId(warp.mapGroup, warp.mapNum);
        sRegionMap.mapSecId = _mapsecIdFromKey(mapHeader?.regionMapSectionId ?? MAPSEC_NONE);
      }

      if (IsPlayerInAquaHideout(sRegionMap.mapSecId))
        sRegionMap.playerIsInCave = true;
      else
        sRegionMap.playerIsInCave = false;

      mapWidth = mapHeader?.mapLayout?.width ?? 1;
      mapHeight = mapHeader?.mapLayout?.height ?? 1;
      x = warp.x;
      y = warp.y;
      break;
    }
  }

  const xOnMap = x;

  const entry = gRegionMapEntries[sRegionMap.mapSecId] ?? { x: 0, y: 0, width: 1, height: 1, name: '' };
  dimensionScale = (mapWidth / entry.width) | 0;
  if (dimensionScale === 0) {
    dimensionScale = 1;
  }
  x = (x / dimensionScale) | 0;
  if (x >= entry.width) {
    x = entry.width - 1;
  }

  dimensionScale = (mapHeight / entry.height) | 0;
  if (dimensionScale === 0) {
    dimensionScale = 1;
  }
  y = (y / dimensionScale) | 0;
  if (y >= entry.height) {
    y = entry.height - 1;
  }

  switch (sRegionMap.mapSecId) {
    case MAPSEC_ROUTE_114:
      if (y !== 0)
        x = 0;
      break;
    case MAPSEC_ROUTE_126:
    case MAPSEC_UNDERWATER_126:
      x = 0;
      if (gSaveBlock1Ptr.pos.x > 32)
        x++;
      if (gSaveBlock1Ptr.pos.x > 51)
        x++;

      y = 0;
      if (gSaveBlock1Ptr.pos.y > 37)
        y++;
      if (gSaveBlock1Ptr.pos.y > 56)
        y++;
      break;
    case MAPSEC_ROUTE_121:
      x = 0;
      if (xOnMap > 14)
        x++;
      if (xOnMap > 28)
        x++;
      if (xOnMap > 54)
        x++;
      break;
    case MAPSEC_UNDERWATER_MARINE_CAVE: {
      // 1:1 `GetMarineCaveCoords(&sRegionMap->cursorPosX, &sRegionMap->cursorPosY)` —
      // out-params C → retour objet (convention repo pointer-walks → refs).
      const coords = GetMarineCaveCoords();
      sRegionMap.cursorPosX = coords.x;
      sRegionMap.cursorPosY = coords.y;
      return;
    }
  }
  sRegionMap.cursorPosX = entry.x + x + MAPCURSOR_X_MIN;
  sRegionMap.cursorPosY = entry.y + y + MAPCURSOR_Y_MIN;
}

// 1:1 include/constants/field_specials.h SS_TIDAL_LOCATION_* (miroir include/constants/field_specials.ts).
const SS_TIDAL_LOCATION_CURRENTS = 0;
const SS_TIDAL_LOCATION_SLATEPORT = 1;
const SS_TIDAL_LOCATION_LILYCOVE = 2;
const SS_TIDAL_LOCATION_ROUTE124 = 3;
const SS_TIDAL_LOCATION_ROUTE131 = 4;
void SS_TIDAL_LOCATION_CURRENTS;

/** field_specials.c `GetSSTidalLocation(&mapGroup, &mapNum, &x, &y)` : PAS ENCORE PORTÉ dans le
 *  repo (grep 2026-07-16) — sentinelle wireTodo (throw à l'appel ; atteignable UNIQUEMENT si le
 *  joueur ouvre la carte À BORD du S.S. Tidal, hors périmètre solo actuel — cf. rapport). */
const GetSSTidalLocation: (...args: unknown[]) => number = __wireTodo('GetSSTidalLocation');

/** 1:1 `static void RegionMap_InitializeStateBasedOnSSTidalLocation(void)` (region_map.c:1123). */
function RegionMap_InitializeStateBasedOnSSTidalLocation(): void {
  let y = 0;
  let x = 0;
  let dimensionScale = 0;
  let mapHeader: { regionMapSectionId: string | number; mapLayout: { width: number; height: number } | null } | null;

  // 1:1 out-params (&mapGroup, &mapNum, &xOnMap, &yOnMap) → objet muté par la sentinelle.
  const out = { mapGroup: 0, mapNum: 0, xOnMap: 0, yOnMap: 0 };
  switch (GetSSTidalLocation(out)) {
    case SS_TIDAL_LOCATION_SLATEPORT:
      sRegionMap.mapSecId = MAPSEC_SLATEPORT_CITY;
      break;
    case SS_TIDAL_LOCATION_LILYCOVE:
      sRegionMap.mapSecId = MAPSEC_LILYCOVE_CITY;
      break;
    case SS_TIDAL_LOCATION_ROUTE124:
      sRegionMap.mapSecId = MAPSEC_ROUTE_124;
      break;
    case SS_TIDAL_LOCATION_ROUTE131:
      sRegionMap.mapSecId = MAPSEC_ROUTE_131;
      break;
    default:
    // case SS_TIDAL_LOCATION_CURRENTS:
    {
      mapHeader = Overworld_GetMapHeaderByGroupAndId(out.mapGroup, out.mapNum);

      sRegionMap.mapSecId = _mapsecIdFromKey(mapHeader?.regionMapSectionId ?? MAPSEC_NONE);
      const entry = gRegionMapEntries[sRegionMap.mapSecId] ?? { x: 0, y: 0, width: 1, height: 1, name: '' };
      dimensionScale = ((mapHeader?.mapLayout?.width ?? 1) / entry.width) | 0;
      if (dimensionScale === 0)
        dimensionScale = 1;
      x = (out.xOnMap / dimensionScale) | 0;
      if (x >= entry.width)
        x = entry.width - 1;

      dimensionScale = ((mapHeader?.mapLayout?.height ?? 1) / entry.height) | 0;
      if (dimensionScale === 0)
        dimensionScale = 1;
      y = (out.yOnMap / dimensionScale) | 0;
      if (y >= entry.height)
        y = entry.height - 1;
      break;
    }
  }
  sRegionMap.playerIsInCave = false;
  const entry2 = gRegionMapEntries[sRegionMap.mapSecId] ?? { x: 0, y: 0, width: 1, height: 1, name: '' };
  sRegionMap.cursorPosX = entry2.x + x + MAPCURSOR_X_MIN;
  sRegionMap.cursorPosY = entry2.y + y + MAPCURSOR_Y_MIN;
}

/** 1:1 `static u8 GetMapsecType(mapsec_u16_t mapSecId)` (region_map.c:1175). */
function GetMapsecType(mapSecId: number): number {
  switch (mapSecId) {
    case MAPSEC_NONE:
      return MAPSECTYPE_NONE;
    case MAPSEC_LITTLEROOT_TOWN:
      return FlagGet(FLAG_VISITED_LITTLEROOT_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_OLDALE_TOWN:
      return FlagGet(FLAG_VISITED_OLDALE_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_DEWFORD_TOWN:
      return FlagGet(FLAG_VISITED_DEWFORD_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_LAVARIDGE_TOWN:
      return FlagGet(FLAG_VISITED_LAVARIDGE_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_FALLARBOR_TOWN:
      return FlagGet(FLAG_VISITED_FALLARBOR_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_VERDANTURF_TOWN:
      return FlagGet(FLAG_VISITED_VERDANTURF_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_PACIFIDLOG_TOWN:
      return FlagGet(FLAG_VISITED_PACIFIDLOG_TOWN) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_PETALBURG_CITY:
      return FlagGet(FLAG_VISITED_PETALBURG_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_SLATEPORT_CITY:
      return FlagGet(FLAG_VISITED_SLATEPORT_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_MAUVILLE_CITY:
      return FlagGet(FLAG_VISITED_MAUVILLE_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_RUSTBORO_CITY:
      return FlagGet(FLAG_VISITED_RUSTBORO_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_FORTREE_CITY:
      return FlagGet(FLAG_VISITED_FORTREE_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_LILYCOVE_CITY:
      return FlagGet(FLAG_VISITED_LILYCOVE_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_MOSSDEEP_CITY:
      return FlagGet(FLAG_VISITED_MOSSDEEP_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_SOOTOPOLIS_CITY:
      return FlagGet(FLAG_VISITED_SOOTOPOLIS_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_EVER_GRANDE_CITY:
      return FlagGet(FLAG_VISITED_EVER_GRANDE_CITY) ? MAPSECTYPE_CITY_CANFLY : MAPSECTYPE_CITY_CANTFLY;
    case MAPSEC_BATTLE_FRONTIER:
      return FlagGet(FLAG_LANDMARK_BATTLE_FRONTIER) ? MAPSECTYPE_BATTLE_FRONTIER : MAPSECTYPE_NONE;
    case MAPSEC_SOUTHERN_ISLAND:
      return FlagGet(FLAG_LANDMARK_SOUTHERN_ISLAND) ? MAPSECTYPE_ROUTE : MAPSECTYPE_NONE;
    default:
      return MAPSECTYPE_ROUTE;
  }
}

/** 1:1 `mapsec_u16_t GetRegionMapSecIdAt(u16 x, u16 y)` (region_map.c:1222). */
export function GetRegionMapSecIdAt(x: number, y: number): number {
  return GetMapSecIdAt(x, y);
}

/** 1:1 `static mapsec_u16_t CorrectSpecialMapSecId_Internal(mapsec_u16_t mapSecId)` (region_map.c:1227). */
function CorrectSpecialMapSecId_Internal(mapSecId: number): number {
  for (let i = 0; i < sMarineCaveMapSecIds.length; i++) {
    if (sMarineCaveMapSecIds[i] === mapSecId) {
      return GetTerraOrMarineCaveMapSecId();
    }
  }
  for (let i = 0; sRegionMap_SpecialPlaceLocations[i][0] !== MAPSEC_NONE; i++) {
    if (sRegionMap_SpecialPlaceLocations[i][0] === mapSecId) {
      return sRegionMap_SpecialPlaceLocations[i][1];
    }
  }
  return mapSecId;
}

/** 1:1 `static mapsec_u16_t GetTerraOrMarineCaveMapSecId(void)` (region_map.c:1248). */
function GetTerraOrMarineCaveMapSecId(): number {
  let idx = VarGet(VAR_ABNORMAL_WEATHER_LOCATION) - 1;

  if (idx < 0 || idx > ABNORMAL_WEATHER_LOCATIONS - 1)
    idx = 0;

  return sTerraOrMarineCaveMapSecIds[idx];
}

/** 1:1 `static void GetMarineCaveCoords(u16 *x, u16 *y)` (region_map.c:1260) —
 *  out-params C → retour {x, y} (convention repo pointer-walks → refs). */
function GetMarineCaveCoords(): { x: number; y: number } {
  let idx = VarGet(VAR_ABNORMAL_WEATHER_LOCATION);
  if (idx < MARINE_CAVE_LOCATIONS_START || idx > ABNORMAL_WEATHER_LOCATIONS) {
    idx = MARINE_CAVE_LOCATIONS_START;
  }
  idx -= MARINE_CAVE_LOCATIONS_START;

  return {
    x: sMarineCaveLocationCoords[idx].x + MAPCURSOR_X_MIN,
    y: sMarineCaveLocationCoords[idx].y + MAPCURSOR_Y_MIN,
  };
}

/** 1:1 `static bool32 IsPlayerInAquaHideout(mapsec_u8_t mapSecId)` (region_map.c:1277) —
 *  toujours FALSE en Émeraude (1:1 commentaire décomp : mapsec absent du layout). */
function IsPlayerInAquaHideout(mapSecId: number): boolean {
  for (let i = 0; i < sMapSecAquaHideoutOld.length; i++) {
    if (sMapSecAquaHideoutOld[i] === mapSecId)
      return true;
  }
  return false;
}

/** 1:1 `mapsec_u16_t CorrectSpecialMapSecId(mapsec_u16_t mapSecId)` (region_map.c:1289). */
export function CorrectSpecialMapSecId(mapSecId: number): number {
  return CorrectSpecialMapSecId_Internal(mapSecId);
}

/** 1:1 `static void GetPositionOfCursorWithinMapSec(void)` (region_map.c:1294). */
function GetPositionOfCursorWithinMapSec(): void {
  let x: number;
  let y: number;
  let posWithinMapSec: number;

  if (sRegionMap.mapSecId === MAPSEC_NONE) {
    sRegionMap.posWithinMapSec = 0;
    return;
  }
  if (!sRegionMap.zoomed) {
    x = sRegionMap.cursorPosX;
    y = sRegionMap.cursorPosY;
  } else {
    x = sRegionMap.zoomedCursorPosX;
    y = sRegionMap.zoomedCursorPosY;
  }
  posWithinMapSec = 0;
  while (1) {
    if (x <= MAPCURSOR_X_MIN) {
      if (RegionMap_IsMapSecIdInNextRow(y)) {
        y--;
        x = MAPCURSOR_X_MAX + 1;
      } else {
        break;
      }
    } else {
      x--;
      if (GetMapSecIdAt(x, y) === sRegionMap.mapSecId) {
        posWithinMapSec++;
      }
    }
  }
  sRegionMap.posWithinMapSec = posWithinMapSec;
}

/** 1:1 `static bool8 RegionMap_IsMapSecIdInNextRow(u16 y)` (region_map.c:1342). */
function RegionMap_IsMapSecIdInNextRow(y: number): boolean {
  if (y-- === 0) {
    return false;
  }
  for (let x = MAPCURSOR_X_MIN; x <= MAPCURSOR_X_MAX; x++) {
    if (GetMapSecIdAt(x, y) === sRegionMap.mapSecId) {
      return true;
    }
  }
  return false;
}

/** 1:1 `static void SpriteCB_CursorMapFull(struct Sprite *sprite)` (region_map.c:1360). */
function SpriteCB_CursorMapFull(sprite: DecompSprite): void {
  if (sRegionMap.cursorMovementFrameCounter !== 0) {
    sprite.x += 2 * sRegionMap.cursorDeltaX;
    sprite.y += 2 * sRegionMap.cursorDeltaY;
    sRegionMap.cursorMovementFrameCounter--;
  }
}

/** 1:1 `static void SpriteCB_CursorMapZoomed(struct Sprite *sprite)` (region_map.c:1370) — vide. */
function SpriteCB_CursorMapZoomed(_sprite: DecompSprite): void {
}

/** 1:1 `void CreateRegionMapCursor(u16 tileTag, u16 paletteTag)` (region_map.c:1375). */
export function CreateRegionMapCursor(tileTag: number, paletteTag: number): void {
  const palette = { data: sRegionMapCursorSpritePalette.data, tag: sRegionMapCursorSpritePalette.tag as number };
  const template = { ...sRegionMapCursorSpriteTemplate } as {
    tileTag: number; paletteTag: number; oam: typeof sRegionMapCursorOam;
    anims: AnimCmd[][]; images: null; affineAnims: unknown;
    callback: (sprite: DecompSprite) => void;
  };
  const sheet: { data: Uint8Array; size: number; tag: number } = { data: null as unknown as Uint8Array, size: 0, tag: tileTag };
  template.tileTag = tileTag;
  sRegionMap.cursorTileTag = tileTag;
  palette.tag = paletteTag;
  template.paletteTag = paletteTag;
  sRegionMap.cursorPaletteTag = paletteTag;
  if (!sRegionMap.zoomed) {
    sheet.data = sRegionMap.cursorSmallImage;
    sheet.size = 0x100; // sizeof(sRegionMap->cursorSmallImage)
    template.callback = SpriteCB_CursorMapFull;
  } else {
    sheet.data = sRegionMap.cursorLargeImage;
    sheet.size = 0x600; // sizeof(sRegionMap->cursorLargeImage)
    template.callback = SpriteCB_CursorMapZoomed;
  }
  LoadSpriteSheet(sheet);
  LoadSpritePalette(palette as { data: Uint16Array; tag: number });
  const spriteId = CreateSprite(template as never, 56, 72, 0);
  if (spriteId !== MAX_SPRITES) {
    const sprite = gSprites[spriteId]!;
    sRegionMap.cursorSprite = sprite;
    if (sRegionMap.zoomed === true) {
      _spriteOamSizeSet(sprite, 2); /* sprite->oam.size = SPRITE_SIZE(32x32) */
      sprite.x -= 8;
      sprite.y -= 8;
      StartSpriteAnim(sprite as never, 1);
    } else {
      _spriteOamSizeSet(sprite, 1); /* sprite->oam.size = SPRITE_SIZE(16x16) */
      sprite.x = 8 * sRegionMap.cursorPosX + 4;
      sprite.y = 8 * sRegionMap.cursorPosY + 4;
    }
    sprite.data[1] = 2;
    sprite.data[2] = OBJ_PLTT_ID(IndexOfSpritePaletteTag(paletteTag)) + 1;
    sprite.data[3] = 1; // TRUE
  }
}

/** 1:1 `static void FreeRegionMapCursorSprite(void)` (region_map.c:1427). */
function FreeRegionMapCursorSprite(): void {
  if (sRegionMap.cursorSprite != null) {
    DestroySprite(sRegionMap.cursorSprite);
    FreeSpriteTilesByTag(sRegionMap.cursorTileTag);
    FreeSpritePaletteByTag(sRegionMap.cursorPaletteTag);
  }
}

/** 1:1 `static void UNUSED SetUnkCursorSpriteData(void)` (region_map.c:1437). */
function SetUnkCursorSpriteData(): void {
  sRegionMap.cursorSprite!.data[3] = 1; // TRUE
}
void SetUnkCursorSpriteData;

/** 1:1 `static void UNUSED ClearUnkCursorSpriteData(void)` (region_map.c:1442). */
function ClearUnkCursorSpriteData(): void {
  sRegionMap.cursorSprite!.data[3] = 0; // FALSE
}
void ClearUnkCursorSpriteData;

/** 1:1 `void CreateRegionMapPlayerIcon(u16 tileTag, u16 paletteTag)` (region_map.c:1447). */
export function CreateRegionMapPlayerIcon(tileTag: number, paletteTag: number): void {
  const sheet = { data: sRegionMapPlayerIcon_BrendanGfx as Uint8Array, size: 0x80, tag: tileTag };
  const palette = { data: sRegionMapPlayerIcon_BrendanPal as Uint16Array, tag: paletteTag };
  const template = {
    tileTag, paletteTag, oam: sRegionMapPlayerIconOam, anims: sRegionMapPlayerIconAnimTable,
    images: null, affineAnims: gDummySpriteAffineAnimTable, callback: SpriteCallbackDummy,
  };

  if (IsEventIslandMapSecId(_mapsecIdFromKey(gMapHeader?.regionMapSectionId ?? MAPSEC_NONE))) {
    sRegionMap.playerIconSprite = null;
    return;
  }
  if (gSaveBlock2Ptr.playerGender === FEMALE) {
    sheet.data = sRegionMapPlayerIcon_MayGfx as Uint8Array;
    palette.data = sRegionMapPlayerIcon_MayPal as Uint16Array;
  }
  if (!sheet.data || !palette.data) {
    // Gate assets (Règle 3) : prefetch pas fini — icône joueur absente ce cycle, HURLE.
    console.error('[region_map] CreateRegionMapPlayerIcon : gfx joueur pas chargés (prefetch en cours ?)');
    sRegionMap.playerIconSprite = null;
    return;
  }
  LoadSpriteSheet(sheet);
  LoadSpritePalette(palette);
  const spriteId = CreateSprite(template as never, 0, 0, 1);
  const sprite = gSprites[spriteId] ?? null;
  sRegionMap.playerIconSprite = sprite;
  if (!sprite) return; // garde moteur (CreateSprite plein — le décomp indexe gSprites[64] hors-bornes)
  if (!sRegionMap.zoomed) {
    sprite.x = sRegionMap.playerIconSpritePosX * 8 + 4;
    sprite.y = sRegionMap.playerIconSpritePosY * 8 + 4;
    sprite.callback = SpriteCB_PlayerIconMapFull as never;
  } else {
    sprite.x = sRegionMap.playerIconSpritePosX * 16 - 0x30;
    sprite.y = sRegionMap.playerIconSpritePosY * 16 - 0x42;
    sprite.callback = SpriteCB_PlayerIconMapZoomed as never;
  }
}

/** 1:1 `static void HideRegionMapPlayerIcon(void)` (region_map.c:1482). */
function HideRegionMapPlayerIcon(): void {
  if (sRegionMap.playerIconSprite != null) {
    sRegionMap.playerIconSprite.invisible = true;
    sRegionMap.playerIconSprite.callback = SpriteCallbackDummy as never;
  }
}

/** 1:1 `static void UnhideRegionMapPlayerIcon(void)` (region_map.c:1491). */
function UnhideRegionMapPlayerIcon(): void {
  if (sRegionMap.playerIconSprite != null) {
    if (sRegionMap.zoomed === true) {
      sRegionMap.playerIconSprite.x = sRegionMap.playerIconSpritePosX * 16 - 0x30;
      sRegionMap.playerIconSprite.y = sRegionMap.playerIconSpritePosY * 16 - 0x42;
      sRegionMap.playerIconSprite.callback = SpriteCB_PlayerIconMapZoomed as never;
      sRegionMap.playerIconSprite.invisible = false;
    } else {
      sRegionMap.playerIconSprite.x = sRegionMap.playerIconSpritePosX * 8 + 4;
      sRegionMap.playerIconSprite.y = sRegionMap.playerIconSpritePosY * 8 + 4;
      sRegionMap.playerIconSprite.x2 = 0;
      sRegionMap.playerIconSprite.y2 = 0;
      sRegionMap.playerIconSprite.callback = SpriteCB_PlayerIconMapFull as never;
      sRegionMap.playerIconSprite.invisible = false;
    }
  }
}

// #define sY data[0] / sX data[1] / sVisible data[2] / sTimer data[7] (region_map.c:1514-1517)

/** 1:1 `static void SpriteCB_PlayerIconMapZoomed(struct Sprite *sprite)` (region_map.c:1519). */
function SpriteCB_PlayerIconMapZoomed(sprite: DecompSprite): void {
  sprite.x2 = -2 * sRegionMap.scrollX;
  sprite.y2 = -2 * sRegionMap.scrollY;
  sprite.data[0] /* sY */ = sprite.y + sprite.y2 + (sprite.centerToCornerVecY ?? 0);
  sprite.data[1] /* sX */ = sprite.x + sprite.x2 + (sprite.centerToCornerVecX ?? 0);
  if (sprite.data[0] < -8 || sprite.data[0] > DISPLAY_HEIGHT + 8 || sprite.data[1] < -8 || sprite.data[1] > DISPLAY_WIDTH + 8)
    sprite.data[2] /* sVisible */ = 0; // FALSE
  else
    sprite.data[2] /* sVisible */ = 1; // TRUE

  if (sprite.data[2] === 1)
    SpriteCB_PlayerIcon(sprite);
  else
    sprite.invisible = true;
}

/** 1:1 `static void SpriteCB_PlayerIconMapFull(struct Sprite *sprite)` (region_map.c:1536). */
function SpriteCB_PlayerIconMapFull(sprite: DecompSprite): void {
  SpriteCB_PlayerIcon(sprite);
}

/** 1:1 `static void SpriteCB_PlayerIcon(struct Sprite *sprite)` (region_map.c:1541). */
function SpriteCB_PlayerIcon(sprite: DecompSprite): void {
  if (sRegionMap.blinkPlayerIcon) {
    if (++sprite.data[7] /* sTimer */ > 16) {
      sprite.data[7] = 0;
      sprite.invisible = sprite.invisible ? false : true;
    }
  } else {
    sprite.invisible = false;
  }
}

/** 1:1 `void TrySetPlayerIconBlink(void)` (region_map.c:1557). */
export function TrySetPlayerIconBlink(): void {
  if (sRegionMap.playerIsInCave)
    sRegionMap.blinkPlayerIcon = true;
}

/** 1:1 décomp `src/region_map.c:1568 GetMapName(dest, regionMapId, padLength)` :
 *    if (regionMapId == MAPSEC_SECRET_BASE) return GetSecretBaseMapName(dest);
 *    else if (regionMapId < MAPSEC_NONE) return StringCopy(dest, gRegionMapEntries[id].name);
 *    else return StringFill(dest, CHAR_SPACE, padLength ?? 18);
 *
 *  Impl PRÉSERVÉE telle quelle (Match Call/tv/summary marchent en jeu) : lookup FR
 *  (map-names-fr) + écriture bytes GBA EOS dans dest. Divergences vs .c notées au
 *  rapport (GetSecretBaseMapName non branché ; retour string ≠ ptr fin). */
export function GetMapName(dest: unknown, regionMapId: number | string, padLength: number = 0): string {
  const key = typeof regionMapId === 'number'
    ? _mapsecKeyFromId(regionMapId) // id décomp (ex. Match Call GetMatchCallMapSec) → clé
    : String(regionMapId);
  let name = getMapNameFr(key) ?? '';
  if (padLength > 0 && name.length < padLength) {
    name = name.padEnd(padLength, ' ');
  }
  // Décomp : `StringCopy(dest, gRegionMapEntries[id].name)` = bytes GBA + EOS.
  // (Avant : charCodeAt = ASCII sans EOS → GetStringWidth/StringCopy 1:1, qui
  // scannent EOS 0xFF, lisaient du garbage → fenêtre localisation Match Call vide.)
  if (dest instanceof Uint8Array) {
    const bytes = encodeOwText(name); // EOS 0xFF ré-ajouté par l'encodeur
    const n = Math.min(bytes.length, dest.length);
    dest.set(bytes.subarray(0, n));
    if (n < dest.length) dest[n] = 0xFF; // garantit l'EOS même si tronqué
  }
  return name;
}

/** 1:1 décomp `src/region_map.c:1601 GetMapNameGeneric(dest, mapSecId)` :
 *    case MAPSEC_DYNAMIC:     return StringCopy(dest, gText_Ferry);      // FR "FERRY"
 *    case MAPSEC_SECRET_BASE: return StringCopy(dest, gText_SecretBase); // FR "BASE SECRETE"
 *    default:                 return GetMapName(dest, mapSecId, 0);
 *  mapSecId = string MAPSEC_* dans notre monde (gMapHeader.regionMapSectionId).
 *  FR sources : strings.c:1097-1099. (Impl PRÉSERVÉE — cf. rapport.) */
export function GetMapNameGeneric(dest: unknown, regionMapId: number | string): string {
  const key = typeof regionMapId === 'number' ? _mapsecKeyFromId(regionMapId) : String(regionMapId);
  if (key === 'MAPSEC_DYNAMIC') return _writeMapNameDest(dest, 'FERRY');
  if (key === 'MAPSEC_SECRET_BASE') return _writeMapNameDest(dest, 'BASE SECRETE');
  return GetMapName(dest, regionMapId, 0);
}

/** 1:1 décomp `src/region_map.c:1614 GetMapNameHandleAquaHideout(dest, mapSecId)` :
 *    if (mapSecId == MAPSEC_AQUA_HIDEOUT_OLD) return StringCopy(dest, gText_Hideout); // FR "PLANQUE"
 *    else return GetMapNameGeneric(dest, mapSecId);
 *  Utilisé par le Mémo Dresseur du summary screen (BufferMonTrainerMemo). (Impl PRÉSERVÉE.) */
export function GetMapNameHandleAquaHideout(dest: unknown, regionMapId: number | string): string {
  const key = typeof regionMapId === 'number' ? _mapsecKeyFromId(regionMapId) : String(regionMapId);
  if (key === 'MAPSEC_AQUA_HIDEOUT_OLD') return _writeMapNameDest(dest, 'PLANQUE');
  return GetMapNameGeneric(dest, regionMapId);
}

/** Helper : écrit `name` dans `dest` (Uint8Array buffer-style 1:1 StringCopy)
 *  + retourne la string (= idem GetMapName ci-dessus). */
function _writeMapNameDest(dest: unknown, name: string): string {
  if (dest instanceof Uint8Array) {
    const bytes = encodeOwText(name); // bytes GBA + EOS (même encodage que GetMapName)
    const n = Math.min(bytes.length, dest.length);
    dest.set(bytes.subarray(0, n));
    if (n < dest.length) dest[n] = 0xFF;
  }
  return name;
}

/** 1:1 `static void GetMapSecDimensions(mapsec_u16_t mapSecId, u16 *x, u16 *y, u16 *width, u16 *height)`
 *  (region_map.c:1622) — out-params C → retour objet. */
function GetMapSecDimensions(mapSecId: number): { x: number; y: number; width: number; height: number } {
  const entry = gRegionMapEntries[mapSecId] ?? { x: 0, y: 0, width: 1, height: 1, name: '' };
  return { x: entry.x, y: entry.y, width: entry.width, height: entry.height };
}

/** 1:1 `bool8 IsRegionMapZoomed(void)` (region_map.c:1630). */
export function IsRegionMapZoomed(): boolean {
  return sRegionMap.zoomed;
}

/** 1:1 `bool32 IsEventIslandMapSecId(mapsec_u8_t mapSecId)` (region_map.c:1635).
 *  Frontière moteur : accepte aussi la clé string (gMapHeader.regionMapSectionId). */
export function IsEventIslandMapSecId(mapSecId: number | string): boolean {
  const id = _mapsecIdFromKey(mapSecId);
  for (let i = 0; i < sMapSecIdsOffMap.length; i++) {
    if (id === sMapSecIdsOffMap[i])
      return true;
  }
  return false;
}

// ═══════════════════════ FLY MAP (region_map.c:1647-2027) ═══════════════════════
// Transcrite COMPLÈTE mais INERTE : CB2_OpenFlyMap n'est câblé nulle part (le Vol
// in-game passe encore par engine/field/region-map.ts mode 'FLY'). Les 4 dépendances
// warp/retour absentes du repo sont des sentinelles wireTodo (throw à l'appel).

const SetWarpDestinationToHealLocation: (healLocation: string) => void = __wireTodo('SetWarpDestinationToHealLocation');
const SetWarpDestinationToMapWarp: (mapGroup: number, mapNum: number, warpId: number) => void = __wireTodo('SetWarpDestinationToMapWarp');
const ReturnToFieldFromFlyMapSelect: () => void = __wireTodo('ReturnToFieldFromFlyMapSelect');
const CB2_ReturnToPartyMenuFromFlyMap: () => void = __wireTodo('CB2_ReturnToPartyMenuFromFlyMap');
const CB2_ReturnToFieldWithOpenMenu: () => void = __wireTodo('CB2_ReturnToFieldWithOpenMenu');
const WARP_ID_NONE = -1; // 1:1 include/constants/global.h

/** bg.c `DoScheduledBgTilemapCopiesToVram` — moteur : copies tilemap directes
 *  (CopyWindowToVram/CopyBgTilemapBufferToVram), pas de defer queue → no-op
 *  (précédent : starter_choose.ts CB2_StarterChoose, même adaptation). */
function DoScheduledBgTilemapCopiesToVram(): void {
  /* no-op — équivalent 1:1, uploads synchrones */
}

/** 1:1 `void CB2_OpenFlyMap(void)` (region_map.c:1647-1737). INERTE (non câblé). */
export function CB2_OpenFlyMap(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
      // GATE ASSETS (adaptation moteur — cf. LoadRegionMapGfx) : InitRegionMap (case 4)
      // boucle SYNCHRONE sur LoadRegionMapGfx → on n'entre pas dans la machine tant que
      // le prefetch n'a pas fini. HURLE si échec, ne bloque pas la frame.
      PrefetchRegionMapAssets();
      PrefetchFlyMapAssets();
      if (!RegionMapAssetsReady() || _flyAssetsState !== 'ready') {
        _screamIfAssetsFailed();
        return;
      }
      rt.SetVBlankCallback(null);
      SetGpuReg(REG_OFFSET_DISPCNT, 0);
      SetGpuReg(REG_OFFSET_BG0HOFS, 0);
      SetGpuReg(REG_OFFSET_BG0VOFS, 0);
      SetGpuReg(REG_OFFSET_BG1HOFS, 0);
      SetGpuReg(REG_OFFSET_BG1VOFS, 0);
      SetGpuReg(REG_OFFSET_BG2VOFS, 0);
      SetGpuReg(REG_OFFSET_BG2HOFS, 0);
      SetGpuReg(REG_OFFSET_BG3HOFS, 0);
      SetGpuReg(REG_OFFSET_BG3VOFS, 0);
      // 1:1 `sFlyMap = Alloc(sizeof(*sFlyMap))` — objet JS (jamais null → la branche
      // d'échec reste 1:1 mais inatteignable, précédent pokenav.ts CB2_InitPokeNav).
      sFlyMap = {
        callback: null,
        state: 0,
        mapSecId: 0,
        regionMap: {} as RegionMap,
        tileBuffer: new Uint8Array(0x1c0),
        nameBuffer: new Uint8Array(0x26),
        choseFlyLocation: false,
      };
      if (sFlyMap == null) {
        rt.SetMainCallback2(CB2_ReturnToFieldWithOpenMenu as never);
      } else {
        ResetPaletteFade();
        ResetSpriteData();
        FreeSpriteTileRanges();
        FreeAllSpritePalettes();
        rt.gMain.state++;
      }
      break;
    case 1:
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(1, sFlyMapBgTemplates, sFlyMapBgTemplates.length);
      rt.gMain.state++;
      break;
    case 2:
      InitWindows(sFlyMapWindowTemplates);
      DeactivateAllTextPrinters();
      rt.gMain.state++;
      break;
    case 3:
      LoadUserWindowBorderGfx(0, 0x65, BG_PLTT_ID(13));
      ClearScheduledBgCopiesToVram();
      rt.gMain.state++;
      break;
    case 4:
      InitRegionMap(sFlyMap.regionMap, false);
      CreateRegionMapCursor(TAG_CURSOR, TAG_CURSOR);
      CreateRegionMapPlayerIcon(TAG_PLAYER_ICON, TAG_PLAYER_ICON);
      sFlyMap.mapSecId = sFlyMap.regionMap.mapSecId;
      StringFill(sFlyMap.nameBuffer, CHAR_SPACE, MAP_NAME_LENGTH);
      sDrawFlyDestTextWindow = true;
      DrawFlyDestTextWindow();
      rt.gMain.state++;
      break;
    case 5: {
      // 1:1 `LZ77UnCompVram(sRegionMapFrameGfxLZ, BG_CHAR_ADDR(3))` — écriture directe
      // (précédent pokenav_main_menu.ts:55).
      if (sRegionMapFrameGfxLZ) rt.gba.vram.set(sRegionMapFrameGfxLZ.subarray(0, Math.min(sRegionMapFrameGfxLZ.length, rt.gba.vram.length - 0xC000)), 0xC000 /* BG_CHAR_ADDR(3) */);
      rt.gMain.state++;
      break;
    }
    case 6:
      // 1:1 `LZ77UnCompVram(sRegionMapFrameTilemapLZ, BG_SCREEN_ADDR(30))` — tilemap TEXT
      // u16 reposée dans la tilemap du BG 1 (mapBase 30 = template).
      if (sRegionMapFrameTilemapLZ) CopyToBgTilemapBuffer(1, sRegionMapFrameTilemapLZ, 0, 0);
      rt.gMain.state++;
      break;
    case 7:
      LoadPalette(sRegionMapFramePal!, BG_PLTT_ID(1), (sRegionMapFramePal?.length ?? 16) * 2);
      PutWindowTilemap(WIN_FLY_TO_WHERE);
      FillWindowPixelBuffer(WIN_FLY_TO_WHERE, PIXEL_FILL(0));
      AddTextPrinterParameterized(WIN_FLY_TO_WHERE, FONT_NORMAL, getString('gText_FlyToWhere'), 0, 1, 0, null);
      ScheduleBgCopyTilemapToVram(0);
      rt.gMain.state++;
      break;
    case 8:
      LoadFlyDestIcons();
      rt.gMain.state++;
      break;
    case 9:
      BlendPalettes(PALETTES_ALL, 16, 0);
      rt.SetVBlankCallback(VBlankCB_FlyMap as never);
      rt.gMain.state++;
      break;
    case 10:
      SetGpuReg(REG_OFFSET_BLDCNT, 0);
      SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);
      ShowBg(0);
      ShowBg(1);
      ShowBg(2);
      SetFlyMapCallback(CB_FadeInFlyMap);
      rt.SetMainCallback2(CB2_FlyMap as never);
      rt.gMain.state++;
      break;
  }
}

/** 1:1 `static void VBlankCB_FlyMap(void)` (region_map.c:1739) — mêmes briques que
 *  VBlankCB_Pokenav (pokenav.ts:151). */
function VBlankCB_FlyMap(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

/** 1:1 `static void CB2_FlyMap(void)` (region_map.c:1746). */
function CB2_FlyMap(): void {
  sFlyMap.callback!();
  AnimateSprites();
  BuildOamBuffer();
  DoScheduledBgTilemapCopiesToVram();
}

/** 1:1 `static void SetFlyMapCallback(void callback(void))` (region_map.c:1754). */
function SetFlyMapCallback(callback: () => void): void {
  sFlyMap.callback = callback;
  sFlyMap.state = 0;
}

/** 1:1 `static void DrawFlyDestTextWindow(void)` (region_map.c:1760-1818). */
function DrawFlyDestTextWindow(): void {
  let namePrinted: boolean;
  let name: string;

  if (sFlyMap.regionMap.mapSecType > MAPSECTYPE_NONE && sFlyMap.regionMap.mapSecType < NUM_MAPSEC_TYPES) {
    namePrinted = false;
    for (let i = 0; i < sMultiNameFlyDestinations.length; i++) {
      if (sFlyMap.regionMap.mapSecId === sMultiNameFlyDestinations[i].mapSecId) {
        if (FlagGet(sMultiNameFlyDestinations[i].flag)) {
          StringLength(encodeOwText(sMultiNameFlyDestinations[i].name[sFlyMap.regionMap.posWithinMapSec])); // 1:1 résultat ignoré (no-op décomp)
          namePrinted = true;
          ClearStdWindowAndFrameToTransparent(WIN_MAPSEC_NAME, false);
          DrawStdFrameWithCustomTileAndPalette(WIN_MAPSEC_NAME_TALL, false, 101, 13);
          AddTextPrinterParameterized(WIN_MAPSEC_NAME_TALL, FONT_NORMAL, sFlyMap.regionMap.mapSecName, 0, 1, 0, null);
          name = sMultiNameFlyDestinations[i].name[sFlyMap.regionMap.posWithinMapSec];
          AddTextPrinterParameterized(WIN_MAPSEC_NAME_TALL, FONT_NORMAL, name, GetStringRightAlignXOffset(FONT_NORMAL, name, 96), 17, 0, null);
          ScheduleBgCopyTilemapToVram(0);
          sDrawFlyDestTextWindow = true;
        }
        break;
      }
    }
    if (!namePrinted) {
      if (sDrawFlyDestTextWindow === true) {
        ClearStdWindowAndFrameToTransparent(WIN_MAPSEC_NAME_TALL, false);
        DrawStdFrameWithCustomTileAndPalette(WIN_MAPSEC_NAME, false, 101, 13);
      } else {
        // Window is already drawn, just empty it (1:1 commentaire décomp)
        FillWindowPixelBuffer(WIN_MAPSEC_NAME, PIXEL_FILL(1));
      }
      AddTextPrinterParameterized(WIN_MAPSEC_NAME, FONT_NORMAL, sFlyMap.regionMap.mapSecName, 0, 1, 0, null);
      ScheduleBgCopyTilemapToVram(0);
      sDrawFlyDestTextWindow = false;
    }
  } else {
    // Selection is on MAPSECTYPE_NONE, draw empty fly destination text window (1:1)
    if (sDrawFlyDestTextWindow === true) {
      ClearStdWindowAndFrameToTransparent(WIN_MAPSEC_NAME_TALL, false);
      DrawStdFrameWithCustomTileAndPalette(WIN_MAPSEC_NAME, false, 101, 13);
    }
    FillWindowPixelBuffer(WIN_MAPSEC_NAME, PIXEL_FILL(1));
    CopyWindowToVram(WIN_MAPSEC_NAME, COPYWIN_GFX);
    ScheduleBgCopyTilemapToVram(0);
    sDrawFlyDestTextWindow = false;
  }
}

/** 1:1 `static void LoadFlyDestIcons(void)` (region_map.c:1821). */
function LoadFlyDestIcons(): void {
  // 1:1 `LZ77UnCompWram(sFlyTargetIcons_Gfx, sFlyMap->tileBuffer)` — copie (asset déjà décompressé).
  LZ77UnCompWram(sFlyTargetIcons_Gfx, sFlyMap.tileBuffer);
  const sheet = {
    data: sFlyMap.tileBuffer,
    size: 0x1c0, // sizeof(sFlyMap->tileBuffer)
    tag: TAG_FLY_ICON,
  };
  LoadSpriteSheet(sheet);
  LoadSpritePalette(sFlyTargetIconsSpritePalette as { data: Uint16Array; tag: number });
  CreateFlyDestIcons();
  TryCreateRedOutlineFlyDestIcons();
}

// Sprite data for SpriteCB_FlyDestIcon : #define sIconMapSec data[0] / sFlickerTimer data[1]

/** 1:1 `static void CreateFlyDestIcons(void)` (region_map.c:1839-1879). */
function CreateFlyDestIcons(): void {
  let canFlyFlag = FLAG_VISITED_LITTLEROOT_TOWN;
  for (let mapSecId = MAPSEC_LITTLEROOT_TOWN; mapSecId <= MAPSEC_EVER_GRANDE_CITY; mapSecId++) {
    const dims = GetMapSecDimensions(mapSecId);
    const x = (dims.x + MAPCURSOR_X_MIN) * 8 + 4;
    const y = (dims.y + MAPCURSOR_Y_MIN) * 8 + 4;

    let shape: number;
    if (dims.width === 2)
      shape = 1; /* SPRITE_SHAPE(16x8) */
    else if (dims.height === 2)
      shape = 2; /* SPRITE_SHAPE(8x16) */
    else
      shape = 0; /* SPRITE_SHAPE(8x8) */

    const spriteId = CreateSprite(sFlyDestIconSpriteTemplate as never, x, y, 10);
    if (spriteId !== MAX_SPRITES) {
      const sprite = gSprites[spriteId]!;
      _spriteOamShapeSet(sprite, shape as 0 | 1 | 2); /* gSprites[spriteId].oam.shape = shape */

      if (FlagGet(canFlyFlag))
        sprite.callback = SpriteCB_FlyDestIcon as never;
      else
        shape += 3;

      StartSpriteAnim(sprite as never, shape);
      sprite.data[0] /* sIconMapSec */ = mapSecId;
    }
    canFlyFlag++;
  }
}

/** 1:1 `static void TryCreateRedOutlineFlyDestIcons(void)` (region_map.c:1883-1911). */
function TryCreateRedOutlineFlyDestIcons(): void {
  for (let i = 0; sRedOutlineFlyDestinations[i][1] !== MAPSEC_NONE; i++) {
    if (FlagGet(sRedOutlineFlyDestinations[i][0])) {
      const mapSecId = sRedOutlineFlyDestinations[i][1];
      const dims = GetMapSecDimensions(mapSecId);
      const x = (dims.x + MAPCURSOR_X_MIN) * 8;
      const y = (dims.y + MAPCURSOR_Y_MIN) * 8;
      const spriteId = CreateSprite(sFlyDestIconSpriteTemplate as never, x, y, 10);
      if (spriteId !== MAX_SPRITES) {
        const sprite = gSprites[spriteId]!;
        _spriteOamSizeSet(sprite, 1); /* gSprites[spriteId].oam.size = SPRITE_SIZE(16x16) */
        sprite.callback = SpriteCB_FlyDestIcon as never;
        StartSpriteAnim(sprite as never, FLYDESTICON_RED_OUTLINE);
        sprite.data[0] /* sIconMapSec */ = mapSecId;
      }
    }
  }
}

/** 1:1 `static void SpriteCB_FlyDestIcon(struct Sprite *sprite)` (region_map.c:1914) —
 *  flicker de l'icône sous le curseur. */
function SpriteCB_FlyDestIcon(sprite: DecompSprite): void {
  if (sFlyMap.regionMap.mapSecId === sprite.data[0] /* sIconMapSec */) {
    if (++sprite.data[1] /* sFlickerTimer */ > 16) {
      sprite.data[1] = 0;
      sprite.invisible = sprite.invisible ? false : true;
    }
  } else {
    sprite.data[1] = 16;
    sprite.invisible = false;
  }
}

/** 1:1 `static void CB_FadeInFlyMap(void)` (region_map.c:1934). */
function CB_FadeInFlyMap(): void {
  switch (sFlyMap.state) {
    case 0:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      sFlyMap.state++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        SetFlyMapCallback(CB_HandleFlyMapInput);
      }
      break;
  }
}

/** 1:1 `static void CB_HandleFlyMapInput(void)` (region_map.c:1951). */
function CB_HandleFlyMapInput(): void {
  if (sFlyMap.state === 0) {
    switch (DoRegionMapInputCallback()) {
      case MAP_INPUT_NONE:
      case MAP_INPUT_MOVE_START:
      case MAP_INPUT_MOVE_CONT:
        break;
      case MAP_INPUT_MOVE_END:
        DrawFlyDestTextWindow();
        break;
      case MAP_INPUT_A_BUTTON:
        if (sFlyMap.regionMap.mapSecType === MAPSECTYPE_CITY_CANFLY || sFlyMap.regionMap.mapSecType === MAPSECTYPE_BATTLE_FRONTIER) {
          m4aSongNumStart(SE_SELECT);
          sFlyMap.choseFlyLocation = true;
          SetFlyMapCallback(CB_ExitFlyMap);
        }
        break;
      case MAP_INPUT_B_BUTTON:
        m4aSongNumStart(SE_SELECT);
        sFlyMap.choseFlyLocation = false;
        SetFlyMapCallback(CB_ExitFlyMap);
        break;
    }
  }
}

/** 1:1 `static void CB_ExitFlyMap(void)` (region_map.c:1981-2027). */
function CB_ExitFlyMap(): void {
  switch (sFlyMap.state) {
    case 0:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
      sFlyMap.state++;
      break;
    case 1:
      if (!UpdatePaletteFade()) {
        FreeRegionMapIconResources();
        if (sFlyMap.choseFlyLocation) {
          switch (sFlyMap.regionMap.mapSecId) {
            case MAPSEC_SOUTHERN_ISLAND:
              SetWarpDestinationToHealLocation('HEAL_LOCATION_SOUTHERN_ISLAND_EXTERIOR');
              break;
            case MAPSEC_BATTLE_FRONTIER:
              SetWarpDestinationToHealLocation('HEAL_LOCATION_BATTLE_FRONTIER_OUTSIDE_EAST');
              break;
            case MAPSEC_LITTLEROOT_TOWN:
              SetWarpDestinationToHealLocation(gSaveBlock2Ptr.playerGender === MALE ? 'HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE' : 'HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE');
              break;
            case MAPSEC_EVER_GRANDE_CITY:
              SetWarpDestinationToHealLocation(FlagGet(FLAG_LANDMARK_POKEMON_LEAGUE) && sFlyMap.regionMap.posWithinMapSec === 0 ? 'HEAL_LOCATION_EVER_GRANDE_CITY_POKEMON_LEAGUE' : 'HEAL_LOCATION_EVER_GRANDE_CITY');
              break;
            default:
              if (sMapHealLocations[sFlyMap.regionMap.mapSecId][2] != null)
                SetWarpDestinationToHealLocation(sMapHealLocations[sFlyMap.regionMap.mapSecId][2]!);
              else
                SetWarpDestinationToMapWarp(sMapHealLocations[sFlyMap.regionMap.mapSecId][0], sMapHealLocations[sFlyMap.regionMap.mapSecId][1], WARP_ID_NONE);
              break;
          }
          ReturnToFieldFromFlyMapSelect();
        } else {
          const rt = getRuntime();
          rt?.SetMainCallback2(CB2_ReturnToPartyMenuFromFlyMap as never);
        }
        // 1:1 `TRY_FREE_AND_SET_NULL(sFlyMap)` + FreeAllWindowBuffers.
        sFlyMap = null as unknown as FlyMapStruct;
        FreeAllWindowBuffers();
      }
      break;
  }
}

// ─── Adaptateurs bg.c/decompress.c locaux (précédent : mail.ts:1010-1075 + pokenav_main_menu.ts:38-93
//     — chaque écran porte ses adaptateurs locaux pour ne pas créer d'arête d'import vers le
//     cluster pokenav depuis un module EAGER comme region_map [importé par match_call/tv/…]) ───

/** 1:1 `bg.c DecompressAndCopyTileDataToVram(bg, src, size, offset, mode)` — l'asset est déjà
 *  décompressé (loadTileBin/loadAffineTilemapBin) : mode 0 = tuiles → char VRAM du BG (charBase
 *  + baseTile du config, 1:1 LoadBgTiles bg.c:382 — précédent pokenav_main_menu.ts:41) ;
 *  mode ≠ 0 = tilemap → VRAM au mapBase du BG (1:1 la copie DMA du décomp). Écrire au mapBase
 *  plutôt que via la view `bg.tilemap` : la view est clampée par le screenSize COURANT, or le
 *  BG2 affine (64×64) ne reçoit SetBgAttribute(SCREENSIZE, 2) qu'au case 7 de LoadRegionMapGfx
 *  — la view (encore 32×32 au case 1) aurait tronqué 3/4 de la carte. Même mémoire (gba.ts:27 :
 *  bg(n).tilemap EST une view du mapBase). */
function DecompressAndCopyTileDataToVram(bg: number, src: Uint8Array | Uint16Array | null, _size: number, _offset: number, mode: number): void {
  if (!src) {
    console.error('[region_map] DecompressAndCopyTileDataToVram : src null (asset pas chargé ?)');
    return;
  }
  const rt = getRuntime();
  if (!rt) return;
  const cfg = rt.gba.bg(bg as 0 | 1 | 2 | 3).config;
  const bytes = src instanceof Uint16Array ? new Uint8Array(src.buffer, src.byteOffset, src.byteLength) : src;
  if (!mode) {
    const baseTile = (cfg as { baseTile?: number }).baseTile ?? 0;
    const dest = (cfg.charBaseIndex ?? 0) * 0x4000 + baseTile * 32;
    rt.gba.vram.set(bytes.subarray(0, Math.min(bytes.length, rt.gba.vram.length - dest)), dest);
  } else {
    const dest = ((cfg as { mapBaseIndex?: number }).mapBaseIndex ?? 0) * 0x800; // BG_SCREEN_ADDR(mapBase)
    rt.gba.vram.set(bytes.subarray(0, Math.min(bytes.length, rt.gba.vram.length - dest)), dest);
  }
}

/** 1:1 `bg.c FreeTempTileDataBuffersIfPossible()` — uploads synchrones → toujours « done »
 *  → FALSE (précédent mail.ts:1050 / pokenav_main_menu.ts:67). */
function FreeTempTileDataBuffersIfPossible(): boolean {
  return false;
}

/** 1:1 `LZ77UnCompWram(src, dest)` (agbcc) — ADAPTATION MOTEUR : les assets extraits sont
 *  déjà décompressés → copie directe dans le buffer struct (précédent : LoadLeftHeaderGfxForMenu
 *  pokenav_main_menu.ts:841 écrit les tuiles brutes au lieu de LZ77+DMA). HURLE si src null. */
function LZ77UnCompWram(src: Uint8Array | Uint16Array | null, dest: Uint8Array): void {
  if (!src) {
    console.error('[region_map] LZ77UnCompWram : src null — asset pas encore chargé (PrefetchRegionMapAssets ?)');
    return;
  }
  const bytes = src instanceof Uint16Array ? new Uint8Array(src.buffer, src.byteOffset, src.byteLength) : src;
  dest.set(bytes.subarray(0, Math.min(bytes.length, dest.length)));
}

// ─── Helpers OAM (le sprite du port n'a PAS de sous-struct `.oam` — MEMORY
//     « .oam.paletteNum n'existe pas → via oamIndex » ; précédent
//     _spriteOamTileNumSet pokenav_main_menu.ts:717) ────────────────────────────

/** `sprite->oam.size = v` 1:1 — écrit l'entrée OAM réelle via oamIndex. */
function _spriteOamSizeSet(sprite: DecompSprite, v: 0 | 1 | 2 | 3): void {
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam) oam.size = v;
}

/** `sprite->oam.shape = v` 1:1 — idem. */
function _spriteOamShapeSet(sprite: DecompSprite, v: 0 | 1 | 2): void {
  const oam = getRuntime()?.gba?.oam?.[sprite.oamIndex ?? -1];
  if (oam) oam.shape = v;
}

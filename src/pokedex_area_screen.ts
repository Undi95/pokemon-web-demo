/**
 * pokedex_area_screen.ts — miroir 1:1 de `src/pokedex_area_screen.c` (797 l).
 *
 * Écran ZONE du Pokédex : carte de Hoenn (module pokedex_area_region_map, BG3
 * 8bpp) + « area glows » (rectangles pulsants BG2 sur les routes/villes qui ont
 * l'espèce, blend BLDALPHA sinusoïdal) + « area markers » (ronds rouges
 * clignotants sur les donjons/zones spéciales) + sprites « ZONE INCONNUE » si
 * l'espèce n'apparaît nulle part.
 *
 * Adaptations frontière (docummentées par site) :
 *  - mapsecs/espèces/maps = STRINGS chez nous (layout + wild-encounters.json +
 *    map-mapsecs.json généré par scripts/extract-map-mapsecs.cjs) ; les groupes
 *    de maps = resolveDecompConstant('MAP_X') >> 8 (id décomp = (group<<8)|num).
 *  - gWildMonHeaders : wild-encounters.json byMap n'a qu'UNE table Altering Cave
 *    (les 8 autres, event-only jamais distribuées, vivent sous .alteringCave) —
 *    le compteur C (skip des 8 doublons) devient : la table byMap = la table 0 ;
 *    VAR_ALTERING_CAVE_WILD_SET > 0 → l'espèce des tables 1-8 est introuvable,
 *    même résultat net que la ROM pour tout ce qui est obtenable.
 *  - Le scan fishing du C vanilla lit LAND_WILD_COUNT (12) entrées d'une table
 *    de 10 (OOB ROM, no-BUGFIX) : ici les index 10/11 lisent `undefined` → pas
 *    de match. L'OOB ROM lisait 2 u32 du header suivant — divergence théorique
 *    intraçable sans layout mémoire, actée.
 *  - Sprites par tags → slots OBJ fixes (markers @256, unknown @264+, icône
 *    joueur @320) chargés async via rt.LoadCompressedSpriteSheet (pattern dex).
 */
import { getRuntime, LoadPalette, PlaySE, FreeAllSpritePalettes } from '../harness/runtime/decomp-globals';
import { ResetSpriteData, DestroySprite, setReservedSpritePaletteCount } from './sprite';
import { BeginNormalPaletteFade } from './palette';
import { gSineTable } from './trig';
import { loadIndexedPngStrict, loadTilemapBin } from '../harness/gba/png-loader';
import { BG_PLTT_ID, type DecompTask } from '../harness/runtime/decomp-runtime';
import { ShowBg, HideBg } from './window';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { VarGet, FlagGet } from './event_data';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { GetMapSecIdAt, getRegionMapEntries, preloadRegionMapData } from './engine/field/region-map-data';
import { CorrectSpecialMapSecId } from './engine/field/region-map-data';
import { _getPlayerMapsecLocation } from './engine/field/region-map';
import {
  LoadPokedexAreaMapGfx, TryShowPokedexAreaMap, PokedexAreaMapChangeBgY, FreePokedexAreaMapBgNum,
  type PokedexAreaMapTemplate,
} from './pokedex_area_region_map';
import { sAreaGlowTilemapMapping, GLOW_TILE_FULL } from './data/pokedex_area_glow';
import { SE_PC_OFF, SE_DEX_PAGE } from '../include/constants/songs';

const AREA_SCREEN_WIDTH = 32;
const AREA_SCREEN_HEIGHT = 20;

const GLOW_FULL = 0xffff;
const GLOW_EDGE_R = 1 << 0, GLOW_EDGE_L = 1 << 1, GLOW_EDGE_B = 1 << 2, GLOW_EDGE_T = 1 << 3;
const GLOW_CORNER_TL = 1 << 4, GLOW_CORNER_BL = 1 << 5, GLOW_CORNER_TR = 1 << 6, GLOW_CORNER_BR = 1 << 7;
const GLOW_PALETTE = 10;

const MAX_AREA_HIGHLIGHTS = 64;
const MAX_AREA_MARKERS = 32;

// Slots OBJ (tiles VRAM sprites + banks palette) — adaptation tags → slots fixes.
const MARKER_TILE_BASE = 256;   // 16×16 = 4 tiles
const UNKNOWN_TILE_BASE = 264;  // 96×32 png = 3 sprites 32×32 (16 tiles chacun)
const PLAYER_ICON_TILE_BASE = 320; // 16×16
const MARKER_PAL_BANK = 0, UNKNOWN_PAL_BANK = 1, PLAYER_ICON_PAL_BANK = 2;

// 1:1 sSpeciesHiddenFromAreaScreen = { SPECIES_WYNAUT } (Mirage Island).
const sSpeciesHiddenFromAreaScreen: readonly string[] = ['SPECIES_WYNAUT'];

// 1:1 sMovingRegionMapSections (Marine/Terra Cave mouvantes — jamais surlignées).
const sMovingRegionMapSections: readonly string[] = [
  'MAPSEC_MARINE_CAVE', 'MAPSEC_UNDERWATER_MARINE_CAVE', 'MAPSEC_TERRA_CAVE',
];

// 1:1 sFeebasData : rencontres spéciales hors tables wild (Barpau Route 119).
const sFeebasData: readonly { species: string; map: string }[] = [
  { species: 'SPECIES_FEEBAS', map: 'MAP_ROUTE119' },
];

// 1:1 sLandmarkData : zones spéciales cachées tant que le landmark n'est pas découvert.
const sLandmarkData: readonly { mapSec: string; flag: string }[] = [
  { mapSec: 'MAPSEC_SKY_PILLAR', flag: 'FLAG_LANDMARK_SKY_PILLAR' },
  { mapSec: 'MAPSEC_SEAFLOOR_CAVERN', flag: 'FLAG_LANDMARK_SEAFLOOR_CAVERN' },
  { mapSec: 'MAPSEC_ALTERING_CAVE', flag: 'FLAG_LANDMARK_ALTERING_CAVE' },
  { mapSec: 'MAPSEC_MIRAGE_TOWER', flag: 'FLAG_LANDMARK_MIRAGE_TOWER' },
  { mapSec: 'MAPSEC_DESERT_UNDERPASS', flag: 'FLAG_LANDMARK_DESERT_UNDERPASS' },
  { mapSec: 'MAPSEC_ARTISAN_CAVE', flag: 'FLAG_LANDMARK_ARTISAN_CAVE' },
];

interface OverworldArea { map: string; regionMapSectionId: string }

interface PokedexAreaScreenState {
  species: number;
  speciesKey: string;
  overworldAreasWithMons: OverworldArea[];
  numOverworldAreas: number;
  numSpecialAreas: number;
  drawAreaGlowState: number;
  areaGlowTilemap: Uint16Array;
  markerTimer: number;
  glowTimer: number;
  areaShadeBldArgLo: number;
  areaShadeBldArgHi: number;
  showingMarkers: boolean;
  markerFlashCounter: number;
  specialAreaRegionMapSectionIds: string[];
  areaMarkerSpriteIds: number[];
  numAreaMarkerSprites: number;
  alteringCaveId: number;
  screenSwitchState: { set(v: number): void };
  areaUnknownSpriteIds: number[];
  playerIconSpriteId: number;
}

let sPokedexAreaScreen: PokedexAreaScreenState | null = null;

// Données chargées async (gates de la state-machine).
let _mapMapsecs: Record<string, string> | null = null;
interface WildMon { species: string }
interface WildTable { mons?: WildMon[] }
interface WildHeader { land?: WildTable; water?: WildTable; rock_smash?: WildTable; fishing?: WildTable }
let _wildByMap: Record<string, WildHeader> | null = null;
let _glowAssets: { tiles: Uint8Array; palette: Uint16Array } | null = null;
let _dataReady = false;

const sPokedexAreaMapTemplate: PokedexAreaMapTemplate = { bg: 3, offset: 0, mode: 0, unk: 2 };

function _loadAreaData(): void {
  if (_dataReady) return;
  void (async () => {
    const [mapsecsResp, wildsResp, glowPng] = await Promise.all([
      fetch('/decomp/em/map-mapsecs.json').then((r) => r.json()),
      fetch('/decomp/em/wild-encounters.json').then((r) => r.json()),
      loadIndexedPngStrict('/decomp/em/pokedex/area_glow.png', 4),
    ]);
    _mapMapsecs = mapsecsResp as Record<string, string>;
    _wildByMap = (wildsResp as { byMap: Record<string, WildHeader> }).byMap;
    _glowAssets = { tiles: glowPng.charData, palette: glowPng.palette };
    await preloadRegionMapData();
    _dataReady = true;
  })();
}

// ─── Recherche des zones (FindMapsWithMon, pokedex_area_screen.c:241) ────────

/** 1:1 `GetRegionMapSectionId(mapGroup, mapNum)` — chez nous par clé map. */
function GetRegionMapSectionIdByMap(map: string): string {
  return _mapMapsecs?.[map] ?? 'MAPSEC_NONE';
}

/** Groupe décomp d'une map (id = (group<<8)|num). */
function _mapGroup(map: string): number {
  const id = resolveDecompConstant(map);
  return typeof id === 'number' ? (id >> 8) & 0xff : -1;
}

let MAP_GROUP_TOWNS_AND_ROUTES = -1, MAP_GROUP_DUNGEONS = -1, MAP_GROUP_SPECIAL_AREA = -1;
function _initMapGroups(): void {
  if (MAP_GROUP_TOWNS_AND_ROUTES >= 0) return;
  MAP_GROUP_TOWNS_AND_ROUTES = _mapGroup('MAP_PETALBURG_CITY');
  MAP_GROUP_DUNGEONS = _mapGroup('MAP_METEOR_FALLS_1F_1R');
  MAP_GROUP_SPECIAL_AREA = _mapGroup('MAP_SAFARI_ZONE_NORTHWEST');
}

/** 1:1 `MonListHasSpecies(info, species, size)` — species = clé SPECIES_X. */
function MonListHasSpecies(info: WildTable | undefined, speciesKey: string, size: number): boolean {
  if (!info?.mons) return false;
  for (let i = 0; i < size; i++) {
    if (info.mons[i]?.species === speciesKey) return true;
  }
  return false;
}

const LAND_WILD_COUNT = 12, WATER_WILD_COUNT = 5, ROCK_WILD_COUNT = 5;

/** 1:1 `MapHasSpecies(header, species)` (pokedex_area_screen.c:381). Le scan
 *  fishing utilise LAND_WILD_COUNT (12) : quirk OOB du vanilla no-BUGFIX (cf.
 *  en-tête). Altering Cave : byMap = table 0 uniquement (cf. en-tête). */
function MapHasSpecies(map: string, header: WildHeader, speciesKey: string): boolean {
  if (GetRegionMapSectionIdByMap(map) === 'MAPSEC_ALTERING_CAVE') {
    if (sPokedexAreaScreen!.alteringCaveId !== 0) return false;
  }
  if (MonListHasSpecies(header.land, speciesKey, LAND_WILD_COUNT)) return true;
  if (MonListHasSpecies(header.water, speciesKey, WATER_WILD_COUNT)) return true;
  if (MonListHasSpecies(header.fishing, speciesKey, LAND_WILD_COUNT)) return true; // sic (vanilla)
  if (MonListHasSpecies(header.rock_smash, speciesKey, ROCK_WILD_COUNT)) return true;
  return false;
}

/** 1:1 `SetAreaHasMon(mapGroup, mapNum)` : ajoute une route/ville surlignée. */
function SetAreaHasMon(map: string): void {
  const s = sPokedexAreaScreen!;
  if (s.numOverworldAreas < MAX_AREA_HIGHLIGHTS) {
    s.overworldAreasWithMons[s.numOverworldAreas] = {
      map,
      regionMapSectionId: CorrectSpecialMapSecId(GetRegionMapSectionIdByMap(map)),
    };
    s.numOverworldAreas++;
  }
}

/** 1:1 `SetSpecialMapHasMon(mapGroup, mapNum)` : ajoute un marker donjon/zone. */
function SetSpecialMapHasMon(map: string): void {
  const s = sPokedexAreaScreen!;
  if (s.numSpecialAreas < MAX_AREA_MARKERS) {
    const regionMapSectionId = GetRegionMapSectionIdByMap(map);
    if (regionMapSectionId !== 'MAPSEC_NONE') {
      for (const moving of sMovingRegionMapSections) {
        if (regionMapSectionId === moving) return;
      }
      for (const lm of sLandmarkData) {
        if (regionMapSectionId === lm.mapSec && !FlagGet(resolveDecompConstant(lm.flag) ?? 0)) return;
      }
      let i = 0;
      for (; i < s.numSpecialAreas; i++) {
        if (s.specialAreaRegionMapSectionIds[i] === regionMapSectionId) break;
      }
      if (i === s.numSpecialAreas) {
        s.specialAreaRegionMapSectionIds[i] = regionMapSectionId;
        s.numSpecialAreas++;
      }
    }
  }
}

/** 1:1 `FindMapsWithMon(species)` (pokedex_area_screen.c:241). */
function FindMapsWithMon(): void {
  const s = sPokedexAreaScreen!;
  _initMapGroups();
  s.alteringCaveId = VarGet(resolveDecompConstant('VAR_ALTERING_CAVE_WILD_SET') ?? 0x40a6);
  if (s.alteringCaveId >= 9 /* NUM_ALTERING_CAVE_TABLES */) s.alteringCaveId = 0;

  const roamer = gSaveBlock1Ptr.roamer as { species?: number; active?: number } | undefined;
  if (s.species !== (roamer?.species ?? 0)) {
    s.numOverworldAreas = 0;
    s.numSpecialAreas = 0;
    for (const hidden of sSpeciesHiddenFromAreaScreen) {
      if (hidden === s.speciesKey) return;
    }
    // Rencontres spéciales (Barpau Route 119 — groupe towns/routes).
    for (const fb of sFeebasData) {
      if (s.speciesKey === fb.species) {
        const g = _mapGroup(fb.map);
        if (g === MAP_GROUP_TOWNS_AND_ROUTES) SetAreaHasMon(fb.map);
        else if (g === MAP_GROUP_DUNGEONS || g === MAP_GROUP_SPECIAL_AREA) SetSpecialMapHasMon(fb.map);
      }
    }
    // Tables wild régulières.
    if (_wildByMap) {
      for (const [map, header] of Object.entries(_wildByMap)) {
        if (MapHasSpecies(map, header, s.speciesKey)) {
          const g = _mapGroup(map);
          if (g === MAP_GROUP_TOWNS_AND_ROUTES) SetAreaHasMon(map);
          else if (g === MAP_GROUP_DUNGEONS || g === MAP_GROUP_SPECIAL_AREA) SetSpecialMapHasMon(map);
        }
      }
    }
  } else {
    // Espèce = le roamer : montrer sa position actuelle. Pont optionnel
    // (__GetRoamerLocation → { map }) : le module roamer n'est pas encore porté.
    s.numSpecialAreas = 0;
    const getLoc = (globalThis as { __GetRoamerLocation?: () => { map: string } | null }).__GetRoamerLocation;
    const loc = roamer?.active ? getLoc?.() : null;
    if (loc) {
      s.overworldAreasWithMons[0] = { map: loc.map, regionMapSectionId: GetRegionMapSectionIdByMap(loc.map) };
      s.numOverworldAreas = 1;
    } else {
      s.numOverworldAreas = 0;
    }
  }
}

// ─── Glow tilemap (BuildAreaGlowTilemap, pokedex_area_screen.c:419) ───────────

/** 1:1 `GetRegionMapSecIdAt(x, y)` — coords écran (offsets MAPCURSOR gérés). */
function GetRegionMapSecIdAt(x: number, y: number): string {
  return GetMapSecIdAt(x, y);
}

/** 1:1 `BuildAreaGlowTilemap()` : full glow sur les tiles au mapsec de l'espèce,
 *  puis bords/coins, puis résolution flags → tile ids (sAreaGlowTilemapMapping). */
function BuildAreaGlowTilemap(): void {
  const s = sPokedexAreaScreen!;
  const tm = s.areaGlowTilemap;
  tm.fill(0);

  for (let i = 0; i < s.numOverworldAreas; i++) {
    let j = 0;
    for (let y = 0; y < AREA_SCREEN_HEIGHT; y++) {
      for (let x = 0; x < AREA_SCREEN_WIDTH; x++) {
        if (GetRegionMapSecIdAt(x, y) === s.overworldAreasWithMons[i].regionMapSectionId)
          tm[j] = GLOW_FULL;
        j++;
      }
    }
  }

  let j = 0;
  for (let y = 0; y < AREA_SCREEN_HEIGHT; y++) {
    for (let x = 0; x < AREA_SCREEN_WIDTH; x++) {
      if (tm[j] === GLOW_FULL) {
        if (x !== 0 && tm[j - 1] !== GLOW_FULL) tm[j - 1] |= GLOW_EDGE_L;
        if (x !== AREA_SCREEN_WIDTH - 1 && tm[j + 1] !== GLOW_FULL) tm[j + 1] |= GLOW_EDGE_R;
        if (y !== 0 && tm[j - AREA_SCREEN_WIDTH] !== GLOW_FULL) tm[j - AREA_SCREEN_WIDTH] |= GLOW_EDGE_T;
        if (y !== AREA_SCREEN_HEIGHT - 1 && tm[j + AREA_SCREEN_WIDTH] !== GLOW_FULL) tm[j + AREA_SCREEN_WIDTH] |= GLOW_EDGE_B;
        if (x !== 0 && y !== 0 && tm[j - AREA_SCREEN_WIDTH - 1] !== GLOW_FULL) tm[j - AREA_SCREEN_WIDTH - 1] |= GLOW_CORNER_TL;
        if (x !== AREA_SCREEN_WIDTH - 1 && y !== 0 && tm[j - AREA_SCREEN_WIDTH + 1] !== GLOW_FULL) tm[j - AREA_SCREEN_WIDTH + 1] |= GLOW_CORNER_TR;
        if (x !== 0 && y !== AREA_SCREEN_HEIGHT - 1 && tm[j + AREA_SCREEN_WIDTH - 1] !== GLOW_FULL) tm[j + AREA_SCREEN_WIDTH - 1] |= GLOW_CORNER_BL;
        if (x !== AREA_SCREEN_WIDTH - 1 && y !== AREA_SCREEN_HEIGHT - 1 && tm[j + AREA_SCREEN_WIDTH + 1] !== GLOW_FULL) tm[j + AREA_SCREEN_WIDTH + 1] |= GLOW_CORNER_BR;
      }
      j++;
    }
  }

  for (let i = 0; i < tm.length; i++) {
    if (tm[i] === GLOW_FULL) {
      tm[i] = GLOW_TILE_FULL | (GLOW_PALETTE << 12);
    } else if (tm[i]) {
      if (tm[i] & GLOW_EDGE_L) tm[i] &= ~(GLOW_CORNER_TL | GLOW_CORNER_BL);
      if (tm[i] & GLOW_EDGE_R) tm[i] &= ~(GLOW_CORNER_TR | GLOW_CORNER_BR);
      if (tm[i] & GLOW_EDGE_T) tm[i] &= ~(GLOW_CORNER_TR | GLOW_CORNER_TL);
      if (tm[i] & GLOW_EDGE_B) tm[i] &= ~(GLOW_CORNER_BR | GLOW_CORNER_BL);
      tm[i] = sAreaGlowTilemapMapping[tm[i]] | (GLOW_PALETTE << 12);
    }
  }
}

/** 1:1 `DrawAreaGlow()` state-machine (pokedex_area_screen.c:209). */
function DrawAreaGlow(): boolean {
  const rt = getRuntime();
  const s = sPokedexAreaScreen!;
  if (!rt) return false;
  switch (s.drawAreaGlowState) {
    case 0:
      FindMapsWithMon();
      break;
    case 1:
      BuildAreaGlowTilemap();
      break;
    case 2: {
      // DecompressAndCopyTileDataToVram(2, sAreaGlow_Gfx) + LoadBgTilemap(2, areaGlowTilemap).
      const bg2 = rt.gba.bg(2);
      rt.gba.vram.set(_glowAssets!.tiles, (bg2.config.charBaseIndex & 3) * 0x4000);
      bg2.tilemap.set(s.areaGlowTilemap.subarray(0, Math.min(s.areaGlowTilemap.length, bg2.tilemap.length)));
      break;
    }
    case 3:
      // FreeTempTileDataBuffersIfPossible (chargement déjà fait) + palette glow → BG 10.
      // 1:1 CpuCopy32(sAreaGlow_Pal, &gPlttBufferUnfaded[…]) : UNFADED SEUL — l'écran
      // est noir, le glow n'apparaît qu'au fade-in (LoadPalette le montrait en avance).
      rt.gPlttBufferUnfaded.cpuCopy16(_glowAssets!.palette, 0, BG_PLTT_ID(GLOW_PALETTE), 16);
      s.drawAreaGlowState++;
      return true;
    case 4:
      // ChangeBgY(2, -BG_SCREEN_SIZE, SET) = -0x800 Q8 = -8 px.
      rt.SetGpuReg(0x1a /* BG2VOFS */, (-8) & 0xffff);
      break;
    default:
      return false;
  }
  s.drawAreaGlowState++;
  return true;
}

// ─── Pulse du glow + flash des markers (StartAreaGlow/DoAreaGlow) ─────────────

// BLDCNT bits (io_reg.h) : TGT1_BG2=0x04, EFFECT_BLEND=0x40, TGT2_ALL=0x3f00,
// TGT1_BG0=0x01, TGT2_BG0=0x100.
const BLDCNT_GLOW = 0x04 | 0x40 | 0x3f00;

/** 1:1 `StartAreaGlow()` (pokedex_area_screen.c:508). */
function StartAreaGlow(): void {
  const rt = getRuntime();
  const s = sPokedexAreaScreen!;
  if (!rt) return;
  s.showingMarkers = !!(s.numSpecialAreas && s.numOverworldAreas === 0);
  s.markerTimer = 0;
  s.glowTimer = 0;
  s.areaShadeBldArgLo = 0;
  s.areaShadeBldArgHi = 64;
  s.markerFlashCounter = 1;
  rt.SetGpuReg(0x50 /* BLDCNT */, BLDCNT_GLOW);
  rt.SetGpuReg(0x52 /* BLDALPHA */, 0 | (16 << 8));
  DoAreaGlow();
}

/** 1:1 `DoAreaGlow()` (pokedex_area_screen.c:525) — appelé chaque frame d'input. */
function DoAreaGlow(): void {
  const rt = getRuntime();
  const s = sPokedexAreaScreen!;
  if (!rt) return;
  if (!s.showingMarkers) {
    if (s.markerTimer === 0) {
      s.glowTimer++;
      if (s.glowTimer & 1)
        s.areaShadeBldArgLo = (s.areaShadeBldArgLo + 4) & 0x7f;
      else
        s.areaShadeBldArgHi = (s.areaShadeBldArgHi + 4) & 0x7f;
      const x = gSineTable[s.areaShadeBldArgLo] >> 4;
      const y = gSineTable[s.areaShadeBldArgHi] >> 4;
      rt.SetGpuReg(0x52 /* BLDALPHA */, x | (y << 8));
      s.markerTimer = 0;
      if (s.glowTimer === 64) {
        s.glowTimer = 0;
        if (s.numSpecialAreas !== 0) s.showingMarkers = true;
      }
    } else {
      s.markerTimer--;
    }
  } else {
    s.markerTimer++;
    if (s.markerTimer > 12) {
      s.markerTimer = 0;
      s.markerFlashCounter++;
      for (let i = 0; i < s.numSpecialAreas; i++) {
        const sp = rt.gSprites[s.areaMarkerSpriteIds[i]];
        if (sp) sp.invisible = !!(s.markerFlashCounter & 1);
      }
      if (s.markerFlashCounter > 4) {
        s.markerFlashCounter = 1;
        if (s.numOverworldAreas !== 0) s.showingMarkers = false;
      }
    }
  }
}

// ─── Sprites : markers, « zone inconnue », icône joueur ──────────────────────

let _spriteSheetsReady = false;
function _loadAreaSpriteSheets(rt: NonNullable<ReturnType<typeof getRuntime>>): void {
  _spriteSheetsReady = false;
  void (async () => {
    try {
      const [marker, unknown, icon] = await Promise.all([
        rt.LoadCompressedSpriteSheet('/decomp/em/pokedex/area_marker.png', MARKER_TILE_BASE * 32),
        rt.LoadCompressedSpriteSheet('/decomp/em/pokedex/area_unknown.png', UNKNOWN_TILE_BASE * 32),
        rt.LoadCompressedSpriteSheet(
          (gSaveBlock2Ptr.playerGender ?? 0) === 0
            ? '/decomp/em/region_map/brendan_icon.png' : '/decomp/em/region_map/may_icon.png',
          PLAYER_ICON_TILE_BASE * 32),
      ]);
      if (marker.palette) LoadPalette(marker.palette.subarray(0, 16), 0x100 + MARKER_PAL_BANK * 16, 32);
      if (unknown.palette) LoadPalette(unknown.palette.subarray(0, 16), 0x100 + UNKNOWN_PAL_BANK * 16, 32);
      if (icon.palette) LoadPalette(icon.palette.subarray(0, 16), 0x100 + PLAYER_ICON_PAL_BANK * 16, 32);
    } catch (e) {
      console.error('[pokedex_area] sprite sheets load failed:', e);
    }
    _spriteSheetsReady = true;
  })();
}

/** 1:1 `CreateAreaMarkerSprites()` (pokedex_area_screen.c:707) : un rond rouge
 *  16×16 par zone spéciale, positionné sur gRegionMapEntries[mapsec]. */
function CreateAreaMarkerSprites(): void {
  const rt = getRuntime();
  const s = sPokedexAreaScreen!;
  if (!rt) return;
  const entries = getRegionMapEntries();
  let numSprites = 0;
  for (let i = 0; i < s.numSpecialAreas; i++) {
    const mapSecId = s.specialAreaRegionMapSectionIds[i];
    const e = entries.get(mapSecId);
    if (!e) continue;
    let x = 8 * (e.x + 1) + 4;
    let y = 8 * e.y + 28;
    x += 4 * (e.width - 1);
    y += 4 * (e.height - 1);
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: MARKER_TILE_BASE, paletteBank: MARKER_PAL_BANK, x, y,
      shape: 0, size: 1 /* 16×16 */, priority: 1,
    });
    const sp = rt.gSprites[spriteId];
    if (sp) sp.invisible = true;
    s.areaMarkerSpriteIds[numSprites++] = spriteId;
  }
  s.numAreaMarkerSprites = numSprites;
}

/** 1:1 `CreateAreaUnknownSprites()` (pokedex_area_screen.c:772) : « ZONE
 *  INCONNUE » (3 sprites 32×32 côte à côte à (160,140)) si aucune zone. */
function CreateAreaUnknownSprites(): void {
  const rt = getRuntime();
  const s = sPokedexAreaScreen!;
  if (!rt) return;
  if (s.numOverworldAreas || s.numSpecialAreas) {
    s.areaUnknownSpriteIds = [];
    return;
  }
  for (let i = 0; i < 3; i++) {
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: UNKNOWN_TILE_BASE + i * 16, paletteBank: UNKNOWN_PAL_BANK,
      x: i * 32 + 160, y: 140,
      shape: 0, size: 2 /* 32×32 */, priority: 1,
    });
    s.areaUnknownSpriteIds.push(spriteId);
  }
}

/** 1:1 `CreateRegionMapPlayerIcon` + `PokedexAreaScreen_UpdateRegionMapVariables
 *  AndVideoRegs(0, -8)` (region_map.c:946) : icône joueur 16×16 à la position
 *  du mapsec courant, décalée de y2 = +8 (la carte est remontée de 8 px). */
function CreatePlayerIconSprite(): void {
  const rt = getRuntime();
  const s = sPokedexAreaScreen!;
  if (!rt) return;
  const loc = _getPlayerMapsecLocation();
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: PLAYER_ICON_TILE_BASE, paletteBank: PLAYER_ICON_PAL_BANK,
    x: loc.x * 8 + 4, y: loc.y * 8 + 4,
    shape: 0, size: 1 /* 16×16 */, priority: 1,
  });
  const sp = rt.gSprites[spriteId];
  if (sp) { sp.x2 = 0; sp.y2 = 8; }   // -(−8) : la carte est décalée de −8
  s.playerIconSpriteId = spriteId;
}

/** 1:1 `DestroyAreaScreenSprites()` (pokedex_area_screen.c:739) + icône joueur. */
function DestroyAreaScreenSprites(): void {
  const s = sPokedexAreaScreen!;
  for (let i = 0; i < s.numAreaMarkerSprites; i++) {
    try { DestroySprite(s.areaMarkerSpriteIds[i]); } catch { /* déjà détruit */ }
  }
  for (const id of s.areaUnknownSpriteIds) {
    try { DestroySprite(id); } catch { /* déjà détruit */ }
  }
  if (s.playerIconSpriteId !== 0xffff) {
    try { DestroySprite(s.playerIconSpriteId); } catch { /* déjà détruit */ }
  }
}

// ─── Entrée / task principale ────────────────────────────────────────────────

/** 1:1 `void ShowPokedexAreaScreen(u16 species, u8 *screenSwitchState)`
 *  (pokedex_area_screen.c:585). `screenSwitchState` = setter (pointeur C). */
export function ShowPokedexAreaScreen(species: number, screenSwitchState: { set(v: number): void }): number {
  const rt = getRuntime();
  if (!rt) return 0xff;
  sPokedexAreaScreen = {
    species,
    speciesKey: (resolveDecompConstantName(species) ?? 'SPECIES_NONE'),
    overworldAreasWithMons: [],
    numOverworldAreas: 0,
    numSpecialAreas: 0,
    drawAreaGlowState: 0,
    areaGlowTilemap: new Uint16Array(AREA_SCREEN_WIDTH * AREA_SCREEN_HEIGHT),
    markerTimer: 0,
    glowTimer: 0,
    areaShadeBldArgLo: 0,
    areaShadeBldArgHi: 0,
    showingMarkers: false,
    markerFlashCounter: 0,
    specialAreaRegionMapSectionIds: [],
    areaMarkerSpriteIds: [],
    numAreaMarkerSprites: 0,
    alteringCaveId: 0,
    screenSwitchState,
    areaUnknownSpriteIds: [],
    playerIconSpriteId: 0xffff,
  };
  screenSwitchState.set(0);
  _loadAreaData();
  const taskId = rt.CreateTask((t) => Task_ShowPokedexAreaScreen(t), 0);
  rt.gTasks[taskId].data[0] = 0;
  return taskId;
}

// species numérique → 'SPECIES_X' (reverse lookup, prefixe conservé par la table).
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
function resolveDecompConstantName(species: number): string | undefined {
  return reverseDecompConstant(species, 'SPECIES_');
}

/** 1:1 `Task_ShowPokedexAreaScreen` (pokedex_area_screen.c:597) — states 0..11. */
function Task_ShowPokedexAreaScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexAreaScreen) return;
  switch (task.data[0]) {
    case 0:
      ResetSpriteData();
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(0);
      HideBg(3);
      HideBg(2);
      HideBg(0);
      break;
    case 1:
      // SetBgAttribute(3, BG_ATTR_CHARBASEINDEX, 3) + LoadPokedexAreaMapGfx.
      rt.gba.bg(3).config.charBaseIndex = 3;
      LoadPokedexAreaMapGfx(sPokedexAreaMapTemplate);
      break;
    case 2:
      if (!_dataReady || TryShowPokedexAreaMap()) return;   // gate données + carte
      PokedexAreaMapChangeBgY(-8);
      break;
    case 3:
      sPokedexAreaScreen.drawAreaGlowState = 0;   // ResetDrawAreaGlowState
      _loadAreaSpriteSheets(rt);
      break;
    case 4:
      if (DrawAreaGlow()) return;
      break;
    case 5:
      // ShowRegionMapForPokedexAreaScreen + CreateRegionMapPlayerIcon +
      // UpdateRegionMapVariablesAndVideoRegs(0, -8) — icône seule (la carte est
      // rendue par pokedex_area_region_map ; le zoom = identité).
      if (!_spriteSheetsReady) return;   // gate sheets (markers/unknown/icône)
      CreatePlayerIconSprite();
      break;
    case 6:
      CreateAreaMarkerSprites();
      break;
    case 7:
      // LoadAreaUnknownGraphics — déjà chargé (case 3, sheets async).
      break;
    case 8:
      CreateAreaUnknownSprites();
      break;
    case 9:
      BeginNormalPaletteFade((~0x14) >>> 0, 0, 16, 0, RGB_BLACK);
      break;
    case 10:
      rt.SetGpuReg(0x50 /* BLDCNT */, 0x01 | 0x40 | 0x100 | 0x3f00);
      StartAreaGlow();
      ShowBg(2);
      ShowBg(3);
      rt.SetGpuReg(0x00 /* DISPCNT */, rt.GetGpuReg(0x00) | 0x1000 /* OBJ_ON */);
      break;
    case 11:
      task.func = (t) => Task_HandlePokedexAreaScreenInput(t);
      task.data[0] = 0;
      return;
  }
  task.data[0]++;
}

const RGB_BLACK = 0;

/** 1:1 `Task_HandlePokedexAreaScreenInput` (pokedex_area_screen.c:656). */
function Task_HandlePokedexAreaScreenInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexAreaScreen) return;
  DoAreaGlow();
  switch (task.data[0]) {
    default:
      task.data[0] = 0;
      // fallthrough
    case 0:
      if (rt.gPaletteFade.active) return;
      break;
    case 1:
      if (rt.gMain.newKeys & 0x0002 /* B_BUTTON */) {
        task.data[1] = 1;
        PlaySE(SE_PC_OFF);
      } else if (rt.gMain.newKeys & 0x0010 /* DPAD_RIGHT */) {
        task.data[1] = 2;
        PlaySE(SE_DEX_PAGE);
      } else {
        return;
      }
      break;
    case 2:
      BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 16, RGB_BLACK);
      break;
    case 3: {
      if (rt.gPaletteFade.active) return;
      DestroyAreaScreenSprites();
      sPokedexAreaScreen.screenSwitchState.set(task.data[1]);
      // ResetPokedexAreaMapBg : BG3 charBase 0 + paletteMode 4bpp.
      rt.gba.bg(3).config.charBaseIndex = 0;
      rt.gba.bg(3).config.paletteMode = 0;
      rt.DestroyTask(task.taskId);
      FreePokedexAreaMapBgNum();
      sPokedexAreaScreen = null;
      return;
    }
  }
  task.data[0]++;
}

// 1:1 mirror partiel de `src/overworld.c` (pokeemerald) — fonctions de musique de map +
// gating vélo. Créé « en chemin » pour le sous-système vélo (bike.ts) qui les appelle.
//
// Musique de map : chaîne de RÉSOLUTION complète portée 2026-07-02 (évolution bug 4) —
// GetLocationMusic/GetCurrLocationDefaultMusic/Overworld_PlaySpecialMapMusic/
// TransitionMapMusic (overworld.c:1010-1205). Le STATE (sCurrentMapMusic +
// MapMusicMain tické chaque frame) vit au foyer src/sound.ts (sound.c). Le moteur
// son m4a lui-même reste exempt ([[hardware-non-1to1-exemptions]]).

import { SetGpuReg } from './gpu_regs';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import {
  gMapHeader, getCachedMapHeader, SetGMapHeader,
  InitBattlePyramidMap, InitTrainerHillMap, InitMapFromSavedGame,
  MAP_OFFSET, MapGridGetMetatileBehaviorAt,
  type MapConnection, type WarpEvent, type MapHeader,
} from './fieldmap';
// MetatileBehavior_IsSurfableWaterOrUnderwater : prédicat FEUILLE (metatile_behavior.ts, aucune
// arête vers overworld → pas de cycle, vérifié). Lu par GetAdjustedInitialTransitionFlags (FIX 2).
import { MetatileBehavior_IsSurfableWaterOrUnderwater } from './metatile_behavior';
import {
  getRuntime, LoadOam, gMain, ResetTasks, ResetPaletteFade, FillPalBufferBlack,
  WININ_WIN0_BG_ALL, WININ_WIN0_OBJ, WININ_WIN1_BG_ALL, WININ_WIN1_OBJ,
  WINOUT_WIN01_BG0, WINOUT_WINOBJ_BG0, BLDALPHA_BLEND,
} from '../harness/runtime/decomp-globals';
import {
  REG_OFFSET_DISPCNT, REG_OFFSET_MOSAIC, REG_OFFSET_WININ, REG_OFFSET_WINOUT,
  REG_OFFSET_WIN0H, REG_OFFSET_WIN0V, REG_OFFSET_WIN1H, REG_OFFSET_WIN1V,
  REG_OFFSET_BLDCNT, REG_OFFSET_BLDALPHA,
  BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ, BLDCNT_EFFECT_BLEND,
} from '../harness/runtime/decomp-runtime';

import {
  DISPCNT_OBJ_ON, DISPCNT_WIN0_ON, DISPCNT_WIN1_ON,
  DISPCNT_OBJ_1D_MAP, DISPCNT_HBLANK_INTERVAL,
} from '../include/gba/io_reg';
import {
  ShowBg, ChangeBgX, ChangeBgY, ScheduleBgCopyTilemapToVram,
  ClearScheduledBgCopiesToVram, ResetTempTileDataBuffers, SetBgMode,
} from './window';
import { ScanlineEffect_Stop } from './scanline_effect';
import { ResetOamRange, ResetSpriteData } from './sprite';
import { InitFieldMessageBox } from './field_message_box';
import { FreeAllOverworldWindowBuffers, InitStandardTextBoxWindows } from './menu';
import { FadeScreen, FADE_FROM_BLACK } from './field_weather';
import {
  MUS_DUMMY, MUS_NONE, MUS_ABNORMAL_WEATHER, MUS_ENCOUNTER_MAGMA, MUS_MT_CHIMNEY,
  MUS_DESERT, MUS_ROUTE118, MUS_ROUTE110, MUS_ROUTE119, MUS_UNDERWATER, MUS_SURF,
} from '../include/constants/songs';
import * as SongsTable from '../include/constants/songs';
import {
  PlayNewMapMusic, GetCurrentMapMusic, FadeOutAndPlayNewMapMusic,
  FadeOutAndFadeInNewMapMusic, ResetMapMusic, FadeOutMapMusic,
  IsNotWaitingForBGMStop, StopMapMusic,
} from './sound';
import {
  MAP_TYPE_INDOOR, MAP_TYPE_SECRET_BASE,
  MAP_TYPE_TOWN, MAP_TYPE_CITY, MAP_TYPE_ROUTE, MAP_TYPE_UNDERWATER, MAP_TYPE_OCEAN_ROUTE,
} from '../include/constants/map_types';
import { MAP_CONSTANTS } from '../include/constants/map_groups';
import { GetSavedWeather } from './field_weather_effect';
import { WEATHER_SANDSTORM } from '../include/constants/weather';
import { FlagGet, FlagClear, VarGet, VarSet } from './engine/script/script-vars';
import { GetHealLocationByName } from './heal_location';
import { GetMoney, SetMoney } from './money';
import { HealPlayerParty } from './script_pokemon_util';
// Bloc warp (unification lot 16, ex engine/field/warp-system.ts) : leafs include/*
// pour les constantes de header ; GetPlayerFacingDirection = function hoistée
// (cycle overworld ↔ field_player_avatar bénin) ; WarpKind = import TYPE-only
// (effacé à la compile → pas d'arête runtime overworld → field_control_avatar).
import { CONNECTION_DIVE, CONNECTION_EMERGE, OBJECT_EVENT_TEMPLATES_COUNT } from '../include/constants/global';
import { DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST } from '../include/global.fieldmap';
import {
  MetatileBehavior_IsDeepSouthWarp, MetatileBehavior_IsNonAnimDoor, MetatileBehavior_IsDoor,
  MetatileBehavior_IsSouthArrowWarp, MetatileBehavior_IsNorthArrowWarp,
  MetatileBehavior_IsWestArrowWarp, MetatileBehavior_IsEastArrowWarp, MetatileBehavior_IsLadder,
} from './metatile_behavior';
import { GetPlayerFacingDirection } from './field_player_avatar';
// ANTI-TDZ : PLAYER_AVATAR_FLAG_ON_FOOT depuis son foyer 1:1 (include/global.fieldmap.ts,
// module FEUILLE) — l'import via field_player_avatar (en cycle ESM avec ce module) laissait
// le binding en TDZ quand overworld s'évaluait en premier → sInitialPlayerAvatarState:1397
// crashait TOUT le boot (ReferenceError avant le moindre rendu).
import { PLAYER_AVATAR_FLAG_ON_FOOT } from '../include/global.fieldmap';
import type { WarpKind } from './field_control_avatar';

// ─── Dépendances des corps CB2_NewGame / CB2_ContinueSavedGame : LAZY (anti-TDZ) ──
// overworld.ts est évalué TRÈS TÔT au boot. Importer STATIQUEMENT ces ~15 modules
// UI-connectés (field_specials→party_menu→item_menu, load_save, tv, event_object_
// movement…) réordonne l'éval ESM et fait EXPLOSER le cycle latent item_menu↔text
// (`FONT_NARROW before initialization`, item_menu.ts top-level) — bombe TDZ
// documentée ([[find-import-cycle]] : « nouvelle arête d'import tôt = réordonne
// l'éval »). Ces fns ne sont appelées qu'au CALL-TIME des corps CB2 (New Game /
// Continue, bien après le boot) → résolution PARESSEUSE via `import()` dynamique
// (chunks séparés, aucune arête d'éval) préchargée par `primeFieldInitDeps()` que le
// harness `await` avant d'exécuter les corps. NB : sound/fieldmap/field_player_avatar
// sont DÉJÀ importés statiquement plus haut (StopMapMusic, InitMapFromSavedGame,
// InitBattlePyramidMap, InitTrainerHillMap, SetGMapHeader, PLAYER_AVATAR_FLAG_ON_FOOT)
// → pas de nouvelle arête, restés en import direct.
let _fieldInitDeps: {
  safari: typeof import('./safari_zone');
  newGame: typeof import('./new_game');
  playTime: typeof import('./play_time');
  script: typeof import('./script');
  trainerHill: typeof import('./trainer_hill');
  battlePyramid: typeof import('./battle_pyramid');
  eom: typeof import('./event_object_movement');
  clock: typeof import('./clock');
  matchCall: typeof import('./match_call');
  loadSave: typeof import('./load_save');
  tv: typeof import('./tv');
  frontier: typeof import('./frontier_util');
  mapPopup: typeof import('./map_name_popup');
  fieldSpecials: typeof import('./field_specials');
  save: typeof import('./save');
} | null = null;

/** Précharge (call-time, chunks séparés) les modules-deps des corps CB2 field-init.
 *  À `await` par le harness AVANT d'appeler CB2_NewGame / CB2_ContinueSavedGame.
 *  Idempotent. Anti-TDZ : cf. note ci-dessus. */
export async function primeFieldInitDeps(): Promise<void> {
  if (_fieldInitDeps) return;
  const [
    safari, newGame, playTime, script, trainerHill, battlePyramid, eom, clock,
    matchCall, loadSave, tv, frontier, mapPopup, fieldSpecials, save,
  ] = await Promise.all([
    import('./safari_zone'), import('./new_game'), import('./play_time'), import('./script'),
    import('./trainer_hill'), import('./battle_pyramid'), import('./event_object_movement'),
    import('./clock'), import('./match_call'), import('./load_save'), import('./tv'),
    import('./frontier_util'), import('./map_name_popup'), import('./field_specials'), import('./save'),
  ]);
  _fieldInitDeps = {
    safari, newGame, playTime, script, trainerHill, battlePyramid, eom, clock,
    matchCall, loadSave, tv, frontier, mapPopup, fieldSpecials, save,
  };
}

function fieldInitDeps(): NonNullable<typeof _fieldInitDeps> {
  if (!_fieldInitDeps) {
    throw new Error('[overworld] primeFieldInitDeps() doit être await AVANT CB2_NewGame/'
      + 'CB2_ContinueSavedGame (harness bootOverworld)');
  }
  return _fieldInitDeps;
}

/** 1:1 décomp `enum { BG_COORD_SET, BG_COORD_ADD }` (bg.h:26) → BG_COORD_SET = 0.
 *  Const locale (pas d'enum bg.h porté côté valeur). */
const BG_COORD_SET = 0;

/** 1:1 décomp `gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1 = 8`. Const
 *  locale (import statique de script-opcodes-screen-fx ferme un cycle ESM → TDZ). */
const gMaxFlashLevel = 8;

// ─── Map header lookup (1:1 décomp `src/overworld.c:579`) ─────────────────────
//
// Décyclé du bridge (foyer 1:1 = overworld.c). Notre map data est async (fetch
// JSON) alors que la fn décomp est sync (`return gMapGroups[mapGroup][mapNum];`).
// Port : (1) registre `defineMapHeaderEntry` (legacy, vide à ce jour), puis
// (2) cache SYNC de fieldmap.ts (`getCachedMapHeader`, peuplé par loadMapHeader :
// boot + prefetch connexions + pré-chargement du header dest avant warp) via le
// reverse-index MAP_CONSTANTS (group, num) → 'MAP_*'. Sinon header
// structurellement vide pour éviter le crash.
const _mapHeaderRegistry = new Map<string, any>();
export function defineMapHeaderEntry(key: string, header: any): void {
  _mapHeaderRegistry.set(key, header);
}
/** Reverse-index (group<<8|num) → nom 'MAP_*', construit lazy depuis MAP_CONSTANTS
 *  (map_groups.ts, généré 1:1 depuis map_groups.json). */
let _mapNameByPacked: Map<number, string> | null = null;
function _mapNameByGroupAndNum(mapGroup: number, mapNum: number): string | undefined {
  if (!_mapNameByPacked) {
    _mapNameByPacked = new Map<number, string>();
    for (const [name, packed] of Object.entries(MAP_CONSTANTS))
      _mapNameByPacked.set(packed, name);
  }
  return _mapNameByPacked.get(((mapGroup & 0xFF) << 8) | (mapNum & 0xFF));
}
/** 1:1 décomp `src/overworld.c:579 Overworld_GetMapHeaderByGroupAndId(group, num)` :
 *    return gMapGroups[mapGroup][mapNum]; */
export function Overworld_GetMapHeaderByGroupAndId(mapGroup: number, mapNum: number): any {
  const key = `${mapGroup}.${mapNum}`;
  const header = _mapHeaderRegistry.get(key);
  if (header) return header;
  // gMapGroups en ROM = lecture sync ; équivalent port = cache fieldmap.
  const name = _mapNameByGroupAndNum(mapGroup, mapNum);
  if (name) {
    const cached = getCachedMapHeader(name);
    if (cached) return cached;
  }
  // Fallback : header structurellement vide (champs .music/.mapType/.battleType = 0/undef).
  return {
    mapLayoutId: 0,
    events: { objectEventCount: 0, warpCount: 0, coordEventCount: 0, bgEventCount: 0,
              objectEvents: [], warps: [], coordEvents: [], bgEvents: [] },
    mapScripts: [],
    connections: { count: 0, connections: [] },
    music: 0,
    mapLayoutId16: 0,
    regionMapSectionId: 0,
    cave: 0,
    weather: 0,
    mapType: 0,
    bikingAllowed: 0,
    allowEscaping: 0,
    allowRunning: 0,
    showMapName: 0,
    battleType: 0,
  };
}

/** 1:1 STRICT décomp `Overworld_MapTypeAllowsTeleportAndFly(u8 mapType)` (overworld.c:1366) :
 *    return (mapType == ROUTE || TOWN || OCEAN_ROUTE || CITY).
 *  `mapType` = STRING dans le port (= json.map_type, ex. "MAP_TYPE_TOWN"). */
export function Overworld_MapTypeAllowsTeleportAndFly(mapType: string | number | undefined): boolean {
  return mapType === 'MAP_TYPE_ROUTE'
      || mapType === 'MAP_TYPE_TOWN'
      || mapType === 'MAP_TYPE_OCEAN_ROUTE'
      || mapType === 'MAP_TYPE_CITY';
}

/** 1:1 décomp `bool8 IsMapTypeIndoors(u8 mapType)` (overworld.c:1377-1384) :
 *    if (mapType == MAP_TYPE_INDOOR || mapType == MAP_TYPE_SECRET_BASE) return TRUE;
 *  `mapType` = STRING dans les headers JSON du port (ex. 'MAP_TYPE_INDOOR') ;
 *  accepte aussi la forme numérique (registre legacy). */
export function IsMapTypeIndoors(mapType: string | number | undefined): boolean {
  if (mapType === 'MAP_TYPE_INDOOR'
   || mapType === 'MAP_TYPE_SECRET_BASE'
   || mapType === MAP_TYPE_INDOOR
   || mapType === MAP_TYPE_SECRET_BASE)
    return true;
  else
    return false;
}

/** 1:1 STRICT décomp `Overworld_ResetStateAfterTeleport(void)` (overworld.c:partie sup.) :
 *    ResetInitialPlayerAvatarState();
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *    RunScriptImmediately(EventScript_ResetMrBriney);
 *  Port : les FlagClear (état de map transitoire). `ResetInitialPlayerAvatarState`
 *  (re-spawn avatar) + `RunScriptImmediately(EventScript_ResetMrBriney)` (reset NPC
 *  bateau M. Brine) = dette mineure (non porté ici). */
export function Overworld_ResetStateAfterTeleport(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
}

/** 1:1 STRICT décomp `Overworld_ResetStateAfterFly(void)` (overworld.c:370-378) :
 *    ResetInitialPlayerAvatarState();   // dette mineure (re-spawn avatar), cf. cousins
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *  Appelée par Task_UseFly (field_effect_helpers) avant le warp d'envol. */
export function Overworld_ResetStateAfterFly(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
}

/** 1:1 STRICT décomp `Overworld_ResetStateAfterDigEscRope(void)` (overworld.c) :
 *    ResetInitialPlayerAvatarState();   // dette mineure (re-spawn avatar)
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *  (= identique à ResetStateAfterTeleport sans le RunScriptImmediately(ResetMrBriney).) */
export function Overworld_ResetStateAfterDigEscRope(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
}

/** 1:1 STRICT décomp `Overworld_ResetStateAfterWhiteOut(void)` (overworld.c:399) :
 *    ResetInitialPlayerAvatarState();   // dette mineure (re-spawn avatar, idem Teleport/DigEscRope)
 *    FlagClear(FLAG_SYS_CYCLING_ROAD/CRUISE_MODE/SAFARI_MODE/USE_STRENGTH/USE_FLASH);
 *    if (VarGet(VAR_SHOULD_END_ABNORMAL_WEATHER) == 1) {
 *        VarSet(VAR_SHOULD_END_ABNORMAL_WEATHER, 0);
 *        VarSet(VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_NONE);  // = 0
 *    }
 *  Appelé par DoWhiteOut (overworld.c:363) après HealPlayerParty, AVANT le warp respawn :
 *  remet l'avatar à pied + coupe surf/strength/flash/vélo (sinon on réapparaît en surfant). */
export function Overworld_ResetStateAfterWhiteOut(): void {
  FlagClear('FLAG_SYS_CYCLING_ROAD');
  FlagClear('FLAG_SYS_CRUISE_MODE');
  FlagClear('FLAG_SYS_SAFARI_MODE');
  FlagClear('FLAG_SYS_USE_STRENGTH');
  FlagClear('FLAG_SYS_USE_FLASH');
  // Fin de la météo anormale (Kyogre/Groudon) si le compteur de pas a saturé.
  if (VarGet('VAR_SHOULD_END_ABNORMAL_WEATHER') === 1) {
    VarSet('VAR_SHOULD_END_ABNORMAL_WEATHER', 0);
    VarSet('VAR_ABNORMAL_WEATHER_LOCATION', 0);  // ABNORMAL_WEATHER_NONE
  }
}

/** 1:1 décomp `SetContinueGameWarp(s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y)`
 *  (overworld.c:723) = SetWarpData(&sb1->continueGameWarp, …). Adaptation
 *  name-based : mapGroup/mapNum → nom de map + bridge `__continueGameWarpMapId`
 *  (même pattern que dynamicWarp/__dynamicWarpMapId, cf. load_save.ts). */
export function SetContinueGameWarp(mapName: string, warpId: number, x: number, y: number): void {
  const b1 = gSaveBlock1Ptr as {
    continueGameWarp?: { mapGroup: number; mapNum: number; warpId: number; x: number; y: number };
    __continueGameWarpMapId?: string;
  };
  b1.continueGameWarp = { mapGroup: -1, mapNum: -1, warpId, x, y };
  b1.__continueGameWarpMapId = mapName;
}

/** 1:1 décomp `SetContinueGameWarpToHealLocation(u8 healLocationId)` (overworld.c:728) :
 *  résout le lieu de soins → continueGameWarp (WARP_ID_NONE = -1). Name-based. */
export function SetContinueGameWarpToHealLocation(healLocationId: string): void {
  const healLocation = GetHealLocationByName(healLocationId);
  if (healLocation) SetContinueGameWarp(healLocation.map, -1, healLocation.x, healLocation.y);
}

/** 1:1 décomp `DoWhiteOut(void)` (overworld.c:358-366) :
 *  ```c
 *  RunScriptImmediately(EventScript_WhiteOut);      // reset Elite Four + Mr Briney
 *  SetMoney(&gSaveBlock1Ptr->money, GetMoney(...) / 2);
 *  HealPlayerParty();
 *  Overworld_ResetStateAfterWhiteOut();
 *  SetWarpDestinationToLastHealLocation();
 *  WarpIntoMap();
 *  ```
 *  ADAPTATIONS : warp = pending-warp name-based via respawnLocation (même mécanisme
 *  que le whiteout combat, battle-decomp-loop.ts) ; RunScriptImmediately en import
 *  dynamique (anti-cycle script ↔ overworld) ; setPendingWarp = LOCAL depuis
 *  l'unification lot 16 (ex warp-system dissous ici). */
export function DoWhiteOut(): void {
  void import('./script').then((m) => {
    try { m.RunScriptImmediately('EventScript_WhiteOut'); } catch (e) { console.warn('[DoWhiteOut] EventScript_WhiteOut KO', e); }
  });
  SetMoney(Math.floor(GetMoney() / 2));
  HealPlayerParty();
  Overworld_ResetStateAfterWhiteOut();
  const respawn = (gSaveBlock1Ptr as { respawnLocation?: string }).respawnLocation;
  const heal = GetHealLocationByName(respawn);
  if (heal) {
    setPendingWarp({ destMap: heal.map, x: heal.x, y: heal.y, elevation: 0, warpId: -1 }, 'step');
    console.log(`[DoWhiteOut] respawn warp → ${heal.map} (${heal.x},${heal.y})`);
  } else {
    console.warn('[DoWhiteOut] respawnLocation non résolue :', respawn);
  }
}

/** 1:1 STRICT décomp `SetDefaultFlashLevel(void)` (overworld.c:970) :
 *    if (!gMapHeader.cave)            gSaveBlock1Ptr->flashLevel = 0;          // pleine lumière
 *    else if (FlagGet(FLAG_SYS_USE_FLASH)) gSaveBlock1Ptr->flashLevel = 1;    // grand cercle (Flash utilisé)
 *    else                            gSaveBlock1Ptr->flashLevel = gMaxFlashLevel - 1;  // = 7 (petit cercle, grotte sombre)
 *  Appelé au map load (overworld.c:805, juste avant RunOnTransitionMapScript) →
 *  une grotte (cave = json.requires_flash) sans CS Flash s'affiche en pénombre.
 *  `SetFlashLevel` pose `gSaveBlock1Ptr->flashLevel` — lu par `GetFlashLevel()` et
 *  `InitCurrentFlashLevelScanlineEffect` (arme la fenêtre WIN0 par-scanline du flash). */
export function SetDefaultFlashLevel(): void {
  let level: number;
  if (!gMapHeader || !gMapHeader.cave) level = 0;
  else if (FlagGet('FLAG_SYS_USE_FLASH')) level = 1;
  else level = gMaxFlashLevel - 1;  // = 7
  // SetFlashLevel via globalThis (anti-cycle ESM) — pose gSaveBlock1Ptr->flashLevel.
  const setFlash = (globalThis as Record<string, unknown>).__SetFlashLevel as ((l: number) => void) | undefined;
  setFlash?.(level);
}

/** 1:1 décomp `Overworld_SetSavedMusic` (overworld.c:1160) :
 *    gSaveBlock1Ptr->savedMusic = songNum; */
export function Overworld_SetSavedMusic(songNum: number): void {
  gSaveBlock1Ptr.savedMusic = songNum;
}

/** 1:1 décomp `Overworld_ClearSavedMusic` (overworld.c:1165) :
 *    gSaveBlock1Ptr->savedMusic = MUS_DUMMY; */
export function Overworld_ClearSavedMusic(): void {
  gSaveBlock1Ptr.savedMusic = MUS_DUMMY;
}

// ─── sWarpDestination + chaîne warp (1:1 overworld.c:194 + 540-641) ──────────

/** 1:1 décomp `EWRAM_DATA static struct WarpData sWarpDestination = {0};`
 *  (overworld.c:194) — destination du prochain warp. Posée par
 *  `SetWarpDestination*` (sites : executeWarp harness = SetupWarp/Do*Warp,
 *  SetDiveWarp ci-dessous, handleConnectionTransition =
 *  LoadMapFromCameraTransition:788) ; consommée par GetWarpDestinationMusic,
 *  GetDestinationWarpMapHeader/GetMapMusicFadeoutSpeed, TryFadeOutOldMapMusic
 *  et ApplyCurrentWarp. */
const sWarpDestination: WarpData = { mapGroup: 0, mapNum: 0, warpId: 0, x: 0, y: 0 };

/** 1:1 décomp `static void SetWarpData(struct WarpData *warp, s8 mapGroup,
 *  s8 mapNum, s8 warpId, s8 x, s8 y)` (overworld.c:554-561). */
function SetWarpData(warp: WarpData, mapGroup: number, mapNum: number, warpId: number, x: number, y: number): void {
  warp.mapGroup = mapGroup;
  warp.mapNum = mapNum;
  warp.warpId = warpId;
  warp.x = x;
  warp.y = y;
}

/** 1:1 décomp `void SetWarpDestination(s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y)`
 *  (overworld.c:633-636) : SetWarpData(&sWarpDestination, …). */
export function SetWarpDestination(mapGroup: number, mapNum: number, warpId: number, x: number, y: number): void {
  SetWarpData(sWarpDestination, mapGroup, mapNum, warpId, x, y);
}

/** ADAPTATION port (modèle warp name-based) : résout 'MAP_*' → (group, num) via
 *  MAP_CONSTANTS puis SetWarpDestination 1:1. Consommé par les call-sites décomp
 *  qui chez nous transportent le NOM de map (executeWarp, SetDiveWarp
 *  ci-dessous, handleConnectionTransition). Map inconnue → (-1, -1)
 *  (≈ MAP_UNDEFINED) : GetLocationMusic retombera sur le header vide (music 0). */
export function SetWarpDestinationFromMapName(mapName: string, warpId: number, x: number, y: number): void {
  const packed = MAP_CONSTANTS[mapName];
  if (packed === undefined) {
    console.warn(`[overworld] SetWarpDestinationFromMapName : map inconnue '${mapName}'`);
    SetWarpDestination(-1, -1, warpId, x, y);
    return;
  }
  SetWarpDestination(packed >> 8, packed & 0xFF, warpId, x, y);
}

/** ADAPTATION port (modèle par-valeur du pending-warp, cf. setPendingWarp ci-dessous) :
 *  lecture de `sWarpDestination` pour les foyers field_effect — Task_UseFly y traduit le
 *  `WarpIntoMap(); SetMainCallback2(CB2_LoadMap)` du décomp en setPendingWarp(kind 'fly').
 *  Résout aussi le NOM de map (destMap) depuis (group, num) via le cache fieldmap. */
export function getWarpDestination(): { destMap: string | null; x: number; y: number; warpId: number } {
  return {
    destMap: _mapNameByGroupAndNum(sWarpDestination.mapGroup, sWarpDestination.mapNum) ?? null,
    x: sWarpDestination.x,
    y: sWarpDestination.y,
    warpId: sWarpDestination.warpId,
  };
}

/** 1:1 décomp `struct MapHeader const *const GetDestinationWarpMapHeader(void)`
 *  (overworld.c:584-587). */
export function GetDestinationWarpMapHeader(): any {
  return Overworld_GetMapHeaderByGroupAndId(sWarpDestination.mapGroup, sWarpDestination.mapNum);
}

/** 1:1 décomp `void ApplyCurrentWarp(void)` (overworld.c:540-546) :
 *    gLastUsedWarp = gSaveBlock1Ptr->location;
 *    gSaveBlock1Ptr->location = sWarpDestination;
 *    sFixedDiveWarp = sDummyWarpData;
 *    sFixedHoleWarp = sDummyWarpData;
 *  `gLastUsedWarp` vit désormais ici (unification lot 16 — l'ex-pont
 *  `globalThis.__setLastUsedWarp` anti-cycle warp-system↔overworld est dissous).
 *  `sFixedDiveWarp`/`sFixedHoleWarp` : statics non portés (dette dive/hole fixe
 *  documentée sur SetDiveWarp ci-dessous) → les 2 clears sont sans objet. */
export function ApplyCurrentWarp(): void {
  setLastUsedWarp(gSaveBlock1Ptr.location as WarpData);
  gSaveBlock1Ptr.location = { ...sWarpDestination };
}

/** 1:1 décomp `EWRAM_DATA static u8 sLastMapSectionId`. Écrit par LoadCurrentMapData
 *  (regionMapSectionId de l'ancienne map, pour la transition du popup de nom de map).
 *  Notre `regionMapSectionId` est une string → static string. */
let sLastMapSectionId: string | number = 0;

/** 1:1 décomp `static void ClearDiveAndHoleWarps(void)` (overworld.c:548-552) :
 *    sFixedDiveWarp = sDummyWarpData; sFixedHoleWarp = sDummyWarpData;
 *  `sFixedDiveWarp`/`sFixedHoleWarp` = statics NON portés (dette dive/hole fixe
 *  déjà documentée sur ApplyCurrentWarp/SetDiveWarp) → no-op 1:1. */
function ClearDiveAndHoleWarps(): void {
  // sFixedDiveWarp = sDummyWarpData; sFixedHoleWarp = sDummyWarpData; (statics non portés)
}

/** 1:1 décomp `static void LoadCurrentMapData(void)` (overworld.c:589-595) :
 *    sLastMapSectionId = gMapHeader.regionMapSectionId;
 *    gMapHeader = *Overworld_GetMapHeaderByGroupAndId(location.mapGroup, location.mapNum);
 *    gSaveBlock1Ptr->mapLayoutId = gMapHeader.mapLayoutId;
 *    gMapHeader.mapLayout = GetMapLayout();
 *
 *  ADAPTATION ROM→fetch : header servi par le cache map-loader
 *  (`Overworld_GetMapHeaderByGroupAndId` = cache sync, cf. overworld.ts:130),
 *  préchargé par le harness AVANT l'appel du corps (cf. executeWarp). JAMAIS de fetch ici.
 *  - `gSaveBlock1Ptr->mapLayoutId = gMapHeader.mapLayoutId` : vestigial dans le port
 *    (mapLayoutId saveblock = number, header = string 'LAYOUT_*' ; le port ne porte pas
 *    `gMapLayouts` — le layout est résolu au fetch et vit dans `header.mapLayout`).
 *  - `gMapHeader.mapLayout = GetMapLayout()` : no-op (le header du cache porte déjà
 *    son `.mapLayout`, peuplé depuis le JSON au load). */
function LoadCurrentMapData(): void {
  if (gMapHeader) sLastMapSectionId = gMapHeader.regionMapSectionId;
  SetGMapHeader(Overworld_GetMapHeaderByGroupAndId(
    gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum));
}

/** 1:1 décomp `static void LoadSaveblockMapHeader(void)` (overworld.c:597-601) :
 *    gMapHeader = *Overworld_GetMapHeaderByGroupAndId(location.mapGroup, location.mapNum);
 *    gMapHeader.mapLayout = GetMapLayout();
 *  Même ADAPTATION ROM→fetch que LoadCurrentMapData (header servi par le cache
 *  map-loader préchargé par le harness ; l'assignation `.mapLayout = GetMapLayout()`
 *  est un no-op — le header du cache porte déjà son layout). */
function LoadSaveblockMapHeader(): void {
  SetGMapHeader(Overworld_GetMapHeaderByGroupAndId(
    gSaveBlock1Ptr.location.mapGroup, gSaveBlock1Ptr.location.mapNum));
}

/** 1:1 décomp `static void SetPlayerCoordsFromWarp(void)` (overworld.c:603-624) —
 *  variante MUTEUSE : résout `gSaveBlock1Ptr->pos` depuis `location.warpId` +
 *  `gMapHeader`. NB : distincte de `getPlayerCoordsFromWarp` (variante RETOURNANTE
 *  ci-dessous) — cette dernière prend le header dest en paramètre et n'a PAS la
 *  branche médiane `location.x/y valides` ; sémantiques différentes → transcription
 *  directe (pas de réutilisation). */
function SetPlayerCoordsFromWarp(): void {
  const loc = gSaveBlock1Ptr.location;
  const warps = gMapHeader?.events?.warps ?? [];
  if (loc.warpId >= 0 && loc.warpId < warps.length) {
    // warpId valide pour cette map → coords de ce warp.
    gSaveBlock1Ptr.pos.x = warps[loc.warpId].x;
    gSaveBlock1Ptr.pos.y = warps[loc.warpId].y;
  } else if (loc.x >= 0 && loc.y >= 0) {
    // warpId invalide mais coords valides (WARP_ID_NONE arrive ici volontairement).
    gSaveBlock1Ptr.pos.x = loc.x;
    gSaveBlock1Ptr.pos.y = loc.y;
  } else {
    // warpId ET coords invalides → centre de la map.
    gSaveBlock1Ptr.pos.x = Math.floor((gMapHeader?.mapLayout?.width ?? 0) / 2);
    gSaveBlock1Ptr.pos.y = Math.floor((gMapHeader?.mapLayout?.height ?? 0) / 2);
  }
}

/** 1:1 décomp `void WarpIntoMap(void)` (overworld.c:626-631) :
 *    ApplyCurrentWarp(); LoadCurrentMapData(); SetPlayerCoordsFromWarp(); */
export function WarpIntoMap(): void {
  ApplyCurrentWarp();
  LoadCurrentMapData();
  SetPlayerCoordsFromWarp();
}

/** 1:1 décomp `static void SetWarpDestinationToContinueGameWarp(void)`
 *  (overworld.c:718-721) : `sWarpDestination = gSaveBlock1Ptr->continueGameWarp;`.
 *  Mutation par champ (sWarpDestination gardé par référence — GetLocationMusic le lit). */
function SetWarpDestinationToContinueGameWarp(): void {
  const cgw = gSaveBlock1Ptr.continueGameWarp as WarpData;
  sWarpDestination.mapGroup = cgw.mapGroup;
  sWarpDestination.mapNum = cgw.mapNum;
  sWarpDestination.warpId = cgw.warpId;
  sWarpDestination.x = cgw.x;
  sWarpDestination.y = cgw.y;
}

// ─── Pending warp + dynamic/dive warp + map types (unification lot 16) ───────
// Rapatrié de engine/field/warp-system.ts — foyer 1:1 overworld.c (sauf mention).

/** ADAPTATION port (modèle pending-warp) : équivalent du couple
 *  `sWarpDestination` + déclencheur. Le décomp enchaîne SetupWarp → DoWarp() →
 *  CreateTask(Task_WarpAndLoadMap) → SetMainCallback2(CB2_LoadMap) ; notre scène
 *  (MainCB2_Overworld, harness TestOverworldScene) consomme le warp posé ici via
 *  `getPendingWarp()` → executeWarp (fade 1:1 + load dest + exit task selon la
 *  tuile d'arrivée). La dest transite PAR VALEUR ({destMap, x, y, warpId}) au
 *  lieu du static sWarpDestination — même chemin que __devGotoMap. */
let _gPendingWarp: WarpEvent | null = null;
let _gPendingWarpKind: WarpKind | null = null;

export function setPendingWarp(warp: WarpEvent | null, kind: WarpKind | null = null): void {
  _gPendingWarp = warp;
  _gPendingWarpKind = kind;
}

export function getPendingWarp(): { warp: WarpEvent; kind: WarpKind } | null {
  if (!_gPendingWarp || !_gPendingWarpKind) return null;
  return { warp: _gPendingWarp, kind: _gPendingWarpKind };
}

/** 1:1 décomp `GetAdjustedInitialDirection` (overworld.c:929-952). Détermine
 *  la direction du facing du player après le load de la dest map, selon le
 *  metatile_behavior à la position post-warp + son ancien facing.
 *
 *  Décomp appelé via `GetInitialPlayerAvatarState()` → `InitObjectEventsLocal`
 *  → `InitPlayerAvatar(x, y, direction, gender)` au spawn dans la dest map.
 *  Donc le facing est défini AVANT que `FieldCB_DefaultWarpExit` ne lance
 *  `Task_ExitNonAnimDoor` qui lit `GetPlayerFacingDirection()` pour walker
 *  dans cette direction (= push 1 case).
 *
 *  Skipped (dette documentée, à porter si besoin) :
 *  - FLAG_SYS_CRUISE_MODE + MAP_TYPE_OCEAN_ROUTE → DIR_EAST
 *  - underwater/surfing transition flags
 *  - MetatileBehavior_IsWaterDoor → traitée comme MB_NON_ANIMATED_DOOR
 *    (= notre classifier IsNonAnimDoor inclut MB_WATER_DOOR, c'est cohérent). */
export function GetAdjustedInitialDirection(
  metatileBehavior: number,
  previousDirection: number,
): number {
  // 1:1 décomp branches (= overworld.c:929-952, ordre conservé pour priorité
  // identique).
  if (MetatileBehavior_IsDeepSouthWarp(metatileBehavior)) return DIR_NORTH;
  if (MetatileBehavior_IsNonAnimDoor(metatileBehavior)) return DIR_SOUTH;
  if (MetatileBehavior_IsDoor(metatileBehavior)) return DIR_SOUTH;
  if (MetatileBehavior_IsSouthArrowWarp(metatileBehavior)) return DIR_NORTH;
  if (MetatileBehavior_IsNorthArrowWarp(metatileBehavior)) return DIR_SOUTH;
  if (MetatileBehavior_IsWestArrowWarp(metatileBehavior)) return DIR_EAST;
  if (MetatileBehavior_IsEastArrowWarp(metatileBehavior)) return DIR_WEST;
  if (MetatileBehavior_IsLadder(metatileBehavior)) return previousDirection;
  // Default 1:1 décomp ligne 951 : DIR_SOUTH.
  return DIR_SOUTH;
}

/** 1:1 décomp `SetPlayerCoordsFromWarp` (overworld.c:603) — résout les coords
 *  du player dans la map dest depuis warp.warpId.
 *
 *  Comportement 1:1 décomp : préserve le facing courant ; c'est la scène
 *  executeWarp qui override DIR_SOUTH pour les exit tasks door/non_anim
 *  (Task_ExitDoor/Task_ExitNonAnimDoor = walk-down), et les ladders/arrows/
 *  escalators gardent leur facing (GetAdjustedInitialDirection ci-dessus).
 *
 *  @returns { x, y, facing } pour spawn dans la dest map. */
export function getPlayerCoordsFromWarp(
  destMapHeader: MapHeader,
  destWarpId: number,
): { x: number; y: number; facing: number } {
  const warps = destMapHeader.events.warps;
  const id = (destWarpId >= 0 && destWarpId < warps.length) ? destWarpId : 0;
  if (id !== destWarpId) {
    console.warn(`[overworld] destWarpId ${destWarpId} out of range (${warps.length} warps), fallback 0`);
  }
  const dest = warps[id];
  if (!dest) {
    return {
      x: Math.floor(destMapHeader.mapLayout.width / 2),
      y: Math.floor(destMapHeader.mapLayout.height / 2),
      facing: GetPlayerFacingDirection(),  // = preserve current facing
    };
  }
  return { x: dest.x, y: dest.y, facing: GetPlayerFacingDirection() };
}

/** 1:1 décomp `ScrCmd_setdynamicwarp` (scrcmd.c) :
 *    SetDynamicWarp(mapGroup, mapNum, warpId);
 *  Stocke dans `gSaveBlock1Ptr->dynamicWarp` la prochaine destination MAP_DYNAMIC.
 *  Notre port : mapId est string (= conversion mapGroup/mapNum → name déférée),
 *  stocké dans `__dynamicWarpMapId` overlay. */
export function SetDynamicWarp(mapId: string, x: number, y: number): void {
  gSaveBlock1Ptr.dynamicWarp = { mapGroup: 0, mapNum: 0, warpId: -1, x, y };
  (gSaveBlock1Ptr as unknown as Record<string, string>).__dynamicWarpMapId = mapId;
}

/** 1:1 décomp `GetDynamicWarp` accessor : lit gSaveBlock1Ptr->dynamicWarp.
 *  Retourne undefined si pas set. */
export function GetDynamicWarp(): { mapId: string; x: number; y: number } | undefined {
  const w = gSaveBlock1Ptr.dynamicWarp as { x: number; y: number } | undefined;
  const mapId = (gSaveBlock1Ptr as unknown as Record<string, string>).__dynamicWarpMapId;
  if (!mapId || !w) return undefined;
  return { mapId, x: w.x, y: w.y };
}

// ─── Dive warp (1:1 overworld.c:740-781 + field_screen_effect.c:495) ─────────
//
// Le décomp stocke la destination dans `sWarpDestination` (consommé par
// WarpIntoMap au chargement). Notre modèle pending-warp transporte la dest DANS
// l'objet (destMap/x/y, warpId:-1 = coords directes — même chemin que
// __devGotoMap, PROUVÉ : une map underwater charge bien). On stocke donc la dest
// dans `_sDiveWarpDest` puis `DoDiveWarp` la pousse via setPendingWarp.

/** Destination du prochain warp Dive, posée par SetDiveWarp, consommée par DoDiveWarp. */
let _sDiveWarpDest: { destMap: string; x: number; y: number } | null = null;

/** 1:1 STRICT décomp `SetDiveWarp(u8 dir, u16 x, u16 y)` (overworld.c:756) :
 *    connection = GetMapConnection(dir);
 *    if (connection != NULL) SetWarpDestination(connection->mapGroup, mapNum, WARP_ID_NONE, x, y);
 *    else { RunOnDiveWarpMapScript(); if (IsDummyWarp(&sFixedDiveWarp)) return FALSE; SetWarpDestinationToDiveWarp(); }
 *    return TRUE;
 *  (x, y) = coords LOCALES du joueur. Branche connexion = cas commun (Route124→Underwater).
 *  ⚠️ DETTE : la branche `sFixedDiveWarp` (maps à dive warp fixe via opcode `setdivewarp` :
 *  Marine Cave, Sealed Chamber…) n'est pas portée → on retourne FALSE s'il n'y a pas de
 *  connexion (= "pas de dive ici", comportement honnête, pas un stub qui fait semblant). */
function SetDiveWarp(dir: number, x: number, y: number): boolean {
  const connection = GetMapConnection(dir);
  if (connection !== null) {
    // 1:1 décomp `SetWarpDestination(connection->mapGroup, connection->mapNum,
    // WARP_ID_NONE, x, y)` (overworld.c:762) : pose sWarpDestination — consommée
    // par TryFadeOutOldMapMusic/GetWarpDestinationMusic + ApplyCurrentWarp au
    // moment du warp.
    SetWarpDestinationFromMapName(connection.destMap, -1, x, y);
    // Modèle pending-warp du port : la dest transite AUSSI par _sDiveWarpDest
    // (consommée par DoDiveWarp → setPendingWarp).
    _sDiveWarpDest = { destMap: connection.destMap, x, y };
    return true;
  }
  // Branche fixed-dive-warp non portée (dette documentée).
  return false;
}

/** 1:1 STRICT décomp `SetDiveWarpEmerge(u16 x, u16 y)` (overworld.c:774). */
export function SetDiveWarpEmerge(x: number, y: number): boolean {
  return SetDiveWarp(CONNECTION_EMERGE, x, y);
}

/** 1:1 STRICT décomp `SetDiveWarpDive(u16 x, u16 y)` (overworld.c:779). */
export function SetDiveWarpDive(x: number, y: number): boolean {
  return SetDiveWarp(CONNECTION_DIVE, x, y);
}

/** 1:1 décomp `DoDiveWarp(void)` — ⚠️ foyer décomp = field_screen_effect.c:495 ;
 *  hébergé ici (overworld.ts) par le canal `_sDiveWarpDest` de l'adaptation
 *  pending-warp — à déplacer quand Task_WarpAndLoadMap & co seront transcrits
 *  dans field_screen_effect.ts. Décomp :
 *    LockPlayerFieldControls(); TryFadeOutOldMapMusic(); WarpFadeOutScreen();
 *    PlayRainStoppingSoundEffect(); gFieldCallback = FieldCB_DefaultWarpExit;
 *    CreateTask(Task_WarpAndLoadMap, 10);
 *  Adaptation port : le warp = `setPendingWarp(dest, 'step')` (la scène MainCB2 le
 *  consomme → executeWarp = LockPlayerFieldControls + TryFadeOutOldMapMusic +
 *  fade + Task_WarpAndLoadMap + exit task selon la tuile dest, comme
 *  __devGotoMap). La dest doit avoir été posée par SetDiveWarpDive/Emerge
 *  (qui pose aussi sWarpDestination ci-dessus). */
export function DoDiveWarp(): void {
  if (!_sDiveWarpDest) return;
  setPendingWarp(
    { destMap: _sDiveWarpDest.destMap, x: _sDiveWarpDest.x, y: _sDiveWarpDest.y, elevation: 0, warpId: -1 },
    'step',
  );
}

// ─── Map type helpers (1:1 décomp overworld.c:193 + 1334-1364) ───────────────

/** 1:1 décomp `EWRAM_DATA struct WarpData gLastUsedWarp = {0}` (overworld.c:193).
 *  Mémorise la map source d'où le player vient d'arriver. Set par ApplyCurrentWarp
 *  (overworld.c:542) AVANT le swap location → dest.
 *
 *  Notre port : à jour via setLastUsedWarp() (appelé par ApplyCurrentWarp).
 *  Dette R3 documentée : wire setLastUsedWarp dans tous les flow Do*Warp. */
export const gLastUsedWarp: WarpData = { mapGroup: 0, mapNum: 0, warpId: 0, x: 0, y: 0 };

/** 1:1 décomp ApplyCurrentWarp prelude (overworld.c:542) :
 *  `gLastUsedWarp = gSaveBlock1Ptr->location;`. Doit être appelé AVANT que
 *  gSaveBlock1Ptr.location soit overwrite par le swap warp. */
export function setLastUsedWarp(w: WarpData): void {
  gLastUsedWarp.mapGroup = w.mapGroup;
  gLastUsedWarp.mapNum = w.mapNum;
  gLastUsedWarp.warpId = w.warpId;
  gLastUsedWarp.x = w.x;
  gLastUsedWarp.y = w.y;
}

/** 1:1 décomp `u8 GetMapTypeByGroupAndId(s8 mapGroup, s8 mapNum)` (overworld.c:1334) :
 *  `return Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum)->mapType;`. */
export function GetMapTypeByGroupAndId(mapGroup: number, mapNum: number): number {
  const hdr = Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum);
  return (hdr?.mapType ?? 0) & 0xFF;
}

/** 1:1 décomp `u8 GetMapTypeByWarpData(struct WarpData *warp)` (overworld.c:1339) :
 *  `return GetMapTypeByGroupAndId(warp->mapGroup, warp->mapNum);`. */
export function GetMapTypeByWarpData(warp: WarpData): number {
  return GetMapTypeByGroupAndId(warp.mapGroup, warp.mapNum);
}

/** 1:1 décomp `u8 GetCurrentMapType(void)` (overworld.c:1344) :
 *  `return GetMapTypeByWarpData(&gSaveBlock1Ptr->location);`. */
export function GetCurrentMapType(): number {
  return GetMapTypeByWarpData(gSaveBlock1Ptr.location);
}

/** 1:1 décomp `u8 GetLastUsedWarpMapType(void)` (overworld.c:1349) :
 *  `return GetMapTypeByWarpData(&gLastUsedWarp);`. */
export function GetLastUsedWarpMapType(): number {
  return GetMapTypeByWarpData(gLastUsedWarp);
}

/** 1:1 décomp `bool8 IsMapTypeOutdoors(u8 mapType)` (overworld.c:1354) :
 *  `return mapType == ROUTE || TOWN || UNDERWATER || CITY || OCEAN_ROUTE;`. */
export function IsMapTypeOutdoors(mapType: number): boolean {
  return mapType === MAP_TYPE_ROUTE
      || mapType === MAP_TYPE_TOWN
      || mapType === MAP_TYPE_UNDERWATER
      || mapType === MAP_TYPE_CITY
      || mapType === MAP_TYPE_OCEAN_ROUTE;
}

// ─── Résolution musique de map (1:1 overworld.c:1010-1205) ───────────────────
// 🐛 fix 2026-07-02 (évolution bug 4) : GetCurrLocationDefaultMusic/GetLocationMusic
// n'avaient JAMAIS été portés (Overworld_PlaySpecialMapMusic = stub savedMusic-only)
// → silence total après le jingle MUS_EVOLVED (StopMapMusic coupait, rien ne
// relançait). State machine consommée = src/sound.ts (sCurrentMapMusic, tick
// MapMusicMain chaque frame via runOneFrame = AgbMain main.c:159).

// 1:1 macros map_groups.h : MAP_GROUP(map) = map >> 8 ; MAP_NUM(map) = map & 0xFF.
const MAP_GROUP = (m: number): number => m >> 8;
const MAP_NUM = (m: number): number => m & 0xFF;
const MC = MAP_CONSTANTS;

// 1:1 global.h PLAYER_AVATAR_FLAG_* — consts locales + pont __TestPlayerAvatarFlags
// (field_player_avatar.ts:593) : field_player_avatar importe overworld → cycle ESM,
// on passe par globalThis (pattern projet).
const PLAYER_AVATAR_FLAG_MACH_BIKE = 1 << 1;
const PLAYER_AVATAR_FLAG_ACRO_BIKE = 1 << 2;
const PLAYER_AVATAR_FLAG_SURFING = 1 << 3;
const PLAYER_AVATAR_FLAG_UNDERWATER = 1 << 4;  // FIX 2 : lu par Store/GetAdjustedInitialTransitionFlags.
function TestPlayerAvatarFlags(flags: number): boolean {
  const f = (globalThis as Record<string, unknown>).__TestPlayerAvatarFlags as
    ((fl: number) => number | boolean) | undefined;
  return !!(f && f(flags));
}

/** 1:1 décomp `struct WarpData { s8 mapGroup, mapNum, warpId; s16 x, y; }`
 *  (global.h). Les helpers musique ne lisent que group/num ; sWarpDestination
 *  et TryFadeOutOldMapMusic (check Sootopolis x/y) utilisent les 5 champs. */
type WarpData = { mapGroup: number; mapNum: number; warpId: number; x: number; y: number };

/** `mapHeader->music` : chez nous le header JSON porte la STRING 'MUS_*' →
 *  résolution via la table songs (même pattern que TestOverworldScene). */
function _resolveMusicId(music: string | number | undefined): number {
  if (typeof music === 'number') return music;
  if (typeof music === 'string') return (SongsTable as unknown as Record<string, number>)[music] ?? 0;
  return 0;
}

/** 1:1 décomp `ShouldLegendaryMusicPlayAtLocation(warp)` (overworld.c:1010-1041) :
 *  météo Kyogre/Groudon active (FLAG_SYS_WEATHER_CTRL) sur les maps côtières. */
function ShouldLegendaryMusicPlayAtLocation(warp: WarpData): boolean {
  if (!FlagGet('FLAG_SYS_WEATHER_CTRL'))
    return false;
  if (warp.mapGroup === 0) {
    switch (warp.mapNum) {
      case MAP_NUM(MC.MAP_LILYCOVE_CITY):
      case MAP_NUM(MC.MAP_MOSSDEEP_CITY):
      case MAP_NUM(MC.MAP_SOOTOPOLIS_CITY):
      case MAP_NUM(MC.MAP_EVER_GRANDE_CITY):
      case MAP_NUM(MC.MAP_ROUTE124):
      case MAP_NUM(MC.MAP_ROUTE125):
      case MAP_NUM(MC.MAP_ROUTE126):
      case MAP_NUM(MC.MAP_ROUTE127):
      case MAP_NUM(MC.MAP_ROUTE128):
        return true;
      default:
        if (VarGet('VAR_SOOTOPOLIS_CITY_STATE') < 4)
          return false;
        switch (warp.mapNum) {
          case MAP_NUM(MC.MAP_ROUTE129):
          case MAP_NUM(MC.MAP_ROUTE130):
          case MAP_NUM(MC.MAP_ROUTE131):
            return true;
        }
    }
  }
  return false;
}

/** 1:1 décomp `NoMusicInSootopolisWithLegendaries(warp)` (overworld.c:1043-1053). */
function NoMusicInSootopolisWithLegendaries(warp: WarpData): boolean {
  if (VarGet('VAR_SKY_PILLAR_STATE') !== 1)
    return false;
  else if (warp.mapGroup !== MAP_GROUP(MC.MAP_SOOTOPOLIS_CITY))
    return false;
  else if (warp.mapNum === MAP_NUM(MC.MAP_SOOTOPOLIS_CITY))
    return true;
  else
    return false;
}

/** 1:1 décomp `IsInfiltratedWeatherInstitute(warp)` (overworld.c:1055-1066). */
function IsInfiltratedWeatherInstitute(warp: WarpData): boolean {
  if (VarGet('VAR_WEATHER_INSTITUTE_STATE'))
    return false;
  else if (warp.mapGroup !== MAP_GROUP(MC.MAP_ROUTE119_WEATHER_INSTITUTE_1F))
    return false;
  else if (warp.mapNum === MAP_NUM(MC.MAP_ROUTE119_WEATHER_INSTITUTE_1F)
    || warp.mapNum === MAP_NUM(MC.MAP_ROUTE119_WEATHER_INSTITUTE_2F))
    return true;
  else
    return false;
}

/** 1:1 décomp `IsInfiltratedSpaceCenter(warp)` (overworld.c:1068-1080). */
function IsInfiltratedSpaceCenter(warp: WarpData): boolean {
  if (VarGet('VAR_MOSSDEEP_CITY_STATE') === 0)
    return false;
  else if (VarGet('VAR_MOSSDEEP_CITY_STATE') > 2)
    return false;
  else if (warp.mapGroup !== MAP_GROUP(MC.MAP_MOSSDEEP_CITY_SPACE_CENTER_1F))
    return false;
  else if (warp.mapNum === MAP_NUM(MC.MAP_MOSSDEEP_CITY_SPACE_CENTER_1F)
    || warp.mapNum === MAP_NUM(MC.MAP_MOSSDEEP_CITY_SPACE_CENTER_2F))
    return true;
  return false;
}

/** 1:1 décomp `u16 GetLocationMusic(struct WarpData *warp)` (overworld.c:1082-1094).
 *  ADAPTATION : `Overworld_GetMapHeaderByGroupAndId(...)->music` est désormais
 *  résolu via le cache fieldmap (loadMapHeader) — pour la location COURANTE on
 *  garde le raccourci gMapHeader LIVE (music = STRING 'MUS_*'), robuste si
 *  location n'est pas encore synchronisée (boot). */
function GetLocationMusic(warp: WarpData): number {
  if (NoMusicInSootopolisWithLegendaries(warp))
    return MUS_NONE;
  else if (ShouldLegendaryMusicPlayAtLocation(warp))
    return MUS_ABNORMAL_WEATHER;
  else if (IsInfiltratedSpaceCenter(warp))
    return MUS_ENCOUNTER_MAGMA;
  else if (IsInfiltratedWeatherInstitute(warp))
    return MUS_MT_CHIMNEY;
  const loc = gSaveBlock1Ptr.location as WarpData | undefined;
  if (loc && warp.mapGroup === loc.mapGroup && warp.mapNum === loc.mapNum && gMapHeader)
    return _resolveMusicId((gMapHeader as { music?: string | number }).music);
  return _resolveMusicId(Overworld_GetMapHeaderByGroupAndId(warp.mapGroup, warp.mapNum)?.music);
}

/** 1:1 décomp `u16 GetCurrLocationDefaultMusic(void)` (overworld.c:1096-1118). */
export function GetCurrLocationDefaultMusic(): number {
  // Play the desert music only when the sandstorm is active on Route 111.
  const loc = gSaveBlock1Ptr.location as WarpData | undefined;
  if (loc && loc.mapGroup === MAP_GROUP(MC.MAP_ROUTE111)
    && loc.mapNum === MAP_NUM(MC.MAP_ROUTE111)
    && GetSavedWeather() === WEATHER_SANDSTORM)
    return MUS_DESERT;

  const music = loc ? GetLocationMusic(loc) : 0;
  if (music !== MUS_ROUTE118) {
    return music;
  } else {
    // MUS_ROUTE118 = sentinelle « split » (32767) : la route 118 joue la musique
    // de la 110 à l'ouest, de la 119 à l'est.
    const pos = (gSaveBlock1Ptr as { pos?: { x: number } }).pos;
    if ((pos?.x ?? 0) < 24)
      return MUS_ROUTE110;
    else
      return MUS_ROUTE119;
  }
}

/** 1:1 décomp `u16 GetWarpDestinationMusic(void)` (overworld.c:1120-1135) :
 *    u16 music = GetLocationMusic(&sWarpDestination);
 *    if (music != MUS_ROUTE118) return music;
 *    else → 110 si la location COURANTE est Mauville (route splittée), sinon 119.
 *  sWarpDestination est posée AVANT (SetupWarp/SetDiveWarp/
 *  LoadMapFromCameraTransition) — chez nous executeWarp Phase 2 /
 *  SetDiveWarp / handleConnectionTransition via SetWarpDestinationFromMapName. */
function GetWarpDestinationMusic(): number {
  const music = GetLocationMusic(sWarpDestination);
  if (music !== MUS_ROUTE118) {
    return music;
  } else {
    const loc = gSaveBlock1Ptr.location as WarpData | undefined;
    if (loc && loc.mapGroup === MAP_GROUP(MC.MAP_MAUVILLE_CITY)
      && loc.mapNum === MAP_NUM(MC.MAP_MAUVILLE_CITY))
      return MUS_ROUTE110;
    else
      return MUS_ROUTE119;
  }
}

/** 1:1 décomp `void Overworld_ResetMapMusic(void)` (overworld.c:1137-1140). */
export function Overworld_ResetMapMusic(): void {
  ResetMapMusic();
}

/** 1:1 décomp `Overworld_PlaySpecialMapMusic` (overworld.c:1142-1158) : résout la
 *  musique de la map courante (défaut / savedMusic / underwater / surf) et la
 *  (re)lance si différente de la musique courante. Appelé à l'entrée de map
 *  (field_screen_effect.c:128) et par la scène d'évolution post-jingle.
 *  ADAPTATION : check UNDERWATER via gMapHeader.mapType (STRING dans le port,
 *  cf Overworld_MapTypeAllowsTeleportAndFly) — GetCurrentMapType (ci-dessus)
 *  = cycle ESM connu avec overworld. */
export function Overworld_PlaySpecialMapMusic(): void {
  let music = GetCurrLocationDefaultMusic();

  if (music !== MUS_ABNORMAL_WEATHER && music !== MUS_NONE) {
    if (gSaveBlock1Ptr.savedMusic)
      music = gSaveBlock1Ptr.savedMusic;
    else if ((gMapHeader as { mapType?: string | number } | undefined)?.mapType === 'MAP_TYPE_UNDERWATER')
      music = MUS_UNDERWATER;
    else if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING))
      music = MUS_SURF;
  }

  if (music !== GetCurrentMapMusic())
    PlayNewMapMusic(music);
}

/** 1:1 décomp `static void TransitionMapMusic(void)` (overworld.c:1170-1191) —
 *  exporté chez nous (consommé par le cross-connexion TestOverworldScene, = le
 *  call-site LoadMapFromCameraTransition overworld.c:792). */
export function TransitionMapMusic(): void {
  if (FlagGet('FLAG_DONT_TRANSITION_MUSIC') !== true) {
    let newMusic = GetWarpDestinationMusic();
    const currentMusic = GetCurrentMapMusic();
    if (newMusic !== MUS_ABNORMAL_WEATHER && newMusic !== MUS_NONE) {
      if (currentMusic === MUS_UNDERWATER || currentMusic === MUS_SURF)
        return;
      if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING))
        newMusic = MUS_SURF;
    }
    if (newMusic !== currentMusic) {
      if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE))
        FadeOutAndFadeInNewMapMusic(newMusic, 4, 4);
      else
        FadeOutAndPlayNewMapMusic(newMusic, 8);
    }
  }
}

/** 1:1 décomp `Overworld_ChangeMusicToDefault` (overworld.c:1193-1198). */
export function Overworld_ChangeMusicToDefault(): void {
  const currentMusic = GetCurrentMapMusic();
  if (currentMusic !== GetCurrLocationDefaultMusic())
    FadeOutAndPlayNewMapMusic(GetCurrLocationDefaultMusic(), 8);
}

/** 1:1 décomp `Overworld_ChangeMusicTo` (overworld.c:1200-1205). */
export function Overworld_ChangeMusicTo(newMusic: number): void {
  const currentMusic = GetCurrentMapMusic();
  if (currentMusic !== newMusic && currentMusic !== MUS_ABNORMAL_WEATHER)
    FadeOutAndPlayNewMapMusic(newMusic, 8);
}

/** 1:1 décomp `u8 GetMapMusicFadeoutSpeed(void)` (overworld.c:1207-1214) :
 *    mapHeader = GetDestinationWarpMapHeader();
 *    return IsMapTypeIndoors(mapHeader->mapType) == TRUE ? 2 : 4; */
export function GetMapMusicFadeoutSpeed(): number {
  const mapHeader = GetDestinationWarpMapHeader() as { mapType?: string | number } | undefined;
  if (IsMapTypeIndoors(mapHeader?.mapType) === true)
    return 2;
  else
    return 4;
}

/** 1:1 décomp `void TryFadeOutOldMapMusic(void)` (overworld.c:1216-1233) :
 *  si FLAG_DONT_TRANSITION_MUSIC pas posé et que la musique de sWarpDestination
 *  diffère de la courante → FadeOutMapMusic(GetMapMusicFadeoutSpeed()).
 *  Exception : MUS_SURF conservé au warp intérieur de Sootopolis (29,53) pendant
 *  VAR_SKY_PILLAR_STATE == 2 (cinématique Rayquaza).
 *  Sites décomp : DoWarp/DoDiveWarp/DoWhiteFadeWarp/DoTeleportTileWarp/
 *  DoMossdeepGymWarp/DoCableClubWarp/Task_ReturnToWorldFromLinkRoom/
 *  Task_DoDoorWarp/DoContestHallWarp (field_screen_effect.c) + escalator/
 *  Lavaridge/EscapeRope/Teleport (field_effect.c) — chez nous ces flux passent
 *  tous par executeWarp Phase 2 (TestOverworldScene). */
export function TryFadeOutOldMapMusic(): void {
  const currentMusic = GetCurrentMapMusic();
  const warpMusic = GetWarpDestinationMusic();
  if (FlagGet('FLAG_DONT_TRANSITION_MUSIC') !== true && warpMusic !== GetCurrentMapMusic()) {
    if (currentMusic === MUS_SURF
      && VarGet('VAR_SKY_PILLAR_STATE') === 2
      && gSaveBlock1Ptr.location.mapGroup === MAP_GROUP(MC.MAP_SOOTOPOLIS_CITY)
      && gSaveBlock1Ptr.location.mapNum === MAP_NUM(MC.MAP_SOOTOPOLIS_CITY)
      && sWarpDestination.mapGroup === MAP_GROUP(MC.MAP_SOOTOPOLIS_CITY)
      && sWarpDestination.mapNum === MAP_NUM(MC.MAP_SOOTOPOLIS_CITY)
      && sWarpDestination.x === 29
      && sWarpDestination.y === 53)
      return;
    FadeOutMapMusic(GetMapMusicFadeoutSpeed());
  }
}

/** 1:1 décomp `bool8 BGMusicStopped(void)` (overworld.c:1235-1238) :
 *    return IsNotWaitingForBGMStop();
 *  Consommé par Task_WarpAndLoadMap case 1 (field_screen_effect.c:657) — le
 *  warp attend que le fade-out musique soit terminé avant WarpIntoMap. */
export function BGMusicStopped(): boolean {
  return IsNotWaitingForBGMStop();
}

/** 1:1 décomp `void Overworld_FadeOutMapMusic(void)` (overworld.c:1240-1243). */
export function Overworld_FadeOutMapMusic(): void {
  FadeOutMapMusic(4);
}

/** 1:1 décomp `Overworld_IsBikingAllowed` (overworld.c:959) :
 *    if (!gMapHeader.allowCycling) return FALSE; else return TRUE; */
export function Overworld_IsBikingAllowed(): boolean {
  if (!gMapHeader || !gMapHeader.allowCycling)
    return false;
  else
    return true;
}

/** 1:1 STRICT décomp `GetMapConnection(u8 dir)` (overworld.c:740) :
 *    for (i = 0; i < count; i++, connection++)
 *        if (connection->direction == dir) return connection;
 *    return NULL;
 *  Retourne la PREMIÈRE connexion de la map courante dont la direction == dir
 *  (≠ GetMapConnectionAtPos qui filtre par position border, fieldmap.c). Utilisé
 *  par le warp Dive (`SetDiveWarp` cherche la connexion CONNECTION_DIVE/EMERGE). */
export function GetMapConnection(dir: number): MapConnection | null {
  if (!gMapHeader || !gMapHeader.connections) return null;
  for (const connection of gMapHeader.connections) {
    if (connection.direction === dir) return connection;
  }
  return null;
}

/** 1:1 STRICT décomp `ResetScreenForMapLoad(void)` (overworld.c:2077) :
 *    SetGpuReg(REG_OFFSET_DISPCNT, 0);
 *    ScanlineEffect_Stop();
 *    DmaClear16(3, PLTT + 2, PLTT_SIZE - 2);
 *    DmaFillLarge16(3, 0, (void *)VRAM, VRAM_SIZE, 0x1000);
 *    ResetOamRange(0, 128);
 *    LoadOam();
 *  Éteint l'affichage (DISPCNT=0) le temps du map load.
 *
 *  ⚠️ DÉVIATION MODÈLE (documentée) : les deux DMA bruts `DmaClear16(PLTT…)` +
 *  `DmaFillLarge16(VRAM…)` ne sont PAS portés. Le port recharge palettes + tilesets
 *  PAR MAP via `LoadMapTilesetPalettes`/`CopyMapTilesetsToVram` (compositor) ; un wipe
 *  VRAM/PLTT brut détruirait les assets chargés UNE FOIS (tiles de police BG0, sprite
 *  joueur) que le port ne recharge pas à chaque map. Le net visuel est identique au
 *  décomp (écran éteint pendant le load → rallumé par InitOverworldGraphicsRegisters). */
export function ResetScreenForMapLoad(): void {
  SetGpuReg(REG_OFFSET_DISPCNT, 0);
  ScanlineEffect_Stop();
  // DmaClear16(3, PLTT + 2, PLTT_SIZE - 2) + DmaFillLarge16(3, 0, VRAM, VRAM_SIZE, 0x1000)
  // = déviation modèle (cf. en-tête) : palettes/tilesets rechargés par map (compositor).
  ResetOamRange(0, 128);
  LoadOam();
}

/** 1:1 STRICT décomp `InitOverworldBgs(void)` (overworld.c:1401) :
 *    InitBgsFromTemplates(0, sOverworldBgTemplates, ARRAY_COUNT(sOverworldBgTemplates));
 *    SetBgAttribute(1/2/3, BG_ATTR_MOSAIC, 1);
 *    gOverworldTilemapBuffer_Bg1/2/3 = AllocZeroed(BG_SCREEN_SIZE);
 *    SetBgTilemapBuffer(1/2/3, ...);
 *    InitStandardTextBoxWindows();
 *  Configure les 4 BG layers OW depuis `sOverworldBgTemplates` (overworld.c:266) :
 *    BG0 charBase 2 mapBase 31 prio 0 (UI/dialogue) ;
 *    BG1 charBase 0 mapBase 29 prio 1 ; BG2 mapBase 28 prio 2 ; BG3 mapBase 30 prio 3.
 *
 *  ⚠️ DÉVIATION MODÈLE (documentée) : `SetBgAttribute(BG_ATTR_MOSAIC)` (effet mosaïque
 *  du door-warp, non modélisé per-bg) et l'alloc des buffers tilemap (= buffers persistants
 *  du compositor `gOverworldTilemapBuffer`, gérés par clear/flushOverworldTilemaps) ne
 *  sont pas re-déclenchés ici.
 *
 *  `InitStandardTextBoxWindows()` EST appelé (1:1 :1413) : il recrée LA fenêtre 0 field
 *  (msgbox 27×4 @0x194) à chaque boot/warp/retour-de-menu. Sans lui, la fenêtre 0 du
 *  décomp n'existait JAMAIS : field_message_box créait un DOUBLON privé au même baseBlock
 *  0x194, et tous les écrans 1:1 qui écrivent « windowId 0 » (Task_PCMainMenu, player_pc…)
 *  tombaient sur une fenêtre arbitraire → tiles VRAM 404-511 écrasées en croisé = fenêtres
 *  fantômes/corrompues du menu PC (bug user 2026-07-17). InitWindows purge gWindows
 *  (FreeAllWindowBuffers) = la sémantique décomp exacte à ce point du flux. */
export function InitOverworldBgs(): void {
  const rt = getRuntime();
  // 1:1 décomp `InitBgsFromTemplates(0, sOverworldBgTemplates, …)` (overworld.c:1403) : le
  // 1er arg = mode vidéo 0 → SetBgModeInternal(0). La boucle ci-dessous inline InitBgFromTemplate,
  // mais le mode 0 était OMIS → un écran affine antérieur (rayquaza Mode 1) laissait BG2 affine
  // au retour field (overworld noir). SetBgMode(0) restaure le mode texte, comme le décomp.
  SetBgMode(0);
  // 1:1 sOverworldBgTemplates (overworld.c:266-304) : [bg, charBaseIndex, mapBaseIndex, priority].
  const templates: ReadonlyArray<readonly [0 | 1 | 2 | 3, number, number, number]> = [
    [0, 2, 31, 0],
    [1, 0, 29, 1],
    [2, 0, 28, 2],
    [3, 0, 30, 3],
  ];
  for (const [bg, charBaseIndex, mapBaseIndex, priority] of templates) {
    const c = rt.gba.bg(bg).config;
    c.charBaseIndex = charBaseIndex;
    c.mapBaseIndex = mapBaseIndex;
    c.screenSize = 0;
    c.paletteMode = 0;
    c.priority = priority;
    c.hofs = 0;
    c.vofs = 0;
  }
  // 1:1 décomp overworld.c:1413 — recrée la fenêtre 0 field (msgbox @0x194).
  InitStandardTextBoxWindows();
}

/** 1:1 STRICT décomp `InitOverworldGraphicsRegisters(void)` (overworld.c:2096) :
 *    ClearScheduledBgCopiesToVram(); ResetTempTileDataBuffers();
 *    SetGpuReg(MOSAIC, 0);
 *    SetGpuReg(WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ);
 *    SetGpuReg(WINOUT, WINOUT_WIN01_BG0 | WINOUT_WINOBJ_BG0);
 *    SetGpuReg(WIN0H, 0xFF); SetGpuReg(WIN0V, 0xFF);
 *    SetGpuReg(WIN1H, 0xFFFF); SetGpuReg(WIN1V, 0xFFFF);
 *    SetGpuReg(BLDCNT, gOverworldBackgroundLayerFlags[1|2|3] | BLDCNT_TGT2_OBJ | BLDCNT_EFFECT_BLEND);
 *    SetGpuReg(BLDALPHA, BLDALPHA_BLEND(13, 7));
 *    InitOverworldBgs();
 *    ScheduleBgCopyTilemapToVram(1/2/3);
 *    ChangeBgX/Y(0..3, 0, BG_COORD_SET);
 *    SetGpuReg(DISPCNT, OBJ_ON | WIN0_ON | WIN1_ON | OBJ_1D_MAP | HBLANK_INTERVAL);
 *    ShowBg(0..3);
 *    InitFieldMessageBox();
 *  Pose TOUS les registres GPU de l'overworld (mosaïque OFF, fenêtres plein-écran,
 *  blend 2e-cible BG1/2/3+OBJ no-op par défaut (eva=13/evb=7), DISPCNT OW) + (ré)active
 *  les 4 BG. C'est la fonction qui RÉINITIALISE l'état WIN/BLD/MOSAIC laissé par l'écran
 *  précédent (intro/titre) — d'où la disparition de « l'ombre » sur la fenêtre de dialogue
 *  au passage intro→OW (état blend mode-3 résiduel écrasé par ce blend OW). */
export function InitOverworldGraphicsRegisters(): void {
  // 1:1 décomp `const u16 gOverworldBackgroundLayerFlags[]` (io_reg.c:24) :
  //   { BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3 }.
  // ⚠️ Construit LOCALEMENT (lecture paresseuse) : un `const` module-level lisant
  // ces imports à l'init déclenche un TDZ (cycle ESM decomp-runtime↔overworld) ;
  // ici la lecture se fait au runtime, modules pleinement initialisés. Cf.
  // [[feedback-map-loader-var-tdz]].
  const gOverworldBackgroundLayerFlags = [
    BLDCNT_TGT2_BG0, BLDCNT_TGT2_BG1, BLDCNT_TGT2_BG2, BLDCNT_TGT2_BG3,
  ];
  ClearScheduledBgCopiesToVram();
  ResetTempTileDataBuffers();
  SetGpuReg(REG_OFFSET_MOSAIC, 0);
  SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ);
  SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG0 | WINOUT_WINOBJ_BG0);
  SetGpuReg(REG_OFFSET_WIN0H, 0xFF);
  SetGpuReg(REG_OFFSET_WIN0V, 0xFF);
  SetGpuReg(REG_OFFSET_WIN1H, 0xFFFF);
  SetGpuReg(REG_OFFSET_WIN1V, 0xFFFF);
  SetGpuReg(REG_OFFSET_BLDCNT,
    gOverworldBackgroundLayerFlags[1] | gOverworldBackgroundLayerFlags[2] | gOverworldBackgroundLayerFlags[3]
    | BLDCNT_TGT2_OBJ | BLDCNT_EFFECT_BLEND);
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(13, 7));
  InitOverworldBgs();
  ScheduleBgCopyTilemapToVram(1);
  ScheduleBgCopyTilemapToVram(2);
  ScheduleBgCopyTilemapToVram(3);
  ChangeBgX(0, 0, BG_COORD_SET);
  ChangeBgY(0, 0, BG_COORD_SET);
  ChangeBgX(1, 0, BG_COORD_SET);
  ChangeBgY(1, 0, BG_COORD_SET);
  ChangeBgX(2, 0, BG_COORD_SET);
  ChangeBgY(2, 0, BG_COORD_SET);
  ChangeBgX(3, 0, BG_COORD_SET);
  ChangeBgY(3, 0, BG_COORD_SET);
  SetGpuReg(REG_OFFSET_DISPCNT,
    DISPCNT_OBJ_ON | DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJ_1D_MAP | DISPCNT_HBLANK_INTERVAL);
  ShowBg(0);
  ShowBg(1);
  ShowBg(2);
  ShowBg(3);
  InitFieldMessageBox();
}

/** 1:1 STRICT décomp `static void InitCurrentFlashLevelScanlineEffect(void)` (overworld.c:1794).
 *  Arme l'effet scanline WIN0H de la pénombre de grotte au map load (appelé par
 *  InitViewGraphics juste avant InitOverworldGraphicsRegisters). Remplace l'ex-rustine
 *  harness/gba/flash-mask.ts : le cercle de vision est désormais rendu par la fenêtre
 *  WIN0 (le compositor la clippe par-scanline). Les fns du flash (WriteFlashScanline
 *  EffectBuffer / ScanlineEffect_SetParams(sFlashEffectParams)) vivent dans
 *  field_screen_effect.ts (foyer 1:1) et sont appelées via ponts globalThis — un import
 *  statique overworld→field_screen_effect (qui importe déjà overworld) fermerait un
 *  cycle ESM à risque TDZ (cf. [[feedback-map-loader-var-tdz]]).
 *
 *  `InBattlePyramid_()` (solo : Battle Frontier hors scope) → lu paresseusement, false
 *  par défaut. `flashLevel` = `GetFlashLevel()` (overworld.c:988 = gSaveBlock1Ptr->flashLevel,
 *  posé au map load par SetDefaultFlashLevel). */
export function InitCurrentFlashLevelScanlineEffect(): void {
  const g = globalThis as Record<string, unknown>;
  const setupParams = g.__SetupFlashScanlineParams as (() => void) | undefined;
  const inPyramid = (g.InBattlePyramid_ as (() => boolean) | undefined)?.() ?? false;
  if (inPyramid) {
    (g.__WriteBattlePyramidViewScanlineEffectBuffer as (() => void) | undefined)?.();
    setupParams?.();
  } else {
    const flashLevel = gSaveBlock1Ptr.flashLevel & 0xF;
    if (flashLevel) {
      (g.__WriteFlashScanlineEffectBuffer as ((l: number) => void) | undefined)?.(flashLevel);
      setupParams?.();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CB2_ReturnToField* — flow retour-au-field depuis un sous-menu (option/sac/party).
//  1:1 décomp overworld.c:1638-1681 (state machine avec gMain.state mutable direct,
//  bypass le bug pointer-arg `u8 *state` du transpiler auto-fichier). Rapatrié depuis
//  l'ex-`engine/ui/option-menu-return.ts` (nom non-1:1) vers son vrai foyer overworld.c.
//  Réfs : overworld.c:1638/1657/1670/1677/1961/1505 + start_menu.c:543-559 +
//  field_screen_effect.c:150/440.
// ═══════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `bool8 FieldCB_ReturnToFieldOpenStartMenu(void)` (field_screen_effect.c:440).
 *  ShowReturnToFieldStartMenu set gFieldCallback2 = FieldCB_ReturnToFieldStartMenu ;
 *  returns FALSE → RunFieldCallback répète la frame suivante (chain pattern décomp).
 *  ⚠️ FillPalBufferBlack ICI (1er cb2) évite le flash 1-frame (Faded=nouvelles couleurs
 *  avant le FadeScreen du 2ème cb2). */
function FieldCB_ReturnToFieldOpenStartMenu(): boolean {
  FillPalBufferBlack();
  (globalThis as Record<string, unknown>).gFieldCallback2 = FieldCB_ReturnToFieldStartMenu;
  return false;
}

/** 1:1 décomp `bool8 FieldCB_ReturnToFieldStartMenu(void)` (start_menu.c:543) :
 *  if (InitStartMenuStep() == FALSE) return FALSE; ReturnToFieldOpenStartMenu(); return TRUE.
 *  Notre `sm.open()` est synchrone (≡ while InitStartMenuStep()==FALSE) ; on l'appelle
 *  AVANT FillPalBufferBlack pour que la palette menu soit dans Unfaded → fade in menu+field
 *  ensemble. Cursor persiste 1:1 (sStartMenuCursorPos module static). */
function FieldCB_ReturnToFieldStartMenu(): boolean {
  const sm = (globalThis as Record<string, unknown>).startMenu as
    { open?: () => void } | undefined;
  sm?.open?.();
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
  return true;
}

/** 1:1 décomp `bool8 RunFieldCallback(void)` (overworld.c:1505). */
function RunFieldCallback_Manual(): boolean {
  const cb2 = (globalThis as Record<string, unknown>).gFieldCallback2 as (() => boolean) | null | undefined;
  if (cb2) {
    if (!cb2()) return false;
    (globalThis as Record<string, unknown>).gFieldCallback2 = null;
    (globalThis as Record<string, unknown>).gFieldCallback = null;
  } else {
    const cb = (globalThis as Record<string, unknown>).gFieldCallback as (() => void) | null | undefined;
    if (cb) cb();
    (globalThis as Record<string, unknown>).gFieldCallback = null;
  }
  return true;
}

/** Flag interne : true entre case 1 (kick off async restore) et la résolution (state→2). */
let _isRestoringOverworld = false;

/** 1:1 décomp `bool32 ReturnToFieldLocal(u8 *state)` (overworld.c:1961) avec `gMain.state`
 *  mutable direct (bypass bug pointer-arg du transpiler). Returns true à case 3 (= done). */
function ReturnToFieldLocal_Manual(): boolean {
  switch (gMain.state) {
    case 0: {
      // ResumeMap essentiels (ResetTasks/ResetSpriteData/ResetPaletteFade).
      ResetTasks();
      ResetSpriteData();
      ResetPaletteFade();
      // 1:1 décomp ResetVramOamAndBgCntRegs (menu_helpers.c:97) via ResetScreenForMapLoad :
      // reset BLDCNT/BLDY/WIN regs sinon les effets du sub-menu (option menu BLDCNT_DARKEN)
      // persistent → BG0 assombri au retour (bug "textbox noircie" session 129).
      const rt = getRuntime();
      rt.SetGpuReg(0x50 /* BLDCNT */, 0);
      rt.SetGpuReg(0x52 /* BLDALPHA */, 0);
      rt.SetGpuReg(0x54 /* BLDY */, 0);
      rt.SetGpuReg(0x40 /* WIN0H */, 0);
      rt.SetGpuReg(0x44 /* WIN0V */, 0);
      rt.SetGpuReg(0x42 /* WIN1H */, 0);
      rt.SetGpuReg(0x46 /* WIN1V */, 0);
      rt.SetGpuReg(0x48 /* WININ */, 0);
      rt.SetGpuReg(0x4A /* WINOUT */, 0);
      // InitFieldMessageBox : reset sWindowId (field-message-box module-level) sinon le
      // prochain ShowFieldMessage skip le AddWindow → dialog invisible (session 129).
      InitFieldMessageBox();
      gMain.state++;
      break;
    }
    case 1: {
      // 1:1 décomp case 1 InitViewGraphics. `_restoreOverworldFromMenu` (TestOverworldScene)
      // fait BG regs + DISPCNT + ShowBg + InitFieldMessageBox + InitMapView + re-spawn NPCs.
      // Async (fetch tilesets/palettes).
      if (!_isRestoringOverworld) {
        _isRestoringOverworld = true;
        const restore = (globalThis as Record<string, unknown>)._restoreOverworldFromMenu as (() => Promise<void>) | undefined;
        if (typeof restore === 'function') {
          void restore().then(() => {
            gMain.state++;
            _isRestoringOverworld = false;
            // _restoreOverworldFromMenu fait SetMainCallback2(MainCB2_Overworld) à sa fin →
            // le state machine n'est plus tické → case 2 (RunFieldCallback) ne tourne pas via
            // le tick. Le décomp run RunFieldCallback (case 2) AVANT SetMainCallback2(CB2_Overworld)
            // → on le run ICI (place 1:1 de case 2), gFieldCallback2 INCLUS.
            // 🐛 fix 2026-07-02 (verdict user « retour à l'OW violent ») : gFieldCallback2
            // (= FieldCB_ReturnToFieldOpenStartMenu posé par CB2_ReturnToFieldWithOpenMenu)
            // était EXCLU → sortir du SAC/OPTIONS ne ré-ouvrait jamais le start menu ni ne
            // fadait. La chaîne .c s'étale sur 2 frames (noircir → open menu + FadeScreen
            // FROM_BLACK) via « return FALSE = répéter » : ici le CB2 OW a déjà la main →
            // on déroule la chaîne SYNC (aucun rendu entre les deux → pas de flash).
            const g = globalThis as Record<string, unknown>;
            if (g.gPostMenuFieldCallback || g.gFieldCallback || g.gFieldCallback2) {
              let guard = 8;
              while (!RunFieldCallback_Manual() && --guard > 0) { /* chaîne gFieldCallback2 (2 steps) */ }
            }
          }).catch(e => {
            console.error('[CB2_ReturnToFieldLocal_Manual case 1] restore THREW:', e);
            _isRestoringOverworld = false;
          });
        } else {
          console.warn('[CB2_ReturnToFieldLocal_Manual case 1] no _restoreOverworldFromMenu, skip');
          gMain.state++;
        }
      }
      break;
    }
    case 2: {
      // 1:1 décomp case 2 : if (RunFieldCallback()) (*state)++. 1ère frame → OpenStartMenu
      // (set gFieldCallback2=StartMenu, FALSE) ; frame suivante → StartMenu (open + TRUE).
      if (RunFieldCallback_Manual()) gMain.state++;
      break;
    }
    case 3: {
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `static void CB2_ReturnToFieldLocal(void)` (overworld.c:1638).
 *  Notre `CB2_Overworld` = `MainCB2_Overworld` (closure TestOverworldScene via
 *  globalThis._overworldMainCB2). */
export function CB2_ReturnToFieldLocal_Manual(): void {
  if (ReturnToFieldLocal_Manual()) {
    const rt = getRuntime();
    const cb2 = (globalThis as Record<string, unknown>)._overworldMainCB2 as (() => void) | undefined;
    if (typeof cb2 === 'function') {
      rt.SetMainCallback2(cb2);
    } else {
      console.error('[CB2_ReturnToFieldLocal_Manual] _overworldMainCB2 not exposed');
    }
  }
}

/** 1:1 décomp `void CleanupOverworldWindowsAndTilemaps(void)` (overworld.c:1416).
 *  Relocalisée depuis easy_chat.ts (foyer réel = overworld.c). Chacune des 3 lignes décomp :
 *   • ClearMirageTowerPulseBlendEffect() : no-op GARANTI chez nous (sMirageTowerPulseBlend
 *     toujours NULL → le décomp early-return aussi, cf. field_camera.ts:796).
 *   • FreeAllOverworldWindowBuffers() : CÂBLÉ (menu.ts, = FreeAllWindowBuffers). Idempotent.
 *   • TRY_FREE_AND_SET_NULL(gOverworldTilemapBuffer_Bg3/2/1) : chez nous ces buffers sont
 *     PERSISTANTS (field_camera.ts:389), pas des allocs heap → no-op structurel (les
 *     libérer+nuller casserait le prochain redraw de map ; le décomp les ré-alloue, nous non). */
export function CleanupOverworldWindowsAndTilemaps(): void {
  FreeAllOverworldWindowBuffers();
}

/** 1:1 décomp `void CB2_ReturnToFieldWithOpenMenu(void)` (overworld.c:1670). Reset gMain.state
 *  + pose gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu (ré-ouvre le start menu). */
export function CB2_ReturnToFieldWithOpenMenu_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  (globalThis as Record<string, unknown>).gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu;
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

// Ponts fly map 1:1 (lus par region_map.CB_ExitFlyMap — un import statique
// region_map→overworld serait une arête TDZ dans le graphe eager) :
(globalThis as Record<string, unknown>).__CB2_ReturnToFieldLocal = CB2_ReturnToFieldLocal_Manual;
(globalThis as Record<string, unknown>).__CB2_ReturnToFieldWithOpenMenu = CB2_ReturnToFieldWithOpenMenu_Manual;

/** 1:1 décomp `void CB2_ReturnToField(void)` (overworld.c:1657, branche non-link).
 *  SANS poser gFieldCallback2 : l'appelant (SetUpFieldMove_X party menu) a DÉJÀ posé
 *  gFieldCallback2 = FieldCallback_PrepareFadeInFromMenu (party_menu.c:3757). */
export function CB2_ReturnToField_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

/** 1:1 décomp `void FieldCB_ContinueScript(void)` (field_screen_effect.c:150). Notre script
 *  bloqué reprend de lui-même au 1er tick de l'OW restauré → juste le fade FROM_BLACK
 *  (le `fadescreen FADE_TO_BLACK` du script avait noirci avant d'ouvrir le sac). */
function FieldCB_ContinueScript_Manual(): void {
  FillPalBufferBlack();
  FadeScreen(FADE_FROM_BLACK, 0);
}

/** 1:1 décomp `void CB2_ReturnToFieldContinueScript(void)` (overworld.c:1677). gFieldCallback
 *  (PAS gFieldCallback2) → RunFieldCallback branche `if (cb) cb()` (= ContinueScript). */
export function CB2_ReturnToFieldContinueScript_Manual(): void {
  const rt = getRuntime();
  rt.SetVBlankCallback(null);
  (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_ContinueScript_Manual;
  (globalThis as Record<string, unknown>).gFieldCallback2 = null;
  gMain.state = 0;
  rt.SetMainCallback2(CB2_ReturnToFieldLocal_Manual);
}

// ─── Helpers field-init (1:1 décomp overworld.c, appelés par les CB2 ci-dessous) ──

/** 1:1 décomp `EWRAM_DATA static struct { u8 direction; u8 transitionFlags; }
 *  sInitialPlayerAvatarState`. Utilisé par (Store|Reset|Get)InitialPlayerAvatarState. */
const sInitialPlayerAvatarState: { direction: number; transitionFlags: number } = {
  direction: DIR_SOUTH, transitionFlags: PLAYER_AVATAR_FLAG_ON_FOOT,
};

/** 1:1 décomp `void ResetInitialPlayerAvatarState(void)` (overworld.c:877-881). */
export function ResetInitialPlayerAvatarState(): void {
  sInitialPlayerAvatarState.direction = DIR_SOUTH;
  sInitialPlayerAvatarState.transitionFlags = PLAYER_AVATAR_FLAG_ON_FOOT;
}

/** 1:1 STRICT décomp `void StoreInitialPlayerAvatarState(void)` (overworld.c:883-896).
 *  Mémorise l'état (direction + transitionFlags monté) du joueur AVANT un warp (dive) →
 *  GetInitialPlayerAvatarState le ré-applique à l'arrivée (préserve surf↔underwater plongée/émersion). */
export function StoreInitialPlayerAvatarState(): void {
  sInitialPlayerAvatarState.direction = GetPlayerFacingDirection();
  if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_MACH_BIKE))
    sInitialPlayerAvatarState.transitionFlags = PLAYER_AVATAR_FLAG_MACH_BIKE;
  else if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_ACRO_BIKE))
    sInitialPlayerAvatarState.transitionFlags = PLAYER_AVATAR_FLAG_ACRO_BIKE;
  else if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_SURFING))
    sInitialPlayerAvatarState.transitionFlags = PLAYER_AVATAR_FLAG_SURFING;
  else if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_UNDERWATER))
    sInitialPlayerAvatarState.transitionFlags = PLAYER_AVATAR_FLAG_UNDERWATER;
  else
    sInitialPlayerAvatarState.transitionFlags = PLAYER_AVATAR_FLAG_ON_FOOT;
}

/** 1:1 STRICT décomp `static u16 GetCenterScreenMetatileBehavior(void)` (overworld.c:951-954) :
 *    return MapGridGetMetatileBehaviorAt(gSaveBlock1Ptr->pos.x + MAP_OFFSET, ...y + MAP_OFFSET);
 *  (MapGridGetMetatileBehaviorAt du port prend des coords INTERNAL = LOGICAL + MAP_OFFSET.) */
function GetCenterScreenMetatileBehavior(): number {
  return MapGridGetMetatileBehaviorAt(gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
}

/** 1:1 STRICT décomp `static u8 GetAdjustedInitialTransitionFlags(struct InitialPlayerAvatarState *,
 *  u16 metatileBehavior, u8 mapType)` (overworld.c:910-926). Détermine l'état monté à l'arrivée :
 *  UNDERWATER si map sous-marine ; SURFING si la tuile sous le joueur est de l'eau surfable ;
 *  vélo préservé si autorisé ; sinon ON_FOOT. `mapType` = STRING du header port (gMapHeader.mapType). */
function GetAdjustedInitialTransitionFlags(
  playerStruct: { direction: number; transitionFlags: number },
  metatileBehavior: number, mapType: string | number | undefined,
): number {
  // 1:1 `if (mapType != MAP_TYPE_INDOOR && FlagGet(FLAG_SYS_CRUISE_MODE))` (mapType port = string).
  if ((mapType !== 'MAP_TYPE_INDOOR' && mapType !== MAP_TYPE_INDOOR) && FlagGet('FLAG_SYS_CRUISE_MODE'))
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  else if (mapType === 'MAP_TYPE_UNDERWATER' || mapType === MAP_TYPE_UNDERWATER)
    return PLAYER_AVATAR_FLAG_UNDERWATER;
  else if (MetatileBehavior_IsSurfableWaterOrUnderwater(metatileBehavior) === true)
    return PLAYER_AVATAR_FLAG_SURFING;
  else if (Overworld_IsBikingAllowed() !== true)
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  else if (playerStruct.transitionFlags === PLAYER_AVATAR_FLAG_MACH_BIKE)
    return PLAYER_AVATAR_FLAG_MACH_BIKE;
  else if (playerStruct.transitionFlags !== PLAYER_AVATAR_FLAG_ACRO_BIKE)
    return PLAYER_AVATAR_FLAG_ON_FOOT;
  else
    return PLAYER_AVATAR_FLAG_ACRO_BIKE;
}

/** 1:1 STRICT décomp `static struct InitialPlayerAvatarState *GetInitialPlayerAvatarState(void)`
 *  (overworld.c:899-908). Renvoie l'état à appliquer à l'arrivée (via SetPlayerAvatarTransitionFlags).
 *  Le port calcule `transitionFlags` 1:1 ; la direction (GetAdjustedInitialDirection : nombreux
 *  MetatileBehavior_Is*Warp) n'est PAS re-dérivée ici — le harness passe déjà la direction de spawn
 *  du warp à InitPlayerAvatar → dette documentée (n'affecte pas l'état monté = le bug traité). */
export function GetInitialPlayerAvatarState(): { direction: number; transitionFlags: number } {
  const mapType = gMapHeader?.mapType;  // 1:1 GetCurrentMapType() ; le port lit le string du header courant.
  const metatileBehavior = GetCenterScreenMetatileBehavior();
  const transitionFlags = GetAdjustedInitialTransitionFlags(sInitialPlayerAvatarState, metatileBehavior, mapType);
  sInitialPlayerAvatarState.transitionFlags = transitionFlags;
  return sInitialPlayerAvatarState;
}

/** 1:1 décomp `static void ResetSafariZoneFlag_(void)` (overworld.c:1425-1428) :
 *    ResetSafariZoneFlag(); (wrapper du vrai flag clear de safari_zone.c:84). */
function ResetSafariZoneFlag_(): void {
  fieldInitDeps().safari.ResetSafariZoneFlag();
}

/** 1:1 décomp `void LoadSaveblockObjEventScripts(void)` (overworld.c:480-488) :
 *    for (i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++)
 *        savObjTemplates[i].script = mapHeaderObjTemplates[i].script;
 *  (les `if (t)` gardent les arrays port de longueur variable, cf. le pattern
 *  GetBaseTemplateForObjectEvent event_object_movement.ts:6703). */
export function LoadSaveblockObjEventScripts(): void {
  const mapHeaderObjTemplates = gMapHeader?.events?.objectEvents ?? [];
  const savObjTemplates = gSaveBlock1Ptr.objectEventTemplates;
  for (let i = 0; i < OBJECT_EVENT_TEMPLATES_COUNT; i++) {
    if (savObjTemplates[i] && mapHeaderObjTemplates[i])
      savObjTemplates[i].script = mapHeaderObjTemplates[i].script;
  }
}

/** 1:1 décomp `static void UpdateMiscOverworldStates(void)` (overworld.c:416-423).
 *  ChooseAmbientCrySpecies / UpdateLocationHistoryForRoamer / RoamerMoveToOtherLocationSet
 *  NON portés (subsystems ambient cry + roamer) → laissés INERTES (commentés 1:1). */
function UpdateMiscOverworldStates(): void {
  FlagClear('FLAG_SYS_SAFARI_MODE');
  // ChooseAmbientCrySpecies();               // non porté (ambient cry)
  fieldInitDeps().fieldSpecials.ResetCyclingRoadChallengeData();
  // UpdateLocationHistoryForRoamer();         // non porté (roamer)
  // RoamerMoveToOtherLocationSet();           // non porté (roamer)
}

/** 1:1 décomp `static void FieldCB_FadeTryShowMapPopup(void)` (overworld.c:1698-1703) :
 *    if (gMapHeader.showMapName == TRUE && SecretBaseMapPopupEnabled() == TRUE)
 *        ShowMapNamePopup();
 *    FieldCB_WarpExitFadeFromBlack();
 *  - SecretBaseMapPopupEnabled() : non porté (subsystem Secret Base) → assumé TRUE
 *    (le popup s'affiche hors base secrète) — condition commentée 1:1.
 *  - FieldCB_WarpExitFadeFromBlack() : fade-in FROM_BLACK + warp-exit-task RÉALISÉ
 *    par le harness au resume (FillPalBufferBlack + FadeScreen FADE_FROM_BLACK, cf.
 *    bootOverworld branche resume) → délégué. */
function FieldCB_FadeTryShowMapPopup(): void {
  if (gMapHeader?.showMapName === true /* && SecretBaseMapPopupEnabled() (non porté → TRUE) */)
    fieldInitDeps().mapPopup.ShowMapNamePopup();
  // FieldCB_WarpExitFadeFromBlack(); — délégué au harness (resume fade-in).
}

/** 1:1 décomp `LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR` (constants/layouts.h). Le
 *  port clé les layouts par NOM string (cf. fieldmap.ts:288 `mapLayoutId: string`,
 *  trainer_hill.ts:9) → la constante = le nom du layout. */
const LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR = 'LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR';
/** 1:1 décomp `TRAINER_HILL_ENTRANCE` (constants/trainer_hill.h = 6). Non exporté par
 *  trainer_hill.ts (const locale là-bas) → const locale 1:1 ici. */
const TRAINER_HILL_ENTRANCE = 6;

// ─── Entrées de scène overworld (1:1 décomp overworld.c) ─────────────────────
//
// CB2_NewGame (overworld.c:1532) et CB2_ContinueSavedGame (overworld.c:1705) sont
// les points d'entrée field-init du jeu (truck cinematic neuf / load de la map
// sauvegardée). Les scènes (TestOverworldScene.update, GameScene, BirchRuntimeScene)
// détectent `gMain.callback2 === CB2_NewGame | CB2_ContinueSavedGame` par IDENTITÉ,
// null-out le callback AVANT qu'il tourne, puis :
//   - GameScene / BirchRuntimeScene (legacy ?no-un) : délèguent à decideBootMode
//     (le corps ne tourne JAMAIS chez eux — juste un jeton d'identité).
//   - TestOverworldScene (host unifié par défaut) : APPELLE le vrai corps 1:1
//     ci-dessous (transitionToOverworld → bootOverworld), le harness ne réalisant
//     que le chargement async d'assets (ADAPTATION ROM→fetch documentée dans chaque
//     corps, précédent = executeWarp → loadAndInitMap pour les warps de porte).

/** 1:1 décomp `void CB2_NewGame(void)` (overworld.c:1532-1548). Corps réel jusqu'à
 *  `gFieldCallback2 = NULL`. NewGameInitData() enchaîne WarpToTruck() qui pose
 *  gSaveBlock1Ptr.location = MAP_INSIDE_OF_TRUCK — le harness charge ENSUITE cette map.
 *  ADAPTATIONS :
 *   - FieldClearVBlankHBlankCallbacks() : link/interrupts/VBlank-HBlank hardware
 *     ([[hardware-non-1to1-exemptions]]) — le harness a déjà neutralisé VBlank/HBlank
 *     au boot, pas de link web → no-op documenté.
 *   - gFieldCallback = ExecuteTruckSequence : le runner gFieldCallback du port appelle
 *     BARE (sans rt) alors qu'ExecuteTruckSequence(rt) exige le runtime → la cinématique
 *     du camion est RÉALISÉE par le harness (ExecuteTruckSequence(rt) après le load async
 *     de la map, cf. bootOverworld) ; on ne pose donc que gFieldCallback2 = NULL.
 *   - DoMapLoadLoop / SetFieldVBlankCallback / SetMainCallback1(CB1_Overworld) /
 *     SetMainCallback2(CB2_Overworld) : DÉLÉGUÉS au harness (loadAndInitMap async, qui
 *     enchaîne VBlank + CB1/CB2 overworld) → RETURN ici. */
export function CB2_NewGame(): void {
  const d = fieldInitDeps();
  // FieldClearVBlankHBlankCallbacks(); — hardware link/interrupts/VBlank (no-op, cf. en-tête)
  StopMapMusic();
  ResetSafariZoneFlag_();
  d.newGame.NewGameInitData();
  ResetInitialPlayerAvatarState();
  d.playTime.PlayTimeCounter_Start();
  d.script.ScriptContext_Init();
  d.script.UnlockPlayerFieldControls();
  // gFieldCallback = ExecuteTruckSequence; — réalisé par le harness (cf. en-tête)
  (globalThis as Record<string, unknown>).gFieldCallback2 = null;
  // DoMapLoadLoop + SetFieldVBlankCallback + SetMainCallback1/2 → délégués au harness (RETURN).
}

/** 1:1 décomp `void CB2_ContinueSavedGame(void)` (overworld.c:1705-1754). Corps réel
 *  complet. ADAPTATIONS :
 *   - FieldClearVBlankHBlankCallbacks() : hardware (no-op, cf. CB2_NewGame).
 *   - InitMapFromSavedGame() exige la layout data de la map courante déjà chargée →
 *     le harness PRÉCHARGE la map de la save (loadMapByName) AVANT d'appeler ce corps.
 *   - à la place de SetMainCallback2(CB2_LoadMap) / SetMainCallback1(CB1_Overworld)+
 *     CB2_ReturnToField() : DISCRIMINANT `'warp' | 'resume'` rendu au harness, qui
 *     exécute la queue async (CB2_LoadMap = load frais / CB2_ReturnToField = resume). */
export function CB2_ContinueSavedGame(): 'warp' | 'resume' {
  const d = fieldInitDeps();
  // FieldClearVBlankHBlankCallbacks(); — hardware link/interrupts/VBlank (no-op)
  StopMapMusic();
  ResetSafariZoneFlag_();
  if (d.save.gSaveFileStatus === d.save.SAVE_STATUS_ERROR)
    d.frontier.ResetWinStreaks();

  LoadSaveblockMapHeader();
  ClearDiveAndHoleWarps();
  const trainerHillMapId = d.trainerHill.GetCurrentTrainerHillMapId();
  if (gMapHeader?.mapLayoutId === LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR)
    d.battlePyramid.LoadBattlePyramidFloorObjectEventScripts();
  else if (trainerHillMapId !== 0 && trainerHillMapId !== TRAINER_HILL_ENTRANCE)
    d.trainerHill.LoadTrainerHillFloorObjectEventScripts();
  else
    LoadSaveblockObjEventScripts();

  d.eom.UnfreezeObjectEvents();
  d.clock.DoTimeBasedEvents();
  UpdateMiscOverworldStates();
  if (gMapHeader?.mapLayoutId === LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR)
    InitBattlePyramidMap(true);
  else if (trainerHillMapId !== 0)
    InitTrainerHillMap();
  else
    InitMapFromSavedGame();

  d.playTime.PlayTimeCounter_Start();
  d.script.ScriptContext_Init();
  d.script.UnlockPlayerFieldControls();
  d.matchCall.InitMatchCallCounters();
  if (d.loadSave.UseContinueGameWarp() === true) {
    d.loadSave.ClearContinueGameWarpStatus();
    SetWarpDestinationToContinueGameWarp();
    WarpIntoMap();
    d.tv.TryPutTodaysRivalTrainerOnAir();
    // SetMainCallback2(CB2_LoadMap) → discriminant (harness = load frais de la dest).
    return 'warp';
  } else {
    d.tv.TryPutTodaysRivalTrainerOnAir();
    (globalThis as Record<string, unknown>).gFieldCallback = FieldCB_FadeTryShowMapPopup;
    // SetMainCallback1(CB1_Overworld) + CB2_ReturnToField() → discriminant (harness = resume).
    return 'resume';
  }
}

/**
 * pokenav.ts — SQUELETTE UI du miroir `src/pokenav.c` (décomp pokeemeraude).
 *
 * ÉTAT (2026-07-04, mandat final) : le menu S'OUVRE depuis le start menu
 * (écran dédié, titre + entrées du menu principal AFFICHÉES, B = retour field
 * avec start menu rouvert 1:1 CB2_ReturnToFieldWithOpenMenu). TOUT LE RESTE
 * = À REMPLIR (Opus) : pokenav.c est un ORCHESTRATEUR (LoopedTask + subscreens
 * pokenav_main_menu.c / pokenav_region_map.c / pokenav_conditions*.c /
 * pokenav_match_call*.c / pokenav_ribbons*.c). Structure de reprise :
 *   1. InitPokenavResources + gPokenavResources (struct :62-77 du .c).
 *   2. Task_Pokenav state machine (:428-476) + GetCurrentMenuCB/LoopedTask (:527+).
 *   3. pokenav_main_menu.c : InitPokenavMainMenu (bandeau haut + icônes spinning).
 *   4. Subscreens par menuId (POKENAV_MENU_IDS, pokenav.h).
 * Recette test : start menu → POKéNAV (2e entrée). Callgraph :
 *   node scripts/audit-callgraph-closure.cjs --file pokenav.c
 */
import {
  gMain, ResetBgsAndClearDma3BusyFlags, InitBgsFromTemplates, InitWindows,
  DeactivateAllTextPrinters, ShowBg, ResetPaletteFade, ResetTasks,
  FreeAllWindowBuffers, LoadPalette, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, AddTextPrinterParameterized3, JOY_NEW,
  DmaClearLarge16, DmaClear16, VRAM, VRAM_SIZE,
} from '../harness/runtime/decomp-globals';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { ResetSpriteData, FreeAllSpritePalettes } from './sprite';
import { B_BUTTON, REG_OFFSET_DISPCNT } from '../include/gba/io_reg';
import { BeginNormalPaletteFade } from './palette';
import { PokenavResources, POKENAV_SUBSTRUCT_COUNT, FreePokenavSubstruct, _setGPokenavResources, gPokenavResources, newPokenavResources } from './pokenav_resources';
import { CreateTask } from './task';
import { LoadOam, ProcessSpriteCopyRequests, TransferPlttBuffer } from '../harness/runtime/decomp-globals';
import { IsActiveMenuLoopTaskActive, InitPokenavMainMenu, PokenavMainMenuLoopedTaskIsActive, ShutdownPokenav, WaitForPokenavShutdownFade, SetActiveMenuLoopTasks, RunMainMenuLoopedTask } from './pokenav_main_menu';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
// ─── Table PokenavMenuCallbacks[15] (pokenav.c:52) : les 59 callbacks des 7 familles de menus,
//     tous déjà portés dans les subscreens. Imports 1:1 par fichier. ─────────────────────────
import { GetMenuHandlerCallback, FreeMenuHandlerSubstruct1, PokenavCallback_Init_ConditionMenu, PokenavCallback_Init_ConditionSearchMenu, PokenavCallback_Init_MainMenuCursorOnMap, PokenavCallback_Init_MainMenuCursorOnMatchCall, PokenavCallback_Init_MainMenuCursorOnRibbons } from './pokenav_menu_handler';
import { CreateMenuHandlerLoopedTask, FreeMenuHandlerSubstruct2, IsMenuHandlerLoopedTaskActive, OpenPokenavMenuInitial, OpenPokenavMenuNotInitial } from './pokenav_menu_handler_gfx';
import { CreateRegionMapLoopedTask, FreeRegionMapSubstruct1, FreeRegionMapSubstruct2, GetRegionMapCallback, IsRegionMapLoopedTaskActive, OpenPokenavRegionMap, PokenavCallback_Init_RegionMap, PrefetchPokenavRegionMapAssets } from './pokenav_region_map';
import { FreeConditionGraphMenuSubstruct1, GetConditionGraphMenuCallback, PokenavCallback_Init_ConditionGraph_Party, PokenavCallback_Init_ConditionGraph_Search } from './pokenav_conditions';
import { CreateConditionGraphMenuLoopedTask, FreeConditionGraphMenuSubstruct2, IsConditionGraphMenuLoopedTaskActive, OpenConditionGraphMenu, PrefetchConditionGraphAssets } from './pokenav_conditions_gfx';
import { CreateSearchResultsLoopedTask, FreeSearchResultSubstruct1, FreeSearchResultSubstruct2, GetConditionSearchResultsCallback, IsSearchResultLoopedTaskActive, OpenConditionSearchListFromGraph, OpenConditionSearchResults, PokenavCallback_Init_ConditionSearch, PokenavCallback_Init_ReturnToMonSearchList, PrefetchConditionSearchResultsAssets } from './pokenav_conditions_search_results';
import { PrefetchListArrowAssets } from './pokenav_list';
import { CreateMatchCallLoopedTask, FreeMatchCallSubstruct2, IsMatchCallLoopedTaskActive, OpenMatchCall, PrefetchMatchCallAssets } from './pokenav_match_call_gfx';
import { FreeMatchCallSubstruct1, GetMatchCallCallback, PokenavCallback_Init_MatchCall } from './pokenav_match_call_list';
import { CreateRibbonsMonListLoopedTask, FreeRibbonsMonList, FreeRibbonsMonMenu, GetRibbonsMonListCallback, IsRibbonsMonListLoopedTaskActive, OpenRibbonsMonList, OpenRibbonsMonListFromRibbonsSummary, PokenavCallback_Init_MonRibbonList, PokenavCallback_Init_RibbonsMonListFromSummary, PrefetchRibbonsListAssets } from './pokenav_ribbons_list';
import { CreateRibbonsSummaryLoopedTask, FreeRibbonsSummaryScreen1, FreeRibbonsSummaryScreen2, GetRibbonsSummaryMenuCallback, IsRibbonsSummaryLoopedTaskActive, OpenRibbonsSummaryMenu, PokenavCallback_Init_RibbonsSummaryMenu, PrefetchRibbonsSummaryAssets } from './pokenav_ribbons_summary';
import { gPlayerParty, GetMonData, PARTY_SIZE } from './engine/battle/party-storage';
import { MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_EGG, MON_DATA_RIBBON_COUNT } from '../include/pokemon';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from './engine/save/save-blocks';
import { CheckBoxMonSanityAt, GetBoxMonDataAt } from './pokemon_storage_system';
import { InitKeys } from '../harness/runtime/decomp-runtime';

/** 1:1 `struct PokenavCallbacks` (pokenav.c:27). bool32/u32 → number (permissif : les 59 ports
 *  varient entre `boolean` et `number` pour bool32). */
interface PokenavCallbacks {
  init: () => boolean | number;
  callback: () => number;
  open: () => boolean | number;
  createLoopTask: (state: number) => void;
  isLoopTaskActive: () => boolean | number;
  free1: () => void;
  free2: () => void;
}

/** 1:1 `const struct PokenavCallbacks PokenavMenuCallbacks[15]` (pokenav.c:52). Indexé par
 *  `menuId - POKENAV_MENU_IDS_START` ; entrées dans l'ordre de l'enum POKENAV_* (0..14). */
const PokenavMenuCallbacks: PokenavCallbacks[] = [
  // [0] POKENAV_MAIN_MENU
  { init: PokenavCallback_Init_MainMenuCursorOnMap, callback: GetMenuHandlerCallback, open: OpenPokenavMenuInitial, createLoopTask: CreateMenuHandlerLoopedTask, isLoopTaskActive: IsMenuHandlerLoopedTaskActive, free1: FreeMenuHandlerSubstruct1, free2: FreeMenuHandlerSubstruct2 },
  // [1] POKENAV_MAIN_MENU_CURSOR_ON_MAP
  { init: PokenavCallback_Init_MainMenuCursorOnMap, callback: GetMenuHandlerCallback, open: OpenPokenavMenuNotInitial, createLoopTask: CreateMenuHandlerLoopedTask, isLoopTaskActive: IsMenuHandlerLoopedTaskActive, free1: FreeMenuHandlerSubstruct1, free2: FreeMenuHandlerSubstruct2 },
  // [2] POKENAV_CONDITION_MENU
  { init: PokenavCallback_Init_ConditionMenu, callback: GetMenuHandlerCallback, open: OpenPokenavMenuNotInitial, createLoopTask: CreateMenuHandlerLoopedTask, isLoopTaskActive: IsMenuHandlerLoopedTaskActive, free1: FreeMenuHandlerSubstruct1, free2: FreeMenuHandlerSubstruct2 },
  // [3] POKENAV_CONDITION_SEARCH_MENU
  { init: PokenavCallback_Init_ConditionSearchMenu, callback: GetMenuHandlerCallback, open: OpenPokenavMenuNotInitial, createLoopTask: CreateMenuHandlerLoopedTask, isLoopTaskActive: IsMenuHandlerLoopedTaskActive, free1: FreeMenuHandlerSubstruct1, free2: FreeMenuHandlerSubstruct2 },
  // [4] POKENAV_MAIN_MENU_CURSOR_ON_MATCH_CALL
  { init: PokenavCallback_Init_MainMenuCursorOnMatchCall, callback: GetMenuHandlerCallback, open: OpenPokenavMenuNotInitial, createLoopTask: CreateMenuHandlerLoopedTask, isLoopTaskActive: IsMenuHandlerLoopedTaskActive, free1: FreeMenuHandlerSubstruct1, free2: FreeMenuHandlerSubstruct2 },
  // [5] POKENAV_MAIN_MENU_CURSOR_ON_RIBBONS
  { init: PokenavCallback_Init_MainMenuCursorOnRibbons, callback: GetMenuHandlerCallback, open: OpenPokenavMenuNotInitial, createLoopTask: CreateMenuHandlerLoopedTask, isLoopTaskActive: IsMenuHandlerLoopedTaskActive, free1: FreeMenuHandlerSubstruct1, free2: FreeMenuHandlerSubstruct2 },
  // [6] POKENAV_REGION_MAP
  { init: PokenavCallback_Init_RegionMap, callback: GetRegionMapCallback, open: OpenPokenavRegionMap, createLoopTask: CreateRegionMapLoopedTask, isLoopTaskActive: IsRegionMapLoopedTaskActive, free1: FreeRegionMapSubstruct1, free2: FreeRegionMapSubstruct2 },
  // [7] POKENAV_CONDITION_GRAPH_PARTY
  { init: PokenavCallback_Init_ConditionGraph_Party, callback: GetConditionGraphMenuCallback, open: OpenConditionGraphMenu, createLoopTask: CreateConditionGraphMenuLoopedTask, isLoopTaskActive: IsConditionGraphMenuLoopedTaskActive, free1: FreeConditionGraphMenuSubstruct1, free2: FreeConditionGraphMenuSubstruct2 },
  // [8] POKENAV_CONDITION_SEARCH_RESULTS
  { init: PokenavCallback_Init_ConditionSearch, callback: GetConditionSearchResultsCallback, open: OpenConditionSearchResults, createLoopTask: CreateSearchResultsLoopedTask, isLoopTaskActive: IsSearchResultLoopedTaskActive, free1: FreeSearchResultSubstruct1, free2: FreeSearchResultSubstruct2 },
  // [9] POKENAV_CONDITION_GRAPH_SEARCH
  { init: PokenavCallback_Init_ConditionGraph_Search, callback: GetConditionGraphMenuCallback, open: OpenConditionGraphMenu, createLoopTask: CreateConditionGraphMenuLoopedTask, isLoopTaskActive: IsConditionGraphMenuLoopedTaskActive, free1: FreeConditionGraphMenuSubstruct1, free2: FreeConditionGraphMenuSubstruct2 },
  // [10] POKENAV_RETURN_CONDITION_SEARCH
  { init: PokenavCallback_Init_ReturnToMonSearchList, callback: GetConditionSearchResultsCallback, open: OpenConditionSearchListFromGraph, createLoopTask: CreateSearchResultsLoopedTask, isLoopTaskActive: IsSearchResultLoopedTaskActive, free1: FreeSearchResultSubstruct1, free2: FreeSearchResultSubstruct2 },
  // [11] POKENAV_MATCH_CALL
  { init: PokenavCallback_Init_MatchCall, callback: GetMatchCallCallback, open: OpenMatchCall, createLoopTask: CreateMatchCallLoopedTask, isLoopTaskActive: IsMatchCallLoopedTaskActive, free1: FreeMatchCallSubstruct1, free2: FreeMatchCallSubstruct2 },
  // [12] POKENAV_RIBBONS_MON_LIST
  { init: PokenavCallback_Init_MonRibbonList, callback: GetRibbonsMonListCallback, open: OpenRibbonsMonList, createLoopTask: CreateRibbonsMonListLoopedTask, isLoopTaskActive: IsRibbonsMonListLoopedTaskActive, free1: FreeRibbonsMonList, free2: FreeRibbonsMonMenu },
  // [13] POKENAV_RIBBONS_SUMMARY_SCREEN
  { init: PokenavCallback_Init_RibbonsSummaryMenu, callback: GetRibbonsSummaryMenuCallback, open: OpenRibbonsSummaryMenu, createLoopTask: CreateRibbonsSummaryLoopedTask, isLoopTaskActive: IsRibbonsSummaryLoopedTaskActive, free1: FreeRibbonsSummaryScreen1, free2: FreeRibbonsSummaryScreen2 },
  // [14] POKENAV_RIBBONS_RETURN_TO_MON_LIST
  { init: PokenavCallback_Init_RibbonsMonListFromSummary, callback: GetRibbonsMonListCallback, open: OpenRibbonsMonListFromRibbonsSummary, createLoopTask: CreateRibbonsMonListLoopedTask, isLoopTaskActive: IsRibbonsMonListLoopedTaskActive, free1: FreeRibbonsMonList, free2: FreeRibbonsMonMenu },
];
void PokenavMenuCallbacks; // inerte tant que SetActivePokenavMenu/Task_Pokenav ne l'utilisent pas (prochain cycle)

// 1:1 décomp pokenav.h POKENAV_MENU_* (entrées du menu principal, base).
// Libellés FR statiques (les gText_Pokenav* ne sont pas dans decomp-strings (harness) —
// à remplacer par les vraies strings au port des subscreens).
const sMainMenuLabels = ['CARTE DE HOENN', 'CONDITION', 'MATCH CALL', 'RUBANS', 'ETEINDRE'];

const WIN_TITLE = 0;
const WIN_MENU = 1;

let _active = false;

/** 1:1 décomp `void CB2_InitPokeNav(void)` (pokenav.c:315) : alloue gPokenavResources, l'initialise,
 *  crée Task_Pokenav (la state-machine qui pilote InitPokenavMainMenu → bandeau/icônes) et installe
 *  les callbacks. ADAPTATION MOTEUR : `Alloc(sizeof(*gPokenavResources))` = `newPokenavResources()`
 *  (jamais null en TS → la branche d'échec reste 1:1 mais inatteignable) ; retour field = import
 *  dynamique overworld (évite le cycle) ; CreateTask via l'adaptateur objet-task 1:1. */
export function CB2_InitPokeNav(): void {
  const rt = getRuntime();
  if (!rt) return;
  _setGPokenavResources(newPokenavResources());
  if (gPokenavResources == null) {
    void import('./overworld').then((m) => {
      const cb = m.CB2_ReturnToFieldWithOpenMenu_Manual as (() => void) | undefined;
      if (cb) rt.SetMainCallback2(cb as never);
    }).catch((e) => console.error('[pokenav CB2_InitPokeNav alloc-fail]', e));
  } else {
    InitPokenavResources(gPokenavResources);
    // ADAPTATION MOTEUR : préchauffe les assets/data des sous-menus (idempotent) —
    // le décomp a tout en ROM ; lancer les fetches pendant le fade d'ouverture
    // ramène les transitions vers les ~0.2 s GBA (au lieu de gates async visibles).
    PrefetchMatchCallAssets();
    PrefetchListArrowAssets();
    PrefetchPokenavRegionMapAssets();
    PrefetchConditionGraphAssets();
    PrefetchConditionSearchResultsAssets();
    PrefetchRibbonsListAssets();
    PrefetchRibbonsSummaryAssets();
    ResetTasks();
    rt.SetVBlankCallback(null);
    CreateTask((t: DecompTask) => Task_Pokenav(t), 0);
    rt.SetMainCallback2(CB2_Pokenav as never);
    rt.SetVBlankCallback(VBlankCB_Pokenav as never);
    _active = true;
  }
}

/** 1:1 décomp `static void CB2_Pokenav(void)` (pokenav.c:417). */
export function CB2_Pokenav(): void {
  const rt = getRuntime();
  if (!rt || !_active) return;
  rt.runTasks?.();
  rt.animateSprites?.();
  rt.buildOamBuffer?.();
  rt.UpdatePaletteFade?.();
}

/** 1:1 décomp `static void VBlankCB_Pokenav(void)` (pokenav.c:425). */
export function VBlankCB_Pokenav(): void {
  LoadOam();
  ProcessSpriteCopyRequests();
  TransferPlttBuffer();
}

/** 1:1 décomp `void SetVBlankCallback_(IntrCallback callback)` (pokenav.c:537-540) —
 *  wrapper SetVBlankCallback exposé aux subscreens (conditions_gfx, menu_handler_gfx,
 *  region_map installent leur VBlank custom par ici). */
export function SetVBlankCallback_(callback: (() => void) | null): void {
  getRuntime()?.SetVBlankCallback(callback as never);
}

/** 1:1 décomp `void SetPokenavVBlankCallback(void)` (pokenav.c:542) = SetVBlankCallback(VBlankCB_Pokenav).
 *  Appelée par les subscreens/glow (menu_handler_gfx, conditions_gfx, region_map) pour restaurer le
 *  VBlank Pokénav après un effet scanline. */
export function SetPokenavVBlankCallback(): void {
  getRuntime()?.SetVBlankCallback(VBlankCB_Pokenav as never);
}

/** Câblage start menu (remplace le fallback message). */
export function StartMenu_OpenPokenav(): void {
  const rt = getRuntime();
  if (rt) rt.SetMainCallback2(CB2_InitPokeNav as never);
}

// ─── Lifecycle des ressources (pokenav.c) — transcription 1:1 (inerte tant que le vrai
//     CB2_InitPokeNav/Task_Pokenav n'appelle pas encore InitPokenavResources) ──────────

/** 1:1 décomp pokenav.h:67 `POKENAV_MODE_NORMAL` (Pokénav ouvert depuis le Start menu). */
const POKENAV_MODE_NORMAL = 0;

/** 1:1 décomp `static bool32 AnyMonHasRibbon(void)` (pokenav.c:388) : un mon (équipe ou boîte
 *  PC) porte-t-il au moins un ruban ? (`as number` = convention repo pour GetMonData). */
export function AnyMonHasRibbon(): boolean {
  for (let i = 0; i < PARTY_SIZE; i++) {
    if ((GetMonData(gPlayerParty[i], MON_DATA_SANITY_HAS_SPECIES) as number)
      && !(GetMonData(gPlayerParty[i], MON_DATA_SANITY_IS_EGG) as number)
      && (GetMonData(gPlayerParty[i], MON_DATA_RIBBON_COUNT) as number) !== 0) {
      return true;
    }
  }

  for (let j = 0; j < TOTAL_BOXES_COUNT; j++) {
    for (let i = 0; i < IN_BOX_COUNT; i++) {
      if (CheckBoxMonSanityAt(j, i)
        && GetBoxMonDataAt(j, i, MON_DATA_RIBBON_COUNT) !== 0) {
        return true;
      }
    }
  }

  return false;
}

/** 1:1 décomp `static void InitPokenavResources(struct PokenavResources *resources)` (pokenav.c:375). */
export function InitPokenavResources(resources: PokenavResources): void {
  for (let i = 0; i < POKENAV_SUBSTRUCT_COUNT; i++)
    resources.substructPtrs[i] = null;

  resources.mode = POKENAV_MODE_NORMAL;
  resources.currentMenuIndex = 0;
  resources.hasAnyRibbons = AnyMonHasRibbon();
  resources.currentMenuCb1 = null;
}

/** 1:1 décomp `static void FreePokenavResources(void)` (pokenav.c:364) : libère les substructs +
 *  `FREE_AND_SET_NULL(gPokenavResources)` (= `_setGPokenavResources(null)`) + `InitKeys()`. */
export function FreePokenavResources(): void {
  for (let i = 0; i < POKENAV_SUBSTRUCT_COUNT; i++)
    FreePokenavSubstruct(i);

  _setGPokenavResources(null);
  // ADAPTATION MOTEUR : le port passe `rt` à InitKeys (cf. CB2_InitPokeNav:44, scenes InitKeys(this.rt)).
  const rt = getRuntime();
  if (rt) InitKeys(rt);
}

/** 1:1 décomp `static u32 IsActiveMenuLoopTaskActive_(void)` (pokenav.c:522) : wrapper
 *  sur `IsActiveMenuLoopTaskActive` (pokenav_main_menu.c). */
export function IsActiveMenuLoopTaskActive_(): number {
  return IsActiveMenuLoopTaskActive();
}

/** 1:1 décomp `static u32 GetCurrentMenuCB(void)` (pokenav.c:527) : appelle le callback du menu
 *  courant (`currentMenuCb1`, posé par SetActivePokenavMenu — inerte tant que non porté). */
export function GetCurrentMenuCB(): number {
  return gPokenavResources!.currentMenuCb1!();
}

/** 1:1 décomp `static void InitKeys_(void)` (pokenav.c:532). ADAPTATION MOTEUR : `rt` via getRuntime. */
export function InitKeys_(): void {
  const rt = getRuntime();
  if (rt) InitKeys(rt);
}

/** 1:1 `#define POKENAV_MENU_IDS_START 100000` (pokenav.h:116) + `POKENAV_MAIN_MENU` (:119). */
const POKENAV_MENU_IDS_START = 100000;
const POKENAV_MAIN_MENU = POKENAV_MENU_IDS_START;
/** 1:1 `#define POKENAV_MENU_FUNC_EXIT -1` (pokenav.h:269). */
const POKENAV_MENU_FUNC_EXIT = -1;

/** 1:1 décomp `static bool32 SetActivePokenavMenu(u32 menuId)` (pokenav.c:506) : active le menu
 *  `menuId` (init → open → pose loop tasks + callback courant). Retourne false si init/open échoue. */
export function SetActivePokenavMenu(menuId: number): boolean {
  const index = menuId - POKENAV_MENU_IDS_START;

  InitKeys_();
  if (!PokenavMenuCallbacks[index].init())
    return false;
  if (!PokenavMenuCallbacks[index].open())
    return false;

  SetActiveMenuLoopTasks(PokenavMenuCallbacks[index].createLoopTask, PokenavMenuCallbacks[index].isLoopTaskActive);
  gPokenavResources!.currentMenuCb1 = PokenavMenuCallbacks[index].callback;
  gPokenavResources!.currentMenuIndex = index;
  return true;
}

/** 1:1 décomp `static void Task_Pokenav(u8 taskId)` (pokenav.c:434) : la state machine principale
 *  (`tState` = `data[0]`). ADAPTATION MOTEUR : task = objet (`task.data`) ; retour field = import
 *  dynamique overworld (évite le cycle pokenav↔overworld, même pattern que CB2_Pokenav). INERTE
 *  tant que le vrai CB2_InitPokeNav ne fait pas `CreateTask(Task_Pokenav)`. */
export function Task_Pokenav(task: DecompTask): void {
  let menuId: number;
  const data = task.data;

  switch (data[0]) {
  case 0:
    InitPokenavMainMenu();
    data[0] = 1;
    break;
  case 1:
    // Wait for LoopedTask_InitPokenavMenu to finish
    if (PokenavMainMenuLoopedTaskIsActive())
      break;
    SetActivePokenavMenu(POKENAV_MAIN_MENU);
    data[0] = 4;
    break;
  case 2:
    if (IsActiveMenuLoopTaskActive())
      break;
    data[0] = 3;
    // fallthrough 1:1 (pas de break après case 2 dans le décomp)
  case 3:
    menuId = GetCurrentMenuCB();
    if (menuId === POKENAV_MENU_FUNC_EXIT) {
      ShutdownPokenav();
      data[0] = 5;
    } else if (menuId >= POKENAV_MENU_IDS_START) {
      PokenavMenuCallbacks[gPokenavResources!.currentMenuIndex].free2();
      PokenavMenuCallbacks[gPokenavResources!.currentMenuIndex].free1();
      if (SetActivePokenavMenu(menuId)) {
        data[0] = 4;
      } else {
        ShutdownPokenav();
        data[0] = 5;
      }
    } else if (menuId !== 0) {
      RunMainMenuLoopedTask(menuId);
      if (IsActiveMenuLoopTaskActive())
        data[0] = 2;
    }
    break;
  case 4:
    if (!IsActiveMenuLoopTaskActive_())
      data[0] = 3;
    break;
  case 5:
    if (!WaitForPokenavShutdownFade()) {
      const calledFromScript = (gPokenavResources!.mode !== POKENAV_MODE_NORMAL);

      FreeMenuHandlerSubstruct1();
      FreePokenavResources();
      const rt = getRuntime();
      void import('./overworld').then((m) => {
        const cb = calledFromScript ? m.CB2_ReturnToFieldContinueScript_Manual : m.CB2_ReturnToFieldWithOpenMenu_Manual;
        if (rt && cb) rt.SetMainCallback2(cb as never);
      }).catch((e) => console.error('[pokenav Task_Pokenav return-field]', e));
    }
    break;
  }
}

// ─── À PORTER (Opus) — noms 1:1 pokenav.c ────
// Le vrai CB2_InitPokeNav (:315 : crée gPokenavResources via InitPokenavResources +
// CreateTask(Task_Pokenav) + gfx) remplaçant le squelette — BLOQUÉ par les stubs gfx/assets
// de InitPokenavMainMenu (pokenav_main_menu.c : DecompressAndCopyTileDataToVram, gPokenavHeader_*).
// CB2_Pokenav/VBlankCB_Pokenav réels (:417/:425).
// pokenav_main_menu.c ENTIER (bandeau/icônes) · pokenav_menu_handler_1/2.c (navigation) ·
// subscreens region_map/conditions/match_call/ribbons. JOY_NEW/dpad : cf. option_menu.ts.
void JOY_NEW;

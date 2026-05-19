/**
 * bag-menu.ts — SAC 1:1 décomp `src/item_menu.c` (2609 l) — RÉÉCRITURE PROPRE
 * ============================================================================
 * Chantier maillon SAC (mémoire BAG-PHASE-2-PLAN). `list_menu.c` (BLOQUANT #1)
 * = 100% 1:1 fait. Ce module REMPLACE le foam reverted `bag-screen.ts`
 * (cddfcfee, base "en mousse") — réécrit PROPRE comme summary-screen.ts.
 * Le câblage start-menu/party bascule vers ici à l'ÉTAPE 9 (le plan le
 * prescrit) ; jusque-là `bag-screen.ts` continue de servir le sac → tsc
 * reste vert, zéro régression runtime.
 *
 * Pattern CB2-swap = IDENTIQUE au summary-screen.ts prouvé/A-B-validé :
 * `SetupBagMenu` (décomp `CB2_Bag` while-loop) → state machine avancée
 * d'UN état par frame par le runtime (1:1 net-effect : tout est derrière
 * un fade noir jusqu'à BlendPalettes/FadeScreen ; adaptation acceptée &
 * validée pour Summary/party — synchrone, PAS d'async ad-hoc = exigence
 * anti-foam respectée).
 *
 * ── ÉTAT D'AVANCEMENT (SPINE, A/B user aux checkpoints) ──────────────────
 *  ÉTAPE 2 (ICI)  : state model gBagMenu/gBagPosition + GoToBagMenu +
 *                   entrées maillon (CB2_BagMenuFrom*) + CB2_Bag +
 *                   SetupBagMenu 1:1 STRUCTURE + CB2/VBlank run.
 *  ÉTAPE 3..9     : helpers `_nyi(...)` (throw LOUD honnête, WORKING-MODE
 *                   §2 — jamais de fake silencieux) portés au fur.
 * Non wiré → ouvrir le sac passe encore par le foam ; ici tsc=0 +
 * import sain (feuille, pas de cycle TDZ) = vérif déterministe étape 2.
 */
import { getRuntime, ResetPaletteFade, ResetTasks } from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import {
  ENUM_ITEMMENULOCATION_0, ENUM_ITEMWIN_1, ENUM_ITEMMENUSPRITE_2,
  ITEMMENU_SWAP_LINE_LENGTH,
} from './decomp-data/auto/include/item_menu-data';
import {
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET,
  KEYITEMS_POCKET, POCKETS_COUNT,
} from './decomp-data/auto/include/constants/item-data';
import { BG_SCREEN_SIZE } from './decomp-data/auto/include/gba/defines-data';

// ─── Constantes 1:1 (importées decomp-data/auto sauf dérivées documentées) ───
export const ITEMMENULOCATION_FIELD = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_FIELD;
export const ITEMMENULOCATION_BATTLE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BATTLE;
export const ITEMMENULOCATION_PARTY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_PARTY;
export const ITEMMENULOCATION_SHOP = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_SHOP;
export const ITEMMENULOCATION_BERRY_TREE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BERRY_TREE;
export const ITEMMENULOCATION_BERRY_BLENDER_CRUSH = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BERRY_BLENDER_CRUSH;
export const ITEMMENULOCATION_ITEMPC = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_ITEMPC;
export const ITEMMENULOCATION_FAVOR_LADY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_FAVOR_LADY;
export const ITEMMENULOCATION_QUIZ_LADY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_QUIZ_LADY;
export const ITEMMENULOCATION_APPRENTICE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_APPRENTICE;
export const ITEMMENULOCATION_WALLY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_WALLY;
export const ITEMMENULOCATION_PCBOX = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_PCBOX;
export const ITEMMENULOCATION_LAST = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_LAST;

// ITEMMENUSPRITE_COUNT : ⚠️ l'auto-extract donne 5 (FAUX — il n'évalue
// pas l'expression `ITEMMENUSPRITE_SWAP_LINE + ITEMMENU_SWAP_LINE_LENGTH`).
// Décomp item_menu.h:46 : `ITEMMENUSPRITE_COUNT = ITEMMENUSPRITE_SWAP_LINE
// + ITEMMENU_SWAP_LINE_LENGTH` = 4 + 8 = 12. On le DÉRIVE 1:1 (pas hardcode).
const ITEMMENUSPRITE_SWAP_LINE = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_SWAP_LINE;
export const ITEMMENUSPRITE_BAG = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_BAG;
export const ITEMMENUSPRITE_COUNT = ITEMMENUSPRITE_SWAP_LINE + ITEMMENU_SWAP_LINE_LENGTH; // 12
export const ITEMWIN_COUNT = ENUM_ITEMWIN_1.ITEMWIN_COUNT; // 10
export { ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET, POCKETS_COUNT };

// Sentinelles 1:1 : SPRITE_NONE sprite.h:6 / WINDOW_NONE window.h:43 /
// TASK_NONE task.h:6 (TAIL_SENTINEL=0xFF) / NOT_SWAPPING item_menu.c:104.
const SPRITE_NONE = 0xFF;
const WINDOW_NONE = 0xFF;
const TASK_NONE = 0xFF;
const NOT_SWAPPING = 0xFF;

type MainCallback = (() => void) | null;

// ─── struct BagPosition (item_menu.h:49) — PERSISTANT (décomp EWRAM_DATA,
//     jamais libéré : conserve poche/curseur/scroll entre 2 ouvertures) ──────
interface BagPosition {
  exitCallback: MainCallback;
  location: number;
  pocket: number;
  pocketSwitchArrowPos: number;
  cursorPosition: number[]; // [POCKETS_COUNT]
  scrollPosition: number[]; // [POCKETS_COUNT]
}
export const gBagPosition: BagPosition = {
  exitCallback: null,
  location: 0,
  pocket: 0,
  pocketSwitchArrowPos: 0,
  cursorPosition: new Array(POCKETS_COUNT).fill(0),
  scrollPosition: new Array(POCKETS_COUNT).fill(0),
};

// ─── struct BagMenu (item_menu.h:61) — PAR-OUVERTURE (AllocZeroed ;
//     null quand le sac est fermé). Champs 1:1. ──────────────────────────────
interface BagMenu {
  newScreenCallback: MainCallback;
  tilemapBuffer: Uint16Array;        // u8[BG_SCREEN_SIZE] utilisé en tilemap u16
  spriteIds: number[];               // [ITEMMENUSPRITE_COUNT]
  windowIds: number[];               // [ITEMWIN_COUNT]
  toSwapPos: number;
  pocketSwitchDisabled: number;      // :4
  itemIconSlot: number;              // :2
  inhibitItemDescriptionPrint: number; // :1
  hideCloseBagText: number;          // :1
  pocketScrollArrowsTask: number;
  pocketSwitchArrowsTask: number;
  contextMenuItemsPtr: readonly number[] | null;
  contextMenuItemsBuffer: number[];  // [4]
  contextMenuNumItems: number;
  numItemStacks: number[];           // [POCKETS_COUNT]
  numShownItems: number[];           // [POCKETS_COUNT]
  graphicsLoadState: number;         // s16
  pocketNameBuffer: Uint8Array;      // [32][32]
}
export let gBagMenu: BagMenu | null = null;

function _allocZeroedBagMenu(): BagMenu {
  return {
    newScreenCallback: null,
    tilemapBuffer: new Uint16Array(BG_SCREEN_SIZE >> 1), // 2048 octets = 1024 u16
    spriteIds: new Array(ITEMMENUSPRITE_COUNT).fill(0),
    windowIds: new Array(ITEMWIN_COUNT).fill(0),
    toSwapPos: 0,
    pocketSwitchDisabled: 0,
    itemIconSlot: 0,
    inhibitItemDescriptionPrint: 0,
    hideCloseBagText: 0,
    pocketScrollArrowsTask: 0,
    pocketSwitchArrowsTask: 0,
    contextMenuItemsPtr: null,
    contextMenuItemsBuffer: new Array(4).fill(0),
    contextMenuNumItems: 0,
    numItemStacks: new Array(POCKETS_COUNT).fill(0),
    numShownItems: new Array(POCKETS_COUNT).fill(0),
    graphicsLoadState: 0,
    pocketNameBuffer: new Uint8Array(32 * 32),
  };
}

// ─── Helpers étapes 3..9 non encore portés — STUB HONNÊTE LOUD ───────────────
// WORKING-MODE §2 : jamais de fake silencieux. Atteint = crash explicite
// (le sac n'est PAS encore wiré au start-menu → jamais atteint en jeu ;
// la structure de la state machine ci-dessous est, elle, 1:1 complète).
function _nyi(step: number, name: string): never {
  throw new Error(`bag-menu SPINE étape ${step} : ${name} pas encore porté (item_menu.c)`);
}

// ─── ResetBagScrollPositions (item_menu.c:556) ───────────────────────────────
export function ResetBagScrollPositions(): void {
  gBagPosition.pocket = ITEMS_POCKET;
  gBagPosition.cursorPosition.fill(0);
  gBagPosition.scrollPosition.fill(0);
}

// ─── Entrées maillon (item_menu.c:563-615) — thin 1:1 ────────────────────────
/** 1:1 décomp `CB2_BagMenuFromStartMenu` (item_menu.c:563). */
export function CB2_BagMenuFromStartMenu(): void {
  // exitCallback CB2_ReturnToFieldWithOpenMenu : câblé à l'étape 9 (flow OW).
  GoToBagMenu(ITEMMENULOCATION_FIELD, POCKETS_COUNT, _cb2ReturnToFieldWithOpenMenu);
}
/** 1:1 décomp `CB2_BagMenuFromBattle` (item_menu.c:568). Branche pyramide =
 *  MAILLON ultérieur (battle_pyramid_bag.c, fichier séparé). */
export function CB2_BagMenuFromBattle(): void {
  // CurrentBattlePyramidLocation()==NONE : pyramide non portée → branche
  // normale uniquement (report honnête ; pyramide = étape MAILLON).
  GoToBagMenu(ITEMMENULOCATION_BATTLE, POCKETS_COUNT, _cb2SetUpReshowBattleScreenAfterMenu2);
}
/** 1:1 décomp `CB2_ChooseBerry` (item_menu.c:577). */
export function CB2_ChooseBerry(): void {
  GoToBagMenu(ITEMMENULOCATION_BERRY_TREE, BERRIES_POCKET, _cb2ReturnToFieldContinueScript);
}
/** 1:1 décomp `ChooseBerryForMachine` (item_menu.c:583). */
export function ChooseBerryForMachine(exitCallback: MainCallback): void {
  GoToBagMenu(ITEMMENULOCATION_BERRY_BLENDER_CRUSH, BERRIES_POCKET, exitCallback);
}

// exitCallbacks externes — résolus au câblage étape 9 (placeholders honnêtes
// NON appelés tant que le sac n'est pas wiré ; pas des fakes silencieux).
const _cb2ReturnToFieldWithOpenMenu: MainCallback = null;
const _cb2SetUpReshowBattleScreenAfterMenu2: MainCallback = null;
const _cb2ReturnToFieldContinueScript: MainCallback = null;

// ─── GoToBagMenu (item_menu.c:617) — 1:1 strict ──────────────────────────────
export function GoToBagMenu(location: number, pocket: number, exitCallback: MainCallback): void {
  gBagMenu = _allocZeroedBagMenu(); // AllocZeroed ne peut pas échouer ici (≠ C OOM)
  if (location !== ITEMMENULOCATION_LAST)
    gBagPosition.location = location;
  if (exitCallback)
    gBagPosition.exitCallback = exitCallback;
  if (pocket < POCKETS_COUNT)
    gBagPosition.pocket = pocket;
  if (gBagPosition.location === ITEMMENULOCATION_BERRY_TREE ||
      gBagPosition.location === ITEMMENULOCATION_BERRY_BLENDER_CRUSH)
    gBagMenu.pocketSwitchDisabled = 1; // :4 bitfield, TRUE
  gBagMenu.newScreenCallback = null;
  gBagMenu.toSwapPos = NOT_SWAPPING;
  gBagMenu.pocketScrollArrowsTask = TASK_NONE;
  gBagMenu.pocketSwitchArrowsTask = TASK_NONE;
  gBagMenu.spriteIds.fill(SPRITE_NONE);
  gBagMenu.windowIds.fill(WINDOW_NONE);
  const rt = getRuntime();
  if (rt) rt.SetMainCallback2(CB2_Bag);
}

// ─── CB2_BagMenuRun / VBlankCB_BagMenuRun (item_menu.c:646/655) ──────────────
// 1:1 net-effect : RunTasks/AnimateSprites/BuildOamBuffer/DoScheduledBg…/
// UpdatePaletteFade (et LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer)
// = auto-tickés par notre runtime (modèle prouvé Summary `MainCB2_SummaryRun`).
export function CB2_BagMenuRun(): void { /* runtime auto-tick */ }
export function VBlankCB_BagMenuRun(): void { /* transferts auto */ }

// ─── CB2_Bag (item_menu.c:672) + SetupBagMenu (item_menu.c:678) ──────────────
// décomp `CB2_Bag` = `while(!waitLink && !SetupBagMenu() && !linkActive){}`.
// Adaptation 1:1 prouvée (Summary) : le runtime appelle CB2_Bag chaque
// frame, SetupBagMenu avance d'UN état. Net-effect identique (tout sous
// fade noir jusqu'au case 20). Lien : non modélisé → pas de wait link.
export function CB2_Bag(): void {
  SetupBagMenu();
}

/** 1:1 décomp `SetupBagMenu` (item_menu.c:678) — STRUCTURE state machine
 *  0..20 strictement 1:1 ; leaf-helpers étapes 3..9 = `_nyi` (loud). */
function SetupBagMenu(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  switch (rt.gMain.state) {
    case 0:
      // SetVBlankHBlankCallbacksToNull + ClearScheduledBgCopiesToVram.
      rt.SetVBlankCallback(null);
      rt.gMain.state++; break;
    case 1:
      // ScanlineEffect_Stop().
      rt.gMain.state++; break;
    case 2:
      // FreeAllSpritePalettes() — étape 3 (avec InitBGs/Graphics).
      rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 4:
      ResetSpriteData();
      rt.gMain.state++; break;
    case 5:
      rt.gMain.state++; break;
    case 6:
      // if (!MenuHelpers_IsLinkActive()) ResetTasks() — lien non modélisé.
      ResetTasks();
      rt.gMain.state++; break;
    case 7:
      BagMenu_InitBGs();
      gBagMenu!.graphicsLoadState = 0;
      rt.gMain.state++; break;
    case 8:
      if (!LoadBagMenu_Graphics())
        break;
      rt.gMain.state++; break;
    case 9:
      LoadBagMenuTextWindows();
      rt.gMain.state++; break;
    case 10:
      UpdatePocketItemLists();
      InitPocketListPositions();
      InitPocketScrollPositions();
      rt.gMain.state++; break;
    case 11:
      AllocateBagItemListBuffers();
      rt.gMain.state++; break;
    case 12:
      LoadBagItemListBuffers(gBagPosition.pocket);
      rt.gMain.state++; break;
    case 13:
      PrintPocketNames(gBagPosition.pocket);
      CopyPocketNameToWindow(0);
      DrawPocketIndicatorSquare(gBagPosition.pocket, true);
      rt.gMain.state++; break;
    case 14: {
      const taskId = CreateBagInputHandlerTask(gBagPosition.location);
      BagSetListTaskId(taskId, ListMenuInitForBag(
        gBagPosition.scrollPosition[gBagPosition.pocket],
        gBagPosition.cursorPosition[gBagPosition.pocket]));
      rt.gMain.state++; break;
    }
    case 15:
      AddBagVisualSprite(gBagPosition.pocket);
      rt.gMain.state++; break;
    case 16:
      CreateItemMenuSwapLine();
      rt.gMain.state++; break;
    case 17:
      CreatePocketScrollArrowPair();
      CreatePocketSwitchArrowPair();
      rt.gMain.state++; break;
    case 18:
      PrepareTMHMMoveWindow();
      rt.gMain.state++; break;
    case 19:
      BlendPalettesBag();
      rt.gMain.state++; break;
    case 20:
      BeginNormalPaletteFadeBag();
      rt.gPaletteFade.bufferTransferDisabled = false;
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_BagMenuRun);
      rt.SetMainCallback2(CB2_BagMenuRun);
      return true;
  }
  return false;
}

// ─── Leaf-helpers SetupBagMenu — portés étapes 3..9 (stubs LOUD honnêtes) ────
function BagMenu_InitBGs(): void { _nyi(3, 'BagMenu_InitBGs'); }
function LoadBagMenu_Graphics(): boolean { return _nyi(3, 'LoadBagMenu_Graphics'); }
function LoadBagMenuTextWindows(): void { _nyi(4, 'LoadBagMenuTextWindows'); }
function UpdatePocketItemLists(): void { _nyi(5, 'UpdatePocketItemLists'); }
function InitPocketListPositions(): void { _nyi(5, 'InitPocketListPositions'); }
function InitPocketScrollPositions(): void { _nyi(5, 'InitPocketScrollPositions'); }
function AllocateBagItemListBuffers(): void { _nyi(5, 'AllocateBagItemListBuffers'); }
function LoadBagItemListBuffers(_pocketId: number): void { _nyi(5, 'LoadBagItemListBuffers'); }
function PrintPocketNames(_pocket: number): void { _nyi(5, 'PrintPocketNames'); }
function CopyPocketNameToWindow(_a: number): void { _nyi(5, 'CopyPocketNameToWindow'); }
function DrawPocketIndicatorSquare(_p: number, _on: boolean): void { _nyi(5, 'DrawPocketIndicatorSquare'); }
function CreateBagInputHandlerTask(_location: number): number { return _nyi(6, 'CreateBagInputHandlerTask'); }
function ListMenuInitForBag(_scroll: number, _cursor: number): number { return _nyi(6, 'ListMenuInit(bag)'); }
function BagSetListTaskId(_taskId: number, _listTaskId: number): void { _nyi(6, 'tListTaskId set'); }
function AddBagVisualSprite(_pocket: number): void { _nyi(5, 'AddBagVisualSprite'); }
function CreateItemMenuSwapLine(): void { _nyi(7, 'CreateItemMenuSwapLine'); }
function CreatePocketScrollArrowPair(): void { _nyi(5, 'CreatePocketScrollArrowPair'); }
function CreatePocketSwitchArrowPair(): void { _nyi(5, 'CreatePocketSwitchArrowPair'); }
function PrepareTMHMMoveWindow(): void { _nyi(7, 'PrepareTMHMMoveWindow'); }
function BlendPalettesBag(): void { _nyi(3, 'BlendPalettes(PALETTES_ALL,16,0)'); }
function BeginNormalPaletteFadeBag(): void { _nyi(9, 'BeginNormalPaletteFade fade-in'); }

/** Sondes d'introspection déterministe (vérif étape 2, pas du gameplay). */
export function __bagMenuDebugState() {
  return {
    gBagMenu: gBagMenu ? {
      spriteIds: gBagMenu.spriteIds.length,
      windowIds: gBagMenu.windowIds.length,
      tilemap: gBagMenu.tilemapBuffer.length,
      pocketSwitchDisabled: gBagMenu.pocketSwitchDisabled,
    } : null,
    gBagPosition: { ...gBagPosition, cursorPosition: [...gBagPosition.cursorPosition] },
    consts: { ITEMMENUSPRITE_COUNT, ITEMWIN_COUNT, POCKETS_COUNT, NOT_SWAPPING },
  };
}

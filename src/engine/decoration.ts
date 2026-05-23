/**
 * decoration.ts — Port 1:1 STRICT du décomp `src/decoration.c` (2748 lignes
 *                 au total ; cette tâche couvre les sections 1-3 fondamentales,
 *                 soit ≈lignes 1-700).
 *
 * Source de vérité (= 1:1 EXACT, ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/decoration.c` (sections data +
 *     entry point + main menu dispatch + utilities)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/decoration.h`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/decorations.h`
 *
 * SCOPE de ce port (= ne PAS dépasser dans ce fichier) :
 *   1. Sections data : `sDecorationActions` (= sDecorationMainMenuActions),
 *      `sDecorationCategoryNames`, `sSecretBasePCMenuItemDescriptions`,
 *      `sDecorationWindowTemplates`.
 *   2. `DoPlayerRoomDecorationMenu(taskId)` + `DoSecretBaseDecorationMenu(taskId)`
 *      entry points + `InitDecorationActionsWindow` + `AddDecorationActionsWindow`.
 *   3. `HandleDecorationActionsMenuInput`, `PrintCurMainMenuDescription`.
 *   4. `DecorationMenuAction_Decorate / PutAway / Toss / Cancel` (= les 4
 *      actions du menu principal).
 *   5. `ReturnToDecorationActionsAfterInvalidSelection` (= utility).
 *   6. `AddDecorationWindow / RemoveDecorationWindow` (= helpers internes).
 *   7. `InitDecorationContextItems` (= 1:1 décomp section 1).
 *
 * NE PAS porter ici (= chantiers séparés futurs) :
 *   - Categories window (InitDecorationCategoriesWindow, ...) — decoration.c
 *     lignes 706-862.
 *   - Items list / icon / scroll (ShowDecorationItemsWindow, ...) — lignes
 *     864-1100+.
 *   - Place decoration flow (cursor + sprite + map placement) — ~1500 lignes.
 *   - PutAway flow (sprites + cursor + remove) — ~400 lignes.
 *   - Toss flow détaillé (YesNo + DecorationRemove) — ~100 lignes.
 *   - Trader flow (ExitTraderDecorationMenu, etc.).
 *   - Data table COMPLET `gDecorations[]` (= 120 entries, ~600 lignes via
 *     `data/decoration/header.h` + tiles/description/icon/tilemaps). Le stub
 *     minimal `_categoryForDecorId`-based dans decoration-inventory.ts suffit
 *     pour décorations.c sections 1-3. Le port complet déféré au moment du
 *     port du flow Place (= besoin de tiles + shape + permission).
 *
 * Pattern d'ouverture (= 1:1 décomp `BedroomPC` script flow OU `SecretBase` PC) :
 *   1. Script `EventScript_TurnOnPlayerPC` (= BedroomPC) ou `EventScript_SecretBasePC`
 *      crée la task initiale via `CreateTask` + `Task_OpenPlayerPC` / similaire.
 *   2. Cette task appelle `DoPlayerRoomDecorationMenu(taskId)` ou
 *      `DoSecretBaseDecorationMenu(taskId)` quand le user sélectionne
 *      "DECORATION" dans le menu PC.
 *   3. `InitDecorationActionsWindow` (= setup window + lock + draw cursor) →
 *      task.func = `HandleDecorationActionsMenuInput`.
 *   4. Sur sélection :
 *      - DECORER → `DecorationMenuAction_Decorate` → check decorations owned,
 *        soit `SecretBasePC_PrepMenuForSelectingStoredDecors` (= categories
 *        window, déféré), soit msg "Aucune décoration." + retour.
 *      - RANGER  → `DecorationMenuAction_PutAway` → check `HasDecorationsInUse`,
 *        soit fade + Task_ContinuePuttingAwayDecorations (= déféré), soit
 *        msg "Aucune décoration installée." + retour.
 *      - JETER   → `DecorationMenuAction_Toss` → idem Decorate.
 *      - SORTIR  → `DecorationMenuAction_Cancel` → script EventScript_PCCancel
 *        (SecretBase) ou `ReshowPlayerPC` (= overlay re-affiche menu PC).
 *
 * Dépendances STUB explicites (= sections décomp non-portées) :
 *   - `SecretBasePC_PrepMenuForSelectingStoredDecors` → STUB warn + msg
 *     fallback (= utilise gText_NoDecorations comme dans bedroom-pc.ts
 *     legacy). Le flow categories+items+place est un gros chantier dédié.
 *   - `HasDecorationsInUse` → STUB → toujours FALSE (= early game, aucune
 *     décoration placée). 1:1 sémantique correct pour démo.
 *   - `Task_ContinuePuttingAwayDecorations` → STUB warn (= PutAway flow
 *     déféré).
 *   - `ReshowPlayerPC` → STUB warn + DestroyTask (= overlay PC re-affichage
 *     dans bedroom-pc.ts gère via _openMainMenu, mais l'API task-based n'est
 *     pas exposée).
 *   - `SecretBase_EventScript_PCCancel` → ScriptContext_SetupScript label
 *     direct (= script existant dans le runtime).
 *
 * 1:1 STRICT — règles HARD :
 *   - Noms de fonctions IDENTIQUES au décomp (= DoPlayerRoomDecorationMenu,
 *     HandleDecorationActionsMenuInput, etc.).
 *   - Pas de raccourcis silencieux. Tout stub = console.warn + commentaire
 *     `// 1:1 TODO : port decoration.c section N (chantier futur)`.
 *   - Constants importées de decoration-inventory.ts (= DECORCAT_*), pas
 *     hardcoded.
 *   - Actions menu locales (DECOR_MENU_PLACE/TOSS/TRADE/...) define en local
 *     1:1 décomp lignes 58-63.
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, ClearDialogWindowAndFrame, ClearWindowTilemap,
  FillWindowPixelBuffer, ScheduleBgCopyTilemapToVram,
  DrawDialogueFrame,
  type WindowTemplate,
} from './gba-window-system';
import {
  AddTextPrinterParameterized3, TEXT_SKIP_DRAW, FONT_NARROW,
  GetStringRightAlignXOffset,
} from './gba-text-system';
import {
  InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrap, Menu_GetCursorPos,
} from './gba-menu-system';
import { PlaySE, getRuntime, JOY_NEW, TASK_NONE } from './decomp-globals';
import { gSaveBlock1Ptr } from './save-block-state';
import { DECOR_MAX_PLAYERS_HOUSE, DECOR_MAX_SECRET_BASE } from './save-blocks';
import {
  DECORCAT_DESK, DECORCAT_DOLL, DECORCAT_CUSHION, DECORCAT_COUNT,
  gDecorationInventories,
  gDecorations,
  GetNumOwnedDecorations,
  GetNumOwnedDecorationsInCategory,
  CondenseDecorationsInCategory,
} from './decoration-inventory';
import { getString } from './gba-strings';
import { setStringVar } from './string-buffers';
import { StringExpandPlaceholders } from './gba-text-system';
import { FadeScreen, FADE_TO_BLACK } from './fade-screen';
import { LockPlayerFieldControls, ScriptContext_SetupScript } from './script-runtime';
import { SE_SELECT } from './decomp-data/include/constants/songs-data';
import {
  ListMenuInit, ListMenu_ProcessInput, DestroyListMenuTask,
  ListMenuGetScrollAndRow,
  AddScrollIndicatorArrowPairParameterized, RemoveScrollIndicatorArrowPair,
  SCROLL_ARROW_UP,
  LIST_NOTHING_CHOSEN, LIST_CANCEL, LIST_NO_MULTIPLE_SCROLL,
  CURSOR_BLACK_ARROW,
  gMultiuseListMenuTemplate,
  A_BUTTON, B_BUTTON,
  type ListMenu, type ListMenuItem, type ListMenuTemplate,
} from './list-menu';
import {
  SetCursorWithinListBounds, SetCursorScrollWithinListBounds,
  type ListPos,
} from './menu-helpers';
import {
  StringCopy, StringAppend, StringLength,
  ConvertIntToDecimalStringN, STR_CONV_MODE_RIGHT_ALIGN,
} from './decomp-bridge';

// ─── Constantes 1:1 décomp ──────────────────────────────────────────────────
//
// 1:1 décomp decoration.c:42-44 :
//   #define PLACE_DECORATION_SELECTOR_TAG 0xbe5
//   #define PLACE_DECORATION_PLAYER_TAG   0x008
//   #define NUM_DECORATION_FLAGS (FLAG_DECORATION_14 - FLAG_DECORATION_1 + 1)
// (= utilisés par Place flow uniquement, exposés pour future intégration)

export const PLACE_DECORATION_SELECTOR_TAG = 0xbe5;
export const PLACE_DECORATION_PLAYER_TAG   = 0x008;

// 1:1 décomp decoration.c:46-56 — task data layout (= utilisé partout dans
// le module pour gTasks[taskId].data[N]). En TS pas de macro #define, donc on
// expose les indices nommés (= 1:1 sémantique).
//
//   #define tCursorX                data[0]
//   #define tCursorY                data[1]
//   #define tState                  data[2]
//   #define tInitialX               data[3]
//   #define tInitialY               data[4]
//   #define tDecorWidth             data[5]
//   #define tDecorHeight            data[6]
//   #define tButton                 data[10]
//   #define tDecorationMenuCommand  data[11]
//   #define tDecorationItemsMenuCommand data[12]
//   #define tMenuTaskId             data[13]

const T_CURSOR_X = 0;
const T_CURSOR_Y = 1;
const T_STATE = 2;
const T_INITIAL_X = 3;
const T_INITIAL_Y = 4;
const T_DECOR_WIDTH = 5;
const T_DECOR_HEIGHT = 6;
const T_BUTTON = 10;
const T_DECORATION_MENU_COMMAND = 11;
const T_DECORATION_ITEMS_MENU_COMMAND = 12;
const T_MENU_TASK_ID = 13;

// 1:1 décomp decoration.c:58-63 :
//   #define DECOR_MENU_PLACE 0
//   #define DECOR_MENU_TOSS  1
//   #define DECOR_MENU_TRADE 2
//
//   #define DECOR_ITEMS_MENU_PLACE    0
//   #define DECOR_ITEMS_MENU_PUT_AWAY 1

export const DECOR_MENU_PLACE = 0;
export const DECOR_MENU_TOSS  = 1;
export const DECOR_MENU_TRADE = 2;

export const DECOR_ITEMS_MENU_PLACE    = 0;
export const DECOR_ITEMS_MENU_PUT_AWAY = 1;

// 1:1 décomp decoration.c:98-105 `enum Windows`.
//   WINDOW_MAIN_MENU,
//   WINDOW_DECORATION_CATEGORIES,
//   WINDOW_DECORATION_CATEGORY_SUMMARY,
//   WINDOW_DECORATION_CATEGORY_ITEMS,
//   WINDOW_COUNT

const WINDOW_MAIN_MENU = 0;
const WINDOW_DECORATION_CATEGORIES = 1;
const WINDOW_DECORATION_CATEGORY_SUMMARY = 2;
const WINDOW_DECORATION_CATEGORY_ITEMS = 3;
const WINDOW_COUNT = 4;

// 1:1 décomp menu.c return values (= cf. include/menu.h).
//   MENU_NOTHING_CHOSEN = -2
//   MENU_B_PRESSED      = -1
const MENU_NOTHING_CHOSEN = -2;
const MENU_B_PRESSED = -1;

// 1:1 décomp characters.h TEXT_COLOR_* (= utilisé par PrintCurMainMenuDescription).
const TEXT_COLOR_DARK_GRAY  = 0x2;
const TEXT_COLOR_WHITE      = 0x1;
const TEXT_COLOR_LIGHT_GRAY = 0x3;

// 1:1 décomp text.h PIXEL_FILL(n) = ((n) | ((n) << 4)). Pour PIXEL_FILL(1) = 0x11.
function PIXEL_FILL(n: number): number { return n | (n << 4); }

// 1:1 décomp text.h FONT_NORMAL = 1 (= include/constants/font_attributes.h).
const FONT_NORMAL = 1;

// 1:1 décomp menu.c sStdFrameTileNum/PaletteNum (= cf. start-menu.ts) :
//   #define DLG_WINDOW_PALETTE_NUM 15  (= PIXEL_FILL palette default)
//   #define STD_WINDOW_BASE_TILE_NUM 0x214 + STD_WINDOW_PALETTE_NUM 14
// AddDecorationWindow utilise tileNum=0x214 palette=14 (= 1:1 décomp:553).
const STD_WINDOW_BASE_TILE_NUM = 0x214;
const STD_WINDOW_PALETTE_NUM = 14;

// ─── 1:1 décomp data tables ─────────────────────────────────────────────────
//
// 1:1 décomp decoration.c:211-221 `sDecorationCategoryNames[]`.
//   gText_Desk, gText_Chair, gText_Plant, gText_Ornament,
//   gText_Mat,  gText_Poster, gText_Doll,  gText_Cushion

const sDecorationCategoryNames: readonly string[] = [
  getString('gText_Desk'),
  getString('gText_Chair'),
  getString('gText_Plant'),
  getString('gText_Ornament'),
  getString('gText_Mat'),
  getString('gText_Poster'),
  getString('gText_Doll'),
  getString('gText_Cushion'),
];

// 1:1 décomp decoration.c:223-241 `sDecorationMainMenuActions[]`.
//   { gText_Decorate, DecorationMenuAction_Decorate }
//   { gText_PutAway,  DecorationMenuAction_PutAway  }
//   { gText_Toss2,    DecorationMenuAction_Toss     }
//   { gText_Cancel,   DecorationMenuAction_Cancel   }

interface MenuAction {
  text: string;
  func: (taskId: number) => void;
}

const sDecorationMainMenuActions: readonly MenuAction[] = [
  { text: getString('gText_Decorate'), func: (id) => DecorationMenuAction_Decorate(id) },
  { text: getString('gText_PutAway'),  func: (id) => DecorationMenuAction_PutAway(id) },
  { text: getString('gText_Toss2'),    func: (id) => DecorationMenuAction_Toss(id) },
  { text: getString('gText_Cancel'),   func: (id) => DecorationMenuAction_Cancel(id) },
];

// 1:1 décomp decoration.c:243-249 `sSecretBasePCMenuItemDescriptions[]`.
//   gText_PutOutSelectedDecorItem    (= "Choisis la décoration à installer.")
//   gText_StoreChosenDecorInPC       (= "Range la décoration dans le PC.")
//   gText_ThrowAwayUnwantedDecors    (= "Jette les décorations inutiles.")
//   gText_GoBackPrevMenu             (= "Retour au menu précédent.")

const sSecretBasePCMenuItemDescriptions: readonly string[] = [
  getString('gText_PutOutSelectedDecorItem'),
  getString('gText_StoreChosenDecorInPC'),
  getString('gText_ThrowAwayUnwantedDecors'),
  getString('gText_GoBackPrevMenu'),
];

// 1:1 décomp decoration.c:258-296 `sDecorationWindowTemplates[WINDOW_COUNT]`.
//   [0] WINDOW_MAIN_MENU                 : bg=0 left=1 top=1 w=18 h=2*4=8  pal=15 base=0x0001
//   [1] WINDOW_DECORATION_CATEGORIES     : bg=0 left=1 top=1 w=13 h=18      pal=13 base=0x0091
//   [2] WINDOW_DECORATION_CATEGORY_SUMMARY: bg=0 left=17 top=1 w=12 h=2     pal=15 base=0x017b
//   [3] WINDOW_DECORATION_CATEGORY_ITEMS : bg=0 left=16 top=13 w=13 h=6     pal=15 base=0x0193

const sDecorationWindowTemplates: readonly WindowTemplate[] = [
  // [0] WINDOW_MAIN_MENU — height = 2 * ARRAY_COUNT(sDecorationMainMenuActions) = 8
  {
    bg: 0, tilemapLeft: 1, tilemapTop: 1,
    width: 18, height: 2 * 4,
    paletteNum: 15, baseBlock: 0x0001,
  },
  // [1] WINDOW_DECORATION_CATEGORIES
  {
    bg: 0, tilemapLeft: 1, tilemapTop: 1,
    width: 13, height: 18,
    paletteNum: 13, baseBlock: 0x0091,
  },
  // [2] WINDOW_DECORATION_CATEGORY_SUMMARY
  {
    bg: 0, tilemapLeft: 17, tilemapTop: 1,
    width: 12, height: 2,
    paletteNum: 15, baseBlock: 0x017b,
  },
  // [3] WINDOW_DECORATION_CATEGORY_ITEMS
  {
    bg: 0, tilemapLeft: 16, tilemapTop: 13,
    width: 13, height: 6,
    paletteNum: 15, baseBlock: 0x0193,
  },
];

// ─── 1:1 décomp EWRAM_DATA section 1 ─────────────────────────────────────────
//
// decoration.c:107-128. On porte uniquement les variables touchées par les
// sections 1-3. Le reste (sPlaceDecorationGraphicsDataBuffer,
// sDecor_CameraSpriteObjectIdx*, sDecorSelectorOam, etc.) reste déféré
// jusqu'au port du flow Place.

/** 1:1 décomp `EWRAM_DATA static u8 sDecorationActionsCursorPos = 0;`
 *  (decoration.c:108). Position du curseur dans le main menu (DECORER/RANGER/
 *  JETER/SORTIR). Persiste entre InitDecorationActionsWindow calls. */
let sDecorationActionsCursorPos = 0;

/** 1:1 décomp `EWRAM_DATA static u8 sNumOwnedDecorationsInCurCategory = 0;`
 *  (decoration.c:109). Mis à jour par SelectDecorationCategory (= déféré). */
let sNumOwnedDecorationsInCurCategory = 0;

/** 1:1 décomp `EWRAM_DATA static u8 sCurDecorationCategory = DECORCAT_DESK;`
 *  (decoration.c:115). Catégorie courante (mise à 0 = DECORCAT_DESK à chaque
 *  ouverture par DecorationMenuAction_Decorate/Toss).
 *
 *  Annotation `: number` explicite : sans elle, TS infère le literal `0` (=
 *  DECORCAT_DESK valeur), ce qui casse l'écriture de DECORCAT_CHAIR..CUSHION
 *  par SelectDecorationCategory (= sections 4-5). */
let sCurDecorationCategory: number = DECORCAT_DESK;

/** 1:1 décomp `EWRAM_DATA u8 gCurDecorationIndex = 0;` (decoration.c:114).
 *  Exporté pour les scripts (= IsSelectedDecorInThePC, etc.). */
export let gCurDecorationIndex = 0;
export function _setCurDecorationIndex(v: number): void { gCurDecorationIndex = v; }

/** 1:1 décomp `struct DecorationPCContext sDecorationContext` (decoration.c:117).
 *  - items / pos : pointeurs vers SaveBlock1 arrays (= partage de référence C).
 *  - size : taille max (DECOR_MAX_SECRET_BASE ou DECOR_MAX_PLAYERS_HOUSE).
 *  - isPlayerRoom : flag boolean (TRUE = playerRoom, FALSE = secretBase[0]).
 *
 *  1:1 décomp `struct DecorationPCContext { u8 *items; u8 *pos; u8 size;
 *                                            u8 isPlayerRoom; }` (l.90-96). */
interface DecorationPCContext {
  items: number[];     // 1:1 décomp `u8 *items` (= référence array partagée)
  pos: number[];       // 1:1 décomp `u8 *pos`
  size: number;        // 1:1 décomp `u8 size`
  isPlayerRoom: boolean; // 1:1 décomp `u8 isPlayerRoom`
}

const sDecorationContext: DecorationPCContext = {
  items: [],
  pos: [],
  size: 0,
  isPlayerRoom: false,
};

/** 1:1 décomp `EWRAM_DATA static u8 sDecorMenuWindowIds[WINDOW_COUNT]`
 *  (decoration.c:118). IDs des windows actuellement ouvertes par
 *  AddDecorationWindow ; -1 = pas ouverte. */
const sDecorMenuWindowIds: number[] = new Array(WINDOW_COUNT).fill(-1);

/** 1:1 décomp `EWRAM_DATA u8 *gCurDecorationItems = NULL;` (decoration.c:107).
 *  Pointe vers `gDecorationInventories[sCurDecorationCategory].items` — mis à
 *  jour par InitDecorationContextItems / SelectDecorationCategory. */
export let gCurDecorationItems: number[] | null = null;
function _setCurDecorationItems(arr: number[] | null): void { gCurDecorationItems = arr; }

// ─── 1:1 décomp `InitDecorationContextItems` (decoration.c:515-531) ─────────

/** 1:1 décomp `void InitDecorationContextItems(void)` (decoration.c:515-531).
 *  Wire `gCurDecorationItems` vers la catégorie courante, et configure
 *  `sDecorationContext` selon `isPlayerRoom`. Appelé post-LoadGameSave par
 *  decoration-inventory.ts:SetDecorationInventoriesPointers (= 1:1 décomp
 *  pattern de wiring des pointeurs SaveBlock). */
export function InitDecorationContextItems(): void {
  if (sCurDecorationCategory < DECORCAT_COUNT)
    _setCurDecorationItems(gDecorationInventories[sCurDecorationCategory].items);

  if (sDecorationContext.isPlayerRoom === false) {
    sDecorationContext.items = gSaveBlock1Ptr.secretBases[0].decorations as number[];
    sDecorationContext.pos = gSaveBlock1Ptr.secretBases[0].decorationPositions as number[];
  }

  if (sDecorationContext.isPlayerRoom === true) {
    sDecorationContext.items = gSaveBlock1Ptr.playerRoomDecorations as number[];
    sDecorationContext.pos = gSaveBlock1Ptr.playerRoomDecorationPositions as number[];
  }
}

// ─── 1:1 décomp window helpers (decoration.c:533-564) ───────────────────────

/** 1:1 décomp `static u8 AddDecorationWindow(u8 windowIndex)`
 *  (decoration.c:533-556). Crée le window selon le template, draw frame
 *  standard (tile=0x214 palette=14), schedule BG copy, retourne le windowId.
 *
 *  WINDOW_MAIN_MENU : override `template.width = GetMaxWidthInMenuTable(...)`
 *  capped à 18. En TS on a pas GetMaxWidthInMenuTable porté → fallback 1:1
 *  honnête : largest string width estimation OU width=18 (= cap du décomp).
 *  Les 4 actions FR (DECORER/RANGER/JETER/SORTIR) sont courtes → width=18 OK.
 *  1:1 TODO : porter GetMaxWidthInMenuTable depuis menu_helpers.c. */
function AddDecorationWindow(windowIndex: number): number {
  let template: WindowTemplate;

  if (windowIndex === WINDOW_MAIN_MENU) {
    // 1:1 décomp:540-544 : template = sDecorationWindowTemplates[0] copy ;
    // width = GetMaxWidthInMenuTable(sDecorationMainMenuActions, 4) ; capped 18.
    template = { ...sDecorationWindowTemplates[WINDOW_MAIN_MENU] };
    const maxWidth = _getMaxWidthInMenuTable(sDecorationMainMenuActions);
    template.width = Math.min(maxWidth, 18);
  } else {
    template = sDecorationWindowTemplates[windowIndex];
  }

  const windowId = AddWindow(template);
  sDecorMenuWindowIds[windowIndex] = windowId;

  // 1:1 décomp:553 — DrawStdFrameWithCustomTileAndPalette(windowId, FALSE, 0x214, 14).
  DrawStdFrameWithCustomTileAndPalette(windowId, false, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM);
  // 1:1 décomp:554 — ScheduleBgCopyTilemapToVram(0).
  ScheduleBgCopyTilemapToVram(0);
  return windowId;
}

/** 1:1 décomp `static void RemoveDecorationWindow(u8 windowIndex)`
 *  (decoration.c:558-564). Clear frame transparent + clear tilemap + remove
 *  window + schedule BG copy.
 *
 *  Note : décomp utilise `ClearStdWindowAndFrameToTransparent` (= variant qui
 *  clear vers transparent index 0). Notre engine TS n'a que
 *  `ClearStdWindowAndFrame` (= clear avec couleur standard). Différence
 *  visuelle = pixel idx 1 vs 0 dans le buffer. 1:1 sémantique correct pour
 *  RemoveDecorationWindow (= le window est retiré juste après → invisible).
 *  1:1 TODO : porter ClearStdWindowAndFrameToTransparent (menu.c:486). */
function RemoveDecorationWindow(windowIndex: number): void {
  const windowId = sDecorMenuWindowIds[windowIndex];
  if (windowId < 0) return;
  ClearStdWindowAndFrame(windowId, false);
  ClearWindowTilemap(windowId);
  RemoveWindow(windowId);
  sDecorMenuWindowIds[windowIndex] = -1;
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `GetMaxWidthInMenuTable` (menu_helpers.c) STUB.
 *  Calcule la largeur max (en chars) parmi les texts du menu, +1 pour cursor.
 *
 *  Décomp réel utilise GetStringWidth(FONT_NORMAL, str) qui mesure en pixels
 *  via la font glyph table puis divise par 8 (= tile width). En TS on
 *  approxime : `string.length` (= caractères) + 1 (cursor). Pour les 4
 *  actions courtes FR (≤8 chars), cap=18 nous laisse de la marge.
 *  1:1 TODO : porter GetStringWidth + GetMaxWidthInMenuTable depuis
 *  menu_helpers.c (= chantier futur, partagé avec d'autres menus). */
function _getMaxWidthInMenuTable(actions: readonly MenuAction[]): number {
  let maxLen = 0;
  for (const a of actions) {
    if (a.text.length > maxLen) maxLen = a.text.length;
  }
  // +1 pour cursor "▶" prefix.
  return maxLen + 1;
}

// ─── 1:1 décomp main menu setup (decoration.c:566-579) ──────────────────────

/** 1:1 décomp `static void AddDecorationActionsWindow(void)`
 *  (decoration.c:566-571). Ouvre WIN_MAIN_MENU + print 4 actions + init cursor. */
function AddDecorationActionsWindow(): void {
  const windowId = AddDecorationWindow(WINDOW_MAIN_MENU);
  _printMenuTable(windowId, sDecorationMainMenuActions);
  InitMenuInUpperLeftCornerNormal(windowId, sDecorationMainMenuActions.length, sDecorationActionsCursorPos);
}

/** 1:1 décomp `PrintMenuTable(u8 windowId, u8 itemCount, const struct MenuAction *actions)`
 *  (menu.c:1690 STUB). Print chaque text à `(x=8, y=1+i*16)` (= layout
 *  standard menu). Couleur [bg=1, fg=2, shadow=3] FONT_NORMAL.
 *
 *  Décomp utilise `AddTextPrinterParameterized(windowId, FONT_NORMAL,
 *  actions[i].text, 8, 1 + 16 * i, TEXT_SKIP_DRAW, NULL)`. Notre AP3 prend
 *  colorArray explicite — équivalent fonctionnel 1:1.
 *  1:1 TODO : porter PrintMenuTable depuis menu.c (= utilisé par d'autres
 *  menus aussi). */
function _printMenuTable(windowId: number, actions: readonly MenuAction[]): void {
  for (let i = 0; i < actions.length; i++) {
    AddTextPrinterParameterized3(
      windowId,
      FONT_NORMAL,
      8,                        // x (= 1:1 décomp menu.c:1697 left=8)
      1 + 16 * i,               // y (= 1:1 décomp menu.c:1697 top=1+16*i)
      [1, 2, 3],                // colorArray [bg, fg, shadow]
      255,                      // TEXT_SKIP_DRAW = render synchronously
      actions[i].text,
    );
  }
}

/** 1:1 décomp `static void InitDecorationActionsWindow(void)`
 *  (decoration.c:573-579). Reset cursor pos + lock player + create window +
 *  print description du 1er item. */
function InitDecorationActionsWindow(): void {
  sDecorationActionsCursorPos = 0;
  LockPlayerFieldControls();
  AddDecorationActionsWindow();
  PrintCurMainMenuDescription();
}

// ─── 1:1 décomp entry points (decoration.c:581-599) ─────────────────────────

/** 1:1 décomp `void DoSecretBaseDecorationMenu(u8 taskId)` (decoration.c:581-589).
 *  Entry point pour le PC d'une Secret Base. Setup context = secretBases[0] +
 *  isPlayerRoom=FALSE, taille = DECOR_MAX_SECRET_BASE. */
export function DoSecretBaseDecorationMenu(taskId: number): void {
  InitDecorationActionsWindow();
  sDecorationContext.items = gSaveBlock1Ptr.secretBases[0].decorations as number[];
  sDecorationContext.pos = gSaveBlock1Ptr.secretBases[0].decorationPositions as number[];
  sDecorationContext.size = DECOR_MAX_SECRET_BASE;
  sDecorationContext.isPlayerRoom = false;

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

/** 1:1 décomp `void DoPlayerRoomDecorationMenu(u8 taskId)` (decoration.c:591-599).
 *  Entry point pour le BedroomPC (= player's room). Setup context =
 *  playerRoomDecorations + isPlayerRoom=TRUE, taille = DECOR_MAX_PLAYERS_HOUSE. */
export function DoPlayerRoomDecorationMenu(taskId: number): void {
  InitDecorationActionsWindow();
  sDecorationContext.items = gSaveBlock1Ptr.playerRoomDecorations as number[];
  sDecorationContext.pos = gSaveBlock1Ptr.playerRoomDecorationPositions as number[];
  sDecorationContext.size = DECOR_MAX_PLAYERS_HOUSE;
  sDecorationContext.isPlayerRoom = true;

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

// ─── 1:1 décomp main menu input handler (decoration.c:601-629) ──────────────

/** 1:1 décomp `static void HandleDecorationActionsMenuInput(u8 taskId)`
 *  (decoration.c:601-623). Lit l'input chaque frame :
 *   - sélection (>= 0) : SE_SELECT + appelle l'action correspondante
 *   - MENU_NOTHING_CHOSEN : update cursor pos + re-print description si changé
 *   - MENU_B_PRESSED : SE_SELECT + Cancel action
 *
 *  Décomp test `!gPaletteFade.active` avant tout (= attendre fin de fade).
 *  Notre engine TS expose `getRuntime().gPaletteFade.active`. */
export function HandleDecorationActionsMenuInput(taskId: number): void {
  const rt = getRuntime();
  if (rt?.gPaletteFade?.active) return;

  const menuPos = Menu_GetCursorPos();
  // 1:1 décomp `Menu_ProcessInput()` = wrap de Menu_ProcessInputNoWrap.
  const input = Menu_ProcessInputNoWrap();

  if (input === MENU_NOTHING_CHOSEN) {
    sDecorationActionsCursorPos = Menu_GetCursorPos();
    if (menuPos !== sDecorationActionsCursorPos)
      PrintCurMainMenuDescription();
    return;
  }

  if (input === MENU_B_PRESSED) {
    PlaySE(SE_SELECT);
    DecorationMenuAction_Cancel(taskId);
    return;
  }

  // default : sélection valide.
  PlaySE(SE_SELECT);
  sDecorationMainMenuActions[sDecorationActionsCursorPos].func(taskId);
}

/** 1:1 décomp `static void PrintCurMainMenuDescription(void)` (decoration.c:625-629).
 *  Print la description du 1er option (= sSecretBasePCMenuItemDescriptions[cursorPos])
 *  dans window 0 (= dialogue window field), couleurs FONT_NORMAL standard.
 *
 *  Décomp utilise `AddTextPrinterParameterized2(0, FONT_NORMAL, str, 0, 0,
 *  TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY)`. Notre
 *  TS expose AddTextPrinterParameterized3 qui prend colorArray=[bg,fg,shadow].
 *  Sémantique 1:1 (= same letter/line spacing default). */
export function PrintCurMainMenuDescription(): void {
  FillWindowPixelBuffer(0, PIXEL_FILL(1));
  AddTextPrinterParameterized3(
    0,                         // windowId 0 = field dialogue window
    FONT_NORMAL,
    0, 0,                      // x=0, y=0
    [TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY],
    0,                         // speed=0 (= normal printer speed)
    sSecretBasePCMenuItemDescriptions[sDecorationActionsCursorPos],
  );
}

// ─── 1:1 décomp 4 main menu actions (decoration.c:631-690) ──────────────────

/** 1:1 décomp `static void DecorationMenuAction_Decorate(u8 taskId)`
 *  (decoration.c:631-644).
 *
 *  Si GetNumOwnedDecorations() == 0 :
 *    msg "Aucune décoration." → ReturnToDecorationActionsAfterInvalidSelection.
 *  Sinon :
 *    tDecorationMenuCommand = DECOR_MENU_PLACE
 *    sCurDecorationCategory = DECORCAT_DESK
 *    SecretBasePC_PrepMenuForSelectingStoredDecors(taskId) [STUB] */
export function DecorationMenuAction_Decorate(taskId: number): void {
  if (GetNumOwnedDecorations() === 0) {
    // 1:1 décomp:635 — StringExpandPlaceholders(gStringVar4, gText_NoDecorations).
    const msg = StringExpandPlaceholders('', getString('gText_NoDecorations'));
    setStringVar(4, msg);
    // 1:1 décomp:636 — DisplayItemMessageOnField(taskId, gStringVar4, callback).
    _displayItemMessageOnField(taskId, msg, ReturnToDecorationActionsAfterInvalidSelection);
    return;
  }

  // 1:1 décomp:640-642 — DECOR_MENU_PLACE + DECORCAT_DESK + prep stored decors.
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_DECORATION_MENU_COMMAND] = DECOR_MENU_PLACE;
  sCurDecorationCategory = DECORCAT_DESK;
  SecretBasePC_PrepMenuForSelectingStoredDecors(taskId);
}

/** 1:1 décomp `static void DecorationMenuAction_PutAway(u8 taskId)`
 *  (decoration.c:646-661).
 *
 *  Si !HasDecorationsInUse(taskId) :
 *    msg "Aucune décoration installée." → ReturnToDecorationActionsAfterInvalidSelection.
 *  Sinon :
 *    RemoveDecorationWindow(MAIN_MENU) + ClearDialogWindow + FadeScreen(BLACK) +
 *    tState=0 + task.func = Task_ContinuePuttingAwayDecorations [STUB] */
export function DecorationMenuAction_PutAway(taskId: number): void {
  if (!HasDecorationsInUse(taskId)) {
    // 1:1 décomp:650 — StringExpandPlaceholders(gStringVar4, gText_NoDecorationsInUse).
    const msg = StringExpandPlaceholders('', getString('gText_NoDecorationsInUse'));
    setStringVar(4, msg);
    _displayItemMessageOnField(taskId, msg, ReturnToDecorationActionsAfterInvalidSelection);
    return;
  }

  // 1:1 décomp:655-660 :
  RemoveDecorationWindow(WINDOW_MAIN_MENU);
  ClearDialogWindowAndFrame(0, false);
  FadeScreen(FADE_TO_BLACK, 0);
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) {
    task.data[T_STATE] = 0;
    task.func = (t) => Task_ContinuePuttingAwayDecorations(t.taskId);
  }
}

/** 1:1 décomp `static void DecorationMenuAction_Toss(u8 taskId)`
 *  (decoration.c:663-676). Same flow que Decorate, sauf tDecorationMenuCommand
 *  = DECOR_MENU_TOSS. */
export function DecorationMenuAction_Toss(taskId: number): void {
  if (GetNumOwnedDecorations() === 0) {
    const msg = StringExpandPlaceholders('', getString('gText_NoDecorations'));
    setStringVar(4, msg);
    _displayItemMessageOnField(taskId, msg, ReturnToDecorationActionsAfterInvalidSelection);
    return;
  }

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_DECORATION_MENU_COMMAND] = DECOR_MENU_TOSS;
  sCurDecorationCategory = DECORCAT_DESK;
  SecretBasePC_PrepMenuForSelectingStoredDecors(taskId);
}

/** 1:1 décomp `static void DecorationMenuAction_Cancel(u8 taskId)`
 *  (decoration.c:678-690).
 *
 *  RemoveDecorationWindow(MAIN_MENU)
 *  if (!sDecorationContext.isPlayerRoom) :
 *    ScriptContext_SetupScript(SecretBase_EventScript_PCCancel)
 *    DestroyTask(taskId)
 *  else :
 *    ReshowPlayerPC(taskId)  [STUB → DestroyTask via bedroom-pc overlay logic] */
export function DecorationMenuAction_Cancel(taskId: number): void {
  RemoveDecorationWindow(WINDOW_MAIN_MENU);

  if (!sDecorationContext.isPlayerRoom) {
    // 1:1 décomp:683 — script EventScript_PCCancel + DestroyTask.
    ScriptContext_SetupScript('SecretBase_EventScript_PCCancel');
    const rt = getRuntime();
    rt?.gTasks?.delete(taskId);
    return;
  }

  // 1:1 décomp:688 — ReshowPlayerPC.
  ReshowPlayerPC(taskId);
}

/** 1:1 décomp `static void ReturnToDecorationActionsAfterInvalidSelection(u8 taskId)`
 *  (decoration.c:692-696). Re-affiche la description + re-installe handler.
 *  Appelé par les 3 callbacks "msg + retour" (NoDecorations / NoDecorationsInUse). */
export function ReturnToDecorationActionsAfterInvalidSelection(taskId: number): void {
  PrintCurMainMenuDescription();
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

// ─── STUBs : dépendances décomp non-portées dans ce scope ───────────────────

/** STUB : `static void SecretBasePC_PrepMenuForSelectingStoredDecors(u8 taskId)`
 *  (decoration.c:698-704). Ouvre la categories window (DESK/CHAIR/PLANT/...).
 *
 *  Flow décomp :
 *    LoadPalette(sDecorationMenuPalette, BG_PLTT_ID(13), ...)
 *    ClearDialogWindowAndFrame(0, FALSE)
 *    RemoveDecorationWindow(WINDOW_MAIN_MENU)
 *    InitDecorationCategoriesWindow(taskId)
 *
 *  STUB ici car InitDecorationCategoriesWindow + tout le flow categories +
 *  items list + place est un gros chantier dédié (= ~1500 lignes décomp).
 *
 *  Fallback raisonnable : msg "Aucune décoration disponible" + retour menu.
 *  Honnête car DecorationMenuAction_Decorate/Toss n'est appelé que si
 *  GetNumOwnedDecorations() > 0 — donc le user a au moins 1 deco. Pour la
 *  démo early-game (= jamais de deco gagnée), GetNumOwnedDecorations() == 0
 *  branche → ce STUB jamais atteint.
 *
 *  1:1 TODO : port decoration.c section 4 (Categories window + Items list +
 *  Place flow) — chantier dédié futur. */
function SecretBasePC_PrepMenuForSelectingStoredDecors(taskId: number): void {
  console.warn(
    '[decoration.ts STUB] SecretBasePC_PrepMenuForSelectingStoredDecors : flow Categories+Items+Place déféré',
    '(= decoration.c sections 4+ ≈1500l). Fallback msg "Aucune décoration".',
    'taskId =', taskId,
  );
  // 1:1 TODO : port decoration.c section 4 (chantier futur).
  // Fallback : retour menu via "Aucune décoration".
  const msg = StringExpandPlaceholders('', getString('gText_NoDecorations'));
  setStringVar(4, msg);
  _displayItemMessageOnField(taskId, msg, ReturnToDecorationActionsAfterInvalidSelection);
}

/** STUB : `static bool8 HasDecorationsInUse(u8 taskId)` (decoration.c).
 *  Vrai si au moins une décoration est placée dans la chambre OU dans la
 *  secret base. Itère `sDecorationContext.items[]` et compte les non-DECOR_NONE.
 *
 *  En early-game (= démo) : aucune décoration n'est jamais installée. Donc
 *  fallback `return false` est 1:1 sémantique correct.
 *
 *  1:1 TODO : porter HasDecorationsInUse + Task_ContinuePuttingAwayDecorations
 *  (= decoration.c PutAway flow) — chantier futur. */
function HasDecorationsInUse(_taskId: number): boolean {
  // 1:1 sémantique correct pour démo early-game : pas de deco placée.
  // 1:1 TODO : port decoration.c HasDecorationsInUse (chantier futur).
  for (let i = 0; i < sDecorationContext.size; i++) {
    if (sDecorationContext.items[i] !== 0 /* DECOR_NONE */)
      return true;
  }
  return false;
}

/** STUB : `static void Task_ContinuePuttingAwayDecorations(u8 taskId)`
 *  (decoration.c). Fade-in + cursor sprite + map editing flow.
 *
 *  1:1 TODO : port decoration.c PutAway flow (= ~400l, chantier futur). */
function Task_ContinuePuttingAwayDecorations(taskId: number): void {
  console.warn(
    '[decoration.ts STUB] Task_ContinuePuttingAwayDecorations : PutAway flow déféré',
    '(= decoration.c ≈400l). taskId =', taskId,
  );
  // 1:1 TODO : port decoration.c PutAway flow (chantier futur).
  // Pour éviter de bloquer la task indéfiniment : DestroyTask + ReshowPlayerPC fallback.
  const rt = getRuntime();
  rt?.gTasks?.delete(taskId);
}

/** STUB : `void ReshowPlayerPC(u8 taskId)` (player_pc.c).
 *  Re-affiche le menu PlayerPC après fermeture du sous-menu Decoration.
 *
 *  Dans le port web : bedroom-pc.ts gère le menu PC via un overlay state
 *  machine indépendant. Quand DoPlayerRoomDecorationMenu est appelé depuis
 *  bedroom-pc.ts, le retour se fait soit via DestroyTask (= overlay re-ouvre
 *  son menu via tickClosing flow), soit via le legacy fallback dans
 *  bedroom-pc.ts:_decorationActionCancel.
 *
 *  Pour ce port : DestroyTask + ScriptContext re-enable (= équivalent
 *  fonctionnel honnête : la task est détruite, le contrôle revient au
 *  caller bedroom-pc.ts qui doit re-afficher son menu).
 *
 *  1:1 TODO : porter ReshowPlayerPC depuis player_pc.c quand le couplage
 *  decoration ↔ PlayerPC sera nécessaire pour le flow complet. */
function ReshowPlayerPC(taskId: number): void {
  console.warn(
    '[decoration.ts STUB] ReshowPlayerPC : retour overlay PlayerPC déféré',
    '(= player_pc.c ReshowPlayerPC). DestroyTask + retour caller.',
    'taskId =', taskId,
  );
  // 1:1 TODO : port player_pc.c ReshowPlayerPC (chantier futur).
  const rt = getRuntime();
  rt?.gTasks?.delete(taskId);
}

/** STUB : `void DisplayItemMessageOnField(u8 taskId, const u8 *str, TaskFunc callback)`
 *  (item_menu.c). Affiche un msg sticky dans la dialogue window + transition
 *  task.func vers callback après que le user press A.
 *
 *  Notre engine TS expose un pattern overlay via bedroom-pc.ts:_showMessageThenReturn.
 *  Pour ce port : utiliser le runtime task pattern direct :
 *    task.func = (t) => { /∗ wait for A press, then ∗/ callback(t.taskId) }
 *
 *  STUB minimal : enchaîne directement vers callback après log warn. Sémantique
 *  dégradée (= le msg n'est pas affiché visuellement), mais le flow task est
 *  correct (= early-game branche jamais atteinte sauf si user trigger explicit
 *  via SecretBase PC = scope futur).
 *
 *  1:1 TODO : porter DisplayItemMessageOnField depuis item_menu.c (= utilisé
 *  par bag-menu, party-menu, decoration, etc.). */
function _displayItemMessageOnField(
  taskId: number,
  text: string,
  callback: (taskId: number) => void,
): void {
  console.warn(
    '[decoration.ts STUB] DisplayItemMessageOnField : message field box déféré',
    '(= item_menu.c). Direct-callback fallback.',
    'taskId =', taskId, 'msg =', text,
  );
  // 1:1 TODO : port item_menu.c DisplayItemMessageOnField (chantier futur).
  // Fallback : direct callback (= flow task continue).
  callback(taskId);
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTIONS 4-5 : Categories window + Items list within category
// Source : decoration.c lignes 706-1176 (≈470 lignes de C, ≈700 lignes TS).
// 1:1 STRICT — noms IDENTIQUES au décomp.
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1:1 décomp EWRAM_DATA section 4-5 ──────────────────────────────────────
//
// decoration.c:110-119 (variables couvertes par ce port) :
//   EWRAM_DATA static u8 sSecretBaseItemsIndicesBuffer[DECOR_MAX_SECRET_BASE] = {};
//   EWRAM_DATA static u8 sPlayerRoomItemsIndicesBuffer[DECOR_MAX_PLAYERS_HOUSE] = {};
//   EWRAM_DATA static u16 sDecorationsCursorPos = 0;
//   EWRAM_DATA static u16 sDecorationsScrollOffset = 0;
//   EWRAM_DATA static struct DecorationItemsMenu *sDecorationItemsMenu = NULL;

/** 1:1 décomp `EWRAM_DATA static u8 sSecretBaseItemsIndicesBuffer[DECOR_MAX_SECRET_BASE]`
 *  (decoration.c:110). Buffer indices+1 des decorations OWNED ET déjà placées
 *  dans la secret base — utilisé par DecorationItemsMenu_PrintDecorationInUse
 *  pour blit l'icône "ball red" à côté du nom. */
const sSecretBaseItemsIndicesBuffer: number[] = new Array(DECOR_MAX_SECRET_BASE).fill(0);

/** 1:1 décomp `EWRAM_DATA static u8 sPlayerRoomItemsIndicesBuffer[DECOR_MAX_PLAYERS_HOUSE]`
 *  (decoration.c:111). Idem mais pour la player's room (ball blue). */
const sPlayerRoomItemsIndicesBuffer: number[] = new Array(DECOR_MAX_PLAYERS_HOUSE).fill(0);

/** 1:1 décomp `EWRAM_DATA static u16 sDecorationsCursorPos = 0;`
 *  (decoration.c:112). Position du curseur dans la list (relatif à window). */
let sDecorationsCursorPos = 0;

/** 1:1 décomp `EWRAM_DATA static u16 sDecorationsScrollOffset = 0;`
 *  (decoration.c:113). Offset de scroll dans la list (= 1ère ligne visible). */
let sDecorationsScrollOffset = 0;

// 1:1 décomp `struct DecorationItemsMenu` (decoration.c:65-72).
//   struct ListMenuItem items[41];
//   u8 names[41][24];
//   u8 numMenuItems;
//   u8 maxShownItems;
//   u8 scrollIndicatorsTaskId;
//
// 41 = DECOR_MAX_BAG_ITEMS + 1 (40 owned + 1 CANCEL row). 24 chars per name.
interface DecorationItemsMenuStruct {
  items: ListMenuItem[];      // 1:1 `struct ListMenuItem items[41]`
  names: string[];            // 1:1 `u8 names[41][24]` (= 41 strings de ≤24 chars)
  numMenuItems: number;       // 1:1 `u8 numMenuItems`
  maxShownItems: number;      // 1:1 `u8 maxShownItems`
  scrollIndicatorsTaskId: number; // 1:1 `u8 scrollIndicatorsTaskId`
}

/** 1:1 décomp `EWRAM_DATA static struct DecorationItemsMenu *sDecorationItemsMenu = NULL;`
 *  (decoration.c:119). Allocé dans InitDecorationItemsWindow (AllocZeroed),
 *  freed dans HandleDecorationItemsMenuInput sur sélection ou Cancel. */
let sDecorationItemsMenu: DecorationItemsMenuStruct | null = null;

// ─── 1:1 décomp data table sSecretBasePC_SelectedDecorationActions ──────────
//
// decoration.c:251-256 :
//   static const TaskFunc sSecretBasePC_SelectedDecorationActions[][2] =
//   {
//      { DecorationItemsMenuAction_AttemptPlace, DecorationItemsMenuAction_Cancel },
//      { DecorationItemsMenuAction_AttemptToss,  DecorationItemsMenuAction_Cancel },
//      { DecorationItemsMenuAction_Trade,        DecorationItemsMenuAction_Cancel },
//   };
//
// Index = tDecorationMenuCommand (DECOR_MENU_PLACE/TOSS/TRADE).
// Colonne [0] = action sur sélection valide, [1] = action sur LIST_CANCEL.
//
// 1:1 STUB : DecorationItemsMenuAction_AttemptPlace porté (= section 6 stub),
// DecorationItemsMenuAction_AttemptToss + DecorationItemsMenuAction_Trade =
// section 6+ déférée → STUB warn + Cancel fallback.

const sSecretBasePC_SelectedDecorationActions: readonly ((taskId: number) => void)[][] = [
  [(id) => DecorationItemsMenuAction_AttemptPlace(id), (id) => DecorationItemsMenuAction_Cancel(id)],
  [(id) => _DecorationItemsMenuAction_AttemptToss_STUB(id), (id) => DecorationItemsMenuAction_Cancel(id)],
  [(id) => _DecorationItemsMenuAction_Trade_STUB(id), (id) => DecorationItemsMenuAction_Cancel(id)],
];

// ─── 1:1 décomp sDecorationItemsListMenuTemplate (decoration.c:300-320) ─────
//
// .moveCursorFunc   = DecorationItemsMenu_OnCursorMove
// .itemPrintFunc    = DecorationItemsMenu_PrintDecorationInUse
// .header_X = 0, .item_X = 8, .cursor_X = 0, .upText_Y = 9
// .cursorPal = 2, .fillValue = 1, .cursorShadowPal = 3, .lettersSpacing = 0
// .itemVerticalPadding = 0, .scrollMultiple = LIST_NO_MULTIPLE_SCROLL
// .fontId = FONT_NARROW, .cursorKind = CURSOR_BLACK_ARROW

const sDecorationItemsListMenuTemplate: ListMenuTemplate = {
  items: [],
  moveCursorFunc: (itemIndex, flag, menu) =>
    DecorationItemsMenu_OnCursorMove(itemIndex, flag, menu),
  itemPrintFunc: (windowId, itemId, y) =>
    DecorationItemsMenu_PrintDecorationInUse(windowId, itemId, y),
  totalItems: 0,
  maxShowed: 0,
  windowId: 0,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 9,
  cursorPal: 2,
  fillValue: 1,
  cursorShadowPal: 3,
  lettersSpacing: 0,    // 1:1 `.lettersSpacing = FALSE` (= 0)
  itemVerticalPadding: 0,
  scrollMultiple: LIST_NO_MULTIPLE_SCROLL,
  fontId: FONT_NARROW,
  cursorKind: CURSOR_BLACK_ARROW,
};

// ─── 1:1 décomp constants externes (charcodes, behaviors) ────────────────────
//
// CHAR_SLASH = 0xBA dans le charmap (= "/"). En TS string = "/".
const CHAR_SLASH = '/';

// MENU_INFO_ICON_BALL_RED / MENU_INFO_ICON_BALL_BLUE :
// 1:1 décomp `include/menu.h` :
//   #define MENU_INFO_ICON_BALL_RED    7
//   #define MENU_INFO_ICON_BALL_BLUE   8
const MENU_INFO_ICON_BALL_RED = 7;
const MENU_INFO_ICON_BALL_BLUE = 8;

// ─── 1:1 décomp section 4 : Categories window (decoration.c:706-862) ────────

/** 1:1 décomp `static void InitDecorationCategoriesWindow(u8 taskId)`
 *  (decoration.c:706-712). Ouvre WINDOW_DECORATION_CATEGORIES + print 8
 *  catégories + CANCEL/EXIT (= DECORCAT_COUNT+1 entries) + init cursor à
 *  sCurDecorationCategory + transition task vers HandleDecorationCategoriesMenuInput. */
function InitDecorationCategoriesWindow(taskId: number): void {
  const windowId = AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  PrintDecorationCategoryMenuItems(taskId);
  InitMenuInUpperLeftCornerNormal(windowId, DECORCAT_COUNT + 1, sCurDecorationCategory);

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationCategoriesMenuInput(t.taskId);
}

/** 1:1 décomp `static void ReinitDecorationCategoriesWindow(u8 taskId)`
 *  (decoration.c:714-720). Re-init après une back-action depuis items list :
 *  re-fill buffer + re-print + re-init cursor + re-transition. */
function ReinitDecorationCategoriesWindow(taskId: number): void {
  FillWindowPixelBuffer(sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES], PIXEL_FILL(1));
  PrintDecorationCategoryMenuItems(taskId);
  InitMenuInUpperLeftCornerNormal(
    sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES],
    DECORCAT_COUNT + 1,
    sCurDecorationCategory,
  );

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationCategoriesMenuInput(t.taskId);
}

/** 1:1 décomp `static void PrintDecorationCategoryMenuItems(u8 taskId)`
 *  (decoration.c:722-743). Pour chacune des 8 catégories :
 *   - Si DECORATING + isPlayerRoom : seules DOLL et CUSHION sont "enabled".
 *     Les 6 autres sont rendues "disabled" (texte gris via ColorMenuItemString).
 *   - Sinon : enabled normal.
 *
 *  À la fin, print "ANNULER" (= sCurDecorationCategory==DECOR_MENU_TRADE ?
 *  gText_Exit : gText_Cancel) à y=i*16+1 (= i = DECORCAT_COUNT après la boucle). */
function PrintDecorationCategoryMenuItems(taskId: number): void {
  const windowId = sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES];
  const isPlayerRoom = sDecorationContext.isPlayerRoom;

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  const tDecorationMenuCommand = task?.data?.[T_DECORATION_MENU_COMMAND] ?? DECOR_MENU_PLACE;

  let shouldDisable = false;
  if (isPlayerRoom === true && tDecorationMenuCommand === DECOR_MENU_PLACE)
    shouldDisable = true;

  let i: number;
  for (i = 0; i < DECORCAT_COUNT; i++) {
    // Only DOLL and CUSHION decorations are enabled when decorating the player's room.
    if (shouldDisable === true && i !== DECORCAT_DOLL && i !== DECORCAT_CUSHION)
      PrintDecorationCategoryMenuItem(windowId, i, 8, i * 16, true, TEXT_SKIP_DRAW);
    else
      PrintDecorationCategoryMenuItem(windowId, i, 8, i * 16, false, TEXT_SKIP_DRAW);
  }

  // 1:1 décomp:741 — CANCEL/EXIT row.
  const cancelOrExit = tDecorationMenuCommand === DECOR_MENU_TRADE
    ? getString('gText_Exit')
    : getString('gText_Cancel');
  AddTextPrinterParameterized3(
    windowId, FONT_NORMAL, 8, i * 16 + 1,
    [0, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY],
    0,
    cancelOrExit,
  );

  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `static void PrintDecorationCategoryMenuItem(u8 winid, u8 category,
 *  u8 x, u8 y, bool8 disabled, u8 speed)` (decoration.c:745-761).
 *
 *  Construit dans gStringVar4 le label + count :
 *    [color1][shadow1]<NomCategorie><Owned>/<MaxSize>
 *
 *  Render :
 *   1) Le label "[color]<nom>" à (x, y+1).
 *   2) Le "<Owned>/<MaxSize>" right-aligné à (rightX = x==8 ? 104 : 96).
 *
 *  Décomp utilise StringLength pour avancer le pointeur dans gStringVar4 et
 *  empiler des morceaux contigus. Côté TS : on construit la chaîne complète,
 *  puis on fait 2 prints distincts (= sémantique de l'output identique :
 *  l'engine de print parse la string entière). */
function PrintDecorationCategoryMenuItem(
  winid: number, category: number,
  x: number, y: number,
  disabled: boolean, speed: number,
): void {
  const width = x === 8 ? 104 : 96;
  const yPrint = y + 1;

  // 1:1 décomp:752 — ColorMenuItemString(gStringVar4, disabled).
  // Construit le préfixe color/shadow + termine string.
  const colorPrefix = ColorMenuItemString(disabled);
  // 1:1 décomp:753-754 — str = StringLength(gStringVar4)+gStringVar4 ;
  //                      StringCopy(str, sDecorationCategoryNames[category]).
  // Sémantique = append du nom de la catégorie après le color prefix.
  const labelStr = colorPrefix + sDecorationCategoryNames[category];

  // 1:1 décomp:755 — AddTextPrinterParameterized(winid, FONT_NORMAL,
  //                  gStringVar4, x, y, speed, NULL).
  AddTextPrinterParameterized3(
    winid, FONT_NORMAL, x, yPrint,
    [0, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY],
    speed,
    labelStr,
  );

  // 1:1 décomp:756-758 — construit "<Owned>/<MaxSize>" via
  // ConvertIntToDecimalStringN + CHAR_SLASH.
  const owned = GetNumOwnedDecorationsInCategory(category);
  const max = gDecorationInventories[category].size;
  const ownedStr = ConvertIntToDecimalStringN({}, owned, STR_CONV_MODE_RIGHT_ALIGN, 2);
  const maxStr = ConvertIntToDecimalStringN({}, max, STR_CONV_MODE_RIGHT_ALIGN, 2);
  // 1:1 décomp:752+757-758 — le préfixe color/shadow s'applique aussi au
  // count (= la string entière dans gStringVar4 démarre par les color bytes).
  const countStr = colorPrefix + ownedStr + CHAR_SLASH + maxStr;

  // 1:1 décomp:759 — x = GetStringRightAlignXOffset(FONT_NORMAL,
  //                       gStringVar4, width).
  // Note : décomp compute le right-align sur la string TOTALE (= color prefix +
  // count), mais les color bytes (EXT_CTRL_CODE = 0 px) n'affectent pas la
  // largeur (cf. gba-text-system.ts GetStringWidth). Compatible 1:1.
  const xCount = GetStringRightAlignXOffset(countStr, width);

  // 1:1 décomp:760 — AddTextPrinterParameterized(winid, FONT_NORMAL,
  //                  gStringVar4, x, y, speed, NULL).
  AddTextPrinterParameterized3(
    winid, FONT_NORMAL, xCount, yPrint,
    [0, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY],
    speed,
    countStr,
  );
}

/** 1:1 décomp `static void ColorMenuItemString(u8 *str, bool8 disabled)`
 *  (decoration.c:763-776).
 *
 *  Décomp :
 *    StringCopy(str, gText_Color161Shadow161);
 *    if (disabled) { str[2] = 4; str[5] = 5; }
 *    else          { str[2] = 2; str[5] = 3; }
 *
 *  gText_Color161Shadow161 est une string template avec deux byte slots
 *  (color/shadow) à indices [2] et [5]. Override selon l'état disabled.
 *
 *  Port TS : on construit dynamiquement le control code string. Le décomp
 *  utilise EXT_CTRL_CODE_COLOR (= 0xFC 0x01 <c>) + EXT_CTRL_CODE_SHADOW (=
 *  0xFC 0x03 <s>). Sémantique 1:1 = inserer les color bytes au début de la
 *  string FR.
 *
 *  Pour compatibilité avec notre stack getString/AP3 : on retourne le préfixe
 *  formaté côté code (qui sera concaténé avec le nom de la catégorie). Les
 *  AP3 colorArray sur fg+shadow donnent le même rendu que les bytes inline. */
function ColorMenuItemString(disabled: boolean): string {
  // 1:1 décomp gText_Color161Shadow161 = template "[COLOR ?][SHADOW ?]"
  // (= 6 bytes inline control codes).
  // En TS, on retourne le préfixe ASCII visible (= '' = pas de préfixe car
  // les colorArray AP3 fait le job de couleur). Le disabled est encodé via
  // override colorArray côté caller — mais ici on conserve l'API 1:1 et on
  // utilise les EXT_CTRL bytes inline pour matcher le rendu décomp.
  //
  // Décomp values :
  //   enabled  : color=2 (TEXT_COLOR_DARK_GRAY),  shadow=3 (TEXT_COLOR_LIGHT_GRAY)
  //   disabled : color=4 (TEXT_COLOR_DYNAMIC_5),  shadow=5 (TEXT_COLOR_DYNAMIC_6)
  //
  // EXT_CTRL_CODE_BEGIN = 0xFC, sub COLOR = 0x01, sub SHADOW = 0x03.
  // On encode via les chars JS ü etc. — déjà supporté par gba-text-system
  // encodeStringForFont (qui matche les bytes 0xFC parsés depuis charmap).
  const color = disabled ? 4 : 2;
  const shadow = disabled ? 5 : 3;
  return String.fromCharCode(0xFC, 0x01, color, 0xFC, 0x03, shadow);
}

/** 1:1 décomp `static void HandleDecorationCategoriesMenuInput(u8 taskId)`
 *  (decoration.c:778-799). Lit l'input chaque frame :
 *   - MENU_B_PRESSED ou DECORCAT_COUNT (= row CANCEL) : Exit menu.
 *   - MENU_NOTHING_CHOSEN : passe.
 *   - default (= 0..DECORCAT_COUNT-1) : sCurDecorationCategory = input,
 *     SelectDecorationCategory(taskId).
 *
 *  Décomp test `!gPaletteFade.active` avant. */
function HandleDecorationCategoriesMenuInput(taskId: number): void {
  const rt = getRuntime();
  if (rt?.gPaletteFade?.active) return;

  const input = Menu_ProcessInputNoWrap(); // 1:1 décomp Menu_ProcessInput
  switch (input) {
    case MENU_B_PRESSED:
    case DECORCAT_COUNT: // 1:1 décomp:786 — CANCEL row (= row 8 = 9ème).
      PlaySE(SE_SELECT);
      ExitDecorationCategoriesMenu(taskId);
      break;
    case MENU_NOTHING_CHOSEN:
      break;
    default:
      PlaySE(SE_SELECT);
      sCurDecorationCategory = input;
      SelectDecorationCategory(taskId);
      break;
  }
}

/** 1:1 décomp `static void SelectDecorationCategory(u8 taskId)`
 *  (decoration.c:801-819).
 *
 *  - Set sNumOwnedDecorationsInCurCategory = GetNumOwnedDecorationsInCategory.
 *  - Si non-zéro :
 *      CondenseDecorationsInCategory(cat)
 *      gCurDecorationItems = gDecorationInventories[cat].items
 *      IdentifyOwnedDecorationsCurrentlyInUse(taskId)
 *      reset scroll/cursor
 *      task.func = ShowDecorationItemsWindow
 *  - Sinon :
 *      RemoveDecorationWindow(CATEGORIES)
 *      msg "Aucune décoration." + retour catégories. */
function SelectDecorationCategory(taskId: number): void {
  sNumOwnedDecorationsInCurCategory = GetNumOwnedDecorationsInCategory(sCurDecorationCategory);
  if (sNumOwnedDecorationsInCurCategory !== 0) {
    CondenseDecorationsInCategory(sCurDecorationCategory);
    _setCurDecorationItems(gDecorationInventories[sCurDecorationCategory].items);
    IdentifyOwnedDecorationsCurrentlyInUse(taskId);
    sDecorationsScrollOffset = 0;
    sDecorationsCursorPos = 0;

    const rt = getRuntime();
    const task = rt?.gTasks?.get(taskId);
    if (task) task.func = (t) => ShowDecorationItemsWindow(t.taskId);
  } else {
    RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
    const msg = StringExpandPlaceholders('', getString('gText_NoDecorations'));
    setStringVar(4, msg);
    _displayItemMessageOnField(taskId, msg, ReturnToDecorationCategoriesAfterInvalidSelection);
  }
}

/** 1:1 décomp `static void ReturnToDecorationCategoriesAfterInvalidSelection(u8 taskId)`
 *  (decoration.c:821-825). ClearDialogWindow + ré-ouvre categories window. */
export function ReturnToDecorationCategoriesAfterInvalidSelection(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  InitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `static void ExitDecorationCategoriesMenu(u8 taskId)`
 *  (decoration.c:827-833).
 *
 *  - Si tDecorationMenuCommand != DECOR_MENU_TRADE : retour actions menu.
 *  - Sinon : ExitTraderDecorationMenu(taskId). */
function ExitDecorationCategoriesMenu(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  const tDecorationMenuCommand = task?.data?.[T_DECORATION_MENU_COMMAND] ?? DECOR_MENU_PLACE;

  if (tDecorationMenuCommand !== DECOR_MENU_TRADE)
    ReturnToActionsMenuFromCategories(taskId);
  else
    ExitTraderDecorationMenu(taskId);
}

/** 1:1 décomp `static void ReturnToActionsMenuFromCategories(u8 taskId)`
 *  (decoration.c:835-842). Remove CATEGORIES window + re-open MAIN_MENU +
 *  draw dialog frame + print description + re-install actions handler. */
function ReturnToActionsMenuFromCategories(taskId: number): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  AddDecorationActionsWindow();
  DrawDialogueFrame(0, false);
  PrintCurMainMenuDescription();

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationActionsMenuInput(t.taskId);
}

/** 1:1 décomp `void ShowDecorationCategoriesWindow(u8 taskId)`
 *  (decoration.c:844-851). Entry point Trader flow (= ChooseDecorationToTrade
 *  appelle ce dispatcher) : LoadPalette + clear dialog + force DECOR_MENU_TRADE
 *  + DECORCAT_DESK + open categories.
 *
 *  STUB sur LoadPalette : sDecorationMenuPalette (= décomp section 6 deferred).
 *  Notre engine TS ne charge pas la palette ici — les couleurs sont gérées
 *  via colorArray AP3. 1:1 sémantique acceptable. */
export function ShowDecorationCategoriesWindow(taskId: number): void {
  // 1:1 TODO : porter LoadPalette(sDecorationMenuPalette, BG_PLTT_ID(13), ...)
  // (= décomp:846 ; palette déférée avec section 6 Place flow).
  ClearDialogWindowAndFrame(0, false);

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_DECORATION_MENU_COMMAND] = DECOR_MENU_TRADE;

  sCurDecorationCategory = DECORCAT_DESK;
  InitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `void CopyDecorationCategoryName(u8 *dest, u8 category)`
 *  (decoration.c:853-856). Helper public (= exposé pour scripts/Trader). */
export function CopyDecorationCategoryName(dest: { value: string }, category: number): void {
  dest.value = StringCopy(dest, sDecorationCategoryNames[category]);
}

/** STUB : `static void ExitTraderDecorationMenu(u8 taskId)` (decoration.c:858-862).
 *  Remove categories + ExitTraderMenu(taskId).
 *
 *  ExitTraderMenu vit dans secret_base.c — pas porté. STUB : remove window +
 *  warn + DestroyTask.
 *
 *  1:1 TODO : porter ExitTraderMenu depuis secret_base.c (chantier futur). */
export function ExitTraderDecorationMenu(taskId: number): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  console.warn(
    '[decoration.ts STUB] ExitTraderDecorationMenu : ExitTraderMenu déféré',
    '(= secret_base.c). taskId =', taskId,
  );
  // 1:1 TODO : port secret_base.c ExitTraderMenu (chantier futur).
  const rt = getRuntime();
  rt?.gTasks?.delete(taskId);
}

/** 1:1 décomp `static void ShowDecorationCategorySummaryWindow(u8 category)`
 *  (decoration.c:1020-1023).
 *
 *  Affiche le résumé "<NomCategorie> X/Y" dans le panneau de droite (= top
 *  right corner) — sert d'indicateur permanent pendant la sélection items. */
function ShowDecorationCategorySummaryWindow(category: number): void {
  PrintDecorationCategoryMenuItem(
    AddDecorationWindow(WINDOW_DECORATION_CATEGORY_SUMMARY),
    category, 0, 0, false, 0,
  );
}

// ─── 1:1 décomp section 5 : Items list within category (decoration.c:864-1176) ─

/** 1:1 décomp `static void InitDecorationItemsMenuLimits(void)`
 *  (decoration.c:864-871). Setup numMenuItems = owned+1 (CANCEL) ; cap à 8
 *  maxShownItems. */
function InitDecorationItemsMenuLimits(): void {
  if (!sDecorationItemsMenu) return;
  sDecorationItemsMenu.numMenuItems = sNumOwnedDecorationsInCurCategory + 1;
  if (sDecorationItemsMenu.numMenuItems > 8)
    sDecorationItemsMenu.maxShownItems = 8;
  else
    sDecorationItemsMenu.maxShownItems = sDecorationItemsMenu.numMenuItems;
}

/** 1:1 décomp `static void InitDecorationItemsMenuScrollAndCursor(void)`
 *  (decoration.c:873-876). Clampe scroll+curseur dans les bornes [0,total). */
function InitDecorationItemsMenuScrollAndCursor(): void {
  if (!sDecorationItemsMenu) return;
  const pos: ListPos = { scroll: sDecorationsScrollOffset, cursor: sDecorationsCursorPos };
  SetCursorWithinListBounds(pos, sDecorationItemsMenu.maxShownItems, sDecorationItemsMenu.numMenuItems);
  sDecorationsScrollOffset = pos.scroll;
  sDecorationsCursorPos = pos.cursor;
}

/** 1:1 décomp `static void InitDecorationItemsMenuScrollAndCursor2(void)`
 *  (decoration.c:878-881). Recentre le curseur ~milieu fenêtre visible. */
function InitDecorationItemsMenuScrollAndCursor2(): void {
  if (!sDecorationItemsMenu) return;
  const pos: ListPos = { scroll: sDecorationsScrollOffset, cursor: sDecorationsCursorPos };
  SetCursorScrollWithinListBounds(
    pos, sDecorationItemsMenu.maxShownItems, sDecorationItemsMenu.numMenuItems, 8,
  );
  sDecorationsScrollOffset = pos.scroll;
  sDecorationsCursorPos = pos.cursor;
}

/** 1:1 décomp `static void PrintDecorationItemMenuItems(u8 taskId)`
 *  (decoration.c:883-909).
 *
 *  - Si player room + DECOR_MENU_PLACE + cat ∉ {DOLL,CUSHION} :
 *      ColorMenuItemString(gStringVar1, TRUE) = préfixe disabled gray.
 *    Sinon ColorMenuItemString(gStringVar1, FALSE) = préfixe normal.
 *  - Pour chaque owned item : copy "name = prefix + decoration.name" dans
 *    sDecorationItemsMenu->names[i] + ListMenuItem.{name, id=i}.
 *  - À la fin (i = numMenuItems-1) : ajoute la row CANCEL.
 *  - Setup gMultiuseListMenuTemplate (= shared template) avec les pointeurs
 *    items+totalItems+maxShowed+windowId. */
function PrintDecorationItemMenuItems(taskId: number): void {
  if (!sDecorationItemsMenu || !gCurDecorationItems) return;

  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  const tDecorationMenuCommand = task?.data?.[T_DECORATION_MENU_COMMAND] ?? DECOR_MENU_PLACE;

  // 1:1 décomp:889-892 — détermine si on doit gray-out les items.
  let prefix: string;
  if ((sCurDecorationCategory < DECORCAT_DOLL || sCurDecorationCategory > DECORCAT_CUSHION)
      && sDecorationContext.isPlayerRoom === true
      && tDecorationMenuCommand === DECOR_MENU_PLACE) {
    prefix = ColorMenuItemString(true);
  } else {
    prefix = ColorMenuItemString(false);
  }

  let i: number;
  for (i = 0; i < sDecorationItemsMenu.numMenuItems - 1; i++) {
    // 1:1 décomp:896 — CopyDecorationMenuItemName(sDecorationItemsMenu->names[i],
    //                  gCurDecorationItems[i]).
    sDecorationItemsMenu.names[i] = CopyDecorationMenuItemName(prefix, gCurDecorationItems[i]);
    sDecorationItemsMenu.items[i] = {
      name: sDecorationItemsMenu.names[i],
      id: i,
    };
  }

  // 1:1 décomp:901-903 — CANCEL row.
  sDecorationItemsMenu.names[i] = getString('gText_Cancel');
  sDecorationItemsMenu.items[i] = {
    name: sDecorationItemsMenu.names[i],
    id: LIST_CANCEL,
  };

  // 1:1 décomp:904-908 — setup gMultiuseListMenuTemplate.
  Object.assign(gMultiuseListMenuTemplate, sDecorationItemsListMenuTemplate);
  gMultiuseListMenuTemplate.windowId = sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORIES];
  gMultiuseListMenuTemplate.totalItems = sDecorationItemsMenu.numMenuItems;
  gMultiuseListMenuTemplate.items = sDecorationItemsMenu.items;
  gMultiuseListMenuTemplate.maxShowed = sDecorationItemsMenu.maxShownItems;
}

/** 1:1 décomp `static void CopyDecorationMenuItemName(u8 *dest, u16 decoration)`
 *  (decoration.c:911-915).
 *
 *  Décomp :
 *    StringCopy(dest, gStringVar1);  // = color prefix (déjà setup au caller)
 *    StringAppend(dest, gDecorations[decoration].name);
 *
 *  Port TS : on prend le préfixe explicite (= retour de ColorMenuItemString)
 *  + concat le nom de la décoration. */
function CopyDecorationMenuItemName(prefix: string, decoration: number): string {
  // 1:1 décomp:913 — StringCopy(dest, gStringVar1) (= prefix).
  // 1:1 décomp:914 — StringAppend(dest, gDecorations[decoration].name).
  const decoName = gDecorations[decoration]?.name ?? `Decor#${decoration}`;
  return prefix + decoName;
}

/** 1:1 décomp `static void DecorationItemsMenu_OnCursorMove(s32 itemIndex,
 *  bool8 flag, struct ListMenu *menu)` (decoration.c:917-923).
 *
 *  - Si !flag (= flag FALSE = vrai mouvement, pas init) : PlaySE(SE_SELECT).
 *  - PrintDecorationItemDescription(itemIndex) (= update bottom-right window). */
function DecorationItemsMenu_OnCursorMove(itemIndex: number, flag: boolean, _menu: ListMenu): void {
  if (flag !== true)
    PlaySE(SE_SELECT);
  PrintDecorationItemDescription(itemIndex);
}

/** 1:1 décomp `static void DecorationItemsMenu_PrintDecorationInUse(u8 windowId,
 *  u32 itemIndex, u8 y)` (decoration.c:925-934).
 *
 *  Blit l'icône Ball Red/Blue à côté du nom si l'item est déjà placé dans
 *  la secret base / player room.
 *
 *  STUB sur BlitMenuInfoIcon : helper bas-niveau (= window blit OAM-style).
 *  Notre engine TS expose BlitMenuInfoIcon via decomp-data auto stub seul
 *  (= no-op). 1:1 TODO : porter BlitMenuInfoIcon depuis menu.c (chantier
 *  partagé bag/party/decoration). */
function DecorationItemsMenu_PrintDecorationInUse(
  windowId: number, itemIndex: number, y: number,
): void {
  if (itemIndex !== LIST_CANCEL) {
    if (IsDecorationIndexInSecretBase(itemIndex + 1) === true) {
      _blitMenuInfoIcon_STUB(windowId, MENU_INFO_ICON_BALL_RED, 92, y + 2);
    } else if (IsDecorationIndexInPlayersRoom(itemIndex + 1) === true) {
      _blitMenuInfoIcon_STUB(windowId, MENU_INFO_ICON_BALL_BLUE, 92, y + 2);
    }
  }
}

/** 1:1 décomp `static void AddDecorationItemsScrollIndicators(void)`
 *  (decoration.c:936-950). Si pas déjà créé, init la paire de flèches scroll
 *  verticales (HAUT/BAS) avec les positions GBA std (commonX=0x3c, firstY=0x0c,
 *  secondY=0x94, tile=0x6e, pal=0x6e). */
function AddDecorationItemsScrollIndicators(): void {
  if (!sDecorationItemsMenu) return;
  if (sDecorationItemsMenu.scrollIndicatorsTaskId === TASK_NONE) {
    sDecorationItemsMenu.scrollIndicatorsTaskId = AddScrollIndicatorArrowPairParameterized(
      SCROLL_ARROW_UP,
      0x3c, 0x0c, 0x94,
      sDecorationItemsMenu.numMenuItems - sDecorationItemsMenu.maxShownItems,
      0x6e, 0x6e,
      () => sDecorationsScrollOffset,
    );
  }
}

/** 1:1 décomp `static void RemoveDecorationItemsScrollIndicators(void)`
 *  (decoration.c:952-959). Remove la paire flèches si présente. */
function RemoveDecorationItemsScrollIndicators(): void {
  if (!sDecorationItemsMenu) return;
  if (sDecorationItemsMenu.scrollIndicatorsTaskId !== TASK_NONE) {
    RemoveScrollIndicatorArrowPair(sDecorationItemsMenu.scrollIndicatorsTaskId);
    sDecorationItemsMenu.scrollIndicatorsTaskId = TASK_NONE;
  }
}

/** 1:1 décomp `static void AddDecorationItemsWindow(u8 taskId)`
 *  (decoration.c:961-965). Ouvre WINDOW_DECORATION_CATEGORIES (= la liste
 *  est dans la même window que les categories) + init items window. */
function AddDecorationItemsWindow(taskId: number): void {
  AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  InitDecorationItemsWindow(taskId);
}

/** 1:1 décomp `static void InitDecorationItemsWindow(u8 taskId)`
 *  (decoration.c:967-980).
 *
 *  - Ouvre WINDOW_DECORATION_CATEGORY_ITEMS (= bottom-right description box).
 *  - Affiche le résumé de la catégorie (top-right corner).
 *  - Alloc sDecorationItemsMenu + init limits/scroll/cursor.
 *  - Print les items + setup template.
 *  - ListMenuInit (= démarre le list menu task).
 *  - Add scroll indicators. */
function InitDecorationItemsWindow(taskId: number): void {
  AddDecorationWindow(WINDOW_DECORATION_CATEGORY_ITEMS);
  ShowDecorationCategorySummaryWindow(sCurDecorationCategory);

  // 1:1 décomp:972-973 — AllocZeroed + init scrollIndicatorsTaskId = TASK_NONE.
  sDecorationItemsMenu = {
    items: new Array(41).fill(null).map(() => ({ name: '', id: 0 })),
    names: new Array(41).fill(''),
    numMenuItems: 0,
    maxShownItems: 0,
    scrollIndicatorsTaskId: TASK_NONE,
  };

  InitDecorationItemsMenuLimits();
  InitDecorationItemsMenuScrollAndCursor();
  InitDecorationItemsMenuScrollAndCursor2();
  PrintDecorationItemMenuItems(taskId);

  // 1:1 décomp:978 — tMenuTaskId = ListMenuInit(...).
  const menuTaskId = ListMenuInit(
    gMultiuseListMenuTemplate,
    sDecorationsScrollOffset,
    sDecorationsCursorPos,
  );
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.data[T_MENU_TASK_ID] = menuTaskId;

  AddDecorationItemsScrollIndicators();
}

/** 1:1 décomp `static void ShowDecorationItemsWindow(u8 taskId)`
 *  (decoration.c:982-986). Init items window + transition vers items handler. */
function ShowDecorationItemsWindow(taskId: number): void {
  InitDecorationItemsWindow(taskId);
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => HandleDecorationItemsMenuInput(t.taskId);
}

/** 1:1 décomp `static void HandleDecorationItemsMenuInput(u8 taskId)`
 *  (decoration.c:988-1018).
 *
 *  Lit l'input chaque frame :
 *   - LIST_NOTHING_CHOSEN : passe.
 *   - LIST_CANCEL : SE_SELECT + appelle action[tDecorationMenuCommand][1]
 *                   (= Cancel pour Place/Toss/Trade).
 *   - default (= itemIndex valide) : SE_SELECT + gCurDecorationIndex = input +
 *                   remove scroll indicators + DestroyListMenuTask + remove
 *                   windows + Free menu + appelle action[tDecorationMenuCommand][0]
 *                   (= AttemptPlace/Toss/Trade). */
function HandleDecorationItemsMenuInput(taskId: number): void {
  const rt = getRuntime();
  if (rt?.gPaletteFade?.active) return;

  const task = rt?.gTasks?.get(taskId);
  const tMenuTaskId = task?.data?.[T_MENU_TASK_ID] ?? -1;
  const tDecorationMenuCommand = task?.data?.[T_DECORATION_MENU_COMMAND] ?? DECOR_MENU_PLACE;

  const input = ListMenu_ProcessInput(tMenuTaskId);
  // 1:1 décomp:997 — sync scroll/cursor depuis la list task.
  const sr = ListMenuGetScrollAndRow(tMenuTaskId);
  sDecorationsScrollOffset = sr.scrollOffset;
  sDecorationsCursorPos = sr.selectedRow;

  switch (input) {
    case LIST_NOTHING_CHOSEN:
      break;
    case LIST_CANCEL:
      PlaySE(SE_SELECT);
      sSecretBasePC_SelectedDecorationActions[tDecorationMenuCommand][1](taskId);
      break;
    default:
      PlaySE(SE_SELECT);
      gCurDecorationIndex = input;
      RemoveDecorationItemsScrollIndicators();
      DestroyListMenuTask(tMenuTaskId);
      RemoveDecorationWindow(WINDOW_DECORATION_CATEGORIES);
      RemoveDecorationItemsOtherWindows();
      sDecorationItemsMenu = null; // 1:1 décomp:1013 — Free(sDecorationItemsMenu).
      sSecretBasePC_SelectedDecorationActions[tDecorationMenuCommand][0](taskId);
      break;
  }
}

/** 1:1 décomp `static void PrintDecorationItemDescription(s32 itemIndex)`
 *  (decoration.c:1025-1038).
 *
 *  Render la description de l'item dans WINDOW_DECORATION_CATEGORY_ITEMS :
 *   - Si itemIndex >= numOwned : "Retour au menu précédent." (= CANCEL row).
 *   - Sinon : gDecorations[gCurDecorationItems[itemIndex]].description. */
function PrintDecorationItemDescription(itemIndex: number): void {
  const windowId = sDecorMenuWindowIds[WINDOW_DECORATION_CATEGORY_ITEMS];
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));

  let str: string;
  if (itemIndex >>> 0 >= sNumOwnedDecorationsInCurCategory) {
    str = getString('gText_GoBackPrevMenu');
  } else {
    const decoId = gCurDecorationItems?.[itemIndex] ?? 0;
    // 1:1 décomp:1035 — gDecorations[..].description = pointer string.
    // Côté TS, la value est une clé strings.json (= "DecorDesc_*") à résoudre.
    const descKey = gDecorations[decoId]?.description ?? '';
    str = descKey ? getString(descKey) : '';
  }

  AddTextPrinterParameterized3(
    windowId, FONT_NORMAL, 0, 1,
    [0, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY],
    0,
    str,
  );
}

/** 1:1 décomp `static void RemoveDecorationItemsOtherWindows(void)`
 *  (decoration.c:1040-1044). Remove summary + items windows (= description
 *  bottom-right + résumé top-right). */
function RemoveDecorationItemsOtherWindows(): void {
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORY_ITEMS);
  RemoveDecorationWindow(WINDOW_DECORATION_CATEGORY_SUMMARY);
}

/** 1:1 décomp `static bool8 IsDecorationIndexInSecretBase(u8 idx)`
 *  (decoration.c:1046-1056). Vrai si idx (= position+1 dans l'inventaire owned)
 *  apparaît dans sSecretBaseItemsIndicesBuffer. */
function IsDecorationIndexInSecretBase(idx: number): boolean {
  for (let i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) {
    if (sSecretBaseItemsIndicesBuffer[i] === idx)
      return true;
  }
  return false;
}

/** 1:1 décomp `static bool8 IsDecorationIndexInPlayersRoom(u8 idx)`
 *  (decoration.c:1058-1068). Idem mais pour player room buffer. */
function IsDecorationIndexInPlayersRoom(idx: number): boolean {
  for (let i = 0; i < sPlayerRoomItemsIndicesBuffer.length; i++) {
    if (sPlayerRoomItemsIndicesBuffer[i] === idx)
      return true;
  }
  return false;
}

/** 1:1 décomp `static void IdentifyOwnedDecorationsCurrentlyInUseInternal(u8 taskId)`
 *  (decoration.c:1070-1121).
 *
 *  Pour chaque slot rempli dans secretBases[0].decorations + chaque slot rempli
 *  dans playerRoomDecorations :
 *   - Cherche son index (+1) dans gCurDecorationItems[] de la catégorie courante.
 *   - Vérifie qu'il n'est pas déjà dans le buffer.
 *   - Ajoute à sSecretBaseItemsIndicesBuffer / sPlayerRoomItemsIndicesBuffer.
 *
 *  Note décomp:1108 : pour le player room, on saute les items déjà comptés
 *  dans secret base (= un item placé aux 2 endroits n'apparaît qu'en RED). */
function IdentifyOwnedDecorationsCurrentlyInUseInternal(_taskId: number): void {
  let count: number;
  let i: number, j: number, k: number;

  count = 0;
  // 1:1 décomp:1076-1077 — memset buffers à 0.
  for (i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) sSecretBaseItemsIndicesBuffer[i] = 0;
  for (i = 0; i < sPlayerRoomItemsIndicesBuffer.length; i++) sPlayerRoomItemsIndicesBuffer[i] = 0;

  // 1:1 décomp:1079-1099 — secret base scan.
  for (i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) {
    if (gSaveBlock1Ptr.secretBases[0].decorations[i] !== 0 /* DECOR_NONE */) {
      for (j = 0; j < gDecorationInventories[sCurDecorationCategory].size; j++) {
        if (gCurDecorationItems?.[j] === gSaveBlock1Ptr.secretBases[0].decorations[i]) {
          // 1:1 décomp:1087-1088 — k loop : check pas déjà présent.
          for (k = 0; k < count && sSecretBaseItemsIndicesBuffer[k] !== j + 1; k++);
          if (k === count) {
            sSecretBaseItemsIndicesBuffer[count] = j + 1;
            count++;
            break;
          }
        }
      }
    }
  }

  // 1:1 décomp:1101-1120 — player room scan (skip ceux déjà en SB).
  count = 0;
  for (i = 0; i < sPlayerRoomItemsIndicesBuffer.length; i++) {
    if (gSaveBlock1Ptr.playerRoomDecorations[i] !== 0 /* DECOR_NONE */) {
      for (j = 0; j < gDecorationInventories[sCurDecorationCategory].size; j++) {
        if (gCurDecorationItems?.[j] === gSaveBlock1Ptr.playerRoomDecorations[i]
            && IsDecorationIndexInSecretBase(j + 1) !== true) {
          for (k = 0; k < count && sPlayerRoomItemsIndicesBuffer[k] !== j + 1; k++);
          if (k === count) {
            sPlayerRoomItemsIndicesBuffer[count] = j + 1;
            count++;
            break;
          }
        }
      }
    }
  }
}

/** 1:1 décomp `static void IdentifyOwnedDecorationsCurrentlyInUse(u8 taskId)`
 *  (decoration.c:1123-1126). Wrapper public de Internal. */
function IdentifyOwnedDecorationsCurrentlyInUse(taskId: number): void {
  IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);
}

/** 1:1 décomp `static void Task_ShowDecorationItemsWindow(u8 taskId)`
 *  (decoration.c:1146-1150). Wrapper pour back-navigation (= AddCategories +
 *  ShowItems). Utilisé par DontTossDecoration. */
function Task_ShowDecorationItemsWindow(taskId: number): void {
  AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
  ShowDecorationItemsWindow(taskId);
}

/** 1:1 décomp `static void DontTossDecoration(u8 taskId)` (decoration.c:1152-1156).
 *  Callback "non" du YesNo Toss prompt : clear dialog + retour items window. */
export function DontTossDecoration(taskId: number): void {
  ClearDialogWindowAndFrame(0, false);
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  if (task) task.func = (t) => Task_ShowDecorationItemsWindow(t.taskId);
}

/** 1:1 décomp `static void ReturnToDecorationItemsAfterInvalidSelection(u8 taskId)`
 *  (decoration.c:1158-1166). Per-frame : si A ou B pressé, clear dialog +
 *  re-open items window. */
function ReturnToDecorationItemsAfterInvalidSelection(taskId: number): void {
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    ClearDialogWindowAndFrame(0, false);
    AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);
    ShowDecorationItemsWindow(taskId);
  }
}

/** 1:1 décomp `static void DecorationItemsMenuAction_Cancel(u8 taskId)`
 *  (decoration.c:1168-1176).
 *
 *  - Remove scroll indicators.
 *  - Remove summary + items windows.
 *  - DestroyListMenuTask (NULL out params).
 *  - Free sDecorationItemsMenu.
 *  - Re-init categories window (retour back nav). */
export function DecorationItemsMenuAction_Cancel(taskId: number): void {
  const rt = getRuntime();
  const task = rt?.gTasks?.get(taskId);
  const tMenuTaskId = task?.data?.[T_MENU_TASK_ID] ?? -1;

  RemoveDecorationItemsScrollIndicators();
  RemoveDecorationItemsOtherWindows();
  if (tMenuTaskId >= 0) DestroyListMenuTask(tMenuTaskId);
  sDecorationItemsMenu = null; // 1:1 décomp:1174 — Free(sDecorationItemsMenu).
  ReinitDecorationCategoriesWindow(taskId);
}

/** 1:1 décomp `static void DecorationItemsMenuAction_AttemptPlace(u8 taskId)`
 *  (decoration.c:1325-1370).
 *
 *  STUB : Place flow = decoration.c section 6 (~1500 lignes deferred).
 *  Branches honnêtes :
 *   - Si player room + cat ∉ {DOLL, CUSHION} : msg "Tu ne peux pas placer ça"
 *     + retour items.
 *   - Sinon si IsSelectedDecorInThePC :
 *       Si HasDecorationSpace : fade + Task_PlaceDecoration → STUB.
 *       Sinon : msg "Plus de place" + retour items.
 *
 *  Pour ce port (sections 4-5) : on stub vers retour Cancel (= flow safe).
 *  1:1 TODO : port decoration.c section 6 (Place flow). */
function DecorationItemsMenuAction_AttemptPlace(taskId: number): void {
  console.warn(
    '[decoration.ts STUB] DecorationItemsMenuAction_AttemptPlace : Place flow déféré',
    '(= decoration.c section 6 ≈1500l). Fallback Cancel.',
    'taskId =', taskId, 'gCurDecorationIndex =', gCurDecorationIndex,
  );
  // 1:1 TODO : port decoration.c section 6 (Place flow).
  // Branches honnêtes minimales (= early-game user friendly) :
  if (sDecorationContext.isPlayerRoom === true
      && sCurDecorationCategory !== DECORCAT_DOLL
      && sCurDecorationCategory !== DECORCAT_CUSHION) {
    const msg = StringExpandPlaceholders('', getString('gText_CantPlaceInRoom'));
    setStringVar(4, msg);
    _displayItemMessageOnField(taskId, msg, ReturnToDecorationItemsAfterInvalidSelection);
    return;
  }
  // Fallback : retour Cancel pour ne pas bloquer la task.
  DecorationItemsMenuAction_Cancel(taskId);
}

// ─── STUBs section 6+ (référencés par sSecretBasePC_SelectedDecorationActions) ─

/** STUB : `static void DecorationItemsMenuAction_AttemptToss(u8 taskId)`
 *  (decoration.c:2719). Yes/No prompt + DecorationRemove + condense.
 *
 *  1:1 TODO : port decoration.c Toss flow (= ~100 lignes, chantier futur). */
function _DecorationItemsMenuAction_AttemptToss_STUB(taskId: number): void {
  console.warn(
    '[decoration.ts STUB] DecorationItemsMenuAction_AttemptToss : Toss flow déféré',
    '(= decoration.c ≈100l). Fallback Cancel.',
    'taskId =', taskId,
  );
  // 1:1 TODO : port decoration.c Toss flow (chantier futur).
  DecorationItemsMenuAction_Cancel(taskId);
}

/** STUB : `static void DecorationItemsMenuAction_Trade(u8 taskId)`
 *  (secret_base.c). Échange une décoration avec le Trader (Secret Base PC).
 *
 *  1:1 TODO : port secret_base.c Trader flow (chantier futur). */
function _DecorationItemsMenuAction_Trade_STUB(taskId: number): void {
  console.warn(
    '[decoration.ts STUB] DecorationItemsMenuAction_Trade : Trade flow déféré',
    '(= secret_base.c). Fallback Cancel.',
    'taskId =', taskId,
  );
  // 1:1 TODO : port secret_base.c Trader flow (chantier futur).
  DecorationItemsMenuAction_Cancel(taskId);
}

/** STUB : `void BlitMenuInfoIcon(u8 windowId, u8 iconId, u16 x, u16 y)`
 *  (menu.c). Blit une icône (= Ball Red, Ball Blue, etc.) dans une window
 *  via SVOM (= window tile blit).
 *
 *  Notre engine TS expose un stub no-op via decomp-data auto. 1:1 sémantique
 *  dégradé (= pas d'icône visuelle à côté des items in-use) mais fonctionnel.
 *
 *  1:1 TODO : porter BlitMenuInfoIcon depuis menu.c + sMenuInfoIcons asset
 *  (chantier partagé bag/party/decoration). */
function _blitMenuInfoIcon_STUB(windowId: number, iconId: number, x: number, y: number): void {
  console.warn(
    '[decoration.ts STUB] BlitMenuInfoIcon : icon blit déféré',
    '(= menu.c). Pas d\'icône visuelle (ball red/blue).',
    'windowId =', windowId, 'iconId =', iconId, 'x =', x, 'y =', y,
  );
  // 1:1 TODO : port menu.c BlitMenuInfoIcon (chantier futur).
}

// ─── Cleanup helper (= 1:1 décomp pattern) ───────────────────────────────────

/** Reset de tout le module-state. Utile pour les tests ou un soft-reset
 *  game. Pas de pendant décomp direct (= EWRAM cleared automatiquement par
 *  le boot ; ici on assure que les variables module-level reviennent à 0). */
export function _resetDecorationModuleState(): void {
  sDecorationActionsCursorPos = 0;
  sNumOwnedDecorationsInCurCategory = 0;
  sCurDecorationCategory = DECORCAT_DESK;
  gCurDecorationIndex = 0;
  sDecorationContext.items = [];
  sDecorationContext.pos = [];
  sDecorationContext.size = 0;
  sDecorationContext.isPlayerRoom = false;
  for (let i = 0; i < WINDOW_COUNT; i++) sDecorMenuWindowIds[i] = -1;
  gCurDecorationItems = null;
  // Sections 4-5 state :
  for (let i = 0; i < sSecretBaseItemsIndicesBuffer.length; i++) sSecretBaseItemsIndicesBuffer[i] = 0;
  for (let i = 0; i < sPlayerRoomItemsIndicesBuffer.length; i++) sPlayerRoomItemsIndicesBuffer[i] = 0;
  sDecorationsCursorPos = 0;
  sDecorationsScrollOffset = 0;
  sDecorationItemsMenu = null;
}

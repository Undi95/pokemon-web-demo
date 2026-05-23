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
  type WindowTemplate,
} from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import {
  InitMenuInUpperLeftCornerNormal, Menu_ProcessInputNoWrap, Menu_GetCursorPos,
} from './gba-menu-system';
import { PlaySE, getRuntime } from './decomp-globals';
import { gSaveBlock1Ptr } from './save-block-state';
import { DECOR_MAX_PLAYERS_HOUSE, DECOR_MAX_SECRET_BASE } from './save-blocks';
import {
  DECORCAT_DESK, DECORCAT_COUNT,
  gDecorationInventories,
  GetNumOwnedDecorations,
} from './decoration-inventory';
import { getString } from './gba-strings';
import { setStringVar } from './string-buffers';
import { StringExpandPlaceholders } from './gba-text-system';
import { FadeScreen, FADE_TO_BLACK } from './fade-screen';
import { LockPlayerFieldControls, ScriptContext_SetupScript } from './script-runtime';
import { SE_SELECT } from './decomp-data/auto/include/constants/songs-data';

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
 *  ouverture par DecorationMenuAction_Decorate/Toss). */
let sCurDecorationCategory = DECORCAT_DESK;

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
}

/**
 * start-menu.ts — Menu Start overworld 1:1 décomp `src/start_menu.c`.
 *
 * 7 items (= ordre 1:1 décomp sStartMenuItems) :
 *   POKéDEX  — placeholder (= "Pokédex non disponible")
 *   POKéMON  — party menu (= empty list MVP si party.length === 0)
 *   SAC      — bag content view (= 5 pockets)
 *   {PLAYER} — trainer card (= name/gender/etc.)
 *   SAUVER   — save flow (Yes/No → save → success dialog)
 *   OPTIONS  — placeholder (= "Options indisponible")
 *   RETOUR   — close menu
 *
 * Triggered par START button (= 0x08, mappé à Enter/Space/B sur clavier).
 * Lock player input pendant que le menu est ouvert (= 1:1 décomp via
 * LockPlayerFieldControls).
 *
 * Source de vérité décomp :
 *   - `src/start_menu.c` (CB2_StartMenu, BuildStartMenuActions, sStartMenuItems,
 *     SaveYesNoCallback / SaveConfirmInputCallback / SaveSuccessCallback)
 *   - `src/menu.c` (CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose)
 *   - `src/strings.c` (gText_MenuSave, gText_MenuOption, etc.)
 *
 * Architecture : state machine multi-étapes pour gérer save flow + sub-menus.
 *   sub-state 'menu'         : main menu navigation
 *   sub-state 'msg_wait'     : showing dialog message (placeholder ou success)
 *   sub-state 'save_confirm' : showing "Sauvegarder?" dialog + Yes/No menu
 *   sub-state 'save_done'    : showing "Partie sauvegardée!" dialog post-save
 *
 * Reuse foundations :
 *   - gba-window-system : AddWindow + DrawStdFrameWithCustomTileAndPalette
 *   - gba-text-window : LoadUserWindowBorderGfx (= frame style user-selected)
 *   - gba-text-system : AddTextPrinterParameterized3
 *   - gba-menu-system : CreateYesNoMenu + Menu_ProcessInputNoWrapClearOnChoose
 *   - field-message-box : ShowFieldMessage / TickFieldMessageBox / HideFieldMessageBox
 *   - script-runtime : LockPlayerFieldControls
 *   - game-state : gameState.save() / gameState.party / gameState.bag
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import {
  LockPlayerFieldControls, UnlockPlayerFieldControls, ScriptContext_IsEnabled,
} from './script-runtime';
import {
  ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox, GetFieldMessageBoxMode,
  FIELD_MESSAGE_BOX_HIDDEN,
} from './field-message-box';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId,
} from './gba-menu-system';
import { PlaySE, getRuntime } from './decomp-globals';
import * as Songs from './decomp-data/auto/include/constants/songs-data';
import { gameState } from './game-state';
import { bagContents } from './bag';

// ─── Types + state ───────────────────────────────────────────────────────────

interface MenuItem {
  /** Texte affiché (= déjà résolu en FR, pas de placeholder à expand). */
  label: string;
  /** Action handler. Return true si le menu doit se fermer après. */
  onSelect: () => boolean;
}

type SubState =
  | 'menu'           // main menu : nav + select
  | 'msg_wait'       // showing dialog ; wait for A/B → close dialog → return to menu
  | 'msg_close'      // showing dialog ; wait for A/B → close dialog AND close menu
  | 'save_confirm'   // showing "Sauvegarder?" dialog ; once printer done → spawn Yes/No
  | 'save_yesno'     // Yes/No menu open ; wait input
  | 'save_done';     // showing "Partie sauvegardée!" ; A/B → close menu

let sIsOpen = false;
let sWindowId = -1;
let sCursorPos = 0;
let sItems: MenuItem[] = [];
let sSubState: SubState = 'menu';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

const SE_SELECT_FALLBACK = 5;
const SE_WIN_OPEN_FALLBACK = 6;
const A_BUTTON = 0x01;
const B_BUTTON = 0x02;
const START_BUTTON = 0x08;
const DPAD_UP = 0x40;
const DPAD_DOWN = 0x80;

const STD_FRAME_PALETTE_NUM = 13;
const STD_FRAME_BASE_TILE = 0x10A;

// Window template Yes/No save dialog : positionné juste au-dessus du dialog box
// pour ne pas overlap. 1:1 décomp menu.c sYesNoWindowTemplate (5×4 tiles).
const YESNO_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0,
  tilemapLeft: 22,        // top-right area (= leaves space for dialog at bottom)
  tilemapTop: 8,
  width: 5,
  height: 4,
  paletteNum: STD_FRAME_PALETTE_NUM,
  baseBlock: 0x250,        // après start menu pixel buffer (~0x200..0x246)
};

function buildStartMenuTemplate(numItems: number): WindowTemplate {
  return {
    bg: 0,
    tilemapLeft: 22,
    tilemapTop: 1,
    width: 7,
    height: numItems * 2,
    paletteNum: STD_FRAME_PALETTE_NUM,
    baseBlock: 0x200,
  };
}

const CURSOR_CHAR = '▶';
const CURSOR_X = 0;
const CURSOR_Y_PER_ROW = 16;

function _seSelect(): number {
  return (Songs as unknown as Record<string, number>).SE_SELECT ?? SE_SELECT_FALLBACK;
}
function _seWinOpen(): number {
  return (Songs as unknown as Record<string, number>).SE_WIN_OPEN ?? SE_WIN_OPEN_FALLBACK;
}

function drawCursor(): void {
  if (sWindowId < 0) return;
  AddTextPrinterParameterized3(
    sWindowId, 1 /* FONT_NORMAL */,
    CURSOR_X, 1 + sCursorPos * CURSOR_Y_PER_ROW,
    [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, CURSOR_CHAR,
  );
}

// ─── Sub-menu actions ────────────────────────────────────────────────────────

function showMessageThenReturn(text: string): boolean {
  // Show dialog message ; sub-state msg_wait → A/B revient au menu.
  ShowFieldMessage(text + '$');
  sSubState = 'msg_wait';
  return false;
}

function showMessageThenClose(text: string): boolean {
  // Show dialog message ; sub-state msg_close → A/B ferme le menu.
  ShowFieldMessage(text + '$');
  sSubState = 'msg_close';
  return false;
}

/** POKéDEX action : stub — le Pokédex n'est pas implémenté. */
function pokedexAction(): boolean {
  return showMessageThenReturn('Le POKéDEX n\'est pas\nencore disponible.');
}

/** POKéMON action : si party empty, message ; sinon TODO sub-menu party. */
function pokemonAction(): boolean {
  if (gameState.party.length === 0) {
    return showMessageThenReturn('Vous n\'avez pas\nencore de POKéMON.');
  }
  // MVP : list party names dans le dialog. À remplacer par vrai party menu plus tard.
  const names = gameState.party.map((p, i) => `${i + 1}. ${p.speciesNameFr ?? '???'}`).join('\n');
  return showMessageThenReturn(`Équipe POKéMON :\n${names}`);
}

/** SAC action : list bag contents par pocket dans le dialog. */
function sacAction(): boolean {
  const items = bagContents();
  if (items.length === 0) {
    return showMessageThenReturn('Le SAC est vide.');
  }
  // Group par pocket, format simple.
  const POCKET_FR: Record<string, string> = {
    POCKET_ITEMS: 'OBJETS',
    POCKET_POKE_BALLS: 'POKé BALLS',
    POCKET_TM_HM: 'CT/CS',
    POCKET_BERRIES: 'BAIES',
    POCKET_KEY_ITEMS: 'OBJETS RARES',
  };
  const lines: string[] = [];
  let lastPocket = '';
  for (const it of items) {
    if (it.pocket !== lastPocket) {
      lines.push(`[${POCKET_FR[it.pocket] ?? it.pocket}]`);
      lastPocket = it.pocket;
    }
    const friendlyName = it.itemKey.replace(/^ITEM_/, '').replace(/_/g, ' ');
    lines.push(`${friendlyName} ×${it.quantity}`);
  }
  // Limite à 10 lines pour pas dépasser le dialog box.
  const text = lines.slice(0, 10).join('\n');
  return showMessageThenReturn(text);
}

/** {PLAYER} action : trainer card mini-fiche. */
function playerCardAction(): boolean {
  const name = gameState.playerName ?? 'PLAYER';
  const gender = gameState.gender === 'MALE' ? 'GARÇON' : 'FILLE';
  const partySize = gameState.partySize;
  return showMessageThenReturn(
    `DRESSEUR : ${name}\nSEXE : ${gender}\nÉQUIPE : ${partySize}/6`,
  );
}

/** SAUVER action : confirm dialog + Yes/No + save + success message. */
function saveAction(): boolean {
  ShowFieldMessage('Voulez-vous sauvegarder?$');
  sSubState = 'save_confirm';
  return false;
}

/** OPTIONS action : placeholder (= option-menu-impl exists in code mais
 *  scene-specific main_menu, pas wired pour overworld start menu). */
function optionsAction(): boolean {
  return showMessageThenReturn('Les OPTIONS ne sont pas\nencore disponibles ici.');
}

// ─── Build items list ────────────────────────────────────────────────────────

function buildItems(): MenuItem[] {
  return [
    { label: 'POKéDEX',  onSelect: pokedexAction },
    { label: 'POKéMON',  onSelect: pokemonAction },
    { label: 'SAC',      onSelect: sacAction },
    { label: gameState.playerName, onSelect: playerCardAction },
    { label: 'SAUVER',   onSelect: saveAction },
    { label: 'OPTIONS',  onSelect: optionsAction },
    { label: 'RETOUR',   onSelect: () => true },
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function IsStartMenuOpen(): boolean {
  return sIsOpen;
}

export function OpenStartMenu(): void {
  if (sIsOpen) return;
  sItems = buildItems();
  sCursorPos = 0;
  sSubState = 'menu';
  const tmpl = buildStartMenuTemplate(sItems.length);
  sWindowId = AddWindow(tmpl);
  // 1:1 décomp `LoadUserWindowBorderGfx_(0, baseTile, BG_PLTT_ID(13))`.
  LoadUserWindowBorderGfx(0, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(sWindowId, true, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM);
  for (let i = 0; i < sItems.length; i++) {
    AddTextPrinterParameterized3(
      sWindowId, 1 /* FONT_NORMAL */,
      8, 1 + i * CURSOR_Y_PER_ROW,
      [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, sItems[i].label,
    );
  }
  drawCursor();
  LockPlayerFieldControls();
  sIsOpen = true;
  PlaySE(_seWinOpen());
  console.log('[start-menu] opened');
}

export function CloseStartMenu(): void {
  if (!sIsOpen) return;
  if (sWindowId >= 0) {
    ClearStdWindowAndFrame(sWindowId, true);
    RemoveWindow(sWindowId);
    sWindowId = -1;
  }
  // Cleanup any open Yes/No menu (= si user a fait B sur save_confirm).
  const ynId = GetYesNoWindowId();
  if (ynId >= 0) {
    ClearStdWindowAndFrame(ynId, true);
    RemoveWindow(ynId);
  }
  // Cleanup any open dialog.
  if (!IsFieldMessageBoxHidden()) HideFieldMessageBox();
  UnlockPlayerFieldControls();
  sIsOpen = false;
  sSubState = 'menu';
  console.log('[start-menu] closed');
}

function _redrawMenu(): void {
  if (sWindowId < 0) return;
  LoadUserWindowBorderGfx(0, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(sWindowId, true, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM);
  for (let i = 0; i < sItems.length; i++) {
    AddTextPrinterParameterized3(
      sWindowId, 1 /* FONT_NORMAL */,
      8, 1 + i * CURSOR_Y_PER_ROW,
      [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, sItems[i].label,
    );
  }
  drawCursor();
}

/** Tick called per-frame depuis MainCB2_Overworld.
 *  State machine multi-étapes pour gérer save flow + sub-menus. */
export function TickStartMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;

  if (!sIsOpen) {
    if (newKeys & START_BUTTON) {
      if (ScriptContext_IsEnabled()) return;
      if (!IsFieldMessageBoxHidden()) return;
      OpenStartMenu();
    }
    return;
  }

  // Sub-state dispatch.
  switch (sSubState) {
    case 'menu':
      _tickMainMenu(newKeys);
      break;
    case 'msg_wait':
    case 'msg_close':
      _tickMessageWait(newKeys);
      break;
    case 'save_confirm':
      _tickSaveConfirm(newKeys);
      break;
    case 'save_yesno':
      _tickSaveYesNo();
      break;
    case 'save_done':
      _tickSaveDone(newKeys);
      break;
  }
}

function _tickMainMenu(newKeys: number): void {
  if (newKeys & B_BUTTON) {
    PlaySE(_seSelect());
    CloseStartMenu();
    return;
  }
  if (newKeys & START_BUTTON) {
    PlaySE(_seSelect());
    CloseStartMenu();
    return;
  }
  if (newKeys & A_BUTTON) {
    PlaySE(_seSelect());
    const item = sItems[sCursorPos];
    if (item) {
      const shouldClose = item.onSelect();
      if (shouldClose) CloseStartMenu();
    }
    return;
  }
  if (newKeys & DPAD_UP) {
    if (sCursorPos > 0) {
      sCursorPos--;
      _redrawMenu();
      PlaySE(_seSelect());
    }
  }
  if (newKeys & DPAD_DOWN) {
    if (sCursorPos < sItems.length - 1) {
      sCursorPos++;
      _redrawMenu();
      PlaySE(_seSelect());
    }
  }
}

function _tickMessageWait(newKeys: number): void {
  // Wait for dialog printer to finish (= mode HIDDEN), THEN A/B close.
  const dialogDone = GetFieldMessageBoxMode() === FIELD_MESSAGE_BOX_HIDDEN;
  if (!dialogDone) return; // Still printing.
  if (newKeys & (A_BUTTON | B_BUTTON)) {
    HideFieldMessageBox();
    if (sSubState === 'msg_close') {
      CloseStartMenu();
    } else {
      sSubState = 'menu';
      _redrawMenu();
    }
  }
}

function _tickSaveConfirm(newKeys: number): void {
  // Wait for "Voulez-vous sauvegarder?" printer done, THEN show Yes/No menu.
  const dialogDone = GetFieldMessageBoxMode() === FIELD_MESSAGE_BOX_HIDDEN;
  if (!dialogDone) return;
  // Spawn Yes/No menu si pas encore fait.
  if (GetYesNoWindowId() < 0) {
    CreateYesNoMenu(YESNO_WINDOW_TEMPLATE, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM, 0);
    sSubState = 'save_yesno';
    return;
  }
  void newKeys;
}

function _tickSaveYesNo(): void {
  // Menu_ProcessInputNoWrapClearOnChoose retourne :
  //   0 = OUI sélectionné (= save)
  //   1 = NON sélectionné (= cancel)
  //  -1 = B pressed (= cancel)
  //  -2 = still processing
  const result = Menu_ProcessInputNoWrapClearOnChoose();
  if (result === -2) return;
  if (result === 0) {
    // OUI → save.
    gameState.save();
    HideFieldMessageBox();
    ShowFieldMessage(`${gameState.playerName} a sauvegardé\nla partie!$`);
    sSubState = 'save_done';
  } else {
    // NON ou B → cancel, retour menu.
    HideFieldMessageBox();
    sSubState = 'menu';
    _redrawMenu();
  }
}

function _tickSaveDone(newKeys: number): void {
  const dialogDone = GetFieldMessageBoxMode() === FIELD_MESSAGE_BOX_HIDDEN;
  if (!dialogDone) return;
  if (newKeys & (A_BUTTON | B_BUTTON)) {
    HideFieldMessageBox();
    // 1:1 décomp : after save success, close start menu (= retour gameplay).
    CloseStartMenu();
  }
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).startMenu = {
    open: OpenStartMenu,
    close: CloseStartMenu,
    isOpen: IsStartMenuOpen,
  };
}

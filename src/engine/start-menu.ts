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
  LoadMessageBoxGfx, DLG_WINDOW_BASE_TILE_NUM,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { GetNationalPokedexCount, GetHoennPokedexCount, FLAG_GET_CAUGHT } from './pokedex-flags';
import { IsNationalPokedexEnabled } from './decomp-data/auto/src-all/event_data-all-auto';
import {
  LockPlayerFieldControls, UnlockPlayerFieldControls, ScriptContext_IsEnabled,
  ArePlayerFieldControlsLocked,
  getText,
} from './script-runtime';
import {
  ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox, GetFieldMessageBoxMode,
  FIELD_MESSAGE_BOX_HIDDEN,
} from './field-message-box';
import {
  CreateYesNoMenu, Menu_ProcessInputNoWrapClearOnChoose, GetYesNoWindowId,
} from './gba-menu-system';
import { PlaySE, getRuntime, gMain } from './decomp-globals';
import * as Songs from './decomp-data/auto/include/constants/songs-data';
import { gameState } from './game-state';
import { bagContents } from './bag';
import { HideMapNamePopUpWindow } from './map-name-popup';
import { GetStringRightAlignXOffset } from './gba-text-system';
import { gMapHeader } from './map-loader';
import { getMapNameFr } from '../data/map-names-fr';
import { gSaveBlock2Ptr } from './gba-menu-system';
import { FlagGet } from './script-vars';
import { CB2_InitOptionMenu } from './decomp-data/auto/src-all/option_menu-all-auto';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { preloadOptionMenuAssets } from './option-menu-impl';
// SAC : recâblé vers la réécriture propre bag-menu.ts (= ÉTAPE 9 du plan
// maillon ; remplace le foam bag-screen.ts reverted cddfcfee). Pattern
// IDENTIQUE à OpenPartyScreen/pokemonAction (CB2-swap prouvé A/B).
import { OpenBagScreen } from './bag-menu';
import { OpenPartyScreen, TickPartyScreen } from './party-screen';
import { OpenTrainerCardScreen, TickTrainerCardScreen } from './trainer-card-screen';
import { OpenPokedexScreen, TickPokedexScreen } from './pokedex-screen';
import { getString } from './gba-strings';
import { FadeScreen, FADE_TO_BLACK } from './fade-screen';
// 1:1 décomp IsSEPlaying (sound.c:577) — direct import depuis decomp-globals
// pour éviter le globalThis lookup qui pourrait résoudre vers la version
// auto-transpilée broken (= sound-all-auto.ts:561, gMPlayInfo_SE1 undefined).
import { IsSEPlaying as _isSEPlaying } from './decomp-globals';

// ─── Types + state ───────────────────────────────────────────────────────────

interface MenuItem {
  /** Texte affiché (= déjà résolu en FR, pas de placeholder à expand). */
  label: string;
  /** Action handler. Return true si le menu doit se fermer après. */
  onSelect: () => boolean;
}

type SubState =
  | 'menu'                  // main menu : nav + select
  | 'msg_wait'              // showing dialog ; wait for A/B → close dialog → return to menu
  | 'msg_close'             // showing dialog ; wait for A/B → close dialog AND close menu
  | 'save_confirm'          // showing "Sauvegarder?" dialog ; once printer done → spawn Yes/No
  | 'save_yesno'            // Yes/No menu open ; wait input
  | 'save_overwrite_msg'    // showing "Une partie déjà sauvegardée. Remplacer?" dialog ; printer done → spawn Yes/No
  | 'save_overwrite_yesno'  // Yes/No menu open for overwrite confirm
  | 'save_saving_msg'       // showing "SAUVEGARDE EN COURS…" ; printer done → gameState.save() + show "X a sauvegardé."
  | 'save_done'             // showing "X a sauvegardé." ; printer done → PlaySE(SE_SAVE) + wait SE done → close
  | 'bag_screen'            // session 127 : bag UI ouvert, drive via TickBagScreen
  | 'party_screen'          // session 127 : party UI ouvert, drive via TickPartyScreen
  | 'trainer_card_screen'   // session 127 : trainer card UI ouvert
  | 'pokedex_screen'        // session 127 : pokédex UI ouvert
  | 'fading_to_screen';     // 1:1 décomp HandleStartMenuInput : fade-to-black actif,
                            // attend !gPaletteFade.active puis exécute sPendingScreenAction

let sIsOpen = false;
let sWindowId = -1;
let sCursorPos = 0;
let sItems: MenuItem[] = [];
let sSubState: SubState = 'menu';
/** 1:1 décomp `HandleStartMenuInput` : action queue pendant le fade-to-black.
 *  Décomp set `gMenuCallback = sStartMenuItems[i].func`, la callback est ré-appelée
 *  chaque frame jusqu'à `!gPaletteFade.active`. Nous on capture l'action ici. */
let sPendingScreenAction: (() => void) | null = null;

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

const SE_SELECT_FALLBACK = 5;
const SE_WIN_OPEN_FALLBACK = 6;
// 1:1 décomp `include/constants/songs.h` SE_SAVE = 55. Joué par
// SaveSuccessCallback (start_menu.c:1116) après le message "X a sauvegardé".
const SE_SAVE = 55;
const A_BUTTON = 0x01;
const B_BUTTON = 0x02;
const START_BUTTON = 0x08;
const DPAD_UP = 0x40;
const DPAD_DOWN = 0x80;

// 1:1 décomp menu.c:25-27 :
//   #define STD_WINDOW_PALETTE_NUM 14   ← border palette (cadre du menu)
//   #define STD_WINDOW_BASE_TILE_NUM 0x214 ← VRAM base tile pour les 16 tuiles du cadre
// La palette 14 est chargée par LoadUserWindowBorderGfx (= styled selon
// gSaveBlock2Ptr->optionsWindowFrameType, défaut option = 0).
//
//   #define DLG_WINDOW_PALETTE_NUM 15   ← palette des window pixel buffers
// Les windowTemplate.paletteNum = 15 fait que le text printer rend en couleurs
// std (= white bg index 1, black text index 2, gray shadow 3) sur palette 15.
//
// Bug fix session 122 : on utilisait 13 partout, ce qui matchait la palette
// du HUD overworld (= sprite player) → menu rendait avec les couleurs character.
const STD_WINDOW_PALETTE_NUM = 14;
const STD_WINDOW_BASE_TILE_NUM = 0x214;
const DLG_WINDOW_PALETTE_NUM  = 15;

// Window template Yes/No save dialog : 1:1 décomp menu.c:98-107 sYesNo_WindowTemplates.
const YESNO_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0,
  tilemapLeft: 21,
  tilemapTop: 9,
  width: 5,
  height: 4,
  paletteNum: DLG_WINDOW_PALETTE_NUM,
  baseBlock: 0x125,        // 1:1 décomp menu.c:106
};

// 1:1 décomp menu.c:493 `AddWindowParameterized(0, 22, 1, 7, (numActions*2)+2, 15, 0x139)`.
function buildStartMenuTemplate(numItems: number): WindowTemplate {
  return {
    bg: 0,
    tilemapLeft: 22,
    tilemapTop: 1,
    width: 7,
    height: numItems * 2 + 2,  // 1:1 décomp : +2 pour top/bottom border row
    paletteNum: DLG_WINDOW_PALETTE_NUM,
    baseBlock: 0x139,           // 1:1 décomp : pixel buffer baseBlock (avant 0x214 std frame)
  };
}

const CURSOR_CHAR = '▶';
/** 1:1 décomp `InitMenuNormal(... left=0, top=9, cursorHeight=16, ...)`
 *  (start_menu.c:511 + menu.c:927). Cursor + text X=0/8 left, Y commence à
 *  9 (= top padding window) + index * 16 (= optionHeight). */
const CURSOR_X = 0;
const CURSOR_Y_TOP = 9;        // 1:1 décomp menu.c:927 InitMenuNormal `top` arg
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
    CURSOR_X, CURSOR_Y_TOP + sCursorPos * CURSOR_Y_PER_ROW,
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

/** POKéDEX action : ouvre vraie UI Pokédex (compteurs + stats).
 *  Session 127 : remplace le `showMessageThenReturn` par pokedex-screen. */
function pokedexAction(): boolean {
  if (!gameState.hasFlag('FLAG_SYS_POKEDEX_GET')) {
    return showMessageThenReturn('Le POKéDEX n\'est pas\nencore disponible.');
  }
  if (sWindowId >= 0) {
    ClearStdWindowAndFrame(sWindowId, true);
    RemoveWindow(sWindowId);
    sWindowId = -1;
  }
  sSubState = 'pokedex_screen';
  try {
    OpenPokedexScreen(() => {
      sSubState = 'menu';
      _spawnMenuWindow();
    });
  } catch (e) {
    console.error('[start-menu] OpenPokedexScreen failed', e);
    sSubState = 'menu';
    _spawnMenuWindow();
  }
  return false;
}

/** POKéMON action : ouvre vraie UI party avec slots + moves + HP color-coded.
 *  Session 127 : remplace l'ancien `showMessageThenReturn` text par le party-screen. */
/** POKéMON action — 1:1 décomp `HandleStartMenuInput` + `StartMenuPokemonCallback`
 *  (start_menu.c:759) : FadeScreen(FADE_TO_BLACK, 0) + queue OpenPartyScreen.
 *  Pattern identique au sac/trainer-card (= CB2 swap). */
function pokemonAction(): boolean {
  if (gameState.party.length === 0) {
    return showMessageThenReturn('Vous n\'avez pas\nencore de POKéMON.');
  }
  FadeScreen(FADE_TO_BLACK, 0);
  sPendingScreenAction = () => OpenPartyScreen();
  sSubState = 'fading_to_screen';
  return false;
}

/** SAC action — 1:1 décomp `StartMenuBagCallback` (start_menu.c:763) :
 *
 *    if (!gPaletteFade.active) {
 *        PlayRainStoppingSoundEffect();
 *        RemoveExtraStartMenuWindows();
 *        gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu;
 *        SetMainCallback2(CB2_BagMenuFromStartMenu);
 *        return TRUE;
 *    }
 *    return FALSE;
 *
 *  Session 129 refactor : passage CB2 scene swap proper 1:1 décomp. L'OW arrête
 *  de tick pendant le bag (= plus de hacks save/restore VRAM / hook
 *  _syncSubspriteOam / setFieldCameraSuspended). Le retour passe par
 *  CB2_ReturnToFieldWithOpenMenu_Manual qui re-init OW + reopen start menu
 *  via FieldCB chain. Cf. bag-screen.ts CB2_InitBagMenu state machine. */
function sacAction(): boolean {
  // 1:1 décomp `HandleStartMenuInput` (start_menu.c:336) :
  //     FadeScreen(FADE_TO_BLACK, 0);  // = BeginNormalPaletteFade(ALL, 0, 0, 16, RGB_BLACK)
  //     gMenuCallback = StartMenuBagCallback;
  //
  // Puis `StartMenuBagCallback` attend `!gPaletteFade.active` avant de
  // `SetMainCallback2(CB2_BagMenuFromStartMenu)`. Sans ce fade-out, le user
  // voit les NPCs/player disparaître à state 4 ResetSpriteData AVANT que
  // l'écran soit noir → "frame cheloue" feedback session 129.
  //
  // Notre version : start fade-out + queue OpenBagScreen + attend dans
  // _tickFadingToScreen jusqu'à fade fini.
  // = équivalent à `FadeScreen(FADE_TO_BLACK, 0)` (= field_weather.c).
  FadeScreen(FADE_TO_BLACK, 0);
  sPendingScreenAction = () => OpenBagScreen();
  sSubState = 'fading_to_screen';
  return false;  // ne pas close start menu yet ; on attend fade fini.
}

/** {PLAYER} action — 1:1 décomp `HandleStartMenuInput` + `StartMenuPlayerCallback`
 *  (start_menu.c:797-811) :
 *      FadeScreen(FADE_TO_BLACK, 0);
 *      gMenuCallback = StartMenuPlayerCallback;
 *
 *  Puis `StartMenuPlayerCallback` attend `!gPaletteFade.active` avant de
 *  `SetMainCallback2(CB2_TrainerCard)` via ShowPlayerTrainerCard.
 *
 *  Notre version : pattern identique au sac (= fade-to-black + queue
 *  OpenTrainerCardScreen + attend dans _tickFadingToScreen). */
function playerCardAction(): boolean {
  FadeScreen(FADE_TO_BLACK, 0);
  sPendingScreenAction = () => OpenTrainerCardScreen();
  sSubState = 'fading_to_screen';
  return false;
}

/** 1:1 décomp start_menu.c:1332-1393 ShowSaveInfoWindow.
 *
 *  Window template 1:1 décomp start_menu.c:226-234 sSaveInfoWindowTemplate :
 *    bg=0, tilemapLeft=1, tilemapTop=1, width=14, height=10, paletteNum=15, baseBlock=8.
 *    height -= 2 si FLAG_SYS_POKEDEX_GET pas set.
 *
 *  Layout :
 *    - Region name (= "BOURG-EN-VOL") at y=1 — TEXT_COLOR_GREEN
 *    - JOUEUR + name (right-aligned x=0x70) at y=17 — color RED si Female, BLUE si Male
 *    - BADGES + count (right-aligned x=0x70) at y=33 — color RED/BLUE
 *    - POKéDEX + count (right-aligned x=0x70) at y=49 — only si FLAG_SYS_POKEDEX_GET
 *    - DUREE JEU + HH:MM (right-aligned x=0x70) at y=49/65 — color RED/BLUE
 *
 *  TEXT_DYNAMIC_COLOR enum (= 1:1 décomp characters.h) :
 *    TEXT_COLOR_GREEN = 6, TEXT_COLOR_BLUE = 8, TEXT_COLOR_RED = 4. */
let sSaveInfoWindowId = -1;

function _showSaveInfoWindow(): void {
  const hasDex = FlagGet('FLAG_SYS_POKEDEX_GET');
  // 1:1 décomp : height -= 2 si pas de dex.
  const height = hasDex ? 10 : 8;
  const tmpl: WindowTemplate = {
    bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 14, height,
    paletteNum: 15, baseBlock: 8,
  };
  sSaveInfoWindowId = AddWindow(tmpl);
  // 1:1 décomp DrawStdWindowFrame avec STD_WINDOW_BASE_TILE_NUM=0x214, palette=14.
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(sSaveInfoWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM);

  const sb2 = gSaveBlock2Ptr as Record<string, unknown>;
  const playerName = String(sb2.playerName ?? 'PLAYER');
  const isFemale = (sb2.playerGender ?? 0) === 1;
  // 1:1 décomp : RED si Female, BLUE si Male.
  const TEXT_COLOR_RED = 4;
  const TEXT_COLOR_BLUE = 8;
  const TEXT_COLOR_GREEN = 6;
  const colorPlayer = isFemale ? TEXT_COLOR_RED : TEXT_COLOR_BLUE;
  // colorArray = [bgColor, fgColor, shadowColor]. fgColor = colorPlayer (= dynamique).
  const colorMain: readonly number[] = [1, colorPlayer, 3];
  const colorRegion: readonly number[] = [1, TEXT_COLOR_GREEN, 3];

  const FONT_NORMAL = 1;
  const TEXT_SKIP_DRAW = 255;

  // Region name — y=1.
  const regionName = getMapNameFr(gMapHeader?.regionMapSectionId);
  AddTextPrinterParameterized3(sSaveInfoWindowId, FONT_NORMAL, 0, 1, colorRegion, TEXT_SKIP_DRAW, regionName);

  // 1:1 décomp `gText_SavingDontTurnOff` / `gText_PlayerSavedGame` use `gText_*`
  // pour leurs labels (= strings.json). Notre code utilise `getString()` pour
  // lookup ces gText_* et fallback au littéral si pas dans strings.json.
  // JOUEUR + name — y=17. Décomp = `gText_ContinueMenuPlayer` (= "JOUEUR").
  let yOffset = 17;
  AddTextPrinterParameterized3(sSaveInfoWindowId, FONT_NORMAL, 0, yOffset, colorMain, TEXT_SKIP_DRAW,
    getString('gText_ContinueMenuPlayer'));
  AddTextPrinterParameterized3(
    sSaveInfoWindowId, FONT_NORMAL,
    GetStringRightAlignXOffset(playerName, 0x70), yOffset,
    colorMain, TEXT_SKIP_DRAW, playerName,
  );

  // BADGES + count — y=33. Décomp = `gText_ContinueMenuBadges` (= "BADGES").
  yOffset += 16;
  AddTextPrinterParameterized3(sSaveInfoWindowId, FONT_NORMAL, 0, yOffset, colorMain, TEXT_SKIP_DRAW,
    getString('gText_ContinueMenuBadges'));
  let badgeCount = 0;
  for (const fname of ['FLAG_BADGE01_GET','FLAG_BADGE02_GET','FLAG_BADGE03_GET','FLAG_BADGE04_GET',
                        'FLAG_BADGE05_GET','FLAG_BADGE06_GET','FLAG_BADGE07_GET','FLAG_BADGE08_GET']) {
    if (FlagGet(fname)) badgeCount++;
  }
  const badgeStr = String(badgeCount);
  AddTextPrinterParameterized3(
    sSaveInfoWindowId, FONT_NORMAL,
    GetStringRightAlignXOffset(badgeStr, 0x70), yOffset,
    colorMain, TEXT_SKIP_DRAW, badgeStr,
  );

  // POKéDEX + count — y=49 (only if FLAG_SYS_POKEDEX_GET).
  // Décomp = `gText_ContinueMenuPokedex` (= "POKéDEX").
  if (hasDex) {
    yOffset += 16;
    AddTextPrinterParameterized3(sSaveInfoWindowId, FONT_NORMAL, 0, yOffset, colorMain, TEXT_SKIP_DRAW,
      getString('gText_ContinueMenuPokedex'));
    // 1:1 décomp menu.c:2122-2127 BufferSaveMenuText case SAVE_MENU_CAUGHT :
    //   if (IsNationalPokedexEnabled())
    //       string = GetNationalPokedexCount(FLAG_GET_CAUGHT);
    //   else
    //       string = GetHoennPokedexCount(FLAG_GET_CAUGHT);
    // Ancien : dexStr = '0' hardcoded. Maintenant : compte réel via Pokédex
    // backbone (= pokedex-flags.ts GetSetPokedexFlag, déjà 1:1 validé).
    const dexCount = IsNationalPokedexEnabled()
      ? GetNationalPokedexCount(FLAG_GET_CAUGHT)
      : GetHoennPokedexCount(FLAG_GET_CAUGHT);
    const dexStr = String(dexCount);
    AddTextPrinterParameterized3(
      sSaveInfoWindowId, FONT_NORMAL,
      GetStringRightAlignXOffset(dexStr, 0x70), yOffset,
      colorMain, TEXT_SKIP_DRAW, dexStr,
    );
  }

  // DUREE JEU + HH:MM — y=49 (no dex) ou 65 (with dex).
  // Décomp = `gText_ContinueMenuTime` (= "DUREE JEU").
  yOffset += 16;
  AddTextPrinterParameterized3(sSaveInfoWindowId, FONT_NORMAL, 0, yOffset, colorMain, TEXT_SKIP_DRAW,
    getString('gText_ContinueMenuTime'));
  const hours = Number(sb2.playTimeHours ?? 0);
  const minutes = Number(sb2.playTimeMinutes ?? 0);
  const timeStr = `${hours}:${String(minutes).padStart(2, '0')}`;
  AddTextPrinterParameterized3(
    sSaveInfoWindowId, FONT_NORMAL,
    GetStringRightAlignXOffset(timeStr, 0x70), yOffset,
    colorMain, TEXT_SKIP_DRAW, timeStr,
  );
}

function _removeSaveInfoWindow(): void {
  if (sSaveInfoWindowId < 0) return;
  ClearStdWindowAndFrame(sSaveInfoWindowId, true);
  RemoveWindow(sSaveInfoWindowId);
  sSaveInfoWindowId = -1;
}

/** SAUVER action : 1:1 décomp start_menu.c:982 — ShowSaveInfoWindow + dialog
 *  "Voulez-vous sauvegarder la partie?" + Yes/No menu.
 *
 *  ⚠️ 1:1 décomp `SaveStartCallback` (start_menu.c:808) ferme le start menu
 *  AVANT d'afficher le save info window. Sinon le menu reste visible derrière
 *  le dialog (= bug user report 2026-05-10). On hide le start menu window ici
 *  mais on garde sIsOpen=true pour que `TickStartMenu` drive le save flow. */
function saveAction(): boolean {
  // Hide start menu window (= ClearStdWindowAndFrame + RemoveWindow), mais
  // keep sIsOpen et sSubState pour driver le flow save_confirm/yesno/done.
  if (sWindowId >= 0) {
    ClearStdWindowAndFrame(sWindowId, true);
    RemoveWindow(sWindowId);
    sWindowId = -1;
  }
  _showSaveInfoWindow();
  // 1:1 décomp gText_ConfirmSave (= save.inc:2). Fallback hardcoded if texts
  // not loaded (= edge case before _common.json fetched).
  const text = getText('gText_ConfirmSave') ?? 'Voulez-vous sauvegarder la partie?';
  ShowFieldMessage(text + '$');
  sSubState = 'save_confirm';
  return false;
}

/** OPTIONS action — 1:1 décomp `StartMenuOptionCallback` (start_menu.c:484) :
 *
 *    if (!gPaletteFade.active) {
 *        PlayRainStoppingSoundEffect();
 *        RemoveExtraStartMenuWindows();
 *        CleanupOverworldWindowsAndTilemaps();
 *        SetMainCallback2(CB2_InitOptionMenu);
 *        gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu;
 *        return TRUE;
 *    }
 *
 *  On preload les assets options (= textWindow frames + sOptionMenuText_Pal),
 *  reset gMain.state à 0, set savedCallback = CB2_ReturnToFieldWithOpenMenu,
 *  puis SetMainCallback2(CB2_InitOptionMenu) qui prend le relais. */
function optionsAction(): boolean {
  // 1:1 décomp `HandleStartMenuInput` (start_menu.c:336) + `StartMenuOptionCallback` :
  //     FadeScreen(FADE_TO_BLACK, 0);  // = BeginNormalPaletteFade(ALL, 0, 0, 16, RGB_BLACK)
  //     gMenuCallback = StartMenuOptionCallback;
  //   StartMenuOptionCallback (start_menu.c:731-745) :
  //     if (!gPaletteFade.active) {
  //       PlayRainStoppingSoundEffect();
  //       RemoveExtraStartMenuWindows();
  //       CleanupOverworldWindowsAndTilemaps();
  //       SetMainCallback2(CB2_InitOptionMenu);
  //       gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu;
  //       return TRUE;
  //     }
  //     return FALSE;
  //
  // Notre version : start fade-out + queue action + attend dans _tickFadingToScreen.
  // Sans fade-to-black préalable, on voit les NPCs/player disparaître au state
  // 2 de CB2_InitOptionMenu (ResetSpriteData) AVANT que screen soit noir.
  // = équivalent à `FadeScreen(FADE_TO_BLACK, 0)` (= field_weather.c).
  FadeScreen(FADE_TO_BLACK, 0);
  sPendingScreenAction = () => {
    const rt = getRuntime();
    if (!rt) return;
    void preloadOptionMenuAssets().then(() => {
      gMain.state = 0;
      // 1:1 décomp gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu, mais on
      // utilise notre wrapper TS (option-menu-return.ts) car le auto-fichier
      // CB2_ReturnToFieldLocal est broken (transpiler ne supporte pas u8 *state
      // pointer arg). Notre version reproduit la state machine 1:1 avec
      // gMain.state mutable.
      gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
      rt.SetMainCallback2(CB2_InitOptionMenu);
    });
  };
  sSubState = 'fading_to_screen';
  return false;  // ne pas close start menu yet ; on attend fade fini.
}

// ─── Build items list ────────────────────────────────────────────────────────

/** 1:1 décomp `BuildNormalStartMenu()` (start_menu.c:315) :
 *
 *    if (FlagGet(FLAG_SYS_POKEDEX_GET)) AddStartMenuAction(MENU_ACTION_POKEDEX);
 *    if (FlagGet(FLAG_SYS_POKEMON_GET)) AddStartMenuAction(MENU_ACTION_POKEMON);
 *    AddStartMenuAction(MENU_ACTION_BAG);
 *    if (FlagGet(FLAG_SYS_POKENAV_GET)) AddStartMenuAction(MENU_ACTION_POKENAV);
 *    AddStartMenuAction(MENU_ACTION_PLAYER);
 *    AddStartMenuAction(MENU_ACTION_SAVE);
 *    AddStartMenuAction(MENU_ACTION_OPTION);
 *    AddStartMenuAction(MENU_ACTION_EXIT);
 *
 *  Donc en early game (= dans le truck, FLAG_SYS_POKEMON_GET et
 *  FLAG_SYS_POKEDEX_GET pas set), le menu montre seulement :
 *    SAC, PLAYER, SAUVER, OPTIONS, RETOUR
 *
 *  Pokémon entry débloquée par 1ère capture starter (FLAG_SYS_POKEMON_GET).
 *  Pokédex entry débloquée par le Prof Birch (FLAG_SYS_POKEDEX_GET).
 *  PokéNav entry débloquée plus tard (= post-Devon Goods, FLAG_SYS_POKENAV_GET). */
function buildItems(): MenuItem[] {
  // 1:1 décomp `BuildNormalStartMenu` + `sStartMenuItems` :
  //   Labels viennent de strings.json (= 1:1 décomp `src/strings.c`).
  //   getString() retourne le label FR depuis strings.json :
  //     gText_MenuPokedex   = "POKéDEX"
  //     gText_MenuPokemon   = "POKéMON"
  //     gText_MenuBag       = "SAC"
  //     gText_MenuOption    = "OPTIONS"
  //     gText_MenuExit      = "RETOUR"
  //     gText_MenuSave      = "SAUVER"
  //   Pour PokéNav, le décomp utilise `gText_MenuOptionPokenav` (= "POKéNAV").
  //   {PLAYER} (= entry trainer card) → décomp expand `gText_MenuPlayer` =
  //     "{PLAYER}" via StringExpandPlaceholders ; nous on resolve direct via
  //     gameState.playerName car notre AddTextPrinter ne fait pas l'expand.
  const items: MenuItem[] = [];
  if (FlagGet('FLAG_SYS_POKEDEX_GET')) {
    items.push({ label: getString('gText_MenuPokedex'), onSelect: pokedexAction });
  }
  if (FlagGet('FLAG_SYS_POKEMON_GET')) {
    items.push({ label: getString('gText_MenuPokemon'), onSelect: pokemonAction });
  }
  items.push({ label: getString('gText_MenuBag'), onSelect: sacAction });
  if (FlagGet('FLAG_SYS_POKENAV_GET')) {
    items.push({ label: getString('gText_MenuOptionPokenav'), onSelect: pokenavAction });
  }
  // {PLAYER} entry : décomp expand placeholder, nous on resolve direct.
  items.push({ label: gameState.playerName, onSelect: playerCardAction });
  items.push({ label: getString('gText_MenuSave'), onSelect: saveAction });
  items.push({ label: getString('gText_MenuOption'), onSelect: optionsAction });
  items.push({ label: getString('gText_MenuExit'), onSelect: () => true });
  return items;
}

/** POKéNAV action : stub — le PokéNav n'est pas implémenté MVP. */
function pokenavAction(): boolean {
  return showMessageThenReturn('Le POKéNAV n\'est pas\nencore disponible.');
}

/** Spawn la window principale du start menu et la draw avec items + cursor.
 *  1:1 décomp pattern de start_menu.c:CreateStartMenuTask + DrawStartMenu. */
function _spawnMenuWindow(): void {
  const tmpl = buildStartMenuTemplate(sItems.length);
  sWindowId = AddWindow(tmpl);
  // 1:1 décomp `LoadMessageBoxAndBorderGfx()` (menu.c:210-214) qui charge :
  //   LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(15))
  //   LoadUserWindowBorderGfx_(0, STD_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(14))
  // Sans ça, palette 15 noire ou 14 stale. Cf. _redrawMenu.
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(sWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM);
  for (let i = 0; i < sItems.length; i++) {
    AddTextPrinterParameterized3(
      sWindowId, 1 /* FONT_NORMAL */,
      8, CURSOR_Y_TOP + i * CURSOR_Y_PER_ROW,
      [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, sItems[i].label,
    );
  }
  drawCursor();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function IsStartMenuOpen(): boolean {
  return sIsOpen;
}

export function OpenStartMenu(): void {
  if (sIsOpen) return;
  // Bug fix session 122 : si le map-name popup est encore visible (= player
  // a appuyé Start dans la fenêtre de 2.7s du popup), on doit le dismiss
  // AVANT d'ouvrir le start menu. Sinon les frame tiles 0x21D..0x223 du
  // popup et de notre std frame (0x214..0x223) overlap → glitch visuel.
  // 1:1 décomp pattern : start_menu.c attend que le popup soit terminé
  // (= via gFieldStateFlags ou ScriptContext locked), ici on force juste
  // l'unload du popup avant ouverture.
  HideMapNamePopUpWindow();
  sItems = buildItems();
  // 1:1 décomp `sStartMenuCursorPos` (start_menu.c:83) — EWRAM_DATA static u8,
  // jamais reset entre opens. Le cursor est lu/écrit par InitStartMenuStep
  // case 5 : `sStartMenuCursorPos = InitMenuNormal(..., sStartMenuCursorPos)`.
  // Quand le user navigue UP/DOWN, sStartMenuCursorPos update ; quand il
  // ferme (selection ou EXIT), la valeur PERSISTE. À la prochaine ouverture,
  // le cursor reprend exactement la même position.
  // User-flag 2026-05-20 : "le vrai jeu retient où on était dans le menu".
  // Clamp à items.length-1 au cas où le menu a moins d'items (= early game
  // sans Pokédex/Pokémon → 5 items au lieu de 8).
  if (sCursorPos >= sItems.length) sCursorPos = sItems.length - 1;
  if (sCursorPos < 0) sCursorPos = 0;
  sSubState = 'menu';
  _spawnMenuWindow();
  LockPlayerFieldControls();
  // 1:1 décomp src/start_menu.c:581 ShowStartMenu :
  //   if (!IsOverworldLinkActive()) {
  //     FreezeObjectEvents();
  //     PlayerFreeze();
  //     StopPlayerAvatar();
  //   }
  // Freeze TOUS les NPCs immédiatement (= mid-step si nécessaire). Le player
  // est aussi frozen via LockPlayerFieldControls (= input bloqué). Les NPCs
  // restent figés pendant tout le menu + sous-menus (bag, party, etc.).
  // User report : "appuyer sur le bouton START freeze tous les NPC dans ce
  // menu ET ses sous-menus, même mid-step."
  void import('./object-events').then(({ FreezeObjectEvents }) => FreezeObjectEvents());
  sIsOpen = true;
  // 1:1 décomp : PlaySE(SE_WIN_OPEN) est joué dans `field_control_avatar.c:184`
  // au press START field, AVANT ShowStartMenu(). `ShowStartMenu` lui-même
  // (start_menu.c:581-591) ne joue AUCUN SE. Donc PlaySE est joué SEULEMENT au
  // press START field initial, PAS quand le menu re-open après un submenu
  // (= FieldCB_ReturnToFieldStartMenu chain qui appelle sm.open() silencieux).
  // User-flag 2026-05-20 : "Revenir en arrière depuis un sous menu du menu
  // start rejoue le SE alors que le menu est déjà ouvert" — fix : PlaySE
  // moved au caller TickStartMenu START button branch.
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
  // Cleanup SaveInfoWindow si encore ouverte (= safety net).
  _removeSaveInfoWindow();
  // Cleanup any open dialog.
  if (!IsFieldMessageBoxHidden()) HideFieldMessageBox();
  UnlockPlayerFieldControls();
  // 1:1 inverse de FreezeObjectEvents au open : tous les NPCs reprennent leur
  // mouvement normal au close du menu. Le player a déjà UnlockPlayerFieldControls
  // donc reprend ses inputs.
  void import('./object-events').then(({ UnfreezeAllNpcs }) => UnfreezeAllNpcs());
  sIsOpen = false;
  sSubState = 'menu';
  console.log('[start-menu] closed');
}

function _redrawMenu(): void {
  if (sWindowId < 0) return;
  // Re-load les 2 palettes 1:1 décomp `LoadMessageBoxAndBorderGfx` au cas où
  // un dialog post-action aurait écrasé palette 14/15 (= e.g. après save_done).
  LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, DLG_WINDOW_PALETTE_NUM * 16);
  LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  DrawStdFrameWithCustomTileAndPalette(sWindowId, true, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM);
  for (let i = 0; i < sItems.length; i++) {
    AddTextPrinterParameterized3(
      sWindowId, 1 /* FONT_NORMAL */,
      8, CURSOR_Y_TOP + i * CURSOR_Y_PER_ROW,
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
      // 1:1 décomp `ShowStartMenuCallback` (start_menu.c) — check
      // `ArePlayerFieldControlsLocked()` AVANT d'ouvrir. Sans ça, le user
      // peut START pendant Truck cinematic / scripted lock (= bug
      // user-flag : "Lorsque le camion roule, le menu start est ouvrable").
      // Le pattern global : tout consumer d'input field doit checker le
      // lock pour respecter le "retrait du contrôle joueur".
      if (ArePlayerFieldControlsLocked()) return;
      if (!IsFieldMessageBoxHidden()) return;
      // 1:1 décomp `field_control_avatar.c:182-187` :
      //     if (input->pressedStartButton) {
      //         PlaySE(SE_WIN_OPEN);
      //         ShowStartMenu();
      //         return TRUE;
      //     }
      // SE est joué ICI au caller PAS dans ShowStartMenu lui-même.
      PlaySE(_seWinOpen());
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
    case 'save_overwrite_msg':
      _tickSaveOverwriteMsg(newKeys);
      break;
    case 'save_overwrite_yesno':
      _tickSaveOverwriteYesNo();
      break;
    case 'save_saving_msg':
      _tickSaveSavingMsg();
      break;
    case 'save_done':
      _tickSaveDone(newKeys);
      break;
    case 'bag_screen':
      // Session 129 refactor : 'bag_screen' substate obsolète. Le bag est
      // maintenant standalone CB2 (= MainCB2_BagMenuRun). TickStartMenu ne
      // tourne pas pendant le bag (= MainCB2_Overworld est swap-out).
      // Cette branche est unreachable mais gardée comme sentinel pour safety.
      console.warn('[start-menu] bag_screen substate reached after CB2 refactor — should be unreachable');
      sSubState = 'menu';
      _spawnMenuWindow();
      break;
    case 'party_screen':
      TickPartyScreen(newKeys);
      break;
    case 'trainer_card_screen':
      TickTrainerCardScreen(newKeys);
      break;
    case 'pokedex_screen':
      TickPokedexScreen(newKeys);
      break;
    case 'fading_to_screen':
      _tickFadingToScreen();
      break;
  }
}

/** 1:1 décomp `StartMenuBagCallback` (start_menu.c:763) :
 *      if (!gPaletteFade.active) {
 *          PlayRainStoppingSoundEffect();
 *          RemoveExtraStartMenuWindows();
 *          CleanupOverworldWindowsAndTilemaps();
 *          SetMainCallback2(CB2_BagMenuFromStartMenu);
 *          return TRUE;
 *      }
 *      return FALSE;
 *
 *  Attend que le fade-to-black démarré par sacAction soit fini, puis exécute
 *  l'action queue (= OpenBagScreen qui swap CB2). Le `SetMainCallback2` se
 *  fait écran déjà noir → user ne voit pas le ResetSpriteData wipe sprites. */
function _tickFadingToScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;  // = `if (!gPaletteFade.active)` inversé
  const action = sPendingScreenAction;
  sPendingScreenAction = null;
  if (action) action();
  CloseStartMenu();  // = `DestroyStartMenu` post-callback return TRUE
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
    CreateYesNoMenu(YESNO_WINDOW_TEMPLATE, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, 0);
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
    // OUI → check si une save existe déjà → si oui, demander confirmation
    // de remplacement (= 1:1 décomp `SaveFileExistsCallback` start_menu.c:1034
    // qui affiche "Une partie est déjà sauvegardée. Voulez-vous la remplacer?")
    if (gameState.hasPersistedSave()) {
      HideFieldMessageBox();
      // 1:1 décomp gText_AlreadySavedFile (= save.inc:5-7).
      const text = getText('gText_AlreadySavedFile')
        ?? 'Il y a déjà une partie sauvegardée.\nVoulez-vous la remplacer?';
      ShowFieldMessage(text + '$');
      sSubState = 'save_overwrite_msg';
    } else {
      // Pas de save existante → save direct.
      _doSave();
    }
  } else {
    // NON ou B → cancel save, fully close start menu (= 1:1 décomp
    // `SaveDialogCB_Cancel` clear save info window + close start menu, retour
    // overworld. Pas de retour au start menu).
    _removeSaveInfoWindow();
    HideFieldMessageBox();
    CloseStartMenu();
  }
}

function _tickSaveOverwriteMsg(newKeys: number): void {
  // Wait for "Une partie est déjà sauvegardée..." printer done, THEN show Yes/No menu.
  const dialogDone = GetFieldMessageBoxMode() === FIELD_MESSAGE_BOX_HIDDEN;
  if (!dialogDone) return;
  if (GetYesNoWindowId() < 0) {
    CreateYesNoMenu(YESNO_WINDOW_TEMPLATE, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM, 0);
    sSubState = 'save_overwrite_yesno';
    return;
  }
  void newKeys;
}

function _tickSaveOverwriteYesNo(): void {
  const result = Menu_ProcessInputNoWrapClearOnChoose();
  if (result === -2) return;
  if (result === 0) {
    // OUI → save par-dessus l'existant.
    _doSave();
  } else {
    // NON ou B → cancel save, fully close start menu.
    _removeSaveInfoWindow();
    HideFieldMessageBox();
    CloseStartMenu();
  }
}

/** Démarre le flow save 1:1 décomp `SaveSavingMessageCallback` (start_menu.c:1080) :
 *  1. ShowSaveMessage(gText_SavingDontTurnOff = "SAUVEGARDE EN COURS…\nN'ETEIGNEZ PAS LA CONSOLE.")
 *  2. → _tickSaveSavingMsg attend printer done puis TrySavingData + show gText_PlayerSavedGame
 *  3. → _tickSaveDone attend printer done puis PlaySE(SE_SAVE) + wait SE done + close. */
function _doSave(): void {
  HideFieldMessageBox();
  // 1:1 décomp gText_SavingDontTurnOff (= save.inc).
  const text = getText('gText_SavingDontTurnOff')
    ?? "SAUVEGARDE EN COURS…\nN'ETEIGNEZ PAS LA CONSOLE.";
  ShowFieldMessage(text + '$');
  sSubState = 'save_saving_msg';
}

// ─── Save flow 1:1 décomp `start_menu.c:884-1134` ──────────────────────────
//
// Architecture pattern décomp :
//   - `RunSaveCallback` (l.884-894) gate ALL callbacks par :
//       if (RunTextPrintersAndIsPrinter0Active() == TRUE) return SAVE_IN_PROGRESS;
//     = aucun callback ne run tant que le text printer du field message box
//     n'a pas fini de typer.
//   - `SaveDoSaveCallback` (l.1086-1109) : TrySavingData → ShowSaveMessage(
//     gText_PlayerSavedGame, SaveSuccessCallback) → SaveStartTimer (= 60).
//   - `SaveSuccessCallback` (l.1112-1121) : PlaySE(SE_SAVE) + switch callback
//     à SaveReturnSuccessCallback.
//   - `SaveReturnSuccessCallback` (l.1123-1134) :
//       if (!IsSEPlaying() && SaveSuccesTimer()) HideSaveInfoWindow + SUCCESS;
//   - `SaveSuccesTimer` (l.947-960) :
//       sSaveDialogTimer--;
//       if (JOY_HELD(A_BUTTON)) { PlaySE(SE_SELECT); return TRUE; }
//       if (sSaveDialogTimer == 0) return TRUE;
//       return FALSE;
//
// Adaptation web : remplace `RunTextPrintersAndIsPrinter0Active` par
// `GetFieldMessageBoxMode() === FIELD_MESSAGE_BOX_HIDDEN` (= notre field
// message box state machine setTrue HIDDEN dès `IsTextPrinterActive(sWindowId)
// false`, cf. field-message-box.ts:185-188). Pattern déjà utilisé dans
// _tickSaveConfirm (= preuve qu'il marche pour gater post-typing).
let _saveDoneSeStarted = false;
let _saveTimer = 0;  // 1:1 décomp sSaveDialogTimer (start_menu.c:89, u8)

/** 1:1 décomp `SaveDoSaveCallback` (start_menu.c:1086-1109). Gated par
 *  `RunSaveCallback`'s `IsTextPrinterActive(0)` check = équivalent à
 *  notre field message box mode === HIDDEN. */
function _tickSaveSavingMsg(): void {
  // Gate 1:1 RunSaveCallback : wait printer done.
  if (GetFieldMessageBoxMode() !== FIELD_MESSAGE_BOX_HIDDEN) return;
  // TrySavingData (= notre persist).
  gameState.save();
  // ShowSaveMessage(gText_PlayerSavedGame, SaveSuccessCallback) :
  const text = getText('gText_PlayerSavedGame') ?? '{PLAYER} a sauvegardé la partie.';
  ShowFieldMessage(text + '$');
  // SaveStartTimer : sSaveDialogTimer = 60.
  _saveTimer = 60;
  _saveDoneSeStarted = false;
  sSubState = 'save_done';
}

/** 1:1 décomp `SaveSuccessCallback` + `SaveReturnSuccessCallback` +
 *  `SaveSuccesTimer` (start_menu.c:1112-1134, 947-960). */
function _tickSaveDone(newKeys: number): void {
  void newKeys;
  // Gate 1:1 RunSaveCallback : printer 0 not active = field message box mode HIDDEN.
  if (GetFieldMessageBoxMode() !== FIELD_MESSAGE_BOX_HIDDEN) return;
  // Étape 1 : `SaveSuccessCallback` — PlaySE(SE_SAVE) une fois quand printer done.
  if (!_saveDoneSeStarted) {
    void import('./decomp-globals').then(({ PlaySE }) => PlaySE(SE_SAVE));
    _saveDoneSeStarted = true;
    return;  // décomp switche le callback à SaveReturnSuccessCallback ; on attend next frame.
  }
  // Étape 2 : `SaveReturnSuccessCallback` — wait `!IsSEPlaying() && SaveSuccesTimer()`.
  // 1:1 SaveSuccesTimer décomp : decrement timer u8 wrap, JOY_HELD(A) → PlaySE
  // (SE_SELECT) + TRUE, timer === 0 → TRUE.
  //
  // ⚠️ DIVERGENCE user-flag 2026-05-20 (assumée) :
  //   1. Clamp timer à 0 au lieu de u8 wrap. Le wrap (= 0 → 255) ajoute +255
  //      frames d'attente si SE_SAVE prend plus de 60 frames à finir → fenêtre
  //      "prend bien trop de temps à disparaître". Décomp 1:1 a la même quirk
  //      mais c'est rarement triggered car SE_SAVE GBA est court (~30 frames).
  //      Notre SE_SAVE.mid via spessasynth peut être plus long → wrap visible.
  //   2. Retire le JOY_HELD(A) PlaySE(SE_SELECT) + skip. User-flag :
  //      "les contrôles doivent être bloqués pendant la pause exprès".
  //      La pause anti-corruption doit être SILENCIEUSE et non-skippable.
  //      Décomp 1:1 plays SE_SELECT chaque frame A held — spam audio +
  //      court-circuite la sécurité. User préfère block strict.
  if (_saveTimer > 0) _saveTimer--;
  if (_saveTimer !== 0) return;
  if (_isSEPlaying()) return;
  // Both TRUE → HideSaveInfoWindow + SAVE_SUCCESS → close start menu.
  _removeSaveInfoWindow();
  HideFieldMessageBox();
  _saveDoneSeStarted = false;
  _saveTimer = 0;
  CloseStartMenu();
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).startMenu = {
    open: OpenStartMenu,
    close: CloseStartMenu,
    isOpen: IsStartMenuOpen,
  };
}

/**
 * gba-menu-system.ts
 * ------------------
 * Helpers menu GENERIQUES + persistence saveBlock. Tout ce qui est
 * spécifique main_menu.c vit dans `main-menu-impl.ts` (= split Phase C
 * audit session 83 pour respecter directive #1 "foundations unifiées").
 *
 * Architecture :
 *   - Constantes input keys (A_BUTTON, B_BUTTON, DPAD_*) — partagées
 *   - Menu cursor input générique (Menu_ProcessInputNoWrapClearOnChoose,
 *     Menu_GetCursorPos, InitMenuInUpperLeftCornerNormal)
 *   - Yes/No menu stubs (CreateYesNoMenuParameterized, CreateYesNoMenu)
 *   - Misc generic stubs (IsWirelessAdapterConnected, IsMysteryGiftEnabled,
 *     CanResetRTC, RtcGetErrorStatus, PlayBGM bridge)
 *   - gSaveBlock1Ptr / gSaveBlock2Ptr Proxy auto-persistant localStorage
 *   - gSaveFileStatus mutable global
 */
import { getRuntime, m4aSongNumStart, PlaySE, LoadPalette } from './decomp-globals';
import { PLTT_SIZE_4BPP } from './decomp-bridge';
import { AddWindow, DrawStdFrameWithCustomTileAndPalette, FillWindowPixelRect, CopyWindowToVram, ClearStdWindowAndFrame, RemoveWindow, type WindowTemplate } from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { getString } from './gba-strings';

/** 1:1 décomp `ListMenuLoadStdPalAt` (menu.c:2077) : palId → gMenuInfo
 *  Elements{1,2,3}_Pal → LoadPalette(pal, palOffset, PLTT_SIZE_4BPP).
 *  Les symboles sont résolus via assetCache (LoadPalette(string)) — le
 *  consommateur précharge les .pal (interface/menu_info{1,2,3}.pal,
 *  copies décomp byte-identiques). Fonction PARTAGÉE menu.c (bag, union
 *  room…) → sa maison = ici (≠ bag-menu local). */
export function ListMenuLoadStdPalAt(palOffset: number, palId: number): void {
  let palette: string;
  switch (palId) {
    case 0:
    default:
      palette = 'gMenuInfoElements1_Pal';
      break;
    case 1:
      palette = 'gMenuInfoElements2_Pal';
      break;
    case 2:
      palette = 'gMenuInfoElements3_Pal';
      break;
  }
  LoadPalette(palette, palOffset, PLTT_SIZE_4BPP);
}

// 1:1 décomp include/constants/songs.h:11 : SE_SELECT = 5.
const SE_SELECT_KEY = 5;
// 1:1 décomp src/menu.c:945 : `gText_SelectorArrow3 = _("▶")` — cursor glyph.
const CURSOR_CHAR = '▶';
// Constantes layout cursor :
//   x = 0 : aligné sur bord gauche du window (= 1:1 décomp sMenu.left).
//   yPerRow = 16 : LINE_HEIGHT (14) + 2 (= 1:1 décomp menu.c:945 maxLetterHeight + 2).
//   width/height = 8 / 16 : taille du glyph cursor à clear.
const CURSOR_X = 0;
const CURSOR_Y_PER_ROW = 16;
const CURSOR_WIDTH = 8;
const CURSOR_HEIGHT = 16;

// ─── Menu cursor state ───────────────────────────────────────────────────────

let menuCursorPos = 0;
let menuNumItems = 0;
let menuActive = false;
let menuWindowId = -1;  // -1 = no menu active. Utilisé par drawMenuCursor/clearMenuCursor.

// ─── Input keys (= shared with main-menu-impl.ts) ────────────────────────────

export const A_BUTTON = 0x01;
export const B_BUTTON = 0x02;
export const DPAD_UP = 0x40;
export const DPAD_DOWN = 0x80;

// ─── Menu_ProcessInputNoWrap + variants ─────────────────────────────────────
//
// 1:1 décomp menu.c:
//   Menu_ProcessInputNoWrap()                  → returns selection, no cleanup
//   Menu_ProcessInputNoWrapClearOnChoose()     → returns selection + EraseYesNoWindow
//
// Différence critique : ProcessInputNoWrap (sans Clear) NE TOUCHE PAS au
// window. Caller décide quand cleanup. Utilisé par NewGameBirchSpeech_
// ProcessGenderMenuInput où le menu gender doit RESTER visible même si
// user press B (= no cancel from gender selection 1:1 décomp). Avant on
// avait QUE la variante Clear → B press effaçait le gender menu → freeze.

/** Internal core : process newKeys, update cursor, return selection.
 *  Param `eraseOnSelect` : si true, call EraseYesNoWindow on A/B (= Clear variant).
 *
 *  ⚠️ Décomp `Menu_ProcessInputNoWrap` ne TOUCHE PAS l'état du menu sur A/B
 *  (= juste return). Notre `menuActive=false` était une divergence qui
 *  CASSAIT le re-process : Task_NewGameBirchSpeech_ChooseGender re-call
 *  ProcessInputNoWrap chaque frame ; après B press, menuActive=false →
 *  return -1 sans process input → user ne peut plus rien faire (= softlock
 *  visible, menu reste affiché mais inerte).
 *
 *  Fix : ne set menuActive=false QUE pour la variante Clear (= window
 *  destroyed by EraseYesNoWindow → next call must abort). Pour la variante
 *  no-Clear (= gender menu), on laisse menuActive=true. */
function _processMenuInput(eraseOnSelect: boolean): number {
  if (!menuActive) return -1;
  const newKeys = getRuntime()?.gMain.newKeys ?? 0;

  if (newKeys & A_BUTTON) {
    if (eraseOnSelect) {
      menuActive = false;
      clearMenuCursor();
      EraseYesNoWindow();
    }
    return menuCursorPos;
  }
  if (newKeys & B_BUTTON) {
    if (eraseOnSelect) {
      menuActive = false;
      clearMenuCursor();
      EraseYesNoWindow();
    }
    return -1; // MENU_B_PRESSED
  }
  if (newKeys & DPAD_UP) {
    if (menuCursorPos > 0) {
      // 1:1 décomp menu.c:945 ChangeListMenuPos → erase old + draw new + SE_SELECT.
      clearMenuCursor();
      menuCursorPos--;
      drawMenuCursor();
      PlaySE(SE_SELECT_KEY);
    }
  }
  if (newKeys & DPAD_DOWN) {
    if (menuCursorPos < menuNumItems - 1) {
      clearMenuCursor();
      menuCursorPos++;
      drawMenuCursor();
      PlaySE(SE_SELECT_KEY);
    }
  }
  return -2; // still processing
}

/** 1:1 décomp menu.c:Menu_ProcessInputNoWrap — same as ClearOnChoose but
 *  WITHOUT auto-erase of YesNo window. Caller is responsible for cleanup.
 *  Used for menus that should persist after selection (= gender menu Birch). */
export function Menu_ProcessInputNoWrap(): number {
  return _processMenuInput(false);
}

export function Menu_ProcessInputNoWrapClearOnChoose(): number {
  return _processMenuInput(true);
}

/** 1:1 décomp src/menu.c:945 Menu_PrintCursor (FONT_NORMAL, gText_SelectorArrow3="▶").
 *  Draws ▶ glyph dans le window au row courant. Couleur identique au texte
 *  (= [bgColor=1, fgColor=2, shadowColor=3] standard FONT_NORMAL). */
function drawMenuCursor(): void {
  if (menuWindowId < 0) return;
  AddTextPrinterParameterized3(
    menuWindowId,
    1,  // FONT_NORMAL
    CURSOR_X, 1 + menuCursorPos * CURSOR_Y_PER_ROW,
    [1, 2, 3],
    255,  // TEXT_SKIP_DRAW = sync render finished=true
    CURSOR_CHAR,
  );
  CopyWindowToVram(menuWindowId, 2);  // COPYWIN_GFX → flush pixel buffer.
}

/** Clear le glyph cursor à la position actuelle via FillWindowPixelRect.
 *  bgColor=1 (= 1:1 décomp PIXEL_FILL(1) standard menu fill). */
function clearMenuCursor(): void {
  if (menuWindowId < 0) return;
  FillWindowPixelRect(
    menuWindowId,
    1,  // bgColor
    CURSOR_X, 1 + menuCursorPos * CURSOR_Y_PER_ROW,
    CURSOR_WIDTH, CURSOR_HEIGHT,
  );
  CopyWindowToVram(menuWindowId, 2);  // COPYWIN_GFX = 2
}

/** 1:1 décomp src/menu.c:1219 EraseYesNoWindow.
 *    ClearStdWindowAndFrameToTransparent(sYesNoWindowId, TRUE);
 *    RemoveWindow(sYesNoWindowId);
 *  Appelé après Menu_ProcessInputNoWrapClearOnChoose pour vider le window
 *  et le retirer du registry. Sans ça → OUI/NON reste visible après choix. */
function EraseYesNoWindow(): void {
  if (sYesNoWindowId < 0) return;
  // 1:1 décomp src/menu.c:1219 ClearStdWindowAndFrameToTransparent :
  // fill pixels avec idx 0 (= transparent) + clear tilemap entries.
  // Bug fix session 122 : précédemment async via dynamic import → cleanup
  // happens 1+ frame APRÈS Menu_ProcessInputNoWrapClearOnChoose return → trace
  // noire visible sur l'écran. Fix : import statique (= synchrone).
  ClearStdWindowAndFrame(sYesNoWindowId, true);
  RemoveWindow(sYesNoWindowId);
  sYesNoWindowId = -1;
}

export function Menu_GetCursorPos(): number {
  return menuCursorPos;
}

/** 1:1 décomp src/menu.c:1577 InitMenuInUpperLeftCornerNormal.
 *    InitMenu(menuStruct, windowId, ...);
 *    Menu_PrintCursor(0, FONT_NORMAL);   // ← draw initial ▶ cursor
 *  Sans le draw initial → menu sans curseur visible (= bug session 89 OUI/NON
 *  + GARÇON/FILLE silent without highlight). */
export function InitMenuInUpperLeftCornerNormal(windowId: number, numItems: number, cursorPos: number): void {
  menuWindowId = windowId;
  menuNumItems = numItems;
  menuCursorPos = cursorPos;
  menuActive = true;
  drawMenuCursor();  // 1:1 décomp ligne 1583 : Menu_PrintCursor(0, FONT_NORMAL) — auto-VRAM-copy.
}

// ─── Yes/No Menu (= 1:1 décomp src/menu.c:1623) ──────────────────────────────
//
// Phase E Step 1 : real impl 1:1 décomp. Le menu Yes/No est un window standard
// (4 cells de large, 2 lines de haut) avec un frame border + texte "OUI/NON" +
// cursor highlight via InitMenuInUpperLeftCornerNormal.
//
// Lecture input via Menu_ProcessInputNoWrapClearOnChoose() → retourne 0=OUI,
// 1=NON, -1=B pressed (cancel).

let sYesNoWindowId = -1;

/** 1:1 décomp `menu.c:1623 CreateYesNoMenu(window, baseTileNum, paletteNum, initialCursorPos)`.
 *  Affiche un window standard avec frame + texte "OUI/NON" + cursor à `initialCursorPos`. */
export function CreateYesNoMenu(
  window: WindowTemplate,
  baseTileNum: number,
  paletteNum: number,
  initialCursorPos: number,
): void {
  sYesNoWindowId = AddWindow(window);
  DrawStdFrameWithCustomTileAndPalette(sYesNoWindowId, true, baseTileNum, paletteNum);

  // 1:1 décomp printer setup : x=8, y=1 (= offset depuis le bord du window).
  // colorArray = [bgColor, fgColor, shadowColor]. PIXEL_FILL(1) du DrawStdFrame
  // remplit le pixel buffer avec idx 1, donc bgColor=1, fg=2, shadow=3 = pattern
  // standard FONT_NORMAL.
  const yesNoText = getString('gText_YesNo');  // "OUI\nNON" en FR
  AddTextPrinterParameterized3(
    sYesNoWindowId,
    1,  // FONT_NORMAL
    8, 1,  // x, y depuis bord du window
    [1, 2, 3],  // [bgColor, fgColor, shadowColor]
    255,  // TEXT_SKIP_DRAW = render synchronously, finished=true
    yesNoText,
  );

  // 1:1 décomp ligne 1645 : InitMenuInUpperLeftCornerNormal(sYesNoWindowId, 2, initialCursorPos).
  // 2 = numItems (OUI + NON).
  InitMenuInUpperLeftCornerNormal(sYesNoWindowId, 2, initialCursorPos);
}

/** Helper pour les callers qui veulent l'ID du window Yes/No (= cleanup,
 *  ClearStdWindowAndFrame après fermeture). */
export function GetYesNoWindowId(): number {
  return sYesNoWindowId;
}

// ─── Misc generic stubs ──────────────────────────────────────────────────────

/** 1:1 décomp src/link.c IsWirelessAdapterConnected. Notre engine web : pas
 *  de wireless adapter (= toujours false). Utilisé par main_menu.c pour les
 *  Mystery Gift / Mystery Events checks. */
export function IsWirelessAdapterConnected(): boolean {
  return false;
}

export function IsMysteryGiftEnabled(): boolean {
  return false;
}

export function CanResetRTC(): boolean {
  return false;
}

export function RtcGetErrorStatus(): number {
  return 0;
}

/** 1:1 décomp `sound.c PlayBGM(songNum)` — bridge vers m4aSongNumStart avec loop=true.
 *  Utilisé par Birch (MUS_ROUTE122) et autres scenes. Skip si MUS_NONE (= 0xFFFF)
 *  ou 0 pour éviter spam warnings sur les maps sans music (= MAP_INSIDE_OF_TRUCK). */
export function PlayBGM(songNum: number): void {
  if (songNum === 0xFFFF || songNum === 0) return;
  m4aSongNumStart(songNum, true);  // BGM = loop
}

// ─── Save block + persistence (= localStorage proxy) ─────────────────────────
//
// 1:1 décomp : gSaveBlock2Ptr est un struct EWRAM qui contient les options
// joueur (textSpeed, sound, frame style…) + identité player (gender, name).
// Décomp persiste via flash mem sur GBA. Notre engine : localStorage.
//
// Mécanique : `_saveBlock2Storage` est l'objet runtime. `gSaveBlock2Ptr` est
// un Proxy qui auto-persist toute écriture vers localStorage. Charge depuis
// localStorage au boot (= options préservées au refresh).

// Bug fix session 122 : auparavant `gSaveBlock2Ptr` avait sa propre store
// localStorage `pokemon-web-demo:saveBlock2` séparée du save-system. Résultat :
// MainMenu Options écrivait dans gSaveBlock2Ptr → l'overworld lisait depuis
// GetSaveBlock2() (save-system) → options non partagées.
//
// 1:1 décomp : il n'y a qu'UN SEUL gSaveBlock2Ptr (= &gSaveblock2.block en
// EWRAM). On l'aligne en faisant le Proxy delegate vers `GetSaveBlock2()`
// du save-system. Toute écriture mute le SaveBlock2 partagé en mémoire.
//
// Persistance : le save-system écrit le slot complet quand TrySavingData()
// est appelé (= via SAUVER menu). Pour les options, on persiste aussi en
// auto à chaque écriture (= 1:1 décomp comportement attendu : les options
// changent dans le menu Options sont préservées même sans save explicit).
//
// Pas de cycle d'import : save-system ne dépend PAS de gba-menu-system
// (vérifié via grep). On peut donc importer GetSaveBlock2 statiquement.
import { GetSaveBlock2 as _GetSaveBlock2 } from './save-system';

const LEGACY_SAVEBLOCK2_LSKEY = 'pokemon-web-demo:saveBlock2';

/** Migrate legacy `pokemon-web-demo:saveBlock2` localStorage → save-system SaveBlock2.
 *  Une seule fois au boot. Préserve les options déjà set dans MainMenu legacy. */
function _migrateLegacySaveBlock2(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(LEGACY_SAVEBLOCK2_LSKEY);
    if (!raw) return;
    const legacy = JSON.parse(raw) as Record<string, unknown>;
    const sb2 = _GetSaveBlock2() as unknown as Record<string, unknown>;
    // Migrer les options + identité player (= seules valeurs intéressantes).
    const fields = [
      'optionsTextSpeed', 'optionsBattleSceneOff', 'optionsBattleStyle',
      'optionsSound', 'optionsButtonMode', 'optionsWindowFrameType',
      'playerName', 'playerGender',
    ];
    let migrated = false;
    for (const k of fields) {
      if (legacy[k] !== undefined && sb2[k] !== legacy[k]) {
        sb2[k] = legacy[k];
        migrated = true;
      }
    }
    if (migrated) {
      // 1:1 décomp : la migration mute le SaveBlock2 RAM uniquement. Pas
      // d'écriture SRAM auto — l'utilisateur sauvegarde explicitement via
      // START → SAUVER. Avant : on appelait _TrySavingData() si HasValidSave
      // → save automatique random non-1:1, retiré.
      console.log('[gSaveBlock2Ptr] migrated legacy localStorage options → SaveBlock2 RAM (no auto-save)');
    }
    localStorage.removeItem(LEGACY_SAVEBLOCK2_LSKEY);
  } catch (e) {
    console.warn('[gSaveBlock2Ptr] legacy migration failed:', e);
  }
}
_migrateLegacySaveBlock2();

export const gSaveBlock1Ptr = {} as any;

/** 1:1 décomp `gSaveBlock2Ptr` — delegates to save-system's SaveBlock2.
 *
 *  Lecture : redirige vers le SaveBlock2 partagé en mémoire (= 1:1 décomp pointer).
 *  Écriture : mute le SaveBlock2 en mémoire UNIQUEMENT — pas d'écriture SRAM
 *  automatique. C'est 1:1 décomp pure : le décomp n'écrit en flash QUE via
 *  `TrySavingData()` explicite (= START → SAUVER, Mystery Gift, Hall of Fame,
 *  Battle Frontier confirm). Aucun set proxy ne déclenche d'écriture latente.
 *
 *  Implication : si un user reload la page sans avoir click SAUVER, il perd ses
 *  changements (= options, naming, etc.). C'est le comportement attendu et
 *  conforme au décomp ROM (= la flash n'est mise à jour qu'au save explicite).
 *
 *  User-flag verbatim (2026-05-21) : "le jeu sauvegarde à des moments
 *  complètement random dans la SRAM (...) le seul moyen de sauvegarde est et
 *  restera START => SAUVER, corrige ça définitivement". Cause root identifiée
 *  = ce Proxy set() qui auto-saved en `TrySavingData()` à chaque mut → ENLEVÉ. */
export const gSaveBlock2Ptr: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string | symbol): unknown {
    return (_GetSaveBlock2() as unknown as Record<string, unknown>)[prop as string];
  },
  set(_target, prop: string | symbol, value: unknown): boolean {
    // 1:1 décomp : mute le SaveBlock2 partagé en RAM. Pas d'écriture SRAM.
    (_GetSaveBlock2() as unknown as Record<string, unknown>)[prop as string] = value;
    return true;
  },
  ownKeys(_target): ArrayLike<string | symbol> {
    return Object.keys(_GetSaveBlock2() as unknown as Record<string, unknown>);
  },
  getOwnPropertyDescriptor(_target, prop: string | symbol): PropertyDescriptor | undefined {
    const v = (_GetSaveBlock2() as unknown as Record<string, unknown>)[prop as string];
    return v === undefined ? undefined : { enumerable: true, configurable: true, value: v, writable: true };
  },
});

export let gSaveFileStatus = 0; // SAVE_STATUS_EMPTY

export function SetSaveFileStatus(status: number): void {
  gSaveFileStatus = status;
  console.log(`[gba-menu-system] SetSaveFileStatus(${status}) → gSaveFileStatus=${gSaveFileStatus}`);
}

// ─── Options helpers (= 1:1 décomp text.c + sound.c + main.c key remap) ────
//
// Décomp pattern : les call sites lisent gSaveBlock2Ptr.options* + appliquent
// au système concerné. Notre engine fait pareil via les helpers ci-dessous,
// utilisés par le text printer / audio engine / key handler runtime.

/** OPTIONS_TEXT_SPEED_* enum (= include/constants/options.h). */
export const OPTIONS_TEXT_SPEED_SLOW = 0;
export const OPTIONS_TEXT_SPEED_MID  = 1;
export const OPTIONS_TEXT_SPEED_FAST = 2;

/** OPTIONS_SOUND_* (= 0=MONO, 1=STEREO). */
export const OPTIONS_SOUND_MONO   = 0;
export const OPTIONS_SOUND_STEREO = 1;

/** OPTIONS_BUTTON_MODE_* (= 0=NORMAL, 1=LR, 2=L_EQUALS_A). */
export const OPTIONS_BUTTON_MODE_NORMAL    = 0;
export const OPTIONS_BUTTON_MODE_LR        = 1;
export const OPTIONS_BUTTON_MODE_L_EQUALS_A = 2;

/** 1:1 décomp `GetPlayerTextSpeed()` — current player text speed setting. */
export function GetPlayerTextSpeed(): number {
  return ((gSaveBlock2Ptr.optionsTextSpeed ?? OPTIONS_TEXT_SPEED_MID) | 0) & 3;
}

/** 1:1 décomp `GetPlayerTextSpeedDelay(speed)` — frames-per-char delay.
 *  Map : SLOW=8, MID=4, FAST=1 (= verified menu.c:77 sTextSpeedFrameDelays).
 *  Hold A/B accelerates encore plus (= bypass delay entièrement, 0 frames).
 *  Donc même au max option (FAST=1), hold A/B reste plus rapide — c'est le
 *  comportement du jeu original. */
export function GetPlayerTextSpeedDelay(speed?: number): number {
  const s = speed ?? GetPlayerTextSpeed();
  if (s === OPTIONS_TEXT_SPEED_SLOW) return 8;
  if (s === OPTIONS_TEXT_SPEED_FAST) return 1;
  return 4;  // MID default
}

/** Audio pan adjustment — applied par M4A engine quand `optionsSound` lu.
 *  MONO : tous channels mixed centered. STEREO : pan respecté.
 *  Returns true si stereo (= apply pan), false si mono (= centered). */
export function IsStereoSound(): boolean {
  return ((gSaveBlock2Ptr.optionsSound ?? OPTIONS_SOUND_MONO) | 0) === OPTIONS_SOUND_STEREO;
}

/** 1:1 décomp `SetPokemonCryStereo(u32 val)` (= sound.c). Toggle live l'audio
 *  mode (= MONO/STEREO) sans attendre le sauvegarde Task_OptionMenuSave. Le
 *  m4a engine lit ce flag à chaque PlayCry/PlayBGM pour appliquer le pan.
 *
 *  Notre version : sync immédiate sur gSaveBlock2Ptr.optionsSound + notify
 *  l'audio engine. Le m4a engine lit `gSaveBlock2Ptr.optionsSound` à chaque
 *  note via `IsStereoSound()` — équivalent fonctionnel décomp. */
export function SetPokemonCryStereo(selection: number): void {
  // 1:1 décomp : SetSoundOutputMode + RestoreNoteStereo. Notre m4a engine
  // simplifié : update le flag dans gSaveBlock2Ptr, le prochain note lookup
  // utilisera la nouvelle valeur.
  gSaveBlock2Ptr.optionsSound = selection | 0;
}

/** 1:1 décomp helpers OPTIONS_BATTLE_SCENE_* / OPTIONS_BATTLE_STYLE_* — read
 *  les options pour gating battle behavior. Le battle code lit ces helpers
 *  à `SetUpFightOptions` / `OpponentSwitchInResetSentPokesToOpponentValue`
 *  pour skip animations / show switch prompt. */
export const OPTIONS_BATTLE_SCENE_ON  = 0;
export const OPTIONS_BATTLE_SCENE_OFF = 1;
export const OPTIONS_BATTLE_STYLE_SHIFT = 0;
export const OPTIONS_BATTLE_STYLE_SET   = 1;

/** Returns true si battle animations doivent être SKIPPED (= optionsBattleSceneOff
 *  set par user dans option menu → set `gHitMarker |= HITMARKER_NO_ANIMATIONS`
 *  dans battle init, cf. battle_main.c). Future-proof : appelable depuis
 *  battle-flow.ts au battle init. */
export function IsBattleSceneOff(): boolean {
  return ((gSaveBlock2Ptr.optionsBattleSceneOff ?? OPTIONS_BATTLE_SCENE_ON) | 0) === OPTIONS_BATTLE_SCENE_OFF;
}

/** Returns le battle style courant : 0 = SHIFT (= ask user before switch
 *  pokemon when enemy faints), 1 = SET (= no prompt). Future-proof : utilisé
 *  par battle-flow au moment du switch après KO ennemi. */
export function GetBattleStyle(): number {
  return ((gSaveBlock2Ptr.optionsBattleStyle ?? OPTIONS_BATTLE_STYLE_SHIFT) | 0) & 1;
}

/** Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck). */
(globalThis as Record<string, unknown>).GetPlayerTextSpeed = GetPlayerTextSpeed;
(globalThis as Record<string, unknown>).GetPlayerTextSpeedDelay = GetPlayerTextSpeedDelay;
(globalThis as Record<string, unknown>).IsStereoSound = IsStereoSound;
(globalThis as Record<string, unknown>).SetPokemonCryStereo = SetPokemonCryStereo;
(globalThis as Record<string, unknown>).IsBattleSceneOff = IsBattleSceneOff;
(globalThis as Record<string, unknown>).GetBattleStyle = GetBattleStyle;

// Synchronise gSaveFileStatus mutable export sur globalThis pour les
// callbacks auto-générés (= eval scope @ts-nocheck).
if (!('gSaveFileStatus' in globalThis)) {
  Object.defineProperty(globalThis, 'gSaveFileStatus', {
    get: () => gSaveFileStatus,
    set: (v) => { gSaveFileStatus = v as number; },
    enumerable: true,
    configurable: true,
  });
}

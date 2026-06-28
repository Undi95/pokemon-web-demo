/**
 * field_message_box.ts — overworld dialog box state machine, miroir 1:1 de `field_message_box.c`.
 *
 * 1:1 décomp `D:/Projet 1/decomps/pokeemeraude/src/field_message_box.c` :
 *   - sFieldMessageBoxMode (HIDDEN | NORMAL | AUTO_SCROLL)
 *   - InitFieldMessageBox / ShowFieldMessage / IsFieldMessageBoxHidden /
 *     HideFieldMessageBox
 *   - Task_DrawFieldMessage state machine (load gfx → draw frame → run printer)
 *
 * Phase 4.5 MVP : juste NORMAL mode (= player-paced). AUTO_SCROLL et Pokenav
 * messages non implémentés.
 *
 * Architecture :
 *   - sStandardTextBoxWindow = WindowTemplate fixe (BG0, 26×4 tiles bottom).
 *   - Tick state machine drived par MainCB2_Overworld → TickFieldMessageBox.
 *   - Texte rendu via gba-text-system / gba-text-printer (1:1 ROM font).
 */

import {
  AddWindow,
  ClearDialogWindowAndFrame,
  DrawDialogueFrame,
  DLG_WINDOW_BASE_TILE_NUM,
  DLG_WINDOW_PALETTE_NUM,
} from './window';
import { LoadMessageBoxGfx, LoadUserWindowBorderGfx } from './text_window';
import { BG_PLTT_ID } from '../harness/runtime/decomp-runtime';
import { IsTextPrinterActive } from './text';
import { AddTextPrinterParameterized3 } from './menu';
import { gStringVar4, StringExpandPlaceholders } from '../include/string_util';
import { decodeOwBytes } from '../include/text';
import { gTextFlags } from './engine/ui/gba-text-printer';
import { getRuntime } from '../harness/runtime/decomp-globals';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const FIELD_MESSAGE_BOX_HIDDEN = 0;
export const FIELD_MESSAGE_BOX_NORMAL = 1;

/** 1:1 décomp menu.c:25-27 : STD_WINDOW_BASE_TILE_NUM = 0x214, _PALETTE_NUM = 14.
 *  Bordure std window partagée par les sous-fenêtres OUI/NON, multichoice, etc.
 *  (chargée par LoadMessageBoxAndBorderGfx). */
const STD_WINDOW_BASE_TILE_NUM = 0x214;
const STD_WINDOW_PALETTE_NUM = 14;
export const FIELD_MESSAGE_BOX_AUTO_SCROLL = 2;

/** 1:1 décomp `sStandardTextBox_WindowTemplates[0]` (menu.c:84-94) :
 *  BG0, position (2, 15) tiles, 27×4 tiles, palette 15, baseBlock 0x194.
 *  Avec width=27, frame extends de tile 0 à tile 29 = pleine largeur (= centré). */
const STANDARD_TEXT_BOX_TEMPLATE = {
  bg: 0,
  tilemapLeft: 2,
  tilemapTop: 15,
  width: 27,
  height: 4,
  paletteNum: 15,
  baseBlock: 0x194,  // = 404
} as const;

/** Flat palette index pour LoadMessageBoxGfx (= palette 15 × 16 colors = 240). */
const FRAME_PALETTE_FLAT_IDX = DLG_WINDOW_PALETTE_NUM * 16;

// ─── Module state ────────────────────────────────────────────────────────────

let sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
/** State step de Task_DrawFieldMessage (0 = load gfx, 1 = draw frame + start
 *  printer, 2 = wait printer done). */
let sStateStep = 0;
/** Window ID alloué la 1ère fois qu'on Show. Réutilisé après. */
let sWindowId = -1;

// ─── Public API 1:1 décomp ───────────────────────────────────────────────────

/** No-op placeholder : depuis le swap palette 13→15 (= same as Birch dialog),
 *  on n'a plus besoin de gStandardMenuPalette ; gMessageBox_Pal couvre tout
 *  (= frame border colors aux idx 11-14, text bg/fg/shadow aux idx 1-3). */
export async function preloadStandardMenuPalette(): Promise<void> {
  /* no-op — kept for backward compat with TestOverworldScene boot */
}

/** 1:1 STRICT décomp `InitFieldMessageBox(void)` (field_message_box.c:14-21) :
 *    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
 *    gTextFlags.canABSpeedUpPrint = FALSE;
 *    gTextFlags.useAlternateDownArrow = FALSE;
 *    gTextFlags.autoScroll = FALSE;
 *    gTextFlags.forceMidTextSpeed = FALSE;
 *
 *  ⚠️ Reset `sWindowId` AUSSI (= notre extension post-FreeAllWindowBuffers
 *  flow). Sans ce reset : si un sub-menu (bag/options/party) appelle
 *  `InitWindows(...)` qui fait `FreeAllWindowBuffers`, le sWindowId capturé
 *  AVANT pointe vers un slot libéré → AddTextPrinterParameterized3 warn
 *  "window N not found" + dialog invisible. */
export function InitFieldMessageBox(): void {
  sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
  // 1:1 STRICT décomp : reset gTextFlags.
  gTextFlags.canABSpeedUpPrint = false;
  gTextFlags.useAlternateDownArrow = false;
  gTextFlags.autoScroll = false;
  gTextFlags.forceMidTextSpeed = false;
  sStateStep = 0;
  sWindowId = -1;
}

/** 1:1 décomp `ShowFieldMessage(const u8 *str)`. Returns FALSE si déjà en cours.
 *  L'argument `str` est le texte BRUT du JSON (= avec `\n` `\p` `\l` literals).
 *  encodeStringForFont gère les escape sequences. */
export function ShowFieldMessage(str: Uint8Array): boolean {
  if (sFieldMessageBoxMode !== FIELD_MESSAGE_BOX_HIDDEN) return false;
  // 1:1 décomp `StringExpandPlaceholders(gStringVar4, str)` (field_message_box.c) :
  // résout les placeholders byte (0xFD + id : {PLAYER}/{RIVAL}/{STR_VAR_1..3}) DANS
  // gStringVar4. `str` = bytes charmap (getText), EOS-terminé (le `$` source a été
  // strippé à l'encodage `encodeOwText`).
  StringExpandPlaceholders(gStringVar4, str);
  sFieldMessageBoxMode = FIELD_MESSAGE_BOX_NORMAL;
  sStateStep = 0;
  return true;
}

/** 1:1 décomp `IsFieldMessageBoxHidden(void)`. */
export function IsFieldMessageBoxHidden(): boolean {
  return sFieldMessageBoxMode === FIELD_MESSAGE_BOX_HIDDEN;
}

/** 1:1 décomp `HideFieldMessageBox(void)` :
 *    DestroyTask_DrawFieldMessage();
 *    ClearDialogWindowAndFrame(0, TRUE);
 *    sFieldMessageBoxMode = HIDDEN;
 *
 *  Critique d'utiliser `ClearDialogWindowAndFrame` (= clear large rect couvrant
 *  les 2 colonnes de border de chaque côté) et NON `ClearStdWindowAndFrame`
 *  (= clear seulement 1 col around) car le dialog frame est plus large. */
export function HideFieldMessageBox(): void {
  if (sWindowId >= 0) {
    ClearDialogWindowAndFrame(sWindowId, true);
  }
  sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
  sStateStep = 0;
}

/** 1:1 décomp `GetFieldMessageBoxMode(void)`. */
export function GetFieldMessageBoxMode(): number {
  return sFieldMessageBoxMode;
}

/** 1:1 STRICT décomp `StopFieldMessage(void)` (field_message_box.c:157-161) :
 *    DestroyTask_DrawFieldMessage();
 *    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
 *  Différent de HideFieldMessageBox : ne clear PAS le dialog frame visuel
 *  (= le caller fait ça séparément si besoin). Used par opcodes `closemessage`
 *  variants qui veulent stop le print sans clear le window. */
export function StopFieldMessage(): void {
  sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
  sStateStep = 0;
}

/** 1:1 STRICT décomp `ShowFieldMessageFromBuffer(void)` (field_message_box.c:109-116) :
 *    if (sFieldMessageBoxMode != FIELD_MESSAGE_BOX_HIDDEN) return FALSE;
 *    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_NORMAL;
 *    StartDrawFieldMessage();   ← AddTextPrinterForMessage(TRUE) + CreateTask
 *    return TRUE;
 *  Same as ShowFieldMessage but utilise gStringVar4 directement (= déjà set
 *  par script via préparation/buffer). */
export function ShowFieldMessageFromBuffer(): boolean {
  if (sFieldMessageBoxMode !== FIELD_MESSAGE_BOX_HIDDEN) return false;
  // gStringVar4 contient déjà le texte (bytes, = set par caller).
  sFieldMessageBoxMode = FIELD_MESSAGE_BOX_NORMAL;
  sStateStep = 0;
  return true;
}

/** Pas dans le décomp — helper devtools (= dev-scope.ts) pour lire le texte
 *  courant rendered dans la field message box. Retourne '' si box hidden.
 *  Décode gStringVar4 (bytes charmap) → string lisible (best-effort, debug). */
export function GetCurrentFieldMessageText(): string {
  return sFieldMessageBoxMode === FIELD_MESSAGE_BOX_HIDDEN ? '' : decodeOwBytes(gStringVar4);
}

// ─── Tick state machine (= 1:1 décomp Task_DrawFieldMessage) ────────────────

/** À call chaque frame depuis MainCB2_Overworld APRÈS PlayerStep.
 *  Drive la state machine de Task_DrawFieldMessage :
 *    state 0 : LoadMessageBoxAndBorderGfx (= load tiles + palette)
 *    state 1 : DrawDialogueFrame + AddTextPrinter (= start text rendering)
 *    state 2 : Wait jusqu'à printer done → mode = HIDDEN (= waitmessage exit)
 *
 *  Le RunTextPrinters() qui tick les printers chaque frame est lui-même called
 *  par DecompRuntime.tickFixed (cf. decomp-runtime.ts:1948). */
export function TickFieldMessageBox(): void {
  if (sFieldMessageBoxMode === FIELD_MESSAGE_BOX_HIDDEN) return;

  switch (sStateStep) {
    case 0: {
      // 1:1 STRICT décomp `LoadMessageBoxAndBorderGfx` (menu.c:210) — DEUX charges :
      //   LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(DLG_WINDOW_PALETTE_NUM));
      //   LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(STD_WINDOW_PALETTE_NUM));
      LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, FRAME_PALETTE_FLAT_IDX);
      // Le 2e charge était OMIS → les sous-fenêtres OUI/NON / multichoice dessinent
      // leur cadre via DrawStdFrameWithCustomTileAndPalette(…, STD_WINDOW_BASE_TILE_NUM=
      // 0x214, palette 14) en référençant des tiles JAMAIS chargées en VRAM → cadre
      // invisible (boîte OUI/NON sans bordure). STD_WINDOW_PALETTE_NUM=14, BASE=0x214
      // (menu.c:25-27).
      LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(STD_WINDOW_PALETTE_NUM));
      // Lazy-create window au 1er Show (= AddWindow alloue tilemap + pixel buffer).
      if (sWindowId < 0) {
        sWindowId = AddWindow(STANDARD_TEXT_BOX_TEMPLATE);
      }
      sStateStep++;
      break;
    }
    case 1: {
      // 1:1 décomp `DrawDialogueFrame(0, TRUE)` (= menu.c:216) — réutilise
      // l'helper foundationnel partagé avec Birch speech + autres scenes.
      DrawDialogueFrame(sWindowId, true);
      // 1:1 décomp `AddTextPrinterForMessage(TRUE)` (field_message_box.c) qui lit gStringVar4 :
      //   gTextFlags.canABSpeedUpPrint = allowSkippingDelayWithButtonPress (= TRUE) ;
      //   AddTextPrinterParameterized2 avec FONT_NORMAL, color=[1,2,3] (= bg/fg/shadow),
      //   speed=playerOption (= 1 frame/char en FAST).
      // ⚠️ Le `canABSpeedUpPrint = true` était OMIS : InitFieldMessageBox le met FALSE
      // (global), et sans le remettre TRUE par message, MAINTENIR A n'accélère plus AUCUN
      // texte (field + combat, car gTextFlags est global). 1:1 strict = le set ici.
      gTextFlags.canABSpeedUpPrint = true;
      // Notre AddTextPrinterParameterized3 prend speed négatif pour player option.
      AddTextPrinterParameterized3(sWindowId, 1 /* FONT_NORMAL = 1 */, 0, 1,
        [1, 2, 3], -1 /* = player option speed */, gStringVar4);
      sStateStep++;
      break;
    }
    case 2: {
      // 1:1 décomp `if (RunTextPrintersAndIsPrinter0Active() != TRUE)`
      // Si le printer du window est plus actif (= text fully rendered),
      // la "task" est done : sFieldMessageBoxMode = HIDDEN.
      // Note : la window/text RESTE visible. ScrCmd_release appellera
      // HideFieldMessageBox plus tard pour clean up.
      if (!IsTextPrinterActive(sWindowId)) {
        sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
      }
      break;
    }
  }
}

// ─── Expose pour debugging / scripts ─────────────────────────────────────────

(globalThis as Record<string, unknown>).ShowFieldMessage = ShowFieldMessage;
(globalThis as Record<string, unknown>).IsFieldMessageBoxHidden = IsFieldMessageBoxHidden;
(globalThis as Record<string, unknown>).HideFieldMessageBox = HideFieldMessageBox;

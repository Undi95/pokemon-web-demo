/**
 * field-message-box.ts — overworld dialog box state machine.
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
  LoadMessageBoxGfx,
  DrawDialogueFrame,
  DLG_WINDOW_BASE_TILE_NUM,
  DLG_WINDOW_PALETTE_NUM,
} from './gba-window-system';
import {
  AddTextPrinterParameterized3,
  IsTextPrinterActive,
  setStringVar4,
  gStringVar4,
  StringExpandPlaceholders,
} from './gba-text-system';
import { getRuntime } from './decomp-globals';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

export const FIELD_MESSAGE_BOX_HIDDEN = 0;
export const FIELD_MESSAGE_BOX_NORMAL = 1;
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
/** Texte courant (= déjà passé à setStringVar4). */
let sCurrentText: string = '';

// ─── Public API 1:1 décomp ───────────────────────────────────────────────────

/** No-op placeholder : depuis le swap palette 13→15 (= same as Birch dialog),
 *  on n'a plus besoin de gStandardMenuPalette ; gMessageBox_Pal couvre tout
 *  (= frame border colors aux idx 11-14, text bg/fg/shadow aux idx 1-3). */
export async function preloadStandardMenuPalette(): Promise<void> {
  /* no-op — kept for backward compat with TestOverworldScene boot */
}

/** 1:1 décomp `InitFieldMessageBox(void)`. À call au boot.
 *  ⚠️ Reset `sWindowId` AUSSI (= 1:1 InitFieldMessageBox post-FreeAllWindowBuffers
 *  flow décomp). Sans ce reset : si un sub-menu (bag/options/party) appelle
 *  `InitWindows(...)` qui fait `FreeAllWindowBuffers`, le sWindowId capturé
 *  AVANT pointe vers un slot libéré → AddTextPrinterParameterized3 warn
 *  "window N not found" + dialog invisible. */
export function InitFieldMessageBox(): void {
  sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;
  sStateStep = 0;
  sWindowId = -1;
}

/** 1:1 décomp `ShowFieldMessage(const u8 *str)`. Returns FALSE si déjà en cours.
 *  L'argument `str` est le texte BRUT du JSON (= avec `\n` `\p` `\l` literals).
 *  encodeStringForFont gère les escape sequences. */
export function ShowFieldMessage(str: string): boolean {
  if (sFieldMessageBoxMode !== FIELD_MESSAGE_BOX_HIDDEN) return false;
  // 1:1 décomp `StringExpandPlaceholders(gStringVar4, str)` (= field_message_box.c).
  // Résout les placeholders {PLAYER}, {RIVAL}, {STR_VAR_1..3} avant rendering
  // (= expandStringVar4 est appelée à la racine ici, pas par le text printer).
  // Sans cette expansion, le user voit "MAMAN: , on est là" (= virgule détachée
  // car {PLAYER} reste tel quel et non substitué).
  // Strip $ EOS terminator (= 1:1 décomp end-of-string sentinel).
  const stripped = str.replace(/\$$/, '');
  sCurrentText = StringExpandPlaceholders(gStringVar4, stripped);
  setStringVar4(sCurrentText);
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

/** Pas dans le décomp — helper devtools (= dev-scope.ts) pour lire le texte
 *  courant rendered dans la field message box. Retourne '' si box hidden. */
export function GetCurrentFieldMessageText(): string {
  return sFieldMessageBoxMode === FIELD_MESSAGE_BOX_HIDDEN ? '' : sCurrentText;
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
      // 1:1 décomp `LoadMessageBoxAndBorderGfx` :
      //   LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, BG_PLTT_ID(15))
      LoadMessageBoxGfx(0, DLG_WINDOW_BASE_TILE_NUM, FRAME_PALETTE_FLAT_IDX);
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
      // 1:1 décomp `AddTextPrinterForMessage(TRUE)` qui lit gStringVar4 :
      //   AddTextPrinterParameterized2 avec FONT_NORMAL, color=[1,2,3] (= bg/fg/shadow),
      //   speed=playerOption (= 1 frame/char en FAST).
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

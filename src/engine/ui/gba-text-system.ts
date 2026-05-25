/**
 * gba-text-system.ts
 * ------------------
 * Couche d'adaptation text.c pour le runtime décomp.
 * Gère les TextPrinter actifs, l'encodage de strings, et les callbacks
 * de rendu texte attendues par les auto-callbacks.
 */
import {
  type Window,
  type TextPrinter,
  type AddTextPrinterOpts,
  addTextPrinter,
  runTextPrinter,
  textPrinterDrawDownArrow,
  encodeStringForFont,
  fillWindowPixelBuffer,
  fillWindowPixelRect,
  scrollWindow,
  _setTextInputState,
  RENDER_STATE_FINISH,
  RENDER_STATE_HANDLE_CHAR,
  RENDER_STATE_CLEAR,
  RENDER_STATE_SCROLL_START,
  RENDER_STATE_SCROLL,
  RENDER_UPDATE,
  RENDER_FINISH,
  RENDER_STATE_WAIT_WITH_DOWN_ARROW,
  LINE_HEIGHT,
  EXT_CTRL_CODE_BEGIN,
  CHAR_EXTRA_SYMBOL,
  CHAR_NEWLINE,
  CHAR_PROMPT_SCROLL,
  CHAR_PROMPT_CLEAR,
  EOS,
} from './gba-text-printer';
import { getWindowById } from './gba-window-system';
import { getRuntime } from '../system/decomp-globals';
import { gSaveBlock2Ptr } from '../save/save-block-state';

// ─── Font data (lazy loaded) ─────────────────────────────────────────────────

let glyphData: number[][] | null = null;
let glyphWidths: Uint8Array | null = null;
let charmap: Record<string, number> | null = null;
let downArrowPixels: number[][] | null = null;

/** 1:1 décomp text.h enum FontIds : FONT_SMALL=0, FONT_NORMAL=1, FONT_SHORT=2,
 *  FONT_SHORT_COPY_{1,2,3}=3,4,5, FONT_NARROW=7, FONT_SMALL_NARROW=8. */
const FONT_NAMES: Record<number, string> = {
  0: 'small',
  1: 'normal',
  2: 'short',
  3: 'short', 4: 'short', 5: 'short',  // FONT_SHORT_COPY_*
  7: 'narrow',
  8: 'smallnarrow',
};
let glyphDataByFont: Record<string, number[][]> | null = null;
let glyphWidthsByFont: Record<string, Uint8Array> | null = null;

async function loadFontData(): Promise<void> {
  if (glyphData) return;
  const [fontRes, widthsRes, charmapRes, arrowRes] = await Promise.all([
    fetch('/decomp/em/ui/fonts/latin.latfont.json').then((r) => r.json()),
    fetch('/decomp/em/ui/font-widths.json').then((r) => r.json()),
    fetch('/decomp/em/ui/charmap.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/down_arrow.json').then((r) => r.json()),
  ]);
  // 1:1 décomp : load TOUS les fonts (normal, short, narrow, small, smallnarrow).
  // sItemListMenu.fontId = FONT_NARROW (=7) → glyph data différent de FONT_NORMAL.
  glyphDataByFont = {};
  glyphWidthsByFont = {};
  for (const name of ['normal', 'short', 'narrow', 'small', 'smallnarrow']) {
    if (fontRes[name]) glyphDataByFont[name] = fontRes[name] as number[][];
    if (widthsRes[name]) glyphWidthsByFont[name] = new Uint8Array(widthsRes[name] as number[]);
  }
  // Default refs vers FONT_NORMAL (= back-compat avec callers qui ne passent pas fontId).
  glyphData = glyphDataByFont.normal;
  glyphWidths = glyphWidthsByFont.normal;
  charmap = charmapRes as Record<string, number>;
  const arrow = arrowRes as { width: number; height: number; pixels: number[][] };
  downArrowPixels = arrow.pixels;
}

/** Résout glyph data + widths selon fontId. Fallback à FONT_NORMAL si inconnu. */
function _resolveFont(fontId: number): { glyphData: number[][]; glyphWidths: Uint8Array } {
  const name = FONT_NAMES[fontId] ?? 'normal';
  return {
    glyphData: glyphDataByFont?.[name] ?? glyphData!,
    glyphWidths: glyphWidthsByFont?.[name] ?? glyphWidths!,
  };
}

/** Force load font data (call during scene preload). */
export function preloadFontData(): Promise<void> {
  return loadFontData();
}

/** 1:1 décomp src/text.c `GetStringWidth(FONT_NORMAL, str, letterSpacing=0)`.
 *  Retourne la pixel width réelle de `str` rendue avec FONT_NORMAL. Strip
 *  les control codes `{NAME ...}` (= placeholders/color changes) avant
 *  mesure (= analogue au switch sur EXT_CTRL_CODE_BEGIN du décomp).
 *
 *  Phase B audit session 83 : remplace l'approximation `~6px/char` qu'on
 *  avait dans option-menu-impl.ts (= rightAlignX). Maintenant le right-align
 *  des choices "FAST" / "OFF" / "STÉRÉO" / etc. matche exactement le décomp. */
export function GetStringWidth(str: string): number {
  ensureFontLoaded();
  // 1:1 décomp text.c:GetStringWidth — on encode la string COMPLÈTE (pas un
  // strip regex naïf) puis on walk les bytes : les EXT_CTRL (0xFC) = 0 px
  // (3 bytes), les EXTRA_SYMBOL (0xF9) = glyphWidths[0x100|sym] (2 bytes,
  // cf. text.c:1454-1456 `func(*++str | 0x100)`), le reste = glyphWidths[b].
  // Avant : `{NO}`/`{LV_2}` étaient stripés → width 0 → right-align ID faux.
  const encoded = encodeStringForFont(str, charmap!);
  let width = 0;
  for (let i = 0; i < encoded.length; i++) {
    const b = encoded[i];
    if (b === EOS) break;
    if (b === EXT_CTRL_CODE_BEGIN) { i += 2; continue; } // BEGIN+sub+param = 0 px
    if (b === CHAR_EXTRA_SYMBOL) {
      const sym = encoded[i + 1] ?? 0;
      width += glyphWidths![0x100 | sym] ?? 0;
      i += 1;
      continue;
    }
    if (b === CHAR_NEWLINE || b === CHAR_PROMPT_SCROLL || b === CHAR_PROMPT_CLEAR) continue;
    width += glyphWidths![b] ?? 0;
  }
  return width;
}

/** 1:1 décomp src/text.c `GetStringRightAlignXOffset(FONT_NORMAL, str, rightX)`.
 *  Retourne la X offset où placer le START de `str` pour qu'il finisse à `rightX`. */
export function GetStringRightAlignXOffset(str: string, rightX: number): number {
  return rightX - GetStringWidth(str);
}

/** 1:1 décomp src/text.c `GetStringCenterAlignXOffset(fontId, str, totalWidth)`.
 *  Retourne la X offset où placer le START de `str` pour qu'il soit centered
 *  dans `totalWidth` pixels.
 *
 *  ⚠️ Le décomp C fait `(totalWidth - GetStringWidth(...)) / 2` en integer
 *  division (= floor). En JS la division retourne float (12.5, 15.5, 3.5
 *  pour OBJETS/BAIES/OBJ. RARES dans le bag). AddTextPrinterParameterized3
 *  ne render PAS le texte avec un offset fractionnaire (= header pocket
 *  vide pour ces 3 strings dans le SAC). Floor pour 1:1 C. */
export function GetStringCenterAlignXOffset(str: string, totalWidth: number): number {
  return Math.floor((totalWidth - GetStringWidth(str)) / 2);
}

/** 1:1 décomp `CHAR_SPACER` (= byte 0x77 dans charmap, charmap.txt:280).
 *  Caractère spacer demi-largeur utilisé par `ConvertIntToDecimalStringN`
 *  en mode RIGHT_ALIGN pour padder à gauche les nombres courts (ex. " 5"
 *  vs "12" alignés à droite). Côté JS = 'ラ' (U+30E9), mappé byte 0x77.
 *  Promu globalement (était dupliqué dans party-screen + summary-screen). */
export const CHAR_SPACER_STR = 'ラ';

function ensureFontLoaded(): void {
  if (!glyphData || !glyphWidths || !charmap) {
    throw new Error('[gba-text-system] Font data not loaded. Call preloadFontData() first.');
  }
}

// ─── Global string buffer (1:1 décomp gStringVar4) ───────────────────────────
//
// Phase E Step 1 : transformé en mutable. Le décomp utilise `gStringVar4` comme
// un buffer mutable u8[] que `StringExpandPlaceholders` remplit. Tous les
// auto callbacks font `StringExpandPlaceholders(gStringVar4, gText_X)` puis
// `AddTextPrinterForMessage` qui lit `gStringVar4`.

export let gStringVar4: string = '';
export let gStringVar1: string = '';
export let gStringVar2: string = '';
export let gStringVar3: string = '';

/** Setter pour les modules externes (= les auto callbacks ne peuvent pas
 *  faire `gStringVar4 = ...` à cause des import bindings ES). */
export function setStringVar4(value: string): void {
  gStringVar4 = value;
  (globalThis as Record<string, unknown>).gStringVar4 = value;
}

// Expose les string vars sur globalThis pour les auto callbacks.
if (!('gStringVar4' in globalThis)) {
  Object.defineProperty(globalThis, 'gStringVar4', {
    get: () => gStringVar4,
    set: (v) => { gStringVar4 = String(v); },
    enumerable: true, configurable: true,
  });
  Object.defineProperty(globalThis, 'gStringVar1', {
    get: () => gStringVar1,
    set: (v) => { gStringVar1 = String(v); },
    enumerable: true, configurable: true,
  });
  Object.defineProperty(globalThis, 'gStringVar2', {
    get: () => gStringVar2,
    set: (v) => { gStringVar2 = String(v); },
    enumerable: true, configurable: true,
  });
  Object.defineProperty(globalThis, 'gStringVar3', {
    get: () => gStringVar3,
    set: (v) => { gStringVar3 = String(v); },
    enumerable: true, configurable: true,
  });
}

// ─── Text printers registry ──────────────────────────────────────────────────

interface ActivePrinter {
  printer: TextPrinter;
  windowId: number;
  finished: boolean;
}

let gTextPrinters: ActivePrinter[] = [];

// ─── API ─────────────────────────────────────────────────────────────────────

/** Lookup helper local pour éviter import circulaire avec gba-menu-system.
 *  Lit `gSaveBlock2Ptr.optionsTextSpeed` via globalThis (= dans tous les cas
 *  populated avant le 1er texte rendered). Returns frames-per-char delay.
 *
 *  1:1 décomp `menu.c:77 sTextSpeedFrameDelays` :
 *    [OPTIONS_TEXT_SPEED_SLOW] = 8,
 *    [OPTIONS_TEXT_SPEED_MID]  = 4,
 *    [OPTIONS_TEXT_SPEED_FAST] = 1,
 *
 *  Avec ces valeurs (= 1:1 GBA ROM) :
 *    FAST (textSpeed=1) : 1 char par 2 frames = 30 chars/sec
 *    MID  (textSpeed=4) : 1 char par 5 frames = 12 chars/sec
 *    SLOW (textSpeed=8) : 1 char par 9 frames = 6.7 chars/sec
 *
 *  Note : précédent commit 4249e141 hardcodait x2 ({ 4, 2, 0 }) pour préférence
 *  user web build, mais ça déviait du 1:1 décomp. Reverted suite à audit text-tick :
 *  le guard `_lastRunTextPrintersFrame` empêche le double-tick → vitesse vue =
 *  vitesse ROM exacte. Le hardcode x2 rendait le texte 2× plus rapide qu'attendu.
 *
 *  A/B held override → delayCounter=0 chaque frame (= 60 chars/sec) gérée
 *  dans gba-text-printer.ts runTextPrinter (pas ici). */
function _getPlayerTextSpeedDelay(): number {
  // 1:1 décomp `gSaveBlock2Ptr->optionsTextSpeed`.
  const speed = ((gSaveBlock2Ptr.optionsTextSpeed as number | undefined) ?? 1) | 0;
  // 1:1 décomp menu.c:77 sTextSpeedFrameDelays = { 8, 4, 1 }.
  if (speed === 0) return 8;  // SLOW
  if (speed === 2) return 1;  // FAST
  return 4;                   // MID (default)
}

/** Cœur commun à AddTextPrinterParameterized3/4 (= remplir le
 *  `struct TextPrinterTemplate` puis `AddTextPrinter(&printer, speed, NULL)`,
 *  décomp menu.c). P3 (menu.c:1917) et P4 (menu.c:1938) ont un corps
 *  IDENTIQUE sauf la source de letterSpacing/lineSpacing : P3 =
 *  GetFontAttribute(fontId, …), P4 = params explicites. Tout le reste
 *  (encode, resolveFont, color[bg=0,fg=1,shadow=2], speed encoding, flush
 *  TEXT_SKIP_DRAW, slot par windowId) = commun → factorisé ici 1:1. */
function _addTextPrinterParameterizedCore(
  windowId: number,
  fontId: number,
  left: number,
  top: number,
  letterSpacing: number,
  lineSpacing: number,
  colorArray: readonly number[],
  speed: number,
  str: string,
): number {
  ensureFontLoaded();
  const win = getWindowById(windowId);
  if (!win) {
    console.warn('[gba-text-system] AddTextPrinterParameterized3/4: window', windowId, 'not found');
    return 0;
  }
  const encoded = encodeStringForFont(str, charmap!);
  // 1:1 décomp : glyph data selon fontId (= FONT_NARROW = different glyphs
  // que FONT_NORMAL). Avant : fontId ignored, toujours FONT_NORMAL rendered.
  const fnt = _resolveFont(fontId);
  const opts: AddTextPrinterOpts = {
    window: win,
    encodedString: encoded,
    glyphData: fnt.glyphData,
    glyphWidths: fnt.glyphWidths,
    x: left,
    y: top,
    // 1:1 décomp menu.c:1931-1933 : `color` array layout = [bgColor=color[0],
    // fgColor=color[1], shadowColor=color[2]] (printer.bgColor = color[0],
    // fgColor = color[1], shadowColor = color[2]).
    bgColor: colorArray[0] ?? 1,
    fgColor: colorArray[1] ?? 2,
    shadowColor: colorArray[2] ?? 3,
    // 1:1 décomp menu.c:1928-1929 (P3 = GetFontAttribute) / :1949-1950
    // (P4 = params). Honoré par le rendu (gba-text-printer currentX +=
    // glyphW + letterSpacing). list_menu.c passe template.lettersSpacing.
    letterSpacing,
    lineSpacing,
    // 1:1 décomp src/text.c : speed parameter encoding :
    //   255 (TEXT_SKIP_DRAW) → instant render (= no per-char delay)
    //   -1                   → use player's saved option (= GetPlayerTextSpeedDelay())
    //   N >= 0               → explicit N-frame per-char delay
    // Sentinel -1 ajouté pour permettre aux auto-callbacks de respecter le
    // setting joueur via gSaveBlock2Ptr.optionsTextSpeed sans hardcoder les
    // delay values per call site.
    textSpeed: speed === 255 ? 0
      : speed < 0 ? _getPlayerTextSpeedDelay()
      : speed,
    downArrowPixels: downArrowPixels ?? undefined,
  };
  const printer = addTextPrinter(opts);
  // 1:1 décomp src/text.c:AddTextPrinter — quand speed === TEXT_SKIP_DRAW (255),
  // le printer rend la string entière de façon synchrone et marque
  // `sTextPrinters[id].active = FALSE`. RunTextPrinters skip ensuite, donc le
  // down arrow n'est JAMAIS drawn (= comportement attendu pour menu items).
  // Sans ce flush, le printer reste en RENDER_STATE_WAIT_WITH_DOWN_ARROW et
  // RunTextPrinters() draw la flèche rouge à la fin de NOUVELLE PARTIE / OPTIONS.
  let finished = false;
  if (speed === 255) {
    // Boucle borne (= équivalent décomp `for (j = 0; j < 0x400; ++j)`).
    for (let j = 0; j < 0x400; j++) {
      runTextPrinter(printer);
      if (printer.state === RENDER_STATE_WAIT_WITH_DOWN_ARROW || printer.state === RENDER_STATE_FINISH) break;
    }
    finished = true;
  }
  // 1:1 décomp : sTextPrinters[printer.id] = ... (slot fixe par windowId, pas
  // push). Retire les anciens printers du même windowId pour éviter que leurs
  // ❤️ down arrows résiduels continuent de s'animer.
  gTextPrinters = gTextPrinters.filter((ap) => ap.windowId !== windowId);
  gTextPrinters.push({ printer, windowId, finished });
  return gTextPrinters.length - 1;
}

/** 1:1 décomp `src/text.c:251-269 AddTextPrinterParameterized(u8 windowId,
 *  u8 fontId, const u8 *str, u8 x, u8 y, u8 speed, void (*callback))`.
 *  Variante simple : utilise les colors par défaut du font (= gFonts[fontId]
 *  .fgColor/bgColor/shadowColor). Wrapper sur AddTextPrinterParameterized3. */
export function AddTextPrinterParameterized(
  windowId: number,
  fontId: number,
  str: string | Uint8Array,
  x: number,
  y: number,
  speed: number,
  _callback: ((tmpl: unknown, idx: number) => void) | null = null,
): number {
  // 1:1 décomp : `const u8 *str` peut venir en bytes (= easy_chat avec
  // chars GBA charmap). Convert vers string ASCII pour notre text-system.
  const text = typeof str === 'string' ? str : Array.from(str).map(b => String.fromCharCode(b)).join('');
  // 1:1 décomp text.c:262-267 : prend les colors par défaut du font via
  // GetFontAttribute (= équivalent gFonts[fontId].XColor du décomp).
  const bg = GetFontAttribute(fontId, FONTATTR_COLOR_BACKGROUND);
  const fg = GetFontAttribute(fontId, FONTATTR_COLOR_FOREGROUND);
  const shadow = GetFontAttribute(fontId, FONTATTR_COLOR_SHADOW);
  // Color array order [bg, fg, shadow] — matche le pattern utilisé par
  // AddTextPrinterParameterized3 callers (= cf. option-menu-impl TEXT_COLOR_NORMAL).
  return AddTextPrinterParameterized3(windowId, fontId, x, y, [bg, fg, shadow], speed, text);
}

/** 1:1 décomp `src/menu.c:1917 AddTextPrinterParameterized3(u8 windowId,
 *  u8 fontId, u8 left, u8 top, const u8 *color, s8 speed, const u8 *str)`.
 *  letterSpacing/lineSpacing = GetFontAttribute (= 0 pour tous les fonts
 *  sauf BRAILLE.lineSpacing=8 ; comportement P3 INCHANGÉ vs avant 2b car
 *  ces fonts donnent 0). */
export function AddTextPrinterParameterized3(
  windowId: number,
  fontId: number,
  left: number,
  top: number,
  colorArray: readonly number[],
  speed: number,
  str: string,
): number {
  return _addTextPrinterParameterizedCore(
    windowId, fontId, left, top,
    GetFontAttribute(fontId, FONTATTR_LETTER_SPACING),
    GetFontAttribute(fontId, FONTATTR_LINE_SPACING),
    colorArray, speed, str,
  );
}

/** 1:1 décomp `src/menu.c:1938 AddTextPrinterParameterized4(u8 windowId,
 *  u8 fontId, u8 left, u8 top, u8 letterSpacing, u8 lineSpacing,
 *  const u8 *color, s8 speed, const u8 *str)`. Diffère de P3 uniquement
 *  par letterSpacing/lineSpacing EXPLICITES (list_menu.c:588-606 passe
 *  template.lettersSpacing + 0). */
export function AddTextPrinterParameterized4(
  windowId: number,
  fontId: number,
  left: number,
  top: number,
  letterSpacing: number,
  lineSpacing: number,
  colorArray: readonly number[],
  speed: number,
  str: string,
): number {
  return _addTextPrinterParameterizedCore(
    windowId, fontId, left, top, letterSpacing, lineSpacing, colorArray, speed, str,
  );
}

export function AddTextPrinterForMessage(_allowSkipping: boolean): void {
  ensureFontLoaded();
  const win = getWindowById(0);
  if (!win) {
    console.warn('[gba-text-system] AddTextPrinterForMessage: window 0 not found');
    return;
  }
  const encoded = encodeStringForFont(gStringVar4, charmap!);
  const opts: AddTextPrinterOpts = {
    window: win,
    encodedString: encoded,
    glyphData: glyphData!,
    glyphWidths: glyphWidths!,
    x: 0,
    y: 1,
    textSpeed: _getPlayerTextSpeedDelay(),  // 1:1 décomp : lit gSaveBlock2Ptr.optionsTextSpeed
    downArrowPixels: downArrowPixels ?? undefined,
  };
  const printer = addTextPrinter(opts);
  // 1:1 décomp slot fixe : retire les anciens printers du même windowId.
  gTextPrinters = gTextPrinters.filter((ap) => ap.windowId !== 0);
  gTextPrinters.push({ printer, windowId: 0, finished: false });
}

export function AddTextPrinterWithCallbackForMessage(
  _allowSkipping: boolean,
  callback: (printer: TextPrinter, lastByte: number) => void,
): void {
  ensureFontLoaded();
  const win = getWindowById(0);
  if (!win) {
    console.warn('[gba-text-system] AddTextPrinterWithCallbackForMessage: window 0 not found');
    return;
  }
  const encoded = encodeStringForFont(gStringVar4, charmap!);
  const opts: AddTextPrinterOpts = {
    window: win,
    encodedString: encoded,
    glyphData: glyphData!,
    glyphWidths: glyphWidths!,
    x: 0,
    y: 1,
    textSpeed: _getPlayerTextSpeedDelay(),  // 1:1 décomp : lit gSaveBlock2Ptr.optionsTextSpeed
    downArrowPixels: downArrowPixels ?? undefined,
    onCharRendered: callback,
  };
  const printer = addTextPrinter(opts);
  // 1:1 décomp slot fixe : retire les anciens printers du même windowId.
  gTextPrinters = gTextPrinters.filter((ap) => ap.windowId !== 0);
  gTextPrinters.push({ printer, windowId: 0, finished: false });
}

const A_BUTTON_TEXT = 0x01;
const B_BUTTON_TEXT = 0x02;
const AB_MASK = A_BUTTON_TEXT | B_BUTTON_TEXT;

// Guard contre double-tick par frame. Le runtime call RunTextPrinters auto à
// chaque runOneFrame, MAIS les Tasks décomp aussi (via RunTextPrintersAndIsPrinter0Active).
// Sans ce guard, le ❤️ down arrow s'animerait 2x plus vite que le décomp ROM.
let _lastRunTextPrintersFrame = -1;

export function RunTextPrinters(): void {
  const rt = getRuntime();
  if (!rt) return;
  // Skip si déjà tick cette frame (= 1:1 décomp behavior, 1 call par frame).
  if (rt.gIntroFrameCounter === _lastRunTextPrintersFrame) return;
  _lastRunTextPrintersFrame = rt.gIntroFrameCounter;
  // 1:1 décomp text.c:944-953 — A/B speed up via JOY_NEW + JOY_HELD.
  const newAB = !!(rt.gMain.newKeys & AB_MASK);
  const heldAB = !!(rt.gMain.heldKeys & AB_MASK);
  _setTextInputState(newAB, heldAB);
  const aPressed = rt.gMain.newKeys & AB_MASK;  // A or B for page advance.

  for (const ap of gTextPrinters) {
    if (ap.finished) continue;

    // 1:1 décomp text.c:1171-1210 state machine transitions.
    if (aPressed && ap.printer.state === RENDER_STATE_CLEAR) {
      // 1:1 décomp text.c:874-879 TextPrinterWaitWithDownArrow : JOY_NEW(A|B) →
      // PlaySE(SE_SELECT). Notre impl manquait cet appel → silence sur dialog advance.
      void import('../system/decomp-globals').then(({ PlaySE }) => PlaySE(5));  // SE_SELECT = 5
      // 1:1 décomp text.c:1174-1177 : FillWindowPixelBuffer(bgColor) + cursor (x, y).
      fillWindowPixelBuffer(ap.printer.window, (ap.printer.bgColor << 4) | ap.printer.bgColor);
      ap.printer.currentX = ap.printer.x;
      ap.printer.currentY = ap.printer.y;
      ap.printer.state = RENDER_STATE_HANDLE_CHAR;
    } else if (aPressed && ap.printer.state === RENDER_STATE_SCROLL_START) {
      // 1:1 décomp text.c:874-879 : same SE_SELECT on scroll page break.
      void import('../system/decomp-globals').then(({ PlaySE }) => PlaySE(5));
      // 1:1 décomp text.c:1181-1187 : TextPrinterClearDownArrow → init scroll
      // + cursor.x reset (Y reste). Sans clear de l'❤️ AVANT le scroll, l'ancien
      // ❤️ shift up avec le content → 2 ❤️ visibles à la fin.
      // text.c:838-848 TextPrinterClearDownArrow = FillWindowPixelRect 8x16 à
      // (currentX, currentY).
      fillWindowPixelRect(
        ap.printer.window,
        ap.printer.bgColor,
        ap.printer.currentX,
        ap.printer.currentY,
        8,
        16,
      );
      ap.printer.scrollDistance = LINE_HEIGHT + ap.printer.lineSpacing;
      ap.printer.currentX = ap.printer.x;
      // currentY ne reset PAS — c'est ce qui distingue de CLEAR.
      ap.printer.state = RENDER_STATE_SCROLL;
    } else if (ap.printer.state === RENDER_STATE_SCROLL) {
      // 1:1 décomp text.c:1189-1209 : scroll progressif chaque frame.
      // sWindowVerticalScrollSpeeds[textSpeed] : SLOW=1, MID=2, FAST=4 pixels/frame.
      if (ap.printer.scrollDistance > 0) {
        // 1:1 décomp `gSaveBlock2Ptr->optionsTextSpeed`.
        const textSpeed = (gSaveBlock2Ptr.optionsTextSpeed as number | undefined) ?? 1;  // default MID
        const speeds = [1, 2, 4];  // SLOW, MID, FAST
        const speed = speeds[textSpeed] ?? 2;
        const deltaY = Math.min(ap.printer.scrollDistance, speed);
        scrollWindow(ap.printer.window, deltaY, ap.printer.bgColor);
        ap.printer.scrollDistance -= deltaY;
      } else {
        ap.printer.state = RENDER_STATE_HANDLE_CHAR;
      }
    }

    const result = runTextPrinter(ap.printer);
    // 1:1 décomp text.c:787-836 — TextPrinterDrawDownArrow appelé chaque frame
    // pendant CLEAR ou SCROLL_START (= bobbing animation pendant l'attente A).
    if (result === RENDER_UPDATE && (
      ap.printer.state === RENDER_STATE_CLEAR ||
      ap.printer.state === RENDER_STATE_SCROLL_START
    )) {
      textPrinterDrawDownArrow(ap.printer);
    }
    // 1:1 décomp pokeemerald RunTextPrinters : RENDER_FINISH → active = FALSE.
    if (result === RENDER_FINISH) {
      ap.finished = true;
    }
  }
}

export function IsTextPrinterActive(windowId: number): boolean {
  return gTextPrinters.some((ap) => ap.windowId === windowId && !ap.finished);
}

/** DEBUG only — accès lecture aux active printers depuis window.dev. */
export function _debugGetTextPrinters(): typeof gTextPrinters {
  return gTextPrinters;
}

// Expose pour debug overworld dialog (= bundle module instance, pas dynamic import).
(globalThis as Record<string, unknown>).__debugGetTextPrinters = _debugGetTextPrinters;

export function RunTextPrintersAndIsPrinter0Active(): boolean {
  RunTextPrinters();
  return IsTextPrinterActive(0);
}

/** Efface tous les printers (appelé au changement de scène). */
export function ClearTextPrinters(): void {
  gTextPrinters = [];
}

/** 1:1 décomp DeactivateAllTextPrinters — stop tous les printers actifs. */
export function DeactivateAllTextPrinters(): void {
  gTextPrinters = [];
}

// ─── String placeholders stub ─────────────────────────────────────────────────

/** 1:1 décomp `string_util.c StringExpandPlaceholders(dest, src)`.
 *  Résout les placeholders `{PLAYER}`, `{STR_VAR_1..3}`, `{RIVAL}`, etc. depuis
 *  `src` et écrit le résultat dans `dest` (= globalement `gStringVar4` chez tous
 *  les callers). Retourne dest pour chainage 1:1 décomp.
 *
 *  Phase E Step 1 audit session 84 : real impl. Avant : stub no-op qui retournait
 *  src tel quel sans écrire dans dest → les placeholders n'étaient jamais
 *  résolus et `gStringVar4` restait vide. */
export function StringExpandPlaceholders(_dest: string, src: string): string {
  // Tous les callers passent `gStringVar4` comme dest. On mute le module-level
  // gStringVar4 directement (= les imports binding ES ne permettent pas l'écriture
  // depuis l'extérieur de toute façon).
  let result = src;

  // Substitution des placeholders 1:1 décomp (= macros buffers sStringVarBuffers).
  // {STR_VAR_1..3} → gStringVar1..3 contenu courant.
  result = result.replace(/\{STR_VAR_1\}/g, () => gStringVar1);
  result = result.replace(/\{STR_VAR_2\}/g, () => gStringVar2);
  result = result.replace(/\{STR_VAR_3\}/g, () => gStringVar3);

  // {PLAYER} = nom du joueur. 1:1 décomp `gSaveBlock2Ptr->playerName` direct.
  const playerName: string | undefined = gSaveBlock2Ptr.playerName as string | undefined;
  // 1:1 décomp `StringCopy(dest, gSaveBlock2Ptr->playerName)` : substitute
  // toujours (= si playerName empty, le décomp pousse aussi vide). Avant on
  // skipped si playerName === 'PLAYER' → résultat "MAMAN: Alors, ?" car le
  // text printer strippait silencieusement les `{PLAYER}` non-substitués.
  // Maintenant on substitute toujours, en utilisant 'PLAYER' (= placeholder
  // défaut décomp pre-Birch-naming) ou fallback.
  result = result.replace(/\{PLAYER\}/g, playerName || 'PLAYER');

  // B2 fix (DEMO-AUDIT-FINDINGS) : {RIVAL} = nom du rival gender-aware.
  // 1:1 décomp string_util.c:456-462 `ExpandPlaceholder_RivalName` :
  //   if (gSaveBlock2Ptr->playerGender == MALE)
  //       return gText_ExpandedPlaceholder_May;    // = "FLORA"
  //   else
  //       return gText_ExpandedPlaceholder_Brendan; // = "BRICE"
  let rivalName: string;
  if ((gSaveBlock2Ptr.playerGender ?? 0) === 1 /* FEMALE */) {
    rivalName = 'BRICE'; // = gText_ExpandedPlaceholder_Brendan FR
  } else {
    // Default MALE (= player non set) → FLORA (= rival féminin).
    rivalName = 'FLORA'; // = gText_ExpandedPlaceholder_May FR
  }
  result = result.replace(/\{RIVAL\}/g, rivalName);

  // Mute le module-level gStringVar4. Écriture en dur (= ne mute PAS _dest car
  // les strings TS sont immutables, et tous les callers utilisent gStringVar4
  // de toute façon).
  gStringVar4 = result;
  (globalThis as Record<string, unknown>).gStringVar4 = result;
  return result;
}

// ─── Font IDs & TEXT_SKIP_DRAW (1:1 décomp include/text.h) ──────────────────

/** 1:1 décomp `include/text.h` enum FontIds. Source de vérité unique pour
 *  éviter la duplication entre bag-screen, party-screen, pokedex-screen,
 *  trainer-card-screen, start-menu, option-menu-impl, etc.
 *
 *  Valeurs identiques à text.h :
 *    FONT_SMALL=0, FONT_NORMAL=1, FONT_SHORT=2, FONT_SHORT_COPY_{1,2,3}=3,4,5,
 *    FONT_BRAILLE=6, FONT_NARROW=7, FONT_SMALL_NARROW=8, FONT_BOLD=9. */
export const FONT_SMALL = 0;
export const FONT_NORMAL = 1;
export const FONT_SHORT = 2;
export const FONT_SHORT_COPY_1 = 3;
export const FONT_SHORT_COPY_2 = 4;
export const FONT_SHORT_COPY_3 = 5;
export const FONT_BRAILLE = 6;
export const FONT_NARROW = 7;
export const FONT_SMALL_NARROW = 8;
export const FONT_BOLD = 9;

/** 1:1 décomp `#define TEXT_SKIP_DRAW 0xFF` (text.h:8).
 *  Sentinel pour `AddTextPrinterParameterized3.speed` indiquant "ne pas dessiner
 *  immédiatement, juste setup le printer state". */
export const TEXT_SKIP_DRAW = 0xFF;

// ─── Font attributes 1:1 décomp (text.c sFontInfos + GetFontAttribute) ───────

/** 1:1 décomp `include/text.h:43-50` enum (attributeId de GetFontAttribute). */
export const FONTATTR_MAX_LETTER_WIDTH = 0;
export const FONTATTR_MAX_LETTER_HEIGHT = 1;
export const FONTATTR_LETTER_SPACING = 2;
export const FONTATTR_LINE_SPACING = 3;
export const FONTATTR_UNKNOWN = 4;
export const FONTATTR_COLOR_FOREGROUND = 5;
export const FONTATTR_COLOR_BACKGROUND = 6;
export const FONTATTR_COLOR_SHADOW = 7;

interface FontInfo {
  maxLetterWidth: number;
  maxLetterHeight: number;
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

/** 1:1 décomp `src/text.c:119-221 sFontInfos[]`. Indexé par FONT_* (text.h
 *  enum FontIds : SMALL=0, NORMAL=1, SHORT=2, SHORT_COPY_{1,2,3}=3,4,5,
 *  BRAILLE=6, NARROW=7, SMALL_NARROW=8, BOLD=9). `.unk` non initialisé en
 *  décomp (= 0). `.fontFunction` pointers omis (rendu géré par notre moteur
 *  TextPrinter). Valeurs reportées EXACTEMENT du décomp. */
const sFontInfos: ReadonlyArray<FontInfo> = [
  /* [FONT_SMALL]        */ { maxLetterWidth: 5, maxLetterHeight: 12, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_NORMAL]       */ { maxLetterWidth: 6, maxLetterHeight: 16, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_SHORT]        */ { maxLetterWidth: 6, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_SHORT_COPY_1] */ { maxLetterWidth: 6, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_SHORT_COPY_2] */ { maxLetterWidth: 6, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_SHORT_COPY_3] */ { maxLetterWidth: 6, maxLetterHeight: 14, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_BRAILLE]      */ { maxLetterWidth: 8, maxLetterHeight: 16, letterSpacing: 0, lineSpacing: 8, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_NARROW]       */ { maxLetterWidth: 5, maxLetterHeight: 16, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_SMALL_NARROW] */ { maxLetterWidth: 5, maxLetterHeight: 8, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 2, bgColor: 1, shadowColor: 3 },
  /* [FONT_BOLD]         */ { maxLetterWidth: 8, maxLetterHeight: 8, letterSpacing: 0, lineSpacing: 0, unk: 0, fgColor: 1, bgColor: 2, shadowColor: 15 },
];

/** 1:1 décomp `src/text.c:1645 GetFontAttribute(u8 fontId, u8 attributeId)`.
 *  Switch pur → `sFontInfos[fontId].<field>`. attributeId hors enum → 0. */
export function GetFontAttribute(fontId: number, attributeId: number): number {
  let result = 0;
  const f = sFontInfos[fontId];
  if (!f) return 0;
  switch (attributeId) {
    case FONTATTR_MAX_LETTER_WIDTH: result = f.maxLetterWidth; break;
    case FONTATTR_MAX_LETTER_HEIGHT: result = f.maxLetterHeight; break;
    case FONTATTR_LETTER_SPACING: result = f.letterSpacing; break;
    case FONTATTR_LINE_SPACING: result = f.lineSpacing; break;
    case FONTATTR_UNKNOWN: result = f.unk; break;
    case FONTATTR_COLOR_FOREGROUND: result = f.fgColor; break;
    case FONTATTR_COLOR_BACKGROUND: result = f.bgColor; break;
    case FONTATTR_COLOR_SHADOW: result = f.shadowColor; break;
  }
  return result;
}

/** 1:1 décomp `src/text.c:223-235 sMenuCursorDimensions[][2]` ([w, h] par
 *  fontId). FONT_BOLD non initialisé en décomp (= {0, 0}). */
const sMenuCursorDimensions: ReadonlyArray<readonly [number, number]> = [
  /* [FONT_SMALL]        */ [8, 12],
  /* [FONT_NORMAL]       */ [8, 15],
  /* [FONT_SHORT]        */ [8, 14],
  /* [FONT_SHORT_COPY_1] */ [8, 14],
  /* [FONT_SHORT_COPY_2] */ [8, 14],
  /* [FONT_SHORT_COPY_3] */ [8, 14],
  /* [FONT_BRAILLE]      */ [8, 16],
  /* [FONT_NARROW]       */ [8, 15],
  /* [FONT_SMALL_NARROW] */ [8, 8],
  /* [FONT_BOLD]         */ [0, 0],
];

/** 1:1 décomp `src/text.c:1678 GetMenuCursorDimensionByFont(u8 fontId,
 *  u8 whichDimension)` = `sMenuCursorDimensions[fontId][whichDimension]`. */
export function GetMenuCursorDimensionByFont(fontId: number, whichDimension: number): number {
  return sMenuCursorDimensions[fontId]?.[whichDimension] ?? 0;
}

// ─── Text colors helper ──────────────────────────────────────────────────────

// 1:1 décomp main_menu.c:410 sTextColor_Headers = [TEXT_DYNAMIC_COLOR_1, _2, _3]
// = [10, 11, 12]. Ces palette indices sont chargés dynamiquement par main_menu
// auto file (= palette[15*16+10] = WHITE, +11 = DARK_GRAY, +12 = LIGHT_GRAY).
// AVANT j'avais hardcodé [1, 2, 3] (= approximation static) MAIS palette[15*16+1]
// est chargée dynamiquement avec BLUE/PINK (= cursor highlight) → bg derrière
// le texte = BLUE/PINK au lieu de WHITE. NE JAMAIS approximer les valeurs
// décomp ; toujours utiliser les indices que le code dynamic load remplit.
export const sTextColor_Headers = [10, 11, 12] as const; // [bg=DYNAMIC_1, fg=DYNAMIC_2, shadow=DYNAMIC_3]
(globalThis as Record<string, unknown>).sTextColor_Headers = sTextColor_Headers;

// 1:1 décomp main_menu.c:411 sTextColor_MenuInfo = [TEXT_DYNAMIC_COLOR_1=0xA, TEXT_COLOR_WHITE=0x1, TEXT_DYNAMIC_COLOR_3=0xC]
// = [10, 1, 12]. Différence avec Headers : fg = TEXT_COLOR_WHITE (= idx 1, pas
// dynamic) — donne du texte blanc sur bg dynamique. Utilisé par les sub-info
// du Continue window (= JOUEUR / DUREE JEU / POKéDEX / BADGES values).
export const sTextColor_MenuInfo = [10, 1, 12] as const;
(globalThis as Record<string, unknown>).sTextColor_MenuInfo = sTextColor_MenuInfo;

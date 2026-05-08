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
} from './gba-text-printer';
import { getWindowById } from './gba-window-system';
import { getRuntime } from './decomp-globals';

// ─── Font data (lazy loaded) ─────────────────────────────────────────────────

let glyphData: number[][] | null = null;
let glyphWidths: Uint8Array | null = null;
let charmap: Record<string, number> | null = null;
let downArrowPixels: number[][] | null = null;

async function loadFontData(): Promise<void> {
  if (glyphData) return;
  const [fontRes, widthsRes, charmapRes, arrowRes] = await Promise.all([
    fetch('/decomp/em/ui/fonts/latin.latfont.json').then((r) => r.json()),
    fetch('/decomp/em/ui/font-widths.json').then((r) => r.json()),
    fetch('/decomp/em/ui/charmap.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/down_arrow.json').then((r) => r.json()),
  ]);
  // 'normal' font = FONT_NORMAL
  glyphData = fontRes.normal as number[][];
  glyphWidths = new Uint8Array(widthsRes.normal as number[]);
  charmap = charmapRes as Record<string, number>;
  const arrow = arrowRes as { width: number; height: number; pixels: number[][] };
  downArrowPixels = arrow.pixels;
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
  // Strip {NAME ...} control codes (= color changes, placeholders, etc.).
  const visible = str.replace(/\{[^}]+\}/g, '');
  const encoded = encodeStringForFont(visible, charmap!);
  let width = 0;
  for (let i = 0; i < encoded.length; i++) {
    width += glyphWidths![encoded[i]] ?? 0;
  }
  return width;
}

/** 1:1 décomp src/text.c `GetStringRightAlignXOffset(FONT_NORMAL, str, rightX)`.
 *  Retourne la X offset où placer le START de `str` pour qu'il finisse à `rightX`. */
export function GetStringRightAlignXOffset(str: string, rightX: number): number {
  return rightX - GetStringWidth(str);
}

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
  const sb2 = (globalThis as Record<string, unknown>).gSaveBlock2Ptr as
    { optionsTextSpeed?: number } | undefined;
  const speed = (sb2?.optionsTextSpeed ?? 1) | 0;
  // 1:1 décomp menu.c:77 sTextSpeedFrameDelays = { 8, 4, 1 }.
  if (speed === 0) return 8;  // SLOW
  if (speed === 2) return 1;  // FAST
  return 4;                   // MID (default)
}

export function AddTextPrinterParameterized3(
  windowId: number,
  _fontId: number,
  left: number,
  top: number,
  colorArray: readonly number[],
  speed: number,
  str: string,
): number {
  ensureFontLoaded();
  const win = getWindowById(windowId);
  if (!win) {
    console.warn('[gba-text-system] AddTextPrinterParameterized3: window', windowId, 'not found');
    return 0;
  }
  const encoded = encodeStringForFont(str, charmap!);
  const opts: AddTextPrinterOpts = {
    window: win,
    encodedString: encoded,
    glyphData: glyphData!,
    glyphWidths: glyphWidths!,
    x: left,
    y: top,
    // 1:1 décomp src/text.c AddTextPrinterParameterized3 : `color` array layout
    // is [bgColor, fgColor, shadowColor] (cf. printerTemplate.bgColor = color[0],
    // fgColor = color[1], shadowColor = color[2]). Avant cette fix, on avait
    // l'ordre INVERSÉ (= [fg, bg, shadow]) ce qui causait des BG résidu colorés
    // et break le contrat décomp pour les arrays comme sTextColor_Headers.
    bgColor: colorArray[0] ?? 1,
    fgColor: colorArray[1] ?? 2,
    shadowColor: colorArray[2] ?? 3,
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
      void import('./decomp-globals').then(({ PlaySE }) => PlaySE(5));  // SE_SELECT = 5
      // 1:1 décomp text.c:1174-1177 : FillWindowPixelBuffer(bgColor) + cursor (x, y).
      fillWindowPixelBuffer(ap.printer.window, (ap.printer.bgColor << 4) | ap.printer.bgColor);
      ap.printer.currentX = ap.printer.x;
      ap.printer.currentY = ap.printer.y;
      ap.printer.state = RENDER_STATE_HANDLE_CHAR;
    } else if (aPressed && ap.printer.state === RENDER_STATE_SCROLL_START) {
      // 1:1 décomp text.c:874-879 : same SE_SELECT on scroll page break.
      void import('./decomp-globals').then(({ PlaySE }) => PlaySE(5));
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
        const sb2 = (globalThis as Record<string, unknown>).gSaveBlock2Ptr as
          { optionsTextSpeed?: number } | undefined;
        const textSpeed = sb2?.optionsTextSpeed ?? 1;  // default MID
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

  // {PLAYER} = nom du joueur. Lookup priority :
  //   1. window.gameState.playerName (= notre source canonique post Phase 4.10)
  //   2. gSaveBlock2Ptr.playerName (= legacy save block proxy, fallback)
  // Lazy via globalThis pour éviter import circular.
  const gs = (globalThis as Record<string, unknown>).gameState as
    | { playerName?: string } | undefined;
  let playerName: string | undefined = gs?.playerName;
  if (!playerName) {
    const sb2 = (globalThis as Record<string, unknown>).gSaveBlock2Ptr as
      | { playerName?: string } | undefined;
    playerName = sb2?.playerName;
  }
  // 1:1 décomp `StringCopy(dest, gSaveBlock2Ptr->playerName)` : substitute
  // toujours (= si playerName empty, le décomp pousse aussi vide). Avant on
  // skipped si playerName === 'PLAYER' → résultat "MAMAN: Alors, ?" car le
  // text printer strippait silencieusement les `{PLAYER}` non-substitués.
  // Maintenant on substitute toujours, en utilisant 'PLAYER' (= placeholder
  // défaut décomp pre-Birch-naming) ou fallback.
  result = result.replace(/\{PLAYER\}/g, playerName || 'PLAYER');

  // {RIVAL} = nom du rival (si gender female → BRENDAN, else MAY) — TODO Phase E.
  result = result.replace(/\{RIVAL\}/g, 'RIVAL');

  // Mute le module-level gStringVar4. Écriture en dur (= ne mute PAS _dest car
  // les strings TS sont immutables, et tous les callers utilisent gStringVar4
  // de toute façon).
  gStringVar4 = result;
  (globalThis as Record<string, unknown>).gStringVar4 = result;
  return result;
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

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
  RENDER_STATE_FINISH,
  RENDER_UPDATE,
  RENDER_STATE_WAIT_WITH_DOWN_ARROW,
} from './gba-text-printer';
import { getWindowById } from './gba-window-system';

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
    textSpeed: speed === 255 ? 0 : speed,
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
    textSpeed: 1,
    downArrowPixels: downArrowPixels ?? undefined,
  };
  const printer = addTextPrinter(opts);
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
    textSpeed: 1,
    downArrowPixels: downArrowPixels ?? undefined,
    onCharRendered: callback,
  };
  const printer = addTextPrinter(opts);
  gTextPrinters.push({ printer, windowId: 0, finished: false });
}

export function RunTextPrinters(): void {
  for (const ap of gTextPrinters) {
    if (ap.finished) continue;
    const result = runTextPrinter(ap.printer);
    if (result === RENDER_UPDATE && ap.printer.state === RENDER_STATE_WAIT_WITH_DOWN_ARROW) {
      textPrinterDrawDownArrow(ap.printer);
    }
    if (ap.printer.state === RENDER_STATE_FINISH) {
      ap.finished = true;
    }
  }
}

export function IsTextPrinterActive(windowId: number): boolean {
  return gTextPrinters.some((ap) => ap.windowId === windowId && !ap.finished);
}

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

  // {PLAYER} = nom du joueur depuis gSaveBlock2Ptr.playerName.
  // Lazy lookup sur globalThis pour éviter import circular.
  const sb2 = (globalThis as Record<string, unknown>).gSaveBlock2Ptr as
    | { playerName?: string } | undefined;
  if (sb2?.playerName) {
    result = result.replace(/\{PLAYER\}/g, sb2.playerName);
  }

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

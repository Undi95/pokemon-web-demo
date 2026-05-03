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

function ensureFontLoaded(): void {
  if (!glyphData || !glyphWidths || !charmap) {
    throw new Error('[gba-text-system] Font data not loaded. Call preloadFontData() first.');
  }
}

// ─── Global string buffer (1:1 décomp gStringVar4) ───────────────────────────

export const gStringVar4: string = '';

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

export function StringExpandPlaceholders(dest: string, src: string): string {
  // TODO: implémenter les vrais placeholders ( {PLAYER}, {STR_VAR_1}, etc.)
  // Pour l'instant, retourne la source telle quelle.
  return src;
}

// ─── Text colors helper ──────────────────────────────────────────────────────

// 1:1 décomp main_menu.c:410 sTextColor_Headers — [bgColor, fgColor, shadowColor].
// Décomp original : [TEXT_DYNAMIC_COLOR_1, _2, _3] = [10, 11, 12], remplis par
// LoadPalette dynamique. On approxime avec les colors statiques équivalentes
// visuellement (= bg=WHITE, fg=DARK_GRAY, shadow=LIGHT_GRAY) :
export const sTextColor_Headers = [1, 2, 3] as const; // [bg=WHITE, fg=DARK_GRAY, shadow=LIGHT_GRAY]
(globalThis as Record<string, unknown>).sTextColor_Headers = sTextColor_Headers;

/**
 * gba-text-system.ts
 * ------------------
 * Couche d'adaptation text.c pour le runtime décomp.
 * Gère les TextPrinter actifs, l'encodage de strings, et les callbacks
 * de rendu texte attendues par les auto-callbacks.
 */
// VAGUE 2 raffinement 1 : le driving texte (RenderText/RenderFont + states +
// down-arrow + HW blit/scroll/fill) vit dans le miroir `src/game/text.ts`.
// gba-text-system ne garde de gba-text-printer que l'état input (_setTextInputState),
// gTextFlags (getPlayerTextSpeed) et RENDER_FINISH (boucle RunTextPrinters).
import {
  _setTextInputState,
  gTextFlags,
  RENDER_FINISH,
} from './gba-text-printer';
import { getWindowById } from './gba-window-system';
import { getRuntime } from '../system/decomp-globals';
import { gSaveBlock2Ptr } from '../save/save-block-state';
// Migration TEXTE byte-level 1:1 (flip direct, 2026-06-06) : gStringVar1-4 +
// StringExpandPlaceholders = le miroir `src/game/string_util.ts` (Uint8Array
// charmap), source UNIQUE. gba-text-system ne définit plus ses propres JS-string.
import {
  gStringVar1, gStringVar2, gStringVar3, gStringVar4,
  StringExpandPlaceholders, StringCopy, StringLength,
} from '../../../include/string_util';
// text.h — FontIds + attributs de font, RELOCALISÉS dans le miroir
// `src/game/text.ts` (1:1 text.c/text.h, VAGUE 2b). Importés ici pour usage
// interne (default params fontId, GetFontAttribute dans AddTextPrinterParameterized).
import {
  FONT_SMALL, FONT_NORMAL, FONT_SHORT,
  FONT_SHORT_COPY_1, FONT_SHORT_COPY_2, FONT_SHORT_COPY_3,
  FONT_BRAILLE, FONT_NARROW, FONT_SMALL_NARROW, FONT_BOLD,
  TEXT_SKIP_DRAW,
  FONTATTR_MAX_LETTER_WIDTH, FONTATTR_MAX_LETTER_HEIGHT, FONTATTR_LETTER_SPACING,
  FONTATTR_LINE_SPACING, FONTATTR_UNKNOWN, FONTATTR_COLOR_FOREGROUND,
  FONTATTR_COLOR_BACKGROUND, FONTATTR_COLOR_SHADOW,
  GetFontAttribute, GetMenuCursorDimensionByFont,
} from '../../../include/text';
// Migration TEXTE byte : init la charmap du miroir strings.ts (= encode les
// gText_ExpandedPlaceholder_* FR + active EncodePlayerNameFR pour {PLAYER}/{RIVAL}).
import { InitTextData } from '../../../include/strings';
// Couche de gestion des printers RELOCALISÉE dans le miroir `src/game/text.ts`.
// `RunTextPrinters` (ci-dessous) = boucle 1:1 décomp (le driving scroll/down-arrow/
// input vit dans RenderText, raffinement 1) ; il lit le registre `sTextPrinters`
// (indexé par windowId, `.active` sur le struct, raffinement 3) + RenderFont.
import { sTextPrinters, IsTextPrinterActive, RenderFont } from '../../text';
export {
  AddTextPrinterParameterized,
  IsTextPrinterActive, _debugGetTextPrinters, ClearTextPrinters, DeactivateAllTextPrinters,
} from '../../text';
// menu.c (VAGUE 1 text-speed/run + VAGUE 2 chaîne AddTextPrinter) : relocalisés
// dans le miroir `src/game/menu.ts`, ré-exportés pour les consommateurs de gba-text-system.
export {
  GetPlayerTextSpeed, GetPlayerTextSpeedDelay, RunTextPrintersAndIsPrinter0Active,
  AddTextPrinterParameterized2, AddTextPrinterParameterized3, AddTextPrinterParameterized4,
  AddTextPrinterForMessage, AddTextPrinterForMessage_2, AddTextPrinterWithCustomSpeedForMessage,
  AddTextPrinterWithCallbackForMessage,
} from '../../menu';

// ─── Font data (lazy loaded) ─────────────────────────────────────────────────

let glyphData: number[][] | null = null;
let glyphWidths: Uint8Array | null = null;
let charmap: Record<string, number> | null = null;
let downArrowPixels: number[][] | null = null;
// 1:1 décomp text.c:72 sDarkDownArrowTiles (down_arrow_alt.png) — flèche de fin
// de texte ALT utilisée quand gTextFlags.useAlternateDownArrow (combat/evo/Pokenav).
let darkDownArrowPixels: number[][] | null = null;

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
  const [fontRes, widthsRes, charmapRes, arrowRes, arrowAltRes] = await Promise.all([
    fetch('/decomp/em/ui/fonts/latin.latfont.json').then((r) => r.json()),
    fetch('/decomp/em/ui/font-widths.json').then((r) => r.json()),
    fetch('/decomp/em/ui/charmap.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/down_arrow.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/down_arrow_alt.json').then((r) => r.json()),
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
  // Migration TEXTE byte : init le miroir strings.ts (gText_ExpandedPlaceholder_*
  // FR + EncodePlayerNameFR) avec la charmap fraîchement chargée. Sans ça,
  // `{PLAYER}`/`{RIVAL}` rendaient des espaces (charmap null → byte 0).
  InitTextData(charmap);
  const arrow = arrowRes as { width: number; height: number; pixels: number[][] };
  downArrowPixels = arrow.pixels;
  const arrowAlt = arrowAltRes as { width: number; height: number; pixels: number[][] };
  darkDownArrowPixels = arrowAlt.pixels;
}

/** Charmap OW (char→byte), chargée au boot par loadFontData. null avant. Utilisée
 *  par `getText` (script-runtime) pour encoder la data texte en bytes (notre préproc). */
export function getOwCharmap(): Record<string, number> | null {
  return charmap;
}

/** Résout glyph data + widths selon fontId. Fallback à FONT_NORMAL si inconnu. */
function _resolveFont(fontId: number): { glyphData: number[][]; glyphWidths: Uint8Array } {
  const name = FONT_NAMES[fontId] ?? 'normal';
  return {
    glyphData: glyphDataByFont?.[name] ?? glyphData!,
    glyphWidths: glyphWidthsByFont?.[name] ?? glyphWidths!,
  };
}

/** Accesseur HW des width-tables d'un font (= `gFontXLatinGlyphWidths` du décomp).
 *  Utilisé par les `GetGlyphWidth_*` du miroir `src/game/text.ts` (VAGUE 2b-2).
 *  La couche data (chargement font) reste engine ; la logique de mesure migre. */
export function getFontGlyphWidths(fontId: number): Uint8Array {
  ensureFontLoaded();
  return _resolveFont(fontId).glyphWidths;
}

/** Accesseur HW des glyphes pré-décodés d'un font (= `gFontXLatinGlyphs` décomp).
 *  Pour le miroir `text.ts` (AddTextPrinter*, VAGUE 2e). */
export function getFontGlyphData(fontId: number): number[][] {
  ensureFontLoaded();
  return _resolveFont(fontId).glyphData;
}

/** Accesseur du `resolveFont` (switch glyph-set mid-string {FONT N}) pour le miroir. */
export function resolveFontForMirror(fontId: number): { glyphData: number[][]; glyphWidths: Uint8Array } {
  return _resolveFont(fontId);
}

/** Pixels de la down-arrow (▼ fin de message) — terrain/menus + alt combat.
 *  HW asset chargé par loadFontData ; exposé pour le miroir (AddTextPrinter*). */
export function getDownArrowPixels(): number[][] | null { return downArrowPixels; }
export function getDarkDownArrowPixels(): number[][] | null { return darkDownArrowPixels; }

// GetPlayerTextSpeed / GetPlayerTextSpeedDelay : RELOCALISÉS dans le miroir
// `src/game/menu.ts` (1:1 menu.c:474/481), ré-exportés en bas de module.

/** Force load font data (call during scene preload). */
export function preloadFontData(): Promise<void> {
  return loadFontData();
}

// GetStringWidth / GetStringRightAlignXOffset / GetStringCenterAlignXOffset —
// RELOCALISÉS dans le miroir `src/game/text.ts` (1:1 text.c:1328, VAGUE 2b-2 :
// state-machine byte-level complète — multi-ligne MAX, EXT_CTRL skip par code,
// placeholders gStringVar1-3/dynamic, EXTRA_SYMBOL, KEYPAD_ICON). Les WIDTH-TABLES
// HW restent ici (getFontGlyphWidths). Ré-exportés pour les ~31 consommateurs.
export { GetStringWidth, GetStringRightAlignXOffset, GetStringCenterAlignXOffset } from '../../text';

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

// 1:1 décomp `EWRAM_DATA u8 gStringVar1-4[]` = le miroir byte (string_util.ts),
// importé + ré-exporté ici (source UNIQUE). Plus de JS-string locale.
export { gStringVar1, gStringVar2, gStringVar3, gStringVar4 };

/** Remplit le buffer byte gStringVar4 via StringCopy (byte-level). Le décomp n'a
 *  pas de `setStringVar4` (les callers écrivent gStringVar4 via StringCopy /
 *  StringExpandPlaceholders direct) ; on garde ce helper pour les call-sites
 *  existants. `value` = bytes charmap (EOS-terminé). */
export function setStringVar4(value: Uint8Array): void {
  StringCopy(gStringVar4, value);
}

// Expose les BUFFERS byte (réf. stable, contenu mutable) sur globalThis pour les
// auto-callbacks / debug. Une seule fois (les buffers ne sont jamais réassignés).
if (!('gStringVar4' in globalThis)) {
  const g = globalThis as Record<string, unknown>;
  g.gStringVar1 = gStringVar1;
  g.gStringVar2 = gStringVar2;
  g.gStringVar3 = gStringVar3;
  g.gStringVar4 = gStringVar4;
}

// ─── Text printers registry — RELOCALISÉ dans `src/game/text.ts` ──────────────
// `sTextPrinters` (1:1 décomp text.c:39, indexé par windowId, `.active` sur le
// struct TextPrinter) y vit. Importé en tête ; `RunTextPrinters` le lit + mute `.active`.

// ─── API ─────────────────────────────────────────────────────────────────────

// `_getPlayerTextSpeedDelay` RELOCALISÉ → `GetPlayerTextSpeedDelay` dans le miroir
// `src/game/menu.ts` (1:1 menu.c:481, avec sTextSpeedFrameDelays).

// _addTextPrinterParameterizedCore + AddTextPrinterParameterized + P3 + P4
// RELOCALISÉS dans `src/game/text.ts` (VAGUE 2e), ré-exportés en tête de module.

// AddTextPrinterForMessage + AddTextPrinterWithCallbackForMessage RELOCALISÉS
// dans `src/game/text.ts` (VAGUE 2e), ré-exportés en tête de module.

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
  // 1:1 décomp text.c:944-953 — JOY_NEW/JOY_HELD(A|B) lus inline par RenderText
  // (pacing A/B + TextPrinterWait*). On publie l'état input AVANT RenderFont ; tout
  // le driving (WAIT/CLEAR/SCROLL_START/SCROLL/WAIT_SE + down-arrow + PlaySE) vit
  // désormais DANS RenderText (miroir src/game/text.ts), centralisé 1:1 décomp
  // (VAGUE 2 raffinement 1). Avant, ces transitions étaient pilotées ici.
  const newAB = !!(rt.gMain.newKeys & AB_MASK);
  const heldAB = !!(rt.gMain.heldKeys & AB_MASK);
  _setTextInputState(newAB, heldAB);

  // 1:1 décomp `src/text.c:319 RunTextPrinters` : pour chaque printer actif,
  // `RenderFont` puis switch(renderCmd) { PRINT→CopyWindowToVram ; UPDATE→callback ;
  // FINISH→active=FALSE }. Chez nous : CopyWindowToVram = `needsFlush` (posé par le
  // HW blit/scroll) ; le callback per-char = `onCharRendered` (fired dans RenderText).
  // 1:1 décomp text.c:325-343 — for (i=0; i<WINDOWS_MAX; i++) if (sTextPrinters[i].active)
  // { renderCmd = RenderFont(&sTextPrinters[i]); … case FINISH: active = FALSE; }.
  // Tableau creux indexé par windowId (slots vides = undefined → skip).
  for (let i = 0; i < sTextPrinters.length; i++) {
    const p = sTextPrinters[i];
    if (!p || !p.active) continue;
    const renderCmd = RenderFont(p);
    if (renderCmd === RENDER_FINISH) p.active = false;
  }
}

// IsTextPrinterActive + _debugGetTextPrinters + expositions globalThis
// (__debugGetTextPrinters / __gbaIsTextPrinterActive) RELOCALISÉS dans
// `src/game/text.ts` (VAGUE 2e). IsTextPrinterActive importé en tête.

// RunTextPrintersAndIsPrinter0Active : RELOCALISÉ dans le miroir `src/game/menu.ts`
// (1:1 menu.c:163), ré-exporté en bas de module.

// ClearTextPrinters + DeactivateAllTextPrinters RELOCALISÉS dans
// `src/game/text.ts` (VAGUE 2e), ré-exportés en tête de module.

// ─── String placeholders ────────────────────────────────────────────────────
// `StringExpandPlaceholders` (byte-level, récursif, 1:1 string_util.c:335) est
// désormais le miroir `src/game/string_util.ts`, importé + ré-exporté en tête de
// ce module. La version JS-string locale (regex) a été retirée (flip byte 2026-06-06).
export { StringExpandPlaceholders };

// ─── Font IDs / TEXT_SKIP_DRAW / attributs de font (text.h + text.c) ─────────
// RELOCALISÉS dans le miroir `src/game/text.ts` (1:1, VAGUE 2b). `sFontInfos` /
// `sMenuCursorDimensions` (privés) y vivent désormais. Importés en tête (usage
// interne) + ré-exportés ici pour les consommateurs de gba-text-system
// (bag-screen, party-screen, option-menu-impl, etc.).
export {
  FONT_SMALL, FONT_NORMAL, FONT_SHORT,
  FONT_SHORT_COPY_1, FONT_SHORT_COPY_2, FONT_SHORT_COPY_3,
  FONT_BRAILLE, FONT_NARROW, FONT_SMALL_NARROW, FONT_BOLD,
  TEXT_SKIP_DRAW,
  FONTATTR_MAX_LETTER_WIDTH, FONTATTR_MAX_LETTER_HEIGHT, FONTATTR_LETTER_SPACING,
  FONTATTR_LINE_SPACING, FONTATTR_UNKNOWN, FONTATTR_COLOR_FOREGROUND,
  FONTATTR_COLOR_BACKGROUND, FONTATTR_COLOR_SHADOW,
  GetFontAttribute, GetMenuCursorDimensionByFont,
};

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

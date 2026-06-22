/**
 * gba-text-printer.ts
 * --------------------
 * Moteur de rendu texte 1:1 GBA depuis le décomp pokeemeraude.
 *
 * Reproduit les primitives clés de `src/text.c` + `src/window.c` :
 *  - Window pixel buffer (au lieu d'un canvas Phaser direct)
 *  - TextPrinter state machine (RENDER_STATE_*)
 *  - Glyph blit avec remap idx 0/1/2/3 → bgColor/fgColor/shadowColor/boxFill
 *  - Down arrow state machine (subStruct->downArrowDelay/yPosIdx)
 *  - copyWindowToCanvas pour transfert vers texture Phaser
 *
 * Pourquoi : remplace les heuristiques du précédent `bitmap-font.ts` (RGB-replace
 * naïf + position arrow calculée hors state machine) qui divergeaient toujours
 * du rendu emulator. Cf. `AUDIT_1_1_GBA.md`.
 *
 * Simplifications vs décomp :
 *  - pixelBuffer stocke 1 byte par pixel (idx 0-15) au lieu de packed 4bpp.
 *    Économie complexité, surcoût mémoire négligeable (32×216 = 7 KB par dialog).
 *  - Pas de tile-based blit (window.c BlitBitmapRect copie tile-par-tile sur GBA),
 *    on opère pixel-par-pixel sur le buffer linéaire.
 *  - Half-row LUT couleurs n'est pas nécessaire : on remap directement 0/1/2/3
 *    au moment du blit.
 */

// EXT_CTRL_CODE sub-codes : SOURCE UNIQUE = `characters-data` (valeurs décomp
// characters.h). AVANT, ce fichier les définissait localement avec PAUSE /
// PAUSE_UNTIL_PRESS / WAIT_SE / PLAY_BGM / ESCAPE DÉCALÉS de +1 (bug 1:1) — ce
// qui divergeait de string_util/text.ts (qui utilisent characters-data). Unifié
// (VAGUE 2c-prep) pour que encodeur + runtime + mesure soient cohérents 1:1.
import {
  EXT_CTRL_CODE_COLOR, EXT_CTRL_CODE_HIGHLIGHT, EXT_CTRL_CODE_SHADOW,
  EXT_CTRL_CODE_PAUSE, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS, EXT_CTRL_CODE_WAIT_SE,
  EXT_CTRL_CODE_PLAY_BGM, EXT_CTRL_CODE_ESCAPE, EXT_CTRL_CODE_PLAY_SE,
  EXT_CTRL_CODE_CLEAR, EXT_CTRL_CODE_SKIP, EXT_CTRL_CODE_CLEAR_TO,
  EXT_CTRL_CODE_MIN_LETTER_SPACING, EXT_CTRL_CODE_FONT,
} from '../decomp-data/include/constants/characters-data';
// VAGUE 2c : `runTextPrinter` délègue à `RenderText` (miroir). Cycle
// gba-text-printer↔text.ts runtime-safe (RenderText n'utilise les exports de
// ce module que dans des fonctions, jamais au top-level).
import { RenderText } from '../../text';

// ─── Constantes 1:1 décomp ───────────────────────────────────────────────────

/** sDownArrowYCoords (text.c:75) — Y offset cyclic pour bobbing arrow */
export const DOWN_ARROW_Y_COORDS = [0, 1, 2, 1] as const;

/** Frames entre chaque pos arrow (text.c:832 `subStruct->downArrowDelay = 8`) */
export const DOWN_ARROW_DELAY_FRAMES = 8;

/** Hauteur ligne pour FONT_NORMAL (text.c:134 maxLetterHeight + lineSpacing=0) */
export const LINE_HEIGHT = 16;

/** Encoding bytes du décomp (cf. include/characters.h) */
export const CHAR_NEWLINE = 0xFE;
export const CHAR_PROMPT_SCROLL = 0xFA;
export const CHAR_PROMPT_CLEAR = 0xFB;
export const EXT_CTRL_CODE_BEGIN = 0xFC;
export const EOS = 0xFF;

/** 1:1 décomp include/constants/characters.h:172-174 */
export const CHAR_DYNAMIC = 0xF7;
export const CHAR_KEYPAD_ICON = 0xF8;
export const CHAR_EXTRA_SYMBOL = 0xF9;

/** EXTRA_SYMBOL glyphs (1:1 décomp `charmap.txt:1015-1086`). Le render fait
 *  `currChar = symByte | 0x100` (text.c:1110) → glyph index 0x100..0x1FF dans
 *  la latfont (= 2e moitié du png 256×512, extraite par extract-latfont.mjs).
 *  Encodés `{NAME}` dans nos strings (= analogue au `{LV_2}` du décomp FR
 *  `gText_XNatureMetAtYZ`). Sous-set texte (F9 00-17) + emojis (F9 D0-FE). */
export const EXTRA_SYMBOL: Readonly<Record<string, number>> = Object.freeze({
  UP_ARROW_2: 0x00, DOWN_ARROW_2: 0x01, LEFT_ARROW_2: 0x02, RIGHT_ARROW_2: 0x03,
  PLUS: 0x04, LV_2: 0x05, PP: 0x06, ID: 0x07, NO: 0x08, UNDERSCORE: 0x09,
  CIRCLE_1: 0x0A, CIRCLE_2: 0x0B, CIRCLE_3: 0x0C, CIRCLE_4: 0x0D, CIRCLE_5: 0x0E,
  CIRCLE_6: 0x0F, CIRCLE_7: 0x10, CIRCLE_8: 0x11, CIRCLE_9: 0x12,
  ROUND_LEFT_PAREN: 0x13, ROUND_RIGHT_PAREN: 0x14, CIRCLE_DOT: 0x15,
  TRIANGLE: 0x16, BIG_MULT_X: 0x17,
});

// EXT_CTRL_CODE sub-codes — ré-exportés depuis `characters-data` (source unique,
// valeurs décomp). Les bindings sont importés en tête de fichier.
export {
  EXT_CTRL_CODE_COLOR, EXT_CTRL_CODE_HIGHLIGHT, EXT_CTRL_CODE_SHADOW,
  EXT_CTRL_CODE_PAUSE, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS, EXT_CTRL_CODE_WAIT_SE,
  EXT_CTRL_CODE_PLAY_BGM, EXT_CTRL_CODE_ESCAPE, EXT_CTRL_CODE_PLAY_SE,
  EXT_CTRL_CODE_CLEAR, EXT_CTRL_CODE_SKIP, EXT_CTRL_CODE_CLEAR_TO,
  EXT_CTRL_CODE_MIN_LETTER_SPACING, EXT_CTRL_CODE_FONT,
};

/** sFontInfos[FONT_NORMAL] (text.c:131) — couleurs par défaut text dialog */
export const FONT_NORMAL_FG = 2;       // dark gray (palette[2])
export const FONT_NORMAL_BG = 1;       // white (palette[1])
export const FONT_NORMAL_SHADOW = 3;   // cream/light (palette[3])

/** TEXT_COLOR_* constants (cf. include/constants/characters.h:234-249).
 *  Idx dans la palette runtime active. La palette détermine la couleur visuelle. */
export const TEXT_COLOR = Object.freeze({
  TRANSPARENT: 0x0,
  WHITE: 0x1,
  DARK_GRAY: 0x2,
  LIGHT_GRAY: 0x3,
  RED: 0x4,
  LIGHT_RED: 0x5,
  GREEN: 0x6,
  LIGHT_GREEN: 0x7,
  BLUE: 0x8,
  LIGHT_BLUE: 0x9,
  DYNAMIC_COLOR_1: 0xA,
  DYNAMIC_COLOR_2: 0xB,
  DYNAMIC_COLOR_3: 0xC,
  DYNAMIC_COLOR_4: 0xD,
  DYNAMIC_COLOR_5: 0xE,
  DYNAMIC_COLOR_6: 0xF,
});

// 1:1 STRICT décomp gTextFlags global (= include/text.h struct). Set par
// scenes/init pour controller le rendering (= A/B speed up, auto scroll,
// arrow shape, etc.).
export const gTextFlags = {
  canABSpeedUpPrint: true,  // default TRUE pour Birch + dialogues normaux
  useAlternateDownArrow: false,  // 1:1 décomp : Pokenav use l'alternate down arrow.
  forceMidTextSpeed: false,
  autoScroll: false,
};

// Module-level input state mis à jour par RunTextPrinters à chaque frame.
// Lu par runTextPrinter (= 1:1 décomp JOY_NEW/JOY_HELD inline).
let _newABPressed = false;
let _heldABPressed = false;

export function _setTextInputState(newAB: boolean, heldAB: boolean): void {
  _newABPressed = newAB;
  _heldABPressed = heldAB;
}

/** Lit l'état input texte (= JOY_NEW/JOY_HELD A|B inline du décomp). Exposé pour
 *  `RenderText` du miroir `src/game/text.ts` (VAGUE 2c). */
export function _getTextInputState(): { newAB: boolean; heldAB: boolean } {
  return { newAB: _newABPressed, heldAB: _heldABPressed };
}

/** Render states 1:1 décomp `include/text.h:32-39` enum :
 *    HANDLE_CHAR, WAIT, CLEAR, SCROLL_START, SCROLL, WAIT_SE, PAUSE.
 *  RENDER_STATE_FINISH n'existe pas dans le décomp (= EOS retourne RENDER_FINISH directement). */
export const RENDER_STATE_HANDLE_CHAR = 0;
export const RENDER_STATE_WAIT = 1;
export const RENDER_STATE_CLEAR = 2;
export const RENDER_STATE_SCROLL_START = 3;
export const RENDER_STATE_SCROLL = 4;
export const RENDER_STATE_WAIT_SE = 5;
export const RENDER_STATE_PAUSE = 6;
/** Alias backwards-compat — anciens callers utilisaient WAIT_WITH_DOWN_ARROW
 *  comme générique "wait avec ❤️ visible". Maintenant on distingue CLEAR vs
 *  SCROLL_START vs WAIT (= no arrow) selon le décomp. Cet alias pointe sur
 *  CLEAR (= comportement le plus courant pour `\p`). */
export const RENDER_STATE_WAIT_WITH_DOWN_ARROW = RENDER_STATE_CLEAR;
export const RENDER_STATE_FINISH = -1;  // Pas un state du décomp, sentinel value pour code legacy.

/** Codes de retour runTextPrinter */
export const RENDER_FINISH = 0xFF;
export const RENDER_REPEAT = 1;
export const RENDER_PRINT = 2;
export const RENDER_UPDATE = 3;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Window {
  /** Largeur en tiles (1 tile = 8 px). */
  widthTiles: number;
  /** Hauteur en tiles. */
  heightTiles: number;
  /** Largeur en pixels (= widthTiles * 8). */
  widthPx: number;
  /** Hauteur en pixels (= heightTiles * 8). */
  heightPx: number;
  /** Pixel buffer linéaire : 1 byte par pixel = idx 0-15 dans la palette. */
  pixelBuffer: Uint8Array;
  /** Index palette (0-15) à appliquer au copy. */
  paletteNum: number;
  /** Dirty flag — true si pixelBuffer modifié depuis dernier copy. */
  needsFlush: boolean;
}

/** 1:1 décomp `struct TextPrinterTemplate` (text.h:64-79) — le template reçu par
 *  le callback (décomp : `callback(struct TextPrinterTemplate *, u16)`). NB :
 *  décomp `currentChar` = `const u8*` (pointeur dans la string) ; chez nous = INDEX
 *  dans `printer.encodedString` (le buffer string vit sur le printer, extension). */
export interface TextPrinterTemplate {
  currentChar: number;   // index (décomp: const u8* pointeur dans la string)
  windowId: number;
  fontId: number;        // font INITIAL (le font courant = subStruct.fontId)
  x: number;             // origin column (constant)
  y: number;             // origin row (constant)
  currentX: number;      // cursor courant
  currentY: number;
  letterSpacing: number;
  lineSpacing: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

/** 1:1 décomp `struct TextPrinterSubStruct` (text.h:53-62). Décomp : blob
 *  `subStructFields[7]` casté en bitfield (hack mémoire GBA) ; ici = objet nommé
 *  (mêmes champs, pas le cast byte-blob). */
export interface TextPrinterSubStruct {
  fontId: number;             // font COURANT (dispatch DecompressGlyph_<font>)
  hasPrintBeenSpedUp: boolean; // TRUE après JOY_NEW(A|B) pendant le rendu (fast-forward)
  downArrowDelay: number;
  downArrowYPosIdx: number;
  hasFontIdBeenSet: boolean;
  autoScrollDelay: number;     // TextPrinterWaitAutoMode (text.c:850)
}

export interface TextPrinter {
  // ── 1:1 décomp struct TextPrinter (text.h:81-95) ──
  printerTemplate: TextPrinterTemplate;
  subStruct: TextPrinterSubStruct;
  /** 1:1 décomp `TextPrinter.active` (text.h:88) — slot actif dans sTextPrinters.
   *  TRUE à l'ajout (typewriter) ; FALSE après rendu instantané ou RENDER_FINISH. */
  active: boolean;
  state: number;
  textSpeed: number;       // frames de delay entre chars (= -1 du input, AddTextPrinter:296)
  delayCounter: number;
  scrollDistance: number;  // pixels restants à scroll (RENDER_STATE_SCROLL, entre `\l` et reprise)
  minLetterSpacing: number; // EXT_CTRL_CODE_MIN_LETTER_SPACING — largeur d'avance min
  japanese: boolean;        // EXT_CTRL_CODE_JPN — toujours false en FR/OW

  // ── Extensions (PAS dans le struct décomp ; nécessaires à notre émulation) ──
  /** Buffer string (décomp : `printerTemplate.currentChar` EST le pointeur ; chez
   *  nous, l'index `printerTemplate.currentChar` indexe CE buffer). */
  encodedString: Uint8Array;
  /** Window objet (décomp : `gWindows[printerTemplate.windowId]`). */
  window: Window;
  /** Render instantané vs typewriter (décomp : boucle 0x400 d'AddTextPrinter:303-308). */
  instantPath: boolean;
  /** Compteur PAUSE (décomp réutilise delayCounter ; séparé ici pour ne pas
   *  interférer avec le delay typewriter). */
  pauseCounter: number;
  downArrowPixels?: number[][];      // down_arrow.png (terrain/menus, idx 0/2/4)
  darkDownArrowPixels?: number[][];  // 1:1 sDarkDownArrowTiles (down_arrow_alt, combat, idx 1/2/10)
  /** Callback per-char (décomp : `callback(TextPrinterTemplate*, renderCmd)` per-frame ;
   *  notre variante per-char + lastByte = sync Lotad du Birch speech sur EXT_CTRL_CODE_PAUSE). */
  onCharRendered?: (printer: TextPrinter, lastByte: number) => void;
}

// ─── API Window ──────────────────────────────────────────────────────────────

export function createWindow(widthTiles: number, heightTiles: number, paletteNum = 15): Window {
  const widthPx = widthTiles * 8;
  const heightPx = heightTiles * 8;
  return {
    widthTiles,
    heightTiles,
    widthPx,
    heightPx,
    pixelBuffer: new Uint8Array(widthPx * heightPx),
    paletteNum,
    needsFlush: true,
  };
}

/** Remplit tout le pixelBuffer avec idx (text.c FillWindowPixelBuffer). */
/** 1:1 décomp `window.c ScrollWindow(windowId, direction=0, distance, fillValue)`.
 *  Direction 0 = shift content UP (= view scrolls up, content moves up,
 *  bottom rows filled with fillValue). 1:1 décomp comportement.
 *
 *  Notre pixelBuffer est 1 byte/pixel (= idx 0-15 dans la palette). Le décomp
 *  opère sur tileData 4bpp packed (= 2 pixels/byte) mais sémantiquement c'est
 *  pareil : shift up + fill bottom. */
export function scrollWindow(w: Window, deltaY: number, fillValue: number): void {
  const stride = w.widthPx;
  const height = w.heightPx;
  if (deltaY <= 0 || deltaY >= height) return;
  // Shift up : copy lignes [deltaY..height) → [0..height-deltaY)
  w.pixelBuffer.copyWithin(0, deltaY * stride, height * stride);
  // Fill lignes [height-deltaY..height) avec fillValue & 0xF (= idx palette,
  // 1 byte/pixel chez nous, pas le packed nibbles 4bpp).
  w.pixelBuffer.fill(fillValue & 0xF, (height - deltaY) * stride, height * stride);
  w.needsFlush = true;
}

export function fillWindowPixelBuffer(w: Window, idx: number): void {
  w.pixelBuffer.fill(idx & 0x0F);
  w.needsFlush = true;
}

/** Remplit un rect du pixelBuffer (text.c FillWindowPixelRect). */
export function fillWindowPixelRect(w: Window, idx: number, x: number, y: number, width: number, height: number): void {
  const v = idx & 0x0F;
  for (let py = 0; py < height; py++) {
    const rowY = y + py;
    if (rowY < 0 || rowY >= w.heightPx) continue;
    const rowStart = rowY * w.widthPx;
    for (let px = 0; px < width; px++) {
      const colX = x + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      w.pixelBuffer[rowStart + colX] = v;
    }
  }
  w.needsFlush = true;
}

/**
 * Blit un glyph 8×16 dans le pixelBuffer en remappant idx 0/1/2/3 :
 *   - 0 (BG)        → bgColor       (typiquement palette idx 1 = white = "transparent" sur dialog)
 *   - 1 (FG)        → fgColor       (typiquement 2 = dark gray = body texte)
 *   - 2 (SHADOW)    → shadowColor   (typiquement 3 = cream = drop shadow)
 *   - 3 (BOX_FILL)  → bgColor       (matche le fond de la window)
 *
 * Cf. décomp `DecompressGlyphTile` (text.c:526) + `GenerateFontHalfRowLookupTable`
 * (text.c:363) qui font équivalent via une LUT 0x51 entries pour packing 4bpp.
 *
 * @param glyphPixels Array 256 = 16 cols × 16 rows = 256 idx (depuis latfont.json[byte]).
 *                   1:1 décomp : la cell font est 16×16 ; les glyphs ≤8px
 *                   n'utilisent que les cols gauches, les EXTRA_SYMBOL larges
 *                   (`{NO}` `{LV_2}` w10) utilisent jusqu'à 16 cols.
 * @param dstX,dstY  Position dans pixelBuffer (origin glyph top-left)
 * @param glyphW     Largeur effective glyph (depuis widths[byte] = 1:1
 *                   gFontNormalLatinGlyphWidths). Le blit ne lit que
 *                   `px < glyphW` → stride 16 sans toucher au rendu des
 *                   chars étroits (zéro régression).
 */
export function blitGlyphToWindow(
  w: Window,
  glyphPixels: number[],
  dstX: number,
  dstY: number,
  glyphW: number,
  fgColor: number,
  bgColor: number,
  shadowColor: number,
): void {
  const GLYPH_W = 16; // stride 1:1 cell font 16×16 (cf. extract-latfont.mjs)
  for (let py = 0; py < 16; py++) {
    const rowY = dstY + py;
    if (rowY < 0 || rowY >= w.heightPx) continue;
    const rowStart = rowY * w.widthPx;
    for (let px = 0; px < glyphW; px++) {
      const colX = dstX + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      const srcIdx = glyphPixels[py * GLYPH_W + px];
      // 1:1 décomp `GenerateFontHalfRowLookupTable` (text.c:363) +
      // `sFontHalfRowOffsets` (text.c:51) : le glyph est 2-bit (valeurs 0/1/2/3).
      // Mapping EXACT :
      //   - glyph 0 → bgColor
      //   - glyph 1 → fgColor
      //   - glyph 2 → shadowColor
      //   - glyph 3 → bgColor   (sFontHalfRowOffsets[3]==sFontHalfRowOffsets[0]
      //                           = value 3 ALIASÉE à value 0)
      // Le décomp écrit TOUJOURS la couleur (jamais "skip") : si la couleur ==
      // TEXT_COLOR_TRANSPARENT (0), le pixel devient palette idx 0 = transparent
      // (backdrop visible). Notre pixelBuffer idx 0 == transparent au compositor,
      // donc écrire 0 ≡ l'ancien "skip" pour le cas transparent — MAIS pour
      // bgColor != 0 (= dialog battle rouge, fillValue PIXEL_FILL(0xF)), le fond
      // DERRIÈRE/AUTOUR des lettres est maintenant rempli avec bgColor (1:1),
      // au lieu de laisser voir le BG dessous (bug "dialog box pas rouge").
      let mappedIdx: number;
      switch (srcIdx) {
        case 1:
          if (fgColor === 0) continue;            // fg transparent → skip
          mappedIdx = fgColor;                    // FG = couleur texte
          break;
        case 2:
          if (shadowColor === 0) continue;        // shadow transparent → skip
          mappedIdx = shadowColor;                // SHADOW = ombre
          break;
        case 3:
        default:
          // 1:1 décomp : glyph 0 et 3 (aliasée à 0) → bgColor.
          // NUANCE archi : notre window idx 0 == transparent (le BG dessous
          // montre), alors que le décomp window idx 0 == palette[0] (couleur).
          // Le décomp met bgColor==TEXT_COLOR_TRANSPARENT(0) JUSTEMENT quand il
          // veut du transparent → chez nous, "skip" (= préserver le fillBuffer,
          // donc le cadre/fond déjà dessiné dans la window) EST le comportement
          // voulu pour bgColor==0 (sinon on écrase un cadre custom par du
          // transparent → "tiles invisibles" map-name-popup / party screen).
          // Pour bgColor != 0 (= dialog battle B_WIN_MSG bgColor=15 → rouge
          // via text.pal), on écrit bien bgColor 1:1 décomp.
          if (bgColor === 0) continue;
          mappedIdx = bgColor;
          break;
      }
      w.pixelBuffer[rowStart + colX] = mappedIdx & 0x0F;
    }
  }
  w.needsFlush = true;
}

/**
 * Convertit le pixelBuffer (idx 0-15) en canvas RGBA via la palette runtime.
 * Idx 0 = transparent (alpha 0), autres = RGB depuis palette[idx].
 *
 * Cf. décomp `CopyWindowToVram` (window.c:514) qui transfère tile-by-tile vers
 * VRAM 4bpp + applique palette via PPU à l'affichage.
 */
export function copyWindowToCanvas(w: Window, palette: ReadonlyArray<readonly [number, number, number]>): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w.widthPx;
  canvas.height = w.heightPx;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(w.widthPx, w.heightPx);
  const data = imageData.data;
  for (let i = 0; i < w.pixelBuffer.length; i++) {
    const idx = w.pixelBuffer[i];
    const o = i * 4;
    if (idx === 0) {
      data[o + 3] = 0; // transparent
    } else {
      const c = palette[idx] ?? [255, 0, 255]; // magenta = palette miss visible
      data[o] = c[0];
      data[o + 1] = c[1];
      data[o + 2] = c[2];
      data[o + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  w.needsFlush = false;
  return canvas;
}

// ─── API TextPrinter ─────────────────────────────────────────────────────────

/**
 * Encode une JS string en bytes pour le moteur, via charmap.
 * Gère :
 *   - \n → CHAR_NEWLINE
 *   - {COLOR XXX}    → EXT_CTRL_CODE_BEGIN + COLOR + idx (3 bytes)
 *   - {SHADOW XXX}   → EXT_CTRL_CODE_BEGIN + SHADOW + idx
 *   - {HIGHLIGHT XXX}→ EXT_CTRL_CODE_BEGIN + HIGHLIGHT + idx
 *   - {PAUSE N}      → EXT_CTRL_CODE_BEGIN + PAUSE + N
 *   - Tout char dans charmap → byte
 *
 * (Pas de \p / \l ici — gérés en amont par paginate.)
 */
export function encodeStringForFont(str: string, charmap: Record<string, number>): Uint8Array {
  const bytes: number[] = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === '\n') {
      bytes.push(CHAR_NEWLINE);
      i++;
      continue;
    }
    // 1:1 décomp escape sequences. \p = PROMPT_CLEAR (= page break propre :
    // clear window + wait A press + new page), \l = PROMPT_SCROLL (= scroll up
    // + wait A press), \n = newline.
    if (ch === '\\' && i + 1 < str.length) {
      const next = str[i + 1];
      if (next === 'p') {
        bytes.push(CHAR_PROMPT_CLEAR);
        i += 2;
        continue;
      }
      if (next === 'l') {
        bytes.push(CHAR_PROMPT_SCROLL);
        i += 2;
        continue;
      }
      if (next === 'n') {
        bytes.push(CHAR_NEWLINE);
        i += 2;
        continue;
      }
    }
    if (ch === '{') {
      const closeIdx = str.indexOf('}', i + 1);
      if (closeIdx > 0) {
        const inner = str.slice(i + 1, closeIdx).trim();
        // 1:1 décomp `{PAUSE_UNTIL_PRESS}` (EXT_CTRL_CODE_PAUSE_UNTIL_PRESS, 2 bytes,
        // SANS param) = attend l'appui A (▼) sans clear. Traité AVANT le regex param
        // ci-dessous (qui exige `\s+(\S+)` → ne matche pas un code sans argument).
        if (inner === 'PAUSE_UNTIL_PRESS') {
          bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS);
          i = closeIdx + 1;
          continue;
        }
        // 1:1 décomp : codes ext SANS param textuel. WAIT_SE (0 arg). PLAY_BGM /
        // PLAY_SE : 0xFC + sub, PUIS un arg u16 écrit dans le string comme 2 octets
        // bruts qui SUIVENT (ex. capture : {PLAY_BGM}{0x60}À = 0xFC 0x0B 0x60 0x01).
        // RenderText consomme ces 2 octets. AVANT : ces tokens tombaient dans le
        // skip silencieux → l'arg de PLAY_BGM était désaligné et le `À` (octet haut
        // du song) s'affichait en parasite (bug user "attrapé!À♥").
        if (inner === 'WAIT_SE') { bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_WAIT_SE); i = closeIdx + 1; continue; }
        if (inner === 'PLAY_BGM') { bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_BGM); i = closeIdx + 1; continue; }
        if (inner === 'PLAY_SE') { bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_SE); i = closeIdx + 1; continue; }
        // octet littéral {0xNN} (décomp charmap : insère le byte brut — utilisé
        // comme arg d'un code ext, ex. le song id de PLAY_BGM écrit {0x60}À).
        if (/^0x[0-9a-fA-F]{1,2}$/.test(inner)) { bytes.push(parseInt(inner, 16) & 0xFF); i = closeIdx + 1; continue; }
        // Bug session 96 : ce regex ne matchait QUE COLOR/SHADOW/HIGHLIGHT/PAUSE.
        // Du coup `{CLEAR N}` / `{SKIP N}` / `{CLEAR_TO N}` / `{MIN_LETTER_SPACING N}`
        // tombaient dans le fallback "skip silencieusement" (= ligne 421), et
        // les naming screen keyboard strings perdaient TOUS leurs CLEAR codes →
        // lettres collées (= bug visuel ABCDEFGH crammed in left half).
        // Fix : étendre regex à tous les ctrl codes valides.
        const m = inner.match(/^(COLOR|SHADOW|HIGHLIGHT|PAUSE|CLEAR_TO|CLEAR|SKIP|MIN_LETTER_SPACING|FONT)\s+(\S+)$/);
        if (m) {
          const cmd = m[1];
          const param = m[2];
          let subCode: number | null = null;
          let value: number | null = null;
          // 1:1 décomp EXT_CTRL_CODE_FONT (0x06) : switch font mid-string (= move
          // interface "TYPE/"{FONT NORMAL}<type>). Notre engine a 1 seul glyph-set,
          // donc ça ne change que le letterSpacing du font (cf. render handler).
          if (cmd === 'FONT') {
            subCode = EXT_CTRL_CODE_FONT;
            const fontMap: Record<string, number> = { SMALL: 0, NORMAL: 1, SHORT: 2, NARROW: 7, SMALL_NARROW: 8, BOLD: 9 };
            value = fontMap[param] ?? parseInt(param, 10);
          }
          else if (cmd === 'COLOR') { subCode = EXT_CTRL_CODE_COLOR; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
          else if (cmd === 'SHADOW') { subCode = EXT_CTRL_CODE_SHADOW; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
          else if (cmd === 'HIGHLIGHT') { subCode = EXT_CTRL_CODE_HIGHLIGHT; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
          else if (cmd === 'PAUSE') { subCode = EXT_CTRL_CODE_PAUSE; value = parseInt(param, 10); }
          // 1:1 décomp src/text.c:1023-1043 :
          //   CLEAR    : skip N pixels horizontally (advance currentX by N).
          //   SKIP     : set currentX absolu (= window-relative origin x + N).
          //   CLEAR_TO : pad jusqu'à ce que currentX atteigne x=N (window-relative).
          // Utilisé par naming_screen.c:sNamingScreenKeyboardText pour kerner les
          // chars selon sPageColumnXPos. Sans ces codes, les chars rendus
          // char-par-char sont décalés vs cursor sprite anchor.
          else if (cmd === 'CLEAR') { subCode = EXT_CTRL_CODE_CLEAR; value = parseInt(param, 10); }
          else if (cmd === 'SKIP') { subCode = EXT_CTRL_CODE_SKIP; value = parseInt(param, 10); }
          else if (cmd === 'CLEAR_TO') { subCode = EXT_CTRL_CODE_CLEAR_TO; value = parseInt(param, 10); }
          else if (cmd === 'MIN_LETTER_SPACING') { subCode = EXT_CTRL_CODE_MIN_LETTER_SPACING; value = parseInt(param, 10); }
          if (subCode !== null && value !== null && Number.isFinite(value)) {
            bytes.push(EXT_CTRL_CODE_BEGIN, subCode, value);
            i = closeIdx + 1;
            continue;
          }
        }
        // 1:1 décomp : EXTRA_SYMBOL `{LV_2}` `{NO}` `{PP}` `{ID}` `{PLUS}` etc.
        // (charmap.txt:1015-1038). Encodé `CHAR_EXTRA_SYMBOL(0xF9) + symByte`,
        // rendu glyph `symByte | 0x100` (text.c:1110). Sans ça `{LV_2}`/`{NO}`
        // tombaient dans le skip silencieux → "N." / "№" absents du Mémo/ID.
        const sym = EXTRA_SYMBOL[inner as keyof typeof EXTRA_SYMBOL];
        if (sym !== undefined) {
          bytes.push(CHAR_EXTRA_SYMBOL, sym);
          i = closeIdx + 1;
          continue;
        }
      }
      // Inconnu : skip silencieusement (déjà processed par substitutePlaceholders ou non supporté)
      i = closeIdx > 0 ? closeIdx + 1 : i + 1;
      continue;
    }
    bytes.push(charmap[ch] ?? charmap[' '] ?? 0);
    i++;
  }
  bytes.push(EOS);
  return new Uint8Array(bytes);
}

export interface AddTextPrinterOpts {
  window: Window;
  encodedString: Uint8Array;
  /** 1:1 décomp `TextPrinterTemplate.windowId`. Notre HW utilise `window` (objet)
   *  mais on garde l'id pour la fidélité du struct printerTemplate. */
  windowId?: number;
  /** 1:1 décomp `TextPrinterTemplate.fontId` — font initial. Le rendu lit la
   *  glyph data GLOBALE getFontGlyphData(fontId) (pas de cache par-printer). */
  fontId?: number;
  x?: number;
  y?: number;
  fgColor?: number;
  bgColor?: number;
  shadowColor?: number;
  /** 1:1 décomp `struct TextPrinterTemplate.letterSpacing` — px ajoutés
   *  après chaque glyph (rendu : `currentX += glyphW + letterSpacing`).
   *  Rempli par AddTextPrinterParameterized3 (= GetFontAttribute) / 4
   *  (= param explicite, list_menu.c template.lettersSpacing). */
  letterSpacing?: number;
  /** 1:1 décomp `struct TextPrinterTemplate.lineSpacing`. */
  lineSpacing?: number;
  textSpeed?: number;
  downArrowPixels?: number[][];
  darkDownArrowPixels?: number[][];  // 1:1 sDarkDownArrowTiles (down_arrow_alt) — combat
  onCharRendered?: (printer: TextPrinter, lastByte: number) => void;
}

export function addTextPrinter(opts: AddTextPrinterOpts): TextPrinter {
  const x = opts.x ?? 0;
  const y = opts.y ?? 1;
  // 1:1 décomp `text.c:271-298 AddTextPrinter` :
  //   sTempTextPrinter.textSpeed = speed;
  //   ...
  //   if (speed != TEXT_SKIP_DRAW && speed != 0) {
  //       --sTempTextPrinter.textSpeed;   // ← KEY : décrément à l'init
  //       sTextPrinters[windowId] = sTempTextPrinter;
  //   } else {
  //       sTempTextPrinter.textSpeed = 0;
  //       // render all at once (= instant via for loop 0x400)
  //   }
  //
  // sTextSpeeds[] (menu.c:79-81) = {SLOW=8, MID=4, FAST=1}.
  // Après --textSpeed à l'init :
  //   SLOW : stored=7 → wait check `delayCounter && 7` true → 8 frames per char
  //   MID  : stored=3 → wait check true → 4 frames per char
  //   FAST : stored=0 → wait check `delayCounter && 0` FALSE → 0 frames wait
  //          → 1 char/frame = 60 chars/sec = MÊME vitesse que JOY_HELD(A/B) +
  //          spedUp (= delayCounter forced 0 par le first if). USER-FLAG
  //          2026-05-20 : "speed 3 n'est toujours pas aussi rapide que
  //          maintenir A ou B" — fix : appliquer le --textSpeed décomp.
  //
  // TEXT_SKIP_DRAW (255) / speed=0 : path "render all at once" = instant.
  // Notre impl distingue ces 2 cas via textSpeed === 0 + path do-while continue
  // (= rend toute la chaîne en 1 frame, cf. ligne ~815 plus bas).
  const TEXT_SKIP_DRAW = 255;
  const inputSpeed = opts.textSpeed ?? 0;
  // 1:1 décomp `text.c:271-298 AddTextPrinter` :
  //   if (speed != TEXT_SKIP_DRAW && speed != 0) {
  //       --sTempTextPrinter.textSpeed;     // typewriter path
  //   } else {
  //       sTempTextPrinter.textSpeed = 0;   // instant path
  //   }
  const isInstantPath = inputSpeed === TEXT_SKIP_DRAW || inputSpeed === 0;
  const normalizedSpeed = isInstantPath ? 0 : (inputSpeed - 1);
  const fontId = opts.fontId ?? 1;  // 1 = FONT_NORMAL (défaut décomp)
  return {
    // 1:1 décomp printerTemplate (le bloc rempli par AddTextPrinter*).
    printerTemplate: {
      currentChar: 0,
      windowId: opts.windowId ?? 0,
      fontId,
      x, y,
      currentX: x,
      currentY: y,
      letterSpacing: opts.letterSpacing ?? 0,
      lineSpacing: opts.lineSpacing ?? 0,
      fgColor: opts.fgColor ?? FONT_NORMAL_FG,
      bgColor: opts.bgColor ?? FONT_NORMAL_BG,
      shadowColor: opts.shadowColor ?? FONT_NORMAL_SHADOW,
    },
    // 1:1 décomp subStruct (zéro-init à l'ajout, text.c:285-286 ; fontId courant = initial).
    subStruct: {
      fontId,
      hasPrintBeenSpedUp: false,
      downArrowDelay: 0,
      downArrowYPosIdx: 0,
      hasFontIdBeenSet: true,  // fontId déjà posé (= FontFunc l'aurait set au 1er render)
      autoScrollDelay: 0,
    },
    active: true,  // 1:1 décomp sTempTextPrinter.active = TRUE (text.c:279)
    state: RENDER_STATE_HANDLE_CHAR,
    textSpeed: normalizedSpeed,
    delayCounter: 0,
    scrollDistance: 0,
    minLetterSpacing: 0,
    japanese: false,
    // Extensions.
    encodedString: opts.encodedString,
    window: opts.window,
    instantPath: isInstantPath,
    pauseCounter: 0,
    downArrowPixels: opts.downArrowPixels,
    darkDownArrowPixels: opts.darkDownArrowPixels,
    onCharRendered: opts.onCharRendered,
  };
}

/**
 * State machine principale. Appelée chaque frame (Phaser update).
 * Cf. décomp `RenderText` (text.c:934) — version simplifiée (pas de scroll/clear pour MVP).
 *
 * @returns RENDER_FINISH si EOS atteint, RENDER_PRINT si char rendered ce tick,
 *          RENDER_UPDATE si state change, RENDER_REPEAT pour re-tick immédiat.
 */
export function runTextPrinter(printer: TextPrinter): number {
  // RELOCALISÉ (VAGUE 2c) → `RenderText` dans le miroir `src/game/text.ts`
  // (state-machine `switch(state)` 1:1 text.c:934). Ce wrapper délègue ; la
  // logique de rendu per-char vit désormais dans le miroir (le HW blit glyphe
  // reste ici, importé par RenderText). Cycle gba-text-printer↔text.ts
  // runtime-safe (usages dans des fonctions, pas au top-level).
  return RenderText(printer);
}

/**
 * Blit / refresh la down arrow à (currentX, currentY) avec animation bobbing.
 * À appeler chaque frame quand `printer.state === RENDER_STATE_WAIT_WITH_DOWN_ARROW`.
 *
 * Cf. décomp `TextPrinterDrawDownArrow` (text.c:787-836).
 */
export function textPrinterDrawDownArrow(printer: TextPrinter): void {
  // 1:1 décomp text.c:808-817 — `switch (gTextFlags.useAlternateDownArrow)` :
  //   FALSE (terrain/menus) → sDownArrowTiles     (down_arrow.png,     idx 0/2/4)
  //   TRUE  (COMBAT/evo)    → sDarkDownArrowTiles (down_arrow_alt.png, idx 1/2/10)
  // Le flag est posé par BattlePutTextOnWindow (TRUE, battle_message.c:3074-3077)
  // / InitFieldMessageBox (FALSE, field_message_box.c:18). Lecture au DRAW time
  // (par-frame) = 1:1 strict. La flèche alt a des INDICES différents authored pour
  // la palette textbox COMBAT — c'est pourquoi GF maintient deux graphismes (la
  // flèche terrain rendue dans la palette combat donnait bleu+contour-rouge).
  const arrowPixels = gTextFlags.useAlternateDownArrow
    ? (printer.darkDownArrowPixels ?? printer.downArrowPixels)
    : printer.downArrowPixels;
  if (!arrowPixels) return;

  if (printer.subStruct.downArrowDelay !== 0) {
    printer.subStruct.downArrowDelay--;
    return;
  }

  // Clear l'ancienne arrow (rect 8×16 bg color)
  fillWindowPixelRect(
    printer.window,
    printer.printerTemplate.bgColor,
    printer.printerTemplate.currentX,
    printer.printerTemplate.currentY,
    8,
    16,
  );

  // Blit nouvelle arrow avec offset Y selon yPosIdx
  const srcYOffset = DOWN_ARROW_Y_COORDS[printer.subStruct.downArrowYPosIdx & 3];
  blitArrowAt(
    printer.window,
    arrowPixels,
    printer.printerTemplate.currentX,
    printer.printerTemplate.currentY,
    srcYOffset,
  );

  // Reset delay + advance idx
  printer.subStruct.downArrowDelay = DOWN_ARROW_DELAY_FRAMES;
  printer.subStruct.downArrowYPosIdx++;
}

/**
 * Blit l'arrow 8×16 à (dstX, dstY) en samplant src à (0, srcY).
 * L'arrow PNG fait 8×48 — srcY offset 0/1/2 pour bobbing.
 *
 * On écrit les idx PNG 4bpp DIRECTEMENT dans le pixel buffer SANS remap : le
 * copyWindowToCanvas appliquera la palette runtime de la fenêtre. Les deux
 * graphismes sont authored par idx pour leur palette cible :
 *   - down_arrow.png     (terrain) : idx 0=BG, 2=contour, 4=rouge → gMessageBox_Pal
 *   - down_arrow_alt.png (combat)  : idx 10=fond box, 1=contour blanc, 2=rouge → textbox_0.pal
 *
 * `if (srcIdx === 0) continue` = 1:1 décomp `BlitBitmapRectToWindow` qui passe
 * `colorKey = 0` (window.c:411 → blit.c:61 `if (toOrr != colorKey)`) : l'idx 0
 * est la couleur-clé transparente. La flèche terrain a son surround en idx 0
 * (sauté → fond box dessous visible) ; la flèche alt n'a AUCUN idx 0 (surround
 * en idx 10) → tous ses pixels sont écrits, exactement comme le décomp.
 *
 * Cf. décomp `text.c:812/815` `arrowTiles = sDownArrowTiles | sDarkDownArrowTiles`
 * chargé en 4bpp raw → values 0-15 = palette idx directs.
 */
function blitArrowAt(
  w: Window,
  arrowPixels: number[][],
  dstX: number,
  dstY: number,
  srcYOffset: number,
): void {
  const arrowW = 8;
  const arrowH = 16;
  for (let py = 0; py < arrowH; py++) {
    const srcY = py + srcYOffset;
    if (srcY < 0 || srcY >= arrowPixels.length) continue;
    const srcRow = arrowPixels[srcY];
    const dstRowY = dstY + py;
    if (dstRowY < 0 || dstRowY >= w.heightPx) continue;
    const rowStart = dstRowY * w.widthPx;
    for (let px = 0; px < arrowW; px++) {
      const srcIdx = srcRow[px] ?? 0;
      if (srcIdx === 0) continue; // colorKey 0 = transparent (1:1 BlitBitmapRectToWindow)
      const colX = dstX + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      w.pixelBuffer[rowStart + colX] = srcIdx & 0x0F;
    }
  }
  w.needsFlush = true;
}

/**
 * Reset state machine arrow (à appeler quand on advance la page ou hide).
 */
export function resetDownArrow(printer: TextPrinter): void {
  printer.subStruct.downArrowDelay = 0;
  printer.subStruct.downArrowYPosIdx = 0;
}

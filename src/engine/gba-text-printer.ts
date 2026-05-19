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

// EXT_CTRL_CODE sub-codes (cf. include/characters.h)
export const EXT_CTRL_CODE_COLOR = 0x01;
export const EXT_CTRL_CODE_HIGHLIGHT = 0x02;
export const EXT_CTRL_CODE_SHADOW = 0x03;
export const EXT_CTRL_CODE_PAUSE = 0x09;
export const EXT_CTRL_CODE_PAUSE_UNTIL_PRESS = 0x0A;
export const EXT_CTRL_CODE_WAIT_SE = 0x0B;
export const EXT_CTRL_CODE_PLAY_BGM = 0x0C;
export const EXT_CTRL_CODE_ESCAPE = 0x0D;
export const EXT_CTRL_CODE_PLAY_SE = 0x10;
export const EXT_CTRL_CODE_CLEAR = 0x11;
export const EXT_CTRL_CODE_SKIP = 0x12;
export const EXT_CTRL_CODE_CLEAR_TO = 0x13;
export const EXT_CTRL_CODE_MIN_LETTER_SPACING = 0x14;
export const EXT_CTRL_CODE_FONT = 0x06;

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

// 1:1 décomp gTextFlags global. Set par certaines scenes pour disable le
// A/B speed up (= e.g. battle messages forcing fixed speed).
export const gTextFlags = {
  canABSpeedUpPrint: true,  // default TRUE pour Birch + dialogues normaux
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

export interface TextPrinter {
  /** Bytes encodés du texte à imprimer (terminé par EOS=0xFF). */
  encodedString: Uint8Array;
  /** Index courant dans encodedString. */
  currentChar: number;
  /** Window cible. */
  window: Window;

  // Position cursor (pixels relatifs à window.pixelBuffer)
  x: number;          // origin column (constant, reset à newline)
  y: number;          // origin row (constant)
  currentX: number;   // cursor courant
  currentY: number;

  // Couleurs du printer (idx 0-15 dans la palette de la window)
  fgColor: number;
  bgColor: number;
  shadowColor: number;

  letterSpacing: number;
  lineSpacing: number;

  // State machine
  state: number;
  textSpeed: number;       // frames de delay entre chars
  delayCounter: number;

  // Down arrow sub-state
  downArrowDelay: number;
  downArrowYPosIdx: number;

  // 1:1 décomp text.c scrollDistance — pixels restants à scroll pendant
  // RENDER_STATE_SCROLL (= entre `\l` et reprise du rendering).
  scrollDistance: number;

  // 1:1 décomp text.c subStruct->hasPrintBeenSpedUp — set TRUE après JOY_NEW(A|B)
  // pendant le rendering. Tant que A ou B est held, delayCounter reset à 0
  // chaque frame (= 1 char rendu/frame, fast-forward). Reset à FALSE entre
  // 2 printers.
  hasPrintBeenSpedUp: boolean;

  // Données glyph
  glyphData: number[][];   // [256][128] depuis latfont.json
  glyphWidths: Uint8Array; // [256] depuis font-widths.json

  // Down arrow asset (reusable)
  downArrowPixels?: number[][]; // rows of cols, idx 0-3 (depuis down_arrow.json)

  // PAUSE state counter (frames restant avant continuation)
  pauseCounter: number;

  // Callback fired après chaque char rendu OU control code traité.
  // `lastByte` = byte qui vient d'être processed (peut être EXT_CTRL_CODE_PAUSE
  // pour détecter sync events comme le Lotad release dans BirchSpeech).
  // Cf. décomp `AddTextPrinterWithCallbackForMessage` (menu.c) +
  // `NewGameBirchSpeech_WaitForThisIsPokemonText` (main_menu.c:2254).
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
        // Bug session 96 : ce regex ne matchait QUE COLOR/SHADOW/HIGHLIGHT/PAUSE.
        // Du coup `{CLEAR N}` / `{SKIP N}` / `{CLEAR_TO N}` / `{MIN_LETTER_SPACING N}`
        // tombaient dans le fallback "skip silencieusement" (= ligne 421), et
        // les naming screen keyboard strings perdaient TOUS leurs CLEAR codes →
        // lettres collées (= bug visuel ABCDEFGH crammed in left half).
        // Fix : étendre regex à tous les ctrl codes valides.
        const m = inner.match(/^(COLOR|SHADOW|HIGHLIGHT|PAUSE|CLEAR_TO|CLEAR|SKIP|MIN_LETTER_SPACING)\s+(\S+)$/);
        if (m) {
          const cmd = m[1];
          const param = m[2];
          let subCode: number | null = null;
          let value: number | null = null;
          if (cmd === 'COLOR') { subCode = EXT_CTRL_CODE_COLOR; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
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
  glyphData: number[][];
  glyphWidths: Uint8Array;
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
  onCharRendered?: (printer: TextPrinter, lastByte: number) => void;
}

export function addTextPrinter(opts: AddTextPrinterOpts): TextPrinter {
  const x = opts.x ?? 0;
  const y = opts.y ?? 1;
  // 1:1 décomp text.c:294-301 — `--sTempTextPrinter.textSpeed` :
  // si speed != 0 et != TEXT_SKIP_DRAW (= 255), DECREMENTE de 1 avant d'appliquer.
  // Donc :
  //   SLOW=8 → 7 wait frames/char (≈ 7.5 chars/sec)
  //   MID=4  → 3 wait frames/char (≈ 15 chars/sec)
  //   FAST=1 → 0 wait frames/char (= INSTANT, ALL chars rendered au 1er tick)
  //   TEXT_SKIP_DRAW=255 → instant via skip path (= déjà géré).
  // Sans ce -1, FAST=1 donnait 30 chars/sec (= la moitié de la vitesse ROM).
  // Cause racine du "FAST feels slow" reporté par user session 122.
  const TEXT_SKIP_DRAW = 255;
  let normalizedSpeed = opts.textSpeed ?? 0;
  if (normalizedSpeed !== 0 && normalizedSpeed !== TEXT_SKIP_DRAW) {
    normalizedSpeed = Math.max(0, normalizedSpeed - 1);
  }
  return {
    encodedString: opts.encodedString,
    currentChar: 0,
    window: opts.window,
    x, y,
    currentX: x,
    currentY: y,
    fgColor: opts.fgColor ?? FONT_NORMAL_FG,
    bgColor: opts.bgColor ?? FONT_NORMAL_BG,
    shadowColor: opts.shadowColor ?? FONT_NORMAL_SHADOW,
    letterSpacing: opts.letterSpacing ?? 0,
    lineSpacing: opts.lineSpacing ?? 0,
    state: RENDER_STATE_HANDLE_CHAR,
    textSpeed: normalizedSpeed,
    delayCounter: 0,
    downArrowDelay: 0,
    downArrowYPosIdx: 0,
    pauseCounter: 0,
    scrollDistance: 0,
    hasPrintBeenSpedUp: false,
    glyphData: opts.glyphData,
    glyphWidths: opts.glyphWidths,
    downArrowPixels: opts.downArrowPixels,
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
  if (printer.state === RENDER_STATE_FINISH) return RENDER_FINISH;
  // 1:1 décomp text.c:1167-1188 — CLEAR/SCROLL_START/SCROLL/WAIT_SE/WAIT
  // mettent le rendering en pause. Sans ça, runTextPrinter fall through au
  // switch des chars et rend par-dessus le texte actuel pendant que le scroll
  // ou la wait est en cours → 2 textes superposés visiblement.
  if (printer.state === RENDER_STATE_CLEAR ||
      printer.state === RENDER_STATE_SCROLL_START ||
      printer.state === RENDER_STATE_SCROLL ||
      printer.state === RENDER_STATE_WAIT) {
    return RENDER_UPDATE;
  }

  // PAUSE state : décrémenter pauseCounter chaque frame, retour HANDLE_CHAR à 0.
  // Cf. décomp text.c:1215-1220 EXT_CTRL_CODE_PAUSE.
  if (printer.state === RENDER_STATE_PAUSE) {
    if (printer.pauseCounter > 0) {
      printer.pauseCounter--;
      return RENDER_UPDATE;
    }
    printer.state = RENDER_STATE_HANDLE_CHAR;
    return RENDER_REPEAT;
  }

  // 1:1 décomp text.c:944-945 :
  //   if (JOY_HELD(A|B) && hasPrintBeenSpedUp) delayCounter = 0;
  //
  // Held A/B + already spedUp = 0 delay → 1 char/frame = 60 chars/sec.
  // Combiné avec `delayCounter = textSpeed` (ligne 961) après char render,
  // donne le pattern :
  //   Frame N : held + spedUp → delayCounter=0 → skip branch → render +
  //             delayCounter=1 (= textSpeed FAST)
  //   Frame N+1 : held + spedUp → delayCounter=0 (= overrides 1) → skip
  //               branch → render. Etc.
  // → 1 char par frame.
  //
  // Précédent bug session 96 : on capait `if > 1: = 1` (= 1 char par 2 frames
  // = 30 chars/sec, 2× plus lent que ROM). User feedback "speed text trop
  // lent même en FAST + held" venait de ce cap. Fix 1:1 : `= 0` strict.
  if (_heldABPressed && printer.hasPrintBeenSpedUp) {
    printer.delayCounter = 0;
  }

  // textSpeed > 0 : delay entre chaque char (effet "machine à écrire").
  if (printer.delayCounter > 0 && printer.textSpeed > 0) {
    printer.delayCounter--;
    // 1:1 décomp text.c:950-953 — JOY_NEW(A|B) pendant le delay → speed up.
    if (gTextFlags.canABSpeedUpPrint && _newABPressed) {
      printer.hasPrintBeenSpedUp = true;
      printer.delayCounter = 0;
    }
    return RENDER_UPDATE;
  }

  // Process autant de chars que possible (textSpeed=0 = instantané)
  do {
    const byte = printer.encodedString[printer.currentChar];
    if (byte === undefined || byte === EOS) {
      // 1:1 décomp text.c : EOS → RENDER_FINISH (= terminé, pas de wait A).
      // CHAR_PROMPT_CLEAR/SCROLL gérés séparément ci-dessous (= wait A page break).
      // Phase E fix : avant on set state = WAIT_WITH_DOWN_ARROW qui bloquait
      // IsTextPrinterActive(0) éternellement (= state jamais → FINISH).
      printer.state = RENDER_STATE_FINISH;
      if (printer.onCharRendered) printer.onCharRendered(printer, EOS);
      return RENDER_FINISH;
    }

    if (byte === CHAR_NEWLINE) {
      printer.currentChar++;
      printer.currentX = printer.x;
      printer.currentY += LINE_HEIGHT;
      continue;
    }

    // 1:1 décomp text.c:1102-1109 — \p → CLEAR (clear window + reset cursor),
    // \l → SCROLL_START (scroll up 1 line + reset X). Les 2 affichent le ❤️
    // down arrow et attendent A press, mais le post-A behavior diffère.
    if (byte === CHAR_PROMPT_CLEAR) {
      printer.currentChar++;
      printer.state = RENDER_STATE_CLEAR;
      // TextPrinterInitDownArrowCounters (= reset bobbing animation)
      printer.downArrowDelay = 0;
      printer.downArrowYPosIdx = 0;
      if (printer.onCharRendered) printer.onCharRendered(printer, byte);
      return RENDER_UPDATE;
    }
    if (byte === CHAR_PROMPT_SCROLL) {
      printer.currentChar++;
      printer.state = RENDER_STATE_SCROLL_START;
      printer.downArrowDelay = 0;
      printer.downArrowYPosIdx = 0;
      if (printer.onCharRendered) printer.onCharRendered(printer, byte);
      return RENDER_UPDATE;
    }

    if (byte === EXT_CTRL_CODE_BEGIN) {
      const subCode = printer.encodedString[printer.currentChar + 1];
      // PAUSE : 3 bytes total (BEGIN + PAUSE + frames). Cf. text.c:1013.
      if (subCode === EXT_CTRL_CODE_PAUSE) {
        const frames = printer.encodedString[printer.currentChar + 2] ?? 0;
        printer.currentChar += 3;
        printer.pauseCounter = frames;
        printer.state = RENDER_STATE_PAUSE;
        if (printer.onCharRendered) printer.onCharRendered(printer, EXT_CTRL_CODE_PAUSE);
        return RENDER_UPDATE;
      }
      // PAUSE_UNTIL_PRESS : 2 bytes (BEGIN + sub). Wait keypress.
      if (subCode === EXT_CTRL_CODE_PAUSE_UNTIL_PRESS) {
        printer.currentChar += 2;
        printer.state = RENDER_STATE_WAIT_WITH_DOWN_ARROW;
        if (printer.onCharRendered) printer.onCharRendered(printer, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS);
        return RENDER_UPDATE;
      }
      // COLOR : set fgColor au render time. Cf. text.c:980-984. 3 bytes.
      if (subCode === EXT_CTRL_CODE_COLOR) {
        printer.fgColor = printer.encodedString[printer.currentChar + 2] ?? printer.fgColor;
        printer.currentChar += 3;
        continue;
      }
      // HIGHLIGHT : set bgColor. Cf. text.c:985-988. 3 bytes.
      if (subCode === EXT_CTRL_CODE_HIGHLIGHT) {
        printer.bgColor = printer.encodedString[printer.currentChar + 2] ?? printer.bgColor;
        printer.currentChar += 3;
        continue;
      }
      // SHADOW : set shadowColor. Cf. text.c:990-993. 3 bytes.
      if (subCode === EXT_CTRL_CODE_SHADOW) {
        printer.shadowColor = printer.encodedString[printer.currentChar + 2] ?? printer.shadowColor;
        printer.currentChar += 3;
        continue;
      }
      // CLEAR : advance currentX by N pixels (= horizontal kerning skip).
      // 1:1 décomp src/text.c (case EXT_CTRL_CODE_CLEAR). 3 bytes.
      // Utilisé par naming_screen.c:sNamingScreenKeyboardText pour aligner chars
      // sur sPageColumnXPos. Sans handler : currentX inchangé → chars collés.
      if (subCode === EXT_CTRL_CODE_CLEAR) {
        const n = printer.encodedString[printer.currentChar + 2] ?? 0;
        printer.currentX += n;
        printer.currentChar += 3;
        continue;
      }
      // SKIP : set currentX absolu = origin x + N. 3 bytes.
      // 1:1 décomp src/text.c (case EXT_CTRL_CODE_SKIP).
      if (subCode === EXT_CTRL_CODE_SKIP) {
        const n = printer.encodedString[printer.currentChar + 2] ?? 0;
        printer.currentX = printer.x + n;
        printer.currentChar += 3;
        continue;
      }
      // CLEAR_TO : pad jusqu'à ce que currentX atteigne origin x + N. 3 bytes.
      // 1:1 décomp src/text.c (case EXT_CTRL_CODE_CLEAR_TO). Notre impl simple :
      // set currentX = max(currentX, origin x + N) (= skip-to-target sans pad).
      if (subCode === EXT_CTRL_CODE_CLEAR_TO) {
        const n = printer.encodedString[printer.currentChar + 2] ?? 0;
        const target = printer.x + n;
        if (printer.currentX < target) printer.currentX = target;
        printer.currentChar += 3;
        continue;
      }
      // MIN_LETTER_SPACING : set min letter spacing. 3 bytes. Affecte rendu suivant.
      if (subCode === EXT_CTRL_CODE_MIN_LETTER_SPACING) {
        const n = printer.encodedString[printer.currentChar + 2] ?? 0;
        printer.letterSpacing = n;
        printer.currentChar += 3;
        continue;
      }
      // Default : skip 3 bytes (BEGIN + sub + 1 param). TODO handler complet
      // pour PLAY_BGM (5 bytes), COLOR_HIGHLIGHT_SHADOW (5 bytes), etc.
      printer.currentChar += 3;
      continue;
    }

    // 1:1 décomp text.c:1110-1112 `case CHAR_EXTRA_SYMBOL` :
    //   currChar = *currentChar | 0x100; currentChar++;
    // → render glyph 0x100|symByte (extra-symbol = 2e moitié de la latfont).
    // Largeur = gFontNormalLatinGlyphWidths[glyphId] (text.c:1868). Avance de
    // 2 bytes (CHAR_EXTRA_SYMBOL + symByte). 1 glyph = 1 RENDER_PRINT (idem
    // char normal). Débloque `{LV_2}` (Mémo) + `{NO}` (ID) + `{PP}` (pages).
    if (byte === CHAR_EXTRA_SYMBOL) {
      const symByte = printer.encodedString[printer.currentChar + 1] ?? 0;
      const exGlyphId = 0x100 | symByte;
      const exGlyph = printer.glyphData[exGlyphId];
      const exGlyphW = printer.glyphWidths[exGlyphId] || 3;
      if (exGlyph) {
        blitGlyphToWindow(
          printer.window,
          exGlyph,
          printer.currentX,
          printer.currentY,
          exGlyphW,
          printer.fgColor,
          printer.bgColor,
          printer.shadowColor,
        );
      }
      printer.currentX += exGlyphW + printer.letterSpacing;
      printer.currentChar += 2;
      if (printer.onCharRendered) printer.onCharRendered(printer, CHAR_EXTRA_SYMBOL);
      // idem char normal : speed>0 typewriter, speed===0 instant (continue).
      if (printer.textSpeed > 0) {
        printer.delayCounter = printer.textSpeed;
        return RENDER_PRINT;
      }
      continue;
    }

    // Char normal : blit glyph + advance cursor
    const glyph = printer.glyphData[byte];
    const glyphW = printer.glyphWidths[byte] || 3;
    // Fix Phase E : byte 0 = espace dans le charmap. Pas de blit (= empty glyph),
    // juste advance currentX pour préserver le whitespace entre les mots. Sans
    // ce skip, blitGlyphToWindow peut paint du bgColor sur les pixels du glyph
    // précédent et "manger" le rendu (= mots collés "Cemonde" au lieu de "Ce monde").
    if (glyph && byte !== 0) {
      blitGlyphToWindow(
        printer.window,
        glyph,
        printer.currentX,
        printer.currentY,
        glyphW,
        printer.fgColor,
        printer.bgColor,
        printer.shadowColor,
      );
    }
    printer.currentX += glyphW + printer.letterSpacing;
    printer.currentChar++;
    if (printer.onCharRendered) printer.onCharRendered(printer, byte);

    // 1:1 (A/B user, RÉFÉRENCE — WORKING-MODE) : textSpeed===0 = rendu
    // INSTANT (toute la chaîne en 1 frame = menus/descriptions ROM, ex.
    // sac PrintItemDescription speed=0). textSpeed>0 = typewriter 1 char/
    // frame (dialogues, option SLOW/MID/FAST). La révision antérieure
    // "1 char/frame même à speed 0" était FAUSSE (A/B user confirme ROM
    // instant pour speed 0, 2×). Donc : speed>0 → delay + RENDER_PRINT ;
    // speed===0 → continue la do-while (pas de return = char suivant
    // même frame → instant).
    if (printer.textSpeed > 0) {
      printer.delayCounter = printer.textSpeed;
      return RENDER_PRINT;
    }
    continue;
  } while (true);
}

/**
 * Blit / refresh la down arrow à (currentX, currentY) avec animation bobbing.
 * À appeler chaque frame quand `printer.state === RENDER_STATE_WAIT_WITH_DOWN_ARROW`.
 *
 * Cf. décomp `TextPrinterDrawDownArrow` (text.c:787-836).
 */
export function textPrinterDrawDownArrow(printer: TextPrinter): void {
  if (!printer.downArrowPixels) return;

  if (printer.downArrowDelay !== 0) {
    printer.downArrowDelay--;
    return;
  }

  // Clear l'ancienne arrow (rect 8×16 bg color)
  fillWindowPixelRect(
    printer.window,
    printer.bgColor,
    printer.currentX,
    printer.currentY,
    8,
    16,
  );

  // Blit nouvelle arrow avec offset Y selon yPosIdx
  const srcYOffset = DOWN_ARROW_Y_COORDS[printer.downArrowYPosIdx & 3];
  blitArrowAt(
    printer.window,
    printer.downArrowPixels,
    printer.currentX,
    printer.currentY,
    srcYOffset,
  );

  // Reset delay + advance idx
  printer.downArrowDelay = DOWN_ARROW_DELAY_FRAMES;
  printer.downArrowYPosIdx++;
}

/**
 * Blit l'arrow 8×16 à (dstX, dstY) en samplant src à (0, srcY).
 * L'arrow PNG fait 8×48 — srcY offset 0/1/2 pour bobbing.
 *
 * Le PNG `down_arrow.png` utilise les MÊMES idx que `gMessageBox_Pal`
 * (convention Pokemon GBA : idx 0=BG, 2=dark gray outline, 4=RED fill).
 * Donc on écrit les idx PNG directement dans le pixel buffer SANS remap —
 * le copyWindowToCanvas appliquera la palette runtime qui mappera idx 4
 * vers (224,8,8) rouge comme attendu.
 *
 * Cf. décomp `text.c:919` `arrowTiles = sDownArrowTiles` chargé en 4bpp raw
 * → values 0-15 = palette idx directs.
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
      if (srcIdx === 0) continue; // BG transparent
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
  printer.downArrowDelay = 0;
  printer.downArrowYPosIdx = 0;
}

/**
 * text.ts — miroir 1:1 (PARTIEL, en cours) de `decomp/src/text.c` (+ include/text.h).
 *
 * Le RENDERER byte-level de text.c (RenderText / RunTextPrinters / AddTextPrinter /
 * DecompressGlyph_* / CopyGlyphToWindow) est DÉJÀ porté côté `engine/ui` :
 *   - `gba-text-printer.ts` : `runTextPrinter` (= RenderText, text.c:934), les
 *     `RENDER_STATE_*`, `addTextPrinter` (= AddTextPrinter), `encodeStringForFont`,
 *     les glyphes (couche HW : window/blit/DMA).
 *   - `gba-text-system.ts` : `AddTextPrinterParameterized` / `AddTextPrinterForMessage`.
 * Ce module miroir absorbera ce code à terme (relocalisation 1:1). Pour l'instant il
 * porte UNIQUEMENT ce qui débloque la migration TEXTE 1:1 (cf.
 * docs/TEXT-DATA-1TO1-MIGRATION-PLAN.md) :
 *   - le flag de bascule `__USE_DECOMP_TEXT__` (style `__USE_DECOMP_BATTLE_LOOP__`) ;
 *   - `encodeOwTextSource` = cœur du STAGE 1 (encodeur source→bytes charmap 1:1),
 *     dérisqué par vérif d'ÉQUIVALENCE avec la voie ASCII (cf. plan).
 */
import {
  PLACEHOLDER_BEGIN, EOS,
  PLACEHOLDER_ID_STRING_VAR_1, PLACEHOLDER_ID_STRING_VAR_2, PLACEHOLDER_ID_STRING_VAR_3,
  PLACEHOLDER_ID_PLAYER, PLACEHOLDER_ID_RIVAL, PLACEHOLDER_ID_KUN,
  CHAR_NEWLINE, CHAR_DYNAMIC, CHAR_KEYPAD_ICON, CHAR_EXTRA_SYMBOL,
  CHAR_PROMPT_SCROLL, CHAR_PROMPT_CLEAR,
  EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_COLOR, EXT_CTRL_CODE_HIGHLIGHT, EXT_CTRL_CODE_SHADOW,
  EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW, EXT_CTRL_CODE_PALETTE, EXT_CTRL_CODE_FONT,
  EXT_CTRL_CODE_PAUSE, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS, EXT_CTRL_CODE_ESCAPE, EXT_CTRL_CODE_SHIFT_RIGHT, EXT_CTRL_CODE_SHIFT_DOWN,
  EXT_CTRL_CODE_PLAY_BGM, EXT_CTRL_CODE_PLAY_SE, EXT_CTRL_CODE_WAIT_SE, EXT_CTRL_CODE_CLEAR, EXT_CTRL_CODE_SKIP,
  EXT_CTRL_CODE_CLEAR_TO, EXT_CTRL_CODE_MIN_LETTER_SPACING, EXT_CTRL_CODE_JPN, EXT_CTRL_CODE_ENG,
} from '../include/constants/characters';
// Struct window.c (Window pixel-buffer + primitives) — relocalisé dans window.ts
// (MIRROR Stage 2). Le renderer (ci-dessous) le consomme. Cycle text↔window
// runtime-safe (usages dans des fonctions, jamais au top-level).
import {
  type Window, scrollWindow, fillWindowPixelBuffer, fillWindowPixelRect,
} from './window';
// 1:1 décomp : GetPlayerTextSpeed (menu.c:474) utilisé par RenderText SCROLL. Foyer =
// miroir `menu.ts`. Cycle text↔menu runtime-safe (text.c appelle GetPlayerTextSpeed).
import { GetPlayerTextSpeed } from './menu';
import { getWindowById } from './window';
import { gStringVar1, gStringVar2, gStringVar3, gStringVar4, StringCopy } from '../include/string_util';
import { PLAYER_NAME_LENGTH } from '../include/constants/global';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { DynamicPlaceholderTextUtil_GetPlaceholderPtr } from './dynamic_placeholder_text_util';
// 1:1 décomp : TextPrinterWait*/RENDER_STATE_WAIT_SE appellent PlaySE(SE_SELECT) /
// IsSEPlaying (sound.c). Cycle text.ts↔decomp-globals runtime-safe (appels dans des
// fonctions, jamais au top-level). SE_SELECT = constants/songs.h.
import { PlaySE, IsSEPlaying, getRuntime } from '../harness/runtime/decomp-globals';
import { SE_SELECT } from '../include/constants/songs';
// Résolution SE_*/MUS_* → id numérique pour l'encodage {PLAY_SE X}/{PLAY_BGM X}
// (decomp-constants = feuille : n'importe que include/constants/* — pas de cycle).
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
// Migration TEXTE byte : init la charmap du miroir strings.ts (gText_ExpandedPlaceholder_*
// FR + EncodePlayerNameFR) — appelé par loadFontData une fois la charmap chargée.
import { InitTextData } from '../include/strings';

// NB : migration TEXTE en FLIP DIRECT (décision user 2026-06-06, pas de flag/2-voies).
// Tout le système texte OW bascule en byte-level 1:1 ; pas de `__USE_DECOMP_TEXT__`.

// ════════════════════════════════════════════════════════════════════════════
//  STAGE 1 (cœur) — encodeur source→bytes charmap 1:1 (= équivalent runtime du
//  préprocesseur `_("…")` + charmap.txt du décomp, pour le format token de NOTRE
//  extraction `auto-asm/data/**`). BRIDGE TRANSITOIRE : quand l'extraction
//  régénèrera la data en bytes natifs (Stage 1 complet), cet encodage build-time
//  remplacera ce runtime-encode. NON-BREAKING : rien de live ne l'appelle.
// ════════════════════════════════════════════════════════════════════════════

/** Tokens placeholder de NOTRE format OW → `PLACEHOLDER_ID_*` (1:1 décomp).
 *  `{STR_VAR_N}`/`{PLAYER}`/`{RIVAL}`/`{KUN}` = ceux résolus par
 *  `StringExpandPlaceholders` (string_util.ts). Les autres tokens (`{COLOR}`,
 *  `{LV_2}`…) NE sont PAS des placeholders → restent dans les segments littéraux
 *  (gérés par `encodeStringForFont` : ext-ctrl-codes / EXTRA_SYMBOL / glyphes). */
const OW_PLACEHOLDER_TOKENS: Readonly<Record<string, number>> = {
  STR_VAR_1: PLACEHOLDER_ID_STRING_VAR_1,
  STR_VAR_2: PLACEHOLDER_ID_STRING_VAR_2,
  STR_VAR_3: PLACEHOLDER_ID_STRING_VAR_3,
  PLAYER: PLACEHOLDER_ID_PLAYER,
  RIVAL: PLACEHOLDER_ID_RIVAL,
  KUN: PLACEHOLDER_ID_KUN,
};

/**
 * Encode une source texte OW (notre format : JS-string + tokens `{…}` + `\n`/`\l`/`\p`)
 * en bytes charmap, 1:1 comme le template byte du décomp :
 *   - `{STR_VAR_1}` → `[PLACEHOLDER_BEGIN(0xFD), PLACEHOLDER_ID_STRING_VAR_1]`, etc.
 *   - tout le reste (glyphes, `\n`→0xFE, `\l`/`\p`, `{COLOR}`/`{LV_2}`/… ext-ctrl)
 *     → délégué à `encodeStringForFont` (= encodeur charmap canonique, 0 dup).
 * Termine par EOS (0xFF). Le résultat passé à `StringExpandPlaceholders` (string_util.ts)
 * produit les MÊMES bytes que la voie ASCII (vérifié par équivalence — cf. plan §Stage 1).
 *
 * Calqué sur `encodeTemplate` (battle-message.ts) : on scanne les tokens placeholder
 * et on flush les segments littéraux à `encodeStringForFont` (en strippant son EOS).
 */
export function encodeOwTextSource(src: string, charmap: Record<string, number>): Uint8Array {
  const out: number[] = [];
  let segStart = 0;

  const flushSeg = (end: number): void => {
    if (end <= segStart) return;
    const segBytes = encodeStringForFont(src.slice(segStart, end), charmap);
    for (let k = 0; k < segBytes.length; k++) {
      if (segBytes[k] === EOS) break; // encodeStringForFont append un EOS → on le strip
      out.push(segBytes[k]);
    }
  };

  let i = 0;
  while (i < src.length) {
    if (src[i] === '{') {
      const close = src.indexOf('}', i + 1);
      if (close > i) {
        const token = src.slice(i + 1, close).trim();
        const id = OW_PLACEHOLDER_TOKENS[token];
        if (id !== undefined) {
          flushSeg(i);                       // encode le littéral avant le placeholder
          out.push(PLACEHOLDER_BEGIN, id);   // [0xFD, PLACEHOLDER_ID_*]
          i = close + 1;
          segStart = i;
          continue;
        }
        // {DYNAMIC <n>} → [CHAR_DYNAMIC(0xF7), n] : placeholder DYNAMIQUE 1:1
        // (dynamic_placeholder_text_util.c). Index variable (≠ STR_VAR fixe). Le
        // renderer / DynamicPlaceholderTextUtil_ExpandPlaceholders substitue le
        // buffer sStringPointers[n]. N'apparaît que dans les layouts stats du résumé.
        const dyn = /^DYNAMIC\s+(\d+)$/.exec(token);
        if (dyn) {
          flushSeg(i);
          out.push(CHAR_DYNAMIC, parseInt(dyn[1], 10) & 0xFF);
          i = close + 1;
          segStart = i;
          continue;
        }
        // Token non-placeholder ({COLOR}/{LV_2}/…) : reste dans le segment → géré
        // par encodeStringForFont au prochain flush.
      }
    }
    i++;
  }
  flushSeg(src.length);
  out.push(EOS);
  return new Uint8Array(out);
}

/**
 * Wrapper de `encodeOwTextSource` qui résout la charmap OW (getOwCharmap, chargée
 * au boot) — = notre « préproc » au point d'usage (getText). Strippe le `$`
 * terminal (EOS du format décomp ; l'EOS est ré-ajouté par l'encodeur). Si la
 * charmap n'est pas encore chargée, encode best-effort (charmap vide → espaces) ;
 * l'appelant (getText) ne met PAS en cache dans ce cas → ré-encodage propre ensuite.
 */
export function encodeOwText(src: string): Uint8Array {
  const cm = getOwCharmap();
  return encodeOwTextSource(src.replace(/\$$/, ''), cm ?? {});
}

/** True si la charmap OW est chargée (= encodeOwText produit des bytes valides). */
export function isOwCharmapReady(): boolean {
  return getOwCharmap() !== null;
}

let _reverseCharmap: Map<number, string> | null = null;

/**
 * Décode des bytes charmap → JS-string LISIBLE (best-effort, pour devtools / debug).
 * Saute les séquences de contrôle (0xFC ext-ctrl + args via GetExtCtrlCodeLength,
 * 0xFD placeholder + id). PAS un chemin 1:1 décomp — outil d'inspection seulement.
 */
export function decodeOwBytes(bytes: Uint8Array): string {
  const cm = getOwCharmap();
  if (!cm) return '';
  if (!_reverseCharmap) {
    _reverseCharmap = new Map();
    // Le charmap FR réutilise des slots de bytes kana pour des glyphes latins
    // accentués (ex. byte 6 = 'É' ET 'か'). Un reverse-map last-wins naïf rendait
    // 'É' → 'か' (RÉMI → RかMI). Comme un kana n'apparaît JAMAIS dans un texte FR,
    // on PROTÈGE un glyphe latin (codepoint < 0x3000) déjà mappé contre l'écrasement
    // par un kana ; tout le reste garde le comportement last-wins d'origine.
    for (const ch of Object.keys(cm)) {
      const b = cm[ch];
      const existing = _reverseCharmap.get(b);
      if (existing !== undefined) {
        const oldIsLatin = (existing.codePointAt(0) ?? 0) < 0x3000;
        const newIsLatin = (ch.codePointAt(0) ?? 0) < 0x3000;
        if (oldIsLatin && !newIsLatin) continue;  // ne pas laisser un kana écraser un latin
      }
      _reverseCharmap.set(b, ch);
    }
  }
  let out = '';
  let i = 0;
  while (i < bytes.length && bytes[i] !== EOS) {
    const b = bytes[i];
    if (b === 0xFC) { i += 2; continue; }          // ext-ctrl (code + ≥1 arg) — best-effort skip
    if (b === PLACEHOLDER_BEGIN) { i += 2; continue; } // placeholder (déjà résolu en principe)
    out += _reverseCharmap.get(b) ?? '';
    i++;
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
//  Bridge gStringVar / playerName — relocalisé depuis engine/system/string-buffers
//  (2026-06-26, dissolution du dernier fichier engine/system/). PORT-GLUE : ces
//  accesseurs encodent une SOURCE FR lisible (nom de mon/objet, nombre, nom du
//  joueur) en bytes charmap via encodeOwText (= notre préproc runtime), puis
//  écrivent les buffers EWRAM gStringVarN / gSaveBlock2Ptr->playerName. Le décomp
//  fait cet encodage au COMPILE-TIME (`_("…")`) → pas de vrai foyer 1:1 ; le foyer
//  cycle-safe est ICI (encode/decode locaux, gStringVarN déjà importés).
// ════════════════════════════════════════════════════════════════════════════

/** Le buffer byte `gStringVarN` (réf. stable, contenu mutable). */
function _buf(n: number): Uint8Array | undefined {
  switch (n) {
    case 1: return gStringVar1;
    case 2: return gStringVar2;
    case 3: return gStringVar3;
    case 4: return gStringVar4;
    default: return undefined;
  }
}

/** Remplit `gStringVarN` : encode la source FR `value` en bytes charmap (préproc)
 *  puis StringCopy dans le buffer byte. */
export function setStringVar(n: number, value: string): void {
  const buf = _buf(n);
  if (buf) StringCopy(buf, encodeOwText(value));
}

/** Lit `gStringVarN` décodé → JS-string lisible (best-effort, devtools / callers
 *  string non encore migrés). */
export function getStringVar(n: number): string {
  const buf = _buf(n);
  return buf ? decodeOwBytes(buf) : '';
}

/** Vide les 4 buffers (pose EOS en tête). */
export function clearStringVars(): void {
  for (let n = 1; n <= 4; n++) {
    const b = _buf(n);
    if (b) b[0] = EOS;
  }
}

// ─── Accesseurs gSaveBlock2Ptr->playerName (stockage bytes charmap) ──────────
// 1:1 décomp : `u8 playerName[PLAYER_NAME_LENGTH + 1]` (charmap). Notre save =
// JSON.stringify → on stocke `number[]` (round-trip JSON, comme gSaveBlock1->flags ;
// un Uint8Array ne round-trip pas). Robustes au format LEGACY (ancienne save =
// string) : décodent/encodent au vol.

/** Bytes charmap du nom du joueur (vue `u8*`, 1:1 `gSaveBlock2Ptr->playerName`). */
export function GetPlayerName(): Uint8Array {
  const pn = (gSaveBlock2Ptr as { playerName?: unknown }).playerName;
  if (pn instanceof Uint8Array) return pn;
  if (Array.isArray(pn)) return Uint8Array.from(pn as number[]);
  if (typeof pn === 'string') return encodeOwText(pn);   // legacy save (string)
  return new Uint8Array([EOS]);
}

/** Nom du joueur décodé en JS-string (transitoire — callers pas encore byte-natifs).
 *  Le décodage est accent-correct (cf. fix decodeOwBytes glyphe latin vs kana). */
export function GetPlayerNameString(): string {
  const pn = (gSaveBlock2Ptr as { playerName?: unknown }).playerName;
  if (typeof pn === 'string') return pn;                 // legacy save (string)
  return decodeOwBytes(GetPlayerName());
}

/** Écrit `gSaveBlock2Ptr->playerName` : encode `name` (FR lisible) en bytes charmap,
 *  tronqué à PLAYER_NAME_LENGTH + EOS terminateur (1:1 `StringCopy(playerName, src)`). */
export function SetPlayerName(name: string | Uint8Array): void {
  const bytes = typeof name === 'string' ? encodeOwText(name) : name;
  const out: number[] = [];
  for (let i = 0; i < PLAYER_NAME_LENGTH && i < bytes.length && bytes[i] !== EOS; i++) {
    out.push(bytes[i]);
  }
  out.push(EOS);
  (gSaveBlock2Ptr as { playerName?: number[] }).playerName = out;
}

// ════════════════════════════════════════════════════════════════════════════
//  RENDERER (relocalisation engine→miroir, VAGUE 2 — 1:1 text.c / text.h).
//  La couche glyphe/blit (DecompressGlyph/CopyGlyphToWindow/glyph gfx) reste
//  fournie par engine/ui ; ICI = la LOGIQUE (attributs de font, structs,
//  mesures, state machine). Sous-vague 2b-1 : attributs de font (data-driven).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `include/text.h:10-21` enum FontIds. */
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

/** 1:1 décomp `#define TEXT_SKIP_DRAW 0xFF` (text.h:8). Sentinel `speed` =
 *  « charger tout le texte d'un coup mais ne pas copier en VRAM ». */
export const TEXT_SKIP_DRAW = 0xFF;

/** 1:1 décomp `include/text.h:42-51` enum (attributeId de GetFontAttribute). */
export const FONTATTR_MAX_LETTER_WIDTH = 0;
export const FONTATTR_MAX_LETTER_HEIGHT = 1;
export const FONTATTR_LETTER_SPACING = 2;
export const FONTATTR_LINE_SPACING = 3;
export const FONTATTR_UNKNOWN = 4;
export const FONTATTR_COLOR_FOREGROUND = 5;
export const FONTATTR_COLOR_BACKGROUND = 6;
export const FONTATTR_COLOR_SHADOW = 7;

/** 1:1 décomp `include/text.h:97-108 struct FontInfo` (sans `fontFunction`,
 *  ajouté en sous-vague 2c avec RenderFont/FontFunc_*). */
export interface FontInfo {
  maxLetterWidth: number;
  maxLetterHeight: number;
  letterSpacing: number;
  lineSpacing: number;
  unk: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

/** 1:1 décomp `src/text.c:119-221 sFontInfos[]`. Indexé par FONT_* ; `.unk`
 *  non initialisé en décomp (= 0) ; `.fontFunction` omis (rendu = moteur engine
 *  jusqu'à la sous-vague 2c). Valeurs reportées EXACTEMENT du décomp. */
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

/** 1:1 décomp `src/text.c:223-235 sMenuCursorDimensions[][2]` ([w, h] par fontId).
 *  FONT_BOLD non initialisé en décomp (= {0, 0}). */
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

// ════════════════════════════════════════════════════════════════════════════
//  Mesure de largeur (GetStringWidth, 1:1 text.c) — sous-vague 2b-2.
//  La LOGIQUE vit ici ; les WIDTH-TABLES par glyphe (HW data) sont fournies par
//  engine via `getFontGlyphWidths(fontId)` (= `gFontXLatinGlyphWidths` décomp).
// ════════════════════════════════════════════════════════════════════════════

type GlyphWidthFunc = (glyphId: number, isJapanese: boolean) => number;

// 1:1 décomp `GetGlyphWidth_*` (text.c:1717-1894). FR (isJapanese=0) : table[glyphId].
// JP : 8 (Small/Normal/Narrow/SmallNarrow). isJapanese reste 0 en FR/OW sauf
// EXT_CTRL_CODE_JPN (jamais dans nos data FR).
function GetGlyphWidth_Small(glyphId: number, isJapanese: boolean): number {
  return isJapanese ? 8 : (getFontGlyphWidths(FONT_SMALL)[glyphId] ?? 0);
}
function GetGlyphWidth_Normal(glyphId: number, isJapanese: boolean): number {
  return isJapanese ? 8 : (getFontGlyphWidths(FONT_NORMAL)[glyphId] ?? 0);
}
function GetGlyphWidth_Short(_glyphId: number, _isJapanese: boolean): number {
  // décomp : JP → gFontShortJapaneseGlyphWidths ; pas de table JP côté engine →
  // table latin pour les deux (inactif en FR, isJapanese=0).
  return getFontGlyphWidths(FONT_SHORT)[_glyphId] ?? 0;
}
function GetGlyphWidth_Narrow(glyphId: number, isJapanese: boolean): number {
  return isJapanese ? 8 : (getFontGlyphWidths(FONT_NARROW)[glyphId] ?? 0);
}
function GetGlyphWidth_SmallNarrow(glyphId: number, isJapanese: boolean): number {
  return isJapanese ? 8 : (getFontGlyphWidths(FONT_SMALL_NARROW)[glyphId] ?? 0);
}

/** 1:1 décomp `src/text.c:82 sGlyphWidthFuncs[]`. FONT_BRAILLE OMIS
 *  (GetGlyphWidth_Braille = braille.c non porté ; FONT_BRAILLE jamais mesuré OW
 *  → GetFontWidthFunc null → largeur 0, comme le décomp si func == NULL). */
const sGlyphWidthFuncs: ReadonlyArray<{ fontId: number; func: GlyphWidthFunc }> = [
  { fontId: FONT_SMALL, func: GetGlyphWidth_Small },
  { fontId: FONT_NORMAL, func: GetGlyphWidth_Normal },
  { fontId: FONT_SHORT, func: GetGlyphWidth_Short },
  { fontId: FONT_SHORT_COPY_1, func: GetGlyphWidth_Short },
  { fontId: FONT_SHORT_COPY_2, func: GetGlyphWidth_Short },
  { fontId: FONT_SHORT_COPY_3, func: GetGlyphWidth_Short },
  { fontId: FONT_NARROW, func: GetGlyphWidth_Narrow },
  { fontId: FONT_SMALL_NARROW, func: GetGlyphWidth_SmallNarrow },
];

/** 1:1 décomp `src/text.c:1315 GetFontWidthFunc(u8 fontId)`. */
function GetFontWidthFunc(fontId: number): GlyphWidthFunc | null {
  for (const e of sGlyphWidthFuncs) if (fontId === e.fontId) return e.func;
  return null;
}

/** 1:1 décomp `src/text.c:100-115 sKeypadIcons[]` — table {tileOffset,width,height}
 *  indexée par CHAR_* (id = 2ᵉ octet après CHAR_KEYPAD_ICON, cf. charmap.txt:1001-1013
 *  A_BUTTON=F8 00 … DPAD_NONE=F8 0C). Le `tileOffset` (index tuile 16/rangée dans
 *  keypad_icons.png) sert au build offline (extract-keypad-icons.mjs) qui crop déjà
 *  les pixels ; au runtime on lit `keypadIconPixels` + `width` (8/16/24 px, h=12). */
const sKeypadIcons: ReadonlyArray<{ tileOffset: number; width: number; height: number }> = [
  { tileOffset: 0x00, width: 8,  height: 12 }, // CHAR_A_BUTTON
  { tileOffset: 0x01, width: 8,  height: 12 }, // CHAR_B_BUTTON
  { tileOffset: 0x02, width: 16, height: 12 }, // CHAR_L_BUTTON
  { tileOffset: 0x04, width: 16, height: 12 }, // CHAR_R_BUTTON
  { tileOffset: 0x06, width: 24, height: 12 }, // CHAR_START_BUTTON
  { tileOffset: 0x09, width: 24, height: 12 }, // CHAR_SELECT_BUTTON
  { tileOffset: 0x0C, width: 8,  height: 12 }, // CHAR_DPAD_UP
  { tileOffset: 0x0D, width: 8,  height: 12 }, // CHAR_DPAD_DOWN
  { tileOffset: 0x0E, width: 8,  height: 12 }, // CHAR_DPAD_LEFT
  { tileOffset: 0x0F, width: 8,  height: 12 }, // CHAR_DPAD_RIGHT
  { tileOffset: 0x20, width: 8,  height: 12 }, // CHAR_DPAD_UPDOWN
  { tileOffset: 0x21, width: 8,  height: 12 }, // CHAR_DPAD_LEFTRIGHT
  { tileOffset: 0x22, width: 8,  height: 12 }, // CHAR_DPAD_NONE
];
/** 1:1 décomp `src/text.c:1630 GetKeypadIconWidth` = `sKeypadIcons[id].width`. */
function GetKeypadIconWidth(keypadIconId: number): number {
  return sKeypadIcons[keypadIconId]?.width ?? 0;
}

/** Pixels pré-croppés des 13 icônes keypad (keypad_icons.png → keypad_icons.json via
 *  extract-keypad-icons.mjs), indexés par CHAR_* id. null avant `loadFontData`.
 *  = `sKeypadIconTiles` (text.c:117), mais décodé/croppé offline (même voie que
 *  down_arrow.json / `downArrowPixels`). */
let keypadIconPixels: ReadonlyArray<{ width: number; height: number; pixels: number[][] }> | null = null;

/** 1:1 décomp `src/text.c:1609 DrawKeypadIcon` — blit l'icône `keypadIconId` (A/B/L/R/
 *  START/SELECT/DPAD) dans la window à (x, y), retourne sa largeur. Décomp :
 *  `BlitBitmapRectToWindow(...)` → `BlitBitmapRect4Bit(..., colorKey=0)` (blit.c:56) =
 *  branche else « skip pixels == colorKey » → idx 0 transparent, indices bruts (PAS de
 *  remap fg/shadow, contrairement aux glyphes de font). MÊME chemin que `blitArrowAt`
 *  (down arrow, colorKey 0). Le tileOffset (sKeypadIcons) est déjà appliqué au crop. */
function DrawKeypadIcon(w: Window, keypadIconId: number, x: number, y: number): number {
  const icon = keypadIconPixels?.[keypadIconId];
  if (!icon) return GetKeypadIconWidth(keypadIconId); // pas encore chargé : avance quand même
  for (let py = 0; py < icon.height; py++) {
    const dstRowY = y + py;
    if (dstRowY < 0 || dstRowY >= w.heightPx) continue;
    const srcRow = icon.pixels[py];
    if (!srcRow) continue;
    const rowStart = dstRowY * w.widthPx;
    for (let px = 0; px < icon.width; px++) {
      const srcIdx = srcRow[px] ?? 0;
      if (srcIdx === 0) continue; // colorKey 0 = transparent (1:1 BlitBitmapRect4Bit else)
      const colX = x + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      w.pixelBuffer[rowStart + colX] = srcIdx & 0x0F;
    }
  }
  w.needsFlush = true;
  return icon.width;
}

/**
 * 1:1 décomp `src/text.c:1328 GetStringWidth(u8 fontId, const u8 *str, s16 letterSpacing)`.
 * Mesure la largeur pixel de `str` (multi-ligne = MAX des lignes, 1:1). Gère les
 * placeholders (gStringVar1-3 + CHAR_DYNAMIC), EXTRA_SYMBOL (0x100|sym), KEYPAD_ICON,
 * et tous les EXT_CTRL_CODE (skip d'args correct par code).
 *
 * ⚠️ SIGNATURE : ordre `(str, fontId, letterSpacing)` (≠ décomp `(fontId, str, …)`)
 * pour rester compatible avec les ~31 call-sites engine. La LOGIQUE est 1:1.
 * `str` accepte une source-string (encodée via charmap) OU des bytes charmap.
 * Le fallthrough du switch décomp (noFallthroughCasesInSwitch) est rendu par un
 * skip explicite d'args par code (COLOR_HIGHLIGHT_SHADOW=3, PLAY_BGM/SE=2, autres=1).
 */
export function GetStringWidth(str: string | Uint8Array, fontId: number = FONT_NORMAL, letterSpacing = 0): number {
  const s = str instanceof Uint8Array ? str : encodeStringForFont(str, getOwCharmap() ?? {});

  let func = GetFontWidthFunc(fontId);
  if (func === null) return 0;

  let isJapanese = false;
  let minGlyphWidth = 0;
  let localLetterSpacing = letterSpacing === -1 ? GetFontAttribute(fontId, FONTATTR_LETTER_SPACING) : letterSpacing;
  let width = 0;
  let lineWidth = 0;
  let i = 0;

  // 1:1 décomp : ajoute un glyphe à lineWidth (minGlyphWidth clamp OU letterSpacing
  // japonais). `hasNext` = `str[1] != EOS` du décomp (inactif en FR, isJapanese=0).
  const addGlyph = (gw: number, hasNext: boolean): void => {
    if (minGlyphWidth > 0) {
      lineWidth += gw < minGlyphWidth ? minGlyphWidth : gw;
    } else {
      lineWidth += gw;
      if (isJapanese && hasNext) lineWidth += localLetterSpacing;
    }
  };

  // 1:1 décomp : walk d'un buffer placeholder (gStringVarN / dynamic ptr).
  const walkBuffer = (buf: Uint8Array): void => {
    let bp = 0;
    while (bp < buf.length && buf[bp] !== EOS) {
      const gw = func!(buf[bp], isJapanese);
      bp++;
      addGlyph(gw, isJapanese ? (s[i + 1] !== undefined && s[i + 1] !== EOS) : false);
    }
  };

  while (i < s.length && s[i] !== EOS) {
    const c = s[i];
    if (c === CHAR_NEWLINE) {
      if (lineWidth > width) width = lineWidth;
      lineWidth = 0;
    } else if (c === PLACEHOLDER_BEGIN || c === CHAR_DYNAMIC) {
      let buffer: Uint8Array | null = null;
      if (c === PLACEHOLDER_BEGIN) {
        const id = s[++i];
        if (id === PLACEHOLDER_ID_STRING_VAR_1) buffer = gStringVar1;
        else if (id === PLACEHOLDER_ID_STRING_VAR_2) buffer = gStringVar2;
        else if (id === PLACEHOLDER_ID_STRING_VAR_3) buffer = gStringVar3;
        else return 0;
        // décomp : pas de break → fallthrough vers CHAR_DYNAMIC (buffer déjà set).
      }
      if (buffer === null) {
        // CHAR_DYNAMIC : ptr (Uint8Array byte-level) via DynamicPlaceholderTextUtil.
        const ptr = DynamicPlaceholderTextUtil_GetPlaceholderPtr(s[++i]);
        buffer = ptr ?? new Uint8Array([EOS]);
      }
      walkBuffer(buffer);
    } else if (c === EXT_CTRL_CODE_BEGIN) {
      const code = s[++i];
      switch (code) {
        case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW: i += 3; break;  // 3 args
        case EXT_CTRL_CODE_PLAY_BGM:
        case EXT_CTRL_CODE_PLAY_SE: i += 2; break;                 // 2 args
        case EXT_CTRL_CODE_COLOR:
        case EXT_CTRL_CODE_HIGHLIGHT:
        case EXT_CTRL_CODE_SHADOW:
        case EXT_CTRL_CODE_PALETTE:
        case EXT_CTRL_CODE_PAUSE:
        case EXT_CTRL_CODE_ESCAPE:
        case EXT_CTRL_CODE_SHIFT_RIGHT:
        case EXT_CTRL_CODE_SHIFT_DOWN: i += 1; break;              // 1 arg
        case EXT_CTRL_CODE_FONT: {
          const fid = s[++i];
          func = GetFontWidthFunc(fid);
          if (func === null) return 0;
          if (letterSpacing === -1) localLetterSpacing = GetFontAttribute(fid, FONTATTR_LETTER_SPACING);
          break;
        }
        case EXT_CTRL_CODE_CLEAR: lineWidth += s[++i]; break;
        case EXT_CTRL_CODE_SKIP: lineWidth = s[++i]; break;
        case EXT_CTRL_CODE_CLEAR_TO: { const t = s[++i]; if (t > lineWidth) lineWidth = t; break; }
        case EXT_CTRL_CODE_MIN_LETTER_SPACING: minGlyphWidth = s[++i]; break;
        case EXT_CTRL_CODE_JPN: isJapanese = true; break;
        case EXT_CTRL_CODE_ENG: isJapanese = false; break;
        default: break;  // RESET_FONT/PAUSE_UNTIL_PRESS/WAIT_SE/FILL_WINDOW/… = 0 arg
      }
    } else if (c === CHAR_KEYPAD_ICON) {
      const gw = GetKeypadIconWidth(s[++i]);
      addGlyph(gw, false);
    } else if (c === CHAR_EXTRA_SYMBOL) {
      const gw = func(s[++i] | 0x100, isJapanese);
      addGlyph(gw, isJapanese ? (s[i + 1] !== undefined && s[i + 1] !== EOS) : false);
    } else if (c === CHAR_PROMPT_SCROLL || c === CHAR_PROMPT_CLEAR) {
      // 0 width (waits for button press).
    } else {
      const gw = func(c, isJapanese);
      addGlyph(gw, isJapanese ? (s[i + 1] !== undefined && s[i + 1] !== EOS) : false);
    }
    i++;
  }

  return lineWidth > width ? lineWidth : width;
}

/** 1:1 décomp `GetStringRightAlignXOffset(fontId, str, rightX)` (= rightX - width). */
export function GetStringRightAlignXOffset(str: string | Uint8Array, rightX: number, fontId: number = FONT_NORMAL): number {
  return rightX - GetStringWidth(str, fontId);
}

/** 1:1 décomp `GetStringCenterAlignXOffset(fontId, str, totalWidth)`. Integer
 *  division (floor) comme le C — un offset fractionnaire empêcherait le rendu. */
export function GetStringCenterAlignXOffset(str: string | Uint8Array, totalWidth: number, fontId: number = FONT_NORMAL): number {
  return Math.floor((totalWidth - GetStringWidth(str, fontId)) / 2);
}

// ════════════════════════════════════════════════════════════════════════════
//  RenderText (state machine, 1:1 text.c:934) — sous-vague 2c + raffinement 1.
//  RELOCALISÉ depuis engine `runTextPrinter` : structure `switch(state)` 1:1
//  décomp. Le per-char (HANDLE_CHAR) garde le comportement A/B-validé (glyph via
//  `blitGlyphToWindow` HW engine, pacing delayCounter/textSpeed). VAGUE 2
//  raffinement 1 : les états WAIT/CLEAR/SCROLL_START/SCROLL/WAIT_SE + le
//  down-arrow + l'input A/B (PlaySE) sont désormais PILOTÉS ICI (1:1 text.c, plus
//  via RunTextPrinters). Le HW pur (blit glyphe, scroll, fill, down-arrow draw)
//  reste fourni par engine/ui (importé : scrollWindow/fillWindow*/textPrinterDrawDownArrow).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `src/text.c:76 sWindowVerticalScrollSpeeds[]` — pixels scrollés par
 *  frame en RENDER_STATE_SCROLL, indexé par OPTIONS_TEXT_SPEED (SLOW/MID/FAST). */
const sWindowVerticalScrollSpeeds = [1, 2, 4] as const; // [SLOW, MID, FAST]

/** 1:1 décomp `src/text.c:850 TextPrinterWaitAutoMode` : en auto-scroll, avance
 *  seul après 49 frames (sinon incrémente le compteur). */
function TextPrinterWaitAutoMode(printer: TextPrinter): boolean {
  if (printer.subStruct.autoScrollDelay === 49) return true;
  printer.subStruct.autoScrollDelay++;
  return false;
}

/** 1:1 décomp `src/text.c:865 TextPrinterWaitWithDownArrow` : dessine la ▼
 *  (bobbing) puis attend A/B (PlaySE SE_SELECT) ; en auto-scroll délègue à
 *  TextPrinterWaitAutoMode. */
function TextPrinterWaitWithDownArrow(printer: TextPrinter): boolean {
  let result = false;
  if (gTextFlags.autoScroll) {
    result = TextPrinterWaitAutoMode(printer);
  } else {
    textPrinterDrawDownArrow(printer);
    if (_getTextInputState().newAB) {
      result = true;
      PlaySE(SE_SELECT);
    }
  }
  return result;
}

/** 1:1 décomp `src/text.c:884 TextPrinterWait` : attend A/B (PlaySE SE_SELECT)
 *  SANS ▼ ; en auto-scroll délègue à TextPrinterWaitAutoMode. */
function TextPrinterWait(printer: TextPrinter): boolean {
  let result = false;
  if (gTextFlags.autoScroll) {
    result = TextPrinterWaitAutoMode(printer);
  } else {
    if (_getTextInputState().newAB) {
      result = true;
      PlaySE(SE_SELECT);
    }
  }
  return result;
}

/** 1:1 décomp `src/text.c:838 TextPrinterClearDownArrow` : efface la ▼ (rect 8×16
 *  bgColor) avant le scroll. CopyWindowToVram = `needsFlush` (posé par fillWindowPixelRect). */
function TextPrinterClearDownArrow(printer: TextPrinter): void {
  fillWindowPixelRect(
    printer.window,
    (printer.printerTemplate.bgColor << 4) | printer.printerTemplate.bgColor,
    printer.printerTemplate.currentX,
    printer.printerTemplate.currentY,
    8,
    16,
  );
}

// ─── Modèle glyphe (gCurGlyph / DecompressGlyph_* / CopyGlyphToWindow) ───────
//  1:1 STRUCTUREL décomp (raffinement 2). Le décomp décompresse les tiles 2bpp de
//  `gFontXLatinGlyphs` dans `gCurGlyph` puis `CopyGlyphToWindow` les blit (packing
//  4bpp via sFontHalfRowLookupTable). FRONTIÈRE HW : notre latfont.json est
//  PRÉ-DÉCODÉ (pixels idx 0/1/2/3 par glyphe) → `DecompressGlyph_<font>` SÉLECTIONNE
//  la glyph data globale du font (getFontGlyphData, pas de cache par-printer) et
//  `CopyGlyphToWindow` blit via le HW engine (blitGlyphToWindow). Le dispatch par
//  fontId + le flux RenderText→DecompressGlyph→CopyGlyphToWindow sont 1:1.

/** 1:1 décomp `struct TextGlyph` (text.h:125). `gfxBuffer` = pixels pré-décodés
 *  (gfxBufferTop/Bottom du décomp fusionnés ; le split tile 4bpp = détail HW émulé). */
interface TextGlyph { gfxBuffer: number[] | null; width: number; height: number; }

/** 1:1 décomp `COMMON_DATA struct TextGlyph gCurGlyph` (text.c:48). */
const gCurGlyph: TextGlyph = { gfxBuffer: null, width: 0, height: 16 };

/** Remplit gCurGlyph depuis la glyph data globale d'un font (= cœur commun des
 *  `DecompressGlyph_<font>` : la "décompression" tile→pixels est émulée par le
 *  latfont pré-décodé, donc on SÉLECTIONNE le glyphe + sa largeur + sa hauteur). */
function _fillCurGlyph(fontId: number, glyphId: number): void {
  gCurGlyph.gfxBuffer = getFontGlyphData(fontId)[glyphId] ?? null;
  gCurGlyph.width = getFontGlyphWidths(fontId)[glyphId] || 3;
  gCurGlyph.height = sFontInfos[fontId]?.maxLetterHeight ?? 16;
}

// 1:1 décomp `DecompressGlyph_Small/Normal/Short/Narrow/SmallNarrow` (text.c:1683+).
// Le path JP (isJapanese) n'est pas porté (FR/OW only, japanese toujours false) → latin.
function DecompressGlyph_Small(glyphId: number, _isJapanese: boolean): void { _fillCurGlyph(FONT_SMALL, glyphId); }
function DecompressGlyph_Normal(glyphId: number, _isJapanese: boolean): void { _fillCurGlyph(FONT_NORMAL, glyphId); }
function DecompressGlyph_Short(glyphId: number, _isJapanese: boolean): void { _fillCurGlyph(FONT_SHORT, glyphId); }
function DecompressGlyph_Narrow(glyphId: number, _isJapanese: boolean): void { _fillCurGlyph(FONT_NARROW, glyphId); }
function DecompressGlyph_SmallNarrow(glyphId: number, _isJapanese: boolean): void { _fillCurGlyph(FONT_SMALL_NARROW, glyphId); }

/** 1:1 décomp `src/text.c:596 CopyGlyphToWindow` : blit gCurGlyph dans la window à
 *  (currentX, currentY). HW = `blitGlyphToWindow` engine (remap idx 0/1/2/3 sur le
 *  pixelBuffer ; le GLYPH_COPY/packing 4bpp du décomp = couche HW émulée). */
function CopyGlyphToWindow(printer: TextPrinter): void {
  if (!gCurGlyph.gfxBuffer) return;
  blitGlyphToWindow(
    printer.window, gCurGlyph.gfxBuffer,
    printer.printerTemplate.currentX, printer.printerTemplate.currentY, gCurGlyph.width,
    printer.printerTemplate.fgColor, printer.printerTemplate.bgColor, printer.printerTemplate.shadowColor,
  );
}

/** 1:1 décomp `src/text.c:649 ClearTextSpan` : si bg non transparent, remplit un
 *  rect (currentX, currentY, width, gCurGlyph.height) en bgColor (padding du
 *  MIN_LETTER_SPACING). HW = fillWindowPixelRect. */
function ClearTextSpan(printer: TextPrinter, width: number): void {
  if ((globalThis as { __noClearSpan?: boolean }).__noClearSpan) return; // sonde bisect (temporaire)
  if ((globalThis as { __traceClearSpan?: boolean }).__traceClearSpan)
    console.log('[ClearTextSpan]', 'win', printer.printerTemplate.windowId, 'x', printer.printerTemplate.currentX, 'y', printer.printerTemplate.currentY, 'w', width, 'h', gCurGlyph.height);
  if (printer.printerTemplate.bgColor !== 0) {
    fillWindowPixelRect(printer.window, printer.printerTemplate.bgColor, printer.printerTemplate.currentX, printer.printerTemplate.currentY, width, gCurGlyph.height);
  }
}

/** 1:1 décomp `src/text.c:934 RenderText(struct TextPrinter *)`. Traite l'état
 *  du printer ; en HANDLE_CHAR, consomme des chars (glyphes + ext-ctrl) et rend
 *  via le HW engine. Retourne RENDER_PRINT/UPDATE/REPEAT/FINISH. */
export function RenderText(printer: TextPrinter): number {
  switch (printer.state) {
    case RENDER_STATE_FINISH:
      return RENDER_FINISH;

    // 1:1 décomp text.c:1167-1170 — {PAUSE_UNTIL_PRESS} : attend A/B (SANS ▼) puis
    // reprend le rendu dans la MÊME fenêtre (ni clear ni scroll).
    case RENDER_STATE_WAIT:
      if (TextPrinterWait(printer)) printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;

    // 1:1 décomp text.c:1171-1179 — \p (CHAR_PROMPT_CLEAR) : ▼ + attente A/B, puis
    // FillWindowPixelBuffer(bg) + reset curseur (x, y) → nouvelle page propre.
    case RENDER_STATE_CLEAR:
      if (TextPrinterWaitWithDownArrow(printer)) {
        fillWindowPixelBuffer(printer.window, (printer.printerTemplate.bgColor << 4) | printer.printerTemplate.bgColor);
        printer.printerTemplate.currentX = printer.printerTemplate.x;
        printer.printerTemplate.currentY = printer.printerTemplate.y;
        printer.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;

    // 1:1 décomp text.c:1180-1188 — \l (CHAR_PROMPT_SCROLL) : ▼ + attente A/B, puis
    // TextPrinterClearDownArrow + arme scrollDistance (maxLetterHeight + lineSpacing)
    // + reset currentX (currentY reste — c'est ce qui distingue de CLEAR).
    case RENDER_STATE_SCROLL_START:
      if (TextPrinterWaitWithDownArrow(printer)) {
        TextPrinterClearDownArrow(printer);
        printer.scrollDistance = LINE_HEIGHT + printer.printerTemplate.lineSpacing;
        printer.printerTemplate.currentX = printer.printerTemplate.x;
        printer.state = RENDER_STATE_SCROLL;
      }
      return RENDER_UPDATE;

    // 1:1 décomp text.c:1189-1210 — scroll progressif (sWindowVerticalScrollSpeeds
    // [GetPlayerTextSpeed()] px/frame) jusqu'à scrollDistance=0, puis HANDLE_CHAR.
    case RENDER_STATE_SCROLL:
      if (printer.scrollDistance > 0) {
        const speed = sWindowVerticalScrollSpeeds[GetPlayerTextSpeed()] ?? 2;
        if (printer.scrollDistance < speed) {
          scrollWindow(printer.window, printer.scrollDistance, printer.printerTemplate.bgColor);
          printer.scrollDistance = 0;
        } else {
          scrollWindow(printer.window, speed, printer.printerTemplate.bgColor);
          printer.scrollDistance -= speed;
        }
        // CopyWindowToVram = needsFlush (posé par scrollWindow).
      } else {
        printer.state = RENDER_STATE_HANDLE_CHAR;
      }
      return RENDER_UPDATE;

    // 1:1 décomp text.c:1211-1214 — attend la fin du SE en cours puis reprend.
    case RENDER_STATE_WAIT_SE:
      if (!IsSEPlaying()) printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;

    // 1:1 décomp text.c:1215-1220 EXT_CTRL_CODE_PAUSE — décrémente delay puis
    // reprend (retourne TOUJOURS RENDER_UPDATE, comme le décomp : la reprise du
    // char se fait à la frame SUIVANTE, pas via un REPEAT same-frame).
    case RENDER_STATE_PAUSE:
      if (printer.pauseCounter > 0) printer.pauseCounter--;
      else printer.state = RENDER_STATE_HANDLE_CHAR;
      return RENDER_UPDATE;

    case RENDER_STATE_HANDLE_CHAR:
    default:
      return renderHandleChar(printer);
  }
}

/** 1:1 décomp text.c:943-1166 (case RENDER_STATE_HANDLE_CHAR) : pacing
 *  (delayCounter/textSpeed/JOY A|B) + boucle de consommation des chars. */
function renderHandleChar(printer: TextPrinter): number {
  // 1:1 décomp text.c:944-945 — JOY_HELD(A|B) + hasPrintBeenSpedUp → delay 0.
  const { newAB, heldAB } = _getTextInputState();
  if (heldAB && printer.subStruct.hasPrintBeenSpedUp) {
    printer.delayCounter = 0;
  }

  // 1:1 décomp text.c:947-956 — delay machine-à-écrire entre chars.
  if (printer.delayCounter > 0 && printer.textSpeed > 0) {
    printer.delayCounter--;
    if (gTextFlags.canABSpeedUpPrint && newAB) {
      printer.subStruct.hasPrintBeenSpedUp = true;
      printer.delayCounter = 0;
    }
    return RENDER_UPDATE;
  }

  // Consomme les chars (ext-ctrl/newline = enchaînés ; glyphe = 1 par frame en
  // typewriter via RENDER_PRINT, tous d'un coup si instantPath).
  do {
    const byte = printer.encodedString[printer.printerTemplate.currentChar];
    if (byte === undefined || byte === EOS) {
      printer.state = RENDER_STATE_FINISH;
      if (printer.onCharRendered) printer.onCharRendered(printer, EOS);
      return RENDER_FINISH;
    }

    if (byte === CHAR_NEWLINE) {
      printer.printerTemplate.currentChar++;
      printer.printerTemplate.currentX = printer.printerTemplate.x;
      printer.printerTemplate.currentY += LINE_HEIGHT;
      continue;
    }

    // 1:1 décomp text.c:1102-1109 — \p → CLEAR (page break), \l → SCROLL_START.
    if (byte === CHAR_PROMPT_CLEAR) {
      printer.printerTemplate.currentChar++;
      printer.state = RENDER_STATE_CLEAR;
      printer.subStruct.downArrowDelay = 0;
      printer.subStruct.downArrowYPosIdx = 0;
      if (printer.onCharRendered) printer.onCharRendered(printer, byte);
      return RENDER_UPDATE;
    }
    if (byte === CHAR_PROMPT_SCROLL) {
      printer.printerTemplate.currentChar++;
      printer.state = RENDER_STATE_SCROLL_START;
      printer.subStruct.downArrowDelay = 0;
      printer.subStruct.downArrowYPosIdx = 0;
      if (printer.onCharRendered) printer.onCharRendered(printer, byte);
      return RENDER_UPDATE;
    }

    if (byte === EXT_CTRL_CODE_BEGIN) {
      const subCode = printer.encodedString[printer.printerTemplate.currentChar + 1];
      // PAUSE : BEGIN + PAUSE + frames (3 bytes). text.c:1013.
      if (subCode === EXT_CTRL_CODE_PAUSE) {
        const frames = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0;
        printer.printerTemplate.currentChar += 3;
        printer.pauseCounter = frames;
        printer.state = RENDER_STATE_PAUSE;
        if (printer.onCharRendered) printer.onCharRendered(printer, EXT_CTRL_CODE_PAUSE);
        return RENDER_UPDATE;
      }
      // PAUSE_UNTIL_PRESS : BEGIN + sub (2 bytes). text.c:1018 — state = WAIT (1:1 :
      // attente A/B SANS ▼ ni clear, reprise dans la même fenêtre). En auto-scroll,
      // reset autoScrollDelay (text.c:1020-1021).
      if (subCode === EXT_CTRL_CODE_PAUSE_UNTIL_PRESS) {
        printer.printerTemplate.currentChar += 2;
        printer.state = RENDER_STATE_WAIT;
        if (gTextFlags.autoScroll) printer.subStruct.autoScrollDelay = 0;
        if (printer.onCharRendered) printer.onCharRendered(printer, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS);
        return RENDER_UPDATE;
      }
      // WAIT_SE : BEGIN + sub (2 bytes). 1:1 text.c:1023-1025 : state WAIT_SE
      // (attend !IsSEPlaying). Plateforme : SE async (WebAudio, pas de registre
      // busy) -> consommer et continuer (equivalent net, le SE joue deja).
      if (subCode === EXT_CTRL_CODE_WAIT_SE) {
        printer.printerTemplate.currentChar += 2;
        return RENDER_REPEAT;
      }
      // PLAY_BGM : BEGIN + sub + u16 LE (4 bytes). 1:1 text.c:1026-1032 :
      // PlayBGM(id) — ex. {PLAY_BGM}{MUS_CAUGHT} du texte de capture (le « A »
      // parasite affiche etait le byte haut 0x01 de 0x160 non consomme).
      if (subCode === EXT_CTRL_CODE_PLAY_BGM) {
        const id = (printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0)
                 | ((printer.encodedString[printer.printerTemplate.currentChar + 3] ?? 0) << 8);
        printer.printerTemplate.currentChar += 4;
        const g = globalThis as { __m4aSongNumStart?: (n: number, loop?: boolean) => void };
        g.__m4aSongNumStart?.(id, false);
        return RENDER_REPEAT;
      }
      // PLAY_SE : BEGIN + sub + u16 LE (4 bytes). 1:1 text.c (case suivante) : PlaySE(id).
      if (subCode === EXT_CTRL_CODE_PLAY_SE) {
        const id = (printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0)
                 | ((printer.encodedString[printer.printerTemplate.currentChar + 3] ?? 0) << 8);
        printer.printerTemplate.currentChar += 4;
        (globalThis as { __PlaySE?: (n: number) => void }).__PlaySE?.(id);
        return RENDER_REPEAT;
      }
      // COLOR/HIGHLIGHT/SHADOW : set couleur courante (lue au blit). text.c:980-993.
      if (subCode === EXT_CTRL_CODE_COLOR) {
        printer.printerTemplate.fgColor = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? printer.printerTemplate.fgColor;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      if (subCode === EXT_CTRL_CODE_HIGHLIGHT) {
        printer.printerTemplate.bgColor = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? printer.printerTemplate.bgColor;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      if (subCode === EXT_CTRL_CODE_SHADOW) {
        printer.printerTemplate.shadowColor = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? printer.printerTemplate.shadowColor;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      // CLEAR : EFFACE n px (ClearTextSpan) puis avance currentX. text.c:1063-1072.
      // (Avant : avançait sans effacer → résidus des anciens textes plus longs au
      // re-print par-dessus — noms mélangés dans la liste Match Call au scroll.)
      if (subCode === EXT_CTRL_CODE_CLEAR) {
        const n = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0;
        if (n > 0) ClearTextSpan(printer, n);
        printer.printerTemplate.currentX += n;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      // SKIP : currentX = x + N. text.c:1073-1076.
      if (subCode === EXT_CTRL_CODE_SKIP) {
        const n = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0;
        printer.printerTemplate.currentX = printer.printerTemplate.x + n;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      // CLEAR_TO : EFFACE jusqu'à x + N (ClearTextSpan sur la distance). text.c:1077-1090.
      if (subCode === EXT_CTRL_CODE_CLEAR_TO) {
        const n = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0;
        const target = printer.printerTemplate.x + n;
        const span = target - printer.printerTemplate.currentX;
        if (span > 0) {
          ClearTextSpan(printer, span);
          printer.printerTemplate.currentX = target;
        }
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      // MIN_LETTER_SPACING. text.c:1091-1092 (= minLetterSpacing, PAS letterSpacing).
      if (subCode === EXT_CTRL_CODE_MIN_LETTER_SPACING) {
        printer.minLetterSpacing = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 0;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      // FONT : switch du font courant mid-string. text.c:1007-1010 (subStruct->fontId).
      // Le rendu lit ensuite la glyph data globale getFontGlyphData(printer.subStruct.fontId).
      if (subCode === EXT_CTRL_CODE_FONT) {
        printer.subStruct.fontId = printer.encodedString[printer.printerTemplate.currentChar + 2] ?? 1;
        printer.printerTemplate.currentChar += 3;
        continue;
      }
      // Défaut : skip BEGIN + sub + 1 param.
      printer.printerTemplate.currentChar += 3;
      continue;
    }

    // 1:1 décomp text.c:1114-1118 CHAR_KEYPAD_ICON — icône bouton (A/B/L/R/START/
    // SELECT/DPAD) via DrawKeypadIcon : chemin SÉPARÉ du glyphe de font (pas de
    // DecompressGlyph — l'icône vient de keypad_icons.png, indices bruts). Décomp :
    // `currentX += gCurGlyph.width + letterSpacing` (text.c:1117) — on ajoute bien
    // letterSpacing ici (≠ divergence latine l.953 où la largeur inclut déjà l'espace ;
    // les icônes ne sont pas des glyphes latins). Frame semantics = MÊME que le glyphe
    // (instantPath → continue ; sinon RENDER_PRINT, 1:1 décomp `return RENDER_PRINT`).
    if (byte === CHAR_KEYPAD_ICON) {
      const keypadIconId = printer.encodedString[printer.printerTemplate.currentChar + 1] ?? 0;
      printer.printerTemplate.currentChar += 2;
      gCurGlyph.width = DrawKeypadIcon(
        printer.window, keypadIconId,
        printer.printerTemplate.currentX, printer.printerTemplate.currentY,
      );
      printer.printerTemplate.currentX += gCurGlyph.width + printer.printerTemplate.letterSpacing;
      if (printer.onCharRendered) printer.onCharRendered(printer, CHAR_KEYPAD_ICON);
      if (!printer.instantPath) {
        printer.delayCounter = printer.textSpeed;
        return RENDER_PRINT;
      }
      continue;
    }

    // 1:1 décomp text.c:1110-1166 — glyphe (char normal OU CHAR_EXTRA_SYMBOL).
    // EXTRA_SYMBOL = glyphId `0x100 | sym` (text.c:1110-1112) puis MÊME chemin de
    // rendu (DecompressGlyph_<font> → CopyGlyphToWindow → avance), pas un cas à part.
    let glyphId: number;
    let renderedByte: number;
    if (byte === CHAR_EXTRA_SYMBOL) {
      glyphId = 0x100 | (printer.encodedString[printer.printerTemplate.currentChar + 1] ?? 0);
      printer.printerTemplate.currentChar += 2;
      renderedByte = CHAR_EXTRA_SYMBOL;
    } else {
      glyphId = byte;
      printer.printerTemplate.currentChar++;
      renderedByte = byte;
    }

    // 1:1 décomp text.c:1123-1145 — dispatch DecompressGlyph_<font> sur fontId
    // (remplit gCurGlyph depuis la glyph data globale du font).
    switch (printer.subStruct.fontId) {
      case FONT_SMALL: DecompressGlyph_Small(glyphId, printer.japanese); break;
      case FONT_NORMAL: DecompressGlyph_Normal(glyphId, printer.japanese); break;
      case FONT_SHORT:
      case FONT_SHORT_COPY_1:
      case FONT_SHORT_COPY_2:
      case FONT_SHORT_COPY_3: DecompressGlyph_Short(glyphId, printer.japanese); break;
      case FONT_NARROW: DecompressGlyph_Narrow(glyphId, printer.japanese); break;
      case FONT_SMALL_NARROW: DecompressGlyph_SmallNarrow(glyphId, printer.japanese); break;
      case FONT_BRAILLE: gCurGlyph.gfxBuffer = null; gCurGlyph.width = 0; break; // décomp : break (pas de glyphe)
      default: DecompressGlyph_Normal(glyphId, printer.japanese); break;
    }

    // 1:1 décomp text.c:1147 CopyGlyphToWindow. Garde engine : skip si renderedByte 0
    // (espace) — divergence whitespace documentée (évite "mots collés" ; le décomp
    // blit le glyphe d'espace blanc, ici on préserve le buffer rempli).
    if (renderedByte !== 0) CopyGlyphToWindow(printer);

    // 1:1 décomp text.c:1149-1165 — avance curseur (minLetterSpacing / japanese / latin).
    // ⚠️ latin (FR/OW) : avance = gCurGlyph.width SEUL (PAS + letterSpacing : la
    // largeur des glyphes latins inclut déjà l'espacement ; letterSpacing latin
    // ne sert qu'à GetStringWidth/japanese — 1:1 décomp).
    if (printer.minLetterSpacing) {
      printer.printerTemplate.currentX += gCurGlyph.width;
      const pad = printer.minLetterSpacing - gCurGlyph.width;
      if (pad > 0) { ClearTextSpan(printer, pad); printer.printerTemplate.currentX += pad; }
    } else if (printer.japanese) {
      printer.printerTemplate.currentX += gCurGlyph.width + printer.printerTemplate.letterSpacing;
    } else {
      printer.printerTemplate.currentX += gCurGlyph.width;
    }

    if (printer.onCharRendered) printer.onCharRendered(printer, renderedByte);

    // 1:1 décomp text.c:961 — delayCounter = textSpeed après render char (typewriter).
    if (!printer.instantPath) {
      printer.delayCounter = printer.textSpeed;
      return RENDER_PRINT;
    }
    continue;
  } while (true);
}

/** 1:1 décomp `src/text.c:352 RenderFont(struct TextPrinter *)` : appelle la
 *  font function (= RenderText) en boucle tant qu'elle retourne RENDER_REPEAT. */
export function RenderFont(printer: TextPrinter): number {
  let guard = 0;
  while (true) {
    const ret = RenderText(printer);
    if (ret !== RENDER_REPEAT) return ret;
    if (++guard > 0x400) return RENDER_FINISH;  // garde anti-boucle (= AddTextPrinter 0x400)
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  Gestion des printers (AddTextPrinter* — 1:1 text.c:251-317 + menu.c:1917-1959)
//  — sous-vague 2e. Registre + orchestration relocalisés depuis gba-text-system.
//  Le HW (font data, blit, addTextPrinter struct setup) reste engine, importé.
//  `RunTextPrinters` (driving scroll/down-arrow/input) reste en engine pour
//  l'instant (sera centralisé dans RenderText à l'étape A/B suivante) ; il
//  importe `gTextPrinters` d'ici.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `#define WINDOWS_MAX 32` (window.h) — taille du pool de fenêtres GBA. */
export const WINDOWS_MAX = 32;

/** 1:1 décomp `static struct TextPrinter sTextPrinters[WINDOWS_MAX]` (text.c:39) :
 *  un printer par windowId, drapeau `.active` PORTÉ SUR LE STRUCT (plus de wrapper
 *  ActivePrinter). ⚠️ tableau CREUX (pas capé à WINDOWS_MAX) : notre window-system
 *  (engine) alloue des windowId MONOTONES (nextWindowId++, jamais réutilisés) ≠ le
 *  pool de slots bornés du décomp (= couche HW hors-scope) → on indexe par windowId
 *  via un array sparse auto-extensible (sémantiquement 1:1 : sTextPrinters[id]).
 *  `const` muté in-place (partagé via import par RunTextPrinters). */
export const sTextPrinters: (TextPrinter | undefined)[] = [];

/** Argument de `AddTextPrinter` = `struct TextPrinterTemplate` décomp (text.h:64).
 *  ⚠️ `str` = décomp `currentChar` (le pointeur string) ; chez nous le buffer + l'index
 *  sont séparés (printer.encodedString + printer.printerTemplate.currentChar). */
export interface AddTextPrinterTemplate {
  str: string | Uint8Array;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  letterSpacing: number;
  lineSpacing: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

// ─── Journal des textes affichés (devtool « logs », OFF par défaut) ─────────
// Capture au point UNIQUE (AddTextPrinter = tout texte rendu : OW, combat, menus).
// Activé par le panel devtools via globalThis.__uiTextLogEnabled ; le journal =
// globalThis.__uiTextLog [{at: secondes session, t}]. Harness pur, PAS du 1:1.
let _revCharmap: Map<number, string> | null = null;
function _logPrintedText(str: string | Uint8Array, encoded: Uint8Array): void {
  const g = globalThis as { __uiTextLogEnabled?: boolean; __uiTextLog?: Array<{ at: number; t: string }> };
  if (!g.__uiTextLogEnabled) return;
  let text: string;
  if (typeof str === 'string') {
    text = str;
  } else {
    if (!_revCharmap) {
      _revCharmap = new Map();
      const cm = getOwCharmap() ?? {};
      for (const [ch, code] of Object.entries(cm)) {
        if (typeof code === 'number' && !_revCharmap.has(code)) _revCharmap.set(code, ch);
      }
    }
    let out = '';
    for (let i = 0; i < encoded.length; i++) {
      const b = encoded[i];
      if (b === 0xFF) break;                       // EOS
      if (b === 0xFE) { out += '\n'; continue; }   // \n
      if (b === 0xFB || b === 0xFA) { out += ' '; continue; } // \p / \l
      if (b === 0xFD || b === 0xFC) { i++; continue; }        // placeholders/ctrl (1 arg min)
      out += _revCharmap.get(b) ?? '';
    }
    text = out;
  }
  const trimmed = text.trim();
  if (!trimmed) return;
  g.__uiTextLog ??= [];
  const last = g.__uiTextLog[g.__uiTextLog.length - 1];
  if (last && last.t === trimmed) return;          // dédoublonne les re-prints
  g.__uiTextLog.push({ at: Math.round(performance.now() / 100) / 10, t: trimmed });
  if (g.__uiTextLog.length > 3000) g.__uiTextLog.splice(0, 500);
}

/** 1:1 décomp `src/text.c:271 AddTextPrinter(struct TextPrinterTemplate *, u8 speed,
 *  callback)`. Cœur PARTAGÉ (appelé par `AddTextPrinterParameterized` de text.c + par
 *  `AddTextPrinterParameterized2/3/4`/`ForMessage*` de menu.c) : crée le printer, pose
 *  le slot `sTextPrinters[windowId]`, rend instantanément si speed 0/TEXT_SKIP_DRAW.
 *  La glyph data est globale par fontId (pas de cache). `callback` = onCharRendered
 *  (notre per-char ; sync Birch). Retourne TRUE (bool16 décomp). */
export function AddTextPrinter(
  template: AddTextPrinterTemplate, speed: number,
  callback?: ((printer: TextPrinter, lastByte: number) => void) | null,
): boolean {
  const win = getWindowById(template.windowId);
  if (!win) {
    console.warn('[text] AddTextPrinter: window', template.windowId, 'not found');
    return false;
  }
  // Byte-entry : bytes charmap pré-encodés passés directement ; sinon encode.
  const encoded = (template.str instanceof Uint8Array) ? template.str : encodeStringForFont(template.str, getOwCharmap() ?? {});
  _logPrintedText(template.str, encoded);
  if ((globalThis as { __traceATP?: boolean }).__traceATP && template.windowId === 3)
    console.log('[ATP w3]', 'x', template.x, 'y', template.y, 'font', template.fontId, 'head', Array.from(encoded.slice(0, 6)).join(','));
  const opts: AddTextPrinterOpts = {
    window: win,
    encodedString: encoded,
    windowId: template.windowId,
    fontId: template.fontId,  // glyph data globale par fontId (subStruct.fontId)
    x: template.x,
    y: template.y,
    bgColor: template.bgColor,
    fgColor: template.fgColor,
    shadowColor: template.shadowColor,
    letterSpacing: template.letterSpacing,
    lineSpacing: template.lineSpacing,
    textSpeed: speed,  // concret (callers résolvent l'option) ; addTextPrinter mappe 255/0
    downArrowPixels: getDownArrowPixels() ?? undefined,
    darkDownArrowPixels: getDarkDownArrowPixels() ?? undefined,
    onCharRendered: callback ?? undefined,
  };
  const printer = addTextPrinter(opts);
  // 1:1 décomp AddTextPrinter (text.c:294-313) : speed 0/TEXT_SKIP_DRAW = render
  // synchrone instantané (boucle bornée 0x400) ; sinon animé par RunTextPrinters.
  let finished = false;
  if (speed === 255 || speed === 0) {
    for (let j = 0; j < 0x400; j++) {
      if (RenderFont(printer) === RENDER_FINISH) break;
      // Rendu instantané : pas d'input pour lever un état d'attente (\p/\l/WAIT_SE)
      // → ne pas spinner 0x400 fois.
      if (printer.state === RENDER_STATE_WAIT
        || printer.state === RENDER_STATE_CLEAR
        || printer.state === RENDER_STATE_SCROLL_START
        || printer.state === RENDER_STATE_WAIT_SE) break;
    }
    finished = true;
  }
  // 1:1 décomp AddTextPrinter (text.c:297/313) : slot sTextPrinters[windowId] + active.
  printer.active = !finished;
  sTextPrinters[template.windowId] = printer;
  return true;
}

/** 1:1 décomp `src/text.c:251 AddTextPrinterParameterized` : remplit le template
 *  avec les attributs par défaut du font (GetFontAttribute) puis `AddTextPrinter`. */
export function AddTextPrinterParameterized(
  windowId: number, fontId: number, str: string | Uint8Array,
  x: number, y: number, speed: number,
  callback: ((printer: TextPrinter, lastByte: number) => void) | null = null,
): boolean {
  return AddTextPrinter({
    str, windowId, fontId, x, y,
    letterSpacing: GetFontAttribute(fontId, FONTATTR_LETTER_SPACING),
    lineSpacing: GetFontAttribute(fontId, FONTATTR_LINE_SPACING),
    fgColor: GetFontAttribute(fontId, FONTATTR_COLOR_FOREGROUND),
    bgColor: GetFontAttribute(fontId, FONTATTR_COLOR_BACKGROUND),
    shadowColor: GetFontAttribute(fontId, FONTATTR_COLOR_SHADOW),
  }, speed, callback);
}

// AddTextPrinterParameterized2/3/4 + AddTextPrinterForMessage(_2 / WithCustomSpeed) +
// AddTextPrinterWithCallbackForMessage : RELOCALISÉS dans le miroir `src/game/menu.ts`
// (1:1 menu.c:169/191/1917/1938 — ils remplissent un TextPrinterTemplate + appellent
// `AddTextPrinter` ci-dessus, leur foyer décomp).

/** 1:1 décomp `src/text.c:347 IsTextPrinterActive(u8 id)` = `sTextPrinters[id].active`. */
export function IsTextPrinterActive(windowId: number): boolean {
  return sTextPrinters[windowId]?.active ?? false;
}

/** DEBUG only — snapshot lisible des printers (devtools window.dev.printers). */
export function _debugGetTextPrinters(): Array<{ windowId: number; active: boolean; printer: TextPrinter }> {
  const out: Array<{ windowId: number; active: boolean; printer: TextPrinter }> = [];
  for (let i = 0; i < sTextPrinters.length; i++) {
    const p = sTextPrinters[i];
    if (p) out.push({ windowId: i, active: p.active, printer: p });
  }
  return out;
}

/** Efface tous les printers (changement de scène ; pas une fonction décomp). */
export function ClearTextPrinters(): void {
  sTextPrinters.length = 0;
}

/** 1:1 décomp `src/text.c:244 DeactivateAllTextPrinters` : `active = FALSE` pour
 *  TOUS les slots (le décomp ne vide pas le tableau, il désactive). */
export function DeactivateAllTextPrinters(): void {
  for (const p of sTextPrinters) { if (p) p.active = false; }
}

// Expose pour debug overworld dialog + gate combat (bundle module instance).
(globalThis as Record<string, unknown>).__debugGetTextPrinters = _debugGetTextPrinters;
(globalThis as Record<string, unknown>).__gbaIsTextPrinterActive = IsTextPrinterActive;

// ═══════════════════════════════════════════════════════════════════════════════
//  Ex-`gba-text-system.ts` — couche data font + RunTextPrinters + text colors,
//  RAPATRIÉE dans le miroir 1:1 text.c (consolidation MIRROR, dissolution du
//  fichier d'adaptation). La couche DATA (chargement font/charmap/down-arrow)
//  reste l'adaptation web ; le driving texte vit déjà au-dessus (RenderText).
// ═══════════════════════════════════════════════════════════════════════════════

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
  const [fontRes, widthsRes, charmapRes, arrowRes, arrowAltRes, keypadRes] = await Promise.all([
    fetch('/decomp/em/ui/fonts/latin.latfont.json').then((r) => r.json()),
    fetch('/decomp/em/ui/font-widths.json').then((r) => r.json()),
    fetch('/decomp/em/ui/charmap.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/down_arrow.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/down_arrow_alt.json').then((r) => r.json()),
    fetch('/decomp/em/ui/fonts/keypad_icons.json').then((r) => r.json()),
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
  // sKeypadIconTiles (text.c:117) pré-décodé/croppé par icône (extract-keypad-icons.mjs).
  const keypad = keypadRes as { icons: Array<{ width: number; height: number; pixels: number[][] }> };
  keypadIconPixels = keypad.icons;
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

/** Accesseur HW des width-tables d'un font (= `gFontXLatinGlyphWidths` du décomp). */
export function getFontGlyphWidths(fontId: number): Uint8Array {
  ensureFontLoaded();
  return _resolveFont(fontId).glyphWidths;
}

/** Accesseur HW des glyphes pré-décodés d'un font (= `gFontXLatinGlyphs` décomp). */
export function getFontGlyphData(fontId: number): number[][] {
  ensureFontLoaded();
  return _resolveFont(fontId).glyphData;
}

/** Accesseur du `resolveFont` (switch glyph-set mid-string {FONT N}) pour le renderer. */
export function resolveFontForMirror(fontId: number): { glyphData: number[][]; glyphWidths: Uint8Array } {
  return _resolveFont(fontId);
}

/** Pixels de la down-arrow (▼ fin de message) — terrain/menus + alt combat. */
export function getDownArrowPixels(): number[][] | null { return downArrowPixels; }
export function getDarkDownArrowPixels(): number[][] | null { return darkDownArrowPixels; }

/** Force load font data (call during scene preload). */
export function preloadFontData(): Promise<void> {
  return loadFontData();
}

function ensureFontLoaded(): void {
  if (!glyphData || !glyphWidths || !charmap) {
    throw new Error('[text] Font data not loaded. Call preloadFontData() first.');
  }
}

/** 1:1 décomp `CHAR_SPACER` (= byte 0x77 dans charmap, charmap.txt:280).
 *  Caractère spacer demi-largeur utilisé par `ConvertIntToDecimalStringN`
 *  en mode RIGHT_ALIGN pour padder à gauche les nombres courts. Côté JS = 'ラ'. */
export const CHAR_SPACER_STR = 'ラ';

/** Remplit le buffer byte gStringVar4 via StringCopy (byte-level). Le décomp n'a
 *  pas de `setStringVar4` ; helper pour les call-sites existants. */
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

// ─── RunTextPrinters (boucle per-frame, 1:1 décomp text.c:319) ────────────────

const A_BUTTON_TEXT = 0x01;
const B_BUTTON_TEXT = 0x02;
const AB_MASK = A_BUTTON_TEXT | B_BUTTON_TEXT;

// Guard contre double-tick par frame (runtime auto + Tasks décomp via
// RunTextPrintersAndIsPrinter0Active). Sans ça le ▼ down arrow s'animerait 2× trop vite.
let _lastRunTextPrintersFrame = -1;

export function RunTextPrinters(): void {
  const rt = getRuntime();
  if (!rt) return;
  // Skip si déjà tick cette frame (= 1:1 décomp behavior, 1 call par frame).
  if (rt.gIntroFrameCounter === _lastRunTextPrintersFrame) return;
  _lastRunTextPrintersFrame = rt.gIntroFrameCounter;
  // 1:1 décomp text.c:944-953 — JOY_NEW/JOY_HELD(A|B) lus inline par RenderText
  // (pacing A/B + TextPrinterWait*). On publie l'état input AVANT RenderFont ; tout
  // le driving (WAIT/CLEAR/SCROLL/WAIT_SE + down-arrow + PlaySE) vit dans RenderText.
  const newAB = !!(rt.gMain.newKeys & AB_MASK);
  const heldAB = !!(rt.gMain.heldKeys & AB_MASK);
  _setTextInputState(newAB, heldAB);

  // 1:1 décomp text.c:325-343 — for (i=0; i<WINDOWS_MAX; i++) if (sTextPrinters[i].active)
  // { renderCmd = RenderFont(&sTextPrinters[i]); case FINISH: active = FALSE; }.
  // Tableau creux indexé par windowId (slots vides = undefined → skip).
  for (let i = 0; i < sTextPrinters.length; i++) {
    const p = sTextPrinters[i];
    if (!p || !p.active) continue;
    const renderCmd = RenderFont(p);
    if (renderCmd === RENDER_FINISH) p.active = false;
  }
}

// ─── Text colors helper (1:1 décomp main_menu.c:410-411) ─────────────────────

// sTextColor_Headers = [TEXT_DYNAMIC_COLOR_1, _2, _3] = [10, 11, 12]. Palette indices
// chargés dynamiquement par main_menu auto file. NE JAMAIS approximer ([1,2,3] donnait
// un bg BLUE/PINK au lieu de WHITE) ; toujours les indices que le dynamic-load remplit.
export const sTextColor_Headers = [10, 11, 12] as const; // [bg=DYNAMIC_1, fg=DYNAMIC_2, shadow=DYNAMIC_3]
(globalThis as Record<string, unknown>).sTextColor_Headers = sTextColor_Headers;

// sTextColor_MenuInfo = [TEXT_DYNAMIC_COLOR_1=0xA, TEXT_COLOR_WHITE=0x1, TEXT_DYNAMIC_COLOR_3=0xC]
// = [10, 1, 12]. fg = WHITE (pas dynamic) → texte blanc sur bg dynamique (sub-info Continue).
export const sTextColor_MenuInfo = [10, 1, 12] as const;
(globalThis as Record<string, unknown>).sTextColor_MenuInfo = sTextColor_MenuInfo;

// ═══════════════════════════════════════════════════════════════════════════════
//  Ex-`gba-text-printer.ts` — moteur de rendu texte 1:1 (text.c), RAPATRIÉ dans
//  le miroir text.c (dissolution MIRROR Stage 2). Le struct window.c
//  (Window/createWindow/fillWindowPixelBuffer/Rect/scrollWindow/copyWindowToCanvas)
//  est parti dans window.ts ; les constantes characters.h (CHAR_*/EOS/EXT_CTRL_*)
//  sont importées en tête (source unique include/constants/characters), pas redéfinies.
// ═══════════════════════════════════════════════════════════════════════════════

/** sDownArrowYCoords (text.c:75) — Y offset cyclic pour bobbing arrow */
export const DOWN_ARROW_Y_COORDS = [0, 1, 2, 1] as const;
/** Frames entre chaque pos arrow (text.c:832 `subStruct->downArrowDelay = 8`) */
export const DOWN_ARROW_DELAY_FRAMES = 8;
/** Hauteur ligne pour FONT_NORMAL (text.c:134 maxLetterHeight + lineSpacing=0) */
export const LINE_HEIGHT = 16;

/** EXTRA_SYMBOL glyphs (1:1 décomp `charmap.txt:1015-1086`). Le render fait
 *  `currChar = symByte | 0x100` (text.c:1110) → glyph index 0x100..0x1FF. */
export const EXTRA_SYMBOL: Readonly<Record<string, number>> = Object.freeze({
  UP_ARROW_2: 0x00, DOWN_ARROW_2: 0x01, LEFT_ARROW_2: 0x02, RIGHT_ARROW_2: 0x03,
  PLUS: 0x04, LV_2: 0x05, PP: 0x06, ID: 0x07, NO: 0x08, UNDERSCORE: 0x09,
  CIRCLE_1: 0x0A, CIRCLE_2: 0x0B, CIRCLE_3: 0x0C, CIRCLE_4: 0x0D, CIRCLE_5: 0x0E,
  CIRCLE_6: 0x0F, CIRCLE_7: 0x10, CIRCLE_8: 0x11, CIRCLE_9: 0x12,
  ROUND_LEFT_PAREN: 0x13, ROUND_RIGHT_PAREN: 0x14, CIRCLE_DOT: 0x15,
  TRIANGLE: 0x16, BIG_MULT_X: 0x17,
});

/** Keypad icons (1:1 décomp `charmap.txt:1001-1013`). Le render fait
 *  `CHAR_KEYPAD_ICON(0xF8) + id` → `DrawKeypadIcon(id)` (blit keypad_icons.png).
 *  id = 2ᵉ octet ; parallèle exact d'EXTRA_SYMBOL mais chemin de rendu séparé. */
export const KEYPAD_ICON: Readonly<Record<string, number>> = Object.freeze({
  A_BUTTON: 0x00, B_BUTTON: 0x01, L_BUTTON: 0x02, R_BUTTON: 0x03,
  START_BUTTON: 0x04, SELECT_BUTTON: 0x05, DPAD_UP: 0x06, DPAD_DOWN: 0x07,
  DPAD_LEFT: 0x08, DPAD_RIGHT: 0x09, DPAD_UPDOWN: 0x0A, DPAD_LEFTRIGHT: 0x0B,
  DPAD_NONE: 0x0C,
});

/** sFontInfos[FONT_NORMAL] (text.c:131) — couleurs par défaut text dialog */
export const FONT_NORMAL_FG = 2;       // dark gray (palette[2])
export const FONT_NORMAL_BG = 1;       // white (palette[1])
export const FONT_NORMAL_SHADOW = 3;   // cream/light (palette[3])

/** TEXT_COLOR_* constants (cf. include/constants/characters.h:234-249).
 *  Idx dans la palette runtime active. */
export const TEXT_COLOR = Object.freeze({
  TRANSPARENT: 0x0, WHITE: 0x1, DARK_GRAY: 0x2, LIGHT_GRAY: 0x3,
  RED: 0x4, LIGHT_RED: 0x5, GREEN: 0x6, LIGHT_GREEN: 0x7,
  BLUE: 0x8, LIGHT_BLUE: 0x9, DYNAMIC_COLOR_1: 0xA, DYNAMIC_COLOR_2: 0xB,
  DYNAMIC_COLOR_3: 0xC, DYNAMIC_COLOR_4: 0xD, DYNAMIC_COLOR_5: 0xE, DYNAMIC_COLOR_6: 0xF,
});

// 1:1 STRICT décomp gTextFlags global (= include/text.h struct). Set par scenes/init
// pour controller le rendering (A/B speed up, auto scroll, arrow shape, etc.).
export const gTextFlags = {
  canABSpeedUpPrint: true,
  useAlternateDownArrow: false,  // 1:1 décomp : Pokenav use l'alternate down arrow.
  forceMidTextSpeed: false,
  autoScroll: false,
};

// Module-level input state mis à jour par RunTextPrinters à chaque frame.
// Lu par RenderText (= 1:1 décomp JOY_NEW/JOY_HELD inline).
let _newABPressed = false;
let _heldABPressed = false;
export function _setTextInputState(newAB: boolean, heldAB: boolean): void {
  _newABPressed = newAB;
  _heldABPressed = heldAB;
}
/** Lit l'état input texte (= JOY_NEW/JOY_HELD A|B inline du décomp). */
export function _getTextInputState(): { newAB: boolean; heldAB: boolean } {
  return { newAB: _newABPressed, heldAB: _heldABPressed };
}

/** Render states 1:1 décomp `include/text.h:32-39` enum. */
export const RENDER_STATE_HANDLE_CHAR = 0;
export const RENDER_STATE_WAIT = 1;
export const RENDER_STATE_CLEAR = 2;
export const RENDER_STATE_SCROLL_START = 3;
export const RENDER_STATE_SCROLL = 4;
export const RENDER_STATE_WAIT_SE = 5;
export const RENDER_STATE_PAUSE = 6;
/** Alias backwards-compat (pointe sur CLEAR = comportement `\p`). */
export const RENDER_STATE_WAIT_WITH_DOWN_ARROW = RENDER_STATE_CLEAR;
export const RENDER_STATE_FINISH = -1;  // sentinel value pour code legacy.

/** Codes de retour runTextPrinter / RenderText. */
export const RENDER_FINISH = 0xFF;
export const RENDER_REPEAT = 1;
export const RENDER_PRINT = 2;
export const RENDER_UPDATE = 3;

/** 1:1 décomp `struct TextPrinterTemplate` (text.h:64-79). currentChar = INDEX
 *  dans `printer.encodedString` (décomp : `const u8*` pointeur dans la string). */
export interface TextPrinterTemplate {
  currentChar: number;
  windowId: number;
  fontId: number;
  x: number;
  y: number;
  currentX: number;
  currentY: number;
  letterSpacing: number;
  lineSpacing: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

/** 1:1 décomp `struct TextPrinterSubStruct` (text.h:53-62). */
export interface TextPrinterSubStruct {
  fontId: number;
  hasPrintBeenSpedUp: boolean;
  downArrowDelay: number;
  downArrowYPosIdx: number;
  hasFontIdBeenSet: boolean;
  autoScrollDelay: number;
}

export interface TextPrinter {
  // ── 1:1 décomp struct TextPrinter (text.h:81-95) ──
  printerTemplate: TextPrinterTemplate;
  subStruct: TextPrinterSubStruct;
  active: boolean;
  state: number;
  textSpeed: number;
  delayCounter: number;
  scrollDistance: number;
  minLetterSpacing: number;
  japanese: boolean;
  // ── Extensions (PAS dans le struct décomp) ──
  encodedString: Uint8Array;
  window: Window;
  instantPath: boolean;
  pauseCounter: number;
  downArrowPixels?: number[][];
  darkDownArrowPixels?: number[][];
  onCharRendered?: (printer: TextPrinter, lastByte: number) => void;
}

/**
 * Blit un glyph 8×16 dans le pixelBuffer en remappant idx 0/1/2/3 :
 *   0 (BG)→bgColor ; 1 (FG)→fgColor ; 2 (SHADOW)→shadowColor ; 3 (BOX_FILL)→bgColor.
 * Cf. décomp `DecompressGlyphTile` (text.c:526) + `GenerateFontHalfRowLookupTable`.
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
  const GLYPH_W = 16; // stride 1:1 cell font 16×16
  for (let py = 0; py < 16; py++) {
    const rowY = dstY + py;
    if (rowY < 0 || rowY >= w.heightPx) continue;
    const rowStart = rowY * w.widthPx;
    for (let px = 0; px < glyphW; px++) {
      const colX = dstX + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      const srcIdx = glyphPixels[py * GLYPH_W + px];
      // 1:1 décomp `GenerateFontHalfRowLookupTable` (text.c:363) : glyph 2-bit
      // (0/1/2/3). Mapping : 0→bgColor, 1→fgColor, 2→shadowColor, 3→bgColor
      // (sFontHalfRowOffsets[3]==[0]). Couleur==TRANSPARENT(0) → skip (idx 0 =
      // transparent au compositor) ; bgColor!=0 → remplit le fond (dialog rouge 1:1).
      let mappedIdx: number;
      switch (srcIdx) {
        case 1:
          if (fgColor === 0) continue;
          mappedIdx = fgColor;
          break;
        case 2:
          if (shadowColor === 0) continue;
          mappedIdx = shadowColor;
          break;
        case 3:
        default:
          if (bgColor === 0) continue;
          mappedIdx = bgColor;
          break;
      }
      w.pixelBuffer[rowStart + colX] = mappedIdx & 0x0F;
    }
  }
  w.needsFlush = true;
}

// ─── 1:1 décomp `RenderTextHandleBold` (text.c:1500-1607) ────────────────────
//
// Rendeur bas-niveau des CHIFFRES PV en combat DOUBLE — consommé par
// UpdateHpTextInHealthboxInDoubles (battle_interface.c:1216). Contrairement à
// RenderText (qui blit dans une window via blitGlyphToWindow), il écrit des
// TUILES 4bpp BRUTES dans un buffer `pixels` fourni par l'appelant (=
// gMonSpritesGfxPtr->barFontGfx) : pour chaque glyphe IMPRIMABLE il pousse
// 2 tuiles (haut 0x20 + bas 0x20) puis avance de 0x40 — exactement comme le
// décomp (CpuCopy32(gfxBufferTop, pixels, 0x20) ; CpuCopy32(gfxBufferBottom,
// pixels + 0x20, 0x20) ; pixels += 0x40, ll.1597-1599). Les codes de contrôle
// (COLOR/HIGHLIGHT/SHADOW/FONT/…) pilotent l'état couleur SANS consommer de
// tuile (1:1 `continue`).
//
// FRONTIÈRE HW/asset (même émulation que CopyGlyphToWindow) : notre latfont est
// pré-décodé en pixels idx 0/1/2/3, donc DecompressGlyph_Bold/Normal +
// DecompressGlyphTile (text.c:526) sont émulés en PACKANT gCurGlyph.gfxBuffer
// (haut = lignes 0-7, bas = lignes 8-15) avec le mapping couleur de
// GenerateFontHalfRowLookupTable (text.c:363 : 0→bg, 1→fg, 2→shadow, 3→bg, cf.
// blitGlyphToWindow). FONT_BOLD (= sFontBoldJapaneseGlyphs décomp) n'est PAS
// chargé côté port (FONT_NAMES n'a pas d'entrée 9 → fallback FONT_NORMAL) :
// dette d'asset COSMÉTIQUE du chemin DOUBLE (INERTE tant que l'intro double
// n'est pas câblée). Le flux + les offsets tuiles sont 1:1.

/** Mappe une valeur de pixel glyphe 2-bit → index couleur 4bpp (1:1
 *  GenerateFontHalfRowLookupTable : 0→bg, 1→fg, 2→shadow, 3→bg — sFontHalfRowOffsets[3]==[0]). */
function _mapGlyphColorIndex(v: number, fg: number, bg: number, shadow: number): number {
  switch (v) {
    case 1:  return fg & 0xF;
    case 2:  return shadow & 0xF;
    default: return bg & 0xF;  // 0 et 3 → bg
  }
}

/** Packe un demi-glyphe (8×8, lignes [rowStart..rowStart+8[) en 1 tuile 4bpp
 *  (32 bytes, 4 bytes/ligne, nibble bas = pixel gauche — cf. LoadBattleBarGfx /
 *  _windowTextDataTo4bpp) dans `dest` à `destOff`. `glyph` = cellule 16×16 pré-décodée. */
function _packGlyphHalfTile(
  glyph: number[] | null, rowStart: number, dest: Uint8Array, destOff: number,
  fg: number, bg: number, shadow: number,
): void {
  for (let row = 0; row < 8; row++) {
    const gy = (rowStart + row) * 16;  // stride 16 (= cellule glyphe, cf. blitGlyphToWindow GLYPH_W)
    for (let pc = 0; pc < 4; pc++) {
      const v1 = glyph ? (glyph[gy + pc * 2] ?? 0) : 0;
      const v2 = glyph ? (glyph[gy + pc * 2 + 1] ?? 0) : 0;
      dest[destOff + row * 4 + pc] =
        _mapGlyphColorIndex(v1, fg, bg, shadow) | (_mapGlyphColorIndex(v2, fg, bg, shadow) << 4);
    }
  }
}

/** 1:1 décomp `u8 RenderTextHandleBold(u8 *pixels, u8 fontId, u8 *str)` (text.c:1500).
 *  `str` = chaîne ENCODÉE (bytes charmap + codes EXT_CTRL_CODE), comme le `u8 *str`
 *  décomp. Écrit les tuiles glyphes dans `pixels` ; retourne 1 (1:1). */
export function RenderTextHandleBold(pixels: Uint8Array, fontId: number, str: Uint8Array): number {
  // 1:1 ll.1511-1517 : SaveTextColors + GenerateFontHalfRowLookupTable(WHITE,
  // TRANSPARENT, LIGHT_GRAY). Le port n'a pas de sFontHalfRowLookupTable GLOBAL
  // (émulé par pixels pré-décodés) → l'état couleur est LOCAL à la fonction ;
  // Save/Restore/Generate deviennent le suivi (fg,bg,shadow) local appliqué au
  // packing de chaque glyphe. Défauts 1:1.
  let fgColor: number = TEXT_COLOR.WHITE;
  let bgColor: number = TEXT_COLOR.TRANSPARENT;
  let shadowColor: number = TEXT_COLOR.LIGHT_GRAY;
  let strPos = 0;
  let pixOff = 0;
  let temp = 0;

  do {
    temp = str[strPos++] ?? EOS;
    switch (temp) {
      case EXT_CTRL_CODE_BEGIN: {
        const temp2 = str[strPos++] ?? EOS;
        switch (temp2) {
          case EXT_CTRL_CODE_COLOR_HIGHLIGHT_SHADOW:  // 1:1 ll.1530-1535
            fgColor = str[strPos++] ?? fgColor;
            bgColor = str[strPos++] ?? bgColor;
            shadowColor = str[strPos++] ?? shadowColor;
            continue;
          case EXT_CTRL_CODE_COLOR:      fgColor = str[strPos++] ?? fgColor; continue;      // ll.1536-1539
          case EXT_CTRL_CODE_HIGHLIGHT:  bgColor = str[strPos++] ?? bgColor; continue;      // ll.1540-1543
          case EXT_CTRL_CODE_SHADOW:     shadowColor = str[strPos++] ?? shadowColor; continue; // ll.1544-1547
          case EXT_CTRL_CODE_FONT:       fontId = str[strPos++] ?? fontId; break;            // ll.1548-1550
          case EXT_CTRL_CODE_PLAY_BGM:                                                        // ll.1551-1553
          case EXT_CTRL_CODE_PLAY_SE:
            strPos++;   // 1:1 fallthrough : consomme 1 byte de PLUS…
            strPos++;   // …puis tombe dans le groupe ci-dessous (+1 byte). Net = +2.
            break;
          case EXT_CTRL_CODE_PALETTE:            // 1:1 ll.1554-1564 : codes à 1 byte d'arg → skip.
          case EXT_CTRL_CODE_PAUSE:
          case EXT_CTRL_CODE_ESCAPE:
          case EXT_CTRL_CODE_SHIFT_RIGHT:
          case EXT_CTRL_CODE_SHIFT_DOWN:
          case EXT_CTRL_CODE_CLEAR:
          case EXT_CTRL_CODE_SKIP:
          case EXT_CTRL_CODE_CLEAR_TO:
          case EXT_CTRL_CODE_MIN_LETTER_SPACING:
            strPos++;
            break;
          default:  // 1:1 ll.1565-1572 : RESET_FONT/PAUSE_UNTIL_PRESS/WAIT_SE/FILL_WINDOW/JPN/ENG/default → continue.
            continue;
        }
        break;
      }
      case CHAR_DYNAMIC:        // 1:1 ll.1575-1580 : codes à 1 byte d'arg → skip.
      case CHAR_KEYPAD_ICON:
      case CHAR_EXTRA_SYMBOL:
      case PLACEHOLDER_BEGIN:
        strPos++;
        break;
      case CHAR_PROMPT_SCROLL:  // 1:1 ll.1581-1585 : pas d'arg, pas de glyphe.
      case CHAR_PROMPT_CLEAR:
      case CHAR_NEWLINE:
      case EOS:
        break;
      default: {  // 1:1 ll.1586-1600 : décompresse le glyphe (bold/normal) → 2 tuiles, avance 0x40.
        _fillCurGlyph(fontId === FONT_BOLD ? FONT_BOLD : FONT_NORMAL, temp);
        const glyph = gCurGlyph.gfxBuffer;
        _packGlyphHalfTile(glyph, 0, pixels, pixOff, fgColor, bgColor, shadowColor);        // gfxBufferTop
        _packGlyphHalfTile(glyph, 8, pixels, pixOff + 0x20, fgColor, bgColor, shadowColor);  // gfxBufferBottom
        pixOff += 0x40;
        break;
      }
    }
  } while (temp !== EOS);

  return 1;  // 1:1 l.1606 : RestoreTextColors (no-op : état local) ; return 1.
}

/**
 * Encode une JS string en bytes pour le moteur, via charmap.
 * (Pas de \p / \l ici — gérés en amont par paginate, mais escapes traités.)
 */
/** 1:1 charmap.txt : entrées multi-bytes (tuiles composées de la font). */
const CHARMAP_LIGATURES: Readonly<Record<string, readonly number[]>> = {
  PKMN: [0x53, 0x54],                          // « POKéMON »
  POKEBLOCK: [0x55, 0x56, 0x57, 0x58, 0x59],   // « POKéBLOC »
};

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
    // 1:1 décomp escapes : \p = PROMPT_CLEAR, \l = PROMPT_SCROLL, \n = newline.
    if (ch === '\\' && i + 1 < str.length) {
      const next = str[i + 1];
      if (next === 'p') { bytes.push(CHAR_PROMPT_CLEAR); i += 2; continue; }
      if (next === 'l') { bytes.push(CHAR_PROMPT_SCROLL); i += 2; continue; }
      if (next === 'n') { bytes.push(CHAR_NEWLINE); i += 2; continue; }
    }
    if (ch === '{') {
      const closeIdx = str.indexOf('}', i + 1);
      if (closeIdx > 0) {
        const inner = str.slice(i + 1, closeIdx).trim();
        if (inner === 'PAUSE_UNTIL_PRESS') {
          bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PAUSE_UNTIL_PRESS);
          i = closeIdx + 1;
          continue;
        }
        // codes ext SANS param textuel (WAIT_SE 0 arg ; PLAY_BGM/PLAY_SE + arg u16 brut suivant).
        if (inner === 'WAIT_SE') { bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_WAIT_SE); i = closeIdx + 1; continue; }
        if (inner === 'PLAY_BGM') { bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_BGM); i = closeIdx + 1; continue; }
        if (inner === 'PLAY_SE') { bytes.push(EXT_CTRL_CODE_BEGIN, EXT_CTRL_CODE_PLAY_SE); i = closeIdx + 1; continue; }
        // {PLAY_SE SE_X} / {PLAY_BGM MUS_X} à argument NOMMÉ (forme des textes extraits,
        // ex. gText_12PoofForgotMove "{PLAY_SE SE_BALL_BOUNCE_1}Tadaa!") : 1:1 format
        // binaire décomp = BEGIN + code + u16 LE (le renderer lit l'id → PlaySE/PlayBGM).
        // La résolution SE_*/MUS_* → id passe par la table des constantes décomp
        // (= même source que playse/playbgm du byte-VM).
        const mSnd = inner.match(/^(PLAY_SE|PLAY_BGM)\s+(\S+)$/);
        if (mSnd) {
          const id = /^(\d|0x)/i.test(mSnd[2]) ? Number(mSnd[2]) : resolveDecompConstant(mSnd[2]);
          if (typeof id === 'number' && Number.isFinite(id)) {
            bytes.push(EXT_CTRL_CODE_BEGIN,
              mSnd[1] === 'PLAY_SE' ? EXT_CTRL_CODE_PLAY_SE : EXT_CTRL_CODE_PLAY_BGM,
              id & 0xFF, (id >> 8) & 0xFF);
          } else {
            console.warn('[text] encodeStringForFont: constante son non résolue', inner);
          }
          i = closeIdx + 1;
          continue;
        }
        // octet littéral {0xNN} (arg brut d'un code ext, ex. song id de PLAY_BGM).
        if (/^0x[0-9a-fA-F]{1,2}$/.test(inner)) { bytes.push(parseInt(inner, 16) & 0xFF); i = closeIdx + 1; continue; }
        // 1:1 décomp src/text.c:1023-1043 : COLOR/SHADOW/HIGHLIGHT/PAUSE + CLEAR/SKIP/
        // CLEAR_TO/MIN_LETTER_SPACING/FONT (kerning naming_screen.c sNamingScreenKeyboardText).
        const m = inner.match(/^(COLOR|SHADOW|HIGHLIGHT|PAUSE|CLEAR_TO|CLEAR|SKIP|MIN_LETTER_SPACING|FONT)\s+(\S+)$/);
        if (m) {
          const cmd = m[1];
          const param = m[2];
          let subCode: number | null = null;
          let value: number | null = null;
          if (cmd === 'FONT') {
            subCode = EXT_CTRL_CODE_FONT;
            const fontMap: Record<string, number> = { SMALL: 0, NORMAL: 1, SHORT: 2, NARROW: 7, SMALL_NARROW: 8, BOLD: 9 };
            value = fontMap[param] ?? parseInt(param, 10);
          }
          else if (cmd === 'COLOR') { subCode = EXT_CTRL_CODE_COLOR; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
          else if (cmd === 'SHADOW') { subCode = EXT_CTRL_CODE_SHADOW; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
          else if (cmd === 'HIGHLIGHT') { subCode = EXT_CTRL_CODE_HIGHLIGHT; value = (TEXT_COLOR as Record<string, number>)[param] ?? null; }
          else if (cmd === 'PAUSE') { subCode = EXT_CTRL_CODE_PAUSE; value = parseInt(param, 10); }
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
        // 1:1 décomp EXTRA_SYMBOL `{LV_2}` `{NO}` etc → CHAR_EXTRA_SYMBOL(0xF9) + symByte.
        const sym = EXTRA_SYMBOL[inner as keyof typeof EXTRA_SYMBOL];
        if (sym !== undefined) {
          bytes.push(CHAR_EXTRA_SYMBOL, sym);
          i = closeIdx + 1;
          continue;
        }
        // 1:1 décomp charmap.txt:1001-1013 keypad icons `{A_BUTTON}` `{DPAD_NONE}` etc
        // → CHAR_KEYPAD_ICON(0xF8) + id. Rendu par DrawKeypadIcon (RenderText), rendant
        // fonctionnels tous les textes strings.json à icônes (naming, PC, options…).
        const keypadId = KEYPAD_ICON[inner as keyof typeof KEYPAD_ICON];
        if (keypadId !== undefined) {
          bytes.push(CHAR_KEYPAD_ICON, keypadId);
          i = closeIdx + 1;
          continue;
        }
        // 1:1 charmap.txt ligatures multi-bytes : {PKMN} = 53 54 (« POKéMON »),
        // {POKEBLOCK} = 55 56 57 58 59 (« POKéBLOC ») — tuiles composées de la font.
        const liga = CHARMAP_LIGATURES[inner];
        if (liga !== undefined) {
          bytes.push(...liga);
          i = closeIdx + 1;
          continue;
        }
      }
      // Inconnu : skip (déjà processed par substitutePlaceholders ou non supporté).
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
  windowId?: number;
  fontId?: number;
  x?: number;
  y?: number;
  fgColor?: number;
  bgColor?: number;
  shadowColor?: number;
  letterSpacing?: number;
  lineSpacing?: number;
  textSpeed?: number;
  downArrowPixels?: number[][];
  darkDownArrowPixels?: number[][];
  onCharRendered?: (printer: TextPrinter, lastByte: number) => void;
}

export function addTextPrinter(opts: AddTextPrinterOpts): TextPrinter {
  const x = opts.x ?? 0;
  const y = opts.y ?? 1;
  // 1:1 décomp `text.c:271-298 AddTextPrinter` : --textSpeed à l'init si typewriter
  // (speed != TEXT_SKIP_DRAW && != 0), sinon 0 = instant path. sTextSpeeds = {SLOW=8,
  // MID=4, FAST=1} → après --, FAST stored=0 → 1 char/frame = vitesse JOY_HELD(A/B).
  const TEXT_SKIP_DRAW = 255;
  const inputSpeed = opts.textSpeed ?? 0;
  const isInstantPath = inputSpeed === TEXT_SKIP_DRAW || inputSpeed === 0;
  const normalizedSpeed = isInstantPath ? 0 : (inputSpeed - 1);
  const fontId = opts.fontId ?? 1;  // 1 = FONT_NORMAL (défaut décomp)
  return {
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
    subStruct: {
      fontId,
      hasPrintBeenSpedUp: false,
      downArrowDelay: 0,
      downArrowYPosIdx: 0,
      hasFontIdBeenSet: true,
      autoScrollDelay: 0,
    },
    active: true,  // 1:1 décomp sTempTextPrinter.active = TRUE (text.c:279)
    state: RENDER_STATE_HANDLE_CHAR,
    textSpeed: normalizedSpeed,
    delayCounter: 0,
    scrollDistance: 0,
    minLetterSpacing: 0,
    japanese: false,
    encodedString: opts.encodedString,
    window: opts.window,
    instantPath: isInstantPath,
    pauseCounter: 0,
    downArrowPixels: opts.downArrowPixels,
    darkDownArrowPixels: opts.darkDownArrowPixels,
    onCharRendered: opts.onCharRendered,
  };
}

/** Wrapper legacy → délègue à `RenderText` (state-machine 1:1 text.c:934). */
export function runTextPrinter(printer: TextPrinter): number {
  return RenderText(printer);
}

/**
 * Blit / refresh la down arrow à (currentX, currentY) avec animation bobbing.
 * Cf. décomp `TextPrinterDrawDownArrow` (text.c:787-836). `useAlternateDownArrow`
 * lu au DRAW time (combat=alt, terrain=normal).
 */
export function textPrinterDrawDownArrow(printer: TextPrinter): void {
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

  printer.subStruct.downArrowDelay = DOWN_ARROW_DELAY_FRAMES;
  printer.subStruct.downArrowYPosIdx++;
}

/**
 * Blit l'arrow 8×16 à (dstX, dstY) en samplant src à (0, srcY). `if (srcIdx===0)
 * continue` = 1:1 `BlitBitmapRectToWindow` colorKey 0 transparent (window.c:411).
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
      if (srcIdx === 0) continue; // colorKey 0 = transparent
      const colX = dstX + px;
      if (colX < 0 || colX >= w.widthPx) continue;
      w.pixelBuffer[rowStart + colX] = srcIdx & 0x0F;
    }
  }
  w.needsFlush = true;
}

/** Reset state machine arrow (à appeler quand on advance la page ou hide). */
export function resetDownArrow(printer: TextPrinter): void {
  printer.subStruct.downArrowDelay = 0;
  printer.subStruct.downArrowYPosIdx = 0;
}

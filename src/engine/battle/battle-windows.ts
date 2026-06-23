/**
 * battle-windows.ts — Data 1:1 décomp du windowing battle.
 *
 * Sources de vérité (vérifiées ligne-par-ligne 2026-05-17) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h:341-368`
 *     (B_WIN_TYPE_* + B_WIN_* window IDs)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h:381`
 *     (B_WIN_COPYTOVRAM = 1 << 7)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c:163-382`
 *     `sStandardBattleWindowTemplates` (geometry par window, 0..23 + DUMMY)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_message.c:33-45`
 *     `struct BattleWindowText` (ordre des champs exact)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_message.c:1479-1630`
 *     `sTextOnWindowsInfo_Normal` (fillValue + font + fg/bg/shadow par window)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/text.h:10-21`
 *     (enum FONT_* — FONT_NORMAL=1, FONT_NARROW=7)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/window.h:6` PIXEL_FILL
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/characters.h:234-249`
 *     (TEXT_COLOR_* / TEXT_DYNAMIC_COLOR_*)
 *
 * NOTE architecture décomp : le BG0 battle est screenSize=2 (= 32×64 tiles)
 * (`gBattleBgTemplates[0]` battle_bg.c:125-133 : charBase=0, mapBase=24,
 * screenSize=2). Les windows MSG (tilemapTop=15), ACTION_PROMPT/MENU (top=35),
 * MOVE_* (top=55/57) sont à des Y DIFFÉRENTS dans ce tilemap 64-tall.
 * `gBattle_BG0_Y` (battle_main.c:2091 `SetGpuReg(REG_OFFSET_BG0VOFS, gBattle_BG0_Y)`)
 * scroll 0 / DISPLAY_HEIGHT(160) / DISPLAY_HEIGHT*2(320) px révèle la section
 * voulue au même endroit écran (~Y 120px = bas).
 *
 * La couleur ROUGE du dialog box vient de :
 *   - `gBattleWindowTextPalette` (= text.pal) chargée à BG_PLTT_ID(5)
 *     (battle_bg.c:748 LoadBattleMenuWindowGfx) — idx 15 = rouge.
 *   - B_WIN_MSG : fillValue=PIXEL_FILL(0xF)=0xFF, bgColor=TEXT_DYNAMIC_COLOR_6=15
 *     → fond box = palette idx 15 = rouge ; fgColor=TEXT_COLOR_WHITE=1 = texte blanc.
 *
 * ⚠️ DONNÉES = TRANSCRITES 1:1 DE LA DÉCOMP (battle_bg.c), PAS APPROXIMÉES.
 * `sStandardBattleWindowTemplates` est défini ci-dessous (anciennement le scaffold
 * auto-extrait `decomp-data/src/battle_bg-data.ts`, désormais inliné ici = port de
 * la section windowing de battle_bg.c). `gBattleBgTemplates` vit dans son miroir
 * `src/battle_bg.ts`. `sTextOnWindowsInfo_Normal` reste porté main car l'extraction
 * ne le sort qu'en C brut (PIXEL_FILL(0xF)…), non consommable — mais cross-validé
 * contre static-tables/battle_message.json.
 */

// 1:1 décomp `static const struct WindowTemplate sStandardBattleWindowTemplates[]`
// (battle_bg.c:163-382). Index array == B_WIN_* (l'ordre source décomp = l'ordre
// B_WIN_*). Hébergé ici (= port de la section windowing de battle_bg.c) en attendant
// la fusion battle-windows → battle_bg.ts ; le Record dérivé (ci-dessous) est ce que
// consomment les autres modules. baseBlock en décimal (144=0x90, 448=0x1C0, …).
const _autoStdBattleWinTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 0, baseBlock: 144 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 35, width: 14, height: 4, paletteNum: 0, baseBlock: 448 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 35, width: 12, height: 4, paletteNum: 5, baseBlock: 400 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 768 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 784 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 800 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 816 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 656 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 0, height: 0, paletteNum: 5, baseBlock: 664 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 664 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 672 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 8, height: 4, paletteNum: 5, baseBlock: 688 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 9, width: 4, height: 4, paletteNum: 5, baseBlock: 256 },
  { bg: 1, tilemapLeft: 19, tilemapTop: 8, width: 10, height: 11, paletteNum: 5, baseBlock: 256 },
  { bg: 2, tilemapLeft: 18, tilemapTop: 0, width: 12, height: 3, paletteNum: 6, baseBlock: 366 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 3, width: 6, height: 2, paletteNum: 5, baseBlock: 32 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 3, width: 6, height: 2, paletteNum: 5, baseBlock: 64 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 2, width: 6, height: 2, paletteNum: 5, baseBlock: 32 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 2, width: 6, height: 2, paletteNum: 5, baseBlock: 64 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 6, width: 6, height: 2, paletteNum: 5, baseBlock: 96 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 6, width: 6, height: 2, paletteNum: 5, baseBlock: 128 },
  { bg: 0, tilemapLeft: 12, tilemapTop: 2, width: 6, height: 2, paletteNum: 0, baseBlock: 160 },
  { bg: 0, tilemapLeft: 4, tilemapTop: 2, width: 7, height: 2, paletteNum: 0, baseBlock: 160 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 2, width: 7, height: 2, paletteNum: 0, baseBlock: 176 },
] as const;

// ─── B_WIN_TYPE (battle.h:341-342) ──────────────────────────────────────────
export const B_WIN_TYPE_NORMAL = 0;
export const B_WIN_TYPE_ARENA = 1;

// ─── B_WIN_* window IDs (battle.h:345-368) ──────────────────────────────────
export const B_WIN_MSG = 0;
export const B_WIN_ACTION_PROMPT = 1;   // "Que doit faire {x} ?"
export const B_WIN_ACTION_MENU = 2;     // ATTAQUE/SAC/POKéMON/FUITE
export const B_WIN_MOVE_NAME_1 = 3;     // haut gauche
export const B_WIN_MOVE_NAME_2 = 4;     // haut droite
export const B_WIN_MOVE_NAME_3 = 5;     // bas gauche
export const B_WIN_MOVE_NAME_4 = 6;     // bas droite
export const B_WIN_PP = 7;
export const B_WIN_DUMMY = 8;
export const B_WIN_PP_REMAINING = 9;
export const B_WIN_MOVE_TYPE = 10;
export const B_WIN_SWITCH_PROMPT = 11;
export const B_WIN_YESNO = 12;
export const B_WIN_LEVEL_UP_BOX = 13;
export const B_WIN_LEVEL_UP_BANNER = 14;
export const B_WIN_VS_PLAYER = 15;
export const B_WIN_VS_OPPONENT = 16;
export const B_WIN_VS_MULTI_PLAYER_1 = 17;
export const B_WIN_VS_MULTI_PLAYER_2 = 18;
export const B_WIN_VS_MULTI_PLAYER_3 = 19;
export const B_WIN_VS_MULTI_PLAYER_4 = 20;
export const B_WIN_VS_OUTCOME_DRAW = 21;
export const B_WIN_VS_OUTCOME_LEFT = 22;
export const B_WIN_VS_OUTCOME_RIGHT = 23;

/** 1:1 décomp battle.h:381 `#define B_WIN_COPYTOVRAM (1 << 7)`.
 *  Flag OR'd dans windowId pour skip le FillWindowPixelBuffer + copy. */
export const B_WIN_COPYTOVRAM = 1 << 7;

// ─── FONT_* (1:1 décomp include/text.h:10-21 enum) ──────────────────────────
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

// ─── TEXT_COLOR_* / TEXT_DYNAMIC_COLOR_* (characters.h:234-249) ──────────────
export const TEXT_COLOR_TRANSPARENT = 0x0;
export const TEXT_COLOR_WHITE = 0x1;
export const TEXT_COLOR_DARK_GRAY = 0x2;
export const TEXT_COLOR_LIGHT_GRAY = 0x3;
export const TEXT_COLOR_RED = 0x4;
export const TEXT_COLOR_LIGHT_RED = 0x5;
export const TEXT_COLOR_GREEN = 0x6;
export const TEXT_COLOR_LIGHT_GREEN = 0x7;
export const TEXT_COLOR_BLUE = 0x8;
export const TEXT_COLOR_LIGHT_BLUE = 0x9;
export const TEXT_DYNAMIC_COLOR_1 = 0xA;
export const TEXT_DYNAMIC_COLOR_2 = 0xB;
export const TEXT_DYNAMIC_COLOR_3 = 0xC;
export const TEXT_DYNAMIC_COLOR_4 = 0xD; // aquamarine
export const TEXT_DYNAMIC_COLOR_5 = 0xE; // blue-green
export const TEXT_DYNAMIC_COLOR_6 = 0xF; // cerulean

// ─── Window template (1:1 décomp `struct WindowTemplate` window.h:27-36) ────
export interface BattleWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

/** 1:1 décomp `DUMMY_WIN_TEMPLATE` (window.h:38-41) = `{ .bg = 0xFF }`
 *  (tous les autres champs = 0). Sentinelle de fin pour InitWindows :
 *  l'allocation s'arrête au premier template avec bg == 0xFF. */
export const DUMMY_WIN_TEMPLATE: BattleWindowTemplate = {
  bg: 0xFF, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0,
};

/** Record dérivé de `_autoStdBattleWinTemplates` (ci-dessus, 1:1 battle_bg.c:163-382)
 *  — index == B_WIN_* (ordre source décomp = ordre B_WIN_*). C'est CETTE forme que
 *  consomment battle-levelup-box / battle_script_commands / battle-yesno-box (lecture
 *  indexée → valeurs identiques au raw array). */
export const sStandardBattleWindowTemplates: Record<number, BattleWindowTemplate> =
  Object.fromEntries(
    _autoStdBattleWinTemplates.map((t, i) => [i, {
      bg: t.bg, tilemapLeft: t.tilemapLeft, tilemapTop: t.tilemapTop,
      width: t.width, height: t.height, paletteNum: t.paletteNum,
      baseBlock: t.baseBlock,
    } as BattleWindowTemplate]),
  );

/** 1:1 décomp `struct BattleWindowText` (battle_message.c:33-45).
 *  Ordre exact des champs : fillValue, fontId, x, y, letterSpacing,
 *  lineSpacing, speed, fgColor, bgColor, shadowColor. */
export interface BattleWindowText {
  fillValue: number;     // PIXEL_FILL(x) = (x | (x << 4))
  fontId: number;        // enum FONT_* (FONT_NORMAL=1, FONT_NARROW=7)
  x: number;
  y: number;
  letterSpacing: number;
  lineSpacing: number;
  speed: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

/** PIXEL_FILL(num) 1:1 décomp window.h:6 = `((num) | ((num) << 4))`. */
export function PIXEL_FILL(num: number): number { return (num | (num << 4)) & 0xFF; }

/** 1:1 décomp `sTextOnWindowsInfo_Normal` (battle_message.c:1479-1630).
 *  Indexé par B_WIN_* (0..14). Les champs non-initialisés dans le décomp
 *  (letterSpacing, lineSpacing) valent 0 (C designated initializers).
 *  La couleur rouge du dialog (B_WIN_MSG) vient de bgColor=DYN_6(15) +
 *  fillValue=PIXEL_FILL(0xF)=0xFF résolus via text.pal au BG slot 5. */
export const sTextOnWindowsInfo_Normal: Record<number, BattleWindowText> = {
  [B_WIN_MSG]:             { fillValue: PIXEL_FILL(0xF), fontId: FONT_NORMAL, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 1, fgColor: TEXT_COLOR_WHITE,     bgColor: TEXT_DYNAMIC_COLOR_6, shadowColor: TEXT_COLOR_GREEN },
  [B_WIN_ACTION_PROMPT]:   { fillValue: PIXEL_FILL(0xF), fontId: FONT_NORMAL, x: 1,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_COLOR_WHITE,     bgColor: TEXT_DYNAMIC_COLOR_6, shadowColor: TEXT_COLOR_GREEN },
  [B_WIN_ACTION_MENU]:     { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_1]:     { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_2]:     { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_3]:     { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_4]:     { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_PP]:              { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_3, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_2 },
  [B_WIN_DUMMY]:           { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_PP_REMAINING]:    { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 2,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_3, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_2 },
  [B_WIN_MOVE_TYPE]:       { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_SWITCH_PROMPT]:   { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_YESNO]:           { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_LEVEL_UP_BOX]:    { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 0,  y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4, bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_LEVEL_UP_BANNER]: { fillValue: PIXEL_FILL(0),   fontId: FONT_NORMAL, x: 32, y: 1, letterSpacing: 0, lineSpacing: 0, speed: 0, fgColor: TEXT_COLOR_WHITE,     bgColor: TEXT_COLOR_TRANSPARENT, shadowColor: TEXT_COLOR_DARK_GRAY },
};

/** 1:1 décomp `gBattleWindowTemplates[B_WIN_TYPE_NORMAL] = sStandardBattleWindowTemplates`
 *  (battle_bg.c:596-600). Retourne l'array ordonné B_WIN_* 0..23 SUIVI de la
 *  sentinelle DUMMY_WIN_TEMPLATE (= 1:1 décomp : le tableau C se termine par
 *  `DUMMY_WIN_TEMPLATE`, et `InitWindows` arrête l'allocation au premier
 *  `bg == 0xFF`). Le window ID alloué == index B_WIN_*. */
export function getBattleWindowTemplates(): BattleWindowTemplate[] {
  const out: BattleWindowTemplate[] = [];
  for (let i = B_WIN_MSG; i <= B_WIN_VS_OUTCOME_RIGHT; i++) {
    out.push(sStandardBattleWindowTemplates[i]);
  }
  out.push(DUMMY_WIN_TEMPLATE);
  return out;
}

/** 1:1 décomp `sBattleTextOnWindowsInfo[gBattleScripting.windowsType]`
 *  (battle_message.c:1957-1961). On ne porte que B_WIN_TYPE_NORMAL (les
 *  combats wild/trainer non-Arena). Retourne la BattleWindowText pour winId. */
export function getBattleTextOnWindowsInfo(winId: number): BattleWindowText {
  return sTextOnWindowsInfo_Normal[winId];
}

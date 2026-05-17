/**
 * battle-windows.ts — Data 1:1 décomp du windowing battle.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/battle.h:341-368`
 *     (B_WIN_TYPE_* + B_WIN_* window IDs)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c:163-340`
 *     `sStandardBattleWindowTemplates` (geometry par window)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_message.c:1479-1600`
 *     `sTextOnWindowsInfo_Normal` (fillValue + font + fg/bg/shadow par window)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/characters.h:234-249`
 *     (TEXT_COLOR_* / TEXT_DYNAMIC_COLOR_*)
 *
 * NOTE architecture décomp : le BG0 battle est screenSize=2 (= 32×64 tiles).
 * Les windows MSG (tilemapTop=15), ACTION_PROMPT/MENU (top=35), MOVE_* (top=55/57)
 * sont à des Y DIFFÉRENTS dans ce tilemap 64-tall. `gBattle_BG0_Y` scroll
 * (0 / 160 / 320 px = 0 / 20 / 40 tiles) révèle la section voulue au même
 * endroit écran (~Y 120px = bas). Cf. battle_bg.c gBattle_BG0_Y usage.
 *
 * La couleur ROUGE du dialog box vient de :
 *   - `gBattleWindowTextPalette` (= text.pal) chargée à BG_PLTT_ID(5)
 *     (battle_bg.c:748 LoadBattleMenuWindowGfx) — idx 15 = rouge.
 *   - B_WIN_MSG : fillValue=PIXEL_FILL(0xF)=15, bgColor=TEXT_DYNAMIC_COLOR_6=15
 *     → fond box = palette idx 15 = rouge ; fgColor=TEXT_COLOR_WHITE=1 = texte blanc.
 */

// ─── B_WIN_TYPE (battle.h:341-342) ──────────────────────────────────────────
export const B_WIN_TYPE_NORMAL = 0;
export const B_WIN_TYPE_ARENA = 1;

// ─── B_WIN_* window IDs (battle.h:344-368) ──────────────────────────────────
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

// ─── Window template (1:1 décomp `struct WindowTemplate`) ───────────────────
export interface BattleWindowTemplate {
  bg: number;
  tilemapLeft: number;
  tilemapTop: number;
  width: number;
  height: number;
  paletteNum: number;
  baseBlock: number;
}

/** 1:1 décomp `sStandardBattleWindowTemplates` (battle_bg.c:163-340).
 *  Indexé par B_WIN_*. Y décomp bruts (= BG0 64-tall, scroll via gBattle_BG0_Y). */
export const sStandardBattleWindowTemplates: Record<number, BattleWindowTemplate> = {
  [B_WIN_MSG]:           { bg: 0, tilemapLeft: 2,  tilemapTop: 15, width: 27, height: 4, paletteNum: 0, baseBlock: 0x0090 },
  [B_WIN_ACTION_PROMPT]: { bg: 0, tilemapLeft: 1,  tilemapTop: 35, width: 14, height: 4, paletteNum: 0, baseBlock: 0x01c0 },
  [B_WIN_ACTION_MENU]:   { bg: 0, tilemapLeft: 17, tilemapTop: 35, width: 12, height: 4, paletteNum: 5, baseBlock: 0x0190 },
  [B_WIN_MOVE_NAME_1]:   { bg: 0, tilemapLeft: 2,  tilemapTop: 55, width: 8,  height: 2, paletteNum: 5, baseBlock: 0x0300 },
  [B_WIN_MOVE_NAME_2]:   { bg: 0, tilemapLeft: 11, tilemapTop: 55, width: 8,  height: 2, paletteNum: 5, baseBlock: 0x0310 },
  [B_WIN_MOVE_NAME_3]:   { bg: 0, tilemapLeft: 2,  tilemapTop: 57, width: 8,  height: 2, paletteNum: 5, baseBlock: 0x0320 },
  [B_WIN_MOVE_NAME_4]:   { bg: 0, tilemapLeft: 11, tilemapTop: 57, width: 8,  height: 2, paletteNum: 5, baseBlock: 0x0330 },
  [B_WIN_PP]:            { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 4,  height: 2, paletteNum: 5, baseBlock: 0x0290 },
  [B_WIN_DUMMY]:         { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 0,  height: 0, paletteNum: 5, baseBlock: 0x0298 },
  [B_WIN_PP_REMAINING]:  { bg: 0, tilemapLeft: 25, tilemapTop: 55, width: 4,  height: 2, paletteNum: 5, baseBlock: 0x0298 },
  [B_WIN_MOVE_TYPE]:     { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 8,  height: 2, paletteNum: 5, baseBlock: 0x02a0 },
  [B_WIN_SWITCH_PROMPT]: { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 8,  height: 4, paletteNum: 5, baseBlock: 0x02b0 },
  [B_WIN_YESNO]:         { bg: 0, tilemapLeft: 25, tilemapTop: 9,  width: 4,  height: 4, paletteNum: 5, baseBlock: 0x0100 },
  [B_WIN_LEVEL_UP_BOX]:  { bg: 1, tilemapLeft: 19, tilemapTop: 8,  width: 10, height: 11, paletteNum: 5, baseBlock: 0x0100 },
  [B_WIN_LEVEL_UP_BANNER]:{ bg: 2, tilemapLeft: 18, tilemapTop: 0, width: 12, height: 3, paletteNum: 6, baseBlock: 0x016e },
};

/** 1:1 décomp `struct BattleWindowText` (battle_message.c:33-45). */
export interface BattleWindowText {
  fillValue: number;    // PIXEL_FILL(x) = (x << 4) | x
  fontId: number;       // 0=FONT_NORMAL, ... (cf. gba-text-system FONT_*)
  x: number;
  y: number;
  speed: number;
  fgColor: number;
  bgColor: number;
  shadowColor: number;
}

/** PIXEL_FILL(x) 1:1 décomp (text.h) = `((x) << 4) | (x)`. */
export function PIXEL_FILL(x: number): number { return ((x & 0xF) << 4) | (x & 0xF); }

const FONT_NORMAL = 0;
const FONT_NARROW = 2;

/** 1:1 décomp `sTextOnWindowsInfo_Normal` (battle_message.c:1479-1600).
 *  Indexé par B_WIN_*. La couleur rouge du dialog vient de bgColor=15 +
 *  fillValue=PIXEL_FILL(0xF) résolus via la palette text.pal (BG slot 0/5). */
export const sTextOnWindowsInfo_Normal: Record<number, BattleWindowText> = {
  [B_WIN_MSG]:           { fillValue: PIXEL_FILL(0xF), fontId: FONT_NORMAL, x: 0, y: 1, speed: 1, fgColor: TEXT_COLOR_WHITE,        bgColor: TEXT_DYNAMIC_COLOR_6, shadowColor: TEXT_COLOR_GREEN },
  [B_WIN_ACTION_PROMPT]: { fillValue: PIXEL_FILL(0xF), fontId: FONT_NORMAL, x: 1, y: 1, speed: 0, fgColor: TEXT_COLOR_WHITE,        bgColor: TEXT_DYNAMIC_COLOR_6, shadowColor: TEXT_COLOR_GREEN },
  [B_WIN_ACTION_MENU]:   { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_1]:   { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_2]:   { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_3]:   { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_MOVE_NAME_4]:   { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_PP]:            { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_3,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_2 },
  [B_WIN_PP_REMAINING]:  { fillValue: PIXEL_FILL(0xE), fontId: FONT_NORMAL, x: 2, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_3,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_2 },
  [B_WIN_MOVE_TYPE]:     { fillValue: PIXEL_FILL(0xE), fontId: FONT_NARROW, x: 0, y: 1, speed: 0, fgColor: TEXT_DYNAMIC_COLOR_4,    bgColor: TEXT_DYNAMIC_COLOR_5, shadowColor: TEXT_DYNAMIC_COLOR_6 },
  [B_WIN_SWITCH_PROMPT]: { fillValue: PIXEL_FILL(0xF), fontId: FONT_NORMAL, x: 0, y: 1, speed: 0, fgColor: TEXT_COLOR_WHITE,        bgColor: TEXT_DYNAMIC_COLOR_6, shadowColor: TEXT_COLOR_GREEN },
  [B_WIN_YESNO]:         { fillValue: PIXEL_FILL(0xF), fontId: FONT_NORMAL, x: 0, y: 1, speed: 0, fgColor: TEXT_COLOR_WHITE,        bgColor: TEXT_DYNAMIC_COLOR_6, shadowColor: TEXT_COLOR_GREEN },
};

/** 1:1 décomp `gBattleWindowTemplates[B_WIN_TYPE_NORMAL]` (battle_bg.c:596). */
export function getBattleWindowTemplates(): BattleWindowTemplate[] {
  // Ordre = B_WIN_* index (0..14). InitWindows attend un array ordonné.
  const out: BattleWindowTemplate[] = [];
  for (let i = 0; i <= B_WIN_LEVEL_UP_BANNER; i++) {
    out.push(sStandardBattleWindowTemplates[i] ?? { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 0, height: 0, paletteNum: 0, baseBlock: 0 });
  }
  return out;
}

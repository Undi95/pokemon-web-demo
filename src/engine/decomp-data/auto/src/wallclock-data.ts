// AUTO-GENERATED from src/wallclock.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/wallclock.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const sTaskId_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tMinuteHandAngle_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tHourHandAngle_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tHours_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tMinutes_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tMoveDir_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tPeriod_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tMoveSpeed_EXPR = "data[6]";
export const GFXTAG_WALL_CLOCK_HAND = 4096;
export const PALTAG_WALL_CLOCK_MALE = 4096;
export const PALTAG_WALL_CLOCK_FEMALE = 4097;
/** Raw expr: `data[1]` */
export const sAngle_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PERIOD_0 = {
  PERIOD_AM: 0,
  PERIOD_PM: 1,
} as const;
export const ENUM_MOVE_1 = {
  MOVE_NONE: 0,
  MOVE_BACKWARD: 1,
  MOVE_FORWARD: 2,
} as const;
export const ENUM_WIN_2 = {
  WIN_MSG: 0,
  WIN_BUTTON_LABEL: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 3, tilemapTop: 17, width: 24, height: 2, paletteNum: 14, baseBlock: 512 },
  { bg: 2, tilemapLeft: 24, tilemapTop: 16, width: 6, height: 2, paletteNum: 12, baseBlock: 560 },
] as const;
export const sWindowTemplate_ConfirmYesNo = { bg: 0, tilemapLeft: 24, tilemapTop: 9, width: 5, height: 4, paletteNum: 14, baseBlock: 572 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, priority: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 8, priority: 1 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 7, priority: 2 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_ClockHand = { y: "DISPLAY_HEIGHT", shape: "SPRITE_SHAPE(64x64)", size: "SPRITE_SIZE(64x64)", priority: 1 } as const;
export const sOam_PeriodIndicator = { y: "DISPLAY_HEIGHT", shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 3 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_MinuteHand = { tileTag: "GFXTAG_WALL_CLOCK_HAND", paletteTag: "PALTAG_WALL_CLOCK_MALE", oam: "&sOam_ClockHand", anims: "sAnims_MinuteHand", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_MinuteHand" } as const;
export const sSpriteTemplate_HourHand = { tileTag: "GFXTAG_WALL_CLOCK_HAND", paletteTag: "PALTAG_WALL_CLOCK_MALE", oam: "&sOam_ClockHand", anims: "sAnims_HourHand", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HourHand" } as const;
export const sSpriteTemplate_PM = { tileTag: "GFXTAG_WALL_CLOCK_HAND", paletteTag: "PALTAG_WALL_CLOCK_MALE", oam: "&sOam_PeriodIndicator", anims: "sAnims_PM", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PMIndicator" } as const;
export const sSpriteTemplate_AM = { tileTag: "GFXTAG_WALL_CLOCK_HAND", paletteTag: "PALTAG_WALL_CLOCK_MALE", oam: "&sOam_PeriodIndicator", anims: "sAnims_AM", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_AMIndicator" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalettes_Clock = [
  { data: "gWallClockMale_Pal", tag: "PALTAG_WALL_CLOCK_MALE" },
  { data: "gWallClockFemale_Pal", tag: "PALTAG_WALL_CLOCK_FEMALE" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sHand_Gfx': { path: 'graphics/wallclock/hand.png', ext: '.4bpp.lz', type: 'u32' },
  'sTextPrompt_Pal': { path: 'graphics/wallclock/text_prompt.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_WallClock', ret: "void", arity: 0, params: "void" },
  { name: 'Task_SetClock_WaitFadeIn', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SetClock_HandleInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SetClock_AskConfirm', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SetClock_HandleConfirmInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SetClock_Confirmed', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_SetClock_Exit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ViewClock_WaitFadeIn', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ViewClock_HandleInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ViewClock_FadeOut', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ViewClock_Exit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CalcNewMinHandAngle', ret: "u16", arity: 3, params: "u16 angle, u8 direction, u8 speed" },
  { name: 'AdvanceClock', ret: "bool32", arity: 2, params: "u8 taskId, u8 direction" },
  { name: 'UpdateClockPeriod', ret: "void", arity: 2, params: "u8 taskId, u8 direction" },
  { name: 'InitClockWithRtc', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SpriteCB_MinuteHand', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HourHand', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PMIndicator', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_AMIndicator', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'VBlankCB_WallClock', ret: "void", arity: 0, params: "void" },
  { name: 'LoadWallClockGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'WallClockInit', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_StartWallClock', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ViewWallClock', ret: "void", arity: 0, params: "void" },
  { name: 'CalcMinHandDelta', ret: "u8", arity: 1, params: "u16 speed" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_SetClock_AskConfirm',
  'Task_SetClock_Confirmed',
  'Task_SetClock_Exit',
  'Task_SetClock_HandleConfirmInput',
  'Task_SetClock_HandleInput',
  'Task_SetClock_WaitFadeIn',
  'Task_ViewClock_Exit',
  'Task_ViewClock_FadeOut',
  'Task_ViewClock_HandleInput',
  'Task_ViewClock_WaitFadeIn',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_StartWallClock',
  'CB2_ViewWallClock',
  'CB2_WallClock',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'clock.h',
  'decompress.h',
  'event_data.h',
  'gpu_regs.h',
  'graphics.h',
  'main.h',
  'menu.h',
  'palette.h',
  'rtc.h',
  'scanline_effect.h',
  'sound.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'trig.h',
  'wallclock.h',
  'window.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;

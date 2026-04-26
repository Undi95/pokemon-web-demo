// AUTO-GENERATED from src/main_menu.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/main_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr from .c (can't be evaluated): `(1 << 15)` */
export const OPTION_MENU_FLAG_EXPR = "(1 << 15)";
export const MENU_LEFT = 2;
export const MENU_TOP_WIN0 = 1;
export const MENU_TOP_WIN1 = 5;
export const MENU_TOP_WIN2 = 1;
export const MENU_TOP_WIN3 = 9;
export const MENU_TOP_WIN4 = 13;
export const MENU_TOP_WIN5 = 17;
export const MENU_TOP_WIN6 = 21;
export const MENU_WIDTH = 26;
export const MENU_HEIGHT_WIN0 = 2;
export const MENU_HEIGHT_WIN1 = 2;
export const MENU_HEIGHT_WIN2 = 6;
export const MENU_HEIGHT_WIN3 = 2;
export const MENU_HEIGHT_WIN4 = 2;
export const MENU_HEIGHT_WIN5 = 2;
export const MENU_HEIGHT_WIN6 = 2;
export const MENU_LEFT_ERROR = 2;
export const MENU_TOP_ERROR = 15;
export const MENU_WIDTH_ERROR = 26;
export const MENU_HEIGHT_ERROR = 4;
export const MENU_SHADOW_PADDING = 1;
/** Raw expr from .c (can't be evaluated): `WIN_RANGE(((MENU_LEFT - 1) * 8) + MENU_SHADOW_PADDING, (MENU_LEFT + MENU_WIDTH + 1) * 8 - MENU_SHADOW_PADDING)` */
export const MENU_WIN_HCOORDS_EXPR = "WIN_RANGE(((MENU_LEFT - 1) * 8) + MENU_SHADOW_PADDING, (MENU_LEFT + MENU_WIDTH + 1) * 8 - MENU_SHADOW_PADDING)";
/** Raw expr from .c (can't be evaluated): `WIN_RANGE(32, 32)` */
export const MENU_SCROLL_SHIFT_EXPR = "WIN_RANGE(32, 32)";
/** Raw expr from .c (can't be evaluated): `min(ARRAY_COUNT(sMalePresetNames), ARRAY_COUNT(sFemalePresetNames))` */
export const NUM_PRESET_NAMES_EXPR = "min(ARRAY_COUNT(sMalePresetNames), ARRAY_COUNT(sFemalePresetNames))";
export const MAIN_MENU_BORDER_TILE = 469;
export const BIRCH_DLG_BASE_TILE_NUM = 252;
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tMenuType_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tCurrItem_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[12]` */
export const tItemCount_EXPR = "data[12]";
/** Raw expr from .c (can't be evaluated): `data[13]` */
export const tScrollArrowTaskId_EXPR = "data[13]";
/** Raw expr from .c (can't be evaluated): `data[14]` */
export const tIsScrolled_EXPR = "data[14]";
/** Raw expr from .c (can't be evaluated): `data[15]` */
export const tWirelessAdapterConnected_EXPR = "data[15]";
/** Raw expr from .c (can't be evaluated): `data[15]` */
export const tArrowTaskIsScrolled_EXPR = "data[15]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tPlayerSpriteId_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tBG1HOFS_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[5]` */
export const tIsDoneFadingSprites_EXPR = "data[5]";
/** Raw expr from .c (can't be evaluated): `data[6]` */
export const tPlayerGender_EXPR = "data[6]";
/** Raw expr from .c (can't be evaluated): `data[7]` */
export const tTimer_EXPR = "data[7]";
/** Raw expr from .c (can't be evaluated): `data[8]` */
export const tBirchSpriteId_EXPR = "data[8]";
/** Raw expr from .c (can't be evaluated): `data[9]` */
export const tLotadSpriteId_EXPR = "data[9]";
/** Raw expr from .c (can't be evaluated): `data[10]` */
export const tBrendanSpriteId_EXPR = "data[10]";
/** Raw expr from .c (can't be evaluated): `data[11]` */
export const tMaySpriteId_EXPR = "data[11]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[0]` */
export const tMainTask_EXPR = "data[0]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tAlphaCoeff1_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tAlphaCoeff2_EXPR = "data[2]";
/** Raw expr from .c (can't be evaluated): `data[3]` */
export const tDelay_EXPR = "data[3]";
/** Raw expr from .c (can't be evaluated): `data[4]` */
export const tDelayTimer_EXPR = "data[4]";
/** Raw expr from .c (can't be evaluated): `data[1]` */
export const tPalIndex_EXPR = "data[1]";
/** Raw expr from .c (can't be evaluated): `data[2]` */
export const tDelayBefore_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_HAS_0 = {
  HAS_NO_SAVED_GAME: 0,
  HAS_SAVED_GAME: 1,
  HAS_MYSTERY_GIFT: 2,
  HAS_MYSTERY_EVENTS: 3,
} as const;
export const ENUM_ACTION_1 = {
  ACTION_NEW_GAME: 0,
  ACTION_CONTINUE: 1,
  ACTION_OPTION: 2,
  ACTION_MYSTERY_GIFT: 3,
  ACTION_MYSTERY_EVENTS: 4,
  ACTION_EREADER: 5,
  ACTION_INVALID: 6,
} as const;

// ─── WindowTemplates ─────────────────────────────────────────────────────────
export const sWindowTemplates_MainMenu = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 5, width: 26, height: 2, paletteNum: 15, baseBlock: 53 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 6, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 9, width: 26, height: 2, paletteNum: 15, baseBlock: 157 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 13, width: 26, height: 2, paletteNum: 15, baseBlock: 209 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 17, width: 26, height: 2, paletteNum: 15, baseBlock: 261 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 21, width: 26, height: 2, paletteNum: 15, baseBlock: 313 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 365 },
] as const;
export const sNewGameBirchSpeechTextWindows = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 5, width: 6, height: 4, paletteNum: 15, baseBlock: 109 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 2, width: 9, height: 10, paletteNum: 15, baseBlock: 133 },
] as const;

// ─── BgTemplates ─────────────────────────────────────────────────────────────
export const sMainMenuBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sBirchSpeechShadowGfx': { path: 'graphics/birch_speech/shadow.png', ext: '.4bpp.lz', type: 'u32' },
  'sBirchSpeechBgMap': { path: 'graphics/birch_speech/map.bin', ext: '.lz', type: 'u32' },
  'sBirchSpeechBgGradientPal': { path: 'graphics/birch_speech/bg2.pal', ext: '.gbapal', type: 'u16' },
  'sMainMenuBgPal': { path: 'graphics/interface/main_menu_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMainMenuTextPal': { path: 'graphics/interface/main_menu_text.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 via ×8) ──────────────────────────
export const sBirchSpeechPlatformBlackPal_COLORS = [{r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}] as const;

// ─── Text pointer arrays (gText_* string keys) ──────────────────────────────
export const sMalePresetNames = ['gText_DefaultNameStu', 'gText_DefaultNameMilton', 'gText_DefaultNameTom', 'gText_DefaultNameKenny', 'gText_DefaultNameReid', 'gText_DefaultNameJude', 'gText_DefaultNameJaxson', 'gText_DefaultNameEaston', 'gText_DefaultNameWalker', 'gText_DefaultNameTeru', 'gText_DefaultNameJohnny', 'gText_DefaultNameBrett', 'gText_DefaultNameSeth', 'gText_DefaultNameTerry', 'gText_DefaultNameCasey', 'gText_DefaultNameDarren', 'gText_DefaultNameLandon', 'gText_DefaultNameCollin', 'gText_DefaultNameStanley', 'gText_DefaultNameQuincy'] as const;
export const sFemalePresetNames = ['gText_DefaultNameKimmy', 'gText_DefaultNameTiara', 'gText_DefaultNameBella', 'gText_DefaultNameJayla', 'gText_DefaultNameAllie', 'gText_DefaultNameLianna', 'gText_DefaultNameSara', 'gText_DefaultNameMonica', 'gText_DefaultNameCamila', 'gText_DefaultNameAubree', 'gText_DefaultNameRuthie', 'gText_DefaultNameHazel', 'gText_DefaultNameNadine', 'gText_DefaultNameTanja', 'gText_DefaultNameYasmin', 'gText_DefaultNameNicola', 'gText_DefaultNameLillie', 'gText_DefaultNameTerra', 'gText_DefaultNameLucy', 'gText_DefaultNameHalie'] as const;

// ─── FillBgTilemapBufferRect calls (frame layout, top-level constants only) ─
export const FILL_BG_CALLS = [
  { bg: "bg", tile: 0, x: "x + 255", y: "y + 255", w: "width + 2", h: "height + 2", palNum: 2 },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  1", x: "x-2", y: "y-1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  3", x: "x-1", y: "y-1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  4", x: "x", y: "y-1", w: "width", h: 1, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  5", x: "x+width-1", y: "y-1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  6", x: "x+width", y: "y-1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  7", x: "x-2", y: "y", w: 1, h: 5, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM +  9", x: "x-1", y: "y", w: "width+1", h: 5, palNum: "palNum" },
  { bg: "bg", tile: "BIRCH_DLG_BASE_TILE_NUM + 10", x: "x+width", y: "y", w: 1, h: 5, palNum: "palNum" },
] as const;

// ─── BeginNormalPaletteFade calls ───────────────────────────────────────────
export const PALETTE_FADES = [
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_BG", delay: 0, startY: 0, endY: 16, color: "RGB_BLACK" },
  { palettes: "PALETTES_OBJECTS", delay: 0, startY: 0, endY: 16, color: "RGB_WHITEALPHA" },
  { palettes: "PALETTES_ALL", delay: 0, startY: 16, endY: 0, color: "RGB_BLACK" },
] as const;

// ─── Task_* functions (state machine steps) ─────────────────────────────────
// Function bodies require manual transcription; these names identify each step.
export const TASK_NAMES = [
  'Task_DisplayMainMenu',
  'Task_DisplayMainMenuInvalidActionError',
  'Task_HandleMainMenuAPressed',
  'Task_HandleMainMenuBPressed',
  'Task_HandleMainMenuInput',
  'Task_HighlightSelectedMainMenuItem',
  'Task_MainMenuCheckBattery',
  'Task_MainMenuCheckSaveFile',
  'Task_NewGameBirchSpeechSub_InitPokeBall',
  'Task_NewGameBirchSpeechSub_WaitForLotad',
  'Task_NewGameBirchSpeech_AndYouAre',
  'Task_NewGameBirchSpeech_AreYouReady',
  'Task_NewGameBirchSpeech_BoyOrGirl',
  'Task_NewGameBirchSpeech_ChooseGender',
  'Task_NewGameBirchSpeech_Cleanup',
  'Task_NewGameBirchSpeech_CreateNameYesNo',
  'Task_NewGameBirchSpeech_FadeInTarget1OutTarget2',
  'Task_NewGameBirchSpeech_FadeOutTarget1InTarget2',
  'Task_NewGameBirchSpeech_FadePlatformIn',
  'Task_NewGameBirchSpeech_FadePlatformOut',
  'Task_NewGameBirchSpeech_FadePlayerToWhite',
  'Task_NewGameBirchSpeech_Init',
  'Task_NewGameBirchSpeech_MainSpeech',
  'Task_NewGameBirchSpeech_ProcessNameYesNoMenu',
  'Task_NewGameBirchSpeech_ReshowBirchLotad',
  'Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox',
  'Task_NewGameBirchSpeech_ShrinkPlayer',
  'Task_NewGameBirchSpeech_SlideInNewGenderSprite',
  'Task_NewGameBirchSpeech_SlideOutOldGenderSprite',
  'Task_NewGameBirchSpeech_SlidePlatformAway',
  'Task_NewGameBirchSpeech_SlidePlatformAway2',
  'Task_NewGameBirchSpeech_SoItsPlayerName',
  'Task_NewGameBirchSpeech_StartBirchLotadPlatformFade',
  'Task_NewGameBirchSpeech_StartNamingScreen',
  'Task_NewGameBirchSpeech_StartPlayerFadeIn',
  'Task_NewGameBirchSpeech_ThisIsAPokemon',
  'Task_NewGameBirchSpeech_WaitForPlayerFadeIn',
  'Task_NewGameBirchSpeech_WaitForPlayerShrink',
  'Task_NewGameBirchSpeech_WaitForSpriteFadeInAndTextPrinter',
  'Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome',
  'Task_NewGameBirchSpeech_WaitForWhatsYourNameToPrint',
  'Task_NewGameBirchSpeech_WaitPressBeforeNameChoice',
  'Task_NewGameBirchSpeech_WaitToShowBirch',
  'Task_NewGameBirchSpeech_WaitToShowGenderMenu',
  'Task_NewGameBirchSpeech_WhatsYourName',
  'Task_WaitForBatteryDryErrorWindow',
  'Task_WaitForSaveFileErrorWindow',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitMainMenu',
  'CB2_MainMenu',
  'CB2_NewGameBirchSpeech_ReturnFromNamingScreen',
  'CB2_ReinitMainMenu',
] as const;

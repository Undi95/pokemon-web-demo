// AUTO-GENERATED from src/main_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/main_menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 15)` */
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
/** Raw expr: `WIN_RANGE(((MENU_LEFT - 1) * 8) + MENU_SHADOW_PADDING, (MENU_LEFT + MENU_WIDTH + 1) * 8 - MENU_SHADOW_PADDING)` */
export const MENU_WIN_HCOORDS_EXPR = "WIN_RANGE(((MENU_LEFT - 1) * 8) + MENU_SHADOW_PADDING, (MENU_LEFT + MENU_WIDTH + 1) * 8 - MENU_SHADOW_PADDING)";
/** Raw expr: `WIN_RANGE(32, 32)` */
export const MENU_SCROLL_SHIFT_EXPR = "WIN_RANGE(32, 32)";
/** Raw expr: `min(ARRAY_COUNT(sMalePresetNames), ARRAY_COUNT(sFemalePresetNames))` */
export const NUM_PRESET_NAMES_EXPR = "min(ARRAY_COUNT(sMalePresetNames), ARRAY_COUNT(sFemalePresetNames))";
export const MAIN_MENU_BORDER_TILE = 469;
export const BIRCH_DLG_BASE_TILE_NUM = 252;
/** Raw expr: `data[0]` */
export const tMenuType_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCurrItem_EXPR = "data[1]";
/** Raw expr: `data[12]` */
export const tItemCount_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tScrollArrowTaskId_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tIsScrolled_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tWirelessAdapterConnected_EXPR = "data[15]";
/** Raw expr: `data[15]` */
export const tArrowTaskIsScrolled_EXPR = "data[15]";
/** Raw expr: `data[2]` */
export const tPlayerSpriteId_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tBG1HOFS_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tIsDoneFadingSprites_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tPlayerGender_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tTimer_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tBirchSpriteId_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tLotadSpriteId_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tBrendanSpriteId_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tMaySpriteId_EXPR = "data[11]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tMainTask_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tAlphaCoeff1_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tAlphaCoeff2_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tDelay_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tDelayTimer_EXPR = "data[4]";
/** Raw expr: `data[1]` */
export const tPalIndex_EXPR = "data[1]";
/** Raw expr: `data[2]` */
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

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates_MainMenu = [
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN0", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN0", paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN1", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN1", paletteNum: 15, baseBlock: 53 },
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN2", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN2", paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN3", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN3", paletteNum: 15, baseBlock: 157 },
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN4", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN4", paletteNum: 15, baseBlock: 209 },
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN5", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN5", paletteNum: 15, baseBlock: 261 },
  { bg: 0, tilemapLeft: "MENU_LEFT", tilemapTop: "MENU_TOP_WIN6", width: "MENU_WIDTH", height: "MENU_HEIGHT_WIN6", paletteNum: 15, baseBlock: 313 },
  { bg: 0, tilemapLeft: "MENU_LEFT_ERROR", tilemapTop: "MENU_TOP_ERROR", width: "MENU_WIDTH_ERROR", height: "MENU_HEIGHT_ERROR", paletteNum: 15, baseBlock: 365 },
] as const;
export const sNewGameBirchSpeechTextWindows = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 5, width: 6, height: 4, paletteNum: 15, baseBlock: 109 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 2, width: 9, height: 10, paletteNum: 15, baseBlock: 133 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sMainMenuBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;
export const sBirchBgTemplate = { bg: 0, charBaseIndex: 3, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sBirchSpeechShadowGfx': { path: 'graphics/birch_speech/shadow.png', ext: '.4bpp.lz', type: 'u32' },
  'sBirchSpeechBgMap': { path: 'graphics/birch_speech/map.bin', ext: '.lz', type: 'u32' },
  'sBirchSpeechBgGradientPal': { path: 'graphics/birch_speech/bg2.pal', ext: '.gbapal', type: 'u16' },
  'sMainMenuBgPal': { path: 'graphics/interface/main_menu_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMainMenuTextPal': { path: 'graphics/interface/main_menu_text.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const sBirchSpeechPlatformBlackPal_COLORS = [{r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}, {r:0,g:0,b:0}] as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sMalePresetNames = ['gText_DefaultNameStu', 'gText_DefaultNameMilton', 'gText_DefaultNameTom', 'gText_DefaultNameKenny', 'gText_DefaultNameReid', 'gText_DefaultNameJude', 'gText_DefaultNameJaxson', 'gText_DefaultNameEaston', 'gText_DefaultNameWalker', 'gText_DefaultNameTeru', 'gText_DefaultNameJohnny', 'gText_DefaultNameBrett', 'gText_DefaultNameSeth', 'gText_DefaultNameTerry', 'gText_DefaultNameCasey', 'gText_DefaultNameDarren', 'gText_DefaultNameLandon', 'gText_DefaultNameCollin', 'gText_DefaultNameStanley', 'gText_DefaultNameQuincy'] as const;
export const sFemalePresetNames = ['gText_DefaultNameKimmy', 'gText_DefaultNameTiara', 'gText_DefaultNameBella', 'gText_DefaultNameJayla', 'gText_DefaultNameAllie', 'gText_DefaultNameLianna', 'gText_DefaultNameSara', 'gText_DefaultNameMonica', 'gText_DefaultNameCamila', 'gText_DefaultNameAubree', 'gText_DefaultNameRuthie', 'gText_DefaultNameHazel', 'gText_DefaultNameNadine', 'gText_DefaultNameTanja', 'gText_DefaultNameYasmin', 'gText_DefaultNameNicola', 'gText_DefaultNameLillie', 'gText_DefaultNameTerra', 'gText_DefaultNameLucy', 'gText_DefaultNameHalie'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sStartedPokeBallTask', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sCurrItemAndOptionMenuCheck', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitMainMenu', ret: "u32", arity: 1, params: "bool8" },
  { name: 'Task_MainMenuCheckSaveFile', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_MainMenuCheckBattery', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForSaveFileErrorWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateMainMenuErrorWindow', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'ClearMainMenuWindowTilemap', ret: "void", arity: 1, params: "const struct WindowTemplate *" },
  { name: 'Task_DisplayMainMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForBatteryDryErrorWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'MainMenu_FormatSavegameText', ret: "void", arity: 0, params: "void" },
  { name: 'HighlightSelectedMainMenuItem', ret: "void", arity: 3, params: "u8, u8, s16" },
  { name: 'Task_HandleMainMenuInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleMainMenuAPressed', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleMainMenuBPressed', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_Init', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DisplayMainMenuInvalidActionError', ret: "void", arity: 1, params: "u8" },
  { name: 'AddBirchSpeechObjects', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_WaitToShowBirch', ret: "void", arity: 1, params: "u8" },
  { name: 'NewGameBirchSpeech_StartFadeInTarget1OutTarget2', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'NewGameBirchSpeech_StartFadePlatformOut', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'Task_NewGameBirchSpeech_WaitForSpriteFadeInWelcome', ret: "void", arity: 1, params: "u8" },
  { name: 'NewGameBirchSpeech_ShowDialogueWindow', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'NewGameBirchSpeech_ClearWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_ThisIsAPokemon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_MainSpeech', ret: "void", arity: 1, params: "u8" },
  { name: 'NewGameBirchSpeech_WaitForThisIsPokemonText', ret: "void", arity: 2, params: "struct TextPrinterTemplate *, u16" },
  { name: 'Task_NewGameBirchSpeech_AndYouAre', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeechSub_WaitForLotad', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_StartBirchLotadPlatformFade', ret: "void", arity: 1, params: "u8" },
  { name: 'NewGameBirchSpeech_StartFadeOutTarget1InTarget2', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'NewGameBirchSpeech_StartFadePlatformIn', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'Task_NewGameBirchSpeech_SlidePlatformAway', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_StartPlayerFadeIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_WaitForPlayerFadeIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_BoyOrGirl', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadMainMenuWindowFrameTiles', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'DrawMainMenuWindowBorder', ret: "void", arity: 2, params: "const struct WindowTemplate *, u16" },
  { name: 'Task_HighlightSelectedMainMenuItem', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_WaitToShowGenderMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_ChooseGender', ret: "void", arity: 1, params: "u8" },
  { name: 'NewGameBirchSpeech_ShowGenderMenu', ret: "void", arity: 0, params: "void" },
  { name: 'NewGameBirchSpeech_ProcessGenderMenuInput', ret: "s8", arity: 0, params: "void" },
  { name: 'NewGameBirchSpeech_ClearGenderWindow', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'Task_NewGameBirchSpeech_WhatsYourName', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_SlideOutOldGenderSprite', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_SlideInNewGenderSprite', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_WaitForWhatsYourNameToPrint', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_WaitPressBeforeNameChoice', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_StartNamingScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_NewGameBirchSpeech_ReturnFromNamingScreen', ret: "void", arity: 0, params: "void" },
  { name: 'NewGameBirchSpeech_SetDefaultPlayerName', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_CreateNameYesNo', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_ProcessNameYesNoMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateYesNoMenuParameterized', ret: "void", arity: 6, params: "u8, u8, u16, u16, u8, u8" },
  { name: 'Task_NewGameBirchSpeech_SlidePlatformAway2', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_ReshowBirchLotad', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_WaitForSpriteFadeInAndTextPrinter', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_AreYouReady', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_ShrinkPlayer', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_MovePlayerDownWhileShrinking', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_NewGameBirchSpeech_WaitForPlayerShrink', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_FadePlayerToWhite', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NewGameBirchSpeech_Cleanup', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_Null', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_NewGameBirchSpeech_ReturnFromNamingScreenShowTextbox', ret: "void", arity: 1, params: "u8" },
  { name: 'MainMenu_FormatSavegamePlayer', ret: "void", arity: 0, params: "void" },
  { name: 'MainMenu_FormatSavegamePokedex', ret: "void", arity: 0, params: "void" },
  { name: 'MainMenu_FormatSavegameTime', ret: "void", arity: 0, params: "void" },
  { name: 'MainMenu_FormatSavegameBadges', ret: "void", arity: 0, params: "void" },
  { name: 'NewGameBirchSpeech_CreateDialogueWindowBorder', ret: "void", arity: 6, params: "u8, u8, u8, u8, u8, u8" },
  { name: 'CB2_MainMenu', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_MainMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitMainMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReinitMainMenu', ret: "void", arity: 0, params: "void" },
  { name: 'BeginNormalPaletteFade', ret: "else", arity: 5, params: "PALETTES_ALL, 0, 0x10, 0, RGB_WHITEALPHA" },
  { name: 'HandleMainMenuInput', ret: "bool8", arity: 1, params: "u8 taskId" },
  { name: 'Task_NewGameBirchSpeechSub_InitPokeBall', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_NewGameBirchSpeech_SoItsPlayerName', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'NewGameBirchSpeech_CreateLotadSprite', ret: "u8", arity: 2, params: "u8 x, u8 y" },
  { name: 'Task_NewGameBirchSpeech_FadeOutTarget1InTarget2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_NewGameBirchSpeech_FadeInTarget1OutTarget2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_NewGameBirchSpeech_FadePlatformIn', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_NewGameBirchSpeech_FadePlatformOut', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'NewGameBirchSpeech_ClearGenderWindowTilemap', ret: "void", arity: 6, params: "u8 bg, u8 x, u8 y, u8 width, u8 height, u8 unused" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
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

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'trainer_pokemon_sprites.h',
  'bg.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/trainers.h',
  'data.h',
  'decompress.h',
  'event_data.h',
  'field_effect.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'link.h',
  'main.h',
  'menu.h',
  'list_menu.h',
  'mystery_event_menu.h',
  'naming_screen.h',
  'option_menu.h',
  'overworld.h',
  'palette.h',
  'pokeball.h',
  'pokedex.h',
  'pokemon.h',
  'random.h',
  'rtc.h',
  'save.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'strings.h',
  'string_util.h',
  'task.h',
  'text.h',
  'text_window.h',
  'title_screen.h',
  'window.h',
  'mystery_gift_menu.h',
] as const;

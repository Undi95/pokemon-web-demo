/**
 * gba-global-scope.ts
 * -------------------
 * Expose les symboles critiques du runtime décomp sur `globalThis`
 * pour compatibilité avec les callbacks auto-générés qui les référencent
 * comme des variables globales (sans les importer).
 *
 * Ce fichier est importé UNE SEULE FOIS par GameScene.create() avant
 * de lancer les Tasks. Il ne doit PAS être importé par les modules
 * auto-générés pour éviter les cycles de dépendance.
 */
import * as _dg from './decomp-globals';
import * as _cb from './copyright-boot';
const dg = _dg as any;
const cb = _cb as any;

// Liste explicite des symboles à exposer (évite Object.assign qui traverse
// les bindings TDZ en cas de cycle de modules).
const symbolsToExpose: Record<string, unknown> = {
  // Window + BG system
  InitWindows: dg.InitWindows,
  AddWindow: dg.AddWindow,
  RemoveWindow: dg.RemoveWindow,
  FreeAllWindowBuffers: dg.FreeAllWindowBuffers,
  FillWindowPixelBuffer: dg.FillWindowPixelBuffer,
  CopyWindowToVram: dg.CopyWindowToVram,
  PutWindowTilemap: dg.PutWindowTilemap,
  ClearWindowTilemap: dg.ClearWindowTilemap,
  flushDirtyWindows: dg.flushDirtyWindows,
  BlitBitmapToWindow: dg.BlitBitmapToWindow,
  FillWindowPixelRect: dg.FillWindowPixelRect,
  InitBgsFromTemplates: dg.InitBgsFromTemplates,
  InitBgFromTemplate: dg.InitBgFromTemplate,
  ShowBg: dg.ShowBg,
  HideBg: dg.HideBg,
  ChangeBgY: dg.ChangeBgY,
  ChangeBgX: dg.ChangeBgX,
  ResetBgsAndClearDma3BusyFlags: dg.ResetBgsAndClearDma3BusyFlags,
  FillBgTilemapBufferRect_Palette0: dg.FillBgTilemapBufferRect_Palette0,
  LoadMainMenuWindowFrameTiles: dg.LoadMainMenuWindowFrameTiles,
  DrawMainMenuWindowBorder: dg.DrawMainMenuWindowBorder,
  LoadMessageBoxGfx: dg.LoadMessageBoxGfx,
  ClearMainMenuWindowTilemap: dg.ClearMainMenuWindowTilemap,
  ClearStdWindowAndFrame: dg.ClearStdWindowAndFrame,

  // Text system
  AddTextPrinterParameterized3: dg.AddTextPrinterParameterized3,
  AddTextPrinterForMessage: dg.AddTextPrinterForMessage,
  AddTextPrinterWithCallbackForMessage: dg.AddTextPrinterWithCallbackForMessage,
  RunTextPrinters: dg.RunTextPrinters,
  IsTextPrinterActive: dg.IsTextPrinterActive,
  RunTextPrintersAndIsPrinter0Active: dg.RunTextPrintersAndIsPrinter0Active,
  DeactivateAllTextPrinters: dg.DeactivateAllTextPrinters,
  StringExpandPlaceholders: dg.StringExpandPlaceholders,
  sTextColor_Headers: dg.sTextColor_Headers,

  // Menu system
  Menu_ProcessInputNoWrapClearOnChoose: dg.Menu_ProcessInputNoWrapClearOnChoose,
  Menu_GetCursorPos: dg.Menu_GetCursorPos,
  InitMenuInUpperLeftCornerNormal: dg.InitMenuInUpperLeftCornerNormal,
  CreateYesNoMenuParameterized: dg.CreateYesNoMenuParameterized,
  CreateYesNoMenu: dg.CreateYesNoMenu,
  HandleMainMenuInput: dg.HandleMainMenuInput,
  HighlightSelectedMainMenuItem: dg.HighlightSelectedMainMenuItem,
  MainMenu_FormatSavegameText: dg.MainMenu_FormatSavegameText,
  CreateMainMenuErrorWindow: dg.CreateMainMenuErrorWindow,
  NewGameBirchSpeech_ClearWindow: dg.NewGameBirchSpeech_ClearWindow,
  NewGameBirchSpeech_ShowDialogueWindow: dg.NewGameBirchSpeech_ShowDialogueWindow,
  NewGameBirchSpeech_ClearGenderWindow: dg.NewGameBirchSpeech_ClearGenderWindow,
  NewGameBirchSpeech_ShowGenderMenu: dg.NewGameBirchSpeech_ShowGenderMenu,
  NewGameBirchSpeech_ProcessGenderMenuInput: dg.NewGameBirchSpeech_ProcessGenderMenuInput,
  NewGameBirchSpeech_SetDefaultPlayerName: dg.NewGameBirchSpeech_SetDefaultPlayerName,
  NewGameBirchSpeech_CreateNameYesNo: dg.NewGameBirchSpeech_CreateNameYesNo,
  AddScrollIndicatorArrowPair: dg.AddScrollIndicatorArrowPair,
  RemoveScrollIndicatorArrowPair: dg.RemoveScrollIndicatorArrowPair,
  Task_ScrollIndicatorArrowPairOnMainMenu: dg.Task_ScrollIndicatorArrowPairOnMainMenu,

  // Save / misc stubs
  IsWirelessAdapterConnected: dg.IsWirelessAdapterConnected,
  IsMysteryGiftEnabled: dg.IsMysteryGiftEnabled,
  CanResetRTC: dg.CanResetRTC,
  RtcGetErrorStatus: dg.RtcGetErrorStatus,
  DoNamingScreen: dg.DoNamingScreen,
  FreeAndDestroyMonPicSprite: dg.FreeAndDestroyMonPicSprite,
  ResetAllPicSprites: dg.ResetAllPicSprites,
  PlayBGM: dg.PlayBGM,
  PlaySE: dg.PlaySE,
  FadeOutBGM: dg.FadeOutBGM,
  gSaveBlock1Ptr: dg.gSaveBlock1Ptr,
  gSaveBlock2Ptr: dg.gSaveBlock2Ptr,
  // gSaveFileStatus : volontairement OMIS du snapshot. gba-menu-system installe
  // un Object.defineProperty getter/setter sur globalThis qui reste live (=
  // SetSaveFileStatus modifie la `let gSaveFileStatus` interne, le getter
  // retourne la valeur courante). Si on la mettait ici, exposeGbaGlobals()
  // écraserait le getter par la valeur 0 figée au module-load → MainMenu lit
  // toujours SAVE_STATUS_EMPTY → pas de Continue après save.

  // Input
  JOY_NEW: dg.JOY_NEW,
  JOY_HELD: dg.JOY_HELD,

  // VRAM / palette / GPU helpers
  LZ77UnCompVram: dg.LZ77UnCompVram,
  LZDecompressVram: dg.LZDecompressVram,
  LoadPalette: dg.LoadPalette,
  LoadBgTiles: dg.LoadBgTiles,
  DmaFill16: dg.DmaFill16,
  DmaFill32: dg.DmaFill32,
  DmaClear16: dg.DmaClear16,
  DmaClearLarge16: dg.DmaClearLarge16,
  DmaClear32: dg.DmaClear32,
  CpuFill16: dg.CpuFill16,
  CpuFill32: dg.CpuFill32,
  CreateTask: (func: (task: { taskId: number; func: ((task: unknown) => void) | null; data: number[] }) => void, priority: number) => {
    // CreateTask est une méthode de DecompRuntime, pas une fonction exportée.
    // On expose un wrapper qui appelle le runtime courant.
    return dg.getRuntime().CreateTask(func, priority);
  },
  DestroyTask: (taskId: number) => dg.getRuntime().DestroyTask(taskId),
  SetGpuReg: (reg: number, value: number) => dg.getRuntime().SetGpuReg(reg, value),
  SetMainCallback2: (cb: unknown) => dg.getRuntime().SetMainCallback2(cb as any),
  SetVBlankCallback: (cb: (() => void) | null) => dg.getRuntime().SetVBlankCallback(cb),
  // Session 124 fix : `FieldClearVBlankHBlankCallbacks` est utilisé par
  // overworld-callbacks-auto.ts (= 11 callsites incl. CB2_ContinueSavedGame).
  // 1:1 décomp `overworld.c`: clear VBlank + HBlank callbacks. Notre engine
  // n'a pas vraiment de HBlank, donc on stub HBlank et clear VBlank only.
  FieldClearVBlankHBlankCallbacks: () => {
    dg.getRuntime().SetVBlankCallback(null);
    // SetHBlankCallback : pas implémenté côté engine, no-op safe.
  },
  // SetHBlankCallback : aussi stubbed pour 1:1 compat décomp.
  SetHBlankCallback: (_cb: (() => void) | null) => { /* no-op stub */ },
  BeginNormalPaletteFade: (palettes: string, delay: number, startY: number, endY: number, color: string) =>
    dg.getRuntime().BeginNormalPaletteFade(palettes, delay, startY, endY, color),
  UpdatePaletteFade: dg.UpdatePaletteFade,
  ResetPaletteFade: dg.ResetPaletteFade,
  ResetTasks: dg.ResetTasks,
  ResetSpriteData: () => dg.getRuntime().ResetSpriteData(),
  FreeAllSpritePalettes: dg.FreeAllSpritePalettes,
  ScanlineEffect_Stop: dg.ScanlineEffect_Stop,
  EnableInterrupts: dg.EnableInterrupts,

  // Sprite helpers
  InitSpriteAffineAnim: (spriteId: number, animNum: number) => dg.getRuntime().StartSpriteAffineAnim(spriteId, animNum),
  StartSpriteAffineAnim: (spriteId: number, animNum: number) => dg.getRuntime().StartSpriteAffineAnim(spriteId, animNum),
  CreateSpriteAtOam: (cfg: unknown) => dg.getRuntime().CreateSpriteAtOam(cfg as any),
  CreateSpriteFromTemplate: (name: string, x: number, y: number) => dg.getRuntime().CreateSpriteFromTemplate(name, x, y),
  setSpriteInvisible: (id: number, inv: boolean) => dg.getRuntime().setSpriteInvisible(id, inv),
  setSpriteCallback: (id: number, cb: unknown) => dg.getRuntime().setSpriteCallback(id, cb as any),
  DestroySprite: (id: number) => dg.getRuntime().DestroySprite(id),
  LoadCompressedSpriteSheet: dg.LoadCompressedSpriteSheet,
  LoadSpritePalettes: dg.LoadSpritePalettes,

  // Constants / tables
  BG_SCREEN_SIZE: dg.BG_SCREEN_SIZE,
  PALETTES_ALL: dg.PALETTES_ALL,
  PALETTES_OBJECTS: dg.PALETTES_OBJECTS,
  BG_PLTT_ID: dg.BG_PLTT_ID,
  OBJ_PLTT_ID: dg.OBJ_PLTT_ID,
  BG_PLTT_ID_FADED: dg.BG_PLTT_ID_FADED,
  OBJ_PLTT_ID_FADED: dg.OBJ_PLTT_ID_FADED,
  BG_CHAR_ADDR: dg.BG_CHAR_ADDR,
  BG_SCREEN_ADDR: dg.BG_SCREEN_ADDR,
  BG_VRAM: dg.BG_VRAM,
  PLTT_SIZEOF: dg.PLTT_SIZEOF,
  PLTT_SIZE_4BPP: dg.PLTT_SIZE_4BPP,
  PLTT_SIZE_8BPP: dg.PLTT_SIZE_8BPP,
  BG_TILE_H_FLIP: dg.BG_TILE_H_FLIP,
  BG_TILE_V_FLIP: dg.BG_TILE_V_FLIP,
  DISPLAY_WIDTH: dg.DISPLAY_WIDTH,
  DISPLAY_HEIGHT: dg.DISPLAY_HEIGHT,
  BLDALPHA_BLEND: dg.BLDALPHA_BLEND,
  WIN_RANGE: dg.WIN_RANGE,
  GET_TRUE_SPRITE_INDEX: dg.GET_TRUE_SPRITE_INDEX,
  ANIM_SPRITES_START: dg.ANIM_SPRITES_START,

  // REG_OFFSET_*
  REG_OFFSET_DISPCNT: dg.REG_OFFSET_DISPCNT,
  REG_OFFSET_BG0CNT: dg.REG_OFFSET_BG0CNT,
  REG_OFFSET_BG1CNT: dg.REG_OFFSET_BG1CNT,
  REG_OFFSET_BG2CNT: dg.REG_OFFSET_BG2CNT,
  REG_OFFSET_BG3CNT: dg.REG_OFFSET_BG3CNT,
  REG_OFFSET_BG0HOFS: dg.REG_OFFSET_BG0HOFS,
  REG_OFFSET_BG0VOFS: dg.REG_OFFSET_BG0VOFS,
  REG_OFFSET_BG1HOFS: dg.REG_OFFSET_BG1HOFS,
  REG_OFFSET_BG1VOFS: dg.REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS: dg.REG_OFFSET_BG2HOFS,
  REG_OFFSET_BG2VOFS: dg.REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS: dg.REG_OFFSET_BG3HOFS,
  REG_OFFSET_BG3VOFS: dg.REG_OFFSET_BG3VOFS,
  REG_OFFSET_WIN0H: dg.REG_OFFSET_WIN0H,
  REG_OFFSET_WIN1H: dg.REG_OFFSET_WIN1H,
  REG_OFFSET_WIN0V: dg.REG_OFFSET_WIN0V,
  REG_OFFSET_WIN1V: dg.REG_OFFSET_WIN1V,
  REG_OFFSET_WININ: dg.REG_OFFSET_WININ,
  REG_OFFSET_WINOUT: dg.REG_OFFSET_WINOUT,
  REG_OFFSET_BLDCNT: dg.REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDALPHA: dg.REG_OFFSET_BLDALPHA,
  REG_OFFSET_BLDY: dg.REG_OFFSET_BLDY,
  REG_OFFSET_BG2X_L: dg.REG_OFFSET_BG2X_L,
  REG_OFFSET_BG2X_H: dg.REG_OFFSET_BG2X_H,
  REG_OFFSET_BG2Y_L: dg.REG_OFFSET_BG2Y_L,
  REG_OFFSET_BG2Y_H: dg.REG_OFFSET_BG2Y_H,

  // BGCNT / DISPCNT / BLDCNT bits
  BGCNT_PRIORITY: dg.BGCNT_PRIORITY,
  BGCNT_CHARBASE: dg.BGCNT_CHARBASE,
  BGCNT_SCREENBASE: dg.BGCNT_SCREENBASE,
  BGCNT_16COLOR: dg.BGCNT_16COLOR,
  BGCNT_256COLOR: dg.BGCNT_256COLOR,
  BGCNT_TXT256x256: dg.BGCNT_TXT256x256,
  BGCNT_TXT512x256: dg.BGCNT_TXT512x256,
  BGCNT_TXT256x512: dg.BGCNT_TXT256x512,
  BGCNT_TXT512x512: dg.BGCNT_TXT512x512,
  BGCNT_AFF128x128: dg.BGCNT_AFF128x128,
  BGCNT_AFF256x256: dg.BGCNT_AFF256x256,
  BGCNT_AFF512x512: dg.BGCNT_AFF512x512,
  BGCNT_AFF1024x1024: dg.BGCNT_AFF1024x1024,
  DISPCNT_MODE_0: dg.DISPCNT_MODE_0,
  DISPCNT_MODE_1: dg.DISPCNT_MODE_1,
  DISPCNT_MODE_2: dg.DISPCNT_MODE_2,
  DISPCNT_OBJ_1D_MAP: dg.DISPCNT_OBJ_1D_MAP,
  DISPCNT_BG0_ON: dg.DISPCNT_BG0_ON,
  DISPCNT_BG1_ON: dg.DISPCNT_BG1_ON,
  DISPCNT_BG2_ON: dg.DISPCNT_BG2_ON,
  DISPCNT_BG3_ON: dg.DISPCNT_BG3_ON,
  DISPCNT_OBJ_ON: dg.DISPCNT_OBJ_ON,
  DISPCNT_WIN0_ON: dg.DISPCNT_WIN0_ON,
  DISPCNT_BG_ALL_ON: dg.DISPCNT_BG_ALL_ON,
  BLDCNT_TGT1_BG0: dg.BLDCNT_TGT1_BG0,
  BLDCNT_TGT1_BG1: dg.BLDCNT_TGT1_BG1,
  BLDCNT_TGT1_BG2: dg.BLDCNT_TGT1_BG2,
  BLDCNT_TGT1_BG3: dg.BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ: dg.BLDCNT_TGT1_OBJ,
  BLDCNT_TGT1_BD: dg.BLDCNT_TGT1_BD,
  BLDCNT_EFFECT_NONE: dg.BLDCNT_EFFECT_NONE,
  BLDCNT_EFFECT_BLEND: dg.BLDCNT_EFFECT_BLEND,
  BLDCNT_EFFECT_LIGHTEN: dg.BLDCNT_EFFECT_LIGHTEN,
  BLDCNT_EFFECT_DARKEN: dg.BLDCNT_EFFECT_DARKEN,
  BLDCNT_TGT2_BG0: dg.BLDCNT_TGT2_BG0,
  BLDCNT_TGT2_BG1: dg.BLDCNT_TGT2_BG1,
  BLDCNT_TGT2_BG2: dg.BLDCNT_TGT2_BG2,
  BLDCNT_TGT2_BG3: dg.BLDCNT_TGT2_BG3,
  BLDCNT_TGT2_OBJ: dg.BLDCNT_TGT2_OBJ,
  BLDCNT_TGT2_BD: dg.BLDCNT_TGT2_BD,

  // Windows bits
  WININ_WIN0_BG_ALL: dg.WININ_WIN0_BG_ALL,
  WININ_WIN0_OBJ: dg.WININ_WIN0_OBJ,
  WININ_WIN1_BG_ALL: dg.WININ_WIN1_BG_ALL,
  WININ_WIN1_OBJ: dg.WININ_WIN1_OBJ,
  WINOUT_WIN01_BG_ALL: dg.WINOUT_WIN01_BG_ALL,
  WINOUT_WIN01_OBJ: dg.WINOUT_WIN01_OBJ,
  WINOUT_WIN01_CLR: dg.WINOUT_WIN01_CLR,
  WINOUT_WINOBJ_ALL: dg.WINOUT_WINOBJ_ALL,
  INTR_FLAG_VBLANK: dg.INTR_FLAG_VBLANK,

  // Memory addresses
  VRAM: dg.VRAM,
  OAM: dg.OAM,
  PLTT: dg.PLTT,
  OAM_SIZE: dg.OAM_SIZE,
  VRAM_SIZE: dg.VRAM_SIZE,
  PLTT_SIZE: dg.PLTT_SIZE,

  // Audio
  m4aSongNumStart: dg.m4aSongNumStart,
  m4aMPlayAllStop: dg.m4aMPlayAllStop,
  MUS_INTRO: dg.MUS_INTRO,
  MUS_INTRO_BATTLE: dg.MUS_INTRO_BATTLE,

  // Title screen helpers
  gTitleScreenAlphaBlend: dg.gTitleScreenAlphaBlend,
  UpdateLegendaryMarkingColor: dg.UpdateLegendaryMarkingColor,
  gMPlayInfo_BGM: dg.gMPlayInfo_BGM,
  gBattle_BG1_X: dg.gBattle_BG1_X,
  gBattle_BG1_Y: dg.gBattle_BG1_Y,

  // Runtime accessors
  getRuntime: dg.getRuntime,
  setGlobalRuntime: dg.setGlobalRuntime,
  gMain: dg.gMain,
  gPlttBufferUnfaded: dg.gPlttBufferUnfaded,
  gPlttBufferFaded: dg.gPlttBufferFaded,
  INTRO3_RAW_PTR: dg.INTRO3_RAW_PTR,

  // Gender
  MALE: dg.MALE,
  FEMALE: dg.FEMALE,

  // Copyright boot helpers
  SetUpCopyrightScreen: cb.SetUpCopyrightScreen,
  MainCB2_Intro: cb.MainCB2_Intro,
  CB2_InitCopyrightScreenAfterBootup: cb.CB2_InitCopyrightScreenAfterBootup,

  // Intro helpers
  LoadIntroPart2Graphics: dg.LoadIntroPart2Graphics,
  CreateIntroBrendanSprite: dg.CreateIntroBrendanSprite,
  CreateIntroMaySprite: dg.CreateIntroMaySprite,
  CreateIntroFlygonSprite: dg.CreateIntroFlygonSprite,
  CreateBicycleBgAnimationTask: dg.CreateBicycleBgAnimationTask,
  SetIntroPart2BgCnt: dg.SetIntroPart2BgCnt,
  CycleSceneryPalette: dg.CycleSceneryPalette,
  ScanlineEffect_InitWave: dg.ScanlineEffect_InitWave,
  StartPokemonLogoShine: dg.StartPokemonLogoShine,
  PanFadeAndZoomScreen: dg.PanFadeAndZoomScreen,
  SAFE_DIV: dg.SAFE_DIV,

  // Intro data symbols (self-referencing strings)
  sIntro1Bg_Gfx: dg.sIntro1Bg_Gfx,
  sIntro1Bg_Pal: dg.sIntro1Bg_Pal,
  sIntro1Bg0_Tilemap: dg.sIntro1Bg0_Tilemap,
  sIntro1Bg1_Tilemap: dg.sIntro1Bg1_Tilemap,
  sIntro1Bg2_Tilemap: dg.sIntro1Bg2_Tilemap,
  sIntro1Bg3_Tilemap: dg.sIntro1Bg3_Tilemap,
  sIntroDropsLogo_Gfx: dg.sIntroDropsLogo_Gfx,
  sIntroDrops_Pal: dg.sIntroDrops_Pal,
  sIntroLogo_Pal: dg.sIntroLogo_Pal,
  sIntroFlygonSilhouette_Pal: dg.sIntroFlygonSilhouette_Pal,
  gIntroSparkle_Gfx: dg.gIntroSparkle_Gfx,
  gIntroFlygonSilhouette_Gfx: dg.gIntroFlygonSilhouette_Gfx,
  gIntroGameFreakTextFade_Pal: dg.gIntroGameFreakTextFade_Pal,
  sGrass_Gfx: dg.sGrass_Gfx,
  sGrass_Tilemap: dg.sGrass_Tilemap,
  sGrass_Pal: dg.sGrass_Pal,
  sTrees_Gfx: dg.sTrees_Gfx,
  sTrees_Tilemap: dg.sTrees_Tilemap,
  sTrees_Pal: dg.sTrees_Pal,
  sCloudsBg_Gfx: dg.sCloudsBg_Gfx,
  sCloudsBg_Tilemap: dg.sCloudsBg_Tilemap,
  sCloudsBg_Pal: dg.sCloudsBg_Pal,
  sClouds_Pal: dg.sClouds_Pal,
  sHouses_Gfx: dg.sHouses_Gfx,
  sHouses_Tilemap: dg.sHouses_Tilemap,
  sHouses_Pal: dg.sHouses_Pal,
  gIntroBrendan_Gfx: dg.gIntroBrendan_Gfx,
  gIntroMay_Gfx: dg.gIntroMay_Gfx,
  gIntroBicycle_Gfx: dg.gIntroBicycle_Gfx,
  gIntroFlygon_Gfx: dg.gIntroFlygon_Gfx,
  gIntroVolbeat_Gfx: dg.gIntroVolbeat_Gfx,
  gIntroTorchic_Gfx: dg.gIntroTorchic_Gfx,
  gIntroManectric_Gfx: dg.gIntroManectric_Gfx,
  gIntroVolbeat_Pal: dg.gIntroVolbeat_Pal,
  gIntroTorchic_Pal: dg.gIntroTorchic_Pal,
  gIntroManectric_Pal: dg.gIntroManectric_Pal,
  sIntroPokeball_Pal: dg.sIntroPokeball_Pal,
  sIntroPokeball_Tilemap: dg.sIntroPokeball_Tilemap,
  sIntroPokeball_Gfx: dg.sIntroPokeball_Gfx,
  sIntroStreaks_Pal: dg.sIntroStreaks_Pal,
  sIntroStreaks_Gfx: dg.sIntroStreaks_Gfx,
  sIntroStreaks_Tilemap: dg.sIntroStreaks_Tilemap,
  sIntroRayquzaOrb_Pal: dg.sIntroRayquzaOrb_Pal,
  sIntroMisc_Pal: dg.sIntroMisc_Pal,
  sIntroMisc_Gfx: dg.sIntroMisc_Gfx,
  sIntroLati_Gfx: dg.sIntroLati_Gfx,
  gIntroLightning_Gfx: dg.gIntroLightning_Gfx,
  gIntroLightning_Pal: dg.gIntroLightning_Pal,
  gIntroBubbles_Gfx: dg.gIntroBubbles_Gfx,
  gIntroBubbles_Pal: dg.gIntroBubbles_Pal,

  // Title screen symbols
  gTitleScreenPokemonLogoGfx: dg.gTitleScreenPokemonLogoGfx,
  gTitleScreenPokemonLogoTilemap: dg.gTitleScreenPokemonLogoTilemap,
  gTitleScreenBgPalettes: dg.gTitleScreenBgPalettes,
  sTitleScreenRayquazaGfx: dg.sTitleScreenRayquazaGfx,
  sTitleScreenRayquazaTilemap: dg.sTitleScreenRayquazaTilemap,
  sTitleScreenCloudsGfx: dg.sTitleScreenCloudsGfx,
  gTitleScreenCloudsTilemap: dg.gTitleScreenCloudsTilemap,
  gTitleScreenEmeraldVersionPal: dg.gTitleScreenEmeraldVersionPal,
  sSpritePalette_PressStart: dg.sSpritePalette_PressStart,

  // Main menu data symbols
  sMainMenuBgTemplates: dg.sMainMenuBgTemplates,
  sWindowTemplates_MainMenu: dg.sWindowTemplates_MainMenu,
  sNewGameBirchSpeechTextWindows: dg.sNewGameBirchSpeechTextWindows,
  MAIN_MENU_BORDER_TILE: dg.MAIN_MENU_BORDER_TILE,
  BIRCH_DLG_BASE_TILE_NUM: dg.BIRCH_DLG_BASE_TILE_NUM,

  // Main menu global vars
  sCurrItemAndOptionMenuCheck: dg.sCurrItemAndOptionMenuCheck,
  sBirchSpeechMainTaskId: dg.sBirchSpeechMainTaskId,
  sStartedPokeBallTask: dg.sStartedPokeBallTask,
  sScrollArrowsTemplate_MainMenu: dg.sScrollArrowsTemplate_MainMenu,
  sSpriteAffineAnimTable_PlayerShrink: dg.sSpriteAffineAnimTable_PlayerShrink,
  sBirchBgTemplate: dg.sBirchBgTemplate,
  sBirchSpeechBgMap: dg.sBirchSpeechBgMap,
  sBirchSpeechBgPals: dg.sBirchSpeechBgPals,
  sBirchSpeechPlatformBlackPal: dg.sBirchSpeechPlatformBlackPal,
  sBirchSpeechBgGradientPal: dg.sBirchSpeechBgGradientPal,

  // gText_* strings
  gText_MainMenuNewGame: dg.gText_MainMenuNewGame,
  gText_MainMenuContinue: dg.gText_MainMenuContinue,
  gText_MainMenuOption: dg.gText_MainMenuOption,
  gText_MainMenuMysteryGift: dg.gText_MainMenuMysteryGift,
  gText_MainMenuMysteryGift2: dg.gText_MainMenuMysteryGift2,
  gText_MainMenuMysteryEvents: dg.gText_MainMenuMysteryEvents,
  gText_SaveFileErased: dg.gText_SaveFileErased,
  gText_SaveFileCorrupted: dg.gText_SaveFileCorrupted,
  gText_BatteryRunDry: dg.gText_BatteryRunDry,
  gText_WirelessNotConnected: dg.gText_WirelessNotConnected,
  gText_MysteryGiftCantUse: dg.gText_MysteryGiftCantUse,
  gText_MysteryEventsCantUse: dg.gText_MysteryEventsCantUse,
  gText_Birch_Welcome: dg.gText_Birch_Welcome,
  gText_ThisIsAPokemon: dg.gText_ThisIsAPokemon,
  gText_Birch_MainSpeech: dg.gText_Birch_MainSpeech,
  gText_Birch_AndYouAre: dg.gText_Birch_AndYouAre,
  gText_Birch_BoyOrGirl: dg.gText_Birch_BoyOrGirl,
  gText_Birch_WhatsYourName: dg.gText_Birch_WhatsYourName,
  gText_Birch_SoItsPlayer: dg.gText_Birch_SoItsPlayer,
  gText_Birch_YourePlayer: dg.gText_Birch_YourePlayer,
  gText_Birch_AreYouReady: dg.gText_Birch_AreYouReady,

  // C-style boolean / null literals (= référencés `as-is` par les bodies
  // auto-transpilés depuis le décomp). Le transpiler ne les substitue pas
  // — on les expose comme globals pour matcher la sémantique C.
  TRUE: 1,
  FALSE: 0,
  NULL: null,

  // GBA bit constants utilisés par les CB2 auto-transpilés (= valeurs 1:1
  // décomp `include/gba/io_reg.h`).
  WININ_WIN0_BG0: 0x1,
  WININ_WIN0_BG1: 0x2,
  WININ_WIN0_BG2: 0x4,
  WININ_WIN0_BG3: 0x8,
  WINOUT_WIN01_BG0: 0x1,
  WINOUT_WIN01_BG1: 0x2,
  WINOUT_WIN01_BG2: 0x4,
  WINOUT_WIN01_BG3: 0x8,
  // BG / window helpers
  BG_COORD_SET: 0,
  BG_COORD_ADD: 1,
  COPYWIN_FULL: 3,
  COPYWIN_GFX: 1,
  COPYWIN_MAP: 2,
  // ARRAY_COUNT(arr) → arr.length (TS-side macro for C `sizeof(arr)/sizeof(arr[0])`).
  ARRAY_COUNT: <T>(arr: ArrayLike<T>): number => arr?.length ?? 0,
  // RGB color sentinels 1:1 décomp `include/gba/types.h` :
  RGB_BLACK: 0,
  RGB_WHITE: 0x7FFF,
  RGB_RED: 0x001F,
  RGB_GREEN: 0x03E0,
  RGB_BLUE: 0x7C00,
  // Stubs pour CB2_ReturnToFieldWithOpenMenu (= return path après option menu).
  // Ces helpers décomp lifecycle/wireless n'ont pas d'équivalent côté web —
  // safe stubs (= no-op ou FALSE) pour éviter les ReferenceError.
  UsedPokemonCenterWarp: (): number => 0,  // FALSE = pas warpé via Pokemon Center.
  CloseLink: (): void => { /* no-op : pas de wireless link en web */ },
  gWirelessCommType: 0,                    // 0 = pas de wireless.
  // Interrupt flag bits 1:1 décomp `include/gba/io_reg.h` :
  INTR_FLAG_VCOUNT: 1 << 1,
  INTR_FLAG_TIMER0: 1 << 2,
  INTR_FLAG_TIMER1: 1 << 3,
  INTR_FLAG_TIMER2: 1 << 4,
  INTR_FLAG_TIMER3: 1 << 5,
  INTR_FLAG_SERIAL: 1 << 6,
  INTR_FLAG_HBLANK: 1 << 1,
  // REG_IE/REG_IME stubs — les writes sont no-op côté web (= pas de hardware
  // interrupt mask). Notre runtime simule VBlank via setTimeout.
  REG_IME: 1,
  REG_IE: 0,
  DisableInterrupts: (_flags: number): void => { /* no-op web stub */ },
  // EWRAM_DATA function pointers (= 1:1 décomp `void (*X)(void) = NULL`).
  // Mutables : stored directly on globalThis so writes in auto-files persist.
  gFieldCallback: null,
  gFieldCallback2: null,

  // Memory access stubs émis par le transpiler pour les patterns C de
  // pointer arithmetic (ex: `*(ptr + idx) op= rhs;`) qui ne peuvent pas se
  // traduire 1:1 en JS. Ces helpers no-op runtime → si un de ces appels est
  // exécuté, le code ne crash pas mais l'effet est perdu (= acceptable car
  // le code en question n'est pas dans le critical path web).
  MEM_WRITE: (_addr: unknown, _value: unknown): void => {
    // No-op stub. Real impl would write `_value` to `_addr` (memory ptr).
  },
  MEM_OP_ASSIGN: (_addr: unknown, _op: string, _rhs: unknown): void => {
    // No-op stub. Real impl would do `*addr op= rhs`.
  },
  MEM_PRE_DEC: (_expr: unknown): number => 0,  // Lossy stub — returns 0.
  MEM_PRE_INC: (_expr: unknown): number => 0,
};

export function exposeGbaGlobals(): void {
  for (const [key, value] of Object.entries(symbolsToExpose)) {
    (globalThis as Record<string, unknown>)[key] = value;
  }
}

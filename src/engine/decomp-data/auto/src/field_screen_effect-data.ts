// AUTO-GENERATED from src/field_screen_effect.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_screen_effect.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tFlashCenterX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tFlashCenterY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCurFlashRadius_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tDestFlashRadius_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tFlashRadiusDelta_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tClearScanlineEffect_EXPR = "data[6]";
/** Raw expr: `data[1]` */
export const tBlueOrb_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCenterX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCenterY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tShakeDelay_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tShakeDir_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tDispCnt_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tBldCnt_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tBldAlpha_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tWinIn_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tWinOut_EXPR = "data[10]";

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sFlashLevelToRadius: readonly number[] = [200,72,64,56,48,40,32,24,0] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_ExitNonAnimDoor', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ExitNonDoor', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DoContestHallWarp', ret: "void", arity: 1, params: "u8" },
  { name: 'FillPalBufferWhite', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ExitDoor', ret: "void", arity: 1, params: "u8" },
  { name: 'WaitForWeatherFadeIn', ret: "bool32", arity: 0, params: "void" },
  { name: 'Task_SpinEnterWarp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WarpAndLoadMap', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoDoorWarp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EnableScriptAfterMusicFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FillPalBufferBlack', ret: "void", arity: 0, params: "void" },
  { name: 'WarpFadeInScreen', ret: "void", arity: 0, params: "void" },
  { name: 'FadeInFromWhite', ret: "void", arity: 0, params: "void" },
  { name: 'FadeInFromBlack', ret: "void", arity: 0, params: "void" },
  { name: 'WarpFadeOutScreen', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerVisibility', ret: "void", arity: 1, params: "bool8 visible" },
  { name: 'Task_WaitForUnionRoomFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_ContinueScriptUnionRoom', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WaitForFadeAndEnableScriptCtx', ret: "void", arity: 1, params: "u8 taskID" },
  { name: 'FieldCB_ContinueScriptHandleMusic', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ContinueScript', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ReturnToFieldCableLink', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_ReturnToFieldCableLink', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ReturnToFieldWirelessLink', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReturnToFieldRecordMixing', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_ReturnToFieldWirelessLink', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpWarpExitTask', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_DefaultWarpExit', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_WarpExitFadeFromWhite', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_WarpExitFadeFromBlack', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_SpinEnterWarp', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_MossdeepGymWarpExit', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WaitForFadeShowStartMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnToFieldOpenStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ReturnToFieldOpenStartMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_ReturnToFieldNoScript', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_ReturnToFieldNoScript', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ReturnToFieldNoScriptCheckMusic', ret: "void", arity: 0, params: "void" },
  { name: 'PaletteFadeActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'DoWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoDiveWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoWhiteFadeWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoDoorWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoFallWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoEscalatorWarp', ret: "void", arity: 1, params: "u8 metatileBehavior" },
  { name: 'DoLavaridgeGymB1FWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoLavaridgeGym1FWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoTeleportTileWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoMossdeepGymWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoPortholeWarp', ret: "void", arity: 0, params: "void" },
  { name: 'Task_DoCableClubWarp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoCableClubWarp', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ReturnToWorldFromLinkRoom', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ReturnFromLinkRoom', ret: "void", arity: 0, params: "void" },
  { name: 'DoContestHallWarp', ret: "void", arity: 0, params: "void" },
  { name: 'SetFlashScanlineEffectWindowBoundary', ret: "void", arity: 4, params: "u16 *dest, u32 y, s32 left, s32 right" },
  { name: 'SetFlashScanlineEffectWindowBoundaries', ret: "void", arity: 4, params: "u16 *dest, s32 centerX, s32 centerY, s32 radius" },
  { name: 'SetOrbFlashScanlineEffectWindowBoundary', ret: "void", arity: 4, params: "u16 *dest, u32 y, s32 left, s32 right" },
  { name: 'SetOrbFlashScanlineEffectWindowBoundaries', ret: "void", arity: 4, params: "u16 *dest, s32 centerX, s32 centerY, s32 radius" },
  { name: 'UpdateFlashLevelEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'UpdateOrbFlashEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitForFlashUpdate', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StartWaitForFlashUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'StartUpdateFlashLevelEffect', ret: "u8", arity: 6, params: "s32 centerX, s32 centerY, s32 initialFlashRadius, s32 destFlashRadius, s32 clearScanlineEffect, u8 delta" },
  { name: 'StartUpdateOrbFlashEffect', ret: "u8", arity: 6, params: "s32 centerX, s32 centerY, s32 initialFlashRadius, s32 destFlashRadius, s32 clearScanlineEffect, u8 delta" },
  { name: 'AnimateFlash', ret: "void", arity: 1, params: "u8 newFlashLevel" },
  { name: 'WriteFlashScanlineEffectBuffer', ret: "void", arity: 1, params: "u8 flashLevel" },
  { name: 'WriteBattlePyramidViewScanlineEffectBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'Task_SpinExitWarp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoSpinEnterWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoSpinExitWarp', ret: "void", arity: 0, params: "void" },
  { name: 'LoadOrbEffectPalette', ret: "void", arity: 1, params: "bool8 blueOrb" },
  { name: 'UpdateOrbEffectBlend', ret: "bool8", arity: 1, params: "u16 shakeDir" },
  { name: 'Task_OrbEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoOrbEffect', ret: "void", arity: 0, params: "void" },
  { name: 'FadeOutOrbEffect', ret: "void", arity: 0, params: "void" },
  { name: 'Script_FadeOutMapMusic', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoCableClubWarp',
  'Task_DoContestHallWarp',
  'Task_DoDoorWarp',
  'Task_EnableScriptAfterMusicFade',
  'Task_ExitDoor',
  'Task_ExitNonAnimDoor',
  'Task_ExitNonDoor',
  'Task_OrbEffect',
  'Task_ReturnToFieldCableLink',
  'Task_ReturnToFieldNoScript',
  'Task_ReturnToFieldRecordMixing',
  'Task_ReturnToFieldWirelessLink',
  'Task_ReturnToWorldFromLinkRoom',
  'Task_SpinEnterWarp',
  'Task_SpinExitWarp',
  'Task_WaitForFadeAndEnableScriptCtx',
  'Task_WaitForFadeShowStartMenu',
  'Task_WaitForFlashUpdate',
  'Task_WaitForUnionRoomFade',
  'Task_WarpAndLoadMap',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'cable_club.h',
  'event_data.h',
  'fieldmap.h',
  'field_camera.h',
  'field_door.h',
  'field_effect.h',
  'event_object_lock.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_special_scene.h',
  'field_weather.h',
  'gpu_regs.h',
  'io_reg.h',
  'link.h',
  'link_rfu.h',
  'load_save.h',
  'main.h',
  'menu.h',
  'mirage_tower.h',
  'metatile_behavior.h',
  'palette.h',
  'overworld.h',
  'scanline_effect.h',
  'script.h',
  'sound.h',
  'start_menu.h',
  'task.h',
  'text.h',
  'constants/event_object_movement.h',
  'constants/event_objects.h',
  'constants/songs.h',
  'constants/rgb.h',
  'trainer_hill.h',
  'fldeff.h',
] as const;

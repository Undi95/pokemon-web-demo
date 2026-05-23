// AUTO-GENERATED from include/field_screen_effect.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_screen_effect.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'WarpFadeInScreen', ret: "void", arity: 0, params: "void" },
  { name: 'WarpFadeOutScreen', ret: "void", arity: 0, params: "void" },
  { name: 'FadeInFromBlack', ret: "void", arity: 0, params: "void" },
  { name: 'FadeInFromWhite', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ContinueScriptUnionRoom', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ContinueScriptHandleMusic', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ContinueScript', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ReturnToFieldRecordMixing', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCB_ReturnToFieldCableLink', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ReturnToFieldWirelessLink', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_DefaultWarpExit', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_WarpExitFadeFromBlack', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_WarpExitFadeFromWhite', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ReturnToFieldOpenStartMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'ReturnToFieldOpenStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ReturnToFieldNoScript', ret: "void", arity: 0, params: "void" },
  { name: 'FieldCB_ReturnToFieldNoScriptCheckMusic', ret: "void", arity: 0, params: "void" },
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
  { name: 'DoCableClubWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoContestHallWarp', ret: "void", arity: 0, params: "void" },
  { name: 'AnimateFlash', ret: "void", arity: 1, params: "u8 newFlashLevel" },
  { name: 'WriteBattlePyramidViewScanlineEffectBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'DoSpinEnterWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoSpinExitWarp', ret: "void", arity: 0, params: "void" },
  { name: 'DoOrbEffect', ret: "void", arity: 0, params: "void" },
  { name: 'FadeOutOrbEffect', ret: "void", arity: 0, params: "void" },
  { name: 'WriteFlashScanlineEffectBuffer', ret: "void", arity: 1, params: "u8 flashLevel" },
  { name: 'IsPlayerStandingStill', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ReturnToFieldRecordMixing',
] as const;

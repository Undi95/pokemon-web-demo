// AUTO-GENERATED from src/main.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/main.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `((int)(sizeof(gIntrTableTemplate)/sizeof(IntrFunc)))` */
export const INTR_COUNT_EXPR = "((int)(sizeof(gIntrTableTemplate)/sizeof(IntrFunc)))";
/** Raw expr: `(B_BUTTON | START_BUTTON | SELECT_BUTTON)` */
export const B_START_SELECT_EXPR = "(B_BUTTON | START_BUTTON | SELECT_BUTTON)";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u16", name: 'gKeyRepeatStartDelay', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "bool8", name: 'gLinkTransferringData', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "struct Main", name: 'gMain', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gKeyRepeatContinueDelay', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "bool8", name: 'gSoftResetDisabled', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "IntrFunc", name: 'gIntrTable', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gLinkVSyncDisabled', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'IntrMain_Buffer', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "s8", name: 'gPcmDmaCounter', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sTrainerId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'VBlankIntr', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankIntr', ret: "void", arity: 0, params: "void" },
  { name: 'VCountIntr', ret: "void", arity: 0, params: "void" },
  { name: 'SerialIntr', ret: "void", arity: 0, params: "void" },
  { name: 'IntrDummy', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateLinkAndCallCallbacks', ret: "void", arity: 0, params: "void" },
  { name: 'InitMainCallbacks', ret: "void", arity: 0, params: "void" },
  { name: 'CallCallbacks', ret: "void", arity: 0, params: "void" },
  { name: 'SeedRngWithRtc', ret: "void", arity: 0, params: "void" },
  { name: 'ReadKeys', ret: "void", arity: 0, params: "void" },
  { name: 'InitIntrHandlers', ret: "void", arity: 0, params: "void" },
  { name: 'WaitForVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'EnableVCountIntrAtLine150', ret: "void", arity: 0, params: "void" },
  { name: 'AgbMain', ret: "void", arity: 0, params: "void" },
  { name: 'SetMainCallback2', ret: "void", arity: 1, params: "MainCallback callback" },
  { name: 'StartTimer1', ret: "void", arity: 0, params: "void" },
  { name: 'SeedRngAndSetTrainerId', ret: "void", arity: 0, params: "void" },
  { name: 'GetGeneratedTrainerIdLower', ret: "u16", arity: 0, params: "void" },
  { name: 'InitKeys', ret: "void", arity: 0, params: "void" },
  { name: 'SetVBlankCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'SetHBlankCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'SetVCountCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'RestoreSerialTimer3IntrHandlers', ret: "void", arity: 0, params: "void" },
  { name: 'SetSerialCallback', ret: "void", arity: 1, params: "IntrCallback callback" },
  { name: 'InitFlashTimer', ret: "void", arity: 0, params: "void" },
  { name: 'SetTrainerHillVBlankCounter', ret: "void", arity: 1, params: "u32 *counter" },
  { name: 'ClearTrainerHillVBlankCounter', ret: "void", arity: 0, params: "void" },
  { name: 'DoSoftReset', ret: "void", arity: 0, params: "void" },
  { name: 'ClearPokemonCrySongs', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'crt0.h',
  'malloc.h',
  'link.h',
  'link_rfu.h',
  'librfu.h',
  'm4a.h',
  'bg.h',
  'rtc.h',
  'scanline_effect.h',
  'overworld.h',
  'play_time.h',
  'random.h',
  'dma3.h',
  'gba/flash_internal.h',
  'load_save.h',
  'gpu_regs.h',
  'agb_flash.h',
  'sound.h',
  'battle.h',
  'battle_controllers.h',
  'text.h',
  'intro.h',
  'main.h',
  'trainer_hill.h',
  'constants/rgb.h',
] as const;

// AUTO-GENERATED from include/save.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/save.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SECTOR_DATA_SIZE = 3968;
export const SECTOR_FOOTER_SIZE = 128;
/** Raw expr: `(SECTOR_DATA_SIZE + SECTOR_FOOTER_SIZE)` */
export const SECTOR_SIZE_EXPR = "(SECTOR_DATA_SIZE + SECTOR_FOOTER_SIZE)";
export const NUM_SAVE_SLOTS = 2;
export const SECTOR_SIGNATURE = 134291493;
export const SPECIAL_SECTOR_SENTINEL = 45981;
export const SECTOR_ID_SAVEBLOCK2 = 0;
export const SECTOR_ID_SAVEBLOCK1_START = 1;
export const SECTOR_ID_SAVEBLOCK1_END = 4;
export const SECTOR_ID_PKMN_STORAGE_START = 5;
export const SECTOR_ID_PKMN_STORAGE_END = 13;
export const NUM_SECTORS_PER_SLOT = 14;
export const SECTOR_ID_HOF_1 = 28;
export const SECTOR_ID_HOF_2 = 29;
export const SECTOR_ID_TRAINER_HILL = 30;
export const SECTOR_ID_RECORDED_BATTLE = 31;
export const SECTORS_COUNT = 32;
export const NUM_HOF_SECTORS = 2;
export const SAVE_STATUS_EMPTY = 0;
export const SAVE_STATUS_OK = 1;
export const SAVE_STATUS_CORRUPT = 2;
export const SAVE_STATUS_NO_FLASH = 4;
export const SAVE_STATUS_ERROR = 255;
export const FULL_SAVE_SLOT = 65535;
/** Raw expr: `offsetof(struct SaveSector, signature)` */
export const SECTOR_SIGNATURE_OFFSET_EXPR = "offsetof(struct SaveSector, signature)";
/** Raw expr: `offsetof(struct SaveSector, counter)` */
export const SECTOR_COUNTER_OFFSET_EXPR = "offsetof(struct SaveSector, counter)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_ENABLE_0 = {
  ENABLE: 0,
  DISABLE: 1,
  CHECK: 2,
} as const;
export const ENUM_SAVE_1 = {
  SAVE_NORMAL: 0,
  SAVE_LINK: 1,
  SAVE_EREADER: 2,
  SAVE_HALL_OF_FAME: 3,
  SAVE_OVERWRITE_DIFFERENT_FILE: 4,
  SAVE_HALL_OF_FAME_ERASE_BEFORE: 5,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearSaveData', ret: "void", arity: 0, params: "void" },
  { name: 'Save_ResetSaveCounters', ret: "void", arity: 0, params: "void" },
  { name: 'HandleSavingData', ret: "u8", arity: 1, params: "u8 saveType" },
  { name: 'TrySavingData', ret: "u8", arity: 1, params: "u8 saveType" },
  { name: 'LinkFullSave_Init', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkFullSave_WriteSector', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkFullSave_ReplaceLastSector', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkFullSave_SetLastSectorSignature', ret: "bool8", arity: 0, params: "void" },
  { name: 'WriteSaveBlock2', ret: "bool8", arity: 0, params: "void" },
  { name: 'WriteSaveBlock1Sector', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadGameSave', ret: "u8", arity: 1, params: "u8 saveType" },
  { name: 'GetSaveBlocksPointersBaseOffset', ret: "u16", arity: 0, params: "void" },
  { name: 'TryReadSpecialSaveSector', ret: "u32", arity: 2, params: "u8 sector, u8 *dst" },
  { name: 'TryWriteSpecialSaveSector', ret: "u32", arity: 2, params: "u8 sector, u8 *src" },
  { name: 'Task_LinkFullSave', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoSaveFailedScreen', ret: "void", arity: 1, params: "u8 saveType" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_LinkFullSave',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'main.h',
] as const;

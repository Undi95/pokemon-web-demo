// AUTO-GENERATED from src/load_save.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/load_save.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SAVEBLOCK_MOVE_RANGE = 128;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct SaveBlock2ASLR", name: 'gSaveblock2', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct SaveBlock1ASLR", name: 'gSaveblock1', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct PokemonStorageASLR", name: 'gPokemonStorage', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct LoadedSaveData", name: 'gLoadedSaveData', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'gLastEncryptionKey', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "bool32", name: 'gFlashMemoryPresent', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ApplyNewEncryptionKeyToAllEncryptedData', ret: "void", arity: 1, params: "u32 encryptionKey" },
  { name: 'CheckForFlashMemory', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSav2', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSav1', ret: "void", arity: 0, params: "void" },
  { name: 'SetSaveBlocksPointers', ret: "void", arity: 1, params: "u16 offset" },
  { name: 'MoveSaveBlocks_ResetHeap', ret: "void", arity: 0, params: "void" },
  { name: 'UseContinueGameWarp', ret: "u32", arity: 0, params: "void" },
  { name: 'ClearContinueGameWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'SetContinueGameWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'SetContinueGameWarpStatusToDynamicWarp', ret: "void", arity: 0, params: "void" },
  { name: 'ClearContinueGameWarpStatus2', ret: "void", arity: 0, params: "void" },
  { name: 'SavePlayerParty', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPlayerParty', ret: "void", arity: 0, params: "void" },
  { name: 'SaveObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'LoadObjectEvents', ret: "void", arity: 0, params: "void" },
  { name: 'CopyPartyAndObjectsToSave', ret: "void", arity: 0, params: "void" },
  { name: 'CopyPartyAndObjectsFromSave', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPlayerBag', ret: "void", arity: 0, params: "void" },
  { name: 'SavePlayerBag', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyNewEncryptionKeyToHword', ret: "void", arity: 2, params: "u16 *hWord, u32 newKey" },
  { name: 'ApplyNewEncryptionKeyToWord', ret: "void", arity: 2, params: "u32 *word, u32 newKey" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'berry_powder.h',
  'item.h',
  'load_save.h',
  'main.h',
  'overworld.h',
  'pokemon.h',
  'pokemon_storage_system.h',
  'random.h',
  'save_location.h',
  'trainer_hill.h',
  'gba/flash_internal.h',
  'decoration_inventory.h',
  'agb_flash.h',
] as const;

// AUTO-GENERATED from include/load_save.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/load_save.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SAVEBLOCK_MOVE_RANGE = 128;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
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
  'pokemon_storage_system.h',
] as const;

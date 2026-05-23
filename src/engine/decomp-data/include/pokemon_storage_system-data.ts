// AUTO-GENERATED from include/pokemon_storage_system.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokemon_storage_system.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TOTAL_BOXES_COUNT = 14;
export const IN_BOX_ROWS = 5;
export const IN_BOX_COLUMNS = 6;
/** Raw expr: `(IN_BOX_ROWS * IN_BOX_COLUMNS)` */
export const IN_BOX_COUNT_EXPR = "(IN_BOX_ROWS * IN_BOX_COLUMNS)";
export const BOX_NAME_LENGTH = 8;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DrawTextWindowAndBufferTiles', ret: "void", arity: 5, params: "const u8 *string, void *dst, u8 zero1, u8 zero2, s32 bytesToBuffer" },
  { name: 'CountMonsInBox', ret: "u8", arity: 1, params: "u8 boxId" },
  { name: 'GetFirstFreeBoxSpot', ret: "s16", arity: 1, params: "u8 boxId" },
  { name: 'CountPartyAliveNonEggMonsExcept', ret: "u8", arity: 1, params: "u8 slotToIgnore" },
  { name: 'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot', ret: "u16", arity: 0, params: "void" },
  { name: 'CountPartyMons', ret: "u8", arity: 0, params: "void" },
  { name: 'ShowPokemonStorageSystemPC', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPokemonStorageSystem', ret: "void", arity: 0, params: "void" },
  { name: 'CompactPartySlots', ret: "s16", arity: 0, params: "void" },
  { name: 'StorageGetCurrentBox', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBoxMonDataAt', ret: "u32", arity: 3, params: "u8 boxId, u8 boxPosition, s32 request" },
  { name: 'SetBoxMonDataAt', ret: "void", arity: 4, params: "u8 boxId, u8 boxPosition, s32 request, const void *value" },
  { name: 'GetCurrentBoxMonData', ret: "u32", arity: 2, params: "u8 boxPosition, s32 request" },
  { name: 'SetCurrentBoxMonData', ret: "void", arity: 3, params: "u8 boxPosition, s32 request, const void *value" },
  { name: 'GetBoxMonNickAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, u8 *dst" },
  { name: 'GetBoxMonLevelAt', ret: "u32", arity: 2, params: "u8 boxId, u8 boxPosition" },
  { name: 'SetBoxMonNickAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, const u8 *nick" },
  { name: 'GetAndCopyBoxMonDataAt', ret: "u32", arity: 4, params: "u8 boxId, u8 boxPosition, s32 request, void *dst" },
  { name: 'SetBoxMonAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, struct BoxPokemon *src" },
  { name: 'CopyBoxMonAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, struct BoxPokemon *dst" },
  { name: 'CreateBoxMonAt', ret: "void", arity: 9, params: "u8 boxId, u8 boxPosition, u16 species, u8 level, u8 fixedIV, u8 hasFixedPersonality, u32 personality, u8 otIDType, u32 otID" },
  { name: 'ZeroBoxMonAt', ret: "void", arity: 2, params: "u8 boxId, u8 boxPosition" },
  { name: 'BoxMonAtToMon', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, struct Pokemon *dst" },
  { name: 'AdvanceStorageMonIndex', ret: "s16", arity: 4, params: "struct BoxPokemon *boxMons, u8 currIndex, u8 maxIndex, u8 mode" },
  { name: 'CheckFreePokemonStorageSpace', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckBoxMonSanityAt', ret: "bool32", arity: 2, params: "u32 boxId, u32 boxPosition" },
  { name: 'CountStorageNonEggMons', ret: "u32", arity: 0, params: "void" },
  { name: 'CountAllStorageMons', ret: "u32", arity: 0, params: "void" },
  { name: 'AnyStorageMonWithMove', ret: "bool32", arity: 1, params: "u16 move" },
  { name: 'ResetWaldaWallpaper', ret: "void", arity: 0, params: "void" },
  { name: 'SetWaldaWallpaperLockedOrUnlocked', ret: "void", arity: 1, params: "bool32 unlocked" },
  { name: 'IsWaldaWallpaperUnlocked', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetWaldaWallpaperPatternId', ret: "u32", arity: 0, params: "void" },
  { name: 'SetWaldaWallpaperPatternId', ret: "void", arity: 1, params: "u8 id" },
  { name: 'GetWaldaWallpaperIconId', ret: "u32", arity: 0, params: "void" },
  { name: 'SetWaldaWallpaperIconId', ret: "void", arity: 1, params: "u8 id" },
  { name: 'SetWaldaWallpaperColors', ret: "void", arity: 2, params: "u16 color1, u16 color2" },
  { name: 'SetWaldaPhrase', ret: "void", arity: 1, params: "const u8 *src" },
  { name: 'IsWaldaPhraseEmpty', ret: "bool32", arity: 0, params: "void" },
] as const;

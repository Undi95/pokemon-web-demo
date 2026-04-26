// AUTO-GENERATED from include/secret_base.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/secret_base.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HideSecretBaseDecorationSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CopyCurSecretBaseOwnerName_StrVar1', ret: "void", arity: 0, params: "void" },
  { name: 'ClearJapaneseSecretBases', ret: "void", arity: 1, params: "struct SecretBase *bases" },
  { name: 'SetPlayerSecretBaseParty', ret: "void", arity: 0, params: "void" },
  { name: 'SetOccupiedSecretBaseEntranceMetatiles', ret: "void", arity: 1, params: "struct MapEvents const *events" },
  { name: 'InitSecretBaseAppearance', ret: "void", arity: 1, params: "bool8 hidePC" },
  { name: 'CurMapIsSecretBase', ret: "bool8", arity: 0, params: "void" },
  { name: 'SecretBasePerStepCallback', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TrySetCurSecretBase', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsPosterDecor', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsFurnitureBottom', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsFurnitureMiddle', ret: "void", arity: 0, params: "void" },
  { name: 'CheckInteractedWithFriendsFurnitureTop', ret: "void", arity: 0, params: "void" },
  { name: 'WarpIntoSecretBase', ret: "void", arity: 2, params: "const struct MapPosition *position, const struct MapEvents *events" },
  { name: 'SecretBaseMapPopupEnabled', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckLeftFriendsSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSecretBases', ret: "void", arity: 0, params: "void" },
  { name: 'SetCurSecretBaseIdFromPosition', ret: "void", arity: 2, params: "const struct MapPosition *position, const struct MapEvents *events" },
  { name: 'TrySetCurSecretBaseIndex', ret: "void", arity: 0, params: "void" },
  { name: 'CheckPlayerHasSecretBase', ret: "void", arity: 0, params: "void" },
  { name: 'ToggleSecretBaseEntranceMetatile', ret: "void", arity: 0, params: "void" },
  { name: 'ScriptContext_Enable', ret: "void", arity: 0, params: "void" },
  { name: 'ReceiveSecretBasesData', ret: "void", arity: 3, params: "void *records, size_t recordSize, u8 linkIdx" },
] as const;

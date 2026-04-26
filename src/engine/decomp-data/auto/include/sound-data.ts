// AUTO-GENERATED from include/sound.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/sound.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'MapMusicMain', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentMapMusic', ret: "u16", arity: 0, params: "void" },
  { name: 'PlayNewMapMusic', ret: "void", arity: 1, params: "u16 songNum" },
  { name: 'StopMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'FadeOutMapMusic', ret: "void", arity: 1, params: "u8 speed" },
  { name: 'FadeOutAndPlayNewMapMusic', ret: "void", arity: 2, params: "u16 songNum, u8 speed" },
  { name: 'FadeOutAndFadeInNewMapMusic', ret: "void", arity: 3, params: "u16 songNum, u8 fadeOutSpeed, u8 fadeInSpeed" },
  { name: 'IsNotWaitingForBGMStop', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayFanfareByFanfareNum', ret: "void", arity: 1, params: "u8 fanfareNum" },
  { name: 'WaitFanfare', ret: "bool8", arity: 1, params: "bool8 stop" },
  { name: 'StopFanfareByFanfareNum', ret: "void", arity: 1, params: "u8 fanfareNum" },
  { name: 'PlayFanfare', ret: "void", arity: 1, params: "u16 songNum" },
  { name: 'IsFanfareTaskInactive', ret: "bool8", arity: 0, params: "void" },
  { name: 'FadeInNewBGM', ret: "void", arity: 2, params: "u16 songNum, u8 speed" },
  { name: 'FadeOutBGMTemporarily', ret: "void", arity: 1, params: "u8 speed" },
  { name: 'IsBGMPausedOrStopped', ret: "bool8", arity: 0, params: "void" },
  { name: 'FadeInBGM', ret: "void", arity: 1, params: "u8 speed" },
  { name: 'FadeOutBGM', ret: "void", arity: 1, params: "u8 speed" },
  { name: 'IsBGMStopped', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayCry_Normal', ret: "void", arity: 2, params: "u16 species, s8 pan" },
  { name: 'PlayCry_NormalNoDucking', ret: "void", arity: 4, params: "u16 species, s8 pan, s8 volume, u8 priority" },
  { name: 'PlayCry_ByMode', ret: "void", arity: 3, params: "u16 species, s8 pan, u8 mode" },
  { name: 'PlayCry_ReleaseDouble', ret: "void", arity: 3, params: "u16 species, s8 pan, u8 mode" },
  { name: 'PlayCry_Script', ret: "void", arity: 2, params: "u16 species, u8 mode" },
  { name: 'PlayCry_DuckNoRestore', ret: "void", arity: 3, params: "u16 species, s8 pan, u8 mode" },
  { name: 'PlayCryInternal', ret: "void", arity: 5, params: "u16 species, s8 pan, s8 volume, u8 priority, u8 mode" },
  { name: 'IsCryFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'StopCryAndClearCrySongs', ret: "void", arity: 0, params: "void" },
  { name: 'StopCry', ret: "void", arity: 0, params: "void" },
  { name: 'IsCryPlayingOrClearCrySongs', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsCryPlaying', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayBGM', ret: "void", arity: 1, params: "u16 songNum" },
  { name: 'PlaySE', ret: "void", arity: 1, params: "u16 songNum" },
  { name: 'PlaySE12WithPanning', ret: "void", arity: 2, params: "u16 songNum, s8 pan" },
  { name: 'PlaySE1WithPanning', ret: "void", arity: 2, params: "u16 songNum, s8 pan" },
  { name: 'PlaySE2WithPanning', ret: "void", arity: 2, params: "u16 songNum, s8 pan" },
  { name: 'SE12PanpotControl', ret: "void", arity: 1, params: "s8 pan" },
  { name: 'IsSEPlaying', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsBGMPlaying', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsSpecialSEPlaying', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/sound.h',
] as const;

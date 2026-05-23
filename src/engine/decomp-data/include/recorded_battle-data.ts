// AUTO-GENERATED from include/recorded_battle.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/recorded_battle.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const B_RECORD_MODE_RECORDING = 1;
export const B_RECORD_MODE_PLAYBACK = 2;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RecordedBattle_Init', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'RecordedBattle_SetTrainerInfo', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_SetBattlerAction', ret: "void", arity: 2, params: "u8 battler, u8 action" },
  { name: 'RecordedBattle_ClearBattlerAction', ret: "void", arity: 2, params: "u8 battler, u8 bytesToClear" },
  { name: 'RecordedBattle_GetBattlerAction', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'RecordedBattle_BufferNewBattlerData', ret: "u8", arity: 1, params: "u8 *dst" },
  { name: 'RecordedBattle_RecordAllBattlerData', ret: "void", arity: 1, params: "u8 *src" },
  { name: 'CanCopyRecordedBattleSaveData', ret: "bool32", arity: 0, params: "void" },
  { name: 'MoveRecordedBattleToSaveData', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetRecordedBattleFrontierFacility', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleFronterBrainSymbol', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_SaveParties', ret: "void", arity: 0, params: "void" },
  { name: 'GetActiveBattlerLinkPlayerGender', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_ClearFrontierPassFlag', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_SetFrontierPassFlagFromHword', ret: "void", arity: 1, params: "u16 flags" },
  { name: 'RecordedBattle_GetFrontierPassFlag', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBattleSceneInRecordedBattle', ret: "u8", arity: 0, params: "void" },
  { name: 'GetTextSpeedInRecordedBattle', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_CopyBattlerMoves', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_CheckMovesetChanges', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'GetAiScriptsInRecordedBattle', ret: "u32", arity: 0, params: "void" },
  { name: 'RecordedBattle_SetPlaybackFinished', ret: "void", arity: 0, params: "void" },
  { name: 'RecordedBattle_CanStopPlayback', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleRecordMixFriendName', ret: "void", arity: 1, params: "u8 *dst" },
  { name: 'GetRecordedBattleRecordMixFriendClass', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleApprenticeId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleRecordMixFriendLanguage', ret: "u8", arity: 0, params: "void" },
  { name: 'GetRecordedBattleApprenticeLanguage', ret: "u8", arity: 0, params: "void" },
  { name: 'RecordedBattle_SaveBattleOutcome', ret: "void", arity: 0, params: "void" },
] as const;

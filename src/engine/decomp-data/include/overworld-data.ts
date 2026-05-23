// AUTO-GENERATED from include/overworld.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/overworld.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const LINK_KEY_CODE_NULL = 0;
export const LINK_KEY_CODE_EMPTY = 17;
export const LINK_KEY_CODE_DPAD_DOWN = 18;
export const LINK_KEY_CODE_DPAD_UP = 19;
export const LINK_KEY_CODE_DPAD_LEFT = 20;
export const LINK_KEY_CODE_DPAD_RIGHT = 21;
export const LINK_KEY_CODE_READY = 22;
export const LINK_KEY_CODE_EXIT_ROOM = 23;
export const LINK_KEY_CODE_START_BUTTON = 24;
export const LINK_KEY_CODE_A_BUTTON = 25;
export const LINK_KEY_CODE_IDLE = 26;
export const LINK_KEY_CODE_HANDLE_RECV_QUEUE = 27;
export const LINK_KEY_CODE_HANDLE_SEND_QUEUE = 28;
export const LINK_KEY_CODE_EXIT_SEAT = 29;
export const LINK_KEY_CODE_UNK_8 = 30;
export const MOVEMENT_MODE_FREE = 0;
export const MOVEMENT_MODE_FROZEN = 1;
export const MOVEMENT_MODE_SCRIPTED = 2;
export const SKIP_OBJECT_EVENT_LOAD = 1;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DoWhiteOut', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_ResetStateAfterFly', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_ResetStateAfterTeleport', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_ResetStateAfterDigEscRope', ret: "void", arity: 0, params: "void" },
  { name: 'ResetGameStats', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementGameStat', ret: "void", arity: 1, params: "u8 index" },
  { name: 'GetGameStat', ret: "u32", arity: 1, params: "u8 index" },
  { name: 'SetGameStat', ret: "void", arity: 2, params: "u8 index, u32 value" },
  { name: 'ApplyNewEncryptionKeyToGameStats', ret: "void", arity: 1, params: "u32 newKey" },
  { name: 'LoadObjEventTemplatesFromHeader', ret: "void", arity: 0, params: "void" },
  { name: 'LoadSaveblockObjEventScripts', ret: "void", arity: 0, params: "void" },
  { name: 'SetObjEventTemplateCoords', ret: "void", arity: 3, params: "u8 localId, s16 x, s16 y" },
  { name: 'SetObjEventTemplateMovementType', ret: "void", arity: 2, params: "u8 localId, u8 movementType" },
  { name: 'ApplyCurrentWarp', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_GetMapHeaderByGroupAndId', ret: "const", arity: 2, params: "u16 mapGroup, u16 mapNum" },
  { name: 'GetDestinationWarpMapHeader', ret: "const", arity: 0, params: "void" },
  { name: 'WarpIntoMap', ret: "void", arity: 0, params: "void" },
  { name: 'SetWarpDestination', ret: "void", arity: 5, params: "s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y" },
  { name: 'SetWarpDestinationToMapWarp', ret: "void", arity: 3, params: "s8 mapGroup, s8 mapNum, s8 warpId" },
  { name: 'SetDynamicWarp', ret: "void", arity: 4, params: "s32 unused, s8 mapGroup, s8 mapNum, s8 warpId" },
  { name: 'SetDynamicWarpWithCoords', ret: "void", arity: 6, params: "s32 unused, s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y" },
  { name: 'SetWarpDestinationToDynamicWarp', ret: "void", arity: 1, params: "u8 unusedWarpId" },
  { name: 'SetWarpDestinationToHealLocation', ret: "void", arity: 1, params: "u8 healLocationId" },
  { name: 'SetWarpDestinationToLastHealLocation', ret: "void", arity: 0, params: "void" },
  { name: 'SetLastHealLocationWarp', ret: "void", arity: 1, params: "u8 healLocationId" },
  { name: 'UpdateEscapeWarp', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'SetEscapeWarp', ret: "void", arity: 5, params: "s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y" },
  { name: 'SetWarpDestinationToEscapeWarp', ret: "void", arity: 0, params: "void" },
  { name: 'SetFixedDiveWarp', ret: "void", arity: 5, params: "s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y" },
  { name: 'SetFixedHoleWarp', ret: "void", arity: 5, params: "s8 mapGroup, s8 mapNum, s8 warpId, s8 x, s8 y" },
  { name: 'SetWarpDestinationToFixedHoleWarp', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'SetContinueGameWarpToHealLocation', ret: "void", arity: 1, params: "u8 healLocationId" },
  { name: 'SetContinueGameWarpToDynamicWarp', ret: "void", arity: 1, params: "int unused" },
  { name: 'SetDiveWarpEmerge', ret: "bool8", arity: 2, params: "u16 x, u16 y" },
  { name: 'SetDiveWarpDive', ret: "bool8", arity: 2, params: "u16 x, u16 y" },
  { name: 'LoadMapFromCameraTransition', ret: "void", arity: 2, params: "u8 mapGroup, u8 mapNum" },
  { name: 'ResetInitialPlayerAvatarState', ret: "void", arity: 0, params: "void" },
  { name: 'StoreInitialPlayerAvatarState', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_IsBikingAllowed', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetDefaultFlashLevel', ret: "void", arity: 0, params: "void" },
  { name: 'SetFlashLevel', ret: "void", arity: 1, params: "s32 flashLevel" },
  { name: 'GetFlashLevel', ret: "u8", arity: 0, params: "void" },
  { name: 'SetCurrentMapLayout', ret: "void", arity: 1, params: "u16 mapLayoutId" },
  { name: 'SetObjectEventLoadFlag', ret: "void", arity: 1, params: "u8 flag" },
  { name: 'GetLocationMusic', ret: "u16", arity: 1, params: "struct WarpData *warp" },
  { name: 'GetCurrLocationDefaultMusic', ret: "u16", arity: 0, params: "void" },
  { name: 'GetWarpDestinationMusic', ret: "u16", arity: 0, params: "void" },
  { name: 'Overworld_ResetMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_PlaySpecialMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_SetSavedMusic', ret: "void", arity: 1, params: "u16 songNum" },
  { name: 'Overworld_ClearSavedMusic', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_ChangeMusicToDefault', ret: "void", arity: 0, params: "void" },
  { name: 'Overworld_ChangeMusicTo', ret: "void", arity: 1, params: "u16 newMusic" },
  { name: 'GetMapMusicFadeoutSpeed', ret: "u8", arity: 0, params: "void" },
  { name: 'TryFadeOutOldMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'BGMusicStopped', ret: "bool8", arity: 0, params: "void" },
  { name: 'Overworld_FadeOutMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateAmbientCry', ret: "void", arity: 2, params: "s16 *state, u16 *delayCounter" },
  { name: 'GetMapTypeByGroupAndId', ret: "u8", arity: 2, params: "s8 mapGroup, s8 mapNum" },
  { name: 'GetMapTypeByWarpData', ret: "u8", arity: 1, params: "struct WarpData *warp" },
  { name: 'GetCurrentMapType', ret: "u8", arity: 0, params: "void" },
  { name: 'GetLastUsedWarpMapType', ret: "u8", arity: 0, params: "void" },
  { name: 'IsMapTypeOutdoors', ret: "bool8", arity: 1, params: "u8 mapType" },
  { name: 'Overworld_MapTypeAllowsTeleportAndFly', ret: "bool8", arity: 1, params: "u8 mapType" },
  { name: 'IsMapTypeIndoors', ret: "bool8", arity: 1, params: "u8 mapType" },
  { name: 'GetSavedWarpRegionMapSectionId', ret: "mapsec_u8_t", arity: 0, params: "void" },
  { name: 'GetCurrentRegionMapSectionId', ret: "mapsec_u8_t", arity: 0, params: "void" },
  { name: 'GetCurrentMapBattleScene', ret: "u8", arity: 0, params: "void" },
  { name: 'CleanupOverworldWindowsAndTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'IsOverworldLinkActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'CB1_Overworld', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_OverworldBasic', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_Overworld', ret: "void", arity: 0, params: "void" },
  { name: 'SetUnusedCallback', ret: "void", arity: 1, params: "void *func" },
  { name: 'CB2_NewGame', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_WhiteOut', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_LoadMap', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldContestHall', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldCableClub', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToField', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldFromMultiplayer', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldWithOpenMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldContinueScript', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldContinueScriptPlayMapMusic', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToFieldFadeFromBlack', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ContinueSavedGame', ret: "void", arity: 0, params: "void" },
  { name: 'ResetAllMultiplayerState', ret: "void", arity: 0, params: "void" },
  { name: 'GetCableClubPartnersReady', ret: "u32", arity: 0, params: "void" },
  { name: 'SetInCableClubSeat', ret: "u16", arity: 0, params: "void" },
  { name: 'SetLinkWaitingForScript', ret: "u16", arity: 0, params: "void" },
  { name: 'QueueExitLinkRoomKey', ret: "u16", arity: 0, params: "void" },
  { name: 'SetStartedCableClubActivity', ret: "u16", arity: 0, params: "void" },
  { name: 'Overworld_IsRecvQueueAtMax', ret: "bool32", arity: 0, params: "void" },
  { name: 'Overworld_RecvKeysFromLinkIsRunning', ret: "bool32", arity: 0, params: "void" },
  { name: 'Overworld_SendKeysToLinkIsRunning', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsSendingKeysOverCable', ret: "bool32", arity: 0, params: "void" },
  { name: 'ClearLinkPlayerObjectEvents', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ContinueSavedGame',
  'CB2_LoadMap',
  'CB2_NewGame',
  'CB2_Overworld',
  'CB2_OverworldBasic',
  'CB2_ReturnToField',
  'CB2_ReturnToFieldCableClub',
  'CB2_ReturnToFieldContestHall',
  'CB2_ReturnToFieldContinueScript',
  'CB2_ReturnToFieldContinueScriptPlayMapMusic',
  'CB2_ReturnToFieldFadeFromBlack',
  'CB2_ReturnToFieldFromMultiplayer',
  'CB2_ReturnToFieldWithOpenMenu',
  'CB2_WhiteOut',
] as const;

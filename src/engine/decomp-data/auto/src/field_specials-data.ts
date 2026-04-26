// AUTO-GENERATED from src/field_specials.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_specials.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_ITEM_ICON = 5500;
export const GFXTAG_MULTICHOICE_SCROLL_ARROWS = 2000;
export const PALTAG_MULTICHOICE_SCROLL_ARROWS = 100;
export const ELEVATOR_WINDOW_WIDTH = 3;
export const ELEVATOR_WINDOW_HEIGHT = 3;
export const ELEVATOR_LIGHT_STAGES = 3;
/** Raw expr: `data[0]` */
export const tPaused_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTaskId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tFlickerCount_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTimer_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tIsScreenOn_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const tHorizontalPan_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDelayCounter_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tNumShakes_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tDelay_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tVerticalPan_EXPR = "data[4]";
/** Raw expr: `data[2]` */
export const tMoveCounter_EXPR = "data[2]";
/** Raw expr: `data[5]` */
export const tTotalMoves_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tDescending_EXPR = "data[6]";
export const MAX_ELEVATOR_TRIP = 9;
/** Raw expr: `data[0]` */
export const tMaxItemsOnScreen_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tNumItems_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tLeft_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTop_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tWidth_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tHeight_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tKeepOpenAfterSelect_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tScrollOffset_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tSelectedRow_EXPR = "data[8]";
/** Raw expr: `data[11]` */
export const tScrollMultiId_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tScrollArrowId_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tWindowId_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tListTaskId_EXPR = "data[14]";
export const DEOXYS_ROCK_LEVELS = 11;
export const ROCK_PAL_ID = 10;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const playCount_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const delay_EXPR = "data[1]";
export const CURTAIN_HEIGHT = 4;
export const CURTAIN_WIDTH = 3;
/** Raw expr: `data` */
export const tFrameTimer_EXPR = "data";
/** Raw expr: `data[3]` */
export const tCurrentFrame_EXPR = "data[3]";
/** Raw expr: `(gSaveBlock1Ptr->vars[VAR_FANCLUB_FAN_COUNTER - VARS_START])` */
export const FANCLUB_BITFIELD_EXPR = "(gSaveBlock1Ptr->vars[VAR_FANCLUB_FAN_COUNTER - VARS_START])";
export const FANCLUB_COUNTER = 127;
/** Raw expr: `(FANCLUB_BITFIELD & FANCLUB_COUNTER)` */
export const GET_TRAINER_FAN_CLUB_COUNTER_EXPR = "(FANCLUB_BITFIELD & FANCLUB_COUNTER)";
/** Raw expr: `(FANCLUB_BITFIELD &= ~FANCLUB_COUNTER)` */
export const CLEAR_TRAINER_FAN_CLUB_COUNTER_EXPR = "(FANCLUB_BITFIELD &= ~FANCLUB_COUNTER)";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate_ElevatorFloor = { bg: 0, tilemapLeft: 21, tilemapTop: 1, width: 8, height: 4, paletteNum: 15, baseBlock: 8 } as const;
export const sBattlePoints_WindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 6, height: 2, paletteNum: 15, baseBlock: 8 } as const;
export const sFrontierExchangeCorner_ItemIconWindowTemplate = { bg: 0, tilemapLeft: 2, tilemapTop: 9, width: 4, height: 4, paletteNum: 15, baseBlock: 20 } as const;
export const sBattleFrontierTutor_WindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 7, width: 12, height: 6, paletteNum: 15, baseBlock: 28 } as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sDeptStoreFloorNames = ['gText_B4F', 'gText_B3F', 'gText_B2F', 'gText_B1F', 'gText_1F', 'gText_2F', 'gText_3F', 'gText_4F', 'gText_5F', 'gText_6F', 'gText_7F', 'gText_8F', 'gText_9F', 'gText_10F', 'gText_11F', 'gText_Rooftop'] as const;
export const sBattleFrontier_TutorMoveDescriptions1 = ['gText_Exit'] as const;
export const sBattleFrontier_TutorMoveDescriptions2 = ['gText_Exit'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sBattleTowerStreakThresholds: readonly number[] = [7,14,21,28,35,49,63,77,91,0] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gBikeCyclingChallenge', isArray: false, init: "FALSE" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gBikeCollisions', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sBikeCyclingTimer', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSlidingDoorNextFrameCounter', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSlidingDoorFrame', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sTutorMoveAndElevatorWindowId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sLilycoveDeptStore_NeverRead', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sLilycoveDeptStore_DefaultFloorChoice', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sScrollableMultichoice_ScrollOffset', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sFrontierExchangeCorner_NeverRead', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sScrollableMultichoice_ItemSpriteId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sBattlePointsWindowId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sFrontierExchangeCorner_ItemIconWindowId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sPCBoxToSendMon', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sBattleTowerMultiBattleTypeFlags', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "struct ListMenuTemplate", name: 'gScrollableMultichoice_ListMenuTemplate', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'TryLoseFansFromPlayTime', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerGotFirstFans', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumFansOfPlayerInTrainerFanClub', ret: "u16", arity: 0, params: "void" },
  { name: 'RecordCyclingRoadResults', ret: "void", arity: 2, params: "u32, u8" },
  { name: 'LoadLinkPartnerObjectEventSpritePalette', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'Task_PetalburgGymSlideOpenRoomDoors', ret: "void", arity: 1, params: "u8" },
  { name: 'PetalburgGymSetDoorMetatiles', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'Task_PCTurnOnEffect', ret: "void", arity: 1, params: "u8" },
  { name: 'PCTurnOnEffect', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'PCTurnOnEffect_SetMetatile', ret: "void", arity: 3, params: "s16, s8, s8" },
  { name: 'PCTurnOffEffect', ret: "void", arity: 0, params: "void" },
  { name: 'Task_LotteryCornerComputerEffect', ret: "void", arity: 1, params: "u8" },
  { name: 'LotteryCornerComputerEffect', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'Task_ShakeCamera', ret: "void", arity: 1, params: "u8" },
  { name: 'StopCameraShake', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_MoveElevator', ret: "void", arity: 1, params: "u8" },
  { name: 'MoveElevatorWindowLights', ret: "void", arity: 2, params: "u16, bool8" },
  { name: 'Task_MoveElevatorWindowLights', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowScrollableMultichoice', ret: "void", arity: 1, params: "u8" },
  { name: 'FillFrontierExchangeCornerWindowAndItemIcon', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'ShowBattleFrontierTutorWindow', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'InitScrollableMultichoice', ret: "void", arity: 0, params: "void" },
  { name: 'ScrollableMultichoice_ProcessInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ScrollableMultichoice_UpdateScrollArrows', ret: "void", arity: 1, params: "u8" },
  { name: 'ScrollableMultichoice_MoveCursor', ret: "void", arity: 3, params: "s32, bool8, struct ListMenu *" },
  { name: 'HideFrontierExchangeCornerItemIcon', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'ShowBattleFrontierTutorMoveDescription', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'CloseScrollableMultichoice', ret: "void", arity: 1, params: "u8" },
  { name: 'ScrollableMultichoice_RemoveScrollArrows', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ScrollableMultichoice_WaitReturnToList', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ScrollableMultichoice_ReturnToList', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowFrontierExchangeCornerItemIcon', ret: "void", arity: 1, params: "u16" },
  { name: 'Task_DeoxysRockInteraction', ret: "void", arity: 1, params: "u8" },
  { name: 'ChangeDeoxysRockLevel', ret: "void", arity: 1, params: "u8" },
  { name: 'WaitForDeoxysRockMovement', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkRetireStatusWithBattleTowerPartner', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LoopWingFlapSE', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CloseBattlePikeCurtain', ret: "void", arity: 1, params: "u8" },
  { name: 'DidPlayerGetFirstFans', ret: "u8", arity: 0, params: "void" },
  { name: 'SetInitialFansOfPlayer', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerGainRandomTrainerFan', ret: "u16", arity: 0, params: "void" },
  { name: 'BufferFanClubTrainerName_', ret: "void", arity: 3, params: "struct LinkBattleRecords *, u8, u8" },
  { name: 'Special_ShowDiploma', ret: "void", arity: 0, params: "void" },
  { name: 'Special_ViewWallClock', ret: "void", arity: 0, params: "void" },
  { name: 'ResetCyclingRoadChallengeData', ret: "void", arity: 0, params: "void" },
  { name: 'Special_BeginCyclingRoadChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetPlayerAvatarBike', ret: "u16", arity: 0, params: "void" },
  { name: 'DetermineCyclingRoadResults', ret: "void", arity: 2, params: "u32 numFrames, u8 numBikeCollisions" },
  { name: 'FinishCyclingRoadChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetRecordedCyclingRoadResults', ret: "u16", arity: 0, params: "void" },
  { name: 'UpdateCyclingRoadState', ret: "void", arity: 0, params: "void" },
  { name: 'SetSSTidalFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSSTidalFlag', ret: "void", arity: 0, params: "void" },
  { name: 'CountSSTidalStep', ret: "bool32", arity: 1, params: "u16 delta" },
  { name: 'GetSSTidalLocation', ret: "u8", arity: 4, params: "s8 *mapGroup, s8 *mapNum, s16 *x, s16 *y" },
  { name: 'ShouldDoWallyCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoScottFortreeCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoScottBattleFrontierCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoRoxanneCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDoRivalRayquazaCall', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetLinkPartnerNames', ret: "u8", arity: 0, params: "void" },
  { name: 'SpawnLinkPartnerObjectEvent', ret: "void", arity: 0, params: "void" },
  { name: 'MauvilleGymPressSwitch', ret: "void", arity: 0, params: "void" },
  { name: 'MapGridSetMetatileIdAt', ret: "else", arity: 3, params: "sMauvilleGymSwitchCoords[i].x, sMauvilleGymSwitchCoords[i].y, METATILE_MauvilleGym_RaisedSwitch" },
  { name: 'MauvilleGymSetDefaultBarriers', ret: "void", arity: 0, params: "void" },
  { name: 'MauvilleGymDeactivatePuzzle', ret: "void", arity: 0, params: "void" },
  { name: 'PetalburgGymSlideOpenRoomDoors', ret: "void", arity: 0, params: "void" },
  { name: 'PetalburgGymUnlockRoomDoors', ret: "void", arity: 0, params: "void" },
  { name: 'ShowFieldMessageStringVar4', ret: "void", arity: 0, params: "void" },
  { name: 'StorePlayerCoordsInVars', ret: "void", arity: 0, params: "void" },
  { name: 'GetPlayerTrainerIdOnesDigit', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPlayerBigGuyGirlString', ret: "void", arity: 0, params: "void" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "gStringVar1, gText_BigGirl" },
  { name: 'GetRivalSonDaughterString', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleOutcome', ret: "u8", arity: 0, params: "void" },
  { name: 'CableCarWarp', ret: "void", arity: 0, params: "void" },
  { name: 'SetHiddenItemFlag', ret: "void", arity: 0, params: "void" },
  { name: 'GetWeekCount', ret: "u16", arity: 0, params: "void" },
  { name: 'GetLeadMonFriendshipScore', ret: "u8", arity: 0, params: "void" },
  { name: 'CB2_FieldShowRegionMap', ret: "void", arity: 0, params: "void" },
  { name: 'FieldShowRegionMap', ret: "void", arity: 0, params: "void" },
  { name: 'DoPCTurnOnEffect', ret: "void", arity: 0, params: "void" },
  { name: 'DoPCTurnOffEffect', ret: "void", arity: 0, params: "void" },
  { name: 'DoLotteryCornerComputerEffect', ret: "void", arity: 0, params: "void" },
  { name: 'EndLotteryCornerComputerEffect', ret: "void", arity: 0, params: "void" },
  { name: 'SetTrickHouseNuggetFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetTrickHouseNuggetFlag', ret: "void", arity: 0, params: "void" },
  { name: 'CheckLeadMonCool', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckLeadMonBeauty', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckLeadMonCute', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckLeadMonSmart', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckLeadMonTough', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsGrassTypeInParty', ret: "void", arity: 0, params: "void" },
  { name: 'SpawnCameraObject', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveCameraObject', ret: "void", arity: 0, params: "void" },
  { name: 'GetPokeblockNameByMonNature', ret: "u8", arity: 0, params: "void" },
  { name: 'GetSecretBaseNearbyMapName', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleTowerSinglesStreak', ret: "u16", arity: 0, params: "void" },
  { name: 'BufferEReaderTrainerName', ret: "void", arity: 0, params: "void" },
  { name: 'GetSlotMachineId', ret: "u16", arity: 0, params: "void" },
  { name: 'FoundAbandonedShipRoom1Key', ret: "bool8", arity: 0, params: "void" },
  { name: 'FoundAbandonedShipRoom2Key', ret: "bool8", arity: 0, params: "void" },
  { name: 'FoundAbandonedShipRoom4Key', ret: "bool8", arity: 0, params: "void" },
  { name: 'FoundAbandonedShipRoom6Key', ret: "bool8", arity: 0, params: "void" },
  { name: 'LeadMonHasEffortRibbon', ret: "bool8", arity: 0, params: "void" },
  { name: 'GiveLeadMonEffortRibbon', ret: "void", arity: 0, params: "void" },
  { name: 'Special_AreLeadMonEVsMaxedOut', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryUpdateRusturfTunnelState', ret: "u8", arity: 0, params: "void" },
  { name: 'SetShoalItemFlag', ret: "void", arity: 1, params: "u16 unused" },
  { name: 'LoadWallyZigzagoon', ret: "void", arity: 0, params: "void" },
  { name: 'IsStarterInParty', ret: "bool8", arity: 0, params: "void" },
  { name: 'ScriptCheckFreePokemonStorageSpace', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsPokerusInParty', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShakeCamera', ret: "void", arity: 0, params: "void" },
  { name: 'FoundBlackGlasses', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetRoute119Weather', ret: "void", arity: 0, params: "void" },
  { name: 'SetRoute123Weather', ret: "void", arity: 0, params: "void" },
  { name: 'GetLeadMonIndex', ret: "u8", arity: 0, params: "void" },
  { name: 'ScriptGetPartyMonSpecies', ret: "u16", arity: 0, params: "void" },
  { name: 'TryInitBattleTowerAwardManObjectEvent', ret: "void", arity: 0, params: "void" },
  { name: 'GetDaysUntilPacifidlogTMAvailable', ret: "u16", arity: 0, params: "void" },
  { name: 'SetPacifidlogTMReceivedDay', ret: "u16", arity: 0, params: "void" },
  { name: 'MonOTNameNotPlayer', ret: "bool8", arity: 0, params: "void" },
  { name: 'BufferLottoTicketNumber', ret: "void", arity: 0, params: "void" },
  { name: 'GetMysteryGiftCardStat', ret: "u16", arity: 0, params: "void" },
  { name: 'BufferTMHMMoveName', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsBadEggInParty', ret: "bool8", arity: 0, params: "void" },
  { name: 'InMultiPartnerRoom', ret: "bool8", arity: 0, params: "void" },
  { name: 'OffsetCameraForBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SetDeptStoreFloor', ret: "void", arity: 0, params: "void" },
  { name: 'GetDeptStoreDefaultFloorChoice', ret: "u16", arity: 0, params: "void" },
  { name: 'MoveElevator', ret: "void", arity: 0, params: "void" },
  { name: 'ShowDeptStoreElevatorFloorSelect', ret: "void", arity: 0, params: "void" },
  { name: 'CloseDeptStoreElevatorWindow', ret: "void", arity: 0, params: "void" },
  { name: 'BufferVarsForIVRater', ret: "void", arity: 0, params: "void" },
  { name: 'UsedPokemonCenterWarp', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayerNotAtTrainerHillEntrance', ret: "bool32", arity: 0, params: "void" },
  { name: 'UpdateFrontierManiac', ret: "void", arity: 1, params: "u16 daysSince" },
  { name: 'ShowFrontierManiacMessage', ret: "void", arity: 0, params: "void" },
  { name: 'BufferBattleTowerElevatorFloors', ret: "void", arity: 0, params: "void" },
  { name: 'ShowScrollableMultichoice', ret: "void", arity: 0, params: "void" },
  { name: 'ScrollableMultichoice_TryReturnToList', ret: "void", arity: 0, params: "void" },
  { name: 'ShowGlassWorkshopMenu', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattleTowerLinkPlayerGfx', ret: "void", arity: 0, params: "void" },
  { name: 'VarSet', ret: "else", arity: 2, params: "VAR_OBJ_GFX_ID_F - i, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL" },
  { name: 'ShowNatureGirlMessage', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateFrontierGambler', ret: "void", arity: 1, params: "u16 daysSince" },
  { name: 'ShowFrontierGamblerLookingMessage', ret: "void", arity: 0, params: "void" },
  { name: 'ShowFrontierGamblerGoMessage', ret: "void", arity: 0, params: "void" },
  { name: 'FrontierGamblerSetWonOrLost', ret: "void", arity: 1, params: "bool8 won" },
  { name: 'UpdateBattlePointsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowBattlePointsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'CloseBattlePointsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'TakeFrontierBattlePoints', ret: "void", arity: 0, params: "void" },
  { name: 'GiveFrontierBattlePoints', ret: "void", arity: 0, params: "void" },
  { name: 'GetFrontierBattlePoints', ret: "u16", arity: 0, params: "void" },
  { name: 'ShowFrontierExchangeCornerItemIconWindow', ret: "void", arity: 0, params: "void" },
  { name: 'CloseFrontierExchangeCornerItemIconWindow', ret: "void", arity: 0, params: "void" },
  { name: 'BufferBattleFrontierTutorMoveName', ret: "void", arity: 0, params: "void" },
  { name: 'AddTextPrinterParameterized', ret: "else", arity: 7, params: "sTutorMoveAndElevatorWindowId, FONT_NORMAL, sBattleFrontier_TutorMoveDescriptions1[selection], 0, 1, 0, NULL" },
  { name: 'CloseBattleFrontierTutorWindow', ret: "void", arity: 0, params: "void" },
  { name: 'ScrollableMultichoice_RedrawPersistentMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleFrontierTutorMoveIndex', ret: "void", arity: 0, params: "void" },
  { name: 'ScrollableMultichoice_ClosePersistentMenu', ret: "void", arity: 0, params: "void" },
  { name: 'DoDeoxysRockInteraction', ret: "void", arity: 0, params: "void" },
  { name: 'PlaySE', ret: "else", arity: 1, params: "SE_RG_DEOXYS_MOVE" },
  { name: 'IncrementBirthIslandRockStepCount', ret: "void", arity: 0, params: "void" },
  { name: 'SetDeoxysRockPalette', ret: "void", arity: 0, params: "void" },
  { name: 'SetPCBoxToSendMon', ret: "void", arity: 1, params: "u8 boxId" },
  { name: 'GetPCBoxToSendMon', ret: "u16", arity: 0, params: "void" },
  { name: 'ShouldShowBoxWasFullMessage', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsDestinationBoxFull', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateAbnormalWeatherEvent', ret: "void", arity: 0, params: "void" },
  { name: 'GetAbnormalWeatherMapNameAndType', ret: "bool32", arity: 0, params: "void" },
  { name: 'AbnormalWeatherHasExpired', ret: "bool8", arity: 0, params: "void" },
  { name: 'Unused_SetWeatherSunny', ret: "void", arity: 0, params: "void" },
  { name: 'GetMartEmployeeObjectEventId', ret: "u32", arity: 0, params: "void" },
  { name: 'IsTrainerRegistered', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldDistributeEonTicket', ret: "bool32", arity: 0, params: "void" },
  { name: 'BattleTowerReconnectLink', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRetireStatusWithBattleTowerPartner', ret: "void", arity: 0, params: "void" },
  { name: 'Script_DoRayquazaScene', ret: "void", arity: 0, params: "void" },
  { name: 'LoopWingFlapSE', ret: "void", arity: 0, params: "void" },
  { name: 'CloseBattlePikeCurtain', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlePyramidHint', ret: "void", arity: 0, params: "void" },
  { name: 'ResetHealLocationFromDewford', ret: "void", arity: 0, params: "void" },
  { name: 'InPokemonCenter', ret: "bool8", arity: 0, params: "void" },
  { name: 'ResetFanClub', ret: "void", arity: 0, params: "void" },
  { name: 'TryLoseFansFromPlayTimeAfterLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateTrainerFanClubGameClear', ret: "void", arity: 0, params: "void" },
  { name: 'TryGainNewFanFromCounter', ret: "u8", arity: 1, params: "u8 incrementId" },
  { name: 'PlayerLoseRandomTrainerFan', ret: "u16", arity: 0, params: "void" },
  { name: 'IsFanClubMemberFanOfPlayer', ret: "bool8", arity: 0, params: "void" },
  { name: 'BufferFanClubTrainerName', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateTrainerFansAfterLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'Script_TryGainNewFanFromCounter', ret: "u8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CloseBattlePikeCurtain',
  'Task_DeoxysRockInteraction',
  'Task_LinkRetireStatusWithBattleTowerPartner',
  'Task_LoopWingFlapSE',
  'Task_LotteryCornerComputerEffect',
  'Task_MoveElevator',
  'Task_MoveElevatorWindowLights',
  'Task_PCTurnOnEffect',
  'Task_PetalburgGymSlideOpenRoomDoors',
  'Task_ScrollableMultichoice_ReturnToList',
  'Task_ScrollableMultichoice_WaitReturnToList',
  'Task_ShakeCamera',
  'Task_ShowScrollableMultichoice',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_FieldShowRegionMap',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_tower.h',
  'cable_club.h',
  'data.h',
  'decoration.h',
  'diploma.h',
  'event_data.h',
  'event_object_movement.h',
  'fieldmap.h',
  'field_camera.h',
  'field_effect.h',
  'field_message_box.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_specials.h',
  'field_weather.h',
  'graphics.h',
  'international_string_util.h',
  'item_icon.h',
  'link.h',
  'list_menu.h',
  'main.h',
  'mystery_gift.h',
  'match_call.h',
  'menu.h',
  'overworld.h',
  'party_menu.h',
  'pokeblock.h',
  'pokemon.h',
  'pokemon_storage_system.h',
  'random.h',
  'rayquaza_scene.h',
  'region_map.h',
  'rtc.h',
  'script.h',
  'script_menu.h',
  'sound.h',
  'starter_choose.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'tv.h',
  'wallclock.h',
  'window.h',
  'constants/battle_frontier.h',
  'constants/battle_pyramid.h',
  'constants/battle_tower.h',
  'constants/decorations.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
  'constants/field_effects.h',
  'constants/field_specials.h',
  'constants/items.h',
  'constants/heal_locations.h',
  'constants/map_types.h',
  'constants/mystery_gift.h',
  'constants/slot_machine.h',
  'constants/songs.h',
  'constants/moves.h',
  'constants/party_menu.h',
  'constants/battle_frontier.h',
  'constants/weather.h',
  'constants/metatile_labels.h',
  'palette.h',
  'data/battle_frontier/battle_frontier_exchange_corner.h',
] as const;

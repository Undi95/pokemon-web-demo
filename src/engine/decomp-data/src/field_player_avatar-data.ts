// AUTO-GENERATED from src/field_player_avatar.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_player_avatar.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_FORCED_MOVEMENTS = 18;
export const NUM_ACRO_BIKE_COLLISIONS = 5;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBoulderObjId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tDirection_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tStep_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tFrameCounter_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tNumDots_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tDotsRequired_EXPR = "data[3]";
/** Raw expr: `data[12]` */
export const tRoundsPlayed_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tMinRoundsRequired_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tPlayerGfxId_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tFishingRod_EXPR = "data[15]";
export const FISHING_START_ROUND = 3;
export const FISHING_GOT_BITE = 6;
export const FISHING_ON_HOOK = 9;
export const FISHING_NO_BITE = 11;
export const FISHING_GOT_AWAY = 12;
export const FISHING_SHOW_RESULT = 13;
/** Raw expr: `data[1]` */
export const tSpinDelayTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSpeed_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCurY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tDestY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tStartDir_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tPriority_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tSubpriority_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tGroundTimer_EXPR = "data[8]";

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sPlayerNotOnBikeFuncs = ['PlayerNotOnBikeNotMoving', 'PlayerNotOnBikeTurningInPlace', 'PlayerNotOnBikeMoving'] as const;
export const sPlayerAvatarTransitionFuncs = ['PlayerAvatarTransition_Normal', 'PlayerAvatarTransition_MachBike', 'PlayerAvatarTransition_AcroBike', 'PlayerAvatarTransition_Surfing', 'PlayerAvatarTransition_Underwater', 'PlayerAvatarTransition_ReturnToField', 'PlayerAvatarTransition_Dummy', 'PlayerAvatarTransition_Dummy'] as const;
export const sPushBoulderFuncs = ['PushBoulder_Start', 'PushBoulder_Move', 'PushBoulder_End'] as const;
export const sPlayerAvatarSecretBaseMatJump = ['PlayerAvatar_DoSecretBaseMatJump'] as const;
export const sPlayerAvatarSecretBaseMatSpin = ['PlayerAvatar_SecretBaseMatSpinStep0', 'PlayerAvatar_SecretBaseMatSpinStep1', 'PlayerAvatar_SecretBaseMatSpinStep2', 'PlayerAvatar_SecretBaseMatSpinStep3'] as const;
export const sFishingStateFuncs = ['Fishing_Init', 'Fishing_GetRodOut', 'Fishing_WaitBeforeDots', 'Fishing_InitDots', 'Fishing_ShowDots', 'Fishing_CheckForBite', 'Fishing_GotBite', 'Fishing_WaitForA', 'Fishing_CheckMoreDots', 'Fishing_MonOnHook', 'Fishing_StartEncounter', 'Fishing_NotEvenNibble', 'Fishing_GotAway', 'Fishing_NoMon', 'Fishing_PutRodAway', 'Fishing_EndNoMon'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSpinStartFacingDir', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct ObjectEvent", name: 'gObjectEvents', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "struct PlayerAvatar", name: 'gPlayerAvatar', isArray: false, init: "{}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ObjectEventCB2_NoMovement2', ret: "u8", arity: 0, params: "void" },
  { name: 'TryInterruptObjectEventSpecialAnim', ret: "bool8", arity: 2, params: "struct ObjectEvent *, u8" },
  { name: 'npc_clear_strange_bits', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'MovePlayerAvatarUsingKeypadInput', ret: "void", arity: 3, params: "u8, u16, u16" },
  { name: 'PlayerAllowForcedMovementIfMovingSameDirection', ret: "void", arity: 0, params: "void" },
  { name: 'TryDoMetatileBehaviorForcedMovement', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetForcedMovementByMetatileBehavior', ret: "u8", arity: 0, params: "void" },
  { name: 'ForcedMovement_None', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_Slip', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_WalkSouth', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_WalkNorth', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_WalkWest', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_WalkEast', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_PushedSouthByCurrent', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_PushedNorthByCurrent', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_PushedWestByCurrent', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_PushedEastByCurrent', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_SlideSouth', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_SlideNorth', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_SlideWest', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_SlideEast', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_MatJump', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_MatSpin', ret: "bool8", arity: 0, params: "void" },
  { name: 'ForcedMovement_MuddySlope', ret: "bool8", arity: 0, params: "void" },
  { name: 'MovePlayerNotOnBike', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'CheckMovementInputNotOnBike', ret: "u8", arity: 1, params: "u8" },
  { name: 'PlayerNotOnBikeNotMoving', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'PlayerNotOnBikeTurningInPlace', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'PlayerNotOnBikeMoving', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'CheckForPlayerAvatarCollision', ret: "u8", arity: 1, params: "u8" },
  { name: 'CheckForPlayerAvatarStaticCollision', ret: "u8", arity: 1, params: "u8" },
  { name: 'CheckForObjectEventStaticCollision', ret: "u8", arity: 5, params: "struct ObjectEvent *, s16, s16, u8, u8" },
  { name: 'CanStopSurfing', ret: "bool8", arity: 3, params: "s16, s16, u8" },
  { name: 'ShouldJumpLedge', ret: "bool8", arity: 3, params: "s16, s16, u8" },
  { name: 'TryPushBoulder', ret: "bool8", arity: 3, params: "s16, s16, u8" },
  { name: 'CheckAcroBikeCollision', ret: "void", arity: 4, params: "s16, s16, u8, u8 *" },
  { name: 'DoPlayerAvatarTransition', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerAvatarTransition_Dummy', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAvatarTransition_Normal', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAvatarTransition_MachBike', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAvatarTransition_AcroBike', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAvatarTransition_Surfing', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAvatarTransition_Underwater', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAvatarTransition_ReturnToField', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'PlayerAnimIsMultiFrameStationary', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayerAnimIsMultiFrameStationaryAndStateNotTurning', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayerIsAnimActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayerCheckIfAnimFinishedOrInactive', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlayerRun', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerNotOnBikeCollide', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerNotOnBikeCollideWithFarawayIslandMew', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayCollisionSoundIfNotFacingWarp', ret: "void", arity: 1, params: "u8" },
  { name: 'HideShowWarpArrow', ret: "void", arity: 1, params: "struct ObjectEvent *" },
  { name: 'StartStrengthAnim', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'Task_PushBoulder', ret: "void", arity: 1, params: "u8" },
  { name: 'PushBoulder_Start', ret: "bool8", arity: 3, params: "struct Task *, struct ObjectEvent *, struct ObjectEvent *" },
  { name: 'PushBoulder_Move', ret: "bool8", arity: 3, params: "struct Task *, struct ObjectEvent *, struct ObjectEvent *" },
  { name: 'PushBoulder_End', ret: "bool8", arity: 3, params: "struct Task *, struct ObjectEvent *, struct ObjectEvent *" },
  { name: 'DoPlayerMatJump', ret: "void", arity: 0, params: "void" },
  { name: 'DoPlayerAvatarSecretBaseMatJump', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerAvatar_DoSecretBaseMatJump', ret: "u8", arity: 2, params: "struct Task *, struct ObjectEvent *" },
  { name: 'DoPlayerMatSpin', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerAvatar_DoSecretBaseMatSpin', ret: "void", arity: 1, params: "u8" },
  { name: 'PlayerAvatar_SecretBaseMatSpinStep0', ret: "bool8", arity: 2, params: "struct Task *, struct ObjectEvent *" },
  { name: 'PlayerAvatar_SecretBaseMatSpinStep1', ret: "bool8", arity: 2, params: "struct Task *, struct ObjectEvent *" },
  { name: 'PlayerAvatar_SecretBaseMatSpinStep2', ret: "bool8", arity: 2, params: "struct Task *, struct ObjectEvent *" },
  { name: 'PlayerAvatar_SecretBaseMatSpinStep3', ret: "bool8", arity: 2, params: "struct Task *, struct ObjectEvent *" },
  { name: 'CreateStopSurfingTask', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StopSurfingInit', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitStopSurfing', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Fishing', ret: "void", arity: 1, params: "u8" },
  { name: 'Fishing_Init', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_GetRodOut', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_WaitBeforeDots', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_InitDots', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_ShowDots', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_CheckForBite', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_GotBite', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_WaitForA', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_CheckMoreDots', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_MonOnHook', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_StartEncounter', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_NotEvenNibble', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_GotAway', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_NoMon', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_PutRodAway', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'Fishing_EndNoMon', ret: "u8", arity: 1, params: "struct Task *" },
  { name: 'AlignFishingAnimationFrames', ret: "void", arity: 0, params: "void" },
  { name: 'TrySpinPlayerForWarp', ret: "u8", arity: 2, params: "struct ObjectEvent *, s16 *" },
  { name: 'MovementType_Player', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'PlayerStep', ret: "void", arity: 3, params: "u8 direction, u16 newKeys, u16 heldKeys" },
  { name: 'CheckForObjectEventCollision', ret: "u8", arity: 5, params: "struct ObjectEvent *objectEvent, s16 x, s16 y, u8 direction, u8 metatileBehavior" },
  { name: 'IsPlayerCollidingWithFarawayIslandMew', ret: "bool8", arity: 1, params: "u8 direction" },
  { name: 'SetPlayerAvatarTransitionFlags', ret: "void", arity: 1, params: "u16 transitionFlags" },
  { name: 'UpdatePlayerAvatarTransitionState', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerSetCopyableMovement', ret: "void", arity: 1, params: "u8 movement" },
  { name: 'PlayerGetCopyableMovement', ret: "u8", arity: 0, params: "void" },
  { name: 'PlayerForceSetHeldMovement', ret: "void", arity: 1, params: "u8 movementActionId" },
  { name: 'PlayerSetAnimId', ret: "void", arity: 2, params: "u8 movementActionId, u8 copyableMovement" },
  { name: 'PlayerWalkNormal', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerWalkFast', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerRideWaterCurrent', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerWalkFaster', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerOnBikeCollide', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerOnBikeCollideWithFarawayIslandMew', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerFaceDirection', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerTurnInPlace', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerJumpLedge', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerFreeze', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerIdleWheelie', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerStartWheelie', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerEndWheelie', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerStandingHoppingWheelie', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerMovingHoppingWheelie', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerLedgeHoppingWheelie', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerAcroTurnJump', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerWheelieInPlace', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerPopWheelieWhileMoving', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerWheelieMove', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerEndWheelieWhileMoving', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'GetXYCoordsOneStepInFrontOfPlayer', ret: "void", arity: 2, params: "s16 *x, s16 *y" },
  { name: 'PlayerGetDestCoords', ret: "void", arity: 2, params: "s16 *x, s16 *y" },
  { name: 'player_get_pos_including_state_based_drift', ret: "u8", arity: 2, params: "s16 *x, s16 *y" },
  { name: 'GetPlayerFacingDirection', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPlayerMovementDirection', ret: "u8", arity: 0, params: "void" },
  { name: 'PlayerGetElevation', ret: "u8", arity: 0, params: "void" },
  { name: 'MovePlayerToMapCoords', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'TestPlayerAvatarFlags', ret: "u8", arity: 1, params: "u8 flag" },
  { name: 'GetPlayerAvatarFlags', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPlayerAvatarSpriteId', ret: "u8", arity: 0, params: "void" },
  { name: 'CancelPlayerForcedMovement', ret: "void", arity: 0, params: "void" },
  { name: 'StopPlayerAvatar', ret: "void", arity: 0, params: "void" },
  { name: 'GetRivalAvatarGraphicsIdByStateIdAndGender', ret: "u8", arity: 2, params: "u8 state, u8 gender" },
  { name: 'GetPlayerAvatarGraphicsIdByStateIdAndGender', ret: "u8", arity: 2, params: "u8 state, u8 gender" },
  { name: 'GetFRLGAvatarGraphicsIdByGender', ret: "u8", arity: 1, params: "u8 gender" },
  { name: 'GetRSAvatarGraphicsIdByGender', ret: "u8", arity: 1, params: "u8 gender" },
  { name: 'GetPlayerAvatarGraphicsIdByStateId', ret: "u8", arity: 1, params: "u8 state" },
  { name: 'unref_GetRivalAvatarGenderByGraphicsId', ret: "u8", arity: 1, params: "u8 gfxId" },
  { name: 'GetPlayerAvatarGenderByGraphicsId', ret: "u8", arity: 1, params: "u8 gfxId" },
  { name: 'PartyHasMonWithSurf', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsPlayerSurfingNorth', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsPlayerFacingSurfableFishableWater', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClearPlayerAvatarInfo', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerAvatarStateMask', ret: "void", arity: 1, params: "u8 flags" },
  { name: 'GetPlayerAvatarStateTransitionByGraphicsId', ret: "u8", arity: 2, params: "u8 graphicsId, u8 gender" },
  { name: 'GetPlayerAvatarGraphicsIdByCurrentState', ret: "u8", arity: 0, params: "void" },
  { name: 'SetPlayerAvatarExtraStateTransition', ret: "void", arity: 2, params: "u8 graphicsId, u8 transitionFlag" },
  { name: 'InitPlayerAvatar', ret: "void", arity: 4, params: "s16 x, s16 y, u8 direction, u8 gender" },
  { name: 'SetPlayerInvisibility', ret: "void", arity: 1, params: "bool8 invisible" },
  { name: 'SetPlayerAvatarFieldMove', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerAvatarFishing', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'PlayerUseAcroBikeOnBumpySlope', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'SetPlayerAvatarWatering', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'StartFishing', ret: "void", arity: 1, params: "u8 rod" },
  { name: 'SetSpinStartFacingDir', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'GetSpinStartFacingDir', ret: "u8", arity: 0, params: "void" },
  { name: 'Task_DoPlayerSpinExit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoPlayerSpinEntrance', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoPlayerSpinEntrance', ret: "void", arity: 0, params: "void" },
  { name: 'IsPlayerSpinEntranceActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'DoPlayerSpinExit', ret: "void", arity: 0, params: "void" },
  { name: 'IsPlayerSpinExitActive', ret: "bool32", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoPlayerSpinEntrance',
  'Task_DoPlayerSpinExit',
  'Task_Fishing',
  'Task_PushBoulder',
  'Task_StopSurfingInit',
  'Task_WaitStopSurfing',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'bike.h',
  'event_data.h',
  'event_object_movement.h',
  'field_camera.h',
  'field_effect.h',
  'field_effect_helpers.h',
  'field_player_avatar.h',
  'fieldmap.h',
  'menu.h',
  'metatile_behavior.h',
  'overworld.h',
  'party_menu.h',
  'random.h',
  'rotating_gate.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'strings.h',
  'task.h',
  'tv.h',
  'wild_encounter.h',
  'constants/abilities.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
  'constants/field_effects.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/songs.h',
  'constants/trainer_types.h',
] as const;

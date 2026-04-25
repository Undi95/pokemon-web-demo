# Route110

## Métadonnées
- **id** : `MAP_ROUTE110`
- **layout** : `LAYOUT_ROUTE110`
- **music** : `MUS_ROUTE110`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_MAUVILLE_CITY`
- down (offset 0) → `MAP_SLATEPORT_CITY`
- left (offset 60) → `MAP_ROUTE103`

## Object events (36 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_CAMPER` | 17,90 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_EventScript_Boy2` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 29,79 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_EventScript_CyclingGuy2` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 14,69 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `Route110_EventScript_OldWoman` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 9,57 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route110_EventScript_CyclingGuy1` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 10,11 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route110_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_F` | 27,24 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route110_EventScript_CyclingGirl1` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 15,7 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route110_EventScript_Boy1` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_F` | 16,73 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_DOWN_LEFT` | `Route110_EventScript_Jasmine` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 19,31 | `MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN` | `Route110_EventScript_Anthony` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_F` | 30,31 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_EventScript_Abigail` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 16,55 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT` | `Route110_EventScript_Benjamin` | `0` |
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 3,39 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_EventScript_Edward` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 33,15 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_EventScript_Jaclyn` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 34,40 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `Route110_EventScript_Edwin` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 10,19 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_EventScript_Dale` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 5,11 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 6,11 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 7,11 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 30,69 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_EventScript_ItemDireHit` | `FLAG_ITEM_ROUTE_110_DIRE_HIT` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 26,47 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_EventScript_ItemRareCandy` | `FLAG_ITEM_ROUTE_110_RARE_CANDY` |
| `LOCALID_CHALLENGE_BIKER` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 27,92 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_EventScript_ChallengeGuy` | `0` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 7,83 | `MOVEMENT_TYPE_FACE_UP` | `Route110_EventScript_AquaGrunt1` | `FLAG_HIDE_ROUTE_110_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 8,83 | `MOVEMENT_TYPE_FACE_UP` | `Route110_EventScript_AquaGrunt2` | `FLAG_HIDE_ROUTE_110_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 9,83 | `MOVEMENT_TYPE_FACE_UP` | `Route110_EventScript_AquaGrunt3` | `FLAG_HIDE_ROUTE_110_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 10,83 | `MOVEMENT_TYPE_FACE_UP` | `Route110_EventScript_AquaGrunt4` | `FLAG_HIDE_ROUTE_110_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 8,82 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_110_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 21,78 | `MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN` | `Route110_EventScript_Jacob` | `0` |
| `LOCALID_ROUTE110_RIVAL` | `OBJ_EVENT_GFX_VAR_0` | 34,54 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `0x0` | `FLAG_HIDE_ROUTE_110_RIVAL` |
| `LOCALID_ROUTE110_RIVAL_ON_BIKE` | `OBJ_EVENT_GFX_VAR_3` | 34,54 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_110_RIVAL_ON_BIKE` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 33,69 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route110_EventScript_Timmy` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 10,76 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_EventScript_Isabel` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 7,76 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_EventScript_Kaleb` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_F` | 10,39 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_EventScript_Alyssa` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 36,40 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `Route110_EventScript_Joseph` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 6,38 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_EventScript_ItemElixir` | `FLAG_ITEM_ROUTE_110_ELIXIR` |
| `LOCALID_ROUTE110_BIRCH` | `OBJ_EVENT_GFX_PROF_BIRCH` | 9,79 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_HIDE_ROUTE_110_BIRCH` |

## Warps (6)
- #0 (35,24) → `MAP_NEW_MAUVILLE_ENTRANCE` warp #0
- #1 (11,66) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #0
- #2 (15,16) → `MAP_ROUTE110_SEASIDE_CYCLING_ROAD_NORTH_ENTRANCE` warp #0
- #3 (18,16) → `MAP_ROUTE110_SEASIDE_CYCLING_ROAD_NORTH_ENTRANCE` warp #2
- #4 (16,88) → `MAP_ROUTE110_SEASIDE_CYCLING_ROAD_SOUTH_ENTRANCE` warp #0
- #5 (19,88) → `MAP_ROUTE110_SEASIDE_CYCLING_ROAD_SOUTH_ENTRANCE` warp #2

## Coord events / triggers (9)
- (28,92) → `Route110_EventScript_CyclingChallengeEnd` (si `VAR_CYCLING_CHALLENGE_STATE` == `2`)
- (29,92) → `Route110_EventScript_CyclingChallengeEnd` (si `VAR_CYCLING_CHALLENGE_STATE` == `2`)
- (33,56) → `Route110_EventScript_RivalTrigger1` (si `VAR_ROUTE110_STATE` == `0`)
- (34,56) → `Route110_EventScript_RivalTrigger2` (si `VAR_ROUTE110_STATE` == `0`)
- (35,56) → `Route110_EventScript_RivalTrigger3` (si `VAR_ROUTE110_STATE` == `0`)
- (7,85) → `Route110_EventScript_BirchScene1` (si `VAR_REGISTER_BIRCH_STATE` == `1`)
- (8,85) → `Route110_EventScript_BirchScene2` (si `VAR_REGISTER_BIRCH_STATE` == `1`)
- (9,85) → `Route110_EventScript_BirchScene3` (si `VAR_REGISTER_BIRCH_STATE` == `1`)
- (10,85) → `Route110_EventScript_BirchScene4` (si `VAR_REGISTER_BIRCH_STATE` == `1`)

## BG events / signs (17)
- (15,25) [sign] → `Route110_EventScript_VandalizedSign`
- (9,51) [sign] → `Route110_EventScript_SeasideParkingSign`
- (14,88) [sign] → `Route110_EventScript_CyclingRoadSign`
- (20,94) [sign] → `Route110_EventScript_SlateportCitySign`
- (7,79) [sign] → `Route110_EventScript_Route103Sign`
- (3,17) [sign] → `Route110_EventScript_MauvilleCitySign`
- (16,25) [secret_base] → ``
- (17,25) [secret_base] → ``
- (33,39) [sign] → `Route110_EventScript_TrainerTipsPrlzSleep`
- (37,70) [sign] → `Route110_EventScript_TrainerTipsRegisterItems`
- (8,67) [sign] → `Route110_EventScript_TrickHouseSign`
- (32,93) [sign] → `Route110_EventScript_CyclingRoadResultsSign`
- (35,39) [hidden_item] → ``
- (33,45) [hidden_item] → ``
- (4,35) [hidden_item] → ``
- (37,67) [hidden_item] → ``
- (13,16) [sign] → `Route110_EventScript_CyclingRoadSign`

## Flags référencés (1)
- `FLAG_ENABLE_PROF_BIRCH_MATCH_CALL`

## Variables référencées (7)
- `VAR_0x8008`
- `VAR_CYCLING_CHALLENGE_STATE`
- `VAR_LAST_TALKED`
- `VAR_REGISTER_BIRCH_STATE`
- `VAR_RESULT`
- `VAR_ROUTE110_STATE`
- `VAR_STARTER_MON`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_Text_AbigailPostBattle`
- `Route110_Text_AbigailRegister`
- `Route110_Text_AbigailRematchPostBattle`
- `Route110_Text_AlyssaPostBattle`
- `Route110_Text_AnthonyPostBattle`
- `Route110_Text_BenjaminPostBattle`
- `Route110_Text_BenjaminRegister`
- `Route110_Text_BenjaminRematchPostBattle`
- `Route110_Text_DalePostBattle`
- `Route110_Text_EdwardPostBattle`
- `Route110_Text_EdwinPostBattle`
- `Route110_Text_EdwinRegister`
- `Route110_Text_EdwinRematchPostBattle`
- `Route110_Text_IsabelPostBattle`
- `Route110_Text_IsabelRegister`
- `Route110_Text_IsabelRematchPostBattle`
- `Route110_Text_JaclynPostBattle`
- `Route110_Text_JacobPostBattle`
- `Route110_Text_JasminePostBattle`
- `Route110_Text_JosephPostBattle`
- `Route110_Text_KalebPostBattle`
- `Route110_Text_TimmyPostBattle`
### data/scripts/rival_graphics.inc
- `Common_EventScript_SetupRivalGfxId`
- `Common_EventScript_SetupRivalOnBikeGfxId`

## Scripts (117)
### Route110_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route110_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route110_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route110_OnFrame
```
### Route110_OnResume
```
special UpdateCyclingRoadState
end
```
### Route110_OnTransition
```
call Common_EventScript_SetupRivalGfxId
call Common_EventScript_SetupRivalOnBikeGfxId
call_if_eq VAR_CYCLING_CHALLENGE_STATE, 1, Route110_EventScript_SaveCyclingMusic
end
```
### Route110_EventScript_SaveCyclingMusic
```
savebgm MUS_CYCLING
return
```
### Route110_OnFrame
```
map_script_2 VAR_CYCLING_CHALLENGE_STATE, 1, Route110_EventScript_BeginCylcingRoadChallenge
```
### Route110_EventScript_BeginCylcingRoadChallenge
```
special Special_BeginCyclingRoadChallenge
setvar VAR_CYCLING_CHALLENGE_STATE, 2
return
```
### Route110_EventScript_AquaGrunt1
```
lock
faceplayer
msgbox Route110_Text_WeCantTalkAboutAquaActivities, MSGBOX_DEFAULT
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### Route110_EventScript_AquaGrunt2
```
lock
faceplayer
msgbox Route110_Text_KickUpARuckus, MSGBOX_DEFAULT
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### Route110_EventScript_AquaGrunt3
```
lock
faceplayer
msgbox Route110_Text_MyFirstJobInAqua, MSGBOX_DEFAULT
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### Route110_EventScript_AquaGrunt4
```
lock
faceplayer
msgbox Route110_Text_AquaActionsBringSmiles, MSGBOX_DEFAULT
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### Route110_EventScript_Boy1
```
msgbox Route110_Text_RideBikeAtFullSpeed, MSGBOX_NPC
end
```
### Route110_EventScript_CyclingGirl1
```
msgbox Route110_Text_HairStreamsBehindMe, MSGBOX_NPC
end
```
### Route110_EventScript_CyclingGuy1
```
msgbox Route110_Text_YouGotBikeFromRydel, MSGBOX_NPC
end
```
### Route110_EventScript_OldMan
```
msgbox Route110_Text_TwoRoads, MSGBOX_NPC
end
```
### Route110_EventScript_OldWoman
```
msgbox Route110_Text_WalkOnTheLowRoad, MSGBOX_NPC
end
```
### Route110_EventScript_CyclingGuy2
```
msgbox Route110_Text_BikeTechniques, MSGBOX_NPC
end
```
### Route110_EventScript_Boy2
```
msgbox Route110_Text_WhichShouldIChoose, MSGBOX_NPC
end
```
### Route110_EventScript_SlateportCitySign
```
msgbox Route110_Text_SlateportCitySign, MSGBOX_SIGN
end
```
### Route110_EventScript_CyclingRoadSign
```
msgbox Route110_Text_CyclingRoadSign, MSGBOX_SIGN
end
```
### Route110_EventScript_VandalizedSign
```
msgbox Route110_Text_AquaWasHere, MSGBOX_SIGN
end
```
### Route110_EventScript_Route103Sign
```
msgbox Route110_Text_Route103Sign, MSGBOX_SIGN
end
```
### Route110_EventScript_SeasideParkingSign
```
msgbox Route110_Text_SeasideParkingSign, MSGBOX_SIGN
end
```
### Route110_EventScript_MauvilleCitySign
```
msgbox Route110_Text_MauvilleCitySign, MSGBOX_SIGN
end
```
### Route110_EventScript_TrainerTipsPrlzSleep
```
msgbox Route110_Text_TrainerTipsPrlzSleep, MSGBOX_SIGN
end
```
### Route110_EventScript_TrainerTipsRegisterItems
```
msgbox Route110_Text_TrainerTipsRegisterItems, MSGBOX_SIGN
end
```
### Route110_EventScript_TrickHouseSign
```
msgbox Route110_Text_TrickHouseSign, MSGBOX_SIGN
end
```
### Route110_EventScript_CyclingRoadResultsSign
```
lockall
specialvar VAR_RESULT, GetRecordedCyclingRoadResults
goto_if_eq VAR_RESULT, FALSE, Route110_EventScript_NoRecordSet
msgbox Route110_Text_BestRecord, MSGBOX_DEFAULT
releaseall
end
```
### Route110_EventScript_NoRecordSet
```
msgbox Route110_Text_ThereIsNoRecord, MSGBOX_DEFAULT
releaseall
end
```
### Route110_EventScript_ChallengeGuy
```
lock
faceplayer
specialvar VAR_RESULT, GetPlayerAvatarBike
goto_if_eq VAR_RESULT, 1, Route110_EventScript_PlayerRidingAcroBike
goto_if_eq VAR_CYCLING_CHALLENGE_STATE, 0, Route110_EventScript_PlayerNotRidingBike
msgbox Route110_Text_AlwaysAimHigher, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_PlayerNotRidingBike
```
msgbox Route110_Text_RatedForNumberOfCollisions, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_PlayerRidingAcroBike
```
msgbox Route110_Text_AcroBikesDoNotQualify, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_Edward
```
trainerbattle_single TRAINER_EDWARD, Route110_Text_EdwardIntro, Route110_Text_EdwardDefeated
msgbox Route110_Text_EdwardPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Jaclyn
```
trainerbattle_single TRAINER_JACLYN, Route110_Text_JaclynIntro, Route110_Text_JaclynDefeated
msgbox Route110_Text_JaclynPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Edwin
```
trainerbattle_single TRAINER_EDWIN_1, Route110_Text_EdwinIntro, Route110_Text_EdwinDefeated, Route110_EventScript_EdwinRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route110_EventScript_EdwinRematch
msgbox Route110_Text_EdwinPostBattle, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_EdwinRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route110_Text_EdwinRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_EDWIN_1
release
end
```
### Route110_EventScript_EdwinRematch
```
trainerbattle_rematch TRAINER_EDWIN_1, Route110_Text_EdwinRematchIntro, Route110_Text_EdwinRematchDefeated
msgbox Route110_Text_EdwinRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Dale
```
trainerbattle_single TRAINER_DALE, Route110_Text_DaleIntro, Route110_Text_DaleDefeated
msgbox Route110_Text_DalePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Jacob
```
trainerbattle_single TRAINER_JACOB, Route110_Text_JacobIntro, Route110_Text_JacobDefeated
msgbox Route110_Text_JacobPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Anthony
```
trainerbattle_single TRAINER_ANTHONY, Route110_Text_AnthonyIntro, Route110_Text_AnthonyDefeated
msgbox Route110_Text_AnthonyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Benjamin
```
trainerbattle_single TRAINER_BENJAMIN_1, Route110_Text_BenjaminIntro, Route110_Text_BenjaminDefeated, Route110_EventScript_BenjaminRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route110_EventScript_BenjaminRematch
msgbox Route110_Text_BenjaminPostBattle, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_BenjaminRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route110_Text_BenjaminRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_BENJAMIN_1
release
end
```
### Route110_EventScript_BenjaminRematch
```
trainerbattle_rematch TRAINER_BENJAMIN_1, Route110_Text_BenjaminRematchIntro, Route110_Text_BenjaminRematchDefeated
msgbox Route110_Text_BenjaminRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Jasmine
```
trainerbattle_single TRAINER_JASMINE, Route110_Text_JasmineIntro, Route110_Text_JasmineDefeated
msgbox Route110_Text_JasminePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Abigail
```
trainerbattle_single TRAINER_ABIGAIL_1, Route110_Text_AbigailIntro, Route110_Text_AbigailDefeated, Route110_EventScript_AbigailRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route110_EventScript_AbigailRematch
msgbox Route110_Text_AbigailPostBattle, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_AbigailRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route110_Text_AbigailRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ABIGAIL_1
release
end
```
### Route110_EventScript_AbigailRematch
```
trainerbattle_rematch TRAINER_ABIGAIL_1, Route110_Text_AbigailRematchIntro, Route110_Text_AbigailRematchDefeated
msgbox Route110_Text_AbigailRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Isabel
```
trainerbattle_single TRAINER_ISABEL_1, Route110_Text_IsabelIntro, Route110_Text_IsabelDefeated, Route110_EventScript_IsabelRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route110_EventScript_IsabelRematch
msgbox Route110_Text_IsabelPostBattle, MSGBOX_DEFAULT
release
end
```
### Route110_EventScript_IsabelRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route110_Text_IsabelRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ISABEL_1
release
end
```
### Route110_EventScript_IsabelRematch
```
trainerbattle_rematch TRAINER_ISABEL_1, Route110_Text_IsabelRematchIntro, Route110_Text_IsabelRematchDefeated
msgbox Route110_Text_IsabelRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Timmy
```
trainerbattle_single TRAINER_TIMMY, Route110_Text_TimmyIntro, Route110_Text_TimmyDefeated
msgbox Route110_Text_TimmyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Unused
```
end
```
### Route110_EventScript_Kaleb
```
trainerbattle_single TRAINER_KALEB, Route110_Text_KalebIntro, Route110_Text_KalebDefeated
msgbox Route110_Text_KalebPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Joseph
```
trainerbattle_single TRAINER_JOSEPH, Route110_Text_JosephIntro, Route110_Text_JosephDefeated
msgbox Route110_Text_JosephPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_Alyssa
```
trainerbattle_single TRAINER_ALYSSA, Route110_Text_AlyssaIntro, Route110_Text_AlyssaDefeated
msgbox Route110_Text_AlyssaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_EventScript_CyclingChallengeEnd
```
lockall
applymovement LOCALID_CHALLENGE_BIKER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
call Route110_EventScript_CyclingChallengeResults
releaseall
end
```
### Route110_EventScript_CyclingChallengeResults
```
special FinishCyclingRoadChallenge
msgbox Route110_Text_CyclingChallengeResultSummary, MSGBOX_DEFAULT
switch VAR_RESULT
case 10, Route110_EventScript_ChallengeReactionBest
case 9, Route110_EventScript_ChallengeReactionGood
case 8, Route110_EventScript_ChallengeReactionGood
case 7, Route110_EventScript_ChallengeReactionGood
case 6, Route110_EventScript_ChallengeReactionOk
case 5, Route110_EventScript_ChallengeReactionOk
case 4, Route110_EventScript_ChallengeReactionOk
case 3, Route110_EventScript_ChallengeReactionBad
case 2, Route110_EventScript_ChallengeReactionBad
case 1, Route110_EventScript_ChallengeReactionBad
case 0, Route110_EventScript_ChallengeReactionWorst
end
```
### Route110_EventScript_ChallengeReactionBest
```
msgbox Route110_Text_ChallengeReactionBest, MSGBOX_DEFAULT
goto Route110_EventScript_EndChallenge
end
```
### Route110_EventScript_ChallengeReactionGood
```
msgbox Route110_Text_ChallengeReactionGood, MSGBOX_DEFAULT
goto Route110_EventScript_EndChallenge
end
```
### Route110_EventScript_ChallengeReactionOk
```
msgbox Route110_Text_ChallengeReactionOk, MSGBOX_DEFAULT
goto Route110_EventScript_EndChallenge
end
```
### Route110_EventScript_ChallengeReactionBad
```
msgbox Route110_Text_ChallengeReactionBad, MSGBOX_DEFAULT
goto Route110_EventScript_EndChallenge
end
```
### Route110_EventScript_ChallengeReactionWorst
```
msgbox Route110_Text_ChallengeReactionWorst, MSGBOX_DEFAULT
goto Route110_EventScript_EndChallenge
end
```
### Route110_EventScript_EndChallenge
```
setvar VAR_CYCLING_CHALLENGE_STATE, 3
savebgm MUS_DUMMY
fadedefaultbgm
return
```
### Route110_EventScript_RivalTrigger1
```
setvar VAR_0x8008, 1
goto Route110_EventScript_RivalScene
end
```
### Route110_EventScript_RivalTrigger2
```
setvar VAR_0x8008, 2
goto Route110_EventScript_RivalScene
end
```
### Route110_EventScript_RivalTrigger3
```
setvar VAR_0x8008, 3
goto Route110_EventScript_RivalScene
end
```
### Route110_EventScript_RivalScene
```
lockall
checkplayergender
call_if_eq VAR_RESULT, MALE, Route110_EventScript_PlayMayMusic
call_if_eq VAR_RESULT, FEMALE, Route110_EventScript_PlayBrendanMusic
applymovement LOCALID_ROUTE110_RIVAL, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
applymovement LOCALID_ROUTE110_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_ROUTE110_RIVAL, Common_Movement_Delay48
waitmovement 0
delay 30
call_if_eq VAR_0x8008, 1, Route110_EventScript_RivalApproachPlayer1
call_if_eq VAR_0x8008, 2, Route110_EventScript_RivalApproachPlayer2
call_if_eq VAR_0x8008, 3, Route110_EventScript_RivalApproachPlayer3
checkplayergender
goto_if_eq VAR_RESULT, MALE, Route110_EventScript_MayBattle
goto_if_eq VAR_RESULT, FEMALE, Route110_EventScript_BrendanBattle
releaseall
end
```
### Route110_EventScript_PlayMayMusic
```
playbgm MUS_ENCOUNTER_MAY, TRUE
return
```
### Route110_EventScript_PlayBrendanMusic
```
playbgm MUS_ENCOUNTER_BRENDAN, TRUE
return
```
### Route110_EventScript_MayBattle
```
msgbox Route110_Text_MayLetsBattle, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route110_EventScript_MayBattleTreecko
case 1, Route110_EventScript_MayBattleTorchic
case 2, Route110_EventScript_MayBattleMudkip
end
```
### Route110_EventScript_MayBattleTreecko
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_110_TREECKO, Route110_Text_MayDefeated
goto Route110_EventScript_MayDefeated
end
```
### Route110_EventScript_MayBattleTorchic
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_110_TORCHIC, Route110_Text_MayDefeated
goto Route110_EventScript_MayDefeated
end
```
### Route110_EventScript_MayBattleMudkip
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_110_MUDKIP, Route110_Text_MayDefeated
goto Route110_EventScript_MayDefeated
end
```
### Route110_EventScript_MayDefeated
```
msgbox Route110_Text_MayTakeThis, MSGBOX_DEFAULT
call Route110_EventScript_GiveItemfinder
msgbox Route110_Text_MayExplainItemfinder, MSGBOX_DEFAULT
goto Route110_EventScript_RivalExit
end
```
### Route110_EventScript_BrendanBattle
```
msgbox Route110_Text_BrendanLetsBattle, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route110_EventScript_BrendanBattleTreecko
case 1, Route110_EventScript_BrendanBattleTorchic
case 2, Route110_EventScript_BrendanBattleMudkip
end
```
### Route110_EventScript_BrendanBattleTreecko
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_110_TREECKO, Route110_Text_BrendanDefeated
goto Route110_EventScript_BrendanDefeated
end
```
### Route110_EventScript_BrendanBattleTorchic
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_110_TORCHIC, Route110_Text_BrendanDefeated
goto Route110_EventScript_BrendanDefeated
end
```
### Route110_EventScript_BrendanBattleMudkip
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_110_MUDKIP, Route110_Text_BrendanDefeated
goto Route110_EventScript_BrendanDefeated
end
```
### Route110_EventScript_BrendanDefeated
```
msgbox Route110_Text_BrendanTakeThis, MSGBOX_DEFAULT
call Route110_EventScript_GiveItemfinder
msgbox Route110_Text_BrendanExplainItemfinder, MSGBOX_DEFAULT
goto Route110_EventScript_RivalExit
end
```
### Route110_EventScript_GiveItemfinder
```
giveitem ITEM_ITEMFINDER
return
```
### Route110_EventScript_RivalExit
```
closemessage
call_if_eq VAR_0x8008, 1, Route110_EventScript_MoveRival1
call_if_eq VAR_0x8008, 2, Route110_EventScript_MoveRival2
call_if_eq VAR_0x8008, 3, Route110_EventScript_MoveRival3
setobjectmovementtype LOCALID_ROUTE110_RIVAL, MOVEMENT_TYPE_FACE_RIGHT
setobjectmovementtype LOCALID_ROUTE110_RIVAL_ON_BIKE, MOVEMENT_TYPE_FACE_RIGHT
removeobject LOCALID_ROUTE110_RIVAL
addobject LOCALID_ROUTE110_RIVAL_ON_BIKE
delay 45
call_if_eq VAR_0x8008, 1, Route110_EventScript_RivalExit1
call_if_eq VAR_0x8008, 2, Route110_EventScript_RivalExit2
call_if_eq VAR_0x8008, 3, Route110_EventScript_RivalExit3
removeobject LOCALID_ROUTE110_RIVAL_ON_BIKE
setvar VAR_ROUTE110_STATE, 1
savebgm MUS_DUMMY
fadedefaultbgm
releaseall
end
```
### Route110_EventScript_RivalApproachPlayer1
```
applymovement LOCALID_ROUTE110_RIVAL, Route110_Movement_RivalApproachPlayer1
waitmovement 0
return
```
### Route110_EventScript_RivalApproachPlayer2
```
applymovement LOCALID_ROUTE110_RIVAL, Route110_Movement_RivalApproachPlayer2
waitmovement 0
return
```
### Route110_EventScript_RivalApproachPlayer3
```
applymovement LOCALID_ROUTE110_RIVAL, Route110_Movement_RivalApproachPlayer3
waitmovement 0
return
```
### Route110_EventScript_RivalExit1
```
applymovement LOCALID_ROUTE110_RIVAL_ON_BIKE, Route110_Movement_RivalExit1
waitmovement 0
return
```
### Route110_EventScript_RivalExit2
```
applymovement LOCALID_ROUTE110_RIVAL_ON_BIKE, Route110_Movement_RivalExit2
waitmovement 0
return
```
### Route110_EventScript_RivalExit3
```
applymovement LOCALID_ROUTE110_RIVAL_ON_BIKE, Route110_Movement_RivalExit3
waitmovement 0
return
```
### Route110_EventScript_MoveRival1
```
setobjectxyperm LOCALID_ROUTE110_RIVAL_ON_BIKE, 33, 55
return
```
### Route110_EventScript_MoveRival2
```
setobjectxyperm LOCALID_ROUTE110_RIVAL_ON_BIKE, 34, 55
return
```
### Route110_EventScript_MoveRival3
```
setobjectxyperm LOCALID_ROUTE110_RIVAL_ON_BIKE, 35, 55
return
```
### Route110_Movement_RivalApproachPlayer1
```
walk_down
walk_left
walk_in_place_faster_down
step_end
```
### Route110_Movement_RivalApproachPlayer2
```
walk_down
step_end
```
### Route110_Movement_RivalApproachPlayer3
```
walk_down
walk_right
walk_in_place_faster_down
step_end
```
### Route110_Movement_RivalExit1
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
step_end
```
### Route110_Movement_RivalExit2
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_down
step_end
```
### Route110_Movement_RivalExit3
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
step_end
```
### Route110_EventScript_BirchScene1
```
lockall
setvar VAR_0x8008, 1
goto Route110_EventScript_BirchScene
```
### Route110_EventScript_BirchScene2
```
lockall
setvar VAR_0x8008, 2
goto Route110_EventScript_BirchScene
```
### Route110_EventScript_BirchScene3
```
lockall
setvar VAR_0x8008, 3
goto Route110_EventScript_BirchScene
```
### Route110_EventScript_BirchScene4
```
lockall
setvar VAR_0x8008, 4
goto Route110_EventScript_BirchScene
```
### Route110_EventScript_BirchScene
```
addobject LOCALID_ROUTE110_BIRCH
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchEntrance
waitmovement 0
playse SE_PIN
applymovement LOCALID_ROUTE110_BIRCH, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_ROUTE110_BIRCH, Common_Movement_Delay48
waitmovement 0
call_if_eq VAR_0x8008, 1, Route110_EventScript_BirchApproachPlayer1
call_if_eq VAR_0x8008, 2, Route110_EventScript_BirchApproachPlayer2
call_if_eq VAR_0x8008, 3, Route110_EventScript_BirchApproachPlayer3
call_if_eq VAR_0x8008, 4, Route110_EventScript_BirchApproachPlayer4
msgbox Route110_Text_ImagineSeeingYouHere, MSGBOX_DEFAULT
closemessage
delay 20
applymovement LOCALID_ROUTE110_BIRCH, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 10
applymovement LOCALID_ROUTE110_BIRCH, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 20
applymovement LOCALID_ROUTE110_BIRCH, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
msgbox Route110_Text_HeardYouInstallMatchCall, MSGBOX_DEFAULT
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox Route110_Text_RegisteredBirchInPokenav, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_PROF_BIRCH_MATCH_CALL
msgbox Route110_Text_KeepAnEyeOutForRival, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8008, 1, Route110_EventScript_BirchExit1
call_if_eq VAR_0x8008, 2, Route110_EventScript_BirchExit2
call_if_eq VAR_0x8008, 3, Route110_EventScript_BirchExit3
call_if_eq VAR_0x8008, 4, Route110_EventScript_BirchExit4
removeobject LOCALID_ROUTE110_BIRCH
setvar VAR_REGISTER_BIRCH_STATE, 2
releaseall
end
```
### Route110_EventScript_BirchApproachPlayer1
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchApproachPlayer1
waitmovement 0
return
```
### Route110_EventScript_BirchApproachPlayer2
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchApproachPlayer2
waitmovement 0
return
```
### Route110_EventScript_BirchApproachPlayer3
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchApproachPlayer3
waitmovement 0
return
```
### Route110_EventScript_BirchApproachPlayer4
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchApproachPlayer4
waitmovement 0
return
```
### Route110_EventScript_BirchExit1
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchExit1
waitmovement 0
return
```
### Route110_EventScript_BirchExit2
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchExit2
waitmovement 0
return
```
### Route110_EventScript_BirchExit3
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchExit3
waitmovement 0
return
```
### Route110_EventScript_BirchExit4
```
applymovement LOCALID_ROUTE110_BIRCH, Route110_Movement_BirchExit4
waitmovement 0
return
```
### Route110_Movement_BirchEntrance
```
walk_down
walk_down
walk_down
step_end
```
### Route110_Movement_BirchApproachPlayer1
```
walk_down
walk_left
walk_left
walk_down
step_end
```
### Route110_Movement_BirchApproachPlayer2
```
walk_down
walk_left
walk_down
step_end
```
### Route110_Movement_BirchApproachPlayer3
```
walk_down
walk_down
step_end
```
### Route110_Movement_BirchApproachPlayer4
```
walk_down
walk_right
walk_down
step_end
```
### Route110_Movement_BirchExit1
```
walk_up
walk_up
walk_right
walk_up
walk_up
walk_up
step_end
```
### Route110_Movement_BirchExit2
```
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### Route110_Movement_BirchExit3
```
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### Route110_Movement_BirchExit4
```
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```

## Textes (43)
### Route110_Text_WeCantTalkAboutAquaActivities
```
Les activités de la TEAM AQUA doivent\nrester secrètes pour le moment.$
```
### Route110_Text_KickUpARuckus
```
Je veux aller à POIVRESSEL et\nprovoquer une bagarre!$
```
### Route110_Text_MyFirstJobInAqua
```
C'est ma première mission en tant que\nmembre de la TEAM AQUA. J'ai les j'tons!$
```
### Route110_Text_AquaActionsBringSmiles
```
Les actions de la TEAM AQUA rendront\nle sourire à tout le monde!$
```
### Route110_Text_MayLetsBattle
```
FLORA: Salut, {PLAYER}{KUN}, ça faisait\nlongtemps!\pEn cherchant d'autres POKéMON, j'ai\npermis aux miens de devenir plus forts.\pAlors…\nQue dirais-tu d'un petit combat?$
```
### Route110_Text_MayDefeated
```
Mince! Tu as un meilleur niveau que je\nne le pensais!$
```
### Route110_Text_MayTakeThis
```
FLORA: {PLAYER}{KUN}, toi aussi tu as passé\nbeaucoup de temps à l'entraînement?\pTu mérites une récompense!\nVoilà pour toi!$
```
### Route110_Text_MayExplainItemfinder
```
FLORA: C'est un CHERCH'OBJET.\pEssaie-le. S'il y a un objet non visible,\nil émet un son.\pOK, {PLAYER}{KUN}, on se reverra!\pJe sais que c'est un peu bête venant de\nmoi, mais tu devrais t'entraîner encore\lplus pour la prochaine fois.$
```
### Route110_Text_BrendanLetsBattle
```
BRICE: Hé, {PLAYER}.\nC'est donc là que tu te cachais.\lComment ça va?\pT'as dressé tes POKéMON?\nJe vais vérifier.$
```
### Route110_Text_BrendanDefeated
```
Humm…\nPas mal du tout.$
```
### Route110_Text_BrendanTakeThis
```
BRICE: {PLAYER}, tu as continué\nl'entraînement sans me prévenir…\pC'est bien!\nAllez, prends ça.$
```
### Route110_Text_BrendanExplainItemfinder
```
BRICE: C'est un CHERCH'OBJET.\pUtilise-le pour chercher des objets qui\nsont invisibles.\pS'il détecte quelque chose, il émet\nun son.\pEn tout cas, je pars à la recherche de\nnouveaux POKéMON.$
```
### Route110_Text_RideBikeAtFullSpeed
```
Ce serait pas génial de rouler à fond\nen VELO sur la PISTE CYCLABLE?$
```
### Route110_Text_HairStreamsBehindMe
```
Tu aimes mes cheveux noir corbeau qui\nflottent dans mon dos?\pJe les ai laissés pousser rien que\npour ça.$
```
### Route110_Text_YouGotBikeFromRydel
```
Oh, hé, tu as eu ce VELO chez RODOLPHE!\pOh, ça saute aux yeux!\nC'est écrit dessus…\pRODOLPHE, RODOLPHE, RODOLPHE,\nRODOLPHE, RODOLPHE, RODOLPHE,\pRODOLPHE, RODOLPHE, RODOLPHE,\nRODOLPHE, RODOLPHE, RODOLPHE,\pRODOLPHE, RODOLPHE, RODOLPHE,\nRODOLPHE, RODOLPHE, RODOLPHE,\pRODOLPHE, RODOLPHE, RODOLPHE,\nRODOLPHE, RODOLPHE, RODOLPHE,\pRODOLPHE, RODOLPHE, RODOLPHE…\nCe nom est partout.\pTu devrais rouler un peu partout dans\nle coin. Ça fait une super pub!$
```
### Route110_Text_TwoRoads
```
Les deux routes, l'une au-dessus et\nl'autre en dessous…\pUne pour les POKéMON et une pour les\nhumains. C'est peut-être juste.$
```
### Route110_Text_WalkOnTheLowRoad
```
Je n'ai pas de VELO, alors je me balade\nsur la route du dessous.$
```
### Route110_Text_BikeTechniques
```
C'est plus sympa de faire du VELO\nquand on connaît certaines techniques.\pCertains endroits ne sont accessibles\nqu'en utilisant une technique en vélo.$
```
### Route110_Text_WhichShouldIChoose
```
Que dois-je faire?\pAller directement à LAVANDIA par\nla PISTE CYCLABLE ou prendre la route\ldu bas et chercher des POKéMON?$
```
### Route110_Text_CyclingChallengeResultSummary
```
Nombre de collisions:\n{STR_VAR_1}!\pTemps total:\n{STR_VAR_2}!$
```
### Route110_Text_ChallengeReactionBest
```
Bravo! Superbe démonstration!\pTon amour pour le vélo vient du plus\nprofond de ton cœur.\lTu m'as profondément ému!$
```
### Route110_Text_ChallengeReactionGood
```
Ta technique est remarquable.\pJe te suggère juste de ralentir un peu\npour éviter les collisions.$
```
### Route110_Text_ChallengeReactionOk
```
Je dirais que tu es sur la bonne voie.\pCependant, j'espère que tu ne vas pas\noublier le véritable plaisir du vélo.$
```
### Route110_Text_ChallengeReactionBad
```
Je dois dire… Tes compétences\ncyclistes sont très limitées.\pTu aurais sûrement besoin d'un peu\nplus de pratique.$
```
### Route110_Text_ChallengeReactionWorst
```
… Je suis horrifié…\pC'est peut-être pas ton truc le VELO,\naprès tout.\pTu devrais sérieusement penser à \nrapporter ce VELO chez RODOLPHE.$
```
### Route110_Text_RatedForNumberOfCollisions
```
C'est la PISTE CYCLABLE.\pSi tu roules de LAVANDIA à\nPOIVRESSEL avec le VELO COURSE,\ltu pourras connaître ton nombre\lde collisions et ton temps total.$
```
### Route110_Text_AlwaysAimHigher
```
Peu importe les résultats, j'attends\nplus de combativité de ta part.\pIl faut toujours viser plus haut!$
```
### Route110_Text_AcroBikesDoNotQualify
```
Sur la PISTE CYCLABLE, on enregistre\nle nombre de collisions et le temps\ltotal de chaque VELO COURSE.\pMais les VELOS CROSS ne peuvent pas\nparticiper car ils tournent trop\lfacilement. C'est pas juste!$
```
### Route110_Text_SlateportCitySign
```
ROUTE 110\n{DOWN_ARROW} POIVRESSEL$
```
### Route110_Text_CyclingRoadSign
```
PISTE CYCLABLE DU BORD DE MER$
```
### Route110_Text_AquaWasHere
```
“VIVE LA TEAM AQUA!”\pC'est ce qui était écrit sur le panneau,\nmais quelqu'un a rajouté un nouveau\ltexte par dessus.\pOn peut y lire:\n“LA TEAM MAGMA est la meilleure!”$
```
### Route110_Text_Route103Sign
```
ROUTE 110\n{LEFT_ARROW} ROUTE 103$
```
### Route110_Text_SeasideParkingSign
```
PARKING DU BORD DE MER$
```
### Route110_Text_MauvilleCitySign
```
ROUTE 110\n{UP_ARROW} LAVANDIA$
```
### Route110_Text_TrainerTipsPrlzSleep
```
CONSEILS AUX DRESSEURS\pVous pouvez rendre l'ennemi impuissant\nen le paralysant ou en l'endormant.\pC'est une technique importante pour\nles combats de POKéMON.$
```
### Route110_Text_TrainerTipsRegisterItems
```
CONSEILS AUX DRESSEURS\pVous pouvez réorganiser les objets\ndans le SAC en appuyant sur SELECT.$
```
### Route110_Text_TrickHouseSign
```
“Trois pas {RIGHT_ARROW} et deux pas {UP_ARROW} pour\natteindre la MAISON DES PIEGES.”$
```
### Route110_Text_BestRecord
```
LE RECORD A RETENIR…\pNb de collisions: {STR_VAR_1}\pTemps écoulé: {STR_VAR_2}$
```
### Route110_Text_ThereIsNoRecord
```
LE RECORD A RETENIR…\pPersonne ne semble avoir relevé le défi.\nAucun record n'a été établi…$
```
### Route110_Text_ImagineSeeingYouHere
```
PROF. SEKO: Oh, {PLAYER}{KUN}!\nContent de te voir ici!\pMais où peut bien se trouver {RIVAL}?$
```
### Route110_Text_HeardYouInstallMatchCall
```
Oh, je vois!\nVous ne faites pas la route ensemble.\lC'est comme vous préférez.\pIl paraît que tu as la fonction MATCH\nPHONE installée sur ton POKéNAV.\pAlors je devrais t'enregistrer sur\nle mien.\pComme ça, je pourrai évaluer ton\nPOKéDEX même si nous sommes loin.\p… … … … … …$
```
### Route110_Text_RegisteredBirchInPokenav
```
Vous avez enregistré le PROF. SEKO\ndans le POKéNAV.$
```
### Route110_Text_KeepAnEyeOutForRival
```
PROF. SEKO: {PLAYER}{KUN}…\pS'il te plaît, garde un œil sur {RIVAL}.\n… … … … … …\pBon, je ferais bien d'y aller.\nA bientôt, {PLAYER}{KUN}!$
```

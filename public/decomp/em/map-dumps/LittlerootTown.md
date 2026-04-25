# LittlerootTown

## Métadonnées
- **id** : `MAP_LITTLEROOT_TOWN`
- **layout** : `LAYOUT_LITTLEROOT_TOWN`
- **music** : `MUS_LITTLEROOT`
- **region_map_section** : `MAPSEC_LITTLEROOT_TOWN`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_TOWN`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE101`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_LITTLEROOT_TWIN` | `OBJ_EVENT_GFX_TWIN` | 16,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `LittlerootTown_EventScript_Twin` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 12,13 | `MOVEMENT_TYPE_WANDER_AROUND` | `LittlerootTown_EventScript_FatMan` | `FLAG_HIDE_LITTLEROOT_TOWN_FAT_MAN` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 14,17 | `MOVEMENT_TYPE_WANDER_AROUND` | `LittlerootTown_EventScript_Boy` | `0` |
| `LOCALID_LITTLEROOT_MOM` | `OBJ_EVENT_GFX_MOM` | 5,8 | `MOVEMENT_TYPE_FACE_UP` | `LittlerootTown_EventScript_Mom` | `FLAG_HIDE_LITTLEROOT_TOWN_MOM_OUTSIDE` |
| `` | `OBJ_EVENT_GFX_TRUCK` | 2,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK` |
| `` | `OBJ_EVENT_GFX_TRUCK` | 11,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK` |
| `LOCALID_LITTLEROOT_RIVAL` | `OBJ_EVENT_GFX_VAR_0` | 13,10 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_RIVAL` |
| `LOCALID_LITTLEROOT_BIRCH` | `OBJ_EVENT_GFX_PROF_BIRCH` | 14,10 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_BIRCH` |

## Warps (3)
- #0 (14,8) → `MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F` warp #1
- #1 (5,8) → `MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F` warp #1
- #2 (7,16) → `MAP_LITTLEROOT_TOWN_PROFESSOR_BIRCHS_LAB` warp #0

## Coord events / triggers (9)
- (10,1) → `LittlerootTown_EventScript_NeedPokemonTriggerLeft` (si `VAR_LITTLEROOT_TOWN_STATE` == `0`)
- (11,1) → `LittlerootTown_EventScript_NeedPokemonTriggerRight` (si `VAR_LITTLEROOT_TOWN_STATE` == `0`)
- (11,1) → `LittlerootTown_EventScript_GoSaveBirchTrigger` (si `VAR_LITTLEROOT_TOWN_STATE` == `1`)
- (8,9) → `LittlerootTown_EventScript_GiveRunningShoesTrigger4` (si `VAR_LITTLEROOT_TOWN_STATE` == `3`)
- (9,9) → `LittlerootTown_EventScript_GiveRunningShoesTrigger5` (si `VAR_LITTLEROOT_TOWN_STATE` == `3`)
- (10,9) → `LittlerootTown_EventScript_GiveRunningShoesTrigger2` (si `VAR_LITTLEROOT_TOWN_STATE` == `3`)
- (11,9) → `LittlerootTown_EventScript_GiveRunningShoesTrigger3` (si `VAR_LITTLEROOT_TOWN_STATE` == `3`)
- (10,2) → `LittlerootTown_EventScript_GiveRunningShoesTrigger0` (si `VAR_LITTLEROOT_TOWN_STATE` == `3`)
- (11,2) → `LittlerootTown_EventScript_GiveRunningShoesTrigger1` (si `VAR_LITTLEROOT_TOWN_STATE` == `3`)

## BG events / signs (4)
- (15,13) [sign] → `LittlerootTown_EventScript_TownSign`
- (6,17) [sign] → `LittlerootTown_EventScript_BirchsLabSign`
- (7,8) [sign] → `LittlerootTown_EventScript_BrendansHouseSign`
- (12,8) [sign] → `LittlerootTown_EventScript_MaysHouseSign`

## Flags référencés (14)
- `FLAG_ADVENTURE_STARTED`
- `FLAG_HIDE_LITTLEROOT_TOWN_BIRCH`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK`
- `FLAG_HIDE_LITTLEROOT_TOWN_FAT_MAN`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK`
- `FLAG_HIDE_LITTLEROOT_TOWN_MOM_OUTSIDE`
- `FLAG_HIDE_LITTLEROOT_TOWN_RIVAL`
- `FLAG_HIDE_MAP_NAME_POPUP`
- `FLAG_HIDE_OLDALE_TOWN_RIVAL`
- `FLAG_RECEIVED_RUNNING_SHOES`
- `FLAG_RESCUED_BIRCH`
- `FLAG_RIVAL_LEFT_FOR_ROUTE103`
- `FLAG_SYS_B_DASH`
- `FLAG_VISITED_LITTLEROOT_TOWN`

## Variables référencées (13)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_0x8009`
- `VAR_0x800A`
- `VAR_DEX_UPGRADE_JOHTO_STARTER_STATE`
- `VAR_LITTLEROOT_HOUSES_STATE_BRENDAN`
- `VAR_LITTLEROOT_HOUSES_STATE_MAY`
- `VAR_LITTLEROOT_INTRO_STATE`
- `VAR_LITTLEROOT_RIVAL_STATE`
- `VAR_LITTLEROOT_TOWN_STATE`
- `VAR_OLDALE_RIVAL_STATE`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/rival_graphics.inc
- `Common_EventScript_SetupRivalGfxId`

## Scripts (112)
### LittlerootTown_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LittlerootTown_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, LittlerootTown_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, LittlerootTown_OnWarp
```
### LittlerootTown_OnTransition
```
setflag FLAG_VISITED_LITTLEROOT_TOWN
call Common_EventScript_SetupRivalGfxId
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 2, LittlerootTown_EventScript_MoveMomToMaysDoor
call_if_unset FLAG_RESCUED_BIRCH, LittlerootTown_EventScript_SetTwinPos
call_if_eq VAR_LITTLEROOT_TOWN_STATE, 3, LittlerootTown_EventScript_SetMomStandingInFrontOfDoorPos
call_if_eq VAR_LITTLEROOT_HOUSES_STATE_MAY, 4, LittlerootTown_EventScript_SetExitedHouseAfterLatiSSTicketEvent
call_if_eq VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 4, LittlerootTown_EventScript_SetExitedHouseAfterLatiSSTicketEvent
call_if_eq VAR_OLDALE_RIVAL_STATE, 1, LittlerootTown_EventScript_MoveRivalFromOldale
call_if_eq VAR_LITTLEROOT_RIVAL_STATE, 3, LittlerootTown_EventScript_SetRivalLeftForRoute103
call_if_eq VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 1, LittlerootTown_EventScript_HideMapNamePopup
call_if_eq VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 2, LittlerootTown_EventScript_LeftLabAfterDexUpgrade
end
```
### LittlerootTown_EventScript_LeftLabAfterDexUpgrade
```
setvar VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 3
return
```
### LittlerootTown_EventScript_HideMapNamePopup
```
setflag FLAG_HIDE_MAP_NAME_POPUP
return
```
### LittlerootTown_EventScript_SetRivalLeftForRoute103
```
setflag FLAG_RIVAL_LEFT_FOR_ROUTE103
return
```
### LittlerootTown_EventScript_MoveRivalFromOldale
```
setvar VAR_OLDALE_RIVAL_STATE, 2
setflag FLAG_HIDE_OLDALE_TOWN_RIVAL
return
```
### LittlerootTown_EventScript_SetExitedHouseAfterLatiSSTicketEvent
```
setvar VAR_LITTLEROOT_HOUSES_STATE_MAY, 5
setvar VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 5
return
```
### LittlerootTown_EventScript_MoveMomToMaysDoor
```
setobjectxyperm LOCALID_LITTLEROOT_MOM, 14, 8
return
```
### LittlerootTown_EventScript_SetTwinPos
```
goto_if_eq VAR_LITTLEROOT_TOWN_STATE, 0, LittlerootTown_EventScript_SetTwinGuardingRoutePos
setobjectxyperm LOCALID_LITTLEROOT_TWIN, 10, 1
setobjectmovementtype LOCALID_LITTLEROOT_TWIN, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_EventScript_SetTwinGuardingRoutePos
```
setobjectxyperm LOCALID_LITTLEROOT_TWIN, 7, 2
setobjectmovementtype LOCALID_LITTLEROOT_TWIN, MOVEMENT_TYPE_FACE_DOWN
return
```
### LittlerootTown_EventScript_SetMomStandingInFrontOfDoorPos
```
clearflag FLAG_HIDE_LITTLEROOT_TOWN_MOM_OUTSIDE
setobjectmovementtype LOCALID_LITTLEROOT_MOM, MOVEMENT_TYPE_FACE_DOWN
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_SetMomInFrontOfDoorMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_SetMomInFrontOfDoorFemale
return
```
### LittlerootTown_EventScript_SetMomInFrontOfDoorMale
```
setobjectxyperm LOCALID_LITTLEROOT_MOM, 5, 9
return
```
### LittlerootTown_EventScript_SetMomInFrontOfDoorFemale
```
setobjectxyperm LOCALID_LITTLEROOT_MOM, 14, 9
return
```
### LittlerootTown_OnFrame
```
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 1, LittlerootTown_EventScript_StepOffTruckMale
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 2, LittlerootTown_EventScript_StepOffTruckFemale
map_script_2 VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 1, LittlerootTown_EventScript_BeginDexUpgradeScene
```
### LittlerootTown_EventScript_StepOffTruckMale
```
lockall
setvar VAR_0x8004, 5
setvar VAR_0x8005, 8
call LittlerootTown_EventScript_GoInsideWithMom
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK
warpsilent MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F, 8, 8
waitstate
releaseall
end
```
### LittlerootTown_EventScript_StepOffTruckFemale
```
lockall
setvar VAR_0x8004, 14
setvar VAR_0x8005, 8
call LittlerootTown_EventScript_GoInsideWithMom
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK
warpsilent MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F, 2, 8
waitstate
releaseall
end
```
### LittlerootTown_EventScript_GoInsideWithMom
```
delay 15
playse SE_LEDGE
applymovement LOCALID_PLAYER, LittlerootTown_Movement_PlayerStepOffTruck
waitmovement 0
opendoor VAR_0x8004, VAR_0x8005
waitdooranim
addobject LOCALID_LITTLEROOT_MOM
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitHouse
waitmovement 0
closedoor VAR_0x8004, VAR_0x8005
waitdooranim
delay 10
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerAtTruck
waitmovement 0
msgbox LittlerootTown_Text_OurNewHomeLetsGoInside, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachDoor
applymovement LOCALID_PLAYER, LittlerootTown_Movement_PlayerApproachDoor
waitmovement 0
opendoor VAR_0x8004, VAR_0x8005
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomEnterHouse
applymovement LOCALID_PLAYER, LittlerootTown_Movement_PlayerEnterHouse
waitmovement 0
setflag FLAG_HIDE_LITTLEROOT_TOWN_MOM_OUTSIDE
setvar VAR_LITTLEROOT_INTRO_STATE, 3
hideplayer
closedoor VAR_0x8004, VAR_0x8005
waitdooranim
clearflag FLAG_HIDE_LITTLEROOT_TOWN_FAT_MAN
clearflag FLAG_HIDE_MAP_NAME_POPUP
return
```
### LittlerootTown_Movement_MomExitHouse
```
walk_down
step_end
```
### LittlerootTown_Movement_MomApproachPlayerAtTruck
```
walk_down
walk_in_place_faster_left
step_end
```
### LittlerootTown_Movement_MomApproachDoor
```
delay_16
delay_8
walk_up
step_end
```
### LittlerootTown_Movement_MomEnterHouse
```
walk_up
set_invisible
step_end
```
### LittlerootTown_Movement_PlayerApproachDoor
```
delay_16
delay_8
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_PlayerEnterHouse
```
walk_up
walk_up
step_end
```
### LittlerootTown_Movement_PlayerStepOffTruck
```
jump_right
delay_16
delay_16
delay_16
step_end
```
### LittlerootTown_EventScript_BeginDexUpgradeScene
```
lockall
playse SE_PIN
applymovement LOCALID_LITTLEROOT_BIRCH, Common_Movement_ExclamationMark
waitmovement 0
delay 80
msgbox LittlerootTown_Text_BirchSomethingToShowYouAtLab, MSGBOX_DEFAULT
closemessage
clearflag FLAG_HIDE_LITTLEROOT_TOWN_RIVAL
clearflag FLAG_HIDE_LITTLEROOT_TOWN_BIRCH
delay 20
clearflag FLAG_HIDE_MAP_NAME_POPUP
warp MAP_LITTLEROOT_TOWN_PROFESSOR_BIRCHS_LAB, 6, 5
waitstate
releaseall
end
```
### LittlerootTown_OnWarp
```
map_script_2 VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 1, LittlerootTown_EventScript_SetRivalBirchPosForDexUpgrade
```
### LittlerootTown_EventScript_SetRivalBirchPosForDexUpgrade
```
addobject LOCALID_LITTLEROOT_BIRCH
addobject LOCALID_LITTLEROOT_RIVAL
checkplayergender
goto_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_SetRivalBirchPosForDexUpgradeMale
goto LittlerootTown_EventScript_SetRivalBirchPosForDexUpgradeFemale
end
```
### LittlerootTown_EventScript_SetRivalBirchPosForDexUpgradeMale
```
setobjectxy LOCALID_LITTLEROOT_RIVAL, 6, 10
setobjectxy LOCALID_LITTLEROOT_BIRCH, 5, 10
end
```
### LittlerootTown_EventScript_SetRivalBirchPosForDexUpgradeFemale
```
setobjectxy LOCALID_LITTLEROOT_RIVAL, 13, 10
setobjectxy LOCALID_LITTLEROOT_BIRCH, 14, 10
end
```
### LittlerootTown_EventScript_FatMan
```
msgbox LittlerootTown_Text_CanUsePCToStoreItems, MSGBOX_NPC
end
```
### LittlerootTown_EventScript_Boy
```
msgbox LittlerootTown_Text_BirchSpendsDaysInLab, MSGBOX_NPC
end
```
### LittlerootTown_EventScript_Twin
```
lock
faceplayer
goto_if_set FLAG_ADVENTURE_STARTED, LittlerootTown_EventScript_GoodLuck
goto_if_set FLAG_RESCUED_BIRCH, LittlerootTown_EventScript_YouSavedBirch
goto_if_ne VAR_LITTLEROOT_TOWN_STATE, 0, LittlerootTown_EventScript_GoSaveBirch
msgbox LittlerootTown_Text_IfYouGoInGrassPokemonWillJumpOut, MSGBOX_DEFAULT
release
end
```
### LittlerootTown_EventScript_GoSaveBirch
```
special GetPlayerBigGuyGirlString
msgbox LittlerootTown_Text_CanYouGoSeeWhatsHappening, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_LITTLEROOT_TWIN, Common_Movement_FaceOriginalDirection
waitmovement 0
setvar VAR_LITTLEROOT_TOWN_STATE, 2
release
end
```
### LittlerootTown_EventScript_YouSavedBirch
```
special GetPlayerBigGuyGirlString
msgbox LittlerootTown_Text_YouSavedBirch, MSGBOX_DEFAULT
release
end
```
### LittlerootTown_EventScript_GoodLuck
```
msgbox LittlerootTown_Text_GoodLuckCatchingPokemon, MSGBOX_DEFAULT
release
end
```
### LittlerootTown_EventScript_NeedPokemonTriggerLeft
```
lockall
applymovement LOCALID_LITTLEROOT_TWIN, LittlerootTown_Movement_TwinApproachPlayerLeft
waitmovement 0
call LittlerootTown_EventScript_DangerousWithoutPokemon
applymovement LOCALID_LITTLEROOT_TWIN, LittlerootTown_Movement_TwinReturnLeft
waitmovement 0
releaseall
end
```
### LittlerootTown_EventScript_DangerousWithoutPokemon
```
msgbox LittlerootTown_Text_IfYouGoInGrassPokemonWillJumpOut, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_LITTLEROOT_TWIN, LittlerootTown_Movement_TwinPushPlayerFromRoute
applymovement LOCALID_PLAYER, LittlerootTown_Movement_PushPlayerBackFromRoute
waitmovement 0
msgbox LittlerootTown_Text_DangerousIfYouDontHavePokemon, MSGBOX_DEFAULT
closemessage
return
```
### LittlerootTown_Movement_TwinApproachPlayerLeft
```
face_right
delay_8
disable_jump_landing_ground_effect
jump_in_place_right
delay_8
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_up
walk_fast_up
walk_fast_left
face_down
step_end
```
### LittlerootTown_Movement_TwinPushPlayerFromRoute
```
walk_down
step_end
```
### LittlerootTown_Movement_TwinReturnLeft
```
walk_right
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_up
walk_in_place_faster_down
step_end
```
### LittlerootTown_Movement_PushPlayerBackFromRoute
```
lock_facing_direction
walk_down
unlock_facing_direction
step_end
```
### LittlerootTown_EventScript_NeedPokemonTriggerRight
```
lockall
applymovement LOCALID_LITTLEROOT_TWIN, LittlerootTown_Movement_TwinApproachPlayerRight
waitmovement 0
call LittlerootTown_EventScript_DangerousWithoutPokemon
applymovement LOCALID_LITTLEROOT_TWIN, LittlerootTown_Movement_TwinReturnRight
waitmovement 0
releaseall
end
```
### LittlerootTown_Movement_TwinApproachPlayerRight
```
face_right
delay_8
disable_jump_landing_ground_effect
jump_in_place_right
delay_8
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_up
walk_fast_up
walk_fast_right
face_down
step_end
```
### LittlerootTown_Movement_TwinReturnRight
```
walk_left
walk_down
walk_left
walk_left
walk_left
walk_in_place_faster_down
step_end
```
### LittlerootTown_EventScript_GoSaveBirchTrigger
```
lockall
applymovement LOCALID_LITTLEROOT_TWIN, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
special GetPlayerBigGuyGirlString
msgbox LittlerootTown_Text_CanYouGoSeeWhatsHappening, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_LITTLEROOT_TWIN, Common_Movement_FaceOriginalDirection
waitmovement 0
setvar VAR_LITTLEROOT_TOWN_STATE, 2
releaseall
end
```
### LittlerootTown_EventScript_TownSign
```
msgbox LittlerootTown_Text_TownSign, MSGBOX_SIGN
end
```
### LittlerootTown_EventScript_BirchsLabSign
```
msgbox LittlerootTown_Text_ProfBirchsLab, MSGBOX_SIGN
end
```
### LittlerootTown_EventScript_BrendansHouseSign
```
lockall
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_PlayersHouseSignMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_BirchsHouseSignFemale
releaseall
end
```
### LittlerootTown_EventScript_PlayersHouseSignMale
```
msgbox LittlerootTown_Text_PlayersHouse, MSGBOX_DEFAULT
return
```
### LittlerootTown_EventScript_BirchsHouseSignFemale
```
msgbox LittlerootTown_Text_ProfBirchsHouse, MSGBOX_DEFAULT
return
```
### LittlerootTown_EventScript_MaysHouseSign
```
lockall
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_BirchsHouseSignMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_PlayersHouseSignFemale
releaseall
end
```
### LittlerootTown_EventScript_BirchsHouseSignMale
```
msgbox LittlerootTown_Text_ProfBirchsHouse, MSGBOX_DEFAULT
return
```
### LittlerootTown_EventScript_PlayersHouseSignFemale
```
msgbox LittlerootTown_Text_PlayersHouse, MSGBOX_DEFAULT
return
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger0
```
lockall
setvar VAR_0x8008, 0
setobjectxy LOCALID_LITTLEROOT_MOM, 10, 9
goto LittlerootTown_EventScript_GiveRunningShoesTrigger
end
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger1
```
lockall
setvar VAR_0x8008, 1
setobjectxy LOCALID_LITTLEROOT_MOM, 11, 9
goto LittlerootTown_EventScript_GiveRunningShoesTrigger
end
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger2
```
lockall
setvar VAR_0x8008, 2
goto LittlerootTown_EventScript_GiveRunningShoesTrigger
end
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger3
```
lockall
setvar VAR_0x8008, 3
goto LittlerootTown_EventScript_GiveRunningShoesTrigger
end
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger4
```
lockall
setvar VAR_0x8008, 4
goto LittlerootTown_EventScript_GiveRunningShoesTrigger
end
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger5
```
lockall
setvar VAR_0x8008, 5
goto LittlerootTown_EventScript_GiveRunningShoesTrigger
end
```
### LittlerootTown_EventScript_GiveRunningShoesTrigger
```
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_MomNoticePlayerMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_MomNoticePlayerFemale
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_SetHomeDoorCoordsMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_SetHomeDoorCoordsFemale
msgbox LittlerootTown_Text_WaitPlayer, MSGBOX_DEFAULT
closemessage
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_MomApproachPlayerMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_MomApproachPlayerFemale
call LittlerootTown_EventScript_GiveRunningShoes
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_MomReturnHomeMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_MomReturnHomeFemale
goto LittlerootTown_EventScript_SetReceivedRunningShoes
end
```
### LittlerootTown_EventScript_SetHomeDoorCoordsMale
```
setvar VAR_0x8009, 5
setvar VAR_0x800A, 8
return
```
### LittlerootTown_EventScript_SetHomeDoorCoordsFemale
```
setvar VAR_0x8009, 14
setvar VAR_0x800A, 8
return
```
### LittlerootTown_EventScript_MomNoticePlayerMale
```
applymovement LOCALID_LITTLEROOT_MOM, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
return
```
### LittlerootTown_EventScript_MomNoticePlayerFemale
```
applymovement LOCALID_LITTLEROOT_MOM, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerMale
```
call_if_eq VAR_0x8008, 0, LittlerootTown_EventScript_MomApproachPlayer0
call_if_eq VAR_0x8008, 1, LittlerootTown_EventScript_MomApproachPlayer1
call_if_eq VAR_0x8008, 2, LittlerootTown_EventScript_MomApproachPlayerMale2
call_if_eq VAR_0x8008, 3, LittlerootTown_EventScript_MomApproachPlayerMale3
call_if_eq VAR_0x8008, 4, LittlerootTown_EventScript_MomApproachPlayerMale4
call_if_eq VAR_0x8008, 5, LittlerootTown_EventScript_MomApproachPlayerMale5
return
```
### LittlerootTown_EventScript_MomApproachPlayerFemale
```
call_if_eq VAR_0x8008, 0, LittlerootTown_EventScript_MomApproachPlayer0
call_if_eq VAR_0x8008, 1, LittlerootTown_EventScript_MomApproachPlayer1
call_if_eq VAR_0x8008, 2, LittlerootTown_EventScript_MomApproachPlayerFemale2
call_if_eq VAR_0x8008, 3, LittlerootTown_EventScript_MomApproachPlayerFemale3
call_if_eq VAR_0x8008, 4, LittlerootTown_EventScript_MomApproachPlayerFemale4
call_if_eq VAR_0x8008, 5, LittlerootTown_EventScript_MomApproachPlayerFemale5
return
```
### LittlerootTown_EventScript_MomApproachPlayer0
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayer0
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayer1
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayer1
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerMale2
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerMale2
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerMale3
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerMale3
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerMale4
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerMale4
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerMale5
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerMale5
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerFemale2
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerFemale2
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerFemale3
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerFemale3
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerFemale4
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerFemale4
waitmovement 0
return
```
### LittlerootTown_EventScript_MomApproachPlayerFemale5
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomApproachPlayerFemale5
waitmovement 0
return
```
### LittlerootTown_EventScript_MomReturnHomeMale
```
call_if_eq VAR_0x8008, 0, LittlerootTown_EventScript_MomReturnHome0
call_if_eq VAR_0x8008, 1, LittlerootTown_EventScript_MomReturnHome1
call_if_eq VAR_0x8008, 2, LittlerootTown_EventScript_MomReturnHomeMale2
call_if_eq VAR_0x8008, 3, LittlerootTown_EventScript_MomReturnHomeMale3
call_if_eq VAR_0x8008, 4, LittlerootTown_EventScript_MomReturnHomeMale4
call_if_eq VAR_0x8008, 5, LittlerootTown_EventScript_MomReturnHomeMale5
return
```
### LittlerootTown_EventScript_MomReturnHomeFemale
```
call_if_eq VAR_0x8008, 0, LittlerootTown_EventScript_MomReturnHome0
call_if_eq VAR_0x8008, 1, LittlerootTown_EventScript_MomReturnHome1
call_if_eq VAR_0x8008, 2, LittlerootTown_EventScript_MomReturnHomeFemale2
call_if_eq VAR_0x8008, 3, LittlerootTown_EventScript_MomReturnHomeFemale3
call_if_eq VAR_0x8008, 4, LittlerootTown_EventScript_MomReturnHomeFemale4
call_if_eq VAR_0x8008, 5, LittlerootTown_EventScript_MomReturnHomeFemale5
return
```
### LittlerootTown_EventScript_MomReturnHome0
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHome0
waitmovement 0
return
```
### LittlerootTown_EventScript_MomReturnHome1
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHome1
waitmovement 0
return
```
### LittlerootTown_EventScript_MomReturnHomeMale2
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeMale2
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeMale3
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeMale3
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeMale4
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeMale4
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeMale5
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeMale5
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeFemale2
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeFemale2
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeFemale3
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeFemale3
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeFemale4
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeFemale4
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_EventScript_MomReturnHomeFemale5
```
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomReturnHomeFemale5
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
return
```
### LittlerootTown_Movement_MomApproachPlayer0
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### LittlerootTown_Movement_MomApproachPlayer1
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### LittlerootTown_Movement_MomApproachPlayerMale2
```
walk_right
walk_right
walk_right
walk_right
step_end
```
### LittlerootTown_Movement_MomApproachPlayerMale3
```
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### LittlerootTown_Movement_MomApproachPlayerMale4
```
walk_right
walk_right
step_end
```
### LittlerootTown_Movement_MomApproachPlayerMale5
```
walk_right
walk_right
walk_right
step_end
```
### LittlerootTown_Movement_MomApproachPlayerFemale2
```
walk_left
walk_left
walk_left
step_end
```
### LittlerootTown_Movement_MomApproachPlayerFemale3
```
walk_left
walk_left
step_end
```
### LittlerootTown_Movement_MomApproachPlayerFemale4
```
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### LittlerootTown_Movement_MomApproachPlayerFemale5
```
walk_left
walk_left
walk_left
walk_left
step_end
```
### LittlerootTown_Movement_MomReturnHome0
```
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### LittlerootTown_Movement_MomReturnHome1
```
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### LittlerootTown_Movement_MomReturnHomeMale2
```
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeMale3
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeMale4
```
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeMale5
```
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeFemale2
```
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeFemale3
```
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeFemale4
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomReturnHomeFemale5
```
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### LittlerootTown_Movement_MomExitThroughDoor
```
walk_up
step_end
```
### LittlerootTown_EventScript_Mom
```
lock
faceplayer
checkplayergender
call_if_eq VAR_RESULT, MALE, LittlerootTown_EventScript_SetHomeDoorCoordsMale
call_if_eq VAR_RESULT, FEMALE, LittlerootTown_EventScript_SetHomeDoorCoordsFemale
call LittlerootTown_EventScript_GiveRunningShoes
applymovement LOCALID_LITTLEROOT_MOM, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
opendoor VAR_0x8009, VAR_0x800A
waitdooranim
applymovement LOCALID_LITTLEROOT_MOM, LittlerootTown_Movement_MomExitThroughDoor
waitmovement 0
hideobjectat LOCALID_LITTLEROOT_MOM, MAP_LITTLEROOT_TOWN
closedoor VAR_0x8009, VAR_0x800A
waitdooranim
goto LittlerootTown_EventScript_SetReceivedRunningShoes
end
```
### LittlerootTown_EventScript_SetReceivedRunningShoes
```
removeobject LOCALID_LITTLEROOT_MOM
setflag FLAG_SYS_B_DASH
setvar VAR_LITTLEROOT_TOWN_STATE, 4
release
end
```
### LittlerootTown_EventScript_GiveRunningShoes
```
msgbox LittlerootTown_Text_WearTheseRunningShoes, MSGBOX_DEFAULT
playfanfare MUS_OBTAIN_ITEM
message LittlerootTown_Text_SwitchShoesWithRunningShoes
waitfanfare
setflag FLAG_RECEIVED_RUNNING_SHOES
msgbox LittlerootTown_Text_ExplainRunningShoes, MSGBOX_DEFAULT
msgbox LittlerootTown_Text_ComeHomeIfAnythingHappens, MSGBOX_DEFAULT
closemessage
delay 30
return
```

## Textes (18)
### LittlerootTown_Text_OurNewHomeLetsGoInside
```
MAMAN: {PLAYER}, on est là, chouchou!\pÇa doit être fatigant de voyager\navec les meubles dans le camion\lde déménagement.\pVoilà, c'est BOURG-EN-VOL.\pTu trouves ça comment?\nC'est ici que nous allons habiter!\pÇa paraît un peu pittoresque, mais\nnous devrions bien nous y sentir,\ltu ne penses pas?\pEt tu as ta propre chambre, {PLAYER}!\nAllons à l'intérieur.$
```
### LittlerootTown_Text_WaitPlayer
```
MAMAN: Attends, {PLAYER}!$
```
### LittlerootTown_Text_WearTheseRunningShoes
```
MAMAN: {PLAYER}! {PLAYER}! As-tu fait\nconnaissance avec le PROF. SEKO?\pOh! Quel adorable POKéMON! Le PROF.\nSEKO te l'a donné? C'est gentil!\pTu es bien comme ton père. Tu sembles\nêtre en accord avec les POKéMON!\pTiens, chouchou! Si tu pars à\nl'aventure, mets ces CHAUSSURES\lDE SPORT.\pElles vont te faire aller plus vite!$
```
### LittlerootTown_Text_SwitchShoesWithRunningShoes
```
{PLAYER} enlève ses chaussures pour\nmettre les CHAUSSURES DE SPORT.$
```
### LittlerootTown_Text_ExplainRunningShoes
```
MAMAN: {PLAYER}, ces chaussures\ns'accompagnent d'un mode d'emploi.\p“Avec ces CHAUSSURES DE SPORT,\nappuyez sur le bouton B pour aller\lplus vite!”\p“Une fois les CHAUSSURES DE SPORT\nenfilées, vous pourrez courir dehors!”$
```
### LittlerootTown_Text_ComeHomeIfAnythingHappens
```
… … … … … … … …\n… … … … … … … …\pQuand je pense que tu as ton propre\nPOKéMON maintenant…\pTon père va être ravi.\pMais je t'en prie, fais attention.\nSi ça se passe mal, tu peux rentrer.\pVas-y, va tous les attraper, chouchou!$
```
### LittlerootTown_Text_CanUsePCToStoreItems
```
Si tu utilises un PC, tu peux stocker\ndes objets et des POKéMON.\pLe pouvoir de la science est incroyable!$
```
### LittlerootTown_Text_BirchSpendsDaysInLab
```
Le PROF. SEKO passe des journées\nentières dans son LABO à étudier et\ltout d'un coup, il part faire des\lrecherches dans la nature…\pMais quand est-ce que le PROF. SEKO\narrive à passer du temps chez lui?$
```
### LittlerootTown_Text_IfYouGoInGrassPokemonWillJumpOut
```
Hum, hum!\pSi tu t'aventures dans les hautes\nherbes, tu risques de te faire attaquer\lpar des POKéMON sauvages.$
```
### LittlerootTown_Text_DangerousIfYouDontHavePokemon
```
C'est dangereux si tu voyages sans\ntes propres POKéMON.$
```
### LittlerootTown_Text_CanYouGoSeeWhatsHappening
```
Hum, salut!\pIl y a des POKéMON effrayants dehors,\nje peux entendre leurs cris d'ici!\pJ'aimerais bien aller voir mais je n'ai\naucun POKéMON…\pTu pourrais aller voir pour moi ce\nqui se passe?$
```
### LittlerootTown_Text_YouSavedBirch
```
Tu as sauvé le PROF. SEKO! Je t'en suis\ntrès reconnaissante!$
```
### LittlerootTown_Text_GoodLuckCatchingPokemon
```
Tu vas attraper des POKéMON?\nBonne chance!$
```
### LittlerootTown_Text_TownSign
```
BOURG-EN-VOL\n“Une ville qui garde son éclat.”$
```
### LittlerootTown_Text_ProfBirchsLab
```
LABO POKéMON DU PROF. SEKO$
```
### LittlerootTown_Text_PlayersHouse
```
MAISON DE {PLAYER}$
```
### LittlerootTown_Text_ProfBirchsHouse
```
MAISON DU PROF. SEKO$
```
### LittlerootTown_Text_BirchSomethingToShowYouAtLab
```
PROF. SEKO: Tiens, {PLAYER}{KUN}!\nToutes mes félicitations pour\ltes exploits!\pJ'ai su que tu avais quelque\nchose de spécial dès notre rencontre.\lMais je n'imaginais pas tout ça!\pAu fait, tu as toujours le POKéDEX\nque je t'ai donné?\pIl faut que je te montre quelque chose,\nsuis-moi au LABO.$
```

# PetalburgCity

## Métadonnées
- **id** : `MAP_PETALBURG_CITY`
- **layout** : `LAYOUT_PETALBURG_CITY`
- **music** : `MUS_PETALBURG`
- **region_map_section** : `MAPSEC_PETALBURG_CITY`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_CITY`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset -50) → `MAP_ROUTE104`
- right (offset 10) → `MAP_ROUTE102`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 16,18 | `MOVEMENT_TYPE_WANDER_AROUND` | `PetalburgCity_EventScript_WallysMom` | `FLAG_HIDE_PETALBURG_CITY_WALLYS_MOM` |
| `LOCALID_PETALBURG_WALLY` | `OBJ_EVENT_GFX_WALLY` | 15,10 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_PETALBURG_CITY_WALLY` |
| `LOCALID_PETALBURG_BOY` | `OBJ_EVENT_GFX_BOY_1` | 8,22 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgCity_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 20,10 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `PetalburgCity_EventScript_Gentleman` | `0` |
| `LOCALID_PETALBURG_WALLYS_DAD` | `OBJ_EVENT_GFX_POKEFAN_M` | 15,10 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_PETALBURG_CITY_WALLYS_DAD` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 19,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgCity_EventScript_ItemMaxRevive` | `FLAG_ITEM_PETALBURG_CITY_MAX_REVIVE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,28 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgCity_EventScript_ItemEther` | `FLAG_ITEM_PETALBURG_CITY_ETHER` |
| `LOCALID_GYM_BOY` | `OBJ_EVENT_GFX_BOY_2` | 12,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgCity_EventScript_GymBoy` | `0` |
| `LOCALID_PETALBURG_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 13,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_HIDE_PETALBURG_CITY_SCOTT` |

## Warps (6)
- #0 (10,19) → `MAP_PETALBURG_CITY_HOUSE1` warp #0
- #1 (7,5) → `MAP_PETALBURG_CITY_WALLYS_HOUSE` warp #0
- #2 (15,8) → `MAP_PETALBURG_CITY_GYM` warp #0
- #3 (20,16) → `MAP_PETALBURG_CITY_POKEMON_CENTER_1F` warp #0
- #4 (20,24) → `MAP_PETALBURG_CITY_HOUSE2` warp #0
- #5 (25,12) → `MAP_PETALBURG_CITY_MART` warp #0

## Coord events / triggers (8)
- (8,10) → `PetalburgCity_EventScript_ShowGymToPlayer0` (si `VAR_PETALBURG_CITY_STATE` == `0`)
- (8,11) → `PetalburgCity_EventScript_ShowGymToPlayer1` (si `VAR_PETALBURG_CITY_STATE` == `0`)
- (8,12) → `PetalburgCity_EventScript_ShowGymToPlayer2` (si `VAR_PETALBURG_CITY_STATE` == `0`)
- (8,13) → `PetalburgCity_EventScript_ShowGymToPlayer3` (si `VAR_PETALBURG_CITY_STATE` == `0`)
- (4,10) → `PetalburgCity_EventScript_Scott0` (si `VAR_SCOTT_PETALBURG_ENCOUNTER` == `0`)
- (4,11) → `PetalburgCity_EventScript_Scott1` (si `VAR_SCOTT_PETALBURG_ENCOUNTER` == `0`)
- (4,12) → `PetalburgCity_EventScript_Scott2` (si `VAR_SCOTT_PETALBURG_ENCOUNTER` == `0`)
- (4,13) → `PetalburgCity_EventScript_Scott3` (si `VAR_SCOTT_PETALBURG_ENCOUNTER` == `0`)

## BG events / signs (8)
- (17,10) [sign] → `PetalburgCity_EventScript_GymSign`
- (26,12) [sign] → `Common_EventScript_ShowPokemartSign`
- (21,16) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (17,16) [sign] → `PetalburgCity_EventScript_CitySign`
- (22,16) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (27,12) [sign] → `Common_EventScript_ShowPokemartSign`
- (8,9) [sign] → `PetalburgCity_EventScript_WallyHouseSign`
- (11,29) [hidden_item] → ``

## Flags référencés (4)
- `FLAG_DONT_TRANSITION_MUSIC`
- `FLAG_HIDE_MAP_NAME_POPUP`
- `FLAG_HIDE_PETALBURG_CITY_WALLYS_DAD`
- `FLAG_VISITED_PETALBURG_CITY`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_PETALBURG_CITY_STATE`
- `VAR_PETALBURG_GYM_STATE`
- `VAR_SCOTT_PETALBURG_ENCOUNTER`
- `VAR_SCOTT_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route102_Text_LetsGoBack`
- `Route102_Text_WallyIDidIt`
- `Route102_Text_WatchMeCatchPokemon`

## Scripts (67)
### PetalburgCity_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, PetalburgCity_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, PetalburgCity_OnFrame
```
### PetalburgCity_OnTransition
```
setflag FLAG_VISITED_PETALBURG_CITY
call_if_eq VAR_PETALBURG_CITY_STATE, 0, PetalburgCity_EventScript_MoveGymBoyToWestEntrance
call_if_eq VAR_PETALBURG_CITY_STATE, 2, PetalburgCity_EventScript_DisableMapNameAndMusic
call_if_eq VAR_PETALBURG_CITY_STATE, 4, PetalburgCity_EventScript_DisableMapNameAndMusic
call_if_eq VAR_PETALBURG_GYM_STATE, 8, PetalburgCity_EventScript_SetGymDoorsUnlocked
end
```
### PetalburgCity_EventScript_MoveGymBoyToWestEntrance
```
setobjectxyperm LOCALID_GYM_BOY, 5, 11
return
```
### PetalburgCity_EventScript_DisableMapNameAndMusic
```
setflag FLAG_HIDE_MAP_NAME_POPUP
savebgm MUS_FOLLOW_ME
return
```
### PetalburgCity_EventScript_SetGymDoorsUnlocked
```
setvar VAR_PETALBURG_GYM_STATE, 7
return
```
### PetalburgCity_OnFrame
```
map_script_2 VAR_PETALBURG_CITY_STATE, 2, PetalburgCity_EventScript_WallyTutorial
map_script_2 VAR_PETALBURG_CITY_STATE, 4, PetalburgCity_EventScript_WalkToWallyHouse
```
### PetalburgCity_EventScript_WallyTutorial
```
lockall
special SavePlayerParty
special LoadWallyZigzagoon
applymovement LOCALID_PETALBURG_WALLY, PetalburgCity_Movement_WallyTutorialWally
applymovement LOCALID_PLAYER, PetalburgCity_Movement_WallyTutorialPlayer
waitmovement 0
msgbox Route102_Text_WatchMeCatchPokemon, MSGBOX_DEFAULT
special StartWallyTutorialBattle
msgbox Route102_Text_WallyIDidIt, MSGBOX_DEFAULT
applymovement LOCALID_PETALBURG_WALLY, Common_Movement_WalkInPlaceFasterLeft, MAP_PETALBURG_CITY
waitmovement LOCALID_PETALBURG_WALLY, MAP_PETALBURG_CITY
msgbox Route102_Text_LetsGoBack, MSGBOX_DEFAULT
closemessage
clearflag FLAG_HIDE_MAP_NAME_POPUP
setvar VAR_PETALBURG_CITY_STATE, 3
fadedefaultbgm
clearflag FLAG_DONT_TRANSITION_MUSIC
special LoadPlayerParty
setvar VAR_PETALBURG_GYM_STATE, 1
warp MAP_PETALBURG_CITY_GYM, 4, 108
waitstate
releaseall
end
```
### PetalburgCity_EventScript_WalkToWallyHouse
```
lockall
setflag FLAG_HIDE_MAP_NAME_POPUP
applymovement LOCALID_PETALBURG_WALLYS_DAD, PetalburgCity_Movement_WalkToWallyHouseWallysDad
applymovement LOCALID_PLAYER, PetalburgCity_Movement_WalkToWallyHousePlayer
waitmovement 0
setvar VAR_0x8004, 7
setvar VAR_0x8005, 5
opendoor VAR_0x8004, VAR_0x8005
waitdooranim
applymovement LOCALID_PETALBURG_WALLYS_DAD, PetalburgCity_Movement_WalkInsideHouseWallysDad
applymovement LOCALID_PLAYER, PetalburgCity_Movement_WalkInsideHousePlayer
waitmovement 0
setflag FLAG_HIDE_PETALBURG_CITY_WALLYS_DAD
hideobjectat LOCALID_PLAYER, MAP_PETALBURG_CITY
closedoor VAR_0x8004, VAR_0x8005
waitdooranim
clearflag FLAG_HIDE_MAP_NAME_POPUP
fadedefaultbgm
clearflag FLAG_DONT_TRANSITION_MUSIC
warp MAP_PETALBURG_CITY_WALLYS_HOUSE, 2, 4
waitstate
releaseall
end
```
### PetalburgCity_EventScript_Boy
```
lock
faceplayer
msgbox PetalburgCity_Text_WaterReflection, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_BOY, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### PetalburgCity_EventScript_WallysMom
```
msgbox PetalburgCity_Text_WhereIsWally, MSGBOX_NPC
end
```
### PetalburgCity_Movement_WalkToWallyHousePlayer
```
delay_8
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### PetalburgCity_Movement_WalkInsideHousePlayer
```
walk_up
walk_up
step_end
```
### PetalburgCity_Movement_WalkToWallyHouseWallysDad
```
delay_8
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### PetalburgCity_Movement_WalkInsideHouseWallysDad
```
walk_up
set_invisible
step_end
```
### PetalburgCity_Movement_WallyTutorialPlayer
```
delay_8
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_in_place_faster_right
step_end
```
### PetalburgCity_Movement_WallyTutorialWally
```
delay_8
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_right
delay_16
walk_in_place_faster_up
delay_16
delay_16
walk_in_place_faster_right
step_end
```
### PetalburgCity_EventScript_GymSign
```
msgbox PetalburgCity_Text_GymSign, MSGBOX_SIGN
end
```
### PetalburgCity_EventScript_CitySign
```
msgbox PetalburgCity_Text_CitySign, MSGBOX_SIGN
end
```
### PetalburgCity_EventScript_Gentleman
```
msgbox PetalburgCity_Text_FullPartyExplanation, MSGBOX_NPC
end
```
### PetalburgCity_EventScript_WallyHouseSign
```
msgbox PetalburgCity_Text_WallyHouseSign, MSGBOX_SIGN
end
```
### PetalburgCity_EventScript_ShowGymToPlayer0
```
lockall
setvar VAR_0x8008, 0
goto PetalburgCity_EventScript_ShowGymToPlayer
end
```
### PetalburgCity_EventScript_ShowGymToPlayer1
```
lockall
setvar VAR_0x8008, 1
goto PetalburgCity_EventScript_ShowGymToPlayer
end
```
### PetalburgCity_EventScript_ShowGymToPlayer2
```
lockall
setvar VAR_0x8008, 2
goto PetalburgCity_EventScript_ShowGymToPlayer
end
```
### PetalburgCity_EventScript_ShowGymToPlayer3
```
lockall
setvar VAR_0x8008, 3
goto PetalburgCity_EventScript_ShowGymToPlayer
end
```
### PetalburgCity_EventScript_ShowGymToPlayer
```
applymovement LOCALID_GYM_BOY, Common_Movement_FacePlayer
waitmovement 0
playbgm MUS_FOLLOW_ME, FALSE
playse SE_PIN
applymovement LOCALID_GYM_BOY, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_GYM_BOY, Common_Movement_Delay48
waitmovement 0
call_if_eq VAR_0x8008, 0, PetalburgCity_EventScript_BoyApproachPlayer0
call_if_eq VAR_0x8008, 1, PetalburgCity_EventScript_BoyApproachPlayer1
call_if_eq VAR_0x8008, 2, PetalburgCity_EventScript_BoyApproachPlayer2
call_if_eq VAR_0x8008, 3, PetalburgCity_EventScript_BoyApproachPlayer3
msgbox PetalburgCity_Text_AreYouRookieTrainer, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8008, 0, PetalburgCity_EventScript_LeadPlayerToGym0
call_if_eq VAR_0x8008, 1, PetalburgCity_EventScript_LeadPlayerToGym1
call_if_eq VAR_0x8008, 2, PetalburgCity_EventScript_LeadPlayerToGym2
call_if_eq VAR_0x8008, 3, PetalburgCity_EventScript_LeadPlayerToGym3
msgbox PetalburgCity_Text_ThisIsPetalburgGym, MSGBOX_DEFAULT
applymovement LOCALID_GYM_BOY, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox PetalburgCity_Text_ThisIsGymSign, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyWalkAway
waitmovement 0
fadedefaultbgm
releaseall
end
```
### PetalburgCity_EventScript_BoyApproachPlayer0
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyApproachPlayer0
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### PetalburgCity_EventScript_BoyApproachPlayer1
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyApproachPlayer1
waitmovement 0
return
```
### PetalburgCity_EventScript_BoyApproachPlayer2
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyApproachPlayer2
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
return
```
### PetalburgCity_EventScript_BoyApproachPlayer3
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyApproachPlayer3
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
return
```
### PetalburgCity_EventScript_LeadPlayerToGym0
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyWalkToGym0
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWalkToGym0
waitmovement 0
return
```
### PetalburgCity_EventScript_LeadPlayerToGym1
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyWalkToGym1
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWalkToGym1
waitmovement 0
return
```
### PetalburgCity_EventScript_LeadPlayerToGym2
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyWalkToGym2
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWalkToGym2
waitmovement 0
return
```
### PetalburgCity_EventScript_LeadPlayerToGym3
```
applymovement LOCALID_GYM_BOY, PetalburgCity_Movement_BoyWalkToGym3
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWalkToGym3
waitmovement 0
return
```
### PetalburgCity_Movement_Delay48
```
delay_16
delay_16
delay_16
step_end
```
### PetalburgCity_Movement_BoyApproachPlayer0
```
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### PetalburgCity_Movement_BoyApproachPlayer1
```
walk_right
walk_right
step_end
```
### PetalburgCity_Movement_BoyApproachPlayer2
```
walk_right
walk_right
walk_right
walk_in_place_faster_down
step_end
```
### PetalburgCity_Movement_BoyApproachPlayer3
```
walk_down
walk_right
walk_right
walk_right
walk_in_place_faster_down
step_end
```
### PetalburgCity_Movement_BoyWalkToGym0
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_right
walk_in_place_faster_up
step_end
```
### PetalburgCity_Movement_BoyWalkToGym1
```
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_right
walk_in_place_faster_up
step_end
```
### PetalburgCity_Movement_BoyWalkToGym2
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_right
walk_in_place_faster_up
step_end
```
### PetalburgCity_Movement_BoyWalkToGym3
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_right
walk_in_place_faster_up
step_end
```
### PetalburgCity_Movement_BoyWalkAway
```
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_PlayerWalkToGym0
```
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
step_end
```
### PetalburgCity_Movement_PlayerWalkToGym1
```
delay_16
delay_16
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
step_end
```
### PetalburgCity_Movement_PlayerWalkToGym2
```
walk_up
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
step_end
```
### PetalburgCity_Movement_PlayerWalkToGym3
```
walk_up
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
step_end
```
### PetalburgCity_EventScript_Scott0
```
lockall
addobject LOCALID_PETALBURG_SCOTT
setvar VAR_0x8008, 0
setobjectxy LOCALID_PETALBURG_SCOTT, 13, 10
goto PetalburgCity_EventScript_Scott
end
```
### PetalburgCity_EventScript_Scott1
```
lockall
addobject LOCALID_PETALBURG_SCOTT
setvar VAR_0x8008, 1
setobjectxy LOCALID_PETALBURG_SCOTT, 13, 11
goto PetalburgCity_EventScript_Scott
end
```
### PetalburgCity_EventScript_Scott2
```
lockall
addobject LOCALID_PETALBURG_SCOTT
setvar VAR_0x8008, 2
setobjectxy LOCALID_PETALBURG_SCOTT, 13, 12
goto PetalburgCity_EventScript_Scott
end
```
### PetalburgCity_EventScript_Scott3
```
lockall
addobject LOCALID_PETALBURG_SCOTT
setvar VAR_0x8008, 3
setobjectxy LOCALID_PETALBURG_SCOTT, 13, 13
goto PetalburgCity_EventScript_Scott
end
```
### PetalburgCity_EventScript_Scott
```
applymovement LOCALID_PETALBURG_SCOTT, PetalburgCity_Movement_ScottStartWalkLeft
waitmovement 0
playse SE_PIN
applymovement LOCALID_PETALBURG_SCOTT, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_PETALBURG_SCOTT, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_PETALBURG_SCOTT, PetalburgCity_Movement_ScottApproachPlayer
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
setvar VAR_SCOTT_STATE, 1
msgbox PetalburgCity_Text_AreYouATrainer, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_SCOTT, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 30
msgbox PetalburgCity_Text_WellMaybeNot, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_SCOTT, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 30
msgbox PetalburgCity_Text_ImLookingForTalentedTrainers, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8008, 0, PetalburgCity_EventScript_ScottExit0
call_if_eq VAR_0x8008, 1, PetalburgCity_EventScript_ScottExit1
call_if_eq VAR_0x8008, 2, PetalburgCity_EventScript_ScottExit2
call_if_eq VAR_0x8008, 3, PetalburgCity_EventScript_ScottExit3
setvar VAR_SCOTT_PETALBURG_ENCOUNTER, 1
removeobject LOCALID_PETALBURG_SCOTT
releaseall
end
```
### PetalburgCity_EventScript_ScottExit0
```
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWatchScottExit0
applymovement LOCALID_PETALBURG_SCOTT, PetalburgCity_Movement_ScottExit0
waitmovement 0
return
```
### PetalburgCity_EventScript_ScottExit1
```
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWatchScottExit1
applymovement LOCALID_PETALBURG_SCOTT, PetalburgCity_Movement_ScottExit1
waitmovement 0
return
```
### PetalburgCity_EventScript_ScottExit2
```
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWatchScottExit2
applymovement LOCALID_PETALBURG_SCOTT, PetalburgCity_Movement_ScottExit2
waitmovement 0
return
```
### PetalburgCity_EventScript_ScottExit3
```
applymovement LOCALID_PLAYER, PetalburgCity_Movement_PlayerWatchScottExit3
applymovement LOCALID_PETALBURG_SCOTT, PetalburgCity_Movement_ScottExit3
waitmovement 0
return
```
### PetalburgCity_Movement_ScottStartWalkLeft
```
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_ScottApproachPlayer
```
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_ScottExit0
```
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_PlayerWatchScottExit0
```
delay_16
walk_in_place_faster_down
delay_16
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### PetalburgCity_Movement_ScottExit1
```
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_PlayerWatchScottExit1
```
delay_16
walk_in_place_faster_down
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### PetalburgCity_Movement_ScottExit2
```
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_PlayerWatchScottExit2
```
delay_16
walk_in_place_faster_down
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### PetalburgCity_Movement_ScottExit3
```
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### PetalburgCity_Movement_PlayerWatchScottExit3
```
delay_16
walk_in_place_faster_up
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### PetalburgCity_EventScript_GymBoy
```
msgbox PetalburgCity_Text_AreYouRookieTrainer, MSGBOX_NPC
end
```

## Textes (12)
### PetalburgCity_Text_WhereIsWally
```
Où est passé notre TIMMY?\pNous devons bientôt partir\npour VERGAZON…$
```
### PetalburgCity_Text_AreYouRookieTrainer
```
Ah! Tu es peut-être…\nun DRESSEUR qui débute?\pTu sais ce que font les DRESSEURS de\nPOKéMON en arrivant dans une ville?\pIls commencent par vérifier quel type\nd'ARENE se trouve dans la ville.$
```
### PetalburgCity_Text_ThisIsPetalburgGym
```
Tu vois? C'est l'ARENE de CLEMENTI.$
```
### PetalburgCity_Text_ThisIsGymSign
```
Ce panneau indique les ARENES. Cherche\nce signe quand tu veux en trouver une.$
```
### PetalburgCity_Text_WaterReflection
```
Mon visage se reflète dans l'eau.\pJe vois un grand sourire plein d'espoir…\pÇa pourrait aussi être l'expression d'un\nsilence lugubre luttant contre la peur…\pQu'exprime le reflet de ton visage?$
```
### PetalburgCity_Text_FullPartyExplanation
```
Disons que tu as six POKéMON.\nSi tu en attrapes un autre…\pIl est aussitôt envoyé dans une BOITE\nDE STOCKAGE par une connexion au PC.$
```
### PetalburgCity_Text_GymSign
```
ARENE POKéMON de CLEMENTI-VILLE\nCHAMPION: NORMAN\l“Un homme en quête de pouvoir!”$
```
### PetalburgCity_Text_CitySign
```
CLEMENTI-VILLE\n“Là où les gens vivent en harmonie\lavec la nature.”$
```
### PetalburgCity_Text_WallyHouseSign
```
MAISON DE TIMMY$
```
### PetalburgCity_Text_AreYouATrainer
```
Excuse-moi!\pLaisse-moi deviner…\nVu les vêtements que tu portes…\pTu serais pas un DRESSEUR\nPOKéMON par hasard?$
```
### PetalburgCity_Text_WellMaybeNot
```
… … … … … …\pHum… Peut-être pas.\nTes vêtements ne sont pas si sales.\pTu es soit un DRESSEUR débutant,\nsoit un gamin ordinaire.$
```
### PetalburgCity_Text_ImLookingForTalentedTrainers
```
Je parcours le monde à la recherche\nde DRESSEURS de talent.\pDésolé de t'avoir fait perdre ton temps.$
```

# Route119

## Métadonnées
- **id** : `MAP_ROUTE119`
- **layout** : `LAYOUT_ROUTE119`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_119`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset -40) → `MAP_ROUTE118`
- right (offset 0) → `MAP_FORTREE_CITY`

## Object events (43 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 24,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 25,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 26,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 12,123 | `MOVEMENT_TYPE_COPY_PLAYER_IN_GRASS` | `Route119_EventScript_Greg` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 26,123 | `MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE_IN_GRASS` | `Route119_EventScript_Taylor` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 5,125 | `MOVEMENT_TYPE_COPY_PLAYER_CLOCKWISE_IN_GRASS` | `Route119_EventScript_Donald` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 7,74 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route119_EventScript_Jackson` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 28,116 | `MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE_IN_GRASS` | `Route119_EventScript_Brent` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 35,83 | `MOVEMENT_TYPE_FACE_DOWN` | `Route119_EventScript_Catherine` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 34,122 | `MOVEMENT_TYPE_COPY_PLAYER_COUNTERCLOCKWISE_IN_GRASS` | `Route119_EventScript_Doug` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 17,128 | `MOVEMENT_TYPE_COPY_PLAYER_COUNTERCLOCKWISE_IN_GRASS` | `Route119_EventScript_Kent` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 28,14 | `MOVEMENT_TYPE_TREE_DISGUISE` | `Route119_EventScript_Yasu` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 19,49 | `MOVEMENT_TYPE_MOUNTAIN_DISGUISE` | `Route119_EventScript_Takashi` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 10,50 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route119_EventScript_Hugh` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 8,63 | `MOVEMENT_TYPE_FACE_DOWN` | `Route119_EventScript_Phil` | `0` |
| `LOCALID_ROUTE119_RIVAL` | `OBJ_EVENT_GFX_VAR_0` | 25,32 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_ROUTE_119_RIVAL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 12,121 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemSuperRepel` | `FLAG_ITEM_ROUTE_119_SUPER_REPEL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,96 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemZinc` | `FLAG_ITEM_ROUTE_119_ZINC` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 29,53 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemElixir` | `FLAG_ITEM_ROUTE_119_ELIXIR_1` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 25,76 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemLeafStone` | `FLAG_ITEM_ROUTE_119_LEAF_STONE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 8,18 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemRareCandy` | `FLAG_ITEM_ROUTE_119_RARE_CANDY` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 33,117 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemHyperPotion` | `FLAG_ITEM_ROUTE_119_HYPER_POTION_1` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 13,33 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route119_EventScript_BridgeAquaGrunt1` | `FLAG_HIDE_ROUTE_119_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 13,34 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route119_EventScript_BridgeAquaGrunt2` | `FLAG_HIDE_ROUTE_119_TEAM_AQUA` |
| `LOCALID_ROUTE119_RIVAL_ON_BIKE` | `OBJ_EVENT_GFX_VAR_3` | 17,33 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_ROUTE_119_RIVAL_ON_BIKE` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 31,109 | `MOVEMENT_TYPE_FACE_DOWN` | `Route119_EventScript_Boy1` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 8,23 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 9,23 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 29,90 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 30,90 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_CYCLING_TRIATHLETE_M` | 19,133 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route119_EventScript_CyclingTriathleteM` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,56 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemHyperPotion2` | `FLAG_ITEM_ROUTE_119_HYPER_POTION_2` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 35,93 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_EventScript_Boy2` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 29,6 | `MOVEMENT_TYPE_TREE_DISGUISE` | `Route119_EventScript_Hideo` | `0` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 31,6 | `MOVEMENT_TYPE_INVISIBLE` | `Route119_EventScript_Kecleon1` | `FLAG_HIDE_ROUTE_119_KECLEON_1` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 25,15 | `MOVEMENT_TYPE_INVISIBLE` | `Route119_EventScript_Kecleon2` | `FLAG_HIDE_ROUTE_119_KECLEON_2` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 13,104 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route119_EventScript_Chris` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 8,68 | `MOVEMENT_TYPE_FACE_UP` | `Route119_EventScript_Rachel` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 16,52 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route119_EventScript_Dayton` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 32,15 | `MOVEMENT_TYPE_FACE_LEFT` | `Route119_EventScript_Fabian` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 19,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemNugget` | `FLAG_ITEM_ROUTE_119_NUGGET` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 24,42 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_EventScript_ItemElixir2` | `FLAG_ITEM_ROUTE_119_ELIXIR_2` |
| `LOCALID_ROUTE119_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 28,25 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_119_SCOTT` |

## Warps (2)
- #0 (6,32) → `MAP_ROUTE119_WEATHER_INSTITUTE_1F` warp #0
- #1 (33,109) → `MAP_ROUTE119_HOUSE` warp #0

## Coord events / triggers (23)
- (25,31) → `Route119_EventScript_RivalTrigger1` (si `VAR_ROUTE119_STATE` == `0`)
- (26,31) → `Route119_EventScript_RivalTrigger2` (si `VAR_ROUTE119_STATE` == `0`)
- (29,13) → ``
- (30,13) → ``
- (31,13) → ``
- (32,13) → ``
- (15,133) → ``
- (16,132) → ``
- (17,131) → ``
- (18,130) → ``
- (19,131) → ``
- (20,132) → ``
- (21,133) → ``
- (36,6) → ``
- (36,7) → ``
- (35,8) → ``
- (35,9) → ``
- (16,137) → ``
- (17,137) → ``
- (18,137) → ``
- (19,137) → ``
- (20,137) → ``
- (34,13) → ``

## BG events / signs (20)
- (9,33) [sign] → `Route119_EventScript_WeatherInstituteSign`
- (27,19) [sign] → `Route119_EventScript_RouteSignFortree`
- (5,2) [secret_base] → ``
- (4,89) [secret_base] → ``
- (5,15) [secret_base] → ``
- (7,101) [secret_base] → ``
- (34,24) [secret_base] → ``
- (31,73) [secret_base] → ``
- (16,81) [secret_base] → ``
- (16,28) [secret_base] → ``
- (17,82) [hidden_item] → ``
- (38,63) [hidden_item] → ``
- (26,81) [secret_base] → ``
- (19,76) [secret_base] → ``
- (18,76) [secret_base] → ``
- (4,15) [secret_base] → ``
- (6,2) [secret_base] → ``
- (26,120) [hidden_item] → ``
- (20,29) [hidden_item] → ``
- (28,9) [sign] → `Route119_EventScript_TrainerTipsDecoration`

## Flags référencés (5)
- `FLAG_HIDE_WEATHER_INSTITUTE_1F_WORKERS`
- `FLAG_HIDE_WEATHER_INSTITUTE_2F_WORKERS`
- `FLAG_RECEIVED_HM_FLY`
- `FLAG_SCOTT_CALL_FORTREE_GYM`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (7)
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_ROUTE119_STATE`
- `VAR_SCOTT_STATE`
- `VAR_STARTER_MON`
- `VAR_TEMP_1`
- `VAR_WEATHER_INSTITUTE_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route119_Text_BrentPostBattle`
- `Route119_Text_CatherinePostBattle`
- `Route119_Text_CatherinePostRematch`
- `Route119_Text_CatherineRegister`
- `Route119_Text_ChrisPostBattle`
- `Route119_Text_DaytonPostBattle`
- `Route119_Text_DonaldPostBattle`
- `Route119_Text_DougPostBattle`
- `Route119_Text_FabianPostBattle`
- `Route119_Text_GregPostBattle`
- `Route119_Text_HideoPostBattle`
- `Route119_Text_HughPostBattle`
- `Route119_Text_JacksonPostBattle`
- `Route119_Text_JacksonPostRematch`
- `Route119_Text_JacksonRegister`
- `Route119_Text_KentPostBattle`
- `Route119_Text_PhilPostBattle`
- `Route119_Text_RachelPostBattle`
- `Route119_Text_TakashiPostBattle`
- `Route119_Text_TaylorPostBattle`
- `Route119_Text_YasuPostBattle`
### data/scripts/rival_graphics.inc
- `Common_EventScript_SetupRivalGfxId`
- `Common_EventScript_SetupRivalOnBikeGfxId`

## Scripts (71)
### Route119_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route119_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route119_OnTransition
```
### Route119_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, Route119_EventScript_TryRemoveKecleon
end
```
### Route119_EventScript_TryRemoveKecleon
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### Route119_OnTransition
```
call Common_EventScript_SetupRivalGfxId
call Common_EventScript_SetupRivalOnBikeGfxId
call_if_eq VAR_WEATHER_INSTITUTE_STATE, 1, Route119_EventScript_MoveInstituteWorkersDownstairs
special SetRoute119Weather
end
```
### Route119_EventScript_MoveInstituteWorkersDownstairs
```
setflag FLAG_HIDE_WEATHER_INSTITUTE_2F_WORKERS
clearflag FLAG_HIDE_WEATHER_INSTITUTE_1F_WORKERS
setvar VAR_WEATHER_INSTITUTE_STATE, 2
return
```
### Route119_EventScript_RivalTrigger1
```
setvar VAR_TEMP_1, 1
goto Route119_EventScript_RivalEncounter
end
```
### Route119_EventScript_RivalTrigger2
```
setvar VAR_TEMP_1, 2
goto Route119_EventScript_RivalEncounter
end
```
### Route119_EventScript_RivalEncounter
```
lockall
addobject LOCALID_ROUTE119_RIVAL_ON_BIKE
checkplayergender
call_if_eq VAR_RESULT, MALE, Route119_EventScript_PlayMayMusic
call_if_eq VAR_RESULT, FEMALE, Route119_EventScript_PlayBrendanMusic
delay 65
call_if_eq VAR_TEMP_1, 1, Route119_EventScript_RivalEnter1
call_if_eq VAR_TEMP_1, 2, Route119_EventScript_RivalEnter2
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
call_if_eq VAR_TEMP_1, 1, Route119_EventScript_SetRivalPos1
call_if_eq VAR_TEMP_1, 2, Route119_EventScript_SetRivalPos2
removeobject LOCALID_ROUTE119_RIVAL_ON_BIKE
addobject LOCALID_ROUTE119_RIVAL
delay 30
checkplayergender
goto_if_eq VAR_RESULT, MALE, Route119_EventScript_BattleMay
goto_if_eq VAR_RESULT, FEMALE, Route119_EventScript_BattleBrendan
releaseall
end
```
### Route119_EventScript_PlayMayMusic
```
playbgm MUS_ENCOUNTER_MAY, TRUE
return
```
### Route119_EventScript_PlayBrendanMusic
```
playbgm MUS_ENCOUNTER_BRENDAN, TRUE
return
```
### Route119_EventScript_BattleMay
```
msgbox Route119_Text_MayIntro, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route119_EventScript_BattleMayTreecko
case 1, Route119_EventScript_BattleMayTorchic
case 2, Route119_EventScript_BattleMayMudkip
end
```
### Route119_EventScript_BattleMayTreecko
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_119_TREECKO, Route119_Text_MayDefeat
goto Route119_EventScript_DefeatedMay
end
```
### Route119_EventScript_BattleMayTorchic
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_119_TORCHIC, Route119_Text_MayDefeat
goto Route119_EventScript_DefeatedMay
end
```
### Route119_EventScript_BattleMayMudkip
```
trainerbattle_no_intro TRAINER_MAY_ROUTE_119_MUDKIP, Route119_Text_MayDefeat
goto Route119_EventScript_DefeatedMay
end
```
### Route119_EventScript_DefeatedMay
```
msgbox Route119_Text_MayPresentForYou, MSGBOX_DEFAULT
call Route119_EventScript_GiveFlyHM
msgbox Route119_Text_MayExplainFly, MSGBOX_DEFAULT
goto Route119_EventScript_RivalExitScottArrive
end
```
### Route119_EventScript_BattleBrendan
```
msgbox Route119_Text_BrendanIntro, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route119_EventScript_BattleBrendanTreecko
case 1, Route119_EventScript_BattleBrendanTorchic
case 2, Route119_EventScript_BattleBrendanMudkip
end
```
### Route119_EventScript_BattleBrendanTreecko
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_119_TREECKO, Route119_Text_BrendanDefeat
goto Route119_EventScript_DefeatedBrendan
end
```
### Route119_EventScript_BattleBrendanTorchic
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_119_TORCHIC, Route119_Text_BrendanDefeat
goto Route119_EventScript_DefeatedBrendan
end
```
### Route119_EventScript_BattleBrendanMudkip
```
trainerbattle_no_intro TRAINER_BRENDAN_ROUTE_119_MUDKIP, Route119_Text_BrendanDefeat
goto Route119_EventScript_DefeatedBrendan
end
```
### Route119_EventScript_DefeatedBrendan
```
msgbox Route119_Text_BrendanIllGiveYouThis, MSGBOX_DEFAULT
call Route119_EventScript_GiveFlyHM
msgbox Route119_Text_BrendanExplainFly, MSGBOX_DEFAULT
goto Route119_EventScript_RivalExitScottArrive
end
```
### Route119_EventScript_GiveFlyHM
```
giveitem ITEM_HM_FLY
setflag FLAG_RECEIVED_HM_FLY
return
```
### Route119_EventScript_RivalExitScottArrive
```
closemessage
call_if_eq VAR_TEMP_1, 1, Route119_EventScript_SetRivalPos1
call_if_eq VAR_TEMP_1, 2, Route119_EventScript_SetRivalPos2
removeobject LOCALID_ROUTE119_RIVAL
addobject LOCALID_ROUTE119_RIVAL_ON_BIKE
delay 30
call_if_eq VAR_TEMP_1, 1, Route119_EventScript_RivalExit1
call_if_eq VAR_TEMP_1, 2, Route119_EventScript_RivalExit2
removeobject LOCALID_ROUTE119_RIVAL_ON_BIKE
setvar VAR_ROUTE119_STATE, 1
savebgm MUS_DUMMY
fadedefaultbgm
delay 60
call_if_eq VAR_TEMP_1, 1, Route119_EventScript_SetScottPos1
call_if_eq VAR_TEMP_1, 2, Route119_EventScript_SetScottPos2
addobject LOCALID_ROUTE119_SCOTT
applymovement LOCALID_ROUTE119_SCOTT, Route119_Movement_ScottEnter
waitmovement 0
addvar VAR_SCOTT_STATE, 1
msgbox Route119_Text_ScottWayToGoBeSeeingYou, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_TEMP_1, 1, Route119_EventScript_ScottExit1
call_if_eq VAR_TEMP_1, 2, Route119_EventScript_ScottExit2
removeobject LOCALID_ROUTE119_SCOTT
releaseall
end
```
### Route119_EventScript_SetScottPos1
```
setobjectxyperm LOCALID_ROUTE119_SCOTT, 27, 25
return
```
### Route119_EventScript_SetScottPos2
```
setobjectxyperm LOCALID_ROUTE119_SCOTT, 28, 25
return
```
### Route119_EventScript_ScottExit1
```
applymovement LOCALID_ROUTE119_SCOTT, Route119_Movement_ScottExit1
waitmovement 0
return
```
### Route119_EventScript_ScottExit2
```
applymovement LOCALID_ROUTE119_SCOTT, Route119_Movement_ScottExit2
waitmovement 0
return
```
### Route119_EventScript_RivalEnter1
```
applymovement LOCALID_ROUTE119_RIVAL_ON_BIKE, Route119_Movement_RivalEnter1
waitmovement 0
return
```
### Route119_EventScript_RivalEnter2
```
applymovement LOCALID_ROUTE119_RIVAL_ON_BIKE, Route119_Movement_RivalEnter2
waitmovement 0
return
```
### Route119_EventScript_RivalExit1
```
applymovement LOCALID_PLAYER, Route119_Movement_PlayerWatchRivalExit1
applymovement LOCALID_ROUTE119_RIVAL_ON_BIKE, Route119_Movement_RivalExit1
waitmovement 0
return
```
### Route119_EventScript_RivalExit2
```
applymovement LOCALID_PLAYER, Route119_Movement_PlayerWatchRivalExit2
applymovement LOCALID_ROUTE119_RIVAL_ON_BIKE, Route119_Movement_RivalExit2
waitmovement 0
return
```
### Route119_EventScript_SetRivalPos1
```
setobjectxyperm LOCALID_ROUTE119_RIVAL, 25, 32
setobjectxyperm LOCALID_ROUTE119_RIVAL_ON_BIKE, 25, 32
return
```
### Route119_EventScript_SetRivalPos2
```
setobjectxyperm LOCALID_ROUTE119_RIVAL, 26, 32
setobjectxyperm LOCALID_ROUTE119_RIVAL_ON_BIKE, 26, 32
return
```
### Route119_Movement_PlayerWatchRivalExit1
```
delay_16
walk_in_place_faster_right
delay_8
walk_in_place_faster_up
step_end
```
### Route119_Movement_PlayerWatchRivalExit2
```
delay_16
walk_in_place_faster_left
delay_8
walk_in_place_faster_up
step_end
```
### Route119_Movement_RivalEnter1
```
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_up
step_end
```
### Route119_Movement_RivalEnter2
```
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_up
step_end
```
### Route119_Movement_RivalExit1
```
walk_fast_right
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
step_end
```
### Route119_Movement_RivalExit2
```
walk_fast_left
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
step_end
```
### Route119_Movement_ScottEnter
```
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_down
step_end
```
### Route119_Movement_ScottExit1
```
walk_up
walk_right
walk_right
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### Route119_Movement_ScottExit2
```
walk_up
walk_right
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### Route119_EventScript_CyclingTriathleteM
```
msgbox Route119_Text_TallGrassSnaresBikeTires, MSGBOX_NPC
end
```
### Route119_EventScript_RouteSignFortree
```
msgbox Route119_Text_RouteSignFortree, MSGBOX_SIGN
end
```
### Route119_EventScript_WeatherInstituteSign
```
msgbox Route119_Text_WeatherInstitute, MSGBOX_SIGN
end
```
### Route119_EventScript_Brent
```
trainerbattle_single TRAINER_BRENT, Route119_Text_BrentIntro, Route119_Text_BrentDefeat
msgbox Route119_Text_BrentPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Donald
```
trainerbattle_single TRAINER_DONALD, Route119_Text_DonaldIntro, Route119_Text_DonaldDefeat
msgbox Route119_Text_DonaldPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Taylor
```
trainerbattle_single TRAINER_TAYLOR, Route119_Text_TaylorIntro, Route119_Text_TaylorDefeat
msgbox Route119_Text_TaylorPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Doug
```
trainerbattle_single TRAINER_DOUG, Route119_Text_DougIntro, Route119_Text_DougDefeat
msgbox Route119_Text_DougPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Greg
```
trainerbattle_single TRAINER_GREG, Route119_Text_GregIntro, Route119_Text_GregDefeat
msgbox Route119_Text_GregPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Kent
```
trainerbattle_single TRAINER_KENT, Route119_Text_KentIntro, Route119_Text_KentDefeat
msgbox Route119_Text_KentPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Jackson
```
trainerbattle_single TRAINER_JACKSON_1, Route119_Text_JacksonIntro, Route119_Text_JacksonDefeat, Route119_EventScript_RegisterJackson
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route119_EventScript_RematchJackson
msgbox Route119_Text_JacksonPostBattle, MSGBOX_DEFAULT
release
end
```
### Route119_EventScript_RegisterJackson
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route119_Text_JacksonRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_JACKSON_1
release
end
```
### Route119_EventScript_RematchJackson
```
trainerbattle_rematch TRAINER_JACKSON_1, Route119_Text_JacksonRematchIntro, Route119_Text_JacksonRematchDefeat
msgbox Route119_Text_JacksonPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Catherine
```
trainerbattle_single TRAINER_CATHERINE_1, Route119_Text_CatherineIntro, Route119_Text_CatherineDefeat, Route119_EventScript_RegisterCatherine
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route119_EventScript_RematchCatherine
msgbox Route119_Text_CatherinePostBattle, MSGBOX_DEFAULT
release
end
```
### Route119_EventScript_RegisterCatherine
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route119_Text_CatherineRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_CATHERINE_1
release
end
```
### Route119_EventScript_RematchCatherine
```
trainerbattle_rematch TRAINER_CATHERINE_1, Route119_Text_CatherineRematchIntro, Route119_Text_CatherineRematchDefeat
msgbox Route119_Text_CatherinePostRematch, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Hugh
```
trainerbattle_single TRAINER_HUGH, Route119_Text_HughIntro, Route119_Text_HughDefeat
msgbox Route119_Text_HughPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Phil
```
trainerbattle_single TRAINER_PHIL, Route119_Text_PhilIntro, Route119_Text_PhilDefeat
msgbox Route119_Text_PhilPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Yasu
```
trainerbattle_single TRAINER_YASU, Route119_Text_YasuIntro, Route119_Text_YasuDefeat
msgbox Route119_Text_YasuPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Takashi
```
trainerbattle_single TRAINER_TAKASHI, Route119_Text_TakashiIntro, Route119_Text_TakashiDefeat
msgbox Route119_Text_TakashiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Hideo
```
trainerbattle_single TRAINER_HIDEO, Route119_Text_HideoIntro, Route119_Text_HideoDefeat
msgbox Route119_Text_HideoPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Chris
```
trainerbattle_single TRAINER_CHRIS, Route119_Text_ChrisIntro, Route119_Text_ChrisDefeat
msgbox Route119_Text_ChrisPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Fabian
```
trainerbattle_single TRAINER_FABIAN, Route119_Text_FabianIntro, Route119_Text_FabianDefeat
msgbox Route119_Text_FabianPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Dayton
```
trainerbattle_single TRAINER_DAYTON, Route119_Text_DaytonIntro, Route119_Text_DaytonDefeat
msgbox Route119_Text_DaytonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_Rachel
```
trainerbattle_single TRAINER_RACHEL, Route119_Text_RachelIntro, Route119_Text_RachelDefeat
msgbox Route119_Text_RachelPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_EventScript_BridgeAquaGrunt1
```
lock
faceplayer
msgbox Route119_Text_StayAwayFromWeatherInstitute, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### Route119_EventScript_BridgeAquaGrunt2
```
lock
faceplayer
msgbox Route119_Text_DontGoNearWeatherInstitute, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### Route119_EventScript_Boy1
```
msgbox Route119_Text_ThoughtFlyByCatchingBirdMons, MSGBOX_NPC
end
```
### Route119_EventScript_Boy2
```
msgbox Route119_Text_CanYourMonMakeSecretBase, MSGBOX_NPC
end
```
### Route119_EventScript_TrainerTipsDecoration
```
msgbox Route119_Text_TrainerTipsDecoration, MSGBOX_SIGN
end
```
### Route119_EventScript_ScottWonAtFortreeGymCall
```
lockall
pokenavcall Route119_Text_ScottYouWonAtFortreeGym
waitmessage
clearflag FLAG_SCOTT_CALL_FORTREE_GYM
addvar VAR_SCOTT_STATE, 1
releaseall
end
```

## Textes (18)
### Route119_Text_MayIntro
```
FLORA: {PLAYER}{KUN}!\nOù étais-tu? Je te cherchais!\pTu as beaucoup progressé?\nLaisse-moi faire!\pVous êtes prêts, tes POKéMON et toi?\nEvidemment! Allez, c'est parti!$
```
### Route119_Text_MayDefeat
```
Waouh!\nQuelle force, {PLAYER}{KUN}!\pEt moi qui craignais que tu aies\ndécroché avec l'entraînement!$
```
### Route119_Text_MayPresentForYou
```
FLORA: Mais je n'ai pas de souci à me\nfaire! Garde le rythme!\pEt viens là! J'ai un cadeau pour toi.$
```
### Route119_Text_MayExplainFly
```
FLORA: Si tu utilises VOL, ton POKéMON\nte portera dans une ville de ton choix\lque tu as déjà visitée.\pMais pour pouvoir utiliser VOL, il faut\nle BADGE de l'ARENE de CIMETRONELLE.\lC'est important. N'oublie pas!\pTu devrais utiliser VOL pour retourner\nchez toi à BOURG-EN-VOL. \pJe parie que ta maman se fait du souci\npour toi, {PLAYER}{KUN}.\pBon, on se reverra!$
```
### Route119_Text_BrendanIntro
```
BRICE: {PLAYER}! C'est donc là que tu\ncherches des POKéMON?\pMontre-moi voir si t'en as attrapé des\nbons. Je vais te tester!\pMaintenant!\nC'est un combat, alors combattons!$
```
### Route119_Text_BrendanDefeat
```
Hum…\nT'as sacrément bien progressé.$
```
### Route119_Text_BrendanIllGiveYouThis
```
BRICE: Tu sais, tu as assez de talent\npour chercher des POKéMON où tu veux.\pTiens, je te donne ça.\nEssaie, tu verras bien.$
```
### Route119_Text_BrendanExplainFly
```
BRICE: Si tu utilises VOL, ton POKéMON\nte portera dans une ville de ton choix\lque tu as déjà visitée.\pMais pour cela, il faut que tu aies\nle BADGE de l'ARENE de CIMETRONELLE.\pEn tout cas, moi, il faut que je file.$
```
### Route119_Text_ScottWayToGoBeSeeingYou
```
SCOTT: Hahahah!\nBien joué, {PLAYER}{KUN}!\pJe viens de croiser un DRESSEUR sur\nun VELO.\pTu viens de le battre, n'est-ce pas?\nNe dis rien, je suis sûr que c'est toi!\pIl était tout rouge de colère. Tu as\nréussi à bien l'énerver.\pJe te croise souvent en ce moment.\nVas-tu te rendre à l'ARENE de\lCIMETRONELLE?\pJe suis sûr que tu vas y faire des\nmerveilles.\pA la prochaine!$
```
### Route119_Text_ScottYouWonAtFortreeGym
```
… … … … … …\n… … … … … Bip!\pSCOTT: Hé, {PLAYER}{KUN}, c'est moi!\pComme je l'imaginais, tu as battu\nle CHAMPION D'ARENE de\lCIMETRONELLE.\pCette force…\nPeut-être que tu es le DRESSEUR\lque je cherche partout.\pN'oublie pas, je suis un vrai fan!\nJe serai toujours là pour te\lsoutenir. Continue comme ça!\p… … … … … …\n… … … … … Clic!$$
```
### Route119_Text_StayAwayFromWeatherInstitute
```
Nous, on surveille ici.\pHé, toi! Ne t'approche pas du CENTRE\nMETEO. C'est dangereux.$
```
### Route119_Text_DontGoNearWeatherInstitute
```
C'est très ennuyeux de surveiller.\pHé, toi! Ne t'approche pas trop près du\nCENTRE METEO, s'il te plaît.$
```
### Route119_Text_ThoughtFlyByCatchingBirdMons
```
Je croyais qu'on pouvait faire un VOL en\nattrapant toute une volée de POKéMON\lOISEAU et en s'accrochant à eux.\pMais il s'avère qu'il existe une capacité\nCS appelée VOL!\pJ'aurais bien voulu le savoir plus tôt…$
```
### Route119_Text_TallGrassSnaresBikeTires
```
Pff… C'est une zone de non-droit…\pLes herbes hautes se coincent dans les\nroues des VELOS.$
```
### Route119_Text_CanYourMonMakeSecretBase
```
Ton POKéMON peut-il utiliser sa\nFORCE CACHEE sur un gros tas\ld'herbe et créer une BASE SECRETE?$
```
### Route119_Text_RouteSignFortree
```
ROUTE 119\n{RIGHT_ARROW} CIMETRONELLE$
```
### Route119_Text_WeatherInstitute
```
CENTRE METEO$
```
### Route119_Text_TrainerTipsDecoration
```
CONSEILS AUX DRESSEURS\pVous pouvez mettre jusqu'à seize\nobjets de décoration et meubles dans\lvotre BASE SECRETE.\pA vous de choisir vos objets préférés\npour aménager votre BASE SECRETE\lpersonnelle à votre guise.$
```

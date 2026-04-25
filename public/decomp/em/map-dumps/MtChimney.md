# MtChimney

## Métadonnées
- **id** : `MAP_MT_CHIMNEY`
- **layout** : `LAYOUT_MT_CHIMNEY`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_MT_CHIMNEY`
- **weather** : `WEATHER_VOLCANIC_ASH`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (30 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MT_CHIMNEY_ARCHIE` | `OBJ_EVENT_GFX_ARCHIE` | 24,19 | `MOVEMENT_TYPE_FACE_LEFT` | `MtChimney_EventScript_Archie` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `LOCALID_MT_CHIMNEY_MAXIE` | `OBJ_EVENT_GFX_MAXIE` | 13,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_Maxie` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `LOCALID_MT_CHIMNEY_TABITHA` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 12,11 | `MOVEMENT_TYPE_FACE_LEFT` | `MtChimney_EventScript_Tabitha` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 32,5 | `MOVEMENT_TYPE_FACE_LEFT` | `MtChimney_EventScript_BusyMagmaGrunt5` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 28,12 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_BusyMagmaGrunt4` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 19,39 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_BusyAquaGrunt2` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 29,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_BusyAquaGrunt1` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 31,12 | `MOVEMENT_TYPE_FACE_LEFT` | `MtChimney_EventScript_BusyAquaGrunt3` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_OLD_WOMAN` | 19,39 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_LavaCookieLady` | `FLAG_HIDE_MT_CHIMNEY_LAVA_COOKIE_LADY` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 22,39 | `MOVEMENT_TYPE_FACE_LEFT` | `MtChimney_EventScript_BusyMagmaGrunt6` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 23,19 | `MOVEMENT_TYPE_RUN_IN_PLACE_LEFT` | `MtChimney_EventScript_AquaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 23,18 | `MOVEMENT_TYPE_WALK_IN_PLACE_DOWN` | `MtChimney_EventScript_MagmaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 23,17 | `MOVEMENT_TYPE_FACE_DOWN` | `MtChimney_EventScript_BusyMagmaGrunt2` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 23,20 | `MOVEMENT_TYPE_WALK_IN_PLACE_UP` | `MtChimney_EventScript_MagmaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 22,19 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `MtChimney_EventScript_MagmaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 23,21 | `MOVEMENT_TYPE_FACE_UP` | `MtChimney_EventScript_BusyMagmaGrunt3` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 21,19 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_BusyMagmaGrunt1` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 30,12 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `MtChimney_EventScript_AquaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 29,12 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `MtChimney_EventScript_MagmaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 30,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `MtChimney_EventScript_AquaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 31,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `MtChimney_EventScript_MagmaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `LOCALID_MT_CHIMNEY_MAGMA_GRUNT_2` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 9,16 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_Grunt2` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 20,39 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `MtChimney_EventScript_AquaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 21,39 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `MtChimney_EventScript_MagmaPoochyena` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 16,18 | `MOVEMENT_TYPE_FACE_DOWN_AND_UP` | `MtChimney_EventScript_Shelby` | `FLAG_HIDE_MT_CHIMNEY_TRAINERS` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 14,7 | `MOVEMENT_TYPE_JOG_IN_PLACE_LEFT` | `MtChimney_EventScript_Melissa` | `FLAG_HIDE_MT_CHIMNEY_TRAINERS` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 29,7 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `MtChimney_EventScript_Sheila` | `FLAG_HIDE_MT_CHIMNEY_TRAINERS` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 27,17 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `MtChimney_EventScript_Shirley` | `FLAG_HIDE_MT_CHIMNEY_TRAINERS` |
| `LOCALID_MT_CHIMNEY_MAGMA_GRUNT_1` | `OBJ_EVENT_GFX_MAGMA_MEMBER_F` | 13,16 | `MOVEMENT_TYPE_FACE_LEFT` | `MtChimney_EventScript_Grunt1` | `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_HIKER` | 7,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtChimney_EventScript_Sawyer` | `FLAG_HIDE_MT_CHIMNEY_TRAINERS` |

## Warps (4)
- #0 (17,36) → `MAP_MT_CHIMNEY_CABLE_CAR_STATION` warp #0
- #1 (18,36) → `MAP_MT_CHIMNEY_CABLE_CAR_STATION` warp #1
- #2 (20,41) → `MAP_JAGGED_PASS` warp #2
- #3 (21,41) → `MAP_JAGGED_PASS` warp #3

## BG events / signs (2)
- (14,6) [sign] → `MtChimney_EventScript_MeteoriteMachine`
- (24,37) [sign] → `MtChimney_EventScript_RouteSign`

## Flags référencés (8)
- `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY`
- `FLAG_EVIL_LEADER_PLEASE_STOP`
- `FLAG_HIDE_FALLARBOR_HOUSE_PROF_COZMO`
- `FLAG_HIDE_METEOR_FALLS_1F_1R_COZMO`
- `FLAG_HIDE_MT_CHIMNEY_LAVA_COOKIE_LADY`
- `FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA`
- `FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA`
- `FLAG_RECEIVED_METEORITE`

## Variables référencées (3)
- `VAR_FACING`
- `VAR_JAGGED_PASS_ASH_WEATHER`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_TooBadBagIsFull`

## Scripts (63)
### MtChimney_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, MtChimney_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, MtChimney_OnTransition
```
### MtChimney_OnTransition
```
setvar VAR_JAGGED_PASS_ASH_WEATHER, 1
end
```
### MtChimney_OnResume
```
setstepcallback STEP_CB_ASH
end
```
### MtChimney_EventScript_Archie
```
lock
faceplayer
call_if_unset FLAG_EVIL_LEADER_PLEASE_STOP, MtChimney_EventScript_ArchieGoStopTeamMagma
call_if_set FLAG_EVIL_LEADER_PLEASE_STOP, MtChimney_EventScript_ArchieBusyFighting
closemessage
applymovement LOCALID_MT_CHIMNEY_ARCHIE, Common_Movement_FaceOriginalDirection
waitmovement 0
setflag FLAG_EVIL_LEADER_PLEASE_STOP
release
end
```
### MtChimney_EventScript_ArchieGoStopTeamMagma
```
msgbox MtChimney_Text_ArchieGoStopTeamMagma, MSGBOX_DEFAULT
return
```
### MtChimney_EventScript_ArchieBusyFighting
```
msgbox MtChimney_Text_ArchieIHaveMyHandsFull, MSGBOX_DEFAULT
return
```
### MtChimney_EventScript_Maxie
```
lockall
playbgm MUS_ENCOUNTER_MAGMA, FALSE
msgbox MtChimney_Text_MeteoriteWillActivateVolcano, MSGBOX_DEFAULT
applymovement LOCALID_MT_CHIMNEY_MAXIE, Common_Movement_FacePlayer
waitmovement 0
playse SE_PIN
applymovement LOCALID_MT_CHIMNEY_MAXIE, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_MT_CHIMNEY_MAXIE, Common_Movement_Delay48
waitmovement 0
msgbox MtChimney_Text_MaxieIntro, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_MAXIE_MT_CHIMNEY, MtChimney_Text_MaxieDefeat
msgbox MtChimney_Text_MaxieYouHaventSeenLastOfMagma, MSGBOX_DEFAULT
closemessage
delay 30
fadescreen FADE_TO_BLACK
removeobject LOCALID_MT_CHIMNEY_MAXIE
removeobject LOCALID_MT_CHIMNEY_MAGMA_GRUNT_1
removeobject LOCALID_MT_CHIMNEY_TABITHA
removeobject LOCALID_MT_CHIMNEY_MAGMA_GRUNT_2
setflag FLAG_HIDE_MT_CHIMNEY_TEAM_MAGMA
fadescreen FADE_FROM_BLACK
setobjectxyperm LOCALID_MT_CHIMNEY_ARCHIE, 10, 12
addobject LOCALID_MT_CHIMNEY_ARCHIE
call_if_eq VAR_FACING, DIR_EAST, MtChimney_EventScript_ArchieApproachPlayerEast
call_if_eq VAR_FACING, DIR_NORTH, MtChimney_EventScript_ArchieApproachPlayerNorth
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox MtChimney_Text_ArchieThankYou, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_EAST, MtChimney_EventScript_ArchieExitEast
call_if_eq VAR_FACING, DIR_NORTH, MtChimney_EventScript_ArchieExitNorth
removeobject LOCALID_MT_CHIMNEY_ARCHIE
setflag FLAG_HIDE_MT_CHIMNEY_TEAM_AQUA
setflag FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY
clearflag FLAG_HIDE_FALLARBOR_HOUSE_PROF_COZMO
setflag FLAG_HIDE_METEOR_FALLS_1F_1R_COZMO
clearflag FLAG_HIDE_MT_CHIMNEY_LAVA_COOKIE_LADY
releaseall
end
```
### MtChimney_EventScript_ArchieApproachPlayerEast
```
applymovement LOCALID_MT_CHIMNEY_ARCHIE, MtChimney_Movement_ArchieApproachPlayerEast
waitmovement 0
return
```
### MtChimney_EventScript_ArchieApproachPlayerNorth
```
applymovement LOCALID_MT_CHIMNEY_ARCHIE, MtChimney_Movement_ArchieApproachPlayerNorth
waitmovement 0
return
```
### MtChimney_EventScript_ArchieExitEast
```
applymovement LOCALID_MT_CHIMNEY_ARCHIE, MtChimney_Movement_ArchieExitEast
waitmovement 0
return
```
### MtChimney_EventScript_ArchieExitNorth
```
applymovement LOCALID_MT_CHIMNEY_ARCHIE, MtChimney_Movement_ArchieExitNorth
waitmovement 0
return
```
### MtChimney_EventScript_LavaCookieLady
```
lock
faceplayer
showmoneybox 0, 0
msgbox MtChimney_Text_LavaCookiesJust200, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MtChimney_EventScript_DeclineLavaCookie
checkmoney 200
goto_if_eq VAR_RESULT, FALSE, MtChimney_EventScript_NotEnoughMoney
msgbox MtChimney_Text_ThankYouDear, MSGBOX_DEFAULT
checkitemspace ITEM_LAVA_COOKIE
call_if_eq VAR_RESULT, TRUE, MtChimney_EventScript_RemoveMoney
giveitem ITEM_LAVA_COOKIE
goto_if_eq VAR_RESULT, FALSE, MtChimney_EventScript_BagIsFull
hidemoneybox
release
end
```
### MtChimney_EventScript_BagIsFull
```
msgbox gText_TooBadBagIsFull, MSGBOX_DEFAULT
hidemoneybox
release
end
```
### MtChimney_EventScript_RemoveMoney
```
removemoney 200
updatemoneybox
return
```
### MtChimney_EventScript_DeclineLavaCookie
```
msgbox MtChimney_Text_OhFineThen, MSGBOX_DEFAULT
hidemoneybox
release
end
```
### MtChimney_EventScript_NotEnoughMoney
```
msgbox MtChimney_Text_YouveNotGotTheMoney, MSGBOX_DEFAULT
hidemoneybox
release
end
```
### MtChimney_Movement_ArchieApproachPlayerEast
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_right
step_end
```
### MtChimney_Movement_ArchieExitEast
```
walk_left
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_ArchieApproachPlayerNorth
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_right
walk_right
step_end
```
### MtChimney_Movement_ArchieExitNorth
```
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused1
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
step_end
```
### MtChimney_Movement_Unused2
```
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_down
step_end
```
### MtChimney_Movement_Unused3
```
walk_right
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused4
```
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_left
walk_left
walk_down
walk_down
walk_down
walk_left
walk_left
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
step_end
```
### MtChimney_Movement_Unused5
```
delay_16
delay_16
delay_16
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_down
step_end
```
### MtChimney_Movement_Unused6
```
delay_16
walk_left
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused7
```
delay_16
walk_left
walk_left
walk_down
walk_down
walk_down
walk_left
walk_left
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
step_end
```
### MtChimney_Movement_Unused8
```
delay_16
walk_down
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_down
step_end
```
### MtChimney_Movement_Unused9
```
walk_down
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused10
```
walk_down
step_end
```
### MtChimney_Movement_Unused11
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused12
```
delay_16
delay_16
walk_in_place_faster_left
delay_16
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused13
```
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
walk_in_place_faster_left
delay_16
walk_down
walk_down
step_end
```
### MtChimney_Movement_Unused14
```
lock_facing_direction
walk_fast_left
unlock_facing_direction
face_right
step_end
```
### MtChimney_Movement_Unused15
```
walk_left
walk_in_place_faster_right
delay_16
step_end
```
### MtChimney_EventScript_BusyAquaGrunt1
```
msgbox MtChimney_Text_MagmaOutnumbersUs, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyAquaGrunt2
```
msgbox MtChimney_Text_LessHabitatForWaterPokemon, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyAquaGrunt3
```
msgbox MtChimney_Text_MagmasNameSimilar, MSGBOX_SIGN
end
```
### MtChimney_EventScript_Tabitha
```
trainerbattle_single TRAINER_TABITHA_MT_CHIMNEY, MtChimney_Text_TabithaIntro, MtChimney_Text_TabithaDefeat
msgbox MtChimney_Text_TabithaPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_Grunt2
```
trainerbattle_single TRAINER_GRUNT_MT_CHIMNEY_2, MtChimney_Text_Grunt2Intro, MtChimney_Text_Grunt2Defeat
msgbox MtChimney_Text_Grunt2PostBattle, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_BusyMagmaGrunt1
```
msgbox MtChimney_Text_TeamAquaAlwaysMessingWithPlans, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyMagmaGrunt2
```
msgbox MtChimney_Text_MeteoritesPackAmazingPower, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyMagmaGrunt3
```
msgbox MtChimney_Text_YouBetterNotMessWithUs, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyMagmaGrunt4
```
msgbox MtChimney_Text_AquasNameSimilar, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyMagmaGrunt5
```
msgbox MtChimney_Text_DouseThemInFire, MSGBOX_SIGN
end
```
### MtChimney_EventScript_BusyMagmaGrunt6
```
msgbox MtChimney_Text_KeepMakingMoreLand, MSGBOX_SIGN
end
```
### MtChimney_EventScript_MagmaPoochyena
```
msgbox MtChimney_Text_Bufoh, MSGBOX_SIGN
end
```
### MtChimney_EventScript_AquaPoochyena
```
msgbox MtChimney_Text_Bushaa, MSGBOX_SIGN
end
```
### MtChimney_EventScript_MeteoriteMachine
```
lockall
goto_if_unset FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, MtChimney_EventScript_MachineOn
goto_if_set FLAG_RECEIVED_METEORITE, MtChimney_EventScript_MachineOff
msgbox MtChimney_Text_RemoveTheMeteorite, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MtChimney_EventScript_LeaveMeteoriteAlone
msgbox MtChimney_Text_PlayerRemovedMeteorite, MSGBOX_DEFAULT
giveitem ITEM_METEORITE
setflag FLAG_RECEIVED_METEORITE
releaseall
end
```
### MtChimney_EventScript_LeaveMeteoriteAlone
```
msgbox MtChimney_Text_PlayerLeftMeteorite, MSGBOX_DEFAULT
releaseall
end
```
### MtChimney_EventScript_MachineOff
```
msgbox MtChimney_Text_MachineMakesNoResponse, MSGBOX_DEFAULT
releaseall
end
```
### MtChimney_EventScript_MachineOn
```
msgbox MtChimney_Text_MetoriteFittedOnMachine, MSGBOX_DEFAULT
releaseall
end
```
### MtChimney_EventScript_RouteSign
```
msgbox MtChimney_Text_RouteSign, MSGBOX_SIGN
end
```
### MtChimney_EventScript_Shelby
```
trainerbattle_single TRAINER_SHELBY_1, MtChimney_Text_ShelbyIntro, MtChimney_Text_ShelbyDefeat, MtChimney_EventScript_DefeatedShelby
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MtChimney_EventScript_RematchShelby
msgbox MtChimney_Text_ShelbyPostBattle, MSGBOX_DEFAULT
release
end
```
### MtChimney_EventScript_DefeatedShelby
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox MtChimney_Text_ShelbyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_SHELBY_1
release
end
```
### MtChimney_EventScript_RematchShelby
```
trainerbattle_rematch TRAINER_SHELBY_1, MtChimney_Text_ShelbyRematchIntro, MtChimney_Text_ShelbyRematchDefeat
msgbox MtChimney_Text_ShelbyPostRematch, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_Melissa
```
trainerbattle_single TRAINER_MELISSA, MtChimney_Text_MelissaIntro, MtChimney_Text_MelissaDefeat
msgbox MtChimney_Text_MelissaPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_Sheila
```
trainerbattle_single TRAINER_SHEILA, MtChimney_Text_SheilaIntro, MtChimney_Text_SheilaDefeat
msgbox MtChimney_Text_SheilaPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_Shirley
```
trainerbattle_single TRAINER_SHIRLEY, MtChimney_Text_ShirleyIntro, MtChimney_Text_ShirleyDefeat
msgbox MtChimney_Text_ShirleyPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_Grunt1
```
trainerbattle_single TRAINER_GRUNT_MT_CHIMNEY_1, MtChimney_Text_Grunt1Intro, MtChimney_Text_Grunt1Defeat
msgbox MtChimney_Text_Grunt1PostBattle, MSGBOX_AUTOCLOSE
end
```
### MtChimney_EventScript_Sawyer
```
trainerbattle_single TRAINER_SAWYER_1, MtChimney_Text_SawyerIntro, MtChimney_Text_SawyerDefeat, MtChimney_EventScript_SawyerDefeated
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MtChimney_EventScript_SawyerRematch
msgbox MtChimney_Text_SawyerPostBattle, MSGBOX_DEFAULT
release
end
```
### MtChimney_EventScript_SawyerDefeated
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox MtChimney_Text_SawyerRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_SAWYER_1
release
end
```
### MtChimney_EventScript_SawyerRematch
```
trainerbattle_rematch TRAINER_SAWYER_1, MtChimney_Text_SawyerRematchIntro, MtChimney_Text_SawyerRematchDefeat
msgbox MtChimney_Text_SawyerPostRematch, MSGBOX_AUTOCLOSE
end
```

## Textes (60)
### MtChimney_Text_MeteoriteWillActivateVolcano
```
La puissance contenue dans le\nMETEORITE…\pEn l'amplifiant avec cette machine,\nl'activité volcanique du MONT CHIMNEE\lva s'intensifier instantanément…\pSon énergie va grandir à l'intérieur\nde ce cratère et…\lHahaha…$
```
### MtChimney_Text_MaxieIntro
```
MAX: Hum…\nQui es-tu?\p… … … … … …\n… … … … … …\pJ'ai entendu ARTHUR se plaindre d'un\nDRESSEUR qui se serait mêlé des\laffaires de la TEAM AQUA.\pIl devait parler de toi, je pense.\pHumpf! Alors tu veux également te\nmêler des affaires de la TEAM MAGMA?\pEcoute-moi bien! Les êtres vivants ont\nbesoin de la terre pour se développer.\pLa terre représente tout! C'est le\nberceau de toute vie!\pC'est pour cela que la TEAM MAGMA\ns'est engagée à étendre la terre.\pNotre but est de faire prospérer les\nêtres humains et les POKéMON!\pEt pour cela, nous avons besoin de\nla puissance qui sommeille dans\lcette montagne…\pOh, tu n'avais pas vraiment besoin de\nsavoir tout ça…\pMais peu importe!\nJe vais te montrer ce qu'il en coûte\lde se mêler de nos affaires!$
```
### MtChimney_Text_MaxieDefeat
```
Quoi?!\pMoi, MAX, j'ai été pris au dépourvu?!$
```
### MtChimney_Text_MaxieYouHaventSeenLastOfMagma
```
MAX: Ça suffit. Je pars pour cette\nfois.\pMais n'espère pas ne plus entendre\nparler de la TEAM MAGMA.\pHahaha…\pMême sans le METEORITE, si nous\nparvenons à obtenir l'ORBE…\lAlors là!$
```
### MtChimney_Text_TabithaIntro
```
Hé, hé, hé!\pAlors t'as fait tout le chemin jusqu'ici!\pMais il est trop tard!\nJ'ai déjà remis le METEORITE du\lSITE METEORE au CHEF!$
```
### MtChimney_Text_TabithaDefeat
```
Héhéhé…\pMême si j'ai perdu, si notre chef arrive\nà réveiller cette chose…$
```
### MtChimney_Text_TabithaPostBattle
```
CHEF, vite!\nDonne-lui l'énergie du METEORITE!\pHéhéhé…$
```
### MtChimney_Text_Grunt2Intro
```
Nous, la TEAM MAGMA, nous travaillons\ndur dans l'intérêt de tous.\pSi la puissance de cette chose\nétendait la terre, il y aurait plus\ld'espace pour vivre.\pTout le monde serait heureux!$
```
### MtChimney_Text_Grunt2Defeat
```
Hum?\nTu veux dire que j'ai perdu?$
```
### MtChimney_Text_Grunt2PostBattle
```
Notre CHEF dit que ça rendra tout\nle monde heureux.\pMais pourquoi tout le monde se met en\ntravers de notre route?$
```
### MtChimney_Text_Grunt1Intro
```
S'il y avait plus de terre, je pourrais\navoir ma propre maison!\pJe vais en construire une sur de\nla lave froide!$
```
### MtChimney_Text_Grunt1Defeat
```
Mon rêve de grande maison…$
```
### MtChimney_Text_Grunt1PostBattle
```
A ton âge, tu devrais être en\ntrain de jouer dans le sable!$
```
### MtChimney_Text_TeamAquaAlwaysMessingWithPlans
```
Cette TEAM AQUA est agaçante…\nIls font toujours échouer nos plans!$
```
### MtChimney_Text_MeteoritesPackAmazingPower
```
Les METEORITES contiennent une\npuissance stupéfiante!$
```
### MtChimney_Text_YouBetterNotMessWithUs
```
Tu ferais bien de pas te mêler de ça!\pNous essayons de réveiller cette chose\npour le bien de tous!$
```
### MtChimney_Text_AquasNameSimilar
```
Nous sommes la TEAM MAGMA!\pIls sont la TEAM AQUA!\pÇa m'énerve vraiment qu'ils utilisent\nun nom comme le nôtre!$
```
### MtChimney_Text_DouseThemInFire
```
Yé!\nFais-en du feu!$
```
### MtChimney_Text_KeepMakingMoreLand
```
On va continuer à créer plus de terre!$
```
### MtChimney_Text_Bufoh
```
Youhou!$
```
### MtChimney_Text_ArchieGoStopTeamMagma
```
ARTHUR: Grr, {PLAYER}!\pJ'aurais dû me douter que tu pointerais\nle bout de ton nez!\pVois par toi-même de quoi sont\ncapables les fanatiques de la\lTEAM MAGMA!\pIls essaient d'injecter la puissance\ndu METEORITE volé à l'intérieur\ldu volcan!\pA cause d'eux, le volcan risque\nd'entrer en éruption!$
```
### MtChimney_Text_ArchieIHaveMyHandsFull
```
ARTHUR: Arrrgh!\pJe veux arrêter ce MAX,\nmais je ne peux pas!\pJe suis trop occupé à me battre\ncontre trois adversaires à la fois.$
```
### MtChimney_Text_ArchieThankYou
```
ARTHUR: {PLAYER}!\nMerci!\pGrâce à ton aide, nous avons déjoué\nles plans de la TEAM MAGMA!\pMais… Toi…\nDe quel côté es-tu?\pAh, peu importe…\pNous resterons vigilants et\ncontinuerons de poursuivre la\lTEAM MAGMA.\p{PLAYER}, nous nous reverrons!$
```
### MtChimney_Text_MagmaOutnumbersUs
```
La TEAM MAGMA est venue en force!\nArrêtons! On ne fera pas le poids!$
```
### MtChimney_Text_LessHabitatForWaterPokemon
```
S'ils étendent la terre, il y aura moins\nd'espace pour les POKéMON EAU!$
```
### MtChimney_Text_MagmasNameSimilar
```
Nous sommes la TEAM AQUA!\pIls sont la TEAM MAGMA!\pÇa me fait mal au cœur qu'ils utilisent\nun nom qui ressemble au nôtre!$
```
### MtChimney_Text_Bushaa
```
Bouhaha!$
```
### MtChimney_Text_LavaCookiesJust200
```
Les LAVA COOKIES sont les spécialités\nlocales du MONT CHIMNEE.\pGoûtes-en un. Ça ne coûte que 200¥.$
```
### MtChimney_Text_ThankYouDear
```
Merci, mon p'tit!$
```
### MtChimney_Text_YouveNotGotTheMoney
```
Oh, tu ne peux pas acheter ce que tu\nveux, si tu n'as pas assez d'argent.$
```
### MtChimney_Text_OhFineThen
```
Bon, très bien.$
```
### MtChimney_Text_MetoriteFittedOnMachine
```
Un METEORITE est placé sur une\nmystérieuse machine…\pCette machine semble stocker de\nl'énergie dans le METEORITE.$
```
### MtChimney_Text_RemoveTheMeteorite
```
Un METEORITE est placé sur une\nmystérieuse machine…\pVoulez-vous retirer le METEORITE?$
```
### MtChimney_Text_PlayerRemovedMeteorite
```
{PLAYER} retire le METEORITE de la\nmystérieuse machine.$
```
### MtChimney_Text_PlayerLeftMeteorite
```
{PLAYER} laisse le METEORITE à sa\nplace.$
```
### MtChimney_Text_MachineMakesNoResponse
```
Cette mystérieuse machine…\nElle ne répond pas.$
```
### MtChimney_Text_RouteSign
```
{DOWN_ARROW} SENTIER SINUROC\nVERMILAVA DROIT DEVANT$
```
### MtChimney_Text_ShelbyIntro
```
Je suis allée aux sources chaudes pour\nrevigorer mes os fatigués.\lMaintenant, je me sens forte!$
```
### MtChimney_Text_ShelbyDefeat
```
Oh, ça alors!\nQuel DRESSEUR tu fais!$
```
### MtChimney_Text_ShelbyPostBattle
```
Eh bien, j'ai perdu. Je ne peux plus me\nconsidérer comme étant EXPERT, hein?$
```
### MtChimney_Text_ShelbyRegister
```
Merci, mon p'tit! C'était amusant.\nComme si je m'étais battue contre\lmes petits-enfants.\pReviens me voir quand tu veux\npour une revanche.$
```
### MtChimney_Text_ShelbyRematchIntro
```
Si tu réussis à toucher le cœur\nde tes POKéMON, tu devrais pouvoir\laccomplir de grandes choses.$
```
### MtChimney_Text_ShelbyRematchDefeat
```
Oh, ça alors!\nQuel DRESSEUR tu fais!$
```
### MtChimney_Text_ShelbyPostRematch
```
Peut-être ton cœur ne fait-il plus\nqu'un avec celui de tes POKéMON.$
```
### MtChimney_Text_MelissaIntro
```
J'ai le feu en moi, bébé.\nJ'en peux plus! Il faut que j'me batte!$
```
### MtChimney_Text_MelissaDefeat
```
Oh, oh! C'était un combat torride!$
```
### MtChimney_Text_MelissaPostBattle
```
La chaleur du MONT CHIMNEE avive\nle feu qui brûle en moi, bébé!$
```
### MtChimney_Text_SheilaIntro
```
Je suis enfin parvenue au MONT CHIMNEE.\nJe veux que mon POKéMON combatte!$
```
### MtChimney_Text_SheilaDefeat
```
La façon dont tu te bats… C'est comme\nune éruption du MONT CHIMNEE!$
```
### MtChimney_Text_SheilaPostBattle
```
Comme je l'ai dit, je suis enfin parvenue\nau MONT CHIMNEE. Ce serait dommage\lque ce ne soit qu'en touriste…\pJe veux gagner quelques combats et\nramener des COOKIES en souvenir.$
```
### MtChimney_Text_ShirleyIntro
```
Depuis ma baignade dans les sources\nchaudes, je suis en super forme!\pJe suis sûre que je vais gagner!$
```
### MtChimney_Text_ShirleyDefeat
```
Atchoum!\nJe prends froid hors de l'eau.$
```
### MtChimney_Text_ShirleyPostBattle
```
Je vais devoir prendre un autre bain\ndans les sources chaudes. Tu viens?\pJe plaisante!$
```
### MtChimney_Text_SawyerIntro
```
C'est une belle montagne! Pleine de\ngens pour te tenir compagnie!$
```
### MtChimney_Text_SawyerDefeat
```
Oh, tu as le feu, toi!$
```
### MtChimney_Text_SawyerPostBattle
```
Je ferais mieux d'aller me baigner\navec les gens du coin!$
```
### MtChimney_Text_SawyerRegister
```
J'aime les petites boules de feu\ncomme toi.\pLaisse-moi t'enregistrer dans mon\nPOKéNAV.$
```
### MtChimney_Text_SawyerRematchIntro
```
Je suis entouré de gens chauds comme\nla braise, je ne peux pas perdre!$
```
### MtChimney_Text_SawyerRematchDefeat
```
Tu as autant le feu qu'avant!$
```
### MtChimney_Text_SawyerPostRematch
```
En fait, il fait un peu trop chaud ici.\nJe dois être un peu trop habillé.$
```

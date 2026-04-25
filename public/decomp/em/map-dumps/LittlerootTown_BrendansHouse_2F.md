# LittlerootTown_BrendansHouse_2F

## Métadonnées
- **id** : `MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F`
- **layout** : `LAYOUT_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F`
- **music** : `MUS_LITTLEROOT`
- **region_map_section** : `MAPSEC_LITTLEROOT_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (16 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_RIVALS_HOUSE_2F_RIVAL` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 7,1 | `MOVEMENT_TYPE_FACE_DOWN` | `RivalsHouse_2F_EventScript_Rival` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM` |
| `` | `OBJ_EVENT_GFX_VAR_0` | 0,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_1` |
| `` | `OBJ_EVENT_GFX_VAR_1` | 0,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_2` |
| `` | `OBJ_EVENT_GFX_VAR_2` | 0,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_3` |
| `` | `OBJ_EVENT_GFX_VAR_3` | 0,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_4` |
| `` | `OBJ_EVENT_GFX_VAR_4` | 0,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_5` |
| `` | `OBJ_EVENT_GFX_VAR_5` | 0,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_6` |
| `` | `OBJ_EVENT_GFX_VAR_6` | 1,0 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_7` |
| `` | `OBJ_EVENT_GFX_VAR_7` | 1,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_8` |
| `` | `OBJ_EVENT_GFX_VAR_8` | 1,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_9` |
| `` | `OBJ_EVENT_GFX_VAR_9` | 1,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_10` |
| `` | `OBJ_EVENT_GFX_VAR_A` | 1,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_11` |
| `` | `OBJ_EVENT_GFX_VAR_B` | 1,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_DECORATION_12` |
| `LOCALID_PLAYERS_HOUSE_2F_MOM` | `OBJ_EVENT_GFX_MOM` | 7,1 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_BEDROOM_MOM` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `LittlerootTown_BrendansHouse_2F_EventScript_RivalsPokeBall` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL` |
| `` | `OBJ_EVENT_GFX_SWABLU_DOLL` | 5,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_SWABLU_DOLL` |

## Warps (1)
- #0 (7,1) → `MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F` warp #2

## BG events / signs (4)
- (0,1) [sign] → `LittlerootTown_BrendansHouse_2F_EventScript_PC`
- (1,1) [sign] → `PlayersHouse_2F_EventScript_Notebook`
- (5,1) [sign] → `LittlerootTown_BrendansHouse_2F_EventScript_WallClock`
- (3,1) [sign] → `PlayersHouse_2F_EventScript_GameCube`

## Flags référencés (3)
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM`
- `FLAG_MET_RIVAL_LILYCOVE`

## Variables référencées (9)
- `VAR_0x8004`
- `VAR_BIRCH_LAB_STATE`
- `VAR_DEX_UPGRADE_JOHTO_STARTER_STATE`
- `VAR_FACING`
- `VAR_LITTLEROOT_INTRO_STATE`
- `VAR_LITTLEROOT_RIVAL_STATE`
- `VAR_LITTLEROOT_TOWN_STATE`
- `VAR_RESULT`
- `VAR_SECRET_BASE_INITIALIZED`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `RivalsHouse_2F_Text_BrendanWhoAreYou`
- `RivalsHouse_2F_Text_ItsRivalsPokeBall`
- `gText_PlayerHouseBootPC`
- `gText_PokemonTrainerSchoolEmail`
### data/scripts/secret_base.inc
- `SecretBase_EventScript_SetDecorationFlags`

## Scripts (34)
### LittlerootTown_BrendansHouse_2F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LittlerootTown_BrendansHouse_2F_OnTransition
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, LittlerootTown_BrendansHouse_2F_OnWarp
```
### LittlerootTown_BrendansHouse_2F_OnTransition
```
call_if_lt VAR_LITTLEROOT_RIVAL_STATE, 2, LittlerootTown_BrendansHouse_2F_EventScript_CheckSetReadyToMeetBrendan
call_if_ge VAR_LITTLEROOT_RIVAL_STATE, 3, LittlerootTown_BrendansHouse_2F_EventScript_CheckShouldUpdateBrendanPos
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 4, PlayersHouse_2F_EventScript_BlockStairsUntilClockIsSet
call SecretBase_EventScript_SetDecorationFlags
setvar VAR_SECRET_BASE_INITIALIZED, 0
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_CheckShouldUpdateBrendanPos
```
goto_if_set FLAG_MET_RIVAL_LILYCOVE, LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos
goto_if_ge VAR_BIRCH_LAB_STATE, 2, LittlerootTown_BrendansHouse_2F_EventScript_Ret
goto LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos
```
### LittlerootTown_BrendansHouse_2F_EventScript_TryUpdateBrendanPos
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, LittlerootTown_BrendansHouse_2F_EventScript_Ret
goto_if_ge VAR_DEX_UPGRADE_JOHTO_STARTER_STATE, 2, LittlerootTown_MaysHouse_2F_EventScript_Ret
setobjectxyperm LOCALID_RIVALS_HOUSE_2F_RIVAL, 0, 2
setobjectmovementtype LOCALID_RIVALS_HOUSE_2F_RIVAL, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_BrendansHouse_2F_EventScript_Ret
```
return
```
### LittlerootTown_BrendansHouse_2F_EventScript_CheckSetReadyToMeetBrendan
```
checkplayergender
goto_if_eq VAR_RESULT, FEMALE, LittlerootTown_BrendansHouse_2F_EventScript_SetReadyToMeetBrendan
return
```
### LittlerootTown_BrendansHouse_2F_EventScript_SetReadyToMeetBrendan
```
setvar VAR_LITTLEROOT_RIVAL_STATE, 2
return
```
### LittlerootTown_BrendansHouse_2F_OnWarp
```
map_script_2 VAR_SECRET_BASE_INITIALIZED, 0, LittlerootTown_BrendansHouse_2F_EventScript_CheckInitDecor
```
### LittlerootTown_BrendansHouse_2F_EventScript_CheckInitDecor
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, SecretBase_EventScript_InitDecorations
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_RivalsPokeBall
```
lockall
goto_if_eq VAR_LITTLEROOT_RIVAL_STATE, 2, LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendan
msgbox RivalsHouse_2F_Text_ItsRivalsPokeBall, MSGBOX_DEFAULT
releaseall
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendan
```
delay 10
addobject LOCALID_RIVALS_HOUSE_2F_RIVAL
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanEnters
waitmovement 0
playse SE_PIN
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, Common_Movement_Delay48
waitmovement 0
delay 10
playbgm MUS_ENCOUNTER_BRENDAN, TRUE
call_if_eq VAR_FACING, DIR_NORTH, LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanNorth
call_if_eq VAR_FACING, DIR_SOUTH, LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanSouth
call_if_eq VAR_FACING, DIR_WEST, LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanWest
call_if_eq VAR_FACING, DIR_EAST, LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanEast
setvar VAR_LITTLEROOT_RIVAL_STATE, 3
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL
clearflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM
setvar VAR_LITTLEROOT_TOWN_STATE, 1
savebgm MUS_DUMMY
fadedefaultbgm
releaseall
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanNorth
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerNorth
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox RivalsHouse_2F_Text_BrendanWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanNorth
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCNorth
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanSouth
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerSouth
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox RivalsHouse_2F_Text_BrendanWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanSouth
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCSouth
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanWest
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerWest
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox RivalsHouse_2F_Text_BrendanWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanWest
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCWest
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_2F_EventScript_MeetBrendanEast
```
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerEast
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox RivalsHouse_2F_Text_BrendanWhoAreYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_RIVALS_HOUSE_2F_RIVAL, LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCEast
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanEnters
```
walk_down
walk_down
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerNorth
```
walk_left
walk_left
walk_down
walk_down
walk_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCNorth
```
walk_up
walk_up
walk_up
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanNorth
```
delay_16
walk_in_place_faster_up
delay_16
delay_16
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerSouth
```
walk_left
walk_left
walk_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCSouth
```
walk_up
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanSouth
```
delay_16
walk_in_place_faster_up
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerWest
```
walk_left
walk_left
walk_down
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCWest
```
walk_up
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanWest
```
delay_8
delay_16
walk_in_place_faster_up
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanApproachPlayerEast
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_down
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_BrendanWalkToPCEast
```
walk_up
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### LittlerootTown_BrendansHouse_2F_Movement_PlayerWatchBrendanEast
```
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_2F_EventScript_PC
```
lockall
checkplayergender
goto_if_eq VAR_RESULT, MALE, LittlerootTown_BrendansHouse_2F_EventScript_CheckPlayersPC
goto_if_eq VAR_RESULT, FEMALE, LittlerootTown_BrendansHouse_2F_EventScript_CheckRivalsPC
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_CheckPlayersPC
```
setvar VAR_0x8004, PC_LOCATION_BRENDANS_HOUSE
special DoPCTurnOnEffect
playse SE_PC_ON
msgbox gText_PlayerHouseBootPC, MSGBOX_DEFAULT
special BedroomPC
releaseall
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_TurnOffPlayerPC
```
setvar VAR_0x8004, PC_LOCATION_BRENDANS_HOUSE
playse SE_PC_OFF
special DoPCTurnOffEffect
releaseall
end
```
### LittlerootTown_BrendansHouse_2F_EventScript_CheckRivalsPC
```
msgbox gText_PokemonTrainerSchoolEmail, MSGBOX_DEFAULT
releaseall
end
```
### PlayersHouse_2F_EventScript_Notebook
```
msgbox PlayersHouse_2F_Text_Notebook, MSGBOX_SIGN
end
```
### PlayersHouse_2F_EventScript_GameCube
```
msgbox PlayersHouse_2F_Text_ItsAGameCube, MSGBOX_SIGN
end
```

## Textes (5)
### PlayersHouse_2F_Text_ClockIsStopped
```
L'horloge est arrêtée…\pIl vaudrait mieux la mettre à l'heure!$
```
### PlayersHouse_2F_Text_HowDoYouLikeYourRoom
```
MAMAN: {PLAYER}, ta nouvelle chambre\nte plaît?\pExcellent! Tout est bien rangé!\pIls ont aussi fini de tout mettre en\nplace en bas.\pCes déménageurs POKéMON sont\nvraiment très pratiques!\pOh, assure-toi que tes affaires se\ntrouvent bien sur ton bureau.$
```
### PlayersHouse_2F_Text_Notebook
```
{PLAYER} ouvre le cahier.\pREGLE Nº 1\nOuvrez le MENU en appuyant sur START.\pREGLE Nº 2\nSauvegardez en choisissant SAUVER.\pLes pages suivantes sont vierges…$
```
### Common_Text_LookCloserAtMap
```
{PLAYER} regarde attentivement la\ncarte de la région de HOENN.$
```
### PlayersHouse_2F_Text_ItsAGameCube
```
C'est une Nintendo GameCube.\pUne Game Boy Advance est branchée\ndessus et sert de manette.$
```

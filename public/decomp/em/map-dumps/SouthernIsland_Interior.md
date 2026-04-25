# SouthernIsland_Interior

## Métadonnées
- **id** : `MAP_SOUTHERN_ISLAND_INTERIOR`
- **layout** : `LAYOUT_SOUTHERN_ISLAND_INTERIOR`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_SOUTHERN_ISLAND`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_VAR_0` | 13,12 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_SOUTHERN_ISLAND_EON_STONE` |
| `LOCALID_SOUTHERN_ISLAND_LATI` | `OBJ_EVENT_GFX_VAR_1` | 13,2 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SOUTHERN_ISLAND_UNCHOSEN_EON_DUO_MON` |

## Warps (2)
- #0 (13,18) → `MAP_SOUTHERN_ISLAND_EXTERIOR` warp #0
- #1 (14,18) → `MAP_SOUTHERN_ISLAND_EXTERIOR` warp #1

## BG events / signs (1)
- (13,11) [sign] → `SouthernIsland_Interior_EventScript_TryLatiEncounter`

## Flags référencés (6)
- `FLAG_CAUGHT_LATIAS_OR_LATIOS`
- `FLAG_DEFEATED_LATIAS_OR_LATIOS`
- `FLAG_ENABLE_SHIP_SOUTHERN_ISLAND`
- `FLAG_ENCOUNTERED_LATIAS_OR_LATIOS`
- `FLAG_SYS_CTRL_OBJ_DELETE`
- `FLAG_TEMP_2`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8008`
- `VAR_LAST_TALKED`
- `VAR_OBJ_GFX_ID_0`
- `VAR_OBJ_GFX_ID_1`
- `VAR_RESULT`
- `VAR_ROAMER_POKEMON`
- `VAR_TEMP_4`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_LegendaryFlewAway`
- `SouthernIsland_Interior_Text_Sign`

## Scripts (19)
### SouthernIsland_Interior_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, SouthernIsland_Interior_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, SouthernIsland_Interior_OnTransition
```
### SouthernIsland_Interior_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, SouthernIsland_Interior_EventScript_TryRemoveLati
end
```
### SouthernIsland_Interior_EventScript_TryRemoveLati
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject LOCALID_SOUTHERN_ISLAND_LATI
return
```
### SouthernIsland_Interior_OnTransition
```
call_if_eq VAR_ROAMER_POKEMON, 0, SouthernIsland_Interior_EventScript_SetUpLatios
call_if_ne VAR_ROAMER_POKEMON, 0, SouthernIsland_Interior_EventScript_SetUpLatias
call SouthernIsland_Interior_EventScript_SetUpPlayerGfx
end
```
### SouthernIsland_Interior_EventScript_SetUpLatios
```
setvar VAR_OBJ_GFX_ID_1, OBJ_EVENT_GFX_LATIOS
setvar VAR_TEMP_4, SPECIES_LATIOS
return
```
### SouthernIsland_Interior_EventScript_SetUpLatias
```
setvar VAR_OBJ_GFX_ID_1, OBJ_EVENT_GFX_LATIAS
setvar VAR_TEMP_4, SPECIES_LATIAS
return
```
### SouthernIsland_Interior_EventScript_SetUpPlayerGfx
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, SouthernIsland_Interior_EventScript_SetBrendanGfx
goto_if_eq VAR_RESULT, FEMALE, SouthernIsland_Interior_EventScript_SetMayGfx
end
```
### SouthernIsland_Interior_EventScript_SetBrendanGfx
```
setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL
return
```
### SouthernIsland_Interior_EventScript_SetMayGfx
```
setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL
return
```
### SouthernIsland_Interior_EventScript_TryLatiEncounter
```
lockall
setvar VAR_0x8008, 12  @ Player's Y coordinate. Not read
goto SouthernIsland_Interior_EventScript_Lati
end
```
### SouthernIsland_Interior_EventScript_Lati
```
goto_if_set FLAG_TEMP_2, SouthernIsland_Interior_EventScript_Sign
goto_if_set FLAG_DEFEATED_LATIAS_OR_LATIOS, SouthernIsland_Interior_EventScript_Sign
goto_if_set FLAG_CAUGHT_LATIAS_OR_LATIOS, SouthernIsland_Interior_EventScript_Sign
goto_if_unset FLAG_ENABLE_SHIP_SOUTHERN_ISLAND, SouthernIsland_Interior_EventScript_Sign
setflag FLAG_ENCOUNTERED_LATIAS_OR_LATIOS
setflag FLAG_TEMP_2
special SpawnCameraObject
applymovement LOCALID_CAMERA, SouthernIsland_Interior_Movement_CameraPanUp
waitmovement 0
delay 50
waitse
playmoncry VAR_TEMP_4, CRY_MODE_NORMAL
delay 30
waitmoncry
addobject LOCALID_SOUTHERN_ISLAND_LATI
delay 30
applymovement LOCALID_CAMERA, SouthernIsland_Interior_Movement_CameraPanDown
applymovement LOCALID_SOUTHERN_ISLAND_LATI, SouthernIsland_Interior_Movement_LatiApproach
waitmovement 0
delay 50
special RemoveCameraObject
setvar VAR_LAST_TALKED, LOCALID_SOUTHERN_ISLAND_LATI
call_if_eq VAR_ROAMER_POKEMON, 0, SouthernIsland_Interior_EventScript_SetLatiosBattleVars
call_if_ne VAR_ROAMER_POKEMON, 0, SouthernIsland_Interior_EventScript_SetLatiasBattleVars
setflag FLAG_SYS_CTRL_OBJ_DELETE
special BattleSetup_StartLatiBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, SouthernIsland_Interior_EventScript_LatiDefeated
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, SouthernIsland_Interior_EventScript_RanFromLati
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, SouthernIsland_Interior_EventScript_RanFromLati
setflag FLAG_CAUGHT_LATIAS_OR_LATIOS
releaseall
end
```
### SouthernIsland_Interior_EventScript_LatiDefeated
```
setflag FLAG_DEFEATED_LATIAS_OR_LATIOS
copyvar VAR_0x8004, VAR_TEMP_4
goto Common_EventScript_LegendaryFlewAway
end
```
### SouthernIsland_Interior_EventScript_RanFromLati
```
copyvar VAR_0x8004, VAR_TEMP_4
goto Common_EventScript_LegendaryFlewAway
end
```
### SouthernIsland_Interior_EventScript_Sign
```
msgbox SouthernIsland_Interior_Text_Sign, MSGBOX_DEFAULT
releaseall
end
```
### SouthernIsland_Interior_EventScript_SetLatiosBattleVars
```
seteventmon SPECIES_LATIOS, 50, ITEM_SOUL_DEW
return
```
### SouthernIsland_Interior_EventScript_SetLatiasBattleVars
```
seteventmon SPECIES_LATIAS, 50, ITEM_SOUL_DEW
return
```
### SouthernIsland_Interior_Movement_CameraPanUp
```
walk_up
walk_up
walk_up
step_end
```
### SouthernIsland_Interior_Movement_CameraPanDown
```
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
walk_down
walk_down
walk_down
walk_in_place_faster_up
step_end
```
### SouthernIsland_Interior_Movement_LatiApproach
```
walk_down
walk_down
walk_down
walk_down
walk_down
delay_16
delay_16
walk_down
walk_down
walk_down
walk_down
step_end
```

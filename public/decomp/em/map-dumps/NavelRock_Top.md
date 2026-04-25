# NavelRock_Top

## Métadonnées
- **id** : `MAP_NAVEL_ROCK_TOP`
- **layout** : `LAYOUT_NAVEL_ROCK_TOP`
- **music** : `MUS_RG_SEVII_CAVE`
- **region_map_section** : `MAPSEC_NAVEL_ROCK`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_NAVEL_ROCK_HO_OH` | `OBJ_EVENT_GFX_HOOH` | 12,4 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_HO_OH` |

## Warps (1)
- #0 (13,20) → `MAP_NAVEL_ROCK_UP4` warp #1

## Coord events / triggers (1)
- (12,10) → `NavelRock_Top_EventScript_HoOh` (si `VAR_TEMP_1` == `0`)

## BG events / signs (1)
- (12,9) [hidden_item] → ``

## Flags référencés (4)
- `FLAG_CAUGHT_HO_OH`
- `FLAG_DEFEATED_HO_OH`
- `FLAG_HIDE_HO_OH`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_LegendaryFlewAway`

## Scripts (13)
### NavelRock_Top_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, NavelRock_Top_OnTransition
map_script MAP_SCRIPT_ON_RESUME, NavelRock_Top_OnResume
```
### NavelRock_Top_OnTransition
```
call_if_set FLAG_CAUGHT_HO_OH, NavelRock_Top_EventScript_HideHoOh
call_if_unset FLAG_CAUGHT_HO_OH, NavelRock_Top_EventScript_TryShowHoOh
end
```
### NavelRock_Top_EventScript_HideHoOh
```
setvar VAR_TEMP_1, 1
setflag FLAG_HIDE_HO_OH
return
```
### NavelRock_Top_EventScript_TryShowHoOh
```
setvar VAR_TEMP_1, 1
goto_if_set FLAG_DEFEATED_HO_OH, Common_EventScript_NopReturn
setvar VAR_TEMP_1, 0
clearflag FLAG_HIDE_HO_OH
return
```
### NavelRock_Top_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, NavelRock_Top_EventScript_TryRemoveHoOh
end
```
### NavelRock_Top_EventScript_TryRemoveHoOh
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject LOCALID_NAVEL_ROCK_HO_OH
return
```
### NavelRock_Top_EventScript_HoOh
```
lockall
setvar VAR_TEMP_1, 1
special SpawnCameraObject
setvar VAR_0x8004, 3  @ num loops
setvar VAR_0x8005, 35 @ delay
special LoopWingFlapSE
applymovement LOCALID_NAVEL_ROCK_HO_OH, NavelRock_Top_Movement_HoOhAppear
applymovement LOCALID_CAMERA, NavelRock_Top_Movement_CameraPanUp
waitmovement 0
delay 50
setweather WEATHER_NONE
doweather
waitse
playmoncry SPECIES_HO_OH, CRY_MODE_ENCOUNTER
delay 30
waitmoncry
delay 60
setvar VAR_0x8004, 3  @ num loops
setvar VAR_0x8005, 35 @ delay
special LoopWingFlapSE
applymovement LOCALID_CAMERA, NavelRock_Top_Movement_CameraPanDown
applymovement LOCALID_NAVEL_ROCK_HO_OH, NavelRock_Top_Movement_HoOhApproach
waitmovement 0
special RemoveCameraObject
seteventmon SPECIES_HO_OH, 70
setflag FLAG_SYS_CTRL_OBJ_DELETE
special BattleSetup_StartLegendaryBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
setvar VAR_LAST_TALKED, LOCALID_NAVEL_ROCK_HO_OH
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, NavelRock_Top_EventScript_DefeatedHoOh
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, NavelRock_Top_EventScript_RanFromHoOh
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, NavelRock_Top_EventScript_RanFromHoOh
setflag FLAG_CAUGHT_HO_OH
releaseall
end
```
### NavelRock_Top_EventScript_DefeatedHoOh
```
setflag FLAG_DEFEATED_HO_OH
setvar VAR_0x8004, SPECIES_HO_OH
goto Common_EventScript_LegendaryFlewAway
end
```
### NavelRock_Top_EventScript_RanFromHoOh
```
setvar VAR_0x8004, SPECIES_HO_OH
goto Common_EventScript_LegendaryFlewAway
end
```
### NavelRock_Top_Movement_CameraPanUp
```
walk_up
walk_up
walk_up
step_end
```
### NavelRock_Top_Movement_CameraPanDown
```
delay_16
delay_16
walk_down
walk_down
walk_down
step_end
```
### NavelRock_Top_Movement_HoOhApproach
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_in_place_down
delay_16
delay_16
step_end
```
### NavelRock_Top_Movement_HoOhAppear
```
delay_16
delay_16
walk_in_place_down
walk_in_place_down
walk_in_place_down
walk_in_place_down
step_end
```

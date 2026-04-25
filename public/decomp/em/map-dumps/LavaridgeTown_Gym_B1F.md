# LavaridgeTown_Gym_B1F

## Métadonnées
- **id** : `MAP_LAVARIDGE_TOWN_GYM_B1F`
- **layout** : `LAYOUT_LAVARIDGE_TOWN_GYM_B1F`
- **music** : `MUS_GYM`
- **region_map_section** : `MAPSEC_LAVARIDGE_TOWN`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_GYM`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_JACE` | `OBJ_EVENT_GFX_MAN_5` | 4,18 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_B1F_EventScript_Jace` | `0` |
| `LOCALID_KEEGAN` | `OBJ_EVENT_GFX_MAN_5` | 3,6 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_B1F_EventScript_Keegan` | `0` |
| `LOCALID_JEFF` | `OBJ_EVENT_GFX_MAN_5` | 13,17 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_B1F_EventScript_Jeff` | `0` |
| `LOCALID_ELI` | `OBJ_EVENT_GFX_HIKER` | 4,16 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_B1F_EventScript_Eli` | `0` |

## Warps (24)
- #0 (10,18) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #2
- #1 (0,17) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #6
- #2 (8,9) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #3
- #3 (5,14) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #5
- #4 (4,18) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #4
- #5 (5,9) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #7
- #6 (2,15) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #8
- #7 (3,14) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #9
- #8 (1,14) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #10
- #9 (0,10) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #11
- #10 (3,10) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #12
- #11 (0,6) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #13
- #12 (3,6) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #14
- #13 (5,6) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #15
- #14 (2,3) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #16
- #15 (5,2) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #17
- #16 (7,2) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #18
- #17 (8,6) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #19
- #18 (10,6) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #20
- #19 (12,3) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #22
- #20 (4,16) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #21
- #21 (14,6) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #23
- #22 (13,17) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #24
- #23 (12,12) → `MAP_LAVARIDGE_TOWN_GYM_1F` warp #25

## Variables référencées (4)
- `VAR_TEMP_7`
- `VAR_TEMP_8`
- `VAR_TEMP_9`
- `VAR_TEMP_A`

## Scripts (12)
### LavaridgeTown_Gym_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LavaridgeTown_Gym_B1F_OnTransition
```
### LavaridgeTown_Gym_B1F_OnTransition
```
call LavaridgeTown_Gym_B1F_EventScript_SetTrainerTempVars
call LavaridgeTown_Gym_B1F_EventScript_CheckBuryTrainers
end
```
### LavaridgeTown_Gym_B1F_EventScript_SetTrainerTempVars
```
setvar VAR_TEMP_7, 0
setvar VAR_TEMP_8, 0
setvar VAR_TEMP_9, 0
setvar VAR_TEMP_A, 0
goto_if_defeated TRAINER_KEEGAN, LavaridgeTown_Gym_B1F_EventScript_SetJaceTempVar
setvar VAR_TEMP_7, 1
```
### LavaridgeTown_Gym_B1F_EventScript_SetJaceTempVar
```
goto_if_defeated TRAINER_JACE, LavaridgeTown_Gym_B1F_EventScript_SetJeffTempVar
setvar VAR_TEMP_8, 1
```
### LavaridgeTown_Gym_B1F_EventScript_SetJeffTempVar
```
goto_if_defeated TRAINER_JEFF, LavaridgeTown_Gym_B1F_EventScript_SetEliTempVar
setvar VAR_TEMP_9, 1
```
### LavaridgeTown_Gym_B1F_EventScript_SetEliTempVar
```
goto_if_defeated TRAINER_ELI, LavaridgeTown_Gym_B1F_EventScript_EndSetTrainerTempVars
setvar VAR_TEMP_A, 1
```
### LavaridgeTown_Gym_B1F_EventScript_EndSetTrainerTempVars
```
return
```
### LavaridgeTown_Gym_B1F_EventScript_CheckBuryTrainers
```
goto_if_defeated TRAINER_KEEGAN, LavaridgeTown_Gym_B1F_EventScript_CheckBuryJace
setobjectmovementtype LOCALID_KEEGAN, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_B1F_EventScript_CheckBuryJace
```
goto_if_defeated TRAINER_JACE, LavaridgeTown_Gym_B1F_EventScript_CheckBuryJeff
setobjectmovementtype LOCALID_JACE, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_B1F_EventScript_CheckBuryJeff
```
goto_if_defeated TRAINER_JEFF, LavaridgeTown_Gym_B1F_EventScript_CheckBuryEli
setobjectmovementtype LOCALID_JEFF, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_B1F_EventScript_CheckBuryEli
```
goto_if_defeated TRAINER_ELI, LavaridgeTown_Gym_B1F_EventScript_EndCheckBuryTrainers
setobjectmovementtype LOCALID_ELI, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_B1F_EventScript_EndCheckBuryTrainers
```
return
```

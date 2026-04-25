# FieryPath

## Métadonnées
- **id** : `MAP_FIERY_PATH`
- **layout** : `LAYOUT_FIERY_PATH`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_FIERY_PATH`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 8,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `FieryPath_EventScript_ItemTMToxic` | `FLAG_ITEM_FIERY_PATH_TM_TOXIC` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 10,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 17,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 8,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 3,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 6,23 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 5,24 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 7,32 | `MOVEMENT_TYPE_LOOK_AROUND` | `FieryPath_EventScript_ItemFireStone` | `FLAG_ITEM_FIERY_PATH_FIRE_STONE` |

## Warps (2)
- #0 (26,36) → `MAP_ROUTE112` warp #4
- #1 (26,4) → `MAP_ROUTE112` warp #5

## Flags référencés (3)
- `FLAG_HIDE_FALLARBOR_TOWN_BATTLE_TENT_SCOTT`
- `FLAG_HIDE_VERDANTURF_TOWN_SCOTT`
- `FLAG_LANDMARK_FIERY_PATH`

## Scripts (3)
### FieryPath_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, FieryPath_OnTransition
```
### FieryPath_OnTransition
```
call_if_unset FLAG_LANDMARK_FIERY_PATH, FieryPath_EventScript_MoveScottToFallarbor
setflag FLAG_LANDMARK_FIERY_PATH
end
```
### FieryPath_EventScript_MoveScottToFallarbor
```
setflag FLAG_HIDE_VERDANTURF_TOWN_SCOTT
clearflag FLAG_HIDE_FALLARBOR_TOWN_BATTLE_TENT_SCOTT
return
```

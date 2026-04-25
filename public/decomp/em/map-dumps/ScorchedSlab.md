# ScorchedSlab

## Métadonnées
- **id** : `MAP_SCORCHED_SLAB`
- **layout** : `LAYOUT_SCORCHED_SLAB`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_SCORCHED_SLAB`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 7,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `ScorchedSlab_EventScript_ItemTMSunnyDay` | `FLAG_ITEM_SCORCHED_SLAB_TM_SUNNY_DAY` |

## Warps (1)
- #0 (7,16) → `MAP_ROUTE120` warp #1

## Flags référencés (1)
- `FLAG_LANDMARK_SCORCHED_SLAB`

## Scripts (2)
### ScorchedSlab_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, ScorchedSlab_OnTransition
```
### ScorchedSlab_OnTransition
```
setflag FLAG_LANDMARK_SCORCHED_SLAB
end
```

# SeafloorCavern_Room2

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ROOM2`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ROOM2`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 13,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 10,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 13,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 4,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 7,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 8,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_18` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 9,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_19` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 4,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_17` |

## Warps (4)
- #0 (10,7) → `MAP_SEAFLOOR_CAVERN_ROOM1` warp #2
- #1 (4,10) → `MAP_SEAFLOOR_CAVERN_ROOM4` warp #0
- #2 (6,1) → `MAP_SEAFLOOR_CAVERN_ROOM6` warp #0
- #3 (11,1) → `MAP_SEAFLOOR_CAVERN_ROOM7` warp #0

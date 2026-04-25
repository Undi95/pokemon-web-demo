# SeafloorCavern_Room5

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ROOM5`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ROOM5`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 3,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 4,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 11,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 3,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 13,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_14` |

## Warps (3)
- #0 (4,1) → `MAP_SEAFLOOR_CAVERN_ROOM1` warp #1
- #1 (15,12) → `MAP_SEAFLOOR_CAVERN_ROOM4` warp #1
- #2 (7,17) → `MAP_SEAFLOOR_CAVERN_ROOM4` warp #2

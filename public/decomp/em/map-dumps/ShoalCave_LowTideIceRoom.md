# ShoalCave_LowTideIceRoom

## Métadonnées
- **id** : `MAP_SHOAL_CAVE_LOW_TIDE_ICE_ROOM`
- **layout** : `LAYOUT_SHOAL_CAVE_LOW_TIDE_ICE_ROOM`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_SHOAL_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 12,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `ShoalCave_LowTideIceRoom_EventScript_ItemTMHail` | `FLAG_ITEM_SHOAL_CAVE_ICE_ROOM_TM_HAIL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 12,21 | `MOVEMENT_TYPE_LOOK_AROUND` | `ShoalCave_LowTideIceRoom_EventScript_ItemNeverMeltIce` | `FLAG_ITEM_SHOAL_CAVE_ICE_ROOM_NEVER_MELT_ICE` |

## Warps (1)
- #0 (17,10) → `MAP_SHOAL_CAVE_LOW_TIDE_LOWER_ROOM` warp #3

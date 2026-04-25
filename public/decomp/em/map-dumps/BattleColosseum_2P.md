# BattleColosseum_2P

## Métadonnées
- **id** : `MAP_BATTLE_COLOSSEUM_2P`
- **layout** : `LAYOUT_BATTLE_COLOSSEUM_2P`
- **music** : `MUS_EVER_GRANDE`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_FRONTIER`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_LINK_RECEPTIONIST` | 9,3 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleColosseum_2P_EventScript_Attendant` | `0` |

## Warps (2)
- #0 (6,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (7,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Coord events / triggers (2)
- (3,5) → `EventScript_BattleColosseum_2P_PlayerSpot0` (si `VAR_TEMP_0` == `0`)
- (10,5) → `EventScript_BattleColosseum_2P_PlayerSpot1` (si `VAR_TEMP_0` == `0`)

# RecordCorner

## Métadonnées
- **id** : `MAP_RECORD_CORNER`
- **layout** : `LAYOUT_RECORD_CORNER`
- **music** : `MUS_EVER_GRANDE`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_LINK_RECEPTIONIST` | 10,5 | `MOVEMENT_TYPE_FACE_DOWN` | `RecordCorner_EventScript_Attendant` | `0` |

## Warps (4)
- #0 (8,9) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (9,9) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #2 (11,9) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #3 (10,9) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Coord events / triggers (4)
- (6,4) → `EventScript_RecordCenter_Spot0` (si `VAR_TEMP_0` == `0`)
- (6,6) → `EventScript_RecordCenter_Spot2` (si `VAR_TEMP_0` == `0`)
- (13,4) → `EventScript_RecordCenter_Spot1` (si `VAR_TEMP_0` == `0`)
- (13,6) → `EventScript_RecordCenter_Spot3` (si `VAR_TEMP_0` == `0`)

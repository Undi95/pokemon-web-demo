# TradeCenter

## Métadonnées
- **id** : `MAP_TRADE_CENTER`
- **layout** : `LAYOUT_TRADE_CENTER`
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
| `` | `OBJ_EVENT_GFX_LINK_RECEPTIONIST` | 9,6 | `MOVEMENT_TYPE_FACE_LEFT` | `TradeCenter_EventScript_Attendant` | `0` |

## Warps (2)
- #0 (5,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (6,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Coord events / triggers (2)
- (4,5) → `EventScript_TradeCenter_Chair0` (si `VAR_TEMP_0` == `0`)
- (7,5) → `EventScript_TradeCenter_Chair1` (si `VAR_TEMP_0` == `0`)

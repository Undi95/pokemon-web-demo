# SafariZone_Northwest

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_NORTHWEST`
- **layout** : `LAYOUT_SAFARI_ZONE_NORTHWEST`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- right (offset 0) → `MAP_SAFARI_ZONE_NORTH`
- down (offset 0) → `MAP_SAFARI_ZONE_SOUTHWEST`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_1` | 8,8 | `MOVEMENT_TYPE_FACE_DOWN` | `SafariZone_Northwest_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 33,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Northwest_EventScript_ItemTMSolarBeam` | `FLAG_ITEM_SAFARI_ZONE_NORTH_WEST_TM_SOLAR_BEAM` |

## Scripts (1)
### SafariZone_Northwest_EventScript_Man
```
msgbox SafariZone_Northwest_Text_Man, MSGBOX_NPC
end
```

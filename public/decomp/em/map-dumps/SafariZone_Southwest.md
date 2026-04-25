# SafariZone_Southwest

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_SOUTHWEST`
- **layout** : `LAYOUT_SAFARI_ZONE_SOUTHWEST`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_SAFARI_ZONE_NORTHWEST`
- right (offset 0) → `MAP_SAFARI_ZONE_SOUTH`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 22,9 | `MOVEMENT_TYPE_FACE_DOWN` | `SafariZone_Southwest_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 0,37 | `MOVEMENT_TYPE_LOOK_AROUND` | `SafariZone_Southwest_EventScript_ItemMaxRevive` | `FLAG_ITEM_SAFARI_ZONE_SOUTH_WEST_MAX_REVIVE` |

## Warps (1)
- #0 (29,7) → `MAP_SAFARI_ZONE_REST_HOUSE` warp #0

## BG events / signs (1)
- (32,7) [sign] → `SafariZone_Southwest_EventScript_RestHouseSign`

## Scripts (2)
### SafariZone_Southwest_EventScript_Woman
```
msgbox SafariZone_Southwest_Text_Woman, MSGBOX_NPC
end
```
### SafariZone_Southwest_EventScript_RestHouseSign
```
msgbox SafariZone_Southwest_Text_RestHouseSign, MSGBOX_SIGN
end
```

# SafariZone_RestHouse

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_REST_HOUSE`
- **layout** : `LAYOUT_SAFARI_ZONE_REST_HOUSE`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 7,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SafariZone_RestHouse_EventScript_Youngster` | `0` |
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 8,4 | `MOVEMENT_TYPE_FACE_LEFT` | `SafariZone_RestHouse_EventScript_PsychicM` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 2,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `SafariZone_RestHouse_EventScript_FatMan` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_SAFARI_ZONE_SOUTHWEST` warp #0
- #1 (4,8) → `MAP_SAFARI_ZONE_SOUTHWEST` warp #0

## Scripts (3)
### SafariZone_RestHouse_EventScript_Youngster
```
msgbox SafariZone_RestHouse_Text_Youngster, MSGBOX_NPC
end
```
### SafariZone_RestHouse_EventScript_PsychicM
```
msgbox SafariZone_RestHouse_Text_PsychicM, MSGBOX_NPC
end
```
### SafariZone_RestHouse_EventScript_FatMan
```
msgbox SafariZone_RestHouse_Text_FatMan, MSGBOX_NPC
end
```

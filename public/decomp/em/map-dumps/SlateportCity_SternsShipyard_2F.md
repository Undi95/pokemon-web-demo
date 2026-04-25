# SlateportCity_SternsShipyard_2F

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_STERNS_SHIPYARD_2F`
- **layout** : `LAYOUT_SLATEPORT_CITY_STERNS_SHIPYARD_2F`
- **music** : `MUS_SLATEPORT`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 10,7 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 8,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_SternsShipyard_2F_EventScript_Scientist1` | `0` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 0,9 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_SternsShipyard_2F_EventScript_Scientist2` | `0` |

## Warps (1)
- #0 (3,1) → `MAP_SLATEPORT_CITY_STERNS_SHIPYARD_1F` warp #2

## Scripts (2)
### SlateportCity_SternsShipyard_2F_EventScript_Scientist1
```
msgbox SlateportCity_SternsShipyard_2F_Text_ShipDesignMoreLikeBuilding, MSGBOX_NPC
end
```
### SlateportCity_SternsShipyard_2F_EventScript_Scientist2
```
msgbox SlateportCity_SternsShipyard_2F_Text_FloatsBecauseBuoyancy, MSGBOX_NPC
end
```

## Textes (2)
### SlateportCity_SternsShipyard_2F_Text_ShipDesignMoreLikeBuilding
```
Concevoir un grand bateau relève plus\nde la construction d'un vaste bâtiment\lque de l'assemblage d'un véhicule.$
```
### SlateportCity_SternsShipyard_2F_Text_FloatsBecauseBuoyancy
```
C'est étrange qu'un bateau fait d'acier\npuisse flotter, non?\pS'il flotte, c'est dû à ce que l'on\nappelle le principe de flottabilité.$
```

# SlateportCity_House

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_HOUSE`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_SLATEPORT`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 4,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_House_EventScript_PokefanM` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 7,4 | `MOVEMENT_TYPE_FACE_LEFT` | `SlateportCity_House_EventScript_Girl` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_SLATEPORT_CITY` warp #10
- #1 (4,7) → `MAP_SLATEPORT_CITY` warp #10

## Scripts (2)
### SlateportCity_House_EventScript_PokefanM
```
msgbox SlateportCity_House_Text_NatureToDoWithStatGains, MSGBOX_NPC
end
```
### SlateportCity_House_EventScript_Girl
```
msgbox SlateportCity_House_Text_MustBeGoingToBattleTent, MSGBOX_NPC
end
```

## Textes (2)
### SlateportCity_House_Text_NatureToDoWithStatGains
```
Mon POKéMON est PRESSE.\nC'est sa nature.\pSa VITESSE est plus élevée que celle de\nmes autres POKéMON.\pLa nature des POKéMON a peut-être\nun rapport avec leurs stats.$
```
### SlateportCity_House_Text_MustBeGoingToBattleTent
```
Tu es un DRESSEUR, n'est-ce pas?\pTu dois vouloir te rendre à la TENTE\nDE COMBAT de POIVRESSEL, non?$
```

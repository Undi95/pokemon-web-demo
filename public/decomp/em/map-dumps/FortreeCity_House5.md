# FortreeCity_House5

## Métadonnées
- **id** : `MAP_FORTREE_CITY_HOUSE5`
- **layout** : `LAYOUT_FORTREE_CITY_HOUSE1`
- **music** : `MUS_FORTREE`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 6,4 | `MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT` | `FortreeCity_House5_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_ZIGZAGOON_2` | 6,3 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_House5_EventScript_Zigzagoon` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 2,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `FortreeCity_House5_EventScript_Man` | `0` |

## Warps (2)
- #0 (3,5) → `MAP_FORTREE_CITY` warp #7
- #1 (4,5) → `MAP_FORTREE_CITY` warp #7

## Scripts (3)
### FortreeCity_House5_EventScript_PokefanF
```
msgbox FortreeCity_House5_Text_TreeHousesAreGreat, MSGBOX_NPC
end
```
### FortreeCity_House5_EventScript_Man
```
msgbox FortreeCity_House5_Text_AdaptedToNature, MSGBOX_NPC
end
```
### FortreeCity_House5_EventScript_Zigzagoon
```
lock
faceplayer
waitse
playmoncry SPECIES_ZIGZAGOON, CRY_MODE_NORMAL
msgbox FortreeCity_House5_Text_Zigzagoon, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (3)
### FortreeCity_House5_Text_TreeHousesAreGreat
```
Les cabanes de CIMETRONELLE\nsont géniales!\pJe trouve que c'est la ville parfaite\npour vivre avec les POKéMON.$
```
### FortreeCity_House5_Text_AdaptedToNature
```
Les POKéMON et les hommes se sont\nadaptés à la nature pour survivre.\pIl n'est pas nécessaire d'adapter la\nnature au mode de vie que l'on souhaite.$
```
### FortreeCity_House5_Text_Zigzagoon
```
ZIGZATON: Zaaaton!$
```

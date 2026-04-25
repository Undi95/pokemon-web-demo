# SootopolisCity_House5

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE5`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE2`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MANIAC` | 3,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_House5_EventScript_Maniac` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 6,3 | `MOVEMENT_TYPE_FACE_LEFT` | `SootopolisCity_House5_EventScript_Girl` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #8
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #8

## Scripts (2)
### SootopolisCity_House5_EventScript_Maniac
```
msgbox SootopolisCity_House5_Text_SootopolisMtPyreConnection, MSGBOX_NPC
end
```
### SootopolisCity_House5_EventScript_Girl
```
msgbox SootopolisCity_House5_Text_BrotherUsedToStudySea, MSGBOX_NPC
end
```

## Textes (2)
### SootopolisCity_House5_Text_SootopolisMtPyreConnection
```
Il semblerait qu'il existe un rapport\nentre ATALANOPOLIS et le MONT MEMORIA.\pAvec mes amis, on a fait des recherches\nà ce sujet au labo où je travaillais.$
```
### SootopolisCity_House5_Text_BrotherUsedToStudySea
```
Mon grand frère étudie la mer.$
```

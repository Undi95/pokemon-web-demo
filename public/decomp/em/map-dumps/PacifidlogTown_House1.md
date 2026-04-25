# PacifidlogTown_House1

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN_HOUSE1`
- **layout** : `LAYOUT_PACIFIDLOG_TOWN_HOUSE1`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_5` | 3,5 | `MOVEMENT_TYPE_FACE_DOWN` | `PacifidlogTown_House1_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 6,4 | `MOVEMENT_TYPE_FACE_LEFT` | `PacifidlogTown_House1_EventScript_Woman` | `0` |

## Warps (2)
- #0 (4,8) → `MAP_PACIFIDLOG_TOWN` warp #1
- #1 (5,8) → `MAP_PACIFIDLOG_TOWN` warp #1

## Scripts (2)
### PacifidlogTown_House1_EventScript_Man
```
msgbox PacifidlogTown_House1_Text_RegiStory, MSGBOX_NPC
end
```
### PacifidlogTown_House1_EventScript_Woman
```
msgbox PacifidlogTown_House1_Text_SixDotsOpenThreeDoors, MSGBOX_NPC
end
```

## Textes (2)
### PacifidlogTown_House1_Text_RegiStory
```
Dans la région de HOENN, il existe trois\nPOKéMON qui symbolisent la puissance\lde la pierre, de la glace et de l'acier.\pOn raconte qu'ils se cachent dans\ndes grottes obscures.\pC'est une histoire que j'ai entendue\nquand j'étais petit.$
```
### PacifidlogTown_House1_Text_SixDotsOpenThreeDoors
```
“Six points ouvrent trois portes.”\pPépé disait souvent ça, mais je ne sais\npas ce que ça veut dire.$
```

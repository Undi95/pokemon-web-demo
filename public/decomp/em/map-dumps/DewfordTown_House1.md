# DewfordTown_House1

## Métadonnées
- **id** : `MAP_DEWFORD_TOWN_HOUSE1`
- **layout** : `LAYOUT_HOUSE3`
- **music** : `MUS_DEWFORD`
- **region_map_section** : `MAPSEC_DEWFORD_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 6,3 | `MOVEMENT_TYPE_FACE_LEFT` | `DewfordTown_House1_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 3,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `DewfordTown_House1_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_ZIGZAGOON_2` | 4,2 | `MOVEMENT_TYPE_FACE_DOWN` | `DewfordTown_House1_EventScript_Zigzagoon` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_DEWFORD_TOWN` warp #3
- #1 (4,7) → `MAP_DEWFORD_TOWN` warp #3

## Scripts (3)
### DewfordTown_House1_EventScript_Man
```
msgbox DewfordTown_House1_Text_LotToBeSaidForLivingOnIsland, MSGBOX_NPC
end
```
### DewfordTown_House1_EventScript_Woman
```
msgbox DewfordTown_House1_Text_LifeGoesSlowlyOnIsland, MSGBOX_NPC
end
```
### DewfordTown_House1_EventScript_Zigzagoon
```
lock
faceplayer
waitse
playmoncry SPECIES_ZIGZAGOON, CRY_MODE_NORMAL
msgbox DewfordTown_House1_Text_Zigzagoon, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (3)
### DewfordTown_House1_Text_LotToBeSaidForLivingOnIsland
```
Je pourrais parler pendant des heures\nde la vie sur une si petite île, \pen harmonie avec sa famille et ses\nPOKéMON.$
```
### DewfordTown_House1_Text_LifeGoesSlowlyOnIsland
```
J'ai quitté POIVRESSEL pour\nvivre avec mon mari ici.\pLa vie passe lentement sur cette\nîle. Mais c'est un vrai bonheur d'être\lentourée de cette mer magnifique.$
```
### DewfordTown_House1_Text_Zigzagoon
```
ZIGZATON: Zaaaton!$
```

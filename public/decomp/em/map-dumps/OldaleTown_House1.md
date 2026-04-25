# OldaleTown_House1

## Métadonnées
- **id** : `MAP_OLDALE_TOWN_HOUSE1`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_OLDALE`
- **region_map_section** : `MAPSEC_OLDALE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 6,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `OldaleTown_House1_EventScript_Woman` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_OLDALE_TOWN` warp #0
- #1 (4,8) → `MAP_OLDALE_TOWN` warp #0

## Scripts (1)
### OldaleTown_House1_EventScript_Woman
```
msgbox OldaleTown_House1_Text_LeftPokemonGoesOutFirst, MSGBOX_NPC
end
```

## Textes (1)
### OldaleTown_House1_Text_LeftPokemonGoesOutFirst
```
Quand un combat de POKéMON commence,\ncelui qui est à gauche de la liste part\lau combat le premier.\pDonc, quand tu auras plus de POKéMON\ndans ton équipe, tu pourras modifier\ll'ordre des POKéMON.\pÇa pourrait te donner l'avantage.$
```

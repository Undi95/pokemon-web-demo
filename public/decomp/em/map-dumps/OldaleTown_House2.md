# OldaleTown_House2

## Métadonnées
- **id** : `MAP_OLDALE_TOWN_HOUSE2`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_OLDALE`
- **region_map_section** : `MAPSEC_OLDALE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 4,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `OldaleTown_House2_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 7,4 | `MOVEMENT_TYPE_FACE_LEFT` | `OldaleTown_House2_EventScript_Man` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_OLDALE_TOWN` warp #1
- #1 (4,7) → `MAP_OLDALE_TOWN` warp #1

## Scripts (2)
### OldaleTown_House2_EventScript_Woman
```
msgbox OldaleTown_House2_Text_PokemonLevelUp, MSGBOX_NPC
end
```
### OldaleTown_House2_EventScript_Man
```
msgbox OldaleTown_House2_Text_YoullGoFurtherWithStrongPokemon, MSGBOX_NPC
end
```

## Textes (2)
### OldaleTown_House2_Text_PokemonLevelUp
```
Lorsque les POKéMON se battent, ils\ngagnent de l'expérience et deviennent\lplus forts.$
```
### OldaleTown_House2_Text_YoullGoFurtherWithStrongPokemon
```
Si les POKéMON de ton équipe deviennent\nplus forts, tu pourras voyager plus\lloin.$
```

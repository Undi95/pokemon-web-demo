# LilycoveCity_House1

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_HOUSE1`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 4,5 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_House1_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_House1_EventScript_Kecleon` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_LILYCOVE_CITY` warp #8
- #1 (4,8) → `MAP_LILYCOVE_CITY` warp #8

## Scripts (2)
### LilycoveCity_House1_EventScript_ExpertM
```
msgbox LilycoveCity_House1_Text_PokemonPartnersNotTools, MSGBOX_NPC
end
```
### LilycoveCity_House1_EventScript_Kecleon
```
lock
faceplayer
waitse
playmoncry SPECIES_KECLEON, CRY_MODE_NORMAL
msgbox LilycoveCity_House1_Text_Kecleon, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (2)
### LilycoveCity_House1_Text_PokemonPartnersNotTools
```
Les POKéMON sont les partenaires des\nhommes. Ils ne sont pas nos outils.\pMalheureusement, certaines personnes\nne veulent pas comprendre ça…$
```
### LilycoveCity_House1_Text_Kecleon
```
KECLEON: Kécléééon?$
```

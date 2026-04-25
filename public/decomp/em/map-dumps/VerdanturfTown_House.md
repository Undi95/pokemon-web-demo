# VerdanturfTown_House

## Métadonnées
- **id** : `MAP_VERDANTURF_TOWN_HOUSE`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_VERDANTURF`
- **region_map_section** : `MAPSEC_VERDANTURF_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 4,5 | `MOVEMENT_TYPE_FACE_UP` | `VerdanturfTown_House_EventScript_Woman1` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `VerdanturfTown_House_EventScript_Woman2` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_VERDANTURF_TOWN` warp #6
- #1 (4,8) → `MAP_VERDANTURF_TOWN` warp #6

## Scripts (2)
### VerdanturfTown_House_EventScript_Woman1
```
msgbox VerdanturfTown_House_Text_TrainersGatherAtPokemonLeague, MSGBOX_NPC
end
```
### VerdanturfTown_House_EventScript_Woman2
```
msgbox VerdanturfTown_House_Text_DefeatEliteFourInARow, MSGBOX_NPC
end
```

## Textes (2)
### VerdanturfTown_House_Text_TrainersGatherAtPokemonLeague
```
Au loin, au fin fond d'ETERNARA,\nse trouve la LIGUE POKéMON.\pLes DRESSEURS qui s'y retrouvent sont\nterriblement doués.$
```
### VerdanturfTown_House_Text_DefeatEliteFourInARow
```
Dans la LIGUE POKéMON, la règle stipule\nque tu dois battre tous les membres\ldu CONSEIL 4 consécutivement.\pSi tu perds contre l'un d'entre eux, tu\ndois reprendre le défi depuis le début.$
```

# RustboroCity_Flat1_1F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_FLAT1_1F`
- **layout** : `LAYOUT_RUSTBORO_CITY_FLAT1_1F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 9,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_Flat1_1F_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 12,4 | `MOVEMENT_TYPE_FACE_LEFT` | `RustboroCity_Flat1_1F_EventScript_Woman` | `0` |

## Warps (3)
- #0 (6,7) → `MAP_RUSTBORO_CITY` warp #1
- #1 (7,7) → `MAP_RUSTBORO_CITY` warp #1
- #2 (2,1) → `MAP_RUSTBORO_CITY_FLAT1_2F` warp #0

## Scripts (2)
### RustboroCity_Flat1_1F_EventScript_Man
```
msgbox RustboroCity_Flat1_1F_Text_EveryPokemonHasAbility, MSGBOX_NPC
end
```
### RustboroCity_Flat1_1F_EventScript_Woman
```
msgbox RustboroCity_Flat1_1F_Text_PokemonStrange, MSGBOX_NPC
end
```

## Textes (2)
### RustboroCity_Flat1_1F_Text_EveryPokemonHasAbility
```
Chaque POKéMON a une capacité\nspéciale qu'il peut utiliser.$
```
### RustboroCity_Flat1_1F_Text_PokemonStrange
```
Les POKéMON sont des créatures\nsi étranges!$
```

# RustboroCity_Flat2_1F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_FLAT2_1F`
- **layout** : `LAYOUT_RUSTBORO_CITY_FLAT2_1F`
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
| `` | `OBJ_EVENT_GFX_SKITTY` | 11,4 | `MOVEMENT_TYPE_FACE_LEFT` | `RustboroCity_Flat2_1F_EventScript_Skitty` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_WOMAN` | 8,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_Flat2_1F_EventScript_OldWoman` | `0` |

## Warps (3)
- #0 (2,8) → `MAP_RUSTBORO_CITY` warp #10
- #1 (3,8) → `MAP_RUSTBORO_CITY` warp #10
- #2 (3,1) → `MAP_RUSTBORO_CITY_FLAT2_2F` warp #0

## Scripts (2)
### RustboroCity_Flat2_1F_EventScript_OldWoman
```
msgbox RustboroCity_Flat2_1F_Text_DevonWorkersLiveHere, MSGBOX_NPC
end
```
### RustboroCity_Flat2_1F_EventScript_Skitty
```
lock
faceplayer
waitse
playmoncry SPECIES_SKITTY, CRY_MODE_NORMAL
msgbox RustboroCity_Flat2_1F_Text_Skitty, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (2)
### RustboroCity_Flat2_1F_Text_DevonWorkersLiveHere
```
Les employés de DEVON vivent\ndans ce bâtiment.$
```
### RustboroCity_Flat2_1F_Text_Skitty
```
SKITTY: Skiiit!$
```

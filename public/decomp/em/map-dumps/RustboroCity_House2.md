# RustboroCity_House2

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_HOUSE2`
- **layout** : `LAYOUT_RUSTBORO_CITY_HOUSE`
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
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_House2_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 4,5 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_House2_EventScript_LittleGirl` | `0` |

## Warps (2)
- #0 (5,8) → `MAP_RUSTBORO_CITY` warp #9
- #1 (6,8) → `MAP_RUSTBORO_CITY` warp #9

## Scripts (2)
### RustboroCity_House2_EventScript_PokefanF
```
msgbox RustboroCity_House2_Text_TrainerSchoolExcellent, MSGBOX_NPC
end
```
### RustboroCity_House2_EventScript_LittleGirl
```
msgbox RustboroCity_House2_Text_RoxanneKnowsALot, MSGBOX_NPC
end
```

## Textes (2)
### RustboroCity_House2_Text_TrainerSchoolExcellent
```
L'ECOLE DE DRESSEURS est excellente.\pEn y étudiant, tu pourrais même devenir\nCHAMPION D'ARENE.$
```
### RustboroCity_House2_Text_RoxanneKnowsALot
```
ROXANNE, notre CHAMPION, en sait\nvraiment beaucoup sur les POKéMON.\pElle est également très forte!$
```

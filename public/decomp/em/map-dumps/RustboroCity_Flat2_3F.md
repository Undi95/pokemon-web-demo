# RustboroCity_Flat2_3F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_FLAT2_3F`
- **layout** : `LAYOUT_RUSTBORO_CITY_FLAT2_3F`
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
| `` | `OBJ_EVENT_GFX_DEVON_EMPLOYEE` | 7,3 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `RustboroCity_Flat2_3F_EventScript_DevonEmployee` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 12,2 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_Flat2_3F_EventScript_Woman` | `0` |

## Warps (1)
- #0 (1,1) → `MAP_RUSTBORO_CITY_FLAT2_2F` warp #1

## Scripts (2)
### RustboroCity_Flat2_3F_EventScript_DevonEmployee
```
msgbox RustboroCity_Flat2_3F_Text_PresidentCollectsRareStones, MSGBOX_NPC
end
```
### RustboroCity_Flat2_3F_EventScript_Woman
```
msgbox RustboroCity_Flat2_3F_Text_PresidentsSonAlsoCollectsRareStones, MSGBOX_NPC
end
```

## Textes (2)
### RustboroCity_Flat2_3F_Text_PresidentCollectsRareStones
```
Le DIRECTEUR de DEVON collectionne\nles pierres rares.$
```
### RustboroCity_Flat2_3F_Text_PresidentsSonAlsoCollectsRareStones
```
Je crois que le fils du DIRECTEUR\ncollectionne aussi les pierres rares.$
```

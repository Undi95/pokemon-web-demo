# LilycoveCity_DepartmentStore_2F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_2F`
- **layout** : `LAYOUT_LILYCOVE_CITY_DEPARTMENT_STORE_2F`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_COOK` | 8,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_DepartmentStore_2F_EventScript_Cook` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 0,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_2F_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 13,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_2F_EventScript_Sailor` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 10,6 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_DepartmentStore_2F_EventScript_ClerkRight` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 7,6 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_DepartmentStore_2F_EventScript_ClerkLeft` | `0` |

## Warps (3)
- #0 (16,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_1F` warp #2
- #1 (13,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_3F` warp #0
- #2 (2,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ELEVATOR` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (7)
### LilycoveCity_DepartmentStore_2F_EventScript_Cook
```
msgbox LilycoveCity_DepartmentStore_2F_Text_LearnToUseItemsProperly, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_2F_EventScript_PokefanF
```
msgbox LilycoveCity_DepartmentStore_2F_Text_GoodGiftForHusband, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_2F_EventScript_Sailor
```
msgbox LilycoveCity_DepartmentStore_2F_Text_StockUpOnItems, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_2F_EventScript_ClerkLeft
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LilycoveCity_DepartmentStore_2F_Pokemart1
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_2F_Pokemart1
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_2F_EventScript_ClerkRight
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LilycoveCity_DepartmentStore_2F_Pokemart2
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_2F_Pokemart2
```
pokemartlistend
```

## Textes (3)
### LilycoveCity_DepartmentStore_2F_Text_LearnToUseItemsProperly
```
Apprendre à utiliser correctement les\nobjets, c'est vraiment la base de tout.$
```
### LilycoveCity_DepartmentStore_2F_Text_GoodGiftForHusband
```
Mon mari m'attend à la maison.\nQu'est-ce qui pourrait lui faire plaisir?$
```
### LilycoveCity_DepartmentStore_2F_Text_StockUpOnItems
```
Je pars pour un long voyage.\nIl faut que je fasse le plein d'objets.$
```

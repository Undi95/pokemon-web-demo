# LilycoveCity_DepartmentStore_3F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_3F`
- **layout** : `LAYOUT_LILYCOVE_CITY_DEPARTMENT_STORE_3F`
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
| `` | `OBJ_EVENT_GFX_RUNNING_TRIATHLETE_M` | 0,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_3F_EventScript_TriathleteM` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 7,7 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_3F_EventScript_PokefanM` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 13,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_3F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 8,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_DepartmentStore_3F_EventScript_ClerkLeft` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 10,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_DepartmentStore_3F_EventScript_ClerkRight` | `0` |

## Warps (3)
- #0 (13,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_2F` warp #1
- #1 (16,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_4F` warp #0
- #2 (2,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ELEVATOR` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (7)
### LilycoveCity_DepartmentStore_3F_EventScript_ClerkLeft
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LilycoveCity_DepartmentStore_3F_Pokemart_Vitamins
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_3F_Pokemart_Vitamins
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_3F_EventScript_ClerkRight
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LilycoveCity_DepartmentStore_3F_Pokemart_StatBoosters
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_3F_Pokemart_StatBoosters
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_3F_EventScript_TriathleteM
```
msgbox LilycoveCity_DepartmentStore_3F_Text_ItemsBestForTougheningPokemon, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_3F_EventScript_PokefanM
```
msgbox LilycoveCity_DepartmentStore_3F_Text_WantMoreEndurance, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_3F_EventScript_Woman
```
msgbox LilycoveCity_DepartmentStore_3F_Text_GaveCarbosToSpeedUpMon, MSGBOX_NPC
end
```

## Textes (3)
### LilycoveCity_DepartmentStore_3F_Text_ItemsBestForTougheningPokemon
```
Pour endurcir les POKéMON en un rien\nde temps, rien de mieux que les objets.\pLes PROTEINES accroissent l'ATTAQUE et\nle CALCIUM augmente l'ATQ. SPE.$
```
### LilycoveCity_DepartmentStore_3F_Text_WantMoreEndurance
```
Je veux que mon POKéMON ait plus\nd'endurance.\pJe ne sais pas si je dois élever sa\nDEFENSE avec le FER ou sa DEF. SPE.\lavec le ZINC.$
```
### LilycoveCity_DepartmentStore_3F_Text_GaveCarbosToSpeedUpMon
```
J'ai donné du CARBONE à mon POKéMON\net sa VITESSE a augmenté.$
```

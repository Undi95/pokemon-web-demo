# LilycoveCity_DepartmentStore_4F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_4F`
- **layout** : `LAYOUT_LILYCOVE_CITY_DEPARTMENT_STORE_4F`
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
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 0,2 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_4F_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 6,2 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_4F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 13,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_4F_EventScript_Youngster` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 7,6 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_DepartmentStore_4F_EventScript_ClerkLeft` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 9,6 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_DepartmentStore_4F_EventScript_ClerkRight` | `0` |

## Warps (3)
- #0 (16,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_3F` warp #1
- #1 (13,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_5F` warp #0
- #2 (2,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ELEVATOR` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (7)
### LilycoveCity_DepartmentStore_4F_EventScript_Gentleman
```
msgbox LilycoveCity_DepartmentStore_4F_Text_AttackOrDefenseTM, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_4F_EventScript_Woman
```
msgbox LilycoveCity_DepartmentStore_4F_Text_FiftyDifferentTMs, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_4F_EventScript_Youngster
```
msgbox LilycoveCity_DepartmentStore_4F_Text_PokemonOnlyHaveFourMoves, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_4F_EventScript_ClerkLeft
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LilycoveCity_DepartmentStore_4F_Pokemart_AttackTMs
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_4F_Pokemart_AttackTMs
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_4F_EventScript_ClerkRight
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart LilycoveCity_DepartmentStore_4F_Pokemart_DefenseTMs
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_4F_Pokemart_DefenseTMs
```
pokemartlistend
```

## Textes (3)
### LilycoveCity_DepartmentStore_4F_Text_AttackOrDefenseTM
```
Humm…\pUne capacité offensive…\nUne capacité défensive…\pCe n'est pas facile de savoir quelle CT\ndoit apprendre un POKéMON…$
```
### LilycoveCity_DepartmentStore_4F_Text_FiftyDifferentTMs
```
Il y a tellement de CT différentes.\pUne brochure que j'ai lue indiquait\nqu'il y en avait cinquante sortes.$
```
### LilycoveCity_DepartmentStore_4F_Text_PokemonOnlyHaveFourMoves
```
J'aimerais bien avoir toutes les sortes\nde CT, mais un POKéMON ne peut\lapprendre que quatre capacités.$
```

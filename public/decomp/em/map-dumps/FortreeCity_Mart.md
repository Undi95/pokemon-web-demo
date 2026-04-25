# FortreeCity_Mart

## Métadonnées
- **id** : `MAP_FORTREE_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FORTREE_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `FortreeCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 9,3 | `MOVEMENT_TYPE_FACE_UP` | `FortreeCity_Mart_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 8,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `FortreeCity_Mart_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 5,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `FortreeCity_Mart_EventScript_Boy` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_FORTREE_CITY` warp #3
- #1 (4,7) → `MAP_FORTREE_CITY` warp #3

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (5)
### FortreeCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart FortreeCity_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### FortreeCity_Mart_Pokemart
```
pokemartlistend
```
### FortreeCity_Mart_EventScript_Woman
```
msgbox FortreeCity_Mart_Text_SuperRepelBetter, MSGBOX_NPC
end
```
### FortreeCity_Mart_EventScript_Girl
```
msgbox FortreeCity_Mart_Text_StockUpOnItems, MSGBOX_NPC
end
```
### FortreeCity_Mart_EventScript_Boy
```
msgbox FortreeCity_Mart_Text_RareCandyMakesMonGrow, MSGBOX_NPC
end
```

## Textes (3)
### FortreeCity_Mart_Text_SuperRepelBetter
```
SUPEREPOUSSE dure longtemps et\nfait tout le boulot.\pC'est plus efficace qu'un REPOUSSE\nordinaire.$
```
### FortreeCity_Mart_Text_StockUpOnItems
```
Je prends toujours plus d'objets qu'il\nne m'en faut réellement.\pOn ne sait jamais ce qui peut arriver.\nMieux vaut prévenir que guérir!$
```
### FortreeCity_Mart_Text_RareCandyMakesMonGrow
```
Un SUPER BONBON fait automatiquement\nmonter un POKéMON d'un niveau.$
```

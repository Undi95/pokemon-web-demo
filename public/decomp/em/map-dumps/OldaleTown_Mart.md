# OldaleTown_Mart

## Métadonnées
- **id** : `MAP_OLDALE_TOWN_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_OLDALE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_OLDALE_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `OldaleTown_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 5,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `OldaleTown_Mart_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 9,4 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `OldaleTown_Mart_EventScript_Boy` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_OLDALE_TOWN` warp #3
- #1 (4,7) → `MAP_OLDALE_TOWN` warp #3

## Flags référencés (1)
- `FLAG_ADVENTURE_STARTED`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (7)
### OldaleTown_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
goto_if_set FLAG_ADVENTURE_STARTED, OldaleTown_Mart_ExpandedItems
pokemart OldaleTown_Mart_Pokemart_Basic
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### OldaleTown_Mart_Pokemart_Basic
```
pokemartlistend
```
### OldaleTown_Mart_ExpandedItems
```
pokemart OldaleTown_Mart_Pokemart_Expanded
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### OldaleTown_Mart_Pokemart_Expanded
```
pokemartlistend
```
### OldaleTown_Mart_EventScript_Woman
```
lock
faceplayer
goto_if_set FLAG_ADVENTURE_STARTED, OldaleTown_Mart_EventScript_PokeBallsInStock
msgbox OldaleTown_Mart_Text_PokeBallsAreSoldOut, MSGBOX_DEFAULT
release
end
```
### OldaleTown_Mart_EventScript_PokeBallsInStock
```
msgbox OldaleTown_Mart_Text_ImGoingToBuyPokeBalls, MSGBOX_DEFAULT
release
end
```
### OldaleTown_Mart_EventScript_Boy
```
msgbox OldaleTown_Mart_Text_RestoreHPWithPotion, MSGBOX_NPC
end
```

## Textes (3)
### OldaleTown_Mart_Text_PokeBallsAreSoldOut
```
Le stock est épuisé. Je ne peux pas\nacheter de POKé BALLS.$
```
### OldaleTown_Mart_Text_ImGoingToBuyPokeBalls
```
Je vais acheter plein de POKé BALLS\net attraper plein de POKéMON!$
```
### OldaleTown_Mart_Text_RestoreHPWithPotion
```
Si un POKéMON est blessé et perd ses\nPV, il est K.O. et ne peut plus se battre.\pPour éviter que tes POKéMON ne soient\nK.O., soigne-les avec une POTION.$
```

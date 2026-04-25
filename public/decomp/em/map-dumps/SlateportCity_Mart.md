# SlateportCity_Mart

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SLATEPORT_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 4,2 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_Mart_EventScript_BlackBelt` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 5,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_Mart_EventScript_Man` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_SLATEPORT_CITY` warp #1
- #1 (4,7) → `MAP_SLATEPORT_CITY` warp #1

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (4)
### SlateportCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart SlateportCity_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Mart_Pokemart
```
pokemartlistend
```
### SlateportCity_Mart_EventScript_BlackBelt
```
msgbox SlateportCity_Mart_Text_SomeItemsOnlyAtMart, MSGBOX_NPC
end
```
### SlateportCity_Mart_EventScript_Man
```
msgbox SlateportCity_Mart_Text_GreatBallIsBetter, MSGBOX_NPC
end
```

## Textes (2)
### SlateportCity_Mart_Text_SomeItemsOnlyAtMart
```
Il doit y avoir certains produits\nintéressants au MARCHE.\pMais certains objets ne sont en vente\nque dans les BOUTIQUES POKéMON.$
```
### SlateportCity_Mart_Text_GreatBallIsBetter
```
La SUPER BALL est plus efficace que la\nPOKé BALL pour attraper des POKéMON.\pAvec ça, je devrais pouvoir attraper\nce POKéMON insaisissable…$
```

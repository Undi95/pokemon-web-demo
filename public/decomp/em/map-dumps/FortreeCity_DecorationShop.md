# FortreeCity_DecorationShop

## Métadonnées
- **id** : `MAP_FORTREE_CITY_DECORATION_SHOP`
- **layout** : `LAYOUT_FORTREE_CITY_DECORATION_SHOP`
- **music** : `MUS_FORTREE`
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
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 6,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `FortreeCity_DecorationShop_EventScript_PokefanM` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 0,4 | `MOVEMENT_TYPE_FACE_LEFT` | `FortreeCity_DecorationShop_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,2 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_DecorationShop_EventScript_ClerkDesks` | `0` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 6,2 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_DecorationShop_EventScript_ClerkChairs` | `0` |

## Warps (2)
- #0 (3,5) → `MAP_FORTREE_CITY` warp #8
- #1 (4,5) → `MAP_FORTREE_CITY` warp #8

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (6)
### FortreeCity_DecorationShop_EventScript_PokefanM
```
msgbox FortreeCity_DecorationShop_Text_MerchandiseSentToPC, MSGBOX_NPC
end
```
### FortreeCity_DecorationShop_EventScript_Girl
```
msgbox FortreeCity_DecorationShop_Text_BuyingDeskForDolls, MSGBOX_NPC
end
```
### FortreeCity_DecorationShop_EventScript_ClerkDesks
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration FortreeCity_DecorationShop_PokemartDecor_Desks
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### FortreeCity_DecorationShop_PokemartDecor_Desks
```
pokemartlistend
```
### FortreeCity_DecorationShop_EventScript_ClerkChairs
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration FortreeCity_DecorationShop_PokemartDecor_Chairs
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### FortreeCity_DecorationShop_PokemartDecor_Chairs
```
pokemartlistend
```

## Textes (2)
### FortreeCity_DecorationShop_Text_MerchandiseSentToPC
```
Ce que tu achètes ici est directement\nenvoyé sur ton PC.\pC'est génial! J'aimerais bien qu'on me\nlivre aussi comme ça, chez moi.$
```
### FortreeCity_DecorationShop_Text_BuyingDeskForDolls
```
Je vais acheter un beau bureau et\nmettre mes jolies POUPEES dessus.\pSinon, quand je vais décorer ma BASE\nSECRETE, mes POUPEES vont être salies\let couvertes d'échardes.$
```

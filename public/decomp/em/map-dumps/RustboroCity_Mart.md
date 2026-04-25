# RustboroCity_Mart

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_RUSTBORO_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 2,5 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_Mart_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 8,4 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `RustboroCity_Mart_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 8,2 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_Mart_EventScript_BugCatcher` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_RUSTBORO_CITY` warp #2
- #1 (4,7) → `MAP_RUSTBORO_CITY` warp #2

## Flags référencés (1)
- `FLAG_MET_DEVON_EMPLOYEE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (8)
### RustboroCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
goto_if_unset FLAG_MET_DEVON_EMPLOYEE, RustboroCity_Mart_EventScript_PokemartBasic
goto_if_set FLAG_MET_DEVON_EMPLOYEE, RustboroCity_Mart_EventScript_PokemartExpanded
end
```
### RustboroCity_Mart_EventScript_PokemartBasic
```
pokemart RustboroCity_Mart_Pokemart_Basic
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Mart_Pokemart_Basic
```
pokemartlistend
```
### RustboroCity_Mart_EventScript_PokemartExpanded
```
pokemart RustboroCity_Mart_Pokemart_Expanded
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Mart_Pokemart_Expanded
```
pokemartlistend
```
### RustboroCity_Mart_EventScript_PokefanF
```
msgbox RustboroCity_Mart_Text_BuyingHealsInCaseOfShroomish, MSGBOX_NPC
end
```
### RustboroCity_Mart_EventScript_Boy
```
msgbox RustboroCity_Mart_Text_ShouldBuySuperPotionsInstead, MSGBOX_NPC
end
```
### RustboroCity_Mart_EventScript_BugCatcher
```
msgbox RustboroCity_Mart_Text_GettingEscapeRopeJustInCase, MSGBOX_NPC
end
```

## Textes (3)
### RustboroCity_Mart_Text_BuyingHealsInCaseOfShroomish
```
J'achète des ANTI-PARA et des\nANTIDOTES.\pC'est juste au cas où je tomberais sur\nun BALIGNON au BOIS CLEMENTI.$
```
### RustboroCity_Mart_Text_ShouldBuySuperPotionsInstead
```
Mon POKéMON a évolué.\nIl a plein de PV maintenant.\pJe ferais mieux d'acheter des SUPER\nPOTIONS plutôt que de simples POTIONS.$
```
### RustboroCity_Mart_Text_GettingEscapeRopeJustInCase
```
J'ai pris une CORDE SORTIE, juste au\ncas où je me perdrais dans une caverne.\pIl me suffit de l'utiliser pour me\nretrouver directement à l'entrée.$
```

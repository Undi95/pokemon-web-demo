# Route114_FossilManiacsHouse

## Métadonnées
- **id** : `MAP_ROUTE114_FOSSIL_MANIACS_HOUSE`
- **layout** : `LAYOUT_ROUTE114_FOSSIL_MANIACS_HOUSE`
- **music** : `MUS_FALLARBOR`
- **region_map_section** : `MAPSEC_ROUTE_114`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 3,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route114_FossilManiacsHouse_EventScript_FossilManiacsBrother` | `0` |

## Warps (3)
- #0 (4,7) → `MAP_ROUTE114` warp #1
- #1 (5,7) → `MAP_ROUTE114` warp #1
- #2 (4,1) → `MAP_ROUTE114_FOSSIL_MANIACS_TUNNEL` warp #0

## BG events / signs (4)
- (5,3) [sign] → `Route114_FossilManiacsHouse_EventScript_RockDisplay`
- (6,3) [sign] → `Route114_FossilManiacsHouse_EventScript_RockDisplay`
- (7,2) [sign] → `Route114_FossilManiacsHouse_EventScript_Bookshelf`
- (8,2) [sign] → `Route114_FossilManiacsHouse_EventScript_Bookshelf`

## Flags référencés (2)
- `FLAG_LANDMARK_FOSSIL_MANIACS_HOUSE`
- `FLAG_RECEIVED_TM_DIG`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (6)
### Route114_FossilManiacsHouse_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route114_FossilManiacsHouse_OnTransition
```
### Route114_FossilManiacsHouse_OnTransition
```
setflag FLAG_LANDMARK_FOSSIL_MANIACS_HOUSE
end
```
### Route114_FossilManiacsHouse_EventScript_FossilManiacsBrother
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_DIG, Route114_FossilManiacsHouse_EventScript_ReceivedDig
msgbox Route114_FossilManiacsHouse_Text_HaveThisToDigLikeMyBrother, MSGBOX_DEFAULT
giveitem ITEM_TM_DIG
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_DIG
release
end
```
### Route114_FossilManiacsHouse_EventScript_ReceivedDig
```
msgbox Route114_FossilManiacsHouse_Text_DigReturnsYouToEntrance, MSGBOX_DEFAULT
release
end
```
### Route114_FossilManiacsHouse_EventScript_RockDisplay
```
msgbox Route114_FossilManiacsHouse_Text_RocksFillDisplayCase, MSGBOX_SIGN
end
```
### Route114_FossilManiacsHouse_EventScript_Bookshelf
```
msgbox Route114_FossilManiacsHouse_Text_CrammedWithBooks, MSGBOX_SIGN
end
```

## Textes (4)
### Route114_FossilManiacsHouse_Text_HaveThisToDigLikeMyBrother
```
Mon grand frère est le MANIAQUE\nDES FOSSILES… C'est un gentil\lgarçon passionné de FOSSILES…\pIl adore creuser des trous, aussi…\nIl a creusé ce trou tout seul…\pTiens, prends ça, tu pourras utiliser\nTUNNEL, comme mon grand frère…$
```
### Route114_FossilManiacsHouse_Text_DigReturnsYouToEntrance
```
Si ton POKéMON utilise TUNNEL dans une\ncaverne, tu retournes à l'entrée…$
```
### Route114_FossilManiacsHouse_Text_RocksFillDisplayCase
```
Des roches aux formes étranges\nsont disposées dans la vitrine.$
```
### Route114_FossilManiacsHouse_Text_CrammedWithBooks
```
LA COMPOSITION DES STRATES…\nLA PLUIE, L'EROSION ET LA TERRE…\lPIERRES, TERRE ET AUTRES ROCHERS…\pC'est rempli de livres.$
```

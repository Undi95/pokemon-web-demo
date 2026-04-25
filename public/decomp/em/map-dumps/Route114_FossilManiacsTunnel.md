# Route114_FossilManiacsTunnel

## Métadonnées
- **id** : `MAP_ROUTE114_FOSSIL_MANIACS_TUNNEL`
- **layout** : `LAYOUT_ROUTE114_FOSSIL_MANIACS_TUNNEL`
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
| `LOCALID_FOSSIL_MANIAC` | `OBJ_EVENT_GFX_MANIAC` | 5,3 | `MOVEMENT_TYPE_FACE_UP` | `Route114_FossilManiacsTunnel_EventScript_FossilManiac` | `0` |

## Warps (3)
- #0 (6,25) → `MAP_ROUTE114_FOSSIL_MANIACS_HOUSE` warp #2
- #1 (7,25) → `MAP_ROUTE114_FOSSIL_MANIACS_HOUSE` warp #2
- #2 (6,2) → `MAP_DESERT_UNDERPASS` warp #0

## Coord events / triggers (2)
- (5,4) → `Route114_FossilManiacsTunnel_EventScript_ManiacMentionCaveIn` (si `VAR_FOSSIL_MANIAC_STATE` == `1`)
- (6,4) → `Route114_FossilManiacsTunnel_EventScript_ManiacMentionCaveIn` (si `VAR_FOSSIL_MANIAC_STATE` == `1`)

## Flags référencés (2)
- `FLAG_RECEIVED_REVIVED_FOSSIL_MON`
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (2)
- `VAR_FOSSIL_MANIAC_STATE`
- `VAR_RESULT`

## Scripts (9)
### Route114_FossilManiacsTunnel_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route114_FossilManiacsTunnel_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route114_FossilManiacsTunnel_OnLoad
```
### Route114_FossilManiacsTunnel_OnTransition
```
call_if_set FLAG_SYS_GAME_CLEAR, Route114_FossilManiacsTunnel_EventScript_MoveFossilManiac
end
```
### Route114_FossilManiacsTunnel_EventScript_MoveFossilManiac
```
setobjectxyperm LOCALID_FOSSIL_MANIAC, 6, 5
setobjectmovementtype LOCALID_FOSSIL_MANIAC, MOVEMENT_TYPE_FACE_DOWN
return
```
### Route114_FossilManiacsTunnel_OnLoad
```
call_if_unset FLAG_SYS_GAME_CLEAR, Route114_FossilManiacsTunnel_EventScript_CloseDesertUnderpass
end
```
### Route114_FossilManiacsTunnel_EventScript_CloseDesertUnderpass
```
setmetatile 6, 1, METATILE_Fallarbor_RedRockWall, TRUE
setmetatile 6, 2, METATILE_Fallarbor_RedRockWall, TRUE
return
```
### Route114_FossilManiacsTunnel_EventScript_ManiacMentionCaveIn
```
lockall
applymovement LOCALID_FOSSIL_MANIAC, Common_Movement_WalkInPlaceFasterUp
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox Route114_FossilManiacsTunnel_Text_NotSafeThatWay, MSGBOX_DEFAULT
setvar VAR_FOSSIL_MANIAC_STATE, 2
releaseall
end
```
### Route114_FossilManiacsTunnel_EventScript_FossilManiac
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_REVIVED_FOSSIL_MON, Route114_FossilManiacsTunnel_EventScript_PlayerRevivedFossil
checkitem ITEM_ROOT_FOSSIL
goto_if_eq VAR_RESULT, TRUE, Route114_FossilManiacsTunnel_EventScript_PlayerHasFossil
checkitem ITEM_CLAW_FOSSIL
goto_if_eq VAR_RESULT, TRUE, Route114_FossilManiacsTunnel_EventScript_PlayerHasFossil
msgbox Route114_FossilManiacsTunnel_Text_LookInDesertForFossils, MSGBOX_DEFAULT
release
end
```
### Route114_FossilManiacsTunnel_EventScript_PlayerHasFossil
```
msgbox Route114_FossilManiacsTunnel_Text_DevonCorpRevivingFossils, MSGBOX_DEFAULT
release
end
```
### Route114_FossilManiacsTunnel_EventScript_PlayerRevivedFossil
```
msgbox Route114_FossilManiacsTunnel_Text_FossilsAreWonderful, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### Route114_FossilManiacsTunnel_Text_LookInDesertForFossils
```
Je suis le MANIAQUE DES FOSSILES…\nJe suis un bon garçon, passionné de\lFOSSILES…\pTu veux un FOSSILE?\pPas de chance, tous les FOSSILES du\ncoin m'appartiennent. Tu n'en auras pas.\pSi tu veux absolument un FOSSILE, va\ndans le désert. Tu risques d'en trouver\ldans les rochers ou dans le sable…$
```
### Route114_FossilManiacsTunnel_Text_DevonCorpRevivingFossils
```
Tu as trouvé un FOSSILE, n'est-ce pas?\nC'est génial… Ça laisse rêveur…\pQu'est-ce que tu vas faire avec ce\nFOSSILE?\pJ'ai entendu dire que DEVON faisait\ndes recherches pour ranimer des\lPOKéMON à partir de FOSSILES…\pJ'aime tellement mes FOSSILES que je\nne ferai jamais ça…$
```
### Route114_FossilManiacsTunnel_Text_FossilsAreWonderful
```
Les FOSSILES sont si… merveilleux…\nIls laissent rêveur…$
```
### Route114_FossilManiacsTunnel_Text_NotSafeThatWay
```
Oh…\nC'est dangereux par là…\pJ'étais en train de creuser…\nLe mur entier s'est effondré…\pIl doit y avoir une grotte immense\nlà-dessous…\pMais ça ne m'intéresse pas, il n'y a\nsûrement pas de FOSSILES…$
```

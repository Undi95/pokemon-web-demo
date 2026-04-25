# Route111_OldLadysRestStop

## Métadonnées
- **id** : `MAP_ROUTE111_OLD_LADYS_REST_STOP`
- **layout** : `LAYOUT_HOUSE3`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_111`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 6,3 | `MOVEMENT_TYPE_FACE_LEFT` | `Route111_OldLadysRestStop_EventScript_OldLady` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_ROUTE111` warp #2
- #1 (4,7) → `MAP_ROUTE111` warp #2

## Flags référencés (1)
- `FLAG_LANDMARK_OLD_LADY_REST_SHOP`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_OutOfCenterPartyHeal`

## Scripts (5)
### Route111_OldLadysRestStop_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route111_OldLadysRestStop_OnTransition
```
### Route111_OldLadysRestStop_OnTransition
```
setflag FLAG_LANDMARK_OLD_LADY_REST_SHOP
end
```
### Route111_OldLadysRestStop_EventScript_OldLady
```
lock
faceplayer
msgbox Route111_OldLadysRestStop_Text_RestUpHere, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route111_OldLadysRestStop_EventScript_Rest
goto_if_eq VAR_RESULT, NO, Route111_OldLadysRestStop_EventScript_DeclineRest
end
```
### Route111_OldLadysRestStop_EventScript_Rest
```
msgbox Route111_OldLadysRestStop_Text_TakeYourTimeRestUp, MSGBOX_DEFAULT
closemessage
call Common_EventScript_OutOfCenterPartyHeal
msgbox Route111_OldLadysRestStop_Text_StillTiredTakeAnotherRest, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route111_OldLadysRestStop_EventScript_Rest
goto_if_eq VAR_RESULT, NO, Route111_OldLadysRestStop_EventScript_DeclineRest
end
```
### Route111_OldLadysRestStop_EventScript_DeclineRest
```
msgbox Route111_OldLadysRestStop_Text_DontNeedToBeShy, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### Route111_OldLadysRestStop_Text_RestUpHere
```
Oh, mon Dieu!\nTes POKéMON doivent être épuisés!\pSi tu veux, tu peux les laisser se\nreposer ici. Bonne idée, non?$
```
### Route111_OldLadysRestStop_Text_TakeYourTimeRestUp
```
Tu as raison.\nPrends ton temps et repose-toi aussi!$
```
### Route111_OldLadysRestStop_Text_StillTiredTakeAnotherRest
```
Oh, mon Dieu!\nTes POKéMON sont toujours fatigués?\pTu devrais rester te reposer ici.\nBonne idée, n'est-ce pas?$
```
### Route111_OldLadysRestStop_Text_DontNeedToBeShy
```
Vraiment?\nNe sois pas timide.$
```

# SootopolisCity_House1

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE1`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE1`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 2,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_House1_EventScript_BrickBreakBlackBelt` | `0` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `SootopolisCity_House1_EventScript_Kecleon` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #4
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #4

## Flags référencés (1)
- `FLAG_RECEIVED_TM_BRICK_BREAK`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### SootopolisCity_House1_EventScript_BrickBreakBlackBelt
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_BRICK_BREAK, SootopolisCity_House1_EventScript_ReceivedBrickBreak
msgbox SootopolisCity_House1_Text_DevelopedThisTM, MSGBOX_DEFAULT
giveitem ITEM_TM_BRICK_BREAK
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_BRICK_BREAK
msgbox SootopolisCity_House1_Text_ExplainBrickBreak, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_House1_EventScript_ReceivedBrickBreak
```
msgbox SootopolisCity_House1_Text_ExplainBrickBreak, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_House1_EventScript_Kecleon
```
lock
faceplayer
waitse
playmoncry SPECIES_KECLEON, CRY_MODE_NORMAL
msgbox SootopolisCity_House1_Text_Kecleon, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (3)
### SootopolisCity_House1_Text_DevelopedThisTM
```
Je suis resté trente ans à\nATALANOPOLIS pour améliorer\lmes connaissances.\pJ'ai conçu une CT renversante.\nJe te la lègue!$
```
### SootopolisCity_House1_Text_ExplainBrickBreak
```
La CT31 contient CASSE-BRIQUE!\nUn coup si terrible que je n'peux\lle décrire.$
```
### SootopolisCity_House1_Text_Kecleon
```
KECLEON: Eooon.$
```

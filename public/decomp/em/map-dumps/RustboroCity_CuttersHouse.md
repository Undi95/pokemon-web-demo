# RustboroCity_CuttersHouse

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_CUTTERS_HOUSE`
- **layout** : `LAYOUT_RUSTBORO_CITY_CUTTERS_HOUSE`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 7,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_CuttersHouse_EventScript_Cutter` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 9,2 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `RustboroCity_CuttersHouse_EventScript_Lass` | `0` |

## Warps (2)
- #0 (5,8) → `MAP_RUSTBORO_CITY` warp #8
- #1 (6,8) → `MAP_RUSTBORO_CITY` warp #8

## Flags référencés (1)
- `FLAG_RECEIVED_HM_CUT`

## Scripts (3)
### RustboroCity_CuttersHouse_EventScript_Cutter
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_HM_CUT, RustboroCity_CuttersHouse_EventScript_ExplainCut
msgbox RustboroCity_CuttersHouse_Text_YouCanPutThisHMToGoodUse, MSGBOX_DEFAULT
giveitem ITEM_HM_CUT
setflag FLAG_RECEIVED_HM_CUT
msgbox RustboroCity_CuttersHouse_Text_ExplainCut, MSGBOX_DEFAULT
release
end
```
### RustboroCity_CuttersHouse_EventScript_ExplainCut
```
msgbox RustboroCity_CuttersHouse_Text_ExplainCut, MSGBOX_DEFAULT
release
end
```
### RustboroCity_CuttersHouse_EventScript_Lass
```
msgbox RustboroCity_CuttersHouse_Text_DadHelpedClearLandOfTrees, MSGBOX_NPC
end
```

## Textes (3)
### RustboroCity_CuttersHouse_Text_YouCanPutThisHMToGoodUse
```
Ton air déterminé…\nLa souplesse de tes mouvements…\pTes POKéMON bien entraînés…\nTu es à l'évidence un DRESSEUR averti!\pNon, attends, ne dis rien!\nJe devine tout rien qu'à te voir.\pJe suis sûr que tu seras capable\nde faire bon usage de cette CS.\pNe sois pas modeste ni timide!\nAllez, prends-la!$
```
### RustboroCity_CuttersHouse_Text_ExplainCut
```
Cette CS, c'est COUPE.\pUne CS, c'est une capacité qui peut être\nutilisée en dehors d'un combat.\pTout POKéMON ayant appris COUPE peut\nabattre les petits arbres si son\lDRESSEUR possède le BADGE ROCHE.\pEt contrairement à une CT, une CS peut\ns'utiliser plusieurs fois.$
```
### RustboroCity_CuttersHouse_Text_DadHelpedClearLandOfTrees
```
Quand ils ont agrandi MEROUVILLE,\nmon papa les a aidés.\pIl a fait utiliser COUPE à son POKéMON\npour qu'il déboise le terrain.$
```

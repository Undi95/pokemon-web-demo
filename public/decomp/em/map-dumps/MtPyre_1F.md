# MtPyre_1F

## Métadonnées
- **id** : `MAP_MT_PYRE_1F`
- **layout** : `LAYOUT_MT_PYRE_1F`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_MT_PYRE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_OLD_WOMAN` | 21,2 | `MOVEMENT_TYPE_FACE_DOWN` | `MtPyre_1F_EventScript_CleanseTagWoman` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 17,8 | `MOVEMENT_TYPE_FACE_UP` | `MtPyre_1F_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 13,10 | `MOVEMENT_TYPE_FACE_LEFT` | `MtPyre_1F_EventScript_Man` | `0` |

## Warps (6)
- #0 (17,18) → `MAP_ROUTE122` warp #0
- #1 (3,6) → `MAP_MT_PYRE_EXTERIOR` warp #0
- #2 (18,18) → `MAP_ROUTE122` warp #0
- #3 (4,6) → `MAP_MT_PYRE_EXTERIOR` warp #0
- #4 (11,1) → `MAP_MT_PYRE_2F` warp #0
- #5 (20,9) → `MAP_MT_PYRE_2F` warp #4

## Flags référencés (1)
- `FLAG_RECEIVED_CLEANSE_TAG`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (4)
### MtPyre_1F_EventScript_CleanseTagWoman
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_CLEANSE_TAG, MtPyre_1F_EventScript_ReceivedCleanseTag
msgbox MtPyre_1F_Text_TakeThisForYourOwnGood, MSGBOX_DEFAULT
giveitem ITEM_CLEANSE_TAG
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_CLEANSE_TAG
release
end
```
### MtPyre_1F_EventScript_ReceivedCleanseTag
```
msgbox MtPyre_1F_Text_ExplainCleanseTag, MSGBOX_DEFAULT
release
end
```
### MtPyre_1F_EventScript_PokefanF
```
msgbox MtPyre_1F_Text_ComeToPayRespects, MSGBOX_NPC
end
```
### MtPyre_1F_EventScript_Man
```
msgbox MtPyre_1F_Text_RestingPlaceOfZigzagoon, MSGBOX_NPC
end
```

## Textes (4)
### MtPyre_1F_Text_TakeThisForYourOwnGood
```
Toutes sortes d'êtres se promènent sur\nles versants du MONT MEMORIA…\pOn ne sait jamais ce qui peut arriver.\nPrends ça. C'est pour ton bien.$
```
### MtPyre_1F_Text_ExplainCleanseTag
```
Fais tenir cette RUNE PURIF. à l'un\nde tes POKéMON.\pÇa éloignera les POKéMON sauvages.$
```
### MtPyre_1F_Text_ComeToPayRespects
```
Es-tu là pour présenter tes respects\naux esprits des défunts POKéMON?\pTu dois prendre grand soin de tes\nPOKéMON.$
```
### MtPyre_1F_Text_RestingPlaceOfZigzagoon
```
C'est ici que repose mon ZIGZATON.\nC'est un endroit que je chéris…$
```

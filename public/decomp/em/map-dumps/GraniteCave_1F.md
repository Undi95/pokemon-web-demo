# GraniteCave_1F

## Métadonnées
- **id** : `MAP_GRANITE_CAVE_1F`
- **layout** : `LAYOUT_GRANITE_CAVE_1F`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_GRANITE_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_HIKER` | 36,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `GraniteCave_1F_EventScript_Hiker` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 17,7 | `MOVEMENT_TYPE_FACE_DOWN` | `GraniteCave_1F_EventScript_ItemEscapeRope` | `FLAG_ITEM_GRANITE_CAVE_1F_ESCAPE_ROPE` |

## Warps (4)
- #0 (37,12) → `MAP_ROUTE106` warp #0
- #1 (35,3) → `MAP_GRANITE_CAVE_B1F` warp #0
- #2 (17,11) → `MAP_GRANITE_CAVE_B1F` warp #1
- #3 (5,10) → `MAP_GRANITE_CAVE_STEVENS_ROOM` warp #0

## Flags référencés (1)
- `FLAG_RECEIVED_HM_FLASH`

## Scripts (2)
### GraniteCave_1F_EventScript_Hiker
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_HM_FLASH, GraniteCave_1F_EventScript_ReceivedFlash
msgbox GraniteCave_1F_Text_GetsDarkAheadHereYouGo, MSGBOX_DEFAULT
giveitem ITEM_HM_FLASH
setflag FLAG_RECEIVED_HM_FLASH
msgbox GraniteCave_1F_Text_ExplainFlash, MSGBOX_DEFAULT
release
end
```
### GraniteCave_1F_EventScript_ReceivedFlash
```
msgbox GraniteCave_1F_Text_ExplainFlash, MSGBOX_DEFAULT
release
end
```

## Textes (2)
### GraniteCave_1F_Text_GetsDarkAheadHereYouGo
```
Hé, toi!\nIl fait terriblement sombre là-dedans.\lÇa va être difficile à explorer.\pCe type qui est passé tout à l'heure…\nPIERRE, je crois que c'était ça.\pIl savait utiliser FLASH, alors il n'a pas\ndû avoir de problème, mais…\pPour nous, les MONTAGNARDS, la devise\nest d'aider ceux que l'on rencontre.\pVas-y et bon courage!$
```
### GraniteCave_1F_Text_ExplainFlash
```
Apprends cette CS FLASH\nà un POKéMON et utilise-la.\pÇa permet d'éclairer même les cavernes\nles plus sombres.\pMais pour l'utiliser, il faut le BADGE\nde l'ARENE POKéMON de MYOKARA.$
```

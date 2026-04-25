# LilycoveCity_House2

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_HOUSE2`
- **layout** : `LAYOUT_LILYCOVE_CITY_HOUSE2`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 0,4 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_House2_EventScript_FatMan` | `0` |

## Warps (2)
- #0 (2,7) → `MAP_LILYCOVE_CITY` warp #9
- #1 (3,7) → `MAP_LILYCOVE_CITY` warp #9

## Flags référencés (1)
- `FLAG_RECEIVED_TM_REST`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (2)
### LilycoveCity_House2_EventScript_FatMan
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_REST, LilycoveCity_House2_EventScript_ReceivedRest
msgbox LilycoveCity_House2_Text_NotAwakeYetHaveThis, MSGBOX_DEFAULT
giveitem ITEM_TM_REST
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_REST
msgbox LilycoveCity_House2_Text_SleepIsEssential, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_House2_EventScript_ReceivedRest
```
msgbox LilycoveCity_House2_Text_SleepIsEssential, MSGBOX_DEFAULT
release
end
```

## Textes (2)
### LilycoveCity_House2_Text_NotAwakeYetHaveThis
```
Hum? Quoi? Qu'est-ce que c'est?\pJ'suis pas encore bien réveillé…\nTu peux prendre ça…$
```
### LilycoveCity_House2_Text_SleepIsEssential
```
Ouaaaah…\pDormir est essentiel à la santé…\nDormir et reprendre des forces…$
```

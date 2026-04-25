# SootopolisCity_House6

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE6`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE3`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 4,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `SootopolisCity_House6_EventScript_Woman` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #9
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #9

## Flags référencés (1)
- `FLAG_RECEIVED_WAILMER_DOLL`

## Variables référencées (2)
- `VAR_2`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_NoRoomLeftForAnother`

## Scripts (4)
### SootopolisCity_House6_EventScript_Woman
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_WAILMER_DOLL, SootopolisCity_House6_EventScript_ReceivedWailmerDoll
msgbox SootopolisCity_House6_Text_FirstGuestInWhileTakeDoll, MSGBOX_YESNO
call_if_eq VAR_RESULT, NO, SootopolisCity_House6_EventScript_DeclineWailmerDoll
msgbox SootopolisCity_House6_Text_TakeGoodCareOfIt, MSGBOX_DEFAULT
givedecoration DECOR_WAILMER_DOLL
goto_if_eq VAR_RESULT, FALSE, SootopolisCity_House6_EventScript_NoRoomForWailmerDoll
setflag FLAG_RECEIVED_WAILMER_DOLL
release
end
```
### SootopolisCity_House6_EventScript_DeclineWailmerDoll
```
msgbox SootopolisCity_House6_Text_DontWantThisDoll, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_House6_EventScript_ReceivedWailmerDoll
```
msgbox SootopolisCity_House6_Text_LovePlushDolls, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_House6_EventScript_NoRoomForWailmerDoll
```
bufferdecorationname STR_VAR_2, DECOR_WAILMER_DOLL
msgbox gText_NoRoomLeftForAnother, MSGBOX_DEFAULT
msgbox SootopolisCity_House6_Text_IllHoldItForYou, MSGBOX_DEFAULT
release
end
```

## Textes (5)
### SootopolisCity_House6_Text_FirstGuestInWhileTakeDoll
```
Bonjour! Vous êtes la première personne\nà venir chez nous depuis longtemps.\pComme vous illuminez ma journée, je\nvous offre une grande POUPEE WAILMER.$
```
### SootopolisCity_House6_Text_TakeGoodCareOfIt
```
Prenez-en soin!$
```
### SootopolisCity_House6_Text_IllHoldItForYou
```
Oh, vous la voulez, mais pas maintenant?\nD'accord. Je vous la mets de côté.$
```
### SootopolisCity_House6_Text_DontWantThisDoll
```
C'est sûr?\nVous ne voulez pas de cette POUPEE?$
```
### SootopolisCity_House6_Text_LovePlushDolls
```
J'adore les POUPEE en peluche!$
```

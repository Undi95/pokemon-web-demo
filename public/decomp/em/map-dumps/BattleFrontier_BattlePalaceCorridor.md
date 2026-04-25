# BattleFrontier_BattlePalaceCorridor

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PALACE_CORRIDOR`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PALACE_CORRIDOR`
- **music** : `MUS_B_PALACE`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PALACE_CORRIDOR_ATTENDANT` | `OBJ_EVENT_GFX_EXPERT_M` | 8,12 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_AZURILL` | 3,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_KIRLIA` | 12,6 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_PIKACHU` | 15,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_ZIGZAGOON_2` | 4,9 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_AZUMARILL` | 13,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_WINGULL` | 3,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `0x0` | `0` |

## Warps (4)
- #0 (8,13) → `MAP_BATTLE_FRONTIER_BATTLE_PALACE_LOBBY` warp #2
- #1 (9,13) → `MAP_BATTLE_FRONTIER_BATTLE_PALACE_LOBBY` warp #2
- #2 (6,3) → `MAP_BATTLE_FRONTIER_BATTLE_PALACE_BATTLE_ROOM` warp #0
- #3 (10,3) → `MAP_BATTLE_FRONTIER_BATTLE_PALACE_BATTLE_ROOM` warp #0

## Variables référencées (2)
- `VAR_RESULT`
- `VAR_TEMP_0`

## Scripts (17)
### BattleFrontier_BattlePalaceCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePalaceCorridor_OnFrame
```
### BattleFrontier_BattlePalaceCorridor_OnFrame
```
map_script_2 VAR_TEMP_0, 0, BattleFrontier_BattlePalaceCorridor_EventScript_WalkThroughCorridor
```
### BattleFrontier_BattlePalaceCorridor_EventScript_WalkThroughCorridor
```
delay 16
applymovement LOCALID_PALACE_CORRIDOR_ATTENDANT, BattleFrontier_BattlePalaceCorridor_Movement_EnterCorridor
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceCorridor_Movement_EnterCorridor
waitmovement 0
lockall
palace_getcomment
call_if_eq VAR_RESULT, 0, BattleFrontier_BattlePalaceCorridor_EventScript_RandomComment1
call_if_eq VAR_RESULT, 1, BattleFrontier_BattlePalaceCorridor_EventScript_RandomComment2
call_if_eq VAR_RESULT, 2, BattleFrontier_BattlePalaceCorridor_EventScript_RandomComment3
call_if_eq VAR_RESULT, 3, BattleFrontier_BattlePalaceCorridor_EventScript_StreakComment
call_if_eq VAR_RESULT, 4, BattleFrontier_BattlePalaceCorridor_EventScript_LongStreakComment
closemessage
frontier_get FRONTIER_DATA_LVL_MODE
goto_if_eq VAR_RESULT, FRONTIER_LVL_OPEN, BattleFrontier_BattlePalaceCorridor_EventScript_WalkToOpenBattleRoom
applymovement LOCALID_PALACE_CORRIDOR_ATTENDANT, BattleFrontier_BattlePalaceCorridor_Movement_AttendantWalkTo50BattleRoom
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceCorridor_Movement_PlayerWalkTo50BattleRoom
waitmovement 0
opendoor 6, 3
waitdooranim
applymovement LOCALID_PALACE_CORRIDOR_ATTENDANT, BattleFrontier_BattlePalaceCorridor_Movement_AttendantEnterBattleRoom
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceCorridor_Movement_PlayerEnterBattleRoom
waitmovement 0
closedoor 6, 3
waitdooranim
goto BattleFrontier_BattlePalaceCorridor_EventScript_WarpToBattleRoom
```
### BattleFrontier_BattlePalaceCorridor_EventScript_WalkToOpenBattleRoom
```
applymovement LOCALID_PALACE_CORRIDOR_ATTENDANT, BattleFrontier_BattlePalaceCorridor_Movement_AttendantWalkToOpenBattleRoom
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceCorridor_Movement_PlayerWalkToOpenBattleRoom
waitmovement 0
opendoor 10, 3
waitdooranim
applymovement LOCALID_PALACE_CORRIDOR_ATTENDANT, BattleFrontier_BattlePalaceCorridor_Movement_AttendantEnterBattleRoom
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceCorridor_Movement_PlayerEnterBattleRoom
waitmovement 0
closedoor 10, 3
waitdooranim
```
### BattleFrontier_BattlePalaceCorridor_EventScript_WarpToBattleRoom
```
warp MAP_BATTLE_FRONTIER_BATTLE_PALACE_BATTLE_ROOM, 7, 4
waitstate
end
```
### BattleFrontier_BattlePalaceCorridor_EventScript_RandomComment1
```
msgbox BattleFrontier_BattlePalaceCorridor_Text_PeopleAndMonAreSame, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceCorridor_EventScript_RandomComment2
```
msgbox BattleFrontier_BattlePalaceCorridor_Text_LetMonDoWhatItLikes, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceCorridor_EventScript_RandomComment3
```
msgbox BattleFrontier_BattlePalaceCorridor_Text_MonDifferentWhenCornered, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceCorridor_EventScript_StreakComment
```
msgbox BattleFrontier_BattlePalaceCorridor_Text_BeginningToUnderstandNature, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceCorridor_EventScript_LongStreakComment
```
msgbox BattleFrontier_BattlePalaceCorridor_Text_HeartfeltBondBetweenYouAndMons, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceCorridor_Movement_EnterCorridor
```
walk_up
walk_up
walk_up
walk_up
step_end
```
### BattleFrontier_BattlePalaceCorridor_Movement_AttendantWalkTo50BattleRoom
```
walk_up
walk_up
walk_left
walk_left
walk_up
walk_up
step_end
```
### BattleFrontier_BattlePalaceCorridor_Movement_PlayerWalkTo50BattleRoom
```
walk_up
walk_up
walk_up
walk_left
walk_left
walk_up
step_end
```
### BattleFrontier_BattlePalaceCorridor_Movement_AttendantWalkToOpenBattleRoom
```
walk_up
walk_right
walk_right
walk_up
walk_up
walk_up
step_end
```
### BattleFrontier_BattlePalaceCorridor_Movement_PlayerWalkToOpenBattleRoom
```
walk_up
walk_up
walk_right
walk_right
walk_up
walk_up
step_end
```
### BattleFrontier_BattlePalaceCorridor_Movement_PlayerEnterBattleRoom
```
walk_up
```
### BattleFrontier_BattlePalaceCorridor_Movement_AttendantEnterBattleRoom
```
walk_up
set_invisible
step_end
```

## Textes (5)
### BattleFrontier_BattlePalaceCorridor_Text_PeopleAndMonAreSame
```
Les gens et les POKéMON, c'est pareil…\pLeur nature fait qu'ils sont très doués\npour certaines choses et beaucoup\lmoins pour d'autres.$
```
### BattleFrontier_BattlePalaceCorridor_Text_LetMonDoWhatItLikes
```
Au lieu de forcer un POKéMON à faire\nce qu'il n'aime pas, essayez de lui faire\lfaire des choses qu'il aime.\pMettez-vous dans la peau de votre\nPOKéMON pour comprendre ce qu'il aime.$
```
### BattleFrontier_BattlePalaceCorridor_Text_MonDifferentWhenCornered
```
La nature d'un POKéMON, c'est quelque\nchose de fascinant…\pCertains POKéMON changent totalement\nd'attitude s'ils se sentent coincés.$
```
### BattleFrontier_BattlePalaceCorridor_Text_BeginningToUnderstandNature
```
Commencez-vous à comprendre\nl'influence qu'a la nature des POKéMON?$
```
### BattleFrontier_BattlePalaceCorridor_Text_HeartfeltBondBetweenYouAndMons
```
Ah… Un lien fort et sincère\nvous unit à vos POKéMON…$
```

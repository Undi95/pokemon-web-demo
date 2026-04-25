# SafariZone_South

## Métadonnées
- **id** : `MAP_SAFARI_ZONE_SOUTH`
- **layout** : `LAYOUT_SAFARI_ZONE_SOUTH`
- **music** : `MUS_SAFARI_ZONE`
- **region_map_section** : `MAPSEC_SAFARI_ZONE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_SAFARI_ZONE_NORTH`
- left (offset 0) → `MAP_SAFARI_ZONE_SOUTHWEST`
- right (offset 0) → `MAP_SAFARI_ZONE_SOUTHEAST`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SAFARI_EXIT_ATTENDANT` | `OBJ_EVENT_GFX_CAMPER` | 32,34 | `MOVEMENT_TYPE_FACE_DOWN` | `SafariZone_South_EventScript_ExitAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 26,28 | `MOVEMENT_TYPE_WANDER_AROUND` | `SafariZone_South_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 16,6 | `MOVEMENT_TYPE_FACE_DOWN` | `SafariZone_South_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 15,31 | `MOVEMENT_TYPE_WANDER_AROUND` | `SafariZone_South_EventScript_Youngster` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 36,16 | `MOVEMENT_TYPE_FACE_LEFT` | `SafariZone_South_EventScript_ConstructionWorker1` | `FLAG_HIDE_SAFARI_ZONE_SOUTH_CONSTRUCTION_WORKERS` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 36,17 | `MOVEMENT_TYPE_FACE_LEFT` | `SafariZone_South_EventScript_ConstructionWorker2` | `FLAG_HIDE_SAFARI_ZONE_SOUTH_CONSTRUCTION_WORKERS` |

## Warps (1)
- #0 (32,33) → `MAP_ROUTE121_SAFARI_ZONE_ENTRANCE` warp #0

## Flags référencés (1)
- `FLAG_GOOD_LUCK_SAFARI_ZONE`

## Variables référencées (3)
- `VAR_FACING`
- `VAR_RESULT`
- `VAR_SAFARI_ZONE_STATE`

## Scripts (29)
### SafariZone_South_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SafariZone_South_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, SafariZone_South_OnFrame
```
### SafariZone_South_OnFrame
```
map_script_2 VAR_SAFARI_ZONE_STATE, 2, SafariZone_South_EventScript_EnterSafariZone
```
### SafariZone_South_EventScript_EnterSafariZone
```
lockall
applymovement LOCALID_PLAYER, SafariZone_South_Movement_PlayerEnter
waitmovement 0
applymovement LOCALID_SAFARI_EXIT_ATTENDANT, SafariZone_South_Movement_ExitAttendantBlockDoor
waitmovement 0
setobjectxyperm LOCALID_SAFARI_EXIT_ATTENDANT, 32, 34
setvar VAR_SAFARI_ZONE_STATE, 0
releaseall
end
```
### SafariZone_South_OnTransition
```
call_if_eq VAR_SAFARI_ZONE_STATE, 2, SafariZone_South_EventScript_SetExitAttendantAside
end
```
### SafariZone_South_EventScript_SetExitAttendantAside
```
setobjectxyperm LOCALID_SAFARI_EXIT_ATTENDANT, 31, 34
return
```
### SafariZone_South_Movement_PlayerEnter
```
walk_down
step_end
```
### SafariZone_South_Movement_ExitAttendantBlockDoor
```
walk_right
walk_in_place_faster_down
step_end
```
### SafariZone_South_EventScript_Boy
```
msgbox SafariZone_South_Text_Boy, MSGBOX_NPC
end
```
### SafariZone_South_EventScript_Man
```
msgbox SafariZone_South_Text_Man, MSGBOX_NPC
end
```
### SafariZone_South_EventScript_Youngster
```
msgbox SafariZone_South_Text_Youngster, MSGBOX_NPC
end
```
### SafariZone_South_EventScript_ExitAttendant
```
lock
faceplayer
goto_if_unset FLAG_GOOD_LUCK_SAFARI_ZONE, SafariZone_South_EventScript_GoodLuck
msgbox SafariZone_South_Text_StillHaveTimeExit, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, SafariZone_South_EventScript_ExitEarly
msgbox SafariZone_South_Text_EnjoyTheRestOfYourAdventure, MSGBOX_DEFAULT
release
end
```
### SafariZone_South_EventScript_GoodLuck
```
setflag FLAG_GOOD_LUCK_SAFARI_ZONE
msgbox SafariZone_South_Text_GoodLuck, MSGBOX_DEFAULT
release
end
```
### SafariZone_South_EventScript_ExitEarly
```
msgbox SafariZone_South_Text_ExitEarlyThankYouForPlaying, MSGBOX_DEFAULT
closemessage
switch VAR_FACING
case DIR_NORTH, SafariZone_South_EventScript_ExitEarlyNorth
case DIR_EAST, SafariZone_South_EventScript_ExitEarlyEast
end
```
### SafariZone_South_EventScript_ExitEarlyNorth
```
applymovement LOCALID_SAFARI_EXIT_ATTENDANT, SafariZone_South_Movement_MoveExitAttendantNorth
waitmovement 0
applymovement LOCALID_PLAYER, SafariZone_South_Movement_PlayerExitNorth
waitmovement 0
goto SafariZone_South_EventScript_Exit
end
```
### SafariZone_South_EventScript_ExitEarlyEast
```
applymovement LOCALID_SAFARI_EXIT_ATTENDANT, SafariZone_South_Movement_MoveExitAttendantEast
waitmovement 0
applymovement LOCALID_PLAYER, SafariZone_South_Movement_PlayerExitEast
waitmovement 0
goto SafariZone_South_EventScript_Exit
end
```
### SafariZone_South_EventScript_Exit
```
setvar VAR_SAFARI_ZONE_STATE, 1
special ExitSafariMode
warpdoor MAP_ROUTE121_SAFARI_ZONE_ENTRANCE, 2, 5
waitstate
end
```
### SafariZone_South_Movement_PlayerExitNorth
```
walk_up
step_end
```
### SafariZone_South_Movement_PlayerExitEast
```
walk_right
walk_in_place_faster_up
step_end
```
### SafariZone_South_Movement_MoveExitAttendantNorth
```
walk_left
walk_in_place_faster_right
step_end
```
### SafariZone_South_Movement_MoveExitAttendantEast
```
walk_down
walk_in_place_faster_up
step_end
```
### SafariZone_South_EventScript_ConstructionWorker1
```
msgbox SafariZone_South_Text_AreaOffLimits1, MSGBOX_NPC
end
```
### SafariZone_Southeast_EventScript_ExpansionZoneAttendant
```
msgbox SafariZone_Southeast_Text_ExpansionIsFinished, MSGBOX_NPC
end
```
### SafariZone_South_EventScript_ConstructionWorker2
```
msgbox SafariZone_South_Text_AreaOffLimits2, MSGBOX_NPC
end
```
### SafariZone_Southeast_EventScript_LittleGirl
```
msgbox SafariZone_Southeast_Text_LittleGirl, MSGBOX_NPC
end
```
### SafariZone_Southeast_EventScript_FatMan
```
msgbox SafariZone_Southeast_Text_FatMan, MSGBOX_NPC
end
```
### SafariZone_Southeast_EventScript_RichBoy
```
msgbox SafariZone_Southeast_Text_RichBoy, MSGBOX_NPC
end
```
### SafariZone_Northeast_EventScript_Boy
```
msgbox SafariZone_Northeast_Text_Boy, MSGBOX_NPC
end
```
### SafariZone_Northeast_EventScript_Woman
```
msgbox SafariZone_Northeast_Text_Woman, MSGBOX_NPC
end
```
### SafariZone_Northeast_EventScript_Girl
```
msgbox SafariZone_Northeast_Text_Girl, MSGBOX_NPC
end
```

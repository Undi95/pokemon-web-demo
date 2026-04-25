# BattleFrontier_BattlePikeRoomFinal

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_FINAL`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_FINAL`
- **music** : `MUS_B_PIKE`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PIKE_FINAL_ROOM_ATTENDANT` | `OBJ_EVENT_GFX_LINK_RECEPTIONIST` | 2,4 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |

## Variables référencées (2)
- `VAR_TEMP_0`
- `VAR_TEMP_4`

## Scripts (6)
### BattleFrontier_BattlePikeRoomFinal_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePikeRoomFinal_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattlePikeRoomFinal_OnWarp
```
### BattleFrontier_BattlePikeRoomFinal_OnFrame
```
map_script_2 VAR_TEMP_0, 0, BattleFrontier_BattlePikeRoomFinal_EventScript_EnterRoom
```
### BattleFrontier_BattlePikeRoomFinal_EventScript_EnterRoom
```
delay 16
applymovement LOCALID_PIKE_FINAL_ROOM_ATTENDANT, BattleFrontier_BattlePikeRoomFinal_Movement_AttendantApproachPlayer
waitmovement 0
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_WON
lockall
msgbox BattleFrontier_BattlePikeRoomFinal_Text_CongratsThisWayPlease, MSGBOX_DEFAULT
closemessage
releaseall
warp MAP_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY, 5, 6
waitstate
end
```
### BattleFrontier_BattlePikeRoomFinal_Movement_AttendantApproachPlayer
```
walk_down
walk_down
step_end
```
### BattleFrontier_BattlePikeRoomFinal_OnWarp
```
map_script_2 VAR_TEMP_4, 0, BattleFrontier_BattlePikeRoomFinal_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattlePikeRoomFinal_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_4, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```

## Textes (1)
### BattleFrontier_BattlePikeRoomFinal_Text_CongratsThisWayPlease
```
Félicitations…\nPar ici, s'il vous plaît…$
```

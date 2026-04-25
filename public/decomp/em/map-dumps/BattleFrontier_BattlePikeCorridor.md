# BattleFrontier_BattlePikeCorridor

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PIKE_CORRIDOR`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_CORRIDOR`
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
| `LOCALID_PIKE_CORRIDOR_ATTENDANT` | `OBJ_EVENT_GFX_LINK_RECEPTIONIST` | 6,6 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |

## Variables référencées (2)
- `VAR_TEMP_0`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BattleFrontier_BattlePike_EventScript_CloseCurtain`

## Scripts (8)
### BattleFrontier_BattlePikeCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePikeCorridor_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattlePikeCorridor_OnWarp
```
### BattleFrontier_BattlePikeCorridor_OnFrame
```
map_script_2 VAR_TEMP_0, 0, BattleFrontier_BattlePikeCorridor_EventScript_EnterCorridor
```
### BattleFrontier_BattlePikeCorridor_EventScript_EnterCorridor
```
delay 16
frontier_set FRONTIER_DATA_BATTLE_NUM, 1
pike_cleartrainerids
pike_nohealing TRUE
applymovement LOCALID_PLAYER, BattleFrontier_BattlePikeCorridor_Movement_PlayerEnterCorridor
applymovement LOCALID_PIKE_CORRIDOR_ATTENDANT, BattleFrontier_BattlePikeCorridor_Movement_AttendantEnterCorridor
waitmovement 0
lockall
msgbox BattleFrontier_BattlePikeCorridor_Text_YourChallengeHasBegun, MSGBOX_DEFAULT
closemessage
releaseall
applymovement LOCALID_PLAYER, BattleFrontier_BattlePikeCorridor_Movement_PlayerExitCorridor
waitmovement 0
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 99
call BattleFrontier_BattlePike_EventScript_CloseCurtain
warpsilent MAP_BATTLE_FRONTIER_BATTLE_PIKE_THREE_PATH_ROOM, 6, 10
waitstate
end
```
### BattleFrontier_BattlePikeCorridor_OnWarp
```
map_script_2 VAR_TEMP_1, 0, BattleFrontier_BattlePikeCorridor_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattlePikeCorridor_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_1, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### BattleFrontier_BattlePikeCorridor_Movement_PlayerEnterCorridor
```
walk_up
walk_up
step_end
```
### BattleFrontier_BattlePikeCorridor_Movement_PlayerExitCorridor
```
walk_up
walk_up
set_invisible
step_end
```
### BattleFrontier_BattlePikeCorridor_Movement_AttendantEnterCorridor
```
walk_up
walk_up
walk_left
face_down
step_end
```

## Textes (1)
### BattleFrontier_BattlePikeCorridor_Text_YourChallengeHasBegun
```
Votre COMBAT HASARD a\ncommencé…$
```

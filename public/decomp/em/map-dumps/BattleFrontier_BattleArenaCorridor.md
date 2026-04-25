# BattleFrontier_BattleArenaCorridor

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_ARENA_CORRIDOR`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_ARENA_CORRIDOR`
- **music** : `MUS_B_ARENA`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_ARENA_CORRIDOR_ATTENDANT` | `OBJ_EVENT_GFX_BLACK_BELT` | 9,12 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |

## Variables référencées (2)
- `VAR_0x8006`
- `VAR_TEMP_0`

## Scripts (8)
### BattleFrontier_BattleArenaCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattleArenaCorridor_OnFrame
```
### BattleFrontier_BattleArenaCorridor_OnFrame
```
map_script_2 VAR_TEMP_0, 0, BattleFrontier_BattleArenaCorridor_EventScript_WalkToBattleRoom
```
### BattleFrontier_BattleArenaCorridor_EventScript_WalkToBattleRoom
```
delay 16
setvar VAR_TEMP_0, 1
applymovement LOCALID_ARENA_CORRIDOR_ATTENDANT, BattleFrontier_BattleArenaCorridor_Movement_AttendantWalkToDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleArenaCorridor_Movement_PlayerWalkToDoor
waitmovement 0
applymovement LOCALID_ARENA_CORRIDOR_ATTENDANT, BattleFrontier_BattleArenaCorridor_Movement_AttendantFacePlayer
waitmovement 0
msgbox BattleFrontier_BattleArenaCorridor_Text_PleaseStepIn, MSGBOX_SIGN
applymovement LOCALID_ARENA_CORRIDOR_ATTENDANT, BattleFrontier_BattleArenaCorridor_Movement_AttendantMoveOutOfWay
waitmovement 0
applymovement LOCALID_PLAYER, BattleFrontier_BattleArenaCorridor_Movement_PlayerEnterDoor
waitmovement 0
setvar VAR_0x8006, 0
warp MAP_BATTLE_FRONTIER_BATTLE_ARENA_BATTLE_ROOM, 7, 5
waitstate
end
```
### BattleFrontier_BattleArenaCorridor_Movement_PlayerWalkToDoor
```
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_right
walk_right
walk_right
step_end
```
### BattleFrontier_BattleArenaCorridor_Movement_PlayerEnterDoor
```
walk_right
set_invisible
step_end
```
### BattleFrontier_BattleArenaCorridor_Movement_AttendantWalkToDoor
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
step_end
```
### BattleFrontier_BattleArenaCorridor_Movement_AttendantFacePlayer
```
walk_in_place_faster_left
step_end
```
### BattleFrontier_BattleArenaCorridor_Movement_AttendantMoveOutOfWay
```
walk_up
walk_in_place_faster_down
step_end
```

## Textes (1)
### BattleFrontier_BattleArenaCorridor_Text_PleaseStepIn
```
Entrez et surpassez-vous!$
```

# FallarborTown_BattleTentCorridor

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN_BATTLE_TENT_CORRIDOR`
- **layout** : `LAYOUT_BATTLE_TENT_CORRIDOR`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FALLARBOR_TENT_CORRIDOR_ATTENDANT` | `OBJ_EVENT_GFX_BLACK_BELT` | 2,6 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `0` |

## Variables référencées (2)
- `VAR_0x8006`
- `VAR_TEMP_0`

## Scripts (6)
### FallarborTown_BattleTentCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, FallarborTown_BattleTentCorridor_OnFrame
```
### FallarborTown_BattleTentCorridor_OnFrame
```
map_script_2 VAR_TEMP_0, 0, FallarborTown_BattleTentCorridor_EventScript_EnterCorridor
```
### FallarborTown_BattleTentCorridor_EventScript_EnterCorridor
```
lockall
setvar VAR_TEMP_0, 1
applymovement LOCALID_FALLARBOR_TENT_CORRIDOR_ATTENDANT, FallarborTown_BattleTentCorridor_Movement_WalkToDoor
applymovement LOCALID_PLAYER, FallarborTown_BattleTentCorridor_Movement_WalkToDoor
waitmovement 0
opendoor 2, 1
waitdooranim
applymovement LOCALID_FALLARBOR_TENT_CORRIDOR_ATTENDANT, FallarborTown_BattleTentCorridor_Movement_AttendantEnterDoor
applymovement LOCALID_PLAYER, FallarborTown_BattleTentCorridor_Movement_PlayerEnterDoor
waitmovement 0
closedoor 2, 1
waitdooranim
setvar VAR_0x8006, 0
warp MAP_FALLARBOR_TOWN_BATTLE_TENT_BATTLE_ROOM, 4, 4
waitstate
releaseall
end
```
### FallarborTown_BattleTentCorridor_Movement_WalkToDoor
```
walk_up
walk_up
walk_up
walk_up
step_end
```
### FallarborTown_BattleTentCorridor_Movement_PlayerEnterDoor
```
walk_up
```
### FallarborTown_BattleTentCorridor_Movement_AttendantEnterDoor
```
walk_up
set_invisible
step_end
```

## Textes (4)
### FallarborTown_ContestHall_Text_DoAllRightInPreliminary
```
We do all right in the preliminary round,\nbut we can never win the appeals…\pMaybe it means I have to watch what\nother contestants are doing…$
```
### FallarborTown_ContestHall_Text_MonAllTheseRibbons
```
See!\nMy POKéMON won all these RIBBONS!\pHave your POKéMON earned any RIBBONS?\nYou can check them on your POKéNAV.$
```
### FallarborTown_ContestHall_Text_CantWinEverywhere
```
I can't beat GYM LEADERS…\pI can't win any CONTESTS…\pI've been here, there, and everywhere,\nand it's all for naught…$
```
### FallarborTown_ContestHall_Text_SuperRankStage
```
POKéMON CONTESTS\nSUPER RANK STAGE!$
```

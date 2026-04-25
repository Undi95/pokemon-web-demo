# ShoalCave_LowTideEntranceRoom

## Métadonnées
- **id** : `MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM`
- **layout** : `LAYOUT_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_SHOAL_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 30,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `ShoalCave_LowTideEntranceRoom_EventScript_ItemBigPearl` | `FLAG_ITEM_SHOAL_CAVE_ENTRANCE_BIG_PEARL` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 18,15 | `MOVEMENT_TYPE_FACE_LEFT` | `ShoalCave_LowTideEntranceRoom_EventScript_ShellBellExpert` | `0` |

## Warps (4)
- #0 (20,30) → `MAP_ROUTE125` warp #0
- #1 (19,5) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #0
- #2 (6,2) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #6
- #3 (27,2) → `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM` warp #7

## Flags référencés (11)
- `FLAG_RECEIVED_SHOAL_SALT_1`
- `FLAG_RECEIVED_SHOAL_SALT_2`
- `FLAG_RECEIVED_SHOAL_SALT_3`
- `FLAG_RECEIVED_SHOAL_SALT_4`
- `FLAG_RECEIVED_SHOAL_SHELL_1`
- `FLAG_RECEIVED_SHOAL_SHELL_2`
- `FLAG_RECEIVED_SHOAL_SHELL_3`
- `FLAG_RECEIVED_SHOAL_SHELL_4`
- `FLAG_SYS_SHOAL_ITEM`
- `FLAG_SYS_SHOAL_TIDE`
- `FLAG_TEMP_2`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `ShoalCave_LowTideEntranceRoom_Text_AreYouPlanningOnGoingInThere`
- `ShoalCave_LowTideEntranceRoom_Text_BringMe4ShoalSaltAndShells`
- `ShoalCave_LowTideEntranceRoom_Text_ExplainShellBell`
- `ShoalCave_LowTideEntranceRoom_Text_MakeShellBellRightAway`
- `ShoalCave_LowTideEntranceRoom_Text_NoSpaceInYourBag`
- `ShoalCave_LowTideEntranceRoom_Text_WantedToMakeShellBell`
- `ShoalCave_LowTideEntranceRoom_Text_WouldYouLikeShellBell`

## Scripts (13)
### ShoalCave_LowTideEntranceRoom_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, ShoalCave_LowTideEntranceRoom_OnTransition
```
### ShoalCave_LowTideEntranceRoom_OnTransition
```
special UpdateShoalTideFlag
goto_if_set FLAG_SYS_SHOAL_TIDE, ShoalCave_LowTideEntranceRoom_EventScript_SetHighTide
goto ShoalCave_LowTideEntranceRoom_EventScript_SetLowTide
```
### ShoalCave_LowTideEntranceRoom_EventScript_SetHighTide
```
setmaplayoutindex LAYOUT_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_SetLowTide
```
setmaplayoutindex LAYOUT_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_ShellBellExpert
```
lock
faceplayer
dotimebasedevents
call_if_set FLAG_SYS_SHOAL_ITEM, ShoalCave_LowTideEntranceRoom_EventScript_ResetShoalItems
checkitem ITEM_SHOAL_SALT, 4
goto_if_eq VAR_RESULT, FALSE, ShoalCave_LowTideEntranceRoom_EventScript_NotEnoughShoalSaltOrShells
checkitem ITEM_SHOAL_SHELL, 4
goto_if_eq VAR_RESULT, FALSE, ShoalCave_LowTideEntranceRoom_EventScript_NotEnoughShoalSaltOrShells
msgbox ShoalCave_LowTideEntranceRoom_Text_WouldYouLikeShellBell, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, ShoalCave_LowTideEntranceRoom_EventScript_DeclineShellBell
checkitemspace ITEM_SHELL_BELL
call_if_eq VAR_RESULT, FALSE, ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreed
goto_if_eq VAR_RESULT, 2, ShoalCave_LowTideEntranceRoom_EventScript_NoRoomForShellBell
msgbox ShoalCave_LowTideEntranceRoom_Text_MakeShellBellRightAway, MSGBOX_DEFAULT
removeitem ITEM_SHOAL_SALT, 4
removeitem ITEM_SHOAL_SHELL, 4
giveitem ITEM_SHELL_BELL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull  @ Never FALSE, we already made sure there will be room in the bag.
msgbox ShoalCave_LowTideEntranceRoom_Text_ExplainShellBell, MSGBOX_DEFAULT
setflag FLAG_TEMP_2  @ Not read. Perhaps meant to stop him from re-explaining the Shell Bell if multiple are received in one sitting.
release
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreed
```
checkitem ITEM_SHOAL_SALT, 5
goto_if_eq VAR_RESULT, TRUE, ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreedShells
return
```
### ShoalCave_LowTideEntranceRoom_EventScript_CheckSpaceWillBeFreedShells
```
checkitem ITEM_SHOAL_SHELL, 5
goto_if_eq VAR_RESULT, TRUE, ShoalCave_LowTideEntranceRoom_EventScript_NoSpaceWillBeFreed
return
```
### ShoalCave_LowTideEntranceRoom_EventScript_NoSpaceWillBeFreed
```
setvar VAR_RESULT, 2
return
```
### ShoalCave_LowTideEntranceRoom_EventScript_NoRoomForShellBell
```
msgbox ShoalCave_LowTideEntranceRoom_Text_NoSpaceInYourBag, MSGBOX_DEFAULT
release
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_NotEnoughShoalSaltOrShells
```
checkitem ITEM_SHOAL_SALT
goto_if_eq VAR_RESULT, TRUE, ShoalCave_LowTideEntranceRoom_EventScript_HasSomeShoalSaltOrShell
checkitem ITEM_SHOAL_SHELL
goto_if_eq VAR_RESULT, TRUE, ShoalCave_LowTideEntranceRoom_EventScript_HasSomeShoalSaltOrShell
msgbox ShoalCave_LowTideEntranceRoom_Text_AreYouPlanningOnGoingInThere, MSGBOX_DEFAULT
release
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_HasSomeShoalSaltOrShell
```
msgbox ShoalCave_LowTideEntranceRoom_Text_BringMe4ShoalSaltAndShells, MSGBOX_DEFAULT
release
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_DeclineShellBell
```
msgbox ShoalCave_LowTideEntranceRoom_Text_WantedToMakeShellBell, MSGBOX_DEFAULT
release
end
```
### ShoalCave_LowTideEntranceRoom_EventScript_ResetShoalItems
```
clearflag FLAG_RECEIVED_SHOAL_SALT_1
clearflag FLAG_RECEIVED_SHOAL_SALT_2
clearflag FLAG_RECEIVED_SHOAL_SALT_3
clearflag FLAG_RECEIVED_SHOAL_SALT_4
clearflag FLAG_RECEIVED_SHOAL_SHELL_1
clearflag FLAG_RECEIVED_SHOAL_SHELL_2
clearflag FLAG_RECEIVED_SHOAL_SHELL_3
clearflag FLAG_RECEIVED_SHOAL_SHELL_4
clearflag FLAG_SYS_SHOAL_ITEM
return
```

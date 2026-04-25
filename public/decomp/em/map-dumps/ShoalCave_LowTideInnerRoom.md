# ShoalCave_LowTideInnerRoom

## Métadonnées
- **id** : `MAP_SHOAL_CAVE_LOW_TIDE_INNER_ROOM`
- **layout** : `LAYOUT_SHOAL_CAVE_LOW_TIDE_INNER_ROOM`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_SHOAL_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 26,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `ShoalCave_LowTideInnerRoom_EventScript_ItemRareCandy` | `FLAG_ITEM_SHOAL_CAVE_INNER_ROOM_RARE_CANDY` |

## Warps (8)
- #0 (34,29) → `MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM` warp #1
- #1 (38,15) → `MAP_SHOAL_CAVE_LOW_TIDE_STAIRS_ROOM` warp #0
- #2 (42,4) → `MAP_SHOAL_CAVE_LOW_TIDE_STAIRS_ROOM` warp #1
- #3 (19,14) → `MAP_SHOAL_CAVE_LOW_TIDE_LOWER_ROOM` warp #0
- #4 (15,19) → `MAP_SHOAL_CAVE_LOW_TIDE_LOWER_ROOM` warp #1
- #5 (30,25) → `MAP_SHOAL_CAVE_LOW_TIDE_LOWER_ROOM` warp #2
- #6 (14,33) → `MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM` warp #2
- #7 (40,33) → `MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM` warp #3

## BG events / signs (6)
- (31,8) [sign] → `ShoalCave_LowTideInnerRoom_EventScript_ShoalSalt1`
- (14,26) [sign] → `ShoalCave_LowTideInnerRoom_EventScript_ShoalSalt2`
- (41,20) [sign] → `ShoalCave_LowTideInnerRoom_EventScript_ShoalShell1`
- (41,10) [sign] → `ShoalCave_LowTideInnerRoom_EventScript_ShoalShell2`
- (6,9) [sign] → `ShoalCave_LowTideInnerRoom_EventScript_ShoalShell3`
- (16,13) [sign] → `ShoalCave_LowTideInnerRoom_EventScript_ShoalShell4`

## Flags référencés (7)
- `FLAG_RECEIVED_SHOAL_SALT_1`
- `FLAG_RECEIVED_SHOAL_SALT_2`
- `FLAG_RECEIVED_SHOAL_SHELL_1`
- `FLAG_RECEIVED_SHOAL_SHELL_2`
- `FLAG_RECEIVED_SHOAL_SHELL_3`
- `FLAG_RECEIVED_SHOAL_SHELL_4`
- `FLAG_SYS_SHOAL_TIDE`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `ShoalCave_Text_WasShoalSaltNowNothing`
- `ShoalCave_Text_WasShoallShellNowNothing`

## Scripts (20)
### ShoalCave_LowTideInnerRoom_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, ShoalCave_LowTideInnerRoom_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, ShoalCave_LowTideInnerRoom_OnTransition
```
### ShoalCave_LowTideInnerRoom_OnTransition
```
goto_if_set FLAG_SYS_SHOAL_TIDE, ShoalCave_LowTideInnerRoom_EventScript_SetHighTide
goto ShoalCave_LowTideInnerRoom_EventScript_SetLowTide
```
### ShoalCave_LowTideInnerRoom_EventScript_SetHighTide
```
setmaplayoutindex LAYOUT_SHOAL_CAVE_HIGH_TIDE_INNER_ROOM
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetLowTide
```
setmaplayoutindex LAYOUT_SHOAL_CAVE_LOW_TIDE_INNER_ROOM
end
```
### ShoalCave_LowTideInnerRoom_OnLoad
```
call ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles
```
goto_if_set FLAG_RECEIVED_SHOAL_SALT_1, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles2
goto_if_set FLAG_SYS_SHOAL_TIDE, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles2
setmetatile 31, 8, METATILE_Cave_ShoalCave_DirtPile_Large, TRUE
goto ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles2
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles2
```
goto_if_set FLAG_RECEIVED_SHOAL_SALT_2, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles3
goto_if_set FLAG_SYS_SHOAL_TIDE, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles3
setmetatile 14, 26, METATILE_Cave_ShoalCave_DirtPile_Large, TRUE
goto ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles3
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles3
```
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_1, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles4
setmetatile 41, 20, METATILE_Cave_ShoalCave_BlueStone_Large, TRUE
goto ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles4
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles4
```
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_2, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles5
setmetatile 41, 10, METATILE_Cave_ShoalCave_BlueStone_Large, TRUE
goto ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles5
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles5
```
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_3, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles6
setmetatile 6, 9, METATILE_Cave_ShoalCave_BlueStone_Large, TRUE
goto ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles6
end
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatiles6
```
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_4, ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatilesEnd
setmetatile 16, 13, METATILE_Cave_ShoalCave_BlueStone_Large, TRUE
return
```
### ShoalCave_LowTideInnerRoom_EventScript_SetShoalItemMetatilesEnd
```
return
```
### ShoalCave_LowTideInnerRoom_EventScript_ShoalShell1
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_1, ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalShell
giveitem ITEM_SHOAL_SHELL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 41, 20, METATILE_Cave_ShoalCave_BlueStone_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SHELL_1
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalShell
```
msgbox ShoalCave_Text_WasShoallShellNowNothing, MSGBOX_DEFAULT
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ShoalShell2
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_2, ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalShell
giveitem ITEM_SHOAL_SHELL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 41, 10, METATILE_Cave_ShoalCave_BlueStone_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SHELL_2
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ShoalShell3
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_3, ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalShell
giveitem ITEM_SHOAL_SHELL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 6, 9, METATILE_Cave_ShoalCave_BlueStone_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SHELL_3
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ShoalShell4
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SHELL_4, ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalShell
giveitem ITEM_SHOAL_SHELL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 16, 13, METATILE_Cave_ShoalCave_BlueStone_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SHELL_4
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ShoalSalt1
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SALT_1, ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalSalt
giveitem ITEM_SHOAL_SALT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 31, 8, METATILE_Cave_ShoalCave_DirtPile_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SALT_1
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalSalt
```
msgbox ShoalCave_Text_WasShoalSaltNowNothing, MSGBOX_DEFAULT
releaseall
end
```
### ShoalCave_LowTideInnerRoom_EventScript_ShoalSalt2
```
lockall
goto_if_set FLAG_RECEIVED_SHOAL_SALT_2, ShoalCave_LowTideInnerRoom_EventScript_ReceivedShoalSalt
giveitem ITEM_SHOAL_SALT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setmetatile 14, 26, METATILE_Cave_ShoalCave_DirtPile_Small, FALSE
special DrawWholeMapView
setflag FLAG_RECEIVED_SHOAL_SALT_2
releaseall
end
```

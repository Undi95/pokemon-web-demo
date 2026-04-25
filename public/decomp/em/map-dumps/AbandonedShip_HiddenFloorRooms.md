# AbandonedShip_HiddenFloorRooms

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_ROOMS`
- **layout** : `LAYOUT_ABANDONED_SHIP_HIDDEN_FLOOR_ROOMS`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 41,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_HiddenFloorRooms_EventScript_ItemLuxuryBall` | `FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_6_LUXURY_BALL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 16,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_HiddenFloorRooms_EventScript_ItemScanner` | `FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_2_SCANNER` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 5,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_HiddenFloorRooms_EventScript_ItemTMRainDance` | `FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_1_TM_RAIN_DANCE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 31,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_HiddenFloorRooms_EventScript_ItemWaterStone` | `FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_3_WATER_STONE` |

## Warps (9)
- #0 (6,14) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #0
- #1 (7,14) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #0
- #2 (21,14) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #1
- #3 (22,14) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #1
- #4 (36,14) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #2
- #5 (37,14) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #2
- #6 (6,1) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #3
- #7 (21,1) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #4
- #8 (36,1) → `MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS` warp #5

## BG events / signs (10)
- (42,10) [hidden_item] → ``
- (20,5) [hidden_item] → ``
- (1,12) [hidden_item] → ``
- (1,2) [hidden_item] → ``
- (8,5) [sign] → `AbandonedShip_HiddenFloorRooms_EventScript_Trash`
- (11,3) [sign] → `AbandonedShip_HiddenFloorRooms_EventScript_Trash`
- (10,10) [sign] → `AbandonedShip_HiddenFloorRooms_EventScript_Trash`
- (16,3) [sign] → `AbandonedShip_HiddenFloorRooms_EventScript_Trash`
- (25,2) [sign] → `AbandonedShip_HiddenFloorRooms_EventScript_Trash`
- (24,6) [sign] → `AbandonedShip_HiddenFloorRooms_EventScript_Trash`

## Variables référencées (5)
- `VAR_RESULT`
- `VAR_TEMP_1`
- `VAR_TEMP_2`
- `VAR_TEMP_3`
- `VAR_TEMP_4`

## Scripts (18)
### AbandonedShip_HiddenFloorRooms_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, AbandonedShip_HiddenFloorRooms_OnFrame
```
### AbandonedShip_HiddenFloorRooms_OnFrame
```
map_script_2 VAR_TEMP_1, 0, AbandonedShip_HiddenFloorRooms_EventScript_DoHiddenItemSparkle
```
### AbandonedShip_HiddenFloorRooms_EventScript_DoHiddenItemSparkle
```
setvar VAR_TEMP_1, 1
getplayerxy VAR_TEMP_2, VAR_TEMP_3
setvar VAR_TEMP_4, 1
call_if_eq VAR_TEMP_2, 21, AbandonedShip_HiddenFloorRooms_EventScript_InMiddleRoomColumn
call_if_eq VAR_TEMP_2, 36, AbandonedShip_HiddenFloorRooms_EventScript_InRightRoomColumn
call_if_eq VAR_TEMP_3, 2, AbandonedShip_HiddenFloorRooms_EventScript_InUpperRoomRow
switch VAR_TEMP_4
case 1, AbandonedShip_HiddenFloorRooms_EventScript_EnterRm1
case 2, AbandonedShip_HiddenFloorRooms_EventScript_EnterRm2
case 3, AbandonedShip_HiddenFloorRooms_EventScript_EnterRm3
case 4, AbandonedShip_HiddenFloorRooms_EventScript_EnterRm4
case 5, AbandonedShip_HiddenFloorRooms_EventScript_EnterRm5
case 6, AbandonedShip_HiddenFloorRooms_EventScript_EnterRm6
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_InMiddleRoomColumn
```
addvar VAR_TEMP_4, 1
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_InRightRoomColumn
```
addvar VAR_TEMP_4, 2
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_InUpperRoomRow
```
addvar VAR_TEMP_4, 3
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_EnterRm1
```
delay 20
dofieldeffectsparkle 10, 10, 0
specialvar VAR_RESULT, FoundAbandonedShipRoom4Key
call_if_eq VAR_RESULT, FALSE, AbandonedShip_HiddenFloorRooms_EventScript_Rm4KeySparkle
waitfieldeffect FLDEFF_SPARKLE
delay 10
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_EnterRm2
```
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_EnterRm3
```
specialvar VAR_RESULT, FoundAbandonedShipRoom1Key
goto_if_eq VAR_RESULT, TRUE, AbandonedShip_HiddenFloorRooms_EventScript_Rm3NoSparkle
delay 20
call_if_eq VAR_RESULT, FALSE, AbandonedShip_HiddenFloorRooms_EventScript_Rm1KeySparkle
waitfieldeffect FLDEFF_SPARKLE
delay 10
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_Rm3NoSparkle
```
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_EnterRm4
```
delay 20
dofieldeffectsparkle 8, 5, 0
dofieldeffectsparkle 11, 3, 0
specialvar VAR_RESULT, FoundAbandonedShipRoom6Key
call_if_eq VAR_RESULT, FALSE, AbandonedShip_HiddenFloorRooms_EventScript_Rm6KeySparkle
waitfieldeffect FLDEFF_SPARKLE
delay 10
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_EnterRm5
```
delay 20
dofieldeffectsparkle 16, 3, 0
dofieldeffectsparkle 25, 2, 0
dofieldeffectsparkle 24, 6, 0
specialvar VAR_RESULT, FoundAbandonedShipRoom2Key
call_if_eq VAR_RESULT, FALSE, AbandonedShip_HiddenFloorRooms_EventScript_Rm2KeySparkle
waitfieldeffect FLDEFF_SPARKLE
delay 10
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_EnterRm6
```
end
```
### AbandonedShip_HiddenFloorRooms_EventScript_Rm1KeySparkle
```
dofieldeffectsparkle 42, 10, 0
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_Rm2KeySparkle
```
dofieldeffectsparkle 20, 5, 0
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_Rm4KeySparkle
```
dofieldeffectsparkle 1, 12, 0
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_Rm6KeySparkle
```
dofieldeffectsparkle 1, 2, 0
return
```
### AbandonedShip_HiddenFloorRooms_EventScript_Trash
```
lockall
msgbox AbandonedShip_HiddenFloorRooms_Text_BrightShinyTrash, MSGBOX_DEFAULT
releaseall
end
```

## Textes (1)
### AbandonedShip_HiddenFloorRooms_Text_BrightShinyTrash
```
C'est clair et brillant!\nMais ce n'est que de la pacotille…$
```

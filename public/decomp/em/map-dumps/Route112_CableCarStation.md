# Route112_CableCarStation

## Métadonnées
- **id** : `MAP_ROUTE112_CABLE_CAR_STATION`
- **layout** : `LAYOUT_CABLE_CAR_STATION`
- **music** : `MUS_ROUTE110`
- **region_map_section** : `MAPSEC_ROUTE_112`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_ROUTE112_CABLE_CAR_ATTENDANT` | `OBJ_EVENT_GFX_BEAUTY` | 6,6 | `MOVEMENT_TYPE_FACE_DOWN` | `Route112_CableCarStation_EventScript_Attendant` | `0` |
| `` | `OBJ_EVENT_GFX_CABLE_CAR` | 6,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |

## Warps (2)
- #0 (6,11) → `MAP_ROUTE112` warp #0
- #1 (7,11) → `MAP_ROUTE112` warp #1

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_CABLE_CAR_STATION_STATE`
- `VAR_RESULT`

## Scripts (12)
### Route112_CableCarStation_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route112_CableCarStation_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route112_CableCarStation_OnFrame
```
### Route112_CableCarStation_OnTransition
```
setescapewarp MAP_ROUTE112, 28, 28
call_if_eq VAR_CABLE_CAR_STATION_STATE, 2, Route112_CableCarStation_EventScript_MoveAttendantAside
end
```
### Route112_CableCarStation_EventScript_MoveAttendantAside
```
setobjectxyperm LOCALID_ROUTE112_CABLE_CAR_ATTENDANT, 7, 4
setobjectmovementtype LOCALID_ROUTE112_CABLE_CAR_ATTENDANT, MOVEMENT_TYPE_FACE_LEFT
return
```
### Route112_CableCarStation_OnFrame
```
map_script_2 VAR_CABLE_CAR_STATION_STATE, 2, Route112_CableCarStation_EventScript_ExitCableCar
```
### Route112_CableCarStation_EventScript_ExitCableCar
```
lockall
applymovement LOCALID_PLAYER, Route112_CableCarStation_Movement_ExitCableCar
applymovement LOCALID_ROUTE112_CABLE_CAR_ATTENDANT, Route112_CableCarStation_Movement_FollowPlayerOutFromCableCar
waitmovement 0
setvar VAR_CABLE_CAR_STATION_STATE, 0
setobjectxyperm LOCALID_ROUTE112_CABLE_CAR_ATTENDANT, 6, 7
setobjectmovementtype LOCALID_ROUTE112_CABLE_CAR_ATTENDANT, MOVEMENT_TYPE_FACE_DOWN
releaseall
end
```
### Route112_CableCarStation_EventScript_Attendant
```
lock
faceplayer
msgbox Route112_CableCarStation_Text_CableCarReadyGetOn, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route112_CableCarStation_EventScript_RideCableCar
goto_if_eq VAR_RESULT, NO, Route112_CableCarStation_EventScript_DeclineRide
end
```
### Route112_CableCarStation_EventScript_RideCableCar
```
msgbox Route112_CableCarStation_Text_StepThisWay, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE112_CABLE_CAR_ATTENDANT, Route112_CableCarStation_Movement_LeadPlayerToCableCar
applymovement LOCALID_PLAYER, Route112_CableCarStation_Movement_BoardCableCar
waitmovement 0
setvar VAR_0x8004, FALSE  @ Going up
setvar VAR_CABLE_CAR_STATION_STATE, 1
incrementgamestat GAME_STAT_RODE_CABLE_CAR
special CableCarWarp
special CableCar
release
end
```
### Route112_CableCarStation_EventScript_DeclineRide
```
msgbox Route112_CableCarStation_Text_RideAnotherTime, MSGBOX_DEFAULT
release
end
```
### Route112_CableCarStation_Movement_LeadPlayerToCableCar
```
walk_up
walk_up
walk_right
walk_in_place_faster_left
step_end
```
### Route112_CableCarStation_Movement_FollowPlayerOutFromCableCar
```
delay_16
walk_left
walk_down
walk_down
step_end
```
### Route112_CableCarStation_Movement_BoardCableCar
```
walk_up
walk_up
walk_up
delay_16
step_end
```
### Route112_CableCarStation_Movement_ExitCableCar
```
walk_down
walk_down
walk_down
delay_16
step_end
```

## Textes (3)
### Route112_CableCarStation_Text_CableCarReadyGetOn
```
Le TELEPHERIQUE est sur le point\nde monter. Voulez-vous l'emprunter?$
```
### Route112_CableCarStation_Text_StepThisWay
```
Entrez, je vous en prie.$
```
### Route112_CableCarStation_Text_RideAnotherTime
```
N'hésitez pas à revenir nous voir.$
```

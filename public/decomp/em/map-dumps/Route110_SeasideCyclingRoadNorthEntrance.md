# Route110_SeasideCyclingRoadNorthEntrance

## Métadonnées
- **id** : `MAP_ROUTE110_SEASIDE_CYCLING_ROAD_NORTH_ENTRANCE`
- **layout** : `LAYOUT_ROUTE110_SEASIDE_CYCLING_ROAD_ENTRANCE`
- **music** : `MUS_SLATEPORT`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `True`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_SeasideCyclingRoadNorthEntrance_EventScript_Clerk` | `0` |

## Warps (4)
- #0 (1,5) → `MAP_ROUTE110` warp #2
- #1 (2,5) → `MAP_ROUTE110` warp #2
- #2 (12,5) → `MAP_ROUTE110` warp #3
- #3 (13,5) → `MAP_ROUTE110` warp #3

## Coord events / triggers (2)
- (7,4) → `Route110_SeasideCyclingRoadNorthEntrance_EventScript_BikeCheck` (si `VAR_TEMP_1` == `0`)
- (5,4) → `Route110_SeasideCyclingRoadNorthEntrance_EventScript_ClearCyclingRoad` (si `VAR_TEMP_1` == `1`)

## Flags référencés (1)
- `FLAG_SYS_CYCLING_ROAD`

## Variables référencées (3)
- `VAR_CYCLING_CHALLENGE_STATE`
- `VAR_RESULT`
- `VAR_TEMP_1`

## Scripts (9)
### Route110_SeasideCyclingRoadNorthEntrance_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route110_SeasideCyclingRoadNorthEntrance_OnTransition
```
### Route110_SeasideCyclingRoadNorthEntrance_OnTransition
```
call_if_eq VAR_CYCLING_CHALLENGE_STATE, 3, Route110_SeasideCyclingRoadNorthEntrance_EventScript_RestartChallenge
call_if_eq VAR_CYCLING_CHALLENGE_STATE, 2, Route110_SeasideCyclingRoadNorthEntrance_EventScript_RestartChallenge
end
```
### Route110_SeasideCyclingRoadNorthEntrance_EventScript_RestartChallenge
```
setvar VAR_CYCLING_CHALLENGE_STATE, 1
return
```
### Route110_SeasideCyclingRoadNorthEntrance_EventScript_Clerk
```
lock
faceplayer
msgbox Route110_SeasideCyclingRoadNorthEntrance_Text_GoAllOutOnCyclingRoad, MSGBOX_DEFAULT
release
end
```
### Route110_SeasideCyclingRoadNorthEntrance_EventScript_BikeCheck
```
lockall
specialvar VAR_RESULT, GetPlayerAvatarBike
call_if_eq VAR_RESULT, 2, Route110_SeasideCyclingRoadNorthEntrance_EventScript_OnMachBike
goto_if_eq VAR_RESULT, 0, Route110_SeasideCyclingRoadNorthEntrance_EventScript_NoBike
setflag FLAG_SYS_CYCLING_ROAD
setvar VAR_TEMP_1, 1
releaseall
end
```
### Route110_SeasideCyclingRoadNorthEntrance_EventScript_OnMachBike
```
setvar VAR_CYCLING_CHALLENGE_STATE, 1
return
```
### Route110_SeasideCyclingRoadNorthEntrance_EventScript_NoBike
```
msgbox Route110_SeasideCyclingRoadNorthEntrance_Text_TooDangerousToWalk, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Route110_SeasideCyclingRoadNorthEntrance_Movement_PushPlayerBackFromCounter
waitmovement 0
releaseall
end
```
### Route110_SeasideCyclingRoadNorthEntrance_Movement_PushPlayerBackFromCounter
```
walk_left
step_end
```
### Route110_SeasideCyclingRoadNorthEntrance_EventScript_ClearCyclingRoad
```
lockall
setvar VAR_CYCLING_CHALLENGE_STATE, 0
clearflag FLAG_SYS_CYCLING_ROAD
setvar VAR_TEMP_1, 0
releaseall
end
```

## Textes (2)
### Route110_SeasideCyclingRoadNorthEntrance_Text_GoAllOutOnCyclingRoad
```
Sur la PISTE CYCLABLE, on peut rouler\naussi vite qu'on veut.\pLa vitesse c'est grisant, mais un\naccident est vite arrivé!$
```
### Route110_SeasideCyclingRoadNorthEntrance_Text_TooDangerousToWalk
```
Désolé, mais vous ne pouvez pas marcher\nsur la PISTE CYCLABLE. C'est dangereux.\pRevenez avec un VELO.$
```

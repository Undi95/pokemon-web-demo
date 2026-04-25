# SouthernIsland_Exterior

## Métadonnées
- **id** : `MAP_SOUTHERN_ISLAND_EXTERIOR`
- **layout** : `LAYOUT_SOUTHERN_ISLAND_EXTERIOR`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_SOUTHERN_ISLAND`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SOUTHERN_ISLAND_SAILOR` | `OBJ_EVENT_GFX_SAILOR` | 13,23 | `MOVEMENT_TYPE_FACE_UP` | `SouthernIsland_Exterior_EventScript_Sailor` | `0` |
| `LOCALID_SOUTHERN_ISLAND_SS_TIDAL` | `OBJ_EVENT_GFX_SS_TIDAL` | 13,25 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `0` |

## Warps (2)
- #0 (14,5) → `MAP_SOUTHERN_ISLAND_INTERIOR` warp #0
- #1 (15,5) → `MAP_SOUTHERN_ISLAND_INTERIOR` warp #1

## BG events / signs (1)
- (16,7) [sign] → `SouthernIsland_Exterior_EventScript_Sign`

## Flags référencés (1)
- `FLAG_LANDMARK_SOUTHERN_ISLAND`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_FerryDepartIsland`
- `EventTicket_Text_AsYouLike`
- `EventTicket_Text_SailHome`
- `EventTicket_Text_SouthernIslandSailBack`
- `SouthernIsland_Exterior_Text_Sign`

## Scripts (9)
### SouthernIsland_Exterior_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SouthernIsland_Exterior_OnTransition
```
### SouthernIsland_Exterior_OnTransition
```
setflag FLAG_LANDMARK_SOUTHERN_ISLAND
end
```
### SouthernIsland_Exterior_EventScript_Sailor
```
lock
faceplayer
msgbox EventTicket_Text_SouthernIslandSailBack, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SouthernIsland_Exterior_EventScript_AsYouLike
msgbox EventTicket_Text_SailHome, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
hideobjectat LOCALID_SOUTHERN_ISLAND_SAILOR, MAP_SOUTHERN_ISLAND_EXTERIOR
setvar VAR_0x8004, LOCALID_SOUTHERN_ISLAND_SS_TIDAL
call Common_EventScript_FerryDepartIsland
warp MAP_LILYCOVE_CITY_HARBOR, 8, 11
waitstate
release
end
```
### SouthernIsland_Exterior_EventScript_AsYouLike
```
msgbox EventTicket_Text_AsYouLike, MSGBOX_DEFAULT
release
end
```
### Ferry_EventScript_DepartIslandSouth
```
applymovement LOCALID_PLAYER, Ferry_Movement_DepartIslandBoardSouth
waitmovement 0
return
```
### Ferry_EventScript_DepartIslandWest
```
applymovement LOCALID_PLAYER, Ferry_Movement_DepartIslandBoardWest
waitmovement 0
return
```
### Ferry_Movement_DepartIslandBoardSouth
```
walk_down
step_end
```
### Ferry_Movement_DepartIslandBoardWest
```
walk_left
walk_in_place_faster_down
step_end
```
### SouthernIsland_Exterior_EventScript_Sign
```
msgbox SouthernIsland_Exterior_Text_Sign, MSGBOX_SIGN
end
```

# FarawayIsland_Entrance

## Métadonnées
- **id** : `MAP_FARAWAY_ISLAND_ENTRANCE`
- **layout** : `LAYOUT_FARAWAY_ISLAND_ENTRANCE`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_FARAWAY_ISLAND`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FARAWAY_ISLAND_SAILOR` | `OBJ_EVENT_GFX_SAILOR` | 13,39 | `MOVEMENT_TYPE_FACE_UP` | `FarawayIsland_Entrance_EventScript_Sailor` | `0` |
| `LOCALID_FARAWAY_ISLAND_SS_TIDAL` | `OBJ_EVENT_GFX_SS_TIDAL` | 13,41 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `0` |

## Warps (2)
- #0 (22,7) → `MAP_FARAWAY_ISLAND_INTERIOR` warp #0
- #1 (23,7) → `MAP_FARAWAY_ISLAND_INTERIOR` warp #1

## Coord events / triggers (3)
- (9,18) → `FarawayIsland_Entrance_EventScript_SetCloudsWeather` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (10,20) → `FarawayIsland_Entrance_EventScript_ClearWeather` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (22,9) → `FarawayIsland_Entrance_EventScript_SetCloudsWeather` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)

## BG events / signs (1)
- (3,32) [sign] → `FarawayIsland_Entrance_EventScript_Sign`

## Flags référencés (1)
- `FLAG_ARRIVED_ON_FARAWAY_ISLAND`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_FerryDepartIsland`
- `EventTicket_Text_AsYouLike`
- `EventTicket_Text_SailHome`
- `FarawayIsland_Entrance_Text_SailorReturn`
- `FarawayIsland_Entrance_Text_Sign`

## Scripts (7)
### FarawayIsland_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, FarawayIsland_Entrance_OnTransition
```
### FarawayIsland_Entrance_OnTransition
```
setflag FLAG_ARRIVED_ON_FARAWAY_ISLAND
end
```
### FarawayIsland_Entrance_EventScript_SetCloudsWeather
```
setweather WEATHER_SUNNY_CLOUDS
doweather
end
```
### FarawayIsland_Entrance_EventScript_ClearWeather
```
setweather WEATHER_NONE
doweather
end
```
### FarawayIsland_Entrance_EventScript_Sailor
```
lock
faceplayer
msgbox FarawayIsland_Entrance_Text_SailorReturn, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, FarawayIsland_Entrance_EventScript_AsYouLike
msgbox EventTicket_Text_SailHome, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
hideobjectat LOCALID_FARAWAY_ISLAND_SAILOR, MAP_FARAWAY_ISLAND_ENTRANCE
setvar VAR_0x8004, LOCALID_FARAWAY_ISLAND_SS_TIDAL
call Common_EventScript_FerryDepartIsland
warp MAP_LILYCOVE_CITY_HARBOR, 8, 11
waitstate
release
end
```
### FarawayIsland_Entrance_EventScript_AsYouLike
```
msgbox EventTicket_Text_AsYouLike, MSGBOX_DEFAULT
release
end
```
### FarawayIsland_Entrance_EventScript_Sign
```
msgbox FarawayIsland_Entrance_Text_Sign, MSGBOX_SIGN
end
```

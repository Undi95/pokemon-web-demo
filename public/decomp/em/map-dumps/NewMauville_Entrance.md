# NewMauville_Entrance

## Métadonnées
- **id** : `MAP_NEW_MAUVILLE_ENTRANCE`
- **layout** : `LAYOUT_NEW_MAUVILLE_ENTRANCE`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_NEW_MAUVILLE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (4,6) → `MAP_ROUTE110` warp #0
- #1 (4,1) → `MAP_NEW_MAUVILLE_INSIDE` warp #0

## Coord events / triggers (1)
- (4,2) → `NewMauville_Entrance_EventScript_Door` (si `VAR_NEW_MAUVILLE_STATE` == `0`)

## Flags référencés (1)
- `FLAG_LANDMARK_NEW_MAUVILLE`

## Variables référencées (2)
- `VAR_NEW_MAUVILLE_STATE`
- `VAR_RESULT`

## Scripts (6)
### NewMauville_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, NewMauville_Entrance_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, NewMauville_Entrance_OnTransition
```
### NewMauville_Entrance_OnLoad
```
call_if_eq VAR_NEW_MAUVILLE_STATE, 0, NewMauville_Entrance_EventScript_CloseDoor
end
```
### NewMauville_Entrance_EventScript_CloseDoor
```
setmetatile 3, 0, METATILE_Facility_NewMauvilleDoor_Closed_Tile0, TRUE
setmetatile 4, 0, METATILE_Facility_NewMauvilleDoor_Closed_Tile1, TRUE
setmetatile 5, 0, METATILE_Facility_NewMauvilleDoor_Closed_Tile2, TRUE
setmetatile 3, 1, METATILE_Facility_NewMauvilleDoor_Closed_Tile3, TRUE
setmetatile 4, 1, METATILE_Facility_NewMauvilleDoor_Closed_Tile4, TRUE
setmetatile 5, 1, METATILE_Facility_NewMauvilleDoor_Closed_Tile5, TRUE
return
```
### NewMauville_Entrance_OnTransition
```
setflag FLAG_LANDMARK_NEW_MAUVILLE
end
```
### NewMauville_Entrance_EventScript_Door
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox NewMauville_Entrance_Text_DoorIsLocked, MSGBOX_DEFAULT
checkitem ITEM_BASEMENT_KEY
goto_if_eq VAR_RESULT, FALSE, NewMauville_Entrance_EventScript_DontOpenDoor
msgbox NewMauville_Entrance_Text_UseBasementKey, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, NewMauville_Entrance_EventScript_DontOpenDoor
msgbox NewMauville_Entrance_Text_UsedBasementKey, MSGBOX_DEFAULT
setmetatile 3, 0, METATILE_Facility_NewMauvilleDoor_Open_Tile0, FALSE
setmetatile 4, 0, METATILE_Facility_NewMauvilleDoor_Open_Tile1, FALSE
setmetatile 5, 0, METATILE_Facility_NewMauvilleDoor_Open_Tile2, FALSE
setmetatile 3, 1, METATILE_Facility_NewMauvilleDoor_Open_Tile3, TRUE
setmetatile 4, 1, METATILE_Facility_NewMauvilleDoor_Open_Tile4, FALSE
setmetatile 5, 1, METATILE_Facility_NewMauvilleDoor_Open_Tile5, TRUE
special DrawWholeMapView
playse SE_BANG
setvar VAR_NEW_MAUVILLE_STATE, 1
releaseall
end
```
### NewMauville_Entrance_EventScript_DontOpenDoor
```
releaseall
end
```

## Textes (3)
### NewMauville_Entrance_Text_DoorIsLocked
```
La porte est fermée.$
```
### NewMauville_Entrance_Text_UseBasementKey
```
Utiliser la CLE SOUS-SOL?$
```
### NewMauville_Entrance_Text_UsedBasementKey
```
{PLAYER} utilise la CLE SOUS-SOL.\pLa porte s'ouvre!$
```

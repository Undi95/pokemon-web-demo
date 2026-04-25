# SkyPillar_Outside

## Métadonnées
- **id** : `MAP_SKY_PILLAR_OUTSIDE`
- **layout** : `LAYOUT_SKY_PILLAR_OUTSIDE`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SKY_PILLAR`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SKY_PILLAR_WALLACE` | `OBJ_EVENT_GFX_WALLACE` | 13,7 | `MOVEMENT_TYPE_FACE_DOWN` | `SkyPillar_Outside_EventScript_Wallace` | `FLAG_HIDE_SKY_PILLAR_WALLACE` |

## Warps (2)
- #0 (17,13) → `MAP_SKY_PILLAR_ENTRANCE` warp #1
- #1 (14,5) → `MAP_SKY_PILLAR_1F` warp #0

## Flags référencés (4)
- `FLAG_HIDE_MAP_NAME_POPUP`
- `FLAG_HIDE_SOOTOPOLIS_CITY_WALLACE`
- `FLAG_SYS_WEATHER_CTRL`
- `FLAG_WALLACE_GOES_TO_SKY_PILLAR`

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_SOOTOPOLIS_CITY_STATE`

## Scripts (13)
### SkyPillar_Outside_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SkyPillar_Outside_OnTransition
map_script MAP_SCRIPT_ON_LOAD, SkyPillar_Outside_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, SkyPillar_Outside_OnFrame
```
### SkyPillar_Outside_OnTransition
```
call_if_eq VAR_SOOTOPOLIS_CITY_STATE, 3, SkyPillar_Outside_EventScript_HideMapNamePopup
call_if_ge VAR_SOOTOPOLIS_CITY_STATE, 4, SkyPillar_Outside_EventScript_CheckSetAbnormalWeather
end
```
### SkyPillar_Outside_EventScript_HideMapNamePopup
```
setflag FLAG_HIDE_MAP_NAME_POPUP
return
```
### SkyPillar_Outside_EventScript_CheckSetAbnormalWeather
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
return
```
### SkyPillar_Outside_OnLoad
```
call_if_set FLAG_WALLACE_GOES_TO_SKY_PILLAR, SkyPillar_Outside_EventScript_OpenDoor
end
```
### SkyPillar_Outside_EventScript_OpenDoor
```
setmetatile 14, 4, METATILE_Pacifidlog_SkyPillar_DoorOpen_Top, FALSE
setmetatile 14, 5, METATILE_Pacifidlog_SkyPillar_DoorOpen_Bottom, FALSE
return
```
### SkyPillar_Outside_OnFrame
```
map_script_2 VAR_SOOTOPOLIS_CITY_STATE, 3, SkyPillar_Outside_EventScript_WallaceScene
```
### SkyPillar_Outside_EventScript_WallaceScene
```
lockall
applymovement LOCALID_SKY_PILLAR_WALLACE, SkyPillar_Outside_Movement_WallaceApproachPlayer
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox SkyPillar_Outside_Text_OpenedDoorToSkyPillar, MSGBOX_DEFAULT
closemessage
delay 30
setvar VAR_0x8004, 1  @ vertical pan
setvar VAR_0x8005, 1  @ horizontal pan
setvar VAR_0x8006, 8  @ num shakes
setvar VAR_0x8007, 3  @ shake delay
special ShakeCamera
waitstate
delay 40
msgbox SkyPillar_Outside_Text_EarthquakeNotMomentToWaste, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, SkyPillar_Outside_Movement_PlayerClimbSkyPillar
applymovement LOCALID_SKY_PILLAR_WALLACE, SkyPillar_Outside_Movement_WallaceClimbSkyPillar
waitmovement 0
setvar VAR_0x8004, 1   @ vertical pan
setvar VAR_0x8005, 3   @ horizontal pan
setvar VAR_0x8006, 20  @ num shakes
setvar VAR_0x8007, 5   @ shake delay
special ShakeCamera
waitstate
delay 20
applymovement LOCALID_SKY_PILLAR_WALLACE, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 10
applymovement LOCALID_SKY_PILLAR_WALLACE, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 20
applymovement LOCALID_SKY_PILLAR_WALLACE, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
msgbox SkyPillar_Outside_Text_SituationGettingWorse, MSGBOX_DEFAULT
closemessage
setflag FLAG_SYS_WEATHER_CTRL
setweather WEATHER_ABNORMAL
doweather
special WaitWeather
delay 30
msgbox SkyPillar_Outside_Text_GotToGoBackForSootopolis, MSGBOX_DEFAULT
closemessage
playse SE_EXIT
fadescreenswapbuffers FADE_TO_BLACK
clearflag FLAG_HIDE_MAP_NAME_POPUP
setvar VAR_SOOTOPOLIS_CITY_STATE, 4
removeobject LOCALID_SKY_PILLAR_WALLACE
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_WALLACE
fadescreenswapbuffers FADE_FROM_BLACK
releaseall
end
```
### SkyPillar_Outside_Movement_WallaceApproachPlayer
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
step_end
```
### SkyPillar_Outside_Movement_WallaceClimbSkyPillar
```
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
walk_right
walk_up
walk_up
walk_up
walk_up
step_end
```
### SkyPillar_Outside_Movement_PlayerClimbSkyPillar
```
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
walk_right
walk_up
walk_up
walk_up
step_end
```
### SkyPillar_Outside_EventScript_Wallace
```
end
```
### SkyPillar_Outside_EventScript_ClosedDoor
```
msgbox SkyPillar_Outside_Text_DoorIsClosed, MSGBOX_SIGN
end
```

## Textes (5)
### SkyPillar_Outside_Text_DoorIsClosed
```
La porte est fermée.$
```
### SkyPillar_Outside_Text_OpenedDoorToSkyPillar
```
MARC: Oh, je suis terriblement désolé!\pDans ma hâte, je ne m'étais pas rendu\ncompte que tu ne me suivais pas!\pJ'ai ouvert la porte d'accès au\nPILIER CELESTE.\p{PLAYER}{KUN}, allons-y!$
```
### SkyPillar_Outside_Text_EarthquakeNotMomentToWaste
```
MARC: C'est un tremblement de terre!\pIl n'y a pas un instant à perdre!\nNous devons nous dépêcher!$
```
### SkyPillar_Outside_Text_SituationGettingWorse
```
MARC: Hum…\nLa situation est de pire en pire…$
```
### SkyPillar_Outside_Text_GotToGoBackForSootopolis
```
MARC: Ça ne va pas…\pLes changements climatiques se font\nmême sentir ici…\p{PLAYER}{KUN}.\pRAYQUAZA doit se trouver plus loin.\pJe suis inquiet pour ATALANOPOLIS,\nje dois y retourner.\pTout repose entre tes mains.\nNous comptons sur toi!$
```

# Route129

## Métadonnées
- **id** : `MAP_ROUTE129`
- **layout** : `LAYOUT_ROUTE129`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_129`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE128`
- left (offset 0) → `MAP_ROUTE130`
- dive (offset 0) → `MAP_UNDERWATER_ROUTE129`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 28,16 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_UP_RIGHT` | `Route129_EventScript_Chase` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 10,14 | `MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP` | `Route129_EventScript_Allison` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 13,22 | `MOVEMENT_TYPE_WALK_IN_PLACE_DOWN` | `Route129_EventScript_Tisha` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 35,9 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route129_EventScript_Reed` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 13,27 | `MOVEMENT_TYPE_WALK_IN_PLACE_UP` | `Route129_EventScript_Clarence` | `0` |

## Flags référencés (1)
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (3)
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`
- `VAR_SOOTOPOLIS_CITY_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route129_Text_AllisonPostBattle`
- `Route129_Text_ChasePostBattle`
- `Route129_Text_ClarencePostBattle`
- `Route129_Text_ReedPostBattle`
- `Route129_Text_TishaPostBattle`

## Scripts (10)
### Route129_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route129_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route129_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route129_OnFrame
```
### Route129_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_129_WEST, AbnormalWeather_EventScript_PlaceTilesRoute129West
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_129_EAST, AbnormalWeather_EventScript_PlaceTilesRoute129East
end
```
### Route129_OnTransition
```
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_ge VAR_SOOTOPOLIS_CITY_STATE, 4, Route129_EventScript_CheckSetAbnormalWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_129_WEST, AbnormalWeather_StartKyogreWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_129_EAST, AbnormalWeather_StartKyogreWeather
end
```
### Route129_EventScript_CheckSetAbnormalWeather
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
return
```
### Route129_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route129_EventScript_Chase
```
trainerbattle_single TRAINER_CHASE, Route129_Text_ChaseIntro, Route129_Text_ChaseDefeat
msgbox Route129_Text_ChasePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route129_EventScript_Allison
```
trainerbattle_single TRAINER_ALLISON, Route129_Text_AllisonIntro, Route129_Text_AllisonDefeat
msgbox Route129_Text_AllisonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route129_EventScript_Reed
```
trainerbattle_single TRAINER_REED, Route129_Text_ReedIntro, Route129_Text_ReedDefeat
msgbox Route129_Text_ReedPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route129_EventScript_Tisha
```
trainerbattle_single TRAINER_TISHA, Route129_Text_TishaIntro, Route129_Text_TishaDefeat
msgbox Route129_Text_TishaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route129_EventScript_Clarence
```
trainerbattle_single TRAINER_CLARENCE, Route129_Text_ClarenceIntro, Route129_Text_ClarenceDefeat
msgbox Route129_Text_ClarencePostBattle, MSGBOX_AUTOCLOSE
end
```

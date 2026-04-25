# Route125

## Métadonnées
- **id** : `MAP_ROUTE125`
- **layout** : `LAYOUT_ROUTE125`
- **music** : `MUS_ROUTE120`
- **region_map_section** : `MAPSEC_ROUTE_125`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 0) → `MAP_MOSSDEEP_CITY`
- left (offset 0) → `MAP_ROUTE124`
- dive (offset 0) → `MAP_UNDERWATER_ROUTE125`

## Object events (10 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 7,31 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route125_EventScript_Nolen` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 45,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route125_EventScript_Stan` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 38,24 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route125_EventScript_Tanya` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 30,28 | `MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP` | `Route125_EventScript_Sharon` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 21,30 | `MOVEMENT_TYPE_FACE_DOWN_AND_UP` | `Route125_EventScript_Ernest` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 17,19 | `MOVEMENT_TYPE_FACE_DOWN` | `Route125_EventScript_Kim` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 18,19 | `MOVEMENT_TYPE_FACE_DOWN` | `Route125_EventScript_Iris` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 43,19 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route125_EventScript_Presley` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 48,19 | `MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT` | `Route125_EventScript_Auron` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 46,17 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route125_EventScript_ItemBigPearl` | `FLAG_ITEM_ROUTE_125_BIG_PEARL` |

## Warps (1)
- #0 (22,19) → `MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM` warp #0

## BG events / signs (4)
- (53,10) [secret_base] → ``
- (55,11) [secret_base] → ``
- (7,25) [secret_base] → ``
- (24,32) [secret_base] → ``

## Flags référencés (1)
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (3)
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_RESULT`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route125_Text_AuronPostBattle`
- `Route125_Text_ErnestPostBattle`
- `Route125_Text_ErnestRegister`
- `Route125_Text_ErnestRematchPostBattle`
- `Route125_Text_IrisPostBattle`
- `Route125_Text_KimPostBattle`
- `Route125_Text_NolenPostBattle`
- `Route125_Text_PresleyPostBattle`
- `Route125_Text_SharonPostBattle`
- `Route125_Text_StanPostBattle`
- `Route125_Text_TanyaPostBattle`

## Scripts (15)
### Route125_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route125_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route125_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route125_OnFrame
```
### Route125_OnTransition
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_125_WEST, AbnormalWeather_StartKyogreWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_125_EAST, AbnormalWeather_StartKyogreWeather
end
```
### Route125_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_125_WEST, AbnormalWeather_EventScript_PlaceTilesRoute125West
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_125_EAST, AbnormalWeather_EventScript_PlaceTilesRoute125East
end
```
### Route125_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route125_EventScript_Nolen
```
trainerbattle_single TRAINER_NOLEN, Route125_Text_NolenIntro, Route125_Text_NolenDefeat
msgbox Route125_Text_NolenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Stan
```
trainerbattle_single TRAINER_STAN, Route125_Text_StanIntro, Route125_Text_StanDefeat
msgbox Route125_Text_StanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Tanya
```
trainerbattle_single TRAINER_TANYA, Route125_Text_TanyaIntro, Route125_Text_TanyaDefeat
msgbox Route125_Text_TanyaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Sharon
```
trainerbattle_single TRAINER_SHARON, Route125_Text_SharonIntro, Route125_Text_SharonDefeat
msgbox Route125_Text_SharonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Ernest
```
trainerbattle_single TRAINER_ERNEST_1, Route125_Text_ErnestIntro, Route125_Text_ErnestDefeat, Route125_EventScript_RegisterErnest
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route125_EventScript_RematchErnest
msgbox Route125_Text_ErnestPostBattle, MSGBOX_DEFAULT
release
end
```
### Route125_EventScript_RegisterErnest
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route125_Text_ErnestRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ERNEST_1
release
end
```
### Route125_EventScript_RematchErnest
```
trainerbattle_rematch TRAINER_ERNEST_1, Route125_Text_ErnestRematchIntro, Route125_Text_ErnestRematchDefeat
msgbox Route125_Text_ErnestRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Kim
```
trainerbattle_double TRAINER_KIM_AND_IRIS, Route125_Text_KimIntro, Route125_Text_KimDefeat, Route125_Text_KimNotEnoughMons
msgbox Route125_Text_KimPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Iris
```
trainerbattle_double TRAINER_KIM_AND_IRIS, Route125_Text_IrisIntro, Route125_Text_IrisDefeat, Route125_Text_IrisNotEnoughMons
msgbox Route125_Text_IrisPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Presley
```
trainerbattle_single TRAINER_PRESLEY, Route125_Text_PresleyIntro, Route125_Text_PresleyDefeat
msgbox Route125_Text_PresleyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route125_EventScript_Auron
```
trainerbattle_single TRAINER_AURON, Route125_Text_AuronIntro, Route125_Text_AuronDefeat
msgbox Route125_Text_AuronPostBattle, MSGBOX_AUTOCLOSE
end
```

# Route127

## Métadonnées
- **id** : `MAP_ROUTE127`
- **layout** : `LAYOUT_ROUTE127`
- **music** : `MUS_ROUTE120`
- **region_map_section** : `MAPSEC_ROUTE_127`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_MOSSDEEP_CITY`
- down (offset 0) → `MAP_ROUTE128`
- left (offset 0) → `MAP_ROUTE126`
- dive (offset 0) → `MAP_UNDERWATER_ROUTE127`

## Object events (11 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 45,42 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route127_EventScript_Camden` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 18,68 | `MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT` | `Route127_EventScript_Donny` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 14,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route127_EventScript_ItemZinc` | `FLAG_ITEM_ROUTE_127_ZINC` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 64,39 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route127_EventScript_ItemCarbos` | `FLAG_ITEM_ROUTE_127_CARBOS` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 42,21 | `MOVEMENT_TYPE_FACE_LEFT` | `Route127_EventScript_Jonah` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 64,19 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route127_EventScript_Roger` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 54,14 | `MOVEMENT_TYPE_FACE_UP` | `Route127_EventScript_Henry` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 15,23 | `MOVEMENT_TYPE_FACE_LEFT` | `Route127_EventScript_Aidan` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 63,63 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route127_EventScript_Koji` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 12,23 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route127_EventScript_Athena` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 13,20 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route127_EventScript_ItemRareCandy` | `FLAG_ITEM_ROUTE_127_RARE_CANDY` |

## BG events / signs (5)
- (59,67) [secret_base] → ``
- (59,72) [secret_base] → ``
- (67,63) [secret_base] → ``
- (61,21) [secret_base] → ``
- (45,24) [secret_base] → ``

## Flags référencés (1)
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (3)
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_RESULT`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route127_Text_AidanPostBattle`
- `Route127_Text_AthenaPostBattle`
- `Route127_Text_CamdenPostBattle`
- `Route127_Text_DonnyPostBattle`
- `Route127_Text_HenryPostBattle`
- `Route127_Text_JonahPostBattle`
- `Route127_Text_KojiPostBattle`
- `Route127_Text_KojiPostRematch`
- `Route127_Text_KojiRegister`
- `Route127_Text_RogerPostBattle`

## Scripts (14)
### Route127_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route127_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route127_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route127_OnFrame
```
### Route127_OnTransition
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_127_NORTH, AbnormalWeather_StartKyogreWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_127_SOUTH, AbnormalWeather_StartKyogreWeather
end
```
### Route127_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_127_NORTH, AbnormalWeather_EventScript_PlaceTilesRoute127North
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_127_SOUTH, AbnormalWeather_EventScript_PlaceTilesRoute127South
end
```
### Route127_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route127_EventScript_Camden
```
trainerbattle_single TRAINER_CAMDEN, Route127_Text_CamdenIntro, Route127_Text_CamdenDefeat
msgbox Route127_Text_CamdenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Donny
```
trainerbattle_single TRAINER_DONNY, Route127_Text_DonnyIntro, Route127_Text_DonnyDefeat
msgbox Route127_Text_DonnyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Jonah
```
trainerbattle_single TRAINER_JONAH, Route127_Text_JonahIntro, Route127_Text_JonahDefeat
msgbox Route127_Text_JonahPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Henry
```
trainerbattle_single TRAINER_HENRY, Route127_Text_HenryIntro, Route127_Text_HenryDefeat
msgbox Route127_Text_HenryPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Roger
```
trainerbattle_single TRAINER_ROGER, Route127_Text_RogerIntro, Route127_Text_RogerDefeat
msgbox Route127_Text_RogerPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Aidan
```
trainerbattle_single TRAINER_AIDAN, Route127_Text_AidanIntro, Route127_Text_AidanDefeat
msgbox Route127_Text_AidanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Athena
```
trainerbattle_single TRAINER_ATHENA, Route127_Text_AthenaIntro, Route127_Text_AthenaDefeat
msgbox Route127_Text_AthenaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route127_EventScript_Koji
```
trainerbattle_single TRAINER_KOJI_1, Route127_Text_KojiIntro, Route127_Text_KojiDefeat, Route127_EventScript_RegisterKoji
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route127_EventScript_RematchKoji
msgbox Route127_Text_KojiPostBattle, MSGBOX_DEFAULT
release
end
```
### Route127_EventScript_RegisterKoji
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route127_Text_KojiRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_KOJI_1
release
end
```
### Route127_EventScript_RematchKoji
```
trainerbattle_rematch TRAINER_KOJI_1, Route127_Text_KojiRematchIntro, Route127_Text_KojiRematchDefeat
msgbox Route127_Text_KojiPostRematch, MSGBOX_AUTOCLOSE
end
```

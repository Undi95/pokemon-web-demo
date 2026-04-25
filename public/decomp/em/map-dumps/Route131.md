# Route131

## Métadonnées
- **id** : `MAP_ROUTE131`
- **layout** : `LAYOUT_ROUTE131`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_131`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_PACIFIDLOG_TOWN`
- right (offset 0) → `MAP_ROUTE130`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 41,32 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_LEFT_DOWN` | `Route131_EventScript_Richard` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 18,19 | `MOVEMENT_TYPE_FACE_DOWN_LEFT_AND_RIGHT` | `Route131_EventScript_Herman` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 10,22 | `MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT` | `Route131_EventScript_Susie` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 31,25 | `MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_DOWN_RIGHT_UP` | `Route131_EventScript_Kara` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 9,16 | `MOVEMENT_TYPE_FACE_DOWN` | `Route131_EventScript_Reli` | `0` |
| `` | `OBJ_EVENT_GFX_TUBER_M_SWIMMING` | 8,16 | `MOVEMENT_TYPE_FACE_DOWN` | `Route131_EventScript_Ian` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 52,20 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route131_EventScript_Kevin` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 52,27 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route131_EventScript_Talia` | `0` |

## Warps (1)
- #0 (36,6) → `MAP_SKY_PILLAR_ENTRANCE` warp #0

## Flags référencés (1)
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (1)
- `VAR_SOOTOPOLIS_CITY_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route131_Text_HermanPostBattle`
- `Route131_Text_IanPostBattle`
- `Route131_Text_KaraPostBattle`
- `Route131_Text_KevinPostBattle`
- `Route131_Text_ReliPostBattle`
- `Route131_Text_RichardPostBattle`
- `Route131_Text_SusiePostBattle`
- `Route131_Text_TaliaPostBattle`

## Scripts (12)
### Route131_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route131_OnTransition
```
### Route131_OnTransition
```
call_if_ge VAR_SOOTOPOLIS_CITY_STATE, 4, Route131_EventScript_CheckSetAbnormalWeather
call Route131_EventScript_SetLayout
end
```
### Route131_EventScript_SetLayout
```
setmaplayoutindex LAYOUT_ROUTE131_SKY_PILLAR
return
```
### Route131_EventScript_CheckSetAbnormalWeather
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
return
```
### Route131_EventScript_Richard
```
trainerbattle_single TRAINER_RICHARD, Route131_Text_RichardIntro, Route131_Text_RichardDefeat
msgbox Route131_Text_RichardPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Herman
```
trainerbattle_single TRAINER_HERMAN, Route131_Text_HermanIntro, Route131_Text_HermanDefeat
msgbox Route131_Text_HermanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Susie
```
trainerbattle_single TRAINER_SUSIE, Route131_Text_SusieIntro, Route131_Text_SusieDefeat
msgbox Route131_Text_SusiePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Kara
```
trainerbattle_single TRAINER_KARA, Route131_Text_KaraIntro, Route131_Text_KaraDefeat
msgbox Route131_Text_KaraPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Reli
```
trainerbattle_double TRAINER_RELI_AND_IAN, Route131_Text_ReliIntro, Route131_Text_ReliDefeat, Route131_Text_ReliNotEnoughMons
msgbox Route131_Text_ReliPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Ian
```
trainerbattle_double TRAINER_RELI_AND_IAN, Route131_Text_IanIntro, Route131_Text_IanDefeat, Route131_Text_IanNotEnoughMons
msgbox Route131_Text_IanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Talia
```
trainerbattle_single TRAINER_TALIA, Route131_Text_TaliaIntro, Route131_Text_TaliaDefeat
msgbox Route131_Text_TaliaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route131_EventScript_Kevin
```
trainerbattle_single TRAINER_KEVIN, Route131_Text_KevinIntro, Route131_Text_KevinDefeat
msgbox Route131_Text_KevinPostBattle, MSGBOX_AUTOCLOSE
end
```

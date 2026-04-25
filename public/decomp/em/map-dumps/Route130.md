# Route130

## Métadonnées
- **id** : `MAP_ROUTE130`
- **layout** : `LAYOUT_ROUTE130`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_130`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_ROUTE131`
- right (offset 0) → `MAP_ROUTE129`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 70,21 | `MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN` | `Route130_EventScript_Rodney` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 7,21 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route130_EventScript_Katie` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 52,9 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `FLAG_TEMP_HIDE_MIRAGE_ISLAND_BERRY_TREE` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 7,30 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route130_EventScript_Santiago` | `0` |

## Flags référencés (16)
- `FLAG_SYS_WEATHER_CTRL`
- `FLAG_TEMP_12`
- `FLAG_TEMP_13`
- `FLAG_TEMP_14`
- `FLAG_TEMP_15`
- `FLAG_TEMP_16`
- `FLAG_TEMP_17`
- `FLAG_TEMP_18`
- `FLAG_TEMP_19`
- `FLAG_TEMP_1A`
- `FLAG_TEMP_1B`
- `FLAG_TEMP_1C`
- `FLAG_TEMP_1D`
- `FLAG_TEMP_1E`
- `FLAG_TEMP_1F`
- `FLAG_TEMP_HIDE_MIRAGE_ISLAND_BERRY_TREE`

## Variables référencées (2)
- `VAR_RESULT`
- `VAR_SOOTOPOLIS_CITY_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route130_Text_KatiePostBattle`
- `Route130_Text_RodneyPostBattle`
- `Route130_Text_SantiagoPostBattle`

## Scripts (7)
### Route130_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route130_OnTransition
```
### Route130_OnTransition
```
call_if_ge VAR_SOOTOPOLIS_CITY_STATE, 4, Route130_EventScript_CheckSetAbnormalWeather
specialvar VAR_RESULT, IsMirageIslandPresent
goto_if_eq VAR_RESULT, TRUE, Route130_EventScript_SetMirageIslandLayout
setflag FLAG_TEMP_HIDE_MIRAGE_ISLAND_BERRY_TREE
setflag FLAG_TEMP_12
setflag FLAG_TEMP_13
setflag FLAG_TEMP_14
setflag FLAG_TEMP_15
setflag FLAG_TEMP_16
setflag FLAG_TEMP_17
setflag FLAG_TEMP_18
setflag FLAG_TEMP_19
setflag FLAG_TEMP_1A
setflag FLAG_TEMP_1B
setflag FLAG_TEMP_1C
setflag FLAG_TEMP_1D
setflag FLAG_TEMP_1E
setflag FLAG_TEMP_1F
setmaplayoutindex LAYOUT_ROUTE130
end
```
### Route130_EventScript_SetMirageIslandLayout
```
setmaplayoutindex LAYOUT_ROUTE130_MIRAGE_ISLAND
end
```
### Route130_EventScript_CheckSetAbnormalWeather
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
return
```
### Route130_EventScript_Rodney
```
trainerbattle_single TRAINER_RODNEY, Route130_Text_RodneyIntro, Route130_Text_RodneyDefeat
msgbox Route130_Text_RodneyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route130_EventScript_Katie
```
trainerbattle_single TRAINER_KATIE, Route130_Text_KatieIntro, Route130_Text_KatieDefeat
msgbox Route130_Text_KatiePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route130_EventScript_Santiago
```
trainerbattle_single TRAINER_SANTIAGO, Route130_Text_SantiagoIntro, Route130_Text_SantiagoDefeat
msgbox Route130_Text_SantiagoPostBattle, MSGBOX_AUTOCLOSE
end
```

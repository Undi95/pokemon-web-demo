# Route126

## Métadonnées
- **id** : `MAP_ROUTE126`
- **layout** : `LAYOUT_ROUTE126`
- **music** : `MUS_ROUTE120`
- **region_map_section** : `MAPSEC_ROUTE_126`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE124`
- right (offset 0) → `MAP_ROUTE127`
- dive (offset 0) → `MAP_UNDERWATER_ROUTE126`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 51,65 | `MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN` | `Route126_EventScript_Barry` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 56,22 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route126_EventScript_Dean` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 63,43 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route126_EventScript_Nikki` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 9,48 | `MOVEMENT_TYPE_FACE_UP` | `Route126_EventScript_Brenda` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 14,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route126_EventScript_ItemGreenShard` | `FLAG_ITEM_ROUTE_126_GREEN_SHARD` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 15,66 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `Route126_EventScript_Sienna` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 7,66 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `Route126_EventScript_Pablo` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 64,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `Route126_EventScript_Isobel` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 56,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `Route126_EventScript_Leonardo` | `0` |

## Flags référencés (1)
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route126_Text_BarryPostBattle`
- `Route126_Text_BrendaPostBattle`
- `Route126_Text_DeanPostBattle`
- `Route126_Text_IsobelPostBattle`
- `Route126_Text_LeonardoPostBattle`
- `Route126_Text_NikkiPostBattle`
- `Route126_Text_PabloPostBattle`
- `Route126_Text_PabloPostRematch`
- `Route126_Text_PabloRegister`
- `Route126_Text_SiennaPostBattle`

## Scripts (12)
### Route126_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route126_OnTransition
```
### Route126_OnTransition
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
end
```
### Route126_EventScript_Barry
```
trainerbattle_single TRAINER_BARRY, Route126_Text_BarryIntro, Route126_Text_BarryDefeat
msgbox Route126_Text_BarryPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Dean
```
trainerbattle_single TRAINER_DEAN, Route126_Text_DeanIntro, Route126_Text_DeanDefeat
msgbox Route126_Text_DeanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Nikki
```
trainerbattle_single TRAINER_NIKKI, Route126_Text_NikkiIntro, Route126_Text_NikkiDefeat
msgbox Route126_Text_NikkiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Brenda
```
trainerbattle_single TRAINER_BRENDA, Route126_Text_BrendaIntro, Route126_Text_BrendaDefeat
msgbox Route126_Text_BrendaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Leonardo
```
trainerbattle_single TRAINER_LEONARDO, Route126_Text_LeonardoIntro, Route126_Text_LeonardoDefeat
msgbox Route126_Text_LeonardoPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Isobel
```
trainerbattle_single TRAINER_ISOBEL, Route126_Text_IsobelIntro, Route126_Text_IsobelDefeat
msgbox Route126_Text_IsobelPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Sienna
```
trainerbattle_single TRAINER_SIENNA, Route126_Text_SiennaIntro, Route126_Text_SiennaDefeat
msgbox Route126_Text_SiennaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route126_EventScript_Pablo
```
trainerbattle_single TRAINER_PABLO_1, Route126_Text_PabloIntro, Route126_Text_PabloDefeat, Route126_EventScript_RegisterPablo
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route126_EventScript_RematchPablo
msgbox Route126_Text_PabloPostBattle, MSGBOX_DEFAULT
release
end
```
### Route126_EventScript_RegisterPablo
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route126_Text_PabloRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_PABLO_1
release
end
```
### Route126_EventScript_RematchPablo
```
trainerbattle_rematch TRAINER_PABLO_1, Route126_Text_PabloRematchIntro, Route126_Text_PabloRematchDefeat
msgbox Route126_Text_PabloPostRematch, MSGBOX_AUTOCLOSE
end
```

# Route124

## Métadonnées
- **id** : `MAP_ROUTE124`
- **layout** : `LAYOUT_ROUTE124`
- **music** : `MUS_ROUTE120`
- **region_map_section** : `MAPSEC_ROUTE_124`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 0) → `MAP_ROUTE126`
- left (offset 10) → `MAP_LILYCOVE_CITY`
- right (offset 0) → `MAP_ROUTE125`
- right (offset 40) → `MAP_MOSSDEEP_CITY`
- dive (offset 0) → `MAP_UNDERWATER_ROUTE124`

## Object events (12 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 34,25 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route124_EventScript_Spencer` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 61,74 | `MOVEMENT_TYPE_WALK_IN_PLACE_RIGHT` | `Route124_EventScript_Roland` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 49,45 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route124_EventScript_Jenny` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 7,23 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route124_EventScript_Grace` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 58,58 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route124_EventScript_Chad` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 28,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route124_EventScript_ItemRedShard` | `FLAG_ITEM_ROUTE_124_RED_SHARD` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 31,53 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route124_EventScript_ItemBlueShard` | `FLAG_ITEM_ROUTE_124_BLUE_SHARD` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 58,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route124_EventScript_ItemYellowShard` | `FLAG_ITEM_ROUTE_124_YELLOW_SHARD` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 18,44 | `MOVEMENT_TYPE_FACE_DOWN` | `Route124_EventScript_Lila` | `0` |
| `` | `OBJ_EVENT_GFX_TUBER_M_SWIMMING` | 17,44 | `MOVEMENT_TYPE_FACE_DOWN` | `Route124_EventScript_Roy` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 7,29 | `MOVEMENT_TYPE_FACE_UP` | `Route124_EventScript_Declan` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 69,74 | `MOVEMENT_TYPE_WALK_IN_PLACE_LEFT` | `Route124_EventScript_Isabella` | `0` |

## Warps (1)
- #0 (70,48) → `MAP_ROUTE124_DIVING_TREASURE_HUNTERS_HOUSE` warp #0

## BG events / signs (1)
- (73,48) [sign] → `Route124_EventScript_HuntersHouseSign`

## Flags référencés (1)
- `FLAG_SYS_WEATHER_CTRL`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route124_Text_ChadPostBattle`
- `Route124_Text_DeclanPostBattle`
- `Route124_Text_GracePostBattle`
- `Route124_Text_IsabellaPostBattle`
- `Route124_Text_JennyPostBattle`
- `Route124_Text_JennyPostRematch`
- `Route124_Text_JennyRegister`
- `Route124_Text_LilaPostBattle`
- `Route124_Text_LilaPostRematch`
- `Route124_Text_LilaRoyRegister`
- `Route124_Text_RolandPostBattle`
- `Route124_Text_RoyPostBattle`
- `Route124_Text_RoyPostRematch`
- `Route124_Text_SpencerPostBattle`

## Scripts (18)
### Route124_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route124_OnTransition
```
### Route124_OnTransition
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
end
```
### Route124_EventScript_HuntersHouseSign
```
msgbox Route124_Text_HuntersHouse, MSGBOX_SIGN
end
```
### Route124_EventScript_Spencer
```
trainerbattle_single TRAINER_SPENCER, Route124_Text_SpencerIntro, Route124_Text_SpencerDefeat
msgbox Route124_Text_SpencerPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Roland
```
trainerbattle_single TRAINER_ROLAND, Route124_Text_RolandIntro, Route124_Text_RolandDefeat
msgbox Route124_Text_RolandPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Jenny
```
trainerbattle_single TRAINER_JENNY_1, Route124_Text_JennyIntro, Route124_Text_JennyDefeat, Route124_EventScript_RegisterJenny
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route124_EventScript_RematchJenny
msgbox Route124_Text_JennyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route124_EventScript_RegisterJenny
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route124_Text_JennyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_JENNY_1
release
end
```
### Route124_EventScript_RematchJenny
```
trainerbattle_rematch TRAINER_JENNY_1, Route124_Text_JennyRematchIntro, Route124_Text_JennyRematchDefeat
msgbox Route124_Text_JennyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Grace
```
trainerbattle_single TRAINER_GRACE, Route124_Text_GraceIntro, Route124_Text_GraceDefeat
msgbox Route124_Text_GracePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Chad
```
trainerbattle_single TRAINER_CHAD, Route124_Text_ChadIntro, Route124_Text_ChadDefeat
msgbox Route124_Text_ChadPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Lila
```
trainerbattle_double TRAINER_LILA_AND_ROY_1, Route124_Text_LilaIntro, Route124_Text_LilaDefeat, Route124_Text_LilaNotEnoughMons, Route124_EventScript_RegisterLila
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route124_EventScript_RematchLila
msgbox Route124_Text_LilaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route124_EventScript_RegisterLila
```
msgbox Route124_Text_LilaRoyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_LILA_AND_ROY_1
release
end
```
### Route124_EventScript_RematchLila
```
trainerbattle_rematch_double TRAINER_LILA_AND_ROY_1, Route124_Text_LilaRematchIntro, Route124_Text_LilaRematchDefeat, Route124_Text_LilaRematchNotEnoughMons
msgbox Route124_Text_LilaPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Roy
```
trainerbattle_double TRAINER_LILA_AND_ROY_1, Route124_Text_RoyIntro, Route124_Text_RoyDefeat, Route124_Text_RoyNotEnoughMons, Route124_EventScript_RegisterRoy
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route124_EventScript_RematchRoy
msgbox Route124_Text_RoyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route124_EventScript_RegisterRoy
```
msgbox Route124_Text_LilaRoyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_LILA_AND_ROY_1
release
end
```
### Route124_EventScript_RematchRoy
```
trainerbattle_rematch_double TRAINER_LILA_AND_ROY_1, Route124_Text_RoyRematchIntro, Route124_Text_RoyRematchDefeat, Route124_Text_RoyRematchNotEnoughMons
msgbox Route124_Text_RoyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Declan
```
trainerbattle_single TRAINER_DECLAN, Route124_Text_DeclanIntro, Route124_Text_DeclanDefeat
msgbox Route124_Text_DeclanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route124_EventScript_Isabella
```
trainerbattle_single TRAINER_ISABELLA, Route124_Text_IsabellaIntro, Route124_Text_IsabellaDefeat
msgbox Route124_Text_IsabellaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (1)
### Route124_Text_HuntersHouse
```
MAISON DU CHERCHEUR DE TRESORS$
```

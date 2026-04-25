# Route134

## Métadonnées
- **id** : `MAP_ROUTE134`
- **layout** : `LAYOUT_ROUTE134`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_134`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_SLATEPORT_CITY`
- right (offset 0) → `MAP_ROUTE133`

## Object events (11 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 49,9 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_RIGHT_DOWN_LEFT` | `Route134_EventScript_Jack` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 58,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route134_EventScript_Laurel` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 41,23 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route134_EventScript_Aaron` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 24,23 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route134_EventScript_Alex` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 49,16 | `MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT` | `Route134_EventScript_Hitoshi` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 43,23 | `MOVEMENT_TYPE_FACE_LEFT` | `Route134_EventScript_Marley` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 24,30 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route134_EventScript_Kelvin` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 50,16 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route134_EventScript_Reyna` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 63,14 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route134_EventScript_Hudson` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 50,17 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route134_EventScript_ItemCarbos` | `FLAG_ITEM_ROUTE_134_CARBOS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 22,27 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route134_EventScript_ItemStarPiece` | `FLAG_ITEM_ROUTE_134_STAR_PIECE` |

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route134_Text_AaronPostBattle`
- `Route134_Text_AlexPostBattle`
- `Route134_Text_HitoshiPostBattle`
- `Route134_Text_HudsonPostBattle`
- `Route134_Text_JackPostBattle`
- `Route134_Text_KelvinPostBattle`
- `Route134_Text_LaurelPostBattle`
- `Route134_Text_MarleyPostBattle`
- `Route134_Text_ReynaPostBattle`

## Scripts (11)
### Route134_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route134_OnResume
```
### Route134_OnResume
```
setdivewarp MAP_UNDERWATER_ROUTE134, 8, 6
end
```
### Route134_EventScript_Jack
```
trainerbattle_single TRAINER_JACK, Route134_Text_JackIntro, Route134_Text_JackDefeat
msgbox Route134_Text_JackPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Laurel
```
trainerbattle_single TRAINER_LAUREL, Route134_Text_LaurelIntro, Route134_Text_LaurelDefeat
msgbox Route134_Text_LaurelPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Alex
```
trainerbattle_single TRAINER_ALEX, Route134_Text_AlexIntro, Route134_Text_AlexDefeat
msgbox Route134_Text_AlexPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Aaron
```
trainerbattle_single TRAINER_AARON, Route134_Text_AaronIntro, Route134_Text_AaronDefeat
msgbox Route134_Text_AaronPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Hitoshi
```
trainerbattle_single TRAINER_HITOSHI, Route134_Text_HitoshiIntro, Route134_Text_HitoshiDefeat
msgbox Route134_Text_HitoshiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Hudson
```
trainerbattle_single TRAINER_HUDSON, Route134_Text_HudsonIntro, Route134_Text_HudsonDefeat
msgbox Route134_Text_HudsonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Reyna
```
trainerbattle_single TRAINER_REYNA, Route134_Text_ReynaIntro, Route134_Text_ReynaDefeat
msgbox Route134_Text_ReynaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Marley
```
trainerbattle_single TRAINER_MARLEY, Route134_Text_MarleyIntro, Route134_Text_MarleyDefeat
msgbox Route134_Text_MarleyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route134_EventScript_Kelvin
```
trainerbattle_single TRAINER_KELVIN, Route134_Text_KelvinIntro, Route134_Text_KelvinDefeat
msgbox Route134_Text_KelvinPostBattle, MSGBOX_AUTOCLOSE
end
```

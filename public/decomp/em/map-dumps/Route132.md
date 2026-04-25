# Route132

## Métadonnées
- **id** : `MAP_ROUTE132`
- **layout** : `LAYOUT_ROUTE132`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_132`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_ROUTE133`
- right (offset 0) → `MAP_PACIFIDLOG_TOWN`

## Object events (10 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 40,13 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT` | `Route132_EventScript_Gilbert` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 10,6 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT` | `Route132_EventScript_Dana` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 10,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route132_EventScript_ItemRareCandy` | `FLAG_ITEM_ROUTE_132_RARE_CANDY` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 9,15 | `MOVEMENT_TYPE_FACE_DOWN` | `Route132_EventScript_Kiyo` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 49,28 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route132_EventScript_Ronald` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 33,26 | `MOVEMENT_TYPE_FACE_DOWN` | `Route132_EventScript_Paxton` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 33,31 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route132_EventScript_Darcy` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 21,30 | `MOVEMENT_TYPE_FACE_UP` | `Route132_EventScript_Makayla` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 21,25 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route132_EventScript_Jonathan` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 20,27 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route132_EventScript_ItemProtein` | `FLAG_ITEM_ROUTE_132_PROTEIN` |

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route132_Text_DanaPostBattle`
- `Route132_Text_DarcyPostBattle`
- `Route132_Text_GilbertPostBattle`
- `Route132_Text_JonathanPostBattle`
- `Route132_Text_KiyoPostBattle`
- `Route132_Text_MakaylaPostBattle`
- `Route132_Text_PaxtonPostBattle`
- `Route132_Text_RonaldPostBattle`

## Scripts (8)
### Route132_EventScript_Gilbert
```
trainerbattle_single TRAINER_GILBERT, Route132_Text_GilbertIntro, Route132_Text_GilbertDefeat
msgbox Route132_Text_GilbertPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Dana
```
trainerbattle_single TRAINER_DANA, Route132_Text_DanaIntro, Route132_Text_DanaDefeat
msgbox Route132_Text_DanaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Ronald
```
trainerbattle_single TRAINER_RONALD, Route132_Text_RonaldIntro, Route132_Text_RonaldDefeat
msgbox Route132_Text_RonaldPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Kiyo
```
trainerbattle_single TRAINER_KIYO, Route132_Text_KiyoIntro, Route132_Text_KiyoDefeat
msgbox Route132_Text_KiyoPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Paxton
```
trainerbattle_single TRAINER_PAXTON, Route132_Text_PaxtonIntro, Route132_Text_PaxtonDefeat
msgbox Route132_Text_PaxtonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Darcy
```
trainerbattle_single TRAINER_DARCY, Route132_Text_DarcyIntro, Route132_Text_DarcyDefeat
msgbox Route132_Text_DarcyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Jonathan
```
trainerbattle_single TRAINER_JONATHAN, Route132_Text_JonathanIntro, Route132_Text_JonathanDefeat
msgbox Route132_Text_JonathanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route132_EventScript_Makayla
```
trainerbattle_single TRAINER_MAKAYLA, Route132_Text_MakaylaIntro, Route132_Text_MakaylaDefeat
msgbox Route132_Text_MakaylaPostBattle, MSGBOX_AUTOCLOSE
end
```

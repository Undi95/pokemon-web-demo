# Route133

## Métadonnées
- **id** : `MAP_ROUTE133`
- **layout** : `LAYOUT_ROUTE133`
- **music** : `MUS_ROUTE119`
- **region_map_section** : `MAPSEC_ROUTE_133`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_OCEAN_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_ROUTE134`
- right (offset 0) → `MAP_ROUTE132`

## Object events (10 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 68,27 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route133_EventScript_Franklin` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 13,3 | `MOVEMENT_TYPE_FACE_DOWN` | `Route133_EventScript_Linda` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 68,28 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route133_EventScript_Debra` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 53,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route133_EventScript_ItemBigPearl` | `FLAG_ITEM_ROUTE_133_BIG_PEARL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 8,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route133_EventScript_ItemStarPiece` | `FLAG_ITEM_ROUTE_133_STAR_PIECE` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 7,14 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route133_EventScript_Beck` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 37,15 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route133_EventScript_Warren` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 56,11 | `MOVEMENT_TYPE_FACE_DOWN` | `Route133_EventScript_Mollie` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 56,15 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route133_EventScript_Conor` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 48,28 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route133_EventScript_ItemMaxRevive` | `FLAG_ITEM_ROUTE_133_MAX_REVIVE` |

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route133_Text_BeckPostBattle`
- `Route133_Text_ConorPostBattle`
- `Route133_Text_DebraPostBattle`
- `Route133_Text_FranklinPostBattle`
- `Route133_Text_LindaPostBattle`
- `Route133_Text_MolliePostBattle`
- `Route133_Text_WarrenPostBattle`

## Scripts (7)
### Route133_EventScript_Franklin
```
trainerbattle_single TRAINER_FRANKLIN, Route133_Text_FranklinIntro, Route133_Text_FranklinDefeat
msgbox Route133_Text_FranklinPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route133_EventScript_Debra
```
trainerbattle_single TRAINER_DEBRA, Route133_Text_DebraIntro, Route133_Text_DebraDefeat
msgbox Route133_Text_DebraPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route133_EventScript_Linda
```
trainerbattle_single TRAINER_LINDA, Route133_Text_LindaIntro, Route133_Text_LindaDefeat
msgbox Route133_Text_LindaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route133_EventScript_Warren
```
trainerbattle_single TRAINER_WARREN, Route133_Text_WarrenIntro, Route133_Text_WarrenDefeat
msgbox Route133_Text_WarrenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route133_EventScript_Beck
```
trainerbattle_single TRAINER_BECK, Route133_Text_BeckIntro, Route133_Text_BeckDefeat
msgbox Route133_Text_BeckPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route133_EventScript_Mollie
```
trainerbattle_single TRAINER_MOLLIE, Route133_Text_MollieIntro, Route133_Text_MollieDefeat
msgbox Route133_Text_MolliePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route133_EventScript_Conor
```
trainerbattle_single TRAINER_CONOR, Route133_Text_ConorIntro, Route133_Text_ConorDefeat
msgbox Route133_Text_ConorPostBattle, MSGBOX_AUTOCLOSE
end
```

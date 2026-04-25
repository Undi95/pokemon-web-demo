# Route107

## Métadonnées
- **id** : `MAP_ROUTE107`
- **layout** : `LAYOUT_ROUTE107`
- **music** : `MUS_ROUTE104`
- **region_map_section** : `MAPSEC_ROUTE_107`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_DEWFORD_TOWN`
- right (offset 0) → `MAP_ROUTE108`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 41,10 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route107_EventScript_Darrin` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 23,11 | `MOVEMENT_TYPE_WALK_SEQUENCE_RIGHT_DOWN_LEFT_UP` | `Route107_EventScript_Tony` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 16,7 | `MOVEMENT_TYPE_FACE_DOWN_AND_UP` | `Route107_EventScript_Denise` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 50,11 | `MOVEMENT_TYPE_WALK_IN_PLACE_UP` | `Route107_EventScript_Beth` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 33,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route107_EventScript_Lisa` | `0` |
| `` | `OBJ_EVENT_GFX_TUBER_M_SWIMMING` | 32,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route107_EventScript_Ray` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 50,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_DOWN` | `Route107_EventScript_Camron` | `0` |

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route107_Text_BethPostBattle`
- `Route107_Text_CamronPostBattle`
- `Route107_Text_DarrinPostBattle`
- `Route107_Text_DenisePostBattle`
- `Route107_Text_LisaPostBattle`
- `Route107_Text_RayPostBattle`
- `Route107_Text_TonyPostBattle`
- `Route107_Text_TonyRegister`
- `Route107_Text_TonyRematchPostBattle`

## Scripts (9)
### Route107_EventScript_Darrin
```
trainerbattle_single TRAINER_DARRIN, Route107_Text_DarrinIntro, Route107_Text_DarrinDefeated
msgbox Route107_Text_DarrinPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route107_EventScript_Tony
```
trainerbattle_single TRAINER_TONY_1, Route107_Text_TonyIntro, Route107_Text_TonyDefeated, Route107_EventScript_TonyRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route107_EventScript_TonyRematch
msgbox Route107_Text_TonyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route107_EventScript_TonyRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route107_Text_TonyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_TONY_1
release
end
```
### Route107_EventScript_TonyRematch
```
trainerbattle_rematch TRAINER_TONY_1, Route107_Text_TonyRematchIntro, Route107_Text_TonyRematchDefeated
msgbox Route107_Text_TonyRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route107_EventScript_Denise
```
trainerbattle_single TRAINER_DENISE, Route107_Text_DeniseIntro, Route107_Text_DeniseDefeated
msgbox Route107_Text_DenisePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route107_EventScript_Beth
```
trainerbattle_single TRAINER_BETH, Route107_Text_BethIntro, Route107_Text_BethDefeated
msgbox Route107_Text_BethPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route107_EventScript_Lisa
```
trainerbattle_double TRAINER_LISA_AND_RAY, Route107_Text_LisaIntro, Route107_Text_LisaDefeated, Route107_Text_LisaNotEnoughPokemon
msgbox Route107_Text_LisaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route107_EventScript_Ray
```
trainerbattle_double TRAINER_LISA_AND_RAY, Route107_Text_RayIntro, Route107_Text_RayDefeated, Route107_Text_RayNotEnoughPokemon
msgbox Route107_Text_RayPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route107_EventScript_Camron
```
trainerbattle_single TRAINER_CAMRON, Route107_Text_CamronIntro, Route107_Text_CamronDefeated
msgbox Route107_Text_CamronPostBattle, MSGBOX_AUTOCLOSE
end
```

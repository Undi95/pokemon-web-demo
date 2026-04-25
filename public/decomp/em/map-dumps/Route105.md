# Route105

## Métadonnées
- **id** : `MAP_ROUTE105`
- **layout** : `LAYOUT_ROUTE105`
- **music** : `MUS_ROUTE104`
- **region_map_section** : `MAPSEC_ROUTE_105`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE104`
- down (offset 0) → `MAP_ROUTE106`
- dive (offset 0) → `MAP_UNDERWATER_ROUTE105`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 19,60 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route105_EventScript_Luis` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 27,36 | `MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT` | `Route105_EventScript_Dominik` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 8,45 | `MOVEMENT_TYPE_WALK_UP_AND_DOWN` | `Route105_EventScript_Beverly` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 19,9 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route105_EventScript_Imani` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 8,73 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route105_EventScript_ItemIron` | `FLAG_ITEM_ROUTE_105_IRON` |
| `` | `OBJ_EVENT_GFX_HIKER` | 17,48 | `MOVEMENT_TYPE_WALK_DOWN_AND_UP` | `Route105_EventScript_Foster` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 4,54 | `MOVEMENT_TYPE_FACE_DOWN` | `Route105_EventScript_Josue` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 4,58 | `MOVEMENT_TYPE_FACE_UP` | `Route105_EventScript_Andres` | `0` |

## Warps (1)
- #0 (9,20) → `MAP_ISLAND_CAVE` warp #0

## BG events / signs (2)
- (15,68) [hidden_item] → ``
- (5,56) [hidden_item] → ``

## Flags référencés (1)
- `FLAG_REGI_DOORS_OPENED`

## Variables référencées (3)
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_RESULT`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route105_Text_AndresPostBattle`
- `Route105_Text_AndresRegister`
- `Route105_Text_AndresRematchPostBattle`
- `Route105_Text_DominikPostBattle`
- `Route105_Text_FosterPostBattle`
- `Route105_Text_ImaniPostBattle`
- `Route105_Text_JosuePostBattle`
- `Route105_Text_LuisPostBattle`
- `Route105_Text_PostBattle`

## Scripts (14)
### Route105_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, Route105_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, Route105_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route105_OnFrame
```
### Route105_OnLoad
```
call_if_unset FLAG_REGI_DOORS_OPENED, Route105_CloseRegiEntrance
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_105_NORTH, AbnormalWeather_EventScript_PlaceTilesRoute105North
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_105_SOUTH, AbnormalWeather_EventScript_PlaceTilesRoute105South
end
```
### Route105_CloseRegiEntrance
```
setmetatile 9, 19, METATILE_General_RockWall_RockBase, TRUE
setmetatile 9, 20, METATILE_General_RockWall_SandBase, TRUE
return
```
### Route105_OnTransition
```
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_105_NORTH, AbnormalWeather_StartKyogreWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_105_SOUTH, AbnormalWeather_StartKyogreWeather
end
```
### Route105_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route105_EventScript_Foster
```
trainerbattle_single TRAINER_FOSTER, Route105_Text_FosterIntro, Route105_Text_FosterDefeated
msgbox Route105_Text_FosterPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route105_EventScript_Luis
```
trainerbattle_single TRAINER_LUIS, Route105_Text_LuisIntro, Route105_Text_LuisDefeated
msgbox Route105_Text_LuisPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route105_EventScript_Dominik
```
trainerbattle_single TRAINER_DOMINIK, Route105_Text_DominikIntro, Route105_Text_DominikDefeated
msgbox Route105_Text_DominikPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route105_EventScript_Beverly
```
trainerbattle_single TRAINER_BEVERLY, Route105_Text_BeverlyIntro, Route105_Text_BeverlyDefeated
msgbox Route105_Text_PostBattle, MSGBOX_AUTOCLOSE
end
```
### Route105_EventScript_Imani
```
trainerbattle_single TRAINER_IMANI, Route105_Text_ImaniIntro, Route105_Text_ImaniDefeated
msgbox Route105_Text_ImaniPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route105_EventScript_Josue
```
trainerbattle_single TRAINER_JOSUE, Route105_Text_JosueIntro, Route105_Text_JosueDefeated
msgbox Route105_Text_JosuePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route105_EventScript_Andres
```
trainerbattle_single TRAINER_ANDRES_1, Route105_Text_AndresIntro, Route105_Text_AndresDefeated, Route105_EventScript_AndresRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route105_EventScript_AndresRematch
msgbox Route105_Text_AndresPostBattle, MSGBOX_DEFAULT
release
end
```
### Route105_EventScript_AndresRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route105_Text_AndresRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ANDRES_1
release
end
```
### Route105_EventScript_AndresRematch
```
trainerbattle_rematch TRAINER_ANDRES_1, Route105_Text_AndresRematchIntro, Route105_Text_AndresRematchDefeated
msgbox Route105_Text_AndresRematchPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (2)
### Route104_Text_DadPokenavCall
```
… … … … … …\n… … … … … Bip!\pPAPA: Oh, {PLAYER}?\p… … … … … …\pOù es-tu, on dirait que le vent\nsouffle fort là où tu te trouves.\pM. ROCHARD de DEVON vient de me\nparler de ton POKéNAV, alors je me\lsuis dit que je devrais t'appeler!\pOn dirait que tu vas plutôt bien,\nje n'ai pas vraiment de raisons de\lm'inquiéter à ce que je vois.\pFais attention à toi.\p… … … … … …\n… … … … … Clic!$
```
### Route104_Text_RegisteredDadInPokenav
```
Vous avez enregistré PAPA NORMAN\ndans le POKéNAV.$
```

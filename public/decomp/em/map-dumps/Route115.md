# Route115

## Métadonnées
- **id** : `MAP_ROUTE115`
- **layout** : `LAYOUT_ROUTE115`
- **music** : `MUS_ROUTE104`
- **region_map_section** : `MAPSEC_ROUTE_115`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 0) → `MAP_RUSTBORO_CITY`
- right (offset -40) → `MAP_ROUTE114`

## Object events (23 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 18,68 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route115_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 5,15 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route115_EventScript_Timothy` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 27,53 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `Route115_EventScript_Nob` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 12,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 13,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 14,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 15,50 | `MOVEMENT_TYPE_WALK_IN_PLACE_DOWN` | `Route115_EventScript_Cyndy` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 19,15 | `MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT` | `Route115_EventScript_Koichi` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 24,62 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route115_EventScript_Hector` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 20,60 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route115_EventScript_ItemSuperPotion` | `FLAG_ITEM_ROUTE_115_SUPER_POTION` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 18,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route115_EventScript_ItemTMFocusPunch` | `FLAG_ITEM_ROUTE_115_TM_FOCUS_PUNCH` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 23,29 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route115_EventScript_ItemIron` | `FLAG_ITEM_ROUTE_115_IRON` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 31,64 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 31,65 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 29,50 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 31,56 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route115_EventScript_ItemGreatBall` | `FLAG_ITEM_ROUTE_115_GREAT_BALL` |
| `` | `OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F` | 10,15 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT` | `Route115_EventScript_Kyra` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 11,12 | `MOVEMENT_TYPE_TREE_DISGUISE` | `Route115_EventScript_Jaiden` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 15,7 | `MOVEMENT_TYPE_FACE_LEFT` | `Route115_EventScript_Helene` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 10,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route115_EventScript_Alix` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 28,62 | `MOVEMENT_TYPE_FACE_LEFT` | `Route115_EventScript_Marlene` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 26,67 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route115_EventScript_ItemPPUp` | `FLAG_ITEM_ROUTE_115_PP_UP` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 12,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route115_EventScript_ItemHealPowder` | `FLAG_ITEM_ROUTE_115_HEAL_POWDER` |

## Warps (3)
- #0 (27,37) → `MAP_METEOR_FALLS_1F_1R` warp #1
- #1 (21,6) → `MAP_TERRA_CAVE_ENTRANCE` warp #0
- #2 (36,10) → `MAP_TERRA_CAVE_ENTRANCE` warp #0

## BG events / signs (14)
- (32,6) [secret_base] → ``
- (21,18) [secret_base] → ``
- (16,64) [sign] → `Route115_EventScript_RouteSignRustboro`
- (25,38) [sign] → `Route115_EventScript_MeteorFallsSign`
- (8,30) [secret_base] → ``
- (32,39) [secret_base] → ``
- (26,15) [secret_base] → ``
- (23,8) [secret_base] → ``
- (32,46) [secret_base] → ``
- (7,20) [secret_base] → ``
- (8,20) [secret_base] → ``
- (25,24) [secret_base] → ``
- (20,53) [secret_base] → ``
- (15,49) [hidden_item] → ``

## Variables référencées (3)
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_RESULT`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route115_Text_AlixPostBattle`
- `Route115_Text_CyndyPostBattle`
- `Route115_Text_CyndyPostRematch`
- `Route115_Text_CyndyRegister`
- `Route115_Text_HectorPostBattle`
- `Route115_Text_HelenePostBattle`
- `Route115_Text_JaidenPostBattle`
- `Route115_Text_KoichiPostBattle`
- `Route115_Text_KyraPostBattle`
- `Route115_Text_MarlenePostBattle`
- `Route115_Text_NobPostBattle`
- `Route115_Text_NobPostRematch`
- `Route115_Text_NobRegister`
- `Route115_Text_TimothyPostBattle`
- `Route115_Text_TimothyPostRematch`
- `Route115_Text_TimothyRegister`

## Scripts (23)
### Route115_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, Route115_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, Route115_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route115_OnFrame
```
### Route115_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_115_WEST, AbnormalWeather_EventScript_PlaceTilesRoute115West
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_115_EAST, AbnormalWeather_EventScript_PlaceTilesRoute115East
end
```
### Route115_OnTransition
```
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_115_WEST, AbnormalWeather_StartGroudonWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_115_EAST, AbnormalWeather_StartGroudonWeather
end
```
### Route115_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route115_EventScript_Woman
```
msgbox Route115_Text_NeverKnowWhenCavePokemonWillAppear, MSGBOX_NPC
end
```
### Route115_EventScript_RouteSignRustboro
```
msgbox Route115_Text_RouteSignRustboro, MSGBOX_SIGN
end
```
### Route115_EventScript_MeteorFallsSign
```
msgbox Route115_Text_MeteorFallsSign, MSGBOX_SIGN
end
```
### Route115_EventScript_Timothy
```
trainerbattle_single TRAINER_TIMOTHY_1, Route115_Text_TimothyIntro, Route115_Text_TimothyDefeat, Route115_EventScript_RegisterTimothy
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route115_EventScript_RematchTimothy
msgbox Route115_Text_TimothyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route115_EventScript_RegisterTimothy
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route115_Text_TimothyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_TIMOTHY_1
release
end
```
### Route115_EventScript_RematchTimothy
```
trainerbattle_rematch TRAINER_TIMOTHY_1, Route115_Text_TimothyRematchIntro, Route115_Text_TimothyRematchDefeat
msgbox Route115_Text_TimothyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Koichi
```
trainerbattle_single TRAINER_KOICHI, Route115_Text_KoichiIntro, Route115_Text_KoichiDefeat
msgbox Route115_Text_KoichiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Nob
```
trainerbattle_single TRAINER_NOB_1, Route115_Text_NobIntro, Route115_Text_NobDefeat, Route115_EventScript_RegisterNob
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route115_EventScript_RematchNob
msgbox Route115_Text_NobPostBattle, MSGBOX_DEFAULT
release
end
```
### Route115_EventScript_RegisterNob
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route115_Text_NobRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_NOB_1
release
end
```
### Route115_EventScript_RematchNob
```
trainerbattle_rematch TRAINER_NOB_1, Route115_Text_NobRematchIntro, Route115_Text_NobRematchDefeat
msgbox Route115_Text_NobPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Cyndy
```
trainerbattle_single TRAINER_CYNDY_1, Route115_Text_CyndyIntro, Route115_Text_CyndyDefeat, Route115_EventScript_RegisterCyndy
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route115_EventScript_RematchCyndy
msgbox Route115_Text_CyndyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route115_EventScript_RegisterCyndy
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route115_Text_CyndyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_CYNDY_1
release
end
```
### Route115_EventScript_RematchCyndy
```
trainerbattle_rematch TRAINER_CYNDY_1, Route115_Text_CyndyRematchIntro, Route115_Text_CyndyRematchDefeat
msgbox Route115_Text_CyndyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Hector
```
trainerbattle_single TRAINER_HECTOR, Route115_Text_HectorIntro, Route115_Text_HectorDefeat
msgbox Route115_Text_HectorPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Kyra
```
trainerbattle_single TRAINER_KYRA, Route115_Text_KyraIntro, Route115_Text_KyraDefeat
msgbox Route115_Text_KyraPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Jaiden
```
trainerbattle_single TRAINER_JAIDEN, Route115_Text_JaidenIntro, Route115_Text_JaidenDefeat
msgbox Route115_Text_JaidenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Alix
```
trainerbattle_single TRAINER_ALIX, Route115_Text_AlixIntro, Route115_Text_AlixDefeat
msgbox Route115_Text_AlixPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Helene
```
trainerbattle_single TRAINER_HELENE, Route115_Text_HeleneIntro, Route115_Text_HeleneDefeat
msgbox Route115_Text_HelenePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route115_EventScript_Marlene
```
trainerbattle_single TRAINER_MARLENE, Route115_Text_MarleneIntro, Route115_Text_MarleneDefeat
msgbox Route115_Text_MarlenePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (3)
### Route115_Text_NeverKnowWhenCavePokemonWillAppear
```
Explorer une caverne, c'est pas comme\nmarcher dans la rue.\pOn ne sait jamais quand les POKéMON\nsauvages apparaissent. Ça fait peur!$
```
### Route115_Text_RouteSignRustboro
```
ROUTE 115\n{DOWN_ARROW} MEROUVILLE$
```
### Route115_Text_MeteorFallsSign
```
SITE METEORE\nVERS AUTEQUIA$
```

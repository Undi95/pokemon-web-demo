# Route118

## Métadonnées
- **id** : `MAP_ROUTE118`
- **layout** : `LAYOUT_ROUTE118`
- **music** : `MUS_ROUTE118`
- **region_map_section** : `MAPSEC_ROUTE_118`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 40) → `MAP_ROUTE119`
- left (offset 0) → `MAP_MAUVILLE_CITY`
- right (offset 0) → `MAP_ROUTE123`

## Object events (21 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 35,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 36,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 37,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 64,10 | `MOVEMENT_TYPE_FACE_DOWN` | `Route118_EventScript_Perry` | `0` |
| `LOCALID_ROUTE118_GABBY_1` | `OBJ_EVENT_GFX_REPORTER_F` | 33,8 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle2` | `FLAG_HIDE_ROUTE_118_GABBY_AND_TY_1` |
| `LOCALID_ROUTE118_TY_1` | `OBJ_EVENT_GFX_CAMERAMAN` | 34,8 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle2` | `FLAG_HIDE_ROUTE_118_GABBY_AND_TY_1` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 12,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route118_EventScript_Girl` | `0` |
| `LOCALID_ROUTE118_GABBY_2` | `OBJ_EVENT_GFX_REPORTER_F` | 33,8 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle5` | `FLAG_HIDE_ROUTE_118_GABBY_AND_TY_2` |
| `LOCALID_ROUTE118_TY_2` | `OBJ_EVENT_GFX_CAMERAMAN` | 34,8 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle5` | `FLAG_HIDE_ROUTE_118_GABBY_AND_TY_2` |
| `LOCALID_ROUTE118_GABBY_3` | `OBJ_EVENT_GFX_REPORTER_F` | 33,8 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle6` | `FLAG_HIDE_ROUTE_118_GABBY_AND_TY_3` |
| `LOCALID_ROUTE118_TY_3` | `OBJ_EVENT_GFX_CAMERAMAN` | 34,8 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle6` | `FLAG_HIDE_ROUTE_118_GABBY_AND_TY_3` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 38,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 28,8 | `MOVEMENT_TYPE_FACE_LEFT` | `Route118_EventScript_GoodRodFisherman` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 7,12 | `MOVEMENT_TYPE_FACE_UP` | `Route118_EventScript_Rose` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 14,14 | `MOVEMENT_TYPE_FACE_DOWN` | `Route118_EventScript_Wade` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 56,7 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route118_EventScript_Chester` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 39,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route118_EventScript_Barny` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 17,11 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `Route118_EventScript_Dalton` | `0` |
| `LOCALID_ROUTE118_STEVEN` | `OBJ_EVENT_GFX_STEVEN` | 44,7 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_118_STEVEN` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 69,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route118_EventScript_ItemHyperPotion` | `FLAG_ITEM_ROUTE_118_HYPER_POTION` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 7,7 | `MOVEMENT_TYPE_FACE_DOWN` | `Route118_EventScript_Deandre` | `0` |

## Warps (2)
- #0 (42,6) → `MAP_TERRA_CAVE_ENTRANCE` warp #0
- #1 (9,6) → `MAP_TERRA_CAVE_ENTRANCE` warp #0

## Coord events / triggers (3)
- (43,11) → `Route118_EventScript_StevenTrigger0` (si `VAR_ROUTE118_STATE` == `0`)
- (44,11) → `Route118_EventScript_StevenTrigger1` (si `VAR_ROUTE118_STATE` == `0`)
- (45,11) → `Route118_EventScript_StevenTrigger2` (si `VAR_ROUTE118_STATE` == `0`)

## BG events / signs (9)
- (47,14) [secret_base] → ``
- (13,6) [sign] → `Route118_EventScript_RouteSignMauville`
- (56,8) [sign] → `Route118_EventScript_RouteSign119`
- (67,6) [secret_base] → ``
- (29,5) [secret_base] → ``
- (47,5) [secret_base] → ``
- (46,5) [secret_base] → ``
- (31,13) [hidden_item] → ``
- (12,14) [hidden_item] → ``

## Flags référencés (1)
- `FLAG_RECEIVED_GOOD_ROD`

## Variables référencées (5)
- `VAR_0x8008`
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_RESULT`
- `VAR_ROUTE118_STATE`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route118_Text_BarnyPostBattle`
- `Route118_Text_ChesterPostBattle`
- `Route118_Text_DaltonPostBattle`
- `Route118_Text_DaltonPostRematch`
- `Route118_Text_DaltonRegister`
- `Route118_Text_DeandrePostBattle`
- `Route118_Text_PerryPostBattle`
- `Route118_Text_RosePostBattle`
- `Route118_Text_RosePostRematch`
- `Route118_Text_RoseRegister`
- `Route118_Text_WadePostBattle`
### data/scripts/gabby_and_ty.inc
- `GabbyAndTy_EventScript_UpdateLocation`

## Scripts (36)
### Route118_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route118_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route118_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route118_OnFrame
```
### Route118_OnTransition
```
call GabbyAndTy_EventScript_UpdateLocation
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_EAST, AbnormalWeather_StartGroudonWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_WEST, AbnormalWeather_StartGroudonWeather
end
```
### Route118_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_EAST, AbnormalWeather_EventScript_PlaceTilesRoute118East
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_118_WEST, AbnormalWeather_EventScript_PlaceTilesRoute118West
end
```
### Route118_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route118_EventScript_GoodRodFisherman
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_GOOD_ROD, Route118_EventScript_ReceivedGoodRod
msgbox Route118_Text_YouAgreeGoodRodIsGood, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route118_EventScript_ReceiveGoodRod
goto_if_eq VAR_RESULT, NO, Route118_EventScript_DeclineGoodRod
end
```
### Route118_EventScript_ReceiveGoodRod
```
msgbox Route118_Text_IdenticalMindsTakeThis, MSGBOX_DEFAULT
giveitem ITEM_GOOD_ROD
setflag FLAG_RECEIVED_GOOD_ROD
msgbox Route118_Text_TryYourLuckFishing, MSGBOX_DEFAULT
release
end
```
### Route118_EventScript_DeclineGoodRod
```
msgbox Route118_Text_DontYouLikeToFish, MSGBOX_DEFAULT
release
end
```
### Route118_EventScript_ReceivedGoodRod
```
msgbox Route118_Text_TryCatchingMonWithGoodRod, MSGBOX_DEFAULT
release
end
```
### Route118_EventScript_Girl
```
msgbox Route118_Text_CanCrossRiversWithSurf, MSGBOX_NPC
end
```
### Route118_EventScript_RouteSignMauville
```
msgbox Route118_Text_RouteSignMauville, MSGBOX_SIGN
end
```
### Route118_EventScript_RouteSign119
```
msgbox Route118_Text_RouteSign119, MSGBOX_SIGN
end
```
### Route118_EventScript_StevenTrigger0
```
lockall
setvar VAR_0x8008, 0
applymovement LOCALID_PLAYER, Common_Movement_FaceUp
waitmovement 0
applymovement LOCALID_ROUTE118_STEVEN, Route118_Movement_StevenApproachLedge0
waitmovement 0
goto Route118_EventScript_StevenTrigger
end
```
### Route118_EventScript_StevenTrigger1
```
lockall
setvar VAR_0x8008, 1
applymovement LOCALID_PLAYER, Common_Movement_FaceUp
waitmovement 0
goto Route118_EventScript_StevenTrigger
end
```
### Route118_EventScript_StevenTrigger2
```
lockall
setvar VAR_0x8008, 2
applymovement LOCALID_PLAYER, Common_Movement_FaceUp
waitmovement 0
applymovement LOCALID_ROUTE118_STEVEN, Route118_Movement_StevenApproachLedge2
waitmovement 0
goto Route118_EventScript_StevenTrigger
end
```
### Route118_EventScript_StevenTrigger
```
playse SE_LEDGE
applymovement LOCALID_ROUTE118_STEVEN, Route118_Movement_StevenJumpLedge
waitmovement 0
delay 30
msgbox Route118_Text_StevenQuestions, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8008, 0, Route118_EventScript_StevenExit0
call_if_eq VAR_0x8008, 1, Route118_EventScript_StevenExit1
call_if_eq VAR_0x8008, 2, Route118_EventScript_StevenExit2
setvar VAR_ROUTE118_STATE, 1
removeobject LOCALID_ROUTE118_STEVEN
releaseall
end
```
### Route118_EventScript_StevenExit0
```
applymovement LOCALID_PLAYER, Route118_Movement_PlayerWatchStevenExit
applymovement LOCALID_ROUTE118_STEVEN, Route118_Movement_StevenExit0
waitmovement 0
return
```
### Route118_EventScript_StevenExit1
```
applymovement LOCALID_PLAYER, Route118_Movement_PlayerWatchStevenExit
applymovement LOCALID_ROUTE118_STEVEN, Route118_Movement_StevenExit1
waitmovement 0
return
```
### Route118_EventScript_StevenExit2
```
applymovement LOCALID_PLAYER, Route118_Movement_PlayerWatchStevenExit
applymovement LOCALID_ROUTE118_STEVEN, Route118_Movement_StevenExit2
waitmovement 0
return
```
### Route118_Movement_PlayerWatchStevenExit
```
delay_16
walk_in_place_faster_right
step_end
```
### Route118_Movement_StevenApproachLedge0
```
walk_left
step_end
```
### Route118_Movement_StevenApproachLedge2
```
walk_right
step_end
```
### Route118_Movement_StevenJumpLedge
```
jump_2_down
delay_16
walk_down
step_end
```
### Route118_Movement_StevenExit0
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### Route118_Movement_StevenExit1
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### Route118_Movement_StevenExit2
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### Route118_EventScript_Rose
```
trainerbattle_single TRAINER_ROSE_1, Route118_Text_RoseIntro, Route118_Text_RoseDefeat, Route118_EventScript_RegisterRose
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route118_EventScript_RematchRose
msgbox Route118_Text_RosePostBattle, MSGBOX_DEFAULT
release
end
```
### Route118_EventScript_RegisterRose
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route118_Text_RoseRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ROSE_1
release
end
```
### Route118_EventScript_RematchRose
```
trainerbattle_rematch TRAINER_ROSE_1, Route118_Text_RoseRematchIntro, Route118_Text_RoseRematchDefeat
msgbox Route118_Text_RosePostRematch, MSGBOX_AUTOCLOSE
end
```
### Route118_EventScript_Barny
```
trainerbattle_single TRAINER_BARNY, Route118_Text_BarnyIntro, Route118_Text_BarnyDefeat
msgbox Route118_Text_BarnyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route118_EventScript_Wade
```
trainerbattle_single TRAINER_WADE, Route118_Text_WadeIntro, Route118_Text_WadeDefeat
msgbox Route118_Text_WadePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route118_EventScript_Dalton
```
trainerbattle_single TRAINER_DALTON_1, Route118_Text_DaltonIntro, Route118_Text_DaltonDefeat, Route118_EventScript_RegisterDalton
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route118_EventScript_RematchDalton
msgbox Route118_Text_DaltonPostBattle, MSGBOX_DEFAULT
release
end
```
### Route118_EventScript_RegisterDalton
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route118_Text_DaltonRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_DALTON_1
release
end
```
### Route118_EventScript_RematchDalton
```
trainerbattle_rematch TRAINER_DALTON_1, Route118_Text_DaltonRematchIntro, Route118_Text_DaltonRematchDefeat
msgbox Route118_Text_DaltonPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route118_EventScript_Perry
```
trainerbattle_single TRAINER_PERRY, Route118_Text_PerryIntro, Route118_Text_PerryDefeat
msgbox Route118_Text_PerryPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route118_EventScript_Chester
```
trainerbattle_single TRAINER_CHESTER, Route118_Text_ChesterIntro, Route118_Text_ChesterDefeat
msgbox Route118_Text_ChesterPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route118_EventScript_Deandre
```
trainerbattle_single TRAINER_DEANDRE, Route118_Text_DeandreIntro, Route118_Text_DeandreDefeat
msgbox Route118_Text_DeandrePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (9)
### Route118_Text_StevenQuestions
```
PIERRE: Salut, {PLAYER}{KUN}!\nC'est moi, PIERRE!\pNous nous sommes rencontrés près\ndu VILLAGE MYOKARA.\pAs-tu vu beaucoup de sortes de\nPOKéMON depuis la dernière fois?\pDans ce vaste monde, il existe\ntellement de POKéMON différents.\pElèves-tu différents types de\nPOKéMON?\pOu te concentres-tu sur un type\nprécis?\pQu'en penses-tu en tant que DRESSEUR?\pDésolé, ça ne me regarde pas vraiment,\npas vrai?\pBon, en tout cas, j'espère qu'on se\nreverra.$
```
### Route118_Text_YouAgreeGoodRodIsGood
```
Hum!\nUne SUPER CANNE, c'est vraiment bien!\pPas vrai?$
```
### Route118_Text_IdenticalMindsTakeThis
```
Hum!\nOn est sur la même longueur d'ondes!\pHum!\nPrends cette SUPER CANNE!$
```
### Route118_Text_TryYourLuckFishing
```
Lance ta CANNE partout où il y a de\nl'eau. On n'sait jamais!$
```
### Route118_Text_DontYouLikeToFish
```
Tu n'aimes pas pêcher?$
```
### Route118_Text_TryCatchingMonWithGoodRod
```
Essaie d'attraper toutes sortes de\nPOKéMON avec ta SUPER CANNE.$
```
### Route118_Text_CanCrossRiversWithSurf
```
Même sans bateau, tu peux traverser\nles rivières et la mer si tu as un\lPOKéMON qui connaît SURF.\pOn peut compter sur les POKéMON\npour tellement de choses!$
```
### Route118_Text_RouteSignMauville
```
ROUTE 118\n{LEFT_ARROW} LAVANDIA$
```
### Route118_Text_RouteSign119
```
ROUTE 118\n{UP_ARROW} ROUTE 119$
```

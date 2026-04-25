# Route104

## Métadonnées
- **id** : `MAP_ROUTE104`
- **layout** : `LAYOUT_ROUTE104`
- **music** : `MUS_ROUTE104`
- **region_map_section** : `MAPSEC_ROUTE_104`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_RUSTBORO_CITY`
- down (offset 0) → `MAP_ROUTE105`
- right (offset 50) → `MAP_PETALBURG_CITY`

## Object events (34 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 15,60 | `MOVEMENT_TYPE_FACE_LEFT` | `Route104_EventScript_BugCatcher` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 25,49 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route104_EventScript_Girl1` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 31,24 | `MOVEMENT_TYPE_FACE_LEFT` | `Route104_EventScript_Haley` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 27,63 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `Route104_EventScript_Boy1` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 30,50 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route104_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 28,74 | `MOVEMENT_TYPE_FACE_UP` | `Route104_EventScript_Girl2` | `0` |
| `LOCALID_ROUTE104_BOAT` | `OBJ_EVENT_GFX_MR_BRINEYS_BOAT` | 12,54 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_ROUTE_104_MR_BRINEY_BOAT` |
| `LOCALID_ROUTE104_BRINEY` | `OBJ_EVENT_GFX_EXPERT_M` | 12,51 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_ROUTE_104_MR_BRINEY` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 29,8 | `MOVEMENT_TYPE_FACE_DOWN` | `Route104_EventScript_Ivan` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 34,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 35,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 36,6 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 22,41 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 23,41 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 24,41 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 37,8 | `MOVEMENT_TYPE_FACE_LEFT` | `Route104_EventScript_ExpertF` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 3,22 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 3,23 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 3,24 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 3,25 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 39,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route104_EventScript_ItemPPUp` | `FLAG_ITEM_ROUTE_104_PP_UP` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 8,19 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route104_EventScript_WhiteHerbFlorist` | `FLAG_HIDE_ROUTE_104_WHITE_HERB_FLORIST` |
| `` | `OBJ_EVENT_GFX_TWIN` | 27,15 | `MOVEMENT_TYPE_FACE_DOWN` | `Route104_EventScript_Gina` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 28,15 | `MOVEMENT_TYPE_FACE_DOWN` | `Route104_EventScript_Mia` | `0` |
| `` | `OBJ_EVENT_GFX_RICH_BOY` | 21,25 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `Route104_EventScript_Winston` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 11,44 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route104_EventScript_Cindy` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 29,53 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route104_EventScript_ItemPokeBall` | `FLAG_ITEM_ROUTE_104_POKE_BALL` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 18,67 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT` | `Route104_EventScript_Billy` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 37,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route104_EventScript_ItemXAccuracy` | `FLAG_ITEM_ROUTE_104_X_ACCURACY` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 35,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 5,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route104_EventScript_ItemPotion` | `FLAG_ITEM_ROUTE_104_POTION` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 5,26 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route104_EventScript_Boy2` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 15,59 | `MOVEMENT_TYPE_FACE_LEFT` | `Route104_EventScript_Darian` | `0` |
| `LOCALID_ROUTE104_RIVAL` | `OBJ_EVENT_GFX_VAR_0` | 17,50 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route104_EventScript_Rival` | `FLAG_HIDE_ROUTE_104_RIVAL` |

## Warps (8)
- #0 (17,50) → `MAP_ROUTE104_MR_BRINEYS_HOUSE` warp #0
- #1 (5,18) → `MAP_ROUTE104_PRETTY_PETAL_FLOWER_SHOP` warp #0
- #2 (10,30) → `MAP_PETALBURG_WOODS` warp #0
- #3 (11,30) → `MAP_PETALBURG_WOODS` warp #1
- #4 (10,38) → `MAP_PETALBURG_WOODS` warp #2
- #5 (11,38) → `MAP_PETALBURG_WOODS` warp #3
- #6 (32,42) → `MAP_PETALBURG_WOODS` warp #4
- #7 (33,42) → `MAP_PETALBURG_WOODS` warp #5

## Coord events / triggers (1)
- (17,51) → `Route104_EventScript_RivalTrigger` (si `VAR_ROUTE104_STATE` == `1`)

## BG events / signs (10)
- (20,50) [sign] → `Route104_EventScript_BrineysCottageSign`
- (27,66) [sign] → `Route104_EventScript_RouteSignPetalburg`
- (23,5) [sign] → `Route104_EventScript_RouteSignRustboro`
- (7,20) [sign] → `Route104_EventScript_FlowerShopSign`
- (17,23) [sign] → `Route104_EventScript_TrainerTipsDoubleBattles`
- (7,6) [hidden_item] → ``
- (3,9) [hidden_item] → ``
- (14,55) [hidden_item] → ``
- (16,72) [hidden_item] → ``
- (16,64) [hidden_item] → ``

## Flags référencés (18)
- `FLAG_BADGE03_GET`
- `FLAG_DEFEATED_RIVAL_ROUTE_104`
- `FLAG_DELIVERED_STEVEN_LETTER`
- `FLAG_ENABLE_NORMAN_MATCH_CALL`
- `FLAG_ENABLE_RIVAL_MATCH_CALL`
- `FLAG_HAS_MATCH_CALL`
- `FLAG_HIDE_MR_BRINEY_BOAT_DEWFORD_TOWN`
- `FLAG_HIDE_MR_BRINEY_DEWFORD_TOWN`
- `FLAG_HIDE_ROUTE_104_MR_BRINEY_BOAT`
- `FLAG_HIDE_ROUTE_104_RIVAL`
- `FLAG_HIDE_ROUTE_104_WHITE_HERB_FLORIST`
- `FLAG_HIDE_RUSTBORO_CITY_RIVAL`
- `FLAG_MET_PRETTY_PETAL_SHOP_OWNER`
- `FLAG_MET_RIVAL_RUSTBORO`
- `FLAG_RECEIVED_CHESTO_BERRY_ROUTE_104`
- `FLAG_RECEIVED_TM_BULLET_SEED`
- `FLAG_RECEIVED_WHITE_HERB`
- `FLAG_REGISTER_RIVAL_POKENAV`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8008`
- `VAR_BOARD_BRINEY_BOAT_STATE`
- `VAR_BRINEY_LOCATION`
- `VAR_RESULT`
- `VAR_ROUTE104_STATE`
- `VAR_RUSTBORO_CITY_STATE`
- `VAR_STARTER_MON`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayBrineysBoatMusic`
- `Common_EventScript_StopBrineysBoatMusic`
- `DewfordTown_Text_BrineyLandedInDewford`
- `Route104_Text_BillyPostBattle`
- `Route104_Text_CindyPostBattle`
- `Route104_Text_CindyPostRematch`
- `Route104_Text_CindyRegister1`
- `Route104_Text_CindyRegister2`
- `Route104_Text_DarianPostBattle`
- `Route104_Text_GinaPostBattle`
- `Route104_Text_HaleyPostBattle`
- `Route104_Text_HaleyPostRematch`
- `Route104_Text_HaleyRegister1`
- `Route104_Text_HaleyRegister2`
- `Route104_Text_IvanPostBattle`
- `Route104_Text_LandedInDewfordDeliverLetter`
- `Route104_Text_MiaPostBattle`
- `Route104_Text_PlantBerriesInSoilTakeThis`
- `Route104_Text_RegisteredDadInPokenav`
- `Route104_Text_TrainersOftenMakeMonHoldBerries`
- `Route104_Text_WinstonPostBattle`
- `Route104_Text_WinstonPostRematch`
- `Route104_Text_WinstonRegister1`
- `Route104_Text_WinstonRegister2`
- `RustboroCity_EventScript_PlayRivalMusic`
### data/scripts/rival_graphics.inc
- `Common_EventScript_SetupRivalGfxId`

## Scripts (87)
### Route104_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route104_OnFrame
map_script MAP_SCRIPT_ON_TRANSITION, Route104_OnTransition
```
### Route104_OnFrame
```
map_script_2 VAR_BOARD_BRINEY_BOAT_STATE, 1, Route104_EventScript_StartSailToDewford
```
### Route104_EventScript_StartSailToDewford
```
lockall
goto Route104_EventScript_SailToDewford
end
```
### Route104_OnTransition
```
call Common_EventScript_SetupRivalGfxId
call Route104_EventScript_TrySetRivalPos
call Route104_EventScript_ShowOrHideWhiteHerbFlorist
end
```
### Route104_EventScript_ShowOrHideWhiteHerbFlorist
```
goto_if_unset FLAG_MET_PRETTY_PETAL_SHOP_OWNER, Route104_EventScript_HideWhiteHerbFlorist
goto_if_unset FLAG_BADGE03_GET, Route104_EventScript_HideWhiteHerbFlorist
clearflag FLAG_HIDE_ROUTE_104_WHITE_HERB_FLORIST
return
```
### Route104_EventScript_HideWhiteHerbFlorist
```
setflag FLAG_HIDE_ROUTE_104_WHITE_HERB_FLORIST
return
```
### Route104_EventScript_TrySetRivalPos
```
goto_if_ge VAR_BOARD_BRINEY_BOAT_STATE, 1, Route104_EventScript_DontSetRivalPos
goto_if_set FLAG_MET_RIVAL_RUSTBORO, Route104_EventScript_DontSetRivalPos
goto_if_unset FLAG_REGISTER_RIVAL_POKENAV, Route104_EventScript_DontSetRivalPos
setobjectxyperm LOCALID_ROUTE104_RIVAL, 17, 52
return
```
### Route104_EventScript_DontSetRivalPos
```
return
```
### Route104_EventScript_Rival
```
lockall
setvar VAR_0x8008, 1
applymovement LOCALID_ROUTE104_RIVAL, Common_Movement_FacePlayer
waitmovement 0
goto Route104_EventScript_RivalEncounter
```
### Route104_EventScript_RivalTrigger
```
lockall
setflag FLAG_HIDE_RUSTBORO_CITY_RIVAL
setvar VAR_RUSTBORO_CITY_STATE, 8
setvar VAR_ROUTE104_STATE, 2
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
delay 10
addobject LOCALID_ROUTE104_RIVAL
clearflag FLAG_HIDE_ROUTE_104_RIVAL
applymovement LOCALID_PLAYER, Route104_Movement_PlayerBackUp
waitmovement 0
applymovement LOCALID_ROUTE104_RIVAL, Route104_Movement_RivalExitBrineysCottage
waitmovement 0
delay 20
setvar VAR_0x8008, 0
call RustboroCity_EventScript_PlayRivalMusic
playse SE_PIN
applymovement LOCALID_ROUTE104_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_ROUTE104_RIVAL, Common_Movement_Delay48
waitmovement 0
goto Route104_EventScript_RivalEncounter
```
### Route104_EventScript_PlayRivalMusic
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, Route104_EventScript_PlayMayMusic
goto_if_eq VAR_RESULT, FEMALE, Route104_EventScript_PlayBrendanMusic
return
```
### Route104_EventScript_PlayMayMusic
```
playbgm MUS_ENCOUNTER_MAY, TRUE
return
```
### Route104_EventScript_PlayBrendanMusic
```
playbgm MUS_ENCOUNTER_BRENDAN, TRUE
return
```
### Route104_EventScript_RivalEncounter
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, Route104_EventScript_MayEncounter
goto_if_eq VAR_RESULT, FEMALE, Route104_EventScript_BrendanEncounter
end
```
### Route104_EventScript_MayEncounter
```
goto_if_set FLAG_DEFEATED_RIVAL_ROUTE_104, Route104_EventScript_MayDefeated
goto_if_set FLAG_REGISTER_RIVAL_POKENAV, Route104_EventScript_MayAskToBattle
setflag FLAG_REGISTER_RIVAL_POKENAV
msgbox Route104_Text_MayWeShouldRegister, MSGBOX_DEFAULT
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox Route104_Text_RegisteredMay, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_RIVAL_MATCH_CALL
applymovement LOCALID_PLAYER, Route104_Movement_PlayerFaceRival
applymovement LOCALID_ROUTE104_RIVAL, Route104_Movement_RivalWalkSlowLeft
msgbox Route104_Text_MayHowsYourPokedex, MSGBOX_DEFAULT
closemessage
waitmovement 0
applymovement LOCALID_ROUTE104_RIVAL, Route104_Movement_RivalApproachPlayer
waitmovement 0
copyobjectxytoperm LOCALID_ROUTE104_RIVAL
msgbox Route104_Text_MayMinesDecentLetsBattle, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route104_EventScript_BattleMay
msgbox Route104_Text_MayHaventRaisedPokemon, MSGBOX_DEFAULT
call Route104_EventScript_RestoreMusic
releaseall
end
```
### Route104_Movement_RivalWalkSlowLeft
```
walk_slow_left
step_end
```
### Route104_Movement_RivalApproachPlayer
```
walk_down
face_right
step_end
```
### Route104_Movement_PlayerFaceRival
```
delay_4
walk_in_place_faster_left
step_end
```
### Route104_EventScript_MayAskToBattle
```
msgbox Route104_Text_MayLetsBattle, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route104_EventScript_BattleMay
msgbox Route104_Text_MayHaventRaisedPokemon, MSGBOX_DEFAULT
releaseall
end
```
### Route104_EventScript_BattleMay
```
msgbox Route104_Text_MayIntro, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route104_EventScript_BattleMayTreecko
case 1, Route104_EventScript_BattleMayTorchic
case 2, Route104_EventScript_BattleMayMudkip
end
```
### Route104_EventScript_MayDefeated
```
msgbox Route104_Text_MayPostBattle, MSGBOX_DEFAULT
call_if_eq VAR_0x8008, 0, Route104_EventScript_RestoreMusic
releaseall
end
```
### Route104_EventScript_RestoreMusic
```
savebgm MUS_DUMMY
fadedefaultbgm
return
```
### Route104_EventScript_BattleMayTreecko
```
trainerbattle_no_intro TRAINER_MAY_RUSTBORO_TREECKO, Route104_Text_MayDefeat
setflag FLAG_DEFEATED_RIVAL_ROUTE_104
goto Route104_EventScript_MayDefeated
end
```
### Route104_EventScript_BattleMayTorchic
```
trainerbattle_no_intro TRAINER_MAY_RUSTBORO_TORCHIC, Route104_Text_MayDefeat
setflag FLAG_DEFEATED_RIVAL_ROUTE_104
goto Route104_EventScript_MayDefeated
end
```
### Route104_EventScript_BattleMayMudkip
```
trainerbattle_no_intro TRAINER_MAY_RUSTBORO_MUDKIP, Route104_Text_MayDefeat
setflag FLAG_DEFEATED_RIVAL_ROUTE_104
goto Route104_EventScript_MayDefeated
end
```
### Route104_EventScript_BrendanEncounter
```
goto_if_set FLAG_DEFEATED_RIVAL_ROUTE_104, Route104_EventScript_BrendanDefeated
goto_if_set FLAG_REGISTER_RIVAL_POKENAV, Route104_EventScript_BrendanAskToBattle
setflag FLAG_REGISTER_RIVAL_POKENAV
msgbox Route104_Text_BrendanWeShouldRegister, MSGBOX_DEFAULT
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox Route104_Text_RegisteredBrendan, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_RIVAL_MATCH_CALL
applymovement LOCALID_PLAYER, Route104_Movement_PlayerFaceRival
applymovement LOCALID_ROUTE104_RIVAL, Route104_Movement_RivalWalkSlowLeft
msgbox Route104_Text_BrendanHowsYourPokedex, MSGBOX_DEFAULT
closemessage
waitmovement 0
applymovement LOCALID_ROUTE104_RIVAL, Route104_Movement_RivalApproachPlayer
waitmovement 0
copyobjectxytoperm LOCALID_ROUTE104_RIVAL
msgbox Route104_Text_BrendanDoingGreatLetsBattle, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route104_EventScript_BattleBrendan
msgbox Route104_Text_BrendanNoConfidence, MSGBOX_DEFAULT
call Route104_EventScript_RestoreMusic
releaseall
end
```
### Route104_EventScript_BrendanAskToBattle
```
msgbox Route104_Text_BrendanLetsBattle, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route104_EventScript_BattleBrendan
msgbox Route104_Text_BrendanNoConfidence, MSGBOX_DEFAULT
releaseall
end
```
### Route104_EventScript_BattleBrendan
```
msgbox Route104_Text_BrendanIntro, MSGBOX_DEFAULT
switch VAR_STARTER_MON
case 0, Route104_EventScript_BattleBrendanTreecko
case 1, Route104_EventScript_BattleBrendanTorchic
case 2, Route104_EventScript_BattleBrendanMudkip
end
```
### Route104_EventScript_BrendanDefeated
```
msgbox Route104_Text_BrendanPostBattle, MSGBOX_DEFAULT
call_if_eq VAR_0x8008, 0, Route104_EventScript_RestoreMusic
releaseall
end
```
### Route104_EventScript_BattleBrendanTreecko
```
trainerbattle_no_intro TRAINER_BRENDAN_RUSTBORO_TREECKO, Route104_Text_BrendanDefeat
setflag FLAG_DEFEATED_RIVAL_ROUTE_104
goto Route104_EventScript_BrendanDefeated
end
```
### Route104_EventScript_BattleBrendanTorchic
```
trainerbattle_no_intro TRAINER_BRENDAN_RUSTBORO_TORCHIC, Route104_Text_BrendanDefeat
setflag FLAG_DEFEATED_RIVAL_ROUTE_104
goto Route104_EventScript_BrendanDefeated
end
```
### Route104_EventScript_BattleBrendanMudkip
```
trainerbattle_no_intro TRAINER_BRENDAN_RUSTBORO_MUDKIP, Route104_Text_BrendanDefeat
setflag FLAG_DEFEATED_RIVAL_ROUTE_104
goto Route104_EventScript_BrendanDefeated
end
```
### Route104_Movement_PlayerBackUp
```
lock_facing_direction
walk_down
unlock_facing_direction
step_end
```
### Route104_Movement_RivalExitBrineysCottage
```
walk_down
step_end
```
### Route104_EventScript_ExpertF
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_CHESTO_BERRY_ROUTE_104, Route104_EventScript_ReceivedBerry
msgbox Route104_Text_PlantBerriesInSoilTakeThis, MSGBOX_DEFAULT
giveitem ITEM_CHESTO_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_CHESTO_BERRY_ROUTE_104
msgbox Route104_Text_TrainersOftenMakeMonHoldBerries, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_ReceivedBerry
```
msgbox Route104_Text_TrainersOftenMakeMonHoldBerries, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_WhiteHerbFlorist
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_WHITE_HERB, Route104_EventScript_ReceivedWhiteHerb
msgbox Route104_Text_DontNeedThisTakeIt, MSGBOX_DEFAULT
giveitem ITEM_WHITE_HERB
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_WHITE_HERB
release
end
```
### Route104_EventScript_ReceivedWhiteHerb
```
msgbox Route104_Text_FlowerShopSellingSaplings, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_Girl1
```
msgbox Route104_Text_BrineyLivesInSeasideCottage, MSGBOX_NPC
end
```
### Route104_EventScript_BugCatcher
```
msgbox Route104_Text_WhatsItLikeAtBottomOfSea, MSGBOX_SIGN
end
```
### Route104_EventScript_BrineysCottageSign
```
msgbox Route104_Text_MrBrineysCottage, MSGBOX_SIGN
end
```
### Route104_EventScript_RouteSignPetalburg
```
msgbox Route104_Text_RouteSignPetalburg, MSGBOX_SIGN
end
```
### Route104_EventScript_RouteSignRustboro
```
msgbox Route104_Text_RouteSignRustboro, MSGBOX_SIGN
end
```
### Route104_EventScript_FlowerShopSign
```
msgbox Route104_Text_PrettyPetalFlowShop, MSGBOX_SIGN
end
```
### Route104_EventScript_TrainerTipsDoubleBattles
```
msgbox Route104_Text_TrainerTipsDoubleBattles, MSGBOX_SIGN
end
```
### Route104_EventScript_Boy1
```
msgbox Route104_Text_ThrowBallAtWeakenedPokemon, MSGBOX_NPC
end
```
### Route104_EventScript_Woman
```
msgbox Route104_Text_OnlyThrowBallAtWildPokemon, MSGBOX_NPC
end
```
### Route104_EventScript_Boy2
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_BULLET_SEED, Route104_EventScript_ReceivedBulletSeed
msgbox Route104_Text_LikeFillingMouthWithSeedsTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_BULLET_SEED
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_BULLET_SEED
release
end
```
### Route104_EventScript_ReceivedBulletSeed
```
msgbox Route104_Text_TMsAreOneTimeUse, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_Girl2
```
msgbox Route104_Text_ImNotATrainer, MSGBOX_NPC
end
```
### Route104_EventScript_SailToDewford
```
setobjectsubpriority LOCALID_ROUTE104_BRINEY, MAP_ROUTE104, 0
setobjectsubpriority LOCALID_PLAYER, MAP_ROUTE104, 0
applymovement LOCALID_ROUTE104_BRINEY, Route104_Movement_BrineyBoardBoat
waitmovement 0
removeobject LOCALID_ROUTE104_BRINEY
applymovement LOCALID_PLAYER, Route104_Movement_PlayerBoardBoat
waitmovement 0
hideobjectat LOCALID_PLAYER, MAP_ROUTE104
call Common_EventScript_PlayBrineysBoatMusic
goto_if_set FLAG_ENABLE_NORMAN_MATCH_CALL, Route104_EventScript_SailToDewfordNoCall
goto_if_unset FLAG_ENABLE_NORMAN_MATCH_CALL, Route104_EventScript_SailToDewfordDadCalls
end
```
### Route104_EventScript_SailToDewfordNoCall
```
applymovement LOCALID_ROUTE104_BOAT, Route104_Movement_SailToDewford
applymovement LOCALID_PLAYER, Route104_Movement_SailToDewford
waitmovement 0
goto Route104_EventScript_ArriveInDewford
```
### Route104_EventScript_SailToDewfordDadCalls
```
applymovement LOCALID_ROUTE104_BOAT, Route104_Movement_SailToDewfordBeforeDadCalls
applymovement LOCALID_PLAYER, Route104_Movement_SailToDewfordBeforeDadCalls
waitmovement 0
pokenavcall Route104_Text_DadPokenavCall
waitmessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox Route104_Text_RegisteredDadInPokenav, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_NORMAN_MATCH_CALL
applymovement LOCALID_PLAYER, Route104_Movement_SailToDewfordAfterDadCalls
applymovement LOCALID_ROUTE104_BOAT, Route104_Movement_SailToDewfordAfterDadCalls, MAP_ROUTE104
waitmovement LOCALID_ROUTE104_BOAT, MAP_ROUTE104
waitmovement 0
goto Route104_EventScript_ArriveInDewford
```
### Route104_EventScript_ArriveInDewford
```
delay 50
applymovement LOCALID_PLAYER, Route104_Movement_PlayerExitBoat
waitmovement 0
call Common_EventScript_StopBrineysBoatMusic
showobjectat LOCALID_PLAYER, MAP_DEWFORD_TOWN
applymovement LOCALID_PLAYER, Route104_Movement_PlayerMoveForBriney
waitmovement 0
setobjectxyperm LOCALID_DEWFORD_BRINEY, 12, 8
addobject LOCALID_DEWFORD_BRINEY
setobjectsubpriority LOCALID_DEWFORD_BRINEY, MAP_DEWFORD_TOWN, 0
clearflag FLAG_HIDE_MR_BRINEY_DEWFORD_TOWN
applymovement LOCALID_DEWFORD_BRINEY, Route104_Movement_BrineyExitBoat
waitmovement 0
addobject LOCALID_DEWFORD_BOAT
clearflag FLAG_HIDE_MR_BRINEY_BOAT_DEWFORD_TOWN
call Common_EventScript_StopBrineysBoatMusic
setflag FLAG_HIDE_ROUTE_104_MR_BRINEY_BOAT
hideobjectat LOCALID_ROUTE104_BOAT, MAP_ROUTE104
copyvar VAR_BRINEY_LOCATION, VAR_0x8008
resetobjectsubpriority LOCALID_PLAYER, MAP_ROUTE104
resetobjectsubpriority LOCALID_DEWFORD_BRINEY, MAP_DEWFORD_TOWN
copyobjectxytoperm LOCALID_DEWFORD_BRINEY
setvar VAR_BOARD_BRINEY_BOAT_STATE, 0
goto_if_unset FLAG_DELIVERED_STEVEN_LETTER, Route104_EventScript_DeliverLetterReminder
goto_if_set FLAG_DELIVERED_STEVEN_LETTER, Route104_EventScript_LandedInDewford
end
```
### Route104_EventScript_DeliverLetterReminder
```
msgbox Route104_Text_LandedInDewfordDeliverLetter, MSGBOX_DEFAULT
releaseall
end
```
### Route104_EventScript_LandedInDewford
```
msgbox DewfordTown_Text_BrineyLandedInDewford, MSGBOX_DEFAULT
releaseall
end
```
### Route104_Movement_SailToDewfordBeforeDadCalls
```
walk_down
walk_down
walk_down
walk_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_right
walk_fast_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
step_end
```
### Route104_Movement_SailToDewfordAfterDadCalls
```
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_right
walk_right
walk_down
walk_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_down
walk_down
step_end
```
### Route104_Movement_SailToDewford
```
walk_down
walk_down
walk_down
walk_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_right
walk_fast_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_fast_right
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_faster_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_faster_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_right
walk_right
walk_down
walk_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_down
walk_down
step_end
```
### Route104_Movement_PlayerBoardBoat
```
walk_left
walk_down
walk_down
step_end
```
### Route104_Movement_PlayerExitBoat
```
walk_down
step_end
```
### Route104_Movement_PlayerMoveForBriney
```
walk_down
walk_left
walk_in_place_faster_right
step_end
```
### Route104_Movement_BrineyBoardBoat
```
walk_down
walk_down
step_end
```
### Route104_Movement_BrineyExitBoat
```
walk_down
walk_in_place_faster_left
step_end
```
### Route104_EventScript_Ivan
```
trainerbattle_single TRAINER_IVAN, Route104_Text_IvanIntro, Route104_Text_IvanDefeat
msgbox Route104_Text_IvanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route104_EventScript_Billy
```
trainerbattle_single TRAINER_BILLY, Route104_Text_BillyIntro, Route104_Text_BillyDefeat
msgbox Route104_Text_BillyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route104_EventScript_Haley
```
trainerbattle_single TRAINER_HALEY_1, Route104_Text_HaleyIntro, Route104_Text_HaleyDefeat, Route104_EventScript_TryRegisterHaleyAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route104_EventScript_RematchHaley
setvar VAR_0x8004, TRAINER_HALEY_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, Route104_EventScript_TryRegisterHaley
msgbox Route104_Text_HaleyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_TryRegisterHaleyAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
goto_if_set FLAG_HAS_MATCH_CALL, Route104_EventScript_RegisterHaleyAfterBattle
release
end
```
### Route104_EventScript_RegisterHaleyAfterBattle
```
msgbox Route104_Text_HaleyRegister2, MSGBOX_DEFAULT
register_matchcall TRAINER_HALEY_1
release
end
```
### Route104_EventScript_TryRegisterHaley
```
goto_if_set FLAG_HAS_MATCH_CALL, Route104_EventScript_RegisterHaley
msgbox Route104_Text_HaleyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_RegisterHaley
```
msgbox Route104_Text_HaleyRegister1, MSGBOX_DEFAULT
register_matchcall TRAINER_HALEY_1
release
end
```
### Route104_EventScript_RematchHaley
```
trainerbattle_rematch TRAINER_HALEY_1, Route104_Text_HaleyRematchIntro, Route104_Text_HaleyRematchDefeat
msgbox Route104_Text_HaleyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route104_EventScript_Winston
```
trainerbattle_single TRAINER_WINSTON_1, Route104_Text_WinstonIntro, Route104_Text_WinstonDefeat, Route104_EventScript_TryRegisterWinstonAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route104_EventScript_RematchWinston
setvar VAR_0x8004, TRAINER_WINSTON_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, Route104_EventScript_TryRegisterWinston
msgbox Route104_Text_WinstonPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_TryRegisterWinstonAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
goto_if_set FLAG_HAS_MATCH_CALL, Route104_EventScript_RegisterWinstonAfterBattle
release
end
```
### Route104_EventScript_RegisterWinstonAfterBattle
```
msgbox Route104_Text_WinstonRegister2, MSGBOX_DEFAULT
register_matchcall TRAINER_WINSTON_1
release
end
```
### Route104_EventScript_TryRegisterWinston
```
goto_if_set FLAG_HAS_MATCH_CALL, Route104_EventScript_RegisterWinston
msgbox Route104_Text_WinstonPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_RegisterWinston
```
msgbox Route104_Text_WinstonRegister1, MSGBOX_DEFAULT
register_matchcall TRAINER_WINSTON_1
release
end
```
### Route104_EventScript_RematchWinston
```
trainerbattle_rematch TRAINER_WINSTON_1, Route104_Text_WinstonRematchIntro, Route104_Text_WinstonRematchDefeat
msgbox Route104_Text_WinstonPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route104_EventScript_Cindy
```
trainerbattle_single TRAINER_CINDY_1, Route104_Text_CindyIntro, Route104_Text_CindyDefeat, Route104_EventScript_TryRegisterCindyAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route104_EventScript_RematchCindy
setvar VAR_0x8004, TRAINER_CINDY_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, Route104_EventScript_TryRegisterCindy
msgbox Route104_Text_CindyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_TryRegisterCindyAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
goto_if_set FLAG_HAS_MATCH_CALL, Route104_EventScript_RegisterCindyAfterBattle
release
end
```
### Route104_EventScript_RegisterCindyAfterBattle
```
msgbox Route104_Text_CindyRegister2, MSGBOX_DEFAULT
register_matchcall TRAINER_CINDY_1
release
end
```
### Route104_EventScript_TryRegisterCindy
```
goto_if_set FLAG_HAS_MATCH_CALL, Route104_EventScript_RegisterCindy
msgbox Route104_Text_CindyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_RegisterCindy
```
msgbox Route104_Text_CindyRegister1, MSGBOX_DEFAULT
register_matchcall TRAINER_CINDY_1
release
end
```
### Route104_EventScript_RematchCindy
```
trainerbattle_rematch TRAINER_CINDY_1, Route104_Text_CindyRematchIntro, Route104_Text_CindyRematchDefeat
msgbox Route104_Text_CindyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route104_EventScript_Gina
```
trainerbattle_double TRAINER_GINA_AND_MIA_1, Route104_Text_GinaIntro, Route104_Text_GinaDefeat, Route104_Text_GinaNotEnoughMons
special GetPlayerBigGuyGirlString
msgbox Route104_Text_GinaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_Mia
```
trainerbattle_double TRAINER_GINA_AND_MIA_1, Route104_Text_MiaIntro, Route104_Text_MiaDefeat, Route104_Text_MiaNotEnoughMons
special GetPlayerBigGuyGirlString
msgbox Route104_Text_MiaPostBattle, MSGBOX_DEFAULT
release
end
```
### Route104_EventScript_Darian
```
trainerbattle_single TRAINER_DARIAN, Route104_Text_DarianIntro, Route104_Text_DarianDefeat
msgbox Route104_Text_DarianPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (32)
### Route104_Text_BrineyLivesInSeasideCottage
```
Cette maison au bord de l'eau,\nc'est là qu'habite M. MARCO.\pAutrefois, c'était un grand marin. Il ne\ncraignait pas la mer, même déchaînée.$
```
### Route104_Text_WhatsItLikeAtBottomOfSea
```
La mer, hum?\pJe me demande comment c'est au fond\nde la mer.$
```
### Route104_Text_ThrowBallAtWeakenedPokemon
```
Si tu veux jeter une POKé BALL,\naffaiblis d'abord le POKéMON sauvage.\pCe sera plus facile de l'attraper\ns'il est empoisonné, brûlé ou endormi.$
```
### Route104_Text_OnlyThrowBallAtWildPokemon
```
Si tu essaies de prendre le POKéMON de\nquelqu'un d'autre, c'est du vol.\pTu ne devrais lancer des POKé BALLS\nqu'aux POKéMON sauvages.$
```
### Route104_Text_ImNotATrainer
```
Oh, non, je ne suis pas DRESSEUR.\pMais s'il y a échange de regards entre\nDRESSEURS, c'est le combat assuré!\pSi tu ne veux pas te battre, reste\nhors de leur vue!$
```
### Route104_Text_LikeFillingMouthWithSeedsTakeThis
```
J'aime bien remplir ma bouche de graines\net les recracher très vite ensuite!\pTiens, prends ça. Comme ça, tu pourras\nessayer!\pEssaie avec un POKéMON. Il apprendra\nun coup pour vite lancer des graines.$
```
### Route104_Text_TMsAreOneTimeUse
```
Un petit conseil!\pUne CT, ou CAPSULE TECHNIQUE, ne\npeut servir qu'une seule fois.\pUne fois utilisée, elle disparaît.\nRéfléchis bien avant de l'utiliser!$
```
### Route104_Text_DontNeedThisTakeIt
```
Ce FLEURISTE vend de petits\narbres depuis peu.\pÇa m'a fait si plaisir que j'ai fait un\ntas d'achats.\pJe n'ai plus besoin de cette\nHERBEBLANCHE. Tu veux la prendre?$
```
### Route104_Text_FlowerShopSellingSaplings
```
Ce FLEURISTE vend de petits\narbres depuis peu.\pÇa m'a fait si plaisir que j'ai fait un\ntas d'achats. Où vais-je pouvoir\lmettre tout ça?$
```
### Route104_Text_MrBrineysCottage
```
COTTAGE DE M. MARCO$
```
### Route104_Text_RouteSignPetalburg
```
ROUTE 104\n{RIGHT_ARROW} CLEMENTI-VILLE$
```
### Route104_Text_RouteSignRustboro
```
ROUTE 104\n{UP_ARROW} MEROUVILLE$
```
### Route104_Text_PrettyPetalFlowShop
```
FLEURISTE JOLIE FLEUR$
```
### Route104_Text_TrainerTipsDoubleBattles
```
CONSEILS AUX DRESSEURS\pA HOENN, certains DRESSEURS forment\ndes paires et défient les autres\ldans des combats de POKéMON\l2 contre 2 appelés COMBATS DUO.\pDans un COMBAT DUO, le DRESSEUR doit\nenvoyer deux POKéMON, celui de gauche\ldans la liste et celui tout en haut.\lVérifie la disposition de tes POKéMON!$
```
### Route104_Text_MayWeShouldRegister
```
FLORA: Oh, salut {PLAYER}{KUN}!\pDEVON a mis à jour ton POKéNAV\navec la fonction MATCH PHONE, hein?\pOn devrait s'enregistrer pour rester\nen contact.$
```
### Route104_Text_RegisteredMay
```
{PLAYER} a enregistré FLORA dans le\nPOKéNAV.$
```
### Route104_Text_MayHowsYourPokedex
```
FLORA: Au fait, {PLAYER}{KUN}!\nComment ça avance ton POKéDEX?$
```
### Route104_Text_MayMinesDecentLetsBattle
```
Le mien est plutôt pas mal.\nAlors…\lQue dirais-tu d'un petit combat?$
```
### Route104_Text_MayHaventRaisedPokemon
```
FLORA: Quoi? Tu n'avais pas dressé\ntes POKéMON?\pCe n'est pas une très bonne\nperformance pour un DRESSEUR…$
```
### Route104_Text_MayLetsBattle
```
FLORA: Alors…\nQue dirais-tu d'un petit combat?$
```
### Route104_Text_MayIntro
```
FLORA: Tu es un tout jeune DRESSEUR,\n{PLAYER}{KUN}, je ne peux pas perdre!$
```
### Route104_Text_MayDefeat
```
Mince! Tu as un meilleur niveau que je\nne le pensais!$
```
### Route104_Text_MayPostBattle
```
FLORA: Je peux dire que tu te\ndébrouilles vraiment très bien\lavec tes POKéMON.\pMais plutôt que de les faire seulement\nse battre, tu devrais essayer de faire\lcomme M. MARCO.\pC'est aussi important de bien\ns'entendre avec ses POKéMON.$
```
### Route104_Text_BrendanWeShouldRegister
```
BRICE: Oh, {PLAYER}!\pCool, DEVON t'a installé le MATCH PHONE\nsur ton POKéNAV!\pEnregistrons nos numéros pour rester\nen contact.$
```
### Route104_Text_RegisteredBrendan
```
{PLAYER} a enregistré BRICE dans\nle POKéNAV.$
```
### Route104_Text_BrendanHowsYourPokedex
```
BRICE: {PLAYER}, ça avance ton\nPOKéDEX? T'as rempli toutes les pages?$
```
### Route104_Text_BrendanDoingGreatLetsBattle
```
Moi, ça avance pas mal!\pTu veux voir comme je me débrouille\nbien dans un combat?$
```
### Route104_Text_BrendanNoConfidence
```
BRICE: Quel est le problème? Tu n'as\npas confiance en tes POKéMON?$
```
### Route104_Text_BrendanLetsBattle
```
BRICE: Ça roule?\nTu veux te battre contre moi?$
```
### Route104_Text_BrendanIntro
```
BRICE: Je sais que ça ne fait pas\nlongtemps que tu es DRESSEUR,\pmais j'vais me battre sans retenir\nmes coups!$
```
### Route104_Text_BrendanDefeat
```
Hum…\nT'as sacrément bien progressé.$
```
### Route104_Text_BrendanPostBattle
```
BRICE: Tu utilises tes POKéMON\nplutôt pas mal.\pMais tu sais, il n'y a pas que les\ncombats dans la vie.\pComme le dirait M. MARCO, il est\nimportant d'être ami avec ses POKéMON.$
```

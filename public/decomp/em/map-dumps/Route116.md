# Route116

## Métadonnées
- **id** : `MAP_ROUTE116`
- **layout** : `LAYOUT_ROUTE116`
- **music** : `MUS_ROUTE104`
- **region_map_section** : `MAPSEC_ROUTE_116`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 80) → `MAP_VERDANTURF_TOWN`
- left (offset 0) → `MAP_RUSTBORO_CITY`

## Object events (28 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 18,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 19,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 12,7 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route116_EventScript_Joey` | `0` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 21,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 32,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 13,17 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route116_EventScript_Jose` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 19,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_ItemEther` | `FLAG_ITEM_ROUTE_116_ETHER` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 10,17 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_ItemRepel` | `FLAG_ITEM_ROUTE_116_REPEL` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 20,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 21,2 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `LOCALID_ROUTE116_BRINEY` | `OBJ_EVENT_GFX_EXPERT_M` | 46,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_Briney` | `FLAG_HIDE_ROUTE_116_MR_BRINEY` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 28,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_HIKER` | 36,17 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `Route116_EventScript_Clark` | `0` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 24,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 80,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_ItemHPUp` | `FLAG_ITEM_ROUTE_116_HP_UP` |
| `` | `OBJ_EVENT_GFX_LASS` | 26,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route116_EventScript_Janice` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 22,16 | `MOVEMENT_TYPE_FACE_DOWN_AND_UP` | `Route116_EventScript_Karen` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 28,8 | `MOVEMENT_TYPE_FACE_UP` | `Route116_EventScript_Jerry` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_2` | 46,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_DevonEmployee` | `FLAG_HIDE_ROUTE_116_DEVON_EMPLOYEE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 55,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_ItemXSpecial` | `FLAG_ITEM_ROUTE_116_X_SPECIAL` |
| `LOCALID_ROUTE116_WANDAS_BF` | `OBJ_EVENT_GFX_BLACK_BELT` | 38,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route116_EventScript_WandasBoyfriend` | `FLAG_HIDE_ROUTE_116_WANDAS_BOYFRIEND` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 74,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_GlassesMan` | `FLAG_HIDE_ROUTE_116_DROPPED_GLASSES_MAN` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 33,8 | `MOVEMENT_TYPE_FACE_UP` | `Route116_EventScript_Sarah` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 33,5 | `MOVEMENT_TYPE_FACE_DOWN` | `Route116_EventScript_Dawson` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 34,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route116_EventScript_ItemPotion` | `FLAG_ITEM_ROUTE_116_POTION` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 30,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 36,13 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route116_EventScript_Johnson` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 42,13 | `MOVEMENT_TYPE_FACE_LEFT` | `Route116_EventScript_Devan` | `0` |

## Warps (5)
- #0 (47,8) → `MAP_RUSTURF_TUNNEL` warp #0
- #1 (38,8) → `MAP_ROUTE116_TUNNELERS_REST_HOUSE` warp #0
- #2 (65,10) → `MAP_RUSTURF_TUNNEL` warp #2
- #3 (59,13) → `MAP_TERRA_CAVE_ENTRANCE` warp #0
- #4 (79,6) → `MAP_TERRA_CAVE_ENTRANCE` warp #0

## Coord events / triggers (1)
- (47,9) → `Route116_EventScript_BrineyTrigger` (si `VAR_ROUTE116_STATE` == `1`)

## BG events / signs (11)
- (5,10) [sign] → `Route116_EventScript_RouteSignRustboro`
- (48,9) [sign] → `Route116_EventScript_RusturfTunnelSign`
- (40,9) [sign] → `Route116_EventScript_TunnelersRestHouseSign`
- (71,4) [secret_base] → ``
- (79,11) [secret_base] → ``
- (16,12) [sign] → `Route116_EventScript_TrainerTipsBToStopEvolution`
- (29,10) [sign] → `Route116_EventScript_TrainerTipsBagHasPockets`
- (56,6) [secret_base] → ``
- (55,15) [secret_base] → ``
- (22,9) [hidden_item] → ``
- (70,13) [hidden_item] → ``

## Flags référencés (6)
- `FLAG_DEVON_GOODS_STOLEN`
- `FLAG_HAS_MATCH_CALL`
- `FLAG_HIDE_RUSTBORO_CITY_DEVON_CORP_3F_EMPLOYEE`
- `FLAG_MET_DEVON_EMPLOYEE`
- `FLAG_RECEIVED_REPEAT_BALL`
- `FLAG_RECOVERED_DEVON_GOODS`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_ROUTE116_STATE`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route116_Text_ClarkPostBattle`
- `Route116_Text_DawsonPostBattle`
- `Route116_Text_DevanPostBattle`
- `Route116_Text_JanicePostBattle`
- `Route116_Text_JerryPostBattle`
- `Route116_Text_JerryPostRematch`
- `Route116_Text_JerryRegister1`
- `Route116_Text_JerryRegister2`
- `Route116_Text_JoeyPostBattle`
- `Route116_Text_JohnsonPostBattle`
- `Route116_Text_JosePostBattle`
- `Route116_Text_KarenPostBattle`
- `Route116_Text_KarenPostRematch`
- `Route116_Text_KarenRegister1`
- `Route116_Text_KarenRegister2`
- `Route116_Text_SarahPostBattle`

## Scripts (52)
### Route116_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route116_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route116_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route116_OnFrame
```
### Route116_OnTransition
```
call_if_set FLAG_RECOVERED_DEVON_GOODS, Route116_EventScript_SetWandasBoyfriendPos
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_116_NORTH, AbnormalWeather_StartGroudonWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_116_SOUTH, AbnormalWeather_StartGroudonWeather
end
```
### Route116_EventScript_SetWandasBoyfriendPos
```
setobjectxyperm LOCALID_ROUTE116_WANDAS_BF, 38, 10
return
```
### Route116_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_116_NORTH, AbnormalWeather_EventScript_PlaceTilesRoute116North
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_116_SOUTH, AbnormalWeather_EventScript_PlaceTilesRoute116South
end
```
### Route116_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route116_EventScript_WandasBoyfriend
```
lock
faceplayer
goto_if_set FLAG_RECOVERED_DEVON_GOODS, Route116_EventScript_BoyfriendGruntLeftTunnel
goto_if_set FLAG_DEVON_GOODS_STOLEN, Route116_EventScript_BoyfriendGruntInTunnel
msgbox Route116_Text_WantToDigTunnel, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_BoyfriendGruntLeftTunnel
```
msgbox Route116_Text_GoonHightailedItOutOfTunnel, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_BoyfriendGruntInTunnel
```
msgbox Route116_Text_DiggingTunnelWhenGoonOrderedMeOut, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_DevonEmployee
```
lock
faceplayer
goto_if_set FLAG_MET_DEVON_EMPLOYEE, Route116_EventScript_TryGiveRepeatBallAgain
msgbox Route116_Text_ThankYouTokenOfAppreciation, MSGBOX_DEFAULT
goto Route116_EventScript_GiveRepeatBall
end
```
### Route116_EventScript_GiveRepeatBall
```
setflag FLAG_MET_DEVON_EMPLOYEE
giveitem ITEM_REPEAT_BALL
goto_if_eq VAR_RESULT, FALSE, Route116_EventScript_NoRoomForRepeatBall
msgbox Route116_Text_NewBallAvailableAtMart, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_NORTH, Route116_EventScript_DevonEmployeeExit
call_if_eq VAR_FACING, DIR_SOUTH, Route116_EventScript_DevonEmployeeExit
call_if_eq VAR_FACING, DIR_WEST, Route116_EventScript_DevonEmployeeExit
call_if_eq VAR_FACING, DIR_EAST, Route116_EventScript_DevonEmployeeExitEast
removeobject VAR_LAST_TALKED
clearflag FLAG_HIDE_RUSTBORO_CITY_DEVON_CORP_3F_EMPLOYEE
setflag FLAG_RECEIVED_REPEAT_BALL
release
end
```
### Route116_EventScript_DevonEmployeeExit
```
applymovement VAR_LAST_TALKED, Route116_Movement_DevonEmployeeExit
waitmovement 0
return
```
### Route116_EventScript_DevonEmployeeExitEast
```
applymovement VAR_LAST_TALKED, Route116_Movement_DevonEmployeeExitEast
waitmovement 0
return
```
### Route116_EventScript_TryGiveRepeatBallAgain
```
msgbox Route116_Text_TokenOfAppreciation, MSGBOX_DEFAULT
goto Route116_EventScript_GiveRepeatBall
end
```
### Route116_EventScript_NoRoomForRepeatBall
```
msgbox Route116_Text_BagIsJamPacked, MSGBOX_DEFAULT
release
end
```
### Route116_Movement_DevonEmployeeExit
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### Route116_Movement_DevonEmployeeExitEast
```
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### Route116_EventScript_RouteSignRustboro
```
msgbox Route116_Text_RouteSignRustboro, MSGBOX_SIGN
end
```
### Route116_EventScript_RusturfTunnelSign
```
msgbox Route116_Text_RusturfTunnelSign, MSGBOX_SIGN
end
```
### Route116_EventScript_TunnelersRestHouseSign
```
msgbox Route116_Text_TunnelersRestHouse, MSGBOX_SIGN
end
```
### Route116_EventScript_TrainerTipsBToStopEvolution
```
msgbox Route116_Text_TrainerTipsBToStopEvolution, MSGBOX_SIGN
end
```
### Route116_EventScript_TrainerTipsBagHasPockets
```
msgbox Route116_Text_TrainerTipsBagHasPockets, MSGBOX_SIGN
end
```
### Route116_EventScript_Briney
```
lock
faceplayer
msgbox Route116_Text_ScoundrelMadeOffWithPeeko, MSGBOX_DEFAULT
setvar VAR_ROUTE116_STATE, 2
release
end
```
### Route116_EventScript_BrineyTrigger
```
lockall
applymovement LOCALID_ROUTE116_BRINEY, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox Route116_Text_ScoundrelMadeOffWithPeeko, MSGBOX_DEFAULT
setvar VAR_ROUTE116_STATE, 2
releaseall
end
```
### Route116_EventScript_GlassesMan
```
lock
faceplayer
checkitem ITEM_BLACK_GLASSES
goto_if_eq VAR_RESULT, TRUE, Route116_EventScript_PlayerHasGlasses
specialvar VAR_RESULT, FoundBlackGlasses
goto_if_eq VAR_RESULT, TRUE, Route116_EventScript_FoundGlassesNotOnPlayer
msgbox Route116_Text_CanYouHelpMeFindGlasses, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_FoundGlassesNotOnPlayer
```
msgbox Route116_Text_CantFindGlassesNotHere, MSGBOX_DEFAULT
closemessage
goto Route116_EventScript_GlassesManExit
end
```
### Route116_EventScript_PlayerHasGlasses
```
msgbox Route116_Text_CanYouHelpMeFindGlasses, MSGBOX_DEFAULT
msgbox Route116_Text_MayISeeThoseGlasses, MSGBOX_DEFAULT
specialvar VAR_RESULT, FoundBlackGlasses
goto_if_eq VAR_RESULT, TRUE, Route116_EventScript_FoundGlassesOnPlayer
msgbox Route116_Text_NotWhatImLookingFor, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_FoundGlassesOnPlayer
```
msgbox Route116_Text_NotWhatImLookingForMaybeTheyArentHere, MSGBOX_DEFAULT
closemessage
goto Route116_EventScript_GlassesManExit
end
```
### Route116_EventScript_GlassesManExit
```
delay 20
call_if_eq VAR_FACING, DIR_NORTH, Route116_EventScript_GlassesManExitNormal
call_if_eq VAR_FACING, DIR_SOUTH, Route116_EventScript_GlassesManExitNormal
call_if_eq VAR_FACING, DIR_WEST, Route116_EventScript_GlassesManExitNormal
call_if_eq VAR_FACING, DIR_EAST, Route116_EventScript_GlassesManExitEast
removeobject VAR_LAST_TALKED
release
end
```
### Route116_EventScript_GlassesManExitNormal
```
applymovement VAR_LAST_TALKED, Route116_Movement_GlassesManExit
waitmovement 0
return
```
### Route116_EventScript_GlassesManExitEast
```
applymovement VAR_LAST_TALKED, Route116_Movement_GlassesManExitEast
waitmovement 0
return
```
### Route116_Movement_GlassesManExit
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### Route116_Movement_GlassesManExitEast
```
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### Route116_EventScript_Joey
```
trainerbattle_single TRAINER_JOEY, Route116_Text_JoeyIntro, Route116_Text_JoeyDefeat
msgbox Route116_Text_JoeyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Jose
```
trainerbattle_single TRAINER_JOSE, Route116_Text_JoseIntro, Route116_Text_JoseDefeat
msgbox Route116_Text_JosePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Jerry
```
trainerbattle_single TRAINER_JERRY_1, Route116_Text_JerryIntro, Route116_Text_JerryDefeat, Route116_EventScript_TryRegisterJerryAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route116_EventScript_RematchJerry
setvar VAR_0x8004, TRAINER_JERRY_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, Route116_EventScript_TryRegisterJerry
msgbox Route116_Text_JerryPostBattle, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_TryRegisterJerryAfterBattle
```
goto_if_set FLAG_HAS_MATCH_CALL, Route116_EventScript_RegisterJerryAfterBattle
release
end
```
### Route116_EventScript_RegisterJerryAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route116_Text_JerryRegister2, MSGBOX_DEFAULT
register_matchcall TRAINER_JERRY_1
release
end
```
### Route116_EventScript_TryRegisterJerry
```
goto_if_set FLAG_HAS_MATCH_CALL, Route116_EventScript_RegisterJerry
msgbox Route116_Text_JerryPostBattle, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_RegisterJerry
```
msgbox Route116_Text_JerryRegister1, MSGBOX_DEFAULT
register_matchcall TRAINER_JERRY_1
release
end
```
### Route116_EventScript_RematchJerry
```
trainerbattle_rematch TRAINER_JERRY_1, Route116_Text_JerryRematchIntro, Route116_Text_JerryRematchDefeat
msgbox Route116_Text_JerryPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Clark
```
trainerbattle_single TRAINER_CLARK, Route116_Text_ClarkIntro, Route116_Text_ClarkDefeat
msgbox Route116_Text_ClarkPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Janice
```
trainerbattle_single TRAINER_JANICE, Route116_Text_JaniceIntro, Route116_Text_JaniceDefeat
msgbox Route116_Text_JanicePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Karen
```
trainerbattle_single TRAINER_KAREN_1, Route116_Text_KarenIntro, Route116_Text_KarenDefeat, Route116_EventScript_TryRegisterKarenAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route116_EventScript_RematchKaren
setvar VAR_0x8004, TRAINER_KAREN_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, Route116_EventScript_TryRegisterKaren
msgbox Route116_Text_KarenPostBattle, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_TryRegisterKarenAfterBattle
```
goto_if_set FLAG_HAS_MATCH_CALL, Route116_EventScript_RegisterKarenAfterBattle
release
end
```
### Route116_EventScript_RegisterKarenAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route116_Text_KarenRegister2, MSGBOX_DEFAULT
register_matchcall TRAINER_KAREN_1
release
end
```
### Route116_EventScript_TryRegisterKaren
```
goto_if_set FLAG_HAS_MATCH_CALL, Route116_EventScript_RegisterKaren
msgbox Route116_Text_KarenPostBattle, MSGBOX_DEFAULT
release
end
```
### Route116_EventScript_RegisterKaren
```
msgbox Route116_Text_KarenRegister1, MSGBOX_DEFAULT
register_matchcall TRAINER_KAREN_1
release
end
```
### Route116_EventScript_RematchKaren
```
trainerbattle_rematch TRAINER_KAREN_1, Route116_Text_KarenRematchIntro, Route116_Text_KarenRematchDefeat
msgbox Route116_Text_KarenPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Sarah
```
trainerbattle_single TRAINER_SARAH, Route116_Text_SarahIntro, Route116_Text_SarahDefeat
msgbox Route116_Text_SarahPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Dawson
```
trainerbattle_single TRAINER_DAWSON, Route116_Text_DawsonIntro, Route116_Text_DawsonDefeat
msgbox Route116_Text_DawsonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Devan
```
trainerbattle_single TRAINER_DEVAN, Route116_Text_DevanIntro, Route116_Text_DevanDefeat
msgbox Route116_Text_DevanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route116_EventScript_Johnson
```
trainerbattle_single TRAINER_JOHNSON, Route116_Text_JohnsonIntro, Route116_Text_JohnsonDefeat
msgbox Route116_Text_JohnsonPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (18)
### Route116_Text_ScoundrelMadeOffWithPeeko
```
Ohhh, que vais-je faire?\pOn se baladait, PIKO et moi, quand\nune grosse brute nous a sauté dessus…\pCe vaurien a filé avec mon cher\nPIKO!\pOooooooooooh! PIKO!$
```
### Route116_Text_WantToDigTunnel
```
Arrg… Haaaa…\pJe veux creuser ce tunnel!$
```
### Route116_Text_DiggingTunnelWhenGoonOrderedMeOut
```
Arrg…\nQue se passe-t-il?\pJe creusais le tunnel sans aucun outil\nquand cet imbécile m'a chassé!\pCe tunnel regorge de POKéMON qui\nréagissent mal aux bruits forts.\lIls pourraient créer un brouhaha.\pC'est pour cela que nous avons arrêté\nd'utiliser de gros engins pour creuser…\pJ'ai peur que cet imbécile n'agisse\nstupidement et effraie les POKéMON\lqui créeraient un brouhaha.$
```
### Route116_Text_GoonHightailedItOutOfTunnel
```
Arrg… Haaaa…\pCette espèce d'imbécile a vite filé du\ntunnel! Je peux me remettre à creuser!$
```
### Route116_Text_ThankYouTokenOfAppreciation
```
Oh! C'est toi!\pTu es la personne qui non seulement m'a\naidé au BOIS CLEMENTI, mais qui m'a\laussi rapporté mon paquet volé et qui\ll'a gentiment livré à POIVRESSEL!\pLe CAPT. POUPE nous a également\ninformés de l'arrivée du paquet!\pJe te remercie sincèrement!\pSi j'étais un nuage, je t'inonderais de\ngratitude et t'enverrais une pluie de\lremerciements!\pPour toi, le plus merveilleux des\nDRESSEURS, j'ai une bonne nouvelle!\pNotre entreprise a récemment conçu\nune nouvelle sorte de POKé BALL.\pComme preuve de notre reconnaissance,\nvoici pour notre DRESSEUR d'exception!$
```
### Route116_Text_NewBallAvailableAtMart
```
Notre nouvelle POKé BALL sera en vente\nà la BOUTIQUE POKéMON de MEROUVILLE.\pIl faut l'essayer!\nMerci. Au revoir!$
```
### Route116_Text_BagIsJamPacked
```
Le SAC est plein à craquer. Il est\nimpossible d'y mettre cette BIS BALL!$
```
### Route116_Text_TokenOfAppreciation
```
En gage de notre reconnaissance pour\navoir livré notre paquet, j'ai un cadeau\lpour notre DRESSEUR d'exception: une\lnouvelle sorte de POKé BALL!$
```
### Route116_Text_CanYouHelpMeFindGlasses
```
J'ai fait tomber mes lunettes…\nTu peux m'aider à les retrouver?$
```
### Route116_Text_MayISeeThoseGlasses
```
Ces lunettes-là?\nJe peux les voir une seconde?$
```
### Route116_Text_NotWhatImLookingForMaybeTheyArentHere
```
Hum…\nCe sont des LUNET.NOIRES.\lCe ne sont pas celles que je cherche…\pPeut-être mes lunettes ne sont-elles\npas par ici…$
```
### Route116_Text_CantFindGlassesNotHere
```
Hum…\nJe n'ai trouvé mes lunettes nulle part…\lPeut-être ne sont-elles pas par ici…$
```
### Route116_Text_NotWhatImLookingFor
```
Hum…\nCe sont des LUNET.NOIRES.\lCe ne sont pas celles que je cherche…$
```
### Route116_Text_RouteSignRustboro
```
ROUTE 116\n{LEFT_ARROW} MEROUVILLE$
```
### Route116_Text_RusturfTunnelSign
```
TUNNEL MERAZON\n“Passage entre MEROUVILLE\let VERGAZON.\pLe projet de création du tunnel\na été annulé.”$
```
### Route116_Text_TunnelersRestHouse
```
REFUGE DES FOREURS$
```
### Route116_Text_TrainerTipsBToStopEvolution
```
CONSEILS AUX DRESSEURS\pSi vous voulez empêcher un POKéMON\nd'évoluer, appuyez sur le bouton B au\lmoment où il commence à évoluer. Le\lPOKéMON, effrayé, arrêtera d'évoluer.\pC'est une cessation d'évolution.$
```
### Route116_Text_TrainerTipsBagHasPockets
```
CONSEILS AUX DRESSEURS\pVotre SAC a plusieurs POCHES.\pLes objets obtenus sont directement\nplacés dans la POCHE appropriée.\pAucun DRESSEUR ne peut se permettre\nde voyager sans avoir son propre SAC.$
```

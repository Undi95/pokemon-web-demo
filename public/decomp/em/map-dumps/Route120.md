# Route120

## Métadonnées
- **id** : `MAP_ROUTE120`
- **layout** : `LAYOUT_ROUTE120`
- **music** : `MUS_ROUTE120`
- **region_map_section** : `MAPSEC_ROUTE_120`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_FORTREE_CITY`
- right (offset 80) → `MAP_ROUTE121`

## Object events (44 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 4,79 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 5,79 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 6,79 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 7,79 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 34,24 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 35,24 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 36,24 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 9,92 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 10,92 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 11,92 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 5,22 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route120_EventScript_Colin` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 32,14 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route120_EventScript_Robert` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 27,51 | `MOVEMENT_TYPE_FACE_LEFT` | `Route120_EventScript_Lorenzo` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 36,45 | `MOVEMENT_TYPE_FACE_LEFT` | `Route120_EventScript_Jenna` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 19,80 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `Route120_EventScript_Jeffrey` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 20,55 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route120_EventScript_ItemNugget` | `FLAG_ITEM_ROUTE_120_NUGGET` |
| `LOCALID_ROUTE120_TY_1` | `OBJ_EVENT_GFX_CAMERAMAN` | 37,5 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle3` | `FLAG_HIDE_ROUTE_120_GABBY_AND_TY_1` |
| `LOCALID_ROUTE120_GABBY_1` | `OBJ_EVENT_GFX_REPORTER_F` | 36,5 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle3` | `FLAG_HIDE_ROUTE_120_GABBY_AND_TY_1` |
| `LOCALID_ROUTE120_GABBY_2` | `OBJ_EVENT_GFX_REPORTER_F` | 36,5 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle6` | `FLAG_HIDE_ROUTE_120_GABBY_AND_TY_2` |
| `LOCALID_ROUTE120_TY_2` | `OBJ_EVENT_GFX_CAMERAMAN` | 37,5 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle6` | `FLAG_HIDE_ROUTE_120_GABBY_AND_TY_2` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 35,32 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 7,89 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route120_EventScript_ItemFullHeal` | `FLAG_ITEM_ROUTE_120_FULL_HEAL` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 14,92 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route120_EventScript_BerryBeauty` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 31,37 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `Route120_EventScript_Jennifer` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 9,60 | `MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT` | `Route120_EventScript_Chip` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 16,6 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `Route120_EventScript_Clarissa` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 18,34 | `MOVEMENT_TYPE_FACE_LEFT` | `Route120_EventScript_Angelica` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 22,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route120_EventScript_ItemNestBall` | `FLAG_ITEM_ROUTE_120_NEST_BALL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 23,82 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route120_EventScript_ItemHyperPotion` | `FLAG_ITEM_ROUTE_120_HYPER_POTION` |
| `LOCALID_BRIDGE_KECLEON` | `OBJ_EVENT_GFX_KECLEON` | 12,16 | `MOVEMENT_TYPE_INVISIBLE` | `Route120_EventScript_BridgeKecleon` | `FLAG_HIDE_ROUTE_120_KECLEON_BRIDGE` |
| `LOCALID_ROUTE120_STEVEN` | `OBJ_EVENT_GFX_STEVEN` | 13,15 | `MOVEMENT_TYPE_FACE_DOWN` | `Route120_EventScript_Steven` | `FLAG_HIDE_ROUTE_120_STEVEN` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 20,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 15,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 10,72 | `MOVEMENT_TYPE_MOUNTAIN_DISGUISE` | `Route120_EventScript_Keigo` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 19,28 | `MOVEMENT_TYPE_TREE_DISGUISE` | `Route120_EventScript_Riley` | `0` |
| `LOCALID_BRIDGE_KECLEON_SHADOW` | `OBJ_EVENT_GFX_KECLEON_BRIDGE_SHADOW` | 12,16 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_120_KECLEON_BRIDGE_SHADOW` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 20,11 | `MOVEMENT_TYPE_INVISIBLE` | `Route120_EventScript_Kecleon1` | `FLAG_HIDE_ROUTE_120_KECLEON_1` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 27,2 | `MOVEMENT_TYPE_INVISIBLE` | `Route120_EventScript_Kecleon2` | `FLAG_HIDE_ROUTE_120_KECLEON_2` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 4,77 | `MOVEMENT_TYPE_INVISIBLE` | `Route120_EventScript_Kecleon3` | `FLAG_HIDE_ROUTE_120_KECLEON_3` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 7,51 | `MOVEMENT_TYPE_INVISIBLE` | `Route120_EventScript_Kecleon5` | `FLAG_HIDE_ROUTE_120_KECLEON_5` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 19,48 | `MOVEMENT_TYPE_INVISIBLE` | `Route120_EventScript_Kecleon4` | `FLAG_HIDE_ROUTE_120_KECLEON_4` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 19,32 | `MOVEMENT_TYPE_FACE_UP` | `Route120_EventScript_Callie` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 14,34 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route120_EventScript_Leonel` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 24,33 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route120_EventScript_ItemRevive` | `FLAG_ITEM_ROUTE_120_REVIVE` |

## Warps (2)
- #0 (7,55) → `MAP_ANCIENT_TOMB` warp #0
- #1 (19,23) → `MAP_SCORCHED_SLAB` warp #0

## Coord events / triggers (19)
- (7,15) → ``
- (7,16) → ``
- (22,61) → ``
- (12,64) → ``
- (35,63) → ``
- (36,63) → ``
- (37,63) → ``
- (38,63) → ``
- (32,88) → ``
- (28,15) → ``
- (28,16) → ``
- (28,17) → ``
- (32,89) → ``
- (32,90) → ``
- (32,91) → ``
- (10,75) → ``
- (11,75) → ``
- (12,75) → ``
- (13,75) → ``

## BG events / signs (14)
- (27,3) [sign] → `Route120_EventScript_RouteSignFortree`
- (38,88) [sign] → `Route120_EventScript_RouteSign121`
- (28,62) [secret_base] → ``
- (30,62) [secret_base] → ``
- (26,10) [secret_base] → ``
- (29,85) [secret_base] → ``
- (18,12) [secret_base] → ``
- (38,54) [secret_base] → ``
- (31,23) [secret_base] → ``
- (9,1) [hidden_item] → ``
- (31,11) [hidden_item] → ``
- (0,86) [hidden_item] → ``
- (24,42) [hidden_item] → ``
- (5,76) [secret_base] → ``

## Flags référencés (5)
- `FLAG_DAILY_ROUTE_120_RECEIVED_BERRY`
- `FLAG_NOT_READY_FOR_BATTLE_ROUTE_120`
- `FLAG_RECEIVED_DEVON_SCOPE`
- `FLAG_REGI_DOORS_OPENED`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_0x8009`
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route120_Text_AngelicaPostBattle`
- `Route120_Text_BerriesExpressionOfLoveIsntIt`
- `Route120_Text_BerryIsRareRaiseItWithCare`
- `Route120_Text_CalliePostBattle`
- `Route120_Text_ChipPostBattle`
- `Route120_Text_ClarissaPostBattle`
- `Route120_Text_ColinPostBattle`
- `Route120_Text_IllGetMoreBerriesFromBerryMaster`
- `Route120_Text_JeffreyPostBattle`
- `Route120_Text_JeffreyPostRematch`
- `Route120_Text_JeffreyRegister`
- `Route120_Text_JennaPostBattle`
- `Route120_Text_JenniferPostBattle`
- `Route120_Text_KeigoPostBattle`
- `Route120_Text_LeonelPostBattle`
- `Route120_Text_LorenzoPostBattle`
- `Route120_Text_MakeYourOwnImpressions`
- `Route120_Text_RileyPostBattle`
- `Route120_Text_RobertPostBattle`
- `Route120_Text_RobertPostRematch`
- `Route120_Text_RobertRegister`
- `Route120_Text_YesYouUnderstand`
### data/scripts/gabby_and_ty.inc
- `GabbyAndTy_EventScript_UpdateLocation`

## Scripts (54)
### Route120_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route120_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route120_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route120_OnLoad
```
### Route120_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, Route120_EventScript_RemoveKecleonObject
end
```
### Route120_EventScript_RemoveKecleonObject
```
call_if_eq VAR_0x8009, 0, Route120_EventScript_RemoveBridgeKecleon
call_if_eq VAR_0x8009, 1, Route120_EventScript_RemoveKecleon
call_if_eq VAR_0x8009, 2, Route120_EventScript_RemoveKecleon
call_if_eq VAR_0x8009, 3, Route120_EventScript_RemoveKecleon
call_if_eq VAR_0x8009, 4, Route120_EventScript_RemoveKecleon
call_if_eq VAR_0x8009, 5, Route120_EventScript_RemoveKecleon
return
```
### Route120_EventScript_RemoveBridgeKecleon
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject LOCALID_BRIDGE_KECLEON
removeobject LOCALID_BRIDGE_KECLEON_SHADOW
return
```
### Route120_EventScript_RemoveKecleon
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### Route120_OnLoad
```
call_if_unset FLAG_REGI_DOORS_OPENED, Route120_EventScript_CloseAncientTomb
call_if_set FLAG_RECEIVED_DEVON_SCOPE, Route120_EventScript_SetBridgeClearMetatiles
call_if_unset FLAG_RECEIVED_DEVON_SCOPE, Route120_EventScript_SetBridgeKecleonMovement
end
```
### Route120_EventScript_CloseAncientTomb
```
setmetatile 7, 54, METATILE_General_RockWall_RockBase, TRUE
setmetatile 7, 55, METATILE_General_RockWall_SandBase, TRUE
return
```
### Route120_EventScript_SetBridgeClearMetatiles
```
setmetatile 13, 15, METATILE_Fortree_WoodBridge1_Top, FALSE
setmetatile 12, 16, METATILE_Fortree_WoodBridge1_Bottom, FALSE
setmetatile 12, 17, METATILE_General_ReflectiveWater, FALSE
setmetatile 13, 17, METATILE_General_ReflectiveWater, FALSE
return
```
### Route120_EventScript_SetBridgeKecleonMovement
```
setobjectmovementtype LOCALID_BRIDGE_KECLEON_SHADOW, MOVEMENT_TYPE_FACE_RIGHT
return
```
### Route120_OnTransition
```
call GabbyAndTy_EventScript_UpdateLocation
call Route120_EventScript_SetWeather
end
```
### Route120_EventScript_SetWeather
```
getplayerxy VAR_TEMP_0, VAR_TEMP_1
goto_if_le VAR_TEMP_1, 14, Route120_EventScript_SetSunnyWeather
goto_if_le VAR_TEMP_1, 60, Route120_EventScript_TrySetRainyWeather
goto_if_ge VAR_TEMP_1, 61, Route120_EventScript_SetCloudyWeather
return
```
### Route120_EventScript_SetCloudyWeather
```
setweather WEATHER_SUNNY_CLOUDS
return
```
### Route120_EventScript_SetSunnyWeather
```
setweather WEATHER_SUNNY
return
```
### Route120_EventScript_TrySetRainyWeather
```
goto_if_le VAR_TEMP_0, 7, Route120_EventScript_SetRainyWeather
goto_if_le VAR_TEMP_0, 19, Route120_EventScript_SetSunnyWeather
goto Route120_EventScript_SetRainyWeather
end
```
### Route120_EventScript_SetRainyWeather
```
setweather WEATHER_RAIN
return
```
### Route120_EventScript_BerryBeauty
```
lock
faceplayer
dotimebasedevents
goto_if_set FLAG_DAILY_ROUTE_120_RECEIVED_BERRY, Route120_EventScript_ReceivedBerry
msgbox Route120_Text_BerriesExpressionOfLoveIsntIt, MSGBOX_YESNO
call_if_eq VAR_RESULT, YES, Route120_EventScript_BerryLove
call_if_eq VAR_RESULT, NO, Route120_EventScript_BerryNotLove
specialvar VAR_RESULT, GetPlayerTrainerIdOnesDigit
switch VAR_RESULT
case 0, Route120_EventScript_GiveFigyBerry
case 5, Route120_EventScript_GiveFigyBerry
case 1, Route120_EventScript_GiveWikiBerry
case 6, Route120_EventScript_GiveWikiBerry
case 2, Route120_EventScript_GiveMagoBerry
case 7, Route120_EventScript_GiveMagoBerry
case 3, Route120_EventScript_GiveAguavBerry
case 8, Route120_EventScript_GiveAguavBerry
case 4, Route120_EventScript_GiveIapapaBerry
case 9, Route120_EventScript_GiveIapapaBerry
end
```
### Route120_EventScript_GiveFigyBerry
```
setvar VAR_0x8004, ITEM_FIGY_BERRY
goto Route120_EventScript_GiveBerry
end
```
### Route120_EventScript_GiveWikiBerry
```
setvar VAR_0x8004, ITEM_WIKI_BERRY
goto Route120_EventScript_GiveBerry
end
```
### Route120_EventScript_GiveMagoBerry
```
setvar VAR_0x8004, ITEM_MAGO_BERRY
goto Route120_EventScript_GiveBerry
end
```
### Route120_EventScript_GiveAguavBerry
```
setvar VAR_0x8004, ITEM_AGUAV_BERRY
goto Route120_EventScript_GiveBerry
end
```
### Route120_EventScript_GiveIapapaBerry
```
setvar VAR_0x8004, ITEM_IAPAPA_BERRY
goto Route120_EventScript_GiveBerry
end
```
### Route120_EventScript_GiveBerry
```
giveitem VAR_0x8004
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_DAILY_ROUTE_120_RECEIVED_BERRY
msgbox Route120_Text_BerryIsRareRaiseItWithCare, MSGBOX_DEFAULT
release
end
```
### Route120_EventScript_ReceivedBerry
```
msgbox Route120_Text_IllGetMoreBerriesFromBerryMaster, MSGBOX_DEFAULT
release
end
```
### Route120_EventScript_BerryLove
```
msgbox Route120_Text_YesYouUnderstand, MSGBOX_DEFAULT
return
```
### Route120_EventScript_BerryNotLove
```
msgbox Route120_Text_MakeYourOwnImpressions, MSGBOX_DEFAULT
return
```
### Route120_EventScript_Steven
```
lock
faceplayer
goto_if_set FLAG_NOT_READY_FOR_BATTLE_ROUTE_120, Route120_EventScript_StevenAskReadyForBattle
msgbox Route120_Text_StevenGreeting, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, Route120_EventScript_StevenNotReady
goto Route120_EventScript_StevenBattleKecleon
end
```
### Route120_EventScript_StevenNotReady
```
msgbox Route120_Text_StevenIllWaitHere, MSGBOX_DEFAULT
setflag FLAG_NOT_READY_FOR_BATTLE_ROUTE_120
release
end
```
### Route120_EventScript_StevenAskReadyForBattle
```
msgbox Route120_Text_StevenReadyForBattle, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, Route120_EventScript_StevenNotReady
goto Route120_EventScript_StevenBattleKecleon
end
```
### Route120_EventScript_StevenBattleKecleon
```
msgbox Route120_Text_StevenShowMeYourPower, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_NORTH, Route120_EventScript_PlayerApproachKecleonNorth
call_if_eq VAR_FACING, DIR_WEST, Route120_EventScript_PlayerApproachKecleonWest
applymovement LOCALID_ROUTE120_STEVEN, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 20
msgbox Route120_Text_StevenUsedDevonScope, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_BRIDGE_KECLEON, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
applymovement LOCALID_BRIDGE_KECLEON, Movement_KecleonAppears
waitmovement 0
waitse
playmoncry SPECIES_KECLEON, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setwildbattle SPECIES_KECLEON, 30
setvar VAR_0x8009, 0
setflag FLAG_SYS_CTRL_OBJ_DELETE
dowildbattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, Route120_EventScript_RemoveBridgeKecleonPostBattle
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, Route120_EventScript_RemoveBridgeKecleonPostBattle
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, Route120_EventScript_RemoveBridgeKecleonPostBattle
goto Route120_EventScript_StevenGiveDeconScope
end
```
### Route120_EventScript_RemoveBridgeKecleonPostBattle
```
fadescreenswapbuffers FADE_TO_BLACK
removeobject LOCALID_BRIDGE_KECLEON
removeobject LOCALID_BRIDGE_KECLEON_SHADOW
fadescreenswapbuffers FADE_FROM_BLACK
goto Route120_EventScript_StevenGiveDeconScope
end
```
### Route120_EventScript_StevenGiveDeconScope
```
applymovement LOCALID_ROUTE120_STEVEN, Common_Movement_WalkInPlaceFasterDown
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox Route120_Text_StevenGiveDevonScope, MSGBOX_DEFAULT
giveitem ITEM_DEVON_SCOPE
setflag FLAG_RECEIVED_DEVON_SCOPE
msgbox Route120_Text_StevenGoodbye, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE120_STEVEN, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 50
setfieldeffectargument 0, 1
dofieldeffect FLDEFF_NPCFLY_OUT
delay 15
removeobject LOCALID_ROUTE120_STEVEN
waitfieldeffect FLDEFF_NPCFLY_OUT
setmetatile 13, 15, METATILE_Fortree_WoodBridge1_Top, FALSE
setmetatile 12, 16, METATILE_Fortree_WoodBridge1_Bottom, FALSE
setmetatile 12, 17, METATILE_General_ReflectiveWater, FALSE
setmetatile 13, 17, METATILE_General_ReflectiveWater, FALSE
special DrawWholeMapView
release
end
```
### Route120_EventScript_PlayerApproachKecleonNorth
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```
### Route120_EventScript_PlayerApproachKecleonWest
```
applymovement LOCALID_PLAYER, Route120_Movement_ApproachKecleonWest
waitmovement 0
return
```
### Route120_Movement_ApproachKecleonWest
```
walk_down
walk_left
step_end
```
### Route120_EventScript_BridgeKecleon
```
msgbox Kecleon_Text_SomethingUnseeable, MSGBOX_NPC
end
```
### Route120_EventScript_RouteSignFortree
```
msgbox Route120_Text_RouteSignFortree, MSGBOX_SIGN
end
```
### Route120_EventScript_RouteSign121
```
msgbox Route120_Text_RouteSign121, MSGBOX_SIGN
end
```
### Route120_EventScript_Colin
```
trainerbattle_single TRAINER_COLIN, Route120_Text_ColinIntro, Route120_Text_ColinDefeat
msgbox Route120_Text_ColinPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Robert
```
trainerbattle_single TRAINER_ROBERT_1, Route120_Text_RobertIntro, Route120_Text_RobertDefeat, Route120_EventScript_RegisterRobert
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route120_EventScript_RematchRobert
msgbox Route120_Text_RobertPostBattle, MSGBOX_DEFAULT
release
end
```
### Route120_EventScript_RegisterRobert
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route120_Text_RobertRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ROBERT_1
release
end
```
### Route120_EventScript_RematchRobert
```
trainerbattle_rematch TRAINER_ROBERT_1, Route120_Text_RobertRematchIntro, Route120_Text_RobertRematchDefeat
msgbox Route120_Text_RobertPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Lorenzo
```
trainerbattle_single TRAINER_LORENZO, Route120_Text_LorenzoIntro, Route120_Text_LorenzoDefeat
msgbox Route120_Text_LorenzoPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Jenna
```
trainerbattle_single TRAINER_JENNA, Route120_Text_JennaIntro, Route120_Text_JennaDefeat
msgbox Route120_Text_JennaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Jeffrey
```
trainerbattle_single TRAINER_JEFFREY_1, Route120_Text_JeffreyIntro, Route120_Text_JeffreyDefeat, Route120_EventScript_RegisterJeffrey
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route120_EventScript_RematchJeffrey
msgbox Route120_Text_JeffreyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route120_EventScript_RegisterJeffrey
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route120_Text_JeffreyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_JEFFREY_1
release
end
```
### Route120_EventScript_RematchJeffrey
```
trainerbattle_rematch TRAINER_JEFFREY_1, Route120_Text_JeffreyRematchIntro, Route120_Text_JeffreyRematchDefeat
msgbox Route120_Text_JeffreyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Jennifer
```
trainerbattle_single TRAINER_JENNIFER, Route120_Text_JenniferIntro, Route120_Text_JenniferDefeat
msgbox Route120_Text_JenniferPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Chip
```
trainerbattle_single TRAINER_CHIP, Route120_Text_ChipIntro, Route120_Text_ChipDefeat
msgbox Route120_Text_ChipPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Clarissa
```
trainerbattle_single TRAINER_CLARISSA, Route120_Text_ClarissaIntro, Route120_Text_ClarissaDefeat
msgbox Route120_Text_ClarissaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Angelica
```
trainerbattle_single TRAINER_ANGELICA, Route120_Text_AngelicaIntro, Route120_Text_AngelicaDefeat
msgbox Route120_Text_AngelicaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Keigo
```
trainerbattle_single TRAINER_KEIGO, Route120_Text_KeigoIntro, Route120_Text_KeigoDefeat
msgbox Route120_Text_KeigoPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Riley
```
trainerbattle_single TRAINER_RILEY, Route120_Text_RileyIntro, Route120_Text_RileyDefeat
msgbox Route120_Text_RileyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Leonel
```
trainerbattle_single TRAINER_LEONEL, Route120_Text_LeonelIntro, Route120_Text_LeonelDefeat
msgbox Route120_Text_LeonelPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route120_EventScript_Callie
```
trainerbattle_single TRAINER_CALLIE, Route120_Text_CallieIntro, Route120_Text_CallieDefeat
msgbox Route120_Text_CalliePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (12)
### Route120_Text_StevenGreeting
```
PIERRE: Hum? Salut {PLAYER}{KUN}.\nÇa faisait longtemps.\pIl y a quelque chose ici que tu ne peux\npas voir, n'est-ce pas?\pEt si j'utilisais cet appareil sur cet\nobstacle invisible…\pNon, non. Plutôt que de t'expliquer,\nje ferais mieux de te montrer.\pCe serait plus sympa.\p{PLAYER}{KUN}, tes POKéMON sont-ils\nprêts à se battre?$
```
### Route120_Text_StevenIllWaitHere
```
PIERRE: Non?\pAlors j'attends ici qu'ils soient prêts.$
```
### Route120_Text_StevenReadyForBattle
```
PIERRE: {PLAYER}{KUN}, tes POKéMON sont-ils\nprêts à se battre?$
```
### Route120_Text_StevenShowMeYourPower
```
PIERRE: {PLAYER}{KUN}, montre-moi tes\nvéritables pouvoirs de DRESSEUR!$
```
### Route120_Text_StevenUsedDevonScope
```
PIERRE utilise le DEVON SCOPE.\pUn POKéMON invisible devient\nentièrement visible!\pLe POKéMON effrayé attaque!$
```
### Route120_Text_StevenGiveDevonScope
```
PIERRE: Je vois…\nTa façon de combattre est intrigante.\pTes POKéMON ont en effet grandi depuis\nnotre dernière rencontre à MYOKARA.\pJ'aimerais que tu prennes\nce DEVON SCOPE.\pQui sait? Il pourrait y avoir un autre\nPOKéMON caché.$
```
### Route120_Text_StevenGoodbye
```
PIERRE: {PLAYER}{KUN}.\pJ'aime voir des POKéMON et des\nDRESSEURS se donner du mal ensemble.\pJe trouve que tu le fais très bien.\pBon, on s'affrontera ailleurs une\nprochaine fois.$
```
### Kecleon_Text_SomethingUnseeable
```
Quelque chose d'invisible bloque la\nvoie.$
```
### Kecleon_Text_WantToUseDevonScope
```
Quelque chose d'invisible bloque la\nvoie.\pVoulez-vous utiliser le DEVON SCOPE?$
```
### Kecleon_Text_UseDevonScopeMonAttacked
```
{PLAYER} utilise le DEVON SCOPE.\pUn POKéMON invisible devient tout à\ncoup entièrement visible!\pLe POKéMON effrayé attaque!$
```
### Route120_Text_RouteSignFortree
```
ROUTE 120\n{LEFT_ARROW} CIMETRONELLE$
```
### Route120_Text_RouteSign121
```
{RIGHT_ARROW} ROUTE 121\n{LEFT_ARROW} ROUTE 120$
```

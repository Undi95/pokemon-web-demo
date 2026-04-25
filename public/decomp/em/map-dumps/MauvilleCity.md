# MauvilleCity

## Métadonnées
- **id** : `MAP_MAUVILLE_CITY`
- **layout** : `LAYOUT_MAUVILLE_CITY`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MAUVILLE_CITY`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_CITY`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE111`
- down (offset 0) → `MAP_ROUTE110`
- left (offset 0) → `MAP_ROUTE117`
- right (offset 0) → `MAP_ROUTE118`

## Object events (11 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BOY_3` | 29,16 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `MauvilleCity_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_RICH_BOY` | 24,10 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `MauvilleCity_EventScript_RichBoy` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 14,11 | `MOVEMENT_TYPE_FACE_RIGHT` | `MauvilleCity_EventScript_Maniac` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 18,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `MauvilleCity_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 17,14 | `MOVEMENT_TYPE_FACE_DOWN` | `MauvilleCity_EventScript_SchoolKidM` | `0` |
| `LOCALID_MAUVILLE_WALLY` | `OBJ_EVENT_GFX_WALLY` | 8,6 | `MOVEMENT_TYPE_FACE_UP` | `MauvilleCity_EventScript_Wally` | `FLAG_HIDE_MAUVILLE_CITY_WALLY` |
| `LOCALID_MAUVILLE_WALLYS_UNCLE` | `OBJ_EVENT_GFX_POKEFAN_M` | 9,6 | `MOVEMENT_TYPE_FACE_LEFT` | `MauvilleCity_EventScript_WallysUncle` | `FLAG_HIDE_MAUVILLE_CITY_WALLYS_UNCLE` |
| `` | `OBJ_EVENT_GFX_WATTSON` | 29,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `MauvilleCity_EventScript_Wattson` | `FLAG_HIDE_MAUVILLE_CITY_WATTSON` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 28,19 | `MOVEMENT_TYPE_LOOK_AROUND` | `MauvilleCity_EventScript_ItemXSpeed` | `FLAG_ITEM_MAUVILLE_CITY_X_SPEED` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 13,7 | `MOVEMENT_TYPE_FACE_LEFT` | `MauvilleCity_EventScript_RolloutTutor` | `0` |
| `LOCALID_MAUVILLE_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 12,14 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_MAUVILLE_CITY_SCOTT` |

## Warps (7)
- #0 (8,5) → `MAP_MAUVILLE_CITY_GYM` warp #0
- #1 (22,5) → `MAP_MAUVILLE_CITY_POKEMON_CENTER_1F` warp #0
- #2 (35,5) → `MAP_MAUVILLE_CITY_BIKE_SHOP` warp #0
- #3 (23,14) → `MAP_MAUVILLE_CITY_MART` warp #0
- #4 (32,14) → `MAP_MAUVILLE_CITY_HOUSE1` warp #0
- #5 (8,13) → `MAP_MAUVILLE_CITY_GAME_CORNER` warp #0
- #6 (19,14) → `MAP_MAUVILLE_CITY_HOUSE2` warp #0

## BG events / signs (8)
- (23,5) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (11,6) [sign] → `MauvilleCity_EventScript_GymSign`
- (24,14) [sign] → `Common_EventScript_ShowPokemartSign`
- (25,14) [sign] → `Common_EventScript_ShowPokemartSign`
- (24,5) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (19,7) [sign] → `MauvilleCity_EventScript_CitySign`
- (33,6) [sign] → `MauvilleCity_EventScript_BikeShopSign`
- (11,15) [sign] → `MauvilleCity_EventScript_GameCornerSign`

## Flags référencés (17)
- `FLAG_DECLINED_WALLY_BATTLE_MAUVILLE`
- `FLAG_DEFEATED_WALLY_MAUVILLE`
- `FLAG_ENABLE_FIRST_WALLY_POKENAV_CALL`
- `FLAG_ENABLE_WALLY_MATCH_CALL`
- `FLAG_FORCE_MIRAGE_TOWER_VISIBLE`
- `FLAG_GOT_BASEMENT_KEY_FROM_WATTSON`
- `FLAG_GOT_TM_THUNDERBOLT_FROM_WATTSON`
- `FLAG_HIDE_MAUVILLE_CITY_WATTSON`
- `FLAG_HIDE_MAUVILLE_GYM_WATTSON`
- `FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION`
- `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLY`
- `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLYS_UNCLE`
- `FLAG_MAUVILLE_GYM_BARRIERS_STATE`
- `FLAG_SYS_TV_START`
- `FLAG_TV_EXPLAINED`
- `FLAG_VISITED_MAUVILLE_CITY`
- `FLAG_WATTSON_REMATCH_AVAILABLE`

## Variables référencées (6)
- `VAR_FACING`
- `VAR_MAUVILLE_GYM_STATE`
- `VAR_NEW_MAUVILLE_STATE`
- `VAR_RESULT`
- `VAR_SCOTT_STATE`
- `VAR_WALLY_CALL_STEP_COUNTER`

## Scripts (53)
### MauvilleCity_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, MauvilleCity_OnTransition
```
### MauvilleCity_OnTransition
```
setflag FLAG_VISITED_MAUVILLE_CITY
clearflag FLAG_FORCE_MIRAGE_TOWER_VISIBLE
clearflag FLAG_HIDE_SLATEPORT_MUSEUM_POPULATION
setflag FLAG_SYS_TV_START
clearflag FLAG_MAUVILLE_GYM_BARRIERS_STATE
setvar VAR_MAUVILLE_GYM_STATE, 0
call_if_set FLAG_GOT_TM_THUNDERBOLT_FROM_WATTSON, MauvilleCity_EventScript_MoveWattsonBackToGym
end
```
### MauvilleCity_EventScript_MoveWattsonBackToGym
```
clearflag FLAG_HIDE_MAUVILLE_GYM_WATTSON
setflag FLAG_HIDE_MAUVILLE_CITY_WATTSON
setflag FLAG_WATTSON_REMATCH_AVAILABLE
return
```
### MauvilleCity_EventScript_Boy
```
msgbox MauvilleCity_Text_NurseHurtMonBackToHealth, MSGBOX_NPC
end
```
### MauvilleCity_EventScript_Maniac
```
msgbox MauvilleCity_Text_AllSortsOfPeopleComeThrough, MSGBOX_NPC
end
```
### MauvilleCity_EventScript_Woman
```
msgbox MauvilleCity_Text_RydelVeryGenerous, MSGBOX_NPC
end
```
### MauvilleCity_EventScript_RichBoy
```
msgbox MauvilleCity_Text_PokemonCanJumpYouOnBike, MSGBOX_NPC
end
```
### MauvilleCity_EventScript_CitySign
```
msgbox MauvilleCity_Text_CitySign, MSGBOX_SIGN
end
```
### MauvilleCity_EventScript_GymSign
```
msgbox MauvilleCity_Text_GymSign, MSGBOX_SIGN
end
```
### MauvilleCity_EventScript_BikeShopSign
```
msgbox MauvilleCity_Text_BikeShopSign, MSGBOX_SIGN
end
```
### MauvilleCity_EventScript_GameCornerSign
```
msgbox MauvilleCity_Text_GameCornerSign, MSGBOX_SIGN
end
```
### MauvilleCity_EventScript_SchoolKidM
```
lock
faceplayer
goto_if_set FLAG_TV_EXPLAINED, MauvilleCity_EventScript_TVExplained
msgbox MauvilleCity_Text_ExplainTV, MSGBOX_DEFAULT
setflag FLAG_TV_EXPLAINED
release
end
```
### MauvilleCity_EventScript_TVExplained
```
msgbox MauvilleCity_Text_BeenCheckingOutTV, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_EventScript_WallysUncle
```
lock
faceplayer
goto_if_set FLAG_DECLINED_WALLY_BATTLE_MAUVILLE, MauvilleCity_EventScript_UncleAskPlayerToBattleWally
msgbox MauvilleCity_Text_UncleHesTooPeppy, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### MauvilleCity_EventScript_UncleAskPlayerToBattleWally
```
msgbox MauvilleCity_Text_UncleCanYouBattleWally, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### MauvilleCity_EventScript_Wally
```
lockall
goto_if_set FLAG_DECLINED_WALLY_BATTLE_MAUVILLE, MauvilleCity_EventScript_WallyRequestBattleAgain
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox MauvilleCity_Text_WallyWantToChallengeGym, MSGBOX_DEFAULT
msgbox MauvilleCity_Text_UncleYourePushingIt, MSGBOX_DEFAULT
msgbox MauvilleCity_Text_WallyWeCanBeatAnyone, MSGBOX_DEFAULT
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_FacePlayer
waitmovement 0
playse SE_PIN
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_Delay48
waitmovement 0
msgbox MauvilleCity_Text_WallyWillYouBattleMe, MSGBOX_YESNO
goto MauvilleCity_EventScript_BattleWallyPrompt
end
```
### MauvilleCity_EventScript_BattleWallyPrompt
```
call_if_eq VAR_RESULT, YES, MauvilleCity_EventScript_BattleWally
goto_if_eq VAR_RESULT, NO, MauvilleCity_EventScript_DeclineWallyBattle
closemessage
switch VAR_FACING
case DIR_NORTH, MauvilleCity_EventScript_WallyAndUncleExitNorth
case DIR_EAST, MauvilleCity_EventScript_WallyAndUncleExitEast
end
```
### MauvilleCity_EventScript_WallyAndUncleExitNorth
```
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerWatchWallyExitNorth1
applymovement LOCALID_MAUVILLE_WALLY, MauvilleCity_Movement_WallyExitNorth1
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, MauvilleCity_Movement_WallysUncleExitNorth1
waitmovement 0
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 30
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerFaceUncleNorth
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, MauvilleCity_Movement_WallysUncleApproachPlayerNorth
waitmovement 0
msgbox MauvilleCity_Text_UncleVisitUsSometime, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerWatchWallyExitNorth2
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, MauvilleCity_Movement_WallysUncleExitNorth2
applymovement LOCALID_MAUVILLE_WALLY, MauvilleCity_Movement_WallyExitNorth2
waitmovement 0
goto MauvilleCity_EventScript_DefeatedWally
end
```
### MauvilleCity_EventScript_WallyAndUncleExitEast
```
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerWatchWallyExitEast1
applymovement LOCALID_MAUVILLE_WALLY, MauvilleCity_Movement_WallyExitEast1
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, MauvilleCity_Movement_WallysUncleExitEast1
waitmovement 0
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 30
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, MauvilleCity_Movement_WallysUncleApproachPlayerEast
waitmovement 0
msgbox MauvilleCity_Text_UncleVisitUsSometime, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerWatchWallyExitEast2
applymovement LOCALID_MAUVILLE_WALLYS_UNCLE, MauvilleCity_Movement_WallysUncleExitEast2
applymovement LOCALID_MAUVILLE_WALLY, MauvilleCity_Movement_WallyExitEast2
waitmovement 0
goto MauvilleCity_EventScript_DefeatedWally
end
```
### MauvilleCity_EventScript_DefeatedWally
```
removeobject LOCALID_MAUVILLE_WALLY
removeobject LOCALID_MAUVILLE_WALLYS_UNCLE
clearflag FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLY
clearflag FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLYS_UNCLE
setflag FLAG_DEFEATED_WALLY_MAUVILLE
setvar VAR_WALLY_CALL_STEP_COUNTER, 0
setflag FLAG_ENABLE_FIRST_WALLY_POKENAV_CALL
call_if_eq VAR_FACING, DIR_NORTH, MauvilleCity_EventScript_ScottApproachPlayerNorth
call_if_eq VAR_FACING, DIR_EAST, MauvilleCity_EventScript_ScottApproachPlayerEast
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox MauvilleCity_Text_ScottYouDidntHoldBack, MSGBOX_DEFAULT
closemessage
addvar VAR_SCOTT_STATE, 1
call_if_eq VAR_FACING, DIR_NORTH, MauvilleCity_EventScript_ScottExitNorth
call_if_eq VAR_FACING, DIR_EAST, MauvilleCity_EventScript_ScottExitEast
removeobject LOCALID_MAUVILLE_SCOTT
releaseall
end
```
### MauvilleCity_EventScript_ScottApproachPlayerNorth
```
addobject LOCALID_MAUVILLE_SCOTT
applymovement LOCALID_MAUVILLE_SCOTT, MauvilleCity_Movement_ScottApproachPlayerNorth
waitmovement 0
return
```
### MauvilleCity_EventScript_ScottApproachPlayerEast
```
setobjectxyperm LOCALID_MAUVILLE_SCOTT, 12, 13
addobject LOCALID_MAUVILLE_SCOTT
applymovement LOCALID_MAUVILLE_SCOTT, MauvilleCity_Movement_ScottApproachPlayerEast
waitmovement 0
return
```
### MauvilleCity_EventScript_ScottExitNorth
```
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerWatchScottExitNorth
applymovement LOCALID_MAUVILLE_SCOTT, MauvilleCity_Movement_ScottExitNorth
waitmovement 0
return
```
### MauvilleCity_EventScript_ScottExitEast
```
applymovement LOCALID_PLAYER, MauvilleCity_Movement_PlayerWatchScottExitEast
applymovement LOCALID_MAUVILLE_SCOTT, MauvilleCity_Movement_ScottExitEast
waitmovement 0
return
```
### MauvilleCity_EventScript_BattleWally
```
msgbox MauvilleCity_Text_WallyHereICome, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_WALLY_MAUVILLE, MauvilleCity_Text_WallyDefeat
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox MauvilleCity_Text_WallyIllGoBackToVerdanturf, MSGBOX_DEFAULT
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_FacePlayer
waitmovement 0
msgbox MauvilleCity_Text_ThankYouNotEnoughToBattle, MSGBOX_DEFAULT
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox MauvilleCity_Text_UncleNoNeedToBeDown, MSGBOX_DEFAULT
return
```
### MauvilleCity_EventScript_DeclineWallyBattle
```
setflag FLAG_DECLINED_WALLY_BATTLE_MAUVILLE
msgbox MauvilleCity_Text_WallyMyUncleWontKnowImStrong, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_EventScript_WallyRequestBattleAgain
```
applymovement LOCALID_MAUVILLE_WALLY, Common_Movement_FacePlayer
waitmovement 0
msgbox MauvilleCity_Text_WallyPleaseBattleMe, MSGBOX_YESNO
goto MauvilleCity_EventScript_BattleWallyPrompt
end
```
### MauvilleCity_Movement_WallyExitNorth1
```
walk_left
walk_left
walk_down
walk_down
walk_left
step_end
```
### MauvilleCity_Movement_WallyExitEast1
```
walk_down
walk_down
walk_left
walk_left
walk_left
step_end
```
### MauvilleCity_Movement_WallyExitNorth2
```
delay_16
delay_16
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
delay_8
step_end
```
### MauvilleCity_Movement_WallyExitEast2
```
delay_16
delay_16
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
delay_8
step_end
```
### MauvilleCity_Movement_PlayerWatchWallyExitNorth2
```
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### MauvilleCity_Movement_PlayerWatchWallyExitEast2
```
delay_16
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### MauvilleCity_Movement_PlayerWatchScottExitNorth
```
delay_16
walk_in_place_faster_left
step_end
```
### MauvilleCity_Movement_PlayerWatchScottExitEast
```
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### MauvilleCity_Movement_PlayerWatchWallyExitEast1
```
delay_16
walk_in_place_faster_down
step_end
```
### MauvilleCity_Movement_PlayerWatchWallyExitNorth1
```
delay_16
walk_in_place_faster_left
step_end
```
### MauvilleCity_Movement_WallysUncleExitNorth1
```
walk_left
walk_left
walk_left
walk_down
walk_down
step_end
```
### MauvilleCity_Movement_WallysUncleExitEast1
```
walk_left
walk_down
walk_down
walk_left
walk_left
step_end
```
### MauvilleCity_Movement_PlayerFaceUncleNorth
```
delay_16
delay_8
delay_4
walk_in_place_faster_down
step_end
```
### MauvilleCity_Movement_WallysUncleApproachPlayerNorth
```
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### MauvilleCity_Movement_WallysUncleApproachPlayerEast
```
walk_right
walk_up
step_end
```
### MauvilleCity_Movement_WallysUncleExitNorth2
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
### MauvilleCity_Movement_WallysUncleExitEast2
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
step_end
```
### MauvilleCity_Movement_ScottApproachPlayerNorth
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_up
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### MauvilleCity_Movement_ScottApproachPlayerEast
```
walk_up
walk_up
walk_up
walk_up
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_up
step_end
```
### MauvilleCity_Movement_ScottExitNorth
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
### MauvilleCity_Movement_ScottExitEast
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
### MauvilleCity_EventScript_Wattson
```
lock
faceplayer
goto_if_set FLAG_GOT_TM_THUNDERBOLT_FROM_WATTSON, MauvilleCity_EventScript_ReceivedThunderbolt
goto_if_eq VAR_NEW_MAUVILLE_STATE, 2, MauvilleCity_EventScript_CompletedNewMauville
goto_if_set FLAG_GOT_BASEMENT_KEY_FROM_WATTSON, MauvilleCity_EventScript_BegunNewMauville
msgbox MauvilleCity_Text_WattsonNeedFavorTakeKey, MSGBOX_DEFAULT
giveitem ITEM_BASEMENT_KEY
setflag FLAG_GOT_BASEMENT_KEY_FROM_WATTSON
msgbox MauvilleCity_Text_WattsonWontBeChallenge, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_EventScript_BegunNewMauville
```
msgbox MauvilleCity_Text_WattsonWontBeChallenge, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_EventScript_CompletedNewMauville
```
msgbox MauvilleCity_Text_WattsonThanksTakeTM, MSGBOX_DEFAULT
giveitem ITEM_TM_THUNDERBOLT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_GOT_TM_THUNDERBOLT_FROM_WATTSON
msgbox MauvilleCity_Text_WattsonYoungTakeCharge, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_EventScript_ReceivedThunderbolt
```
msgbox MauvilleCity_Text_WattsonYoungTakeCharge, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_EventScript_RegisterWallyCall
```
lockall
pokenavcall MauvilleCity_Text_WallyPokenavCall
waitmessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox MauvilleCity_Text_RegisteredWally, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_WALLY_MATCH_CALL
clearflag FLAG_ENABLE_FIRST_WALLY_POKENAV_CALL
releaseall
end
```

## Textes (31)
### MauvilleCity_Text_UncleHesTooPeppy
```
TONTON: C'est grâce aux POKéMON\nque ce garçon a retrouvé la pêche…\pMais il l'a même un peu trop maintenant…$
```
### MauvilleCity_Text_WallyWantToChallengeGym
```
TIMMY: Oh, TONTON, s'il te plaît.\pJe veux me battre dans cette ARENE\npour voir à quel point j'ai progressé.\pS'il te plaît! Je peux?$
```
### MauvilleCity_Text_UncleYourePushingIt
```
TONTON: Attends, TIMMY.\pDepuis que tu as commencé à vivre avec\nton POKéMON, tu es devenu plus fort.\pMais tu ne trouves pas que combattre\ndans une ARENE est un peu prématuré?$
```
### MauvilleCity_Text_WallyWeCanBeatAnyone
```
TIMMY: Pas du tout.\pQuand je suis avec mon TARSAL,\non peut battre n'importe qui!$
```
### MauvilleCity_Text_WallyWillYouBattleMe
```
TIMMY: Oh! Salut, {PLAYER}!\pJe suis devenu bien plus fort depuis\nnotre dernière rencontre.\p{PLAYER}, je veux que mon oncle et toi\ncompreniez ça.\p{PLAYER}, tu acceptes de te battre\ncontre moi?$
```
### MauvilleCity_Text_WallyMyUncleWontKnowImStrong
```
TIMMY: Oh… Si tu n'acceptes pas de\nm'affronter, mon oncle ne pourra pas\lvoir que je suis devenu vraiment fort.$
```
### MauvilleCity_Text_UncleCanYouBattleWally
```
TONTON: {PLAYER}{KUN}.\nDe la part de TIMMY, je peux te\ldemander de l'affronter juste une fois?\pVu l'état dans lequel il est, je ne pense\npas qu'il reviendra à la raison.$
```
### MauvilleCity_Text_WallyPleaseBattleMe
```
TIMMY: {PLAYER}, s'il te plaît!\nBats-toi contre moi, je t'en supplie.$
```
### MauvilleCity_Text_WallyHereICome
```
TIMMY: Merci, {PLAYER}.\pOK. J'arrive!$
```
### MauvilleCity_Text_WallyDefeat
```
TIMMY: … … … … … … …\p… … … … … … … …\pJ'ai perdu…$
```
### MauvilleCity_Text_WallyIllGoBackToVerdanturf
```
TIMMY: TONTON…\nJe vais rentrer à VERGAZON…$
```
### MauvilleCity_Text_ThankYouNotEnoughToBattle
```
Merci, {PLAYER}.\nC'est dur d'être DRESSEUR, hein?\pIl ne suffit pas d'avoir des POKéMON\net de les envoyer au combat. C'est pas\lça être un vrai DRESSEUR.$
```
### MauvilleCity_Text_UncleNoNeedToBeDown
```
TONTON: TIMMY, ce n'est pas la peine\nd'être aussi dur avec toi-même.\pRien ne t'empêche de devenir encore\nplus fort!\pAllez viens, rentrons chez nous.\nTout le monde t'attend.$
```
### MauvilleCity_Text_UncleVisitUsSometime
```
TONTON: {PLAYER}{KUN}, je viens juste de\nréaliser que tu dois être le DRESSEUR\lqui a gardé un œil sur TIMMY quand il\la attrapé son POKéMON.\pPourquoi ne viendrais-tu pas nous voir\nà VERGAZON un de ces jours?\pÇa ferait sûrement plaisir à TIMMY.$
```
### MauvilleCity_Text_WallyPokenavCall
```
… … … … … …\n… … … … … Bip!\pTIMMY: Oh, bonjour, {PLAYER}!\pJe voulais juste te dire que mon\noncle m'a acheté un POKéNAV!\pJe peux t'appeler quand je veux!\p… … … … … …\n… … … … … Clic!$
```
### MauvilleCity_Text_RegisteredWally
```
Vous avez enregistré TIMMY dans\nle POKéNAV.$
```
### MauvilleCity_Text_ScottYouDidntHoldBack
```
SCOTT: Héhé…\nJ'ai assisté à ton combat!\pTIMMY et toi êtes amis, n'est-ce pas?\pMais tu n'as pourtant pas retenu tes\ncoups et tu l'as battu magistralement!\pC'est ça que j'aime dans les combats\nde POKéMON!\pJ'adore les DRESSEURS comme toi!\p… … … … … …\pTu peux compter sur moi pour\nt'encourager!$
```
### MauvilleCity_Text_WattsonNeedFavorTakeKey
```
VOLTERE: Oh, {PLAYER}{KUN}!\pTu sembles avoir beaucoup d'entrain!\nC'est une bonne chose, ah, ah, ah!\pBien! J'ai pris une décision!\nJ'ai une faveur à te demander, {PLAYER}{KUN}!\pLAVANDIA comprend une partie\nsouterraine appelée NEW LAVANDIA.\p{PLAYER}{KUN}, j'aimerais que tu t'y rendes et\nque tu éteignes le GENERATEUR.\pLe GENERATEUR fonctionne un peu\nbizarrement. Ça devient dangereux.\pTiens, voilà la CLE pour pouvoir\nentrer dans NEW LAVANDIA.$
```
### MauvilleCity_Text_WattsonWontBeChallenge
```
VOLTERE: Ne t'inquiète pas pour ça.\nCe ne sera pas trop dur pour toi.\pPour arriver à NEW LAVANDIA, un peu de\nSURF au bout de la ROUTE 110 suffira.\pC'est tout. Alors tu as ma confiance!\nWahahahaha!$
```
### MauvilleCity_Text_WattsonThanksTakeTM
```
VOLTERE: Wahahahaha!\pJe l'savais, {PLAYER}{KUN}! Je savais que\nj'avais raison en m'adressant à toi!\pVoilà ma façon de te remercier: une CT\ncontenant TONNERRE!\pAllez, tu l'as bien méritée!$
```
### MauvilleCity_Text_WattsonYoungTakeCharge
```
VOLTERE: Wahahahaha!\pJe suis très content de voir les jeunes\navancer et prendre les choses en main.$
```
### MauvilleCity_Text_NurseHurtMonBackToHealth
```
Tu sais, c'est bien gentil d'envoyer les\nPOKéMON au combat…\pMais si un de tes POKéMON est blessé, tu\ndois le soigner pour qu'il soit en forme.$
```
### MauvilleCity_Text_AllSortsOfPeopleComeThrough
```
Les routes de cette ville s'étendent du\nnord au sud et d'est en ouest.\pAlors ici, les gens viennent de partout.$
```
### MauvilleCity_Text_RydelVeryGenerous
```
Tu connais les CYCLES RODOLPHE?\pRODOLPHE, le propriétaire, est un homme\ntrès généreux.$
```
### MauvilleCity_Text_PokemonCanJumpYouOnBike
```
Même si tu es sur ton VELO, les\nPOKéMON peuvent te sauter dessus.$
```
### MauvilleCity_Text_CitySign
```
LAVANDIA\n“La brillante ville du fun!”$
```
### MauvilleCity_Text_GymSign
```
ARENE POKéMON de LAVANDIA\nCHAMPION: VOLTERE\l“Un homme électrifiant!”$
```
### MauvilleCity_Text_BikeShopSign
```
“Roule sur le gravier et remets\ntes idées en place!”\lCYCLES RODOLPHE$
```
### MauvilleCity_Text_GameCornerSign
```
“La salle de jeux pour tous!”\nCASINO DE LAVANDIA$
```
### MauvilleCity_Text_ExplainTV
```
Salut, ça t'arrive de regarder\nla télé?\pPlusieurs nouvelles émissions très\nsympas ont récemment été\lprogrammées.\pC'est sympa. J'ai vu mes amis à la télé\nalors que je ne m'y attendais pas.\pQuelquefois, ils te font même passer\nà la télé sans te le dire.\pJ'espère que je passerai moi aussi\nà la télé un jour.\pTu vois, tu devrais regarder la télé\nle plus souvent possible.$
```
### MauvilleCity_Text_BeenCheckingOutTV
```
Salut! T'as regardé la télé?$
```

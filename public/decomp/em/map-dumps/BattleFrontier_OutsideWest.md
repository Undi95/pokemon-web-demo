# BattleFrontier_OutsideWest

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_OUTSIDE_WEST`
- **layout** : `LAYOUT_BATTLE_FRONTIER_OUTSIDE_WEST`
- **music** : `MUS_B_FRONTIER`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- right (offset 0) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST`

## Object events (24 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BOY_2` | 26,38 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_OutsideWest_EventScript_Boy1` | `0` |
| `LOCALID_FRONTIER_SS_TIDAL` | `OBJ_EVENT_GFX_SS_TIDAL` | 20,70 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `0` |
| `LOCALID_FRONTIER_FERRY_ATTENDANT` | `OBJ_EVENT_GFX_BEAUTY` | 19,68 | `MOVEMENT_TYPE_FACE_UP` | `BattleFrontier_OutsideWest_EventScript_FerryAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 26,20 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `BattleFrontier_OutsideWest_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 27,30 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_OutsideWest_EventScript_Man1` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 33,41 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_OutsideWest_EventScript_Woman1` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 28,43 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `BattleFrontier_OutsideWest_EventScript_FatMan1` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 17,20 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_OutsideWest_EventScript_Gentleman` | `0` |
| `LOCALID_FRONTIER_MANIAC_1` | `OBJ_EVENT_GFX_MANIAC` | 13,44 | `MOVEMENT_TYPE_FACE_UP` | `BattleFrontier_OutsideWest_EventScript_Maniac1` | `0` |
| `LOCALID_FRONTIER_MANIAC_2` | `OBJ_EVENT_GFX_MANIAC` | 14,44 | `MOVEMENT_TYPE_FACE_UP` | `BattleFrontier_OutsideWest_EventScript_Maniac2` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 23,47 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `BattleFrontier_OutsideWest_EventScript_Man2` | `0` |
| `LOCALID_FRONTIER_GIRL` | `OBJ_EVENT_GFX_GIRL_1` | 38,27 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_OutsideWest_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 45,18 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `BattleFrontier_OutsideWest_EventScript_Woman2` | `0` |
| `LOCALID_FRONTIER_CAMPER` | `OBJ_EVENT_GFX_CAMPER` | 9,47 | `MOVEMENT_TYPE_FACE_UP_AND_LEFT` | `BattleFrontier_OutsideWest_EventScript_Camper` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 35,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_OutsideWest_EventScript_Lass` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_2` | 11,66 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_OutsideWest_EventScript_Man3` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 31,31 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_OutsideWest_EventScript_Fisherman1` | `0` |
| `LOCALID_FRONTIER_FISHERMAN_2` | `OBJ_EVENT_GFX_FISHERMAN` | 42,48 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `BattleFrontier_OutsideWest_EventScript_Fisherman2` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 38,22 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `BattleFrontier_OutsideWest_EventScript_FatMan2` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 12,9 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_OutsideWest_EventScript_Woman3` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 12,10 | `MOVEMENT_TYPE_FACE_UP` | `BattleFrontier_OutsideWest_EventScript_Boy2` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 11,10 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `BattleFrontier_OutsideWest_EventScript_OldMan` | `0` |
| `LOCALID_FRONTIER_MAN_4` | `OBJ_EVENT_GFX_MAN_4` | 8,5 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_OutsideWest_EventScript_Man4` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 4,26 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `BattleFrontier_OutsideWest_EventScript_PokefanF` | `0` |

## Warps (11)
- #0 (42,27) → `MAP_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY` warp #0
- #1 (19,17) → `MAP_BATTLE_FRONTIER_BATTLE_DOME_LOBBY` warp #0
- #2 (11,38) → `MAP_BATTLE_FRONTIER_BATTLE_FACTORY_LOBBY` warp #0
- #3 (45,44) → `MAP_BATTLE_FRONTIER_LOUNGE2` warp #0
- #4 (51,51) → `MAP_BATTLE_FRONTIER_MART` warp #0
- #5 (44,5) → `MAP_BATTLE_FRONTIER_SCOTTS_HOUSE` warp #0
- #6 (53,44) → `MAP_BATTLE_FRONTIER_LOUNGE4` warp #0
- #7 (5,20) → `MAP_BATTLE_FRONTIER_LOUNGE7` warp #0
- #8 (26,65) → `MAP_BATTLE_FRONTIER_RECEPTION_GATE` warp #0
- #9 (26,61) → `MAP_BATTLE_FRONTIER_RECEPTION_GATE` warp #1
- #10 (39,55) → `MAP_ARTISAN_CAVE_B1F` warp #0

## BG events / signs (5)
- (15,18) [sign] → `BattleFrontier_OutsideWest_EventScript_BattleDomeSign`
- (45,30) [sign] → `BattleFrontier_OutsideWest_EventScript_BattlePikeSign`
- (16,43) [sign] → `BattleFrontier_OutsideWest_EventScript_BattleFactorySign`
- (52,51) [sign] → `Common_EventScript_ShowPokemartSign`
- (53,51) [sign] → `Common_EventScript_ShowPokemartSign`

## Flags référencés (1)
- `FLAG_HIDE_BATTLE_TOWER_REPORTER`

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_BRAVO_TRAINER_BATTLE_TOWER_ON`
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_FerryDepartIsland`

## Scripts (50)
### BattleFrontier_OutsideWest_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, BattleFrontier_OutsideWest_OnTransition
```
### BattleFrontier_OutsideWest_OnTransition
```
setvar VAR_BRAVO_TRAINER_BATTLE_TOWER_ON, 0
setflag FLAG_HIDE_BATTLE_TOWER_REPORTER
end
```
### BattleFrontier_OutsideWest_EventScript_FerryAttendant
```
lock
faceplayer
msgbox BattleFrontier_OutsideWest_Text_MayISeeYourTicket, MSGBOX_DEFAULT
checkitem ITEM_SS_TICKET
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_OutsideWest_EventScript_NoSSTicket
message BattleFrontier_OutsideWest_Text_WhereWouldYouLikeToGo
waitmessage
goto BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination
end
```
### BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination
```
multichoicedefault 18, 6, MULTI_SSTIDAL_BATTLE_FRONTIER, 2, FALSE
switch VAR_RESULT
case 0, BattleFrontier_OutsideWest_EventScript_FerryToSlateport
case 1, BattleFrontier_OutsideWest_EventScript_FerryToLilycove
case 2, BattleFrontier_OutsideWest_EventScript_CancelFerrySelect
case MULTI_B_PRESSED, BattleFrontier_OutsideWest_EventScript_CancelFerrySelect
end
```
### BattleFrontier_OutsideWest_EventScript_NoSSTicket
```
msgbox BattleFrontier_OutsideWest_Text_MustHaveTicketToBoard, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_FerryToSlateport
```
msgbox BattleFrontier_OutsideWest_Text_SlateportItIs, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination
msgbox BattleFrontier_OutsideWest_Text_PleaseBoardFerry, MSGBOX_DEFAULT
call BattleFrontier_OutsideWest_EventScript_BoardFerry
warp MAP_SLATEPORT_CITY_HARBOR, 8, 11
waitstate
release
end
```
### BattleFrontier_OutsideWest_EventScript_FerryToLilycove
```
msgbox BattleFrontier_OutsideWest_Text_LilycoveItIs, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination
msgbox BattleFrontier_OutsideWest_Text_PleaseBoardFerry, MSGBOX_DEFAULT
call BattleFrontier_OutsideWest_EventScript_BoardFerry
warp MAP_LILYCOVE_CITY_HARBOR, 8, 11
waitstate
release
end
```
### BattleFrontier_OutsideWest_EventScript_ChooseNewFerryDestination
```
message BattleFrontier_OutsideWest_Text_ThenWhereWouldYouLikeToGo
waitmessage
goto BattleFrontier_OutsideWest_EventScript_ChooseFerryDestination
end
```
### BattleFrontier_OutsideWest_EventScript_BoardFerry
```
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 30
hideobjectat LOCALID_FRONTIER_FERRY_ATTENDANT, MAP_BATTLE_FRONTIER_OUTSIDE_WEST
setvar VAR_0x8004, LOCALID_FRONTIER_SS_TIDAL
call Common_EventScript_FerryDepartIsland
return
```
### BattleFrontier_OutsideWest_EventScript_CancelFerrySelect
```
msgbox BattleFrontier_OutsideWest_Text_SailWithUsAnotherTime, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_BattleDomeSign
```
msgbox BattleFrontier_OutsideWest_Text_BattleDomeSign, MSGBOX_SIGN
end
```
### BattleFrontier_OutsideWest_EventScript_BattleFactorySign
```
msgbox BattleFrontier_OutsideWest_Text_BattleFactorySign, MSGBOX_SIGN
end
```
### BattleFrontier_OutsideWest_EventScript_BattlePikeSign
```
msgbox BattleFrontier_OutsideWest_Text_BattlePikeSign, MSGBOX_SIGN
end
```
### BattleFrontier_OutsideWest_EventScript_UnusedNPC1
```
msgbox BattleFrontier_OutsideWest_Text_ThisIsBattleTower, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_UnusedNPC2
```
msgbox BattleFrontier_OutsideWest_Text_CantFindBattleTower, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Boy1
```
msgbox BattleFrontier_OutsideWest_Text_BestOutOfAllMyFriends, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Fisherman2
```
lock
faceplayer
message BattleFrontier_OutsideWest_Text_GotSeasickOnWayHere
waitmessage
applymovement LOCALID_FRONTIER_FISHERMAN_2, Common_Movement_FaceAwayPlayer
waitmovement 0
waitbuttonpress
release
end
```
### BattleFrontier_OutsideWest_EventScript_Man1
```
msgbox BattleFrontier_OutsideWest_Text_OnlyToughTrainersBroughtHere, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Maniac1
```
lock
goto BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk
end
```
### BattleFrontier_OutsideWest_EventScript_Maniac2
```
lock
goto BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk
end
```
### BattleFrontier_OutsideWest_EventScript_FactoryChallengersTalk
```
applymovement LOCALID_FRONTIER_MANIAC_1, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox BattleFrontier_OutsideWest_Text_SureWeCanChallengeWithNoMons, MSGBOX_DEFAULT
applymovement LOCALID_FRONTIER_MANIAC_2, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox BattleFrontier_OutsideWest_Text_BigGuySaidIllLendYouMons, MSGBOX_DEFAULT
closemessage
delay 25
applymovement LOCALID_FRONTIER_MANIAC_1, Common_Movement_WalkInPlaceFasterUp
applymovement LOCALID_FRONTIER_MANIAC_2, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
release
end
```
### BattleFrontier_OutsideWest_EventScript_Camper
```
lock
faceplayer
delay 20
call_if_eq VAR_FACING, DIR_NORTH, BattleFrontier_OutsideWest_EventScript_CamperFaceFactory
call_if_eq VAR_FACING, DIR_SOUTH, BattleFrontier_OutsideWest_EventScript_CamperAlreadyFacingFactory
call_if_eq VAR_FACING, DIR_WEST, BattleFrontier_OutsideWest_EventScript_CamperFaceFactory
call_if_eq VAR_FACING, DIR_EAST, BattleFrontier_OutsideWest_EventScript_CamperFaceFactory
msgbox BattleFrontier_OutsideWest_Text_WhosRaisingThoseRentalMons, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_CamperFaceFactory
```
applymovement LOCALID_FRONTIER_CAMPER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
return
```
### BattleFrontier_OutsideWest_EventScript_CamperAlreadyFacingFactory
```
return
```
### BattleFrontier_OutsideWest_EventScript_Girl
```
lock
faceplayer
message BattleFrontier_OutsideWest_Text_ScaredOfPikeBecauseSeviper
waitmessage
call_if_eq VAR_FACING, DIR_NORTH, BattleFrontier_OutsideWest_EventScript_GirlShudderNorth
call_if_eq VAR_FACING, DIR_SOUTH, BattleFrontier_OutsideWest_EventScript_GirlShudderSouth
call_if_eq VAR_FACING, DIR_WEST, BattleFrontier_OutsideWest_EventScript_GirlShudderWest
call_if_eq VAR_FACING, DIR_EAST, BattleFrontier_OutsideWest_EventScript_GirlShudderEast
waitbuttonpress
release
end
```
### BattleFrontier_OutsideWest_EventScript_GirlShudderNorth
```
applymovement LOCALID_FRONTIER_GIRL, BattleFrontier_OutsideWest_Movement_GirlShudderNorth
waitmovement 0
return
```
### BattleFrontier_OutsideWest_EventScript_GirlShudderSouth
```
applymovement LOCALID_FRONTIER_GIRL, BattleFrontier_OutsideWest_Movement_GirlShudderSouth
waitmovement 0
return
```
### BattleFrontier_OutsideWest_EventScript_GirlShudderWest
```
applymovement LOCALID_FRONTIER_GIRL, BattleFrontier_OutsideWest_Movement_GirlShudderWest
waitmovement 0
return
```
### BattleFrontier_OutsideWest_EventScript_GirlShudderEast
```
applymovement LOCALID_FRONTIER_GIRL, BattleFrontier_OutsideWest_Movement_GirlShudderEast
waitmovement 0
return
```
### BattleFrontier_OutsideWest_Movement_GirlShudderNorth
```
walk_in_place_faster_down
walk_in_place_faster_down
step_end
```
### BattleFrontier_OutsideWest_Movement_GirlShudderSouth
```
walk_in_place_faster_up
walk_in_place_faster_up
step_end
```
### BattleFrontier_OutsideWest_Movement_GirlShudderWest
```
walk_in_place_faster_right
walk_in_place_faster_right
step_end
```
### BattleFrontier_OutsideWest_Movement_GirlShudderEast
```
walk_in_place_faster_left
walk_in_place_faster_left
step_end
```
### BattleFrontier_OutsideWest_EventScript_Woman2
```
lock
faceplayer
msgbox BattleFrontier_OutsideWest_Text_LetsPlayRockPaperScissors, MSGBOX_DEFAULT
random 2
goto_if_eq VAR_RESULT, 1, BattleFrontier_OutsideWest_EventScript_WomanWonRockPaperScissors
goto BattleFrontier_OutsideWest_EventScript_WomanLostRockPaperScissors
end
```
### BattleFrontier_OutsideWest_EventScript_WomanWonRockPaperScissors
```
msgbox BattleFrontier_OutsideWest_Text_WonIllTakePikeChallenge, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_WomanLostRockPaperScissors
```
msgbox BattleFrontier_OutsideWest_Text_LostIllPutOffPikeChallenge, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_Fisherman1
```
msgbox BattleFrontier_OutsideWest_Text_ChooseFishingOverBattling, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_UnusedNPC3
```
msgbox BattleFrontier_OutsideWest_Text_DomeIsHereGrandpa, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Gentleman
```
msgbox BattleFrontier_OutsideWest_Text_YoureOffToChallengeDome, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Lass
```
msgbox BattleFrontier_OutsideWest_Text_KeepBattlingUntilIGetSymbol, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_ExpertM
```
msgbox BattleFrontier_OutsideWest_Text_WontLetGentlemenBeatMe, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Man2
```
msgbox BattleFrontier_OutsideWest_Text_NothingHereNotLongAgo, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Woman1
```
msgbox BattleFrontier_OutsideWest_Text_FinallyArrivedAtFrontier, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_FatMan1
```
msgbox BattleFrontier_OutsideWest_Text_SquareFilledWithToughPeople, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_FatMan2
```
msgbox BattleFrontier_OutsideWest_Text_MetOlderGirlAtPike, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Woman3
```
lock
msgbox BattleFrontier_OutsideWest_Text_LastTimeOurEyesMet, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_Boy2
```
lock
msgbox BattleFrontier_OutsideWest_Text_DomeAceLookedBecauseOfMyCheering, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_OutsideWest_EventScript_OldMan
```
msgbox BattleFrontier_OutsideWest_Text_DomeAceIsMine, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Man4
```
lock
faceplayer
msgbox BattleFrontier_OutsideWest_Text_FansOverThereUsedToBeTrainers, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_FRONTIER_MAN_4, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### BattleFrontier_OutsideWest_EventScript_PokefanF
```
msgbox BattleFrontier_OutsideWest_Text_MonWithLongTailInFrontier, MSGBOX_NPC
end
```

## Textes (37)
### BattleFrontier_OutsideWest_Text_BattleDomeSign
```
DOME DE COMBAT\n“La voie toute tracée vers la\lcélébrité!”$
```
### BattleFrontier_OutsideWest_Text_BattleFactorySign
```
USINE DE COMBAT\n“Nos POKéMON sont les plus forts!”$
```
### BattleFrontier_OutsideWest_Text_BattlePikeSign
```
REPTILE DE COMBAT\n“Choisissez un des trois chemins!”$
```
### BattleFrontier_OutsideWest_Text_ThisIsBattleTower
```
Voici la TOUR DE COMBAT.\pLes DRESSEURS y amènent leurs\nmeilleurs POKéMON pour participer à des\lmatchs éliminatoires.$
```
### BattleFrontier_OutsideWest_Text_MayISeeYourTicket
```
Bonjour, vous venez pour le ferry?\nPuis-je voir votre PASSE BATEAU?$
```
### BattleFrontier_OutsideWest_Text_MustHaveTicketToBoard
```
{PLAYER} n'a pas de PASSE BATEAU…\pJe suis absolument désolée.\pIl vous faut un PASSE pour embarquer\nà bord du ferry.$
```
### BattleFrontier_OutsideWest_Text_WhereWouldYouLikeToGo
```
{PLAYER} montre son PASSE BATEAU.\pParfait! Vous pouvez entrer!\pOù voulez-vous aller?$
```
### BattleFrontier_OutsideWest_Text_SlateportItIs
```
POIVRESSEL? C'est parti!$
```
### BattleFrontier_OutsideWest_Text_LilycoveItIs
```
NENUCRIQUE? C'est parti!$
```
### BattleFrontier_OutsideWest_Text_SailWithUsAnotherTime
```
Revenez nous voir une autre fois!$
```
### BattleFrontier_OutsideWest_Text_PleaseBoardFerry
```
Veuillez embarquer à bord du ferry et\nattendre le départ.$
```
### BattleFrontier_OutsideWest_Text_ThenWhereWouldYouLikeToGo
```
Alors, où voulez-vous aller?$
```
### BattleFrontier_OutsideWest_Text_BestOutOfAllMyFriends
```
Je suis meilleur que tous mes copains.\nMais ici…\lJe suis nul!$
```
### BattleFrontier_OutsideWest_Text_CantFindBattleTower
```
Je veux aller à la TOUR DE COMBAT,\nmais je ne la trouve pas. Pourtant, j'ai\lune carte de la ZONE DE COMBAT.\pCet endroit est vraiment immense!$
```
### BattleFrontier_OutsideWest_Text_GotSeasickOnWayHere
```
Mon intention était de relever un défi\ndès mon arrivée ici.\pMais en chemin, j'ai eu le mal de mer…\nUrrrrp…$
```
### BattleFrontier_OutsideWest_Text_OnlyToughTrainersBroughtHere
```
Tout le monde ne peut pas venir ici,\ntu sais.\pSeuls les DRESSEURS dont le talent\na été reconnu sont ici.\pBeaucoup de DRESSEURS n'ont jamais\nentendu parler de la ZONE DE COMBAT.$
```
### BattleFrontier_OutsideWest_Text_SureWeCanChallengeWithNoMons
```
Dis…\pTu penses qu'on peut participer même si\non n'a pas de POKéMON?$
```
### BattleFrontier_OutsideWest_Text_BigGuySaidIllLendYouMons
```
Heu…\nBen, c'est ce qu'on m'a dit.\pEnfin, je crois…\pEt tu te souviens de ce que m'a dit le\ncolosse?\pIl m'a dit qu'il me prêterait des\nPOKéMON!$
```
### BattleFrontier_OutsideWest_Text_WhosRaisingThoseRentalMons
```
C'est l'USINE DE COMBAT.\nTu peux y louer des POKéMON très forts.\pMais au fait… Je me demande\nqui élève ces POKéMON de location!?!$
```
### BattleFrontier_OutsideWest_Text_ScaredOfPikeBecauseSeviper
```
J'ai peur d'aller au REPTILE DE COMBAT\nà cause de SEVIPER…\pMais je ne suis pas venue ici pour rien!\nJe vais me battre!\l… J'ai peur…$
```
### BattleFrontier_OutsideWest_Text_LetsPlayRockPaperScissors
```
Jouons à pierre, papier, ciseaux!\nUn, deux, trois!\p… … … … … …$
```
### BattleFrontier_OutsideWest_Text_WonIllTakePikeChallenge
```
Oui! J'ai gagné! Je vais relever le défi\ndu REPTILE DE COMBAT!$
```
### BattleFrontier_OutsideWest_Text_LostIllPutOffPikeChallenge
```
Oh, non…\nJ'ai perdu.\pCe n'est pas mon jour de chance.\nJe vais attendre demain pour relever le\ldéfi du REPTILE DE COMBAT.$
```
### BattleFrontier_OutsideWest_Text_ChooseFishingOverBattling
```
Je suis persuadé que je suis la seule\npersonne ici qui préfère la pêche aux\lcombats.\pComment? Il n'y a rien à pêcher ici?\nC'est dommage, c'est un bel endroit…$
```
### BattleFrontier_OutsideWest_Text_KeepBattlingUntilIGetSymbol
```
Aujourd'hui, je n'arrêterai de combattre\nque quand j'aurai un symbole!$
```
### BattleFrontier_OutsideWest_Text_YoureOffToChallengeDome
```
Tu veux relever le défi du DOME DE\nCOMBAT?\pJe te souhaite bonne chance.\nCe serait amusant, si l'on se retrouvait\lface à face lors d'un combat.$
```
### BattleFrontier_OutsideWest_Text_DomeIsHereGrandpa
```
Papy, par ici!\nLe DOME DE COMBAT est là!\lVas-y, papy!$
```
### BattleFrontier_OutsideWest_Text_WontLetGentlemenBeatMe
```
C'est donc ça, le DOME DE COMBAT?\nAucun GENTLEMAN ne pourra me battre!\pMais où est l'entrée?$
```
### BattleFrontier_OutsideWest_Text_NothingHereNotLongAgo
```
Il n'y a pas si longtemps, il n'y avait\nrien à cet endroit.\pMais maintenant, regarde! Incroyable!\nIl faut que j'emmène ma mère ici.$
```
### BattleFrontier_OutsideWest_Text_FinallyArrivedAtFrontier
```
Je suis enfin arrivée à la ZONE DE\nCOMBAT!\pMon physique avantageux et ma\ntechnique me feront sûrement gagner!$
```
### BattleFrontier_OutsideWest_Text_SquareFilledWithToughPeople
```
Miam, miam…\pOn dirait que tout le monde est très\nfort ici.\pMiam, miam…$
```
### BattleFrontier_OutsideWest_Text_MetOlderGirlAtPike
```
Miam, miam…\pIl y a un certain temps, j'ai rencontré\ncette femme au REPTILE DE COMBAT.\pElle avait un regard effrayant, ça m'a\nfichu la frousse.\pMiam, miam…\pElle m'a hurlé dessus: “Arrête de\nmanger!” et s'est mise à rire!\pJ'en ai eu la chair de poule…\nJ'entends encore son rire…\pMiam, miam…$
```
### BattleFrontier_OutsideWest_Text_LastTimeOurEyesMet
```
Non mais, écoute ce que tu dis!\nÇa ne veut rien dire, ça!\pLors du dernier match, il m'a regardée\net j'ai vu des étincelles dans ses yeux!$
```
### BattleFrontier_OutsideWest_Text_DomeAceLookedBecauseOfMyCheering
```
Quoi???\nPfft!\pSi je n'avais pas été assis à côté de\ntoi, il ne t'aurait même pas regardée!\pCe sont mes encouragements qui ont\nattiré le regard de la STAR DU DOME!$
```
### BattleFrontier_OutsideWest_Text_DomeAceIsMine
```
Oh, chut!\nMettez-la un peu en sourdine!\pVous, les fans, vous devriez vous\ncontenter des CHAMPION D'ARENE!\pLa STAR DU DOME est à moi!\nC'est mon idole!$
```
### BattleFrontier_OutsideWest_Text_FansOverThereUsedToBeTrainers
```
Ces gens qui se disputent là-bas…\pC'est dur à croire, mais ils étaient\nDRESSEURS, avant. Ils étaient bons.\pIls avaient une force incroyable et ils\nétaient même célèbres!\pMais ils se sont fait écraser par un\nDRESSEUR lors d'un tournoi.\pLeur défaite a été telle qu'ils ont été\nsubjugués par lui.\pMaintenant, ce sont des fans.\nIls vont au DOME DE COMBAT\ltous les jours pour l'encourager.$
```
### BattleFrontier_OutsideWest_Text_MonWithLongTailInFrontier
```
Il paraît que quelqu'un a vu un POKéMON\navec une queue incroyablement\llongue dans la ZONE DE COMBAT.\pIl doit être adorable…\pLes défis peuvent bien attendre!\nJe vais tenter de trouver cette\lcharmante créature!$
```

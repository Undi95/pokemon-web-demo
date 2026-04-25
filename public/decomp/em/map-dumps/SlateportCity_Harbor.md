# SlateportCity_Harbor

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_HARBOR`
- **layout** : `LAYOUT_HARBOR`
- **music** : `MUS_SLATEPORT`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BEAUTY` | 8,10 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_Harbor_EventScript_FerryAttendant` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_PATRONS` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 4,12 | `MOVEMENT_TYPE_FACE_LEFT` | `SlateportCity_Harbor_EventScript_Sailor` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_PATRONS` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 1,12 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_Harbor_EventScript_FatMan` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_PATRONS` |
| `LOCALID_SLATEPORT_HARBOR_CAPT_STERN` | `OBJ_EVENT_GFX_SCIENTIST_1` | 6,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_Harbor_EventScript_CaptStern` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_CAPTAIN_STERN` |
| `LOCALID_SLATEPORT_HARBOR_SS_TIDAL` | `OBJ_EVENT_GFX_SS_TIDAL` | 8,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_SS_TIDAL` |
| `LOCALID_SLATEPORT_HARBOR_GRUNT` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 7,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_AQUA_GRUNT` |
| `LOCALID_SLATEPORT_HARBOR_ARCHIE` | `OBJ_EVENT_GFX_ARCHIE` | 8,10 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_ARCHIE` |
| `LOCALID_SLATEPORT_HARBOR_SUBMARINE` | `OBJ_EVENT_GFX_SUBMARINE_SHADOW` | 7,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_HARBOR_SUBMARINE_SHADOW` |

## Warps (4)
- #0 (11,14) → `MAP_SLATEPORT_CITY` warp #8
- #1 (12,14) → `MAP_SLATEPORT_CITY` warp #8
- #2 (19,15) → `MAP_SLATEPORT_CITY` warp #9
- #3 (20,15) → `MAP_SLATEPORT_CITY` warp #9

## Coord events / triggers (4)
- (8,11) → `SlateportCity_Harbor_EventScript_AquaEscapeTrigger0` (si `VAR_SLATEPORT_HARBOR_STATE` == `1`)
- (8,12) → `SlateportCity_Harbor_EventScript_AquaEscapeTrigger1` (si `VAR_SLATEPORT_HARBOR_STATE` == `1`)
- (8,13) → `SlateportCity_Harbor_EventScript_AquaEscapeTrigger2` (si `VAR_SLATEPORT_HARBOR_STATE` == `1`)
- (8,14) → `SlateportCity_Harbor_EventScript_AquaEscapeTrigger3` (si `VAR_SLATEPORT_HARBOR_STATE` == `1`)

## Flags référencés (14)
- `FLAG_BADGE07_GET`
- `FLAG_DEFEATED_GROUDON`
- `FLAG_DEFEATED_KYOGRE`
- `FLAG_EVIL_TEAM_ESCAPED_STERN_SPOKE`
- `FLAG_EXCHANGED_SCANNER`
- `FLAG_HIDE_AQUA_HIDEOUT_1F_GRUNT_1_BLOCKING_ENTRANCE`
- `FLAG_HIDE_AQUA_HIDEOUT_1F_GRUNT_2_BLOCKING_ENTRANCE`
- `FLAG_HIDE_LILYCOVE_MOTEL_SCOTT`
- `FLAG_HIDE_SLATEPORT_CITY_HARBOR_PATRONS`
- `FLAG_HIDE_SLATEPORT_CITY_HARBOR_SS_TIDAL`
- `FLAG_MET_SCOTT_ON_SS_TIDAL`
- `FLAG_MET_TEAM_AQUA_HARBOR`
- `FLAG_SYS_GAME_CLEAR`
- `FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8008`
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_SLATEPORT_HARBOR_STATE`
- `VAR_SS_TIDAL_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_FerryDepart`

## Scripts (50)
### SlateportCity_Harbor_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SlateportCity_Harbor_OnTransition
```
### SlateportCity_Harbor_OnTransition
```
setescapewarp MAP_SLATEPORT_CITY, 28, 13
setvar VAR_TEMP_1, 0
call_if_eq VAR_SLATEPORT_HARBOR_STATE, 1, SlateportCity_Harbor_EventScript_ReadyAquaEscapeScene
call_if_set FLAG_SYS_GAME_CLEAR, SlateportCity_Harbor_EventScript_ShowSSTidal
end
```
### SlateportCity_Harbor_EventScript_ShowSSTidal
```
clearflag FLAG_HIDE_SLATEPORT_CITY_HARBOR_SS_TIDAL
return
```
### SlateportCity_Harbor_EventScript_ReadyAquaEscapeScene
```
savebgm MUS_ENCOUNTER_AQUA
setobjectxyperm LOCALID_SLATEPORT_HARBOR_CAPT_STERN, 12, 13
setobjectmovementtype LOCALID_SLATEPORT_HARBOR_CAPT_STERN, MOVEMENT_TYPE_FACE_LEFT
setflag FLAG_HIDE_SLATEPORT_CITY_HARBOR_PATRONS
return
```
### SlateportCity_Harbor_EventScript_AquaEscapeTrigger0
```
lockall
setvar VAR_0x8008, 0
goto SlateportCity_Harbor_EventScript_AquaEscapeScene
end
```
### SlateportCity_Harbor_EventScript_AquaEscapeTrigger1
```
lockall
setvar VAR_0x8008, 1
goto SlateportCity_Harbor_EventScript_AquaEscapeScene
end
```
### SlateportCity_Harbor_EventScript_AquaEscapeTrigger2
```
lockall
setvar VAR_0x8008, 2
goto SlateportCity_Harbor_EventScript_AquaEscapeScene
end
```
### SlateportCity_Harbor_EventScript_AquaEscapeTrigger3
```
lockall
setvar VAR_0x8008, 3
applymovement LOCALID_PLAYER, SlateportCity_Harbor_Movement_PlayerWalkUp
waitmovement 0
goto SlateportCity_Harbor_EventScript_AquaEscapeScene
end
```
### SlateportCity_Harbor_EventScript_AquaEscapeScene
```
applymovement LOCALID_SLATEPORT_HARBOR_ARCHIE, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
applymovement LOCALID_SLATEPORT_HARBOR_GRUNT, Common_Movement_WalkInPlaceFasterDown
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox SlateportCity_Harbor_Text_ArchieYouAgainHideoutInLilycove, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_HARBOR_GRUNT, SlateportCity_Harbor_Movement_AquaBoardSub
applymovement LOCALID_SLATEPORT_HARBOR_ARCHIE, SlateportCity_Harbor_Movement_AquaBoardSub
applymovement LOCALID_SLATEPORT_HARBOR_SUBMARINE, SlateportCity_Harbor_Movement_SubmarineExit
waitmovement 0
removeobject LOCALID_SLATEPORT_HARBOR_GRUNT
removeobject LOCALID_SLATEPORT_HARBOR_ARCHIE
removeobject LOCALID_SLATEPORT_HARBOR_SUBMARINE
setvar VAR_SLATEPORT_HARBOR_STATE, 2
setflag FLAG_MET_TEAM_AQUA_HARBOR
setflag FLAG_HIDE_LILYCOVE_MOTEL_SCOTT
call_if_eq VAR_0x8008, 0, SlateportCity_Harbor_EventScript_SternApproachPlayer0
call_if_eq VAR_0x8008, 1, SlateportCity_Harbor_EventScript_SternApproachPlayer1
call_if_eq VAR_0x8008, 2, SlateportCity_Harbor_EventScript_SternApproachPlayer
call_if_eq VAR_0x8008, 3, SlateportCity_Harbor_EventScript_SternApproachPlayer
msgbox SlateportCity_Harbor_Text_CaptSternWhyStealMySubmarine, MSGBOX_DEFAULT
closemessage
setflag FLAG_HIDE_AQUA_HIDEOUT_1F_GRUNT_1_BLOCKING_ENTRANCE
setflag FLAG_HIDE_AQUA_HIDEOUT_1F_GRUNT_2_BLOCKING_ENTRANCE
copyobjectxytoperm LOCALID_SLATEPORT_HARBOR_CAPT_STERN
setobjectmovementtype LOCALID_SLATEPORT_HARBOR_CAPT_STERN, MOVEMENT_TYPE_FACE_RIGHT
releaseall
end
```
### SlateportCity_Harbor_EventScript_SternApproachPlayer0
```
applymovement LOCALID_SLATEPORT_HARBOR_CAPT_STERN, SlateportCity_Harbor_Movement_SternApproachPlayer0
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### SlateportCity_Harbor_EventScript_SternApproachPlayer1
```
applymovement LOCALID_SLATEPORT_HARBOR_CAPT_STERN, SlateportCity_Harbor_Movement_SternApproachPlayer1
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
return
```
### SlateportCity_Harbor_EventScript_SternApproachPlayer
```
applymovement LOCALID_SLATEPORT_HARBOR_CAPT_STERN, SlateportCity_Harbor_Movement_SternApproachPlayer
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
return
```
### SlateportCity_Harbor_Movement_AquaBoardSub
```
delay_16
delay_16
jump_up
set_invisible
step_end
```
### SlateportCity_Harbor_Movement_ArchieBoardSub
```
delay_16
delay_16
jump_up
set_invisible
step_end
```
### SlateportCity_Harbor_Movement_SubmarineExit
```
delay_16
delay_16
delay_16
delay_16
walk_right
walk_right
walk_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
step_end
```
### SlateportCity_Harbor_Movement_SternApproachPlayer0
```
walk_left
walk_left
walk_left
walk_left
walk_up
step_end
```
### SlateportCity_Harbor_Movement_SternApproachPlayer1
```
walk_left
walk_left
walk_up
walk_left
step_end
```
### SlateportCity_Harbor_Movement_SternApproachPlayer
```
walk_left
walk_left
walk_left
step_end
```
### SlateportCity_Harbor_Movement_PlayerWalkUp
```
walk_up
step_end
```
### SlateportCity_Harbor_EventScript_FerryAttendant
```
lock
faceplayer
goto_if_set FLAG_SYS_GAME_CLEAR, SlateportCity_Harbor_EventScript_AskForTicket
msgbox SlateportCity_Harbor_Text_FerryServiceUnavailable, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_AskForTicket
```
msgbox SlateportCity_Harbor_Text_MayISeeYourTicket, MSGBOX_DEFAULT
message SlateportCity_Harbor_Text_FlashedTicketWhereTo
waitmessage
goto SlateportCity_Harbor_EventScript_ChooseDestination
end
```
### SlateportCity_Harbor_EventScript_ChooseDestination
```
goto_if_set FLAG_MET_SCOTT_ON_SS_TIDAL, SlateportCity_Harbor_EventScript_ChooseDestinationWithBattleFrontier
multichoicedefault 18, 8, MULTI_SSTIDAL_SLATEPORT_NO_BF, 2, FALSE
switch VAR_RESULT
case 0, SlateportCity_Harbor_EventScript_Lilycove
case 1, SlateportCity_Harbor_EventScript_CancelDestinationSelect
case MULTI_B_PRESSED, SlateportCity_Harbor_EventScript_CancelDestinationSelect
end
```
### SlateportCity_Harbor_EventScript_ChooseDestinationWithBattleFrontier
```
multichoicedefault 17, 6, MULTI_SSTIDAL_SLATEPORT_WITH_BF, 2, FALSE
switch VAR_RESULT
case 0, SlateportCity_Harbor_EventScript_Lilycove
case 1, SlateportCity_Harbor_EventScript_BattleFrontier
case 2, SlateportCity_Harbor_EventScript_CancelDestinationSelect
case MULTI_B_PRESSED, SlateportCity_Harbor_EventScript_CancelDestinationSelect
end
```
### SlateportCity_Harbor_EventScript_NoTicket
```
msgbox SlateportCity_Harbor_Text_YouMustHaveTicket, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_Lilycove
```
msgbox SlateportCity_Harbor_Text_LilycoveItIs, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SlateportCity_Harbor_EventScript_ChooseNewDestination
setvar VAR_SS_TIDAL_STATE, SS_TIDAL_BOARD_SLATEPORT
call SlateportCity_Harbor_EventScript_BoardFerry
warp MAP_SS_TIDAL_CORRIDOR, 1, 10
waitstate
release
end
```
### SlateportCity_Harbor_EventScript_BattleFrontier
```
msgbox SlateportCity_Harbor_Text_BattleFrontierItIs, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SlateportCity_Harbor_EventScript_ChooseNewDestination
call SlateportCity_Harbor_EventScript_BoardFerry
warp MAP_BATTLE_FRONTIER_OUTSIDE_WEST, 19, 67
waitstate
release
end
```
### SlateportCity_Harbor_EventScript_ChooseNewDestination
```
message SlateportCity_Harbor_Text_WhereWouldYouLikeToGo
waitmessage
goto SlateportCity_Harbor_EventScript_ChooseDestination
end
```
### SlateportCity_Harbor_EventScript_BoardFerry
```
msgbox SlateportCity_Harbor_Text_PleaseBoardFerry, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
delay 30
hideobjectat VAR_LAST_TALKED, MAP_SLATEPORT_CITY_HARBOR
call_if_eq VAR_FACING, DIR_NORTH, SlateportCity_Harbor_EventScript_BoardFerryNorth
call_if_eq VAR_FACING, DIR_EAST, SlateportCity_Harbor_EventScript_BoardFerryEast
delay 30
hideplayer
setvar VAR_0x8004, LOCALID_SLATEPORT_HARBOR_SS_TIDAL
call Common_EventScript_FerryDepart
return
```
### SlateportCity_Harbor_EventScript_CancelDestinationSelect
```
msgbox SlateportCity_Harbor_Text_SailAnotherTime, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_BoardFerryEast
```
applymovement LOCALID_PLAYER, SlateportCity_Harbor_Movement_BoardFerryEast
waitmovement 0
return
```
### SlateportCity_Harbor_EventScript_BoardFerryNorth
```
applymovement LOCALID_PLAYER, SlateportCity_Harbor_Movement_BoardFerryNorth
waitmovement 0
return
```
### SlateportCity_Harbor_Movement_BoardFerryEast
```
walk_right
walk_in_place_faster_up
step_end
```
### SlateportCity_Harbor_Movement_BoardFerryNorth
```
walk_up
step_end
```
### SlateportCity_Harbor_EventScript_Sailor
```
lock
faceplayer
goto_if_unset FLAG_SYS_GAME_CLEAR, SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather
setvar VAR_0x8004, 0
call_if_set FLAG_DEFEATED_KYOGRE, SlateportCity_Harbor_EventScript_CountDefeatedLegendary
call_if_set FLAG_DEFEATED_GROUDON, SlateportCity_Harbor_EventScript_CountDefeatedLegendary
goto_if_eq VAR_0x8004, 2, SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather  @ Defeated both
msgbox SlateportCity_Harbor_Text_AbnormalWeather, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_SailorNoAbnormalWeather
```
msgbox SlateportCity_Harbor_Text_LoveToGoDeepUnderwaterSomeday, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_CountDefeatedLegendary
```
addvar VAR_0x8004, 1
return
```
### SlateportCity_Harbor_EventScript_FatMan
```
msgbox SlateportCity_Harbor_Text_SubTooSmallForMe, MSGBOX_NPC
end
```
### SlateportCity_Harbor_EventScript_CaptStern
```
lock
faceplayer
goto_if_set FLAG_BADGE07_GET, SlateportCity_Harbor_EventScript_CaptSternFerryOrScannerComment
goto_if_set FLAG_EVIL_TEAM_ESCAPED_STERN_SPOKE, SlateportCity_Harbor_EventScript_NeedDive
goto_if_set FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE, SlateportCity_Harbor_EventScript_TeamAquaLeftNeedDive
goto_if_eq VAR_SLATEPORT_HARBOR_STATE, 2, SlateportCity_Harbor_EventScript_WhyStealSubmarine
msgbox SlateportCity_Harbor_Text_SameThugsTriedToRobAtMuseum, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_Harbor_EventScript_WhyStealSubmarine
```
msgbox SlateportCity_Harbor_Text_CaptSternWhyStealMySubmarine, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_TeamAquaLeftNeedDive
```
setflag FLAG_EVIL_TEAM_ESCAPED_STERN_SPOKE
msgbox SlateportCity_Harbor_Text_TeamAquaLeftNeedDive, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_NeedDive
```
msgbox SlateportCity_Harbor_Text_NeedDiveToCatchSub, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_CaptSternFerryOrScannerComment
```
goto_if_eq VAR_TEMP_1, 1, SlateportCity_Harbor_EventScript_TradedScanner
checkitem ITEM_SCANNER
goto_if_eq VAR_RESULT, TRUE, SlateportCity_Harbor_EventScript_AskToTradeScanner
goto_if_set FLAG_SYS_GAME_CLEAR, SlateportCity_Harbor_EventScript_FerryFinished
msgbox SlateportCity_Harbor_Text_WontBeLongBeforeWeFinishFerry, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_FerryFinished
```
msgbox SlateportCity_Harbor_Text_FinishedMakingFerry, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_AskToTradeScanner
```
message SlateportCity_Harbor_Text_WouldYouTradeScanner
waitmessage
goto SlateportCity_Harbor_EventScript_ChooseScannerTrade
end
```
### SlateportCity_Harbor_EventScript_ChooseScannerTrade
```
multichoice 0, 0, MULTI_STERN_DEEPSEA, FALSE
switch VAR_RESULT
case 0, SlateportCity_Harbor_EventScript_DeepSeaTooth
case 1, SlateportCity_Harbor_EventScript_DeepSeaScale
case 2, SlateportCity_Harbor_EventScript_DeclineTrade
case MULTI_B_PRESSED, SlateportCity_Harbor_EventScript_DeclineTrade
end
```
### SlateportCity_Harbor_EventScript_DeepSeaTooth
```
msgbox SlateportCity_Harbor_Text_TradeForDeepSeaTooth, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SlateportCity_Harbor_EventScript_ChooseDifferentTrade
giveitem ITEM_DEEP_SEA_TOOTH
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
removeitem ITEM_SCANNER
msgbox SlateportCity_Harbor_Text_HandedScannerToStern, MSGBOX_DEFAULT
setflag FLAG_EXCHANGED_SCANNER
goto SlateportCity_Harbor_EventScript_TradedScanner
end
```
### SlateportCity_Harbor_EventScript_DeepSeaScale
```
msgbox SlateportCity_Harbor_Text_TradeForDeepSeaScale, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SlateportCity_Harbor_EventScript_ChooseDifferentTrade
giveitem ITEM_DEEP_SEA_SCALE
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
removeitem ITEM_SCANNER
msgbox SlateportCity_Harbor_Text_HandedScannerToStern, MSGBOX_DEFAULT
setflag FLAG_EXCHANGED_SCANNER
goto SlateportCity_Harbor_EventScript_TradedScanner
end
```
### SlateportCity_Harbor_EventScript_DeclineTrade
```
msgbox SlateportCity_Harbor_Text_IfYouWantToTradeLetMeKnow, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Harbor_EventScript_ChooseDifferentTrade
```
message SlateportCity_Harbor_Text_WhichOneDoYouWant
waitmessage
goto SlateportCity_Harbor_EventScript_ChooseScannerTrade
end
```
### SlateportCity_Harbor_EventScript_TradedScanner
```
setvar VAR_TEMP_1, 1
msgbox SlateportCity_Harbor_Text_ThisWillHelpResearch, MSGBOX_DEFAULT
release
end
```

## Textes (26)
### SlateportCity_Harbor_Text_FerryServiceUnavailable
```
Je vous demande pardon?\nVous cherchez un bateau?\pDésolée, vous ne pouvez pas embarquer\nsur le ferry pour le moment.$
```
### SlateportCity_Harbor_Text_MayISeeYourTicket
```
Bonjour. C'est pour le ferry?\nPuis-je voir votre PASSE BATEAU?$
```
### SlateportCity_Harbor_Text_YouMustHaveTicket
```
{PLAYER} n'a pas le PASSE BATEAU…\pJe suis désolée.\pIl vous faut un PASSE BATEAU pour\nembarquer sur le ferry.$
```
### SlateportCity_Harbor_Text_FlashedTicketWhereTo
```
{PLAYER} montre le PASSE BATEAU…\pParfait! Tout y est!\pEt où souhaitez-vous aller?$
```
### SlateportCity_Harbor_Text_SailAnotherTime
```
Revenez une autre fois!$
```
### SlateportCity_Harbor_Text_LilycoveItIs
```
Alors, cap sur NENUCRIQUE?$
```
### SlateportCity_Harbor_Text_BattleFrontierItIs
```
Cap sur la ZONE DE COMBAT!$
```
### SlateportCity_Harbor_Text_PleaseBoardFerry
```
Veuillez monter sur le ferry et\nattendre le départ.$
```
### SlateportCity_Harbor_Text_WhereWouldYouLikeToGo
```
Alors, où souhaiteriez-vous aller?$
```
### SlateportCity_Harbor_Text_LoveToGoDeepUnderwaterSomeday
```
Un voyage au fond de la mer…\nJe me demande comment c'est.\pUn jour, j'aimerais bien aller comme ça,\ndans les profondeurs de la mer.$
```
### SlateportCity_Harbor_Text_AbnormalWeather
```
Pour appareiller en toute sécurité,\nnous devons d'abord consulter la météo!\pEn parlant de ça, j'ai appris quelque\nchose d'une personne travaillant\lau CENTRE METEO.\pDes changements climatiques\nimportants auraient été reportés\lun peu partout!\pTu devrais aller faire un tour au\nCENTRE METEO et te renseigner!$
```
### SlateportCity_Harbor_Text_SubTooSmallForMe
```
Je voulais accompagner le CAPT. POUPE\ndans son exploration des fonds marins.\pMais le sous-marin est trop petit.\pSi j'avais embarqué, il n'y aurait plus eu\nassez de place pour le CAPITAINE…$
```
### SlateportCity_Harbor_Text_SameThugsTriedToRobAtMuseum
```
CAPT. POUPE: Ces brutes…\pCe sont eux qui ont tenté de voler\nle PACK DEVON au MUSEE.$
```
### SlateportCity_Harbor_Text_ArchieYouAgainHideoutInLilycove
```
ARTHUR: Oh?\nEncore toi!\pTu nous as suivis jusqu'ici! Tu\nn'abandonnes donc jamais?\pMais maintenant…\npersonne ne peut nous arrêter!\pOu peut-être comptes-tu nous suivre\ndans notre PLANQUE à NENUCRIQUE?\pAh, ah, ah, ah…$
```
### SlateportCity_Harbor_Text_CaptSternWhyStealMySubmarine
```
CAPT. POUPE: Pourquoi…\pPourquoi la TEAM AQUA voudrait-elle\nvoler mon SOUS-MARIN D'EXPLORATION 1?\pIls ne peuvent pas s'intéresser au\nPOKéMON qui sommeille au fond\lde l'océan…\pDe toute façon, même si je voulais les\npoursuivre, je n'aurais aucune chance…$
```
### SlateportCity_Harbor_Text_TeamAquaLeftNeedDive
```
CAPT. POUPE: Oh, {PLAYER}{KUN}…\pBon… Alors la TEAM AQUA s'est enfuie\navant que tu ne puisses l'arrêter…\pOh, non, tu n'as rien à te reprocher!\nCe n'est pas de ta faute.\pTenter de rattraper un sous-marin…\nC'est impossible pour beaucoup de gens.\pIl aurait fallu que tu aies un POKéMON\nconnaissant PLONGEE.\pSi tu te rendais à ALGATIA,\npeut-être que…\pDe nombreux plongeurs vivent là-bas,\nquelqu'un pourrait t'apprendre…$
```
### SlateportCity_Harbor_Text_NeedDiveToCatchSub
```
CAPT. POUPE: Tenter de rattraper un\nsous-marin… C'est impossible!\pIl aurait fallu que tu aies un POKéMON\nconnaissant PLONGEE.\pSi tu te rendais à ALGATIA,\npeut-être que…\pDe nombreux plongeurs vivent là-bas,\nquelqu'un pourrait t'apprendre…$
```
### SlateportCity_Harbor_Text_WontBeLongBeforeWeFinishFerry
```
CAPT. POUPE: Oh, oui.\nM. MARCO est passé au CHANTIER NAVAL.\pÇa ne va plus prendre très longtemps\nmaintenant pour finir le ferry!$
```
### SlateportCity_Harbor_Text_FinishedMakingFerry
```
CAPT. POUPE: {PLAYER}{KUN}!\pOn a enfin fini le ferry LE MARINA!\pOn n'aurait jamais pu l'achever\nsans ton ami M. MARCO. \pVa donc faire une petite croisière!$
```
### SlateportCity_Harbor_Text_WouldYouTradeScanner
```
CAPT. POUPE: Oh?\n{PLAYER}{KUN}, cet objet que tu as…\pC'est un SCANNER! Ça nous aiderait\ncertainement pour nos explorations.\p{PLAYER}{KUN}, voudrais-tu échanger ton\nSCANNER contre autre chose?\pComme, disons, une DENT OCEAN\nou une ECAILLEOCEAN par exemple?$
```
### SlateportCity_Harbor_Text_IfYouWantToTradeLetMeKnow
```
CAPT. POUPE: C'est sûr?\nÇa ne te sert à rien, {PLAYER}{KUN}…\pBon, d'accord alors. Si tu veux échanger\nton SCANNER, fais-moi signe!$
```
### SlateportCity_Harbor_Text_TradeForDeepSeaTooth
```
CAPT. POUPE: Tu veux bien l'échanger\ncontre ma DENT OCEAN?$
```
### SlateportCity_Harbor_Text_TradeForDeepSeaScale
```
CAPT. POUPE: Tu veux bien l'échanger\ncontre mon ECAILLEOCEAN?$
```
### SlateportCity_Harbor_Text_WhichOneDoYouWant
```
CAPT. POUPE: Lequel veux-tu?$
```
### SlateportCity_Harbor_Text_HandedScannerToStern
```
{PLAYER} remet le SCANNER au\nCAPT. POUPE.$
```
### SlateportCity_Harbor_Text_ThisWillHelpResearch
```
CAPT. POUPE: Merci, {PLAYER}{KUN}!\nÇa va nous aider dans nos recherches!$
```

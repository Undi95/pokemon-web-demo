# BattleFrontier_BattleArenaLobby

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_ARENA_LOBBY`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_ARENA_LOBBY`
- **music** : `MUS_B_ARENA`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_ARENA_ATTENDANT` | `OBJ_EVENT_GFX_BLACK_BELT` | 7,7 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattleArenaLobby_EventScript_Attendant` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 2,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattleArenaLobby_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 14,11 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_BattleArenaLobby_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 14,12 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_BattleArenaLobby_EventScript_Camper` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 14,10 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_BattleArenaLobby_EventScript_Youngster` | `0` |

## Warps (1)
- #0 (7,12) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #1

## BG events / signs (2)
- (5,9) [sign] → `BattleFrontier_BattleArenaLobby_EventScript_ShowResults`
- (1,7) [sign] → `BattleFrontier_BattleArenaLobby_EventScript_RulesBoard`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_FRONTIER_BATTLE_MODE`
- `VAR_FRONTIER_FACILITY`
- `VAR_RESULT`
- `VAR_TEMP_1`
- `VAR_TEMP_CHALLENGE_STATUS`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BattleFrontier_EventScript_GetCantRecordBattle`
- `BattleFrontier_EventScript_GetLvlMode`
- `BattleFrontier_EventScript_SaveBattle`
- `BattleFrontier_Text_ObtainedXBattlePoints`
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (47)
### BattleFrontier_BattleArenaLobby_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattleArenaLobby_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattleArenaLobby_OnWarp
```
### BattleFrontier_BattleArenaLobby_OnWarp
```
map_script_2 VAR_TEMP_1, 0, BattleFrontier_BattleArenaLobby_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattleArenaLobby_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_1, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### BattleFrontier_BattleArenaLobby_OnFrame
```
map_script_2 VAR_TEMP_CHALLENGE_STATUS, 0, BattleFrontier_BattleArenaLobby_EventScript_GetChallengeStatus
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING, BattleFrontier_BattleArenaLobby_EventScript_QuitWithoutSaving
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_PAUSED, BattleFrontier_BattleArenaLobby_EventScript_ResumeChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_WON, BattleFrontier_BattleArenaLobby_EventScript_WonChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST, BattleFrontier_BattleArenaLobby_EventScript_LostChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_GetChallengeStatus
```
frontier_getstatus
end
```
### BattleFrontier_BattleArenaLobby_EventScript_QuitWithoutSaving
```
lockall
msgbox BattleFrontier_BattleArenaLobby_Text_DidntSaveBeforeShuttingDown, MSGBOX_DEFAULT
closemessage
arena_set ARENA_DATA_WIN_STREAK, 0
arena_set ARENA_DATA_WIN_STREAK_ACTIVE, FALSE
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattleArenaLobby_EventScript_WonChallenge
```
lockall
frontier_isbrain
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattleArenaLobby_EventScript_DefeatedTycoon
msgbox BattleFrontier_BattleArenaLobby_Text_CongratsOnSevenWins, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_GiveBattlePoints
```
### BattleFrontier_BattleArenaLobby_EventScript_DefeatedTycoon
```
msgbox BattleFrontier_BattleArenaLobby_Text_CongratsOnDefeatingTycoon, MSGBOX_DEFAULT
```
### BattleFrontier_BattleArenaLobby_EventScript_GiveBattlePoints
```
msgbox BattleFrontier_BattleArenaLobby_Text_PleaseAcceptBattlePoints, MSGBOX_DEFAULT
frontier_givepoints
msgbox BattleFrontier_Text_ObtainedXBattlePoints, MSGBOX_GETPOINTS
message BattleFrontier_BattleArenaLobby_Text_RecordAchievement
waitmessage
call BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge
msgbox BattleFrontier_BattleArenaLobby_Text_AwaitAnotherChallenge2, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattleArenaLobby_EventScript_LostChallenge
```
lockall
message BattleFrontier_BattleArenaLobby_Text_ThankYouWaitWhileSave
waitmessage
arena_set ARENA_DATA_WIN_STREAK_ACTIVE, FALSE
call BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge
msgbox BattleFrontier_BattleArenaLobby_Text_AwaitAnotherChallenge2, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattleArenaLobby_EventScript_SaveAfterChallenge
```
frontier_checkairshow
special LoadPlayerParty
special HealPlayerParty
arena_save 0
playse SE_SAVE
waitse
call BattleFrontier_EventScript_GetCantRecordBattle
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge
message BattleFrontier_BattleArenaLobby_Text_RecordLastMatch
waitmessage
multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
switch VAR_RESULT
case 1, BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge
case 0, BattleFrontier_BattleArenaLobby_EventScript_RecordMatch
case MULTI_B_PRESSED, BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_RecordMatch
```
call BattleFrontier_EventScript_SaveBattle
```
### BattleFrontier_BattleArenaLobby_EventScript_EndSaveAfterChallenge
```
return
```
### BattleFrontier_BattleArenaLobby_EventScript_ResumeChallenge
```
lockall
message BattleFrontier_BattleArenaLobby_Text_LookingForwardToArrivalSaveGame
waitmessage
arena_save CHALLENGE_STATUS_SAVING
playse SE_SAVE
waitse
frontier_set FRONTIER_DATA_PAUSED, FALSE
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto BattleFrontier_BattleArenaLobby_EventScript_EnterChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_Attendant
```
lock
faceplayer
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_ARENA
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
special SavePlayerParty
msgbox BattleFrontier_BattleArenaLobby_Text_WelcomeToBattleArena, MSGBOX_DEFAULT
```
### BattleFrontier_BattleArenaLobby_EventScript_AskTakeChallenge
```
message BattleFrontier_BattleArenaLobby_Text_WishToTakeChallenge
waitmessage
multichoice 17, 6, MULTI_CHALLENGEINFO, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattleArenaLobby_EventScript_TryEnterChallenge
case 1, BattleFrontier_BattleArenaLobby_EventScript_ExplainChallenge
case 2, BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_TryEnterChallenge
```
message BattleFrontier_BattleArenaLobby_Text_WhichLevelMode
waitmessage
multichoice 17, 6, MULTI_LEVEL_MODE, FALSE
switch VAR_RESULT
case FRONTIER_LVL_TENT, BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge
frontier_checkineligible
goto_if_eq VAR_0x8004, TRUE, BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMons
frontier_set FRONTIER_DATA_LVL_MODE, VAR_RESULT
msgbox BattleFrontier_BattleArenaLobby_Text_SelectThreeMons, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
call BattleFrontier_EventScript_GetLvlMode
copyvar VAR_0x8004, VAR_RESULT
setvar VAR_0x8005, FRONTIER_PARTY_SIZE
special ChoosePartyForBattleFrontier
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge
msgbox BattleFrontier_BattleArenaLobby_Text_OkayToSave, MSGBOX_YESNO
switch VAR_RESULT
case NO, BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge
case YES, BattleFrontier_BattleArenaLobby_EventScript_SaveBeforeChallenge
case MULTI_B_PRESSED, BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_SaveBeforeChallenge
```
setvar VAR_TEMP_CHALLENGE_STATUS, 0
frontier_set FRONTIER_DATA_SELECTED_MON_ORDER
arena_init
arena_set ARENA_DATA_WIN_STREAK_ACTIVE, TRUE
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING
frontier_set FRONTIER_DATA_PAUSED, FALSE
special LoadPlayerParty
closemessage
delay 2
call Common_EventScript_SaveGame
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattleArenaLobby_EventScript_CancelChallengeSaveFailed
```
### BattleFrontier_BattleArenaLobby_EventScript_EnterChallenge
```
special SavePlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
msgbox BattleFrontier_BattleArenaLobby_Text_GuideYouToArena, MSGBOX_DEFAULT
closemessage
frontier_get FRONTIER_DATA_LVL_MODE
call_if_eq VAR_RESULT, FRONTIER_LVL_50, BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLv50
call_if_eq VAR_RESULT, FRONTIER_LVL_OPEN, BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLvOpen
warp MAP_BATTLE_FRONTIER_BATTLE_ARENA_CORRIDOR, 9, 13
setvar VAR_TEMP_CHALLENGE_STATUS, 0
waitstate
end
```
### BattleFrontier_BattleArenaLobby_EventScript_ExplainChallenge
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainChallenge, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_AskTakeChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMons
```
switch VAR_RESULT
case FRONTIER_LVL_50, BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLv50
case FRONTIER_LVL_OPEN, BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLvOpen
```
### BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLv50
```
msgbox BattleFrontier_BattleArenaLobby_Text_NotEnoughValidMonsLv50, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_NotEnoughValidMonsLvOpen
```
msgbox BattleFrontier_BattleArenaLobby_Text_NotEnoughValidMonsLvOpen, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_CancelChallengeSaveFailed
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
goto BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattleArenaLobby_EventScript_LoadPartyAndCancelChallenge
```
special LoadPlayerParty
```
### BattleFrontier_BattleArenaLobby_EventScript_CancelChallenge
```
msgbox BattleFrontier_BattleArenaLobby_Text_AwaitAnotherChallenge, MSGBOX_DEFAULT
```
### BattleFrontier_BattleArenaLobby_EventScript_EndCancelChallenge
```
release
end
```
### BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLv50
```
applymovement LOCALID_ARENA_ATTENDANT, BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToLeftDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToLeftDoor
waitmovement 0
opendoor 2, 2
waitdooranim
applymovement LOCALID_ARENA_ATTENDANT, BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor
waitmovement 0
closedoor 2, 2
waitdooranim
return
```
### BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToLeftDoor
```
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
### BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor
```
walk_up
set_invisible
step_end
```
### BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToLeftDoor
```
walk_up
walk_up
walk_up
walk_up
walk_left
walk_left
walk_left
walk_left
walk_left
walk_in_place_faster_up
step_end
```
### BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor
```
walk_up
walk_up
set_invisible
step_end
```
### BattleFrontier_BattleArenaLobby_EventScript_WalkToDoorLvOpen
```
applymovement LOCALID_ARENA_ATTENDANT, BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToRightDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToRightDoor
waitmovement 0
opendoor 11, 2
waitdooranim
applymovement LOCALID_ARENA_ATTENDANT, BattleFrontier_BattleArenaLobby_Movement_AttendantEnterDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleArenaLobby_Movement_PlayerEnterDoor
waitmovement 0
closedoor 11, 2
waitdooranim
return
```
### BattleFrontier_BattleArenaLobby_Movement_AttendantWalkToRightDoor
```
walk_up
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_up
step_end
```
### BattleFrontier_BattleArenaLobby_Movement_PlayerWalkToRightDoor
```
walk_up
walk_up
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### BattleFrontier_BattleArenaLobby_EventScript_ShowResults
```
lockall
frontier_results FRONTIER_FACILITY_ARENA
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_BattleArenaLobby_EventScript_Youngster
```
msgbox BattleFrontier_BattleArenaLobby_Text_BadIdeaToNotAttack, MSGBOX_NPC
end
```
### BattleFrontier_BattleArenaLobby_EventScript_Man
```
msgbox BattleFrontier_BattleArenaLobby_Text_LandingHitsWorked, MSGBOX_NPC
end
```
### BattleFrontier_BattleArenaLobby_EventScript_Camper
```
msgbox BattleFrontier_BattleArenaLobby_Text_MatchWasDeclaredDraw, MSGBOX_NPC
end
```
### BattleFrontier_BattleArenaLobby_EventScript_Woman
```
msgbox BattleFrontier_BattleArenaLobby_Text_OrderOfMonsImportant, MSGBOX_NPC
end
```
### BattleFrontier_BattleArenaLobby_EventScript_RulesBoard
```
lockall
msgbox BattleFrontier_BattleArenaLobby_Text_RulesAreListed, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard
```
message BattleFrontier_BattleArenaLobby_Text_ReadWhichHeading
waitmessage
multichoice 17, 2, MULTI_BATTLE_ARENA_RULES, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattleArenaLobby_EventScript_BattleRules
case 1, BattleFrontier_BattleArenaLobby_EventScript_MindRules
case 2, BattleFrontier_BattleArenaLobby_EventScript_SkillRules
case 3, BattleFrontier_BattleArenaLobby_EventScript_BodyRules
case 4, BattleFrontier_BattleArenaLobby_EventScript_ExitRules
case MULTI_B_PRESSED, BattleFrontier_BattleArenaLobby_EventScript_ExitRules
end
```
### BattleFrontier_BattleArenaLobby_EventScript_BattleRules
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainBattleRules, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleArenaLobby_EventScript_MindRules
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainMindRules, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleArenaLobby_EventScript_SkillRules
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainSkillRules, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleArenaLobby_EventScript_BodyRules
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainBodyRules, MSGBOX_DEFAULT
goto BattleFrontier_BattleArenaLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleArenaLobby_EventScript_ExitRules
```
releaseall
end
```

## Textes (32)
### BattleFrontier_BattleArenaLobby_Text_WelcomeToBattleArena
```
Bienvenue au DOJO DE COMBAT!\pIci, nous mettons à l'épreuve\nle cran des DRESSEURS!\pJe serai votre guide pour le\nTOURNOI K.O.!$
```
### BattleFrontier_BattleArenaLobby_Text_WishToTakeChallenge
```
Voulez-vous relever le défi du\nDOJO DE COMBAT?$
```
### BattleFrontier_BattleArenaLobby_Text_AwaitAnotherChallenge
```
Nous espérons que vous relèverez\nbientôt notre défi!$
```
### BattleFrontier_BattleArenaLobby_Text_ExplainChallenge
```
Au DOJO DE COMBAT, vous participez à un\nTOURNOI K.O.\pLes participants s'inscrivent avec une\néquipe de trois POKéMON.\pCes POKéMON doivent être placés dans\nl'ordre dans lequel ils apparaîtront.\pPendant un combat, ils apparaîtront\nl'un après l'autre dans l'ordre\lprédéfini.\pUn POKéMON qui entre au combat doit\ny rester jusqu'à la fin.\pS'il n'y a pas de vainqueur au bout de\ntrois tours, l'ARBITRE intervient.\pSi vous voulez interrompre le défi,\nveuillez sauvegarder la partie.\pSi vous ne sauvegardez pas, vous ne\npourrez pas reprendre ce défi.\pSi vous mettez K.O. sept DRESSEURS\nà la suite, nous vous remettons des\lPOINTS DE COMBAT.$
```
### BattleFrontier_BattleArenaLobby_Text_OkayToSave
```
Avant de me suivre dans le DOJO DE\nCOMBAT, vous devez sauvegarder. OK?$
```
### BattleFrontier_BattleArenaLobby_Text_WhichLevelMode
```
Au DOJO DE COMBAT, vous avez le choix\nentre niveau 50 et niveau libre.\lQue choisissez-vous?$
```
### BattleFrontier_BattleArenaLobby_Text_SelectThreeMons
```
Veuillez choisir les trois POKéMON que\nvous souhaitez inscrire.$
```
### BattleFrontier_BattleArenaLobby_Text_NotEnoughValidMonsLvOpen
```
Je regrette, cher DRESSEUR!\pVous n'avez pas trois POKéMON\naptes à participer.\pIl vous faut trois POKéMON différents\npour participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut.$
```
### BattleFrontier_BattleArenaLobby_Text_NotEnoughValidMonsLv50
```
Je regrette, cher DRESSEUR!\pVous n'avez pas trois POKéMON\naptes à participer.\pIl vous faut trois POKéMON différents\npour participer.\pIl vous faut trois POKéMON différents\nde niveau 50 ou moins pour participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut.$
```
### BattleFrontier_BattleArenaLobby_Text_GuideYouToArena
```
Suivez-moi dans le DOJO DE COMBAT.$
```
### BattleFrontier_BattleArenaLobby_Text_DidntSaveBeforeShuttingDown
```
Je regrette, cher DRESSEUR!\pVous n'avez pas sauvegardé avant de\nquitter votre dernier défi.\pDans ce cas, c'est la disqualification.\nQuel dommage!\pBien entendu, vous pouvez recommencer\nun autre défi.$
```
### BattleFrontier_BattleArenaLobby_Text_CongratsOnSevenWins
```
Toutes mes félicitations! Vous avez\nbattu sept DRESSEURS à la suite!$
```
### BattleFrontier_BattleArenaLobby_Text_RecordAchievement
```
Votre performance va être sauvegardée.\nVeuillez patienter.$
```
### BattleFrontier_BattleArenaLobby_Text_PresentYouWithPrize
```
In commemoration of your 7-win streak,\nwe present you with this prize.$
```
### BattleFrontier_BattleArenaLobby_Text_ReceivedPrize
```
{PLAYER} received the prize\n{STR_VAR_1}.$
```
### BattleFrontier_BattleArenaLobby_Text_BagFullReturnForPrize
```
Oh?\nYour BAG seems to be full.\pI urge you to clear space and\nreturn for your prize.$
```
### BattleFrontier_BattleArenaLobby_Text_ThankYouWaitWhileSave
```
Merci d'avoir participé!\pVotre résultat va être sauvegardé.\nVeuillez patienter.$
```
### BattleFrontier_BattleArenaLobby_Text_AwaitAnotherChallenge2
```
J'espère vous revoir bientôt au DOJO DE\nCOMBAT.$
```
### BattleFrontier_BattleArenaLobby_Text_LookingForwardToArrivalSaveGame
```
Nous vous attendions!\pVous devez sauvegarder avant de me\nsuivre dans le DOJO DE COMBAT.\lVeuillez patienter.$
```
### BattleFrontier_BattleArenaLobby_Text_RecordLastMatch
```
J'enregistre votre dernier combat au\nDOJO DE COMBAT sur votre PASSE ZONE?$
```
### BattleFrontier_BattleArenaLobby_Text_BadIdeaToNotAttack
```
J'ai perdu sur décision de l'ARBITRE…\nJ'aurais dû attaquer…\pMais je n'ai utilisé que des capacités\ndéfensives…$
```
### BattleFrontier_BattleArenaLobby_Text_LandingHitsWorked
```
J'ai gagné sur décision de l'ARBITRE!\pJe n'ai pas arrêté de porter des coups\net ça lui a plu!$
```
### BattleFrontier_BattleArenaLobby_Text_MatchWasDeclaredDraw
```
Le combat a été déclaré nul.\pIl ne restait plus de temps et mes\nPOKéMON et ceux de l'adversaire\lavaient le même niveau de PV.$
```
### BattleFrontier_BattleArenaLobby_Text_OrderOfMonsImportant
```
Dans le DOJO DE COMBAT, l'ordre\ndes POKéMON est très important.\pSi ton premier POKéMON a certains\npoints faibles liés à son type, ton\ldeuxième POKéMON doit les compenser,\lpar exemple.\pÇa permet de créer une équipe efficace.$
```
### BattleFrontier_BattleArenaLobby_Text_RulesAreListed
```
Règles du TOURNOI K.O.$
```
### BattleFrontier_BattleArenaLobby_Text_ReadWhichHeading
```
Quel chapitre voulez-vous lire?$
```
### BattleFrontier_BattleArenaLobby_Text_ExplainBattleRules
```
Le TOURNOI K.O. n'a pas les mêmes règles\nque les combats normaux.\pTout d'abord, un combat ne dure que\ntrois tours.\pS'il n'y a pas de vainqueur au bout de\ntrois tours, l'ARBITRE intervient.\pL'ARBITRE basera son choix sur la façon\ndont les POKéMON ont combattu.\pAussi, un POKéMON qui entre au combat\ndoit y rester jusqu'à la fin.$
```
### BattleFrontier_BattleArenaLobby_Text_ExplainMindRules
```
Le premier critère de jugement\nest le “mental”.\lC'est l'agressivité des concurrents.\pCela dépend du nombre de capacités\noffensives qui ont été utilisées.$
```
### BattleFrontier_BattleArenaLobby_Text_ExplainSkillRules
```
Le second critère de jugement est\nla “technique”.\lC'est l'efficacité avec laquelle les\lPOKéMON utilisent leurs capacités.\pSi une capacité est réussie, le\nniveau de technique augmente.\pSi une capacité a échoué, le niveau de\ntechnique diminue.\pPour une capacité offensive, le niveau\nde technique augmente si la capacité\lest “super efficace” et diminue\lsi elle n'est “pas très efficace”.\pLes capacités telles qu'ABRI et\nDETECTION ne comptent pas.\pSi l'adversaire a utilisé ABRI ou\nDETECTION et que l'attaque de votre\lPOKéMON n'a pas pu l'atteindre, son\lniveau de technique ne descend pas.$
```
### BattleFrontier_BattleArenaLobby_Text_ExplainBodyRules
```
Le troisième critère de jugement est\nle “physique”.\lIl dépend du nombre de PV restant\là la fin du combat.\pCela prend en compte les PV que le\nPOKéMON avait au début et ceux qui\llui restent à la fin.$
```
### BattleFrontier_BattleArenaLobby_Text_CongratsOnDefeatingTycoon
```
Vous avez arraché la victoire à la\nPRO DU DOJO et battu sept DRESSEURS!\pFélicitations pour cette magnifique\nperformance!$
```
### BattleFrontier_BattleArenaLobby_Text_PleaseAcceptBattlePoints
```
Cher DRESSEUR, votre cran vous\nrapporte des POINTS DE COMBAT.$
```

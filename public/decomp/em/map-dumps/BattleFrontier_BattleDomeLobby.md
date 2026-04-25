# BattleFrontier_BattleDomeLobby

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_DOME_LOBBY`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_DOME_LOBBY`
- **music** : `MUS_B_DOME_LOBBY`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_DOME_ATTENDANT_SINGLES` | `OBJ_EVENT_GFX_TEALA` | 5,10 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattleDomeLobby_EventScript_SinglesAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 1,11 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattleDomeLobby_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 14,14 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattleDomeLobby_EventScript_Lass` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 18,14 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattleDomeLobby_EventScript_FatMan` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 8,14 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattleDomeLobby_EventScript_Maniac` | `0` |
| `LOCALID_DOME_ATTENDANT_DOUBLES` | `OBJ_EVENT_GFX_TEALA` | 17,10 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattleDomeLobby_EventScript_DoublesAttendant` | `0` |

## Warps (2)
- #0 (11,16) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #1
- #1 (12,16) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #1

## BG events / signs (4)
- (4,10) [sign] → `BattleFrontier_BattleDomeLobby_EventScript_ShowSinglesResults`
- (7,10) [sign] → `BattleFrontier_BattleDomeLobby_EventScript_ShowPrevTourneyTree`
- (18,10) [sign] → `BattleFrontier_BattleDomeLobby_EventScript_ShowDoublesResults`
- (15,10) [sign] → `BattleFrontier_BattleDomeLobby_EventScript_RulesBoard`

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
- `BattleFrontier_EventScript_IncrementWinStreak`
- `BattleFrontier_EventScript_SaveBattle`
- `BattleFrontier_Text_ObtainedXBattlePoints`
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (68)
### BattleFrontier_BattleDomeLobby_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, BattleFrontier_BattleDomeLobby_OnResume
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattleDomeLobby_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattleDomeLobby_OnWarp
```
### BattleFrontier_BattleDomeLobby_OnResume
```
dome_initresultstree
end
```
### BattleFrontier_BattleDomeLobby_OnWarp
```
map_script_2 VAR_TEMP_1, 0, BattleFrontier_BattleDomeLobby_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattleDomeLobby_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_1, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### BattleFrontier_BattleDomeLobby_OnFrame
```
map_script_2 VAR_TEMP_CHALLENGE_STATUS, 0, BattleFrontier_BattleDomeLobby_EventScript_GetChallengeStatus
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING, BattleFrontier_BattleDomeLobby_EventScript_QuitWithoutSaving
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_PAUSED, BattleFrontier_BattleDomeLobby_EventScript_ResumeChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_WON, BattleFrontier_BattleDomeLobby_EventScript_WonChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST, BattleFrontier_BattleDomeLobby_EventScript_LostChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_GetChallengeStatus
```
frontier_getstatus
end
```
### BattleFrontier_BattleDomeLobby_EventScript_QuitWithoutSaving
```
lockall
msgbox BattleFrontier_BattleDomeLobby_Text_DidntSaveBeforeQuitting, MSGBOX_DEFAULT
closemessage
dome_set DOME_DATA_WIN_STREAK, 0
dome_set DOME_DATA_WIN_STREAK_ACTIVE, FALSE
dome_set DOME_DATA_ATTEMPTED_CHALLENGE, TRUE
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattleDomeLobby_EventScript_WonChallenge
```
call BattleFrontier_EventScript_IncrementWinStreak
lockall
frontier_isbrain
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattleDomeLobby_EventScript_DefeatedAce
msgbox BattleFrontier_BattleDomeLobby_Text_CongratsForWinningTourney, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_GiveBattlePoints
```
### BattleFrontier_BattleDomeLobby_EventScript_DefeatedAce
```
msgbox BattleFrontier_BattleDomeLobby_Text_CongratsDefeatedTucker, MSGBOX_DEFAULT
```
### BattleFrontier_BattleDomeLobby_EventScript_GiveBattlePoints
```
msgbox BattleFrontier_BattleDomeLobby_Text_AwardTheseBattlePoints, MSGBOX_DEFAULT
frontier_givepoints
msgbox BattleFrontier_Text_ObtainedXBattlePoints, MSGBOX_GETPOINTS
message BattleFrontier_BattleDomeLobby_Text_RecordWillBeSaved
waitmessage
special LoadPlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
frontier_checkairshow
dome_set DOME_DATA_ATTEMPTED_CHALLENGE, TRUE
dome_set DOME_DATA_HAS_WON_CHALLENGE, TRUE
dome_set DOME_DATA_WIN_STREAK_ACTIVE, TRUE
special LoadPlayerParty
special HealPlayerParty
goto BattleFrontier_BattleDomeLobby_EventScript_AskRecordBattle
```
### BattleFrontier_BattleDomeLobby_EventScript_LostChallenge
```
lockall
msgbox BattleFrontier_BattleDomeLobby_Text_ThankYouForPlaying, MSGBOX_DEFAULT
message BattleFrontier_BattleDomeLobby_Text_RecordWillBeSaved
waitmessage
special LoadPlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
frontier_checkairshow
dome_set DOME_DATA_WIN_STREAK_ACTIVE, FALSE
dome_set DOME_DATA_ATTEMPTED_CHALLENGE, TRUE
special LoadPlayerParty
special HealPlayerParty
```
### BattleFrontier_BattleDomeLobby_EventScript_AskRecordBattle
```
dome_save 0
playse SE_SAVE
waitse
call BattleFrontier_EventScript_GetCantRecordBattle
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattleDomeLobby_EventScript_EndChallenge
message BattleFrontier_BattleDomeLobby_Text_RecordLastMatch
waitmessage
multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
switch VAR_RESULT
case 1, BattleFrontier_BattleDomeLobby_EventScript_EndChallenge
case 0, BattleFrontier_BattleDomeLobby_EventScript_RecordBattle
case MULTI_B_PRESSED, BattleFrontier_BattleDomeLobby_EventScript_EndChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_RecordBattle
```
call BattleFrontier_EventScript_SaveBattle
```
### BattleFrontier_BattleDomeLobby_EventScript_EndChallenge
```
msgbox BattleFrontier_BattleDomeLobby_Text_HopeToSeeYouAgain, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattleDomeLobby_EventScript_ResumeChallenge
```
lockall
msgbox BattleFrontier_BattleDomeLobby_Text_WeveBeenWaitingForYou, MSGBOX_DEFAULT
message BattleFrontier_BattleDomeLobby_Text_OkayToSaveBeforeChallenge2
waitmessage
dome_save CHALLENGE_STATUS_SAVING
playse SE_SAVE
waitse
frontier_set FRONTIER_DATA_PAUSED, FALSE
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto BattleFrontier_BattleDomeLobby_EventScript_EnterChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_SinglesAttendant
```
lock
faceplayer
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_DOME
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
goto BattleFrontier_BattleDomeLobby_EventScript_AttendantWelcome
end
```
### BattleFrontier_BattleDomeLobby_EventScript_DoublesAttendant
```
lock
faceplayer
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_DOME
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES
goto BattleFrontier_BattleDomeLobby_EventScript_AttendantWelcome
end
```
### BattleFrontier_BattleDomeLobby_EventScript_AttendantWelcome
```
special SavePlayerParty
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_WelcomeSingles
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_WelcomeDoubles
```
### BattleFrontier_BattleDomeLobby_EventScript_AskTakeChallenge
```
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_TakeSinglesChallenge
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_TakeDoublesChallenge
waitmessage
multichoice 17, 6, MULTI_CHALLENGEINFO, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattleDomeLobby_EventScript_TryEnterChallenge
case 1, BattleFrontier_BattleDomeLobby_EventScript_ExplainChallenge
case 2, BattleFrontier_BattleDomeLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattleDomeLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_TryEnterChallenge
```
message BattleFrontier_BattleDomeLobby_Text_WhichLevelMode
waitmessage
multichoice 17, 6, MULTI_LEVEL_MODE, FALSE
switch VAR_RESULT
case FRONTIER_LVL_TENT, BattleFrontier_BattleDomeLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattleDomeLobby_EventScript_CancelChallenge
frontier_checkineligible
goto_if_eq VAR_0x8004, TRUE, BattleFrontier_BattleDomeLobby_EventScript_NotEnoughValidMons
frontier_set FRONTIER_DATA_LVL_MODE, VAR_RESULT
msgbox BattleFrontier_BattleDomeLobby_Text_SelectThreeMons, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
call BattleFrontier_EventScript_GetLvlMode
copyvar VAR_0x8004, VAR_RESULT
setvar VAR_0x8005, FRONTIER_PARTY_SIZE
special ChoosePartyForBattleFrontier
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattleDomeLobby_EventScript_LoadPartyCancelChallenge
msgbox BattleFrontier_BattleDomeLobby_Text_OkayToSaveBeforeChallenge, MSGBOX_YESNO
switch VAR_RESULT
case NO, BattleFrontier_BattleDomeLobby_EventScript_LoadPartyCancelChallenge
case YES, BattleFrontier_BattleDomeLobby_EventScript_SaveBeforeChallenge
case MULTI_B_PRESSED, BattleFrontier_BattleDomeLobby_EventScript_LoadPartyCancelChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_SaveBeforeChallenge
```
setvar VAR_TEMP_CHALLENGE_STATUS, 0
frontier_set FRONTIER_DATA_SELECTED_MON_ORDER
dome_init
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING
frontier_set FRONTIER_DATA_PAUSED, FALSE
special LoadPlayerParty
closemessage
delay 2
call Common_EventScript_SaveGame
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattleDomeLobby_EventScript_CancelChallengeSaveFailed
dome_inittrainers
```
### BattleFrontier_BattleDomeLobby_EventScript_EnterChallenge
```
special SavePlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
dome_settrainers
msgbox BattleFrontier_BattleDomeLobby_Text_ShowYouToBattleDome, MSGBOX_DEFAULT
closemessage
call BattleFrontier_BattleDomeLobby_EventScript_WalkToDoor
special HealPlayerParty
warp MAP_BATTLE_FRONTIER_BATTLE_DOME_CORRIDOR, 23, 6
setvar VAR_TEMP_CHALLENGE_STATUS, 0
waitstate
end
```
### BattleFrontier_BattleDomeLobby_EventScript_ExplainChallenge
```
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_ExplainSinglesChallenge
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_ExplainDoublesChallenge
goto BattleFrontier_BattleDomeLobby_EventScript_AskTakeChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_NotEnoughValidMons
```
switch VAR_RESULT
case FRONTIER_LVL_50, BattleFrontier_BattleDomeLobby_EventScript_NotEnoughValidMonsLv50
case FRONTIER_LVL_OPEN, BattleFrontier_BattleDomeLobby_EventScript_NotEnoughValidMonsLvOpen
```
### BattleFrontier_BattleDomeLobby_EventScript_NotEnoughValidMonsLv50
```
msgbox BattleFrontier_BattleDomeLobby_Text_NotEnoughValidMonsLv50, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_NotEnoughValidMonsLvOpen
```
msgbox BattleFrontier_BattleDomeLobby_Text_NotEnoughValidMonsLvOpen, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_CancelChallengeSaveFailed
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
goto BattleFrontier_BattleDomeLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattleDomeLobby_EventScript_LoadPartyCancelChallenge
```
special LoadPlayerParty
```
### BattleFrontier_BattleDomeLobby_EventScript_CancelChallenge
```
msgbox BattleFrontier_BattleDomeLobby_Text_HopeToSeeYouAgain, MSGBOX_DEFAULT
```
### BattleFrontier_BattleDomeLobby_EventScript_EndCancelChallenge
```
release
end
```
### BattleFrontier_BattleDomeLobby_EventScript_WalkToDoor
```
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_SinglesAttendantWalkToDoor
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_DoublesAttendantWalkToDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleDomeLobby_Movement_WalkToDoor
waitmovement 0
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_OpenSinglesDoor
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_OpenDoublesDoor
waitdooranim
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_SinglesAttendantEnterDoor
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_DoublesAttendantEnterDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattleDomeLobby_Movement_PlayerEnterDoor
waitmovement 0
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattleDomeLobby_EventScript_CloseSinglesDoor
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattleDomeLobby_EventScript_CloseDoublesDoor
waitdooranim
return
```
### BattleFrontier_BattleDomeLobby_EventScript_SinglesAttendantWalkToDoor
```
applymovement LOCALID_DOME_ATTENDANT_SINGLES, BattleFrontier_BattleDomeLobby_Movement_WalkToDoor
return
```
### BattleFrontier_BattleDomeLobby_EventScript_DoublesAttendantWalkToDoor
```
applymovement LOCALID_DOME_ATTENDANT_DOUBLES, BattleFrontier_BattleDomeLobby_Movement_WalkToDoor
return
```
### BattleFrontier_BattleDomeLobby_EventScript_SinglesAttendantEnterDoor
```
applymovement LOCALID_DOME_ATTENDANT_SINGLES, BattleFrontier_BattleDomeLobby_Movement_AttendantEnterDoor
return
```
### BattleFrontier_BattleDomeLobby_EventScript_DoublesAttendantEnterDoor
```
applymovement LOCALID_DOME_ATTENDANT_DOUBLES, BattleFrontier_BattleDomeLobby_Movement_AttendantEnterDoor
return
```
### BattleFrontier_BattleDomeLobby_EventScript_WelcomeSingles
```
msgbox BattleFrontier_BattleDomeLobby_Text_WelcomeSingleBattle, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattleDomeLobby_EventScript_WelcomeDoubles
```
msgbox BattleFrontier_BattleDomeLobby_Text_WelcomeDoubleBattle, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattleDomeLobby_EventScript_TakeSinglesChallenge
```
message BattleFrontier_BattleDomeLobby_Text_TakeSinglesChallenge
return
```
### BattleFrontier_BattleDomeLobby_EventScript_TakeDoublesChallenge
```
message BattleFrontier_BattleDomeLobby_Text_TakeDoublesChallenge
return
```
### BattleFrontier_BattleDomeLobby_EventScript_ExplainSinglesChallenge
```
msgbox BattleFrontier_BattleDomeLobby_Text_ExplainSinglesChallenge, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattleDomeLobby_EventScript_ExplainDoublesChallenge
```
msgbox BattleFrontier_BattleDomeLobby_Text_ExplainDoublesChallenge, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattleDomeLobby_EventScript_OpenSinglesDoor
```
opendoor 5, 4
return
```
### BattleFrontier_BattleDomeLobby_EventScript_OpenDoublesDoor
```
opendoor 17, 4
return
```
### BattleFrontier_BattleDomeLobby_EventScript_CloseSinglesDoor
```
closedoor 5, 4
return
```
### BattleFrontier_BattleDomeLobby_EventScript_CloseDoublesDoor
```
closedoor 17, 4
return
```
### BattleFrontier_BattleDomeLobby_Movement_WalkToDoor
```
walk_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### BattleFrontier_BattleDomeLobby_Movement_AttendantEnterDoor
```
walk_up
set_invisible
step_end
```
### BattleFrontier_BattleDomeLobby_Movement_PlayerEnterDoor
```
walk_up
walk_up
set_invisible
step_end
```
### BattleFrontier_BattleDomeLobby_EventScript_ShowSinglesResults
```
lockall
frontier_results FRONTIER_FACILITY_DOME, FRONTIER_MODE_SINGLES
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_BattleDomeLobby_EventScript_ShowDoublesResults
```
lockall
frontier_results FRONTIER_FACILITY_DOME, FRONTIER_MODE_DOUBLES
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_BattleDomeLobby_EventScript_ShowPrevTourneyTree
```
dome_get DOME_DATA_PREV_TOURNEY_TYPE
call_if_eq VAR_RESULT, 0, BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsSinglesLv50
call_if_eq VAR_RESULT, 1, BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsDoublesLv50
call_if_eq VAR_RESULT, 2, BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsSinglesLvOpen
call_if_eq VAR_RESULT, 3, BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsDoublesLvOpen
fadescreen FADE_TO_BLACK
dome_showprevtourneytree
waitstate
end
```
### BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsSinglesLv50
```
msgbox BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsSinglesLv50, MSGBOX_SIGN
return
```
### BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsDoublesLv50
```
msgbox BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsDoublesLv50, MSGBOX_SIGN
return
```
### BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsSinglesLvOpen
```
msgbox BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsSinglesLvOpen, MSGBOX_SIGN
return
```
### BattleFrontier_BattleDomeLobby_EventScript_PrevTourneyResultsDoublesLvOpen
```
msgbox BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsDoublesLvOpen, MSGBOX_SIGN
return
```
### BattleFrontier_BattleDomeLobby_EventScript_Maniac
```
dome_getwinnersname
msgbox BattleFrontier_BattleDomeLobby_Text_LastWinnerWasTough, MSGBOX_NPC
end
```
### BattleFrontier_BattleDomeLobby_EventScript_Lass
```
msgbox BattleFrontier_BattleDomeLobby_Text_WinnersGainReputation, MSGBOX_NPC
end
```
### BattleFrontier_BattleDomeLobby_EventScript_FatMan
```
msgbox BattleFrontier_BattleDomeLobby_Text_TrashedInFirstRound, MSGBOX_NPC
end
```
### BattleFrontier_BattleDomeLobby_EventScript_Man
```
msgbox BattleFrontier_BattleDomeLobby_Text_NeedToCheckOpponentCarefully, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_Man3
```
msgbox BattleFrontier_OutsideWest_Text_LongDreamedAboutBattleFrontier, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_BattleDomeSign2
```
msgbox BattleFrontier_OutsideWest_Text_BattleDomeSign2, MSGBOX_NPC
end
```
### BattleFrontier_OutsideWest_EventScript_UnderConstructionSign
```
msgbox BattleFrontier_OutsideWest_Text_QuestionMarkUnderConstruction, MSGBOX_NPC
end
```
### BattleFrontier_BattleDomeLobby_EventScript_RulesBoard
```
lockall
msgbox BattleFrontier_BattleDomeLobby_Text_RulesAreListed, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleDomeLobby_EventScript_ReadRulesBoard
```
message BattleFrontier_BattleDomeLobby_Text_ReadWhichHeading
waitmessage
multichoice 17, 4, MULTI_BATTLE_DOME_RULES, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattleDomeLobby_EventScript_RulesMatchup
case 1, BattleFrontier_BattleDomeLobby_EventScript_RulesTourneyTree
case 2, BattleFrontier_BattleDomeLobby_EventScript_RulesDoubleKO
case 3, BattleFrontier_BattleDomeLobby_EventScript_ExitRules
case MULTI_B_PRESSED, BattleFrontier_BattleDomeLobby_EventScript_ExitRules
end
```
### BattleFrontier_BattleDomeLobby_EventScript_RulesMatchup
```
msgbox BattleFrontier_BattleDomeLobby_Text_ExplainMatchupRules, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleDomeLobby_EventScript_RulesTourneyTree
```
msgbox BattleFrontier_BattleDomeLobby_Text_ExplainTourneyTree, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleDomeLobby_EventScript_RulesDoubleKO
```
msgbox BattleFrontier_BattleDomeLobby_Text_ExplainDoubleKORules, MSGBOX_DEFAULT
goto BattleFrontier_BattleDomeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattleDomeLobby_EventScript_ExitRules
```
releaseall
end
```

## Textes (41)
### BattleFrontier_BattleDomeLobby_Text_WelcomeSingleBattle
```
Bienvenue au DOME DE COMBAT!\pIci, nous mettons à l'épreuve\nla tactique des DRESSEURS!\pJe serai votre guide pour le\nTOURNOI DE COMBAT SOLO.$
```
### BattleFrontier_BattleDomeLobby_Text_TakeSinglesChallenge
```
Voulez-vous participer à un TOURNOI\nDE COMBAT SOLO?$
```
### BattleFrontier_BattleDomeLobby_Text_HopeToSeeYouAgain
```
A une prochaine fois peut-être!$
```
### BattleFrontier_BattleDomeLobby_Text_ExplainSinglesChallenge
```
Le TOURNOI DE COMBAT SOLO est, comme\nson nom l'indique, un tournoi constitué\lde COMBATS SOLO.\pTous les DRESSEURS qui y participent\ndoivent avoir trois POKéMON.\pLors des combats, l'un des trois\nPOKéMON est gardé en réserve.\pLes deux autres POKéMON peuvent se\nbattrent l'un après l'autre.\pEtudiez les trois POKéMON de\nl'adversaire avant de choisir les deux\lPOKéMON que vous envoyez au combat.\pVous devez vaincre quatre DRESSEURS\npour remporter le tournoi.\pDes POINTS DE COMBAT sont remis\nau vainqueur du tournoi.\pSi vous voulez interrompre le défi,\nveuillez sauvegarder la partie.\pAssurez-vous de bien sauvegarder, ou\nvous ne pourrez pas reprendre le défi.$
```
### BattleFrontier_BattleDomeLobby_Text_OkayToSaveBeforeChallenge
```
Avant de pouvoir me suivre dans le DOME\nDE COMBAT, vous devez sauvegarder. OK?$
```
### BattleFrontier_BattleDomeLobby_Text_WhichLevelMode
```
Le tournoi propose deux niveaux de\ndéfi: niveau 50 et niveau libre.\lQue choisissez-vous?$
```
### BattleFrontier_BattleDomeLobby_Text_SelectThreeMons
```
Veuillez choisir les trois POKéMON que\nvous souhaitez inscrire.$
```
### BattleFrontier_BattleDomeLobby_Text_NotEnoughValidMonsLvOpen
```
Je regrette!\pVous n'avez pas trois POKéMON\naptes à participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut.$
```
### BattleFrontier_BattleDomeLobby_Text_NotEnoughValidMonsLv50
```
Je regrette!\pVous n'avez pas trois POKéMON\naptes à participer.\pIl vous faut trois POKéMON différents\nde niveau 50 ou moins pour participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut.$
```
### BattleFrontier_BattleDomeLobby_Text_ShowYouToBattleDome
```
Veuillez me suivre dans le\nDOME DE COMBAT.$
```
### BattleFrontier_BattleDomeLobby_Text_DidntSaveBeforeQuitting
```
Je regrette!\pVous n'avez pas sauvegardé avant de\nquitter votre dernier défi.\pDans ce cas, c'est la disqualification.\nC'est dommage!$
```
### BattleFrontier_BattleDomeLobby_Text_CongratsForWinningTourney
```
Félicitations pour avoir remporté ce\nTOURNOI DE COMBAT!$
```
### BattleFrontier_BattleDomeLobby_Text_HereIsYourPrize
```
Here is your prize for your Battle\nTournament victory.$
```
### BattleFrontier_BattleDomeLobby_Text_ReceivedPrize
```
{PLAYER} reçoit {STR_VAR_1}\nen récompense.$
```
### BattleFrontier_BattleDomeLobby_Text_BagFullMakeRoom
```
Oh, your BAG appears to be full.\pPlease make room in your BAG, then come\nsee me.$
```
### BattleFrontier_BattleDomeLobby_Text_ThankYouForPlaying
```
Merci d'avoir joué!$
```
### BattleFrontier_BattleDomeLobby_Text_RecordWillBeSaved
```
Votre résultat va être sauvegardé.\nVeuillez patienter.$
```
### BattleFrontier_BattleDomeLobby_Text_WeveBeenWaitingForYou
```
Nous vous attendions!$
```
### BattleFrontier_BattleDomeLobby_Text_OkayToSaveBeforeChallenge2
```
Vous devez sauvegarder avant d'entrer\ndans le DOME DE COMBAT. Patientez.$
```
### BattleFrontier_BattleDomeLobby_Text_WelcomeDoubleBattle
```
Bienvenue au DOME DE COMBAT!\pIci, nous mettons à l'épreuve\nla tactique des DRESSEURS!\pJe serai votre guide pour le\nTOURNOI DE COMBAT DUO.$
```
### BattleFrontier_BattleDomeLobby_Text_TakeDoublesChallenge
```
Voulez-vous participer à un TOURNOI DE\nCOMBAT DUO?$
```
### BattleFrontier_BattleDomeLobby_Text_ExplainDoublesChallenge
```
Le TOURNOI DE COMBAT DUO est, comme\nson nom l'indique, un tournoi constitué\lde COMBATS DUO.\pTous les DRESSEURS qui y participent\ndoivent avoir trois POKéMON.\pLors des combats, l'un des trois\nPOKéMON est gardé en réserve.\pLes deux autres POKéMON doivent faire\nun COMBAT DUO.\pEtudiez les trois POKéMON de\nl'adversaire avant de choisir les deux\lPOKéMON que vous envoyez au combat.\pVous devez vaincre quatre DRESSEURS\npour remporter le tournoi.\pDes POINTS DE COMBAT sont remis\nau vainqueur du tournoi.\pSi vous voulez interrompre le défi,\nveuillez sauvegarder la partie.\pAssurez-vous de bien sauvegarder, ou\nvous ne pourrez pas reprendre le défi.$
```
### BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsSinglesLv50
```
Résultats du dernier TOURNOI DE COMBAT\nSOLO niveau 50.$
```
### BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsDoublesLv50
```
Résultats du dernier TOURNOI DE COMBAT\nDUO niveau 50.$
```
### BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsSinglesLvOpen
```
Résultats du dernier TOURNOI DE COMBAT\nSOLO niveau libre.$
```
### BattleFrontier_BattleDomeLobby_Text_PrevTourneyResultsDoublesLvOpen
```
Résultats du dernier TOURNOI DE COMBAT\nDUO niveau libre.$
```
### BattleFrontier_BattleDomeLobby_Text_LastWinnerWasTough
```
Tu as assisté au dernier\nTOURNOI DE COMBAT?\p{STR_VAR_1}, le vainqueur,\nétait vraiment balèze!\pTu devrais consulter les résultats\nsur le panneau à côté du PC.$
```
### BattleFrontier_OutsideWest_Text_LongDreamedAboutBattleFrontier
```
La ZONE DE COMBAT… J'ai rêvé\nd'un tel endroit pendant des années.$
```
### BattleFrontier_OutsideWest_Text_BattleDomeSign2
```
DOME DE COMBAT \nDevenez une star incontestable!$
```
### BattleFrontier_OutsideWest_Text_QuestionMarkUnderConstruction
```
??????\nConstruction en cours!$
```
### BattleFrontier_BattleDomeLobby_Text_WinnersGainReputation
```
Quand un DRESSEUR remporte\nplusieurs tournois au DOME DE\lCOMBAT, il devient une vraie star.\pC'est ce qui attire les DRESSEURS au\nDOME DE COMBAT.\pUn DRESSEUR qui enchaîne les\nvictoires est vraiment une star.$
```
### BattleFrontier_BattleDomeLobby_Text_TrashedInFirstRound
```
Au premier tour, j'ai affronté un\nhabitué du DOME DE COMBAT.\pJe me suis fait ratatiner…$
```
### BattleFrontier_BattleDomeLobby_Text_NeedToCheckOpponentCarefully
```
J'aurais gagné si j'avais mis ce POKéMON\nen réserve.\pAvant de choisir quels POKéMON tu\nenvoies au combat, regarde bien ceux\lde l'adversaire.$
```
### BattleFrontier_BattleDomeLobby_Text_CongratsDefeatedTucker
```
Félicitations!\pVous avez battu la STAR DU DOME et\nremporté le TOURNOI DE COMBAT!$
```
### BattleFrontier_BattleDomeLobby_Text_AwardTheseBattlePoints
```
Votre excellente tactique va être\nrécompensée en POINTS DE COMBAT!$
```
### BattleFrontier_BattleDomeLobby_Text_RecordLastMatch
```
Voulez-vous enregistrer votre dernier\ncombat au DOME DE COMBAT sur votre\lPASSE ZONE?$
```
### BattleFrontier_BattleDomeLobby_Text_RulesAreListed
```
Règles du TOURNOI DE COMBAT.$
```
### BattleFrontier_BattleDomeLobby_Text_ReadWhichHeading
```
Quel chapitre voulez-vous lire?$
```
### BattleFrontier_BattleDomeLobby_Text_ExplainMatchupRules
```
Les DRESSEURS s'affrontent suivant\nla force de leurs POKéMON.\pCela évite que les DRESSEURS forts\nne se rencontrent dès le début.$
```
### BattleFrontier_BattleDomeLobby_Text_ExplainTourneyTree
```
Dans la salle d'attente, le guide vous\ndonne accès au “TABLEAU”.\pCe tableau des rencontres contient\ndifférentes informations.\pVous pouvez y consulter les résultats,\nles POKéMON détenus par les DRESSEURS\let les styles de combat des DRESSEURS.$
```
### BattleFrontier_BattleDomeLobby_Text_ExplainDoubleKORules
```
Si deux POKéMON adverses\ns'évanouissent au même moment, un\ldouble K.O., ce sont les ARBITRES qui\ldésignent le vainqueur.$
```

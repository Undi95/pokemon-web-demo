# BattleFrontier_BattlePalaceLobby

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PALACE_LOBBY`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PALACE_LOBBY`
- **music** : `MUS_B_PALACE`
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
| `LOCALID_PALACE_ATTENDANT_SINGLES` | `OBJ_EVENT_GFX_EXPERT_M` | 5,6 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattlePalaceLobby_EventScript_SinglesAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 11,8 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattlePalaceLobby_EventScript_BlackBelt` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 24,5 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattlePalaceLobby_EventScript_Maniac` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 18,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattlePalaceLobby_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 2,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattlePalaceLobby_EventScript_Beauty` | `0` |
| `LOCALID_PALACE_ATTENDANT_DOUBLES` | `OBJ_EVENT_GFX_EXPERT_M` | 19,6 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattlePalaceLobby_EventScript_DoublesAttendant` | `0` |

## Warps (3)
- #0 (12,11) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #2
- #1 (13,11) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #2
- #2 (5,4) → `MAP_BATTLE_FRONTIER_BATTLE_PALACE_CORRIDOR` warp #0

## BG events / signs (3)
- (2,7) [sign] → `BattleFrontier_BattlePalaceLobby_EventScript_ShowSinglesResults`
- (16,7) [sign] → `BattleFrontier_BattlePalaceLobby_EventScript_ShowDoublesResults`
- (10,4) [sign] → `BattleFrontier_BattlePalaceLobby_EventScript_RulesBoard`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_FRONTIER_BATTLE_MODE`
- `VAR_FRONTIER_FACILITY`
- `VAR_LAST_TALKED`
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

## Scripts (58)
### BattleFrontier_BattlePalaceLobby_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePalaceLobby_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattlePalaceLobby_OnWarp
```
### BattleFrontier_BattlePalaceLobby_OnWarp
```
map_script_2 VAR_TEMP_1, 0, BattleFrontier_BattlePalaceLobby_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattlePalaceLobby_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_1, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### BattleFrontier_BattlePalaceLobby_OnFrame
```
map_script_2 VAR_TEMP_CHALLENGE_STATUS, 0, BattleFrontier_BattlePalaceLobby_EventScript_GetChallengeStatus
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING, BattleFrontier_BattlePalaceLobby_EventScript_QuitWithoutSaving
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_PAUSED, BattleFrontier_BattlePalaceLobby_EventScript_ResumeChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_WON, BattleFrontier_BattlePalaceLobby_EventScript_WonChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST, BattleFrontier_BattlePalaceLobby_EventScript_LostChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_GetChallengeStatus
```
frontier_getstatus
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_QuitWithoutSaving
```
lockall
msgbox BattleFrontier_BattlePalaceLobby_Text_FailedToSaveBeforeEndingChallenge, MSGBOX_DEFAULT
closemessage
palace_set PALACE_DATA_WIN_STREAK, 0
palace_set PALACE_DATA_WIN_STREAK_ACTIVE, FALSE
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_WonChallenge
```
lockall
frontier_isbrain
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattlePalaceLobby_EventScript_DefeatedMaven
msgbox BattleFrontier_BattlePalaceLobby_Text_FirmTrueBondsFor7WinStreak, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_GiveBattlePoints
```
### BattleFrontier_BattlePalaceLobby_EventScript_DefeatedMaven
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ToDefeatMavenAnd7Trainers, MSGBOX_DEFAULT
```
### BattleFrontier_BattlePalaceLobby_EventScript_GiveBattlePoints
```
msgbox BattleFrontier_BattlePalaceLobby_Text_PresentYouWithBattlePoints, MSGBOX_DEFAULT
frontier_givepoints
msgbox BattleFrontier_Text_ObtainedXBattlePoints, MSGBOX_GETPOINTS
message BattleFrontier_BattlePalaceLobby_Text_FeatWillBeRecorded
waitmessage
call BattleFrontier_BattlePalaceLobby_EventScript_SaveAfterChallenge
msgbox BattleFrontier_BattlePalaceLobby_Text_ReturnWhenFortified, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_LostChallenge
```
lockall
message BattleFrontier_BattlePalaceLobby_Text_ResultsWillBeRecorded
waitmessage
palace_set PALACE_DATA_WIN_STREAK_ACTIVE, FALSE
call BattleFrontier_BattlePalaceLobby_EventScript_SaveAfterChallenge
msgbox BattleFrontier_BattlePalaceLobby_Text_ReturnWhenFortified, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_SaveAfterChallenge
```
frontier_checkairshow
special LoadPlayerParty
special HealPlayerParty
palace_save 0
playse SE_SAVE
waitse
call BattleFrontier_EventScript_GetCantRecordBattle
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge
message BattleFrontier_BattlePalaceLobby_Text_LikeToRecordMatch
waitmessage
multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
switch VAR_RESULT
case 1, BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge
case 0, BattleFrontier_BattlePalaceLobby_EventScript_RecordMatch
case MULTI_B_PRESSED, BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_RecordMatch
```
call BattleFrontier_EventScript_SaveBattle
```
### BattleFrontier_BattlePalaceLobby_EventScript_EndSaveAfterChallenge
```
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_ResumeChallenge
```
lockall
msgbox BattleFrontier_BattlePalaceLobby_Text_WeHaveBeenWaiting, MSGBOX_DEFAULT
message BattleFrontier_BattlePalaceLobby_Text_MustSaveBeforeChallenge
waitmessage
palace_save CHALLENGE_STATUS_SAVING
playse SE_SAVE
waitse
frontier_set FRONTIER_DATA_PAUSED, FALSE
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto BattleFrontier_BattlePalaceLobby_EventScript_EnterChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_SinglesAttendant
```
lock
faceplayer
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_PALACE
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
goto BattleFrontier_BattlePalaceLobby_EventScript_Attendant
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_DoublesAttendant
```
lock
faceplayer
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_PALACE
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES
goto BattleFrontier_BattlePalaceLobby_EventScript_Attendant
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_Attendant
```
palace_get PALACE_DATA_PRIZE
goto_if_ne VAR_RESULT, ITEM_NONE, BattleFrontier_BattlePalaceLobby_EventScript_WonChallenge
special SavePlayerParty
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForSingleBattle
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForDoubleBattle
```
### BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge
```
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattlePalaceLobby_EventScript_AskTakeSingleBattleChallenge
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattlePalaceLobby_EventScript_AskTakeDoubleBattleChallenge
waitmessage
multichoice 17, 6, MULTI_CHALLENGEINFO, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattlePalaceLobby_EventScript_TryEnterChallenge
case 1, BattleFrontier_BattlePalaceLobby_EventScript_ExplainChallenge
case 2, BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_TryEnterChallenge
```
message BattleFrontier_BattlePalaceLobby_Text_WhichChallenge
waitmessage
multichoice 17, 6, MULTI_LEVEL_MODE, FALSE
switch VAR_RESULT
case FRONTIER_LVL_TENT, BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge
frontier_checkineligible
goto_if_eq VAR_0x8004, TRUE, BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMons
frontier_set FRONTIER_DATA_LVL_MODE, VAR_RESULT
msgbox BattleFrontier_BattlePalaceLobby_Text_NowSelectThreeMons, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
call BattleFrontier_EventScript_GetLvlMode
copyvar VAR_0x8004, VAR_RESULT
setvar VAR_0x8005, FRONTIER_PARTY_SIZE
special ChoosePartyForBattleFrontier
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge
msgbox BattleFrontier_BattlePalaceLobby_Text_MustSaveBeforeChallenge2, MSGBOX_YESNO
switch VAR_RESULT
case NO, BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge
case YES, BattleFrontier_BattlePalaceLobby_EventScript_SaveBeforeChallenge
case MULTI_B_PRESSED, BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_SaveBeforeChallenge
```
setvar VAR_TEMP_CHALLENGE_STATUS, 0
frontier_set FRONTIER_DATA_SELECTED_MON_ORDER
palace_init
palace_set PALACE_DATA_WIN_STREAK_ACTIVE, TRUE
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING
frontier_set FRONTIER_DATA_PAUSED, FALSE
special LoadPlayerParty
closemessage
delay 2
call Common_EventScript_SaveGame
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattlePalaceLobby_EventScript_CancelChallengeSaveFailed
```
### BattleFrontier_BattlePalaceLobby_EventScript_EnterChallenge
```
special SavePlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
msgbox BattleFrontier_BattlePalaceLobby_Text_FollowMe, MSGBOX_DEFAULT
closemessage
call BattleFrontier_BattlePalaceLobby_EventScript_WalkToDoor
warp MAP_BATTLE_FRONTIER_BATTLE_PALACE_CORRIDOR, 8, 13
setvar VAR_TEMP_CHALLENGE_STATUS, 0
waitstate
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_ExplainChallenge
```
goto_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattlePalaceLobby_EventScript_ExplainDoublesChallenge
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainSingleBattleChallenge, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_ExplainDoublesChallenge
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainDoubleBattleChallenge, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_AskTakeChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMons
```
switch VAR_RESULT
case FRONTIER_LVL_50, BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLv50
case FRONTIER_LVL_OPEN, BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLvOpen
```
### BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLv50
```
msgbox BattleFrontier_BattlePalaceLobby_Text_NotEnoughValidMonsLv50, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_NotEnoughValidMonsLvOpen
```
msgbox BattleFrontier_BattlePalaceLobby_Text_NotEnoughValidMonsLvOpen, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_CancelChallengeSaveFailed
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
goto BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattlePalaceLobby_EventScript_LoadPartyAndCancelChallenge
```
special LoadPlayerParty
```
### BattleFrontier_BattlePalaceLobby_EventScript_CancelChallenge
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ReturnWhenFortified, MSGBOX_DEFAULT
```
### BattleFrontier_BattlePalaceLobby_EventScript_EndCancelChallenge
```
release
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForSingleBattle
```
msgbox BattleFrontier_BattlePalaceLobby_Text_WelcomeForSingleBattle, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_WelcomeForDoubleBattle
```
msgbox BattleFrontier_BattlePalaceLobby_Text_WelcomeForDoubleBattle, MSGBOX_DEFAULT
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_AskTakeSingleBattleChallenge
```
message BattleFrontier_BattlePalaceLobby_Text_TakeSingleBattleChallenge
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_AskTakeDoubleBattleChallenge
```
message BattleFrontier_BattlePalaceLobby_Text_TakeDoubleBattleChallenge
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_WalkToDoor
```
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattlePalaceLobby_EventScript_TalkedToSinglesAttendant
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattlePalaceLobby_EventScript_TalkedToDoublesAttendant
applymovement VAR_LAST_TALKED, BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor
waitmovement 0
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattlePalaceLobby_EventScript_OpenSinglesHallDoor
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattlePalaceLobby_EventScript_OpenDoublesHallDoor
waitdooranim
applymovement VAR_LAST_TALKED, BattleFrontier_BattlePalaceLobby_Movement_AttendantEnterDoor
applymovement LOCALID_PLAYER, BattleFrontier_BattlePalaceLobby_Movement_PlayerEnterDoor
waitmovement 0
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES, BattleFrontier_BattlePalaceLobby_EventScript_CloseSinglesHallDoor
call_if_eq VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_DOUBLES, BattleFrontier_BattlePalaceLobby_EventScript_CloseDoublesHallDoor
waitdooranim
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_TalkedToSinglesAttendant
```
setvar VAR_LAST_TALKED, LOCALID_PALACE_ATTENDANT_SINGLES
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_TalkedToDoublesAttendant
```
setvar VAR_LAST_TALKED, LOCALID_PALACE_ATTENDANT_DOUBLES
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_OpenSinglesHallDoor
```
opendoor 5, 4
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_OpenDoublesHallDoor
```
opendoor 19, 4
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_CloseSinglesHallDoor
```
closedoor 5, 4
return
```
### BattleFrontier_BattlePalaceLobby_EventScript_CloseDoublesHallDoor
```
closedoor 19, 4
return
```
### BattleFrontier_BattlePalaceLobby_Movement_WalkToDoor
```
walk_up
step_end
```
### BattleFrontier_BattlePalaceLobby_Movement_AttendantEnterDoor
```
walk_up
set_invisible
step_end
```
### BattleFrontier_BattlePalaceLobby_Movement_PlayerEnterDoor
```
walk_up
walk_up
set_invisible
step_end
```
### BattleFrontier_BattlePalaceLobby_EventScript_ShowSinglesResults
```
lockall
frontier_results FRONTIER_FACILITY_PALACE, FRONTIER_MODE_SINGLES
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_ShowDoublesResults
```
lockall
frontier_results FRONTIER_FACILITY_PALACE, FRONTIER_MODE_DOUBLES
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_BlackBelt
```
msgbox BattleFrontier_BattlePalaceLobby_Text_LadyCanTellWhatMonsThink, MSGBOX_NPC
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_Man
```
msgbox BattleFrontier_BattlePalaceLobby_Text_NatureAndMovesKeyHere, MSGBOX_NPC
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_Beauty
```
msgbox BattleFrontier_BattlePalaceLobby_Text_MonDocileButTransforms, MSGBOX_NPC
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_Maniac
```
msgbox BattleFrontier_BattlePalaceLobby_Text_WhatNatureFavorsChippingAway, MSGBOX_NPC
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_RulesBoard
```
lockall
msgbox BattleFrontier_BattlePalaceLobby_Text_RulesAreListed, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
```
message BattleFrontier_BattlePalaceLobby_Text_ReadWhichHeading
waitmessage
multichoice 16, 0, MULTI_BATTLE_PALACE_RULES, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattlePalaceLobby_EventScript_RulesBasics
case 1, BattleFrontier_BattlePalaceLobby_EventScript_RulesNature
case 2, BattleFrontier_BattlePalaceLobby_EventScript_RulesMoves
case 3, BattleFrontier_BattlePalaceLobby_EventScript_RulesUnderpowered
case 4, BattleFrontier_BattlePalaceLobby_EventScript_RulesWhenInDanger
case 5, BattleFrontier_BattlePalaceLobby_EventScript_ExitRules
case MULTI_B_PRESSED, BattleFrontier_BattlePalaceLobby_EventScript_ExitRules
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_RulesBasics
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainRulesBasics, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_RulesNature
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainRulesNature, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_RulesMoves
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainRulesMoves, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_RulesUnderpowered
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainRulesUnderpowered, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_RulesWhenInDanger
```
msgbox BattleFrontier_BattlePalaceLobby_Text_ExplainRulesWhenInDanger, MSGBOX_DEFAULT
goto BattleFrontier_BattlePalaceLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePalaceLobby_EventScript_ExitRules
```
releaseall
end
```

## Textes (36)
### BattleFrontier_BattlePalaceLobby_Text_WelcomeForSingleBattle
```
Bienvenue au PALACE DE COMBAT!\pIci, nous mettons à l'épreuve\nl'esprit des DRESSEURS!\pJe serai votre guide dans les\nHALLS DE COMBAT SOLO.$
```
### BattleFrontier_BattlePalaceLobby_Text_TakeSingleBattleChallenge
```
Voulez-vous relever le défi d'un\nHALL DE COMBAT SOLO?$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainSingleBattleChallenge
```
Au PALACE DE COMBAT, il y a plusieurs\nsalles réservées aux COMBATS SOLO, que\ll'on appelle les HALLS DE COMBAT SOLO.\pLes COMBATS SOLO qui y ont lieu sont\nun peu particuliers. Une importante\lrègle y est ajoutée.\pLes DRESSEURS peuvent seulement\nfaire entrer et sortir leurs POKéMON.\pLes DRESSEURS ne peuvent pas donner\nd'autres ordres à leurs POKéMON.\pLes POKéMON agiront conformément\nà leur nature et se battront seuls.\pVous devez placer votre confiance en\nvos POKéMON et les regarder.\pSi vous réalisez l'exploit de battre\nsept DRESSEURS à la suite, vous\lrecevrez des POINTS DE COMBAT.\pSi vous voulez interrompre le défi,\nveuillez sauvegarder la partie.\pAssurez-vous de bien sauvegarder, ou\nvous ne pourrez pas reprendre le défi.$
```
### BattleFrontier_BattlePalaceLobby_Text_ReturnWhenFortified
```
Revenez quand vous aurez fortifié\nvotre esprit et vos POKéMON.$
```
### BattleFrontier_BattlePalaceLobby_Text_WhichChallenge
```
Il y a deux HALLS DE COMBAT:\nniveau 50 et niveau libre.\lQue choisissez-vous?$
```
### BattleFrontier_BattlePalaceLobby_Text_NotEnoughValidMonsLv50
```
Je regrette…\pVous n'avez pas trois POKéMON\naptes à participer.\pIl vous faut trois POKéMON différents\npour participer.\pCes POKéMON doivent être de niveau\n50 ou moins.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut.$
```
### BattleFrontier_BattlePalaceLobby_Text_NotEnoughValidMonsLvOpen
```
Je regrette…\pVous n'avez pas trois POKéMON\naptes à participer.\pIl vous faut trois POKéMON différents\npour participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut.$
```
### BattleFrontier_BattlePalaceLobby_Text_NowSelectThreeMons
```
Très bien. Maintenant, veuillez choisir\nvos trois POKéMON.$
```
### BattleFrontier_BattlePalaceLobby_Text_MustSaveBeforeChallenge2
```
Avant d'accéder à un HALL DE COMBAT,\nvotre partie doit être sauvegardée. OK?$
```
### BattleFrontier_BattlePalaceLobby_Text_FollowMe
```
Très bien.\nSuivez-moi, je vous prie.$
```
### BattleFrontier_BattlePalaceLobby_Text_ResultsWillBeRecorded
```
Ce fut un privilège de pouvoir assister\nà un tel combat.\pVotre résultat va être sauvegardé.\nJe vous demande de patienter un peu.$
```
### BattleFrontier_BattlePalaceLobby_Text_FirmTrueBondsFor7WinStreak
```
Sept victoires consécutives…\pLes liens qui unissent votre esprit à\nvos POKéMON sont solides et sincères.$
```
### BattleFrontier_BattlePalaceLobby_Text_FeatWillBeRecorded
```
Votre résultat va être sauvegardé.\nJe vous demande de patienter un peu.$
```
### BattleFrontier_BattlePalaceLobby_Text_BattlePointsFor7WinStreak
```
For the feat of your 7-win streak,\nwe present you with Battle Point(s).$
```
### BattleFrontier_BattlePalaceLobby_Text_NoSpaceForPrize
```
Malheureusement, vous ne pouvez\nrien porter d'autre.\pJe vous demande de faire de la place\ndans votre SAC et de revenir me voir.$
```
### BattleFrontier_BattlePalaceLobby_Text_WeHaveBeenWaiting
```
Nous vous attendions…$
```
### BattleFrontier_BattlePalaceLobby_Text_MustSaveBeforeChallenge
```
Avant d'accéder à un HALL DE COMBAT,\nvotre partie doit être sauvegardée. OK?$
```
### BattleFrontier_BattlePalaceLobby_Text_FailedToSaveBeforeEndingChallenge
```
Je regrette!\pVous n'avez pas sauvegardé avant de\nquitter votre dernier défi.\pC'est malheureux, mais nous avons dû\nvous disqualifier.$
```
### BattleFrontier_BattlePalaceLobby_Text_ReceivedPrize
```
{PLAYER} received the prize\n{STR_VAR_1}.$
```
### BattleFrontier_BattlePalaceLobby_Text_LadyCanTellWhatMonsThink
```
Pour un DRESSEUR hardi comme moi,\nil faut des POKéMON hardis aussi!\pL'attaque est la meilleure des\ndéfenses! Il faut attaquer sans cesse!\pMais ce n'est pas de ça que je voulais\nparler.\pDe temps en temps, il y a une fille\nsuper mignonne qui passe par ici.\pElle dit qu'elle est capable de savoir\nce que les POKéMON pensent.\pJe ne sais pas si c'est vrai, mais en\ntout cas elle est super mignonne!\pHé!\nPourquoi tu me regardes comme ça?$
```
### BattleFrontier_BattlePalaceLobby_Text_NatureAndMovesKeyHere
```
Hum…\pApparemment, ici c'est la nature des\nPOKéMON ainsi que les capacités qu'ils\lconnaissent qui sont importantes.\pEn fait, il faut que les capacités qu'ils\nconnaissent soient en accord avec leur\lnature.\pSi un POKéMON est en difficulté et n'est\npas à la hauteur de son potentiel, il\lfaut se demander si ses capacités\lcorrespondent bien à sa nature.$
```
### BattleFrontier_BattlePalaceLobby_Text_MonDocileButTransforms
```
Mon POKéMON est très docile,\nen temps normal.\pMais dès qu'il est dans un HALL DE\nCOMBAT, il n'est plus le même.\lIl devient méchant!\pJe t'assure, il me fait peur!$
```
### BattleFrontier_BattlePalaceLobby_Text_WhatNatureFavorsChippingAway
```
Je me demande quelle est la nature\nd'un POKéMON qui affaiblit l'ennemi\lpetit à petit pour prendre la tête.\pCe serait surprenant qu'il soit LACHE\nde nature.\pNon, ça ne peut pas être ça.$
```
### BattleFrontier_BattlePalaceLobby_Text_WelcomeForDoubleBattle
```
Bienvenue au PALACE DE COMBAT!\pIci, nous mettons à l'épreuve\nl'esprit des DRESSEURS!\pJe prends les inscriptions pour les\nHALLS DE COMBAT DUO.$
```
### BattleFrontier_BattlePalaceLobby_Text_TakeDoubleBattleChallenge
```
Voulez-vous relever le défi d'un\nHALL DE COMBAT DUO?$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainDoubleBattleChallenge
```
Au PALACE DE COMBAT, il y a plusieurs\nsalles réservées aux COMBATS DUO, que\ll'on appelle les HALLS DE COMBAT DUO.\pLes COMBATS DUO qui y ont lieu sont\nun peu particuliers. Une importante\lrègle y est ajoutée.\pLes DRESSEURS peuvent seulement\nfaire entrer et sortir leurs POKéMON.\pLes DRESSEURS ne peuvent pas donner\nd'autres ordres à leurs POKéMON.\pLes POKéMON agiront conformément\nà leur nature et se battront seuls.\pVous devez placer votre confiance en\nvos POKéMON et les regarder.\pSi vous réalisez l'exploit de battre\nsept DRESSEURS à la suite, vous\lrecevrez des POINTS DE COMBAT.\pSi vous voulez interrompre le défi,\nveuillez sauvegarder la partie.\pAssurez-vous de bien sauvegarder, ou\nvous ne pourrez pas reprendre le défi.$
```
### BattleFrontier_BattlePalaceLobby_Text_ToDefeatMavenAnd7Trainers
```
Battre le CAPT. PALACE et sept\nDRESSEURS de suite…$
```
### BattleFrontier_BattlePalaceLobby_Text_PresentYouWithBattlePoints
```
Les liens qui vous unissent à vos\nPOKéMON vont se voir récompensés par\ldes POINTS DE COMBAT.$
```
### BattleFrontier_BattlePalaceLobby_Text_LikeToRecordMatch
```
Voulez-vous enregistrer votre dernier\ncombat au PALACE DE COMBAT sur\lvotre PASSE ZONE?$
```
### BattleFrontier_BattlePalaceLobby_Text_RulesAreListed
```
Règles des HALLS DE COMBAT.$
```
### BattleFrontier_BattlePalaceLobby_Text_ReadWhichHeading
```
Quel chapitre voulez-vous lire?$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainRulesBasics
```
Ici, les POKéMON doivent penser et se\nbattre par eux-mêmes.\pA la différence des POKéMON sauvages,\nceux qui vivent avec des humains ont un\lcomportement spécifique à leur nature.$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainRulesNature
```
La nature d'un POKéMON lui dictera\npeut-être d'attaquer coûte que coûte.\pUn autre POKéMON pourra préférer se\nprotéger du danger.\pUn autre aimera peut-être contrarier\net déconcerter ses ennemis.\pSelon sa nature, un POKéMON préférera\ncertaines capacités, qu'il saura mieux\lutiliser que les autres.\pCertaines capacités ne lui plairont pas\net il aura du mal à les utiliser.$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainRulesMoves
```
Les capacités offensives font subir\ndes dommages immédiats à l'ennemi.\pLes capacités défensives servent à se\npréparer à l'attaque ennemie, à se\lsoigner ou autre.\pIl y a aussi d'autres capacités visant\nà affaiblir l'ennemi en provoquant\ldes problèmes de statut comme\ll'empoisonnement ou la paralysie.\pLes POKéMON choisiront leurs capacités\nparmi ces trois catégories.$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainRulesUnderpowered
```
Sans les ordres de son DRESSEUR, il\nse peut qu'un POKéMON n'utilise pas\lefficacement certaines capacités.\pUn POKéMON utilise mal les capacités\nqu'il n'aime pas.\pSi un POKéMON ne connaît que des\ncapacités contraires à sa nature, il ne\lsera pas à la hauteur de son potentiel.$
```
### BattleFrontier_BattlePalaceLobby_Text_ExplainRulesWhenInDanger
```
Il se peut qu'un POKéMON se mette\nà utiliser des capacités contraires à\lsa nature s'il est en danger.\pSi un POKéMON commence à agir\nbizarrement, surveillez-le bien.$
```

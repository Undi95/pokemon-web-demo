# SlateportCity_BattleTentCorridor

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_BATTLE_TENT_CORRIDOR`
- **layout** : `LAYOUT_BATTLE_TENT_CORRIDOR`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SLATEPORT_TENT_CORRIDOR_ATTENDANT` | `OBJ_EVENT_GFX_SCIENTIST_1` | 2,6 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `0` |

## Variables référencées (4)
- `VAR_0x8006`
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BattleFrontier_BattleFactoryPreBattleRoom_Text_HoldMonsChooseFromSelection`
- `BattleFrontier_BattleFactoryPreBattleRoom_Text_LetUsRestoreMons`
- `BattleFrontier_BattleFactoryPreBattleRoom_Text_LikeToSwapMon`
- `BattleFrontier_BattleFactoryPreBattleRoom_Text_RightThisWay`
- `BattleFrontier_BattleFactoryPreBattleRoom_Text_SaveAndQuitGame`
- `BattleFrontier_BattleFactoryPreBattleRoom_Text_YourSwapIsComplete`

## Scripts (21)
### SlateportCity_BattleTentCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, SlateportCity_BattleTentCorridor_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, SlateportCity_BattleTentCorridor_OnWarp
```
### SlateportCity_BattleTentCorridor_OnWarp
```
map_script_2 VAR_TEMP_1, 0, SlateportCity_BattleTentCorridor_EventScript_SetUpObjects
```
### SlateportCity_BattleTentCorridor_EventScript_SetUpObjects
```
setvar VAR_TEMP_1, 1
goto_if_ne VAR_0x8006, 1, SlateportCity_BattleTentCorridor_EventScript_TurnPlayerNorth
setobjectxy LOCALID_SLATEPORT_TENT_CORRIDOR_ATTENDANT, 2, 2
turnobject LOCALID_SLATEPORT_TENT_CORRIDOR_ATTENDANT, DIR_SOUTH
```
### SlateportCity_BattleTentCorridor_EventScript_TurnPlayerNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### SlateportCity_BattleTentCorridor_OnFrame
```
map_script_2 VAR_TEMP_0, 0, SlateportCity_BattleTentCorridor_EventScript_EnterCorridor
```
### SlateportCity_BattleTentCorridor_EventScript_EnterCorridor
```
goto_if_eq VAR_0x8006, 1, SlateportCity_BattleTentCorridor_EventScript_ReturnToRoomFromBattle
setvar VAR_TEMP_0, 1
applymovement LOCALID_SLATEPORT_TENT_CORRIDOR_ATTENDANT, SlateportCity_BattleTentCorridor_Movement_AttendantEnter
applymovement LOCALID_PLAYER, SlateportCity_BattleTentCorridor_Movement_PlayerEnter
waitmovement 0
goto_if_eq VAR_0x8006, 2, SlateportCity_BattleTentCorridor_EventScript_ResumeChallenge
slateporttent_generaterentalmons
slateporttent_generateopponentmons
msgbox BattleFrontier_BattleFactoryPreBattleRoom_Text_HoldMonsChooseFromSelection, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
slateporttent_rentmons
waitstate
```
### SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom
```
msgbox BattleFrontier_BattleFactoryPreBattleRoom_Text_RightThisWay, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_TENT_CORRIDOR_ATTENDANT, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
opendoor 2, 1
waitdooranim
applymovement LOCALID_SLATEPORT_TENT_CORRIDOR_ATTENDANT, SlateportCity_BattleTentCorridor_Movement_AttendantExit
applymovement LOCALID_PLAYER, SlateportCity_BattleTentCorridor_Movement_PlayerExit
waitmovement 0
closedoor 2, 1
waitdooranim
warp MAP_SLATEPORT_CITY_BATTLE_TENT_BATTLE_ROOM, 4, 4
waitstate
end
```
### SlateportCity_BattleTentCorridor_EventScript_ReturnToRoomFromBattle
```
factory_setopponentmons
factory_resethelditems
msgbox BattleFrontier_BattleFactoryPreBattleRoom_Text_LetUsRestoreMons, MSGBOX_DEFAULT
playfanfare MUS_HEAL
waitfanfare
special HealPlayerParty
```
### SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent
```
frontier_get FRONTIER_DATA_BATTLE_NUM
call_if_eq VAR_RESULT, 1, SlateportCity_BattleTentCorridor_EventScript_ReadyFor2ndOpponent
call_if_eq VAR_RESULT, 2, SlateportCity_BattleTentCorridor_EventScript_ReadyFor3rdOpponent
multichoice 20, 6, MULTI_GO_ON_REST_RETIRE, TRUE
switch VAR_RESULT
case 0, SlateportCity_BattleTentCorridor_EventScript_AskSwapMon
case 1, SlateportCity_BattleTentCorridor_EventScript_AskPauseChallenge
case 2, SlateportCity_BattleTentCorridor_EventScript_AskRetireChallenge
```
### SlateportCity_BattleTentCorridor_EventScript_AskPauseChallenge
```
msgbox BattleFrontier_BattleFactoryPreBattleRoom_Text_SaveAndQuitGame, MSGBOX_YESNO
switch VAR_RESULT
case NO, SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent
case YES, SlateportCity_BattleTentCorridor_EventScript_PauseChallenge
case MULTI_B_PRESSED, SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent
```
### SlateportCity_BattleTentCorridor_EventScript_AskRetireChallenge
```
message BattleFrontier_BattleFactoryPreBattleRoom_Text_RetireFromChallenge
waitmessage
multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
switch VAR_RESULT
case 1, SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent
case 0, SlateportCity_BattleTent_EventScript_WarpToLobbyLost
case MULTI_B_PRESSED, SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent
```
### SlateportCity_BattleTentCorridor_EventScript_AskSwapMon
```
slateporttent_generateopponentmons
msgbox BattleFrontier_BattleFactoryPreBattleRoom_Text_LikeToSwapMon, MSGBOX_YESNO
switch VAR_RESULT
case NO, SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom
case YES, SlateportCity_BattleTentCorridor_EventScript_SwapMons
case MULTI_B_PRESSED, SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom
```
### SlateportCity_BattleTentCorridor_EventScript_SwapMons
```
fadescreen FADE_TO_BLACK
slateporttent_swapmons
waitstate
goto_if_eq VAR_RESULT, 1, SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom
msgbox BattleFrontier_BattleFactoryPreBattleRoom_Text_YourSwapIsComplete, MSGBOX_DEFAULT
goto SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom
```
### SlateportCity_BattleTentCorridor_EventScript_ReadyFor2ndOpponent
```
message BattleFrontier_BattleFactoryPreBattleRoom_Text_ReadyFor2ndOpponent
waitmessage
return
```
### SlateportCity_BattleTentCorridor_EventScript_ReadyFor3rdOpponent
```
message BattleFrontier_BattleFactoryPreBattleRoom_Text_ReadyFor3rdOpponent
waitmessage
return
```
### SlateportCity_BattleTentCorridor_EventScript_PauseChallenge
```
message BattleFrontier_BattleFactoryPreBattleRoom_Text_SavingDataPleaseWait
waitmessage
slateporttent_save CHALLENGE_STATUS_PAUSED
playse SE_SAVE
waitse
fadescreen FADE_TO_BLACK
frontier_reset
end
```
### SlateportCity_BattleTentCorridor_EventScript_ResumeChallenge
```
special SavePlayerParty
factory_setparties 0
goto SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent
```
### SlateportCity_BattleTentCorridor_Movement_PlayerEnter
```
walk_up
walk_up
walk_up
walk_up
step_end
```
### SlateportCity_BattleTentCorridor_Movement_PlayerExit
```
walk_up
walk_up
set_invisible
step_end
```
### SlateportCity_BattleTentCorridor_Movement_AttendantEnter
```
walk_up
walk_up
walk_up
walk_up
walk_in_place_faster_down
step_end
```
### SlateportCity_BattleTentCorridor_Movement_AttendantExit
```
walk_up
set_invisible
step_end
```

## Textes (15)
### SlateportCity_ContestHall_Text_AdviceForContests
```
Want a tasty little bit of advice\nfor CONTESTS?\pUsing a certain move after another\ncertain kind of move sometimes gets\lyou extra attention.\pIf you know what you're doing,\nyou can score big in appeal.\pOf course, your opponents might try\ndisrupting your POKéMON's showing.$
```
### SlateportCity_ContestHall_Text_MyPapaIsContestJudge
```
My papa, he's a CONTEST JUDGE.\pI wonder what I should be when I\ngrow up, a JUDGE or a GYM LEADER?$
```
### SlateportCity_ContestHall_Text_ImLikeMajorlyCheesed
```
Hey, man, I'm like majorly cheesed,\nyou know. Like, you know, I just\lwanted to know why my POKéMON\lnever won, you know, like, hey?\pSo, like, I gave the JUDGE my two\ncents, you know, they're free.\pAnd he wouldn't hear me out, like, hey!\nSo, like, total bummer, man!\pHey, like, you! Zip it, you know?\nJust, you know, take this!$
```
### SlateportCity_ContestHall_Text_ExplainTorment
```
That's, like, TM41, you know?\nHey, it's TORMENT, you hearing me?\pLike, it won't let the other guy\nuse the same move twice in a row, see?\pHey, now, you listen here, like,\nI'm not laying a torment on you!$
```
### SlateportCity_ContestHall_Text_MCStepUpTakePartInContest
```
MC: Oh, my, my!\nNow isn't that a dandy of a POKéMON?\pPlease! Do step right up and take\npart in our splendid CONTESTS!\pYou'll do well! I'm sure of it!\nMy eyes have never failed me!$
```
### SlateportCity_ContestHall_Text_JudgeWouldntDoToMissContest
```
JUDGE: Well, hello there!\nI see that you're a TRAINER!\pThen, it just wouldn't do for you\nto miss a POKéMON CONTEST!\pGet a CONTEST PASS in VERDANTURF\nCITY and enter anytime!$
```
### SlateportCity_ContestHall_Text_ItsAppealTime
```
It's appeal time!\nWhat should I lead with?$
```
### SlateportCity_ContestHall_Text_DidntPayAttentionToAppeal
```
They didn't pay much attention to\nmy POKéMON's appeal…\pHumph, that JUDGE, he doesn't know\na good thing when he sees it.$
```
### SlateportCity_ContestHall_Text_RewardWithSageAdvice
```
Oh, hi! You must be a serious fan to get\nthis close to the action.\pI'll reward your enthusiasm with\nthis sage advice.\pIf a move goes over really well,\nthe audience will get excited.\pThe POKéMON that makes its appeal\nright when everyone's excited…\pWell, you'd think something good has\nto happen!$
```
### SlateportCity_ContestHall_Text_MoreFreakedOutThanMon
```
I can't do this! I'm more freaked out\nthan my POKéMON.\pI'm shivering and my heart is racing!$
```
### SlateportCity_ContestHall_Text_BattleAndContestAlike
```
A battle and a CONTEST aren't the\nsame, but they are alike, too.\pYou need to work hard and believe\nin the POKéMON you've raised.$
```
### SlateportCity_ContestHall_Text_MonLooksOnTopOfGame
```
That POKéMON looks like it's on top\nof its game, huh?\pA POKéMON that does good in the\nsecondary judging seems to be more\lrelaxed when it's doing appeals.$
```
### SlateportCity_ContestHall_Text_MyMonBetterThanThatLot
```
Will you look at that sorry sight?\pHeh, my POKéMON's absolutely better\nthan that lot!$
```
### SlateportCity_ContestHall_Text_GetUrgeToMoveWithMon
```
Don't you get the urge to move with\nPOKéMON if they're putting on an\lenergetic appeal?$
```
### SlateportCity_ContestHall_Text_HyperRankStage
```
POKéMON CONTESTS\nHYPER RANK STAGE!$
```

# FallarborTown_BattleTentLobby

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN_BATTLE_TENT_LOBBY`
- **layout** : `LAYOUT_BATTLE_TENT_LOBBY`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FALLARBOR_TENT_ATTENDANT` | `OBJ_EVENT_GFX_BLACK_BELT` | 6,5 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_BattleTentLobby_EventScript_Attendant` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 1,5 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `FallarborTown_BattleTentLobby_EventScript_Hiker` | `0` |
| `` | `OBJ_EVENT_GFX_LITTLE_BOY` | 12,6 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `FallarborTown_BattleTentLobby_EventScript_LittleBoy` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 10,9 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_BattleTentLobby_EventScript_Lass` | `0` |
| `` | `OBJ_EVENT_GFX_SCOTT` | 0,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `FallarborTown_BattleTentLobby_EventScript_Scott` | `FLAG_HIDE_FALLARBOR_TOWN_BATTLE_TENT_SCOTT` |

## Warps (2)
- #0 (6,9) → `MAP_FALLARBOR_TOWN` warp #1
- #1 (7,9) → `MAP_FALLARBOR_TOWN` warp #1

## BG events / signs (1)
- (4,5) [sign] → `FallarborTown_BattleTentLobby_EventScript_RulesBoard`

## Flags référencés (1)
- `FLAG_MET_SCOTT_IN_FALLARBOR`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_FRONTIER_BATTLE_MODE`
- `VAR_FRONTIER_FACILITY`
- `VAR_RESULT`
- `VAR_SCOTT_STATE`
- `VAR_TEMP_1`
- `VAR_TEMP_CHALLENGE_STATUS`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BattleFrontier_BattleArenaLobby_Text_ExplainBattleRules`
- `BattleFrontier_BattleArenaLobby_Text_ExplainBodyRules`
- `BattleFrontier_BattleArenaLobby_Text_ExplainMindRules`
- `BattleFrontier_BattleArenaLobby_Text_ExplainSkillRules`
- `BattleFrontier_BattleArenaLobby_Text_RulesAreListed`
- `BattleTentLobby_Text_ExplainLevelRules`
- `FallarborTown_BattleTentLobby_Text_AwaitAnotherChallenge`
- `FallarborTown_BattleTentLobby_Text_AwaitAnotherChallenge2`
- `FallarborTown_BattleTentLobby_Text_BagFullReturnForPrize`
- `FallarborTown_BattleTentLobby_Text_BeatThreeTrainers`
- `FallarborTown_BattleTentLobby_Text_DidntSaveBeforeQuitting`
- `FallarborTown_BattleTentLobby_Text_ExplainFallarborTent`
- `FallarborTown_BattleTentLobby_Text_GuideYouToBattleTent`
- `FallarborTown_BattleTentLobby_Text_NotEnoughValidMonsLv50`
- `FallarborTown_BattleTentLobby_Text_NotEnoughValidMonsLvOpen`
- `FallarborTown_BattleTentLobby_Text_PresentYouWithPrize`
- `FallarborTown_BattleTentLobby_Text_SaveBeforeChallenge`
- `FallarborTown_BattleTentLobby_Text_SelectThreeMons`
- `FallarborTown_BattleTentLobby_Text_WelcomeToBattleTent`
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (43)
### FallarborTown_BattleTentLobby_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, FallarborTown_BattleTentLobby_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, FallarborTown_BattleTentLobby_OnWarp
```
### FallarborTown_BattleTentLobby_OnWarp
```
map_script_2 VAR_TEMP_1, 0, FallarborTown_BattleTentLobby_EventScript_TurnPlayerNorth
```
### FallarborTown_BattleTentLobby_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_1, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### FallarborTown_BattleTentLobby_OnFrame
```
map_script_2 VAR_TEMP_CHALLENGE_STATUS, 0, FallarborTown_BattleTentLobby_EventScript_GetChallengeStatus
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING, FallarborTown_BattleTentLobby_EventScript_QuitWithoutSaving
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_PAUSED, FallarborTown_BattleTentLobby_EventScript_ResumeChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_WON, FallarborTown_BattleTentLobby_EventScript_WonChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST, FallarborTown_BattleTentLobby_EventScript_LostChallenge
```
### FallarborTown_BattleTentLobby_EventScript_GetChallengeStatus
```
frontier_getstatus
end
```
### FallarborTown_BattleTentLobby_EventScript_QuitWithoutSaving
```
lockall
msgbox FallarborTown_BattleTentLobby_Text_DidntSaveBeforeQuitting, MSGBOX_DEFAULT
closemessage
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
setvar VAR_TEMP_CHALLENGE_STATUS, 255
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_50
releaseall
end
```
### FallarborTown_BattleTentLobby_EventScript_WonChallenge
```
lockall
msgbox FallarborTown_BattleTentLobby_Text_BeatThreeTrainers, MSGBOX_DEFAULT
message FallarborTown_BattleTentLobby_Text_WaitWhileSaveGame
waitmessage
fallarbortent_setrandomprize
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_50
fallarbortent_save 0
playse SE_SAVE
waitse
```
### FallarborTown_BattleTentLobby_EventScript_GivePrize
```
msgbox FallarborTown_BattleTentLobby_Text_PresentYouWithPrize, MSGBOX_DEFAULT
fallarbortent_giveprize
switch VAR_RESULT
case FALSE, FallarborTown_BattleTentLobby_EventScript_NoRoomForPrize
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
message FallarborTown_BattleTentLobby_Text_ReceivedPrize
waitmessage
playfanfare MUS_OBTAIN_ITEM
waitfanfare
msgbox FallarborTown_BattleTentLobby_Text_AwaitAnotherChallenge2, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### FallarborTown_BattleTentLobby_EventScript_NoRoomForPrize
```
msgbox FallarborTown_BattleTentLobby_Text_BagFullReturnForPrize, MSGBOX_DEFAULT
waitmessage
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### FallarborTown_BattleTentLobby_EventScript_PrizeWaiting
```
lockall
msgbox FallarborTown_BattleTentLobby_Text_BeatThreeTrainers, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_GivePrize
end
```
### FallarborTown_BattleTentLobby_EventScript_LostChallenge
```
lockall
message FallarborTown_BattleTentLobby_Text_ThankYouWaitWhileSaving
waitmessage
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_50
fallarbortent_save 0
playse SE_SAVE
waitse
msgbox FallarborTown_BattleTentLobby_Text_AwaitAnotherChallenge2, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### FallarborTown_BattleTentLobby_EventScript_ResumeChallenge
```
lockall
message FallarborTown_BattleTentLobby_Text_LookingForwardToArrival
waitmessage
fallarbortent_save CHALLENGE_STATUS_SAVING
playse SE_SAVE
waitse
frontier_set FRONTIER_DATA_PAUSED, FALSE
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto FallarborTown_BattleTentLobby_EventScript_EnterChallenge
```
### FallarborTown_BattleTentLobby_EventScript_Attendant
```
lock
faceplayer
fallarbortent_getprize
goto_if_ne VAR_RESULT, ITEM_NONE, FallarborTown_BattleTentLobby_EventScript_PrizeWaiting
special SavePlayerParty
msgbox FallarborTown_BattleTentLobby_Text_WelcomeToBattleTent, MSGBOX_DEFAULT
```
### FallarborTown_BattleTentLobby_EventScript_AskEnterChallenge
```
message FallarborTown_BattleTentLobby_Text_TakeChallenge
waitmessage
multichoice 17, 6, MULTI_CHALLENGEINFO, FALSE
switch VAR_RESULT
case 0, FallarborTown_BattleTentLobby_EventScript_TryEnterChallenge
case 1, FallarborTown_BattleTentLobby_EventScript_ExplainChallenge
case 2, FallarborTown_BattleTentLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, FallarborTown_BattleTentLobby_EventScript_CancelChallenge
```
### FallarborTown_BattleTentLobby_EventScript_TryEnterChallenge
```
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_ARENA
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
setvar VAR_RESULT, 2
frontier_checkineligible
goto_if_eq VAR_0x8004, TRUE, FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMons
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_TENT
msgbox FallarborTown_BattleTentLobby_Text_SelectThreeMons, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
setvar VAR_0x8004, 2
setvar VAR_0x8005, FRONTIER_PARTY_SIZE
special ChoosePartyForBattleFrontier
goto_if_eq VAR_RESULT, 0, FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge
msgbox FallarborTown_BattleTentLobby_Text_SaveBeforeChallenge, MSGBOX_YESNO
switch VAR_RESULT
case NO, FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge
case YES, FallarborTown_BattleTentLobby_EventScript_SaveBeforeChallenge
case MULTI_B_PRESSED, FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge
```
### FallarborTown_BattleTentLobby_EventScript_SaveBeforeChallenge
```
setvar VAR_TEMP_CHALLENGE_STATUS, 0
frontier_set FRONTIER_DATA_SELECTED_MON_ORDER
fallarbortent_init
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING
frontier_set FRONTIER_DATA_PAUSED, FALSE
special LoadPlayerParty
closemessage
delay 2
call Common_EventScript_SaveGame
setvar VAR_TEMP_CHALLENGE_STATUS, 255
goto_if_eq VAR_RESULT, 0, FallarborTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed
```
### FallarborTown_BattleTentLobby_EventScript_EnterChallenge
```
special SavePlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
msgbox FallarborTown_BattleTentLobby_Text_GuideYouToBattleTent, MSGBOX_DEFAULT
closemessage
call FallarborTown_BattleTentLobby_EventScript_WalkToDoor
warp MAP_FALLARBOR_TOWN_BATTLE_TENT_CORRIDOR, 2, 7
setvar VAR_TEMP_CHALLENGE_STATUS, 0
waitstate
end
```
### FallarborTown_BattleTentLobby_EventScript_ExplainChallenge
```
msgbox FallarborTown_BattleTentLobby_Text_ExplainFallarborTent, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_AskEnterChallenge
```
### FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMons
```
switch VAR_RESULT
case FRONTIER_LVL_50, FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50
case FRONTIER_LVL_OPEN, FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen
```
### FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50
```
msgbox FallarborTown_BattleTentLobby_Text_NotEnoughValidMonsLv50, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge
```
### FallarborTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen
```
msgbox FallarborTown_BattleTentLobby_Text_NotEnoughValidMonsLvOpen, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge
```
### FallarborTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
goto FallarborTown_BattleTentLobby_EventScript_CancelChallenge
```
### FallarborTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge
```
special LoadPlayerParty
```
### FallarborTown_BattleTentLobby_EventScript_CancelChallenge
```
msgbox FallarborTown_BattleTentLobby_Text_AwaitAnotherChallenge, MSGBOX_DEFAULT
```
### FallarborTown_BattleTentLobby_EventScript_EndCancelChallenge
```
release
end
```
### FallarborTown_BattleTentLobby_EventScript_WalkToDoor
```
applymovement LOCALID_FALLARBOR_TENT_ATTENDANT, FallarborTown_BattleTentLobby_Movement_AttendantWalkToDoor
applymovement LOCALID_PLAYER, FallarborTown_BattleTentLobby_Movement_PlayerWalkToDoor
waitmovement 0
opendoor 6, 1
waitdooranim
applymovement LOCALID_FALLARBOR_TENT_ATTENDANT, FallarborTown_BattleTentLobby_Movement_AttendantEnterDoor
applymovement LOCALID_PLAYER, FallarborTown_BattleTentLobby_Movement_PlayerEnterDoor
waitmovement 0
closedoor 6, 1
waitdooranim
return
```
### FallarborTown_BattleTentLobby_Movement_AttendantWalkToDoor
```
walk_up
walk_up
walk_up
step_end
```
### FallarborTown_BattleTentLobby_Movement_AttendantEnterDoor
```
walk_up
set_invisible
step_end
```
### FallarborTown_BattleTentLobby_Movement_PlayerWalkToDoor
```
walk_up
walk_up
walk_up
step_end
```
### FallarborTown_BattleTentLobby_Movement_PlayerEnterDoor
```
walk_up
walk_up
set_invisible
step_end
```
### FallarborTown_BattleTentLobby_EventScript_Hiker
```
msgbox FallarborTown_BattleTentLobby_Text_CameToCampOut, MSGBOX_NPC
end
```
### FallarborTown_BattleTentLobby_EventScript_LittleBoy
```
msgbox FallarborTown_BattleTentLobby_Text_MakeThinkImJustKid, MSGBOX_NPC
end
```
### FallarborTown_BattleTentLobby_EventScript_Lass
```
msgbox FallarborTown_BattleTentLobby_Text_FallarborTentMyFavorite, MSGBOX_NPC
end
```
### FallarborTown_BattleTentLobby_EventScript_Scott
```
lock
faceplayer
goto_if_set FLAG_MET_SCOTT_IN_FALLARBOR, FallarborTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo
msgbox FallarborTown_BattleTentLobby_Text_ScottLookingForSomeone, MSGBOX_DEFAULT
addvar VAR_SCOTT_STATE, 1
setflag FLAG_MET_SCOTT_IN_FALLARBOR
release
end
```
### FallarborTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo
```
msgbox FallarborTown_BattleTentLobby_Text_ScottMakeChallenge, MSGBOX_DEFAULT
release
end
```
### FallarborTown_BattleTentLobby_EventScript_RulesBoard
```
lockall
msgbox BattleFrontier_BattleArenaLobby_Text_RulesAreListed, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
end
```
### FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
```
message BattleFrontier_BattleArenaLobby_Text_ReadWhichHeading
waitmessage
multichoice 17, 0, MULTI_FALLARBOR_TENT_RULES, FALSE
switch VAR_RESULT
case 0, FallarborTown_BattleTentLobby_EventScript_RulesLevel
case 1, FallarborTown_BattleTentLobby_EventScript_RulesBattle
case 2, FallarborTown_BattleTentLobby_EventScript_RulesMind
case 3, FallarborTown_BattleTentLobby_EventScript_RulesSkill
case 4, FallarborTown_BattleTentLobby_EventScript_RulesBody
case 5, FallarborTown_BattleTentLobby_EventScript_ExitRules
case MULTI_B_PRESSED, FallarborTown_BattleTentLobby_EventScript_ExitRules
end
```
### FallarborTown_BattleTentLobby_EventScript_RulesLevel
```
msgbox BattleTentLobby_Text_ExplainLevelRules, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
end
```
### FallarborTown_BattleTentLobby_EventScript_RulesBattle
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainBattleRules, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
end
```
### FallarborTown_BattleTentLobby_EventScript_RulesMind
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainMindRules, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
end
```
### FallarborTown_BattleTentLobby_EventScript_RulesSkill
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainSkillRules, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
end
```
### FallarborTown_BattleTentLobby_EventScript_RulesBody
```
msgbox BattleFrontier_BattleArenaLobby_Text_ExplainBodyRules, MSGBOX_DEFAULT
goto FallarborTown_BattleTentLobby_EventScript_ReadRulesBoard
end
```
### FallarborTown_BattleTentLobby_EventScript_ExitRules
```
releaseall
end
```

## Textes (5)
### FallarborTown_BattleTentLobby_Text_MakeThinkImJustKid
```
Hé, hé…\pJe vais leur faire croire que je ne\nsuis qu'un petit garçon inoffensif.\pEt je vais les surprendre et piquer\nle titre!$
```
### FallarborTown_BattleTentLobby_Text_FallarborTentMyFavorite
```
Tu sais que les TENTES DE COMBAT ne\nproposent pas la même chose partout?\pMa préférée est de loin celle\nd'AUTEQUIA.\pJe trouve ça formidable de voir tous\nces DRESSEURS qui ont foi en leurs\lPOKéMON et se battent.$
```
### FallarborTown_BattleTentLobby_Text_CameToCampOut
```
J'ai entendu parler d'une tente. \nComme j'adore le camping, je suis venu!\pDans ma jeunesse, les tentes étaient\nbeaucoup moins confortables!\pPuisque je suis là, je vais participer\nà quelques combats!$
```
### FallarborTown_BattleTentLobby_Text_ScottLookingForSomeone
```
SCOTT: Salut, {PLAYER}{KUN}! De passage\ndans cette TENTE DE COMBAT?\pIci, les gens ont tendance à y aller\nmollo, si tu vois ce que je veux dire.\pMais moi, ce que je recherche,\nc'est autre chose…\pComment est-ce que je pourrais\ndire ça…\pJe veux des gens qui en veulent!\nQui se donnent à fond pour gagner!\pSi je trouvais un DRESSEUR comme ça,\nje t'assure que…\pOups! Enfin, je voulais dire…\nBonne chance à toi!$
```
### FallarborTown_BattleTentLobby_Text_ScottMakeChallenge
```
SCOTT: Au lieu de perdre ton temps\navec moi, pourquoi ne relèves-tu\lpas un défi?$
```

# BattleFrontier_BattlePikeLobby

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY`
- **layout** : `LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_LOBBY`
- **music** : `MUS_B_PIKE`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PIKE_LOBBY_ATTENDANT` | `OBJ_EVENT_GFX_LINK_RECEPTIONIST` | 5,5 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_BattlePikeLobby_EventScript_Attendant` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 10,9 | `MOVEMENT_TYPE_FACE_UP` | `BattleFrontier_BattlePikeLobby_EventScript_Hiker` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 0,5 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_BattlePikeLobby_EventScript_Twin` | `0` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 8,9 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_BattlePikeLobby_EventScript_Beauty` | `0` |

## Warps (3)
- #0 (5,12) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #0
- #1 (4,12) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #0
- #2 (6,12) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #0

## BG events / signs (2)
- (8,3) [sign] → `BattleFrontier_BattlePikeLobby_EventScript_ShowResults`
- (1,3) [sign] → `BattleFrontier_BattlePikeLobby_EventScript_RulesBoard`

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
- `BattleFrontier_EventScript_GetLvlMode`
- `BattleFrontier_Text_ObtainedXBattlePoints`
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (36)
### BattleFrontier_BattlePikeLobby_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, BattleFrontier_BattlePikeLobby_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, BattleFrontier_BattlePikeLobby_OnWarp
```
### BattleFrontier_BattlePikeLobby_OnFrame
```
map_script_2 VAR_TEMP_CHALLENGE_STATUS, 0, BattleFrontier_BattlePikeLobby_EventScript_GetChallengeStatus
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING, BattleFrontier_BattlePikeLobby_EventScript_QuitWithoutSaving
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_WON, BattleFrontier_BattlePikeLobby_EventScript_WonChallenge
map_script_2 VAR_TEMP_CHALLENGE_STATUS, CHALLENGE_STATUS_LOST, BattleFrontier_BattlePikeLobby_EventScript_LostChallenge
```
### BattleFrontier_BattlePikeLobby_OnWarp
```
map_script_2 VAR_TEMP_1, 0, BattleFrontier_BattlePikeLobby_EventScript_TurnPlayerNorth
```
### BattleFrontier_BattlePikeLobby_EventScript_TurnPlayerNorth
```
setvar VAR_TEMP_1, 1
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### BattleFrontier_BattlePikeLobby_EventScript_GetChallengeStatus
```
frontier_getstatus
end
```
### BattleFrontier_BattlePikeLobby_EventScript_QuitWithoutSaving
```
special HealPlayerParty
pike_resethelditems
lockall
msgbox BattleFrontier_BattlePikeLobby_Text_FailedToSaveBeforeQuitting, MSGBOX_DEFAULT
closemessage
pike_set PIKE_DATA_WIN_STREAK, 0
pike_set PIKE_DATA_WIN_STREAK_ACTIVE, FALSE
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattlePikeLobby_EventScript_WonChallenge
```
lockall
frontier_isbrain
goto_if_eq VAR_RESULT, TRUE, BattleFrontier_BattlePikeLobby_EventScript_DefeatedQueen
msgbox BattleFrontier_BattlePikeLobby_Text_PossessLuckInAbundance, MSGBOX_DEFAULT
waitmessage
goto BattleFrontier_BattlePikeLobby_EventScript_GiveBattlePoints
```
### BattleFrontier_BattlePikeLobby_EventScript_DefeatedQueen
```
msgbox BattleFrontier_BattlePikeLobby_Text_SnatchedVictoryFromQueen, MSGBOX_DEFAULT
waitmessage
```
### BattleFrontier_BattlePikeLobby_EventScript_GiveBattlePoints
```
msgbox BattleFrontier_BattlePikeLobby_Text_AwardYouTheseBattlePoints, MSGBOX_DEFAULT
frontier_givepoints
msgbox BattleFrontier_Text_ObtainedXBattlePoints, MSGBOX_GETPOINTS
frontier_checkairshow
pike_get PIKE_DATA_TOTAL_STREAKS
addvar VAR_RESULT, 1
pike_set PIKE_DATA_TOTAL_STREAKS, VAR_RESULT
special LoadPlayerParty
special HealPlayerParty
pike_resethelditems
message BattleFrontier_BattlePikeLobby_Text_ShallRecordResults
waitmessage
pike_save 0
playse SE_SAVE
waitse
msgbox BattleFrontier_BattlePikeLobby_Text_LookForwardToSeeingYou, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattlePikeLobby_EventScript_LostChallenge
```
lockall
message BattleFrontier_BattlePikeLobby_Text_ChallengeEndedRecordResults
waitmessage
frontier_checkairshow
frontier_set FRONTIER_DATA_BATTLE_NUM, 0
pike_set PIKE_DATA_WIN_STREAK_ACTIVE, FALSE
special LoadPlayerParty
special HealPlayerParty
pike_resethelditems
pike_save 0
playse SE_SAVE
waitse
msgbox BattleFrontier_BattlePikeLobby_Text_LookForwardToSeeingYou, MSGBOX_DEFAULT
closemessage
setvar VAR_TEMP_CHALLENGE_STATUS, 255
releaseall
end
```
### BattleFrontier_BattlePikeLobby_EventScript_Attendant
```
lock
faceplayer
setvar VAR_FRONTIER_FACILITY, FRONTIER_FACILITY_PIKE
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
special SavePlayerParty
msgbox BattleFrontier_BattlePikeLobby_Text_WelcomeToBattlePike, MSGBOX_DEFAULT
```
### BattleFrontier_BattlePikeLobby_EventScript_AskTakeChallenge
```
message BattleFrontier_BattlePikeLobby_Text_TakeChallenge
waitmessage
multichoice 17, 6, MULTI_CHALLENGEINFO, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattlePikeLobby_EventScript_TryEnterChallenge
case 1, BattleFrontier_BattlePikeLobby_EventScript_ExplainChallenge
case 2, BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattlePikeLobby_EventScript_TryEnterChallenge
```
message BattleFrontier_BattlePikeLobby_Text_WhichChallengeMode
waitmessage
multichoice 17, 6, MULTI_LEVEL_MODE, FALSE
switch VAR_RESULT
case FRONTIER_LVL_TENT, BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge
case MULTI_B_PRESSED, BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge
frontier_checkineligible
goto_if_eq VAR_0x8004, TRUE, BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMons
frontier_set FRONTIER_DATA_LVL_MODE, VAR_RESULT
msgbox BattleFrontier_BattlePikeLobby_Text_PleaseChooseThreeMons, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
call BattleFrontier_EventScript_GetLvlMode
copyvar VAR_0x8004, VAR_RESULT
setvar VAR_0x8005, FRONTIER_PARTY_SIZE
special ChoosePartyForBattleFrontier
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge
msgbox BattleFrontier_BattlePikeLobby_Text_SaveBeforeChallenge, MSGBOX_YESNO
switch VAR_RESULT
case NO, BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge
case YES, BattleFrontier_BattlePikeLobby_EventScript_SaveBeforeChallenge
case MULTI_B_PRESSED, BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge
```
### BattleFrontier_BattlePikeLobby_EventScript_SaveBeforeChallenge
```
setvar VAR_TEMP_CHALLENGE_STATUS, 0
setvar VAR_TEMP_1, 0
frontier_set FRONTIER_DATA_SELECTED_MON_ORDER
pike_init
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, CHALLENGE_STATUS_SAVING
pike_set PIKE_DATA_WIN_STREAK_ACTIVE, TRUE
pike_savehelditems
frontier_set FRONTIER_DATA_PAUSED, FALSE
special LoadPlayerParty
closemessage
delay 2
call Common_EventScript_SaveGame
setvar VAR_TEMP_CHALLENGE_STATUS, 255
pike_savehelditems
goto_if_eq VAR_RESULT, 0, BattleFrontier_BattlePikeLobby_EventScript_CancelChallengeSaveFailed
special SavePlayerParty
frontier_setpartyorder FRONTIER_PARTY_SIZE
msgbox BattleFrontier_BattlePikeLobby_Text_StepThisWay, MSGBOX_DEFAULT
closemessage
frontier_settrainers
call BattleFrontier_BattlePikeLobby_EventScript_WalkToCorridor
special HealPlayerParty
call BattleFrontier_BattlePike_EventScript_CloseCurtain
warpsilent MAP_BATTLE_FRONTIER_BATTLE_PIKE_CORRIDOR, 6, 7
setvar VAR_TEMP_CHALLENGE_STATUS, 0
waitstate
end
```
### BattleFrontier_BattlePikeLobby_EventScript_ExplainChallenge
```
msgbox BattleFrontier_BattlePikeLobby_Text_ExplainBattlePike, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_AskTakeChallenge
```
### BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMons
```
switch VAR_RESULT
case FRONTIER_LVL_50, BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLv50
case FRONTIER_LVL_OPEN, BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLvOpen
```
### BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLv50
```
msgbox BattleFrontier_BattlePikeLobby_Text_NotEnoughValidMonsLv50, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattlePikeLobby_EventScript_NotEnoughValidMonsLvOpen
```
msgbox BattleFrontier_BattlePikeLobby_Text_NotEnoughValidMonsLvOpen, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_EndCancelChallenge
```
### BattleFrontier_BattlePikeLobby_EventScript_CancelChallengeSaveFailed
```
frontier_set FRONTIER_DATA_CHALLENGE_STATUS, 0
goto BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge
```
### BattleFrontier_BattlePikeLobby_EventScript_LoadPartyAndCancelChallenge
```
special LoadPlayerParty
```
### BattleFrontier_BattlePikeLobby_EventScript_CancelChallenge
```
msgbox BattleFrontier_BattlePikeLobby_Text_LookForwardToSeeingYou, MSGBOX_DEFAULT
```
### BattleFrontier_BattlePikeLobby_EventScript_EndCancelChallenge
```
release
end
```
### BattleFrontier_BattlePikeLobby_EventScript_ShowResults
```
lockall
frontier_results FRONTIER_FACILITY_PIKE
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_BattlePikeLobby_EventScript_WalkToCorridor
```
applymovement LOCALID_PIKE_LOBBY_ATTENDANT, BattleFrontier_BattlePikeLobby_Movement_AttendantWalkToCorridor
applymovement LOCALID_PLAYER, BattleFrontier_BattlePikeLobby_Movement_PlayerWalkToCorridor
waitmovement 0
return
```
### BattleFrontier_BattlePikeLobby_Movement_PlayerWalkToCorridor
```
walk_up
```
### BattleFrontier_BattlePikeLobby_Movement_AttendantWalkToCorridor
```
walk_up
walk_up
set_invisible
step_end
```
### BattleFrontier_BattlePikeLobby_EventScript_Hiker
```
msgbox BattleFrontier_BattlePikeLobby_Text_OneRoomAwayFromGoal, MSGBOX_NPC
end
```
### BattleFrontier_BattlePikeLobby_EventScript_Twin
```
msgbox BattleFrontier_BattlePikeLobby_Text_NeverHadToBattleTrainer, MSGBOX_NPC
end
```
### BattleFrontier_BattlePikeLobby_EventScript_Beauty
```
msgbox BattleFrontier_BattlePikeLobby_Text_ThinkAbilitiesUsefulHere, MSGBOX_NPC
end
```
### BattleFrontier_BattlePikeLobby_EventScript_RulesBoard
```
lockall
msgbox BattleFrontier_BattlePikeLobby_Text_RulesAreListed, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard
```
message BattleFrontier_BattlePikeLobby_Text_ReadWhichHeading
waitmessage
multichoice 16, 4, MULTI_BATTLE_PIKE_RULES, FALSE
switch VAR_RESULT
case 0, BattleFrontier_BattlePikeLobby_EventScript_RulesPokenavBag
case 1, BattleFrontier_BattlePikeLobby_EventScript_RulesHeldItems
case 2, BattleFrontier_BattlePikeLobby_EventScript_RulesMonOrder
case 3, BattleFrontier_BattlePikeLobby_EventScript_ExitRules
case MULTI_B_PRESSED, BattleFrontier_BattlePikeLobby_EventScript_ExitRules
end
```
### BattleFrontier_BattlePikeLobby_EventScript_RulesPokenavBag
```
msgbox BattleFrontier_BattlePikeLobby_Text_ExplainPokenavBagRules, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePikeLobby_EventScript_RulesHeldItems
```
msgbox BattleFrontier_BattlePikeLobby_Text_ExplainHeldItemRules, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePikeLobby_EventScript_RulesMonOrder
```
msgbox BattleFrontier_BattlePikeLobby_Text_ExplainMonOrderRules, MSGBOX_DEFAULT
goto BattleFrontier_BattlePikeLobby_EventScript_ReadRulesBoard
end
```
### BattleFrontier_BattlePikeLobby_EventScript_ExitRules
```
releaseall
end
```
### BattleFrontier_BattlePike_EventScript_CloseCurtain
```
playse SE_PIKE_CURTAIN_CLOSE
special CloseBattlePikeCurtain
waitse
return
```

## Textes (27)
### BattleFrontier_BattlePikeLobby_Text_WelcomeToBattlePike
```
Bienvenue au REPTILE DE COMBAT…\pIci, nous mettons à l'épreuve la chance\ndes DRESSEURS…\pJe serai votre guide dans le\nREPTILE DE COMBAT…$
```
### BattleFrontier_BattlePikeLobby_Text_TakeChallenge
```
Voulez-vous relever le défi du\nCOMBAT HASARD?$
```
### BattleFrontier_BattlePikeLobby_Text_ExplainBattlePike
```
Ici, nous vous proposons le\nCOMBAT HASARD.\pLes règles du COMBAT HASARD sont\ntrès simples…\pIl faut choisir l'un des trois chemins et\nrejoindre la dernière salle à l'extrémité\ldu REPTILE DE COMBAT. C'est tout.\pCependant, ce qui se passe sur le\nchemin choisi n'est qu'une question\lde chance…\pSi vous rejoignez l'arrivée, vous\nrecevez des POINTS DE COMBAT.\pSi vous voulez interrompre votre défi,\nveuillez parler avec notre personnel\ldans les grandes salles.\pAssurez-vous de bien sauvegarder, ou\nvous ne pourrez pas reprendre le défi.$
```
### BattleFrontier_BattlePikeLobby_Text_LookForwardToSeeingYou
```
Nous attendrons votre prochain défi\navec impatience.$
```
### BattleFrontier_BattlePikeLobby_Text_WhichChallengeMode
```
Choisissez-vous niveau 50 ou niveau\nlibre?$
```
### BattleFrontier_BattlePikeLobby_Text_NotEnoughValidMonsLv50
```
Je regrette…\pVous n'avez pas trois POKéMON\naptes à participer au COMBAT HASARD.\pIl vous faut trois POKéMON différents\nde niveau 50 ou moins pour participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut…$
```
### BattleFrontier_BattlePikeLobby_Text_NotEnoughValidMonsLvOpen
```
Je regrette…\pVous n'avez pas trois POKéMON\naptes à participer au COMBAT HASARD.\pIl vous faut trois POKéMON différents\npour participer.\pIls doivent aussi tenir des objets\ndifférents.\pLes OEUFS{STR_VAR_1} inaptes au combat.\pRevenez me voir quand vous aurez\nce qu'il faut…$
```
### BattleFrontier_BattlePikeLobby_Text_PleaseChooseThreeMons
```
Veuillez choisir les trois POKéMON\nqui vous accompagneront…$
```
### BattleFrontier_BattlePikeLobby_Text_SaveBeforeChallenge
```
Avant de commencer un COMBAT HASARD,\nla partie doit être sauvegardée.\lCela vous convient-il?$
```
### BattleFrontier_BattlePikeLobby_Text_StepThisWay
```
Veuillez me suivre…$
```
### BattleFrontier_BattlePikeLobby_Text_ChallengeEndedRecordResults
```
Votre défi est terminé…\pVotre résultat va être sauvegardé.\nVeuillez patienter.$
```
### BattleFrontier_BattlePikeLobby_Text_PossessLuckInAbundance
```
Vous avez réussi votre défi…\pJe dois dire que vous avez énormément\nde chance…$
```
### BattleFrontier_BattlePikeLobby_Text_ShallRecordResults
```
Votre résultat va être sauvegardé.\nVeuillez patienter…$
```
### BattleFrontier_BattlePikeLobby_Text_AwardYouTheseBattlePoints2
```
To commemorate your completion of\nthe Battle Choice challenge, we award\lyou these Battle Point(s)…$
```
### BattleFrontier_BattlePikeLobby_Text_ReachedBattlePointLimit
```
You appear to have reached the limit\nfor Battle Points…\pPlease exchange some Battle Points\nfor prizes, then return…$
```
### BattleFrontier_BattlePikeLobby_Text_FailedToSaveBeforeQuitting
```
Je regrette…\pVous n'avez pas sauvegardé avant de\nquitter votre dernier défi.\pDans ce cas, c'est la disqualification.\nC'est dommage…$
```
### BattleFrontier_BattlePikeLobby_Text_SnatchedVictoryFromQueen
```
Félicitations…\pVous avez arraché la victoire à la\nREINE VENIN et réussi ce défi…$
```
### BattleFrontier_BattlePikeLobby_Text_AwardYouTheseBattlePoints
```
Votre chance va être récompensée par\ndes POINTS DE COMBAT…$
```
### BattleFrontier_BattlePikeLobby_Text_OneRoomAwayFromGoal
```
J'ai tout gâché! Je n'ai vraiment pas\nde chance… Et à une salle de l'arrivée!\pIci, c'est poison, gel et compagnie!$
```
### BattleFrontier_BattlePikeLobby_Text_NeverHadToBattleTrainer
```
J'ai terminé le défi 10 fois, mais je\nne me suis battue contre aucun\lDRESSEUR.$
```
### BattleFrontier_BattlePikeLobby_Text_ThinkAbilitiesUsefulHere
```
Ecoute! Ecoute!\pTu ne penses pas que les capacités\nspéciales des POKéMON risquent\ld'être utiles ici?$
```
### BattleFrontier_BattlePikeLobby_Text_TrainersWhicheverPathIChoose
```
What is this weird place?\nI can't figure it out at all!\pI've taken the challenge a bunch\nof times, but all I ever do is run into\lTRAINERS whichever path I choose.$
```
### BattleFrontier_BattlePikeLobby_Text_RulesAreListed
```
Règles du COMBAT HASARD.$
```
### BattleFrontier_BattlePikeLobby_Text_ReadWhichHeading
```
Quel chapitre voulez-vous lire?$
```
### BattleFrontier_BattlePikeLobby_Text_ExplainPokenavBagRules
```
Vous ne pouvez utiliser ni le SAC ni le\nPOKéNAV lors du défi du COMBAT\lHASARD.$
```
### BattleFrontier_BattlePikeLobby_Text_ExplainHeldItemRules
```
Lors du défi du COMBAT HASARD,\nchaque BAIE ou HERBE tenue par un\lPOKéMON n'aura d'effet qu'une fois.$
```
### BattleFrontier_BattlePikeLobby_Text_ExplainMonOrderRules
```
Lors du défi du COMBAT HASARD,\nl'ordre des POKéMON ne peut pas\lêtre modifié.\pL'ordre doit être décidé avant le\ndébut du défi.$
```

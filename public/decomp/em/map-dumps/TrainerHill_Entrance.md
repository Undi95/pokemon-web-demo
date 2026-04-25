# TrainerHill_Entrance

## Métadonnées
- **id** : `MAP_TRAINER_HILL_ENTRANCE`
- **layout** : `LAYOUT_TRAINER_HILL_ENTRANCE`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_TRAINER_HILL`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_TRAINER_HILL_ATTENDANT` | `OBJ_EVENT_GFX_TEALA` | 11,6 | `MOVEMENT_TYPE_FACE_LEFT` | `TrainerHill_Entrance_EventScript_Attendant` | `0` |
| `LOCALID_TRAINER_HILL_NURSE` | `OBJ_EVENT_GFX_NURSE` | 4,9 | `MOVEMENT_TYPE_FACE_DOWN` | `TrainerHill_Entrance_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 14,9 | `MOVEMENT_TYPE_FACE_DOWN` | `TrainerHill_Entrance_EventScript_Clerk` | `0` |
| `LOCALID_TRAINER_HILL_GIRL` | `OBJ_EVENT_GFX_GIRL_3` | 5,14 | `MOVEMENT_TYPE_WANDER_AROUND` | `TrainerHill_Entrance_EventScript_Girl` | `0` |
| `LOCALID_TRAINER_HILL_MAN` | `OBJ_EVENT_GFX_MAN_3` | 14,15 | `MOVEMENT_TYPE_WANDER_AROUND` | `TrainerHill_Entrance_EventScript_Man` | `0` |

## Warps (3)
- #0 (9,16) → `MAP_ROUTE111` warp #4
- #1 (10,16) → `MAP_ROUTE111` warp #4
- #2 (9,1) → `MAP_TRAINER_HILL_1F` warp #0

## Coord events / triggers (1)
- (9,6) → `TrainerHill_Entrance_EventScript_EntryTrigger` (si `VAR_TRAINER_HILL_IS_ACTIVE` == `0`)

## BG events / signs (1)
- (8,10) [sign] → `TrainerHill_Entrance_EventScript_Records`

## Flags référencés (2)
- `FLAG_LANDMARK_TRAINER_HILL`
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (7)
- `VAR_0x800B`
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`
- `VAR_TEMP_5`
- `VAR_TEMP_D`
- `VAR_TRAINER_HILL_IS_ACTIVE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (42)
### TrainerHill_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, TrainerHill_Entrance_OnResume
map_script MAP_SCRIPT_ON_RETURN_TO_FIELD, TrainerHill_Entrance_OnReturn
map_script MAP_SCRIPT_ON_TRANSITION, TrainerHill_Entrance_OnTransition
map_script MAP_SCRIPT_ON_LOAD, TrainerHill_Entrance_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, TrainerHill_Entrance_OnFrame
```
### TrainerHill_Entrance_OnTransition
```
setflag FLAG_LANDMARK_TRAINER_HILL
getplayerxy VAR_TEMP_D, VAR_RESULT
end
```
### TrainerHill_Entrance_OnWarp
```
end
```
### TrainerHill_Entrance_OnResume
```
trainerhill_resumetimer
setvar VAR_TEMP_0, 0
trainerhill_getusingereader
goto_if_eq VAR_RESULT, FALSE, TrainerHill_Entrance_EventScript_TryFaceAttendant  @ VAR_RESULT always FALSE here
setobjectxy LOCALID_PLAYER, 9, 6
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PlayerFaceAttendant
end
```
### TrainerHill_Entrance_EventScript_TryFaceAttendant
```
trainerhill_getwon
goto_if_eq VAR_RESULT, TRUE, TrainerHill_Entrance_EventScript_PlayerDontFaceAttendant
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PlayerFaceAttendant
end
```
### TrainerHill_Entrance_EventScript_PlayerDontFaceAttendant
```
end
```
### TrainerHill_Entrance_OnReturn
```
addobject LOCALID_TRAINER_HILL_NURSE
addobject LOCALID_TRAINER_HILL_ATTENDANT
addobject LOCALID_TRAINER_HILL_MAN
addobject LOCALID_TRAINER_HILL_GIRL
end
```
### TrainerHill_Entrance_OnLoad
```
call_if_eq VAR_TEMP_D, 17, TrainerHill_Entrance_EventScript_OpenCounterDoor
end
```
### TrainerHill_Entrance_EventScript_OpenCounterDoor
```
setmetatile 17, 10, METATILE_TrainerHill_GreenFloorTile, FALSE
return
```
### TrainerHill_Entrance_OnFrame
```
map_script_2 VAR_TEMP_0, 0, TrainerHill_Entrance_EventScript_ExitChallenge
map_script_2 VAR_TEMP_D, 17, TrainerHill_Entrance_EventScript_ExitElevator
map_script_2 VAR_TEMP_5, 1, TrainerHill_Entrance_EventScript_EntryTrigger
map_script_2 VAR_TEMP_1, 1, TrainerHill_EventScript_WarpToEntranceCounter
```
### TrainerHill_Entrance_EventScript_ExitElevator
```
lockall
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PlayerExitElevator
waitmovement 0
setmetatile 17, 10, METATILE_TrainerHill_CounterDoor, TRUE
special DrawWholeMapView
playse SE_CLICK
waitse
setvar VAR_TEMP_D, 0
releaseall
end
```
### TrainerHill_Entrance_EventScript_ExitChallenge
```
setvar VAR_TEMP_0, 1
trainerhill_getstatus
switch VAR_RESULT
case TRAINER_HILL_PLAYER_STATUS_LOST, TrainerHill_Entrance_EventScript_ExitChallengeLost
case TRAINER_HILL_PLAYER_STATUS_ECARD_SCANNED, TrainerHill_Entrance_EventScript_ExitChallengeECard
case TRAINER_HILL_PLAYER_STATUS_NORMAL, TrainerHill_Entrance_EventScript_EndExitChallenge
```
### TrainerHill_Entrance_EventScript_ExitChallengeLost
```
lockall
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PlayerFaceAttendant
msgbox TrainerHill_Entrance_Text_TooBadTremendousEffort, MSGBOX_DEFAULT
goto TrainerHill_Entrance_EventScript_PlayerExitChallenge
```
### TrainerHill_Entrance_EventScript_ExitChallengeECard
```
lockall
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PlayerFaceAttendant
msgbox TrainerHill_Entrance_Text_MovedReceptionHereForSwitch, MSGBOX_DEFAULT
```
### TrainerHill_Entrance_EventScript_PlayerExitChallenge
```
closemessage
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PushPlayerBackFromCounter
waitmovement 0
setvar VAR_TRAINER_HILL_IS_ACTIVE, 0
special HealPlayerParty
releaseall
```
### TrainerHill_Entrance_EventScript_EndExitChallenge
```
end
```
### TrainerHill_Entrance_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_TRAINER_HILL_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### TrainerHill_Entrance_EventScript_Attendant
```
lock
faceplayer
trainerhill_inchallenge
goto_if_eq VAR_RESULT, FALSE, TrainerHill_Entrance_EventScript_ThanksForPlaying
msgbox TrainerHill_Entrance_Text_HopeYouGiveItYourBest, MSGBOX_DEFAULT
goto TrainerHill_Entrance_EventScript_AttendantEnd
```
### TrainerHill_Entrance_EventScript_ThanksForPlaying
```
msgbox TrainerHill_Entrance_Text_ThankYouForPlaying, MSGBOX_DEFAULT
```
### TrainerHill_Entrance_EventScript_AttendantEnd
```
release
end
```
### TrainerHill_Entrance_EventScript_EntryTrigger
```
lockall
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PlayerFaceAttendant
goto_if_unset FLAG_SYS_GAME_CLEAR, TrainerHill_Entrance_EventScript_Closed
msgbox TrainerHill_Entrance_Text_WelcomeToTrainerHill, MSGBOX_DEFAULT
trainerhill_getsaved
call_if_eq VAR_RESULT, FALSE, TrainerHill_Entrance_EventScript_SaveGame
trainerhill_allfloorsused
goto_if_eq VAR_RESULT, TRUE, TrainerHill_Entrance_EventScript_AllFloorsUsed
msgbox TrainerHill_Entrance_Text_TrainersUpToFloorX, MSGBOX_DEFAULT
goto TrainerHill_Entrance_EventScript_AskChallengeTrainers
```
### TrainerHill_Entrance_EventScript_AllFloorsUsed
```
msgbox TrainerHill_Entrance_Text_TrainersInEveryRoom, MSGBOX_DEFAULT
```
### TrainerHill_Entrance_EventScript_AskChallengeTrainers
```
message TrainerHill_Entrance_Text_LikeToChallengeTrainers
waitmessage
multichoice 15, 6, MULTI_YESNOINFO, FALSE
switch VAR_RESULT
case 0, TrainerHill_Entrance_EventScript_ChooseChallenge
case 1, TrainerHill_Entrance_EventScript_CancelEntry
case 2, TrainerHill_Entrance_EventScript_Info
case MULTI_B_PRESSED, TrainerHill_Entrance_EventScript_CancelEntry
end
```
### TrainerHill_Entrance_EventScript_Info
```
msgbox TrainerHill_Entrance_Text_ExplainTrainerHill, MSGBOX_DEFAULT
goto TrainerHill_Entrance_EventScript_AskChallengeTrainers
end
```
### TrainerHill_Entrance_EventScript_ChooseChallenge
```
multichoice 13, 2, MULTI_TAG_MATCH_TYPE, FALSE
switch VAR_RESULT
case 4, TrainerHill_Entrance_EventScript_CancelEntry
case MULTI_B_PRESSED, TrainerHill_Entrance_EventScript_CancelEntry
trainerhill_setmode VAR_RESULT
setvar VAR_TRAINER_HILL_IS_ACTIVE, 1
setvar VAR_TEMP_5, 0
special HealPlayerParty
msgbox TrainerHill_Entrance_Text_TimeProgessGetSetGo, MSGBOX_DEFAULT
trainerhill_start
releaseall
end
```
### TrainerHill_Entrance_EventScript_CancelEntry
```
setvar VAR_TEMP_5, 0
msgbox TrainerHill_Entrance_Text_PleaseVisitUsAgain, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PushPlayerBackFromCounter
waitmovement 0
releaseall
end
```
### TrainerHill_Entrance_EventScript_SaveGame
```
msgbox TrainerHill_Entrance_Text_SaveGameBeforeEnter, MSGBOX_DEFAULT
trainerhill_setsaved
setvar VAR_TEMP_5, 1
call Common_EventScript_SaveGame
goto_if_eq VAR_RESULT, FALSE, TrainerHill_Entrance_EventScript_SaveFailed
trainerhill_setsaved
return
```
### TrainerHill_Entrance_EventScript_SaveFailed
```
trainerhill_clearsaved
goto TrainerHill_Entrance_EventScript_CancelEntry
end
```
### TrainerHill_Entrance_EventScript_Closed
```
msgbox TrainerHill_Entrance_Text_StillGettingReady, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, TrainerHill_Entrance_Movement_PushPlayerBackFromCounter
waitmovement 0
releaseall
end
```
### TrainerHill_Entrance_Movement_PlayerFaceAttendant
```
face_right
step_end
```
### TrainerHill_Entrance_Movement_PushPlayerBackFromCounter
```
walk_down
step_end
```
### TrainerHill_Entrance_Movement_FaceUp
```
face_up
step_end
```
### TrainerHill_Entrance_Movement_PlayerExitElevator
```
walk_down
walk_down
step_end
```
### TrainerHill_Entrance_EventScript_Records
```
lockall
fadescreen FADE_TO_BLACK
special ShowTrainerHillRecords
releaseall
end
```
### TrainerHill_Entrance_EventScript_Man
```
goto_if_unset FLAG_SYS_GAME_CLEAR, TrainerHill_Entrance_EventScript_ManTrainerHillClosed
msgbox TrainerHill_Entrance_Text_WhatSortOfTrainersAreAhead, MSGBOX_NPC
end
```
### TrainerHill_Entrance_EventScript_ManTrainerHillClosed
```
msgbox TrainerHill_Entrance_Text_CantWaitToTestTheWaters, MSGBOX_NPC
end
```
### TrainerHill_Entrance_EventScript_Girl
```
goto_if_unset FLAG_SYS_GAME_CLEAR, TrainerHill_Entrance_EventScript_GirlTrainerHillClosed
msgbox TrainerHill_Entrance_Text_FriendsTryingToReachTimeBoardTop, MSGBOX_NPC
end
```
### TrainerHill_Entrance_EventScript_GirlTrainerHillClosed
```
msgbox TrainerHill_Entrance_Text_DoYouKnowWhenTheyOpen, MSGBOX_NPC
end
```
### TrainerHill_Entrance_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
goto_if_set FLAG_SYS_GAME_CLEAR, TrainerHill_Entrance_EventScript_ExpandedPokemart
pokemart TrainerHill_Entrance_Pokemart_Basic
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### TrainerHill_Entrance_Pokemart_Basic
```
pokemartlistend
```
### TrainerHill_Entrance_EventScript_ExpandedPokemart
```
pokemart TrainerHill_Entrance_Pokemart_Expanded
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### TrainerHill_Entrance_Pokemart_Expanded
```
pokemartlistend
```

## Textes (27)
### TrainerHill_Entrance_Text_StillGettingReady
```
C'est le MONT DRESSEURS.\nIci, vous pouvez combattre contre\lplein de DRESSEURS.\pMalheureusement, on est en pleine\npréparation. Revenez plus tard!$
```
### TrainerHill_Entrance_Text_WelcomeToTrainerHill
```
Bienvenue!\pC'est le MONT DRESSEURS.\nIci, vous pouvez combattre contre\lplein de DRESSEURS.$
```
### TrainerHill_Entrance_Text_SaveGameBeforeEnter
```
C'est votre première visite ici?\pAvant d'entrer, vous devez sauvegarder\nla partie.$
```
### TrainerHill_Entrance_Text_TrainersUpToFloorX
```
Voyons voir…\nLes DRESSEURS ici présents sont…\pIls sont jusqu'au niveau nº {STR_VAR_1}.$
```
### TrainerHill_Entrance_Text_TrainersInEveryRoom
```
Voyons voir…\nLes DRESSEURS ici présents sont…\pOn dirait qu'il y a des DRESSEURS dans\ntoutes les salles.$
```
### TrainerHill_Entrance_Text_LikeToChallengeTrainers
```
Voulez-vous affronter les\nDRESSEURS qui patientent?$
```
### TrainerHill_Entrance_Text_TimeProgessGetSetGo
```
OK, je compte sur vous pour\navoir un beau spectacle.\pJe mets le chrono en marche.\pA vos marques…\pPrêts…\pPartez!$
```
### TrainerHill_Entrance_Text_PleaseVisitUsAgain
```
J'espère que vous reviendrez.$
```
### TrainerHill_Entrance_Text_TooBadTremendousEffort
```
Quel dommage.\pVous avez pourtant fait de\nvotre mieux.\pMais n'hésitez pas à revenir\nnous voir.$
```
### TrainerHill_Entrance_Text_HopeYouGiveItYourBest
```
Faites de votre mieux!$
```
### TrainerHill_Entrance_Text_MovedReceptionHereForSwitch
```
Ça peut être assez mouvementé\nquand les DRESSEURS changent\pde place. C'est pour ça qu'on est\ninstallés ici.\pDésolé pour ça.$
```
### TrainerHill_Entrance_Text_ThankYouForPlaying
```
Merci d'avoir participé!$
```
### TrainerHill_Entrance_Text_ExplainTrainerHill
```
Au MONT DRESSEURS, il y a\nune épreuve de Contre-la-Montre.\pVous devez aller de ce guichet au\npropriétaire qui se trouve sur le toit\lle plus vite possible.\pLes meilleurs temps sont affichés sur\nle Panneau des Temps. Essayez de\ldéfier vos amis!\pVous ne gagnerez pas de points\nEXP. ni d'argent en battant les\lDRESSEURS sur votre chemin.$
```
### TrainerHill_Entrance_Text_NeedAtLeastTwoPokemon
```
Oh, I'm sorry, but you appear to have\nonly one POKéMON with you.\pYou will need at least two POKéMON\nto enter this event.$
```
### TrainerHill_Roof_Text_YouFinallyCameBravo
```
Hum! Hum!\pTe voilà enfin!\nOui, te voilà!\pNon, ne dis rien!\nJe sais pourquoi tu as fait tout ce\lchemin!\pTu voulais me voir, moi le propriétaire\ndu MONT DRESSEURS…\pTu veux faire équipe avec moi!\nYouhou!\pHein?\nAh non?\pEn tout cas, tu as fait de très beaux\ncombats pour arriver ici! Bravo!$
```
### TrainerHill_Roof_Text_HaveTheMostMarvelousGift
```
Tu es un DRESSEUR hors du commun et\nj'ai un cadeau un peu spécial pour toi!$
```
### TrainerHill_Roof_Text_FullUpBeBackLaterForThis
```
Oh? Ton SAC est carrément plein.\nJ'attendrai que tu reviennes!$
```
### TrainerHill_Roof_Text_GotHereMarvelouslyQuickly
```
Oh… Avec quelle rapidité\ntu as grimpé jusqu'ici!\pC'est formidable! Tu avais vraiment\nhâte de me voir!\pÇa me fait très plaisir. Ton temps va\nêtre reporté sur le Panneau des Temps!$
```
### TrainerHill_Roof_Text_YouWerentVeryQuick
```
Mais, quel dommage…\nTu n'as pas été assez rapide.$
```
### TrainerHill_Roof_Text_ArriveZippierNextTime
```
Je pense que ça me ferait encore plus\nplaisir si tu étais encore plus rapide.\pEnsuite, je serais ravi de devenir ton\npartenaire!\pNous nous reverrons!$
```
### TrainerHill_Roof_Text_BuiltTrainerHillToFindPartner
```
I had the TRAINER HILL built for but\none reason and one only!\pTo find the most suitable partner\nwith whom I may form a tag team!$
```
### TrainerHill_Entrance_Text_ChallengeTime
```
{STR_VAR_1} min {STR_VAR_2},{STR_VAR_3} s$
```
### TrainerHill_Entrance_Text_WhatSortOfTrainersAreAhead
```
Qui sait quels DRESSEURS et quels\nPOKéMON se trouvent sur mon chemin…\pTout ce que je sais, c'est que rien ne\nm'arrêtera!$
```
### TrainerHill_Entrance_Text_CantWaitToTestTheWaters
```
Les DRESSEURS viennent de partout\npour grimper sur le MONT DRESSEURS.\pJ'ai hâte de commencer!\pJ'écraserai tout ceux qui se trouveront\nsur mon passage!$
```
### TrainerHill_Entrance_Text_FriendsTryingToReachTimeBoardTop
```
Tu vois ce Panneau des Temps?\pMes amis et moi voulons voir qui\narrivera en haut le plus vite.$
```
### TrainerHill_Entrance_Text_DoYouKnowWhenTheyOpen
```
Tu sais quand est-ce que ça va\nouvrir?\pJ'attends ici car je veux être le\npremier DRESSEUR à entrer!$
```
### TrainerHill_Elevator_Text_ReturnToReception
```
Voulez-vous retourner à la réception?$
```

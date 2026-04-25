# LittlerootTown_BrendansHouse_1F

## Métadonnées
- **id** : `MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F`
- **layout** : `LAYOUT_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F`
- **music** : `MUS_LITTLEROOT`
- **region_map_section** : `MAPSEC_LITTLEROOT_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PLAYERS_HOUSE_1F_MOM` | `OBJ_EVENT_GFX_MOM` | 2,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `PlayersHouse_1F_EventScript_Mom` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_MOM` |
| `` | `OBJ_EVENT_GFX_VIGOROTH_CARRYING_BOX` | 1,3 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `PlayersHouse_1F_EventScript_Vigoroth2` | `FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_2` |
| `` | `OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY` | 4,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_UP` | `PlayersHouse_1F_EventScript_Vigoroth1` | `FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_1` |
| `LOCALID_RIVALS_HOUSE_1F_MOM` | `OBJ_EVENT_GFX_WOMAN_4` | 2,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `RivalsHouse_1F_EventScript_RivalMom` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM` |
| `LOCALID_PLAYERS_HOUSE_1F_DAD` | `OBJ_EVENT_GFX_NORMAN` | 5,6 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_PLAYERS_HOUSE_DAD` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 1,5 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `RivalsHouse_1F_EventScript_RivalSibling` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING` |
| `LOCALID_RIVALS_HOUSE_1F_RIVAL` | `OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL` | 8,8 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_BRENDAN` |

## Warps (3)
- #0 (9,8) → `MAP_LITTLEROOT_TOWN` warp #1
- #1 (8,8) → `MAP_LITTLEROOT_TOWN` warp #1
- #2 (8,2) → `MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F` warp #0

## Coord events / triggers (4)
- (8,8) → `LittlerootTown_BrendansHouse_1F_EventScript_GoSeeRoom` (si `VAR_LITTLEROOT_INTRO_STATE` == `4`)
- (7,3) → `LittlerootTown_BrendansHouse_1F_EventScript_MeetRival0` (si `VAR_LITTLEROOT_RIVAL_STATE` == `2`)
- (8,4) → `LittlerootTown_BrendansHouse_1F_EventScript_MeetRival1` (si `VAR_LITTLEROOT_RIVAL_STATE` == `2`)
- (9,3) → `LittlerootTown_BrendansHouse_1F_EventScript_MeetRival2` (si `VAR_LITTLEROOT_RIVAL_STATE` == `2`)

## Flags référencés (5)
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_BRENDAN`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM`
- `FLAG_MET_RIVAL_MOM`
- `FLAG_RECEIVED_RUNNING_SHOES`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_LITTLEROOT_HOUSES_STATE_MAY`
- `VAR_LITTLEROOT_INTRO_STATE`
- `VAR_LITTLEROOT_RIVAL_STATE`
- `VAR_LITTLEROOT_TOWN_STATE`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `RivalsHouse_1F_Text_BrendanWhoAreYou`
- `RivalsHouse_1F_Text_OhYoureTheNewNeighbor`
### data/scripts/players_house.inc
- `PlayersHouse_1F_EventScript_EnterHouseMovingIn`
- `PlayersHouse_1F_EventScript_MomGoSeeRoom`
- `PlayersHouse_1F_EventScript_PetalburgGymReportMale`

## Scripts (37)
### LittlerootTown_BrendansHouse_1F_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, LittlerootTown_BrendansHouse_1F_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, LittlerootTown_BrendansHouse_1F_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, LittlerootTown_BrendansHouse_1F_OnFrame
```
### LittlerootTown_BrendansHouse_1F_OnLoad
```
call_if_lt VAR_LITTLEROOT_INTRO_STATE, 6, LittlerootTown_BrendansHouse_1F_EventScript_SetMovingBoxes
call_if_set FLAG_RECEIVED_RUNNING_SHOES, LittlerootTown_BrendansHouse_1F_EventScript_CheckShowShoesManual
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_SetMovingBoxes
```
setmetatile 5, 4, METATILE_BrendansMaysHouse_MovingBox_Open, TRUE
setmetatile 5, 2, METATILE_BrendansMaysHouse_MovingBox_Closed, TRUE
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_CheckShowShoesManual
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, LittlerootTown_BrendansHouse_1F_EventScript_ShowRunningShoesManual
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_ShowRunningShoesManual
```
setmetatile 3, 7, METATILE_BrendansMaysHouse_BookOnTable, TRUE
return
```
### LittlerootTown_BrendansHouse_1F_OnTransition
```
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 3, LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToDoor
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 5, LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToStairs
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 6, LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToTV
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToStairs
```
setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 8, 4
setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToTV
```
setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 4, 5
setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_MoveMomToDoor
```
setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 9, 8
setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_BrendansHouse_1F_OnFrame
```
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 3, LittlerootTown_BrendansHouse_1F_EventScript_EnterHouseMovingIn
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 5, LittlerootTown_BrendansHouse_1F_EventScript_GoUpstairsToSetClock
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 6, LittlerootTown_BrendansHouse_1F_EventScript_PetalburgGymReport
map_script_2 VAR_LITTLEROOT_HOUSES_STATE_MAY, 1, LittlerootTown_BrendansHouse_1F_EventScript_YoureNewNeighbor
map_script_2 VAR_LITTLEROOT_HOUSES_STATE_MAY, 3, PlayersHouse_1F_EventScript_GetSSTicketAndSeeLatiTV
```
### LittlerootTown_BrendansHouse_1F_EventScript_GoUpstairsToSetClock
```
lockall
msgbox PlayersHouse_1F_Text_GoSetTheClock, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs
applymovement LOCALID_PLAYERS_HOUSE_1F_MOM, LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs
waitmovement 0
warp MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F, 7, 1
waitstate
releaseall
end
```
### LittlerootTown_BrendansHouse_1F_Movement_PushTowardStairs
```
walk_up
step_end
```
### LittlerootTown_BrendansHouse_1F_EventScript_EnterHouseMovingIn
```
lockall
setvar VAR_0x8004, LOCALID_PLAYERS_HOUSE_1F_MOM
setvar VAR_0x8005, MALE
goto PlayersHouse_1F_EventScript_EnterHouseMovingIn
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_PetalburgGymReport
```
lockall
setvar VAR_0x8004, MALE
setvar VAR_0x8005, LOCALID_PLAYERS_HOUSE_1F_MOM
goto PlayersHouse_1F_EventScript_PetalburgGymReportMale
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_YoureNewNeighbor
```
lockall
playse SE_PIN
applymovement LOCALID_RIVALS_HOUSE_1F_MOM, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_RIVALS_HOUSE_1F_MOM, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_RIVALS_HOUSE_1F_MOM, LittlerootTown_BrendansHouse_1F_Movement_RivalMomApproach
waitmovement 0
special GetRivalSonDaughterString
msgbox RivalsHouse_1F_Text_OhYoureTheNewNeighbor, MSGBOX_DEFAULT
setflag FLAG_MET_RIVAL_MOM
setvar VAR_LITTLEROOT_HOUSES_STATE_MAY, 2
releaseall
end
```
### LittlerootTown_BrendansHouse_1F_Movement_RivalMomApproach
```
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### LittlerootTown_BrendansHouse_1F_EventScript_GoSeeRoom
```
lockall
setvar VAR_0x8004, LOCALID_PLAYERS_HOUSE_1F_MOM
setvar VAR_0x8005, MALE
applymovement VAR_0x8004, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
goto PlayersHouse_1F_EventScript_MomGoSeeRoom
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_MeetRival0
```
lockall
setvar VAR_0x8008, 0
goto LittlerootTown_BrendansHouse_1F_EventScript_MeetRival
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_MeetRival1
```
lockall
setvar VAR_0x8008, 1
goto LittlerootTown_BrendansHouse_1F_EventScript_MeetRival
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_MeetRival2
```
lockall
setvar VAR_0x8008, 2
goto LittlerootTown_BrendansHouse_1F_EventScript_MeetRival
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_MeetRival
```
playse SE_EXIT
delay 10
addobject LOCALID_RIVALS_HOUSE_1F_RIVAL
delay 30
playse SE_PIN
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, Common_Movement_Delay48
waitmovement 0
call_if_ne VAR_0x8008, 1, LittlerootTown_BrendansHouse_1F_EventScript_PlayerFaceBrendan
playbgm MUS_ENCOUNTER_BRENDAN, TRUE
call_if_eq VAR_0x8008, 0, LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer0
call_if_eq VAR_0x8008, 1, LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer1
call_if_eq VAR_0x8008, 2, LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer2
msgbox RivalsHouse_1F_Text_BrendanWhoAreYou, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8008, 0, LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs0
call_if_eq VAR_0x8008, 1, LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs1
call_if_eq VAR_0x8008, 2, LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs2
playse SE_EXIT
removeobject LOCALID_RIVALS_HOUSE_1F_RIVAL
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_BRENDAN
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL
clearflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_BEDROOM
delay 30
setvar VAR_LITTLEROOT_RIVAL_STATE, 3
setvar VAR_LITTLEROOT_TOWN_STATE, 1
savebgm MUS_DUMMY
fadedefaultbgm
releaseall
end
```
### LittlerootTown_BrendansHouse_1F_EventScript_PlayerFaceBrendan
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer0
```
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer0
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer1
```
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer1
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_BrendanApproachPlayer2
```
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer2
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer0
```
walk_in_place_faster_left
walk_left
walk_in_place_faster_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer1
```
walk_up
walk_up
walk_up
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_BrendanApproachPlayer2
```
walk_in_place_faster_right
walk_right
walk_in_place_faster_up
walk_up
walk_up
walk_up
walk_up
step_end
```
### LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs0
```
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit0
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs0
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs1
```
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit1
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs1
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_EventScript_BrendanGoUpstairs2
```
applymovement LOCALID_PLAYER, LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit2
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs2
waitmovement 0
return
```
### LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit0
```
delay_16
delay_8
walk_in_place_faster_right
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit1
```
delay_16
delay_8
walk_in_place_faster_right
delay_16
delay_16
walk_in_place_faster_up
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_PlayerWatchBrendanExit2
```
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs0
```
walk_in_place_faster_right
walk_right
walk_in_place_faster_up
walk_up
walk_up
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs1
```
walk_in_place_faster_right
walk_right
walk_in_place_faster_up
walk_up
walk_up
walk_in_place_faster_left
walk_left
walk_in_place_faster_up
walk_up
step_end
```
### LittlerootTown_BrendansHouse_1F_Movement_BrendanGoUpstairs2
```
walk_in_place_faster_left
walk_left
walk_in_place_faster_up
walk_up
walk_up
step_end
```

## Textes (29)
### PlayersHouse_1F_Text_IsntItNiceInHere
```
MAMAN: Alors, {PLAYER}?\nC'est joli ici, non?$
```
### PlayersHouse_1F_Text_MoversPokemonGoSetClock
```
Les POKéMON déménageurs font tout\nle travail et nettoient après.\pC'est vraiment pratique!\p{PLAYER}, ta chambre est à l'étage.\nVa voir à quoi elle ressemble, mon chou!\pPAPA a acheté une nouvelle horloge\npour fêter notre déménagement.\pN'oublie pas de la mettre à l'heure!$
```
### PlayersHouse_1F_Text_ArentYouInterestedInRoom
```
MAMAN: Eh bien, {PLAYER}?\pTu n'as pas envie de voir ta\nnouvelle chambre?$
```
### PlayersHouse_1F_Text_GoSetTheClock
```
MAMAN: {PLAYER}.\pVa mettre l'horloge de ta chambre à\nl'heure, mon chou.$
```
### PlayersHouse_1F_Text_OhComeQuickly
```
MAMAN: Oh! {PLAYER}, {PLAYER}!\nVite! Viens voir!$
```
### PlayersHouse_1F_Text_MaybeDadWillBeOn
```
MAMAN: Regarde! C'est l'ARENE de\nCLEMENTI-VILLE!\pOn va peut-être voir PAPA!$
```
### PlayersHouse_1F_Text_ItsOverWeMissedHim
```
MAMAN: Oh… C'est terminé.\pIls ont sûrement interviewé PAPA,\nmais on l'a raté. Dommage.$
```
### PlayersHouse_1F_Text_GoIntroduceYourselfNextDoor
```
Ah, tiens!\nL'un des amis de PAPA vit ici.\pIl s'appelle PROF. SEKO.\pC'est notre voisin. Tu pourrais aller\nlui dire bonjour et te présenter.$
```
### PlayersHouse_1F_Text_SeeYouHoney
```
MAMAN: A plus tard, mon chou!$
```
### PlayersHouse_1F_Text_DidYouMeetProfBirch
```
MAMAN: Tu as déjà rencontré le\nPROF. SEKO?$
```
### PlayersHouse_1F_Text_YouShouldRestABit
```
MAMAN: Comment ça va, {PLAYER}?\nTu as l'air raplapla.\pTu devrais peut-être te reposer.$
```
### PlayersHouse_1F_Text_TakeCareHoney
```
MAMAN: A bientôt, mon chou!$
```
### PlayersHouse_1F_Text_GotDadsBadgeHeresSomethingFromMom
```
MAMAN: Oh? PAPA t'a donné\nun BADGE?\pDans ce cas, je vais te donner ça!$
```
### PlayersHouse_1F_Text_DontPushYourselfTooHard
```
Ne t'épuise pas trop, mon chou. Tu peux\nrevenir à la maison quand tu veux.\pBon courage, mon poussin!$
```
### PlayersHouse_1F_Text_IsThatAPokenav
```
MAMAN: C'est un POKéNAV, mon chou? \nQuelqu'un de DEVON te l'a donné?\pDis, mon chou? Et si tu enregistrais\nta maman?\p… … …$
```
### PlayersHouse_1F_Text_RegisteredMom
```
Vous avez enregistré MAMAN\ndans le POKéNAV.$
```
### PlayersHouse_1F_Text_Vigoroth1
```
Vigooooh…$
```
### PlayersHouse_1F_Text_Vigoroth2
```
Gorooooh…$
```
### PlayersHouse_1F_Text_ReportFromPetalburgGym
```
JOURNALISTE: … Ce reportage vous a été\nprésenté devant l'ARENE de CLEMENTI.$
```
### PlayersHouse_1F_Text_TheresAMovieOnTV
```
Il y a un film à la télé.\pDeux hommes dansent sur un\ngrand piano.\pBon, il faut y aller!$
```
### PlayersHouse_1F_Text_RunningShoesManual
```
C'est le manuel d'instructions des\nCHAUSSURES DE SPORT.\p“Lorsque vous portez vos CHAUSSURES\nDE SPORT, appuyez sur le bouton B\lpour courir.”\p“Enfilez vos CHAUSSURES DE SPORT\net foncez droit devant!”$
```
### PlayersHouse_1F_Text_TicketFromBrineyCameForYou
```
PAPA: Hein?\pHé, mais c'est {PLAYER}!\pÇa fait un moment qu'on ne s'est pas\nvus. Tu as l'air d'avoir plus d'aplomb.\pC'est l'impression que tu me donnes.\nMais ton vieux père n'abandonne pas!\pAh, oui, j'ai quelque chose pour toi.\nUn certain M. MARCO m'a donné ça\lpour toi.$
```
### PlayersHouse_1F_Text_PortsInSlateportLilycove
```
PAPA: C'est un PASSE pour le ferry?\pSi ma mémoire est bonne, il y a des \nembarcadères à POIVRESSEL et à\lNENUCRIQUE pour le ferry.$
```
### PlayersHouse_1F_Text_BetterGetBackToGym
```
Je dois retourner à l'ARENE de\nCLEMENTI-VILLE.\pDésolé chérie, je dois déjà repartir.$
```
### PlayersHouse_1F_Text_DadShouldStayLonger
```
MAMAN: Ton PAPA est incroyable…\pIl n'est jamais à la maison et quand il\nrentre, il ne parle que de POKéMON.\pIl devrait se reposer et rentrer\nplus souvent.$
```
### PlayersHouse_1F_Text_IsThatABreakingStory
```
MAMAN: Est-ce que c'est un scoop?$
```
### PlayersHouse_1F_Text_LatiEmergencyNewsFlash
```
Et voici un bulletin spécial\nd'informations.\pSelon des témoignages, un POKéMON\nVOLANT de couleur BZZT… a été\laperçu à plusieurs endroits dans HOENN.\pL'identité de ce POKéMON n'a pas encore\nété déterminée.\pEt maintenant, voici votre film du soir\nen exclusivité.$
```
### PlayersHouse_1F_Text_WhatColorDidTheySay
```
MAMAN: {PLAYER}, tu as compris?\pQu'est-ce qu'ils ont dit à propos de la\ncouleur de ce POKéMON?$
```
### PlayersHouse_1F_Text_StillUnknownPokemon
```
MAMAN: Dire qu'il reste encore des\nPOKéMON inconnus à notre époque!$
```

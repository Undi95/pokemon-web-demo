# LittlerootTown_MaysHouse_1F

## Métadonnées
- **id** : `MAP_LITTLEROOT_TOWN_MAYS_HOUSE_1F`
- **layout** : `LAYOUT_LITTLEROOT_TOWN_MAYS_HOUSE_1F`
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
| `LOCALID_PLAYERS_HOUSE_1F_MOM` | `OBJ_EVENT_GFX_MOM` | 8,6 | `MOVEMENT_TYPE_FACE_LEFT` | `PlayersHouse_1F_EventScript_Mom` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM` |
| `` | `OBJ_EVENT_GFX_VIGOROTH_FACING_AWAY` | 6,5 | `MOVEMENT_TYPE_WALK_IN_PLACE_UP` | `PlayersHouse_1F_EventScript_Vigoroth1` | `FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_1` |
| `` | `OBJ_EVENT_GFX_VIGOROTH_CARRYING_BOX` | 9,3 | `MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT` | `PlayersHouse_1F_EventScript_Vigoroth2` | `FLAG_HIDE_LITTLEROOT_TOWN_PLAYERS_HOUSE_VIGOROTH_2` |
| `LOCALID_RIVALS_HOUSE_1F_MOM` | `OBJ_EVENT_GFX_WOMAN_4` | 8,7 | `MOVEMENT_TYPE_FACE_LEFT` | `RivalsHouse_1F_EventScript_RivalMom` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_MOM` |
| `LOCALID_PLAYERS_HOUSE_1F_DAD` | `OBJ_EVENT_GFX_NORMAN` | 5,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_PLAYERS_HOUSE_DAD` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 9,5 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `RivalsHouse_1F_EventScript_RivalSibling` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_SIBLING` |
| `LOCALID_RIVALS_HOUSE_1F_RIVAL` | `OBJ_EVENT_GFX_RIVAL_MAY_NORMAL` | 2,8 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MAY` |

## Warps (3)
- #0 (1,8) → `MAP_LITTLEROOT_TOWN` warp #0
- #1 (2,8) → `MAP_LITTLEROOT_TOWN` warp #0
- #2 (2,2) → `MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F` warp #0

## Coord events / triggers (4)
- (2,8) → `LittlerootTown_MaysHouse_1F_EventScript_GoSeeRoom` (si `VAR_LITTLEROOT_INTRO_STATE` == `4`)
- (1,3) → `LittlerootTown_MaysHouse_1F_EventScript_MeetRival0` (si `VAR_LITTLEROOT_RIVAL_STATE` == `2`)
- (2,4) → `LittlerootTown_MaysHouse_1F_EventScript_MeetRival1` (si `VAR_LITTLEROOT_RIVAL_STATE` == `2`)
- (3,3) → `LittlerootTown_MaysHouse_1F_EventScript_MeetRival2` (si `VAR_LITTLEROOT_RIVAL_STATE` == `2`)

## Flags référencés (7)
- `FLAG_DEFEATED_RIVAL_ROUTE103`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MAY`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM`
- `FLAG_MET_RIVAL_MOM`
- `FLAG_RECEIVED_RUNNING_SHOES`
- `FLAG_SYS_POKEMON_GET`

## Variables référencées (9)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_LITTLEROOT_HOUSES_STATE_BRENDAN`
- `VAR_LITTLEROOT_HOUSES_STATE_MAY`
- `VAR_LITTLEROOT_INTRO_STATE`
- `VAR_LITTLEROOT_RIVAL_STATE`
- `VAR_LITTLEROOT_TOWN_STATE`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `PlayersHouse_1F_Text_GoSetTheClock`
### data/scripts/players_house.inc
- `PlayersHouse_1F_EventScript_EnterHouseMovingIn`
- `PlayersHouse_1F_EventScript_MomGoSeeRoom`
- `PlayersHouse_1F_EventScript_PetalburgGymReportFemale`

## Scripts (42)
### LittlerootTown_MaysHouse_1F_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, LittlerootTown_MaysHouse_1F_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, LittlerootTown_MaysHouse_1F_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, LittlerootTown_MaysHouse_1F_OnFrame
```
### LittlerootTown_MaysHouse_1F_OnLoad
```
call_if_lt VAR_LITTLEROOT_INTRO_STATE, 6, LittlerootTown_MaysHouse_1F_EventScript_SetMovingBoxes
call_if_set FLAG_RECEIVED_RUNNING_SHOES, LittlerootTown_MaysHouse_1F_EventScript_CheckShowShoesManual
end
```
### LittlerootTown_MaysHouse_1F_EventScript_SetMovingBoxes
```
setmetatile 5, 4, METATILE_BrendansMaysHouse_MovingBox_Open, TRUE
setmetatile 5, 2, METATILE_BrendansMaysHouse_MovingBox_Closed, TRUE
return
```
### LittlerootTown_MaysHouse_1F_EventScript_CheckShowShoesManual
```
checkplayergender
goto_if_eq VAR_RESULT, FEMALE, LittlerootTown_MaysHouse_1F_EventScript_ShowRunningShoesManual
return
```
### LittlerootTown_MaysHouse_1F_EventScript_ShowRunningShoesManual
```
setmetatile 6, 7, METATILE_BrendansMaysHouse_BookOnTable, TRUE
return
```
### LittlerootTown_MaysHouse_1F_OnTransition
```
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 3, LittlerootTown_MaysHouse_1F_EventScript_MoveMomToDoor
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 5, LittlerootTown_MaysHouse_1F_EventScript_MoveMomToStairs
call_if_eq VAR_LITTLEROOT_INTRO_STATE, 6, LittlerootTown_MaysHouse_1F_EventScript_MoveMomToTV
end
```
### LittlerootTown_MaysHouse_1F_EventScript_MoveMomToStairs
```
setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 2, 4
setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MoveMomToTV
```
setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 6, 5
setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MoveMomToDoor
```
setobjectxyperm LOCALID_PLAYERS_HOUSE_1F_MOM, 1, 8
setobjectmovementtype LOCALID_PLAYERS_HOUSE_1F_MOM, MOVEMENT_TYPE_FACE_UP
return
```
### LittlerootTown_MaysHouse_1F_OnFrame
```
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 3, LittlerootTown_MaysHouse_1F_EventScript_EnterHouseMovingIn
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 5, LittlerootTown_MaysHouse_1F_EventScript_GoUpstairsToSetClock
map_script_2 VAR_LITTLEROOT_INTRO_STATE, 6, LittlerootTown_MaysHouse_1F_EventScript_PetalburgGymReport
map_script_2 VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 1, LittlerootTown_MaysHouse_1F_EventScript_YoureNewNeighbor
map_script_2 VAR_LITTLEROOT_HOUSES_STATE_MAY, 3, PlayersHouse_1F_EventScript_GetSSTicketAndSeeLatiTV
```
### LittlerootTown_MaysHouse_1F_EventScript_GoUpstairsToSetClock
```
lockall
msgbox PlayersHouse_1F_Text_GoSetTheClock, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_1F_Movement_PushTowardStairs
applymovement LOCALID_PLAYERS_HOUSE_1F_MOM, LittlerootTown_MaysHouse_1F_Movement_PushTowardStairs
waitmovement 0
warp MAP_LITTLEROOT_TOWN_MAYS_HOUSE_2F, 1, 1
waitstate
releaseall
end
```
### LittlerootTown_MaysHouse_1F_Movement_PushTowardStairs
```
walk_up
step_end
```
### LittlerootTown_MaysHouse_1F_EventScript_EnterHouseMovingIn
```
lockall
setvar VAR_0x8004, LOCALID_PLAYERS_HOUSE_1F_MOM
setvar VAR_0x8005, FEMALE
goto PlayersHouse_1F_EventScript_EnterHouseMovingIn
end
```
### LittlerootTown_MaysHouse_1F_EventScript_PetalburgGymReport
```
lockall
setvar VAR_0x8004, FEMALE
setvar VAR_0x8005, LOCALID_PLAYERS_HOUSE_1F_MOM
goto PlayersHouse_1F_EventScript_PetalburgGymReportFemale
end
```
### LittlerootTown_MaysHouse_1F_EventScript_YoureNewNeighbor
```
lockall
playse SE_PIN
applymovement LOCALID_RIVALS_HOUSE_1F_MOM, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_RIVALS_HOUSE_1F_MOM, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
applymovement LOCALID_RIVALS_HOUSE_1F_MOM, LittlerootTown_MaysHouse_1F_Movement_RivalMomApproach
waitmovement 0
special GetRivalSonDaughterString
msgbox RivalsHouse_1F_Text_OhYoureTheNewNeighbor, MSGBOX_DEFAULT
setflag FLAG_MET_RIVAL_MOM
setvar VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 2
releaseall
end
```
### LittlerootTown_MaysHouse_1F_Movement_RivalMomApproach
```
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### RivalsHouse_1F_EventScript_RivalMom
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_RIVAL_ROUTE103, RivalsHouse_1F_EventScript_GoHomeEverySoOften
goto_if_set FLAG_SYS_POKEMON_GET, RivalsHouse_1F_EventScript_RivalIsOnRoute103
goto_if_eq VAR_LITTLEROOT_RIVAL_STATE, 3, RivalsHouse_1F_EventScript_RivalTooBusy
special GetRivalSonDaughterString
msgbox RivalsHouse_1F_Text_LikeChildLikeFather, MSGBOX_DEFAULT
release
end
```
### RivalsHouse_1F_EventScript_RivalTooBusy
```
msgbox RivalsHouse_1F_Text_TooBusyToNoticeVisit, MSGBOX_DEFAULT
release
end
```
### RivalsHouse_1F_EventScript_RivalIsOnRoute103
```
msgbox RivalsHouse_1F_Text_WentOutToRoute103, MSGBOX_DEFAULT
release
end
```
### RivalsHouse_1F_EventScript_GoHomeEverySoOften
```
msgbox RivalsHouse_1F_Text_ShouldGoHomeEverySoOften, MSGBOX_DEFAULT
release
end
```
### RivalsHouse_1F_EventScript_RivalSibling
```
lock
faceplayer
special GetPlayerBigGuyGirlString
msgbox RivalsHouse_1F_Text_DoYouHavePokemon, MSGBOX_DEFAULT
release
end
```
### LittlerootTown_MaysHouse_1F_EventScript_GoSeeRoom
```
lockall
setvar VAR_0x8004, LOCALID_PLAYERS_HOUSE_1F_MOM
setvar VAR_0x8005, FEMALE
applymovement VAR_0x8004, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
goto PlayersHouse_1F_EventScript_MomGoSeeRoom
end
```
### LittlerootTown_MaysHouse_1F_EventScript_MeetRival0
```
lockall
setvar VAR_0x8008, 0
goto LittlerootTown_MaysHouse_1F_EventScript_MeetRival
end
```
### LittlerootTown_MaysHouse_1F_EventScript_MeetRival1
```
lockall
setvar VAR_0x8008, 1
goto LittlerootTown_MaysHouse_1F_EventScript_MeetRival
end
```
### LittlerootTown_MaysHouse_1F_EventScript_MeetRival2
```
lockall
setvar VAR_0x8008, 2
goto LittlerootTown_MaysHouse_1F_EventScript_MeetRival
end
```
### LittlerootTown_MaysHouse_1F_EventScript_MeetRival
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
call_if_ne VAR_0x8008, 1, LittlerootTown_MaysHouse_1F_EventScript_PlayerFaceMay
playbgm MUS_ENCOUNTER_MAY, TRUE
call_if_eq VAR_0x8008, 0, LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer0
call_if_eq VAR_0x8008, 1, LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer1
call_if_eq VAR_0x8008, 2, LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer2
msgbox RivalsHouse_1F_Text_MayWhoAreYou, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8008, 0, LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs0
call_if_eq VAR_0x8008, 1, LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs1
call_if_eq VAR_0x8008, 2, LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs2
playse SE_EXIT
removeobject LOCALID_RIVALS_HOUSE_1F_RIVAL
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MAY
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL
clearflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_BEDROOM
delay 30
setvar VAR_LITTLEROOT_RIVAL_STATE, 3
setvar VAR_LITTLEROOT_TOWN_STATE, 1
savebgm MUS_DUMMY
fadedefaultbgm
releaseall
end
```
### LittlerootTown_MaysHouse_1F_EventScript_PlayerFaceMay
```
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer0
```
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer0
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer1
```
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer1
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MayApproachPlayer2
```
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer2
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer0
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
### LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer1
```
walk_up
walk_up
walk_up
step_end
```
### LittlerootTown_MaysHouse_1F_Movement_MayApproachPlayer2
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
### LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs0
```
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit0
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs0
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs1
```
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit1
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs1
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_EventScript_MayGoUpstairs2
```
applymovement LOCALID_PLAYER, LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit2
applymovement LOCALID_RIVALS_HOUSE_1F_RIVAL, LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs2
waitmovement 0
return
```
### LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit0
```
delay_16
delay_8
walk_in_place_faster_right
step_end
```
### LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit1
```
delay_16
delay_8
walk_in_place_faster_right
delay_16
delay_16
walk_in_place_faster_up
step_end
```
### LittlerootTown_MaysHouse_1F_Movement_PlayerWatchMayExit2
```
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs0
```
walk_in_place_faster_right
walk_right
walk_in_place_faster_up
walk_up
walk_up
step_end
```
### LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs1
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
### LittlerootTown_MaysHouse_1F_Movement_MayGoUpstairs2
```
walk_in_place_faster_left
walk_left
walk_in_place_faster_up
walk_up
walk_up
step_end
```

## Textes (8)
### RivalsHouse_1F_Text_OhYoureTheNewNeighbor
```
Oh, bonjour. Qui es-tu?\p… … … … … … … … …\n… … … … … … … … …\pOh, tu es {PLAYER}{KUN}.\nNos maisons sont voisines.\pNotre {STR_VAR_1} a le même âge\nque toi.\pNotre {STR_VAR_1} avait hâte de te\nconnaître.\pTu devrais aller voir à l'étage.$
```
### RivalsHouse_1F_Text_LikeChildLikeFather
```
Les chiens ne font pas des chats.\pMon mari est aussi passionné de\nPOKéMON que l'est notre enfant.\pS'il n'est pas dans son LABO, il est\nquelque part dans l'herbe à fouiller.$
```
### RivalsHouse_1F_Text_TooBusyToNoticeVisit
```
{RIVAL}!\pJe suppose que notre enfant s'occupe\nde ses POKéMON et n'a pas le temps\lde discuter avec toi, {PLAYER}{KUN}.$
```
### RivalsHouse_1F_Text_WentOutToRoute103
```
Oh, {RIVAL} doit être sur la ROUTE 103.\pÇa doit venir de son père.\n{RIVAL} ne tient pas en place non plus.$
```
### RivalsHouse_1F_Text_ShouldGoHomeEverySoOften
```
Je trouve ça merveilleux de voyager\navec des POKéMON.\pMais tu devrais revenir à la maison de\ntemps en temps pour éviter que ta\lmaman ne s'inquiète.\pElle n'en parle peut-être pas, mais je\nsuis sûre qu'elle se fait du souci\lpour toi, {PLAYER}{KUN}.$
```
### RivalsHouse_1F_Text_MayWhoAreYou
```
Hein?\nQui… Qui es-tu?\p… … … … … … … …\n… … … … … … … …\pOh, tu es {PLAYER}{KUN}.\nDonc, tu as emménagé aujourd'hui.\pHeu… Je m'appelle FLORA.\nEnchantée de te rencontrer!\pJe…\nJ'ai rêvé que les POKéMON du monde\lentier devenaient mes amis.\pJ… J'ai entendu parler de toi, {PLAYER}{KUN}.\nPar mon papa, le PROF. SEKO.\pJ'espérais que tu serais sympa,\n{PLAYER}{KUN}, et qu'on pourrait devenir amis.\pOh, c'est un peu bête, non?\nJe… Je te connais à peine, {PLAYER}{KUN}.\pHi hi hi hi…\pOh, non! J'ai oublié que j'avais quelque\nchose à faire!\pJe devais aller aider papa à attraper\ndes POKéMON sauvages!\p{PLAYER}{KUN}, on se retrouve plus tard. OK?$
```
### RivalsHouse_1F_Text_BrendanWhoAreYou
```
Hé!\nToi…\pQui es-tu?\pOh, mais tu es {PLAYER}, n'est-ce pas?\nTu viens d'emménager à côté, c'est ça?\pJe ne savais pas que tu étais une fille.\pMon père, le PROF. SEKO, m'a dit que\nle père du nouvel arrivant était un\lCHAMPION D'ARENE, donc j'ai supposé\lque tu étais un garçon.\pJe m'appelle BRICE.\nEh bien, bonjour, voisine!\pMais? Hé, {PLAYER}, tu n'as pas de\nPOKéMON?\pTu veux que je t'en attrape un?\pOh, non, mince, j'oubliais…\pJe dois aller aider mon père à attraper\ndes POKéMON sauvages.\pA très bientôt, OK?$
```
### RivalsHouse_1F_Text_DoYouHavePokemon
```
Salut, toi!\pEst-ce que tu as déjà des\nPOKéMON à toi?$
```

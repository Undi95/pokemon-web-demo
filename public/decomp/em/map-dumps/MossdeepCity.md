# MossdeepCity

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY`
- **layout** : `LAYOUT_MOSSDEEP_CITY`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_CITY`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE125`
- down (offset 0) → `MAP_ROUTE127`
- left (offset -40) → `MAP_ROUTE124`

## Object events (17 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SAILOR` | 38,12 | `MOVEMENT_TYPE_WANDER_AROUND` | `MossdeepCity_EventScript_Sailor` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 50,34 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `MossdeepCity_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 32,12 | `MOVEMENT_TYPE_WANDER_AROUND` | `MossdeepCity_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 26,21 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `MossdeepCity_EventScript_NinjaBoy` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_1` | 45,18 | `MOVEMENT_TYPE_FACE_LEFT` | `MossdeepCity_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 62,35 | `MOVEMENT_TYPE_LOOK_AROUND` | `MossdeepCity_EventScript_ItemNetBall` | `FLAG_ITEM_MOSSDEEP_CITY_NET_BALL` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 55,5 | `MOVEMENT_TYPE_FACE_UP` | `MossdeepCity_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 56,21 | `MOVEMENT_TYPE_FACE_RIGHT` | `MossdeepCity_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 23,13 | `MOVEMENT_TYPE_WANDER_AROUND` | `MossdeepCity_EventScript_KingsRockBoy` | `0` |
| `LOCALID_MOSSDEEP_GRUNT_1` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 44,23 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA` |
| `LOCALID_MOSSDEEP_GRUNT_2` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 44,24 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA` |
| `LOCALID_MOSSDEEP_GRUNT_3` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 44,25 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA` |
| `LOCALID_MOSSDEEP_GRUNT_4` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 44,26 | `MOVEMENT_TYPE_FACE_UP` | `0x0` | `FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA` |
| `LOCALID_MOSSDEEP_MAXIE` | `OBJ_EVENT_GFX_MAXIE` | 45,25 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 19,25 | `MOVEMENT_TYPE_WALK_IN_PLACE_DOWN` | `MossdeepCity_EventScript_DynamicPunchTutor` | `0` |
| `LOCALID_MOSSDEEP_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 61,29 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `MossdeepCity_EventScript_Scott` | `FLAG_HIDE_MOSSDEEP_CITY_SCOTT` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 31,29 | `MOVEMENT_TYPE_WALK_IN_PLACE_DOWN` | `MossdeepCity_EventScript_BlackBelt` | `0` |

## Warps (10)
- #0 (28,9) → `MAP_MOSSDEEP_CITY_HOUSE1` warp #0
- #1 (38,9) → `MAP_MOSSDEEP_CITY_GYM` warp #0
- #2 (28,16) → `MAP_MOSSDEEP_CITY_POKEMON_CENTER_1F` warp #0
- #3 (67,25) → `MAP_MOSSDEEP_CITY_HOUSE2` warp #0
- #4 (37,18) → `MAP_MOSSDEEP_CITY_MART` warp #0
- #5 (49,6) → `MAP_MOSSDEEP_CITY_HOUSE3` warp #0
- #6 (19,10) → `MAP_MOSSDEEP_CITY_STEVENS_HOUSE` warp #0
- #7 (18,16) → `MAP_MOSSDEEP_CITY_HOUSE4` warp #1
- #8 (64,15) → `MAP_MOSSDEEP_CITY_SPACE_CENTER_1F` warp #0
- #9 (36,24) → `MAP_MOSSDEEP_CITY_GAME_CORNER_1F` warp #0

## Coord events / triggers (10)
- (25,25) → `MossdeepCity_EventScript_VisitedMossdeep` (si `VAR_TEMP_1` == `0`)
- (26,25) → `MossdeepCity_EventScript_VisitedMossdeep` (si `VAR_TEMP_1` == `0`)
- (32,27) → `MossdeepCity_EventScript_VisitedMossdeep` (si `VAR_TEMP_1` == `0`)
- (33,27) → `MossdeepCity_EventScript_VisitedMossdeep` (si `VAR_TEMP_1` == `0`)
- (42,21) → `MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter` (si `VAR_MOSSDEEP_CITY_STATE` == `1`)
- (41,22) → `MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter` (si `VAR_MOSSDEEP_CITY_STATE` == `1`)
- (41,23) → `MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter` (si `VAR_MOSSDEEP_CITY_STATE` == `1`)
- (41,24) → `MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter` (si `VAR_MOSSDEEP_CITY_STATE` == `1`)
- (40,25) → `MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter` (si `VAR_MOSSDEEP_CITY_STATE` == `1`)
- (40,26) → `MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter` (si `VAR_MOSSDEEP_CITY_STATE` == `1`)

## BG events / signs (8)
- (25,16) [sign] → `MossdeepCity_EventScript_CitySign`
- (34,9) [sign] → `MossdeepCity_EventScript_GymSign`
- (29,16) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (38,18) [sign] → `Common_EventScript_ShowPokemartSign`
- (66,16) [sign] → `MossdeepCity_EventScript_SpaceCenterSign`
- (30,16) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (39,18) [sign] → `Common_EventScript_ShowPokemartSign`
- (57,21) [sign] → `MossdeepCity_EventScript_WhiteRock`

## Flags référencés (9)
- `FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA`
- `FLAG_MOSSDEEP_GYM_SWITCH_1`
- `FLAG_MOSSDEEP_GYM_SWITCH_2`
- `FLAG_MOSSDEEP_GYM_SWITCH_3`
- `FLAG_MOSSDEEP_GYM_SWITCH_4`
- `FLAG_RECEIVED_HM_DIVE`
- `FLAG_RECEIVED_KINGS_ROCK`
- `FLAG_SYS_WEATHER_CTRL`
- `FLAG_VISITED_MOSSDEEP_CITY`

## Variables référencées (6)
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_MOSSDEEP_CITY_STATE`
- `VAR_RESULT`
- `VAR_SCOTT_STATE`
- `VAR_TEMP_1`

## Scripts (34)
### MossdeepCity_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, MossdeepCity_OnTransition
```
### MossdeepCity_OnTransition
```
clearflag FLAG_MOSSDEEP_GYM_SWITCH_1
clearflag FLAG_MOSSDEEP_GYM_SWITCH_2
clearflag FLAG_MOSSDEEP_GYM_SWITCH_3
clearflag FLAG_MOSSDEEP_GYM_SWITCH_4
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
end
```
### MossdeepCity_EventScript_PokefanF
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_HM_DIVE, MossdeepCity_EventScript_PokefanFMagmaGone
msgbox MossdeepCity_Text_SpaceCenterReceivedLetter, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_EventScript_PokefanFMagmaGone
```
msgbox MossdeepCity_Text_SpaceCenterLaunchingRockets, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_EventScript_Sailor
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_HM_DIVE, MossdeepCity_EventScript_SailorMagmaGone
msgbox MossdeepCity_Text_MossdeepTargetedByMagma, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_EventScript_SailorMagmaGone
```
msgbox MossdeepCity_Text_FeelReliefOnLand, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_EventScript_NinjaBoy
```
msgbox MossdeepCity_Text_WailmerWatching, MSGBOX_NPC
end
```
### MossdeepCity_EventScript_ExpertM
```
msgbox MossdeepCity_Text_LifeNeedsSeaToLive, MSGBOX_NPC
end
```
### MossdeepCity_EventScript_Girl
```
msgbox MossdeepCity_Text_NiceIfWorldCoveredByFlowers, MSGBOX_NPC
end
```
### MossdeepCity_EventScript_Woman
```
msgbox MossdeepCity_Text_SpecialSpaceCenterRock, MSGBOX_NPC
end
```
### MossdeepCity_EventScript_WhiteRock
```
msgbox MossdeepCity_Text_ItsAWhiteRock, MSGBOX_SIGN
end
```
### MossdeepCity_EventScript_GymSign
```
msgbox MossdeepCity_Text_GymSign, MSGBOX_SIGN
end
```
### MossdeepCity_EventScript_CitySign
```
msgbox MossdeepCity_Text_CitySign, MSGBOX_SIGN
end
```
### MossdeepCity_EventScript_SpaceCenterSign
```
msgbox MossdeepCity_Text_SpaceCenterSign, MSGBOX_SIGN
end
```
### MossdeepCity_EventScript_VisitedMossdeep
```
setflag FLAG_VISITED_MOSSDEEP_CITY
setvar VAR_TEMP_1, 1
end
```
### MossdeepCity_EventScript_TeamMagmaEnterSpaceCenter
```
lockall
applymovement LOCALID_MOSSDEEP_MAXIE, MossdeepCity_Movement_MaxieGestureToSpaceCenter
waitmovement 0
applymovement LOCALID_MOSSDEEP_GRUNT_1, MossdeepCity_Movement_GruntFaceSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_2, MossdeepCity_Movement_GruntFaceSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_3, MossdeepCity_Movement_GruntFaceSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_4, MossdeepCity_Movement_GruntFaceSpaceCenter
waitmovement 0
applymovement LOCALID_MOSSDEEP_MAXIE, MossdeepCity_Movement_MaxieEnterSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_1, MossdeepCity_Movement_Grunt1EnterSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_2, MossdeepCity_Movement_Grunt2EnterSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_3, MossdeepCity_Movement_Grunt3EnterSpaceCenter
applymovement LOCALID_MOSSDEEP_GRUNT_4, MossdeepCity_Movement_Grunt4EnterSpaceCenter
waitmovement 0
removeobject LOCALID_MOSSDEEP_MAXIE
removeobject LOCALID_MOSSDEEP_GRUNT_1
removeobject LOCALID_MOSSDEEP_GRUNT_2
removeobject LOCALID_MOSSDEEP_GRUNT_3
removeobject LOCALID_MOSSDEEP_GRUNT_4
delay 30
setvar VAR_MOSSDEEP_CITY_STATE, 2
setflag FLAG_HIDE_MOSSDEEP_CITY_TEAM_MAGMA
releaseall
end
```
### MossdeepCity_Movement_MaxieGestureToSpaceCenter
```
delay_16
face_right
delay_16
delay_16
delay_16
delay_16
face_left
delay_16
delay_16
step_end
```
### MossdeepCity_Movement_GruntFaceSpaceCenter
```
face_right
delay_16
delay_16
delay_16
step_end
```
### MossdeepCity_Movement_MaxieEnterSpaceCenter
```
walk_down
walk_right
walk_right
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MossdeepCity_Movement_Grunt1EnterSpaceCenter
```
delay_16
delay_8
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MossdeepCity_Movement_Grunt2EnterSpaceCenter
```
delay_16
delay_8
walk_down
walk_down
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MossdeepCity_Movement_Grunt3EnterSpaceCenter
```
delay_16
delay_8
walk_down
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MossdeepCity_Movement_Grunt4EnterSpaceCenter
```
delay_16
delay_8
walk_right
walk_right
walk_right
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MossdeepCity_EventScript_Man
```
lock
faceplayer
msgbox MossdeepCity_Text_SurfExhilarating, MSGBOX_DEFAULT
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### MossdeepCity_EventScript_KingsRockBoy
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_KINGS_ROCK, MossdeepCity_EventScript_ReceivedKingsRock
msgbox MossdeepCity_Text_WantKingsRockStevenGaveMe, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MossdeepCity_EventScript_DeclineKingsRock
msgbox MossdeepCity_Text_YouCanKeepIt, MSGBOX_DEFAULT
giveitem ITEM_KINGS_ROCK
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_KINGS_ROCK
release
end
```
### MossdeepCity_EventScript_ReceivedKingsRock
```
msgbox MossdeepCity_Text_StevensHouseOverThere, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_EventScript_DeclineKingsRock
```
msgbox MossdeepCity_Text_WhatToDoWithWeirdRock, MSGBOX_DEFAULT
release
end
```
### MossdeepCity_EventScript_BlackBelt
```
msgbox MossdeepCity_Text_SootopolisNewGymLeader, MSGBOX_NPC
end
```
### MossdeepCity_EventScript_Scott
```
lock
faceplayer
msgbox MossdeepCity_Text_ScottSomethingWrongWithTown, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_NORTH, MossdeepCity_EventScript_ScottExitNorth
call_if_eq VAR_FACING, DIR_EAST, MossdeepCity_EventScript_ScottExitEast
addvar VAR_SCOTT_STATE, 1
removeobject LOCALID_MOSSDEEP_SCOTT
release
end
```
### MossdeepCity_EventScript_ScottExitNorth
```
applymovement LOCALID_PLAYER, MossdeepCity_Movement_PlayerWatchScottExit
applymovement LOCALID_MOSSDEEP_SCOTT, MossdeepCity_Movement_ScottExitNorth
waitmovement 0
return
```
### MossdeepCity_EventScript_ScottExitEast
```
applymovement LOCALID_PLAYER, MossdeepCity_Movement_PlayerWatchScottExit
applymovement LOCALID_MOSSDEEP_SCOTT, MossdeepCity_Movement_ScottExitEast
waitmovement 0
return
```
### MossdeepCity_Movement_PlayerWatchScottExit
```
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### MossdeepCity_Movement_ScottExitNorth
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### MossdeepCity_Movement_ScottExitEast
```
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```

## Textes (19)
### MossdeepCity_Text_WantKingsRockStevenGaveMe
```
C'est PIERRE qui m'a donné ça, mais\nje ne sais pas à quoi ça sert au juste.\pJe crois qu'on appelle ça la ROCHE\nROYALE. Tu la veux?$
```
### MossdeepCity_Text_YouCanKeepIt
```
Pourquoi en voudrais-tu?\nC'est bizarre.\pTu peux la garder, mais il ne faut pas\nque PIERRE le sache.$
```
### MossdeepCity_Text_StevensHouseOverThere
```
La maison de PIERRE est juste là!$
```
### MossdeepCity_Text_WhatToDoWithWeirdRock
```
Hé, tu trouves aussi! Qu'est-ce qu'on\npeut bien pouvoir faire avec de drôles\lde pierres?$
```
### MossdeepCity_Text_WailmerWatching
```
Aux alentours d'ALGATIA, tu peux\nvoir des WAILMER sauvages.\pÇa s'appelle, euh…\nComment c'est déjà…\pAttends, attends, attends…\pL'observation de WAILMER!$
```
### MossdeepCity_Text_SpaceCenterReceivedLetter
```
Ce CENTRE SPATIAL insulaire a lancé\nde très grosses fusées.\pMais ils sont très inquiets depuis qu'ils\nont reçu une certaine lettre.$
```
### MossdeepCity_Text_SpaceCenterLaunchingRockets
```
Ce CENTRE SPATIAL insulaire a lancé\nde très grosses fusées.$
```
### MossdeepCity_Text_MossdeepTargetedByMagma
```
J'ai appris d'un ami MARIN que la\nTEAM AQUA s'est installée à NENUCRIQUE.\pJ'ai aussi appris que quelqu'un s'est\nmêlé de leurs affaires!\pMais ALGATIA est déjà la cible de la\nTEAM MAGMA.\pSi tu veux savoir ce qu'ils manigancent,\ntu devrais aller au CENTRE SPATIAL.$
```
### MossdeepCity_Text_FeelReliefOnLand
```
Je suis MARIN, la mer est donc très\nimportante pour moi.\pMais tu sais, après un long voyage\nen mer, je me sens soulagé de poser\lle pied à terre.$
```
### MossdeepCity_Text_NiceIfWorldCoveredByFlowers
```
Ça ne serait pas charmant?\pSi le monde entier était recouvert de\nplantes et de fleurs comme cette île?$
```
### MossdeepCity_Text_LifeNeedsSeaToLive
```
Toute forme de vie, même terrestre,\na besoin de la mer pour vivre.\pLa vie, une fois consumée, n'est plus\nque poussière qui retourne à la terre.\pEt la mer est toujours reliée à la terre.\pOui, comme le rivage ici.$
```
### MossdeepCity_Text_SurfExhilarating
```
C'est sympa de voyager sur un bateau.\pMais traverser la mer avec un POKéMON\nqui utilise SURF…\pLà, c'est un voyage grisant!\nT'es pas d'accord, mon p'tit?$
```
### MossdeepCity_Text_SpecialSpaceCenterRock
```
Cette pierre a un sens particulier\npour les gens du CENTRE SPATIAL.\pIls l'ont posée là et fait le vœu que\nleurs fusées volent en toute sécurité.\pTu fais comment, toi, pour faire un\nvœu? T'attends de voir une étoile\lfilante?\pMoi, je jette une pièce dans une\nfontaine pour que mon vœu se réalise.$
```
### MossdeepCity_Text_ItsAWhiteRock
```
C'est une pierre blanche.$
```
### MossdeepCity_Text_GymSign
```
ARENE POKéMON d'ALGATIA\nCHAMPIONS: TATIA et LEVY\p“La combinaison mystique!”$
```
### MossdeepCity_Text_CitySign
```
ALGATIA\n“Notre slogan: chérir les POKéMON!”$
```
### MossdeepCity_Text_SpaceCenterSign
```
CENTRE SPATIAL D'ALGATIA\n“L'endroit le plus proche de l'espace.”$
```
### MossdeepCity_Text_ScottSomethingWrongWithTown
```
SCOTT: Comment ça va, {PLAYER}{KUN}?\nPour moi ça roule en tout cas!\pJ'ai entendu dire que le CHAMPION\nD'ARENE d'ALGATIA est assez fort, alors\lje viens voir ça de mes propres yeux.\pMais il y a quelque chose d'étrange\nqui se passe ici.\pLes gens parlent d'une lettre et du\nCENTRE SPATIAL…\pMais tout ça ne me concerne pas de\ntoute façon.$
```
### MossdeepCity_Text_SootopolisNewGymLeader
```
Ahhh… C'est tellement bon de laisser\nles embruns caresser mon visage…\pEn parlant de la mer, tu connais cette\nville insulaire, ATALANOPOLIS?\pJe crois qu'ils ont un nouveau CHAMPION\ndans leur ARENE.\pIl paraît que ce nouveau CHAMPION\nétait le mentor de MARC.$
```

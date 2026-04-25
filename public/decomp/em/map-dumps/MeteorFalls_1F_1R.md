# MeteorFalls_1F_1R

## Métadonnées
- **id** : `MAP_METEOR_FALLS_1F_1R`
- **layout** : `LAYOUT_METEOR_FALLS_1F_1R`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_METEOR_FALLS`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (10 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 2,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `MeteorFalls_1F_1R_EventScript_ItemTMIronTail` | `FLAG_ITEM_METEOR_FALLS_1F_1R_TM_IRON_TAIL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 2,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `MeteorFalls_1F_1R_EventScript_ItemMoonStone` | `FLAG_ITEM_METEOR_FALLS_1F_1R_MOON_STONE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 27,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `MeteorFalls_1F_1R_EventScript_ItemFullHeal` | `FLAG_ITEM_METEOR_FALLS_1F_1R_FULL_HEAL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 26,32 | `MOVEMENT_TYPE_LOOK_AROUND` | `MeteorFalls_1F_1R_EventScript_ItemPPUP` | `FLAG_ITEM_METEOR_FALLS_1F_1R_PP_UP` |
| `LOCALID_METEOR_FALLS_MAGMA_GRUNT_1` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 12,20 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_METEOR_FALLS_TEAM_MAGMA` |
| `LOCALID_METEOR_FALLS_MAGMA_GRUNT_2` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 14,21 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `FLAG_HIDE_METEOR_FALLS_TEAM_MAGMA` |
| `LOCALID_METEOR_FALLS_ARCHIE` | `OBJ_EVENT_GFX_ARCHIE` | 6,20 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_METEOR_FALLS_TEAM_AQUA` |
| `LOCALID_METEOR_FALLS_AQUA_GRUNT_1` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 6,20 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_METEOR_FALLS_TEAM_AQUA` |
| `LOCALID_METEOR_FALLS_AQUA_GRUNT_2` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 6,21 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_HIDE_METEOR_FALLS_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 13,23 | `MOVEMENT_TYPE_FACE_UP_LEFT_AND_RIGHT` | `MeteorFalls_1F_1R_EventScript_ProfCozmo` | `FLAG_HIDE_METEOR_FALLS_1F_1R_COZMO` |

## Warps (6)
- #0 (27,18) → `MAP_ROUTE114` warp #0
- #1 (6,39) → `MAP_ROUTE115` warp #0
- #2 (10,3) → `MAP_METEOR_FALLS_1F_2R` warp #0
- #3 (5,4) → `MAP_METEOR_FALLS_B1F_1R` warp #4
- #4 (26,28) → `MAP_METEOR_FALLS_B1F_1R` warp #5
- #5 (4,2) → `MAP_METEOR_FALLS_STEVENS_CAVE` warp #0

## Coord events / triggers (1)
- (14,18) → `MeteorFalls_1F_1R_EventScript_MagmaStealsMeteoriteScene` (si `VAR_METEOR_FALLS_STATE` == `0`)

## BG events / signs (1)
- (9,58) [sign] → `0x0`

## Flags référencés (5)
- `FLAG_HIDE_FALLARBOR_TOWN_BATTLE_TENT_SCOTT`
- `FLAG_HIDE_ROUTE_112_TEAM_MAGMA`
- `FLAG_MET_ARCHIE_METEOR_FALLS`
- `FLAG_MET_PROF_COZMO`
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (1)
- `VAR_METEOR_FALLS_STATE`

## Scripts (19)
### MeteorFalls_1F_1R_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, MeteorFalls_1F_1R_OnLoad
```
### MeteorFalls_1F_1R_OnLoad
```
call_if_set FLAG_SYS_GAME_CLEAR, MeteorFalls_1F_1R_EventScript_OpenStevensCave
end
```
### MeteorFalls_1F_1R_EventScript_OpenStevensCave
```
setmetatile 4, 1, METATILE_MeteorFalls_CaveEntrance_Top, TRUE
setmetatile 3, 2, METATILE_MeteorFalls_CaveEntrance_Left, TRUE
setmetatile 4, 2, METATILE_MeteorFalls_CaveEntrance_Bottom, FALSE
setmetatile 5, 2, METATILE_MeteorFalls_CaveEntrance_Right, TRUE
return
```
### MeteorFalls_1F_1R_EventScript_MagmaStealsMeteoriteScene
```
lockall
playbgm MUS_ENCOUNTER_MAGMA, FALSE
applymovement LOCALID_PLAYER, Common_Movement_FaceDown
waitmovement 0
delay 30
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, Common_Movement_WalkInPlaceDown
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_WithThisMeteorite, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, Common_Movement_WalkInPlaceFasterUp
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_2, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
playse SE_PIN
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, Common_Movement_Delay48
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_DontExpectMercyFromMagma, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, MeteorFalls_1F_1R_Movement_MagmaGruntApproachPlayer
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_HoldItRightThereMagma, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_2, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
addobject LOCALID_METEOR_FALLS_ARCHIE
addobject LOCALID_METEOR_FALLS_AQUA_GRUNT_1
addobject LOCALID_METEOR_FALLS_AQUA_GRUNT_2
playbgm MUS_ENCOUNTER_AQUA, FALSE
applymovement LOCALID_METEOR_FALLS_ARCHIE, MeteorFalls_1F_1R_Movement_ArchieArrive
applymovement LOCALID_METEOR_FALLS_AQUA_GRUNT_1, MeteorFalls_1F_1R_Movement_AquaGrunt1Arrive
applymovement LOCALID_METEOR_FALLS_AQUA_GRUNT_2, MeteorFalls_1F_1R_Movement_AquaGrunt2Arrive
waitmovement 0
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_2, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_BeSeeingYouTeamAqua, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, MeteorFalls_1F_1R_Movement_PushPlayerOutOfWay
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_1, MeteorFalls_1F_1R_Movement_MagmaGrunt1Exit
applymovement LOCALID_METEOR_FALLS_MAGMA_GRUNT_2, MeteorFalls_1F_1R_Movement_MagmaGrunt2Exit
waitmovement 0
removeobject LOCALID_METEOR_FALLS_MAGMA_GRUNT_1
removeobject LOCALID_METEOR_FALLS_MAGMA_GRUNT_2
applymovement LOCALID_METEOR_FALLS_ARCHIE, MeteorFalls_1F_1R_Movement_ArchieApproachPlayer
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_ArchieSeenYouBefore, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_METEOR_FALLS_AQUA_GRUNT_1, MeteorFalls_1F_1R_Movement_AquaGrunt1ApproachArchie
applymovement LOCALID_METEOR_FALLS_AQUA_GRUNT_2, MeteorFalls_1F_1R_Movement_AquaGrunt2ApproachArchie
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_BossWeShouldChaseMagma, MSGBOX_DEFAULT
applymovement LOCALID_METEOR_FALLS_ARCHIE, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_ArchieYesNoTellingWhatMagmaWillDo, MSGBOX_DEFAULT
applymovement LOCALID_METEOR_FALLS_ARCHIE, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox MeteorFalls_1F_1R_Text_ArchieFarewell, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_METEOR_FALLS_ARCHIE, MeteorFalls_1F_1R_Movement_ArchieExit
applymovement LOCALID_METEOR_FALLS_AQUA_GRUNT_1, MeteorFalls_1F_1R_Movement_AquaGrunt1Exit
applymovement LOCALID_METEOR_FALLS_AQUA_GRUNT_2, MeteorFalls_1F_1R_Movement_AquaGrunt2Exit
waitmovement 0
fadedefaultbgm
removeobject LOCALID_METEOR_FALLS_ARCHIE
removeobject LOCALID_METEOR_FALLS_AQUA_GRUNT_1
removeobject LOCALID_METEOR_FALLS_AQUA_GRUNT_2
setflag FLAG_HIDE_ROUTE_112_TEAM_MAGMA
setflag FLAG_MET_ARCHIE_METEOR_FALLS
setflag FLAG_HIDE_FALLARBOR_TOWN_BATTLE_TENT_SCOTT
setvar VAR_METEOR_FALLS_STATE, 1
releaseall
end
```
### MeteorFalls_1F_1R_Movement_MagmaGruntApproachPlayer
```
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### MeteorFalls_1F_1R_Movement_MagmaGrunt1Exit
```
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
step_end
```
### MeteorFalls_1F_1R_Movement_MagmaGrunt2Exit
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
walk_fast_right
step_end
```
### MeteorFalls_1F_1R_Movement_ArchieArrive
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MeteorFalls_1F_1R_Movement_AquaGrunt1Arrive
```
delay_16
delay_16
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MeteorFalls_1F_1R_Movement_AquaGrunt2Arrive
```
delay_16
delay_16
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MeteorFalls_1F_1R_Movement_ArchieExit
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MeteorFalls_1F_1R_Movement_ArchieApproachPlayer
```
walk_right
walk_right
walk_up
walk_up
walk_in_place_faster_left
step_end
```
### MeteorFalls_1F_1R_Movement_AquaGrunt1Exit
```
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MeteorFalls_1F_1R_Movement_AquaGrunt1ApproachArchie
```
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### MeteorFalls_1F_1R_Movement_AquaGrunt2Exit
```
walk_up
walk_up
walk_up
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### MeteorFalls_1F_1R_Movement_AquaGrunt2ApproachArchie
```
walk_right
walk_right
walk_right
walk_in_place_faster_up
step_end
```
### MeteorFalls_1F_1R_Movement_PushPlayerOutOfWay
```
walk_in_place_faster_down
delay_4
walk_in_place_faster_right
lock_facing_direction
walk_left
unlock_facing_direction
face_right
step_end
```
### MeteorFalls_1F_1R_EventScript_ProfCozmo
```
lock
faceplayer
goto_if_set FLAG_MET_PROF_COZMO, MeteorFalls_1F_1R_EventScript_MetCozmo
setflag FLAG_MET_PROF_COZMO
msgbox MeteorFalls_1F_1R_Text_MeetProfCozmo, MSGBOX_DEFAULT
release
end
```
### MeteorFalls_1F_1R_EventScript_MetCozmo
```
msgbox MeteorFalls_1F_1R_Text_WhatsTeamMagmaDoingAtMtChimney, MSGBOX_DEFAULT
release
end
```

## Textes (10)
### MeteorFalls_1F_1R_Text_WithThisMeteorite
```
Hé, hé, hé!\pAvec ce METEORITE, ce truc\nau MONT CHIMNEE va…$
```
### MeteorFalls_1F_1R_Text_DontExpectMercyFromMagma
```
Hé?\pJe ne sais pas qui tu es, mais si tu\ncroises la route de la TEAM MAGMA,\lne t'attends à aucune pitié!$
```
### MeteorFalls_1F_1R_Text_HoldItRightThereMagma
```
Laissez ça, TEAM MAGMA!\pVous faites une grossière erreur si\nvous pensez pouvoir diriger le monde\là votre manière!$
```
### MeteorFalls_1F_1R_Text_BeSeeingYouTeamAqua
```
Hé, hé, hé!\nMême la TEAM AQUA nous a rejoints!\pÇa ferait trop si on devait vous\naffronter un par un…\pHé, c'est pas grave!\pOn a le METEORITE, alors on va au\nMONT CHIMNEE!\pHé, hé, hé! A plus, les crétins de\nla TEAM AQUA!$
```
### MeteorFalls_1F_1R_Text_ArchieSeenYouBefore
```
ARTHUR: Ne nous sommes-nous pas déjà\nrencontrés au MUSEE de POIVRESSEL?\pAh, donc tu t'appelles {PLAYER}.\pCette fois-là, j'avais pensé que tu\nappartenais à la TEAM MAGMA.\pHumph…\nTu es vraiment une personne étrange.\pLa TEAM MAGMA est un groupe de\ndangereux fanatiques.\pIls commettent des actes destructeurs\npour essayer d'étendre la terre.\pCe sont nos rivaux, à nous les\namoureux de la mer!$
```
### MeteorFalls_1F_1R_Text_BossWeShouldChaseMagma
```
CHEF, on devrait poursuivre la \nTEAM MAGMA…$
```
### MeteorFalls_1F_1R_Text_ArchieYesNoTellingWhatMagmaWillDo
```
ARTHUR: Oui, oui, il le faut!\nOn a intérêt de se dépêcher!\pPas besoin de se demander ce que la\nTEAM MAGMA va faire au MONT CHIMNEE!$
```
### MeteorFalls_1F_1R_Text_ArchieFarewell
```
ARTHUR: {PLAYER}, tu devrais aussi\ngarder un œil sur la TEAM MAGMA.\pAdieu!$
```
### MeteorFalls_1F_1R_Text_MeetProfCozmo
```
Je… Je suis KOSMO…\nJe suis un PROFESSEUR.\pDes membres de la TEAM MAGMA m'ont\ndemandé la route pour aller au\lSITE METEORE.\pMais ils m'ont piégé! Ils m'ont\nmême volé mon METEORITE…\pEt un autre groupe est apparu, c'était\nla TEAM AQUA!\pAprès ça…\nJe n'ai plus rien compris.\pMais cette TEAM MAGMA…\pQue vont-ils faire avec ce METEORITE\nau MONT CHIMNEE?$
```
### MeteorFalls_1F_1R_Text_WhatsTeamMagmaDoingAtMtChimney
```
PROF. KOSMO: Cette TEAM MAGMA…\pQue vont-ils faire avec ce METEORITE\nau MONT CHIMNEE?$
```

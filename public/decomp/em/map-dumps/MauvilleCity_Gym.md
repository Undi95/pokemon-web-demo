# MauvilleCity_Gym

## Métadonnées
- **id** : `MAP_MAUVILLE_CITY_GYM`
- **layout** : `LAYOUT_MAUVILLE_CITY_GYM`
- **music** : `MUS_GYM`
- **region_map_section** : `MAPSEC_MAUVILLE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_GYM`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WATTSON` | 5,2 | `MOVEMENT_TYPE_FACE_DOWN` | `MauvilleCity_Gym_EventScript_Wattson` | `FLAG_HIDE_MAUVILLE_GYM_WATTSON` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 7,8 | `MOVEMENT_TYPE_FACE_DOWN` | `MauvilleCity_Gym_EventScript_Shawn` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 1,16 | `MOVEMENT_TYPE_FACE_UP` | `MauvilleCity_Gym_EventScript_Vivian` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 5,10 | `MOVEMENT_TYPE_FACE_LEFT` | `MauvilleCity_Gym_EventScript_Ben` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 1,13 | `MOVEMENT_TYPE_FACE_DOWN` | `MauvilleCity_Gym_EventScript_Kirk` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_2` | 7,20 | `MOVEMENT_TYPE_FACE_LEFT` | `MauvilleCity_Gym_EventScript_GymGuide` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 7,10 | `MOVEMENT_TYPE_FACE_UP` | `MauvilleCity_Gym_EventScript_Angelo` | `0` |

## Warps (2)
- #0 (4,20) → `MAP_MAUVILLE_CITY` warp #0
- #1 (5,20) → `MAP_MAUVILLE_CITY` warp #0

## Coord events / triggers (4)
- (4,12) → `MauvilleCity_Gym_EventScript_Switch2` (si `VAR_TEMP_0` == `0`)
- (3,9) → `MauvilleCity_Gym_EventScript_Switch3` (si `VAR_TEMP_0` == `0`)
- (0,15) → `MauvilleCity_Gym_EventScript_Switch1` (si `VAR_TEMP_0` == `0`)
- (8,9) → `MauvilleCity_Gym_EventScript_Switch4` (si `VAR_TEMP_0` == `0`)

## BG events / signs (2)
- (3,18) [sign] → `MauvilleCity_Gym_EventScript_LeftGymStatue`
- (6,18) [sign] → `MauvilleCity_Gym_EventScript_RightGymStatue`

## Flags référencés (6)
- `FLAG_BADGE03_GET`
- `FLAG_DEFEATED_MAUVILLE_GYM`
- `FLAG_ENABLE_WATTSON_MATCH_CALL`
- `FLAG_HIDE_VERDANTURF_TOWN_SCOTT`
- `FLAG_MAUVILLE_GYM_BARRIERS_STATE`
- `FLAG_RECEIVED_TM_SHOCK_WAVE`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_0x8008`
- `VAR_MAUVILLE_GYM_STATE`
- `VAR_NEW_MAUVILLE_STATE`
- `VAR_PETALBURG_GYM_STATE`
- `VAR_RESULT`
- `VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayGymBadgeFanfare`
### data/scripts/set_gym_trainers.inc
- `Common_EventScript_SetGymTrainers`

## Scripts (34)
### MauvilleCity_Gym_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, MauvilleCity_Gym_OnLoad
```
### MauvilleCity_Gym_OnLoad
```
goto_if_set FLAG_DEFEATED_MAUVILLE_GYM, MauvilleCity_Gym_EventScript_DeactivatePuzzle
switch VAR_MAUVILLE_GYM_STATE
case 0, MauvilleCity_Gym_EventScript_UpdateBarriers
case 1, MauvilleCity_Gym_EventScript_Switch1Pressed
case 2, MauvilleCity_Gym_EventScript_Switch2Pressed
case 3, MauvilleCity_Gym_EventScript_Switch3Pressed
case 4, MauvilleCity_Gym_EventScript_Switch4Pressed
end
```
### MauvilleCity_Gym_EventScript_UpdateBarriers
```
goto_if_set FLAG_MAUVILLE_GYM_BARRIERS_STATE, MauvilleCity_Gym_EventScript_SetAltBarriers
end
```
### MauvilleCity_Gym_EventScript_SetAltBarriers
```
setmetatile 3, 11, METATILE_MauvilleGym_RedBeamV1_On, TRUE
setmetatile 3, 12, METATILE_MauvilleGym_RedBeamV2_On, TRUE
setmetatile 3, 13, METATILE_MauvilleGym_PoleTop_On, TRUE
setmetatile 4, 10, METATILE_MauvilleGym_RedBeamH1_On, FALSE
setmetatile 5, 10, METATILE_MauvilleGym_RedBeamH2_On, FALSE
setmetatile 4, 11, METATILE_MauvilleGym_RedBeamH3_On, TRUE
setmetatile 5, 11, METATILE_MauvilleGym_RedBeamH4_On, TRUE
setmetatile 7, 10, METATILE_MauvilleGym_RedBeamH1_On, FALSE
setmetatile 8, 10, METATILE_MauvilleGym_RedBeamH2_On, FALSE
setmetatile 7, 11, METATILE_MauvilleGym_RedBeamH3_On, TRUE
setmetatile 8, 11, METATILE_MauvilleGym_RedBeamH4_On, TRUE
setmetatile 4, 13, METATILE_MauvilleGym_GreenBeamH1_Off, FALSE
setmetatile 5, 13, METATILE_MauvilleGym_GreenBeamH2_Off, FALSE
setmetatile 4, 14, METATILE_MauvilleGym_GreenBeamH3_Off, FALSE
setmetatile 5, 14, METATILE_MauvilleGym_GreenBeamH4_Off, FALSE
setmetatile 1, 10, METATILE_MauvilleGym_GreenBeamH1_Off, FALSE
setmetatile 2, 10, METATILE_MauvilleGym_GreenBeamH2_Off, FALSE
setmetatile 1, 11, METATILE_MauvilleGym_GreenBeamH3_Off, FALSE
setmetatile 2, 11, METATILE_MauvilleGym_GreenBeamH4_Off, FALSE
setmetatile 6, 8, METATILE_MauvilleGym_PoleBottom_On, TRUE
setmetatile 6, 9, METATILE_MauvilleGym_FloorTile, FALSE
setmetatile 6, 10, METATILE_MauvilleGym_PoleTop_Off, FALSE
setmetatile 4, 6, METATILE_MauvilleGym_GreenBeamH1_Off, FALSE
setmetatile 5, 6, METATILE_MauvilleGym_GreenBeamH2_Off, FALSE
setmetatile 4, 7, METATILE_MauvilleGym_GreenBeamH3_Off, FALSE
setmetatile 5, 7, METATILE_MauvilleGym_GreenBeamH4_Off, FALSE
end
```
### MauvilleCity_Gym_EventScript_Switch1Pressed
```
setvar VAR_0x8004, 0
special MauvilleGymPressSwitch
goto MauvilleCity_Gym_EventScript_UpdateBarriers
end
```
### MauvilleCity_Gym_EventScript_Switch2Pressed
```
setvar VAR_0x8004, 1
special MauvilleGymPressSwitch
goto MauvilleCity_Gym_EventScript_UpdateBarriers
end
```
### MauvilleCity_Gym_EventScript_Switch3Pressed
```
setvar VAR_0x8004, 2
special MauvilleGymPressSwitch
goto MauvilleCity_Gym_EventScript_UpdateBarriers
end
```
### MauvilleCity_Gym_EventScript_Switch4Pressed
```
setvar VAR_0x8004, 3
special MauvilleGymPressSwitch
goto MauvilleCity_Gym_EventScript_UpdateBarriers
end
```
### MauvilleCity_Gym_EventScript_DeactivatePuzzle
```
special MauvilleGymDeactivatePuzzle
end
```
### MauvilleCity_Gym_EventScript_Wattson
```
trainerbattle_single TRAINER_WATTSON_1, MauvilleCity_Gym_Text_WattsonIntro, MauvilleCity_Gym_Text_WattsonDefeat, MauvilleCity_Gym_EventScript_WattsonDefeated, NO_MUSIC
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MauvilleCity_Gym_EventScript_WattsonRematch
goto_if_unset FLAG_RECEIVED_TM_SHOCK_WAVE, MauvilleCity_Gym_EventScript_GiveShockWave2
goto_if_eq VAR_NEW_MAUVILLE_STATE, 2, MauvilleCity_Gym_EventScript_CompletedNewMauville
msgbox MauvilleCity_Gym_Text_WattsonPostBattle, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_Gym_EventScript_WattsonDefeated
```
message MauvilleCity_Gym_Text_ReceivedDynamoBadge
waitmessage
call Common_EventScript_PlayGymBadgeFanfare
msgbox MauvilleCity_Gym_Text_ExplainDynamoBadgeTakeThis, MSGBOX_DEFAULT
setvar VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE, 3
clearflag FLAG_HIDE_VERDANTURF_TOWN_SCOTT
setflag FLAG_DEFEATED_MAUVILLE_GYM
setflag FLAG_BADGE03_GET
addvar VAR_PETALBURG_GYM_STATE, 1
call_if_eq VAR_PETALBURG_GYM_STATE, 6, Common_EventScript_ReadyPetalburgGymForBattle
setvar VAR_0x8008, 3
call Common_EventScript_SetGymTrainers
special MauvilleGymDeactivatePuzzle
special DrawWholeMapView
playse SE_UNLOCK
call MauvilleCity_Gym_EventScript_GiveShockWave
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox MauvilleCity_Gym_Text_RegisteredWattson, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_WATTSON_MATCH_CALL
release
end
```
### MauvilleCity_Gym_EventScript_GiveShockWave2
```
giveitem ITEM_TM_SHOCK_WAVE
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
msgbox MauvilleCity_Gym_Text_ExplainShockWave, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_TM_SHOCK_WAVE
release
end
```
### MauvilleCity_Gym_EventScript_GiveShockWave
```
giveitem ITEM_TM_SHOCK_WAVE
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_BagIsFull
msgbox MauvilleCity_Gym_Text_ExplainShockWave, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_TM_SHOCK_WAVE
return
```
### MauvilleCity_Gym_EventScript_CompletedNewMauville
```
msgbox MauvilleCity_Gym_Text_WattsonGoForthAndEndeavor, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_Gym_EventScript_WattsonRematch
```
trainerbattle_rematch_double TRAINER_WATTSON_1, MauvilleCity_Gym_Text_WattsonPreRematch, MauvilleCity_Gym_Text_WattsonRematchDefeat, MauvilleCity_Gym_Text_WattsonRematchNeedTwoMons
msgbox MauvilleCity_Gym_Text_WattsonPostRematch, MSGBOX_AUTOCLOSE
end
```
### MauvilleCity_Gym_EventScript_Switch1
```
lockall
goto_if_set FLAG_DEFEATED_MAUVILLE_GYM, MauvilleCity_Gym_EventScript_SwitchDoNothing
goto_if_eq VAR_MAUVILLE_GYM_STATE, 1, MauvilleCity_Gym_EventScript_SwitchDoNothing
setvar VAR_MAUVILLE_GYM_STATE, 1
setvar VAR_0x8004, 0
goto MauvilleCity_Gym_EventScript_PressFloorSwitch
end
```
### MauvilleCity_Gym_EventScript_Switch2
```
lockall
goto_if_set FLAG_DEFEATED_MAUVILLE_GYM, MauvilleCity_Gym_EventScript_SwitchDoNothing
goto_if_eq VAR_MAUVILLE_GYM_STATE, 2, MauvilleCity_Gym_EventScript_SwitchDoNothing
setvar VAR_MAUVILLE_GYM_STATE, 2
setvar VAR_0x8004, 1
goto MauvilleCity_Gym_EventScript_PressFloorSwitch
end
```
### MauvilleCity_Gym_EventScript_Switch3
```
lockall
goto_if_set FLAG_DEFEATED_MAUVILLE_GYM, MauvilleCity_Gym_EventScript_SwitchDoNothing
goto_if_eq VAR_MAUVILLE_GYM_STATE, 3, MauvilleCity_Gym_EventScript_SwitchDoNothing
setvar VAR_MAUVILLE_GYM_STATE, 3
setvar VAR_0x8004, 2
goto MauvilleCity_Gym_EventScript_PressFloorSwitch
end
```
### MauvilleCity_Gym_EventScript_Switch4
```
lockall
goto_if_set FLAG_DEFEATED_MAUVILLE_GYM, MauvilleCity_Gym_EventScript_SwitchDoNothing
goto_if_eq VAR_MAUVILLE_GYM_STATE, 4, MauvilleCity_Gym_EventScript_SwitchDoNothing
setvar VAR_MAUVILLE_GYM_STATE, 4
setvar VAR_0x8004, 3
goto MauvilleCity_Gym_EventScript_PressFloorSwitch
end
```
### MauvilleCity_Gym_EventScript_PressFloorSwitch
```
special MauvilleGymSetDefaultBarriers
special MauvilleGymPressSwitch
special DrawWholeMapView
playse SE_UNLOCK
goto_if_set FLAG_MAUVILLE_GYM_BARRIERS_STATE, MauvilleCity_Gym_EventScript_ClearBarriersAltState
goto_if_unset FLAG_MAUVILLE_GYM_BARRIERS_STATE, MauvilleCity_Gym_EventScript_SetBarriersAltState
releaseall
end
```
### MauvilleCity_Gym_EventScript_SwitchDoNothing
```
releaseall
end
```
### MauvilleCity_Gym_EventScript_SetBarriersAltState
```
setflag FLAG_MAUVILLE_GYM_BARRIERS_STATE
releaseall
end
```
### MauvilleCity_Gym_EventScript_ClearBarriersAltState
```
clearflag FLAG_MAUVILLE_GYM_BARRIERS_STATE
releaseall
end
```
### MauvilleCity_Gym_EventScript_Kirk
```
trainerbattle_single TRAINER_KIRK, MauvilleCity_Gym_Text_KirkIntro, MauvilleCity_Gym_Text_KirkDefeat
msgbox MauvilleCity_Gym_Text_KirkPostBattle, MSGBOX_AUTOCLOSE
end
```
### MauvilleCity_Gym_EventScript_Shawn
```
trainerbattle_single TRAINER_SHAWN, MauvilleCity_Gym_Text_ShawnIntro, MauvilleCity_Gym_Text_ShawnDefeat
msgbox MauvilleCity_Gym_Text_ShawnPostBattle, MSGBOX_AUTOCLOSE
end
```
### MauvilleCity_Gym_EventScript_Ben
```
trainerbattle_single TRAINER_BEN, MauvilleCity_Gym_Text_BenIntro, MauvilleCity_Gym_Text_BenDefeat
msgbox MauvilleCity_Gym_Text_BenPostBattle, MSGBOX_AUTOCLOSE
end
```
### MauvilleCity_Gym_EventScript_Vivian
```
trainerbattle_single TRAINER_VIVIAN, MauvilleCity_Gym_Text_VivianIntro, MauvilleCity_Gym_Text_VivianDefeat
msgbox MauvilleCity_Gym_Text_VivianPostBattle, MSGBOX_AUTOCLOSE
end
```
### MauvilleCity_Gym_EventScript_Angelo
```
trainerbattle_single TRAINER_ANGELO, MauvilleCity_Gym_Text_AngeloIntro, MauvilleCity_Gym_Text_AngeloDefeat
msgbox MauvilleCity_Gym_Text_AngeloPostBattle, MSGBOX_AUTOCLOSE
end
```
### MauvilleCity_Gym_EventScript_GymGuide
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_MAUVILLE_GYM, MauvilleCity_Gym_EventScript_GymGuidePostVictory
msgbox MauvilleCity_Gym_Text_GymGuideAdvice, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_Gym_EventScript_GymGuidePostVictory
```
msgbox MauvilleCity_Gym_Text_GymGuidePostVictory, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_Gym_EventScript_LeftGymStatue
```
lockall
goto_if_set FLAG_BADGE03_GET, MauvilleCity_Gym_EventScript_GymStatueCertified
goto MauvilleCity_Gym_EventScript_GymStatue
end
```
### MauvilleCity_Gym_EventScript_RightGymStatue
```
lockall
goto_if_set FLAG_BADGE03_GET, MauvilleCity_Gym_EventScript_GymStatueCertified
goto MauvilleCity_Gym_EventScript_GymStatue
end
```
### MauvilleCity_Gym_EventScript_GymStatueCertified
```
msgbox MauvilleCity_Gym_Text_GymStatueCertified, MSGBOX_DEFAULT
releaseall
end
```
### MauvilleCity_Gym_EventScript_GymStatue
```
msgbox MauvilleCity_Gym_Text_GymStatue, MSGBOX_DEFAULT
releaseall
end
```

## Textes (31)
### MauvilleCity_Gym_Text_GymGuideAdvice
```
Hé, comment ça va, futur\nMAITRE {PLAYER}?\pVOLTERE, le CHAMPION de LAVANDIA\nutilise des POKéMON du type ELECTRIK.\pSi tu utilises des POKéMON du type EAU,\nil n'en fera qu'une bouchée! Bzitt!\pEt il a placé des points de passage\nélectrifiés dans toute l'ARENE!\pAllez, vas-y!$
```
### MauvilleCity_Gym_Text_GymGuidePostVictory
```
Waouh, électrisant!\nT'as réussi à ouvrir le passage!$
```
### MauvilleCity_Gym_Text_KirkIntro
```
Mon âme électrique va briser tous\ntes rêves, waouh, yé!$
```
### MauvilleCity_Gym_Text_KirkDefeat
```
C'était branché, amplifié, survolté, yé!$
```
### MauvilleCity_Gym_Text_KirkPostBattle
```
Les POKéMON et la musique, tout est\nquestion de cœur. Waouh, yé!$
```
### MauvilleCity_Gym_Text_ShawnIntro
```
J'ai suivi l'entraînement de VOLTERE.\nÇa va être dur de me battre!$
```
### MauvilleCity_Gym_Text_ShawnDefeat
```
Je suis à plat…$
```
### MauvilleCity_Gym_Text_ShawnPostBattle
```
VOLTERE, notre CHAMPION, est ici\ndepuis très, très longtemps.\pIl combattait déjà alors que ton père\nn'était pas né, le coriace!$
```
### MauvilleCity_Gym_Text_BenIntro
```
Cette ARENE est piégée de partout!\nMarrant, non?$
```
### MauvilleCity_Gym_Text_BenDefeat
```
C'est pas marrant d'perdre…$
```
### MauvilleCity_Gym_Text_BenPostBattle
```
VOLTERE dit qu'il aime créer des\npetits pièges avec des interrupteurs.$
```
### MauvilleCity_Gym_Text_VivianIntro
```
Mon charme et les capacités de mes\nPOKéMON vont te surprendre!$
```
### MauvilleCity_Gym_Text_VivianDefeat
```
Je suis surprise par ta puissance!$
```
### MauvilleCity_Gym_Text_VivianPostBattle
```
J'ai entendu dire que LAVANDIA\navait été fondée par VOLTERE.\pIl était DRESSEUR bien avant qu'on\nne le devienne nous-mêmes.\pIl doit en connaître des choses!$
```
### MauvilleCity_Gym_Text_AngeloIntro
```
J'adore les choses qui brillent!$
```
### MauvilleCity_Gym_Text_AngeloDefeat
```
Oh…\nMes yeux sont trop fatigués…$
```
### MauvilleCity_Gym_Text_AngeloPostBattle
```
Le CHAMPION D'ARENE de LAVANDIA,\nVOLTERE, est encore là pour longtemps.\lÇa me rend heureux!$
```
### MauvilleCity_Gym_Text_WattsonIntro
```
J'ai abandonné l'idée de transformer la\nville. J'y ai été contraint.\pAlors je passe mon temps à installer\ndes portes piégées dans mon ARENE.\pOh, mais que fais-tu ici?\pComment? Tu dis que tu as réussi à\npasser toutes les portes piégées?\pWahahahah!\nÇa, c'est surprenant!\pAlors moi, VOLTERE, le CHAMPION D'ARENE\nde LAVANDIA, je vais t'électriser!$
```
### MauvilleCity_Gym_Text_WattsonDefeat
```
Wahahahah!\nBon, j'ai perdu!\pTu as réussi à me donner des frissons!\nPrends ce BADGE!$
```
### MauvilleCity_Gym_Text_ReceivedDynamoBadge
```
{PLAYER} reçoit le BADGE DYNAMO\nde la part de VOLTERE.$
```
### MauvilleCity_Gym_Text_ExplainDynamoBadgeTakeThis
```
Avec le BADGE DYNAMO, un POKéMON\npeut utiliser ECLATE-ROC hors combat.\pEt ça le rend même un peu plus\nrapide.\pHum…\nTu devrais aussi prendre ça!$
```
### MauvilleCity_Gym_Text_ExplainShockWave
```
Cette CT34 contient ONDE DE CHOC.\pC'est une capacité très fiable qui ne\nrate jamais. Tu peux compter dessus!\p… … … … … …$
```
### MauvilleCity_Gym_Text_RegisteredWattson
```
Vous avez enregistré le CHAMPION\nD'ARENE VOLTERE dans le POKéNAV.$
```
### MauvilleCity_Gym_Text_WattsonPostBattle
```
Ça me rend optimiste de voir un jeune\nDRESSEUR aussi prometteur que toi!$
```
### MauvilleCity_Gym_Text_WattsonGoForthAndEndeavor
```
Wahahahah!\nContinue et donne tout, mon p'tit!$
```
### MauvilleCity_Gym_Text_GymStatue
```
ARENE POKéMON de LAVANDIA$
```
### MauvilleCity_Gym_Text_GymStatueCertified
```
ARENE POKéMON de LAVANDIA\pNOUVEAU DRESSEUR RECONNU PAR VOLTERE:\n{PLAYER}$
```
### MauvilleCity_Gym_Text_WattsonPreRematch
```
VOLTERE: Aaah! Enfin!\nJe sais pourquoi tu es là.\lTu es là pour affronter mes POKéMON!\pWahahaha!\pÇa va faire des étincelles!\nNe viens pas te plaindre après!$
```
### MauvilleCity_Gym_Text_WattsonRematchDefeat
```
Wooh…\nMes batteries sont vides…$
```
### MauvilleCity_Gym_Text_WattsonPostRematch
```
VOLTERE: Je n'ai plus qu'à encore\nrecharger mes batteries.\pQuand ça sera fait, j'accepterai\nvolontiers de t'affronter à nouveau.\pReviens plus tard, d'accord?$
```
### MauvilleCity_Gym_Text_WattsonRematchNeedTwoMons
```
VOLTERE: Aaah! Enfin!\nJe sais pourquoi tu es là.\lTu es là pour affronter mes POKéMON!\pWahahaha!\pOooh! Attends!\nTu n'as qu'un POKéMON avec toi?\pReviens me voir avec au moins\ndeux POKéMON, d'accord?$
```

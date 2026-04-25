# LavaridgeTown_Gym_1F

## Métadonnées
- **id** : `MAP_LAVARIDGE_TOWN_GYM_1F`
- **layout** : `LAYOUT_LAVARIDGE_TOWN_GYM_1F`
- **music** : `MUS_GYM`
- **region_map_section** : `MAPSEC_LAVARIDGE_TOWN`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_GYM`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_FLANNERY` | 13,9 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_1F_EventScript_Flannery` | `0` |
| `LOCALID_COLE` | `OBJ_EVENT_GFX_MAN_5` | 3,14 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_1F_EventScript_Cole` | `0` |
| `LOCALID_GERALD` | `OBJ_EVENT_GFX_MAN_3` | 2,15 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_1F_EventScript_Gerald` | `0` |
| `LOCALID_AXLE` | `OBJ_EVENT_GFX_MAN_5` | 3,10 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_1F_EventScript_Axle` | `0` |
| `LOCALID_DANIELLE` | `OBJ_EVENT_GFX_GIRL_3` | 5,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_Gym_1F_EventScript_Danielle` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_2` | 12,16 | `MOVEMENT_TYPE_FACE_RIGHT` | `LavaridgeTown_Gym_1F_EventScript_GymGuide` | `0` |

## Warps (26)
- #0 (13,18) → `MAP_LAVARIDGE_TOWN` warp #1
- #1 (14,18) → `MAP_LAVARIDGE_TOWN` warp #1
- #2 (10,18) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #0
- #3 (8,9) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #2
- #4 (4,18) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #4
- #5 (5,14) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #3
- #6 (0,17) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #1
- #7 (5,9) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #5
- #8 (2,15) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #6
- #9 (3,14) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #7
- #10 (1,14) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #8
- #11 (0,10) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #9
- #12 (3,10) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #10
- #13 (0,6) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #11
- #14 (3,6) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #12
- #15 (5,6) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #13
- #16 (2,3) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #14
- #17 (5,2) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #15
- #18 (7,2) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #16
- #19 (8,6) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #17
- #20 (10,6) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #18
- #21 (4,16) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #20
- #22 (12,3) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #19
- #23 (14,6) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #21
- #24 (13,17) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #22
- #25 (12,12) → `MAP_LAVARIDGE_TOWN_GYM_B1F` warp #23

## BG events / signs (2)
- (10,15) [sign] → `LavaridgeTown_Gym_1F_EventScript_LeftGymStatue`
- (16,15) [sign] → `LavaridgeTown_Gym_1F_EventScript_RightGymStatue`

## Flags référencés (6)
- `FLAG_BADGE04_GET`
- `FLAG_DEFEATED_LAVARIDGE_GYM`
- `FLAG_ENABLE_FLANNERY_MATCH_CALL`
- `FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLY`
- `FLAG_RECEIVED_TM_OVERHEAT`
- `FLAG_WHITEOUT_TO_LAVARIDGE`

## Variables référencées (9)
- `VAR_0x8008`
- `VAR_LAVARIDGE_TOWN_STATE`
- `VAR_PETALBURG_GYM_STATE`
- `VAR_RESULT`
- `VAR_TEMP_B`
- `VAR_TEMP_C`
- `VAR_TEMP_D`
- `VAR_TEMP_E`
- `VAR_TEMP_F`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayGymBadgeFanfare`
### data/scripts/set_gym_trainers.inc
- `Common_EventScript_SetGymTrainers`

## Scripts (32)
### LavaridgeTown_Gym_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LavaridgeTown_Gym_1F_OnTransition
```
### LavaridgeTown_Gym_1F_OnTransition
```
call LavaridgeTown_Gym_1F_EventScript_SetTrainerTempVars
call LavaridgeTown_Gym_1F_EventScript_CheckBuryTrainers
end
```
### LavaridgeTown_Gym_1F_EventScript_SetTrainerTempVars
```
setvar VAR_TEMP_B, 0
setvar VAR_TEMP_C, 0
setvar VAR_TEMP_D, 0
setvar VAR_TEMP_E, 0
setvar VAR_TEMP_F, 0
goto_if_defeated TRAINER_COLE, LavaridgeTown_Gym_1F_EventScript_SetGeraldTempVar
setvar VAR_TEMP_B, 1
```
### LavaridgeTown_Gym_1F_EventScript_SetGeraldTempVar
```
goto_if_defeated TRAINER_GERALD, LavaridgeTown_Gym_1F_EventScript_SetAxleTempVar
setvar VAR_TEMP_C, 1
```
### LavaridgeTown_Gym_1F_EventScript_SetAxleTempVar
```
goto_if_defeated TRAINER_AXLE, LavaridgeTown_Gym_1F_EventScript_SetDanielleTempVar
setvar VAR_TEMP_D, 1
```
### LavaridgeTown_Gym_1F_EventScript_SetDanielleTempVar
```
goto_if_defeated TRAINER_DANIELLE, LavaridgeTown_Gym_1F_EventScript_EndSetTrainerTempVars
setvar VAR_TEMP_E, 1
```
### LavaridgeTown_Gym_1F_EventScript_EndSetTrainerTempVars
```
return
```
### LavaridgeTown_Gym_1F_EventScript_CheckBuryTrainers
```
goto_if_defeated TRAINER_COLE, LavaridgeTown_Gym_1F_EventScript_CheckBuryGerald
setobjectmovementtype LOCALID_COLE, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_1F_EventScript_CheckBuryGerald
```
goto_if_defeated TRAINER_GERALD, LavaridgeTown_Gym_1F_EventScript_CheckBuryAxle
setobjectmovementtype LOCALID_GERALD, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_1F_EventScript_CheckBuryAxle
```
goto_if_defeated TRAINER_AXLE, LavaridgeTown_Gym_1F_EventScript_CheckBuryDanielle
setobjectmovementtype LOCALID_AXLE, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_1F_EventScript_CheckBuryDanielle
```
goto_if_defeated TRAINER_DANIELLE, LavaridgeTown_Gym_1F_EventScript_EndCheckBuryTrainers
setobjectmovementtype LOCALID_DANIELLE, MOVEMENT_TYPE_BURIED
```
### LavaridgeTown_Gym_1F_EventScript_EndCheckBuryTrainers
```
return
```
### LavaridgeTown_Gym_1F_EventScript_Flannery
```
trainerbattle_single TRAINER_FLANNERY_1, LavaridgeTown_Gym_1F_Text_FlanneryIntro, LavaridgeTown_Gym_1F_Text_FlanneryDefeat, LavaridgeTown_Gym_1F_EventScript_FlanneryDefeated, NO_MUSIC
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, LavaridgeTown_Gym_1F_EventScript_FlanneryRematch
goto_if_unset FLAG_RECEIVED_TM_OVERHEAT, LavaridgeTown_Gym_1F_EventScript_GiveOverheat2
msgbox LavaridgeTown_Gym_1F_Text_FlanneryPostBattle, MSGBOX_DEFAULT
release
end
```
### LavaridgeTown_Gym_1F_EventScript_FlanneryDefeated
```
message LavaridgeTown_Gym_1F_Text_ReceivedHeatBadge
waitmessage
call Common_EventScript_PlayGymBadgeFanfare
msgbox LavaridgeTown_Gym_1F_Text_ExplainHeatBadgeTakeThis, MSGBOX_DEFAULT
setflag FLAG_WHITEOUT_TO_LAVARIDGE
setflag FLAG_DEFEATED_LAVARIDGE_GYM
setflag FLAG_BADGE04_GET
addvar VAR_PETALBURG_GYM_STATE, 1
call_if_eq VAR_PETALBURG_GYM_STATE, 6, Common_EventScript_ReadyPetalburgGymForBattle
setvar VAR_0x8008, 4
call Common_EventScript_SetGymTrainers
setflag FLAG_HIDE_VERDANTURF_TOWN_WANDAS_HOUSE_WALLY
setvar VAR_LAVARIDGE_TOWN_STATE, 1
call LavaridgeTown_Gym_1F_EventScript_GiveOverheat
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox LavaridgeTown_Gym_1F_Text_RegisteredFlannery, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_FLANNERY_MATCH_CALL
release
end
```
### LavaridgeTown_Gym_1F_EventScript_GiveOverheat2
```
giveitem ITEM_TM_OVERHEAT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
msgbox LavaridgeTown_Gym_1F_Text_ExplainOverheat, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_TM_OVERHEAT
release
end
```
### LavaridgeTown_Gym_1F_EventScript_GiveOverheat
```
giveitem ITEM_TM_OVERHEAT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_BagIsFull
msgbox LavaridgeTown_Gym_1F_Text_ExplainOverheat, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_TM_OVERHEAT
return
```
### LavaridgeTown_Gym_1F_EventScript_FlanneryRematch
```
trainerbattle_rematch_double TRAINER_FLANNERY_1, LavaridgeTown_Gym_1F_Text_FlanneryPreRematch, LavaridgeTown_Gym_1F_Text_FlanneryRematchDefeat, LavaridgeTown_Gym_1F_Text_FlanneryRematchNeedTwoMons
msgbox LavaridgeTown_Gym_1F_Text_FlanneryPostRematch, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_1F_EventScript_Cole
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_COLE, LOCALID_COLE, LavaridgeTown_Gym_1F_Text_ColeIntro, LavaridgeTown_Gym_1F_Text_ColeDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_1F_Text_ColePostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_EventScript_CheckTrainerScript
```
call LavaridgeTown_Gym_1F_EventScript_SetTrainerTempVars
release
special ShouldTryGetTrainerScript
goto_if_eq VAR_RESULT, 1, EventScript_GotoTrainerScript
end
```
### LavaridgeTown_Gym_1F_EventScript_Axle
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_AXLE, LOCALID_AXLE, LavaridgeTown_Gym_1F_Text_AxleIntro, LavaridgeTown_Gym_1F_Text_AxleDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_1F_Text_AxlePostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_B1F_EventScript_Keegan
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_KEEGAN, LOCALID_KEEGAN, LavaridgeTown_Gym_B1F_Text_KeeganIntro, LavaridgeTown_Gym_B1F_Text_KeeganDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_B1F_Text_KeeganPostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_1F_EventScript_Danielle
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_DANIELLE, LOCALID_DANIELLE, LavaridgeTown_Gym_1F_Text_DanielleIntro, LavaridgeTown_Gym_1F_Text_DanielleDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_1F_Text_DaniellePostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_1F_EventScript_Gerald
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_GERALD, LOCALID_GERALD, LavaridgeTown_Gym_1F_Text_GeraldIntro, LavaridgeTown_Gym_1F_Text_GeraldDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_1F_Text_GeraldPostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_B1F_EventScript_Jace
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_JACE, LOCALID_JACE, LavaridgeTown_Gym_B1F_Text_JaceIntro, LavaridgeTown_Gym_B1F_Text_JaceDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_B1F_Text_JacePostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_B1F_EventScript_Jeff
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_JEFF, LOCALID_JEFF, LavaridgeTown_Gym_B1F_Text_JeffIntro, LavaridgeTown_Gym_B1F_Text_JeffDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_B1F_Text_JeffPostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_B1F_EventScript_Eli
```
trainerbattle TRAINER_BATTLE_CONTINUE_SCRIPT, TRAINER_ELI, LOCALID_ELI, LavaridgeTown_Gym_B1F_Text_EliIntro, LavaridgeTown_Gym_B1F_Text_EliDefeat, LavaridgeTown_Gym_EventScript_CheckTrainerScript
msgbox LavaridgeTown_Gym_B1F_Text_EliPostBattle, MSGBOX_AUTOCLOSE
end
```
### LavaridgeTown_Gym_1F_EventScript_GymGuide
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_LAVARIDGE_GYM, LavaridgeTown_Gym_1F_EventScript_GymGuidePostVictory
msgbox LavaridgeTown_Gym_1F_Text_GymGuideAdvice, MSGBOX_DEFAULT
release
end
```
### LavaridgeTown_Gym_1F_EventScript_GymGuidePostVictory
```
msgbox LavaridgeTown_Gym_1F_Text_GymGuidePostVictory, MSGBOX_DEFAULT
release
end
```
### LavaridgeTown_Gym_1F_EventScript_LeftGymStatue
```
lockall
goto_if_set FLAG_BADGE04_GET, LavaridgeTown_Gym_1F_EventScript_GymStatueCertified
goto LavaridgeTown_Gym_1F_EventScript_GymStatue
end
```
### LavaridgeTown_Gym_1F_EventScript_RightGymStatue
```
lockall
goto_if_set FLAG_BADGE04_GET, LavaridgeTown_Gym_1F_EventScript_GymStatueCertified
goto LavaridgeTown_Gym_1F_EventScript_GymStatue
end
```
### LavaridgeTown_Gym_1F_EventScript_GymStatueCertified
```
msgbox LavaridgeTown_Gym_1F_Text_GymStatueCertified, MSGBOX_DEFAULT
releaseall
end
```
### LavaridgeTown_Gym_1F_EventScript_GymStatue
```
msgbox LavaridgeTown_Gym_1F_Text_GymStatue, MSGBOX_DEFAULT
releaseall
end
```

## Textes (39)
### LavaridgeTown_Gym_1F_Text_GymGuideAdvice
```
Hé, comment ça va, futur MAITRE\n{PLAYER}?\pADRIANE, CHAMPION D'ARENE de\nVERMILAVA, utilise des POKéMON FEU.\pSa passion des POKéMON est plus\nardente qu'un volcan.\pNe t'approche pas trop, tu pourrais\nte brûler! Arrose-la avec de l'eau et\lattaque-la sans pitié!$
```
### LavaridgeTown_Gym_1F_Text_GymGuidePostVictory
```
Eh ben! Quelle bataille flamboyante!$
```
### LavaridgeTown_Gym_1F_Text_ColeIntro
```
Ouille ouille ouille!\nBon sang, c'est brûlant!$
```
### LavaridgeTown_Gym_1F_Text_ColeDefeat
```
J'ai été aveuglé par la sueur qui me\ncoulait dans les yeux…$
```
### LavaridgeTown_Gym_1F_Text_ColePostBattle
```
S'enterrer dans le sable chaud est\nexcellent pour la circulation sanguine.\pC'est très efficace contre les\nrhumatismes.$
```
### LavaridgeTown_Gym_1F_Text_AxleIntro
```
J'essaie de libérer mon stress. J'espère\nque tu ne viens pas pour m'énerver!$
```
### LavaridgeTown_Gym_1F_Text_AxleDefeat
```
J'espère qu'ADRIANE va te rôtir!$
```
### LavaridgeTown_Gym_1F_Text_AxlePostBattle
```
Haaah… Pffiou…\pC'est étouffant de rester trop\nlongtemps dans le sable chaud…$
```
### LavaridgeTown_Gym_B1F_Text_KeeganIntro
```
Tu commences à fatiguer.\nTu préfèrerais sûrement te reposer\ldans le sable chaud, n'est-ce pas?\pMais tu sais sans doute qu'en tant\nque DRESSEUR, tu dois garder une\lvolonté à toute épreuve.$
```
### LavaridgeTown_Gym_B1F_Text_KeeganDefeat
```
Quand on joue avec le feu, on se brûle…$
```
### LavaridgeTown_Gym_B1F_Text_KeeganPostBattle
```
Tu as vraiment du talent…\nMais ADRIANE, notre CHAMPION,\len a encore plus.\pSi tu ne fais pas attention, tu vas\nsérieusement te brûler.$
```
### LavaridgeTown_Gym_1F_Text_GeraldIntro
```
Est-ce que tes POKéMON peuvent\nsupporter une chaleur de 200 degrés?$
```
### LavaridgeTown_Gym_1F_Text_GeraldDefeat
```
Ça ne devait pas être assez chaud…$
```
### LavaridgeTown_Gym_1F_Text_GeraldPostBattle
```
La température du magma est de\n200 degrés.\pTes POKéMON m'ont battu, donc ils\ndevraient survivre dans du magma.$
```
### LavaridgeTown_Gym_1F_Text_DanielleIntro
```
Mmmh…\nD'accord, je vais me battre contre toi.$
```
### LavaridgeTown_Gym_1F_Text_DanielleDefeat
```
Ouille, quelle puissance!$
```
### LavaridgeTown_Gym_1F_Text_DaniellePostBattle
```
En tant que DRESSEUR, je vais devenir\njolie et puissante, comme ADRIANE.$
```
### LavaridgeTown_Gym_B1F_Text_JaceIntro
```
Allez, battons-nous!\nJe suis chaud!$
```
### LavaridgeTown_Gym_B1F_Text_JaceDefeat
```
Malgré la chaleur, j'ai encore trop\nfroid aux yeux…$
```
### LavaridgeTown_Gym_B1F_Text_JacePostBattle
```
Le combat brûle dans tes veines.\nTu devrais avoir tes chances face à\lnotre CHAMPION.$
```
### LavaridgeTown_Gym_B1F_Text_JeffIntro
```
Tu vois cette flamme dans mon regard?\nC'est la flamme de la victoire!$
```
### LavaridgeTown_Gym_B1F_Text_JeffDefeat
```
Quelque chose m'a échappé.$
```
### LavaridgeTown_Gym_B1F_Text_JeffPostBattle
```
Bon, et alors? Je sais marcher sur\ndu charbon ardent, moi d'abord!\pMais je ne te conseille pas d'essayer!$
```
### LavaridgeTown_Gym_B1F_Text_EliIntro
```
J'aime les montagnes, donc j'aime\naussi les volcans.$
```
### LavaridgeTown_Gym_B1F_Text_EliDefeat
```
J'ai perdu complètement le contrôle\nde la situation.$
```
### LavaridgeTown_Gym_B1F_Text_EliPostBattle
```
Je reste ici car je suis un fan\nd'ADRIANE. Quel regard de braise!\pHé, hé, hé.$
```
### LavaridgeTown_Gym_1F_Text_FlanneryIntro
```
Bienvenue… Heu, non, attends.\pMisérable DRESSEUR, je suis contente de\nvoir que tu as réussi à arriver ici!\pPar les pouvoirs qui me sont conférés…\nHeu, non, attends.\pJe m'appelle ADRIANE et je suis le\nCHAMPION de cette ARENE!\pHeu…\nJe ne suis pas CHAMPION depuis très\llongtemps, mais ne me sous-estime pas!\pGrâce aux techniques de mon\ngrand-père, je vais te prouver, heu…\lque mes attaques sont puissantes!$
```
### LavaridgeTown_Gym_1F_Text_FlanneryDefeat
```
Oh non…\nJe suppose que j'ai été prétentieuse…\pJe… Je ne suis devenue CHAMPION\nD'ARENE que très récemment.\pJ'ai essayé de devenir quelqu'un que\nje ne suis pas.\pJe dois agir plus spontanément.\nSinon, mes POKéMON seront confus.\pMerci pour cette leçon.\nTu as bien mérité ceci.$
```
### LavaridgeTown_Gym_1F_Text_ReceivedHeatBadge
```
{PLAYER} reçoit le BADGE CHALEUR\nde la part d'ADRIANE.$
```
### LavaridgeTown_Gym_1F_Text_ExplainHeatBadgeTakeThis
```
Avec le BADGE CHALEUR, tous les \nPOKéMON jusqu'au niveau 50 t'obéiront\lsans discuter, même ceux que tu as\léchangés avec tes amis.\pIl permet aussi à tes POKéMON d'utiliser\nFORCE en dehors des combats.\pC'est un gage de ma sympathie.\nNe sois pas timide. Prends-le!$
```
### LavaridgeTown_Gym_1F_Text_ExplainOverheat
```
La CT50 contient SURCHAUFFE.\pCette attaque inflige de sérieux\ndégâts à l'adversaire.\pEn revanche, elle fait aussi baisser\nl'ATTAQUE SPECIALE du POKéMON\lqui l'utilise. Il faut éviter de l'utiliser\llors des longs combats.$
```
### LavaridgeTown_Gym_1F_Text_RegisteredFlannery
```
Vous avez enregistré le CHAMPION\nD'ARENE ADRIANE dans le POKéNAV.$
```
### LavaridgeTown_Gym_1F_Text_FlanneryPostBattle
```
Ta technique me rappelle quelqu'un…\pOh, je sais! Tu te bats comme NORMAN,\nle CHAMPION D'ARENE de CLEMENTI-VILLE.$
```
### LavaridgeTown_Gym_1F_Text_GymStatue
```
ARENE POKéMON de VERMILAVA$
```
### LavaridgeTown_Gym_1F_Text_GymStatueCertified
```
ARENE POKéMON de VERMILAVA\pNOUVEAU DRESSEUR RECONNU PAR ADRIANE:\n{PLAYER}$
```
### LavaridgeTown_Gym_1F_Text_FlanneryPreRematch
```
ADRIANE: Je ne vais pas me dégonfler\naprès une défaite.\pJ'aime les POKéMON.\nJ'aime me battre.\lEt surtout… j'adore cette ARENE!\pAllez, que la fièvre du combat s'empare\nde nous!$
```
### LavaridgeTown_Gym_1F_Text_FlanneryRematchDefeat
```
Waouh!\nUn vrai volcan en éruption!$
```
### LavaridgeTown_Gym_1F_Text_FlanneryPostRematch
```
ADRIANE: J'ai perdu, mais j'ai eu ce\nque je voulais.\pCe combat était chaud comme la\nbraise.\pJ'espère qu'il y en aura encore\nbeaucoup d'autres!$
```
### LavaridgeTown_Gym_1F_Text_FlanneryRematchNeedTwoMons
```
ADRIANE: Je ne vais pas me dégonfler\naprès une défaite.\pJ'aime les POKéMON.\nJ'aime me battre.\lEt surtout… j'adore cette ARENE!\pAllez, que le feu du combat s'empare\nde nous!\pMais, attends. Tu n'as qu'un seul\nPOKéMON qui peut se battre?\pDésolée, mais je ne me battrai pas tant\nque tu n'en auras pas au moins deux.$
```

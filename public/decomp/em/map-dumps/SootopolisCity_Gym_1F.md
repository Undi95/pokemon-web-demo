# SootopolisCity_Gym_1F

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_GYM_1F`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_GYM_1F`
- **music** : `MUS_GYM`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_GYM`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_JUAN` | 8,2 | `MOVEMENT_TYPE_FACE_DOWN` | `SootopolisCity_Gym_1F_EventScript_Juan` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_2` | 7,24 | `MOVEMENT_TYPE_FACE_DOWN` | `SootopolisCity_Gym_1F_EventScript_GymGuide` | `0` |

## Warps (3)
- #0 (8,25) → `MAP_SOOTOPOLIS_CITY` warp #2
- #1 (9,25) → `MAP_SOOTOPOLIS_CITY` warp #2
- #2 (11,22) → `MAP_SOOTOPOLIS_CITY_GYM_B1F` warp #0

## BG events / signs (2)
- (6,24) [sign] → `SootopolisCity_Gym_1F_EventScript_LeftGymStatue`
- (10,24) [sign] → `SootopolisCity_Gym_1F_EventScript_RightGymStatue`

## Flags référencés (9)
- `FLAG_BADGE06_GET`
- `FLAG_BADGE08_GET`
- `FLAG_DEFEATED_SOOTOPOLIS_GYM`
- `FLAG_ENABLE_JUAN_MATCH_CALL`
- `FLAG_HIDE_SOOTOPOLIS_CITY_MAN_1`
- `FLAG_HIDE_SOOTOPOLIS_CITY_RESIDENTS`
- `FLAG_HIDE_SOOTOPOLIS_CITY_STEVEN`
- `FLAG_HIDE_SOOTOPOLIS_CITY_WALLACE`
- `FLAG_RECEIVED_TM_WATER_PULSE`

## Variables référencées (4)
- `VAR_0x8008`
- `VAR_ICE_STEP_COUNT`
- `VAR_RESULT`
- `VAR_SOOTOPOLIS_CITY_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayGymBadgeFanfare`
### data/scripts/set_gym_trainers.inc
- `Common_EventScript_SetGymTrainers`

## Scripts (26)
### SootopolisCity_Gym_1F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, SootopolisCity_Gym_1F_OnFrame
map_script MAP_SCRIPT_ON_RESUME, SootopolisCity_Gym_1F_OnResume
map_script MAP_SCRIPT_ON_LOAD, SootopolisCity_Gym_1F_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, SootopolisCity_Gym_1F_OnTransition
```
### SootopolisCity_Gym_1F_OnTransition
```
setvar VAR_ICE_STEP_COUNT, 1
end
```
### SootopolisCity_Gym_1F_OnResume
```
setstepcallback STEP_CB_SOOTOPOLIS_ICE
end
```
### SootopolisCity_Gym_1F_OnLoad
```
call SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles
special SetSootopolisGymCrackedIceMetatiles
end
```
### SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles
```
goto_if_lt VAR_ICE_STEP_COUNT, 8, SootopolisCity_Gym_1F_EventScript_StopCheckingStairs  @ All stairs ice
goto_if_lt VAR_ICE_STEP_COUNT, 28, SootopolisCity_Gym_1F_EventScript_OpenFirstStairs
goto_if_lt VAR_ICE_STEP_COUNT, 67, SootopolisCity_Gym_1F_EventScript_OpenFirstAndSecondStairs
setmetatile 8, 4, METATILE_SootopolisGym_Stairs, FALSE
setmetatile 8, 5, METATILE_SootopolisGym_Stairs, FALSE
```
### SootopolisCity_Gym_1F_EventScript_OpenFirstAndSecondStairs
```
setmetatile 8, 10, METATILE_SootopolisGym_Stairs, FALSE
setmetatile 8, 11, METATILE_SootopolisGym_Stairs, FALSE
```
### SootopolisCity_Gym_1F_EventScript_OpenFirstStairs
```
setmetatile 8, 15, METATILE_SootopolisGym_Stairs, FALSE
setmetatile 8, 16, METATILE_SootopolisGym_Stairs, FALSE
```
### SootopolisCity_Gym_1F_EventScript_StopCheckingStairs
```
return
```
### SootopolisCity_Gym_1F_OnFrame
```
map_script_2 VAR_ICE_STEP_COUNT, 8, SootopolisCity_Gym_1F_EventScript_UnlockFirstStairs
map_script_2 VAR_ICE_STEP_COUNT, 28, SootopolisCity_Gym_1F_EventScript_UnlockSecondStairs
map_script_2 VAR_ICE_STEP_COUNT, 67, SootopolisCity_Gym_1F_EventScript_UnlockThirdStairs
map_script_2 VAR_ICE_STEP_COUNT, 0, SootopolisCity_Gym_1F_EventScript_FallThroughIce
```
### SootopolisCity_Gym_1F_EventScript_UnlockFirstStairs
```
addvar VAR_ICE_STEP_COUNT, 1
delay 40
playse SE_ICE_STAIRS
call SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles
special DrawWholeMapView
end
```
### SootopolisCity_Gym_1F_EventScript_UnlockSecondStairs
```
addvar VAR_ICE_STEP_COUNT, 1
delay 40
playse SE_ICE_STAIRS
call SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles
special DrawWholeMapView
end
```
### SootopolisCity_Gym_1F_EventScript_UnlockThirdStairs
```
addvar VAR_ICE_STEP_COUNT, 1
delay 40
playse SE_ICE_STAIRS
call SootopolisCity_Gym_1F_EventScript_CheckSetStairMetatiles
special DrawWholeMapView
end
```
### SootopolisCity_Gym_1F_EventScript_FallThroughIce
```
lockall
delay 20
applymovement LOCALID_PLAYER, SootopolisCity_Gym_1F_Movement_FallThroughIce
waitmovement 0
playse SE_FALL
delay 60
warphole MAP_SOOTOPOLIS_CITY_GYM_B1F
waitstate
end
```
### SootopolisCity_Gym_1F_Movement_FallThroughIce
```
set_invisible
step_end
```
### SootopolisCity_Gym_1F_EventScript_Juan
```
trainerbattle_single TRAINER_JUAN_1, SootopolisCity_Gym_1F_Text_JuanIntro, SootopolisCity_Gym_1F_Text_JuanDefeat, SootopolisCity_Gym_1F_EventScript_JuanDefeated, NO_MUSIC
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, SootopolisCity_Gym_1F_EventScript_JuanRematch
goto_if_unset FLAG_RECEIVED_TM_WATER_PULSE, SootopolisCity_Gym_1F_EventScript_GiveWaterPulse2
goto_if_unset FLAG_BADGE06_GET, SootopolisCity_Gym_1F_EventScript_GoGetFortreeBadge
msgbox SootopolisCity_Gym_1F_Text_JuanPostBattle, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Gym_1F_EventScript_JuanDefeated
```
message SootopolisCity_Gym_1F_Text_ReceivedRainBadge
waitmessage
call Common_EventScript_PlayGymBadgeFanfare
msgbox SootopolisCity_Gym_1F_Text_ExplainRainBadgeTakeThis, MSGBOX_DEFAULT
setflag FLAG_DEFEATED_SOOTOPOLIS_GYM
setflag FLAG_BADGE08_GET
setflag FLAG_HIDE_SOOTOPOLIS_CITY_RESIDENTS
setflag FLAG_HIDE_SOOTOPOLIS_CITY_STEVEN
setflag FLAG_HIDE_SOOTOPOLIS_CITY_WALLACE
setvar VAR_SOOTOPOLIS_CITY_STATE, 6
clearflag FLAG_HIDE_SOOTOPOLIS_CITY_MAN_1
setvar VAR_0x8008, 8
call Common_EventScript_SetGymTrainers
call SootopolisCity_Gym_1F_EventScript_GiveWaterPulse
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox SootopolisCity_Gym_1F_Text_RegisteredJuan, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_JUAN_MATCH_CALL
release
end
```
### SootopolisCity_Gym_1F_EventScript_GiveWaterPulse
```
giveitem ITEM_TM_WATER_PULSE
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_BagIsFull
msgbox SootopolisCity_Gym_1F_Text_ExplainWaterPulse, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_TM_WATER_PULSE
return
```
### SootopolisCity_Gym_1F_EventScript_GiveWaterPulse2
```
giveitem ITEM_TM_WATER_PULSE
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
msgbox SootopolisCity_Gym_1F_Text_ExplainWaterPulse, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_TM_WATER_PULSE
release
end
```
### SootopolisCity_Gym_1F_EventScript_GoGetFortreeBadge
```
msgbox SootopolisCity_Gym_1F_Text_GoGetFortreeBadge, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Gym_1F_EventScript_JuanRematch
```
trainerbattle_rematch_double TRAINER_JUAN_1, SootopolisCity_Gym_1F_Text_JuanPreRematch, SootopolisCity_Gym_1F_Text_JuanRematchDefeat, SootopolisCity_Gym_1F_Text_JuanRematchNeedTwoMons
msgbox SootopolisCity_Gym_1F_Text_JuanPostRematch, MSGBOX_AUTOCLOSE
end
```
### SootopolisCity_Gym_1F_EventScript_GymGuide
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_SOOTOPOLIS_GYM, SootopolisCity_Gym_1F_EventScript_GymGuidePostVictory
msgbox SootopolisCity_Gym_1F_Text_GymGuideAdvice, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Gym_1F_EventScript_GymGuidePostVictory
```
msgbox SootopolisCity_Gym_1F_Text_GymGuidePostVictory, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Gym_1F_EventScript_LeftGymStatue
```
lockall
goto_if_set FLAG_BADGE08_GET, SootopolisCity_Gym_1F_EventScript_GymStatueCertified
goto SootopolisCity_Gym_1F_EventScript_GymStatue
end
```
### SootopolisCity_Gym_1F_EventScript_RightGymStatue
```
lockall
goto_if_set FLAG_BADGE08_GET, SootopolisCity_Gym_1F_EventScript_GymStatueCertified
goto SootopolisCity_Gym_1F_EventScript_GymStatue
end
```
### SootopolisCity_Gym_1F_EventScript_GymStatueCertified
```
msgbox SootopolisCity_Gym_1F_Text_GymStatueCertified, MSGBOX_DEFAULT
releaseall
end
```
### SootopolisCity_Gym_1F_EventScript_GymStatue
```
msgbox SootopolisCity_Gym_1F_Text_GymStatue, MSGBOX_DEFAULT
releaseall
end
```

## Textes (16)
### SootopolisCity_Gym_1F_Text_GymGuideAdvice
```
Yo, ça baigne pour toi, futur\nMAITRE {PLAYER}?\pJUAN, le CHAMPION d'ATALANOPOLIS est\nle spécialiste des POKéMON du type EAU.\pMais pour le rencontrer, il te faudra\nréussir à avancer sur un sol gelé…\pEcoute, je suis désolé, mais c'est tout\nce que je peux te dire.\pPour le reste, il va falloir que tu\nte débrouilles!$
```
### SootopolisCity_Gym_1F_Text_GymGuidePostVictory
```
Waouh! Tu as même battu JUAN, censé\nêtre le meilleur de tout HOENN!\pOK! Regarde ta CARTE DRESSEUR.\pSi tu as tous les BADGES, tu vas pouvoir\nrelever le défi de la LIGUE POKéMON!$
```
### SootopolisCity_Gym_1F_Text_JuanIntro
```
Laissez-moi vous demander.\nSaviez-vous que…\lAh, je ne devrais point être si timide.\pSaviez-vous que j'ai appris à MARC\ntout ce qu'il sait sur les POKéMON?\pJ'étais autrefois le CHAMPION de cette\nmagnifique ARENE.\pCependant, un concours de\ncirconstances m'a forcé à revenir.\pMais assez palabré.\nNous devrions commencer notre\lmatch, ne pensez-vous pas?\pPréparez-vous à assister à une\nvéritable démonstration de talent.\pUne œuvre sur le thème de l'eau\ncomposée par mes POKéMON et moi.$
```
### SootopolisCity_Gym_1F_Text_JuanDefeat
```
Ah ah ah, excellent!\nTrès bien, la victoire est à vous.\pJe sens en vous l'existence d'une force\nqui vous permettra de surmonter les\lépreuves qui vous attendent.\pCependant, si je vous compare à MARC\nou bien à moi-même, je peux dire\lque vous manquez encore d'élégance.\pPeut-être devrais-je vous prêter\nmon habit?\p… … … … … …\n… … … … … …\pAh ah ah, je ne fais que me moquer!\pPlutôt que ma veste, je vous prie\nd'accepter ce BADGE PLUIE.$
```
### SootopolisCity_Gym_1F_Text_ReceivedRainBadge
```
{PLAYER} reçoit le BADGE PLUIE\nde la part de JUAN.$
```
### SootopolisCity_Gym_1F_Text_ExplainRainBadgeTakeThis
```
Avec ce BADGE, tous vos POKéMON\nvous obéiront et feront tout ce que\lvous leur demanderez.\pCe BADGE permet aussi d'utiliser la\ncapacité CS CASCADE pour passer\lles chutes d'eau.\pEt pour que vous n'oubliiez jamais notre\ncombat, prenez ceci…$
```
### SootopolisCity_Gym_1F_Text_ExplainWaterPulse
```
La CT que je vous ai donnée\ncontient VIBRAQUA.\pAvec ses vagues d'ultrasons,\nelle vous permettra parfois de rendre\lvos ennemis confus.\p… … … … … …$
```
### SootopolisCity_Gym_1F_Text_RegisteredJuan
```
Vous avez enregistré le CHAMPION\nD'ARENE JUAN dans le POKéNAV.$
```
### SootopolisCity_Gym_1F_Text_JuanPostBattle
```
Les DRESSEURS qui ont rassemblé tous\nles BADGES de HOENN doivent faire\lroute vers la destination ultime.\pLa LIGUE POKéMON!\pDirigez-vous vers la zone la plus à l'est\nde HOENN, jusqu'à l'île d'ETERNARA.\pLa LIGUE POKéMON se trouve là-bas.$
```
### SootopolisCity_Gym_1F_Text_GoGetFortreeBadge
```
Mais il te reste encore un BADGE à\nobtenir à HOENN.\pSi tu veux affronter la LIGUE POKéMON,\nil te faut obtenir ce dernier BADGE du\lCHAMPION D'ARENE de CIMETRONELLE.$
```
### SootopolisCity_Gym_1F_Text_GymStatue
```
ARENE POKéMON d'ATALANOPOLIS$
```
### SootopolisCity_Gym_1F_Text_GymStatueCertified
```
ARENE POKéMON d'ATALANOPOLIS\pNOUVEAU DRESSEUR RECONNU PAR JUAN:\n{PLAYER}$
```
### SootopolisCity_Gym_1F_Text_JuanPreRematch
```
JUAN: Ah, cette ARENE avait enfin\nretrouvé toute sa sérénité…\pMais le cataclysme que vous êtes est\nde retour pour nous tester de nouveau!\pEh bien j'accepte votre défi avec joie!\pJe serai ravi de vous affronter aussi\nsouvent que vous le souhaitez!$
```
### SootopolisCity_Gym_1F_Text_JuanRematchDefeat
```
Ahahaha, vous remportez la victoire!\nVous m'avez de nouveau vaincu!$
```
### SootopolisCity_Gym_1F_Text_JuanPostRematch
```
JUAN: Si je vous demandais de devenir\nmon élève, vous refuseriez, \lj'en suis certain.\pJe voudrais vous faire don de ma\nveste.\pMais comme je l'imagine, vous la\nrefuseriez de la même façon.\pEt cela, jeune DRESSEUR, est un\nsigne certain de noblesse!$
```
### SootopolisCity_Gym_1F_Text_JuanRematchNeedTwoMons
```
JUAN: Ah, cette ARENE avait enfin\nretrouvé toute sa sérénité…\pMais le cataclysme que vous êtes est\nde retour pour nous tester de nouveau!\pEh bien j'accepte votre défi avec joie!\pAh, mais cessez cela!\nVous n'avez qu'un POKéMON.\pJe souhaiterais que vous reveniez\navec au moins deux POKéMON.$
```

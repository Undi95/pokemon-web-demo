# BattleFrontier_ScottsHouse

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_SCOTTS_HOUSE`
- **layout** : `LAYOUT_BATTLE_FRONTIER_SCOTTS_HOUSE`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SCOTTS_HOUSE_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 2,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `BattleFrontier_ScottsHouse_EventScript_Scott` | `0` |

## Warps (2)
- #0 (2,7) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #5
- #1 (3,7) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #5

## Flags référencés (22)
- `FLAG_COLLECTED_ALL_GOLD_SYMBOLS`
- `FLAG_COLLECTED_ALL_SILVER_SYMBOLS`
- `FLAG_RECEIVED_GOLD_SHIELD`
- `FLAG_RECEIVED_SILVER_SHIELD`
- `FLAG_SCOTT_GIVES_BATTLE_POINTS`
- `FLAG_SYS_ARENA_GOLD`
- `FLAG_SYS_ARENA_SILVER`
- `FLAG_SYS_DOME_GOLD`
- `FLAG_SYS_DOME_SILVER`
- `FLAG_SYS_FACTORY_GOLD`
- `FLAG_SYS_FACTORY_SILVER`
- `FLAG_SYS_PALACE_GOLD`
- `FLAG_SYS_PALACE_SILVER`
- `FLAG_SYS_PIKE_GOLD`
- `FLAG_SYS_PIKE_SILVER`
- `FLAG_SYS_PYRAMID_GOLD`
- `FLAG_SYS_PYRAMID_SILVER`
- `FLAG_SYS_TOWER_GOLD`
- `FLAG_SYS_TOWER_SILVER`
- `FLAG_TEMP_2`
- `FLAG_TEMP_3`
- `FLAG_TEMP_4`

## Variables référencées (6)
- `VAR_0x8004`
- `VAR_1`
- `VAR_FACING`
- `VAR_FRONTIER_BATTLE_MODE`
- `VAR_RESULT`
- `VAR_SCOTT_STATE`

## Scripts (27)
### BattleFrontier_ScottsHouse_EventScript_Scott
```
lock
faceplayer
goto_if_set FLAG_TEMP_4, BattleFrontier_ScottsHouse_EventScript_GivenBerry
goto_if_set FLAG_TEMP_3, BattleFrontier_ScottsHouse_EventScript_GivenShield
goto_if_set FLAG_TEMP_2, BattleFrontier_ScottsHouse_EventScript_GivenBattlePoints
goto BattleFrontier_ScottsHouse_EventScript_CheckGiveItems
end
```
### BattleFrontier_ScottsHouse_EventScript_CheckGiveItems
```
goto_if_unset FLAG_SCOTT_GIVES_BATTLE_POINTS, BattleFrontier_ScottsHouse_EventScript_WelcomeToFrontier
goto_if_unset FLAG_COLLECTED_ALL_SILVER_SYMBOLS, BattleFrontier_ScottsHouse_EventScript_CheckSilverSymbols
goto_if_unset FLAG_COLLECTED_ALL_GOLD_SYMBOLS, BattleFrontier_ScottsHouse_EventScript_CheckGoldSymbols
goto BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
end
```
### BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
```
goto_if_unset FLAG_RECEIVED_SILVER_SHIELD, BattleFrontier_ScottsHouse_EventScript_CheckGiveSilverShield
goto_if_unset FLAG_RECEIVED_GOLD_SHIELD, BattleFrontier_ScottsHouse_EventScript_CheckGiveGoldShield
goto BattleFrontier_ScottsHouse_EventScript_RandomComment
end
```
### BattleFrontier_ScottsHouse_EventScript_CheckSilverSymbols
```
goto_if_unset FLAG_SYS_TOWER_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_DOME_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_PALACE_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_ARENA_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_FACTORY_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_PIKE_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_PYRAMID_SILVER, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
msgbox BattleFrontier_ScottsHouse_Text_YouveCollectedAllSilverSymbols, MSGBOX_DEFAULT
giveitem ITEM_LANSAT_BERRY
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_ScottsHouse_EventScript_BerryPocketFull
setflag FLAG_COLLECTED_ALL_SILVER_SYMBOLS
setflag FLAG_TEMP_4
release
end
```
### BattleFrontier_ScottsHouse_EventScript_CheckGoldSymbols
```
goto_if_unset FLAG_SYS_TOWER_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_DOME_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_PALACE_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_ARENA_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_FACTORY_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_PIKE_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
goto_if_unset FLAG_SYS_PYRAMID_GOLD, BattleFrontier_ScottsHouse_EventScript_CheckGiveShield
msgbox BattleFrontier_ScottsHouse_Text_YouveCollectedAllGoldSymbols, MSGBOX_DEFAULT
giveitem ITEM_STARF_BERRY
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_ScottsHouse_EventScript_BerryPocketFull
setflag FLAG_COLLECTED_ALL_GOLD_SYMBOLS
setflag FLAG_TEMP_4
release
end
```
### BattleFrontier_ScottsHouse_EventScript_BerryPocketFull
```
msgbox BattleFrontier_ScottsHouse_Text_BerryPocketStuffed, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_GivenBerry
```
msgbox BattleFrontier_ScottsHouse_Text_SoGladIBroughtYouHere, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_RandomComment
```
random 3
goto_if_eq VAR_RESULT, 1, BattleFrontier_ScottsHouse_EventScript_FrontierBrainComment
goto_if_eq VAR_RESULT, 2, BattleFrontier_ScottsHouse_EventScript_ArtisanCaveComment
msgbox BattleFrontier_ScottsHouse_Text_WhyIGoSeekingTrainers, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_FrontierBrainComment
```
msgbox BattleFrontier_ScottsHouse_Text_HaveYouMetFrontierBrain, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_ArtisanCaveComment
```
msgbox BattleFrontier_ScottsHouse_Text_MayFindWildMonsInFrontier, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_CheckGiveSilverShield
```
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_50
tower_get TOWER_DATA_WIN_STREAK
goto_if_ge VAR_RESULT, 50, BattleFrontier_ScottsHouse_EventScript_GiveSilverShield
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_OPEN
tower_get TOWER_DATA_WIN_STREAK
goto_if_ge VAR_RESULT, 50, BattleFrontier_ScottsHouse_EventScript_GiveSilverShield
goto BattleFrontier_ScottsHouse_EventScript_RandomComment
end
```
### BattleFrontier_ScottsHouse_EventScript_GiveSilverShield
```
msgbox BattleFrontier_ScottsHouse_Text_Beat50TrainersInARow, MSGBOX_DEFAULT
givedecoration DECOR_SILVER_SHIELD
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_ScottsHouse_EventScript_NoRoomForShield
setflag FLAG_RECEIVED_SILVER_SHIELD
setflag FLAG_TEMP_3
goto BattleFrontier_ScottsHouse_EventScript_GivenShield
end
```
### BattleFrontier_ScottsHouse_EventScript_NoRoomForShield
```
msgbox BattleFrontier_ScottsHouse_Text_ComeBackForThisLater, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_GivenShield
```
msgbox BattleFrontier_ScottsHouse_Text_ExpectingToHearEvenGreaterThings, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_CheckGiveGoldShield
```
setvar VAR_FRONTIER_BATTLE_MODE, FRONTIER_MODE_SINGLES
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_50
tower_get TOWER_DATA_WIN_STREAK
goto_if_ge VAR_RESULT, 100, BattleFrontier_ScottsHouse_EventScript_GiveGoldShield
frontier_set FRONTIER_DATA_LVL_MODE, FRONTIER_LVL_OPEN
tower_get TOWER_DATA_WIN_STREAK
goto_if_ge VAR_RESULT, 100, BattleFrontier_ScottsHouse_EventScript_GiveGoldShield
goto BattleFrontier_ScottsHouse_EventScript_RandomComment
end
```
### BattleFrontier_ScottsHouse_EventScript_GiveGoldShield
```
msgbox BattleFrontier_ScottsHouse_Text_Beat100TrainersInARow, MSGBOX_DEFAULT
givedecoration DECOR_GOLD_SHIELD
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_ScottsHouse_EventScript_NoRoomForShield
setflag FLAG_RECEIVED_GOLD_SHIELD
setflag FLAG_TEMP_3
goto BattleFrontier_ScottsHouse_EventScript_GivenShield
end
```
### BattleFrontier_ScottsHouse_EventScript_GivenBattlePoints
```
msgbox BattleFrontier_ScottsHouse_Text_ExpectingGreatThings, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ScottsHouse_EventScript_WelcomeToFrontier
```
msgbox BattleFrontier_ScottsHouse_Text_WelcomeToBattleFrontier, MSGBOX_DEFAULT
closemessage
delay 30
call_if_eq VAR_FACING, DIR_NORTH, BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayNorth
call_if_eq VAR_FACING, DIR_SOUTH, BattleFrontier_ScottsHouse_EventScript_ScottFaceAwaySouth
call_if_eq VAR_FACING, DIR_EAST, BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayEast
call_if_eq VAR_FACING, DIR_WEST, BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayWest
msgbox BattleFrontier_ScottsHouse_Text_HowMuchEffortItTookToMakeReal, MSGBOX_DEFAULT
applymovement LOCALID_SCOTTS_HOUSE_SCOTT, Common_Movement_FacePlayer
waitmovement 0
msgbox BattleFrontier_ScottsHouse_Text_HaveThisAsMementoOfOurPathsCrossing, MSGBOX_DEFAULT
goto_if_eq VAR_SCOTT_STATE, 13, BattleFrontier_ScottsHouse_EventScript_Give4BattlePoints
goto_if_ge VAR_SCOTT_STATE, 9, BattleFrontier_ScottsHouse_EventScript_Give3BattlePoints
goto_if_ge VAR_SCOTT_STATE, 6, BattleFrontier_ScottsHouse_EventScript_Give2BattlePoints
goto BattleFrontier_ScottsHouse_EventScript_Give1BattlePoint
end
```
### BattleFrontier_ScottsHouse_EventScript_Give4BattlePoints
```
buffernumberstring STR_VAR_1, 4
setvar VAR_0x8004, 4
goto BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints
end
```
### BattleFrontier_ScottsHouse_EventScript_Give3BattlePoints
```
buffernumberstring STR_VAR_1, 3
setvar VAR_0x8004, 3
goto BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints
end
```
### BattleFrontier_ScottsHouse_EventScript_Give2BattlePoints
```
buffernumberstring STR_VAR_1, 2
setvar VAR_0x8004, 2
goto BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints
end
```
### BattleFrontier_ScottsHouse_EventScript_Give1BattlePoint
```
buffernumberstring STR_VAR_1, 1
setvar VAR_0x8004, 1
goto BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints
end
```
### BattleFrontier_ScottsHouse_EventScript_GiveBattlePoints
```
special GiveFrontierBattlePoints
msgbox BattleFrontier_ScottsHouse_Text_ObtainedXBattlePoints, MSGBOX_GETPOINTS
msgbox BattleFrontier_ScottsHouse_Text_ExplainBattlePoints, MSGBOX_DEFAULT
setflag FLAG_SCOTT_GIVES_BATTLE_POINTS
setflag FLAG_TEMP_2
release
end
```
### BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayNorth
```
applymovement LOCALID_SCOTTS_HOUSE_SCOTT, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
return
```
### BattleFrontier_ScottsHouse_EventScript_ScottFaceAwaySouth
```
applymovement LOCALID_SCOTTS_HOUSE_SCOTT, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
return
```
### BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayEast
```
applymovement LOCALID_SCOTTS_HOUSE_SCOTT, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
return
```
### BattleFrontier_ScottsHouse_EventScript_ScottFaceAwayWest
```
applymovement LOCALID_SCOTTS_HOUSE_SCOTT, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
return
```

## Textes (17)
### BattleFrontier_ScottsHouse_Text_WelcomeToBattleFrontier
```
SCOTT: Bonjour toi! Bienvenue!\nDésolé, je sais que c'est un peu petit.\pJe suis content de t'accueillir dans\nla ZONE DE COMBAT, {PLAYER}{KUN}.\pMon rêve s'est enfin réalisé!\nÇa m'a pris des années et beaucoup\ld'efforts, mais j'y suis enfin parvenu.$
```
### BattleFrontier_ScottsHouse_Text_HowMuchEffortItTookToMakeReal
```
Ce fut un très long voyage…\pJ'ai pris la route pour me mettre à la\nrecherche de DRESSEURS forts.\pJ'ai bâti ce rêve au prix de tant\nd'efforts et de sacrifices!$
```
### BattleFrontier_ScottsHouse_Text_HaveThisAsMementoOfOurPathsCrossing
```
Mais tout ça, c'est du passé!\nJe ne vais pas m'étendre sur le sujet!\pJ'espère que tu vas pouvoir te\nbattre jusqu'à plus soif, ici!\p{PLAYER}{KUN}, prends ça. C'est en souvenir\nde toutes les fois où nos chemins se\lsont croisés.$
```
### BattleFrontier_ScottsHouse_Text_ObtainedXBattlePoints
```
{PLAYER} obtient {STR_VAR_1}\nPOINT(S) DE COMBAT.$
```
### BattleFrontier_ScottsHouse_Text_ExplainBattlePoints
```
SCOTT: Ton nombre de POINTS DE COMBAT\nest inscrit sur ton PASSE ZONE.\pPlus tu auras de succès dans la ZONE DE\nCOMBAT, plus tu accumuleras de POINTS\lDE COMBAT.\pUtilise-les comme bon te semble.\nTu peux les échanger contre des objets.$
```
### BattleFrontier_ScottsHouse_Text_ExpectingGreatThings
```
Je vais te suivre de près. Je suis sûr\nque beaucoup de réussites t'attendent!$
```
### BattleFrontier_ScottsHouse_Text_WhyIGoSeekingTrainers
```
SCOTT: Chaque DRESSEUR est unique.\nChacun a sa propre histoire.\pMais au combat, ils doivent laisser\ntout ça derrière eux!\pIls sont tous DRESSEURS!\pJ'aime cette pureté. Face au combat, les\nDRESSEURS sont tous égaux.\pC'est pourquoi je voyage à la recherche\nde DRESSEURS dignes de ce nom et\lque je les invite ici.$
```
### BattleFrontier_ScottsHouse_Text_HaveYouMetFrontierBrain
```
SCOTT: As-tu déjà rencontré un des\nMENEURS DE ZONE?\pEncore mieux, as-tu déjà obtenu des\nsymboles?\pLes MENEURS DE ZONE ont été triés sur\nle volet. Ce sont les meilleurs!\pMais je suis sûr que tu serais capable\nde leur faire peur!$
```
### BattleFrontier_ScottsHouse_Text_MayFindWildMonsInFrontier
```
SCOTT: Tu ne t'entraînes pas que pour\nles combats, n'est-ce pas?\pIl me semble que tu travailles aussi à\nun POKéDEX.\pEh bien, devine quoi!\pIl y a des POKéMON sauvages dans la\nZONE DE COMBAT…\lOuvre les yeux!$
```
### BattleFrontier_ScottsHouse_Text_YouveCollectedAllSilverSymbols
```
SCOTT: Tout se passe bien dans la\nZONE DE COMBAT?\pAttends un instant…\nOh!\pTon PASSE ZONE!\nTu as tous les symboles argent!\pC'est impressionnant!\nMais ça ne me surprend pas vraiment!\pD'ordinaire, je ne fais pas ce genre de\nchoses, mais là c'est exceptionnel!\pJe veux que tu prennes ça.\nJe suis sûr que tu en feras bon usage.$
```
### BattleFrontier_ScottsHouse_Text_YouveCollectedAllGoldSymbols
```
SCOTT: J'espère que ton séjour dans la\nZONE DE COMBAT se passe bien.\pMais, attends…\nAlors là, je n'en crois pas mes yeux!\pTon PASSE ZONE!\nTu as obtenu tous les symboles\lor!\pC'est prodigieux! Tu es plus incroyable\nque ce que je pensais!\p… … … … … …\p{PLAYER}, tu dois accepter ça!\pJe suis sûr que tu sauras apprécier ce\ncadeau à sa juste valeur!$
```
### BattleFrontier_ScottsHouse_Text_SoGladIBroughtYouHere
```
Je sais reconnaître un bon DRESSEUR\nquand j'en vois un.\pJe me félicite d'avoir décidé de\nt'inviter ici!$
```
### BattleFrontier_ScottsHouse_Text_BerryPocketStuffed
```
La POCHE BAIES a l'air pleine.$
```
### BattleFrontier_ScottsHouse_Text_Beat50TrainersInARow
```
SCOTT: Oh, on m'a raconté tes exploits à\nla TOUR DE COMBAT! Tu as battu plus de\l50 DRESSEURS à la suite?\pC'est fantastique!\nJe veux que tu acceptes ça!$
```
### BattleFrontier_ScottsHouse_Text_Beat100TrainersInARow
```
SCOTT: Oh! Tu sais, on m'a parlé de tes\nexploits à la TOUR DE COMBAT! Tu as\lbattu plus de 100 DRESSEURS à la suite?\pC'est incroyable, spectaculaire!\nIl faut que tu prennes ça!$
```
### BattleFrontier_ScottsHouse_Text_ExpectingToHearEvenGreaterThings
```
Je me demande bien quelles surprises\ntu me réserves encore!$
```
### BattleFrontier_ScottsHouse_Text_ComeBackForThisLater
```
Eh bien si tu n'as pas de place pour\nl'instant, reviens plus tard.$
```

# RustboroCity_PokemonSchool

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_POKEMON_SCHOOL`
- **layout** : `LAYOUT_RUSTBORO_CITY_POKEMON_SCHOOL`
- **music** : `MUS_SCHOOL`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 8,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_PokemonSchool_EventScript_GameboyKid1` | `0` |
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 9,6 | `MOVEMENT_TYPE_FACE_LEFT` | `RustboroCity_PokemonSchool_EventScript_GameboyKid2` | `0` |
| `` | `OBJ_EVENT_GFX_RICH_BOY` | 3,8 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_PokemonSchool_EventScript_RichBoy` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 10,8 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_PokemonSchool_EventScript_Lass` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 3,6 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_PokemonSchool_EventScript_SchoolKidM` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 5,3 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_PokemonSchool_EventScript_Teacher` | `0` |
| `` | `OBJ_EVENT_GFX_SCOTT` | 0,10 | `MOVEMENT_TYPE_FACE_UP` | `RustboroCity_PokemonSchool_EventScript_Scott` | `FLAG_HIDE_RUSTBORO_CITY_POKEMON_SCHOOL_SCOTT` |

## Warps (2)
- #0 (5,10) → `MAP_RUSTBORO_CITY` warp #4
- #1 (6,10) → `MAP_RUSTBORO_CITY` warp #4

## BG events / signs (5)
- (5,2) [sign] → `RustboroCity_PokemonSchool_EventScript_Blackboard`
- (4,2) [sign] → `RustboroCity_PokemonSchool_EventScript_Blackboard`
- (6,2) [sign] → `RustboroCity_PokemonSchool_EventScript_Blackboard`
- (7,2) [sign] → `RustboroCity_PokemonSchool_EventScript_Blackboard`
- (3,5) [sign] → `RustboroCity_PokemonSchool_EventScript_StudentNotebook`

## Flags référencés (4)
- `FLAG_BADGE01_GET`
- `FLAG_MET_SCOTT_AFTER_OBTAINING_STONE_BADGE`
- `FLAG_MET_SCOTT_RUSTBORO`
- `FLAG_RECEIVED_QUICK_CLAW`

## Variables référencées (4)
- `VAR_FACING`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_SCOTT_STATE`

## Scripts (26)
### RustboroCity_PokemonSchool_EventScript_Blackboard
```
lockall
msgbox RustboroCity_PokemonSchool_Text_BlackboardListsStatusChanges, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
end
```
### RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
```
message RustboroCity_PokemonSchool_Text_ReadWhichTopic
waitmessage
multichoicegrid 8, 1, MULTI_STATUS_INFO, 3, FALSE
switch VAR_RESULT
case 0, RustboroCity_PokemonSchool_EventScript_Poison
case 1, RustboroCity_PokemonSchool_EventScript_Paralysis
case 2, RustboroCity_PokemonSchool_EventScript_Sleep
case 3, RustboroCity_PokemonSchool_EventScript_Burn
case 4, RustboroCity_PokemonSchool_EventScript_Freeze
case 5, RustboroCity_PokemonSchool_EventScript_ExitTopicSelect
case MULTI_B_PRESSED, RustboroCity_PokemonSchool_EventScript_ExitTopicSelect
end
```
### RustboroCity_PokemonSchool_EventScript_Poison
```
msgbox RustboroCity_PokemonSchool_Text_ExplainPoison, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
end
```
### RustboroCity_PokemonSchool_EventScript_Paralysis
```
msgbox RustboroCity_PokemonSchool_Text_ExplainParalysis, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
end
```
### RustboroCity_PokemonSchool_EventScript_Sleep
```
msgbox RustboroCity_PokemonSchool_Text_ExplainSleep, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
end
```
### RustboroCity_PokemonSchool_EventScript_Burn
```
msgbox RustboroCity_PokemonSchool_Text_ExplainBurn, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
end
```
### RustboroCity_PokemonSchool_EventScript_Freeze
```
msgbox RustboroCity_PokemonSchool_Text_ExplainFreeze, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_ChooseBlackboardTopic
end
```
### RustboroCity_PokemonSchool_EventScript_ExitTopicSelect
```
releaseall
end
```
### RustboroCity_PokemonSchool_EventScript_GameboyKid1
```
msgbox RustboroCity_PokemonSchool_Text_TradingRightNow, MSGBOX_NPC
end
```
### RustboroCity_PokemonSchool_EventScript_GameboyKid2
```
msgbox RustboroCity_PokemonSchool_Text_AlwaysWantedSeedot, MSGBOX_NPC
end
```
### RustboroCity_PokemonSchool_EventScript_RichBoy
```
msgbox RustboroCity_PokemonSchool_Text_PokemontCantUseManMadeItems, MSGBOX_NPC
end
```
### RustboroCity_PokemonSchool_EventScript_Lass
```
msgbox RustboroCity_PokemonSchool_Text_ConfusedPokemonAttacksItself, MSGBOX_NPC
end
```
### RustboroCity_PokemonSchool_EventScript_SchoolKidM
```
msgbox RustboroCity_PokemonSchool_Text_PokemonHealItselfWithBerry, MSGBOX_NPC
end
```
### RustboroCity_PokemonSchool_EventScript_StudentNotebook
```
msgbox RustboroCity_PokemonSchool_Text_StudentsNotes, MSGBOX_SIGN
end
```
### RustboroCity_PokemonSchool_EventScript_Teacher
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_QUICK_CLAW, RustboroCity_PokemonSchool_EventScript_GaveQuickClaw
call_if_eq VAR_FACING, DIR_EAST, RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsEast
call_if_eq VAR_FACING, DIR_WEST, RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsWest
msgbox RustboroCity_PokemonSchool_Text_StudentsWhoDontStudyGetQuickClaw, MSGBOX_DEFAULT
giveitem ITEM_QUICK_CLAW
goto_if_eq VAR_RESULT, 0, Common_EventScript_ShowBagIsFull
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
setflag FLAG_RECEIVED_QUICK_CLAW
release
end
```
### RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsEast
```
applymovement VAR_LAST_TALKED, RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsEast
waitmovement 0
return
```
### RustboroCity_PokemonSchool_EventScript_TeacherCheckOnStudentsWest
```
applymovement VAR_LAST_TALKED, RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsWest
waitmovement 0
return
```
### RustboroCity_PokemonSchool_EventScript_GaveQuickClaw
```
msgbox RustboroCity_PokemonSchool_Text_ExplainQuickClaw, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
release
end
```
### RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsWest
```
walk_left
walk_down
walk_down
walk_right
walk_in_place_faster_down
delay_16
delay_16
delay_16
walk_down
walk_in_place_faster_left
delay_16
delay_16
walk_right
delay_16
delay_16
delay_8
walk_up
walk_left
walk_left
walk_up
walk_up
walk_right
step_end
```
### RustboroCity_PokemonSchool_Movement_TeacherCheckOnStudentsEast
```
walk_right
walk_right
walk_down
walk_down
walk_left
walk_left
walk_in_place_faster_down
delay_16
delay_16
delay_16
walk_down
walk_in_place_faster_left
delay_16
delay_16
walk_right
delay_16
delay_16
delay_8
walk_up
walk_right
walk_up
walk_up
walk_left
walk_left
step_end
```
### RustboroCity_PokemonSchool_EventScript_Scott
```
lock
faceplayer
goto_if_set FLAG_MET_SCOTT_AFTER_OBTAINING_STONE_BADGE, RustboroCity_PokemonSchool_EventScript_ScottWatchStudents
goto_if_set FLAG_MET_SCOTT_RUSTBORO, RustboroCity_PokemonSchool_EventScript_ScottSpokeAlready
goto_if_set FLAG_BADGE01_GET, RustboroCity_PokemonSchool_EventScript_ScottGreetHasBadge
msgbox RustboroCity_PokemonSchool_Text_ScottMetAlreadyCut, MSGBOX_DEFAULT
addvar VAR_SCOTT_STATE, 1
setflag FLAG_MET_SCOTT_RUSTBORO
release
end
```
### RustboroCity_PokemonSchool_EventScript_ScottSpokeAlready
```
goto_if_set FLAG_BADGE01_GET, RustboroCity_PokemonSchool_EventScript_ScottNoticeBadge
msgbox RustboroCity_PokemonSchool_Text_StudentTalentLevelUnknown, MSGBOX_DEFAULT
release
end
```
### RustboroCity_PokemonSchool_EventScript_ScottGreetHasBadge
```
msgbox RustboroCity_PokemonSchool_Text_ScottMetAlreadyStoneBadge, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_MetScottAfterBadge
end
```
### RustboroCity_PokemonSchool_EventScript_ScottNoticeBadge
```
msgbox RustboroCity_PokemonSchool_Text_ScottStoneBadge, MSGBOX_DEFAULT
goto RustboroCity_PokemonSchool_EventScript_MetScottAfterBadge
end
```
### RustboroCity_PokemonSchool_EventScript_MetScottAfterBadge
```
addvar VAR_SCOTT_STATE, 1
setflag FLAG_MET_SCOTT_AFTER_OBTAINING_STONE_BADGE
release
end
```
### RustboroCity_PokemonSchool_EventScript_ScottWatchStudents
```
msgbox RustboroCity_PokemonSchool_Text_StudentTalentLevelUnknown, MSGBOX_DEFAULT
release
end
```

## Textes (19)
### RustboroCity_PokemonSchool_Text_BlackboardListsStatusChanges
```
Ce tableau liste les changements de\nstatut pouvant toucher les POKéMON\lau combat.$
```
### RustboroCity_PokemonSchool_Text_ReadWhichTopic
```
Lire quel sujet?$
```
### RustboroCity_PokemonSchool_Text_ExplainPoison
```
Si un POKéMON est empoisonné, ses PV\ndiminuent régulièrement.\pLes effets du poison perdurent\naprès un combat.\pLes PV d'un POKéMON empoisonné\ncontinuent à diminuer hors combat.\pL'ANTIDOTE remédie à l'empoisonnement.$
```
### RustboroCity_PokemonSchool_Text_ExplainParalysis
```
Si un POKéMON est paralysé, sa\nVITESSE diminue.\pIl peut aussi être dans l'incapacité\nde se déplacer pendant le combat.\pLa paralysie persiste après le combat.\nL'ANTI-PARA permet d'y remédier.$
```
### RustboroCity_PokemonSchool_Text_ExplainSleep
```
Si un POKéMON s'endort, il est\ndans l'incapacité d'attaquer.\pLe POKéMON peut se réveiller de\nlui-même, mais s'il est endormi à\lla fin du combat, il le restera ensuite.\pLe REVEIL le sortira de son sommeil.$
```
### RustboroCity_PokemonSchool_Text_ExplainBurn
```
Une brûlure réduit la puissance\nd'ATTAQUE et les PV de la victime.\pUne brûlure persiste après le combat.\nL'ANTI-BRULE permet d'y remédier.$
```
### RustboroCity_PokemonSchool_Text_ExplainFreeze
```
Si un POKéMON est gelé, il n'est\nplus d'aucune aide.\pIl restera gelé après le combat.\nL'ANTIGEL permet de le dégeler.$
```
### RustboroCity_PokemonSchool_Text_StudentsWhoDontStudyGetQuickClaw
```
Les élèves qui ne travaillent pas n'ont\nqu'un petit échantillon de ma VIVE\lGRIFFE.\pLa manière dont tu utiliseras cet objet\nindiquera de façon évidente si tu\lapprends bien ou pas.$
```
### RustboroCity_PokemonSchool_Text_ExplainQuickClaw
```
Un POKéMON qui porte VIVE GRIFFE\npourra parfois augmenter sa vitesse\let attaquer avant son adversaire.\pD'autres objets comme celui-ci sont\nfaits pour être portés par un POKéMON.\pMais celui-ci te donnera déjà matière\nà réfléchir!$
```
### RustboroCity_PokemonSchool_Text_TradingRightNow
```
Je vais dès maintenant faire un\néchange de POKéMON avec mon ami.$
```
### RustboroCity_PokemonSchool_Text_AlwaysWantedSeedot
```
J'ai toujours voulu un GRAINIPIOT\net j'ai enfin réussi à en avoir un!$
```
### RustboroCity_PokemonSchool_Text_PokemontCantUseManMadeItems
```
Les POKéMON peuvent porter des objets,\nmais ne savent pas utiliser les objets\lconçus par les hommes, tels que la\lPOTION ou l'ANTIDOTE.$
```
### RustboroCity_PokemonSchool_Text_ConfusedPokemonAttacksItself
```
Tu sais combien certaines capacités\npeuvent troubler un POKéMON?\pUn POKéMON confus peut parfois\nse blesser sans le vouloir.\pMais après le combat, il retrouve\nses esprits.$
```
### RustboroCity_PokemonSchool_Text_PokemonHealItselfWithBerry
```
Un POKéMON qui porte une BAIE\nse soignera lui-même…\pIl existe de nombreuses sortes\nd'objets qu'un POKéMON peut porter…\pC'est sûr, c'est pas facile d'arriver\nà tout noter…$
```
### RustboroCity_PokemonSchool_Text_StudentsNotes
```
C'est le carnet de cet étudiant…\pOn attrape les POKéMON avec des\nPOKé BALLS.\pJusqu'à six POKéMON peuvent\naccompagner un DRESSEUR.\pUn DRESSEUR est une personne\nqui attrape des POKéMON, les fait\lprogresser et se bat avec eux.\pL'objectif du DRESSEUR est de battre\nles puissants CHAMPIONS qui attendent\lles adversaires dans les ARENES POKéMON.$
```
### RustboroCity_PokemonSchool_Text_ScottMetAlreadyCut
```
Salut! On s'est déjà vus, non?\nJe crois que c'était à CLEMENTI-VILLE.\pJe me présente. Je m'appelle SCOTT.\pJe voyage un peu partout à la recherche\nde DRESSEURS de talent.\pPlus précisément, je recherche des\nexperts en combats de POKéMON.\pAlors dis-moi, qu'est-ce qui t'amène\ndans cette ECOLE? Es-tu aussi\lun DRESSEUR?\pLa première chose que tu devrais faire\nest d'enseigner la capacité COUPE à\lun de tes POKéMON.\pSi je me souviens bien, quelqu'un\ndans cette ville possède COUPE.$
```
### RustboroCity_PokemonSchool_Text_StudentTalentLevelUnknown
```
SCOTT: Hmm…\pJe ne connais pas le niveau de ces\nétudiants, mais il y a du potentiel.$
```
### RustboroCity_PokemonSchool_Text_ScottStoneBadge
```
SCOTT: Oh, qu'est-ce que c'est?\pC'est le BADGE ROCHE, n'est-ce pas?\nJe dois dire que je suis impressionné.\pTu sais, j'aurais beaucoup aimé te voir\nen plein combat.\pIl est difficile d'imaginer quel genre de\nDRESSEUR tu es, à partir d'un\lBADGE de la LIGUE.$
```
### RustboroCity_PokemonSchool_Text_ScottMetAlreadyStoneBadge
```
Salut! On s'est déjà vus, non?\nJe crois que c'était à CLEMENTI-VILLE.\pJe me présente. Je m'appelle SCOTT.\pJe voyage un peu partout à la recherche\nde DRESSEURS de talent.\pPlus précisément, je recherche des\nexperts en combats de POKéMON.\pOh, qu'est-ce que c'est?\pC'est le BADGE ROCHE, n'est-ce pas?\nJe dois dire que je suis impressionné.\pTu sais, j'aurais beaucoup aimé te voir\nen plein combat.\pIl est difficile d'imaginer quel genre\nde DRESSEUR tu es, à partir d'un\lBADGE de la LIGUE.$
```

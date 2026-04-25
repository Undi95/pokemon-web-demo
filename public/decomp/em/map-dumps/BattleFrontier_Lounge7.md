# BattleFrontier_Lounge7

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_LOUNGE7`
- **layout** : `LAYOUT_BATTLE_FRONTIER_LOUNGE2`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SAILOR` | 0,7 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_Lounge7_EventScript_Sailor` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 2,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Lounge7_EventScript_LeftMoveTutor` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 6,5 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge7_EventScript_RightMoveTutor` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 8,3 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge7_EventScript_Gentleman` | `0` |

## Warps (1)
- #0 (4,9) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #7

## Flags référencés (2)
- `FLAG_MET_FRONTIER_BEAUTY_MOVE_TUTOR`
- `FLAG_MET_FRONTIER_SWIMMER_MOVE_TUTOR`

## Variables référencées (10)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8008`
- `VAR_2`
- `VAR_RESULT`
- `VAR_TEMP_1`
- `VAR_TEMP_C`
- `VAR_TEMP_FRONTIER_TUTOR_ID`
- `VAR_TEMP_FRONTIER_TUTOR_SELECTION`

## Scripts (35)
### BattleFrontier_Lounge7_EventScript_LeftMoveTutor
```
lock
faceplayer
setvar VAR_TEMP_C, SCROLL_MULTI_BF_MOVE_TUTOR_1
goto_if_set FLAG_MET_FRONTIER_BEAUTY_MOVE_TUTOR, BattleFrontier_Lounge7_EventScript_AlreadyMetLeftTutor
msgbox BattleFrontier_Lounge7_Text_LeftTutorIntro, MSGBOX_DEFAULT
setflag FLAG_MET_FRONTIER_BEAUTY_MOVE_TUTOR
goto BattleFrontier_Lounge7_EventScript_ChooseLeftTutorMove
end
```
### BattleFrontier_Lounge7_EventScript_AlreadyMetLeftTutor
```
msgbox BattleFrontier_Lounge7_Text_LeftTutorWelcomeBack, MSGBOX_DEFAULT
goto BattleFrontier_Lounge7_EventScript_ChooseLeftTutorMove
end
```
### BattleFrontier_Lounge7_EventScript_ChooseLeftTutorMove
```
message BattleFrontier_Lounge7_Text_TeachWhichMove
waitmessage
special ShowBattlePointsWindow
setvar VAR_TEMP_FRONTIER_TUTOR_ID, 0
setvar VAR_0x8004, SCROLL_MULTI_BF_MOVE_TUTOR_1
setvar VAR_0x8006, 0
special ShowScrollableMultichoice
copyvar VAR_TEMP_FRONTIER_TUTOR_SELECTION, VAR_RESULT
switch VAR_RESULT
case 0, BattleFrontier_Lounge7_EventScript_Softboiled
case 1, BattleFrontier_Lounge7_EventScript_SeismicToss
case 2, BattleFrontier_Lounge7_EventScript_DreamEater
case 3, BattleFrontier_Lounge7_EventScript_MegaPunch
case 4, BattleFrontier_Lounge7_EventScript_MegaKick
case 5, BattleFrontier_Lounge7_EventScript_BodySlam
case 6, BattleFrontier_Lounge7_EventScript_RockSlide
case 7, BattleFrontier_Lounge7_EventScript_Counter
case 8, BattleFrontier_Lounge7_EventScript_ThunderWave
case 9, BattleFrontier_Lounge7_EventScript_SwordsDance
case 10, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
case MULTI_B_PRESSED, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
end
```
### BattleFrontier_Lounge7_EventScript_ChooseNewLeftTutorMove
```
message BattleFrontier_Lounge7_Text_TeachWhichMove
waitmessage
setvar VAR_TEMP_FRONTIER_TUTOR_ID, 0
setvar VAR_0x8004, SCROLL_MULTI_BF_MOVE_TUTOR_1
setvar VAR_0x8006, 1
special ShowScrollableMultichoice
copyvar VAR_TEMP_FRONTIER_TUTOR_SELECTION, VAR_RESULT
switch VAR_RESULT
case 0, BattleFrontier_Lounge7_EventScript_Softboiled
case 1, BattleFrontier_Lounge7_EventScript_SeismicToss
case 2, BattleFrontier_Lounge7_EventScript_DreamEater
case 3, BattleFrontier_Lounge7_EventScript_MegaPunch
case 4, BattleFrontier_Lounge7_EventScript_MegaKick
case 5, BattleFrontier_Lounge7_EventScript_BodySlam
case 6, BattleFrontier_Lounge7_EventScript_RockSlide
case 7, BattleFrontier_Lounge7_EventScript_Counter
case 8, BattleFrontier_Lounge7_EventScript_ThunderWave
case 9, BattleFrontier_Lounge7_EventScript_SwordsDance
case 10, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
case MULTI_B_PRESSED, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
end
```
### BattleFrontier_Lounge7_EventScript_Softboiled
```
setvar VAR_0x8008, 16
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_SeismicToss
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_DreamEater
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_MegaPunch
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_MegaKick
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_BodySlam
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_RockSlide
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_Counter
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_ThunderWave
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_SwordsDance
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_RightMoveTutor
```
lock
faceplayer
setvar VAR_TEMP_C, SCROLL_MULTI_BF_MOVE_TUTOR_2
goto_if_set FLAG_MET_FRONTIER_SWIMMER_MOVE_TUTOR, BattleFrontier_Lounge7_EventScript_AlreadyMetRightTutor
msgbox BattleFrontier_Lounge7_Text_RightTutorIntro, MSGBOX_DEFAULT
setflag FLAG_MET_FRONTIER_SWIMMER_MOVE_TUTOR
goto BattleFrontier_Lounge7_EventScript_ChooseRightTutorMove
end
```
### BattleFrontier_Lounge7_EventScript_AlreadyMetRightTutor
```
msgbox BattleFrontier_Lounge7_Text_RightTutorWelcomeBack, MSGBOX_DEFAULT
goto BattleFrontier_Lounge7_EventScript_ChooseRightTutorMove
end
```
### BattleFrontier_Lounge7_EventScript_ChooseRightTutorMove
```
message BattleFrontier_Lounge7_Text_TeachWhichMove
waitmessage
special ShowBattlePointsWindow
setvar VAR_TEMP_FRONTIER_TUTOR_ID, 1
setvar VAR_0x8004, SCROLL_MULTI_BF_MOVE_TUTOR_2
setvar VAR_0x8006, 0
special ShowScrollableMultichoice
copyvar VAR_TEMP_FRONTIER_TUTOR_SELECTION, VAR_RESULT
switch VAR_RESULT
case 0, BattleFrontier_Lounge7_EventScript_DefenseCurl
case 1, BattleFrontier_Lounge7_EventScript_Snore
case 2, BattleFrontier_Lounge7_EventScript_MudSlap
case 3, BattleFrontier_Lounge7_EventScript_Swift
case 4, BattleFrontier_Lounge7_EventScript_IcyWind
case 5, BattleFrontier_Lounge7_EventScript_Endure
case 6, BattleFrontier_Lounge7_EventScript_PsychUp
case 7, BattleFrontier_Lounge7_EventScript_IcePunch
case 8, BattleFrontier_Lounge7_EventScript_ThunderPunch
case 9, BattleFrontier_Lounge7_EventScript_FirePunch
case 10, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
case MULTI_B_PRESSED, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
end
```
### BattleFrontier_Lounge7_EventScript_ChooseNewRightTutorMove
```
message BattleFrontier_Lounge7_Text_TeachWhichMove
waitmessage
setvar VAR_TEMP_FRONTIER_TUTOR_ID, 1
setvar VAR_0x8004, SCROLL_MULTI_BF_MOVE_TUTOR_2
setvar VAR_0x8006, 1
special ShowScrollableMultichoice
copyvar VAR_TEMP_FRONTIER_TUTOR_SELECTION, VAR_RESULT
switch VAR_RESULT
case 0, BattleFrontier_Lounge7_EventScript_DefenseCurl
case 1, BattleFrontier_Lounge7_EventScript_Snore
case 2, BattleFrontier_Lounge7_EventScript_MudSlap
case 3, BattleFrontier_Lounge7_EventScript_Swift
case 4, BattleFrontier_Lounge7_EventScript_IcyWind
case 5, BattleFrontier_Lounge7_EventScript_Endure
case 6, BattleFrontier_Lounge7_EventScript_PsychUp
case 7, BattleFrontier_Lounge7_EventScript_IcePunch
case 8, BattleFrontier_Lounge7_EventScript_ThunderPunch
case 9, BattleFrontier_Lounge7_EventScript_FirePunch
case 10, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
case MULTI_B_PRESSED, BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
end
```
### BattleFrontier_Lounge7_EventScript_DefenseCurl
```
setvar VAR_0x8008, 16
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_Snore
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_MudSlap
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_Swift
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_IcyWind
```
setvar VAR_0x8008, 24
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_Endure
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_PsychUp
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_IcePunch
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_ThunderPunch
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_FirePunch
```
setvar VAR_0x8008, 48
goto BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
end
```
### BattleFrontier_Lounge7_EventScript_ExitTutorMoveSelect
```
special CloseBattleFrontierTutorWindow
special CloseBattlePointsWindow
msgbox BattleFrontier_Lounge7_Text_YouDontWantTo, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge7_EventScript_CancelChooseMon
```
msgbox BattleFrontier_Lounge7_Text_YouDontWantTo, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge7_EventScript_ConfirmMoveSelection
```
copyvar VAR_0x8004, VAR_TEMP_FRONTIER_TUTOR_SELECTION
copyvar VAR_0x8005, VAR_TEMP_FRONTIER_TUTOR_ID
special BufferBattleFrontierTutorMoveName
buffernumberstring STR_VAR_2, VAR_0x8008
copyvar VAR_0x8004, VAR_TEMP_C
msgbox BattleFrontier_Lounge7_Text_MoveWillBeXBattlePoints, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_Lounge7_EventScript_ChooseNewMove
specialvar VAR_TEMP_1, GetFrontierBattlePoints
goto_if_ge VAR_TEMP_1, VAR_0x8008, BattleFrontier_Lounge7_EventScript_TeachTutorMove
msgbox BattleFrontier_Lounge7_Text_HaventGotEnoughPoints, MSGBOX_DEFAULT
goto BattleFrontier_Lounge7_EventScript_ChooseNewMove
end
```
### BattleFrontier_Lounge7_EventScript_TeachTutorMove
```
msgbox BattleFrontier_Lounge7_Text_TeachMoveToWhichMon, MSGBOX_DEFAULT
special GetBattleFrontierTutorMoveIndex
fadescreen FADE_TO_BLACK
special CloseBattlePointsWindow
special CloseBattleFrontierTutorWindow
special ChooseMonForMoveTutor
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_Lounge7_EventScript_CancelChooseMon
msgbox BattleFrontier_Lounge7_Text_IllTakeBattlePoints, MSGBOX_DEFAULT
copyvar VAR_0x8004, VAR_0x8008
special TakeFrontierBattlePoints
release
end
```
### BattleFrontier_Lounge7_EventScript_ChooseNewMove
```
goto_if_eq VAR_TEMP_FRONTIER_TUTOR_ID, 0, BattleFrontier_Lounge7_EventScript_ChooseNewLeftTutorMove
goto BattleFrontier_Lounge7_EventScript_ChooseNewRightTutorMove
end
```
### BattleFrontier_Lounge7_EventScript_Sailor
```
msgbox BattleFrontier_Lounge7_Text_ThinkLadiesDontGetAlong, MSGBOX_NPC
end
```
### BattleFrontier_Lounge7_EventScript_Gentleman
```
msgbox BattleFrontier_Lounge7_Text_LadiesWereStrongAndBeautiful, MSGBOX_NPC
end
```

## Textes (32)
### BattleFrontier_Lounge7_Text_LeftTutorIntro
```
Oh, oh!\pTu auras du mal à le croire, mais dans le\ntemps, j'étais un DRESSEUR hors pair.\pOn disait que j'étais le CANON le\nplus doué du coin!\p… … … … … …\pComment?\nJe sais, c'est dur à croire.\pJe ne suis pas comme cette vantarde en\nface. Moi, j'ai vraiment du talent!\pJe vais te le prouver.\nJe peux enseigner à tes POKéMON des\lcapacités particulières mais mignonnes.\pBien sûr, ce ne sera pas gratuit.\nSi tu payais ces capacités avec des\lPOINTS DE COMBAT?$
```
### BattleFrontier_Lounge7_Text_LeftTutorWelcomeBack
```
Oh, oh!\pTu veux des capacités particulières\nmais mignonnes pour tes POKéMON?$
```
### BattleFrontier_Lounge7_Text_TeachWhichMove
```
Bien!\nQuelle capacité veux-tu?$
```
### BattleFrontier_Lounge7_Text_MoveWillBeXBattlePoints
```
{STR_VAR_1}, n'est-ce pas?\n{STR_VAR_2} POINTS DE COMBAT, d'accord?$
```
### BattleFrontier_Lounge7_Text_TeachMoveToWhichMon
```
Maintenant, choisis le POKéMON à\nqui je dois enseigner cette capacité.$
```
### BattleFrontier_Lounge7_Text_HaventGotEnoughPoints
```
Mais enfin…\nTu n'as pas assez de POINTS DE COMBAT!$
```
### BattleFrontier_Lounge7_Text_IllTakeBattlePoints
```
Je suis douée, non?\nJe prends tes POINTS DE COMBAT, merci!$
```
### BattleFrontier_Lounge7_Text_YouDontWantTo
```
Oh?\nTu as changé d'avis…\pSi tu veux que je te montre à quel point\nje suis douée, reviens me voir!$
```
### BattleFrontier_Lounge7_Text_RightTutorIntro
```
Hi, hi, hi!\pC'est difficile à imaginer, à présent,\nmais j'ai été un DRESSEUR fantastique.\pOn disait que j'étais la plus forte\ndes NAGEUSE, rien que ça!\p… … … … … …\pComment?\nTu ne me crois pas, évidemment.\pJe ne suis pas comme cette menteuse\nen face. J'ai vraiment du talent!\pJe peux te le prouver. Je peux\nenseigner des capacités difficiles\lmais belles à tes POKéMON.\pBien sûr, ce ne sera pas gratuit.\nSi tu payais ces capacités avec des\lPOINTS DE COMBAT?$
```
### BattleFrontier_Lounge7_Text_RightTutorWelcomeBack
```
Hi, hi, hi!\pTu veux que j'enseigne des capacités\ndifficiles mais belles à tes POKéMON?$
```
### BattleFrontier_Lounge7_Text_ThinkLadiesDontGetAlong
```
Ces deux vieilles dames n'arrêtent pas\nde se critiquer, comme si elles se\ldétestaient.\pMais si c'était vrai, elles ne seraient\npas toujours ensemble ici, non?$
```
### BattleFrontier_Lounge7_Text_LadiesWereStrongAndBeautiful
```
Quand j'étais encore un GAMIN, ces deux\nfemmes étaient fortes et magnifiques.\pElles faisaient des ravages parmi\nles DRESSEURS.\pMais malgré leur âge, elles sont\ntoujours très fortes.\pOn peut même dire qu'elles ont fait\nmûrir leurs capacités POKéMON.\pTout de même… Je ne peux pas\nm'empêcher de penser…\pVieillir, c'est bien cruel…$
```
### BattleFrontier_Lounge7_Text_SoftboiledDesc
```
Regagne jusqu'à la\nmoitié des PV max\ndu lanceur.$
```
### BattleFrontier_Lounge7_Text_SeismicTossDesc
```
Inflige des\ndégâts selon le\nniveau du lanceur.$
```
### BattleFrontier_Lounge7_Text_DreamEaterDesc
```
Aspire la moitié\ndes dégâts sur\nl'ennemi endormi.$
```
### BattleFrontier_Lounge7_Text_MegaPunchDesc
```
Un coup de poing\nd'une puissance\nincroyable.$
```
### BattleFrontier_Lounge7_Text_MegaKickDesc
```
Un coup de pied\nsuper puissant et\nintense.$
```
### BattleFrontier_Lounge7_Text_BodySlamDesc
```
Une attaque en\ncharge. Peut pa-\nralyser l'ennemi.$
```
### BattleFrontier_Lounge7_Text_RockSlideDesc
```
Envoie de gros\nrochers. Peut\napeurer l'ennemi.$
```
### BattleFrontier_Lounge7_Text_CounterDesc
```
Renvoie toute\nattaque physique,\n2 fois plus fort.$
```
### BattleFrontier_Lounge7_Text_ThunderWaveDesc
```
Un faible choc\nélectrique qui\nparalyse l'ennemi.$
```
### BattleFrontier_Lounge7_Text_SwordsDanceDesc
```
Une danse de\ncombat pour\nbooster l'ATTAQUE.$
```
### BattleFrontier_Lounge7_Text_DefenseCurlDesc
```
S'enroule, cache\nles faiblesses.\nMonte la DEFENSE.$
```
### BattleFrontier_Lounge7_Text_SnoreDesc
```
Attaque sonore\nqui ne peut être\nlancée qu'endormi.$
```
### BattleFrontier_Lounge7_Text_MudSlapDesc
```
Envoie de la boue\nau visage et rend\nmoins précis.$
```
### BattleFrontier_Lounge7_Text_SwiftDesc
```
Envoie des rayons\nen forme d'étoile.\nTouche toujours.$
```
### BattleFrontier_Lounge7_Text_IcyWindDesc
```
Attaque glaciale.\nBaisse la VITESSE\nde l'ennemi.$
```
### BattleFrontier_Lounge7_Text_EndureDesc
```
Encaisse les\nattaques du tour\net conserve 1 PV.$
```
### BattleFrontier_Lounge7_Text_PsychUpDesc
```
Copie les effets\nde l'ennemi et les\npasse au lanceur.$
```
### BattleFrontier_Lounge7_Text_IcePunchDesc
```
Un poing de glace\npouvant geler\nl'ennemi.$
```
### BattleFrontier_Lounge7_Text_ThunderPunchDesc
```
Un poing électri-\nque pouvant para-\nlyser l'ennemi.$
```
### BattleFrontier_Lounge7_Text_FirePunchDesc
```
Un poing de feu\npouvant brûler\nl'ennemi.$
```

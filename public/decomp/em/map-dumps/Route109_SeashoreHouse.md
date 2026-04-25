# Route109_SeashoreHouse

## Métadonnées
- **id** : `MAP_ROUTE109_SEASHORE_HOUSE`
- **layout** : `LAYOUT_ROUTE109_SEASHORE_HOUSE`
- **music** : `MUS_DEWFORD`
- **region_map_section** : `MAPSEC_ROUTE_109`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 6,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route109_SeashoreHouse_EventScript_Owner` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `Route109_SeashoreHouse_EventScript_Dwayne` | `0` |
| `` | `OBJ_EVENT_GFX_TUBER_M` | 14,9 | `MOVEMENT_TYPE_FACE_LEFT` | `Route109_SeashoreHouse_EventScript_Simon` | `0` |
| `` | `OBJ_EVENT_GFX_BEAUTY` | 10,5 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route109_SeashoreHouse_EventScript_Johanna` | `0` |

## Warps (2)
- #0 (6,9) → `MAP_ROUTE109` warp #0
- #1 (7,9) → `MAP_ROUTE109` warp #0

## Flags référencés (4)
- `FLAG_DEFEATED_SEASHORE_HOUSE`
- `FLAG_LANDMARK_SEASHORE_HOUSE`
- `FLAG_RECEIVED_6_SODA_POP`
- `FLAG_TEMP_2`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_TooBadBagIsFull`

## Scripts (15)
### Route109_SeashoreHouse_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route109_SeashoreHouse_OnTransition
```
### Route109_SeashoreHouse_OnTransition
```
setflag FLAG_LANDMARK_SEASHORE_HOUSE
end
```
### Route109_SeashoreHouse_EventScript_Owner
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_6_SODA_POP, Route109_SeashoreHouse_EventScript_AlreadyReceivedSodaPop
goto_if_set FLAG_DEFEATED_SEASHORE_HOUSE, Route109_SeashoreHouse_EventScript_DefeatedTrainers
goto_if_set FLAG_TEMP_2, Route109_SeashoreHouse_EventScript_AlreadyGaveIntroduction
msgbox Route109_SeashoreHouse_Text_SeashoreHouseIntro, MSGBOX_DEFAULT
setflag FLAG_TEMP_2
release
end
```
### Route109_SeashoreHouse_EventScript_AlreadyGaveIntroduction
```
msgbox Route109_SeashoreHouse_Text_ShowMeSomeHotMatches, MSGBOX_DEFAULT
release
end
```
### Route109_SeashoreHouse_EventScript_DefeatedTrainers
```
msgbox Route109_SeashoreHouse_Text_TakeTheseSodaPopBottles, MSGBOX_DEFAULT
giveitem ITEM_SODA_POP, 6
goto_if_eq VAR_RESULT, FALSE, Route109_SeashoreHouse_EventScript_BagFull
setflag FLAG_RECEIVED_6_SODA_POP
release
end
```
### Route109_SeashoreHouse_EventScript_BagFull
```
msgbox Route109_SeashoreHouse_Text_BagFull, MSGBOX_DEFAULT
release
end
```
### Route109_SeashoreHouse_EventScript_AlreadyReceivedSodaPop
```
showmoneybox 0, 0
msgbox Route109_SeashoreHouse_Text_WantToBuySodaPop, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route109_SeashoreHouse_EventScript_BuySodaPop
msgbox Route109_SeashoreHouse_Text_ThatsTooBad, MSGBOX_DEFAULT
hidemoneybox
release
end
```
### Route109_SeashoreHouse_EventScript_BuySodaPop
```
checkmoney 300
goto_if_eq VAR_RESULT, FALSE, Route109_SeashoreHouse_EventScript_NotEnoughMoney
checkitemspace ITEM_SODA_POP
goto_if_eq VAR_RESULT, FALSE, Route109_SeashoreHouse_EventScript_NotEnoughSpace
msgbox Route109_SeashoreHouse_Text_HereYouGo, MSGBOX_DEFAULT
removemoney 300
updatemoneybox
giveitem ITEM_SODA_POP
hidemoneybox
release
end
```
### Route109_SeashoreHouse_EventScript_NotEnoughMoney
```
msgbox Route109_SeashoreHouse_Text_NotEnoughMoney, MSGBOX_DEFAULT
hidemoneybox
release
end
```
### Route109_SeashoreHouse_EventScript_NotEnoughSpace
```
msgbox gText_TooBadBagIsFull, MSGBOX_DEFAULT
hidemoneybox
release
end
```
### Route109_SeashoreHouse_EventScript_Dwayne
```
trainerbattle_single TRAINER_DWAYNE, Route109_SeashoreHouse_Text_DwayneIntro, Route109_SeashoreHouse_Text_DwayneDefeated, Route109_SeashoreHouse_EventScript_CheckTrainersCompletion
msgbox Route109_SeashoreHouse_Text_DwaynePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route109_SeashoreHouse_EventScript_Johanna
```
trainerbattle_single TRAINER_JOHANNA, Route109_SeashoreHouse_Text_JohannaIntro, Route109_SeashoreHouse_Text_JohannaDefeated, Route109_SeashoreHouse_EventScript_CheckTrainersCompletion
msgbox Route109_SeashoreHouse_Text_JohannaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route109_SeashoreHouse_EventScript_Simon
```
trainerbattle_single TRAINER_SIMON, Route109_SeashoreHouse_Text_SimonIntro, Route109_SeashoreHouse_Text_SimonDefeated, Route109_SeashoreHouse_EventScript_CheckTrainersCompletion
msgbox Route109_SeashoreHouse_Text_SimonPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route109_SeashoreHouse_EventScript_CheckTrainersCompletion
```
goto_if_not_defeated TRAINER_DWAYNE, Route109_SeashoreHouse_EventScript_TrainersNotCompleted
goto_if_not_defeated TRAINER_JOHANNA, Route109_SeashoreHouse_EventScript_TrainersNotCompleted
goto_if_not_defeated TRAINER_SIMON, Route109_SeashoreHouse_EventScript_TrainersNotCompleted
setflag FLAG_DEFEATED_SEASHORE_HOUSE
release
end
```
### Route109_SeashoreHouse_EventScript_TrainersNotCompleted
```
release
end
```

## Textes (17)
### Route109_SeashoreHouse_Text_SeashoreHouseIntro
```
Je suis le propriétaire de la MAISON\nDU BORD DE MER, mais tu peux m'appeler\lM. MER!\pCe que j'aime par-dessus tout, ce sont\nles combats endiablés de POKéMON.\pVoyons si tu as un esprit combatif!\pSi tu peux vaincre tous ces DRESSEURS,\nje t'offrirai une récompense.$
```
### Route109_SeashoreHouse_Text_ShowMeSomeHotMatches
```
Montre-moi de beaux combats!\pAprès tout, c'est pour ça que je dirige\nla MAISON DU BORD DE MER!$
```
### Route109_SeashoreHouse_Text_TakeTheseSodaPopBottles
```
Bravo, ça c'était du combat qui tue!\nCes combats étaient incroyables! J'en\lai eu pour mon argent!\pPour te remercier de m'avoir offert un\ntel spectacle, je vais t'offrir ça.\pUne demi-douzaine de bouteilles de\nSODA COOL!$
```
### Route109_SeashoreHouse_Text_BagFull
```
Oh, mais dis-moi, ton SAC est plein. Je\nvais garder ça pour toi.$
```
### Route109_SeashoreHouse_Text_WantToBuySodaPop
```
Tu veux acheter du SODA COOL?\nLes POKéMON adorent ça!\pC'est 300¥ la bouteille!\nAchètes-en!$
```
### Route109_SeashoreHouse_Text_HereYouGo
```
Voilà!$
```
### Route109_SeashoreHouse_Text_NotEnoughMoney
```
Tu n'as pas assez d'argent.$
```
### Route109_SeashoreHouse_Text_ThatsTooBad
```
Non?\nTant pis.$
```
### Route109_SeashoreHouse_Text_DwayneIntro
```
Si tu cherches un combat en haute mer,\nje suis ton homme. Le meilleur\lde tous, petit matelot!$
```
### Route109_SeashoreHouse_Text_DwayneDefeated
```
C'était un beau combat!\nJ'accepte la défaite, mon pote!$
```
### Route109_SeashoreHouse_Text_DwaynePostBattle
```
Quand je suis à POIVRESSEL,\nje me bats et je bois du SODA COOL!$
```
### Route109_SeashoreHouse_Text_JohannaIntro
```
Moi, je ne perds pas mon temps avec des\ncombats qui n'en valent pas la peine.\pAu moins, les combats endiablés enri-\nchissent les DRESSEURS et les POKéMON!$
```
### Route109_SeashoreHouse_Text_JohannaDefeated
```
J'ai pas eu le temps de m'ennuyer!$
```
### Route109_SeashoreHouse_Text_JohannaPostBattle
```
J'ai soif, maintenant. Je vais aller\nboire un SODA COOL.$
```
### Route109_SeashoreHouse_Text_SimonIntro
```
Je vais te montrer la puissance de mes\nPOKéMON, mais ne viens pas pleurer!$
```
### Route109_SeashoreHouse_Text_SimonDefeated
```
J'ai perdu, mais je ne vais pas pleurer…$
```
### Route109_SeashoreHouse_Text_SimonPostBattle
```
Si un de mes POKéMON pouvait me\ntransporter sur son dos, je ne serais\lpas obligé de garder cette bouée.$
```

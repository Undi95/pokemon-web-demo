# FallarborTown_MoveRelearnersHouse

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN_MOVE_RELEARNERS_HOUSE`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_FALLARBOR`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MOVE_RELEARNER` | `OBJ_EVENT_GFX_FAT_MAN` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_MoveRelearnersHouse_EventScript_MoveRelearner` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_FALLARBOR_TOWN` warp #4
- #1 (4,7) → `MAP_FALLARBOR_TOWN` warp #4

## Flags référencés (1)
- `FLAG_TEMP_1`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_RESULT`

## Scripts (7)
### FallarborTown_MoveRelearnersHouse_EventScript_MoveRelearner
```
lockall
applymovement LOCALID_MOVE_RELEARNER, Common_Movement_FacePlayer
waitmovement 0
goto_if_set FLAG_TEMP_1, FallarborTown_MoveRelearnersHouse_EventScript_AskTeachMove
msgbox FallarborTown_MoveRelearnersHouse_Text_ImTheMoveTutor, MSGBOX_DEFAULT
setflag FLAG_TEMP_1
goto FallarborTown_MoveRelearnersHouse_EventScript_AskTeachMove
end
```
### FallarborTown_MoveRelearnersHouse_EventScript_AskTeachMove
```
checkitem ITEM_HEART_SCALE
goto_if_eq VAR_RESULT, FALSE, FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale
msgbox FallarborTown_MoveRelearnersHouse_Text_ThatsAHeartScaleWantMeToTeachMove, MSGBOX_YESNO
switch VAR_RESULT
case NO, FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale
goto FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon
end
```
### FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon
```
msgbox FallarborTown_MoveRelearnersHouse_Text_TutorWhichMon, MSGBOX_DEFAULT
special ChooseMonForMoveRelearner
goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale
special IsSelectedMonEgg
goto_if_eq VAR_RESULT, TRUE, FallarborTown_MoveRelearnersHouse_EventScript_CantTeachEgg
goto_if_eq VAR_0x8005, 0, FallarborTown_MoveRelearnersHouse_EventScript_NoMoveToTeachMon
goto FallarborTown_MoveRelearnersHouse_EventScript_ChooseMove
end
```
### FallarborTown_MoveRelearnersHouse_EventScript_ChooseMove
```
msgbox FallarborTown_MoveRelearnersHouse_Text_TeachWhichMove, MSGBOX_DEFAULT
special TeachMoveRelearnerMove
goto_if_eq VAR_0x8004, 0, FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon
msgbox FallarborTown_MoveRelearnersHouse_Text_HandedOverHeartScale, MSGBOX_DEFAULT
removeitem ITEM_HEART_SCALE
goto FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale
end
```
### FallarborTown_MoveRelearnersHouse_EventScript_NoMoveToTeachMon
```
msgbox FallarborTown_MoveRelearnersHouse_Text_DontHaveMoveToTeachPokemon, MSGBOX_DEFAULT
goto FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon
end
```
### FallarborTown_MoveRelearnersHouse_EventScript_CantTeachEgg
```
msgbox FallarborTown_MoveRelearnersHouse_Text_CantTeachEgg, MSGBOX_DEFAULT
goto FallarborTown_MoveRelearnersHouse_EventScript_ChooseMon
end
```
### FallarborTown_MoveRelearnersHouse_EventScript_ComeBackWithHeartScale
```
msgbox FallarborTown_MoveRelearnersHouse_Text_ComeBackWithHeartScale, MSGBOX_DEFAULT
releaseall
end
```

## Textes (8)
### FallarborTown_MoveRelearnersHouse_Text_ImTheMoveTutor
```
Je suis le MAITRE DES CAPACITES.\pJe connais absolument toutes les\nattaques que les POKéMON peuvent\lapprendre. Et je peux enseigner ces\lattaques à d'autres POKéMON.\pJe peux enseigner une attaque à l'un de\ntes POKéMON, si tu veux.\pJe peux le faire en échange d'une\nECAILLECOEUR. Je les collectionne.$
```
### FallarborTown_MoveRelearnersHouse_Text_ThatsAHeartScaleWantMeToTeachMove
```
Oh! Génial! C'est une ECAILLECOEUR\nd'une belle taille!\pTu veux que j'enseigne une attaque\nà un de tes POKéMON?$
```
### FallarborTown_MoveRelearnersHouse_Text_TutorWhichMon
```
A quel POKéMON dois-je l'enseigner?$
```
### FallarborTown_MoveRelearnersHouse_Text_TeachWhichMove
```
Quelle attaque dois-je enseigner?$
```
### FallarborTown_MoveRelearnersHouse_Text_DontHaveMoveToTeachPokemon
```
Désolé…\pApparemment, il n'y a aucune attaque\nque je puisse apprendre à ce POKéMON.$
```
### FallarborTown_MoveRelearnersHouse_Text_HandedOverHeartScale
```
{PLAYER} donne une ECAILLECOEUR\nen échange.$
```
### FallarborTown_MoveRelearnersHouse_Text_ComeBackWithHeartScale
```
Si tu veux que j'enseigne une attaque\nà ton POKéMON, reviens avec\lune ECAILLECOEUR.$
```
### FallarborTown_MoveRelearnersHouse_Text_CantTeachEgg
```
Quoi? Mais je ne peux pas apprendre\nune attaque à un OEUF.$
```

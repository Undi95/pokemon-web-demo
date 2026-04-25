# LilycoveCity_MoveDeletersHouse

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_MOVE_DELETERS_HOUSE`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MOVE_DELETER` | `OBJ_EVENT_GFX_EXPERT_M` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_MoveDeletersHouse_EventScript_MoveDeleter` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_LILYCOVE_CITY` warp #7
- #1 (4,7) → `MAP_LILYCOVE_CITY` warp #7

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_RESULT`

## Scripts (7)
### LilycoveCity_MoveDeletersHouse_EventScript_MoveDeleter
```
lockall
applymovement LOCALID_MOVE_DELETER, Common_Movement_FacePlayer
waitmovement 0
msgbox LilycoveCity_MoveDeletersHouse_Text_ICanMakeMonForgetMove, MSGBOX_YESNO
switch VAR_RESULT
case YES, LilycoveCity_MoveDeletersHouse_EventScript_ChooseMonAndMoveToForget
case NO, LilycoveCity_MoveDeletersHouse_EventScript_ComeAgain
releaseall
end
```
### LilycoveCity_MoveDeletersHouse_EventScript_ChooseMonAndMoveToForget
```
msgbox LilycoveCity_MoveDeletersHouse_Text_WhichMonShouldForget, MSGBOX_DEFAULT
special ChoosePartyMon
goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, LilycoveCity_MoveDeletersHouse_EventScript_ComeAgain
special IsSelectedMonEgg
goto_if_eq VAR_RESULT, TRUE, LilycoveCity_MoveDeletersHouse_EventScript_EggCantForgetMoves
special GetNumMovesSelectedMonHas
goto_if_eq VAR_RESULT, 1, LilycoveCity_MoveDeletersHouse_EventScript_MonOnlyKnowsOneMove
msgbox LilycoveCity_MoveDeletersHouse_Text_WhichMoveShouldBeForgotten, MSGBOX_DEFAULT
fadescreen FADE_TO_BLACK
special MoveDeleterChooseMoveToForget
fadescreen FADE_FROM_BLACK
goto_if_eq VAR_0x8005, MAX_MON_MOVES, LilycoveCity_MoveDeletersHouse_EventScript_ChooseMonAndMoveToForget
special BufferMoveDeleterNicknameAndMove
msgbox LilycoveCity_MoveDeletersHouse_Text_MonsMoveShouldBeForgotten, MSGBOX_YESNO
switch VAR_RESULT
case YES, LilycoveCity_MoveDeletersHouse_EventScript_TryForgetMove
case NO, LilycoveCity_MoveDeletersHouse_EventScript_ComeAgain
releaseall
end
```
### LilycoveCity_MoveDeletersHouse_EventScript_TryForgetMove
```
special IsLastMonThatKnowsSurf
goto_if_eq VAR_RESULT, TRUE, LilycoveCity_MoveDeletersHouse_EventScript_LastMonWithSurf
special MoveDeleterForgetMove
playfanfare MUS_MOVE_DELETED
waitfanfare
msgbox LilycoveCity_MoveDeletersHouse_Text_MonHasForgottenMove, MSGBOX_DEFAULT
releaseall
end
```
### LilycoveCity_MoveDeletersHouse_EventScript_MonOnlyKnowsOneMove
```
special BufferMoveDeleterNicknameAndMove
msgbox LilycoveCity_MoveDeletersHouse_Text_MonOnlyKnowsOneMove, MSGBOX_DEFAULT
releaseall
end
```
### LilycoveCity_MoveDeletersHouse_EventScript_EggCantForgetMoves
```
msgbox LilycoveCity_MoveDeletersHouse_Text_EggCantForgetMoves, MSGBOX_DEFAULT
releaseall
end
```
### LilycoveCity_MoveDeletersHouse_EventScript_ComeAgain
```
msgbox LilycoveCity_MoveDeletersHouse_Text_ComeAgain, MSGBOX_DEFAULT
releaseall
end
```
### LilycoveCity_MoveDeletersHouse_EventScript_LastMonWithSurf
```
special BufferMoveDeleterNicknameAndMove
msgbox LilycoveCity_MoveDeletersHouse_Text_CantForgetSurf, MSGBOX_DEFAULT
releaseall
end
```

## Textes (9)
### LilycoveCity_MoveDeletersHouse_Text_ICanMakeMonForgetMove
```
Hum… Ah, oui,\nje suis l'EFFACEUR DE CAPACITES.\pJe fais oublier leurs capacités\naux POKéMON.\pTu veux que je le fasse?$
```
### LilycoveCity_MoveDeletersHouse_Text_WhichMonShouldForget
```
Quel POKéMON doit oublier une capacité?$
```
### LilycoveCity_MoveDeletersHouse_Text_WhichMoveShouldBeForgotten
```
Quelle capacité doit être oubliée?$
```
### LilycoveCity_MoveDeletersHouse_Text_MonOnlyKnowsOneMove
```
Apparemment, {STR_VAR_1} ne connaît\nqu'une seule capacité…$
```
### LilycoveCity_MoveDeletersHouse_Text_MonsMoveShouldBeForgotten
```
Hum! {STR_VAR_2} de {STR_VAR_1}?\nCette capacité doit être oubliée?$
```
### LilycoveCity_MoveDeletersHouse_Text_MonHasForgottenMove
```
Ça a marché à la perfection!\p{STR_VAR_1} a complètement oublié\n{STR_VAR_2}.$
```
### LilycoveCity_MoveDeletersHouse_Text_ComeAgain
```
Reviens me voir si tu veux que tes\nPOKéMON oublient des capacités.$
```
### LilycoveCity_MoveDeletersHouse_Text_EggCantForgetMoves
```
Quoi? Les OEUFS ne connaissent\naucune capacité?!$
```
### LilycoveCity_MoveDeletersHouse_Text_CantForgetSurf
```
Hum…\pOn dirait que ton {STR_VAR_1} ne veut\npas oublier SURF.$
```

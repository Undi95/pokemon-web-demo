# FortreeCity_House2

## Métadonnées
- **id** : `MAP_FORTREE_CITY_HOUSE2`
- **layout** : `LAYOUT_FORTREE_CITY_HOUSE2`
- **music** : `MUS_FORTREE`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 2,3 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `FortreeCity_House2_EventScript_HiddenPowerGiver` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 6,3 | `MOVEMENT_TYPE_FACE_LEFT` | `FortreeCity_House2_EventScript_SleepTalkTutor` | `0` |

## Warps (2)
- #0 (3,5) → `MAP_FORTREE_CITY` warp #4
- #1 (4,5) → `MAP_FORTREE_CITY` warp #4

## Flags référencés (2)
- `FLAG_MET_HIDDEN_POWER_GIVER`
- `FLAG_RECEIVED_TM_HIDDEN_POWER`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (4)
### FortreeCity_House2_EventScript_HiddenPowerGiver
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_HIDDEN_POWER, FortreeCity_House2_EventScript_ExplainHiddenPower
call_if_unset FLAG_MET_HIDDEN_POWER_GIVER, FortreeCity_House2_EventScript_Greeting
msgbox FortreeCity_House2_Text_CoinInWhichHand, MSGBOX_DEFAULT
multichoice 21, 8, MULTI_RIGHTLEFT, TRUE
switch VAR_RESULT
case 1, FortreeCity_House2_EventScript_WrongGuess
msgbox FortreeCity_House2_Text_CorrectTryAgainWhichHand, MSGBOX_DEFAULT
multichoice 21, 8, MULTI_RIGHTLEFT, TRUE
switch VAR_RESULT
case 1, FortreeCity_House2_EventScript_WrongGuess
msgbox FortreeCity_House2_Text_CorrectTryAgainWhichHand2, MSGBOX_DEFAULT
multichoice 21, 8, MULTI_RIGHTLEFT, TRUE
switch VAR_RESULT
case 0, FortreeCity_House2_EventScript_WrongGuess
msgbox FortreeCity_House2_Text_YourHiddenPowerHasAwoken, MSGBOX_DEFAULT
giveitem ITEM_TM_HIDDEN_POWER
goto_if_eq VAR_RESULT, 0, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_HIDDEN_POWER
msgbox FortreeCity_House2_Text_ExplainHiddenPower, MSGBOX_DEFAULT
release
end
```
### FortreeCity_House2_EventScript_Greeting
```
msgbox FortreeCity_House2_Text_HiddenPowersArousedByNature, MSGBOX_DEFAULT
setflag FLAG_MET_HIDDEN_POWER_GIVER
return
```
### FortreeCity_House2_EventScript_ExplainHiddenPower
```
msgbox FortreeCity_House2_Text_ExplainHiddenPower, MSGBOX_DEFAULT
release
end
```
### FortreeCity_House2_EventScript_WrongGuess
```
msgbox FortreeCity_House2_Text_YouGuessedWrong, MSGBOX_DEFAULT
release
end
```

## Textes (7)
### FortreeCity_House2_Text_HiddenPowersArousedByNature
```
Les humains… Les POKéMON…\pLeurs pouvoirs cachés se développent\nlorsqu'ils vivent en milieu naturel…$
```
### FortreeCity_House2_Text_CoinInWhichHand
```
Laisse la vieille dame que je suis voir si\nton pouvoir caché s'est éveillé…\pJ'ai une pièce dans une main.\pDans quelle main l'ai-je cachée?\nLa droite ou la gauche?$
```
### FortreeCity_House2_Text_CorrectTryAgainWhichHand
```
Oh! Oui, c'est juste!\pOn va réessayer.\pDans quelle main est la pièce?\nLa droite ou la gauche?$
```
### FortreeCity_House2_Text_CorrectTryAgainWhichHand2
```
Oh! Oui, c'est juste!\pOn va réessayer.\pDans quelle main est la pièce?\nLa droite ou la gauche?$
```
### FortreeCity_House2_Text_YourHiddenPowerHasAwoken
```
Oh! Superbe!\nTon pouvoir caché s'est réveillé!\pTiens, prends ça et révèle le pouvoir\ncaché de tes POKéMON.$
```
### FortreeCity_House2_Text_ExplainHiddenPower
```
PUISSANCE CACHEE est une capacité\nqui diffère selon les POKéMON.$
```
### FortreeCity_House2_Text_YouGuessedWrong
```
Non, dommage.\nTu n'as pas fait le bon choix.$
```

# FortreeCity_House4

## Métadonnées
- **id** : `MAP_FORTREE_CITY_HOUSE4`
- **layout** : `LAYOUT_FORTREE_CITY_HOUSE2`
- **music** : `MUS_FORTREE`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 6,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `FortreeCity_House4_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 1,3 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_House4_EventScript_Boy` | `0` |
| `LOCALID_FORTREE_HOUSE_WINGULL` | `OBJ_EVENT_GFX_WINGULL` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_House4_EventScript_Wingull` | `FLAG_HIDE_FORTREE_CITY_HOUSE_4_WINGULL` |

## Warps (2)
- #0 (3,5) → `MAP_FORTREE_CITY` warp #6
- #1 (4,5) → `MAP_FORTREE_CITY` warp #6

## Flags référencés (4)
- `FLAG_HIDE_MOSSDEEP_CITY_HOUSE_2_WINGULL`
- `FLAG_RECEIVED_MENTAL_HERB`
- `FLAG_WINGULL_DELIVERED_MAIL`
- `FLAG_WINGULL_SENT_ON_ERRAND`

## Variables référencées (2)
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Scripts (7)
### FortreeCity_House4_EventScript_Woman
```
msgbox FortreeCity_House4_Text_BringsWorldCloserTogether, MSGBOX_NPC
end
```
### FortreeCity_House4_EventScript_Boy
```
lockall
goto_if_set FLAG_RECEIVED_MENTAL_HERB, FortreeCity_House4_EventScript_ReceivedMentalHerb
goto_if_set FLAG_WINGULL_DELIVERED_MAIL, FortreeCity_House4_EventScript_WingullReturned
goto_if_set FLAG_WINGULL_SENT_ON_ERRAND, FortreeCity_House4_EventScript_WingullOnErrand
msgbox FortreeCity_House4_Text_GoBirdPokemon, MSGBOX_DEFAULT
closemessage
setflag FLAG_WINGULL_SENT_ON_ERRAND
clearflag FLAG_HIDE_MOSSDEEP_CITY_HOUSE_2_WINGULL
applymovement LOCALID_FORTREE_HOUSE_WINGULL, FortreeCity_House4_Movement_WingullExit
waitmovement 0
removeobject LOCALID_FORTREE_HOUSE_WINGULL
releaseall
end
```
### FortreeCity_House4_EventScript_WingullOnErrand
```
applymovement VAR_LAST_TALKED, Common_Movement_FacePlayer
waitmovement 0
msgbox FortreeCity_House4_Text_AskedWingullToRunErrand, MSGBOX_DEFAULT
releaseall
end
```
### FortreeCity_House4_EventScript_WingullReturned
```
applymovement VAR_LAST_TALKED, Common_Movement_FacePlayer
waitmovement 0
msgbox FortreeCity_House4_Text_WelcomeWingullTakeMentalHerb, MSGBOX_DEFAULT
giveitem ITEM_MENTAL_HERB
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_MENTAL_HERB
releaseall
end
```
### FortreeCity_House4_EventScript_ReceivedMentalHerb
```
applymovement VAR_LAST_TALKED, Common_Movement_FacePlayer
waitmovement 0
msgbox FortreeCity_House4_Text_FriendsFarAwayThanksToWingull, MSGBOX_DEFAULT
releaseall
end
```
### FortreeCity_House4_Movement_WingullExit
```
walk_fast_down
walk_fast_down
walk_fast_right
walk_in_place_faster_down
delay_8
step_end
```
### FortreeCity_House4_EventScript_Wingull
```
lock
faceplayer
waitse
playmoncry SPECIES_WINGULL, CRY_MODE_NORMAL
msgbox FortreeCity_House4_Text_Wingull, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (6)
### FortreeCity_House4_Text_BringsWorldCloserTogether
```
En vivant avec les POKéMON, les\nhumains se font de plus en plus d'amis.\pEt ça unit le monde!\nJe trouve ça merveilleux.$
```
### FortreeCity_House4_Text_GoBirdPokemon
```
Là-bas!\nVas-y, POKéMON OISEAU!$
```
### FortreeCity_House4_Text_AskedWingullToRunErrand
```
Hé, j'ai chargé GOELISE de faire\nune course pour moi.$
```
### FortreeCity_House4_Text_WelcomeWingullTakeMentalHerb
```
Bien!\nHeureux de te revoir, GOELISE!\pHum? Qu'est-ce que c'est?\nQu'est-ce qu'il rapporte là?\pUne HERBE MENTAL?\nIl a dû ramasser ça quelque part.\pMais je ne suis pas DRESSEUR,\nalors tu peux la garder.$
```
### FortreeCity_House4_Text_FriendsFarAwayThanksToWingull
```
Grâce à GOELISE, je peux avoir\ndes amis qui vivent loin d'ici.$
```
### FortreeCity_House4_Text_Wingull
```
GOELISE: Goéééliiise!$
```

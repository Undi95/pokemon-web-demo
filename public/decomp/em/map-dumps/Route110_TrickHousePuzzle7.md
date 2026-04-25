# Route110_TrickHousePuzzle7

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_PUZZLE7`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 9,20 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHousePuzzle7_EventScript_Joshua` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 10,2 | `MOVEMENT_TYPE_FACE_UP` | `Route110_TrickHousePuzzle7_EventScript_Alexis` | `0` |
| `` | `OBJ_EVENT_GFX_HEX_MANIAC` | 8,17 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle7_EventScript_Patricia` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 5,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle7_EventScript_ItemTropicMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_7_TROPIC_MAIL` |
| `` | `OBJ_EVENT_GFX_PSYCHIC_M` | 9,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_TrickHousePuzzle7_EventScript_Alvaro` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 8,13 | `MOVEMENT_TYPE_FACE_UP` | `Route110_TrickHousePuzzle7_EventScript_Mariela` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 9,12 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle7_EventScript_Everett` | `0` |
| `` | `OBJ_EVENT_GFX_TRICK_HOUSE_STATUE` | 4,17 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_TRICK_HOUSE_STATUE` | 4,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `0` |

## Warps (13)
- #0 (0,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #1 (1,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #2 (13,1) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #0
- #3 (13,4) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #4
- #4 (7,3) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #3
- #5 (13,11) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #6
- #6 (4,3) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #5
- #7 (1,17) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #8
- #8 (0,11) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #7
- #9 (2,3) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #10
- #10 (4,13) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #9
- #11 (1,3) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #12
- #12 (8,12) → `MAP_ROUTE110_TRICK_HOUSE_PUZZLE7` warp #11

## Coord events / triggers (4)
- (8,19) → `Route110_TrickHousePuzzle7_EventScript_YellowButton` (si `VAR_TEMP_1` == `0`)
- (0,14) → `Route110_TrickHousePuzzle7_EventScript_BlueButton` (si `VAR_TEMP_1` == `0`)
- (6,6) → `Route110_TrickHousePuzzle7_EventScript_GreenButton` (si `VAR_TEMP_1` == `0`)
- (9,7) → `Route110_TrickHousePuzzle7_EventScript_PurpleButton` (si `VAR_TEMP_1` == `0`)

## BG events / signs (1)
- (6,17) [sign] → `Route110_TrickHousePuzzle7_EventScript_Scroll`

## Flags référencés (5)
- `FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1`
- `FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2`
- `FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3`
- `FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4`
- `FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5`

## Variables référencées (2)
- `VAR_TRICK_HOUSE_PUZZLE_7_STATE`
- `VAR_TRICK_HOUSE_PUZZLE_7_STATE_2`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_TrickHousePuzzle_EventScript_FoundScroll`
- `Route110_TrickHousePuzzle_EventScript_ReadScrollAgain`

## Scripts (47)
### Route110_TrickHousePuzzle7_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route110_TrickHousePuzzle7_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route110_TrickHousePuzzle7_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route110_TrickHousePuzzle7_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route110_TrickHousePuzzle7_OnFrame
```
### Route110_TrickHousePuzzle7_OnResume
```
call Route110_TrickHousePuzzle7_EventScript_UpdateSwitchMetatiles
end
```
### Route110_TrickHousePuzzle7_EventScript_UpdateSwitchMetatiles
```
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1, Route110_TrickHousePuzzle7_EventScript_SetSwitch1MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2, Route110_TrickHousePuzzle7_EventScript_SetSwitch2MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3, Route110_TrickHousePuzzle7_EventScript_SetSwitch3MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4, Route110_TrickHousePuzzle7_EventScript_SetSwitch4MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5, Route110_TrickHousePuzzle7_EventScript_SetSwitch5MetatilesOn
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch1MetatilesOn
```
setmetatile 13, 17, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Up, FALSE
setmetatile 12, 16, METATILE_TrickHousePuzzle_Lever_On, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch2MetatilesOn
```
setmetatile 12, 13, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Up, FALSE
setmetatile 12, 11, METATILE_TrickHousePuzzle_Lever_On, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch3MetatilesOn
```
setmetatile 7, 12, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Up, FALSE
setmetatile 5, 10, METATILE_TrickHousePuzzle_Lever_On, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch4MetatilesOn
```
setmetatile 6, 6, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Right_Alt, FALSE
setmetatile 4, 4, METATILE_TrickHousePuzzle_Lever_On, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch5MetatilesOn
```
setmetatile 8, 4, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Left, FALSE
setmetatile 7, 5, METATILE_TrickHousePuzzle_Lever_On, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch1MetatilesOff
```
setmetatile 13, 17, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Down, FALSE
setmetatile 12, 16, METATILE_TrickHousePuzzle_Lever_Off, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch2MetatilesOff
```
setmetatile 12, 13, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Left, FALSE
setmetatile 12, 11, METATILE_TrickHousePuzzle_Lever_Off, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch3MetatilesOff
```
setmetatile 7, 12, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Down, FALSE
setmetatile 5, 10, METATILE_TrickHousePuzzle_Lever_Off, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch4MetatilesOff
```
setmetatile 6, 6, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Left_Alt, FALSE
setmetatile 4, 4, METATILE_TrickHousePuzzle_Lever_Off, TRUE
return
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch5MetatilesOff
```
setmetatile 8, 4, METATILE_TrickHousePuzzle_Arrow_RedOnBlack_Right, FALSE
setmetatile 7, 5, METATILE_TrickHousePuzzle_Lever_Off, TRUE
return
```
### Route110_TrickHousePuzzle7_OnTransition
```
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_7_STATE_2, 1, Route110_TrickHousePuzzle7_EventScript_TeleportedTransition
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5
end
```
### Route110_TrickHousePuzzle7_EventScript_TeleportedTransition
```
end
```
### Route110_TrickHousePuzzle7_OnLoad
```
call_if_eq VAR_TRICK_HOUSE_PUZZLE_7_STATE_2, 1, Route110_TrickHousePuzzle7_EventScript_UpdateSwitchMetatiles
end
```
### Route110_TrickHousePuzzle7_OnFrame
```
map_script_2 VAR_TRICK_HOUSE_PUZZLE_7_STATE_2, 1, Route110_TrickHousePuzzle7_EventScript_ClearState2
```
### Route110_TrickHousePuzzle7_EventScript_ClearState2
```
setvar VAR_TRICK_HOUSE_PUZZLE_7_STATE_2, 0
end
```
### Route110_TrickHousePuzzle7_EventScript_Scroll
```
lockall
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_7_STATE, 0, Route110_TrickHousePuzzle7_EventScript_FoundScroll
goto Route110_TrickHousePuzzle_EventScript_ReadScrollAgain
end
```
### Route110_TrickHousePuzzle7_EventScript_FoundScroll
```
setvar VAR_TRICK_HOUSE_PUZZLE_7_STATE, 1
goto Route110_TrickHousePuzzle_EventScript_FoundScroll
end
```
### Route110_TrickHousePuzzle7_EventScript_TeleportPad
```
lockall
setvar VAR_TRICK_HOUSE_PUZZLE_7_STATE_2, 1
warpteleport MAP_ROUTE110_TRICK_HOUSE_PUZZLE7, 3, 19
waitstate
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_Switch1
```
lockall
delay 32
call_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1, Route110_TrickHousePuzzle7_EventScript_SetSwitch1MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1, Route110_TrickHousePuzzle7_EventScript_SetSwitch1MetatilesOff
special DrawWholeMapView
playse SE_CLICK
goto_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1, Route110_TrickHousePuzzle7_EventScript_SetSwitch1On
goto_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1, Route110_TrickHousePuzzle7_EventScript_SetSwitch1Off
end
```
### Route110_TrickHousePuzzle7_EventScript_Switch2
```
lockall
delay 32
call_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2, Route110_TrickHousePuzzle7_EventScript_SetSwitch2MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2, Route110_TrickHousePuzzle7_EventScript_SetSwitch2MetatilesOff
special DrawWholeMapView
playse SE_CLICK
goto_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2, Route110_TrickHousePuzzle7_EventScript_SetSwitch2On
goto_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2, Route110_TrickHousePuzzle7_EventScript_SetSwitch2Off
end
```
### Route110_TrickHousePuzzle7_EventScript_Switch3
```
lockall
delay 32
call_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3, Route110_TrickHousePuzzle7_EventScript_SetSwitch3MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3, Route110_TrickHousePuzzle7_EventScript_SetSwitch3MetatilesOff
special DrawWholeMapView
playse SE_CLICK
goto_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3, Route110_TrickHousePuzzle7_EventScript_SetSwitch3On
goto_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3, Route110_TrickHousePuzzle7_EventScript_SetSwitch3Off
end
```
### Route110_TrickHousePuzzle7_EventScript_Switch4
```
lockall
delay 32
call_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4, Route110_TrickHousePuzzle7_EventScript_SetSwitch4MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4, Route110_TrickHousePuzzle7_EventScript_SetSwitch4MetatilesOff
special DrawWholeMapView
playse SE_CLICK
goto_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4, Route110_TrickHousePuzzle7_EventScript_SetSwitch4On
goto_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4, Route110_TrickHousePuzzle7_EventScript_SetSwitch4Off
end
```
### Route110_TrickHousePuzzle7_EventScript_Switch5
```
lockall
delay 32
call_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5, Route110_TrickHousePuzzle7_EventScript_SetSwitch5MetatilesOn
call_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5, Route110_TrickHousePuzzle7_EventScript_SetSwitch5MetatilesOff
special DrawWholeMapView
playse SE_CLICK
goto_if_unset FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5, Route110_TrickHousePuzzle7_EventScript_SetSwitch5On
goto_if_set FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5, Route110_TrickHousePuzzle7_EventScript_SetSwitch5Off
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch1On
```
setflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch1Off
```
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_1
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch2On
```
setflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch2Off
```
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_2
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch3On
```
setflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch3Off
```
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_3
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch4On
```
setflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch4Off
```
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_4
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch5On
```
setflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_SetSwitch5Off
```
clearflag FLAG_TRICK_HOUSE_PUZZLE_7_SWITCH_5
releaseall
end
```
### Route110_TrickHousePuzzle7_EventScript_YellowButton
```
playse SE_SWITCH
waitse
playse SE_REPEL
initrotatingtilepuzzle TRUE
moverotatingtileobjects 0
waitmovement 0
turnrotatingtileobjects
waitmovement 0
freerotatingtilepuzzle
end
```
### Route110_TrickHousePuzzle7_EventScript_BlueButton
```
playse SE_SWITCH
waitse
playse SE_REPEL
initrotatingtilepuzzle TRUE
moverotatingtileobjects 1
waitmovement 0
turnrotatingtileobjects
waitmovement 0
freerotatingtilepuzzle
end
```
### Route110_TrickHousePuzzle7_EventScript_GreenButton
```
playse SE_SWITCH
waitse
playse SE_REPEL
initrotatingtilepuzzle TRUE
moverotatingtileobjects 2
waitmovement 0
turnrotatingtileobjects
waitmovement 0
freerotatingtilepuzzle
end
```
### Route110_TrickHousePuzzle7_EventScript_PurpleButton
```
playse SE_SWITCH
waitse
playse SE_REPEL
initrotatingtilepuzzle TRUE
moverotatingtileobjects 3
waitmovement 0
turnrotatingtileobjects
waitmovement 0
freerotatingtilepuzzle
end
```
### Route110_TrickHousePuzzle7_EventScript_RedButton
```
playse SE_SWITCH
waitse
playse SE_REPEL
initrotatingtilepuzzle TRUE
moverotatingtileobjects 4
waitmovement 0
turnrotatingtileobjects
waitmovement 0
freerotatingtilepuzzle
end
```
### Route110_TrickHousePuzzle7_EventScript_Joshua
```
trainerbattle_single TRAINER_JOSHUA, Route110_TrickHousePuzzle7_Text_JoshuaIntro, Route110_TrickHousePuzzle7_Text_JoshuaDefeat
msgbox Route110_TrickHousePuzzle7_Text_JoshuaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle7_EventScript_Patricia
```
trainerbattle_single TRAINER_PATRICIA, Route110_TrickHousePuzzle7_Text_PatriciaIntro, Route110_TrickHousePuzzle7_Text_PatriciaDefeat
msgbox Route110_TrickHousePuzzle7_Text_PatriciaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle7_EventScript_Alexis
```
trainerbattle_single TRAINER_ALEXIS, Route110_TrickHousePuzzle7_Text_AlexisIntro, Route110_TrickHousePuzzle7_Text_AlexisDefeat
msgbox Route110_TrickHousePuzzle7_Text_AlexisPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle7_EventScript_Mariela
```
trainerbattle_single TRAINER_MARIELA, Route110_TrickHousePuzzle7_Text_MarielaIntro, Route110_TrickHousePuzzle7_Text_MarielaDefeat
msgbox Route110_TrickHousePuzzle7_Text_MarielaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle7_EventScript_Alvaro
```
trainerbattle_single TRAINER_ALVARO, Route110_TrickHousePuzzle7_Text_AlvaroIntro, Route110_TrickHousePuzzle7_Text_AlvaroDefeat
msgbox Route110_TrickHousePuzzle7_Text_AlvaroPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle7_EventScript_Everett
```
trainerbattle_single TRAINER_EVERETT, Route110_TrickHousePuzzle7_Text_EverettIntro, Route110_TrickHousePuzzle7_Text_EverettDefeat
msgbox Route110_TrickHousePuzzle7_Text_EverettPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (19)
### Route110_TrickHousePuzzle7_Text_WroteSecretCodeLockOpened
```
{PLAYER} écrit le code secret\nsur la porte.\p“Le MAITRE DES PIEGES est trognon!”\n… … … … … … … …\pLa porte s'ouvre!$
```
### Route110_TrickHousePuzzle7_Text_JoshuaIntro
```
Le MAITRE DES PIEGES disparaît dans\nun nuage de fumée. Comment fait-il?$
```
### Route110_TrickHousePuzzle7_Text_JoshuaDefeat
```
Aïeuuuuh! Tu es drôlement balèze!\nComment fais-tu?$
```
### Route110_TrickHousePuzzle7_Text_JoshuaPostBattle
```
Moi aussi, j'aimerais pouvoir\ndisparaître dans un nuage de fumée.$
```
### Route110_TrickHousePuzzle7_Text_PatriciaIntro
```
Tourner en rond sans arrêt…\nÇa porte malheur…$
```
### Route110_TrickHousePuzzle7_Text_PatriciaDefeat
```
Une défaite!\nC'est un mauvais présage…$
```
### Route110_TrickHousePuzzle7_Text_PatriciaPostBattle
```
Ça fait dix fois que je reviens au même\nendroit. Ça va me porter malheur.$
```
### Route110_TrickHousePuzzle7_Text_AlexisIntro
```
Le gagnant passera la porte le premier.\nVoilà ce que j'en dis.$
```
### Route110_TrickHousePuzzle7_Text_AlexisDefeat
```
Oh!\nBon, allez, après toi!$
```
### Route110_TrickHousePuzzle7_Text_AlexisPostBattle
```
Je pense que tu finiras par résoudre\ntoutes les énigmes de la\lMAISON DES PIEGES.$
```
### Route110_TrickHousePuzzle7_Text_MarielaIntro
```
Tiens, te voilà enfin, toi!\nIl n'y a plus de temps à perdre!$
```
### Route110_TrickHousePuzzle7_Text_MarielaDefeat
```
Un petit sourire, tu as gagné!$
```
### Route110_TrickHousePuzzle7_Text_MarielaPostBattle
```
Je ne suis pas en colère.\nJe ne suis pas comme ça, moi!$
```
### Route110_TrickHousePuzzle7_Text_AlvaroIntro
```
Je dois dire que je te voyais venir!$
```
### Route110_TrickHousePuzzle7_Text_AlvaroDefeat
```
Par contre, ça, je ne l'ai pas vu venir…$
```
### Route110_TrickHousePuzzle7_Text_AlvaroPostBattle
```
Oui, enfin ce n'est pas le meilleur\nendroit pour faire connaissance.\pOn ne doit pas être très nets, tous\nles deux!$
```
### Route110_TrickHousePuzzle7_Text_EverettIntro
```
On est un peu à l'étroit ici…$
```
### Route110_TrickHousePuzzle7_Text_EverettDefeat
```
Quelle force! Je m'incline.$
```
### Route110_TrickHousePuzzle7_Text_EverettPostBattle
```
Ce que j'aimerais être toi…$
```

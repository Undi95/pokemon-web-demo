# Route110_TrickHousePuzzle2

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_PUZZLE2`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_PUZZLE2`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 13,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHousePuzzle2_EventScript_Ted` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 10,17 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_TrickHousePuzzle2_EventScript_Paul` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 11,9 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle2_EventScript_Georgia` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 8,17 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle2_EventScript_ItemWaveMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_2_WAVE_MAIL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,13 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle2_EventScript_ItemHarborMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_2_HARBOR_MAIL` |

## Warps (3)
- #0 (0,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #1 (1,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #2 (13,1) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #0

## Coord events / triggers (4)
- (11,12) → `Route110_TrickHousePuzzle2_EventScript_Button1` (si `VAR_TEMP_1` == `0`)
- (0,4) → `Route110_TrickHousePuzzle2_EventScript_Button2` (si `VAR_TEMP_2` == `0`)
- (14,5) → `Route110_TrickHousePuzzle2_EventScript_Button3` (si `VAR_TEMP_3` == `0`)
- (7,11) → `Route110_TrickHousePuzzle2_EventScript_Button4` (si `VAR_TEMP_4` == `0`)

## BG events / signs (1)
- (14,14) [sign] → `Route110_TrickHousePuzzle2_EventScript_Scroll`

## Variables référencées (5)
- `VAR_TEMP_1`
- `VAR_TEMP_2`
- `VAR_TEMP_3`
- `VAR_TEMP_4`
- `VAR_TRICK_HOUSE_PUZZLE_2_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_TrickHousePuzzle_EventScript_FoundScroll`
- `Route110_TrickHousePuzzle_EventScript_ReadScrollAgain`

## Scripts (16)
### Route110_TrickHousePuzzle2_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Route110_TrickHousePuzzle2_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, Route110_TrickHousePuzzle2_OnTransition
```
### Route110_TrickHousePuzzle2_OnResume
```
call_if_eq VAR_TEMP_1, 1, Route110_TrickHousePuzzle2_EventScript_PressButton1
call_if_eq VAR_TEMP_2, 1, Route110_TrickHousePuzzle2_EventScript_PressButton2
call_if_eq VAR_TEMP_3, 1, Route110_TrickHousePuzzle2_EventScript_PressButton3
call_if_eq VAR_TEMP_4, 1, Route110_TrickHousePuzzle2_EventScript_PressButton4
end
```
### Route110_TrickHousePuzzle2_OnTransition
```
setvar VAR_TEMP_1, 0
setvar VAR_TEMP_2, 0
setvar VAR_TEMP_3, 0
setvar VAR_TEMP_4, 0
end
```
### Route110_TrickHousePuzzle2_EventScript_Scroll
```
lockall
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_2_STATE, 0, Route110_TrickHousePuzzle2_EventScript_FoundScroll
goto Route110_TrickHousePuzzle_EventScript_ReadScrollAgain
end
```
### Route110_TrickHousePuzzle2_EventScript_FoundScroll
```
setvar VAR_TRICK_HOUSE_PUZZLE_2_STATE, 1
goto Route110_TrickHousePuzzle_EventScript_FoundScroll
end
```
### Route110_TrickHousePuzzle2_EventScript_Button1
```
lockall
setvar VAR_TEMP_1, 1
playse SE_PIN
call Route110_TrickHousePuzzle2_EventScript_PressButton1
special DrawWholeMapView
releaseall
end
```
### Route110_TrickHousePuzzle2_EventScript_Button2
```
lockall
setvar VAR_TEMP_2, 1
playse SE_PIN
call Route110_TrickHousePuzzle2_EventScript_PressButton2
special DrawWholeMapView
releaseall
end
```
### Route110_TrickHousePuzzle2_EventScript_Button3
```
lockall
setvar VAR_TEMP_3, 1
playse SE_PIN
call Route110_TrickHousePuzzle2_EventScript_PressButton3
special DrawWholeMapView
releaseall
end
```
### Route110_TrickHousePuzzle2_EventScript_Button4
```
lockall
setvar VAR_TEMP_4, 1
playse SE_PIN
call Route110_TrickHousePuzzle2_EventScript_PressButton4
special DrawWholeMapView
releaseall
end
```
### Route110_TrickHousePuzzle2_EventScript_PressButton1
```
setmetatile 11, 12, METATILE_TrickHousePuzzle_Button_Pressed, FALSE
setmetatile 1, 13, METATILE_TrickHousePuzzle_Door_Shuttered, FALSE
return
```
### Route110_TrickHousePuzzle2_EventScript_PressButton2
```
setmetatile 0, 4, METATILE_TrickHousePuzzle_Button_Pressed, FALSE
setmetatile 5, 6, METATILE_TrickHousePuzzle_Door_Shuttered, FALSE
return
```
### Route110_TrickHousePuzzle2_EventScript_PressButton3
```
setmetatile 14, 5, METATILE_TrickHousePuzzle_Button_Pressed, FALSE
setmetatile 7, 15, METATILE_TrickHousePuzzle_Door_Shuttered, FALSE
return
```
### Route110_TrickHousePuzzle2_EventScript_PressButton4
```
setmetatile 7, 11, METATILE_TrickHousePuzzle_Button_Pressed, FALSE
setmetatile 14, 12, METATILE_TrickHousePuzzle_Door_Shuttered, FALSE
return
```
### Route110_TrickHousePuzzle2_EventScript_Ted
```
trainerbattle_single TRAINER_TED, Route110_TrickHousePuzzle2_Text_TedIntro, Route110_TrickHousePuzzle2_Text_TedDefeat
msgbox Route110_TrickHousePuzzle2_Text_TedPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle2_EventScript_Paul
```
trainerbattle_single TRAINER_PAUL, Route110_TrickHousePuzzle2_Text_PaulIntro, Route110_TrickHousePuzzle2_Text_PaulDefeat
msgbox Route110_TrickHousePuzzle2_Text_PaulPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle2_EventScript_Georgia
```
trainerbattle_single TRAINER_GEORGIA, Route110_TrickHousePuzzle2_Text_GeorgiaIntro, Route110_TrickHousePuzzle2_Text_GeorgiaDefeat
msgbox Route110_TrickHousePuzzle2_Text_GeorgiaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (10)
### Route110_TrickHousePuzzle2_Text_WroteSecretCodeLockOpened
```
{PLAYER} écrit le code secret\nsur la porte.\p“Le MAITRE DES PIEGES est malin.”\n… … … … … … … …\pLa porte s'ouvre!$
```
### Route110_TrickHousePuzzle2_Text_TedIntro
```
Quel interrupteur fonctionne avec\nquel trou?!$
```
### Route110_TrickHousePuzzle2_Text_TedDefeat
```
Après ce combat, je suis encore plus\nconfus!$
```
### Route110_TrickHousePuzzle2_Text_TedPostBattle
```
Tu ne veux pas appuyer sur ces\nboutons pour moi?$
```
### Route110_TrickHousePuzzle2_Text_PaulIntro
```
Oh! C'est ton deuxième défi dans la\nMAISON DES PIEGES?$
```
### Route110_TrickHousePuzzle2_Text_PaulDefeat
```
Et en plus, tu sais te battre?$
```
### Route110_TrickHousePuzzle2_Text_PaulPostBattle
```
Le MAITRE DES PIEGES a fabriqué tous\nles pièges de ce bâtiment tout seul.$
```
### Route110_TrickHousePuzzle2_Text_GeorgiaIntro
```
Un jour, j'aurai ma propre ARENE.\nAlors je suis ici pour apprendre à faire\ldes pièges.$
```
### Route110_TrickHousePuzzle2_Text_GeorgiaDefeat
```
Je n'ai pas assez étudié les combats!$
```
### Route110_TrickHousePuzzle2_Text_GeorgiaPostBattle
```
Pfffiou! Quelle force! Tu pourrais\npeut-être devenir CHAMPION D'ARENE!$
```

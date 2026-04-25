# Route110_TrickHousePuzzle4

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_PUZZLE4`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_PUZZLE4`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (14 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GIRL_3` | 2,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_TrickHousePuzzle4_EventScript_Cora` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 14,7 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle4_EventScript_Paula` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 2,14 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHousePuzzle4_EventScript_Yuji` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 2,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle4_EventScript_ItemMechMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_4_MECH_MAIL` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 13,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 5,16 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 4,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 5,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 9,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_17` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 10,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_18` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 14,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_19` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 10,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_1A` |

## Warps (3)
- #0 (0,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #1 (1,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #2 (13,1) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #0

## BG events / signs (1)
- (14,13) [sign] → `Route110_TrickHousePuzzle4_EventScript_Scroll`

## Variables référencées (1)
- `VAR_TRICK_HOUSE_PUZZLE_4_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_TrickHousePuzzle_EventScript_FoundScroll`
- `Route110_TrickHousePuzzle_EventScript_ReadScrollAgain`

## Scripts (5)
### Route110_TrickHousePuzzle4_EventScript_Scroll
```
lockall
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_4_STATE, 0, Route110_TrickHousePuzzle4_EventScript_FoundScroll
goto Route110_TrickHousePuzzle_EventScript_ReadScrollAgain
end
```
### Route110_TrickHousePuzzle4_EventScript_FoundScroll
```
setvar VAR_TRICK_HOUSE_PUZZLE_4_STATE, 1
goto Route110_TrickHousePuzzle_EventScript_FoundScroll
end
```
### Route110_TrickHousePuzzle4_EventScript_Cora
```
trainerbattle_single TRAINER_CORA, Route110_TrickHousePuzzle4_Text_CoraIntro, Route110_TrickHousePuzzle4_Text_CoraDefeat
msgbox Route110_TrickHousePuzzle4_Text_CoraPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle4_EventScript_Yuji
```
trainerbattle_single TRAINER_YUJI, Route110_TrickHousePuzzle4_Text_YujiIntro, Route110_TrickHousePuzzle4_Text_YujiDefeat
msgbox Route110_TrickHousePuzzle4_Text_YujiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle4_EventScript_Paula
```
trainerbattle_single TRAINER_PAULA, Route110_TrickHousePuzzle4_Text_PaulaIntro, Route110_TrickHousePuzzle4_Text_PaulaDefeat
msgbox Route110_TrickHousePuzzle4_Text_PaulaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (10)
### Route110_TrickHousePuzzle4_Text_WroteSecretCodeLockOpened
```
{PLAYER} écrit le code secret\nsur la porte.\p“Le MAITRE DES PIEGES est cool.”\n… … … … … … … …\pLa porte s'ouvre!$
```
### Route110_TrickHousePuzzle4_Text_CoraIntro
```
Tous ces trucs à résoudre, c'est trop\ncompliqué. Je voulais juste me battre!$
```
### Route110_TrickHousePuzzle4_Text_CoraDefeat
```
Même si j'ai perdu, je préfère me battre!$
```
### Route110_TrickHousePuzzle4_Text_CoraPostBattle
```
Tu n'es pas d'accord? Ce que tu\ncherches, c'est surtout des DRESSEURS.$
```
### Route110_TrickHousePuzzle4_Text_YujiIntro
```
Hé, hé! Des rochers comme ça, je peux\nles pousser avec un seul doigt!$
```
### Route110_TrickHousePuzzle4_Text_YujiDefeat
```
Je peux pousser des rochers, mais je\nn'arrive pas à résoudre les énigmes…$
```
### Route110_TrickHousePuzzle4_Text_YujiPostBattle
```
Il ne suffit pas d'être musclé…\nIl faut utiliser sa tête et être malin!$
```
### Route110_TrickHousePuzzle4_Text_PaulaIntro
```
La MAISON DES PIEGES est de plus en\nplus compliquée, n'est-ce pas?$
```
### Route110_TrickHousePuzzle4_Text_PaulaDefeat
```
Aaargh!$
```
### Route110_TrickHousePuzzle4_Text_PaulaPostBattle
```
Quelqu'un est-il déjà arrivé à la fin?$
```

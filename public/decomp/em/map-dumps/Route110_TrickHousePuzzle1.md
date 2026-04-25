# Route110_TrickHousePuzzle1

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_PUZZLE1`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_PUZZLE1`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (15 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_LASS` | 14,20 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle1_EventScript_Sally` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 14,8 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle1_EventScript_Eddie` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 2,15 | `MOVEMENT_TYPE_FACE_DOWN` | `Route110_TrickHousePuzzle1_EventScript_Robin` | `0` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 11,16 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 13,18 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 14,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 11,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_17` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 8,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 11,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 2,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_19` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 13,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_18` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 0,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_1B` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 9,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle1_EventScript_ItemOrangeMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_1_ORANGE_MAIL` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 4,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_1C` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 2,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_1E` |

## Warps (3)
- #0 (0,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #1 (1,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #2 (13,1) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #0

## BG events / signs (1)
- (3,16) [sign] → `Route110_TrickHousePuzzle1_EventScript_Scroll`

## Variables référencées (1)
- `VAR_TRICK_HOUSE_PUZZLE_1_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_TrickHousePuzzle_EventScript_FoundScroll`
- `Route110_TrickHousePuzzle_EventScript_ReadScrollAgain`

## Scripts (8)
### Route110_TrickHousePuzzle1_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, Route110_TrickHousePuzzle1_OnLoad
```
### Route110_TrickHousePuzzle1_OnLoad
```
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_1_STATE, 2, Route110_TrickHousePuzzle1_EventScript_OpenDoor
end
```
### Route110_TrickHousePuzzle1_EventScript_OpenDoor
```
setmetatile 13, 1, METATILE_TrickHousePuzzle_Stairs_Down, FALSE
end
```
### Route110_TrickHousePuzzle1_EventScript_Scroll
```
lockall
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_1_STATE, 0, Route110_TrickHousePuzzle1_EventScript_FoundScroll
goto Route110_TrickHousePuzzle_EventScript_ReadScrollAgain
end
```
### Route110_TrickHousePuzzle1_EventScript_FoundScroll
```
setvar VAR_TRICK_HOUSE_PUZZLE_1_STATE, 1
goto Route110_TrickHousePuzzle_EventScript_FoundScroll
end
```
### Route110_TrickHousePuzzle1_EventScript_Sally
```
trainerbattle_single TRAINER_SALLY, Route110_TrickHousePuzzle1_Text_SallyIntro, Route110_TrickHousePuzzle1_Text_SallyDefeat
msgbox Route110_TrickHousePuzzle1_Text_SallyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle1_EventScript_Eddie
```
trainerbattle_single TRAINER_EDDIE, Route110_TrickHousePuzzle1_Text_EddieIntro, Route110_TrickHousePuzzle1_Text_EddieDefeat
msgbox Route110_TrickHousePuzzle1_Text_EddiePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle1_EventScript_Robin
```
trainerbattle_single TRAINER_ROBIN, Route110_TrickHousePuzzle1_Text_RobinIntro, Route110_TrickHousePuzzle1_Text_RobinDefeat
msgbox Route110_TrickHousePuzzle1_Text_RobinPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (10)
### Route110_TrickHousePuzzle1_Text_WroteSecretCodeLockOpened
```
{PLAYER} écrit le code secret\nsur la porte.\p“Le MAITRE DES PIEGES est formidable.”\n… … … … … … … …\pLa porte s'ouvre!$
```
### Route110_TrickHousePuzzle1_Text_SallyIntro
```
Grâce à COUPE, que je viens d'apprendre,\nje vais vaincre à la force de ma lame!$
```
### Route110_TrickHousePuzzle1_Text_SallyDefeat
```
Pourquoi as-tu l'air si sérieux?$
```
### Route110_TrickHousePuzzle1_Text_SallyPostBattle
```
Je ne me lasse pas de trancher,\ndécouper et taillader!$
```
### Route110_TrickHousePuzzle1_Text_EddieIntro
```
Je me suis retrouvé dans cette étrange\nmaison par hasard…$
```
### Route110_TrickHousePuzzle1_Text_EddieDefeat
```
Et maintenant, j'ai perdu…$
```
### Route110_TrickHousePuzzle1_Text_EddiePostBattle
```
J'ai perdu mon chemin, un combat et\nla tête… Je n'arrive pas à sortir…$
```
### Route110_TrickHousePuzzle1_Text_RobinIntro
```
Mais qui est le MAITRE DES PIEGES?$
```
### Route110_TrickHousePuzzle1_Text_RobinDefeat
```
Tu as gagné parce que j'étais perdue\ndans mes pensées!$
```
### Route110_TrickHousePuzzle1_Text_RobinPostBattle
```
Tu es balèze!\nMais qui es-tu, au juste?$
```

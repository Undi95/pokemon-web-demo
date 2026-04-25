# Route110_TrickHousePuzzle8

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_PUZZLE8`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_PUZZLE8`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 1,10 | `MOVEMENT_TYPE_FACE_UP` | `Route110_TrickHousePuzzle8_EventScript_Vincent` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 4,2 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHousePuzzle8_EventScript_Leroy` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 8,17 | `MOVEMENT_TYPE_FACE_LEFT` | `Route110_TrickHousePuzzle8_EventScript_Keira` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 2,2 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle8_EventScript_ItemBeadMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_8_BEAD_MAIL` |

## Warps (3)
- #0 (0,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #1 (1,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #2 (13,1) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #0

## BG events / signs (1)
- (3,21) [sign] → `Route110_TrickHousePuzzle8_EventScript_Scroll`

## Variables référencées (1)
- `VAR_TRICK_HOUSE_PUZZLE_8_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_TrickHousePuzzle_EventScript_FoundScroll`
- `Route110_TrickHousePuzzle_EventScript_ReadScrollAgain`

## Scripts (5)
### Route110_TrickHousePuzzle8_EventScript_Scroll
```
lockall
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_8_STATE, 0, Route110_TrickHousePuzzle8_EventScript_FoundScroll
goto Route110_TrickHousePuzzle_EventScript_ReadScrollAgain
end
```
### Route110_TrickHousePuzzle8_EventScript_FoundScroll
```
setvar VAR_TRICK_HOUSE_PUZZLE_8_STATE, 1
goto Route110_TrickHousePuzzle_EventScript_FoundScroll
end
```
### Route110_TrickHousePuzzle8_EventScript_Vincent
```
trainerbattle_single TRAINER_VINCENT, Route110_TrickHousePuzzle8_Text_VincentIntro, Route110_TrickHousePuzzle8_Text_VincentDefeat
msgbox Route110_TrickHousePuzzle8_Text_VincentPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle8_EventScript_Keira
```
trainerbattle_single TRAINER_KEIRA, Route110_TrickHousePuzzle8_Text_KeiraIntro, Route110_TrickHousePuzzle8_Text_KeiraDefeat
msgbox Route110_TrickHousePuzzle8_Text_KeiraPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle8_EventScript_Leroy
```
trainerbattle_single TRAINER_LEROY, Route110_TrickHousePuzzle8_Text_LeroyIntro, Route110_TrickHousePuzzle8_Text_LeroyDefeat
msgbox Route110_TrickHousePuzzle8_Text_LeroyPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (10)
### Route110_TrickHousePuzzle8_Text_WroteSecretCodeLockOpened
```
{PLAYER} écrit le code secret\nsur la porte.\p“J'aime le MAITRE DES PIEGES.”\n… … … … … … … …\pLa porte s'ouvre!$
```
### Route110_TrickHousePuzzle8_Text_VincentIntro
```
Peu de DRESSEURS sont arrivés\naussi loin.$
```
### Route110_TrickHousePuzzle8_Text_VincentDefeat
```
Ça doit vouloir dire que tu es balèze…$
```
### Route110_TrickHousePuzzle8_Text_VincentPostBattle
```
Tu as battu le MAITRE de la LIGUE\nPOKéMON? Les bras m'en tombent!$
```
### Route110_TrickHousePuzzle8_Text_KeiraIntro
```
C'est une sacrée chance de se battre\ncontre moi!$
```
### Route110_TrickHousePuzzle8_Text_KeiraDefeat
```
C'est impossible!\nJe ne peux pas perdre!$
```
### Route110_TrickHousePuzzle8_Text_KeiraPostBattle
```
Ta victoire tient du miracle.\nTu vas pouvoir frimer.$
```
### Route110_TrickHousePuzzle8_Text_LeroyIntro
```
Toi aussi, tu luttes pour relever le défi\nde la MAISON DES PIEGES.$
```
### Route110_TrickHousePuzzle8_Text_LeroyDefeat
```
Mmmh. Je vois…\nTon style est très impressionnant.$
```
### Route110_TrickHousePuzzle8_Text_LeroyPostBattle
```
Tu devrais plaire au MAITRE DES PIEGES.$
```

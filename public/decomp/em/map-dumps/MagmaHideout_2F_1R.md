# MagmaHideout_2F_1R

## Métadonnées
- **id** : `MAP_MAGMA_HIDEOUT_2F_1R`
- **layout** : `LAYOUT_MAGMA_HIDEOUT_2F_1R`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_MAGMA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 18,19 | `MOVEMENT_TYPE_WALK_SEQUENCE_LEFT_UP_RIGHT_DOWN` | `MagmaHideout_2F_1R_EventScript_Grunt4` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 12,14 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT` | `MagmaHideout_2F_1R_EventScript_Grunt5` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_F` | 8,8 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_2F_1R_EventScript_Grunt14` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 21,11 | `MOVEMENT_TYPE_FACE_UP` | `MagmaHideout_2F_1R_EventScript_Grunt3` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |

## Warps (3)
- #0 (11,23) → `MAP_MAGMA_HIDEOUT_2F_2R` warp #0
- #1 (8,2) → `MAP_MAGMA_HIDEOUT_1F` warp #1
- #2 (17,33) → `MAP_MAGMA_HIDEOUT_3F_1R` warp #2

## Scripts (4)
### MagmaHideout_2F_1R_EventScript_Grunt14
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_14, MagmaHideout_2F_1R_Text_Grunt14Intro, MagmaHideout_2F_1R_Text_Grunt14Defeat
msgbox MagmaHideout_2F_1R_Text_Grunt14PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_2F_1R_EventScript_Grunt3
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_3, MagmaHideout_2F_1R_Text_Grunt3Intro, MagmaHideout_2F_1R_Text_Grunt3Defeat
msgbox MagmaHideout_2F_1R_Text_Grunt3PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_2F_1R_EventScript_Grunt4
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_4, MagmaHideout_2F_1R_Text_Grunt4Intro, MagmaHideout_2F_1R_Text_Grunt4Defeat
msgbox MagmaHideout_2F_1R_Text_Grunt4PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_2F_1R_EventScript_Grunt5
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_5, MagmaHideout_2F_1R_Text_Grunt5Intro, MagmaHideout_2F_1R_Text_Grunt5Defeat
msgbox MagmaHideout_2F_1R_Text_Grunt5PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (12)
### MagmaHideout_2F_1R_Text_Grunt14Intro
```
Pas si vite!\pSeuls les membres de la TEAM MAGMA\nsont autorisés à être ici!\pMais tu ne portes pas notre uniforme…\pIl vaut mieux que je sois sûre!\nAllez, viens te battre!$
```
### MagmaHideout_2F_1R_Text_Grunt14Defeat
```
Aïe…\nMon honneur vient d'en prendre un coup.$
```
### MagmaHideout_2F_1R_Text_Grunt14PostBattle
```
Si tu n'aimes pas avoir froid,\nrejoins la TEAM MAGMA!$
```
### MagmaHideout_2F_1R_Text_Grunt3Intro
```
Attends un peu toi!\pTu pensais vraiment pouvoir passer\ndevant moi comme ça?$
```
### MagmaHideout_2F_1R_Text_Grunt3Defeat
```
Bon d'accord, j'ai rien dit.$
```
### MagmaHideout_2F_1R_Text_Grunt3PostBattle
```
J'aurais sûrement mieux fait de\nte laisser passer directement…$
```
### MagmaHideout_2F_1R_Text_Grunt4Intro
```
Ah ah!\nUn intrus!$
```
### MagmaHideout_2F_1R_Text_Grunt4Defeat
```
Graaah!$
```
### MagmaHideout_2F_1R_Text_Grunt4PostBattle
```
J'ai perdu…\pEst-ce que je dois continuer à\ntourner en rond bêtement?$
```
### MagmaHideout_2F_1R_Text_Grunt5Intro
```
Oh oh!\nUn intrus!$
```
### MagmaHideout_2F_1R_Text_Grunt5Defeat
```
Humpff…$
```
### MagmaHideout_2F_1R_Text_Grunt5PostBattle
```
En fait, les combats n'ont jamais été\nma spécialité…$
```

# MagmaHideout_2F_2R

## Métadonnées
- **id** : `MAP_MAGMA_HIDEOUT_2F_2R`
- **layout** : `LAYOUT_MAGMA_HIDEOUT_2F_2R`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_MAGMA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 29,8 | `MOVEMENT_TYPE_FACE_LEFT` | `MagmaHideout_2F_2R_EventScript_Grunt8` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 25,11 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_2F_2R_EventScript_Grunt7` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 21,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `MagmaHideout_2F_2R_EventScript_ItemMaxElixir` | `FLAG_ITEM_MAGMA_HIDEOUT_2F_2R_MAX_ELIXIR` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 8,9 | `MOVEMENT_TYPE_FACE_DOWN` | `MagmaHideout_2F_2R_EventScript_Grunt6` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_F` | 7,13 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_2F_2R_EventScript_Grunt15` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 14,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `MagmaHideout_2F_2R_EventScript_ItemFullRestore` | `FLAG_ITEM_MAGMA_HIDEOUT_2F_2R_FULL_RESTORE` |

## Warps (2)
- #0 (10,22) → `MAP_MAGMA_HIDEOUT_2F_1R` warp #0
- #1 (36,4) → `MAP_MAGMA_HIDEOUT_1F` warp #2

## Scripts (4)
### MagmaHideout_2F_2R_EventScript_Grunt15
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_15, MagmaHideout_2F_2R_Text_Grunt15Intro, MagmaHideout_2F_2R_Text_Grunt15Defeat
msgbox MagmaHideout_2F_2R_Text_Grunt15PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_2F_2R_EventScript_Grunt6
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_6, MagmaHideout_2F_2R_Text_Grunt6Intro, MagmaHideout_2F_2R_Text_Grunt6Defeat
msgbox MagmaHideout_2F_2R_Text_Grunt6PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_2F_2R_EventScript_Grunt7
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_7, MagmaHideout_2F_2R_Text_Grunt7Intro, MagmaHideout_2F_2R_Text_Grunt7Defeat
msgbox MagmaHideout_2F_2R_Text_Grunt7PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_2F_2R_EventScript_Grunt8
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_8, MagmaHideout_2F_2R_Text_Grunt8Intro, MagmaHideout_2F_2R_Text_Grunt8Defeat
msgbox MagmaHideout_2F_2R_Text_Grunt8PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (12)
### MagmaHideout_2F_2R_Text_Grunt15Intro
```
Je n'ai rien contre toi…\nMais je dois suivre les ordres!$
```
### MagmaHideout_2F_2R_Text_Grunt15Defeat
```
C'est une défaite, mais…$
```
### MagmaHideout_2F_2R_Text_Grunt15PostBattle
```
On a déterré quelque chose\nd'incroyable! Et on a l'ORBE BLEU!\pNotre leader n'a plus qu'à…\nWahahah…$
```
### MagmaHideout_2F_2R_Text_Grunt6Intro
```
Je ne supporte pas la chaleur…\nJe ferais peut-être mieux de rejoindre\lla TEAM AQUA…$
```
### MagmaHideout_2F_2R_Text_Grunt6Defeat
```
Oui, je ne suis vraiment pas fait pour\nêtre dans la TEAM MAGMA!$
```
### MagmaHideout_2F_2R_Text_Grunt6PostBattle
```
La mer ne te manque pas dans un\nendroit comme ça?$
```
### MagmaHideout_2F_2R_Text_Grunt7Intro
```
On entend quelquefois des grondements\nsourds par ici.\pSerait-ce le volcan? Ou bien serait-ce\nGROU…\pOups!\nOublie ce que je viens de dire!$
```
### MagmaHideout_2F_2R_Text_Grunt7Defeat
```
Ça a été chaud!\nPresque aussi chaud qu'un volcan!$
```
### MagmaHideout_2F_2R_Text_Grunt7PostBattle
```
Tu as gagné contre moi, mais\nça n'a pas vraiment d'importance.\pLa TEAM MAGMA est sur le point de\ntoucher son but!$
```
### MagmaHideout_2F_2R_Text_Grunt8Intro
```
Un de nos sbires est très inquiet\nd'avoir perdu le SCEAU MAGMA…\pAttends un peu!\nÇa ne serait pas toi qui…?$
```
### MagmaHideout_2F_2R_Text_Grunt8Defeat
```
J'peux pas le croire…$
```
### MagmaHideout_2F_2R_Text_Grunt8PostBattle
```
J'ai cette étrange impression que\nnotre plan va échouer…$
```

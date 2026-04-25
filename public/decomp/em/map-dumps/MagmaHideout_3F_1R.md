# MagmaHideout_3F_1R

## Métadonnées
- **id** : `MAP_MAGMA_HIDEOUT_3F_1R`
- **layout** : `LAYOUT_MAGMA_HIDEOUT_3F_1R`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_MAGMA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 2,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_3F_1R_EventScript_Grunt9` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_F` | 21,21 | `MOVEMENT_TYPE_FACE_LEFT` | `MagmaHideout_3F_1R_EventScript_Grunt16` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 9,16 | `MOVEMENT_TYPE_LOOK_AROUND` | `MagmaHideout_3F_1R_EventScript_ItemNugget` | `FLAG_ITEM_MAGMA_HIDEOUT_3F_1R_NUGGET` |

## Warps (3)
- #0 (7,21) → `MAP_MAGMA_HIDEOUT_4F` warp #0
- #1 (21,9) → `MAP_MAGMA_HIDEOUT_3F_2R` warp #0
- #2 (23,3) → `MAP_MAGMA_HIDEOUT_2F_1R` warp #2

## Scripts (2)
### MagmaHideout_3F_1R_EventScript_Grunt9
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_9, MagmaHideout_3F_1R_Text_Grunt9Intro, MagmaHideout_3F_1R_Text_Grunt9Defeat
msgbox MagmaHideout_3F_1R_Text_Grunt9PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_3F_1R_EventScript_Grunt16
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_16, MagmaHideout_3F_1R_Text_Grunt16Intro, MagmaHideout_3F_1R_Text_Grunt16Defeat
msgbox MagmaHideout_3F_1R_Text_Grunt16PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### MagmaHideout_3F_1R_Text_Grunt9Intro
```
Qu'est-ce que j'ai fait de mal pour\nêtre obligé de monter la garde ici?\pMon oreille gauche est presque\nen train de brûler!$
```
### MagmaHideout_3F_1R_Text_Grunt9Defeat
```
Je dois avoir des bouffées de chaleur…$
```
### MagmaHideout_3F_1R_Text_Grunt9PostBattle
```
Tu trouves pas ça bizarre qu'on porte\ndes bonnets dans cette fournaise?$
```
### MagmaHideout_3F_1R_Text_Grunt16Intro
```
Nous avons rejoint la TEAM pour aider\nnotre leader à concrétiser sa vision.\pJe me moque que tu appartiennes\nou non à la TEAM AQUA.\pJe ne laisserai personne interférer\ndans nos plans!$
```
### MagmaHideout_3F_1R_Text_Grunt16Defeat
```
Oh non…\nJe n'ai rien pu faire.$
```
### MagmaHideout_3F_1R_Text_Grunt16PostBattle
```
Ecoute-moi bien.\nNe te trompe pas d'ennemi.\pN'écoute pas la TEAM AQUA.\nNe crois pas leurs mensonges!$
```

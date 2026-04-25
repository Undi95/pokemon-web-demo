# MagmaHideout_1F

## Métadonnées
- **id** : `MAP_MAGMA_HIDEOUT_1F`
- **layout** : `LAYOUT_MAGMA_HIDEOUT_1F`
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
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 4,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_1F_EventScript_Grunt1` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,20 | `MOVEMENT_TYPE_LOOK_AROUND` | `MagmaHideout_1F_EventScript_ItemRareCandy` | `FLAG_ITEM_MAGMA_HIDEOUT_1F_RARE_CANDY` |
| `` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 30,20 | `MOVEMENT_TYPE_FACE_LEFT` | `MagmaHideout_1F_EventScript_Grunt2` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 5,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 7,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 6,23 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_13` |

## Warps (4)
- #0 (10,34) → `MAP_JAGGED_PASS` warp #4
- #1 (25,34) → `MAP_MAGMA_HIDEOUT_2F_1R` warp #1
- #2 (31,3) → `MAP_MAGMA_HIDEOUT_2F_2R` warp #1
- #3 (20,22) → `MAP_MAGMA_HIDEOUT_2F_3R` warp #0

## Variables référencées (1)
- `VAR_JAGGED_PASS_ASH_WEATHER`

## Scripts (4)
### MagmaHideout_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, MagmaHideout_1F_OnTransition
```
### MagmaHideout_1F_OnTransition
```
setvar VAR_JAGGED_PASS_ASH_WEATHER, 0
end
```
### MagmaHideout_1F_EventScript_Grunt1
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_1, MagmaHideout_1F_Text_Grunt1Intro, MagmaHideout_1F_Text_Grunt1Defeat
msgbox MagmaHideout_1F_Text_Grunt1PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_1F_EventScript_Grunt2
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_2, MagmaHideout_1F_Text_Grunt2Intro, MagmaHideout_1F_Text_Grunt2Defeat
msgbox MagmaHideout_1F_Text_Grunt2PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### MagmaHideout_1F_Text_Grunt1Intro
```
A l'appel de la TEAM MAGMA, nous\nnous sommes présentés un par un pour\lrecevoir nos assignements.\pC'est pour ça que je suis coincé dans\nce coin, j'arrive toujours trop tard!$
```
### MagmaHideout_1F_Text_Grunt1Defeat
```
J'arrive aussi toujours en retard aux\nentraînements!\pJ'aime pas trop l'avouer, mais je suis\nloin d'être le meilleur…$
```
### MagmaHideout_1F_Text_Grunt1PostBattle
```
OK, je vais essayer de m'entraîner\nun peu plus sérieusement.$
```
### MagmaHideout_1F_Text_Grunt2Intro
```
Notre leader nous a dit de creuser dans\nle MONT CHIMNEE, alors on a creusé.\pEt pendant qu'on était en train de\ncreuser, on est tombés sur quelque\lchose de vraiment incroyable.\pTu veux savoir ce que c'est?\pOuahahah!\nJe te le dirai si t'arrives à me battre!$
```
### MagmaHideout_1F_Text_Grunt2Defeat
```
Ouille!\nTu m'as eu!$
```
### MagmaHideout_1F_Text_Grunt2PostBattle
```
J'ai changé d'avis, j'vais rien te dire!\nTu vas devoir découvrir par toi-même!\pJe te gâcherais la surprise si je te\ndisais tout, tu crois pas?$
```

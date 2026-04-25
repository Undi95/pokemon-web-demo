# VictoryRoad_B1F

## Métadonnées
- **id** : `MAP_VICTORY_ROAD_B1F`
- **layout** : `LAYOUT_VICTORY_ROAD_B1F`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_VICTORY_ROAD`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (21 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 20,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 21,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 4,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 9,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 20,26 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_17` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 21,25 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 35,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_1E` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 19,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_19` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 20,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_1A` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 18,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_1B` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 20,25 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_1C` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 21,26 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_1D` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 34,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_1F` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 37,12 | `MOVEMENT_TYPE_FACE_LEFT` | `VictoryRoad_B1F_EventScript_Samuel` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 26,16 | `MOVEMENT_TYPE_FACE_UP` | `VictoryRoad_B1F_EventScript_Shannon` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 5,21 | `MOVEMENT_TYPE_FACE_LEFT` | `VictoryRoad_B1F_EventScript_Michelle` | `0` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 34,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 42,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `VictoryRoad_B1F_EventScript_ItemTMPsychic` | `FLAG_ITEM_VICTORY_ROAD_B1F_TM_PSYCHIC` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 32,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `VictoryRoad_B1F_EventScript_ItemFullRestore` | `FLAG_ITEM_VICTORY_ROAD_B1F_FULL_RESTORE` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 14,16 | `MOVEMENT_TYPE_FACE_DOWN` | `VictoryRoad_B1F_EventScript_Mitchell` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 14,20 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `VictoryRoad_B1F_EventScript_Halle` | `0` |

## Warps (7)
- #0 (30,25) → `MAP_VICTORY_ROAD_B2F` warp #0
- #1 (17,16) → `MAP_VICTORY_ROAD_B2F` warp #2
- #2 (42,25) → `MAP_VICTORY_ROAD_1F` warp #3
- #3 (42,2) → `MAP_VICTORY_ROAD_B2F` warp #1
- #4 (8,3) → `MAP_VICTORY_ROAD_1F` warp #4
- #5 (20,21) → `MAP_VICTORY_ROAD_1F` warp #2
- #6 (5,26) → `MAP_VICTORY_ROAD_B2F` warp #3

## Scripts (5)
### VictoryRoad_B1F_EventScript_Samuel
```
trainerbattle_single TRAINER_SAMUEL, VictoryRoad_B1F_Text_SamuelIntro, VictoryRoad_B1F_Text_SamuelDefeat
msgbox VictoryRoad_B1F_Text_SamuelPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B1F_EventScript_Shannon
```
trainerbattle_single TRAINER_SHANNON, VictoryRoad_B1F_Text_ShannonIntro, VictoryRoad_B1F_Text_ShannonDefeat
msgbox VictoryRoad_B1F_Text_ShannonPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B1F_EventScript_Michelle
```
trainerbattle_single TRAINER_MICHELLE, VictoryRoad_B1F_Text_MichelleIntro, VictoryRoad_B1F_Text_MichelleDefeat
msgbox VictoryRoad_B1F_Text_MichellePostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B1F_EventScript_Mitchell
```
trainerbattle_single TRAINER_MITCHELL, VictoryRoad_B1F_Text_MitchellIntro, VictoryRoad_B1F_Text_MitchellDefeat
msgbox VictoryRoad_B1F_Text_MitchellPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B1F_EventScript_Halle
```
trainerbattle_single TRAINER_HALLE, VictoryRoad_B1F_Text_HalleIntro, VictoryRoad_B1F_Text_HalleDefeat
msgbox VictoryRoad_B1F_Text_HallePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (15)
### VictoryRoad_B1F_Text_SamuelIntro
```
Penser que je me rapproche de\nla LIGUE POKéMON…\pJ'ai le trac…$
```
### VictoryRoad_B1F_Text_SamuelDefeat
```
Je n'ai rien pu faire…$
```
### VictoryRoad_B1F_Text_SamuelPostBattle
```
La LIGUE POKéMON s'éloigne à nouveau…\nQuelle déception…$
```
### VictoryRoad_B1F_Text_ShannonIntro
```
Pour réussir à parcourir le chemin qui\nte mènera à la LIGUE POKéMON, il te\lfaudra avoir la confiance de tes\lPOKéMON.$
```
### VictoryRoad_B1F_Text_ShannonDefeat
```
Votre relation est basée sur une\nsolide confiance.$
```
### VictoryRoad_B1F_Text_ShannonPostBattle
```
Comme les POKéMON et les DRESSEURS\nsont toujours ensemble, leur confiance\lmutuelle grandit.$
```
### VictoryRoad_B1F_Text_MichelleIntro
```
Ce n'est pas encore là. Ce n'est qu'une\nétape sur la route de la LIGUE POKéMON.$
```
### VictoryRoad_B1F_Text_MichelleDefeat
```
C'est en ce sens qu'il faut aller!$
```
### VictoryRoad_B1F_Text_MichellePostBattle
```
Tu vas te débrouiller, c'est sûr!\nTes POKéMON ont tous envie d'y aller!$
```
### VictoryRoad_B1F_Text_MitchellIntro
```
Mes POKéMON me font penser\naux étoiles!$
```
### VictoryRoad_B1F_Text_MitchellDefeat
```
Je n'avais encore jamais rencontré\nquelqu'un comme toi!$
```
### VictoryRoad_B1F_Text_MitchellPostBattle
```
Même quand tu ne te bats pas, j'arrive\nà sentir une grande force émanant\lde tes POKéMON et toi…$
```
### VictoryRoad_B1F_Text_HalleIntro
```
OK, pas besoin de t'énerver!\nRelax, ça va bien se passer!$
```
### VictoryRoad_B1F_Text_HalleDefeat
```
Ouah!\nFormidable!$
```
### VictoryRoad_B1F_Text_HallePostBattle
```
C'est bien la ROUTE VICTOIRE.\pMais ce n'est pas si différent de la\nroute que tu as déjà empruntée.\pEssaie de profiter du reste du\nchemin à parcourir!$
```

# BattleFrontier_Lounge8

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_LOUNGE8`
- **layout** : `LAYOUT_BATTLE_FRONTIER_LOUNGE2`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 4,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_Lounge8_EventScript_NinjaBoy` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 8,7 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge8_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 8,4 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge8_EventScript_Woman` | `0` |

## Warps (1)
- #0 (4,9) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #10

## Scripts (3)
### BattleFrontier_Lounge8_EventScript_Man
```
msgbox BattleFrontier_Lounge8_Text_WhatATrainerNeeds, MSGBOX_NPC
end
```
### BattleFrontier_Lounge8_EventScript_Woman
```
msgbox BattleFrontier_Lounge8_Text_KnowAboutFrontierBrains, MSGBOX_NPC
end
```
### BattleFrontier_Lounge8_EventScript_NinjaBoy
```
msgbox BattleFrontier_Lounge8_Text_ToldMeIHaveTalentForBattling, MSGBOX_NPC
end
```

## Textes (3)
### BattleFrontier_Lounge8_Text_WhatATrainerNeeds
```
Ce dont un DRESSEUR a besoin…\pSavoir…\nTactique…\lChance…\lCran…\lEsprit…\lBravoure…\lCapacité…\pParfait, je suis prêt!\nJe vais relever tous les défis!\pQuoi? Des POKéMON?\nC'est quoi ça?$
```
### BattleFrontier_Lounge8_Text_KnowAboutFrontierBrains
```
Tu as entendu parler des MENEURS DE\nZONE?\pC'est ainsi que SCOTT appelle les sept\nDRESSEURS responsables de chaque\lbâtiment de la ZONE DE COMBAT.$
```
### BattleFrontier_Lounge8_Text_ToldMeIHaveTalentForBattling
```
A la TOUR DE COMBAT, une fille m'a dit\nque j'avais beaucoup de talent!\pMoi, je préfère les CONCOURS POKéMON!\nMais je ne suis pas fort!\pOn n'est pas forcément doué pour les\nchoses qu'on aime…$
```

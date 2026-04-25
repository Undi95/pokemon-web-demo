# VictoryRoad_B2F

## Métadonnées
- **id** : `MAP_VICTORY_ROAD_B2F`
- **layout** : `LAYOUT_VICTORY_ROAD_B2F`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_VICTORY_ROAD`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 15,6 | `MOVEMENT_TYPE_FACE_DOWN` | `VictoryRoad_B2F_EventScript_Vito` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 43,14 | `MOVEMENT_TYPE_FACE_UP` | `VictoryRoad_B2F_EventScript_Owen` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 2,17 | `MOVEMENT_TYPE_FACE_DOWN` | `VictoryRoad_B2F_EventScript_Caroline` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 35,22 | `MOVEMENT_TYPE_FACE_LEFT` | `VictoryRoad_B2F_EventScript_Julie` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 13,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `VictoryRoad_B2F_EventScript_ItemFullHeal` | `FLAG_ITEM_VICTORY_ROAD_B2F_FULL_HEAL` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 25,18 | `MOVEMENT_TYPE_FACE_DOWN` | `VictoryRoad_B2F_EventScript_Dianne` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 25,21 | `MOVEMENT_TYPE_FACE_UP` | `VictoryRoad_B2F_EventScript_Felix` | `0` |

## Warps (4)
- #0 (30,25) → `MAP_VICTORY_ROAD_B1F` warp #0
- #1 (43,2) → `MAP_VICTORY_ROAD_B1F` warp #3
- #2 (19,12) → `MAP_VICTORY_ROAD_B1F` warp #1
- #3 (5,26) → `MAP_VICTORY_ROAD_B1F` warp #6

## BG events / signs (2)
- (28,5) [hidden_item] → ``
- (37,1) [hidden_item] → ``

## Scripts (6)
### VictoryRoad_B2F_EventScript_Vito
```
trainerbattle_single TRAINER_VITO, VictoryRoad_B2F_Text_VitoIntro, VictoryRoad_B2F_Text_VitoDefeat
msgbox VictoryRoad_B2F_Text_VitoPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B2F_EventScript_Owen
```
trainerbattle_single TRAINER_OWEN, VictoryRoad_B2F_Text_OwenIntro, VictoryRoad_B2F_Text_OwenDefeat
msgbox VictoryRoad_B2F_Text_OwenPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B2F_EventScript_Caroline
```
trainerbattle_single TRAINER_CAROLINE, VictoryRoad_B2F_Text_CarolineIntro, VictoryRoad_B2F_Text_CarolineDefeat
msgbox VictoryRoad_B2F_Text_CarolinePostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B2F_EventScript_Julie
```
trainerbattle_single TRAINER_JULIE, VictoryRoad_B2F_Text_JulieIntro, VictoryRoad_B2F_Text_JulieDefeat
msgbox VictoryRoad_B2F_Text_JuliePostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B2F_EventScript_Felix
```
trainerbattle_single TRAINER_FELIX, VictoryRoad_B2F_Text_FelixIntro, VictoryRoad_B2F_Text_FelixDefeat
msgbox VictoryRoad_B2F_Text_FelixPostBattle, MSGBOX_AUTOCLOSE
end
```
### VictoryRoad_B2F_EventScript_Dianne
```
trainerbattle_single TRAINER_DIANNE, VictoryRoad_B2F_Text_DianneIntro, VictoryRoad_B2F_Text_DianneDefeat
msgbox VictoryRoad_B2F_Text_DiannePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (18)
### VictoryRoad_B2F_Text_VitoIntro
```
On s'entraîne tous ensemble, avec\nles membres de ma famille!\pJe ne perds contre personne!$
```
### VictoryRoad_B2F_Text_VitoDefeat
```
Tu as un meilleur niveau que ma famille?!\nEst-ce possible?!$
```
### VictoryRoad_B2F_Text_VitoPostBattle
```
J'ai toujours été le meilleur de la\nfamille. Je n'avais encore jamais perdu…\pJ'ai perdu confiance en moi…\nJe vais peut-être rentrer chez moi…$
```
### VictoryRoad_B2F_Text_OwenIntro
```
On m'avait dit qu'il y avait un môme\ntrès fort. C'est de toi qu'ils parlaient?$
```
### VictoryRoad_B2F_Text_OwenDefeat
```
La demi-portion est forte!$
```
### VictoryRoad_B2F_Text_OwenPostBattle
```
D'après les rumeurs, le p'tit môme\ntrès fort viendrait de CLEMENTI-VILLE.$
```
### VictoryRoad_B2F_Text_CarolineIntro
```
Tu dois commencer à fatiguer.$
```
### VictoryRoad_B2F_Text_CarolineDefeat
```
Aucun signe de fatigue du tout!$
```
### VictoryRoad_B2F_Text_CarolinePostBattle
```
La ROUTE VICTOIRE et la LIGUE POKéMON\nsont des défis épuisants et de longue\lhaleine. Gare à la fatigue!$
```
### VictoryRoad_B2F_Text_JulieIntro
```
Avoir beaucoup de BADGES ne suffit pas.\pIl y aura toujours quelqu'un de plus\nfort que toi!$
```
### VictoryRoad_B2F_Text_JulieDefeat
```
Tu as un meilleur niveau que moi!$
```
### VictoryRoad_B2F_Text_JuliePostBattle
```
Regarde bien tes BADGES et rappelle-\ntoi quels DRESSEURS tu as affrontés.$
```
### VictoryRoad_B2F_Text_FelixIntro
```
Je suis arrivé jusqu'ici, mais le stress\nme donne des maux d'estomac…$
```
### VictoryRoad_B2F_Text_FelixDefeat
```
Oooh…\nÇa fait mal…$
```
### VictoryRoad_B2F_Text_FelixPostBattle
```
Je ne peux pas m'empêcher de stresser\nen sachant que la LIGUE POKéMON\lest si proche.\pJ'arrive à peine à me détendre.$
```
### VictoryRoad_B2F_Text_DianneIntro
```
L'élite de l'élite se réunit dans\ncette grotte.\pT'en penses quoi?$
```
### VictoryRoad_B2F_Text_DianneDefeat
```
Pas une seule fausse note!$
```
### VictoryRoad_B2F_Text_DiannePostBattle
```
T'as du cran, continue comme ça!$
```

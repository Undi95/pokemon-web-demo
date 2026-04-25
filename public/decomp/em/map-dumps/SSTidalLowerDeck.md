# SSTidalLowerDeck

## Métadonnées
- **id** : `MAP_SS_TIDAL_LOWER_DECK`
- **layout** : `LAYOUT_SS_TIDAL_LOWER_DECK`
- **music** : `MUS_SAILING`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SAILOR` | 10,4 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_RIGHT_UP_LEFT` | `SSTidalLowerDeck_EventScript_Phillip` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 7,4 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_UP_RIGHT` | `SSTidalLowerDeck_EventScript_Leonard` | `0` |

## Warps (1)
- #0 (15,2) → `MAP_SS_TIDAL_CORRIDOR` warp #8

## BG events / signs (1)
- (0,2) [hidden_item] → ``

## Scripts (2)
### SSTidalLowerDeck_EventScript_Phillip
```
trainerbattle_single TRAINER_PHILLIP, SSTidalLowerDeck_Text_PhillipIntro, SSTidalLowerDeck_Text_PhillipDefeat
msgbox SSTidalLowerDeck_Text_PhillipPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalLowerDeck_EventScript_Leonard
```
trainerbattle_single TRAINER_LEONARD, SSTidalLowerDeck_Text_LeonardIntro, SSTidalLowerDeck_Text_LeonardDefeat
msgbox SSTidalLowerDeck_Text_LeonardPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### SSTidalLowerDeck_Text_PhillipIntro
```
Arrrg! J'en ai plein le dos de nettoyer\ncet endroit gigantesque!\pC'est l'heure de la pause,\nbattons-nous!$
```
### SSTidalLowerDeck_Text_PhillipDefeat
```
Hé, p'tit frère, j'ai perdu!$
```
### SSTidalLowerDeck_Text_PhillipPostBattle
```
Nous sommes les FRERES PROPRETE!\pL'aîné répand le détergent et le\nbenjamin frotte!$
```
### SSTidalLowerDeck_Text_LeonardIntro
```
Nous sommes dans la cale du navire.\nIl y a beaucoup de place.\lProfitons-en pour faire un combat\lde POKéMON.$
```
### SSTidalLowerDeck_Text_LeonardDefeat
```
Hé, grand frère, j'ai perdu!$
```
### SSTidalLowerDeck_Text_LeonardPostBattle
```
Nous sommes les FRERES PROPRETE!\pL'aîné répand le détergent et le\nbenjamin frotte!$
```

# AbandonedShip_Corridors_1F

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_CORRIDORS_1F`
- **layout** : `LAYOUT_ABANDONED_SHIP_CORRIDORS_1F`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 17,7 | `MOVEMENT_TYPE_WANDER_AROUND` | `AbandonedShip_Corridors_1F_EventScript_Youngster` | `0` |
| `` | `OBJ_EVENT_GFX_TUBER_M` | 5,10 | `MOVEMENT_TYPE_WALK_SEQUENCE_UP_LEFT_DOWN_RIGHT` | `AbandonedShip_Corridors_1F_EventScript_Charlie` | `0` |

## Warps (12)
- #0 (9,11) → `MAP_ABANDONED_SHIP_DECK` warp #2
- #1 (8,11) → `MAP_ABANDONED_SHIP_DECK` warp #2
- #2 (0,11) → `MAP_ABANDONED_SHIP_DECK` warp #3
- #3 (1,11) → `MAP_ABANDONED_SHIP_DECK` warp #3
- #4 (11,9) → `MAP_ABANDONED_SHIP_ROOMS_1F` warp #0
- #5 (14,9) → `MAP_ABANDONED_SHIP_ROOMS_1F` warp #3
- #6 (11,3) → `MAP_ABANDONED_SHIP_ROOMS_1F` warp #2
- #7 (14,3) → `MAP_ABANDONED_SHIP_ROOMS_1F` warp #4
- #8 (3,9) → `MAP_ABANDONED_SHIP_ROOMS2_1F` warp #0
- #9 (16,2) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #7
- #10 (5,2) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #6
- #11 (3,3) → `MAP_ABANDONED_SHIP_ROOMS2_1F` warp #2

## Scripts (2)
### AbandonedShip_Corridors_1F_EventScript_Youngster
```
msgbox AbandonedShip_Corridors_1F_Text_IsntItFunHere, MSGBOX_NPC
end
```
### AbandonedShip_Corridors_1F_EventScript_Charlie
```
trainerbattle_single TRAINER_CHARLIE, AbandonedShip_Corridors_1F_Text_CharlieIntro, AbandonedShip_Corridors_1F_Text_CharlieDefeat
msgbox AbandonedShip_Corridors_1F_Text_CharliePostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (4)
### AbandonedShip_Corridors_1F_Text_CharlieIntro
```
Qu'est-ce qu'il y a de si drôle à me voir\nà bord du bateau avec ma bouée?$
```
### AbandonedShip_Corridors_1F_Text_CharlieDefeat
```
Waouh, tu m'as écrasé!$
```
### AbandonedShip_Corridors_1F_Text_CharliePostBattle
```
C'est dur de lancer des POKé BALLS tout\nen se cramponnant à une bouée!$
```
### AbandonedShip_Corridors_1F_Text_IsntItFunHere
```
C'est cool ici, hein?\nJe suis tout excité rien que d'être là!$
```

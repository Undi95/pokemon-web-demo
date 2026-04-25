# BattleFrontier_Lounge4

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_LOUNGE4`
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
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 4,4 | `MOVEMENT_TYPE_FACE_UP` | `BattleFrontier_Lounge4_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_COOK` | 6,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_Lounge4_EventScript_Cook` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 0,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Lounge4_EventScript_Man` | `0` |

## Warps (1)
- #0 (4,9) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #6

## Scripts (3)
### BattleFrontier_Lounge4_EventScript_Woman
```
msgbox BattleFrontier_Lounge4_Text_WonderIfInterviewsAiring, MSGBOX_NPC
end
```
### BattleFrontier_Lounge4_EventScript_Cook
```
msgbox BattleFrontier_Lounge4_Text_IfIOpenedRestaurantHere, MSGBOX_NPC
end
```
### BattleFrontier_Lounge4_EventScript_Man
```
msgbox BattleFrontier_Lounge4_Text_NeedBreatherAfterBattles, MSGBOX_NPC
end
```

## Textes (3)
### BattleFrontier_Lounge4_Text_WonderIfInterviewsAiring
```
Je me demande s'il y aura des interviews\nde bons DRESSEURS aujourd'hui.$
```
### BattleFrontier_Lounge4_Text_IfIOpenedRestaurantHere
```
Si j'ouvrais un restaurant ici, je\nferais fortune!$
```
### BattleFrontier_Lounge4_Text_NeedBreatherAfterBattles
```
Pfiou…\pJ'aurais besoin de faire le vide dans\nma tête entre deux combats…\pMais je n'arrête jamais de penser à\nma stratégie.$
```

# AbandonedShip_Rooms2_B1F

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_ROOMS2_B1F`
- **layout** : `LAYOUT_ABANDONED_SHIP_ROOMS2_B1F`
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
| `` | `OBJ_EVENT_GFX_CAMPER` | 3,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `AbandonedShip_Rooms2_B1F_EventScript_Camper` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 13,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `AbandonedShip_Rooms2_B1F_EventScript_ItemDiveBall` | `FLAG_ITEM_ABANDONED_SHIP_ROOMS_2_B1F_DIVE_BALL` |

## Warps (4)
- #0 (4,7) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #1
- #1 (5,7) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #1
- #2 (13,7) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #0
- #3 (14,7) → `MAP_ABANDONED_SHIP_CORRIDORS_B1F` warp #0

## Scripts (1)
### AbandonedShip_Rooms2_B1F_EventScript_Camper
```
msgbox AbandonedShip_Rooms2_B1F_Text_PerfectPlaceToGoExploring, MSGBOX_NPC
end
```

## Textes (1)
### AbandonedShip_Rooms2_B1F_Text_PerfectPlaceToGoExploring
```
C'est l'endroit idéal pour une petite\nexploration! C'est passionnant ici!\pJe parie qu'il y a de stupéfiants\ntrésors à bord.$
```

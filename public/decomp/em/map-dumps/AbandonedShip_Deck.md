# AbandonedShip_Deck

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_DECK`
- **layout** : `LAYOUT_ABANDONED_SHIP_DECK`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (5)
- #0 (13,15) → `MAP_ROUTE108` warp #0
- #1 (14,15) → `MAP_ROUTE108` warp #0
- #2 (13,9) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #1
- #3 (8,9) → `MAP_ABANDONED_SHIP_CORRIDORS_1F` warp #2
- #4 (12,5) → `MAP_ABANDONED_SHIP_CAPTAINS_OFFICE` warp #0

## Flags référencés (1)
- `FLAG_LANDMARK_ABANDONED_SHIP`

## Scripts (2)
### AbandonedShip_Deck_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, AbandonedShip_Deck_OnTransition
```
### AbandonedShip_Deck_OnTransition
```
setflag FLAG_LANDMARK_ABANDONED_SHIP
end
```

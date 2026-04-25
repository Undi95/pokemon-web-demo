# AbandonedShip_Underwater1

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_UNDERWATER1`
- **layout** : `LAYOUT_ABANDONED_SHIP_UNDERWATER1`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (3,7) → `MAP_ABANDONED_SHIP_UNDERWATER2` warp #0
- #1 (4,7) → `MAP_ABANDONED_SHIP_UNDERWATER2` warp #0

## Scripts (2)
### AbandonedShip_Underwater1_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, AbandonedShip_Underwater1_OnResume
```
### AbandonedShip_Underwater1_OnResume
```
setdivewarp MAP_ABANDONED_SHIP_HIDDEN_FLOOR_CORRIDORS, 0, 10
end
```

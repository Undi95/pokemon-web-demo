# AbandonedShip_Underwater2

## Métadonnées
- **id** : `MAP_ABANDONED_SHIP_UNDERWATER2`
- **layout** : `LAYOUT_ABANDONED_SHIP_UNDERWATER2`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_ABANDONED_SHIP`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (1)
- #0 (3,1) → `MAP_ABANDONED_SHIP_UNDERWATER1` warp #0

## Scripts (2)
### AbandonedShip_Underwater2_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, AbandonedShip_Underwater2_OnResume
```
### AbandonedShip_Underwater2_OnResume
```
setdivewarp MAP_ABANDONED_SHIP_ROOMS_B1F, 13, 7
end
```

# MirageTower_1F

## Métadonnées
- **id** : `MAP_MIRAGE_TOWER_1F`
- **layout** : `LAYOUT_MIRAGE_TOWER_1F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_MIRAGE_TOWER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (10,14) → `MAP_ROUTE111` warp #3
- #1 (15,2) → `MAP_MIRAGE_TOWER_2F` warp #1

## Flags référencés (3)
- `FLAG_ENTERED_MIRAGE_TOWER`
- `FLAG_FORCE_MIRAGE_TOWER_VISIBLE`
- `FLAG_LANDMARK_MIRAGE_TOWER`

## Scripts (2)
### MirageTower_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, MirageTower_1F_OnTransition
```
### MirageTower_1F_OnTransition
```
setflag FLAG_ENTERED_MIRAGE_TOWER
setflag FLAG_FORCE_MIRAGE_TOWER_VISIBLE
setflag FLAG_LANDMARK_MIRAGE_TOWER
end
```

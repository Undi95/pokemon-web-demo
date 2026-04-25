# TrainerHill_1F

## Métadonnées
- **id** : `MAP_TRAINER_HILL_1F`
- **layout** : `LAYOUT_TRAINER_HILL_1F`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_TRAINER_HILL`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Warps (2)
- #0 (2,1) → `MAP_TRAINER_HILL_ENTRANCE` warp #2
- #1 (12,1) → `MAP_TRAINER_HILL_2F` warp #0

## Scripts (1)
### TrainerHill_1F_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, TrainerHill_OnResume
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, TrainerHill_OnWarp
map_script MAP_SCRIPT_ON_FRAME_TABLE, TrainerHill_OnFrame
```

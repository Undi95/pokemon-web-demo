# MirageTower_2F

## Métadonnées
- **id** : `MAP_MIRAGE_TOWER_2F`
- **layout** : `LAYOUT_MIRAGE_TOWER_2F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_MIRAGE_TOWER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (18,12) → `MAP_MIRAGE_TOWER_3F` warp #0
- #1 (15,2) → `MAP_MIRAGE_TOWER_1F` warp #1

## Scripts (2)
### MirageTower_2F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, CaveHole_CheckFallDownHole
map_script MAP_SCRIPT_ON_TRANSITION, CaveHole_FixCrackedGround
map_script MAP_SCRIPT_ON_RESUME, MirageTower_2F_SetHoleWarp
```
### MirageTower_2F_SetHoleWarp
```
setstepcallback STEP_CB_CRACKED_FLOOR
setholewarp MAP_MIRAGE_TOWER_1F
end
```

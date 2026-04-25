# SkyPillar_Entrance

## Métadonnées
- **id** : `MAP_SKY_PILLAR_ENTRANCE`
- **layout** : `LAYOUT_SKY_PILLAR_ENTRANCE`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SKY_PILLAR`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (6,16) → `MAP_ROUTE131` warp #0
- #1 (14,4) → `MAP_SKY_PILLAR_OUTSIDE` warp #0

## Flags référencés (1)
- `FLAG_LANDMARK_SKY_PILLAR`

## Scripts (2)
### SkyPillar_Entrance_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SkyPillar_Entrance_OnTransition
```
### SkyPillar_Entrance_OnTransition
```
setflag FLAG_LANDMARK_SKY_PILLAR
end
```

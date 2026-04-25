# SkyPillar_1F

## Métadonnées
- **id** : `MAP_SKY_PILLAR_1F`
- **layout** : `LAYOUT_SKY_PILLAR_1F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SKY_PILLAR`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (3)
- #0 (6,13) → `MAP_SKY_PILLAR_OUTSIDE` warp #1
- #1 (7,13) → `MAP_SKY_PILLAR_OUTSIDE` warp #1
- #2 (10,1) → `MAP_SKY_PILLAR_2F` warp #0

## Variables référencées (1)
- `VAR_SKY_PILLAR_STATE`

## Scripts (3)
### SkyPillar_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SkyPillar_1F_OnTransition
```
### SkyPillar_1F_OnTransition
```
call_if_lt VAR_SKY_PILLAR_STATE, 2, SkyPillar_1F_EventScript_CleanFloor
end
```
### SkyPillar_1F_EventScript_CleanFloor
```
setmaplayoutindex LAYOUT_SKY_PILLAR_1F_CLEAN
return
```

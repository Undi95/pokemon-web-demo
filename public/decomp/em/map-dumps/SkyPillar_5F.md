# SkyPillar_5F

## Métadonnées
- **id** : `MAP_SKY_PILLAR_5F`
- **layout** : `LAYOUT_SKY_PILLAR_5F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SKY_PILLAR`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (3,1) → `MAP_SKY_PILLAR_4F` warp #2
- #1 (10,1) → `MAP_SKY_PILLAR_TOP` warp #0

## Variables référencées (1)
- `VAR_SKY_PILLAR_STATE`

## Scripts (3)
### SkyPillar_5F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SkyPillar_5F_OnTransition
```
### SkyPillar_5F_OnTransition
```
call_if_lt VAR_SKY_PILLAR_STATE, 2, SkyPillar_5F_EventScript_CleanFloor
return
```
### SkyPillar_5F_EventScript_CleanFloor
```
setmaplayoutindex LAYOUT_SKY_PILLAR_5F_CLEAN
return
```

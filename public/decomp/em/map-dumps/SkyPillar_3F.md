# SkyPillar_3F

## Métadonnées
- **id** : `MAP_SKY_PILLAR_3F`
- **layout** : `LAYOUT_SKY_PILLAR_3F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SKY_PILLAR`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (3)
- #0 (3,1) → `MAP_SKY_PILLAR_2F` warp #1
- #1 (11,1) → `MAP_SKY_PILLAR_4F` warp #0
- #2 (7,1) → `MAP_SKY_PILLAR_4F` warp #1

## Variables référencées (1)
- `VAR_SKY_PILLAR_STATE`

## Scripts (3)
### SkyPillar_3F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SkyPillar_3F_OnTransition
```
### SkyPillar_3F_OnTransition
```
call_if_lt VAR_SKY_PILLAR_STATE, 2, SkyPillar_3F_EventScript_CleanFloor
end
```
### SkyPillar_3F_EventScript_CleanFloor
```
setmaplayoutindex LAYOUT_SKY_PILLAR_3F_CLEAN
return
```

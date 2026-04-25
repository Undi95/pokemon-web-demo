# SkyPillar_2F

## Métadonnées
- **id** : `MAP_SKY_PILLAR_2F`
- **layout** : `LAYOUT_SKY_PILLAR_2F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SKY_PILLAR`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (10,1) → `MAP_SKY_PILLAR_1F` warp #2
- #1 (3,1) → `MAP_SKY_PILLAR_3F` warp #0

## Variables référencées (2)
- `VAR_ICE_STEP_COUNT`
- `VAR_SKY_PILLAR_STATE`

## Scripts (4)
### SkyPillar_2F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, CaveHole_CheckFallDownHole
map_script MAP_SCRIPT_ON_TRANSITION, SkyPillar_2F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, SkyPillar_2F_SetHoleWarp
```
### SkyPillar_2F_OnTransition
```
call_if_lt VAR_SKY_PILLAR_STATE, 2, SkyPillar_2F_EventScript_CleanFloor
#ifdef UBFIX
setvar VAR_ICE_STEP_COUNT, 1
#else
copyvar VAR_ICE_STEP_COUNT, 1, warn=FALSE
#endif
end
```
### SkyPillar_2F_EventScript_CleanFloor
```
setmaplayoutindex LAYOUT_SKY_PILLAR_2F_CLEAN
return
```
### SkyPillar_2F_SetHoleWarp
```
setstepcallback STEP_CB_CRACKED_FLOOR
setholewarp MAP_SKY_PILLAR_1F
end
```

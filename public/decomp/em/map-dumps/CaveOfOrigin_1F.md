# CaveOfOrigin_1F

## Métadonnées
- **id** : `MAP_CAVE_OF_ORIGIN_1F`
- **layout** : `LAYOUT_CAVE_OF_ORIGIN_1F`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_CAVE_OF_ORIGIN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (11,17) → `MAP_CAVE_OF_ORIGIN_ENTRANCE` warp #1
- #1 (14,5) → `MAP_CAVE_OF_ORIGIN_B1F` warp #0

## Flags référencés (1)
- `FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE`

## Scripts (2)
### CaveOfOrigin_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, CaveOfOrigin_1F_OnTransition
```
### CaveOfOrigin_1F_OnTransition
```
call_if_set FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE, CaveOfOrigin_EventScript_DisableTriggers
end
```

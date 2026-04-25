# CaveOfOrigin_UnusedRubySapphireMap2

## Métadonnées
- **id** : `MAP_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP2`
- **layout** : `LAYOUT_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP2`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_CAVE_OF_ORIGIN`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (5,10) → `MAP_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP1` warp #1
- #1 (8,14) → `MAP_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP3` warp #0

## Flags référencés (1)
- `FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE`

## Scripts (2)
### CaveOfOrigin_UnusedRubySapphireMap2_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, CaveOfOrigin_UnusedRubySapphireMap2_OnTransition
```
### CaveOfOrigin_UnusedRubySapphireMap2_OnTransition
```
call_if_set FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE, CaveOfOrigin_EventScript_DisableTriggers
end
```

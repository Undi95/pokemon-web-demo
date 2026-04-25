# CaveOfOrigin_UnusedRubySapphireMap1

## Métadonnées
- **id** : `MAP_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP1`
- **layout** : `LAYOUT_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP1`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_CAVE_OF_ORIGIN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (13,5) → `MAP_CAVE_OF_ORIGIN_1F` warp #1
- #1 (5,11) → `MAP_CAVE_OF_ORIGIN_UNUSED_RUBY_SAPPHIRE_MAP2` warp #0

## Flags référencés (1)
- `FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE`

## Scripts (2)
### CaveOfOrigin_UnusedRubySapphireMap1_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, CaveOfOrigin_UnusedRubySapphireMap1_OnTransition
```
### CaveOfOrigin_UnusedRubySapphireMap1_OnTransition
```
call_if_set FLAG_UNUSED_RS_LEGENDARY_BATTLE_DONE, CaveOfOrigin_EventScript_DisableTriggers
end
```

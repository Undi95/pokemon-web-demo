# Route110_TrickHouseCorridor

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_CORRIDOR`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_CORRIDOR`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Warps (4)
- #0 (13,3) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #1
- #1 (14,3) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #1
- #2 (4,23) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #3 (5,23) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2

## Variables référencées (1)
- `VAR_TRICK_HOUSE_ENTER_FROM_CORRIDOR`

## Scripts (2)
### Route110_TrickHouseCorridor_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route110_TrickHouseCorridor_OnTransition
```
### Route110_TrickHouseCorridor_OnTransition
```
setvar VAR_TRICK_HOUSE_ENTER_FROM_CORRIDOR, 1
end
```

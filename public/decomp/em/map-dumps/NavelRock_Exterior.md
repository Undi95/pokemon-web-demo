# NavelRock_Exterior

## Métadonnées
- **id** : `MAP_NAVEL_ROCK_EXTERIOR`
- **layout** : `LAYOUT_NAVEL_ROCK_EXTERIOR`
- **music** : `MUS_RG_SEVII_ROUTE`
- **region_map_section** : `MAPSEC_NAVEL_ROCK`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Warps (2)
- #0 (10,18) → `MAP_NAVEL_ROCK_HARBOR` warp #0
- #1 (10,10) → `MAP_NAVEL_ROCK_ENTRANCE` warp #1

## Flags référencés (1)
- `FLAG_ARRIVED_AT_NAVEL_ROCK`

## Scripts (2)
### NavelRock_Exterior_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, NavelRock_Exterior_OnTransition
```
### NavelRock_Exterior_OnTransition
```
setflag FLAG_ARRIVED_AT_NAVEL_ROCK
end
```

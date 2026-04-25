# Underwater_Route129

## Métadonnées
- **id** : `MAP_UNDERWATER_ROUTE129`
- **layout** : `LAYOUT_UNDERWATER_ROUTE129`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_129`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- emerge (offset 0) → `MAP_ROUTE129`

## Warps (2)
- #0 (26,3) → `MAP_UNDERWATER_MARINE_CAVE` warp #0
- #1 (32,21) → `MAP_UNDERWATER_MARINE_CAVE` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/abnormal_weather.inc
- `AbnormalWeather_Underwater_SetupEscapeWarp`

## Scripts (2)
### Underwater_Route129_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_Route129_OnResume
```
### Underwater_Route129_OnResume
```
call AbnormalWeather_Underwater_SetupEscapeWarp
end
```

# Underwater_Route105

## Métadonnées
- **id** : `MAP_UNDERWATER_ROUTE105`
- **layout** : `LAYOUT_UNDERWATER_ROUTE105`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_105`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- emerge (offset 0) → `MAP_ROUTE105`

## Warps (2)
- #0 (13,4) → `MAP_UNDERWATER_MARINE_CAVE` warp #0
- #1 (17,66) → `MAP_UNDERWATER_MARINE_CAVE` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/abnormal_weather.inc
- `AbnormalWeather_Underwater_SetupEscapeWarp`

## Scripts (2)
### Underwater_Route105_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_Route105_OnResume
```
### Underwater_Route105_OnResume
```
call AbnormalWeather_Underwater_SetupEscapeWarp
end
```

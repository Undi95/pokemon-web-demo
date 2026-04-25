# Underwater_Route127

## Métadonnées
- **id** : `MAP_UNDERWATER_ROUTE127`
- **layout** : `LAYOUT_UNDERWATER_ROUTE127`
- **music** : `MUS_UNDERWATER`
- **region_map_section** : `MAPSEC_UNDERWATER_127`
- **weather** : `WEATHER_UNDERWATER_BUBBLES`
- **map_type** : `MAP_TYPE_UNDERWATER`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- emerge (offset 0) → `MAP_ROUTE127`
- left (offset 0) → `MAP_UNDERWATER_ROUTE126`
- down (offset 0) → `MAP_UNDERWATER_ROUTE128`

## Warps (2)
- #0 (57,5) → `MAP_UNDERWATER_MARINE_CAVE` warp #0
- #1 (67,38) → `MAP_UNDERWATER_MARINE_CAVE` warp #0

## BG events / signs (4)
- (12,42) [hidden_item] → ``
- (50,36) [hidden_item] → ``
- (34,72) [hidden_item] → ``
- (72,20) [hidden_item] → ``

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/abnormal_weather.inc
- `AbnormalWeather_Underwater_SetupEscapeWarp`

## Scripts (2)
### Underwater_Route127_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, Underwater_Route127_OnResume
```
### Underwater_Route127_OnResume
```
call AbnormalWeather_Underwater_SetupEscapeWarp
end
```

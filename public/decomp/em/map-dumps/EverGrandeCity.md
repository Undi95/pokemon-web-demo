# EverGrandeCity

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY`
- **layout** : `LAYOUT_EVER_GRANDE_CITY`
- **music** : `MUS_EVER_GRANDE`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_CITY`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 40) → `MAP_ROUTE128`

## Warps (4)
- #0 (18,5) → `MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F` warp #0
- #1 (27,48) → `MAP_EVER_GRANDE_CITY_POKEMON_CENTER_1F` warp #0
- #2 (18,41) → `MAP_VICTORY_ROAD_1F` warp #0
- #3 (18,27) → `MAP_VICTORY_ROAD_1F` warp #1

## Coord events / triggers (11)
- (17,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (16,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (18,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (19,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (20,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (21,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (22,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (23,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (24,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (25,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)
- (26,58) → `EverGrandeCity_EventScript_SetVisitedEverGrande` (si `VAR_TEMP_1` == `0`)

## BG events / signs (5)
- (19,43) [sign] → `EverGrandeCity_EventScript_VictoryRoadSign`
- (29,48) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (18,52) [sign] → `EverGrandeCity_EventScript_CitySign`
- (23,15) [sign] → `EverGrandeCity_EventScript_PokemonLeagueSign`
- (28,48) [sign] → `Common_EventScript_ShowPokemonCenterSign`

## Flags référencés (2)
- `FLAG_SYS_WEATHER_CTRL`
- `FLAG_VISITED_EVER_GRANDE_CITY`

## Variables référencées (1)
- `VAR_TEMP_1`

## Scripts (6)
### EverGrandeCity_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, EverGrandeCity_OnTransition
```
### EverGrandeCity_OnTransition
```
call_if_set FLAG_SYS_WEATHER_CTRL, Common_EventScript_SetAbnormalWeather
end
```
### EverGrandeCity_EventScript_VictoryRoadSign
```
msgbox EverGrandeCity_Text_EnteringVictoryRoad, MSGBOX_SIGN
end
```
### EverGrandeCity_EventScript_CitySign
```
msgbox EverGrandeCity_Text_CitySign, MSGBOX_SIGN
end
```
### EverGrandeCity_EventScript_PokemonLeagueSign
```
msgbox EverGrandeCity_Text_EnteringPokemonLeague, MSGBOX_SIGN
end
```
### EverGrandeCity_EventScript_SetVisitedEverGrande
```
setflag FLAG_VISITED_EVER_GRANDE_CITY
setvar VAR_TEMP_1, 1
end
```

## Textes (3)
### EverGrandeCity_Text_EnteringVictoryRoad
```
DEBUT DE LA ROUTE VICTOIRE$
```
### EverGrandeCity_Text_EnteringPokemonLeague
```
ENTREE DE LA LIGUE POKéMON\nDROIT DEVANT$
```
### EverGrandeCity_Text_CitySign
```
ETERNARA\p“Le paradis des fleurs, de la mer et\ndes POKéMON.”$
```

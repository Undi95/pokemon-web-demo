# BattleColosseum_4P

## Métadonnées
- **id** : `MAP_BATTLE_COLOSSEUM_4P`
- **layout** : `LAYOUT_BATTLE_COLOSSEUM_4P`
- **music** : `MUS_EVER_GRANDE`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_FRONTIER`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Warps (4)
- #0 (5,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (6,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #2 (7,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #3 (8,8) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Coord events / triggers (4)
- (3,4) → `EventScript_BattleColosseum_4P_PlayerSpot0` (si `VAR_TEMP_0` == `0`)
- (3,6) → `EventScript_BattleColosseum_4P_PlayerSpot2` (si `VAR_TEMP_0` == `0`)
- (10,4) → `EventScript_BattleColosseum_4P_PlayerSpot1` (si `VAR_TEMP_0` == `0`)
- (10,6) → `EventScript_BattleColosseum_4P_PlayerSpot3` (si `VAR_TEMP_0` == `0`)

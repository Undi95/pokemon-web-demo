# Route117_PokemonDayCare

## Métadonnées
- **id** : `MAP_ROUTE117_POKEMON_DAY_CARE`
- **layout** : `LAYOUT_ROUTE117_POKEMON_DAY_CARE`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_117`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_DAYCARE_LADY` | `OBJ_EVENT_GFX_OLD_WOMAN` | 2,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route117_PokemonDayCare_EventScript_DaycareWoman` | `0` |

## Warps (2)
- #0 (2,8) → `MAP_ROUTE117` warp #0
- #1 (3,8) → `MAP_ROUTE117` warp #0

## Flags référencés (1)
- `FLAG_LANDMARK_POKEMON_DAYCARE`

## Scripts (2)
### Route117_PokemonDayCare_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route117_PokemonDayCare_OnTransition
```
### Route117_PokemonDayCare_OnTransition
```
setflag FLAG_LANDMARK_POKEMON_DAYCARE
end
```

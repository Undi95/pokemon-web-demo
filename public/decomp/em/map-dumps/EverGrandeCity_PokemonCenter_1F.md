# EverGrandeCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_EVER_GRANDE_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 5,5 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PokemonCenter_1F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 10,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `EverGrandeCity_PokemonCenter_1F_EventScript_ExpertM` | `0` |
| `LOCALID_EVER_GRANDE_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 9,4 | `MOVEMENT_TYPE_FACE_UP` | `EverGrandeCity_PokemonCenter_1F_EventScript_Scott` | `FLAG_HIDE_EVER_GRANDE_POKEMON_CENTER_1F_SCOTT` |

## Warps (3)
- #0 (7,8) → `MAP_EVER_GRANDE_CITY` warp #1
- #1 (6,8) → `MAP_EVER_GRANDE_CITY` warp #1
- #2 (1,6) → `MAP_EVER_GRANDE_CITY_POKEMON_CENTER_2F` warp #0

## Flags référencés (3)
- `FLAG_BADGE06_GET`
- `FLAG_HIDE_EVER_GRANDE_POKEMON_CENTER_1F_SCOTT`
- `FLAG_MET_SCOTT_IN_EVERGRANDE`

## Variables référencées (3)
- `VAR_0x800B`
- `VAR_FACING`
- `VAR_SCOTT_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (11)
### EverGrandeCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, EverGrandeCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### EverGrandeCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_EVER_GRANDE_CITY
call_if_unset FLAG_MET_SCOTT_IN_EVERGRANDE, EverGrandeCity_PokemonCenter_1F_EventScript_TryShowScott
end
```
### EverGrandeCity_PokemonCenter_1F_EventScript_TryShowScott
```
goto_if_unset FLAG_BADGE06_GET, Common_EventScript_NopReturn
clearflag FLAG_HIDE_EVER_GRANDE_POKEMON_CENTER_1F_SCOTT
return
```
### EverGrandeCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_EVER_GRANDE_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### EverGrandeCity_PokemonCenter_1F_EventScript_Woman
```
msgbox EverGrandeCity_PokemonCenter_1F_Text_LeagueAfterVictoryRoad, MSGBOX_NPC
end
```
### EverGrandeCity_PokemonCenter_1F_EventScript_ExpertM
```
msgbox EverGrandeCity_PokemonCenter_1F_Text_BelieveInYourPokemon, MSGBOX_NPC
end
```
### EverGrandeCity_PokemonCenter_1F_EventScript_Scott
```
lock
faceplayer
msgbox EverGrandeCity_PokemonCenter_1F_Text_ScottHappyForYou, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_FACING, DIR_NORTH, EverGrandeCity_PokemonCenter_1F_EventScript_ScottExitNorth
call_if_eq VAR_FACING, DIR_EAST, EverGrandeCity_PokemonCenter_1F_EventScript_ScottExit
call_if_eq VAR_FACING, DIR_WEST, EverGrandeCity_PokemonCenter_1F_EventScript_ScottExit
addvar VAR_SCOTT_STATE, 1
setflag FLAG_MET_SCOTT_IN_EVERGRANDE
playse SE_EXIT
waitse
removeobject LOCALID_EVER_GRANDE_SCOTT
release
end
```
### EverGrandeCity_PokemonCenter_1F_EventScript_ScottExitNorth
```
applymovement LOCALID_EVER_GRANDE_SCOTT, EverGrandeCity_PokemonCenter_1F_Movement_ScottExitNorth
waitmovement 0
return
```
### EverGrandeCity_PokemonCenter_1F_EventScript_ScottExit
```
applymovement LOCALID_EVER_GRANDE_SCOTT, EverGrandeCity_PokemonCenter_1F_Movement_ScottExit
waitmovement 0
return
```
### EverGrandeCity_PokemonCenter_1F_Movement_ScottExitNorth
```
walk_left
walk_down
walk_down
walk_left
walk_down
walk_down
step_end
```
### EverGrandeCity_PokemonCenter_1F_Movement_ScottExit
```
walk_down
walk_down
walk_left
walk_left
walk_down
walk_down
step_end
```

## Textes (3)
### EverGrandeCity_PokemonCenter_1F_Text_LeagueAfterVictoryRoad
```
La LIGUE POKéMON se trouve juste\nun peu après la ROUTE VICTOIRE.\pSi tu as fait la route jusqu'ici,\nautant continuer!$
```
### EverGrandeCity_PokemonCenter_1F_Text_BelieveInYourPokemon
```
Longue et impitoyable ROUTE VICTOIRE…\pC'est comme refaire un trajet\ndéjà parcouru…\pCrois en tes POKéMON et donne-leur\ntout ce que tu as!$
```
### EverGrandeCity_PokemonCenter_1F_Text_ScottHappyForYou
```
SCOTT: {PLAYER}{KUN}, tu as franchi les\nétapes qui mènent à la LIGUE POKéMON!\pJe suis heureux pour toi! Ça a valu le\ncoup que je te soutienne!\p{PLAYER}{KUN}, si tu arrives à devenir le\nMAITRE de la LIGUE POKéMON…\pJe prendrai contact avec toi.\pOK, le chemin de la gloire est\ndevant toi!$
```

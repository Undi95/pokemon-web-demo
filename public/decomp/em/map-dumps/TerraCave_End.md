# TerraCave_End

## Métadonnées
- **id** : `MAP_TERRA_CAVE_END`
- **layout** : `LAYOUT_TERRA_CAVE_END`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_TERRA_CAVE`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_TERRA_CAVE_GROUDON` | `OBJ_EVENT_GFX_GROUDON_FRONT` | 17,22 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_TERRA_CAVE_GROUDON` |

## Warps (1)
- #0 (5,4) → `MAP_TERRA_CAVE_ENTRANCE` warp #1

## Coord events / triggers (1)
- (17,26) → `TerraCave_End_EventScript_Groudon` (si `VAR_TEMP_1` == `1`)

## Flags référencés (3)
- `FLAG_DEFEATED_GROUDON`
- `FLAG_HIDE_TERRA_CAVE_GROUDON`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_LegendaryFlewAway`
- `Common_EventScript_RemoveStaticPokemon`

## Scripts (9)
### TerraCave_End_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, TerraCave_End_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, TerraCave_End_OnTransition
```
### TerraCave_End_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, TerraCave_End_EventScript_TryRemoveGroudon
end
```
### TerraCave_End_EventScript_TryRemoveGroudon
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject LOCALID_TERRA_CAVE_GROUDON
return
```
### TerraCave_End_OnTransition
```
call_if_unset FLAG_DEFEATED_GROUDON, TerraCave_End_EventScript_ShowGroudon
end
```
### TerraCave_End_EventScript_ShowGroudon
```
clearflag FLAG_HIDE_TERRA_CAVE_GROUDON
setvar VAR_TEMP_1, 1
return
```
### TerraCave_End_EventScript_Groudon
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_FaceUp
waitmovement 0
applymovement LOCALID_TERRA_CAVE_GROUDON, TerraCave_End_Movement_GroudonApproach
waitmovement 0
waitse
playmoncry SPECIES_GROUDON, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setvar VAR_LAST_TALKED, LOCALID_TERRA_CAVE_GROUDON
setwildbattle SPECIES_GROUDON, 70
setflag FLAG_SYS_CTRL_OBJ_DELETE
special BattleSetup_StartLegendaryBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
setvar VAR_TEMP_1, 0
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, TerraCave_End_EventScript_DefeatedGroudon
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, TerraCave_End_EventScript_RanFromGroudon
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, TerraCave_End_EventScript_RanFromGroudon
setvar VAR_SHOULD_END_ABNORMAL_WEATHER, 1
setflag FLAG_DEFEATED_GROUDON
releaseall
end
```
### TerraCave_End_EventScript_DefeatedGroudon
```
setvar VAR_SHOULD_END_ABNORMAL_WEATHER, 1
setflag FLAG_DEFEATED_GROUDON
goto Common_EventScript_RemoveStaticPokemon
end
```
### TerraCave_End_EventScript_RanFromGroudon
```
setvar VAR_0x8004, SPECIES_GROUDON
goto Common_EventScript_LegendaryFlewAway
end
```
### TerraCave_End_Movement_GroudonApproach
```
init_affine_anim
walk_down_start_affine
delay_16
delay_16
walk_down_affine
delay_16
delay_16
walk_down_affine
step_end
```

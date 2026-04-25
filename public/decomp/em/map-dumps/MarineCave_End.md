# MarineCave_End

## Métadonnées
- **id** : `MAP_MARINE_CAVE_END`
- **layout** : `LAYOUT_MARINE_CAVE_END`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_MARINE_CAVE`
- **weather** : `WEATHER_FOG_HORIZONTAL`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MARINE_CAVE_KYOGRE` | `OBJ_EVENT_GFX_KYOGRE_FRONT` | 9,22 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_MARINE_CAVE_KYOGRE` |

## Warps (1)
- #0 (20,4) → `MAP_MARINE_CAVE_ENTRANCE` warp #0

## Coord events / triggers (1)
- (9,26) → `MarineCave_End_EventScript_Kyogre` (si `VAR_TEMP_1` == `1`)

## Flags référencés (3)
- `FLAG_DEFEATED_KYOGRE`
- `FLAG_HIDE_MARINE_CAVE_KYOGRE`
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
### MarineCave_End_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, MarineCave_End_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, MarineCave_End_OnTransition
```
### MarineCave_End_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, MarineCave_End_EventScript_TryRemoveKyogre
end
```
### MarineCave_End_EventScript_TryRemoveKyogre
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject LOCALID_MARINE_CAVE_KYOGRE
return
```
### MarineCave_End_OnTransition
```
call_if_unset FLAG_DEFEATED_KYOGRE, MarineCave_End_EventScript_ShowKyogre
end
```
### MarineCave_End_EventScript_ShowKyogre
```
clearflag FLAG_HIDE_MARINE_CAVE_KYOGRE
setvar VAR_TEMP_1, 1
return
```
### MarineCave_End_EventScript_Kyogre
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_FaceUp
waitmovement 0
applymovement LOCALID_MARINE_CAVE_KYOGRE, MarineCave_End_Movement_KyogreApproach
waitmovement 0
waitse
playmoncry SPECIES_KYOGRE, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setvar VAR_LAST_TALKED, LOCALID_MARINE_CAVE_KYOGRE
setwildbattle SPECIES_KYOGRE, 70
setflag FLAG_SYS_CTRL_OBJ_DELETE
special BattleSetup_StartLegendaryBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
setvar VAR_TEMP_1, 0
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, MarineCave_End_EventScript_DefeatedKyogre
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, MarineCave_End_EventScript_RanFromKyogre
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, MarineCave_End_EventScript_RanFromKyogre
setvar VAR_SHOULD_END_ABNORMAL_WEATHER, 1
setflag FLAG_DEFEATED_KYOGRE
releaseall
end
```
### MarineCave_End_EventScript_DefeatedKyogre
```
setvar VAR_SHOULD_END_ABNORMAL_WEATHER, 1
setflag FLAG_DEFEATED_KYOGRE
goto Common_EventScript_RemoveStaticPokemon
end
```
### MarineCave_End_EventScript_RanFromKyogre
```
setvar VAR_0x8004, SPECIES_KYOGRE
goto Common_EventScript_LegendaryFlewAway
end
```
### MarineCave_End_Movement_KyogreApproach
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

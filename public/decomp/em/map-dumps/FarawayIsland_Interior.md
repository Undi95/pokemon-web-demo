# FarawayIsland_Interior

## Métadonnées
- **id** : `MAP_FARAWAY_ISLAND_INTERIOR`
- **layout** : `LAYOUT_FARAWAY_ISLAND_INTERIOR`
- **music** : `MUS_ABANDONED_SHIP`
- **region_map_section** : `MAPSEC_FARAWAY_ISLAND`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FARAWAY_ISLAND_MEW` | `OBJ_EVENT_GFX_MEW` | 13,17 | `MOVEMENT_TYPE_COPY_PLAYER_OPPOSITE_IN_GRASS` | `FarawayIsland_Interior_EventScript_Mew` | `FLAG_HIDE_MEW` |

## Warps (2)
- #0 (12,19) → `MAP_FARAWAY_ISLAND_ENTRANCE` warp #0
- #1 (13,19) → `MAP_FARAWAY_ISLAND_ENTRANCE` warp #1

## Flags référencés (4)
- `FLAG_CAUGHT_MEW`
- `FLAG_DEFEATED_MEW`
- `FLAG_HIDE_MEW`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (6)
- `VAR_0x8004`
- `VAR_FACING`
- `VAR_FARAWAY_ISLAND_STEP_COUNTER`
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_LegendaryFlewAway`

## Scripts (24)
### FarawayIsland_Interior_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, FarawayIsland_Interior_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, FarawayIsland_Interior_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, FarawayIsland_Interior_OnFrame
map_script MAP_SCRIPT_ON_RETURN_TO_FIELD, FarawayIsland_Interior_OnReturnToField
```
### FarawayIsland_Interior_OnReturnToField
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, FarawayIsland_Interior_EventScript_TrySetMewAboveGrass
end
```
### FarawayIsland_Interior_EventScript_TrySetMewAboveGrass
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, FarawayIsland_Interior_EventScript_SetMewAboveGrass
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, FarawayIsland_Interior_EventScript_SetMewAboveGrass
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, FarawayIsland_Interior_EventScript_SetMewAboveGrass
goto_if_eq VAR_RESULT, B_OUTCOME_MON_TELEPORTED, FarawayIsland_Interior_EventScript_SetMewAboveGrass
return
```
### FarawayIsland_Interior_EventScript_SetMewAboveGrass
```
setvar VAR_0x8004, 1
special SetMewAboveGrass
return
```
### FarawayIsland_Interior_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, FarawayIsland_Interior_EventScript_TryRemoveMew
end
```
### FarawayIsland_Interior_EventScript_TryRemoveMew
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### FarawayIsland_Interior_OnTransition
```
setvar VAR_FARAWAY_ISLAND_STEP_COUNTER, 0
setvar VAR_TEMP_1, 1
call_if_unset FLAG_CAUGHT_MEW, FarawayIsland_Interior_EventScript_TryShowMew
end
```
### FarawayIsland_Interior_EventScript_TryShowMew
```
goto_if_set FLAG_DEFEATED_MEW, Common_EventScript_NopReturn
clearflag FLAG_HIDE_MEW
setvar VAR_TEMP_1, 0
return
```
### FarawayIsland_Interior_OnFrame
```
map_script_2 VAR_TEMP_1, 0, FarawayIsland_Interior_EventScript_FindMew
```
### FarawayIsland_Interior_EventScript_FindMew
```
lockall
playse SE_PIN
applymovement LOCALID_FARAWAY_ISLAND_MEW, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_FARAWAY_ISLAND_MEW, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_FARAWAY_ISLAND_MEW, FarawayIsland_Interior_Movement_MewMoveAndHide
waitmovement 0
copyobjectxytoperm LOCALID_FARAWAY_ISLAND_MEW
setvar VAR_TEMP_1, 1
releaseall
end
```
### FarawayIsland_Interior_Movement_MewMoveAndHide
```
walk_up
walk_up
walk_up
walk_in_place_faster_down
set_invisible
step_end
```
### FarawayIsland_Interior_Movement_MewAppear
```
set_visible
step_end
```
### FarawayIsland_Interior_Movement_MewFloatUpNorth
```
lock_facing_direction
walk_fast_up
walk_fast_up
unlock_facing_direction
walk_in_place_down
walk_in_place_down
step_end
```
### FarawayIsland_Interior_Movement_MewFloatUpSouth
```
lock_facing_direction
walk_fast_up
walk_fast_up
unlock_facing_direction
walk_in_place_up
walk_in_place_up
step_end
```
### FarawayIsland_Interior_Movement_MewFloatUpWest
```
lock_facing_direction
walk_fast_up
walk_fast_up
unlock_facing_direction
walk_in_place_right
walk_in_place_right
step_end
```
### FarawayIsland_Interior_Movement_MewFloatUpEast
```
lock_facing_direction
walk_fast_up
walk_fast_up
unlock_facing_direction
walk_in_place_left
walk_in_place_left
step_end
```
### FarawayIsland_Interior_EventScript_Mew
```
lock
faceplayer
applymovement LOCALID_FARAWAY_ISLAND_MEW, FarawayIsland_Interior_Movement_MewAppear
waitmovement 0
setvar VAR_0x8004, 0
special SetMewAboveGrass
message FarawayIsland_Interior_Text_Mew
waitse
playmoncry SPECIES_MEW, CRY_MODE_ENCOUNTER
call_if_eq VAR_FACING, DIR_NORTH, FarawayIsland_Interior_EventScript_FoundMewNorth
call_if_eq VAR_FACING, DIR_SOUTH, FarawayIsland_Interior_EventScript_FoundMewSouth
call_if_eq VAR_FACING, DIR_WEST, FarawayIsland_Interior_EventScript_FoundMewWest
call_if_eq VAR_FACING, DIR_EAST, FarawayIsland_Interior_EventScript_FoundMewEast
special DestroyMewEmergingGrassSprite
delay 40
waitmoncry
seteventmon SPECIES_MEW, 30
setflag FLAG_SYS_CTRL_OBJ_DELETE
special BattleSetup_StartLegendaryBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, FarawayIsland_Interior_EventScript_MewDefeated
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, FarawayIsland_Interior_EventScript_PlayerOrMewRan
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, FarawayIsland_Interior_EventScript_PlayerOrMewRan
goto_if_eq VAR_RESULT, B_OUTCOME_MON_TELEPORTED, FarawayIsland_Interior_EventScript_PlayerOrMewRan
setflag FLAG_CAUGHT_MEW
release
end
```
### FarawayIsland_Interior_EventScript_MewDefeated
```
setflag FLAG_DEFEATED_MEW
setvar VAR_0x8004, SPECIES_MEW
goto Common_EventScript_LegendaryFlewAway
end
```
### FarawayIsland_Interior_EventScript_PlayerOrMewRan
```
setvar VAR_0x8004, SPECIES_MEW
goto Common_EventScript_LegendaryFlewAway
end
```
### FarawayIsland_Interior_EventScript_FoundMewNorth
```
applymovement LOCALID_FARAWAY_ISLAND_MEW, FarawayIsland_Interior_Movement_MewFloatUpNorth
waitmovement 0
return
```
### FarawayIsland_Interior_EventScript_FoundMewSouth
```
applymovement LOCALID_FARAWAY_ISLAND_MEW, FarawayIsland_Interior_Movement_MewFloatUpSouth
waitmovement 0
return
```
### FarawayIsland_Interior_EventScript_FoundMewWest
```
applymovement LOCALID_FARAWAY_ISLAND_MEW, FarawayIsland_Interior_Movement_MewFloatUpWest
waitmovement 0
return
```
### FarawayIsland_Interior_EventScript_FoundMewEast
```
applymovement LOCALID_FARAWAY_ISLAND_MEW, FarawayIsland_Interior_Movement_MewFloatUpEast
waitmovement 0
return
```
### FarawayIsland_Interior_EventScript_HideMewWhenGrassCut
```
lockall
fadescreenswapbuffers FADE_TO_BLACK
setflag FLAG_HIDE_MEW
removeobject LOCALID_FARAWAY_ISLAND_MEW
fadescreenswapbuffers FADE_FROM_BLACK
msgbox FarawayIsland_Interior_Text_TheFeelingOfBeingWatchedFaded, MSGBOX_DEFAULT
closemessage
releaseall
end
```

## Textes (1)
### FarawayIsland_Interior_Text_TheFeelingOfBeingWatchedFaded
```
Je n'ai plus l'impression que quelqu'un\nm'observe…$
```

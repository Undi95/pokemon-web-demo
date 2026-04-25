# AncientTomb

## Métadonnées
- **id** : `MAP_ANCIENT_TOMB`
- **layout** : `LAYOUT_ANCIENT_TOMB`
- **music** : `MUS_SEALED_CHAMBER`
- **region_map_section** : `MAPSEC_ANCIENT_TOMB`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_REGISTEEL` | 8,7 | `MOVEMENT_TYPE_FACE_DOWN` | `AncientTomb_EventScript_Registeel` | `FLAG_HIDE_REGISTEEL` |

## Warps (3)
- #0 (8,29) → `MAP_ROUTE120` warp #0
- #1 (8,20) → `MAP_ANCIENT_TOMB` warp #2
- #2 (8,11) → `MAP_ANCIENT_TOMB` warp #1

## BG events / signs (3)
- (8,20) [sign] → `AncientTomb_EventScript_CaveEntranceMiddle`
- (7,20) [sign] → `AncientTomb_EventScript_CaveEntranceSide`
- (9,20) [sign] → `AncientTomb_EventScript_CaveEntranceSide`

## Flags référencés (5)
- `FLAG_DEFEATED_REGISTEEL`
- `FLAG_HIDE_REGISTEEL`
- `FLAG_LANDMARK_ANCIENT_TOMB`
- `FLAG_SYS_CTRL_OBJ_DELETE`
- `FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_LegendaryFlewAway`
- `Common_EventScript_RemoveStaticPokemon`
- `gText_BigHoleInTheWall`

## Scripts (13)
### AncientTomb_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, AncientTomb_OnResume
map_script MAP_SCRIPT_ON_LOAD, AncientTomb_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, AncientTomb_OnTransition
```
### AncientTomb_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, AncientTomb_EventScript_TryRemoveRegisteel
end
```
### AncientTomb_EventScript_TryRemoveRegisteel
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### AncientTomb_OnTransition
```
setflag FLAG_LANDMARK_ANCIENT_TOMB
call_if_unset FLAG_DEFEATED_REGISTEEL, AncientTomb_EventScript_ShowRegisteel
end
```
### AncientTomb_EventScript_ShowRegisteel
```
clearflag FLAG_HIDE_REGISTEEL
return
```
### AncientTomb_OnLoad
```
call_if_unset FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED, AncientTomb_EventScript_HideRegiEntrance
end
```
### AncientTomb_EventScript_HideRegiEntrance
```
setmetatile 7, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 8, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 9, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 7, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 8, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 9, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
return
```
### AncientTomb_EventScript_CaveEntranceMiddle
```
lockall
goto_if_set FLAG_SYS_REGISTEEL_PUZZLE_COMPLETED, AncientTomb_EventScript_BigHoleInWall
braillemsgbox AncientTomb_Braille_ShineInTheMiddle
releaseall
end
```
### AncientTomb_EventScript_BigHoleInWall
```
msgbox gText_BigHoleInTheWall, MSGBOX_DEFAULT
releaseall
end
```
### AncientTomb_EventScript_CaveEntranceSide
```
lockall
braillemsgbox AncientTomb_Braille_ShineInTheMiddle
releaseall
end
```
### AncientTomb_EventScript_Registeel
```
lock
faceplayer
waitse
playmoncry SPECIES_REGISTEEL, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setwildbattle SPECIES_REGISTEEL, 40
setflag FLAG_SYS_CTRL_OBJ_DELETE
special StartRegiBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, AncientTomb_EventScript_DefeatedRegisteel
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, AncientTomb_EventScript_RanFromRegisteel
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, AncientTomb_EventScript_RanFromRegisteel
setflag FLAG_DEFEATED_REGISTEEL
release
end
```
### AncientTomb_EventScript_DefeatedRegisteel
```
setflag FLAG_DEFEATED_REGISTEEL
goto Common_EventScript_RemoveStaticPokemon
end
```
### AncientTomb_EventScript_RanFromRegisteel
```
setvar VAR_0x8004, SPECIES_REGISTEEL
goto Common_EventScript_LegendaryFlewAway
end
```

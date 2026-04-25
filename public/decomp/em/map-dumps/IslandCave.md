# IslandCave

## Métadonnées
- **id** : `MAP_ISLAND_CAVE`
- **layout** : `LAYOUT_ISLAND_CAVE`
- **music** : `MUS_SEALED_CHAMBER`
- **region_map_section** : `MAPSEC_ISLAND_CAVE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_REGICE` | 8,7 | `MOVEMENT_TYPE_FACE_DOWN` | `IslandCave_EventScript_Regice` | `FLAG_HIDE_REGICE` |

## Warps (3)
- #0 (8,29) → `MAP_ROUTE105` warp #0
- #1 (8,20) → `MAP_ISLAND_CAVE` warp #2
- #2 (8,11) → `MAP_ISLAND_CAVE` warp #1

## BG events / signs (3)
- (8,20) [sign] → `IslandCave_EventScript_CaveEntranceMiddle`
- (7,20) [sign] → `IslandCave_EventScript_CaveEntranceSide`
- (9,20) [sign] → `IslandCave_EventScript_CaveEntranceSide`

## Flags référencés (7)
- `FLAG_DEFEATED_REGICE`
- `FLAG_HIDE_REGICE`
- `FLAG_LANDMARK_ISLAND_CAVE`
- `FLAG_SYS_BRAILLE_REGICE_COMPLETED`
- `FLAG_SYS_CTRL_OBJ_DELETE`
- `FLAG_TEMP_REGICE_PUZZLE_FAILED`
- `FLAG_TEMP_REGICE_PUZZLE_STARTED`

## Variables référencées (6)
- `VAR_0x8004`
- `VAR_LAST_TALKED`
- `VAR_REGICE_STEPS_1`
- `VAR_REGICE_STEPS_2`
- `VAR_REGICE_STEPS_3`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_LegendaryFlewAway`
- `Common_EventScript_RemoveStaticPokemon`
- `gText_BigHoleInTheWall`

## Scripts (16)
### IslandCave_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, IslandCave_OnResume
map_script MAP_SCRIPT_ON_LOAD, IslandCave_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, IslandCave_OnTransition
```
### IslandCave_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, IslandCave_EventScript_TryRemoveRegice
end
```
### IslandCave_EventScript_TryRemoveRegice
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### IslandCave_OnLoad
```
call_if_unset FLAG_SYS_BRAILLE_REGICE_COMPLETED, IslandCave_EventScript_HideRegiEntrance
end
```
### IslandCave_EventScript_HideRegiEntrance
```
setmetatile 7, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 8, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 9, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 7, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 8, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 9, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
return
```
### IslandCave_OnTransition
```
setflag FLAG_LANDMARK_ISLAND_CAVE
call IslandCave_EventScript_ClearSteps
call_if_unset FLAG_DEFEATED_REGICE, IslandCave_EventScript_ShowRegice
end
```
### IslandCave_EventScript_ShowRegice
```
clearflag FLAG_HIDE_REGICE
return
```
### IslandCave_EventScript_OpenRegiEntrance
```
setmetatile 7, 19, METATILE_Cave_SealedChamberEntrance_TopLeft, TRUE
setmetatile 8, 19, METATILE_Cave_SealedChamberEntrance_TopMid, TRUE
setmetatile 9, 19, METATILE_Cave_SealedChamberEntrance_TopRight, TRUE
setmetatile 7, 20, METATILE_Cave_SealedChamberEntrance_BottomLeft, TRUE
setmetatile 8, 20, METATILE_Cave_SealedChamberEntrance_BottomMid, FALSE
setmetatile 9, 20, METATILE_Cave_SealedChamberEntrance_BottomRight, TRUE
special DrawWholeMapView
playse SE_BANG
setflag FLAG_SYS_BRAILLE_REGICE_COMPLETED
end
```
### IslandCave_EventScript_CaveEntranceMiddle
```
lockall
call_if_set FLAG_TEMP_REGICE_PUZZLE_FAILED, IslandCave_EventScript_ClearSteps
goto_if_set FLAG_SYS_BRAILLE_REGICE_COMPLETED, IslandCave_EventScript_BigHoleInWall
braillemessage IslandCave_Braille_RunLapAroundWall
setflag FLAG_TEMP_REGICE_PUZZLE_STARTED
special ShouldDoBrailleRegicePuzzle
goto IslandCave_EventScript_CloseBrailleMsg
end
```
### IslandCave_EventScript_BigHoleInWall
```
msgbox gText_BigHoleInTheWall, MSGBOX_DEFAULT
releaseall
end
```
### IslandCave_EventScript_CaveEntranceSide
```
lockall
call_if_set FLAG_TEMP_REGICE_PUZZLE_FAILED, IslandCave_EventScript_ClearSteps
braillemessage IslandCave_Braille_RunLapAroundWall
goto_if_set FLAG_SYS_BRAILLE_REGICE_COMPLETED, IslandCave_EventScript_CloseBrailleMsg
setflag FLAG_TEMP_REGICE_PUZZLE_STARTED
special ShouldDoBrailleRegicePuzzle
goto IslandCave_EventScript_CloseBrailleMsg
end
```
### IslandCave_EventScript_CloseBrailleMsg
```
waitbuttonpress
closebraillemessage
releaseall
end
```
### IslandCave_EventScript_ClearSteps
```
setvar VAR_REGICE_STEPS_1, 0
setvar VAR_REGICE_STEPS_2, 0
setvar VAR_REGICE_STEPS_3, 0
clearflag FLAG_TEMP_REGICE_PUZZLE_FAILED
return
```
### IslandCave_EventScript_Regice
```
lock
faceplayer
waitse
playmoncry SPECIES_REGICE, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setwildbattle SPECIES_REGICE, 40
setflag FLAG_SYS_CTRL_OBJ_DELETE
special StartRegiBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, IslandCave_EventScript_DefeatedRegice
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, IslandCave_EventScript_RanFromRegice
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, IslandCave_EventScript_RanFromRegice
setflag FLAG_DEFEATED_REGICE
release
end
```
### IslandCave_EventScript_DefeatedRegice
```
setflag FLAG_DEFEATED_REGICE
goto Common_EventScript_RemoveStaticPokemon
end
```
### IslandCave_EventScript_RanFromRegice
```
setvar VAR_0x8004, SPECIES_REGICE
goto Common_EventScript_LegendaryFlewAway
end
```

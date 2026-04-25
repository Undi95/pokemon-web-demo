# DesertRuins

## Métadonnées
- **id** : `MAP_DESERT_RUINS`
- **layout** : `LAYOUT_DESERT_RUINS`
- **music** : `MUS_SEALED_CHAMBER`
- **region_map_section** : `MAPSEC_DESERT_RUINS`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_REGIROCK` | 8,7 | `MOVEMENT_TYPE_FACE_DOWN` | `DesertRuins_EventScript_Regirock` | `FLAG_HIDE_REGIROCK` |

## Warps (3)
- #0 (8,29) → `MAP_ROUTE111` warp #1
- #1 (8,20) → `MAP_DESERT_RUINS` warp #2
- #2 (8,11) → `MAP_DESERT_RUINS` warp #1

## BG events / signs (3)
- (8,20) [sign] → `DesertRuins_EventScript_CaveEntranceMiddle`
- (7,20) [sign] → `DesertRuins_EventScript_CaveEntranceSide`
- (9,20) [sign] → `DesertRuins_EventScript_CaveEntranceSide`

## Flags référencés (5)
- `FLAG_DEFEATED_REGIROCK`
- `FLAG_HIDE_REGIROCK`
- `FLAG_LANDMARK_DESERT_RUINS`
- `FLAG_SYS_CTRL_OBJ_DELETE`
- `FLAG_SYS_REGIROCK_PUZZLE_COMPLETED`

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
### DesertRuins_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, DesertRuins_OnResume
map_script MAP_SCRIPT_ON_LOAD, DesertRuins_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, DesertRuins_OnTransition
```
### DesertRuins_OnResume
```
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, DesertRuins_EventScript_TryRemoveRegirock
end
```
### DesertRuins_EventScript_TryRemoveRegirock
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### DesertRuins_OnLoad
```
call_if_unset FLAG_SYS_REGIROCK_PUZZLE_COMPLETED, DesertRuins_EventScript_HideRegiEntrance
end
```
### DesertRuins_EventScript_HideRegiEntrance
```
setmetatile 7, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 8, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 9, 19, METATILE_Cave_EntranceCover, TRUE
setmetatile 7, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 8, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
setmetatile 9, 20, METATILE_Cave_SealedChamberBraille_Mid, TRUE
return
```
### DesertRuins_OnTransition
```
setflag FLAG_LANDMARK_DESERT_RUINS
call_if_unset FLAG_DEFEATED_REGIROCK, DesertRuins_EventScript_ShowRegirock
end
```
### DesertRuins_EventScript_ShowRegirock
```
clearflag FLAG_HIDE_REGIROCK
return
```
### DesertRuins_EventScript_CaveEntranceMiddle
```
lockall
goto_if_set FLAG_SYS_REGIROCK_PUZZLE_COMPLETED, DesertRuins_EventScript_BigHoleInWall
braillemsgbox DesertRuins_Braille_UseRockSmash
releaseall
end
```
### DesertRuins_EventScript_BigHoleInWall
```
msgbox gText_BigHoleInTheWall, MSGBOX_DEFAULT
releaseall
end
```
### DesertRuins_EventScript_CaveEntranceSide
```
lockall
braillemsgbox DesertRuins_Braille_UseRockSmash
releaseall
end
```
### DesertRuins_EventScript_Regirock
```
lock
faceplayer
waitse
playmoncry SPECIES_REGIROCK, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setwildbattle SPECIES_REGIROCK, 40
setflag FLAG_SYS_CTRL_OBJ_DELETE
special StartRegiBattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, DesertRuins_EventScript_DefeatedRegirock
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, DesertRuins_EventScript_RanFromRegirock
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, DesertRuins_EventScript_RanFromRegirock
setflag FLAG_DEFEATED_REGIROCK
release
end
```
### DesertRuins_EventScript_DefeatedRegirock
```
setflag FLAG_DEFEATED_REGIROCK
goto Common_EventScript_RemoveStaticPokemon
end
```
### DesertRuins_EventScript_RanFromRegirock
```
setvar VAR_0x8004, SPECIES_REGIROCK
goto Common_EventScript_LegendaryFlewAway
end
```

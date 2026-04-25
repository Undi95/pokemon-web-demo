# NewMauville_Inside

## Métadonnées
- **id** : `MAP_NEW_MAUVILLE_INSIDE`
- **layout** : `LAYOUT_NEW_MAUVILLE_INSIDE`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_NEW_MAUVILLE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 32,25 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_ItemUltraBall` | `FLAG_ITEM_NEW_MAUVILLE_ULTRA_BALL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 16,22 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_ItemEscapeRope` | `FLAG_ITEM_NEW_MAUVILLE_ESCAPE_ROPE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 39,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_ItemThunderStone` | `FLAG_ITEM_NEW_MAUVILLE_THUNDER_STONE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 17,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_ItemFullHeal` | `FLAG_ITEM_NEW_MAUVILLE_FULL_HEAL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 2,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_ItemParalyzeHeal` | `FLAG_ITEM_NEW_MAUVILLE_PARALYZE_HEAL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 25,18 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_Voltorb1` | `FLAG_HIDE_NEW_MAUVILLE_VOLTORB_1` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 6,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_Voltorb2` | `FLAG_HIDE_NEW_MAUVILLE_VOLTORB_2` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 13,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `NewMauville_Inside_EventScript_Voltorb3` | `FLAG_HIDE_NEW_MAUVILLE_VOLTORB_3` |

## Warps (1)
- #0 (32,33) → `MAP_NEW_MAUVILLE_ENTRANCE` warp #1

## Coord events / triggers (10)
- (30,38) → `NewMauville_Inside_EventScript_BlueButton` (si `VAR_TEMP_1` == `0`)
- (18,36) → `NewMauville_Inside_EventScript_GreenButton` (si `VAR_TEMP_2` == `0`)
- (4,26) → `NewMauville_Inside_EventScript_BlueButton` (si `VAR_TEMP_1` == `0`)
- (16,22) → `NewMauville_Inside_EventScript_BlueButton` (si `VAR_TEMP_1` == `0`)
- (25,18) → `NewMauville_Inside_EventScript_GreenButton` (si `VAR_TEMP_2` == `0`)
- (2,11) → `NewMauville_Inside_EventScript_GreenButton` (si `VAR_TEMP_2` == `0`)
- (6,11) → `NewMauville_Inside_EventScript_BlueButton` (si `VAR_TEMP_1` == `0`)
- (13,10) → `NewMauville_Inside_EventScript_BlueButton` (si `VAR_TEMP_1` == `0`)
- (17,10) → `NewMauville_Inside_EventScript_GreenButton` (si `VAR_TEMP_2` == `0`)
- (33,6) → `NewMauville_Inside_EventScript_RedButton` (si `VAR_NEW_MAUVILLE_STATE` == `1`)

## BG events / signs (8)
- (32,4) [sign] → `NewMauville_Inside_EventScript_Generator`
- (32,3) [sign] → `NewMauville_Inside_EventScript_Generator`
- (32,2) [sign] → `NewMauville_Inside_EventScript_Generator`
- (33,4) [sign] → `NewMauville_Inside_EventScript_Generator`
- (34,4) [sign] → `NewMauville_Inside_EventScript_Generator`
- (35,4) [sign] → `NewMauville_Inside_EventScript_Generator`
- (35,3) [sign] → `NewMauville_Inside_EventScript_Generator`
- (35,2) [sign] → `NewMauville_Inside_EventScript_Generator`

## Flags référencés (7)
- `FLAG_DEFEATED_VOLTORB_1_NEW_MAUVILLE`
- `FLAG_DEFEATED_VOLTORB_2_NEW_MAUVILLE`
- `FLAG_DEFEATED_VOLTORB_3_NEW_MAUVILLE`
- `FLAG_HIDE_NEW_MAUVILLE_VOLTORB_1`
- `FLAG_HIDE_NEW_MAUVILLE_VOLTORB_2`
- `FLAG_HIDE_NEW_MAUVILLE_VOLTORB_3`
- `FLAG_SYS_CTRL_OBJ_DELETE`

## Variables référencées (5)
- `VAR_LAST_TALKED`
- `VAR_NEW_MAUVILLE_STATE`
- `VAR_RESULT`
- `VAR_TEMP_1`
- `VAR_TEMP_2`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_RemoveStaticPokemon`

## Scripts (22)
### NewMauville_Inside_MapScripts
```
map_script MAP_SCRIPT_ON_RESUME, NewMauville_Inside_OnResume
map_script MAP_SCRIPT_ON_TRANSITION, NewMauville_Inside_OnTransition
map_script MAP_SCRIPT_ON_LOAD, NewMauville_Inside_OnLoad
```
### NewMauville_Inside_OnResume
```
call_if_eq VAR_TEMP_1, 1, NewMauville_Inside_EventScript_SetBarrierStateBlueButton
call_if_eq VAR_TEMP_2, 1, NewMauville_Inside_EventScript_SetBarrierStateGreenButton
call_if_set FLAG_SYS_CTRL_OBJ_DELETE, NewMauville_Inside_EventScript_TryRemoveVoltorb
end
```
### NewMauville_Inside_EventScript_TryRemoveVoltorb
```
specialvar VAR_RESULT, GetBattleOutcome
goto_if_ne VAR_RESULT, B_OUTCOME_CAUGHT, Common_EventScript_NopReturn
removeobject VAR_LAST_TALKED
return
```
### NewMauville_Inside_OnTransition
```
setvar VAR_TEMP_1, 0
setvar VAR_TEMP_2, 0
call_if_unset FLAG_DEFEATED_VOLTORB_1_NEW_MAUVILLE, NewMauville_Inside_EventScript_ShowVoltorb1
call_if_unset FLAG_DEFEATED_VOLTORB_2_NEW_MAUVILLE, NewMauville_Inside_EventScript_ShowVoltorb2
call_if_unset FLAG_DEFEATED_VOLTORB_3_NEW_MAUVILLE, NewMauville_Inside_EventScript_ShowVoltorb3
end
```
### NewMauville_Inside_EventScript_ShowVoltorb1
```
clearflag FLAG_HIDE_NEW_MAUVILLE_VOLTORB_1
return
```
### NewMauville_Inside_EventScript_ShowVoltorb2
```
clearflag FLAG_HIDE_NEW_MAUVILLE_VOLTORB_2
return
```
### NewMauville_Inside_EventScript_ShowVoltorb3
```
clearflag FLAG_HIDE_NEW_MAUVILLE_VOLTORB_3
return
```
### NewMauville_Inside_OnLoad
```
call_if_eq VAR_NEW_MAUVILLE_STATE, 2, NewMauville_Inside_EventScript_SetGeneratorOffMetatiles
end
```
### NewMauville_Inside_EventScript_BlueButton
```
lockall
setvar VAR_TEMP_1, 1
setvar VAR_TEMP_2, 0
playse SE_PIN
call NewMauville_Inside_EventScript_SetBarrierStateBlueButton
special DrawWholeMapView
releaseall
end
```
### NewMauville_Inside_EventScript_GreenButton
```
lockall
setvar VAR_TEMP_1, 0
setvar VAR_TEMP_2, 1
playse SE_PIN
call NewMauville_Inside_EventScript_SetBarrierStateGreenButton
special DrawWholeMapView
releaseall
end
```
### NewMauville_Inside_EventScript_SetBarrierStateBlueButton
```
setmetatile 23, 34, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 23, 35, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 23, 36, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 23, 37, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 10, 16, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 10, 17, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 10, 18, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 10, 19, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 10, 0, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 10, 1, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 10, 2, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 10, 3, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 37, 33, METATILE_BikeShop_Barrier_Green_Top, TRUE
setmetatile 37, 34, METATILE_BikeShop_Barrier_Green_TopMid, TRUE
setmetatile 37, 35, METATILE_BikeShop_Barrier_Green_BottomMid, TRUE
setmetatile 37, 36, METATILE_BikeShop_Barrier_Green_Bottom, TRUE
setmetatile 28, 22, METATILE_BikeShop_Barrier_Green_Top, TRUE
setmetatile 28, 23, METATILE_BikeShop_Barrier_Green_TopMid, TRUE
setmetatile 28, 24, METATILE_BikeShop_Barrier_Green_BottomMid, TRUE
setmetatile 28, 25, METATILE_BikeShop_Barrier_Green_Bottom, TRUE
setmetatile 10, 24, METATILE_BikeShop_Barrier_Green_Top, TRUE
setmetatile 10, 25, METATILE_BikeShop_Barrier_Green_TopMid, TRUE
setmetatile 10, 26, METATILE_BikeShop_Barrier_Green_BottomMid, TRUE
setmetatile 10, 27, METATILE_BikeShop_Barrier_Green_Bottom, TRUE
setmetatile 21, 2, METATILE_BikeShop_Barrier_Green_Top, TRUE
setmetatile 21, 3, METATILE_BikeShop_Barrier_Green_TopMid, TRUE
setmetatile 21, 4, METATILE_BikeShop_Barrier_Green_BottomMid, TRUE
setmetatile 21, 5, METATILE_BikeShop_Barrier_Green_Bottom, TRUE
setmetatile 6, 11, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 13, 10, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 16, 22, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 4, 26, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 30, 38, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 2, 11, METATILE_BikeShop_Button_Green, FALSE
setmetatile 17, 10, METATILE_BikeShop_Button_Green, FALSE
setmetatile 25, 18, METATILE_BikeShop_Button_Green, FALSE
setmetatile 18, 36, METATILE_BikeShop_Button_Green, FALSE
return
```
### NewMauville_Inside_EventScript_SetBarrierStateGreenButton
```
setmetatile 23, 34, METATILE_BikeShop_Barrier_Blue_Top, TRUE
setmetatile 23, 35, METATILE_BikeShop_Barrier_Blue_TopMid, TRUE
setmetatile 23, 36, METATILE_BikeShop_Barrier_Blue_BottomMid, TRUE
setmetatile 23, 37, METATILE_BikeShop_Barrier_Blue_Bottom, TRUE
setmetatile 10, 16, METATILE_BikeShop_Barrier_Blue_Top, TRUE
setmetatile 10, 17, METATILE_BikeShop_Barrier_Blue_TopMid, TRUE
setmetatile 10, 18, METATILE_BikeShop_Barrier_Blue_BottomMid, TRUE
setmetatile 10, 19, METATILE_BikeShop_Barrier_Blue_Bottom, TRUE
setmetatile 10, 0, METATILE_BikeShop_Barrier_Blue_Top, TRUE
setmetatile 10, 1, METATILE_BikeShop_Barrier_Blue_TopMid, TRUE
setmetatile 10, 2, METATILE_BikeShop_Barrier_Blue_BottomMid, TRUE
setmetatile 10, 3, METATILE_BikeShop_Barrier_Blue_Bottom, TRUE
setmetatile 37, 33, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 37, 34, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 37, 35, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 37, 36, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 28, 22, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 28, 23, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 28, 24, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 28, 25, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 10, 24, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 10, 25, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 10, 26, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 10, 27, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 21, 2, METATILE_BikeShop_Barrier_Hidden_Top, TRUE
setmetatile 21, 3, METATILE_BikeShop_Barrier_Hidden_Bottom, TRUE
setmetatile 21, 4, METATILE_BikeShop_Floor_Shadow_Top, FALSE
setmetatile 21, 5, METATILE_BikeShop_Wall_Edge_Top, FALSE
setmetatile 2, 11, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 17, 10, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 25, 18, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 18, 36, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 6, 11, METATILE_BikeShop_Button_Blue, FALSE
setmetatile 13, 10, METATILE_BikeShop_Button_Blue, FALSE
setmetatile 16, 22, METATILE_BikeShop_Button_Blue, FALSE
setmetatile 4, 26, METATILE_BikeShop_Button_Blue, FALSE
setmetatile 30, 38, METATILE_BikeShop_Button_Blue, FALSE
return
```
### NewMauville_Inside_EventScript_RedButton
```
lockall
msgbox NewMauville_Inside_Text_SteppedOnSwitchGeneratorStopped, MSGBOX_DEFAULT
call NewMauville_Inside_EventScript_SetGeneratorOffMetatiles
setvar VAR_NEW_MAUVILLE_STATE, 2
releaseall
end
```
### NewMauville_Inside_EventScript_SetGeneratorOffMetatiles
```
setmetatile 33, 6, METATILE_BikeShop_Button_Pressed, FALSE
setmetatile 32, 2, METATILE_BikeShop_Generator_Off_Tile0, TRUE
setmetatile 33, 2, METATILE_BikeShop_Generator_Off_Tile1, TRUE
setmetatile 34, 2, METATILE_BikeShop_Generator_Off_Tile2, TRUE
setmetatile 35, 2, METATILE_BikeShop_Generator_Off_Tile3, TRUE
setmetatile 32, 3, METATILE_BikeShop_Generator_Off_Tile4, TRUE
setmetatile 33, 3, METATILE_BikeShop_Generator_Off_Tile5, TRUE
setmetatile 34, 3, METATILE_BikeShop_Generator_Off_Tile6, TRUE
setmetatile 35, 3, METATILE_BikeShop_Generator_Off_Tile7, TRUE
special DrawWholeMapView
return
```
### NewMauville_Inside_EventScript_Generator
```
lockall
goto_if_eq VAR_NEW_MAUVILLE_STATE, 2, NewMauville_Inside_EventScript_GeneratorOff
msgbox NewMauville_Inside_Text_GeneratorRadiatingHeat, MSGBOX_DEFAULT
releaseall
end
```
### NewMauville_Inside_EventScript_GeneratorOff
```
msgbox NewMauville_Inside_Text_GeneratorQuietedDown, MSGBOX_DEFAULT
releaseall
end
```
### NewMauville_Inside_EventScript_Voltorb1
```
lock
faceplayer
setwildbattle SPECIES_VOLTORB, 25
waitse
playmoncry SPECIES_VOLTORB, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setflag FLAG_SYS_CTRL_OBJ_DELETE
dowildbattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, NewMauville_Inside_EventScript_DefeatedVoltorb1
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, NewMauville_Inside_EventScript_DefeatedVoltorb1
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, NewMauville_Inside_EventScript_DefeatedVoltorb1
setflag FLAG_DEFEATED_VOLTORB_1_NEW_MAUVILLE
release
end
```
### NewMauville_Inside_EventScript_DefeatedVoltorb1
```
setflag FLAG_DEFEATED_VOLTORB_1_NEW_MAUVILLE
goto Common_EventScript_RemoveStaticPokemon
end
```
### NewMauville_Inside_EventScript_Voltorb2
```
lock
faceplayer
setwildbattle SPECIES_VOLTORB, 25
waitse
playmoncry SPECIES_VOLTORB, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setflag FLAG_SYS_CTRL_OBJ_DELETE
dowildbattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, NewMauville_Inside_EventScript_DefeatedVoltorb2
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, NewMauville_Inside_EventScript_DefeatedVoltorb2
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, NewMauville_Inside_EventScript_DefeatedVoltorb2
setflag FLAG_DEFEATED_VOLTORB_2_NEW_MAUVILLE
release
end
```
### NewMauville_Inside_EventScript_DefeatedVoltorb2
```
setflag FLAG_DEFEATED_VOLTORB_2_NEW_MAUVILLE
goto Common_EventScript_RemoveStaticPokemon
end
```
### NewMauville_Inside_EventScript_Voltorb3
```
lock
faceplayer
setwildbattle SPECIES_VOLTORB, 25
waitse
playmoncry SPECIES_VOLTORB, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
setflag FLAG_SYS_CTRL_OBJ_DELETE
dowildbattle
clearflag FLAG_SYS_CTRL_OBJ_DELETE
specialvar VAR_RESULT, GetBattleOutcome
goto_if_eq VAR_RESULT, B_OUTCOME_WON, NewMauville_Inside_EventScript_DefeatedVoltorb3
goto_if_eq VAR_RESULT, B_OUTCOME_RAN, NewMauville_Inside_EventScript_DefeatedVoltorb3
goto_if_eq VAR_RESULT, B_OUTCOME_PLAYER_TELEPORTED, NewMauville_Inside_EventScript_DefeatedVoltorb3
setflag FLAG_DEFEATED_VOLTORB_3_NEW_MAUVILLE
release
end
```
### NewMauville_Inside_EventScript_DefeatedVoltorb3
```
setflag FLAG_DEFEATED_VOLTORB_3_NEW_MAUVILLE
goto Common_EventScript_RemoveStaticPokemon
end
```

## Textes (3)
### NewMauville_Inside_Text_GeneratorRadiatingHeat
```
Le générateur émet de la chaleur\nque l'on peut sentir, même à distance.\pIl faudrait sûrement l'éteindre\nau plus vite.$
```
### NewMauville_Inside_Text_GeneratorQuietedDown
```
Le générateur ralentit.$
```
### NewMauville_Inside_Text_SteppedOnSwitchGeneratorStopped
```
{PLAYER} marche sur l'interrupteur.\pClic…\p… … … … … … … …\n… … … … … … … …\pLe générateur semble s'être\narrêté…$
```

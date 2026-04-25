# Route111

## Métadonnées
- **id** : `MAP_ROUTE111`
- **layout** : `LAYOUT_ROUTE111`
- **music** : `MUS_ROUTE110`
- **region_map_section** : `MAPSEC_ROUTE_111`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- down (offset 0) → `MAP_MAUVILLE_CITY`
- left (offset 0) → `MAP_ROUTE113`
- left (offset 20) → `MAP_ROUTE112`

## Object events (46 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_ROUTE111_VICTOR` | `OBJ_EVENT_GFX_MAN_1` | 13,114 | `MOVEMENT_TYPE_FACE_DOWN` | `Route111_EventScript_Victor` | `FLAG_HIDE_ROUTE_111_VICTOR_WINSTRATE` |
| `LOCALID_ROUTE111_VICTORIA` | `OBJ_EVENT_GFX_POKEFAN_F` | 13,113 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_111_VICTORIA_WINSTRATE` |
| `LOCALID_ROUTE111_VIVI` | `OBJ_EVENT_GFX_LASS` | 13,113 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_111_VIVI_WINSTRATE` |
| `LOCALID_ROUTE111_VICKY` | `OBJ_EVENT_GFX_EXPERT_F` | 13,113 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_111_VICKY_WINSTRATE` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 28,51 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route111_EventScript_Heidi` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 22,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 23,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 8,91 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route111_EventScript_Man1` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 29,37 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route111_EventScript_Drew` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 27,69 | `MOVEMENT_TYPE_WALK_SEQUENCE_DOWN_LEFT_UP_RIGHT` | `Route111_EventScript_Dusty` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 21,47 | `MOVEMENT_TYPE_FACE_LEFT` | `Route111_EventScript_Beau` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 32,66 | `MOVEMENT_TYPE_ROTATE_CLOCKWISE` | `Route111_EventScript_Becky` | `0` |
| `LOCALID_ROUTE111_TY_1` | `OBJ_EVENT_GFX_CAMERAMAN` | 14,86 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle1` | `FLAG_HIDE_ROUTE_111_GABBY_AND_TY_1` |
| `LOCALID_ROUTE111_GABBY_1` | `OBJ_EVENT_GFX_REPORTER_F` | 13,86 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle1` | `FLAG_HIDE_ROUTE_111_GABBY_AND_TY_1` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 18,101 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 19,100 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_GIRL_1` | 23,8 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route111_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 33,104 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route111_EventScript_ItemTMSandstorm` | `FLAG_ITEM_ROUTE_111_TM_SANDSTORM` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 18,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 19,5 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `LOCALID_ROUTE111_GABBY_2` | `OBJ_EVENT_GFX_REPORTER_F` | 13,86 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle4` | `FLAG_HIDE_ROUTE_111_GABBY_AND_TY_2` |
| `LOCALID_ROUTE111_TY_2` | `OBJ_EVENT_GFX_CAMERAMAN` | 14,86 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle4` | `FLAG_HIDE_ROUTE_111_GABBY_AND_TY_2` |
| `LOCALID_ROUTE111_GABBY_3` | `OBJ_EVENT_GFX_REPORTER_F` | 13,86 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_GabbyBattle6` | `FLAG_HIDE_ROUTE_111_GABBY_AND_TY_3` |
| `LOCALID_ROUTE111_TY_3` | `OBJ_EVENT_GFX_CAMERAMAN` | 14,86 | `MOVEMENT_TYPE_FACE_DOWN` | `GabbyAndTy_EventScript_TyBattle6` | `FLAG_HIDE_ROUTE_111_GABBY_AND_TY_3` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 12,54 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route111_EventScript_ItemStardust` | `FLAG_ITEM_ROUTE_111_STARDUST` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,114 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route111_EventScript_ItemHPUp` | `FLAG_ITEM_ROUTE_111_HP_UP` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 22,21 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 10,82 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route111_EventScript_Irene` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 11,71 | `MOVEMENT_TYPE_FACE_DOWN_LEFT_AND_RIGHT` | `Route111_EventScript_Travis` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 32,29 | `MOVEMENT_TYPE_WALK_RIGHT_AND_LEFT` | `Route111_EventScript_Daisuke` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 11,11 | `MOVEMENT_TYPE_FACE_UP` | `Route111_EventScript_Brooke` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 9,27 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route111_EventScript_Wilton` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 13,20 | `MOVEMENT_TYPE_FACE_UP` | `Route111_EventScript_SecretPowerMan` | `FLAG_HIDE_ROUTE_111_SECRET_POWER_MAN` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 20,114 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route111_EventScript_Man2` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 26,132 | `MOVEMENT_TYPE_FACE_LEFT` | `Route111_EventScript_Tyron` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 20,132 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route111_EventScript_Celina` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 19,121 | `MOVEMENT_TYPE_FACE_UP` | `Route111_EventScript_Bianca` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 16,119 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route111_EventScript_Hayden` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 29,77 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `Route111_EventScript_Bryan` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 22,77 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route111_EventScript_Celia` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 37,77 | `MOVEMENT_TYPE_FACE_LEFT` | `Route111_EventScript_Branden` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 19,118 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route111_EventScript_ItemElixir` | `FLAG_ITEM_ROUTE_111_ELIXIR` |
| `` | `OBJ_EVENT_GFX_HIKER` | 14,56 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `Route111_EventScript_Hiker` | `0` |
| `` | `OBJ_EVENT_GFX_FOSSIL` | 20,53 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_111_DESERT_FOSSIL` |
| `LOCALID_ROUTE111_PLAYER_FALLING` | `OBJ_EVENT_GFX_VAR_0` | 19,53 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_ROUTE_111_PLAYER_DESCENT` |
| `LOCALID_ROUTE111_ROCK_SMASH_MAN` | `OBJ_EVENT_GFX_FAT_MAN` | 19,101 | `MOVEMENT_TYPE_FACE_UP` | `Route111_EventScript_RockSmashTipFatMan` | `FLAG_HIDE_ROUTE_111_ROCK_SMASH_TIP_GUY` |

## Warps (5)
- #0 (13,113) → `MAP_ROUTE111_WINSTRATE_FAMILYS_HOUSE` warp #0
- #1 (29,87) → `MAP_DESERT_RUINS` warp #0
- #2 (26,18) → `MAP_ROUTE111_OLD_LADYS_REST_STOP` warp #0
- #3 (19,58) → `MAP_MIRAGE_TOWER_1F` warp #0
- #4 (31,113) → `MAP_TRAINER_HILL_ENTRANCE` warp #0

## Coord events / triggers (34)
- (12,62) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (11,61) → `Route111_EventScript_ViciousSandstormTriggerDown` (si `VAR_TEMP_3` == `0`)
- (12,61) → `Route111_EventScript_ViciousSandstormTriggerDown` (si `VAR_TEMP_3` == `0`)
- (13,61) → `Route111_EventScript_ViciousSandstormTriggerDown` (si `VAR_TEMP_3` == `0`)
- (7,63) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (12,44) → `Route111_EventScript_ViciousSandstormTriggerLeft` (si `VAR_TEMP_3` == `0`)
- (13,43) → `Route111_EventScript_ViciousSandstormTriggerLeft` (si `VAR_TEMP_3` == `0`)
- (14,42) → `Route111_EventScript_ViciousSandstormTriggerLeft` (si `VAR_TEMP_3` == `0`)
- (16,40) → `Route111_EventScript_ViciousSandstormTriggerLeft` (si `VAR_TEMP_3` == `0`)
- (14,61) → `Route111_EventScript_ViciousSandstormTriggerDown` (si `VAR_TEMP_3` == `0`)
- (18,32) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (17,31) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (9,37) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (10,36) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (17,39) → `Route111_EventScript_ViciousSandstormTriggerLeft` (si `VAR_TEMP_3` == `0`)
- (18,38) → `Route111_EventScript_ViciousSandstormTriggerLeft` (si `VAR_TEMP_3` == `0`)
- (8,64) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (9,65) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (10,65) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (11,66) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (12,67) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (13,68) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (14,69) → `Route111_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (10,61) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (11,62) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (13,62) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (14,62) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (17,38) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (16,39) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (15,40) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (14,41) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (13,42) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (12,43) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (11,44) → `Route111_EventScript_SandstormTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)

## BG events / signs (18)
- (16,114) [sign] → `Route111_EventScript_WinstrateHouseSign`
- (24,126) [sign] → `Route111_EventScript_RouteSignMauville`
- (7,66) [sign] → `Route111_EventScript_RouteSign112`
- (13,6) [sign] → `Route111_EventScript_RouteSign113`
- (24,36) [secret_base] → ``
- (34,50) [secret_base] → ``
- (33,34) [secret_base] → ``
- (25,19) [sign] → `Route111_EventScript_OldLadysRestStopSign`
- (35,1) [secret_base] → ``
- (35,31) [secret_base] → ``
- (26,70) [hidden_item] → ``
- (27,27) [secret_base] → ``
- (7,84) [sign] → `Route111_EventScript_TrainerTipsSpAtkSpDef`
- (14,19) [secret_base] → ``
- (13,19) [secret_base] → ``
- (19,55) [hidden_item] → ``
- (35,66) [hidden_item] → ``
- (24,116) [sign] → `Route111_EventScript_TrainerHillSign`

## Flags référencés (10)
- `FLAG_CHOSE_CLAW_FOSSIL`
- `FLAG_DAILY_ROUTE_111_RECEIVED_BERRY`
- `FLAG_HIDE_DESERT_UNDERPASS_FOSSIL`
- `FLAG_HIDE_ROUTE_111_VICKY_WINSTRATE`
- `FLAG_HIDE_ROUTE_111_VICTORIA_WINSTRATE`
- `FLAG_HIDE_ROUTE_111_VICTOR_WINSTRATE`
- `FLAG_HIDE_ROUTE_111_VIVI_WINSTRATE`
- `FLAG_LANDMARK_WINSTRATE_FAMILY`
- `FLAG_MIRAGE_TOWER_VISIBLE`
- `FLAG_REGI_DOORS_OPENED`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_MIRAGE_TOWER_STATE`
- `VAR_OBJ_GFX_ID_0`
- `VAR_RESULT`
- `VAR_TEMP_0`
- `VAR_TEMP_1`
- `VAR_TEMP_3`
- `VAR_TRAINER_HILL_IS_ACTIVE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route111_Text_BeauPostBattle`
- `Route111_Text_BeckyPostBattle`
- `Route111_Text_BiancaPostBattle`
- `Route111_Text_BrandenPostBattle`
- `Route111_Text_BrookePostBattle`
- `Route111_Text_BrookePostRematch`
- `Route111_Text_BrookeRegister`
- `Route111_Text_BryanPostBattle`
- `Route111_Text_CeliaPostBattle`
- `Route111_Text_CelinaPostBattle`
- `Route111_Text_DaisukePostBattle`
- `Route111_Text_DrewPostBattle`
- `Route111_Text_DustyPostBattle`
- `Route111_Text_DustyPostRematch`
- `Route111_Text_DustyRegister`
- `Route111_Text_GoingToTryToMakeDifferentColorBerries`
- `Route111_Text_HaydenPostBattle`
- `Route111_Text_HeidiPostBattle`
- `Route111_Text_IrenePostBattle`
- `Route111_Text_TravisPostBattle`
- `Route111_Text_TyronPostBattle`
- `Route111_Text_WateredPlantsEveryDayTakeBerry`
- `Route111_Text_WhatColorBerriesToLookForToday`
- `Route111_Text_WiltonPostBattle`
- `Route111_Text_WiltonPostRematch`
- `Route111_Text_WiltonRegister`
- `gText_SandstormIsVicious`
### data/scripts/gabby_and_ty.inc
- `GabbyAndTy_EventScript_UpdateLocation`

## Scripts (82)
### Route111_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, Route111_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, Route111_OnTransition
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, Route111_OnWarp
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route111_OnFrame
```
### Route111_OnLoad
```
call_if_unset FLAG_REGI_DOORS_OPENED, Route111_EventScript_CloseDesertRuins
call_if_eq VAR_MIRAGE_TOWER_STATE, 1, Route111_EventScript_ShowTemporaryMirageTower
end
```
### Route111_EventScript_CloseDesertRuins
```
setmetatile 29, 86, METATILE_General_RockWall_RockBase, TRUE
setmetatile 29, 87, METATILE_General_RockWall_SandBase, TRUE
return
```
### Route111_EventScript_ShowTemporaryMirageTower
```
setmetatile 18, 53, METATILE_Mauville_MirageTower_Tile0, FALSE
setmetatile 19, 53, METATILE_Mauville_MirageTower_Tile1, FALSE
setmetatile 20, 53, METATILE_Mauville_MirageTower_Tile2, FALSE
setmetatile 18, 54, METATILE_Mauville_MirageTower_Tile3, FALSE
setmetatile 19, 54, METATILE_Mauville_MirageTower_Tile4, FALSE
setmetatile 20, 54, METATILE_Mauville_MirageTower_Tile5, FALSE
setmetatile 18, 55, METATILE_Mauville_MirageTower_Tile6, FALSE
setmetatile 19, 55, METATILE_Mauville_MirageTower_Tile7, FALSE
setmetatile 20, 55, METATILE_Mauville_MirageTower_Tile8, FALSE
setmetatile 18, 56, METATILE_Mauville_MirageTower_Tile9, FALSE
setmetatile 19, 56, METATILE_Mauville_MirageTower_TileA, FALSE
setmetatile 20, 56, METATILE_Mauville_MirageTower_TileB, FALSE
setmetatile 18, 57, METATILE_Mauville_MirageTower_TileC, FALSE
setmetatile 19, 57, METATILE_Mauville_MirageTower_TileD, FALSE
setmetatile 20, 57, METATILE_Mauville_MirageTower_TileE, FALSE
setmetatile 18, 58, METATILE_Mauville_MirageTower_TileF, FALSE
setmetatile 19, 58, METATILE_Mauville_MirageTower_Tile10, FALSE
setmetatile 20, 58, METATILE_Mauville_MirageTower_Tile11, FALSE
return
```
### Route111_OnTransition
```
setvar VAR_TRAINER_HILL_IS_ACTIVE, 0
special SetMirageTowerVisibility
call_if_unset FLAG_MIRAGE_TOWER_VISIBLE, Route111_EventScript_SetLayoutNoMirageTower
call_if_eq VAR_MIRAGE_TOWER_STATE, 1, Route111_EventScript_SetFallingPlayerGfx
call_if_eq VAR_MIRAGE_TOWER_STATE, 2, Route111_EventScript_SetMirageTowerGone
call Route111_EventScript_CheckSetSandstorm
call GabbyAndTy_EventScript_UpdateLocation
goto_if_not_defeated TRAINER_VICKY, Route111_EventScript_SetWinstratesNotDefeated
end
```
### Route111_EventScript_SetFallingPlayerGfx
```
checkplayergender
goto_if_eq VAR_RESULT, MALE, Route111_EventScript_SetFallingPlayerGfxMale
goto_if_eq VAR_RESULT, FEMALE, Route111_EventScript_SetFallingPlayerGfxFemale
return
```
### Route111_EventScript_SetFallingPlayerGfxMale
```
setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_BRENDAN_NORMAL
return
```
### Route111_EventScript_SetFallingPlayerGfxFemale
```
setvar VAR_OBJ_GFX_ID_0, OBJ_EVENT_GFX_RIVAL_MAY_NORMAL
return
```
### Route111_EventScript_CheckSetSandstorm
```
getplayerxy VAR_TEMP_0, VAR_TEMP_1
goto_if_lt VAR_TEMP_1, 34, Route111_EventScript_EndCheckSetSandstorm
goto_if_gt VAR_TEMP_1, 107, Route111_EventScript_EndCheckSetSandstorm
goto_if_gt VAR_TEMP_1, 72, Route111_EventScript_SetSandstorm
goto_if_gt VAR_TEMP_0, 2000, Route111_EventScript_EndCheckSetSandstorm
goto_if_lt VAR_TEMP_0, 8, Route111_EventScript_EndCheckSetSandstorm
```
### Route111_EventScript_SetSandstorm
```
setweather WEATHER_SANDSTORM
```
### Route111_EventScript_EndCheckSetSandstorm
```
return
```
### Route111_EventScript_SetWinstratesNotDefeated
```
clearflag FLAG_HIDE_ROUTE_111_VICTOR_WINSTRATE
setflag FLAG_HIDE_ROUTE_111_VICTORIA_WINSTRATE
setflag FLAG_HIDE_ROUTE_111_VIVI_WINSTRATE
setflag FLAG_HIDE_ROUTE_111_VICKY_WINSTRATE
cleartrainerflag TRAINER_VICTOR
cleartrainerflag TRAINER_VICTORIA
cleartrainerflag TRAINER_VIVI
end
```
### Route111_EventScript_SetLayoutNoMirageTower
```
setmaplayoutindex LAYOUT_ROUTE111_NO_MIRAGE_TOWER
return
```
### Route111_EventScript_SetMirageTowerGone
```
setvar VAR_MIRAGE_TOWER_STATE, 3
return
```
### Route111_OnWarp
```
map_script_2 VAR_MIRAGE_TOWER_STATE, 1, Route111_EventScript_HidePlayerForMirageTower
```
### Route111_EventScript_HidePlayerForMirageTower
```
hideobjectat LOCALID_PLAYER, MAP_LITTLEROOT_TOWN
end
```
### Route111_OnFrame
```
map_script_2 VAR_MIRAGE_TOWER_STATE, 1, Route111_EventScript_MirageTowerDisappear
```
### Route111_EventScript_MirageTowerDisappear
```
lockall
special StartMirageTowerShake
delay 24
playse SE_FALL
addobject LOCALID_ROUTE111_PLAYER_FALLING
special StartPlayerDescendMirageTower
showobjectat LOCALID_PLAYER, MAP_LITTLEROOT_TOWN
removeobject LOCALID_ROUTE111_PLAYER_FALLING
delay 16
turnobject LOCALID_PLAYER, DIR_NORTH
delay 16
special StartMirageTowerDisintegration
special StartMirageTowerFossilFallAndSink
setvar VAR_MIRAGE_TOWER_STATE, 2
clearflag FLAG_HIDE_DESERT_UNDERPASS_FOSSIL
goto_if_set FLAG_CHOSE_CLAW_FOSSIL, Route111_EventScript_RootFossilDisappeared
msgbox Route111_Text_ClawFossilDisappeared, MSGBOX_DEFAULT
releaseall
end
```
### Route111_EventScript_RootFossilDisappeared
```
msgbox Route111_Text_RootFossilDisappeared, MSGBOX_DEFAULT
releaseall
end
```
### Route111_Movement_PlayerFall
```
lock_anim
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
walk_fast_down
step_end
```
### Route111_EventScript_Girl
```
lock
faceplayer
dotimebasedevents
goto_if_set FLAG_DAILY_ROUTE_111_RECEIVED_BERRY, Route111_EventScript_ReceivedBerry
msgbox Route111_Text_WateredPlantsEveryDayTakeBerry, MSGBOX_DEFAULT
giveitem ITEM_RAZZ_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_DAILY_ROUTE_111_RECEIVED_BERRY
special GetPlayerBigGuyGirlString
msgbox Route111_Text_GoingToTryToMakeDifferentColorBerries, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_ReceivedBerry
```
msgbox Route111_Text_WhatColorBerriesToLookForToday, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_ViciousSandstormTriggerUp
```
lockall
setvar VAR_0x8004, 0
goto Route111_EventScript_ViciousSandstormTrigger
end
```
### Route111_EventScript_ViciousSandstormTriggerDown
```
lockall
setvar VAR_0x8004, 1
goto Route111_EventScript_ViciousSandstormTrigger
end
```
### Route111_EventScript_ViciousSandstormTriggerLeft
```
lockall
setvar VAR_0x8004, 2
goto Route111_EventScript_ViciousSandstormTrigger
end
```
### Route111_EventScript_ViciousSandstormTriggerRight
```
lockall
setvar VAR_0x8004, 3
goto Route111_EventScript_ViciousSandstormTrigger
end
```
### Route111_EventScript_ViciousSandstormTrigger
```
checkitem ITEM_GO_GOGGLES
goto_if_eq VAR_RESULT, FALSE, Route111_EventScript_PreventRouteAccess
setvar VAR_TEMP_3, 1
releaseall
end
```
### Route111_EventScript_PreventRouteAccess
```
msgbox gText_SandstormIsVicious, MSGBOX_DEFAULT
closemessage
call_if_eq VAR_0x8004, 0, Route111_EventScript_PushUpFromRoute
call_if_eq VAR_0x8004, 1, Route111_EventScript_PushDownFromRoute
call_if_eq VAR_0x8004, 2, Route111_EventScript_PushLeftFromRoute
call_if_eq VAR_0x8004, 3, Route111_EventScript_PushRightFromRoute
releaseall
end
```
### Route111_EventScript_PushUpFromRoute
```
applymovement LOCALID_PLAYER, Route111_Movement_PushUpFromRoute
waitmovement 0
return
```
### Route111_EventScript_PushDownFromRoute
```
applymovement LOCALID_PLAYER, Route111_Movement_PushDownFromRoute
waitmovement 0
return
```
### Route111_EventScript_PushLeftFromRoute
```
applymovement LOCALID_PLAYER, Route111_Movement_PushLeftFromRoute
waitmovement 0
return
```
### Route111_EventScript_PushRightFromRoute
```
applymovement LOCALID_PLAYER, Route111_Movement_PushRightFromRoute
waitmovement 0
return
```
### Route111_Movement_PushUpFromRoute
```
walk_up
step_end
```
### Route111_Movement_PushDownFromRoute
```
walk_down
step_end
```
### Route111_Movement_PushLeftFromRoute
```
walk_left
step_end
```
### Route111_Movement_PushRightFromRoute
```
walk_right
step_end
```
### Route111_EventScript_SunTrigger
```
setweather WEATHER_SUNNY
fadenewbgm MUS_ROUTE110
doweather
setvar VAR_TEMP_3, 0
end
```
### Route111_EventScript_SandstormTrigger
```
setweather WEATHER_SANDSTORM
fadenewbgm MUS_DESERT
doweather
end
```
### Route111_EventScript_Victor
```
lock
faceplayer
setflag FLAG_LANDMARK_WINSTRATE_FAMILY
msgbox Route111_Text_BattleOurFamily, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route111_EventScript_BattleWinstrates
msgbox Route111_Text_IsThatSo, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_BattleWinstrates
```
msgbox Route111_Text_VictorIntro, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_VICTOR, Route111_Text_VictorDefeat
applymovement LOCALID_ROUTE111_VICTOR, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
msgbox Route111_Text_VictorPostBattle, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE111_VICTOR, Route111_Movement_WinstrateEnterHouse
waitmovement 0
removeobject LOCALID_ROUTE111_VICTOR
call Route111_EventScript_CloseWinstrateDoor
applymovement LOCALID_PLAYER, Route111_Movement_WaitForNextWinstrate
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
addobject LOCALID_ROUTE111_VICTORIA
applymovement LOCALID_ROUTE111_VICTORIA, Route111_Movement_WinstrateExitHouse
waitmovement 0
call Route111_EventScript_CloseWinstrateDoor
msgbox Route111_Text_VictoriaIntro, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_VICTORIA, Route111_Text_VictoriaDefeat
applymovement LOCALID_ROUTE111_VICTORIA, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
msgbox Route111_Text_VictoriaPostBattle, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE111_VICTORIA, Route111_Movement_WinstrateEnterHouse
waitmovement 0
removeobject LOCALID_ROUTE111_VICTORIA
call Route111_EventScript_CloseWinstrateDoor
applymovement LOCALID_PLAYER, Route111_Movement_WaitForNextWinstrate
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
addobject LOCALID_ROUTE111_VIVI
applymovement LOCALID_ROUTE111_VIVI, Route111_Movement_WinstrateExitHouse
waitmovement 0
call Route111_EventScript_CloseWinstrateDoor
msgbox Route111_Text_ViviIntro, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_VIVI, Route111_Text_ViviDefeat
applymovement LOCALID_ROUTE111_VIVI, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
msgbox Route111_Text_ViviPostBattle, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE111_VIVI, Route111_Movement_WinstrateEnterHouse
waitmovement 0
removeobject LOCALID_ROUTE111_VIVI
call Route111_EventScript_CloseWinstrateDoor
applymovement LOCALID_PLAYER, Route111_Movement_WaitForNextWinstrate
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
addobject LOCALID_ROUTE111_VICKY
applymovement LOCALID_ROUTE111_VICKY, Route111_Movement_WinstrateExitHouse
waitmovement 0
call Route111_EventScript_CloseWinstrateDoor
msgbox Route111_Text_VickyIntro, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_VICKY, Route111_Text_VickyDefeat
msgbox Route111_Text_VickyPostBattle, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE111_VICKY, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
call Route111_EventScript_OpenWinstrateDoor
applymovement LOCALID_ROUTE111_VICKY, Route111_Movement_WinstrateEnterHouse
waitmovement 0
removeobject LOCALID_ROUTE111_VICKY
call Route111_EventScript_CloseWinstrateDoor
release
end
```
### Route111_EventScript_OpenWinstrateDoor
```
opendoor 13, 113
waitdooranim
return
```
### Route111_EventScript_CloseWinstrateDoor
```
closedoor 13, 113
waitdooranim
return
```
### Route111_Movement_WinstrateEnterHouse
```
walk_in_place_faster_up
walk_up
step_end
```
### Route111_Movement_WinstrateExitHouse
```
walk_down
step_end
```
### Route111_Movement_WaitForNextWinstrate
```
delay_16
delay_16
delay_16
step_end
```
### Route111_EventScript_RouteSignMauville
```
msgbox Route111_Text_RouteSignMauville, MSGBOX_SIGN
end
```
### Route111_EventScript_WinstrateHouseSign
```
msgbox Route111_Text_WinstrateHouseSign, MSGBOX_SIGN
end
```
### Route111_EventScript_RouteSign112
```
msgbox Route111_Text_RouteSign112, MSGBOX_SIGN
end
```
### Route111_EventScript_RouteSign113
```
msgbox Route111_Text_RouteSign113, MSGBOX_SIGN
end
```
### Route111_EventScript_OldLadysRestStopSign
```
msgbox Route111_Text_OldLadysRestStopSign, MSGBOX_SIGN
end
```
### Route111_EventScript_TrainerTipsSpAtkSpDef
```
msgbox Route111_Text_TrainerTipsSpAtkSpDef, MSGBOX_SIGN
end
```
### Route111_EventScript_Man1
```
msgbox Route111_Text_ToughToKeepWinningUpTheRanks, MSGBOX_NPC
end
```
### Route111_EventScript_Man2
```
msgbox Route111_Text_WinstrateFamilyDestroyedMe, MSGBOX_NPC
end
```
### Route111_EventScript_Hiker
```
lock
faceplayer
goto_if_eq VAR_MIRAGE_TOWER_STATE, 3, Route111_EventScript_HikerMirageTowerGone
goto_if_eq VAR_MIRAGE_TOWER_STATE, 2, Route111_EventScript_HikerMirageTowerDisintegrated
goto_if_set FLAG_MIRAGE_TOWER_VISIBLE, Route111_EventScript_HikerMirageTowerVisible
msgbox Route111_Text_ShouldBeMirageTowerAroundHere, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_HikerMirageTowerGone
```
msgbox Route111_Text_MirageTowerHasntBeenSeenSince, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_HikerMirageTowerDisintegrated
```
msgbox Route111_Text_ThatWasShockingSandRainedDown, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_HikerMirageTowerVisible
```
msgbox Route111_Text_MirageTowerClearlyVisible, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_RockSmashTipFatMan
```
lockall
applymovement LOCALID_ROUTE111_ROCK_SMASH_MAN, Common_Movement_FacePlayer
waitmovement 0
msgbox Route111_Text_MauvilleUncleToldMeToTakeRockSmash, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_ROUTE111_ROCK_SMASH_MAN, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### Route111_EventScript_Drew
```
trainerbattle_single TRAINER_DREW, Route111_Text_DrewIntro, Route111_Text_DrewDefeat
msgbox Route111_Text_DrewPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Heidi
```
trainerbattle_single TRAINER_HEIDI, Route111_Text_HeidiIntro, Route111_Text_HeidiDefeat
msgbox Route111_Text_HeidiPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Beau
```
trainerbattle_single TRAINER_BEAU, Route111_Text_BeauIntro, Route111_Text_BeauDefeat
msgbox Route111_Text_BeauPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Becky
```
trainerbattle_single TRAINER_BECKY, Route111_Text_BeckyIntro, Route111_Text_BeckyDefeat
msgbox Route111_Text_BeckyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Dusty
```
trainerbattle_single TRAINER_DUSTY_1, Route111_Text_DustyIntro, Route111_Text_DustyDefeat, Route111_EventScript_RegisterDusty
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route111_EventScript_RematchDusty
msgbox Route111_Text_DustyPostBattle, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_RegisterDusty
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route111_Text_DustyRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_DUSTY_1
release
end
```
### Route111_EventScript_RematchDusty
```
trainerbattle_rematch TRAINER_DUSTY_1, Route111_Text_DustyRematchIntro, Route111_Text_DustyRematchDefeat
msgbox Route111_Text_DustyPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Travis
```
trainerbattle_single TRAINER_TRAVIS, Route111_Text_TravisIntro, Route111_Text_TravisDefeat
msgbox Route111_Text_TravisPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Irene
```
trainerbattle_single TRAINER_IRENE, Route111_Text_IreneIntro, Route111_Text_IreneDefeat
msgbox Route111_Text_IrenePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Daisuke
```
trainerbattle_single TRAINER_DAISUKE, Route111_Text_DaisukeIntro, Route111_Text_DaisukeDefeat
msgbox Route111_Text_DaisukePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Wilton
```
trainerbattle_single TRAINER_WILTON_1, Route111_Text_WiltonIntro, Route111_Text_WiltonDefeat, Route111_EventScript_RegisterWilton
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route111_EventScript_RematchWilton
msgbox Route111_Text_WiltonPostBattle, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_RegisterWilton
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route111_Text_WiltonRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_WILTON_1
release
end
```
### Route111_EventScript_RematchWilton
```
trainerbattle_rematch TRAINER_WILTON_1, Route111_Text_WiltonRematchIntro, Route111_Text_WiltonRematchDefeat
msgbox Route111_Text_WiltonPostRematch, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Brooke
```
trainerbattle_single TRAINER_BROOKE_1, Route111_Text_BrookeIntro, Route111_Text_BrookeDefeat, Route111_EventScript_RegisterBrooke
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route111_EventScript_RematchBrooke
msgbox Route111_Text_BrookePostBattle, MSGBOX_DEFAULT
release
end
```
### Route111_EventScript_RegisterBrooke
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route111_Text_BrookeRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_BROOKE_1
release
end
```
### Route111_EventScript_RematchBrooke
```
trainerbattle_rematch TRAINER_BROOKE_1, Route111_Text_BrookeRematchIntro, Route111_Text_BrookeRematchDefeat
msgbox Route111_Text_BrookePostRematch, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Hayden
```
trainerbattle_single TRAINER_HAYDEN, Route111_Text_HaydenIntro, Route111_Text_HaydenDefeat
msgbox Route111_Text_HaydenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Bianca
```
trainerbattle_single TRAINER_BIANCA, Route111_Text_BiancaIntro, Route111_Text_BiancaDefeat
msgbox Route111_Text_BiancaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Tyron
```
trainerbattle_single TRAINER_TYRON, Route111_Text_TyronIntro, Route111_Text_TyronDefeat
msgbox Route111_Text_TyronPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Celina
```
trainerbattle_single TRAINER_CELINA, Route111_Text_CelinaIntro, Route111_Text_CelinaDefeat
msgbox Route111_Text_CelinaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Celia
```
trainerbattle_single TRAINER_CELIA, Route111_Text_CeliaIntro, Route111_Text_CeliaDefeat
msgbox Route111_Text_CeliaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Bryan
```
trainerbattle_single TRAINER_BRYAN, Route111_Text_BryanIntro, Route111_Text_BryanDefeat
msgbox Route111_Text_BryanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_Branden
```
trainerbattle_single TRAINER_BRANDEN, Route111_Text_BrandenIntro, Route111_Text_BrandenDefeat
msgbox Route111_Text_BrandenPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route111_EventScript_TrainerHillSign
```
msgbox Route111_Text_TrainerHillSign, MSGBOX_SIGN
end
```

## Textes (30)
### Route111_Text_BattleOurFamily
```
Salut! Je suppose que tu voyages.\pQue dirais-tu de livrer quatre\ncombats de POKéMON à la suite\lavec les membres de notre famille?$
```
### Route111_Text_IsThatSo
```
C'est ce que tu veux?\nAlors, repasse si tu changes d'avis!$
```
### Route111_Text_VictorIntro
```
Bon esprit! J'aime ça!$
```
### Route111_Text_VictorDefeat
```
Aïe!\nTu es plus robuste que je ne le pensais!$
```
### Route111_Text_VictorPostBattle
```
Hé, vous tous!\nJ'ai trouvé un DRESSEUR très fort!$
```
### Route111_Text_VictoriaIntro
```
Oh, ciel! Ce que tu es jeune!\pTu dois pourtant bien être un vrai\nDRESSEUR pour avoir battu mon mari.\pA mon tour de combattre maintenant!$
```
### Route111_Text_VictoriaDefeat
```
Oh, mince alors! Je ne peux pas croire\nque tu aies tant de force!$
```
### Route111_Text_VictoriaPostBattle
```
On a un DRESSEUR très fort!\nOui, drôlement fort!$
```
### Route111_Text_ViviIntro
```
Tu as un meilleur niveau que maman?\nWaouh!\pMais moi aussi, je suis forte!\nVraiment! Honnêtement!$
```
### Route111_Text_ViviDefeat
```
Hum? J'ai perdu?$
```
### Route111_Text_ViviPostBattle
```
La honte…\p… Sniff… Mémé!$
```
### Route111_Text_VickyIntro
```
Comment? Tu oses faire pleurer ma\npetite-fille!\pJe vais te le faire payer!\nPrépare-toi à perdre!$
```
### Route111_Text_VickyDefeat
```
Ouh! Quelle puissance…\nMa petite-fille avait raison…$
```
### Route111_Text_VickyPostBattle
```
Si tu as le temps, reste un peu avec\nnous.$
```
### Route111_Text_ToughToKeepWinningUpTheRanks
```
Si tu ne fais pas progresser tes\nPOKéMON davantage, ça pourrait\ldevenir dur de passer les étapes.\pJ'ai entendu dire qu'au CONSEIL 4 de\nla LIGUE POKéMON, ils sont bien plus\lforts que n'importe quel CHAMPION.$
```
### Route111_Text_WinstrateFamilyDestroyedMe
```
Je me suis battu contre la famille\nSTRATEGE, mais quatre combats à la\lsuite, c'est trop dur. Ils m'ont anéanti.$
```
### Route111_Text_RouteSignMauville
```
ROUTE 111\n{DOWN_ARROW} LAVANDIA$
```
### Route111_Text_WinstrateHouseSign
```
“Dans la famille, nous ne faisons\nqu'un!” MAISON DE LA FAMILLE STRATEGE$
```
### Route111_Text_RouteSign112
```
ROUTE 111\n{LEFT_ARROW} ROUTE 112$
```
### Route111_Text_RouteSign113
```
ROUTE 111\n{LEFT_ARROW} ROUTE 113$
```
### Route111_Text_OldLadysRestStopSign
```
GITE VIEILLE DAME\n“Entrez et reposez vos vieux os.”$
```
### Route111_Text_TrainerTipsSpAtkSpDef
```
CONSEILS AUX DRESSEURS\pL'indication ATQ. SPE. reflète \nla puissance d'un POKéMON.\lCela signifie “ATTAQUE SPECIALE”.\pDe même DEF. SPE. signifie “DEFENSE\nSPECIALE”.$
```
### Route111_Text_ShouldBeMirageTowerAroundHere
```
Il devrait y avoir une tour de sable\ndans le coin.\pMais pour une raison inconnue, elle\nn'est pas toujours visible.\pC'est pour ça que je l'appelle la\nTOUR MIRAGE.$
```
### Route111_Text_MirageTowerClearlyVisible
```
Je la vois!\nC'est la tour de sable!\pLa tour de sable qu'on prend pour un\nmirage est parfaitement visible!\pMais elle semble si fragile…\nElle pourrait s'écrouler à tout moment…\pSi j'en avais le courage, j'irais\nsûrement faire un tour à l'intérieur…$
```
### Route111_Text_ThatWasShockingSandRainedDown
```
Ouah…\nC'était super impressionnant.\pLa tour de sable s'est effritée d'un\nseul coup.\pComment était-ce à l'intérieur?\nIl y avait des fantômes de sable?$
```
### Route111_Text_MirageTowerHasntBeenSeenSince
```
Depuis la dernière fois, personne n'a\nrevu la tour de sable.\pPeut-être que c'était vraiment un\nmirage…$
```
### Route111_Text_ClawFossilDisappeared
```
Le FOSS. GRIFFE a disparu dans\nle sable…$
```
### Route111_Text_RootFossilDisappeared
```
Le FOSS. RACINE a disparu dans\nle sable…$
```
### Route111_Text_MauvilleUncleToldMeToTakeRockSmash
```
Oh non!\pMon oncle de LAVANDIA m'a dit de\nprendre ECLATE-ROC avec moi si\lje voulais aller sur la ROUTE 111!\pMon oncle? Il habite près du\nmarchand de vélo de LAVANDIA.$
```
### Route111_Text_TrainerHillSign
```
{RIGHT_ARROW} ENTREE DU MONT DRESSEURS\p“Atteignez les hauteurs, vous les\nDRESSEURS sans peur!”$
```

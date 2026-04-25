# SootopolisCity_MysteryEventsHouse_B1F

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_B1F`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_B1F`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_VAR_0` | 6,5 | `MOVEMENT_TYPE_FACE_LEFT` | `0x0` | `0` |

## Warps (1)
- #0 (3,1) → `MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_1F` warp #2

## Variables référencées (5)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_RESULT`
- `VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `SootopolisCity_MysteryEventsHouse_B1F_Text_MatchEndedUpDraw`
- `gStringVar4`

## Scripts (9)
### SootopolisCity_MysteryEventsHouse_B1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SootopolisCity_MysteryEventsHouse_B1F_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, SootopolisCity_MysteryEventsHouse_B1F_OnFrame
```
### SootopolisCity_MysteryEventsHouse_B1F_OnTransition
```
special SetEReaderTrainerGfxId
end
```
### SootopolisCity_MysteryEventsHouse_B1F_OnFrame
```
map_script_2 VAR_TEMP_1, 0, SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleVisitingTrainer
```
### SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleVisitingTrainer
```
lockall
applymovement LOCALID_PLAYER, SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerEnterBasement
waitmovement 0
special CopyEReaderTrainerGreeting
msgbox gStringVar4, MSGBOX_DEFAULT
closemessage
setvar VAR_0x8004, SPECIAL_BATTLE_EREADER
setvar VAR_0x8005, 0
special DoSpecialTrainerBattle
call_if_eq VAR_RESULT, B_OUTCOME_DREW, SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleTie
call_if_eq VAR_RESULT, B_OUTCOME_WON, SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleWon
call_if_eq VAR_RESULT, B_OUTCOME_LOST, SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleLost
closemessage
special HealPlayerParty
applymovement LOCALID_PLAYER, SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerExitBasement
waitmovement 0
special LoadPlayerParty
setvar VAR_TEMP_1, 1
warp MAP_SOOTOPOLIS_CITY_MYSTERY_EVENTS_HOUSE_1F, 3, 1
waitstate
releaseall
end
```
### SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleTie
```
setvar VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 3
msgbox SootopolisCity_MysteryEventsHouse_B1F_Text_MatchEndedUpDraw, MSGBOX_DEFAULT
return
```
### SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleWon
```
setvar VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 1
special ShowFieldMessageStringVar4
waitmessage
waitbuttonpress
return
```
### SootopolisCity_MysteryEventsHouse_B1F_EventScript_BattleLost
```
setvar VAR_SOOTOPOLIS_MYSTERY_EVENTS_STATE, 2
special ShowFieldMessageStringVar4
waitmessage
waitbuttonpress
return
```
### SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerEnterBasement
```
walk_down
walk_down
walk_down
walk_right
walk_right
step_end
```
### SootopolisCity_MysteryEventsHouse_B1F_Movement_PlayerExitBasement
```
walk_left
walk_left
walk_up
walk_up
walk_up
walk_up
delay_8
step_end
```

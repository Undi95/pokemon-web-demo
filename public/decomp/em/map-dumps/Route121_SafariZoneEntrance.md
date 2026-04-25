# Route121_SafariZoneEntrance

## Métadonnées
- **id** : `MAP_ROUTE121_SAFARI_ZONE_ENTRANCE`
- **layout** : `LAYOUT_ROUTE121_SAFARI_ZONE_ENTRANCE`
- **music** : `MUS_FORTREE`
- **region_map_section** : `MAPSEC_ROUTE_121`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PICNICKER` | 17,9 | `MOVEMENT_TYPE_FACE_LEFT` | `Route121_SafariZoneEntrance_EventScript_WelcomeAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 10,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Route121_SafariZoneEntrance_EventScript_InfoAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 8,2 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |

## Warps (4)
- #0 (2,5) → `MAP_SAFARI_ZONE_SOUTH` warp #0
- #1 (3,5) → `MAP_SAFARI_ZONE_SOUTH` warp #0
- #2 (14,13) → `MAP_ROUTE121` warp #0
- #3 (15,13) → `MAP_ROUTE121` warp #0

## Coord events / triggers (1)
- (8,4) → `Route121_SafariZoneEntrance_EventScript_EntranceCounterTrigger` (si `VAR_TEMP_1` == `0`)

## BG events / signs (1)
- (15,1) [sign] → `Route121_SafariZoneEntrance_EventScript_TrainerTipSign`

## Flags référencés (1)
- `FLAG_GOOD_LUCK_SAFARI_ZONE`

## Variables référencées (2)
- `VAR_RESULT`
- `VAR_SAFARI_ZONE_STATE`

## Scripts (17)
### Route121_SafariZoneEntrance_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route121_SafariZoneEntrance_OnFrame
```
### Route121_SafariZoneEntrance_OnFrame
```
map_script_2 VAR_SAFARI_ZONE_STATE, 1, Route121_SafariZoneEntrance_EventScript_ExitSafariZone
```
### Route121_SafariZoneEntrance_EventScript_ExitSafariZone
```
lockall
applymovement LOCALID_PLAYER, Route121_SafariZoneEntrance_Movement_ExitSafariZone
waitmovement 0
setvar VAR_SAFARI_ZONE_STATE, 0
releaseall
end
```
### Route121_SafariZoneEntrance_Movement_ExitSafariZone
```
walk_up
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### Route121_SafariZoneEntrance_EventScript_WelcomeAttendant
```
msgbox Route121_SafariZoneEntrance_Text_WelcomeToSafariZone, MSGBOX_NPC
end
```
### Route121_SafariZoneEntrance_EventScript_InfoAttendant
```
lock
faceplayer
msgbox Route121_SafariZoneEntrance_Text_WelcomeFirstTime, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route121_SafariZoneEntrance_EventScript_FirstTimeInfo
msgbox Route121_SafariZoneEntrance_Text_ComeInAndEnjoy, MSGBOX_DEFAULT
release
end
```
### Route121_SafariZoneEntrance_EventScript_FirstTimeInfo
```
msgbox Route121_SafariZoneEntrance_Text_FirstTimeInfo, MSGBOX_DEFAULT
release
end
```
### Route121_SafariZoneEntrance_EventScript_EntranceCounterTrigger
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
showmoneybox 0, 0
msgbox Route121_SafariZoneEntrance_Text_WouldYouLikeToPlay, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, Route121_SafariZoneEntrance_EventScript_TryEnterSafariZone
msgbox Route121_SafariZoneEntrance_Text_PlayAnotherTime, MSGBOX_DEFAULT
goto Route121_SafariZoneEntrance_EventScript_MovePlayerBackFromCounter
end
```
### Route121_SafariZoneEntrance_EventScript_TryEnterSafariZone
```
checkitem ITEM_POKEBLOCK_CASE
goto_if_eq VAR_RESULT, 0, Route121_SafariZoneEntrance_EventScript_NoPokeblockCase
call Route121_SafariZoneEntrance_EventScript_CheckHasRoomForPokemon
checkmoney 500
goto_if_eq VAR_RESULT, 0, Route121_SafariZoneEntrance_EventScript_NotEnoughMoney
playse SE_SHOP
msgbox Route121_SafariZoneEntrance_Text_ThatWillBe500Please, MSGBOX_DEFAULT
removemoney 500
updatemoneybox
msgbox Route121_SafariZoneEntrance_Text_HereAreYourSafariBalls, MSGBOX_DEFAULT
playfanfare MUS_OBTAIN_ITEM
message Route121_SafariZoneEntrance_Text_Received30SafariBalls
waitfanfare
msgbox Route121_SafariZoneEntrance_Text_PleaseEnjoyYourself, MSGBOX_DEFAULT
closemessage
hidemoneybox
applymovement LOCALID_PLAYER, Route121_SafariZoneEntrance_Movement_EnterSafariZone
waitmovement 0
special EnterSafariMode
setvar VAR_SAFARI_ZONE_STATE, 2
clearflag FLAG_GOOD_LUCK_SAFARI_ZONE
warp MAP_SAFARI_ZONE_SOUTH, 32, 33
waitstate
end
```
### Route121_SafariZoneEntrance_EventScript_CheckHasRoomForPokemon
```
getpartysize
goto_if_ne VAR_RESULT, PARTY_SIZE, Route121_SafariZoneEntrance_EventScript_HasRoomForPokemon
specialvar VAR_RESULT, ScriptCheckFreePokemonStorageSpace
goto_if_eq VAR_RESULT, 1, Route121_SafariZoneEntrance_EventScript_HasRoomForPokemon
msgbox Route121_SafariZoneEntrance_Text_PCIsFull, MSGBOX_DEFAULT
goto Route121_SafariZoneEntrance_EventScript_MovePlayerBackFromCounter
end
```
### Route121_SafariZoneEntrance_EventScript_HasRoomForPokemon
```
return
```
### Route121_SafariZoneEntrance_EventScript_NoPokeblockCase
```
msgbox Route121_SafariZoneEntrance_Text_YouNeedPokeblockCase, MSGBOX_DEFAULT
goto Route121_SafariZoneEntrance_EventScript_MovePlayerBackFromCounter
end
```
### Route121_SafariZoneEntrance_EventScript_NotEnoughMoney
```
msgbox Route121_SafariZoneEntrance_Text_NotEnoughMoney, MSGBOX_DEFAULT
goto Route121_SafariZoneEntrance_EventScript_MovePlayerBackFromCounter
end
```
### Route121_SafariZoneEntrance_EventScript_MovePlayerBackFromCounter
```
closemessage
hidemoneybox
applymovement LOCALID_PLAYER, Route121_SafariZoneEntrance_Movement_BackAwayFromCounter
waitmovement 0
releaseall
end
```
### Route121_SafariZoneEntrance_Movement_BackAwayFromCounter
```
walk_right
step_end
```
### Route121_SafariZoneEntrance_Movement_EnterSafariZone
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_down
delay_16
step_end
```
### Route121_SafariZoneEntrance_EventScript_TrainerTipSign
```
msgbox Route121_SafariZoneEntrance_Text_TrainerTip, MSGBOX_SIGN
end
```

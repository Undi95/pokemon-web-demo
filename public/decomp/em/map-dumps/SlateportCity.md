# SlateportCity

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY`
- **layout** : `LAYOUT_SLATEPORT_CITY`
- **music** : `MUS_SLATEPORT`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_CITY`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE110`
- down (offset 0) → `MAP_ROUTE109`
- right (offset 0) → `MAP_ROUTE134`

## Object events (35 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SLATEPORT_FAT_MAN` | `OBJ_EVENT_GFX_FAT_MAN` | 21,11 | `MOVEMENT_TYPE_WANDER_AROUND` | `SlateportCity_EventScript_FatMan` | `0` |
| `LOCALID_SLATEPORT_MAN_1` | `OBJ_EVENT_GFX_MAN_1` | 34,29 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `SlateportCity_EventScript_Man1` | `0` |
| `LOCALID_SLATEPORT_RICH_BOY` | `OBJ_EVENT_GFX_RICH_BOY` | 5,13 | `MOVEMENT_TYPE_WANDER_AROUND` | `SlateportCity_EventScript_RichBoy` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 26,29 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_EventScript_Woman1` | `0` |
| `LOCALID_SLATEPORT_GRUNT_1` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 31,27 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_EventScript_AquaGrunt1` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_COOK` | `OBJ_EVENT_GFX_COOK` | 5,43 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_EventScript_Cook` | `0` |
| `LOCALID_SLATEPORT_OLD_WOMAN` | `OBJ_EVENT_GFX_OLD_WOMAN` | 20,37 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_EventScript_OldWoman` | `0` |
| `LOCALID_SLATEPORT_GIRL` | `OBJ_EVENT_GFX_GIRL_1` | 8,42 | `MOVEMENT_TYPE_WANDER_AROUND` | `SlateportCity_EventScript_Girl` | `0` |
| `LOCALID_SLATEPORT_TY` | `OBJ_EVENT_GFX_CAMERAMAN` | 29,13 | `MOVEMENT_TYPE_FACE_LEFT` | `SlateportCity_EventScript_Ty` | `FLAG_HIDE_SLATEPORT_CITY_GABBY_AND_TY` |
| `LOCALID_SLATEPORT_GABBY` | `OBJ_EVENT_GFX_REPORTER_F` | 28,14 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_EventScript_Gabby` | `FLAG_HIDE_SLATEPORT_CITY_GABBY_AND_TY` |
| `LOCALID_SLATEPORT_CAPT_STERN` | `OBJ_EVENT_GFX_SCIENTIST_1` | 28,13 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_CaptStern` | `FLAG_HIDE_SLATEPORT_CITY_CAPTAIN_STERN` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 37,41 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_Sailor1` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 28,46 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `SlateportCity_EventScript_Sailor2` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 9,50 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `SlateportCity_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 16,46 | `MOVEMENT_TYPE_WANDER_AROUND` | `SlateportCity_EventScript_Man2` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 8,24 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `SlateportCity_EventScript_Maniac` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 15,31 | `MOVEMENT_TYPE_LOOK_AROUND` | `SlateportCity_EventScript_Woman2` | `0` |
| `LOCALID_SLATEPORT_GRUNT_2` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 30,27 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_AquaGrunt2` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_3` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 29,27 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_AquaGrunt3` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 6,38 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_DecorClerk` | `0` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 5,51 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_EventScript_DollClerk` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 34,51 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_EventScript_Man3` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 4,47 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_EventScript_EffortRibbonWoman` | `0` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 11,47 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_EventScript_PowerTMClerk` | `FLAG_HIDE_SLATEPORT_CITY_TM_SALESMAN` |
| `LOCALID_SLATEPORT_ENERGY_GURU` | `OBJ_EVENT_GFX_POKEFAN_M` | 5,47 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_EventScript_EnergyGuru` | `0` |
| `LOCALID_SLATEPORT_GRUNT_4` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 22,27 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_AquaGrunt4` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_5` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 23,27 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_EventScript_AquaGrunt5` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_6` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 24,27 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_AquaGrunt6` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_7` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 21,26 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_AquaGrunt7` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_8` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 20,26 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_EventScript_AquaGrunt8` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_9` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 26,27 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_EventScript_AquaGrunt9` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 28,27 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_EventScript_AquaGrunt10` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `LOCALID_SLATEPORT_GRUNT_11` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 25,27 | `MOVEMENT_TYPE_FACE_UP` | `SlateportCity_EventScript_AquaGrunt11` | `FLAG_HIDE_SLATEPORT_CITY_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 11,37 | `MOVEMENT_TYPE_FACE_LEFT` | `SlateportCity_EventScript_BerryPowderClerk` | `0` |
| `LOCALID_SLATEPORT_SCOTT` | `OBJ_EVENT_GFX_SCOTT` | 10,12 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_SLATEPORT_CITY_SCOTT` |

## Warps (11)
- #0 (19,19) → `MAP_SLATEPORT_CITY_POKEMON_CENTER_1F` warp #0
- #1 (13,26) → `MAP_SLATEPORT_CITY_MART` warp #0
- #2 (26,38) → `MAP_SLATEPORT_CITY_STERNS_SHIPYARD_1F` warp #0
- #3 (10,12) → `MAP_SLATEPORT_CITY_BATTLE_TENT_LOBBY` warp #0
- #4 (4,26) → `MAP_SLATEPORT_CITY_POKEMON_FAN_CLUB` warp #0
- #5 (30,26) → `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_1F` warp #0
- #6 (5,19) → `MAP_SLATEPORT_CITY_NAME_RATERS_HOUSE` warp #0
- #7 (31,26) → `MAP_SLATEPORT_CITY_OCEANIC_MUSEUM_1F` warp #1
- #8 (28,12) → `MAP_SLATEPORT_CITY_HARBOR` warp #0
- #9 (40,7) → `MAP_SLATEPORT_CITY_HARBOR` warp #2
- #10 (21,44) → `MAP_SLATEPORT_CITY_HOUSE` warp #0

## Coord events / triggers (1)
- (10,13) → `SlateportCity_EventScript_ScottBattleTentScene` (si `VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE` == `2`)

## BG events / signs (13)
- (8,19) [sign] → `SlateportCity_EventScript_NameRatersHouseSign`
- (20,19) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (21,19) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (14,26) [sign] → `Common_EventScript_ShowPokemartSign`
- (24,12) [sign] → `SlateportCity_EventScript_HarborSign`
- (15,26) [sign] → `Common_EventScript_ShowPokemartSign`
- (14,51) [sign] → `SlateportCity_EventScript_MarketSign`
- (26,26) [sign] → `SlateportCity_EventScript_OceanicMuseumSign`
- (16,22) [sign] → `SlateportCity_EventScript_CitySign`
- (8,26) [sign] → `SlateportCity_EventScript_PokemonFanClubSign`
- (7,13) [sign] → `SlateportCity_EventScript_BattleTentSign`
- (23,38) [sign] → `SlateportCity_EventScript_SternsShipyardSign`
- (10,36) [sign] → `SlateportCity_EventScript_BerryCrushRankingsSign`

## Flags référencés (13)
- `FLAG_BADGE07_GET`
- `FLAG_DOCK_REJECTED_DEVON_GOODS`
- `FLAG_ENABLE_SCOTT_MATCH_CALL`
- `FLAG_HIDE_MAP_NAME_POPUP`
- `FLAG_HIDE_SLATEPORT_CITY_CONTEST_REPORTER`
- `FLAG_HIDE_SLATEPORT_CITY_HARBOR_AQUA_GRUNT`
- `FLAG_HIDE_SLATEPORT_CITY_HARBOR_ARCHIE`
- `FLAG_HIDE_SLATEPORT_CITY_HARBOR_CAPTAIN_STERN`
- `FLAG_HIDE_SLATEPORT_CITY_HARBOR_SUBMARINE_SHADOW`
- `FLAG_RECEIVED_POWDER_JAR`
- `FLAG_RECEIVED_SECRET_POWER`
- `FLAG_SYS_GAME_CLEAR`
- `FLAG_VISITED_SLATEPORT_CITY`

## Variables référencées (11)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_0x8009`
- `VAR_1`
- `VAR_CONTEST_HALL_STATE`
- `VAR_RESULT`
- `VAR_SCOTT_STATE`
- `VAR_SLATEPORT_CITY_STATE`
- `VAR_SLATEPORT_MUSEUM_1F_STATE`
- `VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_ComeBackWithSecretPower`
- `gText_PleaseComeAgain`
- `gText_TheBagIsFull`

## Scripts (106)
### SlateportCity_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SlateportCity_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, SlateportCity_OnFrame
```
### SlateportCity_OnTransition
```
setvar VAR_SLATEPORT_MUSEUM_1F_STATE, 0
call SlateportCity_EventScript_EnterSlateport
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_MovePeopleForSternInterview
call_if_eq VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE, 1, SlateportCity_EventScript_SetReadyForScottScene
end
```
### SlateportCity_EventScript_EnterSlateport
```
setflag FLAG_VISITED_SLATEPORT_CITY
setvar VAR_CONTEST_HALL_STATE, 0
setflag FLAG_HIDE_SLATEPORT_CITY_CONTEST_REPORTER
return
```
### SlateportCity_EventScript_MovePeopleForSternInterview
```
setobjectxyperm LOCALID_SLATEPORT_CAPT_STERN, 28, 13
setobjectxyperm LOCALID_SLATEPORT_OLD_WOMAN, 25, 13
setobjectxyperm LOCALID_SLATEPORT_RICH_BOY, 25, 14
setobjectxyperm LOCALID_SLATEPORT_COOK, 27, 16
setobjectxyperm LOCALID_SLATEPORT_GIRL, 28, 16
setobjectxyperm LOCALID_SLATEPORT_FAT_MAN, 29, 16
setobjectxyperm LOCALID_SLATEPORT_MAN_1, 31, 14
setobjectmovementtype LOCALID_SLATEPORT_CAPT_STERN, MOVEMENT_TYPE_FACE_DOWN
setobjectmovementtype LOCALID_SLATEPORT_OLD_WOMAN, MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT
setobjectmovementtype LOCALID_SLATEPORT_RICH_BOY, MOVEMENT_TYPE_FACE_UP_AND_RIGHT
setobjectmovementtype LOCALID_SLATEPORT_COOK, MOVEMENT_TYPE_FACE_UP
setobjectmovementtype LOCALID_SLATEPORT_GIRL, MOVEMENT_TYPE_FACE_UP
setobjectmovementtype LOCALID_SLATEPORT_FAT_MAN, MOVEMENT_TYPE_FACE_UP
setobjectmovementtype LOCALID_SLATEPORT_MAN_1, MOVEMENT_TYPE_FACE_LEFT
return
```
### SlateportCity_EventScript_SetReadyForScottScene
```
setflag FLAG_HIDE_MAP_NAME_POPUP
getplayerxy VAR_0x8004, VAR_0x8005
goto_if_eq VAR_0x8004, 30, SlateportCity_EventScript_MoveScottLeft
setobjectxyperm LOCALID_SLATEPORT_SCOTT, 23, 27
setobjectmovementtype LOCALID_SLATEPORT_SCOTT, MOVEMENT_TYPE_FACE_RIGHT
return
```
### SlateportCity_EventScript_MoveScottLeft
```
setobjectxyperm LOCALID_SLATEPORT_SCOTT, 22, 27
setobjectmovementtype LOCALID_SLATEPORT_SCOTT, MOVEMENT_TYPE_FACE_RIGHT
return
```
### SlateportCity_OnFrame
```
map_script_2 VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE, 1, SlateportCity_EventScript_ScottScene
```
### SlateportCity_EventScript_ScottScene
```
lockall
addobject LOCALID_SLATEPORT_SCOTT
applymovement LOCALID_PLAYER, SlateportCity_Movement_PlayerFaceScott
applymovement LOCALID_SLATEPORT_SCOTT, SlateportCity_Movement_ScottApproachPlayer
waitmovement 0
msgbox SlateportCity_Text_YouDroveTeamAquaAway, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_SCOTT, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
delay 60
msgbox SlateportCity_Text_MaybeThisTrainer, MSGBOX_DEFAULT
applymovement LOCALID_SLATEPORT_SCOTT, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
msgbox SlateportCity_Text_LetsRegisterEachOther, MSGBOX_DEFAULT
closemessage
delay 30
playfanfare MUS_REGISTER_MATCH_CALL
msgbox SlateportCity_Text_RegisteredScott, MSGBOX_DEFAULT
waitfanfare
closemessage
delay 30
setflag FLAG_ENABLE_SCOTT_MATCH_CALL
msgbox SlateportCity_Text_KeepEyeOnTrainersBeSeeingYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_SCOTT, SlateportCity_Movement_ScottExit
waitmovement 0
removeobject LOCALID_SLATEPORT_SCOTT
setobjectxyperm LOCALID_SLATEPORT_SCOTT, 10, 12
setobjectmovementtype LOCALID_SLATEPORT_SCOTT, MOVEMENT_TYPE_FACE_DOWN
clearflag FLAG_HIDE_MAP_NAME_POPUP
setvar VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE, 2
addvar VAR_SCOTT_STATE, 1
releaseall
end
```
### SlateportCity_Movement_PlayerFaceScott
```
delay_16
delay_8
walk_in_place_faster_left
step_end
```
### SlateportCity_Movement_ScottApproachPlayer
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### SlateportCity_Movement_ScottExit
```
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### SlateportCity_EventScript_EnergyGuru
```
lock
faceplayer
message SlateportCity_Text_EnergyGuruSellWhatYouNeed
waitmessage
pokemart SlateportCity_Pokemart_EnergyGuru
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Pokemart_EnergyGuru
```
pokemartlistend
```
### SlateportCity_EventScript_EffortRibbonWoman
```
lock
faceplayer
bufferleadmonspeciesname STR_VAR_1
msgbox SlateportCity_Text_OhYourPokemon, MSGBOX_DEFAULT
specialvar VAR_RESULT, LeadMonHasEffortRibbon
call_if_eq VAR_RESULT, TRUE, SlateportCity_EventScript_MonHasEffortRibbon
specialvar VAR_RESULT, Special_AreLeadMonEVsMaxedOut
call_if_eq VAR_RESULT, FALSE, SlateportCity_EventScript_MonEVsNotMaxed
msgbox SlateportCity_Text_PleaseGiveItThisEffortRibbon, MSGBOX_DEFAULT
playfanfare MUS_OBTAIN_ITEM
message SlateportCity_Text_ReceivedEffortRibbon
waitfanfare
msgbox SlateportCity_Text_PutEffortRibbonOnMon, MSGBOX_DEFAULT
special GiveLeadMonEffortRibbon
release
end
```
### SlateportCity_EventScript_MonEVsNotMaxed
```
msgbox SlateportCity_Text_GoForItLittleHarder, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_MonHasEffortRibbon
```
msgbox SlateportCity_Text_EffortRibbonLooksGoodOnIt, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_Cook
```
lock
faceplayer
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_CookSternInterview
msgbox SlateportCity_Text_SeaweedFullOfLife, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_CookSternInterview
```
msgbox SlateportCity_Text_CaptainComeBackWithBigFish, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_OldWoman
```
lock
faceplayer
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_OldWomanSternInterview
msgbox SlateportCity_Text_HowTownIsBornAndGrows, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_OldWomanSternInterview
```
msgbox SlateportCity_Text_CaptSternBeingInterviewed, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_Girl
```
lock
faceplayer
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_GirlSternInterview
goto_if_set FLAG_RECEIVED_SECRET_POWER, SlateportCity_EventScript_GirlSecretBase
msgbox SlateportCity_Text_SlateportWonderfulPlace, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_GirlSternInterview
```
msgbox SlateportCity_Text_InterviewerSoCool, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_GirlSecretBase
```
msgbox SlateportCity_Text_BuyBricksSoDecorWontGetDirty, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_RichBoy
```
lock
faceplayer
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_RichBoySternInterview
msgbox SlateportCity_Text_GoingToCompeteInBattleTent, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_RichBoySternInterview
```
msgbox SlateportCity_Text_SternSaysDiscoveredSomething, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_FatMan
```
goto_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_FatManSternInterview
msgbox SlateportCity_Text_BushedHikingFromMauville, MSGBOX_NPC
end
```
### SlateportCity_EventScript_FatManSternInterview
```
msgbox SlateportCity_Text_AmIOnTV, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_Man1
```
lock
faceplayer
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_Man1SternInterview
msgbox SlateportCity_Text_EveryoneCallsHimCaptStern, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_Man1SternInterview
```
msgbox SlateportCity_Text_CaptainsACelebrity, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_Woman1
```
lock
faceplayer
goto_if_set FLAG_DOCK_REJECTED_DEVON_GOODS, SlateportCity_EventScript_Woman1AquaGone
msgbox SlateportCity_Text_WhatsLongLineOverThere, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_Woman1AquaGone
```
msgbox SlateportCity_Text_VisitedMuseumOften, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_BattleTentSign
```
msgbox SlateportCity_Text_BattleTentSign, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_SternsShipyardSign
```
lockall
goto_if_set FLAG_SYS_GAME_CLEAR, SlateportCity_EventScript_SternsShipyardFerryComplete
goto_if_set FLAG_BADGE07_GET, SlateportCity_EventScript_SternsShipyardNearsCompletion
msgbox SlateportCity_Text_SternsShipyardWantedSign, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_EventScript_SternsShipyardNearsCompletion
```
msgbox SlateportCity_Text_SternsShipyardNearsCompletion, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_EventScript_SternsShipyardFerryComplete
```
msgbox SlateportCity_Text_SternsShipyardFerryComplete, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_EventScript_PokemonFanClubSign
```
msgbox SlateportCity_Text_PokemonFanClubSign, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_OceanicMuseumSign
```
msgbox SlateportCity_Text_OceanicMuseumSign, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_CitySign
```
msgbox SlateportCity_Text_CitySign, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_MarketSign
```
msgbox SlateportCity_Text_MarketSign, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_HarborSign
```
lockall
goto_if_set FLAG_SYS_GAME_CLEAR, SlateportCity_EventScript_HarborSignFerryComplete
msgbox SlateportCity_Text_HarborFerryUnderConstruction, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_EventScript_HarborSignFerryComplete
```
msgbox SlateportCity_Text_HarborSign, MSGBOX_DEFAULT
releaseall
end
```
### SlateportCity_EventScript_NameRatersHouseSign
```
msgbox SlateportCity_Text_NameRatersHouseSign, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_Maniac
```
lock
faceplayer
call_if_eq VAR_SLATEPORT_CITY_STATE, 1, SlateportCity_EventScript_ManiacSternInterview
msgbox SlateportCity_Text_GetNameRaterToHelpYou, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_ManiacSternInterview
```
msgbox SlateportCity_Text_GetNameRaterToHelpYou, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_Woman2
```
msgbox SlateportCity_Text_CantChangeTradeMonName, MSGBOX_NPC
end
```
### SlateportCity_EventScript_Sailor1
```
msgbox SlateportCity_Text_SeaIsSoWet, MSGBOX_NPC
end
```
### SlateportCity_EventScript_Sailor2
```
msgbox SlateportCity_Text_SinkOldBoats, MSGBOX_NPC
end
```
### SlateportCity_EventScript_PokefanF
```
msgbox SlateportCity_Text_BuyTooMuch, MSGBOX_NPC
end
```
### SlateportCity_EventScript_Man2
```
msgbox SlateportCity_Text_BattleTentBuiltRecently, MSGBOX_NPC
end
```
### SlateportCity_EventScript_AquaGrunt1
```
lock
faceplayer
msgbox SlateportCity_Text_QuitPushing, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_1, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt2
```
lock
faceplayer
msgbox SlateportCity_Text_AquaHasPolicy, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_2, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt3
```
lock
faceplayer
msgbox SlateportCity_Text_BossIsBrilliant, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_3, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt4
```
lock
faceplayer
msgbox SlateportCity_Text_WhatsNewSchemeIWonder, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_4, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt5
```
lock
faceplayer
msgbox SlateportCity_Text_ShouldTakeItAll, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_5, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt6
```
lock
faceplayer
msgbox SlateportCity_Text_DontButtIn, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_6, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt7
```
lock
faceplayer
msgbox SlateportCity_Text_RemindsMeOfLongLineForGames, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_7, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt8
```
lock
faceplayer
msgbox SlateportCity_Text_WhyAreWeLiningUp, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_8, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_AquaGrunt9
```
lock
faceplayer
playse SE_PIN
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_Delay48
waitmovement 0
msgbox SlateportCity_Text_WhatDoYouWant, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_FaceOriginalDirection
waitmovement 0
applymovement LOCALID_SLATEPORT_GRUNT_9, SlateportCity_Movement_DelayAquaGrunt
waitmovement 0
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_FacePlayer
waitmovement 0
msgbox SlateportCity_Text_IllReadSignForYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_FaceOriginalDirection
waitmovement 0
applymovement LOCALID_SLATEPORT_GRUNT_9, SlateportCity_Movement_DelayAquaGrunt
waitmovement 0
msgbox SlateportCity_Text_SaysSomethingLikeSeaIsEndless, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_FacePlayer
waitmovement 0
applymovement LOCALID_SLATEPORT_GRUNT_9, SlateportCity_Movement_DelayAquaGrunt
waitmovement 0
applymovement LOCALID_SLATEPORT_GRUNT_9, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_Movement_DelayAquaGrunt
```
delay_16
delay_16
step_end
```
### SlateportCity_EventScript_AquaGrunt10
```
msgbox SlateportCity_Text_ShouldveBroughtMyGameBoy, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_AquaGrunt11
```
lock
faceplayer
msgbox SlateportCity_Text_HotSpringsAfterOperation, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GRUNT_11, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### SlateportCity_EventScript_DollClerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration SlateportCity_PokemartDecor_Dolls
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### SlateportCity_PokemartDecor_Dolls
```
pokemartlistend
```
### SlateportCity_EventScript_ComeBackWithSecretPower
```
msgbox gText_ComeBackWithSecretPower, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_DecorClerk
```
lock
faceplayer
goto_if_unset FLAG_RECEIVED_SECRET_POWER, SlateportCity_EventScript_ComeBackWithSecretPower
message gText_HowMayIServeYou
waitmessage
pokemartdecoration SlateportCity_PokemartDecor
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### SlateportCity_PokemartDecor
```
pokemartlistend
```
### SlateportCity_EventScript_PowerTMClerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart SlateportCity_Pokemart_PowerTMs
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### SlateportCity_Pokemart_PowerTMs
```
pokemartlistend
```
### SlateportCity_EventScript_CaptStern
```
lockall
msgbox SlateportCity_Text_SternMoveAheadWithExploration, MSGBOX_DEFAULT
msgbox SlateportCity_Text_GabbyWonderfulThanksForInterview, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_GABBY, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 10
applymovement LOCALID_SLATEPORT_TY, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
delay 25
applymovement LOCALID_SLATEPORT_CAPT_STERN, SlateportCity_Movement_SternWatchGabbyAndTyExit
applymovement LOCALID_PLAYER, SlateportCity_Movement_PlayerFaceStern
applymovement LOCALID_SLATEPORT_GABBY, SlateportCity_Movement_GabbyExit
applymovement LOCALID_SLATEPORT_TY, SlateportCity_Movement_TyExit
waitmovement 0
removeobject LOCALID_SLATEPORT_GABBY
removeobject LOCALID_SLATEPORT_TY
msgbox SlateportCity_Text_SternWhewFirstInterview, MSGBOX_DEFAULT
applymovement LOCALID_SLATEPORT_CAPT_STERN, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox SlateportCity_Text_OhPlayerWeMadeDiscovery, MSGBOX_DEFAULT
playbgm MUS_ENCOUNTER_AQUA, FALSE
msgbox SlateportCity_Text_AquaWillAssumeControlOfSubmarine, MSGBOX_DEFAULT
applymovement LOCALID_SLATEPORT_COOK, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_SLATEPORT_FAT_MAN, Common_Movement_WalkInPlaceFasterLeft
applymovement LOCALID_SLATEPORT_OLD_WOMAN, SlateportCity_Movement_OldWomanConcern
applymovement LOCALID_SLATEPORT_RICH_BOY, Common_Movement_QuestionMark
applymovement LOCALID_SLATEPORT_MAN_1, SlateportCity_Movement_ManConcern
waitmovement 0
applymovement LOCALID_SLATEPORT_CAPT_STERN, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox SlateportCity_Text_SternWhatWasAllThat, MSGBOX_DEFAULT
playse SE_PIN
applymovement LOCALID_SLATEPORT_CAPT_STERN, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_SLATEPORT_CAPT_STERN, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_SLATEPORT_CAPT_STERN, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox SlateportCity_Text_FromHarborTryingToTakeSub, MSGBOX_DEFAULT
msgbox SlateportCity_Text_PleaseComeWithMe, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_SLATEPORT_CAPT_STERN, SlateportCity_Movement_SternEnterHarbor
applymovement LOCALID_PLAYER, SlateportCity_Movement_PlayerEnterHarbor
waitmovement 0
removeobject LOCALID_SLATEPORT_CAPT_STERN
clearflag FLAG_HIDE_SLATEPORT_CITY_HARBOR_CAPTAIN_STERN
clearflag FLAG_HIDE_SLATEPORT_CITY_HARBOR_SUBMARINE_SHADOW
clearflag FLAG_HIDE_SLATEPORT_CITY_HARBOR_AQUA_GRUNT
clearflag FLAG_HIDE_SLATEPORT_CITY_HARBOR_ARCHIE
setvar VAR_SLATEPORT_CITY_STATE, 2
warp MAP_SLATEPORT_CITY_HARBOR, 11, 14
waitstate
releaseall
end
```
### SlateportCity_Movement_OldWomanConcern
```
delay_16
delay_16
emote_question_mark
walk_in_place_faster_right
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### SlateportCity_Movement_ManConcern
```
emote_question_mark
walk_in_place_faster_up
delay_16
walk_in_place_faster_down
delay_16
delay_16
walk_in_place_faster_left
step_end
```
### SlateportCity_Movement_GabbyExit
```
delay_16
walk_left
walk_left
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### SlateportCity_Movement_TyExit
```
walk_down
walk_left
walk_left
walk_left
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### SlateportCity_Movement_Unused
```
walk_down
walk_in_place_faster_up
step_end
```
### SlateportCity_Movement_SternEnterHarbor
```
walk_right
walk_up
walk_up
set_invisible
step_end
```
### SlateportCity_Movement_SternWatchGabbyAndTyExit
```
delay_16
delay_16
delay_16
delay_16
delay_16
walk_down
walk_left
step_end
```
### SlateportCity_Movement_PlayerEnterHarbor
```
walk_in_place_faster_right
delay_16
delay_16
walk_right
walk_up
step_end
```
### SlateportCity_Movement_PlayerFaceStern
```
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
delay_16
walk_in_place_faster_down
step_end
```
### SlateportCity_EventScript_Ty
```
msgbox SlateportCity_Text_BigSmileForCamera, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_Gabby
```
msgbox SlateportCity_Text_MostInvaluableExperience, MSGBOX_SIGN
end
```
### SlateportCity_EventScript_Man3
```
msgbox SlateportCity_Text_WonderIfLighthouseStartlesPokemon, MSGBOX_NPC
end
```
### SlateportCity_EventScript_BerryPowderClerk
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_POWDER_JAR, SlateportCity_EventScript_ReceivedPowderJar
msgbox SlateportCity_Text_ExplainBerries, MSGBOX_DEFAULT
giveitem ITEM_POWDER_JAR
setflag FLAG_RECEIVED_POWDER_JAR
msgbox SlateportCity_Text_ExplainBerryPowder, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_ReceivedPowderJar
```
setvar VAR_0x8004, 1
specialvar VAR_RESULT, HasEnoughBerryPowder
goto_if_eq VAR_RESULT, FALSE, SlateportCity_EventScript_ExplainBerryPowder
msgbox SlateportCity_Text_BroughtMeSomeBerryPowder, MSGBOX_DEFAULT
special DisplayBerryPowderVendorMenu
goto SlateportCity_EventScript_ChooseBerryPowderItem
end
```
### SlateportCity_EventScript_ExplainBerryPowder
```
msgbox SlateportCity_Text_ExplainBerryPowder, MSGBOX_DEFAULT
release
end
```
### SlateportCity_EventScript_ChooseBerryPowderItem
```
message SlateportCity_Text_ExchangeWhatWithIt
waitmessage
setvar VAR_0x8004, SCROLL_MULTI_BERRY_POWDER_VENDOR
special ShowScrollableMultichoice
switch VAR_RESULT
case 0, SlateportCity_EventScript_EnergyPowder
case 1, SlateportCity_EventScript_EnergyRoot
case 2, SlateportCity_EventScript_HealPowder
case 3, SlateportCity_EventScript_RevivalHerb
case 4, SlateportCity_EventScript_Protein
case 5, SlateportCity_EventScript_Iron
case 6, SlateportCity_EventScript_Carbos
case 7, SlateportCity_EventScript_Calcium
case 8, SlateportCity_EventScript_Zinc
case 9, SlateportCity_EventScript_HPUp
case 10, SlateportCity_EventScript_PPUp
case 11, SlateportCity_EventScript_CancelPowderItemSelect
case MULTI_B_PRESSED, SlateportCity_EventScript_CancelPowderItemSelect
end
```
### SlateportCity_EventScript_EnergyPowder
```
bufferitemname STR_VAR_1, ITEM_ENERGY_POWDER
setvar VAR_0x8008, ITEM_ENERGY_POWDER
setvar VAR_0x8009, 50
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_EnergyRoot
```
bufferitemname STR_VAR_1, ITEM_ENERGY_ROOT
setvar VAR_0x8008, ITEM_ENERGY_ROOT
setvar VAR_0x8009, 80
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_HealPowder
```
bufferitemname STR_VAR_1, ITEM_HEAL_POWDER
setvar VAR_0x8008, ITEM_HEAL_POWDER
setvar VAR_0x8009, 50
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_RevivalHerb
```
bufferitemname STR_VAR_1, ITEM_REVIVAL_HERB
setvar VAR_0x8008, ITEM_REVIVAL_HERB
setvar VAR_0x8009, 300
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_Protein
```
bufferitemname STR_VAR_1, ITEM_PROTEIN
setvar VAR_0x8008, ITEM_PROTEIN
setvar VAR_0x8009, 1000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_Iron
```
bufferitemname STR_VAR_1, ITEM_IRON
setvar VAR_0x8008, ITEM_IRON
setvar VAR_0x8009, 1000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_Carbos
```
bufferitemname STR_VAR_1, ITEM_CARBOS
setvar VAR_0x8008, ITEM_CARBOS
setvar VAR_0x8009, 1000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_Calcium
```
bufferitemname STR_VAR_1, ITEM_CALCIUM
setvar VAR_0x8008, ITEM_CALCIUM
setvar VAR_0x8009, 1000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_Zinc
```
bufferitemname STR_VAR_1, ITEM_ZINC
setvar VAR_0x8008, ITEM_ZINC
setvar VAR_0x8009, 1000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_HPUp
```
bufferitemname STR_VAR_1, ITEM_HP_UP
setvar VAR_0x8008, ITEM_HP_UP
setvar VAR_0x8009, 1000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_PPUp
```
bufferitemname STR_VAR_1, ITEM_PP_UP
setvar VAR_0x8008, ITEM_PP_UP
setvar VAR_0x8009, 3000
goto SlateportCity_EventScript_TryBuyBerryPowderItem
end
```
### SlateportCity_EventScript_CancelPowderItemSelect
```
msgbox SlateportCity_Text_ComeBackToTradeBerryPowder, MSGBOX_DEFAULT
special RemoveBerryPowderVendorMenu
release
end
```
### SlateportCity_EventScript_TryBuyBerryPowderItem
```
msgbox SlateportCity_Text_ExchangeBerryPowderForItem, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, SlateportCity_EventScript_ChooseBerryPowderItem
copyvar VAR_0x8004, VAR_0x8009
specialvar VAR_RESULT, HasEnoughBerryPowder
goto_if_eq VAR_RESULT, FALSE, SlateportCity_EventScript_NotEnoughBerryPowder
giveitem VAR_0x8008
goto_if_eq VAR_RESULT, FALSE, SlateportCity_EventScript_NoRoomForBerryPowderItem
copyvar VAR_0x8004, VAR_0x8009
special TakeBerryPowder
special PrintPlayerBerryPowderAmount
msgbox SlateportCity_Text_FineBerryPowderTradeSomethingElse, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, SlateportCity_EventScript_ChooseBerryPowderItem
msgbox SlateportCity_Text_WhenYouGetMoreBringItToMe, MSGBOX_DEFAULT
special RemoveBerryPowderVendorMenu
release
end
```
### SlateportCity_EventScript_NoRoomForBerryPowderItem
```
msgbox gText_TheBagIsFull, MSGBOX_DEFAULT
special RemoveBerryPowderVendorMenu
release
end
```
### SlateportCity_EventScript_NotEnoughBerryPowder
```
msgbox SlateportCity_Text_DontHaveEnoughBerryPowder, MSGBOX_DEFAULT
goto SlateportCity_EventScript_ChooseBerryPowderItem
end
```
### SlateportCity_EventScript_ScottBattleTentScene
```
lockall
applymovement LOCALID_PLAYER, Common_Movement_FaceUp
waitmovement 0
opendoor 10, 12
waitdooranim
addobject LOCALID_SLATEPORT_SCOTT
applymovement LOCALID_PLAYER, SlateportCity_Movement_PushPlayerDown
applymovement LOCALID_SLATEPORT_SCOTT, SlateportCity_Movement_ScottExitBattleTent
waitmovement 0
closedoor 10, 12
waitdooranim
msgbox SlateportCity_Text_TakingBattleTentChallenge, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, SlateportCity_Movement_PlayerWatchScottExit
applymovement LOCALID_SLATEPORT_SCOTT, SlateportCity_Movement_ScottExitAfterBattleTent
waitmovement 0
removeobject LOCALID_SLATEPORT_SCOTT
addvar VAR_SCOTT_STATE, 1
setvar VAR_SLATEPORT_OUTSIDE_MUSEUM_STATE, 3
releaseall
end
```
### SlateportCity_Movement_PushPlayerDown
```
lock_facing_direction
walk_down
unlock_facing_direction
step_end
```
### SlateportCity_Movement_PlayerWatchScottExit
```
delay_16
walk_in_place_faster_right
step_end
```
### SlateportCity_Movement_ScottExitBattleTent
```
delay_8
walk_down
step_end
```
### SlateportCity_Movement_ScottExitAfterBattleTent
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
walk_right
step_end
```
### SlateportCity_EventScript_BerryCrushRankingsSign
```
lockall
special ShowBerryCrushRankings
releaseall
end
```

## Textes (78)
### SlateportCity_Text_EnergyGuruSellWhatYouNeed
```
Je suis le MAITRE DE LA FORME!\nJ'ai tout ce qu'il vous faut!$
```
### SlateportCity_Text_OhYourPokemon
```
Oh?\nTon {STR_VAR_1}…$
```
### SlateportCity_Text_PleaseGiveItThisEffortRibbon
```
Bien joué!\pEn récompense, voici ce RUBAN \npour ton POKéMON.$
```
### SlateportCity_Text_ReceivedEffortRibbon
```
{PLAYER} reçoit le RUBAN.$
```
### SlateportCity_Text_PutEffortRibbonOnMon
```
{PLAYER} met le RUBAN \nsur {STR_VAR_1}.$
```
### SlateportCity_Text_GoForItLittleHarder
```
Il faut que tu fasses plus d'efforts.\pSi tu le fais, je donnerai quelque\nchose de chouette à ton POKéMON.$
```
### SlateportCity_Text_EffortRibbonLooksGoodOnIt
```
Oh! Ton {STR_VAR_1}, ce RUBAN \nlui va bien!$
```
### SlateportCity_Text_WonderIfLighthouseStartlesPokemon
```
La lumière du phare se voit à des\nkilomètres à la ronde.\pJe me demande si ça n'effraie pas les\nPOKéMON dans la mer.$
```
### SlateportCity_Text_SeaweedFullOfLife
```
Oh, regarde ça!\pLes algues que l'on peut prendre par\nici sont fraîches et pleines de vie.\pC'est comme si elles allaient se\ncabrer et attaquer!$
```
### SlateportCity_Text_HowTownIsBornAndGrows
```
Là où l'eau est propre, se regroupent\nles fruits de la généreuse récolte.\pEt là où les gens se rassemblent,\ns'établit un marché.\pC'est ainsi qu'une ville se crée et\nse développe.$
```
### SlateportCity_Text_SlateportWonderfulPlace
```
Faire ses achats là où l'on peut sentir\nle souffle de l'océan…\pPOIVRESSEL est un lieu si merveilleux!$
```
### SlateportCity_Text_BuyBricksSoDecorWontGetDirty
```
Si tu mets des POUPEES ou des COUSSINS\npar terre, ils seront salis.\pJe vais acheter des BRIQUES pour\nque mes POUPEES et mes COUSSINS ne\lsoient pas salis.$
```
### SlateportCity_Text_GoingToCompeteInBattleTent
```
Coool! Je vais bientôt aller me battre\ndans une TENTE DE COMBAT.\pMais avant, il faut que j'attrape\nquelques POKéMON!$
```
### SlateportCity_Text_BushedHikingFromMauville
```
Pfou… Je suis claqué…\pJe suis venu à pied de LAVANDIA.\pCette ville est immense.\nSi j'avais su, je serais venu en VELO.$
```
### SlateportCity_Text_EveryoneCallsHimCaptStern
```
POUPE, celui qui a fondé ce\nMUSEE, est aussi à la tête d'une \léquipe d'exploration sous-marine.\pAlors tout le monde l'appelle\nCAPT. POUPE.$
```
### SlateportCity_Text_WhatsLongLineOverThere
```
Qu'est-ce que c'est que ça?\nCette longue file…$
```
### SlateportCity_Text_VisitedMuseumOften
```
Lorsque j'étais enfant, je venais\nsouvent au MUSEE.\pAprès avoir vu les expositions, je\nsongeais aux mystères de la mer.$
```
### SlateportCity_Text_QuitPushing
```
Hé, toi! Arrête de pousser!\nTu vois pas que c'est la file d'attente?$
```
### SlateportCity_Text_AquaHasPolicy
```
La TEAM AQUA a une règle concernant\nle rassemblement et la dispersion sur\lle lieu de l'action.$
```
### SlateportCity_Text_BossIsBrilliant
```
Notre CHEF est brillant.\pMais que veut-il faire avec ce\nMUSEE?$
```
### SlateportCity_Text_WhatsNewSchemeIWonder
```
Je me demande en quoi va consister le\nprochain projet.\pEnervé, notre CHEF est effrayant, alors\nj'ferais bien d'pas tout faire rater.$
```
### SlateportCity_Text_ShouldTakeItAll
```
S'il y a quelque chose au MUSEE qui\npeut être utile, on n'a qu'à se servir!$
```
### SlateportCity_Text_DontButtIn
```
Hé, toi, là!\nOn ne coupe pas la queue!$
```
### SlateportCity_Text_RemindsMeOfLongLineForGames
```
Une longue file d'attente, hein?\pÇa me rappelle quand je faisais la queue\npour acheter les jeux qui cartonnaient.$
```
### SlateportCity_Text_WhyAreWeLiningUp
```
Pourquoi on fait la queue pour payer?\nOn n'a qu'à entrer après tout!$
```
### SlateportCity_Text_WhatDoYouWant
```
Quoi? Quoi?$
```
### SlateportCity_Text_IllReadSignForYou
```
Tu veux lire ce panneau?\nJe vais le lire pour toi!$
```
### SlateportCity_Text_SaysSomethingLikeSeaIsEndless
```
Voyons…\pHum… Je crois que ça dit\nque la vie dans la mer est éternelle.\pOuaip, je suis sûr que c'est ce qui\nest écrit.$
```
### SlateportCity_Text_ShouldveBroughtMyGameBoy
```
Grumpf…\pJ'aurais dû apporter ma Game Boy\nAdvance pour jouer dans la file\ld'attente…\pGrumpf…$
```
### SlateportCity_Text_HotSpringsAfterOperation
```
Quand tout sera terminé, on ira\nensemble aux sources chaudes!\pC'est ce que dit notre leader.\nJ'ai super hâte!$
```
### SlateportCity_Text_SeaIsSoWet
```
La mer est tellement vaste…\pLa mer peut-elle être faite des larmes\nversées par les POKéMON?$
```
### SlateportCity_Text_SinkOldBoats
```
Tu sais ce qu'ils font des bateaux\ndevenus trop usagés pour naviguer?\pIls les font couler dans la mer pour\nqu'ils servent de refuge aux POKéMON.$
```
### SlateportCity_Text_BuyTooMuch
```
A chaque fois que je viens ici, je me\nlaisse emporter et j'achète trop.$
```
### SlateportCity_Text_GetNameRaterToHelpYou
```
Si tu veux changer le surnom de l'un de\ntes POKéMON, va voir le SPECIALISTE\lDES NOMS.$
```
### SlateportCity_Text_CantChangeTradeMonName
```
Tu ne peux pas donner de surnom à un\nPOKéMON échangé.\pL'amour du premier DRESSEUR de ce\nPOKéMON est contenu dans ce surnom.$
```
### SlateportCity_Text_BattleTentBuiltRecently
```
Une TENTE DE COMBAT a été\nrécemment construite à POIVRESSEL.\pLes ARENES sont marrantes, mais les\nTENTES DE COMBAT, c'est autre chose.\pTu devrais y aller si tu veux te battre\ncontre des POKéMON redoutables.$
```
### SlateportCity_Text_CaptSternBeingInterviewed
```
J'espérais qu'il y aurait une grande\nstar pour avoir un autographe.\pMais qui est cet homme interviewé?\nNe serait-ce pas le CAPT. POUPE?$
```
### SlateportCity_Text_InterviewerSoCool
```
La journaliste est tellement sympa et\nsi jolie.\pQuand je serai grande, je serai\nreporter international!$
```
### SlateportCity_Text_SternSaysDiscoveredSomething
```
Le CAPT. POUPE dit qu'ils ont \ntrouvé quelque chose au fond de la mer.\pJe me demande ce que c'est…\nQu'est-ce que ça pourrait bien être?$
```
### SlateportCity_Text_CaptainComeBackWithBigFish
```
Que se passe-t-il ici?\pLe bon CAPITAINE est-il revenu du\nfond de l'océan avec une grosse prise?$
```
### SlateportCity_Text_AmIOnTV
```
Hé! Tu regardes?\nEst-ce que je passe à la télé?$
```
### SlateportCity_Text_CaptainsACelebrity
```
Une interview à la télé! Là!\nLe CAPITAINE est célèbre!$
```
### SlateportCity_Text_BigSmileForCamera
```
GUY: OK, CAPT. POUPE,\nun sourire à la caméra!$
```
### SlateportCity_Text_MostInvaluableExperience
```
INES: Je vois, je vois. Vous avez\nvécu une expérience inestimable…$
```
### SlateportCity_Text_SternMoveAheadWithExploration
```
CAPT. POUPE: En effet! Nous comptons\nprogresser grâce à notre exploration.$
```
### SlateportCity_Text_GabbyWonderfulThanksForInterview
```
INES: Merveilleux, CAPT. POUPE!\nMerci de nous avoir accordé un peu\lde votre précieux temps.\pNous espérons vous revoir pour\ndiscuter de nouvelles découvertes!$
```
### SlateportCity_Text_SternWhewFirstInterview
```
CAPT. POUPE: Ouh…\pC'était la première fois qu'on me\nfilmait pour passer à la télé.\lC'était stressant.$
```
### SlateportCity_Text_OhPlayerWeMadeDiscovery
```
Oh, {PLAYER}{KUN}!\nTu as l'air en pleine forme!\pNous avons fait une grande découverte\nen explorant les fonds marins.\pNous avons trouvé une caverne\nsous-marine sur le CHENAL 128.\pNous pensons qu'il s'agit de l'habitat\nd'un POKéMON que nous croyions disparu.$
```
### SlateportCity_Text_AquaWillAssumeControlOfSubmarine
```
Hum, hum…\nCAPT. POUPE, je suppose.\pNous, la TEAM AQUA, allons prendre\nle contrôle de votre sous-marin!\pIl est inutile de vous y opposer!\nNous comptons sur votre coopération!\pHum, hum…\nIl ne vous reste plus qu'à découvrir\lce que la TEAM AQUA a prévu de faire!$
```
### SlateportCity_Text_SternWhatWasAllThat
```
CAPT. POUPE: Qu'est-ce que ça pouvait\nbien être?\pOn aurait dit quelqu'un avec\nun mégaphone…\pD'où ce son venait-il?$
```
### SlateportCity_Text_FromHarborTryingToTakeSub
```
Ça vient de l'EMBARCADERE!\pLe sous-marin!\nIls essaient de le prendre!$
```
### SlateportCity_Text_PleaseComeWithMe
```
{PLAYER}{KUN}!\nViens avec moi!$
```
### SlateportCity_Text_BattleTentSign
```
TENTE DE COMBAT de POIVRESSEL\n“Pour les meilleurs POKéMON!”$
```
### SlateportCity_Text_SternsShipyardWantedSign
```
CHANTIER NAVAL DE POUPE\p“Recherche marin capable de\nnaviguer sur tous les courants.”$
```
### SlateportCity_Text_SternsShipyardNearsCompletion
```
CHANTIER NAVAL DE POUPE\p“Le ferry LE MARINA desservant les\nembarcadères de POIVRESSEL et\lNENUCRIQUE sera bientôt terminé.”$
```
### SlateportCity_Text_SternsShipyardFerryComplete
```
CHANTIER NAVAL DE POUPE\p“L'embarquement sur le ferry\nLE MARINA entre POIVRESSEL et\lNENUCRIQUE se fait a l'EMBARCADERE.”$
```
### SlateportCity_Text_PokemonFanClubSign
```
FAN CLUB POKéMON\n“Pour tous les fans de POKéMON!”$
```
### SlateportCity_Text_OceanicMuseumSign
```
“La mer infinie supporte\ntoutes les formes de vie.”\pMUSEE OCEANOGRAPHIQUE$
```
### SlateportCity_Text_CitySign
```
POIVRESSEL\p“Le port où le chemin des hommes\net celui des POKéMON se croisent.”$
```
### SlateportCity_Text_MarketSign
```
MARCHE DE POIVRESSEL\n“Des objets uniques introuvables\lailleurs!”$
```
### SlateportCity_Text_HarborFerryUnderConstruction
```
EMBARCADERE DE POIVRESSEL\p“Le ferry LE MARINA est\nen construction au CHANTIER NAVAL.”\p“Il devrait entrer en service\nsous peu.”$
```
### SlateportCity_Text_HarborSign
```
EMBARCADERE DE POIVRESSEL\p“Profitez d'une merveilleuse croisière\nsur LE MARINA.”$
```
### SlateportCity_Text_NameRatersHouseSign
```
MAISON DU SPECIALISTE DES NOMS\n“Conseil en surnoms de POKéMON.”$
```
### SlateportCity_Text_ExplainBerries
```
Si un POKéMON sauvage est blessé,\nil se soigne en mâchant des BAIES.\pTu le savais?\pEn voyant ça, quelqu'un a eu l'idée de\nfaire des médicaments à base de\lBAIES.\pTu le savais?\pPour transformer des BAIES en\nmédicaments, il faut les réduire\len poudre.\pTu le savais?\pOn dirait que tu t'intéresses\naux BAIES!\pJ'ai quelque chose qui va sûrement\nte plaire!$
```
### SlateportCity_Text_ExplainBerryPowder
```
J'ai récemment fait installer des\nmachines pour broyer les BAIES\ldans les CENTRES POKéMON.\pLes BROYEURS DE BAIES se\ntrouvent dans la SALLE LINK DIRECT.\pTu le savais?\pPourrais-tu aller faire de la\nPOUDRE BAIE pour moi en\putilisant ces machines?\pJe ferai une préparation juste\npour toi si tu arrives à broyer\pdes BAIES et à me ramener\nla POUDRE BAIE.$
```
### SlateportCity_Text_BroughtMeSomeBerryPowder
```
M'as-tu amené de la POUDRE BAIE?$
```
### SlateportCity_Text_ExchangeWhatWithIt
```
Contre quoi veux-tu l'échanger?$
```
### SlateportCity_Text_ExchangeBerryPowderForItem
```
Je vais te donner 1 {STR_VAR_1}\ncontre la POUDRE BAIE.$
```
### SlateportCity_Text_DontHaveEnoughBerryPowder
```
Hmm.\nTu n'as pas assez de POUDRE BAIE.$
```
### SlateportCity_Text_FineBerryPowderTradeSomethingElse
```
Cette POUDRE BAIE a l'air bonne.\nÇa fera de bons médicaments.\pTu veux échanger ce qui te reste de\nPOUDRE BAIE contre autre chose?$
```
### SlateportCity_Text_WhenYouGetMoreBringItToMe
```
OK! Reviens-me voir quand tu auras\nplus de POUDRE BAIE!$
```
### SlateportCity_Text_ComeBackToTradeBerryPowder
```
Reviens me voir si tu veux échanger\nde la POUDRE BAIE contre des\lmédicaments.\pJe fais toujours des affaires ici.\pTu le savais?$
```
### SlateportCity_Text_YouDroveTeamAquaAway
```
SCOTT: Hein?\nC'est pas la première fois qu'on se\lrencontre, non?\pEst-ce que je me suis déjà présenté?\nJe m'appelle SCOTT.\pJe viens de voir la TEAM AQUA partir\nd'ici en trombe.\pLaisse-moi deviner… C'est toi\nqui les as fait fuir?$
```
### SlateportCity_Text_MaybeThisTrainer
```
SCOTT: Hum…\nPeut-être…\pPeut-être que ce DRESSEUR…$
```
### SlateportCity_Text_LetsRegisterEachOther
```
SCOTT: Très bien! Je pense que nous\nallons devenir amis.\pEchangeons nos numéros pour les\nenregistrer dans nos POKéNAVS.\p… … … … … …$
```
### SlateportCity_Text_RegisteredScott
```
Vous avez enregistré SCOTT dans\nle POKéNAV.$
```
### SlateportCity_Text_KeepEyeOnTrainersBeSeeingYou
```
SCOTT: J'aimerais bien rester un peu\navec toi, mais je veux aussi garder un\lœil sur les autres gens talentueux.\pAlors je vais visiter les autres villes\npendant quelque temps encore.\pA bientôt, {PLAYER}{KUN}!$
```
### SlateportCity_Text_TakingBattleTentChallenge
```
SCOTT: Oh, mais…\nC'est bien toi, {PLAYER}{KUN}!\p{PLAYER}{KUN}, je suis sûr que tu veux\nparticiper au défi de la\lTENTE DE COMBAT!\pC'est une bonne idée!\nC'est même une très bonne idée!\pAprès tout, les bons DRESSEURS\nse doivent d'aller dans les\lTENTES DE COMBAT!\pDonne-toi à fond!$
```

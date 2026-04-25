# LilycoveCity_ContestLobby

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_CONTEST_LOBBY`
- **layout** : `LAYOUT_LILYCOVE_CITY_CONTEST_LOBBY`
- **music** : `MUS_CONTEST_LOBBY`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (25 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_CONTEST_LOBBY_RECEPTIONIST` | `OBJ_EVENT_GFX_TEALA` | 14,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_ContestLobby_EventScript_ContestReceptionist` | `0` |
| `LOCALID_CONTEST_LOBBY_LINK_RECEPTIONIST` | `OBJ_EVENT_GFX_TEALA` | 15,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_ContestLobby_EventScript_LinkContestReceptionist` | `0` |
| `LOCALID_CONTEST_LOBBY_BLENDER_2_LEADER` | `OBJ_EVENT_GFX_MAN_4` | 26,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `BerryBlender_EventScript_Blender2Man` | `0` |
| `LOCALID_CONTEST_LOBBY_ARTIST` | `OBJ_EVENT_GFX_ARTIST` | 9,1 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_CONTEST_ATTENDANT_1` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 18,8 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_ContestLobby_EventScript_BlackBelt` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 4,9 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_ContestLobby_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_ARTIST` | 3,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_ContestLobby_EventScript_Artist` | `0` |
| `` | `OBJ_EVENT_GFX_REPORTER_M` | 13,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_ContestLobby_EventScript_Reporter` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_REPORTER` |
| `LOCALID_CONTEST_LOBBY_BLENDER_3_PARTICIPANT_1` | `OBJ_EVENT_GFX_BOY_1` | 23,8 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_ContestLobby_EventScript_Blender3Boy` | `0` |
| `LOCALID_CONTEST_LOBBY_BLENDER_2_PARTICIPANT` | `OBJ_EVENT_GFX_TWIN` | 28,9 | `MOVEMENT_TYPE_FACE_LEFT` | `BerryBlender_EventScript_Blender2Twin` | `0` |
| `LOCALID_CONTEST_LOBBY_LINK_ARTIST` | `OBJ_EVENT_GFX_ARTIST` | 21,1 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_CONTEST_ATTENDANT_2` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 5,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_ContestLobby_EventScript_Fisherman` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 0,8 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_ContestLobby_EventScript_FatMan` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 8,7 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `LilycoveCity_ContestLobby_EventScript_NinjaBoy` | `0` |
| `LOCALID_CONTEST_LOBBY_BLENDER_3_LEADER` | `OBJ_EVENT_GFX_POKEFAN_F` | 22,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `BerryBlender_EventScript_Blender3PokefanF` | `0` |
| `LOCALID_BLEND_MASTER` | `OBJ_EVENT_GFX_EXPERT_M` | 26,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `BerryBlender_EventScript_Blender1ExpertM` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER_REPLACEMENT` |
| `LOCALID_CONTEST_LOBBY_BLENDER_3_PARTICIPANT_2` | `OBJ_EVENT_GFX_GIRL_1` | 24,9 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_ContestLobby_EventScript_Blender3Girl` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 27,3 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker2` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 28,3 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker3` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 28,7 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker4` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_2` | 26,7 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker5` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 27,7 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker6` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 26,3 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker1` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 26,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_ContestLobby_EventScript_BlendMaster` | `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER` |
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 9,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_ContestLobby_EventScript_LittleGirl` | `0` |

## Warps (4)
- #0 (14,11) → `MAP_LILYCOVE_CITY` warp #4
- #1 (15,11) → `MAP_LILYCOVE_CITY` warp #4
- #2 (9,1) → `MAP_LILYCOVE_CITY_CONTEST_HALL` warp #0
- #3 (21,1) → `MAP_LILYCOVE_CITY_CONTEST_HALL` warp #1

## BG events / signs (12)
- (23,5) [sign] → `BerryBlender_EventScript_BerryBlenderLink`
- (23,9) [sign] → `BerryBlender_EventScript_BerryBlender3`
- (23,1) [sign] → `LilycoveCity_ContestLobby_EventScript_ContestWinner4`
- (25,1) [sign] → `LilycoveCity_ContestLobby_EventScript_ContestWinner5`
- (27,1) [sign] → `LilycoveCity_ContestLobby_EventScript_ContestWinner6`
- (30,1) [sign] → `LilycoveCity_ContestLobby_EventScript_BerryBlenderSpeedRecords`
- (3,1) [sign] → `LilycoveCity_ContestLobby_EventScript_ContestWinner1`
- (5,1) [sign] → `LilycoveCity_ContestLobby_EventScript_ContestWinner2`
- (7,1) [sign] → `LilycoveCity_ContestLobby_EventScript_ContestWinner3`
- (27,5) [sign] → `BerryBlender_EventScript_BerryBlender1`
- (27,9) [sign] → `BerryBlender_EventScript_BerryBlender2`
- (18,3) [sign] → `LilycoveCity_ContestLobby_EventScript_LinkContestResults`

## Flags référencés (16)
- `FLAG_BEAUTY_PAINTING_MADE`
- `FLAG_COOL_PAINTING_MADE`
- `FLAG_CUTE_PAINTING_MADE`
- `FLAG_ENTERED_CONTEST`
- `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER`
- `FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER_REPLACEMENT`
- `FLAG_HIDE_LILYCOVE_MUSEUM_CURATOR`
- `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_1`
- `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_2`
- `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_3`
- `FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_4`
- `FLAG_HIDE_LILYCOVE_MUSEUM_TOURISTS`
- `FLAG_RECEIVED_POKEBLOCK_CASE`
- `FLAG_SMART_PAINTING_MADE`
- `FLAG_SYS_RIBBON_GET`
- `FLAG_TOUGH_PAINTING_MADE`

## Variables référencées (14)
- `VAR_0x8004`
- `VAR_0x8008`
- `VAR_0x800B`
- `VAR_2`
- `VAR_CONTEST_CATEGORY`
- `VAR_CONTEST_HALL_STATE`
- `VAR_CONTEST_RANK`
- `VAR_CONTEST_TYPE`
- `VAR_LAST_TALKED`
- `VAR_LILYCOVE_CONTEST_LOBBY_STATE`
- `VAR_LILYCOVE_MUSEUM_2F_STATE`
- `VAR_RESULT`
- `VAR_TEMP_C`
- `VAR_TEMP_D`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `BerryBlender_Text_BlendWithTheBlendMaster`
- `BerryBlender_Text_MadeAmazingPokeblocksWithMaster`
- `BerryBlender_Text_MasterWorksOnSkillsInMountains`
- `BerryBlender_Text_QualitiesOfBlendMaster`
- `BerryBlender_Text_WhatAnExpert`
- `BerryBlender_Text_WhoaAwesome`
- `BerryBlender_Text_WickedlyFast`
- `LilycoveCity_ContestLobby_EventScript_SetPlayerGfx`
- `Text_LinkErrorPleaseReset`
### data/scripts/contest_hall.inc
- `LilycoveCity_ContestLobby_EventScript_DelayIfContestWithRSPlayer`
- `LilycoveCity_ContestLobby_EventScript_SpeakToContestReceptionist`
### data/scripts/interview.inc
- `LilycoveCity_ContestLobby_EventScript_TryShowContestReporter`
### data/scripts/std_msgbox.inc
- `Common_EventScript_SaveGame`

## Scripts (128)
### LilycoveCity_ContestLobby_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LilycoveCity_ContestLobby_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, LilycoveCity_ContestLobby_OnFrame
```
### LilycoveCity_ContestLobby_OnTransition
```
call LilycoveCity_ContestLobby_EventScript_TryShowContestReporter
call LilycoveCity_ContestLobby_EventScript_TryShowBlendMaster
end
```
### LilycoveCity_ContestLobby_EventScript_TryShowBlendMaster
```
getpokenewsactive POKENEWS_BLENDMASTER
goto_if_eq VAR_RESULT, TRUE, LilycoveCity_ContestLobby_EventScript_ShowBlendMaster
clearflag FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER_REPLACEMENT
setflag FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER
return
```
### LilycoveCity_ContestLobby_EventScript_ShowBlendMaster
```
setflag FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER_REPLACEMENT
clearflag FLAG_HIDE_LILYCOVE_CONTEST_HALL_BLEND_MASTER
return
```
### LilycoveCity_ContestLobby_OnFrame
```
map_script_2 VAR_LILYCOVE_CONTEST_LOBBY_STATE, 1, LilycoveCity_ContestLobby_EventScript_TryDoContestArtist
map_script_2 VAR_LILYCOVE_CONTEST_LOBBY_STATE, 2, LilycoveCity_ContestLobby_EventScript_TryDoLinkContestArtist
```
### LilycoveCity_ContestLobby_EventScript_TryDoContestArtist
```
goto_if_set FLAG_HIDE_LILYCOVE_MUSEUM_CURATOR, LilycoveCity_ContestLobby_EventScript_ContestArtist
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 0
end
```
### LilycoveCity_ContestLobby_EventScript_ContestArtist
```
lockall
addobject LOCALID_CONTEST_LOBBY_ARTIST
applymovement LOCALID_CONTEST_LOBBY_ARTIST, LilycoveCity_ContestLobby_Movement_ArtistApproachPlayer
waitmovement LOCALID_CONTEST_LOBBY_ARTIST
applymovement LOCALID_PLAYER, LilycoveCity_ContestLobby_Movement_PlayerFaceArtist
waitmovement 0
msgbox LilycoveCity_ContestLobby_Text_YourPokemonSpurredMeToPaint, MSGBOX_DEFAULT
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_ARTIST
lockall
msgbox LilycoveCity_ContestLobby_Text_ShouldITakePaintingToMuseum, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, LilycoveCity_ContestLobby_EventScript_TakePaintingToMuseum
goto_if_eq VAR_RESULT, NO, LilycoveCity_ContestLobby_EventScript_ConfirmDontTakePainting
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_TakePaintingToMuseum
```
msgbox LilycoveCity_ContestLobby_Text_IllTakePaintingToMuseum, MSGBOX_DEFAULT
closemessage
special SaveMuseumContestPainting
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 0
specialvar VAR_RESULT, GiveMonArtistRibbon
call_if_eq VAR_RESULT, TRUE, LilycoveCity_ContestLobby_EventScript_ReceivedArtistRibbon
applymovement LOCALID_CONTEST_LOBBY_ARTIST, LilycoveCity_ContestLobby_Movement_ArtistExit
waitmovement 0
removeobject LOCALID_CONTEST_LOBBY_ARTIST
call LilycoveCity_ContestLobby_EventScript_UpdateMuseumPatrons
call LilycoveCity_ContestLobby_EventScript_SetPaintingFlag
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ConfirmDontTakePainting
```
msgbox LilycoveCity_ContestLobby_Text_TakeHomeButIdLikeToTakeToMuseum, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, LilycoveCity_ContestLobby_EventScript_TakePaintingToMuseum
msgbox LilycoveCity_ContestLobby_Text_FineThatsTheWayItIs, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_CONTEST_LOBBY_ARTIST, LilycoveCity_ContestLobby_Movement_ArtistExit
waitmovement 0
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 0
removeobject LOCALID_CONTEST_LOBBY_ARTIST
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ReceivedArtistRibbon
```
incrementgamestat GAME_STAT_RECEIVED_RIBBONS
special BufferContestWinnerMonName
applymovement LOCALID_CONTEST_LOBBY_ARTIST, LilycoveCity_ContestLobby_Movement_ArtistBeginToExit
waitmovement 0
playse SE_PIN
applymovement LOCALID_CONTEST_LOBBY_ARTIST, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_CONTEST_LOBBY_ARTIST, LilycoveCity_ContestLobby_Movement_ArtistReturnToPlayer
waitmovement 0
msgbox LilycoveCity_ContestLobby_Text_TakeMementoOfPainting, MSGBOX_DEFAULT
playfanfare MUS_OBTAIN_ITEM
msgbox LilycoveCity_ContestLobby_Text_ReceivedARibbon, MSGBOX_DEFAULT
waitfanfare
msgbox LilycoveCity_ContestLobby_Text_PutTheRibbonOnMon, MSGBOX_DEFAULT
msgbox LilycoveCity_ContestLobby_Text_OkaySeeYou, MSGBOX_DEFAULT
closemessage
return
```
### LilycoveCity_ContestLobby_EventScript_UpdateMuseumPatrons
```
specialvar VAR_0x8004, CountPlayerMuseumPaintings
switch VAR_0x8004
case 1, LilycoveCity_ContestLobby_EventScript_ShowPatron1
case 2, LilycoveCity_ContestLobby_EventScript_ShowPatron2
case 3, LilycoveCity_ContestLobby_EventScript_ShowPatron3
case 4, LilycoveCity_ContestLobby_EventScript_ShowPatron4
case 5, LilycoveCity_ContestLobby_EventScript_ShowTourists
return
```
### LilycoveCity_ContestLobby_EventScript_ShowPatron1
```
clearflag FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_1
return
```
### LilycoveCity_ContestLobby_EventScript_ShowPatron2
```
clearflag FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_2
return
```
### LilycoveCity_ContestLobby_EventScript_ShowPatron3
```
clearflag FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_3
return
```
### LilycoveCity_ContestLobby_EventScript_ShowPatron4
```
clearflag FLAG_HIDE_LILYCOVE_MUSEUM_PATRON_4
return
```
### LilycoveCity_ContestLobby_EventScript_ShowTourists
```
clearflag FLAG_HIDE_LILYCOVE_MUSEUM_TOURISTS
return
```
### LilycoveCity_ContestLobby_EventScript_SetPaintingFlag
```
switch VAR_CONTEST_CATEGORY
case CONTEST_CATEGORY_COOL, LilycoveCity_ContestLobby_EventScript_MadeCoolPainting
case CONTEST_CATEGORY_BEAUTY, LilycoveCity_ContestLobby_EventScript_MadeBeautyPainting
case CONTEST_CATEGORY_CUTE, LilycoveCity_ContestLobby_EventScript_MadeCutePainting
case CONTEST_CATEGORY_SMART, LilycoveCity_ContestLobby_EventScript_MadeSmartPainting
case CONTEST_CATEGORY_TOUGH, LilycoveCity_ContestLobby_EventScript_MadeToughPainting
return
```
### LilycoveCity_ContestLobby_EventScript_MadeCoolPainting
```
setflag FLAG_COOL_PAINTING_MADE
return
```
### LilycoveCity_ContestLobby_EventScript_MadeBeautyPainting
```
setflag FLAG_BEAUTY_PAINTING_MADE
return
```
### LilycoveCity_ContestLobby_EventScript_MadeCutePainting
```
setflag FLAG_CUTE_PAINTING_MADE
return
```
### LilycoveCity_ContestLobby_EventScript_MadeSmartPainting
```
setflag FLAG_SMART_PAINTING_MADE
return
```
### LilycoveCity_ContestLobby_EventScript_MadeToughPainting
```
setflag FLAG_TOUGH_PAINTING_MADE
return
```
### LilycoveCity_ContestLobby_Movement_ArtistApproachPlayer
```
walk_down
walk_down
walk_down
walk_right
walk_right
walk_right
walk_right
step_end
```
### LilycoveCity_ContestLobby_Movement_ArtistExit
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### LilycoveCity_ContestLobby_Movement_PlayerFaceArtist
```
walk_in_place_faster_left
step_end
```
### LilycoveCity_ContestLobby_Movement_ArtistBeginToExit
```
walk_down
walk_down
walk_down
step_end
```
### LilycoveCity_ContestLobby_Movement_ArtistReturnToPlayer
```
delay_16
delay_16
delay_16
delay_16
walk_fast_up
walk_fast_up
walk_fast_up
walk_in_place_faster_right
step_end
```
### LilycoveCity_ContestLobby_EventScript_TryDoLinkContestArtist
```
goto_if_set FLAG_HIDE_LILYCOVE_MUSEUM_CURATOR, LilycoveCity_ContestLobby_EventScript_LinkContestArtist
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 0
end
```
### LilycoveCity_ContestLobby_EventScript_LinkContestArtist
```
lockall
addobject LOCALID_CONTEST_LOBBY_LINK_ARTIST
applymovement LOCALID_CONTEST_LOBBY_LINK_ARTIST, LilycoveCity_ContestLobby_Movement_LinkArtistApproachPlayer
waitmovement LOCALID_CONTEST_LOBBY_LINK_ARTIST
applymovement LOCALID_PLAYER, LilycoveCity_ContestLobby_Movement_PlayerFaceLinkArtist
waitmovement 0
msgbox LilycoveCity_ContestLobby_Text_YourPokemonSpurredMeToPaint, MSGBOX_DEFAULT
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_ARTIST
msgbox LilycoveCity_ContestLobby_Text_ShouldITakePaintingToMuseum, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, LilycoveCity_ContestLobby_EventScript_TakePaintingToMuseumLink
goto_if_eq VAR_RESULT, NO, LilycoveCity_ContestLobby_EventScript_ConfirmDontTakePaintingLink
end
```
### LilycoveCity_ContestLobby_EventScript_TakePaintingToMuseumLink
```
msgbox LilycoveCity_ContestLobby_Text_IllTakePaintingToMuseum, MSGBOX_DEFAULT
closemessage
special SaveMuseumContestPainting
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 0
specialvar VAR_RESULT, GiveMonArtistRibbon
call_if_eq VAR_RESULT, TRUE, LilycoveCity_ContestLobby_EventScript_ReceivedLinkArtistRibbon
applymovement LOCALID_CONTEST_LOBBY_LINK_ARTIST, LilycoveCity_ContestLobby_Movement_LinkArtistExit
waitmovement 0
removeobject LOCALID_CONTEST_LOBBY_LINK_ARTIST
call LilycoveCity_ContestLobby_EventScript_UpdateMuseumPatrons
call LilycoveCity_ContestLobby_EventScript_SetPaintingFlag
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ConfirmDontTakePaintingLink
```
msgbox LilycoveCity_ContestLobby_Text_TakeHomeButIdLikeToTakeToMuseum, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, LilycoveCity_ContestLobby_EventScript_TakePaintingToMuseumLink
msgbox LilycoveCity_ContestLobby_Text_FineThatsTheWayItIs, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_CONTEST_LOBBY_LINK_ARTIST, LilycoveCity_ContestLobby_Movement_LinkArtistExit
waitmovement 0
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 0
removeobject LOCALID_CONTEST_LOBBY_LINK_ARTIST
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ReceivedLinkArtistRibbon
```
incrementgamestat GAME_STAT_RECEIVED_RIBBONS
setflag FLAG_SYS_RIBBON_GET
special BufferContestWinnerMonName
applymovement LOCALID_CONTEST_LOBBY_LINK_ARTIST, LilycoveCity_ContestLobby_Movement_LinkArtistBeginExit
waitmovement 0
playse SE_PIN
applymovement LOCALID_CONTEST_LOBBY_LINK_ARTIST, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_CONTEST_LOBBY_LINK_ARTIST, LilycoveCity_ContestLobby_Movement_LinkArtistReturnToPlayer
waitmovement 0
msgbox LilycoveCity_ContestLobby_Text_TakeMementoOfPainting, MSGBOX_DEFAULT
playfanfare MUS_OBTAIN_ITEM
msgbox LilycoveCity_ContestLobby_Text_ReceivedARibbon, MSGBOX_DEFAULT
waitfanfare
msgbox LilycoveCity_ContestLobby_Text_PutTheRibbonOnMon, MSGBOX_DEFAULT
msgbox LilycoveCity_ContestLobby_Text_OkaySeeYou, MSGBOX_DEFAULT
closemessage
return
```
### LilycoveCity_ContestLobby_Movement_LinkArtistApproachPlayer
```
walk_down
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_left
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkArtistExit
```
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
walk_down
step_end
```
### LilycoveCity_ContestLobby_Movement_PlayerFaceLinkArtist
```
walk_in_place_faster_right
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkArtistBeginExit
```
walk_down
walk_down
walk_down
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkArtistReturnToPlayer
```
delay_16
delay_16
delay_16
delay_16
walk_fast_up
walk_fast_up
walk_fast_up
walk_in_place_faster_left
step_end
```
### LilycoveCity_ContestLobby_EventScript_ContestReceptionist
```
special ClearLinkContestFlags
specialvar VAR_RESULT, IsContestDebugActive  @ Always FALSE
goto_if_eq VAR_RESULT, TRUE, LilycoveCity_ContestLobby_EventScript_SetDebug
call LilycoveCity_ContestLobby_EventScript_SpeakToContestReceptionist
call LilycoveCity_ContestLobby_EventScript_LeadToContestHall
special SetContestTrainerGfxIds
call LilycoveCity_ContestLobby_EventScript_SetPlayerGfx
call LilycoveCity_ContestLobby_EventScript_SetContestType
call LilycoveCity_ContestLobby_EventScript_WarpToContestHall
waitstate
end
```
### LilycoveCity_ContestLobby_EventScript_SetContestType
```
switch VAR_CONTEST_RANK
case CONTEST_RANK_NORMAL, LilycoveCity_ContestLobby_EventScript_SetNormalContestType
case CONTEST_RANK_SUPER, LilycoveCity_ContestLobby_EventScript_SetSuperContestType
case CONTEST_RANK_HYPER, LilycoveCity_ContestLobby_EventScript_SetHyperContestType
case CONTEST_RANK_MASTER, LilycoveCity_ContestLobby_EventScript_SetMasterContestType
return
```
### LilycoveCity_ContestLobby_EventScript_SetNormalContestType
```
setvar VAR_CONTEST_TYPE, CONTEST_TYPE_NPC_NORMAL
return
```
### LilycoveCity_ContestLobby_EventScript_SetSuperContestType
```
setvar VAR_CONTEST_TYPE, CONTEST_TYPE_NPC_SUPER
return
```
### LilycoveCity_ContestLobby_EventScript_SetHyperContestType
```
setvar VAR_CONTEST_TYPE, CONTEST_TYPE_NPC_HYPER
return
```
### LilycoveCity_ContestLobby_EventScript_SetMasterContestType
```
setvar VAR_CONTEST_TYPE, CONTEST_TYPE_NPC_MASTER
return
```
### LilycoveCity_ContestLobby_EventScript_SetDebug
```
setflag FLAG_HIDE_LILYCOVE_MUSEUM_CURATOR
#ifdef UBFIX
setvar VAR_LILYCOVE_MUSEUM_2F_STATE, 1
#else
copyvar VAR_LILYCOVE_MUSEUM_2F_STATE, 1, warn=FALSE
#endif
additem ITEM_CONTEST_PASS
setvar VAR_0x800B, 8
setvar VAR_CONTEST_RANK, CONTEST_RANK_MASTER
setvar VAR_LILYCOVE_CONTEST_LOBBY_STATE, 1
setflag FLAG_SYS_RIBBON_GET
end
```
### LilycoveCity_ContestLobby_EventScript_WarpToContestHall
```
setflag FLAG_ENTERED_CONTEST
switch VAR_CONTEST_CATEGORY
case CONTEST_CATEGORY_COOL, LilycoveCity_ContestLobby_EventScript_WarpToCoolContestHall
case CONTEST_CATEGORY_BEAUTY, LilycoveCity_ContestLobby_EventScript_WarpToBeautyContestHall
case CONTEST_CATEGORY_CUTE, LilycoveCity_ContestLobby_EventScript_WarpToCuteContestHall
case CONTEST_CATEGORY_SMART, LilycoveCity_ContestLobby_EventScript_WarpToSmartContestHall
case CONTEST_CATEGORY_TOUGH, LilycoveCity_ContestLobby_EventScript_WarpToToughContestHall
return
```
### LilycoveCity_ContestLobby_EventScript_WarpToCoolContestHall
```
setwarp MAP_CONTEST_HALL_COOL, 7, 5
special DoContestHallWarp
return
```
### LilycoveCity_ContestLobby_EventScript_WarpToBeautyContestHall
```
setwarp MAP_CONTEST_HALL_BEAUTY, 7, 5
special DoContestHallWarp
return
```
### LilycoveCity_ContestLobby_EventScript_WarpToCuteContestHall
```
setwarp MAP_CONTEST_HALL_CUTE, 7, 5
special DoContestHallWarp
return
```
### LilycoveCity_ContestLobby_EventScript_WarpToSmartContestHall
```
setwarp MAP_CONTEST_HALL_SMART, 7, 5
special DoContestHallWarp
return
```
### LilycoveCity_ContestLobby_EventScript_WarpToToughContestHall
```
setwarp MAP_CONTEST_HALL_TOUGH, 7, 5
special DoContestHallWarp
return
```
### LilycoveCity_ContestLobby_EventScript_LeadToContestHall
```
lockall
applymovement LOCALID_CONTEST_LOBBY_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_ReceptionistApproachCounter
waitmovement 0
playse SE_BRIDGE_WALK
setmetatile 12, 2, METATILE_Contest_WallShadow, TRUE
setmetatile 12, 3, METATILE_Contest_FloorShadow, TRUE
special DrawWholeMapView
applymovement LOCALID_CONTEST_LOBBY_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_ReceptionistExitCounter
waitmovement 0
playse SE_BRIDGE_WALK
setmetatile 12, 2, METATILE_Contest_CounterFlap_Top, TRUE
setmetatile 12, 3, METATILE_Contest_CounterFlap_Bottom, TRUE
special DrawWholeMapView
delay 20
applymovement LOCALID_CONTEST_LOBBY_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_ReceptionistFacePlayer
waitmovement 0
applymovement LOCALID_PLAYER, LilycoveCity_ContestLobby_Movement_PlayerApproachReceptionist
waitmovement 0
msgbox LilycoveCity_ContestLobby_Text_ComeThroughHere, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_CONTEST_LOBBY_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_ReceptionistWalkToContestHall
applymovement LOCALID_PLAYER, LilycoveCity_ContestLobby_Movement_PlayerWalkToContestHall
waitmovement 0
releaseall
return
```
### LilycoveCity_ContestLobby_Movement_PlayerWalkToContestHall
```
walk_left
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
delay_8
set_invisible
step_end
```
### LilycoveCity_ContestLobby_Movement_PlayerApproachReceptionist
```
walk_in_place_faster_left
walk_left
step_end
```
### LilycoveCity_ContestLobby_Movement_ReceptionistApproachCounter
```
walk_left
walk_left
walk_in_place_faster_down
step_end
```
### LilycoveCity_ContestLobby_Movement_ReceptionistExitCounter
```
walk_down
walk_down
walk_in_place_faster_up
step_end
```
### LilycoveCity_ContestLobby_Movement_ReceptionistWalkToContestHall
```
walk_left
walk_left
walk_left
walk_up
walk_up
walk_up
delay_8
set_invisible
step_end
```
### LilycoveCity_ContestLobby_Movement_ReceptionistFacePlayer
```
walk_in_place_faster_right
step_end
```
### LilycoveCity_ContestLobby_EventScript_BlackBelt
```
msgbox LilycoveCity_ContestLobby_Text_MasterRankHereICome, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_Girl
```
msgbox LilycoveCity_ContestLobby_Text_WholeVarietyOfPokemonHere, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_Artist
```
msgbox LilycoveCity_ContestLobby_Text_ContestFeastForEyes, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_FatMan
```
msgbox LilycoveCity_ContestLobby_Text_ToughContestIsExtreme, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_Fisherman
```
msgbox LilycoveCity_ContestLobby_Text_LavishedCareOnMon, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_NinjaBoy
```
msgbox LilycoveCity_ContestLobby_Text_MadePokeblocksWithFamily, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_ContestWinner1
```
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_HALL_1
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ContestWinner2
```
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_HALL_2
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ContestWinner3
```
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_HALL_3
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ContestWinner4
```
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_HALL_4
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ContestWinner5
```
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_HALL_5
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_ContestWinner6
```
lockall
fadescreen FADE_TO_BLACK
showcontestpainting CONTEST_WINNER_HALL_6
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_Blender3Boy
```
msgbox BerryBlender_Text_LetsGetBlendingAlready, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_Blender3Girl
```
msgbox BerryBlender_Text_WhatKindOfPokeblockWillIGet, MSGBOX_NPC
end
```
### LilycoveCity_ContestLobby_EventScript_BerryBlenderSpeedRecords
```
lockall
special ShowBerryBlenderRecordWindow
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_LinkContestResults
```
lockall
frontier_results FACILITY_LINK_CONTEST
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMaster
```
lock
faceplayer
msgbox BerryBlender_Text_BlendWithTheBlendMaster, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_FaceOriginalDirection
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker1
```
lock
msgbox BerryBlender_Text_WhoaAwesome, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker2
```
lock
msgbox BerryBlender_Text_WickedlyFast, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker3
```
lock
msgbox BerryBlender_Text_WhatAnExpert, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker4
```
lock
faceplayer
msgbox BerryBlender_Text_MadeAmazingPokeblocksWithMaster, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_FaceOriginalDirection
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker5
```
lock
faceplayer
msgbox BerryBlender_Text_QualitiesOfBlendMaster, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_FaceOriginalDirection
end
```
### LilycoveCity_ContestLobby_EventScript_BlendMasterOnlooker6
```
lock
faceplayer
msgbox BerryBlender_Text_MasterWorksOnSkillsInMountains, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_FaceOriginalDirection
end
```
### LilycoveCity_ContestLobby_EventScript_FaceOriginalDirection
```
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### LilycoveCity_ContestLobby_EventScript_LinkContestReceptionist
```
special ClearLinkContestFlags
lock
faceplayer
msgbox LilycoveCity_ContestLobby_Text_LinkContestReception, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_AskEnterLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_AskEnterLinkContest
```
message LilycoveCity_ContestLobby_Text_EnterContest3
waitmessage
multichoice 0, 0, MULTI_ENTERINFO, FALSE
switch VAR_RESULT
case 0, LilycoveCity_ContestLobby_EventScript_TryEnterLinkContest
case 1, LilycoveCity_ContestLobby_EventScript_LinkContestInfo
case 2, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
case MULTI_B_PRESSED, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_TryEnterLinkContest
```
msgbox LilycoveCity_ContestLobby_Text_ProgressWillBeSaved, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
call Common_EventScript_SaveGame
goto_if_eq VAR_RESULT, FALSE, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
message LilycoveCity_ContestLobby_Text_WhichContestMode
waitmessage
specialvar VAR_TEMP_D, IsWirelessAdapterConnected
multichoice 0, 0, MULTI_LINK_CONTEST_MODE, FALSE
switch VAR_RESULT
case 0, LilycoveCity_ContestLobby_EventScript_EmeraldMode  @ Shortened to E-Mode
case 1, LilycoveCity_ContestLobby_EventScript_GlobalMode   @ Shortened to G-Mode
case 2, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
case MULTI_B_PRESSED, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_EmeraldMode
```
setvar VAR_TEMP_C, 0
goto LilycoveCity_ContestLobby_EventScript_ChooseLinkContestType
end
```
### LilycoveCity_ContestLobby_EventScript_GlobalMode
```
setvar VAR_TEMP_C, 1
goto_if_eq VAR_TEMP_D, 1, LilycoveCity_ContestLobby_EventScript_CancelLinkNoWirelessGMode
goto LilycoveCity_ContestLobby_EventScript_ChooseLinkContestType
end
```
### LilycoveCity_ContestLobby_EventScript_ChooseLinkContestType
```
message LilycoveCity_ContestLobby_Text_EnterWhichContest3
waitmessage
multichoice 0, 0, MULTI_CONTEST_TYPE, FALSE
switch VAR_RESULT
case CONTEST_CATEGORIES_COUNT, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
case MULTI_B_PRESSED, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
copyvar VAR_CONTEST_CATEGORY, VAR_RESULT
goto LilycoveCity_ContestLobby_EventScript_ChooseLinkContestMon
end
```
### LilycoveCity_ContestLobby_EventScript_LinkContestInfo
```
message LilycoveCity_ContestLobby_Text_WhichTopic2
waitmessage
multichoice 0, 0, MULTI_LINK_CONTEST_INFO, FALSE
switch VAR_RESULT
case 0, LilycoveCity_ContestLobby_EventScript_ExplainLinkContest
case 1, LilycoveCity_ContestLobby_EventScript_ExplainEMode
case 2, LilycoveCity_ContestLobby_EventScript_ExplainGMode
case 3, LilycoveCity_ContestLobby_EventScript_AskEnterLinkContest
case MULTI_B_PRESSED, LilycoveCity_ContestLobby_EventScript_AskEnterLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_ExplainLinkContest
```
msgbox LilycoveCity_ContestLobby_Text_ExplainLinkContest, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_LinkContestInfo
end
```
### LilycoveCity_ContestLobby_EventScript_ExplainEMode
```
msgbox LilycoveCity_ContestLobby_Text_ExplainEMode, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_LinkContestInfo
end
```
### LilycoveCity_ContestLobby_EventScript_ExplainGMode
```
msgbox LilycoveCity_ContestLobby_Text_ExplainGMode, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_LinkContestInfo
end
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkContest
```
special CloseLink
msgbox LilycoveCity_ContestLobby_Text_ParticipateAnotherTime, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_ChooseLinkContestMon
```
msgbox LilycoveCity_ContestLobby_Text_EnterWhichPokemon3, MSGBOX_DEFAULT
setvar VAR_CONTEST_RANK, 0
choosecontestmon
goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
special TryEnterContestMon
goto_if_eq VAR_RESULT, CANT_ENTER_CONTEST, LilycoveCity_ContestLobby_EventScript_LinkCantEnterLowRank
goto_if_eq VAR_RESULT, CAN_ENTER_CONTEST_EQUAL_RANK, LilycoveCity_ContestLobby_EventScript_EnterMonForLinkContest
goto_if_eq VAR_RESULT, CAN_ENTER_CONTEST_HIGH_RANK, LilycoveCity_ContestLobby_EventScript_EnterMonForLinkContest
goto_if_eq VAR_RESULT, CANT_ENTER_CONTEST_EGG, LilycoveCity_ContestLobby_EventScript_LinkCantEnterEgg
goto_if_eq VAR_RESULT, CANT_ENTER_CONTEST_FAINTED, LilycoveCity_ContestLobby_EventScript_LinkCantEnterFainted
end
```
### LilycoveCity_ContestLobby_EventScript_LinkCantEnterLowRank
```
msgbox LilycoveCity_ContestLobby_Text_MonNotQualifiedForRank, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_ChooseLinkContestMon
end
```
### LilycoveCity_ContestLobby_EventScript_LinkCantEnterEgg
```
msgbox LilycoveCity_ContestLobby_Text_EggCannotTakePart2, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_ChooseLinkContestMon
end
```
### LilycoveCity_ContestLobby_EventScript_LinkCantEnterFainted
```
msgbox LilycoveCity_ContestLobby_Text_MonInNoCondition2, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_ChooseLinkContestMon
end
```
### LilycoveCity_ContestLobby_EventScript_EnterMonForLinkContest
```
copyvar VAR_0x8008, VAR_0x8004
goto LilycoveCity_ContestLobby_EventScript_TrySetUpLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_TrySetUpLinkContest
```
goto_if_eq VAR_TEMP_D, 1, LilycoveCity_ContestLobby_EventScript_SetLinkGroupType
goto_if_ge VAR_TEMP_D, 2, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
message LilycoveCity_ContestLobby_Text_PleaseWaitBButtonCancel
waitmessage
copyvar VAR_0x8004, VAR_RESULT
call_if_eq VAR_TEMP_C, 0, LilycoveCity_ContestLobby_EventScript_TryLinkEMode
call_if_eq VAR_TEMP_C, 1, LilycoveCity_ContestLobby_EventScript_TryLinkGMode
goto_if_ge VAR_TEMP_C, 2, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
goto_if_eq VAR_RESULT, LINKUP_WRONG_NUM_PLAYERS, LilycoveCity_ContestLobby_EventScript_CancelLinkDifferentChoices
goto_if_eq VAR_RESULT, LINKUP_DIFF_SELECTIONS, LilycoveCity_ContestLobby_EventScript_CancelLinkDifferentChoices
goto_if_eq VAR_RESULT, LINKUP_FAILED, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
goto_if_eq VAR_RESULT, LINKUP_CONNECTION_ERROR, LilycoveCity_ContestLobby_EventScript_CancelLinkError
goto_if_eq VAR_RESULT, LINKUP_FAILED_CONTEST_GMODE, LilycoveCity_ContestLobby_EventScript_CancelLinkModeDifference
messageinstant LilycoveCity_ContestLobby_Text_Transmitting
contestlinktransfer
switch VAR_0x8004
case 0, LilycoveCity_ContestLobby_EventScript_StartLinkContest
case 1, LilycoveCity_ContestLobby_EventScript_CancelLinkDifferentContest
case 2, LilycoveCity_ContestLobby_EventScript_CancelLinkTransmissionError
end
```
### LilycoveCity_ContestLobby_EventScript_TryLinkEMode
```
special TryContestEModeLinkup
return
```
### LilycoveCity_ContestLobby_EventScript_TryLinkGMode
```
special TryContestGModeLinkup
return
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkDifferentContest
```
msgbox LilycoveCity_ContestLobby_Text_PlayersChoseDifferentContest, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkDifferentChoices
```
msgbox LilycoveCity_ContestLobby_Text_PlayersMadeDifferentChoice, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkModeDifference
```
msgbox LilycoveCity_ContestLobby_Text_PlayerAt4PCounterUseGMode, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkError
```
special CloseLink
msgbox Text_LinkErrorPleaseReset, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkNoWirelessGMode
```
special CloseLink
msgbox LilycoveCity_ContestLobby_Text_NoWirelessAdapterInGMode, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_CancelLinkTransmissionError
```
msgbox LilycoveCity_ContestLobby_Text_TransmissionError, MSGBOX_DEFAULT
goto LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_StartLinkContest
```
special GetContestPlayerId
addvar VAR_0x8004, 1
buffernumberstring STR_VAR_2, VAR_0x8004
messageautoscroll LilycoveCity_ContestLobby_Text_YourMonIsEntryNumX
waitmessage
subvar VAR_0x8004, 1
call LilycoveCity_ContestLobby_EventScript_LeadToLinkContestHall
setvar VAR_CONTEST_HALL_STATE, 1
special SetLinkContestPlayerGfx
setvar VAR_CONTEST_TYPE, CONTEST_TYPE_LINK
setvar VAR_CONTEST_RANK, CONTEST_RANK_MASTER
call LilycoveCity_ContestLobby_EventScript_WarpToContestHall
end
```
### LilycoveCity_ContestLobby_EventScript_SetLinkGroupType
```
call_if_eq VAR_CONTEST_CATEGORY, CONTEST_CATEGORY_COOL, LilycoveCity_ContestLobby_EventScript_SetLinkGroupCoolContest
call_if_eq VAR_CONTEST_CATEGORY, CONTEST_CATEGORY_BEAUTY, LilycoveCity_ContestLobby_EventScript_SetLinkGroupBeautyContest
call_if_eq VAR_CONTEST_CATEGORY, CONTEST_CATEGORY_CUTE, LilycoveCity_ContestLobby_EventScript_SetLinkGroupCuteContest
call_if_eq VAR_CONTEST_CATEGORY, CONTEST_CATEGORY_SMART, LilycoveCity_ContestLobby_EventScript_SetLinkGroupSmartContest
call_if_eq VAR_CONTEST_CATEGORY, CONTEST_CATEGORY_TOUGH, LilycoveCity_ContestLobby_EventScript_SetLinkGroupToughContest
goto LilycoveCity_ContestLobby_EventScript_DecideLinkLeader
end
```
### LilycoveCity_ContestLobby_EventScript_SetLinkGroupCoolContest
```
setvar VAR_0x8004, LINK_GROUP_COOL_CONTEST
return
```
### LilycoveCity_ContestLobby_EventScript_SetLinkGroupBeautyContest
```
setvar VAR_0x8004, LINK_GROUP_BEAUTY_CONTEST
return
```
### LilycoveCity_ContestLobby_EventScript_SetLinkGroupCuteContest
```
setvar VAR_0x8004, LINK_GROUP_CUTE_CONTEST
return
```
### LilycoveCity_ContestLobby_EventScript_SetLinkGroupSmartContest
```
setvar VAR_0x8004, LINK_GROUP_SMART_CONTEST
return
```
### LilycoveCity_ContestLobby_EventScript_SetLinkGroupToughContest
```
setvar VAR_0x8004, LINK_GROUP_TOUGH_CONTEST
return
```
### LilycoveCity_ContestLobby_EventScript_DecideLinkLeader
```
message LilycoveCity_ContestLobby_Text_PleaseDecideLinkLeader
waitmessage
multichoice 16, 6, MULTI_LINK_LEADER, FALSE
switch VAR_RESULT
case 0, LilycoveCity_ContestLobby_EventScript_TryJoinGroup
case 1, LilycoveCity_ContestLobby_EventScript_TryLeadGroup
case 2, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
case MULTI_B_PRESSED, LilycoveCity_ContestLobby_EventScript_CancelLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_TryLeadGroup
```
call LilycoveCity_ContestLobby_EventScript_TryBecomeLinkLeader
goto_if_eq VAR_RESULT, LINKUP_SUCCESS, LilycoveCity_ContestLobby_EventScript_LinkLeaderDecided
goto_if_eq VAR_RESULT, LINKUP_FAILED, LilycoveCity_ContestLobby_EventScript_DecideLinkLeader
goto_if_eq VAR_RESULT, LINKUP_RETRY_ROLE_ASSIGN, LilycoveCity_ContestLobby_EventScript_TryLeadGroup
release
end
```
### LilycoveCity_ContestLobby_EventScript_TryJoinGroup
```
call LilycoveCity_ContestLobby_EventScript_TryJoinLinkGroup
goto_if_eq VAR_RESULT, LINKUP_SUCCESS, LilycoveCity_ContestLobby_EventScript_LinkLeaderDecided
goto_if_eq VAR_RESULT, LINKUP_FAILED, LilycoveCity_ContestLobby_EventScript_DecideLinkLeader
goto_if_eq VAR_RESULT, LINKUP_RETRY_ROLE_ASSIGN, LilycoveCity_ContestLobby_EventScript_TryJoinGroup
release
end
```
### LilycoveCity_ContestLobby_EventScript_TryBecomeLinkLeader
```
special TryBecomeLinkLeader
return
```
### LilycoveCity_ContestLobby_EventScript_TryJoinLinkGroup
```
special TryJoinLinkGroup
return
```
### LilycoveCity_ContestLobby_EventScript_LinkLeaderDecided
```
messageinstant LilycoveCity_ContestLobby_Text_Transmitting
contestlinktransfer
goto LilycoveCity_ContestLobby_EventScript_StartLinkContest
end
```
### LilycoveCity_ContestLobby_EventScript_LeadToLinkContestHall
```
messageautoscroll LilycoveCity_ContestLobby_Text_ContestBeginShortly
waitmessage
delay 20
closemessage
applymovement LOCALID_CONTEST_LOBBY_LINK_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_LinkReceptionistApproachCounter
waitmovement 0
playse SE_BRIDGE_WALK
setmetatile 17, 2, METATILE_Contest_WallShadow, TRUE
setmetatile 17, 3, METATILE_Contest_FloorShadow, TRUE
special DrawWholeMapView
applymovement LOCALID_CONTEST_LOBBY_LINK_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_LinkReceptionistExitCounter
waitmovement 0
playse SE_BRIDGE_WALK
setmetatile 17, 2, METATILE_Contest_CounterFlap_Top, TRUE
setmetatile 17, 3, METATILE_Contest_CounterFlap_Bottom, TRUE
special DrawWholeMapView
delay 20
applymovement LOCALID_CONTEST_LOBBY_LINK_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_LinkReceptionistFacePlayer
waitmovement 0
applymovement LOCALID_PLAYER, LilycoveCity_ContestLobby_Movement_PlayerApproachLinkReceptionist
waitmovement 0
messageautoscroll LilycoveCity_ContestLobby_Text_ComeThroughHere
waitmessage
delay 20
closemessage
call LilycoveCity_ContestLobby_EventScript_DelayIfContestWithRSPlayer
applymovement LOCALID_CONTEST_LOBBY_LINK_RECEPTIONIST, LilycoveCity_ContestLobby_Movement_LinkReceptionistWalkToContestHall
applymovement LOCALID_PLAYER, LilycoveCity_ContestLobby_Movement_PlayerWalkToLinkContestHall
waitmovement 0
release
return
```
### LilycoveCity_ContestLobby_Movement_PlayerWalkToLinkContestHall
```
walk_right
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_up
delay_8
set_invisible
step_end
```
### LilycoveCity_ContestLobby_Movement_PlayerApproachLinkReceptionist
```
walk_right
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkReceptionistApproachCounter
```
walk_right
walk_right
walk_in_place_faster_down
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkReceptionistExitCounter
```
walk_down
walk_down
walk_in_place_faster_up
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkReceptionistWalkToContestHall
```
walk_right
walk_right
walk_right
walk_right
walk_up
walk_up
walk_up
delay_8
set_invisible
step_end
```
### LilycoveCity_ContestLobby_Movement_LinkReceptionistFacePlayer
```
walk_in_place_faster_left
step_end
```
### LilycoveCity_ContestLobby_EventScript_LittleGirl
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_POKEBLOCK_CASE, LilycoveCity_ContestLobby_EventScript_LittleGirlHaveCase
msgbox LilycoveCity_ContestLobby_Text_LadyGaveMePokeblockCase, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_ContestLobby_EventScript_LittleGirlHaveCase
```
msgbox LilycoveCity_ContestLobby_Text_MakePokeblocksDifferentBerries, MSGBOX_DEFAULT
release
end
```

## Textes (17)
### LilycoveCity_ContestLobby_Text_LadyGaveMePokeblockCase
```
Youpi!\pLa femme à la réception vient de\nme donner une boîte pour {POKEBLOCK}S!$
```
### LilycoveCity_ContestLobby_Text_MakePokeblocksDifferentBerries
```
Fais des {POKEBLOCK}S et mets-les\ndans la BOITE {POKEBLOCK}S.\pPour faire un {POKEBLOCK}, chacun\ndoit mettre une BAIE différente.$
```
### LilycoveCity_ContestLobby_Text_YourPokemonSpurredMeToPaint
```
Félicitations!\pJ'ai peint ton POKéMON pour\ncommémorer sa victoire…\pLes démonstrations de ton POKéMON\nétaient si formidables que j'ai peint\lcomme jamais auparavant. Je me suis\lsurpassé! Tiens, regarde!$
```
### LilycoveCity_ContestLobby_Text_ShouldITakePaintingToMuseum
```
Tu en penses quoi? Je suis assez\ncontent de moi. Tu aimes?\pUne œuvre de cette qualité\naurait sa place dans un musée.\pHein? Il y a un musée qui cherche des\ntableaux à exposer?\pTu crois que je devrais leur apporter\nce tableau que j'ai peint?$
```
### LilycoveCity_ContestLobby_Text_IllTakePaintingToMuseum
```
Quoi, vraiment? C'est décidé, je leur\napporte le tableau tout de suite.\pJe vais lui donner un titre, aussi.\pJ'espère qu'ils l'aimeront et voudront\nbien l'exposer.\pPasse voir s'ils l'ont accepté, quand tu\nauras un moment. Merci!$
```
### LilycoveCity_ContestLobby_Text_TakeMementoOfPainting
```
Oh, c'est vrai!\pComme souvenir du tableau\nde ton POKéMON, accepte ceci.$
```
### LilycoveCity_ContestLobby_Text_ReceivedARibbon
```
{PLAYER} reçoit un RUBAN.$
```
### LilycoveCity_ContestLobby_Text_PutTheRibbonOnMon
```
{PLAYER} met le RUBAN sur\n{STR_VAR_1}.$
```
### LilycoveCity_ContestLobby_Text_OkaySeeYou
```
D'accord, à plus!$
```
### LilycoveCity_ContestLobby_Text_TakeHomeButIdLikeToTakeToMuseum
```
Oh… Alors je vais l'amener chez\nmoi…\pMais en fait, j'aimerais plutôt le\ndonner au musée… T'es d'accord?$
```
### LilycoveCity_ContestLobby_Text_FineThatsTheWayItIs
```
Bon, d'accord. Je vais l'accrocher chez\nmoi, alors.\pJ'essaierai de faire mieux la prochaine\nfois. Allez, à plus tard.$
```
### LilycoveCity_ContestLobby_Text_MasterRankHereICome
```
Attention, participants aux CONCOURS\ncatégorie MASTER, me voilà!\pLe monde entier va enfin savoir que mon\ncher POKéMON est l'être le plus gracieux\lqui puisse exister. Le moment est venu!\pHé, hé, hé.$
```
### LilycoveCity_ContestLobby_Text_WholeVarietyOfPokemonHere
```
Il y a une grande variété de POKéMON,\nici.\pC'est pourquoi je viens tous les jours,\nlors de ma promenade.$
```
### LilycoveCity_ContestLobby_Text_ContestFeastForEyes
```
Venir voir un CONCOURS est un\nfestival pour les yeux!\pOn voit plein de superbes POKéMON qui\ncrient pour qu'on les peigne.$
```
### LilycoveCity_ContestLobby_Text_ToughContestIsExtreme
```
Le CONCOURS DE ROBUSTESSE,\nc'est quelque chose, tu sais!\pCet étalage de muscles… Toute cette\nsueur… Simplement magnifique!$
```
### LilycoveCity_ContestLobby_Text_LavishedCareOnMon
```
Jour après jour, j'ai prodigué mes\nsoins à ce POKéMON.\pIl approche de la perfection.\nAujourd'hui, la victoire est à moi!$
```
### LilycoveCity_ContestLobby_Text_MadePokeblocksWithFamily
```
J'ai fait des {POKEBLOCK}S avec ma maman, mon\npapa et ma grande sœur. Ils sont super!\pSi tu fais des {POKEBLOCK}S avec d'autres\npersonnes, ils sont meilleurs.$
```

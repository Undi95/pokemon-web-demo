# MossdeepCity_GameCorner_1F

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_GAME_CORNER_1F`
- **layout** : `LAYOUT_MOSSDEEP_CITY_GAME_CORNER_1F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 6,2 | `MOVEMENT_TYPE_FACE_DOWN` | `MossdeepCity_GameCorner_1F_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 4,2 | `MOVEMENT_TYPE_FACE_DOWN` | `MossdeepCity_GameCorner_1F_EventScript_InfoMan` | `0` |

## Warps (3)
- #0 (5,9) → `MAP_MOSSDEEP_CITY` warp #9
- #1 (6,9) → `MAP_MOSSDEEP_CITY` warp #9
- #2 (2,0) → `MAP_MOSSDEEP_CITY_GAME_CORNER_B1F` warp #0

## BG events / signs (3)
- (3,0) [sign] → `RS_MysteryEventsHouse_EventScript_Door`
- (0,1) [sign] → `MossdeepCity_GameCorner_1F_EventScript_DodrioBerryPickingRecords`
- (1,1) [sign] → `MossdeepCity_GameCorner_1F_EventScript_PokemonJumpRecords`

## Variables référencées (1)
- `VAR_CABLE_CLUB_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/cable_club.inc
- `MossdeepCity_GameCorner_1F_EventScript_InfoMan2`
- `MossdeepCity_GameCorner_1F_EventScript_OldMan2`

## Scripts (6)
### MossdeepCity_GameCorner_1F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, MossdeepCity_GameCorner_1F_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, MossdeepCity_GameCorner_1F_OnWarp
map_script MAP_SCRIPT_ON_LOAD, CableClub_OnLoad
```
### MossdeepCity_GameCorner_1F_OnWarp
```
map_script_2 VAR_CABLE_CLUB_STATE, USING_MINIGAME, CableClub_EventScript_CheckTurnAttendant
```
### MossdeepCity_GameCorner_1F_OnFrame
```
map_script_2 VAR_CABLE_CLUB_STATE, USING_MINIGAME, CableClub_EventScript_ExitMinigameRoom
```
### MossdeepCity_GameCorner_1F_EventScript_InfoMan
```
lock
faceplayer
goto MossdeepCity_GameCorner_1F_EventScript_InfoMan2
release
end
```
### MossdeepCity_GameCorner_1F_EventScript_OldMan
```
lock
faceplayer
goto MossdeepCity_GameCorner_1F_EventScript_OldMan2
release
end
```
### RS_MysteryEventsHouse_EventScript_Door
```
msgbox RS_MysteryEventsHouse_Text_DoorIsLocked, MSGBOX_SIGN
end
```

## Textes (10)
### RS_MysteryEventsHouse_Text_OldManGreeting
```
When I was young, I traveled the world\nas a POKéMON TRAINER.\pNow that I've become an old buzzard,\nmy only amusement is watching young\lTRAINERS battle.$
```
### RS_MysteryEventsHouse_Text_DoorIsLocked
```
La porte semble être verrouillée.$
```
### RS_MysteryEventsHouse_Text_ChallengeVisitingTrainer
```
A TRAINER named {STR_VAR_1} is\nvisiting my home.\pWould you like to challenge\n{STR_VAR_1}?$
```
### RS_MysteryEventsHouse_Text_YouWontBattle
```
You won't battle? I'm disappointed\nthat I can't see you battle…$
```
### RS_MysteryEventsHouse_Text_KeepItToA3On3
```
Oh, good, good!\pBut my house isn't all that sturdy.\pCould I ask you to keep it down to\na 3-on-3 match?$
```
### RS_MysteryEventsHouse_Text_SaveYourProgress
```
Before you two battle, you should\nsave your progress.$
```
### RS_MysteryEventsHouse_Text_HopeToSeeAGoodMatch
```
I hope to see a good match!$
```
### RS_MysteryEventsHouse_Text_BattleTie
```
So, it became a standoff.\pIt was a brilliant match in which\nneither side conceded a step!$
```
### RS_MysteryEventsHouse_Text_BattleWon
```
That was superlative!\pWhy, it was like seeing myself in\nmy youth again!$
```
### RS_MysteryEventsHouse_Text_BattleLost
```
Ah, too bad for you!\pBut it was a good match.\nI hope you can win next time.$
```

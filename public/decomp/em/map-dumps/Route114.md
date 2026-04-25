# Route114

## Métadonnées
- **id** : `MAP_ROUTE114`
- **layout** : `LAYOUT_ROUTE114`
- **music** : `MUS_ROUTE110`
- **region_map_section** : `MAPSEC_ROUTE_114`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 40) → `MAP_ROUTE115`
- right (offset 0) → `MAP_FALLARBOR_TOWN`

## Object events (27 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 31,43 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 31,44 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 15,65 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route114_EventScript_Lenny` | `0` |
| `` | `OBJ_EVENT_GFX_HIKER` | 30,72 | `MOVEMENT_TYPE_FACE_LEFT` | `Route114_EventScript_Lucas` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 22,50 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route114_EventScript_Shane` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 19,35 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route114_EventScript_Nancy` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 20,56 | `MOVEMENT_TYPE_FACE_UP` | `Route114_EventScript_Steve` | `0` |
| `` | `OBJ_EVENT_GFX_BERRY_TREE` | 31,45 | `MOVEMENT_TYPE_BERRY_TREE_GROWTH` | `BerryTreeScript` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 7,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route114_EventScript_ItemRareCandy` | `FLAG_ITEM_ROUTE_114_RARE_CANDY` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 11,37 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route114_EventScript_ItemProtein` | `FLAG_ITEM_ROUTE_114_PROTEIN` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 12,43 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 19,11 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route114_EventScript_RoarGentleman` | `0` |
| `` | `OBJ_EVENT_GFX_POOCHYENA` | 19,12 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route114_EventScript_Poochyena` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 27,42 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `Route114_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 25,6 | `MOVEMENT_TYPE_FACE_DOWN` | `Route114_EventScript_Nolan` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 19,26 | `MOVEMENT_TYPE_FACE_LEFT` | `Route114_EventScript_Claude` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 30,58 | `MOVEMENT_TYPE_ROTATE_COUNTERCLOCKWISE` | `Route114_EventScript_Bernie` | `0` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 29,53 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 30,54 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 22,69 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 11,64 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_LASS` | 24,44 | `MOVEMENT_TYPE_FACE_DOWN` | `Route114_EventScript_Ivy` | `0` |
| `` | `OBJ_EVENT_GFX_LASS` | 23,44 | `MOVEMENT_TYPE_FACE_DOWN` | `Route114_EventScript_Tyra` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 28,20 | `MOVEMENT_TYPE_FACE_UP` | `Route114_EventScript_Charlotte` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 26,72 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `Route114_EventScript_Angelina` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 31,19 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route114_EventScript_ItemEnergyPowder` | `FLAG_ITEM_ROUTE_114_ENERGY_POWDER` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 28,16 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `Route114_EventScript_Kai` | `0` |

## Warps (5)
- #0 (8,63) → `MAP_METEOR_FALLS_1F_1R` warp #0
- #1 (29,5) → `MAP_ROUTE114_FOSSIL_MANIACS_HOUSE` warp #0
- #2 (27,36) → `MAP_ROUTE114_LANETTES_HOUSE` warp #0
- #3 (6,46) → `MAP_TERRA_CAVE_ENTRANCE` warp #0
- #4 (7,4) → `MAP_TERRA_CAVE_ENTRANCE` warp #0

## BG events / signs (12)
- (7,64) [sign] → `Route114_EventScript_MeteorFallsSign`
- (31,7) [sign] → `Route114_EventScript_FossilManiacsHouseSign`
- (9,47) [secret_base] → ``
- (30,51) [secret_base] → ``
- (11,62) [secret_base] → ``
- (19,70) [secret_base] → ``
- (11,27) [secret_base] → ``
- (12,27) [secret_base] → ``
- (25,38) [sign] → `Route114_EventScript_LanettesHouseSign`
- (20,57) [hidden_item] → ``
- (32,57) [secret_base] → ``
- (7,30) [hidden_item] → ``

## Flags référencés (2)
- `FLAG_DAILY_ROUTE_114_RECEIVED_BERRY`
- `FLAG_RECEIVED_TM_ROAR`

## Variables référencées (3)
- `VAR_ABNORMAL_WEATHER_LOCATION`
- `VAR_RESULT`
- `VAR_SHOULD_END_ABNORMAL_WEATHER`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route114_Text_AngelinaPostBattle`
- `Route114_Text_BerniePostBattle`
- `Route114_Text_BerniePostRematch`
- `Route114_Text_BernieRegister`
- `Route114_Text_CharlottePostBattle`
- `Route114_Text_ClaudePostBattle`
- `Route114_Text_FunToThinkAboutBerries`
- `Route114_Text_IvyPostBattle`
- `Route114_Text_KaiPostBattle`
- `Route114_Text_LennyPostBattle`
- `Route114_Text_LoveUsingBerryCrushShareBerry`
- `Route114_Text_LucasPostBattle`
- `Route114_Text_NancyPostBattle`
- `Route114_Text_NolanPostBattle`
- `Route114_Text_ShanePostBattle`
- `Route114_Text_StevePostBattle`
- `Route114_Text_StevePostRematch`
- `Route114_Text_SteveRegister`
- `Route114_Text_TryBerryCrushWithFriends`
- `Route114_Text_TyraPostBattle`

## Scripts (29)
### Route114_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route114_OnTransition
map_script MAP_SCRIPT_ON_LOAD, Route114_OnLoad
map_script MAP_SCRIPT_ON_FRAME_TABLE, Route114_OnFrame
```
### Route114_OnTransition
```
call_if_eq VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_HideMapNamePopup
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_114_NORTH, AbnormalWeather_StartGroudonWeather
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_114_SOUTH, AbnormalWeather_StartGroudonWeather
end
```
### Route114_OnLoad
```
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_114_NORTH, AbnormalWeather_EventScript_PlaceTilesRoute114North
call_if_eq VAR_ABNORMAL_WEATHER_LOCATION, ABNORMAL_WEATHER_ROUTE_114_SOUTH, AbnormalWeather_EventScript_PlaceTilesRoute114South
end
```
### Route114_OnFrame
```
map_script_2 VAR_SHOULD_END_ABNORMAL_WEATHER, 1, AbnormalWeather_EventScript_EndEventAndCleanup_1
```
### Route114_EventScript_Man
```
lock
faceplayer
dotimebasedevents
goto_if_set FLAG_DAILY_ROUTE_114_RECEIVED_BERRY, Route114_EventScript_ReceivedBerry
msgbox Route114_Text_LoveUsingBerryCrushShareBerry, MSGBOX_DEFAULT
random NUM_ROUTE_114_MAN_BERRIES
addvar VAR_RESULT, NUM_ROUTE_114_MAN_BERRIES_SKIPPED
addvar VAR_RESULT, FIRST_BERRY_INDEX
giveitem VAR_RESULT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_DAILY_ROUTE_114_RECEIVED_BERRY
msgbox Route114_Text_TryBerryCrushWithFriends, MSGBOX_DEFAULT
release
end
```
### Route114_EventScript_ReceivedBerry
```
msgbox Route114_Text_FunToThinkAboutBerries, MSGBOX_DEFAULT
release
end
```
### Route114_EventScript_RoarGentleman
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_ROAR, Route114_EventScript_ReceivedRoar
msgbox Route114_Text_AllMyMonDoesIsRoarTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_ROAR
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_ROAR
msgbox Route114_Text_ExplainRoar, MSGBOX_DEFAULT
release
end
```
### Route114_EventScript_ReceivedRoar
```
msgbox Route114_Text_ExplainRoar, MSGBOX_DEFAULT
release
end
```
### Route114_EventScript_Poochyena
```
lock
faceplayer
waitse
playmoncry SPECIES_POOCHYENA, CRY_MODE_ENCOUNTER
msgbox Route114_Text_Poochyena, MSGBOX_DEFAULT
waitmoncry
release
end
```
### Route114_EventScript_MeteorFallsSign
```
msgbox Route114_Text_MeteorFallsSign, MSGBOX_SIGN
end
```
### Route114_EventScript_FossilManiacsHouseSign
```
msgbox Route114_Text_FossilManiacsHouseSign, MSGBOX_SIGN
end
```
### Route114_EventScript_LanettesHouseSign
```
msgbox Route114_Text_LanettesHouse, MSGBOX_SIGN
end
```
### Route114_EventScript_Lenny
```
trainerbattle_single TRAINER_LENNY, Route114_Text_LennyIntro, Route114_Text_LennyDefeat
msgbox Route114_Text_LennyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Lucas
```
trainerbattle_single TRAINER_LUCAS_1, Route114_Text_LucasIntro, Route114_Text_LucasDefeat
msgbox Route114_Text_LucasPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Shane
```
trainerbattle_single TRAINER_SHANE, Route114_Text_ShaneIntro, Route114_Text_ShaneDefeat
msgbox Route114_Text_ShanePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Nancy
```
trainerbattle_single TRAINER_NANCY, Route114_Text_NancyIntro, Route114_Text_NancyDefeat
msgbox Route114_Text_NancyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Steve
```
trainerbattle_single TRAINER_STEVE_1, Route114_Text_SteveIntro, Route114_Text_SteveDefeat, Route114_EventScript_RegisterSteve
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route114_EventScript_RematchSteve
msgbox Route114_Text_StevePostBattle, MSGBOX_DEFAULT
release
end
```
### Route114_EventScript_RegisterSteve
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route114_Text_SteveRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_STEVE_1
release
end
```
### Route114_EventScript_RematchSteve
```
trainerbattle_rematch TRAINER_STEVE_1, Route114_Text_SteveRematchIntro, Route114_Text_SteveRematchDefeat
msgbox Route114_Text_StevePostRematch, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Bernie
```
trainerbattle_single TRAINER_BERNIE_1, Route114_Text_BernieIntro, Route114_Text_BernieDefeat, Route114_EventScript_RegisterBernie
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route114_EventScript_RematchBernie
msgbox Route114_Text_BerniePostBattle, MSGBOX_DEFAULT
release
end
```
### Route114_EventScript_RegisterBernie
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route114_Text_BernieRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_BERNIE_1
release
end
```
### Route114_EventScript_RematchBernie
```
trainerbattle_rematch TRAINER_BERNIE_1, Route114_Text_BernieRematchIntro, Route114_Text_BernieRematchDefeat
msgbox Route114_Text_BerniePostRematch, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Claude
```
trainerbattle_single TRAINER_CLAUDE, Route114_Text_ClaudeIntro, Route114_Text_ClaudeDefeat
msgbox Route114_Text_ClaudePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Nolan
```
trainerbattle_single TRAINER_NOLAN, Route114_Text_NolanIntro, Route114_Text_NolanDefeat
msgbox Route114_Text_NolanPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Tyra
```
trainerbattle_double TRAINER_TYRA_AND_IVY, Route114_Text_TyraIntro, Route114_Text_TyraDefeat, Route114_Text_TyraNotEnoughMons
msgbox Route114_Text_TyraPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Ivy
```
trainerbattle_double TRAINER_TYRA_AND_IVY, Route114_Text_IvyIntro, Route114_Text_IvyDefeat, Route114_Text_IvyNotEnoughMons
msgbox Route114_Text_IvyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Angelina
```
trainerbattle_single TRAINER_ANGELINA, Route114_Text_AngelinaIntro, Route114_Text_AngelinaDefeat
msgbox Route114_Text_AngelinaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Charlotte
```
trainerbattle_single TRAINER_CHARLOTTE, Route114_Text_CharlotteIntro, Route114_Text_CharlotteDefeat
msgbox Route114_Text_CharlottePostBattle, MSGBOX_AUTOCLOSE
end
```
### Route114_EventScript_Kai
```
trainerbattle_single TRAINER_KAI, Route114_Text_KaiIntro, Route114_Text_KaiDefeat
msgbox Route114_Text_KaiPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### Route114_Text_AllMyMonDoesIsRoarTakeThis
```
Mon POKéMON ne connaît que HURLEMENT.\nPersonne n'ose m'approcher…\pPfff… Tu devrais prendre\ncette CT…$
```
### Route114_Text_ExplainRoar
```
La CT05 contient HURLEMENT.\nUn HURLEMENT fait filer les POKéMON.$
```
### Route114_Text_Poochyena
```
Bouh! Bouhou!$
```
### Route114_Text_MeteorFallsSign
```
SITE METEORE\nVERS MEROUVILLE$
```
### Route114_Text_FossilManiacsHouseSign
```
MAISON DU MANIAQUE DES FOSSILES\n“Les fossiles sont les bienvenus!”$
```
### Route114_Text_LanettesHouse
```
MAISON D'ANNETTE$
```

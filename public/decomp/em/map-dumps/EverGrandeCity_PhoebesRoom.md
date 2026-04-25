# EverGrandeCity_PhoebesRoom

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_PHOEBES_ROOM`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_PHOEBES_ROOM`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_PHOEBE`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PHOEBE` | 6,5 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PhoebesRoom_EventScript_Phoebe` | `0` |

## Warps (2)
- #0 (6,13) → `MAP_EVER_GRANDE_CITY_HALL1` warp #1
- #1 (6,2) → `MAP_EVER_GRANDE_CITY_HALL2` warp #0

## Flags référencés (1)
- `FLAG_DEFEATED_ELITE_4_PHOEBE`

## Variables référencées (2)
- `VAR_ELITE_4_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/elite_four.inc
- `PokemonLeague_EliteFour_EventScript_CloseDoor`
- `PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom`
- `PokemonLeague_EliteFour_EventScript_WalkInCloseDoor`
- `PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles`

## Scripts (11)
### EverGrandeCity_PhoebesRoom_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, EverGrandeCity_PhoebesRoom_OnLoad
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_PhoebesRoom_OnWarp
map_script MAP_SCRIPT_ON_FRAME_TABLE, EverGrandeCity_PhoebesRoom_OnFrame
```
### EverGrandeCity_PhoebesRoom_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_PhoebesRoom_EventScript_PlayerTurnNorth
```
### EverGrandeCity_PhoebesRoom_EventScript_PlayerTurnNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### EverGrandeCity_PhoebesRoom_OnFrame
```
map_script_2 VAR_ELITE_4_STATE, 1, EverGrandeCity_PhoebesRoom_EventScript_WalkInCloseDoor
```
### EverGrandeCity_PhoebesRoom_EventScript_WalkInCloseDoor
```
lockall
call PokemonLeague_EliteFour_EventScript_WalkInCloseDoor
setvar VAR_ELITE_4_STATE, 2
releaseall
end
```
### EverGrandeCity_PhoebesRoom_OnLoad
```
call_if_set FLAG_DEFEATED_ELITE_4_PHOEBE, EverGrandeCity_PhoebesRoom_EventScript_ResetAdvanceToNextRoom
call_if_eq VAR_ELITE_4_STATE, 2, EverGrandeCity_PhoebesRoom_EventScript_CloseDoor
end
```
### EverGrandeCity_PhoebesRoom_EventScript_ResetAdvanceToNextRoom
```
call PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom
return
```
### EverGrandeCity_PhoebesRoom_EventScript_CloseDoor
```
call PokemonLeague_EliteFour_EventScript_CloseDoor
return
```
### EverGrandeCity_PhoebesRoom_EventScript_Phoebe
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_ELITE_4_PHOEBE, EverGrandeCity_PhoebesRoom_EventScript_PostBattleSpeech
playbgm MUS_ENCOUNTER_ELITE_FOUR, FALSE
msgbox EverGrandeCity_PhoebesRoom_Text_IntroSpeech, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_PHOEBE, EverGrandeCity_PhoebesRoom_Text_Defeat
goto EverGrandeCity_PhoebesRoom_EventScript_Defeated
end
```
### EverGrandeCity_PhoebesRoom_EventScript_PostBattleSpeech
```
msgbox EverGrandeCity_PhoebesRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```
### EverGrandeCity_PhoebesRoom_EventScript_Defeated
```
setflag FLAG_DEFEATED_ELITE_4_PHOEBE
call PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles
msgbox EverGrandeCity_PhoebesRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### EverGrandeCity_PhoebesRoom_Text_IntroSpeech
```
Ah, ah, ah!\pJe suis SPECTRA du CONSEIL 4.\nJe me suis entraînée au MONT MEMORIA.\pLà-bas, j'ai appris à communier avec\nles POKéMON du type SPECTRE.\pOui, le lien que j'ai créé avec eux\nest très étroit.\pViens! On verra si tu arrives à infliger\ndes dommages à mes POKéMON!$
```
### EverGrandeCity_PhoebesRoom_Text_Defeat
```
Oh, non!\nJ'ai lancé le défi et j'ai perdu…$
```
### EverGrandeCity_PhoebesRoom_Text_PostBattleSpeech
```
Toi aussi, un lien fort t'unit\nà tes POKéMON.\pJe n'ai pas voulu le reconnaître et\nforcément, j'ai perdu.\pJ'aimerais bien voir jusqu'où ce lien\nsi fort te mènera.\pAvance jusqu'à la prochaine pièce.$
```

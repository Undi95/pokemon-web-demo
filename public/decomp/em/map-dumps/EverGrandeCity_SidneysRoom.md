# EverGrandeCity_SidneysRoom

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_SIDNEYS_ROOM`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_SIDNEYS_ROOM`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_SIDNEY`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SIDNEY` | 6,5 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_SidneysRoom_EventScript_Sidney` | `0` |

## Warps (2)
- #0 (6,13) → `MAP_EVER_GRANDE_CITY_HALL5` warp #1
- #1 (6,2) → `MAP_EVER_GRANDE_CITY_HALL1` warp #0

## Flags référencés (3)
- `FLAG_DEFEATED_ELITE_4_SIDNEY`
- `FLAG_HIDE_EVER_GRANDE_POKEMON_CENTER_1F_SCOTT`
- `FLAG_MET_SCOTT_IN_EVERGRANDE`

## Variables référencées (2)
- `VAR_ELITE_4_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/elite_four.inc
- `PokemonLeague_EliteFour_EventScript_CloseDoor`
- `PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom`
- `PokemonLeague_EliteFour_EventScript_WalkInCloseDoor`
- `PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles`

## Scripts (12)
### EverGrandeCity_SidneysRoom_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, EverGrandeCity_SidneysRoom_OnLoad
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_SidneysRoom_OnWarp
map_script MAP_SCRIPT_ON_TRANSITION, EverGrandeCity_SidneysRoom_OnTransition
map_script MAP_SCRIPT_ON_FRAME_TABLE, EverGrandeCity_SidneysRoom_OnFrame
```
### EverGrandeCity_SidneysRoom_OnTransition
```
setflag FLAG_MET_SCOTT_IN_EVERGRANDE
setflag FLAG_HIDE_EVER_GRANDE_POKEMON_CENTER_1F_SCOTT
end
```
### EverGrandeCity_SidneysRoom_OnLoad
```
call_if_set FLAG_DEFEATED_ELITE_4_SIDNEY, EverGrandeCity_SidneysRoom_EventScript_ResetAdvanceToNextRoom
call_if_eq VAR_ELITE_4_STATE, 1, EverGrandeCity_SidneysRoom_EventScript_CloseDoor
end
```
### EverGrandeCity_SidneysRoom_EventScript_ResetAdvanceToNextRoom
```
call PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom
return
```
### EverGrandeCity_SidneysRoom_EventScript_CloseDoor
```
call PokemonLeague_EliteFour_EventScript_CloseDoor
return
```
### EverGrandeCity_SidneysRoom_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_SidneysRoom_EventScript_PlayerTurnNorth
```
### EverGrandeCity_SidneysRoom_EventScript_PlayerTurnNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### EverGrandeCity_SidneysRoom_OnFrame
```
map_script_2 VAR_ELITE_4_STATE, 0, EverGrandeCity_SidneysRoom_EventScript_WalkInCloseDoor
```
### EverGrandeCity_SidneysRoom_EventScript_WalkInCloseDoor
```
lockall
call PokemonLeague_EliteFour_EventScript_WalkInCloseDoor
setvar VAR_ELITE_4_STATE, 1
releaseall
end
```
### EverGrandeCity_SidneysRoom_EventScript_Sidney
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_ELITE_4_SIDNEY, EverGrandeCity_SidneysRoom_EventScript_PostBattleSpeech
playbgm MUS_ENCOUNTER_ELITE_FOUR, FALSE
msgbox EverGrandeCity_SidneysRoom_Text_IntroSpeech, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_SIDNEY, EverGrandeCity_SidneysRoom_Text_Defeat
goto EverGrandeCity_SidneysRoom_EventScript_Defeated
end
```
### EverGrandeCity_SidneysRoom_EventScript_PostBattleSpeech
```
msgbox EverGrandeCity_SidneysRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```
### EverGrandeCity_SidneysRoom_EventScript_Defeated
```
setflag FLAG_DEFEATED_ELITE_4_SIDNEY
call PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles
msgbox EverGrandeCity_SidneysRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### EverGrandeCity_SidneysRoom_Text_IntroSpeech
```
Bienvenue, adversaire!\nJe suis DAMIEN du CONSEIL 4.\pJ'aime la façon dont tu me regardes.\nTu vas sûrement faire un bon combat.\pC'est bien! Vraiment bien!\pBon! Toi et moi, livrons un combat\ncomme on ne peut en voir qu'ici, à\lla LIGUE POKéMON!$
```
### EverGrandeCity_SidneysRoom_Text_Defeat
```
Alors, ça te fait plaisir? J'ai perdu!\nTant pis, c'était sympa.$
```
### EverGrandeCity_SidneysRoom_Text_PostBattleSpeech
```
Bon, écoute ce que le perdant veut\nte dire.\pTu as ce qu'il faut pour continuer.\nAlors va dans la prochaine pièce et\lbon combat!$
```

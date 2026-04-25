# EverGrandeCity_DrakesRoom

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_DRAKES_ROOM`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_DRAKES_ROOM`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_DRAKE`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_DRAKE` | 6,5 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_DrakesRoom_EventScript_Drake` | `0` |

## Warps (2)
- #0 (6,13) → `MAP_EVER_GRANDE_CITY_HALL3` warp #1
- #1 (6,2) → `MAP_EVER_GRANDE_CITY_HALL4` warp #0

## Flags référencés (1)
- `FLAG_DEFEATED_ELITE_4_DRAKE`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_ELITE_4_STATE`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/elite_four.inc
- `PokemonLeague_EliteFour_EventScript_CloseDoor`
- `PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom`
- `PokemonLeague_EliteFour_EventScript_WalkInCloseDoor`
- `PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles`

## Scripts (11)
### EverGrandeCity_DrakesRoom_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, EverGrandeCity_DrakesRoom_OnFrame
map_script MAP_SCRIPT_ON_LOAD, EverGrandeCity_DrakesRoom_OnLoad
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_SidneysRoom_OnWarp
```
### EverGrandeCity_DrakesRoom_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_DrakesRoom_EventScript_PlayerTurnNorth
```
### EverGrandeCity_DrakesRoom_EventScript_PlayerTurnNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### EverGrandeCity_DrakesRoom_OnFrame
```
map_script_2 VAR_ELITE_4_STATE, 3, EverGrandeCity_DrakesRoom_EventScript_WalkInCloseDoor
```
### EverGrandeCity_DrakesRoom_EventScript_WalkInCloseDoor
```
lockall
call PokemonLeague_EliteFour_EventScript_WalkInCloseDoor
setvar VAR_ELITE_4_STATE, 4
releaseall
end
```
### EverGrandeCity_DrakesRoom_OnLoad
```
call_if_set FLAG_DEFEATED_ELITE_4_DRAKE, EverGrandeCity_DrakesRoom_EventScript_ResetAdvanceToNextRoom
call_if_eq VAR_ELITE_4_STATE, 4, EverGrandeCity_DrakesRoom_EventScript_CloseDoor
end
```
### EverGrandeCity_DrakesRoom_EventScript_ResetAdvanceToNextRoom
```
call PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom
return
```
### EverGrandeCity_DrakesRoom_EventScript_CloseDoor
```
call PokemonLeague_EliteFour_EventScript_CloseDoor
return
```
### EverGrandeCity_DrakesRoom_EventScript_Drake
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_ELITE_4_DRAKE, EverGrandeCity_DrakesRoom_EventScript_PostBattleSpeech
playbgm MUS_ENCOUNTER_ELITE_FOUR, FALSE
msgbox EverGrandeCity_DrakesRoom_Text_IntroSpeech, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_DRAKE, EverGrandeCity_DrakesRoom_Text_Defeat
goto EverGrandeCity_DrakesRoom_EventScript_Defeated
end
```
### EverGrandeCity_DrakesRoom_EventScript_PostBattleSpeech
```
msgbox EverGrandeCity_DrakesRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```
### EverGrandeCity_DrakesRoom_EventScript_Defeated
```
setvar VAR_0x8004, FANCOUNTER_DEFEATED_DRAKE
special Script_TryGainNewFanFromCounter
setflag FLAG_DEFEATED_ELITE_4_DRAKE
call PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles
msgbox EverGrandeCity_DrakesRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### EverGrandeCity_DrakesRoom_Text_IntroSpeech
```
Je suis le dernier du CONSEIL 4,\nARAGON, le maître DRAGON.\pA l'état naturel, les POKéMON sont des\ncréatures sauvages. Ils sont libres.\pParfois, ils nous font obstacle.\nParfois, ils nous aident.\pCombattre en s'alliant avec les\nPOKéMON, tu sais ce que ça représente?\pTu sais ce qu'il faut pour y parvenir?\pSi tu ne le sais pas, alors tu ne pourras\njamais me dominer!$
```
### EverGrandeCity_DrakesRoom_Text_Defeat
```
Superbe! Ça vaut la peine d'être dit!$
```
### EverGrandeCity_DrakesRoom_Text_PostBattleSpeech
```
Quel mérite d'avoir fait tout ce chemin\nen tant que DRESSEUR de POKéMON!\pTu sembles avoir la qualité que\npossèdent les vrais DRESSEURS.\pOui, ce qu'un DRESSEUR doit avoir, c'est\nun cœur vertueux.\pLes POKéMON touchent le cœur vertueux\ndes DRESSEURS et apprennent le bien.\pIls touchent le cœur vertueux des\nDRESSEURS et deviennent forts.\pAllez, en avant!\nLe MAITRE t'attend!$
```

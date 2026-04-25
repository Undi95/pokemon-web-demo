# EverGrandeCity_GlaciasRoom

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_GLACIAS_ROOM`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_GLACIAS_ROOM`
- **music** : `MUS_VICTORY_ROAD`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_GLACIA`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GLACIA` | 6,5 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_GlaciasRoom_EventScript_Glacia` | `0` |

## Warps (2)
- #0 (6,13) → `MAP_EVER_GRANDE_CITY_HALL2` warp #1
- #1 (6,2) → `MAP_EVER_GRANDE_CITY_HALL3` warp #0

## Flags référencés (1)
- `FLAG_DEFEATED_ELITE_4_GLACIA`

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
### EverGrandeCity_GlaciasRoom_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, EverGrandeCity_GlaciasRoom_OnFrame
map_script MAP_SCRIPT_ON_LOAD, EverGrandeCity_GlaciasRoom_OnLoad
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, EverGrandeCity_GlaciasRoom_OnWarp
```
### EverGrandeCity_GlaciasRoom_OnWarp
```
map_script_2 VAR_TEMP_1, 0, EverGrandeCity_GlaciasRoom_EventScript_PlayerTurnNorth
```
### EverGrandeCity_GlaciasRoom_EventScript_PlayerTurnNorth
```
turnobject LOCALID_PLAYER, DIR_NORTH
end
```
### EverGrandeCity_GlaciasRoom_OnFrame
```
map_script_2 VAR_ELITE_4_STATE, 2, EverGrandeCity_GlaciasRoom_EventScript_WalkInCloseDoor
```
### EverGrandeCity_GlaciasRoom_EventScript_WalkInCloseDoor
```
lockall
call PokemonLeague_EliteFour_EventScript_WalkInCloseDoor
setvar VAR_ELITE_4_STATE, 3
releaseall
end
```
### EverGrandeCity_GlaciasRoom_OnLoad
```
call_if_set FLAG_DEFEATED_ELITE_4_GLACIA, EverGrandeCity_GlaciasRoom_EventScript_ResetAdvanceToNextRoom
call_if_eq VAR_ELITE_4_STATE, 3, EverGrandeCity_GlaciasRoom_EventScript_CloseDoor
end
```
### EverGrandeCity_GlaciasRoom_EventScript_ResetAdvanceToNextRoom
```
call PokemonLeague_EliteFour_EventScript_ResetAdvanceToNextRoom
return
```
### EverGrandeCity_GlaciasRoom_EventScript_CloseDoor
```
call PokemonLeague_EliteFour_EventScript_CloseDoor
return
```
### EverGrandeCity_GlaciasRoom_EventScript_Glacia
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_ELITE_4_GLACIA, EverGrandeCity_GlaciasRoom_EventScript_PostBattleSpeech
playbgm MUS_ENCOUNTER_ELITE_FOUR, FALSE
msgbox EverGrandeCity_GlaciasRoom_Text_IntroSpeech, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_GLACIA, EverGrandeCity_GlaciasRoom_Text_Defeat
goto EverGrandeCity_GlaciasRoom_EventScript_Defeated
end
```
### EverGrandeCity_GlaciasRoom_EventScript_PostBattleSpeech
```
msgbox EverGrandeCity_GlaciasRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```
### EverGrandeCity_GlaciasRoom_EventScript_Defeated
```
setflag FLAG_DEFEATED_ELITE_4_GLACIA
call PokemonLeague_EliteFour_SetAdvanceToNextRoomMetatiles
msgbox EverGrandeCity_GlaciasRoom_Text_PostBattleSpeech, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### EverGrandeCity_GlaciasRoom_Text_IntroSpeech
```
Bienvenue. Je suis GLACIA du\nCONSEIL 4.\pJ'ai fait le chemin jusqu'à HOENN pour\napprendre à mieux utiliser la glace.\pMais je n'ai affronté que des DRESSEURS\net des POKéMON faibles.\pEt toi?\pÇa me ferait extrêmement plaisir de\nme donner à fond contre toi!$
```
### EverGrandeCity_GlaciasRoom_Text_Defeat
```
Tes POKéMON et toi… Une telle chaleur\nse dégage de vos esprits!\pCe débordement de chaleur est\naccablant.\pJe comprends pourquoi je n'ai pas\nréussi à vous affecter avec la glace.$
```
### EverGrandeCity_GlaciasRoom_Text_PostBattleSpeech
```
Avance jusqu'à la prochaine pièce.\pEt là, tu comprendras pourquoi la\nLIGUE POKéMON est si redoutable.$
```

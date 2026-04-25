# MossdeepCity_PokemonCenter_2F

## Métadonnées
- **id** : `MAP_MOSSDEEP_CITY_POKEMON_CENTER_2F`
- **layout** : `LAYOUT_POKEMON_CENTER_2F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_MOSSDEEP_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_TEALA` | 6,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Common_EventScript_UnionRoomAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_TEALA` | 2,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Common_EventScript_WirelessClubAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_TEALA` | 10,2 | `MOVEMENT_TYPE_FACE_DOWN` | `Common_EventScript_DirectCornerAttendant` | `0` |
| `` | `OBJ_EVENT_GFX_MYSTERY_GIFT_MAN` | 1,2 | `MOVEMENT_TYPE_FACE_DOWN` | `CableClub_EventScript_MysteryGiftMan` | `FLAG_HIDE_POKEMON_CENTER_2F_MYSTERY_GIFT_MAN` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 11,7 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `MossdeepCity_PokemonCenter_2F_EventScript_Woman5` | `0` |

## Warps (3)
- #0 (1,6) → `MAP_MOSSDEEP_CITY_POKEMON_CENTER_1F` warp #2
- #1 (5,1) → `MAP_UNION_ROOM` warp #0
- #2 (9,1) → `MAP_TRADE_CENTER` warp #0

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/cable_club.inc
- `CableClub_EventScript_Colosseum`
- `CableClub_EventScript_RecordCorner`
- `CableClub_EventScript_TradeCenter`

## Scripts (5)
### MossdeepCity_PokemonCenter_2F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, CableClub_OnFrame
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, CableClub_OnWarp
map_script MAP_SCRIPT_ON_LOAD, CableClub_OnLoad
map_script MAP_SCRIPT_ON_TRANSITION, CableClub_OnTransition
```
### MossdeepCity_PokemonCenter_2F_EventScript_Colosseum
```
call CableClub_EventScript_Colosseum
end
```
### MossdeepCity_PokemonCenter_2F_EventScript_TradeCenter
```
call CableClub_EventScript_TradeCenter
end
```
### MossdeepCity_PokemonCenter_2F_EventScript_RecordCorner
```
call CableClub_EventScript_RecordCorner
end
```
### MossdeepCity_PokemonCenter_2F_EventScript_Woman5
```
msgbox MossdeepCity_PokemonCenter_2F_Text_Woman5, MSGBOX_NPC
end
```

## Textes (1)
### MossdeepCity_PokemonCenter_2F_Text_Woman5
```
Si je gagnais plein de combats en link\net démontrais ma force à tout le monde,\lj'aurais peut-être un fan!$
```

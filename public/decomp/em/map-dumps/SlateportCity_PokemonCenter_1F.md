# SlateportCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_SLATEPORT_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_SLATEPORT_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SLATEPORT_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `SlateportCity_PokemonCenter_1F_EventScript_Sailor` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 10,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `SlateportCity_PokemonCenter_1F_EventScript_Woman` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_SLATEPORT_CITY` warp #0
- #1 (6,8) → `MAP_SLATEPORT_CITY` warp #0
- #2 (1,6) → `MAP_SLATEPORT_CITY_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (5)
### SlateportCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SlateportCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### SlateportCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_SLATEPORT_CITY
call Common_EventScript_UpdateBrineyLocation
end
```
### SlateportCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_SLATEPORT_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### SlateportCity_PokemonCenter_1F_EventScript_Sailor
```
msgbox SlateportCity_PokemonCenter_1F_Text_RaiseDifferentTypesOfPokemon, MSGBOX_NPC
end
```
### SlateportCity_PokemonCenter_1F_EventScript_Woman
```
msgbox SlateportCity_PokemonCenter_1F_Text_TradedMonWithFriend, MSGBOX_NPC
end
```

## Textes (2)
### SlateportCity_PokemonCenter_1F_Text_RaiseDifferentTypesOfPokemon
```
Une petite astuce pour combattre?\pIl faut faire progresser divers types\nde POKéMON en même temps.\pCe n'est pas bien d'avoir un seul\nPOKéMON qui soit fort.\pS'il a un handicap à cause de son type,\nil n'aura aucune chance.$
```
### SlateportCity_PokemonCenter_1F_Text_TradedMonWithFriend
```
J'échange des POKéMON avec mes amis.\pQuand le POKéMON échangé porte\nun objet, je suis encore plus contente.$
```

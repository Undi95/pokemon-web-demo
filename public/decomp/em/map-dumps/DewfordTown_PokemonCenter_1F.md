# DewfordTown_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_DEWFORD_TOWN_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_DEWFORD_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_DEWFORD_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `DewfordTown_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 10,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `DewfordTown_PokemonCenter_1F_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 5,5 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `DewfordTown_PokemonCenter_1F_EventScript_Man` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_DEWFORD_TOWN` warp #1
- #1 (6,8) → `MAP_DEWFORD_TOWN` warp #1
- #2 (1,6) → `MAP_DEWFORD_TOWN_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (5)
### DewfordTown_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, DewfordTown_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### DewfordTown_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_DEWFORD_TOWN
call Common_EventScript_UpdateBrineyLocation
end
```
### DewfordTown_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_DEWFORD_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### DewfordTown_PokemonCenter_1F_EventScript_PokefanF
```
msgbox DewfordTown_PokemonCenter_1F_Text_StoneCavern, MSGBOX_NPC
end
```
### DewfordTown_PokemonCenter_1F_EventScript_Man
```
msgbox DewfordTown_PokemonCenter_1F_Text_FaintedMonCanUseHM, MSGBOX_NPC
end
```

## Textes (2)
### DewfordTown_PokemonCenter_1F_Text_StoneCavern
```
Il y a une caverne en bordure de\nla ville.\pJ'ai entendu dire qu'on y trouve des\npierres très rares.$
```
### DewfordTown_PokemonCenter_1F_Text_FaintedMonCanUseHM
```
Même si un POKéMON est K.O. et ne\npeut pas se battre, il peut quand\pmême utiliser les coups appris d'une\nCS ou CAPSULE SECRETE en dehors\ld'un combat.$
```

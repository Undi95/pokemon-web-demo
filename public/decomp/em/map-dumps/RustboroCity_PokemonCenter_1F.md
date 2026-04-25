# RustboroCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_RUSTBORO_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 11,2 | `MOVEMENT_TYPE_FACE_LEFT` | `RustboroCity_PokemonCenter_1F_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 3,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `RustboroCity_PokemonCenter_1F_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 10,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_PokemonCenter_1F_EventScript_Girl` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_RUSTBORO_CITY` warp #3
- #1 (6,8) → `MAP_RUSTBORO_CITY` warp #3
- #2 (1,6) → `MAP_RUSTBORO_CITY_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (6)
### RustboroCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, RustboroCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### RustboroCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_RUSTBORO_CITY
call Common_EventScript_UpdateBrineyLocation
end
```
### RustboroCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_RUSTBORO_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### RustboroCity_PokemonCenter_1F_EventScript_Man
```
msgbox RustboroCity_PokemonCenter_1F_Text_PokemonHavePersonalities, MSGBOX_NPC
end
```
### RustboroCity_PokemonCenter_1F_EventScript_Boy
```
msgbox RustboroCity_PokemonCenter_1F_Text_MaleAndFemalePokemon, MSGBOX_NPC
end
```
### RustboroCity_PokemonCenter_1F_EventScript_Girl
```
msgbox RustboroCity_PokemonCenter_1F_Text_HMCutNextDoor, MSGBOX_NPC
end
```

## Textes (3)
### RustboroCity_PokemonCenter_1F_Text_PokemonHavePersonalities
```
Mon POKéMON est NAIF et celui de mon\nami est JOVIAL. C'est leur nature.\pC'est fascinant de voir comme les\nPOKéMON ont leur caractère!$
```
### RustboroCity_PokemonCenter_1F_Text_MaleAndFemalePokemon
```
Tout comme chez les hommes, il existe\ndes POKéMON mâles et femelles.\pMais la différence entre les deux sexes\nne saute pas aux yeux.$
```
### RustboroCity_PokemonCenter_1F_Text_HMCutNextDoor
```
L'homme de la maison voisine m'a donné\nune CS!\pJe l'ai apprise à mon POKéMON pour\nqu'il COUPE les petits arbres.$
```

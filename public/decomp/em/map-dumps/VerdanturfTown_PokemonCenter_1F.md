# VerdanturfTown_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_VERDANTURF_TOWN_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_VERDANTURF_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_VERDANTURF_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `VerdanturfTown_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 4,5 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `VerdanturfTown_PokemonCenter_1F_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 12,2 | `MOVEMENT_TYPE_FACE_UP` | `VerdanturfTown_PokemonCenter_1F_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_LITTLE_BOY` | 10,6 | `MOVEMENT_TYPE_FACE_LEFT` | `VerdanturfTown_PokemonCenter_1F_EventScript_FuryCutterTutor` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_VERDANTURF_TOWN` warp #2
- #1 (6,8) → `MAP_VERDANTURF_TOWN` warp #2
- #2 (1,6) → `MAP_VERDANTURF_TOWN_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (5)
### VerdanturfTown_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, VerdanturfTown_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### VerdanturfTown_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_VERDANTURF_TOWN
call Common_EventScript_UpdateBrineyLocation
end
```
### VerdanturfTown_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_VERDANTURF_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### VerdanturfTown_PokemonCenter_1F_EventScript_Gentleman
```
msgbox VerdanturfTown_PokemonCenter_1F_Text_FaithInYourPokemon, MSGBOX_NPC
end
```
### VerdanturfTown_PokemonCenter_1F_EventScript_ExpertM
```
msgbox VerdanturfTown_PokemonCenter_1F_Text_VisitForBattleTent, MSGBOX_NPC
end
```

## Textes (2)
### VerdanturfTown_PokemonCenter_1F_Text_FaithInYourPokemon
```
Tu n'es pas un vrai DRESSEUR\nsi tu ne crois pas en tes POKéMON.\pPour réussir, il faut avoir une entière\nconfiance en ses POKéMON.$
```
### VerdanturfTown_PokemonCenter_1F_Text_VisitForBattleTent
```
Si les gens viennent à VERGAZON…\pc'est pour la TENTE DE COMBAT, bien sûr.\pTiens, toi par exemple. Que viens-tu\nfaire ici?$
```

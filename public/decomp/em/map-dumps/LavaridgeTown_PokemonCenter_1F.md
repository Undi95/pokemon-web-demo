# LavaridgeTown_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_LAVARIDGE_TOWN_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_LAVARIDGE_TOWN_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_LAVARIDGE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_LAVARIDGE_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 11,8 | `MOVEMENT_TYPE_FACE_UP` | `LavaridgeTown_PokemonCenter_1F_EventScript_Youngster` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 10,6 | `MOVEMENT_TYPE_FACE_LEFT` | `LavaridgeTown_PokemonCenter_1F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `LavaridgeTown_PokemonCenter_1F_EventScript_Gentleman` | `0` |

## Warps (4)
- #0 (7,8) → `MAP_LAVARIDGE_TOWN` warp #3
- #1 (6,8) → `MAP_LAVARIDGE_TOWN` warp #3
- #2 (1,6) → `MAP_LAVARIDGE_TOWN_POKEMON_CENTER_2F` warp #0
- #3 (2,1) → `MAP_LAVARIDGE_TOWN` warp #5

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (6)
### LavaridgeTown_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LavaridgeTown_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### LavaridgeTown_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_LAVARIDGE_TOWN
call Common_EventScript_UpdateBrineyLocation
end
```
### LavaridgeTown_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_LAVARIDGE_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### LavaridgeTown_PokemonCenter_1F_EventScript_Youngster
```
msgbox LavaridgeTown_PokemonCenter_1F_Text_HotSpringCanInvigorate, MSGBOX_NPC
end
```
### LavaridgeTown_PokemonCenter_1F_EventScript_Woman
```
msgbox LavaridgeTown_PokemonCenter_1F_Text_TrainersPokemonSpendTimeTogether, MSGBOX_NPC
end
```
### LavaridgeTown_PokemonCenter_1F_EventScript_Gentleman
```
msgbox LavaridgeTown_PokemonCenter_1F_Text_TrainersShouldRestToo, MSGBOX_NPC
end
```

## Textes (3)
### LavaridgeTown_PokemonCenter_1F_Text_TrainersPokemonSpendTimeTogether
```
Je crois que les POKéMON deviennent\nplus proches de leurs DRESSEURS s'ils\lpassent du temps ensemble.\pPlus ils passent de temps ensemble,\nplus ils sont proches. J'en suis sûre.$
```
### LavaridgeTown_PokemonCenter_1F_Text_HotSpringCanInvigorate
```
Les sources chaudes me font un bien\nfou.\pJ'aimerais que mes POKéMON puissent\nen profiter aussi.$
```
### LavaridgeTown_PokemonCenter_1F_Text_TrainersShouldRestToo
```
Ho ho! Hé, tu sais que tu peux accéder\naux sources chaudes par ici?\pPuisque les POKéMON se reposent, les\nDRESSEURS devraient aussi se reposer.$
```

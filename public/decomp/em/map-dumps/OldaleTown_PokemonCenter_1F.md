# OldaleTown_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_OLDALE_TOWN_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_OLDALE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_OLDALE_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `OldaleTown_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `OldaleTown_PokemonCenter_1F_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 10,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `OldaleTown_PokemonCenter_1F_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 3,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `OldaleTown_PokemonCenter_1F_EventScript_Girl` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_OLDALE_TOWN` warp #2
- #1 (6,8) → `MAP_OLDALE_TOWN` warp #2
- #2 (1,6) → `MAP_OLDALE_TOWN_POKEMON_CENTER_2F` warp #0

## Flags référencés (1)
- `FLAG_SYS_POKEDEX_GET`

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (7)
### OldaleTown_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, OldaleTown_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### OldaleTown_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_OLDALE_TOWN
call Common_EventScript_UpdateBrineyLocation
end
```
### OldaleTown_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_OLDALE_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### OldaleTown_PokemonCenter_1F_EventScript_Gentleman
```
msgbox OldaleTown_PokemonCenter_1F_Text_TrainersCanUsePC, MSGBOX_NPC
end
```
### OldaleTown_PokemonCenter_1F_EventScript_Boy
```
msgbox OldaleTown_PokemonCenter_1F_Text_PokemonCentersAreGreat, MSGBOX_NPC
end
```
### OldaleTown_PokemonCenter_1F_EventScript_Girl
```
lock
faceplayer
goto_if_set FLAG_SYS_POKEDEX_GET, OldaleTown_PokemonCenter_1F_EventScript_WirelessClubAvailable
msgbox OldaleTown_PokemonCenter_1F_Text_WirelessClubNotAvailable, MSGBOX_DEFAULT
release
end
```
### OldaleTown_PokemonCenter_1F_EventScript_WirelessClubAvailable
```
msgbox OldaleTown_PokemonCenter_1F_Text_TradedInWirelessClub, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### OldaleTown_PokemonCenter_1F_Text_TrainersCanUsePC
```
Le PC dans le coin est à la\ndisposition des DRESSEURS de POKéMON.\pNaturellement, tu peux l'utiliser\nquand tu veux.$
```
### OldaleTown_PokemonCenter_1F_Text_PokemonCentersAreGreat
```
Les CENTRES POKéMON sont géniaux!\pTu peux utiliser leurs services autant\nque tu veux. En plus, c'est gratuit.\pPas de souci!$
```
### OldaleTown_PokemonCenter_1F_Text_WirelessClubNotAvailable
```
L'étage du CENTRE POKéMON\nvient d'être construit.\pMais ils prétendent avoir encore besoin\nde faire quelques petits travaux.$
```
### OldaleTown_PokemonCenter_1F_Text_TradedInWirelessClub
```
L'étage du CENTRE POKéMON\nvient d'être construit.\pJ'y ai tout de suite échangé des\nPOKéMON.$
```

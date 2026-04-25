# BattleFrontier_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FRONTIER_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_SCHOOL_KID_M` | 4,5 | `MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT` | `BattleFrontier_PokemonCenter_1F_EventScript_SchoolKid` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 11,4 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_PokemonCenter_1F_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_PICNICKER` | 2,3 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_PokemonCenter_1F_EventScript_Picnicker` | `0` |
| `` | `OBJ_EVENT_GFX_SKITTY` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_PokemonCenter_1F_EventScript_Skitty` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #12
- #1 (6,8) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #12
- #2 (1,6) → `MAP_BATTLE_FRONTIER_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (7)
### BattleFrontier_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, BattleFrontier_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### BattleFrontier_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_BATTLE_FRONTIER_OUTSIDE_EAST
end
```
### BattleFrontier_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_FRONTIER_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### BattleFrontier_PokemonCenter_1F_EventScript_SchoolKid
```
msgbox BattleFrontier_PokemonCenter_1F_Text_NeverSeenPokemon, MSGBOX_NPC
end
```
### BattleFrontier_PokemonCenter_1F_EventScript_Man
```
msgbox BattleFrontier_PokemonCenter_1F_Text_NextStopBattleArena, MSGBOX_NPC
end
```
### BattleFrontier_PokemonCenter_1F_EventScript_Picnicker
```
msgbox BattleFrontier_PokemonCenter_1F_Text_GoingThroughEveryChallenge, MSGBOX_NPC
end
```
### BattleFrontier_PokemonCenter_1F_EventScript_Skitty
```
lock
faceplayer
waitse
playmoncry SPECIES_SKITTY, CRY_MODE_NORMAL
msgbox BattleFrontier_PokemonCenter_1F_Text_Skitty, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (4)
### BattleFrontier_PokemonCenter_1F_Text_NeverSeenPokemon
```
J'ai vu quelqu'un utiliser un POKéMON\nque je ne connaissais pas!\pEn tout cas, je n'en avais jamais\nentendu parler à l'ECOLE DE DRESSEURS.\pJe me demande bien où tu peux\nattraper ce genre de POKéMON.$
```
### BattleFrontier_PokemonCenter_1F_Text_NextStopBattleArena
```
Bien! Prochain arrêt, le DOJO DE COMBAT!\nJe vais prendre des POKéMON du système\lde Gestion de Stocks de POKéMON.$
```
### BattleFrontier_PokemonCenter_1F_Text_GoingThroughEveryChallenge
```
Hi, hi, hi… Je vais relever tous\nles défis avec mon bébé!$
```
### BattleFrontier_PokemonCenter_1F_Text_Skitty
```
SKITTY: Kiiiiity!$
```

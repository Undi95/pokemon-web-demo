# SootopolisCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_SOOTOPOLIS_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `SootopolisCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 12,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `SootopolisCity_PokemonCenter_1F_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 4,7 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `SootopolisCity_PokemonCenter_1F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 2,3 | `MOVEMENT_TYPE_WANDER_AROUND` | `SootopolisCity_PokemonCenter_1F_EventScript_DoubleEdgeTutor` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_SOOTOPOLIS_CITY` warp #0
- #1 (6,8) → `MAP_SOOTOPOLIS_CITY` warp #0
- #2 (1,6) → `MAP_SOOTOPOLIS_CITY_POKEMON_CENTER_2F` warp #0

## Flags référencés (1)
- `FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN`

## Variables référencées (2)
- `VAR_0x800B`
- `VAR_SKY_PILLAR_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (7)
### SootopolisCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, SootopolisCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### SootopolisCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_SOOTOPOLIS_CITY
end
```
### SootopolisCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_SOOTOPOLIS_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### SootopolisCity_PokemonCenter_1F_EventScript_Gentleman
```
lock
faceplayer
goto_if_ge VAR_SKY_PILLAR_STATE, 2, SootopolisCity_PokemonCenter_1F_EventScript_GentlemanNoLegendaries
goto_if_unset FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, SootopolisCity_PokemonCenter_1F_EventScript_GentlemanNoLegendaries
msgbox SootopolisCity_PokemonCenter_1F_Text_EveryoneTakenRefuge, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_PokemonCenter_1F_EventScript_GentlemanNoLegendaries
```
msgbox SootopolisCity_PokemonCenter_1F_Text_WallaceToughestInHoenn, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_PokemonCenter_1F_EventScript_Woman
```
lock
faceplayer
goto_if_ge VAR_SKY_PILLAR_STATE, 2, SootopolisCity_PokemonCenter_1F_EventScript_WomanNoLegendaries
goto_if_unset FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, SootopolisCity_PokemonCenter_1F_EventScript_WomanNoLegendaries
msgbox SootopolisCity_PokemonCenter_1F_Text_ArentPokemonOurFriends, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_PokemonCenter_1F_EventScript_WomanNoLegendaries
```
msgbox SootopolisCity_PokemonCenter_1F_Text_AlwaysBeFriendsWithPokemon, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### SootopolisCity_PokemonCenter_1F_Text_WallaceToughestInHoenn
```
On raconte que MARC est le DRESSEUR\nle plus fort de tout HOENN.\pL'ARENE de cette ville est dirigée par\ncelui qui lui a tout appris.\pMais le CONSEIL 4…\pOn dit qu'ils sont encore plus forts\nque le mentor de MARC.\pMais jusqu'à quel point?$
```
### SootopolisCity_PokemonCenter_1F_Text_EveryoneTakenRefuge
```
Tout le monde en ville s'est réfugié\nchez soi et personne ne veut sortir.\pMême moi je ferais bien de ne pas\nm'aventurer dehors.$
```
### SootopolisCity_PokemonCenter_1F_Text_AlwaysBeFriendsWithPokemon
```
Peu importe ce qui se passera, où\net quand ça se passera, je resterai\ltoujours amie avec les POKéMON.\pCar c'est cool d'être avec les POKéMON!$
```
### SootopolisCity_PokemonCenter_1F_Text_ArentPokemonOurFriends
```
Je ne sais pas pourquoi…\nmais… j'ai vraiment peur…$
```

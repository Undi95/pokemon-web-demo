# EverGrandeCity_PokemonLeague_1F

## Métadonnées
- **id** : `MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F`
- **layout** : `LAYOUT_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_EVER_GRANDE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_LEAGUE_NURSE` | `OBJ_EVENT_GFX_NURSE` | 3,2 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PokemonLeague_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 16,2 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PokemonLeague_1F_EventScript_Clerk` | `0` |
| `LOCALID_LEAGUE_GUARD_1` | `OBJ_EVENT_GFX_MAN_3` | 8,2 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PokemonLeague_1F_EventScript_DoorGuard` | `0` |
| `LOCALID_LEAGUE_GUARD_2` | `OBJ_EVENT_GFX_MAN_3` | 11,2 | `MOVEMENT_TYPE_FACE_DOWN` | `EverGrandeCity_PokemonLeague_1F_EventScript_DoorGuard` | `0` |

## Warps (5)
- #0 (9,11) → `MAP_EVER_GRANDE_CITY` warp #0
- #1 (10,11) → `MAP_EVER_GRANDE_CITY` warp #0
- #2 (9,1) → `MAP_EVER_GRANDE_CITY_HALL5` warp #0
- #3 (10,1) → `MAP_EVER_GRANDE_CITY_HALL5` warp #0
- #4 (1,7) → `MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_2F` warp #0

## Flags référencés (3)
- `FLAG_BADGE06_GET`
- `FLAG_ENTERED_ELITE_FOUR`
- `FLAG_LANDMARK_POKEMON_LEAGUE`

## Variables référencées (4)
- `VAR_0x800B`
- `VAR_LAST_TALKED`
- `VAR_TEMP_0`
- `VAR_TEMP_1`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (15)
### EverGrandeCity_PokemonLeague_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, EverGrandeCity_PokemonLeague_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### EverGrandeCity_PokemonLeague_1F_OnTransition
```
setrespawn HEAL_LOCATION_EVER_GRANDE_CITY_POKEMON_LEAGUE
setflag FLAG_LANDMARK_POKEMON_LEAGUE
call_if_unset FLAG_ENTERED_ELITE_FOUR, EverGrandeCity_PokemonLeague_1F_EventScript_GuardsBlockDoor
end
```
### EverGrandeCity_PokemonLeague_1F_EventScript_GuardsBlockDoor
```
setobjectxyperm LOCALID_LEAGUE_GUARD_1, 9, 2
setobjectxyperm LOCALID_LEAGUE_GUARD_2, 10, 2
return
```
### EverGrandeCity_PokemonLeague_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_LEAGUE_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### EverGrandeCity_PokemonLeague_1F_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart EverGrandeCity_PokemonLeague_1F_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### EverGrandeCity_PokemonLeague_1F_Pokemart
```
pokemartlistend
```
### EverGrandeCity_PokemonLeague_1F_EventScript_DoorGuard
```
lockall
goto_if_set FLAG_ENTERED_ELITE_FOUR, EverGrandeCity_PokemonLeague_1F_EventScript_GoForth
getplayerxy VAR_TEMP_0, VAR_TEMP_1
call_if_ge VAR_TEMP_0, 11, EverGrandeCity_PokemonLeague_1F_EventScript_PlayerMoveToFrontFromRight
call_if_le VAR_TEMP_0, 8, EverGrandeCity_PokemonLeague_1F_EventScript_PlayerMoveToFrontFromLeft
message EverGrandeCity_PokemonLeague_1F_Text_MustHaveAllGymBadges
waitmessage
delay 120
goto_if_unset FLAG_BADGE06_GET, EverGrandeCity_PokemonLeague_1F_EventScript_NotAllBadges
closemessage
applymovement LOCALID_LEAGUE_GUARD_1, EverGrandeCity_PokemonLeague_1F_Movement_LeftGuardOutOfWay
applymovement LOCALID_LEAGUE_GUARD_2, EverGrandeCity_PokemonLeague_1F_Movement_RightGuardOutOfWay
waitmovement 0
delay 10
playfanfare MUS_OBTAIN_BADGE
message EverGrandeCity_PokemonLeague_1F_Text_GoForth
waitmessage
waitfanfare
closemessage
copyobjectxytoperm LOCALID_LEAGUE_GUARD_1
copyobjectxytoperm LOCALID_LEAGUE_GUARD_2
setflag FLAG_ENTERED_ELITE_FOUR
releaseall
end
```
### EverGrandeCity_PokemonLeague_1F_EventScript_PlayerMoveToFrontFromRight
```
applymovement LOCALID_PLAYER, EverGrandeCity_PokemonLeague_1F_Movement_MoveToFrontFromRight
waitmovement 0
return
```
### EverGrandeCity_PokemonLeague_1F_EventScript_PlayerMoveToFrontFromLeft
```
applymovement LOCALID_PLAYER, EverGrandeCity_PokemonLeague_1F_Movement_MoveToFrontFromLeft
waitmovement 0
return
```
### EverGrandeCity_PokemonLeague_1F_EventScript_NotAllBadges
```
playse SE_FAILURE
msgbox EverGrandeCity_PokemonLeague_1F_Text_HaventObtainedAllBadges, MSGBOX_DEFAULT
releaseall
end
```
### EverGrandeCity_PokemonLeague_1F_EventScript_GoForth
```
applymovement VAR_LAST_TALKED, Common_Movement_FacePlayer
waitmovement 0
msgbox EverGrandeCity_PokemonLeague_1F_Text_GoForth, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### EverGrandeCity_PokemonLeague_1F_Movement_MoveToFrontFromRight
```
walk_down
walk_left
walk_in_place_faster_up
step_end
```
### EverGrandeCity_PokemonLeague_1F_Movement_MoveToFrontFromLeft
```
walk_down
walk_right
walk_in_place_faster_up
step_end
```
### EverGrandeCity_PokemonLeague_1F_Movement_LeftGuardOutOfWay
```
walk_left
walk_in_place_faster_down
step_end
```
### EverGrandeCity_PokemonLeague_1F_Movement_RightGuardOutOfWay
```
walk_right
walk_in_place_faster_down
step_end
```

## Textes (3)
### EverGrandeCity_PokemonLeague_1F_Text_MustHaveAllGymBadges
```
A partir d'ici, seuls les DRESSEURS\nayant obtenu les BADGES de toutes les\lARENES sont autorisés à entrer.\pDRESSEUR, voyons si tu as bien tous\nles BADGES.$
```
### EverGrandeCity_PokemonLeague_1F_Text_HaventObtainedAllBadges
```
Tu n'as pas obtenu tous les BADGES.\pSi tu étais en route pour la LIGUE\nPOKéMON, il faut que tu retournes\lles chercher tous.$
```
### EverGrandeCity_PokemonLeague_1F_Text_GoForth
```
DRESSEUR! Crois en toi et tes\nPOKéMON, et en avant!$
```

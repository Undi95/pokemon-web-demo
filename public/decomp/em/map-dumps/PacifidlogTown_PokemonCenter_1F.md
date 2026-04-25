# PacifidlogTown_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PACIFIDLOG_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `PacifidlogTown_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 10,6 | `MOVEMENT_TYPE_FACE_LEFT` | `PacifidlogTown_PokemonCenter_1F_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 2,2 | `MOVEMENT_TYPE_FACE_UP` | `PacifidlogTown_PokemonCenter_1F_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 4,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `PacifidlogTown_PokemonCenter_1F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 12,8 | `MOVEMENT_TYPE_FACE_UP` | `PacifidlogTown_PokemonCenter_1F_EventScript_ExplosionTutor` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_PACIFIDLOG_TOWN` warp #0
- #1 (6,8) → `MAP_PACIFIDLOG_TOWN` warp #0
- #2 (1,6) → `MAP_PACIFIDLOG_TOWN_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (6)
### PacifidlogTown_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, PacifidlogTown_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### PacifidlogTown_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_PACIFIDLOG_TOWN
end
```
### PacifidlogTown_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_PACIFIDLOG_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### PacifidlogTown_PokemonCenter_1F_EventScript_Girl
```
msgbox PacifidlogTown_PokemonCenter_1F_Text_WhatColorTrainerCard, MSGBOX_NPC
end
```
### PacifidlogTown_PokemonCenter_1F_EventScript_Woman
```
msgbox PacifidlogTown_PokemonCenter_1F_Text_OnColonyOfCorsola, MSGBOX_NPC
end
```
### PacifidlogTown_PokemonCenter_1F_EventScript_OldMan
```
msgbox PacifidlogTown_PokemonCenter_1F_Text_AncestorsLivedOnBoats, MSGBOX_NPC
end
```

## Textes (3)
### PacifidlogTown_PokemonCenter_1F_Text_WhatColorTrainerCard
```
De quelle couleur est ta CARTE DE\nDRESSEUR? La mienne est cuivrée!$
```
### PacifidlogTown_PokemonCenter_1F_Text_OnColonyOfCorsola
```
PACIFIVILLE flotte au-dessus\nd'une colonie de CORAYON.\pÇa semble incroyable, non?$
```
### PacifidlogTown_PokemonCenter_1F_Text_AncestorsLivedOnBoats
```
On dit que les ancêtres des habitants\nde PACIFIVILLE sont nés sur\ldes bateaux, pour y vivre et y mourir.\pJe crois qu'ils vivaient comme ça\nparce qu'ils cherchaient quelque\lchose.$
```

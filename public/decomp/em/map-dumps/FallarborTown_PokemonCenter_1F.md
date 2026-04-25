# FallarborTown_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FALLARBOR_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 10,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `FallarborTown_PokemonCenter_1F_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_PokemonCenter_1F_EventScript_ExpertM` | `0` |
| `LOCALID_FALLARBOR_LANETTE` | `OBJ_EVENT_GFX_WOMAN_2` | 10,2 | `MOVEMENT_TYPE_FACE_UP` | `FallarborTown_PokemonCenter_1F_EventScript_Lanette` | `FLAG_HIDE_FALLARBOR_POKEMON_CENTER_LANETTE` |

## Warps (3)
- #0 (7,8) → `MAP_FALLARBOR_TOWN` warp #2
- #1 (6,8) → `MAP_FALLARBOR_TOWN` warp #2
- #2 (1,6) → `MAP_FALLARBOR_TOWN_POKEMON_CENTER_2F` warp #0

## Flags référencés (1)
- `FLAG_HIDE_LANETTES_HOUSE_LANETTE`

## Variables référencées (2)
- `VAR_0x800B`
- `VAR_FACING`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (11)
### FallarborTown_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, FallarborTown_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### FallarborTown_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_FALLARBOR_TOWN
call Common_EventScript_UpdateBrineyLocation
end
```
### FallarborTown_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_FALLARBOR_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### FallarborTown_PokemonCenter_1F_EventScript_Girl
```
msgbox FallarborTown_PokemonCenter_1F_Text_FossilManiacEdgeOfTown, MSGBOX_NPC
end
```
### FallarborTown_PokemonCenter_1F_EventScript_ExpertM
```
msgbox FallarborTown_PokemonCenter_1F_Text_PlantHardyTrees, MSGBOX_NPC
end
```
### FallarborTown_PokemonCenter_1F_EventScript_Lanette
```
lock
faceplayer
msgbox FallarborTown_PokemonCenter_1F_Text_LanetteGreeting, MSGBOX_DEFAULT
closemessage
switch VAR_FACING
case DIR_NORTH, FallarborTown_PokemonCenter_1F_EventScript_LanetteExitNorth
case DIR_WEST, FallarborTown_PokemonCenter_1F_EventScript_LanetteExitWest
end
```
### FallarborTown_PokemonCenter_1F_EventScript_LanetteExitNorth
```
applymovement LOCALID_FALLARBOR_LANETTE, FallarborTown_PokemonCenter_1F_Movement_LanetteExitNorth
waitmovement 0
goto FallarborTown_PokemonCenter_1F_EventScript_LanetteExited
end
```
### FallarborTown_PokemonCenter_1F_EventScript_LanetteExitWest
```
applymovement LOCALID_FALLARBOR_LANETTE, FallarborTown_PokemonCenter_1F_Movement_LanetteExitWest
waitmovement 0
goto FallarborTown_PokemonCenter_1F_EventScript_LanetteExited
end
```
### FallarborTown_PokemonCenter_1F_EventScript_LanetteExited
```
playse SE_SLIDING_DOOR
removeobject LOCALID_FALLARBOR_LANETTE
clearflag FLAG_HIDE_LANETTES_HOUSE_LANETTE
release
end
```
### FallarborTown_PokemonCenter_1F_Movement_LanetteExitNorth
```
walk_right
walk_down
walk_down
walk_left
walk_left
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
delay_8
step_end
```
### FallarborTown_PokemonCenter_1F_Movement_LanetteExitWest
```
walk_down
walk_down
walk_left
walk_left
walk_left
walk_down
walk_down
walk_down
walk_down
delay_8
step_end
```

## Textes (3)
### FallarborTown_PokemonCenter_1F_Text_LanetteGreeting
```
Oh, bonjour.\nQui es-tu?\pD'accord, tu t'appelles {PLAYER}{KUN}.\nTu es DRESSEUR, apparemment.\pCela veut donc dire que tu utilises ce\nprogramme de Gestion de Stocks de\lPOKéMON que j'ai développé.\pEnfin, c'est une conclusion que je tire\nd'un processus de déduction simple.\pTu me parles parce que tu veux\naccéder à quelque chose sur ce PC.\pOh, pardon, je ne me suis pas présentée.\nJe m'appelle ANNETTE.\pEnchantée. Je suis contente que tu\nutilises la Gestion de Stocks.\pSi tu en as l'occasion, viens me rendre\nvisite. J'habite sur la ROUTE 114.$
```
### FallarborTown_PokemonCenter_1F_Text_FossilManiacEdgeOfTown
```
Je me demande à quoi ressemblaient les\nPOKéMON durant la préhistoire.\pLe MANIAQUE DES FOSSILES qui vit\nen bordure de la ville doit le savoir.$
```
### FallarborTown_PokemonCenter_1F_Text_PlantHardyTrees
```
Dans les champs d'AUTEQUIA,\nnous mettons de jeunes plants en\lterre. Ce sont des arbres très vivaces\lqui poussent dans la cendre volcanique.$
```

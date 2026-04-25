# PetalburgCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_PETALBURG_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_PETALBURG_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_PETALBURG_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 11,2 | `MOVEMENT_TYPE_FACE_DOWN` | `ProfileMan_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgCity_PokemonCenter_1F_EventScript_FatMan` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 9,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `PetalburgCity_PokemonCenter_1F_EventScript_Youngster` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 5,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgCity_PokemonCenter_1F_EventScript_Woman` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_PETALBURG_CITY` warp #3
- #1 (6,8) → `MAP_PETALBURG_CITY` warp #3
- #2 (1,6) → `MAP_PETALBURG_CITY_POKEMON_CENTER_2F` warp #0

## Variables référencées (3)
- `VAR_0x800B`
- `VAR_RESULT`
- `VAR_STARTER_MON`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (10)
### PetalburgCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, PetalburgCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### PetalburgCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_PETALBURG_CITY
call Common_EventScript_UpdateBrineyLocation
end
```
### PetalburgCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_PETALBURG_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### PetalburgCity_PokemonCenter_1F_EventScript_FatMan
```
msgbox PetalburgCity_PokemonCenter_1F_Text_PCStorageSystem, MSGBOX_NPC
end
```
### PetalburgCity_PokemonCenter_1F_EventScript_Youngster
```
msgbox PetalburgCity_PokemonCenter_1F_Text_OranBerryRegainedHP, MSGBOX_NPC
end
```
### PetalburgCity_PokemonCenter_1F_EventScript_Woman
```
lock
faceplayer
msgbox PetalburgCity_PokemonCenter_1F_Text_ManyTypesOfPokemon, MSGBOX_DEFAULT
specialvar VAR_RESULT, IsStarterInParty
goto_if_eq VAR_RESULT, TRUE, PetalburgCity_PokemonCenter_1F_EventScript_SayStarterTypeInfo
release
end
```
### PetalburgCity_PokemonCenter_1F_EventScript_SayStarterTypeInfo
```
call_if_eq VAR_STARTER_MON, 0, PetalburgCity_PokemonCenter_1F_EventScript_SayTreeckoType
call_if_eq VAR_STARTER_MON, 1, PetalburgCity_PokemonCenter_1F_EventScript_SayTorchicType
call_if_eq VAR_STARTER_MON, 2, PetalburgCity_PokemonCenter_1F_EventScript_SayMudkipType
release
end
```
### PetalburgCity_PokemonCenter_1F_EventScript_SayTreeckoType
```
msgbox PetalburgCity_PokemonCenter_1F_Text_TreeckoIsGrassType, MSGBOX_DEFAULT
return
```
### PetalburgCity_PokemonCenter_1F_EventScript_SayTorchicType
```
msgbox PetalburgCity_PokemonCenter_1F_Text_TorchicIsFireType, MSGBOX_DEFAULT
return
```
### PetalburgCity_PokemonCenter_1F_EventScript_SayMudkipType
```
msgbox PetalburgCity_PokemonCenter_1F_Text_MudkipIsWaterType, MSGBOX_DEFAULT
return
```

## Textes (6)
### PetalburgCity_PokemonCenter_1F_Text_PCStorageSystem
```
Ce système de stockage de POKéMON\nsur PC…\pCelui qui l'a inventé doit être\nune sorte de génie de la science!$
```
### PetalburgCity_PokemonCenter_1F_Text_OranBerryRegainedHP
```
Quand mon POKéMON mange une\nBAIE ORAN, il récupère des PV!$
```
### PetalburgCity_PokemonCenter_1F_Text_ManyTypesOfPokemon
```
Il existe de nombreux types de POKéMON.\pChaque type a ses forces et ses\nfaiblesses face aux autres types.\pSelon les types de POKéMON,\nle combat peut être facile ou difficile.$
```
### PetalburgCity_PokemonCenter_1F_Text_TreeckoIsGrassType
```
Par exemple, ton ARCKO est un\nPOKéMON du type PLANTE.\pIl est fort contre les POKéMON \ndes types EAU et SOL.\pMais il est faible contre les POKéMON\ndu type FEU.$
```
### PetalburgCity_PokemonCenter_1F_Text_TorchicIsFireType
```
Par exemple, ton POUSSIFEU est un\nPOKéMON du type FEU.\pIl est fort contre les POKéMON \ndes types PLANTE et INSECTE.\pMais il est faible contre les POKéMON\ndu type EAU.$
```
### PetalburgCity_PokemonCenter_1F_Text_MudkipIsWaterType
```
Par exemple, ton GOBOU est un\nPOKéMON du type EAU.\pIl est fort contre les POKéMON \ndu type FEU.\pMais il est faible contre les POKéMON\ndes types PLANTE et ELECTRIK.$
```

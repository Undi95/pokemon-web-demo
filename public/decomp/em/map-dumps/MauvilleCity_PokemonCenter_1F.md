# MauvilleCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_MAUVILLE_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_MAUVILLE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MAUVILLE_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `MauvilleCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_VAR_0` | 2,3 | `MOVEMENT_TYPE_FACE_LEFT` | `MauvilleCity_PokemonCenter_1F_EventScript_MauvilleOldMan` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 8,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `MauvilleCity_PokemonCenter_1F_EventScript_Woman1` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 11,4 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `MauvilleCity_PokemonCenter_1F_EventScript_Woman2` | `0` |
| `` | `OBJ_EVENT_GFX_YOUNGSTER` | 2,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `MauvilleCity_PokemonCenter_1F_EventScript_Youngster` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_MAUVILLE_CITY` warp #1
- #1 (6,8) → `MAP_MAUVILLE_CITY` warp #1
- #2 (1,6) → `MAP_MAUVILLE_CITY_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_UpdateBrineyLocation`
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (7)
### MauvilleCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, MauvilleCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### MauvilleCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_MAUVILLE_CITY
call Common_EventScript_UpdateBrineyLocation
goto MauvilleCity_PokemonCenter_1F_EventScript_SetMauvilleOldManGfx
end
```
### MauvilleCity_PokemonCenter_1F_EventScript_SetMauvilleOldManGfx
```
special SetMauvilleOldManObjEventGfx
end
```
### MauvilleCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_MAUVILLE_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### MauvilleCity_PokemonCenter_1F_EventScript_Woman1
```
msgbox MauvilleCity_PokemonCenter_1F_Text_ManOverThereSaysWeirdThings, MSGBOX_NPC
end
```
### MauvilleCity_PokemonCenter_1F_EventScript_Woman2
```
msgbox MauvilleCity_PokemonCenter_1F_Text_MyDataUpdatedFromRecordCorner, MSGBOX_NPC
end
```
### MauvilleCity_PokemonCenter_1F_EventScript_Youngster
```
msgbox MauvilleCity_PokemonCenter_1F_Text_RecordCornerSoundsFun, MSGBOX_NPC
end
```

## Textes (3)
### MauvilleCity_PokemonCenter_1F_Text_ManOverThereSaysWeirdThings
```
L'homme qui est là-bas dit des choses\nétranges.\pIl est marrant, mais bizarre aussi.\nJe ne suis pas près de l'oublier!$
```
### MauvilleCity_PokemonCenter_1F_Text_MyDataUpdatedFromRecordCorner
```
Quand j'ai échangé des données au\nCENTRE DE DONNEES, il y a eu une mise à\ljour de ce qui est à la mode à MYOKARA.\pMaintenant, j'ai les mêmes que mes amis!$
```
### MauvilleCity_PokemonCenter_1F_Text_RecordCornerSoundsFun
```
Un CENTRE DE DONNEES a ouvert à l'étage\ndu CENTRE POKéMON.\pJe ne sais pas de quoi il s'agit au juste,\nmais ça a l'air sympa. Je passerai voir!$
```

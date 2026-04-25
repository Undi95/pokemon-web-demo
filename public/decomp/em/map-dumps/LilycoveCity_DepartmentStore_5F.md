# LilycoveCity_DepartmentStore_5F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_5F`
- **layout** : `LAYOUT_LILYCOVE_CITY_DEPARTMENT_STORE_5F`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_LITTLE_GIRL` | 1,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `LilycoveCity_DepartmentStore_5F_EventScript_LittleGirl` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 7,7 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `LilycoveCity_DepartmentStore_5F_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_DepartmentStore_5F_EventScript_ClerkFarLeft` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 9,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_DepartmentStore_5F_EventScript_ClerkMidLeft` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 15,6 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_DepartmentStore_5F_EventScript_ClerkMidRight` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 17,6 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_DepartmentStore_5F_EventScript_ClerkFarRight` | `0` |
| `LOCALID_DEPARTMENT_STORE_STAIRS_WOMAN` | `OBJ_EVENT_GFX_WOMAN_2` | 9,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_DepartmentStore_5F_EventScript_Woman` | `0` |

## Warps (3)
- #0 (13,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_4F` warp #1
- #1 (2,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ELEVATOR` warp #0
- #2 (16,1) → `MAP_LILYCOVE_CITY_DEPARTMENT_STORE_ROOFTOP` warp #0

## Variables référencées (1)
- `VAR_SOOTOPOLIS_CITY_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (16)
### LilycoveCity_DepartmentStore_5F_MapScripts
```
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, LilycoveCity_DepartmentStore_5F_OnWarp
```
### LilycoveCity_DepartmentStore_5F_OnWarp
```
map_script_2 VAR_SOOTOPOLIS_CITY_STATE, 1, LilycoveCity_DepartmentStore_5F_EventScript_BlockRoofStairs
map_script_2 VAR_SOOTOPOLIS_CITY_STATE, 2, LilycoveCity_DepartmentStore_5F_EventScript_BlockRoofStairs
map_script_2 VAR_SOOTOPOLIS_CITY_STATE, 3, LilycoveCity_DepartmentStore_5F_EventScript_BlockRoofStairs
```
### LilycoveCity_DepartmentStore_5F_EventScript_BlockRoofStairs
```
setobjectxy LOCALID_DEPARTMENT_STORE_STAIRS_WOMAN, 16, 2
turnobject LOCALID_DEPARTMENT_STORE_STAIRS_WOMAN, DIR_NORTH
end
```
### LilycoveCity_DepartmentStore_5F_EventScript_ClerkFarLeft
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration2 LilycoveCity_DepartmentStore_5F_Pokemart_Dolls
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_5F_Pokemart_Dolls
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_5F_EventScript_ClerkMidLeft
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration2 LilycoveCity_DepartmentStore_5F_Pokemart_Cushions
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_5F_Pokemart_Cushions
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_5F_EventScript_ClerkMidRight
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration2 LilycoveCity_DepartmentStore_5F_Pokemart_Posters
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_5F_Pokemart_Posters
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_5F_EventScript_ClerkFarRight
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemartdecoration2 LilycoveCity_DepartmentStore_5F_Pokemart_Mats
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_DepartmentStore_5F_Pokemart_Mats
```
pokemartlistend
```
### LilycoveCity_DepartmentStore_5F_EventScript_PokefanF
```
msgbox LilycoveCity_DepartmentStore_5F_Text_PlaceFullOfCuteDolls, MSGBOX_NPC
end
```
### LilycoveCity_DepartmentStore_5F_EventScript_Woman
```
lockall
applymovement LOCALID_DEPARTMENT_STORE_STAIRS_WOMAN, Common_Movement_FacePlayer
waitmovement 0
goto_if_eq VAR_SOOTOPOLIS_CITY_STATE, 0, LilycoveCity_DepartmentStore_5F_EventScript_WomanNormal
goto_if_ge VAR_SOOTOPOLIS_CITY_STATE, 4, LilycoveCity_DepartmentStore_5F_EventScript_WomanNormal
goto LilycoveCity_DepartmentStore_5F_EventScript_WomanLegendaryWeather
end
```
### LilycoveCity_DepartmentStore_5F_EventScript_WomanNormal
```
msgbox LilycoveCity_DepartmentStore_5F_Text_SellManyCuteMatsHere, MSGBOX_DEFAULT
closemessage
releaseall
end
```
### LilycoveCity_DepartmentStore_5F_EventScript_WomanLegendaryWeather
```
msgbox LilycoveCity_DepartmentStore_5F_Text_ClosedRooftopForWeather, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_DEPARTMENT_STORE_STAIRS_WOMAN, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
releaseall
end
```
### LilycoveCity_DepartmentStore_5F_EventScript_LittleGirl
```
msgbox LilycoveCity_DepartmentStore_5F_Text_GettingDollInsteadOfPokemon, MSGBOX_NPC
end
```

## Textes (4)
### LilycoveCity_DepartmentStore_5F_Text_PlaceFullOfCuteDolls
```
Ce lieu regorge d'adorables POUPEES.\pJe devrais aussi en acheter pour moi\net pas que pour les enfants.$
```
### LilycoveCity_DepartmentStore_5F_Text_GettingDollInsteadOfPokemon
```
J'suis trop petite pour un POKéMON,\nalors je prends une adorable POUPEE.$
```
### LilycoveCity_DepartmentStore_5F_Text_SellManyCuteMatsHere
```
Ils vendent plein de super TAPIS ici.\pJe me demande lequel je vais prendre.\nJe vais peut-être tous les acheter…$
```
### LilycoveCity_DepartmentStore_5F_Text_ClosedRooftopForWeather
```
Je crois qu'ils ont fermé le toit\nà cause du mauvais temps.$
```

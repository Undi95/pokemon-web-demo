# FortreeCity_PokemonCenter_1F

## Métadonnées
- **id** : `MAP_FORTREE_CITY_POKEMON_CENTER_1F`
- **layout** : `LAYOUT_POKEMON_CENTER_1F`
- **music** : `MUS_POKE_CENTER`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FORTREE_NURSE` | `OBJ_EVENT_GFX_NURSE` | 7,2 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_PokemonCenter_1F_EventScript_Nurse` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 4,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `FortreeCity_PokemonCenter_1F_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 8,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `FortreeCity_PokemonCenter_1F_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_PokemonCenter_1F_EventScript_Boy` | `0` |

## Warps (3)
- #0 (7,8) → `MAP_FORTREE_CITY` warp #0
- #1 (6,8) → `MAP_FORTREE_CITY` warp #0
- #2 (1,6) → `MAP_FORTREE_CITY_POKEMON_CENTER_2F` warp #0

## Variables référencées (1)
- `VAR_0x800B`

## Labels externes appelés (résolus via _common.json ou orphelins)
### data/scripts/pkmn_center_nurse.inc
- `Common_EventScript_PkmnCenterNurse`

## Scripts (6)
### FortreeCity_PokemonCenter_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, FortreeCity_PokemonCenter_1F_OnTransition
map_script MAP_SCRIPT_ON_RESUME, CableClub_OnResume
```
### FortreeCity_PokemonCenter_1F_OnTransition
```
setrespawn HEAL_LOCATION_FORTREE_CITY
end
```
### FortreeCity_PokemonCenter_1F_EventScript_Nurse
```
setvar VAR_0x800B, LOCALID_NURSE
call Common_EventScript_PkmnCenterNurse
waitmessage
waitbuttonpress
release
end
```
### FortreeCity_PokemonCenter_1F_EventScript_Gentleman
```
msgbox FortreeCity_PokemonCenter_1F_Text_GoToSafariZone, MSGBOX_NPC
end
```
### FortreeCity_PokemonCenter_1F_EventScript_Man
```
msgbox FortreeCity_PokemonCenter_1F_Text_RecordCornerIsNeat, MSGBOX_NPC
end
```
### FortreeCity_PokemonCenter_1F_EventScript_Boy
```
msgbox FortreeCity_PokemonCenter_1F_Text_DoYouKnowAboutPokenav, MSGBOX_NPC
end
```

## Textes (3)
### FortreeCity_PokemonCenter_1F_Text_GoToSafariZone
```
Ecoute, mon petit, est-ce que tu\ntravailles sur un POKéDEX?\pHum… Va au PARC SAFARI, sur la\nROUTE 121! C'est mon conseil.$
```
### FortreeCity_PokemonCenter_1F_Text_RecordCornerIsNeat
```
Tu as déjà fait quelque chose au\nCENTRE DE DONNEES?\pC'est ingénieux. Ça permet d'échanger\ndes données entre DRESSEURS.\pJe sais pas trop comment ça marche,\nmais c'est cool. C'est même génial!$
```
### FortreeCity_PokemonCenter_1F_Text_DoYouKnowAboutPokenav
```
Hé, tu as un POKéNAV!\nC'est le même que le mien!\pTu connais la fonction MATCH PHONE?\pUtilise-la pour tchater avec les\nDRESSEURS que tu auras enregistrés.\pCette option t'indique aussi les\nDRESSEURS souhaitant une revanche.\pC'est pas génial?\nY a pas mieux que DEVON!$
```

# SootopolisCity_House4

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE4`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE1`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_1` | 2,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_House4_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 5,2 | `MOVEMENT_TYPE_FACE_UP` | `SootopolisCity_House4_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_AZUMARILL` | 2,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `SootopolisCity_House4_EventScript_Azumarill` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #7
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #7

## Scripts (3)
### SootopolisCity_House4_EventScript_Man
```
msgbox SootopolisCity_House4_Text_AncientTreasuresWaitingInSea, MSGBOX_NPC
end
```
### SootopolisCity_House4_EventScript_Woman
```
msgbox SootopolisCity_House4_Text_StrollUnderwaterWithPokemon, MSGBOX_NPC
end
```
### SootopolisCity_House4_EventScript_Azumarill
```
lock
faceplayer
waitse
playmoncry SPECIES_AZUMARILL, CRY_MODE_NORMAL
msgbox SootopolisCity_House4_Text_Azumarill, MSGBOX_DEFAULT
waitmoncry
release
end
```

## Textes (3)
### SootopolisCity_House4_Text_AncientTreasuresWaitingInSea
```
Ecoute-moi bien, je vais te dire\nquelque chose d'intéressant.\pIl paraît qu'il existe, pas très loin\nd'ici, une vieille ruine dans la mer.\pIl y a peut-être là-bas des trésors qui\nne demandent qu'à être découverts.$
```
### SootopolisCity_House4_Text_StrollUnderwaterWithPokemon
```
D'anciens trésors…\pCe serait formidable s'ils existaient\nvraiment, mais même si ce n'est pas le\lcas, ce serait merveilleux de faire\lun tour sous l'eau avec mon POKéMON.$
```
### SootopolisCity_House4_Text_Azumarill
```
AZUMARILL: Zuzu.$
```

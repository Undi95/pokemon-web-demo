# SootopolisCity_Mart

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
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
| `LOCALID_SOOTOPOLIS_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_Mart_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 5,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_Mart_EventScript_FatMan` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 9,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_Mart_EventScript_Gentleman` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_SOOTOPOLIS_CITY` warp #1
- #1 (4,7) → `MAP_SOOTOPOLIS_CITY` warp #1

## Flags référencés (1)
- `FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN`

## Variables référencées (1)
- `VAR_SKY_PILLAR_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (6)
### SootopolisCity_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart SootopolisCity_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Mart_Pokemart
```
pokemartlistend
```
### SootopolisCity_Mart_EventScript_FatMan
```
lock
faceplayer
goto_if_ge VAR_SKY_PILLAR_STATE, 2, SootopolisCity_Mart_EventScript_FatManNoLegendaries
goto_if_unset FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, SootopolisCity_Mart_EventScript_FatManNoLegendaries
msgbox SootopolisCity_Mart_Text_TooScaryOutside, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Mart_EventScript_FatManNoLegendaries
```
msgbox SootopolisCity_Mart_Text_PPUpIsGreat, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Mart_EventScript_Gentleman
```
lock
faceplayer
goto_if_ge VAR_SKY_PILLAR_STATE, 2, SootopolisCity_Mart_EventScript_GentlemanNoLegendaries
goto_if_unset FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN, SootopolisCity_Mart_EventScript_GentlemanNoLegendaries
msgbox SootopolisCity_Mart_Text_DidSomethingAwaken, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_Mart_EventScript_GentlemanNoLegendaries
```
msgbox SootopolisCity_Mart_Text_FullRestoreItemOfDreams, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### SootopolisCity_Mart_Text_PPUpIsGreat
```
Le PP PLUS est génial!\pIl augmente les POINTS DE POUVOIR,\nou PP, d'une capacité d'un POKéMON.$
```
### SootopolisCity_Mart_Text_TooScaryOutside
```
Que… Que se passe-t-il?\pJe voudrais vraiment savoir, mais j'ai\ntrop peur d'aller dehors!$
```
### SootopolisCity_Mart_Text_FullRestoreItemOfDreams
```
Tu connais GUERISON?\pRestitution de tous les PV!\nPlus de problème de statut!\pC'est vraiment l'objet idéal!$
```
### SootopolisCity_Mart_Text_DidSomethingAwaken
```
Ce temps…\nQuelque chose s'est éveillé?$
```

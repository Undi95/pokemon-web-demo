# SootopolisCity_House2

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE2`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE2`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 3,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `SootopolisCity_House2_EventScript_ExpertF` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #5
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #5

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### SootopolisCity_House2_EventScript_ExpertF
```
lock
faceplayer
msgbox SootopolisCity_House2_Text_DidYouKnowAboutMtPyreOrbs, MSGBOX_YESNO
call_if_eq VAR_RESULT, YES, SootopolisCity_House2_EventScript_KnowAboutOrbs
call_if_eq VAR_RESULT, NO, SootopolisCity_House2_EventScript_DontKnowAboutOrbs
release
end
```
### SootopolisCity_House2_EventScript_KnowAboutOrbs
```
msgbox SootopolisCity_House2_Text_YesTwoOrbsSideBySide, MSGBOX_DEFAULT
return
```
### SootopolisCity_House2_EventScript_DontKnowAboutOrbs
```
msgbox SootopolisCity_House2_Text_OughtToVisitAndSee, MSGBOX_DEFAULT
return
```

## Textes (3)
### SootopolisCity_House2_Text_DidYouKnowAboutMtPyreOrbs
```
MONT MEMORIA…\pAu sommet reposent deux orbes\nl'un à côté de l'autre. Tu le savais?$
```
### SootopolisCity_House2_Text_YesTwoOrbsSideBySide
```
C'est ça, deux orbes côte à côte…\pLes voir ensemble…\nC'est apaisant…$
```
### SootopolisCity_House2_Text_OughtToVisitAndSee
```
Non. C'est vrai?\nTu devrais peut-être y aller pour voir…$
```

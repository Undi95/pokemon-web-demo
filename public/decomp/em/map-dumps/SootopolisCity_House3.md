# SootopolisCity_House3

## Métadonnées
- **id** : `MAP_SOOTOPOLIS_CITY_HOUSE3`
- **layout** : `LAYOUT_SOOTOPOLIS_CITY_HOUSE3`
- **music** : `MUS_SOOTOPOLIS`
- **region_map_section** : `MAPSEC_SOOTOPOLIS_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 2,4 | `MOVEMENT_TYPE_FACE_DOWN` | `SootopolisCity_House3_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 6,4 | `MOVEMENT_TYPE_WANDER_AROUND` | `SootopolisCity_House3_EventScript_Girl` | `0` |

## Warps (2)
- #0 (3,6) → `MAP_SOOTOPOLIS_CITY` warp #6
- #1 (4,6) → `MAP_SOOTOPOLIS_CITY` warp #6

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (3)
### SootopolisCity_House3_EventScript_Woman
```
lock
faceplayer
msgbox SootopolisCity_House3_Text_JuanHasManyFansDoYou, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, SootopolisCity_House3_EventScript_HaveFans
msgbox SootopolisCity_House3_Text_LonesomeTryWorkingHarder, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_House3_EventScript_HaveFans
```
msgbox SootopolisCity_House3_Text_YouMustBePrettyStrong, MSGBOX_DEFAULT
release
end
```
### SootopolisCity_House3_EventScript_Girl
```
msgbox SootopolisCity_House3_Text_TrainerFanClubWasWild, MSGBOX_NPC
end
```

## Textes (4)
### SootopolisCity_House3_Text_JuanHasManyFansDoYou
```
Tu es DRESSEUR, non?\pJUAN d'ATALANOPOLIS a de nombreux\nfans. Encore plus que son élève MARC!\pEt toi, tu en as?$
```
### SootopolisCity_House3_Text_YouMustBePrettyStrong
```
Oh, quelle puissance tu dois avoir!$
```
### SootopolisCity_House3_Text_LonesomeTryWorkingHarder
```
Oh, mon p'tit…\nTu es un peu solitaire.\pEssaie de travailler plus dur pour\navoir des fans à tes côtés.$
```
### SootopolisCity_House3_Text_TrainerFanClubWasWild
```
Les fans dévoués viennent même\nd'en dehors de HOENN.\pC'était la folie quand je suis allée au\nFAN CLUB DES DRESSEURS à NENUCRIQUE.$
```

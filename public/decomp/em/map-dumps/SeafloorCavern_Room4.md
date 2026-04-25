# SeafloorCavern_Room4

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ROOM4`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ROOM4`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 5,8 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `SeafloorCavern_Room4_EventScript_Grunt3` | `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 5,12 | `MOVEMENT_TYPE_FACE_UP` | `SeafloorCavern_Room4_EventScript_Grunt4` | `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS` |

## Warps (4)
- #0 (13,1) → `MAP_SEAFLOOR_CAVERN_ROOM2` warp #1
- #1 (4,1) → `MAP_SEAFLOOR_CAVERN_ROOM5` warp #1
- #2 (9,10) → `MAP_SEAFLOOR_CAVERN_ROOM5` warp #2
- #3 (10,15) → `MAP_SEAFLOOR_CAVERN_ENTRANCE` warp #1

## Scripts (2)
### SeafloorCavern_Room4_EventScript_Grunt3
```
trainerbattle_single TRAINER_GRUNT_SEAFLOOR_CAVERN_3, SeafloorCavern_Room4_Text_Grunt3Intro, SeafloorCavern_Room4_Text_Grunt3Defeat
msgbox SeafloorCavern_Room4_Text_Grunt3PostBattle, MSGBOX_AUTOCLOSE
end
```
### SeafloorCavern_Room4_EventScript_Grunt4
```
trainerbattle_single TRAINER_GRUNT_SEAFLOOR_CAVERN_4, SeafloorCavern_Room4_Text_Grunt4Intro, SeafloorCavern_Room4_Text_Grunt4Defeat
msgbox SeafloorCavern_Room4_Text_Grunt4PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### SeafloorCavern_Room4_Text_Grunt3Intro
```
Qui es-tu?\nComment as-tu atterri ici?$
```
### SeafloorCavern_Room4_Text_Grunt3Defeat
```
J'ai perdu…$
```
### SeafloorCavern_Room4_Text_Grunt3PostBattle
```
J'arrive pas à trouver d'issue!\pJ'ai pas peur. Comprends-moi bien!$
```
### SeafloorCavern_Room4_Text_Grunt4Intro
```
Qui es-tu?\nPour qui est-ce que tu te prends?$
```
### SeafloorCavern_Room4_Text_Grunt4Defeat
```
Tu m'as eue!$
```
### SeafloorCavern_Room4_Text_Grunt4PostBattle
```
Mon partenaire a oublié la carte dans\nle sous-marin!\pC'est le roi des incapables!$
```

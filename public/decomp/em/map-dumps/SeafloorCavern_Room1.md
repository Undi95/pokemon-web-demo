# SeafloorCavern_Room1

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ROOM1`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ROOM1`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 5,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 5,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_13` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 8,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `SeafloorCavern_Room1_EventScript_Grunt1` | `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 15,10 | `MOVEMENT_TYPE_FACE_UP_AND_RIGHT` | `SeafloorCavern_Room1_EventScript_Grunt2` | `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS` |

## Warps (3)
- #0 (5,18) → `MAP_SEAFLOOR_CAVERN_ENTRANCE` warp #1
- #1 (17,13) → `MAP_SEAFLOOR_CAVERN_ROOM5` warp #0
- #2 (6,2) → `MAP_SEAFLOOR_CAVERN_ROOM2` warp #0

## Scripts (2)
### SeafloorCavern_Room1_EventScript_Grunt1
```
trainerbattle_single TRAINER_GRUNT_SEAFLOOR_CAVERN_1, SeafloorCavern_Room1_Text_Grunt1Intro, SeafloorCavern_Room1_Text_Grunt1Defeat
msgbox SeafloorCavern_Room1_Text_Grunt1PostBattle, MSGBOX_AUTOCLOSE
end
```
### SeafloorCavern_Room1_EventScript_Grunt2
```
trainerbattle_single TRAINER_GRUNT_SEAFLOOR_CAVERN_2, SeafloorCavern_Room1_Text_Grunt2Intro, SeafloorCavern_Room1_Text_Grunt2Defeat
msgbox SeafloorCavern_Room1_Text_Grunt2PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### SeafloorCavern_Room1_Text_Grunt1Intro
```
Pas besoin d'un môme dans nos pattes!\nRentre chez toi!$
```
### SeafloorCavern_Room1_Text_Grunt1Defeat
```
Je veux rentrer chez moi…$
```
### SeafloorCavern_Room1_Text_Grunt1PostBattle
```
Je veux avoir une promotion pour\ndonner des ordres aux SBIRES…$
```
### SeafloorCavern_Room1_Text_Grunt2Intro
```
Ce sous-marin… C'est minuscule à\nl'intérieur. J'ai mal partout!$
```
### SeafloorCavern_Room1_Text_Grunt2Defeat
```
Ça m'énerve de perdre!$
```
### SeafloorCavern_Room1_Text_Grunt2PostBattle
```
Ce sous-marin qu'on a piqué…\nPlutôt brutale la balade!\pC'est trop étroit là-dedans!$
```

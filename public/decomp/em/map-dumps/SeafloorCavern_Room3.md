# SeafloorCavern_Room3

## Métadonnées
- **id** : `MAP_SEAFLOOR_CAVERN_ROOM3`
- **layout** : `LAYOUT_SEAFLOOR_CAVERN_ROOM3`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_SEAFLOOR_CAVERN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 13,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_12` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 11,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_14` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,9 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_15` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_16` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 11,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_17` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 12,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_18` |
| `` | `OBJ_EVENT_GFX_PUSHABLE_BOULDER` | 13,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_StrengthBoulder` | `FLAG_TEMP_19` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 9,5 | `MOVEMENT_TYPE_FACE_LEFT` | `SeafloorCavern_Room3_EventScript_Shelly` | `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 5,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `SeafloorCavern_Room3_EventScript_Grunt5` | `FLAG_HIDE_SEAFLOOR_CAVERN_AQUA_GRUNTS` |

## Warps (3)
- #0 (8,1) → `MAP_SEAFLOOR_CAVERN_ROOM8` warp #1
- #1 (9,13) → `MAP_SEAFLOOR_CAVERN_ROOM7` warp #1
- #2 (4,15) → `MAP_SEAFLOOR_CAVERN_ROOM6` warp #1

## Scripts (2)
### SeafloorCavern_Room3_EventScript_Shelly
```
trainerbattle_single TRAINER_SHELLY_SEAFLOOR_CAVERN, SeafloorCavern_Room3_Text_ShellyIntro, SeafloorCavern_Room3_Text_ShellyDefeat
msgbox SeafloorCavern_Room3_Text_ShellyPostBattle, MSGBOX_AUTOCLOSE
end
```
### SeafloorCavern_Room3_EventScript_Grunt5
```
trainerbattle_single TRAINER_GRUNT_SEAFLOOR_CAVERN_5, SeafloorCavern_Room3_Text_Grunt5Intro, SeafloorCavern_Room3_Text_Grunt5Defeat
msgbox SeafloorCavern_Room3_Text_Grunt5PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (6)
### SeafloorCavern_Room3_Text_ShellyIntro
```
Ahahahaha!\pComment t'as fait pour venir jusqu'ici\nsans sous-marin?\lQuel môme impressionnant!\pMais… C'est pas pour autant qu'on va\nte laisser te mêler de nos affaires.\pEt j'voudrais avoir ma revanche pour\nce qui s'est passé au CENTRE METEO…\pJe vais te faire goûter à la douleur!\nTu ferais mieux de renoncer!$
```
### SeafloorCavern_Room3_Text_ShellyDefeat
```
Ahahahaha!\pOuille!$
```
### SeafloorCavern_Room3_Text_ShellyPostBattle
```
Ahahahaha!\nQuelle puissance tu as!\pC'est vraiment dommage que tu ne\nsois pas membre de la TEAM AQUA.\pTu aurais pu prendre du plaisir dans le\nfabuleux monde que notre CHEF nous\la promis…$
```
### SeafloorCavern_Room3_Text_Grunt5Intro
```
Pour réaliser notre rêve, nous avons\nbesoin de la puissance des POKéMON.\pMais il y a toujours des enquiquineurs\ncomme toi qui utilisent leurs POKéMON\lpour contrecarrer nos plans!\pRien ne se passe jamais comme prévu!$
```
### SeafloorCavern_Room3_Text_Grunt5Defeat
```
Graaah!$
```
### SeafloorCavern_Room3_Text_Grunt5PostBattle
```
Tu sais, nous ne remettons pas en\nquestion les motifs de notre CHEF.\pMais tu es là, à vouloir stopper\nnos plans.\pPeut-être que…\nTu dois avoir tes raisons…$
```

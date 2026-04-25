# FallarborTown

## Métadonnées
- **id** : `MAP_FALLARBOR_TOWN`
- **layout** : `LAYOUT_FALLARBOR_TOWN`
- **music** : `MUS_FALLARBOR`
- **region_map_section** : `MAPSEC_FALLARBOR_TOWN`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_TOWN`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_ROUTE114`
- right (offset 0) → `MAP_ROUTE113`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GIRL_1` | 8,11 | `MOVEMENT_TYPE_FACE_DOWN` | `FallarborTown_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 11,9 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `FallarborTown_EventScript_ExpertM` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 11,15 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `FallarborTown_EventScript_Gentleman` | `0` |
| `` | `OBJ_EVENT_GFX_AZURILL` | 8,12 | `MOVEMENT_TYPE_LOOK_AROUND` | `FallarborTown_EventScript_Azurill` | `FLAG_HIDE_FALLARBOR_AZURILL` |

## Warps (5)
- #0 (15,15) → `MAP_FALLARBOR_TOWN_MART` warp #0
- #1 (8,7) → `MAP_FALLARBOR_TOWN_BATTLE_TENT_LOBBY` warp #0
- #2 (14,7) → `MAP_FALLARBOR_TOWN_POKEMON_CENTER_1F` warp #0
- #3 (6,17) → `MAP_FALLARBOR_TOWN_COZMOS_HOUSE` warp #0
- #4 (1,6) → `MAP_FALLARBOR_TOWN_MOVE_RELEARNERS_HOUSE` warp #0

## BG events / signs (8)
- (16,15) [sign] → `Common_EventScript_ShowPokemartSign`
- (15,7) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (6,8) [sign] → `FallarborTown_EventScript_BattleTentSign`
- (16,7) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (10,11) [sign] → `FallarborTown_EventScript_TownSign`
- (17,15) [sign] → `Common_EventScript_ShowPokemartSign`
- (3,7) [sign] → `FallarborTown_EventScript_MoveTutorSign`
- (2,15) [hidden_item] → ``

## Flags référencés (3)
- `FLAG_CONTEST_SKETCH_CREATED`
- `FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY`
- `FLAG_VISITED_FALLARBOR_TOWN`

## Variables référencées (1)
- `VAR_CONTEST_HALL_STATE`

## Scripts (10)
### FallarborTown_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, FallarborTown_OnTransition
```
### FallarborTown_OnTransition
```
setflag FLAG_VISITED_FALLARBOR_TOWN
setvar VAR_CONTEST_HALL_STATE, 0
clearflag FLAG_CONTEST_SKETCH_CREATED
end
```
### FallarborTown_EventScript_ExpertM
```
lock
faceplayer
goto_if_set FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY, FallarborTown_EventScript_ExpertMNormal
msgbox FallarborTown_Text_ShadyCharactersCozmosHome, MSGBOX_DEFAULT
release
end
```
### FallarborTown_EventScript_ExpertMNormal
```
msgbox FallarborTown_Text_RegionKnownForMeteors, MSGBOX_DEFAULT
release
end
```
### FallarborTown_EventScript_Girl
```
msgbox FallarborTown_Text_MyPreciousAzurill, MSGBOX_NPC
end
```
### FallarborTown_EventScript_Gentleman
```
msgbox FallarborTown_Text_HaveYouChallengedFlannery, MSGBOX_NPC
end
```
### FallarborTown_EventScript_Azurill
```
lock
faceplayer
waitse
playmoncry SPECIES_AZURILL, CRY_MODE_NORMAL
msgbox FallarborTown_Text_Azurill, MSGBOX_DEFAULT
waitmoncry
release
end
```
### FallarborTown_EventScript_BattleTentSign
```
msgbox FallarborTown_Text_BattleTentSign, MSGBOX_SIGN
end
```
### FallarborTown_EventScript_TownSign
```
msgbox FallarborTown_Text_TownSign, MSGBOX_SIGN
end
```
### FallarborTown_EventScript_MoveTutorSign
```
msgbox FallarborTown_Text_MoveTutorSign, MSGBOX_SIGN
end
```

## Textes (8)
### FallarborTown_Text_ShadyCharactersCozmosHome
```
Il se passe quelque chose d'étrange,\nje n'aime pas trop ça!\pJ'ai aperçu quelqu'un entrer et sortir\ndu LABO du PROF. KOSMO.$
```
### FallarborTown_Text_RegionKnownForMeteors
```
Cela fait très longtemps que cette\nrégion est connue pour ses météorites.\pUn météorite se serait jadis écrasé,\ncreusant le SITE METEORE.$
```
### FallarborTown_Text_MyPreciousAzurill
```
Tu vois! Regarde!\nC'est mon cher AZURILL!\pIl est adroit, et en plus il est doux!$
```
### FallarborTown_Text_Azurill
```
AZURILL: Azuzuuu.$
```
### FallarborTown_Text_HaveYouChallengedFlannery
```
As-tu déjà affronté ADRIANE, le\nCHAMPION de l'ARENE de VERMILAVA?\pSon grand-père était célèbre.\nIl a fait partie du CONSEIL 4\lde la LIGUE POKéMON.\pÇa ne me surprendrait pas de voir\nADRIANE devenir un grand DRESSEUR\là son tour.$
```
### FallarborTown_Text_BattleTentSign
```
TENTE DE COMBAT d'AUTEQUIA\n“Que les meilleures équipes\lse rencontrent!”$
```
### FallarborTown_Text_TownSign
```
AUTEQUIA\n“Une communauté agricole et ses\lpetits jardins.”$
```
### FallarborTown_Text_MoveTutorSign
```
MAISON DU MAITRE DES CAPACITES\n“Venez apprendre de nouvelles\lcapacités à vos POKéMON!”$
```

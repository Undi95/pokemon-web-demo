# PacifidlogTown

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN`
- **layout** : `LAYOUT_PACIFIDLOG_TOWN`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_TOWN`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_ROUTE132`
- right (offset 0) → `MAP_ROUTE131`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GIRL_1` | 10,23 | `MOVEMENT_TYPE_FACE_LEFT` | `PacifidlogTown_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 11,14 | `MOVEMENT_TYPE_FACE_RIGHT` | `PacifidlogTown_EventScript_Fisherman` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 9,16 | `MOVEMENT_TYPE_FACE_DOWN` | `PacifidlogTown_EventScript_NinjaBoy` | `0` |

## Warps (6)
- #0 (8,15) → `MAP_PACIFIDLOG_TOWN_POKEMON_CENTER_1F` warp #0
- #1 (16,13) → `MAP_PACIFIDLOG_TOWN_HOUSE1` warp #0
- #2 (3,22) → `MAP_PACIFIDLOG_TOWN_HOUSE2` warp #0
- #3 (12,24) → `MAP_PACIFIDLOG_TOWN_HOUSE3` warp #0
- #4 (2,12) → `MAP_PACIFIDLOG_TOWN_HOUSE4` warp #0
- #5 (17,21) → `MAP_PACIFIDLOG_TOWN_HOUSE5` warp #0

## BG events / signs (3)
- (9,15) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (7,16) [sign] → `PacifidlogTown_EventScript_TownSign`
- (10,15) [sign] → `Common_EventScript_ShowPokemonCenterSign`

## Flags référencés (1)
- `FLAG_VISITED_PACIFIDLOG_TOWN`

## Scripts (7)
### PacifidlogTown_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, PacifidlogTown_OnTransition
map_script MAP_SCRIPT_ON_RESUME, PacifidlogTown_OnResume
```
### PacifidlogTown_OnTransition
```
setflag FLAG_VISITED_PACIFIDLOG_TOWN
end
```
### PacifidlogTown_OnResume
```
setstepcallback STEP_CB_PACIFIDLOG_BRIDGE
end
```
### PacifidlogTown_EventScript_NinjaBoy
```
msgbox PacifidlogTown_Text_NeatHousesOnWater, MSGBOX_NPC
end
```
### PacifidlogTown_EventScript_Girl
```
msgbox PacifidlogTown_Text_FastRunningCurrent, MSGBOX_NPC
end
```
### PacifidlogTown_EventScript_Fisherman
```
msgbox PacifidlogTown_Text_SkyPillarTooScary, MSGBOX_NPC
end
```
### PacifidlogTown_EventScript_TownSign
```
msgbox PacifidlogTown_Text_TownSign, MSGBOX_SIGN
end
```

## Textes (4)
### PacifidlogTown_Text_FastRunningCurrent
```
Le courant de la mer entre PACIFIVILLE\net POIVRESSEL est très fort.\pSi tu décidais de faire du SURF,\ntu pourrais te faire emporter et\lte retrouver très loin d'ici.$
```
### PacifidlogTown_Text_NeatHousesOnWater
```
Regarde comme c'est chouette!\nCes maisons sont construites sur l'eau.\pJe suis né ici!$
```
### PacifidlogTown_Text_SkyPillarTooScary
```
LE PILIER CELESTE?\pOh, tu veux sûrement parler de cette\ntrès très grande tour un peu plus loin.\pSi tu veux mon avis, il faut être fou\npour vouloir monter si haut!\pVivre au niveau de la mer, ici à\nPACIFIVILLE, voilà ce qui me va!$
```
### PacifidlogTown_Text_TownSign
```
PACIFIVILLE\p“Là où le soleil du matin se reflète\nsur les eaux.”$
```

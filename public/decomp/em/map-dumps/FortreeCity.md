# FortreeCity

## Métadonnées
- **id** : `MAP_FORTREE_CITY`
- **layout** : `LAYOUT_FORTREE_CITY`
- **music** : `MUS_FORTREE`
- **region_map_section** : `MAPSEC_FORTREE_CITY`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_CITY`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- left (offset 0) → `MAP_ROUTE119`
- right (offset 0) → `MAP_ROUTE120`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_2` | 31,3 | `MOVEMENT_TYPE_LOOK_AROUND` | `FortreeCity_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_1` | 32,16 | `MOVEMENT_TYPE_WANDER_AROUND` | `FortreeCity_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_5` | 32,10 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `FortreeCity_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_1` | 11,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `FortreeCity_EventScript_Boy` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 8,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `FortreeCity_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 9,16 | `MOVEMENT_TYPE_FACE_DOWN` | `FortreeCity_EventScript_GameboyKid` | `0` |
| `` | `OBJ_EVENT_GFX_KECLEON` | 25,8 | `MOVEMENT_TYPE_INVISIBLE` | `FortreeCity_EventScript_Kecleon` | `FLAG_HIDE_FORTREE_CITY_KECLEON` |

## Warps (9)
- #0 (5,6) → `MAP_FORTREE_CITY_POKEMON_CENTER_1F` warp #0
- #1 (10,3) → `MAP_FORTREE_CITY_HOUSE1` warp #0
- #2 (22,11) → `MAP_FORTREE_CITY_GYM` warp #0
- #3 (4,14) → `MAP_FORTREE_CITY_MART` warp #0
- #4 (17,3) → `MAP_FORTREE_CITY_HOUSE2` warp #0
- #5 (25,3) → `MAP_FORTREE_CITY_HOUSE3` warp #0
- #6 (32,2) → `MAP_FORTREE_CITY_HOUSE4` warp #0
- #7 (12,13) → `MAP_FORTREE_CITY_HOUSE5` warp #0
- #8 (37,13) → `MAP_FORTREE_CITY_DECORATION_SHOP` warp #0

## BG events / signs (6)
- (6,9) [sign] → `FortreeCity_EventScript_CitySign`
- (7,6) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (5,14) [sign] → `Common_EventScript_ShowPokemartSign`
- (26,10) [sign] → `FortreeCity_EventScript_GymSign`
- (6,6) [sign] → `Common_EventScript_ShowPokemonCenterSign`
- (6,14) [sign] → `Common_EventScript_ShowPokemartSign`

## Flags référencés (2)
- `FLAG_KECLEON_FLED_FORTREE`
- `FLAG_VISITED_FORTREE_CITY`

## Variables référencées (2)
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Scripts (16)
### FortreeCity_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, FortreeCity_OnTransition
map_script MAP_SCRIPT_ON_RESUME, FortreeCity_OnResume
```
### FortreeCity_OnTransition
```
setflag FLAG_VISITED_FORTREE_CITY
end
```
### FortreeCity_OnResume
```
setstepcallback STEP_CB_FORTREE_BRIDGE
end
```
### FortreeCity_EventScript_Man
```
msgbox FortreeCity_Text_SawGiganticPokemonInSky, MSGBOX_NPC
end
```
### FortreeCity_EventScript_Woman
```
lock
faceplayer
goto_if_set FLAG_KECLEON_FLED_FORTREE, FortreeCity_EventScript_WomanGymAccessible
msgbox FortreeCity_Text_SomethingBlockingGym, MSGBOX_DEFAULT
release
end
```
### FortreeCity_EventScript_WomanGymAccessible
```
msgbox FortreeCity_Text_ThisTimeIllBeatWinona, MSGBOX_DEFAULT
release
end
```
### FortreeCity_EventScript_Girl
```
msgbox FortreeCity_Text_TreesGrowByDrinkingRainwater, MSGBOX_NPC
end
```
### FortreeCity_EventScript_OldMan
```
msgbox FortreeCity_Text_EveryoneHealthyAndLively, MSGBOX_NPC
end
```
### FortreeCity_EventScript_Boy
```
msgbox FortreeCity_Text_BugPokemonComeThroughWindow, MSGBOX_NPC
end
```
### FortreeCity_EventScript_GameboyKid
```
msgbox FortreeCity_Text_PokemonThatEvolveWhenTraded, MSGBOX_NPC
end
```
### FortreeCity_EventScript_CitySign
```
msgbox FortreeCity_Text_CitySign, MSGBOX_SIGN
end
```
### FortreeCity_EventScript_GymSign
```
msgbox FortreeCity_Text_GymSign, MSGBOX_SIGN
end
```
### FortreeCity_EventScript_Kecleon
```
lock
faceplayer
checkitem ITEM_DEVON_SCOPE
goto_if_eq VAR_RESULT, TRUE, FortreeCity_EventScript_AskUseDevonScope
msgbox FortreeCity_Text_SomethingUnseeable, MSGBOX_DEFAULT
release
end
```
### FortreeCity_EventScript_AskUseDevonScope
```
msgbox FortreeCity_Text_UnseeableUseDevonScope, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, FortreeCity_EventScript_UseDevonScope
release
end
```
### FortreeCity_EventScript_UseDevonScope
```
msgbox FortreeCity_Text_UsedDevonScopePokemonFled, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Movement_KecleonAppears
waitmovement 0
waitse
playmoncry SPECIES_KECLEON, CRY_MODE_ENCOUNTER
delay 40
waitmoncry
applymovement VAR_LAST_TALKED, FortreeCity_Movement_KecleonFlee
waitmovement 0
removeobject VAR_LAST_TALKED
setflag FLAG_KECLEON_FLED_FORTREE
release
end
```
### FortreeCity_Movement_KecleonFlee
```
walk_right
step_end
```

## Textes (12)
### FortreeCity_Text_SawGiganticPokemonInSky
```
Personne ne me croit, mais j'ai\nvraiment vu ce POKéMON gigantesque\ldans le ciel.\pJ'ai eu l'impression qu'il volait vers\nle CHENAL 131.\pSnifff…\nHum… Tu… euh… sens le brûlé.\pTu étais sur un volcan ou quelque chose\ncomme ça?$
```
### FortreeCity_Text_SomethingBlockingGym
```
Je veux aller à l'ARENE POKéMON, mais\nquelque chose bloque le passage.\pAprès tout le mal que je me suis donné\npour venir m'entraîner sur la ROUTE 120!$
```
### FortreeCity_Text_ThisTimeIllBeatWinona
```
J'ai des POKéMON qui font ma joie et ma\nfierté. Cette fois, je battrai ALIZEE.$
```
### FortreeCity_Text_TreesGrowByDrinkingRainwater
```
Le sol absorbe l'eau de pluie et les\narbres poussent en puisant cette eau…\pNotre CIMETRONELLE existe grâce\nà l'eau et à la terre.$
```
### FortreeCity_Text_EveryoneHealthyAndLively
```
C'est une VILLE formée de maisons\nconstruites dans les arbres.\pIci, on est tous en forme et dynamiques.\nProbablement grâce à ce mode de vie!\pMême moi, j'ai l'impression d'avoir\nrajeuni de trente ans.$
```
### FortreeCity_Text_BugPokemonComeThroughWindow
```
C'est bien de vivre en haut des arbres.\pMais parfois, des POKéMON du type\nINSECTE passent par les fenêtres.\pÇa peut faire très peur.$
```
### FortreeCity_Text_PokemonThatEvolveWhenTraded
```
Certains POKéMON évoluent quand ils\nsont échangés! C'est ce qu'on raconte!$
```
### FortreeCity_Text_SomethingUnseeable
```
Quelque chose d'invisible bloque la\nvoie.$
```
### FortreeCity_Text_UnseeableUseDevonScope
```
Quelque chose d'invisible bloque la\nvoie.\pVoulez-vous utiliser le DEVON SCOPE?$
```
### FortreeCity_Text_UsedDevonScopePokemonFled
```
{PLAYER} utilise le DEVON SCOPE.\pUn POKéMON invisible devient tout à\ncoup visible!\pLe POKéMON, effrayé, s'enfuit!$
```
### FortreeCity_Text_CitySign
```
CIMETRONELLE\n“Là où les cimes des arbres sont\len harmonie avec la nature.”$
```
### FortreeCity_Text_GymSign
```
ARENE POKéMON de CIMETRONELLE\nCHAMPION: ALIZEE\p“Celle qui utilise les oiseaux et prend\nson envol dans le monde.”$
```

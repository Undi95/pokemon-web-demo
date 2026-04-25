# Route110_TrickHousePuzzle6

## Métadonnées
- **id** : `MAP_ROUTE110_TRICK_HOUSE_PUZZLE6`
- **layout** : `LAYOUT_ROUTE110_TRICK_HOUSE_PUZZLE6`
- **music** : `MUS_TRICK_HOUSE`
- **region_map_section** : `MAPSEC_ROUTE_110`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_PICNICKER` | 7,9 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHousePuzzle6_EventScript_Sophia` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 11,10 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route110_TrickHousePuzzle6_EventScript_Benny` | `0` |
| `` | `OBJ_EVENT_GFX_CAMPER` | 4,5 | `MOVEMENT_TYPE_FACE_UP` | `Route110_TrickHousePuzzle6_EventScript_Sebastian` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 11,21 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route110_TrickHousePuzzle6_EventScript_ItemGlitterMail` | `FLAG_ITEM_TRICK_HOUSE_PUZZLE_6_GLITTER_MAIL` |

## Warps (3)
- #0 (0,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #1 (1,21) → `MAP_ROUTE110_TRICK_HOUSE_ENTRANCE` warp #2
- #2 (13,1) → `MAP_ROUTE110_TRICK_HOUSE_END` warp #0

## BG events / signs (1)
- (0,10) [sign] → `Route110_TrickHousePuzzle6_EventScript_Scroll`

## Variables référencées (2)
- `VAR_TEMP_0`
- `VAR_TRICK_HOUSE_PUZZLE_6_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route110_TrickHousePuzzle_EventScript_FoundScroll`
- `Route110_TrickHousePuzzle_EventScript_ReadScrollAgain`

## Scripts (9)
### Route110_TrickHousePuzzle6_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route110_TrickHousePuzzle6_OnTransition
map_script MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE, Route110_TrickHousePuzzle6_OnWarp
```
### Route110_TrickHousePuzzle6_OnTransition
```
special RotatingGate_InitPuzzle
end
```
### Route110_TrickHousePuzzle6_OnWarp
```
map_script_2 VAR_TEMP_0, VAR_TEMP_0, Route110_TrickHousePuzzle6_EventScript_InitPuzzle
```
### Route110_TrickHousePuzzle6_EventScript_InitPuzzle
```
special RotatingGate_InitPuzzleAndGraphics
end
```
### Route110_TrickHousePuzzle6_EventScript_Scroll
```
lockall
goto_if_eq VAR_TRICK_HOUSE_PUZZLE_6_STATE, 0, Route110_TrickHousePuzzle6_EventScript_FoundScroll
goto Route110_TrickHousePuzzle_EventScript_ReadScrollAgain
end
```
### Route110_TrickHousePuzzle6_EventScript_FoundScroll
```
setvar VAR_TRICK_HOUSE_PUZZLE_6_STATE, 1
goto Route110_TrickHousePuzzle_EventScript_FoundScroll
end
```
### Route110_TrickHousePuzzle6_EventScript_Sophia
```
trainerbattle_single TRAINER_SOPHIA, Route110_TrickHousePuzzle6_Text_SophiaIntro, Route110_TrickHousePuzzle6_Text_SophiaDefeat
msgbox Route110_TrickHousePuzzle6_Text_SophiaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle6_EventScript_Benny
```
trainerbattle_single TRAINER_BENNY, Route110_TrickHousePuzzle6_Text_BennyIntro, Route110_TrickHousePuzzle6_Text_BennyDefeat
msgbox Route110_TrickHousePuzzle6_Text_BennyPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route110_TrickHousePuzzle6_EventScript_Sebastian
```
trainerbattle_single TRAINER_SEBASTIAN, Route110_TrickHousePuzzle6_Text_SebastianIntro, Route110_TrickHousePuzzle6_Text_SebastianDefeat
msgbox Route110_TrickHousePuzzle6_Text_SebastianPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (10)
### Route110_TrickHousePuzzle6_Text_WroteSecretCodeLockOpened
```
{PLAYER} écrit le code secret\nsur la porte.\p“Le MAITRE DES PIEGES est\ntout pour moi.”\l… … … … … … … …\pLa porte s'ouvre!$
```
### Route110_TrickHousePuzzle6_Text_SophiaIntro
```
Quand on m'a parlé d'une maison bizarre,\nje me suis sentie obligée d'y aller.$
```
### Route110_TrickHousePuzzle6_Text_SophiaDefeat
```
J'ai découvert un DRESSEUR balèze!$
```
### Route110_TrickHousePuzzle6_Text_SophiaPostBattle
```
Je suis sûre de m'amuser quand\nje viens ici.\pJe ne me lasse pas de ce défi.\nC'est toujours aussi bien!$
```
### Route110_TrickHousePuzzle6_Text_BennyIntro
```
Je pourrais demander à mes POKéMON\nOISEAU de voler au-dessus du mur…$
```
### Route110_TrickHousePuzzle6_Text_BennyDefeat
```
Gniiiii! J'ai tout raté!$
```
### Route110_TrickHousePuzzle6_Text_BennyPostBattle
```
Hé, hé, hé… Je suppose que j'ai perdu\nparce que j'ai essayé de tricher.$
```
### Route110_TrickHousePuzzle6_Text_SebastianIntro
```
Toutes ces portes pivotantes me\ndonnent le tournis…$
```
### Route110_TrickHousePuzzle6_Text_SebastianDefeat
```
Tout tourne autour de moi! Je ne vais\npas le supporter plus longtemps…$
```
### Route110_TrickHousePuzzle6_Text_SebastianPostBattle
```
Ça n'a pas l'air de te déranger.\nOu bien est-ce juste du bluff?$
```

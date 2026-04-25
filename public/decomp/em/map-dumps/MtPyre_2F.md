# MtPyre_2F

## Métadonnées
- **id** : `MAP_MT_PYRE_2F`
- **layout** : `LAYOUT_MT_PYRE_2F`
- **music** : `MUS_MT_PYRE`
- **region_map_section** : `MAPSEC_MT_PYRE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MANIAC` | 3,6 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtPyre_2F_EventScript_Mark` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 0,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_2F_EventScript_ItemUltraBall` | `FLAG_ITEM_MT_PYRE_2F_ULTRA_BALL` |
| `` | `OBJ_EVENT_GFX_WOMAN_1` | 9,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `MtPyre_2F_EventScript_Woman` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 12,10 | `MOVEMENT_TYPE_FACE_DOWN` | `MtPyre_2F_EventScript_PokefanM` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 2,9 | `MOVEMENT_TYPE_FACE_DOWN` | `MtPyre_2F_EventScript_Dez` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 3,9 | `MOVEMENT_TYPE_FACE_DOWN` | `MtPyre_2F_EventScript_Luke` | `0` |
| `` | `OBJ_EVENT_GFX_BLACK_BELT` | 6,9 | `MOVEMENT_TYPE_FACE_UP` | `MtPyre_2F_EventScript_Zander` | `0` |
| `` | `OBJ_EVENT_GFX_HEX_MANIAC` | 6,6 | `MOVEMENT_TYPE_FACE_DOWN_AND_LEFT` | `MtPyre_2F_EventScript_Leah` | `0` |

## Warps (5)
- #0 (2,1) → `MAP_MT_PYRE_1F` warp #4
- #1 (10,1) → `MAP_MT_PYRE_3F` warp #0
- #2 (10,12) → `MAP_MT_PYRE_3F` warp #4
- #3 (6,12) → `MAP_MT_PYRE_3F` warp #5
- #4 (11,9) → `MAP_MT_PYRE_1F` warp #5

## Scripts (9)
### MtPyre_2F_MapScripts
```
map_script MAP_SCRIPT_ON_FRAME_TABLE, CaveHole_CheckFallDownHole
map_script MAP_SCRIPT_ON_TRANSITION, CaveHole_FixCrackedGround
map_script MAP_SCRIPT_ON_RESUME, MtPyre_2F_SetHoleWarp
```
### MtPyre_2F_SetHoleWarp
```
setstepcallback STEP_CB_CRACKED_FLOOR
setholewarp MAP_MT_PYRE_1F
end
```
### MtPyre_2F_EventScript_Woman
```
msgbox MtPyre_2F_Text_MemoriesOfSkitty, MSGBOX_NPC
end
```
### MtPyre_2F_EventScript_PokefanM
```
msgbox MtPyre_2F_Text_TumbledFromFloorAbove, MSGBOX_NPC
end
```
### MtPyre_2F_EventScript_Mark
```
trainerbattle_single TRAINER_MARK, MtPyre_2F_Text_MarkIntro, MtPyre_2F_Text_MarkDefeat
msgbox MtPyre_2F_Text_MarkPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtPyre_2F_EventScript_Luke
```
trainerbattle_double TRAINER_DEZ_AND_LUKE, MtPyre_2F_Text_LukeIntro, MtPyre_2F_Text_LukeDefeat, MtPyre_2F_Text_LukeNotEnoughMons
msgbox MtPyre_2F_Text_LukePostBattle, MSGBOX_AUTOCLOSE
end
```
### MtPyre_2F_EventScript_Dez
```
trainerbattle_double TRAINER_DEZ_AND_LUKE, MtPyre_2F_Text_DezIntro, MtPyre_2F_Text_DezDefeat, MtPyre_2F_Text_DezNotEnoughMons
msgbox MtPyre_2F_Text_DezPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtPyre_2F_EventScript_Leah
```
trainerbattle_single TRAINER_LEAH, MtPyre_2F_Text_LeahIntro, MtPyre_2F_Text_LeahDefeat
msgbox MtPyre_2F_Text_LeahPostBattle, MSGBOX_AUTOCLOSE
end
```
### MtPyre_2F_EventScript_Zander
```
trainerbattle_single TRAINER_ZANDER, MtPyre_2F_Text_ZanderIntro, MtPyre_2F_Text_ZanderDefeat
msgbox MtPyre_2F_Text_ZanderPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (19)
### MtPyre_2F_Text_MemoriesOfSkitty
```
Souvenirs de mon cher SKITTY…\nA sa pensée, les larmes me viennent.$
```
### MtPyre_2F_Text_TumbledFromFloorAbove
```
Ouille, ouille… Des trous parsèment le\nsol ici et là.\pJ'avais pas fait attention et je suis\ntombé de l'étage du dessus.$
```
### MtPyre_2F_Text_MarkIntro
```
Hé! Tu cherches des POKéMON?\nAlors tu m'as trouvé! Quelle audace!$
```
### MtPyre_2F_Text_MarkDefeat
```
Aïïïïe!\nDésolé, excuse-moi, je t'en prie!$
```
### MtPyre_2F_Text_MarkPostBattle
```
Les gens venant rarement ici, je me\ndisais qu'il y aurait des POKéMON rares.$
```
### MtPyre_2F_Text_LukeIntro
```
KARL: C'est un défi.\pHé, si je lui prouve que je suis génial,\nelle tombera amoureuse de moi. Je l'sais!\pJe sais! Je vais te mettre la pâtée pour\nlui montrer que je suis génial!$
```
### MtPyre_2F_Text_LukeDefeat
```
KARL: Oh là là!$
```
### MtPyre_2F_Text_LukePostBattle
```
KARL: On a perdu, mais c'est\npas grave!\pJe reste avec toi, on va y arriver!$
```
### MtPyre_2F_Text_LukeNotEnoughMons
```
KARL: Si tu veux m'affronter,\napporte plus de POKéMON.\pSinon, je ne pourrai pas montrer à ma\ncopine à quel point je suis génial!$
```
### MtPyre_2F_Text_DezIntro
```
ANNIE: Si je suis là, c'est parce qu'on\na fait un pari avec mon petit ami.\pC'est effrayant, mais comme je suis\navec mon petit ami, ça va.\pJe sais! Mon petit ami va être craquant\nquand il va te battre!$
```
### MtPyre_2F_Text_DezDefeat
```
ANNIE: Aaaaah! J'ai peur!$
```
### MtPyre_2F_Text_DezPostBattle
```
ANNIE: On s'aime tendrement, alors on\ns'en fiche de perdre!$
```
### MtPyre_2F_Text_DezNotEnoughMons
```
ANNIE: Pour nous affronter, il faut\nque tu aies au moins deux POKéMON.\pMon petit ami est fort.\nUn seul POKéMON, ça ne suffira pas!$
```
### MtPyre_2F_Text_LeahIntro
```
Je pressens un malheur…\nPars avant qu'il ne soit trop tard!$
```
### MtPyre_2F_Text_LeahDefeat
```
Humm…\nPlutôt coriace!$
```
### MtPyre_2F_Text_LeahPostBattle
```
Dans ma famille, nous sommes DRESSEURS\ndepuis des générations…\pIl est de mon devoir de protéger cette\nmontagne…$
```
### MtPyre_2F_Text_ZanderIntro
```
Aaaaah!\nJe suis terrifié!$
```
### MtPyre_2F_Text_ZanderDefeat
```
Nooon!\nJ'ai perdu toute confiance en moi!$
```
### MtPyre_2F_Text_ZanderPostBattle
```
J'ai peur dès que je vois quelque chose\nbouger…\pJe n'aurais pas dû venir m'entraîner\nici…$
```

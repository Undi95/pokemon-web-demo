# LilycoveCity_House3

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_HOUSE3`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (6 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 3,4 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_House3_EventScript_GameBoyKid4` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 7,4 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_House3_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 1,4 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_House3_EventScript_GameBoyKid2` | `0` |
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 2,5 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_House3_EventScript_GameBoyKid3` | `0` |
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_House3_EventScript_GameBoyKid1` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_1` | 7,5 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_House3_EventScript_Man` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_LILYCOVE_CITY` warp #10
- #1 (4,7) → `MAP_LILYCOVE_CITY` warp #10

## Variables référencées (3)
- `VAR_LAST_TALKED`
- `VAR_RESULT`
- `VAR_TEMP_1`

## Scripts (13)
### LilycoveCity_House3_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, LilycoveCity_House3_OnTransition
```
### LilycoveCity_House3_OnTransition
```
random 4
copyvar VAR_TEMP_1, VAR_RESULT
end
```
### LilycoveCity_House3_EventScript_PokefanF
```
lock
faceplayer
msgbox LilycoveCity_House3_Text_LearnFromMasterOfPokeblocks, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, LilycoveCity_House3_EventScript_DeclinePokeblockLearn
msgbox LilycoveCity_House3_Text_ExplainPokeblocks, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### LilycoveCity_House3_EventScript_DeclinePokeblockLearn
```
msgbox LilycoveCity_House3_Text_OhAreYouSure, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### LilycoveCity_House3_EventScript_Man
```
lock
faceplayer
msgbox LilycoveCity_House3_Text_HappyToHaveQuadruplets, MSGBOX_DEFAULT
closemessage
applymovement VAR_LAST_TALKED, Common_Movement_FaceOriginalDirection
waitmovement 0
release
end
```
### LilycoveCity_House3_EventScript_GameBoyKid1
```
lock
faceplayer
switch VAR_TEMP_1
case 0, LilycoveCity_House3_EventScript_WereDoingMultiBattle
case 1, LilycoveCity_House3_EventScript_WereMixingRecords
case 2, LilycoveCity_House3_EventScript_WereBlendingBerries
case 3, LilycoveCity_House3_EventScript_WereDoingContest
end
```
### LilycoveCity_House3_EventScript_GameBoyKid2
```
lock
faceplayer
switch VAR_TEMP_1
case 0, LilycoveCity_House3_EventScript_WereDoingMultiBattle
case 1, LilycoveCity_House3_EventScript_WereMixingRecords
case 2, LilycoveCity_House3_EventScript_WereBlendingBerries
case 3, LilycoveCity_House3_EventScript_WereDoingContest
end
```
### LilycoveCity_House3_EventScript_GameBoyKid3
```
lock
faceplayer
switch VAR_TEMP_1
case 0, LilycoveCity_House3_EventScript_WereDoingMultiBattle
case 1, LilycoveCity_House3_EventScript_WereMixingRecords
case 2, LilycoveCity_House3_EventScript_WereBlendingBerries
case 3, LilycoveCity_House3_EventScript_WereDoingContest
end
```
### LilycoveCity_House3_EventScript_GameBoyKid4
```
lock
faceplayer
switch VAR_TEMP_1
case 0, LilycoveCity_House3_EventScript_WereDoingMultiBattle
case 1, LilycoveCity_House3_EventScript_WereMixingRecords
case 2, LilycoveCity_House3_EventScript_WereBlendingBerries
case 3, LilycoveCity_House3_EventScript_WereDoingContest
end
```
### LilycoveCity_House3_EventScript_WereDoingMultiBattle
```
msgbox LilycoveCity_House3_Text_GoingToWinMultiBattles, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_House3_EventScript_WereMixingRecords
```
msgbox LilycoveCity_House3_Text_LikeMixingAtRecordCorner, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_House3_EventScript_WereBlendingBerries
```
msgbox LilycoveCity_House3_Text_MakePokeblocksWithBerryBlender, MSGBOX_DEFAULT
release
end
```
### LilycoveCity_House3_EventScript_WereDoingContest
```
msgbox LilycoveCity_House3_Text_GoingToEnterContest, MSGBOX_DEFAULT
release
end
```

## Textes (8)
### LilycoveCity_House3_Text_LearnFromMasterOfPokeblocks
```
Oh, ça alors! Tu voyages en solitaire?\nMais tu es si jeune! C'est bien pour toi!\pJe suis sûre que tu pourrais apprendre\nun truc ou deux à mes enfants!\pMoi? Je suis une spécialiste\ndes {POKEBLOCK}S.\pSi je me concentre un peu, je peux\nconcocter de fabuleux {POKEBLOCK}S.\pTu veux apprendre des choses de la\nspécialiste des {POKEBLOCK}S?$
```
### LilycoveCity_House3_Text_OhAreYouSure
```
Tu ne veux vraiment pas?\pTu ne devrais pas toujours vouloir\ntout faire toi-même, mon p'tit!$
```
### LilycoveCity_House3_Text_ExplainPokeblocks
```
Bien! Quelle âme avertie!\nC'est un peu long, alors écoute bien!\pC'est bon, je peux commencer?\pSi tu observes les {POKEBLOCK}S,\ntu verras qu'ils sont classés\lselon leur onctuosité.\pPlus le chiffre est bas, plus c'est\nonctueux et mieux c'est. N'oublie pas!\pUn bon {POKEBLOCK} est très onctueux\net a un niveau élevé.\pUn POKéMON peut manger plus de\nbons {POKEBLOCK}S que de normaux.\pEt c'est important.\pPour faire des {POKEBLOCK}S onctueux, il\nfaut utiliser plusieurs sortes de\lBAIES.\pNe sois pas avare! La variété des BAIES\ninflue sur l'onctuosité des {POKEBLOCK}S.\pEt autre chose…\pPlus il y a de personnes qui mixent les\nBAIES, plus les {POKEBLOCK}S sont onctueux.\pC'est pourquoi tu dois parler aux\nautres et faire des {POKEBLOCK}S avec eux.\pVoilà à peu près tout ce que tu dois\nsavoir pour faire de bons {POKEBLOCK}S.\pSi chacun avait des POKéMON qu'il\naime, d'onctueux {POKEBLOCK}S et une famille\laimante, le monde ne serait que bonheur.\pN'abandonne pas, mon p'tit.$
```
### LilycoveCity_House3_Text_HappyToHaveQuadruplets
```
Quand ma femme a mis au monde des\nquadruplés, ça a été un choc!\pMais maintenant, je suis heureux de les\nvoir jouer ensemble.$
```
### LilycoveCity_House3_Text_GoingToWinMultiBattles
```
On va faire des COMBATS MULTI, mais\nje sais que je vais gagner.$
```
### LilycoveCity_House3_Text_LikeMixingAtRecordCorner
```
On aime bien échanger des données\nau CENTRE DE DONNEES.\pMais qu'est-ce qu'on va échanger\nau juste?$
```
### LilycoveCity_House3_Text_MakePokeblocksWithBerryBlender
```
On va faire de super {POKEBLOCK}S\navec un MIXEUR!$
```
### LilycoveCity_House3_Text_GoingToEnterContest
```
Je veux que tu voies à quel point mon\nPOKéMON est fort. Alors on va tous\lles deux participer à un CONCOURS.$
```

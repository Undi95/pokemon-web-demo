# LilycoveCity_CoveLilyMotel_2F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_2F`
- **layout** : `LAYOUT_LILYCOVE_CITY_COVE_LILY_MOTEL_2F`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (7 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 4,6 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_CoveLilyMotel_2F_EventScript_GameDesigner` | `FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS` |
| `` | `OBJ_EVENT_GFX_SCIENTIST_1` | 1,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_CoveLilyMotel_2F_EventScript_GraphicArtist` | `FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS` |
| `` | `OBJ_EVENT_GFX_FAT_MAN` | 7,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_CoveLilyMotel_2F_EventScript_FatMan` | `FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 10,3 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_CoveLilyMotel_2F_EventScript_Programmer` | `FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS` |
| `` | `OBJ_EVENT_GFX_GAMEBOY_KID` | 7,3 | `MOVEMENT_TYPE_FACE_DOWN` | `LilycoveCity_CoveLilyMotel_2F_EventScript_GameBoyKid` | `FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 4,4 | `MOVEMENT_TYPE_FACE_LEFT` | `LilycoveCity_CoveLilyMotel_2F_EventScript_Woman` | `FLAG_HIDE_LILYCOVE_MOTEL_GAME_DESIGNERS` |
| `` | `OBJ_EVENT_GFX_SCOTT` | 1,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `LilycoveCity_CoveLilyMotel_2F_EventScript_Scott` | `FLAG_HIDE_LILYCOVE_MOTEL_SCOTT` |

## Warps (1)
- #0 (2,1) → `MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_1F` warp #2

## Flags référencés (2)
- `FLAG_MET_SCOTT_IN_LILYCOVE`
- `FLAG_TEMP_2`

## Variables référencées (2)
- `VAR_RESULT`
- `VAR_SCOTT_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_PlayGymBadgeFanfare`

## Scripts (11)
### LilycoveCity_CoveLilyMotel_2F_EventScript_GameDesigner
```
lock
faceplayer
call_if_unset FLAG_TEMP_2, LilycoveCity_CoveLilyMotel_2F_EventScript_ShowMeCompletedDex
call_if_set FLAG_TEMP_2, LilycoveCity_CoveLilyMotel_2F_EventScript_ShowDiploma
specialvar VAR_RESULT, HasAllHoennMons
goto_if_eq VAR_RESULT, TRUE, LilycoveCity_CoveLilyMotel_2F_EventScript_AllHoennMonsFanfare
release
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_ShowMeCompletedDex
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_ShowMeCompletedDex, MSGBOX_DEFAULT
return
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_AllHoennMonsFanfare
```
setflag FLAG_TEMP_2
playfanfare MUS_OBTAIN_ITEM
waitfanfare
goto LilycoveCity_CoveLilyMotel_2F_EventScript_ShowDiploma
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_ShowDiploma
```
message LilycoveCity_CoveLilyMotel_2F_Text_FilledPokedexGiveYouThis
waitmessage
call Common_EventScript_PlayGymBadgeFanfare
special Special_ShowDiploma
release
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_Programmer
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_ImTheProgrammer, MSGBOX_NPC
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_GraphicArtist
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_ImTheGraphicArtist, MSGBOX_NPC
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_FatMan
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_GirlsAreCute, MSGBOX_NPC
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_Woman
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_SeaBreezeTicklesHeart, MSGBOX_NPC
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_GameBoyKid
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_NeverLeaveWithoutGameBoy, MSGBOX_NPC
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_Scott
```
lock
faceplayer
goto_if_set FLAG_MET_SCOTT_IN_LILYCOVE, LilycoveCity_CoveLilyMotel_2F_EventScript_MetScott
msgbox LilycoveCity_CoveLilyMotel_2F_Text_SnoozingPreferBattles, MSGBOX_DEFAULT
addvar VAR_SCOTT_STATE, 1
setflag FLAG_MET_SCOTT_IN_LILYCOVE
release
end
```
### LilycoveCity_CoveLilyMotel_2F_EventScript_MetScott
```
msgbox LilycoveCity_CoveLilyMotel_2F_Text_ContestsDoTakeStrategy, MSGBOX_DEFAULT
release
end
```

## Textes (9)
### LilycoveCity_CoveLilyMotel_2F_Text_ShowMeCompletedDex
```
Je suis le CONCEPTEUR DE JEU.\pOh, est-ce que c'est vrai?\nTu travailles sur un POKéDEX?\pC'est difficile de le compléter, mais\nn'abandonne pas.\pSi tu arrives à le compléter, reviens\nme voir.$
```
### LilycoveCity_CoveLilyMotel_2F_Text_FilledPokedexGiveYouThis
```
Waouh! C'est impressionnant!\nOuais, carrément impressionnant!\pCe POKéDEX est totalement rempli!\nTu dois vraiment aimer les POKéMON!\pJe suis si impressionné!\pLaisse-moi te donner quelque chose\npour récompenser ton exploit!$
```
### LilycoveCity_CoveLilyMotel_2F_Text_ImTheProgrammer
```
Moi? C'est à moi que tu parles?\nJe suis le PROGRAMMEUR.\pJe me demande à quoi ressemblent\nles MACHINES A SOUS ici.$
```
### LilycoveCity_CoveLilyMotel_2F_Text_ImTheGraphicArtist
```
Je suis le GRAPHISTE! Les POKéMON de\nHOENN ne sont-ils pas intéressants?$
```
### LilycoveCity_CoveLilyMotel_2F_Text_GirlsAreCute
```
Les filles FLOTTEURS sont à croquer,\nnon? Pour affronter une de ces filles…\pOuhhh, ça m'rend dingue!\pEt les JUMELLES! Mignonnes, hein? Un\ncombat 2 contre 2 avec les JUMELLES…\pOuhhh, c'est terrible!$
```
### LilycoveCity_CoveLilyMotel_2F_Text_SeaBreezeTicklesHeart
```
La brise marine emballe mon cœur.\nQuel bonheur d'être ici!$
```
### LilycoveCity_CoveLilyMotel_2F_Text_NeverLeaveWithoutGameBoy
```
Tu ne peux pas savoir où et quand on\nva te défier.\pC'est pour cela que je ne sors jamais\nsans ma GAME BOY ADVANCE.$
```
### LilycoveCity_CoveLilyMotel_2F_Text_SnoozingPreferBattles
```
SCOTT: … … … … …\n… … … … … Zzz…\p… … … … … Hein?!\pOh, désolé, j'étais en train de dormir!\pJe suis venu voir ce qui se passe dans\nces CONCOURS POKéMON.\pJe dois admettre que c'est plutôt\ndivertissant, mais…\pEn tant que puriste, je préfère les\ncombats dangereux.\pMais ce n'est que mon avis. \p{PLAYER}{KUN}, j'espère que tu vas profiter\nde tout: les ARENES, les CONCOURS,\lles TENTES DE COMBAT, tout!$
```
### LilycoveCity_CoveLilyMotel_2F_Text_ContestsDoTakeStrategy
```
SCOTT: Il faut beaucoup de stratégie\npour remporter un CONCOURS.\pParler des stratégies des CONCOURS\nest, à mon avis, une façon de devenir\lun bon DRESSEUR.$
```

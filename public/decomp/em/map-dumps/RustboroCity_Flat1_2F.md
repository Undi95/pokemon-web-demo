# RustboroCity_Flat1_2F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_FLAT1_2F`
- **layout** : `LAYOUT_RUSTBORO_CITY_FLAT1_2F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 4,6 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `RustboroCity_Flat1_2F_EventScript_WaldasMom` | `0` |
| `` | `OBJ_EVENT_GFX_TWIN` | 9,5 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `0` |
| `` | `OBJ_EVENT_GFX_SKITTY_DOLL` | 9,4 | `MOVEMENT_TYPE_LOOK_AROUND` | `RustboroCity_Flat1_2F_EventScript_PokeDoll` | `0` |
| `` | `OBJ_EVENT_GFX_TREECKO_DOLL` | 10,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `RustboroCity_Flat1_2F_EventScript_PokeDoll` | `0` |
| `` | `OBJ_EVENT_GFX_TORCHIC_DOLL` | 10,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `RustboroCity_Flat1_2F_EventScript_PokeDoll` | `0` |
| `LOCALID_WALDAS_DAD` | `OBJ_EVENT_GFX_MAN_1` | 8,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `RustboroCity_Flat1_2F_EventScript_WaldasDad` | `0` |
| `` | `OBJ_EVENT_GFX_MUDKIP_DOLL` | 8,6 | `MOVEMENT_TYPE_LOOK_AROUND` | `RustboroCity_Flat1_2F_EventScript_PokeDoll` | `0` |
| `` | `OBJ_EVENT_GFX_PIKACHU_DOLL` | 9,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `RustboroCity_Flat1_2F_EventScript_PokeDoll` | `0` |

## Warps (1)
- #0 (2,1) → `MAP_RUSTBORO_CITY_FLAT1_1F` warp #2

## Variables référencées (2)
- `VAR_0x8004`
- `VAR_RESULT`

## Scripts (12)
### RustboroCity_Flat1_2F_EventScript_WaldasDad
```
lock
faceplayer
specialvar VAR_RESULT, TryBufferWaldaPhrase
goto_if_eq VAR_RESULT, FALSE, RustboroCity_Flat1_2F_EventScript_WaldasDadFirstPhrase
goto_if_eq VAR_RESULT, TRUE, RustboroCity_Flat1_2F_EventScript_WaldasDadNewPhrase
```
### RustboroCity_Flat1_2F_EventScript_GivePhrase
```
special DoWaldaNamingScreen
goto_if_eq VAR_0x8004, 1, RustboroCity_Flat1_2F_EventScript_CancelGivePhrase
goto_if_eq VAR_0x8004, 2, RustboroCity_Flat1_2F_EventScript_CancelGiveFirstPhrase
specialvar VAR_RESULT, TryGetWallpaperWithWaldaPhrase
goto_if_eq VAR_RESULT, TRUE, RustboroCity_Flat1_2F_EventScript_WaldaLikesPhrase
goto_if_eq VAR_RESULT, FALSE, RustboroCity_Flat1_2F_EventScript_WaldaDoesntLikePhrase
end
```
### RustboroCity_Flat1_2F_EventScript_WaldasDadFirstPhrase
```
msgbox RustboroCity_Flat1_2F_Text_HelloDoYouKnowFunnyPhrase, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_Flat1_2F_EventScript_DeclineGivePhrase
msgbox RustboroCity_Flat1_2F_Text_WonderfulLetsHearSuggestion, MSGBOX_DEFAULT
goto RustboroCity_Flat1_2F_EventScript_GivePhrase
```
### RustboroCity_Flat1_2F_EventScript_WaldasDadNewPhrase
```
msgbox RustboroCity_Flat1_2F_Text_BeenSayingXDoYouKnowBetterPhrase, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, RustboroCity_Flat1_2F_EventScript_DeclineGivePhrase
msgbox RustboroCity_Flat1_2F_Text_WonderfulLetsHearSuggestion, MSGBOX_DEFAULT
goto RustboroCity_Flat1_2F_EventScript_GivePhrase
```
### RustboroCity_Flat1_2F_EventScript_DeclineGivePhrase
```
msgbox RustboroCity_Flat1_2F_Text_OhIsThatRight, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Flat1_2F_EventScript_CancelGivePhrase
```
msgbox RustboroCity_Flat1_2F_Text_OhYouDontKnowAny, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Flat1_2F_EventScript_CancelGiveFirstPhrase
```
msgbox RustboroCity_Flat1_2F_Text_ThinkOfMyOwnPhrase, MSGBOX_DEFAULT
call RustboroCity_Flat1_2F_EventScript_WaldasDadFaceWalda
msgbox RustboroCity_Flat1_2F_Text_ShesNotSmilingAtAll2, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Flat1_2F_EventScript_WaldaLikesPhrase
```
msgbox RustboroCity_Flat1_2F_Text_LetsGiveItATry2, MSGBOX_DEFAULT
call RustboroCity_Flat1_2F_EventScript_WaldasDadFaceWalda
msgbox RustboroCity_Flat1_2F_Text_OhShesLaughing, MSGBOX_DEFAULT
applymovement LOCALID_WALDAS_DAD, Common_Movement_FacePlayer
waitmovement 0
msgbox RustboroCity_Flat1_2F_Text_ThankYouIllGiveYouWallpaper, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Flat1_2F_EventScript_WaldaDoesntLikePhrase
```
msgbox RustboroCity_Flat1_2F_Text_LetsGiveItATry, MSGBOX_DEFAULT
call RustboroCity_Flat1_2F_EventScript_WaldasDadFaceWalda
msgbox RustboroCity_Flat1_2F_Text_ShesNotSmilingAtAll, MSGBOX_DEFAULT
release
end
```
### RustboroCity_Flat1_2F_EventScript_WaldasDadFaceWalda
```
turnobject LOCALID_WALDAS_DAD, DIR_EAST
return
```
### RustboroCity_Flat1_2F_EventScript_WaldasMom
```
msgbox RustboroCity_Flat1_2F_Text_ComingUpWithMealsIsHard, MSGBOX_NPC
end
```
### RustboroCity_Flat1_2F_EventScript_PokeDoll
```
msgbox RustboroCity_Flat1_2F_Text_ItsAPokemonPlushDoll, MSGBOX_SIGN
end
```

## Textes (14)
### RustboroCity_Flat1_2F_Text_ComingUpWithMealsIsHard
```
Oh, c'est chaque jour si difficile…\pCe qui est difficile?\nTu me le demandes?\pTous les jours, je dois décider ce que\nje vais préparer pour le repas.\pC'est vraiment pas facile de trouver\ndes idées différentes chaque jour.$
```
### RustboroCity_Flat1_2F_Text_HelloDoYouKnowFunnyPhrase
```
Oh, bonjour!\nBienvenue chez les BOFOND.\pJ'ai une question à te poser. As-tu\ndéjà fait du baby-sitting?\pTu vois, je viens d'être papa, alors\nélever un enfant est quelque chose\lde nouveau pour moi.\pEt j'ai un problème, ma fille BERCIA\nne rit pas beaucoup.\pJe pense qu'elle rirait plus si je lui\ndisais quelque chose d'amusant.\pConnaîtrais-tu un mot ou une phrase\namusante que je pourrais lui dire?$
```
### RustboroCity_Flat1_2F_Text_BeenSayingXDoYouKnowBetterPhrase
```
Je lui ai déjà dit “{STR_VAR_1}”\npour la faire rire.\pConnaîtrais-tu une autre phrase ou un\nautre mot qui pourrait la faire rire?$
```
### RustboroCity_Flat1_2F_Text_WonderfulLetsHearSuggestion
```
Oh, formidable!\nAlors donne-moi ta suggestion.$
```
### RustboroCity_Flat1_2F_Text_OhIsThatRight
```
Oh, vraiment?\pN'hésite pas à me le dire si tu\nas une suggestion.$
```
### RustboroCity_Flat1_2F_Text_LetsGiveItATry2
```
Ah, je vois.\nEh bien, nous n'avons plus qu'à essayer.\lD'accord?$
```
### RustboroCity_Flat1_2F_Text_OhShesLaughing
```
“{STR_VAR_1}”\n“{STR_VAR_1}”\pOh oui! Elle rigole!\nOh, je suis aussi heureux qu'elle!$
```
### RustboroCity_Flat1_2F_Text_LetsGiveItATry
```
Ah, je vois.\nEh bien, nous n'avons plus qu'à essayer.\lD'accord?$
```
### RustboroCity_Flat1_2F_Text_ShesNotSmilingAtAll
```
“{STR_VAR_1}”\n“{STR_VAR_1}”\pHmmm… Ça n'a pas l'air de fonctionner.\pPeut-être que BERCIA est juste un\nbébé trop sérieux…$
```
### RustboroCity_Flat1_2F_Text_ThinkOfMyOwnPhrase
```
Tu ne connais pas de bons mots alors… \nJe vais continuer d'essayer.\pHmm…\nEt “{STR_VAR_1}”?\lVoyons si ça marche.$
```
### RustboroCity_Flat1_2F_Text_ShesNotSmilingAtAll2
```
“{STR_VAR_1}”\n“{STR_VAR_1}”\pHmmm… Ça n'a pas l'air de fonctionner.\pPeut-être que BERCIA est juste un\nbébé trop sérieux…$
```
### RustboroCity_Flat1_2F_Text_OhYouDontKnowAny
```
Tu ne connais pas de bons mots alors…\nJe vais essayer de l'amuser avec les\lmots que j'utilisais avant.\pQuoi qu'il en soit, n'hésite pas à me le\ndire si tu as une suggestion.$
```
### RustboroCity_Flat1_2F_Text_ThankYouIllGiveYouWallpaper
```
Merci!\pGrâce à toi, ma petite BERCIA m'a\nmontré son sourire!\pAu fait, je ne te l'ai pas dit mais je\nsuis chercheur chez DEVON.\pAlors que pourrais-je faire en retour\npour toi?\pJe sais, je vais ajouter de nouveaux\nfonds aux BOITES de Gestion de\lStocks de POKéMON sur ton PC. \pDans le menu des fonds, sélectionne\n“AMIS”.\pTu auras alors accès à un nouveau fond \nchaque fois que tu feras rire ma fille.$
```
### RustboroCity_Flat1_2F_Text_ItsAPokemonPlushDoll
```
C'est une POUPEE POKéMON!$
```

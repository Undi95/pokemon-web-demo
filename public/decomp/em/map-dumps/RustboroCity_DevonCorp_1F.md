# RustboroCity_DevonCorp_1F

## Métadonnées
- **id** : `MAP_RUSTBORO_CITY_DEVON_CORP_1F`
- **layout** : `LAYOUT_RUSTBORO_CITY_DEVON_CORP_1F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_RUSTBORO_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_DEVON_EMPLOYEE` | 2,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `RustboroCity_DevonCorp_1F_EventScript_Employee` | `0` |
| `LOCALID_DEVON_CORP_STAIR_GUARD` | `OBJ_EVENT_GFX_DEVON_EMPLOYEE` | 15,5 | `MOVEMENT_TYPE_WANDER_AROUND` | `RustboroCity_DevonCorp_1F_EventScript_StairGuard` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 5,3 | `MOVEMENT_TYPE_FACE_DOWN` | `RustboroCity_DevonCorp_1F_EventScript_Greeter` | `0` |

## Warps (3)
- #0 (5,8) → `MAP_RUSTBORO_CITY` warp #5
- #1 (6,8) → `MAP_RUSTBORO_CITY` warp #6
- #2 (14,1) → `MAP_RUSTBORO_CITY_DEVON_CORP_2F` warp #0

## BG events / signs (2)
- (3,2) [sign] → `RustboroCity_DevonCorp_1F_EventScript_ProductsDisplay`
- (8,2) [sign] → `RustboroCity_DevonCorp_1F_EventScript_RocksMetalDisplay`

## Flags référencés (3)
- `FLAG_DEVON_GOODS_STOLEN`
- `FLAG_RECOVERED_DEVON_GOODS`
- `FLAG_RETURNED_DEVON_GOODS`

## Scripts (14)
### RustboroCity_DevonCorp_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, RustboroCity_DevonCorp_1F_OnTransition
```
### RustboroCity_DevonCorp_1F_OnTransition
```
call_if_unset FLAG_RETURNED_DEVON_GOODS, RustboroCity_DevonCorp_1F_EventScript_BlockStairs
end
```
### RustboroCity_DevonCorp_1F_EventScript_BlockStairs
```
setobjectxyperm LOCALID_DEVON_CORP_STAIR_GUARD, 14, 2
setobjectmovementtype LOCALID_DEVON_CORP_STAIR_GUARD, MOVEMENT_TYPE_FACE_DOWN
return
```
### RustboroCity_DevonCorp_1F_EventScript_Employee
```
lock
faceplayer
goto_if_set FLAG_RETURNED_DEVON_GOODS, RustboroCity_DevonCorp_1F_EventScript_GoodsRecovered
goto_if_set FLAG_DEVON_GOODS_STOLEN, RustboroCity_DevonCorp_1F_EventScript_RobberWasntBright
msgbox RustboroCity_DevonCorp_1F_Text_ThoseShoesAreOurProduct, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_RobberWasntBright
```
msgbox RustboroCity_DevonCorp_1F_Text_RobberWasntVeryBright, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_GoodsRecovered
```
msgbox RustboroCity_DevonCorp_1F_Text_SoundsLikeStolenGoodsRecovered, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_StairGuard
```
lock
faceplayer
goto_if_set FLAG_RETURNED_DEVON_GOODS, RustboroCity_DevonCorp_1F_EventScript_AlwaysWelcome
goto_if_set FLAG_RECOVERED_DEVON_GOODS, RustboroCity_DevonCorp_1F_EventScript_GotRobbed
goto_if_set FLAG_DEVON_GOODS_STOLEN, RustboroCity_DevonCorp_1F_EventScript_GotRobbed
msgbox RustboroCity_DevonCorp_1F_Text_OnlyAuthorizedPeopleEnter, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_AlwaysWelcome
```
msgbox RustboroCity_DevonCorp_1F_Text_YoureAlwaysWelcomeHere, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_GotRobbed
```
msgbox RustboroCity_DevonCorp_1F_Text_HowCouldWeGetRobbed, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_Greeter
```
lock
faceplayer
goto_if_set FLAG_RETURNED_DEVON_GOODS, RustboroCity_DevonCorp_1F_EventScript_WelcomeToDevonCorp
goto_if_set FLAG_RECOVERED_DEVON_GOODS, RustboroCity_DevonCorp_1F_EventScript_StaffGotRobbed
goto_if_set FLAG_DEVON_GOODS_STOLEN, RustboroCity_DevonCorp_1F_EventScript_StaffGotRobbed
msgbox RustboroCity_DevonCorp_1F_Text_WelcomeToDevonCorp, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_WelcomeToDevonCorp
```
msgbox RustboroCity_DevonCorp_1F_Text_WelcomeToDevonCorp, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_StaffGotRobbed
```
msgbox RustboroCity_DevonCorp_1F_Text_StaffGotRobbed, MSGBOX_DEFAULT
release
end
```
### RustboroCity_DevonCorp_1F_EventScript_RocksMetalDisplay
```
msgbox RustboroCity_DevonCorp_1F_Text_RocksMetalDisplay, MSGBOX_SIGN
end
```
### RustboroCity_DevonCorp_1F_EventScript_ProductsDisplay
```
msgbox RustboroCity_DevonCorp_1F_Text_ProductDisplay, MSGBOX_SIGN
end
```

## Textes (10)
### RustboroCity_DevonCorp_1F_Text_WelcomeToDevonCorp
```
Bonjour et bienvenue à la DEVON SARL.\pNous produisons avec fierté des objets\net médicaments qui simplifient la vie.$
```
### RustboroCity_DevonCorp_1F_Text_StaffGotRobbed
```
Une de nos équipes de chercheurs s'est\nfait voler un important paquet.$
```
### RustboroCity_DevonCorp_1F_Text_ThoseShoesAreOurProduct
```
Hé, ces CHAUSSURES DE SPORT!\nElles sortent de nos ateliers!\pJ'aime constater que ce que nous\navons produit sert à quelqu'un.$
```
### RustboroCity_DevonCorp_1F_Text_RobberWasntVeryBright
```
Ce paquet qui a été volé…\pBien sûr, c'est important, mais ce n'est\npas utile à tout le monde.\pEt d'après mes calculs, le voleur ne\ndoit pas être très intelligent.$
```
### RustboroCity_DevonCorp_1F_Text_SoundsLikeStolenGoodsRecovered
```
Ils ont l'air d'avoir retrouvé le\nPACK DEVON qui avait été volé.$
```
### RustboroCity_DevonCorp_1F_Text_OnlyAuthorizedPeopleEnter
```
Désolé, mais seules les personnes\nautorisées peuvent entrer ici.$
```
### RustboroCity_DevonCorp_1F_Text_HowCouldWeGetRobbed
```
C'est trop bête!\nComment a-t-on pu se faire voler?$
```
### RustboroCity_DevonCorp_1F_Text_YoureAlwaysWelcomeHere
```
Bonjour! C'est toujours avec grand\nplaisir que nous vous accueillons ici!$
```
### RustboroCity_DevonCorp_1F_Text_RocksMetalDisplay
```
Des échantillons de pierres et de\nmétaux sont placés dans une vitrine.\pIl y a un panneau avec quelque chose\nd'écrit…\p“DEVON était à l'origine une\ncompagnie d'exploitation minière.\pLa compagnie a également produit de\nl'acier en exploitant la limaille se\ltrouvant dans le sable.\pDEVON s'est sans cesse développé\ndepuis ses humbles débuts.\pDEVON fabrique maintenant\nune grande variété de produits\lindustriels.”$
```
### RustboroCity_DevonCorp_1F_Text_ProductDisplay
```
La vitrine est pleine de prototypes et\nd'échantillons.\pIl y a un panneau avec une inscription…\p“En plus de ses produits industriels,\nDEVON souhaite se développer sur le\pmarché pharmaceutique pour\naméliorer notre qualité de vie.\pRécemment, DEVON a commercialisé des\noutils pour les DRESSEURS, comme les\pPOKé BALLS et les systèmes POKéNAV.”$
```

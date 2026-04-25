# Route104_PrettyPetalFlowerShop

## Métadonnées
- **id** : `MAP_ROUTE104_PRETTY_PETAL_FLOWER_SHOP`
- **layout** : `LAYOUT_ROUTE104_PRETTY_PETAL_FLOWER_SHOP`
- **music** : `MUS_PETALBURG`
- **region_map_section** : `MAPSEC_ROUTE_104`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FLOWER_SHOP_OWNER` | `OBJ_EVENT_GFX_WOMAN_2` | 0,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route104_PrettyPetalFlowerShop_EventScript_ShopOwner` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_3` | 7,3 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `Route104_PrettyPetalFlowerShop_EventScript_WailmerPailGirl` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_1` | 11,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route104_PrettyPetalFlowerShop_EventScript_RandomBerryGirl` | `0` |

## Warps (2)
- #0 (2,8) → `MAP_ROUTE104` warp #1
- #1 (3,8) → `MAP_ROUTE104` warp #1

## Flags référencés (6)
- `FLAG_BADGE03_GET`
- `FLAG_DAILY_FLOWER_SHOP_RECEIVED_BERRY`
- `FLAG_LANDMARK_FLOWER_SHOP`
- `FLAG_MET_PRETTY_PETAL_SHOP_OWNER`
- `FLAG_RECEIVED_WAILMER_PAIL`
- `FLAG_TEMP_1`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route104_PrettyPetalFlowerShop_Text_BerriesExplanation`
- `Route104_PrettyPetalFlowerShop_Text_FlowersBringHappiness`
- `Route104_PrettyPetalFlowerShop_Text_ImGrowingFlowers`
- `Route104_PrettyPetalFlowerShop_Text_IntroLearnAboutBerries`
- `Route104_PrettyPetalFlowerShop_Text_LearnAboutBerries`
- `Route104_PrettyPetalFlowerShop_Text_MachineMixesBerries`
- `Route104_PrettyPetalFlowerShop_Text_ThisIsPrettyPetalFlowerShop`
- `Route104_PrettyPetalFlowerShop_Text_WailmerPailExplanation`
- `Route104_PrettyPetalFlowerShop_Text_YouCanHaveThis`
- `gText_PleaseComeAgain`

## Scripts (13)
### Route104_PrettyPetalFlowerShop_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route104_PrettyPetalFlowerShop_OnTransition
```
### Route104_PrettyPetalFlowerShop_OnTransition
```
setflag FLAG_LANDMARK_FLOWER_SHOP
goto_if_unset FLAG_MET_PRETTY_PETAL_SHOP_OWNER, Route104_PrettyPetalFlowerShop_EventScript_MoveShopOwner
goto_if_unset FLAG_BADGE03_GET, Route104_PrettyPetalFlowerShop_EventScript_MoveShopOwner
setflag FLAG_TEMP_1
end
```
### Route104_PrettyPetalFlowerShop_EventScript_MoveShopOwner
```
setobjectxyperm LOCALID_FLOWER_SHOP_OWNER, 4, 6
end
```
### Route104_PrettyPetalFlowerShop_EventScript_ShopOwner
```
lock
faceplayer
goto_if_set FLAG_TEMP_1, Route104_PrettyPetalFlowerShop_EventScript_SellDecorations
msgbox Route104_PrettyPetalFlowerShop_Text_ThisIsPrettyPetalFlowerShop, MSGBOX_DEFAULT
goto_if_set FLAG_MET_PRETTY_PETAL_SHOP_OWNER, Route104_PrettyPetalFlowerShop_EventScript_AlreadyMet
setflag FLAG_MET_PRETTY_PETAL_SHOP_OWNER
msgbox Route104_PrettyPetalFlowerShop_Text_IntroLearnAboutBerries, MSGBOX_YESNO
call_if_eq VAR_RESULT, YES, Route104_PrettyPetalFlowerShop_EventScript_ExplainBerries
call_if_eq VAR_RESULT, NO, Route104_PrettyPetalFlowerShop_EventScript_DontExplainBerries
release
end
```
### Route104_PrettyPetalFlowerShop_EventScript_AlreadyMet
```
msgbox Route104_PrettyPetalFlowerShop_Text_LearnAboutBerries, MSGBOX_YESNO
call_if_eq VAR_RESULT, YES, Route104_PrettyPetalFlowerShop_EventScript_ExplainBerries
call_if_eq VAR_RESULT, NO, Route104_PrettyPetalFlowerShop_EventScript_DontExplainBerries
release
end
```
### Route104_PrettyPetalFlowerShop_EventScript_ExplainBerries
```
msgbox Route104_PrettyPetalFlowerShop_Text_BerriesExplanation, MSGBOX_DEFAULT
return
```
### Route104_PrettyPetalFlowerShop_EventScript_DontExplainBerries
```
msgbox Route104_PrettyPetalFlowerShop_Text_FlowersBringHappiness, MSGBOX_DEFAULT
return
```
### Route104_PrettyPetalFlowerShop_EventScript_SellDecorations
```
message gText_PlayerWhatCanIDoForYou
waitmessage
pokemartdecoration2 Route104_PrettyPetalFlowerShop_Pokemart_Plants
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### Route104_PrettyPetalFlowerShop_Pokemart_Plants
```
pokemartlistend
```
### Route104_PrettyPetalFlowerShop_EventScript_WailmerPailGirl
```
lock
faceplayer
goto_if_unset FLAG_RECEIVED_WAILMER_PAIL, Route104_PrettyPetalFlowerShop_EventScript_GiveWailmerPail
msgbox Route104_PrettyPetalFlowerShop_Text_WailmerPailExplanation, MSGBOX_DEFAULT
release
end
```
### Route104_PrettyPetalFlowerShop_EventScript_GiveWailmerPail
```
msgbox Route104_PrettyPetalFlowerShop_Text_YouCanHaveThis, MSGBOX_DEFAULT
giveitem ITEM_WAILMER_PAIL
msgbox Route104_PrettyPetalFlowerShop_Text_WailmerPailExplanation, MSGBOX_DEFAULT
setflag FLAG_RECEIVED_WAILMER_PAIL
release
end
```
### Route104_PrettyPetalFlowerShop_EventScript_RandomBerryGirl
```
lock
faceplayer
dotimebasedevents
goto_if_set FLAG_DAILY_FLOWER_SHOP_RECEIVED_BERRY, Route104_PrettyPetalFlowerShop_EventScript_AlreadyReceivedBerry
msgbox Route104_PrettyPetalFlowerShop_Text_ImGrowingFlowers, MSGBOX_DEFAULT
random 8
addvar VAR_RESULT, FIRST_BERRY_INDEX
giveitem VAR_RESULT
goto_if_eq VAR_RESULT, 0, Common_EventScript_ShowBagIsFull
setflag FLAG_DAILY_FLOWER_SHOP_RECEIVED_BERRY
msgbox Route104_PrettyPetalFlowerShop_Text_MachineMixesBerries, MSGBOX_DEFAULT
release
end
```
### Route104_PrettyPetalFlowerShop_EventScript_AlreadyReceivedBerry
```
msgbox Route104_PrettyPetalFlowerShop_Text_MachineMixesBerries, MSGBOX_DEFAULT
release
end
```

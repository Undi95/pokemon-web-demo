# MauvilleCity_House2

## Métadonnées
- **id** : `MAP_MAUVILLE_CITY_HOUSE2`
- **layout** : `LAYOUT_HOUSE1`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_MAUVILLE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_3` | 4,5 | `MOVEMENT_TYPE_FACE_LEFT` | `MauvilleCity_House2_EventScript_Woman` | `0` |

## Warps (2)
- #0 (3,8) → `MAP_MAUVILLE_CITY` warp #6
- #1 (4,8) → `MAP_MAUVILLE_CITY` warp #6

## Flags référencés (1)
- `FLAG_RECEIVED_COIN_CASE`

## Variables référencées (2)
- `VAR_LAST_TALKED`
- `VAR_RESULT`

## Scripts (5)
### MauvilleCity_House2_EventScript_Woman
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_COIN_CASE, MauvilleCity_House2_EventScript_ReceivedCoinCase
msgbox MauvilleCity_House2_Text_BuyHarborMailAtSlateport, MSGBOX_DEFAULT
checkitem ITEM_HARBOR_MAIL
goto_if_eq VAR_RESULT, TRUE, MauvilleCity_House2_EventScript_AskToTradeForHarborMail
release
end
```
### MauvilleCity_House2_EventScript_AskToTradeForHarborMail
```
playse SE_PIN
applymovement VAR_LAST_TALKED, Common_Movement_ExclamationMark
waitmovement 0
applymovement VAR_LAST_TALKED, Common_Movement_Delay48
waitmovement 0
msgbox MauvilleCity_House2_Text_TradeHarborMailForCoinCase, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, MauvilleCity_House2_EventScript_AcceptTrade
goto_if_eq VAR_RESULT, NO, MauvilleCity_House2_EventScript_DeclineTrade
end
```
### MauvilleCity_House2_EventScript_AcceptTrade
```
msgbox MauvilleCity_House2_Text_IllTradeYouCoinCase, MSGBOX_DEFAULT
removeitem ITEM_HARBOR_MAIL
giveitem ITEM_COIN_CASE
setflag FLAG_RECEIVED_COIN_CASE
goto MauvilleCity_House2_EventScript_ReceivedCoinCase
end
```
### MauvilleCity_House2_EventScript_ReceivedCoinCase
```
msgbox MauvilleCity_House2_Text_UseCoinCaseAtGameCorner, MSGBOX_DEFAULT
release
end
```
### MauvilleCity_House2_EventScript_DeclineTrade
```
msgbox MauvilleCity_House2_Text_ThatsDisappointing, MSGBOX_DEFAULT
release
end
```

## Textes (5)
### MauvilleCity_House2_Text_BuyHarborMailAtSlateport
```
Avec un VELO, ce serait facile d'aller\nfaire des courses à POIVRESSEL.\pJe pourrais acheter une LETTRE PORT à\nla BOUTIQUE POKéMON de POIVRESSEL…$
```
### MauvilleCity_House2_Text_TradeHarborMailForCoinCase
```
Oh! Tu as une LETTRE PORT?\pTu me l'échanges contre une\nBOITE JETONS?$
```
### MauvilleCity_House2_Text_IllTradeYouCoinCase
```
Oh, ça me fait tellement plaisir!\nOK, je t'échange une BOITE JETONS!$
```
### MauvilleCity_House2_Text_UseCoinCaseAtGameCorner
```
Cette BOITE JETONS peut être utilisée\nau CASINO.$
```
### MauvilleCity_House2_Text_ThatsDisappointing
```
Oh, désolée…\pMais il faut une BOITE JETONS\npour jouer au CASINO.$
```

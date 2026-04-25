# BattleFrontier_ExchangeServiceCorner

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_EXCHANGE_SERVICE_CORNER`
- **layout** : `LAYOUT_BATTLE_FRONTIER_EXCHANGE_SERVICE_CORNER`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (9 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_TEALA` | 4,4 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_ExchangeServiceCorner_EventScript_DecorClerk1` | `0` |
| `` | `OBJ_EVENT_GFX_RICH_BOY` | 0,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_ExchangeServiceCorner_EventScript_RichBoy` | `0` |
| `` | `OBJ_EVENT_GFX_POKEFAN_F` | 0,4 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_ExchangeServiceCorner_EventScript_PokefanF` | `0` |
| `` | `OBJ_EVENT_GFX_SAILOR` | 14,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_ExchangeServiceCorner_EventScript_Sailor` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_5` | 1,9 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_ExchangeServiceCorner_EventScript_Man` | `0` |
| `` | `OBJ_EVENT_GFX_TEALA` | 5,5 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_ExchangeServiceCorner_EventScript_DecorClerk2` | `0` |
| `` | `OBJ_EVENT_GFX_TEALA` | 9,5 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_ExchangeServiceCorner_EventScript_VitaminClerk` | `0` |
| `` | `OBJ_EVENT_GFX_TEALA` | 10,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_ExchangeServiceCorner_EventScript_HoldItemClerk` | `0` |
| `` | `OBJ_EVENT_GFX_GIRL_1` | 12,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_ExchangeServiceCorner_EventScript_Girl` | `0` |

## Warps (3)
- #0 (7,10) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #6
- #1 (6,10) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #6
- #2 (8,10) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #6

## Variables référencées (6)
- `VAR_0x8004`
- `VAR_0x8008`
- `VAR_0x8009`
- `VAR_RESULT`
- `VAR_TEMP_1`
- `VAR_TEMP_2`

## Scripts (51)
### BattleFrontier_ExchangeServiceCorner_EventScript_ClerkWelcome
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_WelcomePleaseChoosePrize, MSGBOX_DEFAULT
special ShowBattlePointsWindow
return
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ThankYouVisitWithPoints, MSGBOX_DEFAULT
special CloseBattlePointsWindow
release
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
```
specialvar VAR_TEMP_1, GetFrontierBattlePoints
goto_if_ge VAR_TEMP_1, VAR_0x8008, BattleFrontier_ExchangeServiceCorner_EventScript_TryGivePrize
msgbox BattleFrontier_ExchangeServiceCorner_Text_DontHaveEnoughPoints, MSGBOX_DEFAULT
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_DECOR1_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_DECOR2_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_VITAMIN_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_TryGivePrize
```
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_DECOR1_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_TryGiveDecor
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_DECOR2_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_TryGiveDecor
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryGiveItem
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_TryGiveDecor
```
checkdecorspace VAR_0x8009
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_ExchangeServiceCorner_EventScript_NoRoomForDecor
copyvar VAR_0x8004, VAR_0x8008
special TakeFrontierBattlePoints
adddecoration VAR_0x8009
special UpdateBattlePointsWindow
playse SE_SHOP
msgbox BattleFrontier_ExchangeServiceCorner_Text_WellSendItToPC, MSGBOX_DEFAULT
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_DECOR1_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_NoRoomForDecor
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_PCIsFull, MSGBOX_DEFAULT
special CloseBattlePointsWindow
release
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_TryGiveItem
```
checkitemspace VAR_0x8009
goto_if_eq VAR_RESULT, FALSE, BattleFrontier_ExchangeServiceCorner_EventScript_BagFull
copyvar VAR_0x8004, VAR_0x8008
special TakeFrontierBattlePoints
additem VAR_0x8009
special UpdateBattlePointsWindow
playse SE_SHOP
msgbox BattleFrontier_ExchangeServiceCorner_Text_HereIsYourPrize, MSGBOX_DEFAULT
goto_if_eq VAR_TEMP_2, EXCHANGE_CORNER_VITAMIN_CLERK, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_BagFull
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_DontHaveSpaceToHoldIt, MSGBOX_DEFAULT
special CloseBattlePointsWindow
release
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_DecorClerk1
```
lock
faceplayer
setvar VAR_TEMP_2, EXCHANGE_CORNER_DECOR1_CLERK
call BattleFrontier_ExchangeServiceCorner_EventScript_ClerkWelcome
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
```
setvar VAR_0x8004, SCROLL_MULTI_BF_EXCHANGE_CORNER_DECOR_VENDOR_1
special ShowFrontierExchangeCornerItemIconWindow
special ShowScrollableMultichoice
special CloseFrontierExchangeCornerItemIconWindow
switch VAR_RESULT
case 0, BattleFrontier_ExchangeServiceCorner_EventScript_KissPoster
case 1, BattleFrontier_ExchangeServiceCorner_EventScript_KissCushion
case 2, BattleFrontier_ExchangeServiceCorner_EventScript_SmoochumDoll
case 3, BattleFrontier_ExchangeServiceCorner_EventScript_TogepiDoll
case 4, BattleFrontier_ExchangeServiceCorner_EventScript_MeowthDoll
case 5, BattleFrontier_ExchangeServiceCorner_EventScript_ClefairyDoll
case 6, BattleFrontier_ExchangeServiceCorner_EventScript_DittoDoll
case 7, BattleFrontier_ExchangeServiceCorner_EventScript_CyndaquilDoll
case 8, BattleFrontier_ExchangeServiceCorner_EventScript_ChikoritaDoll
case 9, BattleFrontier_ExchangeServiceCorner_EventScript_TotodileDoll
case 10, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
case MULTI_B_PRESSED, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_KissPoster
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmKissPoster, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 16
setvar VAR_0x8009, DECOR_KISS_POSTER
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_KissCushion
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmKissCushion, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 32
setvar VAR_0x8009, DECOR_KISS_CUSHION
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_SmoochumDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmSmoochumDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 32
setvar VAR_0x8009, DECOR_SMOOCHUM_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_TogepiDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmTogepiDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 48
setvar VAR_0x8009, DECOR_TOGEPI_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_MeowthDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmMeowthDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 48
setvar VAR_0x8009, DECOR_MEOWTH_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ClefairyDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmClefairyDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 48
setvar VAR_0x8009, DECOR_CLEFAIRY_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_DittoDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmDittoDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 48
setvar VAR_0x8009, DECOR_DITTO_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_CyndaquilDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmCyndaquilDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 80
setvar VAR_0x8009, DECOR_CYNDAQUIL_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ChikoritaDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmChikoritaDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 80
setvar VAR_0x8009, DECOR_CHIKORITA_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_TotodileDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmTotodileDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor1
setvar VAR_0x8008, 80
setvar VAR_0x8009, DECOR_TOTODILE_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_DecorClerk2
```
lock
faceplayer
setvar VAR_TEMP_2, EXCHANGE_CORNER_DECOR2_CLERK
call BattleFrontier_ExchangeServiceCorner_EventScript_ClerkWelcome
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
```
setvar VAR_0x8004, SCROLL_MULTI_BF_EXCHANGE_CORNER_DECOR_VENDOR_2
special ShowFrontierExchangeCornerItemIconWindow
special ShowScrollableMultichoice
special CloseFrontierExchangeCornerItemIconWindow
switch VAR_RESULT
case 0, BattleFrontier_ExchangeServiceCorner_EventScript_LaprasDoll
case 1, BattleFrontier_ExchangeServiceCorner_EventScript_SnorlaxDoll
case 2, BattleFrontier_ExchangeServiceCorner_EventScript_VenusaurDoll
case 3, BattleFrontier_ExchangeServiceCorner_EventScript_CharizardDoll
case 4, BattleFrontier_ExchangeServiceCorner_EventScript_BlastoiseDoll
case 5, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
case MULTI_B_PRESSED, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_LaprasDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmLaprasDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
setvar VAR_0x8008, 128
setvar VAR_0x8009, DECOR_LAPRAS_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_SnorlaxDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmSnorlaxDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
setvar VAR_0x8008, 128
setvar VAR_0x8009, DECOR_SNORLAX_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_VenusaurDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmVenusaurDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
setvar VAR_0x8008, 256
setvar VAR_0x8009, DECOR_VENUSAUR_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_CharizardDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmCharizardDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
setvar VAR_0x8008, 256
setvar VAR_0x8009, DECOR_CHARIZARD_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_BlastoiseDoll
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmBlastoiseDoll, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseDecor2
setvar VAR_0x8008, 256
setvar VAR_0x8009, DECOR_BLASTOISE_DOLL
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_VitaminClerk
```
lock
faceplayer
setvar VAR_TEMP_2, EXCHANGE_CORNER_VITAMIN_CLERK
call BattleFrontier_ExchangeServiceCorner_EventScript_ClerkWelcome
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
```
setvar VAR_0x8004, SCROLL_MULTI_BF_EXCHANGE_CORNER_VITAMIN_VENDOR
special ShowFrontierExchangeCornerItemIconWindow
special ShowScrollableMultichoice
special CloseFrontierExchangeCornerItemIconWindow
switch VAR_RESULT
case 0, BattleFrontier_ExchangeServiceCorner_EventScript_Protein
case 1, BattleFrontier_ExchangeServiceCorner_EventScript_Calcium
case 2, BattleFrontier_ExchangeServiceCorner_EventScript_Iron
case 3, BattleFrontier_ExchangeServiceCorner_EventScript_Zinc
case 4, BattleFrontier_ExchangeServiceCorner_EventScript_Carbos
case 5, BattleFrontier_ExchangeServiceCorner_EventScript_HPUp
case 6, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
case MULTI_B_PRESSED, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Protein
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmProtein, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
setvar VAR_0x8008, 1
setvar VAR_0x8009, ITEM_PROTEIN
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Calcium
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmCalcium, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
setvar VAR_0x8008, 1
setvar VAR_0x8009, ITEM_CALCIUM
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Iron
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmIron, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
setvar VAR_0x8008, 1
setvar VAR_0x8009, ITEM_IRON
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Zinc
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmZinc, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
setvar VAR_0x8008, 1
setvar VAR_0x8009, ITEM_ZINC
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Carbos
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmCarbos, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
setvar VAR_0x8008, 1
setvar VAR_0x8009, ITEM_CARBOS
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_HPUp
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmHPUp, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseVitamin
setvar VAR_0x8008, 1
setvar VAR_0x8009, ITEM_HP_UP
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_HoldItemClerk
```
lock
faceplayer
setvar VAR_TEMP_2, EXCHANGE_CORNER_HOLD_ITEM_CLERK
call BattleFrontier_ExchangeServiceCorner_EventScript_ClerkWelcome
goto BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
```
setvar VAR_0x8004, SCROLL_MULTI_BF_EXCHANGE_CORNER_HOLD_ITEM_VENDOR
special ShowFrontierExchangeCornerItemIconWindow
special ShowScrollableMultichoice
special CloseFrontierExchangeCornerItemIconWindow
switch VAR_RESULT
case 0, BattleFrontier_ExchangeServiceCorner_EventScript_Leftovers
case 1, BattleFrontier_ExchangeServiceCorner_EventScript_WhiteHerb
case 2, BattleFrontier_ExchangeServiceCorner_EventScript_QuickClaw
case 3, BattleFrontier_ExchangeServiceCorner_EventScript_MentalHerb
case 4, BattleFrontier_ExchangeServiceCorner_EventScript_Brightpowder
case 5, BattleFrontier_ExchangeServiceCorner_EventScript_ChoiceBand
case 6, BattleFrontier_ExchangeServiceCorner_EventScript_KingsRock
case 7, BattleFrontier_ExchangeServiceCorner_EventScript_FocusBand
case 8, BattleFrontier_ExchangeServiceCorner_EventScript_ScopeLens
case 9, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
case MULTI_B_PRESSED, BattleFrontier_ExchangeServiceCorner_EventScript_ClerkGoodbye
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Leftovers
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmLeftovers, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 48
setvar VAR_0x8009, ITEM_LEFTOVERS
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_WhiteHerb
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmWhiteHerb, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 48
setvar VAR_0x8009, ITEM_WHITE_HERB
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_QuickClaw
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmQuickClaw, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 48
setvar VAR_0x8009, ITEM_QUICK_CLAW
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_MentalHerb
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmMentalHerb, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 48
setvar VAR_0x8009, ITEM_MENTAL_HERB
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Brightpowder
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmBrightpowder, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 64
setvar VAR_0x8009, ITEM_BRIGHT_POWDER
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ChoiceBand
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmChoiceBand, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 64
setvar VAR_0x8009, ITEM_CHOICE_BAND
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_KingsRock
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmKingsRock, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 64
setvar VAR_0x8009, ITEM_KINGS_ROCK
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_FocusBand
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmFocusBand, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 64
setvar VAR_0x8009, ITEM_FOCUS_BAND
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_ScopeLens
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ConfirmScopeLens, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_ExchangeServiceCorner_EventScript_ChooseHoldItem
setvar VAR_0x8008, 64
setvar VAR_0x8009, ITEM_SCOPE_LENS
goto BattleFrontier_ExchangeServiceCorner_EventScript_TryPurchasePrize
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Man
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_GoGetYourOwnDoll, MSGBOX_NPC
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Sailor
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_ItemsWillGetMonTougher, MSGBOX_NPC
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_PokefanF
```
lock
msgbox BattleFrontier_ExchangeServiceCorner_Text_GetYouAnythingYouWant, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_RichBoy
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_WishIHadAllDolls, MSGBOX_NPC
end
```
### BattleFrontier_ExchangeServiceCorner_EventScript_Girl
```
msgbox BattleFrontier_ExchangeServiceCorner_Text_MoreBattlePointsForRecord, MSGBOX_NPC
end
```

## Textes (69)
### BattleFrontier_ExchangeServiceCorner_Text_WelcomePleaseChoosePrize
```
Bonjour! Vous êtes au SERVICE\nD'ECHANGE.\pNous échangeons vos POINTS DE COMBAT\ncontre de magnifiques prix.\pVeuillez choisir un objet.$
```
### BattleFrontier_ExchangeServiceCorner_Text_PleaseChoosePrize
```
Please choose a prize from this list.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmKissPoster
```
Vous avez choisi le prix POSTER BAISER.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmKissCushion
```
Vous avez choisi le prix\nCOUSSIN BAISER. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmSmoochumDoll
```
Vous avez choisi le prix POUPEE\nLIPPOUTI. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmTogepiDoll
```
Vous avez choisi le prix POUPEE TOGEPI.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmMeowthDoll
```
Vous avez choisi le prix\nPOUPEE MIAOUSS. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmClefairyDoll
```
Vous avez choisi le prix\nPOUPEE MELOFEE. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmDittoDoll
```
Vous avez choisi le prix POUP.\nMETAMORPH. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmCyndaquilDoll
```
Vous avez choisi le prix POUP.\nHERICENDRE. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmChikoritaDoll
```
Vous avez choisi le prix\nPOUP. GERMIGNON. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmTotodileDoll
```
Vous avez choisi le prix\nPOUPEE KAIMINUS. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmLaprasDoll
```
Vous avez choisi le prix POUPEE\nLOKHLASS. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmSnorlaxDoll
```
Vous avez choisi le prix \nPOUPEE RONFLEX. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmVenusaurDoll
```
Vous avez choisi le prix POUP.\nFLORIZARRE. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmCharizardDoll
```
Vous avez choisi le prix POUP.\nDRACAUFEU. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmBlastoiseDoll
```
Vous avez choisi le prix POUPEE\nTORTANK. C'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmProtein
```
Vous avez choisi le prix PROTEINE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmCalcium
```
Vous avez choisi le prix CALCIUM.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmIron
```
Vous avez choisi le prix FER.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmZinc
```
Vous avez choisi le prix ZINC.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmCarbos
```
Vous avez choisi le prix CARBONE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmHPUp
```
Vous avez choisi le prix PV PLUS.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmBrightpowder
```
Vous avez choisi le prix POUDRECLAIRE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmWhiteHerb
```
Vous avez choisi le prix HERBEBLANCHE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmQuickClaw
```
Vous avez choisi le prix VIVE GRIFFE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmMentalHerb
```
Vous avez choisi le prix HERBE MENTAL.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmChoiceBand
```
Vous avez choisi le prix BAND. CHOIX.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmKingsRock
```
Vous avez choisi le prix ROCHE ROYALE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmFocusBand
```
Vous avez choisi le prix BANDEAU.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmScopeLens
```
Vous avez choisi le prix LENTILSCOPE.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_ConfirmLeftovers
```
Vous avez choisi le prix RESTES.\nC'est bien cela?$
```
### BattleFrontier_ExchangeServiceCorner_Text_WellSendItToPC
```
Merci!\nCe sera envoyé chez vous, sur votre PC.$
```
### BattleFrontier_ExchangeServiceCorner_Text_HereIsYourPrize
```
Voici votre prix!$
```
### BattleFrontier_ExchangeServiceCorner_Text_DontHaveEnoughPoints
```
Je suis désolée, mais vous n'avez pas\nassez de POINTS DE COMBAT…$
```
### BattleFrontier_ExchangeServiceCorner_Text_PCIsFull
```
Je suis désolée, mais votre PC semble\nêtre plein…$
```
### BattleFrontier_ExchangeServiceCorner_Text_DontHaveSpaceToHoldIt
```
Je suis désolée, mais vous n'avez pas\nassez de place…$
```
### BattleFrontier_ExchangeServiceCorner_Text_ThankYouVisitWithPoints
```
Merci de votre visite.\nRevenez quand vous voulez.$
```
### BattleFrontier_ExchangeServiceCorner_Text_WishIHadAllDolls
```
Oh, ce que c'est beau!\nJ'aimerais tout avoir!\lLes jolis COUSSINS!\lLes grosses POUPEES!\lLes petites POUPEES!\lJ'aimerais tout avoir!$
```
### BattleFrontier_ExchangeServiceCorner_Text_GetYouAnythingYouWant
```
Dis à maman ce que tu veux.\pSi tu veux quelque chose, je ferai\ntout pour te l'offrir, mon chéri!$
```
### BattleFrontier_ExchangeServiceCorner_Text_ItemsWillGetMonTougher
```
Si j'arrive à me procurer ces objets, \nmes POKéMON vont devenir plus forts.\pOui, plutôt deux fois qu'une!\nIl me faut ces objets!$
```
### BattleFrontier_ExchangeServiceCorner_Text_GoGetYourOwnDoll
```
Tiens?\nMais qu'est-ce que tu regardes, là?\pArrête de reluquer ma poupée\ncomme ça.\pSi tu en veux une, tu n'as qu'à\nl'acheter! Pas vrai, LIPPOUTI?$
```
### BattleFrontier_ExchangeServiceCorner_Text_MoreBattlePointsForRecord
```
Dis, tu savais ça?\pSi tu rejoues et améliores ton résultat\ndans un bâtiment de la ZONE DE COMBAT,\ltu obtiens plus de POINTS DE COMBAT.$
```
### BattleFrontier_ExchangeServiceCorner_Text_KissPosterDesc
```
Un grand poster avec l'image de\nLIPPOUTI.$
```
### BattleFrontier_ExchangeServiceCorner_Text_KissCushionDesc
```
Un coussin LIPPOUTI à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_SmoochumDollDesc
```
Une poupée LIPPOUTI à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_TogepiDollDesc
```
Une poupée TOGEPI à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_MeowthDollDesc
```
Une poupée MIAOUSS à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ClefairyDollDesc
```
Une poupée MELOFEE à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_DittoDollDesc
```
Une poupée METAMORPH à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_CyndaquilDollDesc
```
Une poupée HERICENDRE à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ChikoritaDollDesc
```
Une poupée GERMIGNON à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_TotodileDollDesc
```
Une poupée KAIMINUS à poser\nsur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_LargeDollDesc
```
Une grande poupée.\nA poser sur un support.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ProteinDesc
```
Monte l'ATTAQUE d'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_CalciumDesc
```
Monte l'ATQ. SPE. d'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_IronDesc
```
Monte la DEFENSE d'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ZincDesc
```
Monte la DEF. SPE. d'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_CarbosDesc
```
Monte la VITESSE d'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_HPUpDesc
```
Monte les PV d'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_LeftoversDesc
```
Objet tenu permettant de restaurer\nles PV au combat.$
```
### BattleFrontier_ExchangeServiceCorner_Text_WhiteHerbDesc
```
Objet tenu qui restaure les stats\nbaissées.$
```
### BattleFrontier_ExchangeServiceCorner_Text_QuickClawDesc
```
Objet tenu qui permet parfois de\nfrapper le premier.$
```
### BattleFrontier_ExchangeServiceCorner_Text_MentalHerbDesc
```
Objet tenu qui annule l'attirance\nd'un POKéMON.$
```
### BattleFrontier_ExchangeServiceCorner_Text_BrightpowderDesc
```
Objet tenu qui intimide et baisse\nla précision.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ChoiceBandDesc
```
Monte la puissance d'une attaque.\nDésactive les autres.$
```
### BattleFrontier_ExchangeServiceCorner_Text_KingsRockDesc
```
Objet tenu pouvant apeurer l'ennemi\ns'il est touché.$
```
### BattleFrontier_ExchangeServiceCorner_Text_FocusBandDesc
```
Objet tenu pouvant parfois empêcher\nd'être mis K.O.$
```
### BattleFrontier_ExchangeServiceCorner_Text_ScopeLensDesc
```
Objet tenu pour monter le taux de\ncritiques.$
```

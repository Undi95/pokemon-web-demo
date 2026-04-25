# BattleFrontier_Lounge6

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_LOUNGE6`
- **layout** : `LAYOUT_BATTLE_FRONTIER_LOUNGE2`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_BEAUTY` | 2,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Lounge6_EventScript_Trader` | `0` |

## Warps (1)
- #0 (4,9) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #8

## Flags référencés (1)
- `FLAG_BATTLE_FRONTIER_TRADE_DONE`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_0x8009`
- `VAR_0x800A`
- `VAR_0x800B`
- `VAR_1`
- `VAR_RESULT`

## Scripts (4)
### BattleFrontier_Lounge6_EventScript_Trader
```
lock
faceplayer
goto_if_set FLAG_BATTLE_FRONTIER_TRADE_DONE, BattleFrontier_Lounge6_EventScript_TradeCompleted
setvar VAR_0x8008, INGAME_TRADE_MEOWTH
copyvar VAR_0x8004, VAR_0x8008
specialvar VAR_RESULT, GetInGameTradeSpeciesInfo
copyvar VAR_0x8009, VAR_RESULT
msgbox BattleFrontier_Lounge6_Text_WouldYouLikeToTrade, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, BattleFrontier_Lounge6_EventScript_DeclineTrade
special ChoosePartyMon
copyvar VAR_0x800A, VAR_0x8004
goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, BattleFrontier_Lounge6_EventScript_DeclineTrade
copyvar VAR_0x8005, VAR_0x800A
specialvar VAR_RESULT, GetTradeSpecies
copyvar VAR_0x800B, VAR_RESULT
goto_if_ne VAR_RESULT, VAR_0x8009, BattleFrontier_Lounge6_EventScript_NotRequestedMon
copyvar VAR_0x8004, VAR_0x8008
copyvar VAR_0x8005, VAR_0x800A
special CreateInGameTradePokemon
special DoInGameTradeScene
msgbox BattleFrontier_Lounge6_Text_PromiseIllBeGoodToIt, MSGBOX_DEFAULT
setflag FLAG_BATTLE_FRONTIER_TRADE_DONE
release
end
```
### BattleFrontier_Lounge6_EventScript_DeclineTrade
```
msgbox BattleFrontier_Lounge6_Text_WellThatsFineToo, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge6_EventScript_NotRequestedMon
```
bufferspeciesname STR_VAR_1, VAR_0x8009
msgbox BattleFrontier_Lounge6_Text_DontTradeForAnythingButMon, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge6_EventScript_TradeCompleted
```
msgbox BattleFrontier_Lounge6_Text_SkittySoMuchCuterThanImagined, MSGBOX_DEFAULT
release
end
```

## Textes (5)
### BattleFrontier_Lounge6_Text_WouldYouLikeToTrade
```
Mon POKéMON est un {STR_VAR_2}.\nTu connais?\lC'est assez mignon et plutôt joli.\pCelui-là, je serais fière de l'échanger!\pTu veux échanger un {STR_VAR_1} contre\nmon {STR_VAR_2}?$
```
### BattleFrontier_Lounge6_Text_PromiseIllBeGoodToIt
```
Oh, c'est adorable!\nMerci!\lJe vais bien m'en occuper!\pDis, j'espère que tu prendras bien soin\nde mon {STR_VAR_2}!$
```
### BattleFrontier_Lounge6_Text_DontTradeForAnythingButMon
```
Oh, je suis désolée!\nJe ferai l'échange uniquement contre un\l{STR_VAR_1}.$
```
### BattleFrontier_Lounge6_Text_WellThatsFineToo
```
Oh, tu ne veux pas?\nBon, pas de problème.\lReviens quand tu veux.$
```
### BattleFrontier_Lounge6_Text_SkittySoMuchCuterThanImagined
```
Hi, hi!\nUn SKITTY, c'est encore plus mignon\lque je ne le pensais!$
```

# PacifidlogTown_House3

## Métadonnées
- **id** : `MAP_PACIFIDLOG_TOWN_HOUSE3`
- **layout** : `LAYOUT_PACIFIDLOG_TOWN_HOUSE1`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_PACIFIDLOG_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_GIRL_2` | 3,5 | `MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT` | `PacifidlogTown_House3_EventScript_Girl` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_3` | 4,2 | `MOVEMENT_TYPE_FACE_RIGHT` | `PacifidlogTown_House3_EventScript_Trader` | `0` |

## Warps (2)
- #0 (4,8) → `MAP_PACIFIDLOG_TOWN` warp #3
- #1 (5,8) → `MAP_PACIFIDLOG_TOWN` warp #3

## Flags référencés (1)
- `FLAG_PACIFIDLOG_NPC_TRADE_COMPLETED`

## Variables référencées (8)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8008`
- `VAR_0x8009`
- `VAR_0x800A`
- `VAR_0x800B`
- `VAR_1`
- `VAR_RESULT`

## Scripts (5)
### PacifidlogTown_House3_EventScript_Trader
```
lock
faceplayer
goto_if_set FLAG_PACIFIDLOG_NPC_TRADE_COMPLETED, PacifidlogTown_House3_EventScript_TradeCompleted
setvar VAR_0x8008, INGAME_TRADE_HORSEA
copyvar VAR_0x8004, VAR_0x8008
specialvar VAR_RESULT, GetInGameTradeSpeciesInfo
copyvar VAR_0x8009, VAR_RESULT
msgbox PacifidlogTown_House3_Text_WillingToTradeIt, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, PacifidlogTown_House3_EventScript_DeclineTrade
special ChoosePartyMon
copyvar VAR_0x800A, VAR_0x8004
goto_if_eq VAR_0x8004, PARTY_NOTHING_CHOSEN, PacifidlogTown_House3_EventScript_DeclineTrade
copyvar VAR_0x8005, VAR_0x800A
specialvar VAR_RESULT, GetTradeSpecies
copyvar VAR_0x800B, VAR_RESULT
goto_if_ne VAR_RESULT, VAR_0x8009, PacifidlogTown_House3_EventScript_NotRequestedMon
copyvar VAR_0x8004, VAR_0x8008
copyvar VAR_0x8005, VAR_0x800A
special CreateInGameTradePokemon
special DoInGameTradeScene
bufferspeciesname STR_VAR_1, VAR_0x8009
msgbox PacifidlogTown_House3_Text_ItsSubtlyDifferentThankYou, MSGBOX_DEFAULT
setflag FLAG_PACIFIDLOG_NPC_TRADE_COMPLETED
release
end
```
### PacifidlogTown_House3_EventScript_DeclineTrade
```
msgbox PacifidlogTown_House3_Text_NotDesperateOrAnything, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House3_EventScript_NotRequestedMon
```
bufferspeciesname STR_VAR_1, VAR_0x8009
msgbox PacifidlogTown_House3_Text_WontAcceptAnyLessThanRealMon, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House3_EventScript_TradeCompleted
```
msgbox PacifidlogTown_House3_Text_ReallyWantedToGetBagon, MSGBOX_DEFAULT
release
end
```
### PacifidlogTown_House3_EventScript_Girl
```
msgbox PacifidlogTown_House3_Text_IsThatAPokedex, MSGBOX_NPC
end
```

## Textes (6)
### PacifidlogTown_House3_Text_WillingToTradeIt
```
Regarde-moi ce {STR_VAR_2}!\pJe l'ai attrapé hier pour fêter mon\nanniversaire!\pIl te plaît, on dirait!\nComme je te comprends…\pBon… J'accepterais peut-être\nde l'échanger contre un {STR_VAR_1}.$
```
### PacifidlogTown_House3_Text_ItsSubtlyDifferentThankYou
```
Oh, c'est un {STR_VAR_1}?\pÇa ressemble à un {STR_VAR_2}, la\ndifférence est subtile.\pMerci!$
```
### PacifidlogTown_House3_Text_WontAcceptAnyLessThanRealMon
```
Non, non et non! Un {STR_VAR_1}\nsinon rien!$
```
### PacifidlogTown_House3_Text_NotDesperateOrAnything
```
Oh, pas d'échange alors?\pPas de problème. Je n'insiste pas.$
```
### PacifidlogTown_House3_Text_ReallyWantedToGetBagon
```
Je sais que j'aurais pu m'en trouver un\nmoi-même…\pMais je voulais un DRABY attrapé par un\nautre DRESSEUR…$
```
### PacifidlogTown_House3_Text_IsThatAPokedex
```
C'est un POKéDEX?\pTu as rencontré beaucoup de POKéMON\ndifférents?\pJ'aimerais bien être comme toi.$
```

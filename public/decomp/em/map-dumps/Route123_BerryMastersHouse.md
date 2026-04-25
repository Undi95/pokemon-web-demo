# Route123_BerryMastersHouse

## Métadonnées
- **id** : `MAP_ROUTE123_BERRY_MASTERS_HOUSE`
- **layout** : `LAYOUT_HOUSE2`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_123`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 4,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route123_BerryMastersHouse_EventScript_BerryMaster` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_WOMAN` | 7,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route123_BerryMastersHouse_EventScript_BerryMastersWife` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_ROUTE123` warp #0
- #1 (4,7) → `MAP_ROUTE123` warp #0

## Flags référencés (8)
- `FLAG_DAILY_BERRY_MASTERS_WIFE`
- `FLAG_DAILY_BERRY_MASTER_RECEIVED_BERRY`
- `FLAG_LANDMARK_BERRY_MASTERS_HOUSE`
- `FLAG_RECEIVED_BELUE_BERRY`
- `FLAG_RECEIVED_DURIN_BERRY`
- `FLAG_RECEIVED_PAMTRE_BERRY`
- `FLAG_RECEIVED_SPELON_BERRY`
- `FLAG_RECEIVED_WATMEL_BERRY`

## Variables référencées (2)
- `VAR_0x8004`
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_ShowEasyChatScreen`
- `Route123_BerryMastersHouse_Text_Ah`
- `Route123_BerryMastersHouse_Text_DoneForToday`
- `Route123_BerryMastersHouse_Text_GoodSayingTakeThis`
- `Route123_BerryMastersHouse_Text_HeardAGoodSayingLately`
- `Route123_BerryMastersHouse_Text_InspirationalTakeThis`
- `Route123_BerryMastersHouse_Text_JoyNeverGoesOutOfMyLife`
- `Route123_BerryMastersHouse_Text_VisitPrettyPetalFlowerShop`
- `Route123_BerryMastersHouse_Text_WhyBeStingyTakeAnother`
- `Route123_BerryMastersHouse_Text_YoureDeservingOfBerry`

## Scripts (15)
### Route123_BerryMastersHouse_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route123_BerryMastersHouse_OnTransition
```
### Route123_BerryMastersHouse_OnTransition
```
setflag FLAG_LANDMARK_BERRY_MASTERS_HOUSE
end
```
### Route123_BerryMastersHouse_EventScript_BerryMaster
```
lock
faceplayer
dotimebasedevents
goto_if_set FLAG_DAILY_BERRY_MASTER_RECEIVED_BERRY, Route123_BerryMastersHouse_EventScript_ReceivedBerryToday
msgbox Route123_BerryMastersHouse_Text_YoureDeservingOfBerry, MSGBOX_DEFAULT
random NUM_BERRY_MASTER_BERRIES
addvar VAR_RESULT, NUM_BERRY_MASTER_BERRIES_SKIPPED
addvar VAR_RESULT, FIRST_BERRY_INDEX
giveitem VAR_RESULT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_DAILY_BERRY_MASTER_RECEIVED_BERRY
msgbox Route123_BerryMastersHouse_Text_WhyBeStingyTakeAnother, MSGBOX_DEFAULT
random NUM_BERRY_MASTER_BERRIES
addvar VAR_RESULT, NUM_BERRY_MASTER_BERRIES_SKIPPED
addvar VAR_RESULT, FIRST_BERRY_INDEX
giveitem VAR_RESULT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
msgbox Route123_BerryMastersHouse_Text_VisitPrettyPetalFlowerShop, MSGBOX_DEFAULT
release
end
```
### Route123_BerryMastersHouse_EventScript_ReceivedBerryToday
```
msgbox Route123_BerryMastersHouse_Text_DoneForToday, MSGBOX_DEFAULT
release
end
```
### Route123_BerryMastersHouse_EventScript_BerryMastersWife
```
lock
faceplayer
dotimebasedevents
goto_if_set FLAG_DAILY_BERRY_MASTERS_WIFE, Route123_BerryMastersHouse_EventScript_ReceivedWifeBerryToday
msgbox Route123_BerryMastersHouse_Text_HeardAGoodSayingLately, MSGBOX_DEFAULT
setvar VAR_0x8004, EASY_CHAT_TYPE_GOOD_SAYING
call Common_ShowEasyChatScreen
lock
faceplayer
goto_if_eq VAR_RESULT, TRUE, Route123_BerryMastersHouse_EventScript_GavePhrase
goto_if_eq VAR_RESULT, FALSE, Route123_BerryMastersHouse_EventScript_CancelPhrase
end
```
### Route123_BerryMastersHouse_EventScript_CancelPhrase
```
msgbox Route123_BerryMastersHouse_Text_Ah, MSGBOX_DEFAULT
msgbox Route123_BerryMastersHouse_Text_JoyNeverGoesOutOfMyLife, MSGBOX_DEFAULT
release
end
```
### Route123_BerryMastersHouse_EventScript_GavePhrase
```
goto_if_eq VAR_0x8004, NOT_SPECIAL_PHRASE, Route123_BerryMastersHouse_EventScript_GiveNormalBerry
goto_if_eq VAR_0x8004, PHRASE_GREAT_BATTLE, Route123_BerryMastersHouse_EventScript_GiveSpelonBerry
goto_if_eq VAR_0x8004, PHRASE_CHALLENGE_CONTEST, Route123_BerryMastersHouse_EventScript_GivePamtreBerry
goto_if_eq VAR_0x8004, PHRASE_OVERWHELMING_LATIAS, Route123_BerryMastersHouse_EventScript_GiveWatmelBerry
goto_if_eq VAR_0x8004, PHRASE_COOL_LATIOS, Route123_BerryMastersHouse_EventScript_GiveDurinBerry
goto_if_eq VAR_0x8004, PHRASE_SUPER_HUSTLE, Route123_BerryMastersHouse_EventScript_GiveBelueBerry
end
```
### Route123_BerryMastersHouse_EventScript_GiveNormalBerry
```
msgbox Route123_BerryMastersHouse_Text_GoodSayingTakeThis, MSGBOX_DEFAULT
random NUM_BERRY_MASTER_WIFE_BERRIES
addvar VAR_RESULT, FIRST_BERRY_INDEX
giveitem VAR_RESULT
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
goto Route123_BerryMastersHouse_EventScript_GaveBerry
release
end
```
### Route123_BerryMastersHouse_EventScript_GiveSpelonBerry
```
goto_if_set FLAG_RECEIVED_SPELON_BERRY, Route123_BerryMastersHouse_EventScript_GiveNormalBerry
msgbox Route123_BerryMastersHouse_Text_InspirationalTakeThis, MSGBOX_DEFAULT
giveitem ITEM_SPELON_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_SPELON_BERRY
goto Route123_BerryMastersHouse_EventScript_GaveBerry
end
```
### Route123_BerryMastersHouse_EventScript_GivePamtreBerry
```
goto_if_set FLAG_RECEIVED_PAMTRE_BERRY, Route123_BerryMastersHouse_EventScript_GiveNormalBerry
msgbox Route123_BerryMastersHouse_Text_InspirationalTakeThis, MSGBOX_DEFAULT
giveitem ITEM_PAMTRE_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_PAMTRE_BERRY
goto Route123_BerryMastersHouse_EventScript_GaveBerry
end
```
### Route123_BerryMastersHouse_EventScript_GiveWatmelBerry
```
goto_if_set FLAG_RECEIVED_WATMEL_BERRY, Route123_BerryMastersHouse_EventScript_GiveNormalBerry
msgbox Route123_BerryMastersHouse_Text_InspirationalTakeThis, MSGBOX_DEFAULT
giveitem ITEM_WATMEL_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_WATMEL_BERRY
goto Route123_BerryMastersHouse_EventScript_GaveBerry
end
```
### Route123_BerryMastersHouse_EventScript_GiveDurinBerry
```
goto_if_set FLAG_RECEIVED_DURIN_BERRY, Route123_BerryMastersHouse_EventScript_GiveNormalBerry
msgbox Route123_BerryMastersHouse_Text_InspirationalTakeThis, MSGBOX_DEFAULT
giveitem ITEM_DURIN_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_DURIN_BERRY
goto Route123_BerryMastersHouse_EventScript_GaveBerry
end
```
### Route123_BerryMastersHouse_EventScript_GiveBelueBerry
```
goto_if_set FLAG_RECEIVED_BELUE_BERRY, Route123_BerryMastersHouse_EventScript_GiveNormalBerry
msgbox Route123_BerryMastersHouse_Text_InspirationalTakeThis, MSGBOX_DEFAULT
giveitem ITEM_BELUE_BERRY
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_BELUE_BERRY
goto Route123_BerryMastersHouse_EventScript_GaveBerry
end
```
### Route123_BerryMastersHouse_EventScript_ReceivedWifeBerryToday
```
msgbox Route123_BerryMastersHouse_Text_JoyNeverGoesOutOfMyLife, MSGBOX_DEFAULT
release
end
```
### Route123_BerryMastersHouse_EventScript_GaveBerry
```
setflag FLAG_DAILY_BERRY_MASTERS_WIFE
msgbox Route123_BerryMastersHouse_Text_JoyNeverGoesOutOfMyLife, MSGBOX_DEFAULT
release
end
```

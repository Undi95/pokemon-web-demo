# Route106

## Métadonnées
- **id** : `MAP_ROUTE106`
- **layout** : `LAYOUT_ROUTE106`
- **music** : `MUS_ROUTE104`
- **region_map_section** : `MAPSEC_ROUTE_106`
- **weather** : `WEATHER_SUNNY`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Connexions
- up (offset 0) → `MAP_ROUTE105`
- down (offset 60) → `MAP_DEWFORD_TOWN`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_SWIMMER_M` | 18,5 | `MOVEMENT_TYPE_WALK_LEFT_AND_RIGHT` | `Route106_EventScript_Douglas` | `0` |
| `` | `OBJ_EVENT_GFX_SWIMMER_F` | 29,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route106_EventScript_Kyla` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 51,14 | `MOVEMENT_TYPE_FACE_RIGHT` | `Route106_EventScript_Elliot` | `0` |
| `` | `OBJ_EVENT_GFX_FISHERMAN` | 65,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route106_EventScript_Ned` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 29,14 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route106_EventScript_ItemProtein` | `FLAG_ITEM_ROUTE_106_PROTEIN` |

## Warps (1)
- #0 (48,16) → `MAP_GRANITE_CAVE_1F` warp #0

## BG events / signs (4)
- (41,11) [hidden_item] → ``
- (53,12) [hidden_item] → ``
- (68,15) [hidden_item] → ``
- (59,13) [sign] → `Route106_EventScript_TrainerTipsSign`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Route106_Text_DouglasPostBattle`
- `Route106_Text_ElliotPostBattle`
- `Route106_Text_ElliotRegister`
- `Route106_Text_ElliotRematchPostBattle`
- `Route106_Text_KylaPostBattle`
- `Route106_Text_NedPostBattle`

## Scripts (7)
### Route106_EventScript_TrainerTipsSign
```
msgbox Route106_Text_TrainerTips, MSGBOX_SIGN
end
```
### Route106_EventScript_Douglas
```
trainerbattle_single TRAINER_DOUGLAS, Route106_Text_DouglasIntro, Route106_Text_DouglasDefeated
msgbox Route106_Text_DouglasPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route106_EventScript_Kyla
```
trainerbattle_single TRAINER_KYLA, Route106_Text_KylaIntro, Route106_Text_KylaDefeated
msgbox Route106_Text_KylaPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route106_EventScript_Elliot
```
trainerbattle_single TRAINER_ELLIOT_1, Route106_Text_ElliotIntro, Route106_Text_ElliotDefeated, Route106_EventScript_ElliotRegisterMatchCallAfterBattle
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, Route106_EventScript_ElliotRematch
msgbox Route106_Text_ElliotPostBattle, MSGBOX_DEFAULT
release
end
```
### Route106_EventScript_ElliotRegisterMatchCallAfterBattle
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox Route106_Text_ElliotRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_ELLIOT_1
release
end
```
### Route106_EventScript_ElliotRematch
```
trainerbattle_rematch TRAINER_ELLIOT_1, Route106_Text_ElliotRematchIntro, Route106_Text_ElliotRematchDefeated
msgbox Route106_Text_ElliotRematchPostBattle, MSGBOX_AUTOCLOSE
end
```
### Route106_EventScript_Ned
```
trainerbattle_single TRAINER_NED, Route106_Text_NedIntro, Route106_Text_NedDefeated
msgbox Route106_Text_NedPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (1)
### Route106_Text_TrainerTips
```
CONSEILS AUX DRESSEURS\pPour attraper un POKéMON avec la CANNE,\nappuyez sur le bouton A quand ça mord.$
```

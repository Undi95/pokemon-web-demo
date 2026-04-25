# BattleFrontier_RankingHall

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_RANKING_HALL`
- **layout** : `LAYOUT_BATTLE_FRONTIER_RANKING_HALL`
- **music** : `MUS_LILYCOVE_MUSEUM`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_TEALA` | 24,13 | `MOVEMENT_TYPE_FACE_DOWN` | `BattleFrontier_RankingHall_EventScript_Attendant` | `0` |
| `` | `OBJ_EVENT_GFX_NINJA_BOY` | 4,10 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_RankingHall_EventScript_NinjaBoy` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 44,11 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_RankingHall_EventScript_Boy` | `0` |

## Warps (2)
- #0 (26,14) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #4
- #1 (27,14) → `MAP_BATTLE_FRONTIER_OUTSIDE_EAST` warp #4

## BG events / signs (12)
- (26,9) [sign] → `BattleFrontier_RankingHall_EventScript_TowerSinglesRecords`
- (23,8) [sign] → `BattleFrontier_RankingHall_EventScript_TowerDoublesRecords`
- (26,5) [sign] → `BattleFrontier_RankingHall_EventScript_TowerMultisRecords`
- (29,8) [sign] → `BattleFrontier_RankingHall_EventScript_TowerLinkRecords`
- (42,9) [sign] → `BattleFrontier_RankingHall_EventScript_ArenaRecords`
- (46,9) [sign] → `BattleFrontier_RankingHall_EventScript_PalaceRecords`
- (10,9) [sign] → `BattleFrontier_RankingHall_EventScript_FactoryRecords`
- (8,7) [sign] → `BattleFrontier_RankingHall_EventScript_DomeRecords`
- (6,9) [sign] → `BattleFrontier_RankingHall_EventScript_PikeRecords`
- (44,7) [sign] → `BattleFrontier_RankingHall_EventScript_PyramidRecords`
- (16,8) [sign] → `BattleFrontier_RankingHall_EventScript_DomePikeFactoryRecordsSign`
- (36,8) [sign] → `BattleFrontier_RankingHall_EventScript_PalaceArenaPyramidRecordsSIgn`

## Variables référencées (2)
- `VAR_0x8005`
- `VAR_RESULT`

## Scripts (17)
### BattleFrontier_RankingHall_EventScript_TowerSinglesRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_TOWER_SINGLES
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_TowerDoublesRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_TOWER_DOUBLES
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_TowerMultisRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_TOWER_MULTIS
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_TowerLinkRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_TOWER_LINK
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_ArenaRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_ARENA
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_PalaceRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_PALACE
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_FactoryRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_FACTORY
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_DomeRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_DOME
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_PikeRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_PIKE
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_PyramidRecords
```
lockall
setvar VAR_0x8005, RANKING_HALL_PYRAMID
goto BattleFrontier_RankingHall_EventScript_ShowRecords
end
```
### BattleFrontier_RankingHall_EventScript_ShowRecords
```
special ShowRankingHallRecordsWindow
waitbuttonpress
special ScrollRankingHallRecordsWindow
waitbuttonpress
special RemoveRecordsWindow
releaseall
end
```
### BattleFrontier_RankingHall_EventScript_Attendant
```
msgbox BattleFrontier_RankingHall_Text_ExplainRankingHall, MSGBOX_NPC
end
```
### BattleFrontier_RankingHall_EventScript_DomePikeFactoryRecordsSign
```
msgbox BattleFrontier_RankingHall_Text_DomePikeFactoryRecords, MSGBOX_SIGN
end
```
### BattleFrontier_RankingHall_EventScript_PalaceArenaPyramidRecordsSIgn
```
msgbox BattleFrontier_RankingHall_Text_PalaceArenaPyramidRecords, MSGBOX_SIGN
end
```
### BattleFrontier_RankingHall_EventScript_NinjaBoy
```
lock
faceplayer
msgbox BattleFrontier_RankingHall_Text_IsYourNameOnThisList, MSGBOX_YESNO
goto_if_eq VAR_RESULT, YES, BattleFrontier_RankingHall_EventScript_NinjaBoyNameOnList
msgbox BattleFrontier_RankingHall_Text_WorkHarderIfYouSawFriendsName, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_RankingHall_EventScript_NinjaBoyNameOnList
```
msgbox BattleFrontier_RankingHall_Text_WowThatsSuper, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_RankingHall_EventScript_Boy
```
msgbox BattleFrontier_RankingHall_Text_MyNamesNotUpThere, MSGBOX_NPC
end
```

## Textes (7)
### BattleFrontier_RankingHall_Text_ExplainRankingHall
```
Voici le HALL DE CLASSEMENT.\pIci, nous immortalisons les DRESSEURS\nqui ont obtenu les meilleurs résultats\ldans la ZONE DE COMBAT.$
```
### BattleFrontier_RankingHall_Text_DomePikeFactoryRecords
```
Records du DOME DE COMBAT, du REPTILE\nDE COMBAT et de l'USINE DE COMBAT.$
```
### BattleFrontier_RankingHall_Text_PalaceArenaPyramidRecords
```
Records du PALACE DE COMBAT, du DOJO\nDE COMBAT et de la PYRAMIDE DE COMBAT.$
```
### BattleFrontier_RankingHall_Text_IsYourNameOnThisList
```
Salut, ton nom est sur la liste?$
```
### BattleFrontier_RankingHall_Text_WowThatsSuper
```
La chance!!!\nMoi, il faut que je m'entraîne plus!$
```
### BattleFrontier_RankingHall_Text_WorkHarderIfYouSawFriendsName
```
Ah oui?\pSi tu voyais le nom de tes amis ici, tu\nferais sûrement plus d'efforts!$
```
### BattleFrontier_RankingHall_Text_MyNamesNotUpThere
```
Hum…\nY a pas mon nom…\pFaut dire que j'ai participé à aucun\ndéfi, donc c'est plutôt normal…$
```

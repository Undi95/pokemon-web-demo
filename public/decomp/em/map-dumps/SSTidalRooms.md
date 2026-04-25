# SSTidalRooms

## Métadonnées
- **id** : `MAP_SS_TIDAL_ROOMS`
- **layout** : `LAYOUT_SS_TIDAL_ROOMS`
- **music** : `MUS_SAILING`
- **region_map_section** : `MAPSEC_DYNAMIC`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_POKEFAN_M` | 4,7 | `MOVEMENT_TYPE_FACE_RIGHT` | `SSTidalRooms_EventScript_Colton` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 34,11 | `MOVEMENT_TYPE_FACE_LEFT` | `SSTidalRooms_EventScript_Micah` | `0` |
| `` | `OBJ_EVENT_GFX_GENTLEMAN` | 21,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `SSTidalRooms_EventScript_Thomas` | `0` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 5,14 | `MOVEMENT_TYPE_FACE_DOWN` | `SSTidalRooms_EventScript_Jed` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_4` | 4,14 | `MOVEMENT_TYPE_FACE_DOWN` | `SSTidalRooms_EventScript_Lea` | `0` |
| `` | `OBJ_EVENT_GFX_RICH_BOY` | 22,11 | `MOVEMENT_TYPE_FACE_DOWN` | `SSTidalRooms_EventScript_Garret` | `0` |
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 15,6 | `MOVEMENT_TYPE_FACE_LEFT` | `SSTidalRooms_EventScript_Naomi` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 28,5 | `MOVEMENT_TYPE_FACE_UP` | `SSTidalRooms_EventScript_SnatchGiver` | `FLAG_HIDE_SS_TIDAL_ROOMS_SNATCH_GIVER` |

## Warps (12)
- #0 (4,16) → `MAP_SS_TIDAL_CORRIDOR` warp #0
- #1 (5,16) → `MAP_SS_TIDAL_CORRIDOR` warp #0
- #2 (13,16) → `MAP_SS_TIDAL_CORRIDOR` warp #1
- #3 (14,16) → `MAP_SS_TIDAL_CORRIDOR` warp #1
- #4 (22,16) → `MAP_SS_TIDAL_CORRIDOR` warp #2
- #5 (23,16) → `MAP_SS_TIDAL_CORRIDOR` warp #2
- #6 (31,16) → `MAP_SS_TIDAL_CORRIDOR` warp #3
- #7 (32,16) → `MAP_SS_TIDAL_CORRIDOR` warp #3
- #8 (4,1) → `MAP_SS_TIDAL_CORRIDOR` warp #4
- #9 (13,1) → `MAP_SS_TIDAL_CORRIDOR` warp #5
- #10 (22,1) → `MAP_SS_TIDAL_CORRIDOR` warp #6
- #11 (31,1) → `MAP_SS_TIDAL_CORRIDOR` warp #7

## BG events / signs (2)
- (15,11) [sign] → `SSTidalRooms_EventScript_Bed`
- (15,12) [sign] → `SSTidalRooms_EventScript_Bed`

## Flags référencés (1)
- `FLAG_RECEIVED_TM_SNATCH`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_OutOfCenterPartyHeal`
- `SSTidalRooms_EventScript_ProgessCruiseAfterBed`

## Scripts (10)
### SSTidalRooms_EventScript_SnatchGiver
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_TM_SNATCH, SSTidalRooms_EventScript_ExplainSnatch
msgbox SSTidalRooms_Text_NotSuspiciousTakeThis, MSGBOX_DEFAULT
giveitem ITEM_TM_SNATCH
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_TM_SNATCH
msgbox SSTidalRooms_Text_ExplainSnatch, MSGBOX_DEFAULT
release
end
```
### SSTidalRooms_EventScript_ExplainSnatch
```
msgbox SSTidalRooms_Text_ExplainSnatch, MSGBOX_DEFAULT
release
end
```
### SSTidalRooms_EventScript_Bed
```
lockall
msgbox SSTidalRooms_Text_TakeRestOnBed, MSGBOX_DEFAULT
closemessage
call Common_EventScript_OutOfCenterPartyHeal
call SSTidalRooms_EventScript_ProgessCruiseAfterBed
releaseall
end
```
### SSTidalRooms_EventScript_Colton
```
trainerbattle_single TRAINER_COLTON, SSTidalRooms_Text_ColtonIntro, SSTidalRooms_Text_ColtonDefeat
msgbox SSTidalRooms_Text_ColtonPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalRooms_EventScript_Micah
```
trainerbattle_single TRAINER_MICAH, SSTidalRooms_Text_MicahIntro, SSTidalRooms_Text_MicahDefeat
msgbox SSTidalRooms_Text_MicahPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalRooms_EventScript_Thomas
```
trainerbattle_single TRAINER_THOMAS, SSTidalRooms_Text_ThomasIntro, SSTidalRooms_Text_ThomasDefeat
msgbox SSTidalRooms_Text_ThomasPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalRooms_EventScript_Jed
```
trainerbattle_double TRAINER_LEA_AND_JED, SSTidalRooms_Text_JedIntro, SSTidalRooms_Text_JedDefeat, SSTidalRooms_Text_JedNotEnoughMons
msgbox SSTidalRooms_Text_JedPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalRooms_EventScript_Lea
```
trainerbattle_double TRAINER_LEA_AND_JED, SSTidalRooms_Text_LeaIntro, SSTidalRooms_Text_LeaDefeat, SSTidalRooms_Text_LeaNotEnoughMons
msgbox SSTidalRooms_Text_LeaPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalRooms_EventScript_Garret
```
trainerbattle_single TRAINER_GARRET, SSTidalRooms_Text_GarretIntro, SSTidalRooms_Text_GarretDefeat
msgbox SSTidalRooms_Text_GarretPostBattle, MSGBOX_AUTOCLOSE
end
```
### SSTidalRooms_EventScript_Naomi
```
trainerbattle_single TRAINER_NAOMI, SSTidalRooms_Text_NaomiIntro, SSTidalRooms_Text_NaomiDefeat
msgbox SSTidalRooms_Text_NaomiPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (26)
### SSTidalRooms_Text_TakeRestOnBed
```
Ah, un lit!\nJe vais me reposer.$
```
### SSTidalRooms_Text_ColtonIntro
```
Je vais souvent à NENUCRIQUE.\pC'est parce que j'aime faire des\nCONCOURS POKéMON, tu vois.$
```
### SSTidalRooms_Text_ColtonDefeat
```
C'était un match très intéressant!$
```
### SSTidalRooms_Text_ColtonPostBattle
```
Je suis tout nerveux à l'idée de\ndécouvrir de nouveaux POKéMON pendant\lles CONCOURS. J'ai hâte d'y être!$
```
### SSTidalRooms_Text_MicahIntro
```
Tes amis sont-ils puissants?$
```
### SSTidalRooms_Text_MicahDefeat
```
Ah oui, tes amis sont puissants!$
```
### SSTidalRooms_Text_MicahPostBattle
```
Les amis ne sont pas forcément humains.\nMes POKéMON sont mes meilleurs amis!$
```
### SSTidalRooms_Text_ThomasIntro
```
Dis-moi…\nTu as frappé avant d'entrer?$
```
### SSTidalRooms_Text_ThomasDefeat
```
On doit accepter la défaite calmement,\nsans paniquer.$
```
### SSTidalRooms_Text_ThomasPostBattle
```
Un véritable GENTLEMAN ne doit jamais\ns'énerver, quelle que soit la situation.$
```
### SSTidalRooms_Text_JedIntro
```
ALI: Ça me gêne un peu, mais… On va\nte montrer le pouvoir de notre amour!$
```
### SSTidalRooms_Text_JedDefeat
```
ALI: Soupir…$
```
### SSTidalRooms_Text_JedPostBattle
```
ALI: C'est la première fois que le\npouvoir de notre amour n'est pas le\lplus fort! Tu es un DRESSEUR puissant!$
```
### SSTidalRooms_Text_JedNotEnoughMons
```
ALI: Tu n'as qu'un POKéMON?\nLa solitude ne te pèse pas trop?$
```
### SSTidalRooms_Text_LeaIntro
```
LISE: C'est un peu naïf, mais… On va\nte montrer le pouvoir de notre amour!$
```
### SSTidalRooms_Text_LeaDefeat
```
LISE: Ouin-ouin!$
```
### SSTidalRooms_Text_LeaPostBattle
```
LISE: Je n'y crois pas! Le pouvoir de\nnotre amour n'a pas été le plus fort…\pTu es un DRESSEUR très puissant!$
```
### SSTidalRooms_Text_LeaNotEnoughMons
```
LISE: Je voulais me battre…\nMais tu n'as même pas deux POKéMON…$
```
### SSTidalRooms_Text_GarretIntro
```
Ah, tu arrives à temps.\pJe m'ennuie terriblement, tu sais.\nTu vas me divertir.$
```
### SSTidalRooms_Text_GarretDefeat
```
Pfff… Tu m'as bien diverti.$
```
### SSTidalRooms_Text_GarretPostBattle
```
Je devrais peut-être demander à mon\npère de m'acheter un yacht.\pUn yacht rien que pour mes POKéMON\net moi!$
```
### SSTidalRooms_Text_NaomiIntro
```
Oh, quel DRESSEUR adorable tu es.\nVeux-tu prendre un thé?\pOu préfères-tu te battre?$
```
### SSTidalRooms_Text_NaomiDefeat
```
Je vois.\nTu es du genre entreprenant.$
```
### SSTidalRooms_Text_NaomiPostBattle
```
Une croisière autour du monde dans un\nyacht de luxe n'est pas sans charme…\pMais je dois bien avouer que voyager\ndans un ferry est plutôt plaisant.$
```
### SSTidalRooms_Text_NotSuspiciousTakeThis
```
Heu… Salut! Je… Non, je n'ai pas l'air\nsuspect! Hé… Tu veux ça? C'est gratuit!\pC'est… Je le jure, je ne l'ai pas volé!\nJe n'oserais jamais voler! SAISIE?\pNe crains rien! Tu peux t'en servir!$
```
### SSTidalRooms_Text_ExplainSnatch
```
SAISIE permet de voler l'attaque\nennemie et d'en obtenir les effets.$
```

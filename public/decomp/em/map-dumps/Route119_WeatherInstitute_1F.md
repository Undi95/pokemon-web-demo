# Route119_WeatherInstitute_1F

## Métadonnées
- **id** : `MAP_ROUTE119_WEATHER_INSTITUTE_1F`
- **layout** : `LAYOUT_ROUTE119_WEATHER_INSTITUTE_1F`
- **music** : `MUS_RUSTBORO`
- **region_map_section** : `MAPSEC_ROUTE_119`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 15,3 | `MOVEMENT_TYPE_FACE_LEFT` | `Route119_WeatherInstitute_1F_EventScript_Grunt1` | `FLAG_HIDE_ROUTE_119_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_AQUA_MEMBER_F` | 10,5 | `MOVEMENT_TYPE_FACE_DOWN` | `Route119_WeatherInstitute_1F_EventScript_Grunt4` | `FLAG_HIDE_ROUTE_119_TEAM_AQUA` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 5,4 | `MOVEMENT_TYPE_FACE_DOWN` | `Route119_WeatherInstitute_1F_EventScript_InstituteWorker2` | `FLAG_HIDE_WEATHER_INSTITUTE_1F_WORKERS` |
| `` | `OBJ_EVENT_GFX_MAN_4` | 2,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `Route119_WeatherInstitute_1F_EventScript_InstituteWorker1` | `FLAG_HIDE_WEATHER_INSTITUTE_1F_WORKERS` |
| `LOCALID_WEATHER_INSTITUTE_LITTLE_BOY` | `OBJ_EVENT_GFX_NINJA_BOY` | 14,11 | `MOVEMENT_TYPE_WANDER_AROUND` | `Route119_WeatherInstitute_1F_EventScript_LittleBoy` | `0` |

## Warps (3)
- #0 (9,12) → `MAP_ROUTE119` warp #0
- #1 (10,12) → `MAP_ROUTE119` warp #0
- #2 (17,1) → `MAP_ROUTE119_WEATHER_INSTITUTE_2F` warp #0

## BG events / signs (4)
- (1,2) [sign] → `Route119_WeatherInstitute_1F_EventScript_Bed`
- (1,3) [sign] → `Route119_WeatherInstitute_1F_EventScript_Bed`
- (0,2) [sign] → `Route119_WeatherInstitute_1F_EventScript_Bed`
- (0,3) [sign] → `Route119_WeatherInstitute_1F_EventScript_Bed`

## Flags référencés (3)
- `FLAG_DEFEATED_GROUDON`
- `FLAG_DEFEATED_KYOGRE`
- `FLAG_SYS_GAME_CLEAR`

## Variables référencées (2)
- `VAR_0x8004`
- `VAR_WEATHER_INSTITUTE_STATE`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `Common_EventScript_OutOfCenterPartyHeal`

## Scripts (12)
### Route119_WeatherInstitute_1F_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, Route119_WeatherInstitute_1F_OnTransition
```
### Route119_WeatherInstitute_1F_OnTransition
```
call_if_eq VAR_WEATHER_INSTITUTE_STATE, 0, Route119_WeatherInstitute_1F_EventScript_SetLittleBoyPos
end
```
### Route119_WeatherInstitute_1F_EventScript_SetLittleBoyPos
```
setobjectxyperm LOCALID_WEATHER_INSTITUTE_LITTLE_BOY, 0, 5
setobjectmovementtype LOCALID_WEATHER_INSTITUTE_LITTLE_BOY, MOVEMENT_TYPE_FACE_RIGHT
return
```
### Route119_WeatherInstitute_1F_EventScript_LittleBoy
```
lock
faceplayer
special GetPlayerBigGuyGirlString
goto_if_eq VAR_WEATHER_INSTITUTE_STATE, 0, Route119_WeatherInstitute_1F_EventScript_LittleBoyTeamAquaHere
msgbox Route119_WeatherInstitute_1F_Text_WowYoureStrong, MSGBOX_DEFAULT
release
end
```
### Route119_WeatherInstitute_1F_EventScript_LittleBoyTeamAquaHere
```
msgbox Route119_WeatherInstitute_1F_Text_EveryoneWentUpstairs, MSGBOX_DEFAULT
release
end
```
### Route119_WeatherInstitute_1F_EventScript_InstituteWorker1
```
lock
faceplayer
goto_if_unset FLAG_SYS_GAME_CLEAR, Route119_WeatherInstitute_1F_EventScript_StudyingRain
setvar VAR_0x8004, 0
call_if_set FLAG_DEFEATED_KYOGRE, Route119_WeatherInstitute_1F_EventScript_LegendaryDefeated
call_if_set FLAG_DEFEATED_GROUDON, Route119_WeatherInstitute_1F_EventScript_LegendaryDefeated
goto_if_eq VAR_0x8004, 2, Route119_WeatherInstitute_1F_EventScript_StudyingRain  @ Both defeated
msgbox Route119_WeatherInstitute_1F_Text_NoticingAbnormalWeather, MSGBOX_DEFAULT
release
end
```
### Route119_WeatherInstitute_1F_EventScript_LegendaryDefeated
```
addvar VAR_0x8004, 1
return
```
### Route119_WeatherInstitute_1F_EventScript_StudyingRain
```
msgbox Route119_WeatherInstitute_1F_Text_ProfStudyingRain, MSGBOX_DEFAULT
release
end
```
### Route119_WeatherInstitute_1F_EventScript_InstituteWorker2
```
msgbox Route119_WeatherInstitute_1F_Text_WhatWereAquasUpTo, MSGBOX_NPC
end
```
### Route119_WeatherInstitute_1F_EventScript_Bed
```
lockall
msgbox Route119_WeatherInstitute_1F_Text_TakeRestInBed, MSGBOX_DEFAULT
closemessage
call Common_EventScript_OutOfCenterPartyHeal
releaseall
end
```
### Route119_WeatherInstitute_1F_EventScript_Grunt1
```
trainerbattle_single TRAINER_GRUNT_WEATHER_INST_1, Route119_WeatherInstitute_1F_Text_Grunt1Intro, Route119_WeatherInstitute_1F_Text_Grunt1Defeat
msgbox Route119_WeatherInstitute_1F_Text_Grunt1PostBattle, MSGBOX_AUTOCLOSE
end
```
### Route119_WeatherInstitute_1F_EventScript_Grunt4
```
trainerbattle_single TRAINER_GRUNT_WEATHER_INST_4, Route119_WeatherInstitute_1F_Text_Grunt4Intro, Route119_WeatherInstitute_1F_Text_Grunt4Defeat
msgbox Route119_WeatherInstitute_1F_Text_Grunt4PostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (12)
### Route119_WeatherInstitute_1F_Text_Grunt1Intro
```
Le CHEF s'intéresse aux recherches\nqu'ils font ici.\lC'est pour ça qu'il nous envoie.\pOccupe-toi de tes oignons!$
```
### Route119_WeatherInstitute_1F_Text_Grunt1Defeat
```
Quelle humiliation!\nSe faire battre par un gosse…$
```
### Route119_WeatherInstitute_1F_Text_Grunt1PostBattle
```
Notre CHEF sait tout.\pMais je ne suis qu'un SBIRE. Je n'ai\naucune idée de ce qu'il prépare!$
```
### Route119_WeatherInstitute_1F_Text_Grunt4Intro
```
Hein?\nQu'est-ce que ce môme fait ici?$
```
### Route119_WeatherInstitute_1F_Text_Grunt4Defeat
```
Hein?\nJ'ai perdu?!?$
```
### Route119_WeatherInstitute_1F_Text_Grunt4PostBattle
```
Oh, non… J'ai perdu contre un môme.\nJe vais me prendre un de ces savons…\pJe vais aller me reposer…$
```
### Route119_WeatherInstitute_1F_Text_EveryoneWentUpstairs
```
Tout le monde est monté à l'étage\npendant que je dormais!$
```
### Route119_WeatherInstitute_1F_Text_WowYoureStrong
```
Ouah, tu es super balèze!\pJ'aimerais devenir un DRESSEUR DE\nPOKéMON comme toi!$
```
### Route119_WeatherInstitute_1F_Text_ProfStudyingRain
```
Le PROFESSEUR adore la pluie.\nC'est indéniable.\pMais s'il continue de pleuvoir, les gens\nauront des ennuis.\pÇa aussi, c'est indéniable.\pLe PROFESSEUR étudie donc la pluie\npour savoir si elle peut être bénéfique.$
```
### Route119_WeatherInstitute_1F_Text_NoticingAbnormalWeather
```
Au premier étage du CENTRE, nous\nétudions les conditions météo dans la\lrégion de HOENN.\pNous avons observé récemment des\npériodes de sécheresse brèves et\lisolées suivies de fortes pluies…$
```
### Route119_WeatherInstitute_1F_Text_WhatWereAquasUpTo
```
Bonjour!\nTes actions nous ont sauvés!\pMais je ne comprends pas ce que\nla TEAM AQUA vient faire là-dedans.$
```
### Route119_WeatherInstitute_1F_Text_TakeRestInBed
```
Il y a un lit…\nJe vais me reposer.$
```

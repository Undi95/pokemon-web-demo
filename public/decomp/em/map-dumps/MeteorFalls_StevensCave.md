# MeteorFalls_StevensCave

## Métadonnées
- **id** : `MAP_METEOR_FALLS_STEVENS_CAVE`
- **layout** : `LAYOUT_METEOR_FALLS_STEVENS_CAVE`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_METEOR_FALLS`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_METEOR_FALLS_STEVEN` | `OBJ_EVENT_GFX_STEVEN` | 19,3 | `MOVEMENT_TYPE_FACE_UP` | `MeteorFalls_StevensCave_EventScript_Steven` | `0` |

## Warps (1)
- #0 (10,29) → `MAP_METEOR_FALLS_1F_1R` warp #5

## Flags référencés (1)
- `FLAG_DEFEATED_METEOR_FALLS_STEVEN`

## Scripts (2)
### MeteorFalls_StevensCave_EventScript_Steven
```
lock
goto_if_set FLAG_DEFEATED_METEOR_FALLS_STEVEN, MeteorFalls_StevensCave_EventScript_Defeated
waitse
playse SE_PIN
applymovement LOCALID_METEOR_FALLS_STEVEN, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_METEOR_FALLS_STEVEN, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_METEOR_FALLS_STEVEN, Common_Movement_FacePlayer
waitmovement 0
msgbox MeteorFalls_StevensCave_Text_ShouldKnowHowGoodIAmExpectWorst, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_STEVEN, MeteorFalls_StevensCave_Text_StevenDefeat
msgbox MeteorFalls_StevensCave_Text_MyPredictionCameTrue, MSGBOX_DEFAULT
setflag FLAG_DEFEATED_METEOR_FALLS_STEVEN
release
end
```
### MeteorFalls_StevensCave_EventScript_Defeated
```
applymovement LOCALID_METEOR_FALLS_STEVEN, Common_Movement_FacePlayer
waitmovement 0
msgbox MeteorFalls_StevensCave_Text_MyPredictionCameTrue, MSGBOX_DEFAULT
release
end
```

## Textes (3)
### MeteorFalls_StevensCave_Text_ShouldKnowHowGoodIAmExpectWorst
```
PIERRE: Oh, waouh, {PLAYER}{KUN}. Je suis\nsurpris que tu aies su où me trouver.\pEst-ce que… tu me considères juste\ncomme un maniaque du type ROCHE?\pNon, je ne pense pas…\pNous nous sommes battus côte à côte\nau CENTRE SPATIAL d'ALGATIA.\pTu dois savoir mieux que quiconque de\nquelle façon je me bats.\pOK, {PLAYER}{KUN}, si tu cherches un vrai défi,\nje suis ton homme!$
```
### MeteorFalls_StevensCave_Text_StevenDefeat
```
Toi… Je ne pensais pas que tu\navais progressé à ce point…$
```
### MeteorFalls_StevensCave_Text_MyPredictionCameTrue
```
PIERRE: En y repensant, j'en avais eu la\ncertitude lors de notre première\prencontre à la GROTTE GRANITE\ndu VILLAGE MYOKARA.\pMa première impression est souvent la\nbonne.\pEt où veux-tu te rendre?\p… … … … … …\n… … … … … …\pPfiuu, même moi, je n'aurais pas\npu deviner ça.$
```

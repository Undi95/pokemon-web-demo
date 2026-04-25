# LilycoveCity_CoveLilyMotel_1F

## Métadonnées
- **id** : `MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_1F`
- **layout** : `LAYOUT_LILYCOVE_CITY_COVE_LILY_MOTEL_1F`
- **music** : `MUS_LILYCOVE`
- **region_map_section** : `MAPSEC_LILYCOVE_CITY`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (1 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MOTEL_OWNER` | `OBJ_EVENT_GFX_MAN_1` | 10,3 | `MOVEMENT_TYPE_FACE_UP` | `LilycoveCity_CoveLilyMotel_1F_EventScript_MotelOwner` | `0` |

## Warps (3)
- #0 (5,8) → `MAP_LILYCOVE_CITY` warp #1
- #1 (6,8) → `MAP_LILYCOVE_CITY` warp #1
- #2 (2,1) → `MAP_LILYCOVE_CITY_COVE_LILY_MOTEL_2F` warp #0

## Coord events / triggers (1)
- (10,2) → `LilycoveCity_CoveLilyMotel_1F_EventScript_BlockingTV` (si `VAR_TEMP_1` == `0`)

## Flags référencés (2)
- `FLAG_BADGE07_GET`
- `FLAG_SYS_GAME_CLEAR`

## Scripts (7)
### LilycoveCity_CoveLilyMotel_1F_EventScript_MotelOwner
```
lockall
goto_if_set FLAG_SYS_GAME_CLEAR, LilycoveCity_CoveLilyMotel_1F_EventScript_GameClear
goto_if_set FLAG_BADGE07_GET, LilycoveCity_CoveLilyMotel_1F_EventScript_AquaHideoutBusted
msgbox LilycoveCity_CoveLilyMotel_1F_Text_GuestsDoubledByMascot, MSGBOX_DEFAULT
applymovement LOCALID_MOTEL_OWNER, Common_Movement_FacePlayer
waitmovement 0
msgbox LilycoveCity_CoveLilyMotel_1F_Text_NoGuestsWithTeamAqua, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MOTEL_OWNER, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### LilycoveCity_CoveLilyMotel_1F_EventScript_AquaHideoutBusted
```
msgbox LilycoveCity_CoveLilyMotel_1F_Text_MonFoundLostItem, MSGBOX_DEFAULT
applymovement LOCALID_MOTEL_OWNER, Common_Movement_FacePlayer
waitmovement 0
msgbox LilycoveCity_CoveLilyMotel_1F_Text_HeardAquaHideoutBusted, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MOTEL_OWNER, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### LilycoveCity_CoveLilyMotel_1F_EventScript_GameClear
```
msgbox LilycoveCity_CoveLilyMotel_1F_Text_HouseSittingMonCaughtBurglar, MSGBOX_DEFAULT
applymovement LOCALID_MOTEL_OWNER, Common_Movement_FacePlayer
waitmovement 0
msgbox LilycoveCity_CoveLilyMotel_1F_Text_BetterGetWorkingOnGuestsDinner, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_MOTEL_OWNER, Common_Movement_FaceOriginalDirection
waitmovement 0
releaseall
end
```
### LilycoveCity_CoveLilyMotel_1F_EventScript_BlockingTV
```
lockall
playse SE_PIN
applymovement LOCALID_MOTEL_OWNER, Common_Movement_ExclamationMark
waitmovement 0
applymovement LOCALID_MOTEL_OWNER, Common_Movement_Delay48
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox LilycoveCity_CoveLilyMotel_1F_Text_CantSeeTheTV, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, LilycoveCity_CoveLilyMotel_1F_Movement_PlayerPushFromTV
applymovement LOCALID_MOTEL_OWNER, LilycoveCity_CoveLilyMotel_1F_Movement_OwnerPushPlayer
waitmovement 0
applymovement LOCALID_MOTEL_OWNER, LilycoveCity_CoveLilyMotel_1F_Movement_OwnerReturn
waitmovement 0
release
end
```
### LilycoveCity_CoveLilyMotel_1F_Movement_PlayerPushFromTV
```
face_right
lock_facing_direction
walk_left
unlock_facing_direction
step_end
```
### LilycoveCity_CoveLilyMotel_1F_Movement_OwnerPushPlayer
```
walk_up
step_end
```
### LilycoveCity_CoveLilyMotel_1F_Movement_OwnerReturn
```
face_down
walk_down
face_up
step_end
```

## Textes (7)
### LilycoveCity_CoveLilyMotel_1F_Text_GuestsDoubledByMascot
```
Hum… Ils ont doublé leur clientèle en\nfaisant des POKéMON une attraction?\pJe devrais peut-être prendre un\nPOKéMON gracieux comme mascotte\lpour notre auberge.\pJe me demande si ça attirera plus\nde monde chez nous.$
```
### LilycoveCity_CoveLilyMotel_1F_Text_NoGuestsWithTeamAqua
```
Oh, pardon! Désolé!\nJ'étais trop absorbé par la télé!\pDepuis que la TEAM AQUA a débarqué en\nville, les touristes n'approchent plus.$
```
### LilycoveCity_CoveLilyMotel_1F_Text_CantSeeTheTV
```
Hé, faut pas rester là!\nJ'vois pas la télé!$
```
### LilycoveCity_CoveLilyMotel_1F_Text_MonFoundLostItem
```
Etonnant! Tu veux dire qu'un POKéMON\na trouvé un objet perdu par quelqu'un?\pÇa par exemple! Si on avait un POKéMON\naussi intelligent que ça…\pOn pourrait retrouver tout ce que nos\nclients perdent…$
```
### LilycoveCity_CoveLilyMotel_1F_Text_HeardAquaHideoutBusted
```
Oh, pardon! Désolé!\nJ'étais absorbé par la télé!\pJ'ai entendu dire que quelqu'un avait\ndébusqué la PLANQUE AQUA.\pGrâce à ça, on vient juste de faire une\nréservation pour tout un groupe.\pC'était une entreprise nommée… hum…\nGAME quelque chose…$
```
### LilycoveCity_CoveLilyMotel_1F_Text_HouseSittingMonCaughtBurglar
```
Etonnant! Un POKéMON de garde a\nattrapé un voleur?\pÇa alors! Si on avait un POKéMON aussi\nrobuste pour monter la garde…\pOn aimerait pouvoir garantir une\ntotale sécurité à notre clientèle.$
```
### LilycoveCity_CoveLilyMotel_1F_Text_BetterGetWorkingOnGuestsDinner
```
Oh, pardon! Désolé!\nJ'étais absorbé par la télé!\pOh, oui. Un grand groupe de clients\nest arrivé il y a peu.\pIls ont réservé sous le nom de GAME\nFREAK. Je suppose qu'ils font des jeux.\pOh, je ferais mieux de m'occuper\nde leur dîner!$
```

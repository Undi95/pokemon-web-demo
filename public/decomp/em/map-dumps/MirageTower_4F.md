# MirageTower_4F

## Métadonnées
- **id** : `MAP_MIRAGE_TOWER_4F`
- **layout** : `LAYOUT_MIRAGE_TOWER_4F`
- **music** : `MUS_MT_CHIMNEY`
- **region_map_section** : `MAPSEC_MIRAGE_TOWER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MIRAGE_ROOT_FOSSIL` | `OBJ_EVENT_GFX_FOSSIL` | 5,4 | `MOVEMENT_TYPE_FACE_DOWN` | `MirageTower_4F_EventScript_RootFossil` | `FLAG_HIDE_MIRAGE_TOWER_ROOT_FOSSIL` |
| `LOCALID_MIRAGE_CLAW_FOSSIL` | `OBJ_EVENT_GFX_FOSSIL` | 7,4 | `MOVEMENT_TYPE_FACE_DOWN` | `MirageTower_4F_EventScript_ClawFossil` | `FLAG_HIDE_MIRAGE_TOWER_CLAW_FOSSIL` |
| `` | `OBJ_EVENT_GFX_BREAKABLE_ROCK` | 6,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_RockSmash` | `FLAG_TEMP_11` |

## Warps (1)
- #0 (1,4) → `MAP_MIRAGE_TOWER_3F` warp #1

## Flags référencés (5)
- `FLAG_CHOSE_CLAW_FOSSIL`
- `FLAG_CHOSE_ROOT_FOSSIL`
- `FLAG_HIDE_MIRAGE_TOWER_CLAW_FOSSIL`
- `FLAG_HIDE_MIRAGE_TOWER_ROOT_FOSSIL`
- `FLAG_LANDMARK_MIRAGE_TOWER`

## Variables référencées (6)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_MIRAGE_TOWER_STATE`
- `VAR_RESULT`

## Scripts (5)
### MirageTower_4F_EventScript_RootFossil
```
lock
faceplayer
msgbox MirageTower_4F_Text_TakeRootFossil, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MirageTower_4F_EventScript_LeaveRootFossil
giveitem ITEM_ROOT_FOSSIL
closemessage
setflag FLAG_HIDE_MIRAGE_TOWER_ROOT_FOSSIL
setflag FLAG_HIDE_MIRAGE_TOWER_CLAW_FOSSIL
removeobject LOCALID_MIRAGE_ROOT_FOSSIL
delay 30
setflag FLAG_CHOSE_ROOT_FOSSIL
goto MirageTower_4F_EventScript_CollapseMirageTower
end
```
### MirageTower_4F_EventScript_LeaveRootFossil
```
msgbox MirageTower_4F_Text_LeftRootFossilAlone, MSGBOX_DEFAULT
release
end
```
### MirageTower_4F_EventScript_ClawFossil
```
lock
faceplayer
msgbox MirageTower_4F_Text_TakeClawFossil, MSGBOX_YESNO
goto_if_eq VAR_RESULT, NO, MirageTower_4F_EventScript_LeaveClawFossil
giveitem ITEM_CLAW_FOSSIL
closemessage
setflag FLAG_HIDE_MIRAGE_TOWER_CLAW_FOSSIL
setflag FLAG_HIDE_MIRAGE_TOWER_ROOT_FOSSIL
removeobject LOCALID_MIRAGE_CLAW_FOSSIL
delay 30
setflag FLAG_CHOSE_CLAW_FOSSIL
goto MirageTower_4F_EventScript_CollapseMirageTower
end
```
### MirageTower_4F_EventScript_LeaveClawFossil
```
msgbox MirageTower_4F_Text_LeaveClawFossilAlone, MSGBOX_DEFAULT
release
end
```
### MirageTower_4F_EventScript_CollapseMirageTower
```
setvar VAR_0x8004, 1   @ vertical pan
setvar VAR_0x8005, 1   @ horizontal pan
setvar VAR_0x8006, 32  @ num shakes
setvar VAR_0x8007, 2   @ shake delay
special ShakeCamera
waitstate
special DoMirageTowerCeilingCrumble
setvar VAR_MIRAGE_TOWER_STATE, 1
clearflag FLAG_LANDMARK_MIRAGE_TOWER
warp MAP_ROUTE111, 19, 59
waitstate
release
end
```

## Textes (4)
### MirageTower_4F_Text_TakeRootFossil
```
Tu as trouvé le FOSS. RACINE.\pSi ce FOSSILE est retiré, le sol autour\ns'enfoncera sûrement…\pPrendre le FOSS. RACINE quand même?$
```
### MirageTower_4F_Text_LeftRootFossilAlone
```
{PLAYER} laisse le FOSS. RACINE en place.$
```
### MirageTower_4F_Text_TakeClawFossil
```
Tu as trouvé le FOSS. GRIFFE.\pSi ce FOSSILE est retiré, le sol autour\ns'enfoncera sûrement…\pPrendre le FOSS. GRIFFE quand même?$
```
### MirageTower_4F_Text_LeaveClawFossilAlone
```
{PLAYER} laisse le FOSS. GRIFFE en place.$
```

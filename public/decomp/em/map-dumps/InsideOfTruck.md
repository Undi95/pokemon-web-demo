# InsideOfTruck

## Métadonnées
- **id** : `MAP_INSIDE_OF_TRUCK`
- **layout** : `LAYOUT_INSIDE_OF_TRUCK`
- **music** : `MUS_NONE`
- **region_map_section** : `MAPSEC_INSIDE_OF_TRUCK`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_TRUCK_BOX_TOP` | `OBJ_EVENT_GFX_MOVING_BOX` | 0,0 | `MOVEMENT_TYPE_FACE_DOWN` | `InsideOfTruck_EventScript_MovingBox` | `0` |
| `LOCALID_TRUCK_BOX_BOTTOM_L` | `OBJ_EVENT_GFX_MOVING_BOX` | 0,3 | `MOVEMENT_TYPE_FACE_DOWN` | `InsideOfTruck_EventScript_MovingBox` | `0` |
| `LOCALID_TRUCK_BOX_BOTTOM_R` | `OBJ_EVENT_GFX_MOVING_BOX` | 2,3 | `MOVEMENT_TYPE_FACE_DOWN` | `InsideOfTruck_EventScript_MovingBox` | `0` |

## Warps (3)
- #0 (4,1) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #1 (4,2) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC
- #2 (4,3) → `MAP_DYNAMIC` warp #WARP_ID_DYNAMIC

## Coord events / triggers (3)
- (3,1) → `InsideOfTruck_EventScript_SetIntroFlags` (si `VAR_LITTLEROOT_INTRO_STATE` == `0`)
- (3,2) → `InsideOfTruck_EventScript_SetIntroFlags` (si `VAR_LITTLEROOT_INTRO_STATE` == `0`)
- (3,3) → `InsideOfTruck_EventScript_SetIntroFlags` (si `VAR_LITTLEROOT_INTRO_STATE` == `0`)

## BG events / signs (5)
- (1,0) [sign] → `InsideOfTruck_EventScript_MovingBox`
- (3,4) [sign] → `InsideOfTruck_EventScript_MovingBox`
- (2,3) [sign] → `InsideOfTruck_EventScript_MovingBox`
- (0,1) [sign] → `InsideOfTruck_EventScript_MovingBox`
- (0,2) [sign] → `InsideOfTruck_EventScript_MovingBox`

## Flags référencés (11)
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_MOM`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING`
- `FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_MOM`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_SIBLING`
- `FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK`
- `FLAG_HIDE_MAP_NAME_POPUP`

## Variables référencées (4)
- `VAR_LITTLEROOT_HOUSES_STATE_BRENDAN`
- `VAR_LITTLEROOT_HOUSES_STATE_MAY`
- `VAR_LITTLEROOT_INTRO_STATE`
- `VAR_RESULT`

## Scripts (7)
### InsideOfTruck_MapScripts
```
map_script MAP_SCRIPT_ON_LOAD, InsideOfTruck_OnLoad
map_script MAP_SCRIPT_ON_RESUME, InsideOfTruck_OnResume
```
### InsideOfTruck_OnLoad
```
setmetatile 4, 1, METATILE_InsideOfTruck_ExitLight_Top, FALSE
setmetatile 4, 2, METATILE_InsideOfTruck_ExitLight_Mid, FALSE
setmetatile 4, 3, METATILE_InsideOfTruck_ExitLight_Bottom, FALSE
end
```
### InsideOfTruck_OnResume
```
setstepcallback STEP_CB_TRUCK
end
```
### InsideOfTruck_EventScript_SetIntroFlags
```
lockall
setflag FLAG_HIDE_MAP_NAME_POPUP
checkplayergender
goto_if_eq VAR_RESULT, MALE, InsideOfTruck_EventScript_SetIntroFlagsMale
goto_if_eq VAR_RESULT, FEMALE, InsideOfTruck_EventScript_SetIntroFlagsFemale
end
```
### InsideOfTruck_EventScript_SetIntroFlagsMale
```
setrespawn HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F
setvar VAR_LITTLEROOT_INTRO_STATE, 1
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL
setvar VAR_LITTLEROOT_HOUSES_STATE_BRENDAN, 1
setdynamicwarp MAP_LITTLEROOT_TOWN, 3, 10
releaseall
end
```
### InsideOfTruck_EventScript_SetIntroFlagsFemale
```
setrespawn HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F
setvar VAR_LITTLEROOT_INTRO_STATE, 2
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_MOM
setflag FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_MOM
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_SIBLING
setflag FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL
setvar VAR_LITTLEROOT_HOUSES_STATE_MAY, 1
setdynamicwarp MAP_LITTLEROOT_TOWN, 12, 10
releaseall
end
```
### InsideOfTruck_EventScript_MovingBox
```
msgbox InsideOfTruck_Text_BoxPrintedWithMonLogo, MSGBOX_SIGN
end
```

## Textes (1)
### InsideOfTruck_Text_BoxPrintedWithMonLogo
```
Un logo POKéMON se trouve sur le\ncarton.\pIl vient d'une société de déménagement\net de livraison POKéMON.$
```

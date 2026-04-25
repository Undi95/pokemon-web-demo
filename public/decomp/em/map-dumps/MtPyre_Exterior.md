# MtPyre_Exterior

## Métadonnées
- **id** : `MAP_MT_PYRE_EXTERIOR`
- **layout** : `LAYOUT_MT_PYRE_EXTERIOR`
- **music** : `MUS_MT_PYRE_EXTERIOR`
- **region_map_section** : `MAPSEC_MT_PYRE`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (2 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 27,15 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_Exterior_EventScript_ItemMaxPotion` | `FLAG_ITEM_MT_PYRE_EXTERIOR_MAX_POTION` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 19,40 | `MOVEMENT_TYPE_LOOK_AROUND` | `MtPyre_Exterior_EventScript_ItemTMSkillSwap` | `FLAG_ITEM_MT_PYRE_EXTERIOR_TM_SKILL_SWAP` |

## Warps (3)
- #0 (10,42) → `MAP_MT_PYRE_1F` warp #1
- #1 (19,10) → `MAP_MT_PYRE_SUMMIT` warp #1
- #2 (20,10) → `MAP_MT_PYRE_SUMMIT` warp #1

## Coord events / triggers (5)
- (24,21) → `MtPyre_Exterior_EventScript_FogTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (25,21) → `MtPyre_Exterior_EventScript_FogTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (22,27) → `MtPyre_Exterior_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (23,28) → `MtPyre_Exterior_EventScript_SunTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)
- (26,21) → `MtPyre_Exterior_EventScript_FogTrigger` (si `TRIGGER_RUN_IMMEDIATELY` == `0`)

## BG events / signs (2)
- (9,8) [hidden_item] → ``
- (16,22) [hidden_item] → ``

## Variables référencées (2)
- `VAR_TEMP_0`
- `VAR_TEMP_1`

## Scripts (6)
### MtPyre_Exterior_MapScripts
```
map_script MAP_SCRIPT_ON_TRANSITION, MtPyre_Exterior_OnTransition
```
### MtPyre_Exterior_OnTransition
```
call MtPyre_Exterior_EventScript_CheckEnterFromSummit
end
```
### MtPyre_Exterior_EventScript_CheckEnterFromSummit
```
getplayerxy VAR_TEMP_0, VAR_TEMP_1
goto_if_lt VAR_TEMP_1, 12, MtPyre_Exterior_EventScript_EnterFromSummit
return
```
### MtPyre_Exterior_EventScript_EnterFromSummit
```
setweather WEATHER_FOG_HORIZONTAL
return
```
### MtPyre_Exterior_EventScript_FogTrigger
```
setweather WEATHER_FOG_HORIZONTAL
doweather
end
```
### MtPyre_Exterior_EventScript_SunTrigger
```
setweather WEATHER_SUNNY
doweather
end
```

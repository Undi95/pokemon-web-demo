# BattleFrontier_Mart

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_MART`
- **layout** : `LAYOUT_MART`
- **music** : `MUS_POKE_MART`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (4 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_FRONTIER_MART_CLERK` | `OBJ_EVENT_GFX_MART_EMPLOYEE` | 1,3 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Mart_EventScript_Clerk` | `0` |
| `LOCALID_FRONTIER_MART_OLD_WOMAN` | `OBJ_EVENT_GFX_OLD_WOMAN` | 5,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Mart_EventScript_OldWoman` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 5,5 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Mart_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 8,4 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Mart_EventScript_Boy` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #4
- #1 (4,7) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #4

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (5)
### BattleFrontier_Mart_EventScript_Clerk
```
lock
faceplayer
message gText_HowMayIServeYou
waitmessage
pokemart BattleFrontier_Mart_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Mart_Pokemart
```
pokemartlistend
```
### BattleFrontier_Mart_EventScript_OldMan
```
msgbox BattleFrontier_Mart_Text_ChaperonGrandson, MSGBOX_NPC
end
```
### BattleFrontier_Mart_EventScript_OldWoman
```
lock
applymovement LOCALID_FRONTIER_MART_OLD_WOMAN, Common_Movement_FaceDown
waitmovement 0
msgbox BattleFrontier_Mart_Text_ProteinMakeNiceGift, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Mart_EventScript_Boy
```
msgbox BattleFrontier_Mart_Text_FacilitiesDontAllowItems, MSGBOX_NPC
end
```

## Textes (3)
### BattleFrontier_Mart_Text_ChaperonGrandson
```
Nous sommes venus accompagner\nnotre petit-fils.\pOn en profite pour acheter quelques\nsouvenirs.$
```
### BattleFrontier_Mart_Text_ProteinMakeNiceGift
```
Que penses-tu de ça, chéri?\nÇa ferait un joli cadeau, non?\pPRO… TE… INE?\nÇa m'a l'air d'être délicieux!$
```
### BattleFrontier_Mart_Text_FacilitiesDontAllowItems
```
Dans la ZONE DE COMBAT, on n'a pas\ntoujours le droit d'utiliser des objets\len combat.\pÇa rend les choses encore plus\ndifficiles!$
```

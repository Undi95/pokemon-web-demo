# LavaridgeTown_HerbShop

## Métadonnées
- **id** : `MAP_LAVARIDGE_TOWN_HERB_SHOP`
- **layout** : `LAYOUT_LAVARIDGE_TOWN_HERB_SHOP`
- **music** : `MUS_OLDALE`
- **region_map_section** : `MAPSEC_LAVARIDGE_TOWN`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_WOMAN_2` | 3,2 | `MOVEMENT_TYPE_FACE_DOWN` | `LavaridgeTown_HerbShop_EventScript_Clerk` | `0` |
| `` | `OBJ_EVENT_GFX_OLD_MAN` | 7,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `LavaridgeTown_HerbShop_EventScript_OldMan` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 9,3 | `MOVEMENT_TYPE_WANDER_LEFT_AND_RIGHT` | `LavaridgeTown_HerbShop_EventScript_ExpertM` | `0` |

## Warps (2)
- #0 (3,7) → `MAP_LAVARIDGE_TOWN` warp #0
- #1 (4,7) → `MAP_LAVARIDGE_TOWN` warp #0

## Flags référencés (1)
- `FLAG_RECEIVED_CHARCOAL`

## Variables référencées (1)
- `VAR_RESULT`

## Labels externes appelés (résolus via _common.json ou orphelins)
### UNRESOLVED
- `gText_PleaseComeAgain`

## Scripts (5)
### LavaridgeTown_HerbShop_EventScript_Clerk
```
lock
faceplayer
message LavaridgeTown_HerbShop_Text_WelcomeToHerbShop
waitmessage
pokemart LavaridgeTown_HerbShop_Pokemart
msgbox gText_PleaseComeAgain, MSGBOX_DEFAULT
release
end
```
### LavaridgeTown_HerbShop_Pokemart
```
pokemartlistend
```
### LavaridgeTown_HerbShop_EventScript_ExpertM
```
msgbox LavaridgeTown_HerbShop_Text_HerbalMedicineWorksButMonWillDislike, MSGBOX_NPC
end
```
### LavaridgeTown_HerbShop_EventScript_OldMan
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_CHARCOAL, LavaridgeTown_HerbShop_EventScript_ExplainCharcoal
msgbox LavaridgeTown_HerbShop_Text_YouveComeToLookAtHerbalMedicine, MSGBOX_DEFAULT
giveitem ITEM_CHARCOAL
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_CHARCOAL
release
end
```
### LavaridgeTown_HerbShop_EventScript_ExplainCharcoal
```
msgbox LavaridgeTown_HerbShop_Text_ExplainCharcoal, MSGBOX_DEFAULT
release
end
```

## Textes (4)
### LavaridgeTown_HerbShop_Text_WelcomeToHerbShop
```
Bienvenue à l'HERBORISTERIE, la maison\ndes médicaments efficaces à bas prix!$
```
### LavaridgeTown_HerbShop_Text_YouveComeToLookAtHerbalMedicine
```
Tu viens chercher des médicaments\nà base de plantes à VERMILAVA?\pC'est très honorable.\pJe t'aime bien! Prends ça!$
```
### LavaridgeTown_HerbShop_Text_ExplainCharcoal
```
Le CHARBON que je t'ai donné est utilisé\npour faire des médicaments naturels.\pIl fait aussi des merveilles lorsqu'il\nest tenu par un POKéMON.\pIl augmente la puissance des attaques\nde type FEU.$
```
### LavaridgeTown_HerbShop_Text_HerbalMedicineWorksButMonWillDislike
```
La médecine à base de plantes est\nextrêmement efficace. Mais tes POKéMON\prisquent de ne pas apprécier.\nLes médicaments sont très amers!$
```

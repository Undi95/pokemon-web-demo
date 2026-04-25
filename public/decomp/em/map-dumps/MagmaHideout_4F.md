# MagmaHideout_4F

## Métadonnées
- **id** : `MAP_MAGMA_HIDEOUT_4F`
- **layout** : `LAYOUT_MAGMA_HIDEOUT_4F`
- **music** : `MUS_AQUA_MAGMA_HIDEOUT`
- **region_map_section** : `MAPSEC_MAGMA_HIDEOUT`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (8 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `LOCALID_MAGMA_HIDEOUT_4F_GROUDON` | `OBJ_EVENT_GFX_GROUDON_FRONT` | 16,17 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_MAGMA_HIDEOUT_4F_GROUDON` |
| `LOCALID_MAGMA_HIDEOUT_4F_GRUNT_1` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 31,22 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_4F_EventScript_Grunt11` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `LOCALID_MAGMA_HIDEOUT_4F_GRUNT_2` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 30,13 | `MOVEMENT_TYPE_FACE_LEFT` | `MagmaHideout_4F_EventScript_Grunt12` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `LOCALID_MAGMA_HIDEOUT_4F_GRUNT_3` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 26,13 | `MOVEMENT_TYPE_FACE_RIGHT` | `MagmaHideout_4F_EventScript_Grunt13` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `LOCALID_MAGMA_HIDEOUT_4F_TABITHA` | `OBJ_EVENT_GFX_MAGMA_MEMBER_M` | 22,4 | `MOVEMENT_TYPE_FACE_DOWN` | `MagmaHideout_4F_EventScript_Tabitha` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `LOCALID_MAGMA_HIDEOUT_4F_MAXIE` | `OBJ_EVENT_GFX_MAXIE` | 16,21 | `MOVEMENT_TYPE_FACE_UP` | `MagmaHideout_4F_EventScript_Maxie` | `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS` |
| `LOCALID_MAGMA_HIDEOUT_4F_GROUDON_SLEEPING` | `OBJ_EVENT_GFX_GROUDON_ASLEEP` | 16,17 | `MOVEMENT_TYPE_FACE_DOWN` | `0x0` | `FLAG_HIDE_MAGMA_HIDEOUT_4F_GROUDON_ASLEEP` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 3,7 | `MOVEMENT_TYPE_LOOK_AROUND` | `MagmaHideout_4F_EventScript_ItemMaxRevive` | `FLAG_ITEM_MAGMA_HIDEOUT_4F_MAX_REVIVE` |

## Warps (2)
- #0 (46,7) → `MAP_MAGMA_HIDEOUT_3F_1R` warp #0
- #1 (20,21) → `MAP_MAGMA_HIDEOUT_3F_3R` warp #1

## Flags référencés (4)
- `FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT`
- `FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS`
- `FLAG_HIDE_SLATEPORT_CITY_CAPTAIN_STERN`
- `FLAG_HIDE_SLATEPORT_CITY_GABBY_AND_TY`

## Variables référencées (7)
- `VAR_0x8004`
- `VAR_0x8005`
- `VAR_0x8006`
- `VAR_0x8007`
- `VAR_RESULT`
- `VAR_SLATEPORT_CITY_STATE`
- `VAR_SLATEPORT_HARBOR_STATE`

## Scripts (8)
### MagmaHideout_4F_EventScript_Maxie
```
lockall
playbgm MUS_ENCOUNTER_MAGMA, FALSE
msgbox MagmaHideout_4F_Text_MaxieAwakenGroudon, MSGBOX_DEFAULT
closemessage
delay 20
setvar VAR_RESULT, 1
playse SE_M_DETECT
dofieldeffectsparkle 18, 42, 0
waitfieldeffect FLDEFF_SPARKLE
setvar VAR_RESULT, 1
playfanfare MUS_AWAKEN_LEGEND
playse SE_ORB
special DoOrbEffect
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
delay 150
removeobject LOCALID_MAGMA_HIDEOUT_4F_GROUDON_SLEEPING
addobject LOCALID_MAGMA_HIDEOUT_4F_GROUDON
waitstate
delay 60
applymovement LOCALID_MAGMA_HIDEOUT_4F_GROUDON, MagmaHideout_4F_Movement_GroudonApproach
waitmovement 0
special FadeOutOrbEffect
setvar VAR_0x8004, 1  @ vertical pan
setvar VAR_0x8005, 1  @ horizontal pan
setvar VAR_0x8006, 8  @ num shakes
setvar VAR_0x8007, 5  @ shake delay
special ShakeCamera
waitstate
applymovement LOCALID_MAGMA_HIDEOUT_4F_GROUDON, MagmaHideout_4F_Movement_GroudonExit
waitmovement 0
removeobject LOCALID_MAGMA_HIDEOUT_4F_GROUDON
delay 4
setvar VAR_0x8004, 2  @ vertical pan
setvar VAR_0x8005, 2  @ horizontal pan
setvar VAR_0x8006, 8  @ num shakes
setvar VAR_0x8007, 5  @ shake delay
special ShakeCamera
waitstate
delay 30
applymovement LOCALID_MAGMA_HIDEOUT_4F_MAXIE, MagmaHideout_4F_Movement_MaxieLookAround
waitmovement 0
msgbox MagmaHideout_4F_Text_MaxieGroudonWhatsWrong, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterRight
waitmovement 0
delay 30
applymovement LOCALID_MAGMA_HIDEOUT_4F_MAXIE, Common_Movement_FacePlayer
waitmovement 0
msgbox MagmaHideout_4F_Text_MaxieOhItWasYou, MSGBOX_DEFAULT
closemessage
trainerbattle_no_intro TRAINER_MAXIE_MAGMA_HIDEOUT, MagmaHideout_4F_Text_MaxieDefeat
msgbox MagmaHideout_4F_Text_MaxieImGoingAfterGroudon, MSGBOX_DEFAULT
closemessage
clearflag FLAG_HIDE_SLATEPORT_CITY_CAPTAIN_STERN
clearflag FLAG_HIDE_SLATEPORT_CITY_GABBY_AND_TY
setvar VAR_SLATEPORT_CITY_STATE, 1
setflag FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT
setvar VAR_SLATEPORT_HARBOR_STATE, 1
fadescreen FADE_TO_BLACK
removeobject LOCALID_MAGMA_HIDEOUT_4F_MAXIE
removeobject LOCALID_MAGMA_HIDEOUT_4F_GRUNT_1
removeobject LOCALID_MAGMA_HIDEOUT_4F_GRUNT_2
removeobject LOCALID_MAGMA_HIDEOUT_4F_GRUNT_3
removeobject LOCALID_MAGMA_HIDEOUT_4F_TABITHA
setflag FLAG_HIDE_MAGMA_HIDEOUT_GRUNTS
fadescreen FADE_FROM_BLACK
releaseall
end
```
### MagmaHideout_4F_Movement_GroudonApproach
```
delay_16
delay_16
walk_slow_down
delay_16
delay_16
delay_16
walk_slow_down
delay_16
delay_16
delay_16
step_end
```
### MagmaHideout_4F_Movement_GroudonExit
```
slide_up
slide_up
step_end
```
### MagmaHideout_4F_Movement_MaxieLookAround
```
face_left
delay_16
face_right
delay_16
face_left
delay_16
face_right
delay_16
face_up
delay_16
delay_16
step_end
```
### MagmaHideout_4F_EventScript_Grunt11
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_11, MagmaHideout_4F_Text_Grunt11Intro, MagmaHideout_4F_Text_Grunt11Defeat
msgbox MagmaHideout_4F_Text_Grunt11PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_4F_EventScript_Grunt12
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_12, MagmaHideout_4F_Text_Grunt12Intro, MagmaHideout_4F_Text_Grunt12Defeat
msgbox MagmaHideout_4F_Text_Grunt12PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_4F_EventScript_Grunt13
```
trainerbattle_single TRAINER_GRUNT_MAGMA_HIDEOUT_13, MagmaHideout_4F_Text_Grunt13Intro, MagmaHideout_4F_Text_Grunt13Defeat
msgbox MagmaHideout_4F_Text_Grunt13PostBattle, MSGBOX_AUTOCLOSE
end
```
### MagmaHideout_4F_EventScript_Tabitha
```
trainerbattle_single TRAINER_TABITHA_MAGMA_HIDEOUT, MagmaHideout_4F_Text_TabithaIntro, MagmaHideout_4F_Text_TabithaDefeat
msgbox MagmaHideout_4F_Text_TabithaPostBattle, MSGBOX_AUTOCLOSE
end
```

## Textes (17)
### MagmaHideout_4F_Text_Grunt11Intro
```
Moi aussi je voudrais voir GROUDON…\nMais ils ne me laissent même pas voir\lle bout de sa queue.\pC'est vraiment pas sympa.\pOh non! Je viens de cracher\nle morceau!$
```
### MagmaHideout_4F_Text_Grunt11Defeat
```
Je devais être trop énervé pour pouvoir\ngagner ce combat.$
```
### MagmaHideout_4F_Text_Grunt11PostBattle
```
En fait, je ne sais même pas si\nGROUDON a une queue…$
```
### MagmaHideout_4F_Text_Grunt12Intro
```
Wahaha!\nBientôt… Très bientôt!\lNous sommes sur le point de réussir!$
```
### MagmaHideout_4F_Text_Grunt12Defeat
```
Grrr…\nJ'y étais presque!$
```
### MagmaHideout_4F_Text_Grunt12PostBattle
```
MAX!\nUn intrus vient vers vous!$
```
### MagmaHideout_4F_Text_Grunt13Intro
```
Ne crois pas pouvoir passer facilement.\nTu ne m'as pas encore battu!$
```
### MagmaHideout_4F_Text_Grunt13Defeat
```
T'as juste eu de la chance!$
```
### MagmaHideout_4F_Text_Grunt13PostBattle
```
Allez… Encore un combat…$
```
### MagmaHideout_4F_Text_TabithaIntro
```
Héhéhé…\nTu as réussi à venir jusqu'ici, alors je\lvais tout te raconter!\pC'est bien ça!\nGROUDON est en train de dormir,\ljuste un peu plus loin.\pMais MAX doit déjà être avec lui.\pCe n'est plus qu'une question de\nsecondes avant qu'il ne le réveille!$
```
### MagmaHideout_4F_Text_TabithaDefeat
```
Je suis humilié…\nEncore une fois…$
```
### MagmaHideout_4F_Text_TabithaPostBattle
```
Mais pendant que tu perdais ton temps\navec moi, MAX a dû réveiller GROUDON…$
```
### MagmaHideout_4F_Text_MaxieAwakenGroudon
```
MAX: GROUDON…\pRien n'a encore pu te réveiller de ton\nsommeil dans ce bain de magma…\pCet ORBE BLEU, il te manquait,\nn'est-ce pas?\pJe t'ai ramené l'ORBE BLEU.\nQue sa lumière te réveille!\pEt montre-moi…\nMontre-moi l'étendue de ta puissance!$
```
### MagmaHideout_4F_Text_MaxieGroudonWhatsWrong
```
MAX: GROUDON!\nQue se passe-t-il?\pL'ORBE BLEU était bien la clef?!\pGROUDON!\nOù es-tu parti?$
```
### MagmaHideout_4F_Text_MaxieOhItWasYou
```
MAX: Oh, c'était donc toi?\pTu n'as pas arrêté d'apparaître ici\net là…\pJe comprends maintenant!\nC'est sûrement à cause de toi!$
```
### MagmaHideout_4F_Text_MaxieDefeat
```
D'où te vient cette maîtrise\ndes POKéMON?$
```
### MagmaHideout_4F_Text_MaxieImGoingAfterGroudon
```
MAX: Il doit bien y avoir une raison pour\nque GROUDON soit parti comme ça…\pC'est ce que tu essaies de me dire,\nc'est ça?\p… … … … … …\n… … … … … …\pHumpf…\nEt tu crois que je le savais pas?\pGROUDON parti, nous n'avons plus rien\nà faire dans ce volcan.\pJe pars à sa recherche, nos chemins\nse séparent ici!$
```

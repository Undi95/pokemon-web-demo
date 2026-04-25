# MeteorFalls_1F_2R

## Métadonnées
- **id** : `MAP_METEOR_FALLS_1F_2R`
- **layout** : `LAYOUT_METEOR_FALLS_1F_2R`
- **music** : `MUS_CAVE_OF_ORIGIN`
- **region_map_section** : `MAPSEC_METEOR_FALLS`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_UNDERGROUND`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (3 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MAN_3` | 13,2 | `MOVEMENT_TYPE_FACE_DOWN` | `MeteorFalls_1F_2R_EventScript_Nicolas` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_M` | 6,12 | `MOVEMENT_TYPE_FACE_DOWN` | `MeteorFalls_1F_2R_EventScript_John` | `0` |
| `` | `OBJ_EVENT_GFX_EXPERT_F` | 7,12 | `MOVEMENT_TYPE_FACE_DOWN` | `MeteorFalls_1F_2R_EventScript_Jay` | `0` |

## Warps (4)
- #0 (10,29) → `MAP_METEOR_FALLS_1F_1R` warp #2
- #1 (4,14) → `MAP_METEOR_FALLS_B1F_1R` warp #0
- #2 (7,20) → `MAP_METEOR_FALLS_B1F_1R` warp #1
- #3 (21,23) → `MAP_METEOR_FALLS_B1F_1R` warp #2

## BG events / signs (1)
- (9,58) [sign] → `0x0`

## Variables référencées (1)
- `VAR_RESULT`

## Scripts (9)
### MeteorFalls_1F_2R_EventScript_Nicolas
```
trainerbattle_single TRAINER_NICOLAS_1, MeteorFalls_1F_2R_Text_NicolasIntro, MeteorFalls_1F_2R_Text_NicolasDefeat, MeteorFalls_1F_2R_EventScript_RegisterNicolas
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MeteorFalls_1F_2R_EventScript_RematchNicolas
msgbox MeteorFalls_1F_2R_Text_NicolasPostBattle, MSGBOX_DEFAULT
release
end
```
### MeteorFalls_1F_2R_EventScript_RegisterNicolas
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
msgbox MeteorFalls_1F_2R_Text_NicolasRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_NICOLAS_1
release
end
```
### MeteorFalls_1F_2R_EventScript_RematchNicolas
```
trainerbattle_rematch TRAINER_NICOLAS_1, MeteorFalls_1F_2R_Text_NicolasRematchIntro, MeteorFalls_1F_2R_Text_NicolasRematchDefeat
msgbox MeteorFalls_1F_2R_Text_NicolasPostRematch, MSGBOX_AUTOCLOSE
end
```
### MeteorFalls_1F_2R_EventScript_John
```
trainerbattle_double TRAINER_JOHN_AND_JAY_1, MeteorFalls_1F_2R_Text_JohnIntro, MeteorFalls_1F_2R_Text_JohnDefeat, MeteorFalls_1F_2R_Text_JohnNotEnoughMons, MeteorFalls_1F_2R_EventScript_RegisterJohn
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MeteorFalls_1F_2R_EventScript_RematchJohn
msgbox MeteorFalls_1F_2R_Text_JohnPostBattle, MSGBOX_DEFAULT
release
end
```
### MeteorFalls_1F_2R_EventScript_RegisterJohn
```
msgbox MeteorFalls_1F_2R_Text_JohnRegister, MSGBOX_DEFAULT
register_matchcall TRAINER_JOHN_AND_JAY_1
release
end
```
### MeteorFalls_1F_2R_EventScript_RematchJohn
```
trainerbattle_rematch_double TRAINER_JOHN_AND_JAY_1, MeteorFalls_1F_2R_Text_JohnRematchIntro, MeteorFalls_1F_2R_Text_JohnRematchDefeat, MeteorFalls_1F_2R_Text_JohnRematchNotEnoughMons
msgbox MeteorFalls_1F_2R_Text_JohnPostRematch, MSGBOX_AUTOCLOSE
end
```
### MeteorFalls_1F_2R_EventScript_Jay
```
trainerbattle_double TRAINER_JOHN_AND_JAY_1, MeteorFalls_1F_2R_Text_JayIntro, MeteorFalls_1F_2R_Text_JayDefeat, MeteorFalls_1F_2R_Text_JayNotEnoughMons, MeteorFalls_1F_2R_EventScript_RegisterJay
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, MeteorFalls_1F_2R_EventScript_RematchJay
msgbox MeteorFalls_1F_2R_Text_JayPostBattle, MSGBOX_DEFAULT
release
end
```
### MeteorFalls_1F_2R_EventScript_RegisterJay
```
msgbox MeteorFalls_1F_2R_Text_JohnRegister, MSGBOX_DEFAULT  @ John speaks for both during register
register_matchcall TRAINER_JOHN_AND_JAY_1
release
end
```
### MeteorFalls_1F_2R_EventScript_RematchJay
```
trainerbattle_rematch_double TRAINER_JOHN_AND_JAY_1, MeteorFalls_1F_2R_Text_JayRematchIntro, MeteorFalls_1F_2R_Text_JayRematchDefeat, MeteorFalls_1F_2R_Text_JayRematchNotEnoughMons
msgbox MeteorFalls_1F_2R_Text_JayPostRematch, MSGBOX_AUTOCLOSE
end
```

## Textes (24)
### MeteorFalls_1F_2R_Text_NicolasIntro
```
C'est ici que nous, adeptes des dragons,\nnous entraînons.\pMême le MAITRE nous a rendu visite.\nTu vois comme c'est spécial ici?$
```
### MeteorFalls_1F_2R_Text_NicolasDefeat
```
Arrgh!\nJe n'imaginais pas ta force si grande!$
```
### MeteorFalls_1F_2R_Text_NicolasPostBattle
```
La route est encore longue et difficile.\pQuand deviendrons-nous les meilleurs,\nmes POKéMON et moi?$
```
### MeteorFalls_1F_2R_Text_NicolasRegister
```
Je veux en savoir plus sur ta puissance.\nLaisse-moi t'enregistrer dans mon\lPOKéNAV.$
```
### MeteorFalls_1F_2R_Text_NicolasRematchIntro
```
Depuis notre rencontre, on s'est\nentraînés dur pour devenir numéro un.\pDonne-nous la possibilité de voir à quel\npoint notre puissance a augmenté!$
```
### MeteorFalls_1F_2R_Text_NicolasRematchDefeat
```
Arrgh!\nJe n'imaginais pas ta force si grande!$
```
### MeteorFalls_1F_2R_Text_NicolasPostRematch
```
Il est évident que tu as poursuivi\nl'entraînement de tes POKéMON.\pAussi longtemps que tu seras solide,\nje pourrai, moi aussi, l'être davantage!$
```
### MeteorFalls_1F_2R_Text_JohnIntro
```
JOHN: On a toujours fait des combats\nde POKéMON ensemble.\pOn a confiance l'un en l'autre.$
```
### MeteorFalls_1F_2R_Text_JohnDefeat
```
JOHN: Oh, non!\nOn a perdu, ma douce.$
```
### MeteorFalls_1F_2R_Text_JohnPostBattle
```
JOHN: Nous sommes mariés depuis\ncinquante ans.\pEt il faut que je livre un combat contre\nma propre femme. Tu imagines?$
```
### MeteorFalls_1F_2R_Text_JohnNotEnoughMons
```
JOHN: Eh bien, quel jeune DRESSEUR!\pTu veux te battre avec nous? Si oui, il\nfaudra revenir avec plus de POKéMON.$
```
### MeteorFalls_1F_2R_Text_JohnRegister
```
JOHN: Jeune DRESSEUR, nous\naffronteras-tu de nouveau si la\lchance se présente?$
```
### MeteorFalls_1F_2R_Text_JayIntro
```
JAY: Nous sommes mariés depuis\ncinquante ans.\pLe lien qui nous unit en tant que couple\nne pourra jamais être rompu.$
```
### MeteorFalls_1F_2R_Text_JayDefeat
```
JAY: Oh non!\nOn a perdu, mon cher époux.$
```
### MeteorFalls_1F_2R_Text_JayPostBattle
```
JAY: Cinquante ans de mariage…\pQuand on n'est pas d'accord, on règle\ntoujours ça par un combat de POKéMON…$
```
### MeteorFalls_1F_2R_Text_JayNotEnoughMons
```
JAY: Tu es un jeune DRESSEUR, hein?\pPour te battre contre nous, il faut que\ntu reviennes avec plus de POKéMON.$
```
### MeteorFalls_1F_2R_Text_JohnRematchIntro
```
JOHN: On a toujours fait des combats\nde POKéMON ensemble.\pOn a confiance l'un en l'autre.$
```
### MeteorFalls_1F_2R_Text_JohnRematchDefeat
```
JOHN: Oh, non!\nOn a perdu, ma douce.$
```
### MeteorFalls_1F_2R_Text_JohnPostRematch
```
JOHN: Cinquante ans de mariage…\pA la réflexion, ma chère femme et moi,\non s'est battus jour après jour…$
```
### MeteorFalls_1F_2R_Text_JohnRematchNotEnoughMons
```
JOHN: Eh bien, quel jeune DRESSEUR!\pTu veux te battre avec nous? Si oui, il\nfaudra revenir avec plus de POKéMON.$
```
### MeteorFalls_1F_2R_Text_JayRematchIntro
```
JAY: Nous sommes mariés depuis\ncinquante ans.\pOn s'est toujours soutenus.\nÇa nous a rendus forts.$
```
### MeteorFalls_1F_2R_Text_JayRematchDefeat
```
JAY: Oh non!\nOn a perdu, mon cher époux.$
```
### MeteorFalls_1F_2R_Text_JayPostRematch
```
JAY: Cinquante ans de mariage…\nTellement de choses se sont passées!\pJ'espère que l'on va encore avoir\nde bons souvenirs ensemble.$
```
### MeteorFalls_1F_2R_Text_JayRematchNotEnoughMons
```
JAY: Tu es un jeune DRESSEUR, hein?\pPour te battre contre nous, il faut que\ntu reviennes avec plus de POKéMON.$
```

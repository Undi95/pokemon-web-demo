# PetalburgWoods

## Métadonnées
- **id** : `MAP_PETALBURG_WOODS`
- **layout** : `LAYOUT_PETALBURG_WOODS`
- **music** : `MUS_PETALBURG_WOODS`
- **region_map_section** : `MAPSEC_PETALBURG_WOODS`
- **weather** : `WEATHER_SHADE`
- **map_type** : `MAP_TYPE_ROUTE`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `True`
- **allow_cycling** : `True`
- **allow_running** : `True`

## Object events (13 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 19,10 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_11` |
| `` | `OBJ_EVENT_GFX_CUTTABLE_TREE` | 19,11 | `MOVEMENT_TYPE_LOOK_AROUND` | `EventScript_CutTree` | `FLAG_TEMP_12` |
| `LOCALID_PETALBURG_WOODS_GRUNT` | `OBJ_EVENT_GFX_AQUA_MEMBER_M` | 26,17 | `MOVEMENT_TYPE_FACE_RIGHT` | `0x0` | `FLAG_HIDE_PETALBURG_WOODS_AQUA_GRUNT` |
| `LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE` | `OBJ_EVENT_GFX_MAN_2` | 26,20 | `MOVEMENT_TYPE_LOOK_AROUND` | `0x0` | `FLAG_HIDE_PETALBURG_WOODS_DEVON_EMPLOYEE` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 45,7 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgWoods_EventScript_ItemGreatBall` | `FLAG_ITEM_PETALBURG_WOODS_GREAT_BALL` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 35,20 | `MOVEMENT_TYPE_FACE_DOWN` | `PetalburgWoods_EventScript_ItemXAttack` | `FLAG_ITEM_PETALBURG_WOODS_X_ATTACK` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,8 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgWoods_EventScript_ItemEther` | `FLAG_ITEM_PETALBURG_WOODS_ETHER` |
| `` | `OBJ_EVENT_GFX_BOY_2` | 15,19 | `MOVEMENT_TYPE_WANDER_UP_AND_DOWN` | `PetalburgWoods_EventScript_Boy1` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 7,32 | `MOVEMENT_TYPE_FACE_DOWN_LEFT_AND_RIGHT` | `PetalburgWoods_EventScript_Lyle` | `0` |
| `` | `OBJ_EVENT_GFX_BUG_CATCHER` | 4,14 | `MOVEMENT_TYPE_FACE_DOWN_UP_AND_RIGHT` | `PetalburgWoods_EventScript_James` | `0` |
| `` | `OBJ_EVENT_GFX_BOY_3` | 30,34 | `MOVEMENT_TYPE_WANDER_AROUND` | `PetalburgWoods_EventScript_Boy2` | `0` |
| `` | `OBJ_EVENT_GFX_ITEM_BALL` | 4,26 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgWoods_EventScript_ItemParalyzeHeal` | `FLAG_ITEM_PETALBURG_WOODS_PARALYZE_HEAL` |
| `` | `OBJ_EVENT_GFX_GIRL_2` | 33,5 | `MOVEMENT_TYPE_LOOK_AROUND` | `PetalburgWoods_EventScript_Girl` | `0` |

## Warps (6)
- #0 (14,5) → `MAP_ROUTE104` warp #2
- #1 (15,5) → `MAP_ROUTE104` warp #3
- #2 (16,38) → `MAP_ROUTE104` warp #4
- #3 (17,38) → `MAP_ROUTE104` warp #5
- #4 (36,38) → `MAP_ROUTE104` warp #6
- #5 (37,38) → `MAP_ROUTE104` warp #7

## Coord events / triggers (2)
- (26,23) → `PetalburgWoods_EventScript_DevonResearcherLeft` (si `VAR_PETALBURG_WOODS_STATE` == `0`)
- (27,23) → `PetalburgWoods_EventScript_DevonResearcherRight` (si `VAR_PETALBURG_WOODS_STATE` == `0`)

## BG events / signs (6)
- (14,32) [sign] → `PetalburgWoods_EventScript_Sign1`
- (39,35) [hidden_item] → ``
- (26,6) [hidden_item] → ``
- (40,29) [hidden_item] → ``
- (4,19) [hidden_item] → ``
- (11,8) [sign] → `PetalburgWoods_EventScript_Sign2`

## Flags référencés (2)
- `FLAG_HAS_MATCH_CALL`
- `FLAG_RECEIVED_MIRACLE_SEED`

## Variables référencées (3)
- `VAR_0x8004`
- `VAR_PETALBURG_WOODS_STATE`
- `VAR_RESULT`

## Scripts (35)
### PetalburgWoods_EventScript_DevonResearcherLeft
```
lockall
call PetalburgWoods_EventScript_DevonResearcherIntro
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherApproachPlayerLeft
waitmovement 0
msgbox PetalburgWoods_Text_HaveYouSeenShroomish, MSGBOX_DEFAULT
closemessage
playbgm MUS_ENCOUNTER_AQUA, FALSE
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaEntrance
waitmovement 0
msgbox PetalburgWoods_Text_IWasGoingToAmbushYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaApproachResearcherLeft
waitmovement 0
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox PetalburgWoods_Text_HandOverThosePapers, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherFleeToPlayerLeft
waitmovement 0
msgbox PetalburgWoods_Text_YouHaveToHelpMe, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaApproachPlayer
waitmovement 0
msgbox PetalburgWoods_Text_NoOneCrossesTeamAqua, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_GRUNT_PETALBURG_WOODS, PetalburgWoods_Text_YoureKiddingMe
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaBackOff
waitmovement 0
call PetalburgWoods_EventScript_DevonResearcherPostBattle
applymovement LOCALID_PLAYER, PetalburgWoods_Movement_WatchResearcherLeave
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherExitLeft
waitmovement 0
goto PetalburgWoods_EventScript_RemoveDevonResearcher
end
```
### PetalburgWoods_EventScript_DevonResearcherRight
```
lockall
call PetalburgWoods_EventScript_DevonResearcherIntro
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherApproachPlayerRight
waitmovement 0
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterLeft
waitmovement 0
msgbox PetalburgWoods_Text_HaveYouSeenShroomish, MSGBOX_DEFAULT
closemessage
playbgm MUS_ENCOUNTER_AQUA, FALSE
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaEntrance
waitmovement 0
msgbox PetalburgWoods_Text_IWasGoingToAmbushYou, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaApproachResearcherRight
waitmovement 0
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox PetalburgWoods_Text_HandOverThosePapers, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherFleeToPlayerRight
waitmovement 0
msgbox PetalburgWoods_Text_YouHaveToHelpMe, MSGBOX_DEFAULT
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterUp
waitmovement 0
msgbox PetalburgWoods_Text_NoOneCrossesTeamAqua, MSGBOX_DEFAULT
trainerbattle_no_intro TRAINER_GRUNT_PETALBURG_WOODS, PetalburgWoods_Text_YoureKiddingMe
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaBackOff
waitmovement 0
call PetalburgWoods_EventScript_DevonResearcherPostBattle
applymovement LOCALID_PLAYER, PetalburgWoods_Movement_WatchResearcherLeave
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherExitRight
waitmovement 0
goto PetalburgWoods_EventScript_RemoveDevonResearcher
end
```
### PetalburgWoods_EventScript_DevonResearcherIntro
```
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherLookAround
waitmovement 0
msgbox PetalburgWoods_Text_NotAOneToBeFound, MSGBOX_DEFAULT
closemessage
return
```
### PetalburgWoods_EventScript_DevonResearcherPostBattle
```
msgbox PetalburgWoods_Text_YouveGotSomeNerve, MSGBOX_DEFAULT
closemessage
applymovement LOCALID_PETALBURG_WOODS_GRUNT, PetalburgWoods_Movement_AquaRunAway
waitmovement 0
removeobject LOCALID_PETALBURG_WOODS_GRUNT
applymovement LOCALID_PLAYER, Common_Movement_WalkInPlaceFasterDown
waitmovement 0
msgbox PetalburgWoods_Text_ThatWasAwfullyClose, MSGBOX_DEFAULT
giveitem ITEM_GREAT_BALL
goto_if_eq VAR_RESULT, FALSE, PetalburgWoods_EventScript_BagFull
goto PetalburgWoods_EventScript_DevonResearcherFinish
end
```
### PetalburgWoods_EventScript_BagFull
```
msgbox PetalburgWoods_Text_YoureLoadedWithItems, MSGBOX_DEFAULT
goto PetalburgWoods_EventScript_DevonResearcherFinish
end
```
### PetalburgWoods_EventScript_DevonResearcherFinish
```
msgbox PetalburgWoods_Text_TeamAquaAfterSomethingInRustboro, MSGBOX_DEFAULT
applymovement LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE, PetalburgWoods_Movement_DevonResearcherStartExit
waitmovement 0
msgbox PetalburgWoods_Text_ICantBeWastingTime, MSGBOX_DEFAULT
closemessage
return
```
### PetalburgWoods_EventScript_RemoveDevonResearcher
```
removeobject LOCALID_PETALBURG_WOODS_DEVON_EMPLOYEE
setvar VAR_PETALBURG_WOODS_STATE, 1
releaseall
end
```
### PetalburgWoods_Movement_DevonResearcherLookAround
```
face_up
delay_16
delay_4
face_right
delay_16
delay_8
face_left
delay_16
delay_8
face_down
delay_16
face_right
delay_16
delay_8
face_up
delay_16
step_end
```
### PetalburgWoods_Movement_DevonResearcherExitLeft
```
walk_fast_right
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
step_end
```
### PetalburgWoods_Movement_DevonResearcherApproachPlayerLeft
```
delay_16
face_player
walk_down
walk_down
step_end
```
### PetalburgWoods_Movement_DevonResearcherApproachPlayerRight
```
delay_16
face_player
walk_down
walk_down
walk_down
walk_in_place_faster_right
step_end
```
### PetalburgWoods_Movement_DevonResearcherExitRight
```
walk_fast_left
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
step_end
```
### PetalburgWoods_Movement_WatchResearcherLeave
```
delay_16
delay_16
walk_in_place_faster_up
step_end
```
### PetalburgWoods_Movement_DevonResearcherFleeToPlayerLeft
```
walk_fast_right
walk_fast_down
walk_fast_down
walk_fast_left
walk_in_place_faster_up
step_end
```
### PetalburgWoods_Movement_DevonResearcherFleeToPlayerRight
```
walk_fast_down
walk_fast_right
walk_in_place_faster_up
step_end
```
### PetalburgWoods_Movement_DevonResearcherStartExit
```
walk_in_place_faster_down
delay_16
delay_16
delay_16
delay_16
delay_16
face_up
step_end
```
### PetalburgWoods_Movement_AquaApproachResearcherLeft
```
walk_fast_down
walk_fast_down
step_end
```
### PetalburgWoods_Movement_AquaBackOff
```
lock_facing_direction
walk_up
unlock_facing_direction
step_end
```
### PetalburgWoods_Movement_AquaRunAway
```
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
walk_fast_up
delay_16
delay_16
step_end
```
### PetalburgWoods_Movement_AquaApproachResearcherRight
```
walk_fast_down
walk_fast_down
walk_fast_down
step_end
```
### PetalburgWoods_Movement_AquaEntrance
```
walk_down
walk_down
delay_16
delay_16
step_end
```
### PetalburgWoods_Movement_AquaApproachPlayer
```
walk_down
step_end
```
### PetalburgWoods_EventScript_Boy1
```
msgbox PetalburgWoods_Text_StayOutOfTallGrass, MSGBOX_NPC
end
```
### PetalburgWoods_EventScript_Boy2
```
msgbox PetalburgWoods_Text_HiddenItemsExplanation, MSGBOX_NPC
end
```
### PetalburgWoods_EventScript_Girl
```
lock
faceplayer
goto_if_set FLAG_RECEIVED_MIRACLE_SEED, PetalburgWoods_EventScript_ExplainMiracleSeed
msgbox PetalburgWoods_Text_TryUsingThisItem, MSGBOX_DEFAULT
giveitem ITEM_MIRACLE_SEED
goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
setflag FLAG_RECEIVED_MIRACLE_SEED
release
end
```
### PetalburgWoods_EventScript_ExplainMiracleSeed
```
msgbox PetalburgWoods_Text_MiracleSeedExplanation, MSGBOX_DEFAULT
release
end
```
### PetalburgWoods_EventScript_Sign1
```
msgbox PetalburgWoods_Text_TrainerTipsExperience, MSGBOX_SIGN
end
```
### PetalburgWoods_EventScript_Sign2
```
msgbox PetalburgWoods_Text_TrainerTipsPP, MSGBOX_SIGN
end
```
### PetalburgWoods_EventScript_Lyle
```
trainerbattle_single TRAINER_LYLE, PetalburgWoods_Text_GoBugPokemonTeam, PetalburgWoods_Text_ICouldntWin
msgbox PetalburgWoods_Text_ImOutOfPokeBalls, MSGBOX_AUTOCLOSE
end
```
### PetalburgWoods_EventScript_James
```
trainerbattle_single TRAINER_JAMES_1, PetalburgWoods_Text_InstantlyPopularWithBugPokemon, PetalburgWoods_Text_CantBePopularIfILose, PetalburgWoods_EventScript_TryRegisterJames
specialvar VAR_RESULT, ShouldTryRematchBattle
goto_if_eq VAR_RESULT, TRUE, PetalburgWoods_EventScript_JamesRematch
setvar VAR_0x8004, TRAINER_JAMES_1
specialvar VAR_RESULT, IsTrainerRegistered
goto_if_eq VAR_RESULT, FALSE, PetalburgWoods_EventScript_TryRegisterJames2
msgbox PetalburgWoods_Text_PeopleRespectYou, MSGBOX_DEFAULT
release
end
```
### PetalburgWoods_EventScript_TryRegisterJames
```
special PlayerFaceTrainerAfterBattle
waitmovement 0
goto_if_set FLAG_HAS_MATCH_CALL, PetalburgWoods_EventScript_RegisterJames
release
end
```
### PetalburgWoods_EventScript_RegisterJames
```
msgbox PetalburgWoods_Text_IWantRematch1, MSGBOX_DEFAULT
register_matchcall TRAINER_JAMES_1
release
end
```
### PetalburgWoods_EventScript_TryRegisterJames2
```
goto_if_set FLAG_HAS_MATCH_CALL, PetalburgWoods_EventScript_RegisterJames2
msgbox PetalburgWoods_Text_PeopleRespectYou, MSGBOX_DEFAULT
release
end
```
### PetalburgWoods_EventScript_RegisterJames2
```
msgbox PetalburgWoods_Text_IWantRematch2, MSGBOX_DEFAULT
register_matchcall TRAINER_JAMES_1
release
end
```
### PetalburgWoods_EventScript_JamesRematch
```
trainerbattle_rematch TRAINER_JAMES_1, PetalburgWoods_Text_MyPokemonHaveGrown, PetalburgWoods_Text_CantBePopularIfLose
msgbox PetalburgWoods_Text_IveBeenTrainingHard, MSGBOX_AUTOCLOSE
end
```

## Textes (29)
### PetalburgWoods_Text_NotAOneToBeFound
```
Humm…\nRien du tout…$
```
### PetalburgWoods_Text_HaveYouSeenShroomish
```
Salut! T'aurais pas vu un POKéMON\nappelé BALIGNON dans le coin?\pJ'aime beaucoup ce POKéMON.$
```
### PetalburgWoods_Text_IWasGoingToAmbushYou
```
Je voulais te piéger, mais ça fait\nune éternité que tu traînes dans le\lBOIS CLEMENTI!\pRas l'bol d'attendre! Alors me voilà!$
```
### PetalburgWoods_Text_HandOverThosePapers
```
Toi! Le CHERCHEUR DE DEVON!\pDonne-moi ces papiers!$
```
### PetalburgWoods_Text_YouHaveToHelpMe
```
Oh, hé!\pTu es un DRESSEUR de POKéMON, non?\nIl faut que tu m'aides. S'il te plaît!$
```
### PetalburgWoods_Text_NoOneCrossesTeamAqua
```
Hum? Tu penses faire quoi?\nComment! Tu vas le défendre?\pLa TEAM AQUA n'a jamais de pitié pour\nses ennemis. Pas même pour un enfant!\pViens te battre!$
```
### PetalburgWoods_Text_YoureKiddingMe
```
Tu m'as bluffé! Quelle force!$
```
### PetalburgWoods_Text_YouveGotSomeNerve
```
Grrr… Tu as eu le culot de t'opposer\nà la TEAM AQUA!\pViens et affronte-moi de nouveau!\pC'est ce que j'aurais aimé te dire,\nmais je suis à court de POKéMON…\pEt en plus, nous, la TEAM AQUA, on a\nquelque chose à faire à MEROUVILLE.\pÇa va pour aujourd'hui. J'te laisse\nfiler!$
```
### PetalburgWoods_Text_ThatWasAwfullyClose
```
Ouf…\nIl s'en est fallu de peu!\pGrâce à toi, il ne m'a pas volé ces\nimportants papiers.\pJe sais! Pour te remercier, je vais te\ndonner cette SUPER BALL.$
```
### PetalburgWoods_Text_TeamAquaAfterSomethingInRustboro
```
Cette brute de la TEAM AQUA n'a-t-elle\npas dit qu'ils avaient quelque chose à\lfaire à MEROUVILLE?$
```
### PetalburgWoods_Text_ICantBeWastingTime
```
Oh là là! C'est une catastrophe!\nJe n'ai pas de temps à perdre!$
```
### PetalburgWoods_Text_YoureLoadedWithItems
```
Tu croules sous les objets. Je ne peux\npas te donner cette SUPER BALL.$
```
### PetalburgWoods_Text_GoBugPokemonTeam
```
J'ai attrapé tout un tas de POKéMON!\pAllez, allez, allez!\nMon équipe de POKéMON INSECTE!$
```
### PetalburgWoods_Text_ICouldntWin
```
J'avais tous ces POKéMON et\nje n'ai même pas gagné…$
```
### PetalburgWoods_Text_ImOutOfPokeBalls
```
J'ai attrapé tout un tas de POKéMON.\nMaintenant, je n'ai plus de POKé BALLS.$
```
### PetalburgWoods_Text_InstantlyPopularWithBugPokemon
```
Si t'emmènes des POKéMON INSECTE à\nl'école, t'es tout de suite populaire!$
```
### PetalburgWoods_Text_CantBePopularIfILose
```
Je n'peux pas être populaire\nsi je perds.$
```
### PetalburgWoods_Text_PeopleRespectYou
```
Quand tu as un gros POKéMON INSECTE,\nles gens te respectent.$
```
### PetalburgWoods_Text_IWantRematch1
```
J'aurai ma revanche dès que mes\nPOKéMON INSECTE auront grandi!\pJe vais t'enregistrer dans mon POKéNAV!$
```
### PetalburgWoods_Text_IWantRematch2
```
J'aurai ma revanche dès que mes\nPOKéMON INSECTE auront grandi!\pJe vais t'enregistrer dans mon POKéNAV!$
```
### PetalburgWoods_Text_MyPokemonHaveGrown
```
Mon POKéMON INSECTE a grandi.\nJe vais redevenir populaire.$
```
### PetalburgWoods_Text_CantBePopularIfLose
```
Je n'peux pas être populaire\nsi je perds.$
```
### PetalburgWoods_Text_IveBeenTrainingHard
```
On devient populaire quand on a des\nPOKéMON puissants, pas vrai?\pAlors je m'entraîne dur.$
```
### PetalburgWoods_Text_StayOutOfTallGrass
```
Yo, là!\nÇa baigne pour tes POKéMON?\pSi tes POKéMON sont faibles et que tu\nne veux pas te battre, il vaut mieux ne\lpas t'attarder dans les hautes herbes.$
```
### PetalburgWoods_Text_HiddenItemsExplanation
```
Parfois, il y a des choses par terre\nqu'on ne peut même pas voir.\pC'est pour ça que je fais toujours\nattention où je marche.$
```
### PetalburgWoods_Text_TryUsingThisItem
```
Oh, génial! C'est le BADGE de l'ARENE de\nMEROUVILLE!\pTu dois être DRESSEUR.\nTu devrais essayer d'utiliser cet objet.$
```
### PetalburgWoods_Text_MiracleSeedExplanation
```
C'est un GRAIN MIRACL.\nLorsqu'un POKéMON tient cet objet, ses \lattaques PLANTE sont plus puissantes.\pMais il existe d'autres objets tout\naussi pratiques, que les POKéMON\lpeuvent porter.$
```
### PetalburgWoods_Text_TrainerTipsExperience
```
CONSEILS AUX DRESSEURS\pTout POKéMON apparaissant au combat,\nmême une fois, reçoit des points EXP.\pPour augmenter le niveau d'un POKéMON,\nil faut le placer en tête de liste.\pDès le début du combat, échangez-le.\nIl recevra ainsi des points EXP sans \lprendre le moindre risque.$
```
### PetalburgWoods_Text_TrainerTipsPP
```
CONSEILS AUX DRESSEURS\pEn plus des POINTS DE VIE (PV), les\nPOKéMON ont des POINTS DE POUVOIR (PP)\lpour utiliser les capacités au combat.\pSi un POKéMON n'a plus de PP, il faut\nl'emmener dans un CENTRE POKéMON.$
```

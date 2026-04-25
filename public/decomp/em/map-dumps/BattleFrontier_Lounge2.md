# BattleFrontier_Lounge2

## Métadonnées
- **id** : `MAP_BATTLE_FRONTIER_LOUNGE2`
- **layout** : `LAYOUT_BATTLE_FRONTIER_LOUNGE1`
- **music** : `MUS_B_TOWER_RS`
- **region_map_section** : `MAPSEC_BATTLE_FRONTIER`
- **weather** : `WEATHER_NONE`
- **map_type** : `MAP_TYPE_INDOOR`
- **battle_scene** : `MAP_BATTLE_SCENE_NORMAL`
- **show_map_name** : `False`
- **allow_cycling** : `False`
- **allow_running** : `False`

## Object events (5 NPCs)
| local_id | gfx | x,y | mvmt | script | flag |
|---|---|---|---|---|---|
| `` | `OBJ_EVENT_GFX_MANIAC` | 8,4 | `MOVEMENT_TYPE_FACE_RIGHT` | `BattleFrontier_Lounge2_EventScript_FrontierManiac` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 10,4 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge2_EventScript_Maniac1` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 10,3 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge2_EventScript_Maniac2` | `0` |
| `` | `OBJ_EVENT_GFX_RUNNING_TRIATHLETE_F` | 4,6 | `MOVEMENT_TYPE_WANDER_AROUND` | `BattleFrontier_Lounge2_EventScript_TriathleteF` | `0` |
| `` | `OBJ_EVENT_GFX_MANIAC` | 10,5 | `MOVEMENT_TYPE_FACE_LEFT` | `BattleFrontier_Lounge2_EventScript_Maniac3` | `0` |

## Warps (2)
- #0 (1,7) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #3
- #1 (2,7) → `MAP_BATTLE_FRONTIER_OUTSIDE_WEST` warp #3

## Flags référencés (1)
- `FLAG_MET_BATTLE_FRONTIER_MANIAC`

## Variables référencées (2)
- `VAR_1`
- `VAR_FRONTIER_MANIAC_FACILITY`

## Scripts (19)
### BattleFrontier_Lounge2_EventScript_FrontierManiac
```
lock
faceplayer
goto_if_set FLAG_MET_BATTLE_FRONTIER_MANIAC, BattleFrontier_Lounge2_EventScript_AlreadyMetManiac
setflag FLAG_MET_BATTLE_FRONTIER_MANIAC
msgbox BattleFrontier_Lounge2_Text_FrontierManiacIntro, MSGBOX_DEFAULT
goto BattleFrontier_Lounge2_EventScript_GiveAdvice
end
```
### BattleFrontier_Lounge2_EventScript_AlreadyMetManiac
```
msgbox BattleFrontier_Lounge2_Text_SwingByForTheLatestWord, MSGBOX_DEFAULT
goto BattleFrontier_Lounge2_EventScript_GiveAdvice
end
```
### BattleFrontier_Lounge2_EventScript_GiveAdvice
```
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_TOWER_SINGLES, BattleFrontier_Lounge2_EventScript_BufferSingle
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_TOWER_DOUBLES, BattleFrontier_Lounge2_EventScript_BufferDouble
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_TOWER_MULTIS, BattleFrontier_Lounge2_EventScript_BufferMulti
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_TOWER_LINK, BattleFrontier_Lounge2_EventScript_BufferMultiLink
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_DOME, BattleFrontier_Lounge2_EventScript_BufferBattleDome
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_FACTORY, BattleFrontier_Lounge2_EventScript_BufferBattleFactory
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_PALACE, BattleFrontier_Lounge2_EventScript_BufferBattlePalace
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_ARENA, BattleFrontier_Lounge2_EventScript_BufferBattleArena
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_PIKE, BattleFrontier_Lounge2_EventScript_BufferBattlePike
call_if_eq VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_PYRAMID, BattleFrontier_Lounge2_EventScript_BufferBattlePyramid
call_if_le VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_TOWER_LINK, BattleFrontier_Lounge2_EventScript_BattleTowerNews
call_if_ge VAR_FRONTIER_MANIAC_FACILITY, FRONTIER_MANIAC_DOME, BattleFrontier_Lounge2_EventScript_FacilityNews
special ShowFrontierManiacMessage
waitmessage
waitbuttonpress
release
end
```
### BattleFrontier_Lounge2_EventScript_BattleTowerNews
```
msgbox BattleFrontier_Lounge2_Text_BattleTowerIsHottest, MSGBOX_DEFAULT
return
```
### BattleFrontier_Lounge2_EventScript_FacilityNews
```
msgbox BattleFrontier_Lounge2_Text_FacilityIsHottest, MSGBOX_DEFAULT
return
```
### BattleFrontier_Lounge2_EventScript_BufferSingle
```
bufferstdstring STR_VAR_1, STDSTRING_SINGLE
return
```
### BattleFrontier_Lounge2_EventScript_BufferDouble
```
bufferstdstring STR_VAR_1, STDSTRING_DOUBLE
return
```
### BattleFrontier_Lounge2_EventScript_BufferMulti
```
bufferstdstring STR_VAR_1, STDSTRING_MULTI
return
```
### BattleFrontier_Lounge2_EventScript_BufferMultiLink
```
bufferstdstring STR_VAR_1, STDSTRING_MULTI_LINK
return
```
### BattleFrontier_Lounge2_EventScript_BufferBattleDome
```
bufferstdstring STR_VAR_1, STDSTRING_BATTLE_DOME
return
```
### BattleFrontier_Lounge2_EventScript_BufferBattleFactory
```
bufferstdstring STR_VAR_1, STDSTRING_BATTLE_FACTORY
return
```
### BattleFrontier_Lounge2_EventScript_BufferBattlePalace
```
bufferstdstring STR_VAR_1, STDSTRING_BATTLE_PALACE
return
```
### BattleFrontier_Lounge2_EventScript_BufferBattleArena
```
bufferstdstring STR_VAR_1, STDSTRING_BATTLE_ARENA
return
```
### BattleFrontier_Lounge2_EventScript_BufferBattlePike
```
bufferstdstring STR_VAR_1, STDSTRING_BATTLE_PIKE
return
```
### BattleFrontier_Lounge2_EventScript_BufferBattlePyramid
```
bufferstdstring STR_VAR_1, STDSTRING_BATTLE_PYRAMID
return
```
### BattleFrontier_Lounge2_EventScript_Maniac1
```
lock
msgbox BattleFrontier_Lounge2_Text_NewsGatheringPower, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge2_EventScript_Maniac2
```
lock
msgbox BattleFrontier_Lounge2_Text_AmazingPowersOfObservation, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge2_EventScript_Maniac3
```
lock
msgbox BattleFrontier_Lounge2_Text_AmazingPowerOfPersuasion, MSGBOX_DEFAULT
release
end
```
### BattleFrontier_Lounge2_EventScript_TriathleteF
```
msgbox BattleFrontier_Lounge2_Text_ThisPlaceIsScaringMe, MSGBOX_NPC
end
```

## Textes (35)
### BattleFrontier_Lounge2_Text_FrontierManiacIntro
```
Bonjour! Si tu veux des infos sur la\nZONE DE COMBAT, tu es au bon endroit.\pJe suis en quelque sorte le MORDU DE\nLA ZONE!\pToi, tu es un DRESSEUR,\nn'est-ce pas?\pJe serais ravi de partager mes infos sur\nla ZONE DE COMBAT avec toi.$
```
### BattleFrontier_Lounge2_Text_SwingByForTheLatestWord
```
Bonjour! Je parierais que tu es là\npour me faire parler un peu!$
```
### BattleFrontier_Lounge2_Text_MyInformationsBeenUsefulRight
```
Well? Well? Well?\pI'm sure my information's been\nseriously useful to you, right?$
```
### BattleFrontier_Lounge2_Text_FacilityIsHottest
```
Voyons voir…\pL'endroit le plus en vue en ce moment…\n{STR_VAR_1}, sans hésitation.$
```
### BattleFrontier_Lounge2_Text_BattleTowerIsHottest
```
Voyons voir…\pLe {STR_VAR_1} de la TOUR DE COMBAT\nest le meilleur du moment.$
```
### BattleFrontier_Lounge2_Text_SalonMaidenIsThere
```
Je suis sûr que je vais t'apprendre\nquelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est un mystérieux DRESSEUR surnommé\nl'AS DU SALON.$
```
### BattleFrontier_Lounge2_Text_SalonMaidenSilverMons
```
As-tu affronté l'AS DU SALON?\pElle utilise ces POKéMON quand elle veut\nse mettre à la hauteur de l'adversaire:\pUn POKéMON de type PSY,\nun POKéMON VOLCAN de type FEU\let un POKéMON PIONCEUR de type NORMAL.$
```
### BattleFrontier_Lounge2_Text_SalonMaidenGoldMons
```
As-tu affonté l'AS DU SALON\nquand elle est sérieuse?\pQuand elle se bat à fond, elle utilise\nles POKéMON suivants:\pUn POKéMON EON de type DRAGON/PSY,\nun POKéMON FOUDRE de type ELECTRIK\let un POKéMON PIONCEUR de type NORMAL.$
```
### BattleFrontier_Lounge2_Text_DomeAceIsThere
```
Je vais t'apprendre quelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est l'extravagant DRESSEUR appelé la\nSTAR DU DOME.$
```
### BattleFrontier_Lounge2_Text_DomeAceSilverMons
```
As-tu affronté la STAR DU DOME?\pQuand il ne prend pas l'adversaire au\nsérieux, il utilise ces POKéMON:\pUn POKéMON DRAGON du type DRAGON/VOL,\nun POKéMON POISSONBOUE du type EAU/\lSOL et un POKéMON FLAMME du type\lFEU/VOL.$
```
### BattleFrontier_Lounge2_Text_DomeAceGoldMons
```
As-tu affronté la STAR DU DOME\nquand il se bat sérieusement?\pQuand il veut faire preuve de stratégie,\nil utilise ces trois POKéMON:\pUn POKéMON EON de type DRAGON/PSY,\nun POKéMON POISSONBOUE de type\lEAU/SOL et un POKéMON PATTEFER\lde type ACIER/PSY.$
```
### BattleFrontier_Lounge2_Text_FactoryHeadIsThere
```
Je vais t'apprendre quelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est l'étrange DRESSEUR appelé\nle CHEF D'USINE.$
```
### BattleFrontier_Lounge2_Text_FactoryHeadSilverMons
```
As-tu déjà affronté le CHEF D'USINE?\pTu sais… Au combat, il doit utiliser\ntrois POKéMON de location.\pIl se bat dans les mêmes conditions que\nles autres, en fait.$
```
### BattleFrontier_Lounge2_Text_FactoryHeadGoldMons
```
As-tu déjà affronté le CHEF D'USINE\nquand il se bat sérieusement?\pMême quand il veut se battre à fond, il\ndoit utiliser trois POKéMON de location.\pEn fin de compte, il se bat dans les\nmêmes conditions que les autres.$
```
### BattleFrontier_Lounge2_Text_PikeQueenIsThere
```
Je vais t'apprendre quelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est le DRESSEUR effrayant appelé la\nREINE VENIN.$
```
### BattleFrontier_Lounge2_Text_PikeQueenSilverMons
```
Tu as déjà affronté la REINE VENIN?\pQuand elle est de bonne humeur, elle\nutilise ces POKéMON:\pUn POKéMON SERPACROC de type POISON,\nun POKéMON POURRI de type\lINSECTE/ROCHE et un POKéMON TENDRE\lde type EAU.$
```
### BattleFrontier_Lounge2_Text_PikeQueenGoldMons
```
Tu as déjà affronté la REINE VENIN\nquand elle est énervée?\pQuand elle est vraiment agressive,\nelle utilise ces trois POKéMON:\pUn POKéMON SERPACROC de type POISON,\nUn POKéMON SERPENFER de type\lACIER/SOL et un POKéMON TERRIFIANT\lde type EAU/VOL.$
```
### BattleFrontier_Lounge2_Text_ArenaTycoonIsThere
```
Je vais t'apprendre quelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est le DRESSEUR pas mal appelé\nla PRO DU DOJO.$
```
### BattleFrontier_Lounge2_Text_ArenaTycoonSilverMons
```
As-tu déjà affronté la PRO DU DOJO?\pQuand elle veut laisser une chance à\nl'adversaire, elle utilise ces POKéMON:\pUn POKéMON UNICORNE de type INSECTE/\nCOMBAT, un POKéMON LUNE de type\lTENEBRES et un POKéMON EXUVIE\lde type INSECTE/SPECTRE.$
```
### BattleFrontier_Lounge2_Text_ArenaTycoonGoldMons
```
As-tu déjà affronté la PRO DU DOJO?\pSi elle ne veut laisser aucune chance à\nl'adversaire, elle utilise ces POKéMON:\pUn POKéMON LUNE de type TENEBRES,\nun POKéMON OMBRE de type\lSPECTRE/POISON et un POKéMON\lCHAMPIGNON de type PLANTE/COMBAT.$
```
### BattleFrontier_Lounge2_Text_PalaceMavenIsThere
```
Je vais t'apprendre quelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est ce DRESSEUR sinistre appelé\nle CAPT. PALACE.$
```
### BattleFrontier_Lounge2_Text_PalaceMavenSilverMons
```
Tu as déjà affronté le CAPT. PALACE?\pS'il veut tester l'adversaire, il utilise\nces POKéMON:\pUn POKéMON CHOVSOURIS de type POISON/\nVOL, un POKéMON FAINEANT de type\lNORMAL et un POKéMON TRANSPORT\lde type EAU/GLACE.$
```
### BattleFrontier_Lounge2_Text_PalaceMavenGoldMons
```
Tu as déjà combattu le CAPT. PALACE?\pQuand il se bat à fond, il utilise ces\nPOKéMON:\pUn POKéMON LEGENDAIRE de type FEU,\nun POKéMON FAINEANT de type NORMAL\let un POKéMON AURORE de type EAU.$
```
### BattleFrontier_Lounge2_Text_PyramidKingIsThere
```
Je vais t'apprendre quelque chose!\pUn des super DRESSEURS que SCOTT\nappelle les MENEURS DE ZONE est ici.\pC'est ce DRESSEUR intrépide appelé\nle ROI PYRAMIDE.$
```
### BattleFrontier_Lounge2_Text_PyramidKingSilverMons
```
As-tu déjà affronté le ROI PYRAMIDE?\pQuand il veut évaluer l'adversaire,\nil utilise ces POKéMON:\pUn POKéMON PIC ROCHEUX de type ROCHE,\nun POKéMON ICEBERG de type GLACE\let un POKéMON FER de type ACIER.$
```
### BattleFrontier_Lounge2_Text_PyramidKingGoldMons
```
As-tu déjà affronté le ROI PYRAMIDE\nquand il se bat pour de bon?\pQuand il est gonflé à bloc, il utilise\nces POKéMON:\pUn POKéMON GLACIAIRE de type\nGLACE/VOL, un POKéMON ELECTRIQUE\lde type ELECTRIK/VOL et un POKéMON\lFLAMME de type FEU/VOL.$
```
### BattleFrontier_Lounge2_Text_DoubleBattleAdvice1
```
Oui, il y a plein d'endroits où faire des\nCOMBATS DUO.\pMais il vaut mieux commencer par les\nSALLES DE COMBAT DUO de la\lTOUR DE COMBAT!\pC'est là que tu apprendras ce qu'est un\nCOMBAT DUO dans la ZONE DE COMBAT.$
```
### BattleFrontier_Lounge2_Text_DoubleBattleAdvice2
```
Fais bien attention à toi.\pIl paraît que certains DRESSEURS\ndéveloppent des stratégies spéciales\lpour les COMBATS DUO.$
```
### BattleFrontier_Lounge2_Text_DoubleBattleAdvice3
```
Quand tu y maîtriseras les COMBATS DUO,\ntu pourrais essayer d'en faire ailleurs.$
```
### BattleFrontier_Lounge2_Text_MultiBattleAdvice
```
Toutes sortes de DRESSEURS se\ntrouvent dans le SALON DE COMBAT.\pIl se peut que tu rencontres des amis\nou encore des fans! Ouvre les yeux!$
```
### BattleFrontier_Lounge2_Text_LinkMultiBattleAdvice
```
Si tu es avec un ami, dirige-toi vers\nla SALLE DE COMBAT MULTI LINK.\pSi ton ami est fort, les adversaires\nseront certainement de taille!$
```
### BattleFrontier_Lounge2_Text_NewsGatheringPower
```
Quelle capacité de synthèse!\nMon mentor est le meilleur!$
```
### BattleFrontier_Lounge2_Text_AmazingPowersOfObservation
```
Quel talent d'observation!\nMon mentor est le meilleur!$
```
### BattleFrontier_Lounge2_Text_AmazingPowerOfPersuasion
```
Quelle force de persuasion!\nMon mentor est le meilleur!$
```
### BattleFrontier_Lounge2_Text_ThisPlaceIsScaringMe
```
C'est quoi, cet endroit?\nJ'ai un peu peur…$
```

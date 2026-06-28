# Combat — Reconstruction MIROIR 1:1 (SPEC + cartographie + checklist)

> **But** : reconstruire le combat post-camion en **miroir 1:1 strict** de la décomp
> (`D:/Projet 1/decomps/pokeemeraude/src/battle_*.c`), en **récupérant ce qui est déjà
> 1:1** dans le port et en **jetant l'ad-hoc** hérité de la voie V (`battle-flow.ts`).
> Décidé 2026-06-07 après A/B user : la voie L boote mais traîne des bugs (terrain
> désert en herbe, sprite ennemi absent, move-anims placeholder) = « déteinte de la voie V ».
>
> **Périmètre 1re passe (choix user)** : combat **SAUVAGE 1v1**, de l'entrée à la sortie,
> **tous les outcomes**. Puis dresseur (+ defeat speech), puis doubles/spéciaux.
> **Ordre (choix user)** : **flux décomp** entrée → tour → fin → sortie. Chaque maillon
> **A/B-validé sur ROM** ; voie V (`battle-flow`) reste le défaut jouable jusqu'au bout
> (`__USE_DECOMP_BATTLE_LOOP__` OFF par défaut ; voie L via `enable()` ou `&` puis `'`).
>
> **Convention miroir** : tout fichier rendu FULLY 1:1 atterrit dans `src/game/` sous le
> nom décomp (`battle_setup.c` → `src/game/battle_setup.ts`, etc.). La couche HW
> (blit/VRAM/OAM/sprite framework) reste dans `src/engine`.

---

## 1. Cartographie décomp — le pipeline de combat

Fichiers décomp clés (`decomps/pokeemeraude/src/`) :

| Fichier | Rôle | Miroir cible |
|---|---|---|
| `battle_setup.c` | démarrage (terrain/transition/BGM, `BattleSetup_StartWildBattle`, `BattleSetup_GetEnvironmentId`) | `src/game/battle_setup.ts` |
| `battle_main.c` | `CB2_InitBattle`, `gBattleMainFunc` (state machine), `BattleMainCB1/2`, intro states, ordre de tour, fin | `src/game/battle_main.ts` |
| `battle_bg.c` | backgrounds (`sBattleEnvironmentTable`, `DrawBattleEntryBackground`, `DrawMainBattleBackground`) | `src/game/battle_bg.ts` |
| `battle_controller_player.c` / `_opponent.c` / `_link*.c` | controllers (input, anims, emits) | `src/game/battle_controller_*.ts` |
| `battle_controllers.c` | `InitBattleControllers`, exec-flags, `gBattlerControllerFuncs[]`, buffers IPC | `src/game/battle_controllers.ts` |
| `battle_script_commands.c` | interpréteur d'opcodes (effets de move) | `src/game/battle_script_commands.ts` |
| `battle_util.c` / `battle_util2.c` | fin de tour, statuts, dégâts annexes | `src/game/battle_util.ts` |
| `battle_anim*.c` (+ `battle_anim_*`) | anims de move (**415 callbacks**, gros manque) | `src/game/battle_anim*.ts` |
| `battle_interface.c` | healthbox (HP/EXP/nom/genre/statut) | `src/game/battle_interface.ts` |
| `battle_message.c` | textes de combat (byte-level) | `src/game/battle_message.ts` |
| `battle_transition.c` | ~40 effets de transition d'entrée | `src/game/battle_transition.ts` |
| `pokeball.c` | lancer de ball, send-out, slide healthbox | `src/game/pokeball.ts` |

**Flux nominal** (combat sauvage) :
```
[OW] StandardWildEncounter → BattleSetup_StartWildBattle
   → gBattleTypeFlags = wild ; gBattleEnvironment = BattleSetup_GetEnvironmentId()
   → CreateBattleStartTask(transition, BGM)  (battle_transition.c joue l'anim)
   → SetMainCallback2(CB2_InitBattle)
[CB2_InitBattle] alloc/fade/gfx/palettes/OAM ; InitBattleControllers ; DrawBattleEntryBackground
   → BattleMainCB2 / gBattleMainFunc avance les états :
       BattleStartClearSetData → ... → BattleIntroDrawTrainersOrMonsSprites
       → BattleIntroPrintWildMonAttacked ("Un X sauvage apparaît!")
       → BattleIntro*SendOutMonAnimation (ball joueur, send-out)
       → TryDoEventsBeforeFirstTurn (talents/objets switch-in)
       → HandleTurnActionSelectionState (MENU)
   → RunTurnActionsFunctions (exécution des actions du tour)
   → fin de tour (statuts/météo/objets) → check faint → EXP/level-up
   → HandleEndTurn_* → FinishBattle → fade → ReturnFromBattleToOverworld
```

**Modèle d'exécution à respecter** (cf. `BATTLE-1TO1-REWRITE-PLAN.md`) : `BattleMainCB1` →
`gBattleMainFunc()` + pompe `gBattlerControllerFuncs[i]()` via `gBattleControllerExecFlags`.
Les effets de move passent par l'interpréteur de scripts (1 opcode/frame), pas en bloc.

---

## 2. Checklist EXHAUSTIVE des outcomes / edge cases

> ⚠️ **La checklist manuelle ci-dessous (rédigée de mémoire) est FAILLIBLE** (oublis garantis
> vu le volume). La VRAIE source d'exhaustivité = **les tables de la décomp** : chaque entrée
> = un outcome à couvrir 1:1. Mesuré (2026-06-07) :
>
> | Table (décomp) | Fichier | Entrées |
> |---|---|---|
> | Move effects `EFFECT_*` | `include/constants/battle_move_effects.h` | **214** |
> | Move secondary effects `MOVE_EFFECT_*` | `include/constants/battle.h` | **61** |
> | Hold effects `HOLD_EFFECT_*` | `include/constants/hold_effects.h` | **67** |
> | Abilities `ABILITY_*` (× moments de déclenchement) | `include/constants/abilities.h` | **78** |
> | Messages de combat `STRINGID_*` | `include/constants/battle_string_ids.h` | **503** |
> | Opcodes de script `Cmd_*` | `src/battle_script_commands.c` (`gBattleScriptingCommandsTable`) | ~270 |
>
> **Méthode = filet MÉCANIQUE (pas de mémoire)** : outil `scripts/audit-battle-coverage.mjs`
> qui énumère chaque table et la croise avec le portage → rapport `porté / ad-hoc / manquant`,
> re-run à volonté. **Deux niveaux** : (1) FONCTION — le `coverage:1to1` existant voit si
> `AbilityBattleEffects` / `Cmd_*` existent ; (2) **DATA (nouveau)** — *quelles* abilities/
> effects/messages **à l'intérieur** sont réellement gérés. C'est le niveau (2) qui attrape les
> outcomes « oubliés » (fonction présente mais case `ABILITY_X` manquante). La reconstruction
> suit le flux décomp ; à chaque maillon on coche la couverture pertinente (ex. maillon
> exécution-move → les 214 `EFFECT_*` ; fin-de-tour → abilities/statuts de fin de tour).

Statut : ✅ 1:1 vérifié · 🟡 présent mais ad-hoc/incomplet · 🔴 bug/stub/manquant · ⬜ à auditer.
(Statuts initiaux = estimation MÉMOIRE ; le filet mécanique ci-dessus les remplace catégorie par catégorie.)

### A. Entrée / setup
- ⬜ Sélection du type de combat (wild/trainer/double/safari/link).
- 🔴 **Terrain** `BattleSetup_GetEnvironmentId` → `gBattleEnvironment` → `sBattleEnvironmentTable` (tileset/tilemap/palette/plateformes). *Bug désert en herbe (cf. §3).*
- 🟡 Transition `GetWild/TrainerBattleTransition` + tables (logique présente ; anims = SLICE only).
- 🟡 Anim de transition (`battle_transition.c`, ~40 effets ; seul SLICE).
- 🟡 BGM de combat (`GetBattleBGM` ; seul `MUS_VS_WILD` câblé ?).
- ⬜ `CB2_InitBattle` (alloc/fade/gfx/palettes/OAM).
- ✅ Génération mons (gEnemyParty wild, gPlayerParty natif).

### B. Intro (apparition)
- ⬜ Slide du background.
- 🔴 Dessin sprites — **sprite ennemi parfois absent** (A/B user).
- 🟡 « Un X sauvage apparaît! » / dresseur « X veut se battre! ».
- 🟡 Lancer ball joueur + send-out + anim sortie.
- 🟡 Healthbox slide-in (joueur + ennemi).
- ⬜ Cri du pokémon · anim shiny.
- ✅ `TryDoEventsBeforeFirstTurn` (Intimidate/météo/Trace/objets) — corrigé loops 2026-06-04.

### C. Menu & sélection
- ✅ « Que doit faire X? » + ATTAQUE/SAC/POKéMON/FUITE.
- ✅ Sous-menu moves (nom/PP/type, curseur, A/B).
- ⬜ PP=0 (move grisé) / Struggle si tous PP=0.
- ✅ Annulation B → menu.

### D. Ordre du tour
- 🟡 `SetActionsAndBattlersTurnOrder` (priorité/vitesse/Quick Claw).
- ✅ switch/objet/fuite avant attaque.

### E. Exécution du move
- ✅ « X utilise Y! ».
- 🟡 Vérifs pré-move (sommeil/gel/para/confusion/attraction/flinch/disable/taunt).
- 🔴 **Anim du move** = placeholder lunge (415 callbacks, createsprite/createvisualtask stubs).
- ✅ Accuracy (« échoue! » / « esquive! »).
- ✅ Dégâts (type/STAB/crit/random/burn/objets/talents) — matrice vérifiée harness.
- 🟡 Anim hit + drain HP + barre.
- ✅ Effets secondaires (statut/stat/recul/drain/multi-hit).
- ✅ Messages (super/peu efficace/immunisé/critique).
- 🟡 Talents (Statik…) · objets tenus (Sitrus/Baie…).

### F. Fin de tour
- 🟡 Météo (dégâts/effets).
- ✅ Statuts (poison/burn 1/8, toxic croissant) — vérifié harness.
- 🟡 Objets (Restes) · talents (Speed Boost).
- ⬜ Conditions (Vampigraine/Étreinte/Cauchemar/Malédiction).
- ✅ Check K.O.

### G. K.O. / faint
- ✅ « X est K.O.! ».
- 🟡 Anim de faint (slide + cri).
- ✅ Healthbox off.
- ⬜ Switch forcé joueur / white-out si plus de mons.

### H. EXP / level-up / évolution
- ✅ « gagne N EXP! » + barre EXP (multi-niveaux) + « monte au niveau N! ».
- ✅ **Boîte stats level-up** (Super Bonbon ; party_menu/menu_specialized) — A/B-validé 2026-06-07.
- 🔴 Apprentissage de move (`MonTryLearningNewMove` non porté).
- 🔴 Évolution post-combat (`PartyMenuTryEvolution` non porté).

### I. Capture
- ✅ `Cmd_handleballthrow` porté 1:1 (logique) ; ⬜ anim ball + shake + surnom.
- ✅ Ajout party (GiveMonToPlayer natif) / ⬜ PC si pleine (CopyMonToPC = Phase 5).

### J. Switch (volontaire / forcé)
- ✅ Party menu + sélection + swap (gBattleMons + battlerPartyIndexes).
- 🟡 « reviens! » + rappel / « Vas-y! » + send-out.
- ✅ Talents switch-in du nouveau mon.

### K. Sac en combat
- 🔴 Sous-écran sac (logique d'annulation gracieuse ; **effets d'items en combat = Dette R3**).

### L. Combat dresseur
- ⬜ Intro dresseur (sprite, « X veut se battre! ») · multi-mons (envoi successif).
- ⬜ Prompt switch (« X va envoyer Y… »).
- 🔴 **Defeat speech** (port data OW trainerbattle, cross-subsystem).
- ⬜ Gain d'argent · pas de capture/fuite.

### M. Sortie / outcome
- ✅ WON → fade → retour OW (FreeResetData_ReturnToOvOrDoEvolutions).
- 🔴 LOST → white-out (Centre Pokémon, perte ¥) — à vérifier.
- ✅ RAN / forfeit → retour OW.
- ✅ CAUGHT → retour OW.
- 🟡 Fade de sortie + savedCallback + reprise BGM OW.
- 🔴 Évolutions post-combat.

### N. Edge cases / spéciaux (hors 1re passe)
- ⬜ Doubles (ciblage/spread) · Safari · tuto Birch · scriptés (rival/légendaires).
- ⬜ Multi-hit/OHKO/contre · Roar/Whirlwind (fin wild) · fuite bloquée (Regard Noir/Piège…).

---

## 3. Maillon en cours — ENTRÉE (terrain en tête)

### 3.1 Terrain / background 🔴
**Décomp** : `BattleSetup_GetEnvironmentId()` (battle_setup.c:636-694) lit le metatile
behavior à `PlayerGetDestCoords()` → `BATTLE_ENVIRONMENT_*` → `gBattleEnvironment` →
`sBattleEnvironmentTable[env]` (battle_bg.c:602) charge tileset/tilemap/palette.
Index : GRASS=0, LONG_GRASS=1, **SAND=2**, UNDERWATER=3, WATER=4, POND=5, ROCK=6, CAVE=7, …

**Port actuel** : `BattleSetup_GetEnvironmentId` existe (`battle-setup-helpers.ts:248`,
engine) + wire `_BattleSetup_GetEnvironmentId` + `setBattleEnvironment(...)` (battle-init.ts:352).

**Défauts identifiés** :
1. **Tronquée** : s'arrête à `MOUNTAIN → PLAIN` (l.276-280). Manque les branches 1:1
   finales : `SURFING` (pont → POND/WATER), **Route 113 → SAND**, **WEATHER_SANDSTORM → SAND**.
2. **Bug désert** : `IsSandOrDeepSand(tileBehavior)` matche (l.254) alors que le joueur est
   en herbe. **Test runtime OW (2026-06-07)** : à Littleroot la fonction est CORRECTE —
   position lue OK (`currentCoords (12,16)` = internal de (5,9)), behavior `0`, **env = 9
   (PLAIN)**. Donc l'hypothèse « position (0,0) » est **infirmée** ; le bug est spécifique
   à **Route 101** : soit (a) les classifieurs (`IsTallGrass`/`IsSandOrDeepSand`) mal-classent
   le behavior d'herbe de cette route, soit (b) au **moment du boot voie L**, la position lue
   n'est pas la tuile d'herbe (timing). **À confirmer** : lire behavior/env sur Route 101
   dans l'herbe (navigation ou hook log au prochain encounter voie L).
3. **Localisation** : vit dans `battle-setup-helpers.ts` (engine) → à relocaliser dans le
   miroir `src/game/battle_setup.ts` une fois fully-1:1.

**Plan** : (a) confirmer runtime la position/behavior lus ; (b) compléter la fonction 1:1
(branches manquantes) ; (c) fiabiliser `PlayerGetDestCoords` (pas de fallback (0,0) silencieux) ;
(d) relocaliser `battle_setup.ts` dans `src/game/`. A/B.

### 3.2 Flux d'intro décomp (CARTOGRAPHIÉ — battle_main.c)
```
CB2_InitBattle (l.672) : gBattleEnvironment = BattleSetup_GetEnvironmentId()
                         (link/multi → BUILDING l.674) ; DrawBattleEntryBackground() (l.680)
  → BattleIntroGetMonsData                    (3023)
  → BattleIntroPrepareBackgroundSlide         (3372)
  → BattleIntroDrawTrainersOrMonsSprites      (3387)  ← dessine sprites ennemi/joueur 🔴 sprite absent
  → BattleIntroDrawPartySummaryScreens        (3488)
  → BattleIntroPrintWildMonAttacked           (3560)  ← « Un X sauvage apparaît! »
  → BattleIntro(Opp/Player)SendsOutMonAnim    (3607/3736) ← send-out (pokeball.c)
  → TryDoEventsBeforeFirstTurn                (3773)  ← talents/objets switch-in
  → HandleTurnActionSelectionState            (3905)  = MENU
```

### 3.3 Constats
- **Terrain** posé dans `CB2_InitBattle` (l.672) — **même timing** que la voie L (battle-init:352).
  Donc le bug SAND n'est PAS un décalage de timing : c'est la **position/behavior lus sur Route 101**
  (`PlayerGetDestCoords` + `MapGridGetMetatileBehaviorAt`). À confirmer runtime sur Route 101.
- **Background + plateformes** : `DrawBattleEntryBackground` (battle_bg.c) via `sBattleEnvironmentTable[gBattleEnvironment]`.
- **Sprite ennemi** : `BattleIntroDrawTrainersOrMonsSprites` (3387) → c'est là que se situe le « sprite absent ».

### 3.4 Plan d'attaque (ordre flux)
1. **Terrain** : confirmer behavior/env sur Route 101 (runtime ciblé : hook log ou navigation) →
   fix (classifieur OU position lue) + compléter `BattleSetup_GetEnvironmentId` 1:1 (branches SURFING/Route113/SANDSTORM) → relocaliser `src/game/battle_setup.ts`.
2. **Sprite ennemi** : auditer `BattleIntroDrawTrainersOrMonsSprites` voie L vs décomp (garder/jeter).
3. Reconstruire chaque état en `src/game/`, A/B par sous-élément.

---

## 4. Journal
- **2026-06-07** : doc créé. Cap = reconstruction miroir. Maillon ENTRÉE démarré ;
  terrain diagnostiqué (port tronqué + bug position → SAND). Flag voie L remis OFF par défaut.

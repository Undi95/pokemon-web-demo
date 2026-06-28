# Combat 1:1 — Plan de consolidation sur l'archi décomp

> Issu de la recherche multi-agents `map-battle-decomp` (2026-06-01). Tâche **#41**.
> Cartes complètes (cette session) : `…/tasks/whnduktgn.output` (régénérables : Workflow scriptPath `…/workflows/scripts/map-battle-decomp-wf_458d6aff-647.js`).

## 🔑 Le constat (qui change tout)

Le combat a **DEUX implémentations parallèles** :

- **(L) La voie 1:1 décomp — DÉJÀ PORTÉE (~70-80%) mais DORMANTE / INERTE.** Transcrite fidèlement (citations `battle_*.c:ligne`) mais **jamais tickée**, et beaucoup de handlers = **stubs** (« Dette R3 »). Fichiers :
  - `battle-init.ts` — `CB2_InitBattle` / `CB2_InitBattleInternal` (littéral, mais ops vidéo = noop).
  - `battle-cb2.ts` — `BattleMainCB1` / `BattleMainCB2` (controllers noop, non pilotés).
  - `battle-main-functions.ts` — la state-machine `gBattleMainFunc` (intro→tour→fin) — exposée via `globalThis.__battleMainFunctions`, jamais drivée.
  - `battle-turn-dispatch.ts` — `sTurnActionsFuncsTable` + `RunTurnActionsFunctions` + `sEndTurnFuncsTable` + `CheckFocusPunch` (1:1).
  - `battle-turn-helpers.ts` — `SetActionsAndBattlersTurnOrder` + `SwapTurnOrder` (1:1).
  - `handle-action.ts` — `HandleAction_*` (UseMove/Switch/Run/NothingFainted/ActionFinished 1:1 ; **UseItem partiel**, **TryFinish stub**, **Safari/Wally aliasés**).
  - `battle-controller-player.ts` — `PlayerBufferRunCommand` + table 56 cmd **1:1 fidèle**, MAIS handlers majoritairement **stubs** (`CopyPlayerMonData` renvoie 0, `MoveAnimation`/`ExpUpdate`/`DrawTrainerPic`/`IntroTrainerBallThrow`… non portés).
  - `ai/ai-script-commands.ts` — `GetWhoStrikesFirst` (1:1). `try-run-from-battle.ts` — `TryRunFromBattle` (1:1). `wire-bytecode-bridge.ts` — `HandleFaintedMonActions` (bytecode).

- **(V) La voie VIVANTE — `battle-flow.ts`** (monolithe inline ~258 KB) + satellites (`battle-sendout-anim`, `battle-healthbox`, `battle-faint-anim`, `battle-ball-throw`, `battle-intro`, `battle-transition`, `party-storage`, `battle-bag`). Réimplémente les comportements **ad-hoc** (machine à états string `'INTRO_TEXT'`…), cite les mêmes lignes décomp mais **ne suit PAS** la structure CB2/loop/controller.

→ **L'archi décomp est déjà transcrite à ~70-80%, juste inerte. Le combat réel tourne sur le monolithe `battle-flow.ts`.** Le travail n'est donc pas de RÉÉCRIRE — c'est de **CONSOLIDER** (fusionner les 2 voies) + **ACTIVER** le vrai driver + retirer `battle-flow.ts`.

## 🎯 Stratégie

Fusionner en UNE voie fidèle : déplacer les comportements VIVANTS (de `battle-flow`/satellites) **DANS** la structure fidèle (handlers controller + états `gBattleMainFunc`), activer le vrai driver (`BattleMainCB1` → `gBattleMainFunc()` + pump `gBattlerControllerFuncs[i]()` via `gBattleControllerExecFlags`), puis retirer `battle-flow.ts`.

- **Flag** `__USE_DECOMP_BATTLE_LOOP__` (défaut OFF) — bascule `battle-flow` ↔ vraie boucle. **Fallback garanti** (la base reste debout flag OFF).
- **A/B** à chaque phase (œil user sur la ROM).
- **Incrémental + vérif déterministe** (runtime + `coverage:1to1`).

## ⚙️ Le modèle décomp à respecter (exec-flags)

```
[ENGINE] gBattleMainFunc state : pour agir sur un battler →
   BtlController_EmitX(...) écrit gBattleBufferA[battler] ; MarkBattlerForControllerExec → gBattleControllerExecFlags |= bit
[LOOP] BattleMainCB1 chaque frame : gBattleMainFunc() PUIS pour chaque battler gBattlerControllerFuncs[i]()
   PlayerBufferRunCommand : if (execFlags & bit) sPlayerBufferCommands[bufferA[0]]()
[HANDLER] instantané → PlayerBufferExecCompleted() ; async (anim) → installe un poller CompleteOnXxx (NE clear PAS le bit)
[CLEAR] PlayerBufferExecCompleted : gBattlerControllerFuncs[i] = PlayerBufferRunCommand ; execFlags &= ~bit  (→ l'engine avance)
[GATE] chaque état gBattleMainFunc fait `if (gBattleControllerExecFlags) return;` avant d'avancer.
```
La réponse au moteur part via `BtlController_Emit*(B_COMM_TO_ENGINE)` → `gBattleBufferB[battler]`. **Le bit n'est jamais clear dans le handler**, seulement dans `ExecCompleted` (immédiat ou via poller).

## 🧭 Phases (chaque phase = livrable A/B-able derrière le flag)

- **P0 — Driver + harness.** Flag. Faire ticker `BattleMainCB1` (gBattleMainFunc + pump controllers). `CB2_InitBattle → CB2_HandleStartBattle → BattleMainCB1` démarre sans crash. **Remplir le stub bloquant `CopyPlayerMonData`/`SetPlayerMonData`** (sinon toute lecture party = 0). But : la boucle tourne jusqu'au menu action.
- **P1 — Entrée / transition / fade-in / send-out.** États `BattleIntro*` pilotent les controllers (`DrawTrainerPic`, `IntroTrainerBallThrow`, `IntroSlide`, `Task_StartSendOutAnim`). Porter la **machine `Task_BattleTransition` 4-états** (`StartIntro→WaitForIntro→StartMain→WaitForMain` + `IsBattleTransitionDone`/`data[15]`). Relocaliser `battle-sendout-anim`/`battle-intro` dans les handlers. Fade-in.
- **P2 — Boucle de tour.** `HandleTurnActionSelectionState` → `ChooseAction`/`ChooseMove` controllers. `RunTurnActionsFunctions` → `HandleAction_UseMove` → script effet → emits controller (`MoveAnimation`/`DoMoveAnimation`, `HealthBarUpdate`, `PrintString`). Remplir ces handlers depuis le code inliné de `battle-flow`.
- **P3 — Items / switch / run / faint.** `HandleAction_UseItem` COMPLET (ball/medicine/X via `ItemUseInBattle_*` + `ChooseMonForInBattleItem` → party `USE_ITEM` → `ItemUseCB_Medicine`, cf. **#40**), `HandleAction_Switch`, `HandleAction_Run`, `HandleFaintedMonActions`. Sous-écrans party/bag via controller (`ChoosePokemon`/`ChooseItem`).
- **P4 — Fin / sortie / fade-out.** `HandleEndTurn_*`, `CB2_End{Wild,Trainer,Scripted}Battle`, **défaite → `CB2_WhiteOut`** (+ #31), évolution, sortie 1:1 (`CpuFill16(BG_PLTT)` + `ResetOamRange`, pas le fade ad-hoc).
- **P5 — Polish.** Sélection transition par terrain/niveau (`GetWild/TrainerBattleTransition` + tables) ; `GetBattleBGM` par situation (la table trainerClass → seul `MUS_VS_WILD` est câblé) ; les **~40 effets de transition** (seul SLICE existe — A/B) ; les **anims de move** (415 callbacks, **#39**, le gros visuel — A/B).
- **P6 — Retirer `battle-flow.ts`.**

## ⚠️ Pièges identifiés (par les cartes)

1. **Stubs controller dormants** à remplir AVANT d'activer (sinon crash/0) : `CopyPlayerMonData`/`SetPlayerMonData` (party reads=0), `PlayerHandleMoveAnimation`/`PlayerDoMoveAnimation` (state-machine 4 états), `PlayerHandleExpUpdate` (tasks EXP absentes), `PlayerHandleResetActionMoveSelection` (switch décomp manquant = bug latent).
2. **`gMain.inBattle`** = le vrai check « en combat » (déjà posé chez nous, `battle-init.ts:366`) — PAS `gBattleTypeFlags`. (Corriger mon bricolage #28 `setForceInBattle` ici.)
3. **Sortie décomp** = wipe palette **instantané** (`CpuFill16(0,BG_PLTT)` + `ResetOamRange(0,128)`), pas le `BeginNormalPaletteFade` ad-hoc actuel de `CLEANUP_FADE_OUT`.
4. **`HandleAction_TryFinish`** dormant court-circuite `HandleFaintedMonActions` (qui existe en voie bytecode) → recâbler.
5. **Double-impl** : tant que le flag coexiste, ne pas diverger les 2 voies ; la cible est de SUPPRIMER (V).

## 📌 Ordre d'exécution conseillé
P0 (fondation, obligatoire en 1er) → P1 (le « fade d'entrée » que le user voit) → P2 (le cœur jouable) → P3 → P4 (le « fade de sortie ») → P5 (polish visuel, gros A/B) → P6 (cleanup).

---

## ✅ P0 — FAIT + VÉRIFIÉ (2026-06-01)

**Le driver décomp est activé et prouvé vivant.** Flag `__USE_DECOMP_BATTLE_LOOP__`
(défaut OFF). Voie V (battle-flow) **intacte, zéro régression** (vérif runtime : combat
sauvage rend « Un X sauvage apparaît! », 0 erreur, callback1 reste null / gBattleMainFunc
reste BeginBattleIntroDummy = jamais armé flag OFF).

### Fait (faithful, behind-flag, inerte pour V)
1. **Table `gBattlerControllerFuncs` UNIFIÉE** (state.ts) : fusion des 3 copies locales
   (player / opponent-noop / setup). `getBattlerControllerFunc`/`setBattlerControllerFunc`.
   Opponent `_setBattlerControllerFunc` (était NOOP) + setup-helpers branchés dessus.
2. **`_runBattlerController`** (battle-cb2.ts) wiré → `getBattlerControllerFunc(b)()` **non
   gaté** (1:1 BattleMainCB1 ; la func s'auto-gate sur execFlags — gater casserait le 1er tick
   SetControllerToPlayer).
3. **`InitBattleControllers` + `InitSinglePlayerBtlControllers`** portés
   (`battle-controllers-init.ts`, battle_controllers.c:81-235 chemin single+double) + wiré dans
   `CB2_HandleStartBattle` case 15.
4. **Callbacks runtime** : `_SetMainCallback2` (×3 : battle-init/cb2/link-start, étaient NOOP) →
   `getRuntime().SetMainCallback2`. `setMainCallback1` (battle-main-functions) → runtime
   `gMain.callback1` + famille callback1/inBattle/savedCallback exposée sur
   `__battleMainFunctions` (n'était pas exposée → `_setMainCallback1?.()` court-circuitait).
5. **20 `require()` CommonJS → namespaces ESM** (battle-main-functions ×13, cb2 ×2,
   setup-helpers ×3, trainer-party ×1, vblank ×1) : bugs **dormants** qui throw « require is
   not defined » dès que la voie décomp tick.
6. **`gEnemyParty`** : lecture corrigée vers `party-storage.ts` (vivait là, PAS state.ts —
   l'ancien `require('./state').gEnemyParty` renvoyait undefined).
7. **Harness déterministe** `window.__decompBattleLoop.harnessRunDecompLoop()` : tick
   callback1+callback2 à la main N frames, log la progression de gBattleMainFunc.

### Vérifié au runtime (harness, sur état combat V)
Le boot déroule **CB2_InitBattle → CB2_HandleStartBattle (cases 0→1→15→18) → pose
callback1=BattleMainCB1 + callback2=BattleMainCB2 + gBattleMainFunc=BeginBattleIntro +
funcs[0]=SetControllerToPlayer / funcs[1]=SetControllerToOpponent**, puis **BattleMainCB1 tick
fait avancer la machine** : `BeginBattleIntro → BattleIntroGetMonsData → PrepareBackgroundSlide
→ DrawTrainersOrMonsSprites`, avec **controllers qui s'auto-installent + pompent**
(SetControllerTo* → PlayerBufferRunCommand/OpponentBufferRunCommand) et le **cycle exec-flag**
(emit GetMonData → MarkBattlerForControllerExec → handler ExecCompleted → clear → avance).
**Le spine dormant est ALIVE et 1:1.**

### Le mur (= début de P1, tâche #45) — ✅ FRANCHI
La boucle crashait à `BattleIntroDrawTrainersOrMonsSprites` sur `getSpeciesInfo(\`SPECIES_${id
numérique}\`)` → undefined (`getSpeciesInfo` veut une **clé enum string**, + `types`/`abilities`
sont des **strings 'TYPE_X'/'ABILITY_X'**, pas des numériques). Bug systématique des reads
species-data de battle-main-functions.

## ✅ P1 (partiel) — La boucle atteint le MENU D'ACTION (2026-06-02)

**Fix species-data via les helpers CANONIQUES du codebase** (pas de nouveau resolver inventé) :
`reverseDecompConstant(species, 'SPECIES_')` (id→enum) + `resolveDecompConstant('TYPE_X')`
(enum→numérique) — **exactement le pattern de party-storage.ts:837-844** (1:1 décomp
`gSpeciesInfo[species].types/abilities`). 4 sites corrigés dans battle-main-functions
(catchRate, types intro, ability) ; la copie LOCALE buggée de `GetAbilityBySpecies` (traitait
`.abilities` comme number[]) supprimée → import du canonique party-storage.

**Vérifié au harness (no crash, `reachedActionMenu: true`)** : la boucle walk l'intro ENTIÈRE
`BeginBattleIntro → GetMonsData → PrepareBackgroundSlide → DrawTrainersOrMonsSprites →
DrawPartySummaryScreens → PrintWildMonAttacked → PrintPlayerSendsOut → Player1SendsOutMonAnim
→ TryDoEventsBeforeFirstTurn → **_HandleTurnActionSelectionStateStub**` (la frontière du menu),
controllers qui pompent tout du long. **Voie V intacte, 0 régression, 0 erreur** (re-vérifié).

### Reste P2 (turn loop + données in-game)
- `HandleTurnActionSelectionState` est encore un **stub** (délègue à battle-flow) → porter la
  vraie fn (~400 l, battle_main.c:4129+) qui emit ChooseAction au player controller
  (`HandleInputChooseAction` est déjà complet).
- **Peupler `gBattleMons` via les controllers pendant l'intro** (`CopyPlayerMonData`/
  `SetPlayerMonData` sont des stubs→0) : le harness a marché car la voie V avait pré-rempli
  gBattleMons ; en boot flag-ON in-game (sans V), il faudra que l'intro remplisse les données
  (1:1 : BattleIntroGetMonsData → GetMonData controller → gBattleMons). + gEnemyParty
  décomp-shaped par l'entrée. Flag OFF → **zéro impact prod**.

## ✅ P2 (partiel) — Menu d'action VIVANT + IPC controller câblé (2026-06-02)

**Activé la vraie `HandleTurnActionSelectionState`** (battle-action-selection.ts, port 1:1) à la
place du stub (`TryDoEventsBeforeFirstTurn` → `gBattleMainFunc = HandleTurnActionSelectionState`
via lazy-global `__battleActionSelection`, cycle ESM évité). **Câblé les stubs IPC noop** de
battle-action-selection (= la divergence non-1:1 qui faisait AUTO-CONFIRMER sans attendre l'input) :
- `BtlController_EmitChooseAction` / `EmitChooseMove` → écrivent bufferA (CONTROLLER_CHOOSEACTION
  0x12 / CHOOSEMOVE 0x14) via `PrepareBufferDataTransfer` (1:1 battle_controllers.c:1199/1219).
  ChooseMove n'écrit que l'opcode (notre PlayerHandleChooseMove relit gBattleMons, pas le struct).
- `MarkBattlerForControllerExec` → set le bit exec flag. `IS_BATTLE_CONTROLLER_ACTIVE...` →
  check le bit (était `return false` = auto-confirm → **bug non-1:1 corrigé**).

**Vérifié au harness (no crash)** : menu d'action **VIVANT** — `HandleTurnActionSelectionState`
émet ChooseAction → player controller installe `HandleInputChooseAction` (attend l'input), 1:1.

### ⚠️ Limite harness + mur P2 (tâche #46)
Le harness tick le combat de façon **SYNCHRONE**. OK pour l'intro + atteindre le menu (pas
d'attente async). Mais dès qu'on **simule l'input** (presser A), la réponse (action-confirm →
EmitChooseMove → menu moves) **gèle le thread** = boucle within-frame / récursion (probablement
un poller/affichage qui attend un timer `setTimeout`, non exécutable pendant une boucle
synchrone ; ou une vraie boucle dans MoveSelectionDisplay* / DoBounceEffect). **A gelé l'onglet
preview 3× → harness neutralisé** : `harnessDriveTurn(maxFrames, injectInput=false)` par défaut
ne touche PAS l'input ; `harnessRunDecompLoop` sauvegarde/restaure les callbacks (→ plus d'écran
noir post-test).

**Pour finir P2** : (a) diagnostiquer la boucle post-A (lecture MoveSelectionDisplayMoveNames /
DoBounceEffect, OU probe **frame-loop ASYNC** où les setTimeout tournent) ; (b) la suite
SetActionsAndBattlersTurnOrder → RunTurnActionsFunctions → HandleAction_UseMove dispatch
(l'exécution du move = bytecode **déjà vérifié 1:1**, ~150 moves). Flag OFF → **zéro impact prod**.

## 🔬 MATRICE DE VÉRIFICATION 1:1 (sims harness, 2026-06-02)
**Vérifié 1:1 (calcul, via bytecode partagé V↔L + pipeline L)** :
- **Stats** : IV+nature+formule Gen3 EXACT (Pikachu Lv50 Adamant : 5/5 stats au point près). EV dans la formule (EV/4) mais pas testé indépendamment (mon frais = EV0 ; calc partagé OW/V).
- **Dégâts** (calcul officiel), **crits**, **STAB**.
- **Types** : super-efficace (flags=2), immunité (flags=8, dmg=0), résistance, **double faiblesse ×4** (Séisme vs Élec/Acier), types composés. Messages FR (« super efficace! », « n'affecte pas X »).
- **Talents in-combat** : Lévitation immunise Sol (dmg=0). `gBattleMons.ability` peuplé + bytecode l'applique.
- **Stat-changes** (Leer→Def−1), **statuts** (Cage-Éclair→paralysie status1=64).
- **Tour complet** : 2 tours, ciblage par-battler, faint→« K.O. »→EXP(15)→WON→fade de sortie (FreeResetData).

**⚠️ PAS FINI — stubs LOGIQUES restants (PAS des anims)** :
1. **Abilities on SWITCH-IN** (Intimidate, Trace, Drizzle/Drought, Forecast…) = `HandleFaintedMonActions` case 6 STUB + l'intro. Logique manquante.
2. **Combats DRESSEUR** : `HandleEndTurn_BattleWon/Lost` cas trainer/link posent encore `gBattlescriptCurrInstr = <stub {}>` (seul le cas WILD est câblé sur le ctx). + argent gagné, "le dresseur envoie X".
3. **Intégration IN-GAME flag-ON** : le harness SIMULE le setup (gBattleMons via fillActive, gBattlerTarget, gSentPokesToOpponent, moveTarget[], actions). En vrai jeu il faut :
   - **(3a) ✅ FAIT — gBattleMons via l'intro** : `_readBattleMonFromBuffer` (battle-main-functions:474) ÉTAIT un stub (comme `_CopyPlayerMonData`/`_SetPlayerMonData` 716/724) → le port n'utilise pas le buffer IPC 88 bytes, il s'appuie sur `fillActiveBattleMonsForBattleStart`. **Corrigé** : `_readBattleMonFromBuffer` appelle maintenant `fillActiveBattleMonsForBattleStart` (party→gBattleMons direct, 1:1-observable, le buffer IPC est inutile en single-player local). **Vérifié** : boot L (harnessRunDecompLoop après startWild) → `gBattleMons` peuplé correctement (species 277/286, hp 20/22, atk 11, niveaux 5/7), 0 crash. NB : le boot L SYNC s'arrête à `BattleIntroPrintPlayerSendsOut` (= les textes d'intro `setTimeout` ne tournent pas en boucle synchrone — limite connue du harness sync, PAS de mon fix ; avec `__battleTextInstant` ou un boot-loop ASYNC ça passe). `_CopyPlayerMonData`/`_SetPlayerMonData` restent stubs mais inutilisés (le port court-circuite le buffer).
   - **(3b) menu→turn** : HandleTurnActionSelectionState→SetActionsAndBattlersTurnOrder (pose moveTarget[]/gActionsByTurnOrder/gBattlerByTurnOrder) → RunTurnActionsFunctions ; + le send-out pose gSentPokesToOpponent.
   → **le combat flag-ON ne tourne pas encore in-game**, seulement au harness.
4. **Edge cases NON testés via L** : miss (accuracy), joueur KO (PARTY_ACTION_SEND_OUT mon suivant), multi-hit, moves multi-tours (charge/recharge), recoil/drain, effets secondaires (% burn d'Ember…), substitute, multi-cibles. (Le bytecode les gère ~150 moves, mais le pipeline L ne les a pas tous exercés.)

→ **Verdict** : le MOTEUR/calcul est 1:1 ; le COMBAT COMPLET JOUABLE in-game n'est PAS fini (intégration + abilities switch-in + dresseur + edge cases = logique, pas anims).

## 🔑 SPEC d'exécution du tour 1:1 (la racine des « patchs ») — 2026-06-02

**LE constat qui explique pourquoi on patchait** : DEUX modèles d'exécution incompatibles.
- **Voie V** : `runMoveScriptViaBytecode` calcule le move **ENTIÈREMENT en synchrone** (boucle
  bornée 200 + stuck-detector), produit dégâts + liste de messages, PUIS battle-flow rend en
  async (setTimeout). Calcul et rendu **découplés**.
- **Décomp (cible)** : `HandleAction_RunBattleScript` (battle_util.c:3805) =
  `if (gBattleControllerExecFlags == 0) gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]();`
  → **interleavé per-frame** : une rafale de commandes jusqu'à ce qu'une commande (printstring/
  animation) pose un exec-flag + yield ; le controller rend + **clear le flag per-frame** ; la
  commande suivante reprend. Le texte avance via `RunTextPrinters` per-frame (PAS setTimeout).

**Les `setTimeout` du texte (battle-controllers `BattlePutTextOnWindow`) = LA divergence non-1:1
racine** : ils ne s'intègrent pas au modèle exec-flag (et gèlent le tick synchrone). C'est ça
qui force les patchs : le pacing/complétion n'étant pas 1:1, les pièces ne s'emboîtent pas.

### Les 3 pièces à porter (interconnectées) pour le tour 1:1
1. **ctx de script PERSISTANT** (= `gBattlescriptCurrInstr` décomp) : posé par `HandleAction_UseMove`
   (il calcule déjà `scriptPtr` mais le perd faute de ctx — handle-action.ts:341), steppé par
   `HandleAction_RunBattleScript`. Le threader dans `sTurnActionsFuncsTable` (battle-turn-dispatch).
2. **`HandleAction_RunBattleScript`** (actuellement NO-OP) → `if (gBattleControllerExecFlags === 0)
   runBattleScript(ctx)` (1:1). `runBattleScript` (script-interpreter.ts:496) step déjà une rafale
   jusqu'à `paused` (borné MAX=10000 = jamais de freeze).
3. **Complétion controller PER-FRAME** (= le gros) : les commandes printstring/animation doivent
   `MarkBattlerForControllerExec` (poser le flag → yield), et les controllers le **clear per-frame**
   quand fini : texte via `RunTextPrinters` + `IsTextPrinterActive` (1:1, **supprimer le
   setTimeout** de BattlePutTextOnWindow), anim via anim-done, healthbar via CompleteOnHealthbarDone.

→ Une fois ces 3 en place, le tour s'exécute 1:1 (sync ET async), le rendu s'enchaîne, et les
sous-systèmes (faint, exp, switch, fin) s'emboîtent au lieu d'être patchés. Vérif = **frame-loop
ASYNC** (pas le tick synchrone). Flag OFF → zéro impact prod. Move engine = bytecode déjà 1:1.

### ✅ VALIDÉ 2026-06-02 — un TOUR COMPLET tourne 1:1 via la voie L (dégâts inclus)

Harness async : `window.__decompBattleLoop.harnessExecuteTurnL({forceMoveNum, playerSpecies, enemySpecies, enemyLevel, bothTurns, maxFrames, frameDelayMs})` (battle-decomp-loop.ts). Monte un combat ad-hoc (fillActiveBattleMonsForBattleStart), installe Player/Opponent controllers, pose un tour (`[USE_MOVE, FINISHED]` joueur seul, ou `[USE_MOVE, USE_MOVE]` si bothTurns), tick `RunTurnActionsFunctions` + controllers per-frame en ASYNC. **Résultats prouvés** :
- **1 tour** : Treecko Lv15 Pound → Poochyena Lv25 = dégâts appliqués à la cible, `reachedEnd=true`, script EffectHit déroulé en entier (attackcanceler→accuracycheck→attackstring→…→damagecalc→datahpupdate→…→moveend→end), pacing per-frame respecté (script bloqué ~320 frames sur le texte, puis reprend).
- **Faint** : Pound Lv30 → Poochyena Lv2 = HP→0, dégât capé au HP restant (1:1 adjustdamage), `tryfaintmon` + saut vers le faint script, `reachedEnd=true`.
- **Combat 2-tours (bothTurns)** : joueur 34 dmg (+ **« Coup critique! »** message 1:1) → ennemi riposte 15 dmg au joueur. **Les deux camps se ciblent et s'infligent les bons dégâts**, `reachedEnd=true`.
- **Effets non-dégâts** : Leer (Groz'Yeux) → Def cible 6→5 + msg « Ah, DÉFENSE … baisse! » ; Thunder Wave (Cage-Éclair) → `status1=64` (paralysie) + msg « … est paralysé! » + `updatestatusicon`. **Tous les types d'effets (dégâts/stat/statut) s'exécutent 1:1 headless.**

**Limite headless connue** : les Emit* à poller d'anim VISUELLE (FaintAnimation→slide, ExpUpdate→barre, StatusAnimation, SpriteInvisibility) bloquent en headless (pas de scène Phaser) → ils restent **enqueue-only** pour l'instant (à câbler vers bufferA AVEC le rendering L ; ils marcheront in-game avec scène). Les Emit* à handler clear-immédiat (Print/Move/Hit/PlaySE/HealthBar) sont câblés bufferA et vérifiés.

### 🔚 Fin de combat — mécanisme cartographié + infra posée (2026-06-02, choix user)

**Le flux décomp de fin de combat (compris)** : `Cmd_end` → `gCurrentActionFuncId=B_ACTION_TRY_FINISH` → `RunTurnActionsFunctions` → `HandleAction_TryFinish` (battle_util.c:638) → `HandleFaintedMonActions()` (battle_util.c:1877, **state machine** `faintedActionsState`) :
- **case 0** : restaure les absent-flags des battlers qui ont des mons (HasNoMonsToSwitch) → case 1.
- **case 1-2** : pour chaque battler KO (hp==0, pas déjà exp, pas absent) → `BattleScriptExecute(BattleScript_GiveExp)` (= EXP+niveau), return TRUE.
- **case 3-5** : pour chaque battler KO → `BattleScriptExecute(BattleScript_HandleFaintedMon)` (= faint anim + « K.O. » + envoi du suivant / yes-no wild / fin), return TRUE.
- **case 6** : Intimidate/Trace/Item/Forecast on switch-in → return TRUE si effet.
- **case 7 (MAX)** : done → return FALSE → `HandleAction_TryFinish` pose `gCurrentActionFuncId=B_ACTION_FINISHED`.

**Le mécanisme de script imbriqué (LA pièce clé, PORTÉE)** : `BattleScriptExecute(label)` (battle_util.c:3184) pose `gBattleScriptContext.scriptPtr`, **push gBattleMainFunc** sur un callback stack, bascule `gBattleMainFunc = RunBattleScriptCommands_PopCallbacksStack` + `gCurrentActionFuncId=0`. `RunBattleScriptCommands_PopCallbacksStack` (battle_main.c:5251) : **si gCurrentActionFuncId==TRY_FINISH/FINISHED → pop le callback stack** (restaure gBattleMainFunc) ; sinon → step le script. Les scripts GiveExp/HandleFaintedMon finissent par **`end2`** (pose `gCurrentActionFuncId=TRY_FINISH`) → PopCallbacksStack détecte → pop → retour à RunTurnActionsFunctions → TryFinish reprend (case suivant). ✅ **Porté dans battle-main-functions.ts** : `gBattleCallbackStack`, `RunBattleScriptCommands_PopCallbacksStack`, `BattleScriptExecute(label)` réel (= plus le stub), exposés sur `__battleMainFunctions`. `Cmd_end2` (voie L) pose déjà TRY_FINISH. tsc 0 erreur. Voie V intacte (BattleScriptExecute n'était appelé que par Arena, deferred).

**✅ FAIT (reprise 2026-06-02)** : `HandleFaintedMonActions` (state machine case 0-7, version L per-frame = return TRUE après chaque `BattleScriptExecute` au lieu de la boucle sync de la voie V) + `HandleAction_TryFinish` 1:1 portés dans **handle-action.ts** (appellent `BattleScriptExecute` via le hook `__battleMainFunctions` ; helpers `_HasNoMonsToSwitchHFM`/`_OpponentSwitchInResetHFM` inline copiés de wire-bytecode-bridge ; case 6 ability/item switch-in = dette ponctuelle → state 7). `harnessExecuteTurnL` tick maintenant `gBattleMainFunc` DYNAMIQUEMENT (`bmf.getBattleMainFunc()()` + `setBattleMainFunc(RunTurnActionsFunctions)` au setup). tsc 0 err. **Vérifié au harness** : Treecko Lv30 Pound → Poochyena Lv2 KO → **le combat se termine sur `gBattleOutcome=WON`** (`out=1`, `reachedEnd=true`, RunTurnActionsFunctions force B_ACTION_FINISHED quand outcome!=0 → fin de tour).

**✅ RÉSOLU + FIN DE COMBAT 1:1 QUI TOURNE (reprise 2026-06-02)** : la cause du court-circuit était un **hack non-1:1 dans `Cmd_tryfaintmon`** (battle-script-commands.ts:1421/1434) : `setBattleOutcome(WON/LOST)` direct (commentaire « fallback for our test ») → l'outcome posé AVANT `end` → RunTurnActionsFunctions force FINISHED. Le vrai `Cmd_tryfaintmon` ne pose PAS l'outcome (c'est `checkteamslost` dans HandleFaintedMon, APRÈS GiveExp). **Fix** : gaté `if (ctx !== gBattleScriptContext)` (= voie V garde le hack, voie L suit le 1:1).

**Vérifié au harness** (Treecko Lv15 Pound → Poochyena Lv2) — le flux complet 1:1 déroule : move → `tryfaintmon` → `BattleScript_FaintTarget` → **« MEDHYENA sauvage est K.O.! »** → `end` → **act=11 TRY_FINISH** → `HandleFaintedMonActions` **case 1 → BattleScriptExecute(GiveExp)** (mf=`RunBattleScriptCommands_PopCallbacksStack`, fas=2 — le callback stack marche !) → **case 4 → HandleFaintedMon** (fas=5) → **`checkteamslost` → gBattleOutcome=WON** (au BON moment, après GiveExp) → FINISHED → **combat terminé (WON)**, reachedEnd. Le mécanisme de script imbriqué + la state machine + l'ordre EXP→checkteamslost = **exactement le décomp**. Les anims n'ont pas bloqué (les attentes étaient les textes via setTimeout).

**✅✅ FIN DE COMBAT COMPLÈTE 1:1 (reprise 2026-06-02)** : KO → « X est K.O.! » → GiveExp → **« X a gagné 15 points EXP! » + XP déposée (partyExpGain=15, = 52×2/7 ≈ 15 yield Poochyena Lv2, 1:1)** → checkteamslost → WON → combat terminé. Vérifié harness.

**Bug du port corrigé** (diagnostiqué par instrumentation log) : `Cmd_getexp` ne **restait pas sur son opcode** — `readByte` avançait `ctx.scriptPtr` à chaque appel, donc le ptr filait vers `end2` après 1 frame et la state machine `getexpState` ne progressait jamais (restait à 0, log confirmé). Le décomp `getexp` ne consomme `gBattlescriptCurrInstr += 2` QU'au state final (case 6) ou jump (case 4 level-up). **Fix** : `if (gBattleScripting.getexpState !== 0 && ctx.scriptPtr === opStartPtr + 2) ctx.scriptPtr = opStartPtr;` à la fin (= reste sur l'opcode tant que la machine tourne, sans casser le jump level-up). NB : `getexp` est 1:1 complet (case 3 = SetMonData EXP party, case 4 = level-up getLevelFromExp + BattleScript_LevelUp).

**✅ MICRO-GLITCH RÉSOLU** : le message gain-EXP affichait un parasite « {B_DEF_NAME_WITH_PREFIX} n'est pas affecté! » car `Cmd_getexp` hardcodait **de mauvaises valeurs STRINGID** : `39`/`53` au lieu des vraies (battle_string_ids.h : `STRINGID_EMPTYSTRING4=329`, `STRINGID_ABOOSTED=330`). Corrigé → message propre **« ARCKO a gagné\n15 points EXP.! »**. (⚠️ pattern à auditer : d'autres STRINGID hardcodés faux possibles ailleurs.)
**✅✅✅ COMBAT COMPLET 1:1 — ATTAQUE → FADE DE SORTIE (reprise 2026-06-02)** : vérifié harness, la chaîne ENTIÈRE déroule sur la voie L : move → K.O. → GiveExp (« 15 points EXP.! ») → checkteamslost WON → FINISHED → **`HandleEndTurn_BattleWon`** (pose BattleScript_PayDayMoneyAndPickUpItems) → **`HandleEndTurn_FinishBattle`** (step le script PayDay) → `end` → TRY_FINISH → cleanup (record party/TV/shiny) + BeginFastPaletteFade + FadeOutMapMusic → **`FreeResetData_ReturnToOvOrDoEvolutions`** (retour overworld). `reachedEnd=true`.
**Fix** : `HandleEndTurn_BattleWon` (cas wild) posait `gBattlescriptCurrInstr = <stub {}>` → corrigé en `gBattleScriptContext.scriptPtr = getBattleScriptOffset('BattleScript_PayDayMoneyAndPickUpItems')` ; `HandleEndTurn_FinishBattle` else était un stub (« battle-flow handle ça ») → corrigé en `if (execFlags==0) stepBattleScriptCommand(gBattleScriptContext)` (1:1 battle_main.c:5251 RunBattleScriptCommands). Harness : continue après fin-de-tour si outcome!=0 jusqu'à l'état terminal.

**NEXT** : (1) câbler les autres cas de `HandleEndTurn_BattleWon`/`_BattleLost`/`_RanFromBattle` vers le ctx (link/trainer = stubs {} pour l'instant ; le wild marche) ; (2) auditer d'autres STRINGID hardcodés faux ; (3) level-up effectif (BattleScript_LevelUp) ; (4) menu→turn + gBattleMons via intro (pour le combat flag-ON in-game) ; (5) rendu visuel (faint slide, barre EXP, fade) = A/B in-game.

**Ce qui a été fait (les 3 pièces, raffinées vs la spec ci-dessus)** :
1. **ctx persistant** = `gBattleScriptContext` singleton exporté de script-interpreter.ts (= `gBattlescriptCurrInstr`). `HandleAction_UseMove` y pose `scriptPtr` (défaut = singleton, plus de `if (ctx)`). `HandleAction_ActionFinished` reset le `scriptPtrStack`.
2. **`HandleAction_RunBattleScript`** = `if (gBattleControllerExecFlags === 0) stepBattleScriptCommand(ctx)`. ⚠️ correctif vs spec : PAS `runBattleScript` (rafale + `tickBattleControllers` qui CLEAR tous les flags = la vraie divergence racine, court-circuitait le gating). Ajouté **`stepBattleScriptCommand`** = 1 commande/frame SANS tick. Transition `EXEC_SCRIPT → TRY_FINISH` = `_Cmd_end`/`_Cmd_end2` (script-interpreter, opcode 0x3D/0x3E) posent `gCurrentActionFuncId = B_ACTION_TRY_FINISH` (1:1 battle_script_commands.c:3960) — **gaté `if (ctx === gBattleScriptContext)`** pour ne pas casser la voie V (qui lit gMoveResultFlags après la boucle).
3. **Emit* → bufferA** : `BtlController_EmitPrintString` + `EmitMoveAnimation`/`EmitPlaySE`/`EmitHitAnimation`/`EmitHealthBarUpdate` écrivent maintenant `gBattleBufferA` via `PrepareBufferDataTransfer` (helper `_emitToBufferA`, 1:1 décomp) EN PLUS de `enqueueBattleEvent` (compat V). Sans ça, le controller relisait un vieux opcode → blocage. Texte = encore le `setTimeout` de BattlePutTextOnWindow (pacing OK en async ; le vrai `RunTextPrinters` = raffinement M2 différé).

**Voie V intacte** (gating par ctx local ≠ singleton + Emit additifs). **Tout derrière le flag.**

**RESTE pour un combat flag-ON complet** (NEXT) : (a) câbler les Emit* restants (FaintAnimation, StatusAnimation, ExpUpdate, StatusIconUpdate…) ; (b) séquence de faint (tryfaintmon→dofaintanimation→…) ; (c) intégration menu→turn (HandleTurnActionSelectionState→SetActionsAndBattlersTurnOrder→RunTurnActionsFunctions) ; (d) peupler gBattleMons via les controllers d'intro (CopyPlayerMonData stub→0) ; (e) M2 : texte réel via RunTextPrinters (tuer le setTimeout) ; (f) ✅ ciblage par-battler : `_getMoveTargetForBattler` lit maintenant `gBattleStruct.moveTarget[battler]` (1:1) — reste à câbler l'ÉCRITURE de `moveTarget[]` par la sélection in-game (SetActionsAndBattlersTurnOrder) ; le harness la pose manuellement.

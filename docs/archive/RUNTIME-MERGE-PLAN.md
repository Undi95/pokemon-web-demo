# RUNTIME-MERGE-PLAN — chantier « c » (fusion des runtimes en 1 scène = LE JEU)

> Statut : **PLAN (audit read-only fait 2026-06-22, zéro code)**. Objectif : aligner
> l'architecture du port sur la décomp — **1 runtime global + `SetMainCallback2`** pour
> toute la « ROM », au lieu de N scènes Phaser qui chacune `new DecompRuntime` + `scene.start`.

## 1. Constat (audit 2026-06-22)

### Chemin de scènes RÉELLEMENT vivant
```
TestGbaScene (écran de test, press A)  →  GameScene  →  TestOverworldScene
   (harness self-test, PAS le jeu)        (1 runtime :       (runtime #2 :
                                           Copyright→Intro→     overworld,
                                           Title→MainMenu→      MainCB2_Overworld)
                                           Birch)
```
- Chaque scène fait `new Gba()` + `new GbaPhaserBridge()` + `new DecompRuntime()` +
  `setGlobalRuntime()` + register sprite callbacks + `installEngineDevtools` +
  `installInputHandlers`. Les transitions = `this.scene.start('X')` (= jette le runtime
  courant, en recrée un neuf).
- L'état de jeu traverse la frontière via **les globals module** (`gSaveBlock1/2Ptr`,
  `gameState`, flags/vars, `assetCache`, tables constants) qui SURVIVENT au `scene.start` ;
  le runtime instance (gSprites/gTasks/gMain/VRAM/palettes) est, lui, jeté + recréé.

### Hosts MORTS (registered mais jamais `scene.start`'d) — à supprimer
- **`BirchRuntimeScene`** : zéro `scene.start('BirchRuntimeScene')` dans tout `src/`
  (grep exhaustif). Le flow Birch tourne DANS GameScene (`main_menu-callbacks-auto.ts:510`
  pose `task.func = Task_NewGameBirchSpeech_Init` dans le runtime courant). Confirmé par
  `party-screen.ts:550` (« BirchRuntimeScene est skippé »). = host alternatif legacy.
- **`OverworldScene`** : déjà documentée LEGACY/morte (main.ts:219, déjà dé-importée).

### La décomp (cible)
`AgbMain` (main.c) : **1 seul** runtime global. Copyright / Intro / Title / MainMenu /
Birch / Overworld / Battle = tous des **CB2** (fonctions) échangées via `SetMainCallback2`,
partageant gMain/gSprites/gTasks/palettes/VRAM. Chaque CB2 d'init fait ses propres
`ResetTasks`/`ResetSpriteData`/`ResetPaletteFade`/BG setup. **Pas de frontière de scène.**

### Conséquence
La fusion « c » se réduit à **UNE seule frontière vivante à éliminer** :
`GameScene → TestOverworldScene`. (+ retrait des 2 hosts morts + de l'écran de test.)

## 2. Décision produit (user 2026-06-22)
- **Retirer `TestGbaScene`** du boot par défaut : la scène unique boote **directement**
  sur `CB2_InitCopyrightScreenAfterBootup` (= comme `AgbMain`), plus d'écran de test ni de
  « press A » d'entrée.
- ⚠️ **Geste audio** : le press-A de TestGbaScene servait (entre autres) de geste
  d'déverrouillage Web Audio (navigateurs exigent une interaction avant de jouer du son).
  En le retirant : l'intro démarre potentiellement **muette** jusqu'au 1er input du joueur.
  Options (à trancher à l'implémentation) : (a) accepter le silence jusqu'au 1er appui ;
  (b) mini overlay « clic pour démarrer » DOM (pas une scène Phaser) qui unlock l'audio
  puis se retire ; (c) resume l'AudioContext au 1er `keydown` global. Garder TestGbaScene
  dispo en option dev (`?testgba`) si utile.

## 3. Cible architecture
- **1 scène hôte** (= renommer `GameScene` en `RomScene`, ou la garder telle quelle) avec
  **1** `Gba` + **1** `DecompRuntime` + **1** bridge pour TOUTE la session.
- Transition vers l'overworld = `SetMainCallback2(MainCB2_Overworld)` **dans le même
  runtime** (1:1 décomp), au lieu de `scene.start('TestOverworldScene')`.
- Le setup OW (aujourd'hui dans `TestOverworldScene.bootOverworld`) migre dans une
  fonction réutilisable `enterOverworld(rt)` appelée quand le CB2 overworld prend la main.

## 4. Inventaire setup par scène (ce qui doit converger)
| Élément | GameScene | TestOverworldScene |
|---|---|---|
| Gba + bridge + DecompRuntime | new (jeté à la transition) | new |
| setGlobalRuntime / resetObjAllocations / exposeGbaGlobals / InitKeys | ✓ | ✓ |
| sprite callbacks | intro/title/credits (~30, register manuel) | (OW : dispatch globalThis) |
| devtools / input handlers | ✓ | ✓ |
| spécifique OW | — | `SetFieldEffectRuntime`, `__phaserOverworldScene`, gPlayerAvatar/gTotalCamera globals, wild_encounter init, PlayTimeCounter_Start, BG0-3 config, map load |
| boot | `bootIntro` : preload intro/title/birch + `SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)` | `bootOverworld` : BG config + load map |
| sortie | `update` détecte CB2_NewGame/ContinueSavedGame → `scene.start('TestOverworldScene')` | — |

**Seam décomp** : `CB2_NewGame` / `CB2_ContinueSavedGame` (overworld.c) font
`NewGameInitData`/load + `gFieldCallback = …` + `SetMainCallback2(CB2_Overworld)`.
Le port HIJACKE ces CB2 dans `GameScene.update` (null-out + scene.start) car les versions
auto (`overworld-callbacks-auto.ts`) sont incomplètes (refs `LoadSaveblockMapHeader` etc.).
→ La fusion doit router le setup OW (de `bootOverworld`) au moment où ce CB2 fire, **sans**
changer de scène.

## 5. Étapes incrémentales (A/B RÉEL par étape — jamais big-bang)

> Rappel A/B intro : URL `/` (défaut) + presser A pour passer l'écran de test **tant qu'il
> existe** ; une fois Step 5 fait, boot direct. Cf. [[reference-scene-architecture]].

- ✅ **Step 0 — Filet (FAIT `cc273d2e`)** : `BirchRuntimeScene` dé-enregistré de `main.ts`
  (OverworldScene l'était déjà). A/B : boot + chaîne TestGba→GameScene intacte.
- ✅ **Step 2.1 — Extraire `intro-host.ts` (FAIT `0cd0591c`)** : boot intro (registerIntro
  SpriteCallbacks + bootIntroSequence) extrait de GameScene en module réutilisable. Pur
  refactor, A/B intro identique.
- ✅ **Step 2.2 — Host unifié gated ?unified (FAIT `0c99b552`)** : TestOverworldScene boote
  l'intro dans SON runtime puis enchaîne l'OW via CB2_NewGame/Continue → transitionToOverworld
  (resets 1:1 + bootOverworld) dans le MÊME runtime, sans scene.start. Gated ?unified (défaut
  GameScene intact). A/B : ?unified intro boote+rend dans TestOverworldScene ; ?nointro intact.
  ⏳ RESTE à valider : la transition intro→OW en playthrough complet (New Game→Birch→OW).
- 🟡 **Step 2.3 — Transition validée en playthrough (gated)** : le joueur a fait New Game→Birch→
  May→UNDI→camion→save→load dans UNE scène unifiée ✅ (mécanisme PROUVÉ). Bugs trouvés+corrigés :
  - `resetObjAllocations`/`resetObjectEventAllocations` (NPC invisible/fenêtre corrompue au step-off, `cc…`→`f03435df`).
  - clear MOSAIC/WIN/BLD registres (« ombre » BLDY sur le dialogue = blend résiduel intro, `f03435df`).
  - **FPS : AUCUNE régression** — `game.loop.actualFps` (overlay) = ~45-47 PARTOUT (défaut+unifié,
    intro+OW) ; logique = 60 Hz (frame counter ?nointro 62.9). Le ~47 = baseline rendu engine/preview.
- ⏭️ **Step 2.4 — PORT overworld.c → overworld.ts 1:1 (option 2 user, GROS chantier)** : le cœur
  du boot OW est éparpillé ad-hoc dans TestOverworldScene (MainCB2_Overworld = closure ;
  ResetScreenForMapLoad/InitOverworldGraphicsRegisters = partiels dans loadAndInitMap = juste
  DISPCNT save/restore → d'où les trous WIN/BLD/MOSAIC). Porter ces fns dans src/game/overworld.ts
  en miroir 1:1 de la décomp → le boot unifié passe par la chaîne EXACTE, les clears ad-hoc de
  `f03435df` deviennent superflus. PUIS flipper le défaut → host unifié + retrait GameScene/TestGba.
- **Step 1 (ancien) — Extraire `enterOverworld(rt)`** : sortir tout le corps de
  `TestOverworldScene.bootOverworld` (+ les wires create() OW : SetFieldEffectRuntime,
  globals __phaserOverworldScene/gPlayerAvatar/gTotalCamera, wild_encounter, play_time) en
  une fonction pure réutilisable prenant le runtime + la scène hôte. `TestOverworldScene`
  l'appelle (host inchangé). **Pur refactor, zéro changement de comportement.** A/B : OW
  identique (?nointro). *(Pose la couture testable.)*
- **Step 2 — GameScene héberge l'OW (LE cœur)** : dans `GameScene.update`, quand
  `CB2_NewGame`/`CB2_ContinueSavedGame` fire, au lieu de `scene.start('TestOverworldScene')`,
  appeler `enterOverworld(this.rt)` **dans le même runtime** + `SetMainCallback2(MainCB2_Overworld)`.
  Avant l'entrée OW : `ResetSpriteData`/`ResetTasks`/`ResetPaletteFade` + BG reset (1:1 décomp,
  car intro/title/menu laissent sprites/tasks/VRAM). Garder `TestOverworldScene` pour le
  raccourci `?nointro` (= il crée encore son runtime, debug only). A/B : new game complet
  (intro→…→Birch→**OW sans changement de scène ni flash noir**), continue, combat, save.
  *(Plus gros risque ; bénéfice max = supprime la frontière + corrige probablement le flash
  de transition.)*
- **Step 3 — `?nointro`/`?debug` sur la scène unique** : router le raccourci debug vers la
  scène hôte unique qui saute direct à `enterOverworld` (preset), au lieu de
  `TestOverworldScene`. A/B : `?nointro` + `?debug` (preset Algatia/Mossdeep + 8 badges).
- **Step 4 — Boot direct + retrait TestGbaScene** : scene array par défaut = **[RomScene]**
  (+ DebugOverlay). Boot direct sur la chaîne copyright/intro, plus de press-A. Gérer le
  geste audio (cf. §2). A/B : refresh → intro joue direct ; son OK après 1er input.
- **Step 5 — Nettoyage** : supprimer les fichiers de scènes morts (`BirchRuntimeScene`,
  `OverworldScene`, `TestOverworldScene` comme host séparé), consolider en 1 `RomScene`.
  **A/B régression COMPLÈTE** : intro, titre, menu, new game, Birch (release Lotad rose +
  naming + gender), OW, warps, combats sauvages + dresseurs, save/continue, bag, party,
  field moves, baies.

## 6. Risques & points de vigilance
1. **Reset d'état à l'entrée OW** : l'OW suppose gSprites/gTasks vides + BG/palette propres.
   En runtime partagé, l'intro/title/menu laissent du résidu → exécuter les resets décomp
   (`ResetSpriteData`/`ResetTasks`/`ResetPaletteFade`/`ResetBgsAndClearDma3BusyFlags`) à
   l'entrée OW (la décomp les fait déjà dans CB2_Overworld/field init).
2. **VRAM/palette** : config BG title/menu ≠ OW (charBase/mapBase). Reset complet requis.
3. **Préchargement assets OW** : `bootOverworld` charge la map on-demand ; garantir le load
   AVANT la 1ère frame OW (la transition actuelle await déjà la fade — réutiliser ce point).
4. **Flash noir de transition** : le handshake async actuel (wait fade + FillPalBufferBlack
   + scene.start) existe POUR éviter un flash. En runtime unique, la fade est continue
   (FieldCB fade-in décomp) → devrait **supprimer** le flash, pas l'introduire. À A/B.
5. **Globals OW** : `__phaserOverworldScene` (region-map, wallclock, overlays) doit pointer
   la scène unique ; `gPlayerAvatar`/`gTotalCamera` exposés. À déplacer dans `enterOverworld`.
6. **Devtools sceneName** : `installEngineDevtools` 1 seule fois (pas par scène).
7. **input-handler** : déjà partagé (`input-handler.ts`) → OK, rien à faire.
8. **Audio gesture** (cf. §2) : seul vrai effet de bord du retrait TestGbaScene.

## 7. Recommandation d'ordre
Step 0 (filet) → **Step 1 (extraction, pur refactor = couture sûre)** → **Step 2 (le merge,
valeur max)** → Step 3 → Step 4 → Step 5. Chaque step = 1 commit + A/B réel. Les gros risques
sont concentrés en Step 2 ; Steps 0/1 sont quasi sans risque et préparent le terrain.

## 8. ⚠️ Constat de couplage (relecture code 2026-06-22) — recalibrage Step 1/2
`TestOverworldScene` n'est PAS un host fin : ~1865 lignes de **logique OW comme méthodes de
classe**, couplées à `this` :
- `bootOverworld` (374-796) définit `MainCB2_Overworld` comme une **closure capturant `self`**
  (la scène) ; elle appelle `self.warpInProgress`, `self.executeWarp(...)`, `self.loadAndInitMap`.
- `loadAndInitMap` (~480 l), `executeWarp` (~325 l), `handleConnectionTransition`, les
  `waitFor*` = méthodes d'instance pilotant le per-frame OW (warps/connexions/mouvement).

**Conséquence** : « extraire `enterOverworld` en fonction libre » (Step 1 initial) sous-estime
le couplage. Le merge réel = **consolider TestOverworldScene + GameScene en UNE classe host**
(qui possède à la fois le boot intro ET les méthodes OW + le runtime/gba/bridge partagés) ;
`enterOverworld` devient alors une **méthode** de ce host, et la transition = `SetMainCallback2`
au lieu de `scene.start`. C'est un refactor mécanique mais conséquent (déplacer ~1500 l de
méthodes, gérer `this`, la closure `self`). À faire de façon **délibérée**, pas à la va-vite —
Step 1/2 fusionnent de fait en « consolider les 2 classes ».

**Cible 1:1 idéale vs pragmatique** : le 1:1 strict relocaliserait la logique OW dans la couche
runtime/CB2 (comme la décomp, où l'OW = CB2/Task, pas des méthodes de scène) — énorme. La cible
pragmatique (1 host scene unique tenant le runtime + les méthodes OW) supprime DÉJÀ la frontière
de scène (= le gain structurel clé) ; relocaliser ensuite la logique OW vers des fns runtime =
raffinement ultérieur. À trancher avec le user au Step 2.

# ROADMAP — pokemon-web-demo

> Plan d'attaque chronologique. Source : audit profond 2026-04-25.
> **Réviser à chaque clôture de phase**. Garder court et actionnable.

---

## Statut actuel (post-session 12)

✅ **Boot complet jouable** : Title → MainMenu → Birch → Naming → spawn Littleroot
✅ **Overworld fonctionnel** : tilemap, NPCs, scripts (58 opcodes), warps de base, dialogues, music MIDI
✅ **Save/Load** : flags + vars + position map (localStorage)
✅ **Combat démo** : @pkmn/sim avec 2 RandomAI (input joueur manquant)

❌ **Bloqueurs jouabilité 1ère heure** :
1. Pas de save équipe Pokémon
2. Pas de combat dresseur fonctionnel (`trainerbattle_single` non implémenté)
3. Pas de Pokémon sauvage (no `wild-encounters.json`)
4. Pas de Centre Pokémon (`special HealPlayerParty` manquant)

---

## Phase A — MVP "1ère heure jouable" (priorité absolue)

**Objectif** : Démarrer une nouvelle partie, sortir du camion, parler à Mom, prendre Treecko/Torchic/Mudkip chez Birch, gagner 1er combat dresseur Route 101, atteindre Oldale, sauvegarder. **Boucle de jeu fermée.**

> **Ordre décidé** : A.2 → A.3 (struct `PokemonInstance` minimale créée JIT au givemon) → A.4 → A.5 → A.1 (étendre la struct au fur et à mesure). Évite le code spéculatif.

### A.1 — Save équipe Pokémon (étendu progressivement, pas en bloc)
- Démarre avec un struct minimal au moment de A.3 (`givemon` du starter)
- S'étend à chaque nouveau besoin :
  - A.3 : species, level, ivs, nature, moves[], pp[]
  - A.4 : stats calculées, currentHp, ability
  - A.5 : item, status, friendship
- [ ] `special HealPlayerParty`, `LoadPlayerParty`, `SavePlayerParty` ajoutés au moment où le script du Centre Pokémon arrive
- **Décomp ref** : `include/pokemon.h` (struct Pokemon) + `src/save.c`

### A.2 — Intro camion authentique (S, héritée session 12) — **✅ Implémenté session 14, à tester runtime**

- [x] Spawn dans `MAP_INSIDE_OF_TRUCK` (1, 2) au new game
- [x] `MAP_SCRIPT_ON_LOAD` + `ON_RESUME` maintenant câblés (étend 2/7 → 4/7)
- [x] `coord_events` du map.json gérés (var/var_value/script match)
- [x] `MAP_DYNAMIC` warp résolu via `gameState.dynamicWarp` (truck → Littleroot 3|12, 10)
- [x] `STEP_CB_TRUCK` = oscillation caméra ±1px période ~2s (tween setFollowOffset)
- [x] Plain step-warps indoor (sans behavior porte) déclenchent triggerWarp
- [x] `MAP_SCRIPT_ON_FRAME_TABLE` à Littleroot fait tourner `StepOffTruck{Male|Female}` cinematic (déjà existant via `runOnFrameTable`)
- [ ] **À TESTER E2E** : new game → spawn truck → marche est → trigger → warp Littleroot → Mom cinematic
- [ ] [later] `setmetatile` réel : nécessite `extract-metatile-labels.mjs` pour résoudre `METATILE_InsideOfTruck_ExitLight_*` en numérique
- [ ] [later] Cartons qui oscillent aussi (cosmétique, le décomp fait box1/3 ±4px box2 ±2px)
- [ ] `InsideOfTruckScene` (8×8 map, oscillation y player via STEP_CB_TRUCK)
- [ ] Warp sortie → Littleroot avec `LittlerootTown_OnTransition` (Mom marche, camion visuel)
- [ ] Implémenter callback `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE`

### A.3 — Birch's Lab + 1er Pokémon (M)
- [ ] Triggerer `Route101_EventScript_BirchInTrouble` automatiquement
- [ ] Implémenter `givemon` opcode (utilise A.1 PokemonInstance)
- [ ] Cinematic combat tutorial vs Zigzagoon (utilise wild encounter A.5 OU script bébé)

### A.4 — Combat dresseur fonctionnel (M)
- [ ] Implémenter `trainerbattle_single` opcode
- [ ] Écrire `extract-trainer-parties.mjs` (cf. AUTOMATION_BACKLOG §2)
- [ ] Adapter `BattleScene` : prendre `trainer_id` + party réelle au lieu du mock `PLAYER_TEAM`
- [ ] Brancher `gameState.party` côté joueur (pas RandomAI, mais menu de choix simple)
- **Décomp ref** : `src/battle_setup.c` BattleSetup_ConfigureTrainerBattle

### A.5 — Wild encounters (M)
- [ ] Écrire `extract-wild-encounters.mjs`
- [ ] Implémenter détection metatile herbe haute (déjà : `MB_*` constants dans `tilemap-loader.ts`)
- [ ] RNG de spawn + level range
- [ ] Écran de combat sauvage (réutilise BattleScene avec wild flag)
- **Décomp ref** : `src/wild_encounter.c` + `data/wild_encounters.h`

### A.6 — Refactor script-runner en dispatch table (M)
- Avant d'ajouter trop d'opcodes, refactor switch 160L en table
- Cf. `AUTOMATION_BACKLOG.md §4`
- Ajouts ultérieurs deviennent additifs sans risque

### A.7 — Implémentations opcodes Phase 2 (S each)
- [ ] `case` / `switch` (déjà 3064+788 occurrences = beaucoup de scripts débloqués)
- [ ] `special DrawWholeMapView` (refresh après setmetatile)
- [ ] `multichoice` (menus de dialogue à choix)
- [ ] `bufferitemname`, `bufferspeciesname`, `bufferpartymonnick` (string interpolation)
- [ ] `giveitem` + `finditem` (dépend A.8 inventory)

### A.8 — Inventory minimal (M)
- [ ] Écrire `extract-items.mjs`
- [ ] Étendre `game-state.ts` : `bag: { items, balls, keyItems, tms, berries }`
- [ ] UI Bag dans MenuOverlayScene (5 poches, scrollable)
- [ ] `additem` / `removeitem` / `checkitem` opcodes
- **Décomp ref** : `src/item_menu.c` + `src/item_use.c`

**Estimation Phase A** : 2-3 semaines à plein temps. **Livrable : démo jouable end-to-end de Littleroot à Oldale.**

---

## Phase B — Boucle complète (post-MVP)

**Objectif** : Atteindre Rustboro, gagner premier badge, navigable jusqu'à Slateport.

### B.1 — Party menu (L)
- Écran POKéMON dans MenuOverlay : voir équipe, stats, moves, items
- Switch order, oublier moves, donner item
- Réutilisé en combat pour switch
- **Décomp ref** : `src/party_menu.c` + `src/pokemon_summary_screen.c`

### B.2 — Pokédex (M)
- UI 7 pages (liste, infos, zone, cri, taille, évolution)
- Recherche par couleur/type/ordre
- Remplir au fur et à mesure des rencontres
- **Décomp ref** : `src/pokedex.c` + sous-écrans

### B.3 — Polish field (M)
- Tileset animations runtime (eau/fleurs/cascades) — assets déjà OK
- Transitions warp avec fade fluide (pas snap)
- Animations portes (door-anim.ts existe, à câbler systématiquement)
- HUD persistant (option : nom + PS Pokémon lead)

### B.4 — Refactor "no pre-render" complet (S)
- Supprimer `render-layouts.mjs` + `public/decomp/em/rendered/` (gain 65 MB)
- Refactor `render-textbox` → runtime
- Refactor `render-title` → runtime

### B.5 — Combat input joueur (M)
- Remplacer p1 RandomAI par menu Phaser (FIGHT/POKEMON/BAG/RUN)
- Sélection move via UI
- Switch via party menu (B.1)

**Estimation Phase B** : 3-4 semaines.

---

## Phase C — Contenu (long terme)

- B.1-B.5 stabilisés → continuer Hoenn (Rustboro Gym + suivants)
- Extraction Kanto via `pokerougefeu` (extract:fr déjà préparé)
- Pokénav, contests, Battle Frontier, secret base, daycare, day/night
- HM utilisations (Couper, Surf, Fly, etc.)

Cf. `AUDIT_DECOMP_SOURCE` dans archive — la liste des systèmes nice-to-have est exhaustive.

---

## Anti-roadmap (à NE PAS faire)

- ❌ Réimplémenter battle engine (utiliser @pkmn/sim, exception déclarée)
- ❌ Porter graphics low-level (bg.c, sprite.c, palette.c — Canvas/WebGL remplace)
- ❌ Link cable / mystery gift / union room (hors scope mono-joueur web)
- ❌ Slot machine / berry blender / roulette (minigames optionnels, faible ROI)
- ❌ Battle TV / recorded battles (récréation GBA spécifique)
- ❌ Pré-rendre quoi que ce soit (règle dure session 11)

---

## Règles de session (rappel)

1. **Toujours lire le décomp** comme source — pas inventer en TS (cf. `feedback_decomp_driven`)
2. **Aucun pré-rendu** — tout en runtime depuis assets bruts (cf. `feedback_no_prerendering`)
3. **Économie tokens** — chaque action justifie son coût ; automation > one-off ; Write > multi-Edit (cf. `feedback_token_economy`)
4. **Ne pas toucher aux fichiers décomp** sources (lecture seule)

---

## Prochaine action immédiate

→ **A.2 — Intro camion** en cours. Décision : A.1 sera fait JIT à partir de A.3 (givemon du starter), pas en bloc en avance.

Séquence : A.2 (camion) → A.3 (Birch + starter, struct PokemonInstance minimale) → A.4 (trainerbattle) → A.5 (wild) → A.6 (refactor script-runner après accumulation d'opcodes) → A.7 (opcodes restants) → A.8 (inventory).

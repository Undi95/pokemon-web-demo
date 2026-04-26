# BULK AUTOMATION — Plan en vagues transversales

> Stratégie : ne pas patcher event-par-event. Attaquer par "vagues" = couches transversales du système. Chaque vague est un bloc cohérent, fait d'un coup, commit, teste, suivante.
> Ordre = du plus important (débloque le plus) au moins important.

---

## Vague 1 — Extraction bulk ✅ DONE (session 19)

**Pourquoi en premier** : sans data, impossible d'implémenter combats / items / encounters.

| # | Script | Output | Compte |
|---|---|---|---|
| 1.1 | `extract-trainer-parties.mjs` | `trainer-parties.json` | 855 trainers, 854 parties |
| 1.2 | `extract-wild-encounters.mjs` | `wild-encounters.json` | 116 maps, 4 rate tables |
| 1.3 | `extract-items.mjs` | `items.json` | 377 items (FR + price + pocket + holdEffect) |
| 1.4 | `extract-map-names-fr.mjs` | `map-names-fr.json` | 213 zones (vs 16 hardcodées avant) |
| 1.5 | `extract-metatile-labels.mjs` | `metatile-labels.json` | 692 labels global + per-map |

**Wirings runtime déjà faits** :
- `map-names-fr.json` chargé dans `OverworldScene.preload`, consommé via `loadMapNamesFr()` dans `afterMapLoad`. **Bonus** : remplace le hardcode TS qui contenait des noms FR différents (potentiellement faux).

**Wirings runtime restants (à faire dans les vagues suivantes)** :
- `trainer-parties.json` → consommé par opcode `trainerbattle` (Vague 3)
- `wild-encounters.json` → consommé par grass step + Pokémon sauvage (Vague 3)
- `items.json` → consommé par opcodes `additem/checkitem/etc.` (Vague 4)
- `metatile-labels.json` → consommé par opcode `setmetatile` (extension Vague 5)

**Commands npm ajoutées** : `extract:trainer-parties`, `extract:wild-encounters`, `extract:items`, `extract:map-names-fr`, `extract:metatile-labels`, `extract:all-bulk` (chaîne tout).

---

## Vague 2 — Opcodes buffers ✅ DONE (session 20)

**Pourquoi** : les buffers alimentent `{STR_VAR_N}` dans les msgbox. Sans eux, dialogues à trous partout.

**Implémenté dans `script-runner.ts`** :
- `bufferspeciesname N, SPECIES_X` → text-tables.species (412 entrées FR)
- `buffermovename N, MOVE_X` → text-tables.moves (355 entrées FR)
- `bufferitemname N, ITEM_X` → items.json (377 entrées FR)
- `bufferitemnameplural N, ITEM_X, qty` → items.json + pluriel
- `buffertrainerclassname N, TRAINER_X` → trainers + text-tables.trainer_classes
- `buffertrainername N, TRAINER_X` → trainers (855 dresseurs)
- `buffernumberstring N, value` → String(value)
- `bufferstring N, "text"` / `vbufferstring` / `vbuffermessage` → texte direct
- `bufferpartymonnick N, slot` / `bufferleadmonspeciesname N` → fallback playerName (TODO Vague 3 quand party struct dispo)
- `bufferstdstring/decorationname/boxname/contestname` → vide (pas de tables extraites)

**Bonus** : bonus extracteur `extract-text-tables.mjs` ajouté dans Vague 1 (412 species, 355 moves, 66 trainer classes, 25 natures, 310 desc items, 355 desc moves, 78 desc abilities).

**Module** : nouveau `src/engine/data-tables.ts` (singleton de loaders + getters typés). Wiré dans `OverworldScene.preload` + `afterMapLoad`.

| Opcode | Args | Source data |
|---|---|---|
| `bufferspeciesname N, SPECIES_*` | strVar, species | `@pkmn/dex` (FR) |
| `bufferitemname N, ITEM_*` | strVar, item | `items.json` (Vague 1.3) |
| `bufferpartymonnick N, slot` | strVar, slot | `gameState.party[slot].nickname` |
| `bufferleadmonspeciesname N` | strVar | `gameState.party[0].species` |
| `buffermovename N, MOVE_*` | strVar, move | `@pkmn/dex` |
| `bufferstring N, "text"` | strVar, text | direct |
| `bufferstdstring N, index` | strVar, std index | `data/std_strings.s` (extraire) |
| `buffernumberstring N, value` | strVar, number | `String(value)` |
| `bufferdecorationname N, decor` | strVar, decor | `decorations.json` (extraire) |
| `bufferboxname N, box` | strVar, box | PC box names |
| `buffertrainerclassname N, trainer` | strVar, trainer | `trainer-parties.json` (Vague 1.1) |
| `buffertrainername N, trainer` | strVar, trainer | `trainer-parties.json` |
| `buffercontestname N, category` | strVar, category | hardcode (5 catégories) |

**Implémentation** : étendre `string-buffers.ts` + ajouter handlers dans `script-runner.ts`.
**Effort** : 1 session.
**Validation** : grep des dialogues avec `{STR_VAR_N}` dans `strings.json` doivent maintenant tous afficher.

---

## Vague 3 — Combat ✅ DONE (session 20, MVP)

### Fait
- **Mini-extracteur bonus** : `extract-constants.mjs` (413 species + 356 moves + 384 items + 78 abilities + 25 natures → constants.json)
- **Module `pokemon.ts`** : `PokemonInstance` struct + `createPokemonInstance()` factory (lookup base stats via @pkmn/dex, calc HP Gen 3, pick level-up moves) + `pokemonToShowdownSet()` + helpers `speciesEnumToDexId/moveEnumToDexId/itemEnumToDexId`
- **`game-state.ts`** : `party: PokemonInstance[]`, `addToParty/healAllParty/lead/partySize`
- **`new-game-init.ts`** : donne Treecko lv5 debug au new game (à virer quand Birch's lab marche)
- **9 opcodes battle** dans script-runner :
  - `trainerbattle` (parse + lance async via ctx.runTrainerBattle)
  - `dotrainerbattle` (no-op, déjà fait par trainerbattle)
  - `gotopostbattlescript` / `gotobeatenscript` (no-op MVP, à wirer Vague 5)
  - `setwildbattle` / `dowildbattle`
  - `checktrainerflag` / `settrainerflag` / `cleartrainerflag` (proxy via gameState flags)
- **3 specials critiques** : `HealPlayerParty` (vrai heal), `SavePlayerParty` (gameState.save), `LoadPlayerParty` (no-op, déjà chargé au boot)
- **`ScriptContext`** : `runTrainerBattle?(trainerId): Promise<'win'|'lose'>`, `runWildBattle?(...)`
- **`BattleScene`** refactor :
  - Accepte `{ trainerId?, wildSpecies?, wildLevel?, wildItem?, onResult? }`
  - Construit teams via decomp data + `@pkmn/dex` lookup
  - `runBattle()` lance @pkmn/sim, callback onResult vers OverworldScene au exit

### TODO Vague 3.5 (post-MVP combat)
- Input joueur en combat (actuellement RandomPlayerAI des deux côtés)
- Switch en combat (besoin party menu)
- Items en combat (Pokéball, Potion)
- Flee
- Sauvegarde currentHp/PP/status post-combat (sync depuis @pkmn/sim battle state vers gameState.party)
- Wild encounters via grass step (trigger automatique sur tile herbe)
- Stats complètes (natures multiplier, EVs gain)
- `gotopostbattlescript` / `gotobeatenscript` réellement wirés vers les ptrs stockés par `trainerbattle`

**Pourquoi maintenant** : c'est le cœur du jeu. Sans combat fonctionnel, on est bloqué à l'intro.

### Opcodes (8)
- `trainerbattle TYPE, TRAINER_*, localid, ptr1, ptr2` → setup combat
- `dotrainerbattle` → run battle
- `gotopostbattlescript` / `gotobeatenscript` → branchement après
- `setwildbattle SPECIES_*, level, ITEM_*` → setup wild
- `dowildbattle` → run wild battle
- `checktrainerflag` / `settrainerflag` / `cleartrainerflag` → état dresseur

### Specials critiques pour combat
- `HealPlayerParty` — Centre Pokémon
- `LoadPlayerParty` / `SavePlayerParty` — switch context
- `ChoosePartyMon` — sélection party UI
- `DoSpecialTrainerBattle` — variantes battle

### Refactor parallèle
- Étendre `game-state.party` en struct `PokemonInstance[]` (depuis `data/pokemon/*.h`)
- `BattleScene` : input joueur (FIGHT/POKEMON/BAG/RUN) au lieu de RandomAI
- Connecter à `@pkmn/sim` avec vraie party

**Effort** : 1-2 sessions.
**Validation** : combat dresseur scripté + sauvage = jouable de bout en bout.

---

## Vague 4 — Items / inventory (8 opcodes + UI Bag)

**Pourquoi maintenant** : items utilisés en combat (pokeball, potion) + sur le terrain (CT, HM, baies).

### Opcodes (8)
- `additem ITEM_*, qty` / `removeitem ITEM_*, qty` / `checkitem ITEM_*, qty`
- `checkitemspace` / `checkitemtype` (pocket detection)
- `addpcitem` / `checkpcitem` (PC stockage)
- `giveitem ITEM_*, qty` (macro composée souvent)
- `finditem ITEM_*, qty` (item au sol)

### Refactor game-state
```ts
party: PokemonInstance[]
bag: { items: Map<ItemId, qty>, balls, keyItems, tms, berries }
pc: { items, party_box[14] }
money: number
```

### UI Bag dans MenuOverlayScene
- 5 poches (Items, Balls, KeyItems, TMs/HMs, Berries)
- Scrollable, sélectionnable, "use on field" ou "use on Pokémon"

**Effort** : 1-2 sessions.
**Validation** : récupérer item au sol, l'utiliser, le voir disparaître du bag.

---

## Vague 5 — UI dialogues interactifs (yesnobox/multichoice + polish)

### Opcodes (3-4)
- `yesnobox X, Y` → menu OUI/NON, retourne dans VAR_RESULT
- `multichoice X, Y, ID, ignoreBPress` → menu liste depuis std_choices
- `multichoicedefault` / `multichoicegrid` (variantes)
- `waitbuttonpress`

### Sprite flèche arrow warp visuel
- `field_player_avatar.c:HideShowWarpArrow` → sprite directionnel au-dessus du joueur sur arrow warp

### Refactor menu.ts
- Standardiser pour réutilisation (yesnobox + multichoice + Bag + Party menu)

**Effort** : 1 session.
**Validation** : NPCs avec choix dialogue (très fréquent).

---

## Vague 7 — Refacto boxes/dialogues/menus sans hardcode (EN COURS, session 30)

Cf. `WINDOWS_BOXES_REFERENCE.md`.

### Phase 1 ✅ DONE (session 30, raffiné session 31)
- `extract-window-templates.mjs` → `window-templates.json`
  - **117 templates extraits** (vs 6 au 1er run — fix : single-struct case + scan récursif `src/**/*.c`)
  - Inclut `sStandardTextBox_WindowTemplates`, `sYesNo_WindowTemplates`, `sStandardBattleWindowTemplates`, `sBattleArenaWindowTemplates`, `sTourneyTreeWindowTemplates`, naming, save info, mailbox, move relearner, etc.
- `extract-palettes.mjs` → `palettes.json`
  - 14 palettes JASC : `text_pal1-4`, `std_menu`, `main_menu_bg`, `main_menu_text`, `menu_info1-3`, `option_menu_text`, `red`, `blank`, `hof_pc_topbar`

### Phase 2 ✅ DONE (session 31)
- Module `src/engine/window-renderer.ts` créé :
  - `preloadWindowAssets(scene)` : charge frames 1-20 + message_box.png + JSON templates/palettes
  - `setupWindowAssets(scene)` : wire les JSON dans l'état global
  - `createWindow(scene, name, opts)` : retourne `WindowHandle { frame, pixelX, pixelY, pixelW, pixelH, template }`
  - `getTemplatePixelRect(name)` : helper pos pixel sans création (utilisé par menu.ts/yesnobox)
  - Composition texture : remap palette par ordre d'apparition des couleurs (cache `wnd-tex-{frameId}-{paletteName}`)
- Wiring dans `OverworldScene` :
  - `preload()` → `preloadWindowAssets(this)`
  - `create()` → `setupWindowAssets(this)` (à côté de `setupDoorAnim`)

### Phase 3 ✅ DONE (session 31, partielle)
- `dialogue-box.ts` : `render()` utilise `createWindow('sStandardTextBox_WindowTemplates')` avec fallback robuste si template pas chargé
- `OverworldScene.askYesNo` : position via `getTemplatePixelRect('sYesNo_WindowTemplates')` au lieu de `{ 168, 72, 40 }` hardcodé
- TypeScript : `tsc --noEmit` clean ✅

### Phase 3 — restant
- `multichoice` (OverworldScene.askMultichoice) : layout dynamique, position bottom-right hardcodée pour pas couvrir le dialogue. Le décomp utilise `script_menu.c:630` avec position dynamique (x+1, y+1). À refacto si template approprié extrait.
- `Money box` (money.c:170) : pas encore utilisé dans le runtime.
- `Naming screen` (`sWindowTemplates`) : pas encore migré (NamingScene séparée).

### Phase 4 — tests visuels
- Comparer screenshots GBA vs web pour valider fidélité

## Vague 9 — Implémenter les ~200 opcodes scripts manquants (différé session 32)

**Status** : catalog `script-opcodes.json` extrait + tracker `getScriptCoverageStats()` en place. Mais l'implémentation effective est différée.

**Plan en 3 sous-vagues** :

### 9.1 Auto-stubs silencieux (~30 min)
Pour TOUS les opcodes du catalog non-handled : silent no-op (return sensible : 0 / false / null). Plus de warnings bruyants en console. Script continue toujours.

### 9.2 Vraie impl des "no barrière" (~1-2h, ~50 opcodes)
- Var/Flag arithmetic (setvar, addvar, copyvar, compare_*, setflag, clearflag, checkflag) ~25
- NPC manipulation (setobjectxy, setobjectmovementtype, addobject, removeobject, lockall variants) ~20
- Map/Warp (warpwalk, setwarp, setdynamicwarp variants) ~10
- Buffer ops résiduels (bufferdecorationname, etc.) ~5

### 9.3 Opcodes système-dépendants (déférés à leurs domaines)
- Items (~15) → après Bag system (Vague 4)
- Pokemon party (~10) → après Party menu (Vague 7)
- Battle (~10) → étendre @pkmn/sim wrapper
- Audio (~15) → après Sappy (Vague 8)
- specials (~50) → 1 par 1 selon besoin
- Edge content (~30) → bas ROI

## Vague 8 — Musique ✅ DONE (SpessaSynth + SF2) — TODO polish

**Status** : refacto music.ts via SpessaSynth + SF2 ripped Pokemon Emerald (~85% authentique GBA).

**Ce qui marche** :
- 60 lignes de TS au lieu de 570 (sappy-player gardé en backup)
- WorkletSynthesizer + Sequencer joue les MIDIs avec SF2 ripped
- Polyphonie + ADSR + LFO gérés par SpessaSynth (lib testée v4.2)
- Loop auto, transitions entre maps OK

**Pour aller à 100% authentique (TODO future)** :
- Pré-rendre 530 MIDIs en WAV via `agbplay` (= référence absolue, son hardware-perfect)
- Build pokeemerald.gba via devkitARM + MSYS2 (~30min) + agbplay-cli batch render (~1h)
- Convertir en OGG 96kbps (~250 MB total)
- Refacto music.ts vers HTMLAudioElement (5 lignes)
- Trade-off : son 100% vs 250 MB de bundle

## Vague 8 — Refacto musique Sappy (legacy — remplacé par SpessaSynth)

Cf. `SAPPY_MUSIC_REFERENCE.md`.

Quick wins MVP (1ère étape) :
1. Pré-générer 4 WAV samples PSG (duty 1/8, 1/4, 1/2, 3/4) à 32 kHz
2. ADSR exponential courbe au lieu de linéaire
3. Pseudo-reverb ConvolverNode

Long terme : Web Audio API direct au lieu de Tone.js.

## Vague 6 — Seamless map rendering ✅ DONE (session 24, MVP)

### Fait
- `tilemap-loader.buildTilemap` accepte `TilemapKeys` opt (prefix + offset)
- Nouveau module `src/engine/world-renderer.ts` (singleton multi-maps)
- `OverworldScene` :
  - Init WorldRenderer + duplicate current cache keys
  - `loadAdjacentsAsync()` après afterNpcsLoad
  - `softSwitchToMap()` à la traversée si adjacent loaded
- `yesnobox` + `multichoice` opcodes wirés via `createMenu`

### Limites (à raffiner ultérieurement)
- NPCs des adjacents non visibles avant traversée
- Pre-load serial (pourrait être parallel)
- multichoice = no-op (besoin extract `data/list_menu_items.h`)

## Vague 6 (archive — ce qui était prévu)

**Pourquoi remonté** : user signal session 22 — les maps adjacentes ne doivent PAS avoir de transition. Le décomp les rend en parallèle (monde continu). Notre `scene.restart` n'est pas fidèle.

Cf. spec complète dans `SEAMLESS_RENDERING_REFERENCE.md`. Découpé en 3 sous-vagues :

### Vague 6.1 — WorldRenderer skeleton
- Nouveau module `src/engine/world-renderer.ts` (API : `getTileAt`, `checkTraversal`, `promoteToCurrent`, etc.)
- Migrer `OverworldScene` pour utiliser `worldRenderer.getTileAt()` au lieu de `tilemap.collisions/behaviors`
- WorldRenderer charge QUE current map (adjacents = vide)
- Comportement identique à avant, juste l'abstraction prête
- Effort : M

### Vague 6.2 — Multi-tilemap render
- `loadAdjacent()` : charge async les 4 connections au load de current
- Chaque adjacent → TilemapLayer placés à offset relatif
- Joueur peut VOIR les maps adjacentes aux bords (sans traverser)
- Tilesets différents gérés (chaque map a ses atlas)
- Effort : L

### Vague 6.3 — Traversée seamless (le vrai)
- `promoteToCurrent()` : switch silencieux, recalcule offsets, charge new connections, unload old
- Retirer le `scene.restart()` de `tryConnectionWarp`
- NPCs spawn/despawn dynamique selon view rect
- Map scripts ON_TRANSITION re-déclenchés au switch
- Effort : L

**Total Vague 6 : 2-3 sessions dédiées.**

## Vague 7 — Polish field (autres)

- Tileset animations runtime (eau, fleurs, cascades) — assets déjà OK
- Animations portes systématiques
- HUD persistant
- Cinematic camion d'arrivée (titlescreen-like)
- Sprite flèche arrow warp visuel

**Effort** : 1-2 sessions.

---

## Vague 7 — Pokédex + Party menu

### Pokédex
- UI 7 pages (liste, infos, zone, cri, taille, évolution)
- Auto-fill au fur et à mesure des rencontres

### Party menu (POKéMON dans Start menu)
- Voir équipe, stats, moves, items
- Switch order, oublier moves, donner item
- Réutilisé en combat pour switch

**Effort** : 2-3 sessions.
**Validation** : équipe gérable en plein gameplay.

---

## Vague 8+ — Contenu (long terme)

- Hoenn complet (gymnases, ligue, post-game)
- Kanto via `pokerougefeu` (extract:fr déjà préparé)
- Pokénav, contests, Battle Frontier, secret base, daycare
- HM utilisations (Couper, Surf, Fly, etc.)

---

## Règles d'exécution des vagues

1. **Une vague = une session** (token-efficient, focus)
2. **Faire TOUT d'un coup** dans la vague (pas patch+patch)
3. **Commit à la fin** de chaque vague (rollback possible si régression)
4. **Test runtime** entre vagues (user → fix bugs → vague suivante)
5. **Update les MD** à la fin de chaque vague (DEV_LOG, ARCHITECTURE, OPCODES_REFERENCE coches)

---

## Ce qui NE rentre PAS dans une vague

- Bugs runtime spécifiques signalés par user → fix immédiat (pas attendre une vague)
- Refactors structurels du runtime (ex. dispatch table script-runner) → session dédiée

---

## Statut actuel

- ✅ Audit complet : 5 docs MD persistants (ARCHITECTURE, AUTOMATION_BACKLOG, ROADMAP, OPCODES_REFERENCE, TICK_LOOP_REFERENCE)
- ✅ Boot complet jouable jusqu'à l'arrivée Mom Littleroot
- ⏳ Vague 1 → suivante à attaquer

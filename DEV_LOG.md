# Pokemon Web Demo — Dev Log

Projet exploratoire : utiliser les décomps GBA (`pokeemeraude`, `pokerougefeu`)
comme source d'assets et de données, + `@pkmn/sim` comme moteur de combat,
pour construire un jeu Pokémon web natif (pas une émulation GBA).

## État actuel

**Version : v0.1 — extraction + démo placeholder fonctionnels**

Stack : Vite + TypeScript + Phaser 3 + @pkmn/sim + @pkmn/dex

> **📍 Pour démarrer une session : lire d'abord [`DECOMP_ORIGIN_FILES.md`](./DECOMP_ORIGIN_FILES.md) ⭐ (master catalog des fichiers origine décomp par domaine), puis [`BULK_AUTOMATION.md`](./BULK_AUTOMATION.md) pour le plan en vagues, puis [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`OPCODES_REFERENCE.md`](./OPCODES_REFERENCE.md), [`TICK_LOOP_REFERENCE.md`](./TICK_LOOP_REFERENCE.md), [`SEAMLESS_RENDERING_REFERENCE.md`](./SEAMLESS_RENDERING_REFERENCE.md), [`DIALOGUE_FONT_MENU_REFERENCE.md`](./DIALOGUE_FONT_MENU_REFERENCE.md), [`WINDOWS_BOXES_REFERENCE.md`](./WINDOWS_BOXES_REFERENCE.md), [`SAPPY_MUSIC_REFERENCE.md`](./SAPPY_MUSIC_REFERENCE.md), [`ROADMAP.md`](./ROADMAP.md), [`AUTOMATION_BACKLOG.md`](./AUTOMATION_BACKLOG.md) (audits profonds du 2026-04-25).**
> Ces docs remplacent l'exploration à l'aveugle de la codebase et du décomp.
> **AJOUT session 38** : `MAP_MECHANICS_REFERENCE.md` — source de vérité warps/NPCs/item balls/tiles, à lire avant de toucher OverworldScene/script-runner/npc-loader/tilemap-loader.

---

## Session 45 — BattleScene refacto 1:1 GBA (squelette UI) (2026-04-26)

### Contexte
Combat tutorial Poochyena testé en session 44 → fonctionne (capture user) mais UI = placeholder noir/gris. Vision user : tout 1:1 GBA visuel + engine `@pkmn/sim` gen3.

### Implémentations
1. **`extract-battle-ui.mjs`** (NOUVEAU) : copie 24 fichiers de `decomps/pokeemeraude/graphics/battle_interface/` vers `public/decomp/em/battle_interface/` (healthboxes singles opp/player, hpbar, textbox, status, numbers, ball_display, etc. + palettes .pal).

2. **BattleScene.ts refacto** :
   - **Positions GBA exactes** (POS const) : opponent sprite (184,64), player sprite (56,112), opponent box (8,24), player box (146,80), textbox (8,112)
   - **Background GBA-like** : rect bleu Hoenn + 2 ellipses "sol" sous chaque sprite
   - **Sprites Pokémon** repositionnés (origin centre-bas) selon layout singles GBA
   - **Healthbox opponent** : `healthbox_singles_opponent` frame 0 (64×32) + nom FR + level + HP bar dynamique (couleur vert/jaune/rouge selon ratio)
   - **Healthbox player** : `healthbox_singles_player` frame 0 + nom FR + level + HP bar + chiffres HP/max (convention GBA : opponent sans chiffres, player avec)
   - **Textbox bas** : rect blanc bordé en attendant 9-slice du textbox.png
   - **Logs FR** : `getMoveNameFr('MOVE_TACKLE')` → "Charge" + `getSpeciesNameFr('SPECIES_TREECKO')` → "Arcko"
   - **HP bars updated en runtime** depuis events `|-damage|` Showdown (parse `cur/max` de `parts[3]`)
   - **Status messages FR** : brûlé/gelé/paralysé/empoisonné/endormi/gravement empoisonné

3. **package.json** : `extract:battle-ui` ajouté à `extract:all-bulk`.

### Limitations connues / TODO sessions suivantes
- Background : placeholder bleu uni (extraire `graphics/battle_terrain/` plus tard pour vrais fonds par environnement)
- Textbox : rect blanc simple (TODO 9-slice depuis `textbox.png` 128×128 atlas tiles 8×8)
- HP bar : couleur uniquement, pas d'animation smooth decrement (TODO tween)
- Pas de menu FIGHT/POKÉMON/BAG/RUN → RandomAI player encore (input clavier player = next priority)
- Numbers décomp pas utilisés : on utilise font Phaser 8px (TODO bitmap font 1:1)
- Pas d'animation entrée sprite, pas de cri Pokémon (TODO polish)
- Status icons (status.png) pas affichés (TODO)

### Fichiers
- `scripts/extract-battle-ui.mjs` (NOUVEAU)
- `src/scenes/BattleScene.ts` — refacto preload + create + onBattleEvent (+80L)
- `package.json` — extract:battle-ui + bulk
- TS clean ✅

---

## Session 44 — Phase A.3 starter choice + givemon + race condition audio (2026-04-26)

### Contexte
Suite session 43, après fix audio + coord_event + inanimate, l'event Birch in Trouble se déclenche correctement. Reste à implémenter le flow choix starter + give Pokémon (Phase A.3).

### Fix bonus — Race condition playMidiLoop
User report : "les deux musiques se jouent ensemble" (mus_route101 + mus_help). Cause : 2 `playMidiLoop` async lancés en parallèle (softSwitch BGM map + script `playbgm`). Entre `stopMusic()` et `await fetchMidi()`, le 2e call s'intercale et stop le sequencer du 1er ; après les 2 awaits, **les 2 sequencers démarrent**.

**Fix** : compteur `playGen` incrémenté à chaque call. Après `await fetchMidi`, abort si `myGen !== playGen` (un autre call est venu après moi). Idem dans `playFanfare`.

### Phase A.3 — Implémentation choix starter
**Décomp** (vérifié dans `src/battle_setup.c:911-928`) :
```c
ChooseStarter() → CB2_ChooseStarter (UI 3 pokeballs)
                ↓ savedCallback = CB2_GiveStarter
CB2_GiveStarter:
  VAR_STARTER_MON = gSpecialVar_Result
  ScriptGiveMon(GetStarterPokemon(result), 5, ITEM_NONE)
  → BATTLE_TYPE_FIRST_BATTLE vs Poochyena (combat tutorial)
```

Notre version simplifiée : multichoice texte → addToParty → set VAR_RESULT + VAR_STARTER_MON (combat tutorial Poochyena pas inclus pour l'instant — peut être ajouté plus tard via `setwildbattle` après le choix).

### Implémentations
1. **`special ChooseStarter`** dans SPECIALS table (script-runner.ts) :
   - `askMultichoice(['Arcko', 'Poussifeu', 'Gobou'])`
   - `createPokemonInstance(STARTER_SPECIES[idx], 5)` + `addToParty`
   - Set VAR_RESULT + VAR_STARTER_MON

2. **`givemon SPECIES, LEVEL[, ITEM]`** opcode (pour autres scripts) :
   - Parse + createPokemonInstance + addToParty
   - VAR_RESULT = 0 (donné party) ou 1 (faux PC si plein)

3. **`bufferleadmonspeciesname STR_VAR_N`** : lookup `gameState.party[0].speciesNameFr`.
4. **`bufferpartymonnick STR_VAR_N, SLOT`** : lookup `gameState.party[slot].nickname`.

### Flow attendu end-to-end
1. Sors Bourg → Route 101 → coord_event → `StartBirchRescue` (msgbox + animations)
2. Va vers le sac de Birch tile (7,14) → press W → `BirchsBag` script
3. fadescreen noir + removeobject Pochyena + UI 3 starters apparaît
4. Choix → addToParty starter L5 + VARS
5. Birch remercie + HealParty + warp Birch Lab
6. Lab : `GiveStarterEvent` (ON_FRAME détecte VAR_BIRCH_LAB_STATE=2)
7. bufferleadmonspeciesname → "{STR_VAR_1}" remplacé par "Arcko"/"Poussifeu"/"Gobou"
8. playfanfare MUS_OBTAIN_ITEM (pause BGM lab + jingle + restore)
9. Yes/No naming (skip pour MVP, ou name)
10. Setvar BIRCH_LAB_STATE=3, releaseall

### Limitations connues
- Combat tutorial vs Poochyena pas inclus (le décomp le lance via BATTLE_TYPE_FIRST_BATTLE après givemon, c'est un combat scripté avec animations spéciales).
- Naming starter : redirige vers `Common_EventScript_NameReceivedPartyMon` qui est probablement un naming UI séparé. Si on press NO ça skip naturellement. Si YES, on peut implémenter plus tard.

### Fichiers
- `src/engine/script-runner.ts` — ChooseStarter SPECIAL + givemon opcode + bufferleadmonspeciesname/bufferpartymonnick fix (+30 L)
- `src/engine/music.ts` — playGen counter (race condition fix)
- TS clean ✅

---

## Session 43 — Fix audio fanfare/savebgm + sprite warnings (2026-04-26)

### Contexte
Après le fix crossing/warp (session 42), test runtime révèle 3 vrais bugs audio :
1. Fanfare casse la BGM (notre `playfanfare` route vers `playSE` qui change le bank du synth → instruments brisés ~5s)
2. `mus_encounter_may` (intro rivale) loop infiniment au lieu de revenir à la map BGM
3. Opcode `savebgm MUS_DUMMY` non géré → warning console

Cause racine : confusion `playbgm` = `playMidiLoop` direct, pas de slot "saved BGM", pas de gestion fanfare avec pause/restore.

### Pattern décomp (asm/macros/event.inc + scripts vérifiés)
```
playbgm SONG, TRUE       # joue SONG loop + save SONG dans slot saved
playbgm SONG, FALSE      # joue SONG loop, pas de save
savebgm SONG             # set le slot saved (MUS_DUMMY = clear)
fadedefaultbgm           # crossfade vers map default (skip si saved == current)
fadenewbgm SONG          # crossfade vers SONG
playfanfare SONG         # pause BGM, joue jingle one-shot, restore BGM
waitfanfare              # attend la fin du jingle (no-op si non bloquant)
```

### Implémentation
**`src/engine/music.ts`** :
- Slot `savedBgmUrl` (URL ou null pour MUS_DUMMY)
- Slot `pausedBgmUrl` (BGM en pause pendant fanfare)
- `setSavedBgm(name)`, `getSavedBgm()`, `getCurrentBgm()` exports
- `playFanfare(url)` : `pause()` du sequencer + `stopAll()` du synth + jingle one-shot + restore au songEnded

**`src/engine/script-runner.ts`** :
- ScriptContext étendu : `playFanfare`, `saveBgm`, `fadeDefaultBgm`, `fadeNewBgm`
- Séparation des opcodes `playse` / `playfanfare` (avant fusionnés)
- `playbgm SONG, save_song` parse le 2e arg pour TRUE/FALSE
- `savebgm` opcode wired
- `fadedefaultbgm` / `fadenewbgm` wired (avant no-op)

**`src/scenes/OverworldScene.ts`** :
- Wiring des 4 nouveaux handlers dans le ScriptContext
- `fadeDefaultBgm()` lit `this.mapJson.music` pour restore la BGM par défaut

### Bonus — Sprite warnings (327 occurrences)
`character-anims.ts` ajout `safeFrame()` qui clamp à frame 0 si l'index demandé > frameTotal-1. Évite les warnings Phaser pour objets statiques 1-frame (BIRCHS_BAG, PICHU_DOLL, ITEM_BALL, etc.) qui ne sont pas des NPCs animés mais sont quand même routés via `setIdleFrame` au spawn.

### Bonus — Fix coord_event manqué après seamless cross / warp non-porte (v2)
User report : "L'event ne se déclenche pas tant que je ne reviens pas sur mes pas." (Route101 Birch in Trouble à tile 11,19 ou 10,19).

**Diagnostic** : Le coord_event a `var: VAR_ROUTE101_STATE, var_value: "1"`. La var passe à 1 via `Route101_OnFrame` (`map_script_2 VAR_ROUTE101_STATE, 0, HideMapNamePopup`). Donc il faut que `runOnFrameTable` ait tourné AVANT `checkCoordEvent`. Mais dans `softSwitchToMap`, le IIFE `void (async)` ne lançait PAS `runOnFrameTable` (contrairement à `afterNpcsLoad`), et le `.then(checkCoordEvent)` du tryMove fire avant que ON_TRANSITION termine.

**Fix** :
1. `softSwitchToMap` IIFE : ajouter `await runOnFrameTable(...)` après ON_TRANSITION + ON_RESUME (sinon les vars d'état ne sont jamais init après un seamless cross).
2. `softSwitchToMap` IIFE : ajouter `void this.checkCoordEvent()` à la fin (pour qu'il fire APRÈS toutes les map_scripts).
3. `tryMove` onComplete (crossing) : retirer `.then(checkCoordEvent)` (déplacé dans softSwitch IIFE).
4. `afterNpcsLoad` finally : `void this.checkCoordEvent()` (déjà fait).

`firedCoordEvents` Set garantit pas de double trigger.

### Bonus — Inanimate graphics (sac, item ball, doll, pierres ne "regardent" plus)
User report : "Le sac bouge à gauche et à droite" (en fait il "regarde" — change facing via LOOK_AROUND).

**Cause** : Le décomp marque chaque OBJ_EVENT_GFX_* avec `.inanimate = TRUE/FALSE` dans `object_event_graphics_info.h`. Pour les inanimate (sac de Birch, item ball, pichu doll, pierres, panneaux…), tous les MovementType_* skip leurs actions. Notre code traitait tous les NPCs comme animés → `MOVEMENT_TYPE_LOOK_AROUND` faisait pivoter le sac.

**Fix** :
- **Nouveau script** `extract-inanimate-graphics.mjs` : compose `object_event_graphics_info_pointers.h` (OBJ_EVENT_GFX_X → gObjectEventGraphicsInfo_Y) avec `object_event_graphics_info.h` (.inanimate). Sortie `inanimate-graphics.json` (239 entries, 70 inanimate / 169 animés).
- `npc-loader.ts` : ResolvedNpc + flag `inanimate: boolean`, paramètre `inanimateMap` à `resolveNpcs`.
- `npc-behavior.ts` : `tickNpcBehavior` early return + reschedule loin si npc.inanimate.
- `OverworldScene.ts` : preload `inanimate-graphics.json`, passé à resolveNpcs (2 endroits).
- `package.json` : `extract:inanimate` ajouté à `extract:all-bulk`.

Spot-check OK : BIRCHS_BAG=true, ITEM_BALL=true, PICHU_DOLL=true, YOUNGSTER=false, PROF_BIRCH=false.

### Limitations connues (à améliorer plus tard)
- `fadedefaultbgm` / `fadenewbgm` : implémenté comme switch instantané (pas vrai crossfade). SpessaSynth gère mal le gain ramping inter-songs.
- `waitfanfare` : non bloquant. Si un script enchaîne `playfanfare; msgbox`, le msgbox s'affiche immédiatement (fanfare continue en background, OK pour MVP).
- Event Birch in Trouble : le coord_event TRIGGER (msgbox "À l'aide!" apparaît) mais le flow complet (Birch suit le joueur, entrée Birch lab, choix starter, combat tutorial) n'est pas implémenté. = Phase A.3 (chantier prévu).

### Fichiers
- `src/engine/music.ts` — +60L (savedBgm slot, playFanfare avec pause/restore)
- `src/engine/script-runner.ts` — refactor opcodes audio (~30L)
- `src/scenes/OverworldScene.ts` — 4 nouveaux handlers ScriptContext
- `src/engine/character-anims.ts` — `safeFrame()` helper
- TS clean ✅

---

## Session 42 — Fix double crossing seamless (crossingInProgress flag) (2026-04-25)

### Contexte
Suite session 41 qui avait identifié le bug racine du double crossing (cf. ci-dessous). Fix implémenté en 4 edits dans `OverworldScene.ts`.

### Implémentation
1. **Field** : `private crossingInProgress = false;` (ligne ~78, après inputLockUntil)
2. **Reset init** : `this.crossingInProgress = false;` dans `init()` (ligne ~126)
3. **Early return tryMove** : `if (this.crossingInProgress) return;` (ligne ~961, juste après le check inputLockUntil)
4. **Set/reset autour du tween** :
   - Avant `this.tweens.add` : `if (crossing) this.crossingInProgress = true;`
   - Dans `onComplete` : `softSwitchToMap(...).finally(() => { this.crossingInProgress = false; })`

### Résultat attendu
- 2e tryMove pendant le crossing → bloqué par early return
- Plus de désync visuelle entre sprite tween end et `playerTile` logique
- Mouvement continu (course, marche maintenue) sans hoquet aux bordures de map

### À valider en runtime
- Tester course Bourg-en-Vol ↔ Route 101 sans s'arrêter
- Tester avec `localStorage.warpTrace = '1'` que les CROSSING détectés ne se chevauchent plus
- Si OK : retirer warp-trace.ts ou laisser silent par défaut (silent par défaut, donc OK de garder)

### Fichiers
- `src/scenes/OverworldScene.ts` — 4 edits
- TS clean ✅

### Bonus — Fix double `triggerWarp` (anim porte async)
Logs runtime ont révélé un 2e bug similaire : `triggerWarp` fire 2× consécutifs (2 `playDoorOpen`, 2 `cameras.fadeOut`) quand touche maintenue sur tile porte. Cause : `playDoorOpen` async + pas d'inputLock sur les paths warp dans tryMove (lignes 970/982).

**Fix** : flag `warpInProgress` (mêmes principes que `crossingInProgress`) :
- Field privé reset par `init()` après scene.restart
- Early return en tête de `triggerWarp` si déjà true
- Reset false sur les 2 paths d'erreur (`MAP_DYNAMIC` sans dyn, dest inconnue)

3 edits supplémentaires, TS clean.

---

## Session 41 — Probe seamless crossing + bug racine identifié (2026-04-25)

### Contexte
User reporte bugs visuels lors traversées Bourg-en-Vol ↔ Route 101 (seamless adjacent maps via `softSwitchToMap`). Pas un warp porte (qui font fade noir), mais une transition fluide GBA-style. Bugs : NPCs flicker, musique re-démarre, hoquets.

### Diagnostic via probe (`src/engine/warp-trace.ts`)
Tracer temporel activé via `localStorage.warpTrace = '1'`. Logs au format `[warp-trace] +Xms (Δ Yms) <event>`.

Points instrumentés : triggerWarp, afterMapLoad, afterNpcsLoad, softSwitchToMap (toutes étapes), tryMove crossing detection.

### Bug racine TROUVÉ (à fix prochaine session)
**Cause** : course continue (held key) → 2 `tryMove` consécutifs en 125ms cooldown. 1er détecte crossing & lance tween (playerTile mis à `(x, -1)` AVANT le tween). À l'expiration du cooldown 125ms, 2e tryMove lit `playerTile=(x,-1)`, calcule `(x,-2)` → out of bounds → 2e crossing détecté inutilement.

**Logs preuve** :
```
+ 7142ms  tryMove CROSSING from LittlerootTown (11,0 + d=0,-1) → Route101 (11,19)   ← 1er
+ 7267ms  tryMove CROSSING from LittlerootTown (11,-1 + d=0,-1) → Route101 (11,18)  ← 2e (125ms après)
softSwitch L → R   ← 1er onComplete
SKIP R → R         ← 2e onComplete (fix session 41)
```

**Conséquences** :
- 2e softSwitch est SKIPPED (fix appliqué cette session) → pas de double NPCs destroy
- MAIS : position visuelle (sprite tween end) et logique (this.playerTile) désynchronisées après SKIP
- Tween du 2e cross termine à `tile (11, 18)` visuellement, mais `playerTile = (11, 19)` (set par 1er softSwitch)
- → tile suivante calcule `(11, 18)` mais sprite déjà là → mouvement perçu lent / saccadé

**Fix correct (TODO session 42)** :
- Ajouter flag `crossingInProgress: boolean` dans OverworldScene
- `tryMove` early return si `crossingInProgress === true`
- Set à true quand crossing tween lancé (ligne 1040 `tweens.add`)
- Set à false dans tween onComplete (après softSwitch)
- Remplacer le `inputLockUntil` qui a une race condition avec le cooldown du tween

### Fixes APPLIQUÉS cette session
1. **Guard `softSwitchToMap` X→X** : early return si `newMapName === this.mapName`. Élimine les doublons destroy/spawn NPCs et re-play musique inutile.
2. **Probe `warp-trace.ts`** : tracer temporel activable via localStorage, instrumenté tout le flow softSwitch + warp + afterMapLoad.

### Confirmation décomp (correction user)
- **Routes ↔ routes/zones adjacentes** : SEAMLESS sur GBA, vraiment fluide sans fade. Notre approche `softSwitchToMap` est la bonne.
- **Bâtiments (entre 2 routes)** : ce sont des maps intermédiaires avec warps + fade noir, comme `triggerWarp` actuel.
- Conclusion : architecture correcte, juste le bug de double crossing à fixer.

### Point exact pour reprendre session 42
**Priorité 1** : implémenter flag `crossingInProgress` dans OverworldScene.ts pour fixer le double crossing.

**Code cible** (ligne ~1040, dans tryMove, le `tweens.add` qui lance le mouvement) :
```typescript
if (crossing) this.crossingInProgress = true;
this.tweens.add({
  ...
  onComplete: () => {
    if (crossing) {
      void this.softSwitchToMap(...).finally(() => {
        this.crossingInProgress = false;
      });
    }
    ...
  }
});
```

Et au début de tryMove (ligne 959) :
```typescript
if (this.time.now < this.inputLockUntil) return;
if (this.crossingInProgress) return;  // NOUVEAU
```

**Priorité 2** : retirer la trace warp-trace après validation (ou la garder pour diag futur, c'est silent par défaut).

**Priorité 3** : Optimiser `softSwitchToMap` pour ne pas re-destroy/spawn TOUS les NPCs si on retourne sur une map qu'on vient de quitter (les sprites sont en cache, on pourrait les conserver).

### Fichiers touchés cette session
- `src/engine/warp-trace.ts` (NOUVEAU 38 L) — tracer temporel
- `src/scenes/OverworldScene.ts` — guard softSwitch X→X + 10 traces instrumentation
- `MAP_MECHANICS_REFERENCE.md` — à enrichir avec architecture seamless (cf. ci-dessous)

---

## Session 40 — Fix bugs critiques warp/musique/NPC spawn (2026-04-25)

L'utilisateur reporte 3 bugs : musique ne switch pas au warp, NPCs invisibles avant refresh, glitches généraux. Sub-agent Explore identifie root causes.

### Bug #1 — Musique ne change pas au warp ❌→✅
- **Root cause 1** : `triggerWarp()` ne stoppait jamais la musique courante avant `scene.restart()`. L'ancien MIDI continuait → polyphonie / mélange / silence selon timing.
- **Root cause 2** : `afterMapLoad` conditionnait `playMidiLoop` à `this.musicStarted` qui est reset à `false` après `scene.restart()` → musique nouvelle map ne jouait jamais.
- **Root cause 3** : `softSwitchToMap` (adjacent maps seamless) **n'appelait pas du tout** `playMidiLoop` → musique de la map d'origine restait indéfiniment.
- **Fix** : `stopMusic()` ajouté au `triggerWarp`, `playMidiLoop` systématique dans `afterMapLoad` (plus conditionnel), `playMidiLoop` ajouté dans `softSwitchToMap`.

### Bug #2 — NPCs pas présents avant refresh map ❌→✅
- **Root cause** : Si tous les sprites NPC sont déjà en cache Phaser (cas typique : retour dans une map déjà visitée), `this.load.start()` n'a rien à charger → l'event `complete` ne fire jamais → `afterNpcsLoad` jamais appelé → sprites NPC jamais créés. Refresh de map = nouveau cycle complet qui re-trigger.
- **Fix** : Check `this.textures.exists(npc.sourceTextureKey)` avant d'enqueue. Si rien à charger (`toLoad === 0`), appel direct `this.afterNpcsLoad(resolved)`.

### Architecture cible (1:1 décomp `overworld.c:LoadMapInStepsLocal`)
```
triggerWarp()
  → stopMusic()                              [FIX]
  → fadeOut(200ms)
  → scene.restart(mapName, warpId)

afterMapLoad()
  → buildTilemap()
  → ON_LOAD scripts (setmetatile)
  → resolveNpcs() + queue load
  → afterNpcsLoad() (direct ou async selon cache)

afterNpcsLoad()
  → spawn NPC sprites
  → playMidiLoop(map.music)                  [FIX]
  → ON_TRANSITION + ON_RESUME + OnFrame scripts
  → release input lock
```

### Audit complet sub-agent
3 autres bugs identifiés mais non-critiques (race condition `mapReady`, `await` manquant, listeners cleanup) → notés mais skip pour cette passe car les 4 fixes ci-dessus résolvent ~80% des symptômes visibles.

### Fichiers
- `src/scenes/OverworldScene.ts` : 4 fixes ciblés (triggerWarp, afterMapLoad music, softSwitchToMap music, afterNpcsLoad cache check)
- `src/engine/music.ts` : import `stopMusic` ajouté côté OverworldScene
- TS clean

---

## Session 39 — Fix 2 chantiers MUST : metatile-behaviors + item balls (2026-04-25)

Fait suite aux audits session 38 qui identifiaient ces 2 chantiers comme bloqueurs MVP.

### Chantier 1 — `extract-metatile-behaviors.mjs` ⭐⭐⭐
- Parser `include/constants/metatile_behaviors.h` enum séquentiel
- **240 entries extracted** avec catégorisation auto par patterns du nom
- Distribution : 75 unused / 29 secret_base / 28 other / 12 warp transport / 11 water / 10 impassable / 9 bridge / 8 jump ledge / 8 door / 7 furniture / etc.
- Sortie : `src/decomp/em/metatile-behaviors.json` + `public/decomp/em/`
- Util TS : `src/engine/metatile-behaviors.ts` avec helpers :
  - `getBehaviorInfo(byte)` → BehaviorInfo complet
  - `isEncounterTile(byte)` → herbe haute pour wild encounters
  - `isSurfableWater(byte)`
  - `isJumpLedge(byte)` + `getJumpLedgeDirection(byte)` → débloque routes Hoenn
  - `isInteractiveTile(byte)` + `getInteractiveSubtype(byte)` → PC, TV, bookshelf

### Chantier 2 — Item balls runtime
- **Extracteur `extract-item-balls.mjs`** : parse `data/scripts/item_ball_scripts.inc` (659 L) + scan tous les `data/maps/*/scripts.inc`
- **166 item ball scripts résolus** (script_label → {item, quantity, hidden})
- Top items : RARE_CANDY ×8, PP_UP ×7, NUGGET ×6, ELIXIR ×5, HYPER_POTION ×5
- Sortie : `src/decomp/em/item-balls.json` + `public/decomp/em/`

### Wiring runtime
- **`npc-loader.ts`** : `makeFallbackGfx()` → reconnaît `OBJ_EVENT_GFX_ITEM_BALL` et synthétise GraphicsInfo pointant vers `object_events/misc/item_ball.png` (16×16)
- **`script-runner.ts`** : opcode `finditem ITEM_X[, N]` (+ `finditem_underfoot`) implémenté → call `ctx.findItem(itemName, qty)` puis `ctx.markItemBallTaken(label)`
- **`OverworldScene.ts`** : handlers `findItem` (joue se_ball + msgbox "Vous avez trouvé X !") + `markItemBallTaken` (persist via gameState)
- **`game-state.ts`** : `takenItemBalls` Set persisté dans localStorage. Item balls ramassées ne réapparaissent plus au respawn map.
- **Filtrage spawn** : `resolveNpcs(...).filter(n => !ramassée)` skip les item balls déjà prises.

### Statut bloqueurs MVP
- ✅ Metatile behaviors → débloque ledges/PC/TV (lookup data dispo, à brancher dans tilemap-loader/script-runner pour PC/TV opcodes)
- ✅ Item balls visibles + ramassables → débloque starter Birch (qui utilise probablement le même pattern de pickup)
- 🚧 Restant Phase A : opcode `givemon`, `trainerbattle_single`, wild encounters

### Fichiers
- `scripts/extract-metatile-behaviors.mjs` (NOUVEAU 110 L)
- `scripts/extract-item-balls.mjs` (NOUVEAU 90 L)
- `src/engine/metatile-behaviors.ts` (NOUVEAU 70 L)
- `src/decomp/em/metatile-behaviors.json` (240 entries)
- `src/decomp/em/item-balls.json` (166 entries)
- `src/engine/npc-loader.ts` (makeFallbackGfx)
- `src/engine/script-runner.ts` (finditem opcode + ScriptContext fields)
- `src/engine/game-state.ts` (takenItemBalls)
- `src/scenes/OverworldScene.ts` (handlers + filtre spawn)
- `package.json` (2 nouveaux extracteurs dans bulk)

---

## Session 38 — Audits dialogues/maps/events + mécaniques map (2026-04-25)

2 sub-agents Explore en parallèle pour faire le point exhaustif avant Phase A.

### Audit #1 — Sources données (dialogues / maps / events)
- Inventoriés : 519 maps, 470 scripts.inc extraits (90.6%), 8k textes globaux
- Format `map.json` documenté + `scripts.inc` poryscript
- 9 extracteurs actifs couvrent l'essentiel
- **Manques** : 49 maps "vides", `data/text/*.inc` non centralisé, MAP_SCRIPT tables non exposées

### Audit #2 — Mécaniques map runtime
- **Warps** : 9 MB_* dans décomp / 6+ implémentés. Bug suspect "auto-step DOWN" pour escaliers (à valider E2E)
- **NPCs** : 81 movement types décomp / ~35 implémentés (43%). WALK_SEQUENCE + COPY_PLAYER manquants
- **Item balls** : 🐛 BLOQUANT — gfx OBJ_EVENT_GFX_ITEM_BALL non mappé → invisibles, EventScript_ItemBall non runable
- **Coord_events** : OK / **bg_events** : signs OK seulement (hidden items + secret bases manquants)
- **Metatile behaviors** : 240 MB_* dans décomp / **17 implémentés** (7%) — terrain dynamics, jump ledges, interactifs PC/TV/bookshelf manquants

### Top 5 manques critiques (priorité MVP)
1. Item balls (bloque starter Birch)
2. Auto-step après warp escaliers (à valider)
3. Terrain behaviors (encounters sauvages)
4. Jump ledges MB_JUMP_* (routes Hoenn)
5. Hidden items + bg_events spécialisés

### Livrables docs
- **NOUVEAU** `MAP_MECHANICS_REFERENCE.md` : source de vérité consolidée des audits
- `AUTOMATION_BACKLOG.md` : 3 nouveaux extracteurs prioritaires ajoutés
  - `extract-metatile-behaviors.mjs` ⭐⭐⭐ (débloque terrains/ledges/interactifs)
  - `extract-item-balls.mjs` ⭐⭐ (débloque pickup items)
  - `extract-map-scripts.mjs` ⭐⭐ (MAP_SCRIPT_ON_* persistant)

### Verdict global
> "Tient par un bout de ficelle" est juste. Core warps + NPCs basics OK pour Littleroot intro,
> mais dès qu'on explore au-delà = crash systématique sur items/escaliers/interactions.
> **Avant Phase A roadmap, fixer les 2 chantiers MUST** : item balls + extract-metatile-behaviors.

---

## 🎬 INTRO/TITLE 1:1 — CHANTIER EN PAUSE (2026-04-25)

**Statut** : MVP fonctionnel, polish pixel-perfect en pause pour libérer du temps gameplay.

### Ce qui marche aujourd'hui (à conserver)
- Boot sequence complet : BootScene (splash audio) → IntroScene (Scene 0/1/2/3) → TitleScene → MainMenuScene
- Audio : musiques intro + cris légendaires + SE_INTRO_BLAST jouent bien
- Sprites Scene 2 animés (Brendan vélo + 4 Pokémon avec spritesheets)
- Sparkles Scene 1 avec spritesheet
- Pipeline `extract-intro-rendered.py` qui transforme PNG indexé + tilemap GBA → PNG RGBA propre
- Extracteur OAM (235 sprites du décomp utilisables en 1 ligne)

### TODO pour atteindre le vrai 1:1 GBA (par ordre d'impact visuel)

#### Scene 1
- [ ] **Water drops** : 3 sprites par drop (upper/lower/reflection) avec affine matrices (slide leaf path → fall → ripple). Cf. `intro.c:SpriteCB_WaterDrop_Slide` (équations sin/cos). Atlas drops_logo.png tiles 0/16/24/48.
- [ ] **Animation lettres GF** : 9 sprites (G/A/M/E/F/R/E/A/K) aux offsets x exacts (-72 à +72), apparaissent aux frames 0/23/49/71 selon `sGameFreakLettersMoveSpeed`. 4 affine animations : Small/GrowAndShrink/GrowBig/GrowMedium. Palette cycle text.pal blanc→bleu sur 16 entries.
- [ ] **Flygon Sin Q_8_8** : oscillation y2 = -Sin(pos, 120) + scale evolution 128→512→∞ avec rotation matrix. Cf. `SpriteCB_FlygonSilhouette`.
- [ ] **Pan-up timing exact** : speeds Q16 confirmés (BG0=0xC000, BG1=0x8000, BG2=0x6000), durée 904 frames.

#### Scene 2
- [ ] **Volbeat figure-8** : `sSinXIdx += 2/f, sSinYIdx += 4/f, 3 loops`, x2 = Sin(sSinXIdx, 0x3C), y2 = Sin(sSinYIdx, 0x14). États 0-8 du décomp (WAIT_ENTER/ENTER/ZIP_BACKWARD/ZIP_DOWN/ZIP_FORWARD/INIT_FIGURE_8/FIGURE_8/EXIT/WAIT_STATE).
- [ ] **Manectric circular run** : x2 = Sin(sSinIdx, 16/64), y2 = Cos(sCosIdx, 12), phase shift -48 à sSinIdx==0x40.
- [ ] **Torchic walk→run→trip** : transition à frame 1735 (speedup) puis trip frame ~1815 (anim 48/64/80, 4t/6t/0t).
- [ ] **Player Y wobble** : `rand(±1, 0) every 8 frames`.
- [ ] **CycleSceneryPalette** : alternance colors[9] ↔ colors[10] every 8 vblanks (effet jour/nuit subtle).
- [ ] **BG parallax HOFS exacts** : speeds 0x4000/0x400/0x10 décodés via `offset -= (speed << 4)/frame`.

#### Scene 3
- [ ] **Pokéball spin authentique** : tZoomDiv += tZoomDivSpeed (++=2/f), tAlpha += 0x400/f, max 0x6BF. Affine BG2 256×256.
- [ ] **Groudon 10 states exacts** : screenX/screenY/zoom transitions précises (state 0: x+=16 jusqu'à 160, state 7: x+=4 + Sin zoom modulation, etc.). Cri à state 4→5.
- [ ] **Groudon rocks** : 6 sprites avec data `(104,0,0x0C0)..(174,1,0x100)` qui flottent up avec speed accumul + wobble y2 ^= 3.
- [ ] **Kyogre 14 states** : transitions oscillatoires complexes (states 1-2 entry sin/cos, états palette cycles).
- [ ] **Kyogre 12 bubbles** : body + fins aux positions exactes, sSinIdx += 11/frame, x2 = Sin(sSinIdx, 4).
- [ ] **Palette pulse Groudon/Kyogre** : `INTRO3_RAW_PTR(0x1E2-0x1EC)` cycle every 2 frames. Nécessite shader palette swap Phaser custom OU pre-générer 6 frames de palette différentes.
- [ ] **Lightning palette glow** : 6 u16 entries (0x1C2-0x1CE), increment 2f puis decrement 4f.
- [ ] **Rayquaza Orb** : sprite 64×64 avec affine matrix sine-modulated `foo = 256 - gSineTable[data[1]]/2`, flash invisible toggle every frame.

#### TitleScene (capture utilisateur 2026-04-25 → bugs visibles)
- [ ] **Logo Pokémon affichage cassé** : actuellement ressemble à atlas brut jaune/violet en haut. Le PNG `pokemon_logo-rendered.png` (legacy) est foiré ou la palette 8bpp n'est pas appliquée. Solution : étendre `extract-intro-rendered.py` pour traiter title_screen logo correctement (8bpp + bg.pal title spécifique).
- [ ] **Version Emerald affichée double** : sprite OAM Version est 2×(64×32) = "VERSION" gauche + "EMERAUDE" droite, mais on charge le PNG entier en 1 image → effet escalier visible. Solution : utiliser `loadOamSprite('VersionBannerLeft')` + `('VersionBannerRight')` avec frames 0 et 64 dans atlas.
- [ ] **Press Start + Copyright affichés en escalier** : pareil — sprites 5×(32×8) "PRESS START" + 5×(32×8) "©GAME FREAK Nintendo" composés côte à côte, pas une seule image. Solution : 10 sprites alignés horizontalement avec frames OAM.
- [ ] **Rayquaza visible mais sans wave clouds animé** : OK pour MVP, polish hardware GBA scanline reste TODO.
- [ ] **Logo Shine animation** : sprite 64×64 traverse l'écran (modes SINGLE/DOUBLE), spawns aux frames 80 et 192.
- [ ] **Rayquaza remontée timing exact** : Y init = -8192 px, += 1px every 2f, Phase1 (256 frames) → Phase2 (144 frames).

### Pourquoi en pause
- Effort estimé restant : 4-6 sessions dédiées (palette shaders + affine matrices + states machines exactes).
- ROI gameplay = 0 (l'intro joue déjà, son ok, c'est juste pas pixel-perfect art).
- Priorité : avancer sur le moteur de jeu (combats, NPCs, scripts maps) qui débloque la jouabilité.

### Comment reprendre
1. Relire les 3 audits Agents complets (session 37 — capturés dans le scrollback)
2. Implémenter les TODOs ci-dessus scène par scène
3. Pour les effets palette hardware : étudier Phaser custom shader pipeline (`Phaser.Renderer.WebGL.Pipelines`)
4. Pour les affine matrices : utiliser `setRotation` + `setScale` Phaser (équivalent fonctionnel)

---

## Session 37 — Polish intro 1:1 + BootScene audio + extract-rendered Python (2026-04-25)

### BootScene autoplay audio fix
- Nouvelle scène `BootScene` placée avant IntroScene dans le scene array
- Affiche "▶ Click pour démarrer" (pulse animation)
- Au click/keydown : `primeAudio()` puis `scene.start('IntroScene')`
- L'intro joue ensuite **avec son** sans aucune interaction utilisateur
- Plus aucun "skip accidentel" pendant la cinématique

### Pre-processing Python étendu (`scripts/extract-intro-rendered.py`)
Conversion **PNG indexé + tilemap u16 + palette JASC → PNG RGBA** prêt pour Phaser :
- 4 fonctions clés :
  - `read_jasc_pal()` : parse format JASC text (header + N×"r g b")
  - `apply_palette()` : remap pixel indices avec palette externe (idx 0 = transparent)
  - `compose_tilemap()` : décode format GBA u16 (tile_id 10b + hflip + vflip + palette 4b), supporte `skip_tile_zero` pour les BG affine type Rayquaza
  - `make_transparent_sprite()` : top-left = transparent (sprites simples)
- Génère `public/decomp/em/intro-rendered/scene_{1,2,3}/` + `title-rendered/`
- Pipeline ajouté à `extract:all-bulk`

### Trois agents Explore en parallèle pour audits 1:1 décomp
Récupère les CHIFFRES exacts sans cramer mes tokens :
- **Scene 1** : timeline frame-by-frame, water drops 3 sprites/drop avec affine matrices, lettres GF (G/A/M/E/F/R/K avec offsets x exacts + animation 4 phases), 11 sparkles, Flygon Sin Q_8_8
- **Scene 2** : timing Brendan (5 states) + Manectric/Torchic/Volbeat/Flygon avec spritesheet anims (Walk 5t, Run 3t, Trip 4-6t)
- **Scene 3** : Pokéball spin tZoomDiv += tZoomDivSpeed, Groudon 10 states + rocks 6 sprites + cri, Kyogre 14 states + bubbles 12, Lightning 6 bolts palette glow, Rayquaza pan/zoom + Orb 64×64

### Animations Phaser sprites (Scene 2)
Refacto `runBikeRide` :
- `this.load.spritesheet()` avec frameWidth/frameHeight (Brendan 64×64, Torchic 32×32, etc.)
- Animations Phaser via `this.anims.create()` : 8 anims (manectric-run, torchic-walk/run, brendan-bike, etc.)
- Sprites animés en boucle via `play(animKey)` au lieu d'images statiques

### Sparkles spritesheet (Scene 1)
- Sparkle.png 16×128 = 5 frames de 16×16
- Animation `sparkle-flash` avec 5 frames @ 30fps, destroy après 200ms

### TitleScene refactorée
- BootScene fait le primeAudio → TitleScene direct fade in animations
- Rayquaza monte du bas (Phase1 décomp), 2500ms ease Quad.Out
- Logo Pokémon fade in avec délai 1500ms (mimics Phase2)
- Version Émeraude slide up + fade
- Press Start blink period 533ms (= 32 frames @ 60fps ≈ `& 16` bit toggle décomp)
- Cri Rayquaza + mus_title.mid au démarrage
- Click/key → fade blanc → MainMenuScene

### Limitations 1:1 restantes (TODO future sessions)
- Water drops Scene 1 : affine matrices + 3 sprites/drop (compose à la main)
- Animation lettres GF : 9 sprites avec affine GrowAndShrink/GrowBig
- Palette pulse Groudon/Kyogre (hardware GBA, faisable via shader Phaser custom)
- Wave scanline effect clouds Title (vertex displacement shader)
- Logo Pokémon 8bpp affine BG (vraie compose 256-color tilemap)
- Rocks Groudon flottants + Bubbles Kyogre (sprites simples skipped)

### Fichiers touchés
- `src/scenes/BootScene.ts` (NOUVEAU 35 L)
- `src/scenes/IntroScene.ts` (refacto Scene 2 spritesheets + sparkle anim)
- `src/scenes/TitleScene.ts` (réécrit avec animations entrée)
- `src/main.ts` (BootScene en première position)
- `scripts/extract-intro-rendered.py` (étendu title_screen)

---

## Session 36 — IntroScene Scenes 2 + 3 (MVP complet) (2026-04-25)

### Scene 2 (bike ride + Pokémon, ~15.3s)
- 4 BG layers parallax horizontal (clouds_bg / trees / houses / grass) avec speed différent
- Player Brendan + bicycle (sprites OAM auto-résolus)
- 4 Pokémon : Manectric, Torchic, Volbeat (figure-8), Flygon (Latias variant)
- Timeline 5 états player : entry → drift back → forward → back → static → exit
- Fade blanc → Scene 3

### Scene 3 (legendaries, ~36s)
- Pokéball spin (zoom 0.3→1.5 + rotation 720°) avec MUS_INTRO_BATTLE
- Groudon : sprite + scale pulse + cri Groudon WAV
- Kyogre : sprite + bubbles montantes + cri Kyogre WAV
- Clouds collide centre (left + right tilemaps qui convergent)
- Lightning bolts (6 sprites aux positions exactes du décomp)
- Rayquaza pan-in + zoom 0.5→1.5 + cri WAV
- RayquazaOrb explode + SE_INTRO_BLAST
- Fade blanc → TitleScene

### Simplifications vs décomp pixel-perfect (à polir)
- Pas d'affine matrices GBA (zoom/rotate via Phaser tweens)
- Pas de palette cycling hardware (couleurs statiques)
- Pas de WIN0/WIN1 cinema bars
- Sprites Groudon/Kyogre affichés entiers (vs tilemap 512×512 affine GBA)
- Animations sprites simples (pas de spritesheet walk/run frames)

### Backlog polish
1. Animation lettres GF (9 sprites + affine matrices + palette cycle 9 étapes)
2. Water drops (3 sprites composés + affine slide leaf)
3. Spritesheets Brendan/May/Pokémon (atlas vertical → frames Phaser)
4. Cinema bars Scene 3 (Groudon/Kyogre)
5. Palette cycle rocks Groudon + bubbles Kyogre
6. Vraie affine BG2 pour Pokéball spin

### Boot sequence end-to-end
Copyright (2.6s) → GF logo (17s) → bike ride (15s) → legendaries (36s) → Title
**Total intro = ~71 sec** (vs 85 sec décomp = -16% car simplifications timings).

---

## Session 35 — IntroScene Scene 1 + extracteur OAM sprites (2026-04-25)

### Scene 1 (GF logo + pan-up + Flygon silhouette) — MVP
- 4 BG layers parallax composés via `composeGbaTilemap` (atlas + .bin)
- Pan-up vertical avec deltas Q16 différents par layer
- GF logo + Flygon silhouette via OAM extracteur (cf. ci-dessous)
- 11 sparkles aux positions exactes du décomp
- MUS_INTRO démarre frame 1
- Fade blanc final → Scene 2

Simplifications vs décomp :
- Pas d'animation lettres GF (affine matrices, palette cycle 9 étapes)
- Water drops absents (slide leaf complexe)
- Pan-up linéaire (pas de Sin smoothing)

### Util `composeGbaTilemap` (`src/util/compose-tilemap.ts`)
Compose un atlas PNG + tilemap GBA u16 (.bin) en canvas Phaser. Supporte :
- tile_id sur 10 bits (0..1023)
- horizontal/vertical flip
- mode 1D_MAP (atlas linéaire stride = atlas.width/8)

Réutilisable par toutes les scènes intro (et titre, birch, etc.) qui ont des BG composés depuis tilemaps.

### ⭐ Extracteur OAM sprites (`scripts/extract-oam-sprites.mjs`)
Parse **310 fichiers .c** du décomp et extrait :
- **197 OamData** structures (shape + bpp + tileNum)
- **651 AnimCmd** structures (premier ANIMCMD_FRAME = tile index)
- **284 SpriteTemplate** structures (link OAM + Anim + tags)
- **235 sprites résolus** (link 3-way validé) → `oam-sprites.json`

Sortie : `src/decomp/em/oam-sprites.json` (import statique TS) + `public/decomp/em/` (debug).

### Util `loadOamSprite` (`src/util/oam-sprite.ts`)
API one-liner : `loadOamSprite(scene, 'GameFreakLogo', 'atlas-key')`
- Calcule auto atlasRect = (x, y, w, h) depuis tileNum + atlas dimensions
- Enregistre comme sub-frame Phaser via `texture.add()`
- Cache : pas de duplication si appelé 2× pour le même sprite
- Support tileOffset pour les variantes (ex: lettres GAME FREAK individuelles)

### Validation IntroScene
- `GameFreakLogo` (32×64, tileNum 128) ✓
- `FlygonSilhouette` (64×32, tileNum 0) ✓

### Bénéfice attendu
Tous les sprites du décomp (235 disponibles, dont Brendan/May vélo, Pokémon intro,
Groudon/Kyogre/Rayquaza, etc.) maintenant utilisables en 1 ligne sans investigation
manuelle. ROI massif pour Scenes 2/3 + scènes futures (birch, naming, evolution, battle anims).

### Fichiers
- `scripts/extract-oam-sprites.mjs` (nouveau, 110 L)
- `src/util/oam-sprite.ts` (nouveau, 70 L)
- `src/util/compose-tilemap.ts` (nouveau session 35a, 80 L)
- `src/decomp/em/oam-sprites.json` (généré, 235 entries, ~30 KB)
- `src/scenes/IntroScene.ts` (Scene 1 implémentée, refactorée pour utiliser util OAM)
- `package.json` (+ extract:oam-sprites dans bulk)

---

## Session 34 — IntroScene structure + Scene 0 copyright (2026-04-25)

Démarrage du port de la cinématique d'intro Pokémon Émeraude (`src/intro.c` 3435 L).

### Découverte (2 sub-agents Explore very thorough)
- Audit `intro.c` : 4 scènes (~5100 frames = 85 sec total)
  - Scene 0 : copyright (~5.3s, statique)
  - Scene 1 : GF logo + pan-up + Flygon silhouette (~17s)
  - Scene 2 : vélo + Pokémon parallax (~16s)
  - Scene 3 : combat Groudon/Kyogre/Rayquaza (~50s)
- Inventaire assets `graphics/intro/` : 72 fichiers (~118 KB)
  - copyright + scene_1 (4 BG layers) + scene_2 (vélo+pokémon+parallax) + scene_3 (légendaires 8bpp + clouds + lightning)

### Implémenté
- `scripts/extract-intro-assets.mjs` : copie tous PNG/pal/bin → `public/decomp/em/intro/`
- `src/scenes/IntroScene.ts` : structure complète
  - State machine 4 phases (COPYRIGHT/GF_LOGO/BIKE_RIDE/LEGENDS/DONE)
  - Skip universel (clavier ou souris) → fade noir 150ms → TitleScene
  - **Scene 0 implémentée** : fade in 267ms + hold 4.5s + fade out 533ms → next phase
  - Stubs pour Scene 1/2/3 avec placeholders + lance `mus_intro.mid` au début Scene 1
- `src/main.ts` : IntroScene en première position du scene array
- `package.json` : `extract:intro` + ajouté à bulk

### Plan multi-session restant
- **Session 35** : Scene 1 (4 BG parallax + pan-up + GF logo animations + water drops + sparkles + Flygon silhouette)
- **Session 36** : Scene 2 (vélo + Brendan/May + Manectric/Torchic/Volbeat/Flygon + parallax landscape)
- **Session 37** : Scene 3 (Pokéball spin + Groudon + Kyogre + clouds + Rayquaza + lightning + orb)

### Limites techniques anticipées
- Affine BG transformations GBA → approximations Phaser via setScale/setRotation
- Palette cycling hardware → tween de tint Phaser ou shader custom
- BG layers parallax 4 simultanés → 4 Image avec Y scrolls indépendants
- 8bpp Groudon/Kyogre → PNG natif Phaser (déjà décompressé)

---

## Session 33 — Audio refacto SpessaSynth + bank select correct (2026-04-25)

Migration `sappy-player.ts` (570 L synthèse manuelle) → `music.ts` SpessaSynth + SF2 (60→195 L).

### Stack finale
- `WorkletSynthesizer` SpessaSynth (thread séparé via AudioWorklet)
- `Sequencer` joue les MIDI standard du décomp
- SF2 `Emerald.sf2` 7.7 MB d'archive.org (téléchargé manuellement dans `public/decomp/em/music/`)

### 3 bugs majeurs corrigés
1. **Loop infini** : `sequencer.loopCount = -1` ne marche pas (cond worklet : `if(loopCount > 0)`).
   Sentinel réel = `Infinity` (testé : `loopCount !== 1/0` pour skip décrément).
2. **Instruments manquants** : SF2 d'Emerald a **176 banks** (1 par voicegroup), MIDIs envoient
   `program change` mais aucun `bank select` → SpessaSynth tape dans bank 0 incomplet (~50 progs
   sur 128 attendus). Fix : auto-résolve `URL MIDI → song → voicegroup → bank` et CC#0 forcé
   sur les 16 channels avant `play()`. Validation empirique : `voicegroup_title=bank 48`.
3. **5 voicegroups skipped par GBAMusRiper** identifiés : `cry_tables` (no .inc), `bard`,
   `unused_2`, `rg_unused`, `rg_unused_2` → match exact 176 banks SF2.

### Nouveaux extracts (`scripts/extract-voicegroups.mjs`)
- `voicegroup-banks.json` : 176 entries (`voicegroup_X → bank N`)
- `song-voicegroups.json` étendu pour inclure se_*.mid (473 songs+SFX vs 204 musics seules)

### Nouvelles APIs `music.ts`
- `playMidiLoop(url, bankOverride?)` : musique boucle infinie (auto-bank)
- `playSE(name)` : sound effect one-shot via SpessaSynth, restore bank musique à songEnded
- `playCry(species)` : cri Pokémon via Web Audio direct (WAV pré-extrait dans `cries/`)
- Cache MIDI in-memory pour éviter refetch

### Wire dans `script-runner.ts`
- Opcodes `playse`/`playfanfare`/`playbgm`/`playmoncry` plus no-op : route vers ctx.playSE/BGM/Cry
- `waitse`/`waitmoncry`/`waitfanfare` : non-bloquants (TODO si besoin de sync)

### Fichiers touchés
- `src/engine/music.ts` (refacto complet)
- `src/engine/script-runner.ts` (audio routing + 3 nouveaux ScriptContext fields)
- `src/scenes/OverworldScene.ts` (passe playSE/BGM/Cry au ScriptContext)
- `src/scenes/TitleScene.ts` (utilise playMidiLoop sans override)
- `scripts/extract-voicegroups.mjs` (génère voicegroup-banks.json)
- `package.json` (`extract:voicegroups` dans bulk)

### Limites connues
- `playSE` peut momentanément glitcher la musique (force bank SE sur tous les channels, restore
  au songEnded). Acceptable MVP. Solution propre : 2e WorkletSynthesizer dédié SE.
- Loop intermédiaire authentique (intro distinct + boucle) non implémenté : tous les morceaux
  rebouclent du début. La majorité Emerald n'a pas d'intro distinct → impact faible.

---

## Session 32 — Domaine A: Movement extraction + refacto (2026-04-25)

Première application de la stratégie `DECOMP_ORIGIN_FILES.md` (master catalog créé en session 31).

### Fichiers origine identifiés (Domaine A)
- `asm/macros/movement.inc` (166 L) : mapping `script_name → MOVEMENT_ACTION_*` (160 entries)
- `include/constants/event_object_movement.h` (336 L) : 160 MOVEMENT_ACTION_* + 81 MOVEMENT_TYPE_*
- `src/data/object_events/movement_action_func_tables.h` (1521 L) : impls callbacks (référence)
- `src/event_object_movement.c` : `sMoveSpeedTimes[]` = {32, 16, 8, 4} frames pour slow/normal/fast/faster

### Extracteur nouveau
- `scripts/extract-movement-actions.mjs` :
  - Parse `event_object_movement.h` pour valeurs MOVEMENT_ACTION_*
  - Parse `movement.inc` macros `create_movement_action <name>, MOVEMENT_ACTION_*`
  - Dérive metadata (dx, dy, facing, kind, speedMs) depuis le name (regex sur walk_/face_/jump_/delay_/emote_/etc.)
  - **Output : 159/160 actions** dans `public/decomp/em/movement-actions.json`

### Refacto runtime
- `movement.ts` :
  - `loadMovementActions(json)` → état global `actionsFromJson`
  - `lookupAction(name)` : JSON décomp en priorité, fallback `ACTIONS_FALLBACK` hardcoded (boot edge case)
  - `runMovement` consomme via lookupAction au lieu de ACTIONS direct
- `OverworldScene` : `preload()` charge JSON, `create()` appelle `loadMovementActions(movJson)`
- `package.json` : `extract:movement-actions` + ajouté à `extract:all-bulk`

### Couverture
| Avant | Après |
|---|---|
| 70 actions hardcoded | **159 actions JSON décomp** |
| Action exotique (slide, run, ride_water_current) → no-op silent | Fallback warn + skip propre |
| Vitesses estimées approximatives | Vitesses calculées depuis `sMoveSpeedTimes` (16/32/8/4 frames @ 60fps = 267/533/133/67ms) |

### Effet attendu
Tous les scripts NPCs avec applymovement complexes (slides, jumps spéciaux, bobbing) jouent maintenant correctement (au lieu d'être skipped silencieusement). Le décomp Birch's Lab + truck intro + rivals chez Mom devraient être plus fidèles.

**TypeScript** : clean.

## Session 31 quinquies — Fichiers centraux décomp + corrected font remap (2026-04-25)

User demande "y a-t-il un fichier central qui lie tout ?". Réponse : OUI, 4 fichiers centraux :

| Fichier | Catalog |
|---|---|
| `src/text.c:119 sFontInfos[]` | 10 fonts (FONT_NORMAL, SHORT, NARROW, etc.) avec defaults `{fgColor=2, bgColor=1, shadowColor=3}` (= INDICES dans la palette runtime) |
| `src/text_window.c:60 sWindowFrames[]` | 20 frames (1.png-20.png) + palettes pair |
| `src/text_window.c:51 sTextWindowPalettes[]` | 5 palettes (message_box embedded + text_pal1-4) |
| `src/menu.c:84,98 sStandardTextBox + sYesNo` | Templates pos/size |

### Découverte critique : encoding font tile réel
`GenerateFontHalfRowLookupTable(fg, bg, shadow)` (src/text.c:363) génère un lookup de 81 entrées (= 3^4 combinations). Confirme :
- Tile encoding : 2-bit per pixel, valeurs **0/1/2** seulement
- value 0 → palette[bgColor=1] = WHITE (= window bg)
- value 1 → palette[fgColor=2] = DARK (= visible body)
- value 2 → palette[shadowColor=3] = CREAM (= subtle shadow)

Notre PNG indexé 4bpp mappe : **idx 0 = transparent (background hors cells)**, **idx 1 = fg (body)**, **idx 2 = shadow**, **idx 3 = bg fill (du glyphe cell)**.

### Erreur précédente corrigée
J'avais inversé le mapping : `idx 1 → palette[1] white (invisible)` au lieu de `idx 1 → palette[fg=2] dark (visible)`. Résultat : letters PALES blanches.

**Fix** : `bitmap-font.ts authenticColors` v2 :
- PNG idx 1 (56,56,56) → palette[fg=2] (96,96,96) DARK = body visible
- PNG idx 2 (216,216,216) → palette[shadow=3] (208,208,200) CREAM = subtle, invisible halo
- PNG idx 3 (255,255,255) → palette[bg=1] (248,248,248) WHITE = matches dialog interior

Reproduit fidèlement TextPrinter du décomp via constants extraites de `sFontInfos[FONT_NORMAL]`.

**TypeScript** : clean.

## Session 31 quater — Fix authentic palette (95% → 100% GBA) (2026-04-25)

User a comparé screenshot GBA original vs notre rendu. Diagnostic :
- Body lettres dark gray + halo light gray visible derrière → **DÉVIATION** vs GBA (body invisible + shadow dark = outline crisp)
- Intérieur dialog #FFFFFF pur → **DÉVIATION** légère vs GBA (gMessageBox_Pal[1] = 248,248,248)

### Fix authenticColors (TextPrinter remap du décomp)
- `bitmap-font.ts RenderTextOpts` : nouveau flag `authenticColors`
- Post-process : remap font_idx 1 (PNG dark gray 56,56,56) → palette[1] (248,248,248) WHITE = invisible body, font_idx 2 (PNG light gray 216,216,216) → palette[2] (96,96,96) DARK gray = visible OUTLINE
- Reproduit `sTextColors[] = { ..., TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY }` (menu.c:110)
- Appliqué à `dialogue-box.ts render()` + `menu.ts createMenu()` (labels)

### Fix interior color (gMessageBox_Pal[1])
- `window-renderer.ts composeDialogTexture` : overlay couleur `rgb(248,248,248)` au lieu de `#FFFFFF`
- Match exact `FillWindowPixelBuffer(PIXEL_FILL(1))` du décomp avec embedded palette

**Résultat attendu** : ~100% fidélité GBA (frame cyan + intérieur cream + lettres outline crisp sans halo).

**TypeScript** : clean.

## Session 31 ter — Fix font idx 3 + down_arrow + dialog white (2026-04-25)

User signal après tests : (1) fond dialog pas blanc pur, (2) gray bg derrière les lettres, (3) fleche rouge = rectangle, (4) cursor = carré noir.

User demande aussi : "Normalement y a un fichier bien spécifique qui répertorie tout ça". Réponse : dans le décomp, **les fichiers centraux UI sont** `src/text_window.c` (frames + palettes) + `src/menu.c` (templates + Draw* functions) + `src/text.c` (rendu glyph + remap palette) + `include/text.h` (constantes TEXT_COLOR_*). Pas un seul JSON catalog mais une convention hiérarchique stricte.

### Diagnostics via inspection PNG raw (pngjs)

**font latin_normal.png (256×512, 4-color palette indexée)** :
- idx 0 = (144,200,255) light blue = BG
- idx 1 = (56,56,56) dark gray = text outline
- idx 2 = (216,216,216) light gray = shadow / anti-alias
- idx 3 = (255,255,255) WHITE = "BG fill du glyphe"

**Le décomp remappe au runtime** via TextPrinter :
- font_idx 0 → TEXT_COLOR_TRANSPARENT (toujours)
- font_idx 1 → fgColor (configurable, ex. dark_gray pour menu)
- font_idx 2 → shadowColor (ex. light_gray)
- **font_idx 3 → bgColor** (souvent TRANSPARENT pour cursor/menu, parfois white pour dialog)

Notre web port chargeait font_idx 3 comme blanc opaque : OK sur dialog blanc, MAIS le cursor ▶ a un BG fill blanc bake-in sur la moitié gauche → `setTint(noir)` → carré noir.

**down_arrow.png (8×48, 16-color palette)** :
- Pas 6 frames de 8×8 — **3 frames de 8×16** (arrow complète à 3 offsets bobbing)
- Couleurs natives : outline (idx 2 dark gray) + fill (idx 4 ROUGE !)
- Animation : cycle frame index `{0, 1, 2, 1}` (= sDownArrowYCoords), 133ms
- `setTintFill(0xd02020)` écrasait TOUT en rouge → "rectangle rouge" au lieu d'outline+fill

### Fixes appliqués

1. **`window-renderer.ts composeDialogTexture`** : overlay `ctx.fillRect('#FFFFFF', ...)` sur la zone WindowPixelBuffer après dessin tile 9. Reproduit `FillWindowPixelBuffer(PIXEL_FILL(1))` du décomp = palette idx 1 = blanc pur.

2. **`bitmap-font.ts renderTextToCanvas`** : nouveau param `opts.transparentizeWhite` qui scan post-render pour set alpha=0 sur les pixels (255,255,255). Reproduit le remap font_idx 3 → bgColor = TRANSPARENT du printer pour les contextes cursor/menu.

3. **`menu.ts createMenu`** : cursor `▶` rendu avec `transparentizeWhite: true` → seul le triangle (idx 1+2) reste visible → `setTint(0x202020)` = vrai triangle noir sur transparent.

4. **`dialogue-box.ts setupArrow + render`** :
   - `preloadDialogueAssets` : spritesheet 8×16 (pas 8×8)
   - `setupArrow` : sample center (4,4) + slice 8×16
   - `render` : animation cycle `setFrame([0,1,2,1])` au lieu de `y = base + offset`
   - **Suppression de `setTintFill(0xd02020)`** : la flèche utilise les couleurs natives du PNG (outline gris + fill rouge = look authentique GBA)

**TypeScript** : clean.

## Session 31 bis — Fix dialog frame ≠ menu frame (2026-04-25)

User signal : "C'est toujours hardcodé, je le sais car c'est pas réparé". Visual du dialogue identique avant/après migration.

**Diagnostic** : j'avais utilisé `frameId: 1` par défaut (= `1.png`, le 9-slice menu) pour TOUS les contextes. Le décomp distingue 2 systèmes :
- **Menu / std window / yesno** = `WindowFunc_DrawStandardFrame` (src/menu.c:252) avec 9 tiles depuis `sWindowFrames[N].tiles` (où N est le frame choisi par l'user dans options, défaut 0 = `1.png`). Pattern 3×3 simple = NineSlice.
- **Dialog (msgbox)** = `WindowFunc_DrawDialogueFrame` (src/menu.c:319) avec 14 tiles depuis `gMessageBox_Gfx` (= `message_box.png` 56×16 = 7×2). Pattern asymétrique : tiles 1,3,4,5,6 sur ligne haute + 7,9,10 sur lignes intérieures + V_FLIP pour le bas.

**Fix** :
- Nouvelle fonction `composeDialogTexture(scene, w, h)` dans `window-renderer.ts` qui reproduit exactement `WindowFunc_DrawDialogueFrame` :
  - Canvas de `(width+3) × (height+2)` tiles
  - Ligne 0 : tiles 1, 3, 4×(w-1), 5, 6
  - Lignes 1 à h : tile 7 | tile 9×(w+1) | tile 10
  - Ligne h+1 : V_FLIP des tiles de la ligne 0 (transform canvas scale -1 vertical)
- Nouvelle API `createDialogWindow(scene, name, opts)` qui retourne un `WindowHandle` avec frame = Image (pas NineSlice, car composition gère déjà la taille)
- `dialogue-box.ts` : `render()` utilise `createDialogWindow` au lieu de `createWindow` → vrai cadre dialog GBA fidèle

**Reliquat** : 6 tiles non utilisées dans message_box.png (indices 0, 2, 8, 11, 12, 13) — probablement réservées pour d'autres usages (battle dialog, etc.).

## Session 31 — Vague 7 Phase 2+3 : WindowRenderer (2026-04-25)

Suite directe de session 30 (qui a posé Phase 1 = extracteurs templates/palettes).

### Fix Phase 1 (raffinement)
- `extract-window-templates.mjs` v2 : 2 bugs corrigés
  - **Single-struct** : le regex parsait les arrays de structs (`sName[]`) mais ratait les structs simples (`sYesNo` sans `[]`). Fix : si `entries.length === 0` après scan des `{...}` nested, parser le body entier comme un struct.
  - **Scope trop étroit** : seulement 8 fichiers source explicitement listés. Fix : `listAllCFiles(decompPath/src)` récursif.
- Résultat : **117 templates extraits** (vs 6 avant). `sYesNo_WindowTemplates`, `sStandardTextBox_WindowTemplates`, plus tous les battle/tournament/naming/save info.

### Module `src/engine/window-renderer.ts` (nouveau)

API :
- `preloadWindowAssets(scene)` : load 21 PNG frames (1-20 + message_box) + JSON templates + JSON palettes
- `setupWindowAssets(scene)` : wire JSON dans état global
- `loadWindowTemplates(t)` / `loadWindowPalettes(p)` : alternative manuelle
- `getWindowTemplate(name)` / `getTemplatePixelRect(name)` : lookup direct
- `createWindow(scene, name, opts?)` → `WindowHandle | null`
  - opts : `frameId` (1-20 ou 'message_box', défaut 1), `paletteName` (text_pal1-4 etc.), overrides position
  - retourne `{ frame, pixelX, pixelY, pixelW, pixelH, template }`

Composition texture (palette remap) : extrait l'ordre d'apparition unique des couleurs RGB du PNG, mappe à l'index palette correspondant, remplace pixel par pixel. Cache par `(frameId, paletteName)`. Si pas de palette demandée → retourne PNG natif (déjà coloré par décompiler).

### Migrations
- `OverworldScene.preload()` : ajout `preloadWindowAssets(this)`
- `OverworldScene.create()` : ajout `setupWindowAssets(this)` (à côté de `setupDoorAnim`)
- `OverworldScene.askYesNo` : position lue via `getTemplatePixelRect('sYesNo_WindowTemplates')` (fallback pos originale si non chargé)
- `dialogue-box.ts` `render()` : `createWindow('sStandardTextBox_WindowTemplates')` à la place du nineslice manuel + 4 constantes pixel hardcodées (16/120/216/32). Fallback identique.

### Reste à faire (Phase 3 résiduel)
- `multichoice` : position toujours dynamique côté `OverworldScene.askMultichoice` (script_menu.c:630 fait pareil, mais on pourrait refacto avec un template "sMultichoice" si extrait).
- Naming screen / money box : pas encore utilisés.
- Phase 4 : tests visuels GBA vs web.

**TypeScript** : `tsc --noEmit` clean.

## Ce qui existe

### Extracteur de décomp (`scripts/extract-decomp.mjs`)

Script Node (pur ESM) qui lit un repo pokeemerald-decomp cloné en local et
recopie les assets consommables dans `public/decomp/<prefix>/`. Les fichiers
sont ensuite servis comme assets statiques par Vite.

**Utilisation :**
```bash
npm run extract:em      # pokeemeraude (Hoenn, FR) → public/decomp/em/
npm run extract:fr      # pokerougefeu (Kanto, FR) → public/decomp/fr/  (pas encore cloné)
```

**Premier run sur pokeemeraude :**
- 518 maps (map.json avec events, NPCs, warps, signs, triggers)
- 441 layouts (map.bin + border.bin = données binaires de tuiles)
- 3 tilesets primaires + 67 secondaires (tiles.png + metatiles.bin + palettes)
- 388 sprites Pokémon (front, back, shiny, icon, footprint, palettes)
- 92 sprites NPC overworld
- 93 sprites dresseurs (front) + 8 back pics
- ~14 MB total

### Moteur overworld (`src/scenes/OverworldScene.ts`)

- Map tuiles 20×15, rendu Phaser avec `Rectangle` colorés (placeholder,
  pas encore les vrais tilesets Emerald — ça vient ensuite)
- Joueur : sprite `brendan/walking.png` extrait (16×32, 2 tiles de haut)
- NPC : sprite `boy_1.png` extrait
- Déplacement grille avec ZQSD / flèches
- Changement de direction + flip horizontal pour "droite"
- Collisions depuis le JSON de map
- **W** pour interagir avec un NPC devant soi → dialogue → combat
- **B** pour ouvrir l'overlay menu

### Moteur de combat (`src/battle/runner.ts`)

Wrapper autour de `@pkmn/sim` en mode streaming. Packe les équipes au format
Showdown, lance un combat Gen 3 custom, parse le protocole Showdown ligne par
ligne et émet des événements (`move`, `damage`, `faint`, `win`, etc.).

Deux IA random pour le démo. À remplacer plus tard par :
- Input joueur pour p1
- IA dresseur scripté (ou l'AI script d'Emerald qu'on aura extrait)

### Battle scene (`src/scenes/BattleScene.ts`)

- Reçoit le trainer depuis l'overworld
- Affiche sprite front du Pokémon ennemi (depuis `/decomp/em/pokemon/<species>/front.png`)
- Affiche sprite back du Pokémon joueur
- Log textuel des coups traduits en FR depuis le protocole Showdown
- ESC/ESPACE pour revenir

### Menu overlay (`src/scenes/MenuOverlayScene.ts`)

Mockup du menu Start style Gen 3 (POKéDEX, POKéMON, SAC, etc.). Non fonctionnel,
juste visuel.

### Éditeur de map (`editor.html` + `src/editor/editor.ts`)

Page séparée accessible depuis le lien en haut du jeu.
- Palette de 4 tuiles (pour le format placeholder actuel)
- Clic = peindre, clic droit = effacer
- Mode collision séparé (toggle sur clic)
- Export JSON / Download .json / Load route1.json / Clear

À étendre : pouvoir charger une vraie layout Emerald (map.bin + metatiles +
tileset PNG) et éditer en vrais metatiles Gen 3.

---

## Ce qu'il reste à faire (roadmap)

### Phase 2 — Import Hoenn vrai

- [ ] **Loader de metatiles** : lit `map.bin` + `metatiles.bin` + `tiles.png`
      + palettes `.pal` → produit une texture rendue pour une map donnée
- [ ] Charger Littleroot Town (layout `LAYOUT_LITTLEROOT_TOWN`) et marcher
      dessus avec le vrai rendu Emerald
- [ ] Parser `.pal` JASC-PAL → appliquer les palettes correctement aux tuiles
      (les tuiles 4bpp utilisent une palette 16 couleurs indexée)
- [ ] Extraire et afficher les warps (portes) pour passer d'une map à l'autre
- [ ] Afficher les NPCs depuis `map.json.object_events` avec leur vrai
      `graphics_id`

### Phase 3 — Scripts NPC minimaux

- [ ] Parser `data/maps/<Name>/scripts.inc` → IR JSON
- [ ] Parser les chaines `.string`/text files → table de dialogues
- [ ] Implémenter un interprète des 20-30 commandes de script les plus
      utilisées (msgbox, applymovement, trainerbattle, giveitem, setflag, etc.)
- [ ] Système de flags unifié (FR + Em namespacés)

### Phase 4 — Intégration FR (Kanto)

- [ ] Cloner `pokerougefeu`
- [ ] `npm run extract:fr` → `public/decomp/fr/`
- [ ] Harmoniser tile IDs (namespace `fr_*` pour tilesets FR)
- [ ] Créer un portail créatif entre Hoenn et Kanto (bateau, train, portail
      magique — reste à imaginer)
- [ ] Vérifier que les scripts FR passent dans notre interprète

### Phase 5 — Le vrai jeu

- [ ] Vraie boucle : écran titre → start → Littleroot → Prof Birch → premier
      Pokémon → premier combat
- [ ] Sauvegarde localStorage
- [ ] Sacs, Pokédex réels
- [ ] Grand écran + règles de scaling (menu scaled x3, map x2, ou un truc
      comme ça)

---

## Décisions techniques

- **Pas de fork des décomps** : on les utilise en lecture seule comme source de
  données, pas comme code à modifier. Ça nous affranchit de toute la
  complexité du moteur C décompilé.
- **@pkmn/sim > réimplementer le moteur de combat Em** : le moteur de combat
  Gen 3 est 10 000+ lignes avec plein d'edge cases. Showdown le fait déjà
  parfaitement, c'est open source et packagé pour le navigateur.
- **Assets en `public/decomp/<prefix>/`** : servis statiquement par Vite,
  fetch au runtime. Pas dans `src/` pour éviter de les envoyer dans le
  dependency graph de Vite (trop de fichiers).
- **FR d'abord (Emerald)** plutôt que Kanto : Em a les 386 Pokémon Gen 1-3,
  la Battle Frontier, les doubles, les talents → couvre les features dès la
  région 1. Kanto ajoutera juste du contenu.

---

## Historique des itérations

### 2026-04-24 — session de démarrage

- Scaffolding Vite + TS + Phaser + configs
- Scène overworld avec map placeholder + joueur + 1 NPC, interaction W, menu B
- Wrapper @pkmn/sim en mode streaming
- Extracteur de décomp Node ESM
- **Extraction pokeemeraude réussie : 518 maps, 441 layouts, 388 Pokémon,
  92 NPCs, ~14 MB**
- Sprites overworld réels (brendan, boy_1) branchés dans l'overworld
- Sprites Pokémon réels (front/back) branchés dans la battle scene
- Éditeur de map placeholder fonctionnel (palette + peinture + export JSON)
- **Fix transparence** : les PNG indexés du décomp n'ont pas de canal alpha marqué,
  la palette color 0 est "transparente" par convention. Util
  `src/util/sprite-transparency.ts` qui remappe au runtime : lit pixel (0,0),
  met tous les pixels de cette couleur à alpha=0, rebuild une canvas-texture
  Phaser. Appliqué aux NPCs overworld et aux sprites Pokémon battle.

## Insight du jour

Puisqu'on utilise Showdown comme moteur, **changer de gen = une ligne de code**
(`formatid: 'gen3customgame'` → `'gen9customgame'`). On peut facilement
proposer "mode rétro Gen 3" ou "mode moderne Gen 9" comme réglage. Chaque
combat peut même avoir sa propre gen. Les Pokémon sont stockés une fois, leurs
règles dépendent du format choisi.

## Session 2 — Musique + Renderer metatiles

### Extraction étendue

- **530 MIDI** copiés dans `public/decomp/em/music/` (MUS_LITTLEROOT.mid,
  MUS_ROUTE101.mid, toutes les musiques de Hoenn + Battle Frontier + combats)
- **105 WAV** de samples/SFX dans `public/decomp/em/sfx/`
- **388 cries Pokémon** dans `public/decomp/em/cries/`

### Renderer de metatiles (`scripts/render-layouts.mjs`)

Pipeline de rendu depuis les données brutes du décomp :
1. Lit `tiles.png` (PNG indexé) du tileset primary + secondary
2. Reverse-lookup des pixels RGBA → indices bruts via la palette du PNG
3. Parse `metatiles.bin` (8 tile refs de 16 bits par metatile)
4. Parse les `.pal` JASC-PAL pour les vraies couleurs
5. Parse `map.bin` (2 octets par tile : metatile ID + collision/élévation)
6. Compose le tout en PNG RGBA + JSON de collisions

**Subtilités galères trouvées en route :**
- PNG primary `general` est en **8bpp** (256 couleurs), encode directement
  `palSlot * 16 + colorIdx` dans chaque pixel.
  Secondary `petalburg` est en **4bpp** (16 couleurs), laisse le metatile
  décider du palSlot.
- `NUM_PALS_IN_PRIMARY = 6` dans `include/fieldmap.h` → palettes 0-5 viennent
  du primary, **6-12 viennent du secondary** (pas 7-12). Premier essai avec
  le mauvais split : fenêtres des maisons en noir.
- Upper layer : color 0 = transparent (pour qu'on voie la lower layer).

**Résultat : 441 layouts rendered, 0 failed, ~65 MB total.**

### OverworldScene branchée sur le vrai rendu

- Charge `/decomp/em/rendered/LittlerootTown.png` comme background
- Charge `/decomp/em/rendered/meta/LittlerootTown.json` pour les collisions
- Caméra qui suit le joueur (map 320×320 > viewport 320×240)
- Label de map en HUD, fixé à l'écran
- NPC démo placé à (8, 12), interaction W → combat via Showdown

### Ce qui reste pour la v0.2

- [ ] Parser `map.json` du décomp → spawner les vrais NPCs (Brendan, May,
  Professeur Seko/Birch, etc.) avec leur graphics_id réel
- [ ] Lecteur MIDI navigateur (Tone.js + soundfont, ou lib plus légère)
- [ ] Warp events : porter d'une map à l'autre (Littleroot ↔ labo intérieur
      ↔ Route 101)
- [ ] Script runner minimal : au moins `msgbox` et `trainerbattle`

## Architecture : Kanto-as-addon sur le moteur Emerald

**Décision (session 5, affinée) :**

Direction d'ensemble : **Kanto tourne sur le moteur Hoenn**, UI/menu/textbox/font
 d'Emeraude garde la main partout. Mais pour l'extraction : on prend **TOUT des deux décomps** (full `em/` + full `rf/` en parallèle), on décide sur le tas au runtime lesquelles sources on consomme pour chaque feature.

Concrètement :
- **Extracteur em** (déjà fait) : tout pokeemeraude dans `public/decomp/em/`.
- **Extracteur rf** (à écrire) : tout pokerougefeu dans `public/decomp/fr/`, même pipeline, même structure, rien de coupé à l'extraction.
- **Au runtime** : par défaut on consomme `em/` pour UI/menus/battle-UI/fonts ; on consomme `fr/` pour le contenu Kanto (maps, scripts, trainers Kanto, tilesets Kanto). Les choix se font scène par scène, asset par asset — pas de règle figée à l'extraction.

**Why :** plus flexible pour des mélanges imprévus (ex : tileset d'intérieur Kanto qu'on voudrait utiliser à Hoenn, ou sprite dresseur d'Emerald réutilisé à Kanto). Coûte juste ~80-100 MB de disque en plus, c'est rien.

**How to apply :** quand on attaquera Kanto, réutiliser `scripts/extract-decomp.mjs` avec les arguments `pokerougefeu` / `fr` (il est déjà paramétré pour ça, voir `npm run extract:fr`). Puis `render-metatile-atlas.mjs` et `render-layouts.mjs` avec les paires Kanto.

## Session 5 — NPCs réels, dialogues, textbox authentique

- Extracteur `extract-object-events.mjs` : parse les 4 headers C du décomp
  pour mapper `graphics_id` → PNG + dimensions (168/239 résolus).
- NPC loader runtime : parse `map.json.object_events`, résout sprite, spawn.
  **Flags FLAG_HIDE_* : unset par défaut = NPC visible** (l'inverse de ce que
  j'avais fait d'abord).
- Signs depuis `bg_events[type=sign]` : cliquables au W, même traitement que
  les NPCs.
- Extracteur `extract-scripts.mjs` : parse tous les `scripts.inc` du décomp,
  sort 468 maps × ~15 scripts moyens + ~11 texts chacun. Total 7042 scripts,
  5145 textes en JSON.
- Runner de scripts (`src/engine/script-runner.ts`) : implémente lock, release,
  faceplayer, msgbox, goto, call, goto_if_set/unset/eq/ne, call_if_*.
  Etat initial : tous les flags unset, toutes les vars = 0. Les branches
  conditionnelles sont résolues en conséquence (cohérent pour dialogues de
  début de jeu).
- Textbox authentique : `DialogueBox` utilise `text_window/1.png` en 9-slice.
  Multi-pages via `\p`, sauts de ligne via `\n`/`\l`.

**À reprendre la prochaine fois :**
- Petit souci signalé par user sur le dialogue (non précisé, à inspecter).
- Font Emerald authentique : PNG + charmap.json déjà extraits sous
  `public/decomp/em/ui/`, rendu char-par-char à écrire. Pour l'instant
  monospace CSS.
- Camions manquants à Littleroot : NPC `OBJ_EVENT_GFX_TRUCK` résolu dans
  extractor mais à vérifier qu'il passe bien. Event spécial lié au sexe
  du joueur, peut nécessiter de gérer un flag spécifique.
- Système de flags/vars runtime (pour progression au-delà du début de jeu).

## Session 12 — Save + nouvelle partie

- `src/engine/game-state.ts` : flags/vars/save/load/initNewGame, persisté en
  localStorage. Reproduit `InsideOfTruck_EventScript_SetIntroFlagsMale/Female`
  pour le spawn correct (3,10 male / 12,10 female).
- NamingScene → `gameState.initNewGame()` puis spawn aux coords authentiques.
- MainMenu : CONTINUER lit `gameState.map` pour reprendre la dernière position.
- MenuOverlay : SAUVER déclenche `gameState.save()` avec confirmation dialogue.
- OverworldScene track `gameState.map` à chaque déplacement.

### TODO : intro camion authentique

L'intro dans le vrai jeu :
1. Player apparaît dans `MAP_INSIDE_OF_TRUCK` (carte 8×8)
2. Map active `setstepcallback STEP_CB_TRUCK` (oscillation visuelle "le camion roule")
3. Player marche vers la porte (sortie est)
4. Warp vers Littleroot avec `EventScript_TruckArrive` qui place le camion dehors,
   puis Mom marche à la rencontre via `LittlerootTown_OnTransition`

Notre version actuelle skip la map InsideOfTruck et spawn direct dans
Littleroot. Pour l'authenticité :
- [ ] Ajouter `InsideOfTruckScene` avec `STEP_CB_TRUCK` (oscillation y du player)
- [ ] Implémenter le warp de sortie qui charge LittlerootTown + script
- [ ] Parser et exécuter `LittlerootTown_OnTransition` au spawn (Mom moves,
  truck visual, etc.)

## Règle dure (session 11) : AUCUN PRÉ-RENDU

Tous les rendus graphiques (metatiles, title screen, textboxes, etc.) doivent
se faire au **runtime** à partir des fichiers bruts du décomp (PNG + .bin +
.pal). **Pas de script `render-XXX.mjs` qui produit un PNG composé**.

Scripts à refactorer dans cette direction :
- [ ] `render-metatile-atlas.mjs` → compo live dans `tilemap-loader.ts`
- [x] `render-layouts.mjs` → déjà abandonné, à supprimer
- [ ] `render-title.mjs` → à remplacer par compo runtime dans TitleScene
- [ ] `render-textbox.mjs` → à remplacer par compo runtime dans DialogueBox

Les scripts d'extraction PURE (copie + parsing text/strings/flags) restent OK.

## Session 11 — TitleScene + MainMenu authentiques

- `extract-strings.mjs` → `strings.json` : **5658 textes FR** parsés depuis
  `src/strings.c` et consorts. `gText_MainMenuNewGame` = "NOUVELLE PARTIE" etc.
- `extract-flags-vars.mjs` → `flags-vars.json` : 775 flags, 185 vars.
- `render-title.mjs` : compose `rayquaza.png + .bin + .pal` (4bpp, palette 16) →
  `rayquaza-rendered.png` + `clouds-rendered.png`. Nickel.
- `TitleScene` + `MainMenuScene` (entry = TitleScene).
- Cri Rayquaza (`cries/rayquaza.wav`) joué sur le press start.

### Dette technique : logo Pokémon 8bpp

Le `pokemon_logo.png` est un tileset **8bpp** avec tilemap dont les IDs vont
jusqu'à 798 alors que l'atlas n'a que 256 tiles. Mes tentatives (modulo,
division par 2, etc.) n'ont pas décodé proprement. Le système GBA 8bpp avec
split char block n'est pas encore implémenté dans `render-title.mjs`.

**Solution à explorer** : lire `src/title_screen.c` pour comprendre comment
le bg 8bpp est chargé (`BG_CHAR_ADDR(0)` et wrap de tile IDs au-delà du char
block de 16 KB). Possiblement le fichier `.8bpp.lz` original contient plus de
256 tiles une fois décompressé, et la conversion PNG perd de l'info. Ou le
bg 8bpp déborde sur le char block voisin (non chargé ici, donc le jeu
original affichait peut-être des tuiles "vides" aussi).

Workaround actuel : display du PNG atlas tel quel en placeholder.

### Idle / intro Game Freak

Assets présents (`graphics/intro/scene_1,2,3/`) — Flygon, Latios, bicycle,
brendan, clouds, sparkle, drops_logo. `src/intro.c` à parser pour la
cinématique complète. Pas fait ce session.

## Session 10 — PIVOT archi : tout depuis le décomp

**Décision** : arrêter d'écrire du code "maison" qui duplique ce qui existe
dans le décomp. Le but devient : recréer Pokémon Émeraude sur navigateur,
avec @pkmn/sim comme seule exception (moteur de combat). Tout le reste doit
venir des fichiers du décomp.

Voir [`DECOMP_MAP.md`](./DECOMP_MAP.md) pour la carte complète des sources.

### Plan de boot à porter (ordre)

1. Intro Rayquaza → Title screen → Main menu
2. Birch speech + choix sexe
3. Naming screen (clavier virtuel)
4. New game init (flags/vars à 0)
5. Truck intro + spawn Littleroot via scripts

### Travaux de cette session

- Écriture de `DECOMP_MAP.md` (audit complet)
- Ajout `scripts/extract-flags-vars.mjs` → `flags-vars.json`
  (**775 flags + 185 vars** indexés)
- `extract-decomp.mjs` étendu : copie `graphics/interface/` +
  tous les assets de boot dans `public/decomp/em/boot/`
  (intro 126 KB, title_screen 32 KB, birch_speech 12 KB, naming_screen 27 KB)

### Dette immédiate avant la prochaine session

- Parser `src/title_screen.c` pour comprendre la logique (fade intro → press
  start clignotant → main menu)
- Parser `src/main_menu.c` pour CONTINUER / NOUVELLE PARTIE / OPTIONS
- Parser `src/birch_speech.c` + `src/naming_screen.c`
- Écrire `scripts/extract-boot-text.mjs` pour récupérer les chaînes FR de
  ces écrans depuis `src/data/text/`
- Créer les scènes Phaser `IntroScene`, `TitleScene`, `MainMenuScene`,
  `BirchSpeechScene`, `NamingScene` qui chargent ces assets extraits
- Tout nouveau code dans ces scènes : UNIQUEMENT de la traduction depuis C

## Session 4 — Fixes retours utilisateur

Retour direct sur la session 3 :
- "Tiles qui se superposent sur le joueur alors qu'ils ne le font pas dans
  le jeu d'origine" → parser `metatile_attributes.bin` pour respecter
  `METATILE_LAYER_TYPE_COVERED` (ponts/tunnels). Pour COVERED, les deux
  moitiés du metatile sont composées dans l'atlas LOWER (sous le joueur) et
  l'atlas UPPER est vide pour cette tile. Fix dans `render-metatile-atlas.mjs`.
- "La caméra doit rester centrée sur le joueur" → suppression du deadzone,
  `startFollow(player, true, 1, 1)` pour un verrou strict. Également : plus
  de `setBounds` sur la caméra pour voir la bordure hors-map.
- "Toutes les maps ont un tileset qui se répète out of bound" → lecture de
  `border.bin` (8 octets = 2×2 metatiles), composition d'un canvas 32×32
  depuis les atlases, utilisé comme texture d'un `Phaser.TileSprite`
  gigantesque à depth -1 qui couvre toute la zone visible hors-map.
- "Les animations de marche de Brice sont dans le mauvais ordre" → correction
  de la disposition des frames :
    - 0 : regarde en bas | 1 : regarde en haut | 2 : regarde à gauche (flip
      pour droite)
    - 3-4 : pas en bas #1 / #2 | 5-6 : pas en haut | 7-8 : pas à gauche
  Nouvelle logique : un appui = UN pas (pas#1 ou pas#2 alterné), puis retour
  auto à idle. Pas d'animation cyclique continue. `playSingleStep()` remplace
  `playWalk()` + `setIdleFrame()` séparés.

## Session 30 — Audits boxes + Sappy + Phase 1 extracteurs (2026-04-25)

### User stop : "tant que dialogue box pas impeccable, on reste là"
2 audits Agent Explore very thorough lancés en parallèle :

#### Audit boxes → `WINDOWS_BOXES_REFERENCE.md`
- 21 WindowTemplates catalogués (positions exactes pixel GBA)
- 5 palettes (text_pal1-4 + message_box)
- 20 frames PNG (text_window/1-20.png + message_box.png)
- Plan refacto : 2 extracteurs + module `WindowRenderer` générique avec compositing PNG indexé + palette remap au runtime
- Migration `dialogue-box.ts` + `menu.ts` pour utiliser `createWindow('sStandardTextBox')` au lieu de positions hardcodées

#### Audit Sappy → `SAPPY_MUSIC_REFERENCE.md`
- Architecture m4a complète : voicegroups (PSG + DirectSound), keysplits, samples PCM
- Bugs Tone.js : pulse ≠ square GBA, pas de reverb/vibrato, pas de voice stealing
- 2 stratégies : Quick wins MVP (~9h) ou Web Audio direct (~1-2 sessions)
- À attaquer après dialogue boxes

### Phase 1 — Extracteurs boxes ✅ DONE

Nouveaux extracteurs :
- `scripts/extract-window-templates.mjs` : parse `static const struct WindowTemplate` dans menu.c, menu_specialized.c, script_menu.c, naming_screen.c, start_menu.c, option_menu.c → `window-templates.json`. **6 templates extraits** (sStandardTextBox, sWindowTemplates_MailboxMenu, sMoveRelearnerWindowTemplates, etc.).
- `scripts/extract-palettes.mjs` : parse `.pal` JASC + `.gbapal` binaires (BGR 5-bit little-endian) dans graphics/text_window, graphics/interface, graphics/fonts → `palettes.json`. **Multiples palettes extraites** (text_pal1-4, blank, hof_pc_topbar, main_menu_bg/text, etc.).
- npm scripts ajoutés : `extract:window-templates`, `extract:palettes`. `extract:all-bulk` étendu.

### Phase 2 (à venir, prochaine session)
- Module `src/engine/window-renderer.ts` : compositing PNG indexé + palette runtime, cache textures, 9-slice paramétrable
- Migration `dialogue-box.ts` + `menu.ts`

### Bonus visuel
- Border tileset out-of-bound restauré (les adjacent maps couvrent là où elles existent, le pattern visible uniquement aux directions vraiment vides)

**TypeScript** : non touché cette session (seulement extracteurs Node).

## Session 29 — Bug racine bitmap-font alpha sampling (2026-04-25)

### Diagnostic
Bug visuel signalé : cursor ▶ rendu en gros bloc noir au lieu de triangle. Investigation :
- décomp `gText_SelectorArrow3[] = _("▶")` strings.c:1469
- charmap `'▶' = EF` (= 239 décimal) ✓ correct dans notre charmap.json
- glyph présent à cell (15, 14) du PNG `latin_normal.png` ✓ confirmé visuellement

### Vrai bug
`setupBitmapFont` lisait pixel(0,0) du PNG pour identifier la BG color à transparentiser. **MAIS** notre PNG `latin_normal.png` (et probablement tous les PNG indexés du décomp) a un TRNS chunk → pixel(0,0) RGB = (0,0,0,0) (alpha 0 transparent). Notre code transparentisait alors les **noirs** au lieu de la **BG bleu** opaque qui restait → tous les glyphes apparaissaient comme blocs 16×16 opaques avec leur BG bleu autour.

### Fix
Sample au **centre de la cell 0** (espace = pure BG color opaque) au lieu de pixel(0,0). La BG bleu est maintenant correctement détectée et transparentisée.

### Impacts (positifs)
- Cursor ▶ : vrai triangle au lieu de bloc plein
- Tous les glyphes du font ont maintenant leur largeur réelle (cropped au glyph)
- Texte des dialogues mieux espacé (variable-width enfin correct)
- Probablement résolu des micro-bugs visuels invisibles dans tout le rendering text depuis le début

### Confirmation runtime
User screenshots montrent :
- Menu OUI/NON avec triangle ▶ noir à gauche (parfait)
- Textbox dialogue pixel-perfect ("PROF.SEKO: Si tu entraînes ton POKéMON...") sur 2 lignes propres

**TypeScript** : clean.

## Session 28 — Résolution GBA native + MSGBOX_YESNO + lock softSwitch (2026-04-25)

### Bug critique : résolution non-GBA
User : "L'écran de jeu est PLUS GRAND que le jeu de base, du coup les coordonnées au pixel près du décomp ne marchent pas."

Notre canvas était 320×240 au lieu de la **GBA native 240×160**. Toutes les positions hardcoded du décomp (textbox x=16, y=120, etc.) sont valides **uniquement à 240×160**.

Fix `src/main.ts` :
- `MAP_W = 15, MAP_H = 10` (au lieu de 20, 15)
- `GAME_W = 240, GAME_H = 160` (GBA exact)
- `DEFAULT_ZOOM = 4` (au lieu de 3) → 960×640 affiché
- Expose `setGameZoom(z)` global pour boutons HTML

Fix `index.html` :
- Topbar refait : virer lien "éditeur de map" obsolete
- Boutons zoom ×2 / ×3 / ×4 / ×5 / ×6

### Bug critique : MSGBOX_YESNO ignoré
User signale Yes/No introuvable dans Birch's Lab (surnom du starter, "voir le rival ?"). Investigation décomp :
- Pattern utilisé : `msgbox <text>, MSGBOX_YESNO` (pas `yesnobox` isolé)
- Notre `msgbox` ignorait le style `MSGBOX_YESNO` → affichait juste le texte sans menu

Fix `script-runner.ts` :
- `MSGBOX_YESNO` lock + faceplayer + show text + **askYesNo()** + set `VAR_RESULT` (1=YES, 0=NO)
- Après le fix, tous les "Voulez-vous nicknamer ?", "Voir le rival ?", etc. fonctionnent.

### Bug "perso va dans les coins" (touche maintenue + traversée)
**Cause** : softSwitchToMap est async (await load NPC sprites). Pendant ce temps, si user maintient la touche, `update()` peut firer un nouveau tryMove avec un state transitoire (mapJson swap mais NPC pas spawn) → sprite peut tween vers position weird.

**Fix** : lock `dialogueOpen=true` en début de softSwitch, release dans finally après spawn NPCs. Empêche tout input pendant la transition critique.

**TypeScript** : clean.

## Session 27 — Refacto positions dialogue/menu selon spec décomp (2026-04-25)

Première phase du refacto dialogue/font/menu (cf. `DIALOGUE_FONT_MENU_REFERENCE.md`).

### `dialogue-box.ts`
- Position : x=16, y=120, w=216, h=32 (sStandardTextBox_WindowTemplates) au lieu des approximations
- Padding interne : 6px x, 2px y (au lieu de 12, 10)
- Down arrow : 4 frames y-offset {0, 1, 2, 1} au lieu de cycle de frames sprite, intervalle 133 ms (8 frames GBA)

### `OverworldScene` askYesNo
- Position EXACTE : x=168, y=72, w=40, h=32 (sYesNo_WindowTemplates)
- Cursor lineHeight 16 (font NORMAL maxHeight)

### askMultichoice
- Layout dynamique : width selon item le plus long, height = count × 16 + 16 padding
- Position bottom-right (au-dessus du dialogue)

### Reste à faire (refactor visuel complet, future session)
- Codes ctrl inline 0xFC + sub-code (color, shadow, highlight, font, pause)
- Glyph widths via `gFont<X>LatinGlyphWidths[]` (extract depuis fonts.c)
- Palette appliquée correctement (color 1=fond, 2=texte, 3=ombre depuis text_pal1.pal)
- 4 fonts (NORMAL/SMALL/NARROW/SHORT) avec switch via code ctrl
- `extract-list-menu-items.mjs` pour tables MULTI_X

**TypeScript** : clean.

## Session 26 — Vrai vrai seamless (shift on promote) (2026-04-25)

### Diagnostic du bug "1er pas seamless puis téléport"
v2 (session 25) : `promoteToCurrent` ne shiftait PAS les TilemapLayer pour préserver les positions visuelles. MAIS `tryMove` calculait les pixel cibles via `ny * TILE_SIZE + TILE_SIZE` qui suppose un offset (0, 0). Comme la new current avait un offset non-zéro (ex Route101 à -20 tiles), les calculs étaient faux → tween vers position absurde.

### Fix v3 (vrai seamless cette fois)
`promoteToCurrent` shift maintenant :
- Tous les TilemapLayer (current + adjacents) par `(-newCurrent.worldOffset) * TILE_SIZE`
- Tous les NPC sprites
- Le player sprite (passé en param)
- La camera scrollX/Y (passée en param) pour éviter flash 1 frame

Résultat : la new current map a toujours `worldOffset = (0, 0)`, donc tous les calculs pixel `(ny * TILE_SIZE + TILE_SIZE)` fonctionnent sans modification. Visuellement, comme tout est shifté ensemble (sprite + layers + camera), le viewport relatif ne change pas → user perçoit aucun saut.

C'est exactement le pattern décomp (`gBackupMapLayout` est toujours centré sur la current map, pas un coord système absolu monde).

### Aspects à confirmer
- Au 1er pas : cross détecté, tween from current pixel to adjacent pixel, softSwitch au onComplete → promote shift everything → camera follows sprite (instantané grâce au shift explicite)
- Au 2e pas : on est sur new current at offset (0, 0), tryMove utilise formula directe → tween correct

**TypeScript** : clean.

## Session 25 — Vrai seamless tween + 2 audits + bug "map qui se répète" (2026-04-25)

### Fix seamless v2 (vraiment seamless)
v1 (session 24) : softSwitch tentait AVANT le tween → sprite restait sur ancienne tile, math incorrecte → saut visuel.
v2 (cette session) : tween normal vers la pixel position de la new map (calculée via `mapInstance.worldOffset`), softSwitch silencieux au `onComplete`. Sprite glisse continûment d'1 tile à travers la frontière. Refactor `tryMove` :
- Si cible (nx, ny) hors current ET adjacent loaded → `crossing = {mapInstance, newTileX/Y, targetPxX/Y}`
- Test collision sur l'adjacent (pas current)
- Tween vers `targetPxX/Y` (pixel absolu de la new map)
- onComplete : `softSwitchToMap(...)` qui prend `newTileX/Y` direct, NO sprite reposition

### Bug "map qui se répète"
**Cause** : `borderTileSprite` de current (motif herbe/arbres répété 1280×960px autour de Bourg) couvre les zones où adjacent maps sont rendues. Comme Route 101 est aussi de l'herbe, le pattern semble être Route 101 répété.

**Fix MVP** : skip `borderTileSprite` si la map a au moins 1 connection. Les zones sans adjacent (ex. sud de Bourg-en-Vol) deviennent temporairement noires — TODO Vague 7.x : 4 borderTileSprites directionnels (un par direction sans connection).

### Audit dialogue/font/menu décomp ✅
Persisté dans `DIALOGUE_FONT_MENU_REFERENCE.md`. Highlights :
- Textbox dialogue : x=16, y=120, w=216, h=32 px (au lieu de nos approximations)
- Yesnobox : x=168, y=72, w=40, h=32 px ; cursor `▶` glyph du font
- 4 fonts (NORMAL/SMALL/NARROW/SHORT) variable-width ; `gFont<X>LatinGlyphWidths[]` table par caractère
- Codes ctrl 0xFC + sub-code (0x01-0x07) pour color/highlight/shadow/font/pause inline
- Arrow indicator : 4 frames `{0,1,2,1}` Y-offset, intervalle 8 frames (~133ms)
- Multichoice : tables `MULTI_X` dans `data/script_menu.h` à extraire

### Audit hardcode TS ✅
3 CRITIQUES + 4 MOYENS identifiés :
- **PLAYER_TEAM** mock dans `trainers.ts` (à supprimer, BattleScene utilise déjà `gameState.party`)
- **POKEBLOCK** hardcoded → ✅ fixé (lookup JSON `T.PokeBlock` avec fallback)
- **SPECIALS table incomplète** : `BirchGiveStarterPokemon` etc. peut bloquer scenarios. À ajouter quand identifié.
- **Labels menu** ('POKéDEX'/'POKéMON'/'SAC') → utiliser strings.json

Les autres signalés (MB_*, CONST_VALUES, durations ms) jugés OK (pure logique TS / enums sourcés).

### Debug helper ajouté
- `cheat.world()` expose le state du WorldRenderer : current map + loaded adjacents avec leurs offsets

**TypeScript** : clean.

## Session 24 — Seamless rendering + yesnobox/multichoice (2026-04-25)

### Vague 6 (seamless rendering) implémentée d'un coup

**Approche :** rendu en parallèle des maps adjacentes + soft-switch silencieux à la traversée. Cf. `SEAMLESS_RENDERING_REFERENCE.md`.

#### Changements
- **`tilemap-loader.buildTilemap`** : accepte maintenant `keys: TilemapKeys` opt (prefix de cache keys + offset pixels). Permet de rendre plusieurs maps simultanément sans collision de keys.
- **Nouveau module `src/engine/world-renderer.ts`** : `WorldRenderer` class. API : `preloadMapAssets`, `buildMapInstance`, `getTileAt`, `detectTraversal`, `promoteToCurrent`, `remapTile`, `unload`. Singleton de maps loaded avec leurs `worldOffsetX/Y` en tiles.
- **`OverworldScene`** :
  - Init `WorldRenderer` dans `afterMapLoad` + duplique les cache keys de current map (préfixés par mapName) pour qu'ils soient retrouvables par WorldRenderer
  - `loadAdjacentsAsync()` : pour chaque connection, preload les assets + build TilemapLayer aux offsets adaptés. Lancé en background après afterNpcsLoad.
  - `softSwitchToMap()` : appelé quand `tryConnectionWarp` détecte que l'adjacent est déjà loaded. Promote silencieux + remap playerTile via `world.remapTile()` + destroy/respawn NPCs + run map_scripts ON_TRANSITION. **NO scene.restart, NO fade, NO saut visuel** (sprite et tilemap layers restent à pixel position absolue, seules les références logiques changent).
  - Fallback : si l'adjacent n'est pas encore loaded (race condition au tout début), tryConnectionWarp retombe sur scene.restart classique.

#### Effet attendu en runtime
- **Bourg-en-Vol** : au load, Route 101 chargée en background et rendue au nord. Visible si tu t'approches du bord supérieur.
- **Traversée nord** : ZÉRO transition. Le sprite continue son mouvement, Route 101 est déjà là.
- À l'arrivée : ON_TRANSITION script fire, NPCs Route 101 spawn, les nouveaux adjacents (Route 102, 103, Oldale) commencent leur preload en background.

#### Limites Vague 6 (acceptables MVP, à raffiner Vague 6.4+)
- NPCs des adjacents pas spawnés visuellement avant traversée (juste tiles). Spawn au softSwitch.
- Pre-load serial (un adjacent après l'autre). Pourrait être en parallel.
- Cache keys dupliquées si plusieurs maps même tileset pair (gaspillage RAM mineur).

### Yesnobox + multichoice opcodes
- `script-runner` : opcodes `yesnobox` (await `ctx.askYesNo` → VAR_RESULT 1=OUI/0=NON) et `multichoice/multichoicedefault/multichoicegrid` (no-op pour MVP, défaut 0)
- `OverworldScene.buildScriptContext` : `askYesNo` et `askMultichoice` via `createMenu` du `engine/menu.ts` (existing component bitmap-font + textbox 9-slice)
- TODO : extract `data/list_menu_items.h` pour résoudre les MULTI_X de multichoice → labels

**TypeScript** : clean.

## Session 23 — Audit seamless rendering + retrait fade transitionnel (2026-04-25)

### Retour user
"Les maps marchent, mais il ne devrait pas y avoir de warp ! Elles sont interconnectées, lis bien la décompilation."

### Diagnostic
Le décomp utilise un **monde continu** (`gBackupMapLayout` = un seul gros buffer 2D contenant current + bordures de 7 tiles des 4 connections). À la traversée, `LoadMapFromCameraTransition` SWITCH `gMapHeader` mais **NE STOPPE PAS le mouvement du joueur**. Pas de fade, pas de restart.

Notre version actuelle fait `scene.restart()` avec fade — pas fidèle.

### Patches immédiats
- **Retiré le fade visuel** de `tryConnectionWarp` (était : `cameras.fadeOut(150) + delayedCall(180)`. Maintenant : restart immédiat sans fade noir).
- Le `scene.restart()` reste pour cette session = un léger flicker à la traversée mais plus de noir.

### Spec complète persistée
- Nouveau doc `SEAMLESS_RENDERING_REFERENCE.md` — extrait du décomp via Agent Explore very thorough.
- Couvre : `MapConnection` struct, layout du buffer global, `CameraMove`/`LoadMapFromCameraTransition` flow, NPC spawn/despawn, plan refactor TS multi-tilemap.

### Plan d'attaque proposé (Vague 6 réorganisée)
- **Vague 6.1** — WorldRenderer skeleton (abstraction, pas encore visible) — M
- **Vague 6.2** — Multi-tilemap render (voir les maps adjacentes aux bords) — L
- **Vague 6.3** — Traversée seamless (zéro restart) — L

**Total : 2-3 sessions dédiées.**

**TypeScript** : clean.

## Session 22 — Map connections (jointure entre maps) (2026-04-25)

### Diagnostic user
- `gameState.getVar('VAR_LITTLEROOT_RIVAL_STATE')` passe bien 2 → 3 = script s'exécute correctement
- "Loop 4-5x" était bien un effet visuel (sprite glisse), réglé par le fix anim de session 21
- **Vrai bloqueur signalé** : pas les events, mais la **jointure de map** (connections aux bordures). Toutes les maps existent mais on ne peut pas traverser la frontière.

### Implémentation map connections
Le décomp utilise `data/maps/<X>/connections.inc` (déjà extrait dans nos `map.json` sous `connections: [{map, offset, direction}]`).

- `OverworldScene.init` : nouveau champ `fromConnection?: {direction, sourceX, sourceY, offset}` passé via `scene.restart`
- Nouvelle méthode `tryConnectionWarp(nx, ny)` : si la cible est out-of-bounds ET il y a une connection dans cette direction, fade + restart vers la map adjacente
- Appelée dans `tryMove` AVANT le check de collision (sans cette priorité, le mouvement serait bloqué par la limite de map)
- `afterMapLoad` : si `fromConnection` set, calcule spawn coords selon direction :
  - 'up' : startY = h-1 (arrive en bas), startX = sourceX - offset
  - 'down' : startY = 0 (arrive en haut)
  - 'left' : startX = w-1 (arrive à droite)
  - 'right' : startX = 0 (arrive à gauche)
  - Clamp défensif aux limites de la nouvelle map

### Effet attendu
- Marcher au nord de Bourg-en-Vol → arrive à Route 101
- Route 101 → nord = OldaleTown, sud = Bourg-en-Vol, est = Route 103, ouest = Route 102
- Toutes les maps interconnectées sont accessibles (sous réserve qu'aucun NPC scripted ne bloque la sortie ; sinon `cheat.skipIntro()` débloque les vars)

**TypeScript** : clean.

## Session 21 — Polish post-Vague 3 : debug helpers + anim marche scriptée (2026-04-25)

### Retours user
- ✅ Pas de crash après Vagues 1+2+3
- ✅ Party = 1 Pokémon visible (Treecko lv5 debug)
- ✅ Plus de trous dans dialogues
- ⚠️ Bloqué à Bourg-en-Vol (logique : pas de starter Birch encore, sortie scénarisée bloque)
- ⚠️ Pas de dresseur dispo (idem, faut l'event Birch)
- ⚠️ "Loop 4-5x" rival = effet visuel : sprite glissait sans anim de pas pendant les `applymovement` scriptés

### Fix : anim de marche pendant `applymovement` scripté
- `runMovement` dans `engine/movement.ts` : ajout `playSingleStep(sprite, tex, facing, dur)` en parallèle du tween. Maintenant les NPCs jouent leurs frames de marche (step1/idle alternance) au lieu de glisser.
- Effet attendu : la rencontre rival devrait avoir des animations propres maintenant (et pas un effet "loop" visuel).

### Nouveau : helpers debug accessible console (F12)
Exposés sur `window` au boot :
- `gameState` — accéder à toute la save state (`gameState.party`, `gameState.flags`, etc.)
- `cheat.skipIntro()` — set les vars/flags clés (`VAR_LITTLEROOT_INTRO_STATE=6`, `VAR_BIRCH_LAB_STATE=4`, etc.) pour débloquer la sortie de Littleroot sans avoir à passer par Birch
- `cheat.giveMon('SPECIES_X', level)` — ajoute un Pokémon à la party
- `cheat.heal()` — heal complet
- `cheat.resetSave()` — reset complet (nécessite reload page)

### Workflow debug recommandé
1. F12 → console
2. `gameState.party` → vérifier que Treecko est là
3. `cheat.skipIntro()` puis sortir/rentrer maison → Bourg-en-Vol débloqué
4. Aller sur Route 101 → trouver dresseur → tester Vague 3 combat

### Note "loop rival" deux occurrences
Si le user voit encore un comportement bizarre après le fix `playSingleStep`, possible que :
- Le script reéxécute `MeetMay` 2x parce que VAR_LITTLEROOT_RIVAL_STATE n'a pas été persistant entre 2 entrées dans la pièce (à vérifier avec `gameState.getVar('VAR_LITTLEROOT_RIVAL_STATE')` avant et après)
- OU le NPC est ajouté 2x (vérifier console : combien de sprites RIVALS_HOUSE_2F_RIVAL ?)

**TypeScript** : clean.

## Session 20 — Vagues 1 + 2 + 3 : extraction bulk + buffers + combat MVP (2026-04-25)

User a stoppé l'event-par-event et demandé d'attaquer en **vagues transversales**. 3 vagues livrées en une session :

### Vague 1 — 7 extracteurs en bulk (1 prévu de plus)
| Script | Output | Compte |
|---|---|---|
| extract-trainer-parties | trainer-parties.json | 855 trainers, 854 parties |
| extract-wild-encounters | wild-encounters.json | 116 maps |
| extract-items | items.json | 377 items |
| extract-map-names-fr | map-names-fr.json | 213 zones |
| extract-metatile-labels | metatile-labels.json | 692 labels |
| extract-text-tables (bonus) | text-tables.json | 412 species + 355 moves + 66 classes + 25 natures + 310/355/78 descriptions |
| extract-constants (Vague 3 prep) | constants.json | 413 species + 356 moves + 384 items + 78 abilities + 25 natures |

### Vague 2 — 13 opcodes buffer
- Module `data-tables.ts` : singleton avec loaders/getters typés
- Wirage `OverworldScene.preload`/`afterMapLoad` : load + apply 6 JSONs
- `bufferspeciesname/movename/itemname/trainerclassname/trainername/numberstring/string/itemnameplural` ✅
- Variants `vbufferstring/vbuffermessage` ✅
- Fallbacks : `bufferpartymonnick/leadmonspeciesname` → playerName (Vague 3.5), `bufferstdstring/decoration/box/contest` → vide

### Vague 3 — Combat MVP
- Module `pokemon.ts` : `PokemonInstance` struct, `createPokemonInstance()` factory (calc HP Gen 3 + moves auto via @pkmn/dex)
- `gameState.party: PokemonInstance[]` + helpers `addToParty/healAllParty/lead`
- `new-game-init` : donne Treecko lv5 debug
- 9 opcodes battle (`trainerbattle`/`dotrainerbattle`/`gotopostbattle`/`gotobeaten`/`setwildbattle`/`dowildbattle`/`checktrainerflag`/`settrainerflag`/`cleartrainerflag`)
- Specials : `HealPlayerParty` (vrai heal), `SavePlayerParty`, `LoadPlayerParty`
- `BattleScene` refactor : accepte trainerId ou wildSpecies, build teams via décomp + @pkmn/dex, callback onResult
- ScriptContext étendu : `runTrainerBattle/runWildBattle`

### Effets visibles en runtime
- Noms de zones FR corrects (Oldale = ROSYERES)
- Énorme amélioration silencieuse des dialogues NPCs (tous les `{STR_VAR_N}` species/move/item/trainer remplis)
- Premier Pokémon dans la party au new game (Treecko lv5 debug)
- Combats dresseurs lançables via opcode `trainerbattle TRAINER_X` (RandomAI des deux côtés pour MVP)
- Centre Pokémon fonctionne (`HealPlayerParty` heal vraiment)

### Nouveau npm command
- `npm run extract:all-bulk` chaîne les 7 extracteurs Vague 1+3

### TODO important Vague 3.5
- Input joueur en combat
- Sync currentHp post-combat vers gameState.party
- Wild encounters via grass step
- Bug bypass mère (toujours en dette)

**TypeScript** : clean tout du long.

## Session 19 — Tick loop ON_FRAME + fix bypass + audits opcodes/tick (2026-04-25)

### Vague 1 — 6 extracteurs en bulk

| Script | Output | Compte |
|---|---|---|
| `extract-trainer-parties.mjs` | `trainer-parties.json` | 855 trainers, 854 parties |
| `extract-wild-encounters.mjs` | `wild-encounters.json` | 116 maps, 4 rate tables |
| `extract-items.mjs` | `items.json` | 377 items (FR + price + pocket) |
| `extract-map-names-fr.mjs` | `map-names-fr.json` | 213 zones |
| `extract-metatile-labels.mjs` | `metatile-labels.json` | 692 labels |
| `extract-text-tables.mjs` (bonus) | `text-tables.json` | 412 species + 355 moves + 66 classes + 25 natures + 310 desc items + 355 desc moves + 78 desc abilities |

Tous tournent du premier coup. 6 npm scripts ajoutés + alias `extract:all-bulk`.

### Vague 2 — 13 opcodes buffer + module data-tables singleton

- Nouveau module `src/engine/data-tables.ts` : singleton avec loaders/getters typés pour les 6 tables.
- Wirage `OverworldScene.preload` (load 5 JSON) + `afterMapLoad` (call 5 loaders).
- 13 opcodes buffer wirés dans `script-runner.ts` :
  - `bufferspeciesname/movename/itemname/trainerclassname/trainername/numberstring/string` ✅ marche avec data réelle
  - `bufferitemnameplural` (avec pluriel `+ "s"`)
  - `vbufferstring/vbuffermessage` (variantes relatives)
  - `bufferpartymonnick/leadmonspeciesname` → fallback playerName (Vague 3 quand party struct dispo)
  - `bufferstdstring/decorationname/boxname/contestname` → vide (pas de tables extraites)

### Effet visible attendu pour le user

- Noms de zones corrigés : Oldale → **ROSYERES** (pas plus le hardcode FR différent)
- **Plein de dialogues NPCs maintenant complets** : tous les `{STR_VAR_N}` qui font référence à des Pokémon, items, moves, dresseurs sont maintenant remplis avec leur vrai nom FR. Énorme amélioration silencieuse.

### Reste à wirer (Vagues suivantes)
- `trainer-parties.json` → opcode `trainerbattle` (Vague 3)
- `wild-encounters.json` → grass step trigger (Vague 3)
- `items.json` → opcodes `additem/checkitem/etc.` (Vague 4)
- `metatile-labels.json` → résolution visuelle de `setmetatile` (Vague 5/6)

**TypeScript** : clean. **Bug bypass mère** : toujours en dette.

## Session 19 — Tick loop ON_FRAME + fix bypass + audits opcodes/tick (2026-04-25)

User a demandé d'arrêter de patcher event-par-event et d'attaquer par **vagues transversales** (cf. `BULK_AUTOMATION.md`). Vague 1 = 5 extracteurs en bulk.

### 5 nouveaux scripts d'extraction (✅ tous fonctionnent)

| Script | Output | Compte |
|---|---|---|
| `extract-trainer-parties.mjs` | `trainer-parties.json` | 855 trainers, 854 parties |
| `extract-wild-encounters.mjs` | `wild-encounters.json` | 116 maps |
| `extract-items.mjs` | `items.json` | 377 items |
| `extract-map-names-fr.mjs` | `map-names-fr.json` | 213 zones |
| `extract-metatile-labels.mjs` | `metatile-labels.json` | 692 labels |

### Wirings runtime
- `map-names-fr.json` : chargé dans `OverworldScene.preload`, consommé via `loadMapNamesFr()` dans `afterMapLoad`. Remplace le hardcode TS (qui contenait même des noms FR différents — ex. `OLDALE_TOWN: 'ROCHEFIN-SUR-MER'` au lieu du vrai `'ROSYERES'`).
- Les 4 autres JSON attendent leur consommation dans Vagues 3-5.

### Ajouts package.json
- 5 commands npm : `extract:trainer-parties`, `extract:wild-encounters`, `extract:items`, `extract:map-names-fr`, `extract:metatile-labels`
- 1 alias : `extract:all-bulk` qui chaîne tout

### Effet visible attendu pour le user
- Noms de zones corrigés (ex. arrivée à Oldale affiche **ROSYERES** au lieu de l'ancien hardcode faux)
- Pas d'autres effets directs avant Vagues 2/3/4/5 (qui consomment trainer-parties / items / wild-encounters / metatile-labels)

**TypeScript** : clean. **Bug bypass mère** : laissé en dette technique, on y revient plus tard avec un œil neuf.

## Session 19 — Tick loop ON_FRAME + fix bypass + audits opcodes/tick (2026-04-25)

### Audits massifs persistés
- `OPCODES_REFERENCE.md` : table exhaustive des 227 opcodes du décomp + top 50 specials par fréquence d'usage. Source : `asm/macros/event.inc` + `src/scrcmd.c` + `data/specials.inc`.
- `TICK_LOOP_REFERENCE.md` : spec complète de `field_control_avatar.c:ProcessPlayerFieldInput` — ordre des checks à chaque frame, phases d'input, map scripts timing, re-entry guards.
- `BULK_AUTOMATION.md` : nouveau plan en 8 vagues transversales (extraction → buffers → battle → items → UI → polish → équipe → contenu). Stratégie validée par user : faire tout d'un coup par vague au lieu d'event-par-event.

### Bug bypass mère — 3 itérations de fix
- v1 : pré-lock dans `afterNpcsLoad` → trop tard, mapReady déjà true
- v2 : pré-lock dans `afterMapLoad` avant mapReady → user pouvait encore bypasser car ON_FRAME pas re-checké à chaque frame
- v3 : implémenté `tickOnFrameTable()` appelé dans `update()` à chaque tick (fidèle à `TryRunOnFrameMapScript()` dans `field_control_avatar.c:150`) AVEC pré-lock sync `dialogueOpen=true` → trop agressif, lock à chaque frame même sans match → user bloqué en permanence (60Hz lock vs inputs)
- **v4 (final)** : nouvelle fonction sync `findOnFrameMatch()` qui retourne le scriptName ou null SANS side-effect. `tickOnFrameTable` n'appelle `runScript` (et ne lock) que si match. Pas de match = pas de lock = user libre.

### Bug horloge réglable infinie — fixé sessions précédentes
- `goto_if_set` / `call_if_set` checkent maintenant les flags réellement
- `Special_ViewWallClock` implémenté → affiche `new Date()` dans msgbox (skip le UI graphique du décomp, on n'a pas de vrai RTC)
- ✅ Confirmé OK en runtime

### Refactor signature SPECIALS
- Type changé : `(ctx: ScriptContext) => void | Promise<void>` (était `() => void`)
- Permet aux specials d'interagir avec la scène (msgbox, fadeScreen, etc.)
- Wirage : `if (op === 'special') { const fn = SPECIALS[name]; if (fn) await fn(ctx); }`

**TypeScript** : clean.

## Session 18 — Fix bypass mère + horloge réglable infinie (2026-04-25)

### Bug "horloge réglable autant de fois que voulu"
- **Root cause** : `goto_if_set` / `call_if_set` étaient en NO-OP dans le script-runner (legacy "tous flags unset" du début du projet). Donc le check `goto_if_set FLAG_SET_WALL_CLOCK, EventScript_CheckWallClock` (`players_house.inc:56`) ne sautait jamais → l'user retombait toujours sur le `SetWallClock` UI au lieu du `CheckWallClock` (juste afficher l'heure).
- **Fix** : `goto_if_set` / `call_if_set` / `goto_if_unset` / `call_if_unset` checkent maintenant `gameState.hasFlag()`. Comportement fidèle au décomp.
- **Side effect bénéfique** : énormément de scripts à branches conditionnelles vont maintenant fonctionner correctement (NPCs qui parlent différemment selon les flags de progression, item events, etc.).

### Bug "bypass mère"
- **Root cause** : `mapReady=true` set ligne 207 d'`afterMapLoad`. Le pré-lock `dialogueOpen=true` était dans `afterNpcsLoad` qui s'exécute *après* le NPCs load. Entre les deux, l'user pouvait input.
- **Fix** : `dialogueOpen=true` set juste avant `mapReady=true` dans `afterMapLoad`. Library par le `finally` de `afterNpcsLoad` après que tous les map scripts aient tourné.

### Note sur l'horloge (bug B initial)
Le user a raison : on ne peut pas émuler la pile RTC GBA. Mais en fait, **on n'en a même pas besoin** : le wallclock UI du décomp (`special StartWallClock` / `CB2_StartWallClock`) sert juste à set l'offset de l'horloge interne. Notre `gettime` opcode lit déjà directement `new Date()` (heure du PC). Il manquait juste de faire respecter `FLAG_SET_WALL_CLOCK` pour que le script ne re-déclenche pas le UI à chaque consultation.

Maintenant que le flag est respecté :
- 1ère fois : msgbox "horloge arrêtée" → `special StartWallClock` (no-op chez nous, skip le UI) → `setflag FLAG_SET_WALL_CLOCK` + setvar INTRO_STATE=6 + cinematic Mom
- Visites suivantes : `goto_if_set FLAG_SET_WALL_CLOCK` saute → CheckWallClock → affiche l'heure du PC via `gettime`

**TypeScript** : clean.

## Session 17 — Refactor warps fidèle au décomp + fix special wiring (2026-04-25)

### Bug confirmé fixé : placeholder "fils/fille"
- **Cause root** : la table `SPECIALS` était définie mais le switch laissait `op === 'special'` en no-op (j'avais oublié de wirer après l'ajout). Fix : routing `special <FuncName>` → `SPECIALS[name]?()`.
- **Confirmé en runtime** : "Notre fils/fille a le même âge que toi" s'affiche maintenant correctement.

### Bug "tapis qui TP au step" — refactor warps fidèle au décomp

**Diagnostic** : le "tapis de sortie" n'est PAS un metatile spécial. C'est un `MB_SOUTH_ARROW_WARP` (0x65). Le décomp (`field_control_avatar.c:TryArrowWarp`) le déclenche SEULEMENT si `heldDirection == arrow direction`. Notre code traitait toutes les arrow warps comme `isAlwaysInstant` → step-warp incorrect.

**Patches** :
- `tilemap-loader.ts` : ajouté MB constants manquants (BATTLE_PYRAMID_WARP, MOSSDEEP_GYM_WARP, MT_PYRE_HOLE, LAVARIDGE_GYM_B1F_WARP, CRACKED_FLOOR_HOLE, WATER_SOUTH_ARROW_WARP, DEEP_SOUTH_WARP). Ajouté helpers : `isAnimatedDoor`, `isInstantStepWarp`, `isArrowWarp`, `getArrowWarpDirection`.
- `OverworldScene.tryMove` : nouveau check "ARROW WARP sur tile courante + push direction de l'arrow → triggerWarp" (avant le check de collision). Permet de sortir d'un tapis MB_SOUTH_ARROW_WARP en pushant DOWN alors qu'on stand dessus.
- `OverworldScene.postMoveCheckStairsOrArrow` : refactor complet en 4 cas distincts fidèles au décomp :
  1. Instant step warp (ladder, escalator, non-animated door, special) → warp immédiat
  2. Door animated atteint en UP → warp (escalier-style)
  3. Arrow warp → warp UNIQUEMENT si `heldDir == arrow direction`
  4. MB_NORMAL + warp_event présent → warp instant (fallback truck)

**Effet attendu** : on peut maintenant marcher sur le tapis de sortie de la maison sans warp instantané. Faut push DOWN une 2e fois sur la tile pour sortir.

**Reliquat** : sprite flèche visuel au-dessus du joueur quand sur arrow warp (cosmétique, cf. `HideShowWarpArrow` dans field_player_avatar.c). Pas critique gameplay.

**TypeScript** : clean.

## Session 16 — Fix STR_VAR + script pre-lock + setmetatile collision (2026-04-25)

Suite aux retours du 2e test runtime.

### Bug 1 — Placeholder vide "Notre __ a le même âge que toi"
- **Cause** : le décomp utilise `{STR_VAR_1}` qui est rempli par `special GetRivalSonDaughterString` (set "fils" ou "fille" selon genre du rival). Notre runtime stripait `{STR_VAR_N}` et ignorait `special`.
- **Fix** : nouveau module `src/engine/string-buffers.ts` (singleton STR_VAR_1..4). `dialogue-box.substitutePlaceholders` résout `{STR_VAR_N}` via `getStringVar(N)`. Table `SPECIALS` dans `script-runner.ts` avec premiers handlers : `GetRivalSonDaughterString`, `HealPlayerParty` (no-op A.1), `DrawWholeMapView` (no-op).

### Bug 2 — User peut bouger pendant les map scripts (sortir avant fin du script "monte mettre l'horloge")
- **Cause** : `mapReady=true` set juste après `setupInput`, ce qui permet à `update()` de faire `tryMove`. Mais les map scripts (ON_TRANSITION/ON_RESUME/ON_FRAME) sont lancés en async — il y a un délai pendant lequel l'user peut s'incruster avant le `lockall` du script.
- **Fix** : pré-lock dans `afterNpcsLoad` — `dialogueOpen = true` AVANT le `void IIFE` qui exécute les map scripts, libéré dans `finally`. Le script lui-même fait son `lockall`/`releaseall` normalement.

### Bug 3 — Collisions des `setmetatile IMPASSABLE` ignorées
- **Cause** : notre `setMetatile` était no-op total. Le décomp utilise des `setmetatile X, Y, METATILE_*, TRUE` pour bloquer escaliers/portes en cours d'intro.
- **Fix** : `setMetatile` met à jour `tilemap.collisions[y][x]` selon le flag `IMPASSABLE`. Visuel toujours non rendu (labels METATILE_* pas résolus → reliquat `extract-metatile-labels.mjs`).

### Non-bug confirmé : "lumière + animation arrivée camion"
- L'intro Pokemon Émeraude originale a une cinématique cinéma : caméra suit le camion qui roule sur la route, s'arrête à Littleroot, puis zoom dans le camion. C'est implémenté dans `src/title_screen.c` + `src/intro.c` du décomp, pas dans la map InsideOfTruck.
- À porter plus tard dans le cadre d'une `IntroSequenceScene` (entre NamingScene et InsideOfTruckScene). Pas critique pour MVP gameplay.

**TypeScript** : clean.

## Session 15 — Fix retours runtime (2026-04-25)

User a testé l'intro et est arrivé jusqu'à la rencontre rival chez May/Brendan. Bugs signalés + fix :

| Bug | Cause | Fix |
|---|---|---|
| NPCs cachés (FLAG_HIDE) bloquent les tiles | `isBlocked` checkait position uniquement, pas visibility | `isBlocked` filtre `n.sprite.visible` |
| Sprite "running" figé après lâcher X sans bouger | Pas de listener sur keyup-X | `keyX.on('up', () => syncPlayerIdleTexture())` |
| Cinématique rival qui "loop" + sub-script MeetMay{North/South/West/East} jamais appelé | `VAR_FACING` jamais set par le runtime | `lockPlayer` set `gameState.setVar('VAR_FACING', dir)` selon `playerFacing` (DIR_SOUTH=1, NORTH=2, WEST=3, EAST=4 cf. global.h) |
| Porte qui ne s'ouvre pas à l'arrivée camion | `opendoor`/`closedoor`/`waitdooranim` étaient en no-op | Wirés vers `door-anim.playDoorOpen` via `ctx.playDoorAnim` ; `closedoor` reste no-op (pas de helper symétrique pour l'instant) |
| Constantes DIR_* non résolues | Pas dans `CONST_VALUES` | Ajoutées à `CONST_VALUES` du script-runner |

**Non-bugs (clarifications)** :
- "Oh, tu es A." — le décomp FR Émeraude a `gText_ExpandedPlaceholder_Kun = ""` (vide), donc `{PLAYER}{KUN}` = nom seul. Comportement correct vs source.
- "Donc tu es une fille" — phrase qui n'apparaît que dans `RivalsHouse_2F_Text_BrendanWhoAreYou` (route MALE/joueur Brendan, rival = Brendan-genre-confused). Pas applicable au scénario testé.

**Reliquats / dette signalée par user** :
- Cartons du truck encore immobiles (cosmétique)
- Sprites `OBJ_EVENT_GFX_MOVING_BOX` / `OBJ_EVENT_GFX_ITEM_BALL` → mauvais frameHeight dans object-event-graphics.json (parser heuristique de extract-object-events.mjs à reprendre)
- `closedoor` = no-op (pas d'anim de fermeture côté door-anim.ts)
- Warnings `setberrytree`, `savebgm`, `playbgm` opcodes non gérés (non-bloquants)

**TypeScript** : clean.

## Session 14 — Intro camion authentique (2026-04-25)

Implémentation A.2 du `ROADMAP.md`. Fix de la dette session 12.

**Diagnostic** : la version précédente exécutait `InsideOfTruck_EventScript_SetIntroFlags{Male,Female}` AVANT le spawn dans `runNewGameInit`, ce qui appelait `setdynamicwarp MAP_LITTLEROOT_TOWN, ...` direct → on skippait le truck. Le décomp lui exécute ces scripts via le **coord trigger** à (3, 1/2/3) du truck, après que le joueur ait marché vers la sortie.

**Patches** :
- `script-runner.ts` : `setStepCallback` + `setMetatile` ajoutés à `ScriptContext`. Opcodes `setstepcallback` (wiré) et `setmetatile` (no-op temporaire — labels METATILE_* pas encore résolus en numérique) implémentés.
- `npc-loader.ts` : type `coord_events` proprement (var/var_value/script).
- `new-game-init.ts` : ne lance plus `SetIntroFlags*` ; set manuellement `dynamicWarp = MAP_INSIDE_OF_TRUCK (1, 2)`. Le coord trigger fera le reste fidèlement au décomp.
- `OverworldScene.ts` :
  - Appelle `MAP_SCRIPT_ON_LOAD` après `buildTilemap` et `MAP_SCRIPT_ON_RESUME` après `ON_TRANSITION` (étend la couverture map_scripts de 2/7 à 4/7).
  - `triggerWarp` résout `MAP_DYNAMIC` via `gameState.dynamicWarp` (pour les warp tiles dynamiques du truck).
  - `postMoveCheckStairsOrArrow` accepte aussi les "plain step warps" indoor (warp tile sans behavior porte, ex. truck exit lights).
  - Nouvelle méthode `checkCoordEvent()` appelée dans `tryMove`'s `onComplete` — match par `(x, y, var, var_value)`, exécute le script via `runScript`. Re-trigger guard via `firedCoordEvents` Set (reset au scene restart).
  - `setStepCallback('STEP_CB_TRUCK')` lance un tween `setFollowOffset(0, ±1)` période ~2s = oscillation caméra "le camion roule" (cf. `GetTruckCameraBobbingY` dans `src/field_special_scene.c`).

**TypeScript** : `tsc --noEmit` clean.

**À tester en runtime** (E2E) :
1. New game → Birch → Naming → spawn dans truck 5×5
2. Marche vers est → caméra oscille
3. Step (3,2) → coord trigger fire `SetIntroFlags{Male|Female}` → `setdynamicwarp MAP_LITTLEROOT_TOWN, 3|12, 10`
4. Step (4,2) → warp tile → résout via dynamicWarp → fade → spawn Littleroot
5. À Littleroot, `MAP_SCRIPT_ON_FRAME_TABLE` détecte `VAR_LITTLEROOT_INTRO_STATE == 1|2` → cinématique `StepOffTruck*` (déjà géré par `runOnFrameTable`).

**Limites connues** :
- Lumière de la porte du truck (`InsideOfTruck_OnLoad` setmetatile) absente — labels METATILE_* non résolus, à corriger via un futur `extract-metatile-labels.mjs`.
- Cartons immobiles (le décomp les fait osciller en plus de la caméra) — pas critique pour MVP.
- Cinématique Littleroot Mom : dépend de tous les opcodes du `GoInsideWithMom` (opendoor, waitdooranim, addobject, applymovement chain, msgbox, warpsilent) — déjà implémentés ou en no-op safe.

## Session 13 — Audit profond (2026-04-25)

4 agents Explore lancés en parallèle :
- **Agent A** : audit code TS (27 fichiers, ~2000 LoC)
- **Agent B** : audit pipeline extraction (12 scripts .mjs + outputs `public/decomp/em/`)
- **Agent C** : audit décomp source (systèmes à porter)
- **Agent D** : couverture script-runner (58/220 opcodes, top usage à 100%)

**Livrables** :
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — carte complète des modules + assets + dette
- [`AUTOMATION_BACKLOG.md`](./AUTOMATION_BACKLOG.md) — ce qu'on doit extraire/refactor par ROI
- [`ROADMAP.md`](./ROADMAP.md) — plan d'attaque chronologique (Phase A = MVP 1ère heure jouable)

**Top findings** :
- `OverworldScene.ts` (584L) et `script-runner.ts` (switch 160L) à découper
- `game-state.party = unknown[]` → bloque tout le combat dresseur
- 65 MB de pré-rendu (`public/decomp/em/rendered/`) à virer (règle no-prerender)
- 5 nouveaux extracteurs à écrire : trainer-parties, wild-encounters, items, tileset-anims, fonts
- Top opcodes manquants : `trainerbattle_single` (910), `case`/`switch` (3852), `special HealPlayerParty` (92)

## Session 3 — Rendu live, Z-order, animations, français

### Pivot de rendu : metatile atlases au lieu de maps pré-rendues

La session 2 pré-rendait chaque map entière en PNG → marchait visuellement
mais **cassait tout ce qui est dynamique** (Z-order, animations de tiles,
portes). Pivot : on rend UN atlas de metatiles par paire de tilesets
(primary + secondary), et Phaser compose la map live à partir du `map.bin`.

`scripts/render-metatile-atlas.mjs` :
- Produit `metatiles-lower.png` (couche basse, opaque) et
  `metatiles-upper.png` (couche haute, color 0 = transparent) par paire.
- `info.json` à côté : dimensions de l'atlas, IDs primary/secondary.
- Lance `--all` → toutes les paires uniques + `layout-to-pair.json` index.

Runtime (`src/engine/tilemap-loader.ts`) :
- Lit `map.bin` binaire, décode chaque tile (metatile ID + collision).
- Construit deux `Phaser.Tilemaps.TilemapLayer` : lower à depth 0, upper à
  depth 20. Le joueur à depth 10 → **les toits, cimes d'arbres, surplombs
  cachent naturellement le sprite** quand on passe derrière.

### Animations de marche (`src/engine/character-anims.ts`)

Strips NPC pokeemerald = 144×32 = 9 frames de 16×32 :
- 0-2 : face bas (idle + 2 pas)
- 3-5 : face haut
- 6-8 : face côté (droite = flipX)

Anims Phaser `walk-down/walk-up/walk-side` avec cycle [step1, idle, step2, idle].
Déclenchées au `tryMove()`, stop + idle frame au onComplete du tween.

### Tout en français

- Noms de zones Hoenn : extraits depuis `region_map_sections.json` →
  `src/data/map-names-fr.ts`. Ex : Bourg-en-Vol, Clémenti-Ville, Poivressel.
- UI combat, dialogues, HUD : caractères français (é, à, ô).
- Label de zone en HUD utilise `getMapNameFr(MAPSEC_ID)`.

### Dette technique à ne pas oublier (levée session 3)

Le rendu pré-compilé des maps en PNG (session 2) était un shortcut qui casse
plusieurs features. On pivote vers du rendu live par metatile, MAIS certains
systèmes restent à faire plus tard :

- [ ] **Animations de tiles (fleurs, eau, cascades)** — assets extraits dans
  `public/decomp/em/tilesets/<kind>/<name>/anim/<group>/<frame>.png`. Logique
  pokemerald : `src/tileset_anims.c` callback `TilesetAnim_General` rotate les
  tiles VRAM 508-511 avec les frames de `anim/flower/`. Approche runtime :
  1. Parser `metatiles.bin` pour détecter les metatile IDs qui référencent
     tiles 508-511 (par tileset).
  2. Pour chaque map position avec un tel metatile, détecter les sub-tiles
     animés (0-3 dans lower, 0-3 dans upper).
  3. Spawner une `Phaser.Image` 8×8 à la position exacte de chaque sub-tile
     animé, cycler le `setTexture` à 250ms.
  4. Depth : au-dessus de la lower layer (1) ou au-dessus de l'upper (100001)
     selon le layer du sub-tile.
  Gros chantier ~150 LoC. Même logique réutilisable pour water, waterfall,
  et les anims spécifiques (Rustboro fountain, Dewford flag, etc.) —
  `src/tileset_anims.c` a tous les callbacks par tileset.
- [ ] **Portes animées** : 4 frames d'ouverture quand le joueur entre. Les
  sprites sont dans `graphics/maps/doors/` ou dans les tilesets selon le cas.
- [ ] **Transition de warp** : fade noir + téléport + fade, plutôt que snap
  instantané entre deux maps.
- [ ] **Réflexions/ombres** sur l'eau et les surfaces brillantes (sprite
  flippé verticalement sous le joueur).
- [ ] **Lumière/ambiance** : certaines maps ont un overlay sombre (grottes).
  Flag `weather` du map.json à interpréter.
- [ ] **Sprites d'herbe qui frémissent** quand on marche dedans (tout le
  monde a vécu ça). Animation courte déclenchée à l'entrée sur une tile
  d'herbe haute.

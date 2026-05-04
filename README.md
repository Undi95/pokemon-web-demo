# pokemon-web-demo

Émulation web 1:1 de Pokémon Émeraude (GBA) en TypeScript, à partir de la
**décompilation FR** [`qigast/pokeemeraude`](https://github.com/qigast/pokeemeraude)
et de [`@pkmn/sim`](https://github.com/pkmn/ps) pour le moteur de combat.

> **Directive du projet** : 1:1 décomp + foundations unifiées. Zéro hardcode, aucun
> pré-rendu PNG, aucune ROM. Tout passe par le boot loop décomp
> `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer`.

## Documents principaux

- [`ROADMAP.md`](./ROADMAP.md) — état actuel, bugs résiduels, phases planifiées
- [`DEV_LOG.md`](./DEV_LOG.md) — historique session par session
- [`AUDIT_1_1_DECOMP.md`](./AUDIT_1_1_DECOMP.md) — audit 1:1 décomp + foundations
- [`AUDIT_BOOT.md`](./AUDIT_BOOT.md) — audit boot flow Crédits → New Game

## Lancer

```bash
npm install
npm run dev
```

Vite ouvre `http://localhost:5173/`. La scène d'accueil `TestGbaScene` est un
sanity check de l'engine GBA — appuie sur une vraie touche GBA simulée
(W/X/Enter/etc.) pour passer à `GameScene` (= la « ROM » qui tourne).

**Touches GBA simulées (defaults)** :

- W = A | X = B | N = SELECT | B / Enter / Espace = START
- Flèches = D-Pad | Z = R | A = L | ESC = retour TestGbaScene

Customisables via le bouton **🎮 Remap** du topbar (= persistant `localStorage`).

**Topbar** : zoom ×1..×6 (×1 = résolution native GBA 240×160), Remap, et un
panneau audio devtool (sous le canvas) avec search BGM/SE + slider volume master.

**Lock canvas** : focus géré nativement via `tabIndex` + `document.activeElement`.
Cliquer ailleurs sur la page perd le focus naturellement, cliquer sur le canvas
le récupère. Empêche le scroll page de hijacker les flèches pendant le jeu.

## Stack

- **Vite + TypeScript + Phaser 3** — host canvas only, pas de logique jeu côté Phaser
- **Engine GBA pixel-perfect** maison (`src/engine/gba/`) : 1:1 GBATEK
  (BG / OAM / palette / blend / windows / affine matrices)
- **Audio** : [`spessasynth_lib`](https://github.com/spessasus/SpessaSynth) pour les
  BGM SF2 runtime + 269 SE pré-rendus offline depuis [`em-rip69`](https://github.com/Bregalad/GBA_Mus_Ripper)
  (samples PSG enregistrés sur vrai hardware GBA par Bregalad)
- **DecompRuntime** (`src/engine/decomp-runtime.ts`) : boot loop unique 1:1 `AgbMain`
  + `PaletteFade` complete struct match `struct PaletteFadeControl` du décomp
- **Foundations partagées** : `decomp-globals` / `decomp-helpers` /
  `gba-text-system` / `gba-text-window` / `gba-window-system` / `gba-menu-system`
- **Modules scene-specific** : `option-menu-impl` (1:1 décomp `option_menu.c`),
  `main-menu-impl` (1:1 décomp `main_menu.c`), `copyright-boot`
  (1:1 décomp `intro.c` boot loop)
- **Transpileur C → TS** (`scripts/transpile-callbacks.mjs`) :
  callbacks `Task_*` / `SpriteCB_*` / `CB2_*` transcrits automatiquement
  depuis le décomp + `post-transpile-patches.mjs` idempotent (patterns
  génériques + scene-specific)
- **Combat** : [`@pkmn/sim`](https://github.com/pkmn/ps) + `@pkmn/dex` (Gen 3)

## Structure src/

```
src/
  main.ts                         Phaser config (scenes array)
  vite-env.d.ts                   Vite types reference
  scenes/
    GameScene.ts                  Host unique, tick DecompRuntime à 60Hz, boot via copyright-boot
    TestGbaScene.ts               Sanity engine GBA + audio (Lotad rotation + mus_intro test)
    DebugOverlayScene.ts          Overlay fps / frame / tasks / sprites
    [legacy] BattleScene/Birch/Naming/Overworld/etc. — restaurés mais hors scene array
  engine/
    gba/                          Engine GBA pixel-perfect (BG/OAM/palette/blend/windows/affine)
    m4a/                          Audio runtime (SpessaSynth bridge + voicegroups + sample loader)
    decomp-data/auto/             TS auto-généré depuis le décomp (~470 callbacks files)
    decomp-impls/                 Implémentations runtime (sprite engine affine, etc.)
    decomp-runtime.ts             Boot loop décomp (gMain.callback2, gTasks, gSprites) + PaletteFade
    decomp-globals.ts             Helpers globaux 1:1 décomp (LZ77UnCompVram, LoadPalette, etc.)
    decomp-helpers.ts             Sin / Cos / SetOamMatrix / CalcCenterToCornerVec / PaletteBuffer.flushTo
    copyright-boot.ts             1:1 CB2_InitCopyrightScreenAfterBootup state machine
    intro-asset-loader.ts         Preload Scene 1 + 2 + 3 + Title assets
    gba-text-system.ts            Render text via GBA windows + GetStringWidth glyph widths
    gba-text-window.ts            Foundation partagée frame tiles (option_menu ↔ main_menu)
    gba-window-system.ts          Windows GBA (frames + content + FillBgTilemapBufferRect)
    gba-menu-system.ts            Helpers menu génériques (Yes/No, cursor input, gSaveBlock2Ptr proxy)
    main-menu-impl.ts             1:1 décomp main_menu.c (InitMainMenu, HandleMainMenuInput, …)
    option-menu-impl.ts           1:1 décomp option_menu.c (Draw helpers, ProcessInput, save persistence)
    gba-strings.ts                Strings FR depuis /decomp/em/strings.json
    gba-task.ts / gba-io-regs.ts / gba-global-scope.ts
    decomp-data/main-menu-data.ts Data extracted from main_menu.c
    palette-fade.ts               @deprecated — wrapper Phaser legacy
    music.ts                      SpessaSynth bridge BGM
scripts/                          ~68 extracteurs Node ESM + transpileur + post-transpile-patches
public/decomp/em/                 Assets extraits (re-générables)
public/em-rip69/                  529 MIDI rippés depuis ROM (gba-mus-ripper)
public/audio/se_prerendered/      269 SE WAV pré-rendus offline
```

## Régénérer les assets décomp

```bash
mkdir -p ../decomps && git clone --depth 1 https://github.com/qigast/pokeemeraude.git ../decomps/pokeemeraude
npm run extract:em                  # maps, sprites, tilesets, musique
npm run extract:decomp-all          # parse .c/.h → fichiers TS dans decomp-data/auto/
npm run extract:decomp-asm          # parse .s/.inc → fichiers ASM data
npm run transpile:callbacks         # regen Task_* / SpriteCB_* / CB2_* + post-transpile-patches auto
```

Le `post-transpile-patches.mjs` est **idempotent** : safe à re-run après chaque
transpile, applique les patches scene-specific (intro / title_screen /
option_menu / main_menu) puis les patterns génériques sur tous les
`*-callbacks-auto.ts` (G1 = `SetMainCallback2`, G2 = `SetVBlankCallback`,
G3 = `VBlankCB` no-op auto-inject).

## Tester l'engine

`TestGbaScene` (première scène au boot) :

- Copyright Pokemon Emerald BG
- Lotad sprite 64×64 en `DOUBLE_AFFINE` rotation 360°
- BLDY brightness pulse
- WIN0 spotlight 80×80
- `P` = play `mus_intro.mid` test, `S` = stop
- vraie touche GBA (= W / X / Enter / etc.) = passe à `GameScene`

Si `TestGba` marche pixel-perfect, l'engine est validé.

## Régénérer les SE

```bash
node scripts/render-se-from-emrip.mjs
```

Lit `public/em-rip69/` + `decomps/pokeemeraude/sound/song_table.inc`,
écrit `public/audio/se_prerendered/<name>.wav` × 269.

## Sources de référence (lecture seule, **pas pour copier 1:1**)

- `D:/Projet 1/decomps/pokeemeraude/` — décomp FR (source de vérité 1:1 ROM FR)
- `D:/Projet 1/decomps/pokeemerald-master/` — décomp EN, utilisée pour
  comparaison croisée quand un commentaire ou un nom de fonction FR est ambigu

## Crédits décomp

Ce projet n'existe que grâce au travail des équipes décompilation Pokémon.
**Tous les codes de gameplay 1:1 (state machines, helpers GBA, layout windows,
palettes, callbacks) sont transcrits depuis les sources C de ces décomps**,
pas réinventés.

- **[`qigast/pokeemeraude`](https://github.com/qigast/pokeemeraude)** — décomp
  française de Pokémon Émeraude. **Source de vérité primaire** du projet :
  c'est ce que notre engine reproduit 1:1 (mêmes IDs, mêmes structures, mêmes
  constants, même ordre d'exécution). La build de ce repo produit une ROM
  bit-perfect avec la cartouche FR officielle.
- **[`pret/pokeemerald`](https://github.com/pret/pokeemerald)** — décomp
  anglaise officielle de Pokémon Emerald (référence historique du projet pret).
  **Utilisée pour comparaison croisée** : quand un commentaire ou un nom de
  symbole dans la décomp FR est ambigu, on vérifie l'équivalent EN pour
  clarifier l'intention. Aucun code EN n'est utilisé en production — toutes
  les valeurs viennent du repo FR.

Merci aux contributeurs de ces deux projets pour l'énorme travail de reverse
engineering qui rend ce port web possible.

## Crédits audio

- **`em-rip69/em.sf2`** — généré par
  [gba-mus-ripper](https://github.com/Bregalad/GBA_Mus_Ripper) de Bregalad
  (MIT). Le SF2 contient les samples PSG (square waves + noise) **enregistrés
  sur vrai hardware GBA** par Bregalad (`psg_data.raw`). C'est ce qui permet
  aux SE noise de sonner 1:1 avec une console réelle sans avoir à émuler le
  LFSR.
- **`em-rip69/songNNNN.mid`** — 529 MIDI rippés par gba-mus-ripper depuis la ROM.
- **[`spessasynth_core`](https://github.com/spessasus/SpessaSynth)** +
  `spessasynth_lib` (MIT) — synth runtime (BGM live) et offline qui rend les
  SF2 + MIDI en WAV (`scripts/render-se-from-emrip.mjs`).
- **[`pokeemeraude`](https://github.com/qigast/pokeemeraude)** — décomp FR qui
  fournit le `song_table.inc` pour mapper IDs songs → noms.

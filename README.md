# pokemon-web-demo

Émulation web 1:1 de Pokémon Émeraude (GBA) en TypeScript, à partir de la
**décompilation FR** [`qigast/pokeemeraude`](https://github.com/qigast/pokeemeraude)
et de [`@pkmn/sim`](https://github.com/pkmn/ps) pour le moteur de combat.

> **Directive du projet** : 1:1 décomp + foundations unifiées. Zéro hardcode,
> aucun pré-rendu PNG, aucune ROM. Tout passe par le boot loop décomp
> `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer`.

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
  (1:1 décomp `intro.c` boot loop), `naming-screen-impl` (1:1 décomp `naming_screen.c`),
  `pokeball-effects` (1:1 décomp `pokeball.c`)
- **Transpileur C → TS** (`scripts/transpile-callbacks.mjs`) :
  callbacks `Task_*` / `SpriteCB_*` / `CB2_*` transcrits automatiquement
  depuis le décomp + `post-transpile-patches.mjs` idempotent
- **Combat** : [`@pkmn/sim`](https://github.com/pkmn/ps) + `@pkmn/dex` (Gen 3)
- **Devtools runtime** (`src/engine/engine-devtools.ts`) : `window.dev` exposé
  pour debug interactif (frame control, savestate, pixelTrace, hookFn, dumps).

## Structure src/

```
src/
  main.ts                         Phaser config (scenes array)
  scenes/
    TestGbaScene.ts               Sanity engine GBA + audio (Lotad rotation + mus_intro test)
    GameScene.ts                  Host unique, tick DecompRuntime à 60Hz, boot via copyright-boot
    BirchRuntimeScene.ts          Host alternatif pour le flow Birch sur runtime décomp natif
    DebugOverlayScene.ts          Overlay fps / frame / tasks / sprites
    OverworldScene.ts             Scène legacy conservée (= reusable post-Phase 4 overworld native)
  engine/
    gba/                          Engine GBA pixel-perfect (BG/OAM/palette/blend/windows/affine)
    m4a/                          Audio runtime (SpessaSynth bridge + voicegroups + sample loader)
    decomp-data/auto/             TS auto-généré depuis le décomp (~470 callbacks files)
    decomp-impls/                 Implémentations runtime (sprite engine affine, etc.)
    decomp-runtime.ts             Boot loop décomp (gMain.callback2, gTasks, gSprites) + PaletteFade
    decomp-globals.ts             Helpers globaux 1:1 décomp (LZ77UnCompVram, LoadPalette, etc.)
    decomp-helpers.ts             Sin / Cos / SetOamMatrix / CalcCenterToCornerVec / PaletteBuffer.flushTo
    copyright-boot.ts             1:1 CB2_InitCopyrightScreenAfterBootup state machine
    intro-asset-loader.ts         Preload Scene 1 + 2 + 3 + Title + Birch assets
    gba-text-system.ts            Render text via GBA windows + GetStringWidth glyph widths
    gba-text-window.ts            Foundation partagée frame tiles (option_menu ↔ main_menu)
    gba-window-system.ts          Windows GBA (frames + content + FillBgTilemapBufferRect)
    gba-menu-system.ts            Helpers menu génériques (Yes/No, cursor input, gSaveBlock2Ptr proxy)
    gba-text-printer.ts           Printer engine 1:1 décomp src/text.c (RunTextPrinter, etc.)
    main-menu-impl.ts             1:1 décomp main_menu.c (InitMainMenu, HandleMainMenuInput, …)
    option-menu-impl.ts           1:1 décomp option_menu.c
    naming-screen-impl.ts         1:1 décomp naming_screen.c
    pokeball-effects.ts           1:1 décomp pokeball.c (release flash + sparkles + emerge anim)
    engine-devtools.ts            window.dev runtime debug helpers (= installé par les scenes)
    gba-strings.ts                Strings FR depuis /decomp/em/strings.json
    music.ts                      SpessaSynth bridge BGM
scripts/                          ~70 extracteurs Node ESM + transpileur + post-transpile-patches
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

## Devtools runtime (`window.dev`)

Disponible dès qu'une scene runtime boot (`installEngineDevtools` est wired
dans GameScene + BirchRuntimeScene). Type `dev.help()` dans la console pour
la liste complète. Highlights :

- **Frame control** : `dev.pause()` / `dev.resume()` / `dev.step(N)` / `dev.seek(F)`
- **Auto-pause** : `dev.pauseAt(rt => rt.gSprites.size === 21, 'release')`
- **Pixel trace** : `dev.pixelTrace(80, 50)` → quel sprite/BG occupe ce pixel
- **Savestates** : `dev.savestate('foo')` / `dev.loadstate('foo')` (incomplet pour task closures)
- **Function hooks** : `dev.hookFn('BlendPalette', { budget: 100 })` (log args)
- **Memory dumps** : `dev.vram(addr, len)` / `dev.palBank(b, mode, faded)` / `dev.palDiff()`
- **Visibility isolation** : `dev.bgVisible(idx, false)` / `dev.objHide(true)`

URL params : `?pause` (boot pausé), `?seekTo=N` (skip à frame N), `?slow=0.25` (speed).

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

## License

Code original de ce port web : MIT. Voir aussi les licenses des projets
sources (pokeemeraude, pret/pokeemerald, spessasynth, gba-mus-ripper).

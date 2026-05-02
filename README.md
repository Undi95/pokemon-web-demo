# pokemon-web-demo

Émulation web 1:1 de Pokémon Émeraude (GBA) en TypeScript à partir de la
**décompilation FR** [`qigast/pokeemeraude`](https://github.com/qigast/pokeemeraude)
+ [`@pkmn/sim`](https://github.com/pkmn/ps) pour le moteur de combat.

> **Directive** : 1:1 GBA. ZÉRO hardcode. AUCUN pré-rendu PNG. AUCUNE ROM.
> Tout passe par le boot loop décomp `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer`.

## Documents principaux

- [`ROADMAP.md`](./ROADMAP.md) — état actuel, bugs résiduels, phases planifiées
- [`DEV_LOG.md`](./DEV_LOG.md) — historique session par session
- [`AUDIT_BOOT.md`](./AUDIT_BOOT.md) — audit boot flow Crédits→New Game (référence)

## État actuel (fin session 68 phase 4)

Boot end-to-end fonctionne : Copyright → Intro Scene 1/2/3 → Title (logo POKÉMON™) →
Press Start → Main Menu (NOUVELLE PARTIE/OPTION FR) → A → Birch Speech Init.

Visuel encore partiel : sprites Scene 2 OK (May/Flygon/Pokémon), Scene 3 clouds+lightning OK,
Title logo OK. Manquent : Rayquaza derrière logo, sprites Press Start, Scene 1 letters affines,
Scene 2 BG bike road, Scene 3 Groudon/Kyogre, Birch BGs.

## Lancer

```bash
npm install
npm run dev
```

Vite ouvre `http://localhost:5173/`. Click ou key dans `TestGbaScene` → passe à `GameScene` (= la "ROM" qui tourne).

**Touches GBA simulées** :
- W = A | X = B | N = SELECT | B / Enter / Espace = START
- Flèches = D-Pad | Z = R | A = L | ESC = retour TestGbaScene

## Stack

- **Vite + TypeScript + Phaser 3** (= host canvas only, pas de logique jeu)
- **Engine GBA pixel-perfect** maison (`src/engine/gba/`) : 1:1 GBATEK
- **Engine M4A audio** maison (`src/engine/m4a/`) : 1:1 décomp `m4a.c` + `m4a_1.s`
- **DecompRuntime** (`src/engine/decomp-runtime.ts`) : boot loop unique 1:1 `AgbMain`
- **decomp-globals + copyright-boot + gba-text/window/menu-system** : helpers + Main Menu FR
- **Transpileur C→TS** (`scripts/transpile-callbacks.mjs`) : 99% callbacks transcrits + post-patches
- **`@pkmn/sim`** + `@pkmn/dex` pour les combats Gen 3

## Régénérer les assets décomp

```bash
mkdir -p ../decomps && git clone --depth 1 https://github.com/qigast/pokeemeraude.git ../decomps/pokeemeraude
npm run extract:em                  # maps, sprites, tilesets, musique
npm run extract:decomp-all          # parse .c/.h → 626 fichiers TS
npm run extract:decomp-asm          # parse .s/.inc → 608 fichiers TS
npm run transpile:callbacks         # regen Task_*/SpriteCB_*/CB2_* + post-patches auto
```

## Structure src/

```
src/
  main.ts                         Phaser config (scenes array)
  scenes/
    GameScene.ts                  Host unique, tick DecompRuntime à 60Hz, boot via copyright-boot
    TestGbaScene.ts               Sanity engine GBA + audio M4A (Lotad rotation + mus_intro)
    DebugOverlayScene.ts          Overlay fps/frame/tasks/sprites
    [legacy] BattleScene/Birch/Naming/Overworld/etc. — restaurés mais pas dans scene array
  engine/
    gba/                          Engine GBA pixel-perfect (BG/OAM/palette/blend/windows/affine)
    m4a/                          Engine audio M4A 1:1 décomp (ADSR/LFO/reverb)
    decomp-data/auto/             TS auto-généré depuis le décomp (1234 fichiers)
    decomp-impls/sprite-engine-impl.ts  Implémentations runtime affine
    decomp-runtime.ts             Boot loop décomp (gMain.callback2, gTasks, gSprites)
    decomp-globals.ts             Helpers globaux (LZ77UnCompVram, LoadPalette, etc.)
    decomp-helpers.ts             Sin/Cos/SetOamMatrix/CalcCenterToCornerVec
    copyright-boot.ts             1:1 CB2_InitCopyrightScreenAfterBootup state machine
    intro-asset-loader.ts         Preload Scene 1+2+3+Title assets
    gba-text-system.ts            Render text via GBA windows (FR)
    gba-window-system.ts          Windows GBA (frames + content)
    gba-menu-system.ts            Main Menu (NOUVELLE PARTIE/OPTION)
    gba-task.ts/gba-strings.ts/gba-io-regs.ts/gba-global-scope.ts
    main-menu-data.ts             Data extracted main_menu.c
    music.ts                      SpessaSynth bridge (legacy, non utilisé en GameScene)
scripts/                          ~60 extracteurs Node ESM + transpileur + post-patches
public/decomp/em/                 Assets extraits (re-générables)
```

## Tester l'engine

`TestGbaScene` (1ère scène) :
- Copyright Pokemon Emerald BG
- Lotad sprite 64×64 DOUBLE_AFFINE rotation 360°
- BLDY brightness pulse
- WIN0 spotlight 80×80
- `P` = play `mus_intro.mid` via M4A engine maison
- click/key = passe à `GameScene`

Si TestGba marche pixel-perfect, l'engine est validé.

## Sources de référence (lecture seule, **pas pour copier 1:1**)

- `D:/Projet 1/decomps/pokeemeraude/` — décomp FR (= source de vérité 1:1 ROM)

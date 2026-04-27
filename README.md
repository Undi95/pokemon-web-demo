# pokemon-web-demo

Émulation web 1:1 de Pokémon Émeraude (GBA) en TypeScript, à partir de la
**décompilation FR** [`qigast/pokeemeraude`](https://github.com/qigast/pokeemeraude)
+ [`@pkmn/sim`](https://github.com/pkmn/ps) pour le moteur de combat.

> **Directive** : 1:1 GBA. ZÉRO hardcode. AUCUN pré-rendu PNG.
> Tout passe par le boot loop décomp `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer`.

## Documents principaux

- [`ROADMAP.md`](./ROADMAP.md) — état actuel, audit, top 5 actions, phases planifiées
- [`DEV_LOG.md`](./DEV_LOG.md) — historique session par session

## Lancer

```bash
npm install
npm run dev
```

Vite ouvre `http://localhost:5174/` avec HMR.

## Stack

- **Vite + TypeScript + Phaser 3** (Phaser sert d'host canvas seulement, pas de logique de jeu)
- **Engine GBA pixel-perfect** maison (`src/engine/gba/`) : 1:1 GBATEK (BG/OAM/palette/blend/windows/affine/mosaic)
- **Engine M4A audio** maison (`src/engine/m4a/`) : 1:1 décomp `m4a.c` + `m4a_1.s` (ADSR/LFO/reverb/sample loop)
- **DecompRuntime** (`src/engine/decomp-runtime.ts`) : boot loop unique 1:1 `AgbMain`
- **Transpileur C→TS** (`scripts/transpile-callbacks.mjs`) : transcrit auto les `Task_*`/`SpriteCB_*`/`CB2_*` du décomp en TypeScript
- **`@pkmn/sim`** + `@pkmn/dex` pour les combats Gen 3

## Régénérer les assets décomp

Pré-requis : cloner `pokeemeraude` à côté du projet.

```bash
mkdir -p ../decomps && git clone --depth 1 https://github.com/qigast/pokeemeraude.git ../decomps/pokeemeraude
npm run extract:em                # maps, sprites, tilesets, musique, ui
npm run extract:decomp-all        # parse 310 .c + 329 .h → 626 fichiers TS
npm run extract:decomp-asm        # parse .s + .inc → 608 fichiers TS
node scripts/transpile-callbacks.mjs   # regen Task_*/SpriteCB_*/CB2_* TS
```

Sortie : `public/decomp/em/` (assets) + `src/engine/decomp-data/auto/` (TS extracted).

## Structure (post cleanup session 68)

```
src/
  main.ts                       Phaser config (TestGbaScene + GameScene)
  scenes/
    GameScene.ts                Host unique, tick DecompRuntime à 60Hz
    TestGbaScene.ts             Sanity check engine GBA + audio M4A
  engine/
    gba/                        Engine GBA pixel-perfect
    m4a/                        Engine audio M4A 1:1 décomp
    decomp-runtime.ts           Boot loop décomp (gMain.callback2, gTasks, gSprites)
    decomp-globals.ts           Helpers globaux (LZ77UnCompVram, LoadPalette, etc.)
    decomp-helpers.ts           Sin/Cos/SetOamMatrix/CalcCenterToCornerVec
    decomp-impls/               Implémentations runtime (sprite-engine-impl)
    decomp-data/auto/           TS auto-généré depuis le décomp (1234 fichiers)
    intro-asset-loader.ts       Preload assets Scene 1 dans assetCache
    music.ts                    SpessaSynth bridge (in-game music)
scripts/                        38 extracteurs Node ESM + transpileur C→TS
public/decomp/em/               Assets extraits (re-générables)
```

## Tester l'engine

`TestGbaScene` (1ère scène au boot) affiche :
- Copyright Pokemon Emerald (BG)
- Lotad sprite 64×64 DOUBLE_AFFINE rotation 360°
- Pulse BLDY brightness
- Window WIN0 spotlight 80×80
- `P` = play `mus_intro.mid`, `S` = stop, click/key = passe à `GameScene`

Si tout marche pixel-perfect dans TestGba, l'engine est validé. Les bugs visuels Scene 1 viennent du runtime/transcription, pas de l'engine.

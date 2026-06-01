# Architecture — Pokémon Émeraude → TypeScript/Phaser (port 1:1)

> Vue d'ensemble pour savoir **où est quoi** et **comment ça s'imbrique**.
> Source de vérité = le décomp C `D:/Projet 1/decomps/pokeemeraude/`. Tout le
> code de jeu vit dans `src/engine/`. Convention : chaque port cite sa source
> (`1:1 décomp <fichier>.c:<ligne>`) — c'est ce qui rend la traçabilité (et
> l'outil `npm run coverage:1to1`) possible.

## Le modèle : on émule un GBA, pas on « refait » le jeu

Le port ne réinvente rien : il **émule le runtime GBA** (VRAM, OAM, palettes,
tasks, sprites, le main-loop `gMain.callback2`) et y fait tourner le code décomp
transcrit 1:1 en TS. Donc un dev qui connaît la décomp retrouve tout.

## Arborescence `src/engine/`

| Dossier | ~Fichiers | Rôle |
|---|---|---|
| `system/` | 25 | **Runtime décomp** (le cœur) : runtime GBA, globals, bridge, helpers, sprite. |
| `gba/` | 8 | **Hardware GBA émulé** : VRAM/OAM/palette + compositor (rendu scanline). |
| `decomp-impls/` | 2 | Moteur d'anim sprite (OAM + affine), porté 1:1. |
| `decomp-data/` | ~2300 | **Auto-généré** (transpileur/extracteurs) : constantes, data, callbacks CB2/Task transcrits, sprite tables. |
| `battle/` | 76 | **Combat** : CB2 combat, controllers, AI dresseur, interpréteur bytecode, anims, data moves. |
| `field/` | 43 | **Overworld** : maps, events, collisions, mouvement, caméra, field-effects, warps. |
| `ui/` | 34 | Menus/écrans : main menu, texte/fonts, windows, bag, party, pokédex, PC. |
| `script/` | 40 | Interpréteur bytecode OW (dialogues/events) + vars/flags + contexts. |
| `pokemon/` | 13 | Data pokémon + party + moves. |
| `bag/` | 8 | Système sac (items, écran, UI). |
| `save/` | 7 | Persistence (localStorage ↔ save blocks GBA). |
| `boot/` | 3 | Décisions boot (intro / resume save / new game) + asset loader intro. |
| `m4a/` | ~210 | Synthé audio MIDI + lecteur M4A + SFX. |
| `devtools/` | 6 | Outils debug (`window.dev` / `window.scope`, breakpoints, frame-step). |

## Les 3 pivots runtime (à lire en premier)

1. **`system/decomp-runtime.ts`** — `class DecompRuntime` : l'orchestrateur.
   `gSprites` (Map), `gTasks` (Map), OAM, palette+fade, registres GPU.
   `CreateSprite`/`StartSpriteAnim`/`AnimateSprites`, `BuildOamBuffer`,
   `BeginNormalPaletteFade`. **`tickFixed()`** = la boucle 60 Hz : 1 frame
   logique = `gMain.callback2()` + `RunTasks()` + `AnimateSprites()` +
   `tickAllAffineAnims()` + sync OAM. `gIntroFrameCounter` = l'horloge frame
   canonique (toute anim per-frame doit gater dessus, pas sur `performance.now`).
2. **`system/decomp-globals.ts` + `decomp-bridge.ts` + `decomp-helpers.ts`** —
   le pont : singleton runtime, helpers audio/sprite/palette, macros inline
   (`OBJ_PLTT_ID`, `ARRAY_COUNT`…), `gSineTable`/`Sin`/`Cos`, `SetOamMatrix`,
   `CalcCenterToCornerVec`. Le bridge re-exporte 1:1 et **fail-fast** sur le
   non-implémenté (pas de stub silencieux).
3. **`gba/gba.ts` + `gba/compositor.ts`** — le rendu : VRAM/objVram/palette/OAM/
   matrices affine ; `compositor.ts` compose **par scanline** (backdrop → BG par
   priorité 3→0 → OAM par priorité+subpriorité → blend → windows). C'est ici que
   le rendu OBJ affine (NORMAL/DOUBLE), le clipping, les palettes faded vivent.

## Boucle de jeu & scènes

`src/main.ts` (preload data/assets, config Phaser 60 Hz) → **`GameScene.ts`**
héberge l'unique `Gba` + `DecompRuntime` et appelle `rt.tickFixed(dt)` chaque
frame. Le flux suit le modèle décomp `SetMainCallback2` : chaque tick exécute
`gMain.callback2()`, qui se réassigne pour transitionner d'état :

```
copyright → intro → title screen → main menu → (new game | resume) → overworld
                                                       ↓ (rencontre / script)
                                                    combat  ↔  menus (sac/party/…)
```

Les combats et sous-écrans s'ouvrent en posant un nouveau `callback2` (ou en
inline pour le combat actuel) puis reviennent. Voir `battle/` (CB2_InitBattle…)
et le pattern « OPEN_* → SetMainCallback2 → reshow → WAIT_SUBSCREEN ».

## Sprites & animation

- **Création** : `CreateSprite(template)` ou `CreateSpriteAtOam({tileId, paletteBank, x, y, shape, size, priority, affineMode?, subpriority?})`. x/y = coin haut-gauche par défaut ; `centerToCornerVec` recadre (négatif) pour les sprites centrés / affine DOUBLE.
- **Anim frames** : `StartSpriteAnim(sprite, n)` → `AnimateSprites()` avance les frames (swap tileId).
- **Anim affine** (scale/rotation) : `StartSpriteAffineAnim(sprite, n)` + une table enregistrée (`sprite-affine-extras.ts`) → `tickAllAffineAnims()` accumule scale/rotation et écrit la matrice OAM via `SetOamMatrix`. (cf. `decomp-impls/sprite-engine-impl.ts`.)

## Conventions clés

- **Citation décomp** : `1:1 décomp file.c:line` dans les commentaires. Non
  négociable — c'est la spec de complétude + ce que les audits exploitent.
- **Data extraite** : `public/decomp/em/*` (tiles `.4bpp.bin`, palettes `.gbapal`,
  `strings.json`, `constants.json`, …) = byte-identique au décomp. Générée par
  les `npm run extract:*`.
- **Registries** : `decomp-data/` (auto-généré) pour sprite templates, anims,
  song table, sine table, callbacks transcrits.
- **Devtools** : `?debug` → `window.dev` (runtime, pause/step/frame, `dev.battle.startWild/startTrainer`) + `window.scope` (where/press/walk/…).

## Pour reprendre / porter quelque chose

1. `npm run coverage:1to1` → `audit-reports/1to1/COVERAGE-GLOBAL.md` : qu'est-ce
   qui est porté / partiel / manquant, par fichier décomp.
2. Lire le `.c` décomp cible EN ENTIER + le(s) module(s) TS qui le citent.
3. Porter 1:1 (citer les lignes), `tsc` clean, vérifier au runtime (`?debug`,
   reload ×2 car le HMR ment), A/B avec le user pour tout ce qui est visuel.

Voir `docs/STATE.md` pour l'état par sous-système + le backlog priorisé.

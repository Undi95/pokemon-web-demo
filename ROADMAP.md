# Roadmap — Pokémon Émeraude Web 1:1 GBA

> **Source de vérité** : la décompilation `D:\Projet 1\decomps\pokeemeraude`.
> **Directive** : 1:1 GBA. ZÉRO hardcode. AUCUN pré-rendu PNG.
> **Tout passe par le boot loop** `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer` (1:1 `AgbMain` décomp).

---

## État actuel — fin session 68

### Architecture en place

- **Engine GBA pixel-perfect** (`src/engine/gba/`, ~2000L) : BG/OAM/palette/blend/windows/affine/mosaic. Validé en isolation via `TestGbaScene` (Lotad rotation 360° + BLDY pulse + WIN0 + copyright BG).
- **Engine M4A audio 1:1** (`src/engine/m4a/`, ~1700L) : ADSR, LFO, reverb, sample loop, voicegroups complets, 195 voicegroups + 544 WAV. Validé via `TestGbaScene` (P=play mus_intro.mid).
- **DecompRuntime** (`src/engine/decomp-runtime.ts`) : `gMain.callback2` + `gTasks` + `gSprites` + `tickFixed 60Hz` qui dispatch dans l'ordre exact `AgbMain`.
- **decomp-globals** (`src/engine/decomp-globals.ts`) : helpers globaux décomp (`LZ77UnCompVram`, `LoadPalette`, `DmaClear16`, `LoadCompressedSpriteSheet`, etc.) + `assetCache` + `gTitleScreenAlphaBlend[64]`.
- **Transpileur C→TS** (`scripts/transpile-callbacks.mjs`) : 1632/1648 callbacks transcrits 99% (388 SpriteCB + 989 Task + 241 CB2 + 14 helpers).
- **Décomp extracted** : 6576 fonctions sur 87 .c, 27 SPRITE_DATA_TABLES, 36 EXTERNAL_PALETTES, 63 SPRITE_ANIMS, 27 SPRITE_TEMPLATES, 22 OAM_DATAS.
- **Boot loop unique** : `GameScene` (host Phaser canvas) + `TestGbaScene` (sanity engine). Plus de scenes Phaser intermédiaires.

### Ce qui marche visuellement

- Boot loop tick à 60Hz, transitions Tasks Scene 1 → Scene 2 → ... s'enchaînent
- Scene 1 affiche partiellement (1 BG layer leaves visible + OAM sprites en blocs noirs au lieu de letters GAME FREAK)
- Audio engine init OK (juste `m4aSongNumStart` pas câblé)

### Ce qui est CASSÉ (= verdict audit Opus session 68)

> **L'archi est FIXABLE. Pas pourrie. Mais il y a des bugs structurels critiques qui expliquent l'écart visuel.**

---

## Audit session 68 — diagnostic complet

### Top 10 corrections critiques (par sévérité)

| # | Fichier | Problème | Sévérité |
|---|---------|----------|----------|
| 1 | `gba/gba.ts:42-47` + `decomp-globals.ts:138-204` | VRAM séparé par BG vs partagé GBA (96KB) | **CRITIQUE** |
| 2 | `intro-callbacks-auto.ts` (transpileur) | `paletteNum` field inexistant (devrait être `paletteBank`) | **CRITIQUE** |
| 3 | `bg-layer.ts:81-94` + `decomp-globals.ts:172-180` | Tilemap 64×32 multi-block partiellement écrit | **CRITIQUE** |
| 4 | `compositor.ts:159-182` | Top2 layer tracking faux après loop priority | IMPORTANT |
| 5 | `transpile-callbacks.mjs` | 34 `/* TODO */` cassent Scene 2/3 + audio start | IMPORTANT |
| 6 | `intro-callbacks-auto.ts` | `Math.random()` au lieu de Random() séquentiel décomp | IMPORTANT |
| 7 | `decomp-runtime.ts:528-544` | `BeginNormalPaletteFade` simpliste vs `palette_fade.c` | IMPORTANT |
| 8 | `intro-asset-loader.ts:62-76` | Liste hardcodée — manque g-prefixed Scene 2/3 | IMPORTANT |
| 9 | `decomp-runtime.ts:386-406` | `isAffine` deviné via paletteMode (Scene 3 cassé) | MINEUR |
| 10 | `intro-callbacks-auto.ts:7` | `@ts-nocheck` masque tous les bugs typage | MINEUR |

### Top 5 actions concrètes (ROI/temps)

#### Action 1 — Fix `paletteNum` → `paletteBank` [2-4h]
Modifier `scripts/transpile-callbacks.mjs` pour ajouter règle de substitution `paletteNum → paletteBank`, regen `intro-callbacks-auto.ts`. **Débloque immédiatement** les color swaps WaterDrop_Ripple et toutes les anim palette OAM.

#### Action 2 — Refactor VRAM partagée [1 jour]
Remplacer dans `gba/gba.ts:42-47` les 4 `vram = new Uint8Array(32768)` SÉPARÉS par UN seul `vram = new Uint8Array(0x18000)` (96KB) + getters `getBgCharData(charBaseIndex)` et `getBgTilemap(mapBaseIndex)` qui découpent depuis l'addressing GBA. Élimine les hacks `decomp-globals.ts:138-204` qui routent par suffix de symbol. Résout :
- "1 layer visible au lieu de 4" (charBase 0 partagé)
- Scene 3 clouds (BG2 charBase 1)
- DmaClear16 sémantique correcte

#### Action 3 — Tilemap 64×32 multi-block [4h]
`bg-layer.ts:81-94` (lecture) ou `decomp-globals.ts:172-180` (écriture) : quand le décomp utilise `BGCNT_TXT256x512` (32×64), il faut écrire les 2 blocks (TL+BL) dans le tilemap. Actuellement on écrit que TL → moitié basse vide.

#### Action 4 — Compléter les 34 TODOs [1 jour]
Extracteur supplémentaire qui génère auto les stubs runtime (`SetVBlankCallback`, `m4aSongNumStart`, `INTRO3_RAW_PTR`, `FreeAllSpritePalettes`, `LoadIntroPart2Graphics`). Le wiring `m4aSongNumStart('MUS_INTRO')` → `playMidiLoop('/decomp/em/music/mus_intro.mid')` débloque l'audio Scene 1.

#### Action 5 — Cleanup code mort [2-3h] ✅ FAIT session 68
- 13 scenes Phaser legacy supprimées (~5650L)
- 30+ fichiers `engine/` pré-décomp supprimés (~3500L)
- `src/util/` supprimé (4 fichiers)
- `src/battle/`, `src/data/`, `src/editor/`, `src/decomp/` supprimés
- 4 scripts Python obsolètes supprimés
- 14 MD obsolètes supprimés
- `public/decomp/em/intro-rendered/` + `rendered/` supprimés (PNGs pré-rendus interdits par directive 1:1)

---

## Code dupliqué identifié (à dédupliquer)

- **REG_OFFSET_*/BGCNT_*/DISPCNT_*** : déclarés dans `decomp-runtime.ts` ET re-exportés `decomp-globals.ts` ET re-importés `intro-callbacks-auto.ts`. Triple definition.
- **`sCenterToCornerVecTable`** : dupliqué `decomp-helpers.ts:72-79` ET implicite dans `gba/types.ts:159-166` via `OAM_SIZES`. Source unique = `sprite.c:137`.
- **`PALTAG_DROPS`** : `intro-data.ts:15` (number) + `intro-callbacks-auto.ts:1031` (string) — double truth.
- **Palette fade** : `decomp-runtime.ts:528-544` + `gba/types.ts:317` (BlendConfig) → 2 modèles parallèles.

---

## Décomp non encore lus (à inspecter)

- **`include/gba/macro.h`** : DMA macros, BGCNT_*, OAM_DATA helpers. Notre runtime les réplique manuellement.
- **`Makefile`** + **`audio_rules.mk`** + **`spritesheet_rules.mk`** : pipeline build .png → .4bpp.lz, .mid → .s.
- **`ld_script.ld`** : layout VRAM/EWRAM/IWRAM = source de vérité memory mapping. **CRITIQUE** pour Action 2.
- **`include/global.h`** + **`charmap.txt`** : macros texte FR + INCBIN_U32 sémantique.
- **`tools/preproc/`** : préprocesseur dialogues `_("text")` → bytes selon charmap.

---

## Pipeline complet visé (après Top 5 fixes)

```
GameScene.create() → setGlobalRuntime + audio prime + preloadAssets
  → SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)
    → SetUpCopyrightScreen state machine
      → CreateTask(Task_Scene1_Load) + SetMainCallback2(MainCB2_Intro)
        → Task_Scene1_Load → FadeIn → WaterDrops → CreateSparkles → PanUp → End
          → Task_Scene2_Load → CreateSprites → BikeRide → End
            → Task_Scene3_Load → ... → SetMainCallback2(CB2_InitTitleScreen)
              → Task_TitleScreenPhase1/2/3 → Press Start
                → SetMainCallback2(CB2_InitMainMenu)
                  → CB2_NewGameBirchSpeech → CB2_LoadNamingScreen
                    → CB2_LoadMap (overworld) + script-runner via opcodes
                      → CB2_InitBattle (bridge @pkmn/sim)
```

Toutes les Tasks/CB2/SpriteCB déjà transpilées dans `decomp-data/auto/`. Reste juste à fixer le runtime (Top 5) pour que ça déroule 1:1.

---

## Phases planifiées

- **Phase 0 [DONE session 68]** : Boot loop unique + GameScene + Task_Scene1_Load tourne mécaniquement
- **Phase 1** : Top 5 fixes audit → Scene 1 1:1 visuel pixel-perfect (3-4 jours)
- **Phase 2** : Scene 2/3 + Title via TODOs comblés (~1 semaine)
- **Phase 3** : MainMenu + NewGame + BirchSpeech + Naming via Tasks transcrites (~1 semaine)
- **Phase 4** : Overworld via opcodes décomp + script-runner (~2 semaines)
- **Phase 5** : Battle via bridge `@pkmn/sim` + UI Tasks transcrites (~2 semaines)

**Pixel oracle** : utiliser `public/decomp/em/rom.gba` (déjà présent) comme référence avec mGBA WASM ou frame dumps automatiques pour validation pixel par scanline.

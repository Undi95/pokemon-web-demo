# Roadmap — Pokémon Émeraude Web 1:1 GBA

> **Source de vérité** : la décompilation `D:\Projet 1\decomps\pokeemeraude`.
> **Référence architecture** : sources Nintendo R/S `D:\Projet 1\gen3src\RS\source` (= comprendre, **PAS copier 1:1**).
> **Directive** : 1:1 GBA. ZÉRO hardcode. AUCUN pré-rendu PNG. Aucun ROM.
> **Tout passe par le boot loop** `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer` (1:1 `AgbMain` décomp).

---

## État fin session 70 (Phase 6 — Scene 2 1:1 GBA)

### Boot end-to-end qui marche

```
TestGbaScene (sanity) → click → GameScene
  → setGlobalRuntime + preloadAssets (Scene1+2+3+Title+font)
  → SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)
    → SetUpCopyrightScreen state machine fade in/hold/fade out
      → MainCB2_Intro + CreateTask(Task_Scene1_Load)
        → Task_Scene1_Load → FadeIn → WaterDrops → CreateSparkles → PanUp → End
          → Task_Scene2_Load → CreateSprites → BikeRide → End
            → Task_Scene3_Load → SpinPokeball → WaitGroudon → LoadGroudon → ...
              → Task_EndIntroMovie → SetMainCallback2(CB2_InitTitleScreen)
                → Title state machine 0/1/2/3/4 → MainCB2 + Task_TitleScreenPhase1/2/3
                  → press START → CB2_InitMainMenu
                    → CB2_MainMenu + Task_HandleMainMenuInput
                      → press A NOUVELLE PARTIE → Task_NewGameBirchSpeech_Init
```

### Visuel observé live (Claude Preview Tool)

| Étape | Visuel | Note |
|---|---|---|
| Copyright | partial (skip rapide) | ⏳ |
| Scene 1 | Leaves + drops + GAME FREAK + ripple white + grass + mountains ✅ | **1:1 GBA** |
| Scene 2 | May/bicycle + Manectric/Torchic/Volbeat/Flygon + mountains + pine trees ✅ | **1:1 GBA** session 70 |
| Scene 3 | Clouds + lightning ✅ | ⚠️ Groudon/Kyogre partial |
| Title | Logo + Rayquaza marking pulsant + clouds rise + Press Start ✅ | **1:1 GBA** |
| Main Menu | NOUVELLE PARTIE + OPTION en FR ✅ | bug ♥ curseur dialogue traîne |
| Birch | `Task_NewGameBirchSpeech_Init` reach | ⚠️ BGs invisibles |

### Architecture en place

- **Engine GBA pixel-perfect** (`src/engine/gba/`) : BG/OAM/palette/blend/windows/affine/mosaic, VRAM unifié 96KB
- **Engine M4A audio 1:1** (`src/engine/m4a/`) : ADSR/LFO/reverb/sample loop, validé 987/987 notes propre
- **DecompRuntime** (`decomp-runtime.ts`) : `gMain.callback2` + `gTasks` + `gSprites` + `spriteCallbacks` Map + `tickFixed` 60Hz (vérifié 60.0 fps logic)
- **Devtools** (`window.dev`) : `pause/resume/step(N)/seek/speed/sprites/tasks/bgs` + `?pause` query param
- **decomp-globals** (`decomp-globals.ts`) : helpers décomp + `assetCache` + symbol-name strings
- **copyright-boot** (`copyright-boot.ts`) : 1:1 `CB2_InitCopyrightScreenAfterBootup` state machine
- **gba-text/window/menu-system** : Main Menu Pokémon Émeraude FR
- **Transpileur C→TS** + post-transpile-patches.mjs : 1632/1648 callbacks (99%) + patches manuels auto
- **Pipeline asset** : `extract-png-indexed-tiles.mjs` parse IDAT direct → `.4bpp.bin` / `.8bpp.bin` (préserve indices duplicate-color, voir Session 69 note)

---

## Session 69 — Polish intro visuel

### Title screen (1:1 GBA)
- ✅ `gTitleScreenBgPalettes` concat `pokemon_logo.gbapal` + `rayquaza_and_clouds.gbapal`
- ✅ Rayquaza marking lines visible (yellow circles + lines pulsating gold)
- ✅ Clouds rise (BG1VOFS via `gBattle_BG1_Y`)
- ✅ "APPUYEZ SUR START" + "© 2005 GAMEFREAK inc." FR
- ✅ Logo shine sweep (3 sprites SHINE_MODE_SINGLE/DOUBLE)
- ✅ Logo zoom via `PanFadeAndZoomScreen` 1:1 décomp
- ✅ `UpdateLegendaryMarkingColor` 1:1 (BG_PLTT_ID(14)+15 cycle Cos)
- ✅ Music `mus_title.mid` (MUS_TITLE=413 ajouté au mapping)
- ✅ Sprite callbacks Title (Version banner slide, Press Start blink, Logo shine) registered dans `GameScene.spriteCallbacks`

### Scene 1 (1:1 GBA)
- ✅ BG charBase view 16KB → 32KB (= mountains + grass + leaves rendus, plus de bande noire)
- ✅ Sprite anim END terminator persistance (= ripple shape switch quand drop hits water)
- ✅ `LoadPalette*/CpuCopy16` sync `gPlttBufferUnfaded` (= ripple white visible)
- ✅ Drop slide + dangle + fall + ripple animations
- ✅ Big drop, small drops, sparkles, GAME FREAK letters, Game Freak logo (blue per décomp)

### Refactor majeur : extraction PNG
- **Problème** : notre extraction via canvas.drawImage convertit PNG indexed → RGBA → on perd info d'index quand 2 entries PLTE ont la même couleur RGB. Ex : rayquaza.png entries 11 (body) et 15 (marking) sont tous deux `RGB(0,74,98)` mais doivent être DISTINGUÉS (le décomp `UpdateLegendaryMarkingColor` cycle entry 15 → marking gold pulsant).
- **Fix** : `scripts/extract-png-indexed-tiles.mjs` parse IDAT PNG directement (zlib inflate + filter unfiltering + bitDepth-aware unpacking) → `.4bpp.bin` / `.8bpp.bin` préservant les indices originaux.
- **Batch** : `scripts/extract-all-tile-bins.mjs` réextrait 37 PNGs (title + intro Scene 1/2/3).
- **Loader runtime** : `loadTileBin(url, bpp)` fetch le `.bin` direct (= bypass canvas).

---

## Bugs résiduels Phase 5+

### Visuel intro à finir
1. **Scene 3 Groudon/Kyogre** — Task_Scene3_LoadGroudon partial, sprites pas créés
2. **Press Start banner palette** — sprites OK mais palette OBJ silhouette noire occasional
3. **GAME FREAK letters fade-in** — Task_BlendLogoIn / OBJ_BLEND mode pas pleinement supporté par notre compositor
4. **Display 30fps** au lieu de 60fps — game logic interne 60fps OK (vérifié), mais browser/Phaser raf throttle le rendu. Acceptable pour le moment.

### Bugs runtime
5. **Curseur ♥ dialogue traîne dans Main Menu** — affichage erroné d'un curseur fin-dialogue
6. **OAM slots exhausted** Scene 1 (= Task_CreateSparkles boucle ?)
7. **Aliases transpileur scope tracking** Task_Scene3_Groudon (`tTimer = data[5]` mal mappé à `data[7]`)

### Birch Speech (= prochaine étape jeu)
8. **Birch BGs invisibles** — `Task_NewGameBirchSpeech_Init` reach mais init BG/sprites incomplet

---

## Phases planifiées

- **Phase 0-3 [DONE]** : Boot loop unique + Action 4 audit
- **Phase 4 [DONE session 68]** : Merge AI work + DmaFill16 no-op + boot complet jusqu'à Birch
- **Phase 5 [DONE session 69]** : Polish intro visuel — Title + Scene 1 1:1 GBA, fixes profonds (PNG IDAT extractor, charBase 32KB, LoadPalette unfaded sync, sprite anim END persistence)
- **Phase 6 [DONE session 70]** : Scene 2 1:1 GBA — fix transpileur `0x7F` → `0x7`, register `SpriteCB_Bicycle` / `SpriteCB_FlygonRightHalf` / `Task_BicycleBgAnimation`, implement `sSpriteSheet_RunningPokemon` + `sSpritePalettes_RunningPokemon` (Volbeat/Torchic/Manectric)
- **Phase 7 (next)** : Scene 3 polish (Groudon/Kyogre/Rayquaza) + Birch Speech BGs/sprites
- **Phase 8** : Naming Screen (clavier FR + ♥/♦ symbols)
- **Phase 9** : Overworld via opcodes décomp + script-runner
- **Phase 10** : Battle via bridge `@pkmn/sim` + UI Tasks transcrites

---

## Outils disponibles

- **Claude Preview Tool** : preview_start + preview_click + preview_screenshot + preview_eval pour debug live frame-by-frame
- **`window.dev`** : devtools `pause/resume/step/seek/speed/sprites/tasks/bgs` + `?pause` query param pour démarrer pausé
- **`window.debug`** : `rt`, `gba`, `lz77Trace`, `assetCache`, `cacheKeys()`, etc.
- **DebugOverlayScene** : overlay fps/frame/tasks/sprites en temps réel

## Sources non encore lues

- `include/gba/macro.h` (DMA macros, BGCNT_*, OAM_DATA helpers)
- `Makefile` + `audio_rules.mk` + `spritesheet_rules.mk`
- `ld_script.ld` (layout VRAM/EWRAM/IWRAM)
- `tools/preproc/` (préprocesseur dialogues `_("text")`)
- `D:/Projet 1/gen3src/RS/source/cyc_demo.c` etc. (= comprendre architecture R/S)

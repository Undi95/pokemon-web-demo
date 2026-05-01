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
| Scene 3 | Pokeball + Groudon (red dirt) + Kyogre (blue water) + Rayquaza + Orb attack ✅ | **1:1 GBA** session 70 phase 7 |
| Title | Logo + Rayquaza marking pulsant + clouds rise + Press Start ✅ | **1:1 GBA** |
| Main Menu | NOUVELLE PARTIE + OPTION en FR ✅ | bug ♥ curseur dialogue traîne |
| Birch | `Task_NewGameBirchSpeech_Init` reach | ⚠️ BGs invisibles |
| **Audio session 71** | Multi-slot BGM/SE1/SE2 + cris OK + render order 1:1 | ⚠️ SE noise = approximation (white noise + biquad ≠ GBA LFSR), à fix avant écran titre |

### Architecture en place

- **Engine GBA pixel-perfect** (`src/engine/gba/`) : BG/OAM/palette/blend/windows/affine/mosaic, VRAM unifié 96KB
- **Engine M4A audio 1:1** (`src/engine/m4a/`) : ADSR/LFO/reverb/sample loop, validé 987/987 notes propre
- **DecompRuntime** (`decomp-runtime.ts`) : `gMain.callback2` + `gTasks` + `gSprites` + `spriteCallbacks` Map + `tickFixed` 60Hz (vérifié 60.0 fps logic)
- **Devtools** (`window.dev`) : `pause/resume/step(N)/seek(frame)/back(N)/speed/sprites/tasks/bgs/info/vram/ovram/palBank/palDiff/bgVisible/objHide/affineMat/windows/blend` + `?pause`/`?seekTo=N` query params
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
- **Phase 7 [DONE session 70]** : Scene 3 1:1 GBA — Pokeball/Groudon/Kyogre/Rayquaza/Orb visibles. Fixes profonds : affine matrix sign-extend + `(texX << 8)` bug + tilemap names swap + gbagfx grayscale invert (`15-x`) + BG text negative hofs/vofs JS modulo + custom color fade (`RGB(9,10,10)`) + ScanlineEffect state=3 cleanup + devtools étendus.
- **Phase 7.5 [DONE session 71]** : Polish audio + render order 1:1 décomp.
  - **M4A multi-slot** : `_currentPlayback` global → `_slots: { bgm, se1, se2 }` (1:1 `gMPlayInfo_BGM/SE1/SE2` cf src/m4a.c:13-21). PlaySE alterne se1/se2 (1:1 src/sound.c:577-598). Plus de coupure BGM par SE.
  - **Generation counter** par slot dans `m4a/player.ts` : invalide les `endTimer` pending → empêche micro-replay de loop entre 2 BGMs.
  - **MUS_INTRO loop=false 1:1** : pas de markers `[]` dans le `.mid` → mid2agb génère `ply_fine` = one-shot. Notre loop=true forçait un audible micro-replay avant scene 3.
  - **Render order 1:1** : `runOneFrame` réordonné `RunTasks → AnimateSprites → BuildOamBuffer → UpdatePaletteFade` (= MainCB2_Intro src/intro.c:1042-1052).
  - **runTasks linked-list 1:1** : ancien snapshot `Array.from(gTasks)` empêchait les nouvelles Tasks créées pendant l'iteration de tourner même frame. Fix iteration dynamique avec Set des visited (= 1:1 src/task.c:RunTasks linked-list `.next`). Résout le **flicker du logo Game Freak** : Task_BlendLogoIn créé frame 128 par Task_Scene1_WaterDrops tourne maintenant même frame → BLDCNT pour alpha-blend set AVANT le premier render visible du logo.
  - **PlayCryInternal/PlaySE wired 1:1** : SPECIES_GROUDON/KYOGRE/RAYQUAZA = 405/404/406 (cf species.h). PlaySE via SONG_ID_TO_NAME (532 entries extraits de songs.h via `extract-song-table.mjs`).
  - **selectedPalettes mask** dans `_applyPaletteFadeStep` : respect de `BeginNormalPaletteFade(... & ~0x21, ...)` 1:1 (palette.c:436-454).
  - **CpuCopy16 heuristique** : count==1 → Faded seul (sprite cb dynamic), count>=2 → both (bulk init).
  - **Cache-bust dev** : `window.fetch` monkey-patch en dev → `?_cb=<bootTimestamp>` sur URLs locales. Évite les bugs cache stale en test.
  - **Bug résiduel** : PlaySE joue le MAUVAIS son (architecture multi-slot OK, voicegroup OK, mais notre noise emulation utilise white noise + biquad lowpass au lieu du LFSR GBA 1:1) → Phase 7.6 prochaine.
- **Phase 7.6 (next)** : LFSR-accurate GBA noise emulation pour PlaySE 1:1. Le menu post-title aura plein de SE (bip à chaque touche, etc) — fix avant écran titre obligatoire.
- **Phase 8** : Birch Speech BGs/sprites (= Task_NewGameBirchSpeech_Init reach)
- **Phase 9** : Naming Screen (clavier FR + ♥/♦ symbols)
- **Phase 10** : Overworld via opcodes décomp + script-runner
- **Phase 11** : Battle via bridge `@pkmn/sim` + UI Tasks transcrites

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

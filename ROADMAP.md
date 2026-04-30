# Roadmap — Pokémon Émeraude Web 1:1 GBA

> **Source de vérité** : la décompilation `D:\Projet 1\decomps\pokeemeraude`.
> **Référence architecture** : sources Nintendo R/S `D:\Projet 1\gen3src\RS\source` (= comprendre, **PAS copier 1:1**).
> **Directive** : 1:1 GBA. ZÉRO hardcode. AUCUN pré-rendu PNG. Aucun ROM.
> **Tout passe par le boot loop** `gMain.callback2 + RunTasks + AnimateSprites + BuildOamBuffer` (1:1 `AgbMain` décomp).

---

## État fin session 68 (Phase 4)

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
| Scene 1 | BG leaves + drops + letters | ⚠️ partial (sprites affine bug) |
| Scene 2 | Sprites May/Flygon/Manectric/Volbeat ✅ | ⚠️ BG bike road ❌ |
| Scene 3 | Clouds bleus + lightning ✅ | ⚠️ Groudon/Kyogre partial |
| Title | Logo POKÉMON™ + Rayquaza + clouds ✅ | ⚠️ Press Start sprite palette ❌ |
| Main Menu | NOUVELLE PARTIE + OPTION en FR ✅ | bug ♥ curseur dialogue traîne |
| Birch | `Task_NewGameBirchSpeech_Init` reach | ⚠️ BGs invisibles |

### Architecture en place

- **Engine GBA pixel-perfect** (`src/engine/gba/`) : BG/OAM/palette/blend/windows/affine/mosaic, VRAM unifié 96KB
- **Engine M4A audio 1:1** (`src/engine/m4a/`) : ADSR/LFO/reverb/sample loop, validé 987/987 notes propre
- **DecompRuntime** (`decomp-runtime.ts`) : `gMain.callback2` + `gTasks` + `gSprites` + `spriteCallbacks` Map + `tickFixed` 60Hz
- **decomp-globals** (`decomp-globals.ts`) : helpers décomp (`LZ77UnCompVram`, `LoadPalette`, `DmaFill16` no-op, etc.) + `assetCache` + symbol-name strings
- **copyright-boot** (`copyright-boot.ts`) : 1:1 `CB2_InitCopyrightScreenAfterBootup` + `SetUpCopyrightScreen` state machine + `MainCB2_Intro`
- **gba-text/window/menu-system** : Main Menu Pokémon Émeraude FR
- **Transpileur C→TS** + post-transpile-patches.mjs : 1632/1648 callbacks (99%) + patches manuels auto-injectés
- **Boot loop unique** : `GameScene` (host Phaser canvas) + `TestGbaScene` (sanity engine)

---

## Bugs résiduels Phase 5+

### Visuel intro à finir
1. ~~**Title Rayquaza/clouds invisible**~~ ✅ FIXED session 69 : `gTitleScreenBgPalettes` doit concaténer `pokemon_logo.gbapal` + `rayquaza_and_clouds.gbapal` (1:1 décomp `graphics.c:1508` INCBIN double). Bank 14 venait du second fichier.
2. **Title Press Start banner** — sprites visibles mais palette OBJ noire (= sprite sheet tile data OK, sprite palette pas mappée)
3. **Scene 1 letters GAME FREAK** — sprite affine matrix XXL bug (= sAffineAnim_GameFreak_GrowAndShrink frame 0 init xScale=16, runtime affine pas exact)
4. **Scene 2 BG bike road** — `SetIntroPart2BgCnt(1)` impl 1:1 mais BGs toujours invisibles (= probable VRAM not survival entre Scene 1 → Scene 2)
5. **Scene 3 Groudon/Kyogre/Rayquaza** — Task_Scene3_LoadGroudon fait `LZDecompressVram(gIntroGroudon_Gfx)` mais asset pas preloadé

### Bugs runtime
6. **Curseur ♥ dialogue traîne dans Main Menu** — affichage erroné d'un curseur fin-dialogue
7. **OAM slots exhausted** Scene 1 (= Task_CreateSparkles boucle ?)
8. **Aliases transpileur scope tracking** Task_Scene3_Groudon (`tTimer = data[5]` mal mappé à `data[7]`)

### Birch Speech (= prochaine étape jeu)
9. **Birch BGs invisibles** — `Task_NewGameBirchSpeech_Init` reach mais init BG/sprites incomplet

---

## Audit AI session 68 phase 4 (AUDIT_BOOT.md)

L'AI externe avait identifié 8 écarts critiques, dont les principaux DÉJÀ FIXED :
- ✅ #1 MainCB2 implémenté (no-op stub car tickFixed gère tout)
- ✅ #2 Main Menu BG0_ON setup correct via gba-menu-system
- ✅ #5 VBlankCB avec TransferPlttBuffer
- ⏳ #6 Stubs visuels (StartPokemonLogoShine, ScanlineEffect_InitWave, PanFadeAndZoomScreen) — Phase 5
- ⏳ #7 Transitions TODO (CB2_NewGame fully wired but BGs init incomplete) — Phase 5
- ⏳ #8 Birch Speech assets preload — Phase 5

### Fix critique session 68 phase 4
**`DmaFill16` no-op** : le décomp call pour clear VRAM avant nouvelle scene effaçait nos LZ77 char data juste chargés. Notre engine init VRAM zero au startup, pas besoin du clear. Résultat : Scene 3 + Title visuels débloqués.

---

## Phases planifiées

- **Phase 0-3 [DONE]** : Boot loop unique + Action 4 audit (audio, sprites, BG, palette)
- **Phase 4 [DONE session 68]** : Merge AI work + DmaFill16 no-op + boot complet jusqu'à Birch
- **Phase 5 (next)** : Polish intro visuel — Rayquaza/clouds Title + Press Start sprites + Scene 1 letters affine + Scene 2 BG + Scene 3 visuel complet
- **Phase 6** : Birch Speech complet (BG + Brendan/May/Birch/Lotad sprites + dialogue FR)
- **Phase 7** : Naming Screen (clavier FR + ♥/♦ symbols)
- **Phase 8** : Overworld via opcodes décomp + script-runner
- **Phase 9** : Battle via bridge `@pkmn/sim` + UI Tasks transcrites

---

## Outils disponibles

- **Claude Preview Tool** (Phase 4) : preview_start + preview_click + preview_screenshot + preview_eval pour debug live frame-by-frame
- **`window.debug`** exposé : `rt`, `gba`, `lz77Trace`, `assetCache`, `cacheKeys()`, etc.
- **DebugOverlayScene** : overlay fps/frame/tasks/sprites en temps réel
- **`localStorage.rtDebug = '1'`** : active logs CreateSprite/palette/sheet du runtime

## Sources non encore lues

- `include/gba/macro.h` (DMA macros, BGCNT_*, OAM_DATA helpers)
- `Makefile` + `audio_rules.mk` + `spritesheet_rules.mk`
- `ld_script.ld` (layout VRAM/EWRAM/IWRAM)
- `tools/preproc/` (préprocesseur dialogues `_("text")`)
- `D:/Projet 1/gen3src/RS/source/cyc_demo.c` etc. (= comprendre architecture R/S)

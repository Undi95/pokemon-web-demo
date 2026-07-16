# fix — port 1:1 `field_screen_effect.c` + purge rustine `flash-mask`

**Date** : 2026-07-16 · **Branche** : `Opus-v2` · **tsc** : `0` erreur.

Débloqué par la vague A scanline (WIN0H routé vers les vrais registres via
`src/scanline_effect.ts` → `rt.SetGpuReg`). La note de dette « flash-mask.ts laissé
(field_screen_effect.c à porter) » est **soldée**.

---

## 1. Chaîne de rendu FLASH (vérifiée, 1:1)

Le décomp fait la pénombre de grotte par **fenêtre WIN0 par-scanline** (pas un masque
post-process). Chaque couche du port était déjà en place SAUF l'armement du scanline :

| Couche | État | Réf |
|---|---|---|
| Compositor rend WIN0 par-scanline (`hblankCallback(y)` → `win0.x1/x2`) | ✅ existant | `harness/gba/compositor.ts:268`, `:358-400` |
| Runtime route WIN0H→win0.x1/x2, WININ→win0Inside, WINOUT→winOut, DISPCNT_WIN0_ON→win0.enabled | ✅ existant | `harness/runtime/decomp-runtime.ts:909/1048/1059/916/986` |
| `InitOverworldGraphicsRegisters` pose WININ/WINOUT/DISPCNT_WIN0_ON au map load | ✅ existant | `src/overworld.ts:1124` (1:1 overworld.c:2096) |
| `scanline_effect.ts` (SetParams/InitHBlankDmaTransfer/Stop/Clear) tick chaque VBlank | ✅ existant (1:1) | `src/scanline_effect.ts` |
| **`WriteFlashScanlineEffectBuffer` + `SetFlashScanlineEffectWindowBoundaries` + `sFlashEffectParams`** | ✅ **porté par moi** | `src/field_screen_effect.ts` |
| **`InitCurrentFlashLevelScanlineEffect` armé au map load** | ✅ **câblé par moi** | `src/overworld.ts` + `harness/scenes/TestOverworldScene.ts:1503` |
| **`AnimateFlash` branché sur l'opcode `animateflash`** | ✅ **câblé par moi** | `src/scrcmd.ts:740` |

**Byte order vérifié** : `SetFlashScanlineEffectWindowBoundary` écrit `(left<<8)|right` ;
`applyWin0H` lit high-byte=x1(left), low-byte=x2(right) → cercle rendu correct.

INTÉRIEUR WIN0 = tous BG visibles (map) ; EXTÉRIEUR = WINOUT = BG0 seul (vide en grotte
→ noir). WIN0V reste plein écran (0xFF), seul WIN0H varie par scanline → cercle.

---

## 2. Inventaire des 77 fonctions du `.c`

### Portées par moi dans `src/field_screen_effect.ts` (~30)
- **Data** : `sFlashLevelToRadius`, `gMaxFlashLevel`, `sFlashEffectParams` (dmaControl =
  marqueur `SCANLINE_EFFECT_DMACNT_16BIT` — le C n'a pas le flag DMA_16BIT donc == ce marqueur).
- **Fades** : `FillPalBufferWhite/Black` (ré-export decomp-globals), `FadeInFromWhite`, `FadeInFromBlack`.
- **FLASH** : `SetFlashScanlineEffectWindowBoundary(ies)`, `SetOrbFlashScanlineEffectWindowBoundary(ies)`,
  `WriteFlashScanlineEffectBuffer`, `WriteBattlePyramidViewScanlineEffectBuffer`,
  `UpdateFlashLevelEffect`, `UpdateOrbFlashEffect`, `Task_WaitForFlashUpdate`,
  `StartWaitForFlashUpdate`, `StartUpdateFlashLevelEffect`, `StartUpdateOrbFlashEffect`, `AnimateFlash`.
- **ORBE (dette climax)** : `LoadOrbEffectPalette`, `UpdateOrbEffectBlend`, `Task_OrbEffect`,
  `DoOrbEffect`, `FadeOutOrbEffect`.
- **Script/continuation** : `WaitForWeatherFadeIn`, `Task_WaitForFadeAndEnableScriptCtx`,
  `FieldCB_ContinueScriptHandleMusic`, `FieldCB_ContinueScript`.
- **Dispatch warp exit** : `getExitTaskKindFor` (= partie 1:1 de `SetUpWarpExitTask`), `getMetatileBehaviorAtPlayerPos`.
- **`GetFlashLevel`** (origine overworld.c:988, placée ici pour éviter le cycle) = `gSaveBlock1Ptr->flashLevel`.

### Déjà présentes (conservées à l'identique)
`sFlashLevelToRadius`, `FadeInFromBlack`, `WaitForWeatherFadeIn`,
`Task_WaitForFadeAndEnableScriptCtx`, `FieldCB_ContinueScriptHandleMusic`,
`getExitTaskKindFor`, `getMetatileBehaviorAtPlayerPos`.

### Portées AILLEURS — à consolider (NON dupliquées)
- **`FieldCB_ReturnToFieldOpenStartMenu`** → `src/overworld.ts:1182` (avec le flow return-to-field). OK.
- **Warps** (`DoWarp`, `DoDiveWarp`, `DoDoorWarp`, `DoFallWarp`, `DoTeleportTileWarp`,
  `DoEscalatorWarp`, `DoMossdeepGymWarp`, `DoWhiteFadeWarp`, `DoLavaridgeGym1F/B1FWarp`,
  `DoContestHallWarp`, `DoPortholeWarp`, `DoSpinExitWarp`) + leurs tasks (`Task_WarpAndLoadMap`,
  `Task_DoDoorWarp`, `Task_ExitDoor/NonAnimDoor/NonDoor`, `Task_SpinExitWarp`…) :
  **le port utilise une adaptation harness (`setPendingWarp`/`executeWarp`, scène MainCB2)** —
  les warps **marchent en jeu** via ce chemin. NON re-portés (aurait dupliqué/cassé). Dette long
  terme : re-transcrire les `Task_*Warp` 1:1 pour remplacer l'adaptation.

### Non portées — hors scope solo / deps absentes
- **Link/multi** : `Task_ReturnToFieldCableLink`, `Task_ReturnToFieldWirelessLink`,
  `Task_ReturnToFieldRecordMixing`, `FieldCB_ReturnToFieldCableLink/WirelessLink`,
  `Task_ReturnToWorldFromLinkRoom`, `ReturnFromLinkRoom`, `DoCableClubWarp`,
  `FieldCB_ContinueScriptUnionRoom`, `Task_WaitForUnionRoomFade`.
- **Warp-adaptation territory** : `WarpFadeInScreen`/`WarpFadeOutScreen` (deps
  GetMapPairFadeType absentes), `FieldCB_DefaultWarpExit`, `FieldCB_WarpExitFadeFromWhite/Black`,
  `FieldCB_SpinEnterWarp`, `FieldCB_MossdeepGymWarpExit`, `SetPlayerVisibility`,
  `SetUpWarpExitTask` (partie CreateTask), `Task_ReturnToFieldNoScript`,
  `FieldCB_ReturnToFieldNoScript(CheckMusic)`, `ReturnToFieldOpenStartMenu`,
  `Task_WaitForFadeShowStartMenu`, `PaletteFadeActive`, `Script_FadeOutMapMusic`,
  `Task_EnableScriptAfterMusicFade`, `DoSpinEnterWarp`.

---

## 3. Sort de la rustine `flash-mask` : **PURGÉE** ✅

- `harness/gba/flash-mask.ts` — **supprimé**.
- `harness/runtime/decomp-globals.ts` — `import '../gba/flash-mask'` retiré.
- `harness/gba/phaser-bridge.ts` — appel `applyFlashMask(fb)` post-process retiré (tick).
- `src/field_screen_effect.ts` — pont `__sFlashLevelToRadius` retiré (n'était lu que par la rustine).
- `src/scrcmd_flash.ts` — `makeAnimateFlashPoll` (lerp du masque) supprimé ; `SetFlashLevel`
  écrit désormais `gSaveBlock1Ptr->flashLevel` (1:1 overworld.c:981) au lieu de `globalThis.gFlashLevel`.
- `src/scrcmd.ts` — opcode `animateflash` rebranché sur `AnimateFlash` (réel, via pont).

Remplacement **complet** au niveau code (toutes les couches câblées). Le remplacement
est architecturalement équivalent et 1:1.

---

## 4. Comment tester (EN JEU — non fait ici, mission = pas de navigateur)

### FLASH — pénombre de grotte
1. Entrer une map `cave` (json `requires_flash`) : ex. **Grotte de Granit** (Granite Cave) B1F/B2F,
   Tunnel Rustboro, Grotte Météore. Attendu : écran noir avec **petit cercle de vision**
   (~24px) centré sur le joueur qui se déplace.
2. **Anim FLASH (CS05)** : apprendre Flash à un mon + badge requis → utiliser depuis le menu
   équipe → le cercle **s'agrandit** (rayon 24→72). Script joué = `EventScript_UseFlash`
   (`animateflash 1` → `AnimateFlash`, puis `setflashlevel 1`).
3. **Debug console** (sans grotte réelle) : `window.__SetFlashLevel(7)` puis recharger la map
   (warp out/in) → `InitCurrentFlashLevelScanlineEffect` réarme le scanline au load.
   Sonde : `window.__rt.gba.windows.win0` (x1/x2 doivent varier par scanline sous le compositor).

### Task_OrbEffect (Orbe Rouge/Bleu — réveil Groudon/Kyogre)
- Déclenché par le special **`DoOrbEffect`** (scripts Grotte Origine / climax Atalanopolis),
  puis `FadeOutOrbEffect` pour clore.
- **Debug** : poser `VAR_RESULT` (0=rouge/Groudon centre 104, 1=bleu/Kyogre centre 136,
  2=rouge/120, autre=bleu/120) puis exécuter le special :
  `window.__byteVm.special('DoOrbEffect')` → écran clignote/tremble + teinte + cercle Orbe ;
  `window.__byteVm.special('FadeOutOrbEffect')` → fondu de sortie plein écran teinté.

---

## 5. Risques / à surveiller (⚠️ NON TESTÉ EN JEU)

1. **FLASH cave/anim** : chaîne vérifiée couche par couche (compositor + runtime + scanline
   1:1 + InitOverworldGraphicsRegisters actif), mais **rendu jamais vu** (mission interdit
   navigateur). Test en jeu = étape obligatoire suivante. Si régression : le scanline effect
   est stoppé aux transitions combat (`battle_transition.ts` ScanlineEffect_Stop) → pas de
   bavure sur le combat.
2. **Task_OrbEffect** : porté 1:1 complet mais **dep `SetBgTilemapPalette` absente du runtime**
   (vit dans `pokemon_summary_screen.ts`, interdit). Accès via pont `globalThis.__SetBgTilemapPalette`
   **actuellement non posé** → l'étape de teinte BG0 palette-15 est **skip** (console.error, pas
   de crash) ; le reste (blend + cercle scanline + tremblement caméra) tourne. Pour compléter :
   exposer `__SetBgTilemapPalette` depuis bg.c. Feature climax rare → test dédié requis.
3. **Transition combat FLASH** : `globalThis.GetFlashLevel` désormais exposé → en grotte les
   combats prennent `TRANSITION_TYPE_FLASH` (→ B_TRANSITION_BLUR/GRID_SQUARES, **portées**).
   C'était un wire anticipé (`battle_setup.ts:1505` « défaut sûr en attendant »). 1:1, mais
   nouveau comportement observable à valider.
4. **Devtools périmé** : `harness/devtools/dev-bytevm-tools.ts:811` teste `globalThis.gFlashLevel`
   (que je n'écris plus — source = save block). Le test affichera `undefined`. Fichier **interdit**
   (devtools) → non corrigé ; cosmétique, hors runtime jeu.

---

## 6. Fichiers touchés

- `src/field_screen_effect.ts` (réécrit, cœur du port + ponts globalThis).
- `src/overworld.ts` (+`InitCurrentFlashLevelScanlineEffect` 1:1 ; commentaires SetDefaultFlashLevel).
- `harness/scenes/TestOverworldScene.ts` (appel InitCurrentFlashLevelScanlineEffect avant InitOverworldGraphicsRegisters).
- `src/scrcmd_flash.ts` (SetFlashLevel→save block ; purge makeAnimateFlashPoll).
- `src/scrcmd.ts` (opcode animateflash→AnimateFlash).
- `src/engine/script/specials-registry.ts` (DoOrbEffect/FadeOutOrbEffect : stub→réel).
- `src/fldeff_flash.ts` (commentaires).
- `harness/gba/phaser-bridge.ts` (retrait consommateur flash-mask).
- `harness/runtime/decomp-globals.ts` (retrait import flash-mask).
- `harness/gba/flash-mask.ts` — **SUPPRIMÉ**.

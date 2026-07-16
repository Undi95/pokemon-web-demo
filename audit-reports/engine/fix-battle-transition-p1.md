# battle_transition.c — PHASE 1 : charpente 1:1 (foyer réel)

**Fichier** : `src/battle_transition.ts` (append-only, bloc « CHARPENTE 1:1 » à partir de la l.1018).
**État** : INERTE (non câblé) — `npx tsc --noEmit` = 0 sur battle_transition.ts · audit-transpiler-pitfalls = 0 nouveau finding · find-import-cycle = pas de cycle nouveau impliquant battle_transition.

---

## 1. Contexte — l'existant (avant ce tour)

`src/battle_transition.ts` (bloc « bespoke », l.1-1000) contenait des **modules par-transition** au contrat maison `startBattleTransitionX()` / `tickBattleTransitionX(): boolean`, consommés par un **shim dispatcher** dans
`src/engine/battle/battle-decomp-loop.ts:261 _makeBattleStartTransitionCB2` (state-machine 0/1/2 maison, fallback SLICE), lui-même posé par
`battle-decomp-loop.ts:740  SetMainCallback2(_makeBattleStartTransitionCB2(cb, transition))`.

C'est un chemin **validé A/B mais improvisé** (pas la vraie machine à tâches décomp). Transitions bespoke présentes : Slice, WhiteBarsFade, PokeballsTrail, AngledWipes, Blur, Swirl, Shuffle + IntroFlash.

Sélection de la transition (déjà 1:1) : `battle_setup.ts` `GetWildBattleTransition` / `GetTrainerBattleTransition` + tables `sBattleTransitionTable_Wild/Trainer` + `GetBattleTransitionTypeByMap`.

**Transitions demandées par le jeu solo** (tables battle_setup) :
- Wild : NORMAL=Slice/WhiteBarsFade · CAVE=ClockwiseWipe/GridSquares · FLASH=Blur/GridSquares · WATER=Wave/Ripple
- Trainer : NORMAL=PokeballsTrail/AngledWipes · CAVE=Shuffle/BigPokeball · FLASH=Blur/GridSquares · WATER=Swirl/Ripple

---

## 2. Charpente portée (foyer réel, 1:1) — INERTE

Transcription ligne-à-ligne du **coeur** de `battle_transition.c` (task machine réelle via `CreateTask`/`gTasks`/`DestroyTask`/`FindTaskIdByFunc`, pattern `_coreCreateTask` = wrapper `(t)=>fn(t.taskId)` + tag `funcRef`, cf. field_screen_effect.ts:118) :

| Élément décomp | ligne .c | statut |
|---|---|---|
| `struct TransitionData` (+ alloc/free) | :55 | ✅ `CoreTransitionData` (`data[11]` wipe → `wipe: BlackWipeData`) |
| `BattleTransition_Start` / `BattleTransition_StartOnField` | :1026/:1032 | ✅ exportées |
| `IsBattleTransitionDone` | :1041 | ✅ (garde TASK_NONE) |
| `LaunchBattleTransitionTask` | :1056 | ✅ |
| `Task_BattleTransition` + `sTaskHandlers` | :1063/:393 | ✅ |
| `Transition_StartIntro/WaitForIntro/StartMain/WaitForMain` | :1068-1111 | ✅ |
| `Task_Intro` | :1116 | ✅ |
| `CreateIntroTask` / `IsIntroTaskDone` / `Task_BattleTransition_Intro` | :3968-3990 | ✅ |
| `TransitionIntro_FadeToGray/FadeFromGray` + `sTransitionIntroFuncs` | :3992-4036 | ✅ (RGB(11,11,11)=`RGB_INTRO_GRAY`) |
| `InitTransitionData` | :4050 | ✅ (GetCameraOffsetWithPan) |
| `VBlankCB_BattleTransition` | :4056 | ✅ (LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer → équiv. runtime best-effort) |
| `FadeScreenBlack` | :4082 | ✅ (réutilise `_fadeScreenBlack` :195) |
| `SetSinWave` | :4087 | ✅ (réutilise `_setSinWave` :865) |
| `SetCircularMask` | :4094 | ✅ (nouveau — prêt pour PatternWeave/BigPokeball phase 2) |
| `InitBlackWipe` / `UpdateBlackWipe` | :4146/:4173 | ✅ (réutilise :618/:632) |
| tables `sTasks_Intro` / `sTasks_Main` | :340/:347 | ✅ (`sTasks_Main` partielle, voir §3) |

**Adaptations moteur** (précédents cités depuis le bloc bespoke de CE fichier — pas de valeur magique) :
- DMA HBlank-repeat (`DmaSet` → `REG_WIN0H`/`REG_BG0HOFS`) → `rt.gba.setHBlankCallback` lisant `gScanlineEffectRegBuffers[1]` (précédent Slice bespoke:348).
- `DmaCopy16` buffers[0]→[1] → copie JS littérale ; **taille en OCTETS** respectée (`DISPLAY_HEIGHT*2` oct = 160 u16 ; Slice `*4` oct = 320 u16).
- `REG_VCOUNT` (lu par les HBlankCB décomp) → paramètre `y` du callback runtime.
- `struct data[11]` (wipe) → `sTransitionData.wipe`.

---

## 3. Transitions portées en Task_* RÉEL (câblées dans `sTasks_Main`) — INERTES

| B_TRANSITION | Task_* + funcs | rôle solo |
|---|---|---|
| BLUR | `Task_Blur` / `sBlur_Funcs` (Init/Main/End) | wild+trainer FLASH |
| SWIRL | `Task_Swirl` / `sSwirl_Funcs` (Init/End) + VBlank/HBlank | trainer WATER row0 |
| SHUFFLE | `Task_Shuffle` / `sShuffle_Funcs` + VBlank/HBlank | trainer CAVE row0 |
| POKEBALLS_TRAIL | `Task_PokeballsTrail` / `sPokeballsTrail_Funcs` (Init/Main/End) | trainer NORMAL row0 |
| WAVE | `Task_Wave` / `sWave_Funcs` (Init/Main/End) + VBlank/HBlank WIN0H | wild WATER row0 |
| SLICE | `Task_Slice` / `sSlice_Funcs` (Init/Main/End) + VBlank/HBlank | wild NORMAL row0 |
| ANGLED_WIPES | `Task_AngledWipes` / `sAngledWipes_Funcs` (5 états) + VBlank/HBlank | trainer NORMAL row1 |

Chaque VBlankCB_*/HBlankCB_* est transcrit comme **fonction réelle**. PokeballsTrail réutilise l'adaptation fldeff déjà validée du fichier (`_fldEffPokeballTrail`, `SpriteCB_FldEffPokeballTrail`, `_activeTrailBalls`) — le registre fldeff générique n'est pas porté pour cet effet.

### Restantes (phase 2 — `sTasks_Main[...] = null`, warn au lancement)
- **BigPokeball** + **PatternWeave** (Blend1/2/FinishAppear/CircularMask, VBlankCB_PatternWeave/CircularMask) : `SetCircularMask` est déjà porté ; reste le blend BLDALPHA + le feed circulaire WIN0H (partagé avec Aqua/Magma/Regi/FrontierLogoWiggle). — CAVE trainer row1.
- **ClockwiseWipe**, **Ripple**, **GridSquares** : CAVE/WATER wild.
- **WhiteBarsFade** en Task_* réel (sprites invisibles `SpriteCB_WhiteBarFade`) : la version **bespoke** reste branchée et couvre ce cas ; le port réel utilise `CreateInvisibleSprite` non encore transcrit → phase 2.
- Hors solo (phase 2/exemptions) : Mugshots (Sidney/Phoebe/Glacia/Drake/Champion), légendaires (Kyogre/Groudon/Rayquaza/Regis), Aqua/Magma, ShredSplit, Blackhole(+Pulsate), RectangularSpiral, tout Frontier.

---

## 4. Câblage — NON basculé (laissé INERTE, point de bascule documenté)

Le foyer réel est exposé sur `globalThis.__battleTransitionCore = { BattleTransition_Start, BattleTransition_StartOnField, IsBattleTransitionDone }`. Le chemin bespoke reste **le seul branché** → zéro régression combat.

### ██ POINT DE BASCULE ██ (1 endroit, à faire + tester EN JEU par la session principale)
`src/engine/battle/battle-decomp-loop.ts:740` — remplacer :
```ts
getRuntime()?.SetMainCallback2?.(_makeBattleStartTransitionCB2(cb, transition) as never);
```
par un CB2 réel qui :
1. `BattleTransition_StartOnField(transition)` (ou `LaunchBattleTransitionTask(transition)`),
2. par frame : `RunTasks()` + `AnimateSprites()` + `BuildOamBuffer()` + `UpdatePaletteFade()`,
3. quand `IsBattleTransitionDone()` → `CleanupOverworld` + `SetMainCallback2(cb)`.

**À valider au bascule** :
- Le runtime doit invoquer le callback posé par `SetVBlankCallback` (sinon router la copie buffers[0]→[1] dans le tick, comme le fait le bespoke).
- `CB2_OverworldBasic` doit être résolvable (StartOnField le pose sur `gMain.callback2` via surface globale, sinon warn).
- `VBlankCB_BattleTransition` (LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer) : mappage OAM/palette runtime à confirmer.
- Garde-fou asset PokeballsTrail (fetch async vs CpuSet sync).

Tant que ces points ne sont pas validés A/B, **garder le bespoke en fallback**.

---

## 5. Vérifs
- `npx tsc --noEmit` : 0 erreur sur `battle_transition.ts` (les erreurs `item_use.ts` sont d'un agent concurrent, hors périmètre).
- `node scripts/audit-transpiler-pitfalls.cjs` : 0 finding sur battle_transition (les 3 (c) sont pré-existants dans pokenav_ribbons_summary.ts).
- `node scripts/find-import-cycle.cjs` : aucun cycle nouveau impliquant battle_transition.

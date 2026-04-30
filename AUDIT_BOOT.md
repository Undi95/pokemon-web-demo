# Audit Boot Flow — Crédits → New Game

> Date : 2026-04-29
> Sources : `../decomps/pokeemeraude/src/{main,intro,title_screen,main_menu}.c`
> Cible : `D:\Projet 1 - Copie\pokemon-web-demo/src/`

---

## 1. Synthèse des écarts critiques

| # | Écart | Localisation | Impact | Fix estimé |
|---|-------|--------------|--------|------------|
| 1 | **`MainCB2` non implémenté** | `title_screen-callbacks-auto.ts:410` | Le title screen reste bloqué en `CB2_InitTitleScreen` case 5. `Task_TitleScreenPhase1/2/3` ne sont jamais exécutés car le callback2 ne passe pas à `MainCB2`. | 30 min |
| 2 | **Main Menu black screen** | `gba-menu-system.ts` `InitMainMenu` | `DISPCNT` active `BG0_ON` sans tilemap/char data chargé → tile 0 affiché partout (couleur 0 = noir). Le vrai décomp n'active BG0 que plus tard. | 1h |
| 3 | **`ResetTasks()` inefficace** | `title_screen-callbacks-auto.ts:350` | `gTasks.size=2` après `CreateTask(taskId=3)` alors que `ResetTasks()` vient d'être appelé. Une task résiduelle persiste. | 1h |
| 4 | **OAM slots exhausted** | `DecompRuntime.CreateSpriteAtOam` | `nextOamSlot` n'est pas reset dans `ResetSpriteData()` → accumulation entre scènes. | 15 min |
| 5 | **VBlankCB non implémenté** | `title_screen-callbacks-auto.ts` | Le vrai `VBlankCB` appelle `TransferPlttBuffer`, `LoadOam`, `ScanlineEffect_InitHBlankDmaTransfer`. Notre `SetVBlankCallback` est un no-op. | 2h |
| 6 | **Stubs visuels title screen** | `decomp-globals.ts` | `ScanlineEffect_InitWave`, `StartPokemonLogoShine`, `PanFadeAndZoomScreen` sont des stubs. | 2-4h |
| 7 | **Transitions TODO** | `main_menu-callbacks-auto.ts` | `CB2_NewGame`, `CB2_ContinueSavedGame`, `CB2_InitOptionMenu`, etc. sont commentés. | 30 min chacun |
| 8 | **Assets Birch Speech manquants** | `intro-asset-loader.ts` | `sBirchSpeechShadowGfx`, `sBirchSpeechBgMap`, `sBirchSpeechBgPals` non preloadés. | 30 min |

---

## 2. Diagnostic détaillé

### 2.1 Title screen bloqué — `MainCB2` manquant

**C code (`src/title_screen.c:409`) :**
```c
StartPokemonLogoShine(SHINE_MODE_SINGLE_NO_BG_COLOR);
ScanlineEffect_InitWave(0, DISPLAY_HEIGHT, 4, 4, 0, SCANLINE_EFFECT_REG_BG1HOFS, TRUE);
SetMainCallback2(MainCB2);
```

**Notre code (`title_screen-callbacks-auto.ts:410`) :**
```ts
/* TODO scene transition: SetMainCallback2(MainCB2) */;
```

**Conséquence :**
- `gMain.callback2` reste `CB2_InitTitleScreen` pour toujours.
- Case 5 se réexécute à chaque frame (`if (!UpdatePaletteFade())` est vrai après le premier appel).
- `Task_TitleScreenPhase1` est créée en case 2, mais `CB2_InitTitleScreen` case 5 ne fait que répéter `StartPokemonLogoShine` + `ScanlineEffect_InitWave` (stubs).
- **Les tasks tournent dans `runTasks()`, mais le callback2 ne change jamais.**
- Pourquoi les logs `Task_TitleScreenPhase1` n'apparaissent pas ? → probablement car la task résiduelle (#3) écrase ou perturbe l'exécution, ou les logs sont filtrés par le volume massif.

**Fix :**
1. Implémenter `MainCB2` minimal :
```ts
export const MainCB2: CB2Callback = (rt) => {
    rt.runTasks();
    rt.runSpriteCallbacks(); // ou AnimateSprites equivalent
    rt.syncSpritesToOam();
    rt.UpdatePaletteFade();
};
```
2. Décommenter `SetMainCallback2(MainCB2)` dans `CB2_InitTitleScreen` case 5.

### 2.2 Main Menu black screen — `BG0_ON` incorrect

**C code (`src/main_menu.c:609`) :**
```c
SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);
ShowBg(0); HideBg(1);
```

**Notre code (`gba-menu-system.ts`) :**
```ts
rt.SetGpuReg(0x000, 0x2000 | 0x40 | 0x1000 | 0x0100); // WIN0_ON | OBJ_1D_MAP | OBJ_ON | BG0_ON
```

**Conséquence :**
- BG0 est activé mais n'a **ni tilemap ni char data** chargés (seuls les window frame tiles sont chargés, sans tilemap).
- Le tile 0 est affiché partout → couleur 0 de la palette BG = noir.
- Le vrai décomp active BG0 **plus tard**, après avoir chargé le background.

**Fix :**
- Retirer `BG0_ON` du `DISPCNT` initial dans `InitMainMenu`.
- Le backdrop color (palette[0]) sera visible via le compositor quand aucun BG n'est actif.
- Activer BG0 uniquement quand un tilemap de fond est chargé (ou implémenter le chargement du fond).

### 2.3 Task résiduelle — `ResetTasks()` inefficace

**Observation :**
- `[CreateTask] taskId= 3 gTasks.size= 2` dans les logs.
- `ResetTasks()` est appelé en `CB2_InitTitleScreen` case 1.
- `gTasks` devrait être vide après `ResetTasks()`.

**Hypothèses :**
- `ResetTasks` utilise `rt().gTasks.clear()` mais `rt()` retourne le mauvais runtime ? → Non, `setGlobalRuntime` est appelé.
- `ResetTasks` est importé mais une autre fonction l'ombre ? → Non.
- Le log `CreateTask` montre `gTasks.size=2` car `nextTaskId` continue d'incrémenter et `ResetTasks` ne reset pas `nextTaskId` ? → `gTasks.size` est la taille de la Map, pas lié à `nextTaskId`.
- **Hypothèse la plus probable** : `ResetTasks()` clear `gTasks`, mais entre `ResetTasks()` et `CreateTask(Task_TitleScreenPhase1)`, une autre fonction crée une task. Quelle fonction ? `LoadCompressedSpriteSheet` ? Non. `StartPokemonLogoShine` ? Non (stub). `ScanlineEffect_Stop` ? Non. `FreeAllSpritePalettes` ? Non.
- **Hypothèse alternative** : `ResetTasks()` n'est pas appelé car `CB2_InitTitleScreen` case 1 n'est pas exécuté. Pourquoi ? Parce que `gMain.state` n'est pas 1 ? Mais `gMain.state = 1` est set en case 0.

**Investigation nécessaire :**
- Ajouter un log `console.log('[ResetTasks] gTasks cleared, size=', rt().gTasks.size)` dans `decomp-globals.ts`.
- Vérifier si `ResetTasks` est bien appelé et si `gTasks.size` passe à 0.

**Fix immédiat :**
- Dans `ResetTasks()`, ajouter `rt().nextTaskId = 0;` (même si ce n'est pas la cause du `size=2`).
- Dans `DecompRuntime.resetSpriteSystem()`, ajouter `this.nextOamSlot = 0;`.

### 2.4 OAM slots exhausted

**Code actuel (`DecompRuntime.ResetSpriteData`) :**
```ts
ResetSpriteData(): void {
    for (let i = 0; i < 128; i++) this.gba.oam[i].visible = false;
    this.gSprites.clear();
    this.nextOamSlot = 0; // PRESENT
    this.nextSpriteId = 0;
}
```

**Constat :** `nextOamSlot = 0` est déjà présent ! Donc le bug #4 de l'audit est peut-être résolu ou mal identifié.

**Mais** : dans `title_screen-callbacks-auto.ts` case 1, on appelle `rt.ResetSpriteData()` (méthode du runtime) et `FreeAllSpritePalettes()` (importé). La méthode reset bien `nextOamSlot`. Donc le warning "OAM slots exhausted" vient probablement d'une scène antérieure où `ResetSpriteData` n'était pas appelé (avant le fix).

### 2.5 `VBlankCB` et scanline effects

**C code (`src/title_screen.c:VBlankCB`) :**
```c
ScanlineEffect_InitHBlankDmaTransfer();
LoadOam();
ProcessSpriteCopyRequests();
TransferPlttBuffer();
SetGpuReg(REG_OFFSET_BG1VOFS, gBattle_BG1_Y);
```

**Notre code :**
- `SetVBlankCallback` dans `DecompRuntime` : `this.gMain.vblankCallback = _cb;` (no-op si la callback n'est pas appelée).
- Dans `tickFixed`, `gMain.vblankCallback?.()` est appelé ligne 1041.
- Mais `VBlankCB` n'est jamais assigné ! Dans `CB2_InitTitleScreen` case 3 : `/* noop SetVBlankCallback */;` (commenté).

**Fix :**
- Implémenter `VBlankCB` dans `title_screen-callbacks-auto.ts` (ou `decomp-globals.ts`).
- `TransferPlttBuffer` : copier `gPlttBufferFaded` → `gba.palette.bgRgb15` + refresh.
- `LoadOam` : déjà fait par `syncSpritesToOam` + `bridge.tick()`.
- `ScanlineEffect_InitHBlankDmaTransfer` : stub pour l'instant.
- `SetGpuReg(REG_OFFSET_BG1VOFS, gBattle_BG1_Y)` : déjà géré par `UpdateLegendaryMarkingColor` ?

### 2.6 Stubs visuels

- `StartPokemonLogoShine` : crée un sprite `sPokemonLogoShineSpriteTemplate` qui glisse sur le logo. Stub actuel = no-op. → Implémenter `CreateSpriteFromTemplate` + animation.
- `ScanlineEffect_InitWave` : crée une task `TaskFunc_UpdateWavePerFrame` + setup DMA scanline. Stub actuel = retourne 0. → Implémenter le wave effect minimal (déplace BG1HOFS sinusoïdalement).
- `PanFadeAndZoomScreen` : modifie BG2 affines (scale + rotation). Stub = no-op. → Scene 3 Pokeball spin cassé sans ça.

---

## 3. Todo List — Crédits → New Game

### 🔴 Phase 0 — Infrastructure (bloque tout)

- [ ] **P0.1** Fix `ResetTasks()` : ajouter log debug + vérifier que `gTasks.size` passe à 0.
- [ ] **P0.2** Implémenter `MainCB2` minimal et setter dans `CB2_InitTitleScreen` case 5.
- [ ] **P0.3** Fix `InitMainMenu` : retirer `BG0_ON` du DISPCNT initial (conforme au C).
- [ ] **P0.4** Implémenter `VBlankCB` pour title screen (TransferPlttBuffer + BG1VOFS).
- [ ] **P0.5** Vérifier que `pollInput()` fixe (copie `heldKeys`) ne cause pas de régression.

### 🟠 Phase 1 — Title Screen impeccable

- [ ] **P1.1** Implémenter `StartPokemonLogoShine` (sprite shine sur logo).
- [ ] **P1.2** Implémenter `ScanlineEffect_InitWave` minimal (wave sur nuages BG1).
- [ ] **P1.3** Vérifier `Task_TitleScreenPhase1` exécution (logs doivent apparaître).
- [ ] **P1.4** Vérifier `Task_TitleScreenPhase2` transition (bannières Press Start + Copyright).
- [ ] **P1.5** Vérifier `Task_TitleScreenPhase3` input (A/START → fade out → `CB2_GoToMainMenu`).
- [ ] **P1.6** Vérifier le rendu du logo Pokémon, Rayquaza, nuages, bannières version.
- [ ] **P1.7** Vérifier la palette fade (fade in blanc, fade out blanc).

### 🟡 Phase 2 — Main Menu impeccable

- [ ] **P2.1** Charger le background BG0 du menu (tilemap + char data) OU utiliser backdrop color.
- [ ] **P2.2** Vérifier le rendu des fenêtres (WIN0) et des textes (NEW GAME, OPTION, etc.).
- [ ] **P2.3** Vérifier `HighlightSelectedMainMenuItem` (curseur WIN0 vertical).
- [ ] **P2.4** Vérifier la navigation : DPAD_UP/DOWN change la sélection.
- [ ] **P2.5** Vérifier `JOY_NEW(A_BUTTON)` sur NEW GAME → fade out → `CB2_NewGame`.
- [ ] **P2.6** Vérifier `JOY_NEW(B_BUTTON)` retourne au title screen.
- [ ] **P2.7** Vérifier les palettes (bg bleu foncé, texte blanc/jaune).

### 🟢 Phase 3 — New Game (Birch Speech)

- [ ] **P3.1** Précharger les assets Birch Speech (`sBirchSpeechShadowGfx`, `sBirchSpeechBgMap`, `sBirchSpeechBgPals`).
- [ ] **P3.2** Implémenter `CB2_NewGame` et `Task_NewGameBirchSpeech_Init`.
- [ ] **P3.3** Vérifier le rendu du Professeur Birch, du joueur (Brendan/May), de Lotad.
- [ ] **P3.4** Vérifier la transition vers l'écran de nommage (`CB2_LoadNamingScreen`).

---

## 4. Validation

Critères de succès pour déclarer "impeccable" :

1. **Skip intro** : n'importe quelle touche pendant l'intro passe au title screen en < 1s.
2. **Title screen** : logo Pokémon, Rayquaza, nuages, bannières "PRESS START" et copyright visibles.
3. **Input title** : A ou START pendant le title screen → fade out blanc → main menu en < 2s.
4. **Main menu** : fond bleu foncé, textes "NEW GAME" / "OPTION" lisibles, curseur WIN0 visible.
5. **Navigation menu** : UP/DOWN déplace le curseur, A valide, B retourne au title screen.
6. **New Game** : A sur NEW GAME → écran du Professeur Birch avec Lotad et le joueur.

# Audit 1/8 : Structure globale et flux de boot

## Comparaison web projet vs décomp pokeemeraude

### Flux de boot décomp (src/main.c:AgbMain)

```
AgbMain:
  1. RegisterRamReset(RESET_ALL)          [MODERN: skip]
  2. BG_PLTT = RGB_WHITE
  3. InitGpuRegManager
  4. REG_WAITCNT = prefetch + wait states
  5. InitKeys
  6. InitIntrHandlers
  7. m4aSoundInit
  8. EnableVCountIntrAtLine150
  9. InitRFU
  10. RtcInit
  11. CheckForFlashMemory
  12. InitMainCallbacks                   → pose CB2_InitCopyrightScreenAfterBootup
  13. InitMapMusic
  14. SeedRngWithRtc                     [BUGFIX]
  15. ClearDma3Requests
  16. ResetBgs
  17. SetDefaultFontsPointer
  18. InitHeap(gHeap, HEAP_SIZE)
  19. gSoftResetDisabled = FALSE
  20. SetMainCallback2(NULL)             [si flash memory absent]
  21. gLinkTransferringData = FALSE
  22. Loop infini:
      a. ReadKeys
      b. SoftReset (B+A+Select)
      c. UpdateLinkAndCallCallbacks       → CallCallbacks → callback1 + callback2
      d. PlayTimeCounter_Update
      e. MapMusicMain
      f. WaitForVBlank
```

### Flux de boot web projet (main.ts + GameScene.ts)

```
main.ts:
  1. Dev cache-bust monkey-patch fetch()
  2. createAudioDevtool
  3. LoadGameSave → SetSaveFileStatus
  4. SeedRngAndSetTrainerId
  5. exposeGbaGlobals
  6. loadMultichoiceLists
  7. installScopeDevtools
  8. preloadBagAssets + initItemIconMap
  9. text-tables preload
  10. initStringsFromDecomp
  11. new Phaser.Game(config)

GameScene.create():
  1. new Gba() + new GbaPhaserBridge() + new DecompRuntime()
  2. setGlobalRuntime + resetObjAllocations + exposeGbaGlobals
  3. InitKeys
  4. Enregistrement ~20 sprite callbacks manuellement
  5. installEngineDevtools
  6. bootIntro() async → preload assets → CB2_InitCopyrightScreenAfterBootup

GameScene.update():
  1. tickFixed(deltaMs) → callback2, RunTasks, AnimateSprites, BuildOamBuffer
  2. bridge.tick() si frames processed > 0
```

---

## Écarts détectés

### CORRIGE E1.1 — Input newKeys/heldKeys : CORRECT ✅

**Vérification** : `decomp-runtime.ts` lignes 1925-1960 implémente correctement:
- `newKeys = heldKeys & ~prevHeld` (front montant)
- keyRepeat counter avec `gKeyRepeat.startDelay` + `continueDelay`
- `newAndRepeatedKeys` pour le scroll repeat
- L→A remap
- `prevHeldKeys` tracking
- `installInputHandlers()` écrit heldKeys sur keydown/keyup, tickFixed calcule newKeys chaque frame

**Conclusion** : l'implémentation est fidèle au décomp. Pas d'erreur ici.

### CORRIGE E1.2 — PlayTimeCounter_Update : PRÉSENT ✅

**Vérification** : `decomp-runtime.ts` lignes 1979-1981 appellent `PlayTimeCounter_Update()` via globalThis lookup. Câblé et fonctionnel.

**Conclusion** : pas d'erreur ici.

### ERREUR E1.3 — Loop principal : MapMusicMain absent (confirmé)

**Décomp** : `MapMusicMain()` appelé chaque frame dans la boucle principale.

**Web** : pas de MapMusicMain dans tickFixed. La gestion audio semble se faire via le m4a/player module sans le contrôle du décomp.

**Fichier** : `src/engine/decomp-runtime.ts`
**Criticité** : MEDIUM — le décomp gère la transition de musique de map via MapMusicMain; sans ça les transitions musicales aux changements de carte peuvent être incorrectes

### ERREUR E1.4 — WaitForVBlank simulé mais pas fidèle

**Décomp** : `WaitForVBlank()` attend le vblank hardware, puis fire les interrupts.

**Web** : `tickFixed(deltaMs)` simule 60Hz via Phaser update. Pas de vblank interrupt — la simulation fait `callback2()` + `RunTasks()` + `AnimateSprites()` + `BuildOamBuffer()` directement.

**Impact** : acceptable pour une simulation mais signifie que le timing vblank n'est pas 1:1. Les pauses vblank dans le décomp (e.g. `gMain.vblankCounter1++`, `gMain.vblankCounter2++`) sont approximées.

**Fichier** : `src/engine/decomp-runtime.ts`
**Criticité** : LOW — limitation architecturale, pas un bug

### ERREUR E1.5 — Link/RFU/Multiboot stubs incohérents

**Décomp** :
- `InitRFU()` — init GameCube/RFU wireless
- `RtcInit()` — init horloge RTC
- `CheckForFlashMemory()` — check cartouche flash
- `HandleLinkConnection()` — DS link cable
- `GameCubeMultiBoot_Init/Main()` — GC multiboot

**Web** :
- RFU/Link : pas de stubs visibles → les calls décomp pourraient crasher
- Flash memory : stubbed comme absent → `SetMainCallback2(NULL)` appelé
- RTC : stubbed via `rtc.ts` + `exposeRtcDevApi`
- Multiboot : stubbed dans `copyright-boot.ts`

**Problème** : `HandleLinkConnection()` dans le loop décomp retourne FALSE par défaut (skip link). Si le web ne stubbe pas ce call dans tickFixed, le code peut tenter de résoudre un symbol inexistant.

**Fichier** : `src/engine/decomp-runtime.ts`
**Criticité** : MEDIUM — si les auto-generated callbacks font référence à gLinkTransferringData ou HandleLinkConnection sans stub, crash au runtime

### ERREUR E1.6 — SoftReset non implémenté

**Décomp** : `gSoftResetDisabled = FALSE`, check B+A+Select pour soft reset.

**Web** : pas de gestion soft reset. `gSoftResetDisabled` non défini.

**Criticité** : TRIVIAL — fonctionnalité non utilisée en web

### ERREUR E1.7 — `LoadGameSave` appelé 2x au boot

**main.ts** (ligne 132): `const _saveLoadStatus = LoadGameSave();`
**GameScene.transitionToOverworld()** (mode 'continue'): `gameState.load()` → appelle aussi `LoadGameSave()`

Le décomp appelle `LoadGameSave()` une seule fois au boot. Le web l'appelle dans `main.ts` (pour SetSaveFileStatus) puis potentiellement dans `transitionToOverworld` (continue). Cela n'est pas un bug en soi (le décomp appelle aussi LoadGameSave pour le main menu check), mais la synchronisation entre le status du boot et le load de transition mérite attention.

**Criticité** : LOW — pas de bug observé mais risque de race condition si le state change entre les 2 calls

### ERREUR E1.8 — `InitMainCallbacks` pose state=0 via SetMainCallback2

**Décomp** main.c:190 : `SetMainCallback2` reset `gMain.state = 0` chaque appel.

**Web** : vérifier que `rt.SetMainCallback2()` fait pareil. Dans `copyright-boot.ts` CB2_InitCopyrightScreenAfterTitleScreen, le commentaire dit "pas de reset state (= décomp s'attend à entrer ici avec gMain.state laissé à 5)". Mais SetMainCallback2 dans le décomp reset TOUJOURS state à 0. Donc soit le décomp setTitleScreen pose state=5 AVANT que SetMainCallback2 soit appelé, soit le commentaire est incorrect.

**Vérifier** : `src/engine/decomp-runtime.ts` SetMainCallback2 impl.
**Criticité** : MEDIUM — si state pas reset à 0, SetUpCopyrightScreen entre au mauvais case

---

## Boot-mode (web-only)

### Observation B1.1 — `?debug` preset ajoute des Pokémon hardcodés

Le preset `?debug` ajoute un Treecko Lv5 + Jirachi Lv100 hardcodés. C'est un outil de debug mais attention à ne pas oublier de le nettoyer ou de le marquer clairement comme debug-only.

### Observation B1.2 — `?truck` spawn incorrect

`boot-mode.ts` line 322 : `gameState.setDynamicWarp('MAP_LITTLEROOT_TOWN', 3, 10)` mais ensuite return `mapId: 'MAP_INSIDE_OF_TRUCK'`. Le dynamicWarp est posé sur Bourg-en-Vol (destination post-camion) mais le spawn immédiat est dans le camion. Le décomp fait pareil (WarpToTruck + set warp destination), donc cohérent.

### Observation B1.3 — `applyNoIntroPreset()` donne TOUS les items du jeu

Line 148-149: boucle `getAllItemKeys()` et ajoute chaque item. C'est `?debug` seulement, pas un problème en prod, mais `DEBUG_ExpandBagToFit(256)` override les caps 1:1 décomp.

---

## Résumé passage 1

| ID     | Type       | Criticité | Description courte                        |
|--------|------------|-----------|-------------------------------------------|
| E1.1   | CORRIGE    | ✅         | input polling newKeys/heldKeys CORRECT     |
| E1.2   | CORRIGE    | ✅         | PlayTimeCounter_Update PRÉSENT             |
| E1.3   | Manquant   | MEDIUM    | MapMusicMain pas dans loop                |
| E1.4   | Limitation | LOW       | WaitForVBlank approximé par tickFixed      |
| E1.5   | Stub       | MEDIUM    | Link/RFU stubs incohérents ou absents      |
| E1.6   | Manquant   | TRIVIAL   | SoftReset non implémenté                  |
| E1.7   | Risque     | LOW       | LoadGameSave appelé 2x                    |
| E1.8   | Incohérent | MEDIUM    | SetMainCallback2 state reset vs commentaire|
| B1.1   | Debug-only | INFO      | Treecko+Jirachi hardcodés debug           |
| B1.2   | Correct    | INFO      | ?truck spawn cohérent avec décomp         |
| B1.3   | Debug-only | INFO      | Tous items + expand bag caps debug        |

**Global** : le flux de boot web est globalement aligné sur le décomp. Les écarts principaux sont les calls manquants dans le loop principal (PlayTimeCounter, MapMusicMain, Link handling) et l'architecture tickFixed vs WaitForVBlank qui est une limitation acceptable mais source de drift timing.

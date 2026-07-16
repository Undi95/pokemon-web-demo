# AUDIT MOTEUR — runtime core (main.c · task.c · dma3_manager.c · gpu_regs.c · malloc.c · io_reg.c)

Date : 2026-07-16 · Lecture seule · Décomp de référence : `D:/Projet 1/decomps/pokeemeraude/src/`
Ports audités : `src/main.ts`, `src/task.ts`, `src/gpu_regs.ts`, `harness/main.ts`,
`harness/runtime/decomp-runtime.ts` (boucle `runOneFrame`), `harness/runtime/decomp-helpers.ts`,
`harness/runtime/decomp-globals.ts`, `harness/runtime/decomp-bridge.ts`, `harness/runtime/gba-io-regs.ts`,
`harness/runtime/input-handler.ts`, `harness/boot/copyright-boot.ts` + call-sites échantillonnés.

Légende : ✅ 1:1 · 🟡 DIVERGENT · 🟠 PARTIEL · 🔴 STUB · ⛔ ABSENT · 🔌 EXEMPTION-HW-PROPOSÉE · ❓ INCERTAIN

---

## A) main.c (437 l.) → src/main.ts + harness/runtime/decomp-runtime.ts + harness/main.ts

**Compteur** : 28 items → ✅ 8 · 🟡 3 · 🟠 2 · 🔴 2 · ⛔ 10 · 🔌 3.
**Verdict** : le CŒUR de la frame (CallCallbacks, SetMainCallback2, ReadKeys-repeat, vblankCallback,
vblankCounter1, gKeyRepeat) est fidèle ; la périphérie interruptions/link/timers est absente ou
exemptée. **Un manque de gameplay réel : le `Random()` par VBlank.**

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `AgbMain` | 🔌+🟠 | main.c:89 | decomp-runtime.ts:1913 `tickFixed` / :1938 `runOneFrame` | Boucle `for(;;)` = accumulateur 60 Hz (16.67 ms, `forceSetTimeOut` Phaser, harness/main.ts:256). Inits HW (RegisterRamReset, REG_WAITCNT, m4aSoundInit, InitRFU, RtcInit, CheckForFlashMemory, ClearDma3Requests, InitHeap) absents/relocalisés (RTC → src/rtc.ts, son → m4a natif, save → harness/main.ts:170). Combo soft-reset A+B+Start+Select ⛔. Link (Overworld_Send/RecvKeys, gLinkTransferringData) ⛔ exempt. |
| `UpdateLinkAndCallCallbacks` | ⛔ | :164 | — | Link (HandleLinkConnection introuvable dans le port — exempt hors-solo). `CallCallbacks` appelé directement. |
| `InitMainCallbacks` | 🟠 | :170 | intro-host.ts:122 + MainStruct init | Pas de fonction dédiée : `SetMainCallback2(CB2_InitCopyrightScreenAfterBootup)` posé par intro-host ; vblankCounter1=0 via `new MainStruct()` ; `gTrainerHillVBlankCounter` ⛔ ; gSaveBlock2Ptr/gPokemonStoragePtr posés par le module save. |
| `CallCallbacks` | ✅ | :181 | decomp-runtime.ts:1979,1984 | `if (callback1) callback1(); if (callback2) callback2();` — ordre exact. |
| `SetMainCallback2` | ✅ | :190 | decomp-runtime.ts:1496-1499 ; façade src/main.ts:22 | `callback2 = cb; state = 0` — 1:1. `gMain.state` présent (MainStruct:284) et utilisé par tous les inits multi-étapes. |
| `StartTimer1` | ⛔ | :196 | — | Timer HW ; remplacé par `_readSimulatedTM1CntL` (voir ci-dessous). |
| `SeedRngAndSetTrainerId` | 🟡 | :201 | src/main.ts:54-58 | REG_TM1CNT_L simulé (compteur XOR `performance.now()`, src/main.ts:44-51) — bridge plateforme documenté ; SeedRng + sTrainerId 1:1 ; appelé au boot (harness/main.ts:180). |
| `GetGeneratedTrainerIdLower` | ✅ | :209 | src/main.ts:61-63 | 1:1. |
| `EnableVCountIntrAtLine150` | ⛔ | :214 | — | VCount intr = vsync son ; le moteur m4a natif (worklet) a sa propre horloge. Aucun call-site orphelin. |
| `InitKeys` | ✅ | :231 | decomp-runtime.ts:348-355 | Délais **40/5 exacts** (décomp main.c:233-234 : start=40, continue=5). Port clear en plus `keyRepeatCounter=0` (décomp non — sans effet, 1er frame reset à startDelay) ; ne clear pas heldKeysRaw/newKeysRaw (champs absents). Appelée par les 3 hosts (GameScene.ts:77, TestOverworldScene.ts:325) + src/pokenav.ts:211 (1:1 pokenav.c). |
| `ReadKeys` | 🟡 | :243-285 | decomp-runtime.ts:1939-1973 (inline runOneFrame) | Voir « ATTENTION ReadKeys » ci-dessous. |
| `InitIntrHandlers` | 🔌 | :287 | — | Table d'IRQ/INTR_VECTOR/REG_IME : émulé par la boucle. Les `Set*Callback(NULL)` init = MainStruct défauts null ✅. |
| `SetVBlankCallback` | ✅ | :307 | decomp-runtime.ts:1513-1515 ; façade src/main.ts:27 | `gMain.vblankCallback = cb` — 1:1 (et le runtime l'appelle vraiment, cf. ordre de frame). |
| `SetHBlankCallback` | 🔴 | :312 | gba-global-scope.ts:146 no-op ; battle_main.ts:823/6476 no-ops locaux | Pas de HBlank plateforme (scanline = `__scanlineEffectTick` par frame). `gMain.hblankCallback` inexistant. |
| `SetVCountCallback` | ⛔ | :317 | — | Son (m4aSoundVSync) — worklet natif. |
| `RestoreSerialTimer3IntrHandlers` | ⛔ | :322 | — | Link. |
| `SetSerialCallback` | ⛔ | :328 | — | Link/serial (décomp copyright screen l'utilise — port copyright-boot l'omet). |
| `VBlankIntr` | 🟠 | :333-365 | éclaté (voir tableau dédié) | Cf. décomposition ci-dessous. |
| `InitFlashTimer` | ⛔ | :367 | — | Flash save HW (exemption save actée). |
| `HBlankIntr` | ⛔ | :372 | — | Pas de HBlank. |
| `VCountIntr` | ⛔ | :381 | — | Son. |
| `SerialIntr` | ⛔ | :391 | — | Link. |
| `IntrDummy` | ⛔ | :400 | — | N/A. |
| `WaitForVBlank` | 🔌 | :403 | tickFixed (decomp-runtime.ts:1913-1934) | Spin sur intrCheck → accumulateur 60 Hz ; VBlank = fin de `runOneFrame`. `gMain.intrCheck` inexistant (aucun consommateur porté). |
| `SetTrainerHillVBlankCounter` / `Clear…` | ⛔ | :411/:416 | — | Trainer Hill = frontier, hors périmètre solo-core. |
| `DoSoftReset` | 🔴 | :421 | specials-registry.ts:2028 (stub-loop) | Special stubbé ; pas de vrai soft reset (ni combo clavier). |
| `ClearPokemonCrySongs` | ✅ | :433 | src/main.ts:73-75 | CpuFill16 → `gSoundMemory.fill(0, CRYSONG_RAM_OFF, …)` — 1:1 câblage m4a. |
| `SeedRngWithRtc` | — | :222 | — | `#ifdef BUGFIX` : hors build vanilla → rien à porter. |

### Décomposition `VBlankIntr` (main.c:333-365)

| Étape décomp | Statut | Port |
|---|---|---|
| LinkVSync / RfuVSync | ⛔ | link exempt |
| `vblankCounter1++` | ✅ | runOneFrame:2077 (jamais reset — consommateurs field_tasks/field_specials OK) |
| `gTrainerHillVBlankCounter++` | ⛔ | frontier |
| `vblankCallback()` | ✅ | runOneFrame:2066-2067 (gate NULL respecté : pas de CB → pas de flush palettes, = mécanisme anti-flash des inits, commentaire :2060-2065) |
| `vblankCounter2++` | ⛔ | **champ absent de MainStruct**. Consommateurs solo : daycare.c (porté avec substitution documentée vblankCounter1, daycare.ts:608-613) ; save_failed_screen.c ❓ (non audité) ; link*.c exempts |
| `CopyBufferedValuesToGpuRegs()` | ⛔/🔌 | pas de buffering GPU (cf. §D — équivalence par rendu unique fin de frame) |
| `ProcessDma3Requests()` | ⛔/🔌 | copies synchrones (cf. §C) |
| `gPcmDmaCounter = gSoundInfo.pcmDmaCounter` | ✅ | relocalisé harness/m4a/native.ts:229-231 → src/main.ts:82 `setGPcmDmaCounter` (ordre « avant m4aSoundMain » respecté côté worklet ; consommateur pokedex_cry_screen.ts:192-195) |
| `m4aSoundMain()` | ✅🔌 | moteur m4a natif sample-exact (exemption son CLOSE, validée user) |
| `TryReceiveLinkBattleData()` | ⛔ | link |
| **`Random()` si hors link-battle** | ⛔ | **AUCUN équivalent dans runOneFrame** — voir 🚨 MANQUES #1 |
| `UpdateWirelessStatusIndicatorSprite()` | ⛔ | link |
| `INTR_CHECK / gMain.intrCheck` | ⛔ | remplacé par tickFixed |

### ATTENTION ReadKeys (runOneFrame:1939-1973 vs main.c:243-285)

- **newKeys** : `heldKeys & ~prevHeld` = `keyInput & ~heldKeysRaw` décomp ✅. **newAndRepeatedKeys** init = newKeys ✅.
- **Répétition** : décrément puis re-arm `continueDelay` (5), reset `startDelay` (40) si input changé — logique 1:1
  (le brief demandait « 40/10 » : le décomp dit **40/5**, le port dit 40/5 → exact). Port teste `<= 0` vs `== 0` (u16)
  décomp — équivalent (protège du wrap). Délais mutables 1:1 via `gKeyRepeat` (naming_screen.ts:889 =16 + restore :1124 ✅).
- **Bug L=A décomp non reproduit** : décomp compare keyInput RAW à `gMain.heldKeys` REMAPPÉ (bug documenté main.c:250-252 :
  répétition morte en mode L=A) ; port compare raw↔raw → la répétition MARCHE en L=A. Divergence bug-for-bug (favorable, mineure).
- 🐛 **RUSTINE LATENTE** : en mode L=A (`optionsButtonMode==2`), runOneFrame:1970-1971 fait `gMain.heldKeys |= A_BUTTON`
  **dans le store LIVE événementiel** (input-handler.ts:68/77 : keydown/keyup ne touchent que LEUR mask) → le bit A
  synthétique n'est jamais nettoyé au relâchement de L : A resterait « held » indéfiniment. Décomp : heldKeys reconstruit
  chaque frame depuis REG_KEYINPUT. Dormant (L=A non-défaut) mais à corriger : remapper sur une copie locale.
- **Champs absents** : `heldKeysRaw`/`newKeysRaw` (consommateur solo : berry_blender.c — non porté, bloquant pour lui),
  `watchedKeysMask`/`watchedKeysPressed` (consommateur : main.c seul → mort en solo).
- Input : keydown/keyup asynchrones écrivent `gMain.heldKeys` (input-handler.ts:64-80) ; latch par frame via
  `prevHeldKeys` — équivalent au REG_KEYINPUT latché, mais `gMain.heldKeys` peut muter mi-frame (lecture directe par
  le code jeu = état non latché ; divergence théorique mineure).

### Data main.c

| Global | Statut | Port |
|---|---|---|
| `gGameLanguage` | ✅ | src/main.ts:36 (FRENCH, build FR) |
| `gGameVersion`, `BuildDateTime` | ⛔ | aucun consommateur porté |
| `gKeyRepeatStartDelay`/`gKeyRepeatContinueDelay` | ✅ | decomp-runtime.ts:340-343 `gKeyRepeat` (container mutable) |
| `gMain` | 🟠 | MainStruct decomp-runtime.ts:283-323 — présents : state, callback1/2, savedCallback, vblankCallback, inBattle, newKeys, heldKeys, newAndRepeatedKeys, keyRepeatCounter, vblankCounter1, oamBuffer[128] ; absents : vblankCounter2, heldKeysRaw, newKeysRaw, watchedKeys*, hblank/vcount/serialCallback, intrCheck |
| `sTrainerId` | ✅ | src/main.ts:32 |
| `gPcmDmaCounter` | ✅ | src/main.ts:81-84 |
| `gSoftResetDisabled`, `gLinkTransferringData`, `gLinkVSyncDisabled`, `gIntrTable`, `IntrMain_Buffer`, `sUnusedVar` | ⛔ | HW/link/unused (sUnusedVar jamais lu même en décomp) |

---

## B) task.c (205 l.) → harness/runtime/decomp-runtime.ts:1568-1747 + src/task.ts (façade)

**Compteur** : 14 fonctions + gTasks → ✅ 10 · 🟡 3 (RunTasks encadré, SetTaskFuncWithFollowupFunc,
SwitchTaskToFollowupFunc) · doublon Get/SetWordTaskArg (2 impl. identiques).
**Verdict** : **structurellement 1:1** — la liste chaînée prev/next EXACTE est portée (pas une Map),
sentinelles et constantes conformes (`HEAD_SENTINEL=0xFE`, `TAIL_SENTINEL=0xFF`, `NUM_TASKS=16`,
`TASK_NONE=0xFF` — include/task.ts:7-10 = task.h). `data[16]` = Int16Array (wrap s16 natif ✅).

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `ResetTasks` | ✅ | task.c:9 | decomp-runtime.ts:1649-1662 | Slots 0..15 : isActive=false, func=TaskDummy, prev=i, next=i+1, priority=-1, data memset ; [0].prev=HEAD, [15].next=TAIL — byte-à-byte. (priority=-1 reste -1 JS vs 255 u8 : sans effet, slots inactifs hors liste.) |
| `CreateTask` | ✅ | :27 | :1575-1591 | 1er slot inactif → func/priority (&0xFF), InsertTask, memset data, isActive=true, return i ; retour 0 si plein (quirk décomp conservé). Ajout : `followupFunc=null` (champ adaptation). |
| `InsertTask` | ✅ | :47 | :1596-1620 | Insertion avant 1re priorité strictement supérieure, sinon queue — transcription exacte (y compris le `prev != HEAD_SENTINEL` guard). |
| `DestroyTask` | ✅ | :84 | :1633-1646 | 3 branches exactes ; + guard `!t` défensif. **Ne touche pas `.next` du slot courant** → cf. RunTasks. |
| `RunTasks` | 🟡 | :110 | :1735-1747 `runTasks` | Corps 1:1 : `FindFirstActiveTask` → do { func } while (next != TAIL). **Destruction pendant l'itération = comportement C exact** (le port relit `gTasks[taskId].next` APRÈS l'appel ; DestroyTask laisse le `.next` du courant intact → on continue vers l'ancien suivant, comme sur GBA ; une task nouvellement insérée APRÈS le curseur est exécutée cette frame, avant non — idem C). 3 ajouts harness : guard idempotence 1×/frame `_runTasksCalledThisFrame` (requis : CB2 transpilés appellent RunTasks eux-mêmes + backup runtime, sans lui = double-tick DPAD, cf. commentaire :1731-1734) ; try/catch par task (console.error, la frame survit — décomp : crash) ; garde anti-boucle `NUM_TASKS*4` (liste corrompue). Signature : `func(taskObj)` et non `func(taskId)` — pattern obligatoire `CreateTask((t)=>fn(t.taskId))` (mémoire). |
| `FindFirstActiveTask` | ✅ | :124 | :1624-1630 | isActive && prev==HEAD ; retourne NUM_TASKS si vide. |
| `TaskDummy` | ✅ | :135 | :521 | no-op. |
| `SetTaskFuncWithFollowupFunc` | 🟡 | :139 | :1704-1713 ; façade src/task.ts:30 | Adaptation légitime : champ dédié `followupFunc` au lieu du pack pointeur→data[14]/[15] (une fonction JS n'est pas un entier). Conséquence : data[14]/[15] restent LIBRES (le décomp les occupe) — collision impossible ici, mais un code décomp qui écrirait data[14-15] entre Set et Switch divergerait (aucun cas connu). |
| `SwitchTaskToFollowupFunc` | 🟡 | :148 | :1719-1723 ; façade src/task.ts:36 | Restaure depuis followupFunc (non effacé après swap = re-switch possible, comme décomp). Décomp pose func inconditionnellement (même garbage) ; port : seulement si non-null (défensif). |
| `FuncIsActiveTask` | ✅ | :155 | :1665-1669 | 1:1. |
| `FindTaskIdByFunc` | ✅ | :166 | :1672-1676 | TASK_NONE=0xFF ✅. |
| `GetTaskCount` | ✅ | :177 | :1679-1683 | 1:1. |
| `SetWordTaskArg` | ✅×2 | :189 | :1686-1691 **ET** src/task.ts:49-54 | Deux implémentations identiques (runtime : troncature Int16Array ; façade : &0xFFFF explicite — même résultat). **DOUBLON à réconcilier** (garder le foyer src/task.ts). |
| `GetWordTaskArg` | ✅×2 | :198 | :1694-1698 **ET** src/task.ts:58-63 | Idem ; les deux recomposent `(u16)lo \| (hi<<16) >>> 0` ✅. |
| `gTasks` | ✅ | task.c:4 | :526-533 (16 slots fixes) ; proxy src/task.ts:14 | Tableau FIXE (≠ Map), data=Int16Array(16). |

---

## C) dma3_manager.c (184 l.) → AUCUN foyer ; adaptations site-par-site

**Compteur** : 5 fonctions → ⛔ 4 (en tant que fonctions) · 🟡 1 (CheckForSpace, stubs locaux) —
**🔌 EXEMPTION-PROPOSÉE : cohérente mais ÉCLATÉE**.
**Verdict** : la queue DMA n'existe pas ; chaque call-site décomp est traité localement en copie
SYNCHRONE (l'adaptation validée du projet). Sémantiquement sain (copie synchrone ⇒ queue toujours
vide ⇒ `CheckForSpace…`=0 / `IsDma3ManagerBusy…`=false sont les valeurs EXACTES d'un DMA déjà
traité). Mais l'absence de foyer laisse des `__wireTodo` qui THROWENT côté Pokénav.

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `ClearDma3Requests` | ⛔ | dma3_manager.c:25 | — | Rien à vider (pas de queue). Appelé par AgbMain:111 — sans objet. |
| `ProcessDma3Requests` | ⛔ | :42 | — | Le budget VBlank 40 KiB / VCOUNT>224 n'a pas d'équivalent (copies immédiates). Aucun retard de transfert simulé. |
| `RequestDma3Copy` | ⛔ fn / 🟡 sites | :98 | site-par-site | Sites portés en synchrone : bg.c:186/193/425 → LoadBgTiles/LoadBgPalette moteur ; mon_markings.ts:145-150 (`_writeToObjVram` direct) ; pokemon_storage_system.ts:3123 (commentaire « copie synchrone ») ; battle_anim/battle_anim_mons/throw (écritures VRAM directes). **Sites NON câblés** : pokenav_main_menu.ts:82 `__wireTodo('RequestDma3Copy')` **appelé à :868** (throw si chemin exécuté) ; pokenav_match_call_gfx.ts:71 (call-site :1306 adapté/commenté). |
| `RequestDma3Fill` | ⛔ fn / ✅ sites | :130 | site-par-site | **Vérifié 2026-07-16 (l'audit 2026-06-13 le disait INEXISTANT → les sites qui manquaient REMPLISSENT désormais réellement)** : battle_anim.ts:714 `bg.vram.fill(0, off, off+0x2000)` = `RequestDma3Fill(0, BG_SCREEN_ADDR(8\|12), 0x2000, 1)` (battle_anim.c:684/724) ; :728 `tilemap.fill(vide)` = `RequestDma3Fill(0xFF, …)` ; pokemon_storage_system.ts:3119 wallpaper `.fill(0)` ; decomp-globals.ts:345-349 `BgDmaFill` (bg.c) remplit via LoadBgTiles (présupposé 4bpp/baseTile=0 documenté :340-344). Toujours PAS de fonction nommée — fill réel site-par-site. |
| `CheckForSpaceForDma3Request` | 🟡 | :163 | stubs locaux | `return 0` (= jamais busy — valeur exacte post-copie synchrone) : pokenav_match_call_gfx.ts:56 ; `IsDma3ManagerBusyWithBgCopy` (bg.c:447, consommateur principal) : easy_chat.ts:812-815 `false`, pokemon_storage_system.ts:5351 `false`, pokenav_region_map.ts:612 & pokenav_menu_handler_gfx.ts:1422 délégations ; **battle_bg.ts:661 = compteur réel `_bgCopiesInFlight`** (asynchrone assets — seul site avec vraie attente). |

**Recommandation** : créer le foyer `src/dma3_manager.ts` (RequestDma3Copy/Fill = copies/fills
synchrones réels sur `rt.gba.vram/objVram/pltt`, Check…=0, Process/Clear=no-op documentés) →
purge les `__wireTodo` Pokénav et les 4 stubs locaux dupliqués.

---

## D) gpu_regs.c (196 l.) → src/gpu_regs.ts (façade 2 fns) + decomp-runtime.ts:709-835 + decomp-helpers.ts:243-262 + gba-io-regs.ts

**Compteur** : 11 fonctions → ✅-sémantique 4 (Set/GetGpuReg dispatch, SetGpuRegBits, ClearGpuRegBits) ·
🔴 3 (Enable/DisableInterrupts, SetHBlank-adjacent SyncRegIE) · ⛔ 4 (InitGpuRegManager,
CopyBufferedValueToGpuReg, CopyBufferedValuesToGpuRegs, SetGpuReg_ForcedBlank, UpdateRegDispstatIntrBits).
**Verdict** : **le BUFFERING n'existe pas — architecture différente mais observablement équivalente** :
le décomp bufferise pendant l'affichage actif et flushe au VBlank ; le port applique immédiatement sur
l'état `gba.*`, et comme le compositor ne rend qu'UNE fois par frame APRÈS `runOneFrame`
(TestOverworldScene.ts:1015-1021 `bridge.tick()`), tous les writes de la frame deviennent visibles
d'un bloc « au VBlank ». Pas de tearing mi-frame possible. 🔌 exemption cohérente.

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `InitGpuRegManager` | ⛔ | gpu_regs.c:21 | — | Pas de sGpuRegBuffer/sGpuRegWaitingList/sShouldSyncRegIE. |
| `CopyBufferedValueToGpuReg` | ⛔ | :36 | — | (Le cas spécial DISPSTAT préserve-intr-bits n'a pas d'objet : DISPSTAT non modélisé.) |
| `CopyBufferedValuesToGpuRegs` | ⛔ | :49 | — | Rien à flusher au VBlank. |
| `SetGpuReg` | 🟡 | :66 | decomp-runtime.ts:781-835 ; façade src/gpu_regs.ts:8 | Application IMMÉDIATE (pas de vcount 161-225/forced-blank check). Registres gérés : DISPCNT, BG0-3CNT, BG0-3HOFS/VOFS, BLDCNT/BLDALPHA/BLDY, WIN0/1H, WIN0/1V, WININ, WINOUT (avec haut-byte WINOBJ 1:1 :810-812), MOSAIC, BG2/3PA-PD (sign-extend), BG2/3X/Y L/H (28.8 reconstruit). ⚠️ **default = DROP SILENCIEUX** (DISPSTAT, IE, offset inconnu → rien, AUCUN warn) — contraire à l'esprit « un gate doit hurler » (Règle 3). |
| `SetGpuReg_ForcedBlank` | ⛔ | :100 | — | Aucun call-site porté trouvé. |
| `GetGpuReg` | 🟡 | :131 | decomp-runtime.ts:709-768 ; façade src/gpu_regs.ts:13 | Reconstruit depuis l'état gba : DISPCNT (bits BG/OBJ/WIN recomposés :711-722), BGxCNT (buildBgCnt :770-779), HOFS/VOFS, BLD*, WIN0/1H/V, WININ, WINOUT, MOSAIC. **Retourne 0 pour tout le reste** — notamment BG2/3PA-PD/X/Y (écrits par SetGpuReg mais NON relisibles ; le décomp relit le buffer pour tout offset < 0x60) et DISPSTAT/VCOUNT (lectures HW décomp:133-137). Grep : aucun `GetGpuReg(REG_OFFSET_DISPSTAT\|VCOUNT)` dans src/ → dormant. Read-modify-write sur un reg non-lisible partirait de 0 (aucun cas actif : les RMW actuels — DISPCNT/WININ/WINOUT/WIN0V/BG0CNT — sont tous couverts). |
| `SetGpuRegBits` | ✅-sém | :142 | decomp-helpers.ts:243-246 | `SetGpuReg(reg, GetGpuReg(reg) \| mask)` = le corps décomp (qui lit le buffer). Consommateurs src/ : pokenav_menu_handler_gfx.ts:1491-1494, pokemon_storage_system.ts:5495 — importent de decomp-helpers (⚠️ foyer attendu : src/gpu_regs.ts). |
| `ClearGpuRegBits` | ✅-sém | :148 | decomp-helpers.ts:249-252 | Idem `& ~mask`. |
| `SyncRegIE` | ⛔ | :154 | — | Pas d'IRQ. |
| `EnableInterrupts` | 🔴×3 | :166 | decomp-helpers.ts:255-257 **+** decomp-globals.ts:1445 **+** gba-global-scope.ts:155 | No-op triplé (🔌 exemption IRQ cohérente, MAIS 3 copies à unifier). |
| `DisableInterrupts` | 🔴×2 | :174 | decomp-helpers.ts:260-262 + gba-global-scope.ts:476 | Idem. |
| `UpdateRegDispstatIntrBits` | ⛔ | :182 | — | DISPSTAT non modélisé. |

`harness/runtime/gba-io-regs.ts:9-15` (`gbaIoRegs` : REG_IE/REG_IME/REG_IF/REG_DISPSTAT/REG_VCOUNT
mutables) = modèle de données pur pour les danses de registres transpilées — unique consommateur :
src/main_menu.ts:2533-2536 (section critique REG_IME du main_menu.c). Sans effet moteur (personne ne
lit ces valeurs côté runtime) — honnête, à documenter comme tel.

---

## E) malloc.c (225 l.) → 🔌 EXEMPTION GC JS (confirmée cohérente)

**Compteur** : 12 fonctions → ⛔ 11 (voulu : GC) · 🟡 1 (`AllocZeroed` générique decomp-bridge.ts:179-181,
retourne `{}` avec garde-fou documenté « jamais comme buffer d'octets » :170-178 ; 1 seul usage vivant).
**Verdict** : exemption JUSTE — aucun foyer malloc.ts nécessaire. **Le zéro-init d'AllocZeroed est
respecté PAR CONSTRUCTION à tous les sites échantillonnés** (littéraux/factories/reset explicites).
Deux bombes dormantes `InitHeap` côté call-sites transpilés.

Échantillon 6 sites décomp `AllocZeroed` → port :

| Site décomp | Port | Zéro-init ? |
|---|---|---|
| item_menu.c:619 `gBagMenu = AllocZeroed(sizeof(*gBagMenu))` | item_menu.ts:546 `_allocZeroedBagMenu()` (factory) ; Free = null :1495 | ✅ factory zero-init |
| mail.c:450 `sMailRead = AllocZeroed(…)` | mail.ts:507-511 `AllocZeroed<MailRead>(0x222C)` + `_initMailReadStruct` | ✅ init explicite (seul usager du générique `{}`) |
| battle_gfx_sfx_util.c:89-93 `gBattleSpritesDataPtr` + 4 blocs | battle_gfx_sfx_util.ts:79-81 `AllocateBattleSpritesData()` = `resetBattleSpritesData()` (storage statique, « alloc fraîche = reset complet ») | ✅ même état observable |
| battle_gfx_sfx_util.c:1296-1313 `gMonSpritesGfxPtr`(+barFontGfx 0x1000) | battle_gfx_sfx_util.ts:100-109 objet statique nullable (buffers naissent au load) | ✅ |
| evolution_scene.c:251/:487 `sEvoStructPtr = AllocZeroed(sizeof(struct EvoInfo))` | evolution_scene.ts:450-453 littéral `{preEvoSpriteId:0, …, savedPalette:new Uint16Array(48)}` | ✅ (typed array = zéro) |
| event_object_movement.c:8816 `sLockedAnimObjectEvents = AllocZeroed(…)` | event_object_movement.ts:6068 `Set<number>` (add/delete, « free » = vide) | ✅ sémantique |

**`InitHeap` : 0 implémentation, 2 call-sites transpilés** :
- credits.ts:441 `InitHeap(gHeap, HEAP_SIZE)` avec `InitHeap = __wireTodo('InitHeap')` (credits.ts:51)
  → **THROW à l'exécution**. Injoignable aujourd'hui (0 importeur de src/credits.ts) — bombera au câblage crédits.
- intro.ts:2172 `InitHeap(gHeap, HEAP_SIZE)` avec `declare function InitHeap` (intro.ts:156) et AUCUNE
  définition sur globalThis → **ReferenceError** si exécuté. Dormant : ce `CB2_InitCopyrightScreenAfterBootup`
  transpilé (intro.ts:2162) est un DOUBLON MORT — le boot vivant est harness/boot/copyright-boot.ts:133
  (via intro-host.ts:122 et gba-global-scope.ts:307), qui SKIPPE la branche save-init (save relocalisée
  harness/main.ts:170-180). Fix simple : `InitHeap` no-op documenté exposé au câblage.

---

## F) io_reg.c (37 l.)

**Compteur** : 3 data → ⛔ 1 (sUnused, jamais lu même en décomp) · 🟡 1 · ⛔ 1.

| Data | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `sUnused[]` | ⛔ | io_reg.c:5 | — | Unused décomp — RAS. |
| `gOverworldBackgroundLayerFlags[]` | 🟡 | :24 | overworld.ts:1131-1144 | Valeurs 1:1 (BLDCNT_TGT2_BG0-3, citation io_reg.c:24 en commentaire :1125) mais **const LOCALE dans la fonction consommatrice** au lieu d'un foyer src/io_reg.ts exporté. Fonctionnellement exact ; structurellement : au 2e consommateur, créer le foyer. |
| `gOrbEffectBackgroundLayerFlags[]` | ⛔ | :31 | — | Unique consommateur décomp = field_screen_effect.c:1133 `Task_OrbEffect` (**orbe Bleue/Rouge, réveil Groudon/Kyogre — SOLO-critique, climax**) : non porté (`DoOrbEffect`/`FadeOutOrbEffect` = stubs specials-registry.ts:1524). À porter ENSEMBLE (étape 6 climax). |

---

## ORDRE DE FRAME — décomp vs runOneFrame

```
DÉCOMP (AgbMain + VBlankIntr)                 PORT (runOneFrame, decomp-runtime.ts:1938-2089)
────────────────────────────────              ────────────────────────────────────────────────
ReadKeys()                    main.c:126      0. ReadKeys inline (newKeys/repeat/L=A)   :1939-1973
[soft-reset combo]            :128-135        (absent)
[link : Send/RecvKeys]        :137-156        (absent — CallCallbacks direct)
CallCallbacks:                :181-188
  callback1()                                 1. callback1()                            :1979
  callback2()   ← le CB2 appelle LUI-MÊME     2. callback2()                            :1984
    RunTasks/AnimateSprites/BuildOamBuffer/   3. PlayTimeCounter_Update()               :1991
    UpdatePaletteFade/RunTextPrinters         4. MapMusicMain()                         :1999
PlayTimeCounter_Update()      :158            5. si nom commence par « MainCB2 » :
MapMusicMain()                :159               runTasks() + animateSprites()          :2013-2025
WaitForVBlank()               :160               (backups idempotents — no-op si le CB2
                                                  les a déjà appelés cette frame)
── VBlankIntr (interruption) ──               6. RunTextPrinters()+flushDirtyWindows()  :2028-2031
LinkVSync/RfuVSync            :335-338           (GLOBAL, guard 1×/frame text.ts:1396-1403)
vblankCounter1++              :340            7. buildOamBuffer() = syncSpritesToOam    :2034
gTrainerHillVBlankCounter++   :342               (AVANT vblankCallback ✅ ; écrit gba.oam
vblankCallback()              :345-346            DIRECT — pas de staging, cf. note 3)
vblankCounter2++              :348            8. _syncSubspriteOam hook                 :2041
CopyBufferedValuesToGpuRegs() :350            9. UpdatePaletteFade() backup si pas fait :2052
ProcessDma3Requests()         :351            10. vblankCallback()                      :2066
gPcmDmaCounter = …            :353                puis gPlttBufferFaded.flushTo()       :2069-2071
m4aSoundMain()                :355                (TransferPlttBuffer simulé, gate
TryReceiveLinkBattleData()    :356                 bufferTransferDisabled ; NULL CB ⇒
Random()  ← hors link-battle  :358-359             AUCUN flush = anti-flash inits ✅)
UpdateWirelessStatusIndicator :361            11. __scanlineEffectTick                  :2074
intrCheck |= VBLANK           :363-364        12. gIntroFrameCounter++ ; vblankCounter1++ :2076-2077
                                              … puis host : bridge.tick() = composeFrame+
                                                putImageData 1× (TestOverworldScene.ts:1015-1021 ;
                                                frames de rattrapage tickFixed NON rendues)
```

**Notes d'ordre** :
1. Séquence logique callback1→callback2→PlayTime→MapMusic : ✅ identique.
2. **Flush palettes vs vblankCallback** (le point à bugs historique) : décomp = `TransferPlttBuffer`
   appelé PAR le VBlankCB (position variable DANS le CB) ; port = flush APRÈS le retour du CB (:2069)
   **+** les VBlankCB portés qui appellent TransferPlttBuffer eux-mêmes (copyright-boot.ts:98-103,
   decomp-globals.ts:1416-1420) → double flush idempotent. Divergence résiduelle : un VBlankCB décomp
   écrivant gPlttBufferFaded APRÈS son TransferPlttBuffer verrait la couleur à la frame suivante sur
   GBA, immédiatement chez nous (aucun cas identifié — à surveiller).
3. **OAM non gaté par le VBlankCB** : décomp = BuildOamBuffer (frame active) puis `LoadOam()` au VBlank
   copie gMain.oamBuffer→OAM HW — `SetVBlankCallback(NULL)` FIGE donc les sprites pendant les inits.
   Port : syncSpritesToOam écrit gba.oam directement, `LoadOam` = no-op (decomp-globals.ts:1427-1430)
   → les sprites continuent d'être poussés même à VBlankCB NULL. Masqué en pratique par DISPCNT=0 /
   forced blank des inits ; divergence dormante.
4. `gMain.oamBuffer` (MainStruct:319) écrit par digit_obj_util n'est PAS lu par le compositor
   (documenté :314-318) — dette consommateurs (berry_crush/pokemon_jump).
5. RunTextPrinters : décomp = appelé par ~50 CB2 par-scène ; port = global chaque frame avec guard
   1×/frame → pas de double-tick, tourne à vide hors dialogue (inoffensif).

---

## 🚨 MANQUES CRITIQUES (priorisés)

1. **`Random()` du VBlankIntr ABSENT** (main.c:358-359 ; runOneFrame ne l'appelle nulle part) — sur GBA
   gRngValue avance CHAQUE frame hors link-battle (donc AUSSI pendant les combats solo) : c'est l'entropie
   frame-timing de TOUT le RNG (catch, dégâts, rencontres, IVs). Sans lui, résultats déterministes au
   call-count près. Fix 1 ligne dans runOneFrame — reproduire la condition EXACTE
   `!gMain.inBattle || !(gBattleTypeFlags & (LINK|FRONTIER|RECORDED))`.
2. **`Task_OrbEffect` + `gOrbEffectBackgroundLayerFlags` non portés** (field_screen_effect.c:1120+ /
   io_reg.c:31 ; stubs specials-registry.ts:1524) — orbe Groudon/Kyogre = climax solo (étape 6).
3. **Latch A_BUTTON permanent en mode L=A** (runOneFrame:1970-1971 mute le store événementiel
   `gMain.heldKeys` que keyup(L) ne nettoie jamais) — dormant (L=A non-défaut) ; remapper sur copie locale.
4. **`InitHeap` : 2 bombes dormantes** — credits.ts:441 (throw __wireTodo) + intro.ts:2172 (ReferenceError,
   doublon mort) ; exposer un no-op documenté avant le câblage crédits/intro transpilé.
5. **`SetGpuReg` default = drop silencieux** (decomp-runtime.ts:834) — warn-once par offset inconnu
   (diagnostic gratuit, aligné Règle 3) ; idem GetGpuReg qui rend 0 pour BG2PA-PD/X/Y pourtant écrits.
6. `vblankCounter2` absent (daycare substitué vblankCounter1 ✅ documenté ; save_failed_screen ❓ non audité).
7. `heldKeysRaw`/`newKeysRaw` absents → bloquants pour berry_blender.c (mini-jeu solo) le jour venu.

## RUSTINES À PURGER (après fix moteur)

1. Heuristique par NOM `cbName.startsWith('MainCB2')` (runOneFrame:2013-2014) — fragile (minification,
   arrows anonymes) ; cible : chaque CB2 transpilé appelle lui-même RunTasks/AnimateSprites/BuildOamBuffer/
   UpdatePaletteFade (les guards idempotents existent déjà :1736/1866/1877/2052), puis supprimer le backup.
2. Triplication `EnableInterrupts`/`DisableInterrupts` no-op (decomp-helpers.ts:255-262,
   decomp-globals.ts:1445, gba-global-scope.ts:476) → un seul foyer.
3. Doublon `Get/SetWordTaskArg` (decomp-runtime.ts:1686-1698 vs src/task.ts:49-63) → garder src/task.ts.
4. `SetGpuRegBits`/`ClearGpuRegBits` dans harness/decomp-helpers.ts:243-252 → rapatrier dans le foyer
   src/gpu_regs.ts (qui n'expose que SetGpuReg/GetGpuReg).
5. Stubs DMA locaux éparpillés (easy_chat.ts:812, pokemon_storage_system.ts:5351,
   pokenav_match_call_gfx.ts:56, pokenav_region_map.ts:612) → foyer src/dma3_manager.ts unique
   (purge aussi les `__wireTodo` RequestDma3Copy pokenav).
6. `CB2_InitCopyrightScreenAfterBootup` en double : harness/boot/copyright-boot.ts:133 (vivant) vs
   src/intro.ts:2162 (transpilé, mort, bombe InitHeap) → dissoudre le doublon (ou câbler le transpilé).
7. copyright-boot.ts:134-138 : `if (!SetUpCopyrightScreen()) rt.SetMainCallback2(MainCB2_Intro)` —
   redondant (SetUpCopyrightScreen:126 l'a déjà posé) + re-reset gMain.state ; la branche décomp réelle
   = save-init (relocalisée harness/main.ts:170-180) — à re-transcrire au câblage save 1:1.

## CALL-SITES ORPHELINS

| Call-site | Symbole appelé | Effet si exécuté |
|---|---|---|
| pokenav_main_menu.ts:868 | `RequestDma3Copy` (__wireTodo :82) + `gDecompressionBuffer` (__wireTodo :94) | throw `[wire] …` (sentinelle L1 connue, à câbler) |
| credits.ts:441 | `InitHeap` (__wireTodo :51) | throw — injoignable (0 importeur de credits.ts) |
| intro.ts:2172 | `InitHeap` (declare sans définition globale) | ReferenceError — doublon mort du boot CB2 |
| specials `DoSoftReset`, `DoOrbEffect`, `FadeOutOrbEffect` | stub-loop specials-registry.ts:2028/:1524 | no-op silencieux en jeu |
| `gMain.oamBuffer` (MainStruct:319) | écrit par digit_obj_util, lu par personne | rendu manquant pour berry_crush/pokemon_jump (documenté) |

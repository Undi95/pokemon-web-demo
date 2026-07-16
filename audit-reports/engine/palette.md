# AUDIT MOTEUR — palette.c (machine de fade + buffers palette)

**Réf** : `D:/Projet 1/decomps/pokeemeraude/src/palette.c` (1043 l, 40 fonctions) + `include/palette.h` (struct PaletteFadeControl).
**Ports** : `src/palette.ts` (façade 1:1 + utilitaires), `harness/runtime/decomp-runtime.ts` (classe PaletteFade + BeginNormal/UpdatePaletteFade), `harness/runtime/decomp-globals.ts` (LoadPalette/BlendPalette(s)/TransferPlttBuffer/ResetPaletteFade), `harness/runtime/decomp-helpers.ts:134-179` (PaletteBuffer 512×u16 + `flushTo`), `harness/gba/palette.ts` (PaletteBanks rendu).

## Compteurs
| ✅ 1:1 | 🟡 DIVERGENT | 🟠 PARTIEL | 🔴 NON-CÂBLÉ | ⛔ ABSENT | Total |
|---|---|---|---|---|---|
| 15 | 8 | 3 | 1 | 13 (dont 12 morts dans la décomp elle-même) | 40 |

**Verdict (1 ligne)** : le cœur NORMAL_FADE + BlendPalette(s) + double-monde (gPlttBuffer* → flushTo au VBlank) est solide et discipliné (quasi plus AUCUN écrivain direct PaletteBanks), mais **FAST_FADE n'est JAMAIS dispatché** (UpdatePaletteFade runtime ne route pas mode==1 → les 2 fins de combat `BeginFastPaletteFade(3)` dégénèrent en no-op visuel), la struct `gPaletteFade` a des **noms de champs non-décomp** (piège transpileur), et 3 stubs locaux « Dette R3 » contournent des fonctions pourtant portées.

## Tableau des fonctions

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| LoadCompressedPalette | 🟠 PARTIEL | palette.c:84 | src/palette.ts:147 | Pas de LZDecompressWram : suppose l'asset PRÉ-décompressé (pipeline extract) — adaptation cohérente INCBIN→fetch, mais si un caller passe du vrai LZ77 → silencieusement faux. Ne passe pas par gPaletteDecompressionBuffer. Lookup via global `__getAssetForParticles`. |
| LoadPalette | 🟡 | palette.c:91 | decomp-globals.ts:290 | Écrit bien Unfaded ET Faded ✅. Adaptations : src=symbole string→cache ; `sizeBytes` IGNORÉ si string, et `0`→taille full buffer (fallback transpileur). PAS dans src/palette.ts malgré l'en-tête (l.7 « delegate »). |
| FillPalette | ✅ | palette.c:97 | src/palette.ts:186 | CpuFill16 ×2 buffers, size/2 entries. |
| TransferPlttBuffer | 🟡 | palette.c:103 | decomp-globals.ts:1416 + decomp-runtime.ts:2066-2072 | Gate `bufferTransferDisabled` ✅, flushTo=DmaCopy16→PLTT ✅, appelé seulement si `gMain.vblankCallback` non-null (= 1:1, c'est la VBlankCB qui l'appelle). MANQUE : `sPlttBufferTransferPending=FALSE` (flag absent) et l'appel `UpdateBlendRegisters()` si HARDWARE_FADE actif (fait en avance dans UpdatePaletteFade — même frame, équivalent visuel). |
| UpdatePaletteFade | 🟡 | palette.c:116 | decomp-runtime.ts:1254 (+ wrapper decomp-globals.ts:1462) | **Dispatch FAST_FADE ABSENT** (C:126-127) : seul HARDWARE_FADE est routé (l.1272), tout le reste tombe dans le chemin NORMAL. Le gate `sPlttBufferTransferPending`→STATUS_LOADING (C:121-122,131) remplacé par `_paletteFadeCalledThisFrame` (idempotence par frame — équivalent du cas courant, mais ne gèle PAS le fade quand aucun VBlank ne draine, contrairement au C). Retourne bool au lieu de u8 status (DONE/ACTIVE/DELAY/LOADING). |
| ResetPaletteFade | 🟠 PARTIEL | palette.c:136 | decomp-globals.ts:1372 | ResetPaletteFadeControl inliné complet ✅ (deltaY=2 ✅, blendColor→targetR/G/B=0 ✅). La boucle `PaletteStruct_Reset(i)`×16 absente (sous-système ⛔ — code mort décomp, cf. plus bas). `selectedPalettes` non remis à 0 (en C multipurpose1=0 LE fait — union brisée chez nous, cf. gPaletteFade). |
| ReadPlttIntoBuffers | ⛔ | palette.c:146 | — | Seul caller = BeginPlttFade (UNUSED). Mort. |
| BeginNormalPaletteFade | 🟡 | palette.c:158 | decomp-runtime.ts:1084 (+ façade src/palette.ts:311) | Cœur 1:1 ✅ : garde `active` (C:163), deltaY=2 + delay<0 (C:169-175), yDec (C:186-189), UpdatePaletteFade immédiat (C:191). MANQUE le flush immédiat forcé `CpuCopy32(Faded→PLTT)` avec bufferTransferDisabled temporairement OFF (C:193-199) : chez nous différé au prochain VBlank ET gated par vblankCallback ≠ null → un Begin pendant VBlankCB null n'affiche pas son 1er step (le C si). Return void vs bool8. Parsing string `palettes`/`color` via `new Function` = adaptation transpileur. |
| BeginPlttFade | ⛔ (UNUSED décomp) | palette.c:204 | — | OK. |
| PaletteStruct_Run/_Copy/_Blend/_TryEnd | ⛔ | palette.c:210-342 | — | _Run est `static UNUSED` → toute la chaîne est morte dans la décomp. |
| PaletteStruct_ResetById | ⛔ | palette.c:344 | — | Unique caller externe = `EndUnkPaletteAnim` (battle_anim_mons.c:723) **lui-même `static UNUSED`**. (La note decomp-globals.ts:1367 « seul caller vivant » est fausse — c'est mort aussi.) |
| PaletteStruct_Reset | ⛔ | palette.c:351 | — | Appelé par ResetPaletteFade (vivant) mais ne fait que réinitialiser sPaletteStructs (absent) → sans effet observable. |
| ResetPaletteFadeControl | 🟠 PARTIEL | palette.c:363 | inliné decomp-globals.ts:1376-1402 | Tous les champs couverts ✅ MAIS pas exporté sous son nom 1:1 ; `src/palette.ts:11` PRÉTEND le porter (faux, absent du fichier) ; call-site recorded-battle = stub vide (cf. rustines). Callers décomp restants : link.c:1600, recorded_battle.c:214 (hors solo). |
| PaletteStruct_Set/ClearUnusedFlag, _GetPalNum | ⛔ (UNUSED/morts) | palette.c:383-406 | — | OK. |
| UpdateNormalPaletteFade | 🟡 | palette.c:408 | decomp-runtime.ts:1313-1356 + _applyPaletteFadeStepHalf:1361 | Algorithme fidèle : delay gate sur toggle==0 ✅ (C:424-430), BG/OBJ alterné ✅ (C:434-456), BlendPalette >>4 tronqué ✅, y==targetY → selectedPalettes=0 + softwareFadeFinishing ✅ (C:460-464), avance y clampée deltaY ✅ (C:467-484). Micro-écarts : latch-clear `softwareFadeFinishing` quand inactive (l.1261, pas en C) ; noms de champs non-décomp (voir gPaletteFade). |
| InvertPlttBuffer | ✅ | palette.c:494 | src/palette.ts:215 | 1:1 (mask 0xFFFF vs `~u16` C — identique). **Mais son unique caller vivant décomp le bypasse** (cf. rustines battle_anim_normal.ts:663). |
| TintPlttBuffer | ✅ | palette.c:511 | src/palette.ts:252 | Wrap s5 simulé &0x1F = même arithmétique bitfield. Caller décomp unique = AnimTask_TintPalettes (UNUSED) → orphelin par nature. |
| UnfadePlttBuffer | ✅ | palette.c:533 | src/palette.ts:289 | Faded←Unfaded par bank. Orphelin (idem). |
| BeginFastPaletteFade | 🟡 | palette.c:550 | src/palette.ts:334 | Corps 1:1 ✅ mais effet CASSÉ par l'absence de dispatch (voir UpdateFastPaletteFade). Call-sites vivants : battle_script_commands.ts:9910, battle_main.ts:5743 (fins de combat). |
| BeginFastPaletteFadeInternal | ✅ | palette.c:556 | src/palette.ts:355 | y=31, submode&0x3F→multipurpose2, fills BLACK/WHITE, UpdatePaletteFade() ✅. |
| UpdateFastPaletteFade | 🔴 NON-CÂBLÉ | palette.c:572 | src/palette.ts:377 | Corps transcrit 1:1 (±2/canal, toggle BG/OBJ, y-=deltaY, resolve final + mode=NORMAL + finishing) **mais AUCUN dispatch ne l'appelle** : decomp-runtime.UpdatePaletteFade ne teste jamais mode==FAST_FADE → un fast-fade tourne le chemin NORMAL avec état stale (selectedPalettes remis à 0 par le fade précédent → AUCUNE écriture palette ; ~30 frames brûlées puis active=false). Le fondu rapide de fin de combat n'existe donc pas à l'écran. |
| BeginHardwarePaletteFade | ✅ | palette.c:730 | src/palette.ts:472 | Champs 1:1 (blendCnt→multipurpose1, delay→multipurpose2, yDec). RENDU CHEZ NOUS : oui — runtime écrit BLDCNT/BLDY (SetGpuReg 0x54→`gba.blend.brightness`, decomp-runtime.ts:800) et le compositor applique brightness inc/dec (harness/gba/compositor.ts:340-346). Vérifié vivant via reshow_battle_screen.ts:245. |
| UpdateHardwarePaletteFade | 🟡 dupliqué | palette.c:748 | decomp-runtime.ts:1272-1295 (inline) ; src/palette.ts:489 (orphelin) | Logique delay/y/finishing 1:1 ✅. Divergences : BLDCNT/BLDY écrits chaque frame DANS UpdatePaletteFade au lieu de via TransferPlttBuffer au VBlank (C:111-112) → non gated par `bufferTransferDisabled` (même-frame, quasi équivalent) ; la version 1:1 de src/palette.ts n'est jamais appelée (2 sources de vérité). |
| UpdateBlendRegisters | 🟡 dupliqué | palette.c:795 | inline decomp-runtime.ts:1285-1294 ; src/palette.ts:535 (orphelin) | Même remarque. |
| IsSoftwarePaletteFadeFinishing | ✅ ×2 | palette.c:809 | decomp-runtime.ts:1302-1311 (inline) ; src/palette.ts:554 | Counter==4 → clear MÊME tick ✅. |
| BlendPalettes | ✅ | palette.c:832 | decomp-globals.ts:2261 | + BlendPalette (util.c:264) 1:1 à decomp-globals.ts:2238. |
| BlendPalettesUnfaded | ✅ | palette.c:844 | decomp-globals.ts:2279 | Copy 512 entries puis BlendPalettes ✅. |
| TintPalette_GrayScale | ✅ | palette.c:852 | src/palette.ts:586 | Q_8_8 exact. Orphelin (caller décomp = trainer_card.c, écran non câblé). |
| TintPalette_GrayScale2 | ✅ | palette.c:869 | src/palette.ts:597 | Utilise sRoundedDownGrayscaleMap ✅. Orphelin. |
| TintPalette_SepiaTone | ✅ | palette.c:891 | src/palette.ts:609 | Clamp r>31 seulement, comme le C ✅. Orphelin. |
| TintPalette_CustomTone | ✅ | palette.c:915 | src/palette.ts:624 | Orphelin. |
| BlendPalettesGradually | ✅ | palette.c:955 | src/palette.ts:661 | Task 1:1 (data[0..8], SetWordTaskArg→data[5/6], premier tick synchrone C:980 ✅). Rustine : fallback « final-state » sans task si CreateTask absent (l.667-676). Orphelin en jeu (callers décomp = rayquaza_scene.c:1742-2765, climax pas câblé). |
| IsBlendPalettesGraduallyTaskActive / DestroyBlendPalettesGraduallyTask | ⛔ (UNUSED) | palette.c:983/996 | — | OK. |
| Task_BlendPalettesGradually | ✅ | palette.c:1009 | src/palette.ts:706 | ++tDelayTimer>tDelay, clamp overshoot, DestroyTask ✅. Duplique la math BlendPalette en local `_blendPalette` (src/palette.ts:756) au lieu d'appeler decomp-globals.BlendPalette (identique au bit près). |

### Globals / struct
| Symbole | Statut | Détail |
|---|---|---|
| gPlttBufferUnfaded/Faded | ✅ adapté | PaletteBuffer 512×u16 (decomp-helpers.ts:134), set() ne propage PAS au rendu (1:1) ; pont unique = `flushTo()` au VBlank (decomp-runtime.ts:2066-2072). Proxies indexés 1:1 pour le code transpilé (src/palette.ts:95-114). |
| gPaletteFade | 🟡 **NOMS DIVERGENTS** | Classe PaletteFade (decomp-runtime.ts:194-269) : `y`→`brightness`, `targetY`→`endY`, `delayCounter`→`delayRemaining`, `blendColor`→`targetR/G/B` éclaté, `multipurpose1`≠`selectedPalettes` (champs SÉPARÉS alors qu'en C c'est le MÊME u32 via #define palette.h:4-7 — l'union est brisée : écrire multipurpose1 ne touche pas selectedPalettes). + champs harness fantômes (startY, currentFrame, totalFrames, delayPerStep, targetRgb15). Le code porté à la main utilise les alias — OK — mais tout FUTUR transpilé `gPaletteFade.y/.blendColor` lira `undefined` en silence (state-proxy.ts n'a aucun alias). |
| sPaletteStructs + sDummyPaletteStructTemplate | ⛔ | Sous-système entier absent — mort dans la décomp (cf. tableau). |
| sPlttBufferTransferPending | ⛔ | Remplacé par `_paletteFadeCalledThisFrame` (idempotence). Sémantique « fade gelé tant que le VBlank n'a pas drainé » non reproduite. |
| gPaletteDecompressionBuffer | 🟡 | Existe (decomp-globals.ts:162, Uint16Array(512) = 1024 bytes ✅) mais PAS branché à LoadCompressedPalette ; usage vivant = scratch SweetScent (src/fldeff_sweetscent.ts:39-47, 1:1 avec fldeff_sweetscent.c). |
| PLTT_BUFFER_SIZE / STATUS / PALETTES_* / PLTT_ID / *_PLTT_ID / FAST_FADE_* / NORMAL/FAST/HARDWARE_FADE | ✅ | src/palette.ts:43-69, valeurs exactes palette.h. |
| SetBackdropFromColor/Palette (inline palette.h:83-91) | ⛔ | Aucun équivalent TS (aucun call-site trouvé — impact nul à date). |

## 🚨 MANQUES CRITIQUES
1. **FAST_FADE jamais dispatché** — `decomp-runtime.ts:1254` UpdatePaletteFade ne route que HARDWARE_FADE ; palette.c:124-129 dispatche les 3 modes. `UpdateFastPaletteFade` (src/palette.ts:377, corps 1:1 prêt) est mort. Effet réel : `BeginFastPaletteFade(3)` (battle_script_commands.ts:9910 = FinishAction fuite/fin, battle_main.ts:5743 = HandleEndTurn_FinishBattle) ne produit AUCUN fondu (selectedPalettes==0 résiduel → zéro write, juste ~30 frames d'attente). Fix moteur : 3 lignes de dispatch `if (f.mode === FAST_FADE) return UpdateFastPaletteFade()`.
2. **battle_anim.ts:1036-1044** : `_beginHardwarePaletteFade` = no-op + `_paletteFadeActive() = false` en dur → `Task_FadeToBg` (changement de décor des anims de move, battle_anim.c:1148) charge le BG SANS fondu. La vraie BeginHardwarePaletteFade existe (src/palette.ts:472) et MARCHE (reshow l'utilise) — il ne reste qu'à câbler.
3. **Union multipurpose1/selectedPalettes brisée + noms de champs gPaletteFade non-décomp** — dette systémique pour tout code transpilé futur (lecture silencieuse d'`undefined`). Candidats : getters/setters d'alias sur la classe PaletteFade (y/targetY/delayCounter/blendColor/multipurpose1↔selectedPalettes).
4. **BeginNormalPaletteFade sans flush immédiat** (palette.c:193-199) : le 1er step n'atteint le PLTT que si `gMain.vblankCallback` est posé ; le C force la copie même bufferTransferDisabled/VBlankCB null. Cas limite (init d'écran), mais c'est un anti-flash décomp officiel.
5. **ResetPaletteFadeControl** : jamais exporté 1:1, en-tête de src/palette.ts:11 mensonger, et le call-site BattleMainCB2 (battle_main.ts:671→593) pointe sur un stub vide.

## DONNÉES / TABLES
- `sRoundedDownGrayscaleMap[32]` (palette.c:74-82) : ✅ src/palette.ts:573-581, 32 valeurs identiques.
- `sDummyPaletteStructTemplate` (palette.c:69) : ⛔ (avec le sous-système).

## ÉCRIVAINS DIRECTS PaletteBanks (contournent gPlttBuffer*→flushTo)
Recherche `bgRgb15|objRgb15|PaletteBanks|palette.loadBg|palette.loadObj` sur src/ + harness/ :
1. **src/window.ts:972-973** (`ResetVramOamAndBgCntRegs`) — `rt.gba.palette.loadBgRange/loadObjRange(i,[0])` = équivalent assumé de `CpuFill16(0, PLTT)` (menu_helpers.c:94, écrit le hardware direct) → LÉGITIME. ⚠️ Nuance : la ligne 971 zère AUSSI gPlttBufferUnfaded/Faded, ce que le C ne fait PAS (il ne touche que le PLTT hardware) — sur-clear à surveiller si un écran compte sur la survie du staging.
2. **harness/runtime/decomp-helpers.ts:161-164** — `flushTo()` lui-même = LE pont 1:1 (TransferPlttBuffer). Légitime par définition.
3. (lecture seule) harness/devtools/dev-breakpoint-tools.ts:284 lit `bgRgb15` (champ privé → undefined, sonde morte).
**Conclusion : plus aucun écran de src/ n'écrit en direct — le chantier « double-monde » est soldé côté écrivains.** Le seul flux de rendu = flushTo au VBlank, gated vblankCallback + bufferTransferDisabled (decomp-runtime.ts:2066-2072).

## RUSTINES À PURGER (après fix moteur)
1. `src/battle_anim.ts:1036` `_beginHardwarePaletteFade` no-op + `:1042` `_paletteFadeActive()=false` → remplacer par `BeginHardwarePaletteFade` (src/palette.ts:472) + `gPaletteFade.active`.
2. `src/battle_main.ts:593` `_ResetPaletteFadeControl` stub vide « Dette R3 » (chemin recorded-battle B-quit).
3. `src/battle_main.ts:6614` `_LoadCompressedPalette` stub vide « Dette R3 » (voie _BLE, textbox palette :6730).
4. `src/battle_anim_normal.ts:655-677` `AnimTask_InvertScreenColor` : ré-implémente InvertPlttBuffer inline (&0x7FFF vs 0xFFFF, valeur buffer ≠ C bit15) via sondes globalThis, et mappe le battler via `paletteBank` OAM (`_nBattlerPalSlot`:648) au lieu de `0x10000 << battler` (battle_anim_normal.c:768-774) — re-transcrire avec import direct src/palette.ts.
5. `src/palette.ts:667-676` fallback « final-state » de BlendPalettesGradually quand CreateTask absent (défensif non-décomp).
6. `src/palette.ts:756` `_blendPalette` local = doublon de decomp-globals.BlendPalette.
7. Doublons orphelins src/palette.ts:489/535/554 (UpdateHardwarePaletteFade/UpdateBlendRegisters/IsSoftwarePaletteFadeFinishing) vs inline runtime decomp-runtime.ts:1272-1311 — choisir UNE source (idéalement : le runtime dispatche vers src/palette.ts, comme le C).
8. `decomp-runtime.ts:1261` latch-clear de softwareFadeFinishing quand `!active` (pas dans le C).
9. En-tête src/palette.ts:7/9/11 : mentions « LoadPalette/UpdatePaletteFade/ResetPaletteFadeControl portées ici » inexactes (vivent dans decomp-globals/runtime).

## CALL-SITES ORPHELINS
- `UpdateFastPaletteFade` (src/palette.ts:377) — transcrit, jamais appelé (LE manque n°1).
- `UpdateHardwarePaletteFade`/`UpdateBlendRegisters` (src/palette.ts:489/535) — doublons jamais appelés (inline runtime à la place).
- `TintPalette_GrayScale/GrayScale2/SepiaTone/CustomTone` — prêtes ; caller décomp = trainer_card.c (écran non câblé).
- `BlendPalettesGradually` — prêt ; callers décomp = rayquaza_scene.c:1742-2765 (scène climax Groudon/Kyogre, à câbler avec le lot ④ climax).
- `InvertPlttBuffer` — porté mais bypassé par son unique caller vivant (rustine n°4).
- `TintPlttBuffer`/`UnfadePlttBuffer` — orphelins PAR NATURE (unique caller décomp `AnimTask_TintPalettes` = UNUSED).
- `PALETTE_FADE_STATUS_*` (src/palette.ts:44-47) — exportés, comparés nulle part hors palette.ts (les callers testent `gPaletteFade.active`, fidèle à l'usage décomp majoritaire).

# Audit 1:1 — Domaine « gfx-substrat »

> READ-ONLY. Source de vérité = décomp `D:/Projet 1/decomps/pokeemeraude`.
> Frontière harness (`harness/gba/*` = VRAM 96KB unifiée, compositor, GpuReg model) ASSUMÉE non-1:1.
> Cible de l'audit : (a) gaps de FONCTIONNALITÉ décomp que le substrat ne modélise pas ;
> (b) fidélité 1:1 des fichiers MIROIRS `src/*.ts`.
> Généré le 2026-07-02. Les `.c` gflib vivent tous sous `decomps/.../src/` (pas `gflib/`).

## Vue d'ensemble périmètre

| fichier .c | lignes | notre fichier | fns portées/total | statut | écart principal |
|---|---|---|---|---|---|
| scanline_effect.c | 254 | src/scanline_effect.ts | 9/9 | ✅ MIROIR | HW-emu documenté, aucune div. logique |
| sprite.c | 1759 | src/sprite.ts (+impls+harness) | ~78/102 fidèles | 🟡 PARTIEL | InitSpriteAffineAnim stub menteur ; affine loop cmds absents |
| palette.c | 1042 | src/palette.ts + runtime | 18 fidèles /33 | 🟡 PARTIEL | FAST_FADE non câblé au tick ; UpdateNormalPaletteFade réécrit |
| bg.c | 1247 | src/window.ts + harness | 12+6 /52 | 🟡 PARTIEL | SetBgAttribute/GetBgAttribute = silent no-op ; ShowBg comm. menteur |
| window.c | 714 | src/window.ts | 14/30 | 🟡 PARTIEL | famille 8bpp absente ; CopyWindowToVram ignore mode ; colorKey drop |
| gpu_regs.c | 195 | src/gpu_regs.ts + runtime | 2/12 nommées | 🔴 DIVERGENT | 10 fns au runtime non-nommé (SetGpuRegBits/ClearGpuRegBits inclus) |
| decompress.c | 411 | dispersé harness (nom ≠) | 0/21 au nom | 🔴 DIVERGENT | LoadSpecialPokePic* (Unown/Deoxys/Spinda) non portés au nom 1:1 |
| dma3_manager.c | 183 | ABSENT (substrat) | 0/5 | ⬜ ABSENT | file DMA remplacée par copies synchrones (exempt HW) |
| malloc.c | 224 | ABSENT ; bridge AllocZeroed stub | 0/12 | ⬜ ABSENT | AllocZeroed retourne `{}` (stub silencieux, viole doctrine) |
| blit.c | 209 | ABSENT (compositor) | 0/5 | ⬜ ABSENT | blit 4bpp tuilé (glyphes/fenêtres) réémulé ailleurs, à localiser |
| io_reg.c | 36 | globals inlinés | data-only | 🟡 données | gOrbEffectBackgroundLayerFlags introuvable (field_screen_effect à 0%) |

---

## sprite.c → src/sprite.ts (+ engine/decomp-impls/sprite-engine-impl.ts + harness)
Statut : 🟡 PARTIEL (bon socle 1:1 ; 1 stub menteur, 6 manquantes, quelques divergences de champs).
Fonctions : 102 dans sprite.c. 1:1 présentes (ici ou ailleurs, fidèles) : ~78 · présentes-divergentes : 8 · stub silencieux : 1 · manquantes : 6.
Port SPLIT (assumé, documenté en tête de sprite.ts) : `src/sprite.ts` (tags, alloc tile/pal/matrice, anim non-affine, cycle de vie) ·
 `src/engine/decomp-impls/sprite-engine-impl.ts` (famille affine-anim) · `harness/runtime/decomp-globals.ts`
 (SetSubspriteTables/AddSubsprites, InitSpriteAffineAnim=stub) · `harness/gba/compositor.ts` (BuildSpritePriorities+SortSprites+AddSpritesToOamBuffer).
Modèle FLAT global assumé (pas de sous-struct `sprite->oam` ; champs OAM à plat + oamIndex→gba.oam[]).

✅ Contexte engine-repair CONFIRMÉ : `DestroySprite` (sprite.c:618-631) libère les tiles inline — présent+correct
 (sprite.ts:1404-1447, `_freeSpriteTile` sur [oam.tileId, tileEnd)). Le fix tient.
✅ `baseTile` gap RÉSOLU : `oam.tileId = sheetTileStart + imageValue` (sprite.ts:1197), `sheetTileStart` vient de
 l'allocateur de tag (GetSpriteTileStartByTag), PAS d'une valeur hardcodée. Aucun tile-base naïf trouvé.

Manquantes (toutes sprite.c line, [vivant]/[code-mort]) :
 - `CreateSpriteAndAnimate` (sprite.c:591) [vivant, 4 callers décomp] — absente partout (juste mentions commentaire).
 - `SetSpriteSheetFrameTileNum` (sprite.c:1403) [vivant — CreateSpriteAt + slot_machine] — corps INLINÉ dans
   _CreateSpriteAtTemplate (sprite.ts:1791) mais pas de fn nommée → slot_machine (PAUSE) + repoint de sheetTileStart mid-anim n'ont pas d'appelable.
 - `SetSpriteMatrixAnchor`/`GetAnchorCoord`/`UpdateSpriteMatrixAnchorPos` (sprite.c:1206-1225) [vivant — seul caller = minigame_countdown, PAUSE].
 - `SpriteTileAllocBitmapOp` (sprite.c:755) [code-mort — 0 caller], `CopyFromSprites` (sprite.c:824) [code-mort], `CopyToSprites` (sprite.c:836) [code-mort]. Safe à laisser.
Stub silencieux (MENTEUR) :
 - `InitSpriteAffineAnim` — `harness/runtime/decomp-globals.ts:2627` = no-op `{ /* TODO future affine anims */ }`.
   Commentaire MENSONGER : le runtime affine EXISTE (sprite-engine-impl.ts : AllocOamMatrix/AffineAnimStateReset/BeginAffineAnim).
   Le vrai `InitSpriteAffineAnim` (sprite.c:1463) fait AllocOamMatrix + CalcCenterToCornerVec + matrixNum + affineAnimBeginning + AffineAnimStateReset.
   [vivant — 2 callers décomp : main_menu Birch shrink, item_menu_icons]. De plus `gba-global-scope.ts:159` câble un
   AUTRE `InitSpriteAffineAnim` → StartSpriteAffineAnim (arité/sémantique ≠ décomp). Net : pas de fn fidèle unique.
Divergences (line-ref) :
 - AllocOamMatrix : décomp scanne i=0 ; nous i=1 (slot 0 = matrice identité partagée, documenté sprite.ts:508). Le port ne rend jamais le slot 0.
 - DestroySprite libère AUSSI la matrice OAM inline (sprite.ts:1444) — décomp ne le fait pas (via caller/DestroySpriteAndFreeResources). Justifié pour battle, déviation mineure.
 - SeekSpriteAnim (sprite.ts:1381) sauve animBeginning+animDelayCounter au lieu de animPaused (décomp sprite.c:1359) ; logique approximative, pas 1:1.
 - ContinueAnim delay-branch : nous `> 0` (sprite.ts:1231) vs décomp `if (animDelayCounter)` (nonzero) — edge-case négatif.
 - SortSprites (compositor.ts:164) : OMET l'ajustement Y des sprites ST_OAM_AFFINE_DOUBLE+SIZE_3 (sprite.c:391-411) + JS Array.sort ≠ insertion-sort décomp → ordre des égaux peut différer (mons battle intro 64×64 double aux bords d'écran).
Gaps substrat :
 - `sAffineAnimStates[OAM_MATRIX_COUNT]` global NON modélisé → état affine PAR SPRITE (documenté). 2 sprites partageant une matrice divergeraient.
 - Affine LOOP cmds (AffineAnimCmd_loop/Begin/Continue/JumpToTop, sprite.c:1124-1161) NON portées — ContinueAffineAnim collapse LOOP/JUMP → index=0. Boucles affines imbriquées non supportées. [vivant battle, PAUSE].
 - `SetOamMatrixRotationScaling` (sprite.ts:664) fallback SILENCIEUX identité si `globalThis.__sineTable` non câblé → piège latent no-rotation (la copie impl.ts importe gSineTable direct = sûre).
 - `sSpriteTileAllocBitmap[128]` + AllocSpriteTiles + FreeSpriteTilesByTag = 1:1 ✅. LoadOam = no-op documenté légitime (compositor lit gba.oam[] live).
Fixes prioritaires : (1) remplacer le no-op InitSpriteAffineAnim par la vraie cascade + réconcilier gba-global-scope.ts:159 ;
 (2) ajouter SetSpriteSheetFrameTileNum ; (3) porter les affine loop cmds avant de dé-pauser battle ; (4) SetSpriteMatrixAnchor (minigame) ; (5) CreateSpriteAndAnimate (trivial).

---

## scanline_effect.c → src/scanline_effect.ts
Statut : ✅ MIROIR (adaptations HW-emu documentées, LOGIQUE 1:1)
Fonctions : 9/9 présentes au nom 1:1 — ScanlineEffect_Stop, ScanlineEffect_Clear, ScanlineEffect_SetParams, ScanlineEffect_InitHBlankDmaTransfer, CopyValue16Bit, CopyValue32Bit, TaskFunc_UpdateWavePerFrame, GenerateWave, ScanlineEffect_InitWave.
Divergences : aucune divergence LOGIQUE. Adaptations HW assumées + documentées en tête de fichier :
 - Pas de DMA HBlank matériel → émulé par `rt.gba.setHBlankCallback` (timing HBlank exact, appelé avant chaque scanline).
 - `dmaDest` = REG_OFFSET (0x10..0x1E) au lieu d'un pointeur.
 - Double-buffer `srcBuffer ^= 1` élidé (mono-thread JS) — commenté ligne 205 ; résultat visuel identique.
 - `gScanlineEffectRegBuffers[2][0x3C0]`, `gScanlineEffect`, `sShouldStopWaveTask` : globals 1:1.
 - Globals combat `gBattle_BGn_X/Y` lus via globalThis (combat en PAUSE = valeurs 0, acceptable).
Gaps substrat : néant (le seul consommateur field = Dig/Extrasensory/AcidArmor/Surf, tous couverts via REG_OFFSET + REG_BLDALPHA scanline 0x52).
Stubs suspects : néant.
Note : REG_BLDALPHA par-scanline (dmaDest 0x52) est géré (ligne 100) → vague Surf/Muddy Water 1:1. Bonne fidélité.

---

## bg.c → src/window.ts (consolidé) + harness (SetGpuReg/LoadBgTiles)
Statut : 🟡 PARTIEL — réimplémentation COMPORTEMENTALE sur substrat différent, PAS transcrite. Plusieurs gaps réels + silent no-ops.
Fonctions : 52 dans bg.c. 12 présentes dans window.ts (divergentes pour la plupart) · 6 ailleurs (substrat) · 34 manquantes (~9 vivant-fondues-dans-SetGpuReg, ~25 code-mort/inutilisées).
Substrat : `GbaWindow[]` + pixelBuffer 1 octet/pixel (décomp = 4bpp tuilé EWRAM) ; compositor lit `bg.tilemap`/`bg.config` chaque frame (décomp = DMA→VRAM + BGxCNT).

Divergences majeures (présentes mais réécrites) :
 - `InitBgFromTemplate` (bg.c:345 ↔ window.ts:603) : écrit charBase/mapBase/screenSize/paletteMode/priority/baseTile ✅
   mais **IGNORE mosaic & wraparound** (absents de l'interface BgTemplate du port), ne reset PAS bg_x/bg_y, ne set PAS visible=1.
 - `InitBgsFromTemplates` (bg.c:312 ↔ window.ts:597) : IGNORE l'arg bgMode (1er param) — pas de SetBgModeInternal/ResetBgControlStructs.
 - `ShowBg`/`HideBg` (bg.c:464/470 ↔ window.ts:619/626) : ne set QUE `config.visible`. 🔴 **Commentaire MENSONGER window.ts:616-618**
   (« PUIS appelle SyncBgVisibilityAndMode IMMEDIATEMENT ») — le corps n'appelle NI Sync NI SetGpuReg. Marche car compositor lit cfg direct, mais le chemin register-encode est perdu.
 - `ChangeBgX`/`ChangeBgY` (bg.c:541/621 ↔ window.ts:645/632) : pas d'op SUB, pas de bg_x 28.8-fixed, pas de split L/H affine ; écrit cfg.hofs direct, masque &0x1FF.
 - `ResetBgsAndClearDma3BusyFlags` (bg.c:299 ↔ window.ts:656) : ne reset PAS baseTile, drop gWindowTileAutoAllocEnabled.
 - `CopyToBgTilemapBuffer` (bg.c:874 ↔ window.ts:828) : suppose pré-décompressé, unité destOffset diffère (décomp bytes×2 vs entry index).
 - `FillBgTilemapBufferRect` (bg.c:1028 ↔ window.ts:785) : NORMAL-only, pas de logique AFFINE/screenSize-metric/MAPGRID mask.
 - `GetBgTilemapBuffer` (bg.c:864 ↔ window.ts:847) : retourne toujours un Uint16Array (jamais NULL) → casse la logique NULL-check d'InitWindows.
 - `GetTileMapIndexFromCoords` réimplémenté inline (window.ts:226) : screenSize=3 diverge du fallthrough décomp (case 3→case 1 `y+=0x20`).
Ailleurs (substrat) : `LoadBgTiles` (bg.c:375 → decomp-globals.ts:321, **ignore baseTile assumé 0 + paletteMode** — honnête mais 2 chemins de placement de tuiles incohérents coexistent) ;
 register model BGxCNT → decomp-runtime.ts:769 (applyBgCnt) ; `CopyBgTilemapBufferToVram`/`ScheduleBgCopyTilemapToVram` = no-op légitimes (compositor lit tilemap direct).
Manquantes VIVANTES notables :
 - 🔴 `SetBgAttribute` (bg.c:476) + `GetBgAttribute` (bg.c:504) [vivant] — **SILENT NO-OP** : appelés via `rt()?.SetBgAttribute?.(…)`
   (battle_intro.ts:100, pokemon_summary_screen.ts:665) mais le runtime N'A PAS cette méthode → optional-chaining no-op. Les resets charBase du battle intro NE FONT RIEN.
 - 🔴 `WriteSequenceToBgTilemapBuffer` (bg.c:1033) [vivant] — primitive partagée que PutWindowTilemap/FillBgTilemapBufferRect/PutWindowRectTilemap délèguent ; réimplémentée par-caller au lieu d'être centralisée.
 - `SetBgTilemapBuffer`/`UnsetBgTilemapBuffer` (bg.c:848/856) [vivant] · `SetBgAffineInternal`/`SetBgAffine` (bg.c:244/772) [vivant, affine BG2/3] ·
   `SyncBgVisibilityAndMode` (bg.c:234) · `SetBgMode`/`GetBgMode` (bg.c:370/64) · `LoadBgVram`/`LoadBgTilemap` (bg.c:173/404) ·
   `GetBgMetricTextMode`/`GetBgMetricAffineMode` (bg.c:1073/1119, sizing buffer) · `GetBgType` (bg.c:1192) · `ChangeBgY_ScreenOff` (bg.c:691) · `GetBgX`/`GetBgY` (bg.c:611/762).
 Code-mort : ResetBgs, ResetBgControlStructs, SetBgControlAttributes, ShowBgInternal/HideBgInternal, BgTileAllocOp (dummied décomp aussi), Unused_*.

---

## window.c → src/window.ts
Statut : 🟡 PARTIEL — réimplémentation comportementale (GbaWindow[] + pixelBuffer row-major vs 4bpp tuilé). Net-effect souvent bon, plusieurs divergences sémantiques.
Fonctions : 30 dans window.c. 14 présentes · 0 vrai ailleurs · 16 manquantes (dont famille 8bpp entière + variantes rect).
Divergences majeures :
 - `AddWindow` (window.c:109 ↔ window.ts:296) : **pas de cap WINDOWS_MAX(32)**, pas de réutilisation de slot, pas de failure path, IDs monotones jamais réutilisés (RemoveWindow=splice). Modèle de slot différent.
 - `CopyWindowToVram` (window.c:266 ↔ window.ts:379) : **IGNORE le mode (MAP/GFX/FULL)** (commentaire :382 « on fait la même chose ») → COPYWIN_MAP re-blit à tort les pixels ; COPYWIN_FULL saute la copie tilemap.
 - `BlitBitmapRectToWindow` (window.c:398 ↔ window.ts:489) : **colorKey/transparence DROP** — écrit color-0 sur dest au lieu de skip → peut effacer le contenu sous-jacent (pixels source transparents).
 - `InitWindows` (window.c:26 ↔ window.ts:256) : retourne `number[]` d'IDs au lieu de bool16 (documenté) ; pas d'alloc tilemap-buffer, pas d'auto-alloc.
 - `GetWindowAttribute` (window.c:558 ↔ window.ts:280) : **omet WINDOW_TILE_DATA** (case 7 → default:0).
 - `CopyToWindowPixelBuffer`/`FillWindowPixelBuffer`/`PutWindowTilemap`/`ClearWindowTilemap`/`ScrollWindow` : net-effect ported, pas littéral (documenté).
 - `CallWindowFunction` (window.c:525 ↔ window.ts:415) : 1:1 ✅. `CopyTileMapEntry` = 1:1 ✅.
Manquantes VIVANTES : `PutWindowRectTilemap` (window.c:371, redraws partiels list_menu/party) · `AddWindowWithoutTileMap` (:181) · `CopyWindowRectToVram` (:286) ·
 `PutWindowRectTilemapOverridePalette` (:334) · `SetWindowAttribute` (:531, muter tilemapLeft/paletteNum/baseBlock post-création) ·
 **famille 8bpp entière** [vivant — summary screen/contest] : `AddWindow8Bit` (:600), `FillWindowPixelBuffer8Bit` (:647), `FillWindowPixelRect8Bit` (:657), `BlitBitmapRectToWindow4BitTo8Bit` (:668), `CopyWindowToVram8Bit` (:684).
 Code-mort : DummyWindowBgTilemap*, BlitBitmapRectToWindowWithColorKey (UNUSED), GetNumActiveWindowsOnBg*.
Note : DrawWindowBorder*/SetWindowBorderStyle NE sont PAS des fns window.c → menu.c/text_window.c, re-exportées depuis ./menu (window.ts:742) = présent-ailleurs par design, pas un gap.
BgTemplate honoré : ✅ charBase/mapBase/screenSize/paletteMode/priority/baseTile · ❌ mosaic/wraparound/bg_x/bg_y/visible.
WindowTemplate honoré : ✅ bg/tilemapLeft/Top/width/height/paletteNum/baseBlock · ❌ auto-alloc baseBlock (gWindowTileAutoAllocEnabled — mais dummied décomp aussi = OK).

---

## decompress.c → ABSENT au nom 1:1 (dispersé harness, signatures divergentes)
Statut : 🔴 DIVERGENT — 0/21 fonctions au nom 1:1 dans un `decompress.ts`. Certaines ré-implémentées ailleurs sous signatures ≠.
Ailleurs : `LZDecompressVram` (decompress.c:17 → decomp-globals.ts:1357, signature `(srcSymbol: string, destAddr: number)` = symbol lookup ≠ pointeur décomp) ·
 `LoadCompressedSpriteSheet` (decompress.c:22 → decomp-globals.ts:1852) · `LoadCompressedSpriteSheetUsingHeap` (:275 → decomp-globals.ts:1368) ·
 `LoadCompressedSpritePaletteUsingHeap` (:292 → decomp-globals.ts:1378).
Manquantes au nom 1:1 (vivantes) : `LZDecompressWram` (:12), `LoadCompressedSpritePalette` (:44), `LoadCompressedSpriteSheetOverrideBuffer` (:33),
 `LoadCompressedSpritePaletteOverrideBuffer` (:54), `DecompressPicFromTable` (:64), `HandleLoadSpecialPokePic` (:73), `LoadSpecialPokePic` (:85),
 `GetDecompressedDataSize` (:269), `DecompressPicFromTable_2` (:307), `LoadSpecialPokePic_2` (:316), `HandleLoadSpecialPokePic_2` (:346),
 `DecompressPicFromTable_DontHandleDeoxys` (:358), `HandleLoadSpecialPokePic_DontHandleDeoxys` (:366), `LoadSpecialPokePic_DontHandleDeoxys` (:378), `Unused_LZDecompressWramIndirect` (:115, code-mort).
 `DuplicateDeoxysTiles` (:407, static) / `StitchObjectsOn8x8Canvas` (:120, UNUSED code-mort).
Gaps substrat : le CŒUR (`LZ77UnCompWram`/`LZ77UnCompVram`, décompression LZ77 réelle) est remplacé par la pipeline d'assets (les PNG sont pré-décodés à l'import) →
 le mécanisme LZ77 lui-même est exempt (résultat pixels identique). MAIS la famille `LoadSpecialPokePic*` (gestion Unown letter, Deoxys tiles, Spinda spots)
 porte de la LOGIQUE JEU (pas juste HW) : si non portée au nom 1:1, ces cas (Unown, Deoxys, Spinda) risquent d'être manquants côté rendu mon-pic. À vérifier
 quand pokemon.c/trainer_pokemon_sprites avancent. Statut checklist decompress.c = 🔴 manquant confirmé.

---

## gpu_regs.c → src/gpu_regs.ts (2) + decomp-helpers.ts (2) + runtime (le reste)
Statut : 🔴 DIVERGENT — le gestionnaire de registres (buffer + sync VBlank) n'existe PAS au nom 1:1.
Fonctions : 4/12 au nom 1:1.
 - Présentes : `SetGpuReg` (gpu_regs.ts:8 → getRuntime().SetGpuReg), `GetGpuReg` (gpu_regs.ts:13),
   `SetGpuRegBits` (decomp-helpers.ts:246, 1:1 correct : GetGpuReg|mask), `ClearGpuRegBits` (decomp-helpers.ts:252, 1:1 : GetGpuReg&~mask).
Manquantes au nom 1:1 (8) :
 - `InitGpuRegManager` (gpu_regs.c:21) [vivant — appelé au boot]
 - `CopyBufferedValueToGpuReg` (gpu_regs.c:36, static) [vivant]
 - `CopyBufferedValuesToGpuRegs` (gpu_regs.c:49) [vivant — VBlank]
 - `SetGpuReg_ForcedBlank` (gpu_regs.c:100) [vivant]
 - `SyncRegIE` (gpu_regs.c:154, static) [vivant]
 - `EnableInterrupts` (gpu_regs.c:166) [vivant]
 - `DisableInterrupts` (gpu_regs.c:174) [vivant]
 - `UpdateRegDispstatIntrBits` (gpu_regs.c:182, static) [vivant]
Divergences / gaps substrat :
 - Le mécanisme de BUFFER (`sGpuRegBuffer[0x60]`, `sGpuRegWaitingList`, `sGpuRegBufferLocked`) + la synchro VBlank
   (`CopyBufferedValuesToGpuRegs`) sont RÉ-IMPLÉMENTÉS dans le runtime (DecompRuntime.SetGpuReg/GetGpuReg),
   pas au nom 1:1. Le double-buffering VBlank (écriture immédiate si vcount 161..225 ou FORCED_BLANK, sinon
   file d'attente) n'est probablement pas modélisé fidèlement (à vérifier côté runtime — délégation opaque).
 - `SetGpuRegBits`/`ClearGpuRegBits` (gpu_regs.c:142-152) : appelés partout dans le code jeu (BLDCNT, WININ,
   BLDALPHA…). NON présents au nom 1:1 → les consommateurs auto-transpilés/portés doivent réémuler `GetGpuReg | mask`
   à la main OU passer par un homonyme du runtime. À CONFIRMER qu'ils existent quelque part.
 - `EnableInterrupts`/`DisableInterrupts` = HW (INTR_FLAG_*), exempt, mais le stub DISPSTAT intr bits
   (`UpdateRegDispstatIntrBits`) qui change REG_DISPSTAT n'a pas d'effet visuel → OK d'exempter.
Fix recommandé « Étape 5 » : consolider les 10 fns dans `src/gpu_regs.ts` au nom 1:1, le buffer sGpuRegBuffer étant
 un simple Uint16Array côté TS, la synchro VBlank branchée sur le tick VBlank du runtime. Effort M.

---

## dma3_manager.c → ABSENT (substrat harness)
Statut : ⬜ ABSENT au nom 1:1 — file de requêtes DMA non modélisée.
Fonctions : 0/5 au nom 1:1.
Manquantes : `ClearDma3Requests` (dma3_manager.c:25) [vivant — boot/main loop], `ProcessDma3Requests`
 (dma3_manager.c:42) [vivant — VBlank], `RequestDma3Copy` (dma3_manager.c:98) [vivant], `RequestDma3Fill`
 (dma3_manager.c:130) [vivant], `CheckForSpaceForDma3Request` (dma3_manager.c:163) [vivant].
Contexte : `RequestDma3Copy/Fill` appelés par bg.c, menu.c, main.c, mon_markings.c, battle_anim*. Dans notre repo
 les seuls hits sont battle_anim.ts (PAUSE) + JSON extraits. Le pattern DMA3 (copie asynchrone étalée sur plusieurs
 VBlank, max 40KiB/frame) est REMPLACÉ par des copies synchrones directes (LoadBgTiles, etc.) côté substrat.
Verdict : EXEMPT en tant que mécanisme HW (le résultat = data en VRAM au bon endroit, ce que le substrat fait
 synchrone). MAIS : les fns publiques `RequestDma3Copy`/`CheckForSpaceForDma3Request` peuvent être appelées comme
 des API par du code jeu porté (ex. attente `CheckForSpaceForDma3Request(-1) != -1`). Si un fichier miroir les
 appelle, il faut un homonyme (stub qui retourne « toujours prêt » 0). À surveiller lors du portage de menu.c/main.c.

---

## malloc.c → ABSENT au nom 1:1 (bridge AllocZeroed = stub silencieux)
Statut : ⬜ ABSENT / 🔴 stub silencieux.
Fonctions : 0/12 au nom 1:1 (aucun `Alloc`/`Free`/`InitHeap` défini nommé, sauf `AllocZeroed` dans le bridge).
Manquantes : PutMemBlockHeader, PutFirstMemBlockHeader, AllocInternal, FreeInternal, AllocZeroedInternal,
 CheckMemBlockInternal, InitHeap, Alloc, AllocZeroed(vrai), Free, CheckMemBlock, CheckHeap (malloc.c:31-224). Toutes [vivant].
Stub suspect (PREUVE) : `harness/runtime/decomp-bridge.ts:173`
 `export function AllocZeroed<T = any>(_sizeBytes: number): T { return {} as T; }`
 → retourne un objet vide `{}`, IGNORE la taille. C'est un stub silencieux : tout code qui `AllocZeroed(N)` puis
 écrit dans le buffer (ex. `LZ77UnCompWram(src, buffer)` dans decompress.c LoadCompressedSpriteSheetUsingHeap)
 obtient un `{}` non-indexable → le remplissage part dans le vide. Fonctionne UNIQUEMENT parce que les vrais
 consommateurs gfx (LoadCompressedSpriteSheet…) ont été ré-implémentés dans decomp-globals sans passer par ce heap.
Verdict : le heap C n'a pas besoin d'être porté 1:1 (JS a un GC), MAIS le stub `{}` est trompeur — préférer soit
 un vrai `new Uint8Array(size)` (utile pour les buffers), soit throw NotImplemented (fail-fast, doctrine du bridge
 en tête de fichier ligne 13-18 : « Pas de stubs silencieux qui retournent 0/null/false »). Ici on retourne `{}` =
 viole la doctrine du fichier lui-même. Effort S.
Gaps substrat : `gHeap[HEAP_SIZE]`, ref-counting de blocs — non applicable (GC). OK.

---

## blit.c → ABSENT (substrat compositor)
Statut : ⬜ ABSENT au nom 1:1.
Fonctions : 0/5 au nom 1:1. `BlitBitmapRect4BitWithoutColorKey` (blit.c:4), `BlitBitmapRect4Bit` (blit.c:9),
 `FillBitmapRect4Bit` (blit.c:73), `BlitBitmapRect4BitTo8Bit` (blit.c:106), `FillBitmapRect8Bit` (blit.c:184).
 Toutes [vivant] — appelées par text.c (glyphes) et window.c (FillWindowPixelRect / BlitBitmapRectToWindow).
Gaps substrat : le blit pixel-4bpp tiled (adressage tuilé `((x>>1)&3)+((x>>3)<<5)+…`) est le CŒUR du rendu de
 texte/fenêtres GBA. S'il n'est pas porté, alors `FillWindowPixelBuffer`/`BlitBitmapToWindow`/glyph draw doivent
 le réémuler dans window.ts/text.ts OU le substrat dessine le texte autrement (glyphe → tile direct). À CONFIRMER
 dans l'audit window.ts/text.ts (sous-agent) : si le texte s'affiche correctement en jeu, une forme de blit existe
 forcément quelque part — il faut la localiser et vérifier qu'elle est fidèle à l'adressage tuilé (sinon glyphes
 décalés d'un demi-octet = artefacts). C'est le domaine des bugs « ₽ manquant / fond blanc ».

---

## palette.c → src/palette.ts (split logique) + decomp-globals.ts + decomp-runtime.ts
Statut : 🟡 PARTIEL — fade fidèle en SUBSTANCE, PAS transcrit ligne-à-ligne ; 1 branche FAST_FADE non câblée.
Fonctions : 33 dans palette.c. 1:1 fidèles : 18 · divergentes/réécrites : 5 · ailleurs (bon endroit) : 6 · manquantes : 4 (3 code-mort, 1 VIVANT).

Le miroir est un SPLIT (assumé) : logique pure dans `src/palette.ts` ; fade/buffers stateful délégués à
`decomp-globals.ts` + `decomp-runtime.ts` ; palettes SPRITE dans `src/sprite.ts` (domaine sprite.c). ✅ Le contrat
DOUBLE-BUFFER `gPlttBufferUnfaded` (maître) / `gPlttBufferFaded` (flush PLTT) est CORRECT et respecté partout
(blend/fade lisent Unfaded, écrivent Faded) — c'est l'invariant clé pour « sprites NOIRS » / « mosaïque pendant BLUR »,
et il est INTACT.

Ailleurs (portées, bon endroit) : LoadPalette (palette.c:91 → decomp-globals.ts:281, écrit les 2 buffers ✓),
 TransferPlttBuffer (:103 → decomp-globals.ts:1606, voir DIV-5), ResetPaletteFade (:136 → decomp-globals.ts:1562,
 voir DIV-4), BlendPalette (→ :2405 ✓), BlendPalettes (:832 → :2428 ✓), BlendPalettesUnfaded (:844 → :2446 ✓).
 BeginNormalPaletteFade/UpdatePaletteFade (palette.ts:276,283) = délégateurs minces → decomp-runtime.ts.

1:1 fidèles (vérifiées) : LoadCompressedPalette, FillPalette, InvertPlttBuffer, UnfadePlttBuffer,
 BeginFastPaletteFade, BeginFastPaletteFadeInternal, UpdateFastPaletteFade (switch 4 sous-modes complet),
 BeginHardwarePaletteFade, UpdateHardwarePaletteFade, UpdateBlendRegisters, IsSoftwarePaletteFadeFinishing,
 TintPalette_GrayScale/GrayScale2/SepiaTone/CustomTone, BlendPalettesGradually + Task_BlendPalettesGradually.

Divergences :
 - **DIV-1 (LA PLUS IMPORTANTE) — `UpdateNormalPaletteFade` (palette.c:408-492) RÉÉCRIT, pas transcrit.** Fondu dans
   `decomp-runtime.ts UpdatePaletteFade` (L1238-1341). Le dispatcher C `UpdatePaletteFade` (:116-134) est absent
   → 🔴 **la branche `mode==FAST_FADE` (palette.c:126 → UpdateFastPaletteFade) N'EST PAS câblée dans le tick runtime.**
   `UpdateFastPaletteFade` existe (palette.ts:342) et est correcte, mais rien dans la boucle de frame runtime n'y
   dispatche → les FAST fades (entrée/sortie de grotte) risquent de NE PAS s'animer. ORACLE : entrer/sortir d'une grotte.
 - DIV-2 : `BeginNormalPaletteFade` perd sa valeur de retour bool8 (C:165 FALSE si déjà actif) → void.
 - DIV-3 : `BeginNormalPaletteFade` saute le flush PLTT immédiat (C:193-199 CpuCopy32 faded→PLTT) → différé au VBlank. Documenté.
 - DIV-4 : `ResetPaletteFade` ne reset PAS le tableau `sPaletteStructs[16]` (C:136-144 boucle PaletteStruct_Reset).
   No-op en pratique (PaletteStruct non porté) MAIS **commentaire mensonger** decomp-globals.ts:1559-1560
   (« ResetPaletteFade ne set que bufferTransferDisabled » alors que le vrai C reset 16 structs + tout le control).
 - DIV-5 : `TransferPlttBuffer` omet le hook HARDWARE_FADE→UpdateBlendRegisters (C:111) ; reporté dans runtime UpdatePaletteFade. Pas 1:1.
Manquantes :
 - `PaletteStruct_ResetById` (palette.c:344) [VIVANT] — appelé par battle_anim_mons.c:725. TOUT le sous-système
   PaletteStruct (Copy/Blend/TryEnd/Reset/GetPalNum/Run, sPaletteStructs[16]) est absent. En-tête C le dit « unused »
   mais ce getter a 1 caller battle-anim → gap silencieux (combat en PAUSE = acceptable, à noter).
 - BeginPlttFade (:204) [code-mort UNUSED], IsBlendPalettesGraduallyTaskActive (:983) [code-mort], DestroyBlendPalettesGraduallyTask (:996) [code-mort], ReadPlttIntoBuffers (:146) [code-mort].
Stubs suspects : `LoadCompressedPalette` (palette.ts:112) suppose src déjà décompressé (n'appelle PAS LZDecompressWram,
 délègue à la pipeline d'assets) → raccourci documenté honnête, mais pas le corps 1:1 du C.

---

## io_reg.c → globals dispersés
Statut : 🟡 données (io_reg.c = data-only, 0 fonction).
Contenu : `sUnused[]` (code-mort, 16 entrées), `gOverworldBackgroundLayerFlags[4]` (io_reg.c:24) [vivant — overworld.c],
 `gOrbEffectBackgroundLayerFlags[4]` (io_reg.c:31) [vivant — field_screen_effect.c].
Chez nous : `gOverworldBackgroundLayerFlags` trouvé dans `src/overworld.ts` (défini inline). `gOrbEffectBackgroundLayerFlags`
 introuvable (field_screen_effect.ts est à 0% — cf. checklist). Pas de fichier `io_reg.ts` mais ce sont des données
 → OK de les inliner au foyer consommateur (pattern data-relocation assumé). Vérifier valeurs BLDCNT_TGT2_BGn.

---

## Fourre-tout : decomp-bridge.ts / decomp-globals.ts / decomp-runtime.ts (état)
Statut : 🟠 fourre-tout TRÈS vivants (à dissoudre — cf. memory `decomp-globals-fourre-tout-a-dissoudre`).

| fichier | lignes | exports | importeurs | rôle gfx-substrat |
|---|---|---|---|---|
| harness/runtime/decomp-bridge.ts | 505 | 14 | 10 | quasi vidé (re-exports morts sweepés) ; reste `AllocZeroed` (stub `{}`), `CpuCopy16`, `gSineTable` |
| harness/runtime/decomp-globals.ts | 2632 | 264 | 111 | **foyer de facto des fns gfx 1:1-nommées** : LoadPalette, LoadBgTiles, LZDecompressVram, LoadSpriteSheet/Palette, LoadCompressedSpriteSheet, TransferPlttBuffer, ResetPaletteFade, BlendPalettes(Unfaded), InitSpriteAffineAnim(stub), DmaClear16, CpuSet/CpuFastSet(no-op) |
| harness/runtime/decomp-runtime.ts | 2093 | 106 | 85 | DecompRuntime : SetGpuReg/GetGpuReg (buffer registres), applyBgCnt, UpdatePaletteFade (fade state machine), gTasks, gSprites |

Constat gfx-substrat : les fichiers MIROIRS `src/gpu_regs.ts` (16 lignes), `src/palette.ts` (partiel) délèguent au runtime,
mais une grande partie de la LOGIQUE gfx 1:1-nommée vit dans `decomp-globals.ts` (fourre-tout), PAS dans son foyer 1:1
(`palette.ts`/`sprite.ts`/`bg.ts`-inexistant/`decompress.ts`-inexistant). C'est la dette « Étape 5 » : rapatrier ces
fns au nom 1:1 vers leur foyer + décycler du fourre-tout. Stubs no-op confirmés dans le fourre-tout : `AllocZeroed`
(bridge:173 `{}`), `CpuSet`/`CpuFastSet` (globals:441/447 no-op), `InitSpriteAffineAnim` (globals:2627 no-op menteur).
Fichiers `bridge-dead-owndefs.txt` / `bridge-dead-reexports.txt` = VIDES (sweep déjà passé sur le bridge ; le gros reste = globals/runtime).

---

## Récapitulatif des SILENT STUBS / COMMENTAIRES MENTEURS trouvés (preuve)
1. `harness/runtime/decomp-globals.ts:2627` `InitSpriteAffineAnim` = no-op `{ /* TODO future affine anims */ }` alors que le runtime affine EXISTE (sprite-engine-impl.ts). [vivant : main_menu Birch, item_menu_icons].
2. `harness/runtime/decomp-bridge.ts:173` `AllocZeroed` = `return {} as T` (ignore taille) — viole la doctrine du fichier lui-même (ligne 13-18 : « pas de stubs silencieux »).
3. `harness/runtime/decomp-globals.ts:441/447` `CpuSet`/`CpuFastSet` = no-op — masque toute copie mémoire brute non couverte par un helper de plus haut niveau.
4. `src/window.ts:616-618` `ShowBg` : commentaire « appelle SyncBgVisibilityAndMode IMMEDIATEMENT » — FAUX (ne l'appelle jamais).
5. `SetBgAttribute`/`GetBgAttribute` : appelés via `rt()?.SetBgAttribute?.()` (battle_intro.ts:100, pokemon_summary_screen.ts:665) mais AUCUNE définition n'existe (grep `export function SetBgAttribute` = 0) → **silent no-op** (charBase resets du battle intro sans effet).
6. `harness/runtime/decomp-globals.ts:1559-1560` commentaire ResetPaletteFade sous-décrit le vrai C (16 PaletteStruct + control).
7. `harness/runtime/decomp-globals.ts:319-321` `LoadBgTiles` « ignores baseTile (assumed 0) » — honnête mais crée 2 chemins de placement de tuiles incohérents (l'autre = window.ts copyPixelBufferToVram qui, lui, applique baseTile).

---

## TOP 5 (levier × effort)

1. **`SetBgAttribute`/`GetBgAttribute` = SILENT NO-OP** — 🔴 levier HAUT, effort **M**.
   Preuve : `grep export function SetBgAttribute` → 0 ; appels `rt()?.SetBgAttribute?.()` no-op (battle_intro.ts:100, pokemon_summary_screen.ts:665). Beaucoup d'écrans reconfigurent un BG à chaud (charBase/mapBase/screenSize) via ces fns → ils échouent silencieusement. Bloque tout import décomp qui les utilise.
   FIX : porter `SetBgAttribute`/`GetBgAttribute` (bg.c:476/504) au nom 1:1 (muter `bg.config` + décoder BG_ATTR_*).
   ORACLE : ouvrir la fiche Pokémon (Résumé) d'un mon en équipe → si un BG a un charBase reconfiguré, l'écran doit s'afficher sans tuiles corrompues ; ou entrer en combat sauvage (battle_intro reset charBase) une fois combat dé-pausé.

2. **`InitSpriteAffineAnim` stub menteur + affine loop cmds absents** — 🔴 levier HAUT (affine partout : shrink Birch, évolution, combat), effort **M**.
   Preuve : decomp-globals.ts:2627 no-op ; gba-global-scope.ts:159 câble un homonyme de sémantique ≠. Affine LOOP (sprite.c:1124-1161) collapse en index=0.
   FIX : remplacer le no-op par la vraie cascade (AllocOamMatrix+CalcCenterToCornerVec+matrixNum+affineAnimBeginning+AffineAnimStateReset) ; porter les 4 affine loop cmds.
   ORACLE : main menu → new game → intro Birch : le Pokémon doit RÉTRÉCIR/grossir en douceur (affine anim). Si figé/sautant = stub.

3. **FAST_FADE non câblé au tick + UpdateNormalPaletteFade réécrit** — 🔴 levier HAUT (fades = partout), effort **S-M**.
   Preuve : `UpdateFastPaletteFade` (palette.ts:342) existe mais aucun dispatch `mode===FAST_FADE` dans `decomp-runtime.ts UpdatePaletteFade` (L1238-1341).
   FIX : rétablir le dispatcher `UpdatePaletteFade` 1:1 (palette.c:116-134) : NORMAL→UpdateNormalPaletteFade, FAST_FADE→UpdateFastPaletteFade, HARDWARE→UpdateHardwarePaletteFade.
   ORACLE : entrer/sortir d'une grotte (BeginFastPaletteFade) → le fondu blanc/noir rapide doit s'animer, pas snap instantané.

4. **Consolider gpu_regs.c au nom 1:1 (« Étape 5 »)** — 🟡 levier MOYEN (dette structurelle miroir), effort **M**.
   Preuve : 8/12 fns hors foyer (InitGpuRegManager, CopyBufferedValuesToGpuRegs, SetGpuReg_ForcedBlank, la synchro VBlank double-buffer…) dans le runtime opaque.
   FIX : `src/gpu_regs.ts` complet (sGpuRegBuffer = Uint16Array, waiting list, sync branchée sur le tick VBlank runtime).
   ORACLE (structurel) : `tsc` = 0 après rapatriement ; visuellement, aucune régression sur un écran qui écrit BLDCNT/WININ (ex. transition de fondu overworld).

5. **`AllocZeroed` stub `{}` + `CpuSet`/`CpuFastSet` no-op** — 🟡 levier MOYEN (fail-fast + copies réelles), effort **S**.
   Preuve : decomp-bridge.ts:173 `return {} as T` ; decomp-globals.ts:441/447 no-op.
   FIX : `AllocZeroed(n)` → `new Uint8Array(n)` (ou throw NotImplemented si buffer non attendu, per doctrine du bridge) ; brancher `CpuSet`/`CpuFastSet` sur des copies typed-array quand src/dst sont des Uint*Array (comme CpuCopy16 le fait déjà).
   ORACLE : `LoadCompressedSpriteSheetUsingHeap` (AllocZeroed→LZ77UnCompWram→buffer) doit produire un sprite non-vide (ex. icône de sac chargée via heap) au lieu d'un blanc.

## Note transversale (bugs cités par le mandat)
- « sprites NOIRS = FreeAllSpritePalettes manquant » : `FreeAllSpritePalettes` EST porté (sprite.ts, famille palette-tag 1:1 ✅). Le contrat unfaded/faded est INTACT (audit palette). Donc si NOIRS persiste, cause = init d'écran qui n'appelle pas FreeAllSpritePalettes, PAS un gap substrat.
- « mosaïque de l'OBJ pendant BLUR (starter_choose) » : le substrat MODÉLISE le mosaic OBJ (types.ts OamEntry.mosaic + MosaicConfig objH/objV) → si l'OBJ est mosaïcé à tort pendant le BLUR, cause = caller (REG_MOSAIC/BLDCNT laissé actif sur l'OBJ), PAS un gap. Piste : `SetGpuRegBits(REG_OFFSET_MOSAIC…)` ou `BLDCNT_TGT` mal effacé au sortir du fade — lié au TOP 3/4 (fade+gpu_regs).
- « cercle starter noir≠blanc » : probablement palette slot 0 du cercle (BG vs OBJ) — relève de LoadPalette/asset, pas d'un gap de fonction gfx.

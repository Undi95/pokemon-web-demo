# Audit moteur — `src/bg.c` (~1248 lignes) vs port ÉCLATÉ

Décomp : `D:/Projet 1/decomps/pokeemeraude/src/bg.c` + `include/bg.h`
Port : **aucun `src/bg.ts`** — éclaté sur `src/window.ts` (cluster principal), `harness/runtime/decomp-globals.ts`,
`harness/runtime/decomp-runtime.ts` (chemin registre SetGpuReg), `harness/gba/{bg-layer,compositor,gba,types}.ts`
(substrat rendu), + duplications locales dans ~8 écrans.

## COMPTEURS (≈51 symboles bg.c/bg.h)

| Statut | Nb | Détail |
|---|---|---|
| ✅ 1:1 | 9 | InitBgsFromTemplates, InitBgFromTemplate, SetBgControlAttributes, SetBgAttribute, GetBgX, GetBgY, CopyTileMapEntry, FillBgTilemapBufferRect_Palette0, CopyRectToBgTilemapBufferRect (branche NORMAL) |
| 🟡 DIVERGENT/adaptation | 14 | ShowBg, HideBg, ChangeBgX, ChangeBgY, LoadBgTiles, CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram, GetBgTilemapBuffer, GetTileMapIndexFromCoords→tileMapIndex, FillBgTilemapBufferRect, IsInvalidBg(inline), IsInvalidBg32(inline), SetBgModeInternal(fondu), Show/Hide/SyncBgVisibilityAndMode(fondus) |
| 🟠 PARTIEL/fragmenté | 6 | GetBgAttribute, GetBgControlAttribute, ResetBgsAndClearDma3BusyFlags, IsDma3ManagerBusyWithBgCopy (×3 locales), CopyToBgTilemapBufferRect (×2 locales + ×3 stub), CopyToBgTilemapBufferRect_ChangePalette (×1 locale) |
| 🔴 STUB (throw/orphelin) | 4 | **SetBgMode**, **SetBgTilemapBuffer**, **UnsetBgTilemapBuffer**, **WriteSequenceToBgTilemapBuffer** |
| ⛔ ABSENT | 18 | ResetBgs, GetBgMode, ResetBgControlStructs, Unused_ResetBgControlStruct, LoadBgVram, SetTextModeAndHideBgs, **SetBgAffineInternal**, **SetBgAffine**, ChangeBgY_ScreenOff, **LoadBgTilemap**, Unused_LoadBgPalette, Unused_AdjustBgMosaic, BgTileAllocOp, GetBgMetricTextMode, GetBgMetricAffineMode, GetBgType, IsTileMapOutsideWram, GetTileMapIndexFromCoords (signature 5-arg) |
| 🔌 EXEMPTION-HW | 0 | — (aucune ; les « adaptations » sont substrat-moteur, pas hardware pur) |

> Beaucoup des ⛔ sont **morts dans le décomp** (`Unused_*`, `BgTileAllocOp` dummied) ou **superséés** par un autre
> chemin (registre SetGpuReg, ResetVramOamAndBgCntRegs). Voir « MANQUES CRITIQUES » pour le sous-ensemble qui casse du solo.

## VERDICT

Le **substrat de rendu BG est complet et fidèle** : text BG (`renderBgScanline`, bg-layer.ts:49) ET affine BG
(`renderBgAffineScanline`, bg-layer.ts:169) sont câblés dans le compositor (compositor.ts:194-201), pilotés par le
chemin registre `SetGpuReg` (decomp-runtime.ts:781-834 : BG2PA-PD, BG2X/Y L/H, DISPCNT mode→isAffine). Les fonctions
« logiques » de bg.c (Init/Set/Get/Change/Fill/Copy) sont majoritairement portées 1:1 ou en adaptation net-équivalente
dans `window.ts`. **MAIS** l'éclatement a produit 4 régressions dures : un **orphelin non résolu**
(WriteSequenceToBgTilemapBuffer, ReferenceError), et **3 familles routées vers `__wireTodo` qui LÈVE** (SetBgMode,
Set/UnsetBgTilemapBuffer, CopyToBgTilemapBufferRect) au lieu d'être centralisées en no-op/impl. L'**API affine de bg.c**
(`SetBgAffine`) est absente : le rendu affine marche via écritures registre, mais un appelant décomp qui passe par
`SetBgAffine` (rayquaza_scene climax) ne pilote rien.

## 🚨 MANQUES CRITIQUES (cassent du solo)

1. **`WriteSequenceToBgTilemapBuffer` — ORPHELIN non résolu.** `src/match_call.ts:1971` et `:2131` l'appellent sans
   import ni définition locale ni export global (confirmé : `gba-global-scope.ts` ne l'expose pas). → **ReferenceError**
   au dessin de l'icône Pokénav dans l'écran d'appel (Match Call). Seule impl existante = **locale privée** simplifiée
   `pokemon_storage_system.ts:119` (boucle FillBgTilemapBufferRect, sans le masque MAPGRID du décomp bg.c:1054).
   ⇒ à centraliser (1:1 bg.c:1033) dans window.ts + exporter.

2. **`SetBgTilemapBuffer` / `UnsetBgTilemapBuffer` — absents centralement, résolution incohérente.** L'adaptation
   moteur légitime = **no-op** (le tilemap EST la vue VRAM lue par le compositor, pas de buffer WRAM séparé). Mais elle
   n'est appliquée que localement (no-op dans mail.ts:1018/1028, easy_chat.ts:796, pokenav_main_menu.ts:91). Deux
   fichiers la routent vers **`__wireTodo` qui LÈVE** : `credits.ts:53`→appel `:395` (crédits) et
   `pokenav_conditions_gfx.ts:85`→appels `:316/328/337` (Pokénav Conditions). ⇒ crash à l'entrée de ces écrans.

3. **`SetBgMode` — STUB `__wireTodo` qui lève** (`pokenav_region_map.ts:67`, appelé `:339` et `:374`). Pilote le
   passage mode 0↔1 du **zoom de la carte régionale Pokénav** (affine). ⇒ ReferenceError au zoom ville. (Note : le
   décomp `SetBgMode`→`SetBgModeInternal` masque `bgVisibilityAndMode`; le port n'a PAS d'équivalent qui pousse le mode
   vers DISPCNT hors du chemin `SetGpuReg` — voir §DONNÉES.)

4. **`CopyToBgTilemapBufferRect` — 3 STUBs `__wireTodo` qui lèvent** : `pokenav_region_map.ts:45` (`:681` zoom villes),
   `pokenav_conditions_gfx.ts:48` (`:318`), `pokenav_ribbons_summary.ts:55` (`:1181`). Impl 1:1 existe pourtant
   (branche NORMAL) sous d'autres noms/portées (window.ts:1207 CopyRectToBgTilemapBufferRect ; locales pss:829,
   easy_chat:816). ⇒ à câbler (une seule impl centrale bg.c:907).

5. **`SetBgAffine` / `SetBgAffineInternal` — ABSENTES** (bg.c:772/244). Le seul appelant **solo** dans le décomp est
   `rayquaza_scene.c` (cinématique climax légendaire) ; frontier_pass.c + berry_blender.c sont hors-périmètre. Le
   substrat affine EXISTE (compositor) mais `SetBgAffine` (qui appelle `BgAffineSet` BIOS puis écrit BG2PA-PD) n'est pas
   porté ⇒ un appel `SetBgAffine(...)` ne produit aucune matrice. Contournement possible via `SetGpuReg(BG2PA…)` direct
   ou `SetBgAffineStruct`/`DoBgAffineSet` (util.c, cf. src/util.ts:7).

Secondaire : **`LoadBgTilemap` ABSENTE** — `battle_intro.ts:536` l'appelle en `r.LoadBgTilemap?.()` = **no-op
silencieux** (pas sur le runtime, pas dans gba-global-scope). Ici masqué car battle_intro écrit aussi le tilemap
directement (`:532`), mais tout autre appelant futur sera silencieusement inerte (viole Règle 3 « hurler si échec »).

## DONNÉES / TABLES / STRUCTS

| Décomp (bg.c) | Port | Note |
|---|---|---|
| `struct BgControl sGpuBgConfigs.configs[4]` (visible, charBase, mapBase, screenSize, paletteMode, priority, mosaic, wraparound) | `gba.bgConfigs[i]` = `BgConfig` (types.ts:70-113) | champs mappés 1:1 ; `unknown_1/2/3` (jamais lus) omis |
| `struct BgConfig2 sGpuBgConfigs2[4]` : `baseTile`, `basePalette`, `tilemap`, `bg_x`, `bg_y` | ÉCLATÉ : `baseTile`→BgConfig.baseTile (types.ts:85) ; `bg_x/bg_y`→`sBgCoords[4]` (window.ts:891, Q8.8) ; `tilemap`→**vue VRAM** dynamique (gba.ts:125, pas de pointeur stocké) ; **`basePalette` ABSENT** | l'éclatement bg_x/bg_y hors de la config est la raison d'être de sBgCoords |
| `bgVisibilityAndMode` (u16, mode + BG-on) | `_dispCntMode` (decomp-runtime.ts:622) + `config.visible` par BG | reconstruit à la lecture DISPCNT (GetGpuReg:711) |
| `sDmaBusyBitfield[4]` (suivi curseurs DMA3) | **ABSENT** | DMA émulé synchrone ; IsDma3ManagerBusyWithBgCopy renvoie false/compteur local |
| `gWindowTileAutoAllocEnabled` (COMMON_DATA) | **ABSENT** | branche BgTileAllocOp (dummy 0 dans le décomp) jamais prise |
| `sZeroedBgControlStruct` | **ABSENT** | ResetBgControlStructs non porté standalone |
| enum `BG_ATTR_*` (bg.h:6-15) | window.ts:784-793 | ✅ 1:1 — **sauf** pss:113 `BG_ATTR_BASETILE = 8` (FAUX, doit être 10 ; 8 = BG_ATTR_METRIC) mais inerte car GetBgAttribute local pss:116 renvoie 0 en dur |
| enum `BG_COORD_SET/ADD/SUB`, `BG_TYPE_*`, `BG_MOSAIC_*` | partiels (COORD utilisés ; TYPE/MOSAIC non — GetBgType/AdjustBgMosaic absents) | |
| matrices affine `BgAffineSet` dest → BG2PA-PD | `gba.bgAffineMatrices[0/1]` (decomp-runtime.ts:815-833) | alimentées par SetGpuReg registre, PAS par SetBgAffine (absent) |

## RUSTINES À PURGER (après centralisation)

- **`GetBgAttribute` local pss:116** `return 0` — SHADOW mort du vrai window.ts:797 ; renvoie 0 quel que soit l'attribut
  (les call-sites pss:1936/1949 `GetBgAttribute(0, BG_ATTR_BASETILE)` obtiennent 0). Purger → importer window.ts.
- **`WriteSequenceToBgTilemapBuffer` local pss:119** — simplifié (pas de masque MAPGRID). Remplacer par impl centrale 1:1.
- **`CopyToBgTilemapBufferRect` locales** pss:829, easy_chat:816 (branche NORMAL only) + **`_CopyToBgTilemapBufferRect_ChangePalette`**
  battle_controller_player.ts:346 — dupliquent bg.c:907/946. Consolider.
- **`IsDma3ManagerBusyWithBgCopy` ×3** : battle_bg.ts:661 (`_bgCopiesInFlight>0`), pss:5351 (`return false`),
  easy_chat.ts:812 — 3 corps différents pour 1 fonction décomp. Centraliser.
- **`GetBgY` local pokenav_main_menu.ts:73** — reconstruit `bg_y` via `(cfg.vofs & 0x1ff) << 8` (source DIFFÉRENTE du
  GetBgY central window.ts:910 qui lit `sBgCoords`). Divergence de source de vérité : le pokénav lit le registre 9-bit
  tronqué, window.ts lit la coord Q8.8 pleine. À unifier sur sBgCoords.
- **`SetBgTilemapBuffer`/`UnsetBgTilemapBuffer` no-op locaux ×4** (mail, easy_chat, pokenav_main_menu) — le no-op EST la
  bonne adaptation, mais doit vivre **une seule fois** (window.ts), pas dupliqué + throw ailleurs.

## CALL-SITES ORPHELINS (throw/no-op au runtime)

| Call-site | Symbole | Comportement |
|---|---|---|
| match_call.ts:1971, :2131 | WriteSequenceToBgTilemapBuffer | **ReferenceError** (non déclaré) |
| credits.ts:395 | SetBgTilemapBuffer (`__wireTodo` :53) | **throw** |
| pokenav_conditions_gfx.ts:316/328/337 | SetBgTilemapBuffer (`__wireTodo` :85) | **throw** |
| pokenav_region_map.ts:339, :374 | SetBgMode (`__wireTodo` :67) | **throw** |
| pokenav_region_map.ts:681 | CopyToBgTilemapBufferRect (`__wireTodo` :45) | **throw** |
| pokenav_conditions_gfx.ts:318 | CopyToBgTilemapBufferRect (`__wireTodo` :48) | **throw** |
| pokenav_ribbons_summary.ts:1181 | CopyToBgTilemapBufferRect (`__wireTodo` :55) | **throw** |
| battle_intro.ts:536 | LoadBgTilemap (`r.LoadBgTilemap?.()`) | **no-op silencieux** |

## CARTE DE L'ÉCLATEMENT (pour consolidation future → src/bg.ts)

- **`src/window.ts`** (cluster majeur, ~lignes 226, 764-1256) : tileMapIndex, InitBgsFromTemplates/InitBgFromTemplate,
  BG_ATTR_* consts, GetBgAttribute, SetBgControlAttributes, SetBgAttribute, ShowBg/HideBg, ChangeBgX/Y + GetBgX/Y
  (sBgCoords:891), ResetBgsAndClearDma3BusyFlags, FillBgTilemapBufferRect(_Palette0), CopyBgTilemapBufferToVram,
  CopyToBgTilemapBuffer, GetBgTilemapBuffer, CopyRectToBgTilemapBufferRect, CopyTileMapEntry.
- **`harness/runtime/decomp-globals.ts`** : LoadBgTiles (:324, baseTile 1:1 bg.c:382), BgDmaFill (:345),
  DmaClear16/32 (:358+). Palette : LoadPalette (:290).
- **`harness/runtime/decomp-runtime.ts`** : chemin REGISTRE — Get/SetGpuReg (:709/:781) dispatch BGxCNT/HOFS/VOFS/
  affine BG2-3 PA-PD + X/Y L/H ; applyDispCnt (:837, mode→isAffine) ; applyBgCnt (:863) ; _updateBgRef (:633).
- **`harness/gba/types.ts`** : `BgConfig` interface (:70) = struct BgControl.config + affine fields.
- **`harness/gba/gba.ts`** : `bg(i)` accessor + vues dynamiques `vram`/`tilemap` par charBase/mapBase (:110-151).
- **`harness/gba/bg-layer.ts`** : `renderBgScanline` (:49, text) + `renderBgAffineScanline` (:169, affine).
- **`harness/gba/compositor.ts`** : `composeFrame` (:92) — sélection text/affine (:194), priorité, blend, windows.
- **Duplications à réabsorber** : mail.ts, easy_chat.ts, pokenav_main_menu.ts, pokemon_storage_system.ts,
  battle_controller_player.ts, battle_bg.ts (versions locales listées en RUSTINES).
- **Sentinelles à câbler** : credits.ts, pokenav_region_map.ts, pokenav_conditions_gfx.ts, pokenav_ribbons_summary.ts
  (`__wireTodo`), match_call.ts (orphelin), battle_intro.ts (no-op `?.`).

## NOTE — BG AFFINES (mode 1/2 : intro, warp spirale, contest, carte régionale)

**Le moteur REND bien les BG affines** : `renderBgAffineScanline` (bg-layer.ts:169, sampling matrice pa/pb/pc/pd +
refX/refY, wrap/clip) est appelé par le compositor quand `bg.config.isAffine` (posé par DISPCNT mode 1/2,
decomp-runtime.ts:857-860). Les matrices proviennent des écritures registre `SetGpuReg(BG2PA…, BG2X_L…)`
(decomp-runtime.ts:815-833) → `gba.bgAffineMatrices[0/1]`. **L'API bg.c correspondante est partiellement là** : le
chemin bas-niveau (registres) fonctionne, mais **le helper haut-niveau `SetBgAffine` (bg.c:772) est ABSENT** et
**`SetBgMode` (pour passer en mode affine hors DISPCNT direct) est un stub qui lève**. Conséquence : un écran qui pilote
l'affine par `SetGpuReg`/`DoBgAffineSet` marche ; un écran qui appelle `SetBgAffine`/`SetBgMode` (rayquaza_scene,
pokenav_region_map) échoue. `ChangeBgX/Y` du port n'implémentent PAS la branche affine (bg.c:578-604 : mode≠0 écrit
BG2X_H/L au lieu de HOFS) — ils écrivent toujours hofs/vofs (mode texte). Un scroll affine via ChangeBgX/Y serait donc
inerte sur le registre affine.

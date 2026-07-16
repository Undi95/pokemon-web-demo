# Audit moteur — misc-engine (scanline / trig / util / random / sound)

Audit LECTURE SEULE. Décomp `D:/Projet 1/decomps/pokeemeraude` vs port
`D:/Projet 1/pokemon-web-demo`. Corps comparés (jamais les commentaires du port).
Statuts : ✅ 1:1 · 🟡 DIVERGENT · 🟠 PARTIEL · 🔴 STUB · ⛔ ABSENT · 🔌 EXEMPTION-HW · ❓ INCERTAIN.

| Fichier | ✅ | 🟡 | 🟠 | ⛔ | Verdict |
|---|---|---|---|---|---|
| A `scanline_effect.c` | 9/9 fns + data + conso | 0 | 0 | 0 | ✅ **1:1** (HW-emu DMA→HBlank cb documenté) |
| B `trig.c` | 4 fns + 2 tables byte-exactes | 1 (Sin2 latent) | 0 | 0 | ✅ **tables byte-exactes**, Sin2/Cos2 wrap u16 latent |
| C `util.c` | 8 pures + BlendPalette(relocalisé) | 0 | 1 | 4 | 🟠 **PARTIEL** (pures OK, 3 fns HW + gMiscBlank absents) |
| D `random.c` | 7 fns + LCG exact | 0 | 0 | 1 🚨 | ✅ RNG 1:1 mais **Random() par-VBlank ABSENT** |
| E `sound.c` | 48/48 fns, 0 stub | 0 | 0 | 0 | ✅ **1:1 COMPLET** |

---

## 🚨 MANQUES CRITIQUES (global)

1. **[D] `Random()` par VBlank ABSENT** — `main.c:358-359` appelle `Random()` CHAQUE VBlank
   (hors link/frontier/recorded). Le port `harness/runtime/decomp-runtime.ts:runOneFrame`
   (1938-2089) N'appelle JAMAIS `Random()`. ⇒ `gRngValue` **n'avance qu'aux tirages de
   logique de jeu**, jamais avec le temps écoulé. Combiné au `gRngValue=0` non-seedé
   (glitch voulu), les séquences deviennent **plus déterministes que la ROM** (l'attente/idle
   ne perturbe plus shiny/encounters/loterie). Pas de crash. **Où poser** : fin de `runOneFrame`
   (bloc VBlank, ~ligne 2075, à côté de `__scanlineEffectTick`), gardé
   `if (!gMain.inBattle || !(gBattleTypeFlags & (BATTLE_TYPE_LINK|BATTLE_TYPE_FRONTIER|BATTLE_TYPE_RECORDED))) Random();`
   (solo-core ⇒ garde ~toujours vraie ⇒ `Random()` chaque frame).

2. **[C] `DoBgAffineSet` + `SetBgAffineStruct` ⛔ ABSENT** (`util.c:138/149`) — wrappers BIOS
   `BgAffineSet`. Aucune impl, aucun call-site dans le port ⇒ **inertes, non orphelins** pour
   l'instant, mais tout écran affine-BG porté ensuite (roulette, berry blender, certaines
   transitions) les rendra orphelins.

3. **[C] `CopySpriteTiles` ⛔ ABSENT** (`util.c:157`) — aucune impl, aucun call-site. Inert.

4. **[C] `gMiscBlank_Gfx` ⛔ ABSENT, MAL ÉTIQUETÉ « unused »** (`util.c:117`) — le port
   (`util.ts:109`) le dit « inutilisé en Émeraude » (repris du header décomp), MAIS il est
   **réellement référencé** par `battle_anim_mons.c:108-109` (blank des mons d'effet de move,
   TAG_MOVE_EFFECT_MON_1/2) et `contest_util.c:224-231,395`. Blob 4bpp à zéro.

5. **[C] `CreateInvisibleSpriteWithCallback` 🟠 porté LOCALEMENT seulement** dans
   `battle_main.ts:3673` (`_CreateInvisibleSpriteWithCallback`, 1:1 comportemental via couche
   sprite). Non centralisé ⇒ les autres call-sites décomp (ex. `battle_anim_water.ts:1474`
   ré-implémente son propre porteur d'onde) risquent la dérive. **[B] `Sin2` sans wrap u16**
   (latent, cf §B).

---

## A) `scanline_effect.c` → `src/scanline_effect.ts` + compositor

**Compteurs : 9/9 fonctions ✅ · double-buffer/DMA = HW-emu documenté · conso par-scanline câblée ✅**

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `gScanlineEffectRegBuffers[2][0x3C0]` | ✅ | c:16 | ts:75 | 2×`Uint16Array(0x3C0)` — 1:1 |
| `gScanlineEffect` / `sShouldStopWaveTask` | ✅ | c:18-19 | ts:80/92 | struct 1:1 (dmaSrcBuffers = index HW-emu) |
| `ScanlineEffect_Stop` | ✅ | c:21 | ts:119 | `DmaStop(0)`→`setHBlankCallback(null)` |
| `ScanlineEffect_Clear` | ✅ | c:32 | ts:129 | 1:1 champ-à-champ |
| `ScanlineEffect_SetParams` | ✅ | c:46 | ts:157 | dmaSrcBuffers `[buf]+1`→index 0/1 (cb gère y) |
| `ScanlineEffect_InitHBlankDmaTransfer` | ✅ | c:72 | ts:178 | `DmaSet`→install cb HBlank ; swap `^=1` élidé |
| `CopyValue16Bit` | ✅ | c:101 | ts:145 | écrit buf[0] dans reg dmaDest |
| `CopyValue32Bit` | ✅ | c:109 | ts:148 | 4 octets = 2 regs adjacents (HOFS+VOFS) |
| `TaskFunc_UpdateWavePerFrame` | ✅ | c:126 | ts:236 | battle-BG offsets + wave shift 1:1 |
| `GenerateWave` | ✅ | c:197 | ts:280 | `(gSineTable[θ]*amp)/256` ; `&0xFF` sur θ (=u8 décomp) |
| `ScanlineEffect_InitWave` | ✅ | c:214 | ts:291 | dmaDest = `0x10+regOffset` ; boucle init 1:1 |

**Conso compositor** ✅ : `harness/gba/compositor.ts:178-200` — pour chaque scanline `y`,
`hblankCallback(y)` (l.179) tourne AVANT `renderBgScanline(y, bg.config,…)` (l.200). Le cb mute
`bg.config.hofs/vofs` (via `_applyRegFromValue`, ts:96) qui est relu frais dans le render de la
même scanline ⇒ décalage par-ligne effectif. `__scanlineEffectTick` (= `ScanlineEffect_InitHBlankDmaTransfer`)
tické chaque frame à `decomp-runtime.ts:2075`.

**Adaptations HW-emu (LÉGITIMES, documentées)** :
- DMA HBlank → `setHBlankCallback` appelé par le compositor avant chaque scanline (= timing HBlank GBA).
- `dmaDest` = REG_OFFSET (0x10..0x1E) au lieu d'un pointeur ; `dmaSrcBuffers` = index (0/1).
- **Double-buffer `srcBuffer ^= 1` ÉLIDÉ** (ts:205 commenté) : JS mono-thread, pas de DMA concurrent.
  Effet de bord : la wave écrite frame N est lue frame N (pas N+1 comme le pipeline HW) ⇒ ~1 frame
  d'avance, imperceptible. Acceptable.
- `__scanlineEffectTick` global chaque frame vs VBlankCB par-scène côté décomp : inoffensif
  (`state==0` ⇒ return ; les scènes à effet arment de toute façon chaque VBlank).
- 🟢 `_applyRegFromValue` gère AUSSI `dmaDest==0x52` (REG_BLDALPHA par-scanline, Surf/Muddy Water) —
  **extension hors scanline_effect.c** (dmaDest direct posé par les anims), légitime mais à noter.

---

## B) `trig.c` → `src/trig.ts`

**Compteurs : 2 tables byte-exactes ✅ · Sin/Cos/Cos2 ✅ · Sin2 🟡 latent**

Vérif script (échantillon ≥8 valeurs, C-arg → int Q) :
- `gSineTable` (Q8.8) : **320/320 args identiques, 0 diff, 0 dérive float**. [0]=0, [1]=6, [32]=181,
  [45]=228, **[64]=256**, [128]=0, **[192]=-256**, [255]=-6, [300]=225, [319]=255. ✅
- `gSineDegreeTable` (Q4.12) : **180/180 identiques, 0 diff**. [0]=0, [1]=71, [15]=1060, **[30]=2048**,
  [45]=2896, **[90]=4096**, [150]=2048, [179]=71. ✅

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `gSineTable` | ✅ | c:5 | ts:27 | Q8.8, byte-exact 320 entrées (vérifié) |
| `gSineDegreeTable` | ✅ | c:330 | ts:51 | Q4.12, byte-exact 180 entrées (vérifié) |
| `Sin` | ✅ | c:515 | ts:73 | `(amp*gSineTable[i&0xFF])>>8` — `&0xFF` = (u8) systématique décomp ; identique domaine 0..255 |
| `Cos` | ✅ | c:521 | ts:78 | `gSineTable[(i&0xFF)+64]` — mask empêche l'OOB des casts strippés ; 1:1 pour i∈0..255 |
| `Sin2` | 🟡 | c:527 | ts:83 | **manque le wrap u16 du param** (`s16 Sin2(u16 angle)`) : `angle%180`/`angle/180` sans `&0xFFFF` |
| `Cos2` | ✅/🟡 | c:540 | ts:91 | `Sin2(angle+90)` hérite du 🟡 (voir ci-dessous) |

**🟡 Détail Sin2/Cos2** : côté C le param est u16 → tronqué à l'entrée. `Cos2(angle)`=`Sin2(angle+90)`
avec `angle+90` tronqué à u16. Le port ne masque pas ⇒ pour `angle ∈ [65446,65535]` (fenêtre de 90
au sommet u16), `Sin2(angle+90)` diverge (ex. C `Sin2(65625)`→`(u16)=89`→`gSineDegreeTable[89]` ;
TS `65625%180=105`→`[105]`). **Inatteignable en jeu réel** (angles typiques 0..359). Fidélité fine,
0 impact pratique. Le `&0xFF` de Sin/Cos est en revanche **1:1 pour le domaine u8 réel** + robuste
aux casts `(u8)` strippés par le transpileur (documenté ts:8-13).

---

## C) `util.c` → `src/util.ts` (+ relocalisations)

**Compteurs : 8 pures ✅ (2 tables byte-exactes) · BlendPalette ✅ relocalisé · 1 🟠 · 4 ⛔**

| Fonction / data | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `gBitTable` | ✅ | c:7 | util.ts:15 | `1<<i >>>0`, 0..31 |
| `sCrc16Table[256]` | ✅ | c:81 | util.ts:18 | **byte-exact 256/256 (vérifié)** |
| `StoreWordInTwoHalfwords` | ✅ | c:127 | util.ts:55 | `h[0]=w&0xFFFF; h[1]=w>>>16` |
| `LoadWordFromTwoHalfwords` | ✅ | c:133 | util.ts:63 | retour au lieu de `*w` ; `(s16)h[1]<<16`≡`h[1]<<16` sur 32b (correct) |
| `CountTrailingZeroBits` | ✅ | c:208 | util.ts:68 | 1:1 |
| `CalcCRC16` | ✅ | c:222 | util.ts:77 | poly 0x8408, seed 0x1121, `~crc`&0xFFFF |
| `CalcCRC16WithTable` | ✅ | c:241 | util.ts:90 | **parité algo vérifiée** (CRC16==CRC16WithTable sur échantillon) |
| `CalcByteArraySum` | ✅ | c:256 | util.ts:101 | `>>>0` u32 |
| **`BlendPalette`** | ✅ | c:264 | **palette.ts:756** (`_blendPalette`) | **1:1** : `r+(((tgt.r-r)*coeff)>>4)` par composante, RGB2(r,g,b). ⚠ note ci-dessous |
| `CreateInvisibleSpriteWithCallback` | 🟠 | c:119 | **battle_main.ts:3673** (`_CreateInvisibleSpriteWithCallback`) | porté LOCAL (x=248,y=168,subprio 14,invisible,cb) via couche sprite ; **non centralisé** |
| `DoBgAffineSet` | ⛔ | c:149 | — | absent (aucun call-site) |
| `SetBgAffineStruct` | ⛔ | c:138 | — | absent (aucun call-site) |
| `CopySpriteTiles` | ⛔ | c:157 | — | absent (aucun call-site) |
| `gMiscBlank_Gfx` | ⛔ | c:117 | — | **mal étiqueté « unused »** — réf. par battle_anim_mons.c + contest_util.c |
| `sSpriteDimensions` / `sInvisibleSpriteTemplate` | ⛔ | c:43/54 | — | data liées aux fns HW absentes |

**BlendPalette — ✅ 1:1 (formule vérifiée)** mais **2 notes** :
1. Vit dans `palette.ts` (`_blendPalette`), PAS dans util.ts. La note util.ts:107-109 « À PORTER …
   BlendPalette » est **STALE** (rustine doc — cf §Rustines).
2. `RGB2` masque chaque composante à 5 bits (`&0x1F`) alors que la macro C `RGB` ne masque pas.
   Divergence **seulement si coeff>16** (composante hors 0..31 : C déborde/wrap, TS masque). Le blend
   Pokémon utilise coeff∈0..16 ⇒ résultat toujours 0..31 ⇒ **identique en pratique**. Latent.

---

## D) `random.c` (+ `include/random.h`) → `src/random.ts` + `include/random.ts`

**Compteurs : 7 fns ✅ (LCG exact) · 🚨 1 miss structurel (VBlank Random)**

| Fonction / data | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `gRngValue`/`gRng2Value`/`sUnknown`/`sRandCount` | ✅ | c:4-9 | random.ts:20-24 | module-privés (COMMON_DATA→let) |
| `Random` | ✅ | c:11 | random.ts:27 | `ISO_RANDOMIZE1`, `sRandCount++`, `>>16` |
| `SeedRng` | ✅ | c:18 | random.ts:34 | `gRngValue=seed&0xFFFF; sUnknown=0` |
| `SeedRng2` | ✅ | c:24 | random.ts:40 | 1:1 |
| `Random2` | ✅ | c:29 | random.ts:45 | utilise `ISO_RANDOMIZE1` (1:1 décomp) |
| `ISO_RANDOMIZE1` | ✅ | h:16 | include/random.ts:19 | `(Math.imul(1103515245,v)+24691)>>>0` — exact mod 2³² |
| `ISO_RANDOMIZE2` | ✅ | h:17 | include/random.ts:24 | présent (mort dans random.c mais 1:1) |
| `Random32` | ✅ | h:12 | include/random.ts:30 | `Random() \| (Random()<<16)`, low=1er appel |
| **`Random()` par VBlank** | ⛔🚨 | **main.c:358** | — | **ABSENT du frame-loop** (voir §Manques #1) |

Glitch `gRngValue=0` non-seedé (SeedRngWithRtc `#ifdef BUGFIX`) reproduit 1:1 (voulu). Ordre
`Random32` (low=1er) suit l'expression décomp — l'ordre réel ROM est un souci niveau-décomp, pas
une divergence du port.

---

## E) `sound.c` → `src/sound.ts` (+ `harness/m4a/`)

**Compteurs : 48/48 fonctions ✅ · 0 stub · moteur m4a = exemption HW close (sample-exact)**

Interface sound.c intégralement portée. Échantillon clé (tableau condensé) :

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| `sFanfares[18]` | ✅ | c:37 | ts:97 | **18==18 entrées (vérifié)**, songNum+duration 1:1 |
| `MapMusicMain` | ✅ | c:64 | ts:125 | state machine 0-7 identique ; tickée `runOneFrame` (globalThis) |
| `PlayNewMapMusic`/`FadeOut*MapMusic`/`FadeInNewBGM` | ✅ | c:120-269 | ts:177-315 | 1:1 |
| `PlayFanfare`/`Task_Fanfare`/`CreateFanfareTask` | ✅ | c:213-256 | ts:266-301 | boucle `sFanfares.length`≡ARRAY_COUNT |
| `PlayCry_Normal`/`_NormalNoDucking`/`_ByMode`/`_ReleaseDouble`/`_DuckNoRestore`/`_Script` | ✅ | c:302-367 | ts:348-400 | famille complète 6/6, ducking 1:1 |
| `PlayCryInternal` | ✅ | c:369 | ts:404 | **switch mode : toutes valeurs length/pitch/release/chorus/volume 1:1** ; `GET_CRY`=base+12·idx (ToneData=12o, HW-emu) |
| `IsCryFinished`/`StopCry*`/`IsCryPlaying*`/`Task_DuckBGM…` | ✅ | c:497-561 | ts:520-575 | + garde `if(gMPlay_PokemonCry)` (cf rustines) |
| `PlayBGM`/`PlaySE`/`PlaySE12/1/2WithPanning`/`SE12PanpotControl` | ✅ | c:563-604 | ts:582-620 | 1:1 (`&gMPlayInfo_X`→ref objet) |
| `IsSEPlaying`/`IsBGMPlaying`/`IsBGMStopped`/`IsSpecialSEPlaying`/`IsBGMPausedOrStopped` | ✅ | c:276-631 | ts:323-643 | prédicats status 1:1 |
| `gDisableMusic`/`gMPlay_PokemonCry`/`gPokemonCryBGMDuckingCounter` | ✅ | c:17-26 | ts:76-85 | globals 1:1 |
| `gCryTable`/`gCryTable_Reverse` | 🔌 | c:28-29 | ts:89 | extern → offsets `gSoundMemory` posés par `harness/m4a/native.ts` (HW-emu ROM addr) |

**Driver m4a** : fonctions fines (`m4aMPlay*`, `SetPokemonCry*`) importées de `src/m4a.ts` (moteur
1:1 certifié sample-exact — exemption HW actée). `m4aSongNumStart` réel (`decomp-globals.ts:865`),
`FuncIsActiveTask` réel (`decomp-globals.ts:1887`). `harness/m4a/native.ts:229-232` respecte l'ordre
VBlankIntr décomp (`gPcmDmaCounter` avant `m4aSoundMain`, main.c:353-355).

**Hors sound.c (honnête)** : `IsStereoSound` + `SetPokemonCryStereo` (ts:648-656) étiquetés `[harness]`.

---

## RUSTINES À PURGER

1. **`util.ts:107-109` — commentaire STALE** : « À PORTER … BlendPalette » alors que BlendPalette
   EST porté (`palette.ts:_blendPalette`). Étiquette aussi `gMiscBlank_Gfx` « inutilisé » (FAUX,
   réf. battle_anim_mons/contest_util). Doc-rustine → réaligner quand les 3 fns HW seront centralisées.
2. **`sound.ts` gardes `if (gMPlay_PokemonCry)`** (StopCry / StopCryAndClearCrySongs /
   IsCryPlaying* / Task_DuckBGMForPokemonCry) — défensives (null-deref GBA = no-op). À purger si le
   cycle de vie de `gMPlay_PokemonCry` garantit non-null (le C déréférence sans garde).
3. **`scanline_effect.ts:100-107` cas `dmaDest==0x52` (REG_BLDALPHA)** — extension hors
   scanline_effect.c (alpha par-bande Surf/Muddy Water). Légitime mais à tracer comme adaptation.

## CALL-SITES ORPHELINS

- **Aucun orphelin actif** pour `DoBgAffineSet`/`SetBgAffineStruct`/`CopySpriteTiles` (absents ET
  jamais appelés dans le port). Deviendront orphelins dès qu'un écran affine-BG ou une anim tuiles
  sera portée.
- **`gMiscBlank_Gfx`** : call-sites décomp `battle_anim_mons.c:108-109` (blank mons d'effet) +
  `contest_util.c:224-231,395`. Si ces chemins sont portés, ils référenceront un blob absent
  (fournir un buffer 4bpp à zéro équivalent).
- **`CreateInvisibleSpriteWithCallback`** centralisé uniquement dans `battle_main.ts` ; commentaire
  `battle_anim_water.ts:1474` ré-implémente son propre porteur d'onde → vérifier l'absence de dérive
  si d'autres écrans en ont besoin.

---

### Verdict global
Sous-systèmes **solides** : scanline (9/9 + conso câblée), trig (tables byte-exactes prouvées), sound
(48/48, 0 stub), random (LCG exact). **1 manque critique unique** = `Random()` par-VBLANK absent
(déterminisme RNG accru vs ROM ; à poser en fin de `runOneFrame`). util.c : partie pure ✅ ; reste HW
(3 fns affine/tiles + gMiscBlank) absent mais **inerte** (0 call-site actif). Aucun rendu faux, aucun stub.

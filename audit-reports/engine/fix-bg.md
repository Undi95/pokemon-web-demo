# Fix moteur — Lot A2 `bg` (source : `audit-reports/engine/bg.md`)

Objectif : purger les 4 régressions dures de l'éclatement de `bg.c` + porter les fns bg.c
manquantes 1:1, sans casser le substrat de rendu (déjà fidèle). `npx tsc --noEmit` = **0**.
Foyer bg du port = `src/window.ts` (cluster majeur) + `harness/runtime/decomp-globals.ts`
(sibling `LoadBgTiles`/`LoadBgTilemap`). Décomp = `D:/Projet 1/decomps/pokeemeraude/src/bg.c`.

## Récapitulatif

| # | Fn (bg.c) | Impl (port) | Call-sites recâblés | Statut |
|---|---|---|---|---|
| 1 | `WriteSequenceToBgTilemapBuffer` (:1033) | **NEW** window.ts (export) | match_call.ts:1971/2131 | ✅ |
| 2 | `SetBgMode`→`SetBgModeInternal` (:370/58) | **NEW** window.ts (export) | pokenav_region_map.ts:339/374 | ✅ |
| 3 | `CopyToBgTilemapBufferRect` (:907) | **NEW** window.ts (export) | region_map:681, conditions_gfx:318, ribbons_summary:1181 | ✅ |
| 4 | `SetBgTilemapBuffer`/`UnsetBgTilemapBuffer` (:848/856) | **NEW** window.ts (export, no-op centralisé) | credits:395, conditions_gfx:316/328/337, ribbons_summary:696/706, **+ region_map:546, conditions_search_results:502, ribbons_list:473** | ✅ |
| 5 | `SetBgAffine`+`SetBgAffineInternal` (:772/244) + BIOS `BgAffineSet` | **NEW** window.ts (SetBgAffine export, reste privé) | aucun (rayquaza_scene non porté) | ✅ INERTE |
| 6 | `LoadBgTilemap` (:404) | **NEW** decomp-globals.ts (export) | battle_intro.ts:536 | ✅ |

---

## Fix 1 — `WriteSequenceToBgTilemapBuffer` (bg.c:1033-1071)

**C** (branche `BG_TYPE_NORMAL`) :
```c
CopyTileMapEntry(&firstTileNum, &tilemap[(u16)GetTileMapIndexFromCoords(x16,y16,attribute,mode,mode2)], paletteSlot, 0, 0);
firstTileNum = (firstTileNum & (MAPGRID_COLLISION_MASK | MAPGRID_ELEVATION_MASK)) + ((firstTileNum + tileNumDelta) & MAPGRID_METATILE_ID_MASK);
```
**Diff** : nouvel `export function WriteSequenceToBgTilemapBuffer(bg, firstTileNum, x, y, width,
height, paletteSlot, tileNumDelta)` dans window.ts (voisin de CopyRectToBgTilemapBufferRect).
`tileMapIndex(x,y,screenSize)` = notre `GetTileMapIndexFromCoords` (même précédent que
CopyRectToBgTilemapBufferRect). Masques `MAPGRID_*` (0x03FF/0x0C00/0xF000) définis localement
avec citation `global.fieldmap.h:7-9` (évite une arête d'import `./fieldmap` lourde dans ce module
fondation). Purge du shadow simplifié `pokemon_storage_system.ts:119` = **hors périmètre** (dédup
phase C ; il ne throwait pas). Import ajouté à `src/match_call.ts` (ligne 86, ex-orphelin
non-résolu masqué par `@ts-nocheck` → ReferenceError).

**Sémantique palette 16/17 vérifiée** : les 2 call-sites match_call.c:1285/1452 passent `paletteSlot
= 17` (+ `tileNumDelta = 1`). `CopyTileMapEntry` (window.ts, branche default/17) = `dest = src +
tileOffset + (palette2<<12)` → **copie verbatim** : garde les bits palette embarqués dans
`firstTileNum` (`(0xF<<12)|TILE_POKENAV_ICON` ; `tTileNum | ~0xFFF` → pal 0xF). Le masque MAPGRID
re-tronque naturellement `firstTileNum` à 16 bits dès l'itération 0 (traçé : `0xFFFFF0AB` →
write `0xF0AB` via `&0xFFFF` de CopyTileMapEntry, puis update → `0xF0AC`), donc identité stricte
avec le `u16 firstTileNum` du C.

## Fix 2 — `SetBgMode` (bg.c:370 → `SetBgModeInternal` :58)

**C** : `SetBgModeInternal` fait `bgVisibilityAndMode = (bgVisibilityAndMode & ~0x7) | bgMode`
(mode poussé vers DISPCNT plus tard par ShowBg/HideBg→SyncBgVisibilityAndMode).
**Diff** : nouvel `export function SetBgMode(bgMode)`. Le port n'a PAS de staging
`bgVisibilityAndMode` (ShowBg ne passe pas par le registre) → écrit **directement DISPCNT bits 0-2
en RMW** : `rt.SetGpuReg(DISPCNT, (rt.GetGpuReg(DISPCNT) & ~0x7) | (bgMode & 0x7))`. Précédent du
même RMW-sur-DISPCNT = **bg.c:239** `SetTextModeAndHideBgs` (aucune valeur magique). `applyDispCnt`
(decomp-runtime.ts:838) en re-dérive `isAffine` (mode 1/2 → BG2/BG3 affine) → pilote le zoom carte
régionale. Sentinelle `__wireTodo('SetBgMode')` supprimée de pokenav_region_map.ts:67 + import ajouté.

## Fix 3 — `CopyToBgTilemapBufferRect` (bg.c:907-944)

**⚠️ Correction d'imprécision de l'audit** : bg.md pointait « l'impl 1:1 EXISTE (window.ts:1207) ».
`window.ts:1207` = `CopyRectToBgTilemapBufferRect` (bg.c:951, **13 args**, remap palette via
CopyTileMapEntry, screenSize-aware) — une fonction **DISTINCTE**. Les 3 call-sites appellent
`CopyToBgTilemapBufferRect(bg, src, destX, destY, width, height)` (**6 args**, bg.c:907, copie
u16 CONTIGUË, stride `0x20` hardcodé, **pas de remap palette**). Rediriger vers la 13-args aurait
changé la sémantique. → j'ai transcrit **bg.c:907 en propre** (voisin easy_chat.ts:816, précédent
1:1 identique).
**C** (branche NORMAL) : `((u16*)tilemap)[(destY16*0x20)+destX16] = *srcCopy++;`
**Diff** : nouvel `export function CopyToBgTilemapBufferRect(bg, src, destX, destY, width, height)`.
3 sentinelles supprimées (pokenav_region_map:45, pokenav_conditions_gfx:48, pokenav_ribbons_summary:55)
+ imports ajoutés.

## Fix 4 — `SetBgTilemapBuffer` / `UnsetBgTilemapBuffer` (bg.c:848/856)

**C** : `sGpuBgConfigs2[bg].tilemap = tilemap` / `= NULL`.
**Adaptation moteur CENTRALISÉE** (no-op) : le tilemap du BG est une **vue VRAM persistante** lue
chaque frame par le compositor (pas de pointeur WRAM réassignable), la copie se fait via
`CopyBgTilemapBufferToVram`. C'est **exactement** ce que font les écrans qui marchent (précédent
mail.ts:1018, pokenav_main_menu.ts:91). **Diff** : 2 nouveaux exports no-op dans window.ts ;
sentinelles `__wireTodo` supprimées + imports ajoutés dans **6 fichiers** : credits.ts, pokenav_
conditions_gfx.ts, pokenav_ribbons_summary.ts (listés/adjacents à la tâche) **+ pokenav_region_map.ts,
pokenav_conditions_search_results.ts, pokenav_ribbons_list.ts** (même sentinelle throwante trouvée à
la vérif — recâblées pour « zéro throw » cohérent). ⚠️ **Limite connue** : un écran qui décompresse
dans un buffer PUIS `SetBgTilemapBuffer` sans écrire la vue VRAM (conditions/credits) n'affichera pas
ce buffer tant qu'il n'est pas re-câblé façon easy_chat.ts:799 (alias buffer↔vue) — **hors périmètre
A2** (ces écrans sont encore massivement `__wireTodo`) ; l'objectif A2 = supprimer le crash à l'entrée.

## Fix 5 — `SetBgAffine` + `SetBgAffineInternal` (bg.c:772/244) — **INERTE**

**C** : garde `switch (bgVisibilityAndMode & 0x7)` (mode 0 return ; mode 1 → bg==2 ; mode 2 → bg∈{2,3}),
`BgAffineSet(&src,&dest,1)`, puis 9× `SetGpuReg(BG2PA..PD/X_L/H/Y_L/H)` (dont **double write BG2PA**
bg.c:274/278, transcrit fidèlement). **Diff** : `SetBgAffine` (export) → `SetBgAffineInternal` (privé)
→ `BgAffineSet` (privé) dans window.ts. Le garde-mode lit `rt.GetGpuReg(DISPCNT) & 0x7`. Registres
via `REG_OFFSET_BG2PA..` (import io_reg.ts) → chemin affine runtime existant (decomp-runtime.ts:816-834).
`BgAffineSet` = transcription du BIOS, math **identique à la routine DÉJÀ validée** dans le port
`PanFadeAndZoomScreen` (decomp-globals.ts:1117 : `gSineTable` Q8.8, index `alpha>>8`, shift `>>8`),
généralisée à sx/sy séparés (pa/pb←sx, pc/pd←sy). **Aucun appelant** (seul appelant solo du décomp =
`rayquaza_scene.c`, non porté) → laissé **INERTE** (tsc vert, boot sain), **NON testé en jeu**
(honnêteté Règle 4 : la math affine n'est pas exercée).

## Fix 6 — `LoadBgTilemap` (bg.c:404-416)

**C** : `LoadBgVram(bg, src, size, destOffset*2, DISPCNT_MODE_2)` (map base) + marque le curseur DMA.
**Diff** : nouvel `export function LoadBgTilemap(bg, src, sizeBytes, destOffset)` dans decomp-globals.ts
(sibling de `LoadBgTiles`) : copie `sizeBytes>>1` entrées u16 de `src` dans `bg.tilemap` (la vue u16
du screenblock mapBase lue par le compositor) à l'index u16 `destOffset` (= octet `destOffset*2` / 2).
Curseur factice `0` (copie synchrone ; `IsDma3ManagerBusyWithBgCopy` = jamais busy). Enregistré dans
les 2 registres bridge (gba-global-scope symbolsToExpose + decomp-bridge `__bridgedHelpers__`, sibling
de LoadBgTiles). **Call-site** battle_intro.ts:536 : `r.LoadBgTilemap?.()` était un **no-op silencieux**
car `r = globalThis.__rt` (l'instance runtime) n'a PAS ces helpers (exposeGbaGlobals ne peuple que
`globalThis`, pas `__rt` ; `setGlobalRuntime` ne l'augmente pas). → remplacé par **appel direct**
`LoadBgTilemap(bgId, tilemap, BG_SCREEN_SIZE, 0)` (import decomp-globals, plus 1:1 que via handle).
🩸 Note : le `r.LoadBgTiles?.()` voisin (:529) a le **même** défaut latent (no-op) — hors périmètre A2
(non signalé par l'audit ; DrawBattlerOnBg est un chemin VS/link, pas solo-critique).

---

## Non-faits (raison)

- **Purge des rustines/dupes** (GetBgAttribute local pss:116, WriteSequence local pss:119,
  CopyToBgTilemapBufferRect locaux pss:829/easy_chat:816, IsDma3ManagerBusyWithBgCopy ×3, GetBgY local
  pokenav_main_menu:73, SetBgTilemapBuffer/Unset no-op locaux ×N) : = **PHASE C** (dédup rétroactif),
  pas A2. Elles ne throwent pas ; les toucher = risque de régression sur des écrans qui marchent.
- **Branche `BG_TYPE_AFFINE`** de WriteSequence/CopyToBgTilemapBufferRect : non représentée dans le
  port (tilemap = Uint16Array, pas de vue u8) — cohérent avec les siblings déjà portés
  (FillBgTilemapBufferRect, CopyRectToBgTilemapBufferRect = NORMAL only). Aucun call-site affine.
- **rayquaza_scene.c** (appelant de SetBgAffine) : non porté → SetBgAffine reste inerte (par design).
- **Plumbing tilemap-buffer réel** pour conditions/credits (afficher un buffer décompressé passé à
  SetBgTilemapBuffer) : nécessite le re-câblage buffer↔vue (façon easy_chat.ts:799) au vrai câblage de
  ces écrans — hors A2.

## Écrans à re-tester (au câblage / par Fable)

1. **Écran d'appel Match Call** (overworld) : icône Pokénav tournante dessinée (WriteSequence) — ex-ReferenceError.
2. **Carte régionale Pokénav** : zoom ville (SetBgMode 0↔1 affine + CopyToBgTilemapBufferRect villes) — ex-throw.
3. **Pokénav Conditions / Rubans** (conditions_gfx, ribbons_summary/list, conditions_search_results, region_map) :
   entrée sans crash (SetBgTilemapBuffer no-op + CopyToBgTilemapBufferRect) — ex-throw.
4. **Générique de fin** (credits) : entrée sans crash (SetBgTilemapBuffer no-op) — ex-throw.
5. **Intro de combat** (battle_intro DrawBattlerOnBg, chemin VS) : LoadBgTilemap réel (ex-no-op) —
   non solo-critique, à vérifier si un combat VS/double le déclenche.

## Vérification

- `npx tsc --noEmit` = **0**.
- Sweep : **0** sentinelle `__wireTodo` restante pour SetBgMode / CopyToBgTilemapBufferRect /
  SetBgTilemapBuffer / UnsetBgTilemapBuffer / WriteSequenceToBgTilemapBuffer / LoadBgTilemap (src/ + harness/).
- Pas de serveur / jeu / git / commit (conforme aux règles dures de la tâche).

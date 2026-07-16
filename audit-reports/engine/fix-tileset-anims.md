# fix — `src/tileset_anims.ts` (animations de tiles overworld)

Date : 2026-07-17 · Fichier : `src/tileset_anims.ts` · Décomp : `src/tileset_anims.c`
Oracle avant : `84 fonctions (portées 49 · référencées 33 · absentes 2)`
Oracle après : **`84 fonctions (portées 84 · référencées 0 · absentes 0)`** ✅
`npx tsc --noEmit` = 0 · pitfalls audit = 0 finding dans le fichier · 0 cycle d'import.

---

## 1. VERDICT CÂBLAGE RACINE (le point important)

**Le câblage est RÉEL et CORRECT de bout en bout.** Les 33 « référencées non
déclarées » de l'oracle étaient un **FAUX POSITIF DE NOMMAGE**, pas un trou
fonctionnel. Chaîne vérifiée :

| Étape | Où | Preuve |
|---|---|---|
| Set callback primaire+secondaire | `fieldmap.ts:2000-2001` `CopyMapTilesetsToVram` | `setPrimaryTilesetAnimCallback(primaryTileset.name)` + `setSecondaryTilesetAnimCallback(secondaryTileset.name)` |
| `tileset.name` = clé du map | `fieldmap.ts:449` (`name: dir`) via `tilesetGNameToPath` (`fieldmap.ts:359`) | `gTileset_General`→`general`, `gTileset_Rustboro`→`rustboro`, `gTileset_MauvilleGym`→`mauville_gym`… = **exactement** les clés de `PRIMARY_INIT_MAP`/`SECONDARY_INIT_MAP` |
| Init au map-load | `TestOverworldScene.ts:1100` | `InitTilesetAnimations()` appelé APRÈS `CopyMapTilesetsToVram` |
| Tick per-frame | `TestOverworldScene.ts:846` | `UpdateTilesetAnimations()` (1:1 `overworld.c:1474`) |
| Flush VRAM au VBlank | `TestOverworldScene.ts:293` (`_fieldVBlankCB`) | `TransferTilesetAnimsBuffer(rt)` (1:1 `VBlankCB_Field`) |
| Re-init secondary au warp indoor/outdoor | `fieldmap.ts:1361` | `setSecondaryTilesetAnimCallback(...)` |

→ Les animations overworld (eau/fleurs/cascade General, TV Building, drapeaux,
torches, lumières, rondins…) **JOUENT DÉJÀ** (confirmé au sol 2026-07-03,
mémoire : rondins Pacifidlog animés, sonde VRAM 3 hashes distincts). La prémisse
« ne jouent pas → bugs partout » était une mauvaise lecture de l'oracle.

**Pourquoi l'oracle criait :** les 29 `QueueAnimTiles_*` + 3 helpers
(`AppendTilesetAnimToBuffer`, `ResetTilesetAnimBuffer`,
`_InitPrimaryTilesetAnimation`, `_InitSecondaryTilesetAnimation`) étaient portés
mais en **camelCase** (`queueAnimTiles_*`, `appendTilesetAnimToBuffer`…). L'oracle
matche le nom exact PascalCase du décomp → il les voyait « référencées mais non
déclarées ». Incohérence interne au passage : `TilesetAnim_*` étaient déjà en
PascalCase, seuls les helpers avaient dérivé.

---

## 2. CE QUI A ÉTÉ FAIT

### (A) Rename 1:1 des 32 helpers camelCase → PascalCase (dérive Règle 1 corrigée)

Aucun appelant externe (tous module-private, `grep` src+harness vide hors fichier) →
rename sûr, `tsc` vert. Mapping (préfixe partagé, un `replace_all` chacun) :

| Avant (camelCase) | Après (1:1 décomp) |
|---|---|
| `queueAnimTiles_*` (×29) | `QueueAnimTiles_*` |
| `appendTilesetAnimToBuffer` | `AppendTilesetAnimToBuffer` |
| `resetTilesetAnimBuffer` | `ResetTilesetAnimBuffer` |
| `_initPrimaryTilesetAnimation` | `_InitPrimaryTilesetAnimation` |
| `_initSecondaryTilesetAnimation` | `_InitSecondaryTilesetAnimation` |

Les 29 `QueueAnimTiles_*` couverts : General_{Flower,Water,SandWaterEdge,Waterfall,
LandWaterEdge}, Building_TVTurnedOn, Rustboro_{WindyWater,Fountain}, Dewford_Flag,
Slateport_Balloons, Mauville_Flowers, Lavaridge_{Steam,Lava}, EverGrande_Flowers,
Pacifidlog_{LogBridges,WaterCurrents}, Sootopolis_StormyWater, Underwater_Seaweed,
Cave_Lava, BattleFrontierOutside{West,East}_Flag, SootopolisGym_Waterfalls,
EliteFour_{GroundLights,WallLights}, MauvilleGym_ElectricGates,
BikeShop_BlinkingLights, BattlePyramid_{Torch,StatueShadow}.

### (B) Battle Dome — LE seul vrai trou fonctionnel (transcrit 1:1)

Était un STUB no-op. Transcrit les 4 fonctions décomp (:1101-1188) :
`TilesetAnim_BattleDome`, `TilesetAnim_BattleDome2` (les 2 absentes),
`BlendAnimPalette_BattleDome_FloorLights`, `BlendAnimPalette_BattleDome_FloorLightsNoBlend`.

- Battle Dome est la **seule** anim par **blend de palette** (pas copie de tiles) :
  `CpuCopy16(pals[t%4], &gPlttBufferUnfaded[BG_PLTT_ID(8)], PLTT_SIZE_4BPP)` +
  `BlendPalette(BG_PLTT_ID(8), 16, gPaletteFade.y, gPaletteFade.blendColor & 0x7FFF)`.
- Assets : `gTilesetAnims_BattleDomePals0_0..3` = `graphics/battle_frontier/dome_anim{1..4}.pal`
  (`graphics.c:968-971`). **Déjà extraits côté port** :
  `/decomp/em/battle_frontier/dome_anim{1..4}.pal` (JASC-PAL 16 couleurs). Préchargées
  dans `InitTilesetAnim_BattleDome` via `preloadPals`/`getPal` (mirror de `preloadTiles`).
  Aucun nouvel asset à générer.
- Accès palette : Proxies module-level `gPlttBufferUnfaded`/`gPaletteFade` (palette.ts,
  anti-cycle par design) + `BlendPalette` (decomp-globals). Vérifié 0 cycle d'import
  (`find-import-cycle.cjs`).
- **1 adaptation documentée (Règle 4)** : le switchover `FloorLights → NoBlend`
  (`FindTaskIdByFunc(Task_BattleTransition_Intro) != TASK_NONE`) reste **INERTE** —
  `Task_BattleTransition_Intro` n'est **pas exporté** par `battle_transition.ts` (tasks
  anonymes côté port) et l'éditer est hors-scope de ce fichier. Représenté par le
  prédicat `battleTransitionIntroTaskActive()` → `false` (= « aucune transition », ce
  que la décomp voit aussi en overworld normal). Seul effet manquant : la variante
  NoBlend pendant le wipe d'entrée en combat DANS le dome. **Non vérifiable en solo**
  (Battle Frontier hors-solo) → transcrit-mais-NON-testé-en-jeu, à valider si/quand le
  Frontier devient jouable. Zéro effet sur l'overworld solo (tileset `battle_dome`
  jamais chargé en solo).

---

## 3. RELIQUAT (hors-scope, pré-existant)

`globals : 191 (portés 8 · référencés 11 · absents 172)`. Les `[✗]` sont les données
`gTilesetAnims_*_Frame*` (INCGFX_U16/INCBIN) : le fichier les représente en
**assets-URLs** (`preloadTiles`/`getTiles` sur `.png`/`.pal`), PAS en `const u16[]`
nommés — choix d'archi établi (cf. en-tête + séquences de frames). C'était déjà le cas
avant (les données ne sont pas des « fonctions manquantes »). Non traité : hors du
périmètre « fonctions » de la mission, et re-transcrire les blobs en consts serait une
régression vs le système d'assets packés du moteur.

---

## 4. VÉRIFIER EN JEU (3 spots à anims visibles, solo-atteignables)

1. **Labo du Prof. Birch (Littleroot, intérieur)** — tileset primaire `building` :
   la **TV allumée** clignote (2 frames) → `TilesetAnim_Building` /
   `QueueAnimTiles_Building_TVTurnedOn` (dest `TILE_OFFSET_4BPP(496)`).
2. **Route 101 / n'importe quel extérieur** — tileset primaire `general` : **fleurs**
   (cycle `[0,1,0,2]`) + **eau** (8 frames) + **cascade** animent en continu →
   `TilesetAnim_General`.
3. **Rustboro City** (secondaire `rustboro`) : **windy water** (8 cellules) +
   **fontaine** → `TilesetAnim_Rustboro`. Alternatives : **Dewford Town** (drapeau),
   **Mauville City** (fleurs), **Pacifidlog Town** (rondins).

Sonde runtime (console user) si besoin :
`window.__getTilesetAnimDebugState()` → doit montrer `primaryCallback:"TilesetAnim_General"`,
`primaryCounterMax:256`, compteur qui tourne, et `secondaryCallback` selon la map.

Battle Dome : **non testable en solo** (Frontier). La sonde palette serait
`window.__rt.gPlttBufferUnfaded.get(BG_PLTT_ID(8)+i)` sur une map `battle_dome`.

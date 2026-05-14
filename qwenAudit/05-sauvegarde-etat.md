# Audit 5/8 : Sauvegarde et état du jeu

## Comparaison web projet vs décomp pokeemeraude

### Architecture décomp save system

**Fichiers décomp clés** :
- `src/save.c` (1 052 lignes) — TrySavingData, HandleSavingData, CalculateChecksum, ReadFlashSector, GetSaveValidStatus, sector layout, incremental write
- `src/load_save.c` (293 lignes) — CheckForFlashMemory, SetSaveBlocksPointers (ASLR), MoveSaveBlocks_ResetHeap, Save/LoadPlayerParty, Save/LoadObjectEvents, CopyPartyAndObjectsTo/FromSave, encryption key helpers
- `src/event_data.c` (233 lignes) — InitEventData, VarGet/Set, FlagSet/Clear/Get, ClearTempFieldEventData, National Dex, Mystery Gift
- `include/save.h` (116 lignes) — SECTOR_DATA_SIZE=3968, SECTOR_SIGNATURE=0x8012025, NUM_SECTORS_PER_SLOT=14, SAVE_STATUS_*, SaveSector struct
- `include/load_save.h` (58 lignes) — SaveBlock1ASLR/SaveBlock2ASLR, gSaveBlock1Ptr/gSaveBlock2Ptr/gPokemonStoragePtr
- `include/event_data.h` (49 lignes) — special vars, gSpecialVar_* constants
- `include/constants/flags.h` — ~1 500 flag definitions (TEMP_FLAGS, story flags, event flags)
- `include/constants/vars.h` — 256 var definitions (0x4000..0x40FF)

**Sector layout décomp** :
- Sectors 0-13 : Save Slot 1 (SaveBlock2 = 1 sector, SaveBlock1 = 4 sectors, PokemonStorage = 9 sectors)
- Sectors 14-27 : Save Slot 2
- Sectors 28-29 : Hall of Fame
- Sector 30 : Trainer Hill
- Sector 31 : Recorded Battle

**ASLR** : `SetSaveBlocksPointers` décale les save blocks en EWRAM d'un offset basé sur `Random() + trainerId`. C'est une mesure anti-cheat.

**Encryption** : `encryptionKey` (u32) stocké dans SaveBlock2. Données sensibles encryptées via XOR key.

### Architecture web projet

**Fichiers correspondants** :
- `src/engine/save-blocks.ts` (1 594 lignes) — 1:1 TS interfaces SaveBlock1, SaveBlock2, PokemonStorage + factory functions
- `src/engine/save-system.ts` (372 lignes) — localStorage persistence, dual-slot, checksum, signature, slot alternation, v1→v2 migration
- `src/engine/load_save.ts` (324 lignes) — PreSaveSyncBlocks, PostLoadApplyBlocks, Save/LoadObjectEvents, dynamic warp management
- `src/engine/game-state.ts` (318 lignes) — singleton facade delegating to save blocks (flags, vars, party, bag, options, map, etc.)

**Adaptation web** :
- Pas de flash sectors — localStorage JSON keys `em_save_v2_slot0`/`slot1`
- Pas d'ASLR (inutile en web)
- Pas d'encryption (inutile en web)
- Checksum sur JSON serialized (équivalent sémantique)
- Flags string-keyed (`Record<string, true>`) vs bit-packed (`u8 flags[512]`)
- Vars string-keyed vs indexed par enum offset

---

## Écarts détectés

### ERREUR E5.1 — ASLR absent (acceptable)

**Décomp** : `SetSaveBlocksPointers` (load_save.c:70) applique un décalage EWRAM basé sur `Random() + trainerId` pour anti-cheat. `MoveSaveBlocks_ResetHeap` sauvegarde les blocks, change l'offset, restaure.

**Web** : ASLR absent. Les blocks sont en mémoire JS standard.

**Impact** : pas de conséquence fonctionnelle en web. L'ASLR est un mécanisme anti-cheat matériel.

**Criticité** : TRIVIAL — adaptation architecturale justifiée

### ERREUR E5.2 — Encryption key absente (acceptable)

**Décomp** : `gSaveBlock2Ptr->encryptionKey` — u32 appliqué aux données sensibles via `ApplyNewEncryptionKeyToAllEncryptedData`.

**Web** : pas d'encryption. Les données sont en clair dans localStorage.

**Impact** : acceptable en web. localStorage est déjà accessible à l'utilisateur.

**Criticité** : TRIVIAL — adaptation architecturale justifiée

### ERREUR E5.3 — Sector rotation absente

**Décomp** : `gLastWrittenSector++ % NUM_SECTORS_PER_SLOT` — la rotation de sectors dans chaque slot réduit l'usure flash.

**Web** : les 14 sectors décomp sont écrits comme un seul bloc JSON. Pas de rotation.

**Impact** : localStorage n'a pas de limite d'usure par sector. Pas de conséquence.

**Criticité** : TRIVIAL — adaptation architecturale

### ERREUR E5.4 — PokemonStorage non sauvegardé séparément

**Décomp** : `PokemonStorage` (9 sectors) est écrit séparément de SaveBlock1/2. Le `PokemonStoragePtr` est un pointeur distinct.

**Web** : `PokemonStorage` interface existe dans `save-blocks.ts` mais n'est pas sauvegardée dans les slots. Le `SaveSlot` contient `block1` et `block2` mais pas de `pokemonStorage` field.

**Impact** : les PC boxes (14 boîtes × 30 slots = 420 Pokémon max) ne sont pas persistés entre les sessions. Si le player met des Pokémon au PC, ils seront perdus au reload.

**Fichiers** : `src/engine/save-system.ts` ligne 60-73 (SaveSlot interface)
**Criticité** : MEDIUM — bloque le PC/box system pour la long-play. Acceptable en MVP tutorial.

### ERREUR E5.5 — Hall of Fame / Trainer Hill / Recorded Battle absents

**Décomp** : Sectors 28-31 réservées pour Hall of Fame (2 sectors), Trainer Hill (1 sector), Recorded Battle (1 sector).

**Web** : absents. Non sauvegardés.

**Impact** : pas de Hall of Fame (top 100 Pokémon vaincus), pas de Frontier progression persistante, pas de battles enregistrées.

**Criticité** : LOW — hors scope MVP, post-overworld

### ERREUR E5.6 — Checksum : équivalent sémantique mais pas byte-exact

**Décomp** : `CalculateChecksum` (save.c) calcule un sum 16-bit sur les bytes bruts du sector.

**Web** : `calculateChecksum` (save-system.ts:93-105) calcule un sum 16-bit sur les character codes du JSON serialized.

**Évaluation** : l'esprit est identique (sum 32-bit folded à 16-bit). Le format est adapté JSON vs binary. La détection de corruption fonctionne dans les deux cas.

**Criticité** : ✅ CORRECT — adaptation sémantique correcte

### ERREUR E5.7 — Signature + counter + alternation : 1:1 ✅

**Décomp** :
- `SECTOR_SIGNATURE = 0x8012025` ✅ (web: ligne 38)
- `gSaveCounter++` à chaque write ✅ (web: ligne 247)
- Load pick highest counter ✅ (web: lignes 184-193)
- Slot alternation (write to opposite of last saved) ✅ (web: ligne 246)
- `SAVE_STATUS_*` constants ✅ (web: lignes 44-48)

**Évaluation** : ✅ FIDÈLE — le dual-slot system avec signature/counter/checksum/alternation est 1:1 décomp.

### ERREUR E5.8 — Save flow : PreSaveSyncBlocks correct mais incomplet

**Décomp** : le save flow complet :
1. `SetContinueGameWarpStatusToDynamicWarp()` — copy dynamicWarp → continueGameWarp
2. `CopyPartyAndObjectsToSave()` — sync gPlayerParty → SaveBlock1.playerParty
3. `SaveMapView()` — snapshot 256 metatiles autour du player
4. `WriteSaveBlocks()` — incremental write sectors

**Web** :
1. SetContinueGameWarpStatusToDynamicWarp ✅ (load_save.ts)
2. CopyPartyAndObjectsToSave via `SaveObjectEvents` ✅ (load_save.ts:131)
3. SaveMapView ❌ absent — pas de snapshot de tilemap persisté
4. TrySavingData ✅ (save-system.ts:228)

**Impact** : sans SaveMapView, les map transitions ne peuvent pas restaurer le viewport exact au reload. Le player respawne mais la camera position exacte n'est pas persistée.

**Criticité** : LOW — le player respawn sur la bonne map/coords, la camera se repositionne automatiquement

### ERREUR E5.9 — Load flow : PostLoadApplyBlocks correct avec map guard ✅

**Décomp** : `CopyPartyAndObjectsFromSave()` — restore gPlayerParty/gObjectEvents depuis blocks.

**Web** : `PostLoadApplyBlocks` + `LoadObjectEvents` avec map guard fix (session 126). Les snapshots sont seulement appliqués si la map correspond.

**Évaluation** : ✅ CORRECT — le fix map guard est même plus correct que le décomp brut qui ne clippe pas cross-map.

### ERREUR E5.10 — Flags : string-keyed vs bit-packed (acceptable)

**Décomp** : `u8 gSaveBlock1Ptr->flags[512]` = 4096 bits. Accès via `FlagGet(FLAG_ADVENTURE_STARTED)` où FLAG_ADVENTURE_STARTED = index dans l'array.

**Web** : `Record<string, true>` avec clés string `"FLAG_ADVENTURE_STARTED"`.

**Impact** : plus verbeux en storage mais fonctionnellement équivalent. Les ~1 500 flags décomp sont adressables par nom string.

**Criticité** : ✅ CORRECT — adaptation web justifiée, zéro perte fonctionnelle

### ERREUR E5.11 — Vars : string-keyed vs indexed (acceptable)

**Décomp** : `u16 gSaveBlock1Ptr->vars[256]` indexed by `0x4000..0x40FF`.

**Web** : `Record<string, number>` avec clés string `"VAR_RESULT"`, `"VAR_FACING"`, etc.

**Impact** : les opcodes bytecode décomp utilisent `VAR_0x4001` style. Le `resolveDecompConstant` dans `script-vars.ts` mappe ces names. La granularité 256 slots est préservée par le string key.

**Criticité** : ✅ CORRECT — adaptation web, zéro perte fonctionnelle

### ERREUR E5.12 — gSpecialVar wiring : partiel mais fonctionnel

**Décomp** : 16 gSpecialVar globals (0x8000..0x800B, Result, LastTalked, Facing, MonBoxId, MonBoxPos, Unused_0x8014) + `sSpecialFlags[8]`.

**Web** :
- `gSpecialVar.Result` → `gameState` vars ✅ (script-vars.ts)
- `gSpecialVar.LastTalked` → `gameState` vars ✅
- `gSpecialVar.Facing` → `gPlayerAvatar.facing` ✅
- `gSpecialVar_0x8000..0x800B` → pas de globals dédiés ❌
- `sSpecialFlags` → absents ❌
- `gSpecialVar.MonBoxId/MonBoxPos` → absents ❌

**Impact** : les spécial vars 0x8000..0x800B sont utilisés par les scripts pour passer des paramètres temporaires. Sans les globals, certains scripts écrivent dans un Record au lieu d'une variable directe.

**Fichiers** : `src/engine/script-vars.ts`, `src/engine/decomp-globals.ts`
**Criticité** : MEDIUM — les scripts utilisant gSpecialVar_0x8000..0x800B comme temporaires peuvent avoir des effets inattendus

### ERREUR E5.13 — ClearTempFieldEventData / ClearDailyFlags : absents

**Décomp** :
- `ClearTempFieldEventData` — clear TEMP_FLAGS + specific flag clears (ENC_UP_ITEM, STRENGTH, etc.)
- `ClearDailyFlags` — clear daily reset flags (pour les événements journaux)
- `DisableNationalPokedex` / `EnableNationalPokedex` — National Dex enable/disable avec magic value checks

**Web** : absents. Pas de `ClearTempFieldEventData`, pas de daily flags system.

**Impact** : les flags temporaires ne sont pas nettoyés entre les map transitions. Les événements qui dépendent de daily reset (healing center, trainer rematches) ne se reset pas.

**Fichiers** : `src/engine/save-system.ts`
**Criticité** : MEDIUM — les flags temporaires qui devraient être reset entre les maps restent set → comportement incorrect pour les events conditionnés

### ERREUR E5.14 — ContinueGameWarp : partiel

**Décomp** :
- `UseContinueGameWarp()` — check `gSaveBlock2Ptr->specialSaveWarpFlags & CONTINUE_GAME_WARP`
- `SetContinueGameWarpStatus()` / `ClearContinueGameWarpStatus()`
- `SetContinueGameWarpStatusToDynamicWarp()` — copy dynamicWarp → continueGameWarp

**Web** :
- `dynamicWarp` getter/setter dans `game-state.ts` ✅
- `specialSaveWarpFlags` dans SaveBlock2 ✅
- `UseContinueGameWarp` ❌ — pas de function qui check le flag CONTINUE_GAME_WARP
- Le `CB2_ContinueSavedGame` web fait le resume directement sans passer par UseContinueGameWarp

**Impact** : le resume normal (continueGameWarp absent) fonctionne. Le resume via continueGameWarp (pour les warp spéciaux post-battle, post-event) est bypassé.

**Criticité** : MEDIUM — les warps de continuation (après battle trainer, après event script) peuvent respawn au mauvais endroit

### ERREUR E5.15 — PlayTimeCounter : persisté mais pas 1:1

**Décomp** : `gSaveBlock2Ptr->playTimeCounter` — incremented chaque frame. Persisté en save.

**Web** : PlayTimeCounter présent dans le tick loop ✅ (vérifié audit 1). Persistance au save ✅ via SaveBlock2.

**Impact** : fonctionnel. Les minutes/jourées passées sont comptées.

**Criticité** : ✅ CORRECT

### ERREUR E5.16 — v1→v2 migration : présente et fonctionnelle

**Web** : `_tryMigrateLegacyV1` dans save-system.ts — si `em_save_v1` trouvé, migré au nouveau format.

**Évaluation** : ✅ BONNE PRATIQUE — pas dans le décomp mais utile pour la compatibilité ascendante web.

### ERREUR E5.17 — RTC offset persistence : présente

**Web** : `localTimeOffsetMs` sauvé/restauré dans SaveBlock2. Câblé au load et au save.

**Évaluation** : ✅ CORRECT — fix session 124, fonctionnel.

---

## Résumé passage 5

| ID     | Type        | Criticité | Description courte                                          |
|--------|-------------|---------|-------------------------------------------------------------|
| E5.1   | ✅ Adapt    | TRIVIAL | ASLR absent (anti-cheat matériel, inutile en web)            |
| E5.2   | ✅ Adapt    | TRIVIAL | Encryption absente (inutile en web)                          |
| E5.3   | ✅ Adapt    | TRIVIAL | Sector rotation absente (usure flash = N/A web)              |
| E5.4   | Manquant    | MEDIUM  | PokemonStorage non sauvegardé séparément                     |
| E5.5   | Manquant    | LOW     | Hall of Fame / Trainer Hill / Recorded Battle absents        |
| E5.6   | ✅ CORRECT  | —       | Checksum équivalent sémantique JSON                          |
| E5.7   | ✅ CORRECT  | —       | Signature + counter + alternation 1:1 décomp                 |
| E5.8   | Partiel     | LOW     | SaveMapView absent (tilemap snapshot)                        |
| E5.9   | ✅ CORRECT  | —       | PostLoadApplyBlocks + map guard (fix cross-map)              |
| E5.10  | ✅ CORRECT  | —       | Flags string-keyed (adaptation web, zéro perte)              |
| E5.11  | ✅ CORRECT  | —       | Vars string-keyed (adaptation web, zéro perte)               |
| E5.12  | Partiel     | MEDIUM  | gSpecialVar wiring partiel (0x8000..0x800B absents)          |
| E5.13  | Manquant    | MEDIUM  | ClearTempFieldEventData / ClearDailyFlags absents             |
| E5.14  | Partiel     | MEDIUM  | UseContinueGameWarp absent, dynamicWarp partiel               |
| E5.15  | ✅ CORRECT  | —       | PlayTimeCounter persisté 1:1                                 |
| E5.16  | ✅ CORRECT  | —       | v1→v2 migration présente                                     |
| E5.17  | ✅ CORRECT  | —       | RTC offset persistence fonctionnelle                         |

**Couverture globale save/state** :
- Dual-slot system : ~95% (signature ✅, counter ✅, alternation ✅, checksum ✅)
- Save blocks : ~85% (Block1/Block2 1:1, PokemonStorage ❌, HoF ❌)
- Save flow : ~80% (PreSaveSync ✅, SaveObjectEvents ✅, SaveMapView ❌)
- Load flow : ~90% (LoadGameSave ✅, PostLoadApplyBlocks ✅, map guard ✅)
- Flags/vars : ~95% (string-keyed ✅, 1:1 décomp sémantique)
- Special vars : ~60% (Result/LastTalked/Facing ✅, 0x8000..0x800B ❌)
- Temp/daily flags : ~20% (ClearTempFieldEventData ❌, daily reset ❌)
- Continue warp : ~50% (dynamicWarp ✅, UseContinueGameWarp ❌)

**Fort** : le dual-slot save system est fidèlement implémenté. La signature/counter/checksum/alternation est 1:1 décomp. Les blocks sont complets (Block1/Block2 1:1 interfaces). La migration v1→v2 est une bonne pratique.

**Faible** : PokemonStorage non persisté, temp/daily flags reset absent, continueGameWarp partiel. Ces gaps impactent la long-play mais pas le tutorial MVP.

**Priorité correction** : E5.14 (continueGameWarp — affecte le respawn post-battle), E5.13 (ClearTempFieldEventData — comportement events), E5.12 (gSpecialVar — scripts temporaires), E5.4 (PokemonStorage — PC boxes).

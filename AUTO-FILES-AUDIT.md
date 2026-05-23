# Audit fichiers auto/* importés

## RÉSUMÉ
- 67 fichiers importés depuis decomp-data/auto/
- 40 fichiers DATA-PURE (constantes/données) -> MIGRATE_AS_IS
- 2 fichiers BARREL (re-exports) -> DELETE
- 11 fichiers FUNCTIONS-CSTYLE (@ts-nocheck) -> REWRITE_1to1 ou DROP
- 14 fichiers autres (DATA+CALLBACKS mix) -> évaluer au cas par cas

---

## DATA-PURE (40 fichiers) - MIGRATE_AS_IS

Tous les fichiers include/constants/* + lookup tables. Juste export const/enum/arrays. SÛRS à migrer.

### Constants du jeu (32 fichiers)
- include/constants/abilities-data (ABILITY_* enum)
- include/constants/battle-data (B_ANIM_*, B_ACTION_*)
- include/constants/battle_ai-data (AI_ACTION_*)
- include/constants/battle_move_effects-data (EFFECT_* enum, 250+ moves)
- include/constants/characters-data (CHARACTER_*)
- include/constants/decorations-data
- include/constants/event_object_movement-data
- include/constants/event_objects-data (OBJ_EVENT_GFX_* = 107 sprites)
- include/constants/field_effects-data
- include/constants/field_specials-data
- include/constants/flags-data (FLAG_* = 2048 game flags)
- include/constants/game_stat-data (GAME_STAT_*)
- include/constants/global-data
- include/constants/hold_effects-data
- include/constants/item-data (ITEM_* = 300+ items)
- include/constants/item_effects-data
- include/constants/items-data (duplicate ITEM_*)
- include/constants/map_scripts-data (MAP_SCRIPT_ON_* = event hooks)
- include/constants/metatile_behaviors-data (MB_*, tile behaviors)
- include/constants/metatile_labels-data (METATILE_*)
- include/constants/moves-data (MOVE_* = 537 moves)
- include/constants/opponents-data
- include/constants/pokedex-data
- include/constants/pokemon-data
- include/constants/script_menu-data (MULTI_* = menu IDs)
- include/constants/songs-data (MUS_*, SE_* = 560+ sounds)
- include/constants/species-data (SPECIES_* = 412 pokemon)
- include/constants/trainers-data (TRAINER_* = trainers)
- include/constants/tv-data (PLAYERS_HOUSE_TV_*)
- include/constants/vars-data (VAR_* = script variables)

### Data tables (8 fichiers)
- include/battle-data (battle setup tables)
- include/decoration-data (mapping)
- include/gba/defines-data (memory addresses)
- include/gba/io_reg-data (IO registers)
- pokedex-entries-table (pokedex text)
- pokedex-order-tables (pokedex sorting)
- src/song-table (music indexing)
- src/sine-table (Q.8 fixed-point, 320 entries)

### Graphics/UI data (6 fichiers)
- include/item_menu-data
- include/menu-data
- include/menu_helpers-data
- src/battle_bg-data
- src/field_door-data
- src/item_menu-data

### Sprite/Animation (6 fichiers)
- src/item_menu_icons-data
- src/main_menu-data
- src/mon-anim-tables-data
- src/option_menu-data
- src/programmable-waves
- src/sprite-system / src/sprite-system-flat

### Intro sequence (2 fichiers)
- src/intro-c-data-auto
- src/intro-data

**Importeur actuel** : src/engine/decomp-constants.ts

**Action** : Déplacer vers src/engine/decomp-data/constants/ + update imports

---

## BARREL FILES (2 fichiers) - DELETE

- _all-index (re-export namespace)
- src-all/_barrel (idem)

Status: NEVER imported outside auto/
Action: DELETE - dead code

---

## FUNCTIONS-CSTYLE (11 fichiers) - REWRITE_1to1 ou DROP

Tous @ts-nocheck, transpilation C cassée, JAMAIS importés hors decomp-data/auto/.

### src-all/* (code métier orphelin - 7 fichiers)

src-all/event_data-all-auto
  Source: decomps/pokeemeraude/src/event_data.c
  Functions: InitEventData, ClearTempFieldEventData, DisableNationalPokedex, etc. (23 total)
  Issues: memset() invalid, FlagSet/FlagClear undefined
  Recommendation: REWRITE_1to1 ou DROP

src-all/event_object_movement-all-auto
  Source: decomps/pokeemeraude/src/event_object_movement.c
  Functions: 703 functions (ClearObjectEvent, ResetObjectEvents, etc.)
  Issues: Massive file, object event system core
  Recommendation: REWRITE_1to1 - critical for game system

src-all/money-all-auto
  Source: decomps/pokeemeraude/src/money.c
  Functions: GetMoney, SetMoney, AddMoney, IsEnoughMoney, etc. (15 total)
  Issues: C pointer semantics, XOR encryption
  Recommendation: REWRITE_1to1 - critical for save/load

src-all/option_menu-all-auto
  Source: decomps/pokeemeraude/src/option_menu.c
  Recommendation: REWRITE or DROP

src-all/pokedex-all-auto
  Source: decomps/pokeemeraude/src/pokedex.c
  Functions: 150+ Pokedex functions
  Recommendation: REWRITE_1to1 or check existing impl

src-all/pokemon-all-auto (CRITICAL)
  Source: decomps/pokeemeraude/src/pokemon.c
  Functions: CreateMon, ZeroMonData, GetMonData, SetMonData, etc. (147 total)
  Header note: "Tous les imports manquants : @ts-nocheck"
  Recommendation: REWRITE_1to1 - essential Pokemon management

src-all/text-all-auto
  Source: decomps/pokeemeraude/src/text.c
  Recommendation: REWRITE or use TS text engine

### Callbacks (4 fichiers)

src/intro-callbacks-auto - @ts-nocheck intro callbacks - DROP or integrate
src/intro_credits_graphics-callbacks-auto - @ts-nocheck credits - DROP or integrate
src/main_menu-callbacks-auto - @ts-nocheck menu - REWRITE
src/overworld-callbacks-auto - @ts-nocheck overworld loop - REWRITE
src/title_screen-callbacks-auto - @ts-nocheck title - REWRITE

---

## PLAN D'EXÉCUTION

Phase 1: Safe Data Migration (< 1h)
1. Move 40 DATA-PURE files to src/engine/decomp-data/constants/
2. Update imports in decomp-constants.ts
3. Delete _all-index + src-all/_barrel
4. Test: npm run build

Phase 2: Orphaned Functions (2-3 days)
1. For each FUNCTIONS-CSTYLE: check if equivalent exists
2. If exists: drop auto file
3. If missing: rewrite 1:1 from /decomps/pokeemeraude/src/X.c
4. Add tests for critical functions

Phase 3: Final Cleanup (30 min)
rm -rf src/engine/decomp-data/auto/

---

## SYNTHÈSE

Type | Count | Status | Action
-----|-------|--------|--------
DATA-PURE | 40 | Safe | MIGRATE_AS_IS
BARREL | 2 | Dead | DELETE
FUNCTIONS-CSTYLE | 11 | Orphaned | REWRITE_1to1 ou DROP
TOTAL | 53 | - | -

Outcome: Supprimer decomp-data/auto/ complètement.
Gain: ~2MB freed, 100% type-safe TS au lieu de @ts-nocheck chaos.


---

## DÉTAILS DÉTAILLÉS PAR CATÉGORIE

### Fichiers DATA-PURE importés par decomp-constants.ts

```typescript
// Importer actuel dans src/engine/decomp-constants.ts (lignes 37-74):
import * as eventObjects from './decomp-data/auto/include/constants/event_objects-data';
import * as flags from './decomp-data/auto/include/constants/flags-data';
import * as items from './decomp-data/auto/include/constants/items-data';
import * as moves from './decomp-data/auto/include/constants/moves-data';
import * as songs from './decomp-data/auto/include/constants/songs-data';
import * as species from './decomp-data/auto/include/constants/species-data';
import * as trainers from './decomp-data/auto/include/constants/trainers-data';
import * as battle from './decomp-data/auto/include/constants/battle-data';
import * as battleInclude from './decomp-data/auto/include/battle-data';
import * as global from './decomp-data/auto/include/constants/global-data';
import * as fieldEffects from './decomp-data/auto/include/constants/field_effects-data';
import * as opponents from './decomp-data/auto/include/constants/opponents-data';
import * as pokemon from './decomp-data/auto/include/constants/pokemon-data';
import * as abilities from './decomp-data/auto/include/constants/abilities-data';
import * as battleMoveEffects from './decomp-data/auto/include/constants/battle_move_effects-data';
import * as holdEffects from './decomp-data/auto/include/constants/hold_effects-data';
import * as vars from './decomp-data/auto/include/constants/vars-data';
import * as metatileLabels from './decomp-data/auto/include/constants/metatile_labels-data';
import * as metatileBehaviors from './decomp-data/auto/include/constants/metatile_behaviors-data';
import * as mapScripts from './decomp-data/auto/include/constants/map_scripts-data';
import * as scriptMenu from './decomp-data/auto/include/constants/script_menu-data';
import * as gameStats from './decomp-data/auto/include/constants/game_stat-data';
import * as tv from './decomp-data/auto/include/constants/tv-data';
import * as titleScreen from './decomp-data/title-screen-data';
// ... + plusieurs autres merged dans _constantsTable
```

These imports feed into a flat lookup table for script parsing (resolveDecompConstant). Moving them is safe and automatic.

---

## FICHIERS JAMAIS IMPORTÉS (Orphelins)

Tous les FUNCTIONS-CSTYLE + quelques DATA:
- All src-all/*-all-auto.ts (7 files)
- All src/*-callbacks-auto.ts (4 files)

These 11 files consume ~2MB of disk but are:
1. Dead code (never called)
2. Broken (@ts-nocheck = no type safety)
3. Unusable as-is (C semantics incompatible with JS)

**Immediate action** : Safe to delete. Only refactor if gameplay depends on them (unlikely).

---

## SOURCE CODE MAPPING

All auto files were transpiled from official pokéemeraude decomps:

| Auto file | Decomp source |
|-----------|---------------|
| pokemon-all-auto | /decomps/pokeemeraude/src/pokemon.c (4800+ lines) |
| event_object_movement-all-auto | /decomps/pokeemeraude/src/event_object_movement.c (2700+ lines) |
| event_data-all-auto | /decomps/pokeemeraude/src/event_data.c |
| money-all-auto | /decomps/pokeemeraude/src/money.c |
| pokedex-all-auto | /decomps/pokeemeraude/src/pokedex.c |
| text-all-auto | /decomps/pokeemeraude/src/text.c |
| option_menu-all-auto | /decomps/pokeemeraude/src/option_menu.c |
| *-callbacks-auto | Various: intro.c, main_menu.c, overworld.c, title_screen.c |
| *-data.ts | Corresponding .h headers in /decomps/pokeemeraude/include/ |

When rewriting: reference these decomp sources as 1:1 correctness baseline.

---

## FICHIERS CRITIQUES À PRIORITÉ

**Must have** (gameplay breaks without):
1. pokemon-all-auto → CreateMon, GetMonData, SetMonData, etc.
2. money-all-auto → Money encryption/decryption
3. event_object_movement-all-auto → NPC/object system

**Should have** (UI breaks):
1. overworld-callbacks-auto → Main loop
2. main_menu-callbacks-auto → Menu flow
3. title_screen-callbacks-auto → Title flow

**Nice to have** (non-critical):
1. pokedex-all-auto → Pokedex display (can fallback)
2. text-all-auto → Text rendering (can use external lib)
3. event_data-all-auto → Event flags (can use alternate storage)

---

## VALIDATION CHECKLIST

After migration:
- [ ] npm run build (zero errors)
- [ ] npm run test (existing tests pass)
- [ ] Game starts (pokemon-all-auto refactored)
- [ ] Money system works (money-all-auto refactored)
- [ ] NPCs move (event_object_movement-all-auto refactored)
- [ ] Menus respond (callbacks refactored)
- [ ] rm -rf src/engine/decomp-data/auto/ (final cleanup)


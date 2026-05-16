---
name: Session 141 — Status moves end-to-end validated via bytecode
description: 4 audit bugs critiques fixés. Status moves (Growl/Leer/SleepPowder/etc) appliquent maintenant correctement stages + status1 via bytecode interpreter 1:1 décomp.
type: project
---

# Session 141 — Status moves end-to-end validated via bytecode

**Date** : 2026-05-16 (post-compact, /loop autonomous nuit)
**Commits** : 4 sur branche `upd2` (post 4093956f session 140)
**Branche** : `upd2`

## 🏆 Milestones session 141

### Iter 1 — Fix ESM live-binding pour memory-map writes
Commit `2be041a7` : memory-map.ts pour 12 accessors `gXxx` était `write: () => {}` no-op.
Wire via `__battleStateMutators` global pour propagation correcte. Battery test :
615/639 → **639/639 clean (100%)**.

### Iter 2 — Port `_CheckPartyHasHadPokerus` + wire dans `_MonGainEVs`
Commit `46110fa4` : MonGainEVs avait `multiplier = 1` (STUB Pokerus). Port local
1:1 décomp pokemon.c:6129 + wire `multiplier = CheckPartyHasHadPokerus([mon], 0) ? 2 : 1`.

### Iter 3 — 4 audit bugs CRITIQUES découverts via testMoveBridge
Commit `60fa8371` : status moves ne marchaient pas via bytecode. Investigation
end-to-end identifie 4 root causes :

#### Bug 1 : compiler resolveValue ne gérait pas expressions bitwise complexes
- `setstatchanger STAT_ATK, 1, TRUE` expand en `setbyte sSTATCHANGER, STAT_ATK | 1<<4 | TRUE<<7 = 145`
- Le compiler ne savait évaluer que `A+B` ou `A|B` (2 operands), pas `A | B<<C | D<<E`
- → expression résolue à 0 → setbyte écrivait 0 dans sSTATCHANGER → ChangeStatBuffs lisait 0 → no-op
- **Fix** : NEW mini precedence-climbing parser (`_tokenize` + `_parseExpr`) supporte
  tous les operators (`|, ^, &, +, -, <<, >>, ()`) avec correct precedence

#### Bug 2 : 15 battle_scripting symbols manquaient dans memory-map
- Whitelist `BATTLE_MEMORY_SYMBOLS` du compiler ne contenait pas sSTATCHANGER,
  cEFFECT_CHOOSER, sPAINSPLIT_HP, sBIDE_DMG, sB_ANIM_ARG1/2, sMOVEEND_STATE,
  sBATTLER_WITH_ABILITY, sPURSUIT_DOUBLES_ATTACKER, sRESHOW_*_STATE, sLVLUP_HP,
  sWINDOWS_TYPE, sMULTIPLAYER_ID, sSPECIAL_TRAINER_BATTLE_TYPE
- Sans whitelist : compiler n'encode pas l'address en `0xF0000000 | id` format
- Aussi cMISS_TYPE mapping FAUX (index 5 = conflit MULTISTRING_CHOOSER), décomp dit 6
- cEFFECT_CHOOSER manquait totalement (= MOVE_EFFECT_BYTE=3)
- cEFFECTIVENESS hallucination retirée (= pas dans décomp)
- **Fix** : ajout 29 symbols whitelist + 15 accessors memory-map + corrections indexes
- Symbols table auto-gen : 29 → 38 entries

#### Bug 3 : resolveAddress signed int32 bug
- JavaScript `&` op converts operands en signed int32
- `0xF0000007 & 0xF0000000` = `-268435456` (int32 négatif, high bit set)
- `-268435456 === 0xF0000000` (= positive Number `4026531840`) → **FALSE**
- → resolveAddress retournait null → tous les setbyte vers battle symbols étaient no-op
- **Fix** : `((addr & SYMBOL_MARKER) >>> 0) === SYMBOL_MARKER` force unsigned

#### Bug 4 : compiler scrape ne lisait pas `_EXPR` strings
- Auto-extractor émet `STAT_CHANGE_ALLOW_PTR_EXPR = "(1 << 0)"` comme **string**
- `scrapeConstants` matchait seulement `export const NAME = NUM`, pas strings
- → `STAT_CHANGE_ALLOW_PTR` résolu à 0 → statbuffchange flags = 0 (au lieu de 1)
- → ChangeStatBuffs return early (= ALLOW_PTR not set) sans appliquer le delta
- **Fix** : NEW regex `_EXPR` matcher + eval string si pur arithmétique/bitwise

#### Bonus : wire-bytecode-bridge `_resolveMoveEffectFromDexId` multi-word fix
- `tailwhip` → `MOVE_TAILWHIP` (missing underscore) → no move data → effect=0
- Now : Dex.moves fallback → `MOVE_TAIL_WHIP` ✓
- testMoveBridge enrichi avec param overrides (moveId/enemy/attackerSpecies/level)

## ✅ Validation runtime end-to-end

**12/12 status moves OK via testMoveBridge** :
- ✅ tackle : 14→0 dmg, OHKO Wurmple Lv5
- ✅ leer : DEF -1 (stage[2]=5)
- ✅ growl : ATK -1 (stage[1]=5)
- ✅ sandattack : ACC -1 (stage[6]=5)
- ✅ tailwhip : DEF -1 (stage[2]=5)
- ✅ string-shot : SPEED -1 (stage[3]=5)
- ✅ sleeppowder : status1=0x2 (STATUS1_SLEEP_TURN(2))
- ✅ thunderwave : status1=0x40 (STATUS1_PARALYSIS)
- ✅ poisonpowder : status1=0x8 (STATUS1_POISON)
- ✅ willowisp : status1=0x10 (STATUS1_BURN)
- ✅ sweetscent : EVASION -1 (stage[7]=5)
- ✅ scaryface : SPEED -2 (stage[3]=4)

**Battery test 639/639 scripts** : 100% clean post-fixes.

## 📂 Files changed

MODIFIED :
- `scripts/compile-decomp-bytecode.mjs` (+141 lignes) — bitwise expr parser +
  `_EXPR` scrape + 29 symbols whitelist.
- `src/engine/battle/memory-map.ts` (+90 lignes) — 15 nouveaux MEMORY_SYMBOLS +
  fix signed bug + corrections indexes.
- `src/engine/battle/state.ts` (+30 lignes) — `__battleStateMutators` étendu
  avec 8 getters/setters (Weather/TypeFlags/LastUsedItem/etc.).
- `src/engine/battle/wire-bytecode-bridge.ts` (+15 lignes) — multi-word fix.
- `src/engine/battle/battle-devtools.ts` (+40 lignes) — testMoveBridge enrichi.
- `src/engine/battle/cmd-niveau-34.ts` (+18 lignes) — _CheckPartyHasHadPokerus
  + wire dans _MonGainEVs.

AUTOGEN :
- 474 `*-bytecode.ts` files regenerated (= post compiler fixes).
- `_symbols-table.ts` : 29 → 38 symbols.

## 🎯 Status global

**Bytecode interpreter 1:1 décomp = OPERATIONAL** pour :
- ✅ Damage moves (Tackle/Ember/Thunderbolt/etc) avec damage variance correcte
- ✅ Stat down/up moves (Leer/Growl/SwordsDance/etc) avec stage modification
- ✅ Status moves (Sleep/Paralysis/Poison/Burn/Freeze) avec status1 application
- ✅ Multi-turn combats avec sync HP/PP/status1 correct
- ✅ 639/639 BattleScript_* scripts run sans bug runtime

**Bytecode pas encore activé par défaut** : flag `localStorage.__USE_BYTECODE_FOR_DAMAGE__`
disponible mais battle-flow.ts route encore via ad-hoc formula par default.

## 📋 Pour next session

1. **Combat réel via flag** : activer bytecode en combat tutorial (Birch → Route 101 → Zigzaton) et valider visual outcome 1:1 ROM.
2. **Phase 1.4 UI controllers** : wire 23 BtlController_Emit* aux vrais frame callbacks. Permet bytecode wire de fonctionner visuellement (text/anim/sprites).
3. **Audit STUBs résiduels** : ~110 STUBs catalogués, majoritairement UI controllers (Phase 1.4) + Battle Frontier (Palace/Arena/Tower, différé post-Phase 1).
4. **Performance** : si battery test devient lent, optimiser dispatch loop.

File complet ici. Lire en priorité post-compact.

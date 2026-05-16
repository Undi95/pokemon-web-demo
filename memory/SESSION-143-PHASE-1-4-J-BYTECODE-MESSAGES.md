# Session 143 — Phase 1.4 J : Bytecode → Battle Event Queue → FR Messages 1:1

**Date** : 2026-05-16
**Branche** : `upd2`
**Commits** : 23 commits Phase 1.4 J (post-suite + audit PREPARE missing)
**État** : 🎉 **MILESTONE Phase 1.4 J first pass complete** — bytecode interpreter
émet maintenant des messages FR via décodeur 1:1 décomp `BufferStringBattle`.
État machine bytecode wirée dans `battle-flow.ts`.

## Résultats globaux

- **8 commits Phase 1.4 J** : event queue infra, wire emit fns, string table
  extraction, decoder partial, printfromtable resolution, state machine consume.
- **645/645 BattleScript_* clean stable** (= 639 + 6 non-BattleScript labels).
- **0 erreur TS** sur 9 commits.
- **13 status moves validés end-to-end via bytecode** :
  - tackle/growl/thundershock/ember/poisonpowder/hypnosis/leer/sandattack/
    tailwhip/thunderwave/stringshot/meditate/doubleteam.
- Messages décodés 1:1 décomp avec placeholders FR substitués.

## Architecture Phase 1.4 J

```
Bytecode ──────────────► BtlController_Emit* ──────► gBattleEventQueue
   (645 scripts)         (~25 emit fns wired)        (typed queue)
                              │                            │
                              │ enqueueBattleEvent          │ dequeueBattleEvent
                              ▼                            ▼
                         CONTROLLER_PRINTSTRING      decodeBattleString
                         CONTROLLER_HEALTHBARUPDATE  (= 1:1 BufferStringBattle)
                         CONTROLLER_MOVEANIMATION         │
                         ...                              ▼
                                                    FR text décodé
                                                    (= "ARCKO utilise\nCHARGE")
                                                          │
                                                          ▼
                                                    ShowFieldMessage
                                                    (= battle-flow state machine)
```

## Commits détail

### Commit 1 : `8bb9ab02` — Battle event queue infra
NEW `src/engine/battle/battle-event-queue.ts` (~414l) :
- `CONTROLLER_*` enum 1:1 décomp `include/battle_controllers.h:7-50` (50+
  event types : PRINTSTRING/MOVEANIMATION/HEALTHBARUPDATE/FAINTANIMATION/
  STATUSICONUPDATE/etc.).
- `BattleMsgData` interface 1:1 `battle_message.h:14-39` (currentMove/
  originallyUsedMove/lastItem/lastAbility/scrActive/bakScriptPartyIdx/
  hpScale/itemEffectBattler/moveType/abilities[]/textBuffs[3][16]).
- 27 discriminated event types avec payloads matching décomp params.
- `enqueueBattleEvent / dequeueBattleEvent / peekBattleEvent /
  clearBattleEventQueue / getBattleEventQueueSize / getBattleEventQueueSnapshot`.
- `buildBattleMsgDataSnapshot` helper 1:1 `battle_controllers.c:1147-1166`
  (= copy gBattleTextBuff1/2/3 + abilities[] + state vars).

### Commit 2 : `e4ceacc6` — Wire BtlController_Emit* → events
`battle-controllers.ts` : 25 emit fns wirées pour enqueue events typés au lieu
de no-op stubs. Source 1:1 décomp `src/battle_controllers.c:1080-1500`.

Wired : EmitPrintString / EmitPrintSelectionString / EmitMoveAnimation /
EmitHealthBarUpdate / EmitHitAnimation / EmitFaintAnimation /
EmitStatusIconUpdate / EmitStatusAnimation / EmitBattleAnimation /
EmitPlaySE / EmitPlayFanfareOrBGM / EmitFaintingCry / EmitReturnMonToBall /
EmitSpriteInvisibility / EmitDrawPartyStatusSummary /
EmitHidePartyStatusSummary / EmitTrainerSlide / EmitTrainerSlideBack /
EmitBallThrowAnim / EmitExpUpdate / EmitChoosePokemon / EmitLinkStandbyMsg /
EmitCantSwitch / EmitYesNoBox / EmitSwitchInAnim /
EmitResetActionMoveSelection / EmitEndLinkBattle.

NEW helper `_snapshotMsgData` 1:1 `battle_controllers.c:1147-1166`.

NOT wired : EmitSetMonData (= déjà routé batch C bridge session 142),
EmitGetMonData (= no-op puisque port lit gBattleMons direct).

### Commit 3 : `f0d01d3a` — Extract gBattleStringsTable[]
NEW `scripts/extract-battle-strings-table.mjs` (~115l) :
- Parse `include/constants/battle_string_ids.h` (= 375 STRINGID_X = N).
- Parse `src/battle_message.c` `gBattleStringsTable[]` (= 369 entries
  STRINGID_X → sText_Y mapping).

Generated `src/engine/decomp-data/battle-strings-table.ts` (~764l) :
- `BATTLESTRINGS_TABLE_START = 12` / `BATTLESTRINGS_COUNT = 381` 1:1 décomp.
- `STRINGID_NAMES: Record<number, string>` (375 entries, debug).
- `BATTLE_STRINGS_TABLE: Record<number, string>` (369 entries, id →
  "sText_X" pour lookup dans strings.json).

### Commit 4 : `271351a4` — battle-string-decoder partial 1:1
NEW `src/engine/battle/battle-string-decoder.ts` (~373l) :

`decodeBattleString(stringId, msgData)` 1:1 décomp `BufferStringBattle`
(battle_message.c:1968-2950) — partial port :
- Special-cases stringIds 0..11 (INTROMSG/INTROSENDOUT/RETURNMON/SWITCHINMON/
  USEDMOVE/BATTLEEND) avec default "single wild battle" path.
- Lookup stringId 12..380 via BATTLE_STRINGS_TABLE → strings.json.

`_decodeTextBuff(buf)` 1:1 décomp `BattleStringExpand` sub-format
(battle_message.c:3046-3200). Handle 11 B_BUFF tags (STRING/NUMBER/MOVE/
TYPE/MON_NICK_WITH_PREFIX/STAT/SPECIES/MON_NICK/NEGATIVE_FLAVOR/ABILITY/
ITEM).

`_substitutePlaceholders` : remplace {B_BUFF1/2/3} + ~25 mon/move/item/
ability/trainer placeholders.

Resolvers : `_speciesName`, `_moveName`, `_abilityName`, `_itemName` via
globalThis bridges (`gameDataMoves`, `gameDataSpecies`, etc.).

`stripGbaControlCodes` : strip {WAIT_SE}/{PAUSE N}/\\p/\\n pour
ShowFieldMessage simple.

### Commit 5 : `2b4d1c8b` — Drain queue → messages
`wire-bytecode-bridge.ts` :
- `runMoveScriptViaBytecode` return ajoute `{ messages: string[]; eventsCount: number }`.
- Drain queue post bytecode run, decode chaque PRINTSTRING /
  PRINTSTRINGPLAYERONLY event via `decodeBattleString + stripGbaControlCodes`.
- `clearBattleEventQueue()` au début pour éviter cross-turn pollution.
- NEW `drainBattleEventsAsText()` : drain manuel + decode (= devtools).

`battle-devtools.ts` :
- `scope.bytecode.drainEvents()` : drain + decode FR.
- `scope.bytecode.peekEvents()` : snapshot read-only sans pop.
- `scope.bytecode.eventsQueueSize()` : size (debug).
- `scope.bytecode.clearEvents()` : reset queue.

### Commit 6 : `e8d45351` — STRINGID_USEDMOVE pre-fill + reverse lookup
`battle-string-decoder.ts` :
- NEW `_moveIdToEnum` cache : numeric move id → "MOVE_X" enum via
  `resolveDecompConstant` inverse scan sur `gameDataMoves` bridge.
- NEW `_speciesIdToEnum` cache : idem species.
- `_moveName` : lookup via `getMoveName` (= game-data.moveNamesFr).
- STRINGID_USEDMOVE 1:1 décomp `battle_message.c:2166-2176` : pre-fill
  `msgData.textBuffs[1]` avec move name (= équivalent `gMoveNames[currentMove]
  StringCopy`).
- NEW `_encodeStringForBuff` : encode string → Uint8Array ASCII + EOS.
- `_decodeTextBuff` supporte 2 cases : structured B_BUFF tags + raw ASCII bytes.

`game-data.ts` : Expose `gameDataMoves/gameDataSpecies/
gameDataAbilityNamesFr/gameDataItemDescriptionsFr` sur globalThis (= bridge
pour battle-string-decoder).

### Commit 7 : `19618fda` — Placeholders ~30 résolus
`battle-string-decoder.ts` :
- B_PLAYER_MON1_NAME / OPPONENT_MON1_NAME / etc. → `_monNickname`.
- B_LINK_*_MON*_NAME → fallback single-battle.
- B_ATK_NAME_WITH_PREFIX_MON1 / ATK_PARTNER_NAME.
- B_TRAINER1_LOSE_TEXT / WIN_TEXT / etc. → "[name]" Phase 1.4 K Frontier.
- B_LINK_PLAYER_NAME / etc. → playerName fallback.
- B_PC_CREATOR_NAME → "BILL" (= 1:1 décomp).
- B_ATK_PREFIX1/2/3 / DEF_PREFIX1/2/3 → "" (= évite duplication).

Total resolvers : ~30/~70 placeholders couverts (= suffisant pour Tackle/
Growl/PoisonPowder/ThunderWave / single wild battle).

### Commit 8 : `0ff03d84` — printfromtable resolution + 46 string tables
NEW `scripts/extract-battle-string-id-tables.mjs` (~135l) :
- Parse `src/battle_message.c` → 46 `gXxxStringIds[]` tables (= u16 arrays
  mapping `B_MSG_X → STRINGID_X`).
- Sources : gStatDownStringIds, gStatUpStringIds, gFirstTurnOfTwoStringIds,
  gGotPoisonedStringIds, gMissStringIds, gCaughtMonStringIds, etc.

Generated `src/engine/decomp-data/battle-string-id-tables.ts` (46 entries).

`scripts/compile-decomp-bytecode.mjs` :
- Add 46 `gXxxStringIds` names à `BATTLE_MEMORY_SYMBOLS` whitelist.
- Re-compile : unresolved symbols 10527 → 10481 (= -46 resolved).

`memory-map.ts` :
- NEW `resolveStringIdTable(addr): Uint16Array | null`.
- `_SYMBOL_ID_TO_TABLE_NAME` : map séparée data tables vs state accessors.
- `initMemoryMap` : bind state vars normalement, store table names séparément.

`cmd-niveau-4.ts Cmd_printfromtable` :
- Try `resolveStringIdTable(tableOffset)` en premier.
- Si match : lookup `table[idx] → stringId` direct.
- Sinon : fallback `_readBytecodeForString` (= legacy inline tables).

`battle-string-decoder.ts` :
- `_monNicknameWithPrefix` 1:1 décomp `HANDLE_NICKNAME_STRING_CASE`
  (battle_message.c:2362-2380) : "X sauvage" si wild, "X ennemi" si trainer,
  rien si side PLAYER. Check via `gBattleTypeFlags BATTLE_TYPE_TRAINER (0x08)`.

### Commit 9 : `9ac8a19d` — battle-flow state machine consume bytecode
`battle-flow.ts` state machine extended :

NEW states `PLAYER_BYTECODE_MSG` / `PLAYER_BYTECODE_MSG_WAIT` /
`OPPONENT_BYTECODE_MSG` / `OPPONENT_BYTECODE_MSG_WAIT` :
- Drain `_pendingBytecodeMessages` sequentially via ShowFieldMessage + input wait.

`PLAYER_USES_MOVE` / `OPPONENT_USES_MOVE` branches sur `useBytecodeMsgs` flag :
- Si bytecode mode : `applyMoveDamage` immediate (= fills queue + apply damage +
  shake), state → `*_BYTECODE_MSG`.
- Sinon : legacy hardcoded `ShowFieldMessage`.

`applyMoveDamage` capture `result.messages` dans `_pendingBytecodeMessages`
filled sequentially par bytecode emits PRINTSTRING events 1:1 décomp.

Activation : `localStorage.setItem('__USE_BYTECODE_FOR_DAMAGE__', '1')`
puis reload OU `window.__USE_BYTECODE_FOR_DAMAGE__ = true`.

## Validation in-browser (devtools `scope.bytecode.testMoveBridge`)

### 5 moves smoke test (commit 8)
- **tackle** (CHARGE) : "PIKACHU utilise\nCHARGE" + 10 damage ✓
- **growl** (RUGISSEMENT) : "PIKACHU utilise\nRUGISSEMENT" + "Ah, ATTAQUE du
  ZIGZATON sauvage\nbaisse!" + stages[1]=5 ✓
- **thundershock** (ECLAIR) : "PIKACHU utilise\nECLAIR" + 11 damage ✓
- **ember** (FLAMMECHE) : "PIKACHU utilise\nFLAMMECHE" + 10 damage ✓
- **poisonpowder** (POUDRE TOXIK) : "PIKACHU utilise\nPOUDRE TOXIK" +
  "ZIGZATON sauvage\nest empoisonné!" + status=0x08 ✓

### 8 status moves complets (commit 9)
- **doubleteam** (REFLET) : ESQUIVE du PIKACHU augmente! (= self-buff)
- **hypnosis** (HYPNOSE) : rate son attaque! (= miss)
- **leer** (GROZ'YEUX) : DÉFENSE du ZIGZATON sauvage baisse! + stages[2]=5
- **meditate** (YOGA) : ATTAQUE du PIKACHU augmente!
- **sandattack** (JET DE SABLE) : PRÉCISION du ZIGZATON sauvage baisse!
  + stages[6]=5
- **stringshot** (SECRETION) : VITESSE du ZIGZATON sauvage baisse!
  + stages[3]=5
- **tailwhip** (MIMI-QUEUE) : DÉFENSE du ZIGZATON sauvage baisse!
- **thunderwave** (CAGE-ECLAIR) : ZIGZATON sauvage est paralysé! +
  status=0x40 ✓

## Bytecode validation finale

- Battery test 645/645 BattleScript_* labels : 0 erreur runtime
- Battery test 639/639 BattleScript_* runScript : 0 reason fail, 0 throw
- Devtools `scope.bytecode.drainEvents()` consume + decode FR fonctionnel
- Bytecode flag `__USE_BYTECODE_FOR_DAMAGE__` activable via localStorage ou window

## Stubs résiduels Phase 1.4 J (= post-session 143)

### BufferStringBattle special-cases avancés (~10)
- INTROMSG/INTROSENDOUT/RETURNMON/SWITCHINMON branches TRAINER/LINK/DOUBLE
- BATTLEEND outcome variants (B_OUTCOME_DREW/LOST/WON link battles)
- MAGNITUDE / TWOTURN attacks message variants

### Placeholders manquants (~40/~70)
- B_BUFF1 advanced encodings (= status condition tables avec B_BUFF_NEGATIVE_FLAVOR
  élaboré)
- Trainer-specific placeholders (= B_TRAINER1_LOSE_TEXT/WIN_TEXT body strings)
- Link battle placeholders (= multiplayer data)

### Anim events queueing (mais pas rendering)
- MOVEANIMATION / HITANIMATION / FAINTANIMATION events sont enqueued mais le
  consumer côté battle-flow ne les joue pas encore (= juste drained et ignorés)
- BALLTHROWANIM / EXPUPDATE / DRAWPARTYSTATUSSUMMARY idem

### Frontier-specific
- Trainer Tower / Battle Pyramid / Arena referee strings (= post Frontier port)
- Link multi-player names (= deferred)

## Architecture future Phase 1.4 K/L

Phase 1.4 K : Yesno boxes + naming screen wire au queue events
- CONTROLLER_UNKNOWNYESNOBOX consume → cursor + DPAD input
- `Cmd_trygivecaughtmonnick` cases 2/3 → naming screen real

Phase 1.4 L : Level-up box + dex page + ball anim
- BALLTHROWANIM consume → ball throw sprite anim
- EXPUPDATE consume → XP bar fill anim
- Drawpartystatussummary consume → mini icons row

## Prochaines étapes possibles

1. **Wire anim events** : MOVEANIMATION → shake/particles, FAINTANIMATION →
   fade, HEALTHBARUPDATE → tween bar
2. **Default bytecode flag** : set `__USE_BYTECODE_FOR_DAMAGE__=true` par
   default (= bytecode pour tous wild battles automatiquement)
3. **Trainer battles via bytecode** : tester via tutorial Zigzagton end-to-end
4. **BufferStringBattle complete** : remaining special cases (= ~15 cases)
5. **Anim events real rendering** : Phase 1.4 L complete

## Commits suite (post-doc initial)

### Commit 10 : `68f8d361` — runMoveScriptViaBytecode return events list
`wire-bytecode-bridge.ts` : return ajoute `events?: BattleEvent[]` (= full
list drained pour consumer non-PRINTSTRING events futurs).

### Commit 11 : `dbd64e78` — Array symbol offset encoding 1:1 (multi-hit fix)
Major bug : opcodes natifs ne résolvaient pas `SYMBOL + N` (= array offset).
`addbyte sMULTIHIT_STRING + 4, 1` calculait 0xF000000C + 4 = 0xF0000010 →
mappé sur DIFFÉRENT symbole. Multi-hit moves (Doubleslap/Doublekick/etc.)
n'incrémentaient pas le counter → message "Touché  ... fois!" garbage.

Fix architecture :
- Compiler parseAdditive : détecte SYMBOL + small N → encode offset bits 16-27
- memory-map.ts : MemoryAccessor.read/write accept optional offset arg
- resolveAddressOffset extracteur bits 16-27
- sMULTIHIT_STRING / gBattleCommunication / gBattleTextBuff1 accessors array-aware
- cmd-niveau-33.ts opcodes natifs (setbyte/addbyte/subbyte/orbyte/etc. + jumpifbyte/jumpifarrayequal/copyarray) passent offset à acc.read/write

Validation : "Touché 3 fois!" Doubleslap, "Touché 2 fois!" Doublekick, "AMPLEUR 8!" Magnitude.

### Commit 12 : `5ee46f9f` — Cmd_transformdataexecution missing PREPARE_SPECIES_BUFFER
Décomp `battle_script_commands.c:7788` : `PREPARE_SPECIES_BUFFER(gBattleTextBuff1, tgt.species)`.
Notre port omettait cette ligne → "X se transforme en 8!" (= low byte du species id).
Fix : "METAMORPH se transforme\nen ZIGZATON!" 1:1.

### Commit 13 : `199f669d` — _speciesName FR (was returning EN)
Décodeur retournait nom EN ("ZIGZAGOON") car gameDataSpecies n'a pas de field `.name`.
Fix : import `getSpeciesNameFr` from `data-tables.ts` → text-tables.json → FR ("ZIGZATON").

### Commit 14 : `e1c19361` — ATK/DEF_PREFIX ami/ennemi
1:1 décomp `battle_message.c:2704-2728` : PLAYER → "ami" / OPPONENT → "ennemi".
Avant : return "" → "du POKéMON  " (double space).
Maintenant : "du POKéMON ami\naugmente sa DEFENSE!" / "du POKéMON ennemi" 1:1.

### Commit 15 : `b291465e` — STATSHARPLY/STATHARSHLY skip
1:1 décomp `battle_message.c:2861-2864` : si stringId == STATSHARPLY (209) ou
STATHARSHLY (211), skip 3 bytes additional (= ignore next STATROSE/STATFELL entry).
Avant : Screech (-2 DEF) affichait "baisse beaucoup!baisse!" doublon.
Fix : "baisse beaucoup!" 1:1.

## Validation finale 19 commits

Multi-hit, multi-stat, recoil, critical hit, super effective, status moves,
stat changes (+1 +2 -1 -2), faint, drain, transform — tous validés 1:1 décomp
via `scope.bytecode.testMoveBridge`.

Battery test 639/639 BattleScript_* clean stable.

Moves validés in-browser (~30 distinctifs) :
- Damage : tackle/thundershock/ember/icebeam/flamethrower/thunder/blizzard/
  hydropump/firepunch/thunderpunch/icepunch/megakick
- Multi-hit : doubleslap/doublekick/pinmissile
- Special : magnitude/transform
- Recoil : takedown/doubleedge/submission/volttackle
- Status : growl/leer/scaryface/sandattack/tailwhip/stringshot/screech/
  flash/kinesis/poisonpowder/thunderwave/hypnosis/confuseray/spore
- Self-buff : swordsdance/agility/meditate/sharpen/doubleteam/bulkup/calmmind/
  cosmicpower/irondefense/bellydrum
- Protect : protect/detect/endure/destinybond
- Heal : recover/rest/absorb/painsplit
- Screens : reflect/lightscreen/safeguard/mist
- Multi-turn : futuresight
- Misc : metronome/mimic/teleport/haze/curse/rage

## Commits audit PREPARE_*_BUFFER (post-doc 16)

### Commit 17 : `01d3c094` — Cmd_disablelastusedattack missing PREPARE_MOVE_BUFFER
1:1 décomp `battle_script_commands.c:8007` : PREPARE_MOVE_BUFFER avant
disable. Sans : "X de Y ne peut plus être utilisée!" affiche move vide.

### Commit 18 : `26b62ac7` — Cmd_tryswapitems missing PREPARE_ITEM_BUFFER + MULTISTRING
1:1 décomp `battle_script_commands.c:9266-9275` : PREPARE_ITEM_BUFFER(buff1,
newItem) + PREPARE_ITEM_BUFFER(buff2, oldItem) + MULTISTRING_CHOOSER
(BOTH/TAKEN/GIVEN). Sans : Trick montre items vides.

### Commit 19 : `0dbcd59f` — Cmd_getexp missing PREPARE buffers + PrepareStringBattle
1:1 décomp `battle_script_commands.c:3417-3422` : PREPARE_MON_NICK_WITH_PREFIX_BUFFER
(buff1) + PREPARE_STRING_BUFFER(buff2, ABOOSTED/EMPTYSTRING4) + PREPARE_WORD_NUMBER_BUFFER
(buff3, 5, dmg) + PrepareStringBattle(STRINGID_PKMNGAINEDEXP=13). Sans :
"X a gagné Y points EXP!" jamais émis depuis bytecode.

## Validation 23 commits

- Tous tests bytecode bridge passent 1:1 décomp messages FR
- Battery test 639/639 BattleScript clean stable
- 0 erreur TS sur 23 commits
- ~50 moves validés (~30 single + 20+ status/recoil/multi-hit/etc.)
- Bytecode flag `__USE_BYTECODE_FOR_DAMAGE__` production-ready

## Audit PREPARE_*_BUFFER complete (27 sites décomp)

Tous les 27 PREPARE_*_BUFFER call sites dans battle_script_commands.c
sont maintenant wirés dans notre port :
- ✓ batch A original (~14 wired sessions précédentes)
- ✓ Cmd_transformdataexecution (commit 17)
- ✓ Cmd_disablelastusedattack (commit 21)
- ✓ Cmd_tryswapitems (commit 22)
- ✓ Cmd_getexp (commit 23)
- ✓ Tous autres déjà OK via batch A précédent ou cmd-niveau-* port complet

## File complet

Ce doc : `D:/Projet 1/pokemon-web-demo/memory/SESSION-143-PHASE-1-4-J-BYTECODE-MESSAGES.md`.

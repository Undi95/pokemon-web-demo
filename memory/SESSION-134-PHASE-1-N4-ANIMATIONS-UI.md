# Session 134 — Phase 1 Niveau 4 (animations + UI) (2026-05-15)

## Résumé

**6/6 opcodes Niveau 4 implémentés + audités 1:1 décomp. 0 bugs trouvés à
l'audit.** Module battle-controllers minimal créé pour stubs UI/anim/SE/input.
Interpreter loop maintenant tick controllers entre handler calls (= MVP).

## Modules touchés/créés

| Fichier | Action | Lignes |
|---------|--------|--------|
| `src/engine/battle/battle-controllers.ts` | NEW — gBitTable, MarkBattler, BtlController_Emit*, PrepareStringBattle, BattleScriptPush/Pop, HandleBattleWindow, PlaySE, JOY_NEW stubs + button constants | ~180 |
| `src/engine/battle/cmd-niveau-4.ts` | NEW — 6 opcodes 1:1 | ~240 |
| `src/engine/battle/state.ts` | + gBattleMovePower, gBattleControllerExecFlags, gPauseCounterBattle, DisableStruct + gDisableStructs[4] ; BattleScripting interface aligned 1:1 décomp (animTurn/animTargetsHit/getexpState/battleStyle/etc.) | + ~120 |
| `src/engine/battle/constants.ts` | + MOVE_TRANSFORM (144), MOVE_SUBSTITUTE (164), MOVE_TARGET_*, CURSOR_POSITION (1), B_WIN_MSG/YESNO, WINDOW_CLEAR/BG1, YESNOBOX_X/Y bounds, B_COMM_TO_CONTROLLER | + ~30 |
| `src/engine/battle/script-interpreter.ts` | + install N4 handlers (lazy import) ; runBattleScript loop tick controllers entre opcodes ; remove dead BattleScriptingState interface | ~10 |

## Niveau 4 (6/6 opcodes — animations + UI)

| Opcode | Args | Status | Détail |
|--------|------|--------|--------|
| 0x09 attackanimation | 0 bytes | full 1:1 | early-return on exec flags + HITMARKER_NO_ANIMATIONS path (push+Pausex20) + MOVE_TARGET_BOTH skip + MOVE_RESULT_NO_EFFECT path + emit anim + MarkBattler |
| 0x0A waitanimation | 0 bytes | full 1:1 | trivial wait on gBattleControllerExecFlags |
| 0x10 printstring | 2 bytes (u16) | full 1:1 | PrepareStringBattle + MSG_DISPLAY=1 |
| 0x12 waitmessage | 2 bytes (u16) | full 1:1 | gPauseCounterBattle++ until toWait |
| 0x13 printfromtable | 4 bytes (u32) | full 1:1 | lookup u16 at table+idx*2 + PrepareStringBattle |
| 0x67 yesnobox | 0 bytes | partial | state machine 0→1 + MVP auto-YES fallback (TODO real input) |

## Stubs créés (battle-controllers.ts)

### MVP (= no-op, advance script) :
- `BtlController_EmitMoveAnimation` — anim render (TODO emit cmd au framework UI)
- `BtlController_EmitPrintString` — text render
- `HandleBattleWindow` — draw/clear window rect
- `BattlePutTextOnWindow` — print text in window
- `BattleCreateYesNoCursorAt/Destroy...` — cursor sprite
- `PlaySE` — audio engine wire
- `JOY_NEW` — input read (returns false MVP)
- `Cmd_yesnobox` case 1 MVP fallback — auto-confirm YES

### 1:1 décomp (= real logic) :
- `MarkBattlerForControllerExec(battler)` — set bit
- `clearBattlerExecFlag(battler)` — clear bit (= future controllers callback)
- `tickBattleControllers()` — clear ALL flags (= MVP backing infrastructure)
- `PrepareStringBattle(stringId, battler)` — setActiveBattler + emit + mark
- `BattleScriptPush(ctx, ptr)`, `BattleScriptPop(ctx)` — script call stack
- `gBitTable[i]` — `1 << i` for `i in 0..31`

## Convention scriptPtr (= note clé pour les opcodes N4+)

Le dispatcher fait `ctx.scriptPtr++` AVANT d'appeler le handler. Donc à
l'entrée du handler :
- `ctx.scriptPtr` pointe POST-opcode (= au premier byte arg ou au prochain
  opcode si pas d'args).

Pour "rester" sur l'opcode courant (= wait state, re-execute next frame),
le handler doit faire `_stayOnOpcode(ctx)` (= `ctx.scriptPtr--` puis
`return true`). Next dispatch re-entre ici.

Pour avancer normalement, le handler consomme ses args via readByte/Halfword/
Word (qui avancent scriptPtr), puis `return false`.

Pour jumper (= goto, BattleScript_X), le handler set `ctx.scriptPtr = jumpPtr`
puis `return false`.

## Tick controllers dans la loop

```typescript
const paused = handler(ctx);
tickBattleControllers();  // clear exec flags MVP
if (paused) return true;
```

Effet MVP : `MarkBattlerForControllerExec` set bit pendant un opcode, mais
le tick le clear AVANT la prochaine itération. Donc `waitanimation` /
`waitmessage` proceedent immédiatement.

Wire futur (= UI réel) : remplacer `tickBattleControllers` par un real-time
poll des controllers async. Chaque controller termine son state machine
et clear son bit individuellement.

## Constants ajoutées (battle/constants.ts)

```
MOVE_TARGET_SELECTED         = 0
MOVE_TARGET_DEPENDS          = 1 << 0
MOVE_TARGET_USER_OR_SELECTED = 1 << 1
MOVE_TARGET_RANDOM           = 1 << 2
MOVE_TARGET_BOTH             = 1 << 3
MOVE_TARGET_USER             = 1 << 4
MOVE_TARGET_FOES_AND_ALLY    = 1 << 5
MOVE_TARGET_OPPONENTS_FIELD  = 1 << 6
MOVE_TRANSFORM  = 144
MOVE_SUBSTITUTE = 164
CURSOR_POSITION  = 1
B_WIN_MSG   = 0
B_WIN_YESNO = 12
WINDOW_CLEAR = 1 << 0
WINDOW_BG1   = 1 << 7
YESNOBOX_X_START=23 YESNOBOX_Y_START=8 YESNOBOX_X_END=29 YESNOBOX_Y_END=13
B_COMM_TO_CONTROLLER = 0
```

## BattleScripting struct (state.ts) — 1:1 décomp

Renommé/aligné full 1:1 avec `include/battle.h:489-518` :
- Avant (session 133) : `atk49_state`, `battlerSavedHealth`, `field_23`,
  `multiplayerId_2`, `specialTrainerBattleType_2`, `saveBattler`,
  `bcDxAnimationsKickedIn` (= noms inventés / fields manquants)
- Après (session 134) : 27 fields exact ordre décomp avec types, incluant
  `animTurn`, `animTargetsHit`, `getexpState`, `battleStyle`,
  `drawlvlupboxState`, `learnMoveState`, `pursuitDoublesAttacker`,
  `reshowMainState`, `reshowHelperState`, `levelUpHP`.
- Dead `BattleScriptingState` interface retirée de `script-interpreter.ts`.

## Audit N4 → 0 bugs

- Args sizes vérifiés vs `asm/macros/battle_script.inc:40-87,595` :
  - attackanimation/waitanimation/yesnobox = 1 byte (no args)
  - printstring/waitmessage = 3 bytes (opcode + u16)
  - printfromtable = 5 bytes (opcode + u32)
- Logique de chaque path vérifiée ligne par ligne vs bodies JSON décomp
- Constants vérifiées contre décomp :
  - HITMARKER_NO_ANIMATIONS = 1<<7 ✓ (constants/battle.h:184)
  - MOVE_TRANSFORM=144, MOVE_SUBSTITUTE=164 ✓ (constants/moves.h:148,168)
  - MOVE_TARGET_* ✓ (battle.h:46-53)
  - MSG_DISPLAY=7, MULTISTRING_CHOOSER=5, CURSOR_POSITION=1 ✓
    (battle_script_commands.h:288-300)
  - YESNOBOX_X_Y = 23,8,29,13 ✓ (battle_script_commands.h:11)
  - WINDOW_CLEAR=1<<0, WINDOW_BG1=1<<7 ✓ (battle_script_commands.h:7-8)
  - B_WIN_MSG=0, B_WIN_YESNO=12 ✓ (constants/battle.h:345,357)
  - Buttons A=1, B=2, DPAD_UP=64, DPAD_DOWN=128 ✓ (gba/io_reg.h:699-708)
  - SE_SELECT=5 ✓ (constants/songs.h:11)

## Compile status

`tsc --noEmit` : **0 erreur sur tous les modules `src/engine/battle/*`**.
117 erreurs pré-existantes en `src/engine/decomp-data/auto/*` (inchangées
depuis sessions précédentes).

## État de l'interpreter

**27/249 → 33/249 opcodes** Phase 1 :
- Niveau 1 (11/11) — damage flow basic ✓
- Niveau 2 (8/8) — stat changes ✓
- Niveau 3 (8/8) — branching ✓
- **Niveau 4 (6/6) — animations + UI** ✓ NOUVEAU

Le bytecode interpreter n'est toujours pas wired au gameplay actif
(`battle-flow.ts` utilise toujours le hardcoded path visuel). Le wire viendra
une fois Niveau 5+ done (SetMoveEffect helper + sStatusFlagsForMoveEffects
full table + battle_message strings).

## Pour reprendre next session — Niveau 5

**Priorité Niveau 5 (résultat de move + cleanup)** :
- 0x02 attackstring — pretty-print du move name (= "Mon X used Y")
- 0x0D critmessage — "A critical hit!"
- 0x0E effectivenesssound — SE pour super effective / not very effective
- 0x0F resultmessage — affiche damage/miss/etc.
- 0x1A dofaintanimation — fait tomber le sprite battant
- 0x1B cleareffectsonfaint — clear status1/2/3 du fainted

**Helpers à porter pour Niveau 5** :
- SetMoveEffect (~500 lignes) — déjà identifié comme blocker
- Cmd_seteffectprimary/secondary réels (= passe par SetMoveEffect)
- battle_message.json strings ID lookup table (~700 entries)
- BattleStringExpandPlaceholders (placeholder resolver)
- gText_BattleYesNoChoice string (utilisé par yesnobox)

## Limitations connues (post Niveau 4)

Stubs MVP documentés :
1. BtlController_Emit* = no-op (anim/text/cursor pas rendus)
2. JOY_NEW = false (input pas wired)
3. PlaySE = no-op (audio engine pas wired)
4. tickBattleControllers = clear all (= simule controllers instant done)
5. Cmd_yesnobox MVP auto-YES (= bypasses real input poll)

Plus les limitations N1-N3 héritées (cf SESSION-133-FINAL).

## Commits cette session

À venir : `BATTLE Niveau 4 — 6 opcodes (anim/wait/print/message/yesnobox)
+ battle-controllers stubs + state expand + BattleScripting struct align 1:1`

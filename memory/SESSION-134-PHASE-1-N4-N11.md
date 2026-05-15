# Session 134 — Phase 1 Niveaux 4-11 (52 opcodes 1:1 décomp) (2026-05-15)

## Résumé

**52 opcodes implémentés ce session = passage de 27/249 (post-N3) à 85/249
(~34%) Phase 1**. 0 bugs trouvés à l'audit (sauf 3 bugs de constants HITMARKER
hérités sessions précédentes, corrigés en commit N7). 11 commits.

## Commits cette session

| Commit | Description |
|--------|-------------|
| `c167b557` | N4 — 6 opcodes anim/UI + battle-controllers stubs |
| `2f4dd742` | N5 — 6 opcodes result/messages/faint + util.ts |
| `53aad4f5` | N6 — 6 opcodes UI/audio misc |
| `05a6bd2c` | N7 — 8 opcodes mutation/flow + AUDIT FIX HITMARKER |
| `cb82240c` | N8 — 5 opcodes utility/dynamic |
| `e21602d2` | N9 — 10 opcodes status-set |
| `4deb9b49` | N10 — 10 opcodes weather/side/charge + state expand |
| `f58ed823` | N11 — 7 opcodes damage manip + substitute |

## Modules créés

```
src/engine/battle/
├── battle-controllers.ts    NEW  ~190 lignes (stubs MVP UI/anim/SE/input)
├── cmd-niveau-4.ts          NEW  ~240 lignes (6 opcodes anim+UI)
├── cmd-niveau-5.ts          NEW  ~320 lignes (6 opcodes result+faint)
├── cmd-niveau-6.ts          NEW  ~180 lignes (6 opcodes UI/audio misc)
├── cmd-niveau-7.ts          NEW  ~190 lignes (8 opcodes mutation/flow)
├── cmd-niveau-8.ts          NEW  ~130 lignes (5 opcodes utility/dynamic)
├── cmd-niveau-9.ts          NEW  ~190 lignes (10 opcodes status-set)
├── cmd-niveau-10.ts         NEW  ~250 lignes (10 opcodes weather/side)
├── cmd-niveau-11.ts         NEW  ~170 lignes (7 opcodes damage manip)
└── util.ts                  NEW  ~120 lignes (helpers : getBattlerForBattleScript
                                  full 1:1, GetBattlerAtPosition, FaintClearSetData)
```

## Niveau 4 (6/6) — animations + UI

| Opcode | Détail |
|--------|--------|
| 0x09 attackanimation | full 1:1 : exec flags wait + NO_ANIMATIONS path + MOVE_TARGET_BOTH/etc. skip + multihit + emit |
| 0x0A waitanimation | 1:1 trivial |
| 0x10 printstring | 1:1 (u16 stringId) |
| 0x12 waitmessage | 1:1 (gPauseCounterBattle ++) |
| 0x13 printfromtable | 1:1 (u32 ptr + idx*2 u16 lookup) |
| 0x67 yesnobox | state machine 0→1 + MVP auto-confirm YES (TODO real input) |

## Niveau 5 (6/6) — result/messages/faint

| Opcode | Détail |
|--------|--------|
| 0x02 attackstring | 1:1 guard HITMARKER_NO_ATTACKSTRING + ATTACKSTRING_PRINTED |
| 0x0D critmessage | 1:1 si gCritMultiplier==2 && !NO_EFFECT |
| 0x0E effectivenesssound | 1:1 switch SE selon MOVE_RESULT_* |
| 0x0F resultmessage | 1:1 full : gMissStringIds + 7 switch cases + 4 fallback BattleScriptPush jumps |
| 0x1A dofaintanimation | 1:1 (1-byte battler arg + emit + Mark) |
| 0x1B cleareffectsonfaint | 1:1 partial (status1=0 + Emit SetMonData + FaintClearSetData) |

## Niveau 6 (6/6) — UI/audio misc

| Opcode | Détail |
|--------|--------|
| 0x11 printselectionstring | 1:1 (u16 stringId, pas de exec guard) |
| 0x14 printselectionstringfromtable | 1:1 (u32 + idx*2) |
| 0x54 playse | 1:1 (u16 songId) |
| 0x55 fanfare | 1:1 (u16 songId via EmitPlayFanfareOrBGM FALSE) |
| 0x56 playfaintcry | 1:1 (battler arg) |
| 0x5C hitanimation | 1:1 (MOVE_RESULT_NO_EFFECT skip + IGNORE_SUBSTITUTE/STATUS2_SUBSTITUTE/substituteHP logic) |

## Niveau 7 (8/8) — mutation + flow control

| Opcode | Détail |
|--------|--------|
| 0x26 setmultihit | 1:1 (u8 count) |
| 0x27 decrementmultihit | 1:1 (u32 jumpPtr, advance si reached 0) |
| 0x44 endselectionscript | 1:1 (selectionScriptFinished[attacker]=true) |
| 0x4B returnatktoball | 1:1 (HITMARKER_FAINTED check + Emit) |
| 0x5F swapattackerwithtarget | 1:1 (toggle HITMARKER_SWAP_ATTACKER_TARGET) |
| 0x60 incrementgamestat | 1:1 (player side only, stub increment) |
| 0x68 cancelallactions | 1:1 (gActionsByTurnOrder[i]=B_ACTION_CANCEL_PARTNER) |
| 0x80 manipulatedamage | 1:1 (DMG_CHANGE_SIGN/RECOIL_FROM_MISS/DOUBLED) |

## Niveau 8 (5/5) — utility + dynamic

| Opcode | Détail |
|--------|--------|
| 0x42 jumpiftype2 | 1:1 (u8 battler + u8 type + u32 ptr) |
| 0x6F makevisible | 1:1 (Emit SpriteInvisibility false) |
| 0x82 jumpifnotfirstturn | 1:1 (gDisableStructs.isFirstTurn check) |
| 0xC1 hiddenpowercalc | 1:1 (calc gDynamicBasePower + gDynamicMoveType from IVs) |
| 0xE3 jumpifhasnohp | 1:1 (u8 battler + u32 ptr, hp==0 check) |

## Niveau 9 (10/10) — status-set

| Opcode | Détail |
|--------|--------|
| 0x7F setseeded | 1:1 (NO_EFFECT/LEECHSEED guard + GRASS type guard) |
| 0x9A setfocusenergy | 1:1 (fail si déjà FOCUS_ENERGY) |
| 0xA7 setalwayshitflag | 1:1 (set ALWAYS_HITS_TURN(2) + battlerWithSureHit) |
| 0xAA setdestinybond | 1:1 trivial |
| 0xAF cursetarget | 1:1 (5 bytes fail jump si CURSED) |
| 0xB1 setforesight | 1:1 trivial |
| 0xBF setdefensecurlbit | 1:1 trivial |
| 0xC7 setminimize | 1:1 (HITMARKER_OBEYS guard) |
| 0xCD cureifburnedparalyzedorpoisoned | 1:1 (5 bytes, status1=0 + Emit) |
| 0xCE settorment | 1:1 (5 bytes fail jump) |

## Niveau 10 (10/10) — weather + side status + charge

| Opcode | Détail |
|--------|--------|
| 0x70 recordlastability | 1:1 (RecordAbilityBattle stub) |
| 0x7D setrain | 1:1 (B_WEATHER_RAIN_TEMPORARY + 5 turns) |
| 0x7E setreflect | 1:1 (SIDE_STATUS_REFLECT + single/double variant) |
| 0x92 setlightscreen | 1:1 (SIDE_STATUS_LIGHTSCREEN + single/double variant) |
| 0x95 setsandstorm | 1:1 (B_WEATHER_SANDSTORM_TEMPORARY) |
| 0x99 setmist | 1:1 (mistTimer guard) |
| 0xB8 setsafeguard | 1:1 (SIDE_STATUS_SAFEGUARD) |
| 0xBB setsunny | 1:1 (B_WEATHER_SUN_TEMPORARY) |
| 0xC8 sethail | 1:1 (B_WEATHER_HAIL_TEMPORARY) |
| 0xCB setcharge | 1:1 (STATUS3_CHARGED_UP + chargeTimer=2) |

## Niveau 11 (7/7) — damage manip + substitute

| Opcode | Détail |
|--------|--------|
| 0x88 negativedamage | 1:1 (gBattleMoveDamage = -(gHpDealt/2), min -1) |
| 0x8D setmultihitcounter | 1:1 (set arg ou random 2-5) |
| 0x8E initmultihitstring | partial (reset buffer, TODO porter PREPARE_BYTE_NUMBER_BUFFER) |
| 0x9C setsubstitute | 1:1 (maxHP/4 check, set STATUS2_SUBSTITUTE + clear WRAPPED) |
| 0xAB trysetdestinybondtohappen | stub (TODO porter helper battle_util.c) |
| 0xD7 setyawn | 1:1 (5 bytes fail jump si yawn ou status1) |
| 0xD8 setdamagetohealthdifference | 1:1 (5 bytes, damage = diff) |

## State expand (state.ts)

Sessions précédentes (N1-N3) avaient déjà : gBattleMons[4], gBattlerAttacker/
Target/Active/Effect/Fainted, gCurrentMove, gMoveResultFlags, gHitMarker,
gCritMultiplier, gSideStatuses[2], gStatuses3[4], gLastMoves[4], gBattleCommunication[16],
gBattleScripting, gMultiHitCounter, gBattleMoveDamage, etc.

Session 134 ajouts :
- `gBattleMovePower` (= u16 power dynamique du move courant)
- `gBattleControllerExecFlags` (= u32 bitmask des battlers en cours d'anim)
- `gPauseCounterBattle` (= u32 frame counter pour waitmessage)
- `gDynamicMoveType` (= u8 type Hidden Power / Weather Ball avec F_DYNAMIC_TYPE_*)
- `gDisableStructs[4]` (= struct DisableStruct 1:1 décomp battle.h:438-468)
- `gSideTimers[2]` (= struct SideTimer 1:1 décomp battle.h:418-432)
- `gWishFutureKnock` (= struct WishFutureKnock 1:1 décomp battle.h:401-413)
- `gActionsByTurnOrder[4]` (= action queue per turn, N7)
- `_selectionScriptFinished[4]` (TODO porter dans gBattleStruct, N7)
- `BattleScripting` interface RÉ-ALIGNÉE 1:1 décomp (27 fields exact ordre :
  animTurn, animTargetsHit, getexpState, battleStyle, drawlvlupboxState,
  learnMoveState, pursuitDoublesAttacker, reshowMainState, reshowHelperState,
  levelUpHP au lieu des field_23/multiplayerId_2/etc. inventés)

## Constants ajoutées (constants.ts)

- BATTLE_TYPE_DOUBLE, MOVE_TARGET_*, MOVE_TRANSFORM/SUBSTITUTE/STRUGGLE
- CURSOR_POSITION, B_WIN_MSG/YESNO, WINDOW_CLEAR/BG1, YESNOBOX_X_START/Y_*/X_END/Y_END
- B_COMM_TO_CONTROLLER
- STRINGID_USEDMOVE/ATTACKMISSED/PKMNPROTECTEDITSELF/etc. (13 string IDs)
- SE_NOT_EFFECTIVE/EFFECTIVE/SUPER_EFFECTIVE + SE_SELECT
- REQUEST_STATUS_BATTLE=40
- DMG_CHANGE_SIGN/RECOIL_FROM_MISS/DOUBLED
- B_ACTION_CANCEL_PARTNER=12
- F_DYNAMIC_TYPE_IGNORE_PHYSICALITY/SET
- STATUS3_ALWAYS_HITS_TURN(num) helper, IS_BATTLER_OF_TYPE helper
- STATUS2_BIDE_TURN(num), STATUS3_YAWN_TURN(num) helpers
- STATUS1_ANY composite
- B_WEATHER_HAIL_TEMPORARY (+ alias B_WEATHER_HAIL)
- B_MSG_STARTED_RAIN/SANDSTORM/SUNLIGHT/HAIL/WEATHER_FAILED
- B_MSG_SIDE_STATUS_FAILED/SET_REFLECT_*/SET_LIGHTSCREEN_*/SET_SAFEGUARD
- B_MSG_SET_MIST/MIST_FAILED
- B_MSG_GETTING_PUMPED/FOCUS_ENERGY_FAILED
- B_MSG_LEECH_SEED_SET/MISS/FAIL/DRAIN/OOZE
- B_MSG_SET_SUBSTITUTE/SUBSTITUTE_FAILED
- HITMARKER_FAINTED2(battler) helper
- A_BUTTON/B_BUTTON/SELECT/START/DPAD_*/R/L_BUTTON 1:1 gba/io_reg.h:699-708
- B_POSITION_PLAYER_LEFT/OPPONENT_LEFT/PLAYER_RIGHT/OPPONENT_RIGHT (util.ts)

## AUDIT BUG FIX — HITMARKER constants (commit `05a6bd2c`)

3 bugs trouvés en auditant Cmd_swapattackerwithtarget vs décomp :

| Avant (faux)                          | Après (1:1 décomp battle.h:181-205)   |
|---------------------------------------|---------------------------------------|
| HITMARKER_x10            = 1<<4       | HITMARKER_WAKE_UP_CLEAR    = 1<<4     |
| HITMARKER_PURSUIT_TRAP   = 1<<12      | HITMARKER_SWAP_ATTACKER_TARGET = 1<<12|
| HITMARKER_IGNORE_SAFEGUARD = 1<<13    | HITMARKER_STATUS_ABILITY_EFFECT=1<<13 |
| HITMARKER_SYNCHRONISE_EFFECT = 1<<14  | HITMARKER_SYNCHRONIZE_EFFECT = 1<<14  |
|                                        |   (orth. Z décomp pas S)              |
| HITMARKER_WAKE_UP_CLEAR  = 1<<21      | HITMARKER_DISOBEDIENT_MOVE = 1<<21    |
| HITMARKER_x4000000       = 1<<26      | HITMARKER_NEVER_SET        = 1<<26    |
| HITMARKER_FAINTED2       = 1<<28      | HITMARKER_FAINTED2(b) function       |

Aucun code ne référençait les noms supprimés (PURSUIT_TRAP, IGNORE_SAFEGUARD,
x10, x4000000). Seul `HITMARKER_WAKE_UP_CLEAR` apparaissait au mauvais bit
mais aussi pas utilisé directement.

## Convention scriptPtr (rappel session 134)

Le dispatcher fait `ctx.scriptPtr++` AVANT d'appeler le handler. Donc à
l'entrée du handler, `ctx.scriptPtr` pointe POST-opcode.

- Pour "rester" sur l'opcode (wait state) : `_stayOnOpcode(ctx)` (=
  `ctx.scriptPtr--; return true`). Next dispatch re-enter.
- Pour avancer normalement : consume args via readByte/Halfword/Word puis
  `return false`.
- Pour jumper : `ctx.scriptPtr = jumpPtr; return false`.

## Tick controllers dans runBattleScript loop

```typescript
const paused = handler(ctx);
tickBattleControllers();  // clear all exec flags MVP
if (paused) return true;
```

Effet : MarkBattlerForControllerExec set bit pendant un opcode, tick le clear
avant la prochaine itération → waitanim/waitmessage/printstring proceedent
immédiatement (= controllers vus comme finis instantanément).

Wire futur = remplacer tick par real-time poll des controllers async (per-bit
clear quand le framework UI termine son anim/text).

## Limitations connues post N4-N11

Stubs MVP documentés (= `// TODO porter`) :
1. `BtlController_Emit*` (anim, text, cursor, faint, fanfare, BGM,
   selection string, sprite invisibility, return to ball, set mon data)
2. `JOY_NEW` → false (= input pas wired)
3. `PlaySE` → no-op (audio engine pas wired)
4. `tickBattleControllers` → clear all (= simule controllers instant done)
5. `Cmd_yesnobox` MVP auto-YES
6. `Cmd_initmultihitstring` PREPARE_BYTE_NUMBER_BUFFER pas implémenté
7. `Cmd_trysetdestinybondtohappen` TrySetDestinyBondToHappen stub
8. `RecordAbilityBattle` no-op
9. `IncrementGameStat` no-op
10. `_countAliveMonsAtkSide` returns 1 (= MVP single battle)
11. `FaintClearSetData` partial (= gProtectStructs/gBattleStruct/gBattleResources
    pas portés, BattleMon.types[] refresh from species pas porté,
    ClearBattlerMoveHistory/ClearBattlerAbilityHistory pas portés)
12. `_selectionScriptFinished[]` stub (TODO porter dans gBattleStruct)
13. `gActionsByTurnOrder[]` local stub (TODO porter à state.ts global)

## Pour reprendre next session — Niveau 12+

**Opcodes restants** (164/249 stubs) :
- Battle structs to port : gProtectStructs, gSpecialStatuses, gBattleStruct
  (choicedMove, dynamicMoveType déjà porté, palaceFlags, lastTakenMove, etc.)
- AbilityBattleEffects (= grosse fn ~1500 lignes pour ability triggers)
- ItemBattleEffects (= grosse fn pour hold effects)
- SetMoveEffect (~500 lignes) → seteffectprimary/secondary réels
- moveend FULL (= state machine ~25 cases) → fin de move cleanup
- Switching : returnatktoball partial done, openpartyscreen/switchineffects/
  switchindataupdate/switchinanim, etc.
- Mémoire ops basés sur ptr address : setbyte/jumpifbyte/addbyte/orbyte/etc.
  (= need address map ewram → TS variable lookup)
- Pokemon stats moves : trysetencore/trysetperishsong/setmist/setseeded done,
  reste setminimize/setdefensecurlbit/setforesight done...
  forcerandomswitch/tryconversiontypechange/setalwayshitflag done...
  mimicattackcopy/metronome/dmgtolevel/psywavedamageeffect/painsplitdmgcalc/
  setforesight done... settypetorandomresistance/copymovepermanently/
  trychoosesleeptalkmove/disablelastusedattack/transformdataexecution/
  hpthresholds/hpthresholds2/useitemonopponent/various/setprotectlike/
  tryexplosion/setatkhptozero/jumpifnexttargetvalid/tryhealhalfhealth/
  trymirrormove/trysetrest/etc.
- Battle setup : 0x4C getswitchedmondata, 0x4D switchindataupdate, 0x4E
  switchinanim, 0x52 switchineffects, 0x53 trainerslidein, 0xF8 trainerslideout

## Compile status

`tsc --noEmit` : **0 erreur** sur tous les modules `src/engine/battle/*`.
117 erreurs pré-existantes en `src/engine/decomp-data/auto/*` (inchangées
depuis sessions précédentes).

## Total Phase 1 progress

- Sessions 132-133 (avant N4) : 27/249 (N1+N2+N3)
- Session 134 N4..N11 : **+58 opcodes = 85/249 total (~34%)**

Le bytecode interpreter n'est toujours pas wired au gameplay actif
(`battle-flow.ts` utilise hardcoded path). Le wire viendra quand suffisamment
d'opcodes + helpers seront portés pour qu'au minimum un move "Tackle" puisse
s'exécuter de bout en bout via le bytecode.

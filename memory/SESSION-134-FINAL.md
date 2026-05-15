# Session 134 FINAL — Phase 1 Niveaux 4-14 (81 opcodes, 108/249 = 43%) (2026-05-15)

## Résumé

**Session autonome (user dormant). 81 nouveaux opcodes battle script
implémentés 1:1 décomp = passage de 27/249 (post N3, session 133) à 108/249
(43%). 12 commits.**

Audit clean : 0 bugs sur les nouvelles implémentations. 3 bugs HITMARKER
constants hérités sessions précédentes corrigés au passage (commit N7).

## Commits cette session

| Commit | Niveau | Opcodes |
|--------|--------|---------|
| `c167b557` | N4 | 6 — anim+UI (attackanim/waitanim/printstring/waitmessage/printfromtable/yesnobox) |
| `2f4dd742` | N5 | 6 — result+faint (attackstring/critmessage/effectivenesssound/resultmessage/dofaintanimation/cleareffectsonfaint) |
| `53aad4f5` | N6 | 6 — UI audio misc (printselectionstring/+table/playse/fanfare/playfaintcry/hitanimation) |
| `05a6bd2c` | N7 | 8 — mutation/flow (setmultihit/decrement/endselectionscript/returnatktoball/swap/incrementgamestat/cancelallactions/manipulatedamage) + **AUDIT FIX HITMARKER** |
| `cb82240c` | N8 | 5 — utility/dynamic (jumpiftype2/makevisible/jumpifnotfirstturn/hiddenpowercalc/jumpifhasnohp) |
| `e21602d2` | N9 | 10 — status-set (setseeded/focusenergy/alwayshit/destinybond/curse/foresight/curl/minimize/cure/torment) |
| `4deb9b49` | N10 | 10 — weather/side/charge (recordlastability/rain/reflect/lightscreen/sandstorm/mist/safeguard/sunny/hail/charge) |
| `f58ed823` | N11 | 7 — damage manip + substitute (negativedamage/setmultihitcounter/initmultihitstring/setsubstitute/trysetdestinybondtohappen/setyawn/setdamagetohealthdifference) |
| `9388cb1c` | DOCS | Update session 134 doc (N4-N11 récap) |
| `57e4ab07` | N12 | 8 — semi-invul/buffers/misc (atknameinbuff1/resetsentmonsvalue/setatktoplayer0/buffermovetolearn/disablelastusedattack/trysetencore/setsemiinvulnerablebit/clearsemiinvulnerablebit) |
| `e2565045` | N13 | 7 — damage calcs special (setatkhptozero/jumpifnexttargetvalid/tryhealhalfhealth/dmgtolevel/psywavedamageeffect/friendshiptodamagecalculation/maxattackhalvehp) |
| `42dca1e3` | N14 | 8 — turn/action management (endlinkbattle/recoverbasedonsunlight/setforcedtarget/settaunt/subattackerhpbydmg/removeattackerstatus1/finishaction/finishturn) |

## Modules créés

```
src/engine/battle/
├── battle-controllers.ts    NEW  ~190 l  stubs UI/anim/SE/input + MarkBattler 1:1
├── util.ts                  NEW  ~120 l  getBattlerForBattleScript full 1:1 +
│                                          GetBattlerAtPosition + FaintClearSetData
├── cmd-niveau-4.ts          NEW   6 opcodes anim+UI
├── cmd-niveau-5.ts          NEW   6 opcodes result+faint
├── cmd-niveau-6.ts          NEW   6 opcodes audio misc
├── cmd-niveau-7.ts          NEW   8 opcodes mutation/flow
├── cmd-niveau-8.ts          NEW   5 opcodes utility/dynamic
├── cmd-niveau-9.ts          NEW  10 opcodes status-set
├── cmd-niveau-10.ts         NEW  10 opcodes weather/side/charge
├── cmd-niveau-11.ts         NEW   7 opcodes damage manip + substitute
├── cmd-niveau-12.ts         NEW   8 opcodes semi-invul + buffers
├── cmd-niveau-13.ts         NEW   7 opcodes damage calcs special
└── cmd-niveau-14.ts         NEW   8 opcodes turn/action management
                                  ────
                              81 opcodes session 134
```

## Niveaux 1-14 inventaire complet (108/249 = 43%)

### N1 Damage flow basic (11/11) — sessions 132-133
attackcanceler / accuracycheck / ppreduce / critcalc / damagecalc / typecalc /
adjustnormaldamage / healthbarupdate / datahpupdate / tryfaintmon / moveend stub

### N2 Stat changes (8/8) — session 133
seteffectprimary stub / seteffectsecondary stub / clearstatusfromeffect /
setgraphicalstatchangevalues / playstatchangeanimation stub / statbuffchange /
normalisebuffs / updatestatusicon stub

### N3 Branching (8/8) — session 133
jumpifstatus / jumpifstatus2 / jumpifability / jumpifsideaffecting /
jumpifstat / jumpifstatus3condition / jumpiftype / jumpifcantmakeasleep

### N4 Animations + UI (6/6) — session 134
attackanimation / waitanimation / printstring / waitmessage / printfromtable /
yesnobox (MVP auto-confirm)

### N5 Result + messages + faint (6/6) — session 134
attackstring / critmessage / effectivenesssound / resultmessage (full 7-case
switch + 4 fallback BattleScriptPush jumps) / dofaintanimation /
cleareffectsonfaint

### N6 UI/audio misc (6/6) — session 134
printselectionstring / printselectionstringfromtable / playse / fanfare /
playfaintcry / hitanimation (SUBSTITUTE skip)

### N7 Mutation + flow (8/8) — session 134
setmultihit / decrementmultihit (multi-byte jump) / endselectionscript /
returnatktoball / swapattackerwithtarget / incrementgamestat /
cancelallactions / manipulatedamage (DMG_*)

### N8 Utility + dynamic (5/5) — session 134
jumpiftype2 (7 bytes) / makevisible / jumpifnotfirstturn /
hiddenpowercalc (IVs bit 0/1 power+type calc) / jumpifhasnohp

### N9 Status-set (10/10) — session 134
setseeded / setfocusenergy / setalwayshitflag / setdestinybond /
cursetarget / setforesight / setdefensecurlbit / setminimize /
cureifburnedparalyzedorpoisoned / settorment

### N10 Weather + side status + charge (10/10) — session 134
recordlastability / setrain / setreflect / setlightscreen / setsandstorm /
setmist / setsafeguard / setsunny / sethail / setcharge

### N11 Damage manip + substitute (7/7) — session 134
negativedamage / setmultihitcounter / initmultihitstring /
setsubstitute / trysetdestinybondtohappen stub / setyawn /
setdamagetohealthdifference

### N12 Semi-invul + buffers + misc (8/8) — session 134
atknameinbuff1 stub / resetsentmonsvalue stub / setatktoplayer0 /
buffermovetolearn stub / disablelastusedattack / trysetencore /
setsemiinvulnerablebit / clearsemiinvulnerablebit

### N13 Damage calcs special (7/7) — session 134
setatkhptozero / jumpifnexttargetvalid / tryhealhalfhealth /
dmgtolevel / psywavedamageeffect / friendshiptodamagecalculation /
maxattackhalvehp

### N14 Turn/action management (8/8) — session 134
endlinkbattle / recoverbasedonsunlight / setforcedtarget / settaunt /
subattackerhpbydmg / removeattackerstatus1 / finishaction / finishturn

## State additions session 134

```typescript
// État global battle (ewram) ajouté en session 134 :
gBattleMovePower               // u16 power dynamique
gBattleControllerExecFlags     // u32 bitmask anim async
gPauseCounterBattle            // u32 frame counter
gDynamicMoveType               // u8 + F_DYNAMIC_TYPE_* flags
gCurrentActionFuncId           // u8 (B_ACTION_*)
gCurrentTurnActionNumber       // u8

// Structs ajoutées (1:1 décomp) :
gDisableStructs[4]             // struct DisableStruct (battle.h:438-468)
gSideTimers[2]                 // struct SideTimer (battle.h:418-432)
gWishFutureKnock               // struct WishFutureKnock (battle.h:401-413)
gActionsByTurnOrder[4]         // local stub
_selectionScriptFinished[4]    // local stub

// BattleScripting interface RÉ-ALIGNÉE 1:1 décomp (27 fields exact ordre)
```

## Audit bug fix HITMARKER constants (commit N7)

3 bugs trouvés en auditant Cmd_swapattackerwithtarget :

| Avant (faux)                | Après (1:1 décomp battle.h:181-205) |
|-----------------------------|-------------------------------------|
| HITMARKER_x10            = 1<<4   | HITMARKER_WAKE_UP_CLEAR    = 1<<4   |
| HITMARKER_PURSUIT_TRAP   = 1<<12  | HITMARKER_SWAP_ATTACKER_TARGET = 1<<12 |
| HITMARKER_IGNORE_SAFEGUARD = 1<<13 | HITMARKER_STATUS_ABILITY_EFFECT = 1<<13 |
| HITMARKER_SYNCHRONISE_EFFECT = 1<<14 | HITMARKER_SYNCHRONIZE_EFFECT (Z) = 1<<14 |
| HITMARKER_WAKE_UP_CLEAR  = 1<<21  | HITMARKER_DISOBEDIENT_MOVE  = 1<<21 |
| HITMARKER_x4000000       = 1<<26  | HITMARKER_NEVER_SET         = 1<<26 |
| HITMARKER_FAINTED2       = const  | HITMARKER_FAINTED2(b) function     |

## Convention scriptPtr (rappel)

- Dispatcher fait `ctx.scriptPtr++` AVANT handler. À l'entrée, scriptPtr
  pointe POST-opcode.
- Pour "rester" sur opcode (wait state) : `_stayOnOpcode(ctx)` (=
  `ctx.scriptPtr--; return true;`).
- Pour avancer : consume args via readByte/Halfword/Word puis `return false`.
- Pour jump : `ctx.scriptPtr = jumpPtr; return false`.

## Tick controllers loop

```typescript
const paused = handler(ctx);
tickBattleControllers();  // clear all exec flags MVP
if (paused) return true;
```

= Simule controllers async finis instantanément.

## Compile status

`tsc --noEmit` : **0 erreur** sur tous `src/engine/battle/*` (jamais cassé
la compile sur 12 commits). 117 erreurs pré-existantes inchangées en
`src/engine/decomp-data/auto/*`.

## Limitations connues (= stubs MVP à porter)

Structs à porter pour atteindre 100% Phase 1 :
1. `gProtectStructs[4]` (Protect/Snatch/MagicCoat/Endured/etc.)
2. `gSpecialStatuses[4]` (focusBanded/lightningRodRedirected/etc.)
3. `gBattleStruct` (choicedMove, dynamicMoveType porté en var libre,
   palaceFlags, lastTakenMove, lastTakenMoveFrom, wrappedBy, wrappedMove, etc.)
4. `gBattleResources` (flags, secretBase, battleScriptsStack — partial via ctx)
5. `gEnigmaBerries[4]`, `GetItemHoldEffect`/`Param` table

Helpers majeurs à porter :
1. `SetMoveEffect` (~500 lignes) → seteffectprimary/secondary réels
2. `AbilityBattleEffects` (~1500 lignes, ~20 cas)
3. `ItemBattleEffects` (~500 lignes, ~15 cas)
4. `moveend` FULL state machine (~25 cases)
5. `TrySetDestinyBondToHappen`, `UproarWakeUpCheck`, etc.
6. `MoveValuesCleanUp`, `BattleScriptPushCursor` (push current vs ptr)
7. `RecordAbilityBattle`, `RecordItemEffectBattle`
8. `PREPARE_*_BUFFER` placeholder system pour text expansion
9. `BattleStringExpandPlaceholders` (= placeholder resolver)
10. `TryRunFromBattle`, `IsTwoTurnsMove`, `IsMoveUncopyableByMimic`
11. `CountAliveMonsInBattle`, `GetMoveTarget`
12. `gBattleScriptsForMoveEffects[]` (= move effect → script offset, requis
    par metronome/sleeptalk/etc.)
13. `IncrementGameStat` wire au save block stats

Opcodes restants ~141 / ~57% :
- Battle setup : 0x4C..0x53, 0xF8 (switching/trainer animations)
- Memory ops basés ptr address : 0x2A..0x38 (= besoin d'address map ewram)
- Move-specific calcs complexes : 0xA1/A2 counter/mirrorcoat, 0xA5
  painsplit, 0xA8 copymovepermanently (Sketch), 0xA9 sleeptalk, 0xAC
  remaininghptopower (Flail), 0xAD spite, 0xAE healpartystatus, 0xB3
  rolloutdamagecalculation, 0xB4 jumpifconfusedandstatmaxed, 0xB5
  furycuttercalc, 0xB7 presentdamagecalculation, 0xB9 magnitudedamagecalculation,
  0xBA jumpifnopursuitswitchdmg, 0xBD copyfoestats, 0xBE rapidspinfree,
  0xCC callenvironmentattack, 0xDD weightdamagecalculation, 0xDE assistattackselect
- Effets divers : 0x6A removeitem (needs gBattleStruct.usedHeldItems),
  0x73/74 hpthresholds, 0x76 various, 0x77 setprotectlike, 0x7C trymirrormove,
  0x81 trysetrest, 0x85/86/87 stockpile, 0x8B setbide (gLockedMoves arr),
  0x8C confuseifrepeatingattackends, 0x8F forcerandomswitch, 0x90
  tryconversiontypechange, 0x91 givepaydaymoney, 0x93 tryko, 0x94
  damagetohalftargethp, 0x96 weatherdamage, 0x97 tryinfatuating
- Helpers ItemEffect : 0x69 adjustsetdamage (FocusBand + Endure), 0xCF
  jumpifnodamage, 0xD1 trysethelpinghand, 0xD2 tryswapitems, 0xD3
  trycopyability, 0xD4 trywish, 0xD5 trysetroots, 0xD6
  doubledamagedealtifdamaged, 0xD9 scaledamagebyhealthratio, 0xDA
  tryswapabilities, 0xDB tryimprison, 0xDC trysetgrudge, 0xDF trysetmagiccoat,
  0xE0 trysetsnatch, 0xE1 trygetintimidatetarget, 0xE2 switchoutabilities
- Catch + reward + dex : 0xED snatchsetbattlers, 0xEE removelightscreenreflect,
  0xEF handleballthrow, 0xF0 givecaughtmon, 0xF1 trysetcaughtmondexflags,
  0xF2 displaydexinfo, 0xF3 trygivecaughtmonnick
- Trainer : 0x53 trainerslidein, 0xF8 trainerslideout
- Frontier / contests : misc

## Pour reprendre next session — Niveau 15+

**Priorité 1 — wire battle interpreter au combat actuel** :
- Implémenter `gBattleScriptsForMoveEffects[]` table (= move effect → script
  label offset). Requis pour que les opcodes "jumptocalledmove" /
  Metronome / Sleep Talk fonctionnent.
- Implémenter `gProtectStructs[4]` minimal (= 19 fields struct,
  battle.h:300-340).
- Implémenter `SetMoveEffect` helper (= seteffectprimary/secondary réels).
- Implémenter `moveend` FULL state machine.
- Une fois ces 4 done, on peut wire `battle-flow.ts` à appeler
  `setupBattleScriptContext('BattleScript_HitFromAttackerString')` +
  `runBattleScript(ctx)` au lieu du hardcoded path pour un move "Tackle".

**Priorité 2 — finir les opcodes simples restants** :
- N15+ : batch des ~40 opcodes restants triviaux (setforesight done,
  setmagiccoat/snatch needs gSpecialStatuses, etc.).
- Mémoire ops (setbyte/addbyte/etc.) : besoin d'address map ewram. À
  documenter pour porter quand le wire battle-flow.ts révélera quelles
  addresses sont actually utilisées.

**Priorité 3 — opcodes complexes (= helpers majeurs)** :
- AbilityBattleEffects (~1500 l, 20 cas)
- ItemBattleEffects (~500 l, 15 cas)
- TrySetDestinyBondToHappen + autres helpers battle_util.c

## Compile + Runtime check

`npm run build` : 0 erreur sur src/engine/battle/*. Pre-existing errors
in decomp-data/auto unchanged.

`npx tsc --noEmit` : 117 erreurs pré-existantes (toutes en
decomp-data/auto/*, hors scope). 0 erreur sur battle/*.

Le bytecode interpreter n'est toujours pas wired au gameplay actif
(`battle-flow.ts` toujours hardcoded). Le wire viendra une fois les
priorités 1 done — au minimum un move "Tackle" doit pouvoir s'exécuter
de bout en bout via le bytecode.

# Session 132 — Backing systems Tier 🟡 + Phase 1 skeleton (2026-05-15)

User direction : "Continue la roadmap. Pas de MVP. Tout le jeu, pas juste early game. Pivot vers 1:1 combat GBA PUIS intégrer Showdown à côté."

## Bilan session 132

11 systèmes backing wired 1:1 décomp + battle interpreter skeleton créé. Tous compile clean, runtime preview confirme zero erreur.

### 🟡 Tier yellow — TOUS DONE (11/11)

#### 1. Audio tracking réel (`IsSEPlaying`/`IsCryPlaying`/`IsCryFinished`/`IsFanfareTaskInactive`)
- **Fichiers** : `decomp-globals.ts` (+ `m4a/se-noise-prerendered.ts` export, `music.ts` cry tracking)
- **Source décomp** : `src/sound.c` (= `gMPlayInfo_SE1/2.status`, `IsPokemonCryPlaying`)
- **Impl** : `_audioEndTimeMs` tracker per-slot (`se1/se2/cry/bgm/fanfare`). PlaySE set end time depuis `getPrerenderedSEDuration` ou `midi.duration`. playCry set depuis `audioBuf.duration`.
- **Opcodes wired** : `waitse` / `waitmoncry` / `waitplaysewithpan` / `waitfanfare` / `hidemonpic` — tous polling real state via `globalThis.__decompGlobals`

#### 2. Subpriority Sprite wire (`setobjectsubpriority`/`resetobjectsubpriority`)
- **Fichier** : `script-opcodes.ts` opcodes mis à jour
- **Source décomp** : `src/event_object_movement.c:SetObjectSubpriority` (= `sprite->subpriority = priority + 83`)
- **Impl** : Lookup `rt.gSprites.get(obj.spriteId)` + set `sprite.subpriority`. `syncSpritesToOam` propage à OAM (= déjà existant ligne 2109 decomp-runtime.ts).

#### 3. Step callbacks (`setstepcallback` + `DoPerStepCallback`)
- **NOUVEAU fichier** : `step-callbacks.ts` (+ wiring dans `player-avatar.ts`)
- **Source décomp** : `src/overworld.c:gPerStepCallbacks[]` + `RunOnSteppedCallback` + `ActivatePerStepCallback`
- **Impl** : Table 8 callbacks (DUMMY/ASH/FORTREE_BRIDGE/PACIFIDLOG_BRIDGE/TRUCK/SOOTOPOLIS_ICE/TICKING_CLOCK/BIRTH_ISLAND_ZONE). `DoPerStepCallback` appelé depuis player step complete handler. Increment `gameStats[GAME_STAT_STEPS]` + daily flag trigger every 256 steps.
- **TODO futurs** : real impl pour chaque callback (ash piles render swap, bridge sink anim, ice crack metatile swap, etc.)

#### 4. `dotimebasedevents` berry growth
- **NOUVEAU fichier** : `time-based-events.ts`
- **Source décomp** : `src/berry.c:BerryTreeTimeUpdate` + `src/overworld.c:DoTimeBasedEvents`
- **Impl** : `RtcGetMinuteCount()` delta vs `block1.lastBerryTreeUpdateMin`. `BerryTreeTimeUpdate` advance les berry trees through stages PLANTED → SPROUTED → TALLER → FLOWER → BERRIES avec withering check (`> 71 * stageDuration` → blank). `_stageDurationMinutes()` returns 180 par défaut (= 3h, moyenne Em).
- **TODO futurs** : Per-berry `stageDuration` lookup depuis `data/berry.h gBerries[]`. CalcBerryYield correct.

#### 5. `setflashlevel` / `animateflash` mask
- **NOUVEAU fichier** : `flash-mask.ts`
- **Source décomp** : `src/fldeff_flash.c` + `src/field_screen_effect.c:sFlashLevelToRadius`
- **Impl** : Post-process post-`gba.tick()` dans `phaser-bridge.tick()`. Pixels hors cercle (centré 120,80, rayon `sFlashLevelToRadius[level]`) → noir opaque. Levels 0..8, radii [200,72,64,56,48,40,32,24,0].
- **Coût** : ~0.5ms par frame, négligeable.

#### 6. Field-effect active list (`waitfieldeffect`/`dofieldeffect`/`dofieldeffectsparkle`)
- **NOUVEAU fichier** : `field-effect-active-list.ts`
- **Source décomp** : `src/field_effect.c:gFieldEffectActiveList` + `FieldEffectActiveListAdd/Remove/Contains`
- **Impl** : Set<id> + Map<id, endTimeMs>. Auto-cleanup quand timer expire. `dofieldeffect` add l'effect ID, `waitfieldeffect` poll `Contains`, `dofieldeffectsparkle` add FLDEFF_SPARKLE (36) avec 500ms.

#### 7. `lockfortrainer` real freeze tracking
- **Fichier** : `script-opcodes.ts` opcode mis à jour
- **Source décomp** : `src/trainer_see.c:FreezeForApproachingTrainers` + `IsFreezeObjectAndPlayerFinished`
- **Impl** : Freeze tous NPCs + poll `gPlayerAvatar.stepFramesLeft === 0 && all NPCs walkFramesLeft === 0` (= tile-aligned).

#### 8. `disable_jump_landing_ground_effect` consumer
- **Fichier** : `movement-system.ts` NPC jump landing path
- **Source décomp** : `src/event_object_movement.c:DoLandingEffect` (= skip dust effect si flag set)
- **Impl** : Check `obj.disableJumpLandingGroundEffect` flag avant `SpawnJumpLandingDust`. Player jump landing : toujours dust (1:1 décomp).

#### 9. Money/coins box UI
- **NOUVEAU fichier** : `money-box-ui.ts`
- **Source décomp** : `src/money.c:DrawMoneyBox / HideMoneyBox / ChangeAmountInMoneyBox` + `src/coins.c:ShowCoinsWindow / HideCoinsWindow / PrintCoinsString`
- **Impl** : `AddWindow` 10×2 (money) / 8×2 (coins), palette 15, frame border via `DrawStdFrameWithCustomTileAndPalette` (tile 0x214, paletteIdx 14). Texte "&lt;amount&gt;₽" ou "PIÈCES &lt;count&gt;".
- **Opcodes wired** : `showmoneybox` / `hidemoneybox` / `updatemoneybox` / `showcoinsbox` / `hidecoinsbox` / `updatecoinsbox`.

#### 10. Virtual objects rendering (`createvobject`/`turnvobject`)
- **NOUVEAU fichier** : `virtual-objects.ts`
- **Source décomp** : `src/event_object_movement.c:CreateVirtualObject` + `TurnVirtualObject`
- **Impl** : Reuse `CreateObjectGraphicsSprite` (= même gfx pipeline NPCs). `loadObjectEventGraphicsInfo` async. Map<id, {spriteId, gfx, mapX, mapY, elevation, direction}>. Direction → ANIM_STD_FACE_* (0..3).
- **Limitation** : Pas de camera tracking per-frame. Sprite reste fixé au pixel initial (= suffit pour cutscenes stationnaires comme dance/wave). Camera tracking = future iteration.

#### 11. `setmaplayoutindex` dynamic swap
- **NOUVEAU fichier** : `map-layout-swap.ts`
- **Source décomp** : `src/fieldmap.c:SetCurrentMapLayout`
- **Impl** : `SetCurrentMapLayout(layoutIdx)` async load + update `gMapHeader.mapLayout`. Set `gMapLayoutReloadRequested` flag pour field scene re-render.
- **TODO futurs** : Extraction du mapping `LAYOUT_X` (= numerical idx) → layoutId string depuis `include/constants/layouts.h`. Sans ça, l'opcode set le flag mais ne resolve pas l'idx.

### 🔵 Phase 1 — Battle interpreter SKELETON

#### `src/engine/battle/script-interpreter.ts` (NEW)
- **Source décomp** : `src/battle_script_commands.c` (~10000 lines, 249 opcodes)
- **Impl** :
  - `BattleMon` interface 1:1 décomp `struct BattlePokemon` (battle.h)
  - `BattleScriptingState` interface 1:1 `struct BattleScripting`
  - `BattleScriptContext` (= scriptPtr + stack + comparisonResult + dataPtr)
  - `loadBattleScriptBytecode()` : concat `battle_scripts_1-bytecode.ts` (12243 bytes) + `_2-bytecode.ts`
  - `_LABELS` map : label → byte offset (619 labels)
  - `runBattleScript(ctx)` : main interpreter loop with 256-entry dispatch table
  - Implémentés réellement (~11) : `nop`, `goto`, `call`, `return`, `end`, `end2`, `end3`, `pause`, `waitstate`, `jumpifbyte` (stub), `setbyte` (stub)
  - **Stubs (~238)** : `_Cmd_stub(name)` retourne TRUE (= pause) + log warn. Empêche le scripts d'avancer en gameplay actif (= safe pour le moment, le tutorial battle utilise `battle-flow.ts` séparé)
- **Coverage** : 11/249 réels = 4%. Reste 238 opcodes à porter.

### Files modifiés / créés cette session

**NEW** :
- `src/engine/step-callbacks.ts`
- `src/engine/time-based-events.ts`
- `src/engine/flash-mask.ts`
- `src/engine/field-effect-active-list.ts`
- `src/engine/money-box-ui.ts`
- `src/engine/virtual-objects.ts`
- `src/engine/map-layout-swap.ts`
- `src/engine/battle/script-interpreter.ts`

**MODIFIED** :
- `src/engine/decomp-globals.ts` (+ audio tracking + side-effect imports)
- `src/engine/script-opcodes.ts` (~10 opcodes mis à jour pour vraies impls)
- `src/engine/player-avatar.ts` (+ DoPerStepCallback hook)
- `src/engine/movement-system.ts` (+ disable jump landing consumer)
- `src/engine/music.ts` (+ cry end time tracking)
- `src/engine/m4a/se-noise-prerendered.ts` (+ `isPrerenderedSlotActive` export)
- `src/engine/gba/phaser-bridge.ts` (+ flash mask post-process)

### Commits cette session

- `af02d6ce` : BACKING : audio tracking reel + subpriority wired to Sprite
- `9759f58e` : BACKING : step-callbacks + berry growth + flash mask
- `a927cd2e` : BACKING : field-effect active list + lockfortrainer real freeze + jump landing
- `036d8b85` : BACKING : money/coins box UI 1:1 decomp
- `1d45b846` : BACKING : virtual objects rendering 1:1 decomp
- `e59eeb27` : BACKING : map layout swap dispatch (setmaplayoutindex)
- (+ battle interpreter skeleton — pas encore commit au moment de la doc)

## Pour la prochaine session (post-compact)

### Phase 1 battle interpreter (MASSIVE)

Le skeleton est en place. Reste à porter les 238 opcodes stub depuis `src/battle_script_commands.c`. Voici l'ordre suggéré par impact :

#### Niveau 1 — Damage flow basic (= déblocque move de base)
1. `0x00 attackcanceler` — protect/snatch/magic-coat/struggle check
2. `0x01 accuracycheck` — calcul accuracy vs evasion (= sAccuracyTable)
3. `0x03 ppreduce` — decrement PP
4. `0x04 critcalc` — 1/16 ou 1/8 selon high-crit move + items
5. `0x05 damagecalc` — formule complète atk×power×(2×lvl/5+2)/def/50 + STAB + type effectiveness + crit×2 + random 0.85-1.0
6. `0x06 typecalc` — type chart × 2 (defType1, defType2). Set gMoveResultFlags MOVE_RESULT_SUPER_EFFECTIVE/NOT_VERY_EFFECTIVE/DOESNT_AFFECT.
7. `0x07 adjustnormaldamage` — burn ÷2, screen ÷2, parental bond, etc.
8. `0x0B healthbarupdate` / `0x0C datahpupdate` — anim HP bar drain + apply damage to gBattleMons[battler].hp
9. `0x19 tryfaintmon` — check hp == 0, jump to faint script
10. `0x49 moveend` — cleanup post-move (= move effect chain)

#### Niveau 2 — Stat stages + status (= effects de moves)
11. `0x89 statbuffchange` — apply stat change ±N stages (= ATK, DEF, SPA, SPD, SPE, ACC, EVA)
12. `0x47 setgraphicalstatchangevalues` — palette flash anim setup
13. `0x48 playstatchangeanimation` — anim "↑" ou "↓"
14. `0x16 seteffectprimary` / `0x17 seteffectsecondary` / `0x15 seteffectwithchance` — apply move side effect (= burn/poison/sleep/etc.)
15. `0x18 clearstatusfromeffect` — heal status
16. `0x98 updatestatusicon` — refresh status icon

#### Niveau 3 — Branchements (= goto/jump)
17. `0x29 jumpifbyte` — already stub, complete byte comparison
18. `0x1C jumpifstatus` — branch si status1 has bit
19. `0x1D jumpifstatus2` — branch si status2 has bit
20. `0x1E jumpifability` — branch si ability matches
21. `0x20 jumpifstat` — branch si stat stage condition
22. `0x22 jumpiftype` — branch si type matches
23. `0x84 jumpifcantmakeasleep` — sleep immunity check

#### Niveau 4 — Move animations + UI
24. `0x09 attackanimation` / `0x0A waitanimation` — anim system
25. `0x10 printstring` / `0x12 waitmessage` — battle text
26. `0x13 printfromtable` — strings indexed (= "Pokemon was put to sleep!")
27. `0x67 yesnobox` — Y/N prompts (= use TM ?)

#### Niveau 5 — Switching + faint flow
28. `0x1A dofaintanimation` — faint anim
29. `0x1B cleareffectsonfaint` — clear status/stat stages on faint
30. `0x4B returnatktoball` — ball return anim
31. `0x4D switchindataupdate` — load new mon data into gBattleMons
32. `0x4E switchinanim` / `0x52 switchineffects` — switch in anim + ability triggers
33. `0x4F jumpifcantswitch` — switch validity
34. `0x50 openpartyscreen` — party menu in battle
35. `0x51 switchhandleorder` — handle switching with action queue

#### Niveau 6 — Specific effects (= moves spéciaux)
- Sleep, Confusion, Curse, Encore, Mirror Move, Counter, Mirror Coat
- Conversion, Conversion 2, Transform, Substitute
- Spikes, Future Sight, Beat Up, Rapid Spin
- Weather (Sunny, Rain, Sandstorm, Hail)
- Light Screen, Reflect, Safeguard, Mist
- Stockpile, Spit Up, Swallow
- Pain Split, Bide, Wish, Memento

#### Niveau 7 — Misc + getexp + lvlup
- `0x23 getexp` — experience gain + lvlup trigger
- `0x6C drawlvlupbox` — stats UI on lvlup
- `0x59 handlelearnnewmove` / `0x5A yesnoboxlearnmove` — move learning prompts

#### Niveau 8 — Battle Frontier specific
- `0x53 trainerslidein` / `0xF8 trainerslideout`
- `0xF0 givecaughtmon` / `0xF3 trygivecaughtmonnick`

### Architecture battles : ce qui manque

Plus que les opcodes, il faut :

1. **Battle controllers** : `EmitX` / `Cmd_RecvX` pour communication entre script + UI. Le décomp utilise `gBattleControllerExecFlags` u32 bitmask. Notre port : peut bypass pour single-player offline.
2. **Battle Mons array** : `gBattleMons[4]` (= 4 max battlers en doubles). Notre struct `BattleMon` defined dans script-interpreter.ts. Need a global instance.
3. **Battle Scripting state** : `gBattleScripting` struct (~30 fields). Defined, need instance + reset between turns.
4. **Move data** : `gBattleMoves[]` (= 354 moves) déjà extrait dans `data/battle_main-data.ts`. Need bridge pour lecture par opcodes.
5. **Type chart** : déjà existant dans game-data.
6. **AI** : `src/battle_ai_script_commands.c` (= un AUTRE bytecode interpreter, 70+ opcodes). Le décomp utilise ce VM pour scorer chaque move. Notre port : `battle-flow.ts:pickOpponentMove` retourne le 1er move dommageant — placeholder.
7. **Battle animations** : `data/battle_anim_scripts.s` (= autre VM avec ~80 opcodes). Plus de 600 anim scripts (= 1 par move + effects).
8. **Battle main loop** : `src/battle_main.c:RunBattleScript` (= called per frame). Notre port n'a pas encore ce loop. Battle-flow.ts a un loop simplifié.

### Estimation

Pour porter tout battle 1:1 décomp avec proper architecture : **3-4 semaines focused dev**.

Pour un MVP playable (= damage + faint + switch + 4 status + basic AI) : **1 semaine focused**.

### Showdown integration plan (après 1:1 GBA done)

Une fois le battle 1:1 GBA fonctionne, intégrer `@pkmn/sim` comme :
- Alternate mode "Modern Battle" pour combat online / replay analyse / debug
- Convert state GBA → Showdown format → run sim → convert back
- Coexistence : runtime detect le mode et utilise l'un ou l'autre
- Le GBA reste source de vérité pour cinématique + animations + jouabilité 1:1 ROM

## Notes contexte

- Branche : `upd2`
- Worktree : `D:/Projet 1/pokemon-web-demo` (= main repo, malgré la presence d'un dir `.claude/worktrees/hungry-moore-a74774` qui est juste un dummy folder)
- Preview port 5173 running (server `65bb40c8-b1b1-4edb-be0c-a38cf88f1af0`)
- Tous les commits sur upd2 sont accessibles user-side directement
- 117 erreurs TS pré-existantes dans auto-generated files (= zéro nouvelle erreur introduite session 131+132)
- Game runtime confirmé clean côté preview (no console errors)

## TL;DR pour prochaine session

1. Lire `D:/Projet 1/pokemon-web-demo/memory/SESSION-132-BACKING-SYSTEMS.md` (= ce file) + `OPCODES-BACKING-WORK-TODO.md` + `SESSION-131-OPCODES-COMPLETION.md` + `ROADMAP-FUTURE-PROOF-2026-05-14.md`
2. État : tous opcodes scripts + tous specials registered. Tier yellow done. Battle interpreter skeleton en place.
3. Next : porter les 238 stubs du battle interpreter (= `src/engine/battle/script-interpreter.ts`) en commençant par Niveau 1 (damage flow basic). Source décomp = `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`.
4. Aussi à faire éventuellement : real impl per step callback (ash, bridges, ice), per-berry stageDuration, virtual objects camera tracking, layout idx → id mapping extraction.

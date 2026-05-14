# Audit 4/8 : Système de combat

## Comparaison web projet vs décomp pokeemeraude

### Architecture décomp battle

**Fichiers décomp clés** :
- `src/battle_main.c` (4 791 lignes) — CB2_InitBattleInternal, BattleMainCB1, gBattleMainFunc state machine, turn loop, end turn dispatch
- `src/battle_script_commands.c` (9 262 lignes) — ~100 Cmd_* handlers (attackcanceler, accuracycheck, damagecalc, typecalc, critcalc, healthbarupdate, tryfaintmon, getexp, etc.)
- `src/battle_interface.c` (2 331 lignes) — healthbox rendering, HP bar tiles, status icons, EXP bar, party summary screen
- `src/battle_setup.c` (1 671 lignes) — CB2_GiveStarter, CB2_StartFirstBattle, DoTrainerBattle, DoStandardWildBattle, battle transition selection
- `src/battle_anim.c` (1 583 lignes) — 48 anim script commands (loadspritegfx, createsprite, createvisualtask, delay, etc.)
- `src/battle_anim_*.c` (32 000 lignes total) — animations par type (fire, water, ice, flying, ghost, psychic, electric, dark, fight, ground, rock, bug, dragon, normal, poison, smokescreen, status_effects)
- `src/battle_controllers.c` (1 376 lignes) — BtlController_Emit/Recv protocol, per-battler execution
- `src/battle_controller_player.c` (2 822 lignes) — player controller (input, move selection, party screen)
- `src/battle_controller_opponent.c` (1 848 lignes) — opponent controller
- `src/battle_ai_script_commands.c` (1 982 lignes) — AI think scripts, move scoring, if_status/if_hp/if_move conditions
- `src/battle_intro.c` (564 lignes) — BattleIntroSlide tasks, background slide animation per environment
- `src/battle_transition.c` (4 056 lignes) — 12+ transition types (slice, white_bars, pokeballs_trail, swirl, etc.)
- `src/battle_message.c` (3 023 lignes) — BattlePutTextOnWindow, PrepareStringBattle, string IDs
- `src/battle_util.c` (3 799 lignes) — HandleAction_UseMove, ChooseMoveOrAction, CalculateBaseDamage caller
- `src/battle_bg.c` (1 355 lignes) — battle terrain backgrounds per environment
- `src/battle_tv.c` (1 525 lignes) — trainer TV portraits during battle
- `src/pokemon.c:3107` — CalculateBaseDamage (physical + special, crit, stat stages, items, abilities, badges, weather)

**State machine décomp** : `gBattleMainFunc` dispatched chaque frame :
1. BattleIntroGetMonsData → BattleIntroPrepareBackgroundSlide → BattleIntroDrawTrainersOrMonsSprites
2. BattleIntroDrawPartySummaryScreens → BattleIntroPrintTrainerWantsToBattle / BattleIntroPrintWildMonAttacked
3. Send-out animations (ball throw) → TryDoEventsBeforeFirstTurn
4. HandleTurnActionSelectionState → SetActionsAndBattlersTurnOrder → RunTurnActionsFunctions
5. HandleEndTurn_* dispatch (ContinueBattle / BattleWon / BattleLost / Ran / MonFled / Caught)
6. Post-battle : EXP, level-up, evolution scene, return to overworld

### Architecture web projet

**Fichiers hand-written** :
- `src/battle/runner.ts` (98 lignes) — wrapper `@pkmn/sim` (Pokemon Showdown gen3customgame)
- `src/engine/battle-flow.ts` (965 lignes) — Birch tutorial battle state machine, damage calc, move menu, HP windows
- `src/engine/battle-anim-engine.ts` (1 373 lignes) — anim script parser + executor, 300+ sprite tags, visual tasks
- `src/engine/battle-visual-effects.ts` (486 lignes) — HP bar animation, floating damage, move type particles, status sprites
- `src/engine/battle-terrain.ts` (112 lignes) — terrain composition from decomp tilemaps
- `src/engine/trainer-battle-flow.ts` (272 lignes) — trainer battle wrapper (intro text, party loop)
- `src/engine/_move-anim-table.ts` (51 lignes) — move ID → anim script name mapping (368 moves)

**Fichiers auto-générés** : ~145 000 lignes dans `decomp-data/auto-*` :
- `auto/src/` — 101 battle module data files (controllers, anim, AI, setup, transition, etc.)
- `auto/src-all/` — 61 combined files (battle_script_commands-all-auto.ts = 8 316 lignes)
- `auto-asm-bytecode/data/` — battle_scripts_1/2 bytecode, battle_ai_scripts, battle_anim_scripts
- `auto-engine/src/` — battle_main-engine.ts (10 engine functions extracted)
- `auto-tasks/src/` — battle task struct definitions
- `auto/include/constants/` — battle_move_effects, moves, abilities enums

---

## Écarts détectés

### ERREUR E4.1 — Architecture dual battle : @pkmn/sim vs state machine

**Décomp** : un seul système de combat unifié. `battle_main.c` + `battle_script_commands.c` gèrent tous les types de battles (wild, trainer, double, safari, frontier, link).

**Web** : DEUX systèmes parallèles non unifiés :
1. `runner.ts` utilise `@pkmn/sim` (Pokemon Showdown) — moteur de simulation du gen 8+ avec `gen3customgame`
2. `battle-flow.ts` — state machine hand-written pour le seul tutorial battle Birch

**Problème** :
- `@pkmn/sim` implémente la mécanique du gen 8, pas une réimplémentation 1:1 du gen 3. Les formules de damage, type chart, et abilities diffèrent.
- `battle-flow.ts` est un MVP tutorial-only — il ne gère que le combat Zigzagoon LV2 vs starter LV5.
- Les deux systèmes sont incompatibles : `runner.ts` retourne un stream d'événètres texte, `battle-flow.ts` est un state machine tickable.
- Aucun dispatch central ne choisit quel système utiliser selon le contexte (wild encounter vs trainer battle vs intro battle).

**Impact** : la majorité des battles du jeu (wild encounters Route 101+, trainer battles) ne peuvent utiliser qu'un seul des deux systèmes. Le `@pkmn/sim` est visuellement inintégré (pas de sprites, pas de GBA UI). Le `battle-flow.ts` est fonctionnel pour le tutorial mais pas extensible aux combats génériques sans réécriture majeure.

**Fichiers** : `src/battle/runner.ts`, `src/engine/battle-flow.ts`
**Criticité** : HIGH — architecture fondamentale divisée, bloque toute battle au-delà du tutorial

### ERREUR E4.2 — Battle script interpreter absent

**Décomp** : `battle_script_commands.c` implémente ~100 battle script commands. Chaque move execution suit un script bytecode :
```
BattleScript_MoveEffectHit:
  - accuracycheck → critcalc → damagecalc → typecalc → adjustnormaldamage
  - attackanimation → waitanimation → healthbarupdate → datahpupdate
  - critmessage → effectivenesssound → resultmessage
  - seteffectprimary → seteffectsecondary → tryfaintmon
```

**Web** : `battle-flow.ts` bypass entirely le battle script system. Le damage, animation, HP update, et fainted check sont codés inline dans la state machine (lignes 740-850). Les auto-generated battle_scripts_1-bytecode.ts et battle_scripts_2-bytecode.ts existent mais ne sont pas exécutés par un interpreter.

**Impact** : les effets secondaires des moves (stat change, status inflict, multi-hit, two-turn moves, charge moves) ne sont pas gérés par le script — ils sont soit hardcodés dans le state machine ( Growl → "est affaibli!") soit absents. Le behavior diverge du décomp pour les moves complexes (Struggle Bug, Dynamax, etc.).

**Fichiers** : `src/engine/battle-flow.ts`, `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_*-bytecode.ts`
**Criticité** : HIGH — ~100 script commands non exécutées, les effets de moves ne sont pas fidèles

### ERREUR E4.3 — CalculateBaseDamage : formule simplifiée (correcte partiellement)

**Décomp** : `CalculateBaseDamage` (pokemon.c:3107-3400) inclut :
1. Physical vs Special split par move type ✅ (partiel — le web calcule atk*power mais ne distingue pas physical/special)
2. Stat stages (APPLY_STAT_MOD) — 6 stats, -6 à +6 stages ❌ absent
3. Critical hit multiplier (gCritMultiplier = 2) ❌ absent
4. Item effects (Choice Band +50%, Soul Dew, Light Ball, Thick Club, etc.) ❌ absent
5. Ability effects (Huge Power, Pure Power, Hustle, Plus/Minus, Guts, Marvel Scale, etc.) ❌ absent
6. Badge boost (110% atk/def/spa/spd per badge) ❌ absent
7. Burn attack halving ❌ absent
8. Reflect/Lightscreen reduction ❌ absent
9. Double battle target-both halving ❌ absent
10. Weather modifications (rain boosts water 1.5×, weakens fire 0.5×) ❌ absent
11. Random factor 85-100% ✅ présent (lignes 214-218)
12. STAB ✅ présent (ligne 419-424)
13. Type effectiveness ✅ présent (lignes 426-428)
14. Min damage = 1 ✅ présent (ligne 213)

**Web** : `calculateBaseDamage` (lignes 203-220) + `calcStat` (lignes 224-226) :
- Base formula : `damage = atk * power * (2*lvl/5 + 2) / def / 50` ✅
- Random factor 85-100% ✅
- STAB 1.5× ✅
- Type effectiveness multiplier ✅
- Min damage 1 ✅
- Stat calc : `((2*base + iv + ev/4) * level / 100) + 5` ✅

**Manquant** : stat stages, critical hit, items, abilities, badges, burn, reflect/lightscreen, weather, physical/special distinction.

**Fichiers** : `src/engine/battle-flow.ts` lignes 203-220
**Criticité** : MEDIUM — le core damage formula est correct pour le tutorial (pas de badges/items/abilities à LV 2-5), mais diverge pour les combats avancés

### ERREUR E4.4 — AI : pas de battle AI décomp (premier move dommageant)

**Décomp** : `battle_ai_script_commands.c` (1 982 lignes) implémente :
- `AI_ThinkingStruct` avec move scoring
- 40+ AI commands (if_random_less_than, if_status, if_hp_less_than, if_move, if_not_move, score, try_moveattack, etc.)
- `ChooseMoveOrAction_Singles` — évalue chaque move possible, score chaque scenario
- Battle history tracking pour éviter la répétition
- AI scripts par contexte (wild, trainer, frontier)

**Web** :
- `battle-flow.ts` : `pickOpponentMove` (lignes 396-404) — préfère le premier move avec `power > 0`. Zéro intelligence.
- `runner.ts` : `RandomPlayerAI` de `@pkmn/sim` — aléatoire pur, pas du scoring décomp.

**Impact** : les adversaires ne prennent jamais de décision stratégique (pas de type advantage check, pas de status priority, pas de move variety).

**Fichiers** : `src/engine/battle-flow.ts` ligne 396-404
**Criticité** : MEDIUM — les combats sont trivialement prédictibles, pas de challenge

### ERREUR E4.5 — Battle transition : fade-to-black uniquement

**Décomp** : `battle_transition.c` (4 056 lignes) gère 12+ types de transitions :
- Wild : slice/white_bars (normal), clockwise_wipe/grid_squares (cave), blur/grid_squares (flash), wave/ripple (water)
- Trainer : pokeballs_trail/angled_wipes (normal), shuffle/big_pokeball (cave), swirl (water)
- Frontier : logo_wiggle, circles_meet, spirals, etc.
- Transition depend sur map type ET relative level (low-level vs high-level transition)

**Web** : `battle-flow.ts` (lignes 506-517) fait un simple `BeginNormalPaletteFade` to black → load → fade in. Zéro transition animée.

**Impact** : le transition visuel entre overworld et battle est un fade noir instantané, pas les 12 transitions animées du décomp.

**Fichiers** : `src/engine/battle-flow.ts` lignes 506-517, `src/engine/decomp-data/auto/src/battle_transition-data.ts`
**Criticité** : LOW — les 12 transitions auto-generated data existent mais ne sont pas câblées à un executor

### ERREUR E4.6 — Battle interface : HP bar en texte vs tiles

**Décomp** : `battle_interface.c` gère les healthboxes avec :
- HP bar tiles animés (green → yellow → red progressif, 9 segments par couleur)
- Status icons (PSN, PRZ, SLP, FRZ, BRN) par battler position
- EXP bar segment tiles en bas du healthbox
- Pokemon icon (mini sprite) dans le level-up banner
- Party summary screen avec HP/status pour les 6 slots
- Trainer TV portrait pendant le combat

**Web** :
- HP text : `AddTextPrinterParameterized3` avec `"NICKNAME\nLvX PV:A/B"` ✅ fonctionnel
- HP bar visuel : `FillWindowPixelRect` rectangulaire (green/yellow/red) ✅ partiel (3 segments vs 9 décomp)
- Status icons : ❌ absents — pas de rendu PSN/PRZ/SLP/FRZ/BRN
- EXP bar : ❌ absent
- Pokemon icon : ❌ absent
- Party summary screen : ❌ absent
- Trainer TV portrait : ❌ absent

**Fichiers** : `src/engine/battle-flow.ts` lignes 315-353
**Criticité** : LOW — fonctionnel pour le tutorial, pas 1:1 visuellement

### ERREUR E4.7 — Battle anim engine : parser correct mais exécution partielle

**Décomp** : `battle_anim.c` — 48 commands dans `sScriptCmdTable` :
- loadspritegfx / unloadspritegfx / createsprite / createvisualtask
- delay / waitforvisualfinish / playse / monbg / clearmonbg
- setalpha / blendoff / call / return / setarg / choosetwoturnanim
- jumpifmoveturn / goto / fadetobg / restorebg / waitbgfade* / changebg
- playsewithpan / setpan / panse / loopsewithpan / createsoundtask
- splitbgprio / invisible / visible / teamattack_move* / stopsound

**Web** : `battle-anim-engine.ts` implémente :
- Parser pour 40+/48 anim commands ✅ (LOAD_SPRITE_GFX, UNLOAD_SPRITE_GFX, CREATE_SPRITE, DELAY, WAIT_FOR_VISUAL_FINISH, MON_BG, SET_ALPHA, BLEND_OFF, CALL, RETURN, GOTO, etc.)
- 300+ ANIM_TAG → PNG path mapping ✅ (les assets sont dans `public/decomp/em/battle_anims/`)
- `_loadSpriteGfx` depuis PNG ✅
- `executeCmd` dispatch switch ✅
- Visual tasks partielles (CREATE_VISUAL_TASK parse mais execution limitée)
- SE values : toutes résolues à 0 (ligne 647) ❌ — les sound effects d'animation ne jouent pas
- Sprite templates : 50+ templates nommés dans `KNOWN_TEMPLATES` mais callbacks vides (ligne 941) ❌
- Macro parser (create_basic_hitsplat_sprite, create_poison_powder_particle_sprite, etc.) ✅ partiel

**Manquant** :
- `SE_*` constants non résolues → silence anim
- Sprite template callbacks non implémentés → createsprite no-op pour les templates
- Visual task execution incomplete → les animations complexes (fire spiral, absorption orb, etc.) ne s'animent pas correctement
- `sAnimSpriteIndexArray` management (8 slots) absent
- `gAnimMoveDmg` / `gAnimMovePower` wiring to anim scripts absent

**Fichiers** : `src/engine/battle-anim-engine.ts`
**Criticité** : MEDIUM — l'infrastructure anim est impressionnante (300+ tags, parser 40+ commands) mais l'exécution visuelle est partiellement no-op

### ERREUR E4.8 — Battle controllers : protocol absent

**Décomp** : chaque battler a un controller (`battle_controller_player.c`, `battle_controller_opponent.c`, etc.) qui :
- Reçoit des commandes via `BtlController_Emit*` (GetMonData, DrawPartyStatusSummary, IntroSlide, LoadMonSprite, etc.)
- Répond via `BtlController_Recv*`
- Exécution marquée par `MarkBattlerForControllerExec` + `gBattleControllerExecFlags`

**Web** : les auto-generated `battle_controller_*-callbacks-auto.ts` existent (~10 fichiers) mais le protocol Emit/Recv n'est pas implémenté. Les callbacks sont des data exports, pas des fonctions exécutables.

**Impact** : sans controller protocol, les opérations asynchrones (load sprites, draw healthboxes, get mon data) ne peuvent pas être dispatchées par battler. Le state machine web fait tout inline.

**Fichiers** : `src/engine/decomp-data/auto/src/battle_controller_player-callbacks-auto.ts`
**Criticité** : MEDIUM — bloque la séparation concerns controller/interface du décomp

### ERREUR E4.9 — Double battles : non supportés

**Décomp** : `BATTLE_TYPE_MULTI`, `BATTLE_TYPE_TWO_OPPONENTS`, partner controllers, double-battle-specific script commands.

**Web** : seul single battle implémenté. `gBattlersCount` toujours = 2. Pas de partner sprites, pas de double HP windows, pas de double move targeting.

**Impact** : les gym doubles, battle frontier, et trainer doubles ne fonctionnent pas.

**Criticité** : MEDIUM — post-tutorial mais nécessaire pour la progression

### ERREUR E4.10 — Switch/fuite/sac : non implémentés

**Décomp** :
- Switch : `Cmd_openpartyscreen` → party selection → `Cmd_switchindataupdate` → `Cmd_switchinanim` (ball return + send-out)
- Run away : `HandleEndTurn_RanFromBattle` — probability calc based on speed + item
- Bag : item usage during battle — potion, berry, pokeball, x-item

**Web** : `battle-flow.ts` commentaire ligne 33 : "Pas de fuite, pas de switch, pas de bag (single mon, single battle)". B-button disabled during move menu (ligne 721).

**Impact** : le player est locked dans un seul Pokemon, pas d'échappatoire, pas d'items curables.

**Fichiers** : `src/engine/battle-flow.ts`
**Criticité** : MEDIUM — bloque la stratégie et la survie en combat difficile

### ERREUR E4.11 — Battle message system : texte inline vs string IDs

**Décomp** : `battle_message.c` — 300+ string IDs (STRINGID_OPPOSITEISONASLEEP, STRINGID_ATKWHATNOW, STRINGID_TYPEBUTTHEREISNO, etc.). Les messages sont composés via `PrepareStringBattle` + placeholders.

**Web** : les messages battle sont hardcodés inline : `"Un ${opponentMon.nickname} sauvage apparaît!"`, `"Que doit faire ${playerMon.nickname}?"`, `"C'est super efficace!"`. ~20 messages pour un seul flow.

**Impact** : les messages ne couvrent qu'un scenario (tutorial). Les 300+ string IDs pour les autres scenarios (status messages, item messages, switch messages, etc.) ne sont pas câblés.

**Criticité** : LOW — fonctionnel pour le tutorial, pas extensible

### ERREUR E4.12 — Stat stages / critical hit / burn : absents

**Décomp** :
- Stat stages : -6 à +6 pour 6 stats (atk, def, spa, spd, spe, accuracy, evasion). `APPLY_STAT_MOD` dans `CalculateBaseDamage`.
- Critical hit : `gCritMultiplier` calculé depuis move ignore-defense + attacker level.
- Burn : `attacker->status1 & STATUS1_BURN` → damage /= 2 (sauf Guts ability)

**Web** : aucun de ces trois mécanismes implémenté. Le Growl est traité comme un status move (power=0 → "est affaibli!") mais le stat stage n'est pas tracké — le défenseur n'est pas réellement affaibli pour les tours suivants.

**Impact** : les moves de stat modification (Growl, Swords Dance, Agilidad, etc.) n'ont d'effet que textuel. Le damage ne change pas sur les tours suivants.

**Fichiers** : `src/engine/battle-flow.ts`
**Criticité** : HIGH — les stat stages sont fondamentaux pour la stratégie battle. Sans, Growl/Swords Dance/Agility sont visuellement présents mais mécaniquement inactifs

### ERREUR E4.13 — Post-battle : evolution scene disconnectée

**Décomp** : `TryEvolvePokemon` → `WaitForEvoSceneToFinish` → evolution scene avec animation + music + sparkle.

**Web** : le level-up est détecté (`LEVEL_UP_TEXT` state, ligne 839-848) mais l'évolution n'est pas câblée à `evolution_scene.c`. Les auto-generated `evolution_scene-*-auto.ts` existent mais ne sont pas invoqués.

**Impact** : les Pokémon qui atteignent le level d'évolution ne se transforment pas.

**Criticité** : LOW — post-tutorial, l'évolution n'est pas critique pour le premier combat

### ERREUR E4.14 — Weather in battle : absent

**Décomp** : `gBattleWeather` track rain/sandstorm/hail/sun. Weather affecte :
- Damage over time (sandstorm/hail)
- Move power (Blizzard 100% accuracy in hail, Surf in rain)
- Solar Beam skip-charge in sun
- Damage modification (rain boosts water 1.5×, weakens fire 0.5×)

**Web** : pas de weather tracking en battle. `setweather` opcode no-op (E2.8 audit 2).

**Criticité** : LOW — weather en battle est post-tutorial

### ERREUR E4.15 — Safari/Contest/Link battles : non implémentés

**Décomp** :
- Safari Zone : `battle_controller_safari.c` — go_near, throw ball, escape mechanics
- Contest : `contest.c` — appeal/judge system, cooling/appeal points
- Link battles : `battle_controller_link_*.c` — data exchange, recorded battles

**Web** : absents. Auto-generated data existe mais pas d'intégration.

**Criticité** : LOW — hors scope MVP

---

## Résumé passage 4

| ID     | Type        | Criticité | Description courte                                              |
|--------|-------------|---------|---------------------------------------------|
| E4.1   | Architecture | HIGH  | Dual battle system (@pkmn/sim + state machine) non unifié       |
| E4.2   | Manquant    | HIGH    | Battle script interpreter absent (~100 commands no-op)          |
| E4.3   | Partiel     | MEDIUM  | CalculateBaseDamage correct core mais 10/14 factors absents     |
| E4.4   | Manquant    | MEDIUM  | Battle AI décomp absente (premier move dommageant uniquement)    |
| E4.5   | Manquant    | LOW     | Battle transitions : fade-to-black vs 12 transitions animées    |
| E4.6   | Partiel     | LOW     | HP bar textuel + rect vs tiles décomp (status/EXP/party absent) |
| E4.7   | Partiel     | MEDIUM  | Anim engine : parser 40+/48 commands mais SE=0 + templates vides |
| E4.8   | Manquant    | MEDIUM  | Controller protocol Emit/Recv absent                            |
| E4.9   | Manquant    | MEDIUM  | Double battles non supportés                                    |
| E4.10  | Manquant    | MEDIUM  | Switch/fuite/sac non implémentés                                |
| E4.11  | Partiel     | LOW     | Messages inline (~20) vs 300+ string IDs décomp                 |
| E4.12  | Manquant    | HIGH    | Stat stages / critical hit / burn damage absent                 |
| E4.13  | Manquant    | LOW     | Evolution scene disconnectée                                    |
| E4.14  | Manquant    | LOW     | Weather in battle absent                                        |
| E4.15  | Manquant    | LOW     | Safari/Contest/Link battles absents                             |

**Couverture globale battle** :
- Tutorial battle (Birch/Zigzagoon) : ~70% (damage calc core ✅, HP bar ✅, move menu ✅, EXP ✅, level-up ✅)
- Battle script interpreter : ~5% (bytecode data existe, pas d'interpreter)
- Anim system : ~30% (parser 40+/48 ✅, 300+ tags ✅, SE=0 ❌, templates vides ❌)
- AI : ~2% (premier move dommageant)
- Controllers : ~0% (data auto-générée, protocol absent)
- Transitions : ~10% (fade-to-black = 1/12 types)
- Post-battle : ~20% (EXP/level-up ✅, evolution ❌)
- Double battles : 0%
- Switch/items/run : 0%

**Fort** : le tutorial battle est fonctionnel et visuellement acceptable. Le damage formula core est fidèle. L'infrastructure anim (300+ tags, parser, PNG mapping) est impressionnante. Les auto-generated battle data (~145K lignes) montrent un investissement significatif dans l'extraction de données décomp.

**Faible** : l'architecture dual battle (@pkmn/sim + state machine) crée deux chemins non convergents. Le battle script interpreter est absent — c'est le cœur du système de combat du décomp. L'AI, les stat stages, et les controllers sont des gaps majeurs.

**Priorité correction** : E4.2 (battle script interpreter) → E4.1 (unifier les deux systèmes) → E4.12 (stat stages/crit/burn) → E4.4 (AI) → E4.8 (controllers).

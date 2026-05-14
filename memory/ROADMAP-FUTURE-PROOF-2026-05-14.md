# Roadmap future-proof 1:1 décomp — 2026-05-14

Établi après vérification de l'audit Qwen 3.6 27B (voir `AUDIT-QWEN-VERIFICATION-2026-05-14.md`). Pas de MVP : tout doit être complété 1:1 décomp.

Branche : `upd2`. État party screen post-session 130 : complet sauf status icon + held item + stats pages flip.

## Principes directeurs

1. **1:1 décomp strict**. Pas de raccourci, pas de stub silencieux.
2. **Future-proof** : tout système doit supporter le scope complet du jeu (Hoenn entier), pas juste tutoriel.
3. **Tester chaque correction** : pas de "ça compile" suffisant. Vérification visuelle obligatoire pour UI/animations.
4. **Ne pas casser ce qui marche** : tests régression manuels sur path `?truck → Bourg → Birch → Zigzagton` après chaque phase.
5. **Commit après chaque sous-tâche validée**.

## Ordre d'exécution recommandé

L'ordre prend en compte les dépendances (battle interpreter avant stat stages avant double battles, etc.) et l'utilité immédiate (corriger ce qui bloque le path principal d'abord).

---

## PHASE 1 — Cœur battle (architecture)

**Objectif** : pouvoir jouer N'IMPORTE QUEL combat (wild, trainer, double) de façon fidèle au décomp. Aujourd'hui seul le tutorial Zigzagton fonctionne, et même lui bypass le script interpreter.

### 1.1 Battle script interpreter (E4.2 — critique)
- Fichier : nouveau `src/engine/battle/script-interpreter.ts`
- Source décomp : `src/battle_script_commands.c` (9 262 lignes, ~100 Cmd_*)
- Lire bytecode depuis `decomp-data/auto-asm-bytecode/data/battle_scripts_1-bytecode.ts` et `..._2-bytecode.ts`
- Exécuter chaque Cmd_* 1:1 : attackcanceler, accuracycheck, critcalc, damagecalc, typecalc, adjustnormaldamage, attackanimation, waitanimation, healthbarupdate, datahpupdate, critmessage, effectivenesssound, resultmessage, seteffectprimary, seteffectsecondary, tryfaintmon, etc.
- Câbler avec battle-flow.ts comme exécuteur principal.

### 1.2 Stat stages + crit + burn (E4.12)
- gBattleMons[battler].statStages[STAT_*] : -6 à +6 (7 stats : atk, def, spa, spd, spe, accuracy, evasion)
- APPLY_STAT_MOD macro pour les modifiers de damage calc
- gCritMultiplier calcul (move ignore-defense + level + items/abilities)
- STATUS1_BURN damage halving (sauf Guts ability)
- Toutes les formules dans `pokemon.c:CalculateBaseDamage` 1:1

### 1.3 Unifier dual battle (E4.1)
- Choix : abandonner @pkmn/sim, étendre battle-flow.ts comme dispatcher général
- battle-flow.ts devient dispatch central : wild / trainer single / trainer double / safari / contest / link
- runner.ts gardé en fallback debug-only (?showdown query param)
- Tous les call sites de battle (overworld script `battle_start`, trainer `trainerbattle`, post-victory script) routent vers battle-flow

### 1.4 Battle AI 1:1 (E4.4)
- `battle_ai_script_commands.c` (1 982 lignes) — 40+ AI commands
- AI_ThinkingStruct + move scoring
- Battle history tracking
- Per-context AI scripts (wild, trainer, frontier)
- if_random_less_than, if_status, if_hp_less_than, if_move, score, try_moveattack

### 1.5 Battle controllers protocol (E4.8)
- `BtlController_Emit*` / `BtlController_Recv*` 1:1 décomp
- gBattleControllerExecFlags + MarkBattlerForControllerExec
- Auto-generated `battle_controller_*-callbacks-auto.ts` à câbler comme handlers Recv
- Per-battler dispatch (player, opponent, partner, opponent_partner)

### 1.6 Battle anim engine complétion (E4.7)
- Sprite templates callbacks (50+ templates dans KNOWN_TEMPLATES, callbacks vides ligne 941)
- SE_* constants résolues (au lieu de SE=0 hardcoded)
- sAnimSpriteIndexArray 8 slots
- gAnimMoveDmg / gAnimMovePower wiring
- Visual task execution complète (fire spiral, absorption orb, etc.)
- Reste : 8/48 anim commands à parser

### 1.7 Switch / fuite / sac (E4.10)
- openpartyscreen + switchindataupdate + switchinanim (ball return + send-out)
- HandleEndTurn_RanFromBattle (probability speed + item)
- Item usage en battle (potion, berry, pokeball, x-item)

### 1.8 Battle transitions animées (E4.5)
- `battle_transition.c` (4 056 lignes) — 12+ types
- Wild : slice/white_bars (normal), clockwise_wipe/grid_squares (cave), blur (flash), wave/ripple (water)
- Trainer : pokeballs_trail/angled_wipes (normal), shuffle/big_pokeball (cave), swirl (water)
- Frontier : logo_wiggle, circles_meet, spirals
- Selection par type de map + relative level

### 1.9 Battle messages 1:1 (E4.11)
- 300+ string IDs (STRINGID_*)
- PrepareStringBattle + placeholders 1:1
- Strings FR depuis le décomp

### 1.10 Battle interface complète (E4.6)
- HP bar tiles animés 9 segments par couleur (vs 3 actuel)
- Status icons PSN/PRZ/SLP/FRZ/BRN par battler position
- EXP bar segment tiles
- Pokemon icon dans level-up banner
- Party summary screen during battle (HP/status pour les 6 slots)

### 1.11 Double battles (E4.9)
- BATTLE_TYPE_MULTI + BATTLE_TYPE_TWO_OPPONENTS
- Partner controllers
- Double HP windows
- Double move targeting (SELECT, OPPONENT, BOTH, BOTH_OPPONENTS)

### 1.12 Weather in battle (E4.14)
- gBattleWeather tracking (rain, sandstorm, hail, sun, fog)
- Damage over time (sandstorm/hail)
- Move power modification (water + rain, fire + sun)
- Solar Beam skip-charge in sun
- Weather durations + abilities (Drizzle, Drought, Sand Stream)

### 1.13 Evolution scene (E4.13)
- TryEvolvePokemon + WaitForEvoSceneToFinish
- Animation + music + sparkle (`evolution_scene.c`)
- Câbler auto-generated `evolution_scene-*-auto.ts`
- Trade evolution + level-up evolution + happiness evolution + item evolution

### 1.14 Safari / Contest / Link battles (E4.15)
- Safari Zone : battle_controller_safari (go_near, throw ball, escape)
- Contest : appeal/judge system
- Link battles : data exchange + recorded battles

---

## PHASE 2 — Scripts & Specials complétion

### 2.1 gotonative / callnative (E2.1 partie réelle)
- ScrCmd_gotonative : jump bytecode → native C bool8 function
- ScrCmd_callnative : appel native + continue script
- Nécessaire pour scripts qui dispatchent vers logic C

### 2.2 Specials manquants (E2.1)
- État : 137 specials registered + 54 stubs = ~191/400
- Audit `decomp-data/auto/src/specials-*` et registrer les ~209 manquants
- Priority : ceux référencés par les scripts maps Hoenn (overworld scripts JSON)

### 2.3 Warp variants (E2.6)
- ScrCmd_warphole : fall through cracked floor
- ScrCmd_warpteleport : roamer teleport
- ScrCmd_warpmossdeepgym : gym Mossdeep spécial
- ScrCmd_setwarp : pas un stub no-op, vraiment set la destination
- ScrCmd_warpspinenter : frontier spin

### 2.4 Weather/clock opcodes (E2.8)
- initclock : initialise RTC events
- dotimebasedevents : process events temporels (morning/afternoon/night NPCs)
- resetweather : clear current weather
- doweather : déclenche l'effet visuel weather (rain, sandstorm, snow, etc.)
- setweather : déjà stocké, ajouter trigger visuel

### 2.5 Compare variants (E2.2)
- compare_local_to_local, compare_local_to_value, compare_local_to_ptr
- compare_ptr_to_local, compare_ptr_to_value, compare_ptr_to_ptr
- compare_var_to_var
- Rare en pratique mais nécessaire pour future-proof

### 2.6 Money/coins box UI (E2.7)
- showmoneybox / hidemoneybox / updatemoneybox
- showcoinsbox / hidecoinsbox / updatecoinsbox
- Window template + tiles dans le décomp

### 2.7 lockfortrainer / selectapproachingtrainer (E2.9)
- Trainer "approaching" qui te voit et engage automatiquement
- Requis pour le path Route 102+ (trainers in grass)

### 2.8 Buffer opcodes manquants (E2.10)
- buffercontestname
- vbuffermessage (mystery events)

### 2.9 MEM stubs : warning au moins (E2.11)
- MEM_WRITE / MEM_OP_ASSIGN / MEM_PRE_DEC / MEM_PRE_INC
- Soit implémenter vraiment, soit `console.warn` une fois par symbol
- Sinon les bugs de pointer arithmetic dans auto-callbacks sont invisibles

### 2.10 std scripts (E2.4)
- gotostd / callstd / gotostd_if / callstd_if : actuellement no-op
- Soit câbler à la table des std scripts décomp, soit warn

### 2.11 Mystery events (E2.3)
- vgoto / vcall / vgoto_if / vcall_if / setvaddress
- LOW priority (désactivés dans le décomp aussi)

### 2.12 Contest/berry/decoration/slot opcodes (E2.5)
- ~40 opcodes post-overworld
- Faisables groupés une fois Phase 1+2 done

---

## PHASE 3 — Overworld solidité

### 3.1 Bike movement (E3.1)
- MovePlayerOnBike : 2× speed
- Bike sprites (Mach + Acro)
- Bike-only metatile behaviors (slopes, cycling road)
- PLAYER_AVATAR_FLAG_MACH_BIKE / ACRO_BIKE

### 3.2 Surf movement (E3.1)
- MovePlayerOnSurf : water current effects
- PLAYER_AVATAR_FLAG_SURFING
- Surf sprite avec mon-derrière-player
- Water tile collision + sweep

### 3.3 Underwater movement (E3.1)
- Pour Route 124+, Sootopolis
- PLAYER_AVATAR_FLAG_UNDERWATER

### 3.4 CONNECTION_INVALID border check (E3.5)
- Dans `checkPlayerCollision` : GetMapBorderIdAt → if CONNECTION_INVALID, block
- Empêche le player de sortir des maps sans border défini

### 3.5 NPC movement types manquants (E3.8)
- FACE_PLAYER (distinct de faceplayer opcode)
- JUMP_AROUND
- WAVE
- HOLD_FISHING_ROD
- SLIDE_AND_STAND_STILL
- RUN_IN_CIRCLE_FEROCIOUSLY (arena NPC)
- WALK_IN_PLACE_NORMAL_* (face animation sans mouvement)
- ~15-20 types total

### 3.6 Scripted movement actions manquants (E3.12)
- Bounce, Shake, Spin, QuakeHead
- Shrink, Grow (Slow + Fast)
- Float (Up, Down, To, Place)
- Teleport (To, From, In)
- FlyAway (intro Latios/Latias)
- HopTo, HopToFast, HopToVeryFast, HopInPlace*
- BounceTo, BounceToFast, BounceInPlace
- JumpTo, JumpUpDown, JumpUpDownTo
- MoveToSlow, RunInPlace
- MoveTo/MoveFromPlayer (+Fast)
- ~20-30 actions sur les 159 existantes

### 3.7 OnBButton coord triggers (E3.15)
- script-runtime.ts : ajouter dispatch B-button
- Triggers : machine à sous, signs, etc.

### 3.8 Camera post-warp smooth (E3.2)
- gCamera.movementSpeedX/Y persisté entre les frames pendant le warp
- Currently camera figée pendant fade

### 3.9 NPC↔NPC collision (E3.9)
- DoesObjectCollideWithObjectAt pour scripted movements
- Évite chevauchement NPCs dans cinematics

### 3.10 Field effects manquants (E3.13)
- Dust cloud (sand/dirt walking)
- Leaf flutter
- Sparkle
- Heal bubbles
- Misty effect
- Mud shot
- Puddle splash
- Berry tree effect
- Rocksmash dust
- Cut grass effect
- Strength carry effect
- ~12/16 manquants

### 3.11 Tileset animations manquantes (E3.14)
- Lamp glow
- Elevator panel
- TV screen
- Anim infrastructure déjà OK, ajouter les frames

### 3.12 Door callbacks 1:1 (E3.11)
- FieldCB_DoDoorWarpExit / FieldCB_ExitDoor fidèles
- Currently simplifiés

### 3.13 LOCALID_FISHING / LOCALID_BERRY_GLASSES (E3.7)
- Pour fishing rod + berry picking effects

### 3.14 IsCoordInsideObjectEventMovementRange (E3.4)
- NPC spawn clipping correct aux bounds

### 3.15 DrawWholeMapView screen fade progressif (E3.3)
- Currently flash, décomp progressif

---

## PHASE 4 — Save & state complétion

### 4.1 PokemonStorage persisté (E5.4)
- Ajouter `pokemonStorage: PokemonStorage` à SaveSlot interface (save-system.ts:60-73)
- PreSaveSync + PostLoadApply pour pokemonStorage
- PC boxes (14 boîtes × 30 slots) persistent

### 4.2 ClearTempFieldEventData + ClearDailyFlags (E5.13)
- Implémenter `ClearTempFieldEventData` 1:1 décomp event_data.c
- TEMP_FLAGS reset entre map transitions
- ClearDailyFlags pour daily reset (healing center NPCs, trainer rematches)
- Wired à OnMapEnter callback

### 4.3 gSpecialVar 0x8000..0x800B complet (E5.12)
- Audit : VAR_0x8000-8002 wired. Vérifier 0x8003..0x800B
- Ces vars sont les "registres temporaires" pour les scripts complexes
- Pas de bug observé actuellement mais à vérifier sur scripts Hoenn

---

## PHASE 5 — UI complétion

### 5.1 Party screen reste (E6.10 reste)
- Status icon (PSN/PAR/BRN/SLP/FRZ) au lieu de Lv quand mon a status
- Held item icon (small sprite next to mon)
- Stats pages flip (INFOS / APTITU / CAPACITES) — accessible depuis Résumé
- Cursor highlight palette swap subtil

### 5.2 Bag screen reste (E6.11 reste)
- Teach move logic (TM/HM)
- Quantity selector (1 / MOITIÉ / TOUT) pour items multi-qty
- Ball throwing transition
- Berry plant interaction

### 5.3 Pokédex complet (E6.13)
- List view scrollable (Vus/Capturés)
- Regional/National dex toggle
- Search function (par name, nombre, type)
- Filter (normal, not seen, not caught, complete)
- Summary screen per entry (description, taille, poids, cri)
- DEX modes 0151/0251/0386/0438

### 5.4 Control codes manquants (E6.3)
- FONT (0x06) : runtime font switch
- WAIT_SE (0x0B) : wait until sound effect done
- PLAY_BGM (0x0C) : 5 bytes inline music switch
- ESCAPE (0x0D) : escape printer
- COLOR_HIGHLIGHT_SHADOW (0x0E) : 5 bytes 3 colors simultaneous
- VAR (0x15) : insert variable value inline
- SPECIAL (0x16) : insert special string inline
- PAUSE_UNTIL_PRESS (0x0A) : wait keypress (différent de PAUSE timer)

### 5.5 AUTO_SCROLL message mode (E6.6)
- field_message_box.c mode AUTO_SCROLL
- Pour intro speeches sans wait A

### 5.6 FONT_BOLD + FONT_BRAILLE (E6.2)
- Pour battle messages spéciaux + Hall of Fame easter egg

### 5.7 Placeholders nommés (E6.15 si nécessaire)
- {BIRCH}, {STARK}, {MAI}, {ROUTE}, {TOWN}, {GYM_LEADER}, etc.
- Probablement pas nécessaire si l'extracteur les résout statiquement
- À vérifier dans les scripts maps si certains apparaissent bruts

---

## PHASE 6 — Audio fidélité

### 6.1 m4aClock + tick scheduler M4A 1:1 (E7.2)
- Implémenter `m4aClock` appelé chaque frame
- Ramping volume/pitch per-channel
- LFO (tremolo, vibrato)
- Mixing tick-by-tick
- ⚠️ Très gros refactor : Web Audio est event-driven, M4A est tick-driven

### 6.2 MapMusicMain dans tick loop (E1.3 / E7.9)
- Câbler MapMusicMain (déjà défini dans `auto-engine/src/sound-engine.ts`) au tickFixed de decomp-runtime.ts
- Transition BGM map change
- Saved BGM restoration
- Volume ramping BGM contextuel

### 6.3 Unifier dual pipeline audio (E7.1)
- Soit : full M4A web reimplementation (= refactor majeur, abandon spessasynth)
- Soit : documenter explicitement le dual pipeline comme adaptation web permanente
- Recommandation : full M4A web. Sinon BGM diverge de la ROM (samples SF2 ≠ DirectSound originaux, scheduling différent)
- Si full M4A : implémenter mixer 6-channel software, voicegroup parsing 1:1, programmable wave 64 samples, sweep square 1 runtime

### 6.4 SE restoration sans timer (E7.16)
- Garder BGM slot + SE slots séparés (pas restore BGM)
- Audio routing : BGM → bgmGain → master, SE → seGain → master
- Pas de stopSong() pour playSE
- Évite les glitches transition rapide

### 6.5 Programmable wave 64 samples (E7.15)
- Currently 32 samples DFT 16 harmoniques
- ROM original supporte 64 samples
- Pour les BGM utilisant flûte, harpe (instruments wave-based)

### 6.6 Cry pitch shift par level (E7.10)
- PlayCry décomp ajuste pitch selon species + level + stats
- Currently playback flat
- AudioBufferSource.playbackRate pour pitch shift

### 6.7 Square sweep runtime (E7.4)
- Currently statique dans voicegroup
- Décomp anime le sweep frame-by-frame
- AudioParam.linearRampToValueAtTime pour le sweep

### 6.8 Compositor blending + window masking (E7.19)
- BLDCNT / BLDALPHA / BLDY : alpha blending entre BG layers
- WIN0 / WIN1 / OBJWIN : window masking
- Nécessaire pour fade in/out fluides, transitions

### 6.9 PNG palette explicite (E7.18)
- expectedPalette parameter systématique dans loadIndexedPng
- Évite l'ordre des indices décalé

---

## PHASE 7 — Auto-gen data wiring

Le projet a ~145K lignes auto-générées. Beaucoup de data sans executor. Câbler les executors restants :

### 7.1 Battle scripts executor (E4.2 — fait en Phase 1.1)
### 7.2 Battle controllers (E4.8 — fait en Phase 1.5)
### 7.3 Battle anim sprite templates (E4.7 — fait en Phase 1.6)
### 7.4 Battle transitions (E4.5 — fait en Phase 1.8)
### 7.5 Evolution scene (E4.13 — fait en Phase 1.13)
### 7.6 Scripted movements completion (E3.12 — fait en Phase 3.6)
### 7.7 NPC movement types (E3.8 — fait en Phase 3.5)

(Toutes les items déjà listées dans les phases précédentes. C'est le même travail vu sous l'angle "câbler la data au code".)

---

## PHASE 8 — Boot & infrastructure

### 8.1 Link/RFU réel (E1.5 état actuel : stubs)
- Stubs sont là (link-engine.ts, link_rfu_2-engine.ts) mais no-op
- Si on supporte cable/wireless link entre browsers (peer-to-peer WebRTC ?), implémenter ici
- LOW priority : MVP single player

### 8.2 WaitForVBlank fidelity (E1.4)
- Currently tickFixed simule 60Hz
- Pour 1:1 strict, ajouter vblank counter + interrupt fires
- LOW : la simulation est suffisante pratiquement

### 8.3 SoftReset (E1.6)
- B+A+Select reset
- LOW : pas critique en web

### 8.4 LoadGameSave double-call (E1.7)
- main.ts + GameScene.transitionToOverworld
- Idempotent actuellement mais clarifier le flow

---

## PHASE 9 — Polish & tests

### 9.1 Régression tutorial path
- ?truck → Bourg → Mom → wallclock → Mom 2F → Outside → MaysHouse → MeetRival → Route 101 → Birch → Zigzagton
- Doit fonctionner sans modification après chaque phase

### 9.2 Régression overworld extended
- Route 101+ → Oldale → Route 103 → Petalburg → Route 104 → Rustboro
- Validation NPC movement types + scripted movements + warp variants

### 9.3 Test battle complet
- Wild battle (Phase 1 ready)
- Trainer battle single (Phase 1 ready)
- Trainer battle double (Phase 1.11 done)
- Gym leader battle (full scope Phase 1)

### 9.4 Test audio fidélité
- A/B comparer BGM Bourg vs ROM
- A/B SE wall hit, door open, menu select
- A/B cries (Treecko, Lotad, Mudkip, etc.)

### 9.5 Test save persistance
- Save → reload → tous state correct
- PC boxes (post Phase 4.1)
- Daily flags reset (post Phase 4.2)

---

## Estimation effort

| Phase | Items | Effort | Priorité |
|-------|-------|--------|----------|
| Phase 1 — Cœur battle | 14 | XXXL | CRITIQUE |
| Phase 2 — Scripts/specials | 12 | L | HAUTE |
| Phase 3 — Overworld | 15 | XL | HAUTE |
| Phase 4 — Save state | 3 | M | MOYENNE |
| Phase 5 — UI complétion | 7 | L | MOYENNE |
| Phase 6 — Audio | 9 | XL | MOYENNE |
| Phase 7 — Auto-gen wiring | — | (inclus dans P1-P3) | — |
| Phase 8 — Boot/infra | 4 | S | BASSE |
| Phase 9 — Polish/tests | 5 | M | CONTINUE |

**Total** : ~65 items distincts. La Phase 1 seule représente ~40% du travail restant.

## Ordre d'attaque conseillé pour la session courante

User a indiqué qu'il a "ses propres bugs à partager sur une preview". Donc :

1. **D'abord** : écouter ses bugs, fix ce qui bloque le path actuel
2. **Ensuite** : reprendre la Phase 5.1 (party screen reste — status icon + held item) car c'est où on en était session 130
3. **Puis** : Phase 1.1 (battle script interpreter) — le plus gros morceau, mais aussi le plus impactant
4. **En parallèle** : Phase 5.3 (Pokédex) — feature visible, motivante

## Notes

- Ne pas refaire @pkmn/sim path. Aller direct sur battle-flow étendu.
- Ne pas commit avant validation user. User a dit "plus de commit avant le 100%" en session 130.
- Conserver les commits debug : ?truck, ?debug, devtools console.
- Toutes les nouvelles strings UI : FR depuis décomp pokeemeraude (pas anglais).
- Pour assets : `public/decomp/em/` est la source de vérité (pas `public/decomp/en/`).
- Pour code décomp à lire : `public/decomp/em/extracted-all/*.json` body field, ou direct `src/*.c` du décomp source.

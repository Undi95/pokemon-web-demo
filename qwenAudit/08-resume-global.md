# Audit 8/8 : Résumé et tableau de bord global

## Synthesis des 7 audits précédents

---

## 1. Vue d'ensemble

| Audit | Domaine | Lignes décomp | Lignes web | Findings | HIGH | MEDIUM | LOW | TRIVIAL | ✅ CORRECT |
|-------|---------|--------------|------------|----------|------|--------|-----|---------|-----------|
| 01 | Structure + boot | ~200 (main.c) | ~1 200 | 11 | 0 | 3 | 2 | 1 | 2 |
| 02 | Decomp-bridge + scripts | ~2 800 (scrcmd.c) | ~1 500 (opcodes) | 13 | 1 | 4 | 3 | 1 | 3 |
| 03 | Overworld + mouvement | ~9 000 | ~4 000 | 15 | 0 | 7 | 8 | 0 | 1 |
| 04 | Système de combat | ~32 000 | ~3 000 + 145K auto | 15 | 3 | 7 | 5 | 0 | 0 |
| 05 | Sauvegarde + état | ~1 600 | ~2 200 | 17 | 0 | 4 | 2 | 3 | 9 |
| 06 | UI + texte + menus | ~23 928 | ~9 879 | 18 | 0 | 5 | 3 | 0 | 10 |
| 07 | Audio + ressources | ~9 000–11 000 | ~4 000–5 000 | 20 | 1 | 5 | 7 | 0 | 8 |
| **TOTAL** | **8 domaines** | **~78 528** | **~12 779 + 145K auto** | **109** | **5** | **35** | **30** | **5** | **33** |

**Ratio global** : ~15% du code décomp est implémenté en 1:1 fidèle, ~55% est partiellement implémenté, ~30% est absent. Les 145K lignes auto-générées montrent un investissement dans l'extraction de données mais ne représentent pas du code exécuté.

---

## 2. Distribution par criticité

### HIGH (5 erreurs)

| ID | Domaine | Description | Impact |
|----|---------|-------------|--------|
| E2.1 | Scripts | gotonative/callnative/special table non résolue | Musique de map, wild encounters, effects screen — le backbone des ~400 specials C est no-op |
| E4.1 | Battle | Dual architecture (@pkmn/sim + state machine) non unifié | Bloque toute battle au-delà du tutorial. Deux chemins incompatibles. |
| E4.2 | Battle | Battle script interpreter absent (~100 commands) | Effets de moves non fidèles. Move execution bypass les scripts bytecode décomp. |
| E4.12 | Battle | Stat stages / critical hit / burn damage absents | Growl/Swords Dance/Agility visuellement présents mais mécaniquement inactifs |
| E7.1 | Audio | Dual architecture audio (spessasynth/SF2 + custom synth) | Le pipeline audio diverge fondamentalement du décomp M4A. Timing, rampes, scheduling non 1:1 |

**Pattern** : 3/5 HIGH sont dans le système de combat. L'architecture battle est le gap le plus critique. Les 2 HIGH restants (scripts specials + audio) sont des divergences architecturales fondamentales.

### MEDIUM (35 erreurs)

Groupées par domaine :

**Battle (7 MEDIUM)** : E4.3 (damage partial), E4.4 (AI absente), E4.7 (anim SE=0 + templates vides), E4.8 (controller protocol absent), E4.9 (double battles), E4.10 (switch/fuite/sac), E4.13 (evolution disconnectée)

**Overworld (7 MEDIUM)** : E3.1 (bike/surf), E3.2 (camera post-warp), E3.5 (CONNECTION_INVALID collision), E3.8 (NPC movement types), E3.10 (warp variants), E3.12 (scripted movement ~35/50 absents), E3.15 (OnBButton)

**Scripts (4 MEDIUM)** : E2.2 (compare variants), E2.6 (warp opcodes), E2.8 (weather/clock), E2.11 (MEM stubs silencieux)

**Sauvegarde (4 MEDIUM)** : E5.4 (PokemonStorage), E5.12 (gSpecialVar), E5.13 (ClearTempFieldEventData), E5.14 (UseContinueGameWarp)

**Audio (4 MEDIUM)** : E7.2 (m4aClock), E7.9 (MapMusicMain), E7.15 (programmable wave), E7.16 (SE restoration timer)

**UI (5 MEDIUM)** : E6.3 (EXT_CTRL_CODE), E6.10 (party screen), E6.11 (bag screen), E6.13 (Pokédex), E6.15 (placeholders)

**Boot (3 MEDIUM)** : E1.3 (MapMusicMain — dup de E7.9), E1.5 (Link/RFU stubs), E1.8 (SetMainCallback2 state)

**Pattern** : les MEDIUM sont les plus nombreux et couvrent tous les domaines. Le pattern dominant est "infrastructure en place mais incomplète" plutôt que "absent totalement". Les partiels (party screen 50%, bag screen 55%, anim engine 30%) montrent du travail commencé mais fini à mi-chemin.

### LOW (30 erreurs)

Principalement des features post-MVP : contest/berry/decoration, safari/contest/link battles, tileset animations, field effects, transitions visuelles, debug-only features.

### TRIVIAL (5 erreurs)

Adaptations architecturales justifiées : ASLR, encryption, sector rotation, soft reset, mystery events.

### ✅ CORRECT (33 vérifications)

Les plus significatifs :
- TextPrinter 7-state machine 1:1 ✅
- Window system pixel buffer → 4bpp VRAM ✅
- Start menu 7 items 1:1 ✅
- Dual-slot save system (signature/counter/alternation) ✅
- Trainer card 1:1 décomp ✅
- Reverb chain 1:1 décomp ✅
- Noise LFSR hardware-accurate ✅
- Input polling newKeys/heldKeys ✅
- Font loading multi-font + align helpers ✅
- Asset extraction complète ✅

---

## 3. Analyse par domaine — couverture détaillée

### Boot + structure principale

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Flux de boot | 80% | ✅ Boot → intro → overworld fonctionnel |
| Loop principal | 70% | ⚠️ MapMusicMain absent, WaitForVBlank approximé |
| Input system | 95% | ✅ newKeys/heldKeys/keyRepeat 1:1 |
| Callback system | 85% | ✅ CB1/CB2/state machine, mais SetMainCallback2 state reset discutable |

### Decomp-bridge + script runtime

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Opcodes bytecode | 52% (120/231) | ⚠️ Critiques couverts, post-overworld absents |
| Script context | 100% | ✅ 1:1 décomp (STOPPED/BYTECODE/NATIVE, stack, data) |
| Bridge helpers | 85% (~200/240) | ✅ throw-not-stub strategy, MEM stubs silencieux (E2.11) |
| Vars/flags | 95% | ✅ string-keyed adaptation, zéro perte fonctionnelle |
| Specials table | 10% | ❌ ~400 specials C, une partie résolue via state machine, reste no-op |
| gSpecialVar | 60% | ⚠️ Result/LastTalked/Facing ✅, 0x8000..0x800B ❌ |

### Overworld + mouvement

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Player movement | 60% | ⚠️ walk/run ✅, bike/surf ❌, collision ~85% |
| Camera | 80% | ✅ scrolling/tilemap/circular buffer, post-warp smooth ❌ |
| Map loading | 70% | ✅ tilesets/palettes/layout, connections partielles |
| NPCs | 40% | ⚠️ spawn ✅, basic movement ✅, advanced types ❌, NPC↔NPC ❌ |
| Warps | 70% | ✅ 7/7 warp kinds, variants ❌ |
| Doors | 75% | ✅ anim/sound, exit callbacks partiels |
| Scripted movement | 30% | ⚠️ 15/50 actions (walk, face, move_to_pos) |
| Field effects | 25% | ⚠️ tall grass ✅, shadow ✅, ~12/16 effects ❌ |
| Tileset animations | 50% | ⚠️ water/grass ✅, lamp/TV/elevator ❌ |

### Système de combat

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Tutorial battle | 70% | ✅ damage core ✅, HP bar ✅, move menu ✅, EXP ✅ |
| Battle script interpreter | 5% | ❌ bytecode data existe, pas d'interpreter |
| Anim system | 30% | ⚠️ parser 40+/48 ✅, 300+ tags ✅, SE=0 ❌, templates vides ❌ |
| AI | 2% | ❌ premier move dommageant uniquement |
| Controllers | 0% | ❌ data auto-générée, protocol absent |
| Transitions | 10% | ⚠️ fade-to-black = 1/12 types |
| Post-battle | 20% | ⚠️ EXP/level-up ✅, evolution ❌ |
| Double battles | 0% | ❌ non supportés |
| Switch/items/run | 0% | ❌ non implémentés |
| Stat stages / crit / burn | 0% | ❌ fondamentaux manquants |

**⚠️ Le système de combat est le domaine le plus critique.** Le tutorial battle fonctionne mais l'architecture est fondamentalement divisée entre deux systèmes incompatibles (@pkmn/sim + state machine), et le battle script interpreter — cœur du système décomp — est absent.

### Sauvegarde + état

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Dual-slot system | 95% | ✅ signature/counter/alternation/checksum 1:1 |
| Save blocks | 85% | ✅ Block1/Block2 1:1, PokemonStorage ❌ |
| Save flow | 80% | ⚠️ PreSaveSync ✅, SaveObjectEvents ✅, SaveMapView ❌ |
| Load flow | 90% | ✅ LoadGameSave ✅, PostLoadApplyBlocks ✅, map guard ✅ |
| Flags/vars | 95% | ✅ string-keyed, 1:1 décomp sémantique |
| Special vars | 60% | ⚠️ Result/LastTalked/Facing ✅, 0x8000..0x800B ❌ |
| Temp/daily flags | 20% | ❌ ClearTempFieldEventData absent, daily reset absent |
| Continue warp | 50% | ⚠️ dynamicWarp ✅, UseContinueGameWarp ❌ |

### UI + texte + menus

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Text rendering | 90% | ✅ 7-state machine, glyph blit, down arrow, control codes partiels |
| Window system | 95% | ✅ CRUD, VRAM copy, frame drawing, scroll |
| Menu system | 85% | ✅ cursor input, Yes/No, list menus partiels |
| Start menu | 95% | ✅ 7 items, save flow, sub-screens, freeze NPCs |
| Party screen | 50% | ⚠️ 6 slots ✅, icons ✅, HP bar ❌, action menu ❌ |
| Bag screen | 55% | ⚠️ 5 pockets ✅, 3 windows ✅, icons ✅, context menu ❌ |
| Options menu | 90% | ✅ 7 options, highlight, save |
| Field message box | 90% | ✅ NORMAL mode, AUTO_SCROLL ❌ |
| Trainer card | 90% | ✅ BG layers, pic, badges, text |
| Pokédex | 15% | ⚠️ counters ✅, list/search/filter ❌ |
| Placeholders | 50% | ⚠️ ~15/~30 expander |

### Audio + ressources

| Sous-domaine | Couverture | Statut |
|-------------|-----------|--------|
| Audio pipeline | 40% | ⚠️ dual architecture, pas de m4aClock, scheduling MIDI |
| Voice types | 70% | ✅ square, noise, DS; ⚠️ programmable wave partiel |
| Voicegroups | 95% | ✅ ~100 extracted, keysplit tables, drumsets |
| Reverb/DAC/filter | 90% | ✅ reverb 1:1, DAC filter, limiter |
| MIDI playback | 60% | ⚠️ spessasynth/SF2 vs M4A native, SE restoration heuristic |
| Samples/cries | 70% | ✅ manifest, ⚠️ cries sans pitch shift |
| Asset extraction | 85% | ✅ MIDI, WAV, tiles, SF2 |
| Compositor | 60% | ✅ BG layers, ⚠️ OAM partiel, blending ❌ |

---

## 4.Problèmes transversaux (cross-cutting)

### C1 — Architecture dual non convergente (Battle + Audio)

**Battle** : deux systèmes parallèles (@pkmn/sim + state machine hand-written) qui n'ont aucun point de convergence. Le @pkmn/sim implémente la mécanique gen 8, pas gen 3. Le state machine est tutorial-only.

**Audio** : deux pipelines parallèles (spessasynth/SF2 pour BGM + custom Web Audio synth pour SE/noise) qui ne partagent pas le même scheduler. Le décomp a un unique M4A mixer à 6 channels + DirectSound.

**Impact** : ces deux divergences architecturales signifient que le path vers la fidélité 1:1 nécessite une réécriture, pas un incremental patch.

### C2 — Auto-generated data vs code exécuté

Le projet génère ~145 000 lignes de code auto à partir du décomp (battle data, callbacks, constants, bytecode). Mais une grande partie de cette data est **stockée mais non exécutée** :
- Battle scripts bytecode existe mais pas d'interpreter (E4.2)
- Controller callbacks auto-générés mais pas de protocol Emit/Recv (E4.8)
- Battle transition data existe mais pas câblée à un executor (E4.5)
- Evolution scene data existe mais non invoquée (E4.13)
- ~35 scripted movement actions auto-générées mais non dispatchées (E3.12)

**Impact** : l'infrastructure d'extraction est impressionnante mais sans les executors correspondants, cette data est morte. Le ratio "data extractée / data exécutée" est estimé à ~10-20% pour le battle et ~30% pour le scripted movement.

### C3 — Missing executor pattern

Beaucoup de systèmes suivent le pattern :
1. Data extraite du décomp ✅
2. Parser/extraction de la structure ✅
3. **Executor absent** ❌

Ceci s'applique aux battle scripts, aux specials, aux scripted movements, aux NPC movement types, aux field effects, et aux battle transitions. Le gap n'est pas dans la data mais dans l'exécution.

### C4 — State management dispersé

Le gameState singleton (`game-state.ts`) délege vers les save blocks, mais de nombreux systèmes maintiennent leur propre state local :
- `battle-flow.ts` a son propre state machine
- `runner.ts` a son propre @pkmn/sim state
- `start-menu.ts` a son own CB2 swap logic
- `m4a/player.ts` a son own song state
- Text printers ont leur own registry

**Impact** : pas de bug direct mais risque de drift entre les states. Le save system persiste les blocks mais pas le state battle, ni le state audio, ni le state text printer registry.

### C5 — Phasing gap — MVP vs 1:1 directive

Le projet semble viser deux objectifs en tension :
1. **MVP tutorial** : boot → intro → Littleroot → Starter → Birch battle → Route 101
2. **1:1 GBA** : fidélité totale au décomp pokeemeraude

Le MVP tutorial est **fonctionnel à ~70-80%** pour le path critique. Mais la 1:1 directive nécessite de combler tous les gaps identifiés, ce qui représente ~60% du travail restant.

---

## 5. Score global par domaine

| Domaine | Fidélité 1:1 | Fonctionnalité MVP | Maturité code |
|---------|-------------|-------------------|---------------|
| Boot + structure | 75% | 85% | ✅ Stable |
| Decomp-bridge + scripts | 55% | 70% | ✅ Stable, gaps connus |
| Overworld | 50% | 75% | ⚠️ Partiel mais fonctionnel |
| Battle | 20% | 60% (tutorial only) | ❌ Architecture divisée |
| Sauvegarde + état | 85% | 90% | ✅ Fidèle dual-slot |
| UI + texte + menus | 80% | 75% | ✅ Text/window excellents, screens partiels |
| Audio + ressources | 45% | 65% | ⚠️ Dual arch, voicegroups complets |
| **MOYENNE** | **55%** | **74%** | **Mixed** |

---

## 6. Plan d'action priorisé

### Phase 1 — Critiques (bloque le MVP tutorial)

| Priorité | ID | Effort | Description |
|----------|----|--------|-------------|
| P1 | E4.1 + E4.2 | **XXL** | Unifier l'architecture battle : choisir soit @pkmn/sim (adapter les gen 3 rules) soit state machine (implémenter l'interpreter). Implémenter le battle script interpreter (~100 commands). |
| P2 | E4.12 | **L** | Implémenter stat stages (-6/+6 pour 6 stats), critical hit multiplier, burn damage halving. Prérequis : P1 car ces mécanismes sont dans le battle script. |
| P3 | E2.1 | **XL** | Résoudre la table des specials (~400 fonctions). Au minimum : `Overworld_PlaySpecialMapMusic`, `StopMapMusic`, `Script_FadeOutMapMusic`, `Battle_StartBattle`. |
| P4 | E7.1 | **XL** | Converger les deux pipelines audio vers un seul scheduler M4A-like. Au minimum : unifier BGM et SE scheduling. |

### Phase 2 — Fonctionnalité overworld

| Priorité | ID | Effort | Description |
|----------|----|--------|-------------|
| P5 | E3.1 | **L** | Bike/surf movement states |
| P6 | E3.10 | **M** | Warp variants (hole, teleport, gym) |
| P7 | E3.12 | **L** | Scripted movement actions (~35 manquantes sur ~50) |
| P8 | E3.8 | **M** | NPC movement types (WANDER_UP_AND_DOWN, LOOK_DOWN_AND_UP, etc.) |
| P9 | E5.14 | **S** | UseContinueGameWarp + CONTINUE_GAME_WARP flag |
| P10 | E5.13 | **S** | ClearTempFieldEventData + daily flags reset |

### Phase 3 — Complétude

| Priorité | ID | Effort | Description |
|----------|----|--------|-------------|
| P11 | E6.10 + E6.11 | **M** | Party screen (HP bar, action menu, stats pages) + Bag screen (context menu, use logic) |
| P12 | E6.13 | **M** | Pokédex (list view, search, filter, summary) |
| P13 | E4.4 | **M** | Battle AI scoring (AI_ThinkingStruct) |
| P14 | E4.7 | **M** | Battle anim SE resolution + sprite templates |
| P15 | E4.10 | **M** | Switch/fuite/sac en combat |
| P16 | E7.9 + E1.3 | **M** | MapMusicMain (transitions BGM contextuelles) |

### Phase 4 — Fidélité 1:1

| Priorité | ID | Effort | Description |
|----------|----|--------|-------------|
| P17 | C2 + C3 | **XXL** | Câbler les ~145K lignes auto-générées à des executors (battle scripts, controllers, transitions, evolution, movements) |
| P18 | E7.2 | **L** | m4aClock + scheduling M4A tick 1:1 |
| P19 | E3.13 | **M** | Field effects complets (12/16 manquants) |
| P20 | E6.3 | **S** | EXT_CTRL_CODE variants (PLAY_BGM, etc.) |
| P21 | LOW/TRIVIAL | **S** | Les 30 findings LOW + 5 TRIVIAL |

---

## 7. Estimation d'effort

| Phase | Effort total | Durée estimée | Impact |
|-------|-------------|---------------|--------|
| Phase 1 — Critiques | XXL + L + XL + XL | 4-8 semaines | Render le tutorial battle fidèle + musique fonctionnelle |
| Phase 2 — Overworld | L + M + L + M + S + S | 3-5 semaines | Navigation complète Littleroot → Route 101+ |
| Phase 3 — Complétude | M × 6 | 4-6 semaines | Screens complets, AI, anim, items |
| Phase 4 — Fidélité 1:1 | XXL + L + M + S + S | 8-12 semaines | 1:1 GBA fidèle, tous les executors câblés |
| **TOTAL** | | **19-31 semaines** | **1:1 GBA complet** |

**MVP tutorial minimal** (boot → intro → Littleroot → starter → Birch battle → Route 101 walk) : Phase 1 partiel + Phase 2 partiel = **6-10 semaines**.

---

## 8. Risques

### R1 — Dette architecture battle

L'architecture dual battle (@pkmn/sim + state machine) est le risque le plus élevé. Les deux systèmes sont incompatibles et maintenir les deux en parallèle crée de la dette technique. Il faut choisir un chemin ET l'implémenter complètement.

**Recommandation** : abandonner @pkmn/sim au profit du state machine web + battle script interpreter. Le state machine est déjà aligné sur le rendering GBA (sprites, HP bars, terrain). L'interpreter exécute les scripts bytecode décomp directement. @pkmn/sim apporte la mécanique gen 8 qui diverge.

### R2 — Auto-generated data morte

Les ~145K lignes auto-générées créent un faux sentiment de couverture. Sans executors, cette data est inactive. Le ratio "extracté / exécuté" ~10-20% pour le battle est alarmant.

**Recommandation** : soit câbler les executors (battle interpreter, controller protocol, transition executor), soit arrêter de générer la data inutilisée pour réduire le surface area de maintenance.

### R3 — Drift state

Le state management dispersé (gameState, battle state, audio state, text printer registry) risque de créer des incohérences au save/load. Le save system persiste les blocks mais pas le state battle ou audio.

**Recommandation** : documenter explicitement quels états sont persistés vs volatiles. Ajouter un `PreSaveSyncAll` qui synchronise tous les states vers les save blocks.

### R4 — Audio dual pipeline

Le pipeline audio dual (spessasynth/SF2 + custom synth) est fonctionnel pour le MVP mais diverge du décomp. La convergence vers un M4A 1:1 nécessite de réimplémenter le mixer à 6 channels, le scheduling m4aClock, et les voice types programmable wave.

**Recommandation** : pour le MVP, garder le dual pipeline (il fonctionne). Pour la 1:1, réimplémenter le M4A mixer web. Le SF2 SoundFont est un excellent fallback pour les BGM mais ne remplacera pas le M4A pour les SE, le noise, et le timing précis.

### R5 — Context window exhaustion

Ce projet est trop volumineux pour un seul contexte de conversation. Les 7 audits ont consommé ~200K tokens. Les implémentations Phase 1-4 nécessiteront des sessions dédiées par domaine.

**Recommandation** : utiliser ces rapports d'audit comme_specification_ pour chaque phase de correction. Une session par domaine (boot, scripts, overworld, battle, save, UI, audio) avec le rapport correspondant comme input.

---

## 9. Conclusion

### Ce qui fonctionne remarquablement bien

1. **Text rendering** — le TextPrinter 7-state machine, le window system pixel buffer → 4bpp VRAM, et le font loading multi-font sont parmi les implémentations les plus fidèles au décomp. Qualité 1:1.
2. **Sauvegarde** — le dual-slot system avec signature/counter/checksum/alternation est 1:1 décomp. L'adaptation string-keyed pour flags/vars est judicieuse.
3. **Boot flow** — le path boot → intro → overworld est fonctionnel et aligné sur le décomp.
4. **Start menu** — les 7 items, le save flow, les sub-screens wiring sont complets.
5. **Voicegroups** — les ~100 voicegroups extraits du décomp sont complets avec keysplit et drumsets.
6. **Trainer card** — 1:1 décomp avec BG layers, gender-aware palette, badges.
7. **Assets extraction** — le pipeline MIDI + WAV + tiles + SF2 + JSON est complet.

### Ce qui doit être résolu en priorité

1. **Unifier l'architecture battle** — c'est le blocage numéro 1. Le choice entre @pkmn/sim et state machine doit être tranché et implémenté.
2. **Implémenter le battle script interpreter** — ~100 commands, c'est le cœur du système de combat décomp. Sans lui, les effets de moves, les stat stages, et la majorité des battle behaviors divergent.
3. **Câbler la table des specials** — ~400 fonctions C dont une partie critique (musique de map, wild encounters, effects).
4. **Converger l'audio** — unifier les deux pipelines ou documenter explicitement la stratégie dual pipeline comme choix architectural permanent.

### Verdict final

Le projet atteint **~55% de fidélité 1:1 décomp** en moyenne, avec des pointes à 95% (sauvegarde, text rendering, start menu) et des creux à 20% (battle). Le **MVP tutorial est fonctionnel à ~75%** mais avec des gaps visibles (battle tutorial simplifié, pas de musique contextuelle complète, NPCs comportement partiel).

L'investissement dans l'extraction de données auto-générées (~145K lignes) montre une ambition 1:1 mais sans les executors correspondants, cette data reste inactive. Le chemin vers la complétude passe par :
1. Fusionner les architectures duals (battle + audio)
2. Implémenter les interpreters/executors manquants
3. Câbler la data auto-générée
4. Finir les screens partiels (party, bag, Pokédex)

Le code de base est de bonne qualité : architecture modulaire, séparation concerns, stratégie throw-not-stub pour le bridge, adaptations web justifiées (string-keyed flags/vars, localStorage persistence). Le travail de fond (extraction de données, assets, voicegroups) est impressionnant.

---

*Fin de l'audit 8/8 — Synthèse globale*
*Audit complet terminé : 8 rapports, 109 findings, 5 HIGH, 35 MEDIUM, 30 LOW, 5 TRIVIAL, 33 ✅ CORRECT*

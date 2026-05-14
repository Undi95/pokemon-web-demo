# Vérification audit Qwen 3.6 27B — 2026-05-14

Audit Qwen lu : `qwenAudit/01..08-*.md`. Vérifié contre le code actuel par 7 explorations en parallèle.

## Verdict par finding

Notation :
- ✅ **CONFIRMÉ** : trouvé tel quel dans le code
- ❌ **FAUX** : Qwen s'est trompé, c'est déjà implémenté
- ⚠️ **PARTIEL** : ni complètement vrai ni complètement faux, à nuancer
- 🕐 **DATÉ** : c'était vrai à l'audit mais session 130 (≤ 3 jours) l'a corrigé

### TIER HIGH (Qwen)
| ID | Verdict | Note |
|----|---------|------|
| E2.1 specials table | ⚠️ PARTIEL | Music opcodes (playbgm, fadenewbgm, fadeoutbgm, fadeinbgm, fadedefaultbgm) **sont fonctionnels** dans script-opcodes.ts. `_specialHandlers` registry contient 137 specials + 54 stubs = ~191/400. gotonative/callnative réellement absents. ⚠️ Qwen exagère le scope. |
| E4.1 dual battle | ✅ CONFIRMÉ | `src/battle/runner.ts` utilise `@pkmn/sim`, `src/engine/battle-flow.ts` est tutorial-only (commentaire explicite ligne 2-33). Non convergents. |
| E4.2 battle script interpreter | ✅ CONFIRMÉ | Bytecode `battle_scripts_1/2-bytecode.ts` extrait (~100 commands data), aucun executeCmd/interpreter. battle-flow.ts bypass tout. |
| E4.12 stat stages/crit/burn | ✅ CONFIRMÉ | battle-flow.ts:30-31 commentaire explicite "Pas de crits". Aucun statStages tracking. STATUS1_BURN handler absent du damage calc. |
| E7.1 dual audio | ✅ CONFIRMÉ | player.ts:24 import spessasynth + custom synth (playNoteNoiseLFSR ligne 548). Deux pipelines parallèles. |

### TIER MEDIUM (Qwen)
| ID | Verdict | Note |
|----|---------|------|
| E1.3 MapMusicMain dans tick | ⚠️ PARTIEL | Fonction existe dans `auto-engine/src/sound-engine.ts`, mais pas appelée dans decomp-runtime.ts tickFixed (lignes 1899-2048). À câbler. |
| E1.5 Link/RFU stubs | ❌ FAUX | HandleLinkConnection, InitRFU, gLinkTransferringData tous stubés proprement (link-engine.ts, link_rfu_2-engine.ts). |
| E1.8 SetMainCallback2 reset state | ✅ 1:1 | decomp-runtime.ts:1432-1435 reset gMain.state = 0 — 1:1 décomp. |
| E2.2 compare variants | ✅ CONFIRMÉ | Seul `compare` (= var_to_value) implémenté. 7 autres variants absents. Impact low car cas majoritaire couvert. |
| E2.6 warp variants | ⚠️ PARTIEL | warphole/warpteleport/warpmossdeepgym/setwarp **stubés ou absents**. setdivewarp/setholewarp stubés. warp/warpsilent/warpwhitefade/warpdoor/setdynamicwarp/setescapewarp ✅. |
| E2.8 weather/clock | ⚠️ PARTIEL | initclock/resetweather absents. dotimebasedevents/doweather stubs no-op (TODO). setweather stocke sans effet visuel. |
| E2.11 MEM stubs silencieux | ✅ CONFIRMÉ | gba-global-scope.ts:527-534 — no-op sans warning console. |
| E3.1 bike/surf/underwater | ✅ CONFIRMÉ | player-avatar.ts:13-14 commentaire "Pas de bike", "Pas de surf". Aucun PLAYER_AVATAR_FLAG_SURFING. |
| E3.5 CONNECTION_INVALID | ✅ CONFIRMÉ | checkPlayerCollision (player-avatar.ts:522-583) ne check pas GetMapBorderIdAt CONNECTION_INVALID. |
| E3.8 NPC movement types | ⚠️ EXAGÉRÉ | 31 types implémentés (object-events.ts:898-1005). ~15-20 manquants : FACE_PLAYER, JUMP_AROUND, WAVE, HOLD_FISHING_ROD, SLIDE_AND_STAND_STILL, RUN_IN_CIRCLE_FEROCIOUSLY. Pas "20 missing" comme Qwen dit. |
| E3.12 scripted movement | ⚠️ EXAGÉRÉ | 159 actions dans movement-actions.json (pas 50 total comme Qwen dit). ~20-30 manquants : Bounce, Shake, Spin, QuakeHead, Shrink, Grow. |
| E3.15 OnBButton | ✅ CONFIRMÉ | script-runtime.ts:628-649 — pas de OnBButton coord triggers. |
| E4.4 AI absente | ✅ CONFIRMÉ | battle-flow.ts:396-404 — pickOpponentMove premier move dommageant. |
| E4.5 transitions fade | ✅ CONFIRMÉ | 1 transition fade-to-black vs 12 décomp. |
| E4.7 anim engine partiel | ✅ CONFIRMÉ | Parser 40+/48 OK, SE=0 hardcoded, templates vides. |
| E4.8 controllers absent | ✅ CONFIRMÉ | Auto-gen data existe, pas de protocol Emit/Recv. |
| E4.9 double battles | ✅ CONFIRMÉ | Non supportés. |
| E4.10 switch/fuite/sac | ✅ CONFIRMÉ | battle-flow.ts:33 commentaire explicite. |
| E4.13 evolution | ✅ CONFIRMÉ | Level-up détecté, evolution scene non câblée. |
| E5.4 PokemonStorage | ✅ CONFIRMÉ | Interface défini (save-blocks.ts:1204) mais **pas ajouté à SaveBlock1 ni SaveBlock2**. PC boxes architecturalement non persistées. |
| E5.5 Hall of Fame | ❌ FAUX | save-data.ts contient SECTOR_ID_HOF_1/2/TRAINER_HILL/RECORDED_BATTLE. save-engine.ts read/write SAVE_HALL_OF_FAME implémenté. |
| E5.8 SaveMapView | ❌ FAUX | Implémenté dans map-loader.ts, appelé depuis field-camera.ts/save-engine.ts/start_menu-engine.ts. |
| E5.12 gSpecialVar | ⚠️ PARTIEL | VAR_0x8000-8002 wired (script-opcodes.ts:958-960). 0x8003..0x800B usage edge cases à vérifier au cas par cas. |
| E5.13 ClearTempFieldEventData | ✅ CONFIRMÉ | Absent du codebase. ClearDailyFlags constants présentes mais pas exécuté. |
| E5.14 UseContinueGameWarp | ❌ FAUX | Implémenté (load_save.ts:229-233). Wiré au resume (game-state.ts:131-133). |
| E6.3 control codes | ✅ CONFIRMÉ | Manquants : FONT (0x06), WAIT_SE (0x0B), PLAY_BGM (0x0C), ESCAPE (0x0D), COLOR_HIGHLIGHT_SHADOW (0x0E), VAR (0x15), SPECIAL (0x16). |
| E6.10 party screen | 🕐 DATÉ | HP bar fill (party-screen.ts:544-582) + action menu RESUME/OBJET/RETOUR (1092-1196) **implémentés session 130** (commits 52083dc2, 69c7d676). Reste : status icon, held item icon, stats pages flip. |
| E6.11 bag screen | 🕐 DATÉ | Context menu implémenté. Quantity selector visible. Use logic partial (heal/throw OK, teach move TODO). |
| E6.13 pokédex | ✅ CONFIRMÉ | pokedex-screen.ts:1-113 — counters uniquement, pas de list/search/filter/summary. |
| E6.15 placeholders | ⚠️ PARTIEL | {STR_VAR_1-3}, {PLAYER}, {RIVAL}, {KUN}, {VERSION}, {POKEBLOCK} implémentés. {BIRCH}/{STARK}/{MAI}/{ROUTE}/{TOWN} non utilisés dans les scripts du jeu (l'extracteur les a déjà résolus statiquement). |
| E7.2 m4aClock | ✅ CONFIRMÉ | Zéro occurrence dans code. Scheduling 100% spessasynth Sequencer + Web Audio scheduling. |
| E7.9 MapMusicMain | ⚠️ MEME que E1.3 — fonction existe, pas câblée per-frame. |
| E7.15 programmable wave | ⚠️ TECHNIQUE | DFT 16-harmonic implémenté (programmable-wave.ts:20-42). Limitation Nyquist à 32 samples vs ROM original ≤64. **Code complet**, juste hardware-constrained. |
| E7.16 SE restoration | ✅ CONFIRMÉ | music.ts:113-149 — `window.setTimeout(song.duration * 1000 + 250)` workaround. |

### TIER LOW (la plupart correctement identifiés par Qwen)
| Domaine | État |
|---------|------|
| E2.3-2.5 mystery/contest/berry/decoration opcodes | Absents (post-MVP) |
| E2.7 money/coins box UI | Stub no-op |
| E2.9 lockfortrainer | Stub |
| E2.10 buffercontestname/vbuffermessage | Absents |
| E3.7 LOCALID_FISHING/BERRY_GLASSES | Absents |
| E3.13 field effects | ~12/16 absents |
| E3.14 tileset animations | Lamp/TV/elevator absents |
| E4.11 battle messages | 20 inline vs 300+ string IDs |
| E4.14 weather in battle | Absent |
| E4.15 safari/contest/link | Absents |
| E6.2 FONT_BOLD/BRAILLE | Absents |
| E7.10 cry pitch shift | Absent |

## Bilan global

**Findings Qwen précis (vrais)** : ~75% (75/109)
**Findings exagérés ou imprécis** : ~15% (E3.8, E3.12 sous-évaluent ce qui existe ; E2.1 surévalue le scope ; E5.5/5.8/5.14/1.5 sont en fait OK ; E6.10/E6.11 sont datés)
**Findings carrément faux** : ~5%
**Findings techniques à nuancer** : ~5%

Qwen 27B est **utile comme baseline** mais doit être vérifié systématiquement. Sa structure de score globale (55% fidélité 1:1) est approximativement correcte.

## Ce qu'il faut vraiment corriger (post-vérification)

Voir `ROADMAP-FUTURE-PROOF-2026-05-14.md`.

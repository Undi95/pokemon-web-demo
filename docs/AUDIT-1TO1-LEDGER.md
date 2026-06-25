# Ledger 1:1 — LA PASSE FINALE (chaque fichier, documenté)

> Directive user (2026-06-25, dite 6×) : **« c'est la DERNIÈRE FOIS, tu passes sur TOUT,
> documenté. Je veux plus y retoucher. »** Confiance totale donnée. Ce ledger est le
> contrat de complétude : chaque fichier reçoit **UN** passage, tamponné, et n'est
> **jamais re-visité**. Carte de la dette = [AUDIT-1TO1-CENSUS.md](AUDIT-1TO1-CENSUS.md).

## Règles de la passe
- **Ordre forcé** (substrat avant feuilles) : tronc → primitives partagées → écrans → field/overworld → battle → pokémon/data → dédup transverse. Auditer une feuille contre un substrat non-1:1 = règle tordue.
- **Définition de « fait »** : confronté ligne à ligne à la décomp (`D:/Projet 1/decomps/pokeemeraude`), écarts corrigés 1:1, **vérifié** (tsc=0 + sonde déterministe / en jeu si rendu), commité (FR + trailer). Puis tampon ✅ — **on ne rouvre plus**.
- **Statuts** : ⬜ à faire · 🔍 en cours · ✅ 1:1 vérifié+commité · ⊘ hors-scope (raison).
- Un écran = une **task décomp qui se passe le témoin `.func`**, JAMAIS une state-machine maison (cf. mémoire `contract-substrate-first-baton-tasks`).

---

## A. SUBSTRAT (le tronc) — ce dont tout dépend
| Item | Statut | Commit / note |
|---|---|---|
| `task.c` (scheduler : gTasks[16], priorité, témoin .func) | ✅ | `eed1850b` — vérifié boot/OW/shop/combat |
| `main.c` / `gMain` / CB2 loop / `gFieldCallback` | ⬜ | confronter MainCB2/RunTasks/callback2 |
| `malloc.c` (Alloc/Free — adapté JS GC) | ⬜ | vérifier que les appelants ne fuient pas |

## B. PRIMITIVES PARTAGÉES (menu_helpers / menu / text / window / sprite)
| Item | Statut | Commit / note |
|---|---|---|
| `CreateYesNoMenuWithCallbacks` + `Task_CallYesOrNoCallback` + `DoYesNoFuncWithChoice` | ✅ | `9a2e483d` — porté + câblé shop (vérifié en jeu) |
| `DisplayMessageAndContinueTask` + `Task_ContinueTaskAfterMessagePrints` + `RunTextPrintersRetIsActive` | ✅ | `773e5eb6` — porté (menu_helpers.c, pas menu.c) ; câblage écrans = à suivre |
| `DisplayItemMessageOnField` (item_menu.c) | ⬜ | dialogue de terrain + continuation |
| `menu.c` (CreateYesNoMenu/frames/Print*) — ratio 0.49, à compléter | ⬜ | confronter les fns manquantes |
| `text.c` (ratio 0.55) | ⬜ | RunTextPrinters / AddTextPrinter* complétude |
| `menu_helpers.c` (ratio 0.47) | 🔍 | yes/no fait ; reste à confronter |

## C. ÉCRANS (à convertir en task-témoin, supprimer les machines maison)
| Écran | Statut | Note |
|---|---|---|
| `shop.c` | 🔧 | yes/no ✅ + messages ✅ via primitives partagées (témoin) ; `ShopSubState` réduit 8→5 ; reste qty/list/exit → baton complet |
| `player_pc.c` (40 `sSubState` + yes/no recodé) | ⬜ | câbler sur la primitive + baton |
| `start_menu.c` (24 `sSubState`) | ⬜ | baton |
| `item_menu.c`→bag (item_menu.c absent homonyme, porté bag-screen/bag-menu) | ⬜ | yes/no recodé → primitive |
| `naming_screen.c` · `main_menu.c` · `region_map.c` · `summary_screen`→summary-screen · `pokedex`→pokedex-screen · `party_menu`→party-screen · `trainer_card.c` · option_menu | ⬜ | confronter 1:1 + baton |

## D. FIELD / OVERWORLD (bloat-code réel + complétude)
| Item | Statut | Note |
|---|---|---|
| `field_effect_helpers.c` (code 1.91 = vraie dup/glue) | ⬜ | dégonfler vers 1:1 |
| `script_movement.c` (code 1.91) | ⬜ | idem |
| `field_camera.c` 1.25 · `fieldmap.c` 1.36 · `scrcmd.c` 1.43 · `field_door.c` 1.44 | ⬜ | confronter le surplus |
| `field_player_avatar.c` (code 1:1 exact — JSDoc) | ✅* | *taille OK ; spot-check au toucher |
| `event_object_movement.c` (ratio 0.95) · `field_effect.c` (éclaté) · `overworld.c` (noms glue) | ⬜ | confronter + renommer 1:1 |

## E. BATTLE
| Item | Statut | Note |
|---|---|---|
| `battle_main.c` · `battle_script_commands.c` · controllers · `battle_anim_*` · `battle_message.c` (0.18) · `battle_transition.c` (0.18) | ⬜ | gros bloc ; confronter par sous-module |

## F. POKÉMON / DATA
| Item | Statut | Note |
|---|---|---|
| `pokemon.c` (éclaté pokemon.ts + party-storage.ts — porté) | ⬜ | confronter + ranger au chemin 1:1 |
| `item.c` (cœur porté, ratio 0.11 trompeur) | ⬜ | compléter les fns manquantes |
| Tables `-data` / `-auto` (générées) | ⊘ | données, pas de la dette de code |

## G. DÉDUP TRANSVERSE (globals + sous-systèmes dupliqués)
| Item | Statut | Note |
|---|---|---|
| `gCamera` (fieldmap.ts:325 **vs** field_camera.ts:129 = 2 objets) | ⬜ | unifier sur 1 store (field_camera = foyer décomp) |
| `gTrainerBattleOpponent_B` (battle_setup.ts:92 **vs** engine/battle/state.ts:743) | ⬜ | unifier |
| 2 sous-systèmes sprites object-event (overworld INLINE vs menu) | ⬜ | chantier archi (cf. graphics-1to1-verifier) |

## H. HORS-SCOPE (explicite — PAS de la dette à corriger)
- **Link / RFU / Union Room** : `link.c`, `librfu_rfu.c`, `link_rfu_2.c`, `union_room(_chat).c`, `trade.c`, `match_call.c` — single-player FR, maps injoignables, conditions toujours fausses.
- **Battle Frontier / post-game** : `battle_dome/tower/factory_screen/pyramid.c`, `frontier_util.c`, `contest(_util).c` — contenu endgame non atteint.
- **Minijeux** : `slot_machine.c`, `roulette.c`, `berry_blender/crush.c`, `dodrio_berry_picking.c`, `pokemon_jump.c`.
- **Cutscènes spéciales** : `rayquaza_scene.c`.
- ⚠️ Ces fichiers restent listés ici pour la **traçabilité** (« on a décidé sciemment de ne pas les porter »), pas oubliés.

---

## Journal (paliers vérifiés)
- 2026-06-25 — Tronc task 1:1 (`eed1850b`) · recensement (`30be0305`) · primitive yes/no + câblage shop (`9a2e483d`) · ledger (`2a2eb4bf`) · primitive message (`773e5eb6`) · câblage messages shop + dédup, vérifié multi-contextes shop/start-menu/Littleroot/combat (`2cd0f8b5`).

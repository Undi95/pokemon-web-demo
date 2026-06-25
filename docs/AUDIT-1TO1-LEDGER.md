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
| `main.c` / `gMain` / CB2 loop / `gFieldCallback` | ✅ | **Audité 2026-06-25** : `gMain` (harness/runtime, Proxy→`rt().gMain`) + boucle CB2 + callbacks interruption = **couche harness runtime, hors-1:1 par contrat** (modèle les champs que la logique lit : state/callbacks/keys/inBattle ; pas de bug). Partie game-logic = `gFieldCallback` **câblé+vivant** (12 fichiers : shop/player_pc/bag/warp/teleport/item_use…). Cœur = scheduler porté 1:1 (`eed1850b`). → rien à corriger. |
| `malloc.c` (Alloc/Free — adapté JS GC) | ⬜ | vérifier que les appelants ne fuient pas |

## B. PRIMITIVES PARTAGÉES (menu_helpers / menu / text / window / sprite)
| Item | Statut | Commit / note |
|---|---|---|
| `CreateYesNoMenuWithCallbacks` + `Task_CallYesOrNoCallback` + `DoYesNoFuncWithChoice` | ✅ | `9a2e483d` — porté + câblé shop (vérifié en jeu) |
| `DisplayMessageAndContinueTask` + `Task_ContinueTaskAfterMessagePrints` + `RunTextPrintersRetIsActive` | ✅ | `773e5eb6` — porté (menu_helpers.c, pas menu.c) ; câblage écrans = à suivre |
| `DisplayItemMessageOnField` (item_menu.c) | ⬜ | dialogue de terrain + continuation |
| `menu.c` (CreateYesNoMenu/frames/Print*) — ratio 0.49, à compléter | ⬜ | confronter les fns manquantes |
| `text.c` (ratio 0.55) | ⬜ | RunTextPrinters / AddTextPrinter* complétude |
| `menu_helpers.c` (ratio 0.47) | 🔧 | Parties pures 1:1 ✅. **`ResetVramOamAndBgCntRegs` DÉDUP ✅** (`9a17dbaa`+`7f7556de`+`13f9e68d`+`5c19ea0f`) : 1 fn partagée (gba-window-system) ← 6 écrans, A/B 4 contextes, bug latent bag-menu (clear PLTT RAM manquant) corrigé. ⚠️ trainer_card/wallclock = NON appelants 1:1 (band-aid pré-existant, commentaires honnêtes `48186030`, dette fidélité ci-dessous). **`ResetAllBgsCoordinates` DÉDUP ✅** (`e179617d`) : fn partagée ← summary/party/bag (= les 3 appelants décomp réels), A/B 3 contextes. EXCLUS (call-graph vérifié) : shop (`BuyMenuInitBgs` préserve VRAM), starter_choose (OAM-save), trainer_card, option-menu-return. **Reste (valeur+++faible)** : `SetVBlankHBlankCallbacksToNull` (inline = VBlank only, dédup marginal). Swap-line sprites = relocalisés `engine/field/swap-line.ts`. |
| 🩹 **Dette fidélité** : trainer_card/wallclock clear VRAM/OAM/PLTT complet inline | ⬜ | Band-aid anti-leak palette inter-écran ; la décomp ne fait PAS ce clear (ResetBgsAndClearDma3+InitBgsFromTemplates). Examiner s'il est retirable une fois la sortie d'écran amont 1:1 (= vraie cause du leak). Dédupé via fn partagée en attendant. |

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
| `item.c` (cœur porté, ratio 0.11 trompeur) | 🔧 | **`CountTotalItemQuantityInBag` nommée 1:1 ✅** (`f1cb1d40`) : était collapsée sous le nom menteur `GetBagItemQuantity` (= l'accesseur mono-slot, item.c:26) + citation fausse → renommée/transcrite (item.c:676), shop aligné sur shop.c:1034, sonde déterministe (somme multi-slot 153=99+54). **Reste manquantes** : SetBagItemQuantity, ApplyNewEncryptionKeyToBagItems, CopyItemNameHandlePlural, GetBerryCountString, IsBagPocketNonEmpty, HasAtLeastOneBerry, GetPocketByItemId, ClearItemSlots, SwapRegisteredBike (confronter au toucher). |
| Tables `-data` / `-auto` (générées) | ⊘ | données, pas de la dette de code |

## G. DÉDUP TRANSVERSE (globals + sous-systèmes dupliqués)
| Item | Statut | Note |
|---|---|---|
| `gCamera` (fieldmap.ts **vs** field_camera.ts = 2 objets) | ✅ | `field_camera` importe+ré-exporte celui de fieldmap (foyer décomp fieldmap.c:30) = 1 store ; corrige désync field_tasks. Vérifié multi-cartes. |
| `gTrainerBattleOpponent_B` (battle_setup.ts:92 **vs** engine/battle/state.ts:743) | ✅ | `1e2f1538` — store unique state.ts ; battle_setup propage via `setTrainerBattleOpponentB` (= schéma _A) + getter live `__battleState`. Corrige désync : moteur lisait 0 (2e équipe/argent/AI/nom dresseur B en double 2-adv.). Vérifié déterministe Maxie/Tabitha (A=734, B=514, indép.). |
| `gSaveBlock1Ptr` / `gSaveBlock2Ptr` (3 « définitions » chacun — flag census) | ✅ | **Faux positif confirmé, aucun changement** : 1 **Proxy SANS état** (save-block-state.ts:72/89 délègue à `GetSaveBlock1/2()` foundation unique) + 2 re-exports propres (save.ts:685/688, gba-menu-system.ts:172/173). Désync impossible par construction. *(Annexe RÉSOLUE 2026-06-25 : le slot DI `_gSaveBlock1Ptr` d'`easy-chat-render.ts` n'est PAS un leak isolé — tout le module = écran Easy Chat saisie **NON-CÂBLÉ** (0 importeur, ~moitié stubs, port WIP tracé DETTES). Décision user : LE LAISSER (porter 1:1 plus tard, pas charcuter). Statut documenté en tête du fichier. Easy Chat vivant = `easy_chat.ts`.)* |
| 2 sous-systèmes sprites object-event (overworld INLINE vs menu) | ⬜ | chantier archi (cf. graphics-1to1-verifier) |
| 2 implémentations **bag** (`bag-screen.ts` vs `bag-menu.ts`) | ⬜ | ⚠️ **CORRECTION (campagne strings, branche finale, `c879c01b`)** : bag-screen **N'EST PAS mort**. Vérif des importeurs : `OpenBagScreen`/`BAG_LOCATION_ITEMPC` importés DYNAMIQUEMENT par `battle_controller_player.ts:1835` (objet en combat) ET `player_pc.ts:623` (PC objets). La migration étape 9 n'a JAMAIS fini → bag-screen sert ENCORE le combat-item + item-PC. **Le supprimer casserait 2 chemins.** L'ancienne note (« logique d'écran MORTE ») était fausse. Vrai chantier = finir la migration (router combat+PC sur bag-menu) AVANT toute suppression. (bag-menu sert start_menu/shop-sell.) |

## H. HORS-SCOPE (explicite — PAS de la dette à corriger)
- **Link / RFU / Union Room** : `link.c`, `librfu_rfu.c`, `link_rfu_2.c`, `union_room(_chat).c`, `trade.c`, `match_call.c` — single-player FR, maps injoignables, conditions toujours fausses.
- **Battle Frontier / post-game** : `battle_dome/tower/factory_screen/pyramid.c`, `frontier_util.c`, `contest(_util).c` — contenu endgame non atteint.
- **Minijeux** : `slot_machine.c`, `roulette.c`, `berry_blender/crush.c`, `dodrio_berry_picking.c`, `pokemon_jump.c`.
- **Cutscènes spéciales** : `rayquaza_scene.c`.
- ⚠️ Ces fichiers restent listés ici pour la **traçabilité** (« on a décidé sciemment de ne pas les porter »), pas oubliés.

---

## Journal (paliers vérifiés)
- 2026-06-25 — Tronc task 1:1 (`eed1850b`) · recensement (`30be0305`) · primitive yes/no + câblage shop (`9a2e483d`) · ledger (`2a2eb4bf`) · primitive message (`773e5eb6`) · câblage messages shop + dédup, vérifié multi-contextes shop/start-menu/Littleroot/combat (`2cd0f8b5`) · dédup gCamera (bucket G), 1 seul store, vérifié Littleroot/Route101/warp.
- 2026-06-25 (suite) — dédup `gTrainerBattleOpponent_B` (bucket G, `1e2f1538`) : 2 `let` → store unique state.ts, battle_setup propage (schéma _A) + getter live `__battleState`. **Vrai bug corrigé** : le moteur combat lisait toujours 0 (state.ts jamais écrit) → 2e équipe / argent / AI flags / nom dresseur B cassés en double 2-adversaires. Vérif déterministe en jeu (opcode `trainerbattle` SET_TRAINER_A/B, Maxie=734 / Tabitha=514, propagation indépendante, zéro contamination) ; tsc=0 ; cold boot 0 erreur.
- 2026-06-25 (suite) — audit `gSaveBlock1Ptr`/`gSaveBlock2Ptr` (bucket G) : **faux positif** (le « 3 fichiers » du census = 1 Proxy stateless + 2 re-exports). Désync impossible par construction → flag résolu, aucun code touché. Census mis à jour. Annexe : scaffolding DI mort dans `easy-chat-render` flaggé en chip.
- 2026-06-25 (suite) — confrontation `menu_helpers.c` (bucket B) : parties pures 1:1 ✅ ; identifié le gap = 3 helpers init VRAM dupliqués inline ×7 écrans (cible dédup, rendering transverse → différée car A/B par écran requis, pas solo-safe) ; swap-line sprites relocalisés. Audit only (pas de code touché).
- 2026-06-25 (suite) — chip easy-chat-render résolu (`2cb7786c`) : module entier non-câblé (0 importeur, port WIP tracé DETTES) → décision user = laisser, statut documenté en tête de fichier. Puis audit bucket A : `gMain`/CB2/interruptions = harness runtime hors-1:1 ; `gFieldCallback` câblé+vivant ; scheduler porté → bucket A rien à corriger. Audit only.
- 2026-06-25 (suite) — **VENTE au Mart 1:1** (bucket C item_menu, `035cb171`) : feature morte (« Vendre » rouvrait le menu) → chaîne baton complète portée (Task_ItemContext_Sell→…→SellItem→WaitAfterItemSell, dispatch sContextMenuFuncs[SHOP], CB2_GoToSellMenu/ExitSellMenu). **2 improvisations corrigées sur retour user (A/B vs VBA)** : (1) message dans WIN_DESCRIPTION → **vraie message box encadrée** (DisplayItemMessage/CloseItemMessage/AddItemMessageWindow + DisplayMessageAndContinueTask) ; (2) phrases FR inline → **strings EXTRAITS** (gText_HowManyToSell/ICanPayVar1/TurnedOverVar1ForVar2/CantBuyKeyItem, avec `¥`). + **label « ARGENT » porté dans money.ts** (= money.c, AddMoneyLabelObject/RemoveMoneyLabelObject/PreloadMoneyLabelAsset ; shop dédupé) + fix digit `BAG_ITEM_CAPACITY_DIGITS` (doublon local 3 → canonique 2, « ×01 »). Vérifié en jeu (clerc Mossdeep) : qty1/qty>1/annuler/objet-clé invendable, ARGENT shop+sac. **Leçon (contrat) : j'avais improvisé message+strings ; c'est l'œil du user qui l'a attrapé. Transcrire, pas bricoler.**
- 2026-06-25 (suite) — **`CountTotalItemQuantityInBag` nommée 1:1** (bucket F, `f1cb1d40`) : nom-qui-ment dans la fondation sac. La décomp distingue l'accesseur mono-slot `GetBagItemQuantity(u16 *quantity)` (item.c:26) du compteur `CountTotalItemQuantityInBag(u16 itemId)` (item.c:676, somme tous les slots) ; notre port les avait fusionnés sous le nom du premier + citation fausse (item.c:120-132). Renommée + transcrite 1:1, shop câblé sur shop.c:1034 (fenêtre « SAC: x » achat), 2 appelants alignés. Sonde déterministe : 3 SUPER_POTION +150 → 2 slots 99+54, total **153** (somme multi-slot ; mono-slot aurait donné 99), CheckBagHasItem délègue, nettoyage pristine + POTION témoin intact. tsc=0, cold boot 0 erreur. Comportement inchangé = fix de fidélité, pas de bug.
- 2026-06-25 (suite) — **DÉDUP `ResetVramOamAndBgCntRegs`** (bucket B, 4 commits `9a17dbaa`/`7f7556de`/`13f9e68d`/`5c19ea0f`) : la grosse dup d'init d'écran (« on recode 900× ») → 1 fn partagée gba-window-system ← 6 écrans. **A/B 4 contextes en jeu** (résumé/carte dresseur/sac/party menu) tous rendus identiques. **Bug latent corrigé** : bag-menu (le bag LIVE) avait un clear PLTT RAM manquant. Découvertes : (1) bag-screen.ts = **module supplanté** (seuls preloadBagAssets/initItemIconMap vivants ; bag LIVE = bag-menu) = dette « 2 implémentations bag » distincte ; (2) shop/starter_choose/option-menu-return = exclus à raison (fonctions décomp différentes).

# Audit fleet 1:1 — domaine « items-berry-smallc »

> READ-ONLY. Source de vérité = décomp `D:/Projet 1/decomps/pokeemeraude/src`. Notre repo = `D:/Projet 1/pokemon-web-demo`.
> Dénominateurs de fonctions = ceux du cartograph (`audit-reports/1to1/cartograph.json`, autoritaires). Les agents ont parfois compté autrement — je réconcilie sur le cartograph.
> Date : 2026-07-02. Branche `Byte-VM`.

## Constat transversal DOCTRINE (le plus important)

Le domaine items/baies/petits-systèmes est le terrain où la doctrine **miroir strict** (`fichier.c` → `src/fichier.ts`, mêmes fns, mêmes globals) est la **moins respectée** — non par bâclage, mais par un choix d'architecture antérieur :

1. **Modèle de stockage divergent (items).** La décomp stocke les objets dans `struct ItemSlot { u16 itemId; u16 quantity; }` XOR-chiffrés (`GetBagItemQuantity`/`SetBagItemQuantity` + `ApplyNewEncryptionKeyToBagItems`). Notre portage utilise un modèle **clé-string** `{ itemKey: string; quantity }` et **ZÉRO chiffrement** (`SetBagItemQuantity`, `ApplyNewEncryptionKeyToBagItems`, `ApplyNewEncryptionKeyToBerryPowder` = **ABSENTS**). L'algorithme d'`AddBagItem`/`RemoveBagItem` est transcrit ligne-à-ligne (rollback via copie de travail, passes 1/2, no-dup TM-HM/Berries) mais sur un substrat structurellement différent.
2. **Logique dispersée hors du foyer 1:1.** `item.c` (52 fns) est éclaté : accesseurs → `item.ts` (8 fns, lisent une data-table FR `harness/runtime/data-tables`), gestion sac → `engine/bag/bag.ts` + `bag-pockets.ts`, PC-items → `engine/pokemon/pc-items.ts`. `item_use.c` (74 fns) → dispatch en `switch` géant dans `item_menu.ts` + callbacks dans `item_use.ts` (renommé « item-use-callbacks »). Les `ObjectEventInteraction*` de `berry.c` → handlers dans `specials-registry.ts`.
3. **Pattern « specials accessors ».** Pour les gros écrans absents (mauville_old_man, lilycove_lady, pokeblock, berry_powder, tv), le **state/logic** est porté 1:1 comme `registerSpecial('…')` dans `specials-registry.ts` (ce que le solo lit via scripts), et seul l'**écran/UI** est stubbé. Conforme au mandat « porte ce que le solo UTILISE ».

Conséquence : `compl(fichier)` du cartograph **sous-estime** systématiquement la réalité fonctionnelle de ce domaine (regarder `compl(partout)` + les specials).

---

## item.c → src/item.ts
Statut : 🔴 DIVERGENT (structurel — logique présente mais dispersée + substrat non-1:1)
Fonctions : 8/52 dans le foyer ; ~29/52 « partout » (cartograph). Ailleurs :
- Sac : `AddBagItem`, `RemoveBagItem`, `CheckBagHasItem`, `CheckBagHasSpace`, `CountTotalItemQuantityInBag`, `ClearBag`, `GetBagItemQuantity` → `engine/bag/bag.ts`
- Pockets : `CompactItemsInBagPocket`, `SortBerriesOrTMHMs`, `BagGetItemIdByPocketPosition`, `MoveItemSlotInList` → `engine/bag/bag-pockets.ts`
- PC : `AddPCItem`, `RemovePCItem`, `CheckPCHasItem`, `CompactPCItems` → `engine/pokemon/pc-items.ts`
- `GetPocketByItemId`, `CopyItemNameHandlePlural` → `scrcmd.ts` · `CopyItemName` → `item_menu.ts` · `SwapRegisteredBike`, `IsBagPocketNonEmpty` → `specials-registry.ts`

item.ts (108 l) = 8 accesseurs seulement : `GetItemName`, `GetItemDescription`, `GetItemImportance`, `GetItemFieldFunc`, `GetItemType`, `GetItemSecondaryId`, `GetItemPrice`, `GetItemPocket`. Vrais corps mais lisent `data-tables` FR par clé-string, **pas** `gItems[SanitizeItemId(itemId)].champ` (retournent des strings FR/labels, pas les u8/u16 du struct).

Manquantes (foyer) [vivant] : `SetBagItemQuantity`, `ApplyNewEncryptionKeyToBagItems` (chiffrement — VOLONTAIREMENT non porté, modèle string), `HasAtLeastOneBerry` (porté ailleurs — grep=specials-registry commentaire l.2030), `GetItemHoldEffect`, `GetItemHoldEffectParam`, `GetItemImportance`(struct), `GetItemRegistrability`, `GetItemBattleUsage`, `GetItemBattleFunc`, `SanitizeItemId`. Pyramid-bag (`AddPyramidBagItem`/`RemovePyramidBagItem`/`CheckPyramidBag*`) = ABSENT [Frontier, exempt].
Divergences : (1) substrat string vs u16-XOR ; (2) accesseurs → strings FR ; (3) éclatement `engine/bag/**`.
Stubs suspects : aucun stub silencieux — les corps dispersés sont réels.
Fuites : `item.ts` importe `harness/runtime/data-tables` (fuite harness assumée : la data items FR vit dans le harness, pas dans `src/data/`).

## item_use.c → src/item_use.ts (+ dispatch item_menu.ts)
Statut : 🟡 PARTIEL (comportement fidèle, structure non-1:1 + stubs honnêtes)
Fonctions : cartograph 4/74 dans le foyer, 5/74 « partout » — TROMPEUR. En réalité les handlers `ItemUseOutOfBattle_*` sont TOUS présents mais **inlinés dans un switch** de `item_menu.ts` (`ItemMenu_UseOutOfBattle`, ~l.2600-2857) au lieu d'être des fonctions homonymes. `item_use.ts` = « item-use-callbacks » (renommage) : contient `SetUpItemUseCallback`, `SetUpItemUseOnFieldCallback`, `FieldCB_UseItemOnField`, `Task_CallItemUseOnFieldCallback` (1:1) + les CB party (`ItemUseCB_Medicine/PPRecovery/PPUp/RareCandy/ReduceEV/SacredAsh/EvolutionStone/TMHM` = mélange item_use.c + party_menu.c).

Portés (via switch item_menu.ts, corps fidèles) : Bike (+register), Rod (+preload gfx fishing = fix moteur), Itemfinder (scan basique), CoinCase, PowderJar, Repel, BlackWhiteFlute, EscapeRope (+`CanUseDigOrEscapeRopeOnCurMap` dans `fldeff_dig.ts`), EnigmaBerry (dispatch effet), Medicine/PPRecovery/PPUp/RareCandy/ReduceEV/SacredAsh/EvolutionStone/TMHM. → Les 8 commits du chantier sac sont FIDÈLES au callgraph item_use.c.

Manquantes / stubs [vivant] :
- `ItemUseOutOfBattle_Mail` → ouvre `CB2_CheckMail`=ReadMail (design lettre BLANC, **écriture non portée** — bloque la rédaction de courrier). Honnête (commentaire l.2840).
- `ItemUseOutOfBattle_PokeblockCase` / `_Berry` / `_WailmerPail` → **DadsAdvice** (l.2845-2852, condition prérequis jamais remplie). Bloque : Pokéblock case, plantation/arrosage baie *depuis le sac*, Wailmer Pail (Sudowoodo).
- `ItemUseOutOfBattle_Itemfinder` : scan simplifié (au moins 1 bg_event `hidden_item`, sans flag-picked ni spin-anim). Documenté.
- Absents : `Task_UseItemfinder`, `ItemfinderCheckForHiddenItems`, `IsHiddenItemPresentAtCoords/InConnection`, `GetDirectionToHiddenItem`, `TryToWaterSudowoodo`, `ItemUseInBattle_*` (combat = PAUSE ; `ItemUseInBattle_PokeBall` porté dans `engine/bag/bag-screen.ts`).
Fuites : dispatch inliné (pas de fns `ItemUseOutOfBattle_*` homonymes) = divergence structurelle. `item_use.ts` importe massivement le harness (`decomp-runtime`, `decomp-globals`) — assumé.

## item_icon.c → src/item_icon.ts
Statut : 🟡 PARTIEL (2/6 cartograph)
Fonctions : `CopyItemIconPicTo4x4Buffer`, `AddItemIconSprite` (1:1) ; `AddCustomItemIconSprite`, `GetItemIconPicOrPalette`, `AllocItemIconTemporaryBuffers`, `FreeItemIconTemporaryBuffers` = non présents comme tels (remplacés par `preloadItemIconAssets`/`_loadMaps`/`_preloadOne` = chargement asset harness async, non-1:1).
Divergences : le chargement d'icônes passe par un cache d'assets préchargés (`.bin`/`.pal` URLs) au lieu du buffer VRAM 4x4 décomp. Substrat asset, non hardware.

## berry.c → src/berry.ts (+ specials-registry.ts)
Statut : 🟡 PARTIEL → fonctionnellement quasi-complet (baies phase B/C soldé)
Fonctions : 23/36 dans le foyer. Le reste = **field-interaction, portées comme specials** :
- `berry.ts` (23) : Enigma (`ClearEnigmaBerries`, `SetEnigmaBerry`, `GetEnigmaBerryChecksum`, `IsEnigmaBerryValid`), `GetBerryInfo`, `GetBerryTreeInfo`, `ClearBerryTrees`, `BerryTreeGrow`, `BerryTreeTimeUpdate`, `PlantBerryTree`, `RemoveBerryTree`, `GetBerryTypeByBerryTreeId`, `GetStageByBerryTreeId`, `ItemIdToBerryType`, `BerryTypeToItemId`, `GetBerryNameByBerryType`, `AllowBerryTreeGrowth`, `BerryTreeGetNumStagesWatered`, `GetNumStagesWateredByBerryTreeId`, `CalcBerryYieldInternal`, `CalcBerryYield`, `GetBerryCountByBerryTreeId`, `GetStageDurationByBerryType`. Corps 1:1 vérifiés (math de croissance, RNG yield).
- Ailleurs (specials-registry.ts) : `ObjectEventInteractionGetBerryTreeData`, `…PlantBerryTree`, `…PickBerryTree`, `…RemoveBerryTree`, `…WaterBerryTree`, `…GetBerryName`, `…GetBerryCountString`, `PlayerHasBerries`, `Bag_ChooseBerry` (aussi `special_flows.ts`) ; `SetBerryTreesSeen` → `field_camera.ts`.
Manquantes [vivant, mineur] : `IsPlayerFacingEmptyBerryTreePatch`, `TryToWaterBerryTree`, `GetBerryCountStringByBerryType` (helpers du chemin Wailmer Pail / arrosage — cohérent avec le stub WailmerPail). `PlantBerryTree`/etc. côté `berry.ts` sont là ; c'est le pont Wailmer qui manque.
Stubs : `GetEnigmaBerryChecksum` = compute réel mais `IsEnigmaBerryValid` special skip le checksum (enigmaBerry toujours vierge sans lien — documenté).

## berry_tag_screen.c → ABSENT
Statut : ⬜ ABSENT (0/27)
Écran d'étiquette de baie non porté. `DoBerryTagScreen` référencé seulement en commentaire ; `ItemMenu_CheckTag` (item_menu.ts:3341) = **STUB** (retourne à la liste sans afficher). Bloque : consultation étiquette baie (goût/fermeté/dessin). = « berry tags (#17) » confirmé.

## berry_powder.c → ABSENT (foyer) — logique via specials
Statut : 🟡 PARTIEL (état porté, UI absente)
Portés (specials-registry.ts) : `GiveBerryPowder`, `TakeBerryPowder`, `GetBerryPowder`, `HasEnoughBerryPowder`, `DisplayBerryPowderVendorMenu`, `PrintPlayerBerryPowderAmount`, `RemoveBerryPowderVendorMenu`. Stockage = `gSaveBlock2Ptr.berryCrush.berryPowderAmount`.
Manquantes : `SetBerryPowder`, `ApplyNewEncryptionKeyToBerryPowder` (chiffrement — non porté, cohérent §1), `DecryptBerryPowder`, `HasEnoughBerryPowder_`, `TakeBerryPowder_`, `DrawPlayerPowderAmount` [dettes UI/Berry-Crush=link, exempt].

## pokeblock.c → ABSENT (foyer) — 1 accesseur via special
Statut : 🔴 quasi-ABSENT (0/58)
Porté : `GetFirstFreePokeblockSlot` (special, 1:1, l.1276). Data `gSaveBlock1Ptr.pokeblocks` (40 slots) existe. Autres accesseurs listés en stub-loop (`GetPokeblockFeederInFront`, `GetPokeblockNameByMonNature`).
Manquant [vivant] : tout le reste (création pokéblock via mixage=Berry Blender link/exempt, mais l'usage SOLO — `OpenPokeblockCase` UI, `TryClearPokeblock`, `PokeblockGetGain`, feed) = absent. Bloque : Pokéblock Case, contest prep.

## use_pokeblock.c → ⬜ ABSENT (0/51). pokeblock_feed.c → ⬜ ABSENT (0/28)
Écran d'usage/feed pokéblock (condition mon) entièrement absent. Dépend de pokeblock.c + concours. [DEFER — gros écran, faible levier solo hors concours].

## tv.c → src/tv.ts (+ specials-registry.ts)
Statut : 🔴 DIVERGENT (massivement incomplet)
Fonctions : 5/207 dans le foyer (cartograph). tv.ts (158 l) porte 1:1 : `CheckForPlayersHouseNews`, `SetTVMetatilesOnMap`, `UpdateTVScreensOnMap` (avec no-op interne documenté pour `FindAnyTVShowOnTheAir`/`IsGabbyAndTyShowOnTheAir`), `TurnOffTVScreen`, `TurnOnTVScreen`. Ailleurs (specials) : `GabbyAndTyGetBattleNum`, `…GetLastQuote`, `GetGabbyAndTyLocalIds`, `…GetLastBattleTrivia`, `IsGabbyAndTyShowOnTheAir`, `GetSelectedTVShow` (impl l.1043).
Clusters manquants (les gros) :
- **DoTVShow + ~30 `DoTVShowXxx`** [vivant] = STUB (specials `DoTVShow`, `DoTVShowInSearchOfTrainers` en stub-loop l.1968).
- **`TryPutXxxOnAir` (~26)** générateurs de shows [vivant] = ABSENT (jamais de show généré).
- **Interview (19)** [vivant] : `InterviewBefore` → `registerSpecial(..,()=>0)` (l.1248) ; `InterviewAfter` stub.
- **PokeNews (18)** [vivant] : `DoPokeNews`/`IsPokeNewsActive`/`UpdatePokeNewsCountdown` STUB — impacte `GetSlotMachineId` (branche PokeNews jamais prise, documenté).
- **Daily updates (8)**, **Record-mixing (23)** [link/mort], **String format (20+)**.
Fuites / commentaires trompeurs : specials-registry l.1985-1986 & 2050-2058 annoncent « porté 1:1 décomp » pour `GabbyAndTyBeforeInterview`/`AfterInterview`/`IsGabbyAndTyShowOnTheAir`/`IsMonOTIDNotPlayers`/`IsTVShowAlreadyInQueue` **sans handler `registerSpecial` concret** → commentaire = marchandise non livrée (à vérifier/corriger). `ResetTVShowState` (l.417) = no-op honnête.

## mauville_old_man.c → ABSENT (foyer) — état via specials
Statut : 🟡 PARTIEL (état porté 1:1, écrans absents)
Data `union OldMan` (bard/storyteller/hipster/trader) portée 1:1 dans `engine/save/save-blocks.ts` (l.471-507). ~18 mentions/specials : `HasBardSongBeenChanged` (mauville_old_man.c:151), `HasHipsterTaughtWord` (:241), `GiddyShouldTellAnotherTale` (:267), `HasStorytellerAlreadyRecorded` (:1467), trader (`…alreadyTraded`). 
Manquant [vivant] : les écrans/flux (bard song compose, storyteller record, hipster teach, trader UI = `trader.c` aussi absent). Setup/reset (`SetupMauvilleOldMan`) ABSENT.

## lilycove_lady.c → ABSENT (foyer) — ~25 specials portés
Statut : 🟡 PARTIEL (logique Favor/Quiz/Contest Lady portée, UI absente)
~25 `registerSpecial` 1:1 : Favor Lady (`GetFavorLadyState`, `BufferFavorLadyRequest`(no-op), `BufferFavorLadyItemName`, `DidFavorLadyLikeItem`, `IsFavorLadyThresholdMet`, `FavorLadyGetPrize`, `HasAnotherPlayerGivenFavorLadyItem`), Quiz Lady (`IsQuizLadyWaitingForChallenger`, `QuizLadySetWaitingForChallenger`, `GetQuizLadyState`, `SetQuizLadyState_*`, `QuizLadyTakePrizeForCustomQuiz`, `QuizLadyRecordCustomQuizData`, `Clear…`), Contest Lady (`HasPlayerGivenContestLadyPokeblock`, `ShouldContestLadyShowGoOnAir`, `GetContestLadyMonSpecies`, `GetContestLadyCategory`, `SetContestLadyGivenPokeblock`), `Script_GetLilycoveLadyId`, `SetLilycoveLadyGfx`.
Stub/bloqué [vivant] : `ItemMenu_GiveFavorLady` (item_menu.ts) = **STUB** retour-liste → donner objet à la Favor Lady depuis le sac ne fait rien. Quiz custom UI absente.

## dewford_trend.c → src/dewford_trend.ts
Statut : ✅ MIROIR (11/13 cartograph — confirmé exact)
Portés 1:1 (corps vérifiés) : `InitDewfordTrend`, `UpdateDewfordTrendPerDay`, `TrySetTrendyPhrase`, `SortTrends`, `BufferTrendyPhraseString`, `IsTrendyPhraseBoring`, `GetDewfordHallPaintingNameIndex`, `CompareTrends`, `SeedTrendRng`, `IsPhraseInSavedTrends`, `IsEasyChatPairEqual` (+ helper `cloneTrend`).
Manquantes (2, confirmées) : `ReceiveDewfordTrendData` (record-mixing/link) [MORT] et `GetSavedTrendIndex` (static, appelé uniquement par `ReceiveDewfordTrendData`) [MORT car son seul appelant est mort]. → « 11/13 » exact, les 2 manquantes = link only.

## lottery_corner.c → src/lottery_corner.ts
Statut : ✅ MIROIR (8/8 — confirmé exact, corps réels)
`ResetLotteryCorner`, `SetRandomLotteryNumber`, `RetrieveLotteryNumber`, `PickLotteryCornerTicket`, `GetMatchingDigits`, `SetLotteryNumber`, `GetLotteryNumber`, `SetLotteryNumber16_Unused`. Bodies 1:1 (loop party + boîtes PC, marker TOTAL_BOXES_COUNT, matching digits). « 8/8 » exact.

## field_poison.c → src/field_poison.ts
Statut : ✅ MIROIR (7/7 — confirmé exact)
`IsMonValidSpecies`, `AllMonsFainted`, `FaintFromFieldPoison`, `MonFaintedFromPoison`, `Task_TryFieldPoisonWhiteOut`, `TryFieldPoisonWhiteOut`, `DoPoisonFieldEffect`. Bodies 1:1 (STATUS1_POISON|TOXIC, FLDPSN_*). « 7/7 » exact. Dette mineure documentée : `FldEffPoison_Start` (flash écran) déféré dans `DoPoisonFieldEffect` (UI non portée) — n'affecte pas la logique de KO.

## diploma.c → ABSENT (foyer)
Statut : ⬜ ABSENT (0/10 ; cartograph liste `option_menu.ts` par faux-positif de nom)
`Special_ShowDiploma` (field_specials.ts:472) = **STUB** (log « dette R3 », `CB2_ShowDiploma` UI non porté). Aucune fn de diploma.c portée. Bloque : affichage du diplôme (Pokédex complété). [Faible levier].

## trainer_card.c → src/trainer_card.ts
Statut : 🟡 PARTIEL (écran fonctionnel, ~60/79, structure non-1:1 + band-aids documentés)
trainer_card.ts (1045 l) = écran custom : state-machine `CB2_InitTrainerCard` (21 steps, 1:1), dessin recto/verso, flip animation (scanline HBlank 1:1), input A/B/START, OAM trainer-pic + 8 badges, chargement asset async, gender-aware. La plupart des `Print*OnCard` sont **fusionnés** dans `_bufferCardData` (non homonymes). Le cartograph dit 1/79 (les fns homonymes n'existent pas — noms internes `_drawCardFront`, `_swapCardSide`, etc.).
Divergences band-aid documentées (dette fidélité, PAS 1:1 strict) :
- l.207-212 : `ResetVramOamAndBgCntRegs()` réutilisé (déviation anti-leak inter-écran vs `InitBgsAndWindows` décomp).
- Ajout `FreeAllSpritePalettes()` (sprite dresseur noir sinon — cf. pitfall connu).
- Fixes SE (`SE_RG_CARD_FLIP`=249, `SE_RG_CARD_OPEN`=251) et fade-in timing.
Manquantes [vivant] : `PrintStickersOnCard` (stickers RS), pages Frontier/Union/Contest/BerryCrush (link/frontier = partiellement exempt). Manquantes [mort/data] : consts d'assets (données brutes).

## decoration.c → src/decoration.ts + decoration_inventory.ts + src/data/decoration/header.ts
Statut : 🔴 DIVERGENT pour l'UI / ✅ pour possession+inventaire
`decoration.ts` (48 l) = 4 fns possession sur `gSaveBlock1Ptr.decorations` (l'agent a listé `DecorationAdd/Remove/CheckSpace/CheckHasDecoration` — NB : ce sont en réalité les mêmes noms que decoration_inventory ; à re-vérifier pour doublon). `decoration_inventory.ts` (263 l) = **10/11 fns 1:1 STRICT** (voir ci-dessous). Données 121 décors → `src/data/decoration/header.ts` (1449 l) = migration data (rename decoration→data confirmé).
Manquant [vivant] : TOUT le code UI de decoration.c (135 fns) — menu placement, catégories, curseur, rendu tiles, `Task_PlaceDecoration`, secret-base decorating. 0/135 dans decoration.ts. Bloque : placer/retirer des décorations dans la chambre / base secrète.

## decoration_inventory.c → src/decoration_inventory.ts
Statut : ✅ MIROIR (11/11 cartograph — confirmé)
`SetDecorationInventoriesPointers`, `ClearDecorationInventories`, `GetFirstEmptyDecorSlot`, `CheckHasDecoration`, `DecorationAdd`, `DecorationCheckSpace`, `DecorationRemove`, `CondenseDecorationsInCategory`, `GetNumOwnedDecorationsInCategory`, `GetNumOwnedDecorations`. Bodies 1:1. Stub mineur : `InitDecorationContextItems` (TODO no-op, l.105) — helper UI, sans impact inventaire.

## secret_base.c → src/secret_base.ts
Statut : 🔴 DIVERGENT (1/99 — quasi absent)
Porté : `SecretBasePerStepCallback` (1:1, secret_base.ts:101-192 ↔ décomp:1199-1329) — le per-step callback en base amie (meuble utilisé → flag). Honnête (commentaire : reste = chantier séparé).
Manquant [vivant] : entrée/warp base (~22 fns : `EnterSecretBase`, `WarpIntoSecretBase`, `SetCurSecretBaseIdFromPosition`, `ToggleSecretBaseEntranceMetatile`, `InitSecretBaseAppearance`…), menu registre (~10), setup battle base (~8), decoration-check ami (~8). Bloque : créer/entrer/enregistrer/combattre une base secrète.
Manquant [mort] : `ReceiveSecretBasesData`, `ClearJapaneseSecretBases` (link/legacy).

## player_pc.c → src/player_pc.ts
Statut : 🟡 PARTIEL (39/85 cartograph ; substance présente, architecture divergée)
player_pc.ts (2240 l > 1510 l C) : menu PC (Item Storage / Mailbox / Decoration / Turn Off) porté en **state-machine** (non task-based décomp). Item Storage : withdraw/deposit/toss/swap/qty-rolling présents. Divergences notées par l'audit :
- Swap items = 4 fns ad-hoc TS (`_itemStorageStartItemSwap`, `_tickPCSwap`, …) au lieu du swap CB2 décomp.
- Deposit détourné via `OpenBagScreen(BAG_LOCATION_ITEMPC)` async (≠ `CB2_GoToItemDepositMenu` task-based).
- Lecture des internals runtime (`rt._listMenus?.get(...)`) = hack non-décomp pour scroll/cursor.
- Swap-line sprites inertes (non spawn). Mailbox : ~6/22 fns actives, Give/ReadMail/Deposit = stubs. Decoration → message fallback (stub).
Fuites : imports harness (`DecompTask`, `getRuntime`) + adaptateur task↔state-machine (~200 l). Expansion +48% lignes = glue + UI deposit custom + stubs mailbox.

## roulette.c → ⬜ ABSENT (0/104)
Minijeu roulette (Casino Mauville) non porté. Aucun `PlayRoulette` special. [DEFER — gros écran, faible levier].

## slot_machine.c → ⬜ ABSENT (0/270)
Machines à sous (Casino) non portées — le plus gros .c du domaine (7955 l). `GetSlotMachineId` (qui pointe vers la bonne machine) est en fait dans **field_specials.c** et EST porté (specials l.1016). Le moteur de jeu (270 fns) = absent. [DEFER].

## contest.c / contest_util.c / contest_effect.c / contest_painting.c / contest_ai.c → ⬜ ABSENT
Statut : 🚫 EXEMPT (partiellement) — 0 fn portée ([LÉGER] inventaire counts)
Totaux : contest.c 205 fns, contest_util.c 111, contest_effect.c 51, contest_painting.c 20, contest_ai.c 142. Le **moteur de concours** est entièrement absent (minijeu, souvent lié au link/record-mixing). 
Ce que le SOLO utilise EST présent : les **données** de moves-concours (`gContestMoves`, `getContestEffect`, `getContestEffectDescription`, `ContestMove` type) dans `engine/data/game-data.ts`, consommées par `pokemon_summary_screen.ts` (pages « moves concours »). Donc la dépendance solo (affichage type/effet concours d'une capacité dans le récap) est couverte ; le déroulement d'un concours ne l'est pas. `contest_ai.c` faux-positif cartograph → `battle_ai_script_commands.ts` (2/142 = collision de noms, PAS une amorce réelle).

---

## Tableau récapitulatif

| fichier .c | statut | fns portées/total | écart principal |
|---|---|---|---|
| item.c | 🔴 | ~29/52 (dispersé) | substrat string vs u16-XOR ; logique en `engine/bag/**`, pas `item.ts` |
| item_use.c | 🟡 | handlers OK (switch item_menu.ts) | dispatch inliné non-homonyme ; stubs Mail-write/Pokeblock/Wailmer/Berry→DadsAdvice |
| item_icon.c | 🟡 | 2/6 | chargement asset harness async (non VRAM 4x4) |
| berry.c | 🟡→OK | 23/36 + specials | field-interaction en specials ; manque pont Wailmer (IsPlayerFacingEmpty/TryToWater) |
| berry_tag_screen.c | ⬜ | 0/27 | écran étiquette absent (`ItemMenu_CheckTag` stub) — #17 |
| berry_powder.c | 🟡 | ~7/14 (specials) | UI vendor + chiffrement absents |
| pokeblock.c | 🔴 | 1/58 | 1 accesseur ; Pokéblock Case absente |
| use_pokeblock.c | ⬜ | 0/51 | écran usage pokéblock absent |
| pokeblock_feed.c | ⬜ | 0/28 | scène feed absente |
| tv.c | 🔴 | 5/207 (+ ~6 specials) | DoTVShow/TryPut*/PokeNews/Interview = STUB ; commentaires « porté » non livrés |
| mauville_old_man.c | 🟡 | ~18 specials (état) | écrans bard/story/hipster/trader absents |
| lilycove_lady.c | 🟡 | ~25 specials | logique Ladies OK ; `ItemMenu_GiveFavorLady` stub ; UI quiz absente |
| dewford_trend.c | ✅ | 11/13 | 2 manquantes = link (mortes) |
| lottery_corner.c | ✅ | 8/8 | miroir exact |
| field_poison.c | ✅ | 7/7 | miroir exact (flash UI déféré) |
| diploma.c | ⬜ | 0/10 | `CB2_ShowDiploma` stub |
| trainer_card.c | 🟡 | ~60/79 | écran fonctionnel non-homonyme + band-aids documentés |
| decoration.c | 🔴 | 0/135 (UI) | tout le placement/menu/rendu absent |
| decoration_inventory.c | ✅ | 10-11/11 | miroir strict (1 stub UI mineur) |
| secret_base.c | 🔴 | 1/99 | seul per-step callback ; entrée/registre/battle absents |
| player_pc.c | 🟡 | 39/85 | state-machine ≠ task ; deposit/swap détournés ; mailbox/deco stubs |
| roulette.c | ⬜ | 0/104 | casino absent |
| slot_machine.c | ⬜ | 0/270 | casino absent |
| contest*.c | 🚫 | 0 (data OK) | moteur concours absent ; data moves-concours présente (summary) |

---

## TOP 5 (levier × effort)

1. **Baies — pont Wailmer/arrosage & étiquette (berry_tag_screen)** — levier ÉLEVÉ, effort **M**. Porter `IsPlayerFacingEmptyBerryTreePatch`, `TryToWaterBerryTree`, `ObjectEventInteractionWaterBerryTree` (déjà amorcé) + débloquer `ItemUseOutOfBattle_WailmerPail`/`_Berry` (retirer le fallback DadsAdvice). `berry_tag_screen.c` (692 l, 27 fns) = écran isolé, débloque `ItemMenu_CheckTag`. Le cœur berry.ts est déjà là → plus petit reste du domaine baie. Oracle : sac → baie « Consulter », planter/arroser une baie au champ.

2. **tv.c — noyau `DoTVShow`/`TryPut*`/Interview + honnêteté des commentaires** — levier ÉLEVÉ (système vivant, très référencé par les scripts overworld), effort **L**. D'abord CORRIGER les commentaires « porté 1:1 » non livrés (Gabby&Ty interview) = dette de crédibilité, coût quasi nul. Puis porter le pipeline Interview→DoTVShow→PostInterview (chaîne la plus visible en jeu). Oracle : regarder la TV chez soi (news maison OK déjà), déclencher Gabby&Ty après un combat.

3. **secret_base.c — entrée/warp + registre** — levier MOYEN-ÉLEVÉ, effort **L**. `SecretBasePerStepCallback` seul est porté (1/99). Porter le cluster entrée (`SetCurSecretBaseIdFromPosition`, `EnterSecretBase`, `WarpIntoSecretBase`, `ToggleSecretBaseEntranceMetatile`, `InitSecretBaseAppearance`) rend une feature entière jouable en solo. Oracle : interagir un buisson/arbre-base secrète, entrer, enregistrer.

4. **item.c — consolidation foyer + chiffrement** — levier MOYEN (dette doctrine, pas fonctionnel), effort **M/L**. Rapatrier `engine/bag/**` → `item.ts` aux noms 1:1 et décider du sort du chiffrement `struct ItemSlot` (soit porter `GetBagItemQuantity`/`SetBagItemQuantity`/`ApplyNewEncryptionKeyToBagItems`, soit documenter l'exemption comme hardware-adjacent). Améliore la fidélité STRICT du domaine le plus consulté. Oracle : sac fonctionne déjà — c'est une refonte structurelle, tester non-régression add/remove/tri.

5. **decoration.c placement UI + player_pc mailbox** — levier MOYEN, effort **M**. `decoration_inventory` (possession) est déjà 1:1 ; le placement UI (decoration.c) débloque « décorer sa chambre » (BedroomPC → Decoration, aujourd'hui message fallback dans player_pc.ts) et la donation Favor Lady. Compléter aussi mailbox player_pc (Give/ReadMail non-stubs). Oracle : PC chambre → Décoration → placer un objet ; PC → Boîte lettres → lire/donner.

### Notes de fiabilité pour la synthèse (CHEMIN-1TO1)
- Les dénominateurs `compl(fichier)` du cartograph SOUS-ESTIMENT ce domaine : la logique « accesseur d'état » est massivement dans `specials-registry.ts` (pattern voulu). Toujours croiser avec un grep specials avant de déclarer « absent ».
- 2 faux-positifs cartograph confirmés : `contest_ai.c`→`battle_ai_script_commands.ts` (collision de noms) et `diploma.c`→`option_menu.ts` (collision). Aucune amorce réelle.
- Dette de crédibilité repérée (à traiter en priorité 0, coût nul) : commentaires « porté 1:1 décomp » dans `specials-registry.ts` (~l.1985-1986, 2050-2058) pour des specials TV **sans handler concret**. Viole le contrat « pas de commentaire mensonger ».

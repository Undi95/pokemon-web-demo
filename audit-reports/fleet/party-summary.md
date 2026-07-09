# Audit 1:1 — Domaine « party-summary »

> Read-only. Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/`. Périmètre :
> `party_menu.c`, `pokemon_summary_screen.c`, `pokemon_storage_system.c` (+ le cluster
> PC-storage rapatrié dans `field_specials.ts` / `party-storage.ts`).
>
> Méthode : extraction des définitions de fonctions des deux côtés (awk col-0 + grep TS
> `function`/`const`/méthodes), intersection par nom EXACT, puis grep repo-entier pour
> classer les manquantes « ailleurs (chemin) » vs « vraiment absentes ». Lecture intégrale
> des 3 miroirs TS. « 1:1 » = mirror doctrine STRICTE (mêmes noms fn/globals, corps transcrit,
> pas de FSM maison ni de renommage `_camelCase`).

---

## party_menu.c → src/party_menu.ts
Statut : 🟡 PARTIEL (fonctionnellement large, structurellement DIVERGENT)
Fonctions : **51/354** portées au total dont **31 sous nom 1:1 EXACT dans party_menu.ts** + **20 ailleurs** (chemins ci-dessous). 303 non portées sous nom 1:1 — MAIS ~72 helpers `_camelCase` dans party_menu.ts recouvrent la logique de fonctions décomp sans en garder le nom (ex. `_cursorCbGive`=`CursorCb_Give`, `_displayPartyPokemonHP`=`DisplayPartyPokemonHP`, `_openActionMenu`≈`CreateSelectionWindow`/`SetPartyMonSelectionActions`). La couverture COMPORTEMENTALE single-player (ouvrir l'équipe, choisir, RESUME→résumé, ORDRE, OBJET donner/prendre/échanger, give-from-bag, mail, field moves Vol/Surf, softboiled, level-up Super Bonbon) est présente et vérifiée en jeu ; la couverture MIROIR (noms/architecture) est faible.

### Architecture — divergence structurelle majeure (assumée par le fichier, en-tête « MVP scope »)
- **FSM maison `_phase`** (`party_menu.ts:317`) : `'idle'|'open'|'action_menu'|'fading_out'|'switching'|'item_used_msg'|'hp_anim'|'levelup_pg1/2/learn'|'field_move_err'|'softboiled_msg'|'fieldmove_yesno'|'helditem_msg'|'switch_items_yesno'`. Remplace l'architecture décomp `Task_*` + `sPartyMenuInternal->task`/`CreateTask(Task_HandleChooseMonInput)` + table `gCursorOptions[]`/`sCursorOptions`. → contredit le contrat « substrat + tasks-témoin » : c'est une state-machine maison, pas `gTasks`+`.func`.
- **Entrée non-1:1** : `OpenPartyScreen()` / `OpenPartyScreenForItemUse()` / `OpenPartyScreenForBattleSwitch()` (`party_menu.ts:3464/3499/3524`) remplacent `ShowPartyMenu(partyLayout, partyAction, keepCursor, ...)` (party_menu.c:560) + `InitPartyMenu(...)` (party_menu.c:489). Aucun `ShowPartyMenu`/`InitPartyMenu` sous nom 1:1.
- **Tick non-1:1** : `TickPartyScreen(newKeys)` (`:3796`) + `Task_PartyMenu_HandleInput` (`:3025`) au lieu de `Task_HandleChooseMonInput` / `HandleChooseMonSelection` / `PartyMenuButtonHandler`.
- **72 helpers `_camelCase`** (non conformes) portant la logique décomp : `_drawSlot/_drawHpBar/_drawMsg/_displayPartyPokemonData/_displayPartyPokemonHP/_displayPartyPokemonMaxHP/_ailmentFromStatus/_animateSelectedPartyIcon/_openActionMenu/_closeActionMenu/_handleActionMenuInput/_cursorCbGive/_cursorCbItem/_cursorCbTakeItem/_cursorCbSwitch/_cursorCbCancel2/_finishTwoMonAction/_moveAndBufferPartySlot/_reopenPartyForGive/_reopenPartyForSwitch/…`.

### Portées SOUS NOM 1:1 EXACT dans party_menu.ts (31)
`AnimatePartySlot, CB2_ChooseMonToGiveItem, CB2_GiveHoldItem, CB2_InitPartyMenu, CB2_ReturnToBagMenu, CB2_ReturnToPartyOrBagMenuFromWritingMail, CB2_SelectBagItemToGive, CB2_WriteMailToGiveMonFromBag, CreateLevelUpStatsWindow, CursorCb_FieldMove, DisplayItemMustBeRemovedFirstMessage, DisplayLevelUpStatsPg1, DisplayLevelUpStatsPg2, FieldCallback_PrepareFadeInFromMenu, FieldCallback_Surf, GetCursorSelectionMonId, GetFieldMoveMonSpecies, GiveItemOrMailToSelectedMon, GiveItemToMon, GiveItemToSelectedMon, PartyMenuDisplayYesNoMenu, RemoveItemToGiveFromBag, RemoveLevelUpStatsWindow, ReturnGiveItemToBagOrPC, SetUpFieldMove_Fly, SetUpFieldMove_Surf, Task_ClosePartyMenu, Task_DisplayHPRestoredMessage, Task_FieldMoveWaitForFade, TryGiveItemOrMailToSelectedMon, TryTakeMonItem`
(Note : plusieurs ont un corps 1:1 partiel — voir divergences.)

### Ailleurs (20 fns de party_menu.c consolidées hors party_menu.ts — LÉGITIME si nom conservé)
| fn décomp | notre emplacement | remarque |
|---|---|---|
| `ItemUseCB_Medicine` | `src/item_use.ts:332` | famille item-use ENTIÈRE déplacée ✅ nom 1:1 |
| `ItemUseCB_ReduceEV` | `src/item_use.ts:456` | ✅ |
| `ItemUseCB_PPRecovery` | `src/item_use.ts:381` | ✅ |
| `ItemUseCB_PPUp` | `src/item_use.ts:401` | ✅ |
| `ItemUseCB_TMHM` | `src/item_use.ts:557` | ✅ |
| `ItemUseCB_RareCandy` | `src/item_use.ts:419` | ✅ |
| `ItemUseCB_SacredAsh` | `src/item_use.ts:489` | ✅ |
| `ItemUseCB_EvolutionStone` | `src/item_use.ts:526` | ✅ |
| `CB2_ShowPartyMenuForItemUse` | `src/item_use.ts:125` | ✅ |
| `CanMonLearnTMTutor` | `src/item_use.ts:543` | ✅ |
| `ItemIdToBattleMoveId` | `src/engine/pokemon/tmhm-moves.ts:55` | ✅ |
| `GetItemEffectType` | `src/engine/bag/bag-item-effects.ts:116` | ✅ |
| `MonKnowsMove` | `src/pokemon.ts:667` | ✅ foyer pokemon.c |
| `SwitchPartyMonSlots` | `src/engine/battle/party-storage.ts:425` | ⚠️ nom≠ décomp `SwitchPartyMon` |
| `BufferBattlePartyOrder`, `BufferBattlePartyCurrentOrderBySide`, `GetPartyIdFromBattleSlot`, `SetPartyIdAtBattleSlot`, `UpdatePartyToBattleOrder`, `UpdatePartyToFieldOrder` | `src/battle_main.ts:1498-1565` | ordre party↔combat (branche combat) |

### Manquantes notables (vivant single-player) — logique présente sous `_camelCase` OU absente
- **CursorCb_* (18)** : `CursorCb_Summary/Switch/Item/Give/TakeItem/Toss/Mail/Read/TakeMail/SendMon/Enter/NoEntry/Store/Register/Trade1/Trade2/Cancel1/Cancel2`. VIVANT single-player : Summary/Switch/Item/Give/TakeItem/Cancel1/Cancel2/Mail/Read/TakeMail/SendMon présents en logique via `_cursorCb*`/`_phase` (noms non conformes). `CursorCb_Store`/`Register` (Battle Pyramid/Tower), `Trade1/2`, `Enter`/`NoEntry` (Battle Frontier entries) = branche frontier, non requis single-player courant.
- **Display cluster (39)** : `DisplayPartyPokemonData*` (Contest/Relearner/MoveTutor/MultiBattle/BattlePyramid/ChooseHalf/WirelessMinigame), `DisplayPartyPokemonHP/HPBar/MaxHP/Level/Nickname/Gender/GenderNidoranCheck`, `DisplayPartyMenuMessage/StdMessage`, `DisplayLearnMoveMessage*`, `DisplayGaveHeldItemMessage`, `DisplaySwitchedHeldItemMessage`, `DisplayTookHeldItemMessage`, `DisplayCantUseSurfMessage/FlashMessage`. Les variantes de BASE (data/HP/Level/Nickname/Gender/message std) existent en logique sous `_displayPartyPokemon*`/`_drawMsg`/`ShowPartyMenuItemMessage`. Les variantes CONTEXTE (Contest/Relearner/MoveTutor/MultiBattle/Pyramid/WirelessMinigame) = ABSENTES (contest & minijeux non implémentés).
- **Sprites (Create*Sprite, 16)** : `CreatePartyMonIconSprite(Parameterized)`, `CreatePartyMonHeldItemSprite(Parameterized)`, `CreatePartyMonStatusSprite(Parameterized)`, `CreatePartyMonPokeballSprite(Parameterized)`, `CreateCancelConfirmPokeballSprites/Windows`, `CreatePokeballButtonSprite`, `CreateSmallPokeballButtonSprite`, `CreateHeldItemSpriteForTrade`. Logique présente sous `_load*Gfx`/`_setIconFrame`/OAM manuels (noms non conformes). Le rendu icône/statut/objet/pokeball FONCTIONNE mais via helpers ad-hoc, pas les fns 1:1.
- **ChooseMon entrypoints** : `ChooseMonForDaycare` (VIVANT — daycare.c, `special` non câblé chez nous), `ChooseContestMon` (VIVANT — scrcmd.c contest), `ChooseMonForInBattleItem` (VIVANT — item_use.c), `ChooseMonForMoveRelearner`/`ChoosePartyMon` (0 caller décomp direct hors script `special`). → voir STUBS.
- **Alloc/init (vivant)** : `AllocPartyMenuBg`, `AllocPartyMenuBgGfx`, `InitPartyMenu`, `InitPartyMenuBoxes`, `InitPartyMenuWindows`, `FreePartyPointers`, `ExitPartyMenu`, `ResetPartyMenu` → logique dans `_initPartyBgs`/`_loadAssets`/`_loadPartyGraphicsCb2`/`_freePartyMenu`/`ClosePartyScreen` (noms non conformes).

### Stubs suspects
- **`registerSpecial('ChoosePartyMon', () => 0)`** (`src/engine/script/specials-registry.ts:909`) : stub dur. Le special `CHOOSE_PARTY_MON` (utilisé par des scripts field pour sélectionner un mon) retourne toujours 0 (slot 0 / annulation implicite). ⚠️ VIVANT si un script overworld l'appelle → sélection cassée. À vérifier si un flux single-player courant le déclenche.
- **`ChooseMonForMoveRelearner`** listé dans une stub-loop `registerSpecial(name, ()=>0)` (`specials-registry.ts:1947`) — Rappel de Capacités (Move Relearner, PNJ) → non fonctionnel. VIVANT (feature single-player standard) mais probablement pas encore atteint en jeu.
- Ces stubs sont le pattern « special stub-loop clobber » déjà documenté (MEMORY) : si un vrai handler est enregistré AVANT la loop, il est écrasé. À auditer via `audit-clobbered-specials.cjs` (hors périmètre, mais `ChoosePartyMon`/`ChooseMonForMoveRelearner` sont candidats).

### Fuites harness / noms non conformes / commentaires
- **72 helpers `_camelCase`** = renommage systématique non conforme au mirror (`_drawSlot`, `_cursorCbGive`, `_displayPartyPokemonHP`, …). Ce n'est pas une fuite harness (logique jeu correcte) mais une divergence de NOMS massive.
- `TickPartyScreen`/`OpenPartyScreen`/`ClosePartyScreen`/`RefreshPartySlot`/`PartyMenuAnimateHP` = API publique inventée (glue Phaser CB2), remplace `ShowPartyMenu`/`Task_*`.
- En-tête du fichier (`party_menu.ts:18` « MVP scope », `:24` « Future polish ») = commentaire partiellement obsolète : HP bar / gender / status / held item / action menu / stats sont désormais implémentés, contrairement à ce que dit la liste « Future polish ».
- Aucune fuite de logique harness DANS le fichier (les imports `harness/runtime/decomp-globals` sont le substrat GPU/palette assumé).

---

## pokemon_summary_screen.c → src/pokemon_summary_screen.ts
Statut : 🟡 PARTIEL (architecture TRÈS fidèle, noms `_camelCase` non conformes)
Fonctions : **9/140** sous nom 1:1 EXACT + **1 ailleurs** (`StopPokemonAnimations` → `src/pokemon_animation.ts:2063`) ; 129 non portées sous nom 1:1 — mais **134 helpers `_camelCase`** recouvrent la quasi-totalité de la logique décomp fn-par-fn. C'est le fichier le PLUS fidèle en architecture du domaine (l'en-tête `:3` revendique « Port FIDÈLE … PAS un MVP », justifié).

### Portées SOUS NOM 1:1 EXACT (9)
`CB2_InitSummaryScreen, CloseSummaryScreen, GetMoveSlotToReplace, ShowSelectMovePokemonSummaryScreen, Task_HandleInputCantForgetHMsMoves, Task_HandleInput_MovePositionSwitch, Task_HandleInput_MoveSelect, Task_HandleReplaceMoveInput, Task_SetHandleReplaceMoveInput`
→ Le noyau **oubli/remplacement de capacité** (`ShowSelectMovePokemonSummaryScreen` + `GetMoveSlotToReplace` + les 5 `Task_*` de sélection/réordre) garde les noms 1:1 ✅. C'est l'API consommée par `party_menu.ts` (TMHM/level-up), `battle_script_commands.ts` (Cmd_learnmoves), `evolution_scene.ts` et `move_relearner`. Vérifié : entrées présentes et nommées 1:1.

### Correspondance logique (helpers `_camelCase` ↔ décomp, échantillon)
| décomp | notre helper | note |
|---|---|---|
| `ShowPokemonSummaryScreen` (:2400) | `OpenSummaryScreen(mon, cb)` (:3340) | ⚠️ signature réduite (reconstruit `_monList=gPlayerParty` + index en interne ; nav U/D OK) |
| `InitBGs` (:1302) | `_initBGs` | 1:1 BG0 windows / BG1-2 ping-pong scroll / BG3 INFO |
| `DecompressGraphics` (:1321) | `_decompressGraphics`/`_loadAssets` | tiles + 5 tilemaps pages |
| `ResetWindows`/`InitWindows` (:2721) | `_resetWindows` | 20 windows label statiques |
| `PrintPageNamesAndStats` (:2832) | `_printPageNamesAndStats` | labels FR |
| `sTextPrinterFunctions` dispatch (:730) | `_printBattleMoves`/`_printContestMoves`/`_printInfoPageText`/skills | 4 pages |
| `PutPageWindowTilemaps` (:2887) | `_putPageWindowTilemaps` | |
| `ChangePage`/`PssScrollRight/Left` (:1761/1785/1828) | `_changePage`/`_changeBgX` | scroll hofs |
| `Task_HandleInput` (:1532) | `Task_HandleInput` (`naming_screen.ts:2000` = COLLISION, ici en interne non exporté) | U/D mon, L/R page |
| `GetAilmentFromStatus` | `_getAilmentFromStatus` | |
| `sMonSummaryScreen` struct (:128) | `sMon: SummaryState` (:493) | champs 1:1 (windowIds, bgTilemapBuffers, firstMoveIndex/secondMoveIndex/newMove/lockMovesFlag/lockMonFlag, currPageIndex, min/maxPageIndex, bgDisplayOrder, mode…) |

### Manquantes (branche non single-player courant)
- Variantes CONTEST/RIBBON détaillées, `PSS_MODE_BOX` (accès depuis PC boxes) : le mode BOX existe côté décomp mais notre entrée BOX n'est pas câblée (PC-storage UI absente — voir storage). L'oubli de capacité et le résumé party/battle/évolution = OK.

### Stubs suspects
- Aucun stub `return 0` silencieux détecté dans le corps. `GetMoveSlotToReplace` retourne la vraie valeur (`:474`).

### Fuites harness / noms / commentaires
- **134 helpers `_camelCase`** = même divergence de NOMS que party_menu (renommage systématique non conforme au mirror). Architecture 1:1, noms non-1:1.
- API publique inventée : `OpenSummaryScreen`/`CloseSummaryScreen`(≈`CloseSummaryScreen` OK)/`IsSummaryScreenOpen`/`GetSummaryLastMonIndex`/`TickPartyScreen`-équivalent VBlank/MainCB2 glue.
- `__summaryDebugState` (`:3383`) = sonde dev exposée (acceptable, hors 1:1).
- En-tête `:26` « Combat bytecode + overworld = scellés » : commentaire de garde, pas obsolète.

---

## pokemon_storage_system.c → src/pokemon_storage_system.ts
Statut : 🔴 DIVERGENT/ABSENT (le SYSTÈME PC boîtes n'existe PAS ; seuls 4 helpers de requête + struct + reset portés)
Fonctions : **4/380** sous nom 1:1 (toutes dans notre `pokemon_storage_system.ts`, ~90 lignes) + **1 ailleurs sous nom≠** (`ResetPokemonStorageSystem` → `emptyPokemonStorage` dans `save-blocks.ts:1623`). 373 non portées. Les 3 autres « ailleurs » détectés (`GiveItemToMon`/`InitMenu`/`PrintItemDescription`) sont des **collisions de noms** (fns homonymes locales à d'autres .c — le storage.c a ses propres `InitMenu`/`PrintItemDescription` pour son UI, différentes des nôtres) : NE PAS compter comme portées.

### Portées SOUS NOM 1:1 (4, toutes read-only)
| fn | notre ligne | décomp | rôle single-player |
|---|---|---|---|
| `CheckFreePokemonStorageSpace` | `pokemon_storage_system.ts:23` | :9572 | field_specials `ScriptCheckFreePokemonStorageSpace` + capture party-pleine |
| `StorageGetCurrentBox` | `:37` | :9404 | `ShouldShowBoxWasFullMessage` + `CopyMonToPC` |
| `AnyStorageMonWithMove` | `:52` | :9636 | `IsLastMonThatKnowsSurf` (anti-softlock oubli HM) |
| `CountStorageNonEggMons` | `:72` | :9600 | `CountPartyAliveNonEggMons` (pension) |
→ corps 1:1 fidèles, adaptés au modèle plat (`slot.species`/`!slot`) au lieu de `GetBoxMonData(SANITY_HAS_SPECIES)`. JSDoc cite les lignes décomp. ✅

### Portées SOUS NOM ≠ (frontière legit du domaine)
- `ResetPokemonStorageSystem` (:1729) → **`emptyPokemonStorage()`** (`save-blocks.ts:1623`) : `SetCurrentBox(0)` + zero tous les slots + `boxNames="BOITE 1..14"` + `boxWallpapers[i]=i%4`. Fidèle sauf ResetWaldaWallpaper (Walda déféré). Divergence de NOM.
- struct `PokemonStorage` (pokemon_storage_system.h:19) → `interface PokemonStorage` (`save-blocks.ts:1227`) : `currentBox`, `boxes[14][30]`, `boxNames[]`, `boxWallpapers[]`. Struct 1:1 ✅ (mais slots = `BoxPokemonSlot|null` = modèle plat, pas BoxPokemon chiffré — adaptation assumée).
- Party compaction : `CompactPartySlots` (:6734, appelé daycare/mystery_event) → PAS de fn homonyme ; l'effet (party compacte sans trous) est obtenu par `RefreshPlayerPartyViews` (`party-storage.ts:320`) qui reconstruit le tableau compact. Divergence structurelle assumée.

### Manquantes — 373 fns = TOUT le sous-système UI boîtes PC (ABSENT, VIVANT)
Le special **`ShowPokemonStorageSystemPC`** (l'entrée « PC de Bill / PC de Quelqu'un » → Déposer/Retirer/Déplacer un Pokémon) est un **STUB DUR** (voir Stubs). Clusters manquants :
- **UI boîtes principale (Task_/CB2_, ~36)** : `EnterPokeStorage`, `Task_InitPokeStorage`, `Task_ShowPokeStorage`, `Task_PokeStorageMain`, `Task_ReshowPokeStorage`, `CB2_*PokeStorage`, `LoadPokeStorageMenuGfx`, `InitPokeStorageBg0`, `InitPokeStorageWindows`, `FreePokeStorageData`. → tout le state-machine de l'écran PC.
- **Curseur / déplacement (Cursor/Move, ~30)** : `StartCursorAnim`, `MoveMon`, `PlaceMon`, `TryStorePartyMonInBox`, `SetShiftedMonData`, `IsCursorOnBox/Party/CloseBox`, `GetCursorPosition`, `InitBoxMonSprites`.
- **MULTI-MOVE (27, préfixe `MultiMove*`)** : sélection multi-mons pour déplacement en bloc = `MultiMove_Init/Start/RunFunction/SetIconToBg/…`. Feature avancée single-player.
- **Wallpapers (~15)** : `SetWallpaperForCurrentBox`, `LoadWallpaperGfx`, `DrawWallpaper`, `SetBoxWallpaper`, changement de fond de boîte.
- **Accessors box-data (VIVANT, dépendances externes)** : `GetBoxedMonPtr` (field_specials/tv/pokenav), `GetBoxNamePtr` (scrcmd/naming_screen/battle_script/pokenav), `GetBoxMonDataAt`/`GetAndCopyBoxMonDataAt`/`SetBoxMonDataAt`/`SetBoxMonNickAt` (menu_specialized/pokenav/tv), `CheckBoxMonSanityAt`, `AdvanceStorageMonIndex`, `CreateBoxMonAt`/`ZeroBoxMonAt`/`CopyBoxMonAt`, `SetCurrentBox`, `GetCurrentBoxName`. → **RIEN dans nos fichiers ported ne les appelle** (leurs callers — daycare/pokenav/tv/menu_specialized — ne sont pas encore portés) donc PAS de dépendance cassée aujourd'hui ; mais dès qu'on porte daycare/pokenav, ces accessors deviennent bloquants.
- **Icônes/sprites boîte (SpriteCB_, 17)** : `SpriteCB_CursorShaded/BoxMonIconMovement/HeldMon/…`.
- **Walda (phrase→wallpaper secret, ~8)** : `GetWaldaPhrasePtr`/`SetWaldaPhrase`/`IsWaldaPhraseEmpty`/`SetWaldaWallpaper*`. VIVANT (walda_phrase.c) mais feature de niche.

### Stubs suspects
- **`registerSpecial('ShowPokemonStorageSystemPC', () => 0)`** (`specials-registry.ts:2150`, dans une stub-loop) : ouvrir un PC → « PC DE QUELQU'UN » / déposer-retirer Pokémon = **NE FAIT RIEN**. C'est le plus gros trou fonctionnel du domaine (le joueur ne peut pas gérer ses boîtes PC). Le rangement AUTOMATIQUE d'un mon capturé quand la party est pleine FONCTIONNE (`CopyMonToPC`, party-storage.ts), mais il est impossible de le ressortir.

### Fuites harness / noms / commentaires
- Notre `pokemon_storage_system.ts` en-tête (`:6-8`) est HONNÊTE : dit explicitement « le système PC complet — UI boîtes, dépôt/retrait — est un gros sous-système déféré ». Pas de commentaire mensonger.
- `__CheckFreePokemonStorageSpace`/`__AnyStorageMonWithMove`/`__CountStorageNonEggMons`/`__getPokemonStorage` = sondes dev exposées (acceptable).
- Aucune fuite de logique harness ; aucun stub `return 0` déguisé dans le fichier (les 4 fns calculent vraiment).

---

## Synthèse — vérification du corps des fns portées (échantillon)
- `GiveItemToMon` (party_menu.ts:1946 ↔ party_menu.c:1799) : corps FIDÈLE (`ItemIsMail`→`GiveMailToMonByItemId`/MAIL_NONE abort→held item). Seule adaptation : `mon.heldItem = item` au lieu de `SetMonData(mon, MON_DATA_HELD_ITEM, itemBytes)` (modèle plat, comportement identique).
- `SwitchPartyMonSlots` (party-storage.ts:425 ↔ `SwitchPartyMon` party_menu.c:3016) : la moitié DATA (swap `*mon1`/`*mon2` via buffer) est 1:1 ; la moitié SPRITES (`SwitchMenuBoxSprites` ×4) est déportée dans `_finishTwoMonAction`. Nom≠ + fonction scindée.
- `CheckFreePokemonStorageSpace`/`StorageGetCurrentBox`/`AnyStorageMonWithMove`/`CountStorageNonEggMons` : corps 1:1 fidèles (double boucle 14×30, gardes identiques).
→ Conclusion : là où c'est porté, le CORPS est fidèle ; la divergence dominante du domaine est le RENOMMAGE (`_camelCase`) + la FSM `_phase` maison, pas des bugs de logique.

---

## TOP 5 (levier × effort)

1. **PC box storage UI entièrement absente — `ShowPokemonStorageSystemPC` = stub `()=>0`** (storage.c, 373/380 fns manquantes). **Levier ÉNORME** (le joueur ne peut PAS gérer ses boîtes : déposer/retirer/déplacer/wallpaper ; un mon envoyé au PC party-pleine est irrécupérable). **Effort L** (~10k lignes C : UI boîtes + curseur + multi-move + wallpapers + accessors). *Oracle* : field, parler à un PC (« PC DE QUELQU'UN » → « DÉPÔT/RETRAIT POKéMON ») → aujourd'hui l'option ne fait rien / retombe au menu. Cible prioritaire : d'abord les **accessors box-data** (`GetBoxedMonPtr`/`GetBoxNamePtr`/`GetBoxMonDataAt`/`SetBoxMonDataAt`) car ils débloquent daycare/pokenav/tv, PUIS l'UI.

2. **party_menu.ts : FSM `_phase` maison + 72 helpers `_camelCase` au lieu des `Task_*`/`CursorCb_*` 1:1** (viole « substrat + tasks-témoin » ; 303/354 fns sans nom 1:1). **Levier fort** (fichier central, tous les flux équipe le traversent ; la dette de renommage bloque tout import futur depuis la décomp). **Effort L** (renommer + re-router vers `gTasks`/`.func` + tables `sCursorOptions`). *Oracle* : ouvrir l'équipe (touche adéquate en field), A sur un mon → menu RESUME/ORDRE/OBJET/RETOUR, vérifier chaque CursorCb ; comportement OK aujourd'hui, c'est la STRUCTURE qui diverge.

3. **`ChoosePartyMon` = stub `()=>0` + `ChooseMonForMoveRelearner` dans stub-loop** (specials-registry.ts:909/1947). **Levier moyen-fort** (specials VIVANTS : sélection de mon par script field + Rappel de Capacités PNJ → cassés/inactifs). **Effort S/M** (câbler le special vers `OpenPartyScreen` en mode choix + retour `gSpecialVar_Result`, et brancher `ShowSelectMovePokemonSummaryScreen` déjà porté pour le relearner). *Oracle* : déclencher un script qui appelle `special ChoosePartyMon` (ex. remise d'objet/donner à un mon par PNJ) → aujourd'hui slot 0 forcé ; PNJ Move Relearner → aujourd'hui rien.

4. **pokemon_summary_screen.ts : 134 helpers `_camelCase` au lieu des noms 1:1 (9/140)** — architecture fidèle mais noms non conformes. **Levier moyen** (2e fichier du domaine ; l'oubli de capacité garde déjà les noms 1:1, donc dette surtout cosmétique/mirror). **Effort M** (renommage mécanique `_printBattleMoves`→`PrintBattleMoves`, `_initBGs`→`InitBGs`, `sMon`→`sMonSummaryScreen`, etc.). *Oracle* : équipe → RESUME → naviguer L/R (INFOS/APTITUDES/CAPACITÉS/CONCOURS) + U/D entre mons ; rendu déjà correct.

5. **`GiveItemToMon` & consorts : `mon.heldItem=x` au lieu de `SetMonData(MON_DATA_HELD_ITEM)`** (modèle plat court-circuite l'API mon-data dans party_menu.ts). **Levier faible-moyen** (mineur seul, mais symptomatique : plusieurs sites party_menu écrivent les champs mon en direct au lieu de passer par SetMonData → risque de désync si des hooks SetMonData sont ajoutés). **Effort S** (remplacer les accès directs par SetMonData/GetMonData aux ~10 sites held-item/nickname). *Oracle* : donner un objet à un mon depuis le sac (give-from-bag) puis vérifier en combat/résumé que l'objet tenu est cohérent ; OK aujourd'hui.

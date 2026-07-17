# PLAN de consolidation `party_menu.c` → foyer miroir `src/party_menu.ts`

Défrichage LECTURE SEULE. Oracle : `node scripts/decomp-index.cjs --file party_menu.c`
= **354 fonctions (89 déclarées · 76 référencées · 189 absentes)** + 15 globals (4/6/5)
+ 37 defines (8/4/25) + 59 enums (27/4/28). Modèle : `PLAN-dissolution-bag-screen.md`.

> ⚠️ **Différence de nature avec bag-screen.** Le sac avait un CLONE séparé
> (`engine/bag/bag-screen.ts`) à côté du miroir vivant (`item_menu.ts`) : la dissolution
> = supprimer le clone + recâbler 3 call-sites. **Le party menu N'A PAS de clone.**
> `src/party_menu.ts` (4539 l.) **EST** le foyer miroir, mais c'est un **HYBRIDE** : ~40 %
> de vraies fonctions 1:1 (nom décomp exact, exportées vers item_use/battle_main/…) greffées
> sur une **state-machine maison** (`_phase` + un méga-handler) qui **inline** le reste. La
> « consolidation » = **remplacer l'adaptation IN-PLACE, fonction par fonction**, par le
> substrat 1:1 (gTasks `task.func`, `sCursorOptions[]`, structs `PartyMenu*`), l'écran restant
> jouable à chaque lot. Pas de suppression de fichier ; le « foyer » ne bouge pas.

---

## 0. Résumé exécutif (verdicts)

| Question | Verdict |
|---|---|
| Où vit le party menu jouable ? | **`src/party_menu.ts`** (4539 l.) — pas de clone. Data annexes : `src/data/party_menu.ts` (31 l., seulement `sTMHMMoves`), `include/constants/party_menu.ts` (126 l.). Fonctions satellites hébergées **hors foyer** : ordre de combat → `src/battle_main.ts:2060-2127` ; `SwitchPartyMonSlots`+`gPlayerParty` → `src/engine/battle/party-storage.ts` ; `ItemUseCB_*` (Medicine/PP/RareCandy/EV/SacredAsh) + `CB2_ShowPartyMenuForItemUse`/`CB2_ReturnToBagMenu` → `src/item_use.ts:108-484`. |
| Quelle est l'« adaptation » à dissoudre ? | **La state-machine maison** : (a) `_phase` string (party_menu.ts:347) au lieu de `gTasks[].func` ; (b) `Task_PartyMenu_HandleInput` (3494→3947, **~450 l.**) qui inline `PartyMenuButtonHandler`+`HandleChooseMonSelection`+`HandleChooseMonCancel`+7 `Task_*` state-machines ; (c) `_handleActionMenuInput` (3420→3487) qui inline `Task_HandleSelectionMenuInput`+le dispatch `sCursorOptions[].func` ; (d) helpers `_`-render (`_drawSlot`/`_drawHpBar`/`_displayPartyPokemonData`) au lieu de `RenderPartyMenuBox`+`DisplayPartyPokemonData` ; (e) helpers `_`-sprite (`_spawnIconOams`…) au lieu de `CreatePartyMon*Sprite` ; (f) structs éclatées en `let` module (`gPartyMenu`→`_menuType/_partyAction/_slotId`, `sPartyMenuInternal`→`_actionList/_lvlUpStatsWinId/…`, `sPartyMenuBoxes`→tableaux par-slot `_iconOamBySlot/…`). |
| Le loader CB2 est-il déjà 1:1 ? | **QUASI.** `CB2_InitPartyMenu` (party_menu.ts:3952, states 0-20) miroite déjà `CB2_InitPartyMenu`/`ShowPartyMenu` (party_menu.c:551/560) case par case. **Le loader n'est PAS le chantier** — c'est le dispatch INPUT + le rendu qui sont adaptés. |
| Combien de lots ? | **10 lots** ≤ ~300 l. diff (dont 3 « atteignables-solo absents » optionnels : mail, toss, move-relearner/tutor/deleter). |
| Risque n°1 | **Le retour COMBAT** (`PARTY_ACTION_SEND_OUT`) court-circuité par ponts `globalThis.__battleSwitchResultSlot` + `__battlePartyOrder` (party_menu.ts:3898/4237) au lieu de `TrySwitchInPokemon`/`CB2_SetUpExitToBattleScreen`/`gBattlePartyCurrentOrder` 1:1 (party_menu.c:5800/6119). Re-transcrire touche la state-machine de reshow combat = classe « victoire prématurée / mauvais mon en tête ». |
| Quick-win | **Extraire le dispatch action-menu** (`_handleActionMenuInput`) vers une vraie table `sCursorOptions[]` + `CursorCb_*(taskId)` standalone (party_menu.h:658). Sous-système isolé, ~9 fonctions `·`→`✓` d'un coup, aucune régression du choix-mon. |
| `TickPartyScreen` | **Mort.** party_menu.ts:4503 = no-op stub ; `start_menu.ts:788` l'appelle encore dans une branche `'party_screen'` **morte** (le CB2 swap a pris le relais, cf. `CB2_InitPartyMenu` default:4050). À supprimer au Lot 9. |

---

## 1. Cartographie de l'existant — qui héberge quoi

### 1.a Le foyer `src/party_menu.ts` (4539 l.) — 3 couches

**Couche A — vraies fonctions 1:1 (nom décomp exact, `✓` oracle).** Déjà déclarées au foyer,
souvent exportées. Non concernées par la dissolution (elles SONT la cible) :
- Cycle capacités/évolution : `ItemUseCB_TMHM`:1230, `ItemUseCB_EvolutionStone`:1280, `CanMonLearnTMTutor`:1184, `ItemIdToBattleMoveId`:4536.
- Anim slot/icône : `AnimatePartySlot`:984.
- Don/prise d'objet : `TryTakeMonItem`:2271, `GiveItemToMon`:2377, `CB2_ChooseMonToGiveItem`:2444, `CB2_SelectBagItemToGive`:2341, `CB2_GiveHoldItem`:2349, `TryGiveItemOrMailToSelectedMon`:2477, `GiveItemOrMailToSelectedMon`:2495, `RemoveItemToGiveFromBag`:2507, `ReturnGiveItemToBagOrPC`:2512, `GiveItemToSelectedMon`:2570, `DisplayItemMustBeRemovedFirstMessage`:2586, `CB2_WriteMailToGiveMonFromBag`:2523, `CB2_ReturnToPartyOrBagMenuFromWritingMail`:2546.
- Field moves : `FieldCallback_Surf`:2955, `SetUpFieldMove_Surf`:2969, `_Fly`:3055, `GetCursorSelectionMonId`:2933, `GetFieldMoveMonSpecies`:2941, `FieldCallback_PrepareFadeInFromMenu`:3290, `CursorCb_FieldMove`:3338, `PartyMenuDisplayYesNoMenu`:3077.
- Level-up box : `CreateLevelUpStatsWindow`:4278, `RemoveLevelUpStatsWindow`:4289, `DisplayLevelUpStatsPg1`:4302, `DisplayLevelUpStatsPg2`:4314.
- Loader/close : `CB2_InitPartyMenu`:3952, `Task_FadeAndClosePartyMenu`:1822, `Task_ClosePartyMenu`:1829, `Task_PartyMenuWaitForFade`:4172, `Task_FieldMoveWaitForFade`:3272, `Task_DisplayHPRestoredMessage`:3212, `CB2_ReturnToPartyMenuWhileLearningMove`:1115, `CB2_FadeFromPartyMenu`:4155, `ChooseMonForDaycare`:4118, `BufferMonSelection`:4142.

**Couche B — helpers `_`-adaptés (oracle `≈` si nom auto-matché, sinon `·`).** Comportement
souvent 1:1-annoté mais **signature module-state** (pas de `taskId`) + **nom non décomp** :
- Render : `_drawSlot`:723, `_drawAllSlots`:817, `_drawSlotFrame`:673, `_drawHpBar`:842, `_displayPartyPokemonData`:2750 (`≈`→DisplayPartyPokemonData), `_displayPartyPokemonHP`:703 (`≈`), `_displayPartyPokemonMaxHP`:715 (`≈`), `_loadPartyBoxPalette`:910 (`≈`), `_getPartyBoxPaletteFlags`:971 (`≈`), `_updatePartyMonAilmentGfx`:1602 (`≈`), `_drawMsg`:1349, `_drawCancelButtonWindow`:1034.
- Action menu : `_openActionMenu`:2159, `_renderActionMenuContents`:2118, `_spawnActionWindow`:2224, `_closeActionMenu`:2592, `_removeActionWindow`:2250.
- Cursor callbacks : `_cursorCbItem`:2262, `_cursorCbTakeItem`:2282, `_cursorCbCancel2`:2315, `_cursorCbGive`:2326, `_cursorCbSwitch`:2616.
- Switch/slide : `_switchPartyMon`:2694 (`SwitchPartyMon`), `_switchSelectedMons`:2860 (`SwitchSelectedMons`), `_finishTwoMonAction`:2719 (`≈`FinishTwoMonAction), `_switchMenuBoxSprites`:2638 (`≈`), `_movePartyMenuBoxSprites`:2782 (`≈`), `_slidePartyMenuBoxOneStep`:2802 (`≈`), `_tryMovePartySlot`:2758 (`≈`), `_moveAndBufferPartySlot`:2769 (`≈`).
- Input/curseur : `_partyMenuButtonHandler`:1894 (`≈`PartyMenuButtonHandler), `_updateSlotIdSingle`:1861.
- Sprites : `_spawnIconOams`:1704, `_spawnHeldItemOams`:1637, `_spawnStatusOams`:1538, `_spawnSlotPokeballOams`:1483, `_spawnCancelButtonOam`:1681, `_updateMonIconFrame`:1961, `_animateSelectedPartyIcon`:2002 (`≈`).

**Couche C — state-machine maison (l'ADAPTATION dure à dissoudre).**
- `_phase` : `'idle'|'open'|'action_menu'|'fading_out'|'switching'|'item_used_msg'|'hp_anim'|…` (party_menu.ts:347) — remplace `gTasks[taskId].func`.
- `Task_PartyMenu_HandleInput`:3494 (**~450 l.**) — 1 seule `gTask` qui **branche sur `_phase`** ; inline : `_handleActionMenuInput` (action menu), `_tickHpAnim` (hp), `Task_ClosePartyMenuAfterText` (item_used_msg:3510), `Task_ReturnToChooseMonAfterText`/`Task_CancelAfterAorBPress` (field_move_err/cancel:3522/3539), `Task_HandleFieldMoveExitAreaYesNoInput` (fieldmove_yesno:3574), `Task_HandleSwitchItemsYesNoInput`/`…FromBag…` (switch_items_yesno:3596), `Task_DisplayLevelUpStatsPg1/Pg2`+`Task_TryLearnNewMoves`+`Task_TryLearningNextMove` (levelup_*:3639-3691), `Task_DoLearnedMoveFanfareAfterText`+`Task_LearnNextMoveOrClosePartyMenu` (:3693-3712), `Task_ReplaceMoveYesNo`+`…Input`+`Task_ShowSummaryScreenToForgetMove` (replace/which_move:3714-3748), `Task_ReturnToPartyMenuWhileLearningMove` (learnmove_return:3750), `Task_PartyMenuReplaceMove` (forgot_move:3761), `Task_StopLearningMoveYesNo`+`…Input` (stop_learning:3768), enfin le vrai `Task_HandleChooseMonInput` (branche `_phase==='open'`:3803) qui inline `PartyMenuButtonHandler`→`HandleChooseMonSelection`/`HandleChooseMonCancel` (dispatch par `_partyAction`, :3804-3945).
- `_handleActionMenuInput`:3420 — inline `Task_HandleSelectionMenuInput` (party_menu.c:2740) + le dispatch `sCursorOptions[actions[input]].func(taskId)` (party_menu.c:2760/2764) sous forme de `if(action===MENU_*)` (CursorCb_Summary inline:3435, Switch:3455, Item:3457, Store:3461, Give:3467, TakeItem:3469, Cancel2:3471, Mail=stub « dette R3 »:3477, FieldMove:3481).

**Structs éclatées** (globals décomp `✗` absents) :
- `gPartyMenu` (party_menu.c:219) → `_menuType`:474, `_partyAction`:469, `_slotId`:460, `_slotId2`:489, `_cursorSelectionMonId`:479, `_lastSelectedSlot`:461.
- `sPartyMenuInternal` (party_menu.c:218, struct :186) → `_actionList`:381, `_actionCursor`:379, `_actionWindowId`:380, `_lvlUpStatsWinId`:366, `_inputTaskId`:440, `_msgWid`:438… (+ `exitCallback`→`_partyTransientExitCb`:407 / `rt.gMain.savedCallback`).
- `sPartyMenuBoxes[]` (party_menu.c:220, struct :206) → tableaux par-slot `_iconOamBySlot`:443, `_statusOamBySlot`:304, `_itemOamBySlot`:323, `_pokeballOamBySlot`:446, `_slotWindowIds`:437.
- `sSlot1/2TilemapBuffer` (party_menu.c:226/227) → `_sSlot1Buf`/`_sSlot2Buf`:2737/2738.
- `sPartyMenuItemId` (party_menu.c:229) → `_partyBagItem`:401 / `_giveOldItem`:392.

### 1.b Data — inline vs foyer data

| Table décomp | Emplacement | Port |
|---|---|---|
| `sCursorOptions[]` | data/party_menu.h:658 | **inline** en `if/else` dans `_handleActionMenuInput` + consts `MENU_*` (party_menu.ts:2049-2060) + `ACTION_MENU_STRINGS_FR`:2081 (localisation FR maison, PAS `getString`). |
| `sPartyMenuActions[]` / `sPartyMenuActionCounts[]` | data/party_menu.h:709/727 | **inline** dans `_openActionMenu`/`_renderActionMenuContents` (pas de table). |
| `sFieldMoves[]` | data/party_menu.h:745 | consts `FIELD_MOVE_*` (party_menu.ts:2908) + `sFieldMoveMoveConstants`:2102. |
| `sFieldMoveCursorCallbacks[]` | data/party_menu.h:770 | **porté** en `Record` (party_menu.ts:3305) — 1:1 partiel (Cut/RockSmash/Dive/SecretPower manquants). |
| `sTMHMMoves[]` | data/party_menu.h (:1129) | ✅ `src/data/party_menu.ts:12`. |

---

## 2. Call-sites entrants — qui ouvre le party menu (décomp ↔ port)

| Entrée | Décomp (appelant → fonction) | Port (appelant → fonction) | Résultat de retour |
|---|---|---|---|
| **Start menu** | `start_menu.c:662` `SetMainCallback2(CB2_PartyMenuFromStartMenu)` (→ party_menu.c:5352 → `InitPartyMenu(FIELD, SINGLE, CHOOSE_MON, …, Task_HandleChooseMonInput, CB2_ReturnToFieldWithOpenMenu)`) | `start_menu.ts:259` `sPendingScreenAction = () => OpenPartyScreen()` (→ party_menu.ts:4088). **`start_menu.ts:788 TickPartyScreen(newKeys)` = branche morte.** | B → `savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual` (party_menu.ts:4101). |
| **Combat (switch / envoi K.O.)** | `battle_controller_player.c:1355` `OpenPartyMenuInBattle(caseId)` (→ party_menu.c:5774 → `InitPartyMenu(IN_BATTLE, …, SEND_OUT, …, CB2_SetUpReshowBattleScreenAfterMenu)`) | `battle_controller_player.ts:2116` `party.OpenPartyScreenForBattleSwitch(reshow.CB2_SetUpReshowBattleScreenAfterMenu, {activeSlot, allowCancel})` (→ party_menu.ts:4223) | **PONT** `globalThis.__battleSwitchResultSlot` (party_menu.ts:3898) + `__battlePartyOrder` (4237) au lieu de `TrySwitchInPokemon`/`gBattlePartyCurrentOrder`. ⚠️ Risque n°1. |
| **Objet du sac → party (Medicine/PP…)** | `item_use.c:84` `[ITEM_USE_PARTY_MENU-1] = CB2_ShowPartyMenuForItemUse` (→ party_menu.c:4229) | `item_use.ts:135` `OpenPartyScreenForItemUse(CB2_ReturnToBagMenu)` (→ party_menu.ts:4197). Aussi `bag-screen.ts:1840` (clone combat) même appel. | `gItemUseCB` (globalThis) invoqué au A (party_menu.ts:3839-3845) ; retour → `savedCallback = CB2_ReturnToBagMenu`. |
| **Donner objet du sac (GIVE)** | `item_menu.c:1948` `gBagMenu->newScreenCallback = CB2_ChooseMonToGiveItem` (→ party_menu.c:5359) | `item_menu.ts:3518` idem ; `CB2_ChooseMonToGiveItem` ré-exporté via `item_use.ts:83` (→ party_menu.ts:2444 → `OpenPartyScreenForGiveItem`:2452). | `PARTY_ACTION_GIVE_ITEM` → `TryGiveItemOrMailToSelectedMon` (3863). |
| **Pension (dépôt)** | `daycare.c:1296` `ChooseMonForDaycare()` (→ party_menu.c:6197) | `daycare.ts:1348` pont `globalThis.__ChooseMonForDaycare` (party_menu.ts:4525) → `ChooseMonForDaycare`:4118. | `BufferMonSelection` (4142) → `gSpecialVar` ; slot annulé = `PARTY_NOTHING_CHOSEN` (3935). |

Autres appels internes au foyer : `CB2_ReturnToBagMenu`:2468, `OpenPartyScreenForGiveItem`:2452, `ShowPartyMenuItemMessage`:4268 (msg + ack, importé item_use.ts).

---

## 3. Mapping fonction par fonction — les 76 `·` + les absents ATTEIGNABLES-solo

> Légende cible : **[rename]** helper `_` déjà 1:1-comportement → renommer + adapter signature
> `taskId` ; **[extract]** logique inlinée dans un méga-handler → sortir en fonction standalone ;
> **[port]** absente, à transcrire ; **[skip]** hors-solo (frontier/link/contest/minigame/trade).

### 3.a Dispatch CHOIX-MON (`·`, inlinés dans `Task_PartyMenu_HandleInput`) — **[extract]**
| Décomp | Ligne | Équivalent actuel | Cible |
|---|---|---|---|
| `Task_HandleChooseMonInput` | 1259 | branche `_phase==='open'` party_menu.ts:3803 | [extract] vraie `gTask` |
| `GetCurrentPartySlotPtr` | 1284 | implicite (`_slotId` vs `_slotId2` selon action) | [port] retourne slot selon `_partyAction` |
| `HandleChooseMonSelection` | 1292 | inline :3804-3911 (switch `_partyAction`) | [extract] |
| `HandleChooseMonCancel` | 1378 | inline :3912-3944 | [extract] |
| `IsSelectedMonNotEgg` | 1368 | inline (`mon.isEgg`→PlaySE(SE_FAILURE), :3837) | [port] |
| `PartyMenuButtonHandler` | 1455 | `_partyMenuButtonHandler`:1894 (`≈`) | [rename] |
| `UpdateCurrentPartySelection` | 1505 | `_updateSlotIdSingle`:1861 | [rename]+[port double layout] |
| `Task_TryCreateSelectionWindow` | 2731 | via `_openActionMenu`:2159 | [extract] |
| `DisplayCancelChooseMonYesNo` | 1408 | absent (default cancel direct) | [port] (solo : contest/chooseHalf → skip, mais garde le squelette) |

### 3.b ACTION-MENU / `sCursorOptions` (`·`, inlinés dans `_handleActionMenuInput`) — **[extract]** (QUICK-WIN)
| Décomp | Ligne | Actuel | Cible |
|---|---|---|---|
| `Task_HandleSelectionMenuInput` | 2740 | `_handleActionMenuInput`:3420 | [extract] |
| `CreateSelectionWindow` | 2696 | `_openActionMenu`:2159 | [extract] |
| `DisplaySelectionWindow` | 2524 | `_renderActionMenuContents`:2118 | [extract] |
| `SetPartyMonSelectionActions` | 2591 | inline `_openActionMenu` | [port] + table `sPartyMenuActions[]` |
| `SetPartyMonFieldSelectionActions` | 2607 | inline (field moves + SUMMARY) | [port] |
| `GetPartyMenuActionsType` | 2639 | inline | [port] |
| `CursorCb_Summary` | 2770 | inline :3435 | [extract] `CursorCb_Summary(taskId)` |
| `CursorCb_Switch` | 2797 | `_cursorCbSwitch`:2616 | [rename] |
| `CursorCb_Cancel1` | 3062 | inline (close action menu) | [extract] |
| `CursorCb_Cancel2` | 3482 | `_cursorCbCancel2`:2315 | [rename] |
| `CursorCb_Item` | 3074 | `_cursorCbItem`:2262 | [rename] |
| `CursorCb_Give` | 3086 | `_cursorCbGive`:2326 | [rename] |
| `CursorCb_TakeItem` | 3273 | `_cursorCbTakeItem`:2282 | [rename] |
| `CursorCb_Store` | 3587 | inline :3461 | [extract] |
| table `sCursorOptions[]` | party_menu.h:658 | `if/else` MENU_* | [port] table `{text, func}` |

### 3.c SWITCH / SLIDE (`·`/`≈`) — **[rename]** (déjà 1:1-comportement)
`SwitchPartyMon`:3016→`_switchPartyMon`:2694 · `SwitchSelectedMons`:2822→`_switchSelectedMons`:2860 · `FinishTwoMonAction`:3038→`_finishTwoMonAction`:2719 (`≈`) · `SwitchMenuBoxSprites`:2995 (`≈`) · `MovePartyMenuBoxSprites`:2907 (`≈`) · `SlidePartyMenuBoxOneStep`:2925 (`≈`) · `TryMovePartySlot`:2869 (`≈`) · `Task_SlideSelectedSlotsOffscreen/Onscreen`:2936/2966→`_taskSlideSelectedSlots*`:2809/2837.

### 3.d RENDU BOÎTE (`·`/`≈`) — **[rename]+[port struct]**
`RenderPartyMenuBox`:824 (comment-only) / `RenderPartyMenuBoxes`:1044 → `_drawSlot`:723+`_drawAllSlots`:817 · `DisplayPartyPokemonData`:872→`_displayPartyPokemonData`:2750 (`≈`) · `DisplayPartyPokemonHP/MaxHP`:2367/2388→703/715 (`≈`) · `DrawEmptySlot`:2193 (inline `_drawSlot`) · `BlitBitmapToPartyWindow`:2150 (**absent** — rendu direct via `BlitBitmapToWindow` du foyer window.ts, cf. §5) · `DisplayPartyPokemonBarDetail`:2282 (absent). Famille `DisplayPartyPokemon*Check` (2300-2436) = **[port]** ou reste inline `_drawSlot`.

### 3.e SPRITES party (`·`) — **[rename]+[port]**
`CreatePartyMonSprites`:1058→`_spawnIconOams`:1704 · `CreatePartyMonIconSprite`:3928→idem · `CreatePartyMonHeldItemSprite`:4021→`_spawnHeldItemOams`:1637 · `CreatePartyMonPokeballSprite`:4122→`_spawnSlotPokeballOams`:1483 · `CreatePartyMonStatusSprite`:4184→`_spawnStatusOams`:1538 · `SpriteCB_BouncePartyMonIcon`:4003/`SpriteCB_UpdatePartyMonIcon`:4016→`Task_PartyMenu_BounceIcon`:2025+`_updateMonIconFrame`:1961 · `LoadPartyMenuAilmentGfx`:4223→`_loadStatusIconsGfx`:1527 · `PartyMenuStartSpriteAnim`:4152 (`·`).

### 3.f Absents ATTEIGNABLES-solo (à porter, priorité décroissante) — **[port]**
- **MAIL depuis party** (dette « R3 » party_menu.ts:3477) : `CursorCb_Mail`:3369, `CursorCb_Read`:3381, `CursorCb_TakeMail`:3399, `CB2_ReadHeldMail`:3388, `CB2_ReturnToPartyMenuFromReadingMail`:3393, `Task_SendMailToPCYesNo`:3408, `Task_HandleSendMailToPCYesNoInput`:3417, `Task_LoseMailMessageYesNo`:3443, `CursorCb_TakeMail`→`Task_UpdateHeldItemSprite`:3255. (Nécessite l'écran ReadMail — sous-système à part.)
- **JETER objet tenu** (ACTIONS_TAKEITEM_TOSS) : `CursorCb_Toss`:3300, `Task_TossHeldItem`:3354, `Task_TossHeldItemYesNo`:3324, `Task_HandleTossHeldItemYesNoInput`:3333.
- **HP-bar 1:1** (l'adaptation `PartyMenuAnimateHP`/`_tickHpAnim`:4369/4397 marche) : `PartyMenuModifyHP`:1858, `Task_PartyMenuModifyHP`:1839, `ResetHPTaskData`:1874, `UpdateHPBar`:3951, `UpdatePartyMonHPBar`:3973. Priorité basse (cosmétique OK).
- **COMBAT item→party 1:1** (solo via sac combat) : `ChooseMonForInBattleItem`:5781, `CB2_SetUpExitToBattleScreen`:6119, `GetPartyMenuActionsTypeInBattle`:5788, `GetPartyLayoutFromBattleType`:5765. Couplé au Lot combat (voir §4-Lot 7 + risque n°1).
- **Choix-mon pour AUTRES écrans solo** (pattern `ChooseMonForDaycare`) : `ChooseMonForMoveTutor`:5755 + `TryTutorSelectedMon`:5318 + `CanLearnTutorMove`:2066 + `GetTutorMove`:2061 · `ChooseMonForMoveRelearner`:6279 + `CB2_ChooseMonForMoveRelearner`:6296 + `Task_ChooseMonForMoveRelearner`:6286 · `MoveDeleterChooseMoveToForget`:6341 + `MoveDeleterForgetMove`:6368 + `ShiftMoveSlot`:6378 + `BufferMoveDeleterNicknameAndMove`:6359 + `GetNumMovesSelectedMonHas`:6347 + `IsSelectedMonEgg`:6399 + `IsLastMonThatKnowsSurf`:6407. (Chacun = son propre script/écran ; le party menu n'est que le sélecteur.)
- **CT/CS learn depuis field** (déjà `_dispatchLearnMoveResult`:1063) : `DisplayLearnMoveMessage`:4718, `Task_LearnedMove`:4769, `DisplayMonLearnedMove`:5124 (`≈`), etc. — quasi tous `≈` déjà.

### 3.g Absents HORS-SOLO — **[skip]** (lister, ne pas porter)
- **Frontier/chooseHalf** : `BattlePyramidChooseMonHeldItems`:6324, `DoBattlePyramidMonsHaveHeldItem`:6307, `Task_BattlePyramidChooseMonHeldItems`:6331, `DisplayPartyPokemonDataForBattlePyramidHeldItem`:962, `InitChooseHalfPartyForBattle`:5566, `GetBattleEntryEligibility`:5587, `Get{Max,Min}BattleEntries`:5697/5710, `CheckBattleEntriesAndGetMessage`:5620, `Task_{Continue,Validate}…HalfParty`:5687/5670, `GetFacilityCancelString`:5738.
- **Contest** : `CB2_ChooseContestMon`:6251, `ChooseContestMon`:6234, `Task_ChooseContestMon`:6241, `DisplayPartyPokemonDataForContest`:930, `CancelParticipationPrompt`:2000, `Task_CancelParticipationYesNo`:2007.
- **Link/multi** : `SwitchPartyOrderLinkMulti`:5990, `Task_InitMultiPartnerPartySlideIn`:6131, `Task_MultiPartnerPartySlideIn`:6140, `ShowPartyMenuToShowcaseMultiBattleParty`:6124, `MoveMultiPartyMenuBoxSprite`:6171, `DisplayPartyPokemonDataForMultiBattle`:1020, `Task_WaitForLinkAndReturnToChooseMon`:1736, `BufferBattlePartyOrderBySide`:5924.
- **Minigame/wireless** : `IsMonAllowedInMinigame`:1976, `…PokemonJump`:1961, `…DodrioBerryPicking`:1969, `TryEnterMonForMinigame`:1983, `ChooseMonForWirelessMinigame`:5760, `SetPartyMonsAllowedInMinigame`:1938, `DisplayPartyPokemonDataForWirelessMinigame`:954.
- **Trade board** : `ChooseMonForTradingBoard`:5750, `CursorCb_Trade1/2`:3621/3647, `Task_{SpinTradeYesNo,HandleSpinTradeYesNoInput}`:3676/3686, `CreateHeldItemSpriteForTrade`:4093, `DrawHeldItemIconsForTrade`:4067.

---

## 4. Plan d'exécution ordonné (10 lots ≤ ~300 l. diff)

> Invariant CHAQUE lot : `npx tsc --noEmit` = 0 ; l'écran party RESTE jouable (start menu +
> summary + combat + objet). Substrat d'abord, bascule par sous-système, adaptation retirée
> **derrière** la vraie fonction. « Inerte-mais-1:1 > testable-mais-improvisé » (CLAUDE.md R1).
> Critère de mort de l'adaptation = **par fonction** : la vraie fonction (nom décomp exact +
> signature `taskId`/struct) est déclarée au foyer ET l'écran passe son test en jeu.

### LOT 1 — Substrat structs (INERTE)
- **Fichiers** : `src/party_menu.ts`.
- Transcrire les **structs** `PartyMenuInternal` (party_menu.c:186), `PartyMenuBox` (:206),
  `PartyMenuBoxInfoRects` (:176) comme interfaces + un objet `gPartyMenu` (:219) réunissant
  `menuType/action/slotId/slotId2/…`. Poser `sPartyMenuInternal`/`sPartyMenuBoxes[]` en module
  state, **alimentés en PARALLÈLE** des `let` existants (double-écriture) sans encore les lire.
- **Test** : `tsc` vert + boot sain (INERTE — rien ne lit encore les structs).
- **Critère** : structs déclarées ; `gPartyMenu.slotId` renvoie `_slotId`.

### LOT 2 — QUICK-WIN : table `sCursorOptions` + `CursorCb_*` standalone — ✅ FAIT `e0f9d6974` (validé en jeu 2026-07-17 : menu d'actions, sous-menu objet libellés ROM PRENDR./LETTRE, B 1:1 → retour menu d'action, RESUME)
- **Fichiers** : `src/party_menu.ts` (+ éventuel `src/data/party_menu.ts` pour les tables).
- [extract] sortir de `_handleActionMenuInput` (3420) les `CursorCb_Summary`:2770, `_Store`:3587,
  `_Cancel1`:3062, `_Cancel2`:3482 en fonctions `CursorCb_X(taskId)` ; [rename] `_cursorCbSwitch/
  Item/Give/TakeItem` → `CursorCb_Switch/Item/Give/TakeItem`. Poser la table `sCursorOptions[]`
  (party_menu.h:658) `{text, func}` + `sPartyMenuActions[]`/`Counts[]` (:709/727). `_handleAction
  MenuInput` devient `Task_HandleSelectionMenuInput` (2740) : `sCursorOptions[actions[input]].func(taskId)`.
- **Test EN JEU** : start menu → POKéMON → un mon → RÉSUMÉ / ORDRE / OBJET(DONNER/PRENDRE) / RETOUR.
  Screenshot. Non-régression des libellés FR (garder `ACTION_MENU_STRINGS_FR`→`getString` si possible).
- **Critère** : ~9 fonctions `·`→`✓` ; le dispatch action passe par la table.

### LOT 3 — `SetPartyMonSelectionActions` + `GetPartyMenuActionsType` 1:1 — ✅ FAIT `5f3a2317c` (validé en jeu : field moves EN BLEU font-4, ordre 1:1, sous-menu OBJET template 1:1)
- **Fichiers** : `src/party_menu.ts`.
- [port] `SetPartyMonSelectionActions`:2591, `SetPartyMonFieldSelectionActions`:2607,
  `GetPartyMenuActionsType`:2639, `CreateSelectionWindow`:2696, `Task_TryCreateSelectionWindow`:2731,
  `DisplaySelectionWindow`:2524. `_openActionMenu`/`_renderActionMenuContents` délèguent puis meurent.
- **Test EN JEU** : le contenu du menu d'action varie bien selon le mon (objet tenu → PRENDRE ;
  field moves listés). Screenshot.
- **Critère** : plus de construction de liste d'actions inline.

### LOT 4 — Dispatch choix-mon 1:1 (`Task_HandleChooseMonInput`) — ✅ FAIT `25965a858` (8 fns extraites, ponts combat conservés pour lot 7, 8 divergences annotées in-code ; + fix ordre PartyMenuRemoveWindow :2702 = trou msgbox du menu d'action, bug user)
- **Fichiers** : `src/party_menu.ts`.
- [extract] la branche `_phase==='open'` (3803) → vraie `Task_HandleChooseMonInput`:1259 +
  `GetCurrentPartySlotPtr`:1284 + `HandleChooseMonSelection`:1292 + `HandleChooseMonCancel`:1378 +
  `IsSelectedMonNotEgg`:1368 ; [rename] `_partyMenuButtonHandler`→`PartyMenuButtonHandler`:1455,
  `_updateSlotIdSingle`→`UpdateCurrentPartySelection`:1505. `CB2_InitPartyMenu` case 12 (party_menu.ts:3997)
  crée `Task_HandleChooseMonInput` au lieu de `Task_PartyMenu_HandleInput`.
- **Test EN JEU** : nav curseur (haut/bas), A (menu), B (retour OW), tous modes (field/give/item/daycare/send-out).
- **Critère** : `Task_HandleChooseMonInput` déclaré ; le choix-mon ne passe plus par `_phase`.

### LOT 5 — Extraire les `Task_*` feuilles (level-up + learn-move) ✅ FAIT (2026-07-17)
> 14 feuilles `Task_*` extraites + 7 renames `_maison`→noms décomp + fusion
> `_taskPartyMenuReplaceMove`→`Task_PartyMenuReplaceMove` (gate printer inline 1:1).
> Le méga-handler ne garde que des délégations 1 ligne ; le squelette `_phase`
> (transitions) reste jusqu'au lot final, annoté `= gTasks[].func = Task_X (:LIGNE)`.
> + FIX au test : `ShowLevelUpStatsBox` passait `MUS_LEVEL_UP` à
> `PlayFanfareByFanfareNum` (index `sFanfares` attendu → crash `.songNum`) →
> `FANFARE_LEVEL_UP` 1:1 :4984. Testé EN JEU : les 3 branches (direct/remplacer/
> refuser+rebouclages NON) + pg1 deltas réels + pg2 totaux, 0 erreur console.
- **Fichiers** : `src/party_menu.ts`.
- [extract] les `_phase==='levelup_*'`/`'replace_*'`/`'stop_learning_*'`/`'which_move_*'`
  (party_menu.ts:3639-3802) en vraies `gTasks` : `Task_DisplayLevelUpStatsPg1/Pg2`:5009/5019,
  `Task_TryLearnNewMoves`:5048, `Task_TryLearningNextMove`:5075, `Task_DoLearnedMoveFanfareAfterText`:4789,
  `Task_LearnNextMoveOrClosePartyMenu`:4798, `Task_ReplaceMoveYesNo`:4815 (+`…Input`:4824),
  `Task_ShowSummaryScreenToForgetMove`:4841, `Task_ReturnToPartyMenuWhileLearningMove`:4860,
  `Task_PartyMenuReplaceMove`:4882, `Task_StopLearningMoveYesNo`:4906 (+`…Input`:4915),
  `Task_TryLearningNextMoveAfterText`:4949.
- **Test EN JEU** : Super Bonbon → box stats pg1/pg2 → apprend/remplace capacité (les 3 branches).
- **Critère** : la chaîne level-up/learn n'a plus de `_phase`.

### LOT 6 — Extraire les `Task_*` feuilles (switch-items + softboiled + field-move msgs) ✅ FAIT (2026-07-17)
> 6 feuilles extraites (Task_ClosePartyMenuAfterText:4472, Task_ReturnToChooseMonAfterText:1745
> partagée field_move_err/helditem_msg, Task_CancelAfterAorBPress:3838,
> Task_HandleFieldMoveExitAreaYesNoInput:3797, Task_HandleSwitchItemsYesNoInput:3163
> [fusionne la variante FromBag :5478 via `_giveFromBag`], Task_PartyMenuModifyHP:1839)
> + 4 renames (SwitchPartyMon:3016, Task_SlideSelectedSlotsOffscreen/Onscreen:2936/2966,
> _tickHpAnim→Task_PartyMenuModifyHP). Méga-handler = shim de délégations.
> NON extraite (honnête) : `softboiled_msg` — dispatcher générique port dont le callback
> couvre DEUX waiters décomp distincts (fldeff_softboiled.c:83/:97) ; en nommer un
> trahirait l'autre → reste inline documenté, à réconcilier avec la famille softboiled.
> Testé EN JEU : SURF « impossible ici »→retour ; E-Coque anim PV (+8/−8 exact) ;
> DONNER sur mon tenant un objet → « Echanger? » OUI → compta sac 1:1
> (POTION 5→4, GRAIN MIRACL rendu) ; ORDRE slide Arcko↔Leveinard. 0 erreur console.
- **Fichiers** : `src/party_menu.ts`.
- [extract] `switch_items_yesno`→`Task_HandleSwitchItemsYesNoInput`:3163 (+`…FromBag…`:5478),
  `softboiled_*`→`ChooseMonForSoftboiled`/`Task_TryUseSoftboiledOnPartyMon`/`Task_FinishSoftboiled`
  (déjà présents 3187/3247/3199, à câbler en `gTasks`), `field_move_err/cancel/yesno`→
  `Task_ReturnToChooseMonAfterText`:1745 / `Task_CancelAfterAorBPress`:3838 / `Task_HandleFieldMoveExitAreaYesNoInput`:3797,
  `item_used_msg`→`Task_ClosePartyMenuAfterText`:4472, `helditem_msg`→`Task_UpdateHeldItemSprite`:3255.
- **Test EN JEU** : DONNER un objet à un mon qui en tient déjà (prompt échange) ; SOIN-VITAL/Doux Parfum ;
  field move sans badge / « impossible ici ».
- **Critère** : `Task_PartyMenu_HandleInput` réduit à un shim vide → supprimable ; plus aucun `_phase`.

### LOT 7 — Combat 1:1 (RISQUE n°1) — remplacer les ponts globalThis
- **Fichiers** : `src/party_menu.ts`, `src/battle_main.ts` (ordre déjà là), `src/battle_controller_player.ts`.
- [port] `ChooseMonForInBattleItem`:5781, `CB2_SetUpExitToBattleScreen`:6119, `TrySwitchInPokemon`:5800,
  `GetPartyMenuActionsTypeInBattle`:5788. Remplacer `__battleSwitchResultSlot`/`__battlePartyOrder`
  (party_menu.ts:3898/4237) par `gBattlePartyCurrentOrder` + `UpdatePartyToBattleOrder`/`…FieldOrder`
  (battle_main.ts:2117/2127, déjà portés). `HandleChooseMonSelection` case `PARTY_ACTION_SEND_OUT`
  1:1 (party_menu.c dispatch `gPartyMenu.task`).
- **Test EN JEU** (`__byteVm.load()`+`launchTB`, `?debug` Léviator+Surf) : switch volontaire, switch
  forcé après K.O., objet (Potion) sur un mon EN combat → retour combat propre, ordre correct
  (mon échangé bien en tête). Vérifier annulation B = pas de tour consommé.
- **Critère** : le combat ne lit plus `__battleSwitchResultSlot` ; retour via reshow 1:1.

### LOT 8 — Rendu boîte + sprites 1:1 (`[rename]`)
- **Fichiers** : `src/party_menu.ts`.
- [rename]+[port] `_drawSlot`→`RenderPartyMenuBox`:824, `_displayPartyPokemonData`→`DisplayPartyPokemonData`:872
  (+ famille `DisplayPartyPokemon*`:2287-2436 selon besoin), `BlitBitmapToPartyWindow`:2150 (rendu barre
  PV/genre), `DrawEmptySlot`:2193 ; sprites `_spawnIconOams`→`CreatePartyMonSprites`:1058, `_spawn{Held
  Item,Status,Pokeball}Oams`→`CreatePartyMon{HeldItem,Status,Pokeball}Sprite`:4021/4184/4122. Adopter
  `sPartyMenuBoxes[]` (Lot 1) comme source (windowId/spriteId par slot).
- **Test EN JEU** : ouverture party, screenshot pixel-compare (nickname/Lv/PV/barre/genre/statut/objet/icône).
- **Critère** : le rendu passe par les structs `sPartyMenuBoxes` ; helpers `_draw*`/`_spawn*` supprimés.

### LOT 9 — Nettoyage adaptation morte
- **Fichiers** : `src/party_menu.ts`, `src/start_menu.ts`.
- Supprimer `TickPartyScreen` (party_menu.ts:4503) + la branche `'party_screen'` morte
  (start_menu.ts:787-789) + l'état `'party_screen'` (start_menu.ts:121) si plus référencé.
  Supprimer les `let _phase`, `_slot*`, tableaux par-slot rendus caducs par les structs.
  Grep final `_phase` = 0.
- **Test EN JEU** : re-test global (start menu, summary, combat, objet, pension). Screenshots.
- **Critère** : `node scripts/decomp-index.cjs --file party_menu.c` — `declared` remonté ;
  `referenced` fondu ; plus de state-machine `_phase`.

### LOT 10 — (OPTIONNEL) Absents-solo : MAIL + TOSS + move-relearner/tutor/deleter
- **Fichiers** : `src/party_menu.ts` (+ écran ReadMail à part pour le mail).
- [port] par sous-lot ≤300 l. : (a) `CursorCb_Toss`+`Task_TossHeldItem*` (3300/3354/3324/3333) ;
  (b) `CursorCb_Mail`/`Read`/`TakeMail` (3369/3381/3399) + retour ReadMail (dépend de l'écran mail) ;
  (c) sélecteurs `ChooseMonForMove{Tutor,Relearner}`/`MoveDeleter*` (5755/6279/6341) sur le pattern
  `ChooseMonForDaycare`:4118.
- **Test EN JEU** : par feature (jeter objet tenu ; lire/prendre mail ; move relearner Fallarbor).
- **Critère** : la dette « R3 » (party_menu.ts:3477) levée ; features solo complètes.

---

## 5. Risques (par ordre de danger)

1. **[MAJEUR] Retour COMBAT non-1:1.** `PARTY_ACTION_SEND_OUT` + objet-en-combat passent par des
   ponts `globalThis.__battleSwitchResultSlot` (party_menu.ts:3874/3898) + `__battlePartyOrder`
   (4237-4243/4485-4490) au lieu de `TrySwitchInPokemon`/`CB2_SetUpExitToBattleScreen`/
   `gBattlePartyCurrentOrder` (party_menu.c:5800/6119 absents). C'est la state-machine de **reshow
   combat** — classe de bugs déjà payée (« victoire prématurée » `9341ea352`, « mon échangé pas en
   tête » 2026-06-10). Isoler au Lot 7, tester les 4 chemins (switch volontaire / forcé K.O. /
   objet / annulation) avant de retirer le pont.

2. **[MAJEUR] Méga-handler monolithique à état partagé.** `Task_PartyMenu_HandleInput` (~450 l.,
   party_menu.ts:3494) branche sur `_phase` ET partage `_itemUsedMsgText/_actionList/_slotId/
   _learnMoveState`. Extraire une branche sans casser les voisines demande de **découper par
   sous-système** (Lots 4-5-6) et JAMAIS d'un coup. Le décomp assigne `gTasks[taskId].func = Task_X`
   (function-pointer) → nos vraies `gTasks` doivent être des **funcs anonymes** `CreateTask((t)=>fn(t.taskId))`
   (mémoire `chemin-1to1-execution` : jamais filtrer par nom).

3. **[MOYEN] Structs éclatées → double-source.** `gPartyMenu`/`sPartyMenuInternal`/`sPartyMenuBoxes`
   sont aujourd'hui des `let` dispersés (party_menu.ts:460-489, 379-440, 443/304/323). Le Lot 1
   double-écrit ; tant que les deux vivent, **risque de désync** (un chemin met `_slotId`, l'autre
   lit `gPartyMenu.slotId`). Retirer les `let` legacy DÈS que chaque lecteur est basculé (Lot 9).

4. **[MOYEN] `BlitBitmapToPartyWindow` = rendu direct absent.** party_menu.c:2150 blitte les
   bitmaps HP-bar/genre dans la fenêtre via `infoRects->blitFunc` (party_menu.c:1031) ; le port
   dessine via `_drawHpBar`:842 + `BlitBitmapToWindow` (window.ts) SANS la table `PartyMenuBoxInfoRects`.
   Le Lot 8 doit porter `infoRects`/`blitFunc` ou documenter l'adaptation (précédent : bag icons).
   Vérifier le pixel-compare barre PV (vert/jaune/rouge) + symbole genre.

5. **[MOYEN] Data tables inline + localisation FR maison.** Le dispatch action lit `ACTION_MENU_
   STRINGS_FR` (party_menu.ts:2081, Record FR **hardcodé**) au lieu de `getString` via `sCursorOptions
   [].text` (party_menu.h:658 = `gText_Summary5`…). Le Lot 2 doit brancher `getString` (CLAUDE.md :
   « JAMAIS hardcoder les TEXTES »). Vérifier que les clés `gText_*` existent côté extraction.

6. **[FAIBLE] Loader déjà 1:1 — ne PAS le retoucher.** `CB2_InitPartyMenu` (party_menu.ts:3952,
   states 0-20) + `FreeAllSpritePalettes` case 4 (fix palette icônes noires `diag-glitches-2026-06-18`)
   + réservation synchrone banks OBJ case 13 (fix collision palette). **Ne rien changer au loader** ;
   la consolidation ne touche QUE input/dispatch/rendu.

7. **[FAIBLE] `TickPartyScreen` morte mais encore appelée.** start_menu.ts:788 appelle un no-op
   (party_menu.ts:4503). Supprimer au Lot 9 SANS toucher le reste de `TickStartMenu` (la branche
   `'party_screen'` est un sentinel mort depuis le passage CB2-swap).

8. **[FAIBLE] Sous-flux Médecine multi-écrans.** `OpenPartyScreenForItemUse` (4197) ↔ `CB2_ReturnToBagMenu`
   (2468) portent déjà le sac→party→sac ; `gItemUseCB` (globalThis, party_menu.ts:3839) est le pont
   1:1 (COMMON_DATA `gItemUseCB` party_menu.c:234). Ne pas « améliorer » ce pont — il est correct.

---

### Annexe — mesure de progression
`node scripts/decomp-index.cjs --file party_menu.c` en tête de chaque lot : suivre
`portées 89 → …` (declared) et `référencées 76 → …`. Objectif Lots 1-9 : basculer l'essentiel des
`·` inlinés/`_`-adaptés en `✓`/`≈` sans toucher `189 absentes` hors-solo (§3.g). Le Lot 10 attaque
les absents-solo (§3.f). Grep de contrôle final adaptation : `grep -n "_phase" src/party_menu.ts` = 0.

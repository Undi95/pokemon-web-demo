# Audit 1:1 — Domaine « save-data »

Auditeur : flotte read-only Opus. Date 2026-07-02. Périmètre lu EN ENTIER des deux côtés :
`load_save.c/.ts`, `new_game.c` (+ orchestration `intro.ts`/`new-game-flags.ts`), `play_time.c/.ts`,
`save.c` (API publiques) / `save.ts`, `main.c` / `main.ts`, `clear_save_data_screen.c`,
`save_failed_screen.c`, `reset_rtc_screen.c`, `save_location.c`, `reload_save.c`, + structs
`SaveBlock1`/`SaveBlock2`/`Pokemon`/`BoxPokemon`/substructs et toutes les structs imbriquées
(`include/global.h`, `include/pokemon.h`) vs `src/engine/save/save-blocks.ts`.

## VERDICT GLOBAL
Le CŒUR du domaine (les STRUCTS de save) est **excellent** — un des domaines les plus fidèles du
repo. `save-blocks.ts` (1641 lignes) est un miroir CHAMP-PAR-CHAMP, DANS L'ORDRE, de `SaveBlock1` +
`SaveBlock2` + toutes leurs ~50 substructs, avec les mêmes noms de champs 1:1. Le moteur secteurs
(`save.c`) et le glue load/save (`load_save.c`) sont portés proprement. Les TROUS réels ne sont PAS
des structs manquantes : ce sont (1) l'**init new-game incomplète** (callgraph `NewGameInitData`
partiel) et (2) les **3 écrans debug/erreur** (clear_save/save_failed/reset_rtc) absents.

---

## struct SaveBlock1 (global.h:990) → save-blocks.ts:1047
Statut : ✅ MIROIR
Champs : 90/90 dans l'ordre exact (pos → waldaPhrase). Vérifié ligne-à-ligne contre le dump décomp.
Divergences : AUCUNE sur les noms/ordre. Adaptations ASSUMÉES (non-litige) :
- `mapView` = `number[]` (0x100) au lieu de `u16[]` — OK sémantique.
- pads C (`padding1..5`, `//u8 padding`) omis — non pertinents en JSON.
- Champs web-port EN PLUS (`__mapId`, `__facing`, `__dynamicWarpMapId`, `__registeredItemKey`,
  `__objectPositions`, `__takenItemBalls`, `respawnLocation`) = bridge port, marqués `?` optionnels.
- `objectEvents`/`objectEventTemplates` = arrays vides à l'init au lieu de `[16]`/`[64]` remplis ;
  le snapshot est reconstruit au save (`SaveObjectEvents`). Divergence de forme ASSUMÉE (le décomp
  save le runtime `gObjectEvents[16]` direct ; notre runtime spawn dynamiquement → snapshot filtré
  par `mapId`, cf. load_save.ts:159 `LoadObjectEvents` avec check anti-collision localId).

## struct SaveBlock2 (global.h:514) → save-blocks.ts:986
Statut : ✅ MIROIR
Champs : 40/40 dans l'ordre exact (playerName → frontier). Options bitfield C aplaties en champs
plats (optionsTextSpeed/WindowFrameType/Sound/BattleStyle/BattleSceneOff/regionMapZoom) = adaptation
ASSUMÉE documentée. `playerTrainerId` = `number` (u32 LE) au lieu de `u8[4]` — cohérent avec l'accès
`SetTrainerId`/`GetTrainerId`. `localTimeOffset`/`lastBerryTreeUpdate` = struct `Time` 1:1.
Divergences : AUCUNE sur les noms. `filler_90[8]` présent (fidèle).

## struct Pokemon / BoxPokemon + substructs (pokemon.h) → pokemon.ts:128
Statut : ✅ MIROIR (modèle plat)
Champs : tous les champs LOGIQUES présents. BoxPokemon (personality, otId, nickname, language,
isBadEgg, hasSpecies, isEgg, otName, markings) + Substruct0 (species, heldItem, experience, ppBonuses,
friendship) + Substruct1 (moves[4], pp[4]) + Substruct2 (6 EVs + cool/beauty/cute/smart/tough/sheen)
+ Substruct3 (pokerus, metLocation, metLevel, metGame, pokeball, otGender, 6 IVs, abilityNum,
modernFatefulEncounter, **18 ribbons complets** coolRibbon..unusedRibbons) + Pokemon (status, level,
mail, hp, maxHP, attack, defense, speed, spAttack, spDefense).
Divergences : la couche chiffrement/`secure.substructs`/`checksum`/`unknown` est ABSENTE = adaptation
modèle-plat ASSUMÉE (ne pas re-litiger, cf. mandat). Bits BoxPokemon `blockBoxRS:1` + `unused:4`
absents (tous deux inutilisés dans Émeraude solo) [code-mort]. Non bloquant.

## Structs imbriquées SaveBlock1/2 → save-blocks.ts
Statut : ✅ MIROIR (audit exhaustif)
Toutes présentes avec noms 1:1 : Coords16/8, WarpData, Time, Pokedex, Berry2, EnigmaBerry, BerryTree,
Pokeblock, BattleTowerPokemon, EmeraldBattleTowerRecord, BattleTowerInterview,
BattleTowerEReaderTrainer, DomeMonData, RentalMon, BattleDomeTrainer, PyramidBag, **BattleFrontier
(complète, ~90 champs)**, ApprenticeMon, Apprentice, ApprenticeQuestion, PlayersApprentice,
PokemonJumpRecords, BerryPickingResults, BerryCrush, RankingHall1P/2P, **OldMan (union 6 variants)**,
**LilycoveLady (union 3 variants)**, DewfordTrend, Mail, DaycareMail, DaycareMon, DayCare,
ContestWinner, LinkBattleRecord(s), RecordMixingGift(Data), ExternalEventData/Flags, Roamer,
RamScript(Data), SecretBase(Party), ObjectEventSnapshot, ObjectEventTemplate, TVShow, PokeNews,
GabbyAndTyData, WonderNews/Card/Metadata, MysteryGiftSave (avec **questionnaireWords**),
TrainerHillSave, WaldaPhrase, TrainerNameRecord, PokemonStorage.
Divergences mineures (tous ASSUMÉS, non bloquants) :
- `Roamer` : `filler[0x8]` trailing pad absent (global.h Roamer) — non pertinent JSON.
- `TVShow` : union 25-variants stockée en `{kind, active, data?}` générique (payload non-typé) —
  documenté comme MVP, à typer quand les TVShows seront implémentés [différé].
- `RamScriptData.script` = `number[]` (995) présent ; `//u8 padding` omis.

## save.c (API publiques) → save.ts
Statut : 🟡 PARTIEL (API cœur ✅ ; IO flash 🚫 exempt)
Fonctions portées : `TrySavingData` ✅, `HandleSavingData` (→ `SaveGame`) ✅, `LoadGameSave` ✅,
`Save_ResetSaveCounters` ✅, `CalculateChecksum` ✅ (1:1 fold u16), `GetSaveValidStatus` ✅,
`CopySaveSlotData` ✅, `WriteSaveSlot`/`TryLoadSaveSlot` ✅. Globals `gSaveCounter`,
`gLastWrittenSector`, `gSaveFileStatus` ✅. Le modèle 28-secteurs + rotation slot + counter-max +
signature/checksum est fidèle (chunk-size adapté web = SEULE adaptation, documentée save.ts:19-30).
Manquants [code-mort en solo / link] :
- `LinkFullSave_Init/WriteSector/ReplaceLastSector/SetLastSectorSignature` (save.c:787-828) [link, N-A]
- `WriteSaveBlock2` / `WriteSaveBlock1Sector` (save.c:828/846) [chemin link-incremental, N-A solo]
- `MoveSaveBlocks_ResetHeap` (load_save.c:84) [ASLR heap-relocate + re-chiffrement ; 🚫 exempt hardware]
- `ApplyNewEncryptionKeyTo*` (load_save.c:274-293), `SetSaveBlocksPointers`/ASLR (load_save.c:70) —
  chiffrement XOR + ASLR EWRAM = 🚫 EXEMPT (modèle plat non chiffré, documenté).

## load_save.c → load_save.ts
Statut : 🟡 PARTIEL (glue cœur ✅)
Portés 1:1 : `SavePlayerParty`/`LoadPlayerParty` ✅, `SaveObjectEvents`/`LoadObjectEvents` ✅ (avec
fix anti-collision localId web-port documenté), `CopyPartyAndObjectsToSave`/`FromSave` ✅,
`SetContinueGameWarpStatusToDynamicWarp`/`ClearContinueGameWarpStatus2`/`UseContinueGameWarp` ✅.
`ClearSav1`/`ClearSav2` = `emptySaveBlock1/2` factories ✅. `SetBagItemsPointers` câblé au load ✅.
Manquants :
- `LoadPlayerBag`/`SavePlayerBag` + struct `LoadedSaveData` (load_save.c:21,208,239) [le port sauve
  le bag directement dans SaveBlock1.bagPocket_* → pas de tampon `gLoadedSaveData` intermédiaire ;
  divergence de forme ASSUMÉE, mais `gLastEncryptionKey`/re-chiffrement bag non répliqués — 🚫 exempt].
- `SetContinueGameWarpStatus`/`ClearContinueGameWarpStatus` (load_save.c:139-147) — SEUL le variant
  `...Status2` + `...ToDynamicWarp` sont portés ; les 2 setters simples absents [vivant, S à ajouter].
- `CheckForFlashMemory`/`gFlashMemoryPresent` (load_save.c:46) 🚫 exempt hardware.

## play_time.c → play_time.ts
Statut : ✅ MIROIR (5/5)
`PlayTimeCounter_Reset/Start/Stop/Update/SetToMax` tous 1:1. Enum STOPPED/RUNNING/MAXED_OUT porté.
Divergence infime : `SetToMax` met `playTimeVBlanks = 0` côté port vs `= 59` décomp (play_time.c:72).
🔴 Micro-bug 1:1 (invisible en jeu — le compteur est frozen à MAXED_OUT, vBlanks jamais relu). S.

## new_game.c → intro.ts + new-game-flags.ts (NewGameInit)
Statut : 🔴 DIVERGENT (init new-game INCOMPLÈTE — c'est LE gros trou du domaine)
`NewGameInitData` (new_game.c:149) enchaîne ~50 appels. Notre `NewGameInit()` (new-game-flags.ts:195)
n'en câble que ~9 : ClearBerryTrees, EventScript_ResetAllMapFlags (159 hide-flags), ResetAllBerries,
InitPlayerTrainerId, SetMoney(3000), InitDewfordTrend, NewGameInitPCItems. Certains autres sont
couverts INDIRECTEMENT par les factories `emptySaveBlock1/2` (= état zéro équivalent à
ClearSav1/2 + ResetPokemonStorageSystem + defaults). MAIS plusieurs appels à EFFET (pas juste zéro)
ne sont PAS invoqués à la création de partie :
Init new-game manquante (chaque item = système décomp qui ne s'initialisera pas correctement) :
- `SetDefaultOptions` (new_game.c:91) — ✅ couvert par `emptySaveBlock2` (optionsTextSpeed:1=MID) mais
  les autres defaults (SHIFT/MONO) sont à 0 = déjà les valeurs par défaut. OK de facto.
- `ResetGameStats` (new_game.c:175) — factory met gameStats=zeros → OK mais la fn décomp n'est pas
  appelée [état zéro équivalent].
- `InitEventData` (new_game.c:167) — présent (event_data.ts:118) mais **pas invoqué par NewGameInit**
  [flags/vars re-zéro ; couvert par factory, mais divergence de flow].
- `ClearTVShowData`/`ResetGabbyAndTy` (new_game.c:168-169) — factory zéro OK, fns non appelées.
- `SetMauvilleOldMan` (new_game.c:191) — ⚠️ VIVANT : le décomp CHOISIT aléatoirement un OldMan
  (Bard/Hipster/…) ; la factory met `oldMan = {id:0, kind:'common'}`. **Non répliqué** → Mauville Old
  Man mal initialisé si le système est activé. [vivant] M.
- `SetMoney`/`SetCoins(0)` — money ✅ ; coins déjà 0.
- `ResetFanClub`/`ResetLotteryCorner`/`InitLilycoveLady`/`ResetAllApprenticeData`/`ClearRankingHall
  Records`/`InitMatchCallCounters`/`ClearMysteryGift`/`WipeTrainerNameRecords`/`ResetTrainerHill
  Results`/`ResetContestLinkResults`/`ClearAllContestWinnerPics`/`ResetMiniGamesRecords`/`ClearPlayer
  LinkBattleRecords`/`InitSeedotSizeRecord`/`InitLotadSizeRecord`/`ClearRoamerData`/`ClearSecretBases`
  /`ClearPokeblocks`/`ClearDecorationInventories`/`InitEasyChatPhrases` — la plupart sont couverts par
  la factory (état zéro identique). MAIS `InitEasyChatPhrases`, `InitLilycoveLady`, `SetMauvilleOldMan`
  ont un effet NON-ZÉRO (seeding aléatoire / valeurs par défaut spécifiques) → **divergents** [vivant].
- `WarpToTruck` (new_game.c:195) + `RunScriptImmediately(EventScript_ResetAllMapFlags)` — le warp
  truck est géré par le boot-mode/intro flow (pas dans NewGameInit) ; hide-flags OK.
- `RtcReset` si save EMPTY/CORRUPT (new_game.c:151) — présent (rtc.ts:207) mais gating non vérifié ici.
Fonctions décomp portées ailleurs (miroir noms) : `SetTrainerId`/`GetTrainerId`/`CopyTrainerId`
(new_game.c:64-82) — grep : partiellement dans le flow trainerId (new-game-flags.ts inline le calcul).
NB : `intro.ts:2158-2172` porte le flow boot `Sav2_ClearSetDefault`/`ResetMenuAndMonGlobals` en
`declare function` (stubs déclarés, corps ailleurs) — le vrai enchaînement NewGameInitData n'est PAS
un miroir de la fonction unique ; il est éclaté (new-game-flags + factories + boot-mode).

## main.c → main.ts
Statut : 🟡 AMORCE (2/29)
Portés : `SeedRngAndSetTrainerId` ✅, `GetGeneratedTrainerIdLower` ✅ (+ `sTrainerId`). Le TM1 hardware
est simulé (documenté, seule substitution). `AgbMain`, `gMain` (struct Main : vblank/hblank callbacks,
heldKeys, newKeys, callback2…), `InitMainCallbacks`, `SetMainCallback2`, `SetVBlankCallback`,
`VBlankIntr`, `WaitForVBlank`, `DoSoftReset`, `SeedRngWithRtc`, `SetTrainerHillVBlankCounter` =
assurés côté harness (`harness/runtime` pour gMain, boucle Phaser). Divergence de forme ASSUMÉE (glue
plateforme), mais `struct Main`/`gMain` n'a PAS d'équivalent 1:1 nommé → futur import décomp qui lit
`gMain.vblankCallback` etc. devra passer par le harness [levier faible ; documenté].

## clear_save_data_screen.c → ABSENT
Statut : ⬜ ABSENT (9 fns) — `title_screen.ts:561 CB2_GoToClearSaveDataScreen` = no-op stopgap.
Écran debug (combo bouton rare : SELECT+B+↑ au title). `CB2_InitClearSaveDataScreen`,
`Task_DoClearSaveDataScreen`, etc. non portés. [vivant mais faible priorité — feature debug].

## save_failed_screen.c → ABSENT
Statut : ⬜ ABSENT (12 fns). `DoSaveFailedScreen`/`CB2_SaveFailedScreen`. Chemin d'erreur flash — en
web (localStorage) le failure mode diffère → largement 🚫 exempt hardware, mais le message joueur
« LA SAUVEGARDE A ÉCHOUÉ » n'existe pas. [faible priorité].

## reset_rtc_screen.c → ABSENT
Statut : ⬜ ABSENT (19 fns). Écran debug RTC (combo B+SELECT+↓). `title_screen.ts` route vers un
no-op. RTC hardware = 🚫 exempt ; l'écran lui-même [faible priorité].

## save_location.c → ABSENT
Statut : ⬜ ABSENT (10 fns) — `SetContinueGameWarp*`/`TrySetMapSaveWarpStatus`/save-location logic.
🩸 Certaines de ces fns (`SetContinueGameWarpToDynamicWarp`) sont APPELÉES par load_save.c:151.
Notre port inline l'équivalent dans `load_save.ts:SetContinueGameWarpStatusToDynamicWarp`. Le fichier
foyer `save_location.ts` n'existe pas → futur import décomp devra chercher ailleurs. [vivant, S/M].

## reload_save.c → ABSENT
Statut : ⬜ ABSENT (1 fn) — `ReloadSavedMapAfterMysteryGift`-like. Trivial. [faible priorité, S].

---

## TOP 5 (levier × effort)

1. **Compléter `NewGameInitData` — seeding non-zéro** (levier ÉLEVÉ, effort **M**).
   Câbler `SetMauvilleOldMan`, `InitEasyChatPhrases`, `InitLilycoveLady` dans `NewGameInit()` (les
   autres appels sont couverts par la factory=zéro). Ce sont les SEULS avec un effet non-zéro non
   répliqué → mines pour tv/easy-chat/lilycove/mauville. Regrouper le flow en une vraie `NewGameInitData`
   miroir (ordre new_game.c:149-207) au lieu de l'éclatement actuel.
   Oracle en jeu : nouvelle partie → parler au Mauville Old Man / vérifier phrase Easy Chat par défaut.

2. **Créer le foyer `save_location.ts`** (levier moyen, effort **S/M**).
   Porter `save_location.c` (SetContinueGameWarp*, TrySetMapSaveWarpStatus). Aujourd'hui inliné dans
   load_save.ts → un import décomp qui appelle ces noms ne les trouvera pas. Ajouter aussi les 2 setters
   `SetContinueGameWarpStatus`/`ClearContinueGameWarpStatus` manquants (load_save.ts).
   Oracle : sauver puis « Continuer » depuis un lieu à warp spécial (Frontier/contest).

3. **`struct Main` / `gMain` nommé 1:1** (levier moyen-caché, effort **M**).
   Exposer un `gMain` (vblankCallback/hblankCallback/callback1/2/heldKeys/newKeys) miroir au lieu du
   harness opaque. Débloque tout import décomp lisant `gMain.*` (MoveSaveBlocks_ResetHeap, main loop,
   liens divers). Oracle : `window.gMain` inspectable + callbacks nommés.

4. **Fix micro-bug `PlayTimeCounter_SetToMax` vBlanks** (levier faible, effort **S**).
   Ligne play_time.ts:77 `playTimeVBlanks = 0` → `= 59` (play_time.c:72). Trivial, pure fidélité.
   Oracle : forcer 999h+ et lire vBlanks.

5. **Écrans clear_save / save_failed** (levier faible, effort **M/L**).
   Porter au moins `CB2_InitClearSaveDataScreen` (combo debug efface la save → utile pour tests) et le
   message `DoSaveFailedScreen`. Faible priorité (debug/erreur), mais élimine 2 no-op stopgap dans
   title_screen.ts. reset_rtc_screen = 🚫 largement exempt (RTC hardware).

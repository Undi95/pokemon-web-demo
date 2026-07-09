# Audit 1:1 MIROIR STRICT — domaine « script-vm »

> READ-ONLY. Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src`. Notre repo : `D:/Projet 1/pokemon-web-demo`.
> Périmètre : script.c, scrcmd.c, field_specials.c, event_data.c, script_movement.c, script_menu.c,
> script_pokemon_util.c, coord_event_weather.c, mystery_event_script.c (exempt-flows) + engine/script/**.
> Méthode : lecture intégrale des .c + .ts homonymes ; désassemblage du bytecode réel (`script-bytecode.json`)
> pour distinguer opcode réellement atteint vs code-mort. Byte-VM = SEUL moteur (script.ts / scrcmd.ts).

---

## script.c → src/script.ts
Statut : ✅ MIROIR (VM core 1:1) — quelques fns RAM-script manquantes (mystery event, majoritairement N/A single-player)
Fonctions : 30/39 (le reste = RAM script / triggers repris ailleurs)

### Cœur VM — fidèle
- `InitScriptContext`, `SetupBytecodeScript`, `SetupNativeScript`, `StopScript`, `RunScriptCommand`,
  `ScriptPush`/`ScriptPop`, `ScriptJump`/`ScriptCall`/`ScriptReturn`, `ScriptReadByte/Halfword/Word`,
  `Lock/Unlock/ArePlayerFieldControlsLocked`, tout `ScriptContext_*` (Init/IsEnabled/RunScript/SetupScript/
  Stop/Enable), `RunScriptImmediately` : transcription ligne-à-ligne fidèle (script.ts:95-378).
- `RunScriptCommand` : le fallthrough `SCRIPT_MODE_NATIVE → SCRIPT_MODE_BYTECODE` du switch décomp
  (script.c:80-91) est rendu en if/else équivalent (script.ts:132-172), logique identique. ✅
- Adaptation ROM-pointer → curseur `{buf, off}` (documentée, irréplicable) : conforme à la doctrine.
- `gNullScriptPtr`/HALT (script.c:103-107) : N/A justifié (pas de sentinelle ROM).

### Divergences / adaptations
- **`RunScriptCommand` — garde `!func` supplémentaire** (script.ts:161-167) : quand un handler `cmdTable[cmd]`
  est `null` (non porté), on `warnMissingCmd` + `mode=STOPPED` + `return false`. La décomp ne teste que
  `func >= cmdTableEnd`. C'est un garde-fou LÉGITIME (sinon crash JS), MAIS il masque le vrai problème des
  handlers manquants ci-dessous (`gotostd_if`, etc.) : le script s'arrête proprement au lieu de finir.
  Non-1:1 comportemental **assumé/nécessaire**, mais signale l'incomplétude de scrcmd.
- **`ScriptContext_Init` déverrouille le lock** (script.ts:257, `UnlockPlayerFieldControls()`) : AJOUT hors décomp
  (script.c:210-214 ne fait qu'InitScriptContext + status=SHUTDOWN). Documenté comme SWAP-safety anti-freeze.
  C'est une divergence comportementale assumée (flag lock unifié `globalThis.__sLockFieldControls`) — cohérente
  avec le mandat « lock unifié », mais à noter : le vrai décomp ne touche pas au lock dans Init.
- **Lock via `globalThis`** au lieu d'un `static bool8 sLockFieldControls` module-local (script.ts:82,240-242).
  Adaptation assumée (unification multi-chemins). Le nom exposé `__sLockFieldControls` conserve le nom décomp.

### Fonctions manquantes (script.c → non portées dans script.ts)
- `CalculateRamScriptChecksum` (script.c:371) [vivant, mais RAM-script = Mystery Event] — ABSENT
- `ClearRamScript` (script.c:376) [utilisé par ScrCmd_endram] — ABSENT (endram lui-même non porté, cf scrcmd)
- `InitRamScript` (script.c:381) [Mystery Event] — ABSENT
- `GetRamScript` (script.c:399) [Mystery Event] — ABSENT
- `ValidateSavedRamScript` (script.c:425) [Mystery Event] — ABSENT
- `GetSavedRamScriptIfValid` (script.c:441) [utilisé par ScrCmd_trywondercardscript] — ABSENT
- `InitRamScript_NoObjectEvent` (script.c:465) [Mystery Event] — ABSENT
- `MapHeaderGetScriptTable`/`MapHeaderCheckScriptTable` (script.c:272/299) : REMPLACÉS par notre data-loader
  `findMapScriptLabel` + `TryRunOnFrameMapScript`/`TryRunOnWarpIntoMapScript` (adaptation JSON map-scripts,
  documentée). Logique équivalente (1er match wins). Statut « ailleurs / adapté », pas un trou.
- `TryRunOnWarpIntoMapScript` : présent (script.ts:747) mais lit `Number(valueTok)` au lieu de `VarGet(valueTok)`
  pour la valeur comparée — **léger écart** vs OnFrame (qui, lui, fait `VarGet(valueTok)`, script.ts:732).
  Le décomp `MapHeaderCheckScriptTable` compare `VarGet(varIndex1) == VarGet(varIndex2)` : les DEUX opérandes
  passent par VarGet. Notre OnWarpIntoMap ne résout donc pas une valeur exprimée comme constante/var.
  Divergence mineure 🟡 (rarement une var côté droit, mais non-1:1).

Verdict : cœur VM = ✅ MIROIR. Trou réel = famille **RAM script** (Mystery Event, majoritairement exempt),
sauf `GetSavedRamScriptIfValid`/`ClearRamScript` qui servent `trywondercardscript`/`endram` (stubs no-op côté
scrcmd — voir plus bas ; impact single-player nul car pas de Wonder Card).

---

## scrcmd.c → src/scrcmd.ts
Statut : 🔴 DIVERGENT sur la COMPLÉTUDE de la table (handlers courants manquants) — les handlers PRÉSENTS sont fidèles
Fonctions : ~196/231 (cartograph). Corps des handlers présents = transcription fidèle. **Problème = handlers ABSENTS**
de `BYTEVM_HANDLERS` alors que leurs opcodes sont ÉMIS et ATTEINTS dans le bytecode réel.

### 🔴 HANDLERS MANQUANTS atteints comme VRAIS opcodes en jeu (preuve : désassemblage `script-bytecode.json`)
Vérifié en désassemblant les scripts depuis `scriptOffsets`. Quand ces opcodes sont atteints, `RunScriptCommand`
tombe sur `!func` → `warnMissingCmd` + STOP : **le script s'interrompt sans finir** (dialogue tronqué, flag non posé,
lock jamais relâché selon le point d'arrêt).

| opcode (cmdId) | scrcmd.c | atteint dans (exemples réels) | impact |
|---|---|---|---|
| **`gotostd_if` (10)** | :255 | DewfordTown_Gym Brawly, MossdeepCity Maxie, Route109 Austina | 🔴 gym/trainers |
| **`callstd_if` (11)** | :269 | MagmaHideout Grunts, … | 🔴 |
| **`vcall_if` (188)** | :225 | Route107 Denise, Route110 TrickHouse | 🔴 |
| **`setptr` (17)** | :320 | Route110 TrickHouse puzzles | 🔴 puzzles |
| **`loadbytefromptr` (18)** | :312 | Route109 Paul, Route113 Wyatt | 🔴 |
| **`setptrbyte` (19)** | :336 | Route113 Lawrence, Route117 Anna | 🔴 |
| **`compare_local_to_ptr` (29)** | :408 | MtChimney Melissa, Route121 Kate | 🔴 |
| **`compare_ptr_to_local` (30)** | :417 | MtChimney Melissa, Route109 Hailey | 🔴 |
| **`compare_ptr_to_value` (31)** | :426 | AbandonedShip Demetrius, MtChimney Sheila | 🔴 |
| **`compare_ptr_to_ptr` (32)** | :435 | Route121 Joy | 🔴 |
| **`setmysteryeventstatus` (14)** | :296 | Fortree Winona, Norman rematch | 🟡 (utilisé dans scripts gym mais no-op acceptable) |
| **`addpcitem` (73)** | :531 | Aqua/Magma grunts, Mossdeep Nicholas | 🟡 PC items |
| **`initclock` (44)** | :681 | MeteorFalls RematchJay, Route121 Vanessa | 🟡 |
| **`gettime` (46)** | :696 | Magma Grunt1, Norman rematch, Route105 Foster | 🟡 horloge |
| **`removedecoration` (76)** | :557 | Aqua/Magma grunts | 🟡 déco |
| **`checkdecor` (77)** | :573 | Route102 Allen, TrickHouse Leroy | 🟡 |
| **`drawbox` (114)** | :1390 | Route112 Brice, Route131 Richard | 🟡 (no-op en décomp aussi : corps commenté) |
| **`drawboxtext` (116)** | :1431 | Brawly, Mossdeep Sylvia, Route114 Lenny | 🟡 (no-op en décomp aussi) |
| **`addelevmenuitem` (177)** | :2110 | Route124 Lila, VictoryRoad Albert | 🟡 (no-op en décomp : elevator RS) |
| **`showelevmenu` (178)** | :2121 | JaggedPass Julio, Sootopolis Brianna | 🟡 (no-op en décomp) |

**Le plus grave = `gotostd_if`/`callstd_if`/`vcall_if` + les `compare_*ptr*` + `setptr`/`loadbytefromptr`/`setptrbyte`.**
`drawbox`/`drawboxtext`/`erasebox`/`addelevmenuitem`/`showelevmenu` ont un CORPS COMMENTÉ/no-op dans le décomp
lui-même → il « suffit » d'ajouter un stub qui LIT les octets (préserve l'alignement) : trivial. Mais `gotostd_if`
& co font un VRAI contrôle de flux : les OMETTRE casse des scripts de gym-leader/trainers concrets.

Note : `drawbox`/`drawboxtext` NE sont PAS dans `BYTEVM_HANDLERS` alors que `erasebox` l'est → asymétrie
(erasebox stub présent, drawbox/drawboxtext absents). `gotostd_if`/`callstd_if`/`gotostd_if`… : seuls
`gotostd`/`callstd` (inconditionnels) sont portés, PAS leurs variantes `_if`.

### Handlers PRÉSENTS — fidélité (bon dans l'ensemble)
- Flux de base (`nop/nop1/end/goto/call/return/goto_if/call_if/gotostd/callstd`) : fidèle, offsets image = ptr décomp. ✅
- `special`/`specialvar`/`waitstate` : `waitstate` diverge (voir ci-dessous), `special` ajoute la voie
  `makeSpecialInlineFlowPoll` (special à UI inline) — adaptation assumée, ordre de lecture des args préservé. ✅
- comparaisons var/local, setvar/copyvar/addvar/subvar, flags, item/coins/money : ordre de lecture 1:1, VarGet/brut
  respectés (ex. `checkpartymove`/`setwildbattle` lisent le move/species BRUT — correct). ✅
- buffers (species/item/move/trainer/std-string) : adaptation tables FR = source unique, formatage OK. ✅
- `trainerbattle`/`dotrainerbattle`/`gotopostbattlescript`/`gotobeatenscript` : voie A binaire 1:1 (bien fait). ✅

### Divergences comportementales sur handlers présents
- **`ScrCmd_waitstate`** (scrcmd.ts:186-197) : le décomp fait UNIQUEMENT `ScriptContext_Stop(); return TRUE`
  (scrcmd.c:142-146). Notre version ajoute une machine `consumeWaitStateSignal`/`getPendingWarp`/`map changed`.
  Adaptation NÉCESSAIRE (nos flows UI async), documentée, mais c'est une state-machine maison greffée sur un
  handler 1:1 → fuite de logique harness DANS le fichier miroir. 🟡 assumé.
- **`ScrCmd_gotonative`** (scrcmd.ts:175-180) : STUB `SetupNativeScript(ctx, () => true)` — les scripts natifs
  (`gotonative`) ne sont pas résolus. Le décomp saute vers une fn C. En byte-VM, un `gotonative` atteint =
  no-op qui « réussit » et repasse en bytecode. Impact : les rares scripts à branche native (ex. certaines
  cutscenes) ne feront pas leur travail natif. 🟡 (peu fréquent en OW single-player).
- **`ScrCmd_returnram`** (scrcmd.ts:365) : `StopScript` au lieu de `ScriptJump(gRamScriptRetAddr)` (RAM script) — dette.
- **`ScrCmd_trywondercardscript`** (scrcmd.ts:445) : no-op (RAM script Wonder Card) — OK single-player.
- **`ScrCmd_pokenavcall`/`messageautoscroll`/`messageinstant`** : consomment le ptr, rendu simplifié (dette R3).
- **`ScrCmd_setberrytree`** (scrcmd.ts:893) : le décomp a un `if (berry == 0) … else …` avec les DEUX branches
  identiques (bug décomp connu, scrcmd.c:1929-1932). Notre port fait `PlantBerryTree(t,b,g,false)` direct =
  équivalent. ✅ (correct de simplifier ici).
- **BGM fade** (`fadeoutbgm`/`fadeinbgm`) : n'installent PAS `SetupNativeScript(IsBGMPausedOrStopped)` (scrcmd.c:977)
  — retournent `false` au lieu de `true`+wait. Donc `fadeoutbgm` ne bloque pas le script le temps du fade. 🟡 divergence
  (le décomp attend la fin du fade ; nous enchaînons immédiatement).
- **`ScrCmd_hidemonpic`** (scrcmd.ts:403) : compteur maison `f>=8` au lieu de la vraie `ScriptMenu_HidePokemonPic()`
  (non portée). Stub de timing. 🟡 (mais `showmonpic` est un no-op → l'image n'apparaît jamais).

### Globals scrcmd.c manquants (non exposés)
- `gNullScriptPtr` (scrcmd.c:74) — N/A (pas de sentinelle ROM).
- `sScriptConditionTable`/`sScriptStringVars`/`Compare`/`SetMovingNpcId` : présents/équivalents. ✅
- `sAddressOffset` (relative addressing v*) : N/A — nos pointeurs sont déjà absolus (adaptation documentée).
  Conséquence : `setvaddress`/`vgoto`/`vcall`/`vmessage`/`vbuffermessage`/`vbufferstring` = alias goto/message.
  `vbuffermessage`/`vbufferstring` NE sont PAS dans `BYTEVM_HANDLERS` → si émis, opcode manquant (à vérifier ;
  usage principalement Mystery Event donc probablement code-mort single-player).

---

## Oracle outil obsolète
- `scripts/audit-opcode-argbytes.cjs:19` lit `src/scrcmd_bytevm.ts` — **fichier SUPPRIMÉ** (renommé `src/scrcmd.ts`).
  L'audit tourne donc sur une source inexistante (crash `readFileSync`) : oracle mort à re-cibler sur `src/scrcmd.ts`.

---

## engine/script/specials-registry.ts (= gSpecials[] — data/specials.inc)
Statut : ✅ (clobber-pitfall CORRECTEMENT géré) — 520 specials enregistrés
Vérifié par simulation de l'ORDRE d'exécution (registerSpecial écrase par nom, top→bottom, + 2 boucles de stubs).

### 🩸 Pitfall clobber (`registerSpecial(name, () => 0)` en boucle) — VÉRIFIÉ, 0 handler clobberé
Deux boucles de stubs : `_STUB_RETURN_0_SPECIALS` (exécutée ~ligne 1430) et `_SESSION_131_DECOMP_SPECIALS`
(~ligne 2190). Une simulation d'exécution ordonnée (comment-stripped) confirme **AUCUN vrai handler n'est
clobberé** : les noms portés au-dessus des boucles ont bien été RETIRÉS des listes (commentés `//` avec la
mention « porté … ci-dessus/ci-bas »). `ShowEasyChatScreen` (le cas historique) : ligne 2143 est commentée →
le vrai handler ligne 443 survit. ✅
- ⚠️ FAUX POSITIF à éviter pour les prochains audits : un grep naïf `'Name'` dans le corps des listes matche
  les noms DANS les commentaires `//` → il FAUT strip les commentaires avant de conclure. L'oracle
  `audit-clobbered-specials.cjs` (cf. MEMORY) est la bonne méthode.
- Recommandation : ces deux boucles restent FRAGILES (tout futur port au-dessus d'une boucle sans retrait du
  nom = clobber silencieux). Convertir en `registerSpecialIfAbsent` (ne pas écraser un handler déjà réel)
  éliminerait la classe de bug. Non bloquant.

### Fidélité specials (échantillon large lu)
- Beaucoup de handlers pointent vers les vraies fns 1:1 de `field_specials.ts`/`time_events.ts`/`lottery_corner.ts`
  /`dewford_trend.ts` (bien). Les stubs `() => 0` restants sont majoritairement Frontier/Contest/Link/Union
  (exempt) OU documentés « dette R3 » (PokeNav, Wally tutorial, region-map UI).
- `EnableNationalPokedex` (ligne 501) : ré-implémenté ici ET dans `event_data.ts` — les deux cohérents (magic
  0xDA + VAR 0x302 + FLAG_SYS_NATIONAL_DEX + mode/order). Léger dédoublement (le special pourrait appeler
  `EnableNationalPokedex` d'event_data.ts). 🟡 mineur.
- `GetMomOrDadStringForTVMessage` (ligne 476) utilise `Math.random()` au lieu de `Random()` (RNG décomp) —
  divergence RNG mineure (le reste du domaine utilise bien `Random()`).

---

## script_movement.c → src/script_movement.ts
Statut : ✅ MIROIR (11/19 + helpers d'extraction)
- `ScriptMovement_StartObjectMovementScript`, `_IsObjectMovementFinished`, `_UnfreezeObjectEvents`,
  `_MoveObjects`, `_TakeStep`, `_TryAddNewMovement`, `_AddNewMovement`, `_StartMoveObjects`,
  `_GetMovementScriptIdFromObjectEventId`, table finished-bitmask : transcrits fidèlement.
- Adaptations documentées : (a) signatures prennent `objEventId` direct (le caller résout localId/map) au
  lieu de `TryGetObjectEventIdByLocalIdAndMap` ; (b) `sMovementScriptPositions[]` = index dans Uint8Array
  remplace `movementScript++` (arithmétique de pointeur C). Logique équivalente.
- Fns non exposées (inlinées/équivalentes) : `LoadObjectEventIdPtrFromMovementScript`,
  `SetObjectEventIdAtMovementScript`, `SetMovementScript`/`GetMovementScript` — repliées dans les accès
  au tableau. Pas de trou fonctionnel.
- Extra hors décomp : `_MOVEMENT_ACTION_NAME_TO_ID` (159) + `ConvertMovementActionsToIds` (adaptation
  extractor string→id) — justifié (nos movements sont extraits en strings).

## coord_event_weather.c → src/coord_event_weather.ts
Statut : ✅ MIROIR (14/14). Table `sCoordEventWeatherFuncs` + 13 `CoordEventWeather_*` + `DoCoordEventWeather`
transcrits 1:1. Le dispatcher est branché via `setDoCoordEventWeatherHook` (anti-cycle ESM, documenté).
Résolution string→id via WeatherConstants — adaptation cohérente.

## script_pokemon_util.c → src/script_pokemon_util.ts
Statut : 🟡 PARTIEL (4/13 dans le fichier ; d'autres « ailleurs »)
- Portés fidèlement : `CheckPartyMonHasHeldItem`, `ScriptGiveMon` (avec Pokédex SEEN+CAUGHT 1:1),
  `ScriptGiveEgg`, `ScriptSetMonMoveSlot` (clamp non-BUGFIX `> PARTY_SIZE` conservé). ✅
- Ailleurs : `HealPlayerParty` → `specials-registry.ts:_healPlayerParty` (transcription 1:1, mais restaure PP
  à `ppMax` — ppBonuses/CalculatePPWithBonus non modélisés, dette systémique documentée). ⚠️
  `CreateScriptedWildMon` → `engine/battle/battle-setup-helpers.ts` (utilisé par `setwildbattle`).
- Manquantes : `HasEnoughMonsForDoubleBattle` (:99) [vivant — double battle NPC ; check si porté ailleurs],
  `DoesPartyHaveEnigmaBerry` (:128) [Enigma Berry = lien, quasi N/A],
  `ChooseHalfPartyForBattle`/`ChoosePartyForBattleFrontier`/`ReducePlayerPartyToSelectedMons` +
  CB2_* (:166-228) [Frontier/multi — exempt].
  → `HasEnoughMonsForDoubleBattle` est le seul potentiellement vivant single-player (double battles
  scriptés en OW) : à vérifier qu'un équivalent existe (sinon `special HasEnoughMonsForDoubleBattle` = stub).

## script_menu.c → src/script_menu.ts
Statut : 🟡 PARTIEL/AMORCE (4/31) — dispatch multichoice fonctionnel, reste UI non porté
- Présents : `ScriptMenu_Multichoice`, `ScriptMenu_MultichoiceWithDefault`, `ScriptMenu_MultichoiceGrid`,
  `ScriptMenu_YesNo` (appelés par scrcmd.ts, rendus via `menu.ts`/`window.ts` réels). Les listes de choix
  viennent de `multichoice-lists.json` (adaptation extractor de `data/script_menu.h`, documentée).
- Manquants (majoritairement UI ou data-tables) : `CreatePCMultichoice`, `CreateLilycoveSSTidalMultichoice`,
  `ScriptMenu_ShowPokemonPic`/`HidePokemonPic` (→ `showmonpic`/`hidemonpic` stubbés dans scrcmd),
  `CreateStartMenuForPokenavTutorial`, `Task_Handle*Input` (logique repliée dans les polls menu.ts),
  `DrawLinkServicesMultichoiceMenu` (link). La plupart = UI-couplé ou link/pokenav (dette R3 / exempt).
  Le multichoice STANDARD (Yes/No + listes) marche ; `showmonpic` (pic Pokémon in-dialogue) ne s'affiche pas.

## mystery_event_script.c → ABSENT
Statut : 🚫 EXEMPT (Mystery Event / Wonder Card = flux link non implémenté, assumé).
- 0/30 — utilise `InitScriptContext`/`SetupBytecodeScript`/`RunScriptCommand` (portés dans script.ts) via une
  table de commandes SÉPARÉE `gMysteryEventScriptCmdTable` (non portée). Aucune dépendance single-player
  supplémentaire à porter : les seuls points de contact (`ScrCmd_trywondercardscript`, `returnram`, `endram`,
  `GetSavedRamScriptIfValid`, RAM-script family) sont sans effet hors Wonder Card. Exempt confirmé.

---

## TOP 5 (levier × effort)

### 1. 🔴 Handlers de flux `gotostd_if` / `callstd_if` / `vcall_if` MANQUANTS (S)
Absents de `BYTEVM_HANDLERS` (scrcmd.c:255/269/225 — cmdId 10/11/188). Atteints comme VRAIS opcodes dans des
scripts de gym-leader/trainers LIVE (Brawly, Norman rematch, Magma/Aqua grunts). Quand atteint → `RunScriptCommand`
warn + STOP → le script s'interrompt (dialogue tronqué, `release` jamais exécuté → joueur potentiellement figé).
Fix : ajouter 3 handlers (copie de `goto_if`/`call_if` + résolution std-offset via `fetchStdOffset`).
- **Taille : S** (chacun = quelques lignes, motif déjà présent).
- **ORACLE** : parler à Brawly (Dewford Gym) et gagner → observer si le post-combat drawboxtext/release se joue.
  Console : chercher `[byte-vm] cmd 0xa non porté` / `0xb` / `0xbc`. Ou `__byteVm.launchScript('DewfordTown_Gym_EventScript_Brawly')`.

### 2. 🔴 Handlers `setptr` / `loadbytefromptr` / `setptrbyte` + `compare_*_ptr_*` MANQUANTS (M)
scrcmd.c:312-441 (cmdId 17/18/19/29/30/31/32). Utilisés massivement par les scripts « Trick House » puzzles
et plusieurs trainers (MtChimney, Route109/113/117…). Ces opcodes lisent/écrivent des octets RAM et comparent
via pointeur. Chez nous les « pointeurs RAM » ne sont pas modélisés (comme `copybyte`) → il faut au MINIMUM un
stub qui LIT le bon nombre d'octets (alignement) ; idéalement porter le vrai comportement (data[] / scratch RAM).
Sans eux, dès qu'atteints → STOP script.
- **Taille : M** (stub-align trivial ; port réel = modéliser un petit scratch RAM). 
- **ORACLE** : entrer une salle Trick House (Route 110) et résoudre un puzzle ; ou `__byteVm.launchScript('Route110_TrickHousePuzzle4_EventScript_Cora')` → vérifier absence de `cmd 0x11/0x12/0x13 non porté`.

### 3. 🟡 Stubs d'alignement manquants : `drawbox`/`drawboxtext`/`addelevmenuitem`/`showelevmenu`/`initclock`/`gettime`/`addpcitem`/`removedecoration`/`checkdecor` (S)
Ces opcodes sont ÉMIS et atteints (Brawly, gyms, Sootopolis, VictoryRoad…). Plusieurs ont un corps no-op DANS
le décomp (drawbox/elev) → un simple stub qui consomme les octets suffit à ne pas casser le flux. `initclock`/
`gettime`/`addpcitem`/`removedecoration`/`checkdecor` ont un vrai corps simple à porter (RtcInitLocalTimeOffset /
RtcCalcLocalTime → gLocalTime, AddPCItem, DecorationRemove/CheckHasDecoration).
- **Taille : S**. Priorité car chaque opcode manquant = un STOP potentiel là où il apparaît.
- **ORACLE** : `gettime` dans un script (Norman rematch) ; ou combattre un trainer avec `drawboxtext` (Brawly).
  Vérifier console `cmd 0x72/0x2e/0x2c/0x4c/0x4d/0xb1/0xb2 non porté`.

### 4. 🟡 `ScrCmd_gotonative` stub (M)
`gotonative` (scrcmd.c:110) : stub `() => true` → tout script à branche native (certaines cutscenes) ne fait
pas son travail natif ; repasse en bytecode sans exécuter la fn C. Résoudre l'id de symbole natif → fn C portée
(Phase 4b jamais faite). Impact réel faible en OW single-player (peu de `gotonative`), mais silencieux.
- Note : `HasEnoughMonsForDoubleBattle` (script_pokemon_util.c:99) EST porté 1:1 (specials-registry.ts:1009,
  pose VAR_RESULT = GetMonsStateToDoubles()) → PAS un trou. (Correction : ce point n'est plus un gap.)
- **Taille : M** (gotonative = table de natifs).
- **ORACLE** : chercher les scripts à `gotonative` (cutscenes) et vérifier console `cmd 0x3 non porté` /
  comportement natif absent. Sinon faible priorité.

### 5. 🟡 Divergences comportementales assumées à surveiller (S, doc)
(a) `fadeoutbgm`/`fadeinbgm` ne bloquent pas le script (return false vs décomp SetupNativeScript+wait) → le
texte suivant peut s'afficher avant la fin du fade. (b) `waitstate` = state-machine maison greffée (fuite
harness dans le fichier miroir — nécessaire mais à isoler). (c) `ScriptContext_Init` déverrouille le lock
(ajout hors décomp). (d) `TryRunOnWarpIntoMapScript` compare `Number(valueTok)` au lieu de `VarGet` (les deux
opérandes devraient passer par VarGet, cf `MapHeaderCheckScriptTable`). (e) Oracle `audit-opcode-argbytes.cjs`
pointe le fichier supprimé `src/scrcmd_bytevm.ts` → à re-cibler.
- **Taille : S** chacun ; surtout de la doc/consolidation. Faible risque mais non-1:1.
- **ORACLE** (a) : un NPC qui fait `fadeoutbgm; msgbox` → vérifier que le texte n'apparaît pas avant le silence.

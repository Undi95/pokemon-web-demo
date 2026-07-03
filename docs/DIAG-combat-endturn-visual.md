# DIAG — effets fin-de-tour combat invisibles (brûlure/poison/… anim + perte PV)

> ✅ **RÉSOLU (`1ea0141a`)** : `_BattleTurnPassed` réécrit en 1:1 décomp `BattleTurnPassed()`
> avec pacing PER-FRAME via `BattleScriptExecute` (au lieu de la rafale synchrone). Vérifié en
> jeu : barre PV brûlure 35→31→21→17 animée tour après tour, modèle+instance+visuel en sync,
> progression de tour + fin de combat OK. Répare TOUS les effets résiduels. Le reste du doc
> ci-dessous = le diagnostic d'origine (conservé pour référence).

**Bug user #1** : « Le feu, son animation ET la perte de PV ne marchent pas, mais atk bien
divisée en deux. » Reproduit et diagnostiqué en jeu 2026-07-03 (combat sauvage RATTATA,
ARCKO brûlé).

## Symptôme observé (mesuré en jeu)

Après un tour, ARCKO brûlé :
- `gBattleMons[0].hp` = **31** (était 35) → **la brûlure EST appliquée au modèle** (35/8 = 4).
- `gPlayerParty[0].hp` = **35** (instance NON synchronisée).
- Barre visuelle = **35/35** (stale — ne reflète rien).
- Aucune animation de statut, aucun message « ARCKO souffre de sa brûlure ».
- (Coup normal OK : ÉCRAS'FACE a bien blessé RATTATA 18→11, barre ennemie animée.)

→ Le calcul de dégât résiduel fonctionne ; c'est le **rendu** qui est absent. Touche
TOUS les effets résiduels fin-de-tour (poison, toxik, vampigraine, cauchemar, malédiction,
tempête de sable/grêle, etc.), pas seulement la brûlure.

## Cause racine (3 couches)

Chaîne live : `battle_main.ts:_BattleTurnPassed` (4742) → `runBattleTurnPassedViaBytecode`
(wire-bytecode-bridge.ts:~700) → boucle `DoBattlerEndTurnEffects()` + `_runScriptSync(label)`.

1. **Rafale synchrone sans pacing per-frame** (dette « R3 », cf. commentaire battle_main.ts:4736).
   `_runScriptSync` (wire-bytecode-bridge.ts:937) déroule TOUT le script `BattleScript_BurnTurnDmg`
   dans une boucle `while(runBattleScript(ctx))` en UN tick. Les opcodes de LOGIQUE
   (`datahpupdate`) s'appliquent (→ gBattleMons.hp change), mais les opcodes VISUELS
   (`statusanimation`, `healthbarupdate`) n'ont pas de frames pour jouer → aucun rendu.
   ≠ chemin coup normal, qui STEPPE `gBattleScriptContext.scriptPtr` **per-frame** (le
   stepper persistant, cf. HandleEndTurn_FinishBattle) → animations + barre + messages jouent.

2. **`_BattleTurnPassed` jette les events/messages.** Le wire retourne
   `{ messages, events, ... }` (drainBattleEventsAsText), mais battle_main.ts:4743-4749 ne lit
   que `res.battleEnded` → le message de brûlure et les events visuels queués sont ignorés.

3. **Pas de sync gBattleMons → instance party.** Le chemin coup-normal fait
   `opts.attacker.hp = gBattleMons[bid].hp` (wire-bytecode-bridge.ts:315). Le chemin
   fin-de-tour ne le fait pas → même si on redessinait, la health box (qui lit l'instance,
   prouvé : instance=35 ⇒ barre=35) montrerait la valeur stale.

## Fix

**Fix 1:1 (recommandé, = « dette R3 »)** : router les scripts fin-de-tour dans le MÊME
pacing per-frame que les moves (via `gBattleScriptContext.scriptPtr` + stepper persistant),
au lieu de `_runScriptSync`. Nécessite de transformer `runBattleTurnPassedViaBytecode`
(rafale synchrone) en machine à états resumable (yield après chaque script, reprise frame
suivante) pilotée par `gBattleMainFunc`. → anim + barre animée + message = 1:1. **Chantier
combat dédié** (moteur combat EN PAUSE ; ne pas bâcler — le chemin move marche, ne pas le
casser).

**Fix partiel (NON-1:1, déconseillé)** : après la rafale, sync gBattleMons→instances +
`__battleHealthbox.updateHealthboxAttribute(HP_BAR)` pour snap la barre + surface les
messages. Rend la perte de PV + le message visibles mais SANS animation (snap) → viole
« la ROM anime » (contrat 1:1). À n'utiliser que si le user accepte explicitement un
intermédiaire visible-mais-non-animé en attendant le fix pacing.

## Où toucher

- `src/engine/battle/wire-bytecode-bridge.ts` : `runBattleTurnPassedViaBytecode` (~700),
  `_runScriptSync` (937). C'est ici que la rafale devient per-frame.
- `src/battle_main.ts` : `_BattleTurnPassed` (4742) — consommer messages/events + poser
  le bon `gBattleMainFunc` pour stepper les scripts end-turn.
- Modèle du chemin qui MARCHE : exécution move per-frame (stepper `gBattleScriptContext`).

## Statut bugs combat liés (mêmes racines probables)

- **#2 apprentissage attaque via lvl up in-battle** — ✅ **RÉSOLU (`bc112e8f`, vérifié en jeu
  de bout en bout : ARCKO 4 moves → box → summary → remplacement → « apprend POURSUITE! »).**
  Cmd_yesnoboxlearnmove câblé 1:1 (cases 0-6, réutilise la machinerie evolution_scene/party_menu).
  Diagnostic d'origine : PAS la
  même famille. `_monTryLearningNewMove` (battle_script_commands.ts:9953) appelle le VRAI
  `MonTryLearningNewMove_Foyer` → un mon avec **<4 moves apprend correctement** (le commentaire
  « stub retourne MOVE_NONE » était PÉRIMÉ, corrigé). Le vrai bug = **`Cmd_yesnoboxlearnmove`
  (battle_script_commands.ts:10270), cases 1-4 stubés « auto-NO »** : quand le mon a déjà 4
  capacités et doit en oublier une, le YES/NO box + l'écran summary de sélection de slot NE
  sont PAS wirés en combat → le move n'est jamais appris (auto-NO). ARCKO (4 moves) tombe pile
  dessus. FIX = câbler le flux replace-move EN COMBAT (YES/NO box battle + summary screen slot-pick
  → SetMonMoveSlot + RemoveMonPPBonus), réutiliser la machinerie replace-move déjà portée dans
  party_menu.ts (dette #8 soldée : phases YesNo→summary→slot). Sous-chantier UI battle dédié.
- **#3 dialogue + BGM combat se relance** : à repro séparément (piste : re-entrée d'un
  état/CB2, pas forcément lié au pacing).

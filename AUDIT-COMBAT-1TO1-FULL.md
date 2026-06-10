# AUDIT COMBAT 1:1 — État complet, bugs root-causés, roadmap

> **Source** : workflow Ultracode `audit-combat-1to1-full` (2026-06-08, run `wf_23c1c580-925`).
> 15 agents · 98k tokens · ~3,5 min. ⚠️ *Caveat* : les 14 agents cartographes ont fait l'analyse
> mais n'ont pas appelé l'outil de sortie structurée → leurs findings bruts sont perdus ; **l'architecte
> de synthèse a relu le codebase lui-même** et produit ce livrable (fiable, recoupé avec la session).
> À régénérer/enrichir au besoin. Voir aussi `docs/DECOMP-TS-BRIDGE.md`.

---

## 🎯 Résumé exécutif

Le **MOTEUR de combat** (calcul dégâts/types/crit/STAB, machine de tour `gBattleMainFunc`, exec-flags
controllers, fin de combat EXP→WON/LOST→fade, ~150 moves via bytecode) est **porté 1:1 sur la voie L**
(`src/engine/battle/`) et **A/B-validé sur ROM**.

Le gros gap n'est **PAS la logique** mais :
- **(a) le RENDU 1:1** : texte encore en `setTimeout` au lieu de `RunTextPrinters` per-frame (= divergence
  de pacing racine) ; anims de move = no-op ; send-out encore ad-hoc.
- **(b) la MIGRATION physique vers `src/game/`** : seuls 6 fichiers battle y vivent ; le cœur reste dans
  `src/engine/battle/`, et la voie V (`battle-flow.ts`, 4773 l.) tourne toujours pour trainer/Birch.

**Bug le plus urgent + le plus mûr à clore** : câbler le send-out 1:1 dormant (`game/pokeball.ts`, prêt,
tsc 0) en retirant les 4 ticks ad-hoc de `BattleMainCB2` → c'est le levier **#22** qui débloque la chaîne
send-out→switch et règle la désync visuelle d'entrée + la pokeball noire.

---

## 🗂️ Matrice de statut 1:1 (16 sous-systèmes)

| Sous-système | Statut | Verdict 1:1 | Effort |
|---|---|---|:---:|
| Moteur de tour (`gBattleMainFunc`/exec-flags) | Porté 1:1, A/B-validé harness+ROM | 1:1 structurel OK (voie L) | S |
| Calcul combat (dégâts/types/crit/STAB/statuts) | Porté 1:1, A/B-validé (Pikachu Lv50 5/5 exact) | 1:1 (bytecode partagé V↔L) | S |
| Interpréteur de script combat (opcodes) | 98/287 opcodes ; chemin wild complet | 1:1 sur les portés ; 189 manquants | L |
| Fin de combat (Faint/GiveExp/EndTurn/fade) | Wild 1:1 complet ; trainer/link = stubs `{}` | 1:1 wild ; case 6 switch-in = stub | M |
| Controllers player/opponent (table 56 cmd) | Table 1:1 ; handlers majoritairement câblés | 1:1 ; quelques `Emit*` enqueue-only | M |
| **Rendu texte combat** (`BattlePutTextOnWindow`) | **`setTimeout` (3 sites) — NON 1:1** | **Divergence racine → `RunTextPrinters` per-frame** | M |
| Intro/transition d'entrée | Porté `src/game/`, câblé, herbe OK | 1:1 ; reste blend Slide3 + transitions | M |
| **Send-out** (`game/pokeball.ts` chain) | **Porté 1:1 DORMANT (tsc 0)** ; ad-hoc actif | 1:1 prêt, non câblé (#22 A/B) | M |
| Ball GFX (`LoadBallGfx`/sheets/preload) | Mécanisme décomp en place (#21b-gfx) | 1:1 POKE_BALL ; `gOpenPokeballGfx` à confirmer | S |
| Switch (`HandleAction_Switch` + send-out suivant) | Handler présent ; dépend du send-out 1:1 | Partiel ; bloqué par send-out ad-hoc | M |
| Items en combat (`HandleAction_UseItem`) | Partiel (ball/medicine via `ItemUseInBattle`) | Partiel | M |
| **Interpréteur d'anim de move** (`battle_anim.c`, 48 op) | Porté 1:1 MAIS `createsprite`/`createvisualtask` = **no-op** | Structure 1:1 ; spawn non résolu | L |
| **Anims de move** (415 callbacks) | **0/415 — placeholder lunge** | Non porté (gros chantier visuel) | XL |
| Healthbox/HP-EXP bars (`battle_interface.c`) | Fonctionnel ad-hoc ; port miroir partiel | Non strictement 1:1 | L |
| **Voie V** (`battle-flow.ts` 4773 l. + satellites) | VIVANTE pour trainer/Birch/scripts/devtools | NON 1:1 — à détruire (P6) | XL |
| Migration physique vers `src/game/` | 6/~15 fichiers migrés ; cœur reste `engine/battle/` | En cours | XL |

---

## 🐛 Bugs confirmés (root-causés, triés par sévérité)

### 🔴 HIGH — Send-out / pokeball
- **Symptôme** : send-out ad-hoc désynchronisé (étincelles ball corrompues, timing dresseur, mon qui *pop*
  au lieu de grandir) ; **pokeball NOIRE** (blob noir).
- **Root cause** : le send-out tourne sur `battle-sendout-anim.ts` (~872 l. ad-hoc, hors dispatch décomp,
  piloté sur `gIntroFrameCounter`) + 4 ticks NON-1:1 dans `BattleMainCB2`. La **pokeball noire** vient d'un
  `CreateSprite(template taggé)` déclenché **AVANT** que la sheet ball (`GFX_TAG_POKE_BALL=55000`) ne soit
  chargée → `GetSpriteTileStartByTag=0xFFFF` → tiles vides = sprite noir (cf. `DECOMP-TS-BRIDGE` §4).
- **Fix** : exécuter **#22** — (1) câbler `PlayerHandleIntroTrainerBallThrow`→…→`DoPokeballSendOutAnimation`
  (`game/pokeball.ts`) ; (2) poser le **double-flag** `gMain.inBattle` (`rt.gMain.inBattle` ET
  `_gMain_inBattle`) ; (3) retirer les 4 ticks ad-hoc + `battle-sendout-anim.ts` ; (4) **garantir
  `ensureBallGfxLoaded()` AVANT le 1er `CreateSprite` ball** ; (5) template affine joueur. A/B obligatoire.
  Rollback = `git checkout -- src/`.

### 🟠 MEDIUM — Anims de move (interpréteur)
- **Symptôme** : aucune anim de move réelle (placeholder lunge) malgré l'interpréteur porté.
- **Root cause** : `battle-anim-interpreter.ts:703` `Cmd_createsprite` et `:738` `Cmd_createvisualtask` sont
  des **no-ops** : ils lisent le bytecode + incrémentent `gAnimVisualTaskCount` mais ne résolvent/spawnent
  ni le template sprite ni la task func.
- **Fix** : construire la table `template-ptr→DecompSpriteTemplate` et `taskFunc-ptr→fonction TS` (les 415
  callbacks), puis brancher `Cmd_createsprite`→`CreateSpriteAndAnimate` et `Cmd_createvisualtask`→`CreateTask`.
  **Étape habilitante AVANT** de porter les 415 callbacks.

### 🟠 MEDIUM — Rendu texte combat
- **Symptôme** : désync texte/anim ; le tick synchrone du harness gèle ; pacing non déterministe.
- **Root cause** : `BattlePutTextOnWindow` utilise `setTimeout` (3 sites) au lieu de `RunTextPrinters` +
  `IsTextPrinterActive` per-frame → ne s'intègre pas au modèle exec-flag (le bit n'est jamais clear
  per-frame de façon 1:1).
- **Fix** : remplacer le `setTimeout` par `RunTextPrinters` per-frame (tické dans `BattleMainCB2`) +
  complétion controller via `IsTextPrinterActive`.

### 🟡 LOW — Fin de combat / switch-in
- **Symptôme** : abilities/items de switch-in (Intimidate, Trace, Drizzle/Drought, Forecast) ne s'appliquent
  pas après un faint.
- **Root cause** : `handle-action.ts:619` `HandleFaintedMonActions` case 6 est un stub (passe à l'état 7).
- **Fix** : porter case 6 1:1 (`AbilityBattleEffects` + `ItemBattleEffects` sur les battlers entrants).

### 🟡 LOW — Controllers (`Emit*`)
- **Symptôme** : bug 1:1 latent (dispatch sur buffer résiduel possible).
- **Root cause** : `EmitYesNoBox` reste un no-op (ne fait pas `PrepareBufferDataTransfer`→`_emitToBufferA`)
  — même classe de bug que le re-combat écran noir déjà corrigé (`EmitGetMonData`).
- **Fix** : porter `BtlController_EmitYesNoBox`→`_emitToBufferA([CONTROLLER_YESNOBOX,...])` 1:1 + auditer
  tout `Emit*` restant qui ne fait pas `PrepareBufferDataTransfer`.

### 🟡 LOW — Globals VBlank (`gMain.inBattle` / `gBattle_BG*`)
- **Root cause** : **DOUBLE-FLAG** — `setMainInBattle()` n'écrit que `_gMain_inBattle`, pas
  `rt.gMain.inBattle` (cf. `DECOMP-TS-BRIDGE` §3). Idem `gBattle_BG*` ont eu 2 sources.
- **Fix** : toujours poser les DEUX (déjà fait dans le working tree #22). Un seul point de vérité pour
  `gBattle_BG*`.

---

## 🛣️ Roadmap ordonnée (12 étapes)

| # | Sous-système | Action | Dépend de | Effort | Risque |
|:--:|---|---|---|:--:|---|
| 1 | **Send-out** | Câbler le send-out 1:1 (#22) + double-flag + retrait 4 ticks + `ensureBallGfxLoaded` + affine joueur. A/B ROM. | #19/#20/#21 faits | M | Touche l'entrée qui marche → tout-ou-rien + rollback git. Vérifier A/B que le mon GRANDIT. |
| 2 | **Switch** | `HandleAction_Switch` + send-out mon suivant sur la chaîne pokeball 1:1. | #1 obligatoire | M | Soft-lock si chaîne pas robuste ; tester switch + après-KO. |
| 3 | **Texte** | Remplacer `setTimeout` par `RunTextPrinters`/`IsTextPrinterActive` per-frame. | — (débloque le pacing) | M | Régression pacing tous messages. A/B multi-tours. |
| 4 | **Fin de combat** | `HandleFaintedMonActions` case 6 + `HandleEndTurn_BattleWon/Lost` trainer/link (stubs `{}`) + argent. | Indépendant | M | Faible (logique pure, harness). |
| 5 | **Controllers** | `EmitYesNoBox` 1:1 + audit `Emit*` restants. | — | S | Très faible (additif). |
| 6 | **Interpréteur d'anim** | Tables `template-ptr`/`taskFunc-ptr` + brancher `createsprite`/`createvisualtask`. | Précède les 415 callbacks | L | Extraction templates/tilemaps. **Ne porter aucun callback avant.** |
| 7 | **Anims de move** | Porter les 415 callbacks par vagues (commencer Tackle/Pound/Leer/Ember). | #6 obligatoire | XL | Long, 100% A/B visuel. Ne bloque pas la jouabilité. |
| 8 | **Healthbox** | Port miroir 1:1 `battle_interface.c` → `src/game/`. | bénéficie de #3 | L | Visuel A/B ; migration progressive. |
| 9 | **Voie V — trainer/Birch** | Porter trainer-battle + Birch sur voie L (#11/#12). | #1-#4 | L | Birch contraint ; trainer = AI + multi + argent. |
| 10 | **Voie V — scripts/devtools** | Basculer scripts + devtools sur voie L (#13). | #9 | M | Préserver devtools capture. |
| 11 | **Voie V — suppression** | Supprimer `battle-flow.ts` + satellites (#14). | #9/#10 | XL | Élevé si chemin V résiduel. Auditer callers. |
| 12 | **Migration `src/game/`** | Finir la migration physique (noms décomp + façades ré-export). | #11 | XL | Cycles ESM ; par tranches testées. |

---

## ⚡ Quick wins (déterministes, fort impact)
1. **Câbler le send-out 1:1 (#22)** — tout est prêt (dormant + tsc 0 + working tree déjà édité), reste l'A/B. Levier #1.
2. **`EmitYesNoBox` 1:1** — ferme la classe de bug du re-combat noir. Additif, vérif harness.
3. **`HandleFaintedMonActions` case 6** (abilities switch-in) — logique pure, harness.
4. **Garantir `ensureBallGfxLoaded()` avant tout `CreateSprite` ball** — élimine la pokeball NOIRE déterministement.
5. **Double-flag `gMain.inBattle`** partout — déjà dans le working tree, à committer après A/B.
6. **`HandleEndTurn_BattleWon/Lost` trainer** vers le ctx de script (remplacer les stubs `{}`) — copie du pattern wild.

---

## 🕳️ Plus gros gaps
1. **Les 415 anims de move** (0/415) — bloqué EN AMONT par les no-ops `createsprite`/`createvisualtask`. Table de résolution d'abord, puis vagues. XL, 100% A/B.
2. **La double-implémentation** : la voie V (`battle-flow.ts` 4773 l. + ~8 satellites) tourne encore. Tant qu'elle vit, le 1:1 n'est pas atteint et les 2 voies peuvent diverger.
3. **La migration physique** : ~80% du combat reste dans `src/engine/battle/` (controllers, script-commands 12124 l., main-functions 1831 l., interpreter, handle-action). La cible « mêmes noms fichiers » n'est pas tenue.
4. **Le texte sur `setTimeout`** : divergence de pacing racine qui empêche les pièces (faint/exp/switch) de s'emboîter en lockstep avec les exec-flags.
5. **Longue traîne** : opcodes script (189/287 manquants) + helpers `battle_anim_mons` (121/128) pour les moves non encore exercés (multi-hit, charge, substitute, multi-cibles).

---

## ✅ Prochaines actions recommandées
1. **CÂBLER LE SEND-OUT 1:1 (#22) — A/B user** : brancher `game/pokeball.ts`, retirer les 4 ticks + `battle-sendout-anim.ts`, double-flag, garantir `ensureBallGfxLoaded`. Vérifier ROM : ball arc + mon GRANDIT + 1 cri + pas de soft-lock. KO → `git checkout -- src/`. **Bug bloquant le plus mûr ; débloque le switch.**
2. **ENCHAÎNER LE SWITCH** (`HandleAction_Switch` + send-out suivant) sur la chaîne pokeball 1:1 — règle les soft-locks switch/après-KO.
3. **QUICK WINS DÉTERMINISTES en parallèle** (0 A/B) : `EmitYesNoBox` 1:1, `HandleFaintedMonActions` case 6, `HandleEndTurn` trainer.
4. **TEXTE 1:1** : `setTimeout` → `RunTextPrinters`/`IsTextPrinterActive` per-frame — débloque le pacing déterministe de tout le tour.
5. **TABLE DE RÉSOLUTION D'ANIM** (`template-ptr`/`taskFunc-ptr`) — pré-requis AVANT les 415 callbacks (n'en porter aucun avant).

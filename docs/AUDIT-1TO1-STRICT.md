# AUDIT 1:1 STRICT — revue fichier-par-fichier des systèmes déjà portés

**Pour : Opus 4.8 (post-compaction), en SOLO. Aucun agent (mandat user 2026-07-03).**

## Idée (user)

On a des systèmes « censés finis » qui contiennent encore des divergences 1:1 non
détectées (ex. le texte quantité du sac affiché en BLANC — `PrintItemQuantity` était
« portée » mais avec la mauvaise couleur interne, `93ec1ea1`). Plutôt que d'attendre de
tomber sur ces glitchs par hasard, on **audite proactivement** ce qui est déjà là et on
corrige tout ce qui n'est pas 1:1 strict avec la décomp. Fichier par fichier.

## Ce que l'oracle détecte (et pas)

`node scripts/audit-callgraph-closure.cjs --file X.c` :
- ✅ Fonctions **ABSENTES** (à porter), **DRIFT** (nom/variante, adaptation), **PORTÉ exact**.
- ⚠️ NE détecte PAS les **divergences internes** d'une fonction portée (couleur, valeur,
  ordre, arithmétique, condition, branche manquante). ← c'est le gros du travail ici.

→ L'oracle donne l'**inventaire des fonctions** d'un fichier ; la fidélité interne se
vérifie en **lisant le .ts et le .c côte à côte**.

## Méthode par fichier (boucle)

Pour chaque fichier `src/X.ts` (miroir de `decomps/pokeemeraude/src/X.c`) :
1. `node scripts/audit-callgraph-closure.cjs --file X.c` → inventaire (absent/drift/exact).
2. Ouvrir `src/X.ts` ET `D:/Projet 1/decomps/pokeemeraude/src/X.c`. Pour CHAQUE fonction
   portée, comparer **ligne à ligne** :
   - **UI** : couleurs (COLORID/font default), coords fenêtre (tilemapLeft/Top/baseBlock),
     offsets, palettes, FONT_*, largeurs, alignements.
   - **Valeurs** : constantes (jamais de magic number sans source), divisions ENTIÈRES,
     wrap s8/s16, masques u8/u16, `>= 32767` (USHRT_MAX/2).
   - **Logique** : ordre des opérations, conditions (pas inversées), branches manquantes,
     early-return de confort, bug-Emerald conservés (#ifndef BUGFIX).
   - **Noms** : mêmes noms de fn/globals/vars que la décomp (drift = à corriger si possible).
3. Noter chaque divergence, la corriger 1:1 (transcrire, pas improviser). Si un écart
   dépend d'un sous-système réellement absent → le laisser + commentaire précis (pas de stub).
4. `npx tsc --noEmit` (cwd repo) après chaque fichier. `*/` dans un commentaire = fin de bloc.
5. Vérif EN JEU si la divergence est observable (preview tools, superviseur SEUL).
6. **Commit par fichier** (ou par petit lot cohérent) : staging explicite, message heredoc,
   `Authored-by: Opus 4.8 & Undi <noreply@anthropic.com>`.

## Ordre proposé (systèmes récemment « finis », surface UI d'abord = divergences visibles)

Cocher au fur et à mesure. Croiser avec l'oracle `--file`.

- [ ] `src/item_menu.ts` (sac — le bag couleur était là ; ÉNORME item_menu.c, prioriser les
      fonctions d'affichage : BagMenu_Print/ItemPrintCallback/PrintItemQuantity/contexte menus)
- [ ] `src/item_use.ts` (messages party, {PLAY_SE}, phases)
- [ ] `src/party_menu.ts` (gros ; CursorCb, messages, couleurs, layout fenêtres)
- [ ] `src/egg_hatch.ts` (éclosion P2.2 — 25 fns, sprites/anim/couleurs)
- [ ] `src/evolution_scene.ts` + `src/evolution_graphics.ts` (évolution)
- [ ] `src/naming_screen.ts` (surnom — icône, layout clavier)
- [ ] `src/mail.ts` (déjà touché : couleurs sBgColors/sMailGraphics, layout)
- [ ] `src/daycare.ts` (pension — 67 fns, menu niveau, compat string, coûts)
- [ ] `src/trainer_see.ts` + `src/battle_setup.ts` (aggro P2.3)
- [ ] `src/pokemon.ts` (cœur — stats, exp, évolution ; croiser oracle, gros)
- [ ] `src/start_menu.ts`, `src/field_control_avatar.ts`, `src/event_object_lock.ts` (field récents)
- [ ] `src/scrcmd.ts` (byte-VM opcodes — 225/225, vérifier fidélité args)
- [ ] Puis : combat (battle_*), pokédex, overworld selon priorité user.

## Types de divergences déjà rencontrées (patterns à chasser)

- **Couleur** : `BagMenu_Print(COLORID_X)` vs `AddTextPrinterParameterized` (couleurs font
  défaut). COLORID_NORMAL a fg=1 (WHITE) — souvent PAS ce que la décomp veut. (bag `93ec1ea1`)
- **Champ omis au spawn/init** : `InitObjectEventStateFromTemplate` ne copiait pas
  trainerType/trainerRange/currentElevation (P2.3 `bb6b3b6b`). Vérifier que les init
  copient TOUS les champs de la décomp.
- **Data hardcodée** : `trainerType: 0` au lieu de résoudre la string du JSON (`bb6b3b6b`).
- **Double-mécanisme** : special-flow poll + waitstate opcode = conflit (`bb6b3b6b`).
- **Ordre d'args divergent** : `GetStringCenterAlignXOffset(str, w, font)` vs décomp
  `(font, str, w)` — API port, s'y conformer mais noter.

## Règles (contrat, non négociable)

1:1 strict transcription (mêmes noms fichiers/fns/globals). Décomp = vérité
(`D:/Projet 1/decomps/pokeemeraude`, build FR). tsc=0 + vérif en jeu (observable) + diff vs
décomp. Chemins absolus + `git -C`. Jamais `git add -A` ; jamais commit
`audit-reports/*`/`cartograph.json`/`callgraph-closure.json`. FR informel. Branche
`Byte-VM-ultra`, jamais push. Signature Opus 4.8.

## Journal (remplir au fur et à mesure)

| Fichier | Divergences trouvées | Statut | Commit |
|---------|----------------------|--------|--------|
| item_menu.ts (PrintItemQuantity) | couleur ×NN blanche → font default | ✅ corrigé | `93ec1ea1` |
| _(à remplir)_ | | | |

## Bugs combat mis EN ATTENTE (repris après l'audit, ou si user re-priorise)

Diag démarré : `ENDTURN_BURN` (battle_util.ts:3969) + `DoBattlerEndTurnEffects` = portés 1:1
exact → le bug brûlure (dégât+anim absents) est dans le CÂBLAGE (DoBattlerEndTurnEffects
appelée ?) ou l'EXÉCUTION (`BattleScript_BurnTurnDmg` exécuté/appliqué ?). Repro en combat
requise. + apprentissage attaque in-battle cassé + dialogue/BGM combat qui se relance.

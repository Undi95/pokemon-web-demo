# AUDIT 1:1 STRICT — revue fichier-par-fichier des systèmes déjà portés

**Pour : Opus 4.8 (post-compaction), en SOLO. Aucun agent (mandat user 2026-07-03).**

## Idée (user)

On a des systèmes « censés finis » qui contiennent encore des divergences 1:1 non
détectées (ex. le texte quantité du sac affiché en BLANC — `PrintItemQuantity` était
« portée » mais avec la mauvaise couleur interne, `93ec1ea1`). Plutôt que d'attendre de
tomber sur ces glitchs par hasard, on **audite proactivement** ce qui est déjà là et on
corrige tout ce qui n'est pas 1:1 strict avec la décomp. Fichier par fichier.

## Périmètre : TOUT le repo miroir (pas seulement le récent)

Audit exhaustif de **tous** les fichiers portés vs leur décomp. L'oracle de Fable 5
(`scripts/audit-callgraph-closure.cjs`) est la SOURCE (ne pas réinventer d'inventaire —
un essai maison basename-only a été supprimé, il était redondant et inférieur).

**Liste des fichiers à auditer = le `perFile` de l'oracle** (785 fichiers .c avec ≥1 fn
portée ; ~530 à 100% de portage — à auditer quand même pour les divergences internes —
et ~255 avec des trous). Régénérer + lire la liste :
```
node scripts/audit-callgraph-closure.cjs            # régénère audit-reports/callgraph-closure.json
node -e "const d=require('./audit-reports/callgraph-closure.json');const r=Object.entries(d.perFile).map(([f,v])=>({f,t:v.total,p:v.ported,gap:v.total-v.ported}));r.sort((a,b)=>b.p-a.p);r.forEach(x=>console.log(String(x.p).padStart(4)+'/'+String(x.t).padStart(4),x.gap?('GAP'+x.gap):'   ',x.f))"
```
(⚠️ `callgraph-closure.json` = JAMAIS commité ; on le régénère.)

## Ce que l'oracle détecte (et pas)

`--file X.c` (par fichier) / `--sym Name` (par symbole) / global (gaps triés) :
- ✅ Fonctions **ABSENTES** (à porter), **DRIFT** (nom/variante, adaptation), **PORTÉ exact**,
  + `perFile` (total/portées par fichier), + gaps triés par nb d'appelants.
- ⚠️ NE détecte PAS les **divergences internes** d'une fonction déjà portée (couleur, valeur,
  ordre, arithmétique, condition, branche manquante). ← c'est le gros du travail ici.

→ L'oracle donne l'**inventaire des fonctions** (par fichier + trous) ; la fidélité interne
se vérifie en **lisant le .ts et le .c côte à côte**. Un fichier « 100% porté » selon
l'oracle peut TOUJOURS contenir des divergences internes (ex. bag ×NN blanc `93ec1ea1`).

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

## Ordre proposé — PUIS dérouler TOUT le perFile (785 fichiers, rien n'est exempt)

Point de DÉPART = surface UI (divergences les plus visibles), listé ci-dessous. Ensuite,
dérouler **l'intégralité du perFile** de l'oracle (par nb de fns portées décroissant, ou par
domaine). L'objectif est 785/785 fichiers audités. Cocher au fur et à mesure ; croiser
chaque fichier avec l'oracle `--file X.c`.

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
| item_menu.ts (_bagDrawRegisteredIcon) | icône SELECT objet-clé enregistré = no-op « déféré » alors que l'asset select_button.4bpp.bin est DÉJÀ extrait | ✅ corrigé (blit 1:1) | `7cfb4056` |
| item_menu.ts (ItemMenu_Register) | omettait le rebuild de liste (:1926-1929) → l'icône SELECT ne se (re)dessinait jamais ; appelait _returnToList au lieu de ItemMenu_Cancel | ✅ corrigé | `7cfb4056` |
| item_menu.ts (revue affichage) | BagMenu_Print / sFontColorTable / PrintItemDescription / ItemPrintCallback = 1:1 exact ; **commentaires STUB/DÉFÉRÉ périmés** (dispatcher UseOutOfBattle en fait complet, « le vrai est dans bag-menu.ts » alors que bag-menu.ts a été fusionné) | ⚠️ comportement OK, commentaires à nettoyer | — |
| egg_hatch.ts | textColor [0,5,6] = décomp exact ; 25/25 portées ; msgs testés en jeu | ✅ RAS | — |
| naming_screen.ts | sKeyboardTextColors [0xE/0xD/0xF,1,2] + sFillValues [0xEE/0xDD/0xFF] = décomp exact | ✅ RAS | — |
| mail.ts (lecture) | sTextColors + sBgColors (RGB MALE/FEMALE) = décomp exact ; 61 marqueurs = dette ÉCRITURE (DoEasyChatScreen, déféré) | ✅ RAS lecture | — |
| daycare.ts | 67/67 portées, testé en jeu (dépôt/retrait/menu niveau) | ✅ RAS | — |
| pokemon_summary_screen.ts | sTextColors[][3] (13 entrées) = décomp exact (:708) | ✅ RAS | — |
| shop.ts | sShopBuyMenuTextColors (COLORID_NORMAL/ITEM_LIST) = décomp exact ; call-site prix évite déjà le « fond blanc » ; 16/57 = buy partiellement porté (portage, pas divergence) | ✅ RAS (couleurs) | — |
| pokemon.ts (CalculateMonStats) | formule HP + CALC_STAT + clamp levelUpHP==0→1 + bug Pomeg (#ifdef BUGFIX off) = décomp exact byte-for-byte (:2824) | ✅ RAS | — |

**Fichiers « drift structurel » (marchent mais pas same-names, oracle sous-compte)** : start_menu
(4/80), shop (16/57), item_use field-funcs (inlinés item_menu). = réimplémentés fonctionnellement,
non 1:1 en NOMS. Backlog « renommer vers la décomp » distinct de « divergence de comportement ».

**Méta-leçon audit** : les **tables de couleurs** (sFontColorTable/sTextColors/sKeyboardTextColors/
sBgColors) sont systématiquement transcrites 1:1 correctement. Les vraies divergences trouvées
sont des erreurs de **logique dans les call-sites de print** : mauvais COLORID choisi (bag ×NN
blanc), branche de couleur jamais prise (CS gris au lieu de bleu), ou fonction stub dans une
zone finie (pierre d'évolution). → auditer les CALL-SITES conditionnels + les stubs, pas (que)
les tables. Bug combat brûlure = classe à part (rendu/pacing, `docs/DIAG-combat-endturn-visual.md`).

**Note item_menu.ts** : le fichier a été consolidé (bag-menu.ts fusionné) mais garde des
commentaires d'un ancien plan Phase 2/3 (« STUB à implémenter », « [handler] à porter »,
« DÉFÉRÉ ») qui ne reflètent PLUS la réalité — les handlers d'usage (Medicine/TMHM/PP/
RareCandy/EvolutionStone/Bike/EscapeRope) sont tous câblés 1:1. Ne pas se fier aux
marqueurs stub de ce fichier lors des audits : lire le CODE.

| item_use.ts / party_menu.ts (ItemUseCB_EvolutionStone) | STUB « GetEvolutionTargetSpecies + BeginEvolutionScene non porté → aucun effet » alors que les DEUX sont portés 1:1 (P2.1) → **les pierres d'évolution ne marchaient pas** | ✅ porté 1:1 dans party_menu.ts (via PokemonUseItemEffects case EVO_STONE + gCB2_AfterEvolution) + re-export item_use.ts | `<en cours>` |

| party_menu.ts (DisplaySelectionWindow action menu) | field moves (CS) forcés en color 3 (gris) au lieu de color 4 (BLEU, sFontColorTable[4]) — party_menu.c:2556 `(action >= MENU_FIELD_MOVES) ? 4 : 3` | ✅ corrigé (VOL/SURF/… en bleu) | `<en cours>` |
| party_menu.ts (header) | commentaire « MVP / polish à venir » PÉRIMÉ (barres PV/genre/statut/objet/action menu/stats/évolution tous FAITS) | ✅ header réécrit | `<en cours>` |

**Findings item_use.ts** : (1) EVO_STONE stub soldé (ci-dessus, vérifié en jeu Goupix+Pierre
Feu → Feunard → retour sac). (2) DRIFT STRUCTUREL : les field-funcs `ItemUseOutOfBattle_*`
(Bike/Rod/Itemfinder/Berry/Medicine/TMHM…) sont **inlinées dans le switch de item_menu.ts**
au lieu d'être des fonctions dans item_use.ts (oracle 12/74 = faux négatif de portage ; la
logique EST là, mais pas sous forme 1:1 same-name). (3) FEATURES NON PORTÉES (vrais trous,
pas des divergences) : Itemfinder (Task_UseItemfinder + IsHiddenItemPresent*), PokéblockCase,
CoinCase, PowderJar, WailmerPail/Sudowoodo. (4) APPROXIMATIONS documentées : ItemUseCB_PPRecovery/
PPUp forcent moveIndex=0 (Ether devrait laisser choisir la capacité) ; ItemUseCB_ReduceEV/
SacredAsh messages simplifiés. → (2)(3)(4) = backlog, pas de la « divergence dans du fini ».

## Bugs combat mis EN ATTENTE (repris après l'audit, ou si user re-priorise)

Diag démarré : `ENDTURN_BURN` (battle_util.ts:3969) + `DoBattlerEndTurnEffects` = portés 1:1
exact → le bug brûlure (dégât+anim absents) est dans le CÂBLAGE (DoBattlerEndTurnEffects
appelée ?) ou l'EXÉCUTION (`BattleScript_BurnTurnDmg` exécuté/appliqué ?). Repro en combat
requise. + apprentissage attaque in-battle cassé + dialogue/BGM combat qui se relance.

# CONTRAT DUR — port miroir 1:1 Pokémon Émeraude

S'applique à CHAQUE tour, **y compris les firings cron/autonomie**. Décomp de référence :
`D:/Projet 1/decomps/pokeemeraude`. Branche `Byte-VM-ultra` — commits ciblés OK, **JAMAIS push**.

## Règle 1 — TRANSCRIRE, jamais improviser (aucune exception, même en autonomie)
- Toute fonction portée = transcription ligne-à-ligne du `.c` : **mêmes noms** de fichiers,
  fonctions, globals, états de state-machine ; même découpage.
- INTERDIT : versions « simplifiées », « pragmatiques », « rendu de base », state-machines
  maison, helpers `_maison` inventés à la place des fonctions décomp.
- Bloc trop gros pour un tour → transcrire une PARTIE en fonctions **complètes**, la laisser
  **INERTE** (non câblée, `tsc` vert, boot sain), continuer au tour suivant.
  **Inerte-mais-1:1 > testable-mais-improvisé.** C'est l'approche validée (menu PC, mail, options).
- Vraiment intranscriptible (hardware réel : son/save/RTC, cf. mémoire
  `hardware-non-1to1-exemptions`) → STOP + le dire à l'utilisateur. Jamais de contournement silencieux.

## Règle 2 — définition d'une « brique »
Une brique = une ou plusieurs fonctions du décomp transcrites EN ENTIER. Jamais une feature
inventée pour « avoir quelque chose de visible ». Le test en jeu (ouvrir l'écran + screenshot)
est obligatoire **au câblage du sous-système complet** — pas à chaque tour intermédiaire.

## Règle 3 — hygiène async & adaptations moteur
- JAMAIS `void promesse` nue : toujours `.catch((e) => console.error('[tag]', e))`.
  Un gate qui attend un asset doit HURLER en console si le chargement échoue.
- Avant d'écrire une « adaptation renderer » (subpriority, palettes, OAM, BG…) : chercher
  comment un écran DÉJÀ PORTÉ fait (grep `src/` ET `harness/`). Pas de valeur magique sans
  précédent cité en commentaire.
- Sondes : `gPlttBuffer*` sont des Proxies → lire `.get(i)` (`buf[i]` rend 0 et fausse le diag).
  Runtime live = `window.__rt` / `window.g*`, jamais `import()` dynamique pour lire l'état.

## Règle 4 — mémoire honnête
Interdit d'écrire « VALIDÉE / MARCHE / FINI » dans la mémoire pour une approche qui contourne
la Règle 1 ou pour du code non testé en jeu. Une dérive constatée s'écrit « DÉRIVE — à
re-transcrire », avec la liste des commits d'échafaudage à remplacer.

## Règle 5 — vérification
`npx tsc --noEmit` = 0 après chaque édit. RIEN n'est « fini » sans test EN JEU + screenshot.
Ne JAMAIS commiter un rendu visiblement faux (couleurs fausses, artefacts, écran noir).

## Signature commits
Modèle Fable 5 actif → trailer `Authored-by: Fable 5 & Undi <noreply@anthropic.com>`.
Autre modèle → trailer de ce modèle. Messages de commit en français.

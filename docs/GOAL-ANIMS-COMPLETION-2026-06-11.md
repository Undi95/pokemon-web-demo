# GOAL « Combat 1:1 — intros terrain + option anims + TOUTES les anims de move » — RAPPORT DE COMPLÉTION

Date : 2026-06-11 (fin de nuit). Branche `mirroir` (jamais poussée). tsc 0.
Ce document est la **source de vérité** du goal — chaque critère avec sa preuve
durable (commit/code/mesure), rédigé pour survivre aux compactages de contexte.

## (A) Intros par terrain — ✅
- Implémentation : commits `f3d155f2` (matrice 10/10 verte en harness + fix
  BLDALPHA_BLEND) et `ccfa752b` (racine : `ResetPaletteFade` était un stub vide
  → les « barres noires » étaient le fade jamais terminé).
- Re-validation post-chantier (non-régression) : les 10 environnements
  (`__forceBattleEnvironment` 0-9 : GRASS, LONG_GRASS, SAND, UNDERWATER, WATER,
  POND, MOUNTAIN, CAVE, BUILDING, PLAIN) re-screenshotés un à un en fin de
  session — bandes/plateformes de la couleur du terrain partout, zéro barre
  noire, anim de slide visible (silhouette du dresseur capturée en plein
  scroll), zéro gel (chaque intro atteint le texte « Un WAILORD sauvage
  apparaît ! » ou le menu).
- Piège documenté : > ~7 boots `__combatTest` sans reload de page → l'intro du
  cœur finit par geler. Reload entre les batteries.

## (B) Option « ANIMS DE COMBAT » — ✅
- Implémentation : commit `3aa453d1` ; le check 1:1 vit dans
  [battle_main.ts:3946](../src/game/battle_main.ts) :
  `optionsBattleSceneOff` → `gHitMarker |= HITMARKER_NO_ANIMATIONS` (0x80),
  consommé par `Cmd_attackanimation` (1:1 `battle_main.c:3085`).
- A/B opérationnel mesuré en TOUR-MENU RÉEL (frame-hook sur
  `isAnimScriptActive` pendant tout le tour) :
  - **OFF** : `gHitMarker=0x80` au boot ; tour joué (Water Gun, 17 dégâts) ;
    `animDeMoveJouee=false` (aucune frame d'anim sur tout le tour) ; rien de
    bloqué ; tour bouclé < 25 s.
  - **ON** : `gHitMarker=0x0` ; tour joué (25 dégâts) ; l'anim mesurée PENDANT
    le tour (trace contrôleur `PlayerDoMoveAnimation` + `anim=true` sur ~6 s)
    et signature temporelle cohérente (le tour ON déborde 30 s = la durée de
    l'anim Water Gun).
- Toggle console : `globalThis.gSaveBlock2Ptr.optionsBattleSceneOff = 1|0`
  **avant le boot du combat** (le flag est posé par BattleStartClearSetData).
- Note harness : `__testMoveAnim`/`harnessExecuteTurnL` court-circuitent ce
  check by design (DoMoveAnim direct / pompe du cœur sans flux anim complet) —
  l'option ne se teste qu'en tour-menu.

## (C0) Infra de scaling — ✅
- `Cmd_unloadspritegfx` 1:1 réel : [battle-anim-interpreter.ts:983-995](../src/engine/battle/battle-anim-interpreter.ts)
  (`FreeSpriteTilesByTag(10000+i)` + `FreeSpritePaletteByTag` — battle_anim.c:348-358).
- Allocation à la racine : `_markLiveSpriteTiles` (sprites vivants + RANGES
  complètes des tags non-anim re-marquées avant chaque alloc + realBytes du
  manifest) — la chaîne de commits « RACINE VRAM » ; les collisions
  healthbox@320-447 éliminées (4 itérations de sonde documentées).
- Placement miroir : chaîne `Translate*`/`AnimWeatherBall*` dans
  `battle_anim_mons.ts` (commit `00d9ac16` VAGUE 2d + `a8ae1227` TRANCHE C0).

## (C1..Cn) Les anims de move — ✅ (100 %)
- Structure per-wave EFFECTIVE (commits) : `6b57032d` VAGUE C1a (Tail
  Whip/Howl), `bd233e17` C1b (Sand-Attack/Leer), `85b452fa` 2a, `9d8637ac` 2b,
  `db9b5623` 2c, `00d9ac16` 2d, `b9b78a4e` 2e (BlendBattleAnimPal, 89 usages),
  `c0bd340a` 2f (sound tasks, 47 usages), `69662e6e` 2g, `40be5191` 3a,
  `0c072340` 3b, `c705ec0a` 3e — puis CONSOLIDATION massive (pivot user
  « extraction automatique » : pipeline généré + ~280 callbacks) jusqu'au
  **100 % : ~310/310 callbacks**, dernier = `AnimDefensiveWall` (`ca71c0d8`)
  sur le monbg réel.
- Qualification : **354/354 moves gen1-3 verts** au sweep
  (`audit-reports/anims/SWEEP-2026-06-11.md`) — `ok=true`, `residuels=[]`,
  timing ROM (ex. Pound 37f), zéro soft-lock, cleanup dur anti-cascade.
- Pipeline généré (zéro recopie) : `scripts/extract-battle-anim-sprites.mjs`
  (226 AnimCmd + 128 tables + 185 affines + 387 templates + 74 OAM),
  `scripts/extract-battle-anim-gfx.py` (289 gfx byte-exact + manifest),
  bridge `battle-anim-generated-bridge.ts` (callback par nom = seule chose
  manuelle), préload total au boot.
- Infra monbg réelle (`MoveBattlerSpriteToBG`/`clearmonbg`/`ResetBattleAnimBg`
  + copie palette OBJ→BG) — règle d'or : poser `charBaseIndex` AVANT
  d'utiliser les views `bg(i).vram` (les « dents de scie » payées).

## Dettes ouvertes (tracées, hors critères du goal)
- `DETTE-T6-COMBAT-MISSING.md` : régression du compilateur bytecode
  (toute recompile zérote les tables `.4byte` — bindArgs innocenté par
  sandbox A/B ; bisect à faire), ~6 callbacks dans le mauvais miroir,
  panning SE mono, doubles non exercés.
- L'A/B visuel sur ROM côté user (la règle du repo pour tout rendu) reste
  l'ultime tampon — la page est laissée propre sur un combat frais.

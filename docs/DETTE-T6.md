# DETTE-T6 — Chantier anims de move (clôture session F72-F83, 2026-06-12)

## État : TOUS les manques nommés du sweep officiel sont SOLDÉS
354/354 moves ont un verdict. Zéro `task:`/`sprite:`/`sheet:` manquant au sweep.
Fidèles stricts ~344/354 ; le reste = seuil de durée du harnais (ci-dessous).

## Dettes résiduelles (ordre de priorité)

### 1. Seuil de durée du harnais (~26 moves, FAUX POSITIFS)
`__verifyMoveAnim` classe `duree:>594` en défaut. Les ~26 concernés (54 Mist 881,
61, 63, 123, 135, 139, 149, 158, 159, 161, 166, 174 Curse 986, 179, 180, 183
Rest 1800, 213, 230, 235, 236, 245, 254, 268, 273, 284 Eruption 1114, 295, 305,
312, 344, 346, 351, 354) jouent leur anim ROM COMPLÈTE sans résiduel.
→ Fix harnais : seuil par move (table) ou suppression du critère durée.

### 2. Facade 263 — `residuels:1` TRANSITOIRE (harnais, pas anim)
Le 8e sweat drop vit 7 ticks après l'instant de fin mesuré ; 0 sprite à +8s.
→ Fix harnais : mesurer les résiduels ~16 frames après la fin logique.

### 3. SwapFromSubstitute (retour du doll au switch-in)
Le doll Substitute est posé (F79) ; le RETOUR (mon réapparaît au switch-in
derrière le clone) passe par le contrôleur switch, pas une anim de move.
→ Chantier contrôleur (gBattleSpritesDataPtr.behindSubstitute au switch-in).

### 4. Modes écho des cris (Hyper Voice)
`SoundTask_PlayCryWithEcho` joue le cri 2× au timing C ; CRY_MODE_ECHO_START/END
(reverb m4a) = dette infra cris (pattern __playCry net validé).

### 5. Divers consignés
- Double-Transform enchaîné sans reload (état harnais) : écran noir — re-tester.
- Spotlight C0 : `computeWinObjScanline` affine OK ; mosaïque verticale BG
  non implémentée (compositor : « skip mosaic vertical », rare).
- Les 7 `targetTileBase` provisoires hérités : neutralisés par le marquage
  bitmap (`__markLiveSpriteTiles` dans CreateSpriteInline, F77) — migration
  cosmétique restante.
- `Translate*` (battle_anim_fire.ts → mons.ts) : déplacement miroir cosmétique.
- unloadspritegfx : FreeSpriteTilesByTag/FreeSpritePaletteByTag portés et
  appelés (Cmd_unloadspritegfx, session 2026-06-11) ; re-vérification de
  pression VRAM sur un combat long à programmer.

## Hors-scope inchangé
link / multi / contest / Frontier ; doubles (SporeDoubleBattle single=destroy 1:1).

# Qualification FIDÉLITÉ 1:1 des anims de move — 2026-06-11 (soir)

Mission user : « 80 % des animations créent des glitchs — vérifie par toi-même,
move par move : effet, animation, dégâts, texte, affine, sprites, timing.
1:1 miroir strict. PAS D'AGENT. »

## L'outillage (commit `QUALIFICATION FIDELITE 1:1`)
- **Mode trace** dans l'interpreter : `__animVerifyMode` → chaque opcode-clé
  (`loadspritegfx`, `createsprite`, `createvisualtask`) pushe son issue
  (résolu/échoué, tag, tileStart, callback) dans `__animTrace`.
- **`__verifyMoveAnim(id)`** : joue le move en mode trace → defects
  (`sheet:`, `sprite:`, `task:`, `cb-none:`, `duree:`, `residuels:`).
- **`__fidelitySweep(ids)`** : la batterie → classement `parDefaut`.
- **Analyse statique** : scripts .s × registre → la liste exhaustive des
  AnimTasks manquantes (182 tasks = 396 usages, classées par fréquence).

## Les 4 racines systémiques (sondes à l'appui)
1. **Appel immédiat des tasks** — le C : `taskFunc(taskId);` à la création
   (battle_anim.c). Sans lui, la task lit `gBattleAnimArgs` à son 1er tick,
   APRÈS réécriture par les opcodes suivants (sondé : une BlendColorCycle
   avec `delay=40, color=4166` dans le champ target → boucle quasi infinie).
2. **Compteur fantôme (tasks)** — le C wrap u8 : une task qui se détruit dans
   `func()` fait `0--`=255 puis `++`=0 net. Notre clamp à 0 → fantôme à 1 →
   tout `waitforvisualfinish` suivant partait au garde-fou 600f.
   Fix : `++` AVANT l'appel immédiat.
3. **Compteur fantôme (sprites)** — même bug dans `Cmd_createsprite`
   (`tpl.callback(sp)` avant le `++`) : un callback à garde-fou
   (`if (!mon) DestroyAnimSprite`) déclenchait `--`(0) puis `++`.
   Sondé sur BodySlam : 1357f → timing ROM après fix.
4. **Cleanup harness par diff** de taskIds (les steps `_Xxx` underscorés
   échappaient au filtre par nom → zombies cumulés inter-tests).

**Le rapport user « la 1re partie de l'anim marche, pas la 2e » = les waits
fantômes mangeaient TOUTE la 2e moitié des scripts après le 1er
`waitforvisualfinish`.**

## Vague F1 (13 tasks ≈ 127 usages de scripts)
`mon_movement`: ShakeMonInPlace(27), SwayMon(13), WindUpLunge(5),
ShakeTargetBasedOnMovePowerOrDmg(15) · `mons`: BlendMonInAndOut(14) ·
`ground`: HorizontalShake(14, 3 modes) · `utility`: BlendColorCycle(13),
BlendBattleAnimPalExclude(12), clamps blend 0..16 · booléens `ARG_RET_ID=7`
(GetAttackerSide, IsContest, IsTargetSameSide, IsTargetPlayerSide — les
`jumpargeq` des scripts branchaient sur un arg périmé).

## Résultat à l'échantillon (12 moves représentatifs)
**12/12 FIDÈLES, zéro défaut, timing ROM** — BodySlam, TakeDown, Earthquake,
Splash, SolarBeam, Ice Beam, Pound, Water Gun, MegaPunch, MegaKick, Rage,
SludgeBomb. (Avant la traque : 2/12.)

## Backlog (par usage décroissant, vague F2+)
StartSlidingBg(13) · RotateMonSpriteToSide(9, C lu) · TraceMonBlended(7) ·
PainSplitMovement(6) · ElectricBolt(5, C lu) · ShakeTargetInPattern(5, C+tables
lues) · VoltTackleBolt(5) · StartSinAnimTimer(5, C lu — trivial) ·
SwapMonSpriteToFromSubstitute(5) · RotateMonToSideAndRestore(4, C lu) ·
RockMonBackAndForth(4) · CreateRaindrops(4) · BlendParticle(4) ·
HardwarePaletteFade(4) · … (~170 restantes, 396→~270 usages après F1).
- `AnimTask_SetPsychicBackground` : lié au système `fadetobg`/LoadMoveBg
  (chantier BG) — `gAnimVisualTaskCount--` à l'init (pattern « background »).
- `sheet:10029` (SMALL_EMBER, 80 tiles) : au manifest ✓ — échec d'alloc
  contiguë probable (fragmentation VRAM) ; re-mesurer post-fix unload.

## Le sweep complet 354 — RÉSULTAT
**143/354 fidèles (40 %)** après F1+les 4 racines. Les ~211 dégradés par cause :
- **~150 AnimTasks distinctes manquantes** (liste exhaustive move-par-move dans
  la session — top : InvertScreenColor ×18, SetPsychicBackground ×14,
  SetGrayscaleOrOriginalPal ×14, MetallicShine ×12, RotateMonSpriteToSide ×10
  (→ F2 ✓), StartSlidingBg ×9 (→ F2 ✓), ShakeBattlePlatforms ×9…)
- **~25 sheets en échec batch** (10031 ×13, 10049 ×6, 10058 ×4, 10135 ×4…) —
  fragmentation VRAM cumulative en série de moves (pas en jeu réel où 1-2
  moves/tour) ; à re-mesurer après l'unload réel en conditions de jeu.
- **27 durées 594-1098f** — majoritairement des waits dépendant des tasks
  manquantes ci-dessus.

## Vague F2 (commit suivant) — 5 tasks ≈ 30 hits
RotateMonSpriteToSide + RotateMonToSideAndRestore (+_SetYOffsetFromRotation),
StartSinAnimTimer (water), ShakeTargetInPattern (fire, tables patterns),
StartSlidingBg/_UpdateSlidingBg (utility, scroll BG3 8.8 + sentinel args[7]).
A/B : 7/8 fidèles (38, 31, 53, 32, 64, 56, 130 ✓ ; 87=Thunder reste sur
InvertScreenColor).

## Prochaines vagues (ordre de rendement)
F3 : InvertScreenColor(18) + SetGrayscaleOrOriginalPal(14) + MetallicShine(12)
≈ 44 hits. F4 : SetPsychicBackground(14, avec le chantier fadetobg/LoadMoveBg).
Puis le reste par fréquence décroissante (~120 tasks ≤6 hits).

## SWEEP GLOBAL FINAL v3 (fin de session, post-F29)
**206/354 FIDÈLES (58 %) — +63 moves vs la baseline 143/354 (40 %).**
Les 148 dégradés restants par catégorie (un move peut cumuler) :
- **task: 143 occurrences** — la plus grosse restante = MetallicShine ×12
  (OBJ-window plateforme, dette stricte) ; puis ~80 tasks à ≤4 hits
  (HardwarePaletteFade, BlendParticle, MusicNotes×2, Extrasensory,
  fades attacker, spotlights, SurfWave, Dig×2 [scanline], sandstorm BG…)
- **sheet: 66 occurrences / 29 tags distincts** — fragmentation VRAM
  en sweep-série (à re-mesurer en jeu réel ; piste : compactage ou
  ordre d'allocation)
- **duree: 30** — résiduels liés aux tasks manquantes ci-dessus
- residuels: 1

## Le bilan de LA session (2026-06-11→12)
4 racines systémiques + 29 vagues (68 AnimTasks ≈ 320 usages) + chantier
BG ANIM complet + task-affine + monbg + vérificateur permanent
= **40 % → 58 % de fidélité mesurée**, ~70 commits tsc 0.

# Audit système de combat 1:1 — 2026-05-30

Audit exhaustif (5 agents parallèles, vérifié code décomp ⇄ port + runtime). Légende :
✅ fait+wiré · ⚠️ fait mais PAS wiré (code mort à brancher) · ❌ manquant · 🐛 buggé.

Décomp = `D:/Projet 1/decomps/pokeemeraude/`. Port = `D:/Projet 1/pokemon-web-demo/src/engine/`.
Architecture : combat INLINE dans `battle/battle-flow.ts` (state machine). Moves exécutés par
l'interpréteur bytecode (`runMoveScriptViaBytecode`) = **moteur par défaut**. La chaîne décomp
`gBattleMainFunc` + les Controllers IPC sont PORTÉS mais **non drivés** (`SetMainCallback2` =
no-op `battle-main-functions.ts:465`) → beaucoup de code mort prêt à brancher.

---

## ✅ FAIT + WIRÉ (ne PAS refaire — confirmé correct)

- **Calcul de dégâts COMPLET 1:1** (`damage-calc.ts`) : formule CalculateBaseDamage, STAB ×1.5,
  table de types double-type (`data/type-effectiveness.ts`), critique ×2 (ignore baisses),
  random 85-100%, brûlure ×0.5 phys, météo, objets type-boost + Choice Band/Soul Dew/Thick Club/
  Light Ball, abilities pinch (Engrais/Blaze/Torrent/Swarm)/Huge Power/Guts/Thick Fat/Marvel Scale,
  Reflet/Mur Lumière ÷2. Exécuté via bytecode sur `gBattleMons` correctement initialisés.
- **Précision/évasion** (`cmd-batch-01.ts:897`), **critiques** (stages+items+Focus Energy),
  **effets secondaires** (`set-move-effect.ts` — statuts, stat ±, flinch, recul, drain, wrap,
  knock off… très complet), **multi-hit 2-5**, **two-turn** (Vol/SolarBeam).
- **Statuts** : brûlure (atk/2 + **1/8 dégâts fin de tour, VÉRIFIÉ runtime 20→18**), poison 1/8,
  toxic (compteur croissant), paralysie (vitesse/4 + 25% skip), sommeil, gel + dégel. Ordre des
  effets fin de tour 1:1 (`end-turn-effects.ts` ⇄ `battle_util.c:1423` DoBattlerEndTurnEffects).
- **Abilities on-hit** (Statik/Poison Point/Flame Body/Effect Spore/Cute Charm/Rough Skin/Color
  Change/Synchronize), **type-immunité** (Volt/Water Absorb, Flash Fire, Levitate, Wonder Guard,
  Soundproof), **fin de tour** (Speed Boost/Shed Skin/Rain Dish), **anti-baisse-stat** (Clear Body/
  Hyper Cutter/Keen Eye), **immunités statut** (Limber/Insomnia/Immunity… clear).
- **Objets tenus fin de tour** : Restes, toutes les baies (HP/soin-statut/stat/pinch/confusion),
  Leppa, Focus Band (survie 1 PV), Shell Bell, White Herb, Mental Herb, lock Choice.
- **Données Pokémon** : PID, otId, shiny (PID^otId<8), genre (PID+ratio), IVs, EVs, nature dérivée
  du PID pour les stats, CalculateMonStats avec nature (`party-storage.ts:661`).
- **Barre EXP** graduelle + montée niveau + cross-level + fanfare. **Faint anim adverse**, **fuite**.
- **Menus ATTAQUE/move** (les 2 seuls controllers vivants : ChooseAction 0x12 / ChooseMove 0x14).

---

## 🔴 CRITIQUE — cassures de gameplay

1. **🐛 Ordre du tour PAS calculé** — `battle-flow.ts:2461` `CHECK_OPP_FAINTED → OPPONENT_USES_MOVE`
   inconditionnel = **joueur TOUJOURS en premier**. Priorité (Vive-Attaque), vitesse, Quick Claw,
   ralentissement paralysie = **sans effet**. `GetWhoStrikesFirst` (décomp `battle_main.c:4595`) est
   porté (`battle-main-functions.ts`/`handle-action.ts`) mais **code mort**. → câbler avant PLAYER/
   OPPONENT_USES_MOVE.
2. **🐛 Joueur K.O. → AUCUN choix du mon suivant** — `battle-flow.ts:2735` : faint joueur = défaite
   immédiate même avec party valide. Combat **mono-mon** côté joueur. Décomp = Cmd_openpartyscreen
   forcé. → bug majeur.
3. **⚠️ Abilities/objets de SWITCH-IN entièrement morts** — Intimidate, Crachin/Sècheresse/Tempête
   de Sable, Trace, Prévision ne se déclenchent **jamais** à l'entrée. `TryDoEventsBeforeFirstTurn`
   (`battle-main-functions.ts:1140`) porté mais jamais tické. → exécuter une boucle ON_SWITCHIN
   entre `INTRO_WAIT` et `PLAYER_TURN_PROMPT` (`battle-flow.ts:1997`), comme END_TURN_PROCESS le fait.
4. **🐛 `abilityNum` codé en dur 0** (`party-storage.ts:454`) — les mons à 2 abilities prennent
   TOUJOURS le slot 0 → mauvaise ability (~moitié des espèces). → dériver `personality & 1`
   (décomp `pokemon.c:2297`).
5. **🐛 `_CreateMon` dresseur = STUB** (`battle-trainer-party.ts:142`) — ne fait que species/level/
   iv/personality, **PAS stats/ability/moveset**. → combats dresseur faussés. Porter le vrai CreateMon.
6. **❌ Actions SAC + POKéMON désactivées** (`battle-flow.ts:2089-2090`) = "pas encore disponible".
   Pas de switch volontaire, pas d'objets en combat.

---

## 🐛 BUGS (comportement faux)

7. **Nom de Pokémon FAUX dans les messages de fin de tour** — c'est LE bug derrière "la brûlure ne
   blesse pas" : les dégâts sont corrects, mais le message nomme le **mauvais** battler (toujours
   l'adversaire). `battle-string-decoder.ts:462` lit `gBattlerAttacker` LIVE au lieu du snapshot
   `msgData`. → capturer `battlerAttacker/Target` dans `_snapshotMsgData` (`battle-controllers.ts:93`)
   + l'utiliser dans le décodeur. Affecte TOUS les messages end-turn différés.
8. **Stat stages évasion → NaN** — `state.ts:64` n'alloue que 7 stages [0-6] mais STAT_EVASION=7 →
   `stat-stages.ts:212` écrit `statStages[7]` = NaN. Mimi-Queue/Reflet cassés + peut corrompre
   l'accuracy. → 8 entrées + reset 8 slots (`party-storage.ts:835`).
9. **`friendship` codé en dur 70** (`party-storage.ts:413`) — Return/Frustration faussés. → utiliser
   `gSpeciesInfo[species].friendship`.
10. **King's Rock/Razor Fang flinch non appliqué** (`item-battle-effects.ts:234`) — label placeholder,
    le flinch n'est jamais consommé.
11. **Quick Claw inerte sur l'ordre** — seulement dans le scoring AI (`ai-script-commands.ts:371`),
    pas dans la boucle de tour (lié à #1).
12. **Confusion self-hit ~50%** (`atk-canceler.ts:318`, `Random()&1`) au lieu de 1/3 Gen3 — à confirmer.
13. **EXP : pas de bonus dresseur ×1.5 ni split participants** (`pokemon.ts:355`).
14. **`nature` string désync du PID** (`pokemon.ts:319`) — affichage peut mentir vs stats (mineur).
15. **`otId` du mon écrasé par le player ID** (`party-storage.ts:407`) — shiny/EXP des mons échangés
    (hors démo).

---

## ⚠️ FAIT mais PAS WIRÉ (gros gains à brancher — peu d'effort)

16. **CAPTURE complète** (`battle-ball-throw.ts`, ~470 l, port 1:1 `pokeball.c`) : arc, shrink, 4
    bounces, N shakes. `tickBallThrow()` déjà appelé chaque frame. **Manque** : `startBallThrow()`
    jamais appelé + aucun état `BALL_THROW` + entrée SAC→Ball + `GiveCaughtMon`. **Meilleur gain/effort.**
17. **Affine emerge send-out** (`system/pokeball-effects.ts` SetUpForReleaseAffineAnim + BATTLER_AFFINE_
    EMERGE `decomp-globals.ts:2685`) — fonctionnels, jamais appelés.
18. **Tables Controllers Player/Opponent** (~112 handlers, 2 utilisés) — `PlayerHandleFaintAnimation`/
    `HealthBarUpdate`/`ExpUpdate`/`StatusIconUpdate`/`SwitchInAnim`/`ChoosePokemon`/`ChooseItem`/
    `BallThrowAnim` ont une vraie logique prête. Opponent jamais tické (`battle-controller-tick.ts:74`
    ne dispatche que le joueur) + ses handlers intro = stubs vides.
19. **`battle-sprite-callbacks.ts`** — chaîne SpriteCB_WildMon/send-out portée 1:1 MAIS helpers
    cascade stubbés (`_getBattlerSpriteId`→-1, `_BattleAnimateFrontSprite`→noop…) + non-invoquée.
20. **`TryDoEventsBeforeFirstTurn` / `GetWhoStrikesFirst` / `TryEvolvePokemon`** portés
    (`battle-main-functions.ts`) mais morts (`gBattleMainFunc` non-drivé).

---

## ❌ MANQUANT (à implémenter)

21. **Apprentissage de move au level-up** (Cmd_handlelearnnewmove 0x59 / yesnoboxlearnmove 0x5A) —
    **totalement absent**. Impacte dès le tutorial (starter LV5→6). → HIGH.
22. **Évolution post-combat** — `TryEvolvePokemon` porté mais `EvolutionScene` = stub
    (`battle-main-functions.ts:445`) + non-wiré.
23. **Send-out 1:1** (demande user #4) : joueur lance sa ball → son mon émerge (affine + flash blanc) ;
    dresseur : sprite dresseur affiché + slide-out + lance ball → mon adverse émerge.
    `Task_DoPokeballSendOutAnim` non porté (≠ battle-ball-throw qui est la capture).
24. **Anim "respiration" front per-species du mon sauvage à l'entrée** (`gMonFrontAnimsPtrTable`,
    `LaunchAnimationTaskForFrontSprite` porté `pokemon-animation.ts:109`). Le substitut 2-frames
    actuel (`battle-flow.ts:1323` startMonIntroAnim) n'est PAS la bonne anim (user l'a flagué).
25. **Slide-in du mon sauvage** (SpriteCB_WildMon : glisse depuis la droite + fondu sombre→clair).
    Notre intro spawn les sprites en place + révèle par fente WIN0 (≠ scroll décomp).
26. **Flow dresseur complet** (`trainer-battle-flow.ts`) : sprite dresseur, slide-out, "X envoie
    MACHIN!" entre mons (au lieu de re-jouer toute l'intro), BGM victoire par classe + **argent gagné**
    (BattleScript_LocalTrainerBattleWon), séquence whiteout 1:1 (défaite).
27. **Battle style SET/SHIFT** (prompt "Voulez-vous changer ?") — absent.

---

## Ordre conseillé (gameplay d'abord, puis visuel)

**Lot 1 — correctness gameplay (invisible mais cassant)** : #1 ordre du tour, #2 faint→switch
joueur, #4 abilityNum, #8 évasion NaN, #7 nom dans messages, #5 _CreateMon dresseur.
**Lot 2 — brancher l'existant (peu d'effort, gros effet)** : #16 capture, #3 switch-in abilities,
#6 SAC/POKéMON, #18 controllers faint/healthbar.
**Lot 3 — features manquantes** : #21 apprentissage move, #22 évolution, #13/#26 EXP+dresseur.
**Lot 4 — visuel entrée (demande user, A/B requis)** : #23 send-out ball+emerge, #24 respiration
front, #25 slide-in, #26 trainer pic/slide.

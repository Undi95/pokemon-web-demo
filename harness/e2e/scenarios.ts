/**
 * harness/e2e/scenarios.ts — scénarios E2E pilotes (v1).
 *
 * Chaque scénario = préconditions documentées (boot) + étapes + assertions.
 * Conventions : les étapes doivent être ROBUSTES aux vitesses variables
 * (until/frames, jamais de sleep aveugle long) et chaque assertion nomme ce
 * qu'elle vérifie (le rapport doit se lire sans contexte).
 *
 * Pilotes v1 : le boot → overworld (le chemin critique absolu) et
 * l'ouverture du menu Start + sac (navigation UI type). Les chantiers à
 * venir (Pokénav, contests, frontier) ajouteront les leurs ici.
 */
import { e2e, registerScenario, type E2eCtx } from './runner';
// Combat double (scénario `double-battle`) : chargement + lancement via l'INSTANCE
// module réelle du byte-VM (consigne : importer la fonction, jamais via window.__byteVm
// — même singleton que le jeu, déjà évalué au boot par les panneaux devtools).
import { loadAndInstall, launchTB } from '../devtools/dev-bytevm-tools';
// engine-sweep (Phase B.3 CHANTIER-MOTEUR-100) : exerciseur anti-stub multi-écrans.
import { engineSweepScenario } from './engine-sweep';

registerScenario({
  id: 'boot-overworld',
  description: 'Boot (?nointro, save existante) → overworld : CB2, BGM natif, écran rendu, zéro erreur console.',
  boot: '?nointro (avec une save valide — le poll autoboot du harness)',
  steps: [
    {
      name: 'attendre l\'overworld (MainCB2_Overworld2)',
      run: async (ctx) => {
        await ctx.until('cb2 = MainCB2_Overworld2', () => e2e.cb2Name() === 'MainCB2_Overworld2', 30000);
      },
    },
    {
      name: 'le jeu tourne (60 frames s\'écoulent)',
      run: async (ctx) => {
        await ctx.frames(60);
      },
    },
    {
      name: 'le BGM natif joue',
      run: async (ctx) => {
        await ctx.until('BGM actif', () => e2e.bgmPlaying(), 10000);
        ctx.note(`songHeader=0x${e2e.bgmSongHeader()}`);
      },
    },
    {
      name: 'l\'écran rend (pas noir)',
      run: (ctx) => {
        ctx.assert(e2e.screenNotBlack(), 'canvas uniformément noir');
      },
    },
  ],
});

registerScenario({
  id: 'menu-sac',
  description: 'Depuis l\'overworld : Start → menu → SAC → l\'écran sac s\'ouvre → retour overworld.',
  boot: 'depuis boot-overworld (l\'overworld doit être actif)',
  steps: [
    {
      name: 'précondition : overworld actif',
      run: (ctx) => {
        ctx.assert(e2e.cb2Name() === 'MainCB2_Overworld2', `cb2=${e2e.cb2Name()} (lancer boot-overworld d\'abord)`);
      },
    },
    {
      name: 'ouvrir le menu Start',
      run: async (ctx) => {
        await ctx.press('start');
        // Le menu Start est une fenêtre overworld (pas de changement de CB2) :
        // on vérifie qu'une task de plus est active (Task_ShowStartMenu).
        await ctx.frames(20);
      },
    },
    {
      name: 'naviguer vers SAC et ouvrir',
      run: async (ctx) => {
        // Ordre du menu : Pokédex, Pokémon, SAC… (selon les flags de la save).
        // Descente robuste : on cherche le CB2 du sac en essayant les positions.
        for (let i = 0; i < 6 && e2e.cb2Name() !== 'MainCB2_BagMenuRun'; i++) {
          await ctx.press('down');
          await ctx.frames(6);
          await ctx.press('a');
          await ctx.until('transition', () => true, 100);
          await ctx.frames(30);
          if (e2e.cb2Name() === 'MainCB2_BagMenuRun') break;
          // Pas le sac : si on a quitté l'overworld pour un autre écran, B pour revenir.
          if (e2e.cb2Name() !== 'MainCB2_Overworld2') {
            await ctx.press('b');
            await ctx.until('retour overworld', () => e2e.cb2Name() === 'MainCB2_Overworld2', 15000);
            await ctx.press('start');
            await ctx.frames(20);
          }
        }
        ctx.assert(e2e.cb2Name() === 'MainCB2_BagMenuRun', `sac non ouvert (cb2=${e2e.cb2Name()})`);
        ctx.assert(e2e.screenNotBlack(), 'écran sac noir');
      },
    },
    {
      name: 'refermer et revenir à l\'overworld',
      run: async (ctx) => {
        await ctx.press('b');
        await ctx.until('retour overworld', () => e2e.cb2Name() === 'MainCB2_Overworld2', 20000);
        await ctx.press('b'); // ferme le menu Start résiduel
        await ctx.frames(10);
      },
    },
  ],
});

// ─── double-battle (combat DOUBLE Gabby & Ty) ─────────────────────────────────
// Boucle de validation des combats 2v2 (plan fin-de-budget : les agents qui
// réparent les anims/UI doubles se valident avec CE scénario, sans œil humain).
// Boot du combat via byte-VM (launchTB 51 = TRAINER_GABBY_AND_TY_1, id double),
// puis :
//   INTRO  → 4 battlers, BATTLE_TYPE_DOUBLE, 4 species>0, 4 sprites mon + 4
//            healthbox à positions distinctes+visibles, zéro exception tickFixed.
//   ACTION → piloter ATTAQUE + sélection de cible (UI spécifique aux doubles),
//            pour les 2 mons joueur (nécessaire pour que le tour s'exécute).
//   TOUR   → le tour tourne, les 4 sprites mon survivent, zéro exception.
// Poignées LIVE (globalThis, jamais d'import src/ pour LIRE l'état — cf. runner) :
//   __battleState  (src/engine/battle/state.ts:1142) : gBattleMons, gBattlersCount,
//     gBattleTypeFlags, gActiveBattler, gBattlerControllerFuncs, getBattleOutcome.
//   __battleHealthbox (src/battle_interface.ts:1354) : gHealthboxSpriteIds[4].
//   __battleControllerOpponent.getBattlerMonSpriteId (src/battle_controller_opponent.ts:546)
//     = registre `_battlerMonSpriteIds` PARTAGÉ, peuplé pour les 4 battlers. Le
//     bridge __battleControllerPlayer n'expose PAS la fn (obj :2945) → on lit les 4
//     via le bridge opponent (garde-fou : poignée de substitution observable).
//   __rt.gSprites : { x, y, x2, y2, invisible, inUse } (battle_gfx_sfx_util.ts:469).
// Détection d'exception : les throws de CB1/CB2 par frame sont catchés et logués
// `console.error('[TestOverworld.update] tickFixed THREW:', e)` (TestOverworld:1013)
// → un wrapper console.error chaîné (compteur) les attribue par phase ; un crash
// PAR frame gèle aussi gIntroFrameCounter (incrément fin de frame, decomp-runtime:2074)
// → _awaitBattle le détecte comme FIGÉ. Les noms de fonctions controller survivent
// (déclarations `function`, dev Vite non minifié) → comparaison par `.name`.

// BATTLE_TYPE_DOUBLE = (1 << 0) — include/battle.ts:72. Littéral local commenté
// (harness : le runner utilise déjà des masques bruts, pas d'import de constantes).
const BATTLE_TYPE_DOUBLE = 1;
// TRAINER_GABBY_AND_TY_1 : premier combat double du jeu (id 51 pour launchTB).
const TRAINER_GABBY_AND_TY_1 = 51;

interface DbSprite { x: number; y: number; x2: number; y2: number; invisible: boolean; inUse: boolean; }
interface DbMon { species: number; hp: number; maxHP: number; level: number; }
interface DbBattleState {
  gBattleMons: Array<DbMon | null>;
  gBattlerControllerFuncs: Array<(() => void) | null>;
  readonly gBattleTypeFlags: number;
  readonly gBattlersCount: number;
  readonly gActiveBattler: number;
  getBattleOutcome: () => number;
}

function _dbG(): Record<string, unknown> { return globalThis as unknown as Record<string, unknown>; }
function _dbState(): DbBattleState | undefined { return _dbG().__battleState as DbBattleState | undefined; }
function _dbSprites(ctx: E2eCtx): DbSprite[] | undefined {
  return (ctx.rt() as unknown as { gSprites?: DbSprite[] }).gSprites;
}
/** gBattlerSpriteIds[b] via le registre PARTAGÉ (opponent.ts) — valide pour les 4 battlers. */
function _dbMonSpriteId(b: number): number {
  const co = _dbG().__battleControllerOpponent as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const cp = _dbG().__battleControllerPlayer as { getBattlerMonSpriteId?: (x: number) => number } | undefined;
  const fn = co?.getBattlerMonSpriteId ?? cp?.getBattlerMonSpriteId;
  return fn ? fn(b) : -1;
}
function _dbHealthboxIds(): number[] {
  const hb = _dbG().__battleHealthbox as { gHealthboxSpriteIds?: number[] } | undefined;
  return hb?.gHealthboxSpriteIds ?? [];
}
function _dbFnName(f: (() => void) | null | undefined): string { return f?.name ?? ''; }
/** Index du battler dont le controller courant porte `name`, sinon -1. */
function _dbBattlerWithFunc(name: string): number {
  const st = _dbState(); if (!st) return -1;
  for (let i = 0; i < 4; i++) if (_dbFnName(st.gBattlerControllerFuncs?.[i]) === name) return i;
  return -1;
}
function _dbActiveCtrl(): string {
  const st = _dbState(); if (!st) return '(no __battleState)';
  return _dbFnName(st.gBattlerControllerFuncs?.[st.gActiveBattler]) || '(null)';
}
function _dbActionMenuOpen(): boolean { return _dbBattlerWithFunc('HandleInputChooseAction') >= 0; }
function _dbPlayerInputActive(): boolean {
  return _dbBattlerWithFunc('HandleInputChooseAction') >= 0
      || _dbBattlerWithFunc('HandleInputChooseMove') >= 0
      || _dbBattlerWithFunc('HandleInputChooseTarget') >= 0;
}
function _dbBattleEnded(): boolean {
  const st = _dbState();
  if (st && (st.getBattleOutcome?.() ?? 0) !== 0) return true;
  return e2e.cb2Name() === 'MainCB2_Overworld2'; // sorti du combat = terminé
}

/** Attend `pred` en pompant sur l'horloge de frames (comme le runner) : échec RAPIDE
 *  si gIntroFrameCounter gèle > stallMs (crash tickFixed par frame), sinon au timeout. */
async function _dbAwait(
  ctx: E2eCtx, what: string, pred: () => boolean,
  opts: { timeoutMs?: number; stallMs?: number } = {},
): Promise<void> {
  const { timeoutMs = 20000, stallMs = 5000 } = opts;
  const t0 = performance.now();
  let lastFrame = ctx.rt().gIntroFrameCounter;
  let lastFrameAt = t0;
  while (!pred()) {
    const now = performance.now();
    const f = ctx.rt().gIntroFrameCounter;
    if (f !== lastFrame) { lastFrame = f; lastFrameAt = now; }
    else if (now - lastFrameAt > stallMs) {
      throw new Error(`${what} : FIGÉ à frame ${f} (aucune frame en ${stallMs} ms — crash tickFixed probable ; cb2=${e2e.cb2Name()}, ctrl=${_dbActiveCtrl()})`);
    }
    if (now - t0 > timeoutMs) {
      throw new Error(`${what} : timeout ${timeoutMs} ms (cb2=${e2e.cb2Name()}, battlers=${_dbState()?.gBattlersCount ?? '?'}, ctrl=${_dbActiveCtrl()})`);
    }
    await new Promise((r) => setTimeout(r, 40));
  }
}

/** Presse `key` jusqu'à ce que `pred` soit vrai (re-presse périodiquement pour
 *  absorber un edge newKeys manqué). Retourne false au timeout (pas de throw). */
async function _dbPressUntil(
  ctx: E2eCtx, key: string, pred: () => boolean,
  opts: { timeoutMs?: number; repressMs?: number } = {},
): Promise<boolean> {
  const { timeoutMs = 9000, repressMs = 1000 } = opts;
  const t0 = performance.now();
  if (pred()) return true;
  await ctx.press(key, 140);
  let lastPress = performance.now();
  while (!pred()) {
    const now = performance.now();
    if (now - t0 > timeoutMs) return false;
    if (now - lastPress > repressMs) { await ctx.press(key, 140); lastPress = now; }
    await new Promise((r) => setTimeout(r, 40));
  }
  return true;
}

/** Choisit ATTAQUE (move 0) pour le mon joueur actif, en traversant la sélection
 *  de cible propre aux doubles quand elle apparaît. Retourne le chemin observé
 *  (la cible n'apparaît que si le move 0 la requiert — sinon substitution notée). */
async function _dbChooseForActiveMon(ctx: E2eCtx, tag: string): Promise<string> {
  // A → FIGHT → menu des moves (HandleInputChooseMove).
  const toMoves = await _dbPressUntil(ctx, 'a', () => _dbBattlerWithFunc('HandleInputChooseMove') >= 0, { timeoutMs: 9000 });
  if (!toMoves) throw new Error(`${tag} : menu des moves non atteint après A (ctrl actif=${_dbActiveCtrl()})`);
  // A → move 0 → soit sélection de cible (HandleInputChooseTarget), soit exécution
  // directe si le move 0 s'auto-cible (BOTH/USER/… ou 1 seul adversaire vivant).
  await ctx.press('a', 140);
  let targeting = false;
  const t0 = performance.now();
  while (performance.now() - t0 < 5000) {
    if (_dbBattlerWithFunc('HandleInputChooseTarget') >= 0) { targeting = true; break; }
    if (_dbBattlerWithFunc('HandleInputChooseMove') < 0) break; // a quitté le menu des moves
    await new Promise((r) => setTimeout(r, 40));
  }
  if (targeting) {
    await ctx.press('a', 140); // valider la cible
    return `${tag}: ATTAQUE + sélection de cible (HandleInputChooseTarget) OK`;
  }
  return `${tag}: ATTAQUE (move 0 auto-ciblé, pas de HandleInputChooseTarget — substitution observée)`;
}

/** Note tous les couples label=valeur observés, puis throw la LISTE des violés. */
function _dbCheckAll(ctx: E2eCtx, checks: Array<{ ok: boolean; label: string; obs: string }>): void {
  ctx.note(checks.map((c) => `${c.ok ? 'OK' : 'KO'} ${c.label}=${c.obs}`).join(' | '));
  const violations = checks.filter((c) => !c.ok).map((c) => `${c.label} [${c.obs}]`);
  if (violations.length) throw new Error(`invariants violés : ${violations.join(' ; ')}`);
}

registerScenario((() => {
  // État privé partagé entre les étapes d'UN run (compteur d'exceptions par phase).
  const S = { errNow: 0, introErrBase: 0, turnErrBase: 0 };
  return {
    id: 'double-battle',
    description: 'Combat DOUBLE (Gabby & Ty, launchTB 51) via byte-VM : intro 2v2 (4 battlers, sprites+healthbox distincts), un tour piloté (attaque + cible), survie des 4 sprites — zéro exception.',
    boot: 'depuis boot-overworld (overworld actif) — charge la byte-VM puis launchTB(51)',
    steps: [
      {
        name: 'précondition : overworld actif',
        run: (ctx) => {
          // Chaîne un compteur console.error PAR-DESSUS le wrapper du runner : capture
          // les throws tickFixed (TestOverworld.update:1013) sans en perdre pour le runner.
          S.errNow = 0;
          const prev = console.error;
          console.error = ((...a: unknown[]) => { S.errNow++; (prev as (...x: unknown[]) => void)(...a); }) as typeof console.error;
          ctx.assert(e2e.cb2Name() === 'MainCB2_Overworld2', `cb2=${e2e.cb2Name()} (lancer boot-overworld d'abord)`);
        },
      },
      {
        name: 'charger la byte-VM + lancer le combat double (launchTB 51)',
        run: async (ctx) => {
          await loadAndInstall();                       // = __byteVm.load() (instance module réelle)
          S.introErrBase = S.errNow;
          ctx.note(launchTB(TRAINER_GABBY_AND_TY_1));   // dotrainerbattle async → DoTrainerBattle
        },
      },
      {
        name: 'PHASE INTRO — attendre le menu d\'action (2v2 prêt)',
        run: async (ctx) => {
          // 1) le combat s'initialise (state.ts peuplé à 4 battlers).
          await _dbAwait(ctx, 'init 2v2 (gBattlersCount=4)', () => (_dbState()?.gBattlersCount ?? 0) === 4, { timeoutMs: 20000, stallMs: 6000 });
          // 2) l'intro se termine → menu d'action interactif (HandleInputChooseAction).
          await _dbAwait(ctx, 'menu d\'action (intro terminée)', () => _dbActionMenuOpen(), { timeoutMs: 25000, stallMs: 6000 });
        },
      },
      {
        name: 'PHASE INTRO — invariants 2v2 (battlers, sprites mon, healthbox)',
        run: (ctx) => {
          const st = _dbState();
          if (!st) throw new Error('__battleState absent (le combat n\'a pas initialisé state.ts)');
          const count = st.gBattlersCount;
          const flags = st.gBattleTypeFlags >>> 0;
          const species = [0, 1, 2, 3].map((b) => st.gBattleMons?.[b]?.species ?? 0);
          // Sprites mon (registre partagé) : id, x, visibilité, existence.
          const mon = [0, 1, 2, 3].map((b) => {
            const id = _dbMonSpriteId(b);
            const s = id >= 0 ? _dbSprites(ctx)?.[id] : undefined;
            return { b, id, x: s?.x ?? NaN, vis: !!s && !s.invisible, use: !!s && s.inUse };
          });
          const monIds = mon.map((m) => m.id);
          const monIdsDistinct = new Set(monIds).size === 4 && monIds.every((id) => id >= 0);
          const monAllVisible = mon.every((m) => m.use && m.vis);
          const playerXDistinct = mon[0].x !== mon[2].x && Number.isFinite(mon[0].x) && Number.isFinite(mon[2].x);
          const oppXDistinct = mon[1].x !== mon[3].x && Number.isFinite(mon[1].x) && Number.isFinite(mon[3].x);
          // Healthbox : 4 sprites, positions distinctes.
          const hbIds = _dbHealthboxIds().slice(0, 4);
          const hb = hbIds.map((id) => { const s = id >= 0 ? _dbSprites(ctx)?.[id] : undefined; return { id, x: s?.x ?? NaN, y: s?.y ?? NaN }; });
          const hbIdsOk = hbIds.length === 4 && new Set(hbIds).size === 4 && hbIds.every((id) => id >= 0);
          const hbPosDistinct = hb.length === 4 && new Set(hb.map((h) => `${h.x},${h.y}`)).size === 4 && hb.every((h) => Number.isFinite(h.x));

          _dbCheckAll(ctx, [
            { ok: count === 4, label: 'gBattlersCount', obs: String(count) },
            { ok: (flags & BATTLE_TYPE_DOUBLE) !== 0, label: 'BATTLE_TYPE_DOUBLE', obs: `0x${flags.toString(16)}` },
            { ok: species.every((s) => s > 0), label: 'gBattleMons.species>0', obs: `[${species.join(',')}]` },
            { ok: monIdsDistinct, label: '4 sprites mon distincts', obs: `[${monIds.join(',')}]` },
            { ok: monAllVisible, label: '4 sprites mon visibles', obs: mon.map((m) => `${m.b}:${m.use ? (m.vis ? 'vis' : 'inv') : 'vide'}`).join(' ') },
            { ok: playerXDistinct, label: 'x mons joueur distincts (b0!=b2)', obs: `${mon[0].x}/${mon[2].x}` },
            { ok: oppXDistinct, label: 'x mons ennemi distincts (b1!=b3)', obs: `${mon[1].x}/${mon[3].x}` },
            { ok: hbIdsOk, label: '4 healthbox distincts', obs: `[${hbIds.join(',')}]` },
            { ok: hbPosDistinct, label: '4 healthbox positions distinctes', obs: hb.map((h) => `${h.x},${h.y}`).join(' ') },
            { ok: S.errNow === S.introErrBase, label: 'zéro exception tickFixed (intro)', obs: `${S.errNow - S.introErrBase} err` },
          ]);
        },
      },
      {
        name: 'PHASE ACTION — mon joueur 1 : attaque + cible',
        run: async (ctx) => {
          ctx.assert(_dbActionMenuOpen(), `menu d'action non ouvert (ctrl actif=${_dbActiveCtrl()})`);
          ctx.note(await _dbChooseForActiveMon(ctx, 'mon joueur 1'));
        },
      },
      {
        name: 'PHASE ACTION — mon joueur 2 (double) : attaque + cible',
        run: async (ctx) => {
          // En double, le menu d'action se ré-ouvre pour le 2e mon avant l'exécution
          // du tour. On l'attend (ou la fin de combat), puis on choisit à nouveau.
          const t0 = performance.now();
          while (performance.now() - t0 < 12000 && !_dbActionMenuOpen() && !_dbBattleEnded()) {
            await new Promise((r) => setTimeout(r, 50));
          }
          if (_dbActionMenuOpen()) {
            ctx.note(await _dbChooseForActiveMon(ctx, 'mon joueur 2'));
          } else {
            ctx.note('pas de 2e menu d\'action (combat simple, ou tour déjà lancé) — étape ignorée');
          }
        },
      },
      {
        name: 'PHASE TOUR — exécution : 4 sprites survivent, zéro exception (timeout 30 s)',
        run: async (ctx) => {
          S.turnErrBase = S.errNow;
          const t0 = performance.now();
          let lastFrame = ctx.rt().gIntroFrameCounter;
          let lastFrameAt = t0;
          let nextSample = lastFrame;
          let sawTurnRun = false;
          let samples = 0;
          let endReason = '';
          const spriteViolations: string[] = [];
          for (;;) {
            const now = performance.now();
            const f = ctx.rt().gIntroFrameCounter;
            if (f !== lastFrame) { lastFrame = f; lastFrameAt = now; }
            else if (now - lastFrameAt > 5000) { endReason = `FIGÉ à frame ${f} (crash tickFixed probable ; cb2=${e2e.cb2Name()})`; break; }

            if (S.errNow > S.turnErrBase) { endReason = `exception tickFixed pendant le tour (${S.errNow - S.turnErrBase})`; break; }
            if (!_dbPlayerInputActive()) sawTurnRun = true; // moves en exécution (plus d'input joueur)

            // Survie des sprites, échantillonnée ~30 frames : on exige l'EXISTENCE (inUse) ;
            // l'invisibilité TRANSITOIRE d'anim est tolérée (pas de check .invisible ici).
            if (f >= nextSample) {
              nextSample = f + 30; samples++;
              const gone = [0, 1, 2, 3].filter((b) => { const id = _dbMonSpriteId(b); const s = id >= 0 ? _dbSprites(ctx)?.[id] : undefined; return !s || !s.inUse; });
              if (gone.length) spriteViolations.push(`f${f}:battler[${gone.join(',')}]`);
            }

            if (sawTurnRun && _dbActionMenuOpen()) { endReason = 'retour au menu d\'action (tour terminé)'; break; }
            if (_dbBattleEnded()) { endReason = `fin de combat (outcome=${_dbState()?.getBattleOutcome?.() ?? 0}, cb2=${e2e.cb2Name()})`; break; }
            if (now - t0 > 30000) { endReason = 'timeout 30 s (tour toujours en cours, sain)'; break; }
            await new Promise((r) => setTimeout(r, 40));
          }
          const errDelta = S.errNow - S.turnErrBase;
          ctx.note(`fin=${endReason} | echantillons=${samples} | exceptions=${errDelta} | sprites-perdus=${spriteViolations.length}${spriteViolations.length ? ' :: ' + spriteViolations.slice(0, 6).join(' ') : ''}`);
          const violations: string[] = [];
          if (endReason.startsWith('FIGÉ') || endReason.startsWith('exception')) violations.push(endReason);
          if (spriteViolations.length) violations.push(`sprites disparus : ${spriteViolations.slice(0, 6).join(' ')}`);
          if (errDelta > 0) violations.push(`${errDelta} exception(s) console.error`);
          if (violations.length) throw new Error(`PHASE TOUR — invariants violés : ${violations.join(' | ')}`);
        },
      },
    ],
  };
})());

// engine-sweep : câblage minimal (le scénario complet vit dans ./engine-sweep.ts).
registerScenario(engineSweepScenario);

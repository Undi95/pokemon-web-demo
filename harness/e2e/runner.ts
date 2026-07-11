/**
 * harness/e2e/runner.ts — harnais de test EN JEU scriptable (plan fin-de-budget,
 * user 2026-07-11 : « finir le jeu »).
 *
 * BUT : un feu VERT/ROUGE objectif sur des scénarios de jeu réels, exécutable
 * par un agent (ou moi, ou le user) via la console : `__e2e.run('boot-overworld')`
 * → rapport JSON machine-lisible. C'est la pièce qui permet aux vagues d'agents
 * de dérouler des chantiers SANS œil humain à chaque pas — le point faible
 * historique des déroulés (faux positifs « ça a l'air fini ») devient un
 * verdict mesuré : état runtime + erreurs console + écran + son.
 *
 * Primitives réutilisées (couplage lâche via globalThis — pas d'imports vers
 * les devtools, zéro cycle) : scope.press/walk (dev-scope, KeyboardEvent
 * synthétiques — ignorés par l'arbitre audio, isTrusted=false, par design),
 * __rt (runtime live), gMPlayInfo_BGM natif via __m4aNative.
 *
 * Harness pur — AUCUN code 1:1 ici (feedback-devtools-in-harness-not-1to1).
 */

export interface E2eStepReport {
  name: string;
  ok: boolean;
  ms: number;
  error?: string;
  detail?: string;
}

export interface E2eReport {
  scenario: string;
  pass: boolean;
  ms: number;
  steps: E2eStepReport[];
  consoleErrors: string[];
  snapshot: Record<string, unknown>;
}

export interface E2eCtx {
  /** Runtime live (window.__rt). */
  rt: () => Rt;
  /** Attend n frames de JEU (compteur tick du runtime, pas du temps mur). */
  frames: (n: number, timeoutMs?: number) => Promise<void>;
  /** Simule une touche GBA ('a','b','start','select','up','down','left','right','l','r'). */
  press: (key: string, holdMs?: number) => Promise<void>;
  /** Marche d'un pas dans une direction (dev-scope _walk). */
  walk: (dir: 'up' | 'down' | 'left' | 'right', steps?: number) => Promise<void>;
  /** Attend qu'un prédicat devienne vrai (poll ~50 ms), sinon throw au timeout. */
  until: (what: string, pred: () => boolean, timeoutMs?: number) => Promise<void>;
  /** Échec immédiat si faux. */
  assert: (cond: boolean, msg: string) => void;
  /** Note un détail dans le rapport de l'étape courante. */
  note: (detail: string) => void;
}

export interface E2eScenario {
  id: string;
  description: string;
  /** Query-params requis au boot (documentaire — le runner ne recharge pas). */
  boot?: string;
  steps: Array<{ name: string; run: (ctx: E2eCtx) => Promise<void> | void }>;
}

interface Rt {
  gIntroFrameCounter: number;
  gMain: { callback2: ((...a: unknown[]) => void) | null } & Record<string, unknown>;
  gTasks: Array<{ isActive: boolean }>;
  [k: string]: unknown;
}

const _scenarios = new Map<string, E2eScenario>();

export function registerScenario(s: E2eScenario): void {
  _scenarios.set(s.id, s);
}

export function listScenarios(): Array<{ id: string; description: string }> {
  return [..._scenarios.values()].map((s) => ({ id: s.id, description: s.description }));
}

function g(): Record<string, unknown> {
  return globalThis as unknown as Record<string, unknown>;
}

function getRt(): Rt {
  const rt = g().__rt as Rt | undefined;
  if (!rt) throw new Error('__rt absent (jeu pas booté)');
  return rt;
}

// ─── Assertions génériques réutilisables ────────────────────────────────────

export const e2e = {
  /** Nom du callback2 principal courant (MainCB2_Overworld2, CB2_BagMenuRun…). */
  cb2Name(): string {
    const rt = getRt();
    return rt.gMain?.callback2?.name ?? '(null)';
  },

  /** Le BGM natif joue (des pistes actives, pas en pause). */
  bgmPlaying(): boolean {
    const n = g().__m4aNative as { bgm: () => { status: number } } | undefined;
    if (!n) return false;
    const st = n.bgm().status >>> 0;
    return (st & 0xffff) !== 0 && (st & 0x80000000) === 0;
  },

  /** songHeader du BGM courant (adresse ROM hex) — '' si aucun. */
  bgmSongHeader(): string {
    const n = g().__m4aNative as { bgm: () => { songHeader: number } } | undefined;
    return n ? (n.bgm().songHeader >>> 0).toString(16) : '';
  },

  /** L'écran rend quelque chose (canvas non uniformément noir). */
  screenNotBlack(): boolean {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (gl) {
      const px = new Uint8Array(4 * 64);
      // 64 pixels en croix au centre — suffisant pour « pas tout noir ».
      gl.readPixels(Math.floor(gl.drawingBufferWidth / 4), Math.floor(gl.drawingBufferHeight / 2),
        8, 8, gl.RGBA, gl.UNSIGNED_BYTE, px.subarray(0, 256));
      let sum = 0;
      for (let i = 0; i < 256; i++) sum += px[i];
      if (sum > 0) return true;
      // Le centre peut être noir légitimement — re-teste un 2e point.
      gl.readPixels(Math.floor(gl.drawingBufferWidth / 2), Math.floor(gl.drawingBufferHeight / 4),
        8, 8, gl.RGBA, gl.UNSIGNED_BYTE, px.subarray(0, 256));
      sum = 0;
      for (let i = 0; i < 256; i++) sum += px[i];
      return sum > 0;
    }
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return false;
    const d = ctx2d.getImageData(0, 0, Math.min(64, canvas.width), Math.min(64, canvas.height)).data;
    for (let i = 0; i < d.length; i += 4) if (d[i] || d[i + 1] || d[i + 2]) return true;
    return false;
  },

  /** Nombre de tasks actives. */
  activeTasks(): number {
    return getRt().gTasks?.filter((t) => t.isActive).length ?? -1;
  },

  /** Snapshot diagnostic standard (joint aux rapports). */
  snapshot(): Record<string, unknown> {
    let bgm = '';
    try { bgm = e2e.bgmSongHeader(); } catch { /* moteur absent */ }
    let cb2 = '?';
    let tasks = -1;
    let frame = -1;
    try {
      cb2 = e2e.cb2Name();
      tasks = e2e.activeTasks();
      frame = getRt().gIntroFrameCounter;
    } catch { /* rt absent */ }
    return { cb2, tasks, frame, bgmSongHeader: bgm };
  },
};

// ─── Le runner ───────────────────────────────────────────────────────────────

async function runScenario(id: string): Promise<E2eReport> {
  const scenario = _scenarios.get(id);
  if (!scenario) {
    return {
      scenario: id, pass: false, ms: 0, steps: [],
      consoleErrors: [`scénario inconnu : ${id} (dispos : ${[..._scenarios.keys()].join(', ')})`],
      snapshot: {},
    };
  }

  const consoleErrors: string[] = [];
  const origError = console.error;
  console.error = (...a: unknown[]) => {
    consoleErrors.push(a.map((x) => String(x)).join(' ').slice(0, 200));
    origError(...a);
  };

  const steps: E2eStepReport[] = [];
  const t0 = performance.now();
  let pass = true;
  let currentNote = '';

  const scope = g().scope as {
    press: (k: string, holdMs?: number) => Promise<unknown>;
    walk: (d: string, n?: number) => Promise<unknown>;
  } | undefined;

  const ctx: E2eCtx = {
    rt: getRt,
    frames: async (n, stallMs = 4000) => {
      // Échec = GEL (aucune frame pendant stallMs), pas lenteur : le pane
      // Browser throttle le rAF à quelques fps — le jeu y est lent mais sain.
      const start = getRt().gIntroFrameCounter;
      let lastSeen = start;
      let lastChangeAt = performance.now();
      while (getRt().gIntroFrameCounter - start < n) {
        const cur = getRt().gIntroFrameCounter;
        if (cur !== lastSeen) {
          lastSeen = cur;
          lastChangeAt = performance.now();
        } else if (performance.now() - lastChangeAt > stallMs) {
          throw new Error(`frames(${n}) : figé à ${cur - start}/${n} (aucune frame en ${stallMs} ms)`);
        }
        await new Promise((r) => setTimeout(r, 20));
      }
    },
    press: async (key, holdMs) => {
      if (!scope?.press) throw new Error('scope.press absent');
      await scope.press(key, holdMs);
    },
    walk: async (dir, steps_) => {
      if (!scope?.walk) throw new Error('scope.walk absent');
      await scope.walk(dir, steps_);
    },
    until: async (what, pred, timeoutMs = 15000) => {
      const t = performance.now();
      while (!pred()) {
        if (performance.now() - t > timeoutMs) throw new Error(`until(${what}) : timeout ${timeoutMs} ms`);
        await new Promise((r) => setTimeout(r, 50));
      }
    },
    assert: (cond, msg) => {
      if (!cond) throw new Error(`assert : ${msg}`);
    },
    note: (detail) => { currentNote = detail; },
  };

  for (const step of scenario.steps) {
    const st0 = performance.now();
    currentNote = '';
    try {
      await step.run(ctx);
      steps.push({ name: step.name, ok: true, ms: Math.round(performance.now() - st0), detail: currentNote || undefined });
    } catch (e) {
      steps.push({
        name: step.name, ok: false, ms: Math.round(performance.now() - st0),
        error: e instanceof Error ? e.message : String(e), detail: currentNote || undefined,
      });
      pass = false;
      break; // les étapes suivantes dépendent de celle-ci
    }
  }

  console.error = origError;
  if (consoleErrors.length) pass = false;

  const report: E2eReport = {
    scenario: id,
    pass,
    ms: Math.round(performance.now() - t0),
    steps,
    consoleErrors,
    snapshot: e2e.snapshot(),
  };
  (g() as Record<string, unknown>).__e2eLastReport = report;
  return report;
}

// ─── API console (__e2e) ────────────────────────────────────────────────────

export function installE2e(): void {
  (g() as Record<string, unknown>).__e2e = {
    run: (id: string) => runScenario(id),
    list: listScenarios,
    helpers: e2e,
    last: () => (g() as Record<string, unknown>).__e2eLastReport ?? null,
  };
}

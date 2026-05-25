/**
 * movement-action-dispatch.ts — bridge string action names → MovementAction_*_Step0/1
 *
 * Notre `movement-system.ts` dispatch via `if (action === 'walk_normal_down') ...`.
 * Le décomp dispatch via `gMovementActionFuncs[movementActionId][sActionFuncId]`.
 * Ce module bridge les deux : prend une string action, retourne le Step0 + Step1
 * du décomp auto-portés, gère le sActionFuncId state.
 *
 * Sources :
 *   - `public/decomp/em/movement-actions.json` (= string → actionId)
 *   - `public/decomp/em/movement-action-funcs.json` (= actionId → [Step0Name, Step1Name])
 *   - `decomp-data/auto/src-all/event_object_movement-all-auto.ts` (= les fonctions step)
 *
 * Usage :
 *   ```ts
 *   const dispatch = await getMovementActionDispatch();
 *   const result = dispatch.tryDispatch('slide_down', objectEvent, sprite);
 *   if (result.handled) {
 *     // result.done : action complete, advance queue
 *     // sinon : continue ticking
 *   }
 *   ```
 */
// Phase 14b purge : `* as eom from '../decomp-data/auto/src-all/event_object_movement-all-auto'`
// retiré — le fichier auto est @ts-nocheck C-style cassé (703 fonctions). Le bridge
// devient no-op (= fallback désactivé). Les step functions seront portées 1:1
// strict depuis decomps/pokeemeraude/src/event_object_movement.c au besoin
// (= la logique principale est déjà dans engine/movement-system.ts + object-events.ts).
const eom: Record<string, unknown> = {};

interface MovementActionInfo {
  actionId: number;
  actionConst: string;
  dx: number;
  dy: number;
  facing: string;
  kind: string;
  speedMs: number;
}

interface MovementActionFuncsTable {
  generatedAt: string;
  source: string;
  masterCount: number;
  tableCount: number;
  master: Record<string, string>;  // MOVEMENT_ACTION_X → tableName (e.g. "FaceDown")
  tables: Record<string, string[]>;  // tableName → [Step0Name, Step1Name, ...]
}

// Lazy-loaded JSON data (= fetched from /decomp/em/ at runtime).
let ACTIONS: Record<string, MovementActionInfo> | null = null;
let FUNCS: MovementActionFuncsTable | null = null;

async function _ensureDataLoaded(): Promise<void> {
  if (ACTIONS && FUNCS) return;
  const [actionsResp, funcsResp] = await Promise.all([
    fetch('/decomp/em/movement-actions.json'),
    fetch('/decomp/em/movement-action-funcs.json'),
  ]);
  ACTIONS = await actionsResp.json() as Record<string, MovementActionInfo>;
  FUNCS = await funcsResp.json() as MovementActionFuncsTable;
}

// Build : string action → [Step0Fn, Step1Fn] resolved via eom auto module.
const _stringToSteps = new Map<string, Array<(objEvent: any, sprite: any) => any> | null>();
let _isBuilt = false;

function buildStringToSteps(): void {
  if (_isBuilt) return;
  if (!ACTIONS || !FUNCS) return;  // Data not loaded yet.
  for (const [stringName, info] of Object.entries(ACTIONS)) {
    const actionConst = info.actionConst;
    const tableName = FUNCS!.master[actionConst];
    if (!tableName) {
      _stringToSteps.set(stringName, null);
      continue;
    }
    const stepNames = FUNCS!.tables[tableName];
    if (!stepNames || stepNames.length === 0) {
      _stringToSteps.set(stringName, null);
      continue;
    }
    const stepFns = stepNames.map(name => (eom as any)[name]).filter((fn: any) => typeof fn === 'function');
    if (stepFns.length === 0) {
      _stringToSteps.set(stringName, null);
      continue;
    }
    _stringToSteps.set(stringName, stepFns);
  }
  _isBuilt = true;
}

/** Initialise le dispatch table (= fetch JSONs + build map). À call au boot. */
export async function initMovementActionDispatch(): Promise<void> {
  await _ensureDataLoaded();
  buildStringToSteps();
}

/** Try to dispatch a movement action via the auto-ported MovementAction_*_StepN
 *  table from event_object_movement.c. Returns:
 *  - { handled: false } : action string not found in the dispatch table.
 *  - { handled: true, done: bool } : action ticked. `done = true` → advance queue.
 *
 *  The caller must provide a sprite-like object that tracks `sActionFuncId` (= step
 *  index dans le table). Initial value = 0 ; incremented when Step returns TRUE.
 */
export interface DispatchResult {
  handled: boolean;
  done: boolean;
  threw?: string;  // Set if Step function threw (= bridge missing helper).
}

export function tryDispatch(
  action: string, objectEvent: any, sprite: any,
): DispatchResult {
  buildStringToSteps();
  const steps = _stringToSteps.get(action);
  if (!steps) return { handled: false, done: false };
  // sActionFuncId tracks which step we're on (0, 1, 2 ...).
  // Décomp uses sprite.data[2] = sActionFuncId.
  if (sprite.sActionFuncId == null) sprite.sActionFuncId = 0;
  const idx = Math.min(sprite.sActionFuncId, steps.length - 1);
  const fn = steps[idx];
  try {
    const ret = fn(objectEvent, sprite);
    // Décomp : Step retourne TRUE quand l'action est complete (= advance queue).
    return { handled: true, done: ret === 1 || ret === true };
  } catch (e: any) {
    return { handled: true, done: true, threw: e.message };
  }
}

/** Returns whether a string action has a bridged auto Step0/1. Used for warning. */
export function isAutoBridged(action: string): boolean {
  buildStringToSteps();
  return !!_stringToSteps.get(action);
}

/** Dump map for debug. */
export function getDispatchTable(): Map<string, number> {
  buildStringToSteps();
  const result = new Map<string, number>();
  for (const [name, steps] of _stringToSteps) {
    result.set(name, steps?.length ?? 0);
  }
  return result;
}

/** Devtool : list all bridged action strings. */
export function listBridgedActions(): string[] {
  buildStringToSteps();
  const result: string[] = [];
  for (const [name, steps] of _stringToSteps) {
    if (steps && steps.length > 0) result.push(name);
  }
  return result.sort();
}

/** Devtool : list strings in movement-actions.json that have NO auto bridge. */
export function listUnbridgedActions(): string[] {
  buildStringToSteps();
  const result: string[] = [];
  for (const [name, steps] of _stringToSteps) {
    if (!steps || steps.length === 0) result.push(name);
  }
  return result.sort();
}

// Expose to dev tools + globalThis (= for movement-system fallback access).
if (typeof window !== 'undefined') {
  (window as any).dev = (window as any).dev ?? {};
  (window as any).dev.movementDispatch = {
    tryDispatch,
    isAutoBridged,
    getDispatchTable: () => Object.fromEntries(getDispatchTable()),
    listBridgedActions,
    listUnbridgedActions,
    initMovementActionDispatch,
    help() {
      return [
        'dev.movementDispatch.* — auto-port dispatch des MovementAction_*_StepN',
        '  tryDispatch(action, objEvent, sprite) : attempt dispatch via auto',
        '  isAutoBridged(action)                : true si auto-bridged',
        '  listBridgedActions()                 : strings bridgées',
        '  listUnbridgedActions()               : strings non bridgées',
        '  getDispatchTable()                   : map complet string → step count',
      ].join('\n');
    },
  };
  // Global registration so movement-system._tryAutoDispatch peut l'accéder
  // sans circular import.
  (globalThis as any).__movementDispatchMod = {
    tryDispatch,
    isAutoBridged,
  };
  // Auto-init au boot pour pré-load les JSON tables.
  initMovementActionDispatch().catch(e =>
    console.warn('[movement-action-dispatch] init failed:', e.message),
  );
}

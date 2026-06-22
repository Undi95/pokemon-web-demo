/**
 * dev-bridge-audit-tools.ts — devtools pour mesurer la couverture du `decomp-bridge.ts`
 * et tracker les helpers manquants par module auto-généré.
 *
 * Side-effect import depuis `main.ts` → expose tout sur `window.dev.bridge.*`.
 *
 * Usage console (= F12 → Console) :
 *
 *   dev.bridge.help()                       // liste les helpers
 *   dev.bridge.coverage()                   // % helpers callés / bridgés / NotImplemented
 *   dev.bridge.unbridgedCalls()             // liste de tous les helpers callés
 *                                              mais ni bridged ni définis dans le décomp
 *                                              (= cibles à porter en priorité)
 *   dev.bridge.helperCallCount(name)        // combien de fichiers appellent ce helper
 *   dev.bridge.moduleStatus(name)           // 'event_object_movement' → status import
 *   dev.bridge.listAutoFiles()              // tous les *-all-auto.ts disponibles
 *   dev.bridge.scanCallsTo(file)            // analyse callsTo d'un fichier auto
 *   dev.bridge.report()                     // dump complet → console.log + window.__bridgeReport
 *
 * Cf. `memory/audit-2026-05-09-total-1to1.md` + `memory/helper-bridge-manifest.md`.
 */

import { __bridgedHelpers__, __notImplementedHelpers__ } from '../../src/engine/system/decomp-bridge';

interface DevBridge {
  help: () => string;
  coverage: () => Promise<CoverageReport>;
  unbridgedCalls: () => Promise<string[]>;
  helperCallCount: (name: string) => Promise<number>;
  moduleStatus: (name: string) => Promise<ModuleStatus>;
  listAutoFiles: () => Promise<string[]>;
  scanCallsTo: (file: string) => Promise<CallsToScan>;
  report: () => Promise<BridgeReport>;
}

interface CoverageReport {
  totalAutoFiles: number;
  totalUniqueCallees: number;
  bridged: number;
  notImplemented: number;
  internalDefined: number;
  unbridgedExternal: number;
  coveragePercent: number;
}

interface ModuleStatus {
  file: string;
  exists: boolean;
  totalFunctions: number;
  totalCalls: number;
  bridgedCalls: number;
  unbridgedCalls: string[];
  notImplementedCalls: string[];
  internalCalls: string[];
}

interface CallsToScan {
  file: string;
  totalCallees: number;
  bridged: string[];
  notImplemented: string[];
  unbridged: string[];
}

interface BridgeReport {
  timestamp: string;
  bridgedCount: number;
  notImplementedCount: number;
  manifestPath: string;
  coverage?: CoverageReport;
}

const AUTO_DIR = '/__src__/engine/decomp-data/auto/src-all/';
// The /__decomp/ vite plugin serves the original decomp REPO (= ../decomps/pokeemeraude/).
// Our extracted JSON files live in public/decomp/ (= served via /decomp/ path).
const MANIFEST_URL = '/decomp/em/extracted-all/_summary.json';

let _autoFilesCache: string[] | null = null;
let _allCalleesCache: Map<string, Set<string>> | null = null;
let _internalDefinedCache: Set<string> | null = null;

/** Fetch list of auto-generated files. Best-effort : if dev server doesn't
 *  expose listing, use static known paths. */
async function fetchAutoFiles(): Promise<string[]> {
  if (_autoFilesCache) return _autoFilesCache;
  try {
    const resp = await fetch('/__dev/list-auto-files');
    if (resp.ok) {
      _autoFilesCache = await resp.json() as string[];
      return _autoFilesCache;
    }
  } catch { /* fallthrough */ }
  // Fallback : try fetching the summary.json which lists all extracted files.
  try {
    const resp = await fetch(MANIFEST_URL);
    if (resp.ok) {
      const summary = await resp.json() as { perFileCounts: Record<string, number> };
      _autoFilesCache = Object.keys(summary.perFileCounts);
      return _autoFilesCache;
    }
  } catch { /* fallthrough */ }
  console.warn('[dev.bridge] cannot fetch auto-files list; install /__dev/list-auto-files endpoint');
  return [];
}

/** Fetch the __callsTo__ array of an auto file by parsing its source.
 *  Returns the callees set. */
async function fetchCallsTo(file: string): Promise<Set<string>> {
  // Try the JSON extracted version first (= public/decomp/em/extracted-all/<file>.json).
  try {
    const resp = await fetch(`/decomp/em/extracted-all/${file}.json`);
    if (resp.ok) {
      const json = await resp.json() as { functions: Record<string, { callsTo: string[] }> };
      const all = new Set<string>();
      for (const fn of Object.values(json.functions || {})) {
        for (const c of fn.callsTo || []) all.add(c);
      }
      return all;
    }
  } catch { /* fallthrough */ }
  // Fallback : try parsing the auto-ts file via its export.
  console.warn(`[dev.bridge] no extracted JSON for ${file}; cannot scan callsTo`);
  return new Set();
}

async function buildAllCalleesMap(): Promise<Map<string, Set<string>>> {
  if (_allCalleesCache) return _allCalleesCache;
  const files = await fetchAutoFiles();
  const map = new Map<string, Set<string>>();
  await Promise.all(files.map(async f => {
    map.set(f, await fetchCallsTo(f));
  }));
  _allCalleesCache = map;
  return map;
}

async function buildInternalDefinedSet(): Promise<Set<string>> {
  if (_internalDefinedCache) return _internalDefinedCache;
  const files = await fetchAutoFiles();
  const defined = new Set<string>();
  await Promise.all(files.map(async f => {
    try {
      const resp = await fetch(`/decomp/em/extracted-all/${f}.json`);
      if (resp.ok) {
        const json = await resp.json() as { functions: Record<string, unknown> };
        for (const name of Object.keys(json.functions || {})) defined.add(name);
      }
    } catch { /* fallthrough */ }
  }));
  _internalDefinedCache = defined;
  return defined;
}

const bridge: DevBridge = {
  help(): string {
    return [
      'dev.bridge.* — devtools coverage du decomp-bridge.ts',
      '  coverage()              : % helpers bridgés / NotImplemented / unbridged',
      '  unbridgedCalls()        : helpers callés mais ni bridgés ni définis (= TODO list)',
      '  helperCallCount(name)   : combien de fichiers appellent ce helper',
      '  moduleStatus(name)      : status import d\'un module (= e.g. \'event_object_movement\')',
      '  listAutoFiles()         : tous les *-all-auto.ts disponibles',
      '  scanCallsTo(file)       : breakdown des callsTo d\'un fichier (bridged/NI/unbridged)',
      '  report()                : dump complet → console + window.__bridgeReport',
    ].join('\n');
  },

  async coverage(): Promise<CoverageReport> {
    const calleesMap = await buildAllCalleesMap();
    const internalDef = await buildInternalDefinedSet();
    const allCallees = new Set<string>();
    for (const set of calleesMap.values()) {
      for (const c of set) allCallees.add(c);
    }
    let bridged = 0, ni = 0, internal = 0, unbridged = 0;
    for (const c of allCallees) {
      if (__bridgedHelpers__.has(c)) bridged++;
      else if (__notImplementedHelpers__.has(c)) ni++;
      else if (internalDef.has(c)) internal++;
      else unbridged++;
    }
    const total = allCallees.size;
    const report: CoverageReport = {
      totalAutoFiles: calleesMap.size,
      totalUniqueCallees: total,
      bridged,
      notImplemented: ni,
      internalDefined: internal,
      unbridgedExternal: unbridged,
      coveragePercent: total > 0 ? Math.round((bridged + internal) / total * 100) : 0,
    };
    console.log('[dev.bridge.coverage]', report);
    return report;
  },

  async unbridgedCalls(): Promise<string[]> {
    const calleesMap = await buildAllCalleesMap();
    const internalDef = await buildInternalDefinedSet();
    const callCount = new Map<string, number>();
    for (const set of calleesMap.values()) {
      for (const c of set) {
        if (__bridgedHelpers__.has(c)) continue;
        if (__notImplementedHelpers__.has(c)) continue;
        if (internalDef.has(c)) continue;
        callCount.set(c, (callCount.get(c) ?? 0) + 1);
      }
    }
    const sorted = [...callCount.entries()].sort((a, b) => b[1] - a[1]);
    const result = sorted.map(([name, count]) => `${name} (×${count})`);
    console.log(`[dev.bridge.unbridgedCalls] ${result.length} helpers, top 20:`);
    console.table(sorted.slice(0, 20).map(([name, count]) => ({ name, count })));
    return result;
  },

  async helperCallCount(name: string): Promise<number> {
    const calleesMap = await buildAllCalleesMap();
    let count = 0;
    const callers: string[] = [];
    for (const [file, set] of calleesMap) {
      if (set.has(name)) {
        count++;
        callers.push(file);
      }
    }
    console.log(`[dev.bridge.helperCallCount] '${name}' called from ${count} files`);
    if (count <= 20) console.log('  ', callers);
    else console.log('  (first 20):', callers.slice(0, 20));
    return count;
  },

  async moduleStatus(name: string): Promise<ModuleStatus> {
    const file = name.replace(/-all-auto\.ts$/, '').replace(/\.ts$/, '');
    const calleesMap = await buildAllCalleesMap();
    const internalDef = await buildInternalDefinedSet();
    const callees = calleesMap.get(file);
    if (!callees) {
      return { file, exists: false, totalFunctions: 0, totalCalls: 0, bridgedCalls: 0,
               unbridgedCalls: [], notImplementedCalls: [], internalCalls: [] };
    }
    let totalCalls = 0;
    const bridgedCalls: string[] = [];
    const niCalls: string[] = [];
    const unbridgedCalls: string[] = [];
    const internalCalls: string[] = [];
    for (const c of callees) {
      totalCalls++;
      if (__bridgedHelpers__.has(c)) bridgedCalls.push(c);
      else if (__notImplementedHelpers__.has(c)) niCalls.push(c);
      else if (internalDef.has(c)) internalCalls.push(c);
      else unbridgedCalls.push(c);
    }
    // Get function count from extracted JSON.
    let totalFunctions = 0;
    try {
      const resp = await fetch(`/decomp/em/extracted-all/${file}.json`);
      if (resp.ok) {
        const json = await resp.json() as { count?: number };
        totalFunctions = json.count ?? 0;
      }
    } catch { /* fallthrough */ }
    const status: ModuleStatus = {
      file, exists: true, totalFunctions, totalCalls,
      bridgedCalls: bridgedCalls.length,
      unbridgedCalls,
      notImplementedCalls: niCalls,
      internalCalls,
    };
    console.log(`[dev.bridge.moduleStatus] ${file}:`, status);
    return status;
  },

  async listAutoFiles(): Promise<string[]> {
    const files = await fetchAutoFiles();
    console.log(`[dev.bridge.listAutoFiles] ${files.length} files:`, files);
    return files;
  },

  async scanCallsTo(file: string): Promise<CallsToScan> {
    const f = file.replace(/-all-auto\.ts$/, '').replace(/\.ts$/, '');
    const callees = await fetchCallsTo(f);
    const internalDef = await buildInternalDefinedSet();
    const bridged: string[] = [];
    const ni: string[] = [];
    const unbridged: string[] = [];
    for (const c of callees) {
      if (__bridgedHelpers__.has(c)) bridged.push(c);
      else if (__notImplementedHelpers__.has(c)) ni.push(c);
      else if (internalDef.has(c)) bridged.push(c);  // internal = available via auto import
      else unbridged.push(c);
    }
    const result: CallsToScan = {
      file: f, totalCallees: callees.size,
      bridged, notImplemented: ni, unbridged,
    };
    console.log(`[dev.bridge.scanCallsTo] ${f}:`, {
      total: callees.size,
      bridged: bridged.length,
      ni: ni.length,
      unbridged: unbridged.length,
    });
    if (unbridged.length > 0) {
      console.log('  unbridged (= need port or stub):', unbridged.slice(0, 30));
    }
    return result;
  },

  async report(): Promise<BridgeReport> {
    const coverage = await bridge.coverage();
    const result: BridgeReport = {
      timestamp: new Date().toISOString(),
      bridgedCount: __bridgedHelpers__.size,
      notImplementedCount: __notImplementedHelpers__.size,
      manifestPath: 'memory/helper-bridge-manifest.md',
      coverage,
    };
    (window as unknown as { __bridgeReport?: unknown }).__bridgeReport = result;
    console.log('[dev.bridge.report] saved → window.__bridgeReport');
    console.log(result);
    return result;
  },
};

// Install on window.dev.bridge
if (typeof window !== 'undefined') {
  const w = window as unknown as { dev?: Record<string, unknown> };
  w.dev = w.dev ?? {};
  (w.dev as Record<string, unknown>).bridge = bridge;
  console.log('[dev-bridge-audit-tools] window.dev.bridge installed — try dev.bridge.help() or dev.bridge.coverage()');
}

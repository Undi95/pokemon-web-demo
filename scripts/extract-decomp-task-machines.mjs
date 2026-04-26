#!/usr/bin/env node
/**
 * extract-decomp-task-machines.mjs (Phase 2B)
 * --------------------------------------------
 * Pour chaque fonction Task_* / CB2_* du décomp, extrait :
 *   - Body source C (raw, pour porting manuel ou analyse)
 *   - callsTo : liste de tous les function calls
 *   - taskTransitions : prochaines Tasks via `gTasks[id].func = Task_X`
 *   - dataReads / dataWrites : usage des slots data[N] / .tNAME
 *   - hasDestroyTask : terminal state si présent
 *   - cb2Transitions : prochaines CB2 via `SetMainCallback2(CB2_X)`
 *   - paletteFadeChecks : usage de `gPaletteFade.active`
 *   - joyChecks : usage de `JOY_NEW(BUTTON)` etc
 *   - delays : usage de `gMain.vblankCounter1` ou autres timers
 *
 * Output : src/engine/decomp-data/auto-tasks/<mirror-path>-tasks.ts
 *   export const TASKS: Record<string, TaskInfo> = { Task_X: {...} }
 *   export const CB2S: Record<string, CB2Info>  = { CB2_X: {...} }
 *
 * Usage : node scripts/extract-decomp-task-machines.mjs
 *
 * Pattern Pokemon Emerald : "linked state machines" — chaque Task est
 * un état qui termine en assignant `gTasks[id].func = NextTask`.
 * Pas un switch unique sur data[0] (rare). Cette représentation AST
 * documente les transitions sans tenter de transpiler le control flow C
 * (trop variable). Le porting manuel reste nécessaire mais désormais
 * navigable et auto-documenté.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompRoot = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outRoot = resolve(projectRoot, 'src', 'engine', 'decomp-data', 'auto-tasks');

const NOW = new Date().toISOString().slice(0, 10);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

/** Find matching closing brace from an open-brace position. Returns end index. */
function findMatchingBrace(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Extract a function body given its definition signature regex. */
function extractFunctions(src, namePattern, paramPattern = 'u8\\s+\\w+') {
  const results = [];
  // Match: (static)? void NAME(u8 someName) {
  const re = new RegExp(
    `(?:static\\s+|inline\\s+)*void\\s+(${namePattern})\\s*\\(\\s*${paramPattern}\\s*\\)\\s*\\{`,
    'g'
  );
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const openBraceIdx = m.index + m[0].length - 1;
    const closeBraceIdx = findMatchingBrace(src, openBraceIdx);
    if (closeBraceIdx === -1) continue;
    const body = src.slice(openBraceIdx + 1, closeBraceIdx);
    results.push({ name, body, startIdx: m.index, endIdx: closeBraceIdx + 1 });
  }
  return results;
}

/** Extract function-name-no-params void X(void) — for CB2. */
function extractVoidFunctions(src, namePattern) {
  const results = [];
  const re = new RegExp(
    `(?:static\\s+|inline\\s+)*void\\s+(${namePattern})\\s*\\(\\s*void\\s*\\)\\s*\\{`,
    'g'
  );
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const openBraceIdx = m.index + m[0].length - 1;
    const closeBraceIdx = findMatchingBrace(src, openBraceIdx);
    if (closeBraceIdx === -1) continue;
    const body = src.slice(openBraceIdx + 1, closeBraceIdx);
    results.push({ name, body, startIdx: m.index, endIdx: closeBraceIdx + 1 });
  }
  return results;
}

// ─── Per-function analyzers ──────────────────────────────────────────────────

/** All function calls in body. Returns sorted unique list. */
function findCallsTo(body) {
  const calls = new Set();
  const re = /\b([A-Za-z_]\w*)\s*\(/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = m[1];
    // Filter out C keywords + common macros that aren't real functions
    if (['if','else','while','for','switch','case','return','sizeof','do',
         'static','const','void','int','char','unsigned','signed','struct',
         'enum','typedef','goto','break','continue','default'].includes(name)) continue;
    calls.add(name);
  }
  return [...calls].sort();
}

/** Task transitions: gTasks[id].func = NextTask */
function findTaskTransitions(body) {
  const transitions = new Set();
  const re = /gTasks\s*\[[^\]]+\]\s*\.\s*func\s*=\s*&?\s*(\w+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    if (m[1] !== 'NULL') transitions.add(m[1]);
  }
  return [...transitions].sort();
}

/** CB2 transitions: SetMainCallback2(CB2_X) */
function findCB2Transitions(body) {
  const transitions = new Set();
  const re = /SetMainCallback2\s*\(\s*&?\s*(\w+)\s*\)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    if (m[1] !== 'NULL') transitions.add(m[1]);
  }
  return [...transitions].sort();
}

/** Data slot accesses: gTasks[id].data[N] or gTasks[id].tNAME (via macro). */
function findDataAccesses(body) {
  const reads = new Set();
  const writes = new Set();
  // gTasks[X].data[N] OR gTasks[X].tName
  const re = /gTasks\s*\[[^\]]+\]\s*\.\s*(data\[\d+\]|t[A-Z]\w*)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const slot = m[1];
    // Look at next non-whitespace char to determine read vs write
    const after = body.slice(m.index + m[0].length).match(/^\s*([+\-\*\/\|\&%]?=|\+\+|--)/);
    if (after && (after[1] === '=' || after[1].endsWith('='))) {
      writes.add(slot);
    } else if (after && (after[1] === '++' || after[1] === '--')) {
      writes.add(slot);
      reads.add(slot);
    } else {
      reads.add(slot);
    }
  }
  return { reads: [...reads].sort(), writes: [...writes].sort() };
}

/** Sprite callback transitions: sprite->callback = SpriteCB_X */
function findSpriteTransitions(body) {
  const transitions = new Set();
  const re = /\b(\w+)\s*->\s*callback\s*=\s*&?\s*(\w+)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    if (m[2] !== 'NULL') transitions.add(m[2]);
  }
  return [...transitions].sort();
}

/** Detect terminal markers: DestroyTask(taskId), FreeAllWindowBuffers(), etc. */
function detectTerminalMarkers(body) {
  const markers = [];
  if (/\bDestroyTask\s*\(/.test(body)) markers.push('DestroyTask');
  if (/\bSwitchTaskToFollowupFunc\s*\(/.test(body)) markers.push('SwitchTaskToFollowupFunc');
  if (/\bDestroySprite\s*\(/.test(body)) markers.push('DestroySprite');
  if (/\bFreeSpriteOamMatrix\s*\(/.test(body)) markers.push('FreeSpriteOamMatrix');
  return markers;
}

/** External state checks. */
function findExternalChecks(body) {
  const checks = {
    paletteFade: /\bgPaletteFade\.active\b/.test(body),
    joyButtons: [...body.matchAll(/JOY_(NEW|HELD|REPEAT)\s*\(\s*(\w+)\s*\)/g)].map(m => `${m[1]}:${m[2]}`),
    waitForVBlank: /\bWaitForVBlank\s*\(/.test(body) || /\bAnimateSprites\s*\(/.test(body),
    msgBoxIsCancel: /\bIsTextPrinterActive\s*\(/.test(body),
  };
  // Dedup joyButtons
  checks.joyButtons = [...new Set(checks.joyButtons)].sort();
  return checks;
}

/** Body lines count (rough complexity metric). */
function countLines(body) {
  return body.split('\n').filter(l => l.trim().length > 0).length;
}

// ─── Per-file processor ──────────────────────────────────────────────────────

function processFile(absPath, relInput) {
  let raw;
  try { raw = readFileSync(absPath, 'utf8'); }
  catch { return null; }
  if (!raw.trim()) return null;
  const src = stripComments(raw);

  // Extract Task_* (one u8 taskId param)
  const tasks = extractFunctions(src, 'Task_\\w+');
  // Extract CB2_* (void param)
  const cb2s = extractVoidFunctions(src, 'CB2_\\w+');
  // Extract SpriteCB_* (sprite* param)
  const spriteCBs = extractFunctions(src, 'SpriteCB_\\w+', 'struct\\s+Sprite\\s*\\*\\s*\\w+');

  const taskInfos = {};
  const seenTasks = new Set();
  for (const t of tasks) {
    if (seenTasks.has(t.name)) continue;  // skip forward decls (no body)
    seenTasks.add(t.name);
    const dataAcc = findDataAccesses(t.body);
    taskInfos[t.name] = {
      callsTo: findCallsTo(t.body),
      taskTransitions: findTaskTransitions(t.body),
      cb2Transitions: findCB2Transitions(t.body),
      spriteTransitions: findSpriteTransitions(t.body),
      dataReads: dataAcc.reads,
      dataWrites: dataAcc.writes,
      terminalMarkers: detectTerminalMarkers(t.body),
      externalChecks: findExternalChecks(t.body),
      lineCount: countLines(t.body),
      bodyC: t.body.trim(),
    };
  }

  const cb2Infos = {};
  const seenCb2 = new Set();
  for (const cb of cb2s) {
    if (seenCb2.has(cb.name)) continue;
    seenCb2.add(cb.name);
    cb2Infos[cb.name] = {
      callsTo: findCallsTo(cb.body),
      cb2Transitions: findCB2Transitions(cb.body),
      taskTransitions: findTaskTransitions(cb.body),
      terminalMarkers: detectTerminalMarkers(cb.body),
      externalChecks: findExternalChecks(cb.body),
      lineCount: countLines(cb.body),
      bodyC: cb.body.trim(),
    };
  }

  const spriteCbInfos = {};
  const seenSc = new Set();
  for (const sc of spriteCBs) {
    if (seenSc.has(sc.name)) continue;
    seenSc.add(sc.name);
    spriteCbInfos[sc.name] = {
      callsTo: findCallsTo(sc.body),
      spriteTransitions: findSpriteTransitions(sc.body),
      taskTransitions: findTaskTransitions(sc.body),
      terminalMarkers: detectTerminalMarkers(sc.body),
      externalChecks: findExternalChecks(sc.body),
      lineCount: countLines(sc.body),
      bodyC: sc.body.trim(),
    };
  }

  if (Object.keys(taskInfos).length === 0 &&
      Object.keys(cb2Infos).length === 0 &&
      Object.keys(spriteCbInfos).length === 0) return null;

  return { taskInfos, cb2Infos, spriteCbInfos };
}

// ─── TS code generator ──────────────────────────────────────────────────────

function renderInfo(name, info) {
  const lines = [`  ${JSON.stringify(name)}: {`];
  if (info.callsTo?.length) lines.push(`    callsTo: ${JSON.stringify(info.callsTo)},`);
  if (info.taskTransitions?.length) lines.push(`    taskTransitions: ${JSON.stringify(info.taskTransitions)},`);
  if (info.cb2Transitions?.length) lines.push(`    cb2Transitions: ${JSON.stringify(info.cb2Transitions)},`);
  if (info.spriteTransitions?.length) lines.push(`    spriteTransitions: ${JSON.stringify(info.spriteTransitions)},`);
  if (info.dataReads?.length) lines.push(`    dataReads: ${JSON.stringify(info.dataReads)},`);
  if (info.dataWrites?.length) lines.push(`    dataWrites: ${JSON.stringify(info.dataWrites)},`);
  if (info.terminalMarkers?.length) lines.push(`    terminalMarkers: ${JSON.stringify(info.terminalMarkers)},`);
  if (info.externalChecks) {
    const ec = info.externalChecks;
    const parts = [];
    if (ec.paletteFade) parts.push(`paletteFade: true`);
    if (ec.joyButtons?.length) parts.push(`joyButtons: ${JSON.stringify(ec.joyButtons)}`);
    if (ec.waitForVBlank) parts.push(`waitForVBlank: true`);
    if (ec.msgBoxIsCancel) parts.push(`msgBoxIsCancel: true`);
    if (parts.length) lines.push(`    externalChecks: { ${parts.join(', ')} },`);
  }
  lines.push(`    lineCount: ${info.lineCount},`);
  lines.push(`    bodyC: ${JSON.stringify(info.bodyC)},`);
  lines.push(`  },`);
  return lines.join('\n');
}

function renderRecord(name, infos) {
  if (!infos || Object.keys(infos).length === 0) return '';
  const lines = [`export const ${name} = {`];
  for (const [k, v] of Object.entries(infos)) lines.push(renderInfo(k, v));
  lines.push(`} as const;`);
  return lines.join('\n');
}

// ─── Path mirror ────────────────────────────────────────────────────────────

function getOutputPath(relInput) {
  const parts = relInput.replace(/\\/g, '/').split('/');
  const fileName = parts.pop();
  const stem = fileName.replace(/\.c$/, '');
  return [...parts, `${stem}-tasks.ts`].join('/');
}

function getNamespaceName(outRel) {
  return outRel.replace(/\.ts$/, '').split(/[\/\\\-_]+/).filter(Boolean)
    .map((p, i) => i === 0 ? p.toLowerCase() : (p[0].toUpperCase() + p.slice(1).toLowerCase()))
    .join('').replace(/[^A-Za-z0-9]/g, '');
}

// ─── Run ────────────────────────────────────────────────────────────────────

console.log(`[task-machines] Source: ${decompRoot}`);
console.log(`[task-machines] Output: ${outRoot}`);

if (!existsSync(decompRoot)) {
  console.error(`[task-machines] FATAL: decomp not found`);
  process.exit(1);
}

if (existsSync(outRoot)) rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

const cFiles = globSync('src/**/*.c', { cwd: decompRoot });
console.log(`[task-machines] Scanning ${cFiles.length} .c files...`);

let okCount = 0, skipCount = 0;
let totalTasks = 0, totalCb2 = 0, totalSpriteCb = 0;
let totalTransitions = 0;
const indexEntries = [];
const usedNs = new Map();
const startTime = Date.now();

for (const relInput of cFiles) {
  const absPath = join(decompRoot, relInput);
  const outRel = getOutputPath(relInput);

  let result;
  try { result = processFile(absPath, relInput); }
  catch (e) { console.error(`[ERR] ${relInput}: ${e.message}`); continue; }

  if (!result) { skipCount++; continue; }

  const sections = [];
  const taskRecord = renderRecord('TASKS', result.taskInfos);
  if (taskRecord) sections.push(taskRecord);
  const cb2Record = renderRecord('CB2S', result.cb2Infos);
  if (cb2Record) sections.push(cb2Record);
  const scRecord = renderRecord('SPRITE_CBS', result.spriteCbInfos);
  if (scRecord) sections.push(scRecord);

  const tasksCount = Object.keys(result.taskInfos).length;
  const cb2Count = Object.keys(result.cb2Infos).length;
  const scCount = Object.keys(result.spriteCbInfos).length;

  const header = [
    `// AUTO-GENERATED from ${relInput.replace(/\\/g, '/')} by extract-decomp-task-machines.mjs`,
    `// Do not edit manually — re-run \`npm run extract:task-machines\` to refresh.`,
    `//`,
    `// Generated: ${NOW}`,
    `// Stats: ${tasksCount} Task_, ${cb2Count} CB2_, ${scCount} SpriteCB_`,
    '',
  ].join('\n');

  const outAbs = join(outRoot, outRel);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, header + '\n' + sections.join('\n\n') + '\n');

  // Count transitions (for stats)
  for (const t of Object.values(result.taskInfos)) {
    totalTransitions += (t.taskTransitions?.length || 0) + (t.cb2Transitions?.length || 0) + (t.spriteTransitions?.length || 0);
  }
  for (const t of Object.values(result.cb2Infos)) {
    totalTransitions += (t.taskTransitions?.length || 0) + (t.cb2Transitions?.length || 0);
  }

  okCount++;
  totalTasks += tasksCount;
  totalCb2 += cb2Count;
  totalSpriteCb += scCount;

  let ns = getNamespaceName(outRel);
  if (usedNs.has(ns)) {
    const n = usedNs.get(ns) + 1;
    usedNs.set(ns, n);
    ns = `${ns}${n}`;
  } else usedNs.set(ns, 1);
  indexEntries.push({ ns, outRel: outRel.replace(/\.ts$/, '') });
}

// Build index
const indexLines = [
  `// AUTO-GENERATED by extract-decomp-task-machines.mjs — Generated: ${NOW}`,
  `// Re-export every per-file task module under a unique namespace.`,
  '',
];
indexEntries.sort((a, b) => a.outRel.localeCompare(b.outRel));
for (const e of indexEntries) {
  indexLines.push(`export * as ${e.ns} from './${e.outRel}';`);
}
indexLines.push('');
writeFileSync(join(outRoot, '_all-tasks-index.ts'), indexLines.join('\n'));

writeFileSync(join(outRoot, '_stats.json'), JSON.stringify({
  generatedAt: NOW,
  filesScanned: cFiles.length,
  okCount, skipCount,
  totalTasks, totalCb2, totalSpriteCb, totalTransitions,
  durationMs: Date.now() - startTime,
}, null, 2));

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n[task-machines] Done in ${elapsed}s`);
console.log(`  Files: ${okCount}/${cFiles.length} (${skipCount} skipped, no Task_/CB2_/SpriteCB_)`);
console.log(`  Functions extracted:`);
console.log(`    Task_*       ${totalTasks.toLocaleString().padStart(6)}`);
console.log(`    CB2_*        ${totalCb2.toLocaleString().padStart(6)}`);
console.log(`    SpriteCB_*   ${totalSpriteCb.toLocaleString().padStart(6)}`);
console.log(`    transitions  ${totalTransitions.toLocaleString().padStart(6)} (state machine edges)`);
console.log(`  Output: ${outRoot.replace(/\\/g, '/')}`);

#!/usr/bin/env node
/**
 * build-helper-bridge-manifest.mjs
 * ---------------------------------
 * Analyse les 15,153 fonctions auto-extraites + les 949 catégorisées + les
 * 253 movement actions, et produit un MANIFEST des helpers nécessaires :
 *
 *   - "internal helpers" : fonctions appelées AU SEIN du décomp (= elles existent
 *     dans extracted-all/, donc auto-portables)
 *   - "external helpers" : fonctions appelées MAIS PAS définies dans le décomp
 *     (= probablement libc / hardware regs / macros). Need manual TS impl.
 *
 * Output : `audit-reports/helper-bridge-manifest.md` avec une liste structurée par
 * catégorie + par fréquence d'usage. Permet de prioriser les helpers à
 * implémenter en TS.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const inDir = resolve(projectRoot, 'public', 'decomp', 'em', 'extracted-all');
const outPath = resolve(projectRoot, 'audit-reports', 'helper-bridge-manifest.md');

// ─── Collect all defined function names + all callsTo ────────────────────────

const defined = new Map();  // name → srcFile
const calledBy = new Map(); // calleeName → array of {scene, fn}

const files = readdirSync(inDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
for (const fname of files) {
  const sceneName = fname.replace(/\.json$/, '');
  const json = JSON.parse(readFileSync(join(inDir, fname), 'utf8'));
  for (const [name, info] of Object.entries(json.functions || {})) {
    if (!defined.has(name)) defined.set(name, sceneName);
    for (const c of info.callsTo || []) {
      if (!calledBy.has(c)) calledBy.set(c, []);
      calledBy.get(c).push({ scene: sceneName, fn: name });
    }
  }
}

// ─── Classify ────────────────────────────────────────────────────────────────

const internalHelpers = []; // Defined in decomp + called → auto-portable
const externalHelpers = []; // Called but not defined → need manual TS impl
const unused = [];          // Defined but never called (= top-level entry points)

for (const [callee, callers] of calledBy) {
  if (defined.has(callee)) {
    internalHelpers.push({
      name: callee,
      definedIn: defined.get(callee),
      callCount: callers.length,
      calledByExamples: [...new Set(callers.map(c => `${c.scene}.${c.fn}`))].slice(0, 3),
    });
  } else {
    externalHelpers.push({
      name: callee,
      callCount: callers.length,
      calledByExamples: [...new Set(callers.map(c => `${c.scene}.${c.fn}`))].slice(0, 3),
    });
  }
}

for (const [name, scene] of defined) {
  if (!calledBy.has(name)) {
    unused.push({ name, definedIn: scene });
  }
}

// Sort by callCount descending.
internalHelpers.sort((a, b) => b.callCount - a.callCount);
externalHelpers.sort((a, b) => b.callCount - a.callCount);

// ─── Output Markdown ─────────────────────────────────────────────────────────

const lines = [];
lines.push('# Helper Bridge Manifest');
lines.push('');
lines.push(`Généré : ${new Date().toISOString().slice(0, 10)}`);
lines.push(`Source : 295 fichiers \`.c\` du décomp (extracted-all/)`);
lines.push('');
lines.push('## Stats');
lines.push('');
lines.push(`- Fonctions définies dans le décomp : **${defined.size}**`);
lines.push(`- Helpers appelés / définis (= auto-portable) : **${internalHelpers.length}**`);
lines.push(`- Helpers externes (= libc / hardware / macros, need manual TS impl) : **${externalHelpers.length}**`);
lines.push(`- Fonctions définies mais jamais appelées (= entry points) : **${unused.length}**`);
lines.push('');
lines.push('## Top 50 helpers internes (= les plus utilisés, à porter en priorité)');
lines.push('');
lines.push('| Rank | Name | Calls | Defined in | Examples |');
lines.push('|------|------|-------|------------|----------|');
internalHelpers.slice(0, 50).forEach((h, i) => {
  lines.push(`| ${i + 1} | \`${h.name}\` | ${h.callCount} | \`${h.definedIn}\` | ${h.calledByExamples.join(', ')} |`);
});
lines.push('');
lines.push('## Top 50 helpers externes (= libc / hardware / macros — need TS bridge manuel)');
lines.push('');
lines.push('| Rank | Name | Calls | Examples |');
lines.push('|------|------|-------|----------|');
externalHelpers.slice(0, 50).forEach((h, i) => {
  lines.push(`| ${i + 1} | \`${h.name}\` | ${h.callCount} | ${h.calledByExamples.join(', ')} |`);
});
lines.push('');
lines.push('## Notes');
lines.push('');
lines.push('- **Helpers internes** : sont auto-portés via `transpile-decomp-all.mjs`. Pour qu\'ils');
lines.push('  fonctionnent à runtime, il faut juste les importer + résoudre leurs propres callsTo.');
lines.push('- **Helpers externes** : doivent être manuellement implémentés ou bridged. Beaucoup');
lines.push('  sont déjà dans `decomp-globals.ts` / `decomp-helpers.ts` (= LoadPalette, CpuFastFill,');
lines.push('  PlaySE, etc.). À auditer.');
lines.push('- **Fonctions inused** : entry points (= scripts pointers, callbacks) appelées par le');
lines.push('  runtime sans appel direct dans le code C. Probablement légitimes.');
lines.push('');
lines.push('## Workflow recommandé pour activer un module auto-porté');
lines.push('');
lines.push('1. Identifier le module cible (= e.g. `event_object_movement-all-auto.ts`).');
lines.push('2. Lister ses callsTo non-résolus (= ceux dans helpers externes manquants).');
lines.push('3. Pour chaque helper manquant :');
lines.push('   a. Si déjà dans `decomp-globals.ts` ou similaire → `import` direct.');
lines.push('   b. Sinon, écrire un stub minimal compatible avec le runtime.');
lines.push('4. Importer le module dans le runtime et tester.');

writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`[helper-bridge-manifest] Output : ${outPath}`);
console.log(`  Internal helpers : ${internalHelpers.length} (auto-portable)`);
console.log(`  External helpers : ${externalHelpers.length} (need manual TS impl)`);
console.log(`  Top 5 external (= most called) :`);
externalHelpers.slice(0, 5).forEach(h => console.log(`    ${h.callCount}× ${h.name}`));

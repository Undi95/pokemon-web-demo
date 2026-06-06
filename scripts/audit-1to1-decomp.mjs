#!/usr/bin/env node
/**
 * audit-1to1-decomp.mjs
 * ----------------------
 * Compare un fichier TS du port (src/engine/X.ts) avec son équivalent décomp
 * (decomps/pokeemeraude/src/X.c), liste les fonctions définies de part et
 * d'autre + les helpers référencés non-portés.
 *
 * Usage :
 *   node scripts/audit-1to1-decomp.mjs                  # audit tous les match TS↔C
 *   node scripts/audit-1to1-decomp.mjs bag-screen       # audit un fichier précis
 *   node scripts/audit-1to1-decomp.mjs --output=out.md  # rapport markdown
 *
 * Heuristique de matching nom-de-fichier :
 *   - bag-screen.ts ↔ item_menu.c
 *   - option-menu-impl.ts ↔ option_menu.c
 *   - party-screen.ts ↔ party_menu.c
 *   - trainer-card-screen.ts ↔ trainer_card.c
 *   - pokedex-screen.ts ↔ pokedex.c
 *   - naming-screen-impl.ts ↔ naming_screen.c
 *   - start-menu.ts ↔ start_menu.c
 *   - gba-window-system.ts ↔ window.c
 *   - gba-text-system.ts ↔ text.c
 *   - gba-text-window.ts ↔ text_window.c
 *   - field-camera.ts ↔ field_camera.c
 *   - field-message-box.ts ↔ field_message_box.c
 *   - map-name-popup.ts ↔ map_name_popup.c
 *   - tileset-animator.ts ↔ tileset_anims.c
 *   - decomp-runtime.ts ↔ main.c (= partial)
 *   - script-runner.ts ↔ script.c
 *   - object-events.ts ↔ event_object_movement.c (= partial)
 *   - src/game/random.ts ↔ random.c   (racine miroir 1:1, vague 2026-06-05)
 *   - src/game/util.ts ↔ util.c · src/game/trig.ts ↔ trig.c · src/game/math_util.ts ↔ math_util.c
 *
 * Output : JSON ou markdown report.
 */
import { readdirSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const decompSrc = join(decompPath, 'src');
const portSrc = join(projectRoot, 'src');

// ─── Mapping TS file → décomp .c file ────────────────────────────────────────

const MAPPING = {
  'src/engine/bag-screen.ts': 'src/item_menu.c',
  'src/engine/option-menu-impl.ts': 'src/option_menu.c',
  'src/engine/option-menu-return.ts': 'src/overworld.c',  // partial
  'src/engine/option-menu-extras.ts': 'src/option_menu.c',  // partial
  'src/engine/party-screen.ts': 'src/party_menu.c',
  'src/engine/trainer-card-screen.ts': 'src/trainer_card.c',
  'src/engine/pokedex-screen.ts': 'src/pokedex.c',
  'src/engine/naming-screen-impl.ts': 'src/naming_screen.c',
  'src/engine/start-menu.ts': 'src/start_menu.c',
  'src/engine/gba-window-system.ts': 'src/window.c',
  'src/engine/gba-text-system.ts': 'src/text.c',
  'src/engine/gba-text-window.ts': 'src/text_window.c',
  'src/engine/gba-text-printer.ts': 'src/text.c',
  'src/engine/gba-menu-system.ts': 'src/menu.c',
  'src/engine/field-camera.ts': 'src/field_camera.c',
  'src/engine/field-message-box.ts': 'src/field_message_box.c',
  'src/engine/field-effect-grass.ts': 'src/field_effect_helpers.c',
  'src/engine/field-effect-shadow.ts': 'src/field_effect_helpers.c',
  'src/engine/field-door.ts': 'src/field_door.c',
  'src/engine/map-name-popup.ts': 'src/map_name_popup.c',
  'src/engine/tileset-animator.ts': 'src/tileset_anims.c',
  'src/engine/tileset-anims.ts': 'src/tileset_anims.c',
  'src/engine/script-runner.ts': 'src/script.c',
  'src/engine/script-runtime.ts': 'src/script.c',
  'src/engine/object-events.ts': 'src/event_object_movement.c',
  'src/engine/player-avatar.ts': 'src/player_avatar.c',
  'src/engine/load_save.ts': 'src/load_save.c',
  'src/engine/save-blocks.ts': 'src/save_blocks.c',
  'src/engine/save-system.ts': 'src/save.c',
  'src/engine/play-time-counter.ts': 'src/play_time.c',
  'src/engine/wallclock-flow.ts': 'src/wallclock.c',
  'src/engine/rtc.ts': 'src/rtc.c',
  // ── Miroir 1:1 `src/game/` (vague 2026-06-05) : la logique a quitté
  //    `src/engine/…` pour la racine miroir `src/game/X.ts` (= decomp/src/X.c).
  //    On pointe ces entrées sur le miroir, source unique de la logique. ──
  'src/game/random.ts': 'src/random.c',
  'src/game/util.ts': 'src/util.c',
  'src/game/trig.ts': 'src/trig.c',
  'src/game/math_util.ts': 'src/math_util.c',
  'src/engine/movement-system.ts': 'src/event_object_movement.c',
  'src/engine/warp-system.ts': 'src/field_screen_effect.c',
  'src/engine/door-anim.ts': 'src/field_door.c',
  'src/engine/world-renderer.ts': 'src/field_camera.c',
  'src/engine/window-renderer.ts': 'src/window.c',
  'src/engine/dialogue-box.ts': 'src/field_message_box.c',
  'src/engine/character-anims.ts': 'src/event_object_movement.c',
  'src/engine/menu.ts': 'src/menu.c',
  'src/engine/bag.ts': 'src/item.c',
  'src/engine/pokemon.ts': 'src/pokemon.c',
  'src/engine/mon-anim.ts': 'src/pokemon_animation.c',
  'src/engine/pokemon-anim-funcs.ts': 'src/pokemon_animation.c',
  'src/engine/pokemon-animation.ts': 'src/pokemon_animation.c',
};

// ─── Extract function names from TS / C source ───────────────────────────────

function extractTsFunctions(content) {
  const fns = new Set();
  // export function X / function X
  for (const m of content.matchAll(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/gm)) {
    fns.add(m[1]);
  }
  // export const X = (...) => / const X = function(...)
  for (const m of content.matchAll(/^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:function|\()/gm)) {
    fns.add(m[1]);
  }
  return fns;
}

function extractCFunctions(content) {
  const fns = new Set();
  // void X(...) / u8 X(...) / static void X(...) / bool32 X(...)
  // Match the start of a function definition (= return type + name + ( on same line or next).
  // Heuristic : type-keyword + (whitespace+)* + identifier + ( + ... + ) + opt whitespace + opt newline + {
  // We use a simpler regex : "^(static\s+)?(\w+\s+)+(\w+)\s*\("
  const re = /^(?:static\s+)?(?:const\s+)?(?:UNUSED\s+)?(?:NAKED\s+)?(?:inline\s+)?(?:bool32|bool8|void|u8|u16|u32|s8|s16|s32|int|char|float)\s*\*?\s+(\w+)\s*\(/gm;
  for (const m of content.matchAll(re)) {
    if (m[1] !== 'if' && m[1] !== 'while' && m[1] !== 'for' && m[1] !== 'switch' && m[1] !== 'return') {
      fns.add(m[1]);
    }
  }
  return fns;
}

// ─── Find external helpers called in TS file (= globalThis.X or imported but not local) ─

function extractTsCallExpressions(content, localFns) {
  const calls = new Set();
  for (const m of content.matchAll(/\b([A-Z]\w{2,})\s*\(/g)) {
    if (!localFns.has(m[1])) calls.add(m[1]);
  }
  return calls;
}

// ─── Find hacks / stubs / hardcodes in TS file ───────────────────────────────

const HACK_PATTERNS = [
  { name: 'setFieldCameraSuspended', re: /setFieldCameraSuspended\s*\(/g },
  { name: '_syncSubspriteOam hook', re: /_syncSubspriteOam\s*=/g },
  { name: '_savedObjVram', re: /_savedObjVram/g },
  { name: '_savedObjPalettes', re: /_savedObjPalettes/g },
  { name: '_savedBgState', re: /_savedBgState/g },
];

const STUB_PATTERNS = [
  { name: 'TODO', re: /\/\/\s*TODO\b|\/\*\s*TODO\b/g },
  { name: 'FIXME', re: /\/\/\s*FIXME\b|\/\*\s*FIXME\b/g },
  { name: 'MVP', re: /\b(MVP)\b/g },
  { name: 'placeholder', re: /\bplaceholder\b/gi },
  { name: 'stub no-op', re: /\bno-op\s+stub\b|\bstub.+no-op\b/gi },
  { name: 'WIP', re: /\bWIP\b/g },
];

function findIssues(content) {
  const lines = content.split('\n');
  const hacks = [];
  for (const pat of HACK_PATTERNS) {
    pat.re.lastIndex = 0;
    let m;
    while ((m = pat.re.exec(content))) {
      const lineNum = content.slice(0, m.index).split('\n').length;
      hacks.push({ kind: pat.name, line: lineNum });
    }
  }
  const stubs = [];
  for (const pat of STUB_PATTERNS) {
    pat.re.lastIndex = 0;
    let m;
    while ((m = pat.re.exec(content))) {
      const lineNum = content.slice(0, m.index).split('\n').length;
      stubs.push({ kind: pat.name, line: lineNum, text: lines[lineNum - 1]?.trim().slice(0, 100) });
    }
  }
  return { hacks, stubs };
}

// ─── Main audit function ─────────────────────────────────────────────────────

function auditPair(tsRelPath, cRelPath) {
  const tsAbs = join(projectRoot, tsRelPath);
  const cAbs = join(decompPath, cRelPath);
  if (!existsSync(tsAbs)) return { tsRelPath, cRelPath, error: 'TS file missing' };
  if (!existsSync(cAbs)) return { tsRelPath, cRelPath, error: 'décomp .c missing' };

  const tsContent = readFileSync(tsAbs, 'utf8');
  const cContent = readFileSync(cAbs, 'utf8');

  const tsFns = extractTsFunctions(tsContent);
  const cFns = extractCFunctions(cContent);

  // Functions defined in décomp but NOT in TS
  const missingFromTs = [...cFns].filter(f => !tsFns.has(f));
  // Functions defined in TS but NOT in décomp (= extra / port-specific helpers)
  const extraInTs = [...tsFns].filter(f => !cFns.has(f));
  // Functions defined in both (= 1:1 named match)
  const matched = [...cFns].filter(f => tsFns.has(f));

  const { hacks, stubs } = findIssues(tsContent);

  return {
    tsRelPath, cRelPath,
    stats: {
      tsLines: tsContent.split('\n').length,
      cLines: cContent.split('\n').length,
      tsFnCount: tsFns.size,
      cFnCount: cFns.size,
      matchedCount: matched.length,
      coverage: cFns.size > 0 ? (matched.length / cFns.size) * 100 : 0,
    },
    matched: matched.sort(),
    missingFromTs: missingFromTs.sort(),
    extraInTs: extraInTs.sort(),
    hacks, stubs,
  };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const outputArg = args.find(a => a.startsWith('--output='));
const outputFile = outputArg ? outputArg.split('=')[1] : null;
const filter = args.find(a => !a.startsWith('--'));

const results = [];
for (const [ts, c] of Object.entries(MAPPING)) {
  if (filter && !ts.includes(filter) && !c.includes(filter)) continue;
  results.push(auditPair(ts, c));
}

// Sort by lowest coverage
results.sort((a, b) => (a.stats?.coverage ?? 0) - (b.stats?.coverage ?? 0));

function fmtMd() {
  let out = '# Audit 1:1 décomp — coverage report\n\n';
  out += `Generated : ${new Date().toISOString()}\n\n`;
  out += `Mappings audited : ${results.length}\n\n`;
  out += '| TS file | C file | TS lines | C lines | Matched | Coverage | Hacks | Stubs |\n';
  out += '|---|---|---|---|---|---|---|---|\n';
  for (const r of results) {
    if (r.error) {
      out += `| ${r.tsRelPath} | ${r.cRelPath} | — | — | — | ❌ ${r.error} | — | — |\n`;
      continue;
    }
    const cov = r.stats.coverage.toFixed(0);
    out += `| ${r.tsRelPath} | ${r.cRelPath} | ${r.stats.tsLines} | ${r.stats.cLines} | ${r.stats.matchedCount}/${r.stats.cFnCount} | ${cov}% | ${r.hacks.length} | ${r.stubs.length} |\n`;
  }
  out += '\n## Détails par fichier\n\n';
  for (const r of results) {
    if (r.error) continue;
    out += `### \`${r.tsRelPath}\` ↔ \`${r.cRelPath}\`\n\n`;
    out += `- Coverage : **${r.stats.coverage.toFixed(0)}%** (${r.stats.matchedCount}/${r.stats.cFnCount})\n`;
    if (r.hacks.length) {
      out += `- Hacks détectés : ${r.hacks.length}\n`;
      for (const h of r.hacks.slice(0, 10)) out += `  - line ${h.line} : \`${h.kind}\`\n`;
    }
    if (r.stubs.length) {
      out += `- Stubs/TODO/MVP : ${r.stubs.length}\n`;
      for (const s of r.stubs.slice(0, 10)) out += `  - line ${s.line} : \`${s.kind}\` — ${s.text ?? ''}\n`;
    }
    if (r.missingFromTs.length) {
      out += `- Helpers manquants (présents dans décomp, absents en TS) : ${r.missingFromTs.length}\n`;
      for (const f of r.missingFromTs.slice(0, 20)) out += `  - \`${f}\`\n`;
      if (r.missingFromTs.length > 20) out += `  - ... +${r.missingFromTs.length - 20} more\n`;
    }
    out += '\n';
  }
  return out;
}

if (outputFile) {
  if (outputFile.endsWith('.md')) {
    writeFileSync(outputFile, fmtMd());
  } else {
    writeFileSync(outputFile, JSON.stringify(results, null, 2));
  }
  console.log(`Report written to ${outputFile}`);
} else {
  // Default : print summary to stdout
  console.log('TS file | C file | Coverage | Hacks | Stubs');
  console.log('-'.repeat(80));
  for (const r of results) {
    if (r.error) {
      console.log(`${r.tsRelPath} | ${r.cRelPath} | ERROR: ${r.error}`);
      continue;
    }
    console.log(`${r.tsRelPath} | ${r.cRelPath} | ${r.stats.coverage.toFixed(0)}% (${r.stats.matchedCount}/${r.stats.cFnCount}) | hacks=${r.hacks.length} | stubs=${r.stubs.length}`);
  }
}

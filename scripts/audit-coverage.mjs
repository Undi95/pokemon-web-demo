#!/usr/bin/env node
/**
 * Audit complet de la couverture du port vs décomp.
 * Génère un rapport JSON détaillé de tout ce qui manque.
 */
import { readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const srcEngine = join(projectRoot, 'src', 'engine');

// ─── 1. Opcodes : map scripts uniquement ─────────────────────────────────────
const usedOpcodes = new Map();
const scriptsDir = join(projectRoot, 'public', 'decomp', 'em', 'scripts');
for (const f of readdirSync(scriptsDir)) {
  if (!f.endsWith('.json') || f === '_common.json' || f === '_all.json') continue;
  try {
    const data = JSON.parse(readFileSync(join(scriptsDir, f), 'utf8'));
    for (const lines of Object.values(data.scripts ?? {})) {
      for (const line of lines) {
        const m = String(line).trim().match(/^(\w+)/);
        if (m) usedOpcodes.set(m[1], (usedOpcodes.get(m[1]) ?? 0) + 1);
      }
    }
  } catch {}
}

const registeredOpcodes = new Set();
const opcodesSrc = readFileSync(join(srcEngine, 'script-opcodes.ts'), 'utf8');
for (const m of opcodesSrc.matchAll(/registerOpcode\('([^']+)'/g)) registeredOpcodes.add(m[1]);

// ─── 2. Specials ─────────────────────────────────────────────────────────────
const usedSpecials = new Map();
for (const f of readdirSync(scriptsDir)) {
  if (!f.endsWith('.json') || f === '_common.json' || f === '_all.json') continue;
  try {
    const data = JSON.parse(readFileSync(join(scriptsDir, f), 'utf8'));
    for (const lines of Object.values(data.scripts ?? {})) {
      for (const line of lines) {
        const s = String(line).trim();
        const m = s.match(/^(?:special|specialvar)\s+(?:VAR_\w+\s*,\s*)?(\w+)/);
        if (m) usedSpecials.set(m[1], (usedSpecials.get(m[1]) ?? 0) + 1);
      }
    }
  } catch {}
}
const registeredSpecials = new Set();
const specialsSrc = readFileSync(join(srcEngine, 'specials-registry.ts'), 'utf8');
for (const m of specialsSrc.matchAll(/registerSpecial\('([^']+)'/g)) registeredSpecials.add(m[1]);
// Plus les batch specials.
const batchMatch = specialsSrc.match(/_STUB_RETURN_0_SPECIALS\s*=\s*\[([\s\S]*?)\]/);
if (batchMatch) {
  for (const m of batchMatch[1].matchAll(/'([^']+)'/g)) registeredSpecials.add(m[1]);
}

// ─── 3. Movement actions ─────────────────────────────────────────────────────
const usedMovementActions = new Map();
const decompMovementInc = join(decompPath, 'data', 'scripts', 'movement.inc');
if (existsSync(decompMovementInc)) {
  const content = readFileSync(decompMovementInc, 'utf8');
  for (const m of content.matchAll(/^\s*(\w+)\s*$/gm)) {
    const op = m[1];
    if (op.startsWith('walk_') || op.startsWith('face_') || op.startsWith('jump_') ||
        op.startsWith('emote_') || op.startsWith('delay_') || op.startsWith('lock_') ||
        op.startsWith('unlock_') || op.startsWith('set_invisible') || op.startsWith('set_visible') ||
        op.startsWith('fly_') || op.startsWith('exit_pokeball') || op.startsWith('enter_pokeball') ||
        op.startsWith('figure_8') || op.startsWith('shake_head') || op.startsWith('sleep_') ||
        op.startsWith('slide_')) {
      usedMovementActions.set(op, (usedMovementActions.get(op) ?? 0) + 1);
    }
  }
}
const registeredMovementActions = new Set();
const movSrc = readFileSync(join(srcEngine, 'movement-system.ts'), 'utf8');
for (const m of movSrc.matchAll(/action === '([^']+)'/g)) registeredMovementActions.add(m[1]);

// ─── 4. Helpers manquants — bridge fns ───────────────────────────────────────
const bridgedNames = new Set();
const bridgeSrc = readFileSync(join(srcEngine, 'decomp-bridge.ts'), 'utf8');
const bridgeListMatch = bridgeSrc.match(/__bridgedHelpers__[\s\S]*?Set\(\[([\s\S]*?)\]\)/);
if (bridgeListMatch) {
  for (const m of bridgeListMatch[1].matchAll(/'([^']+)'/g)) bridgedNames.add(m[1]);
}

// ─── 5. Map JSON files ───────────────────────────────────────────────────────
const mapJsonFiles = readdirSync(scriptsDir).filter(f => f.endsWith('.json') && f !== '_common.json' && f !== '_all.json');

// ─── 6. Field effects ────────────────────────────────────────────────────────
const fieldEffectsConst = join(srcEngine, 'decomp-data/auto/include/constants/field_effects-data.ts');
const fieldEffects = [];
if (existsSync(fieldEffectsConst)) {
  const content = readFileSync(fieldEffectsConst, 'utf8');
  for (const m of content.matchAll(/^export const (FLDEFF_\w+) = (\d+);/gm)) {
    fieldEffects.push({ name: m[1], id: parseInt(m[2], 10) });
  }
}

// ─── 7. Battle anim scripts (= just count) ───────────────────────────────────
const battleAnimsDir = join(srcEngine, 'decomp-data/auto/src-all');
const battleAnimFiles = existsSync(battleAnimsDir)
  ? readdirSync(battleAnimsDir).filter(f => f.startsWith('battle_anim'))
  : [];

// ─── Build report ────────────────────────────────────────────────────────────
const opcodesMissing = [];
for (const [op, n] of usedOpcodes) {
  if (registeredOpcodes.has(op)) continue;
  // Skip movement actions (= handled by movement-system).
  if (registeredMovementActions.has(op)) continue;
  // Skip battle script opcodes (= handled by Showdown backend).
  if ([
    'case','if_effect','score','frontier_set','def_special','createsprite','createvisualtask',
    'waitforvisualfinish','loadspritegfx','clearmonbg','monbg','setalpha','blendoff','printstring',
    'create_basic_hitsplat_sprite','if_random_less_than','printfromtable','attackstring','ppreduce',
    'attackcanceler','if_equal','simple_palette_blend','attackanimation','waitanimation','waitbgfadein',
    'create_absorption_orb_sprite','field_eff_end','if_hp_more_than','accuracycheck','if_effect_eq',
    'if_stat_level_more_than','setmoveeffect','fadetobg','setstatchanger','if_hp_less_than',
    'if_user_order_eq','splitbgprio','orword','blend_color_cycle','healthbarupdate','datahpupdate',
    'playanimation','restorebg','jumpifstatus2','waitbgfadeout','field_eff_callnative',
    'if_type_effectiveness','if_stat_level_less_than','field_eff_loadfadedpal_callnative',
    'if_stat_level_equal','get_ability','if_in_bytes','complex_palette_blend','tryfaintmon',
    'statbuffchange','resultmessage','if_status2','if_user_order_not_eq','if_move','if_target_faster',
    'create_overheat_flame_sprite','if_can_participate','typecalc','jumpifbattletype',
    'create_power_absorption_orb_sprite','jumpifstatus','updatestatusicon','script_cmd_table_entry',
    'map_script','map_script_2',
  ].includes(op)) continue;
  opcodesMissing.push([op, n]);
}
opcodesMissing.sort((a, b) => b[1] - a[1]);

const specialsMissing = [];
for (const [op, n] of usedSpecials) {
  if (registeredSpecials.has(op)) continue;
  specialsMissing.push([op, n]);
}
specialsMissing.sort((a, b) => b[1] - a[1]);

const movementMissing = [];
for (const op of usedMovementActions.keys()) {
  if (registeredMovementActions.has(op)) continue;
  movementMissing.push(op);
}

const report = {
  timestamp: new Date().toISOString(),
  opcodes: {
    used: usedOpcodes.size,
    registered: registeredOpcodes.size,
    missing: opcodesMissing.length,
    top10Missing: opcodesMissing.slice(0, 10),
    fullList: opcodesMissing,
  },
  specials: {
    used: usedSpecials.size,
    registered: registeredSpecials.size,
    missing: specialsMissing.length,
    top10Missing: specialsMissing.slice(0, 10),
    fullList: specialsMissing,
  },
  movementActions: {
    registered: registeredMovementActions.size,
    inDecomp: usedMovementActions.size,
    missing: movementMissing,
  },
  fieldEffects: {
    total: fieldEffects.length,
    list: fieldEffects.slice(0, 20),
    note: '60+ field effects — most are post-game (Cut, Surf, Fly, Strength). Wire on-demand.',
  },
  battleAnims: {
    autoFiles: battleAnimFiles.length,
    note: '27 battle_anim_*-all-auto.ts auto-files, ~5000 lignes décomp pour les animations 1:1. Showdown gère logic, anim+audio à wire.',
  },
  bridgeHelpers: {
    declared: bridgedNames.size,
    note: 'Liste descriptive dans __bridgedHelpers__ Set. Pas tous exposés sur globalThis.',
  },
  mapsCovered: {
    extractedJson: mapJsonFiles.length,
    note: 'Chaque map a son scripts.json + script-runtime fetch on-demand au warp.',
  },
};

const outPath = join(projectRoot, 'audit-reports', 'audit-coverage.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`Audit written → ${outPath}`);
console.log(`\nSummary:`);
console.log(`  Opcodes    : ${report.opcodes.registered}/${report.opcodes.used} registered, ${report.opcodes.missing} missing`);
console.log(`  Specials   : ${report.specials.registered}/${report.specials.used} registered, ${report.specials.missing} missing`);
console.log(`  Movements  : ${report.movementActions.registered} registered, ${report.movementActions.missing.length} missing in decomp inc`);
console.log(`  FieldEffs  : ${report.fieldEffects.total} declared`);
console.log(`  BattleAnims: ${report.battleAnims.autoFiles} auto-files`);
console.log(`  Maps JSON  : ${report.mapsCovered.extractedJson} scripts files`);
console.log(`\nTop missing :`);
console.log('  Opcodes   :', report.opcodes.top10Missing.map(([k, v]) => `${k}(${v})`).join(', '));
console.log('  Specials  :', report.specials.top10Missing.map(([k, v]) => `${k}(${v})`).join(', '));

#!/usr/bin/env node
/**
 * Parse `asm/macros/event.inc` (270 macros) + `data/script_cmd_table.inc`
 * (227 raw opcodes) du décomp pour extraire le catalog COMPLET des opcodes
 * de scripting.
 *
 * Sortie : `public/decomp/em/script-opcodes.json`
 *   {
 *     macros: {
 *       "msgbox": { args: ["text", "type"], opcode: "SCR_OP_MESSAGE", description: "..." },
 *       "applymovement": { args: ["index", "movements"], opcode: "...", description: "..." },
 *       ...
 *     },
 *     opcodes: { "SCR_OP_NOP": { value: 0, handler: "ScrCmd_nop" }, ... }
 *   }
 *
 * Cf. DECOMP_ORIGIN_FILES.md H. Scripts.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'script-opcodes.json');
mkdirSync(dirname(outPath), { recursive: true });

// ─── 1. Parse data/script_cmd_table.inc → opcode → handler ──────────────────
const tableText = readFileSync(join(decompPath, 'data', 'script_cmd_table.inc'), 'utf8');
const opcodes = {};
let opcodeIdx = 0;
const tableRe = /^\s*script_cmd_table_entry\s+(SCR_OP_\w+)\s+(\w+)\s*@\s*(0x[0-9a-fA-F]+|\d+)/gm;
let m;
while ((m = tableRe.exec(tableText)) !== null) {
  const value = m[3].startsWith('0x') ? parseInt(m[3], 16) : parseInt(m[3]);
  opcodes[m[1]] = { value, handler: m[2] };
  opcodeIdx++;
}

// ─── 2. Parse asm/macros/event.inc → macros + leurs args ────────────────────
const macroText = readFileSync(join(decompPath, 'asm', 'macros', 'event.inc'), 'utf8');
const macros = {};

// Pattern pour chaque macro :
//   @ Description (optional, lignes commençant par @)
//   .macro <name> <arg1>:req, <arg2>=<default>, ...
//   .byte SCR_OP_X
//   .Xbyte \arg1
//   ...
//   .endm

// Split sur ".macro " puis traite chaque bloc
const blocks = macroText.split(/^\s*\.macro\s+/m).slice(1);
for (const block of blocks) {
  // 1ere ligne = "name args... \n"
  const firstNl = block.indexOf('\n');
  const header = block.slice(0, firstNl).trim();
  const body = block.slice(firstNl + 1).split(/^\s*\.endm/m)[0];

  // Parse header : name + args
  const headerParts = header.split(/\s+/);
  const name = headerParts[0];
  if (!name) continue;
  const argsRaw = header.slice(name.length).trim();
  const args = argsRaw
    ? argsRaw.split(',').map(s => {
        const cleaned = s.trim();
        // Format : "argname:req" ou "argname=default" ou "argname"
        const [argName] = cleaned.split(/[:=]/);
        return argName.trim();
      }).filter(Boolean)
    : [];

  // Trouve l'opcode SCR_OP_* utilisé dans le body (1ère occurrence = principal)
  const opMatch = body.match(/\.byte\s+(SCR_OP_\w+)/);
  const opcode = opMatch ? opMatch[1] : null;

  macros[name] = { args, opcode };
}

// ─── 3. Output ──────────────────────────────────────────────────────────────
writeFileSync(outPath, JSON.stringify({ macros, opcodes }, null, 2));
console.log('[script-opcodes]', {
  macros_count: Object.keys(macros).length,
  opcodes_count: Object.keys(opcodes).length,
  sample_macros: ['msgbox', 'applymovement', 'givepokemon', 'setvar', 'random'].map(k => [k, macros[k]]),
  output: outPath,
});

#!/usr/bin/env node
/**
 * cartograph-1to1.cjs — CARTOGRAPHIE Phase 0 (marathon réplique 1:1 INTÉGRALE)
 * ============================================================================
 * Vue INVERSE de audit-game-mirror.cjs : on part de la DÉCOMP et on demande, pour
 * CHAQUE fichier décomp, « où vit-il chez nous, et à quel % est-il 1:1 ? ».
 *
 *   Axe A — src/*.c (310, le cœur logique) : pour chaque .c, trouver notre .ts
 *           (homonyme, sinon meilleur recouvrement de noms de fn) + complétude
 *           = fn décomp présentes chez nous / total fn décomp. Statut ✅/🟡/🔴.
 *   Axe B — include (.h, types/constantes) : présence d'un miroir chez nous.
 *   Axe C — data/ (maps/scripts/layouts/.inc) : résumé de couverture.
 *   Axe D — graphics/ (png/tilesets) : compte + ce qui est déjà importé (bulk).
 *   Axe E — sound/ : harness m4a maison (hors 1:1).
 *
 * Sortie : docs/FULL-1TO1-CHECKLIST.md (humain) + audit-reports/1to1/cartograph.json
 * Helper NON-TRACKÉ. Usage : node scripts/cartograph-1to1.cjs
 */
const { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } = require('node:fs');
const { resolve, join, relative, basename } = require('node:path');

const ROOT = resolve(__dirname, '..');
const SRC = join(ROOT, 'src');
const DECOMP = resolve(ROOT, '..', 'decomps', 'pokeemeraude');
const DECOMP_SRC = join(DECOMP, 'src');
const OUT_DOCS = join(ROOT, 'docs');
const OUT_REPORT = join(ROOT, 'audit-reports', '1to1');

// ─── Parser C (1:1 audit-game-mirror.cjs) ────────────────────────────────────
const C_KW = new Set(['if','else','while','for','switch','return','sizeof','do','goto','typedef','case','default','break','continue']);
const ATTR = new Set(['ALIGNED','UNUSED','NAKED','IWRAM_CODE','EWRAM_DATA','ASM_DIRECT','NOINLINE','NORETURN','INLINE']);
const strip = (l) => { const i = l.indexOf('//'); if (i >= 0) l = l.slice(0, i); return l.replace(/\/\*.*?\*\/\s*$/, '').replace(/\s+$/, ''); };
function cFuncNames(content) {
  const lines = content.split('\n'); const names = new Set();
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw || /^\s/.test(raw)) continue;
    if (/^[#}{*\/]/.test(raw)) continue; if (/^\s*$/.test(raw)) continue;
    if (/^(extern|typedef)\b/.test(raw)) continue;
    const line = strip(raw); if (!line) continue;
    // Table de pointeurs de fonction : `void (*const NAME[])(args) =` → extraire NAME.
    const fp = line.match(/\(\s*\*\s*(?:const\s+)?([A-Za-z_]\w*)\s*\[/);
    if (fp && !C_KW.has(fp[1])) { names.add(fp[1]); continue; }
    const endsSemi = /;\s*$/.test(line);
    const pParen = line.indexOf('('), pBracket = line.indexOf('['), pEq = line.indexOf('=');
    if (pParen >= 0 && (pEq < 0 || pParen < pEq) && (pBracket < 0 || pParen < pBracket) && !endsSemi) {
      const m = line.slice(0, pParen + 1).match(/([A-Za-z_]\w*)\s*\($/);
      if (m && !C_KW.has(m[1]) && !ATTR.has(m[1])) names.add(m[1]);
    }
  }
  return names;
}

// ─── Index décomp .c → Set(noms fn) ───────────────────────────────────────────
const cFuncsByFile = new Map();
for (const e of readdirSync(DECOMP_SRC, { withFileTypes: true })) {
  if (!e.isFile() || !e.name.endsWith('.c')) continue;
  cFuncsByFile.set(e.name, cFuncNames(readFileSync(join(DECOMP_SRC, e.name), 'utf8')));
}
// nombre de lignes du .c (proxy de taille/effort)
function cLines(name) { try { return readFileSync(join(DECOMP_SRC, name), 'utf8').split('\n').length; } catch { return 0; } }

// ─── Extraction des fn TS définies + global index ────────────────────────────
const FN_RE = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w*)/g;
const ARROW_RE = /(?:export\s+)?const\s+([A-Za-z_]\w*)\s*(?::[^=\n]+)?=\s*(?:async\s+)?(?:function\b|\([^\n)]*\)\s*(?::[^=>\n]+)?=>)/g;
// Globals / tables top-level (`const sFoo = [...]`) — le décomp les expose comme symboles.
const DECL_RE = /^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_]\w*)/gm;
function tsDefs(content) {
  const defs = new Set(); let m;
  FN_RE.lastIndex = 0; while ((m = FN_RE.exec(content))) defs.add(m[1]);
  ARROW_RE.lastIndex = 0; while ((m = ARROW_RE.exec(content))) defs.add(m[1]);
  DECL_RE.lastIndex = 0; while ((m = DECL_RE.exec(content))) defs.add(m[1]);
  return defs;
}
const norm = (n) => n.replace(/^_+/, '').replace(/_+$/, '');

// ─── Walk TOUT notre src/ ─────────────────────────────────────────────────────
function* walkTs(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (/node_modules|\.git/.test(full)) continue; yield* walkTs(full); }
    else if (e.name.endsWith('.ts')) yield full;
  }
}
const tsFiles = [];                    // { rel, base, defs:Set, normDefs:Set }
const tsByBasename = new Map();         // 'overworld' → [rel,...]
const ALL_TS_FN = new Set();           // tous les noms de fn TS définis (normés)
for (const abs of walkTs(SRC)) {
  const rel = relative(SRC, abs).replace(/\\/g, '/');
  const defs = tsDefs(readFileSync(abs, 'utf8'));
  const normDefs = new Set([...defs].map(norm));
  const base = basename(abs, '.ts');
  const rec = { rel, base, defs, normDefs };
  tsFiles.push(rec);
  if (!tsByBasename.has(base)) tsByBasename.set(base, []);
  tsByBasename.get(base).push(rec);
  for (const d of normDefs) ALL_TS_FN.add(d);
}
function present(cFn) { return ALL_TS_FN.has(cFn) || ALL_TS_FN.has(norm(cFn)); }

// ─── Catégorisation par mots-clés (priorisation marathon) ─────────────────────
// Ordre = on sort d'abord les blocs "défère/harness" (Link/Son/Save/Système),
// puis le cœur jouable (Overworld → Combat → Pokémon → UI → Item).
function categorize(name) {
  const n = name.toLowerCase();
  // Link / sans-fil / e-reader / mystery gift / record mixing — N/A archi (différé)
  if (/(^link|librfu|rfu|union_room|^mevent\b|mystery_gift|mystery_event|wonder_news|wonder_mail|record_mixing|multiboot|cable_club|reshow_battle|ereader|net\b)/.test(n)) return 'Link/IO (N-A)';
  // Son — moteur m4a maison (harness)
  if (/(^m4a|^sound\b|^sound_|^cry\b|cry_|^bgm|^song|music|agb_pcm)/.test(n)) return 'Son (harness)';
  // Save / RTC / horloge / temps
  if (/(^save\b|^save_|load_save|reload_save|clear_save|^rtc\b|siirtc|reset_rtc|agb_flash|^flash\b|^clock\b|wallclock|play_time|time_events)/.test(n)) return 'Save/RTC';
  // Système / GBA / util bas niveau
  if (/(^main\b|^crt0|^libc|^malloc|^alloc\b|^gba\b|io_reg|^syscall|^dma\b|^bios|^task\b|^util\b|^trig\b|math_util|mini_printf|libisagbprn|sio|^intr|rom_header|digit_obj_util|confetti_util|international_string_util|decompress|^random\b)/.test(n)) return 'Système/GBA';
  // Item / sac / argent
  if (/(^item\b|^item_|^bag\b|^bag_|^shop\b|pokemart|use_pokeblock|^coins\b|^money\b|give_gift)/.test(n)) return 'Item/Bag';
  // Combat / contest / cutscenes de combat
  if (/(battle|contest|^move\b|pokemon_animation|anim_mon|rayquaza_scene|^pokeball\b)/.test(n)) return 'Combat';
  // Pokémon / party / évolution / pokédex / œuf
  if (/(^pokemon|party_menu|^evolution|^pokedex|pokeblock|^daycare|learn_move|move_relearner|^mon_|egg_hatch|^pokenav)/.test(n)) return 'Pokémon/Party';
  // UI / menus / texte / sprites / gfx
  if (/(menu|window|^text\b|^text_|^string|^font|^sprite|^gpu|^bg\b|^blit|scanline|palette|^startup|^title|^intro\b|list_menu|^option|naming|^mail\b|image_proc|^credits|trainer_card|^diploma|hall_of_fame|^hof_|frontier_pass|^graphics\b|dynamic_placeholder|menu_helpers)/.test(n)) return 'UI/Menu/Gfx';
  // Overworld / field / events / cartes — le plus large, en dernier des "cœur"
  if (/(overworld|field|fldeff|fieldmap|metatile|tileset|map_|event_object|object_event|^event_data|berry|trainer_see|item_use|secret_base|^scrcmd|script|coord_event|wild_encounter|region_map|^tv\b|^tv_|easy_chat|mauville|^bike\b|^roamer|safari_zone|new_game|heal_location|decoration|slot_machine|roulette|lottery|dewford_trend|lilycove_lady|apprentice|match_call|trainer_hill|mirage_tower|rotating_gate|rotating_tile|faraway_island|birch_pc|player_pc|starter_choose|landmark|walda|braille|gym_leader_rematch|frontier_util|trainer_pokemon_sprites|^trade\b|pokeblock_feed|berry_)/.test(n)) return 'Overworld/Field';
  // Debug
  if (/(^debug|^test_|sprite_test|^unk_)/.test(n)) return 'Debug';
  return 'Autre';
}

// ─── Alias 1:1 (flagship byte-VM) ─────────────────────────────────────────────
// SWAP MIRROR FAIT (2026-06-28) : le byte-VM (= seul moteur) vit désormais aux noms 1:1
// `src/script.ts` (= script.c) + `src/scrcmd.ts` (= scrcmd.c) — les fichiers `*_bytevm.ts`
// ont été fusionnés/supprimés. Le lookup par basename les crédite directement → plus
// besoin d'alias. Cf docs/BYTE-VM-PLAN.md.
const ALIAS_1TO1 = {};

// ─── Axe A : les 310 .c ───────────────────────────────────────────────────────
const rowsA = [];
for (const [cFile, cNames] of cFuncsByFile) {
  const base = cFile.replace(/\.c$/, '');
  let cand = tsByBasename.get(base) || [];
  const alias = ALIAS_1TO1[cFile];
  if (alias && tsByBasename.has(alias)) cand = [...cand, ...tsByBasename.get(alias)];
  // homonyme : meilleur recouvrement parmi candidats homonymes
  let homonym = null, homOverlap = -1;
  for (const rec of cand) {
    let ov = 0; for (const cn of cNames) if (rec.normDefs.has(norm(cn))) ov++;
    if (ov > homOverlap) { homOverlap = ov; homonym = rec; }
  }
  // si pas d'homonyme, meilleur recouvrement TOUTES sources — mais SEULEMENT si recouvrement réel
  // (≥2 fn communes) sinon c'est du bruit (1 nom d'util partagé) → on laisse "manquant".
  let best = homonym, bestOv = homOverlap;
  if (!homonym) {
    bestOv = 1;  // seuil : il faut ≥2 fn communes pour pointer un fichier "nom≠"
    for (const rec of tsFiles) {
      let ov = 0; for (const cn of cNames) if (rec.normDefs.has(norm(cn))) ov++;
      if (ov > bestOv) { bestOv = ov; best = rec; }
    }
    if (bestOv <= 1) best = null;  // pas de candidat crédible → vraiment manquant
  }
  // complétude homonyme (présence dans LE fichier ciblé)
  const inFile = best ? best.normDefs : new Set();
  let matchedFile = 0; for (const cn of cNames) if (inFile.has(norm(cn))) matchedFile++;
  // présence GLOBALE (fn implémentée n'importe où chez nous)
  let matchedAny = 0; for (const cn of cNames) if (present(cn)) matchedAny++;
  const total = cNames.size;
  const complFile = total ? Math.round(matchedFile / total * 100) : 100;
  const complAny = total ? Math.round(matchedAny / total * 100) : 100;
  let status;
  if (total === 0) status = '⚪ vide/data';
  else if (homonym && complFile >= 85) status = '✅ miroir';
  else if (homonym && complFile >= 40) status = '🟡 partiel';
  else if (complAny >= 60) status = '🟠 dispersé';   // présent mais pas dans un fichier homonyme propre
  else if (complAny >= 15) status = '🟡 amorce';
  else status = '🔴 manquant';
  rowsA.push({
    cFile, cat: categorize(base), lines: cLines(cFile), total,
    here: best ? best.rel : '—', homonym: !!homonym,
    matchedFile, complFile, matchedAny, complAny, status,
  });
}

// ─── Axe B : include/**/*.h présence ─────────────────────────────────────────
function* walkFiles(dir, ext) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walkFiles(full, ext);
    else if (!ext || e.name.endsWith(ext)) yield full;
  }
}
// notre miroir d'include : src/game/include/** + src/engine/** *.ts portant le nom du .h
const ourIncludeBases = new Set();
for (const abs of walkTs(join(SRC, 'game', 'include'))) ourIncludeBases.add(basename(abs, '.ts'));
for (const abs of walkTs(join(SRC, 'engine'))) ourIncludeBases.add(basename(abs, '.ts'));
for (const abs of walkTs(join(SRC, 'game'))) ourIncludeBases.add(basename(abs, '.ts'));
let hTotal = 0, hPresent = 0; const hMissing = [];
for (const hf of walkFiles(join(DECOMP, 'include'), '.h')) {
  hTotal++;
  const b = basename(hf, '.h');
  if (ourIncludeBases.has(b)) hPresent++; else hMissing.push(relative(join(DECOMP, 'include'), hf).replace(/\\/g, '/'));
}

// ─── Axe C/D/E : résumés ──────────────────────────────────────────────────────
function countFiles(dir, ext) { let n = 0; for (const _ of walkFiles(dir, ext)) n++; return n; }
const dataMaps = countFiles(join(DECOMP, 'data', 'maps'));
const dataScripts = countFiles(join(DECOMP, 'data', 'scripts'));
const dataLayouts = countFiles(join(DECOMP, 'data', 'layouts'));
const gfxPng = countFiles(join(DECOMP, 'graphics'), '.png');
const gfxAll = countFiles(join(DECOMP, 'graphics'));
const soundAll = countFiles(join(DECOMP, 'sound'));
// nos assets décomp importés (borné à public/decomp ; exclut dist/ build + harness UI)
const ourPng = countFiles(join(ROOT, 'public', 'decomp'), '.png');

// ─── Stats globales Axe A ─────────────────────────────────────────────────────
const byStatus = {};
for (const r of rowsA) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
const byCat = {};
for (const r of rowsA) {
  byCat[r.cat] = byCat[r.cat] || { n: 0, miroir: 0, partiel: 0, manquant: 0, lines: 0 };
  const c = byCat[r.cat]; c.n++; c.lines += r.lines;
  if (r.status.startsWith('✅')) c.miroir++;
  else if (/🟡|🟠/.test(r.status)) c.partiel++;
  else if (r.status.startsWith('🔴')) c.manquant++;
}
// complétude pondérée par lignes (effort réel) — STRICT (fichier homonyme) vs LARGE (partout)
let totLines = 0, doneLinesStrict = 0, doneLinesAny = 0;
for (const r of rowsA) { totLines += r.lines; doneLinesStrict += r.lines * (r.complFile / 100); doneLinesAny += r.lines * (r.complAny / 100); }
const weightedStrict = totLines ? Math.round(doneLinesStrict / totLines * 100) : 0;
const weightedPct = totLines ? Math.round(doneLinesAny / totLines * 100) : 0;

// ─── Rapport markdown ─────────────────────────────────────────────────────────
mkdirSync(OUT_DOCS, { recursive: true });
mkdirSync(OUT_REPORT, { recursive: true });
const ORDER = ['Overworld/Field','Combat','Pokémon/Party','UI/Menu/Gfx','Item/Bag','Save/RTC','Système/GBA','Son (harness)','Link/IO (N-A)','Debug','Autre'];
const catKeys = Object.keys(byCat).sort((a, b) => (ORDER.indexOf(a) + 99 * (ORDER.indexOf(a) < 0)) - (ORDER.indexOf(b) + 99 * (ORDER.indexOf(b) < 0)));

let md = `# Checklist maître — Réplique 1:1 INTÉGRALE (marathon, Phase 0 cartographie)\n\n`;
md += `> Généré par \`scripts/cartograph-1to1.cjs\` (vivant, re-run quand on avance). Vue INVERSE : on part de\n`;
md += `> la décomp et on demande « où vit ce fichier chez nous + complétude 1:1 ». STRUCTUREL (noms de fn),\n`;
md += `> pas comportemental. Voir [FULL-1TO1-REPLICA-PLAN.md](FULL-1TO1-REPLICA-PLAN.md) pour la méthode.\n\n`;

md += `> ⚠️ **BYTE-VM (flagship \`Byte-VM\`, voir [BYTE-VM-PLAN.md](BYTE-VM-PLAN.md)) — FAIT : byte-VM = SEUL moteur.**\n`;
md += `> Le moteur de script est une VM bytecode 1:1 STRICT, désormais AUX NOMS 1:1 (swap mirror fait) :\n`;
md += `> \`script.c\` → **\`src/script.ts\`** (vraie VM : ScriptReadByte/Halfword/Word + gScriptCmdTable + ScriptContext_* +\n`;
md += `> loader image + data-loader/triggers map-script) ; \`scrcmd.c\` → **\`src/scrcmd.ts\`** (227 handlers \`ScrCmd_*\`,\n`;
md += `> **100 % de l'usage opcode overworld** + gSpecials/waitstate) + voie A partagée (\`scrcmd_object/door/fieldeffect/\n`;
md += `> flash/trainer\`, \`script_menu/shop/decoration/heal_location/special_flows\`). Fichiers \`*_bytevm.ts\` fusionnés/supprimés.\n\n`;

md += `## Résumé exécutif\n\n`;
md += `**Axe A — cœur logique (\`src/*.c\`)** : ${rowsA.length} fichiers décomp, ${totLines} lignes C.\n\n`;
md += `| statut | nb fichiers |\n|---|---|\n`;
for (const s of ['✅ miroir','🟡 partiel','🟠 dispersé','🟡 amorce','🔴 manquant','⚪ vide/data']) if (byStatus[s]) md += `| ${s} | ${byStatus[s]} |\n`;
md += `\n**Complétude pondérée par lignes de C** (effort réel) :\n`;
md += `- **STRICT** (fn présente dans NOTRE fichier homonyme propre) : **~${weightedStrict} %** ← la vraie jauge miroir.\n`;
md += `- LARGE (fn implémentée n'importe où, même dispersée/mal nommée) : ~${weightedPct} %.\n`;
md += `- L'écart STRICT↔LARGE = le travail de **consolidation** (logique présente mais pas encore dans le bon fichier 1:1).\n\n`;
md += `**Autres axes** :\n`;
md += `- Axe B — \`include\` (.h types/constantes) : ${hPresent}/${hTotal} avec un miroir homonyme chez nous (${hTotal - hPresent} manquants).\n`;
md += `- Axe C — \`data/\` : maps ${dataMaps} · scripts ${dataScripts} · layouts ${dataLayouts} fichiers (couverture détaillée à part).\n`;
md += `- Axe D — \`graphics/\` : ${gfxPng} png (${gfxAll} fichiers) côté décomp · ${ourPng} png sous \`public/decomp/\` chez nous (structures différentes → proxy, pas une couverture 1:1) → **import systématique en masse (Phase 2)**.\n`;
md += `- Axe E — \`sound/\` : ${soundAll} fichiers décomp → **moteur m4a maison (harness, hors 1:1)**.\n\n`;

md += `## Axe A par catégorie (priorisation marathon)\n\n`;
md += `| catégorie | fichiers | ✅ | 🟡/🟠 | 🔴 | lignes C |\n|---|---|---|---|---|---|\n`;
for (const k of catKeys) { const c = byCat[k]; md += `| ${k} | ${c.n} | ${c.miroir} | ${c.partiel} | ${c.manquant} | ${c.lines} |\n`; }

md += `\n## Axe A détail — les ${rowsA.length} \`.c\` (le backlog)\n\n`;
md += `> complét(fichier) = fn décomp présentes dans NOTRE fichier ciblé / total · complét(partout) = fn\n`;
md += `> implémentée n'importe où chez nous / total. Trié par catégorie puis complétude croissante (= à faire en premier en haut).\n\n`;
for (const k of catKeys) {
  const rs = rowsA.filter((r) => r.cat === k).sort((a, b) => a.complAny - b.complAny || b.lines - a.lines);
  md += `### ${k} (${rs.length})\n\n`;
  md += `| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |\n|---|---|---|---|---|---|---|\n`;
  for (const r of rs) {
    md += `| \`${r.cFile}\` | ${r.lines} | ${r.total} | ${r.here === '—' ? '— **manquant**' : '`' + r.here + '`'}${r.homonym ? '' : (r.here !== '—' ? ' _(nom≠)_' : '')} | ${r.matchedFile}/${r.total} (${r.complFile}%) | ${r.matchedAny}/${r.total} (${r.complAny}%) | ${r.status} |\n`;
  }
  md += `\n`;
}

writeFileSync(join(OUT_DOCS, 'FULL-1TO1-CHECKLIST.md'), md);
writeFileSync(join(OUT_REPORT, 'cartograph.json'), JSON.stringify({ generatedFrom: 'cartograph-1to1.cjs', axeA: rowsA, byStatus, byCat, weightedStrict, weightedPct, hTotal, hPresent, hMissing, dataMaps, dataScripts, dataLayouts, gfxPng, gfxAll, soundAll, ourPng }, null, 2));

// ─── stdout ──────────────────────────────────────────────────────────────────
const log = console.log;
log('═══════════════════════════════════════════════════════════════════════');
log('  CARTOGRAPHIE 1:1 — Phase 0 (décomp → nous)');
log('═══════════════════════════════════════════════════════════════════════');
log(`Axe A : ${rowsA.length} .c  ·  ${totLines} lignes C  ·  pondéré STRICT ~${weightedStrict}%  (large ~${weightedPct}%)`);
log('  ' + Object.entries(byStatus).map(([s, n]) => `${s} ${n}`).join('  ·  '));
log('');
log('Par catégorie :');
for (const k of catKeys) { const c = byCat[k]; log(`  ${k.padEnd(20)} ${String(c.n).padStart(3)} fichiers  ✅${c.miroir} 🟡/🟠${c.partiel} 🔴${c.manquant}  (${c.lines} l)`); }
log('');
log(`Axe B include/.h : ${hPresent}/${hTotal} miroir présent`);
log(`Axe C data/      : maps ${dataMaps} · scripts ${dataScripts} · layouts ${dataLayouts}`);
log(`Axe D graphics/  : ${gfxPng} png décomp · ~${ourPng} importés`);
log(`Axe E sound/     : ${soundAll} fichiers (harness)`);
log('');
log(`→ docs/FULL-1TO1-CHECKLIST.md  +  audit-reports/1to1/cartograph.json`);
log('═══════════════════════════════════════════════════════════════════════');

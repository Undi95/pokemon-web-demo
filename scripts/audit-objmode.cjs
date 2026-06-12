// Audit croisé objMode : décomp .c ↔ miroirs TS.
// Usage : node scripts/audit-objmode.cjs
// Sortie : rapport compact trié par risque (usages .c > 0 et 0 mention TS).
const fs = require('fs');
const path = require('path');

const DECOMP_SRC = 'D:/Projet 1/decomps/pokeemeraude/src';
const REPO = 'D:/Projet 1/pokemon-web-demo/src';
const GAME = path.join(REPO, 'game');

// ── 1. Où sont définis les gOamData ObjBlend/ObjWindow (pour résoudre les refs) ──
// On scanne tous les .c/.h de src/ décomp pour les DÉFINITIONS de gOamData_*.
const oamDefs = new Map(); // nom → { file, objMode }
function scanDir(dir, cb) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) scanDir(p, cb);
    else if (/\.(c|h)$/.test(e.name)) cb(p);
  }
}
scanDir(DECOMP_SRC, (p) => {
  const txt = fs.readFileSync(p, 'utf8');
  // Définitions : "const struct OamData gOamData_X = {" puis ".objMode = ST_OAM_OBJ_Y"
  const defRe = /struct OamData (\w+)\s*=\s*\{([^}]*)\}/g;
  let m;
  while ((m = defRe.exec(txt))) {
    const body = m[2];
    const om = /\.objMode\s*=\s*(ST_OAM_OBJ_\w+)/.exec(body);
    oamDefs.set(m[1], { file: path.relative(DECOMP_SRC, p), objMode: om ? om[1] : 'NORMAL(default)' });
  }
});

// ── 2. Par .c : assignations runtime + refs à des OamData Blend/Window ──
const rows = [];
for (const f of fs.readdirSync(DECOMP_SRC)) {
  if (!f.endsWith('.c')) continue;
  const txt = fs.readFileSync(path.join(DECOMP_SRC, f), 'utf8');
  const lines = txt.split('\n');
  const assigns = [];      // sprite->oam.objMode = X / gSprites[i].oam.objMode = X
  const blendTplRefs = new Set(); // noms de gOamData Blend/Window référencés
  lines.forEach((l, i) => {
    const a = /oam\.objMode\s*=\s*(\w+)/.exec(l);
    if (a) assigns.push(`${i + 1}:${a[1]}`);
    // refs à un OamData connu non-NORMAL
    const refs = l.match(/g?OamData_\w+/g);
    if (refs) {
      for (const r of refs) {
        const def = oamDefs.get(r);
        if (def && /BLEND|WINDOW/.test(def.objMode)) blendTplRefs.add(`${r}(${def.objMode.replace('ST_OAM_OBJ_', '')})`);
      }
    }
  });
  if (!assigns.length && !blendTplRefs.size) continue;

  // ── 3. Miroir TS correspondant ? ──
  const base = f.replace(/\.c$/, '');
  const tsPath = path.join(GAME, base + '.ts');
  let tsTotal = -1, tsSpriteLevel = 0, tsOamOnly = 0;
  if (fs.existsSync(tsPath)) {
    const ts = fs.readFileSync(tsPath, 'utf8');
    const tsLines = ts.split('\n').filter((l) => /objMode/.test(l));
    tsTotal = tsLines.length;
    for (const l of tsLines) {
      if (/oam\w*\.objMode|Oam\.objMode|oam\.objMode/i.test(l) && !/sprite|clone|sp\b|\bs\./i.test(l.split('objMode')[0])) tsOamOnly++;
      if (/(sprite|clone|sp|s)\s*(as[^)]*)?\)?\s*\.objMode\s*=/.test(l) || /\{\s*objMode\?/.test(l)) tsSpriteLevel++;
    }
  }
  rows.push({ c: f, assigns, tplRefs: [...blendTplRefs], tsTotal, tsSpriteLevel });
}

// ── 4. Rapport trié : risque = usages .c sans aucune mention TS ──
rows.sort((a, b) => {
  const ra = (a.tsTotal <= 0 ? 1000 : 0) + a.assigns.length + a.tplRefs.length;
  const rb = (b.tsTotal <= 0 ? 1000 : 0) + b.assigns.length + b.tplRefs.length;
  return rb - ra;
});
console.log('=== gOamData non-NORMAL définis (référence) ===');
for (const [name, d] of oamDefs) {
  if (/BLEND|WINDOW/.test(d.objMode)) console.log(`  ${name} = ${d.objMode}  (${d.file})`);
}
console.log('\n=== Par .c : usages objMode vs miroir TS ===');
console.log('légende : assigns = oam.objMode runtime (.c:ligne:valeur) | tpl = templates Blend/Window référencés');
console.log('          ts=-1 : pas de miroir src/game/<nom>.ts | ts:N total mentions objMode dans le miroir\n');
for (const r of rows) {
  const flag = r.tsTotal === -1 ? '⬜ pas-de-miroir' : r.tsTotal === 0 ? '🔴 MIROIR-SANS-OBJMODE' : '🟡 à-vérifier';
  console.log(`${flag} ${r.c}  ts:${r.tsTotal}`);
  if (r.assigns.length) console.log(`    assigns(${r.assigns.length}): ${r.assigns.join(' ')}`);
  if (r.tplRefs.length) console.log(`    tpl: ${r.tplRefs.join(' ')}`);
}

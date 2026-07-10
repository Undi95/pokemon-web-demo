/**
 * DEVTOOLS V2 — sidebar (mandat user 2026-07-10 : « plus beau, plus performant,
 * plus facile à utiliser, les MÊMES fonctions toi et moi, un truc ergonomique
 * qui me cache pas le jeu »).
 *
 * PRINCIPES :
 *  - GÉNÉRÉE DU REGISTRE (registry.ts) : chaque DevCommand devient bouton /
 *    mini-formulaire / grille ; chaque DevView une section live. Parité
 *    automatique avec la console (dev.cmd) — même handler, même chemin runCommand.
 *  - NE CACHE JAMAIS LE JEU : sidebar fixe à droite + padding-right sur <body>
 *    quand ouverte → le canvas (body flex centré, cf. index.html) se recentre
 *    dans l'espace restant, jamais recouvert (modèle « dock » Chrome DevTools).
 *  - PERF : UNE boucle rAF ; fermée = zéro travail ; ouverte = update() des vues
 *    de la SEULE catégorie active, throttlé ~7 Hz. Pas de re-render des commandes
 *    (DOM statique, rebuild uniquement sur registry-changed / changement d'onglet).
 *  - Résultats de commandes → drawer bas copiable (pas de fouille console).
 *  - 📷 Compare : snapshot du canvas dans une lightbox zoom pixel (aide la règle
 *    « code attendu vs écran », cf. mémoire feedback-ui-code-vs-screen).
 *
 * Toggle : F2 ou bouton flottant 🛠. Onglet actif persisté (localStorage).
 * Harness pur — aucun code 1:1 ici.
 */
import type { DecompRuntime } from '../runtime/decomp-runtime';
import { getRuntime } from '../runtime/decomp-globals';
import {
  DEV_CATEGORIES, getCommands, getViews, onRegistryChanged, runCommand,
  installRegistryConsoleFrontend,
  type DevCommand, type DevView,
} from './registry';
// Side-effects historiques montés par le panel v1 (archivé) — repris ici pour que
// __byteVm.* et dev.gfx.* restent posés au boot (le registre leur délègue).
import './dev-bytevm-tools';
import { installGfxTools } from './dev-gfx-tools';
import { registerAllDevtools } from './registrations';

const PANEL_ID = 'dv2-panel';
const PANEL_W = 344; // px — largeur sidebar (padding body suit)
const LS_TAB = 'dv2Tab';
const LS_OPEN = 'dv2Open';

let _visible = false;
let _activeTab = 'jeu';
let _lastUpdate = 0;
let _mountedViews: Array<{ view: DevView; el: HTMLElement }> = [];

function rt(): DecompRuntime | undefined {
  const g = globalThis as { __rt?: DecompRuntime };
  if (g.__rt) return g.__rt;
  try { return getRuntime(); } catch { return undefined; }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Montage (idempotent) ─────────────────────────────────────────────────────

export function mountDevtoolsV2(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PANEL_ID)) return;

  installRegistryConsoleFrontend();
  installGfxTools();      // dev.gfx.* console (délégué par la catégorie gfx)
  registerAllDevtools();  // remplit le registre (commandes + vues)

  injectStyles();
  buildShell();
  installKeybind();

  try { _activeTab = localStorage.getItem(LS_TAB) ?? 'jeu'; } catch { /* défensif */ }
  if (!DEV_CATEGORIES.some((c) => c.id === _activeTab)) _activeTab = 'jeu';
  renderTabs();
  renderBody();

  onRegistryChanged(() => { if (document.getElementById(PANEL_ID)) { renderTabs(); renderBody(); } });

  // Contrôleur console (parité : le panel lui-même est pilotable).
  (globalThis as Record<string, unknown>).__devtools = {
    open: () => setVisible(true),
    close: () => setVisible(false),
    toggle: () => setVisible(!_visible),
    tab: (id: string) => { setActiveTab(id); setVisible(true); },
  };

  // Réouverture persistée (confort : F5 garde la sidebar ouverte).
  let wasOpen = false;
  try { wasOpen = localStorage.getItem(LS_OPEN) === '1'; } catch { /* défensif */ }
  if (wasOpen) setVisible(true);

  requestAnimationFrame(loop);
}

function setVisible(v: boolean): void {
  _visible = v;
  const panel = document.getElementById(PANEL_ID);
  const fab = document.getElementById('dv2-fab');
  if (panel) panel.classList.toggle('dv2-hidden', !v);
  if (fab) fab.classList.toggle('dv2-fab-on', v);
  // Push layout : le body (flex centré) se recentre dans l'espace restant.
  document.body.style.paddingRight = v ? `${PANEL_W}px` : '';
  try { localStorage.setItem(LS_OPEN, v ? '1' : '0'); } catch { /* défensif */ }
  fitZoomToSpace();
  if (v) { renderLive(); updateViews(true); }
}

// ─── Fit-to-space : le canvas ne passe JAMAIS sous la sidebar ─────────────────
// Si le zoom courant déborde de l'espace restant, on descend au plus grand zoom
// ENTIER qui tient (pixel-perfect conservé, via window.setGameZoom de main.ts)
// et on RESTAURE le zoom d'origine à la fermeture — sauf si le user a changé le
// zoom topbar entre-temps (son choix explicite gagne).

let _savedZoom: number | null = null;
let _fitZoom: number | null = null;

function readZoom(canvas: HTMLCanvasElement): number {
  const dpr = window.devicePixelRatio || 1;
  const cssW = parseFloat(canvas.style.width) || canvas.getBoundingClientRect().width;
  return Math.max(1, Math.round((cssW * dpr) / 240)); // 240 = largeur GBA
}

function fitZoomToSpace(): void {
  const canvas = document.querySelector('#game canvas') as HTMLCanvasElement | null;
  const setZoom = (window as unknown as { setGameZoom?: (z: number) => void }).setGameZoom;
  if (!canvas || !setZoom) return;
  const dpr = window.devicePixelRatio || 1;
  const cur = readZoom(canvas);
  if (!_visible) {
    // Fermeture : restaure si c'est bien NOTRE zoom réduit qui est actif.
    if (_savedZoom != null && cur === _fitZoom) setZoom(_savedZoom);
    _savedZoom = null;
    _fitZoom = null;
    return;
  }
  const avail = window.innerWidth - PANEL_W - 12; // petite marge visuelle
  if ((240 * cur) / dpr <= avail) return; // ça tient déjà
  const fit = Math.max(1, Math.floor((avail * dpr) / 240));
  if (fit < cur) {
    if (_savedZoom == null) _savedZoom = cur;
    _fitZoom = fit;
    setZoom(fit);
  }
}

function installKeybind(): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'F2') { e.preventDefault(); setVisible(!_visible); }
  });
  // La fenêtre change de taille sidebar ouverte → re-fit (main.ts re-applique
  // d'abord son zoom courant sur 'resize', notre listener passe après).
  window.addEventListener('resize', () => { if (_visible) fitZoomToSpace(); });
}

// ─── Boucle unique (throttle ~7 Hz, uniquement si visible) ────────────────────

function loop(ts: number): void {
  if (_visible && ts - _lastUpdate > 140) {
    _lastUpdate = ts;
    renderLive();
    updateViews(false);
  }
  requestAnimationFrame(loop);
}

function renderLive(): void {
  const live = document.getElementById('dv2-live');
  if (!live) return;
  const r = rt();
  if (!r) { live.textContent = 'runtime : —'; return; }
  const fps = (globalThis as { __phaserGame?: { loop?: { actualFps?: number } } })
    .__phaserGame?.loop?.actualFps;
  const noclip = (globalThis as { __devNoclip?: boolean }).__devNoclip;
  live.textContent =
    `f:${r.gIntroFrameCounter} tasks:${r.GetTaskCount()} spr:${r.gSprites.filter(Boolean).length}`
    + ` fps:${fps != null ? Math.round(fps) : '?'}${r.paused ? ' ⏸' : ''}${noclip ? ' NOCLIP' : ''}`;
  const pb = document.querySelector('[data-dv2fc="pause"]');
  if (pb) pb.textContent = r.paused ? '▶' : '❚❚';
  markActiveSpeed();
}

function updateViews(force: boolean): void {
  for (const { view, el } of _mountedViews) {
    if (!view.update) continue;
    // Vue repliée (details fermé) = pas de travail.
    const det = el.closest('details');
    if (det && !det.open && !force) continue;
    try { view.update(el); } catch (e) { console.error(`[devtools v2] update '${view.id}'`, e); }
  }
}

// ─── Shell (header + frame controls + search + tabs + body + drawer) ─────────

function buildShell(): void {
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.className = 'dv2-hidden';
  panel.innerHTML = `
    <div class="dv2-head">
      <span class="dv2-ttl">🛠 DEVTOOLS</span>
      <span id="dv2-live" class="dv2-livetxt">—</span>
      <button id="dv2-close" class="dv2-x" title="Fermer (F2)">✕</button>
    </div>
    <div class="dv2-fc">
      <button data-dv2fc="pause" title="Pause / Play">❚❚</button>
      <button data-dv2fc="step1" title="Avancer 1 frame">⏭1</button>
      <button data-dv2fc="step8" title="Avancer 8 frames">⏭8</button>
      <span class="dv2-fcgrp">
        <button data-dv2spd="0.25" title="Vitesse ¼×">¼</button>
        <button data-dv2spd="0.5" title="Vitesse ½×">½</button>
        <button data-dv2spd="1" title="Vitesse normale">1×</button>
        <button data-dv2spd="2" title="Vitesse 2×">2×</button>
        <button data-dv2spd="4" title="Vitesse 4×">4×</button>
      </span>
      <button data-dv2fc="film" title="🎬 mosaïque 1 frame/15 pendant 2 s (dev.gfx.film)">🎬</button>
      <button data-dv2fc="shot" title="📷 snapshot du canvas → lightbox zoom pixel (comparer)">📷</button>
    </div>
    <input id="dv2-search" placeholder="🔍 filtrer les commandes… (Échap = vider)" autocomplete="off" spellcheck="false"/>
    <div id="dv2-tabs" class="dv2-tabs"></div>
    <div id="dv2-body" class="dv2-body"></div>
    <div id="dv2-drawer" class="dv2-drawer dv2-hidden">
      <div class="dv2-drawer-head">
        <span id="dv2-drawer-ttl">résultat</span>
        <button id="dv2-drawer-copy" title="Copier">⧉</button>
        <button id="dv2-drawer-x" title="Fermer">✕</button>
      </div>
      <pre id="dv2-drawer-txt"></pre>
    </div>`;
  document.body.appendChild(panel);

  const fab = document.createElement('div');
  fab.id = 'dv2-fab';
  fab.textContent = '🛠';
  fab.title = 'Devtools (F2)';
  fab.addEventListener('click', () => setVisible(!_visible));
  document.body.appendChild(fab);

  document.getElementById('dv2-close')?.addEventListener('click', () => setVisible(false));

  // Frame controls (pilotent le runtime en direct — mêmes leviers que dev.pause etc.)
  panel.querySelector('[data-dv2fc="pause"]')?.addEventListener('click', () => {
    const r = rt(); if (r) { r.paused = !r.paused; renderLive(); }
  });
  panel.querySelector('[data-dv2fc="step1"]')?.addEventListener('click', () => step(1));
  panel.querySelector('[data-dv2fc="step8"]')?.addEventListener('click', () => step(8));
  panel.querySelector('[data-dv2fc="film"]')?.addEventListener('click', () => {
    const dev = (globalThis as Record<string, unknown>).dev as { gfx?: { film?: (o: object) => void } } | undefined;
    dev?.gfx?.film?.({ every: 15, seconds: 2 });
  });
  panel.querySelector('[data-dv2fc="shot"]')?.addEventListener('click', () => openCompare());
  panel.querySelectorAll('[data-dv2spd]').forEach((b) => {
    b.addEventListener('click', () => {
      const r = rt(); if (!r) return;
      r.speedMultiplier = parseFloat((b as HTMLElement).dataset.dv2spd ?? '1');
      r.paused = false;
      markActiveSpeed();
    });
  });

  // Search : filtre live. Les touches ne doivent PAS piloter le jeu.
  const search = document.getElementById('dv2-search') as HTMLInputElement;
  search.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Escape') { search.value = ''; renderBody(); }
  });
  search.addEventListener('input', () => renderBody());
  // Global : aucun input/select/textarea de la sidebar ne pilote le jeu.
  panel.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') e.stopPropagation();
  });

  // Drawer
  document.getElementById('dv2-drawer-x')?.addEventListener('click', () => {
    document.getElementById('dv2-drawer')?.classList.add('dv2-hidden');
  });
  document.getElementById('dv2-drawer-copy')?.addEventListener('click', () => {
    const txt = document.getElementById('dv2-drawer-txt')?.textContent ?? '';
    navigator.clipboard?.writeText(txt).catch((e) => console.error('[devtools v2] clipboard', e));
  });
}

function step(n: number): void {
  const r = rt(); if (!r) return;
  r.paused = true;
  r.stepBudget += n;
  renderLive();
}

function markActiveSpeed(): void {
  const r = rt();
  const cur = r ? r.speedMultiplier : 1;
  document.querySelectorAll('[data-dv2spd]').forEach((b) => {
    const v = parseFloat((b as HTMLElement).dataset.dv2spd ?? '1');
    b.classList.toggle('dv2-on', Math.abs(v - cur) < 1e-6 && !(r?.paused));
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function renderTabs(): void {
  const host = document.getElementById('dv2-tabs');
  if (!host) return;
  host.innerHTML = DEV_CATEGORIES.map((c) => {
    const n = getCommands(c.id).filter((x) => !x.hidden).length + getViews(c.id).length;
    if (!n) return '';
    return `<button class="dv2-tab${c.id === _activeTab ? ' dv2-tab-on' : ''}" data-tab="${c.id}"
      title="${esc(c.label)}">${c.icon}<span>${esc(c.label)}</span></button>`;
  }).join('');
  host.querySelectorAll('[data-tab]').forEach((b) => {
    b.addEventListener('click', () => setActiveTab((b as HTMLElement).dataset.tab ?? 'jeu'));
  });
}

function setActiveTab(id: string): void {
  _activeTab = id;
  try { localStorage.setItem(LS_TAB, id); } catch { /* défensif */ }
  document.querySelectorAll('.dv2-tab').forEach((b) => {
    b.classList.toggle('dv2-tab-on', (b as HTMLElement).dataset.tab === id);
  });
  const search = document.getElementById('dv2-search') as HTMLInputElement | null;
  if (search) search.value = '';
  renderBody();
}

// ─── Body : vues + commandes de la catégorie active (ou résultats de recherche) ─

function renderBody(): void {
  const host = document.getElementById('dv2-body');
  if (!host) return;
  _mountedViews = [];
  host.innerHTML = '';

  const q = (document.getElementById('dv2-search') as HTMLInputElement | null)?.value.trim().toLowerCase() ?? '';
  if (q) {
    // Mode recherche : commandes de TOUTES les catégories, à plat.
    const hits = getCommands().filter((c) => !c.hidden
      && (c.id.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
        || (c.description ?? '').toLowerCase().includes(q)));
    if (!hits.length) { host.innerHTML = '<div class="dv2-na">aucune commande ne matche</div>'; return; }
    for (const cmd of hits) host.appendChild(commandEl(cmd, true));
    return;
  }

  for (const view of getViews(_activeTab)) {
    const det = document.createElement('details');
    det.className = 'dv2-view';
    if (!view.collapsed) det.open = true;
    const sum = document.createElement('summary');
    sum.textContent = view.label;
    if (view.description) sum.title = view.description;
    det.appendChild(sum);
    const body = document.createElement('div');
    det.appendChild(body);
    host.appendChild(det);
    try { view.mount(body); } catch (e) { console.error(`[devtools v2] mount '${view.id}'`, e); }
    _mountedViews.push({ view, el: body });
  }

  const cmds = getCommands(_activeTab).filter((c) => !c.hidden);
  if (cmds.length) {
    const wrap = document.createElement('div');
    wrap.className = 'dv2-cmds';
    for (const cmd of cmds) wrap.appendChild(commandEl(cmd, false));
    host.appendChild(wrap);
  }
  updateViews(true);
}

// ─── Rendu d'une commande ─────────────────────────────────────────────────────

function commandEl(cmd: DevCommand, showCat: boolean): HTMLElement {
  // 'grid' : 1 arg select rendu en grille de boutons (téléport, easy chat…).
  if (cmd.ui === 'grid' && cmd.args?.length === 1 && cmd.args[0].kind === 'select') {
    const arg = cmd.args[0];
    const box = document.createElement('div');
    box.className = 'dv2-gridcmd';
    box.innerHTML = `<div class="dv2-gridlbl" title="${esc(cmd.description ?? '')}">${esc(cmd.label)}`
      + `${showCat ? ` <span class="dv2-dim">${esc(cmd.category)}</span>` : ''}</div>`;
    const grid = document.createElement('div');
    grid.className = 'dv2-grid2';
    for (const opt of arg.options ?? []) {
      const b = document.createElement('button');
      b.textContent = opt.label;
      b.title = `dev.cmd('${cmd.id}', {${arg.name}: ${JSON.stringify(opt.value)}})`;
      b.addEventListener('click', () => execute(cmd, { [arg.name]: opt.value }, b));
      grid.appendChild(b);
    }
    box.appendChild(grid);
    return box;
  }

  const row = document.createElement('div');
  row.className = 'dv2-cmd';
  const btn = document.createElement('button');
  btn.className = `dv2-run${cmd.danger ? ' dv2-danger' : ''}`;
  btn.innerHTML = `${esc(cmd.label)}${showCat ? ` <span class="dv2-dim">${esc(cmd.category)}</span>` : ''}`;
  btn.title = `${cmd.description ?? ''}\ndev.cmd('${cmd.id}')`.trim();

  if (!cmd.args?.length) {
    btn.addEventListener('click', () => execute(cmd, {}, btn));
    row.appendChild(btn);
    return row;
  }

  // Mini-formulaire inline : label + inputs + ▶.
  const form = document.createElement('div');
  form.className = 'dv2-form';
  const inputs = new Map<string, HTMLInputElement | HTMLSelectElement>();
  for (const a of cmd.args) {
    if (a.kind === 'select') {
      const sel = document.createElement('select');
      sel.title = a.label ?? a.name;
      for (const opt of a.options ?? []) {
        const o = document.createElement('option');
        o.value = String(opt.value);
        o.textContent = opt.label;
        if (a.default !== undefined && String(a.default) === String(opt.value)) o.selected = true;
        sel.appendChild(o);
      }
      inputs.set(a.name, sel);
      form.appendChild(sel);
    } else if (a.kind === 'boolean') {
      const lbl = document.createElement('label');
      lbl.className = 'dv2-check';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = a.default === true;
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(a.label ?? a.name));
      inputs.set(a.name, cb);
      form.appendChild(lbl);
    } else {
      const inp = document.createElement('input');
      inp.placeholder = a.placeholder ?? `${a.label ?? a.name}${a.default !== undefined ? ` (${a.default})` : ''}`;
      inp.title = a.label ?? a.name;
      if (a.kind === 'number') inp.inputMode = 'numeric';
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click(); });
      inputs.set(a.name, inp);
      form.appendChild(inp);
    }
  }
  const go = document.createElement('button');
  go.className = `dv2-go${cmd.danger ? ' dv2-danger' : ''}`;
  go.textContent = '▶';
  go.title = btn.title;
  go.addEventListener('click', () => {
    const args: Record<string, unknown> = {};
    for (const [name, el] of inputs) {
      args[name] = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.value;
    }
    execute(cmd, args, go);
  });
  form.appendChild(go);

  btn.classList.add('dv2-lbl');
  row.appendChild(btn);
  row.appendChild(form);
  // Le label d'une commande à args ne lance rien : il affiche la fiche.
  btn.addEventListener('click', () => showResult(cmd.id, helpText(cmd), false));
  return row;
}

function helpText(cmd: DevCommand): string {
  const sig = (cmd.args ?? []).map((a) => `${a.name}: ${a.kind}`).join(', ');
  return `${cmd.id}(${sig})\n${cmd.description ?? ''}\nconsole : dev.cmd('${cmd.id}', {…})`;
}

async function execute(cmd: DevCommand, args: Record<string, unknown>, btn: HTMLElement): Promise<void> {
  if (cmd.danger && !window.confirm(`⚠ ${cmd.label} — confirmer ?`)) return;
  btn.classList.add('dv2-busy');
  const res = await runCommand(cmd.id, args);
  btn.classList.remove('dv2-busy');
  btn.classList.add(res.ok ? 'dv2-ok' : 'dv2-err');
  setTimeout(() => btn.classList.remove('dv2-ok', 'dv2-err'), 700);
  if (!res.ok) showResult(cmd.id, res.error ?? 'erreur', true);
  else if (res.value !== undefined) {
    const txt = typeof res.value === 'string' ? res.value : JSON.stringify(res.value, null, 2);
    showResult(cmd.id, txt, false);
  }
}

function showResult(title: string, text: string, isError: boolean): void {
  const drawer = document.getElementById('dv2-drawer');
  const ttl = document.getElementById('dv2-drawer-ttl');
  const pre = document.getElementById('dv2-drawer-txt');
  if (!drawer || !ttl || !pre) return;
  ttl.textContent = title;
  ttl.className = isError ? 'dv2-errtxt' : '';
  pre.textContent = text;
  drawer.classList.remove('dv2-hidden');
}

// ─── 📷 Compare : snapshot canvas → lightbox zoom pixel ───────────────────────

function openCompare(): void {
  const canvas = document.querySelector('#game canvas') as HTMLCanvasElement | null;
  if (!canvas) { showResult('📷', 'canvas introuvable', true); return; }
  let url = '';
  try { url = canvas.toDataURL('image/png'); } catch (e) { showResult('📷', String(e), true); return; }

  const old = document.getElementById('dv2-lightbox');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = 'dv2-lightbox';
  box.innerHTML = `
    <div class="dv2-lb-bar">
      <span>📷 snapshot — molette/boutons = zoom pixel, clic fond = fermer</span>
      <button data-z="-">−</button><span id="dv2-lb-z">2×</span><button data-z="+">+</button>
      <a href="${url}" download="snapshot.png"><button>⬇ PNG</button></a>
      <button data-z="x">✕</button>
    </div>
    <div class="dv2-lb-scroll"><img id="dv2-lb-img" src="${url}" alt="snapshot"/></div>`;
  document.body.appendChild(box);

  let zoom = 2;
  const img = box.querySelector('#dv2-lb-img') as HTMLImageElement;
  const zlbl = box.querySelector('#dv2-lb-z') as HTMLElement;
  const apply = (): void => {
    img.style.width = `${canvas.width * zoom}px`;
    zlbl.textContent = `${zoom}×`;
  };
  img.addEventListener('load', apply);
  apply();
  box.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === box || t.classList.contains('dv2-lb-scroll')) { box.remove(); return; }
    const z = t.dataset.z;
    if (z === '+') { zoom = Math.min(12, zoom + 1); apply(); }
    else if (z === '-') { zoom = Math.max(1, zoom - 1); apply(); }
    else if (z === 'x') box.remove();
  });
  box.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom = Math.max(1, Math.min(12, zoom + (e.deltaY < 0 ? 1 : -1)));
    apply();
  }, { passive: false });
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('dv2-style')) return;
  const st = document.createElement('style');
  st.id = 'dv2-style';
  st.textContent = `
body{transition:padding-right .18s ease}
#${PANEL_ID}{position:fixed;top:0;right:0;bottom:0;width:${PANEL_W}px;display:flex;flex-direction:column;
  z-index:2147483000;background:#0d1117;color:#cdd9e5;font:11px/1.4 ui-monospace,Menlo,Consolas,monospace;
  border-left:1px solid #1f2a37;box-shadow:-6px 0 22px rgba(0,0,0,.45)}
#${PANEL_ID}.dv2-hidden{display:none}
#${PANEL_ID} .dv2-head{display:flex;align-items:center;gap:6px;padding:7px 9px 6px;
  border-bottom:1px solid #1f2a37;background:linear-gradient(#101826,#0d1117)}
#${PANEL_ID} .dv2-ttl{font-weight:700;color:#3ddc97;letter-spacing:.03em;white-space:nowrap}
#${PANEL_ID} .dv2-livetxt{flex:1;color:#8b9cb3;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .dv2-x{background:transparent;color:#8b9cb3;border:0;cursor:pointer;font-size:12px;padding:2px 5px}
#${PANEL_ID} .dv2-x:hover{color:#fff}
#${PANEL_ID} button{background:#18202c;color:#cdd9e5;border:1px solid #2a3646;border-radius:5px;
  cursor:pointer;padding:3px 7px;font:inherit;transition:background .1s,border-color .1s}
#${PANEL_ID} button:hover{background:#223048;border-color:#3ddc9766}
#${PANEL_ID} button.dv2-on{background:#0f3d2e;border-color:#3ddc97;color:#a7f3d0}
#${PANEL_ID} button.dv2-ok{border-color:#3ddc97;background:#0f3d2e}
#${PANEL_ID} button.dv2-err{border-color:#f47067;background:#3d1512}
#${PANEL_ID} button.dv2-busy{opacity:.5;pointer-events:none}
#${PANEL_ID} button.dv2-danger{border-color:#7d2b26;color:#ffb3ad}
#${PANEL_ID} button.dv2-danger:hover{background:#3d1512;border-color:#f47067}
#${PANEL_ID} .dv2-fc{display:flex;align-items:center;gap:4px;flex-wrap:wrap;padding:6px 9px;border-bottom:1px solid #1f2a37}
#${PANEL_ID} .dv2-fcgrp{display:inline-flex;gap:0}
#${PANEL_ID} .dv2-fcgrp button{border-radius:0;border-right-width:0}
#${PANEL_ID} .dv2-fcgrp button:first-child{border-radius:5px 0 0 5px}
#${PANEL_ID} .dv2-fcgrp button:last-child{border-radius:0 5px 5px 0;border-right-width:1px}
#dv2-search{margin:6px 9px 0;padding:4px 8px;background:#0a0e14;color:#cdd9e5;border:1px solid #2a3646;
  border-radius:6px;font:inherit;outline:none}
#dv2-search:focus{border-color:#3ddc97}
#${PANEL_ID} .dv2-tabs{display:flex;gap:2px;padding:6px 9px 0;flex-wrap:wrap}
#${PANEL_ID} .dv2-tab{display:inline-flex;align-items:center;gap:4px;border-radius:6px 6px 0 0;
  border-bottom:2px solid transparent;background:transparent;border-color:transparent;padding:4px 7px;color:#8b9cb3}
#${PANEL_ID} .dv2-tab span{font-size:10px}
#${PANEL_ID} .dv2-tab:hover{background:#18202c;color:#cdd9e5}
#${PANEL_ID} .dv2-tab.dv2-tab-on{color:#3ddc97;border-bottom-color:#3ddc97;background:#121a26}
#${PANEL_ID} .dv2-body{flex:1;overflow-y:auto;padding:8px 9px 10px;scrollbar-width:thin;scrollbar-color:#2a3646 transparent}
#${PANEL_ID} .dv2-cmds{display:flex;flex-direction:column;gap:5px;margin-top:6px}
#${PANEL_ID} .dv2-cmd{display:flex;flex-direction:column;gap:3px}
#${PANEL_ID} .dv2-run{width:100%;text-align:left;padding:5px 8px}
#${PANEL_ID} .dv2-lbl{background:transparent;border-color:transparent;color:#9fb3c8;padding:2px 2px 0;cursor:help}
#${PANEL_ID} .dv2-lbl:hover{background:transparent;border-color:transparent;color:#cdd9e5}
#${PANEL_ID} .dv2-form{display:flex;gap:4px;align-items:center}
#${PANEL_ID} .dv2-form input:not([type=checkbox]),#${PANEL_ID} .dv2-form select{flex:1;min-width:0;
  background:#0a0e14;color:#cdd9e5;border:1px solid #2a3646;border-radius:5px;padding:3px 6px;font:inherit;outline:none}
#${PANEL_ID} .dv2-form input:focus,#${PANEL_ID} .dv2-form select:focus{border-color:#3ddc97}
#${PANEL_ID} .dv2-check{display:inline-flex;align-items:center;gap:4px;color:#9fb3c8;white-space:nowrap}
#${PANEL_ID} .dv2-go{flex:0 0 auto;padding:3px 10px;color:#a7f3d0}
#${PANEL_ID} .dv2-gridcmd{margin-top:6px}
#${PANEL_ID} .dv2-gridlbl{color:#9fb3c8;margin-bottom:4px}
#${PANEL_ID} .dv2-grid2{display:grid;grid-template-columns:1fr 1fr;gap:4px}
#${PANEL_ID} .dv2-grid2 button{text-align:left;padding:4px 6px;font-size:10px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .dv2-view{border:1px solid #1f2a37;border-radius:6px;margin-bottom:6px;background:#0f151d}
#${PANEL_ID} .dv2-view>summary{cursor:pointer;padding:5px 8px;user-select:none;color:#9fb3c8;font-weight:600}
#${PANEL_ID} .dv2-view>summary:hover{color:#cdd9e5}
#${PANEL_ID} .dv2-view>div{padding:4px 8px 8px}
#${PANEL_ID} .dv2-dim{color:#647587}
#${PANEL_ID} .dv2-na{color:#8b9cb3;padding:8px}
#${PANEL_ID} .dv2-drawer{border-top:1px solid #1f2a37;background:#0a0e14;max-height:32vh;display:flex;flex-direction:column}
#${PANEL_ID} .dv2-drawer.dv2-hidden{display:none}
#${PANEL_ID} .dv2-drawer-head{display:flex;align-items:center;gap:6px;padding:4px 9px;color:#3ddc97}
#${PANEL_ID} .dv2-drawer-head span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .dv2-drawer-head .dv2-errtxt{color:#f47067}
#${PANEL_ID} .dv2-drawer pre{margin:0;padding:2px 9px 8px;overflow:auto;font-size:10px;color:#cdd9e5;
  white-space:pre-wrap;word-break:break-word}
#${PANEL_ID} .dv2-tbl{width:100%;border-collapse:collapse;font-size:10px}
#${PANEL_ID} .dv2-tbl th{color:#647587;text-align:left;font-weight:600;border-bottom:1px solid #1f2a37;padding:1px 3px}
#${PANEL_ID} .dv2-tbl td{padding:1px 3px;border-bottom:1px solid #141c26;white-space:nowrap}
#${PANEL_ID} .dv2-row{cursor:pointer}
#${PANEL_ID} .dv2-row:hover{background:#18202c}
#${PANEL_ID} .dv2-row.dv2-sel{background:#0f3d2e;outline:1px solid #3ddc97}
#${PANEL_ID} .dv2-row.dv2-mute td{color:#4d5b6b}
#${PANEL_ID} .dv2-palgrid{display:grid;grid-template-columns:repeat(16,1fr);gap:1px;width:100%}
#${PANEL_ID} .dv2-palcell{aspect-ratio:1;border:.5px solid rgba(0,0,0,.4)}
#${PANEL_ID} .dv2-kv{margin:2px 0}
#${PANEL_ID} .dv2-kv b{color:#a7f3d0;font-weight:600}
#dv2-fab{position:fixed;bottom:10px;right:10px;z-index:2147482999;width:34px;height:34px;border-radius:50%;
  background:#0d1117;border:1px solid #2a3646;color:#3ddc97;font-size:16px;display:flex;align-items:center;
  justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5);user-select:none}
#dv2-fab:hover{background:#18202c;border-color:#3ddc97}
#dv2-fab.dv2-fab-on{background:#0f3d2e;border-color:#3ddc97}
#dv2-hl{position:fixed;z-index:2147482998;border:1.5px solid #ffe23a;
  box-shadow:0 0 0 1px rgba(0,0,0,.6),0 0 8px #ffe23a;pointer-events:none;display:none;border-radius:1px}
#dv2-lightbox{position:fixed;inset:0;z-index:2147483100;background:rgba(4,6,10,.88);display:flex;
  flex-direction:column;font:11px ui-monospace,Menlo,Consolas,monospace;color:#cdd9e5}
#dv2-lightbox .dv2-lb-bar{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#0d1117;
  border-bottom:1px solid #1f2a37}
#dv2-lightbox .dv2-lb-bar span{color:#8b9cb3}
#dv2-lightbox button{background:#18202c;color:#cdd9e5;border:1px solid #2a3646;border-radius:5px;
  cursor:pointer;padding:3px 9px;font:inherit}
#dv2-lightbox button:hover{border-color:#3ddc97}
#dv2-lightbox .dv2-lb-scroll{flex:1;overflow:auto;display:grid;place-items:center;padding:16px}
#dv2-lightbox img{image-rendering:pixelated;image-rendering:crisp-edges;background:#000;
  box-shadow:0 4px 30px rgba(0,0,0,.7)}`;
  document.head.appendChild(st);
}

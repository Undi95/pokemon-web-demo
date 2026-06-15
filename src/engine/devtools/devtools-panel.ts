/**
 * DEVTOOLS A/B — panneau visuel overlay (DOM) pour le port web d'Émeraude.
 *
 * BUT : rendre TRIVIAL le A/B « ce que notre code rend » vs « ce que la ROM rend »,
 * et repérer vite les bugs (visuel, palette, sprites, BG, audio).
 *
 * PRINCIPE : lit l'état LIVE via `globalThis.__rt` (le DecompRuntime) — JAMAIS via
 * import() dynamique (instance Vite fraîche ≠ runtime, piège connu). Pur observateur :
 * NE MODIFIE l'état que via les leviers devtools déjà prévus côté runtime
 * (`rt.paused` / `rt.stepBudget` / `rt.speedMultiplier`, cf. decomp-runtime.tickFixed)
 * et le harness de combat exposé (`globalThis.__decompBattleLoop`).
 *
 * NE TOUCHE PAS l'infra BGM/SE : l'audio est OBSERVÉ seulement (getCurrentSongId en
 * lecture + un wrap passthrough RÉVERSIBLE de globalThis.__PlaySE pour journaliser
 * les SE — il rappelle l'original, zéro changement de son).
 *
 * Toggle : touche F2 ou bouton flottant 🛠. Sections repliables (<details>).
 *
 * Sections :
 *   1. Header live      — frame / tasks / sprites / fps / [PAUSED] (absorbe l'overlay texte).
 *   2. Frame control    — ❚❚/▶ · ⏭1 · ⏭8 · vitesse 1×/½×/¼×/.1× (slow-mo).
 *   3. Palettes         — grilles 16×16 OBJ + BG, couleurs RÉELLEMENT rendues (getObjRgba/getBgRgba).
 *   4. Sprites / OAM    — table des sprites actifs (valeurs OAM = vérité rendue) + highlight au clic.
 *   5. BG / Blend / Win — config des 4 BG + blend (BLDCNT/BLDY) + fenêtres.
 *   6. Battle state     — inBattle, CB2, anim attacker/target, opcodes récents.
 *   7. Audio            — BGM courant + SE-playing/cry + journal SE (best-effort, observe-only).
 *   8. Scénarios        — refresh, combat sauvage / rival (refresh PUIS autoboot), move-anim.
 */
import type { DecompRuntime } from '../system/decomp-runtime';
import { getCurrentSongId, getRuntime } from '../system/decomp-globals';

// ─── Accès runtime (live, jamais via import dynamique) ────────────────────────

type GlobalProbe = {
  __rt?: DecompRuntime;
  __devNoclip?: boolean;
  __PlaySE?: ((id: number) => void) & { __dvtWrapped?: boolean; __dvtOrig?: (id: number) => void };
  __decompGlobals?: { IsSEPlaying?: () => boolean; IsCryPlaying?: () => boolean };
  __decompBattleLoop?: {
    harnessSetupParties?: (...a: unknown[]) => Promise<boolean>;
    bootDecompBattleLoop?: (returnToOverworld?: boolean) => void;
    harnessBootRivalBattle1?: () => Promise<void>;
    getRecentOpcodes?: () => unknown;
  };
  __battleAnimInterpreter?: { getAttacker?: () => number; getTarget?: () => number };
  __testMoveAnim?: (moveId: string | number) => void;
  __gObjectEvents?: Array<{ currentCoordsX?: number; currentCoordsY?: number } | undefined>;
  gSaveBlock1Ptr?: { pos: { x: number; y: number } };
  __devGotoMap?: (mapId: string, x: number, y: number) => void;
};

function g(): GlobalProbe { return globalThis as unknown as GlobalProbe; }

function rt(): DecompRuntime | undefined {
  const gg = g();
  if (gg.__rt) return gg.__rt;
  try { return getRuntime(); } catch { return undefined; }
}

// ─── Petits helpers de format ─────────────────────────────────────────────────

function hex(n: number, pad = 2): string {
  return (n < 0 ? (n >>> 0) : n).toString(16).toUpperCase().padStart(pad, '0');
}
/** Reconstitue le RGB15 exact depuis le RGBA888 (la décode est ×8 sans perte → r5 = r8>>3). */
function rgb15FromRgba(r: number, gC: number, b: number): number {
  return ((r >> 3) & 0x1F) | (((gC >> 3) & 0x1F) << 5) | (((b >> 3) & 0x1F) << 10);
}
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Tailles OBJ : [shape][size] → [tilesW, tilesH]
const OAM_SIZES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[1, 1], [2, 2], [4, 4], [8, 8]], // square
  [[2, 1], [4, 1], [4, 2], [8, 4]], // wide
  [[1, 2], [1, 4], [2, 4], [4, 8]], // tall
];

// ─── État du panneau ──────────────────────────────────────────────────────────

let _visible = false;
let _showObj = true;
let _showBg = true;
let _visiblesOnly = true;
let _selectedSpriteId: number | null = null;
let _lastRender = 0;
const _seLog: Array<{ id: number; n: number }> = [];

const PANEL_ID = 'dvt-panel';

// ─── Téléport : villes avec Pokémon Center (déplacement rapide A/B) ────────────
// Coords = tuile de la porte du PC (warp_event dest=MAP_*_POKEMON_CENTER_1F, extraites
// des map.json de la décomp via scripts/extract-pc-warps.py). On spawn 1 tuile au SUD
// (devant l'entrée) → `__devGotoMap(id, pcx, pcy + 1)`. Ordre = progression du jeu.
// Littleroot n'a pas de PC (labo/maisons) → absent.
const TELEPORT_TOWNS: ReadonlyArray<{ name: string; id: string; pcx: number; pcy: number }> = [
  { name: 'Oldale',     id: 'MAP_OLDALE_TOWN',     pcx: 6,  pcy: 16 },
  { name: 'Petalburg',  id: 'MAP_PETALBURG_CITY',  pcx: 20, pcy: 16 },
  { name: 'Rustboro',   id: 'MAP_RUSTBORO_CITY',   pcx: 16, pcy: 38 },
  { name: 'Dewford',    id: 'MAP_DEWFORD_TOWN',    pcx: 2,  pcy: 10 },
  { name: 'Slateport',  id: 'MAP_SLATEPORT_CITY',  pcx: 19, pcy: 19 },
  { name: 'Mauville',   id: 'MAP_MAUVILLE_CITY',   pcx: 22, pcy: 5  },
  { name: 'Verdanturf', id: 'MAP_VERDANTURF_TOWN', pcx: 16, pcy: 3  },
  { name: 'Fallarbor',  id: 'MAP_FALLARBOR_TOWN',  pcx: 14, pcy: 7  },
  { name: 'Lavaridge',  id: 'MAP_LAVARIDGE_TOWN',  pcx: 9,  pcy: 6  },
  { name: 'Fortree',    id: 'MAP_FORTREE_CITY',    pcx: 5,  pcy: 6  },
  { name: 'Lilycove',   id: 'MAP_LILYCOVE_CITY',   pcx: 24, pcy: 14 },
  { name: 'Mossdeep',   id: 'MAP_MOSSDEEP_CITY',   pcx: 28, pcy: 16 },
  { name: 'Sootopolis', id: 'MAP_SOOTOPOLIS_CITY', pcx: 43, pcy: 31 },
  { name: 'Pacifidlog', id: 'MAP_PACIFIDLOG_TOWN', pcx: 8,  pcy: 15 },
  { name: 'Ever Grande',id: 'MAP_EVER_GRANDE_CITY',pcx: 27, pcy: 48 },
];

// ─── Montage (idempotent) ─────────────────────────────────────────────────────

export function mountDevtoolsPanel(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(PANEL_ID)) return;

  injectStyles();
  buildDom();
  wireControls();
  wireAudioMonitor();
  installKeybind();
  resumeAutobootIfPending();

  // Expose un petit contrôleur pratique.
  (globalThis as Record<string, unknown>).__devtools = {
    open: () => setVisible(true),
    close: () => setVisible(false),
    toggle: () => setVisible(!_visible),
  };

  requestAnimationFrame(loop);
}

function setVisible(v: boolean): void {
  _visible = v;
  const panel = document.getElementById(PANEL_ID);
  const fab = document.getElementById('dvt-fab');
  if (panel) panel.classList.toggle('dvt-hidden', !v);
  if (fab) fab.classList.toggle('dvt-fab-on', v);
  if (!v) clearHighlight();
  if (v) render(true);
}

function installKeybind(): void {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'F2') { e.preventDefault(); setVisible(!_visible); }
  });
}

// ─── Boucle de rafraîchissement (throttle ~7 Hz) ──────────────────────────────

function loop(ts: number): void {
  if (_visible && ts - _lastRender > 140) {
    _lastRender = ts;
    render(false);
  }
  updateHighlight(); // suivi du sprite sélectionné, même hors throttle (fluide)
  requestAnimationFrame(loop);
}

function render(force: boolean): void {
  try { renderLive(); } catch { /* défensif */ }
  try { renderPalettes(); } catch { /* défensif */ }
  try { renderSprites(); } catch { /* défensif */ }
  try { renderBg(); } catch { /* défensif */ }
  try { renderBattle(); } catch { /* défensif */ }
  try { renderAudio(); } catch { /* défensif */ }
  void force;
}

// ─── 1. Header live ───────────────────────────────────────────────────────────

function renderLive(): void {
  const live = document.getElementById('dvt-live');
  if (!live) return;
  const r = rt();
  if (!r) { live.textContent = 'runtime: —'; return; }
  const fps = (globalThis as { __phaserGame?: { loop?: { actualFps?: number } } })
    .__phaserGame?.loop?.actualFps;
  const tags = `${r.paused ? ' ⏸PAUSE' : ''}${g().__devNoclip ? ' NOCLIP' : ''}`;
  live.textContent =
    `f:${r.gIntroFrameCounter} tasks:${r.gTasks.size} spr:${r.gSprites.size}`
    + ` fps:${fps != null ? Math.round(fps) : '?'}${tags}`;
  // bouton pause reflète l'état
  const pb = document.querySelector('[data-fc="pause"]');
  if (pb) pb.textContent = r.paused ? '▶' : '❚❚';
}

// ─── 3. Palettes (couleurs réellement rendues) ────────────────────────────────

function renderPalettes(): void {
  const host = document.getElementById('dvt-pal');
  if (!host) return;
  const r = rt();
  if (!r) { host.innerHTML = '<div class="dvt-na">runtime indisponible</div>'; return; }
  const pal = r.gba.palette;
  let html = '';
  if (_showObj) html += paletteGrid('OBJ', (bank, idx) => pal.getObjRgba(bank, idx, 0));
  if (_showBg) html += paletteGrid('BG', (bank, idx) => pal.getBgRgba(bank, idx, 0));
  host.innerHTML = html || '<div class="dvt-na">(rien sélectionné)</div>';
}

function paletteGrid(
  label: string,
  get: (bank: number, idx: number) => readonly [number, number, number, number],
): string {
  let cells = '';
  for (let bank = 0; bank < 16; bank++) {
    for (let idx = 0; idx < 16; idx++) {
      const [r, gc, b] = get(bank, idx);
      const rgb15 = rgb15FromRgba(r, gc, b);
      const title = `${label} bank ${bank} idx ${idx} — #${hex(rgb15, 4)} rgb(${r},${gc},${b})`;
      cells += `<div class="dvt-cell" style="background:rgb(${r},${gc},${b})" title="${title}"></div>`;
    }
  }
  return `<div class="dvt-pal-label">${label} <span class="dvt-dim">(16 banks × 16)</span></div>`
    + `<div class="dvt-grid">${cells}</div>`;
}

// ─── 4. Sprites / OAM ─────────────────────────────────────────────────────────

function renderSprites(): void {
  const host = document.getElementById('dvt-spr');
  if (!host) return;
  const r = rt();
  if (!r) { host.innerHTML = '<div class="dvt-na">runtime indisponible</div>'; return; }

  const rows: string[] = [];
  const ids = [...r.gSprites.keys()].sort((a, b) => a - b);
  let shown = 0;
  for (const id of ids) {
    const s = r.gSprites.get(id);
    if (!s) continue;
    const oam = r.gba.oam[s.oamIndex];
    const renderedVisible = !!oam && oam.visible && !s.invisible && s.inUse;
    if (_visiblesOnly && !renderedVisible) continue;
    shown++;
    const x = oam ? oam.x : Math.round(s.x + s.x2);
    const y = oam ? oam.y : Math.round(s.y + s.y2);
    const tile = oam ? oam.tileId : 0;
    const palB = oam ? oam.paletteBank : 0;
    const prio = oam ? oam.priority : 0;
    const objMode = oam ? oam.objMode : 0;
    const aff = oam ? oam.affineMode : 0;
    const cb = (s.callback && s.callback.name) ? s.callback.name : '—';
    const sel = id === _selectedSpriteId ? ' dvt-sel' : '';
    const dim = renderedVisible ? '' : ' dvt-dim';
    rows.push(
      `<tr class="dvt-row${sel}${dim}" data-sid="${id}">`
      + `<td>${id}</td><td>${x},${y}</td><td>${tile}</td><td>${palB}</td>`
      + `<td>${prio}${objMode ? '/' + objMode : ''}${aff ? 'A' + aff : ''}</td>`
      + `<td>${s.animNum}</td><td class="dvt-cb" title="${esc(cb)}">${esc(cb)}</td></tr>`,
    );
  }
  const head = `<div class="dvt-dim">${shown} affiché(s) / ${ids.length} total — clic = surligner</div>`;
  host.innerHTML = head
    + '<table class="dvt-tbl"><thead><tr>'
    + '<th>id</th><th>x,y</th><th>tile</th><th>pal</th><th>pr/m</th><th>anim</th><th>cb</th>'
    + '</tr></thead><tbody>' + rows.join('') + '</tbody></table>';
}

// ─── Highlight d'un sprite sur le canvas ──────────────────────────────────────

function gameCanvas(): HTMLCanvasElement | null {
  const host = document.getElementById('game');
  return (host?.querySelector('canvas') ?? document.querySelector('#game canvas')) as HTMLCanvasElement | null;
}

function updateHighlight(): void {
  const hl = document.getElementById('dvt-hl');
  if (!hl) return;
  if (_selectedSpriteId == null || !_visible) { hl.style.display = 'none'; return; }
  const r = rt();
  const s = r?.gSprites.get(_selectedSpriteId);
  const canvas = gameCanvas();
  if (!r || !s || !canvas) { hl.style.display = 'none'; return; }
  const oam = r.gba.oam[s.oamIndex];
  if (!oam) { hl.style.display = 'none'; return; }
  const [tw, th] = OAM_SIZES[oam.shape]?.[oam.size] ?? [1, 1];
  const rect = canvas.getBoundingClientRect();
  const sx = rect.width / 240, sy = rect.height / 160; // résolution interne GBA 240×160
  hl.style.display = 'block';
  hl.style.left = `${rect.left + oam.x * sx}px`;
  hl.style.top = `${rect.top + oam.y * sy}px`;
  hl.style.width = `${tw * 8 * sx}px`;
  hl.style.height = `${th * 8 * sy}px`;
}

function clearHighlight(): void {
  _selectedSpriteId = null;
  const hl = document.getElementById('dvt-hl');
  if (hl) hl.style.display = 'none';
}

// ─── 5. BG / Blend / Window ───────────────────────────────────────────────────

function renderBg(): void {
  const host = document.getElementById('dvt-bg');
  if (!host) return;
  const r = rt();
  if (!r) { host.innerHTML = '<div class="dvt-na">runtime indisponible</div>'; return; }
  const rows: string[] = [];
  for (let i = 0; i < 4; i++) {
    try {
      const c = r.gba.bg(i as 0 | 1 | 2 | 3).config as unknown as Record<string, unknown>;
      const vis = c.visible ? '●' : '○';
      const num = (k: string): string => (typeof c[k] === 'number' ? String(c[k]) : '—');
      rows.push(
        `<tr><td>BG${i} ${vis}</td><td>pr ${num('priority')}</td>`
        + `<td>char ${num('charBaseIndex')}</td><td>map ${num('mapBaseIndex')}</td>`
        + `<td>sz ${num('screenSize')}</td><td>${c.paletteMode ? '8bpp' : '4bpp'}</td></tr>`,
      );
    } catch { /* défensif */ }
  }
  // Blend (BLDCNT / BLDY) — clé pour le « fade noir » (#5).
  let blendHtml = '<div class="dvt-na">blend: N/A</div>';
  try {
    const bl = (r.gba as unknown as { blend?: Record<string, number> }).blend;
    if (bl) {
      const modeName = ['off', 'alpha', 'lighten', 'darken'][bl.mode ?? 0] ?? '?';
      blendHtml = `<div class="dvt-kv"><b>Blend</b> mode=<b>${modeName}</b> `
        + `t1=${hex(bl.target1 ?? 0)} t2=${hex(bl.target2 ?? 0)} `
        + `α1=${bl.alpha1 ?? 0} α2=${bl.alpha2 ?? 0} bright=${bl.brightness ?? 0}</div>`;
    }
  } catch { /* défensif */ }
  // Windows
  let winHtml = '';
  try {
    const w = (r.gba as unknown as { windows?: { win0?: { enabled?: boolean }; win1?: { enabled?: boolean }; obj?: { enabled?: boolean } } }).windows;
    if (w) {
      winHtml = `<div class="dvt-kv"><b>Win</b> w0=${w.win0?.enabled ? 'on' : 'off'} `
        + `w1=${w.win1?.enabled ? 'on' : 'off'} obj=${w.obj?.enabled ? 'on' : 'off'}</div>`;
    }
  } catch { /* défensif */ }
  host.innerHTML = '<table class="dvt-tbl">' + rows.join('') + '</table>' + blendHtml + winHtml;
}

// ─── 6. Battle state ──────────────────────────────────────────────────────────

function renderBattle(): void {
  const host = document.getElementById('dvt-bat');
  if (!host) return;
  const r = rt();
  if (!r) { host.innerHTML = '<div class="dvt-na">runtime indisponible</div>'; return; }
  const inB = !!(r.gMain as unknown as { inBattle?: boolean }).inBattle;
  const cb2 = (r.gMain as unknown as { callback2?: { name?: string } }).callback2?.name ?? '—';
  const lines: string[] = [];
  lines.push(`<div class="dvt-kv">inBattle=<b>${inB}</b> · CB2=<b>${esc(cb2)}</b></div>`);
  try {
    const ai = g().__battleAnimInterpreter;
    if (ai?.getAttacker || ai?.getTarget) {
      lines.push(`<div class="dvt-kv">anim atk=${ai.getAttacker?.() ?? '—'} tgt=${ai.getTarget?.() ?? '—'}</div>`);
    }
  } catch { /* défensif */ }
  try {
    const ops = g().__decompBattleLoop?.getRecentOpcodes?.();
    if (ops != null) {
      const txt = Array.isArray(ops) ? ops.slice(-8).map(String).join(' ') : String(ops);
      lines.push(`<div class="dvt-kv dvt-dim">opcodes: ${esc(txt).slice(0, 200)}</div>`);
    }
  } catch { /* défensif */ }
  host.innerHTML = lines.join('');
}

// ─── 7. Audio (observe-only) ──────────────────────────────────────────────────

function wireAudioMonitor(): void {
  // Wrap RÉVERSIBLE et passthrough de __PlaySE : journalise puis rappelle l'original.
  // N'altère PAS le son (l'original est appelé tel quel). Idempotent.
  const gg = g();
  const cur = gg.__PlaySE;
  if (cur && !cur.__dvtWrapped) {
    const orig = cur;
    const wrapped = ((id: number) => {
      const last = _seLog[_seLog.length - 1];
      if (last && last.id === id) last.n++;
      else { _seLog.push({ id, n: 1 }); if (_seLog.length > 12) _seLog.shift(); }
      return orig(id);
    }) as GlobalProbe['__PlaySE'] & { __dvtWrapped: boolean; __dvtOrig: (id: number) => void };
    wrapped!.__dvtWrapped = true;
    wrapped!.__dvtOrig = orig;
    gg.__PlaySE = wrapped;
  }
}

function renderAudio(): void {
  const host = document.getElementById('dvt-aud');
  if (!host) return;
  let bgm = '—';
  try { const s = getCurrentSongId(); bgm = s == null ? '(aucun)' : String(s); } catch { /* défensif */ }
  let se = '', cry = '';
  try {
    const dg = g().__decompGlobals;
    if (dg?.IsSEPlaying) se = dg.IsSEPlaying() ? 'oui' : 'non';
    if (dg?.IsCryPlaying) cry = dg.IsCryPlaying() ? 'oui' : 'non';
  } catch { /* défensif */ }
  const log = _seLog.length
    ? _seLog.map((e) => `${e.id}${e.n > 1 ? '×' + e.n : ''}`).join(' ')
    : '(aucun capté)';
  host.innerHTML =
    `<div class="dvt-kv">BGM=<b>${bgm}</b>${se ? ' · SE-playing=' + se : ''}${cry ? ' · cry=' + cry : ''}</div>`
    + `<div class="dvt-kv dvt-dim">SE récents (via __PlaySE): ${esc(log)}</div>`;
}

// ─── 8. Scénarios (refresh PUIS autoboot) ─────────────────────────────────────

const AUTOBOOT_KEY = '__dvtAutoboot';

function queueAutoboot(type: 'wild' | 'rival'): void {
  try { sessionStorage.setItem(AUTOBOOT_KEY, type); } catch { /* défensif */ }
  window.location.reload();
}

function resumeAutobootIfPending(): void {
  let type: string | null = null;
  try { type = sessionStorage.getItem(AUTOBOOT_KEY); } catch { return; }
  if (type !== 'wild' && type !== 'rival') return;
  try { sessionStorage.removeItem(AUTOBOOT_KEY); } catch { /* défensif */ }

  // Attend que l'overworld soit prêt (joueur spawné + harness dispo + pas déjà en combat).
  let tries = 0;
  const poll = window.setInterval(() => {
    tries++;
    const r = rt();
    const dl = g().__decompBattleLoop;
    const player = g().__gObjectEvents?.[0];
    const ready = !!r && !!dl?.harnessSetupParties && !!dl.bootDecompBattleLoop
      && !(r.gMain as unknown as { inBattle?: boolean }).inBattle
      && typeof player?.currentCoordsX === 'number';
    if (ready) {
      window.clearInterval(poll);
      bootScenario(type as 'wild' | 'rival');
    } else if (tries > 80) { // ~20 s
      window.clearInterval(poll);
      console.warn('[devtools] autoboot abandonné : overworld pas prêt');
    }
  }, 250);
}

function syncPlayerPosBeforeBoot(): void {
  const gg = g();
  const sb1 = gg.gSaveBlock1Ptr;
  const player = gg.__gObjectEvents?.[0];
  if (sb1 && player && typeof player.currentCoordsX === 'number' && typeof player.currentCoordsY === 'number') {
    sb1.pos.x = player.currentCoordsX - 7; // MAP_OFFSET
    sb1.pos.y = player.currentCoordsY - 7;
  }
}

function bootScenario(type: 'wild' | 'rival'): void {
  const r = rt();
  if (r && (r.gMain as unknown as { inBattle?: boolean }).inBattle) {
    console.warn('[devtools] déjà en combat — boot ignoré'); return;
  }
  const dl = g().__decompBattleLoop;
  if (!dl) { console.warn('[devtools] __decompBattleLoop indisponible'); return; }
  syncPlayerPosBeforeBoot();
  if (type === 'rival') {
    void dl.harnessBootRivalBattle1?.();
    return;
  }
  void dl.harnessSetupParties?.(
    'SPECIES_TREECKO', 5, 'SPECIES_POOCHYENA', 5,
    { moves: ['MOVE_POUND', 'MOVE_LEER'] }, { moves: ['MOVE_TACKLE'] },
  ).then(() => dl.bootDecompBattleLoop?.(true));
}

// ─── Construction du DOM + styles ─────────────────────────────────────────────

/** Boutons de téléport (1 par ville à PC), spawn 1 tuile au sud de la porte (devant l'entrée). */
function teleportButtonsHtml(): string {
  return TELEPORT_TOWNS.map((t) =>
    `<button data-tp="${t.id}" data-tx="${t.pcx}" data-ty="${t.pcy + 1}" `
    + `title="${esc(t.id)} (${t.pcx},${t.pcy + 1})">${esc(t.name)}</button>`,
  ).join('');
}

function buildDom(): void {
  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.className = 'dvt-hidden';
  panel.innerHTML = `
    <div class="dvt-head">
      <span class="dvt-ttl">🛠 DEVTOOLS A/B</span>
      <span id="dvt-live" class="dvt-livetxt">—</span>
      <button id="dvt-close" class="dvt-x" title="Fermer (F2)">✕</button>
    </div>
    <div class="dvt-fc">
      <button data-fc="pause" title="Pause / Play">❚❚</button>
      <button data-fc="step1" title="Avancer 1 frame">⏭1</button>
      <button data-fc="step8" title="Avancer 8 frames">⏭8</button>
      <span class="dvt-dim">vit</span>
      <button data-spd="1">1×</button>
      <button data-spd="0.5">½×</button>
      <button data-spd="0.25">¼×</button>
      <button data-spd="0.1">.1×</button>
    </div>
    <div class="dvt-body">
      <details open><summary>🗺 Téléport <span class="dvt-dim">(devant les Pokémon Centers)</span></summary>
        <div id="dvt-tp" class="dvt-tp">${teleportButtonsHtml()}</div>
      </details>
      <details open><summary>🎨 Palettes <span class="dvt-dim">(rendu réel)</span></summary>
        <div class="dvt-pal-ctl">
          <label><input type="checkbox" id="dvt-cb-obj" checked> OBJ</label>
          <label><input type="checkbox" id="dvt-cb-bg" checked> BG</label>
        </div>
        <div id="dvt-pal"></div>
      </details>
      <details><summary>🧩 Sprites / OAM</summary>
        <label class="dvt-pal-ctl"><input type="checkbox" id="dvt-cb-vis" checked> visibles seulement</label>
        <div id="dvt-spr"></div>
      </details>
      <details><summary>🗺 BG / Blend / Window</summary><div id="dvt-bg"></div></details>
      <details><summary>⚔ Battle state</summary><div id="dvt-bat"></div></details>
      <details><summary>🔊 Audio <span class="dvt-dim">(observe-only)</span></summary><div id="dvt-aud"></div></details>
      <details open><summary>🚀 Scénarios</summary>
        <div id="dvt-scn" class="dvt-scn">
          <button data-scn="refresh" title="window.location.reload()">⟳ Refresh</button>
          <button data-scn="wild" title="Refresh PUIS combat Treecko vs Poochyena">🌿 Combat sauvage</button>
          <button data-scn="rival" title="Refresh PUIS combat rival #1">🧑 Combat rival</button>
          <div class="dvt-mv">
            <input id="dvt-mv-id" placeholder="MOVE_MIST / id" />
            <button data-scn="moveanim">▶ Move anim</button>
          </div>
        </div>
      </details>
    </div>`;
  document.body.appendChild(panel);

  const fab = document.createElement('div');
  fab.id = 'dvt-fab';
  fab.textContent = '🛠';
  fab.title = 'Devtools A/B (F2)';
  document.body.appendChild(fab);

  const hl = document.createElement('div');
  hl.id = 'dvt-hl';
  document.body.appendChild(hl);
}

function wireControls(): void {
  document.getElementById('dvt-fab')?.addEventListener('click', () => setVisible(!_visible));
  document.getElementById('dvt-close')?.addEventListener('click', () => setVisible(false));

  // Frame control
  document.querySelector('[data-fc="pause"]')?.addEventListener('click', () => {
    const r = rt(); if (r) { r.paused = !r.paused; renderLive(); }
  });
  document.querySelector('[data-fc="step1"]')?.addEventListener('click', () => step(1));
  document.querySelector('[data-fc="step8"]')?.addEventListener('click', () => step(8));
  document.querySelectorAll('[data-spd]').forEach((b) => {
    b.addEventListener('click', () => {
      const r = rt(); if (!r) return;
      r.speedMultiplier = parseFloat((b as HTMLElement).dataset.spd ?? '1');
      r.paused = false;
      markActiveSpeed();
    });
  });
  markActiveSpeed();

  // Palette toggles
  document.getElementById('dvt-cb-obj')?.addEventListener('change', (e) => {
    _showObj = (e.target as HTMLInputElement).checked; renderPalettes();
  });
  document.getElementById('dvt-cb-bg')?.addEventListener('change', (e) => {
    _showBg = (e.target as HTMLInputElement).checked; renderPalettes();
  });
  document.getElementById('dvt-cb-vis')?.addEventListener('change', (e) => {
    _visiblesOnly = (e.target as HTMLInputElement).checked; renderSprites();
  });

  // Sprite highlight (délégation : survit aux re-render innerHTML)
  document.getElementById('dvt-spr')?.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest('[data-sid]') as HTMLElement | null;
    if (!row) return;
    const id = parseInt(row.dataset.sid ?? '', 10);
    _selectedSpriteId = (_selectedSpriteId === id) ? null : id;
    renderSprites();
    updateHighlight();
  });

  // Téléport (délégation : survit aux re-render). Appelle le devtool live __devGotoMap.
  document.getElementById('dvt-tp')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-tp]') as HTMLElement | null;
    if (!btn) return;
    const map = btn.dataset.tp;
    const x = parseInt(btn.dataset.tx ?? '', 10);
    const y = parseInt(btn.dataset.ty ?? '', 10);
    if (!map || Number.isNaN(x) || Number.isNaN(y)) return;
    const fn = g().__devGotoMap;
    if (fn) fn(map, x, y);
    else console.warn('[devtools] __devGotoMap indisponible (overworld pas booté ?)');
  });

  // Scénarios
  const mvInput = document.getElementById('dvt-mv-id') as HTMLInputElement | null;
  mvInput?.addEventListener('keydown', (e) => e.stopPropagation()); // ne pas piloter le jeu en tapant
  document.getElementById('dvt-scn')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-scn]') as HTMLElement | null;
    if (!btn) return;
    switch (btn.dataset.scn) {
      case 'refresh': window.location.reload(); break;
      case 'wild': queueAutoboot('wild'); break;
      case 'rival': queueAutoboot('rival'); break;
      case 'moveanim': {
        const v = (mvInput?.value ?? '').trim();
        if (!v) return;
        const fn = g().__testMoveAnim;
        if (fn) fn(/^\d+$/.test(v) ? parseInt(v, 10) : v);
        else console.warn('[devtools] __testMoveAnim indisponible');
        break;
      }
    }
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
  document.querySelectorAll('[data-spd]').forEach((b) => {
    const v = parseFloat((b as HTMLElement).dataset.spd ?? '1');
    b.classList.toggle('dvt-on', Math.abs(v - cur) < 1e-6 && !(r?.paused));
  });
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function injectStyles(): void {
  if (document.getElementById('dvt-style')) return;
  const st = document.createElement('style');
  st.id = 'dvt-style';
  st.textContent = `
#${PANEL_ID}{position:fixed;top:0;right:0;width:330px;max-height:100vh;overflow-y:auto;
  z-index:2147483000;background:rgba(14,16,22,.94);color:#cfe;font:11px/1.35 ui-monospace,Menlo,Consolas,monospace;
  border-left:1px solid #2b3550;box-shadow:-4px 0 18px rgba(0,0,0,.5);padding:6px 8px 40px;backdrop-filter:blur(2px)}
#${PANEL_ID}.dvt-hidden{display:none}
#${PANEL_ID} .dvt-head{display:flex;align-items:center;gap:6px;position:sticky;top:0;background:rgba(14,16,22,.97);
  padding:2px 0 6px;margin:-2px 0 6px;border-bottom:1px solid #2b3550;z-index:2}
#${PANEL_ID} .dvt-ttl{font-weight:700;color:#7fe0ff;white-space:nowrap}
#${PANEL_ID} .dvt-livetxt{flex:1;color:#8fffc4;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#${PANEL_ID} .dvt-x{background:#33405e;color:#fff;border:0;border-radius:3px;cursor:pointer;padding:1px 6px}
#${PANEL_ID} .dvt-fc{display:flex;align-items:center;gap:3px;flex-wrap:wrap;margin-bottom:6px}
#${PANEL_ID} button{background:#26314c;color:#dceaff;border:1px solid #3a4a6e;border-radius:3px;
  cursor:pointer;padding:2px 6px;font:inherit}
#${PANEL_ID} button:hover{background:#33415f}
#${PANEL_ID} button.dvt-on{background:#1e6f4e;border-color:#2fae79;color:#eaffe9}
#${PANEL_ID} details{border:1px solid #232d44;border-radius:4px;margin-bottom:5px;background:rgba(255,255,255,.02)}
#${PANEL_ID} summary{cursor:pointer;padding:4px 6px;user-select:none;color:#bcd}
#${PANEL_ID} details>*:not(summary){padding:4px 6px}
#${PANEL_ID} .dvt-dim{color:#7a89a8}
#${PANEL_ID} .dvt-na{color:#9a6;padding:4px 6px}
#${PANEL_ID} .dvt-pal-ctl{display:flex;gap:10px;margin:2px 0 4px}
#${PANEL_ID} .dvt-pal-label{margin:4px 0 2px;color:#9fd}
#${PANEL_ID} .dvt-grid{display:grid;grid-template-columns:repeat(16,1fr);gap:1px;width:100%}
#${PANEL_ID} .dvt-cell{aspect-ratio:1;border:.5px solid rgba(0,0,0,.4)}
#${PANEL_ID} .dvt-tbl{width:100%;border-collapse:collapse;font-size:10px}
#${PANEL_ID} .dvt-tbl th{color:#8aa;text-align:left;font-weight:600;border-bottom:1px solid #2b3550;padding:1px 3px}
#${PANEL_ID} .dvt-tbl td{padding:1px 3px;border-bottom:1px solid #1b2335;white-space:nowrap}
#${PANEL_ID} .dvt-row{cursor:pointer}
#${PANEL_ID} .dvt-row:hover{background:#1f2a42}
#${PANEL_ID} .dvt-row.dvt-sel{background:#2a4a3a;outline:1px solid #4ad}
#${PANEL_ID} .dvt-row.dvt-dim td{color:#67748f}
#${PANEL_ID} .dvt-cb{max-width:84px;overflow:hidden;text-overflow:ellipsis}
#${PANEL_ID} .dvt-kv{margin:2px 0}
#${PANEL_ID} .dvt-tp{display:flex;flex-wrap:wrap;gap:3px}
#${PANEL_ID} .dvt-tp button{flex:0 0 auto;padding:2px 5px;font-size:10px}
#${PANEL_ID} .dvt-scn{display:flex;flex-direction:column;gap:4px;align-items:flex-start}
#${PANEL_ID} .dvt-scn button{width:100%;text-align:left}
#${PANEL_ID} .dvt-mv{display:flex;gap:3px;width:100%}
#${PANEL_ID} .dvt-mv input{flex:1;background:#10151f;color:#cfe;border:1px solid #2b3550;border-radius:3px;padding:2px 4px;font:inherit;min-width:0}
#${PANEL_ID} .dvt-mv button{width:auto;white-space:nowrap}
#dvt-fab{position:fixed;bottom:10px;right:10px;z-index:2147482999;width:34px;height:34px;border-radius:50%;
  background:rgba(20,24,34,.9);border:1px solid #3a4a6e;color:#9fd;font-size:17px;display:flex;align-items:center;
  justify-content:center;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.5);user-select:none}
#dvt-fab:hover{background:#26314c}
#dvt-fab.dvt-fab-on{background:#1e6f4e;border-color:#2fae79}
#dvt-hl{position:fixed;z-index:2147482998;border:1.5px solid #ffe23a;box-shadow:0 0 0 1px rgba(0,0,0,.6),0 0 8px #ffe23a;
  pointer-events:none;display:none;border-radius:1px}`;
  document.head.appendChild(st);
}

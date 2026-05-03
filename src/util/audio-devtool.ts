/**
 * Floating audio devtool panel.
 *
 * Layout (sous le canvas Phaser dans le flow body) :
 *   [Volume slider] [BGM search] [BGM dropdown] [Play / Loop / Stop]
 *                   [SE search]  [SE dropdown]  [Play SE]
 *
 * BGM = mus_*  (joué sans loop pour tester, ou Loop forcée)
 * SE  = se_*   (one-shot natural)
 * (ph_* phoneme songs are unused at runtime — filtered out)
 *
 * Activé seulement en dev (= !import.meta.env.PROD). Désactivable via
 * localStorage : `localStorage.setItem('audioDevtool', 'off')`.
 *
 * Volume persisté dans localStorage.audioDevtoolVolume (0.0–1.0).
 */
import { SONG_ID_TO_NAME } from '../engine/decomp-data/auto/src/song-table';
import { m4aSongNumStart, PlaySE, m4aMPlayAllStop } from '../engine/decomp-globals';
import { setMasterVolume } from '../engine/m4a/audio-context';

interface SongEntry { id: number; name: string; }

function buildSongLists(): { bgm: SongEntry[]; se: SongEntry[] } {
  const bgm: SongEntry[] = [];
  const se: SongEntry[] = [];
  for (const idStr in SONG_ID_TO_NAME) {
    const id = Number(idStr);
    const name = SONG_ID_TO_NAME[id];
    if (!name) continue;
    if (name.startsWith('mus_')) bgm.push({ id, name });
    else if (name.startsWith('se_')) se.push({ id, name });
  }
  bgm.sort((a, b) => a.name.localeCompare(b.name));
  se.sort((a, b) => a.name.localeCompare(b.name));
  return { bgm, se };
}

/** Repopulate <select> with entries matching `query` (case-insensitive substring on name or id). */
function refilterSelect(select: HTMLSelectElement, entries: SongEntry[], query: string): void {
  const q = query.trim().toLowerCase();
  select.innerHTML = '';
  let matchCount = 0;
  for (const entry of entries) {
    if (q && !entry.name.toLowerCase().includes(q) && !String(entry.id).includes(q)) continue;
    const opt = document.createElement('option');
    opt.value = String(entry.id);
    opt.textContent = `${entry.id}: ${entry.name}`;
    select.appendChild(opt);
    matchCount++;
  }
  if (matchCount === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '(aucun match)';
    opt.disabled = true;
    select.appendChild(opt);
  }
}

export function createAudioDevtool(): void {
  if (localStorage.getItem('audioDevtool') === 'off') return;
  if (document.getElementById('audio-devtool')) return; // already created

  const { bgm, se } = buildSongLists();

  // Apply persisted volume immediately (avant tout play). Default 1.0.
  const initialVol = Math.max(0, Math.min(1, parseFloat(localStorage.getItem('audioDevtoolVolume') ?? '1') || 1));
  setMasterVolume(initialVol);

  const panel = document.createElement('div');
  panel.id = 'audio-devtool';
  panel.style.cssText = `
    background: rgba(20, 20, 30, 0.92);
    color: #eee;
    font: 12px monospace;
    padding: 10px 12px;
    border-radius: 6px;
    margin: 12px auto;
    width: 480px;
    max-width: 95vw;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    user-select: none;
  `;

  // Header avec collapse toggle
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:pointer;font-weight:bold;';
  header.innerHTML = '<span>🎵 Audio devtool</span><span id="audio-devtool-toggle">−</span>';
  panel.appendChild(header);

  const body = document.createElement('div');
  body.id = 'audio-devtool-body';
  panel.appendChild(body);

  header.addEventListener('click', () => {
    const collapsed = body.style.display === 'none';
    body.style.display = collapsed ? '' : 'none';
    document.getElementById('audio-devtool-toggle')!.textContent = collapsed ? '−' : '+';
  });

  // ─── Master volume slider ───────────────────────────────────────────────
  const volSection = document.createElement('div');
  volSection.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
  const volLabel = document.createElement('span');
  volLabel.style.cssText = 'color:#afa;min-width:60px;';
  volLabel.textContent = 'Volume :';
  const volSlider = document.createElement('input');
  volSlider.type = 'range';
  volSlider.min = '0';
  volSlider.max = '100';
  volSlider.value = String(Math.round(initialVol * 100));
  volSlider.style.cssText = 'flex:1;cursor:pointer;';
  const volValue = document.createElement('span');
  volValue.style.cssText = 'min-width:34px;text-align:right;color:#ddd;';
  volValue.textContent = `${volSlider.value}%`;
  volSlider.addEventListener('input', () => {
    const v = Number(volSlider.value) / 100;
    setMasterVolume(v);
    volValue.textContent = `${volSlider.value}%`;
    localStorage.setItem('audioDevtoolVolume', String(v));
    // Notifie le slider topbar (= sync UX).
    window.dispatchEvent(new CustomEvent('audio-volume-changed', { detail: { volume: v } }));
  });
  // Listen to volume changes coming from the topbar slider (= sync inverse).
  window.addEventListener('audio-volume-changed', (e) => {
    const v = (e as CustomEvent<{ volume: number }>).detail.volume;
    if (Math.abs(Number(volSlider.value) / 100 - v) < 0.005) return; // ignore self-event
    volSlider.value = String(Math.round(v * 100));
    volValue.textContent = `${volSlider.value}%`;
  });
  volSection.appendChild(volLabel);
  volSection.appendChild(volSlider);
  volSection.appendChild(volValue);
  body.appendChild(volSection);

  // ─── BGM section ────────────────────────────────────────────────────────
  const bgmSection = document.createElement('div');
  bgmSection.style.cssText = 'margin-bottom:8px;';
  bgmSection.innerHTML = `<div style="margin-bottom:3px;color:#8af;">BGM (auto-loop si markers MIDI):</div>`;

  const bgmSearch = document.createElement('input');
  bgmSearch.type = 'text';
  bgmSearch.placeholder = `🔍 Filtrer ${bgm.length} BGM...`;
  bgmSearch.style.cssText = 'width:100%;background:#222;color:#eee;border:1px solid #444;padding:3px 6px;font:11px monospace;margin-bottom:3px;box-sizing:border-box;';
  bgmSection.appendChild(bgmSearch);

  const bgmSelect = document.createElement('select');
  bgmSelect.style.cssText = 'width:100%;background:#222;color:#eee;border:1px solid #444;padding:2px;font:11px monospace;';
  refilterSelect(bgmSelect, bgm, '');
  bgmSection.appendChild(bgmSelect);
  bgmSearch.addEventListener('input', () => refilterSelect(bgmSelect, bgm, bgmSearch.value));

  const bgmButtons = document.createElement('div');
  bgmButtons.style.cssText = 'display:flex;gap:4px;margin-top:4px;';
  const bgmPlayBtn = document.createElement('button');
  bgmPlayBtn.textContent = '▶ Play';
  bgmPlayBtn.style.cssText = 'flex:1;background:#2a5a8a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  const bgmLoopBtn = document.createElement('button');
  bgmLoopBtn.textContent = '🔁 Loop';
  bgmLoopBtn.title = 'Force loop ON (= overrides MIDI markers)';
  bgmLoopBtn.style.cssText = 'flex:1;background:#2a8a5a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  const bgmStopBtn = document.createElement('button');
  bgmStopBtn.textContent = '⏹ Stop all';
  bgmStopBtn.style.cssText = 'flex:1;background:#5a2a2a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  bgmButtons.appendChild(bgmPlayBtn);
  bgmButtons.appendChild(bgmLoopBtn);
  bgmButtons.appendChild(bgmStopBtn);
  bgmSection.appendChild(bgmButtons);
  body.appendChild(bgmSection);

  bgmPlayBtn.addEventListener('click', () => {
    const id = Number(bgmSelect.value);
    if (Number.isFinite(id)) {
      m4aMPlayAllStop();
      m4aSongNumStart(id);
    }
  });
  bgmLoopBtn.addEventListener('click', () => {
    const id = Number(bgmSelect.value);
    if (Number.isFinite(id)) {
      m4aMPlayAllStop();
      m4aSongNumStart(id, true);
    }
  });
  bgmStopBtn.addEventListener('click', () => {
    m4aMPlayAllStop();
  });

  // ─── SE section ─────────────────────────────────────────────────────────
  const seSection = document.createElement('div');
  seSection.innerHTML = `<div style="margin-bottom:3px;color:#fa8;">SE (one-shot):</div>`;

  const seSearch = document.createElement('input');
  seSearch.type = 'text';
  seSearch.placeholder = `🔍 Filtrer ${se.length} SE...`;
  seSearch.style.cssText = 'width:100%;background:#222;color:#eee;border:1px solid #444;padding:3px 6px;font:11px monospace;margin-bottom:3px;box-sizing:border-box;';
  seSection.appendChild(seSearch);

  const seSelect = document.createElement('select');
  seSelect.style.cssText = 'width:100%;background:#222;color:#eee;border:1px solid #444;padding:2px;font:11px monospace;';
  refilterSelect(seSelect, se, '');
  seSection.appendChild(seSelect);
  seSearch.addEventListener('input', () => refilterSelect(seSelect, se, seSearch.value));

  const sePlayBtn = document.createElement('button');
  sePlayBtn.textContent = '▶ Play SE';
  sePlayBtn.style.cssText = 'width:100%;margin-top:4px;background:#8a5a2a;color:#fff;border:none;padding:4px;cursor:pointer;font:11px monospace;';
  seSection.appendChild(sePlayBtn);
  body.appendChild(seSection);

  sePlayBtn.addEventListener('click', () => {
    const id = Number(seSelect.value);
    if (Number.isFinite(id)) PlaySE(id);
  });

  // Footer hint
  const hint = document.createElement('div');
  hint.style.cssText = 'margin-top:6px;font-size:9px;color:#888;';
  hint.textContent = `${bgm.length} BGM, ${se.length} SE — click header to collapse`;
  body.appendChild(hint);

  document.body.appendChild(panel);
}

/**
 * Modal de remap des touches GBA.
 *
 * Cliquer sur le bouton "Remap" du topbar → ouvre un overlay listant les 10
 * boutons GBA (A/B/SELECT/START/UP/DOWN/LEFT/RIGHT/L/R) avec leur(s) touche(s)
 * actuelle(s). Cliquer sur "Remap" à côté d'un bouton → wait next keypress →
 * réassigne. "Reset" remet les defaults. "Fermer" ferme le modal.
 *
 * Le modal capture les évènements clavier en mode capture (= avant Phaser),
 * pour que l'utilisateur puisse remapper même les touches qui font tick le
 * jeu. Pendant l'attente d'input, e.preventDefault() empêche Phaser de voir
 * la touche.
 */
import {
  GBA_BUTTONS,
  type GbaButton,
  getKeysForButton,
  rebindButton,
  resetKeyBindings,
} from './key-bindings';

let _modalOpen = false;

function prettyKey(key: string): string {
  if (key === ' ') return 'Espace';
  if (key === 'enter') return 'Entrée';
  if (key.startsWith('arrow')) return '↑↓←→ '[['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(key)] ?? key;
  return key.length === 1 ? key.toUpperCase() : key;
}

function renderRow(button: GbaButton, container: HTMLElement, refresh: () => void): void {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #333;';

  const label = document.createElement('span');
  label.style.cssText = 'flex:0 0 70px;color:#8af;font-weight:bold;';
  label.textContent = button;
  row.appendChild(label);

  const keys = getKeysForButton(button);
  const keyText = document.createElement('span');
  keyText.style.cssText = 'flex:1;color:#ddd;';
  keyText.textContent = keys.length ? keys.map(prettyKey).join(', ') : '(non assigné)';
  row.appendChild(keyText);

  const remapBtn = document.createElement('button');
  remapBtn.textContent = 'Remap';
  remapBtn.style.cssText = 'background:#2a5a8a;color:#fff;border:none;padding:4px 10px;cursor:pointer;font:11px monospace;';
  row.appendChild(remapBtn);

  remapBtn.addEventListener('click', () => {
    remapBtn.textContent = 'Appuyez...';
    remapBtn.disabled = true;
    keyText.textContent = '(appuyez sur une touche)';
    keyText.style.color = '#fa8';

    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Echap = annule
      if (e.key === 'Escape') {
        window.removeEventListener('keydown', onKey, true);
        refresh();
        return;
      }
      rebindButton(button, e.key);
      window.removeEventListener('keydown', onKey, true);
      refresh();
    };
    window.addEventListener('keydown', onKey, true);
  });

  container.appendChild(row);
}

export function openRemapModal(): void {
  if (_modalOpen) return;
  _modalOpen = true;

  const overlay = document.createElement('div');
  overlay.id = 'remap-modal-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    font: 12px monospace; color: #eee;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: #1e1e2a;
    border: 1px solid #555;
    border-radius: 8px;
    padding: 16px 20px;
    width: 380px; max-width: 95vw;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
  `;

  const title = document.createElement('div');
  title.textContent = '🎮 Remap touches GBA';
  title.style.cssText = 'font-size:14px;font-weight:bold;margin-bottom:10px;color:#fff;';
  modal.appendChild(title);

  const hint = document.createElement('div');
  hint.style.cssText = 'font-size:10px;color:#888;margin-bottom:8px;';
  hint.textContent = 'Esc pour annuler la capture en cours.';
  modal.appendChild(hint);

  const list = document.createElement('div');
  modal.appendChild(list);

  const refresh = (): void => {
    list.innerHTML = '';
    for (const btn of GBA_BUTTONS) renderRow(btn, list, refresh);
  };
  refresh();

  const footer = document.createElement('div');
  footer.style.cssText = 'display:flex;gap:8px;margin-top:12px;';
  const resetBtn = document.createElement('button');
  resetBtn.textContent = '↺ Reset défauts';
  resetBtn.style.cssText = 'flex:1;background:#5a2a2a;color:#fff;border:none;padding:6px;cursor:pointer;font:11px monospace;';
  resetBtn.addEventListener('click', () => {
    resetKeyBindings();
    refresh();
  });
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✓ Fermer';
  closeBtn.style.cssText = 'flex:1;background:#2a5a8a;color:#fff;border:none;padding:6px;cursor:pointer;font:11px monospace;';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    _modalOpen = false;
  });
  footer.appendChild(resetBtn);
  footer.appendChild(closeBtn);
  modal.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Expose pour l'attribut onclick du topbar HTML
(window as unknown as { openRemapModal: () => void }).openRemapModal = openRemapModal;

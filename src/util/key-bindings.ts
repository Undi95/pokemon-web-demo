/**
 * Key bindings : mapping touche clavier → bouton GBA.
 *
 * Persisté dans localStorage.keyBindings. Permet aux utilisateurs de remap
 * leurs touches sans toucher au code (cf. remap-modal.ts pour l'UI).
 *
 * Bouton GBA → bitmask (1:1 décomp `agb_flash.c` / `gba/m4a.h`) :
 *   A = 0x01, B = 0x02, SELECT = 0x04, START = 0x08
 *   RIGHT = 0x10, LEFT = 0x20, UP = 0x40, DOWN = 0x80
 *   R = 0x100, L = 0x200
 */

export const GBA_BUTTONS = ['A', 'B', 'SELECT', 'START', 'RIGHT', 'LEFT', 'UP', 'DOWN', 'R', 'L'] as const;
export type GbaButton = typeof GBA_BUTTONS[number];

export const GBA_BUTTON_MASKS: Record<GbaButton, number> = {
  A: 0x01,
  B: 0x02,
  SELECT: 0x04,
  START: 0x08,
  RIGHT: 0x10,
  LEFT: 0x20,
  UP: 0x40,
  DOWN: 0x80,
  R: 0x100,
  L: 0x200,
};

/** Default mapping : key.toLowerCase() (or 'arrowxxx', 'enter', ' ') → GBA button. */
export const DEFAULT_KEY_BINDINGS: Record<string, GbaButton> = {
  w: 'A',
  x: 'B',
  n: 'SELECT',
  b: 'START',
  enter: 'START',
  ' ': 'START',
  arrowright: 'RIGHT',
  arrowleft: 'LEFT',
  arrowup: 'UP',
  arrowdown: 'DOWN',
  z: 'R',
  a: 'L',
};

const STORAGE_KEY = 'keyBindings';

let _bindings: Record<string, GbaButton> | null = null;

function load(): Record<string, GbaButton> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, GbaButton>;
      // Validate : keys lowercase, values must be valid buttons
      const out: Record<string, GbaButton> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (GBA_BUTTONS.includes(v)) out[k.toLowerCase()] = v;
      }
      if (Object.keys(out).length > 0) return out;
    }
  } catch { /* fallthrough */ }
  return { ...DEFAULT_KEY_BINDINGS };
}

function save(): void {
  if (_bindings) localStorage.setItem(STORAGE_KEY, JSON.stringify(_bindings));
}

export function getKeyBindings(): Record<string, GbaButton> {
  if (!_bindings) _bindings = load();
  return _bindings;
}

/** Convert a `KeyboardEvent.key` into the GBA bitmask (or 0 if unmapped). */
export function keyToGbaMask(key: string): number {
  const bindings = getKeyBindings();
  const button = bindings[key.toLowerCase()];
  return button ? GBA_BUTTON_MASKS[button] : 0;
}

/** Bind a single key to a GBA button. If `key` empty string, removes the binding. */
export function setKeyBinding(key: string, button: GbaButton | null): void {
  if (!_bindings) _bindings = load();
  const k = key.toLowerCase();
  // Remove any previous binding for this key
  delete _bindings[k];
  if (button) _bindings[k] = button;
  save();
}

/** Remove all keys currently bound to `button`, then bind `key` → `button`. */
export function rebindButton(button: GbaButton, key: string): void {
  if (!_bindings) _bindings = load();
  for (const k of Object.keys(_bindings)) {
    if (_bindings[k] === button) delete _bindings[k];
  }
  _bindings[key.toLowerCase()] = button;
  save();
}

/** Reverse view : button → list of keys currently bound to it. */
export function getKeysForButton(button: GbaButton): string[] {
  const b = getKeyBindings();
  return Object.entries(b).filter(([, v]) => v === button).map(([k]) => k);
}

export function resetKeyBindings(): void {
  _bindings = { ...DEFAULT_KEY_BINDINGS };
  save();
}

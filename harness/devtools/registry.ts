/**
 * DEVTOOLS V2 — registre de commandes UNIQUE (mandat user 2026-07-10).
 *
 * BUT : parité totale user/Claude. Chaque outil devtool est déclaré UNE fois ici
 * (id, catégorie, label, args typés, handler) puis devient automatiquement :
 *   - une commande console : `dev.cmd('jeu.tp', { ville: 'LAVANDIA' })`
 *     (+ `dev.cmds()` liste filtrable, `dev.help('jeu.tp')` fiche) — côté Claude ;
 *   - un bouton / mini-formulaire dans la sidebar F2 (panel-v2.ts) — côté user.
 * Une commande ajoutée au registre apparaît des DEUX côtés sans travail en plus.
 *
 * CHOIX D'ARCHITECTURE (assumé, documenté dans chantier-devtools-v2) : les modules
 * existants (dev-scope, dev-bytevm-tools, dev-cheat, dev-gfx-tools…) ne sont PAS
 * réécrits — ils continuent d'exposer leurs globals historiques (scope.*, __byteVm.*,
 * cheat.*, dev.gfx.*) qui restent les alias console. Le registre DÉLÈGUE à ces
 * implémentations via `registrations.ts` (point unique de mapping). Zéro risque de
 * régression sur l'outillage console existant.
 *
 * Harness pur — AUCUN code 1:1 ici (cf. mémoire feedback-devtools-in-harness-not-1to1).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Types d'argument supportés par le rendu auto du panel. */
export type DevArgKind = 'number' | 'string' | 'boolean' | 'select';

export interface DevArgOption {
  value: string | number;
  label: string;
}

export interface DevArg {
  /** Nom de la clé dans l'objet args passé au handler. */
  name: string;
  kind: DevArgKind;
  /** Libellé court affiché dans le formulaire (défaut : name). */
  label?: string;
  placeholder?: string;
  /** Pour kind 'select' : liste des choix. */
  options?: ReadonlyArray<DevArgOption>;
  /** Valeur par défaut si champ laissé vide. */
  default?: string | number | boolean;
  optional?: boolean;
}

export interface DevCommand {
  /** Identifiant stable 'categorie.nom' — c'est la clé de dev.cmd(). */
  id: string;
  /** Catégorie = onglet du panel (cf. DEV_CATEGORIES). */
  category: string;
  /** Libellé bouton (emoji bienvenu). */
  label: string;
  /** Une ligne : tooltip UI + fiche dev.help(). */
  description?: string;
  args?: ReadonlyArray<DevArg>;
  /**
   * Rendu UI :
   *  - 'button' (défaut) : bouton pleine largeur (0 arg) ou mini-form + ▶.
   *  - 'grid'   : commande à 1 arg select rendue en GRILLE de boutons
   *               (1 bouton par option — ex. téléport villes, écrans Easy Chat).
   */
  ui?: 'button' | 'grid';
  /** true = confirmation avant exécution (actions destructrices). */
  danger?: boolean;
  /** true = pas de rendu UI (commande console uniquement). */
  hidden?: boolean;
  /** Le handler. Retour (string/objet) affiché dans le drawer résultat du panel. */
  run: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}

/**
 * Vue live du panel (sondes visuelles : palettes, OAM, battle state…).
 * `mount` est appelé UNE fois à l'affichage de la catégorie (DOM interactif OK) ;
 * `update` (optionnel) est appelé ~7 Hz TANT QUE la vue est visible — zéro
 * polling sidebar fermée ou catégorie inactive (exigence perf du mandat).
 */
export interface DevView {
  id: string;
  category: string;
  label: string;
  description?: string;
  mount: (el: HTMLElement) => void;
  update?: (el: HTMLElement) => void;
  /** Vue repliée par défaut (les lourdes : palettes, OAM). */
  collapsed?: boolean;
}

// ─── Catégories (ordre des onglets) ───────────────────────────────────────────

export const DEV_CATEGORIES: ReadonlyArray<{ id: string; label: string; icon: string }> = [
  { id: 'jeu',     label: 'Jeu',     icon: '🗺' },
  { id: 'joueur',  label: 'Joueur',  icon: '🎮' },
  { id: 'combat',  label: 'Combat',  icon: '⚔' },
  { id: 'scene',   label: 'Scène',   icon: '🎬' },
  { id: 'scripts', label: 'Scripts', icon: '📜' },
  { id: 'gfx',     label: 'Gfx',     icon: '🎨' },
  { id: 'audio',   label: 'Audio',   icon: '🎵' },
  { id: 'save',    label: 'Save',    icon: '💾' },
  { id: 'sys',     label: 'Sys',     icon: '⚙' },
];

// ─── Store ────────────────────────────────────────────────────────────────────

const _commands = new Map<string, DevCommand>();
const _views = new Map<string, DevView>();
const _listeners = new Set<() => void>();

/** Le panel s'abonne pour se re-render quand un module s'enregistre tard. */
export function onRegistryChanged(fn: () => void): void {
  _listeners.add(fn);
}

function notify(): void {
  for (const fn of _listeners) {
    try { fn(); } catch (e) { console.error('[devtools registry] listener', e); }
  }
}

export function registerCommand(cmd: DevCommand): void {
  if (_commands.has(cmd.id)) console.warn(`[devtools registry] commande '${cmd.id}' redéfinie`);
  _commands.set(cmd.id, cmd);
  notify();
}

export function registerCommands(cmds: ReadonlyArray<DevCommand>): void {
  for (const c of cmds) {
    if (_commands.has(c.id)) console.warn(`[devtools registry] commande '${c.id}' redéfinie`);
    _commands.set(c.id, c);
  }
  notify();
}

export function registerView(view: DevView): void {
  if (_views.has(view.id)) console.warn(`[devtools registry] vue '${view.id}' redéfinie`);
  _views.set(view.id, view);
  notify();
}

export function getCommands(category?: string): DevCommand[] {
  const all = [..._commands.values()];
  return category ? all.filter((c) => c.category === category) : all;
}

export function getViews(category?: string): DevView[] {
  const all = [..._views.values()];
  return category ? all.filter((v) => v.category === category) : all;
}

export function getCommand(id: string): DevCommand | undefined {
  return _commands.get(id);
}

// ─── Exécution (chemin commun console + UI) ───────────────────────────────────

/** Coercition d'un argument vers le type déclaré (les inputs UI donnent des strings). */
function coerceArg(arg: DevArg, raw: unknown): unknown {
  if (raw === undefined || raw === '') {
    return arg.default !== undefined ? arg.default : undefined;
  }
  switch (arg.kind) {
    case 'number': {
      const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
      return Number.isNaN(n) ? undefined : n;
    }
    case 'boolean':
      return raw === true || raw === 'true' || raw === '1' || raw === 1;
    case 'select': {
      // Les options peuvent porter des values numériques — retrouve le type déclaré.
      const opt = arg.options?.find((o) => String(o.value) === String(raw));
      return opt ? opt.value : raw;
    }
    default:
      return String(raw);
  }
}

export interface RunResult {
  ok: boolean;
  value?: unknown;
  error?: string;
}

/** Exécute une commande (console ET panel passent par ici — parité garantie). */
export async function runCommand(id: string, rawArgs?: Record<string, unknown>): Promise<RunResult> {
  const cmd = _commands.get(id);
  if (!cmd) {
    const msg = `commande inconnue '${id}' — dev.cmds() pour la liste`;
    console.warn(`[dev.cmd] ${msg}`);
    return { ok: false, error: msg };
  }
  const args: Record<string, unknown> = {};
  for (const a of cmd.args ?? []) {
    const v = coerceArg(a, rawArgs?.[a.name]);
    if (v === undefined && !a.optional) {
      const msg = `argument requis '${a.name}' manquant — dev.help('${id}')`;
      console.warn(`[dev.cmd ${id}] ${msg}`);
      return { ok: false, error: msg };
    }
    if (v !== undefined) args[a.name] = v;
  }
  try {
    const value = await cmd.run(args);
    return { ok: true, value };
  } catch (e) {
    console.error(`[dev.cmd ${id}]`, e);
    return { ok: false, error: String(e) };
  }
}

// ─── Frontend console (côté Claude) ──────────────────────────────────────────

function formatArgSig(a: DevArg): string {
  const t = a.kind === 'select' ? (a.options?.map((o) => o.value).slice(0, 6).join('|') ?? 'select') : a.kind;
  return `${a.name}${a.optional ? '?' : ''}: ${t}${a.default !== undefined ? ` = ${a.default}` : ''}`;
}

function cmdHelp(id: string): string {
  const cmd = _commands.get(id);
  if (!cmd) return `commande inconnue '${id}'`;
  const lines = [`${cmd.id} — ${cmd.label}${cmd.danger ? ' ⚠ DANGER' : ''}`];
  if (cmd.description) lines.push(`  ${cmd.description}`);
  if (cmd.args?.length) {
    lines.push('  args :');
    for (const a of cmd.args) {
      lines.push(`    ${formatArgSig(a)}`);
      if (a.kind === 'select' && a.options && a.options.length > 6) {
        lines.push(`      (${a.options.length} choix : ${a.options.map((o) => o.value).join(', ')})`);
      }
    }
    const ex = Object.fromEntries((cmd.args).map((a) => [a.name, a.default ?? (a.options?.[0]?.value ?? (a.kind === 'number' ? 0 : '…'))]));
    lines.push(`  ex : dev.cmd('${cmd.id}', ${JSON.stringify(ex)})`);
  } else {
    lines.push(`  ex : dev.cmd('${cmd.id}')`);
  }
  return lines.join('\n');
}

function cmdList(filter?: string): string {
  const f = filter?.toLowerCase();
  const lines: string[] = [];
  for (const cat of DEV_CATEGORIES) {
    const cmds = getCommands(cat.id).filter((c) =>
      !f || c.id.toLowerCase().includes(f) || c.label.toLowerCase().includes(f)
      || (c.description ?? '').toLowerCase().includes(f));
    if (!cmds.length) continue;
    lines.push(`${cat.icon} ${cat.label.toUpperCase()}`);
    for (const c of cmds) {
      const sig = c.args?.length ? `(${c.args.map(formatArgSig).join(', ')})` : '()';
      lines.push(`  ${c.id}${sig} — ${c.label}`);
    }
  }
  return lines.length ? lines.join('\n') : `(aucune commande${f ? ` pour '${filter}'` : ''})`;
}

/**
 * Pose dev.cmd / dev.cmds / dev.help2 sur le `dev` global existant (engine-devtools
 * pose déjà window.dev avec dev.help → on n'écrase PAS help, on ajoute help2 qui
 * couvre le registre ; si dev n'existe pas encore on le crée).
 */
export function installRegistryConsoleFrontend(): void {
  const g = globalThis as Record<string, unknown>;
  const dev = (g.dev ?? {}) as Record<string, unknown>;
  g.dev = dev;
  dev.cmd = (id: string, args?: Record<string, unknown>): Promise<RunResult> => {
    return runCommand(id, args).then((r) => {
      if (r.ok) {
        if (r.value !== undefined) console.log(`[dev.cmd ${id}] →`, r.value);
      }
      return r;
    });
  };
  dev.cmds = (filter?: string): string => {
    const txt = cmdList(filter);
    console.log(txt);
    return txt;
  };
  dev.help2 = (id?: string): string => {
    const txt = id ? cmdHelp(id) : cmdList();
    console.log(txt);
    return txt;
  };
}

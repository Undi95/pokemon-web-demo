/**
 * harness/e2e/engine-sweep.ts — scénario E2E « engine-sweep » (Phase B.3 du plan
 * docs/CHANTIER-MOTEUR-100.md) : EXERCISEUR ANTI-STUB.
 *
 * BUT : après boot → overworld, ouvrir successivement CHAQUE écran porté via les
 * VRAIS chemins d'input (menu START + navigation touches, byte-VM pour PC/shop/
 * combat), un par un, chacun dans un try/catch avec timeout individuel. Un hook
 * console.error/console.warn (dédupliqué, cap 20/écran) capture tout ce que les
 * gardes moteur (Phase B.2) hurlent. POLITIQUE KO : seuls console.error, les
 * throws et les asserts échoués rendent un écran KO ; les console.warn restent
 * COLLECTÉS (dans errors[], préfixés [warn]) mais NE FONT PLUS KO (sinon faux-KO
 * permanents, ex. fallback PNG d'un asset non-critique). Un écran qui échoue NE
 * BLOQUE PAS les suivants (le wrapper `runScreen` catch tout et revient à
 * l'overworld par des B répétés). Rapport JSON par écran `{screen, ok, ms,
 * errors[], nErrors, nWarns, firstStack?}` + console.table + compteur global
 * `{screens, ok, ko, totalErrors, totalWarns}` (aussi stashé sur
 * `window.__engineSweepReport`). À relancer après CHAQUE lot de fixes.
 *
 * Le scénario est IDEMPOTENT : chaque run remet à zéro l'état et (ré)installe les
 * hooks proprement (restauration du hook warn en fin de run).
 *
 * Harness pur — AUCUN code 1:1 ici (feedback-devtools-in-harness-not-1to1). Les
 * imports src touchés (FlagGet, GetYesNoWindowId, IsShopMenuOpen,
 * CalculatePlayerPartyCount) sont DÉJÀ dans le graphe E2E (dev-bytevm-tools les
 * importe) → aucune nouvelle arête d'import tôt (pas de TDZ). GetCurrentMenuItemId
 * (pokénav) est importé DYNAMIQUEMENT à l'usage (pokénav = module lazy du jeu).
 *
 * ─── SKIP-LIST (écrans NON couverts + raison EXACTE) ─────────────────────────
 *  • Pokénav › CARTE DE HOENN (region map) : écran NON câblé —
 *      PokenavCallback_Init_RegionMap → throw wireTodo `IsEventIslandMapSecId`
 *      (chantier region_map.c / pokenav_region_map.ts, 39 symboles ; cf.
 *      CHANTIER-MOTEUR-100 §Re-tests A). Le sweep n'appuie JAMAIS A dessus :
 *      c'est cursorPos 0 (POKENAV_MENUITEM_MAP), on descend AVANT de valider.
 *  • Pokénav › CONDITION : écran NON câblé — pokenav_conditions_gfx = 59 wireTodo
 *      (STUBS-INVENTORY.md). Jamais sélectionné (cursorPos 1). On ne valide (A)
 *      QUE si `GetCurrentMenuItemId()` confirme MATCH_CALL (2), sinon on sort par B.
 *  • Mail (lecture) : AUCUN lanceur standalone dans harness/devtools. L'écran mail
 *      s'ouvre seulement via un item MAIL tenu (bag → lire/donner) — hors du
 *      périmètre input-driven de ce sweep. → non couvert.
 *  • Berry tag (étiquette baie) : AUCUN lanceur standalone. S'ouvre depuis la poche
 *      BAIES du sac (item baie → ÉTIQUETTE). → non couvert.
 *  Inclus car un lanceur EXISTE déjà (grep launch* harness/devtools) : shop
 *  (launchPokemart), PC storage (launchScript('EventScript_PC')), combat dresseur
 *  (launchTB(333)).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { e2e, registerScenario, type E2eScenario, type E2eCtx } from './runner';
// byte-VM : mêmes lanceurs que le scénario double-battle (INSTANCE module réelle).
import { loadAndInstall, launchScript, launchTB, launchPokemart } from '../devtools/dev-bytevm-tools';
// Lectures d'état légères (fonctions, pas d'état muté) — modules DÉJÀ dans le
// graphe E2E via dev-bytevm-tools (aucune nouvelle arête tôt).
import { FlagGet } from '../../src/engine/script/script-vars';
import { GetYesNoWindowId } from '../../src/menu';
import { IsShopMenuOpen } from '../../src/shop';
import { CalculatePlayerPartyCount } from '../../src/engine/battle/party-storage';

const OVERWORLD_CB2 = 'MainCB2_Overworld2';
const POKENAV_MENUITEM_MATCH_CALL = 2; // 1:1 pokenav_menu_handler.ts:30

// ─── Rapport par écran ────────────────────────────────────────────────────────

interface ScreenResult {
  screen: string;
  ok: boolean;
  ms: number;
  /** Lignes d'affichage fusionnées (THROW + erreurs + warns préfixés [warn]), cap 20. */
  errors: string[];
  /** Nombre de messages console.error DISTINCTS (+ throw) = causes de KO. */
  nErrors: number;
  /** Nombre de messages console.warn DISTINCTS = COLLECTÉS mais NON-KO. */
  nWarns: number;
  firstStack?: string;
}

// État privé partagé entre les étapes d'UN run. Reset intégral au boot (idempotence).
// curErrors = console.error (fait KO) ; curWarns = console.warn (collecté, PAS KO).
const S = {
  results: [] as ScreenResult[],
  curScreen: '',
  curErrors: new Map<string, number>(),
  curWarns: new Map<string, number>(),
  curFirstStack: undefined as string | undefined,
  origWarn: null as ((...a: unknown[]) => void) | null,
  hooked: false,
};

function g(): Record<string, unknown> { return globalThis as unknown as Record<string, unknown>; }

// ─── Sondes d'état (toutes non-throwing) ──────────────────────────────────────

function cb2(): string { try { return e2e.cb2Name(); } catch { return '(null)'; } }
function overworld(): boolean { return cb2() === OVERWORLD_CB2; }

function startMenuOpen(): boolean {
  try {
    const sm = g().startMenu as { isOpen?: () => boolean } | undefined;
    return !!sm?.isOpen?.();
  } catch { return false; }
}

function shopOpen(): boolean { try { return IsShopMenuOpen(); } catch { return false; } }
function yesNoUp(): boolean { try { return GetYesNoWindowId() >= 0; } catch { return false; } }
function safePartyCount(): number { try { return CalculatePlayerPartyCount(); } catch { return -1; } }
function safeFlag(name: string): boolean { try { return !!FlagGet(name); } catch { return false; } }

/** Overworld « propre » = pas d'écran, pas de menu START résiduel, pas de shop. */
function cleanOverworld(): boolean { return overworld() && !startMenuOpen() && !shopOpen(); }

// ─── Hooks console (dédup + firstStack, cap 20/écran) ─────────────────────────

/** Enregistre un message DISTINCT (dédup + comptage) dans `map` (cap 20/écran).
 *  `captureStack` = alimenter S.curFirstStack (réservé aux erreurs, PAS aux warns :
 *  un warn ne cause plus de KO → sa stack n'est pas la « cause » du 1er échec). */
function record(map: Map<string, number>, msg: string, captureStack: boolean): void {
  const prev = map.get(msg);
  if (prev !== undefined) { map.set(msg, prev + 1); return; }
  if (map.size >= 20) return; // cap distinct/écran
  map.set(msg, 1);
  if (captureStack && !S.curFirstStack) {
    const st = new Error().stack;
    if (st) S.curFirstStack = st.split('\n').slice(2, 6).join(' | ').slice(0, 400);
  }
}

/** Chaîne console.error PAR-DESSUS le wrapper du runner + wrappe console.warn.
 *  console.error → curErrors (fait KO) ; console.warn → curWarns (COLLECTÉ, PAS KO).
 *  Idempotent : restaure un éventuel hook warn laissé par un run précédent. */
function installHooks(): void {
  const c = console as unknown as Record<string, (...a: unknown[]) => void>;
  if (S.hooked && S.origWarn) c.warn = S.origWarn; // dé-wrappe l'ancien avant de re-wrapper
  const prevError = console.error;
  const prevWarn = console.warn;
  S.origWarn = prevWarn as (...a: unknown[]) => void;
  const fmt = (label: string, a: unknown[]): string =>
    (label + a.map((x) => String(x)).join(' ')).slice(0, 200);
  console.error = ((...a: unknown[]) => {
    try { record(S.curErrors, fmt('', a), true); } catch { /* un hook ne throw JAMAIS */ }
    (prevError as (...x: unknown[]) => void)(...a);
  }) as typeof console.error;
  console.warn = ((...a: unknown[]) => {
    try { record(S.curWarns, fmt('[warn] ', a), false); } catch { /* idem */ }
    (prevWarn as (...x: unknown[]) => void)(...a);
  }) as typeof console.warn;
  S.hooked = true;
}

function restoreWarnHook(): void {
  if (S.origWarn) { (console as unknown as Record<string, unknown>).warn = S.origWarn; }
  S.hooked = false;
}

// ─── Pilotage bas niveau ──────────────────────────────────────────────────────

/** press + attente de `framesAfter` frames de JEU. ctx.frames throw si GEL (aucune
 *  frame en 4 s) → un écran figé remonte comme THROW (détection de freeze voulue). */
async function tap(ctx: E2eCtx, key: string, framesAfter = 5): Promise<void> {
  await ctx.press(key);
  if (framesAfter > 0) await ctx.frames(framesAfter);
}

/** Attend qu'un prédicat cb2 devienne vrai — THROW au timeout (échec d'ouverture). */
async function waitCb2(pred: (name: string) => boolean, timeoutMs: number, tag: string): Promise<void> {
  const t0 = performance.now();
  while (!pred(cb2())) {
    if (performance.now() - t0 > timeoutMs) throw new Error(`${tag} non atteint (cb2=${cb2()})`);
    await new Promise((r) => setTimeout(r, 50));
  }
}

/** Variante NON-throwing (retourne false au timeout). */
async function tryWait(pred: () => boolean, timeoutMs: number): Promise<boolean> {
  const t0 = performance.now();
  while (!pred()) {
    if (performance.now() - t0 > timeoutMs) return false;
    await new Promise((r) => setTimeout(r, 50));
  }
  return true;
}

/** Revient à l'overworld propre par des B répétés (temps mur, jamais de throw).
 *  B est SÛR partout (annule/ferme, ne confirme jamais rien de destructif). */
async function recoverToOverworld(ctx: E2eCtx): Promise<void> {
  for (let i = 0; i < 16; i++) {
    if (cleanOverworld()) return;
    try { await ctx.press('b'); } catch { /* scope absent : abandon best-effort */ return; }
    await new Promise((r) => setTimeout(r, 250));
  }
}

// ─── Ordre 1:1 décomp BuildNormalStartMenu (start_menu.c:315) ─────────────────
// POKéDEX?(dex) POKéMON?(mon) SAC POKéNAV?(nav) {PLAYER} SAUVER OPTIONS RETOUR.
function startMenuIndices(): Record<string, number | undefined> {
  let i = 0;
  const idx: Record<string, number | undefined> = {};
  if (safeFlag('FLAG_SYS_POKEDEX_GET')) idx.pokedex = i++;
  if (safeFlag('FLAG_SYS_POKEMON_GET')) idx.party = i++;
  idx.bag = i++;
  if (safeFlag('FLAG_SYS_POKENAV_GET')) idx.pokenav = i++;
  idx.player = i++;
  idx.save = i++;
  idx.options = i++;
  idx.exit = i++;
  return idx;
}

/** Ouvre le menu START puis parque le curseur en HAUT (UP×8, borné par le décomp)
 *  et descend `index` fois — position déterministe (sStartMenuCursorPos persiste
 *  entre ouvertures, cf. start_menu.c:83), puis valide (A). */
async function openViaStartMenu(ctx: E2eCtx, index: number): Promise<void> {
  if (!startMenuOpen()) await tap(ctx, 'start', 6);
  await ctx.until('menu START ouvert', () => startMenuOpen(), 6000);
  for (let i = 0; i < 8; i++) await tap(ctx, 'up', 3);
  for (let i = 0; i < index; i++) await tap(ctx, 'down', 5);
  await tap(ctx, 'a', 8);
}

// ─── Écrans (chaque fn OUVRE + exerce ; la fermeture finale = recoverToOverworld) ─

async function sweepStartMenu(ctx: E2eCtx): Promise<void> {
  if (!startMenuOpen()) await tap(ctx, 'start', 6);
  await ctx.until('menu START ouvert', () => startMenuOpen(), 6000);
  await ctx.frames(10);
  ctx.note('menu START ouvert');
  await tap(ctx, 'b', 8);
  await ctx.until('menu START fermé', () => !startMenuOpen(), 6000);
}

async function sweepPokedex(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  if (idx.pokedex === undefined) { ctx.note('POKéDEX absent du menu (flag non set) — non testable'); return; }
  await openViaStartMenu(ctx, idx.pokedex);
  await waitCb2((n) => /Pokedex/i.test(n), 12000, 'Pokédex');
  await ctx.frames(20);
  for (let i = 0; i < 3; i++) await tap(ctx, 'down', 6); // scroll 3 crans
  await tap(ctx, 'up', 6);
  await tap(ctx, 'b', 10);
}

async function sweepParty(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  if (idx.party === undefined) { ctx.note('POKéMON absent du menu (flag non set) — non testable'); return; }
  await openViaStartMenu(ctx, idx.party);
  await waitCb2((n) => /Party/i.test(n), 12000, 'Party');
  await ctx.frames(20);
  await tap(ctx, 'down', 8);            // curseur sur le 2e mon
  await tap(ctx, 'up', 8);              // retour 1er mon
  await tap(ctx, 'a', 10);             // menu contextuel (RÉSUMÉ/CHANGER/…)
  await tap(ctx, 'a', 10);             // RÉSUMÉ = 1er item → summary
  const sum = await tryWait(() => /Summary/i.test(cb2()), 8000);
  ctx.note(sum ? 'summary ouvert' : 'summary non détecté (ordre menu contextuel ?)');
  await tap(ctx, 'b', 10);             // summary → party (B)
  await ctx.frames(8);
  await tap(ctx, 'b', 10);             // party → overworld (B) ; recovery termine
}

async function sweepBag(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  await openViaStartMenu(ctx, idx.bag as number);
  await waitCb2((n) => /Bag/i.test(n), 12000, 'Sac');
  await ctx.frames(20);
  await tap(ctx, 'right', 8);           // changer de poche ×2
  await tap(ctx, 'right', 8);
  await tap(ctx, 'b', 10);
}

async function sweepTrainerCard(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  await openViaStartMenu(ctx, idx.player as number);
  await waitCb2((n) => /TrainerCard/i.test(n), 12000, 'Carte Dresseur');
  await ctx.frames(20);
  await tap(ctx, 'b', 10);
}

async function sweepOptions(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  await openViaStartMenu(ctx, idx.options as number);
  // option_menu : CB2_InitOptionMenu (states 0..11) → MainCB2 (option_menu.ts:806).
  await waitCb2((n) => n === 'CB2_InitOptionMenu' || n === 'MainCB2', 12000, 'Options');
  await ctx.frames(30);                 // fade-in + Task_OptionMenuFadeIn
  await tap(ctx, 'b', 10);
}

async function sweepSaveCancel(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  await openViaStartMenu(ctx, idx.save as number);
  // Le dialogue SAUVER + fenêtre OUI/NON s'ouvrent (cb2 reste overworld). On attend
  // le OUI/NON puis on ANNULE par B (jamais A → jamais de sauvegarde réelle).
  const seen = await tryWait(() => yesNoUp(), 10000);
  ctx.note(seen ? 'dialogue SAUVER + OUI/NON affiché' : 'OUI/NON non détecté (timeout)');
  await tap(ctx, 'b', 10);              // NON → annule + ferme le menu START
  await tap(ctx, 'b', 8);               // sécurité (résidu de dialogue)
}

async function sweepPokenav(ctx: E2eCtx): Promise<void> {
  const idx = startMenuIndices();
  if (idx.pokenav === undefined) { ctx.note('POKéNAV absent du menu (flag non set) — non testable'); return; }
  await openViaStartMenu(ctx, idx.pokenav);
  await waitCb2((n) => /Pokenav/i.test(n), 15000, 'Pokénav');
  await ctx.frames(30);                 // bandeau + icônes (InitPokenavMainMenu)
  // Le menu s'ouvre curseur sur MAP (cursorPos 0). DOWN×2 → MATCH CALL (cursorPos 2).
  // On ne passe JAMAIS A sur MAP(0)/CONDITION(1) — écrans non câblés (SKIP-LIST).
  await tap(ctx, 'down', 8);
  await tap(ctx, 'down', 8);
  // Confirme (best-effort, même instance module que le jeu) que le curseur est
  // BIEN sur MATCH CALL avant de valider.
  let item = -1;
  try {
    const mod = await import('../../src/pokenav_menu_handler');
    item = mod.GetCurrentMenuItemId();
  } catch { /* substruct absent / lecture impossible → on se fie au DOWN×2 déterministe */ }
  if (item === POKENAV_MENUITEM_MATCH_CALL || item === -1) {
    await tap(ctx, 'a', 12);            // ouvre Match Call
    ctx.note(`Match Call sélectionné (currMenuItem=${item})`);
    await ctx.frames(20);
    for (let i = 0; i < 3; i++) await tap(ctx, 'down', 6); // scroll 3 crans (liste contacts)
    await tap(ctx, 'b', 10);            // Match Call → menu principal
    await ctx.frames(10);
    await tap(ctx, 'b', 10);            // menu principal → quitte le Pokénav
  } else {
    ctx.note(`curseur PAS sur MATCH CALL (currMenuItem=${item}) — A évité, sortie par B`);
    await tap(ctx, 'b', 10);
  }
}

async function sweepShop(ctx: E2eCtx): Promise<void> {
  await loadAndInstall();
  ctx.note(launchPokemart());
  const opened = await tryWait(() => shopOpen(), 12000);
  if (!opened) { ctx.note(`shop non ouvert (IsShopMenuOpen=false, cb2=${cb2()})`); return; }
  ctx.note(`shop ouvert (cb2=${cb2()})`);
  await ctx.frames(20);
  await tap(ctx, 'down', 6);
  await tap(ctx, 'up', 6);
  await tap(ctx, 'b', 10);              // quitte le menu d'achat
  await tap(ctx, 'b', 10);              // « REVENEZ ! » → overworld
}

async function sweepPC(ctx: E2eCtx): Promise<void> {
  await loadAndInstall();
  const partyBefore = safePartyCount();
  // EventScript_PC → boot → multichoice « quel PC » → case 0 = POKéMON STORAGE
  // (pc.inc:19) → ShowPokemonStorageSystemPC → CB2_PokeStorage. Le curseur multichoice
  // démarre en 0 : on n'appuie QUE A (jamais DOWN) → on sélectionne toujours l'option 0.
  ctx.note(launchScript('EventScript_PC'));
  let reached = false;
  for (let i = 0; i < 8 && !reached; i++) {
    await tap(ctx, 'a', 10);            // avance boot dialog / sélectionne storage / avance msg
    if (/PokeStorage/i.test(cb2())) reached = true;
    else await ctx.frames(6);
  }
  if (!reached) { ctx.note(`PC storage non atteint (cb2=${cb2()})`); return; }
  ctx.note('PC storage ouvert');
  await ctx.frames(20);
  await tap(ctx, 'a', 12);              // RETIRER = 1er item du menu storage → grille des boîtes
  await ctx.frames(15);
  await tap(ctx, 'right', 6);           // bouger le curseur ×2 (jamais A → pas de retrait réel)
  await tap(ctx, 'right', 6);
  await tap(ctx, 'b', 10);              // grille → menu storage
  await tap(ctx, 'b', 10);              // menu storage → multichoice PC
  await tap(ctx, 'b', 10);              // multichoice → TurnOffPC → overworld
  const partyAfter = safePartyCount();
  if (partyBefore >= 0 && partyAfter >= 0 && partyAfter !== partyBefore) {
    ctx.note(`ATTENTION party count ${partyBefore}→${partyAfter} (retrait accidentel ?)`);
  }
}

async function sweepBattle(ctx: E2eCtx): Promise<void> {
  await loadAndInstall();
  ctx.note(launchTB(333));
  // Driver du plan : ~toutes les 400 ms, si cb2 ∈ {PartyMenu, BagMenu} presser B,
  // sinon cycler left/up/A ; fin = retour cb2 overworld ; timeout global 120 s.
  await tryWait(() => !overworld(), 20000); // d'abord ENTRER en combat
  const keys = ['left', 'up', 'a'];
  const t0 = performance.now();
  let step = 0;
  let ended = false;
  while (performance.now() - t0 < 120000) {
    const n = cb2();
    if (n === OVERWORLD_CB2) { ended = true; break; }
    try {
      if (/PartyMenu|BagMenu/i.test(n)) await ctx.press('b');
      else { await ctx.press(keys[step % keys.length]); step++; }
    } catch { /* scope absent : on laisse le timeout gérer */ }
    await new Promise((r) => setTimeout(r, 400));
  }
  ctx.note(ended ? `combat terminé (retour overworld, ${step} inputs)` : `combat timeout 120 s (cb2=${cb2()})`);
}

// ─── Wrapper : exécute un écran, catch tout, revient à l'overworld ───────────

function withTimeout<T>(p: Promise<T>, ms: number, tag: string): Promise<T> {
  let done = false;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => { if (!done) { done = true; reject(new Error(`timeout ${ms} ms (${tag})`)); } }, ms);
    // La 2e branche consomme un rejet tardif de `p` → pas d'unhandledrejection.
    p.then(
      (v) => { if (!done) { done = true; clearTimeout(timer); resolve(v); } },
      (err) => { if (!done) { done = true; clearTimeout(timer); reject(err); } },
    );
  });
}

/** Exécute la fn d'un écran SANS jamais throw (le runner casse au 1er throw → on
 *  garde chaque écran indépendant). Collecte le résultat riche dans S.results. */
async function runScreen(ctx: E2eCtx, name: string, timeoutMs: number, fn: (c: E2eCtx) => Promise<void>): Promise<void> {
  S.curScreen = name;
  S.curErrors = new Map();
  S.curWarns = new Map();
  S.curFirstStack = undefined;
  const t0 = performance.now();
  let threw: string | undefined;
  try {
    await withTimeout(fn(ctx), timeoutMs, name);
  } catch (e) {
    threw = e instanceof Error ? e.message : String(e);
    if (!S.curFirstStack && e instanceof Error && e.stack) {
      S.curFirstStack = e.stack.split('\n').slice(0, 5).join(' | ').slice(0, 400);
    }
  }
  try { await recoverToOverworld(ctx); } catch { /* best-effort */ }
  const ms = Math.round(performance.now() - t0);
  // errors[] = affichage fusionné : THROW + console.error + console.warn (préfixés
  // [warn], COLLECTÉS comme avant). Mais SEULS throw/console.error font KO.
  const errors: string[] = [];
  if (threw) errors.push(`THROW: ${threw}`);
  for (const [m, c] of S.curErrors) errors.push(c > 1 ? `${m} (x${c})` : m);
  for (const [m, c] of S.curWarns) errors.push(c > 1 ? `${m} (x${c})` : m);
  const capped = errors.slice(0, 20);
  const nErrors = S.curErrors.size + (threw ? 1 : 0);
  const nWarns = S.curWarns.size;
  const ok = !threw && S.curErrors.size === 0; // warns NE font PLUS KO
  S.results.push({ screen: name, ok, ms, errors: capped, nErrors, nWarns, firstStack: S.curFirstStack });
  ctx.note(`${ok ? 'OK' : 'KO'} ${name} ${ms}ms err=${nErrors} warn=${nWarns}${capped.length ? ' :: ' + capped.slice(0, 3).join(' | ') : ''}`);
}

// ─── Enregistrement du scénario ───────────────────────────────────────────────

const SCREENS: Array<{ name: string; timeout: number; fn: (c: E2eCtx) => Promise<void> }> = [
  { name: 'start-menu',        timeout: 15000,  fn: sweepStartMenu },
  { name: 'pokedex',           timeout: 15000,  fn: sweepPokedex },
  { name: 'party+summary',     timeout: 18000,  fn: sweepParty },
  { name: 'bag',               timeout: 15000,  fn: sweepBag },
  { name: 'trainer-card',      timeout: 12000,  fn: sweepTrainerCard },
  { name: 'options',           timeout: 15000,  fn: sweepOptions },
  { name: 'save-cancel',       timeout: 15000,  fn: sweepSaveCancel },
  { name: 'pokenav-matchcall', timeout: 22000,  fn: sweepPokenav },
  { name: 'shop',              timeout: 15000,  fn: sweepShop },
  { name: 'pc-storage',        timeout: 22000,  fn: sweepPC },
  { name: 'battle-trainer',    timeout: 130000, fn: sweepBattle },
];

export const engineSweepScenario: E2eScenario = {
  id: 'engine-sweep',
  description:
    'Exerciseur anti-stub : boot → ouvre CHAQUE écran porté (start menu, pokédex, party+summary, sac, ' +
    'trainer card, options, save-cancel, pokénav Match Call, shop, PC, combat) un par un avec hook ' +
    'console.error/warn dédupliqué + timeout individuel ; rapport JSON par écran + console.table. ' +
    'SKIP: pokénav Carte/Condition (non câblés), mail, berry tag (pas de lanceur).',
  boot: 'depuis boot-overworld (overworld actif) — save progressée (dex/pokémon/pokénav débloqués)',
  steps: [
    {
      name: 'boot overworld + reset + hooks console',
      run: async (ctx) => {
        // Idempotence : reset intégral avant (ré)installation.
        S.results = [];
        S.curScreen = '';
        S.curErrors = new Map();
        S.curWarns = new Map();
        S.curFirstStack = undefined;
        await ctx.until(`cb2 = ${OVERWORLD_CB2}`, () => e2e.cb2Name() === OVERWORLD_CB2, 30000);
        installHooks();
        ctx.note('overworld actif, hooks console posés');
      },
    },
    // Un écran = une étape dont le run NE THROW JAMAIS (runScreen catch tout) → les
    // écrans suivants tournent quoi qu'il arrive.
    ...SCREENS.map((s) => ({
      name: `écran: ${s.name}`,
      run: (ctx: E2eCtx) => runScreen(ctx, s.name, s.timeout, s.fn),
    })),
    {
      name: 'synthèse + restauration hooks',
      run: (ctx) => {
        restoreWarnHook(); // console.error est restauré par le runner lui-même
        const ok = S.results.filter((r) => r.ok).length;
        const ko = S.results.length - ok;
        // totalErrors = causes de KO (console.error + throw) ; totalWarns = warns
        // collectés (NON-KO), comptés à part.
        const totalErrors = S.results.reduce((sum, r) => sum + r.nErrors, 0);
        const totalWarns = S.results.reduce((sum, r) => sum + r.nWarns, 0);
        const summary = { screens: S.results.length, ok, ko, totalErrors, totalWarns };
        g().__engineSweepReport = { ...summary, results: S.results };
        try {
          console.table(S.results.map((r) => ({
            screen: r.screen, ok: r.ok, ms: r.ms, errors: r.nErrors, warns: r.nWarns, first: r.errors[0] ?? '',
          })));
          console.log('[engine-sweep]', JSON.stringify(summary));
        } catch { /* console.table absent */ }
        ctx.note(`screens=${summary.screens} ok=${ok} ko=${ko} totalErrors=${totalErrors} totalWarns=${totalWarns} (détail: window.__engineSweepReport)`);
      },
    },
  ],
};

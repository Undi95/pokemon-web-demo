// wire-todo.ts — valeur-sentinelle des symboles NON RÉSOLUS par scripts/wire-transpiled.cjs.
// Proxy inerte à la référence (les data tables transpilées peuvent le stocker sans bombe au
// boot), mais BRUYANT à l'usage réel : tout APPEL throw avec le nom du symbole à résoudre.
// L'accès de propriété retourne un sous-proxy (chaîne inerte) — jamais de throw passif.

// Garde moteur B.2 — à CHAQUE throw d'un wireTodo (apply/construct), on trace le symbole
// RÉELLEMENT atteint dans globalThis.__wireTodoHits (ring 100, dédupliqué par name avec
// compteur). L'exerciseur E2E s'en sert pour lister les symboles non câblés effectivement
// touchés en jeu. N'altère PAS le comportement : on enregistre PUIS on throw à l'identique.
function _recordWireTodoHit(name: string): void {
  const g = globalThis as any;
  const frame = g.__rt?.gMain?.vblankCounter1 ?? -1;
  const ring: Array<{ name: string; frame: number; count: number }> =
    g.__wireTodoHits ?? (g.__wireTodoHits = []);
  const e = ring.find((x) => x.name === name);
  if (e) { e.count++; return; }
  ring.push({ name, frame, count: 1 });
  if (ring.length > 100) ring.shift();
}

export function __wireTodo(name: string): any {
  const f = function () { /* apply → throw */ };
  return new Proxy(f, {
    apply() { _recordWireTodoHit(name); throw new Error(`[wire] ${name} : symbole transpilé non résolu — câbler (audit-reports/transpile/)`); },
    construct() { _recordWireTodoHit(name); throw new Error(`[wire] new ${name} : symbole transpilé non résolu`); },
    get(_t, p) {
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === 'valueOf') return () => 0;
      if (p === 'toString') return () => `[wireTodo ${name}]`;
      return __wireTodo(`${name}.${String(p)}`);
    },
  });
}

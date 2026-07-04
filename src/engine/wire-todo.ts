// wire-todo.ts — valeur-sentinelle des symboles NON RÉSOLUS par scripts/wire-transpiled.cjs.
// Proxy inerte à la référence (les data tables transpilées peuvent le stocker sans bombe au
// boot), mais BRUYANT à l'usage réel : tout APPEL throw avec le nom du symbole à résoudre.
// L'accès de propriété retourne un sous-proxy (chaîne inerte) — jamais de throw passif.
export function __wireTodo(name: string): any {
  const f = function () { /* apply → throw */ };
  return new Proxy(f, {
    apply() { throw new Error(`[wire] ${name} : symbole transpilé non résolu — câbler (audit-reports/transpile/)`); },
    construct() { throw new Error(`[wire] new ${name} : symbole transpilé non résolu`); },
    get(_t, p) {
      if (p === Symbol.toPrimitive) return () => 0;
      if (p === 'valueOf') return () => 0;
      if (p === 'toString') return () => `[wireTodo ${name}]`;
      return __wireTodo(`${name}.${String(p)}`);
    },
  });
}

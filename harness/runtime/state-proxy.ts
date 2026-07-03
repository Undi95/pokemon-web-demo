/**
 * state-proxy.ts — proxy paresseux générique sur `getter()[prop]`.
 *
 * ZÉRO import (utilisable par les modules anti-cycle comme sprite.ts).
 * Sert aux exports « globals 1:1 » (gTasks, gSprites, gPaletteFade…) : l'accès
 * délègue à l'état runtime AU MOMENT de l'accès, jamais à l'éval du module
 * (→ zéro problème d'ordre de boot/TDZ).
 *
 * Limite connue : le Proxy n'EST pas l'objet cible (identité ≠, pas de passage
 * direct à des APIs exigeant un vrai TypedArray). Pour ces cas, passer par le
 * runtime directement.
 */
export function makeStateProxy<T extends object = Record<string | number, unknown>>(
  getter: () => unknown, prop: string,
): T {
  const target = ((): unknown => {
    const rt = getter() as Record<string, unknown> | null | undefined;
    return rt ? rt[prop] : undefined;
  });
  return new Proxy({} as T, {
    get(_, p) {
      const o = target() as Record<PropertyKey, unknown>;
      if (!o) return undefined;
      const v = o[p as PropertyKey];
      return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(o) : v;
    },
    set(_, p, v) {
      const o = target() as Record<PropertyKey, unknown>;
      if (!o) return false;
      o[p as PropertyKey] = v;
      return true;
    },
    has(_, p) {
      const o = target() as object;
      return !!o && (p in o);
    },
    deleteProperty(_, p) {
      const o = target() as Record<PropertyKey, unknown>;
      if (!o) return false;
      delete o[p as PropertyKey];
      return true;
    },
    ownKeys() {
      const o = target() as object;
      return o ? Reflect.ownKeys(o) : [];
    },
    getOwnPropertyDescriptor(_, p) {
      const o = target() as object;
      const d = o ? Object.getOwnPropertyDescriptor(o, p) : undefined;
      if (d) d.configurable = true;
      return d;
    },
  });
}

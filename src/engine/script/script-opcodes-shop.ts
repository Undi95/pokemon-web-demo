/**
 * script-opcodes-shop.ts — opcodes `pokemart` / `pokemartdecoration` /
 * `pokemartdecoration2` / `pokemartlistend` 1:1 décomp `shop.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1886-1912` :
 *   `ScrCmd_pokemart`            : CreatePokemartMenu(products).
 *   `ScrCmd_pokemartdecoration`  : CreateDecorationShop1Menu(products).
 *   `ScrCmd_pokemartdecoration2` : CreateDecorationShop2Menu(products).
 *
 * Et `D:/Projet 1/decomps/pokeemeraude/src/shop.c` (~3000 lignes UI shop)
 * référencé via globalThis.CreatePokemartMenu — dispatch sera wired quand
 * le shop UI sera porté en TS.
 *
 * `pokemartlistend` (event.inc:1158) = MARQUEUR DE FIN dans la liste, pas
 * un opcode actif (= .2byte ITEM_NONE + release + end).
 */

import { registerOpcode, getOpcodeHandler } from './script-runtime';

/** 1:1 décomp `ScrCmd_pokemart` (scrcmd.c) :
 *    products = (const u16 *)ScriptReadWord(ctx);
 *    CreatePokemartMenu(products);
 *    ScriptContext_Stop();
 *
 *  Audit session 126 LOT D3 : le shop UI complet est ~3000 lignes décomp
 *  (= shop.c). Notre dispatch via globalThis.CreatePokemartMenu sera câblé
 *  quand le shop UI sera porté en TS.
 *
 *  Note : `args[0]` est typiquement un POINTER LABEL (= "DewfordTown_Mart_
 *  Pokemart") qui est résolu au compile time vers une array de u16 itemIds.
 *  Notre runtime a probably la liste dans le scripts JSON sous ce label. */
registerOpcode('pokemart', (_ctx, args) => {
  const productsLabel = args[0] ?? '';
  const createPokemartMenu = (globalThis as Record<string, unknown>).CreatePokemartMenu as
    ((items: unknown) => void) | undefined;
  if (typeof createPokemartMenu === 'function') {
    try {
      // Pour l'instant on passe le label string ; le auto-file expects un u16*.
      // À wire proprement : resolve label → array via map scripts data.
      createPokemartMenu(productsLabel);
      console.log(`[opcode pokemart] CreatePokemartMenu('${productsLabel}') dispatched`);
    } catch (e) {
      console.warn(`[opcode pokemart] CreatePokemartMenu threw:`, e);
    }
  } else {
    console.warn(`[opcode pokemart] '${productsLabel}' — CreatePokemartMenu not exposed (= shop UI ~3000 lignes décomp à wire)`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_pokemartdecoration` (scrcmd.c) :
 *    products = (const u16 *)ScriptReadWord(ctx);
 *    CreateDecorationShop1Menu(products).
 *  Shop décoration mode 1. Notre port : delegate au pokemart standard
 *  (= CreateDecorationShop1Menu non encore exposé). */
registerOpcode('pokemartdecoration', (ctx, args) => {
  return getOpcodeHandler('pokemart')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_pokemartdecoration2` (scrcmd.c) :
 *    CreateDecorationShop2Menu(products). */
registerOpcode('pokemartdecoration2', (ctx, args) => {
  return getOpcodeHandler('pokemart')?.(ctx, args) ?? false;
});

/** 1:1 décomp `event.inc:1158` `pokemartlistend` macro — c'est un MARQUEUR
 *  DE FIN dans une liste (= .2byte ITEM_NONE + release + end), pas un
 *  opcode actif. No-op safe. */
registerOpcode('pokemartlistend', (_ctx, _args) => {
  return false;
});

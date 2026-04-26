// AUTO-GENERATED from data/text/check_furniture.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/check_furniture.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Text_PictureBookShelf', isGlobal: false, instrIndex: 0 },
  { name: 'Text_BookShelf', isGlobal: false, instrIndex: 0 },
  { name: 'Text_PokemonCenterBookShelf', isGlobal: false, instrIndex: 0 },
  { name: 'Text_Vase', isGlobal: false, instrIndex: 0 },
  { name: 'Text_EmptyTrashCan', isGlobal: false, instrIndex: 0 },
  { name: 'Text_ShopShelf', isGlobal: false, instrIndex: 0 },
  { name: 'Text_Blueprint', isGlobal: false, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=14
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Ce sont des albums de POKéMON.$\""] },
  { kind: '.string', vals: ["\"Il y a toutes sortes de livres.$\""] },
  { kind: '.string', vals: ["\"Des magazines POKéMON!\\n\""] },
  { kind: '.string', vals: ["\"NOS AMIS LES POKéMON…\\p\""] },
  { kind: '.string', vals: ["\"MANUEL POKéMON…\\n\""] },
  { kind: '.string', vals: ["\"GRAINE DE POKéMON…$\""] },
  { kind: '.string', vals: ["\"Ce vase semble avoir de la valeur!\\p\""] },
  { kind: '.string', vals: ["\"En regardant à l'intérieur, on\\n\""] },
  { kind: '.string', vals: ["\"s'aperçoit qu'il est vide.$\""] },
  { kind: '.string', vals: ["\"C'est vide.$\""] },
  { kind: '.string', vals: ["\"Les étagères regorgent de toutes\\n\""] },
  { kind: '.string', vals: ["\"sortes de produits POKéMON.$\""] },
  { kind: '.string', vals: ["\"Voilà un curieux plan!\\n\""] },
  { kind: '.string', vals: ["\"Ça a l'air compliqué.$\""] },
] as const;

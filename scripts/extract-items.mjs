#!/usr/bin/env node
/**
 * Parse src/data/items.h pour produire public/decomp/em/items.json.
 *
 * Le décomp utilise une struct gItems[] avec `[ITEM_X] = { .name, .price,
 * .description, .pocket, .type, ... }`. Les noms FR sont dans `_("...")`
 * directement. Les descriptions sont des labels de pointeurs (sXxxDesc) qu'on
 * ne résout pas pour l'instant (texte FR à extraire séparément).
 *
 * Format de sortie :
 *   {
 *     "ITEM_MASTER_BALL": {
 *       name: "MASTER BALL",
 *       price: 0,
 *       pocket: "POCKET_POKE_BALLS",
 *       type: "ITEM_USE_BAG_MENU" | autres,
 *       descriptionLabel: "sMasterBallDesc",
 *       battleUsage?: "ITEM_B_USE_OTHER",
 *       holdEffect?: "HOLD_EFFECT_X"
 *     }
 *   }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'public', 'decomp', 'em', 'items.json');
mkdirSync(dirname(outPath), { recursive: true });

const text = readFileSync(join(decompPath, 'src', 'data', 'items.h'), 'utf8');

const items = {};
const re = /\[(ITEM_\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;
let m;
while ((m = re.exec(text)) !== null) {
  const [, name, body] = m;
  const get = (re) => (body.match(re) || [])[1];
  const nameStr = (body.match(/\.name\s*=\s*_\("([^"]*)"\)/) || [])[1] || name;
  const price = Number(get(/\.price\s*=\s*(\d+)/) || 0);
  const pocket = get(/\.pocket\s*=\s*(\w+)/);
  const type = get(/\.type\s*=\s*([\w\d_-]+)/);
  const descriptionLabel = get(/\.description\s*=\s*(\w+)/);
  const battleUsage = get(/\.battleUsage\s*=\s*(\w+)/);
  const holdEffect = get(/\.holdEffect\s*=\s*(\w+)/);
  const holdEffectParam = get(/\.holdEffectParam\s*=\s*(\d+)/);
  // 1:1 décomp `.importance = 1` (item.c:910 GetItemImportance). Posé sur
  // tous les KEY ITEMS + les 8 HM (= "objets uniques à usage infini, pas
  // de quantité affichée + jamais jetables"). Non-présent = 0.
  const importance = Number(get(/\.importance\s*=\s*(\d+)/) || 0);
  // 1:1 décomp `.registrability = TRUE` (item.c — flag pour le SELECT button
  // sur la map = item assignable au raccourci). Posé sur certains KEY ITEMS
  // (Bike, Surf, Bag Pyramid…). Non-présent = false.
  const registrability = /\.registrability\s*=\s*TRUE/.test(body);
  // 1:1 décomp `.fieldUseFunc = ItemUseOutOfBattle_X` (item.c struct Item).
  // Pointer vers le handler appelé quand le user fait A sur l'item en field.
  // Notre TS : on stocke le NOM du handler (ex. "ItemUseOutOfBattle_Medicine")
  // pour dispatch côté `ItemMenu_UseOutOfBattle`.
  const fieldUseFunc = get(/\.fieldUseFunc\s*=\s*(\w+)/);
  // 1:1 décomp `.battleUseFunc = ItemUseInBattle_X` (handler battle).
  const battleUseFunc = get(/\.battleUseFunc\s*=\s*(\w+)/);
  // 1:1 décomp `.secondaryId` (= sub-id pour Mach Bike/Acro Bike, repels,
  // evolution stones, etc. — distingue les variantes au sein d'un handler).
  const secondaryId = get(/\.secondaryId\s*=\s*(\w+)/);
  const item = { name: nameStr, price, pocket, type, descriptionLabel };
  if (battleUsage) item.battleUsage = battleUsage;
  if (holdEffect) item.holdEffect = holdEffect;
  if (holdEffectParam) item.holdEffectParam = Number(holdEffectParam);
  if (importance) item.importance = importance;
  if (registrability) item.registrability = true;
  if (fieldUseFunc) item.fieldUseFunc = fieldUseFunc;
  if (battleUseFunc) item.battleUseFunc = battleUseFunc;
  if (secondaryId) item.secondaryId = secondaryId;
  items[name] = item;
}

writeFileSync(outPath, JSON.stringify(items));
console.log('[items]', { count: Object.keys(items).length, output: outPath });

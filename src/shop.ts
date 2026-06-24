/**
 * shop.ts — miroir 1:1 de `src/shop.c` (le Pokémart : menu Acheter/Vendre/Quitter
 * + menu d'achat).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/shop.c`.
 *
 * ── Couche DONNÉES (ce commit) ──────────────────────────────────────────────
 * Dans la décomp, l'opcode `pokemart <Label>` passe à `CreatePokemartMenu` un
 * POINTEUR vers un tableau `u16[]` de constantes d'objets (les `.2byte ITEM_*`
 * d'un label dans `data/maps/<X>/scripts.inc`, terminé par `pokemartlistend`).
 *
 * Notre extracteur de scripts JSON ne gardait que les OPCODES → il a jeté les
 * lignes `.2byte ITEM_*` ⇒ toutes nos listes mart étaient VIDES (le label ne
 * mappait que `["pokemartlistend"]`). On récupère ces tableaux dans
 * `public/decomp/em/mart-lists.json` (cf. `scripts/extract-mart-lists.cjs`) et
 * `GetMartItemList(label)` les résout. `CreatePokemartMenu` (l'UI, commit
 * suivant) consommera cette liste comme `sMartInfo.itemList`.
 */

// ─── Chargement de la table mart (data décomp) ───────────────────────────────
// Tableaux `label → ["ITEM_X", ...]` extraits des `.2byte` de la décomp.
let sMartLists: Record<string, string[]> | null = null;

/** Charge `mart-lists.json` (une fois, au boot). Le fetch est lancé à l'import
 *  de ce module (cf. bas de fichier) ; l'opcode `pokemart` ne tire que bien
 *  plus tard (le joueur parle à un vendeur) → la table est prête à temps. */
export async function InitMartLists(): Promise<void> {
  if (sMartLists) return;
  try {
    const resp = await fetch('/decomp/em/mart-lists.json');
    if (!resp.ok) {
      console.error('[shop] échec fetch /decomp/em/mart-lists.json:', resp.status);
      sMartLists = {};
      return;
    }
    sMartLists = await resp.json();
    const n = Object.keys(sMartLists ?? {}).length;
    console.log(`[shop] chargé ${n} listes mart depuis /decomp/em/mart-lists.json`);
  } catch (e) {
    console.error('[shop] InitMartLists a throw:', e);
    sMartLists = {};
  }
}

/** Résout un label de Pokémart (`"OldaleTown_Mart_Pokemart_Basic"`) en son
 *  tableau de constantes d'objets (`["ITEM_POTION", ...]`). 1:1 décomp : c'est
 *  le `u16 *itemsForSale` que `CreatePokemartMenu` reçoit (pointeur résolu au
 *  link). Renvoie `[]` si la table n'est pas (encore) chargée ou le label
 *  inconnu (report honnête — pas de crash). */
export function GetMartItemList(label: string): string[] {
  if (!sMartLists) return [];
  return sMartLists[label] ?? [];
}

// Exposition dev (sonde déterministe : vérifie la récupération des listes).
{
  const _g = globalThis as Record<string, unknown>;
  _g.__GetMartItemList = GetMartItemList;
  _g.__InitMartLists = InitMartLists;
}

// 1:1 net-effect : précharge la table dès que le module est évalué (= au boot,
// via l'import side-effect dans scrcmd.ts). Fire-and-forget.
void InitMartLists();

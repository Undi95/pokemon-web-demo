# Fix — résidus de texte sous les espaces (liste Match Call au scroll)

Date : 2026-07-16 · Fichier édité : `src/text.ts` (1 ligne de logique) · `tsc --noEmit` = **0**

## 1. Comportement C établi (le blit écrit-il les pixels de fond ?)

Chaîne de rendu d'un glyphe dans le décomp `src/text.c` :

- **`GenerateFontHalfRowLookupTable`** (text.c:363-396) construit la LUT 4bpp : chaque
  pixel source 2-bit est mappé sur un **index de palette** — `0/3 → bgColor`, `1 → fgColor`,
  `2 → shadowColor`. Les pixels de FOND du glyphe prennent donc la valeur `bgColor`.
- **`DecompressGlyphTile`** (text.c:526-555) décompresse **tous** les pixels de la boîte
  du glyphe dans `gCurGlyph.gfxBuffer*` — fond compris (= `bgColor`).
- **`GLYPH_COPY`** (text.c:572-594), le vrai blit vers la window, ligne clé **text.c:585** :
  ```c
  if ((toOrr = pixelData & 0xF))   // n'écrit QUE si l'index mappé != 0
  ```
  → un pixel n'est écrit **que si son index de palette final != 0**. Donc :
  - `bgColor != 0` : les pixels de fond (= `bgColor`, non nul) **sont écrits** → l'ancien
    contenu de la boîte est **ÉCRASÉ**.
  - `bgColor == 0` (`TEXT_COLOR_TRANSPARENT`) : les pixels de fond valent 0 → **sautés** →
    l'ancien contenu est **préservé** (transparent).
- **`RenderText`** (text.c:1147) appelle **`CopyGlyphToWindow` INCONDITIONNELLEMENT**, y
  compris pour l'espace (char 0). Le glyphe d'espace = boîte entièrement de fond → il écrit
  `bgColor` sur toute sa boîte quand `bgColor != 0`.

**Contexte liste Match Call** : `pokenav_match_call_gfx.c:883` → `FONT_NARROW`. Font info
`FONT_NARROW` : **`bgColor = 1`** (WHITE, text.c:191-199). `LoopedTask_PrintListItems`
(pokenav_list.c:214-244) réimprime les items **par-dessus** l'ancien texte SANS erase (buffer
circulaire de 16 lignes, `unkA`). Le nettoyage vient donc **uniquement** du fond du glyphe
(bgColor=1) écrit par-dessus → sur GBA, aucun résidu. **Hypothèse user CONFIRMÉE.**

## 2. Divergence trouvée (`src/text.ts`)

- Le blit `blitGlyphToWindow` (text.ts:1578-1621) est **déjà 1:1** : il mappe le fond
  (case `0/3 default`) sur `bgColor` et ne saute que si `bgColor === 0` — équivalent exact
  du `if (pixelData & 0xF)` du C. **Pas de bug ici.**
- `AddTextPrinterParameterized` (text.ts:1205) résout `bgColor` via `GetFontAttribute` →
  `FONT_NARROW` rend bien **bgColor=1** (text.ts:334). **Pas de bug ici.**
- **LA DIVERGENCE** = `RenderText`, **text.ts:1030** (avant fix) :
  ```ts
  if (renderedByte !== 0) CopyGlyphToWindow(printer);   // <-- SAUTE le glyphe d'espace
  ```
  Une « garde whitespace » maison sautait `CopyGlyphToWindow` pour l'espace (char 0),
  contrairement au `CopyGlyphToWindow` **inconditionnel** de text.c:1147. Résultat : la boîte
  de l'espace (qui aurait écrit bgColor=1 par-dessus) n'était **jamais** blittée → l'ancien
  texte restait visible **sous les espaces** au re-print sans erase. Vérifié : le glyphe
  d'espace de `latin.latfont.json` (`narrow[0]`) est bien une boîte 16×16 de valeur 0 →
  blittée avec bgColor=1 elle nettoie.

## 3. Diff appliqué

`src/text.ts:1027-1030` → `CopyGlyphToWindow(printer);` **inconditionnel** (1:1 text.c:1147),
commentaire mis à jour. Justification de non-régression :
- `bgColor == 0` (dialogues à texte transparent) : le blit saute les pixels de fond (index 0)
  → résultat **identique** au skip. Aucun changement.
- `bgColor == 1` sur fond déjà rempli `PIXEL_FILL(1)` (dialogues/menus standard, `DrawDialogueFrame`
  menu.c:219) : blanc-sur-blanc = **no-op visuel**. Cadres décorés = tiles de bordure hors
  buffer texte → intacts.
- L'avance curseur (`currentX += gCurGlyph.width`, text.ts:1036-1044) est **indépendante** du
  blit → l'ancien argument « évite les mots collés » était erroné ; aucun impact d'espacement.

## 4. Verdict « COLLEC » — **FIDÈLE au décomp, AUCUN fix**

`gTrainerClassNames[][13]` (max 12 chars visibles) — `trainer_class_names.h:9` :
```c
[TRAINER_CLASS_COLLECTOR] = _("COLLEC"),
```
La ROM française nomme réellement cette classe **« COLLEC »** (Game Freak a tronqué
« Collectionneur », trop long pour le tableau 13 bytes ; cf. « TOPDRESSEUR », « ORNITHOLOGUE »,
« MADEMOISELLE » = 11-12 chars). Notre `public/decomp/em/trainer-class-names-fr.json`
(`"TRAINER_CLASS_COLLECTOR": "COLLEC"`) est **byte-exact** avec le décomp. Le pipeline
d'impression liste (window 17 tiles = 136px, `GetStringClearToWidth` copie le nom ENTIER puis
`{CLEAR}` de padding, `StringCopy`/`GetStringWidth`) est 1:1 et **ne clippe pas**. Ce n'est
donc **pas** une troncature de rendu : c'est le nom authentique. Ne rien changer.

## 5. Écrans à re-tester EN JEU (par le lead)

1. **Liste Match Call, SCROLL** (haut/bas au-delà de 8 entrées) : plus aucun résidu sous les
   espaces ni entre les mots des noms réimprimés (« PkMn RANGER », « JEUNE COUPLE »…).
2. **Dialogues terrain** sur cadre décoré (PNJ, panneau) + `\p`/`\l` (page/scroll) : aucun
   changement, texte net, cadre intact.
3. **Un menu standard** (Start menu / Sac / options) : espacement des mots inchangé, pas de
   « mots collés » ni de fond parasite.

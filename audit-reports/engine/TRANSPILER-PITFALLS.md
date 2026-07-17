# Pièges transpileur c→ts — audit préventif des 4 familles (2026-07-16)

> Généré le **2026-07-16** · régénération : `node scripts/audit-transpiler-pitfalls.cjs` · **LECTURE SEULE**.
> Scanne `src/` (.ts). Priorités par atteignabilité (grep call-sites `src/`+`harness/`) :
> **P1** = fn hôte référencée + écran câblé aujourd'hui (pokenav_*/region_map/credits/field_screen_effect) ou code top-level ·
> **P2** = fn hôte référencée ailleurs · **P3** = fn hôte jamais référencée (inerte). Approfondir : `node scripts/decomp-index.cjs --sym <fn>`.

| Famille | P1 | P2 | P3 | Total |
|---|--:|--:|--:|--:|
| (a) getString nu → scanner EOS | 0 | 0 | 0 | **0** |
| (b) pointer-arith sur tables | 0 | 0 | 0 | **0** |
| (c) tables d'anim en objets | 3 | 0 | 0 | **3** |
| (d) boucles à invariant perdu | 0 | 0 | 0 | **0** |

**Contexte** — deux bugs réels payés le 2026-07-16, même famille transpileur :
1. **FREEZE navigateur** : `getString('gText_RibbonsF700')` (string JS) → `DynamicPlaceholderTextUtil_ExpandPlaceholders` 
   dont le scan `while (src[s] !== 0xFF)` ne trouve jamais l'EOS → boucle synchrone infinie (fix `a49d8f6e9`).
2. **CRASH écran** : `SetWordTaskArg(taskId, 1, (sPokenavBgDotsPal + 1))` — pointer-arith C transpilée telle quelle (fix `87236a0e6`).
Et un défaut latent : tables `sAffineAnim_*` transpilées en OBJETS `{type,frame,loop}` au lieu de tableaux de commandes.

---

## Famille (a) — `getString(...)` nu vers un scanner EOS / écrivain buffer — 0 finding(s)

Fonctions-puits (établies en lisant `src/string_util.ts`, `src/text.ts`, `src/dynamic_placeholder_text_util.ts`,
`src/international_string_util.ts`) : `StringCopy`, `StringCopy_Nickname`, `StringGet_Nickname`, `StringCopy_PlayerName`, `StringAppend`, `StringCopyN`, `StringAppendN`, `StringLength`, `StringCompare`, `StringCompareN`, `IsStringLengthAtLeast`, `StringFill`, `StringCopyPadded`, `StringFillWithTerminator`, `ConvertIntToDecimalStringN`, `ConvertUIntToDecimalStringN`, `ConvertIntToHexStringN`, `StringBraille`, `StringCopyN_Multibyte`, `StringLength_Multibyte`, `WriteColorChangeControlCode`, `IsStringJapanese`, `IsStringNJapanese`, `StringCompareWithoutExtCtrlCodes`, `ConvertInternationalString`, `StripExtCtrlCodes`, `StringExpandPlaceholders`, `DynamicPlaceholderTextUtil_ExpandPlaceholders`, `DynamicPlaceholderTextUtil_SetPlaceholderPtr`, `PadNameString`, `ConvertInternationalPlayerName`, `ConvertInternationalPlayerNameStripChar`, `ConvertInternationalContestantName`, `StringAppendWithPlaceholder`, `CopyMonCategoryText`, `GetStringClearToWidth`, `RenderTextHandleBold`.

Sévérités : **FREEZE** = scan EOS non borné (boucle infinie synchrone = freeze dur navigateur) · **crash** = TypeError/throw ·
**garbage** = boucle bornée, écrit/retourne du garbage sans planter.

*(aucun — les occurrences certaines ont été fixées le 2026-07-16, cf. ci-dessous)*

**Fixes (a) appliqués le 2026-07-16** (encodeOwText(getString(...)), buffer .c d'origine cité en commentaire) :
- `src/pokenav_conditions_search_results.ts` `PrintSearchResultListMenuItems` — `DynamicPlaceholderTextUtil_ExpandPlaceholders(gStringVar2, getString('gText_NumberIndex'))` 
  = FREEZE en puissance identique au bug `a49d8f6e9` (décomp strings.c:994 `_("Nº {DYNAMIC 0}")`, call-site pokenav_conditions_search_results.c:674).
- `src/mystery_event_script.ts` `MEScrCmd_givepokemon` ×2 — `StringCopyN(gStringVar1, getString(...) as unknown as Uint8Array, …)` : le cast forcé
  copiait du garbage sans EOS (décomp strings.c:21-22 `gText_EggNickname`/`gText_Pokemon`, call-sites mystery_event_script.c:325/327).

**Puits GARDÉS** (anti-string-JS à l'entrée — PAS flaggés) :
- GetStringWidth (text.ts:498 — instanceof Uint8Array ? : encodeStringForFont)
- GetStringRightAlignXOffset / GetStringCenterAlignXOffset (text.ts — délèguent à GetStringWidth)
- GetStringCenterAlignXOffset / GetStringRightAlignXOffset / …WithLetterSpacing / GetStringWidthDifference (international_string_util.ts — acceptent string)
- TVShowConvertInternationalString (international_string_util.ts:43 — typeof src === string → encodeOwText)
- GetNicknameLanguage (international_string_util.ts:51 — typeof string → LANGUAGE_ENGLISH)
- StringExpandPlaceholders arg src (string_util.ts:624 — bridge encodeOwText différé ; ⚠ si le module text n'est pas encore chargé, src devient [EOS] silencieusement)
- AddTextPrinter / AddTextPrinterParameterized (text.ts — instanceof Uint8Array ? : encodeStringForFont)
- StringCopy arg src (string_util.ts:121 — GARDE MOTEUR throw, transforme le freeze en crash HURLANT ; le call-site reste un bug)

---

## Famille (b) — pointer-arith C sur tables/buffers — 0 finding(s)

`<table> + <n>` / `<table>++` où `<table>` est un tableau (suffixe Pal/Tiles/Tilemap/Gfx/Pointers/Table ou déclaré TypedArray
dans le fichier). En JS `array + 1` = concat string = garbage. `arr[i + 1]` (index) N'est PAS matché. **NE PAS fixer en
aveugle** : chaque cas exige le `.c` en regard (l'intention est un OFFSET dans la table → Map d'offsets ou `.subarray`, cf. fix `87236a0e6`).

*(aucun)*

---

## Famille (c) — tables d'anim transpilées en OBJETS — 3 finding(s)

Forme MALFORMÉE (transpileur, `union AnimCmd sAnim_X[]` → objet) : `const sAnim_X = { type: ANIMCMD_FRAME(...), frame: …, loop: … }`.
Forme SAINE attendue (cf. `registerAffineAnim('sAffineAnim_StarterPokemon', { frames: [...] })` dans `src/starter_choose.ts:94`,
ou tableaux de refs comme `sAffineAnims_RibbonIconBig = [ ... ]`) : un TABLEAU de commandes, pas un objet à clés `{type,frame,loop,jump,end}`.
Inerte tant que le chemin sprite rejette l'objet, mais **l'anim ne jouera jamais** → à re-transcrire avec le `.c` en regard.

| Prio | Fichier:ligne | Table | Clés bidon | Contient ANIMCMD | Extrait |
|---|---|---|---|---|---|
| **P1** | `src/pokenav_ribbons_summary.ts:1407` | `sAffineAnim_RibbonIconBig_Normal` | type,frame | oui | const sAffineAnim_RibbonIconBig_Normal = { |
| **P1** | `src/pokenav_ribbons_summary.ts:1412` | `sAffineAnim_RibbonIconBig_ZoomIn` | type,frame,loop | oui | const sAffineAnim_RibbonIconBig_ZoomIn = { |
| **P1** | `src/pokenav_ribbons_summary.ts:1418` | `sAffineAnim_RibbonIconBig_ZoomOut` | type,frame,loop | oui | const sAffineAnim_RibbonIconBig_ZoomOut = { |

---

## Famille (d) — boucles while/do-while à invariant perdu (HEURISTIQUE) — 0 finding(s)

Aucune variable de la condition modifiée dans le corps, ET pas de `break`/`return`/`throw`/`await`/`yield`, ET pas d'appel
de fonction dans la condition. Analyse TEXTUELLE par accolades équilibrées — chaque finding est à vérifier à la main
(une mutation via aliasing/propriété peut échapper au détecteur, dans les deux sens).

*(aucun)*

---

_Fin du rapport — 3 findings, généré par `scripts/audit-transpiler-pitfalls.cjs` le 2026-07-16._
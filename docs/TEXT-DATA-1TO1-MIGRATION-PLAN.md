# 🅰️ MIGRATION TEXTE 1:1 — re-encodage data charmap (décision user 2026-06-05)

> Sous-chantier du MIROIR 1:1 (cf. `docs/MIRROR-1TO1-LEDGER.md`). C'est **le nœud
> gStringVar1-4** annoncé. User a CHOISI l'option la PLUS 1:1 (« Ré-encodage data 1:1 »)
> via AskUserQuestion. = GROS, multi-sessions, A/B sur TOUT le texte du jeu.

## 🔍 La racine non-1:1 (3 mondes de texte, 2 représentations de placeholders)
| Monde | Stockage | Placeholders | Expander | Renderer |
|---|---|---|---|---|
| **OW/menus/scripts** | **JS-string** | tokens ASCII `{STR_VAR_1}` `{PLAYER}` `{RIVAL}` — **174 fichiers** `decomp-data/auto-asm/data/**/scripts-data.ts` + `event_scripts-data.ts` | regex JS-string `gba-text-system.ts:599` | **ASCII** (`AddTextPrinterParameterized` gba-text-system.ts:353-361 `String.fromCharCode`) |
| **Combat** | `Uint8Array` charmap | bytes `0xFD`+`B_TXT_*` | byte-level `battle-message.ts:429` (déjà 1:1) | byte-level (battle décodeur) |
| **Décomp (CIBLE)** | `u8*` charmap | bytes `0xFD`(PLACEHOLDER_BEGIN)+`PLACEHOLDER_ID_*` | `string_util.c StringExpandPlaceholders` | `text.c` RenderText (glyphe par **index charmap**) |

**Le `StringExpandPlaceholders` décomp scanne des bytes `0xFD <id>`. Nos data OW = tokens ASCII `{...}`.**
Même classe de divergence qu'event_data (`Record` nom vs `flags[id]`) et pokemon (PokemonInstance vs BoxMon),
mais diffusée dans **174 fichiers data + le renderer glyphe + ~57 callers + save (playerName)**.

## 🎯 Cible 1:1
- `gStringVar1[0x100]` `gStringVar2[0x100]` `gStringVar3[0x100]` `gStringVar4[0x3E8]` `sUnknownStringVar[16]` = `Uint8Array` charmap (mirror `string_util.ts`).
- `StringExpandPlaceholders`/`GetExpandedPlaceholder`/14×`ExpandPlaceholder_*` byte-level (mirror).
- Strings data = bytes charmap avec `0xFD <id>` (= 1:1 `strings.h` décomp).
- Renderer OW = consomme des bytes charmap, glyphe décodé par **index charmap** (port `text.c`).
- gSaveBlock2.playerName = `u8[]` (couplage save, cf. migration pokemon/save).

## 🪜 PLAN STAGÉ (chaque stage = tsc 0 + vérif ; flag d'A/B style voie V/L combat)
**⚠️ Dépendance clé** : ré-encoder la data en bytes (Stage 1) CASSE le renderer ASCII actuel →
le **renderer byte-level (Stage 2) doit exister derrière un flag** avant de flipper la data par défaut.
Recommandé : **flag `__USE_DECOMP_TEXT__`** (comme `__USE_DECOMP_BATTLE_LOOP__`) → voie ASCII intacte tant qu'OFF.

- **Stage 0 — Cœur byte-level 1:1 (mirror, NON-breaking)** : ✅ **FAIT + VÉRIFIÉ HEADLESS (2026-06-05).**
  - `src/game/string_util.ts` : buffers EWRAM `gStringVar1[0x100]/2/3[0x100]/4[0x3E8]` (Uint8Array `export const`) + `sUnknownStringVar[16]` (static) ; `StringExpandPlaceholders` (récursif, 1:1 string_util.c:335 — sémantique pointeur `subarray`) ; 14× `ExpandPlaceholder_*` + table `sExpandPlaceholderFuncs` (init désigné par `PLACEHOLDER_ID_*`) + `GetExpandedPlaceholder` (c:499). ⚠️ le **fallthrough** du switch ext-ctrl décomp (COLOR_HIGHLIGHT_SHADOW=3 args / PLAY_BGM=2 / default=1 / 7 codes=0) est rendu par un **compteur `nArgs` + boucle** (tsconfig `noFallthroughCasesInSwitch:true` interdit le fallthrough non-vide) = byte-pour-byte identique.
  - `src/game/strings.ts` (+ `include/strings.ts`) NOUVEAU = miroir PARTIEL de strings.c : les 12 `gText_ExpandedPlaceholder_*` FR (`EMERAUDE/AQUA/MAGMA/ARTHUR/MAX/KYOGRE/GROUDON/BRICE(♂)/FLORA(♀)` + `Empty/Kun/Chan`=vides). **Bridge transitoire d'encodage** `InitTextData(charmap)` + `EncodePlayerNameFR` = analogue RUNTIME du préproc `_("…")` (build-time décomp) ; à appeler une fois au boot (Stage 3). Stage 1 ré-encodera la data au build → ce runtime-encode disparaît.
  - Bridge `ExpandPlaceholder_PlayerName` : lit `gSaveBlock2Ptr.playerName` (JS-string aujourd'hui → encode via charmap dans un buffer statique ; `Uint8Array` natif retourné direct au Stage 4).
  - **Vérif headless 18/18** (preview, `import('/src/game/string_util.ts')` + `include/strings` + `InitTextData(charmap)`) : VERSION→EMERAUDE, STR_VAR_1/2/3, RIVAL♂→FLORA / RIVAL♀→BRICE, KUN♂/♀→vide, PLAYER→RED + accent (RÉMI/É), id99→Empty, combo `A{VAR1}B`, placeholder×2, ext-ctrl 0/1/2/3 args, ext-ctrl+placeholder mêlés. tsc 0 ; dédup-check : seule dup = `StringExpandPlaceholders` ×2 (gba-text-system ASCII + miroir byte-level = **dup TRANSITOIRE assumée** du flag, à consolider Stage 3/5).
  - ⚠️ **Leçon runtime** : `string_util` (miroir) lit la **même instance `save-block-state` que `window.gSaveBlock2Ptr`** ; un `import('/src/engine/save/save-block-state.ts')` séparé en eval = instance HMR distincte (set non vu). → muter via `window.gSaveBlock2Ptr` (cf. règle ledger « globals runtime »). De même, init des placeholders via la chaîne `include/strings` (pas un import direct de strings.ts) après un **reload** (purge les query `?t=` HMR divergents).
  - Rien de live ne l'appelle encore → 0 risque. _(C'était la seule partie autonome-sûre ; le reste = flag + A/B.)_
- **Stage 1 — Extraction : token→byte** : ◑ **CŒUR FAIT + VÉRIFIÉ ÉQUIVALENCE (2026-06-05)** — `encodeOwTextSource` (src/game/text.ts) encode notre format OW (JS-string + tokens `{…}` + `\n`/`\l`/`\p`) en **bytes charmap** : `{STR_VAR_1}`→`[0xFD,0x02]`, `{PLAYER}`→`[0xFD,0x01]`, `{RIVAL}`→`[0xFD,0x06]`, `{KUN}`→`[0xFD,0x05]`, `{STR_VAR_2/3}` (map via `PLACEHOLDER_ID_*`) ; le reste (glyphes, `\n`→0xFE, `\l\p`, `{COLOR ...}`/`{LV_2}`… ext-ctrl/EXTRA_SYMBOL) délégué à `encodeStringForFont` (encodeur charmap canonique, **0 dup**, calqué sur `encodeTemplate` battle-message). **Vérif HEADLESS 10/10 par ÉQUIVALENCE-BYTES** : `StringExpandPlaceholders(byte)(encodeOwTextSource(src))` === `encodeStringForFont(StringExpandPlaceholders(JS)(src))` sur 10 chaînes OW réelles (placeholders STR_VAR/PLAYER/RIVAL/KUN, accents Ç/é, `POKé`, `\n`, `\p`, `{COLOR RED}…{COLOR DARK_GRAY}`). = la voie byte produit byte-pour-byte le MÊME résultat que la voie ASCII actuelle → dérisque la régénération. **RESTE (= flag + A/B user)** : intégrer `encodeOwTextSource` à l'extraction `scripts/extract-*` (régénérer les 174 fichiers en bytes ; en node = ré-impl ou exécuter via le runtime) + vérif byte-for-byte vs ROM décomp.
- **Stage 2 — Renderer byte-level** : ✅ **ESSENTIELLEMENT DÉJÀ FAIT (engine).** `gba-text-printer.ts` = port (1:1, simplifié) de text.c : `runTextPrinter` (= RenderText, text.c:934), les `RENDER_STATE_*`, `addTextPrinter` (= AddTextPrinter), `encodeStringForFont`, glyphes (HW window/blit/DMA) — **consomme déjà des bytes charmap** (prouvé par le combat byte-level `battle-message`). Le renderer accepte `Uint8Array` (`AddTextPrinterParameterized`/`AddTextPrinterForMessage`, gba-text-system). RESTE (1:1 strict, plus tard) = relocaliser dans le miroir `src/game/text.ts`. **Flag `__USE_DECOMP_TEXT__` posé** (text.ts `isDecompTextEnabled()`, défaut OFF, style `__USE_DECOMP_BATTLE_LOOP__`).
- **Stage 3 — Flip gStringVar + 57 callers** : gStringVar1-4 = mirror Uint8Array canonique ; migrer les ~57 callers (`StringExpandPlaceholders`, `gStringVarN = …`) pour écrire des bytes (helpers `GetItemName`/`GetMonNickname`/etc. → renvoient bytes). Retirer le `StringExpandPlaceholders` JS-string (gba-text-system) = miroir devient unique. **A/B** chaque écran majeur. **Dé-dup** : easy-chat-render `_gStringVar2/4` → canonique mirror.
- **Stage 4 — save playerName** : ✅ **FAIT (2026-06-24, `8e8699a4`).** `gSaveBlock2.playerName` →
  `number[]` de bytes charmap (round-trip JSON.stringify, comme `flags` ; un `Uint8Array` ne
  round-trip pas). `ExpandPlaceholder_PlayerName` retourne les bytes DIRECT (plus de round-trip
  d'encodage). Accesseurs transitoires `GetPlayerName`/`GetPlayerNameString`/`SetPlayerName`
  (string-buffers.ts), robustes au format LEGACY (ancienne save = string). ~22 consommateurs
  encore JS-string migrés vers `GetPlayerNameString` (décode accent-correct). **Pré-requis fix
  `decodeOwBytes`** (`72dce8b3`) : le charmap FR a des collisions byte latin↔kana (byte 6 = 'É'
  ET 'か') → le reverse-map naïf rendait 'É'→'か' (RÉMI→RかMI) ; fix = protéger le glyphe latin.
  A/B en jeu : nom "RÉMI" → menu Start « RÉMI » (É correct). **RESTE (Stage 4b, séparé)** :
  `mail.playerName` (champ struct Mail) encore string — décode transitoire dans BufferMailText.
- **Stage 5 — flip défaut + retrait flag + retrait voie ASCII** : quand A/B complet OK.

## 📌 POINTERS (recherche faite 2026-06-05)
- Renderer OW entry : `gba-text-system.ts:350` `AddTextPrinterParameterized` (string|Uint8Array → ASCII).
- gStringVar JS-string + getters globalThis : `gba-text-system.ts:177-215`. StringExpand JS-string : `:599`.
- charmap : `public/decomp/em/ui/charmap.json` ; encoder existant : `encodeStringForFont` (gba-text-system).
- Battle byte-level (modèle de référence) : `battle-message.ts` (`encodeTemplate`, `BattleStringExpandPlaceholders:429`, `PLACEHOLDER_BEGIN=0xFD`).
- Placeholder ids : `decomp-data/include/constants/characters-data.ts` (`PLACEHOLDER_ID_STRING_VAR_1=2`, `_PLAYER=1`, `_RIVAL=6`, `_KUN=5`, `_VERSION=7`, `_AQUA=8`…`_GROUDON=13`, `_UNKNOWN=0`).
- Décomp source : `string_util.c:335` StringExpandPlaceholders, `:499` GetExpandedPlaceholder, `:423-497` ExpandPlaceholder_*. `gText_ExpandedPlaceholder_*` dans `src/strings.c`/`strings.h` (FR via la trad).
- Extraction scripts candidates : `scripts/extract-decomp-asm.mjs` / `extract-decomp.mjs` (génèrent `auto-asm/data/`).

## ✅ Pré-requis déjà faits
- Toute la surface SANS-ÉTAT de string_util.c (Length/Copy/Append/Convert*/Multibyte/ext-ctrl/Japanese/Braille) = portée 1:1 + vérifiée (cf. ledger). Le byte-level expand s'appuie dessus (StringCopy etc.).

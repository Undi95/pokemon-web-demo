# AUDIT ENGINE — strings-util (string_util / international_string_util / dynamic_placeholder_text_util)

Date : 2026-07-16 · Lecture seule · Réf : `D:/Projet 1/decomps/pokeemeraude`
Constantes charmap vérifiées une à une (`include/constants/characters.ts` vs `characters.h`) :
CHAR_SPACER 0x77, CHAR_0-9 0xA1-0xAA, CHAR_? 0xAC, CHAR_A-F 0xBB-0xC0, CHAR_DYNAMIC 0xF7,
CHAR_EXTRA_SYMBOL 0xF9, 0xFA/0xFB/0xFC/0xFD/0xFE/0xFF, EXT_CTRL_CODE_* 0x00-0x18,
PLACEHOLDER_ID_* 0x0-0xD, JAPANESE_CHAR_END 0xA0, NUM_BRAILLE_CHARS 0x40 — **toutes identiques**.
Idem `STR_CONV_MODE_*` (include/string_util.ts:13-15 = string_util.h:9-14), `PLAYER_NAME_LENGTH 7`,
`POKEMON_NAME_LENGTH 10`, `MALE 0`, `LANGUAGE_JAPANESE 1 / ENGLISH 2`, `FONT_BRAILLE 6` (text.h:10-21).

---

## A) string_util.c (782 l.) → src/string_util.ts

**Compteurs : 44 fonctions C (29 publiques + 15 static) → 44 portées. 41 ✅ · 3 🟡 (2 bridges documentés + 1 micro).**
**Data : gStringVar1/2/3/4 (0x100/0x100/0x100/0x3E8) ✅ · sUnknownStringVar[16] ✅ · sDigits (16 CHAR_*) ✅ · sPowersOfTen ✅.**
**Verdict : PORT COMPLET, corps 1:1. gStringVar1-4 byte-level = LA voie live (importés par 20+ modules : text.ts, match_call.ts, party_menu.ts, tv.ts…). Une seule définition dans le repo (string_util.ts:60-63) — plus de doublon JS-string.**

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| StringCopy_Nickname | ✅ | 28 | ts:84 | limite POKEMON_NAME_LENGTH, retour `subarray(i)` = `&dest[i]` |
| StringGet_Nickname (= « StringGetEnd10 » R/S) | ✅ | 45 | ts:97 | utilisé (pokenav ×4, tv, scrcmd, battle_message) |
| StringCopy_PlayerName | ✅ | 58 | ts:108 | PLAYER_NAME_LENGTH=7 ✅ |
| StringCopy | ✅ | 75 | ts:121 | |
| StringAppend | ✅ | 88 | ts:133 | |
| StringCopyN | ✅ | 96 | ts:142 | ne pose PAS d'EOS (1:1). `n` non masqué u8 — aucun caller >255 |
| StringAppendN | ✅ | 106 | ts:149 | |
| StringLength | ✅ | 114 | ts:157 | |
| StringCompare | ✅ | 124 | ts:165 | |
| StringCompareN | ✅ | 137 | ts:177 | `--n === 0` 1:1 |
| IsStringLengthAtLeast | ✅ | 152 | ts:191 | corps 1:1 (aucun caller décomp src/ non plus — inerte des deux côtés) |
| ConvertIntToDecimalStringN | ✅ | 163 | ts:234 | **3 modes exacts** : LEFT (WAITING), RIGHT_ALIGN (WRITING_SPACES→CHAR_SPACER 0x77), LEADING_ZEROS (WRITING_DIGITS). `u16 digit` = `Math.trunc()&0xFFFF` ✅ (négatifs → '?' comme C) |
| ConvertUIntToDecimalStringN | ✅ | 219 | ts:269 | idem ; bit-ops JS mod 2^32 = wrap u32 OK pour valeurs jeu |
| ConvertIntToHexStringN | 🟡 micro | 275 | ts:304 | `u32 digit` C non répliqué : `value<0` → C écrit '?' (cast u32 énorme), TS `digit=-1 ≤ 0xF` → `sDigits[-1]`=undefined → byte 0. **Seul caller = rtc.ts (×7, valeurs ≥ 0)** — jamais atteint en jeu |
| StringExpandPlaceholders | ✅ (+rustine) | 335 | ts:617 | Récursion PLACEHOLDER_BEGIN ✅. Fallthrough C (COLOR_HIGHLIGHT_SHADOW→3, PLAY_BGM→2, default→1, 7 codes→0) converti en `nArgs` **byte-identique** (flag noFallthrough retiré, mais conversion correcte). ⚠ rustine src `string` (cf. RUSTINES #1) |
| StringBraille | ✅ | 385 | ts:347 | setBrailleFont/gotoLine2 1:1, `c+NUM_BRAILLE_CHARS & 0xFF` = wrap u8 C. Aucun caller (décomp Emerald non plus) — inerte |
| ExpandPlaceholder_UnknownStringVar | ✅ | 423 | ts:684 | sUnknownStringVar jamais écrit (1:1 Emerald) |
| ExpandPlaceholder_PlayerName | 🟡 bridge | 428 | ts:693 | 1:1 si `playerName` = Uint8Array ; sinon bridge number[]/string→`_sPlayerNameBytes` (Stage 4 purge) |
| ExpandPlaceholder_StringVar1/2/3 | ✅ | 433/438/443 | ts:711-715 | |
| ExpandPlaceholder_KunChan | ✅ | 448 | ts:718 | MALE→Kun ; FR : Kun=Chan=`_("")` (strings.c:8-9) ✅ |
| ExpandPlaceholder_RivalName | ✅ | 456 | ts:726 | MALE→May(FLORA), sinon Brendan(BRICE) — inversion voulue du décomp respectée |
| ExpandPlaceholder_Version/Aqua/Magma/Archie/Maxie/Kyogre/Groudon | ✅ | 464-497 | ts:734-746 | |
| GetExpandedPlaceholder | ✅ | 499 | ts:771 | **table 14/14 (0x0-0xD)** par PLACEHOLDER_ID_* ; hors borne → gText_ExpandedPlaceholder_Empty ✅. (Table C locale-static → module-level TS, contenu identique) |
| StringFill | ✅ | 527 | ts:200 | |
| StringCopyPadded | ✅ | 538 | ts:211 | wrap u16 `(n-1)&0xFFFF` / `!== 0xFFFF` 1:1 |
| StringFillWithTerminator | ✅ | 560 | ts:228 | caller décomp = battle_records.c (link, hors solo) |
| StringCopyN_Multibyte | ✅ | 565 | ts:387 | boucle u32 `(i-1)>>>0 !== 0xFFFFFFFF` 1:1 ; callers décomp = union_room_chat (link) |
| StringLength_Multibyte | ✅ | 587 | ts:405 | callers décomp = union_room_chat + UnusedDrawTextWindow (UNUSED) |
| WriteColorChangeControlCode | ✅ | 602 | ts:422 | pose l'EOS final ✅ (consolidation easy_chat notée en commentaire) ; callers : easy_chat ×4 |
| IsStringJapanese / IsStringNJapanese | ✅ | 629/642 | ts:444/457 | |
| GetExtCtrlCodeLength | ✅ | 657 | ts:502 | **table 25 entrées [0..0x18] toutes vérifiées** (COLOR_HIGHLIGHT_SHADOW=4, PLAY_BGM/PLAY_SE=3…) |
| SkipExtCtrlCode (static) | ✅ | 694 | ts:511 | module-privé ✅ |
| StringCompareWithoutExtCtrlCodes | ✅ | 705 | ts:522 | retVal −1/+1/EOS 1:1 (battle_main, egg_hatch, save-blocks) |
| ConvertInternationalString | ✅ | 739 | ts:556 | arithmétique u8 wrap `&0xFF`/`!==0xFF` 1:1 ; `s[i+2]` promotion int respectée |
| StripExtCtrlCodes | ✅ | 764 | ts:578 | |

Surface `include/string_util.h` (29 protos) : intégralement ré-exportée par `include/string_util.ts` ✅.
`StringIsEqual` (mentionné au brief) : **n'existe pas dans le décomp pokeemeraude** → N/A.

---

## B) international_string_util.c (288 l.) → src/international_string_util.ts

**Compteurs : 18 fonctions + 1 data → 18 + 1 portées (le fichier annonce 18/18 ✅ exact). 15 ✅ · 3 🟡 (1 adaptation harness + 2 bridges data).**
**Verdict : COMPLET. Les 7 fns de LARGEUR (alignements de TOUTE l'UI) sont 1:1 strict ; leur fidélité repose sur `GetStringWidth` (src/text.ts:498, signature inversée `(str, fontId, ls)` — compensée correctement aux 7 call-sites internes). 137 usages / 24 fichiers.**

Audit transpile existant (`audit-reports/transpile/international_string_util.md`) — claims re-vérifiés :
1. « unresolved `ConvertPixelWidthToTileWidth` » → **RÉSOLU** : existe, script_menu.ts:32, corps 1:1 script_menu.c:743-746 ✅.
2. « unresolved `gTrainerClassNames` » → **RÉSOLU par bridge** : `globalThis.gameDataTrainerClassesFr` posé par engine/data/game-data.ts:219 ✅ (fallback silencieux, cf. RUSTINES #5).
3. « gText_Eleve/Dresseur/Champion → getString » → **VÉRIFIÉ** : strings.json = "ELEVE"/"DRESSEUR"/"CHAMPION" = décomp strings.c:1827-1829 byte-à-byte ✅.
4. « unresolved gWindows/CpuFastFill8 » → résolus par l'adaptation FillWindowPixelRect (cf. tableau).
Ce que l'audit transpile NE couvrait PAS : la sémantique des adaptations (vérifiée ci-dessous) et les call-sites orphelins (section dédiée).

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| GetStringCenterAlignXOffset | ✅ | 15 | ts:77 | délègue WithLetterSpacing(…, 0) 1:1 |
| GetStringRightAlignXOffset | ✅ | 20 | ts:82 | |
| GetStringCenterAlignXOffsetWithLetterSpacing | ✅ | 25 | ts:87 | `/2` → Math.trunc (résultat ≥ 0, exact) |
| GetStringWidthDifference | ✅ | 30 | ts:92 | clamp à 0 1:1. Ordre d'args GetStringWidth inversé compensé ✅ |
| GetMaxWidthInMenuTable | ✅ | 39 | ts:101 | FONT_NORMAL=1 ✅, ConvertPixelWidthToTileWidth ✅ |
| GetMaxWidthInSubsetOfMenuTable | ✅ | 53 | ts:112 | `actions[actionIds[i]]` 1:1 |
| Intl_GetListMenuWidth | ✅ | 67 | ts:123 | `+item_X+9`, `/8`, cap 28 1:1 (item_X existe, list_menu.ts:139) |
| CopyMonCategoryText | ✅ | 88 | ts:140 | categoryName (data FR JS) encodé frontière `encodeOwText` — convention projet ; « French Difference » commenté conservé |
| GetStringClearToWidth | ✅ | 96 | ts:150 | EXT_CTRL_CODE_CLEAR(0x11)+clearWidth, retour = ptr sur EOS (subarray(3)) 1:1, str NULL géré |
| PadNameString | ✅ | 125 | ts:22 | paires [0xFC,RESET_FONT] si padChar=0xFC ✅ (micro : `u8 length` non masqué — noms ≤ 10, sans effet) |
| ConvertInternationalPlayerName | ✅ | 152 | ts:172 | |
| ConvertInternationalPlayerNameStripChar | ✅ | 160 | ts:181 | `buffer >= str` → `b >= 0` 1:1 |
| ConvertInternationalContestantName | ✅ | 185 | ts:199 | short-circuit `str[i++]===… && str[i++]===…` = sémantique C exacte |
| TVShowConvertInternationalString | ✅ | 203 | ts:43 | + frontière `src: string` (save TV) — bridge assumé |
| GetNicknameLanguage | ✅ | 210 | ts:51 | + frontière string→ENGLISH (jamais JPN chez nous) |
| FillWindowTilesByRow | 🟡 adaptation | 219 | ts:222 | C : CpuFastFill8(0x11) sur tileData 4bpp par rangée. Port : FillWindowPixelRect(0x11, col*8, row*8, tiles*8, rows*8) → fillWindowPixelRect (window.ts:68) masque `idx & 0x0F` = **couleur 1 = les 2 nibbles de 0x11** ✅ équivalent (harness = pixelBuffer 1 B/px, pas de tileData). Guard `numRows > 0` conservé. Utilisé par Match Call (testé en jeu 2026-07-16) |
| StringAppendWithPlaceholder | ✅ | 241 | ts:235 | copie `text[32]` AVANT écriture (aliasing dest=placeholder voulu) 1:1 ; callers décomp = berry_blender/secret_base (à câbler avec ces fichiers) |
| GetTrainerClassNameGenderSpecific | 🟡 bridge data | 267 | ts:285 | Logique 1:1 (SCHOOL_KID♀→ELEVE, RIVAL/RS_PROTAG♀→DRESSEUR, LEADER+«LEVY&TATIA»→CHAMPION). gTrainerClassNames → `_gTrainerClassName()` (reverse-map constantes + globalThis) — cf. RUSTINES #5 |
| gText_LevyTatia (data) | 🟡 | 265 | ts:260 | `const u8[]` → **fonction lazy** `gText_LevyTatia()` (anti-TDZ cycle text.ts, cf. leçon match_call) — interne au module, OK |

---

## C) dynamic_placeholder_text_util.c (49 l.) → src/dynamic_placeholder_text_util.ts

**Compteurs : 4 fonctions + 1 data → 4 + 1 portées. 4 ✅. Verdict : 1:1 STRICT, câblé (text.ts + 4 écrans pokenav/summary/storage, 50 occurrences).**

| Fonction | Statut | C:ligne | Port | Détail |
|---|---|---|---|---|
| sStringPointers[8] (data) | ✅ | 6 | ts:25 | 8 slots null |
| DynamicPlaceholderTextUtil_Reset | ✅ | 8 | ts:28 | |
| DynamicPlaceholderTextUtil_SetPlaceholderPtr | ✅ | 15 | ts:35 | garde `idx >= 0` ajoutée (u8 C ne peut être négatif — inoffensif) |
| DynamicPlaceholderTextUtil_ExpandPlaceholders | ✅ | 23 | ts:50 | CHAR_DYNAMIC(0xF7)+idx → StringCopy du slot (skip si NULL) ; avancement via `before.length - after.length` = ptr C exact ; EOS final + retour subarray ✅ |
| DynamicPlaceholderTextUtil_GetPlaceholderPtr | ✅ | 45 | ts:42 | C : lecture OOB brute si idx>7 ; TS : `?? null` — plus sûr, aucun caller OOB |

---

## 🚨 MANQUES CRITIQUES

1. **⛔ `GetTrainerClassNameFromId` + `GetTrainerNameFromId` (pokemon.c:6945-6957, « French Difference ») ABSENTS du port** (0 occurrence dans src/). Conséquence directe → #2 et #3.
2. **🟠 scrcmd.ts:1100/1107 (`buffertrainerclassname`/`buffertrainername`, scrcmd.c:2272-2288)** : utilisent des helpers maison `getTrainerClassNameFr`/`getTrainerNameFr` au lieu de `GetTrainerClassNameFromId→GetTrainerClassNameGenderSpecific`. Sautent : classes ♀ FR (ELEVE/DRESSEUR), CHAMPION pour LEVY&TATIA, clamp `trainerId ≥ TRAINERS_COUNT → TRAINER_NONE`.
3. **🟠 battle_message.ts:648 `_resolveTrainerClassNameFr` maison** au lieu de `GetTrainerClassNameGenderSpecific` — la décomp l'appelle 3× (battle_message.c:2605/2754/2805, B_TXT_TRAINER1/2_CLASS avec `encounterMusic_gender & 0x7F`). Classes de dresseurs ♀ fausses en combat + fallback 'DRESSEUR' en dur. **Même famille que la dette systémique « gTrainers[].trainerClass=0 au bridge » déjà en mémoire.**
4. Aucun manque en A (44/44) ni en C (4/4). Table placeholders 14/14 complète, modes ConvertIntToDecimalStringN exacts.

## RUSTINES À PURGER (après fix moteur)

1. **string_util.ts:614-618** : bridge `src: string` de StringExpandPlaceholders — `void import('./text').then(…)` **SANS `.catch`** (viole Règle 3) + fallback **silencieux** `[EOS]` si l'import n'est pas résolu (doit HURLER). Purge = migrer les textes pré-camion en bytes.
2. **string_util.ts:693-708** : `ExpandPlaceholder_PlayerName` bridge 3 voies (Uint8Array/number[]/JS-string + `EncodePlayerNameFR`) — purge au Stage 4 (playerName u8[] natif).
3. **src/strings.ts:84-95 `InitTextData`** : encodage runtime des `gText_ExpandedPlaceholder_*` (valeurs FR vérifiées = strings.c:7-20 : EMERAUDE/ARTHUR/MAX/BRICE/FLORA ✅ ; appelé au boot via text.ts:1310 ✅) — purge au Stage 1 (data byte au build).
4. **Commentaires PÉRIMÉS** : string_util.ts:57-59 + :595-597 et include/string_util.ts:7-9 (« Rien de live ne les lit encore », « voie ASCII gba-text-system.ts », « flip __USE_DECOMP_TEXT__ ») — **gba-text-system.ts n'existe plus**, gStringVar1-4 byte-level = la voie live (20+ importeurs). À réécrire pour ne pas induire un futur agent en erreur.
5. **international_string_util.ts:268-280 `_gTrainerClassName`** : bridge `globalThis.gameDataTrainerClassesFr` + **fallback silencieux** sur la clé anglaise (`SCHOOL_KID`…) si la data n'est pas chargée — dupliqué avec battle_message.ts:653. À unifier lors du chantier bridge gTrainers.
6. Frontières `string` acceptées (TVShowConvertInternationalString ts:43, GetNicknameLanguage ts:51, CopyMonCategoryText ts:141) — assumées tant que save/data restent JS-string.

## CALL-SITES ORPHELINS (décomp appelle X, le port fait autrement)

| Call-site décomp | Port actuel | Verdict |
|---|---|---|
| scrcmd.c:2277/2286 → GetTrainer(Class)NameFromId | scrcmd.ts:1100/1107 helpers maison | 🟠 cf. Manque #2 |
| battle_message.c:2605/2754/2805 → GetTrainerClassNameGenderSpecific | battle_message.ts:648 maison | 🟠 cf. Manque #3 |
| pokenav_match_call_data.c:1114 / _list.c:411 → GetTrainerClassNameGenderSpecific | pokenav_match_call_data.ts / _list.ts **l'importent bien** | ✅ |
| pokenav_list.c:766 → FillWindowTilesByRow ; pokenav ribbons/conditions → GetStringClearToWidth | importés (pokenav_list.ts, ribbons, conditions_search_results) | ✅ |
| berry_blender.c / secret_base.c → StringAppendWithPlaceholder | fichiers pas encore transcrits côté TS | ⚪ à câbler avec eux |
| battle_records.c:298 (StringFillWithTerminator), union_room_chat (Multibyte ×7) | link / hors périmètre solo | ⚪ |
| battle_dome.c:4412 (GetTrainerClassNameGenderSpecific) | frontier, hors solo | ⚪ |

**Verdict global : A ✅ complet (2 bridges + 1 micro-hex) · B ✅ complet (1 adaptation harness légitime + bridge data trainerClasses) · C ✅ strict. Le vrai trou n'est PAS dans ces 3 fichiers mais chez 2 CONSOMMATEURS (scrcmd, battle_message) qui court-circuitent la chaîne FR `GetTrainerClassNameFromId → GetTrainerClassNameGenderSpecific`.**

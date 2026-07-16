# Fix credits.ts — 10 tables d'anim + 3 pointer-arith (2026-07-16)

Lot ciblé par `audit-reports/engine/TRANSPILER-PITFALLS.md` familles **(c)** (10 tables d'anim
en objets) et **(b)** (3 pointer-arith P1 dans `Task_LoadShowMons`). Fichier touché :
`src/credits.ts` **uniquement**. `npx tsc --noEmit` = **0**. Pas de serveur/navigateur, pas de git.

---

## Famille (c) — 10 tables d'anim re-transcrites en TABLEAU d'AnimCmd

**Cause** : le transpileur a rendu `static const union AnimCmd sAnim_X[]` en OBJET
`{ type, frame, loop, jump, end }`. Le moteur sprite consomme `sprite.anims[animNum]` comme un
**tableau** indexé (`sprite.ts` `BeginAnim`/`ContinueAnim` : `const cmd = animTable[animCmdIndex]`,
dispatch sur `cmd.kind`). Un objet à clés → `animTable[0]` = `undefined` → l'anim ne démarre jamais.

**Forme saine appliquée** = tableau d'`AnimCmd` (précédent : `src/starter_choose.ts:177-190`
`const sAnim_Pokeball_Moving = [ ANIMCMD_FRAME(...), ..., ANIMCMD_JUMP(0) ]` câblé `anims: sAnims_Pokeball`).
`ANIMCMD_FRAME/JUMP` = fonctions (retour `AnimCmd`), `ANIMCMD_END` = const (pas de parenthèses).

| Table | credits.c | Forme finale (tableau) |
|---|---|---|
| `sAnim_Player_Slow` | :154-161 | `[FRAME(0,8), FRAME(64,8), FRAME(128,8), FRAME(192,8), JUMP(0)]` |
| `sAnim_Player_Fast` | :163-170 | `[FRAME(0,4), FRAME(64,4), FRAME(128,4), FRAME(192,4), JUMP(0)]` |
| `sAnim_Player_LookBack` | :172-178 | `[FRAME(256,4), FRAME(320,4), FRAME(384,4), END]` |
| `sAnim_Player_LookForward` | :180-187 | `[FRAME(384,30), FRAME(320,30), FRAME(256,30), FRAME(256,30), END]` |
| `sAnim_Rival_Slow` | :197-204 | `[FRAME(0,8), FRAME(64,8), FRAME(128,8), FRAME(192,8), JUMP(0)]` |
| `sAnim_Rival_Fast` | :206-213 | `[FRAME(0,4), FRAME(64,4), FRAME(128,4), FRAME(192,4), JUMP(0)]` |
| `sAnim_Rival_Still` | :215-219 | `[FRAME(0,4), END]` |
| `sAnim_MonBg_Yellow` | :255-259 | `[FRAME(0,8), END]` |
| `sAnim_MonBg_Red` | :261-265 | `[FRAME(64,8), END]` |
| `sAnim_MonBg_Blue` | :267-271 | `[FRAME(128,8), END]` |

**Câblage vérifié (déjà en place, consomme désormais des tableaux)** :
- `sAnims_Player` / `sAnims_Rival` (credits.ts:288 / :319) = tableaux de refs, assignés à
  `gSprites[spriteId].anims = sAnims_Player|sAnims_Rival` dans `LoadBikeScene` (credits.ts:1203/1207/1218/1222).
- `sAnims_MonBg` (credits.ts:382, `[POS_LEFT]=Yellow, [POS_CENTER]=Red, [POS_RIGHT]=Blue`) →
  `sSpriteTemplate_CreditsMonBg.anims` (credits.ts:391), consommé par `CreateSprite` (`s.anims = template.anims`).

`SpriteTemplate.anims` = `ReadonlyArray<ReadonlyArray<unknown>> | null` et `Sprite.anims` =
`ReadonlyArray<ReadonlyArray<AnimCmd>>` (sprite.ts:1201/1785) → la forme tableau est exactement l'attendu.

---

## Famille (b) — 3 pointer-arith P1 (`Task_LoadShowMons`, `case 0`)

1. **`gBirchBagGrass_Pal + 1`** (credits.c:506) → **`.subarray(1)`** + garde hurlante.
   `gBirchBagGrass_Pal` est lié **eager** en `Uint16Array` par `_bindCreditsAssets()` (credits.ts:1614,
   commentaire « → LoadPalette (u16) ») AVANT CB2, ou `null` (erreur déjà loggée :1626). `+ 1` = offset
   d'1 u16 (skip couleur 0) chargé dans `BG_PLTT_ID(0)+1`. Précédent `.subarray(N)` : pokenav
   `sPokenavBgDotsPal.subarray(7)` / `gPokenavOptions_Pal.subarray(i*0x10)` (fix c9d56188f). Comme
   `.subarray` sur `null` = crash dur, garde `if (gBirchBagGrass_Pal) … else console.error(...)` (Règle 3).
2. **`(gDecompressionBuffer + MON_PIC_SIZE)[i] = 0x22`** (credits.c:511) → **`gDecompressionBuffer[MON_PIC_SIZE + i] = 0x22`**.
3. **`(gDecompressionBuffer + MON_PIC_SIZE * 2)[i] = 0x33`** (credits.c:513) → **`gDecompressionBuffer[MON_PIC_SIZE * 2 + i] = 0x33`**.

`gDecompressionBuffer` est un vrai `Uint8Array(0x4000)` (credits.ts:70). L'intention .c : remplir les
3 copies successives du pic buffer (fonds mon-bg — 1re=0x11, 2e=0x22, 3e=0x33, `MON_PIC_SIZE` octets chacune,
= indices 4bpp jaune/rouge/bleu). `(buf + N)[i]` = écriture indexée `buf[N + i]` dans le MÊME buffer.

---

## Écarts / hors-lot laissés intacts (Règle 4 — honnêteté)

- **credits.ts:627** `temp = gDecompressionBuffer[MONBG_OFFSET]` puis `temp[0] = RGB_BLACK` : c'est le
  sibling `(u16 *)&gDecompressionBuffer[MONBG_OFFSET]` (credits.c:515, adresse scalaire), flaggé
  séparément « TRANSPILER-TODO &élément scalaire » — **PAS** dans les 3 findings famille (b). Laissé tel
  quel (hors lot). Conséquence : `case 0` de `Task_LoadShowMons` throw encore à cette ligne au runtime
  (`temp` = nombre). De même `sSpritePalette_MonBg.data` (credits.ts:339) reste sur le même TODO. À traiter
  dans un lot dédié (écrire les 4 u16 de palette à `gDecompressionBuffer[MONBG_OFFSET]` via une vue `Uint16Array`).
- Écran THE END qui stalle + palette interludes : hors lot (déjà documentés), non touchés.

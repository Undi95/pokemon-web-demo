# DECOMP → TS BRIDGE (pont 1:1)

> **But** : table vivante des correspondances **idiome décomp C → primitive runtime TS**.
> On la **consulte** avant chaque port et on l'**enrichit** dès qu'un idiome manque.
> C'est ce qui rend les ports *cheap et déterministes* (lookup au lieu de redécouverte).
>
> Décomp (réf, lecture seule) : `D:/Projet 1/decomps/pokeemeraude/{src,include}`
> Notre code : `D:/Projet 1/pokemon-web-demo/src` — port vers **`src/game/X.ts`** (mêmes noms).
> Méthode complète : `[[mirror-port-1to1]]`, `[[feedback-decomp-callgraph-is-completeness-spec]]`.

---

## 0. Méthode (rappel)
1. **Lire la décomp** : la(les) fonction(s) **+ tout leur call-graph** (le graphe = la spec de complétude).
2. **Mapper** chaque idiome via ce doc. Idiome absent → **l'ajouter ici**.
3. **Porter 1:1** dans `src/game/` : mêmes noms fichiers/fonctions/globals. Adapter **seulement** le binding runtime. Citer `fichier.c:ligne`.
4. **tsc 0** + **vérif runtime réel** (pas `import()` — cf. §6). Pas de shim/stub → **dette explicite**.
5. FR · **jamais push** · commit **ASCII** sur `mirroir` après A/B.

---

## 1. Sprites
`struct Sprite` → `DecompSprite` (`engine/system/decomp-runtime.ts:371`). Dispatch : voir §5.

| Décomp | Runtime | Piège |
|---|---|---|
| `sprite->data[n]` | `sprite.data[n]` | `Int16Array` réel ; masquer `& 0xFFFF` où la décomp lit u16 ; `toS16()` où elle lit s16 |
| `sprite->x/y/x2/y2` | idem | OAM final = `x + x2 + centerToCornerVecX` |
| `sprite->invisible / animEnded / affineAnimEnded / animPaused` | idem | — |
| `sprite->subpriority / oam.matrixNum` | `sprite.subpriority` / `sprite.matrixNum` | — |
| `sprite->oam.affineParam` | `rt.gba.oam[sprite.oamIndex].affineParam` | champ **distinct** de `affineParamIndex`(=matrixNum) ; registre scratch 16-bit (ajouté à `OamEntry`, struct OamData 0x06) |
| `gSprites[id]` | `rt.gSprites.get(id)` | peut être `undefined` → garder |
| `sprite->callback = X` | `sprite.callback = X` **ou** `rt.setSpriteCallback(id, X)` | signature `(sprite, rt) => void` |
| `CreateSprite(&tmpl, x, y, sub)` | `CreateSprite(tmpl, x, y, sub)` (`decomp-bridge.ts:2953`) → renvoie `spriteId:number` | **template taggé (tileTag)** : la **sheet doit être chargée AVANT** (`LoadXxxGfx`), sinon tiles vides = sprite **NOIR/garbage** (cf. §4) |
| `StartSpriteAnim(sprite, n)` | `rt.StartSpriteAnim(sprite.spriteId, n)` | — |
| `StartSpriteAffineAnim(&gSprites[id], n)` | `rt.StartSpriteAffineAnim(id, n)` | nécessite table affine + matrix (cf. §1b) |
| `AnimateSprite(&gSprites[id])` | `AnimateSprite(rt, sprite)` (`system/sprite-animation.ts:348`) | caster `as Parameters<typeof AnimateSprite>[1]` si mismatch `anims` |
| `FreeSpriteOamMatrix(sprite)` | `rt.FreeOamMatrix(sprite.matrixNum)` | (FreeSpriteOamMatrix ne libère que si affine — ici souvent affine) |
| `DestroySprite(sprite)` | `rt.DestroySprite(sprite.spriteId)` | — |

### 1b. Affine d'un sprite battler (emerge / scale)
Le mon de combat est **affine** dès sa création (template décomp `gBattlerSpriteTemplates[i].affineAnims = gAffineAnims_BattleSprite{Player,Opponent}Side` + `oam.affineMode = ST_OAM_AFFINE_NORMAL`).
- Runtime : `SetUpForReleaseAffineAnim(rt, spriteId, 'player'|'opponent')` (`system/pokeball-effects.ts:105`) = alloue matrix + pose `affineAnimsTableName` + `affineMode NORMAL`. Puis `rt.StartSpriteAffineAnim(id, 0)` applique l'identité.
- Table `gAffineAnims_BattleSpritePlayerSide` (`decomp-impls/sprite-affine-extras.ts`) : **NORMAL@0 · EMERGE@1 · RETURN@2** (= constantes `BATTLER_AFFINE_NORMAL/EMERGE/RETURN`).
- ⚠️ Sans setup affine, `StartSpriteAffineAnim(EMERGE)` ne tourne pas → `affineAnimEnded` jamais true → la séquence d'émergence ne se clôt jamais (sprite figé + ball orpheline).

---

## 2. Tasks
`gTasks[id]` → `rt.gTasks` (`Map<number, DecompTask>`). DecompTask = `{taskId, func, data[]}`.

| Décomp | Runtime | Piège |
|---|---|---|
| `CreateTask(Func, prio)` | `rt.CreateTask((t) => Func(t, rt), prio)` → `taskId` | le func reçoit l'**objet task**, pas l'id |
| `DestroyTask(id)` | `rt.DestroyTask(id)` | — |
| `gTasks[id].data[n]` | `task.data[n]` | — |
| `gTasks[id].func = X` | `task.func = X` | — |
| `TaskDummy` | helper local `(t) => {}` | — |
| pointeur packé `(u32)ptr>>16 / &0xFFFF` (ex `tMonPtr1/2`) | **non transposable** → `Map<number, obj>` annexe indexée par `taskId` | le `>>16` donne NaN en JS |

---

## 3. Globals d'état (battle)
`engine/battle/state.ts` (EWRAM battle), `engine/battle/util.ts`, `engine/battle/constants.ts`.

| Décomp | Runtime | Piège |
|---|---|---|
| `gActiveBattler = v` | `setActiveBattler(v)` (`state.ts:853`) | `export let` → **setter obligatoire** (pas d'assignation cross-module) |
| `gBattlerTarget = v` | `setBattlerTarget(v)` (`state.ts:852`) | l'import `let` est un **live-binding** (reflète la valeur courante en lecture) |
| `gBattlerPartyIndexes[b]` | import `gBattlerPartyIndexes` (state) | — |
| `gBattlerSpriteIds[b]` | `getBattlerMonSpriteId(b)` (`battle-controller-opponent.ts:358`) | — |
| `gMain.inBattle` | `rt.gMain.inBattle` | ⚠️ **DOUBLE-FLAG** : `setMainInBattle()` n'écrit QUE `_gMain_inBattle` (module-local de `battle-main-functions.ts`), **PAS** `rt.gMain.inBattle`. Poser **les deux**. |
| `gDoingBattleAnim` | lire `gDoingBattleAnim` / écrire `setGDoingBattleAnim(v)` (state) | — |
| `gBattleSpritesDataPtr->healthBoxesData[b].X` | accesseurs `battle-sprites-data.ts` (`isBallAnimActive`/`setBallAnimActive`/`setWaitForCry`/`getHealthBoxAnimationState`…) | struct backée champ par champ ; ajouter le champ si absent |
| `gBattleSpritesDataPtr->animationData->introAnimActive` | `isIntroAnimActive()` / `setIntroAnimActive(v)` | inerte en wild single (gate `IsDoubleBattle()`) |
| `gBattleTypeFlags` | import (state) | — |

---

## 4. Assets / GFX (⚠️ zone à divergence — relire `[[feedback-use-decomp-asset-mechanism]]`)
**Charger une sheet = MÉCANISME décomp, JAMAIS un `objVram.set`/base64 custom** (l'user a stoppé pour ça).

| Décomp | Runtime |
|---|---|
| `gXxxSpriteSheets[]` (`{data:'gXxxGfx_Sym', size, tag}`) | table TS identique ; `data` = **nom du symbole** (= pointeur ROM), résolu par `getAsset` |
| `LoadCompressedSpriteSheet(UsingHeap)(&sheet)` | `LoadCompressedSpriteSheetUsingHeap(sheet)` (`decomp-globals.ts:1237`) → `getAsset(sym)` (sync) → `LoadSpriteSheet` |
| `LoadCompressedSpritePalette(UsingHeap)` | idem palette |
| `LoadSpriteSheet({data:Uint8Array, size, tag})` | `sprite.ts:857`, **sync**, écrit `objVram` |
| `GetSpriteTileStartByTag(tag)` | idem ; **`0xFFFF` = pas chargée** → `CreateSprite(taggé)` rend du noir |
| `LZ77UnCompVram`/`LZDecompressVram(sym, dst)` | ⚠️ écrit en **BG** vram (`gba.vram`), **PAS OBJ** (`gba.objVram`) → pour un sprite OBJ, passer par `LoadSpriteSheet` |

**Prérequis sync** : l'asset doit être dans `assetCache` (`decomp-globals.ts:153`) **AVANT** que `getAsset(sym)` tourne. On le **précharge au boot** via une `ensureXxxLoaded()` (`engine/boot/intro-asset-loader.ts`, calquée sur `ensureBallParticlesLoaded`). **Vérifier que le site de boot de la voie concernée appelle bien ce preload**, sinon `getAsset` renvoie null → tiles vides → **sprite noir** (← cause typique du « blob noir »).

---

## 5. Dispatch (boucle principale)
`runOneFrame` (`decomp-runtime.ts:~2338`) — **uniquement si le CB2 actif est un `MainCB2*`** — appelle chaque frame, dans l'ordre :
`runTasks()` (→ `gTasks[id].func`) · `runSpriteCallbacks()` (→ `sprite.callback(sprite, rt)`) · `tickSpriteAnims()` · `tickAllAffineAnims()`.
→ Un SpriteCB/Task porté 1:1 **s'auto-dispatche** via cette boucle (= pas besoin de state-machine externe). En combat voie L, `cb2 = _BattleMainCB2`.

---

## 6. Pièges déjà payés
- **`import()` d'un module à état** (party-storage, state, assetCache) = **instance fraîche/vide ≠ runtime**. Vérifier contre `globalThis.__rt` / la **vérité-terrain** (formule décomp + valeurs JSON), **jamais** via re-import.
- **Vite HMR ment** → `window.location.reload()` ×2 avant de juger.
- **Arithmétique `s16 data[]`** : la décomp divise/multiplie **signé** → wrapper `toS16(v)=(v<<16)>>16` ; masquer `& 0xFFFF` au stockage.
- **Harness `__decompBattleLoop`** = teste la **logique** (opcodes/tours), **PAS la scène visuelle** (n'instancie pas les sprites mon) → l'anim se valide en **combat réel A/B**, pas au harness.
- Champs runtime ajoutés au besoin (1:1 struct) : `OamEntry.affineParam`, `MainStruct.inBattle`.

---

## 7. Helpers locaux (pattern codebase : redéfinis par module, non exportés)
```ts
function toS16(v: number): number { return (v << 16) >> 16; }
function HIBYTE(x: number): number { return (x >> 8) & 0xFF; }
function IsDoubleBattle(): boolean { return (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) !== 0; }
function GetBattlerSide(b: number): number { return GetBattlerPosition(b) & 1; }   // BIT_SIDE = 1
function IsContest(): boolean { return false; }   // post-camion : pas de contest
```
`Sin(i, amp)` / `Cos` → `game/trig.ts` (`Sin(i,amp) = (gSineTable[i]*amp)>>8`). Constantes `B_SIDE_*`/`B_POSITION_*`/`BATTLE_TYPE_*`/`MON_DATA_*` : importer de `constants.ts`/`util.ts` **ou** définir localement avec citation 1:1.

---

## 8. SE / BGM / cris
- Règle user : **ne pas toucher BGM/SE** fragiles → `PlaySE`/`m4a*` = **différés** (structure portée, appel commenté en dette).
- Exception **cri du mon** : `playCry(speciesName)` (`engine/system/music.ts`) est **prouvé** (intro) → l'utiliser pour ne pas régresser en silence. `speciesName = reverseDecompConstant(speciesNum, 'SPECIES_')`.

---

*Seedé 2026-06-08 (session #21c/#22). À enrichir à chaque port — c'est le but.*

# AUDIT PIPELINE ASSETS — decompress.c + survol graphics.c

Date : 2026-07-16 · Lecture seule · Référence : `D:/Projet 1/decomps/pokeemeraude/src/decompress.c` (21 fonctions)
+ `src/graphics.c` (1073 INCGFX, 35 dossiers) + `src/pokemon.c:5738-5799` (DRAW_SPINDA_SPOTS).

## Compteurs & verdict

- decompress.c : **21 fonctions** = 12 comportements distincts (3 copies `_2`, 2 `UNUSED`, 1 `Unused_`).
- Statuts : **✅ 6 · 🟠 3 · ⛔ 2 (DrawSpindaSpots, DuplicateDeoxysTiles) · 🔌 1 (LZ77 BIOS) · n/a 2 (UNUSED)**.
- Call-sites port : 286 occurrences des symboles decompress dans 56 fichiers `src/`+`harness/`.
- graphics.c : extraction **100 % au niveau dossier** (les 35 dossiers `graphics/<dir>` ont leur miroir
  `public/decomp/em/<dir>/`) ; la dette n'est PAS l'extraction mais (a) la **sélection de variante par
  personality/forme** jamais transcrite (Spinda/Unown/Castform/Deoxys) et (b) les **écrans non portés**
  (roulette, berry_blender, cable_car, trade, contest-écran, pokeblock-case, HoF-écran, mugshots E4).
- **VERDICT : 🟠 PARTIEL sain.** Le socle (fetch → assetCache → LoadCompressedSpriteSheet/LoadSpritePalette
  1:1 sprite.c, garde-fou anti-HTML `fetchAssetArrayBuffer` png-loader.ts:36, sentinelles `__wireTodo` qui
  THROW wire-todo.ts:8) est robuste et loud. Les manques sont concentrés sur `LoadSpecialPokePic` : le port
  l'a remplacé par une résolution d'URL PAR ÉCRAN qui saute TOUTES les branches spéciales du décomp.

## Architecture de l'adaptation (acté)

Décomp : `INCBIN .lz` → `LZ77UnCompWram/Vram` → buffer/VRAM. Port : assets pré-extraits
(`public/decomp/em/`) → `fetch` (intercepté par `harness/runtime/decomp-asset-net.ts:311` : Cache API +
dédup + packs + prefetch idle + Service Worker — moteur pur, 0 fichier de jeu touché) → décodage
`harness/gba/png-loader.ts` (loadTileBin :207 = .4bpp.bin byte-exact, fallback PNG indexé :216) →
soit `assetCache` (clé-symbole, decomp-globals.ts:136) consommé sync par les fonctions 1:1, soit
buffers directs par écran.

## Tableau decompress.c

| Fonction (decompress.c) | Statut | Équivalent port + preuve |
|---|---|---|
| `LZDecompressWram` :12 / BIOS `LZ77UnCompWram` | 🔌 EXEMPTION | Pas d'équivalent central : assets pré-décompressés, chaque site copie le buffer (ex. pokemon_storage_system.ts:2369, :3202). Justif : décompression = lecture ROM, cf. adaptation actée. 4 sentinelles Pokénav restantes (voir orphelins). |
| `LZDecompressVram` :17 / BIOS `LZ77UnCompVram` | ✅ (réserve) | decomp-globals.ts:258 `LZ77UnCompVram` (lookup assetCache → copie VRAM sync, trace lz77Trace) ; wrapper `LZDecompressVram` decomp-globals.ts:1165 **try/catch→warn-continue** (rustine R1). |
| `LoadCompressedSpriteSheet` :22 | ✅ | decomp-globals.ts:1668 : `AllocSpriteTiles`/`AllocSpriteTileRange`/copie OBJ VRAM 1:1 sprite.c:1486-1500 (via src/sprite.ts) ; accepte clé-symbole OU buffer brut ; extension moteur `targetTileBase` documentée (pokeball.c:1327). 🟡 détail : tileCount depuis `bytes.length` (:1738-1739) au lieu de `src->size` (rustine R8). Guard data-vide loud :1746-1748. |
| `LoadCompressedSpriteSheetOverrideBuffer` :33 | 🟠 | Pas de fn dédiée (gDecompressionBuffer sans objet). Consumer 1 `main_menu.c:1900` porté : `CreateTrainerSprite` main_menu.ts:755 (Birch gender screen, tags symboles). Consumer 2 `battle_transition.c:2586-2590` (**Mugshot Élite 4**) ⛔ NON PORTÉ — battle_transition.ts ne porte que PokeballsTrail/Slice/WhiteBarsFade/AngledWipes/Blur/Swirl/Shuffle (:4,:299,:454,:589,:771,:853,:932). |
| `LoadCompressedSpritePalette` :44 | ✅ | Comportemental : sites → `LoadSpritePalette` 1:1 (sprite.ts scan first-free) avec palette pré-décompressée. Ex. pokeball.ts:188, item_icon.ts:149, battle_gfx_sfx_util.ts:225-228 (PLTE taguée picId). |
| `LoadCompressedSpritePaletteOverrideBuffer` :54 | 🟠 | Même couple de consumers que OverrideBuffer sheet (field_effect.c:891) : Birch ✅ main_menu.ts:861/870 · Mugshots ⛔. |
| `DecompressPicFromTable` :64 / `_2` :307 / `_DontHandleDeoxys` :358 | 🟠 | Adapté par écran : trainer pics `DecompressTrainerFrontPic` battle_gfx_sfx_util.ts:219 (map trainer-pics.json) + `DecompressTrainerBackPic` :236 ; mon pics evolution_scene.ts:384-385. ⛔ garde `species > NUM_SPECIES → gMonFrontPicTable[0]` (« ? ») absente ; ⛔ `DuplicateDeoxysTiles` absent. |
| `HandleLoadSpecialPokePic` :73 / `_2` :346 / `_DontHandleDeoxys` :366 | 🟠 | Remplacé par `loadTileBin('/decomp/em/pokemon/<folder>/anim_front|back.png')` par écran : battle_gfx_sfx_util.ts:166-167 (front) / :190-191 (back) → `gMonSpritesGfxPtr.sprites.ptr[position]` (struct 1:1 :100-109) ; egg_hatch.ts:159 ; evolution_scene.ts:385 ; pokemon_storage_system.ts:1354 ; field_effect_helpers.ts:1603 ; pokemon_summary_screen.ts:954 ; pokedex.ts:654. Destination/contenu OK pour ~381/386 espèces, MAIS toutes les branches spéciales sautées (voir Manques). |
| `LoadSpecialPokePic` :85 / `_2` :316 / `_DontHandleDeoxys` :378 | 🟠 | Idem ci-dessus + 1 sentinelle `__wireTodo` pokenav_conditions.ts:41 (call-site :555, écran Condition non câblé — throw loud). Branche Unown (:87-101) ⛔, garde `> NUM_SPECIES` (:102-105) ⛔, `DrawSpindaSpots` (:112) ⛔. |
| `Unused_LZDecompressWramIndirect` :115 | n/a | UNUSED décomp — rien à porter. |
| `StitchObjectsOn8x8Canvas` :120 | n/a | UNUSED décomp — rien à porter. |
| `GetDecompressedDataSize` :269 | ✅ | decomp-globals.ts:445 (byteLength du pré-décompressé ≡ en-tête LZ77 bytes 1-3). Consumers : digit_obj_util.ts:170, pokenav_main_menu.ts:839/:865. |
| `LoadCompressedSpriteSheetUsingHeap` :275 | ✅ | decomp-globals.ts:1176 → délègue à LoadCompressedSpriteSheet (Alloc/Free heap sans objet). Consumer majeur : anims combat battle_anim.ts:1164/:1212. 🟡 tolère un array en entrée (:1179). |
| `LoadCompressedSpritePaletteUsingHeap` :292 | ✅ | decomp-globals.ts:1186 → LoadSpritePalette(s) 1:1. |
| `DuplicateDeoxysTiles` :407 | ⛔ ABSENT | Aucun site ne copie `pointer+MON_PIC_SIZE → pointer` pour SPECIES_DEOXYS. Assets 2-blocs extraits (deoxys/anim_front.4bpp.bin = 4096 = normal+speed). Conséquence : Deoxys combat/écrans = forme NORMALE au lieu de SPEED (Émeraude). Événementiel (Birth Island) = hors solo-core. |
| `DrawSpindaSpots` (pokemon.c:5795, macro :5738, data `gSpindaSpotGraphics` :1356) | ⛔ ABSENT | Zéro implémentation (grep Spinda : seuls des commentaires/constantes). Les 4 masques SONT extraits (`public/decomp/em/pokemon/spinda/spots/spot_0..3.png`) mais jamais lus. **SOLO : Spinda sauvage Route 113 → rendu SANS taches partout (combat, résumé, PC, dex).** |

## FAMILLES graphics.c (1073 INCGFX / 35 dossiers — échantillonnage)

Pattern nominal : symbole `gX_Gfx/Tilemap/Pal` → asset extrait même chemin → résolu soit par clé-symbole
`assetCache` (intro, balls, title), soit par manifest JSON (anims : `anim-gfx-manifest.json`,
`anim-bg-symbols.json` battle_anim.ts:793-806 ; table générée 1:1 par position `src/data/battle_anim.ts:18`,
289 tags), soit par URL directe par écran.

| Famille (n INCGFX) | Extraction | Consommation port |
|---|---|---|
| battle_anims (630) | ✅ sprites-src/ + backgrounds/ | ✅ sprites via table 1:1 gen (src/data/battle_anim.ts, Cmd_loadspritegfx battle_anim.ts:1053-1071) ; ✅ BGs/masks via anim-bg-symbols (battle_anim.ts:817-847) |
| pokenav (37) | ✅ | ✅ chantier MC 100 % (pokenav_main_menu.ts, match_call.ts:1951) ; Condition = sentinelles |
| contest (32) | ✅ em/contest | ⛔ écran non porté (contest.ts:1-9 = seeding new-game only, « Palier 4 ») |
| pokeblock (29) | ✅ em/pokeblock | ⛔ PokéblockCase non porté (pokeblock.ts:1-9 = seeding only, dette sac #15) |
| roulette (23) | ✅ em/roulette | ⛔ aucun src/roulette.ts (solo : casino Mauville) |
| pokedex (23) · naming_screen (23) · battle_interface (22) · pokemon_storage (14) · trainer_card (12) · bag (12) · interface (11) · pokemon (10) · summary_screen (9) · easy_chat (8) · title_screen (7) · party_menu (6) · wallclock (5) · shop (4) · intro (3) · types (2) · text_window (2) · credits (1) | ✅ | ✅ écrans portés (pokedex.ts:654/3740, naming_screen.ts, battle_interface.ts, pokemon_storage_system.ts:643, trainer_card.ts, bag-screen.ts, pokemon_summary_screen.ts:954, easy_chat.ts, title_screen.ts, party_menu.ts:1720, wallclock.ts, shop.ts, intro.ts, credits.ts) |
| berry_blender (12) | ✅ em/berry_blender | ⛔ écran non porté (solo : halls de concours) |
| cable_car (6) | ✅ em/cable_car | ⛔ écran non porté (solo : Mt. Chimney, chemin d'histoire) |
| trade (7) | ✅ em/trade | ⛔ écran trade.c non porté (solo : 3 échanges in-game ; egg_hatch réutilise em/trade/* egg_hatch.ts:11) |
| battle_transitions (4) | ✅ | 🟠 7 transitions portées (battle_transition.ts) ; **Mugshot E4 ⛔** |
| misc (2, dont japanese_hof) | ✅ (em/misc/japanese_hof.png) | 🟠 hall_of_fame.ts:2 = « CB2 INTÉRIMAIRE HONNÊTE » (save OK, écran HoF non rendu) |
| frontier_pass (10) · battle_frontier (23) · union_room_chat (8) · pokemon_jump (2) · berry_crush (3) · link (2) · unused (18) | ✅ | 🔌 hors périmètre solo-core (link/post-game) — cf. critère FILE-OPUS |

Cas spéciaux pokemon/ (390 dossiers extraits, vérifiés sur disque) :
- `unown/` = 28 sous-dossiers a..z+?+! extraits, **jamais résolus** (`_speciesAssetFolder`
  battle_gfx_sfx_util.ts:129-133 → `pokemon/unown/anim_front.png` inexistant → throw MANQUANT loud).
  Unown non obtenable en solo Émeraude → dormant, mais crash-path si species présent.
- `castform/` = 4 sous-dossiers normal/rainy/snowy/sunny, **PAS d'anim_front.png/normal.pal top-level**
  → tout écran chargeant Castform échoue (voir Manques n°1).
- `spinda/spots/` = 4 masques extraits, non consommés. `deoxys/` = anim_front 2 blocs, consommé sans duplicate.

## 🚨 MANQUES CRITIQUES

1. **CASTFORM = CRASH-PATH SOLO** (cadeau scénario Institut Météo, Route 119). `_speciesAssetFolder` →
   `/decomp/em/pokemon/castform/anim_front.png` **inexistant** (seuls les sous-dossiers par forme existent)
   → `loadTileBin` throw → combat (battle_gfx_sfx_util.ts:167), résumé (:954), PC (:1354), dex (:3740),
   évolution — tous KO pour Castform. En plus : formes Forecast non câblées (`HandleSpeciesGfxDataChange`
   battle_gfx_sfx_util.ts:324 `if (castform) return;` — le commentaire « non atteignable » :141/:196 est
   FAUX en solo) + palette 4-formes castformPalette (bgsu.c:615-620) absente + gBattleMonForms figé à 0.
2. **SPINDA SANS TACHES** (sauvage Route 113). `DrawSpindaSpots`/`gSpindaSpotGraphics` = 0 code porté ;
   masques extraits inutilisés. Procédural 4 taches XOR personality (pokemon.c:5738-5776) à transcrire +
   brancher sur chaque point d'entrée mon-pic (combat/résumé/PC/dex).
3. **Mugshots Élite 4** : `battle_transition.c:2586` `CreateTrainerSprite` (= LES call-sites
   LoadCompressed*OverrideBuffer) non porté → transitions Sidney/Phoebe/Glacia/Drake/champion absentes.
4. **Écrans solo entiers avec assets orphelins** : roulette, berry_blender, cable_car (histoire),
   trade in-game, contest, pokeblock case, écran Hall of Fame (japanese_hof.png + confetti —
   confetti_util.ts vient d'être transpilé, hall_of_fame.ts reste INTÉRIM).
5. **Deoxys forme Speed** : `DuplicateDeoxysTiles` absent (forme normale affichée) — événementiel,
   basse priorité solo.

## RUSTINES À PURGER (après fix)

- R1 decomp-globals.ts:1163-1171 : `LZDecompressVram` try/catch→`console.warn`-continue (héritage Scene 3 intro) — durcir (asset manquant doit hurler/throw, pas « continuing »).
- R2 decomp-globals.ts:1198-1231 : `gBattleAnimPicTable/PaletteTable` Proxy stub à 1 entrée (ROCKS) rendant des entrées VIDES silencieuses pour tout autre index — DOUBLON de la vraie table src/data/battle_anim.ts:18 ; consumer intro.ts:1382. À dissoudre vers la table 1:1.
- R3 battle_anim.ts:802/:805 : préchargement backgrounds anim `.catch(() => {})` ×2 → échec de fetch invisible, `AnimLoadCompressedBgGfx/Tilemap` no-op silencieux en aval (:820/:830 `if (!data) return`).
- R4 battle_gfx_sfx_util.ts:208 : `_ensureTrainerPicMap` `catch { _trainerPicMap = {} }` silencieux (trainer-pics.json illisible = tous les pics dresseurs « inconnus »).
- R5 battle_gfx_sfx_util.ts:238-239 : `DecompressTrainerBackPic` chemins `brendan.png`/`may.png` EN DUR (à raccorder à gTrainerBackPicTable ; variantes RS/FRLG = link, OK différées).
- R6 `DecompressAndCopyTileDataToVram` dupliqué : mail.ts:1060 (locale) + pokenav_main_menu.ts:41 (exportée) + sentinelle pokenav_conditions_gfx.ts:51 — centraliser (bg.c/menu_helpers) puis purger les copies.
- R7 pokemon_storage_system.ts:1354-1355 : PC display mon = `anim_front.png` + `normal.pal` EN DUR, `_pid` ignoré (:2309) → shiny/Unown/Spinda faux au panneau PC.
- R8 decomp-globals.ts:1738-1739 : tileCount depuis `bytes.length` au lieu de `sheet.size` (battle_anim compense en tronquant :1184-1187 — aligner sur size et retirer la compensation).

## CALL-SITES ORPHELINS (sentinelles `__wireTodo` = throw loud, conformes doctrine)

- pokenav_conditions.ts:41 → :555-556 `LoadSpecialPokePic` + `LZ77UnCompWram` (écran Condition non câblé).
- pokenav_match_call_gfx.ts:58/:61 → `DecompressPicFromTable` + `LZ77UnCompWram` (CHECK PAGE déjà couverte par l'adaptation :1306 — stubs résiduels à purger au câblage final).
- pokenav_main_menu.ts:81 → :867 `LZ77UnCompWram` (left headers SOUS-menu, chemin non atteint aujourd'hui).
- pokenav_region_map.ts:59 → :666 `LZ77UnCompWram` (city zoom pics carte Pokénav).
- pokenav_conditions_gfx.ts:51 → :305/:310 `DecompressAndCopyTileDataToVram`.

#!/usr/bin/env node
/**
 * Extrait les tables Pokémon manquantes (= 1:1 décomp) :
 *   - species-info.json     ← src/data/pokemon/species_info.h (= base stats)
 *   - moves-data.json       ← src/data/battle_moves.h (= power/accuracy/type/pp)
 *   - move-names-fr.json    ← src/data/text/move_names.h
 *   - move-descriptions-fr.json ← src/data/text/move_descriptions.h
 *   - level-up-learnsets.json ← src/data/pokemon/level_up_learnsets.h
 *   - egg-moves.json        ← src/data/pokemon/egg_moves.h
 *   - tmhm-learnsets.json   ← src/data/pokemon/tmhm_learnsets.h
 *   - tutor-learnsets.json  ← src/data/pokemon/tutor_learnsets.h
 *   - abilities-fr.json     ← src/data/text/abilities.h
 *   - nature-names-fr.json  ← src/data/text/nature_names.h
 *   - trainer-class-names-fr.json ← src/data/text/trainer_class_names.h
 *   - item-descriptions-fr.json   ← src/data/text/item_descriptions.h
 *   - experience-tables.json ← src/data/pokemon/experience_tables.h
 *
 * Sortie dans `public/decomp/em/`.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDir = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDir, { recursive: true });

function readDecomp(rel) {
  const p = join(decompPath, rel);
  if (!existsSync(p)) { console.warn(`SKIP missing : ${rel}`); return null; }
  return readFileSync(p, 'utf8');
}

function writeOut(name, data) {
  const p = join(outDir, name);
  writeFileSync(p, JSON.stringify(data));
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`✓ ${name} (${count} entries, ${(JSON.stringify(data).length / 1024).toFixed(1)} KB)`);
}

// ─── Helpers parse ──────────────────────────────────────────────────────────

/** Extract toutes les strings _(...) d'un block C (= concat auto). */
function extractStrings(block) {
  const re = /"((?:\\.|[^"\\])*)"/g;
  const out = [];
  let m;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out.join(' ').replace(/\\n|\\p|\\l/g, ' ').replace(/\s+/g, ' ').trim();
}

/** 1:1 décomp move_descriptions.h : les descriptions de capacités sont des
 *  literals C ADJACENTS concaténés DIRECTEMENT (aucun séparateur) avec un
 *  `\n` embarqué = saut de ligne RÉEL (box description = 2 lignes exactes,
 *  ex. sPoundDescription "...les\n" "pattes..."). Le helper partagé
 *  `extractStrings` aplatit `\n`→espace (= 1 ligne → débordement écran ≠
 *  ROM) : on garde `\n` ICI (ciblé moves, n'affecte pas ability/item). */
function extractMoveDescription(block) {
  const re = /"((?:\\.|[^"\\])*)"/g;
  const out = [];
  let m;
  while ((m = re.exec(block)) !== null) out.push(m[1]);
  return out.join('')
    .replace(/\\n/g, '\n')   // CHAR_NEWLINE 1:1 (saut de ligne box)
    .replace(/\\[lp]/g, '\n') // \l/\p (inusités ici) → newline (safety)
    .trim();
}

/** Parse champ struct `.name = value` (= integer ou enum). */
function parseField(body, name) {
  const m = body.match(new RegExp(`\\.${name}\\s*=\\s*([^,\\n]+)`));
  return m ? m[1].trim() : null;
}

function parseInt10(s) {
  if (s == null) return 0;
  const m = s.match(/-?\d+/);
  return m ? Number(m[0]) : 0;
}

// ─── 1. species_info.h ──────────────────────────────────────────────────────

function parseSpeciesInfo() {
  const text = readDecomp('src/data/pokemon/species_info.h');
  if (!text) return {};
  // Format : `[SPECIES_XXX] = { .baseHP = N, ..., }`. Scan d'accolades
  // APPARIÉES (pas une regex non-greedy `\n\}`) : `[SPECIES_NONE] = {0},`
  // est single-line sans `\n}` → l'ancienne regex démarrait à SPECIES_NONE
  // et AVALAIT tout le bloc `[SPECIES_BULBASAUR] = {...}` jusqu'au 1er
  // `\n}` (= fin de Bulbasaur) → SPECIES_NONE prenait les stats de
  // Bulbasaur ET SPECIES_BULBASAUR (espèce #1) était DROPPÉE. Gardé 1:1
  // par audit:species-stats / audit:species-abilities (qui FAIL désormais
  // si une vraie espèce manque, plus de skip silencieux).
  const re = /\[(SPECIES_\w+)\]\s*=\s*\{/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const speciesId = m[1];
    let depth = 1, i = re.lastIndex;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
    }
    const body = text.slice(re.lastIndex, i - 1);
    re.lastIndex = i; // reprend APRÈS l'accolade fermante de ce bloc
    // Skip si juste `{0}` (= SPECIES_NONE).
    if (!body.includes('.base')) {
      out[speciesId] = { stats: { hp: 0, atk: 0, def: 0, spe: 0, spa: 0, spd: 0 } };
      continue;
    }
    const types = body.match(/\.types\s*=\s*\{\s*(\w+)\s*,\s*(\w+)\s*\}/);
    const abilities = body.match(/\.abilities\s*=\s*\{\s*(\w+)\s*,\s*(\w+)\s*\}/);
    const eggGroups = body.match(/\.eggGroups\s*=\s*\{\s*(\w+)\s*,\s*(\w+)\s*,?\s*\}/);
    out[speciesId] = {
      stats: {
        hp:  parseInt10(parseField(body, 'baseHP')),
        atk: parseInt10(parseField(body, 'baseAttack')),
        def: parseInt10(parseField(body, 'baseDefense')),
        spe: parseInt10(parseField(body, 'baseSpeed')),
        spa: parseInt10(parseField(body, 'baseSpAttack')),
        spd: parseInt10(parseField(body, 'baseSpDefense')),
      },
      types: types ? [types[1], types[2]] : ['TYPE_NORMAL', 'TYPE_NORMAL'],
      abilities: abilities ? [abilities[1], abilities[2]] : ['ABILITY_NONE', 'ABILITY_NONE'],
      eggGroups: eggGroups ? [eggGroups[1], eggGroups[2]] : ['EGG_GROUP_UNDISCOVERED', 'EGG_GROUP_UNDISCOVERED'],
      catchRate:    parseInt10(parseField(body, 'catchRate')),
      expYield:     parseInt10(parseField(body, 'expYield')),
      genderRatio:  parseField(body, 'genderRatio') ?? 'MON_MALE',
      eggCycles:    parseInt10(parseField(body, 'eggCycles')),
      // 1:1 #define STANDARD_FRIENDSHIP 70 (constants/pokemon.h) : toutes les espèces
      // Emerald utilisent cette macro (sauf SPECIES_NONE=0). parseInt10 ne resout pas
      // la macro -> on la mappe explicitement, sinon valeur numerique litterale.
      friendship:   (parseField(body, 'friendship') === 'STANDARD_FRIENDSHIP') ? 70 : parseInt10(parseField(body, 'friendship')),
      growthRate:   parseField(body, 'growthRate') ?? 'GROWTH_MEDIUM_FAST',
      itemCommon:   parseField(body, 'itemCommon') ?? 'ITEM_NONE',
      itemRare:     parseField(body, 'itemRare') ?? 'ITEM_NONE',
      bodyColor:    parseField(body, 'bodyColor') ?? 'BODY_COLOR_BLACK',
      safariFlee:   parseInt10(parseField(body, 'safariZoneFleeRate')),
      // 1:1 décomp `gSpeciesInfo[].noFlip` — utilisé par IsMonSpriteNotFlipped
      // (pokemon.c:6553) ; le summary CreateMonSprite (:3986) fait
      // `hFlip = !noFlip` (défaut FALSE → flip ; 18 espèces noFlip=TRUE).
      noFlip:       (parseField(body, 'noFlip') ?? 'FALSE').trim() === 'TRUE',
      evYield: {
        hp:  parseInt10(parseField(body, 'evYield_HP')),
        atk: parseInt10(parseField(body, 'evYield_Attack')),
        def: parseInt10(parseField(body, 'evYield_Defense')),
        spe: parseInt10(parseField(body, 'evYield_Speed')),
        spa: parseInt10(parseField(body, 'evYield_SpAttack')),
        spd: parseInt10(parseField(body, 'evYield_SpDefense')),
      },
    };
  }
  return out;
}

// ─── 2. battle_moves.h ──────────────────────────────────────────────────────

function parseBattleMoves() {
  const text = readDecomp('src/data/battle_moves.h');
  if (!text) return {};
  const re = /\[(MOVE_\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\}/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const moveId = m[1];
    const body = m[2];
    out[moveId] = {
      effect:    parseField(body, 'effect') ?? 'EFFECT_HIT',
      power:     parseInt10(parseField(body, 'power')),
      type:      parseField(body, 'type') ?? 'TYPE_NORMAL',
      accuracy:  parseInt10(parseField(body, 'accuracy')),
      pp:        parseInt10(parseField(body, 'pp')),
      secondaryEffectChance: parseInt10(parseField(body, 'secondaryEffectChance')),
      target:    parseField(body, 'target') ?? 'MOVE_TARGET_SELECTED',
      priority:  parseInt10(parseField(body, 'priority')),
      flags:     parseField(body, 'flags') ?? '0',
    };
  }
  return out;
}

// ─── 3. text/move_names.h ───────────────────────────────────────────────────

function parseMoveNames() {
  const text = readDecomp('src/data/text/move_names.h');
  if (!text) return {};
  const re = /\[(MOVE_\w+)\]\s*=\s*_\("([^"]*)"\)/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) out[m[1]] = m[2];
  return out;
}

// ─── 4. text/move_descriptions.h ────────────────────────────────────────────

function parseMoveDescriptions() {
  const text = readDecomp('src/data/text/move_descriptions.h');
  if (!text) return {};
  // Format : `static const u8 sXxxDescription[] = _("texte");` puis array
  // gMoveDescriptionPointers[] = { [MOVE_X - 1] = sXxxDescription, ... }.
  const reDesc = /static\s+const\s+u8\s+(s\w+Description)\[\]\s*=\s*_\(\s*([\s\S]*?)\s*\);/g;
  const descs = {};
  let m;
  while ((m = reDesc.exec(text)) !== null) descs[m[1]] = extractMoveDescription(m[2]);
  // Map move → description via pointer table.
  const reMap = /\[(MOVE_\w+)\s*-\s*1\]\s*=\s*(s\w+Description)/g;
  const out = {};
  while ((m = reMap.exec(text)) !== null) out[m[1]] = descs[m[2]] ?? '';
  return out;
}

// ─── 5. level_up_learnsets.h ────────────────────────────────────────────────

function parseLevelUpLearnsets() {
  const text = readDecomp('src/data/pokemon/level_up_learnsets.h');
  if (!text) return {};
  // Per-species : `static const u16 sXxxLevelUpLearnset[] = { LEVEL_UP_MOVE(1, MOVE_X), ... };`
  const reSet = /static\s+const\s+u16\s+s(\w+)LevelUpLearnset\[\]\s*=\s*\{([\s\S]*?)\}/g;
  const out = {};
  let m;
  while ((m = reSet.exec(text)) !== null) {
    const speciesPart = m[1];  // e.g. "Bulbasaur"
    const body = m[2];
    const reMove = /LEVEL_UP_MOVE\s*\(\s*(\d+)\s*,\s*(MOVE_\w+)\s*\)/g;
    const moves = [];
    let mm;
    while ((mm = reMove.exec(body)) !== null) {
      moves.push({ level: Number(mm[1]), move: mm[2] });
    }
    // Resolve speciesPart → SPECIES_XXX (= uppercase). e.g. "Bulbasaur" → "SPECIES_BULBASAUR".
    const speciesId = 'SPECIES_' + speciesPart.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    out[speciesId] = moves;
  }
  return out;
}

// ─── 6. egg_moves.h ─────────────────────────────────────────────────────────

function parseEggMoves() {
  const text = readDecomp('src/data/pokemon/egg_moves.h');
  if (!text) return {};
  // Format réel : `egg_moves(BULBASAUR, MOVE_X, MOVE_Y, ...)` où BULBASAUR est
  // bare (= macro concat avec SPECIES_##species).
  const re = /egg_moves\s*\(\s*([A-Z_0-9]+)\s*,\s*([\s\S]*?)\s*\)/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const species = 'SPECIES_' + m[1];
    const moves = (m[2].match(/MOVE_\w+/g)) ?? [];
    out[species] = moves;
  }
  return out;
}

// ─── 7. tmhm_learnsets.h ────────────────────────────────────────────────────

function parseTmhmLearnsets() {
  const text = readDecomp('src/data/pokemon/tmhm_learnsets.h');
  if (!text) return {};
  // Format réel : `[SPECIES_XXX] = { .learnset = { .TOXIC = TRUE, .BULLET_SEED = TRUE, ... } }`.
  // Boolean fields = TM/HM names. TRUE = species peut apprendre ce TM/HM.
  const re = /\[(SPECIES_\w+)\]\s*=\s*\{\s*\.learnset\s*=\s*\{([\s\S]*?)\}\s*\}/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const tms = [];
    const reField = /\.([A-Z_][A-Z0-9_]*)\s*=\s*TRUE/g;
    let mm;
    while ((mm = reField.exec(m[2])) !== null) tms.push(mm[1]);
    out[m[1]] = tms;
  }
  return out;
}

// ─── 8. tutor_learnsets.h ───────────────────────────────────────────────────

function parseTutorLearnsets() {
  const text = readDecomp('src/data/pokemon/tutor_learnsets.h');
  if (!text) return {};
  // Format réel : `[SPECIES_X] = (TUTOR(MOVE_A) | TUTOR(MOVE_B) | ... )`
  // Inside `static const u32 sTutorLearnsets[]`. Each species → bitmask de tutor
  // moves possibles.
  const re = /\[(SPECIES_\w+)\]\s*=\s*\(([\s\S]*?)\)\s*,/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const tutors = [];
    const reTutor = /TUTOR\s*\(\s*(MOVE_\w+)\s*\)/g;
    let mm;
    while ((mm = reTutor.exec(m[2])) !== null) tutors.push(mm[1]);
    out[m[1]] = tutors;
  }
  return out;
}

// ─── 9. text/abilities.h ────────────────────────────────────────────────────

function parseAbilities() {
  const text = readDecomp('src/data/text/abilities.h');
  if (!text) return {};
  // Format : `static const u8 sXxxDescription[] = _("...");` puis pointer table
  // gAbilityNames[] et gAbilityDescriptionPointers[].
  // Names : src/data/text/abilities.h has names too OR src/data/abilities.h.
  const out = {};
  // Parse descriptions.
  const reDesc = /static\s+const\s+u8\s+s(\w+)Description\[\]\s*=\s*_\("([^"]*)"\)/g;
  const descs = {};
  let m;
  while ((m = reDesc.exec(text)) !== null) descs[m[1]] = m[2];
  // Pointer table.
  const reMap = /\[(ABILITY_\w+)\]\s*=\s*s(\w+)Description/g;
  while ((m = reMap.exec(text)) !== null) {
    out[m[1]] = { description: descs[m[2]] ?? '' };
  }
  return out;
}

// ─── 10. text/abilities (names = ability_names.h or text/abilities.h section) ─

function parseAbilityNames() {
  // Décomp : noms dans `src/data/text/abilities.h` ou `gAbilityNames[]`.
  // Try multiple sources.
  const text = readDecomp('src/data/text/abilities.h');
  if (!text) return {};
  // Format names : `[ABILITY_XXX] = _("Name")`.
  const re = /\[(ABILITY_\w+)\]\s*=\s*_\("([^"]*)"\)/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) out[m[1]] = m[2];
  return out;
}

// ─── 11. text/nature_names.h ────────────────────────────────────────────────

function parseNatureNames() {
  const text = readDecomp('src/data/text/nature_names.h');
  if (!text) return {};
  // Format : `static const u8 sXxxNatureName[] = _("...");` puis pointer table
  // `[NATURE_XXX] = sXxxNatureName`.
  const reNames = /static\s+const\s+u8\s+s(\w+)NatureName\[\]\s*=\s*_\("([^"]*)"\)/g;
  const names = {};
  let m;
  while ((m = reNames.exec(text)) !== null) names[m[1]] = m[2];
  const reMap = /\[(NATURE_\w+)\]\s*=\s*s(\w+)NatureName/g;
  const out = {};
  while ((m = reMap.exec(text)) !== null) out[m[1]] = names[m[2]] ?? '';
  return out;
}

// ─── 12. text/trainer_class_names.h ─────────────────────────────────────────

function parseTrainerClassNames() {
  const text = readDecomp('src/data/text/trainer_class_names.h');
  if (!text) return {};
  const re = /\[(TRAINER_CLASS_\w+)\]\s*=\s*_\("([^"]*)"\)/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) out[m[1]] = m[2];
  return out;
}

// ─── 13. text/item_descriptions.h ───────────────────────────────────────────

function parseItemDescriptions() {
  const text = readDecomp('src/data/text/item_descriptions.h');
  if (!text) return {};
  // Format : `static const u8 sXxxDesc[] = _("...");` + pointers via items.h.
  // Plus simple : extract toutes les desc + map via name.
  const reDesc = /static\s+const\s+u8\s+s(\w+)Desc\[\]\s*=\s*_\(([\s\S]*?)\);/g;
  const out = {};
  let m;
  while ((m = reDesc.exec(text)) !== null) {
    out[m[1]] = extractStrings(m[2]);
  }
  return out;
}

// ─── 14. experience_tables.h ────────────────────────────────────────────────

function parseExperienceTables() {
  // 1:1 décomp `gExperienceTables` (src/data/pokemon/experience_tables.h).
  // Le décomp écrit LITTÉRALEMENT `0, // 0` et `1, // 1` pour TOUS les 6
  // blocs (les macros EXP_* ne donnent pas 0/1 proprement à bas n : ex.
  // EXP_MEDIUM_SLOW(1) = -54, EXP_FAST(1) = 0), puis applique la macro
  // pour n=2..100. (Ancien bug : recompute macro à n=1 → FAST/MEDIUM_SLOW/
  // FLUCTUATING donnaient 0 au lieu du littéral 1 ; + `n<=35` au lieu du
  // `n<=36` de la macro ; + `Math.max(0,)` absent du décomp.)
  // Gardé 1:1 par npm run audit:experience-tables.
  const MAX_LEVEL = 100;
  const cube = (n) => n * n * n;
  const sq = (n) => n * n;

  // arr[0]=0, arr[1]=1 littéraux (1:1 décomp), macro pour n>=2.
  const fmt = (fn) => {
    const arr = [0, 1];
    for (let n = 2; n <= MAX_LEVEL; n++) arr.push(fn(n));
    return arr;
  };

  return {
    GROWTH_MEDIUM_FAST: fmt((n) => cube(n)),
    GROWTH_FAST:        fmt((n) => Math.floor(4 * cube(n) / 5)),
    GROWTH_SLOW:        fmt((n) => Math.floor(5 * cube(n) / 4)),
    // EXP_MEDIUM_SLOW : pas de clamp dans le décomp (positif pour n>=2).
    GROWTH_MEDIUM_SLOW: fmt((n) => Math.floor(6 * cube(n) / 5) - 15 * sq(n) + 100 * n - 140),
    GROWTH_ERRATIC: fmt((n) => {
      if (n <= 50) return Math.floor((100 - n) * cube(n) / 50);
      if (n <= 68) return Math.floor((150 - n) * cube(n) / 100);
      if (n <= 98) return Math.floor((Math.floor((1911 - 10 * n) / 3)) * cube(n) / 500);
      return Math.floor((160 - n) * cube(n) / 100);
    }),
    GROWTH_FLUCTUATING: fmt((n) => {
      if (n <= 15) return Math.floor(cube(n) * (Math.floor((n + 1) / 3) + 24) / 50);
      if (n <= 36) return Math.floor(cube(n) * (n + 14) / 50); // 1:1 décomp : n<=36
      return Math.floor(cube(n) * (Math.floor(n / 2) + 32) / 50);
    }),
  };
}

// ─── 15. trainers.h ────────────────────────────────────────────────────────

function parseTrainers() {
  const text = readDecomp('src/data/trainers.h');
  if (!text) return {};
  // Format : `[TRAINER_XXX] = { .partyFlags = N, .trainerClass = X, ..., }`
  const re = /\[(TRAINER_\w+)\]\s*=\s*\{([\s\S]*?)\n\s*\},/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const id = m[1];
    const body = m[2];
    const nameMatch = body.match(/\.trainerName\s*=\s*_\("([^"]*)"\)/);
    const itemsMatch = body.match(/\.items\s*=\s*\{([^}]*)\}/);
    const items = itemsMatch
      ? (itemsMatch[1].match(/ITEM_\w+/g) ?? [])
      : [];
    out[id] = {
      partyFlags:    parseField(body, 'partyFlags') ?? '0',
      trainerClass:  parseField(body, 'trainerClass') ?? 'TRAINER_CLASS_PKMN_TRAINER_1',
      encounterMusic: parseField(body, 'encounterMusic_gender') ?? 'TRAINER_ENCOUNTER_MUSIC_MALE',
      trainerPic:    parseField(body, 'trainerPic') ?? 'TRAINER_PIC_HIKER',
      trainerName:   nameMatch?.[1] ?? '',
      items,
      doubleBattle:  /\.doubleBattle\s*=\s*TRUE/.test(body),
      aiFlags:       parseField(body, 'aiFlags') ?? '0',
      partySize:     parseInt10(parseField(body, 'partySize')),
    };
  }
  return out;
}

// ─── 16. contest_moves.h ───────────────────────────────────────────────────

function parseContestMoves() {
  const text = readDecomp('src/data/contest_moves.h');
  if (!text) return {};
  // Brace-équilibré (1 niveau pour `.comboMoves = {…}`). L'ancien
  // `\{([\s\S]*?)\n\s*\}` cassait sur `[MOVE_NONE] = {0},` (pas de \n avant
  // `}`) : fusionnait MOVE_NONE + MOVE_POUND → données POUND sous clé
  // MOVE_NONE + clé MOVE_POUND perdue (off-by-one sur TOUT le contest).
  const re = /\[(MOVE_\w+)\]\s*=\s*\{((?:[^{}]|\{[^}]*\})*)\}/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const moveId = m[1];
    const body = m[2];
    const comboMatch = body.match(/\.comboMoves\s*=\s*\{([^}]*)\}/);
    const comboMoves = comboMatch
      ? (comboMatch[1].match(/COMBO_STARTER_\w+/g) ?? [])
      : [];
    out[moveId] = {
      effect:           parseField(body, 'effect') ?? 'CONTEST_EFFECT_HIGHLY_APPEALING',
      contestCategory:  parseField(body, 'contestCategory') ?? 'CONTEST_CATEGORY_COOL',
      comboStarterId:   parseField(body, 'comboStarterId') ?? '0',
      comboMoves,
    };
  }
  return out;
}

// ─── 17. evolution.h ──────────────────────────────────────────────────────

function parseEvolutions() {
  const text = readDecomp('src/data/pokemon/evolution.h');
  if (!text) return {};
  // 1:1 décomp `gEvolutionTable[NUM_SPECIES][EVOS_PER_MON]`. Entrées espèce
  // multi-lignes (ex. SPECIES_EEVEE = 5 évolutions sur 5 lignes). Le param
  // peut être numérique (EVO_LEVEL/BEAUTY), 0 (EVO_FRIENDSHIP*/EVO_TRADE)
  // OU une constante ITEM_* (EVO_ITEM/EVO_TRADE_ITEM) → à résoudre en id.
  // (ancien bug : regex param `\d+` only → toutes les EVO_ITEM droppées =
  //  Eevee + toutes les évolutions par pierre n'évoluaient pas en jeu.)
  const itemsH = readDecomp('include/constants/items.h') || '';
  const itemId = {};
  for (const im of itemsH.matchAll(/^#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) {
    itemId[im[1]] = Number(im[2]);
  }
  const tblM = text.match(/gEvolutionTable\s*\[[^\]]*\]\s*\[[^\]]*\]\s*=\s*\{([\s\S]*)\}\s*;/);
  const body = tblM ? tblM[1] : text;
  const out = {};
  const re = /\[(SPECIES_\w+)\]\s*=\s*\{/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const speciesId = m[1];
    // Scan d'accolades appariées pour isoler le bloc espèce (multi-lignes).
    let depth = 1, i = re.lastIndex;
    for (; i < body.length && depth > 0; i++) {
      if (body[i] === '{') depth++;
      else if (body[i] === '}') depth--;
    }
    const inner = body.slice(re.lastIndex, i - 1);
    const evos = [];
    for (const em of inner.matchAll(/\{\s*(EVO_\w+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*(SPECIES_\w+)\s*\}/g)) {
      const method = em[1];
      if (method === 'EVO_NONE') continue;
      const p = em[2];
      let param;
      if (/^0x[\da-fA-F]+$/.test(p)) param = parseInt(p, 16);
      else if (/^\d+$/.test(p)) param = parseInt(p, 10);
      else if (p in itemId) param = itemId[p];
      else param = 0;
      evos.push({ method, param, target: em[3] });
    }
    if (evos.length > 0) out[speciesId] = evos;
  }
  return out;
}

// ─── 18. item_effects.h ─────────────────────────────────────────────────────

function parseItemEffects() {
  const text = readDecomp('src/data/pokemon/item_effects.h');
  if (!text) return {};
  // Format : `const u8 gItemEffect_XXX[N] = { [idx] = VALUE, ... }`.
  // Capture la liste des fields set + la size.
  const re = /const\s+u8\s+gItemEffect_(\w+)\[(\d+)\]\s*=\s*\{([\s\S]*?)\}/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const itemName = m[1];
    const size = Number(m[2]);
    const body = m[3];
    const reField = /\[(\d+)\]\s*=\s*([A-Z][A-Z0-9_]*|\d+)/g;
    const fields = {};
    let mm;
    while ((mm = reField.exec(body)) !== null) {
      fields[mm[1]] = mm[2];
    }
    out['ITEM_' + itemName.toUpperCase()] = { size, fields };
  }
  return out;
}

// ─── 19. pokedex_orders.h ──────────────────────────────────────────────────

function parsePokedexOrders() {
  const text = readDecomp('src/data/pokemon/pokedex_orders.h');
  if (!text) return {};
  // Plusieurs arrays : Alphabetical, Weight, Height, NationalDexNumberToHoenn, etc.
  const re = /const\s+u16\s+gPokedexOrder_(\w+)\[\]\s*=\s*\{([\s\S]*?)\};/g;
  const out = {};
  let m;
  while ((m = re.exec(text)) !== null) {
    const orderName = m[1];
    const body = m[2];
    const dexNums = (body.match(/NATIONAL_DEX_\w+/g) ?? []);
    out[orderName] = dexNums;
  }
  return out;
}

// ─── 20. trainer_class_lookups.h ───────────────────────────────────────────

function parseTrainerClassLookups() {
  const text = readDecomp('src/data/pokemon/trainer_class_lookups.h');
  if (!text) return {};
  // Plusieurs tables : gFacilityClassToPicIndex, gFacilityClassToTrainerClass, etc.
  const out = {};
  // gFacilityClassToPicIndex[]
  const rePic = /\[(FACILITY_CLASS_\w+)\]\s*=\s*(TRAINER_PIC_\w+)/g;
  let m;
  out.facilityClassToPic = {};
  while ((m = rePic.exec(text)) !== null) out.facilityClassToPic[m[1]] = m[2];
  // gFacilityClassToTrainerClass[]
  const reClass = /\[(FACILITY_CLASS_\w+)\]\s*=\s*(TRAINER_CLASS_\w+)/g;
  out.facilityClassToTrainerClass = {};
  while ((m = reClass.exec(text)) !== null) out.facilityClassToTrainerClass[m[1]] = m[2];
  return out;
}

// ─── 21. battle_main.c gTypeEffectiveness ──────────────────────────────────

function parseTypeChart() {
  const text = readDecomp('src/battle_main.c');
  if (!text) return [];
  // Format : `const u8 gTypeEffectiveness[336] = { TYPE_X, TYPE_Y, TYPE_MUL_Z, ... }`.
  const m = text.match(/const\s+u8\s+gTypeEffectiveness\[\d+\]\s*=\s*\{([\s\S]*?)\};/);
  if (!m) return [];
  const body = m[1];
  // Each entry = 3 tokens : attackerType, defenderType, multiplier.
  // TYPE_FORESIGHT (= sentinel 0xFE) marks beginning of foresight section.
  // TYPE_ENDTABLE (= sentinel 0xFF) marks end.
  const tokens = body.split(/[,\n]/).map(s => s.trim()).filter(s => s.startsWith('TYPE_'));
  const out = [];
  for (let i = 0; i + 2 < tokens.length; i += 3) {
    const att = tokens[i];
    const def = tokens[i + 1];
    const mul = tokens[i + 2];
    if (att === 'TYPE_FORESIGHT' || att === 'TYPE_ENDTABLE') break;
    out.push([att, def, mul]);
  }
  return out;
}

// ─── Run all extractions ────────────────────────────────────────────────────

console.log('Extracting Pokémon data tables from decomp...');
console.log(`Source: ${decompPath}`);
console.log(`Output: ${outDir}`);
console.log('');

writeOut('species-info.json',         parseSpeciesInfo());
writeOut('moves-data.json',           parseBattleMoves());
writeOut('move-names-fr.json',        parseMoveNames());
writeOut('move-descriptions-fr.json', parseMoveDescriptions());
writeOut('level-up-learnsets.json',   parseLevelUpLearnsets());
writeOut('egg-moves.json',            parseEggMoves());
writeOut('tmhm-learnsets.json',       parseTmhmLearnsets());
writeOut('tutor-learnsets.json',      parseTutorLearnsets());
writeOut('abilities-fr.json',         parseAbilities());
writeOut('ability-names-fr.json',     parseAbilityNames());
writeOut('nature-names-fr.json',      parseNatureNames());
writeOut('trainer-class-names-fr.json', parseTrainerClassNames());
writeOut('item-descriptions-fr.json', parseItemDescriptions());
writeOut('experience-tables.json',    parseExperienceTables());

writeOut('trainers.json',             parseTrainers());
writeOut('contest-moves.json',        parseContestMoves());
writeOut('evolutions.json',           parseEvolutions());
writeOut('item-effects.json',         parseItemEffects());
writeOut('pokedex-orders.json',       parsePokedexOrders());
writeOut('trainer-class-lookups.json', parseTrainerClassLookups());
writeOut('type-chart.json',           parseTypeChart());

console.log('');
console.log('Done.');

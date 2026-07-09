// ============================================================================
// Workflow READ-ONLY : cartographier decomp-bridge.ts pour le VIDER vers src/ 1:1
// ----------------------------------------------------------------------------
// Phase 1 du chantier "colonne vertébrale". 100% lecture (agents type 'Plan' =
// AUCUN outil d'édition). Produit le contenu de docs/SPINE-DECYCLE-PLAN.md, que
// le main loop (Claude) écrit sur disque APRÈS le run. Aucune écriture par agent.
//
// But : classer chacun des ~413 exports de decomp-bridge.ts par "foyer canonique"
//   - substrate : glue matériel GBA/BIOS/runtime, sans origine .c → RESTE dans harness
//   - duplicate : déjà défini dans un src/ canonique → bridge à supprimer (re-route importeurs)
//   - movable   : origine .c claire, pas encore de home src/ → déplacer vers src/<.c>.ts
//   - orphan    : logique de jeu sans origine .c évidente → à investiguer
// + ordre de migration cycle-aware (feuilles d'abord, centraux en dernier).
// ============================================================================

export const meta = {
  name: 'spine-decycle-map',
  description: 'Cartographie read-only de decomp-bridge.ts : classer chaque export par foyer canonique (substrate/duplicate/movable/orphan) + ordre de migration cycle-aware',
  phases: [
    { title: 'Map', detail: 'Fan-out ~14 agents Plan : classent les exports par tranche de lignes' },
    { title: 'Synthesize', detail: 'Fusion → contenu de docs/SPINE-DECYCLE-PLAN.md' },
  ],
}

const BRIDGE = 'harness/runtime/decomp-bridge.ts'
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src'
const TOTAL_LINES = 3462
const N = 14
const CHUNK = Math.ceil(TOTAL_LINES / N)

// Schéma de sortie structuré (le main loop n'a aucun parsing à faire).
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['exports'],
  properties: {
    exports: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'kind', 'classification', 'canonicalHome', 'cycleRisk', 'notes'],
        properties: {
          name: { type: 'string' },
          kind: { type: 'string', enum: ['function', 'const', 'class', 'reexport'] },
          classification: { type: 'string', enum: ['substrate', 'duplicate', 'movable', 'orphan'] },
          decompOrigin: { type: 'string', description: 'fichier .c décomp qui définit ce symbole, ou "" si aucun' },
          existingSrcDef: { type: 'string', description: 'chemin src/ où le symbole est DÉJÀ défini (dual source), ou ""' },
          canonicalHome: { type: 'string', description: 'foyer cible : "src/<x>.ts" ou "harness (substrat)"' },
          importerCount: { type: 'number', description: 'approx. nb de fichiers important ce nom depuis decomp-bridge' },
          cycleRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
          notes: { type: 'string' },
        },
      },
    },
  },
}

const mapPrompt = (start, end) => `Tu analyses le shim TS \`${BRIDGE}\` (un "fourre-tout" de compat à VIDER vers les fichiers src/ 1:1 de la décomp Pokémon Emerald).
SCOPE STRICT : uniquement les symboles EXPORTÉS dont la déclaration commence entre les lignes ${start} et ${end} de \`${BRIDGE}\`. Ignore tout le reste du fichier.
READ-ONLY : ne modifie AUCUN fichier (tu n'as pas d'outil d'édition, c'est voulu).

Pour CHAQUE symbole exporté (\`export function\`, \`export const|let|class\`, \`export {..} from\`) dans cette tranche :
1. Lis sa déclaration (signature + corps) dans \`${BRIDGE}\`.
2. ORIGINE décomp : grep \`${DECOMP}\` pour le nom → quel fichier .c le définit (= foyer canonique 1:1 = src/<même base>.ts). "" si aucun (probable substrat GBA/BIOS, pas de la logique de jeu).
3. DUAL SOURCE : grep \`src/\` ET \`harness/\` (hors decomp-bridge.ts) pour une définition existante du même nom → note le chemin si trouvé.
4. CLASSE :
   - "substrate" = glue matériel GBA/BIOS/runtime sans origine .c de jeu → reste dans harness.
   - "duplicate" = déjà défini dans un src/ canonique (étape 3) → le bridge double, à SUPPRIMER (importeurs re-routés vers src/).
   - "movable" = origine .c claire (étape 2), pas encore de home src/ → DÉPLACER vers src/<fichier .c>.ts.
   - "orphan" = logique de jeu mais origine .c ambiguë/introuvable → à investiguer.
5. canonicalHome = chemin src/ cible, ou "harness (substrat)".
6. importerCount : approx via grep des importeurs de decomp-bridge qui citent CE nom.
7. cycleRisk : low par défaut ; medium/high si le foyer cible est central (globals, sprite, save, event_object_movement) ou très importé.

Sois EXACT sur les noms. N'INVENTE PAS d'origine .c : mets "" si tu ne la trouves pas. Cite tes greps mentalement, ne devine pas.
Retourne la liste structurée de TOUS les exports de ta tranche.`

phase('Map')
const CHUNKS = Array.from({ length: N }, (_, i) => [i * CHUNK + 1, Math.min((i + 1) * CHUNK, TOTAL_LINES)])
log(`Cartographie de ${BRIDGE} (${TOTAL_LINES} l.) en ${N} tranches read-only…`)
const findings = await parallel(CHUNKS.map(([s, e]) => () =>
  agent(mapPrompt(s, e), { label: `map:${s}-${e}`, phase: 'Map', agentType: 'Plan', schema: SCHEMA })
))
const allExports = findings.filter(Boolean).flatMap((f) => (f && f.exports) || [])
const byClass = allExports.reduce((a, e) => { a[e.classification] = (a[e.classification] || 0) + 1; return a }, {})
log(`Classés : ${allExports.length} exports — ${JSON.stringify(byClass)}`)

phase('Synthesize')
const synthPrompt = `Voici ${allExports.length} exports de \`${BRIDGE}\` déjà classés (JSON) :

${JSON.stringify(allExports, null, 1)}

Produis le CONTENU markdown de \`docs/SPINE-DECYCLE-PLAN.md\` (RETOURNE-le en texte, ne l'écris PAS sur disque — tu es read-only). Structure :
1. **Résumé** : compte par classification + total ; combien d'importeurs au total à re-router.
2. **Table "duplicate"** (gains rapides, 0 risque logique) : symbole → src/ canonique existant → nb importeurs à re-router.
3. **Table "movable"**, GROUPÉE PAR fichier src/ cible (= lots de migration) : pour chaque fichier cible, la liste des symboles + total importeurs.
4. **Table "orphan"** : symbole + hypothèse de home + ce qu'il faut investiguer.
5. **Liste "substrate"** : ce qui RESTE dans harness, avec justification courte.
6. **ORDRE DE MIGRATION** optimal et CYCLE-AWARE : feuilles d'abord (cycleRisk low, peu d'importeurs, fichiers cible non-centraux), centraux (globals/sprite/save/event_object_movement) en DERNIER. Numérote les lots ; chaque lot = 1 fichier cible ou 1 groupe cohérent ; indique le nb d'importeurs touchés et le cycleRisk. C'est un plan d'exécution SOLO lot-par-lot (tsc=0 + A/B chaque lot, jamais de push).
7. **Risques** : cycles ESM identifiés ; dual-sources dangereux à traiter en priorité (ex. Get*MovementAction, FreeAllSpritePalettes — où le bridge double une impl vivante).
Sois exhaustif, concret, et n'invente rien au-delà des données fournies.`

const planDoc = await agent(synthPrompt, { label: 'synthesize', phase: 'Synthesize', agentType: 'Plan' })

return { planDoc, classified: allExports.length, byClass }

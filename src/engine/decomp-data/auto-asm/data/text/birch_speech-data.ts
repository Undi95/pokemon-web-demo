// AUTO-GENERATED from data/text/birch_speech.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/birch_speech.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_Birch_Welcome', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_Pokemon', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_MainSpeech', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_AndYouAre', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_BoyOrGirl', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_WhatsYourName', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_SoItsPlayer', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_YourePlayer', isGlobal: true, instrIndex: 0 },
  { name: 'gText_Birch_AreYouReady', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=47
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Bonjour! Désolé pour l'attente!\\p\""] },
  { kind: '.string', vals: ["\"Bienvenue dans le monde\\n\""] },
  { kind: '.string', vals: ["\"des POKéMON!\\p\""] },
  { kind: '.string', vals: ["\"Je m'appelle SEKO.\\p\""] },
  { kind: '.string', vals: ["\"Mais tout le monde ici m'appelle\\n\""] },
  { kind: '.string', vals: ["\"le PROFESSEUR POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"$\""] },
  { kind: '.string', vals: ["\"This is what we call a “POKéMON.”\\p\""] },
  { kind: '.string', vals: ["\"\\n\""] },
  { kind: '.string', vals: ["\"$\""] },
  { kind: '.string', vals: ["\"Ce monde est peuplé de créatures\\n\""] },
  { kind: '.string', vals: ["\"appelées POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Nous, les humains, vivons avec les\\n\""] },
  { kind: '.string', vals: ["\"POKéMON. Il nous arrive de jouer\\l\""] },
  { kind: '.string', vals: ["\"ou de travailler ensemble.\\p\""] },
  { kind: '.string', vals: ["\"Et parfois, nous nous réunissons\\n\""] },
  { kind: '.string', vals: ["\"pour nous affronter au cours de\\l\""] },
  { kind: '.string', vals: ["\"formidables combats de POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Mais malgré nos liens, nous ne\\n\""] },
  { kind: '.string', vals: ["\"savons pas tout sur les POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"En réalité, il existe d'innombrables\\n\""] },
  { kind: '.string', vals: ["\"secrets concernant les POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Pour percer les mystères des\\n\""] },
  { kind: '.string', vals: ["\"POKéMON, je les étudie. C'est\\l\""] },
  { kind: '.string', vals: ["\"mon métier, je suis chercheur.\\p\""] },
  { kind: '.string', vals: ["\"$\""] },
  { kind: '.string', vals: ["\"Et toi, qui es-tu?$\""] },
  { kind: '.string', vals: ["\"Es-tu un garçon?\\n\""] },
  { kind: '.string', vals: ["\"Ou es-tu une fille?$\""] },
  { kind: '.string', vals: ["\"Très bien.\\n\""] },
  { kind: '.string', vals: ["\"Comment t'appelles-tu?$\""] },
  { kind: '.string', vals: ["\"Tu t'appelles {PLAYER}{KUN}?$\""] },
  { kind: '.string', vals: ["\"Ah, mais c'est vrai!\\p\""] },
  { kind: '.string', vals: ["\"Tu es {PLAYER}{KUN}! Tu viens d'arriver\\n\""] },
  { kind: '.string', vals: ["\"à BOURG-EN-VOL, là où j'habite.\\p\""] },
  { kind: '.string', vals: ["\"Je m'en souviens, maintenant!\\p\""] },
  { kind: '.string', vals: ["\"$\""] },
  { kind: '.string', vals: ["\"Bon, comment te sens-tu?\\p\""] },
  { kind: '.string', vals: ["\"Tu es sur le point de commencer\\n\""] },
  { kind: '.string', vals: ["\"une aventure unique.\\p\""] },
  { kind: '.string', vals: ["\"Fais preuve de courage et plonge\\n\""] },
  { kind: '.string', vals: ["\"dans le monde des POKéMON où\\l\""] },
  { kind: '.string', vals: ["\"tu vivras de belles aventures,\\l\""] },
  { kind: '.string', vals: ["\"remplies de rêves et d'amitiés!\\p\""] },
  { kind: '.string', vals: ["\"Bien, rejoins-moi plus tard.\\n\""] },
  { kind: '.string', vals: ["\"Viens me voir au LABO POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"$\""] },
] as const;

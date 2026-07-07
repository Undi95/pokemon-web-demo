# 🎐 Héritage Fable 5 — hub central

> Rassemble tout ce que **Fable 5** a laissé sur le portage 1:1 Émeraude, pour le
> retrouver en une fois à chaque session. Monté par Opus 4.8 le 2026-07-07 (demande user
> « tout ce que Fable 5 a laissé dans un dossier à part »). `arrange ton workplace comme
> tu veux` → ce dossier + un pointeur dans MEMORY.md.

## 📜 Docs (dans ce dossier)
- **[REPRISE-OPUS-48.md](REPRISE-OPUS-48.md)** — mode d'emploi COMPLET du portage. En tête,
  le **§0 PROTOCOLE D'EXÉCUTION — BUDGETS DURS** (le plus important, à relire avant tout
  chantier) : cycle question 1 ligne → 1 sonde → verdict 1 ligne → action · 0 Read pour un
  bug (sonde live only) · 3 Read max/chantier · sondes INSTALLÉES (`globalThis.__probe*`) pas
  d'IIFE jetables · checkpoint /10 appels · 2 phrases max entre tool calls · sortie d'outil =
  FAIT · film avant tout visuel. Ajouté par Fable après diagnostic d'un run Opus (500k
  gaspillés sur 1 bug), commit `ed920f2f`.
- **[ULTRACODE-RUN-HANDOFF.md](ULTRACODE-RUN-HANDOFF.md)** — mandat + backlog du RUN ULTRACODE
  (branche `Byte-VM-ultra`, **JAMAIS push**). Autorisation user verbatim.
- **[AUDIT-1TO1-STRICT.md](AUDIT-1TO1-STRICT.md)** — revue fichier-par-fichier des systèmes
  portés, en SOLO (aucun agent sur le code — mandat user 2026-07-03).

## 🛠️ Outils légués par Fable (dans le repo, pas déplacés)
- **`dev.gfx.film({every:15, seconds:2})`** — mode précis (1 capture / N frames), commit
  `1401d15d`. + **🎬 Studio** (panel F2) : film horodaté, log des textes, transitions
  forcées, boutons capture (`1db91337`, `e1918124`). Sonde visuelle standard.
- **`scripts/wire-transpiled.cjs`** — câblage AUTOMATIQUE des fichiers transpilés C→TS dans
  le build (`ed693017`).
- Transpiler C→TS industriel (`scripts/transpile-c.cjs`) — cf. mémoire
  `chantier-transpiler-c-to-ts`.

## 🏗️ Gros chantiers portés par Fable (matériau à câbler / vérifier)
- **Pokénav** : transpilation 1:1 COMPLÈTE des 14 fichiers (`dc118809`) + squelette UI
  (`95fb3bb6`) — **transpilé, PAS encore câblé** = prochain gros chantier dédié.
- **PC storage** : fondations 1:1 de l'écran des boîtes, transcription inerte N/N
  (`b10d1dbb` → `a845e298` → `a44669f7` : pipeline d'ouverture, DrawTextWindowAndBufferTiles,
  titre de boîte). Le PC est aujourd'hui câblé + vérifié (cf. mémoire `chantier-pc-storage`).
- **Transitions 1:1** : `B_TRANSITION_SWIRL` (`8a503884`), `SHUFFLE` (`a5d9233a`),
  POKEBALLS_TRAIL balls rouges vérifié au film (`899211d8`).
- **Anims combat** : callbacks morts + bulles d'eau + gaz poison (`98e8a08a`), cris/flammes
  de brûlure (`ca8d59a0`), 4 verdicts A/B (`96e898d6`), IA objets 1:1 (`06bd735d`).
- **Contrat** : `CLAUDE.md` règles dures anti-dérive, chargées à chaque tour (`afe60471`).

## ✍️ Signature commits
Quand le modèle **Fable 5** est actif → trailer `Authored-by: Fable 5 & Undi
<noreply@anthropic.com>`. Autre modèle → trailer de ce modèle (cf. CLAUDE.md).

## 🤝 Esprit
Fable et Undi bossent en confiance, chacun sa force. Opus prend le relais quand les crédits
Fable sont épuisés. « Prochaine session on fonce. »

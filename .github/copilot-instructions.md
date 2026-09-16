# Instructions Contribo

Lire [AGENTS.md](../AGENTS.md) et [CONTRIBUTING.md](../CONTRIBUTING.md) avant toute
modification, ainsi que [le contexte OpenSpec](../openspec/config.yaml).
Branche dédiée `<scope>/<type>-<ticket>-<description>`, ticket `000` pendant
l'initialisation, livraison par PR vers `main` ; aucun push direct sur `main`.

Sélectionner un seul ticket enregistré dans `openspec/tickets.json`, affiché `T-<numero>`.
Lire `node scripts/tickets.mjs resolve T-<numero> --json`, vérifier les prérequis,
créer/réutiliser la branche retournée puis exécuter `node scripts/tickets.mjs verify T-<numero>`
avant génération. Ne pas confondre numéros locaux, étapes OpenSpec et issues GitHub.

Pour le frontend, lire le README de `contribo-front` et les règles pertinentes de
[.claude/rules/frontend](../.claude/rules/frontend). Architecture par features,
`core`, `shared` ; l'hexagonal concerne le futur backend.

Les skills se trouvent dans `.github/skills` ; les profils natifs dans
`.github/agents`. Voir [AI-WORKFLOW.md](../AI-WORKFLOW.md) pour les invocations,
les équivalents de commandes OpenSpec et la maintenance de la parité.
Dans les skills générés, traduire les noms d'outils Claude vers les outils
disponibles : lire, rechercher, poser une question et suivre les tâches avec
les capacités de l'hôte ; ne jamais inventer un outil absent.

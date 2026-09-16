# Instructions du dépôt — Contribo

Lire [CONTRIBUTING.md](CONTRIBUTING.md) avant toute évolution. Ce document fait
autorité pour les conventions Git, la traçabilité OpenSpec et la livraison par PR.

Les skills et agents sont partagés entre Claude, Codex et Copilot ; lire
[AI-WORKFLOW.md](AI-WORKFLOW.md) pour leurs invocations et la synchronisation.
Pour un skill généré OpenSpec, traduire les noms d'outils Claude vers les capacités
disponibles de l'hôte (lecture, recherche, question, suivi des tâches), sans inventer
un outil absent. Les règles du dépôt restent dans les instructions communes.
Toute nouvelle capacité Claude doit être exposée et contrôlée pour les trois outils.

- Avant de modifier des fichiers, lire les instructions applicables, vérifier
  `git status --short` et `git branch --show-current`, puis identifier le ticket.
- Créer ou réutiliser la branche du ticket avant toute génération/modification
  de code. Format : `<scope>/<type>-<ticket>-<description>` ; scopes `front`, `back`,
  `fullstack`, `docs`, `infra` ; types `feat`, `fix`, `refactor`, `perf`, `test`, `chore`.
- Ne jamais générer/modifier/committer du code sur `main`, pousser vers `main`,
  ni contourner les hooks ou protections. Cela inclut les clients générés,
  scaffolds, dépendances, migrations et artefacts OpenSpec.
- Pendant l'initialisation du projet, utiliser le marqueur `000` autorisé par le
  mainteneur sans demander de numéro réel. Il autorise code, commits et PR sur
  une branche dédiée par évolution ; jamais de push sur `main` ni de `Closes #000`.
  Retirer cette exception des règles, hooks, CI et tests quand le mainteneur
  déclare l'initialisation terminée, selon CONTRIBUTING.md.
- Hors de cette exception, sans ticket enregistré, préparer uniquement documentation,
  spécifications et règles/outils du workflow sur une branche locale provisoire
  conforme à CONTRIBUTING.md. Planifier et enregistrer le ticket avec `nextTicketId`
  puis utiliser sa branche avant le code applicatif, un commit ou une publication.
  Ne jamais inventer un numéro d'issue externe ni réutiliser un numéro réservé.
- Une branche et une PR par ticket. Un change OpenSpec peut regrouper plusieurs
  tickets ; ses tâches ne constituent pas automatiquement des tickets.
- Préserver les modifications préexistantes. Ne jamais faire `git add .`, nettoyer,
  stasher ou embarquer le travail d'un autre ticket sans vérifier son périmètre.
- Lire le contexte et les règles de `openspec/config.yaml`, puis les artefacts
  pertinents avant d'implémenter ; mettre à jour les tâches effectivement réalisées.
- Les tickets locaux réels sont enregistrés dans `openspec/tickets.json`, avec
  affichage `T-<numero>` et compteur global `nextTicketId` pour tous les scopes.
  Réserver le prochain numéro lors de la planification ; ne jamais renuméroter,
  supprimer ou réattribuer un ticket existant. Conserver les annulations avec
  `planningStatus: cancelled`. Ne pas confondre ces tickets avec des issues GitHub.
- Pour un change contenant des tickets enregistrés, sélectionner un seul ticket
  avant l'apply. Sans sélection explicite, utiliser uniquement un ticket déductible
  sans ambiguïté ; sinon demander le ticket, sans générer de code.
- Depuis la racine, exécuter `node scripts/tickets.mjs resolve T-<numero> --json`,
  lire ses tâches/prérequis et respecter la branche retournée. `initializationActive`
  reste `true` jusqu'à décision du mainteneur : branches `000`, identités `T-<numero>`.
  L'initialisation historique de l'outillage reste autorisée sous `000` hors catalogue.
- Vérifier les dépendances et leur présence dans la branche ; les cases OpenSpec
  ne prouvent pas une fusion de PR. Créer/réutiliser la branche attendue dans un
  état Git vérifié, puis exécuter `node scripts/tickets.mjs verify T-<numero>` avant
  la génération. Corriger la branche ou signaler les prérequis manquants si le
  contrôle échoue. Ne pas implémenter silencieusement d'autres tickets pour le faire passer.
- Modifier/cocher uniquement les étapes rattachées au ticket ; utiliser
  `T-<numero>` dans les titres de commits/PR locaux, jamais `#<numero>` ou
  `Closes #<numero>` sans issue GitHub réelle distincte. Consulter
  [openspec/TICKETS.md](openspec/TICKETS.md) et vérifier le registre avec
  `node scripts/tickets.mjs check` ; les skills générés OpenSpec restent inchangés.
- Pour le frontend, lire les règles pertinentes dans `.claude/rules/frontend/`.
- Le frontend utilise une architecture par fonctionnalités : `features/<feature>/`,
  `core/` pour le socle global, `shared/` pour les éléments neutres réutilisés.
  Charger les features paresseusement ; ne pas introduire de couches hexagonales,
  ports ou adapters frontend. L'architecture hexagonale est réservée au backend.
- Exécuter les validations adaptées et rapporter les commandes, résultats et limites
  réels. Préparer une PR vers `main` à partir du modèle `.github/pull_request_template.md`.
- Si la livraison est demandée, pousser uniquement la branche du ticket et ouvrir
  la PR. Ne jamais fusionner ni activer l'auto-merge sans demande explicite.

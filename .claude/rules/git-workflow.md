# Git et OpenSpec — toutes les évolutions

Lire `AGENTS.md` et `CONTRIBUTING.md` à la racine du dépôt. Ces instructions
s'appliquent à tous les fichiers, aux commandes Git et à la génération de code.

- Une branche `<scope>/<type>-<ticket>-<description>` et une PR vers `main` par ticket.
- Vérifier la branche avant de générer/modifier du code ; ne jamais travailler,
  committer ou pousser du code sur `main`, ni contourner les protections.
- Scopes : `front`, `back`, `fullstack`, `docs`, `infra` ; types : `feat`, `fix`,
  `refactor`, `perf`, `test`, `chore` ; ticket réel entier positif ; description kebab-case.
- L'initialisation est terminée (`initializationActive: false`) : `000` n'est plus
  accepté par les hooks, la CI ni le script de parité IA. Les branches/commits
  déjà livrés sous `000` restent inchangés, voir CONTRIBUTING.md.
- Sans ticket enregistré, préparation locale de documentation, spécifications et règles/outils
  du workflow sur `docs/<type>-local-<description>` ou `infra/<type>-local-<description>`,
  sans code applicatif/commit/push/PR ; enregistrer le ticket local avec nextTicketId
  puis renommer avant le code et la livraison.
- Un change OpenSpec peut couvrir plusieurs tickets ; appliquer uniquement le
  ticket choisi sur sa branche, avec les validations et la traçabilité correspondantes.
- Les tickets réels locaux sont dans `openspec/tickets.json`, affichés `T-<numero>`.
  Réserver `nextTicketId` pour une nouvelle évolution, tous scopes confondus, sans
  renuméroter ou réattribuer un ticket. Les étapes `[T-<numero>]` définissent son périmètre.
- Pour un ticket enregistré, lire `node scripts/tickets.mjs resolve T-<numero> --json`,
  vérifier ses prérequis et son état Git, créer/réutiliser la branche retournée,
  puis exécuter `node scripts/tickets.mjs verify T-<numero>` avant génération.
  Sans ticket déductible sans ambiguïté, demander sa sélection ; ne pas appliquer tout le backlog.
- Ne pas confondre `T-<numero>` et `#<numero>` GitHub. Utiliser `T-<numero>` dans
  les titres de commits/PR locaux ; aucun `Closes` fictif.
- Ne pas fusionner ni activer l'auto-merge sans demande explicite de l'utilisateur.

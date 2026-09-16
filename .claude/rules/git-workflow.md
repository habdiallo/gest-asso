# Git et OpenSpec — toutes les évolutions

Lire `AGENTS.md` et `CONTRIBUTING.md` à la racine du dépôt. Ces instructions
s'appliquent à tous les fichiers, aux commandes Git et à la génération de code.

- Une branche `<scope>/<type>-<ticket>-<description>` et une PR vers `main` par ticket.
- Vérifier la branche avant de générer/modifier du code ; ne jamais travailler,
  committer ou pousser du code sur `main`, ni contourner les protections.
- Scopes : `front`, `back`, `fullstack`, `docs`, `infra` ; types : `feat`, `fix`,
  `refactor`, `perf`, `test`, `chore` ; ticket réel entier positif ; description kebab-case.
- Pendant l'initialisation, utiliser `000` sans demander de numéro réel : code,
  commits et PR autorisés, une branche/PR dédiée par évolution. Jamais de push
  vers `main` ni de `Closes #000`. Retirer l'exception quand le mainteneur déclare
  l'initialisation terminée, conformément à CONTRIBUTING.md.
- Hors exception `000`, sans ticket, préparation locale de documentation, spécifications et règles/outils
  du workflow sur `docs/<type>-local-<description>` ou `infra/<type>-local-<description>`,
  sans code applicatif/commit/push/PR ; demander le ticket et renommer avant livraison.
- Un change OpenSpec peut couvrir plusieurs tickets ; appliquer uniquement le
  ticket choisi sur sa branche, avec les validations et la traçabilité correspondantes.
- Ne pas fusionner ni activer l'auto-merge sans demande explicite de l'utilisateur.

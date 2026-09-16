# Instructions du dépôt — Contribo

Lire [CONTRIBUTING.md](CONTRIBUTING.md) avant toute évolution. Ce document fait
autorité pour les conventions Git, la traçabilité OpenSpec et la livraison par PR.

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
- Hors de cette exception, sans vrai numéro de ticket, préparer uniquement documentation, spécifications
  et règles/outils du workflow sur une branche locale provisoire conforme à
  CONTRIBUTING.md ; demander le numéro avant le code applicatif, un commit
  ou toute publication. Ne jamais l'inventer.
- Une branche et une PR par ticket. Un change OpenSpec peut regrouper plusieurs
  tickets ; ses tâches ne constituent pas automatiquement des tickets.
- Préserver les modifications préexistantes. Ne jamais faire `git add .`, nettoyer,
  stasher ou embarquer le travail d'un autre ticket sans vérifier son périmètre.
- Lire le contexte et les règles de `openspec/config.yaml`, puis les artefacts
  pertinents avant d'implémenter ; mettre à jour les tâches effectivement réalisées.
- Pour le frontend, lire les règles pertinentes dans `.claude/rules/frontend/`.
- Le frontend utilise une architecture par fonctionnalités : `features/<feature>/`,
  `core/` pour le socle global, `shared/` pour les éléments neutres réutilisés.
  Charger les features paresseusement ; ne pas introduire de couches hexagonales,
  ports ou adapters frontend. L'architecture hexagonale est réservée au backend.
- Exécuter les validations adaptées et rapporter les commandes, résultats et limites
  réels. Préparer une PR vers `main` à partir du modèle `.github/pull_request_template.md`.
- Si la livraison est demandée, pousser uniquement la branche du ticket et ouvrir
  la PR. Ne jamais fusionner ni activer l'auto-merge sans demande explicite.

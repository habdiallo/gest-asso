## Why

La création d'un membre provisionne actuellement un compte utilisateur avec un
mot de passe aléatoire qui n'est jamais transmis à l'administrateur ni au
membre. Le produit doit fournir une activation initiale contrôlée, imposer le
remplacement du secret temporaire et permettre de créer le premier
administrateur sans mot de passe en clair dans la base.

## What Changes

- Retourner une seule fois l'identifiant et le mot de passe temporaire lors de
  la création d'un membre, sans exposer le mot de passe dans les lectures
  ultérieures, les journaux ou le stockage local du navigateur.
- Ajouter une confirmation frontend dédiée avec copie en un clic et message de
  transmission sécurisée au membre.
- Ajouter un indicateur persistant de changement obligatoire du mot de passe,
  initialisé pour les nouveaux comptes et appliqué aux comptes existants par
  migration.
- Ajouter une session limitée après une première connexion avec un secret
  temporaire, puis un écran obligatoire de changement de mot de passe avec
  confirmation de saisie.
- Ajouter une régénération administrateur d'un mot de passe temporaire en cas
  de perte avant transmission, avec invalidation des sessions concernées.
- Ajouter un bootstrap idempotent du premier administrateur après migration,
  alimenté par un secret Docker monté en fichier et non par une variable
  d'environnement en clair en production.
- Documenter la configuration Portainer, la rotation du secret de bootstrap et
  le parcours de récupération.

## Capabilities

### New Capabilities

- `account-password-lifecycle`: activation initiale, changement obligatoire,
  sessions limitées et bootstrap du premier administrateur.

### Modified Capabilities

- `member-management-ui`: afficher les identifiants temporaires une seule fois
  après la création d'un membre et permettre leur copie.
- `frontend-shell`: intercepter une session qui exige un changement de mot de
  passe et fournir l'écran obligatoire correspondant.
- `roles-users-ui`: permettre à un administrateur de régénérer un secret
  temporaire sans exposer le mot de passe existant.

## Impact

- Contrat OpenAPI pour la création de membre, la connexion, le changement de
  mot de passe et la régénération d'un secret temporaire.
- Schéma PostgreSQL et migration Flyway pour l'état de changement obligatoire.
- Services d'authentification, comptes utilisateurs, création de membres et
  bootstrap applicatif du backend.
- JWT/session, contrôle d'accès backend et révocation des sessions temporaires.
- Routes, garde, service de session, formulaire de mot de passe et dialogues
  des features Angular `auth`, `members` et `roles-users`.
- Tests backend et frontend, documentation de déploiement et secrets Portainer.

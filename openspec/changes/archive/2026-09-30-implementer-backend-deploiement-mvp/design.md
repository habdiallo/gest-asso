## Context

Le projet actuel ne contient pas encore de backend. Le contrat `besoins/openapi.yaml` décrit le MVP, le frontend Angular consomme un client généré et les mocks MSW permettent de travailler sans serveur. Le change `cadrer-backend-deploiement-reference` a établi les règles de réutilisation technique et exclu la reprise implicite du domaine de `saas-asso`.

## Goals / Non-Goals

**Goals:**

- Organiser l'implémentation par dépendances et par domaines livrables.
- Permettre le travail isolé dans plusieurs worktrees sans mélanger les tickets.
- Garder chaque PR vérifiable et compatible avec `main`.
- Prévoir des points de contrôle du contrat API, de la persistance et du déploiement.

**Non-Goals:**

- Implémenter les tickets dans ce change de planification.
- Ajouter une règle métier absente du cahier actuel.
- Adopter automatiquement la multi-tenancy, les rôles ou les secrets du dépôt de référence.

## Decisions

### Ordre de livraison

1. `T-143` crée le socle backend, la génération serveur éventuelle et les contrôles de contrat.
2. `T-144` ajoute la persistance et les migrations de base.
3. `T-145` ajoute l'authentification et la résolution de l'utilisateur courant.
4. `T-146`, `T-147` et `T-148` livrent les domaines membres, campagnes et cagnottes dans des worktrees distincts, après le socle d'authentification.
5. `T-149` ajoute le déploiement local reproductible.
6. `T-150` publie les images après les validations applicatives et conteneurs.
7. `T-151` prépare l'environnement d'intégration, les secrets externes et le rollback.

### Worktrees et branches

Chaque ticket utilise la branche résolue par `openspec/tickets.json` et un worktree dédié. Les tickets parallélisables ne sont ouverts qu'après vérification de leurs prérequis locaux. Les branches d'implémentation sont créées à partir d'une base contenant les tickets précédents intégrés, afin que chaque PR vers `main` reste ciblée.

### Contrat API

Toute évolution commence dans `besoins/openapi.yaml`. Le backend, le client Angular et les handlers MSW sont régénérés ou alignés dans l'ordre prévu par le change. Les changements incompatibles sont isolés et documentés avant toute implémentation.

### Contrôles de PR

Chaque ticket doit vérifier son branchement, ses dépendances, ses tests et son diff. Les PR sont poussées vers le dépôt distant et ouvertes vers `main`, mais aucune fusion ni auto-merge n'est effectuée sans demande explicite.

## Risks / Trade-offs

- [Risque] Les PR dépendantes ne peuvent pas être basées proprement sur `main` avant intégration de leur prérequis. → Ouvrir les PR dans l'ordre et attendre l'intégration de chaque prérequis avant de démarrer le suivant.
- [Risque] Le découpage par domaine peut faire évoluer le contrat en parallèle. → Réserver les modifications incompatibles du contrat à une PR coordonnée et régénérer les consommateurs.
- [Risque] Le backend devient une copie du dépôt de référence. → Recréer les modèles et cas d'usage depuis le cahier Contribo, avec tests de contrat et règles métier locales.
- [Risque] L'infrastructure embarque des secrets. → Injecter les secrets au runtime et contrôler les manifests avant publication.

## Migration Plan

Ce change est une planification. Les tickets seront implémentés un par un ou en parallèle uniquement lorsque leurs dépendances sont satisfaites. Après chaque PR intégrée, vérifier le registre et créer les worktrees suivants depuis la nouvelle base `main`.

## Open Questions

- Quelle version exacte de Java et Spring Boot sera retenue pour `T-143` ?
- PostgreSQL et Flyway sont-ils confirmés pour `T-144` ?
- Quel fournisseur d'images et quel orchestrateur d'intégration seront confirmés pour `T-150` et `T-151` ?

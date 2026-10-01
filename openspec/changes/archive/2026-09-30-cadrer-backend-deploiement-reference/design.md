## Context

Le projet actuel est un frontend Angular 21 organisé par fonctionnalités, avec les frontières `features/`, `core/` et `shared/`. Le contrat `besoins/openapi.yaml` est un contrat OpenAPI 3.1 relatif à `/api/v1`, utilisé pour générer le client Angular, tandis que les scénarios locaux reposent encore sur MSW. Aucun backend n'est versionné dans ce dépôt.

Le dépôt de référence `/Users/habdiallo/Workspace/project-perso/saas-asso` contient, dans son état versionné, un backend Spring Boot avec des packages de type hexagonal, JPA, Flyway, Spring Security et génération OpenAPI, ainsi qu'une infrastructure Docker avec PostgreSQL, Nginx, Compose, GHCR et des profils d'environnement. Son état de travail est toutefois fortement modifié. L'analyse s'appuie donc d'abord sur `HEAD`, puis signale les écarts de l'arbre de travail sans les considérer comme des décisions validées.

La contrainte principale est de faire évoluer le backend à partir de la vérité fonctionnelle de Contribo : `besoins/openapi.yaml`, `besoins/cahier-user-stories-mvp-association-v2.md`, les specs OpenSpec existantes et le comportement attendu du frontend. Les noms de domaines, règles, migrations, permissions et fonctionnalités du dépôt de référence ne sont pas des exigences de Contribo.

## Goals / Non-Goals

**Goals:**

- Produire une matrice de réutilisation classant les patterns techniques en réutilisables tels quels, adaptables ou à écarter.
- Définir une architecture backend hexagonale dont les frontières sont compatibles avec le contrat API et les règles métier actuelles.
- Maintenir un seul contrat API de référence et organiser sa validation, sa génération serveur éventuelle et la régénération du client Angular.
- Définir une trajectoire de déploiement reproductible, séparant développement, intégration et production, avec secrets externes et possibilité de retour arrière.
- Découper les futures implémentations en tickets et PR indépendants, en gardant `main` fonctionnelle à chaque étape.

**Non-Goals:**

- Implémenter le backend, les migrations, les conteneurs ou une fonctionnalité métier.
- Copier les entités, services, endpoints, rôles, modèles multi-tenant ou règles du dépôt de référence.
- Décider de nouvelles règles métier non présentes dans le projet actuel.
- Remplacer l'architecture frontend par une architecture hexagonale, des ports ou des adapters côté Angular.
- Publier ou déployer une image dans le cadre de ce change.

## Decisions

### 1. La source fonctionnelle reste le projet actuel

Les user stories, RG, specs OpenSpec et le contrat OpenAPI du projet actuel sont prioritaires. Le dépôt de référence sert uniquement à identifier des solutions techniques. Toute divergence observée doit être documentée et arbitrée dans un change fonctionnel séparé, jamais résolue par import automatique.

**Alternatives considérées:** reprendre le domaine du dépôt de référence pour accélérer le backend. Cette option est rejetée car elle ferait entrer des règles non validées dans Contribo et rendrait la traçabilité fonctionnelle ambiguë.

### 2. API Design First avec un contrat canonique

`besoins/openapi.yaml` reste le contrat canonique du MVP. Les évolutions d'API commencent par une modification versionnée de ce fichier, accompagnée de scénarios d'acceptation et d'une vérification de compatibilité. Le backend pourra générer des interfaces ou des modèles à partir de ce contrat si cela réduit le risque de dérive, mais aucun fichier généré ne devient une seconde source de vérité.

Après toute évolution acceptée du contrat, le client Angular est régénéré avec la configuration existante, les services des features consomment les types générés et les mocks sont alignés. Le backend et le frontend peuvent être livrés dans des PR distinctes si le contrat reste compatible et si chaque branche conserve un état vérifiable.

**Alternatives considérées:** laisser le backend produire son propre document OpenAPI puis recopier ses changements vers le contrat actuel. Cette option est rejetée car elle inverse la priorité et favorise la dérive entre serveur, client et mocks.

### 3. Architecture backend hexagonale minimale

Le futur backend sera organisé en domaine, application et adapters :

- le domaine porte les invariants dérivés des règles Contribo, sans dépendre de Spring, JPA ou HTTP ;
- les ports applicatifs décrivent les cas d'usage et les accès externes nécessaires ;
- l'adapter REST traduit le contrat OpenAPI vers les cas d'usage et mappe les erreurs vers `ErrorResponse` ;
- les adapters de persistance et d'infrastructure implémentent les ports, avec des migrations versionnées si PostgreSQL est retenu.

Le découpage de packages observé dans `saas-asso` est une source d'inspiration structurelle uniquement. Les classes et noms de domaine sont recréés à partir de Contribo, jamais copiés parce qu'ils existent dans la référence.

**Alternatives considérées:** placer la logique métier directement dans les contrôleurs Spring ou les repositories JPA. Cette option est rejetée car elle rendrait les règles difficiles à tester et l'évolution du contrat plus risquée.

### 4. Persistance et sécurité par décisions séparées

PostgreSQL, Flyway et les tests d'intégration avec une base éphémère sont des candidats adaptables, à confirmer par un ticket backend. La multi-tenancy par schéma, les clés RSA, les rôles et les mécanismes de bootstrap de la référence ne sont pas repris par défaut. La sécurité doit implémenter le bearer token déjà déclaré par le contrat, mais son mode d'émission, sa durée, le stockage des secrets et sa rotation feront l'objet de décisions explicites alignées sur les besoins actuels.

**Alternatives considérées:** adopter la multi-tenancy et la configuration JWT de la référence immédiatement. Cette option est rejetée tant que le cahier actuel ne l'exige pas et que les besoins de déploiement ne sont pas arbitrés.

### 5. Déploiement par images reproductibles et reverse proxy

La direction recommandée est une construction séparée du backend et du frontend, avec images versionnées, contrôles de santé, configuration injectée à l'exécution et reverse proxy pour exposer l'application et `/api/v1`. Compose peut servir au développement et à l'intégration locale. Une stack d'intégration ou de production ne doit pas embarquer de secrets ni exposer directement la base de données.

Les Dockerfiles multi-étapes, le proxy Nginx, les réseaux internes, les healthchecks et le versionnage d'images observés dans `saas-asso` sont classés adaptables. Les noms de services, domaines, ports publics, volumes, fournisseur de registre et procédure Portainer restent à confirmer pour Contribo.

**Alternatives considérées:** déployer le frontend et le backend depuis un serveur de développement ou publier uniquement des artefacts non versionnés. Cette option est rejetée car elle empêche la reproductibilité et le rollback.

## Reuse classification

| Élément observé dans `saas-asso` | Classe | Condition d'utilisation |
| --- | --- | --- |
| Séparation domaine, ports et adapters | Réutilisable tel quel comme pattern | Recréer les composants avec le domaine Contribo et vérifier les règles frontend séparément. |
| Génération OpenAPI côté serveur et client | Adaptable | Brancher les deux générations sur `besoins/openapi.yaml` sans créer un second contrat. |
| Spring Boot, Maven, PostgreSQL et Flyway | Adaptable | Confirmer versions, dépendances, licences et exigences d'exploitation dans un ticket backend. |
| Gestion centralisée des profils et variables d'environnement | Adaptable | Reprendre le principe, renommer les propriétés et interdire les secrets par défaut en production. |
| Dockerfiles multi-étapes et healthchecks | Adaptable | Adapter les chemins, commandes, ports et critères de santé au nouveau backend. |
| Nginx servant le SPA et proxifiant `/api` | Adaptable | Conserver le préfixe `/api/v1`, vérifier le routage Angular et les headers de proxy. |
| Compose PostgreSQL, backend, frontend | Adaptable | Utiliser pour le développement ou l'intégration après validation des volumes et secrets. |
| Multi-tenancy par schéma, domaines de communauté et configuration associée | À écarter par défaut | Aucun besoin actuel ne l'autorise sans décision fonctionnelle dédiée. |
| Entités, services, repositories, migrations et règles de `saas-asso` | À écarter | Ils représentent un autre périmètre métier et ne sont pas des composants génériques. |
| Noms de domaines, rôles, permissions et endpoints de la référence | À écarter | Seul le contrat et le cahier Contribo font foi. |
| Configuration Portainer, domaines publics et secrets d'intégration | À écarter par défaut | À réévaluer uniquement après décision d'exploitation propre à Contribo. |

## Risks / Trade-offs

- [Risque] Le contrat MVP est incomplet pour les besoins futurs. → Ajouter les opérations au contrat avant leur implémentation, avec compatibilité explicite et régénération contrôlée.
- [Risque] L'arbre de travail du dépôt de référence mélange des évolutions non livrées. → Utiliser `HEAD` comme base, conserver l'état local intact et documenter toute information issue de l'arbre modifié comme non validée.
- [Risque] Un modèle technique réutilisé introduit une règle métier implicite. → Exiger pour chaque reprise une justification, un test de non-régression et un lien vers une exigence Contribo.
- [Risque] Une génération serveur et frontend diverge. → Valider le contrat dans CI, générer depuis le même fichier et contrôler les diffs générés dans chaque PR concernée.
- [Risque] Des secrets ou valeurs d'environnement sont embarqués dans une image. → Injecter la configuration au runtime, scanner les manifests et refuser les valeurs sensibles par défaut en intégration et production.
- [Risque] Une migration backend casse le frontend actuel. → Livrer les changements compatibles par étapes, conserver les mocks et prévoir une stratégie de rollback pour le schéma et les images.

## Migration Plan

Ce change ne déploie rien. La trajectoire proposée est la suivante :

1. Valider ce cadrage et la matrice de réutilisation dans une PR documentaire `T-142`.
2. Créer un ticket backend pour le socle technique, son application minimale et ses tests de contrat, sur une branche dédiée.
3. Créer les tickets nécessaires pour les écarts du contrat MVP, puis régénérer le client Angular et mettre à jour les mocks dans des PR compatibles.
4. Ajouter la persistance et les migrations après validation des invariants métier et de la stratégie de données.
5. Ajouter les images, le Compose de développement, puis l'intégration et la production avec secrets externes et healthchecks.
6. En cas de régression, revenir à l'image précédente et au contrat compatible. Une migration de schéma ne sera livrée qu'avec une procédure de retour arrière ou une migration corrective documentée.

## Open Questions

- Le backend doit-il rester sur Java/Spring Boot comme dans la référence, et quelle version sera supportée par le projet actuel ?
- PostgreSQL et Flyway sont-ils les choix d'exploitation retenus, ou une autre base est-elle imposée ?
- Le MVP cible-t-il une seule association ou un modèle multi-tenant à planifier plus tard ?
- Quel émetteur de jetons, quelle stratégie de rotation et quel stockage de secrets sont attendus pour la production ?
- Quel registre d'images, quel environnement d'intégration et quel orchestrateur seront utilisés ?
- Les changements du contrat API doivent-ils être livrés dans une PR fullstack ou dans des PR backend et frontend coordonnées ?

# Contribo backend

Le backend est construit à partir du contrat HTTP OpenAPI partagé dans
[`src/main/resources/contribo-api.yml`](src/main/resources/contribo-api.yml). Le besoin fonctionnel et les
règles de gestion restent dans le [cahier métier](../besoins/cahier-user-stories-mvp-association-v2.md) :
le backend ne doit pas déduire une nouvelle règle d'un DTO généré. La séparation
des responsabilités et la chaîne complète sont détaillées dans
[`besoins/README.md`](../besoins/README.md).

La génération des interfaces et modèles OpenAPI est exécutée pendant
`generate-sources`, ce qui valide le contrat avant compilation. La version Maven
du générateur doit rester alignée avec
[`contribo-front/openapitools.json`](../contribo-front/openapitools.json) ; le
contrôle commun est `node ../scripts/check-openapi-generator-version.mjs` depuis
`contribo-back/`.

La persistance MVP utilise PostgreSQL avec Flyway. Le schéma initial est
versionné dans `src/main/resources/db/migration` et ne contient pas de données
de démonstration ni de secrets. Les paramètres de connexion sont injectés par
`DB_URL`, `DB_USERNAME` et `DB_PASSWORD`.

## Frontières domaine

Les modèles du package `com.habdiallo.contribo.domain` sont indépendants de
Spring, JDBC et des classes générées depuis OpenAPI. Les ports de comptes,
membres et catégories échangent ces types domaine avec les repositories JDBC.
Les adapters REST conservent les DTO générés au bord du système afin de
préserver le contrat HTTP. Les agrégats campagnes et cagnottes suivent une
migration progressive dans leurs tickets dédiés.

La persistance des campagnes est exposée au service par trois ports applicatifs
distincts : `CampaignCatalogRepository` pour le cycle de vie des campagnes,
`CampaignDueRepository` pour les échéances et `CampaignPaymentRepository` pour
les règlements. Les adaptateurs `JdbcCampaignCatalogRepository`,
`JdbcCampaignDueRepository` et `JdbcCampaignPaymentRepository` portent ces
frontières. Ils délèguent encore au composant SQL partagé `JdbcCampaignRepository`
pour conserver les requêtes et le comportement transactionnel pendant la
migration.

## Commandes

Depuis `contribo-back/` :

```bash
mvn generate-sources
mvn test
mvn verify
```

Les sources générées sous `target/` ne sont pas éditées manuellement. Une
modification d'interface commence dans `src/main/resources/contribo-api.yml`, après clarification
du besoin métier, puis le client Angular, les adaptateurs et les tests concernés
sont régénérés ou alignés avant la livraison.

Le service écoute sur le port `8080` par défaut. Le contrôle de santé est exposé
par Spring Boot Actuator sur `/actuator/health`. Ce socle ne contient encore
aucune logique métier. Les migrations fournissent uniquement le support
structurel nécessaire aux tickets métier suivants.

La migration `V4__migrate_phone_member_identifiers.sql` constitue une exception
contrôlée : elle remplace les identifiants de connexion des comptes membres qui
utilisent encore leur téléphone. Elle conserve les comptes et leurs historiques,
et enregistre la correspondance dans
`user_account_identifier_migration_t200`. La procédure de contrôle et de rollback
est documentée dans
[`contribo-deploiement/MEMBER-IDENTIFIER-MIGRATION.md`](../contribo-deploiement/MEMBER-IDENTIFIER-MIGRATION.md).

## Tests d'intégration et prérequis Docker

Le backend ne fait pas d'ORM : chaque `Jdbc*Repository` écrit son SQL à la main
contre PostgreSQL. Les classes de test existantes sont toutes des
`@SpringBootTest` d'intégration qui exercent ce SQL à travers les contrôleurs
HTTP réels, il n'y a pas de test unitaire isolé avec mocks pour la persistance.

Ces tests s'exécutent contre un **conteneur PostgreSQL réel** (Testcontainers,
image `postgres:16-alpine`), et non contre une base H2 en mémoire. Un moteur de
compatibilité comme H2 (`MODE=PostgreSQL`) n'a pas un comportement strictement
identique à PostgreSQL : un comportement accepté par H2 mais différent sous
PostgreSQL réel peut passer les tests sans être détecté avant la production
(un exemple concret a été trouvé et corrigé lors de l'introduction de ce
conteneur : `information_schema.tables` renvoie ses noms de schéma/table en
minuscules sous PostgreSQL, mais en majuscules sous H2 pour des identifiants
non quotés). H2 a donc été entièrement retiré du périmètre de test, sans
option de repli, pour éliminer cette source de faux positifs plutôt que la
rendre facultative.

Un seul conteneur PostgreSQL est démarré (démarrage statique dans
`RsaIntegrationTestSupport`, la classe de base partagée par toutes les classes
`@SpringBootTest`) et partagé par l'ensemble de la suite, plutôt qu'un
conteneur par classe de test, pour limiter le coût de démarrage à une seule
fois par exécution. Ses coordonnées de connexion (`spring.datasource.url`,
`spring.datasource.username`, `spring.datasource.password`) sont injectées via
`@DynamicPropertySource`, sur le même principe que l'injection des clés RSA de
test déjà en place dans cette classe.

**Docker doit être disponible** (local ou CI) pour exécuter `mvn test` ou
`mvn verify` : Testcontainers démarre le conteneur PostgreSQL au premier test
qui charge le contexte Spring. C'est la même contrainte que pour construire
l'image Docker du backend. Sur GitHub Actions, les runners `ubuntu-latest`
fournissent Docker nativement ; aucune étape de configuration supplémentaire
n'est nécessaire dans le workflow CI.

Impact mesuré sur la durée de la suite (`mvn verify` à froid, dépendances déjà
en cache local) : environ 8,4 s avec H2 contre environ 9,7 s avec le conteneur
PostgreSQL partagé, soit un surcoût de l'ordre d'une seconde correspondant au
démarrage unique du conteneur (image `postgres:16-alpine` déjà présente
localement). Ces chiffres varient selon la machine et la disponibilité de
l'image Docker en cache.

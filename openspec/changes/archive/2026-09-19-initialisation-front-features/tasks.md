## 1. Préparation de l'évolution 000

Scope `front`, type `chore`, branche `front/chore-000-initialisation-outillage-features`.
Critères : architecture par features effective, lint/format/tests/build utilisables,
proxy contractuel et génération API compilable. Dépendances : socle Angular présent,
contrat partagé ; aucun backend requis pour les validations locales.

- [x] 1.1 Vérifier/créer la branche 000, lire le socle, les règles et les configurations anciennes sans reprendre les changements étrangers au périmètre.

## 2. Outillage et configurations

- [x] 2.1 Configurer les alias TypeScript, lint Angular/TypeScript/accessibilité et scripts Prettier avec des versions compatibles ; conserver la configuration PostCSS unique et les types navigateur/tests séparés.
- [x] 2.2 Ajouter le proxy couvrant `/api/v1/...` et une génération Angular explicite depuis le contrat partagé, avec version fixée et exclusions du code généré.

## 3. Architecture par features

- [x] 3.1 Installer une première feature d'accueil lazy, un shell OnPush et les limites documentées de `features/`, `core/` et `shared/`, sans couches hexagonales frontend ni fonctionnalités métier fictives.
- [x] 3.2 Aligner les instructions agents frontend, le contexte OpenSpec et les décisions du backlog avec Angular et l'architecture par features ; documenter les commandes et écarts avec l'ancien projet.

## 4. Validation locale

- [x] 4.1 Générer le client, vérifier les types nullables/enums/base API et compiler le généré avec le frontend strict.
- [x] 4.2 Exécuter lint, contrôle Prettier, tests non interactifs, build de production, test de routage du proxy et validation OpenSpec ; corriger les problèmes observés.

## 5. Préparation de la livraison

- [x] 5.1 Relire le périmètre et préparer le contenu d'une PR vers `main` avec résultats réels, limites et traçabilité.

La publication de la branche/PR, la revue humaine et la fusion sont des étapes
ultérieures de livraison ; elles ne sont pas déclarées effectuées par ces tâches locales.

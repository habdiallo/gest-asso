## ADDED Requirements

### Requirement: Chaîne de génération locale et verrouillée

Le frontend SHALL exposer des commandes npm locales pour vérifier, valider et
générer le client API. Le contrôle SHALL vérifier Node.js 22 ou plus récent, Java
11 ou plus récent, la présence du wrapper installé par le lockfile et les versions
exactes de `package.json`, `package-lock.json` et `openapitools.json`.

#### Scenario: Machine correctement préparée

- **WHEN** le développeur exécute `npm run check:api` depuis `contribo-front/`
- **THEN** le contrôle confirme les versions Node.js et Java, le wrapper local et
  la version du générateur avant toute génération

#### Scenario: Dépendance Java absente ou trop ancienne

- **WHEN** le développeur exécute une commande de validation ou de génération sans
  Java 11 ou plus récent
- **THEN** la commande échoue avec une indication explicite de la dépendance et
  n'utilise pas un outil global ou une génération partielle

#### Scenario: Version locale différente de la configuration

- **WHEN** la version du wrapper dans `package.json` diffère du lockfile, ou si la
  version du générateur n'est pas exacte dans `openapitools.json`
- **THEN** le contrôle échoue avant l'appel à OpenAPI Generator

### Requirement: Java isolé de l'application frontend

La validation et la génération SHALL être les seules commandes frontend à exiger
Java. Les commandes de shell, de test et de build SHALL rester exécutables sans
déclencher Java ni générer automatiquement le client.

#### Scenario: Développement du shell sans Java

- **WHEN** Java est absent et qu'aucune fonctionnalité n'importe le client généré
- **THEN** `npm start`, `npm test` et `npm run build` ne déclenchent pas la chaîne
  de génération API

#### Scenario: Génération reproductible

- **WHEN** le développeur installe les dépendances avec `npm ci`, puis exécute
  `npm run validate:api` et `npm run generate:api`
- **THEN** les commandes utilisent le wrapper local et le générateur configuré,
  lisent `besoins/openapi.yaml` et écrivent la sortie prévue dans
  `src/app/core/api/generated/`

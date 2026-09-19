# mocks-api-msw Specification

## Purpose
TBD - created by archiving change mocks-msw-client-api. Update Purpose after archive.
## Requirements
### Requirement: Activation explicite du mock réseau en développement
Le mock réseau (MSW) du client API généré SHALL être démarré uniquement via un point d'entrée ou
une commande de développement explicite, jamais par défaut dans le bundle de production ni par un
hook automatique de build/démarrage/test.

#### Scenario: Démarrage normal de l'application
- **WHEN** un développeur exécute `npm start` (ou équivalent) sans sélectionner le mode mock
- **THEN** l'application démarre sans que le service worker MSW soit enregistré et les requêtes
  passent par le proxy/backend configuré

#### Scenario: Démarrage en mode mock
- **WHEN** un développeur exécute la commande/configuration dédiée au mode mock
- **THEN** le service worker MSW est enregistré et intercepte les requêtes de l'application avant
  qu'elles n'atteignent le réseau

#### Scenario: Build de production
- **WHEN** `npm run build` est exécuté sans la configuration mock
- **THEN** le bundle produit ne référence ni le point d'entrée mock ni les handlers de mock

### Requirement: Handlers de mock conformes au contrat OpenAPI
Chaque handler MSW SHALL utiliser les chemins, `operationId`, modèles, enums et propriétés
nullable issus du client généré (`@api`) depuis `besoins/openapi.yaml`, sans DTO ni structure de
données concurrente du contrat.

#### Scenario: Réponse de succès conforme au modèle généré
- **WHEN** un handler MSW répond à une requête interceptée pour une opération du contrat
- **THEN** le corps de la réponse respecte le type du modèle généré correspondant, y compris les
  champs optionnels/nullable et les enums exacts du contrat

#### Scenario: Droits et transitions respectés
- **WHEN** un handler MSW simule une action réservée par le contrat (rôle applicatif,
  `operatorCanRecordPayments`, transition de statut d'une ressource)
- **THEN** la réponse simulée respecte la même autorisation ou le même refus que ceux définis par le
  contrat, sans autoriser une action que l'API réelle refuserait

### Requirement: Séparation entre mock de développement et tests unitaires
Les tests unitaires du client généré et des services applicatifs SHALL continuer à utiliser
`HttpTestingController`/`provideHttpClientTesting`, jamais MSW, pour vérifier requêtes, réponses et
erreurs.

#### Scenario: Test d'un service consommant le client généré
- **WHEN** un test Vitest vérifie une requête/réponse/erreur d'un service qui appelle `@api`
- **THEN** le test utilise `HttpTestingController` pour intercepter et faire correspondre la requête,
  sans dépendre du service worker MSW


## REMOVED Requirements

### Requirement: Activation explicite du mock réseau en développement

**Reason**: Le backend réel est disponible et le mode mock runtime peut masquer une intégration non fonctionnelle.

**Migration**: Utiliser `npm start` avec le backend et le proxy `/api/**`. Les tests isolés continuent d'utiliser `HttpTestingController` ou les outils de test Angular.

### Requirement: Handlers de mock conformes au contrat OpenAPI

**Reason**: Les handlers MSW et leurs données de démonstration sont supprimés pour éviter une seconde implémentation du contrat.

**Migration**: Vérifier le comportement avec le backend réel et conserver uniquement les fixtures nécessaires aux tests unitaires applicatifs.

## MODIFIED Requirements

### Requirement: Séparation entre mock de développement et tests unitaires

Les tests unitaires du client généré et des services applicatifs SHALL rester indépendants de tout service worker ou serveur de mock réseau. Ils SHALL utiliser `HttpTestingController`, `provideHttpClientTesting`, des spies ou des fixtures locales adaptées à la responsabilité testée.

#### Scenario: Test d'un service consommant le client généré

- **WHEN** un test Vitest vérifie une requête, une réponse ou une erreur d'un service qui appelle `@api`
- **THEN** le test intercepte la requête avec `HttpTestingController` ou l'outil Angular équivalent, sans enregistrer MSW et sans dépendre d'un compte de démonstration.

#### Scenario: Test d'un composant avec dépendance applicative

- **WHEN** un test vérifie un composant ou une page qui dépend d'un service applicatif
- **THEN** le test remplace explicitement cette dépendance par un spy ou une fixture locale, sans importer un handler runtime depuis `src/mocks` ou une feature `mocks`.

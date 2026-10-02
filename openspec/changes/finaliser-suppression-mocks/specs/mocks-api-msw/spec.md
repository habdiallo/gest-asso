## REMOVED Requirements

### Requirement: Activation explicite du mock réseau en développement

**Reason**: Le runtime MSW, son worker et ses commandes ont été supprimés par T-186 et finalisés par T-189.

**Migration**: Utiliser `npm start` avec le backend réel et le proxy `/api/**`. Les tests unitaires restent isolés avec les outils Angular de test.

### Requirement: Handlers de mock conformes au contrat OpenAPI

**Reason**: Les handlers runtime et les données de démonstration ne sont plus livrés.

**Migration**: Vérifier le comportement via l'API réelle et conserver uniquement les doubles de test locaux.

## MODIFIED Requirements

### Requirement: Séparation des tests unitaires et du réseau réel

Les tests unitaires du client généré et des services applicatifs SHALL rester indépendants du réseau réel et de tout worker applicatif. Ils SHALL utiliser `HttpTestingController`, `provideHttpClientTesting`, des spies ou des fixtures locales adaptées à la responsabilité testée.

#### Scenario: Test d'un service consommant le client généré

- **WHEN** un test Vitest vérifie une requête, une réponse ou une erreur d'un service qui appelle `@api`
- **THEN** le test intercepte la requête avec `HttpTestingController` ou l'outil Angular équivalent, sans démarrer de worker applicatif et sans dépendre d'un compte de démonstration

#### Scenario: Test d'un composant avec dépendance applicative

- **WHEN** un test vérifie un composant ou une page qui dépend d'un service applicatif
- **THEN** le test remplace explicitement cette dépendance par un spy ou une fixture locale et n'importe aucun module runtime supprimé

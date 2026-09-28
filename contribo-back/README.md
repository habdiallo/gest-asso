# Contribo backend

Le backend est construit à partir du contrat OpenAPI partagé dans
`../besoins/openapi.yaml`. La génération des interfaces et modèles OpenAPI est
exécutée pendant `generate-sources`, ce qui valide le contrat avant compilation.

La persistance MVP utilise PostgreSQL avec Flyway. Le schéma initial est
versionné dans `src/main/resources/db/migration` et ne contient pas de données
de démonstration ni de secrets. Les paramètres de connexion sont injectés par
`DB_URL`, `DB_USERNAME` et `DB_PASSWORD`.

## Commandes

Depuis `contribo-back/` :

```bash
mvn test
mvn verify
```

Le service écoute sur le port `8080` par défaut. Le contrôle de santé est exposé
par Spring Boot Actuator sur `/actuator/health`. Ce socle ne contient encore
aucune logique métier. Les migrations fournissent uniquement le support
structurel nécessaire aux tickets métier suivants.

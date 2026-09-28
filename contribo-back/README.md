# Contribo backend

Le backend est construit à partir du contrat OpenAPI partagé dans
`../besoins/openapi.yaml`. La génération des interfaces et modèles OpenAPI est
exécutée pendant `generate-sources`, ce qui valide le contrat avant compilation.

## Commandes

Depuis `contribo-back/` :

```bash
mvn test
mvn verify
```

Le service écoute sur le port `8080` par défaut. Le contrôle de santé est exposé
par Spring Boot Actuator sur `/actuator/health`. Ce socle ne contient encore
aucune logique métier ni persistance.

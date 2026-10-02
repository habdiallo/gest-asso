## Pourquoi

L'exemple `integration.env.example` ne reflète plus toutes les variables
obligatoires de `compose.integration.yaml`, ce qui bloque ou rend ambigu le
déploiement de l'environnement d'intégration.

## Changements

- Synchroniser l'exemple avec les noms de variables réellement consommés par la
  stack d'intégration.
- Documenter les chemins de secrets TLS et l'adresse du proxy de confiance.
- Remplacer la variable de port frontend obsolète par les deux ports attendus.

## Impact

Scope infra, type chore. Aucun secret réel n'est ajouté et aucun comportement
applicatif n'est modifié.

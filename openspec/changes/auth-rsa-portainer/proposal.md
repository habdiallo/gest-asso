## Why

Contribo signe actuellement les JWT avec un secret HMAC partagé injecté comme variable d'environnement. Cette approche complique le déploiement Portainer, expose le même secret aux opérations de signature et de vérification, et ne permet pas de séparer proprement les responsabilités entre l'émetteur et les vérificateurs.

La référence `saas-asso` utilise une paire RSA pour signer et vérifier les JWT et publie des images versionnées adaptées à Portainer. Nous allons reprendre ce principe en conservant le contrat Bearer existant.

## What Changes

- **BREAKING** Remplacer la signature HMAC des JWT par une signature RSA RS256.
- Charger les clés PEM depuis le classpath en développement et depuis des fichiers secrets en intégration ou production.
- Remplacer le filtre et le service de token actuels par la validation Spring Security compatible avec les clés RSA, en conservant l'identifiant utilisateur, l'expiration et la réponse de connexion.
- Ajouter la génération éphémère d'une paire RSA dans les jobs CI de tests, sans versionner de clé.
- Remplacer les variables et secrets `JWT_SECRET` par les paramètres de clés RSA dans les compositions d'intégration.
- Ajouter une stack Portainer backend/frontend utilisant des images GHCR versionnées, les réseaux Docker externes existants et un réseau interne privé.
- Documenter la génération des clés, les variables Portainer, le déploiement et le rollback par changement de tag.

## Capabilities

### New Capabilities

- `rsa-jwt-authentication`: émission et validation de JWT Bearer signés en RS256 avec clés PEM séparées.
- `ci-image-publishing`: génération de clés de test et publication d'images backend/frontend avec tags versionnés.
- `portainer-deployment`: déploiement Portainer avec secrets fichiers, réseaux externes et rollback par tag d'image.

### Modified Capabilities

Aucune exigence fonctionnelle de l'API n'est modifiée. Le format Bearer et les données de session restent compatibles, mais les anciens JWT signés avec le secret HMAC deviennent invalides et nécessitent une nouvelle connexion.

## Impact

- Backend Spring Security, dépendances OAuth2 Resource Server/Jose, chargement des clés et tests d'authentification.
- Configuration applicative, fichiers de test et documentation des certificats.
- Workflow GitHub Actions de tests, construction et publication des images.
- `contribo-deploiement/compose.integration.yaml`, un nouveau compose Portainer et la documentation d'intégration.
- Aucun changement de schéma de données, de route métier ou de modèle OpenAPI hors précision de l'algorithme de signature.

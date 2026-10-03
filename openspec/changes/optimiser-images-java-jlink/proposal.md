## Why

Les images Docker backend et frontend peuvent encore mieux séparer les outils de build du runtime, réutiliser leurs caches et limiter leur contenu final. Le backend Java doit en plus remplacer le JRE générique par un runtime ciblé lorsque la compatibilité est démontrée. Le ticket T-197 vise à mesurer ces coûts puis à adopter des images minimales et des layers reproductibles sans dégrader le démarrage, les migrations, l'Actuator, TLS, l'authentification ou le rendu SPA.

## What Changes

- Mesurer la taille, le contenu, le temps de build, le démarrage et le healthcheck des images backend et frontend actuelles comme références.
- Réorganiser le Dockerfile backend pour maximiser la réutilisation des layers Maven et séparer les dépendances des sources.
- Réorganiser le Dockerfile frontend pour réutiliser le layer `npm ci`, isoler la génération OpenAPI et séparer les artefacts statiques du runtime Nginx.
- Utiliser `jdeps` pour déterminer les modules nécessaires, puis construire un runtime Java ciblé avec `jlink` dans une étape de build dédiée.
- Conserver uniquement les éléments nécessaires dans les runtimes, notamment les certificats CA, le fuseau horaire, les binaires de healthcheck et les fichiers Nginx utiles.
- Vérifier le démarrage de Spring Boot, l'accès JDBC/PostgreSQL, Flyway, JWT, l'Actuator, la readiness probe, les assets statiques, le fallback SPA et le proxy frontend.
- Appliquer les bonnes pratiques communes : `.dockerignore`, versions de base explicites, utilisateur non privilégié lorsque compatible, absence d'outils de build dans les images finales et caches CI reproductibles.
- Comparer les gains et documenter un retour arrière vers les images actuellement supportées si la compatibilité ou la maintenance n'est pas satisfaisante.

## Capabilities

### New Capabilities

- `java-image-optimization`: construire et valider les images Docker backend Java et frontend Nginx avec des layers de dépendances cacheables et des runtimes minimaux.

### Modified Capabilities

- Aucun comportement applicatif ou contrat API ne change. Les exigences de déploiement concernées seront couvertes par la nouvelle capacité.

## Impact

- Dockerfiles et scripts de build du backend et du frontend dans `contribo-back/`, `contribo-front/` et `contribo-deploiement/`.
- Pipeline de publication des deux images Docker et éventuels scripts de mesure.
- Dépendances de build Java utilisées pour `jdeps` et `jlink`, sans ajout de dépendance applicative.
- Validation locale et CI des images backend et frontend. Le frontend n'est pas converti en runtime Java : Java reste limité à sa génération OpenAPI pendant le build et l'image finale reste Nginx.
